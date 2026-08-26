import React, { useState } from 'react';
import {
  OnboardingData,
  NeatLevel,
  MedicalConditionId,
  MedicalFollowUpAnswers,
  MealTimeKey,
  TrainingModalityKey,
} from '../../types';
import { SILHOUETTE_RANGES, getSilhouetteRanges } from '../../data/silhouettes';
import { calculateMetabolicMetrics } from '../../utils/metabolicCalc';
import { InBodyUploadModal } from './InBodyUploadModal';
import { SitToStandWidget } from './SitToStandWidget';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
  Droplets,
  Heart,
  Dumbbell,
  Check,
  CheckCircle2,
  Lock,
  Activity,
  Briefcase,
  AlertTriangle,
  Flame,
  Utensils,
  HelpCircle,
  Pill,
  User,
  Zap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  HeartPulse,
} from 'lucide-react';

interface StepByStepOnboardingProps {
  initialData: OnboardingData;
  onFinishOnboarding: (data: OnboardingData) => void;
  onShowReveal: (
    metricType: 'bmi' | 'fat' | 'muscle' | 'visceral',
    value: number,
    statusText: string,
    alert: boolean,
    text: string,
    doctorInsight: string
  ) => void;
}

export const ALL_CONDITIONS_LIST: { id: MedicalConditionId; label: string; desc: string }[] = [
  { id: 'prediabetes', label: 'Prediabetes', desc: 'Riesgo de diabetes o glucosa en ayunas alterada.' },
  { id: 'diabetes', label: 'Diabetes (Tipo 1 o General)', desc: 'Diagnóstico clínico de diabetes.' },
  { id: 'diabetes_tipo_2', label: 'Diabetes Tipo 2', desc: 'Manejo con hábitos o fármacos orales/insulina.' },
  { id: 'resistencia_insulina', label: 'Resistencia a la insulina', desc: 'Hiperinsulinemia o acantosis / sospecha clínica.' },
  { id: 'hipotiroidismo', label: 'Hipotiroidismo', desc: 'Tratamiento con levotiroxina o TSH elevada.' },
  { id: 'hipertiroidismo', label: 'Hipertiroidismo', desc: 'Tiroides hiperactiva en tratamiento.' },
  { id: 'sop', label: 'Síndrome de ovario poliquístico (SOP)', desc: 'Desbalance hormonal ovárico y metabólico.' },
  { id: 'embarazo', label: 'Embarazo', desc: 'Gestación en curso activa.' },
  { id: 'lactancia', label: 'Lactancia', desc: 'Amamantamiento activo (protección de producción láctea).' },
  { id: 'cirugia_bariatrica', label: 'Cirugía bariátrica', desc: 'Bypass, manga gástrica u otra intervención.' },
  { id: 'hipertension', label: 'Hipertensión', desc: 'Presión arterial elevada o medicación antihipertensiva.' },
  { id: 'dislipidemia', label: 'Colesterol alto / Dislipidemia', desc: 'Triglicéridos o colesterol LDL alterados.' },
  { id: 'enfermedad_renal', label: 'Enfermedad renal', desc: 'Afección o seguimiento de función renal.' },
  { id: 'celiaquia', label: 'Enfermedad celíaca', desc: 'Intolerancia autoinmune al gluten diagnosticada.' },
  { id: 'sii', label: 'Síndrome de intestino irritable (SII)', desc: 'Molestias digestivas, gases, inflamación.' },
  { id: 'eii', label: 'Enfermedad inflamatoria intestinal (EII)', desc: 'Crohn o Colitis ulcerativa.' },
  { id: 'reflujo_gastritis', label: 'Reflujo gastroesofágico / Gastritis', desc: 'Ardor, acidez o gastritis crónica.' },
  { id: 'anemia', label: 'Anemia', desc: 'Hemoglobina o ferritina baja.' },
  { id: 'tca', label: 'Trastornos de la conducta alimentaria (TCA)', desc: 'Antecedentes de anorexia, bulimia, atracones.' },
  { id: 'depresion_ansiedad', label: 'Depresión / Ansiedad', desc: 'Tratamiento o sintomatología anímica.' },
  { id: 'otra_condicion', label: 'Otra condición', desc: 'Cualquier otra condición médica diagnosticada.' },
];

export const COUNTRY_DIAL_CODES = [
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+1', country: 'Estados Unidos / Canadá', flag: '🇺🇸' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+1-DO', country: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
];

