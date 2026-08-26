import {
  OnboardingData,
  CalculatedMetrics,
  GoalOptionKey,
  GoalOptionValidation,
  MealTimeKey,
  MedicalConditionId,
  MeasurementHistoryEntry,
} from '../types';

export const NEAT_FACTORS = {
  sedentario: 1.20, // Trabajo 100% sentado (oficina, remoto)
  ligero: 1.35,     // De pie con frecuencia (cajero, vendedor, docente)
  moderado: 1.50,   // Bastante movimiento (camarero, repartidor)
  activo: 1.75,     // Trabajo físico intenso (construcción, entrenador de campo)
};

export const EXERCISE_METS = {
  suave: 3.5,    // Caminata suave, yoga ligero, pilates suave
  moderada: 6.0, // Pesas moderadas, trote suave, elíptica, baile aeróbico
  intensa: 8.5,  // HIIT, Crossfit, running intenso, natación veloz
};

export const BASE_MEAL_WEIGHTS: Record<MealTimeKey, { name: string; basePercent: number; defaultTime: string }> = {
  desayuno: { name: 'Desayuno', basePercent: 25, defaultTime: '07:30 - 08:30' },
  media_manana: { name: 'Media Mañana', basePercent: 12.5, defaultTime: '10:30 - 11:00' },
  almuerzo: { name: 'Almuerzo', basePercent: 30, defaultTime: '12:30 - 13:30' },
  media_tarde: { name: 'Media Tarde', basePercent: 12.5, defaultTime: '16:00 - 16:30' },
  cena: { name: 'Cena', basePercent: 20, defaultTime: '19:30 - 20:30' },
};

export const BLOCKING_MEDICAL_CONDITIONS: { id: MedicalConditionId; label: string; reason: string }[] = [
  {
    id: 'embarazo',
    label: 'Embarazo en curso',
    reason: 'Este programa no está diseñado para personas embarazadas. Un asesor se comunicará contigo.',
  },
  {
    id: 'cirugia_bariatrica_reciente',
    label: 'Cirugía bariátrica (< 12 meses)',
    reason: 'En el primer año posterior a una cirugía bariátrica, la alimentación debe ser guiada de forma individual. Un asesor se comunicará contigo.',
  },
  {
    id: 'enfermedad_renal',
    label: 'Enfermedad renal no controlada o moderada/severa',
    reason: 'La condición renal debe ser evaluada y guiada individualmente por un profesional médico.',
  },
  {
    id: 'diabetes_insulina',
    label: 'Diabetes con uso de insulina',
    reason: 'Requiere consulta médica o nutricional especializada antes de recibir un plan automático para evitar riesgo de hipoglicemia.',
  },
  {
    id: 'tca_activo',
    label: 'Trastorno de la Conducta Alimentaria (TCA) / Conductas compensatorias',
    reason: 'Requiere consulta médica o nutricional especializada antes de cualquier plan de déficit calórico para resguardar la salud integral.',
  },
];

export function evaluateSitToStand(reps: number, age: number, gender: 'femenino' | 'masculino'): {
  category: 'Excelente' | 'Normal / Bueno' | 'Bajo (Riesgo Sarcopenia)';
  explanation: string;
} {
  // Baremos clínicos aproximados por edad para 30s Sit-to-Stand
  let thresholdLow = 11;
  let thresholdHigh = 15;

  if (age >= 60) {
    thresholdLow = 9;
    thresholdHigh = 13;
  } else if (age < 35) {
    thresholdLow = 13;
    thresholdHigh = 18;
  }

  if (gender === 'masculino') {
    thresholdLow += 1;
    thresholdHigh += 2;
  }

  if (reps >= thresholdHigh) {
    return {
      category: 'Excelente',
      explanation: 'Gran potencia muscular en tren inferior y adecuada densidad mitocondrial.',
    };
  } else if (reps >= thresholdLow) {
    return {
      category: 'Normal / Bueno',
      explanation: 'Fuerza funcional adecuada para tu grupo etario.',
    };
  } else {
    return {
      category: 'Bajo (Riesgo Sarcopenia)',
      explanation: 'Alerta de pérdida de masa muscular funcional. Es prioritario el estímulo de fuerza y aporte proteico completo.',
    };
  }
}

