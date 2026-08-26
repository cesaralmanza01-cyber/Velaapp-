import React, { useState } from 'react';
import { OnboardingData, TrainingModalityKey, ParqAnswers } from '../../types';
import { PARQ_QUESTIONS } from '../../data/parqQuestions';
import {
  Dumbbell,
  Clock,
  Calendar,
  Flame,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Home,
  ShieldCheck,
  ShieldAlert,
  Award,
  Zap,
  AlertTriangle,
  HeartPulse,
  Info,
  Check,
  Stethoscope,
} from 'lucide-react';

interface TrainingSetupScreenProps {
  onboardingData: OnboardingData;
  onConfirm: (trainingConfig: {
    trainingTime: string;
    exerciseDaysPerWeek: number;
    exerciseIntensityLevel: 'baja' | 'moderada' | 'alta';
    trainingModality: TrainingModalityKey;
    trainingPreference: 'Express 15-20min' | 'Power 45-60min' | 'Gimnasio con PDF' | 'Personalizado';
    parqAnswers: ParqAnswers;
    parqHasRisk: boolean;
    parqNoticeAcknowledged: boolean;
  }) => void;
  onBack: () => void;
}

export const TrainingSetupScreen: React.FC<TrainingSetupScreenProps> = ({
  onboardingData,
  onConfirm,
  onBack,
}) => {
  // Stage 1: PAR-Q (Seguridad previa), Stage 2: Modality Selection
  const [currentStage, setCurrentStage] = useState<'parq' | 'modality'>('parq');

  // PAR-Q Answers state
  const [parqAnswers, setParqAnswers] = useState<ParqAnswers>(
    onboardingData.parqAnswers || {
      q1_heartCondition: false,
      q2_chestPainActivity: false,
      q3_chestPainRest: false,
      q4_balanceDizziness: false,
      q5_boneJointProblem: false,
      q6_bloodPressureMeds: false,
      q7_otherReason: false,
    }
  );

  // Modal / Alert for PAR-Q warning if any question is answered with "Sí"
  const [showParqWarningModal, setShowParqWarningModal] = useState<boolean>(false);
  const [parqNoticeAcknowledged, setParqNoticeAcknowledged] = useState<boolean>(
    onboardingData.parqNoticeAcknowledged ?? false
  );

  // Training parameters
  const [trainingTime, setTrainingTime] = useState<string>(
    onboardingData.trainingTime || '07:00'
  );
  const [daysPerWeek, setDaysPerWeek] = useState<number>(
    onboardingData.exerciseDaysPerWeek || 3
  );
  const [intensity, setIntensity] = useState<'baja' | 'moderada' | 'alta'>(
    onboardingData.exerciseIntensityLevel || 'moderada'
  );
  const [modality, setModality] = useState<TrainingModalityKey>(
    onboardingData.trainingModality || 'express_casa'
  );

  const preferredName =
    onboardingData.preferredName || onboardingData.name?.split(' ')[0] || 'Paciente';

  const MODALITY_OPTIONS: {
    key: TrainingModalityKey;
    label: string;
    prefLabel: 'Express 15-20min' | 'Power 45-60min' | 'Gimnasio con PDF' | 'Personalizado';
    badge: string;
    desc: string;
    duration: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'casa_corta',
      label: 'Rutina corta en casa',
      prefLabel: 'Express 15-20min',
      badge: '15-20 min/día',
      desc: 'Circuitos metabólicos y estímulo neuromuscular rápido sin necesidad de máquinas complejas.',
      duration: '15-20 min',
      icon: <Home className="w-5 h-5 text-[#6E9E93]" />,
    },
    {
      key: 'guiada_larga',
      label: 'Rutina guiada progresiva',
      prefLabel: 'Power 45-60min',
      badge: '45-60 min/día',
      desc: 'Sesiones completas de fuerza y resistencia estructuradas para estímulo de hipertrofia y densidad ósea.',
      duration: '45-60 min',
      icon: <Zap className="w-5 h-5 text-[#8FAFD1]" />,
    },
    {
      key: 'gimnasio_pdf',
      label: 'PDF gimnasio tradicional',
      prefLabel: 'Gimnasio con PDF',
      badge: 'PDF Descargable',
      desc: 'Plan con series, repeticiones y descansos para ejecutar con pesas y poleas en tu gimnasio habitual.',
      duration: '45-60 min',
      icon: <Dumbbell className="w-5 h-5 text-[#F2A488]" />,
    },
    {
      key: 'personalizado',
      label: 'Plan flexible / Personalizado',
      prefLabel: 'Personalizado',
      badge: 'Ajuste dinámico',
      desc: 'Combinación mixta adaptable a tu agenda cambiante, viajes o actividades al aire libre.',
      duration: 'Variable',
      icon: <Award className="w-5 h-5 text-[#6E9E93]" />,
    },
  ];

  // Helper to check if any PAR-Q answer is positive ("Sí")
  const hasAnyPositiveParq = Object.values(parqAnswers).some((val) => val === true);

  const handleToggleParq = (key: keyof ParqAnswers, value: boolean) => {
    setParqAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMarkAllNo = () => {
    setParqAnswers({
      q1_heartCondition: false,
      q2_chestPainActivity: false,
      q3_chestPainRest: false,
      q4_balanceDizziness: false,
      q5_boneJointProblem: false,
      q6_bloodPressureMeds: false,
      q7_otherReason: false,
    });
  };

  // PAR-Q Stage submission
  const handleParqSubmit = () => {
    if (hasAnyPositiveParq && !parqNoticeAcknowledged) {
      // Show clinical safety recommendation notice
      setShowParqWarningModal(true);
    } else {
      // Proceed directly to modality selection
      setCurrentStage('modality');
    }
  };

  const handleAcknowledgeWarningAndProceed = () => {
    setParqNoticeAcknowledged(true);
    setShowParqWarningModal(false);
    setCurrentStage('modality');
  };

  // Final confirmation
  const handleFinalConfirm = () => {
    const selectedMod = MODALITY_OPTIONS.find((m) => m.key === modality) || MODALITY_OPTIONS[0];
    onConfirm({
      trainingTime,
      exerciseDaysPerWeek: daysPerWeek,
      exerciseIntensityLevel: intensity,
      trainingModality: modality,
      trainingPreference: selectedMod.prefLabel,
      parqAnswers,
      parqHasRisk: hasAnyPositiveParq,
      parqNoticeAcknowledged: hasAnyPositiveParq ? true : parqNoticeAcknowledged,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* ==================================================================== */}
      {/* STAGE 1: CUESTIONARIO PAR-Q DE SEGURIDAD EN ACTIVIDAD FÍSICA */}
      {/* ==================================================================== */}
      {currentStage === 'parq' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Seguridad Clínica: Cuestionario PAR-Q</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A36]">
              Aptitud y Seguridad para Actividad Física
            </h2>
            <p className="text-xs sm:text-sm text-[#2E3A36]/80 max-w-lg mx-auto leading-relaxed">
              El <strong>PAR-Q</strong> (Physical Activity Readiness Questionnaire) es el estándar internacional para verificar que puedas realizar actividad física de forma 100% segura y saludable.
            </p>
          </div>

          {/* Quick helper banner */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#AEC9C0]/60 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-[#2E3A36]/80">
              <Info className="w-4 h-4 text-[#6E9E93] flex-shrink-0" />
              <span>Responde <strong>Sí</strong> o <strong>No</strong> a cada una de las 7 preguntas:</span>
            </div>
            <button
              type="button"
              onClick={handleMarkAllNo}
              className="text-[11px] font-bold text-[#6E9E93] hover:text-[#588278] bg-[#6E9E93]/10 hover:bg-[#6E9E93]/20 px-3 py-1 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Marcar "No" a todas
            </button>
          </div>

          {/* 7 Questions List */}
          <div className="space-y-3">
            {PARQ_QUESTIONS.map((q) => {
              const isYes = parqAnswers[q.id] === true;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isYes
                      ? 'bg-[#F2A488]/10 border-[#F2A488] shadow-xs ring-1 ring-[#F2A488]/40'
                      : 'bg-white border-[#AEC9C0]/50 hover:border-[#6E9E93]/60 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#6E9E93]/20 text-[#6E9E93] text-[11px] font-bold flex items-center justify-center font-mono">
                          {q.num}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E9E93] font-mono">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#2E3A36] leading-snug">
                        {q.question}
                      </p>
                      <p className="text-[11px] text-[#2E3A36]/65 leading-tight">
                        {q.detail}
                      </p>
                    </div>

                    {/* Sí / No Selector */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleParq(q.id, false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          !isYes
                            ? 'bg-[#6E9E93] border-[#6E9E93] text-white shadow-2xs'
                            : 'bg-[#FAF6F0] border-[#AEC9C0]/60 text-[#2E3A36]/80 hover:border-[#6E9E93]'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleParq(q.id, true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isYes
                            ? 'bg-[#F2A488] border-[#F2A488] text-[#2E3A36] font-extrabold shadow-2xs ring-2 ring-[#F2A488]/40'
                            : 'bg-[#FAF6F0] border-[#AEC9C0]/60 text-[#2E3A36]/80 hover:border-[#F2A488]'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner si hay respuestas afirmativas */}
          {hasAnyPositiveParq && (
            <div className="p-4 rounded-2xl bg-[#F2A488]/15 border border-[#F2A488]/50 flex items-start space-x-3 text-left">
              <AlertTriangle className="w-5 h-5 text-[#c96f50] flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-[#2E3A36]">
                <p className="font-bold text-[#2E3A36]">
                  Aviso de seguridad médica previo:
                </p>
                <p className="leading-relaxed opacity-90">
                  Has marcado "Sí" en al menos una pregunta. Podrás continuar y seleccionar tu modalidad de ejercicio, pero guardaremos esta observación en tu ficha clínica para recomendarte una consulta médica o con especialista antes de aumentar tu nivel de esfuerzo.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl border border-[#AEC9C0] text-xs font-bold text-[#2E3A36] bg-white hover:bg-[#FAF6F0] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Diagnóstico</span>
            </button>

            <button
              type="button"
              onClick={handleParqSubmit}
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-[#6E9E93] text-white text-xs font-extrabold hover:bg-[#5b877d] shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Continuar a Modalidad de Ejercicio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL / ADVISORY DE SEGURIDAD CLÍNICA PAR-Q (Si alguna es "Sí") */}
      {/* ==================================================================== */}
      {showParqWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#AEC9C0] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left">
            {/* Header del Aviso */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F2A488]/20 border border-[#F2A488]/60 text-[#c96f50] flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E9E93] bg-[#6E9E93]/10 px-2 py-0.5 rounded-md">
                  Recomendación Clínica Preventiva
                </span>
                <h3 className="text-lg font-extrabold text-[#2E3A36] leading-snug">
                  Aviso de Seguridad en Actividad Física
                </h3>
              </div>
            </div>

            {/* Contenido Explicativo */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-2.5 text-xs text-[#2E3A36]/90 leading-relaxed">
              <p>
                <strong>{preferredName}</strong>, has respondido <strong>"Sí"</strong> a una o más preguntas de seguridad del cuestionario PAR-Q.
              </p>
              <p>
                <strong>Tu diagnóstico y plan nutricional se generarán con total normalidad y sin ningún bloqueo</strong>. Sin embargo, te recomendamos encarecidamente consultar con tu <strong>médico/a o especialista de salud</strong> antes de iniciar o aumentar la intensidad de tu actividad física, para asegurar que tus ejercicios estén adecuadamente supervisados y adaptados a tu salud cardiovascular y osteomuscular.
              </p>
            </div>

            {/* Preguntas marcadas afirmativas */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#2E3A36] block">
                Observaciones registradas en tu ficha:
              </span>
              <ul className="space-y-1 text-xs text-[#2E3A36]/80 list-disc pl-5">
                {PARQ_QUESTIONS.filter((q) => parqAnswers[q.id] === true).map((q) => (
                  <li key={q.id}>
                    <strong>Pregunta {q.num}:</strong> {q.question}
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón de Aceptación y Continuación */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAcknowledgeWarningAndProceed}
                className="w-full py-4 px-6 bg-[#6E9E93] hover:bg-[#5b877d] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Entendido, continuar</span>
              </button>
              <p className="text-[10px] text-center text-[#2E3A36]/60 pt-2">
                Esta observación quedará guardada en tu expediente clínico para seguimiento con tu profesional.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAGE 2: MODALIDAD Y HORARIO DE ENTRENAMIENTO */}
      {/* ==================================================================== */}
      {currentStage === 'modality' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Paso 15 de 16: Programación del Entrenamiento</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A36]">
              {preferredName}, adaptemos tu estímulo neuromuscular
            </h2>
            <p className="text-xs sm:text-sm text-[#2E3A36]/80 max-w-lg mx-auto">
              El ejercicio envía la señal celular clave de retener y tonificar masa muscular, optimizando tu sensibilidad a la insulina y gasto energético.
            </p>
          </div>

          {/* PAR-Q Status Badge */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#AEC9C0]/60 text-xs">
            <div className="flex items-center gap-2">
              {hasAnyPositiveParq ? (
                <AlertTriangle className="w-4 h-4 text-[#F2A488]" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#6E9E93]" />
              )}
              <span className="font-semibold text-[#2E3A36]">
                {hasAnyPositiveParq
                  ? 'PAR-Q: Recomendación médica preventiva registrada'
                  : 'PAR-Q: 7/7 Verificado (Aptitud para ejercicio)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStage('parq')}
              className="text-[11px] text-[#6E9E93] hover:underline font-bold"
            >
              Revisar PAR-Q
            </button>
          </div>

          {/* 1. Modalidad de Entrenamiento */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#2E3A36] flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#6E9E93]" />
                <span>Modalidad de entrenamiento preferida</span>
              </label>
              <span className="text-[11px] text-[#6E9E93] font-bold">Selecciona una</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODALITY_OPTIONS.map((opt) => {
                const isSelected = modality === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => setModality(opt.key)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#6E9E93] bg-[#AEC9C0]/15 ring-2 ring-[#6E9E93]/20 shadow-xs'
                        : 'border-[#AEC9C0]/30 bg-white hover:border-[#6E9E93]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-[#FAF6F0]">{opt.icon}</div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#2E3A36]">{opt.label}</h4>
                          <span className="text-[10px] font-semibold text-[#6E9E93]">{opt.badge}</span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6E9E93] flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#2E3A36]/75 leading-relaxed">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Horario Habitual de Entrenamiento */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-4">
            <label className="text-sm font-bold text-[#2E3A36] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#6E9E93]" />
              <span>Hora habitual en la que entrenarás</span>
            </label>
            <p className="text-xs text-[#2E3A36]/70">
              Nos permite sincronizar la ventana de recuperación y nutrientes alrededor de tu sesión.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Mañana temprano', time: '06:30' },
                { label: 'Media mañana', time: '10:00' },
                { label: 'Tarde', time: '17:30' },
                { label: 'Noche', time: '19:30' },
              ].map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => setTrainingTime(preset.time)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    trainingTime === preset.time
                      ? 'border-[#6E9E93] bg-[#6E9E93] text-white font-bold'
                      : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36] hover:border-[#6E9E93]/60'
                  }`}
                >
                  <div className="text-xs font-semibold">{preset.label}</div>
                  <div className="text-[11px] opacity-85">{preset.time}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs font-medium text-[#2E3A36]">O ajusta hora exacta:</span>
              <input
                type="time"
                value={trainingTime}
                onChange={(e) => setTrainingTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] bg-[#FAF6F0] focus:ring-2 focus:ring-[#6E9E93]"
              />
            </div>
          </div>

          {/* 3. Frecuencia Semanal & Intensidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frecuencia */}
            <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
              <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#6E9E93]" />
                <span>Días por semana ({daysPerWeek} días)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysPerWeek(d)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      daysPerWeek === d
                        ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                        : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36] hover:border-[#6E9E93]'
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#2E3A36]/70 leading-snug">
                3-4 días es el rango óptimo clínico para máxima adherencia y regeneración muscular.
              </p>
            </div>

            {/* Intensidad Percibida */}
            <div className="bg-white p-5 rounded-3xl border border-[#AEC9C0]/50 shadow-xs space-y-3">
              <label className="text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-[#F2A488]" />
                <span>Intensidad percibida</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'baja', label: 'Suave' },
                    { key: 'moderada', label: 'Moderada' },
                    { key: 'alta', label: 'Intensa' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.key}
                    type="button"
                    onClick={() => setIntensity(lvl.key)}
                    className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      intensity === lvl.key
                        ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                        : 'border-[#AEC9C0]/40 bg-[#FAF6F0] text-[#2E3A36] hover:border-[#6E9E93]'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#2E3A36]/70 leading-snug">
                {intensity === 'baja' && 'Estímulo suave de movilidad y fuerza sin llegar al fallo.'}
                {intensity === 'moderada' && 'Esfuerzo retador que deja 2-3 repeticiones en reserva (RIR 2-3).'}
                {intensity === 'alta' && 'Alta exigencia cardiovascular y neuromuscular con descansos cortos.'}
              </p>
            </div>
          </div>

          {/* Doctora Insight */}
          <div className="p-4 rounded-2xl bg-[#AEC9C0]/20 border border-[#AEC9C0]/50 flex items-start space-x-3 text-left">
            <Sparkles className="w-5 h-5 text-[#6E9E93] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#2E3A36]/85 leading-relaxed">
              <span className="font-bold text-[#6E9E93]">Dra. Lorena:</span> "{preferredName}, sincronizaremos la ingesta de tu porción de proteína y carbohidrato post-entrenamiento exactamente después de tus sesiones a las {trainingTime}."
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStage('parq')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl border border-[#AEC9C0] text-xs font-bold text-[#2E3A36] bg-white hover:bg-[#FAF6F0] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás: Cuestionario PAR-Q</span>
            </button>

            <button
              type="button"
              onClick={handleFinalConfirm}
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-[#6E9E93] text-white text-xs font-extrabold hover:bg-[#5b877d] shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Paso Final: Generar Plan Personalizado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
