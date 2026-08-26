import React from 'react';
import { CalculatedMetrics, OnboardingData } from '../../types';
import { Flame, Activity, Zap, ShieldCheck, Heart, Sparkles, BookOpen, Info } from 'lucide-react';

interface CaloricAnalysisSummaryProps {
  metrics: CalculatedMetrics;
  onboarding?: OnboardingData;
  doctorName?: string;
}

export const CaloricAnalysisSummary: React.FC<CaloricAnalysisSummaryProps> = ({
  metrics,
  onboarding,
  doctorName = 'Dra. Lorena Castro',
}) => {
  const weightKg = onboarding?.weightKg || 70;
  const proteinGPerKg = (metrics.proteinGrams / weightKg).toFixed(1);
  const fatGPerKg = (metrics.fatGrams / weightKg).toFixed(1);
  const carbsGPerKg = (metrics.carbsGrams / weightKg).toFixed(1);

  const totalMacroKcal = metrics.proteinKcal + metrics.carbsKcal + metrics.fatKcal;
  const proteinPct = totalMacroKcal > 0 ? Math.round((metrics.proteinKcal / totalMacroKcal) * 100) : 30;
  const carbsPct = totalMacroKcal > 0 ? Math.round((metrics.carbsKcal / totalMacroKcal) * 100) : 45;
  const fatPct = totalMacroKcal > 0 ? Math.round((metrics.fatKcal / totalMacroKcal) * 100) : 25;

  const deficitKcal = metrics.tdeeKcal - metrics.targetKcal;

  const nutritips = [
    {
      num: '01',
      title: 'El orden de ingesta amortigua la curva de glucosa',
      text: 'Comienza tu comida con los vegetales (fibra viscosa), continúa con la proteína y grasas saludables, y consume los carbohidratos al final. Esto reduce el pico de insulina hasta un 35% y prolonga la saciedad por 3 a 4 horas.',
      tag: 'Bioquímica Glucémica',
    },
    {
      num: '02',
      title: 'Densidad calórica vs. Volumen gástrico',
      text: 'Las grasas saludables (aceite de oliva, aguacate, frutos secos) son indispensables para la síntesis de hormonas esteroideas, pero altamente energéticas. Usa cuchara medidora en lugar de verter al ojo.',
      tag: 'Regulación Hormonal',
    },
    {
      num: '03',
      title: 'El poder metabólico del almidón resistente tipo 3',
      text: 'Al cocinar papa, plátano verde o arroz y dejarlos enfriar en nevera antes de recalentar, parte de su almidón se retrograda. Esto alimenta a las bacterias productoras de butirato en tu colon y disminuye su absorción calórica.',
      tag: 'Microbiota y Fermentación',
    },
    {
      num: '04',
      title: 'Umbral de leucina y síntesis proteica (mTOR)',
      text: 'Cada comida principal debe alcanzar entre 25g y 35g de proteína de alto valor biológico para gatillar el sensor celular mTOR. Esto protege tu masa magra muscular aun estando en déficit calórico.',
      tag: 'Preservación Muscular',
    },
    {
      num: '05',
      title: 'Sincronía circadiana y vaciado gástrico nocturno',
      text: 'Procura finalizar tu última comida 2 a 3 horas antes de dormir. La digestión activa eleva la temperatura central corporal e inhibe la secreción de melatonina y la autofagia celular reparadora.',
      tag: 'Crononutrición',
    },
    {
      num: '06',
      title: 'Hambre homeostática vs. Búsqueda de dopamina',
      text: 'Ante un antojo súbito vespertino, bebe un vaso con agua fresca y pregúntate: "¿Me comería ahora una pechuga a la plancha con brócoli?". Si la respuesta es no, tu cerebro busca dopamina o descompresión del estrés, no glucosa.',
      tag: 'Eje Neurobiológico',
    },
  ];

  return (
    <div className="bg-[#FAF6F0] rounded-3xl p-5 sm:p-7 border border-[#AEC9C0]/60 shadow-xs space-y-6 text-[#2E3A36]">
      {/* Título de Sección */}
      <div className="flex items-center justify-between border-b border-[#AEC9C0]/40 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#6E9E93]" />
            <h3 className="text-xl font-bold font-serif text-[#2E3A36]">
              Análisis Calórico & Prescripción Metabólica
            </h3>
          </div>
          <p className="text-xs text-[#2E3A36]/70 mt-1">
            Fundamentos biológicos de tu plan nutricional individualizado
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 bg-[#6E9E93]/15 text-[#6E9E93] rounded-full text-xs font-bold font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Protocolo Clínico Vela</span>
        </span>
      </div>

      {/* Tarjetas GEB / GET / Déficit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* GEB */}
        <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/40 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3A36]/60 font-mono">
              GEB (Basal)
            </span>
            <Flame className="w-4 h-4 text-[#8FAFD1]" />
          </div>
          <div className="text-xl font-extrabold font-mono text-[#2E3A36]">
            {metrics.bmrKcal}{' '}
            <span className="text-xs font-normal text-[#2E3A36]/60">kcal/día</span>
          </div>
          <p className="text-[10px] text-[#2E3A36]/70 leading-tight">
            Gasto vital de tus órganos en reposo ({metrics.bmrFormulaUsed}).
          </p>
        </div>

        {/* GET */}
        <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/40 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3A36]/60 font-mono">
              GET (Total)
            </span>
            <Zap className="w-4 h-4 text-[#6E9E93]" />
          </div>
          <div className="text-xl font-extrabold font-mono text-[#2E3A36]">
            {metrics.tdeeKcal}{' '}
            <span className="text-xs font-normal text-[#2E3A36]/60">kcal/día</span>
          </div>
          <p className="text-[10px] text-[#2E3A36]/70 leading-tight">
            Mantenimiento total con NEAT (x{metrics.neatFactor}) + ejercicio.
          </p>
        </div>

        {/* Déficit */}
        <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/40 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3A36]/60 font-mono">
              Déficit Fisiológico
            </span>
            <Heart className="w-4 h-4 text-[#F2A488]" />
          </div>
          <div className="text-xl font-extrabold font-mono text-[#F2A488]">
            {deficitKcal > 0 ? `-${deficitKcal}` : deficitKcal < 0 ? `+${Math.abs(deficitKcal)}` : '0'}{' '}
            <span className="text-xs font-normal text-[#2E3A36]/60">kcal/día</span>
          </div>
          <p className="text-[10px] text-[#2E3A36]/70 leading-tight">
            Oxidación lipídica controlada sin activar alarma de inanición.
          </p>
        </div>
      </div>

      {/* Bloque Destacado: Calorías Objetivo */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-[#6E9E93]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#6E9E93] font-mono">
            Prescripción Calórica Diaria
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-serif text-[#2E3A36]">
            {metrics.targetKcal}{' '}
            <span className="text-base font-normal font-sans text-[#2E3A36]/70">kcal / día</span>
          </div>
          <p className="text-xs text-[#2E3A36]/80 max-w-md">
            Distribuidas estratégicamente entre tus {metrics.mealDistributions.length} tiempos de comida para mantener la saciedad constante y la síntesis muscular activa.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end space-y-1">
          <span className="px-3.5 py-1.5 rounded-full bg-[#6E9E93] text-white text-xs font-bold shadow-xs">
            Piso seguro: {metrics.minSafeCalories} kcal mín.
          </span>
          <span className="text-[11px] text-[#2E3A36]/60 font-mono">
            {metrics.carbsFloorMet ? '✓ Mínimo cerebral de glucosa garantizado' : 'Ajustado a seguridad clínica'}
          </span>
        </div>
      </div>

      {/* Barras de Macronutrientes */}
      <div className="space-y-3 bg-white p-5 rounded-3xl border border-[#AEC9C0]/40 shadow-2xs">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2E3A36]/70 font-mono flex items-center justify-between">
          <span>Distribución de Macronutrientes Clínicos</span>
          <span className="text-[11px] font-normal text-[#2E3A36]/60">Total: {metrics.targetKcal} kcal</span>
        </h4>

        {/* Barra Visual Conjunta */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#AEC9C0]/30">
          <div style={{ width: `${proteinPct}%` }} className="bg-[#6E9E93] h-full" title={`Proteína: ${proteinPct}%`} />
          <div style={{ width: `${carbsPct}%` }} className="bg-[#8FAFD1] h-full" title={`Carbohidratos: ${carbsPct}%`} />
          <div style={{ width: `${fatPct}%` }} className="bg-[#AEC9C0] h-full" title={`Grasas: ${fatPct}%`} />
        </div>

        {/* Desglose Individual */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Proteína */}
          <div className="p-3 rounded-2xl bg-[#6E9E93]/10 border border-[#6E9E93]/20 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#6E9E93] flex items-center gap-1">
                <span>🥩</span>
                <span>Proteínas</span>
              </span>
              <span className="font-mono font-bold text-[#6E9E93]">{proteinPct}%</span>
            </div>
            <div className="text-lg font-extrabold font-mono text-[#2E3A36]">
              {metrics.proteinGrams}g
            </div>
            <div className="text-[11px] text-[#2E3A36]/70 font-mono flex justify-between">
              <span>{proteinGPerKg} g/kg peso</span>
              <span>{metrics.proteinKcal} kcal</span>
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="p-3 rounded-2xl bg-[#8FAFD1]/10 border border-[#8FAFD1]/20 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#8FAFD1] flex items-center gap-1">
                <span>🥔</span>
                <span>Carbohidratos</span>
              </span>
              <span className="font-mono font-bold text-[#8FAFD1]">{carbsPct}%</span>
            </div>
            <div className="text-lg font-extrabold font-mono text-[#2E3A36]">
              {metrics.carbsGrams}g
            </div>
            <div className="text-[11px] text-[#2E3A36]/70 font-mono flex justify-between">
              <span>{carbsGPerKg} g/kg peso</span>
              <span>{metrics.carbsKcal} kcal</span>
            </div>
          </div>

          {/* Grasas */}
          <div className="p-3 rounded-2xl bg-[#AEC9C0]/25 border border-[#AEC9C0]/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2E3A36] flex items-center gap-1">
                <span>🥑</span>
                <span>Grasas Saludables</span>
              </span>
              <span className="font-mono font-bold text-[#2E3A36]">{fatPct}%</span>
            </div>
            <div className="text-lg font-extrabold font-mono text-[#2E3A36]">
              {metrics.fatGrams}g
            </div>
            <div className="text-[11px] text-[#2E3A36]/70 font-mono flex justify-between">
              <span>{fatGPerKg} g/kg peso</span>
              <span>{metrics.fatKcal} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Texto de Fase de Déficit */}
      <div className="p-4 rounded-2xl bg-[#AEC9C0]/20 border border-[#AEC9C0]/60 flex items-start space-x-3">
        <Info className="w-5 h-5 text-[#6E9E93] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#2E3A36] space-y-1">
          <strong className="font-bold text-[#2E3A36] block">
            Fase de Déficit Fisiológico Gradual y Conservación Muscular:
          </strong>
          <p className="text-[#2E3A36]/80 leading-relaxed">
            Tu déficit calórico de {deficitKcal} kcal está calculado con precisión metabólica para forzar la beta-oxidación de ácidos grasos en mitocondrias sin estresar tu tiroides ni elevar la hormona grelina (hambre descontrolada). Mantener tu aporte de {metrics.proteinGrams}g de proteína asegura que cada gramo perdido provenga de grasa corporal y no de masa muscular activa.
          </p>
        </div>
      </div>

      {/* 6 Nutritips Fijos de Educación Clínica */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#6E9E93]" />
          <h4 className="text-sm font-bold font-serif text-[#2E3A36]">
            6 Nutritips Clínicos de la Dra. Lorena Castro
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nutritips.map((tip) => (
            <div
              key={tip.num}
              className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/40 shadow-2xs space-y-2 hover:border-[#6E9E93]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold font-mono text-[#6E9E93] bg-[#6E9E93]/15 px-2 py-0.5 rounded-md">
                  TEMA {tip.num}
                </span>
                <span className="text-[10px] font-bold text-[#2E3A36]/60 uppercase tracking-wider font-mono">
                  {tip.tag}
                </span>
              </div>
              <h5 className="text-xs font-bold text-[#2E3A36] leading-snug">
                {tip.title}
              </h5>
              <p className="text-[11px] text-[#2E3A36]/75 leading-relaxed">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nota Médica Firmada */}
      <div className="p-5 rounded-3xl bg-white border border-[#AEC9C0]/60 shadow-2xs space-y-3 relative overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#6E9E93] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
            LC
          </div>
          <div>
            <h5 className="text-sm font-bold text-[#2E3A36] font-serif">
              {doctorName}
            </h5>
            <span className="text-[11px] text-[#6E9E93] font-medium block">
              Médica Especialista en Nutrición Clínica & Medicina Metabólica
            </span>
          </div>
        </div>

        <p className="text-xs text-[#2E3A36]/85 italic leading-relaxed pl-2 border-l-2 border-[#6E9E93]">
          "Recuerda que tu plan no es una restricción punitiva. Es una sincronización bioquímica diseñada para apagar el ruido de comida, optimizar tus hormonas de saciedad, estabilizar tu glucosa y permitirte disfrutar de la comida real colombiana con libertad y respaldo científico."
        </p>

        <div className="flex items-center justify-between pt-2 text-[10px] text-[#2E3A36]/60 font-mono border-t border-[#AEC9C0]/30">
          <span>Registro Médico Colmed • Código Vela Clínico</span>
          <span className="text-[#6E9E93] font-bold">Firma Digital Verificada ✓</span>
        </div>
      </div>
    </div>
  );
};
