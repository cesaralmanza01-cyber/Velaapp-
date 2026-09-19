/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, MedicalConditionId, NeatLevel, MealTimeKey, GoalOptionKey } from '../../types';
import { calculateMetabolicMetrics } from '../../utils/metabolicCalc';
import { buildOnboardingFromQuickEntry, QuickEntryInput } from '../../utils/quickEntryBuilder';
import { X, Save } from 'lucide-react';

interface QuickPatientEntryModalProps {
  onClose: () => void;
  onCreated: (profile: UserProfile) => void;
}

const MEDICAL_OPTIONS: { id: MedicalConditionId; label: string }[] = [
  { id: 'ninguna', label: 'Ninguna' },
  { id: 'lactancia', label: 'Lactancia' },
  { id: 'embarazo', label: 'Embarazo' },
  { id: 'hipertension', label: 'Hipertension' },
  { id: 'dislipidemia', label: 'Dislipidemia / Colesterol' },
  { id: 'prediabetes', label: 'Prediabetes' },
  { id: 'diabetes_tipo_2', label: 'Diabetes tipo 2' },
  { id: 'resistencia_insulina', label: 'Resistencia a la insulina' },
  { id: 'hipotiroidismo', label: 'Hipotiroidismo' },
  { id: 'sop', label: 'SOP' },
];

const MEAL_OPTIONS: { id: MealTimeKey; label: string }[] = [
  { id: 'desayuno', label: 'Desayuno' },
  { id: 'media_manana', label: 'Media Manana' },
  { id: 'almuerzo', label: 'Almuerzo' },
  { id: 'media_tarde', label: 'Media Tarde' },
  { id: 'cena', label: 'Cena' },
];

const GOAL_OPTIONS: { id: GoalOptionKey; label: string }[] = [
  { id: 'perdida_conservadora', label: 'Perdida conservadora (-250 kcal)' },
  { id: 'perdida_moderada', label: 'Perdida moderada (-500 kcal)' },
  { id: 'perdida_retadora', label: 'Perdida retadora (-750 kcal)' },
  { id: 'ganancia_conservadora', label: 'Ganancia conservadora (+250 kcal)' },
  { id: 'ganancia_retadora', label: 'Ganancia retadora (+500 kcal)' },
];

const toggleBtnOn = 'px-3 py-1.5 rounded-full text-xs border cursor-pointer bg-[#6E9E93] text-white border-[#6E9E93]';
const toggleBtnOff = 'px-3 py-1.5 rounded-full text-xs border cursor-pointer bg-[#FAF6F0] text-[#2E3A36]/70 border-[#AEC9C0]/50';
const inputCls = 'w-full border border-[#AEC9C0]/50 rounded-lg px-3 py-2 text-sm mt-1';
const labelCls = 'text-xs font-bold text-[#2E3A36]/70';

