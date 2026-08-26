import React, { useState } from 'react';
import { MealItem, MealTimeKey, CalculatedMetrics } from '../../types';
import { GroupPickerModal, SelectedFoodEntry } from './GroupPickerModal';
import {
  FOOD_GROUPS_META,
  calculateFoodEquivalence,
} from '../../utils/portionCalculator';
import {
  X,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Plus,
  Info,
} from 'lucide-react';

export type MealCustomSelections = {
  [groupKey in 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas']?: SelectedFoodEntry[];
};

export type DayMealCustomSelections = {
  [mealKey in MealTimeKey]?: MealCustomSelections;
};

interface MealEquivalencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMeals: MealItem[];
  initialMealKey?: MealTimeKey;
  daySelections: DayMealCustomSelections;
  onUpdateMealGroupSelections: (
    mealKey: MealTimeKey,
    groupKey: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas',
    newSelections: SelectedFoodEntry[]
  ) => void;
  isCeliac?: boolean;
}

export const MealEquivalencesModal: React.FC<MealEquivalencesModalProps> = ({
  isOpen,
  onClose,
  activeMeals,
  initialMealKey,
  daySelections,
  onUpdateMealGroupSelections,
  isCeliac = false,
}) => {
  const [selectedMealKey, setSelectedMealKey] = useState<MealTimeKey>(
    initialMealKey || activeMeals[0]?.mealKey || 'desayuno'
  );

  const [activeGroupPicker, setActiveGroupPicker] = useState<'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas' | null>(null);

  if (!isOpen) return null;

  const currentMeal = activeMeals.find((m) => m.mealKey === selectedMealKey) || activeMeals[0];
  const mealTargetPortions = currentMeal?.portions || {
    proteina: 1,
    carbohidrato: 1,
    grasa: 1,
    fruta: 0,
    verdura: 1,
  };

  const mealSelections = daySelections[selectedMealKey] || {};

  // Grupos activos en este tiempo de comida
  const groupsList: {
    key: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas';
    target: number;
  }[] = [
    { key: 'proteinas', target: mealTargetPortions.proteina || 0 },
    { key: 'cereales_tuberculos', target: mealTargetPortions.carbohidrato || 0 },
    { key: 'grasas', target: mealTargetPortions.grasa || 0 },
    { key: 'vegetales', target: mealTargetPortions.verdura || 0 },
    { key: 'frutas', target: mealTargetPortions.fruta || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#AEC9C0] max-h-[92vh] flex flex-col relative text-[#2E3A36] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#AEC9C0]/60">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2E3A36] flex items-center space-x-2">
              <span>Equivalencias por Comida</span>
              <Sparkles className="w-4 h-4 text-[#6E9E93]" />
            </h3>
            <p className="text-xs text-[#2E3A36]/70">
              Personaliza tus alimentos respetando las porciones objetivo
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#AEC9C0]/60 text-[#2E3A36]/70 hover:text-[#2E3A36] hover:bg-[#AEC9C0]/20 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs por Tiempo de Comida (Desayuno, Media Mañana, Almuerzo, Media Tarde, Cena) */}
        <div className="flex overflow-x-auto gap-2 py-3 border-b border-[#AEC9C0]/40 scrollbar-none">
          {activeMeals.map((meal) => {
            const isSelected = meal.mealKey === selectedMealKey;
            return (
              <button
                key={meal.id}
                onClick={() => setSelectedMealKey(meal.mealKey)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shadow-2xs ${
                  isSelected
                    ? 'bg-[#6E9E93] text-white shadow-xs'
                    : 'bg-white text-[#2E3A36]/70 hover:bg-[#AEC9C0]/20 border border-[#AEC9C0]/60'
                }`}
              >
                <span>{meal.mealName}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#2E3A36]/50'}`}>
                  ({meal.percentage}%)
                </span>
              </button>
            );
          })}
        </div>

        {/* Subheader: Info del Tiempo de Comida & Pills de Porciones Objetivo */}
        <div className="py-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-[#2E3A36]/80 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#6E9E93]" />
              <span>Sugerencia: {currentMeal?.timeSuggestion}</span>
            </div>
            <span className="font-mono font-bold text-[#6E9E93] text-xs">
              {currentMeal?.caloriesKcal} kcal recomendadas
            </span>
          </div>

          {/* Pills de Porciones Objetivo Arriba */}
          <div className="flex flex-wrap items-center gap-1.5">
            {groupsList.map((g) => {
              const meta = FOOD_GROUPS_META[g.key];
              const selectionsInGroup = mealSelections[g.key] || [];
              const totalPortions = selectionsInGroup.reduce((acc, curr) => acc + curr.portions, 0);
              const isMet = g.target === 0 || totalPortions >= g.target;

              return (
                <div
                  key={g.key}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center space-x-1 border shadow-2xs ${
                    isMet
                      ? 'bg-[#6E9E93]/15 text-[#6E9E93] border-[#6E9E93]/40'
                      : 'bg-white text-[#2E3A36]/80 border-[#AEC9C0]/60'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.shortLabel}:</span>
                  <span className="font-extrabold text-[#2E3A36]">
                    {g.target > 0 ? `${g.target} porc.` : 'Opcional / Libre'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjetas por Grupo de Alimento */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1 pb-2">
          {groupsList.map((g) => {
            const meta = FOOD_GROUPS_META[g.key];
            const selections = mealSelections[g.key] || [];
            const totalPortionsSelected = selections.reduce((acc, curr) => acc + curr.portions, 0);
            const isCompleted = g.target === 0 ? selections.length > 0 : totalPortionsSelected >= g.target;

            return (
              <div
                key={g.key}
                onClick={() => setActiveGroupPicker(g.key)}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${
                  isCompleted
                    ? 'border-[#6E9E93]/60 bg-[#6E9E93]/5'
                    : 'border-[#AEC9C0]/70 hover:border-[#6E9E93]'
                }`}
              >
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-lg shadow-2xs border border-[#AEC9C0]/40">
                      {meta.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2E3A36] group-hover:text-[#6E9E93] transition-colors">
                        {meta.label}
                      </h4>
                      <span className="text-[11px] text-[#2E3A36]/60 font-mono">
                        Meta: {g.target > 0 ? `${g.target} porción(es)` : 'Opcional'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isCompleted
                          ? 'bg-[#6E9E93] text-white'
                          : totalPortionsSelected > 0
                          ? 'bg-[#8FAFD1]/20 text-[#8FAFD1] border border-[#8FAFD1]/40'
                          : 'bg-[#FAF6F0] text-[#2E3A36]/60 border border-[#AEC9C0]/60'
                      }`}
                    >
                      {isCompleted
                        ? '✓ LISTO'
                        : `${totalPortionsSelected} de ${g.target} porc.`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#2E3A36]/40 group-hover:text-[#6E9E93] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Alimentos Seleccionados Actualmente */}
                <div className="mt-3 pt-2.5 border-t border-[#AEC9C0]/30 space-y-1.5">
                  {selections.length > 0 ? (
                    selections.map((sel) => {
                      const equivStr = calculateFoodEquivalence(sel.food, sel.portions);
                      return (
                        <div
                          key={sel.foodId}
                          className="flex items-center justify-between text-xs bg-[#FAF6F0] p-2 rounded-xl border border-[#AEC9C0]/40"
                        >
                          <div className="space-y-0.5">
                            <strong className="text-[#2E3A36] block">
                              {sel.food.name || sel.food.nombre}
                            </strong>
                            <span className="text-[11px] text-[#6E9E93] font-medium">
                              {equivStr}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#2E3A36] bg-white px-2 py-0.5 rounded-md border border-[#AEC9C0]/40">
                            {sel.portions} porc.
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-[#2E3A36]/60 flex items-center justify-between p-2 bg-[#FAF6F0]/60 rounded-xl border border-dashed border-[#AEC9C0]/60">
                      <span>Toca para elegir tu alimento o producto equivalente...</span>
                      <span className="text-[#6E9E93] font-bold text-[11px] flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Agregar
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#AEC9C0]/60 flex items-center justify-between">
          <span className="text-xs text-[#2E3A36]/70">
            Toca cualquier grupo para intercambiar por otras opciones
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#6E9E93] hover:bg-[#5C897F] text-white font-bold text-xs rounded-2xl transition-all shadow-xs"
          >
            Guardar y Volver
          </button>
        </div>
      </div>

      {/* Modal Picker de Grupo Específico */}
      {activeGroupPicker && (
        <GroupPickerModal
          isOpen={Boolean(activeGroupPicker)}
          onClose={() => setActiveGroupPicker(null)}
          groupKey={activeGroupPicker}
          mealName={currentMeal?.mealName || 'Comida'}
          targetPortions={
            groupsList.find((g) => g.key === activeGroupPicker)?.target || 1
          }
          currentSelections={mealSelections[activeGroupPicker] || []}
          onUpdateSelections={(newSelections) => {
            onUpdateMealGroupSelections(selectedMealKey, activeGroupPicker, newSelections);
          }}
          isCeliac={isCeliac}
        />
      )}
    </div>
  );
};
