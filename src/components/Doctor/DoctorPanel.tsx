import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { ActiveAlertsView } from './ActiveAlertsView';
import { AuditTableView } from './AuditTableView';
import { PatientDetailModal } from './PatientDetailModal';
import { QuickPatientEntryModal } from './QuickPatientEntryModal';
import { calculatePatientAlerts } from '../../utils/clinicalAlerts';
import {
  ShieldAlert,
  ClipboardList,
  RefreshCw,
  LogOut,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';

interface DoctorPanelProps {
  doctorProfile: UserProfile;
  onExitToPatientApp: () => void;
  onLogout: () => void;
}

export const DoctorPanel: React.FC<DoctorPanelProps> = ({
  doctorProfile,
  onExitToPatientApp,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'audit'>('alerts');
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [showQuickEntry, setShowQuickEntry] = useState<boolean>(false);

  // Fetch patients list
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/patients');
      const data = await res.json();
      if (data.success && data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Compute active alert count
  const totalAlertsCount = patients.reduce((acc, p) => {
    const alerts = calculatePatientAlerts(p);
    return acc + (alerts.length > 0 ? 1 : 0);
  }, 0);

  const handleUpdatePatient = (updated: UserProfile) => {
    setPatients((prev) =>
      prev.map((p) => (p.email === updated.email ? updated : p))
    );
    if (selectedPatient?.email === updated.email) {
      setSelectedPatient(updated);
    }
  };

  const handlePatientCreated = (created: UserProfile) => {
    setPatients((prev) => [created, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2E3A36] font-sans flex flex-col selection:bg-[#6E9E93] selection:text-white">
      {/* Header Médico Profesional */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#AEC9C0]/50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Wordmark Logo Velapp */}
            <div className="flex items-center gap-2">
              <img
                src="/velapp-logo.svg"
                alt="Velapp"
                className="h-8 w-auto object-contain cursor-pointer"
                style={{ width: '115px' }}
                onClick={onExitToPatientApp}
              />
              <span className="hidden sm:inline text-xs text-[#2E3A36]/70 border-l border-[#AEC9C0]/70 pl-2.5">
                Panel Clínico · <strong>Dra. Lorena Castro</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowQuickEntry(true)}
              className="px-3.5 py-1.5 bg-[#6E9E93] hover:bg-[#5f8a80] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Crear paciente desde consulta 1:1, sin cuestionario largo"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva paciente (consulta 1:1)</span>
              <span className="sm:hidden">Nueva</span>
            </button>

            <button
              onClick={fetchPatients}
              disabled={loading}
              className="p-2 text-[#2E3A36]/70 hover:text-[#2E3A36] bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 rounded-xl transition-colors border border-[#AEC9C0]/40 text-xs cursor-pointer"
              title="Refrescar datos de pacientes"
            >
              <RefreshCw className={`w-4 h-4 text-[#6E9E93] ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onExitToPatientApp}
              className="px-3.5 py-1.5 bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 text-[#2E3A36] border border-[#AEC9C0]/50 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#6E9E93]" />
              <span className="hidden sm:inline">Ver App de Paciente</span>
              <span className="sm:hidden">App</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-[#2E3A36]/60 hover:text-[#2E3A36] bg-[#FAF6F0] hover:bg-[#F2A488]/20 rounded-xl transition-colors border border-[#AEC9C0]/40 text-xs cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs de Navegación del Panel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex border-t border-[#AEC9C0]/30 gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#6E9E93] text-[#6E9E93] bg-[#6E9E93]/5'
                : 'border-transparent text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#6E9E93]" />
            <span>Pacientes con Alerta Activa</span>
            {totalAlertsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#F2A488]/20 text-[#2E3A36] text-[10px] font-mono border border-[#F2A488]/50 font-bold">
                {totalAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'border-[#6E9E93] text-[#6E9E93] bg-[#6E9E93]/5'
                : 'border-transparent text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-[#6E9E93]" />
            <span>Auditoría de Todos los Pacientes</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#2E3A36]/70 border border-[#AEC9C0]/40 text-[10px] font-mono">
              {patients.length}
            </span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#6E9E93] animate-spin mx-auto" />
            <p className="text-xs text-[#2E3A36]/70">Cargando datos clínicos de pacientes...</p>
          </div>
        ) : activeTab === 'alerts' ? (
          <ActiveAlertsView
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
          />
        ) : (
          <AuditTableView
            patients={patients}
            onSelectPatient={(p) => setSelectedPatient(p)}
          />
        )}
      </main>

      {/* Modal Ficha Clínica Individual */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdatePatient={handleUpdatePatient}
        />
      )}

      {/* Modal Nueva Paciente - Consulta 1:1 */}
      {showQuickEntry && (
        <QuickPatientEntryModal
          onClose={() => setShowQuickEntry(false)}
          onCreated={handlePatientCreated}
        />
      )}
    </div>
  );
};
