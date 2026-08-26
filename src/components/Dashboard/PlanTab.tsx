import React, { useState, useMemo } from 'react';
import { CalculatedMetrics, OnboardingData, MealItem, MealTimeKey, FoodEquivalenceItem } from '../../types';
import { generateCustomMealPlan } from '../../data/defaultPlan';
import { getValidatedColombianFoods } from '../../data/colombianFoods';
import { MealEquivalencesModal, DayMealCustomSelections } from './MealEquivalencesModal';
import { GroupPickerModal, SelectedFoodEntry } from './GroupPickerModal';
import { CopyDayModal } from './CopyDayModal';
import { GeneralEquivalencesScreen } from './GeneralEquivalencesScreen';
import { WeeklyCalendarPdfModal } from './WeeklyCalendarPdfModal';
import { CaloricAnalysisSummary } from './CaloricAnalysisSummary';
import { WeeklySpreadsheetTable } from './WeeklySpreadsheetTable';
import {
  FOOD_GROUPS_META,
  calculateFoodEquivalence,
} from '../../utils/portionCalculator';
import {
  Calendar,
  Utensils,
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
  Copy,
  RotateCcw,
  Printer,
  Plus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';

interface PlanTabProps {
  metrics: CalculatedMetrics;
  onboarding?: OnboardingData;
  userName: string;
}

const DAYS_OF_WEEK = [
  { key: 'lunes', short: 'L', label: 'Lun', fullLabel: 'Lunes' },
  { key: 'martes', short: 'M', label: 'Mar', fullLabel: 'Martes' },
  { key: 'miercoles', short: 'X', label: 'Mié', fullLabel: 'Miércoles' },
  { key: 'jueves', short: 'J', label: 'Jue', fullLabel: 'Jueves' },
  { key: 'viernes', short: 'V', label: 'Vie', fullLabel: 'Viernes' },
  { key: 'sabado', short: 'S', label: 'Sáb', fullLabel: 'Sábado' },
  { key: 'domingo', short: 'D', label: 'Dom', fullLabel: 'Domingo' },
];

export const PlanTab: React.FC<PlanTabProps> = ({ metrics, onboarding, userName }) => {
  const [selectedDayKey, setSelectedDayKey] = useState<string>('lunes');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modals state
  const [showMealModal, setShowMealModal] = useState<boolean>(false);
  const [activeMealForModal, setActiveMealForModal] = useState<MealTimeKey>('desayuno');
  const [showCopyDayModal, setShowCopyDayModal] = useState<boolean>(false);
  const [showGeneralTableModal, setShowGeneralTableModal] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showActionDropdown, setShowActionDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Group Picker state for single cell clicks in the table
  const [directPickerState, setDirectPickerState] = useState<{
    isOpen: boolean;
    mealKey: MealTimeKey;
    mealName: string;
    groupKey: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas';
    targetPortions: number;
  }>({
    isOpen: false,
    mealKey: 'desayuno',
    mealName: 'Desayuno',
    groupKey: 'proteinas',
    targetPortions: 1,
  });

  const isCeliac = Boolean(onboarding?.medicalConditions?.includes('celiaquia'));
  const activeMeals: MealItem[] = useMemo(() => generateCustomMealPlan(metrics, onboarding), [metrics, onboarding]);

  // Inicializar estado de comidas para toda la semana
  const initialWeeklyPlan = useMemo(() => {
    const defaultFoods = getValidatedColombianFoods();
    const eggFood = defaultFoods.find((f) => f.id.includes('huevo') || f.familia === 'Huevos') || defaultFoods[0];
    const chickenFood = defaultFoods.find((f) => f.id.includes('pollo') || f.familia?.includes('Pollo')) || defaultFoods[1];
    const beefFood = defaultFoods.find((f) => f.id.includes('lomo') || f.familia?.includes('Carne')) || defaultFoods[2];
    const arepaFood = defaultFoods.find((f) => f.id.includes('arepa') || f.familia === 'Arepas') || defaultFoods[10];
    const potatoFood = defaultFoods.find((f) => f.id.includes('papa') || f.familia?.includes('Tubérculo')) || defaultFoods[11];
    const avocadoFood = defaultFoods.find((f) => f.id.includes('aguacate') || f.familia?.includes('Aguacate')) || defaultFoods[20];
    const oliveOil = defaultFoods.find((f) => f.id.includes('oliva') || f.familia?.includes('Aceite')) || defaultFoods[21];
    const saladVeg = defaultFoods.find((f) => f.id.includes('espinaca') || f.familia?.includes('Hojas')) || defaultFoods[30];
    const fruitPapaya = defaultFoods.find((f) => f.id.includes('papaya') || f.familia?.includes('Fruta')) || defaultFoods[40];

    const generateDaySelections = (dayIndex: number): DayMealCustomSelections => {
      const selections: DayMealCustomSelections = {};

      activeMeals.forEach((meal) => {
        const mealKey = meal.mealKey;
        const pPort = meal.portions.proteina || 0;
        const cPort = meal.portions.carbohidrato || 0;
        const gPort = meal.portions.grasa || 0;
        const vPort = meal.portions.verdura || 0;
        const fPort = meal.portions.fruta || 0;

        const mSel: DayMealCustomSelections[MealTimeKey] = {};

        if (pPort > 0) {
          const chosenProtein = mealKey === 'desayuno' ? eggFood : mealKey === 'almuerzo' ? chickenFood : beefFood;
          if (chosenProtein) {
            mSel.proteinas = [{ foodId: chosenProtein.id, food: chosenProtein, portions: pPort }];
          }
        }

        if (cPort > 0) {
          const chosenCarb = mealKey === 'desayuno' ? arepaFood : potatoFood;
          if (chosenCarb) {
            mSel.cereales_tuberculos = [{ foodId: chosenCarb.id, food: chosenCarb, portions: cPort }];
          }
        }

        if (gPort > 0) {
          const chosenFat = mealKey === 'desayuno' || mealKey === 'almuerzo' ? avocadoFood : oliveOil;
          if (chosenFat) {
            mSel.grasas = [{ foodId: chosenFat.id, food: chosenFat, portions: gPort }];
          }
        }

        if (vPort > 0 && saladVeg) {
          mSel.vegetales = [{ foodId: saladVeg.id, food: saladVeg, portions: vPort }];
        }

        if (fPort > 0 && fruitPapaya) {
          mSel.frutas = [{ foodId: fruitPapaya.id, food: fruitPapaya, portions: fPort }];
        }

        selections[mealKey] = mSel;
      });

      return selections;
    };

    const plan: Record<string, DayMealCustomSelections> = {};
    DAYS_OF_WEEK.forEach((d, idx) => {
      plan[d.key] = generateDaySelections(idx);
    });

    return plan;
  }, [activeMeals]);

  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, DayMealCustomSelections>>(initialWeeklyPlan);

  // Manejador de actualización de alimentos para una comida y grupo
  const handleUpdateMealGroupSelections = (
    mealKey: MealTimeKey,
    groupKey: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas',
    newSelections: SelectedFoodEntry[]
  ) => {
    setWeeklyPlan((prev) => {
      const currentDayPlan = prev[selectedDayKey] || {};
      const currentMealPlan = currentDayPlan[mealKey] || {};

      const updatedMealPlan = {
        ...currentMealPlan,
        [groupKey]: newSelections,
      };

      return {
        ...prev,
        [selectedDayKey]: {
          ...currentDayPlan,
          [mealKey]: updatedMealPlan,
        },
      };
    });
  };

  // Manejador de Copiar Día
  const handleConfirmCopyDay = (targetDays: string[]) => {
    const currentSelections = weeklyPlan[selectedDayKey] || {};
    setWeeklyPlan((prev) => {
      const nextPlan = { ...prev };
      targetDays.forEach((targetLabel) => {
        const found = DAYS_OF_WEEK.find((d) => d.fullLabel === targetLabel || d.key === targetLabel);
        if (found) {
          nextPlan[found.key] = JSON.parse(JSON.stringify(currentSelections));
        }
      });
      return nextPlan;
    });

    showToast(`Comidas de ${currentDayObj.fullLabel} copiadas a ${targetDays.length} día(s).`);
  };

  // Manejador de Limpiar Día
  const handleClearCurrentDay = () => {
    setWeeklyPlan((prev) => {
      return {
        ...prev,
        [selectedDayKey]: {},
      };
    });
    setShowActionDropdown(false);
    showToast(`Comidas de ${currentDayObj.fullLabel} limpiadas.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const currentDayObj = DAYS_OF_WEEK.find((d) => d.key === selectedDayKey) || DAYS_OF_WEEK[0];
  const currentDaySelections = weeklyPlan[selectedDayKey] || {};

  const openMealModalFor = (mealKey: MealTimeKey) => {
    setActiveMealForModal(mealKey);
    setShowMealModal(true);
  };

  const handleOpenGroupPickerFromTable = (
    mealKey: MealTimeKey,
    mealName: string,
    groupKey: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas',
    targetPortions: number
  ) => {
    setDirectPickerState({
      isOpen: true,
      mealKey,
      mealName,
      groupKey,
      targetPortions,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-6 pb-28 text-[#2E3A36]">
      
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2E3A36] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl border border-[#6E9E93] flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#6E9E93]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner Principal de Prescripción */}
      <div className="bg-[#FAF6F0] rounded-3xl p-5 sm:p-6 border border-[#AEC9C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🥗</span>
            <h2 className="text-xl font-bold font-serif text-[#2E3A36]">
              Plan Nutricional de {userName.split(' ')[0] || 'Paciente'}
            </h2>
          </div>
          <p className="text-xs text-[#2E3A36]/70">
            {metrics.mealDistributions.length} tiempos de comida activos • {metrics.proteinGrams}g proteína diaria prescrita
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGeneralTableModal(true)}
            className="px-3.5 py-2 bg-white text-[#2E3A36] rounded-2xl border border-[#AEC9C0] text-xs font-bold flex items-center space-x-1.5 hover:bg-[#AEC9C0]/20 transition-all shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-[#6E9E93]" />
            <span>Equivalencias</span>
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="px-3.5 py-2 bg-[#6E9E93] text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 hover:bg-[#5C897F] transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Calendario PDF</span>
          </button>
        </div>
      </div>

      {/* 1. SELECTOR DE DÍA DE LA SEMANA (L M X J V S D) & ACCIONES */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#AEC9C0]/70 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#6E9E93]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E3A36]/80 font-mono">
              Día Seleccionado: <strong className="text-[#2E3A36]">{currentDayObj.fullLabel}</strong>
            </span>
          </div>

          {/* Menú de Acciones (Copiar este día a... / Limpiar este día) */}
          <div className="relative">
            <button
              onClick={() => setShowActionDropdown(!showActionDropdown)}
              className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 rounded-xl border border-[#AEC9C0]/60 text-xs font-bold text-[#2E3A36] flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <span>Acciones del día</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2E3A36]/60" />
            </button>

            {showActionDropdown && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-[#AEC9C0] p-1.5 z-30 space-y-1 text-xs animate-in fade-in">
                <button
                  onClick={() => {
                    setShowActionDropdown(false);
                    setShowCopyDayModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#2E3A36] hover:bg-[#6E9E93]/15 hover:text-[#6E9E93] font-bold flex items-center space-x-2 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#6E9E93]" />
                  <span>Copiar este día a...</span>
                </button>
                <button
                  onClick={handleClearCurrentDay}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#F2A488] hover:bg-[#F2A488]/15 font-bold flex items-center space-x-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar este día</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Días (L M X J V S D) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = day.key === selectedDayKey;

            return (
              <button
                key={day.key}
                onClick={() => {
                  setSelectedDayKey(day.key);
                  setShowActionDropdown(false);
                }}
                className={`py-2.5 sm:py-3 rounded-2xl flex flex-col items-center justify-center transition-all border shadow-2xs ${
                  isSelected
                    ? 'bg-[#6E9E93] text-white border-[#6E9E93] shadow-xs scale-102 font-bold'
                    : 'bg-[#FAF6F0] text-[#2E3A36]/80 hover:bg-[#AEC9C0]/20 border-[#AEC9C0]/50'
                }`}
              >
                <span className="text-sm font-extrabold font-serif">
                  {day.short}
                </span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#2E3A36]/60'}`}>
                  {day.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Modo de Vista: Tabla Hoja de Cálculo vs Tarjetas */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-[#2E3A36]/80 uppercase tracking-wider font-mono">
          Formato de Visualización:
        </span>
        <div className="flex bg-white p-1 rounded-2xl border border-[#AEC9C0]/60 shadow-2xs gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-[#6E9E93] text-white shadow-2xs'
                : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Hoja de Cálculo</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'cards'
                ? 'bg-[#6E9E93] text-white shadow-2xs'
                : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tarjetas Detalladas</span>
          </button>
        </div>
      </div>

      {/* 2. RENDERIZADO SEGÚN MODO DE VISTA */}
      {viewMode === 'table' ? (
        <WeeklySpreadsheetTable
          activeMeals={activeMeals}
          currentDaySelections={currentDaySelections}
          currentDayLabel={currentDayObj.fullLabel}
          onOpenGroupPicker={handleOpenGroupPickerFromTable}
          onOpenFullMealModal={openMealModalFor}
        />
      ) : (
        /* VISTA TARJETAS */
        <div className="space-y-3.5">
          {activeMeals.map((meal) => {
            const mealKey = meal.mealKey;
            const mealSel = currentDaySelections[mealKey] || {};
            const mealTargetPortions = meal.portions;

            const groupsToCheck: ('proteinas' | 'cereales_tuberculos' | 'grasas' | 'vegetales' | 'frutas')[] = [
              'proteinas',
              'cereales_tuberculos',
              'grasas',
              'vegetales',
              'frutas',
            ];

            let totalTargetRequired = 0;
            let totalSelectedInMeal = 0;

            const groupBadges = groupsToCheck.map((gKey) => {
              const meta = FOOD_GROUPS_META[gKey];
              const target =
                gKey === 'proteinas'
                  ? mealTargetPortions.proteina || 0
                  : gKey === 'cereales_tuberculos'
                  ? mealTargetPortions.carbohidrato || 0
                  : gKey === 'grasas'
                  ? mealTargetPortions.grasa || 0
                  : gKey === 'vegetales'
                  ? mealTargetPortions.verdura || 0
                  : mealTargetPortions.fruta || 0;

              const entries = mealSel[gKey] || [];
              const selectedPortions = entries.reduce((acc, curr) => acc + curr.portions, 0);

              if (target > 0) {
                totalTargetRequired += target;
                totalSelectedInMeal += selectedPortions;
              }

              if (target === 0 && selectedPortions === 0) return null;

              const isGroupMet = target === 0 ? selectedPortions > 0 : selectedPortions === target;

              return {
                key: gKey,
                meta,
                target,
                selectedPortions,
                isGroupMet,
                entries,
              };
            }).filter(Boolean);

            const isMealComplete = totalTargetRequired === 0 ? true : totalSelectedInMeal === totalTargetRequired;

            return (
              <div
                key={meal.id}
                onClick={() => openMealModalFor(mealKey)}
                className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${
                  isMealComplete
                    ? 'border-[#6E9E93]/60 hover:border-[#6E9E93]'
                    : 'border-[#AEC9C0]/70 hover:border-[#6E9E93]'
                }`}
              >
                {/* Header de la Fila de Comida */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-base text-[#2E3A36] group-hover:text-[#6E9E93] transition-colors">
                        {meal.mealName}
                      </h4>
                      <span className="text-[11px] font-mono text-[#2E3A36]/60 bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#AEC9C0]/40">
                        {meal.percentage}% del día
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#2E3A36]/70">
                      <Clock className="w-3.5 h-3.5 text-[#6E9E93]" />
                      <span>{meal.timeSuggestion}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-[#6E9E93]">{meal.caloriesKcal} kcal</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        isMealComplete
                          ? 'bg-[#6E9E93]/15 text-[#6E9E93] border border-[#6E9E93]/40'
                          : totalSelectedInMeal > totalTargetRequired
                          ? 'bg-[#F2A488]/20 text-[#F2A488] border border-[#F2A488]/40'
                          : 'bg-[#FAF6F0] text-[#2E3A36]/70 border border-[#AEC9C0]/40'
                      }`}
                    >
                      {isMealComplete
                        ? '✓ COMPLETO'
                        : totalSelectedInMeal > totalTargetRequired
                        ? `+${(totalSelectedInMeal - totalTargetRequired).toFixed(1)} porc.`
                        : `Falta ${(totalTargetRequired - totalSelectedInMeal).toFixed(1)}`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#2E3A36]/40 group-hover:text-[#6E9E93] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Pills de Grupos con Porciones y Colores */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-[#AEC9C0]/30">
                  {groupBadges.map((gb) => {
                    if (!gb) return null;
                    return (
                      <span
                        key={gb.key}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center space-x-1 border shadow-2xs ${
                          gb.isGroupMet
                            ? 'bg-[#6E9E93]/10 text-[#6E9E93] border-[#6E9E93]/30'
                            : 'bg-[#FAF6F0] text-[#2E3A36]/70 border-[#AEC9C0]/50'
                        }`}
                      >
                        <span>{gb.meta.icon}</span>
                        <span>{gb.meta.shortLabel}:</span>
                        <strong className="text-[#2E3A36]">
                          {gb.selectedPortions} / {gb.target}
                        </strong>
                      </span>
                    );
                  })}
                </div>

                {/* Resumen de Alimentos Seleccionados en esta comida */}
                <div className="mt-3 p-3 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E3A36]/60 block font-mono">
                    Alimentos en tu Menú:
                  </span>
                  
                  {groupBadges.some((gb) => gb && gb.entries.length > 0) ? (
                    <div className="space-y-1 text-xs text-[#2E3A36]">
                      {groupBadges.map((gb) => {
                        if (!gb || gb.entries.length === 0) return null;
                        return (
                          <div key={gb.key} className="flex items-start space-x-1.5">
                            <span className="text-xs mt-0.5">{gb.meta.icon}</span>
                            <span className="leading-snug">
                              {gb.entries.map((e, idx) => (
                                <span key={e.foodId}>
                                  {idx > 0 && ' + '}
                                  <strong className="text-[#2E3A36]">{e.food.name || e.food.nombre}</strong>
                                  <span className="text-[#6E9E93] text-[11px]"> ({calculateFoodEquivalence(e.food, e.portions)})</span>
                                </span>
                              ))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#2E3A36]/70 italic">
                      {meal.suggestedMenu}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. RESUMEN "ANÁLISIS CALÓRICO" AL FONDO */}
      <CaloricAnalysisSummary
        metrics={metrics}
        onboarding={onboarding}
        doctorName="Dra. Lorena Castro"
      />

      {/* Direct Group Picker Modal (Triggered by clicking on any table cell) */}
      {directPickerState.isOpen && (
        <GroupPickerModal
          isOpen={directPickerState.isOpen}
          onClose={() => setDirectPickerState((prev) => ({ ...prev, isOpen: false }))}
          groupKey={directPickerState.groupKey}
          mealName={directPickerState.mealName}
          targetPortions={directPickerState.targetPortions}
          currentSelections={
            currentDaySelections[directPickerState.mealKey]?.[directPickerState.groupKey] || []
          }
          onUpdateSelections={(newSelections) =>
            handleUpdateMealGroupSelections(
              directPickerState.mealKey,
              directPickerState.groupKey,
              newSelections
            )
          }
          isCeliac={isCeliac}
        />
      )}

      {/* Modal Equivalencias por Comida Completa */}
      {showMealModal && (
        <MealEquivalencesModal
          isOpen={showMealModal}
          onClose={() => setShowMealModal(false)}
          activeMeals={activeMeals}
          initialMealKey={activeMealForModal}
          daySelections={currentDaySelections}
          onUpdateMealGroupSelections={handleUpdateMealGroupSelections}
          isCeliac={isCeliac}
        />
      )}

      {/* Modal Copiar Día */}
      {showCopyDayModal && (
        <CopyDayModal
          isOpen={showCopyDayModal}
          onClose={() => setShowCopyDayModal(false)}
          currentDay={currentDayObj.fullLabel}
          daysOfWeek={DAYS_OF_WEEK.map((d) => d.fullLabel)}
          onConfirmCopy={handleConfirmCopyDay}
        />
      )}

      {/* Modal Tabla General de Equivalencias */}
      {showGeneralTableModal && (
        <GeneralEquivalencesScreen
          isOpen={showGeneralTableModal}
          onClose={() => setShowGeneralTableModal(false)}
          isCeliac={isCeliac}
        />
      )}

      {/* Modal Calendario Semanal PDF */}
      {showPdfModal && (
        <WeeklyCalendarPdfModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          metrics={metrics}
          onboarding={onboarding}
          weeklyPlan={weeklyPlan}
          activeMeals={activeMeals}
          daysOfWeek={DAYS_OF_WEEK}
        />
      )}
    </div>
  );
};
