export type SilhouetteFatRange = {
  id: number;
  fatPercent: number;
  label: string;
  description: string;
  imageSvg: string;
};

export type RelationshipWithFood = {
  description: string; // "Culpabilidad constante", "Ansiedad por las tardes", etc.
  emotionalEating: string; // "Casi todos los días", "Varias veces/semana", etc.
  compensatoryBehaviors: string; // "Saltar comidas", "Exceso de cardio", "Ninguna"
};

export type NeatLevel = 'sedentario' | 'ligero' | 'moderado' | 'activo';

export type MedicalConditionId =
  | 'prediabetes'
  | 'diabetes'
  | 'diabetes_tipo_2'
  | 'resistencia_insulina'
  | 'hipotiroidismo'
  | 'hipertiroidismo'
  | 'sop'
  | 'embarazo'
  | 'lactancia'
  | 'cirugia_bariatrica'
  | 'hipertension'
  | 'dislipidemia'
  | 'enfermedad_renal'
  | 'celiaquia'
  | 'sii'
  | 'eii'
  | 'reflujo_gastritis'
  | 'anemia'
  | 'tca'
  | 'depresion_ansiedad'
  | 'otra_condicion'
  // Compatibilidad con identificadores anteriores
  | 'cirugia_bariatrica_reciente'
  | 'cirugia_bariatrica_antigua'
  | 'diabetes_insulina'
  | 'diabetes_sin_insulina'
  | 'tca_activo'
  | 'ninguna';

export type MedicalFollowUpAnswers = {
  prediabetesRiskInformed?: 'si' | 'no' | 'no_seguro';
  diabetesType?: 'tipo_1' | 'tipo_2' | 'no_seguro';
  diabetesUsesInsulin?: 'si' | 'no';
  diabetesManagement?: 'alimentacion' | 'oral' | 'oral_otros' | 'no_seguro';
  insulinResistanceDiagnosed?: 'si' | 'no' | 'no_seguro';
  thyroidDiagnosis?: 'hipotiroidismo' | 'hipertiroidismo' | 'no' | 'no_seguro';
  bariatricSurgeryMonths?: 'menos_12' | 'mas_12';
  dislipidemiaType?: 'ldl_alto' | 'trigliceridos_altos' | 'ambos' | 'no_seguro';
  renalConditionMildControlled?: 'si' | 'no_o_no_seguro';
  celiacDiagnosedWithExams?: 'si' | 'no' | 'no_seguro';
  siiDiagnosedFormally?: 'si' | 'no' | 'no_seguro';
  eiiType?: 'crohn' | 'colitis_ulcerativa' | 'no_seguro';
  eiiActiveFlare?: 'si' | 'no' | 'no_seguro';
  refluxGastritisSymptoms?: 'si' | 'no' | 'a_veces';
  anemiaDiagnosedWithExams?: 'si' | 'no' | 'no_seguro';
  tcaHistoryOrCompensatory?: 'si' | 'no_o_no_seguro';
  otherConditionDetails?: string;
};

export type MuscleGoalOptionKey = 'conservadora' | 'moderada' | 'maxima';

export type TrainingModalityKey =
  | 'casa_corta'       // Rutina corta en casa (15-20 min, 3 días/semana)
  | 'guiada_larga'     // Rutina larga casa-o-gimnasio guiada (1 hora, 6 días/semana)
  | 'gimnasio_pdf'     // Rutina en PDF para gimnasio tradicional, sin clase guiada
  | 'personalizado';   // Personalizado (días y duración libre)

export type ParqAnswers = {
  q1_heartCondition: boolean;
  q2_chestPainActivity: boolean;
  q3_chestPainRest: boolean;
  q4_balanceDizziness: boolean;
  q5_boneJointProblem: boolean;
  q6_bloodPressureMeds: boolean;
  q7_otherReason: boolean;
};

export type MealTimeKey = 'desayuno' | 'media_manana' | 'almuerzo' | 'media_tarde' | 'cena';

