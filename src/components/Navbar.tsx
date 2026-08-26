import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentStepTitle?: string;
  hasSavedPlan?: boolean;
  onOpenSavedPlan?: () => void;
  userEmail?: string;
  onOpenAuth?: () => void;
  isDoctor?: boolean;
  onOpenDoctorPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStepTitle,
  hasSavedPlan,
  onOpenSavedPlan,
  userEmail,
  onOpenAuth,
  isDoctor,
  onOpenDoctorPanel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#AEC9C0]/50 text-[#2E3A36] shadow-xs">
      <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Real Velapp Wordmark Logo + Doctor Name */}
        <div className="flex items-center gap-3">
          <img
            src="/velapp-logo.svg"
            alt="Velapp"
            className="h-7 sm:h-8 w-auto object-contain cursor-pointer"
            style={{ width: '110px' }}
            onClick={onOpenSavedPlan}
          />
          <span className="text-[11px] sm:text-xs text-[#2E3A36]/70 border-l border-[#AEC9C0]/80 pl-2.5 font-medium leading-tight">
            Dra. Lorena Castro
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDoctor && onOpenDoctorPanel && (
            <button
              onClick={onOpenDoctorPanel}
              className="px-2.5 py-1 text-xs font-bold bg-[#AEC9C0]/25 hover:bg-[#AEC9C0]/40 text-[#2E3A36] border border-[#AEC9C0]/70 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Ir al Panel Médico"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#6E9E93]" />
              <span>Panel</span>
            </button>
          )}

          {hasSavedPlan && onOpenSavedPlan && (
            <button
              onClick={onOpenSavedPlan}
              className="px-3 py-1 text-xs font-semibold bg-[#6E9E93] hover:bg-[#5C897F] text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Mi Plan
            </button>
          )}

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="p-2 text-[#2E3A36]/80 hover:text-[#2E3A36] bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 border border-[#AEC9C0]/50 rounded-xl transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
              title={userEmail ? `Cuenta: ${userEmail}` : 'Iniciar sesión / Guardar'}
            >
              <User className="w-4 h-4 text-[#6E9E93]" />
              <span className="hidden sm:inline text-[11px] font-medium">
                {userEmail ? userEmail.split('@')[0] : 'Cuenta'}
              </span>
            </button>
          )}
        </div>
      </div>

      {currentStepTitle && (
        <div className="bg-[#FAF6F0] px-4 py-1.5 text-center text-xs text-[#2E3A36]/80 font-medium border-t border-[#AEC9C0]/30">
          {currentStepTitle}
        </div>
      )}
    </header>
  );
};

