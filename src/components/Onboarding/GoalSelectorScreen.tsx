import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateProjectionData } from '../../utils/metabolicCalc';
import { GoalOptionKey, CalculatedMetrics } from '../../types';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  Lock,
  Dumbbell,
  Sparkles,
  Flame,
} from 'lucide-react';

interface GoalSelectorScreenProps {
  currentWeightKg: number;
  metrics: CalculatedMetrics;
  onSelectGoal: (
    goalKey: GoalOptionKey,
    targetWeight: number,
    months: number,
    muscleGoal: 'conservadora' | 'moderada' | 'maxima'
  ) => void;
  onBack: () => void;
}

export const GoalSelectorScreen: React.FC<GoalSelectorScreenProps> = ({
  currentWeightKg,
  metrics,
  onSelectGoal,
  onBack,
}) => {
  const [selectedGoalKey, setSelectedGoalKey] = useState<GoalOptionKey>(
    metrics.selectedGoal || 'perdida_moderada'
  );

  const [selectedMuscleGoal, setSelectedMuscleGoal] = useState<'conservadora' | 'moderada' | 'maxima'>(
    'moderada'
  );

  const projection = generateProjectionData(currentWeightKg, selectedGoalKey);

  const handleContinue = () => {
    onSelectGoal(
      selectedGoalKey,
      projection.targetWeight,
      projection.monthsToGoal,
      selectedMuscleGoal
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4 text-[#2E3A36] space-y-6 pb-12 font-sans">
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6E9E93]/15 rounded-full text-xs font-bold text-[#6E9E93] border border-[#6E9E93]/30">
          <TrendingDown className="w-4 h-4" />
          <span>Frecuencia y Ritmo Metabólico Seguro</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2E3A36]">
          Elige tus metas de transformación
        </h2>
        <p className="text-xs text-[#2E3A36]/75 max-w-md mx-auto leading-relaxed">
          Diseñado por la Dra. Lorena Castro. Garantiza sostenibilidad protegiendo el 100% de tu masa muscular y piso seguro de carbohidratos (≥100g/día).
        </p>
      </div>

      {/* SECCIÓN 1: RITMO DE PÉRDIDA DE GRASA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E3A36]/80 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#6E9E93]" />
            1. Ritmo de Reducción de Grasa Corporal
          </span>
        </div>

        {metrics.availableGoals.map((goal) => {
          const isSelected = selectedGoalKey === goal.key;
          const isBlocked = !goal.isAllowed;

          return (
            <button
              key={goal.key}
              type="button"
              disabled={isBlocked}
              onClick={() => setSelectedGoalKey(goal.key)}
              className={`w-full p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                isBlocked
                  ? 'bg-[#FAF6F0] border-[#AEC9C0]/40 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-white border-[#6E9E93] ring-2 ring-[#6E9E93]/30 shadow-xs'
                  : 'bg-white border-[#AEC9C0]/60 hover:bg-[#FAF6F0] text-[#2E3A36]'
              }`}
            >
              {goal.isRecommended && (
                <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 bg-[#6E9E93] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-full shadow-xs">
                  Recomendado Clínico
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      isBlocked
                        ? 'border-[#AEC9C0] bg-[#FAF6F0] text-[#2E3A36]/40'
                        : isSelected
                        ? 'border-[#6E9E93] bg-[#6E9E93] text-white'
                        : 'border-[#AEC9C0] bg-white'
                    }`}
                  >
                    {isBlocked ? (
                      <Lock className="w-3 h-3 text-[#2E3A36]/60" />
                    ) : (
                      isSelected && <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#2E3A36] flex items-center gap-2">
                      {goal.label}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[#6E9E93] font-mono font-bold">
                        {goal.targetKcal} kcal/día
                      </span>
                      <span className="text-[#AEC9C0]">•</span>
                      <span className="text-[#2E3A36]/80 font-mono">
                        {goal.carbsGrams}g carbs/día
                      </span>
                      <span className="text-[#AEC9C0]">•</span>
                      <span className="text-[#2E3A36]/60">
                        {goal.deltaKcal < 0 ? `${goal.deltaKcal} kcal déficit` : `+${goal.deltaKcal} kcal superávit`}
                      </span>
                    </div>

                    {isBlocked && (
                      <div className="flex items-center gap-1.5 text-xs text-[#2E3A36] mt-1 bg-[#F2A488]/15 p-2 rounded-xl border border-[#F2A488]/40">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#2E3A36]" />
                        <span>{goal.blockReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* SECCIÓN 2: META DE GANANCIA / MANTENIMIENTO DE MÚSCULO */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E3A36]/80 flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-[#6E9E93]" />
            2. Meta de Masa Muscular (Mantenimiento o Recomposición)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              key: 'conservadora' as const,
              title: 'Conservadora',
              rate: 'Mantener masa (0 kg/mes)',
              desc: 'Preserva el 100% de tu masa magra actual con 2.0g/kg de proteína.',
            },
            {
              key: 'moderada' as const,
              title: 'Moderada',
              badge: 'Recomendada',
              rate: '+0.25 a 0.5 kg/mes',
              desc: 'Recomposición óptima: gana tono y firmeza mientras reduces grasa.',
            },
            {
              key: 'maxima' as const,
              title: 'Máxima',
              rate: '+0.5 a 1.0 kg/mes',
              desc: 'Estímulo hipertrófico alto con prioridad de rendimiento.',
            },
          ].map((item) => {
            const isSelected = selectedMuscleGoal === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedMuscleGoal(item.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#6E9E93] ring-2 ring-[#6E9E93]/30 shadow-xs'
                    : 'bg-white border-[#AEC9C0]/60 hover:bg-[#FAF6F0] text-[#2E3A36]'
                }`}
              >
                {item.badge && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-[#6E9E93] text-white font-bold text-[9px] rounded-full uppercase">
                    {item.badge}
                  </span>
                )}
                <div>
                  <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9E93]" />}
                    {item.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#6E9E93] font-semibold mt-1">
                    {item.rate}
                  </div>
                </div>
                <div className="text-[10px] text-[#2E3A36]/70 mt-2 leading-relaxed">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráfico y Métricas de Proyección (Azul Confianza para datos clínicos) */}
      <div className="bg-white border border-[#AEC9C0]/60 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-[#2E3A36]/60">Proyección Estimada</span>
            <div className="text-base font-bold text-[#2E3A36]">
              De {currentWeightKg} kg a {projection.targetWeight} kg
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-xs font-semibold text-[#2E3A36]/60">Tiempo al objetivo</span>
            <div className="text-base font-extrabold text-[#8FAFD1] font-mono">
              ~{projection.monthsToGoal} meses
            </div>
          </div>
        </div>

        {/* Gráfico de Área (Azul Confianza #8FAFD1) */}
        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection.chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8FAFD1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8FAFD1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="monthName" stroke="#AEC9C0" tick={{ fontSize: 11, fill: '#2E3A36' }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#AEC9C0" tick={{ fontSize: 11, fill: '#2E3A36' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF6F0',
                  borderRadius: '12px',
                  borderColor: '#AEC9C0',
                  color: '#2E3A36',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} kg`, 'Peso Estimado']}
              />
              <Area
                type="monotone"
                dataKey="peso"
                stroke="#8FAFD1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 text-xs text-[#2E3A36] space-y-1">
          <div className="flex items-center gap-1.5 text-[#6E9E93] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Compromiso Fisiológico Vela
          </div>
          <p className="text-[#2E3A36]/75 text-[11px] leading-relaxed">
            Manteniendo 2.0g/kg de proteína y grasas esenciales (0.8g/kg), tu reducción será de grasa corporal, preservando tu metabolismo basal para una transformación sostenible sin perder masa muscular.
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-5 bg-white hover:bg-[#FAF6F0] text-[#2E3A36] rounded-xl text-xs font-semibold flex items-center gap-2 border border-[#AEC9C0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Modificar Datos
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="py-3 px-6 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-[0.99] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-all ml-auto cursor-pointer"
        >
          Confirmar y Ver Diagnóstico
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
