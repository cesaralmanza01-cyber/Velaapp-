import React, { useState } from 'react';
import { X, Copy, Check, Calendar, CheckSquare, Square } from 'lucide-react';

interface CopyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: string;
  daysOfWeek: string[];
  onConfirmCopy: (targetDays: string[]) => void;
}

export const CopyDayModal: React.FC<CopyDayModalProps> = ({
  isOpen,
  onClose,
  currentDay,
  daysOfWeek,
  onConfirmCopy,
}) => {
  const otherDays = daysOfWeek.filter((d) => d !== currentDay);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDays.length === otherDays.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...otherDays]);
    }
  };

  const handleApply = () => {
    if (selectedDays.length === 0) return;
    onConfirmCopy(selectedDays);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#AEC9C0] text-[#2E3A36] space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#AEC9C0]/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6E9E93]/15 text-[#6E9E93] flex items-center justify-center">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2E3A36]">
                Copiar comidas de {currentDay}
              </h3>
              <p className="text-xs text-[#2E3A36]/70">
                Clona todas las equivalencias a otros días de la semana
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white border border-[#AEC9C0]/60 text-[#2E3A36]/70 hover:text-[#2E3A36] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Seleccionar Todos */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2E3A36]/80">
            Elige los días de destino:
          </span>
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-[#6E9E93] hover:underline flex items-center gap-1"
          >
            {selectedDays.length === otherDays.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        {/* Checkbox Grid de Días */}
        <div className="grid grid-cols-2 gap-2.5">
          {otherDays.map((day) => {
            const isChecked = selectedDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all shadow-2xs ${
                  isChecked
                    ? 'bg-[#6E9E93]/15 border-[#6E9E93] text-[#2E3A36]'
                    : 'bg-white border-[#AEC9C0]/60 text-[#2E3A36]/80 hover:bg-[#AEC9C0]/15'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#6E9E93]" />
                  <span className="text-xs font-bold">{day}</span>
                </div>
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-[#6E9E93]" />
                ) : (
                  <Square className="w-4 h-4 text-[#2E3A36]/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* Warning / Explanation */}
        <p className="text-[11px] text-[#2E3A36]/70 italic bg-white p-3 rounded-xl border border-[#AEC9C0]/50">
          💡 Las comidas personalizadas existentes en los días seleccionados se actualizarán con las de <strong>{currentDay}</strong>.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#AEC9C0]/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#2E3A36]/70 hover:bg-[#AEC9C0]/20 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={selectedDays.length === 0}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              selectedDays.length > 0
                ? 'bg-[#6E9E93] hover:bg-[#5C897F] text-white cursor-pointer'
                : 'bg-[#FAF6F0] border border-[#AEC9C0]/40 text-[#2E3A36]/40 cursor-not-allowed'
            }`}
          >
            Copiar a {selectedDays.length} día{selectedDays.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
