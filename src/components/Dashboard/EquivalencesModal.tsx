import React, { useState } from 'react';
import { getValidatedColombianFoods } from '../../data/colombianFoods';
import { X, Search, Sparkles, ShieldCheck } from 'lucide-react';

interface EquivalencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'proteinas' | 'carbohidratos' | 'grasas' | 'frutas' | 'verduras';
  isCeliac?: boolean;
}

export const EquivalencesModal: React.FC<EquivalencesModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'proteinas',
  isCeliac = false,
}) => {
  const [selectedCat, setSelectedCat] = useState<'proteinas' | 'carbohidratos' | 'grasas' | 'frutas' | 'verduras'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'proteinas' as const, label: 'Proteínas' },
    { id: 'carbohidratos' as const, label: 'Carbohidratos' },
    { id: 'grasas' as const, label: 'Grasas Saludables' },
    { id: 'frutas' as const, label: 'Frutas' },
    { id: 'verduras' as const, label: 'Verduras' },
  ];

  // Solo alimentos con estado_validacion === 'validado' y filtro celiaquía si aplica
  const validatedFoods = getValidatedColombianFoods({ isCeliac, category: selectedCat });

  const filteredFoods = validatedFoods.filter((food) => {
    const q = searchQuery.toLowerCase();
    return (
      food.name.toLowerCase().includes(q) ||
      (food.colombianBrand && food.colombianBrand.toLowerCase().includes(q)) ||
      (food.notes && food.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-xl border border-[#AEC9C0]/60 max-h-[90vh] flex flex-col relative text-[#2E3A36] overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 border-b border-[#AEC9C0]/40">
          <div>
            <h3 className="font-extrabold text-lg text-[#2E3A36] flex items-center gap-2">
              <span>Tabla de Equivalencias Clínicas</span>
              <Sparkles className="w-4 h-4 text-[#6E9E93]" />
            </h3>
            <p className="text-xs text-[#2E3A36]/70">
              Alimentos del mercado colombiano validados por la Dra. Lorena Castro
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#FAF6F0] text-[#2E3A36]/70 hover:text-[#2E3A36] border border-[#AEC9C0]/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Celiaquía si aplica */}
        {isCeliac && (
          <div className="mt-3 p-2.5 bg-[#FAF6F0] border border-[#8FAFD1]/50 rounded-xl text-xs text-[#2E3A36] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#8FAFD1]" />
            <span>Filtro de seguridad celíaca activo: solo se muestran opciones 100% libres de gluten.</span>
          </div>
        )}

        {/* Pestañas de Categoría */}
        <div className="flex overflow-x-auto gap-1.5 py-3 border-b border-[#AEC9C0]/40 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-[#6E9E93] text-white shadow-2xs'
                  : 'bg-[#FAF6F0] text-[#2E3A36] border border-[#AEC9C0]/50 hover:bg-[#AEC9C0]/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Campo de Búsqueda */}
        <div className="relative my-3">
          <Search className="w-4 h-4 text-[#2E3A36]/45 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por alimento o marca (ej. Alpina, arepa, huevos)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0]/70 text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
          />
        </div>

        {/* Lista de Alimentos Validados */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 hover:border-[#6E9E93]/60 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#2E3A36]">{item.name}</h4>
                    <div className="text-[11px] text-[#6E9E93] font-semibold mt-0.5">
                      Porción clínica: {item.portion}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#6E9E93] bg-[#6E9E93]/15 px-2 py-0.5 rounded-full border border-[#6E9E93]/30 whitespace-nowrap">
                    Validado ✓
                  </span>
                </div>

                {/* Marcas Colombianas sugeridas */}
                {item.colombianBrand && (
                  <div className="text-[11px] text-[#2E3A36]/75">
                    <strong className="text-[#2E3A36]">Marcas / Presentación:</strong> {item.colombianBrand}
                  </div>
                )}

                {/* Macros por 100g */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-[#2E3A36]/75 bg-white p-2 rounded-lg border border-[#AEC9C0]/40">
                  <span className="text-[#2E3A36] font-semibold">Por 100g:</span>
                  <span className="text-[#6E9E93] font-bold">Prot: {item.macrosPor100g.proteinaG}g</span>
                  <span className="text-[#AEC9C0]">•</span>
                  <span className="text-[#8FAFD1] font-bold">Carb: {item.macrosPor100g.carbohidratoG}g</span>
                  <span className="text-[#AEC9C0]">•</span>
                  <span className="text-[#2E3A36]/80 font-bold">Grasa: {item.macrosPor100g.grasaG}g</span>
                  <span className="text-[#AEC9C0]">•</span>
                  <span className="text-[#2E3A36] font-bold">{item.macrosPor100g.caloriasKcal} kcal</span>
                </div>

                {item.notes && (
                  <p className="text-[10px] text-[#2E3A36]/70 italic">
                    💡 {item.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#2E3A36]/60 space-y-1">
              <p>No se encontraron alimentos en esta categoría.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
