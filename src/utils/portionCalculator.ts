import { FoodEquivalenceItem, FoodCategoryGroup } from '../types';

/**
 * Mapeo de grupos oficiales de Vela:
 * 1. Proteínas ('proteinas')
 * 2. Cereales y Tubérculos ('cereales_tuberculos' / 'carbohidratos')
 * 3. Frutas ('frutas')
 * 4. Vegetales ('vegetales' / 'verduras')
 * 5. Grasas comestibles ('grasas')
 */

export interface FoodGroupMeta {
  key: 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas';
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  accentBadge: string;
}

export const FOOD_GROUPS_META: Record<'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas', FoodGroupMeta> = {
  proteinas: {
    key: 'proteinas',
    label: 'Proteínas',
    shortLabel: 'Proteína',
    icon: '🥩',
    color: '#6E9E93', // Salvia
    textColor: 'text-[#6E9E93]',
    bgColor: 'bg-[#6E9E93]/10',
    borderColor: 'border-[#6E9E93]/30',
    accentBadge: 'bg-[#6E9E93] text-white',
  },
  cereales_tuberculos: {
    key: 'cereales_tuberculos',
    label: 'Cereales y Tubérculos',
    shortLabel: 'Cereales / Carbs',
    icon: '🥔',
    color: '#8FAFD1', // Azul confianza
    textColor: 'text-[#8FAFD1]',
    bgColor: 'bg-[#8FAFD1]/10',
    borderColor: 'border-[#8FAFD1]/30',
    accentBadge: 'bg-[#8FAFD1] text-[#2E3A36]',
  },
  frutas: {
    key: 'frutas',
    label: 'Frutas',
    shortLabel: 'Fruta',
    icon: '🍓',
    color: '#F2A488', // Coral
    textColor: 'text-[#F2A488]',
    bgColor: 'bg-[#F2A488]/10',
    borderColor: 'border-[#F2A488]/30',
    accentBadge: 'bg-[#F2A488] text-[#2E3A36]',
  },
  vegetales: {
    key: 'vegetales',
    label: 'Vegetales',
    shortLabel: 'Vegetales',
    icon: '🥦',
    color: '#5C9A7D', // Verde vegetal
    textColor: 'text-[#5C9A7D]',
    bgColor: 'bg-[#5C9A7D]/10',
    borderColor: 'border-[#5C9A7D]/30',
    accentBadge: 'bg-[#5C9A7D] text-white',
  },
  grasas: {
    key: 'grasas',
    label: 'Grasas comestibles',
    shortLabel: 'Grasas',
    icon: '🥑',
    color: '#D4A373', // Ambar / Dorado suave
    textColor: 'text-[#D4A373]',
    bgColor: 'bg-[#D4A373]/10',
    borderColor: 'border-[#D4A373]/30',
    accentBadge: 'bg-[#D4A373] text-[#2E3A36]',
  },
};

/**
 * Normaliza cualquier categoría o grupo al enum oficial de 5 grupos
 */
export function normalizeFoodGroup(groupOrCategory: string): 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas' {
  const g = groupOrCategory?.toLowerCase() || '';
  if (g.includes('prot')) return 'proteinas';
  if (g.includes('carb') || g.includes('cereal') || g.includes('tuber') || g.includes('harin')) return 'cereales_tuberculos';
  if (g.includes('frut') && !g.includes('fruto')) return 'frutas';
  if (g.includes('veg') || g.includes('verd') || g.includes('hortal')) return 'vegetales';
  if (g.includes('gras') || g.includes('lipid') || g.includes('aceit') || g.includes('frutos secos')) return 'grasas';
  return 'proteinas';
}

/**
 * Combinaciones clínicas no lineales para HUEVOS (Dra. Lorena Castro)
 */
const EGG_SPECIAL_PORTIONS: Record<string, string> = {
  '0.5': '2 huevos grandes | 1 huevo + 2 claras | 3-4 claras (120g)',
  '1': '4 huevos grandes | 3 huevos + 1 clara | 2 huevos + 3 claras | 1 huevo + 5 claras | 7 claras (240g)',
  '1.5': '1 huevo + 8 claras | 2 huevos + 6 claras | 3 huevos + 4 claras | 4 huevos + 2 claras | 11 claras (355g)',
  '2': '4 huevos + 6 claras | 3 huevos + 8 claras | 2 huevos + 10 claras | 1 huevo + 12 claras | 14 claras (475g)',
  '2.5': '5 huevos + 8 claras | 3 huevos + 13 claras | 18 claras (600g)',
  '3': '6 huevos + 10 claras | 4 huevos + 15 claras | 21 claras (720g)',
  '3.5': '7 huevos + 12 claras | 5 huevos + 18 claras | 25 claras (840g)',
  '4': '8 huevos + 14 claras | 6 huevos + 20 claras | 28 claras (960g)',
  '4.5': '9 huevos + 16 claras | 7 huevos + 22 claras | 32 claras (1080g)',
  '5': '10 huevos + 18 claras | 8 huevos + 24 claras | 35 claras (1200g)',
  '5.5': '11 huevos + 20 claras | 9 huevos + 26 claras | 39 claras (1320g)',
  '6': '12 huevos + 22 claras | 10 huevos + 28 claras | 42 claras (1440g)',
};

/**
 * Calcula la equivalencia exacta para una porción dada (0.5 a 6.0)
 * Escalado proporcional para la mayoría de alimentos, excepto Huevos que usa combinaciones reales no lineales.
 */
