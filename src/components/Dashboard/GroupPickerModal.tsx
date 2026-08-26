import React, { useState, useMemo } from 'react';
import { FoodEquivalenceItem, MealTimeKey } from '../../types';
import { getValidatedColombianFoods } from '../../data/colombianFoods';
import {
  FOOD_GROUPS_META,
  calculateFoodEquivalence,
  calculateFoodMacros,
} from '../../utils/portionCalculator';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Package,
  Apple,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export interface SelectedFoodEntry {
  foodId: string;
  food: FoodEquivalenceItem;
  portions: number;
}

interface GroupPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupKey: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas';
  mealName: string;
  targetPortions: number;
  currentSelections: SelectedFoodEntry[];
  onUpdateSelections: (newSelections: SelectedFoodEntry[]) => void;
  isCeliac?: boolean;
}

export const GroupPickerModal: React.FC<GroupPickerModalProps> = ({
  isOpen,
  onClose,
  groupKey,
  mealName,
  targetPortions,
  currentSelections,
  onUpdateSelections,
  isCeliac = false,
}) => {
  const [activeTypeTab, setActiveTypeTab] = useState<'todos' | 'alimentos' | 'productos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});

  const groupMeta = FOOD_GROUPS_META[groupKey] || FOOD_GROUPS_META.proteinas;

  // Obtener alimentos validados del grupo con filtro de celiaquía y tab
  const allGroupFoods = useMemo(() => {
    return getValidatedColombianFoods({
      grupo: groupKey,
      isCeliac,
      typeTab: activeTypeTab,
    });
  }, [groupKey, isCeliac, activeTypeTab]);

  // Filtrar por búsqueda
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return allGroupFoods;
    const q = searchQuery.toLowerCase().trim();
    return allGroupFoods.filter((f) => {
      return (
        f.name.toLowerCase().includes(q) ||
        (f.nombre && f.nombre.toLowerCase().includes(q)) ||
        (f.colombianBrand && f.colombianBrand.toLowerCase().includes(q)) ||
        (f.familia && f.familia.toLowerCase().includes(q)) ||
        (f.notes && f.notes.toLowerCase().includes(q))
      );
    });
  }, [allGroupFoods, searchQuery]);

  // Agrupar por familias
  const foodsByFamily = useMemo(() => {
    const map: Record<string, FoodEquivalenceItem[]> = {};
    filteredFoods.forEach((food) => {
      const fam = food.familia || 'Otras opciones';
      if (!map[fam]) map[fam] = [];
      map[fam].push(food);
    });
    return map;
  }, [filteredFoods]);

  const familiesList = Object.keys(foodsByFamily);

  // Toggle expansión de familia
  const toggleFamily = (fam: string) => {
    setExpandedFamilies((prev) => ({
      ...prev,
      [fam]: prev[fam] === undefined ? false : !prev[fam],
    }));
  };

  const isFamilyExpanded = (fam: string) => {
    if (searchQuery.trim().length > 0) return true;
    if (expandedFamilies[fam] !== undefined) return expandedFamilies[fam];
    return true; // Expandidas por defecto
  };

  // Calcular porciones totales actualmente seleccionadas (permitiendo decimales 0.5, 0.25, 1, etc.)
  const totalPortionsInPlan = Number(
    currentSelections.reduce((acc, curr) => acc + curr.portions, 0).toFixed(2)
  );
  const remainingPortions = Number(Math.max(0, targetPortions - totalPortionsInPlan).toFixed(2));
  const isTargetMet = totalPortionsInPlan === targetPortions;
  const isOverTarget = totalPortionsInPlan > targetPortions;
  const progressPercent =
    targetPortions > 0 ? Math.min(100, Math.round((totalPortionsInPlan / targetPortions) * 100)) : 100;

  // Handlers para modificar las porciones con step de 0.5 y LÍMITE DURO
  const handleIncreasePortion = (foodId: string, step = 0.5) => {
    if (remainingPortions <= 0) return; // Límite duro: no permitir sumar más del objetivo
    const actualStep = Math.min(step, remainingPortions);
    if (actualStep <= 0) return;

    const existing = currentSelections.find((s) => s.foodId === foodId);
    if (existing) {
      const updated = currentSelections.map((s) =>
        s.foodId === foodId ? { ...s, portions: Number((s.portions + actualStep).toFixed(2)) } : s
      );
      onUpdateSelections(updated);
    }
  };

  const handleDecreasePortion = (foodId: string, step = 0.5) => {
    const existing = currentSelections.find((s) => s.foodId === foodId);
    if (existing) {
      if (existing.portions <= step) {
        handleRemoveFood(foodId);
      } else {
        const updated = currentSelections.map((s) =>
          s.foodId === foodId ? { ...s, portions: Number((s.portions - step).toFixed(2)) } : s
        );
        onUpdateSelections(updated);
      }
    }
  };

  const handleRemoveFood = (foodId: string) => {
    const updated = currentSelections.filter((s) => s.foodId !== foodId);
    onUpdateSelections(updated);
  };

  const handleSelectOrAddFood = (food: FoodEquivalenceItem, defaultPortion?: number) => {
    if (remainingPortions <= 0) return; // Límite duro: objetivo completado

    const existing = currentSelections.find((s) => s.foodId === food.id);
    if (existing) {
      handleIncreasePortion(food.id, 0.5);
    } else {
      let portionToAdd = 0.5;
      if (defaultPortion) {
        portionToAdd = Math.min(defaultPortion, remainingPortions);
      } else if (remainingPortions > 0) {
        portionToAdd = remainingPortions <= 0.5 ? remainingPortions : 0.5;
      }

      if (portionToAdd <= 0) return;

      const newEntry: SelectedFoodEntry = {
        foodId: food.id,
        food,
        portions: Number(portionToAdd.toFixed(2)),
      };
      onUpdateSelections([...currentSelections, newEntry]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] w-full max-w-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#AEC9C0] max-h-[92vh] flex flex-col relative text-[#2E3A36] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#AEC9C0]/60">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{groupMeta.icon}</span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2E3A36]">
                {groupMeta.label} en {mealName}
              </h3>
            </div>
            <p className="text-xs text-[#2E3A36]/70">
              Combina alimentos del mismo grupo hasta sumar tu porción requerida
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#AEC9C0]/60 text-[#2E3A36]/70 hover:text-[#2E3A36] hover:bg-[#AEC9C0]/20 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. BARRA DE PROGRESO SIMPLE & ESTADO ULTRA CLARO (Para un niño de 10 años) */}
        <div className="my-3 p-4 bg-white rounded-3xl border border-[#AEC9C0]/70 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3A36] font-mono">
              Tu Objetivo: {targetPortions} porción{targetPortions !== 1 ? 'es' : ''}
            </span>

            {/* Badge de Estado */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 ${
                isTargetMet
                  ? 'bg-[#6E9E93] text-white shadow-xs'
                  : totalPortionsInPlan === 0
                  ? 'bg-[#FAF6F0] text-[#2E3A36]/70 border border-[#AEC9C0]/60'
                  : 'bg-[#6E9E93]/15 text-[#6E9E93] border border-[#6E9E93]/40'
              }`}
            >
              {isTargetMet ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ ¡Límite Exacto Cumplido!</span>
                </>
              ) : (
                <span>
                  {totalPortionsInPlan} de {targetPortions} — te falta {remainingPortions}
                </span>
              )}
            </div>
          </div>

          {/* Barra Visual de Progreso */}
          <div className="w-full bg-[#FAF6F0] h-3.5 rounded-full overflow-hidden border border-[#AEC9C0]/50 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isTargetMet ? 'bg-[#6E9E93]' : 'bg-[#6E9E93]/80'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Mensaje de guía intuitivo */}
          <div className="text-[11px] text-[#2E3A36]/80 flex items-center justify-between">
            <span>
              {isTargetMet ? (
                <strong className="text-[#6E9E93]">
                  ¡Límite exacto de {targetPortions} porción{targetPortions !== 1 ? 'es' : ''} alcanzado! Bloqueo activo. Resta para cambiar.
                </strong>
              ) : totalPortionsInPlan > 0 ? (
                <span>Puedes agregar hasta <strong>{remainingPortions} porción más</strong> para completar tu meta.</span>
              ) : (
                <span>Toca <strong>+0.5</strong> o <strong>+1.0</strong> abajo hasta completar tus {targetPortions} porciones.</span>
              )}
            </span>

            {/* Suma en tiempo real */}
            <span className="font-mono font-extrabold text-xs text-[#2E3A36]">
              {totalPortionsInPlan} / {targetPortions}
            </span>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 py-1">
          
          {/* 2. ALIMENTOS YA COMBINADOS EN ESTA COMIDA */}
          {currentSelections.length > 0 && (
            <div className="bg-[#FAF6F0] rounded-2xl p-3.5 border border-[#AEC9C0]/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3A36] font-mono flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#6E9E93]" />
                  <span>Tu Combinación Actual:</span>
                </span>
                <span className="text-[11px] font-mono text-[#6E9E93] font-bold">
                  {currentSelections.length} alimento{currentSelections.length > 1 ? 's combinados' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {currentSelections.map((sel) => {
                  const food = sel.food;
                  const equivText = calculateFoodEquivalence(food, sel.portions);
                  const macros = calculateFoodMacros(food, sel.portions);

                  return (
                    <div
                      key={sel.foodId}
                      className="p-3 bg-white rounded-2xl border border-[#AEC9C0]/50 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#2E3A36]">
                            {food.name || food.nombre}
                          </h4>
                          <span className="text-[11px] text-[#6E9E93] font-semibold block">
                            ⚖️ Servir: <strong>{equivText}</strong>
                          </span>
                        </div>

                        {/* Steppers +/- Grandes y Claros */}
                        <div className="flex items-center space-x-1.5 bg-[#FAF6F0] p-1 rounded-2xl border border-[#AEC9C0]/60">
                          <button
                            type="button"
                            onClick={() => handleDecreasePortion(sel.foodId, 0.5)}
                            className="w-8 h-8 rounded-xl bg-white border border-[#AEC9C0]/60 text-[#2E3A36] font-bold hover:bg-[#AEC9C0]/20 flex items-center justify-center shadow-2xs"
                            title="Restar 0.5"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="font-mono text-xs font-black px-2 text-[#2E3A36] min-w-[3rem] text-center">
                            {sel.portions} porc.
                          </span>

                          <button
                            type="button"
                            disabled={remainingPortions < 0.5}
                            onClick={() => handleIncreasePortion(sel.foodId, 0.5)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              remainingPortions < 0.5
                                ? 'bg-[#AEC9C0]/30 text-[#2E3A36]/30 cursor-not-allowed opacity-50'
                                : 'bg-[#6E9E93] text-white font-bold hover:bg-[#5C897F] shadow-2xs cursor-pointer'
                            }`}
                            title={remainingPortions < 0.5 ? 'Límite de porciones alcanzado' : 'Sumar 0.5'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveFood(sel.foodId)}
                            className="p-1.5 text-[#F2A488] hover:bg-[#F2A488]/10 rounded-xl transition-colors ml-1"
                            title="Quitar de la combinación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Info Nutricional Simple */}
                      <div className="text-[10px] text-[#2E3A36]/60 font-mono flex items-center space-x-2 pt-1 border-t border-[#FAF6F0]">
                        <span>{macros.caloriasKcal} kcal</span>
                        <span>•</span>
                        <span>Prot: {macros.proteinaG}g</span>
                        <span>•</span>
                        <span>Carb: {macros.carbohidratoG}g</span>
                        <span>•</span>
                        <span>Grasa: {macros.grasaG}g</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CATÁLOGO DE OPCIONES DISPONIBLES */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3A36]/80 font-mono">
                Catálogo de Opciones para Combinar
              </span>
              <span className="text-[11px] text-[#2E3A36]/60">
                {filteredFoods.length} opciones
              </span>
            </div>

            {/* Tabs: Todos / Alimentos Caseros / Marcas Supermercado */}
            <div className="flex bg-white p-1 rounded-2xl border border-[#AEC9C0]/50 shadow-2xs gap-1">
              <button
                type="button"
                onClick={() => setActiveTypeTab('todos')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTypeTab === 'todos'
                    ? 'bg-[#6E9E93] text-white shadow-2xs'
                    : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
                }`}
              >
                Todos ({allGroupFoods.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab('alimentos')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTypeTab === 'alimentos'
                    ? 'bg-[#6E9E93] text-white shadow-2xs'
                    : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>Caseros / Naturales</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab('productos')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTypeTab === 'productos'
                    ? 'bg-[#6E9E93] text-white shadow-2xs'
                    : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Marcas / Empacados</span>
              </button>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#2E3A36]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar (ej. pan, arepa, papa, huevo, pechuga, aguacate)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white rounded-2xl border border-[#AEC9C0]/70 text-xs text-[#2E3A36] placeholder-[#2E3A36]/40 focus:outline-none focus:border-[#6E9E93] shadow-2xs"
              />
            </div>

            {/* Lista Agrupada por Familias */}
            <div className="space-y-3">
              {familiesList.length > 0 ? (
                familiesList.map((fam) => {
                  const famFoods = foodsByFamily[fam] || [];
                  const isExpanded = isFamilyExpanded(fam);

                  return (
                    <div
                      key={fam}
                      className="bg-white rounded-2xl border border-[#AEC9C0]/60 overflow-hidden shadow-2xs"
                    >
                      {/* Family Header */}
                      <button
                        type="button"
                        onClick={() => toggleFamily(fam)}
                        className="w-full p-3 bg-[#FAF6F0]/70 hover:bg-[#FAF6F0] flex items-center justify-between text-left transition-colors border-b border-[#AEC9C0]/30"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#2E3A36] font-serif">
                            {fam}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#AEC9C0]/30 text-[#2E3A36] text-[10px] font-mono font-bold">
                            {famFoods.length}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#2E3A36]/60" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#2E3A36]/60" />
                        )}
                      </button>

                      {/* Items */}
                      {isExpanded && (
                        <div className="p-3 space-y-2.5 divide-y divide-[#AEC9C0]/30">
                          {famFoods.map((food) => {
                            const selectedEntry = currentSelections.find((s) => s.foodId === food.id);
                            const isAlreadySelected = Boolean(selectedEntry);

                            const equiv1Porcion = calculateFoodEquivalence(food, 1);
                            const equivMitadPorcion = calculateFoodEquivalence(food, 0.5);

                            return (
                              <div
                                key={food.id}
                                className="pt-2.5 first:pt-0 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center space-x-1.5 flex-wrap">
                                      <h5 className="text-xs font-bold text-[#2E3A36]">
                                        {food.name || food.nombre}
                                      </h5>
                                      {food.glutenFree && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#8FAFD1]/20 text-[#2E3A36]">
                                          Sin gluten
                                        </span>
                                      )}
                                    </div>

                                    {food.colombianBrand && (
                                      <span className="text-[10px] text-[#6E9E93] font-medium block">
                                        Marca: {food.colombianBrand}
                                      </span>
                                    )}

                                    {/* Medidas directas para 1 y 0.5 porción */}
                                    <div className="text-[11px] text-[#2E3A36]/80 pt-0.5 space-y-0.5">
                                      <div>
                                        <span className="text-[#6E9E93] font-semibold">1 porción:</span>{' '}
                                        <strong className="text-[#2E3A36]">{equiv1Porcion}</strong>
                                      </div>
                                      <div className="text-[#2E3A36]/65 text-[10px]">
                                        <span>0.5 porción (media): {equivMitadPorcion}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Botones de Acción */}
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {isAlreadySelected ? (
                                      <div className="flex items-center space-x-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#6E9E93]">
                                        <button
                                          type="button"
                                          onClick={() => handleDecreasePortion(food.id, 0.5)}
                                          className="w-7 h-7 rounded-lg bg-white text-[#2E3A36] flex items-center justify-center font-bold border border-[#AEC9C0]/50"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="font-mono text-xs font-extrabold px-1.5 text-[#6E9E93]">
                                          {selectedEntry?.portions}
                                        </span>
                                        <button
                                          type="button"
                                          disabled={remainingPortions < 0.5}
                                          onClick={() => handleIncreasePortion(food.id, 0.5)}
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${
                                            remainingPortions < 0.5
                                              ? 'bg-[#AEC9C0]/30 text-[#2E3A36]/30 cursor-not-allowed opacity-50'
                                              : 'bg-[#6E9E93] text-white hover:bg-[#5C897F] cursor-pointer'
                                          }`}
                                          title={remainingPortions < 0.5 ? 'Límite alcanzado' : 'Sumar 0.5'}
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          disabled={remainingPortions < 0.5}
                                          onClick={() => handleSelectOrAddFood(food, 0.5)}
                                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-2xs flex items-center space-x-1 ${
                                            remainingPortions < 0.5
                                              ? 'bg-[#FAF6F0] text-[#2E3A36]/30 border border-[#AEC9C0]/30 opacity-40 cursor-not-allowed'
                                              : 'bg-[#FAF6F0] text-[#2E3A36] border border-[#AEC9C0]/70 hover:bg-[#AEC9C0]/20 cursor-pointer'
                                          }`}
                                          title={remainingPortions < 0.5 ? 'Límite alcanzado' : 'Agregar 0.5 porción'}
                                        >
                                          <Plus className="w-3 h-3 text-[#6E9E93]" />
                                          <span>+0.5</span>
                                        </button>

                                        <button
                                          type="button"
                                          disabled={remainingPortions < 1.0}
                                          onClick={() => handleSelectOrAddFood(food, 1.0)}
                                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-2xs flex items-center space-x-1 ${
                                            remainingPortions < 1.0
                                              ? 'bg-[#6E9E93]/30 text-white/50 opacity-40 cursor-not-allowed'
                                              : 'bg-[#6E9E93] text-white hover:bg-[#5C897F] cursor-pointer'
                                          }`}
                                          title={remainingPortions < 1.0 ? 'Excede el límite' : 'Agregar 1.0 porción'}
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>+1.0</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {food.notes && (
                                  <p className="text-[10px] text-[#2E3A36]/65 italic">
                                    💡 {food.notes}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#AEC9C0]/60 text-xs text-[#2E3A36]/60 space-y-1">
                  <p>No se encontraron opciones con el término de búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#AEC9C0]/60 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-[#2E3A36]/70">Suma total: </span>
            <strong
              className={`font-mono text-sm ${
                isTargetMet ? 'text-[#6E9E93]' : isOverTarget ? 'text-[#F2A488]' : 'text-[#2E3A36]'
              }`}
            >
              {totalPortionsInPlan} / {targetPortions} porción(es)
            </strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#6E9E93] text-white font-bold text-xs hover:bg-[#5C897F] transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Combinación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