export type GoalOptionKey =
  | 'perdida_conservadora' // -250 kcal
  | 'perdida_moderada'     // -500 kcal (Recomendada)
  | 'perdida_retadora'     // -750 kcal
  | 'ganancia_conservadora'// +250 kcal (+250g/mes)
  | 'ganancia_retadora';   // +500 kcal (+500g/mes)

export type OnboardingData = {
  name: string;
  preferredName?: string; // Nombre preferido para el copy personalizado
  email: string;
  whatsapp?: string; // Número de WhatsApp para seguimiento clínico
  birthDate?: string; // Fecha de nacimiento (YYYY-MM-DD)
  countryCity?: string; // País / Ciudad de residencia
  documentId?: string; // Cédula / Documento de identidad
  age: number;
  gender: 'femenino' | 'masculino';
  lifeStage?: string; // 'Premenopausia', 'Menopausia', 'Regular', 'Postparto'
  heightCm: number;
  weightKg: number;
  inBodyUploaded: boolean;
  inBodyData?: {
    weightKg?: number;
    bodyFatPercent?: number;
    muscleMassKg?: number; // o masa magra
    visceralFatLevel?: number;
  };
  silhouetteFatPercent?: number;

  // Compuerta y ramificación de Salud y Condiciones
  hasDiagnosedConditions?: boolean; // Pregunta compuerta: "¿Tienes alguna enfermedad o condición médica diagnosticada?"
  medicalConditions: MedicalConditionId[];
  medicalFollowUpAnswers?: MedicalFollowUpAnswers;

  // Contexto Hormonal
  usesHormonalContraception?: boolean; // "¿Actualmente utilizas algún método hormonal de planificación?"

  // Alergias e Intolerancias
  hasFoodAllergies?: boolean; // "¿Tienes alguna alergia o intolerancia alimentaria?"
  allergiesNotes?: string; // Campo obligatorio si hasFoodAllergies es true
  allergies: string[];

  // Actividad física estructurada & cotidiana (NEAT) — 2 preguntas independientes
  structuredExerciseStatus?: 'si_rutina' | 'no_no_suelo' | 'no_voy_a_retomar';
  neatActivityLevel?: 'sedentaria' | 'mixta' | 'activa';
  neatLevel: NeatLevel; // sedentario (x1.2), ligero (x1.35), moderado (x1.5), activo (x1.75)

  // Ejercicio estructurado con METs (si structuredExerciseStatus === 'si_rutina')
  exerciseDaysPerWeek: number; // 0 a 7 (o rangos 1-2, 3-4, 5-6, 7)
  exerciseDurationKey?: '<30min' | '30-45min' | '45min-1h' | '1h-1h30' | '1h30-2h' | '>2h';
  exerciseDurationMinutes: number; // minutos para cálculo metabólico
  exerciseIntensityLevel?: 'baja' | 'moderada' | 'alta';
  exerciseIntensity: 'suave' | 'moderada' | 'intensa'; // 3.5, 6.0, 8.5 METs

  // Horario y Modalidad de entrenamiento (Paso 15)
  trainingTime?: string; // e.g. "06:00" o "Mañana (06:00 - 09:00)"
  trainingModality?: TrainingModalityKey;
  trainingPreference: 'Express 15-20min' | 'Power 45-60min' | 'Gimnasio con PDF' | 'Personalizado';

  // Cuestionario PAR-Q (Seguridad en Actividad Física)
  parqAnswers?: ParqAnswers;
  parqHasRisk?: boolean;
  parqNoticeAcknowledged?: boolean;

  // Test Sit-to-Stand (30 segundos)
  sitToStandReps: number; // Obligatorio como proxy de fuerza y masa muscular

  // Tiempos de comida activos (3 a 5 tiempos)
  activeMealTimes: MealTimeKey[];

  // Hábitos circadianos
  wakeUpTime: string; // "06:30"
  bedTime: string; // "22:30"
  sleepHours: number;
  waterLitersPerDay: number;
  alcoholFrequency: 'nunca' | 'ocasional' | 'semanal' | 'frecuente';

  // Relación con la comida
  foodRelationship: RelationshipWithFood;

  // Metas seleccionadas (Pérdida de grasa + Ganancia de músculo)
  selectedGoal: GoalOptionKey;
  selectedMuscleGoal?: MuscleGoalOptionKey; // Conservadora (mantener) / Moderada / Máxima
  targetWeightKg?: number;
  monthsToGoal?: number;
  revision_medica?: MedicalClearanceStatus;
};

