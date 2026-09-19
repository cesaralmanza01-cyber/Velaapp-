/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/

import {
  OnboardingData,
  MedicalConditionId,
  NeatLevel,
  MealTimeKey,
  GoalOptionKey,
} from '../types';

export interface QuickEntryInput {
  name: string;
  email: string;
  age: number;
  gender: 'femenino' | 'masculino';
  heightCm: number;
  weightKg: number;
  neatLevel: NeatLevel;
  medicalConditions: MedicalConditionId[];
  exerciseDaysPerWeek: number;
  exerciseDurationMinutes: number;
  exerciseIntensity: 'suave' | 'moderada' | 'intensa';
  activeMealTimes: MealTimeKey[];
  selectedGoal: GoalOptionKey;
  sitToStandReps?: number;
  medicalClearanceConfirmed: boolean;
  notes?: string;
}

/**
* Construye un OnboardingData completo y valido a partir de los datos
* ya recogidos en una consulta virtual 1:1, sin que la paciente tenga
* que volver a contestar el cuestionario largo. Los campos no cubiertos
* en la consulta corta se llenan con defaults clinicos razonables que
* la doctora puede ajustar despues desde el perfil de la paciente.
*/
export function buildOnboardingFromQuickEntry(input: QuickEntryInput): OnboardingData {
  return {
    name: input.name,
    email: input.email,
    age: input.age,
    gender: input.gender,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    inBodyUploaded: false,
    neatLevel: input.neatLevel,
    hasDiagnosedConditions: input.medicalConditions.length > 0,
    medicalConditions: input.medicalConditions,
    exerciseDaysPerWeek: input.exerciseDaysPerWeek,
    exerciseDurationMinutes: input.exerciseDurationMinutes,
    exerciseIntensity: input.exerciseIntensity,
    trainingPreference: input.exerciseDurationMinutes <= 20 ? 'Express 15-20min' : 'Power 45-60min',
    sitToStandReps: input.sitToStandReps ?? 12,
    activeMealTimes: input.activeMealTimes,
    wakeUpTime: '06:30',
    bedTime: '22:30',
    sleepHours: 8,
    waterLitersPerDay: 2,
    alcoholFrequency: 'ocasional',
    allergies: [],
    foodRelationship: {
      description: input.notes || '',
      emotionalEating: 'Rara vez',
      compensatoryBehaviors: 'Ninguna conducta compensatoria',
    },
    selectedGoal: input.selectedGoal,
    revision_medica: input.medicalClearanceConfirmed ? 'autorizada' : 'pendiente',
  };
}
