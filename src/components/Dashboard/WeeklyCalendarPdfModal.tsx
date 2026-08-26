import React, { useRef, useState } from 'react';
import { CalculatedMetrics, OnboardingData, MealItem, MealTimeKey } from '../../types';
import { DayMealCustomSelections } from './MealEquivalencesModal';
import { FOOD_GROUPS_META, calculateFoodEquivalence } from '../../utils/portionCalculator';
import {
  X,
  Printer,
  Download,
  Sparkles,
  ShieldCheck,
  Calendar,
  Flame,
  Dna,
  Heart,
  Stethoscope,
  CheckCircle2,
  Apple,
  Clock,
  Droplets,
  Loader2,
} from 'lucide-react';

interface WeeklyCalendarPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: CalculatedMetrics;
  onboarding?: OnboardingData;
  weeklyPlan: Record<string, DayMealCustomSelections>;
  activeMeals: MealItem[];
  daysOfWeek: { key: string; label: string; fullLabel: string }[];
}

export const WeeklyCalendarPdfModal: React.FC<WeeklyCalendarPdfModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onboarding,
  weeklyPlan,
  activeMeals,
  daysOfWeek,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const patientName =
    onboarding?.preferredName ||
    onboarding?.name ||
    'Paciente';

  // Cálculo del rango de fechas de la semana actual
  const getWeekRangeString = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const startDay = monday.getDate();
    const startMonth = months[monday.getMonth()];
    const endDay = sunday.getDate();
    const endMonth = months[sunday.getMonth()];
    const year = sunday.getFullYear();

    if (startMonth === endMonth) {
      return `Semana del ${startDay} al ${endDay} de ${endMonth}, ${year}`;
    }
    return `Semana del ${startDay} de ${startMonth} al ${endDay} de ${endMonth}, ${year}`;
  };

  const weekRange = getWeekRangeString();

  // Imprimir nativo optimizado
  const handlePrint = () => {
    window.print();
  };

  // Exportar a PDF directo con jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FAF6F0',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Vela_Plan_Nutricional_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Cálculos de macros y calorías
  const bmrValue = metrics.bmr || metrics.bmrKcal || 1350;
  const tdeeValue = metrics.tdee || metrics.tdeeKcal || 1850;
  const targetKcal = metrics.targetKcal || 1450;
  const deficitValue = metrics.deficitKcal !== undefined ? metrics.deficitKcal : targetKcal - tdeeValue;
  const deficitLabel = deficitValue < 0 ? `${deficitValue} kcal/día` : deficitValue > 0 ? `+${deficitValue} kcal/día` : 'Mantenimiento';

  const proteinG = metrics.proteinGrams || 110;
  const proteinPct = metrics.proteinPercent || 30;
  const carbsG = metrics.carbsGrams || 140;
  const carbsPct = metrics.carbsPercent || 40;
  const fatG = metrics.fatGrams || 45;
  const fatPct = metrics.fatPercent || 30;

  const weightKg = onboarding?.weightKg || 68;
  const proteinPerKg = (proteinG / weightKg).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Contenedor Modal */}
      <div className="bg-[#FAF6F0] w-full max-w-5xl rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[96vh] flex flex-col relative text-[#2E3A36] overflow-hidden border border-[#AEC9C0]">
        
        {/* Barra superior interactiva (Oculta al imprimir) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#AEC9C0]/60 gap-3 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg sm:text-xl text-[#2E3A36]">
                Plan Nutricional Semanal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#6E9E93]/20 text-[#6E9E93] font-mono text-[10px] font-bold">
                FORMATO CARTA OFICIAL
              </span>
            </div>
            <p className="text-xs text-[#2E3A36]/70 mt-0.5">
              Prescripción clínica completa de lunes a domingo con alimentos y gramajes exactos.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-2 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-95 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF6F0] text-[#2E3A36] border border-[#AEC9C0] rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#6E9E93]" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl border border-[#AEC9C0]/70 text-[#2E3A36]/70 hover:bg-[#AEC9C0]/20 transition-colors"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* DOCUMENTO IMPRIMIBLE / EXPORTABLE (TAMAÑO CARTA) */}
        {/* ================================================================ */}
        <div className="overflow-y-auto space-y-6 flex-1 py-4 pr-1 print:overflow-visible print:p-0 print:m-0">
          
          <div
            ref={printRef}
            id="vela-printable-plan"
            className="bg-[#FAF6F0] p-6 sm:p-8 rounded-3xl border border-[#AEC9C0]/80 space-y-6 text-[#2E3A36] font-sans print:border-none print:p-0 print:bg-white print:rounded-none"
            style={{
              pageBreakInside: 'avoid',
            }}
          >
            {/* CSS específico para impresión sin cortes indebidos */}
            <style>{`
              @media print {
                @page {
                  size: letter portrait;
                  margin: 8mm 8mm 8mm 8mm;
                }
                body {
                  background: #FAF6F0 !important;
                  color: #2E3A36 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-break {
                  page-break-inside: avoid !important;
                  break-inside: avoid-page !important;
                }
                .print-hidden {
                  display: none !important;
                }
              }
            `}</style>

            {/* 1. ENCABEZADO CLÍNICO CON LOGO, NOMBRE Y FECHA */}
            <div className="border-b-2 border-[#6E9E93] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-break">
              <div className="flex items-center gap-3.5">
                {/* Isotipo Vela */}
                <div className="w-12 h-12 rounded-2xl bg-[#6E9E93] text-white flex items-center justify-center shadow-xs flex-shrink-0 font-serif font-black text-2xl">
                  V
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#2E3A36]">
                      VELA
                    </span>
                    <span className="text-xs font-mono font-bold tracking-widest text-[#6E9E93] uppercase">
                      Nutrición Clínica
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#2E3A36]/80 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#6E9E93]" />
                    <span>{weekRange}</span>
                  </div>
                </div>
              </div>

              {/* Ficha del Paciente */}
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#AEC9C0] shadow-2xs text-left sm:text-right">
                <div className="text-[10px] font-mono font-bold text-[#6E9E93] uppercase tracking-wider">
                  Expediente Nutricional
                </div>
                <div className="text-sm font-serif font-bold text-[#2E3A36]">
                  {patientName}
                </div>
                <div className="text-[10px] text-[#2E3A36]/70">
                  {onboarding?.age ? `${onboarding.age} años · ` : ''}
                  {onboarding?.weightKg ? `${onboarding.weightKg} kg · ` : ''}
                  {onboarding?.heightCm ? `${onboarding.heightCm} cm` : ''}
                </div>
              </div>
            </div>

            {/* 2. RESUMEN CALÓRICO Y MACRONUTRIENTES */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#AEC9C0] shadow-2xs space-y-4 no-break">
              <div className="flex items-center justify-between border-b border-[#AEC9C0]/40 pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#F2A488]" />
                  <span className="font-serif font-bold text-sm text-[#2E3A36]">
                    Prescripción Energética & Distribución de Macronutrientes
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#AEC9C0]/30 text-[#2E3A36] px-2.5 py-0.5 rounded-full">
                  Fase: Déficit Fisiológico
                </span>
              </div>

              {/* Métricas Energéticas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50">
                  <div className="text-[10px] font-mono font-bold text-[#2E3A36]/60 uppercase">GEB (Basal)</div>
                  <div className="text-base sm:text-lg font-serif font-extrabold text-[#2E3A36]">{bmrValue}</div>
                  <div className="text-[9px] text-[#2E3A36]/60">kcal / día</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50">
                  <div className="text-[10px] font-mono font-bold text-[#2E3A36]/60 uppercase">GET (Gasto Total)</div>
                  <div className="text-base sm:text-lg font-serif font-extrabold text-[#2E3A36]">{tdeeValue}</div>
                  <div className="text-[9px] text-[#2E3A36]/60">kcal / día</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50">
                  <div className="text-[10px] font-mono font-bold text-[#2E3A36]/60 uppercase">Déficit Diario</div>
                  <div className="text-base sm:text-lg font-serif font-extrabold text-[#F2A488]">{deficitLabel}</div>
                  <div className="text-[9px] text-[#2E3A36]/60">Preservación magra</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#6E9E93] text-white shadow-xs">
                  <div className="text-[10px] font-mono font-bold uppercase text-white/80">Calorías Objetivo</div>
                  <div className="text-base sm:text-lg font-serif font-black text-white">{targetKcal}</div>
                  <div className="text-[9px] text-white/90">kcal / día</div>
                </div>
              </div>

              {/* Macronutrientes en Gramos y % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Proteínas */}
                <div className="p-3 rounded-2xl bg-[#FAF6F0] border-l-4 border-[#6E9E93] border-t border-r border-b border-[#AEC9C0]/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[#6E9E93] uppercase font-mono">Proteínas</div>
                    <div className="text-base font-extrabold text-[#2E3A36]">{proteinG}g <span className="text-xs font-normal text-[#2E3A36]/70">({proteinPct}%)</span></div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#2E3A36]/70">
                    <div>{proteinPerKg} g/kg</div>
                    <div className="text-[#6E9E93] font-bold">Masa Magra</div>
                  </div>
                </div>

                {/* Carbohidratos */}
                <div className="p-3 rounded-2xl bg-[#FAF6F0] border-l-4 border-[#AEC9C0] border-t border-r border-b border-[#AEC9C0]/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[#2E3A36] uppercase font-mono">Carbohidratos</div>
                    <div className="text-base font-extrabold text-[#2E3A36]">{carbsG}g <span className="text-xs font-normal text-[#2E3A36]/70">({carbsPct}%)</span></div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#2E3A36]/70">
                    <div>Glucógeno</div>
                    <div className="text-[#2E3A36] font-bold">Complejos</div>
                  </div>
                </div>

                {/* Grasas */}
                <div className="p-3 rounded-2xl bg-[#FAF6F0] border-l-4 border-[#F2A488] border-t border-r border-b border-[#AEC9C0]/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[#F2A488] uppercase font-mono">Grasas Saludables</div>
                    <div className="text-base font-extrabold text-[#2E3A36]">{fatG}g <span className="text-xs font-normal text-[#2E3A36]/70">({fatPct}%)</span></div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#2E3A36]/70">
                    <div>Hormonas</div>
                    <div className="text-[#F2A488] font-bold">Esenciales</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TABLA SEMANAL POR DÍA (L-D) CON ALIMENTO Y CANTIDAD EXACTA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#AEC9C0]/60 pb-1.5 no-break">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-[#6E9E93]" />
                  <h3 className="font-serif font-bold text-base text-[#2E3A36]">
                    Plan Semanal de Comidas y Porciones Exactas (Lunes a Domingo)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#2E3A36]/60">
                  {activeMeals.length} tiempos de comida diarios
                </span>
              </div>

              {/* Rejilla de los 7 Días */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {daysOfWeek.map((day, dIdx) => {
                  const daySelections = weeklyPlan[day.key] || {};

                  return (
                    <div
                      key={day.key}
                      className="p-3.5 sm:p-4 rounded-3xl bg-white border border-[#AEC9C0] shadow-2xs space-y-3 no-break"
                      style={{
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {/* Título del Día */}
                      <div className="flex items-center justify-between border-b border-[#AEC9C0]/40 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#6E9E93] text-white text-xs font-serif font-bold flex items-center justify-center">
                            {day.label}
                          </span>
                          <span className="font-serif font-extrabold text-sm text-[#2E3A36]">
                            {day.fullLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#6E9E93]">
                          {targetKcal} kcal
                        </span>
                      </div>

                      {/* Tiempos de Comida del Día */}
                      <div className="space-y-2">
                        {activeMeals.map((meal) => {
                          const mealSel = daySelections[meal.mealKey] || {};
                          const groupsInMeal = ['proteinas', 'cereales_tuberculos', 'grasas', 'vegetales', 'frutas'] as const;
                          
                          // Verificar si hay selecciones personalizadas en el modal de equivalencias
                          const hasCustomEntries = groupsInMeal.some(
                            (gKey) => mealSel[gKey] && mealSel[gKey]!.length > 0
                          );

                          return (
                            <div
                              key={meal.id}
                              className="p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-[#2E3A36]">
                                  <Clock className="w-3 h-3 text-[#6E9E93]" />
                                  <span>{meal.mealName}</span>
                                  {meal.timeSuggestion && (
                                    <span className="text-[10px] font-normal text-[#2E3A36]/60 font-mono">
                                      ({meal.timeSuggestion})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-[#6E9E93]">
                                  {meal.caloriesKcal} kcal
                                </span>
                              </div>

                              {/* Alimentos y cantidades exactas */}
                              {hasCustomEntries ? (
                                <div className="space-y-0.5 text-[11px] text-[#2E3A36]/90 pl-1">
                                  {groupsInMeal.map((gKey) => {
                                    const entries = mealSel[gKey] || [];
                                    if (entries.length === 0) return null;
                                    const meta = FOOD_GROUPS_META[gKey];

                                    return (
                                      <div key={gKey} className="flex items-start gap-1.5 leading-tight">
                                        <span className="text-xs">{meta.icon}</span>
                                        <div className="flex-1">
                                          {entries.map((e, idx) => (
                                            <span key={e.foodId}>
                                              {idx > 0 && ' + '}
                                              <strong className="text-[#2E3A36]">{e.food.name || e.food.nombre}</strong>:{' '}
                                              <span className="font-semibold text-[#6E9E93]">{calculateFoodEquivalence(e.food, e.portions)}</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-[11px] text-[#2E3A36]/80 pl-1 leading-snug">
                                  <span className="font-medium">{meal.suggestedMenu || 'Menú balanceado calculado según prescripción.'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. NOTA CLÍNICA FIRMADA POR LA MÉDICA (DRA. LORENA CASTRO) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#AEC9C0] space-y-3 no-break">
              <div className="flex items-center gap-2 text-[#6E9E93] font-serif font-bold text-sm">
                <Stethoscope className="w-4 h-4" />
                <span>Orientación Clínica Personalizada · Dra. Lorena Castro</span>
              </div>

              <p className="text-xs text-[#2E3A36]/85 leading-relaxed italic">
                &quot;{patientName}, este plan fue calculado para otorgarte saciedad continua, proteger tu masa muscular y optimizar tu metabolismo basal. Recuerda consumir al menos 2 a 2.5 litros de agua al día, priorizar el descanso nocturno (7-8 horas) y realizar tus comidas en un ambiente tranquilo y sin distracciones. Tu cuerpo responde a la constancia y al cuidado, no a la privación extrema.&quot;
              </p>

              <div className="pt-3 border-t border-[#AEC9C0]/40 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 text-[11px]">
                <div>
                  <div className="font-serif font-black text-sm text-[#2E3A36]">
                    Dra. Lorena Castro
                  </div>
                  <div className="text-[#2E3A36]/70">
                    Médica Especialista en Nutrición Clínica y Metabolismo
                  </div>
                  <div className="font-mono text-[10px] text-[#6E9E93]">
                    Registro Médico Colmed 10458291 · Vela Health
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#2E3A36]/50">
                  Documento Clínico Oficial · Vela App v2.4
                </div>
              </div>
            </div>

            {/* 5. FOOTER CLÍNICO */}
            <div className="text-center pt-2 text-[10px] text-[#2E3A36]/50 font-mono no-break">
              Vela Health Technologies © {new Date().getFullYear()} · Todos los derechos reservados · Documento clínico orientativo · No reemplaza la consulta médica o nutricional presencial
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