export const QuickPatientEntryModal: React.FC<QuickPatientEntryModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'femenino' | 'masculino'>('femenino');
  const [heightCm, setHeightCm] = useState(160);
  const [weightKg, setWeightKg] = useState(70);
  const [neatLevel, setNeatLevel] = useState<NeatLevel>('sedentario');
  const [medicalConditions, setMedicalConditions] = useState<MedicalConditionId[]>([]);
  const [exerciseDaysPerWeek, setExerciseDaysPerWeek] = useState(2);
  const [exerciseDurationMinutes, setExerciseDurationMinutes] = useState(25);
  const [exerciseIntensity, setExerciseIntensity] = useState<'suave' | 'moderada' | 'intensa'>('moderada');
  const [activeMealTimes, setActiveMealTimes] = useState<MealTimeKey[]>(['desayuno', 'almuerzo', 'cena']);
  const [selectedGoal, setSelectedGoal] = useState<GoalOptionKey>('perdida_moderada');
  const [sitToStandReps, setSitToStandReps] = useState<number | undefined>(undefined);
  const [medicalClearanceConfirmed, setMedicalClearanceConfirmed] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleMedical = (id: MedicalConditionId) => {
    setMedicalConditions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleMeal = (id: MealTimeKey) => {
    setActiveMealTimes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Nombre y correo son obligatorios.');
      return;
    }
    if (activeMealTimes.length < 3) {
      setError('Selecciona al menos 3 tiempos de comida.');
      return;
    }
    setSaving(true);
    setError('');

    const input: QuickEntryInput = {
      name,
      email,
      age,
      gender,
      heightCm,
      weightKg,
      neatLevel,
      medicalConditions: medicalConditions.length > 0 ? medicalConditions : ['ninguna'],
      exerciseDaysPerWeek,
      exerciseDurationMinutes,
      exerciseIntensity,
      activeMealTimes,
      selectedGoal,
      sitToStandReps,
      medicalClearanceConfirmed,
      notes,
    };

    const onboarding = buildOnboardingFromQuickEntry(input);
    const metrics = calculateMetabolicMetrics(onboarding, onboarding.revision_medica);
    const todayStr = new Date().toISOString().split('T')[0];

    const profile: UserProfile = {
      id: Date.now().toString(),
      name,
      email,
      createdDate: todayStr,
      onboarding,
      metrics,
      role: 'paciente',
      measurementHistory: [
        {
          id: '1',
          date: todayStr,
          weightKg,
          bodyFatPercent: metrics.bodyFatPercent,
          muscleMassKg: metrics.muscleMassKg,
          visceralFatLevel: metrics.visceralFatLevel,
          sitToStandReps: metrics.sitToStandReps,
        },
      ],
      completedCheckIns: [todayStr],
      streakDays: 1,
      revision_medica: onboarding.revision_medica,
      doctorConsultationNotes: notes ? [{ id: '1', date: todayStr, author: 'Dra. Lorena Castro', content: notes }] : [],
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profile }),
      });
      if (!res.ok) throw new Error('No se pudo guardar la paciente.');
      onCreated(profile);
      onClose();
    } catch (e) {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2E3A36]">Nueva paciente - consulta 1:1</h2>
          <button onClick={onClose} className="p-1 text-[#2E3A36]/60 hover:text-[#2E3A36] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-[#2E3A36]/60">
          Para pacientes que ya tomaron su consulta virtual 1:1 y no necesitan repetir el cuestionario largo.
        </p>

        {error && (
          <div className="bg-[#F2A488]/10 border border-[#F2A488]/40 text-[#2E3A36] text-xs rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Correo</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Edad</label>
            <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Genero</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as 'femenino' | 'masculino')} className={inputCls}>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Talla (cm)</label>
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Peso (kg)</label>
            <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nivel de actividad (NEAT)</label>
            <select value={neatLevel} onChange={(e) => setNeatLevel(e.target.value as NeatLevel)} className={inputCls}>
              <option value="sedentario">Sedentario</option>
              <option value="ligero">Ligero</option>
              <option value="moderado">Moderado</option>
              <option value="activo">Activo</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Sit-to-Stand reps (opcional)</label>
            <input type="number" value={sitToStandReps ?? ''} onChange={(e) => setSitToStandReps(e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Condiciones medicas</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {MEDICAL_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => toggleMedical(opt.id)} className={medicalConditions.includes(opt.id) ? toggleBtnOn : toggleBtnOff}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Dias ejercicio/semana</label>
            <input type="number" value={exerciseDaysPerWeek} onChange={(e) => setExerciseDaysPerWeek(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Minutos/sesion</label>
            <input type="number" value={exerciseDurationMinutes} onChange={(e) => setExerciseDurationMinutes(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Intensidad</label>
            <select value={exerciseIntensity} onChange={(e) => setExerciseIntensity(e.target.value as 'suave' | 'moderada' | 'intensa')} className={inputCls}>
              <option value="suave">Suave</option>
              <option value="moderada">Moderada</option>
              <option value="intensa">Intensa</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Tiempos de comida activos</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {MEAL_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => toggleMeal(opt.id)} className={activeMealTimes.includes(opt.id) ? toggleBtnOn : toggleBtnOff}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Meta</label>
          <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value as GoalOptionKey)} className={inputCls}>
            {GOAL_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Notas de la consulta (opcional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} />
        </div>

        <label className="flex items-center gap-2 text-xs text-[#2E3A36]/80">
          <input type="checkbox" checked={medicalClearanceConfirmed} onChange={(e) => setMedicalClearanceConfirmed(e.target.checked)} />
          Confirmo autorizacion medica para iniciar plan (evaluacion ya realizada en consulta 1:1)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#2E3A36]/70 cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-[#6E9E93] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Crear plan'}
          </button>
        </div>
      </div>
    </div>
  );
};
