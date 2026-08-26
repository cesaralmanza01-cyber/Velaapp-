import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Plus, Minus, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { evaluateSitToStand } from '../../utils/metabolicCalc';

interface SitToStandWidgetProps {
  reps: number;
  onRepsChange: (reps: number) => void;
  age: number;
  gender: 'femenino' | 'masculino';
}

export const SitToStandWidget: React.FC<SitToStandWidgetProps> = ({
  reps,
  onRepsChange,
  age,
  gender,
}) => {
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setHasFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartTimer = () => {
    setTimerSeconds(30);
    setHasFinished(false);
    setIsRunning(true);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(30);
    setHasFinished(false);
  };

  const evalResult = evaluateSitToStand(reps, age || 40, gender || 'femenino');

  return (
    <div className="bg-white border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs text-[#2E3A36]">
      {/* Encabezado del test */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6E9E93]/15 text-[#6E9E93] text-xs font-semibold border border-[#6E9E93]/30">
            <Activity className="w-3.5 h-3.5" />
            Biomarcador Funcional Clínico
          </div>
          <h4 className="text-sm font-bold text-[#2E3A36] mt-1">
            Test Sit-to-Stand (30 Segundos)
          </h4>
          <p className="text-xs text-[#2E3A36]/75 leading-relaxed mt-0.5">
            Mide la potencia neuromuscular de tu tren inferior y la densidad mitocondrial activa.
          </p>
        </div>
      </div>

      {/* Instrucciones de ejecución */}
      <div className="bg-[#FAF6F0] rounded-xl p-3 text-xs text-[#2E3A36]/85 space-y-1 border border-[#AEC9C0]/50">
        <p className="font-semibold text-[#2E3A36]">¿Cómo realizarlo?</p>
        <ol className="list-decimal list-inside space-y-0.5 text-[#2E3A36]/75">
          <li>Siéntate en una silla firme con la espalda recta.</li>
          <li>Cruza los brazos sobre tu pecho (sin impulsarte con las manos).</li>
          <li>Párate completamente y vuelve a sentarte tantas veces como puedas en 30s.</li>
        </ol>
      </div>

      {/* Cronómetro y Contador */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Temporizador 30s */}
        <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-xl p-3.5 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-xs text-[#2E3A36]/70 font-medium">Cronómetro de 30s</span>
          <div className={`text-3xl font-extrabold font-mono transition-colors ${
            isRunning ? 'text-[#6E9E93]' : hasFinished ? 'text-[#8FAFD1]' : 'text-[#2E3A36]'
          }`}>
            00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="px-3 py-1.5 bg-[#6E9E93] hover:bg-[#5C897F] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {hasFinished ? 'Repetir Test' : 'Iniciar 30s'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRunning(false)}
                className="px-3 py-1.5 bg-[#8FAFD1] hover:bg-[#7E9EC0] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Pausar
              </button>
            )}

            <button
              type="button"
              onClick={handleResetTimer}
              className="p-1.5 text-[#2E3A36]/70 hover:text-[#2E3A36] bg-white border border-[#AEC9C0]/60 rounded-lg text-xs transition-colors cursor-pointer"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Contador de Repeticiones */}
        <div className="bg-[#FAF6F0] border border-[#AEC9C0]/40 rounded-xl p-3.5 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-xs text-[#2E3A36]/70 font-medium">Repeticiones Logradas</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onRepsChange(Math.max(0, reps - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-[#AEC9C0]/60 hover:bg-[#FAF6F0] text-[#2E3A36] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-3xl font-extrabold text-[#2E3A36] w-12 text-center">
              {reps}
            </span>

            <button
              type="button"
              onClick={() => onRepsChange(reps + 1)}
              className="w-8 h-8 rounded-lg bg-[#6E9E93] hover:bg-[#5C897F] text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-[#2E3A36]/60">
            Ajusta el número de veces que te levantaste
          </span>
        </div>
      </div>

      {/* Interpretación Clínica en Tiempo Real (Azul confianza para métricas clínicas) */}
      <div className="p-3 rounded-xl border border-[#AEC9C0]/60 bg-[#AEC9C0]/20 flex items-start gap-2.5 text-xs text-[#2E3A36]">
        {evalResult.category === 'Excelente' ? (
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#6E9E93]" />
        ) : (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#8FAFD1]" />
        )}
        <div>
          <div className="font-semibold text-[#2E3A36]">
            Nivel {evalResult.category} ({reps} repeticiones)
          </div>
          <div className="text-[#2E3A36]/75 text-[11px] mt-0.5">
            {evalResult.explanation}
          </div>
        </div>
      </div>
    </div>
  );
};
