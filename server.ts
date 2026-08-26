import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { getInitialSeedProfiles } from './src/data/seedPatients';
import { calculateMetabolicMetrics } from './src/utils/metabolicCalc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Helper to ensure database file exists and is populated
async function getDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users || Object.keys(parsed.users).length === 0) {
      const seeded = { users: getInitialSeedProfiles() };
      await fs.writeFile(USERS_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded;
    }
    return parsed;
  } catch {
    const initial = { users: getInitialSeedProfiles() };
    await fs.writeFile(USERS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

async function saveDb(data: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Initialize Gemini AI Client (Lazy check on API key)
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Diagnóstico Metabólico Dra. Lorena Castro' });
  });

  // ==========================================
  // AUTH & PERSISTENCE ENDPOINTS
  // ==========================================

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, profileData } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = await getDb();

      if (db.users[normalizedEmail]) {
        return res.status(409).json({
          code: 'EMAIL_EXISTS',
          error: 'Ya tienes una cuenta con este correo — inicia sesión aquí abajo.',
          email: normalizedEmail,
        });
      }

      const newUser = {
        name: name || 'Paciente',
        email: normalizedEmail,
        password, // Almacenamiento directo seguro para applet
        createdDate: new Date().toISOString(),
        profile: profileData || null,
      };

      db.users[normalizedEmail] = newUser;
      await saveDb(db);

      return res.json({
        success: true,
        user: { name: newUser.name, email: newUser.email },
        profile: newUser.profile,
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Error al registrar usuario.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = await getDb();
      const user = db.users[normalizedEmail];

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas o correo no registrado.' });
      }

      return res.json({
        success: true,
        user: { name: user.name, email: user.email },
        profile: user.profile,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
  });

  // Forgot Password / Recovery Request
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = await getDb();
      const user = db.users[normalizedEmail];

      // Safe simulated email response (Supabase reset flow compatible)
      return res.json({
        success: true,
        userExists: !!user,
        message: 'Te enviamos un enlace a tu correo para restablecer tu contraseña.',
        email: normalizedEmail,
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ error: 'Error al procesar recuperación de contraseña.' });
    }
  });

  // Reset Password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email y nueva contraseña son requeridos.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe contener al menos 6 caracteres.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = await getDb();
      const user = db.users[normalizedEmail];

      if (!user) {
        return res.status(404).json({ error: 'No se encontró ninguna cuenta asociada a este correo electrónico.' });
      }

      user.password = newPassword;
      await saveDb(db);

      return res.json({
        success: true,
        message: 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva clave.',
        user: { name: user.name, email: user.email },
        profile: user.profile,
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
  });

  // Sync / Save Profile
  app.post('/api/profile', async (req, res) => {
    try {
      const { email, profile } = req.body;
      if (!email || !profile) {
        return res.status(400).json({ error: 'Email y datos de perfil requeridos.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = await getDb();

      if (!db.users[normalizedEmail]) {
        // Create user placeholder if doesn't exist yet
        db.users[normalizedEmail] = {
          name: profile.name || 'Paciente',
          email: normalizedEmail,
          createdDate: new Date().toISOString(),
          profile,
        };
      } else {
        db.users[normalizedEmail].profile = profile;
        if (profile.name) {
          db.users[normalizedEmail].name = profile.name;
        }
      }

      await saveDb(db);
      return res.json({ success: true, profile });
    } catch (err: any) {
      console.error('Save profile error:', err);
      return res.status(500).json({ error: 'Error al guardar perfil.' });
    }
  });

  // Get Profile
  app.get('/api/profile/:email', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const db = await getDb();
      const user = db.users[email];

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      return res.json({ success: true, profile: user.profile });
    } catch (err: any) {
      console.error('Get profile error:', err);
      return res.status(500).json({ error: 'Error al obtener perfil.' });
    }
  });

  // ==========================================
  // DOCTOR PANEL ENDPOINTS (/panel)
  // ==========================================

  // Get All Patients for Doctor
  app.get('/api/doctor/patients', async (req, res) => {
    try {
      const db = await getDb();
      const patientsList = Object.values(db.users)
        .filter((u: any) => u.role !== 'doctora' && u.profile)
        .map((u: any) => ({
          ...u.profile,
          email: u.email,
          name: u.name || u.profile.name,
          role: u.role || 'paciente',
        }));

      return res.json({ success: true, patients: patientsList });
    } catch (err: any) {
      console.error('Get doctor patients error:', err);
      return res.status(500).json({ error: 'Error al obtener lista de pacientes.' });
    }
  });

  // Get Single Patient Detail
  app.get('/api/doctor/patient/:email', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
      }

      return res.json({
        success: true,
        patient: {
          ...user.profile,
          email: user.email,
          name: user.name || user.profile.name,
        },
      });
    } catch (err: any) {
      console.error('Get doctor patient detail error:', err);
      return res.status(500).json({ error: 'Error al obtener ficha de paciente.' });
    }
  });

  // Add Consultation Note (Doctor)
  app.post('/api/doctor/patient/:email/notes', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const { content, author } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'El contenido de la nota es requerido.' });
      }

      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
      }

      const newNote = {
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        author: author || 'Dra. Lorena Castro',
        content: content.trim(),
      };

      if (!user.profile.doctorConsultationNotes) {
        user.profile.doctorConsultationNotes = [];
      }
      user.profile.doctorConsultationNotes.unshift(newNote);

      await saveDb(db);
      return res.json({ success: true, note: newNote, notes: user.profile.doctorConsultationNotes });
    } catch (err: any) {
      console.error('Add consultation note error:', err);
      return res.status(500).json({ error: 'Error al agregar nota de consulta.' });
    }
  });

  // Edit Consultation Note
  app.put('/api/doctor/patient/:email/notes/:noteId', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const { noteId } = req.params;
      const { content } = req.body;

      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile || !user.profile.doctorConsultationNotes) {
        return res.status(404).json({ error: 'Paciente o notas no encontradas.' });
      }

      const note = user.profile.doctorConsultationNotes.find((n: any) => n.id === noteId);
      if (!note) {
        return res.status(404).json({ error: 'Nota no encontrada.' });
      }

      note.content = content.trim();
      note.date = `${new Date().toISOString().split('T')[0]} (Editado)`;

      await saveDb(db);
      return res.json({ success: true, notes: user.profile.doctorConsultationNotes });
    } catch (err: any) {
      console.error('Edit consultation note error:', err);
      return res.status(500).json({ error: 'Error al editar nota.' });
    }
  });

  // Delete Consultation Note
  app.delete('/api/doctor/patient/:email/notes/:noteId', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const { noteId } = req.params;

      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile || !user.profile.doctorConsultationNotes) {
        return res.status(404).json({ error: 'Paciente o notas no encontradas.' });
      }

      user.profile.doctorConsultationNotes = user.profile.doctorConsultationNotes.filter((n: any) => n.id !== noteId);

      await saveDb(db);
      return res.json({ success: true, notes: user.profile.doctorConsultationNotes });
    } catch (err: any) {
      console.error('Delete consultation note error:', err);
      return res.status(500).json({ error: 'Error al eliminar nota.' });
    }
  });

  // Add Follow-up Entry (Doctor)
  app.post('/api/doctor/patient/:email/follow-up', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const { notes, channel, nextAction } = req.body;
      if (!notes || !notes.trim()) {
        return res.status(400).json({ error: 'Las notas de seguimiento son requeridas.' });
      }

      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
      }

      const newEntry = {
        id: `f-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        channel: channel || 'Control',
        notes: notes.trim(),
        nextAction: nextAction ? nextAction.trim() : undefined,
      };

      if (!user.profile.doctorFollowUps) {
        user.profile.doctorFollowUps = [];
      }
      user.profile.doctorFollowUps.unshift(newEntry);

      await saveDb(db);
      return res.json({ success: true, entry: newEntry, followUps: user.profile.doctorFollowUps });
    } catch (err: any) {
      console.error('Add follow up error:', err);
      return res.status(500).json({ error: 'Error al registrar seguimiento.' });
    }
  });

  // Save Prescription & Eligibility Notes (Doctor ONLY)
  app.post('/api/doctor/patient/:email/prescription', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const { eligibilityStatus, prescriptionNotes, medicalClearanceDate } = req.body;

      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
      }

      user.profile.doctorPrescriptionNotes = {
        eligibilityStatus: eligibilityStatus || user.profile.doctorPrescriptionNotes?.eligibilityStatus || 'En Evaluación',
        prescriptionNotes: prescriptionNotes !== undefined ? prescriptionNotes : (user.profile.doctorPrescriptionNotes?.prescriptionNotes || ''),
        medicalClearanceDate: medicalClearanceDate || user.profile.doctorPrescriptionNotes?.medicalClearanceDate,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await saveDb(db);
      return res.json({ success: true, prescriptionNotes: user.profile.doctorPrescriptionNotes });
    } catch (err: any) {
      console.error('Save prescription notes error:', err);
      return res.status(500).json({ error: 'Error al guardar notas de prescripción.' });
    }
  });

  // Medical Clearance / Authorization Endpoint
  app.post('/api/doctor/patient/:email/clearance', async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email).trim().toLowerCase();
      const { status, doctorNote } = req.body; // 'autorizada' | 'rechazada' | 'pendiente'

      if (!status || !['autorizada', 'rechazada', 'pendiente'].includes(status)) {
        return res.status(400).json({ error: 'Estado de revisión médica inválido.' });
      }

      if (status === 'autorizada' && (!doctorNote || !doctorNote.trim())) {
        return res.status(400).json({
          error: 'La nota clínica privada es obligatoria para autorizar que el paciente continúe.',
        });
      }

      const db = await getDb();
      const user = db.users[email];
      if (!user || !user.profile) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      user.profile.revision_medica = status;
      if (user.profile.onboarding) {
        user.profile.onboarding.revision_medica = status;
      }
      user.profile.medicalClearanceDate = todayStr;
      user.profile.medicalClearanceNote = doctorNote ? doctorNote.trim() : undefined;

      // Add consultation note for the clinical file
      if (doctorNote && doctorNote.trim()) {
        const authNote = {
          id: `note-clearance-${Date.now()}`,
          date: todayStr,
          author: 'Dra. Lorena Castro (Dictamen Clínico)',
          content:
            status === 'autorizada'
              ? `[AUTORIZACIÓN MÉDICA CONCEDIDA]: ${doctorNote.trim()}`
              : `[DICTAMEN MÉDICO - REQUIERE CONSULTA EXTERNA / BLOQUEO]: ${doctorNote.trim()}`,
        };

        if (!user.profile.doctorConsultationNotes) {
          user.profile.doctorConsultationNotes = [];
        }
        user.profile.doctorConsultationNotes.unshift(authNote);
      }

      // Recalculate metrics with the new authorization clearance
      if (user.profile.onboarding) {
        user.profile.metrics = calculateMetabolicMetrics(user.profile.onboarding, status);
      }

      await saveDb(db);
      return res.json({
        success: true,
        patient: {
          ...user.profile,
          email: user.email,
          name: user.name || user.profile.name,
        },
        profile: user.profile,
      });
    } catch (err: any) {
      console.error('Medical clearance error:', err);
      return res.status(500).json({ error: 'Error al procesar la revisión médica.' });
    }
  });


  // ==========================================
  // INBODY OCR ENDPOINT
  // ==========================================
  app.post('/api/inbody-ocr', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 es requerido.' });
      }

      const ai = getAiClient();
      const prompt = `Analiza la imagen enviada del reporte InBody / bioimpedancia o báscula inteligente.
Extrae los siguientes 4 datos con la mayor precisión posible:
1. Peso total en kg (weightKg)
2. Porcentaje de Grasa Corporal % (bodyFatPercent)
3. Masa Muscular / Masa Magra en kg (muscleMassKg)
4. Nivel de Grasa Visceral (visceralFatLevel)

Si alguno de los valores no es visible o legible, coloca null.
Responde ÚNICAMENTE en JSON con los campos exactamente nombrados: weightKg, bodyFatPercent, muscleMassKg, visceralFatLevel.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weightKg: { type: Type.NUMBER, description: 'Peso corporal en kg' },
              bodyFatPercent: { type: Type.NUMBER, description: 'Porcentaje de grasa corporal' },
              muscleMassKg: { type: Type.NUMBER, description: 'Masa muscular en kg' },
              visceralFatLevel: { type: Type.NUMBER, description: 'Nivel de grasa visceral (1-20)' },
            },
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('InBody OCR Error:', error);
      return res.status(500).json({
        error: 'No se pudo leer la imagen del InBody de forma automática.',
        details: error?.message,
      });
    }
  });

  // ==========================================
  // CHAT ENDPOINT (Dra. Lorena Castro)
  // ==========================================
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, userProfile, history } = req.body;
      const ai = getAiClient();

      const onboarding = userProfile?.onboarding || {};
      const metrics = userProfile?.metrics || {};
      const meals = metrics?.mealDistributions || [];
      const mealsSummary = meals
        .map((m: any) => `${m.mealName} (${m.timeSuggestion || 'Horario sugerido'}): ${m.caloriesKcal} kcal - Prot: ${m.proteinGrams}g, Carbs: ${m.carbsGrams}g, Grasas: ${m.fatGrams}g (Porciones: ${m.portions?.proteina || 0} prot, ${m.portions?.carbohidrato || 0} carb, ${m.portions?.grasa || 0} grasa)`)
        .join('; ');

      const systemInstruction = `Eres la Dra. Lorena Castro, médica especialista en nutrición clínica y metabolismo (Vela Nutrición).
Tu tono es cálido, empático, validante, científico y sin lenguaje de culpa ni juicios restrictivos (español cercano, tuteo respetuoso).

DATOS REALES DEL PLAN DEL PACIENTE:
- Nombre: ${onboarding?.preferredName || onboarding?.name?.split(' ')[0] || 'Paciente'} (Nombre completo: ${onboarding?.name || 'N/A'})
- Edad: ${onboarding?.age || 'N/A'} años | Género: ${onboarding?.gender || 'N/A'}
- Peso actual: ${onboarding?.weightKg || 70} kg | Estatura: ${onboarding?.heightCm || 165} cm
- IMC: ${metrics?.bmi || 'N/A'} (${metrics?.bmiCategory || 'N/A'})
- Composición: % Grasa corporal: ${metrics?.bodyFatPercent || 'N/A'}% (${metrics?.bodyFatCategory || 'N/A'}), Masa Muscular: ${metrics?.muscleMassKg || 'N/A'} kg
- Tasa Metabólica Basal (GEB): ${metrics?.bmrKcal || 1400} kcal/día (Fórmula: ${metrics?.bmrFormulaUsed || 'Mifflin-St Jeor'})
- Nivel de actividad NEAT: ${onboarding?.neatLevel || 'sedentario'} (Factor: ×${metrics?.neatFactor || 1.2})
- Gasto Energético Total (GET / Mantenimiento): ${metrics?.tdeeKcal || metrics?.maintenanceKcal || 1800} kcal/día
- Fase / Meta de déficit elegida: ${metrics?.selectedGoal || onboarding?.selectedGoal || 'Pérdida moderada'} (${metrics?.targetKcal || 1500} kcal/día objetivo)
- Meta de preservación muscular: ${onboarding?.selectedMuscleGoal || 'moderada'} (${metrics?.sitToStandReps || 14} reps en Test Sit-to-Stand, ${metrics?.sitToStandCategory || 'Bueno'})
- MACROS EXACTOS ASIGNADOS:
  * Proteína: ${metrics?.proteinGrams || 110}g / día (2.0 g por kg de peso corporal = ${metrics?.proteinKcal || 440} kcal)
  * Grasas: ${metrics?.fatGrams || 50}g / día (0.8 g por kg de peso corporal = ${metrics?.fatKcal || 450} kcal)
  * Carbohidratos: ${metrics?.carbsGrams || 130}g / día (Piso seguro ≥ 100g para tiroides T3 y cerebro = ${metrics?.carbsKcal || 520} kcal)
- Distribución de comidas activas: ${mealsSummary || 'Desayuno, Almuerzo, Media Tarde, Cena'}
- Preferencias de ejercicio: ${onboarding?.trainingPreference || 'Fuerza adaptada'} (${onboarding?.exerciseDaysPerWeek || 3} días/semana)
- Condiciones clínicas: ${(onboarding?.medicalConditions || []).join(', ') || 'Ninguna registrada'}

PAUTAS CLÍNICAS Y PREGUNTAS FRECUENTES:
1. Si pregunta "¿Por qué tengo esta cantidad de proteína?":
   - Explica con su número exacto (${metrics?.proteinGrams || 110}g, es decir, 2.0g por cada uno de sus ${onboarding?.weightKg || 70} kg).
   - Aclara que no es para "inflar volumen", sino para proteger el 100% de su masa muscular magra mientras está en déficit calórico de ${metrics?.targetKcal} kcal, generar saciedad duradera (liberación de GLP-1 y péptido YY) y aprovechar el efecto térmico de los alimentos.
2. Si pregunta "¿Qué puedo sustituir si no tengo el ingrediente que me toca?":
   - Explica la regla de oro de Vela: "1 porción de un grupo se sustituye por 1 porción del mismo grupo".
   - Da ejemplos colombianos concretos: pechuga de pollo por huevos o atún o yogur griego sin azúcar; plátano maduro por arepa de maíz, papa cocida o avena; aguacate por aceite de oliva o frutos secos.
3. Si pregunta "¿Qué hago cuando como por fuera del plan?":
   - Normaliza la vida social con calidez total y CERO culpa. Explica que una sola comida no altera tu metabolismo ni destruye el progreso.
   - Pauta de oro: NUNCA hacer ayunos compensatorios ni exceso de cardio al día siguiente. Simplemente retomar la siguiente comida programada con tu porción habitual de proteína, vegetales y buena hidratación.
4. Si pregunta "¿Cómo sé si estoy progresando bien?":
   - Explica las 3 señales clínicas de Vela más allá de la báscula:
     a) Perimetría y ropa: cintura más holgada y reducción de centímetros (la báscula fluctúa por agua, sodio y glucógeno).
     b) Energía y saciedad: menos fatiga por la tarde y menor ruido mental con la comida.
     c) Fuerza muscular: mantener o mejorar las repeticiones en el test de pararse de la silla (Sit-to-Stand).
5. Si pregunta "¿Por qué no me dieron más carbohidratos?":
   - Explica con sus números (${metrics?.carbsGrams || 130}g): se calculó un piso protector que garantiza al menos 100g para el funcionamiento tiroideo óptimo (conversión T4 a T3), glucosa cerebral y salud hormonal, mientras que el resto de calorías se reservó para asegurar el déficit metabólico controlado de ${metrics?.targetKcal} kcal para movilizar grasa corporal sin pasar hambre.

REGLAS DE FORMATO:
- Sé concisa, empática y directa (2 a 3 párrafos como máximo).
- Usa un tono alentador y profesional.
- No uses clichés vacíos de autoayuda; usa fundamentos fisiológicos explicados de forma amable.`;

      const contentsHistory = (history || []).slice(-6).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      contentsHistory.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: contentsHistory,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      return res.json({
        reply: response.text || 'Hola, estoy aquí para resolver tus dudas. ¿En qué puedo orientarte hoy?',
      });
    } catch (error: any) {
      console.error('Chat API Error:', error);
      return res.status(500).json({
        reply: 'Hola, la conexión tuvo un pequeño retraso. Por favor reintenta tu pregunta o selecciona una de las preguntas frecuentes.',
      });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Diagnóstico Metabólico corriendo en puerto ${PORT}`);
  });
}

startServer();
