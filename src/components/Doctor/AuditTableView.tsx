import React, { useState, useMemo } from 'react';
import { UserProfile } from '../../types';
import { calculatePatientAlerts } from '../../utils/clinicalAlerts';
import {
  Search,
  ArrowUpDown,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Filter,
  Eye,
} from 'lucide-react';

interface AuditTableViewProps {
  patients: UserProfile[];
  onSelectPatient: (patient: UserProfile) => void;
}

type SortField = 'name' | 'bmr' | 'tdee' | 'targetKcal' | 'protein' | 'fat' | 'carbs';
type SortOrder = 'asc' | 'desc';

export const AuditTableView: React.FC<AuditTableViewProps> = ({
  patients,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterMode, setFilterMode] = useState<'all' | 'floor_hit' | 'alerts' | 'blocked'>('all');

  // Compute patient audit rows
  const enrichedPatients = useMemo(() => {
    return patients.map((p) => {
      const alerts = calculatePatientAlerts(p);
      const metrics = p.metrics;
      const bmr = metrics.bmrKcal;
      const tdee = metrics.tdeeKcal;
      const targetKcal = metrics.targetKcal;
      const proteinGrams = metrics.proteinGrams;
      const fatGrams = metrics.fatGrams;
      const carbsGrams = metrics.carbsGrams;

      // Floor check logic
      const isCarbFloorHit = carbsGrams <= 105;
      const minSafeFloor = metrics.minSafeCalories || (p.onboarding.gender === 'femenino' ? 1200 : 1500);
      const isCalorieFloorHit = targetKcal <= minSafeFloor + 20;
      const hasAnyFloorHit = isCarbFloorHit || isCalorieFloorHit;

      return {
        profile: p,
        alerts,
        bmr,
        tdee,
        targetKcal,
        proteinGrams,
        fatGrams,
        carbsGrams,
        isCarbFloorHit,
        isCalorieFloorHit,
        hasAnyFloorHit,
        isBlocked: metrics.isMedicalBlocked || alerts.some((a) => a.type === 'blocking_condition'),
      };
    });
  }, [patients]);

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let result = enrichedPatients.filter((item) => {
      const matchesSearch =
        item.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profile.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'floor_hit') return item.hasAnyFloorHit;
      if (filterMode === 'alerts') return item.alerts.length > 0;
      if (filterMode === 'blocked') return item.isBlocked;

      return true;
    });

    result.sort((a, b) => {
      let valA: any = a.profile.name;
      let valB: any = b.profile.name;

      if (sortField === 'bmr') {
        valA = a.bmr;
        valB = b.bmr;
      } else if (sortField === 'tdee') {
        valA = a.tdee;
        valB = b.tdee;
      } else if (sortField === 'targetKcal') {
        valA = a.targetKcal;
        valB = b.targetKcal;
      } else if (sortField === 'protein') {
        valA = a.proteinGrams;
        valB = b.proteinGrams;
      } else if (sortField === 'fat') {
        valA = a.fatGrams;
        valB = b.fatGrams;
      } else if (sortField === 'carbs') {
        valA = a.carbsGrams;
        valB = b.carbsGrams;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [enrichedPatients, searchTerm, filterMode, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Controles de Búsqueda y Filtro Rápido */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#2E3A36]/45 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente por nombre o correo..."
            className="w-full bg-white border border-[#AEC9C0]/60 rounded-xl py-2 pl-10 pr-4 text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#2E3A36]/60" />
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#6E9E93] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Todos ({patients.length})
          </button>
          <button
            onClick={() => setFilterMode('floor_hit')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'floor_hit'
                ? 'bg-[#6E9E93] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Tocó Piso de Seguridad ({enrichedPatients.filter((p) => p.hasAnyFloorHit).length})
          </button>
          <button
            onClick={() => setFilterMode('alerts')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'alerts'
                ? 'bg-[#6E9E93] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Con Alertas ({enrichedPatients.filter((p) => p.alerts.length > 0).length})
          </button>
          <button
            onClick={() => setFilterMode('blocked')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'blocked'
                ? 'bg-[#2E3A36] text-white'
                : 'bg-white border border-[#AEC9C0]/50 text-[#2E3A36]/70 hover:text-[#2E3A36]'
            }`}
          >
            Bloqueados ({enrichedPatients.filter((p) => p.isBlocked).length})
          </button>
        </div>
      </div>

      {/* Tabla de Auditoría Clínica */}
      <div className="bg-white border border-[#AEC9C0]/60 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF6F0] border-b border-[#AEC9C0]/50 text-[#2E3A36] font-semibold select-none">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Paciente
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bmr')}
                  className="py-3 px-3 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    GEB (BMR)
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tdee')}
                  className="py-3 px-3 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    GET (TDEE)
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('targetKcal')}
                  className="py-3 px-3 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Déficit / Meta
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('protein')}
                  className="py-3 px-3 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Proteína (2.0g)
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fat')}
                  className="py-3 px-3 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Grasas (0.8g)
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('carbs')}
                  className="py-3 px-3 cursor-pointer hover:text-[#6E9E93] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    Carbohidratos
                    <ArrowUpDown className="w-3 h-3 text-[#2E3A36]/40" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Pisos de Seguridad</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEC9C0]/30">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#2E3A36]/60">
                    No se encontraron pacientes para este filtro.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(
                  ({
                    profile,
                    alerts,
                    bmr,
                    tdee,
                    targetKcal,
                    proteinGrams,
                    fatGrams,
                    carbsGrams,
                    isCarbFloorHit,
                    isCalorieFloorHit,
                    isBlocked,
                  }) => (
                    <tr
                      key={profile.id || profile.email}
                      onClick={() => onSelectPatient(profile)}
                      className="hover:bg-[#FAF6F0] transition-colors cursor-pointer group"
                    >
                      {/* Paciente */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2E3A36] group-hover:text-[#6E9E93] transition-colors flex items-center gap-2">
                          {profile.name}
                          {isBlocked && (
                            <span className="w-2 h-2 rounded-full bg-[#F2A488] animate-pulse" title="Bloqueo médico" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#2E3A36]/70">
                          {profile.onboarding.age} años · {profile.onboarding.gender === 'femenino' ? 'F' : 'M'} · {profile.onboarding.weightKg} kg
                        </div>
                      </td>

                      {/* GEB (BMR) */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-[#2E3A36] font-bold">{bmr} kcal</div>
                        <div className="text-[10px] text-[#2E3A36]/60">
                          {profile.metrics.bmrFormulaUsed.includes('Cunningham') ? 'Cunningham' : 'Mifflin'}
                        </div>
                      </td>

                      {/* GET (TDEE) */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-[#2E3A36] font-bold">{tdee} kcal</div>
                        <div className="text-[10px] text-[#2E3A36]/60">
                          NEAT x{profile.metrics.neatFactor}
                        </div>
                      </td>

                      {/* Déficit / Meta */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-[#6E9E93] font-bold">{targetKcal} kcal</div>
                        <div className="text-[10px] text-[#2E3A36]/60">
                          {targetKcal - tdee > 0 ? `+${targetKcal - tdee}` : targetKcal - tdee} kcal/d
                        </div>
                      </td>

                      {/* Proteína */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-[#2E3A36] font-semibold">{proteinGrams} g</div>
                        <div className="text-[10px] text-[#2E3A36]/60">
                          {(proteinGrams / profile.onboarding.weightKg).toFixed(1)} g/kg
                        </div>
                      </td>

                      {/* Grasas */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-[#2E3A36] font-semibold">{fatGrams} g</div>
                        <div className="text-[10px] text-[#2E3A36]/60">
                          {(fatGrams / profile.onboarding.weightKg).toFixed(1)} g/kg
                        </div>
                      </td>

                      {/* Carbohidratos */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className={`font-bold ${isCarbFloorHit ? 'text-[#8FAFD1]' : 'text-[#2E3A36]'}`}>
                          {carbsGrams} g
                        </div>
                        <div className="text-[10px] text-[#2E3A36]/60">
                          {isCarbFloorHit ? 'Piso 100g activo' : `${((carbsGrams * 4 / targetKcal) * 100).toFixed(0)}% kcal`}
                        </div>
                      </td>

                      {/* Pisos de Seguridad */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {isBlocked ? (
                            <span className="px-2 py-0.5 rounded-lg bg-[#F2A488]/20 border border-[#F2A488]/50 text-[10px] text-[#2E3A36] font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-[#2E3A36]" />
                              Bloqueo Médico
                            </span>
                          ) : isCarbFloorHit ? (
                            <span className="px-2 py-0.5 rounded-lg bg-[#AEC9C0]/30 border border-[#AEC9C0]/70 text-[10px] text-[#2E3A36] font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-[#6E9E93]" />
                              Piso Carbs (100g)
                            </span>
                          ) : isCalorieFloorHit ? (
                            <span className="px-2 py-0.5 rounded-lg bg-[#8FAFD1]/20 border border-[#8FAFD1]/40 text-[10px] text-[#2E3A36] font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-[#8FAFD1]" />
                              Piso Calórico
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-[#6E9E93]/15 border border-[#6E9E93]/30 text-[10px] text-[#6E9E93] font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#6E9E93]" />
                              Estándar Seguro
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(profile);
                          }}
                          className="px-2.5 py-1 bg-[#FAF6F0] hover:bg-[#6E9E93] text-[#2E3A36] hover:text-white border border-[#AEC9C0]/40 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ficha</span>
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