export type GoalOptionValidation = {
  key: GoalOptionKey;
  label: string;
  deltaKcal: number;
  targetKcal: number;
  carbsGrams: number;
  isAllowed: boolean;
  blockReason?: string;
  isRecommended?: boolean;
};

export type CalculatedMetrics = {
  bmi: number;
  bmiCategory: string;
  bodyFatPercent: number;
  bodyFatCategory: string;
  muscleMassKg: number;
  muscleMassPercent: number;
  visceralFatLevel: number;
  visceralFatRisk: 'Óptimo' | 'Moderado' | 'Elevado';

  // Sit-to-Stand
  sitToStandReps: number;
  sitToStandCategory: 'Excelente' | 'Normal / Bueno' | 'Bajo (Riesgo Sarcopenia)';

  // Gasto Energético
  bmrKcal: number; // GEB
  bmrFormulaUsed: 'Cunningham (InBody Masa Magra)' | 'Mifflin-St Jeor';
  neatFactor: number;
  neatKcal: number;
  exerciseKcalDaily: number;
  exerciseMetUsed: number;
  tdeeKcal: number; // GET = (GEB * NEAT) + kcal_ejercicio_dia

  // Seguridad Calórica
  minSafeCalories: number; // Max(GEB, 1200 mujeres / 1500 hombres)
  selectedGoal: GoalOptionKey;
  targetKcal: number;
  maintenanceKcal: number;
  availableGoals: GoalOptionValidation[];

  // Bloqueo / Ajuste Médico
  isMedicalBlocked: boolean;
  medicalBlockReasons: string[];
  medicalAdjustmentsApplied: string[];

  // Macros Clínicos
  proteinGrams: number; // Fijo 2.0 g/kg
  proteinKcal: number;
  fatGrams: number;     // Fijo 0.8 g/kg
  fatKcal: number;
  carbsGrams: number;   // Absorbe el resto
  carbsKcal: number;
  carbsFloorMet: boolean; // >= 100g

  // Reparto por Comidas Activas
  mealDistributions: {
    mealKey: MealTimeKey;
    mealName: string;
    percentage: number; // Normalizado
    timeSuggestion: string;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    caloriesKcal: number;
    portions: {
      proteina: number;
      carbohidrato: number;
      grasa: number;
      fruta: number;
      verdura: number;
    };
  }[];

  priorityDetected: string;
};

export type FoodCategoryGroup = 'proteinas' | 'cereales_tuberculos' | 'frutas' | 'vegetales' | 'grasas';

export type FoodEquivalenceItem = {
  id: string;
  grupo: FoodCategoryGroup | 'carbohidratos' | 'grasas' | 'frutas' | 'verduras';
  category: 'proteinas' | 'carbohidratos' | 'grasas' | 'frutas' | 'verduras'; // Para compatibilidad
  familia: string; // "Huevos", "Pollo-Pavo (pechuga)", "Yogurt Griego", "Frutos secos", etc.
  name: string;
  nombre?: string; // Alias en español
  portion: string; // Representación de 1 porción estándar
  porcion?: string; // Alias en español
  cantidad_num?: number; // Cantidad numérica estándar para 1 porción
  unidad?: string; // Unidad de medida: 'g', 'ml', 'unidades', 'cdas', 'tazas', etc.
  is_product?: boolean; // True si es producto comercial/empacado, False si es alimento natural/materia prima
  colombianBrand?: string;
  fuente: 'referencia_verificada' | 'ia' | 'factor_metabolico' | string;
  estado_validacion: 'validado' | 'pendiente' | 'rechazado';
  glutenFree: boolean;
  // Campos nutricionales reales tipo ICBF / USDA
  proteina_100g?: number;
  carbo_100g?: number;
  grasa_100g?: number;
  macrosPor100g: {
    proteinaG: number;
    carbohidratoG: number;
    grasaG: number;
    caloriasKcal: number;
  };
  porciones?: {
    [porcionMultiplier: string]: string; // "0.5", "1", "1.5", "2", "2.5", "3", etc.
  };
  porcionesEspeciales?: string[]; // Combinaciones detalladas (ej: Huevos)
  notes?: string;
};

