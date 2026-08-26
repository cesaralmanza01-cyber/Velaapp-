import React from 'react';
import { MealItem, MealTimeKey } from '../../types';
import { FOOD_GROUPS_META, calculateFoodEquivalence } from '../../utils/portionCalculator';
import { DayMealCustomSelections } from './MealEquivalencesModal';
import { Clock, Plus, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';

interface WeeklySpreadsheetTableProps {
  activeMeals: MealItem[];
  currentDaySelections: DayMealCustomSelections;
  currentDayLabel: string;
  onOpenGroupPicker: (
    mealKey: MealTimeKey,
    mealName: string,
    groupKey: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas',
    targetPortions: number
  ) => void;
  onOpenFullMealModal: (mealKey: MealTimeKey) => void;
}

export const WeeklySpreadsheetTable: React.FC<WeeklySpreadsheetTableProps> = ({
  activeMeals,
  currentDaySelections,
  currentDayLabel,
  onOpenGroupPicker,
  onOpenFullMealModal,
}) => {
  const groupColumns: ('proteinas' | 'cereales_tuberculos' | 'grasas' | 'vegetales' | 'frutas')[] = [
    'proteinas',
    'cereales_tuberculos',
    'grasas',
    'vegetales',
    'frutas',
  ];

  // Totales del día para la fila resumen
  const dailyTotals = {
    proteinas: { target: 0, actual: 0 },
    cereales_tuberculos: { target: 0, actual: 0 },
    grasas: { target: 0, actual: 0 },
    vegetales: { target: 0, actual: 0 },
    frutas: { target: 0, actual: 0 },
    calories: 0,
  };

  activeMeals.forEach((meal) => {
    const mealSel = currentDaySelections[meal.mealKey] || {};
    dailyTotals.calories += meal.caloriesKcal || 0;

    dailyTotals.proteinas.target += meal.portions.proteina || 0;
    dailyTotals.proteinas.actual += (mealSel.proteinas || []).reduce((a, b) => a + b.portions, 0);

    dailyTotals.cereales_tuberculos.target += meal.portions.carbohidrato || 0;
    dailyTotals.cereales_tuberculos.actual += (mealSel.cereales_tuberculos || []).reduce(
      (a, b) => a + b.portions,
      0
    );

    dailyTotals.grasas.target += meal.portions.grasa || 0;
    dailyTotals.grasas.actual += (mealSel.grasas || []).reduce((a, b) => a + b.portions, 0);

    dailyTotals.vegetales.target += meal.portions.verdura || 0;
    dailyTotals.vegetales.actual += (mealSel.vegetales || []).reduce((a, b) => a + b.portions, 0);

    dailyTotals.frutas.target += meal.portions.fruta || 0;
    dailyTotals.frutas.actual += (mealSel.frutas || []).reduce((a, b) => a + b.portions, 0);
  });

  return (
    <div className="bg-white rounded-3xl border border-[#AEC9C0]/70 shadow-2xs overflow-hidden">
      {/* Table Title Bar */}
      <div className="p-4 bg-[#FAF6F0] border-b border-[#AEC9C0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-serif font-bold text-base text-[#2E3A36]">
            Matriz Nutricional de {currentDayLabel}
          </h4>
          <p className="text-xs text-[#2E3A36]/70">
            Toca cualquier celda para cambiar o combinar alimentos (+ / - mitades)
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#6E9E93] bg-white px-2.5 py-1 rounded-xl border border-[#AEC9C0]/60 self-start sm:self-auto">
          Hoja de referencia clínica
        </span>
      </div>

      {/* Overflow Scroll Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#FAF6F0]/80 border-b border-[#AEC9C0]/60 text-[11px] font-mono uppercase tracking-wider text-[#2E3A36]">
              <th className="p-3 font-extrabold w-44">🕒 Comida & Hora</th>
              {groupColumns.map((gKey) => {
                const meta = FOOD_GROUPS_META[gKey];
                return (
                  <th key={gKey} className="p-2.5 font-extrabold text-center min-w-[130px]">
                    <div className="flex flex-col items-center">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-[10px] mt-0.5">{meta.shortLabel}</span>
                    </div>
                  </th>
                );
              })}
              <th className="p-3 font-extrabold text-center w-24">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#AEC9C0]/40 text-xs">
            {activeMeals.map((meal) => {
              const mealKey = meal.mealKey;
              const mealSel = currentDaySelections[mealKey] || {};
              const mealTarget = meal.portions;

              let mealTotalTarget = 0;
              let mealTotalActual = 0;

              return (
                <tr key={meal.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                  {/* Comida & Horario */}
                  <td className="p-3 align-top bg-[#FAF6F0]/30 border-r border-[#AEC9C0]/30">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="font-serif font-bold text-xs text-[#2E3A36] block">
                          {meal.mealName}
                        </strong>
                        <button
                          onClick={() => onOpenFullMealModal(mealKey)}
                          className="text-[#6E9E93] hover:text-[#2E3A36] p-1"
                          title="Personalizar toda la comida"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] text-[#2E3A36]/70">
                        <Clock className="w-3 h-3 text-[#6E9E93]" />
                        <span>{meal.timeSuggestion}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#6E9E93] font-bold">
                        {meal.caloriesKcal} kcal ({meal.percentage}%)
                      </div>
                    </div>
                  </td>

                  {/* Celdas de Grupos de Alimentos */}
                  {groupColumns.map((gKey) => {
                    const target =
                      gKey === 'proteinas'
                        ? mealTarget.proteina || 0
                        : gKey === 'cereales_tuberculos'
                        ? mealTarget.carbohidrato || 0
                        : gKey === 'grasas'
                        ? mealTarget.grasa || 0
                        : gKey === 'vegetales'
                        ? mealTarget.verdura || 0
                        : mealTarget.fruta || 0;

                    const entries = mealSel[gKey] || [];
                    const actual = Number(entries.reduce((a, b) => a + b.portions, 0).toFixed(2));

                    if (target > 0) {
                      mealTotalTarget += target;
                      mealTotalActual += actual;
                    }

                    const isMet = target === 0 ? true : actual === target;
                    const isUnder = actual < target;
                    const isOver = actual > target;

                    return (
                      <td
                        key={gKey}
                        onClick={() => {
                          if (target > 0 || entries.length > 0) {
                            onOpenGroupPicker(mealKey, meal.mealName, gKey, target > 0 ? target : 1);
                          }
                        }}
                        className={`p-2.5 align-top border-r border-[#AEC9C0]/30 transition-all cursor-pointer ${
                          target === 0 && entries.length === 0
                            ? 'bg-slate-50/50 cursor-default'
                            : isMet && target > 0
                            ? 'hover:bg-[#6E9E93]/10'
                            : isOver
                            ? 'hover:bg-[#F2A488]/10'
                            : 'hover:bg-[#FAF6F0]'
                        }`}
                      >
                        {target === 0 && entries.length === 0 ? (
                          <div className="text-center text-[#2E3A36]/30 font-mono text-[11px] py-2">
                            —
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Target Header in Cell */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                  isMet
                                    ? 'bg-[#6E9E93]/15 text-[#6E9E93]'
                                    : isOver
                                    ? 'bg-[#F2A488]/20 text-[#F2A488]'
                                    : 'bg-[#FAF6F0] text-[#2E3A36]/70 border border-[#AEC9C0]/40'
                                }`}
                              >
                                {actual}/{target} porc.
                              </span>
                              {isMet && <CheckCircle2 className="w-3 h-3 text-[#6E9E93]" />}
                            </div>

                            {/* Alimentos Combinados */}
                            {entries.length > 0 ? (
                              <div className="space-y-1">
                                {entries.map((entry) => {
                                  const equiv = calculateFoodEquivalence(entry.food, entry.portions);
                                  return (
                                    <div
                                      key={entry.foodId}
                                      className="p-1.5 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0]/40 text-[10px] space-y-0.5"
                                    >
                                      <div className="font-bold text-[#2E3A36] leading-tight">
                                        {entry.portions}x {entry.food.name || entry.food.nombre}
                                      </div>
                                      <div className="text-[#6E9E93] text-[9px] font-mono leading-none">
                                        {equiv}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="w-full py-2 px-1 text-center rounded-xl border border-dashed border-[#AEC9C0] text-[10px] text-[#2E3A36]/60 hover:text-[#6E9E93] hover:border-[#6E9E93] flex items-center justify-center space-x-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Elegir</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Estado General de la Fila */}
                  <td className="p-3 align-middle text-center">
                    {mealTotalActual === mealTotalTarget ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="w-6 h-6 rounded-full bg-[#6E9E93]/20 text-[#6E9E93] flex items-center justify-center font-bold text-xs">
                          ✓
                        </span>
                        <span className="text-[9px] font-mono text-[#6E9E93] font-bold mt-1">
                          Listo
                        </span>
                      </div>
                    ) : mealTotalActual > mealTotalTarget ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="text-[10px] font-mono font-bold text-[#F2A488] bg-[#F2A488]/15 px-1.5 py-0.5 rounded">
                          +{(mealTotalActual - mealTotalTarget).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-center">
                        <span className="text-[10px] font-mono font-bold text-[#2E3A36]/60 bg-[#FAF6F0] px-1.5 py-0.5 rounded border border-[#AEC9C0]/40">
                          -{(mealTotalTarget - mealTotalActual).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Fila de Totales Diarios */}
          <tfoot>
            <tr className="bg-[#FAF6F0] border-t-2 border-[#AEC9C0] font-mono text-xs font-bold text-[#2E3A36]">
              <td className="p-3">
                <div className="text-[11px] uppercase font-bold text-[#2E3A36]">
                  Total Diario:
                </div>
                <div className="text-[10px] text-[#6E9E93] font-bold">
                  {dailyTotals.calories} kcal
                </div>
              </td>
              {groupColumns.map((gKey) => {
                const tot = dailyTotals[gKey];
                const isMet = tot.actual === tot.target;
                return (
                  <td key={gKey} className="p-2.5 text-center border-r border-[#AEC9C0]/30">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        isMet
                          ? 'bg-[#6E9E93]/20 text-[#6E9E93]'
                          : tot.actual > tot.target
                          ? 'bg-[#F2A488]/20 text-[#F2A488]'
                          : 'text-[#2E3A36]'
                      }`}
                    >
                      {tot.actual.toFixed(1)} / {tot.target.toFixed(1)}
                    </span>
                  </td>
                );
              })}
              <td className="p-3 text-center text-[10px] text-[#6E9E93] font-bold">
                Meta 100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
