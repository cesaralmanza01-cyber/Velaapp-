import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Lock,
  HeartHandshake,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onHasPlan: () => void;
  hasSavedPlan: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  onHasPlan,
  hasSavedPlan,
}) => {
  return (
    <div className="min-h-[88vh] flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto text-[#2E3A36] font-sans selection:bg-[#6E9E93] selection:text-white">
      {/* Top Header / Branding */}
      <div className="space-y-6 pt-2">
        
        {/* Header Superior Integrado */}
        <div className="flex items-center justify-between bg-white/80 border border-[#AEC9C0]/60 rounded-2xl px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <img
              src="/velapp-logo.svg"
              alt="Velapp"
              className="h-7 w-auto object-contain"
              style={{ width: '100px' }}
            />
            <span className="text-xs font-semibold text-[#2E3A36]/80 border-l border-[#AEC9C0] pl-2.5 font-serif">
              Dra. Lorena Castro
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E9E93] bg-[#6E9E93]/10 px-2 py-0.5 rounded-md">
            Nutrición Clínica
          </span>
        </div>

        {/* Titular y Párrafo Principal */}
        <div className="space-y-3.5 text-center sm:text-left pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A36] tracking-tight leading-snug font-serif">
            Nutrición clínica con ciencia real, sin <span className="text-[#6E9E93]">restricciones extremas</span>
          </h1>
          
          <p className="text-sm sm:text-base text-[#2E3A36]/85 leading-relaxed">
            Ya sea que busques empezar a alimentarte bien, ganar masa muscular, mejorar tus niveles de energía o superar un estancamiento: en Vela entendemos tu biología para diseñar un plan 100% personalizado y sostenible.
          </p>
        </div>

        {/* 4 Tarjetas de Diferenciales Clave */}
        <div className="grid grid-cols-2 gap-2.5 text-left pt-1">
          <div className="p-3.5 bg-white rounded-2xl border border-[#AEC9C0]/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#6E9E93]">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold text-[#2E3A36]">Tus números, en lenguaje humano</span>
            </div>
            <p className="text-[11px] text-[#2E3A36]/70 leading-snug">
              Comprende tu Tasa Metabólica Basal, NEAT y masa muscular sin jerga confusa.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#AEC9C0]/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#8FAFD1]">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-bold text-[#2E3A36]">Con fase de mantenimiento</span>
            </div>
            <p className="text-[11px] text-[#2E3A36]/70 leading-snug">
              Estrategia progresiva para consolidar tus resultados y blindar tu metabolismo.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#AEC9C0]/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#6E9E93]">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-xs font-bold text-[#2E3A36]">Sin culpas</span>
            </div>
            <p className="text-[11px] text-[#2E3A36]/70 leading-snug">
              Sin alimentos prohibidos ni castigos; balance con ciencia nutricional real.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#AEC9C0]/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#2E3A36]">
              <Lock className="w-4 h-4 text-[#6E9E93]" />
              <span className="text-xs font-bold text-[#2E3A36]">Privado y seguro</span>
            </div>
            <p className="text-[11px] text-[#2E3A36]/70 leading-snug">
              Tu historial médico y datos personales están estrictamente resguardados.
            </p>
          </div>
        </div>

        {/* Tarjeta de Autoridad Médica */}
        <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0] shadow-xs text-left flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6E9E93] text-white flex-shrink-0 flex items-center justify-center font-bold text-base border-2 border-[#AEC9C0] shadow-2xs">
            DLC
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-[#2E3A36] uppercase tracking-wider font-mono">
                Dra. Lorena Castro
              </h3>
              <span className="px-2 py-0.5 bg-[#6E9E93]/15 text-[#6E9E93] rounded-md text-[10px] font-bold">
                Médica
              </span>
            </div>
            <p className="text-[11px] text-[#2E3A36]/80 font-medium">
              Especialista en Nutrición Clínica & Salud Hormonal
            </p>
            <p className="text-xs text-[#2E3A36]/75 italic pt-1 leading-relaxed">
              &quot;La alimentación saludable no se basa en culpas ni restricciones extremas, sino en sincronía biológica. En equipo identificaremos tus necesidades y construiremos un plan seguro y delicioso adaptado a tu estilo de vida.&quot;
            </p>
          </div>
        </div>

      </div>

      {/* Action Buttons & CTA */}
      <div className="space-y-3 pt-6 pb-2">
        {/* Botón CTA Coral Principal */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-[#F2A488] hover:bg-[#e89477] active:scale-[0.99] text-[#2E3A36] font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-[#F2A488]/30"
        >
          <span>Comenzar mi diagnóstico</span>
          <ArrowRight className="w-5 h-5 text-[#2E3A36]" />
        </button>

        {hasSavedPlan ? (
          <button
            onClick={onHasPlan}
            className="w-full py-3 px-6 bg-[#AEC9C0] hover:bg-[#9dbdb2] text-[#2E3A36] font-semibold text-xs sm:text-sm rounded-2xl border border-[#6E9E93]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#2E3A36]" />
            <span>Ver mi plan guardado</span>
          </button>
        ) : (
          <button
            onClick={onHasPlan}
            className="w-full py-2.5 px-6 bg-white hover:bg-[#FAF6F0] text-[#2E3A36] font-semibold text-xs rounded-2xl border border-[#AEC9C0]/60 transition-colors text-center cursor-pointer shadow-2xs"
          >
            Ya tengo mi plan / Iniciar sesión
          </button>
        )}

        <p className="text-[11px] text-center text-[#2E3A36]/60 pt-0.5">
          Toma aproximadamente 3 a 4 minutos · Sin dietas restrictivas ni compromisos
        </p>
      </div>
    </div>
  );
};
