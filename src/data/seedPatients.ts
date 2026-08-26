import { UserProfile, OnboardingData } from '../types';
import { calculateMetabolicMetrics } from '../utils/metabolicCalc';

// Base Onboarding profiles for seed
const onboardingMariaCamila: OnboardingData = {
  name: 'María Camila Reyes',
  email: 'maria.camila@ejemplo.com',
  age: 42,
  gender: 'femenino',
  lifeStage: 'Premenopausia',
  heightCm: 165,
  weightKg: 68,
  inBodyUploaded: false,
  silhouetteFatPercent: 32,
  neatLevel: 'ligero',
  exerciseDaysPerWeek: 3,
  exerciseDurationMinutes: 45,
  exerciseIntensity: 'moderada',
  wakeUpTime: '06:30',
  bedTime: '22:30',
  sleepHours: 7.5,
  activeMealTimes: ['desayuno', 'media_manana', 'almuerzo', 'cena'],
  waterLitersPerDay: 2.2,
  alcoholFrequency: 'ocasional',
  allergies: ['Lactosa / Lácteos enteros'],
  medicalConditions: ['dislipidemia'],
  sitToStandReps: 14,
  foodRelationship: {
    description: 'Ruido de comida recurrente en la tarde o noche',
    emotionalEating: 'Casi todos los días',
    compensatoryBehaviors: 'Ninguna conducta compensatoria',
  },
  trainingPreference: 'Express 15-20min',
  selectedGoal: 'perdida_moderada',
  targetWeightKg: 60,
  monthsToGoal: 4,
};

const onboardingValentina: OnboardingData = {
  name: 'Valentina Gómez',
  email: 'valentina.g@ejemplo.com',
  age: 29,
  gender: 'femenino',
  lifeStage: 'Regular',
  heightCm: 160,
  weightKg: 63,
  inBodyUploaded: false,
  silhouetteFatPercent: 28,
  neatLevel: 'sedentario',
  exerciseDaysPerWeek: 1,
  exerciseDurationMinutes: 30,
  exerciseIntensity: 'suave',
  wakeUpTime: '07:00',
  bedTime: '23:00',
  sleepHours: 8,
  activeMealTimes: ['desayuno', 'almuerzo', 'cena'],
  waterLitersPerDay: 1.8,
  alcoholFrequency: 'nunca',
  allergies: [],
  medicalConditions: ['embarazo'], // Condición bloqueante
  sitToStandReps: 13,
  foodRelationship: {
    description: 'Apetito variable por cambios hormonales',
    emotionalEating: 'Rara vez',
    compensatoryBehaviors: 'Ninguna',
  },
  trainingPreference: 'Express 15-20min',
  selectedGoal: 'perdida_conservadora',
  targetWeightKg: 63,
  monthsToGoal: 6,
};

const onboardingCarlos: OnboardingData = {
  name: 'Carlos Eduardo Morales',
  email: 'carlos.morales@ejemplo.com',
  age: 51,
  gender: 'masculino',
  heightCm: 178,
  weightKg: 89,
  inBodyUploaded: true,
  inBodyData: {
    weightKg: 89,
    bodyFatPercent: 31.5,
    muscleMassKg: 58.2,
    visceralFatLevel: 14,
  },
  neatLevel: 'sedentario',
  exerciseDaysPerWeek: 2,
  exerciseDurationMinutes: 30,
  exerciseIntensity: 'suave',
  wakeUpTime: '06:00',
  bedTime: '23:30',
  sleepHours: 6.5,
  activeMealTimes: ['desayuno', 'almuerzo', 'media_tarde', 'cena'],
  waterLitersPerDay: 1.5,
  alcoholFrequency: 'semanal',
  allergies: [],
  medicalConditions: ['diabetes_sin_insulina'],
  sitToStandReps: 9, // Caída / bajo (riesgo sarcopenia)
  foodRelationship: {
    description: 'Picoteo frecuente en horas laborales frente al computador',
    emotionalEating: 'Varias veces a la semana',
    compensatoryBehaviors: 'Ninguna',
  },
  trainingPreference: 'Power 45-60min',
  selectedGoal: 'perdida_moderada',
  targetWeightKg: 78,
  monthsToGoal: 5,
};

