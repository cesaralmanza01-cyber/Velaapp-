import React, { useState } from 'react';
import { OnboardingData, TrainingModalityKey } from '../../types';
import {
  TRAINING_MODALITIES_DATA,
  TrainingModalityPlan,
  ExerciseItem,
} from '../../data/trainingRoutines';
import {
  Dumbbell,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  Play,
  Video,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Flame,
  Home,
  Zap,
  Award,
  ExternalLink,
  RotateCcw,
  Check,
} from 'lucide-react';

interface TrainingTabProps {
  onboarding?: OnboardingData;
  userName: string;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({ onboarding, userName }) => {
  const initialModality = (onboarding?.trainingModality as TrainingModalityKey) || 'casa_corta';
  const [selectedModality, setSelectedModality] = useState<TrainingModalityKey>(initialModality);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const currentPlan: TrainingModalityPlan =
    TRAINING_MODALITIES_DATA[selectedModality] || TRAINING_MODALITIES_DATA.casa_corta;

  const currentDay = currentPlan.days[selectedDayIndex] || currentPlan.days[0];

  const toggleCompleteExercise = (exerciseId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const dayTotalExercises = currentDay?.exercises.length || 0;
  const dayCompletedCount = (currentDay?.exercises || []).filter(
    (e) => completedExercises[e.id]
  ).length;
  const progressPercent =
    dayTotalExercises > 0 ? Math.round((dayCompletedCount / dayTotalExercises) * 100) : 0;

  const handlePrintGymRoutine = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-6 pb-28 text-[#2E3A36]">
      {/* Header Banner */}
      <div className="bg-[#FAF6F0] rounded-3xl p-5 sm:p-6 border border-[#AEC9C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-[#6E9E93]/15 text-[#6E9E93]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#2E3A36]">
              Rutina de Entrenamiento
            </h2>
          </div>
          <p className="text-xs text-[#2E3A36]/70">
            Estímulo neuromuscular prescrito para retención muscular de {userName.split(' ')[0] || 'Paciente'}
          </p>
        </div>

        <button
          onClick={handlePrintGymRoutine}
          className="px-3.5 py-2 bg-white text-[#2E3A36] rounded-2xl border border-[#AEC9C0] text-xs font-bold flex items-center space-x-1.5 hover:bg-[#AEC9C0]/20 transition-all shadow-2xs self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-[#6E9E93]" />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      {/* 1. Selector de Modalidad */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#AEC9C0]/70 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E3A36]/80 font-mono">
            Modalidad Activa:
          </span>
          <span className="text-xs text-[#6E9E93] font-bold">
            {currentPlan.badge}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'casa_corta', label: 'Casa Corta', icon: Home },
            { key: 'guiada_larga', label: 'Split Guiado', icon: Zap },
            { key: 'gimnasio_pdf', label: 'Gimnasio PDF', icon: Dumbbell },
            { key: 'personalizado', label: 'Personalizado', icon: Award },
          ].map((mod) => {
            const isSelected = selectedModality === mod.key;
            const Icon = mod.icon;
            return (
              <button
                key={mod.key}
                onClick={() => {
                  setSelectedModality(mod.key as TrainingModalityKey);
                  setSelectedDayIndex(0);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 shadow-2xs ${
                  isSelected
                    ? 'bg-[#6E9E93] text-white border-[#6E9E93] shadow-xs scale-102 font-bold'
                    : 'bg-[#FAF6F0] text-[#2E3A36]/80 hover:bg-[#AEC9C0]/20 border-[#AEC9C0]/50 text-xs font-semibold'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{mod.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 text-xs text-[#2E3A36]/80 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-[#6E9E93] flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>{currentPlan.title}:</strong> {currentPlan.description}
          </p>
        </div>
      </div>

      {/* 2. Selector de Días / Sesiones del Plan */}
      {currentPlan.days.length > 1 && (
        <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none">
          {currentPlan.days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const dayExercises = day.exercises;
            const isDayDone =
              dayExercises.length > 0 &&
              dayExercises.every((e) => completedExercises[e.id]);

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 shadow-2xs ${
                  isSelected
                    ? 'bg-[#2E3A36] text-white shadow-xs'
                    : 'bg-white text-[#2E3A36]/70 hover:bg-[#FAF6F0] border border-[#AEC9C0]/60'
                }`}
              >
                {isDayDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9E93]" />}
                <span>Día {day.dayNumber}</span>
                <span className="opacity-60 text-[10px] font-mono">
                  ({day.estimatedMinutes} min)
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Header de la Sesión Actual & Barra de Progreso */}
      <div className="bg-white rounded-3xl p-5 border border-[#AEC9C0]/70 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2E3A36]">
              {currentDay.dayTitle}
            </h3>
            <p className="text-xs text-[#2E3A36]/70 flex items-center space-x-1.5 mt-0.5">
              <span>🎯 Enfoque: {currentDay.focus}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#6E9E93]" />
                <span>{currentDay.estimatedMinutes} min</span>
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-[#6E9E93]">
              {dayCompletedCount}/{dayTotalExercises} listos ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden border border-[#AEC9C0]/40">
          <div
            className="bg-[#6E9E93] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Lista de Ejercicios con Video Embebido */}
      <div className="space-y-4">
        {currentDay.exercises.map((exercise, index) => {
          const isDone = Boolean(completedExercises[exercise.id]);

          return (
            <div
              key={exercise.id}
              className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-2xs space-y-3 ${
                isDone
                  ? 'border-[#6E9E93]/70 bg-[#6E9E93]/5'
                  : 'border-[#AEC9C0]/70 hover:border-[#6E9E93]/50'
              }`}
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="w-6 h-6 rounded-full bg-[#FAF6F0] text-[#2E3A36] border border-[#AEC9C0]/60 text-xs font-mono font-extrabold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#2E3A36]">
                      {exercise.name}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="px-2 py-0.5 rounded-lg bg-[#AEC9C0]/25 text-[#2E3A36] text-[11px] font-bold">
                      {exercise.muscleGroup}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#FAF6F0] text-[#2E3A36]/70 border border-[#AEC9C0]/40 text-[11px] font-semibold">
                      {exercise.equipment}
                    </span>
                  </div>
                </div>

                {/* Checkbox Botón */}
                <button
                  type="button"
                  onClick={() => toggleCompleteExercise(exercise.id)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs ${
                    isDone
                      ? 'bg-[#6E9E93] text-white'
                      : 'bg-[#FAF6F0] text-[#2E3A36]/70 border border-[#AEC9C0]/60 hover:border-[#6E9E93]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Completado' : 'Marcar'}</span>
                </button>
              </div>

              {/* Series x Repeticiones & Descanso */}
              <div className="grid grid-cols-2 gap-2 bg-[#FAF6F0] p-3 rounded-2xl border border-[#AEC9C0]/40 text-xs">
                <div>
                  <span className="text-[#2E3A36]/60 text-[10px] uppercase font-mono block">
                    Prescripción:
                  </span>
                  <strong className="text-[#2E3A36] font-bold">
                    {exercise.setsAndReps}
                  </strong>
                </div>
                <div>
                  <span className="text-[#2E3A36]/60 text-[10px] uppercase font-mono block">
                    Descanso:
                  </span>
                  <strong className="text-[#6E9E93] font-bold">
                    {exercise.restTime}
                  </strong>
                </div>
              </div>

              {/* Tips de Ejecución */}
              <div className="text-xs text-[#2E3A36]/80 flex items-start space-x-2 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-[#6E9E93] flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#2E3A36]">Técnica segura:</strong> {exercise.executionTips}
                </p>
              </div>

              {/* Video Embebido de YouTube */}
              <div className="pt-2 border-t border-[#AEC9C0]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2E3A36] flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-[#6E9E93]" />
                    <span>Demostración técnica en video</span>
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${exercise.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#6E9E93] hover:underline flex items-center space-x-1"
                  >
                    <span>Abrir en YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#2E3A36]/10 border border-[#AEC9C0]/60 shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${exercise.youtubeId}?rel=0&modestbranding=1`}
                    title={`Demostración técnica de ${exercise.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Nota Clínica */}
      <div className="p-4 bg-[#FAF6F0] rounded-3xl border border-[#AEC9C0]/60 text-xs text-[#2E3A36]/80 space-y-1">
        <div className="flex items-center space-x-1.5 text-[#6E9E93] font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Principio de Sobrecarga Progresiva</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          No necesitas aumentar el peso en cada sesión. Mejorar tu técnica, controlar la bajada en 3 segundos o hacer 1 repetición más con la misma carga ya constituye un estímulo neuromuscular efectivo para no perder masa muscular.
        </p>
      </div>
    </div>
  );
};
