import React, { useState, useMemo } from 'react';
import { UserProfile, ClinicalAlert } from '../../types';
import { calculatePatientAlerts } from '../../utils/clinicalAlerts';
import {
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  TrendingDown,
  Clock,
  Search,
  ChevronRight,
  User,
  Filter,
} from 'lucide-react';

interface ActiveAlertsViewProps {
  patients: UserProfile[];
  onSelectPatient: (patient: UserProfile) => void;
}

type AlertFilterType = 'todas' | 'blocking_condition' | 'mental_food_noise' | 'muscle_loss' | 'plateau';

export const ActiveAlertsView: React.FC<ActiveAlertsViewProps> = ({
  patients,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<AlertFilterType>('todas');

  // Compute patients with their alerts
  const patientsWithAlerts = useMemo(() => {
    return patients
      .map((p) => {
        const computedAlerts = calculatePatientAlerts(p);
        return {
          profile: p,
          alerts: computedAlerts,
        };
      })
      .filter((item) => item.alerts.length > 0);
  }, [patients]);

  // Statistics counters
  const stats = useMemo(() => {
    let total = patientsWithAlerts.length;
    let blocking = 0;
    let mental = 0;
    let muscle = 0;
    let plateau = 0;

    patientsWithAlerts.forEach((item) => {
      item.alerts.forEach((a) => {
        if (a.type === 'blocking_condition') blocking++;
        if (a.type === 'mental_food_noise') mental++;
        if (a.type === 'muscle_loss') muscle++;
        if (a.type === 'plateau') plateau++;
      });
    });

    return { total, blocking, mental, muscle, plateau };
  }, [patientsWithAlerts]);

  // Filtered patients
  const filteredList = useMemo(() => {
    return patientsWithAlerts.filter((item) => {
      const matchesSearch =
        item.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profile.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'todas') return true;
      return item.alerts.some((a) => a.type === selectedFilter);
    });
  }, [patientsWithAlerts, searchTerm, selectedFilter]);

  const getAlertBadge = (alert: ClinicalAlert) => {
    switch (alert.type) {
      case 'blocking_condition':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-[#2E3A36]" />,
          bg: 'bg-[#F2A488]/20 border-[#F2A488]/60 text-[#2E3A36]',
          tag: 'Bloqueo Médico Activo',
        };
      case 'mental_food_noise':
        return {
          icon: <BrainCircuit className="w-4 h-4 text-[#6E9E93]" />,
          bg: 'bg-[#6E9E93]/15 border-[#6E9E93]/30 text-[#2E3A36]',
          tag: 'Ruido de Comida Nivel 4-5',
        };
      case 'muscle_loss':
        return {
          icon: <TrendingDown className="w-4 h-4 text-[#2E3A36]" />,
          bg: 'bg-[#AEC9C0]/30 border-[#AEC9C0]/70 text-[#2E3A36]',
          tag: 'Caída Sit-to-Stand / Masa Muscular',
        };
      case 'plateau':
        return {
          icon: <Clock className="w-4 h-4 text-[#8FAFD1]" />,
          bg: 'bg-[#8FAFD1]/15 border-[#8FAFD1]/40 text-[#2E3A36]',
          tag: 'Estancamiento (3 Señales Clínicas)',
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[#6E9E93]" />,
          bg: 'bg-[#FAF6F0] border-[#AEC9C0]/50 text-[#2E3A36]',
          tag: 'Alerta Clínica',
        };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Resumen de Métricas de Alertas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedFilter('todas')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'todas'
              ? 'bg-white border-[#6E9E93] shadow-xs'
              : 'bg-white/70 border-[#AEC9C0]/50 hover:border-[#6E9E93]/50'
          }`}
        >
          <div className="text-[11px] text-[#2E3A36]/70 font-medium">Total Alertas</div>
          <div className="text-2xl font-black text-[#2E3A36] font-mono mt-1">{stats.total}</div>
          <div className="text-[10px] text-[#6E9E93] mt-0.5 font-bold">Pacientes marcados</div>
        </button>

        <button
          onClick={() => setSelectedFilter('blocking_condition')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'blocking_condition'
              ? 'bg-[#F2A488]/20 border-[#F2A488] shadow-xs'
              : 'bg-white/70 border-[#AEC9C0]/50 hover:border-[#F2A488]/60'
          }`}
        >
          <div className="text-[11px] text-[#2E3A36] font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#2E3A36]" />
            Bloqueos
          </div>
          <div className="text-2xl font-black text-[#2E3A36] font-mono mt-1">{stats.blocking}</div>
          <div className="text-[10px] text-[#2E3A36]/60 mt-0.5">Requieren cita previa</div>
        </button>

        <button
          onClick={() => setSelectedFilter('mental_food_noise')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'mental_food_noise'
              ? 'bg-[#6E9E93]/20 border-[#6E9E93] shadow-xs'
              : 'bg-white/70 border-[#AEC9C0]/50 hover:border-[#6E9E93]/60'
          }`}
        >
          <div className="text-[11px] text-[#2E3A36] font-medium flex items-center gap-1">
            <BrainCircuit className="w-3.5 h-3.5 text-[#6E9E93]" />
            Ruido de Comida
          </div>
          <div className="text-2xl font-black text-[#2E3A36] font-mono mt-1">{stats.mental}</div>
          <div className="text-[10px] text-[#2E3A36]/60 mt-0.5">Pensamientos continuos</div>
        </button>

        <button
          onClick={() => setSelectedFilter('muscle_loss')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'muscle_loss'
              ? 'bg-[#AEC9C0]/35 border-[#6E9E93] shadow-xs'
              : 'bg-white/70 border-[#AEC9C0]/50 hover:border-[#AEC9C0]'
          }`}
        >
          <div className="text-[11px] text-[#2E3A36] font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-[#2E3A36]" />
            Fuerza / Músculo
          </div>
          <div className="text-2xl font-black text-[#2E3A36] font-mono mt-1">{stats.muscle}</div>
          <div className="text-[10px] text-[#2E3A36]/60 mt-0.5">Sit-to-stand bajo</div>
        </button>

        <button
          onClick={() => setSelectedFilter('plateau')}
          className={`p-3.5 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 cursor-pointer ${
            selectedFilter === 'plateau'
              ? 'bg-[#8FAFD1]/25 border-[#8FAFD1] shadow-xs'
              : 'bg-white/70 border-[#AEC9C0]/50 hover:border-[#8FAFD1]'
          }`}
        >
          <div className="text-[11px] text-[#2E3A36] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#8FAFD1]" />
            Estancamiento
          </div>
          <div className="text-2xl font-black text-[#2E3A36] font-mono mt-1">{stats.plateau}</div>
          <div className="text-[10px] text-[#2E3A36]/60 mt-0.5">1 mes sin cambio</div>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#2E3A36]/45 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o correo de paciente..."
            className="w-full bg-white border border-[#AEC9C0]/60 rounded-xl py-2 pl-10 pr-4 text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#2E3A36]/60" />
          <button
            onClick={() => setSelectedFilter('todas')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'todas'
                ? 'bg-[#6E9E93] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Todas ({patientsWithAlerts.length})
          </button>
          <button
            onClick={() => setSelectedFilter('blocking_condition')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'blocking_condition'
                ? 'bg-[#2E3A36] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Bloqueos ({stats.blocking})
          </button>
          <button
            onClick={() => setSelectedFilter('mental_food_noise')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'mental_food_noise'
                ? 'bg-[#6E9E93] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Ruido de Comida ({stats.mental})
          </button>
          <button
            onClick={() => setSelectedFilter('muscle_loss')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'muscle_loss'
                ? 'bg-[#6E9E93] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Fuerza ({stats.muscle})
          </button>
          <button
            onClick={() => setSelectedFilter('plateau')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === 'plateau'
                ? 'bg-[#8FAFD1] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Estancamiento ({stats.plateau})
          </button>
        </div>
      </div>

      {/* Lista de Tarjetas de Pacientes con Alerta */}
      {filteredList.length === 0 ? (
        <div className="bg-white border border-[#AEC9C0]/60 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <ShieldAlert className="w-10 h-10 text-[#6E9E93] mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-[#2E3A36]">No hay pacientes con esta alerta</h3>
          <p className="text-xs text-[#2E3A36]/70 max-w-sm mx-auto">
            {searchTerm
              ? 'No se encontraron pacientes que coincidan con los criterios de búsqueda.'
              : 'Excelente: ningún paciente activo cumple los criterios seleccionados actualmente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map(({ profile, alerts }) => (
            <div
              key={profile.id || profile.email}
              onClick={() => onSelectPatient(profile)}
              className="bg-white border border-[#AEC9C0]/60 hover:border-[#6E9E93] rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-xs group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Info del Paciente y Motivo Inmediato */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#2E3A36] group-hover:text-[#6E9E93] transition-colors flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#6E9E93]" />
                      {profile.name}
                    </h3>
                    <span className="text-[11px] text-[#2E3A36]/70">· {profile.onboarding.age} años</span>
                    <span className="text-[11px] text-[#2E3A36]/70">· {profile.onboarding.gender === 'femenino' ? 'Mujer' : 'Hombre'}</span>
                    <span className="text-[11px] text-[#2E3A36]/50 font-mono">({profile.email})</span>
                  </div>

                  {/* Badges y Motivos de Alerta */}
                  <div className="space-y-1.5">
                    {alerts.map((alert) => {
                      const badge = getAlertBadge(alert);
                      return (
                        <div
                          key={alert.id}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${badge.bg}`}
                        >
                          <div className="mt-0.5 flex-shrink-0">{badge.icon}</div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{badge.tag}</span>
                              <span className="text-[10px] opacity-75">
                                Detectado: {alert.detectedDate}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                              {alert.reason}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Métricas Resumen & Botón de Entrada */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[#AEC9C0]/30 pt-3 md:pt-0">
                  <div className="grid grid-cols-3 gap-3 text-center md:text-right">
                    <div>
                      <div className="text-[10px] text-[#2E3A36]/60">Peso actual</div>
                      <div className="text-xs font-bold text-[#2E3A36] font-mono">
                        {profile.onboarding.weightKg} kg
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#2E3A36]/60">Sit-to-Stand</div>
                      <div className="text-xs font-bold font-mono text-[#2E3A36]">
                        {profile.onboarding.sitToStandReps || profile.metrics.sitToStandReps || 14} reps
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#2E3A36]/60">Plan Meta</div>
                      <div className="text-xs font-bold text-[#6E9E93] font-mono">
                        {profile.metrics.targetKcal} kcal
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-[#6E9E93] group-hover:translate-x-1 transition-transform pl-2">
                    <span className="hidden sm:inline">Ver Ficha</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
