import React from 'react';
import { HungerTrackerEntry } from '../../types';
import { Utensils, Brain, Sparkles } from 'lucide-react';

interface HungerTrackerWidgetProps {
  value: HungerTrackerEntry;
  onChange: (value: HungerTrackerEntry) => void;
}

const PHYSICAL_HUNGER_LEVELS = [
  { level: 1, label: 'Plenitud total', desc: 'Sin hambre física, estómago satisfecho' },
  { level: 2, label: 'Hambre leve', desc: 'Sensación sutil, puedes esperar sin problema' },
  { level: 3, label: 'Hambre moderada', desc: 'Momento fisiológico ideal para comer con calma' },
  { level: 4, label: 'Hambre alta', desc: 'Estómago rugiendo, señal biológica de energía' },
  { level: 5, label: 'Hambre extrema', desc: 'Demanda energética urgente, momento de nutrirte' },
];

const MENTAL_NOISE_LEVELS = [
  { level: 1, label: 'En paz total', desc: 'Tu mente está tranquila y enfocada en tus actividades' },
  { level: 2, label: 'Leve / Esporádico', desc: 'Pensamientos pasajeros con la comida sin alterar tu calma' },
  { level: 3, label: 'Recurrente', desc: 'Pensamientos frecuentes sobre comida (señal de ajuste calórico)' },
  { level: 4, label: 'Distractor', desc: 'Pensamientos continuos que indican necesidad de mayor saciedad' },
  { level: 5, label: 'Ruido elevado', desc: 'Fijación constante: tu cuerpo pide ajuste en proteína o volumen' },
];

export const HungerTrackerWidget: React.FC<HungerTrackerWidgetProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="bg-white border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 space-y-5 text-[#2E3A36] shadow-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#6E9E93]/15 text-[#6E9E93]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#2E3A36]">
            Registro Clínico de Hambre en 2 Ejes
          </h4>
        </div>
        <p className="text-xs text-[#2E3A36]/75 leading-relaxed">
          Separamos la señal biológica de tu estómago del ruido de comida provocado por respuestas hormonales y niveles de saciedad.
        </p>
      </div>

      {/* Eje 1: Hambre Física Biológica (Salvia) */}
      <div className="space-y-3 bg-[#FAF6F0] border border-[#AEC9C0]/50 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6E9E93]">
            <Utensils className="w-4 h-4" />
            Eje 1: Hambre Física Biológica
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6E9E93]/15 text-[#6E9E93] text-xs font-bold font-mono border border-[#6E9E93]/30">
            Nivel {value.physicalHunger}/5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {PHYSICAL_HUNGER_LEVELS.map((item) => {
            const isSelected = value.physicalHunger === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => onChange({ ...value, physicalHunger: item.level })}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6E9E93] text-white ring-2 ring-[#6E9E93]/40 shadow-xs'
                    : 'bg-white text-[#2E3A36] border border-[#AEC9C0]/50 hover:bg-[#AEC9C0]/20'
                }`}
              >
                <span className="text-base font-bold">{item.level}</span>
                <span className="text-[10px] leading-tight mt-0.5 line-clamp-1 font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-[#2E3A36]/80 bg-white p-2 rounded-lg border border-[#AEC9C0]/40">
          <strong className="text-[#6E9E93]">
            {PHYSICAL_HUNGER_LEVELS.find((l) => l.level === value.physicalHunger)?.label}:
          </strong>{' '}
          {PHYSICAL_HUNGER_LEVELS.find((l) => l.level === value.physicalHunger)?.desc}
        </p>
      </div>

      {/* Eje 2: Ruido de Comida / Food Noise (Azul confianza para métricas clínicas) */}
      <div className="space-y-3 bg-[#FAF6F0] border border-[#AEC9C0]/50 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8FAFD1]">
            <Brain className="w-4 h-4" />
            Eje 2: Ruido de Comida (Food Noise)
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#8FAFD1]/20 text-[#2E3A36] text-xs font-bold font-mono border border-[#8FAFD1]/40">
            Nivel {value.mentalFoodNoise}/5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {MENTAL_NOISE_LEVELS.map((item) => {
            const isSelected = value.mentalFoodNoise === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => onChange({ ...value, mentalFoodNoise: item.level })}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#8FAFD1] text-white ring-2 ring-[#8FAFD1]/40 shadow-xs'
                    : 'bg-white text-[#2E3A36] border border-[#AEC9C0]/50 hover:bg-[#AEC9C0]/20'
                }`}
              >
                <span className="text-base font-bold">{item.level}</span>
                <span className="text-[10px] leading-tight mt-0.5 line-clamp-1 font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-[#2E3A36]/80 bg-white p-2 rounded-lg border border-[#AEC9C0]/40">
          <strong className="text-[#8FAFD1]">
            {MENTAL_NOISE_LEVELS.find((l) => l.level === value.mentalFoodNoise)?.label}:
          </strong>{' '}
          {MENTAL_NOISE_LEVELS.find((l) => l.level === value.mentalFoodNoise)?.desc}
        </p>
      </div>
    </div>
  );
};