const onboardingDiana: OnboardingData = {
  name: 'Diana Marcela Ortiz',
  email: 'diana.ortiz@ejemplo.com',
  age: 39,
  gender: 'femenino',
  lifeStage: 'Regular',
  heightCm: 162,
  weightKg: 74,
  inBodyUploaded: true,
  inBodyData: {
    weightKg: 74,
    bodyFatPercent: 36,
    muscleMassKg: 44.5,
    visceralFatLevel: 10,
  },
  neatLevel: 'ligero',
  exerciseDaysPerWeek: 4,
  exerciseDurationMinutes: 45,
  exerciseIntensity: 'moderada',
  wakeUpTime: '06:15',
  bedTime: '22:45',
  sleepHours: 7.5,
  activeMealTimes: ['desayuno', 'media_manana', 'almuerzo', 'cena'],
  waterLitersPerDay: 2.5,
  alcoholFrequency: 'nunca',
  allergies: ['Gluten (Celiaquía)'],
  medicalConditions: ['celiaquia', 'hipotiroidismo'],
  sitToStandReps: 15,
  foodRelationship: {
    description: 'Frustración por no ver cambios en la báscula a pesar de seguir el menú',
    emotionalEating: 'Rara vez',
    compensatoryBehaviors: 'Ninguna',
  },
  trainingPreference: 'Express 15-20min',
  selectedGoal: 'perdida_moderada',
  targetWeightKg: 65,
  monthsToGoal: 4,
};

const onboardingAndres: OnboardingData = {
  name: 'Andrés Felipe Silva',
  email: 'andres.silva@ejemplo.com',
  age: 34,
  gender: 'masculino',
  heightCm: 175,
  weightKg: 82,
  inBodyUploaded: false,
  silhouetteFatPercent: 24,
  neatLevel: 'moderado',
  exerciseDaysPerWeek: 4,
  exerciseDurationMinutes: 60,
  exerciseIntensity: 'intensa',
  wakeUpTime: '05:30',
  bedTime: '22:00',
  sleepHours: 8,
  activeMealTimes: ['desayuno', 'media_manana', 'almuerzo', 'media_tarde', 'cena'],
  waterLitersPerDay: 3.0,
  alcoholFrequency: 'ocasional',
  allergies: [],
  medicalConditions: [],
  sitToStandReps: 22,
  foodRelationship: {
    description: 'Buena relación con la comida, enfocado en recomposición corporal',
    emotionalEating: 'Nunca',
    compensatoryBehaviors: 'Ninguna',
  },
  trainingPreference: 'Gimnasio con PDF',
  selectedGoal: 'perdida_moderada',
  targetWeightKg: 76,
  monthsToGoal: 3,
};

