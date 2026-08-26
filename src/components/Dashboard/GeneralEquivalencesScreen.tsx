import React, { useState, useMemo } from 'react';
import { FoodEquivalenceItem } from '../../types';
import { getValidatedColombianFoods } from '../../data/colombianFoods';
import {
  FOOD_GROUPS_META,
  calculateFoodEquivalence,
  calculateFoodMacros,
} from '../../utils/portionCalculator';
import {
  X,
  Search,
  BookOpen,
  Filter,
  Package,
  Apple,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface GeneralEquivalencesScreenProps {
  isOpen: boolean;
  onClose: () => void;
  isCeliac?: boolean;
}

export const GeneralEquivalencesScreen: React.FC<GeneralEquivalencesScreenProps> = ({
  isOpen,
  onClose,
  isCeliac = false,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [selectedMealTime, setSelectedMealTime] = useState<string>('todos');
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [activeTypeTab, setActiveTypeTab] = useState<'todos' | 'alimentos' | 'productos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const portionOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6];

  const mealTimeFilters = [
    { key: 'todos', label: 'Todos los tiempos' },
    { key: 'desayuno', label: 'Desayuno' },
    { key: 'media_manana', label: 'Media Mañana' },
    { key: 'almuerzo', label: 'Almuerzo' },
    { key: 'media_tarde', label: 'Media Tarde' },
    { key: 'cena', label: 'Cena' },
  ];

  // Obtener alimentos validados
  const allFoods = useMemo(() => {
    return getValidatedColombianFoods({
      grupo: selectedGroup === 'todos' ? undefined : selectedGroup,
      isCeliac,
      typeTab: activeTypeTab,
    });
  }, [selectedGroup, isCeliac, activeTypeTab]);

  // Filtrar por búsqueda
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return allFoods;
    const q = searchQuery.toLowerCase().trim();
    return allFoods.filter((f) => {
      return (
        f.name.toLowerCase().includes(q) ||
        (f.nombre && f.nombre.toLowerCase().includes(q)) ||
        (f.colombianBrand && f.colombianBrand.toLowerCase().includes(q)) ||
        (f.familia && f.familia.toLowerCase().includes(q)) ||
        (f.notes && f.notes.toLowerCase().includes(q))
      );
    });
  }, [allFoods, searchQuery]);

  // Agrupar por familias
  const foodsByFamily = useMemo(() => {
    const map: Record<string, FoodEquivalenceItem[]> = {};
    filteredFoods.forEach((food) => {
      const fam = food.familia || 'Otras';
      if (!map[fam]) map[fam] = [];
      map[fam].push(food);
    });
    return map;
  }, [filteredFoods]);

  const families = Object.keys(foodsByFamily);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#AEC9C0] max-h-[94vh] flex flex-col relative text-[#2E3A36] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#AEC9C0]/60">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#6E9E93]" />
              <h3 className="font-serif font-bold text-xl text-[#2E3A36]">
                Tabla General de Equivalencias Clínicas
              </h3>
            </div>
            <p className="text-xs text-[#2E3A36]/70 mt-1">
              Explora libremente el catálogo validado de alimentos colombianos y calcula su gramaje para cualquier número de porciones.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#AEC9C0]/60 text-[#2E3A36]/70 hover:text-[#2E3A36] hover:bg-[#AEC9C0]/20 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel de Controles / Filtros */}
        <div className="py-3.5 space-y-3 border-b border-[#AEC9C0]/40">
          {/* Fila 1: Grupos de Alimentos */}
          <div className="flex overflow-x-auto gap-1.5 scrollbar-none pb-1">
            <button
              onClick={() => setSelectedGroup('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                selectedGroup === 'todos'
                  ? 'bg-[#6E9E93] text-white shadow-xs'
                  : 'bg-white text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15 border border-[#AEC9C0]/60'
              }`}
            >
              Todos los Grupos ({allFoods.length})
            </button>
            {Object.values(FOOD_GROUPS_META).map((meta) => {
              const isSel = selectedGroup === meta.key;
              return (
                <button
                  key={meta.key}
                  onClick={() => setSelectedGroup(meta.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all shadow-2xs ${
                    isSel
                      ? 'bg-[#6E9E93] text-white shadow-xs'
                      : 'bg-white text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15 border border-[#AEC9C0]/60'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fila 2: Selector de Porciones & Tipo & Buscador */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Multiplicador de Porciones */}
            <div className="md:col-span-4 bg-white p-2 rounded-2xl border border-[#AEC9C0]/60 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E3A36] pl-1 font-mono">
                Porción:
              </span>
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
                {portionOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPortionMultiplier(p)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      portionMultiplier === p
                        ? 'bg-[#6E9E93] text-white'
                        : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs: Todos / Alimentos / Productos */}
            <div className="md:col-span-3 bg-white p-1 rounded-2xl border border-[#AEC9C0]/60 shadow-2xs flex gap-1">
              <button
                onClick={() => setActiveTypeTab('todos')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTypeTab === 'todos' ? 'bg-[#6E9E93] text-white' : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTypeTab('alimentos')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTypeTab === 'alimentos' ? 'bg-[#6E9E93] text-white' : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
                }`}
              >
                Alimentos
              </button>
              <button
                onClick={() => setActiveTypeTab('productos')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTypeTab === 'productos' ? 'bg-[#6E9E93] text-white' : 'text-[#2E3A36]/70 hover:bg-[#AEC9C0]/15'
                }`}
              >
                Productos
              </button>
            </div>

            {/* Search Bar */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#2E3A36]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca o ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white rounded-2xl border border-[#AEC9C0]/70 text-xs text-[#2E3A36] placeholder-[#2E3A36]/40 focus:outline-none focus:border-[#6E9E93] shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto space-y-4 flex-1 py-3 pr-1">
          {families.length > 0 ? (
            families.map((fam) => {
              const famFoods = foodsByFamily[fam] || [];
              return (
                <div
                  key={fam}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#AEC9C0]/60 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#AEC9C0]/30 pb-2">
                    <h4 className="font-serif font-bold text-sm text-[#2E3A36]">
                      {fam}
                    </h4>
                    <span className="text-[11px] font-mono text-[#6E9E93] font-bold">
                      {famFoods.length} opciones
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {famFoods.map((food) => {
                      const scaledEquiv = calculateFoodEquivalence(food, portionMultiplier);
                      const macros = calculateFoodMacros(food, portionMultiplier);

                      const p100 = food.proteina_100g ?? food.macrosPor100g?.proteinaG ?? 0;
                      const c100 = food.carbo_100g ?? food.macrosPor100g?.carbohidratoG ?? 0;
                      const g100 = food.grasa_100g ?? food.macrosPor100g?.grasaG ?? 0;
                      const cal100 = food.macrosPor100g?.caloriasKcal ?? Math.round(p100 * 4 + c100 * 4 + g100 * 9);

                      return (
                        <div
                          key={food.id}
                          className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/50 space-y-2 hover:border-[#6E9E93]/60 transition-colors shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-[#2E3A36]">
                                {food.name || food.nombre}
                              </h5>
                              {food.colombianBrand && (
                                <span className="text-[10px] text-[#6E9E93] font-medium block">
                                  {food.colombianBrand}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#6E9E93]/15 text-[#6E9E93]">
                              {portionMultiplier} porc.
                            </span>
                          </div>

                          {/* Cantidad Calculada */}
                          <div className="p-2.5 bg-white rounded-xl border border-[#AEC9C0]/40 space-y-1">
                            <div className="text-xs font-bold text-[#6E9E93] flex items-center justify-between">
                              <span className="text-[11px] font-medium text-[#2E3A36]/70">Cantidad exacta:</span>
                              <span className="text-[#2E3A36]">{scaledEquiv}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#2E3A36]/70 pt-1 border-t border-[#AEC9C0]/20">
                              <span>{macros.caloriasKcal} kcal</span>
                              <span>P: {macros.proteinaG}g</span>
                              <span>C: {macros.carbohidratoG}g</span>
                              <span>G: {macros.grasaG}g</span>
                            </div>
                          </div>

                          {/* Macros por 100g */}
                          <div className="flex items-center justify-between text-[9px] font-mono text-[#2E3A36]/60">
                            <span>Base 100g: {cal100} kcal</span>
                            <span>P:{p100}g • C:{c100}g • G:{g100}g</span>
                          </div>

                          {food.notes && (
                            <p className="text-[10px] text-[#2E3A36]/70 italic leading-tight">
                              💡 {food.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#AEC9C0]/60 text-xs text-[#2E3A36]/60 space-y-1">
              <p>No se encontraron alimentos con los filtros actuales.</p>
              <p className="text-[11px] text-[#6E9E93]">Prueba seleccionando otro grupo o borrando la búsqueda.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#AEC9C0]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-[#2E3A36]/70">
            Total en vista: <strong className="text-[#2E3A36]">{filteredFoods.length}</strong> alimentos validados · Para ajustes clínicos específicos, consulta con tu médico/a o nutricionista.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#6E9E93] text-white text-xs font-bold hover:bg-[#5C897F] transition-colors shadow-xs cursor-pointer"
          >
            Cerrar Tabla
          </button>
        </div>
      </div>
    </div>
  );
};
