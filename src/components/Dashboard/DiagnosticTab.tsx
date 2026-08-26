import React, { useState } from 'react';
import {
  CalculatedMetrics,
  MeasurementHistoryEntry,
  HungerTrackerEntry,
  CircumferenceMeasurements,
  WellbeingEntry,
  WellbeingFeelingLevel,
  WellbeingComparison,
  OnboardingData,
} from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import { SitToStandWidget } from '../Onboarding/SitToStandWidget';
import { HungerTrackerWidget } from './HungerTrackerWidget';
import { BodyCompositionCharacter } from '../Common/BodyCompositionCharacter';
import { evaluateClinicalStagnation, generateProjectionData } from '../../utils/metabolicCalc';
import {
  Activity,
  Plus,
  TrendingDown,
  Sparkles,
  Flame,
  Brain,
  ShieldCheck,
  Calendar,
  X,
  Ruler,
  Smile,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Dumbbell,
  Target,
  Check,
  Info,
  Clock,
} from 'lucide-react';

interface DiagnosticTabProps {
  metrics: CalculatedMetrics;
  onboarding?: OnboardingData;
  history: MeasurementHistoryEntry[];
  onAddMeasurement: (entry: MeasurementHistoryEntry) => void;
}

export const DiagnosticTab: React.FC<DiagnosticTabProps> = ({
  metrics,
  onboarding,
  history,
  onAddMeasurement,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const currentWeight = onboarding?.weightKg || 70;
  const [newWeight, setNewWeight] = useState<number>(currentWeight);
  const [newFat, setNewFat] = useState<number>(metrics.bodyFatPercent || 28);
  const [newSitToStand, setNewSitToStand] = useState<number>(metrics.sitToStandReps || 14);

  // Perimetría opcional
  const [waist, setWaist] = useState<string>('');
  const [hip, setHip] = useState<string>('');
  const [arm, setArm] = useState<string>('');
  const [thigh, setThigh] = useState<string>('');

  // Sensación de bienestar
  const [wellbeingScore, setWellbeingScore] = useState<WellbeingFeelingLevel>(4);
  const [wellbeingComp, setWellbeingComp] = useState<WellbeingComparison>('mejor');
  const [wellbeingNotes, setWellbeingNotes] = useState<string>('');

  // Hambre y ruido mental
  const [newHunger, setNewHunger] = useState<HungerTrackerEntry>({
    physicalHunger: 3,
    mentalFoodNoise: 2,
    timeContext: 'Tarde',
  });

  // Cálculo de fechas sugeridas de próximo control (21 y 28 días)
  const formatSuggestedControlDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    return target.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const nextFatControlDate = formatSuggestedControlDate(21); // 3 semanas
  const nextMuscleControlDate = formatSuggestedControlDate(28); // 4 semanas

  // Interpretación humana empática para IMC
  const getBmiHumanInterpretation = (bmi: number, category: string) => {
    if (bmi < 18.5) {
      return {
        headline: 'Bajo peso fisiológico',
        description: 'Priorizamos nutrir tu masa muscular y aumentar densidad ósea con calorías limpias y saciantes.',
        badgeColor: 'text-[#8FAFD1] bg-[#8FAFD1]/15',
      };
    }
    if (bmi >= 18.5 && bmi < 25) {
      return {
        headline: 'Rango Saludable Óptimo',
        description: 'Tu relación peso-talla está en equilibrio. El plan se enfoca en tonificación, afinamiento de grasa y vitalidad.',
        badgeColor: 'text-[#6E9E93] bg-[#6E9E93]/15',
      };
    }
    if (bmi >= 25 && bmi < 30) {
      return {
        headline: 'Sobrepeso Fisiológico Leve',
        description: 'Excelente ventana para movilizar grasa corporal cuidando el 100% de tu masa magra con déficit controlado.',
        badgeColor: 'text-[#8FAFD1] bg-[#8FAFD1]/15',
      };
    }
    if (bmi >= 30 && bmi < 35) {
      return {
        headline: 'Optimización Metabólica (Grado I)',
        description: 'Enfoque prioritario en desinflamación celular, control de glucosa y pérdida de grasa progresiva y cómoda.',
        badgeColor: 'text-[#F2A488] bg-[#F2A488]/15',
      };
    }
    return {
      headline: 'Acompañamiento Clínico Continuo',
      description: 'Prescripción médica personalizada con protección articular, saciedad continua y monitoreo estrecho.',
      badgeColor: 'text-[#F2A488] bg-[#F2A488]/15',
    };
  };

  // Cálculo de kilos de grasa estimada
  const fatPercent = metrics.bodyFatPercent || 28;
  const fatKg = ((fatPercent / 100) * currentWeight).toFixed(1);
  const muscleKg = (metrics.muscleMassKg || (currentWeight * 0.7)).toFixed(1);

  const bmiHuman = getBmiHumanInterpretation(metrics.bmi, metrics.bmiCategory);

  // Proyección de meta de pérdida de grasa
  const selectedGoalKey = metrics.selectedGoal || 'perdida_moderada';
  const projection = generateProjectionData(currentWeight, selectedGoalKey);

  // Porcentaje y kilos objetivo de grasa
  const targetFatReductionPercent =
    selectedGoalKey === 'perdida_rapida' ? 6.5 : selectedGoalKey === 'perdida_moderada' ? 5.0 : 3.5;
  const targetFatPercent = Math.max(
    onboarding?.gender === 'masculino' ? 12 : 20,
    parseFloat((fatPercent - targetFatReductionPercent).toFixed(1))
  );
  const targetWeight = projection.targetWeight || currentWeight - 4;
  const targetFatKg = ((targetFatPercent / 100) * targetWeight).toFixed(1);
  const fatToLoseKg = (parseFloat(fatKg) - parseFloat(targetFatKg)).toFixed(1);

  // Generación de puntos para la gráfica 1: Meta de Pérdida de Grasa (Hoy -> Meta)
  const fatChartData = [
    {
      period: 'Hoy',
      label: 'Hoy (Control)',
      isCurrentControl: true,
      grasaPercent: fatPercent,
      grasaKg: parseFloat(fatKg),
      targetRef: targetFatPercent,
    },
    {
      period: 'Semana 2',
      label: 'Control 1',
      isCurrentControl: false,
      grasaPercent: parseFloat((fatPercent - targetFatReductionPercent * 0.25).toFixed(1)),
      grasaKg: parseFloat((parseFloat(fatKg) - parseFloat(fatToLoseKg) * 0.25).toFixed(1)),
      targetRef: targetFatPercent,
    },
    {
      period: 'Semana 4',
      label: 'Control 2',
      isCurrentControl: false,
      grasaPercent: parseFloat((fatPercent - targetFatReductionPercent * 0.5).toFixed(1)),
      grasaKg: parseFloat((parseFloat(fatKg) - parseFloat(fatToLoseKg) * 0.5).toFixed(1)),
      targetRef: targetFatPercent,
    },
    {
      period: 'Semana 8',
      label: 'Control 3',
      isCurrentControl: false,
      grasaPercent: parseFloat((fatPercent - targetFatReductionPercent * 0.8).toFixed(1)),
      grasaKg: parseFloat((parseFloat(fatKg) - parseFloat(fatToLoseKg) * 0.8).toFixed(1)),
      targetRef: targetFatPercent,
    },
    {
      period: `Semana ${projection.monthsToGoal ? projection.monthsToGoal * 4 : 12}`,
      label: 'Meta Final',
      isCurrentControl: false,
      grasaPercent: targetFatPercent,
      grasaKg: parseFloat(targetFatKg),
      targetRef: targetFatPercent,
    },
  ];

  // Gráfica 2: Meta de Ganancia / Mantenimiento de Músculo
  // Aplica para todos los pacientes con plan nutricional de recomposición y fuerza
  const isMuscleGoalApplicable = true;
  const muscleGoalType = onboarding?.selectedMuscleGoal || 'moderada';
  const muscleGainDelta =
    muscleGoalType === 'maxima' ? 1.2 : muscleGoalType === 'moderada' ? 0.6 : 0.2;
  const targetMuscleKg = (parseFloat(muscleKg) + muscleGainDelta).toFixed(1);

  const muscleChartData = [
    {
      period: 'Hoy',
      label: 'Hoy (Control)',
      isCurrentControl: true,
      musculoKg: parseFloat(muscleKg),
      targetRef: parseFloat(targetMuscleKg),
    },
    {
      period: 'Semana 2',
      label: 'Control 1',
      isCurrentControl: false,
      musculoKg: parseFloat((parseFloat(muscleKg) + muscleGainDelta * 0.2).toFixed(1)),
      targetRef: parseFloat(targetMuscleKg),
    },
    {
      period: 'Semana 4',
      label: 'Control 2',
      isCurrentControl: false,
      musculoKg: parseFloat((parseFloat(muscleKg) + muscleGainDelta * 0.45).toFixed(1)),
      targetRef: parseFloat(targetMuscleKg),
    },
    {
      period: 'Semana 8',
      label: 'Control 3',
      isCurrentControl: false,
      musculoKg: parseFloat((parseFloat(muscleKg) + muscleGainDelta * 0.75).toFixed(1)),
      targetRef: parseFloat(targetMuscleKg),
    },
    {
      period: `Semana ${projection.monthsToGoal ? projection.monthsToGoal * 4 : 12}`,
      label: 'Meta Músculo',
      isCurrentControl: false,
      musculoKg: parseFloat(targetMuscleKg),
      targetRef: parseFloat(targetMuscleKg),
    },
  ];

  // Evaluación de estancamiento (3 señales)
  const stagnationEval = evaluateClinicalStagnation(history);

  // Guardar medición
  const handleSaveMeasurement = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const circumferences: CircumferenceMeasurements = {};
    if (waist && !isNaN(Number(waist))) circumferences.waistCm = Number(waist);
    if (hip && !isNaN(Number(hip))) circumferences.hipCm = Number(hip);
    if (arm && !isNaN(Number(arm))) circumferences.armCm = Number(arm);
    if (thigh && !isNaN(Number(thigh))) circumferences.thighCm = Number(thigh);

    const wellbeing: WellbeingEntry = {
      score: wellbeingScore,
      comparison: wellbeingComp,
      notes: wellbeingNotes.trim() ? wellbeingNotes.trim() : undefined,
    };

    onAddMeasurement({
      id: Date.now().toString(),
      date: todayStr,
      weightKg: newWeight,
      bodyFatPercent: newFat,
      sitToStandReps: newSitToStand,
      circumferences: Object.keys(circumferences).length > 0 ? circumferences : undefined,
      wellbeing,
      hungerTracker: newHunger,
    });
    setShowAddModal(false);
  };

  const latestEntryWithCirc = [...history]
    .reverse()
    .find((h) => h.circumferences && Object.keys(h.circumferences).length > 0);
  const latestEntryWithWellbeing = [...history].reverse().find((h) => h.wellbeing);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 text-[#2E3A36] space-y-6 pb-28">
      
      {/* 1. ENCABEZADO DEL DIAGNÓSTICO */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#AEC9C0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#6E9E93] uppercase font-mono tracking-wider">
              Diagnóstico Fisiológico
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#8FAFD1]/20 text-[#2E3A36] text-[10px] font-mono font-bold">
              {metrics.bmrFormulaUsed}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-[#2E3A36] mt-0.5">
            Diagnóstico & Composición Corporal
          </h2>
          <p className="text-xs text-[#2E3A36]/70 mt-1">
            Monitoreo clínico continuo de grasa, masa magra y evolución hacia tus metas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Check-in</span>
        </button>
      </div>

      {/* 2. TARJETAS PRINCIPALES: IMC & GRASA ESTIMADA (% Y KG) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Tarjeta 1: IMC (Número + Interpretación Humana) */}
        <div className="bg-white border border-[#AEC9C0] p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E3A36]/70 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#8FAFD1]" />
              <span>Índice de Masa Corporal (IMC)</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${bmiHuman.badgeColor}`}>
              {metrics.bmiCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-serif font-black text-[#2E3A36]">
              {metrics.bmi}
            </span>
            <span className="text-xs text-[#2E3A36]/60 font-mono">kg/m²</span>
          </div>

          {/* Interpretación Humana */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-1">
            <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#8FAFD1]" />
              <span>{bmiHuman.headline}</span>
            </div>
            <p className="text-xs text-[#2E3A36]/80 leading-relaxed">
              {bmiHuman.description}
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Grasa Estimada (% y kg) */}
        <div className="bg-white border border-[#AEC9C0] p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E3A36]/70 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#6E9E93]" />
              <span>Grasa Corporal Estimada</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#6E9E93]/15 text-[#6E9E93] text-xs font-bold font-mono">
              {metrics.bodyFatCategory}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-serif font-black text-[#2E3A36]">
                {fatPercent}%
              </span>
              <span className="text-xs text-[#2E3A36]/60 font-mono">de grasa</span>
            </div>

            <div className="text-right">
              <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#6E9E93]">
                {fatKg} <span className="text-xs font-normal text-[#2E3A36]/70">kg</span>
              </div>
              <div className="text-[10px] text-[#2E3A36]/60 font-mono">tejido adiposo</div>
            </div>
          </div>

          {/* Interpretación Humana */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-1">
            <div className="text-xs font-bold text-[#2E3A36] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#6E9E93]" />
                <span>Meta Proyectada: {targetFatPercent}% ({targetFatKg} kg)</span>
              </span>
              <span className="text-[10px] font-mono text-[#6E9E93] font-bold">-{fatToLoseKg} kg grasa</span>
            </div>
            <p className="text-xs text-[#2E3A36]/80 leading-relaxed">
              Déficit seguro para movilizar tejido adiposo subcutáneo y visceral protegiendo tu masa magra funcional.
            </p>
          </div>
        </div>

      </div>

      {/* TARJETA DE ILUSTRACIÓN DE COMPOSICIÓN CORPORAL (PERSONAJE CON BADGES CONECTADAS) */}
      <div className="bg-white border border-[#AEC9C0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#AEC9C0]/40 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6E9E93]" />
            <h3 className="font-serif font-bold text-base text-[#2E3A36]">
              Mapa Visual de Composición Corporal
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#6E9E93]/15 text-[#6E9E93]">
            {fatPercent}% Grasa Estimada
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-2">
          <div className="w-full max-w-[280px]">
            <BodyCompositionCharacter
              fatPercent={fatPercent}
              gender={onboarding?.gender}
              heightCm={onboarding?.heightCm || 165}
              weightKg={currentWeight}
              muscleMassKg={muscleKg}
            />
          </div>

          <div className="space-y-2.5 text-xs text-[#2E3A36]/85 max-w-sm">
            <p className="font-medium leading-relaxed">
              Ilustración clínica de referencia sincronizada con tu última antropometría:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0]/50">
                <span className="text-[#6E9E93] font-bold block text-[10px]">ESTATURA</span>
                <span className="text-sm font-black text-[#2E3A36]">{onboarding?.heightCm || 165} cm</span>
              </div>
              <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#8FAFD1]/50">
                <span className="text-[#8FAFD1] font-bold block text-[10px]">PESO TOTAL</span>
                <span className="text-sm font-black text-[#2E3A36]">{currentWeight} kg</span>
              </div>
              <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#6E9E93]/50">
                <span className="text-[#6E9E93] font-bold block text-[10px]">% GRASA</span>
                <span className="text-sm font-black text-[#6E9E93]">{fatPercent}%</span>
              </div>
              <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#8FAFD1]/50">
                <span className="text-[#8FAFD1] font-bold block text-[10px]">MASA MAGRA</span>
                <span className="text-sm font-black text-[#8FAFD1]">{muscleKg} kg</span>
              </div>
            </div>
            <p className="text-[10px] text-[#2E3A36]/65 italic">
              Las etiquetas circulares conectadas reflejan tu distribución anatómica actual.
            </p>
          </div>
        </div>
      </div>

      {/* 3. DOS GRÁFICAS SEPARADAS DE LÍNEA: GRASA Y MÚSCULO */}
      
      {/* GRÁFICA 1: META DE PÉRDIDA DE GRASA */}
      <div className="bg-white border border-[#AEC9C0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#AEC9C0]/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#6E9E93]" />
              <h3 className="font-serif font-bold text-base text-[#2E3A36]">
                Meta de Pérdida de Grasa
              </h3>
            </div>
            <p className="text-xs text-[#2E3A36]/70 mt-0.5">
              Trayectoria de reducción grasa: Hoy ({fatPercent}%) → Meta ({targetFatPercent}%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6E9E93]/15 text-[#6E9E93] text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-[#6E9E93]" />
              Línea de Progreso
            </span>
          </div>
        </div>

        {/* Contenedor Gráfica de Línea Recharts */}
        <div className="h-48 sm:h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fatChartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#AEC9C0" strokeOpacity={0.3} />
              <XAxis
                dataKey="period"
                stroke="#2E3A36"
                tick={{ fontSize: 11, fill: '#2E3A36' }}
                tickLine={false}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#2E3A36"
                tick={{ fontSize: 11, fill: '#2E3A36' }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#2E3A36] text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-[#AEC9C0]/40">
                        <div className="font-bold text-[#AEC9C0] flex items-center gap-1.5">
                          <span>{data.period}</span>
                          {data.isCurrentControl && (
                            <span className="px-1.5 py-0.2 rounded bg-[#6E9E93] text-white text-[9px] font-mono uppercase">
                              Control Actual
                            </span>
                          )}
                        </div>
                        <div className="text-white font-mono">
                          Grasa: <b className="text-[#6E9E93]">{data.grasaPercent}%</b> ({data.grasaKg} kg)
                        </div>
                        <div className="text-[10px] text-white/70">
                          Meta final: {data.targetRef}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="grasaPercent"
                name="% Grasa"
                stroke="#6E9E93"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrentControl) {
                    return (
                      <svg key={`dot-${payload.period}`} x={cx - 8} y={cy - 8} width={16} height={16}>
                        <circle cx="8" cy="8" r="7" fill="#6E9E93" stroke="#FAF6F0" strokeWidth="3" />
                        <circle cx="8" cy="8" r="3" fill="#FAF6F0" />
                      </svg>
                    );
                  }
                  return (
                    <circle
                      key={`dot-${payload.period}`}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#6E9E93"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#6E9E93', stroke: '#2E3A36', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PRÓXIMO CONTROL SUGERIDO DEBAJO DE LA GRÁFICA */}
        <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#2E3A36]">
            <Calendar className="w-4 h-4 text-[#6E9E93] shrink-0" />
            <span className="font-medium text-[#2E3A36]/80">Próximo control sugerido:</span>
            <strong className="font-bold text-[#6E9E93] font-serif text-sm">{nextFatControlDate}</strong>
          </div>
          <span className="text-[11px] font-mono text-[#2E3A36]/60 bg-white px-2.5 py-1 rounded-xl border border-[#AEC9C0]/40">
            Frecuencia: Cada 3 semanas (Báscula + Perimetría)
          </span>
        </div>
      </div>

      {/* GRÁFICA 2: META DE GANANCIA/MANTENIMIENTO DE MÚSCULO (SOLO SI APLICA) */}
      {isMuscleGoalApplicable && (
        <div className="bg-white border border-[#AEC9C0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#AEC9C0]/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#8FAFD1]" />
                <h3 className="font-serif font-bold text-base text-[#2E3A36]">
                  Meta de Ganancia / Mantenimiento de Músculo
                </h3>
              </div>
              <p className="text-xs text-[#2E3A36]/70 mt-0.5">
                Preservación de masa magra: Hoy ({muscleKg} kg) → Meta ({targetMuscleKg} kg) con 2.0g/kg proteína
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8FAFD1]/20 text-[#2E3A36] text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-[#8FAFD1]" />
                Datos Clínicos Magros
              </span>
            </div>
          </div>

          {/* Contenedor Gráfica de Línea Recharts */}
          <div className="h-48 sm:h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={muscleChartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#AEC9C0" strokeOpacity={0.3} />
                <XAxis
                  dataKey="period"
                  stroke="#2E3A36"
                  tick={{ fontSize: 11, fill: '#2E3A36' }}
                  tickLine={false}
                />
                <YAxis
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  stroke="#2E3A36"
                  tick={{ fontSize: 11, fill: '#2E3A36' }}
                  unit="kg"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#2E3A36] text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-[#AEC9C0]/40">
                          <div className="font-bold text-[#AEC9C0] flex items-center gap-1.5">
                            <span>{data.period}</span>
                            {data.isCurrentControl && (
                              <span className="px-1.5 py-0.2 rounded bg-[#8FAFD1] text-[#2E3A36] text-[9px] font-mono font-bold uppercase">
                                Control Actual
                              </span>
                            )}
                          </div>
                          <div className="text-white font-mono">
                            Masa Magra: <b className="text-[#8FAFD1]">{data.musculoKg} kg</b>
                          </div>
                          <div className="text-[10px] text-white/70">
                            Meta preservación: {data.targetRef} kg
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="musculoKg"
                  name="Masa Magra"
                  stroke="#8FAFD1"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isCurrentControl) {
                      return (
                        <svg key={`dot-muscle-${payload.period}`} x={cx - 8} y={cy - 8} width={16} height={16}>
                          <circle cx="8" cy="8" r="7" fill="#8FAFD1" stroke="#FAF6F0" strokeWidth="3" />
                          <circle cx="8" cy="8" r="3" fill="#2E3A36" />
                        </svg>
                      );
                    }
                    return (
                      <circle
                        key={`dot-muscle-${payload.period}`}
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill="#8FAFD1"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: '#8FAFD1', stroke: '#2E3A36', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PRÓXIMO CONTROL SUGERIDO DEBAJO DE LA GRÁFICA */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#2E3A36]">
              <Calendar className="w-4 h-4 text-[#8FAFD1] shrink-0" />
              <span className="font-medium text-[#2E3A36]/80">Próximo control sugerido:</span>
              <strong className="font-bold text-[#8FAFD1] font-serif text-sm">{nextMuscleControlDate}</strong>
            </div>
            <span className="text-[11px] font-mono text-[#2E3A36]/60 bg-white px-2.5 py-1 rounded-xl border border-[#AEC9C0]/40">
              Frecuencia: Cada 4 semanas (Test Sit-to-Stand + Fuerza)
            </span>
          </div>
        </div>
      )}

      {/* 4. CHECKLIST FINAL "TUS METAS" */}
      <div className="bg-white border border-[#AEC9C0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#AEC9C0]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6E9E93]/20 flex items-center justify-center text-[#6E9E93]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2E3A36]">
                Tus Metas & Checkmarks de Progreso
              </h3>
              <p className="text-xs text-[#2E3A36]/70">
                Puntos de control clínico prescritos para asegurar éxito metabólico sostenido.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#6E9E93]/15 text-[#6E9E93]">
            Fase Activa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          
          {/* Bloque Meta 1: Pérdida de Grasa */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-serif text-[#2E3A36] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#6E9E93]" />
                <span>Meta 1: Reducción de Grasa Saludable</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-[#6E9E93]">
                {fatPercent}% → {targetFatPercent}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-[#2E3A36]">
                <Check className="w-4 h-4 text-[#6E9E93] shrink-0 mt-0.5" />
                <span>
                  <strong>Déficit calórico exacto:</strong> {metrics.targetKcal} kcal/día calculadas para proteger tu energía basal.
                </span>
              </div>

              <div className="flex items-start gap-2 text-[#2E3A36]">
                <Check className="w-4 h-4 text-[#6E9E93] shrink-0 mt-0.5" />
                <span>
                  <strong>Piso de carbohidratos seguros:</strong> {metrics.carbsGrams}g/día ({metrics.carbsPercent}%) para tiroides y sistema nervioso.
                </span>
              </div>

              <div className="flex items-start gap-2 text-[#2E3A36]">
                <Check className="w-4 h-4 text-[#6E9E93] shrink-0 mt-0.5" />
                <span>
                  <strong>Hidratación metabólica:</strong> 2.0 a 2.5 litros de agua diarios para facilitar lipólisis y excreción de toxinas.
                </span>
              </div>
            </div>
          </div>

          {/* Bloque Meta 2: Ganancia / Mantenimiento de Músculo */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-serif text-[#2E3A36] flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-[#8FAFD1]" />
                <span>Meta 2: Preservación de Masa Muscular</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-[#8FAFD1]">
                {muscleKg} kg → {targetMuscleKg} kg
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-[#2E3A36]">
                <Check className="w-4 h-4 text-[#8FAFD1] shrink-0 mt-0.5" />
                <span>
                  <strong>Aporte proteico clínico:</strong> 2.0 g/kg ({metrics.proteinGrams}g/día) para síntesis proteica miofibrilar.
                </span>
              </div>

              <div className="flex items-start gap-2 text-[#2E3A36]">
                <Check className="w-4 h-4 text-[#8FAFD1] shrink-0 mt-0.5" />
                <span>
                  <strong>Fuerza y Sit-to-Stand:</strong> {metrics.sitToStandReps} repeticiones actuales ({metrics.sitToStandCategory}).
                </span>
              </div>

              <div className="flex items-start gap-2 text-[#2E3A36]">
                <Check className="w-4 h-4 text-[#8FAFD1] shrink-0 mt-0.5" />
                <span>
                  <strong>Estímulo semanal:</strong> {onboarding?.exerciseDaysPerWeek || 3} sesiones semanales ({onboarding?.trainingPreference || 'Fuerza adaptada'}).
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FASE DE MANTENIMIENTO INCLUIDA (MES 3 FIJO) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF6F0] border border-[#6E9E93]/70 shadow-xs flex items-start gap-3.5">
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
          <p className="leading-relaxed text-[#2E3A36]/90 font-medium">
            Fase de mantenimiento incluida. Después del mes 3 tu plan debe modificarse de acuerdo a tu nueva composición corporal. Te acompañamos paso a paso en tu meta.
          </p>
        </div>
      </div>

      {/* 5. TARJETA DE EVALUACIÓN CLÍNICA DE LAS 3 SEÑALES (ESTANCAMIENTO VS PROGRESO) */}
      <div
        className={`p-5 rounded-3xl border shadow-xs space-y-3 ${
          stagnationEval.status === 'estancamiento_real'
            ? 'bg-white border-[#F2A488] ring-1 ring-[#F2A488]/40'
            : stagnationEval.status === 'recomposicion_corporal'
            ? 'bg-white border-[#8FAFD1] ring-1 ring-[#8FAFD1]/30'
            : 'bg-white border-[#6E9E93]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stagnationEval.status === 'estancamiento_real' ? (
              <AlertTriangle className="w-5 h-5 text-[#F2A488]" />
            ) : stagnationEval.status === 'recomposicion_corporal' ? (
              <Zap className="w-5 h-5 text-[#8FAFD1]" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#6E9E93]" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E3A36] font-mono">
              Evaluación de las 3 Señales Clínicas
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
              stagnationEval.status === 'estancamiento_real'
                ? 'bg-[#F2A488]/20 text-[#2E3A36]'
                : stagnationEval.status === 'recomposicion_corporal'
                ? 'bg-[#8FAFD1]/20 text-[#2E3A36]'
                : 'bg-[#6E9E93]/20 text-[#6E9E93]'
            }`}
          >
            {stagnationEval.badge}
          </span>
        </div>

        <h4 className="text-sm font-extrabold text-[#2E3A36] font-serif">{stagnationEval.title}</h4>
        <p className="text-xs text-[#2E3A36]/80 leading-relaxed">{stagnationEval.description}</p>

        {/* Las 3 Señales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-1">
            <span className="text-[10px] font-bold text-[#2E3A36]/60 block uppercase font-mono">1. Báscula</span>
            <div className="font-bold text-[#2E3A36] text-xs">{stagnationEval.signals.weightSignal.text}</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-1">
            <span className="text-[10px] font-bold text-[#2E3A36]/60 block uppercase font-mono">2. Medidas (Cintura/Cadera)</span>
            <div className="font-bold text-[#2E3A36] text-xs">{stagnationEval.signals.perimeterSignal.text}</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-1">
            <span className="text-[10px] font-bold text-[#2E3A36]/60 block uppercase font-mono">3. Bienestar & Energía</span>
            <div className="font-bold text-[#2E3A36] text-xs">{stagnationEval.signals.wellbeingSignal.text}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/60 flex items-start gap-2.5 text-xs text-[#2E3A36]">
          <ShieldCheck className="w-4 h-4 text-[#6E9E93] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#6E9E93]">Pauta Médica Dra. Lorena: </span>
            <span>{stagnationEval.clinicalAction}</span>
          </div>
        </div>
      </div>

      {/* 6. RESUMEN DE PERIMETRÍA Y SENSACIÓN DE BIENESTAR */}
      {(latestEntryWithCirc || latestEntryWithWellbeing) && (
        <div className="bg-white border border-[#AEC9C0] rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-[#6E9E93]" />
              <span>Último Reporte de Perimetría y Bienestar</span>
            </h3>
            <span className="text-[11px] font-mono text-[#2E3A36]/60">Check-in Reciente</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Medidas */}
            <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 space-y-1.5">
              <span className="text-[11px] font-bold text-[#2E3A36]/70 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-[#8FAFD1]" />
                <span>Medidas Corporales Registradas</span>
              </span>
              {latestEntryWithCirc?.circumferences ? (
                <div className="grid grid-cols-2 gap-2 text-[#2E3A36] pt-1 font-mono text-[11px]">
                  {latestEntryWithCirc.circumferences.waistCm && (
                    <span>Cintura: <b>{latestEntryWithCirc.circumferences.waistCm} cm</b></span>
                  )}
                  {latestEntryWithCirc.circumferences.hipCm && (
                    <span>Cadera: <b>{latestEntryWithCirc.circumferences.hipCm} cm</b></span>
                  )}
                  {latestEntryWithCirc.circumferences.armCm && (
                    <span>Brazo: <b>{latestEntryWithCirc.circumferences.armCm} cm</b></span>
                  )}
                  {latestEntryWithCirc.circumferences.thighCm && (
                    <span>Muslo: <b>{latestEntryWithCirc.circumferences.thighCm} cm</b></span>
                  )}
                </div>
              ) : (
                <p className="text-[#2E3A36]/50 text-[11px]">Sin registros de perimetría aún.</p>
              )}
            </div>

            {/* Sensación */}
            <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 space-y-1.5">
              <span className="text-[11px] font-bold text-[#2E3A36]/70 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-[#6E9E93]" />
                <span>Sensación General de Vitalidad</span>
              </span>
              {latestEntryWithWellbeing?.wellbeing ? (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#6E9E93]/20 text-[#6E9E93] text-[10px] font-bold font-mono uppercase">
                      Sensación: {latestEntryWithWellbeing.wellbeing.comparison}
                    </span>
                    <span className="text-[11px] font-mono text-[#2E3A36]/80">
                      Nivel {latestEntryWithWellbeing.wellbeing.score}/5
                    </span>
                  </div>
                  {latestEntryWithWellbeing.wellbeing.notes && (
                    <p className="text-[11px] text-[#2E3A36]/80 italic">
                      &quot;{latestEntryWithWellbeing.wellbeing.notes}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[#2E3A36]/50 text-[11px]">Sin reporte de sensación aún.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE REGISTRO DE CHECK-IN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FAF6F0] border border-[#AEC9C0] rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 text-[#2E3A36]">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#AEC9C0]/60">
              <div>
                <span className="text-[10px] font-bold text-[#6E9E93] uppercase font-mono tracking-wider block">
                  Seguimiento Integral
                </span>
                <h3 className="font-serif font-black text-lg text-[#2E3A36] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#6E9E93]" />
                  <span>Registrar Check-in Clínico</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-white border border-[#AEC9C0] text-[#2E3A36]/70 hover:text-[#2E3A36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECCIÓN 1: Peso y Grasa */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#AEC9C0]/60">
              <span className="text-xs font-bold text-[#2E3A36] uppercase font-mono tracking-wider block">
                1. Báscula y Composición
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2E3A36]">Peso actual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2E3A36]">% Grasa Corporal</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFat}
                    onChange={(e) => setNewFat(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Perimetría */}
            <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/60 space-y-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#8FAFD1]" />
                <div>
                  <span className="text-xs font-bold text-[#2E3A36] block">
                    2. Medidas corporales (opcional)
                  </span>
                  <span className="text-[11px] text-[#2E3A36]/60">
                    Registra las medidas en cm con cinta métrica
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#2E3A36]/70">Cintura (cm)</label>
                  <input
                    type="number"
                    placeholder="Ej. 78"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#2E3A36]/70">Cadera (cm)</label>
                  <input
                    type="number"
                    placeholder="Ej. 98"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#2E3A36]/70">Brazo (cm)</label>
                  <input
                    type="number"
                    placeholder="Ej. 29"
                    value={arm}
                    onChange={(e) => setArm(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#2E3A36]/70">Muslo (cm)</label>
                  <input
                    type="number"
                    placeholder="Ej. 56"
                    value={thigh}
                    onChange={(e) => setThigh(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Bienestar */}
            <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/60 space-y-3">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#6E9E93]" />
                <div>
                  <span className="text-xs font-bold text-[#2E3A36] block">
                    3. ¿Cómo te has sentido en general?
                  </span>
                  <span className="text-[11px] text-[#2E3A36]/60">
                    Tu energía, digestión y ajuste de ropa
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['peor', 'igual', 'mejor'] as WellbeingComparison[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWellbeingComp(opt)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      wellbeingComp === opt
                        ? opt === 'mejor'
                          ? 'bg-[#6E9E93] border-[#6E9E93] text-white shadow-xs'
                          : opt === 'igual'
                          ? 'bg-white border-[#2E3A36] text-[#2E3A36]'
                          : 'bg-[#F2A488]/20 border-[#F2A488] text-[#2E3A36]'
                        : 'bg-[#FAF6F0] border-[#AEC9C0]/60 text-[#2E3A36]/60 hover:text-[#2E3A36]'
                    }`}
                  >
                    {opt === 'mejor' ? '✨ Mejor' : opt === 'igual' ? '⚖️ Igual' : '📉 Menos energía'}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#2E3A36]/70">
                  <span>Nivel de vitalidad:</span>
                  <span className="font-bold text-[#6E9E93] font-mono">{wellbeingScore}/5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as WellbeingFeelingLevel[]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWellbeingScore(val)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        wellbeingScore === val
                          ? 'bg-[#6E9E93] text-white shadow-xs'
                          : 'bg-[#FAF6F0] text-[#2E3A36]/70 hover:bg-[#AEC9C0]/30'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-[#2E3A36]/70">
                  Notas adicionales (ropa más suelta, mejor descanso, etc.)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Siento la ropa más holgada y con más energía matutina"
                  value={wellbeingNotes}
                  onChange={(e) => setWellbeingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#AEC9C0]/80 rounded-xl text-[#2E3A36] text-xs"
                />
              </div>
            </div>

            {/* SECCIÓN 4: Sit-to-stand reevaluación */}
            <SitToStandWidget
              reps={newSitToStand}
              onRepsChange={(reps) => setNewSitToStand(reps)}
              age={onboarding?.age || 40}
              gender={onboarding?.gender || 'femenino'}
            />

            {/* SECCIÓN 5: Tracker de hambre en 2 ejes */}
            <HungerTrackerWidget
              value={newHunger}
              onChange={(val) => setNewHunger(val)}
            />

            <button
              type="button"
              onClick={handleSaveMeasurement}
              className="w-full py-3.5 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Guardar Check-in Clínico
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer Clínico */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-[#2E3A36]/60 leading-relaxed max-w-lg mx-auto">
          Este informe y sus proyecciones constituyen una guía clínica personalizada basada en tus datos de entrada y <span className="font-semibold text-[#2E3A36]/80">no reemplazan una consulta médica o nutricional profesional</span>.
        </p>
      </div>

    </div>
  );
};
