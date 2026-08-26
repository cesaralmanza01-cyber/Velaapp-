import React, { useState, useEffect } from 'react';
import { GaugeMeter } from '../Common/GaugeMeter';
import { ArrowRight, Sparkles, HeartPulse, CheckCircle2 } from 'lucide-react';

interface MetricRevealModalProps {
  title: string;
  metricName: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  statusText: string;
  isAlert?: boolean;
  explanationText: string;
  biologicalInsight: string;
  onNext: () => void;
}

export const MetricRevealModal: React.FC<MetricRevealModalProps> = ({
  title,
  metricName,
  value,
  unit,
  min = 0,
  max = 100,
  statusText,
  isAlert = false,
  explanationText,
  biologicalInsight,
  onNext,
}) => {
  const [animatedValue, setAnimatedValue] = useState<number>(0);

  // Animated count up
  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const steps = 30;
    const increment = value / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(Number(start.toFixed(1)));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6F0] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#AEC9C0] animate-in fade-in zoom-in duration-300">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#AEC9C0]/40 text-[#6E9E93] text-xs font-bold">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Revelación de Diagnóstico</span>
          </div>
          <span className="text-xs font-semibold text-[#2E3A36]/60">{title}</span>
        </div>

        {/* Metric Name */}
        <h3 className="text-xl font-extrabold text-[#2E3A36] text-center mb-1">
          Tu {metricName}
        </h3>

        {/* Visual Gauge Meter */}
        <div className="my-3">
          <GaugeMeter
            value={animatedValue}
            min={min}
            max={max}
            unit={unit}
            title={metricName}
            statusText={statusText}
            isAlert={isAlert}
          />
        </div>

        {/* Empathetic Biological Explanation */}
        <div className="bg-white p-4 rounded-2xl border border-[#AEC9C0]/50 space-y-2 my-4">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-[#6E9E93] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#2E3A36] leading-relaxed font-medium">
              {explanationText}
            </p>
          </div>
          <div className="pt-2 border-t border-[#FAF6F0] flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#8FAFD1] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#2E3A36]/80 italic leading-snug">
              <span className="font-semibold text-[#6E9E93]">Dra. Lorena:</span> "{biologicalInsight}"
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 bg-[#F2A488] hover:bg-[#e89375] text-[#2E3A36] font-bold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all transform active:scale-98"
        >
          <span>Entendido, continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
