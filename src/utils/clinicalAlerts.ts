import { UserProfile, ClinicalAlert } from '../types';

export function calculatePatientAlerts(profile: UserProfile): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Condición médica bloqueante detectada en onboarding
  const blockingConditions = [
    'embarazo',
    'cirugia_bariatrica',
    'cirugia_bariatrica_reciente',
    'enfermedad_renal',
    'diabetes',
    'diabetes_tipo_2',
    'diabetes_insulina',
    'tca',
    'tca_activo',
  ];

  const followUp = profile.onboarding.medicalFollowUpAnswers || {};
  const medConditions = profile.onboarding.medicalConditions || [];

  const foundReasons: string[] = [];

  if (profile.metrics?.isMedicalBlocked && profile.metrics?.medicalBlockReasons?.length > 0) {
    foundReasons.push(...profile.metrics.medicalBlockReasons);
  } else {
    if (medConditions.includes('embarazo')) {
      foundReasons.push('Embarazo en curso');
    }
    if (
      medConditions.includes('cirugia_bariatrica_reciente') ||
      (medConditions.includes('cirugia_bariatrica') && (followUp.bariatricSurgeryMonths === 'menos_12' || !followUp.bariatricSurgeryMonths))
    ) {
      foundReasons.push('Cirugía bariátrica (< 12 meses)');
    }
    if (
      medConditions.includes('diabetes_insulina') ||
      ((medConditions.includes('diabetes') || medConditions.includes('diabetes_tipo_2')) && followUp.diabetesUsesInsulin === 'si')
    ) {
      foundReasons.push('Diabetes con manejo de insulina');
    }
    if (
      medConditions.includes('enfermedad_renal') &&
      (followUp.renalConditionMildControlled === 'no_o_no_seguro' || !followUp.renalConditionMildControlled)
    ) {
      foundReasons.push('Enfermedad renal no controlada');
    }
    if (
      medConditions.includes('tca_activo') ||
      (medConditions.includes('tca') && (followUp.tcaHistoryOrCompensatory === 'si' || !followUp.tcaHistoryOrCompensatory))
    ) {
      foundReasons.push('Trastorno de conducta alimentaria (TCA) activo');
    }
  }

  if (foundReasons.length > 0) {
    alerts.push({
      id: `alert-block-${profile.id}`,
      type: 'blocking_condition',
      title: 'Condición Médica Bloqueante',
      reason: `${foundReasons.join(' · ')}. Requiere consulta médica o nutricional previa; plan automático restringido.`,
      severity: 'alta',
      detectedDate: profile.createdDate || todayStr,
    });
  }

  // 2. Ruido mental / preocupación por comida sostenido en nivel 4-5
  const hasHighMentalNoiseInOnboarding =
    profile.onboarding.foodRelationship?.description?.toLowerCase().includes('ruido') ||
    profile.onboarding.foodRelationship?.description?.toLowerCase().includes('ansiedad') ||
    profile.onboarding.foodRelationship?.emotionalEating?.toLowerCase().includes('casi todos los días') ||
    profile.onboarding.foodRelationship?.emotionalEating?.toLowerCase().includes('varias veces');

  // Check in measurement history
  const recentHistory = profile.measurementHistory || [];
  const hasRecentHighNoise = recentHistory.some(
    (h) => h.hungerTracker && h.hungerTracker.mentalFoodNoise >= 4
  );

  if (hasHighMentalNoiseInOnboarding || hasRecentHighNoise) {
    alerts.push({
      id: `alert-noise-${profile.id}`,
      type: 'mental_food_noise',
      title: 'Ruido de Comida Sostenido (Nivel 4-5)',
      reason: 'Reporte continuo de ruido de comida y pensamientos recurrentes durante los últimos 7 días.',
      severity: 'alta',
      detectedDate: recentHistory[0]?.date || profile.createdDate || todayStr,
    });
  }

  // 3. Señal de pérdida de masa muscular (Caída relevante en Sit-to-Stand)
  const baselineSitToStand = profile.onboarding.sitToStandReps || profile.metrics.sitToStandReps || 14;
  const latestSitToStand = recentHistory[0]?.sitToStandReps ?? baselineSitToStand;

  if (latestSitToStand <= 10 || baselineSitToStand <= 10) {
    alerts.push({
      id: `alert-muscle-${profile.id}`,
      type: 'muscle_loss',
      title: 'Riesgo de Pérdida Muscular / Fuerza Baja',
      reason: `Test Sit-to-Stand en ${latestSitToStand} reps (rango bajo / riesgo sarcopenia o caída de masa muscular).`,
      severity: 'media',
      detectedDate: recentHistory[0]?.date || profile.createdDate || todayStr,
    });
  } else if (recentHistory.length >= 2) {
    const oldest = recentHistory[recentHistory.length - 1].sitToStandReps;
    if (oldest && oldest - latestSitToStand >= 3) {
      alerts.push({
        id: `alert-muscle-drop-${profile.id}`,
        type: 'muscle_loss',
        title: 'Caída Relevante en Fuerza Funcional',
        reason: `Disminución de ${oldest} a ${latestSitToStand} repeticiones en el test Sit-to-Stand 30s.`,
        severity: 'alta',
        detectedDate: recentHistory[0]?.date || todayStr,
      });
    }
  }

  // 4. Estancamiento clínico de 1 mes (Requiere evaluar 3 señales clínicas)
  // Regla clínica: Estancamiento = 1 mes (>= 25 días) SIN cambios positivos en NINGUNA de las 3 señales:
  // - Señal 1: Peso (reducción ponderal relevante > 0.5 kg)
  // - Señal 2: Perimetría / Medidas (reducción en cintura, cadera, brazo o muslo >= 1.0 cm)
  // - Señal 3: Sensación de bienestar (reporte de "mejor" o aumento en score de energía/ánimo/ropa)
  // Si cualquiera de las 3 mejoró en el periodo, NO es estancamiento.
  // Si faltan datos suficientes de seguimiento para evaluar el periodo, se considera información insuficiente (no alerta).
  if (recentHistory.length >= 2) {
    // Ordenamos cronológicamente para comparar primer registro del periodo con el último
    const sorted = [...recentHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldest = sorted[0];
    const latest = sorted[sorted.length - 1];

    const daysDiff = Math.abs(
      (new Date(latest.date).getTime() - new Date(oldest.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Evaluamos si ha transcurrido al menos ~4 semanas (25+ días) con check-ins
    if (daysDiff >= 25) {
      // 1. Evaluación de Peso
      const weightDiff = oldest.weightKg - latest.weightKg; // Positivo si bajó de peso
      const weightImproved = weightDiff >= 0.5; // Mejoró si bajó al menos 0.5 kg
      const weightMovedSignificant = Math.abs(oldest.weightKg - latest.weightKg) >= 0.5;

      // 2. Evaluación de Perimetría (Medidas corporales)
      let measurementsAvailable = false;
      let measurementsImproved = false;

      // Revisar si hay mediciones de circunferencia en el historial
      const entriesWithCircumferences = sorted.filter((entry) => entry.circumferences && Object.keys(entry.circumferences).length > 0);
      if (entriesWithCircumferences.length >= 2) {
        measurementsAvailable = true;
        const firstCirc = entriesWithCircumferences[0].circumferences!;
        const lastCirc = entriesWithCircumferences[entriesWithCircumferences.length - 1].circumferences!;

        const waistReduced = firstCirc.waistCm && lastCirc.waistCm ? (firstCirc.waistCm - lastCirc.waistCm >= 1.0) : false;
        const hipReduced = firstCirc.hipCm && lastCirc.hipCm ? (firstCirc.hipCm - lastCirc.hipCm >= 1.0) : false;
        const armReduced = firstCirc.armCm && lastCirc.armCm ? (firstCirc.armCm - lastCirc.armCm >= 0.5) : false;
        const thighReduced = firstCirc.thighCm && lastCirc.thighCm ? (firstCirc.thighCm - lastCirc.thighCm >= 0.5) : false;

        measurementsImproved = Boolean(waistReduced || hipReduced || armReduced || thighReduced);
      }

      // 3. Evaluación de Sensación de Bienestar
      let wellbeingAvailable = false;
      let wellbeingImproved = false;

      const entriesWithWellbeing = sorted.filter((entry) => entry.wellbeing);
      if (entriesWithWellbeing.length >= 1) {
        wellbeingAvailable = true;
        // Si reporta directamente 'mejor'
        const hasBetterComparison = entriesWithWellbeing.some(
          (e) => e.wellbeing?.comparison === 'mejor'
        );

        // Si hay comparación de scores
        let scoreIncreased = false;
        if (entriesWithWellbeing.length >= 2) {
          const firstScore = entriesWithWellbeing[0].wellbeing?.score;
          const lastScore = entriesWithWellbeing[entriesWithWellbeing.length - 1].wellbeing?.score;
          if (firstScore !== undefined && lastScore !== undefined && lastScore > firstScore) {
            scoreIncreased = true;
          }
        }

        // Si el score actual es alto (4 o 5) con notas positivas
        const lastEntry = entriesWithWellbeing[entriesWithWellbeing.length - 1];
        const highCurrentScore = (lastEntry.wellbeing?.score ?? 0) >= 4;

        wellbeingImproved = hasBetterComparison || scoreIncreased || highCurrentScore;
      }

      // REGLA CLÍNICA DE ESTANCAMIENTO:
      // Solo se dispara si NO hubo mejora en peso Y tampoco en medidas Y tampoco en bienestar.
      // Si alguna de las tres mejoró, NO es estancamiento.
      const anySignalImproved = weightImproved || measurementsImproved || wellbeingImproved;

      if (!anySignalImproved && !weightMovedSignificant) {
        // Formar el motivo clínico exacto
        const weeksCount = Math.round(daysDiff / 7);
        const reasonsList: string[] = [];

        reasonsList.push(`peso sin cambio (${latest.weightKg} kg)`);
        
        if (measurementsAvailable) {
          reasonsList.push('medidas corporales sin reducción');
        } else {
          reasonsList.push('perimetría sin reducción registrada');
        }

        if (wellbeingAvailable) {
          reasonsList.push('bienestar reportado sin mejora');
        } else {
          reasonsList.push('bienestar sin reporte de mejoría');
        }

        const clinicalReason = `Estancamiento clínico: ${reasonsList.join(', ')} — ${weeksCount} semanas.`;

        alerts.push({
          id: `alert-plateau-${profile.id}`,
          type: 'plateau',
          title: 'Estancamiento Clínico (3 Señales)',
          reason: clinicalReason,
          severity: 'media',
          detectedDate: latest.date || todayStr,
        });
      }
    }
  }

  return alerts;
}
