import React, { useState } from 'react';
import {
  UserProfile,
  DoctorConsultationNote,
  DoctorFollowUpEntry,
  MedicalClearanceStatus,
} from '../../types';
import { calculatePatientAlerts } from '../../utils/clinicalAlerts';
import {
  X,
  User,
  Scale,
  Activity,
  Heart,
  BrainCircuit,
  Save,
  Trash2,
  Edit2,
  Plus,
  Lock,
  CheckCircle2,
  ShieldAlert,
  Ruler,
  Smile,
  ShieldCheck,
  AlertOctagon,
  Clock,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: UserProfile;
  onClose: () => void;
  onUpdatePatient: (updated: UserProfile) => void;
}

type SubTabType = 'onboarding' | 'plan' | 'evolution' | 'notes' | 'followup' | 'doctor_only';

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onUpdatePatient,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('onboarding');

  // Notes state
  const [notesList, setNotesList] = useState<DoctorConsultationNote[]>(
    patient.doctorConsultationNotes || []
  );
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Follow-up state
  const [followUps, setFollowUps] = useState<DoctorFollowUpEntry[]>(
    patient.doctorFollowUps || []
  );
  const [newFollowUpNotes, setNewFollowUpNotes] = useState<string>('');
  const [newFollowUpChannel, setNewFollowUpChannel] = useState<'WhatsApp' | 'Llamada' | 'Mensaje App' | 'Control'>('WhatsApp');
  const [newFollowUpAction, setNewFollowUpAction] = useState<string>('');
  const [savingFollowUp, setSavingFollowUp] = useState<boolean>(false);

  // Doctor Only confidential prescription notes state
  const [eligibilityStatus, setEligibilityStatus] = useState<string>(
    patient.doctorPrescriptionNotes?.eligibilityStatus || 'En Evaluación'
  );
  const [prescriptionNotes, setPrescriptionNotes] = useState<string>(
    patient.doctorPrescriptionNotes?.prescriptionNotes || ''
  );
  const [savingPrescription, setSavingPrescription] = useState<boolean>(false);
  const [prescriptionSavedAlert, setPrescriptionSavedAlert] = useState<boolean>(false);

  // Medical Clearance / Authorization state
  const [clearanceStatus, setClearanceStatus] = useState<MedicalClearanceStatus>(
    patient.revision_medica || (patient.metrics?.isMedicalBlocked ? 'pendiente' : 'autorizada')
  );
  const [clearanceModalOpen, setClearanceModalOpen] = useState<boolean>(false);
  const [clearanceAction, setClearanceAction] = useState<'autorizada' | 'rechazada'>('autorizada');
  const [mandatoryDoctorNote, setMandatoryDoctorNote] = useState<string>('');
  const [clearanceError, setClearanceError] = useState<string>('');
  const [savingClearance, setSavingClearance] = useState<boolean>(false);

  const handleOpenClearanceModal = (action: 'autorizada' | 'rechazada') => {
    setClearanceAction(action);
    setClearanceError('');
    setMandatoryDoctorNote(
      action === 'autorizada'
        ? 'Paciente autorizada tras valoración clínica. Se ajustan macronutrientes y se establece seguimiento personalizado sin riesgo metabólico.'
        : 'Se mantiene condición bloqueada por protocolo de seguridad. Requiere valoración médica presencial externa antes de continuar.'
    );
    setClearanceModalOpen(true);
  };

  const handleConfirmClearance = async () => {
    if (clearanceAction === 'autorizada' && !mandatoryDoctorNote.trim()) {
      setClearanceError('La nota médica privada es obligatoria para autorizar que el paciente continúe.');
      return;
    }

    setSavingClearance(true);
    setClearanceError('');
    try {
      const res = await fetch(`/api/doctor/patient/${encodeURIComponent(patient.email)}/clearance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: clearanceAction,
          doctorNote: mandatoryDoctorNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.patient) {
        setClearanceStatus(clearanceAction);
        onUpdatePatient(data.patient);
        if (data.patient.doctorConsultationNotes) {
          setNotesList(data.patient.doctorConsultationNotes);
        }
        setClearanceModalOpen(false);
      } else {
        setClearanceError(data.error || 'Error al actualizar autorización médica.');
      }
    } catch (err) {
      setClearanceError('Error de red al procesar revisión médica.');
    } finally {
      setSavingClearance(false);
    }
  };

  const onboarding = patient.onboarding;
  const metrics = patient.metrics;
  const history = patient.measurementHistory || [];
  const alerts = calculatePatientAlerts(patient);

  // Add note handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    setSavingNote(true);

    try {
      const res = await fetch(
        `/api/doctor/patient/${encodeURIComponent(patient.email)}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newNoteContent, author: 'Dra. Lorena' }),
        }
      );
      const data = await res.json();
      if (data.success && data.notes) {
        setNotesList(data.notes);
        onUpdatePatient({ ...patient, doctorConsultationNotes: data.notes });
        setNewNoteContent('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Edit note handler
  const handleSaveEditNote = async (noteId: string) => {
    if (!editingContent.trim()) return;
    try {
      const res = await fetch(
        `/api/doctor/patient/${encodeURIComponent(patient.email)}/notes/${noteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editingContent }),
        }
      );
      const data = await res.json();
      if (data.success && data.notes) {
        setNotesList(data.notes);
        onUpdatePatient({ ...patient, doctorConsultationNotes: data.notes });
        setEditingNoteId(null);
      }
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  // Delete note handler
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('¿Estás segura de eliminar esta nota de consulta?')) return;
    try {
      const res = await fetch(
        `/api/doctor/patient/${encodeURIComponent(patient.email)}/notes/${noteId}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (data.success && data.notes) {
        setNotesList(data.notes);
        onUpdatePatient({ ...patient, doctorConsultationNotes: data.notes });
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Add follow-up entry handler
  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUpNotes.trim()) return;
    setSavingFollowUp(true);

    try {
      const res = await fetch(
        `/api/doctor/patient/${encodeURIComponent(patient.email)}/follow-up`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: newFollowUpNotes,
            channel: newFollowUpChannel,
            nextAction: newFollowUpAction,
          }),
        }
      );
      const data = await res.json();
      if (data.success && data.followUps) {
        setFollowUps(data.followUps);
        onUpdatePatient({ ...patient, doctorFollowUps: data.followUps });
        setNewFollowUpNotes('');
        setNewFollowUpAction('');
      }
    } catch (err) {
      console.error('Error adding follow up:', err);
    } finally {
      setSavingFollowUp(false);
    }
  };

  // Save Doctor Only prescription notes handler
  const handleSavePrescription = async () => {
    setSavingPrescription(true);
    setPrescriptionSavedAlert(false);
    try {
      const res = await fetch(
        `/api/doctor/patient/${encodeURIComponent(patient.email)}/prescription`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eligibilityStatus,
            prescriptionNotes,
          }),
        }
      );
      const data = await res.json();
      if (data.success && data.prescriptionNotes) {
        onUpdatePatient({ ...patient, doctorPrescriptionNotes: data.prescriptionNotes });
        setPrescriptionSavedAlert(true);
        setTimeout(() => setPrescriptionSavedAlert(false), 3500);
      }
    } catch (err) {
      console.error('Error saving prescription notes:', err);
    } finally {
      setSavingPrescription(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-[#AEC9C0] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl text-[#2E3A36] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Superior del Paciente */}
        <div className="p-5 sm:p-6 bg-[#FAF6F0] border-b border-[#AEC9C0]/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2E3A36] flex items-center gap-2 font-serif">
                <User className="w-5 h-5 text-[#6E9E93]" />
                {patient.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#AEC9C0]/60 text-[11px] text-[#2E3A36] font-medium font-mono">
                {onboarding.age} años · {onboarding.gender === 'femenino' ? 'Mujer' : 'Hombre'}
              </span>
              {onboarding.lifeStage && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#6E9E93]/15 border border-[#6E9E93]/30 text-[11px] text-[#6E9E93] font-medium">
                  {onboarding.lifeStage}
                </span>
              )}
            </div>
            <div className="text-xs text-[#2E3A36]/70 flex flex-wrap items-center gap-3">
              <span>{patient.email}</span>
              <span>·</span>
              <span>Registrado: {patient.createdDate}</span>
              <span>·</span>
              <span className="text-[#6E9E93] font-semibold">Racha: {patient.streakDays} días</span>
            </div>

            {/* Banners de Alerta si existen */}
            {alerts.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="px-2.5 py-1 rounded-xl bg-[#F2A488]/20 border border-[#F2A488]/60 text-[11px] text-[#2E3A36] font-medium flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#2E3A36] flex-shrink-0" />
                    <span><strong>{a.title}:</strong> {a.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Panel de Control de Revisión y Autorización Médica */}
            <div className="mt-3 p-3.5 bg-white border border-[#AEC9C0] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#2E3A36] font-mono">Estado Clínico:</span>
                {clearanceStatus === 'autorizada' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6E9E93]/20 border border-[#6E9E93] text-[#2E3A36] text-xs font-bold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6E9E93]" />
                    <span>Autorizada por la Dra. Lorena</span>
                  </span>
                ) : clearanceStatus === 'rechazada' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F2A488]/20 border border-[#F2A488] text-[#2E3A36] text-xs font-bold font-mono">
                    <AlertOctagon className="w-3.5 h-3.5 text-[#F2A488]" />
                    <span>Bloqueada / Requiere Consulta Externa</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8FAFD1]/25 border border-[#8FAFD1] text-[#2E3A36] text-xs font-bold font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#8FAFD1]" />
                    <span>En Revisión Médica (Pendiente)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleOpenClearanceModal('autorizada')}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    clearanceStatus === 'autorizada'
                      ? 'bg-[#6E9E93]/20 text-[#2E3A36] border border-[#6E9E93]'
                      : 'bg-[#6E9E93] hover:bg-[#5C897F] text-white shadow-xs'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Autorizar continuar con el programa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenClearanceModal('rechazada')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    clearanceStatus === 'rechazada'
                      ? 'bg-[#F2A488]/20 border-[#F2A488] text-[#2E3A36] font-bold'
                      : 'bg-[#FAF6F0] hover:bg-[#F2A488]/20 border-[#AEC9C0] text-[#2E3A36]'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-[#2E3A36]" />
                  <span>Mantener bloqueado / Requiere consulta</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#AEC9C0]/60 text-[#2E3A36]/60 hover:text-[#2E3A36] transition-colors flex-shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Sub-Navegación de la Ficha */}
        <div className="flex border-b border-[#AEC9C0]/50 px-4 sm:px-6 bg-[#FAF6F0] overflow-x-auto gap-1 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveSubTab('onboarding')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'onboarding'
                ? 'border-[#6E9E93] text-[#6E9E93]'
                : 'border-transparent text-[#2E3A36]/60 hover:text-[#2E3A36]'
            }`}
          >
            1. Historia Onboarding
          </button>
          <button
            onClick={() => setActiveSubTab('plan')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'plan'
                ? 'border-[#6E9E93] text-[#6E9E93]'
                : 'border-transparent text-[#2E3A36]/60 hover:text-[#2E3A36]'
            }`}
          >
            2. Plan Prescrito
          </button>
          <button
            onClick={() => setActiveSubTab('evolution')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'evolution'
                ? 'border-[#6E9E93] text-[#6E9E93]'
                : 'border-transparent text-[#2E3A36]/60 hover:text-[#2E3A36]'
            }`}
          >
            3. Evolución y Tendencias ({history.length})
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'notes'
                ? 'border-[#6E9E93] text-[#6E9E93]'
                : 'border-transparent text-[#2E3A36]/60 hover:text-[#2E3A36]'
            }`}
          >
            4. Notas de Consulta ({notesList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('followup')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'followup'
                ? 'border-[#6E9E93] text-[#6E9E93]'
                : 'border-transparent text-[#2E3A36]/60 hover:text-[#2E3A36]'
            }`}
          >
            5. Seguimiento Entre Citas ({followUps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('doctor_only')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'doctor_only'
                ? 'border-[#2E3A36] text-[#2E3A36] bg-[#AEC9C0]/20'
                : 'border-transparent text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#2E3A36]" />
            6. Solo para la Doctora
          </button>
        </div>

        {/* Contenido Dinámico de la Sub-Pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {/* ========================================================= */}
          {/* SUBTAB 1: HISTORIA COMPLETA DEL ONBOARDING */}
          {/* ========================================================= */}
          {activeSubTab === 'onboarding' && (
            <div className="space-y-6">
              {/* Bloque 1: Biometría y Composición Corporal */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Scale className="w-4 h-4" />
                  Biometría y Composición Corporal
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">Peso / Estatura</span>
                    <p className="font-bold text-[#2E3A36] font-mono mt-0.5">{onboarding.weightKg} kg · {onboarding.heightCm} cm</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">IMC Calculado</span>
                    <p className="font-bold text-[#2E3A36] font-mono mt-0.5">{metrics.bmi} ({metrics.bmiCategory})</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">% Grasa Corporal</span>
                    <p className="font-bold text-[#2E3A36] font-mono mt-0.5">
                      {metrics.bodyFatPercent}% ({onboarding.inBodyUploaded ? 'InBody' : 'Siluetas'})
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">Masa Muscular Magra</span>
                    <p className="font-bold text-[#6E9E93] font-mono mt-0.5">{metrics.muscleMassKg} kg</p>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Capacidad Funcional, NEAT, Ejercicio y PAR-Q */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Activity className="w-4 h-4" />
                    Capacidad Funcional, NEAT, Ejercicio y PAR-Q
                  </h3>
                  {onboarding.parqHasRisk ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#F2A488]/20 text-[#c96f50] text-[10px] font-bold">
                      PAR-Q: Atención Preventiva
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#6E9E93]/20 text-[#6E9E93] text-[10px] font-bold">
                      PAR-Q: Apto
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">Test Sit-to-Stand (30s)</span>
                    <p className="font-bold text-[#2E3A36] font-mono mt-0.5">
                      {onboarding.sitToStandReps} repeticiones
                    </p>
                    <span className={`text-[10px] ${onboarding.sitToStandReps <= 10 ? 'text-[#F2A488] font-bold' : 'text-[#6E9E93]'}`}>
                      {metrics.sitToStandCategory}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">NEAT Cotidiano</span>
                    <p className="font-bold text-[#2E3A36] mt-0.5 capitalize">{onboarding.neatLevel}</p>
                    <span className="text-[10px] text-[#2E3A36]/60">Factor x{metrics.neatFactor} ({metrics.neatKcal} kcal/d)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <span className="text-[11px] text-[#2E3A36]/70">Ejercicio Estructurado</span>
                    <p className="font-bold text-[#2E3A36] mt-0.5">
                      {onboarding.exerciseDaysPerWeek} días/sem · {onboarding.exerciseDurationMinutes} min
                    </p>
                    <span className="text-[10px] text-[#2E3A36]/60">Intensidad {onboarding.exerciseIntensity} ({metrics.exerciseKcalDaily} kcal/d promedio)</span>
                  </div>
                </div>

                {/* Sub-bloque Detalle PAR-Q */}
                {onboarding.parqAnswers && (
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2E3A36] text-[11px]">Evaluación PAR-Q (7 preguntas de seguridad):</span>
                      <span className="text-[10px] text-[#2E3A36]/60 font-mono">
                        {onboarding.parqHasRisk ? 'Respuestas afirmativas detectadas' : '7/7 Sin contraindicaciones'}
                      </span>
                    </div>
                    {onboarding.parqHasRisk ? (
                      <div className="space-y-1 text-[11px] text-[#c96f50] bg-[#F2A488]/10 p-2 rounded-lg">
                        {onboarding.parqAnswers.q1_heartCondition && <div>• Condición cardíaca diagnosticada previa.</div>}
                        {onboarding.parqAnswers.q2_chestPainActivity && <div>• Dolor en el pecho durante actividad física.</div>}
                        {onboarding.parqAnswers.q3_chestPainRest && <div>• Dolor en el pecho en reposo en el último mes.</div>}
                        {onboarding.parqAnswers.q4_balanceDizziness && <div>• Pérdida de equilibrio / mareo o pérdida de conocimiento.</div>}
                        {onboarding.parqAnswers.q5_boneJointProblem && <div>• Problema óseo o articular que podría empeorar.</div>}
                        {onboarding.parqAnswers.q6_bloodPressureMeds && <div>• Medicación prescrita para presión arterial o corazón.</div>}
                        {onboarding.parqAnswers.q7_otherReason && <div>• Otra razón médica o limitación física reportada.</div>}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#6E9E93]">
                        Todas las respuestas negativas (No). Apto para inicio o progresión de ejercicio según la programación elegida ({onboarding.trainingPreference || 'Estándar'}).
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Bloque 3: Condiciones Médicas y Alergias */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Heart className="w-4 h-4" />
                  Condiciones Clínicas y Alergias
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-1">
                    <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Condiciones Médicas Reportadas:</span>
                    <p className="text-[#2E3A36] font-medium">
                      {onboarding.medicalConditions && onboarding.medicalConditions.length > 0
                        ? onboarding.medicalConditions.join(', ')
                        : 'Ninguna condición limitante reportada'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-1">
                    <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Alergias / Intolerancias:</span>
                    <p className="text-[#2E3A36] font-medium">
                      {onboarding.allergies && onboarding.allergies.length > 0
                        ? onboarding.allergies.join(', ')
                        : 'Sin alergias alimentarias reportadas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloque 4: Relación con la Comida y Ritmos Circadianos */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <BrainCircuit className="w-4 h-4" />
                  Relación con la Comida y Circadiano
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-1">
                    <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Patrón Psiconutricional:</span>
                    <p className="text-[#2E3A36] font-medium">{onboarding.foodRelationship?.description || 'Sin datos'}</p>
                    <p className="text-[11px] text-[#6E9E93] font-medium">Ruido de comida: {onboarding.foodRelationship?.emotionalEating}</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-1">
                    <span className="text-[11px] text-[#2E3A36]/70 font-semibold">Ritmo de Sueño e Hidratación:</span>
                    <p className="text-[#2E3A36] font-medium">{onboarding.sleepHours}h sueño ({onboarding.wakeUpTime} a {onboarding.bedTime})</p>
                    <p className="text-[11px] text-[#2E3A36]/60">Agua: {onboarding.waterLitersPerDay} L/día · Alcohol: {onboarding.alcoholFrequency}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 2: PLAN ACTUAL PRESCRITO */}
          {/* ========================================================= */}
          {activeSubTab === 'plan' && (
            <div className="space-y-6">
              {/* Tarjetas Clave de Gasto y Déficit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/60">
                  <span className="text-[11px] text-[#2E3A36]/70">GEB (BMR)</span>
                  <div className="text-xl font-bold text-[#2E3A36] font-mono mt-1">{metrics.bmrKcal} kcal</div>
                  <span className="text-[10px] text-[#2E3A36]/60">{metrics.bmrFormulaUsed}</span>
                </div>

                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/60">
                  <span className="text-[11px] text-[#2E3A36]/70">GET (TDEE Mantenimiento)</span>
                  <div className="text-xl font-bold text-[#2E3A36] font-mono mt-1">{metrics.tdeeKcal} kcal</div>
                  <span className="text-[10px] text-[#2E3A36]/60">Gasto diario total</span>
                </div>

                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/60">
                  <span className="text-[11px] text-[#2E3A36]/70">Objetivo Calórico</span>
                  <div className="text-xl font-bold text-[#6E9E93] font-mono mt-1">{metrics.targetKcal} kcal</div>
                  <span className="text-[10px] text-[#6E9E93] font-medium">Meta diaria activa</span>
                </div>

                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/60">
                  <span className="text-[11px] text-[#2E3A36]/70">Piso de Seguridad</span>
                  <div className="text-xl font-bold text-[#8FAFD1] font-mono mt-1">{metrics.minSafeCalories} kcal</div>
                  <span className="text-[10px] text-[#2E3A36]/60">Mínimo no restrictivo</span>
                </div>
              </div>

              {/* Reparto de Macronutrientes Clínicos */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider font-mono">
                  Macronutrientes Clínicos Asignados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#2E3A36]/70 font-medium">Proteína (2.0 g/kg)</span>
                      <span className="font-bold text-[#2E3A36] font-mono">{metrics.proteinGrams} g</span>
                    </div>
                    <div className="text-[10px] text-[#6E9E93] mt-1 font-mono">{metrics.proteinKcal} kcal ({((metrics.proteinKcal / metrics.targetKcal) * 100).toFixed(0)}%)</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#2E3A36]/70 font-medium">Grasas Saludables (0.8 g/kg)</span>
                      <span className="font-bold text-[#2E3A36] font-mono">{metrics.fatGrams} g</span>
                    </div>
                    <div className="text-[10px] text-[#6E9E93] mt-1 font-mono">{metrics.fatKcal} kcal ({((metrics.fatKcal / metrics.targetKcal) * 100).toFixed(0)}%)</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#AEC9C0]/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#2E3A36]/70 font-medium">Carbohidratos</span>
                      <span className="font-bold text-[#2E3A36] font-mono">{metrics.carbsGrams} g</span>
                    </div>
                    <div className="text-[10px] text-[#8FAFD1] mt-1 font-mono">
                      {metrics.carbsKcal} kcal ({((metrics.carbsKcal / metrics.targetKcal) * 100).toFixed(0)}%) · Piso 100g {metrics.carbsGrams <= 105 ? 'Activo' : 'OK'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribución por Tiempos de Comida */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider font-mono">
                  Distribución por Comidas Activas
                </h3>
                <div className="space-y-2">
                  {metrics.mealDistributions?.map((m) => (
                    <div
                      key={m.mealKey}
                      className="p-3 bg-white rounded-xl border border-[#AEC9C0]/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                    >
                      <div>
                        <div className="font-bold text-[#2E3A36]">{m.mealName} ({m.percentage}%)</div>
                        <div className="text-[11px] text-[#2E3A36]/60">{m.timeSuggestion}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                        <span className="text-[#2E3A36] font-bold">🔥 {m.caloriesKcal} kcal</span>
                        <span className="text-[#6E9E93]">P: {m.portions.proteina} porc</span>
                        <span className="text-[#8FAFD1]">C: {m.portions.carbohidrato} porc</span>
                        <span className="text-[#2E3A36]/70">G: {m.portions.grasa} porc</span>
                        <span className="text-[#6E9E93]">V: {m.portions.verdura}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 3: EVOLUCIÓN Y TENDENCIAS */}
          {/* ========================================================= */}
          {activeSubTab === 'evolution' && (
            <div className="space-y-6">
              {/* Gráfica de Tendencia Visual Simple */}
              <div className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center justify-between font-mono">
                  <span>Evolución Histórica de Peso y Sit-to-Stand</span>
                  <span className="text-[11px] text-[#2E3A36]/60 normal-case font-normal">{history.length} registros</span>
                </h3>

                {history.length === 0 ? (
                  <p className="text-xs text-[#2E3A36]/60 py-6 text-center">No hay registros de seguimiento aún.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Curva de Peso */}
                      <div className="p-4 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-2">
                        <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-[#6E9E93]" />
                          Historial de Peso (kg)
                        </div>
                        <div className="space-y-1.5 pt-2">
                          {history.map((h, i) => (
                            <div key={h.id || i} className="flex items-center justify-between text-xs">
                              <span className="text-[#2E3A36]/60 font-mono">{h.date}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#2E3A36] font-mono">{h.weightKg} kg</span>
                                {h.bodyFatPercent && (
                                  <span className="text-[10px] text-[#2E3A36]/60">({h.bodyFatPercent}% grasa)</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Curva de Sit-to-Stand */}
                      <div className="p-4 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-2">
                        <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-[#8FAFD1]" />
                          Sit-to-Stand 30s (Fuerza Funcional)
                        </div>
                        <div className="space-y-1.5 pt-2">
                          {history.map((h, i) => (
                            <div key={h.id || i} className="flex items-center justify-between text-xs">
                              <span className="text-[#2E3A36]/60 font-mono">{h.date}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold font-mono ${
                                  (h.sitToStandReps || 14) <= 10 ? 'text-[#F2A488]' : 'text-[#6E9E93]'
                                }`}>
                                  {h.sitToStandReps ?? onboarding.sitToStandReps} reps
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reporte de Ruido de Comida y Hambre */}
                    {history.some((h) => h.hungerTracker) && (
                      <div className="p-4 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-2">
                        <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                          <BrainCircuit className="w-4 h-4 text-[#6E9E93]" />
                          Reportes de Hambre y Ruido de Comida
                        </div>
                        <div className="divide-y divide-[#AEC9C0]/30">
                          {history
                            .filter((h) => h.hungerTracker)
                            .map((h, i) => (
                              <div key={i} className="py-2 flex items-center justify-between text-xs">
                                <div className="space-y-0.5">
                                  <span className="text-[#2E3A36]/60 font-mono">{h.date}</span>
                                  {h.hungerTracker?.notes && (
                                    <p className="text-[11px] text-[#2E3A36]/80 italic">"{h.hungerTracker.notes}"</p>
                                  )}
                                </div>
                                <div className="text-right font-mono text-[11px]">
                                  <span className="text-[#2E3A36]/70">Hambre: {h.hungerTracker?.physicalHunger}/5 · </span>
                                  <span className={h.hungerTracker && h.hungerTracker.mentalFoodNoise >= 4 ? 'text-[#F2A488] font-bold' : 'text-[#6E9E93]'}>
                                    Ruido: {h.hungerTracker?.mentalFoodNoise}/5
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Reportes de Perimetría y Medidas Corporales */}
                    {history.some((h) => h.circumferences && Object.keys(h.circumferences).length > 0) && (
                      <div className="p-4 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-2">
                        <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                          <Ruler className="w-4 h-4 text-[#8FAFD1]" />
                          Evolución de Perimetría (Cintura, Cadera, Brazo, Muslo)
                        </div>
                        <div className="divide-y divide-[#AEC9C0]/30">
                          {history
                            .filter((h) => h.circumferences && Object.keys(h.circumferences).length > 0)
                            .map((h, i) => (
                              <div key={i} className="py-2 flex items-center justify-between text-xs">
                                <span className="text-[#2E3A36]/60 font-mono">{h.date}</span>
                                <div className="flex flex-wrap gap-2.5 font-mono text-[11px]">
                                  {h.circumferences?.waistCm && (
                                    <span className="text-[#2E3A36]">Cintura: <b className="text-[#6E9E93]">{h.circumferences.waistCm} cm</b></span>
                                  )}
                                  {h.circumferences?.hipCm && (
                                    <span className="text-[#2E3A36]">Cadera: <b className="text-[#6E9E93]">{h.circumferences.hipCm} cm</b></span>
                                  )}
                                  {h.circumferences?.armCm && (
                                    <span className="text-[#2E3A36]">Brazo: <b>{h.circumferences.armCm} cm</b></span>
                                  )}
                                  {h.circumferences?.thighCm && (
                                    <span className="text-[#2E3A36]">Muslo: <b>{h.circumferences.thighCm} cm</b></span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Reportes de Sensación de Bienestar */}
                    {history.some((h) => h.wellbeing) && (
                      <div className="p-4 bg-white rounded-xl border border-[#AEC9C0]/50 space-y-2">
                        <div className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                          <Smile className="w-4 h-4 text-[#6E9E93]" />
                          Sensación de Bienestar, Vitalidad y Ajuste de Ropa
                        </div>
                        <div className="divide-y divide-[#AEC9C0]/30">
                          {history
                            .filter((h) => h.wellbeing)
                            .map((h, i) => (
                              <div key={i} className="py-2 flex items-center justify-between text-xs">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#2E3A36]/60 font-mono">{h.date}</span>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                      h.wellbeing?.comparison === 'mejor'
                                        ? 'bg-[#6E9E93]/20 text-[#6E9E93] border border-[#6E9E93]/40'
                                        : h.wellbeing?.comparison === 'igual'
                                        ? 'bg-[#FAF6F0] text-[#2E3A36] border border-[#AEC9C0]/50'
                                        : 'bg-[#F2A488]/20 text-[#2E3A36] border border-[#F2A488]/40'
                                    }`}>
                                      {h.wellbeing?.comparison}
                                    </span>
                                  </div>
                                  {h.wellbeing?.notes && (
                                    <p className="text-[11px] text-[#2E3A36]/80 italic">"{h.wellbeing.notes}"</p>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-[#6E9E93] text-xs">
                                  Score: {h.wellbeing?.score}/5
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 4: NOTAS DE CONSULTA DE LA DOCTORA */}
          {/* ========================================================= */}
          {activeSubTab === 'notes' && (
            <div className="space-y-6">
              {/* Formulario para agregar nueva nota */}
              <form onSubmit={handleAddNote} className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  Nueva Nota de Consulta
                </h3>
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Escribe las observaciones de la consulta, ajustes realizados al plan o indicaciones clínicas..."
                  className="w-full bg-white border border-[#AEC9C0]/70 rounded-xl p-3 text-xs text-[#2E3A36] placeholder-[#2E3A36]/40 focus:outline-hidden focus:border-[#6E9E93]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingNote || !newNoteContent.trim()}
                    className="px-4 py-2 bg-[#6E9E93] hover:bg-[#5C897F] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingNote ? 'Guardando...' : 'Guardar Nota de Consulta'}
                  </button>
                </div>
              </form>

              {/* Lista cronológica de notas */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#2E3A36]/70 uppercase tracking-wider font-mono">
                  Historial de Notas Clínicas ({notesList.length})
                </h3>

                {notesList.length === 0 ? (
                  <p className="text-xs text-[#2E3A36]/60 py-6 text-center bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/40">
                    No se han registrado notas de consulta aún para este paciente.
                  </p>
                ) : (
                  notesList.map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs border-b border-[#AEC9C0]/40 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#6E9E93]">{note.author}</span>
                          <span className="text-[#2E3A36]/50 font-mono">· {note.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingNoteId !== note.id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingContent(note.content);
                                }}
                                className="p-1 text-[#2E3A36]/60 hover:text-[#6E9E93] transition-colors cursor-pointer"
                                title="Editar nota"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1 text-[#2E3A36]/60 hover:text-[#F2A488] transition-colors cursor-pointer"
                                title="Eliminar nota"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingNoteId === note.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={3}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full bg-white border border-[#AEC9C0] rounded-xl p-2.5 text-xs text-[#2E3A36] focus:outline-hidden focus:border-[#6E9E93]"
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1.5 bg-white border border-[#AEC9C0]/60 text-[#2E3A36] rounded-lg hover:bg-[#FAF6F0] cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveEditNote(note.id)}
                              className="px-3 py-1.5 bg-[#6E9E93] text-white font-bold rounded-lg hover:bg-[#5C897F] cursor-pointer"
                            >
                              Actualizar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#2E3A36] leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 5: SEGUIMIENTO ENTRE CITAS */}
          {/* ========================================================= */}
          {activeSubTab === 'followup' && (
            <div className="space-y-6">
              {/* Formulario de Seguimiento */}
              <form onSubmit={handleAddFollowUp} className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  Registrar Entrada de Seguimiento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#2E3A36]/70 font-semibold">Canal de Contacto</label>
                    <select
                      value={newFollowUpChannel}
                      onChange={(e) => setNewFollowUpChannel(e.target.value as any)}
                      className="w-full mt-1 bg-white border border-[#AEC9C0]/70 rounded-xl p-2.5 text-xs text-[#2E3A36] focus:outline-hidden focus:border-[#6E9E93]"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Llamada">Llamada Telefónica</option>
                      <option value="Mensaje App">Mensaje en la App</option>
                      <option value="Control">Control Asistencial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#2E3A36]/70 font-semibold">Próxima Acción (Opcional)</label>
                    <input
                      type="text"
                      value={newFollowUpAction}
                      onChange={(e) => setNewFollowUpAction(e.target.value)}
                      placeholder="Ej. Revisar fotos de platos en 3 días"
                      className="w-full mt-1 bg-white border border-[#AEC9C0]/70 rounded-xl p-2.5 text-xs text-[#2E3A36] focus:outline-hidden focus:border-[#6E9E93]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#2E3A36]/70 font-semibold">Detalle del Contacto</label>
                  <textarea
                    rows={2}
                    value={newFollowUpNotes}
                    onChange={(e) => setNewFollowUpNotes(e.target.value)}
                    placeholder="Resumen del mensaje o reporte del paciente entre citas..."
                    className="w-full mt-1 bg-white border border-[#AEC9C0]/70 rounded-xl p-2.5 text-xs text-[#2E3A36] focus:outline-hidden focus:border-[#6E9E93]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingFollowUp || !newFollowUpNotes.trim()}
                    className="px-4 py-2 bg-[#6E9E93] hover:bg-[#5C897F] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingFollowUp ? 'Guardando...' : 'Registrar Seguimiento'}
                  </button>
                </div>
              </form>

              {/* Historial de Seguimiento */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#2E3A36]/70 uppercase tracking-wider font-mono">
                  Timeline de Seguimientos ({followUps.length})
                </h3>

                {followUps.length === 0 ? (
                  <p className="text-xs text-[#2E3A36]/60 py-6 text-center bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/40">
                    No hay registros de seguimiento entre citas registrados aún.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {followUps.map((f) => (
                      <div
                        key={f.id}
                        className="bg-[#FAF6F0] border border-[#AEC9C0]/60 rounded-2xl p-3.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[#2E3A36]/60">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-[#AEC9C0]/50 text-[10px] text-[#6E9E93] font-semibold">
                            {f.channel}
                          </span>
                          <span className="font-mono text-[11px]">{f.date}</span>
                        </div>
                        <p className="text-[#2E3A36] leading-relaxed">{f.notes}</p>
                        {f.nextAction && (
                          <div className="text-[11px] text-[#2E3A36] bg-white p-2 rounded-lg border border-[#AEC9C0]/60 font-medium">
                            <strong className="text-[#6E9E93]">Próxima acción:</strong> {f.nextAction}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 6: "SOLO PARA LA DOCTORA" (CONFIDENCIAL) */}
          {/* ========================================================= */}
          {activeSubTab === 'doctor_only' && (
            <div className="space-y-5 bg-[#FAF6F0] border-2 border-[#6E9E93]/40 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 border-b border-[#AEC9C0]/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#6E9E93]/20 text-[#6E9E93] border border-[#6E9E93]/30 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#2E3A36] font-serif">
                      Solo para la Doctora · Evaluación y Prescripción Médica
                    </h3>
                  </div>
                  <p className="text-xs text-[#2E3A36]/70 max-w-xl">
                    Esta sección es estrictamente confidencial. La información aquí consignada jamás es visible ni accesible desde la interfaz del paciente.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white border border-[#AEC9C0] text-[10px] text-[#2E3A36] font-bold uppercase tracking-wider whitespace-nowrap">
                  🔒 Confidencial
                </span>
              </div>

              {prescriptionSavedAlert && (
                <div className="p-3 bg-[#6E9E93]/20 border border-[#6E9E93] rounded-xl text-xs text-[#2E3A36] font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#6E9E93] flex-shrink-0" />
                  <span>Notas de prescripción médica guardadas correctamente.</span>
                </div>
              )}

              {/* Estado de Elegibilidad Clínica */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center gap-1.5">
                  Estado de Elegibilidad Médica
                </label>
                <select
                  value={eligibilityStatus}
                  onChange={(e) => setEligibilityStatus(e.target.value as any)}
                  className="w-full bg-white border border-[#AEC9C0] rounded-xl p-3 text-xs text-[#2E3A36] focus:outline-hidden focus:border-[#6E9E93]"
                >
                  <option value="Apto">Apto (Candidato a protocolo con prescripción médica)</option>
                  <option value="En Evaluación">En Evaluación (Pendiente de paraclínicos o control)</option>
                  <option value="Requiere Interconsulta">Requiere Interconsulta Especializada</option>
                  <option value="No Apto">No Apto (Manejo exclusivamente no farmacológico)</option>
                </select>
              </div>

              {/* Campo de Texto Libre de Elegibilidad y Prescripción */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2E3A36]">
                  Notas de Elegibilidad y Seguimiento de Prescripción Médica
                </label>
                <textarea
                  rows={6}
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="Consigna aquí los criterios clínicos de elegibilidad, esquemas de prescripción médica evaluados, posología o seguimiento farmacológico confidencial..."
                  className="w-full bg-white border border-[#AEC9C0] rounded-2xl p-4 text-xs text-[#2E3A36] placeholder-[#2E3A36]/40 focus:outline-hidden focus:border-[#6E9E93] leading-relaxed font-sans"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-[#2E3A36]/60">
                    Última actualización: {patient.doctorPrescriptionNotes?.lastUpdated || 'Sin registrar'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePrescription}
                    disabled={savingPrescription}
                    className="px-5 py-2.5 bg-[#6E9E93] hover:bg-[#5C897F] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {savingPrescription ? 'Guardando cambios...' : 'Guardar Notas Confidenciales'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Emergente de Autorización Médica con Nota Obligatoria */}
        {clearanceModalOpen && (
          <div className="fixed inset-0 z-60 bg-[#2E3A36]/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-2 border-[#6E9E93] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    clearanceAction === 'autorizada' ? 'bg-[#6E9E93]/20 text-[#6E9E93]' : 'bg-[#F2A488]/20 text-[#F2A488]'
                  }`}>
                    {clearanceAction === 'autorizada' ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2E3A36] font-serif">
                      {clearanceAction === 'autorizada' ? 'Autorizar Continuación de Paciente' : 'Mantener Bloqueo Clínico'}
                    </h3>
                    <p className="text-xs text-[#2E3A36]/70">
                      Paciente: <strong>{patient.name}</strong> ({patient.email})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClearanceModalOpen(false)}
                  className="p-1 text-[#2E3A36]/60 hover:text-[#2E3A36]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/60 text-xs text-[#2E3A36] space-y-1">
                {clearanceAction === 'autorizada' ? (
                  <p className="leading-relaxed">
                    Al autorizar, el paciente <strong>dejará de ver la pantalla de bloqueo</strong> y podrá retomar su plan con las adaptaciones metabólicas calculadas de forma segura.
                  </p>
                ) : (
                  <p className="leading-relaxed">
                    El paciente continuará viendo la pantalla de orientación clínica para agendar consulta externa presencial.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E3A36] flex items-center justify-between">
                  <span>Nota Médica Privada {clearanceAction === 'autorizada' && <span className="text-[#F2A488]">* (Obligatoria)</span>}</span>
                  <span className="text-[10px] text-[#2E3A36]/60 font-mono">Visible solo para la Dra. Lorena</span>
                </label>
                <textarea
                  rows={4}
                  value={mandatoryDoctorNote}
                  onChange={(e) => {
                    setMandatoryDoctorNote(e.target.value);
                    if (clearanceError) setClearanceError('');
                  }}
                  placeholder="Escribe la justificación clínica, plan de seguimiento o motivos del dictamen..."
                  className="w-full bg-white border border-[#AEC9C0] focus:border-[#6E9E93] rounded-2xl p-3 text-xs text-[#2E3A36] focus:outline-hidden leading-relaxed"
                />
                {clearanceError && (
                  <p className="text-xs font-medium text-[#F2A488]">{clearanceError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setClearanceModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF6F0] border border-[#AEC9C0] hover:bg-[#AEC9C0]/20 text-[#2E3A36] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearance}
                  disabled={savingClearance || (clearanceAction === 'autorizada' && !mandatoryDoctorNote.trim())}
                  className="px-5 py-2 bg-[#6E9E93] hover:bg-[#5C897F] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingClearance ? 'Guardando...' : clearanceAction === 'autorizada' ? 'Confirmar Autorización' : 'Confirmar Dictamen'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