export const StepByStepOnboarding: React.FC<StepByStepOnboardingProps> = ({
  initialData,
  onFinishOnboarding,
  onShowReveal,
}) => {
  // Sequence of 10 steps in the questionnaire:
  // 1. Datos personales
  // 2. Nombre preferido
  // 3. Interstitial motivacional
  // 4. Salud y Condiciones
  // 5. Contexto Hormonal
  // 6. Alergias e Intolerancias
  // 7. Actividad Física (2 ejes)
  // 8. Hábitos Generales
  // 9. Relación con la Comida
  // 10. Métricas Corporales (peso, altura, silueta/InBody, sit-to-stand)
  const [step, setStep] = useState<number>(1);
  const totalSteps = 10;

  const [formData, setFormData] = useState<OnboardingData>({
    ...initialData,
    name: initialData.name || '',
    preferredName: initialData.preferredName || initialData.name?.split(' ')[0] || '',
    email: initialData.email || '',
    whatsapp: initialData.whatsapp || '',
    birthDate: initialData.birthDate || '',
    countryCity: initialData.countryCity || 'Colombia',
    documentId: initialData.documentId || '',
    gender: initialData.gender || 'femenino',
    lifeStage: initialData.lifeStage || 'Premenopausia',
    heightCm: initialData.heightCm || 165,
    weightKg: initialData.weightKg || 68,
    inBodyUploaded: initialData.inBodyUploaded ?? false,
    inBodyData: initialData.inBodyData,
    silhouetteFatPercent: initialData.silhouetteFatPercent || (initialData.gender === 'masculino' ? 20 : 25),
    hasDiagnosedConditions: initialData.hasDiagnosedConditions ?? false,
    medicalConditions: initialData.medicalConditions || ['ninguna'],
    medicalFollowUpAnswers: initialData.medicalFollowUpAnswers || {},
    usesHormonalContraception: initialData.usesHormonalContraception ?? false,
    hasFoodAllergies: initialData.hasFoodAllergies ?? (initialData.allergies && initialData.allergies.length > 0),
    allergiesNotes: initialData.allergiesNotes || initialData.allergies?.join(', ') || '',
    structuredExerciseStatus: initialData.structuredExerciseStatus || 'si_rutina',
    neatActivityLevel: initialData.neatActivityLevel || 'mixta',
    neatLevel: initialData.neatLevel || 'ligero',
    exerciseDaysPerWeek: initialData.exerciseDaysPerWeek ?? 3,
    exerciseDurationKey: initialData.exerciseDurationKey || '45min-1h',
    exerciseDurationMinutes: initialData.exerciseDurationMinutes ?? 45,
    exerciseIntensityLevel: initialData.exerciseIntensityLevel || 'moderada',
    exerciseIntensity: initialData.exerciseIntensity || 'moderada',
    trainingModality: initialData.trainingModality || 'express_casa',
    trainingPreference: initialData.trainingPreference || 'Express 15-20min',
    sitToStandReps: initialData.sitToStandReps ?? 14,
    activeMealTimes: initialData.activeMealTimes?.length >= 3
      ? initialData.activeMealTimes
      : ['desayuno', 'media_manana', 'almuerzo', 'cena'],
    wakeUpTime: initialData.wakeUpTime || '06:30',
    bedTime: initialData.bedTime || '22:30',
    sleepHours: initialData.sleepHours || 8,
    waterLitersPerDay: initialData.waterLitersPerDay || 2,
    alcoholFrequency: initialData.alcoholFrequency || 'ocasional',
  });

  // Selector de indicativo y número de WhatsApp (+57 Colombia por defecto)
  const initialWhatsApp = initialData.whatsapp || '';
  const matchedDial = COUNTRY_DIAL_CODES.find((c) => initialWhatsApp.startsWith(c.code));
  const [phoneDialCode, setPhoneDialCode] = useState<string>(matchedDial ? matchedDial.code : '+57');
  const [phoneNumberRaw, setPhoneNumberRaw] = useState<string>(
    matchedDial
      ? initialWhatsApp.slice(matchedDial.code.length).trim()
      : initialWhatsApp.replace(/^\+\d+\s*/, '').trim()
  );

  const handlePhoneChange = (dial: string, numberOnly: string) => {
    setPhoneDialCode(dial);
    setPhoneNumberRaw(numberOnly);
    const cleanedDigits = numberOnly.replace(/[^\d\s-]/g, '').trim();
    const effectiveDial = dial.startsWith('+1-DO') ? '+1' : dial;
    if (cleanedDigits) {
      updateForm({ whatsapp: `${effectiveDial} ${cleanedDigits}` });
    } else {
      updateForm({ whatsapp: '' });
    }
  };

  const [showInBodyModal, setShowInBodyModal] = useState<boolean>(false);
  const [stepValidationWarning, setStepValidationWarning] = useState<string | null>(null);

  const updateForm = (fields: Partial<OnboardingData>) => {
    setStepValidationWarning(null);
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const updateFollowUp = (answers: Partial<MedicalFollowUpAnswers>) => {
    setFormData((prev) => ({
      ...prev,
      medicalFollowUpAnswers: {
        ...(prev.medicalFollowUpAnswers || {}),
        ...answers,
      },
    }));
  };

  const toggleCondition = (id: MedicalConditionId) => {
    setFormData((prev) => {
      let current = [...(prev.medicalConditions || [])].filter((c) => c !== 'ninguna');
      if (current.includes(id)) {
        current = current.filter((c) => c !== id);
      } else {
        current.push(id);
      }
      return {
        ...prev,
        medicalConditions: current.length > 0 ? current : ['ninguna'],
      };
    });
  };

  const toggleMealTime = (mealKey: MealTimeKey) => {
    setFormData((prev) => {
      let current = [...(prev.activeMealTimes || [])];
      if (current.includes(mealKey)) {
        if (current.length <= 3) return prev; // Mínimo 3 comidas
        current = current.filter((k) => k !== mealKey);
      } else {
        if (current.length < 5) current.push(mealKey); // Máximo 5 comidas
      }
      return { ...prev, activeMealTimes: current };
    });
  };

  const validateCurrentStep = (): boolean => {
    setStepValidationWarning(null);

    // Step 1: Datos personales
    if (step === 1) {
      if (!formData.name?.trim()) {
        setStepValidationWarning('Por favor ingresa tu nombre completo.');
        return false;
      }
      if (!formData.email?.trim() || !formData.email.includes('@')) {
        setStepValidationWarning('Por favor ingresa un correo electrónico válido.');
        return false;
      }
      if (!formData.whatsapp?.trim()) {
        setStepValidationWarning('Por favor ingresa tu número de WhatsApp para seguimiento.');
        return false;
      }
      if (!formData.age || formData.age < 16) {
        setStepValidationWarning('Por favor ingresa una edad válida (mínimo 16 años).');
        return false;
      }
    }

    // Step 2: Nombre preferido
    if (step === 2) {
      if (!formData.preferredName?.trim()) {
        updateForm({ preferredName: formData.name.trim().split(' ')[0] });
      }
    }

    // Step 4: Salud y Condiciones
    if (step === 4) {
      if (formData.hasDiagnosedConditions) {
        const conditions = formData.medicalConditions || [];
        if (conditions.length === 0 || (conditions.length === 1 && conditions[0] === 'ninguna')) {
          setStepValidationWarning('Por favor selecciona al menos una condición médica o marca "No tengo condiciones diagnosticadas".');
          return false;
        }
        if (conditions.includes('otra_condicion') && !formData.medicalFollowUpAnswers?.otherConditionDetails?.trim()) {
          setStepValidationWarning('Por favor describe brevemente cuál es tu otra condición médica diagnosticada.');
          return false;
        }
      }
    }

    // Step 6: Alergias e Intolerancias
    if (step === 6) {
      if (formData.hasFoodAllergies && !formData.allergiesNotes?.trim()) {
        setStepValidationWarning('Por favor indícanos qué alimentos no puedes consumir o te generan intolerancia.');
        return false;
      }
    }

    // Step 10: Métricas Corporales
    if (step === 10) {
      if (!formData.heightCm || formData.heightCm < 100) {
        setStepValidationWarning('Por favor ingresa tu estatura en centímetros.');
        return false;
      }
      if (!formData.weightKg || formData.weightKg < 30) {
        setStepValidationWarning('Por favor ingresa tu peso actual en kilogramos.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Si está en el paso 4 de condiciones médicas y se detecta una condición bloqueante,
    // detenemos el onboarding en seco y disparamos la pantalla médica de bloqueo
    if (step === 4) {
      const calculated = calculateMetabolicMetrics(formData);
      if (calculated.isMedicalBlocked) {
        const finalData: OnboardingData = {
          ...formData,
          name: formData.name.trim() || 'Paciente',
          preferredName: formData.preferredName?.trim() || formData.name.trim().split(' ')[0] || 'Paciente',
          allergies: formData.hasFoodAllergies && formData.allergiesNotes
            ? formData.allergiesNotes.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        };
        onFinishOnboarding(finalData);
        return;
      }
    }

    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      // Step 10 finished -> Trigger Reveal flow and finalize questionnaire
      const heightM = formData.heightCm / 100;
      const bmi = Number((formData.weightKg / (heightM * heightM)).toFixed(1));
      let status = 'Rango Saludable';
      let isAlert = false;
      if (bmi >= 25 && bmi < 30) {
        status = 'Sobrepeso Metabólico';
      } else if (bmi >= 30) {
        status = 'Inflamación Metabólica';
        isAlert = true;
      }

      const displayName = formData.preferredName || formData.name?.split(' ')[0] || 'Paciente';
      onShowReveal(
        'bmi',
        bmi,
        status,
        isAlert,
        `${displayName}, tu IMC calculado es ${bmi}.`,
        'El IMC es solo el punto de partida; lo clave es tu masa magra y perfil hormonal.'
      );

      const finalData: OnboardingData = {
        ...formData,
        name: formData.name.trim(),
        preferredName: formData.preferredName?.trim() || formData.name.trim().split(' ')[0],
        allergies: formData.hasFoodAllergies && formData.allergiesNotes
          ? formData.allergiesNotes.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      onFinishOnboarding(finalData);
    }
  };

  const handlePrevStep = () => {
    setStepValidationWarning(null);
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const preferredName = formData.preferredName || formData.name?.split(' ')[0] || 'Paciente';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Progress Bar & Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#6E9E93]">
          <span className="font-bold">Paso {step} de {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% completado</span>
        </div>
        <div className="w-full bg-[#AEC9C0]/30 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#6E9E93] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Warning Alert */}
      {stepValidationWarning && (
        <div className="p-4 rounded-2xl bg-[#F2A488]/20 border border-[#F2A488] text-[#2E3A36] text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-[#F2A488] flex-shrink-0" />
          <span>{stepValidationWarning}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 1: DATOS PERSONALES */}
      {/* ==================================================================== */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Datos personales</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Comencemos con tus datos básicos para abrir tu expediente clínico seguro.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-4">
            {/* Nombre Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-[#6E9E93]" />
                <span>Nombre y Apellidos completos *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                placeholder="Ej. María Camila Gómez"
                className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
              />
            </div>

            {/* Correo y WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#6E9E93]" />
                  <span>Correo electrónico *</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#6E9E93]" />
                  <span>Número de WhatsApp *</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={phoneDialCode}
                    onChange={(e) => handlePhoneChange(e.target.value, phoneNumberRaw)}
                    className="w-28 sm:w-32 px-2.5 py-3 rounded-2xl border border-[#AEC9C0]/60 text-xs sm:text-sm font-bold text-[#2E3A36] bg-[#FAF6F0] focus:ring-2 focus:ring-[#6E9E93] outline-hidden cursor-pointer shrink-0"
                    title="Selecciona el indicativo de tu país"
                  >
                    {COUNTRY_DIAL_CODES.map((item) => (
                      <option key={`${item.code}-${item.country}`} value={item.code}>
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumberRaw}
                    onChange={(e) => handlePhoneChange(phoneDialCode, e.target.value)}
                    placeholder="300 123 4567"
                    className="flex-1 min-w-0 px-3.5 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                  />
                </div>
              </div>
            </div>

            {/* Fecha de nacimiento & Edad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6E9E93]" />
                  <span>Fecha de nacimiento</span>
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => {
                    const bDate = e.target.value;
                    if (bDate) {
                      const birthYear = new Date(bDate).getFullYear();
                      const curYear = new Date().getFullYear();
                      const calcAge = curYear - birthYear;
                      updateForm({ birthDate: bDate, age: calcAge > 0 ? calcAge : formData.age });
                    } else {
                      updateForm({ birthDate: bDate });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36]">Edad (años) *</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateForm({ age: Number(e.target.value) })}
                  placeholder="Ej. 38"
                  className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                />
              </div>
            </div>

            {/* País / Ciudad & Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#6E9E93]" />
                  <span>País y Ciudad de residencia</span>
                </label>
                <input
                  type="text"
                  value={formData.countryCity}
                  onChange={(e) => updateForm({ countryCity: e.target.value })}
                  placeholder="Ej. Colombia, Medellín"
                  className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#6E9E93]" />
                  <span>Documento de Identidad (ID / Cédula)</span>
                </label>
                <input
                  type="text"
                  value={formData.documentId}
                  onChange={(e) => updateForm({ documentId: e.target.value })}
                  placeholder="Ej. 1020304050"
                  className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-sm font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                />
              </div>
            </div>

            {/* Sexo Biológico */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#2E3A36]">
                Sexo biológico (determina ecuaciones basales Cunningham & Mifflin) *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateForm({ gender: 'femenino' })}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                    formData.gender === 'femenino'
                      ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                      : 'border-[#AEC9C0]/50 bg-[#FAF6F0] text-[#2E3A36] hover:border-[#6E9E93]'
                  }`}
                >
                  Femenino
                </button>
                <button
                  type="button"
                  onClick={() => updateForm({ gender: 'masculino' })}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                    formData.gender === 'masculino'
                      ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                      : 'border-[#AEC9C0]/50 bg-[#FAF6F0] text-[#2E3A36] hover:border-[#6E9E93]'
                  }`}
                >
                  Masculino
                </button>
              </div>
            </div>

            {/* Etapa Vital si es femenino */}
            {formData.gender === 'femenino' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#2E3A36]">
                  Etapa o contexto hormonal femenino actual
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Regular / Fértil', 'Premenopausia', 'Menopausia', 'Postparto'].map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => updateForm({ lifeStage: stage })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        formData.lifeStage === stage
                          ? 'border-[#6E9E93] bg-[#AEC9C0]/30 text-[#2E3A36]'
                          : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/70 hover:border-[#6E9E93]'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 2: NOMBRE PREFERIDO */}
      {/* ==================================================================== */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200 text-center">
          <div className="w-16 h-16 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-[#6E9E93]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A36]">
              ¿Cómo te gustaría que te llamemos?
            </h2>
            <p className="text-xs sm:text-sm text-[#2E3A36]/80 max-w-md mx-auto">
              En Vela nos gusta el trato cercano y cálido. Escribe cómo te gusta que se dirijan a ti en tus consultas y en tu plan.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#AEC9C0]/50 shadow-xs max-w-md mx-auto space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-[#2E3A36]">Me llaman...</label>
              <input
                type="text"
                value={formData.preferredName}
                onChange={(e) => updateForm({ preferredName: e.target.value })}
                placeholder="Ej. Cami, Aleja, Fer..."
                className="w-full px-5 py-4 rounded-2xl border border-[#AEC9C0]/60 text-lg font-extrabold text-[#2E3A36] text-center focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
              />
            </div>
            <p className="text-[11px] text-[#2E3A36]/60 italic">
              Usaremos este nombre en tus recomendaciones nutricionales personalizadas.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 3: INTERSTITIAL MOTIVACIONAL */}
      {/* ==================================================================== */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300 text-center py-4">
          <div className="w-20 h-20 rounded-full bg-[#FAF6F0] border-2 border-[#AEC9C0] flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-10 h-10 text-[#6E9E93] animate-pulse" />
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              Un nuevo paradigma clínico
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A36] leading-snug">
              "¿Cuántas veces has empezado una dieta diciendo... <br className="hidden sm:inline" />
              <span className="text-[#6E9E93]">esta sí será la definitiva?</span>"
            </h2>

            <div className="bg-white p-6 rounded-3xl border border-[#AEC9C0]/60 text-left shadow-sm space-y-3">
              <p className="text-sm text-[#2E3A36] font-medium leading-relaxed">
                {preferredName}, en Vela entendemos que no te faltaba fuerza de voluntad: <span className="font-bold text-[#6E9E93]">faltaba sincronizar tu biología única, tu tiroides, tu masa muscular y tus hormonas.</span>
              </p>
              <p className="text-xs text-[#2E3A36]/80 leading-relaxed">
                Las dietas restrictivas genéricas ralentizan tu tasa metabólica basal y destruyen tu masa magra. Vamos a descubrir exactamente cómo funciona tu cuerpo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 4: SALUD Y CONDICIONES (Compuerta + 21 Condiciones) */}
      {/* ==================================================================== */}
      {step === 4 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evaluación de Seguridad Clínica</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Salud y Condiciones Médicas</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Evaluamos 21 condiciones clínicas para calibrar macronutrientes y seguridad médica.
            </p>
          </div>

          {/* Compuerta Inicial Sí / No */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/60 shadow-xs space-y-3">
            <label className="text-xs font-extrabold text-[#2E3A36]">
              ¿Tienes alguna enfermedad o condición médica diagnosticada?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  updateForm({ hasDiagnosedConditions: false, medicalConditions: ['ninguna'] });
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  !formData.hasDiagnosedConditions
                    ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                    : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                No, ninguna diagnosticada
              </button>
              <button
                type="button"
                onClick={() => {
                  updateForm({ hasDiagnosedConditions: true });
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  formData.hasDiagnosedConditions
                    ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                    : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                Sí, tengo diagnóstico
              </button>
            </div>
          </div>

          {/* Checklist Multi-Select con las 21 condiciones */}
          {formData.hasDiagnosedConditions && (
            <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/60 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#2E3A36]">
                  Selecciona todas las que apliquen a tu caso:
                </span>
                <span className="text-[11px] font-bold text-[#6E9E93]">
                  {formData.medicalConditions.filter((c) => c !== 'ninguna').length} seleccionadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {ALL_CONDITIONS_LIST.map((cond) => {
                  const isChecked = formData.medicalConditions.includes(cond.id);
                  return (
                    <div
                      key={cond.id}
                      onClick={() => toggleCondition(cond.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#6E9E93] bg-[#AEC9C0]/20 text-[#2E3A36] ring-1 ring-[#6E9E93]'
                          : 'border-[#AEC9C0]/30 bg-[#FAF6F0] text-[#2E3A36]/80 hover:border-[#6E9E93]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold">{cond.label}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-[#6E9E93] flex-shrink-0 ml-1" />}
                      </div>
                      <p className="text-[10px] text-[#2E3A36]/60 mt-0.5">{cond.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Preguntas de seguimiento contextuales */}
              {/* 1. Cirugía Bariátrica */}
              {formData.medicalConditions.includes('cirugia_bariatrica') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-2">
                  <label className="text-xs font-bold text-[#2E3A36]">
                    ¿Hace cuánto tiempo te realizaste la cirugía bariátrica?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ bariatricSurgeryMonths: 'menos_12' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        formData.medicalFollowUpAnswers?.bariatricSurgeryMonths === 'menos_12'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      Menos de 12 meses (reciente)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ bariatricSurgeryMonths: 'mas_12' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        formData.medicalFollowUpAnswers?.bariatricSurgeryMonths === 'mas_12'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      Hace más de 12 meses
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Diabetes / Diabetes Tipo 2 */}
              {(formData.medicalConditions.includes('diabetes') || formData.medicalConditions.includes('diabetes_tipo_2')) && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-2">
                  <label className="text-xs font-bold text-[#2E3A36]">
                    ¿Utilizas insulina inyectable como parte de tu tratamiento?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ diabetesUsesInsulin: 'si' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.medicalFollowUpAnswers?.diabetesUsesInsulin === 'si'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      Sí, uso insulina
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ diabetesUsesInsulin: 'no' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.medicalFollowUpAnswers?.diabetesUsesInsulin === 'no'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      No (medicación oral / hábitos)
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Enfermedad Renal */}
              {formData.medicalConditions.includes('enfermedad_renal') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-2">
                  <label className="text-xs font-bold text-[#2E3A36]">
                    ¿Cuál es el estado actual de tu condición renal?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ renalConditionMildControlled: 'si' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        formData.medicalFollowUpAnswers?.renalConditionMildControlled === 'si'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      Leve y controlada por mi médico
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ renalConditionMildControlled: 'no_o_no_seguro' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        formData.medicalFollowUpAnswers?.renalConditionMildControlled === 'no_o_no_seguro'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      No controlada / Moderada / No seguro
                    </button>
                  </div>
                </div>
              )}

              {/* 4. TCA (Trastorno de la Conducta Alimentaria) */}
              {formData.medicalConditions.includes('tca') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-2">
                  <label className="text-xs font-bold text-[#2E3A36]">
                    ¿Presentas actualmente episodios activos de restricción severa, atracones o conductas compensatorias?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ tcaHistoryOrCompensatory: 'si' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.medicalFollowUpAnswers?.tcaHistoryOrCompensatory === 'si'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      Sí, episodios activos
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFollowUp({ tcaHistoryOrCompensatory: 'no_o_no_seguro' })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.medicalFollowUpAnswers?.tcaHistoryOrCompensatory === 'no_o_no_seguro'
                          ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                          : 'border-[#AEC9C0]/50 bg-white text-[#2E3A36]'
                      }`}
                    >
                      No (en remisión / superado)
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Otra Condición */}
              {formData.medicalConditions.includes('otra_condicion') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/40 space-y-1.5">
                  <label className="text-xs font-bold text-[#2E3A36]">
                    Detalla tu otra condición médica:
                  </label>
                  <input
                    type="text"
                    value={formData.medicalFollowUpAnswers?.otherConditionDetails || ''}
                    onChange={(e) => updateFollowUp({ otherConditionDetails: e.target.value })}
                    placeholder="Ej. Artritis reumatoide en tratamiento..."
                    className="w-full px-3 py-2 rounded-xl border border-[#AEC9C0]/60 text-xs font-semibold text-[#2E3A36] bg-white outline-hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 5: CONTEXTO HORMONAL */}
      {/* ==================================================================== */}
      {step === 5 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Pill className="w-3.5 h-3.5" />
              <span>Sincronización Endocrina</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Contexto Hormonal</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Los métodos hormonales influyen en la retención hídrica, la sensibilidad a la insulina y el ritmo ovulatorio.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-4">
            <label className="text-xs font-bold text-[#2E3A36]">
              ¿Actualmente utilizas algún método hormonal de planificación familiar?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateForm({ usesHormonalContraception: false })}
                className={`py-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  !formData.usesHormonalContraception
                    ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                    : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                No utilizo método hormonal
              </button>
              <button
                type="button"
                onClick={() => updateForm({ usesHormonalContraception: true })}
                className={`py-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  formData.usesHormonalContraception
                    ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                    : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                Sí (Píldoras, DIU hormonal, Implante...)
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#AEC9C0]/20 border border-[#AEC9C0]/40 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#6E9E93] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#2E3A36]/80 leading-relaxed">
                <span className="font-bold text-[#6E9E93]">Dra. Lorena:</span> "{preferredName}, saber esto nos permite ajustar tus micronutrientes (magnesio, vitamina B6 y zinc) para reducir cualquier retención hídrica cíclica."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 6: ALERGIAS E INTOLERANCIAS */}
      {/* ==================================================================== */}
      {step === 6 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Utensils className="w-3.5 h-3.5" />
              <span>Seguridad Nutricional</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Alergias e Intolerancias</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Garantizamos que tu menú de equivalencias esté 100% libre de alimentos que te generen malestar o inflamación.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-4">
            <label className="text-xs font-bold text-[#2E3A36]">
              ¿Tienes alguna alergia, intolerancia o alimentos que no toleres?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateForm({ hasFoodAllergies: false, allergiesNotes: '' })}
                className={`py-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  !formData.hasFoodAllergies
                    ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                    : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                No tengo alergias
              </button>
              <button
                type="button"
                onClick={() => updateForm({ hasFoodAllergies: true })}
                className={`py-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  formData.hasFoodAllergies
                    ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                    : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                Sí, tengo exclusiones
              </button>
            </div>

            {formData.hasFoodAllergies && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <label className="text-xs font-bold text-[#2E3A36]">
                  Escribe los alimentos a excluir (ej. Lactosa, mariscos, gluten, maní...) *
                </label>
                <textarea
                  rows={3}
                  value={formData.allergiesNotes}
                  onChange={(e) => updateForm({ allergiesNotes: e.target.value })}
                  placeholder="Ej. Intolerancia a la lactosa, alergia a los camarones, no me gusta el cerdo..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#AEC9C0]/60 text-xs font-semibold text-[#2E3A36] focus:ring-2 focus:ring-[#6E9E93] outline-hidden bg-[#FAF6F0]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 7: ACTIVIDAD FÍSICA (Los 2 Ejes) */}
      {/* ==================================================================== */}
      {step === 7 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Gasto Energético Total (GET)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Actividad Física (2 Ejes)</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Diferenciamos tu ejercicio estructurado de tu movimiento espontáneo diario (NEAT).
            </p>
          </div>

          {/* Eje 1: Ejercicio Estructurado */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
              <Dumbbell className="w-4 h-4 text-[#6E9E93]" />
              <span>Eje 1: Ejercicio estructurado programado</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { key: 'si_rutina', label: 'Sí, tengo rutina fija', desc: 'Entreno regularmente cada semana.' },
                { key: 'no_no_suelo', label: 'No suelo hacer ejercicio', desc: 'Actualmente no entreno.' },
                { key: 'no_voy_a_retomar', label: 'No, pero voy a retomar', desc: 'Empezaré con este nuevo plan.' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => updateForm({ structuredExerciseStatus: opt.key as any })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.structuredExerciseStatus === opt.key
                      ? 'border-[#6E9E93] bg-[#AEC9C0]/20 text-[#2E3A36] font-bold ring-1 ring-[#6E9E93]'
                      : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/70 hover:border-[#6E9E93]'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Eje 2: Actividad Cotidiana (NEAT) */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4 text-[#8FAFD1]" />
              <span>Eje 2: Actividad cotidiana / laboral (NEAT)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { key: 'sedentaria', neat: 'sedentario', label: 'Sedentaria', desc: 'Trabajo de escritorio / sentada la mayor parte del día.' },
                { key: 'mixta', neat: 'ligero', label: 'Mixta / Moderada', desc: 'Caminatas cortas, labores del hogar o desplazamientos.' },
                { key: 'activa', neat: 'moderado', label: 'Muy Activa', desc: 'De pie la mayor parte del día o trabajo físico continuo.' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => updateForm({ neatActivityLevel: opt.key as any, neatLevel: opt.neat as NeatLevel })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.neatActivityLevel === opt.key
                      ? 'border-[#6E9E93] bg-[#AEC9C0]/20 text-[#2E3A36] font-bold ring-1 ring-[#6E9E93]'
                      : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/70 hover:border-[#6E9E93]'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 8: HÁBITOS GENERALES */}
      {/* ==================================================================== */}
      {step === 8 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Moon className="w-3.5 h-3.5" />
              <span>Cronobiología y Ritmo Circadiano</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Hábitos Generales</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Sincronizamos tus comidas con tu reloj biológico para regular la grelina y la leptina.
            </p>
          </div>

          {/* Horarios de Sueño */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
              <Moon className="w-4 h-4 text-[#6E9E93]" />
              <span>Horarios y horas de sueño habituales</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Despertar</span>
                <input
                  type="time"
                  value={formData.wakeUpTime}
                  onChange={(e) => updateForm({ wakeUpTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] bg-[#FAF6F0]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Dormir</span>
                <input
                  type="time"
                  value={formData.bedTime}
                  onChange={(e) => updateForm({ bedTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] bg-[#FAF6F0]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Horas sueño</span>
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={formData.sleepHours}
                  onChange={(e) => updateForm({ sleepHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] bg-[#FAF6F0]"
                />
              </div>
            </div>
          </div>

          {/* Comidas Activas al Día (3 a 5) */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                <Utensils className="w-4 h-4 text-[#6E9E93]" />
                <span>Número y distribución de comidas al día (3 a 5)</span>
              </label>
              <span className="text-[11px] font-bold text-[#6E9E93]">
                {formData.activeMealTimes.length} tiempos activos
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { key: 'desayuno', label: 'Desayuno' },
                { key: 'media_manana', label: 'Media Mañana' },
                { key: 'almuerzo', label: 'Almuerzo' },
                { key: 'media_tarde', label: 'Media Tarde' },
                { key: 'cena', label: 'Cena' },
              ].map((m) => {
                const isActive = formData.activeMealTimes.includes(m.key as any);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMealTime(m.key as any)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                      isActive
                        ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                        : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/60 hover:border-[#6E9E93]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agua y Alcohol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-[#AEC9C0]/50 space-y-2">
              <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                <Droplets className="w-4 h-4 text-[#8FAFD1]" />
                <span>Consumo de agua (L/día)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="6"
                value={formData.waterLitersPerDay}
                onChange={(e) => updateForm({ waterLitersPerDay: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] bg-[#FAF6F0]"
              />
            </div>

            <div className="bg-white p-4 rounded-3xl border border-[#AEC9C0]/50 space-y-2">
              <label className="text-xs font-bold text-[#2E3A36]">Frecuencia de alcohol</label>
              <select
                value={formData.alcoholFrequency}
                onChange={(e) => updateForm({ alcoholFrequency: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] bg-[#FAF6F0]"
              >
                <option value="nunca">Nunca / Casi nunca</option>
                <option value="ocasional">Ocasional (1-2 veces al mes)</option>
                <option value="semanal">Semanal (fines de semana)</option>
                <option value="frecuente">Frecuente (varios días por semana)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 9: RELACIÓN CON LA COMIDA (Los 3 Pasos) */}
      {/* ==================================================================== */}
      {step === 9 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Heart className="w-3.5 h-3.5" />
              <span>Bienestar Psiconutricional</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Relación con la Comida</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Evaluamos 3 dimensiones para adaptar la distribución de carbohidratos y saciedad por la tarde.
            </p>
          </div>

          {/* Dimensión 1 */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-[#2E3A36]">
              1. ¿Sientes ruido de comida o pensamientos recurrentes por dulce / harinas en la tarde o noche?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Sin ruido de comida',
                'Ruido de comida leve u ocasional',
                'Ruido de comida recurrente en la tarde o noche',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateForm({ foodRelationship: { ...formData.foodRelationship, description: opt } })}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    formData.foodRelationship.description === opt
                      ? 'border-[#6E9E93] bg-[#AEC9C0]/20 text-[#2E3A36] ring-1 ring-[#6E9E93]'
                      : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/70 hover:border-[#6E9E93]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensión 2 */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-[#2E3A36]">
              2. ¿Comes en respuesta a emociones (estrés, aburrimiento, cansancio, tristeza)?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Casi nunca / Rara vez',
                'Ocasionalmente con alto estrés',
                'Varias veces a la semana',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateForm({ foodRelationship: { ...formData.foodRelationship, emotionalEating: opt } })}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    formData.foodRelationship.emotionalEating === opt
                      ? 'border-[#6E9E93] bg-[#6E9E93] text-white shadow-xs'
                      : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/70 hover:border-[#6E9E93]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensión 3 */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-[#2E3A36]">
              3. ¿Realizas conductas compensatorias (ayunos excesivos, ejercicio extenuante por culpa)?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Ninguna conducta compensatoria',
                'Ocasionalmente me salto comidas por culpa',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateForm({ foodRelationship: { ...formData.foodRelationship, compensatoryBehaviors: opt } })}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    formData.foodRelationship.compensatoryBehaviors === opt
                      ? 'border-[#6E9E93] bg-[#AEC9C0]/20 text-[#2E3A36] ring-1 ring-[#6E9E93]'
                      : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36]/70 hover:border-[#6E9E93]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 10: MÉTRICAS CORPORALES & SIT-TO-STAND */}
      {/* ==================================================================== */}
      {step === 10 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-[#F2A488]" />
              <span>Biometría Cuantitativa</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#2E3A36]">Métricas Corporales</h2>
            <p className="text-xs text-[#2E3A36]/80">
              Estatura, peso, composición corporal y proxy de fuerza muscular.
            </p>
          </div>

          {/* Estatura y Peso */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-[#AEC9C0]/50 space-y-1.5 text-center shadow-2xs">
              <label className="text-xs font-bold text-[#2E3A36]">Estatura (cm) *</label>
              <input
                type="number"
                value={formData.heightCm || ''}
                onChange={(e) => updateForm({ heightCm: Number(e.target.value) })}
                placeholder="165"
                className="w-full text-center text-xl font-extrabold text-[#2E3A36] py-2 rounded-xl bg-[#FAF6F0] border border-[#AEC9C0]/60 focus:outline-none focus:border-[#6E9E93]"
              />
            </div>

            <div className="bg-white p-4 rounded-3xl border border-[#AEC9C0]/50 space-y-1.5 text-center shadow-2xs">
              <label className="text-xs font-bold text-[#2E3A36]">Peso actual (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={formData.weightKg || ''}
                onChange={(e) => updateForm({ weightKg: Number(e.target.value) })}
                placeholder="68.0"
                className="w-full text-center text-xl font-extrabold text-[#2E3A36] py-2 rounded-xl bg-[#FAF6F0] border border-[#AEC9C0]/60 focus:outline-none focus:border-[#6E9E93]"
              />
            </div>
          </div>

          {/* Sección de Composición Corporal: 2 Rutas Válidas */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-[#2E3A36] uppercase tracking-wider">
                Composición Corporal (% Grasa Estimada)
              </h3>
              <p className="text-[11px] text-[#2E3A36]/70 mt-0.5">
                Elige la opción que prefieras: puedes subir tu reporte InBody o seleccionar directamente tu silueta visual (12% a 45%).
              </p>
            </div>

            {/* RUTA 1: Subir InBody (Opcional) */}
            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#F2A488]" />
                  <span className="text-xs font-bold text-[#2E3A36]">
                    Ruta 1: Examen InBody / Bioimpedancia (Opcional)
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93]">
                  {formData.inBodyUploaded ? 'Activo ✓' : 'Opcional'}
                </span>
              </div>

              {formData.inBodyUploaded && formData.inBodyData ? (
                <div className="p-3 rounded-xl bg-white border border-[#6E9E93] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#6E9E93] font-bold">
                    <span className="inline-flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#6E9E93]" />
                      <span>Reporte InBody cargado correctamente</span>
                    </span>
                    <span className="text-[11px] bg-[#6E9E93]/15 px-2 py-0.5 rounded-lg">
                      Fórmula Cunningham
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-[#FAF6F0] p-1.5 rounded-lg">
                      <span className="text-[10px] text-[#2E3A36]/70 block">Grasa</span>
                      <span className="font-extrabold text-[#2E3A36]">
                        {formData.inBodyData.bodyFatPercent || '--'}%
                      </span>
                    </div>
                    <div className="bg-[#FAF6F0] p-1.5 rounded-lg">
                      <span className="text-[10px] text-[#2E3A36]/70 block">Masa Magra</span>
                      <span className="font-extrabold text-[#2E3A36]">
                        {formData.inBodyData.muscleMassKg || '--'} kg
                      </span>
                    </div>
                    <div className="bg-[#FAF6F0] p-1.5 rounded-lg">
                      <span className="text-[10px] text-[#2E3A36]/70 block">Grasa Visceral</span>
                      <span className="font-extrabold text-[#2E3A36]">
                        Nivel {formData.inBodyData.visceralFatLevel || '--'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowInBodyModal(true)}
                      className="text-[#6E9E93] font-bold hover:underline"
                    >
                      Reemplazar reporte
                    </button>
                    <span className="text-[#2E3A36]/40">•</span>
                    <button
                      type="button"
                      onClick={() => updateForm({ inBodyUploaded: false })}
                      className="text-[#2E3A36]/70 font-semibold hover:underline"
                    >
                      Usar silueta visual en su lugar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                  <p className="text-[11px] text-[#2E3A36]/75">
                    Sube foto o PDF de tu reporte. La IA extraerá tus datos automáticamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowInBodyModal(true)}
                    className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#6E9E93] text-[#6E9E93] text-xs font-bold hover:bg-[#6E9E93] hover:text-white transition-all shadow-2xs flex-shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir InBody con IA</span>
                  </button>
                </div>
              )}
            </div>

            {/* RUTA 2: Selector de Silueta Corporal (8 imágenes, 12% a 45%) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2E3A36]">
                  Ruta 2: Selector de Silueta Corporal (12% a 45% de grasa)
                </span>
                {!formData.inBodyUploaded && (
                  <span className="text-[10px] font-bold text-[#6E9E93] bg-[#AEC9C0]/30 px-2 py-0.5 rounded-full">
                    {formData.silhouetteFatPercent ? `${formData.silhouetteFatPercent}% Seleccionado` : 'Selecciona una'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#2E3A36]/70">
                Toca la silueta que más se asemeje a tu distribución corporal actual:
              </p>

              {/* Grid interactivo de 8 Siluetas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {getSilhouetteRanges(formData.gender).map((sil) => {
                  const isSelected = formData.silhouetteFatPercent === sil.fatPercent && !formData.inBodyUploaded;
                  return (
                    <button
                      key={sil.id}
                      type="button"
                      onClick={() =>
                        updateForm({
                          silhouetteFatPercent: sil.fatPercent,
                          inBodyUploaded: false,
                        })
                      }
                      className={`p-2 rounded-2xl border flex flex-col items-center justify-between transition-all relative group cursor-pointer ${
                        isSelected
                          ? 'border-[#6E9E93] bg-white text-[#2E3A36] ring-2 ring-[#6E9E93] shadow-md scale-102 z-10'
                          : 'border-[#AEC9C0]/60 bg-[#FAF6F0] text-[#2E3A36] hover:border-[#6E9E93] hover:bg-white'
                      }`}
                    >
                      {/* SVG de Silueta con Ilustración Plana y Badges Circulares */}
                      <div
                        className="w-full aspect-[240/230] max-h-24 my-0.5 flex items-center justify-center transition-transform group-hover:scale-105"
                        dangerouslySetInnerHTML={{ __html: sil.imageSvg }}
                      />

                      <div className="text-center w-full pt-1 border-t border-[#AEC9C0]/40 mt-1">
                        <span className="text-xs font-black block text-[#6E9E93]">
                          {sil.fatPercent}% Grasa
                        </span>
                        <span
                          className="text-[10px] font-medium block truncate leading-tight mt-0.5 text-[#2E3A36]/80"
                          title={sil.description}
                        >
                          {sil.label.split(' ')[1] || sil.label}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#6E9E93] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detalle ampliado de la silueta seleccionada */}
              {!formData.inBodyUploaded && formData.silhouetteFatPercent && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white border border-[#6E9E93]/40 shadow-xs flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6E9E93] shrink-0" />
                    <div>
                      <span className="font-bold text-[#2E3A36]">
                        Estimación visual activa: {formData.silhouetteFatPercent}% de grasa
                      </span>
                      <p className="text-[11px] text-[#2E3A36]/70">
                        {getSilhouetteRanges(formData.gender).find((s) => s.fatPercent === formData.silhouetteFatPercent)?.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#6E9E93]/15 text-[#6E9E93] shrink-0">
                    4 Badges Conectadas ✓
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Test Sit-to-Stand Integrado */}
          <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#F2A488]" />
              <h4 className="text-xs font-extrabold text-[#2E3A36]">
                Test de Fuerza: Sit-to-Stand (30 segundos)
              </h4>
            </div>
            <p className="text-[11px] text-[#2E3A36]/75">
              Cuántas veces puedes pararte y sentarte de una silla en 30s sin usar las manos. Proxy clínico de masa muscular en piernas.
            </p>
            <SitToStandWidget
              initialReps={formData.sitToStandReps}
              onSave={(reps) => updateForm({ sitToStandReps: reps })}
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-2xl border border-[#AEC9C0] text-xs font-bold text-[#2E3A36] bg-white hover:bg-[#FAF6F0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNextStep}
          className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-[#6E9E93] text-white text-xs font-extrabold hover:bg-[#5b877d] shadow-md hover:shadow-lg transition-all"
        >
          <span>{step === totalSteps ? 'Revelar Diagnóstico' : 'Continuar'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* InBody Modal */}
      {showInBodyModal && (
        <InBodyUploadModal
          gender={formData.gender}
          onClose={() => setShowInBodyModal(false)}
          onSuccess={(inBodyData) => {
            updateForm({
              inBodyUploaded: true,
              inBodyData,
              weightKg: inBodyData.weightKg || formData.weightKg,
            });
            setShowInBodyModal(false);
          }}
        />
      )}
    </div>
  );
};
