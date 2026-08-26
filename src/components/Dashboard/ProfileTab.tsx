import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  LogOut,
  Download,
  ShieldCheck,
  Award,
  LogIn,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

interface ProfileTabProps {
  userProfile: UserProfile;
  onResetAssessment?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userProfile,
  onOpenAuth,
  onLogout,
}) => {
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);
  const displayName =
    userProfile.onboarding.preferredName ||
    userProfile.onboarding.name ||
    'Paciente';

  const handleInstallPWA = () => {
    alert(
      'Para instalar en tu celular: En Safari o Chrome toca "Compartir" o los 3 puntos de menú y selecciona "Agregar a la pantalla principal".'
    );
    setPwaInstalled(true);
  };

  const handleContactMedicalTeam = () => {
    openWhatsApp(
      '573011417555',
      `Hola equipo de la Dra. Lorena Castro. Soy ${displayName} y deseo solicitar una reevaluación clínica de mi diagnóstico metabólico.`
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4 text-[#2E3A36] space-y-6 pb-28 font-sans">
      {/* Tarjeta de Perfil */}
      <div className="bg-white border border-[#AEC9C0]/60 p-5 rounded-3xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6E9E93]/15 text-[#6E9E93] border border-[#6E9E93]/30 flex items-center justify-center font-bold text-xl">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#2E3A36]">
              {displayName}
            </h2>
            {userProfile.onboarding.name !== displayName && (
              <p className="text-[11px] text-[#2E3A36]/70">
                {userProfile.onboarding.name}
              </p>
            )}
            <p className="text-xs text-[#2E3A36]/60">
              {userProfile.onboarding.email || 'Perfil Local'}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#6E9E93]/10 text-[#6E9E93] text-[10px] font-semibold rounded-full border border-[#6E9E93]/20">
              Inició: {userProfile.createdDate}
            </span>
          </div>
        </div>

        {userProfile.onboarding.email ? (
          <button
            onClick={onLogout}
            className="p-2.5 bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 text-[#2E3A36]/70 hover:text-[#2E3A36] rounded-xl transition-colors border border-[#AEC9C0]/40 cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-2 bg-[#6E9E93] hover:bg-[#5C897F] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Guardar Cuenta</span>
          </button>
        )}
      </div>

      {/* Banner de Racha y Compromiso */}
      <div className="bg-white border border-[#AEC9C0]/60 p-4 rounded-3xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#6E9E93]/15 text-[#6E9E93] rounded-2xl border border-[#6E9E93]/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2E3A36]">Racha de Sincronía</h3>
            <p className="text-[11px] text-[#2E3A36]/70">Días consecutivos en tu plan</p>
          </div>
        </div>
        <span className="text-2xl font-extrabold text-[#6E9E93] font-mono">
          {userProfile.streakDays || 1} <span className="text-xs font-normal text-[#2E3A36]/60">días</span>
        </span>
      </div>

      {/* Configuración y PWA */}
      <div className="bg-white border border-[#AEC9C0]/60 p-5 rounded-3xl space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-[#2E3A36]/60 uppercase tracking-wider">
          Configuración e Instalación
        </h3>

        {/* Botón PWA */}
        <button
          onClick={handleInstallPWA}
          className="w-full p-3.5 bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 rounded-2xl border border-[#AEC9C0]/50 flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-[#6E9E93]" />
            <div className="text-left">
              <span className="text-xs font-bold text-[#2E3A36] block">Instalar como App en tu Celular (PWA)</span>
              <span className="text-[10px] text-[#2E3A36]/65 block">Acceso directo desde tu pantalla de inicio</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#6E9E93]">Instalar</span>
        </button>

        {/* Nota Médica */}
        <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#AEC9C0]/50 flex items-start gap-2.5 text-xs text-[#2E3A36]">
          <ShieldCheck className="w-4 h-4 text-[#6E9E93] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[#2E3A36]/75">
            <strong className="text-[#2E3A36]">Supervisión Clínica:</strong> Tus datos metabólicos, fórmulas (Mifflin-St Jeor / Cunningham), y test Sit-to-Stand se rigen bajo los parámetros clínicos de la Dra. Lorena Castro. Esta app es una herramienta de apoyo y no reemplaza tu consulta médica o nutricional presencial.
          </p>
        </div>

        {/* Portal Médico Directo */}
        <div className="pt-1 text-center">
          <a
            href="/panel"
            className="text-[11px] text-[#2E3A36]/60 hover:text-[#6E9E93] transition-colors inline-flex items-center gap-1 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso a Panel Profesional Médico (/panel)
          </a>
        </div>
      </div>

      {/* Zona de Supervisión y Reevaluación Asistida */}
      <div className="bg-white border border-[#AEC9C0]/60 p-5 rounded-3xl space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-[#6E9E93] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#6E9E93]" />
          <span>Diagnóstico y Reevaluación Clínica</span>
        </h3>
        <p className="text-xs text-[#2E3A36]/75 leading-relaxed">
          Tu diagnóstico metabólico inicial es único para garantizar la consistencia en el seguimiento de tus métricas y progreso. Si necesitas actualizar datos clínicos de base o repetir la valoración, el equipo médico activará tu reevaluación.
        </p>

        <button
          onClick={handleContactMedicalTeam}
          className="w-full py-3 px-4 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-[0.99] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Solicitar Reevaluación al Equipo Médico por WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
