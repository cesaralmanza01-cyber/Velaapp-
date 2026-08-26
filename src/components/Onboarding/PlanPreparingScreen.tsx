import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, HeartPulse, Sparkles, ShieldCheck } from 'lucide-react';

interface PlanPreparingScreenProps {
  userName?: string;
  onComplete: () => void;
}

export const PlanPreparingScreen: React.FC<PlanPreparingScreenProps> = ({
  userName = 'Paciente',
  onComplete,
}) => {
  const steps = [
    'Sincronizando tasa metabólica basal con tus hábitos de sueño...',
    'Calculando la distribución óptima de proteína limpia y masa magra...',
    'Convirtiendo tus macronutrientes en porciones de comida colombiana...',
    'Estructurando tu tabla de equivalencias con alimentos verificados...',
    'Configurando tu Fase de Mantenimiento Anti-Rebote™ y timing...',
  ];

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    steps.forEach((_, index) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, index]);
      }, (index + 1) * 850);
    });

    const totalTime = (steps.length + 1) * 850;
    const timer = setTimeout(() => {
      onComplete();
    }, totalTime);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-[#2E3A36] max-w-md mx-auto text-center space-y-6 animate-in fade-in duration-300">
      {/* Animated Heartbeat Circle */}
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#AEC9C0]/40 flex items-center justify-center animate-ping absolute inset-0 opacity-40"></div>
        <div className="w-20 h-20 rounded-full bg-[#6E9E93] text-white flex items-center justify-center shadow-lg relative z-10">
          <HeartPulse className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/30 text-[#6E9E93] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Paso 16 de 16: Generación Final</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2E3A36]">
          {userName}, ya conocemos tu cuerpo y tu fisiología única
        </h2>
        <p className="text-xs text-[#2E3A36]/80 max-w-xs mx-auto">
          Generando tu plan de nutrición clínica y equivalencias individualizadas.
        </p>
      </div>

      {/* Checklist */}
      <div className="w-full bg-white p-5 rounded-3xl border border-[#AEC9C0]/60 shadow-xs space-y-3.5 text-left">
        {steps.map((stepText, idx) => {
          const isDone = completedSteps.includes(idx);
          return (
            <div
              key={idx}
              className={`flex items-start space-x-3 transition-all duration-300 ${
                isDone ? 'opacity-100' : 'opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#6E9E93] flex-shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="w-4 h-4 text-[#8FAFD1] animate-spin flex-shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-medium text-[#2E3A36] leading-snug">
                {stepText}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-[#2E3A36]/70 justify-center">
        <ShieldCheck className="w-4 h-4 text-[#6E9E93]" />
        <span>Validado por el protocolo de la Dra. Lorena Castro</span>
      </div>
    </div>
  );
};