export function calculateMetabolicMetrics(
  data: OnboardingData,
  medicalClearanceStatus?: 'pendiente' | 'autorizada' | 'rechazada'
): CalculatedMetrics {
  const heightM = data.heightCm / 100;
  const bmi = Number((data.weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Rango Saludable';
  if (bmi < 18.5) bmiCategory = 'Bajo Peso';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Sobrepeso Metabólico';
  else if (bmi >= 30 && bmi < 35) bmiCategory = 'Obesidad Grado I / Resistencia a la Insulina';
  else if (bmi >= 35) bmiCategory = 'Obesidad Grado II+ / Inflamación Sistémica';

  // 1. Porcentaje de Grasa y Masa Muscular Magra
  let bodyFatPercent = 28;
  let muscleMassKg = Number((data.weightKg * 0.70).toFixed(1));
  let leanMassKg = muscleMassKg;

  if (data.inBodyUploaded && data.inBodyData?.bodyFatPercent) {
    bodyFatPercent = data.inBodyData.bodyFatPercent;
    if (data.inBodyData.muscleMassKg) {
      muscleMassKg = data.inBodyData.muscleMassKg;
      leanMassKg = data.inBodyData.muscleMassKg;
    } else {
      leanMassKg = Number((data.weightKg * (1 - bodyFatPercent / 100)).toFixed(1));
      muscleMassKg = leanMassKg;
    }
  } else if (data.silhouetteFatPercent) {
    bodyFatPercent = data.silhouetteFatPercent;
    leanMassKg = Number((data.weightKg * (1 - bodyFatPercent / 100)).toFixed(1));
    muscleMassKg = leanMassKg;
  } else {
    const genderFactor = data.gender === 'masculino' ? 1 : 0;
    const est = 1.20 * bmi + 0.23 * data.age - 10.8 * genderFactor - 5.4;
    bodyFatPercent = Math.min(Math.max(Number(est.toFixed(1)), 12), 52);
    leanMassKg = Number((data.weightKg * (1 - bodyFatPercent / 100)).toFixed(1));
    muscleMassKg = leanMassKg;
  }

  const muscleMassPercent = Number(((muscleMassKg / data.weightKg) * 100).toFixed(1));

  let bodyFatCategory = 'Óptimo';
  if (data.gender === 'femenino') {
    if (bodyFatPercent > 32) bodyFatCategory = 'Elevado (Resistencia a Insulina probable)';
    else if (bodyFatPercent > 25) bodyFatCategory = 'Moderado';
    else bodyFatCategory = 'Óptimo';
  } else {
    if (bodyFatPercent > 24) bodyFatCategory = 'Elevado (Riesgo Cardiometabólico)';
    else if (bodyFatPercent > 18) bodyFatCategory = 'Moderado';
    else bodyFatCategory = 'Óptimo';
  }

  // Grasa Visceral
  let visceralFatLevel = 6;
  if (data.inBodyUploaded && data.inBodyData?.visceralFatLevel) {
    visceralFatLevel = data.inBodyData.visceralFatLevel;
  } else {
    visceralFatLevel = Math.min(Math.max(Math.round((bmi - 18) * 0.55 + data.age / 12), 1), 18);
  }

  let visceralFatRisk: 'Óptimo' | 'Moderado' | 'Elevado' = 'Óptimo';
  if (visceralFatLevel >= 10) visceralFatRisk = 'Elevado';
  else if (visceralFatLevel >= 7) visceralFatRisk = 'Moderado';

  // 2. GEB (Gasto Energético Basal) - Cunningham si hay InBody/masa magra, o Mifflin-St Jeor
  let bmrKcal = 0;
  let bmrFormulaUsed: 'Cunningham (InBody Masa Magra)' | 'Mifflin-St Jeor' = 'Mifflin-St Jeor';

  if (data.inBodyUploaded && leanMassKg > 20) {
    // Cunningham: GEB = 500 + 22 * masa_magra_kg
    bmrKcal = Math.round(500 + 22 * leanMassKg);
    bmrFormulaUsed = 'Cunningham (InBody Masa Magra)';
  } else {
    // Mifflin-St Jeor
    if (data.gender === 'femenino') {
      bmrKcal = Math.round(10 * data.weightKg + 6.25 * data.heightCm - 5 * data.age - 161);
    } else {
      bmrKcal = Math.round(10 * data.weightKg + 6.25 * data.heightCm - 5 * data.age + 5);
    }
  }

  // 3. GET (Gasto Energético Total) = (GEB * Factor NEAT) + kcal_ejercicio_diario (METs)
  const neatFactor = NEAT_FACTORS[data.neatLevel || 'sedentario'];
  const neatKcal = Math.round(bmrKcal * neatFactor);

  const met = EXERCISE_METS[data.exerciseIntensity || 'moderada'];
  const hoursPerSession = (data.exerciseDurationMinutes || 45) / 60;
  const daysPerWeek = Math.min(Math.max(data.exerciseDaysPerWeek || 0, 0), 7);
  // Fórmula MET: (MET * pesoKg * horas * dias) / 7
  const exerciseKcalDaily = Math.round((met * data.weightKg * hoursPerSession * daysPerWeek) / 7);

  const tdeeKcal = Math.round(neatKcal + exerciseKcalDaily);
  const maintenanceKcal = tdeeKcal;

  // 4. Piso de Seguridad Calórica
  // Minimo: GEB o 1200 mujeres / 1500 hombres (el que sea mayor)
  const genderFloor = data.gender === 'femenino' ? 1200 : 1500;
  const minSafeCalories = Math.max(bmrKcal, genderFloor);

  // Macros fijos iniciales
  const proteinGrams = Math.round(data.weightKg * 2.0); // Fijo 2.0g/kg
  const proteinKcal = proteinGrams * 4;

  const fatGrams = Math.round(data.weightKg * 0.8);     // Fijo 0.8g/kg
  const fatKcal = fatGrams * 9;

  // 5. Validación de Condiciones Médicas
  const medicalConditions = data.medicalConditions || [];
  const followUp = data.medicalFollowUpAnswers || {};
  const hasDiagnosed = data.hasDiagnosedConditions !== false && medicalConditions.length > 0 && !medicalConditions.includes('ninguna');

  const medicalBlockReasons: string[] = [];

  if (hasDiagnosed) {
    // 1. Embarazo
    if (medicalConditions.includes('embarazo')) {
      medicalBlockReasons.push('Embarazo en curso: Requiere acompañamiento y requerimientos nutricionales específicos para la gestación.');
    }

    // 2. Cirugía bariátrica (<12 meses)
    if (
      (medicalConditions.includes('cirugia_bariatrica') && (followUp.bariatricSurgeryMonths === 'menos_12' || !followUp.bariatricSurgeryMonths)) ||
      medicalConditions.includes('cirugia_bariatrica_reciente')
    ) {
      medicalBlockReasons.push('Cirugía bariátrica (< 12 meses): Requiere adaptación gastrointestinal progresiva y suplementación individualizada.');
    }

    // 3. Diabetes con manejo de insulina
    if (
      ((medicalConditions.includes('diabetes') || medicalConditions.includes('diabetes_tipo_2')) && followUp.diabetesUsesInsulin === 'si') ||
      medicalConditions.includes('diabetes_insulina')
    ) {
      medicalBlockReasons.push('Diabetes con manejo de insulina: Requiere calibración médica prescriptiva para prevenir eventos de hipoglucemia.');
    }

    // 4. Enfermedad renal no controlada
    if (
      medicalConditions.includes('enfermedad_renal') &&
      (followUp.renalConditionMildControlled === 'no_o_no_seguro' || !followUp.renalConditionMildControlled)
    ) {
      medicalBlockReasons.push('Enfermedad renal no controlada o moderada/severa: Requiere monitoreo estricto de tasa de filtración glomerular, electrolitos y proteínas.');
    }

    // 5. Trastorno de conducta alimentaria activo (TCA)
    if (
      (medicalConditions.includes('tca') && (followUp.tcaHistoryOrCompensatory === 'si' || !followUp.tcaHistoryOrCompensatory)) ||
      medicalConditions.includes('tca_activo')
    ) {
      medicalBlockReasons.push('Trastorno de conducta alimentaria (TCA) activo: Requiere resguardo integral de la salud biopsicosocial antes de cualquier plan calórico.');
    }
  }

  const isAuthorized = medicalClearanceStatus === 'autorizada' || data.revision_medica === 'autorizada';
  const isMedicalBlocked = !isAuthorized && medicalBlockReasons.length > 0;

  const medicalAdjustmentsApplied: string[] = [];
  if (isAuthorized && medicalBlockReasons.length > 0) {
    medicalAdjustmentsApplied.push(
      'Supervisión Médica Autorizada por Dra. Lorena Castro: Caso evaluado clínicamente con adaptaciones seguras y monitoreo continuo.'
    );
  }
  const hasLactancia = hasDiagnosed && medicalConditions.includes('lactancia');
  const hasDiabetesNoInsulina = hasDiagnosed && (
    medicalConditions.includes('diabetes_sin_insulina') ||
    medicalConditions.includes('resistencia_insulina') ||
    medicalConditions.includes('prediabetes') ||
    ((medicalConditions.includes('diabetes') || medicalConditions.includes('diabetes_tipo_2')) && followUp.diabetesUsesInsulin === 'no')
  );
  const hasCeliaquia = hasDiagnosed && medicalConditions.includes('celiaquia');
  const hasDislipidemia = hasDiagnosed && medicalConditions.includes('dislipidemia');

  if (hasLactancia) {
    medicalAdjustmentsApplied.push('Lactancia: Se restringe el déficit calórico a máximo 250 kcal para proteger la producción láctea.');
  }
  if (hasDiabetesNoInsulina) {
    medicalAdjustmentsApplied.push('Resistencia a la Insulina / Prediabetes: Distribución homogénea de carbohidratos complejos en tiempos activos para aplanar curva glucémica.');
  }
  if (hasCeliaquia) {
    medicalAdjustmentsApplied.push('Celiaquía / Intolerancia al Gluten: Filtro automático activado en base de datos de equivalencias.');
  }
  if (hasDislipidemia) {
    medicalAdjustmentsApplied.push('Perfil Lipídico / Colesterol: Priorización de ácidos grasos monoinsaturados y omega-3.');
  }

  // 6. Evaluación de Opciones de Meta y Piso de Carbohidratos (>= 100g/día)
  const goalDefinitions: { key: GoalOptionKey; label: string; deltaKcal: number; isRecommended?: boolean }[] = [
    { key: 'perdida_conservadora', label: 'Pérdida de Grasa Conservadora (-250 kcal/día)', deltaKcal: -250 },
    { key: 'perdida_moderada', label: 'Pérdida de Grasa Moderada (-500 kcal/día)', deltaKcal: -500, isRecommended: true },
    { key: 'perdida_retadora', label: 'Pérdida de Grasa Retadora (-750 kcal/día)', deltaKcal: -750 },
    { key: 'ganancia_conservadora', label: 'Ganancia Muscular Limpia (+250 kcal/día)', deltaKcal: +250 },
    { key: 'ganancia_retadora', label: 'Ganancia Muscular Acelerada (+500 kcal/día)', deltaKcal: +500 },
  ];

  const availableGoals: GoalOptionValidation[] = goalDefinitions.map(def => {
    const rawTarget = tdeeKcal + def.deltaKcal;
    const carbKcalProposed = rawTarget - (proteinKcal + fatKcal);
    const carbsGramsProposed = Math.round(carbKcalProposed / 4);

    let isAllowed = true;
    let blockReason: string | undefined;

    // Regla de lactancia
    if (hasLactancia && (def.key === 'perdida_moderada' || def.key === 'perdida_retadora')) {
      isAllowed = false;
      blockReason = 'En periodo de lactancia solo se permite déficit conservador de -250 kcal.';
    }

    // Piso calórico seguro
    if (isAllowed && def.deltaKcal < 0 && rawTarget < minSafeCalories) {
      isAllowed = false;
      blockReason = `Queda por debajo de tu piso calórico seguro de ${minSafeCalories} kcal (GEB/Mínimo clínico).`;
    }

    // Piso de carbohidratos (mínimo 100g/día)
    if (isAllowed && carbsGramsProposed < 100) {
      isAllowed = false;
      blockReason = `Los carbohidratos quedarían en ${carbsGramsProposed}g/día, por debajo del piso clínico seguro de 100g/día.`;
    }

    return {
      key: def.key,
      label: def.label,
      deltaKcal: def.deltaKcal,
      targetKcal: rawTarget,
      carbsGrams: carbsGramsProposed,
      isAllowed,
      blockReason,
      isRecommended: def.isRecommended,
    };
  });

  // Determinar la meta efectiva seleccionada
  let effectiveGoalKey = data.selectedGoal || 'perdida_moderada';
  let selectedGoalObj = availableGoals.find(g => g.key === effectiveGoalKey);

  // Si la meta seleccionada no es permitida, cambiar a la mejor permitida
  if (!selectedGoalObj || !selectedGoalObj.isAllowed) {
    const fallback = availableGoals.find(g => g.isAllowed && g.deltaKcal <= 0) || availableGoals.find(g => g.isAllowed) || availableGoals[0];
    effectiveGoalKey = fallback.key;
    selectedGoalObj = fallback;
  }

  const targetKcal = selectedGoalObj.targetKcal;
  const remainingKcal = Math.max(targetKcal - (proteinKcal + fatKcal), 400);
  const carbsGrams = Math.round(remainingKcal / 4);
  const carbsKcal = carbsGrams * 4;
  const carbsFloorMet = carbsGrams >= 100;

  // 7. Test Sit-to-Stand
  const sitToStandEval = evaluateSitToStand(data.sitToStandReps || 12, data.age, data.gender);

  // 8. Reparto por Tiempos de Comida Activos (3 a 5 comidas)
  const rawActiveMeals: MealTimeKey[] = (data.activeMealTimes && data.activeMealTimes.length >= 3)
    ? data.activeMealTimes
    : ['desayuno', 'media_manana', 'almuerzo', 'media_tarde', 'cena'];

  // Suma de porcentajes base de las comidas activas
  const activeSumPercent = rawActiveMeals.reduce((sum, key) => sum + BASE_MEAL_WEIGHTS[key].basePercent, 0);

  const mealDistributions = rawActiveMeals.map(mealKey => {
    const info = BASE_MEAL_WEIGHTS[mealKey];
    // Porcentaje redistribuido normalizado
    const normalizedPercent = Number(((info.basePercent / activeSumPercent) * 100).toFixed(1));
    const factor = normalizedPercent / 100;

    const mealProtein = Math.round(proteinGrams * factor);
    const mealCarbs = Math.round(carbsGrams * factor);
    const mealFat = Math.round(fatGrams * factor);
    const mealKcal = Math.round(targetKcal * factor);

    // Porciones calculadas para Colombia
    // 1 porción proteína = 25g
    // 1 porción carbohidrato = 20g
    // 1 porción grasa = 10g
    const proteinaPortions = Math.max(Math.round(mealProtein / 25), 1);
    const carbsPortions = Math.max(Math.round(mealCarbs / 20), 1);
    const fatPortions = Math.max(Math.round(mealFat / 10), 1);

    // Frutas y verduras según el tiempo de comida
    let frutaPortions = 0;
    let verduraPortions = 0;

    if (mealKey === 'desayuno' || mealKey === 'media_manana' || mealKey === 'media_tarde') {
      frutaPortions = 1;
    }
    if (mealKey === 'almuerzo' || mealKey === 'cena') {
      verduraPortions = 2; // Abundante ensalada
    }

    return {
      mealKey,
      mealName: info.name,
      percentage: normalizedPercent,
      timeSuggestion: info.defaultTime,
      proteinGrams: mealProtein,
      carbsGrams: mealCarbs,
      fatGrams: mealFat,
      caloriesKcal: mealKcal,
      portions: {
        proteina: proteinaPortions,
        carbohidrato: carbsPortions,
        grasa: fatPortions,
        fruta: frutaPortions,
        verdura: verduraPortions,
      },
    };
  });

  // Prioridad clínica detectada
  let priorityDetected = 'Sincronía Hormonal & Eficiencia Mitocondrial';
  if (isMedicalBlocked) {
    priorityDetected = 'Consulta Médica de Seguridad Requerida';
  } else if (visceralFatRisk === 'Elevado') {
    priorityDetected = 'Desinflamación Hepática y Sensibilidad a la Insulina';
  } else if (sitToStandEval.category === 'Bajo (Riesgo Sarcopenia)') {
    priorityDetected = 'Rescate de Masa Muscular & Preservación Funcional';
  } else if (hasDiabetesNoInsulina) {
    priorityDetected = 'Aplanamiento de Curva Glucémica y Control Postprandial';
  } else if (data.foodRelationship?.emotionalEating === 'Casi todos los días' || data.foodRelationship?.emotionalEating === 'Varias veces/semana') {
    priorityDetected = 'Regulación de Ritmos y Eje Ruido de Comida';
  }

  return {
    bmi,
    bmiCategory,
    bodyFatPercent,
    bodyFatCategory,
    muscleMassKg,
    muscleMassPercent,
    visceralFatLevel,
    visceralFatRisk,
    sitToStandReps: data.sitToStandReps || 12,
    sitToStandCategory: sitToStandEval.category,
    bmrKcal,
    bmrFormulaUsed,
    neatFactor,
    neatKcal,
    exerciseKcalDaily,
    exerciseMetUsed: met,
    tdeeKcal,
    minSafeCalories,
    selectedGoal: effectiveGoalKey,
    targetKcal,
    maintenanceKcal,
    availableGoals,
    isMedicalBlocked,
    medicalBlockReasons,
    medicalAdjustmentsApplied,
    proteinGrams,
    proteinKcal,
    fatGrams,
    fatKcal,
    carbsGrams,
    carbsKcal,
    carbsFloorMet,
    mealDistributions,
    priorityDetected,
  };
}

export function generateProjectionData(currentWeightKg: number, goalKey: GoalOptionKey = 'perdida_moderada') {
  const deltaMonthlyKg: Record<GoalOptionKey, number> = {
    perdida_conservadora: 1.2,
    perdida_moderada: 2.2,
    perdida_retadora: 3.2,
    ganancia_conservadora: -0.3, // Aumento
    ganancia_retadora: -0.6,
  };

  const lossPerMonth = deltaMonthlyKg[goalKey] || 2.0;
  const isLoss = lossPerMonth > 0;
  const targetDeltaKg = isLoss ? Math.min(Math.max(currentWeightKg * 0.1, 4), 16) : 3;
  const monthsToGoal = Math.ceil(targetDeltaKg / Math.abs(lossPerMonth));
  const targetWeight = Number((isLoss ? currentWeightKg - targetDeltaKg : currentWeightKg + targetDeltaKg).toFixed(1));

  const chartPoints = [];

  for (let m = 0; m <= monthsToGoal; m++) {
    const weight = Number((currentWeightKg - (m * lossPerMonth)).toFixed(1));
    const isGoalMonth = m === monthsToGoal;
    chartPoints.push({
      monthName: m === 0 ? 'Hoy' : `Mes ${m}`,
      peso: weight,
      isGoal: isGoalMonth,
    });
  }

  // Si son pocos meses, agregar proyección de mantenimiento
  if (monthsToGoal <= 4) {
    chartPoints.push({
      monthName: `Mes ${monthsToGoal + 1}`,
      peso: targetWeight,
      isGoal: false,
    });
    chartPoints.push({
      monthName: `Mes ${monthsToGoal + 2}`,
      peso: targetWeight,
      isGoal: false,
    });
  }

  return {
    targetWeight,
    totalLossKg: targetDeltaKg,
    monthsToGoal,
    chartPoints,
  };
}

export interface ClinicalStagnationResult {
  status: 'progreso_optimo' | 'recomposicion_corporal' | 'estancamiento_real' | 'insuficientes_datos';
  title: string;
  badge: string;
  badgeColor: 'emerald' | 'blue' | 'amber' | 'slate';
  description: string;
  clinicalAction: string;
  signals: {
    weightSignal: { status: 'bajando' | 'estable' | 'subiendo'; changeKg: number; text: string };
    perimeterSignal: { status: 'reduciendo' | 'estable' | 'aumentando' | 'sin_datos'; changeCm?: number; text: string };
    wellbeingSignal: { status: 'positivo' | 'neutro' | 'alerta' | 'sin_datos'; score?: number; text: string };
  };
}

export function evaluateClinicalStagnation(history: (MeasurementHistoryEntry | any)[]): ClinicalStagnationResult {
  if (!history || history.length < 2) {
    return {
      status: 'insuficientes_datos',
      title: 'Datos en Recopilación',
      badge: 'Fase Inicial',
      badgeColor: 'slate',
      description: 'Registra tus check-ins semanales (peso, perimetría o bienestar) para que el algoritmo clínico evalúe tu tasa metabólica real.',
      clinicalAction: 'Continúa con tu plan de equivalencias y registra tu próximo check-in.',
      signals: {
        weightSignal: { status: 'estable', changeKg: 0, text: 'Primeros registros en curso.' },
        perimeterSignal: { status: 'sin_datos', text: 'Pendiente de segunda medición.' },
        wellbeingSignal: { status: 'sin_datos', text: 'Pendiente de feedback de bienestar.' },
      },
    };
  }

  // Ordenar por fecha cronológica
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  // Señal 1: Peso
  const weightDiff = Number((latest.weightKg - first.weightKg).toFixed(1));
  let weightStatus: 'bajando' | 'estable' | 'subiendo' = 'estable';
  if (weightDiff <= -0.5) weightStatus = 'bajando';
  else if (weightDiff >= 0.5) weightStatus = 'subiendo';

  // Señal 2: Perimetría (Cintura y Cadera)
  const entriesWithCirc = sorted.filter((e) => e.circumferences && (e.circumferences.waistCm || e.circumferences.hipCm));
  let perimeterStatus: 'reduciendo' | 'estable' | 'aumentando' | 'sin_datos' = 'sin_datos';
  let perimeterDiffCm: number | undefined = undefined;

  if (entriesWithCirc.length >= 2) {
    const firstCirc = entriesWithCirc[0].circumferences!;
    const latestCirc = entriesWithCirc[entriesWithCirc.length - 1].circumferences!;
    const firstWaist = firstCirc.waistCm || firstCirc.hipCm || 0;
    const latestWaist = latestCirc.waistCm || latestCirc.hipCm || 0;
    if (firstWaist > 0 && latestWaist > 0) {
      perimeterDiffCm = Number((latestWaist - firstWaist).toFixed(1));
      if (perimeterDiffCm <= -1.0) perimeterStatus = 'reduciendo';
      else if (perimeterDiffCm >= 1.0) perimeterStatus = 'aumentando';
      else perimeterStatus = 'estable';
    }
  }

  // Señal 3: Bienestar & Vitalidad
  const entriesWithWellbeing = sorted.filter((e) => e.wellbeing);
  let wellbeingStatus: 'positivo' | 'neutro' | 'alerta' | 'sin_datos' = 'sin_datos';
  let avgScore: number | undefined = undefined;

  if (entriesWithWellbeing.length > 0) {
    const latestW = entriesWithWellbeing[entriesWithWellbeing.length - 1].wellbeing!;
    avgScore = latestW.score;
    if (latestW.comparison === 'mejor' || latestW.score >= 4) {
      wellbeingStatus = 'positivo';
    } else if (latestW.comparison === 'peor' || latestW.score <= 2) {
      wellbeingStatus = 'alerta';
    } else {
      wellbeingStatus = 'neutro';
    }
  }

  // LÓGICA CLÍNICA DE LAS 3 SEÑALES:
  // 1. Si el peso está estable o sube un poco, pero cintura baja O el bienestar/fuerza es alto: RECOMPOSICIÓN CORPORAL (¡No es estancamiento!)
  if (weightStatus === 'estable' || weightStatus === 'subiendo') {
    if (perimeterStatus === 'reduciendo' || wellbeingStatus === 'positivo' || (latest.sitToStandReps && first.sitToStandReps && latest.sitToStandReps > first.sitToStandReps)) {
      return {
        status: 'recomposicion_corporal',
        title: 'Recomposición Corporal Activa (Grasa ↓ Músculo ↑)',
        badge: 'Recomposición Exitosa',
        badgeColor: 'blue',
        description: 'La báscula no se mueve significativamente porque estás ganando o reteniendo masa muscular funcional mientras pierdes grasa visceral y subcutánea.',
        clinicalAction: '¡Excelente respuesta biológica! No reduzcas calorías. Tu metabolismo está aumentando su gasto basal.',
        signals: {
          weightSignal: {
            status: weightStatus,
            changeKg: weightDiff,
            text: weightDiff === 0 ? 'Peso estable en báscula' : `${weightDiff > 0 ? '+' : ''}${weightDiff} kg (masa magra e hidratación)`,
          },
          perimeterSignal: {
            status: perimeterStatus,
            changeCm: perimeterDiffCm,
            text: perimeterDiffCm !== undefined ? `Medidas: ${perimeterDiffCm} cm en cintura/cadera` : 'Ropa más holgada reportada',
          },
          wellbeingSignal: {
            status: wellbeingStatus,
            score: avgScore,
            text: wellbeingStatus === 'positivo' ? 'Alta energía, menor ruido de comida vespertino' : 'Sensación de energía estable',
          },
        },
      };
    }

    // 2. Si peso está estable Y medidas no bajan Y bienestar es neutro o bajo: ESTANCAMIENTO CLÍNICO REAL
    if (sorted.length >= 3) {
      return {
        status: 'estancamiento_real',
        title: 'Estancamiento Metabólico Detectado',
        badge: 'Revisión Clínica Requerida',
        badgeColor: 'amber',
        description: 'El peso y las circunferencias se han mantenido sin variación en las últimas semanas. Tu organismo ha alcanzado un nuevo punto de equilibrio calórico.',
        clinicalAction: 'Ajuste recomendado: Incrementar 1,500 pasos diarios (NEAT) o ciclar carbohidratos en días de entrenamiento.',
        signals: {
          weightSignal: { status: 'estable', changeKg: weightDiff, text: `${weightDiff >= 0 ? '+' : ''}${weightDiff} kg sin variación` },
          perimeterSignal: { status: perimeterStatus, text: 'Circunferencias sin cambio significativo' },
          wellbeingSignal: { status: wellbeingStatus, score: avgScore, text: 'Vitalidad sin aumento reportado' },
        },
      };
    }
  }

  // 3. Progreso Óptimo Estándar
  return {
    status: 'progreso_optimo',
    title: 'Evolución Fisiológica Favorable',
    badge: 'Progreso Activo',
    badgeColor: 'emerald',
    description: `Tu curva de peso y bioimpedancia refleja una reducción sostenida de ${Math.abs(weightDiff)} kg sin comprometer tu masa magra.`,
    clinicalAction: 'Mantén el plan actual y la distribución horaria de tus comidas.',
    signals: {
      weightSignal: { status: 'bajando', changeKg: weightDiff, text: `${weightDiff} kg desde el inicio` },
      perimeterSignal: { status: perimeterStatus, changeCm: perimeterDiffCm, text: perimeterDiffCm ? `${perimeterDiffCm} cm reducidos` : 'Reducción volumétrica activa' },
      wellbeingSignal: { status: wellbeingStatus, score: avgScore, text: 'Buena saciedad y niveles de energía' },
    },
  };
}