export function getInitialSeedProfiles(): Record<string, { name: string; email: string; password: string; role: 'paciente' | 'doctora'; profile: UserProfile }> {
  // Compute metrics
  const metricsMaria = calculateMetabolicMetrics(onboardingMariaCamila);
  const metricsValentina = calculateMetabolicMetrics(onboardingValentina);
  const metricsCarlos = calculateMetabolicMetrics(onboardingCarlos);
  const metricsDiana = calculateMetabolicMetrics(onboardingDiana);
  const metricsAndres = calculateMetabolicMetrics(onboardingAndres);

  const profileMaria: UserProfile = {
    id: 'user-maria-01',
    name: onboardingMariaCamila.name,
    email: onboardingMariaCamila.email,
    role: 'paciente',
    createdDate: '2026-07-15',
    onboarding: onboardingMariaCamila,
    metrics: metricsMaria,
    streakDays: 14,
    completedCheckIns: ['2026-08-10', '2026-08-03', '2026-07-27', '2026-07-20'],
    measurementHistory: [
      {
        id: 'm-04',
        date: '2026-08-10',
        weightKg: 67.2,
        bodyFatPercent: 31.2,
        muscleMassKg: 44.1,
        sitToStandReps: 14,
        circumferences: { waistCm: 76, hipCm: 99, armCm: 28, thighCm: 55 },
        wellbeing: { score: 4, comparison: 'mejor', notes: 'Ropa notablemente más holgada en cintura' },
        hungerTracker: { physicalHunger: 3, mentalFoodNoise: 5, timeContext: 'Tarde', notes: 'Mucho antojo de carbohidratos en la tarde por estrés laboral.' },
      },
      {
        id: 'm-03',
        date: '2026-08-03',
        weightKg: 67.5,
        bodyFatPercent: 31.5,
        muscleMassKg: 44.0,
        sitToStandReps: 14,
        circumferences: { waistCm: 77, hipCm: 99.5 },
        wellbeing: { score: 3, comparison: 'igual' },
        hungerTracker: { physicalHunger: 2, mentalFoodNoise: 4, timeContext: 'Noche' },
      },
      {
        id: 'm-02',
        date: '2026-07-27',
        weightKg: 67.9,
        bodyFatPercent: 31.8,
        muscleMassKg: 43.9,
        sitToStandReps: 14,
        circumferences: { waistCm: 78, hipCm: 100 },
        wellbeing: { score: 3, comparison: 'igual' },
      },
      {
        id: 'm-01',
        date: '2026-07-15',
        weightKg: 68.0,
        bodyFatPercent: 32.0,
        muscleMassKg: 43.8,
        sitToStandReps: 14,
        circumferences: { waistCm: 78.5, hipCm: 100 },
        wellbeing: { score: 3, comparison: 'igual' },
      },
    ],
    doctorConsultationNotes: [
      {
        id: 'note-01',
        date: '2026-07-16',
        author: 'Dra. Lorena Castro',
        content: 'Paciente refiere antecedentes de fluctuaciones de peso con dietas restrictivas pasadas. Se enfatiza el piso de 100g de carbohidratos para no elevar cortisol en la tarde.',
      },
      {
        id: 'note-02',
        date: '2026-08-04',
        author: 'Dra. Lorena Castro',
        content: 'Reporta reducción de inflamación digestiva al retirar lácteos enteros. Persiste ruido mental vespertino; se recomienda sincronizar media tarde con fuente proteica sólida (huevo cocido o queso campesino).',
      },
    ],
    doctorFollowUps: [
      {
        id: 'f-01',
        date: '2026-08-11',
        channel: 'WhatsApp',
        notes: 'Se le envió refuerzo de opciones de media tarde con fibra soluble para mitigar pico de hambre emocional.',
        nextAction: 'Revisar reporte de hambre en 5 días.',
      },
    ],
    doctorPrescriptionNotes: {
      eligibilityStatus: 'Apto',
      prescriptionNotes: 'Paciente candidata a programa de modulación glucémica y saciedad sin fármacos anorexígenos. Monitorear curva de ruido mental.',
      lastUpdated: '2026-08-11',
    },
  };

  const profileValentina: UserProfile = {
    id: 'user-valentina-02',
    name: onboardingValentina.name,
    email: onboardingValentina.email,
    role: 'paciente',
    createdDate: '2026-08-01',
    onboarding: onboardingValentina,
    metrics: metricsValentina,
    streakDays: 4,
    completedCheckIns: ['2026-08-08', '2026-08-01'],
    measurementHistory: [
      {
        id: 'val-02',
        date: '2026-08-08',
        weightKg: 63.2,
        sitToStandReps: 13,
      },
      {
        id: 'val-01',
        date: '2026-08-01',
        weightKg: 63.0,
        sitToStandReps: 13,
      },
    ],
    doctorConsultationNotes: [
      {
        id: 'note-val-01',
        date: '2026-08-02',
        author: 'Dra. Lorena Castro',
        content: 'BLOQUEO ACTIVO: Paciente en semana 14 de gestación. Plan de déficit automático suspendido. Se coordina consulta presencial para cálculo de ganancia ponderal fetal saludable.',
      },
    ],
    doctorFollowUps: [
      {
        id: 'f-val-01',
        date: '2026-08-03',
        channel: 'Llamada',
        notes: 'Se contactó a la paciente para explicarle el motivo de seguridad del bloqueo y derivación prioritaria a control prenatal.',
      },
    ],
    doctorPrescriptionNotes: {
      eligibilityStatus: 'No Apto',
      prescriptionNotes: 'Contraindicación absoluta de fármacos metabólicos por embarazo. Manejo exclusivamente nutricional gestacional.',
      lastUpdated: '2026-08-02',
    },
  };

  const profileCarlos: UserProfile = {
    id: 'user-carlos-03',
    name: onboardingCarlos.name,
    email: onboardingCarlos.email,
    role: 'paciente',
    createdDate: '2026-07-01',
    onboarding: onboardingCarlos,
    metrics: metricsCarlos,
    streakDays: 8,
    completedCheckIns: ['2026-08-09', '2026-07-25', '2026-07-10'],
    measurementHistory: [
      {
        id: 'car-03',
        date: '2026-08-09',
        weightKg: 87.5,
        bodyFatPercent: 31.0,
        muscleMassKg: 56.5, // -1.7 kg masa muscular
        sitToStandReps: 9, // Bajó de 14 a 9
        hungerTracker: { physicalHunger: 4, mentalFoodNoise: 3 },
      },
      {
        id: 'car-02',
        date: '2026-07-25',
        weightKg: 88.2,
        bodyFatPercent: 31.2,
        muscleMassKg: 57.4,
        sitToStandReps: 11,
      },
      {
        id: 'car-01',
        date: '2026-07-01',
        weightKg: 89.0,
        bodyFatPercent: 31.5,
        muscleMassKg: 58.2,
        sitToStandReps: 14,
      },
    ],
    doctorConsultationNotes: [
      {
        id: 'note-car-01',
        date: '2026-07-03',
        author: 'Dra. Lorena Castro',
        content: 'Paciente masculino de 51 años con resistencia a la insulina. Prescripción inicial enfocada en mantener proteína en 2.0g/kg (178g/día).',
      },
      {
        id: 'note-car-02',
        date: '2026-08-10',
        author: 'Dra. Lorena Castro',
        content: 'ALERTA DETECTADA: Se evidencia caída de 5 repeticiones en Sit-to-Stand (14 -> 9) y pérdida de 1.7kg de masa magra. El paciente refiere no estar realizando el entrenamiento de fuerza por dolor lumbar. Se ajusta volumen y se enfatiza ingesta de proteína distribuida en 4 tomas.',
      },
    ],
    doctorFollowUps: [
      {
        id: 'f-car-01',
        date: '2026-08-10',
        channel: 'Mensaje App',
        notes: 'Se derivó a rutina adaptada de fuerza sin impacto lumbar y se solicitó nuevo InBody en 30 días.',
        nextAction: 'Llamar el viernes para revisar cumplimiento del menú.',
      },
    ],
    doctorPrescriptionNotes: {
      eligibilityStatus: 'En Evaluación',
      prescriptionNotes: 'Evaluar necesidad de soporte con análogos GLP-1 según laboratorios de hemoglobina glicada (HbA1c) y curva de insulina.',
      lastUpdated: '2026-08-10',
    },
  };

  const profileDiana: UserProfile = {
    id: 'user-diana-04',
    name: onboardingDiana.name,
    email: onboardingDiana.email,
    role: 'paciente',
    createdDate: '2026-07-08',
    onboarding: onboardingDiana,
    metrics: metricsDiana,
    streakDays: 28,
    completedCheckIns: ['2026-08-12', '2026-07-29', '2026-07-15', '2026-07-08'],
    measurementHistory: [
      {
        id: 'dia-03',
        date: '2026-08-12',
        weightKg: 74.0, // Mismo peso que hace 35 días
        bodyFatPercent: 36.0,
        muscleMassKg: 44.5,
        sitToStandReps: 15,
        circumferences: { waistCm: 84, hipCm: 106, armCm: 32, thighCm: 61 },
        wellbeing: { score: 2, comparison: 'igual', notes: 'Frustración y fatiga por no ver cambios ni en báscula ni en la ropa' },
        hungerTracker: { physicalHunger: 2, mentalFoodNoise: 3 },
      },
      {
        id: 'dia-02',
        date: '2026-07-29',
        weightKg: 74.1,
        bodyFatPercent: 36.1,
        muscleMassKg: 44.4,
        sitToStandReps: 15,
        circumferences: { waistCm: 84, hipCm: 106 },
        wellbeing: { score: 2, comparison: 'igual' },
      },
      {
        id: 'dia-01',
        date: '2026-07-08',
        weightKg: 74.0,
        bodyFatPercent: 36.0,
        muscleMassKg: 44.5,
        sitToStandReps: 15,
        circumferences: { waistCm: 84, hipCm: 106, armCm: 32, thighCm: 61 },
        wellbeing: { score: 2, comparison: 'igual' },
      },
    ],
    doctorConsultationNotes: [
      {
        id: 'note-dia-01',
        date: '2026-07-10',
        author: 'Dra. Lorena Castro',
        content: 'Paciente con diagnóstico de hipotiroidismo en tratamiento con levotiroxina 75mcg y celiaquía estricta. Verificado menú 100% libre de trazas de gluten.',
      },
      {
        id: 'note-dia-02',
        date: '2026-08-13',
        author: 'Dra. Lorena Castro',
        content: 'ALERTA ESTANCAMIENTO CLÍNICO (3 SEÑALES): 35 días con adherencia pero sin reducción en peso (74.0kg), sin cambio en perimetría (cintura 84cm / cadera 106cm) y sensación de bienestar/energía sin mejoría (score 2/5). Se solicita perfil tiroideo completo (TSH, T4L, T3L, anticuerpos) para ajustar dosis farmacológica.',
      },
    ],
    doctorFollowUps: [
      {
        id: 'f-dia-01',
        date: '2026-08-13',
        channel: 'WhatsApp',
        notes: 'Orden de laboratorio enviada para TSH y T4L.',
      },
    ],
    doctorPrescriptionNotes: {
      eligibilityStatus: 'Apto',
      prescriptionNotes: 'Monitoreo de ajuste de dosis tiroidea antes de considerar intervención farmacológica metabólica complementaria.',
      lastUpdated: '2026-08-13',
    },
  };

  const profileAndres: UserProfile = {
    id: 'user-andres-05',
    name: onboardingAndres.name,
    email: onboardingAndres.email,
    role: 'paciente',
    createdDate: '2026-07-20',
    onboarding: onboardingAndres,
    metrics: metricsAndres,
    streakDays: 21,
    completedCheckIns: ['2026-08-11', '2026-08-01', '2026-07-20'],
    measurementHistory: [
      {
        id: 'and-03',
        date: '2026-08-11',
        weightKg: 79.8,
        bodyFatPercent: 22.1,
        sitToStandReps: 23,
        hungerTracker: { physicalHunger: 2, mentalFoodNoise: 1 },
      },
      {
        id: 'and-02',
        date: '2026-08-01',
        weightKg: 80.9,
        bodyFatPercent: 23.0,
        sitToStandReps: 22,
      },
      {
        id: 'and-01',
        date: '2026-07-20',
        weightKg: 82.0,
        bodyFatPercent: 24.0,
        sitToStandReps: 22,
      },
    ],
    doctorConsultationNotes: [
      {
        id: 'note-and-01',
        date: '2026-07-22',
        author: 'Dra. Lorena Castro',
        content: 'Paciente deportista aficionado. Se verificó que con su déficit moderado (-500 kcal) se mantiene en 164g de proteína y los carbohidratos no bajan del piso biológico. Excelente evolución.',
      },
    ],
    doctorFollowUps: [],
    doctorPrescriptionNotes: {
      eligibilityStatus: 'No Apto',
      prescriptionNotes: 'No requiere prescripción médica. Manejo conductual y nutricional exitoso.',
      lastUpdated: '2026-07-22',
    },
  };

  // Doctor account
  const doctorAccount = {
    name: 'Dra. Lorena Castro',
    email: 'dra.lorena@vela.com',
    password: 'doctora123',
    role: 'doctora' as const,
    profile: {
      id: 'doctor-lorena-main',
      name: 'Dra. Lorena Castro',
      email: 'dra.lorena@vela.com',
      role: 'doctora' as const,
      createdDate: '2026-01-01',
      onboarding: onboardingMariaCamila,
      metrics: metricsMaria,
      measurementHistory: [],
      completedCheckIns: [],
      streakDays: 30,
    },
  };

  return {
    'dra.lorena@vela.com': doctorAccount,
    'maria.camila@ejemplo.com': {
      name: profileMaria.name,
      email: profileMaria.email,
      password: 'paciente123',
      role: 'paciente' as const,
      profile: profileMaria,
    },
    'valentina.g@ejemplo.com': {
      name: profileValentina.name,
      email: profileValentina.email,
      password: 'paciente123',
      role: 'paciente' as const,
      profile: profileValentina,
    },
    'carlos.morales@ejemplo.com': {
      name: profileCarlos.name,
      email: profileCarlos.email,
      password: 'paciente123',
      role: 'paciente' as const,
      profile: profileCarlos,
    },
    'diana.ortiz@ejemplo.com': {
      name: profileDiana.name,
      email: profileDiana.email,
      password: 'paciente123',
      role: 'paciente' as const,
      profile: profileDiana,
    },
    'andres.silva@ejemplo.com': {
      name: profileAndres.name,
      email: profileAndres.email,
      password: 'paciente123',
      role: 'paciente' as const,
      profile: profileAndres,
    },
  };
}
