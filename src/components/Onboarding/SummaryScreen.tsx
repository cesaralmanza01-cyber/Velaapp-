import React from 'react';
import { OnboardingData, CalculatedMetrics } from '../../types';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Flame,
  Dumbbell,
} from 'lucide-react';

interface SummaryScreenProps {
  onboardingData: OnboardingData;
  metrics: CalculatedMetrics;
  onGeneratePlan: () => void;
  onBack: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  onboardingData,
  metrics,
  onGeneratePlan,
  onBack,
}) => {
  const displayName =
    onboardingData.preferredName || onboardingData.name?.split(' ')[0] || 'Paciente';

  const muscleGoalLabels = {
    conservadora: 'Mantener masa (0 kg/mes)',
    moderada: '+0.25 a 0.5 kg/mes (Recomposición)',
    maxima: '+0.5 a 1.0 kg/mes (Máxima)',
  };

  const trainingModalityLabels = {
    casa_corta: 'Rutina corta en casa (15-20 min, 3d/sem)',
    guiada_larga: 'Rutina larga casa/gimnasio (1h, 6d/sem)',
    gimnasio_pdf: 'Rutina en PDF para gimnasio tradicional',
    personalizado: 'Personalizado',
  };

  return (
    <div className="max-w-2xl mx-auto p-4 text-[#2E3A36] space-y-6 pb-12 font-sans">
      {/* Encabezado Personalizado */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6E9E93]/15 rounded-full text-xs font-bold text-[#6E9E93] border border-[#6E9E93]/30">
          <HeartPulse className="w-4 h-4" />
          <span>Diagnóstico Metabólico Clínico Oficial</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2E3A36]">
          {displayName}, ya conocemos tu cuerpo y tu fisiología
        </h2>
        <p className="text-xs text-[#2E3A36]/75 max-w-md mx-auto leading-relaxed">
          Evaluación clínica individualizada por la Dra. Lorena Castro.
        </p>
      </div>

      {/* Tarjeta de Prioridad Biológica */}
      <div className="bg-white border-2 border-[#6E9E93] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#6E9E93] bg-[#6E9E93]/10 px-3 py-1 rounded-full border border-[#6E9E93]/20">
            Prioridad Fisiológica Detectada
          </span>
          <Sparkles className="w-5 h-5 text-[#6E9E93]" />
        </div>
        <h3 className="text-lg font-bold text-[#2E3A36]">
          {metrics.priorityDetected}
        </h3>
        <p className="text-xs text-[#2E3A36]/80 leading-relaxed">
          Tu plan de nutrición se configurará específicamente para sincronizar esta vía metabólica antes de buscar un déficit agresivo, protegiendo tu tiroides y tus niveles de energía diurnos.
        </p>

        {/* Ajustes Médicos si aplican */}
        {metrics.medicalAdjustmentsApplied && metrics.medicalAdjustmentsApplied.length > 0 && (
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/50 rounded-2xl p-3.5 space-y-2 pt-3 mt-2">
            <div className="text-xs font-semibold text-[#8FAFD1] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Ajustes Clínicos Activos:
            </div>
            <ul className="space-y-1.5">
              {metrics.medicalAdjustmentsApplied.map((adj, idx) => (
                <li key={idx} className="text-[11px] text-[#2E3A36]/85 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8FAFD1] mt-1 flex-shrink-0" />
                  <span>{adj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Grid de Métricas Cuantitativas (Azul Confianza para datos clínicos) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* IMC */}
        <div className="bg-white border border-[#AEC9C0]/60 p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#2E3A36]/60 uppercase tracking-wider block">
            IMC
          </span>
          <div className="text-xl font-bold text-[#8FAFD1] font-mono">{metrics.bmi}</div>
          <span className="text-[10px] font-medium text-[#2E3A36]/75 block truncate">
            {metrics.bmiCategory}
          </span>
        </div>

        {/* Grasa Corporal */}
        <div className="bg-white border border-[#AEC9C0]/60 p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#2E3A36]/60 uppercase tracking-wider block">
            Grasa Corporal
          </span>
          <div className="text-xl font-bold text-[#8FAFD1] font-mono">{metrics.bodyFatPercent}%</div>
          <span className="text-[10px] font-medium text-[#2E3A36]/75 block truncate">
            {metrics.bodyFatCategory}
          </span>
        </div>

        {/* Masa Muscular */}
        <div className="bg-white border border-[#AEC9C0]/60 p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#2E3A36]/60 uppercase tracking-wider block">
            Masa Magra
          </span>
          <div className="text-xl font-bold text-[#8FAFD1] font-mono">{metrics.muscleMassKg} kg</div>
          <span className="text-[10px] font-medium text-[#2E3A36]/75 block truncate">
            {metrics.muscleMassPercent}% del peso
          </span>
        </div>

        {/* Test Sit-to-Stand */}
        <div className="bg-white border border-[#AEC9C0]/60 p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-[#2E3A36]/60 uppercase tracking-wider block">
            Sit-to-Stand 30s
          </span>
          <div className="text-xl font-bold text-[#8FAFD1] font-mono">{metrics.sitToStandReps} reps</div>
          <span className="text-[10px] font-medium text-[#2E3A36]/75 block truncate">
            {metrics.sitToStandCategory}
          </span>
        </div>
      </div>

      {/* Metas Seleccionadas (Grasa y Músculo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-[#AEC9C0]/60 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E9E93] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Meta de Déficit / Grasa
          </span>
          <div className="text-sm font-bold text-[#2E3A36]">
            {metrics.selectedGoal?.replace('_', ' ').toUpperCase() || 'PÉRDIDA MODERADA'}
          </div>
          <span className="text-xs text-[#2E3A36]/75 block">
            Objetivo: De {onboardingData.weightKg}kg a {onboardingData.targetWeightKg || metrics.targetWeightKg}kg (~{onboardingData.monthsToGoal || metrics.monthsToGoal} meses)
          </span>
        </div>

        <div className="bg-white border border-[#AEC9C0]/60 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E9E93] flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" />
            Meta Muscular y Modalidad
          </span>
          <div className="text-sm font-bold text-[#2E3A36]">
            {onboardingData.muscleGoal ? muscleGoalLabels[onboardingData.muscleGoal] : 'Preservación y Tono (+0.25 - 0.5kg/mes)'}
          </div>
          <span className="text-xs text-[#2E3A36]/75 block truncate">
            {onboardingData.trainingModality ? trainingModalityLabels[onboardingData.trainingModality] : 'Rutina estructurada'}
          </span>
        </div>
      </div>

      {/* Desglose Clínico de GEB, NEAT y Ejercicio */}
      <div className="bg-white border border-[#AEC9C0]/60 rounded-3xl p-5 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-[#2E3A36] flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#6E9E93]" />
          Balance Energético Individualizado (GET)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* GEB */}
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] text-[#2E3A36]/70 font-medium block">
              1. Basal (GEB)
            </span>
            <div className="text-xl font-extrabold text-[#8FAFD1] font-mono">
              {metrics.bmrKcal} <span className="text-xs text-[#2E3A36]/60">kcal</span>
            </div>
            <span className="text-[10px] text-[#2E3A36]/60 block">
              Fórmula: {metrics.bmrFormulaUsed}
            </span>
          </div>

          {/* NEAT */}
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] text-[#2E3A36]/70 font-medium block">
              2. Actividad Diaria (NEAT)
            </span>
            <div className="text-xl font-extrabold text-[#8FAFD1] font-mono">
              {metrics.neatKcal} <span className="text-xs text-[#2E3A36]/60">kcal</span>
            </div>
            <span className="text-[10px] text-[#2E3A36]/60 block">
              Factor ×{metrics.neatFactor} ({onboardingData.neatActivityLevel || onboardingData.neatLevel})
            </span>
          </div>

          {/* Ejercicio METs */}
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] text-[#2E3A36]/70 font-medium block">
              3. Ejercicio (METs)
            </span>
            <div className="text-xl font-extrabold text-[#8FAFD1] font-mono">
              +{metrics.exerciseKcalDaily} <span className="text-xs text-[#2E3A36]/60">kcal/día</span>
            </div>
            <span className="text-[10px] text-[#2E3A36]/60 block">
              MET {metrics.exerciseMetUsed} ({onboardingData.exerciseDaysPerWeek}d/sem)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-[#AEC9C0]/20 border border-[#AEC9C0]/60 rounded-2xl gap-2">
          <div className="text-xs text-[#2E3A36]">
            <strong>Gasto Total Diario (GET):</strong> {metrics.tdeeKcal} kcal
            <span className="text-[#2E3A36]/70 block text-[11px]">
              Meta calórica prescrita: <strong className="text-[#6E9E93]">{metrics.targetKcal} kcal/día</strong> (Piso seguro: {metrics.minSafeCalories} kcal)
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#6E9E93] text-white font-bold text-xs">
            {metrics.targetKcal} kcal
          </span>
        </div>
      </div>

      {/* Distribución de Macronutrientes Clínicos */}
      <div className="bg-white border border-[#AEC9C0]/60 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#2E3A36] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#6E9E93]" />
            Distribución de Macronutrientes Clínicos
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6E9E93]/15 text-[#6E9E93] text-[11px] font-bold border border-[#6E9E93]/30">
            Piso Carbs ≥100g ✓
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Proteína */}
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-bold text-[#6E9E93] uppercase tracking-wider block">
              Proteína (2.0g/kg)
            </span>
            <div className="text-2xl font-extrabold text-[#2E3A36] font-mono">
              {metrics.proteinGrams}g
            </div>
            <span className="text-[10px] text-[#2E3A36]/60 font-mono block">
              {metrics.proteinKcal} kcal ({(metrics.proteinKcal / metrics.targetKcal * 100).toFixed(0)}%)
            </span>
          </div>

          {/* Grasas */}
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-bold text-[#6E9E93] uppercase tracking-wider block">
              Grasas (0.8g/kg)
            </span>
            <div className="text-2xl font-extrabold text-[#2E3A36] font-mono">
              {metrics.fatGrams}g
            </div>
            <span className="text-[10px] text-[#2E3A36]/60 font-mono block">
              {metrics.fatKcal} kcal ({(metrics.fatKcal / metrics.targetKcal * 100).toFixed(0)}%)
            </span>
          </div>

          {/* Carbohidratos */}
          <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-bold text-[#8FAFD1] uppercase tracking-wider block">
              Carbohidratos
            </span>
            <div className="text-2xl font-extrabold text-[#2E3A36] font-mono">
              {metrics.carbsGrams}g
            </div>
            <span className="text-[10px] text-[#2E3A36]/60 font-mono block">
              {metrics.carbsKcal} kcal ({(metrics.carbsKcal / metrics.targetKcal * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Tiempos de Comida Activos */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-[#2E3A36]/80 block mb-2">
            Reparto proporcional en tus {metrics.mealDistributions.length} comidas activas:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {metrics.mealDistributions.map((m) => (
              <div
                key={m.mealKey}
                className="bg-[#FAF6F0] border border-[#AEC9C0]/50 p-2.5 rounded-xl text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-[#2E3A36] block">{m.mealName}</span>
                  <span className="text-[10px] text-[#2E3A36]/60 font-mono">{m.timeSuggestion}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#6E9E93] font-bold font-mono">{m.caloriesKcal} kcal</span>
                  <span className="text-[10px] text-[#2E3A36]/60 block font-mono">{m.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fase de Mantenimiento Incluida (Mes 3 Fijo) */}
      <div className="bg-[#FAF6F0] border border-[#6E9E93]/60 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-2xl bg-[#6E9E93] text-white flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-[#2E3A36]">
          <div className="font-serif font-bold text-sm text-[#2E3A36] flex items-center gap-2">
            <span>Fase de Mantenimiento Incluida</span>
            <span className="px-2 py-0.5 rounded-full bg-[#6E9E93]/20 text-[#6E9E93] text-[10px] font-mono font-bold">
              Mes 3 Fijo
            </span>
          </div>
          <p className="leading-relaxed text-[#2E3A36]/85 font-medium">
            Fase de mantenimiento incluida. Después del mes 3 tu plan debe modificarse de acuerdo a tu nueva composición corporal. Te acompañamos paso a paso en tu meta.
          </p>
        </div>
      </div>

      {/* Nota médica */}
      <div className="text-center">
        <p className="text-[11px] text-[#2E3A36]/60 font-medium">
          Este informe metabólico es una guía clínica orientativa y no reemplaza tu consulta médica o nutricional presencial.
        </p>
      </div>

      {/* Botones de Navegación */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3.5 px-5 bg-white hover:bg-[#FAF6F0] text-[#2E3A36] rounded-2xl text-xs font-semibold flex items-center gap-2 border border-[#AEC9C0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Ajustar Ritmo
        </button>

        <button
          type="button"
          onClick={onGeneratePlan}
          className="py-3.5 px-7 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-[0.99] text-white rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all ml-auto cursor-pointer"
        >
          Generar Plan de Comidas Clínico
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
