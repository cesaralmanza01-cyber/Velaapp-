import { MealItem, CalculatedMetrics, OnboardingData } from '../types';

export function generateCustomMealPlan(metrics: CalculatedMetrics, onboarding?: OnboardingData): MealItem[] {
  if (!metrics || !metrics.mealDistributions || metrics.mealDistributions.length === 0) {
    return [];
  }

  const isCeliac = onboarding?.medicalConditions?.includes('celiaquia');
  const hasDiabetesOrResistencia = onboarding?.medicalConditions?.includes('diabetes_sin_insulina');

  return metrics.mealDistributions.map(dist => {
    let suggestedMenu = '';
    let prepTip = '';

    const pG = dist.proteinGrams;
    const cG = dist.carbsGrams;
    const fG = dist.fatGrams;

    if (dist.mealKey === 'desayuno') {
      const carbItem = isCeliac
        ? '1 arepa mediana de maíz peto 100% puro'
        : '1 arepa mediana de maíz peto o 1 rebanada de pan de masa madre';
      suggestedMenu = `Omelette de 3 huevos enteros con espinacas y tomate chonto, ${carbItem}, acompañado de 1/4 de aguacate hass y 1 taza de papaya picada (${pG}g proteína, ${cG}g carbs, ${fG}g grasa).`;
      prepTip = 'El aguacate y las proteínas de alto valor biológico ralentizan el vaciado gástrico, aplanando la curva de insulina matutina.';
    } else if (dist.mealKey === 'media_manana') {
      suggestedMenu = `150g de Yogur Griego Natural (marca Alpina o San Martín) con 1 manzana verde en rodajas con canela molida (${pG}g proteína, ${cG}g carbs, ${fG}g grasa).`;
      prepTip = 'La canela contribuye a mejorar la captación de glucosa celular durante las horas de mayor actividad cognitiva.';
    } else if (dist.mealKey === 'almuerzo') {
      const carbOpt = hasDiabetesOrResistencia
        ? '1/2 plátano maduro horneado (almidón resistente) o 1 papa sabanera cocida al vapor'
        : '1/2 plátano maduro al horno o 1/2 taza de arroz con ajo y cebolla larga';
      suggestedMenu = `130g de Pechuga de pollo o lomo magro a la plancha con finas hierbas, ${carbOpt}, junto a abundante ensalada verde mixta con 1 cucharada de aceite de oliva extra virgen (${pG}g proteína, ${cG}g carbs, ${fG}g grasa).`;
      prepTip = 'Al enfriar el plátano o papa cocida unos minutos antes de comer, parte del almidón se convierte en almidón resistente tipo 3, nutriendo tu microbiota antiinflamatoria.';
    } else if (dist.mealKey === 'media_tarde') {
      suggestedMenu = `100g de Queso Cuajada o Campesino bajo en sal (Colanta) con 12 almendras enteras o 1 cda de mantequilla de maní sin azúcar (${pG}g proteína, ${cG}g carbs, ${fG}g grasa).`;
      prepTip = 'La combinación de grasa saludable y caseína amortigua la bajada de energía de las 4-5 PM y evita el deseo compulsivo por azúcar.';
    } else if (dist.mealKey === 'cena') {
      const carbOpt = isCeliac ? '1 papa cocida al vapor o 1/2 taza de quinoa' : '1/2 taza de arroz integral o 1 papa sabanera al vapor';
      suggestedMenu = `150g de Filete de trucha/tilapia o atún en agua con limón, ${carbOpt} y 2 tazas de verduras calientes (brócoli, calabacín salteado) con aceite de oliva (${pG}g proteína, ${cG}g carbs, ${fG}g grasa).`;
      prepTip = 'Cenar al menos 2 horas antes de acostarse favorece la secreción natural de melatonina y la autofagia celular nocturna.';
    }

    return {
      id: `m_${dist.mealKey}`,
      mealName: dist.mealName as any,
      mealKey: dist.mealKey,
      timeSuggestion: dist.timeSuggestion,
      percentage: dist.percentage,
      proteinGrams: dist.proteinGrams,
      carbsGrams: dist.carbsGrams,
      fatGrams: dist.fatGrams,
      caloriesKcal: dist.caloriesKcal,
      portions: dist.portions,
      suggestedMenu,
      prepTip,
    };
  });
}