export function calculateFoodEquivalence(food: FoodEquivalenceItem, portionCount: number): string {
  if (portionCount <= 0) return '0 porciones';

  const isEgg =
    food.familia?.toLowerCase().includes('huevo') ||
    food.id?.toLowerCase().includes('huevo') ||
    food.name?.toLowerCase().startsWith('huevo') ||
    (food.nombre && food.nombre.toLowerCase().startsWith('huevo'));

  // 1. Caso especial Huevos: NUNCA usar escalado lineal, usar las combinaciones clínicas reales
  if (isEgg) {
    const key = portionCount.toString();
    if (EGG_SPECIAL_PORTIONS[key]) {
      return EGG_SPECIAL_PORTIONS[key];
    }
    if (food.porciones && food.porciones[key]) {
      return food.porciones[key];
    }
    // Para múltiplos decimales intermedios de huevos
    const floorK = Math.floor(portionCount).toString();
    if (EGG_SPECIAL_PORTIONS[floorK]) {
      return EGG_SPECIAL_PORTIONS[floorK];
    }
  }

  // 2. Revisar si el alimento ya tiene el valor predefinido en su diccionario de porciones
  const portionKey = portionCount.toString();
  if (food.porciones && food.porciones[portionKey]) {
    return food.porciones[portionKey];
  }

  // 3. Escalado proporcional inteligente sobre la porción base de 1
  const rawPortion = food.portion || food.porcion || '';
  if (!rawPortion) return `${portionCount} porción(es)`;

  if (portionCount === 1) return rawPortion;

  // Regex para '110g crudo / 80g cocido'
  const rawCookedMatch = rawPortion.match(/(\d+(?:\.\d+)?)\s*g\s*crudo\s*\/\s*(\d+(?:\.\d+)?)\s*g\s*cocido/i);
  if (rawCookedMatch) {
    const rawG = Math.round(parseFloat(rawCookedMatch[1]) * portionCount);
    const cookedG = Math.round(parseFloat(rawCookedMatch[2]) * portionCount);
    const extraMatch = rawPortion.match(/\(([^)]+)\)/);
    const extra = extraMatch ? ` (${extraMatch[1]})` : '';
    return `${rawG}g crudo / ${cookedG}g cocido${extra}`;
  }

  // Regex para 'Xg (Y cdas)' o 'Xg (Y tazas)'
  const gramsWithUnitsMatch = rawPortion.match(/(\d+(?:\.\d+)?)\s*(?:g|ml)\s*\(([^)]+)\)/i);
  if (gramsWithUnitsMatch) {
    const baseG = parseFloat(gramsWithUnitsMatch[1]);
    const scaledG = Math.round(baseG * portionCount);
    const unitText = gramsWithUnitsMatch[2];

    // Intentar escalar el número dentro del paréntesis si empieza con número (ej: '6 cdas' -> '9 cdas')
    const innerNumMatch = unitText.match(/^(\d+(?:\.\d+)?)\s*(cdas?|tazas?|cucharadas?|vasos?|tajadas?|rebanadas?|filetes?|unidades?)/i);
    if (innerNumMatch) {
      const baseUnits = parseFloat(innerNumMatch[1]);
      const scaledUnits = (baseUnits * portionCount).toFixed(1).replace('.0', '');
      const unitWord = innerNumMatch[2];
      const rest = unitText.substring(innerNumMatch[0].length);
      return `${scaledG}g (${scaledUnits} ${unitWord}${rest})`;
    }
    return `${scaledG}g (${unitText})`;
  }

  // Regex para 'Xg' o 'Xml' simple
  const simpleGramsMatch = rawPortion.match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
  if (simpleGramsMatch) {
    const baseG = parseFloat(simpleGramsMatch[1]);
    const unit = simpleGramsMatch[2];
    const scaledG = Math.round(baseG * portionCount);
    return `${scaledG}${unit}`;
  }

  // Regex para '1 unidad (120g)' o '1 arepa (80g)'
  const countWithGramsMatch = rawPortion.match(/^(\d+(?:\.\d+)?)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)\s*\((\d+(?:\.\d+)?)\s*g\)/i);
  if (countWithGramsMatch) {
    const baseCount = parseFloat(countWithGramsMatch[1]);
    const nameWord = countWithGramsMatch[2].trim();
    const baseG = parseFloat(countWithGramsMatch[3]);
    const scaledCount = (baseCount * portionCount).toFixed(1).replace('.0', '');
    const scaledG = Math.round(baseG * portionCount);
    return `${scaledCount} ${nameWord} (${scaledG}g)`;
  }

  // Fallback si no coincide con formatos complejos
  return `${portionCount}x [${rawPortion}]`;
}

/**
 * Calcula los macros totales consumidos para un alimento y porción dada
 */
export function calculateFoodMacros(food: FoodEquivalenceItem, portionCount: number): {
  proteinaG: number;
  carbohidratoG: number;
  grasaG: number;
  caloriasKcal: number;
} {
  // Si tiene cantidad numérica en gramos para 1 porción
  const baseGrams = food.cantidad_num || (food.macrosPor100g ? 100 : 100);
  const totalGrams = baseGrams * portionCount;
  const factor = totalGrams / 100;

  const p100 = food.proteina_100g ?? food.macrosPor100g?.proteinaG ?? 0;
  const c100 = food.carbo_100g ?? food.macrosPor100g?.carbohidratoG ?? 0;
  const g100 = food.grasa_100g ?? food.macrosPor100g?.grasaG ?? 0;

  const proteinaG = Number((p100 * factor).toFixed(1));
  const carbohidratoG = Number((c100 * factor).toFixed(1));
  const grasaG = Number((g100 * factor).toFixed(1));
  const caloriasKcal = Math.round(proteinaG * 4 + carbohidratoG * 4 + grasaG * 9);

  return {
    proteinaG,
    carbohidratoG,
    grasaG,
    caloriasKcal,
  };
}