export type MealItem = {
  id: string;
  mealName: 'Desayuno' | 'Media Mañana' | 'Almuerzo' | 'Media Tarde' | 'Cena';
  mealKey: MealTimeKey;
  timeSuggestion: string;
  percentage: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  caloriesKcal: number;
  portions: {
    proteina: number;
    carbohidrato: number;
    grasa: number;
    fruta: number;
    verdura: number;
  };
  suggestedMenu: string;
  prepTip: string;
};

export type HungerTrackerEntry = {
  physicalHunger: number; // 1-5: 1 = sin hambre, 5 = hambre extrema
  mentalFoodNoise: number; // 1-5: 1 = sin ruido mental, 5 = obsesión constante
  timeContext?: string; // 'Mañana', 'Tarde', 'Noche', 'Post-ejercicio'
  notes?: string;
};

export type CircumferenceMeasurements = {
  waistCm?: number; // Cintura
  hipCm?: number; // Cadera
  armCm?: number; // Brazo
  thighCm?: number; // Muslo
};

// Sensación de bienestar general (1-5 o percepción de energía/ánimo/ropa)
export type WellbeingFeelingLevel = 1 | 2 | 3 | 4 | 5; // 1: Muy baja / peor, 3: Regular / igual, 5: Excelente / con mucha energía y ropa más suelta
export type WellbeingComparison = 'peor' | 'igual' | 'mejor';

export type WellbeingEntry = {
  score?: WellbeingFeelingLevel; // 1 a 5
  comparison?: WellbeingComparison; // 'peor' | 'igual' | 'mejor'
  notes?: string; // e.g. "Ropa más holgada", "Con más energía para entrenar"
};

export type MeasurementHistoryEntry = {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  visceralFatLevel?: number;
  sitToStandReps?: number;
  circumferences?: CircumferenceMeasurements;
  wellbeing?: WellbeingEntry;
  hungerTracker?: HungerTrackerEntry;
  notes?: string;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
};

export type UserRole = 'paciente' | 'doctora';

export type DoctorConsultationNote = {
  id: string;
  date: string;
  author: string;
  content: string;
};

export type DoctorFollowUpEntry = {
  id: string;
  date: string;
  channel?: 'WhatsApp' | 'Llamada' | 'Mensaje App' | 'Control';
  notes: string;
  nextAction?: string;
};

export type DoctorPrescriptionNotes = {
  eligibilityStatus?: 'Apto' | 'En Evaluación' | 'No Apto' | 'Requiere Interconsulta';
  prescriptionNotes: string;
  medicalClearanceDate?: string;
  lastUpdated: string;
};

export type ClinicalAlert = {
  id: string;
  type: 'blocking_condition' | 'plateau' | 'mental_food_noise' | 'muscle_loss';
  title: string;
  reason: string;
  severity: 'alta' | 'media';
  detectedDate: string;
};

export type MedicalClearanceStatus = 'pendiente' | 'autorizada' | 'rechazada';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role?: UserRole; // 'paciente' por defecto, 'doctora' para el panel
  createdDate: string;
  onboarding: OnboardingData;
  metrics: CalculatedMetrics;
  measurementHistory: MeasurementHistoryEntry[];
  completedCheckIns: string[]; // fechas YYYY-MM-DD
  streakDays: number;
  // Estado de revisión médica para desbloqueo
  revision_medica?: MedicalClearanceStatus;
  medicalClearanceNote?: string;
  medicalClearanceDate?: string;
  // Campos clínicos específicos para la doctora
  doctorConsultationNotes?: DoctorConsultationNote[];
  doctorFollowUps?: DoctorFollowUpEntry[];
  doctorPrescriptionNotes?: DoctorPrescriptionNotes;
  activeAlerts?: ClinicalAlert[];
};

