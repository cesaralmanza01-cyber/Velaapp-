import React from 'react';
import { OnboardingData, CalculatedMetrics } from '../../types';
import { ShieldCheck, Stethoscope, RefreshCw, MessageSquare, HeartHandshake, Clock } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

interface MedicalBlockScreenProps {
  onboardingData?: OnboardingData;
  reasons?: string[];
  metrics?: CalculatedMetrics;
  onModifyData?: () => void;
  onResetOrEdit?: () => void;
}

export const MedicalBlockScreen: React.FC<MedicalBlockScreenProps> = ({
  onboardingData,
  reasons,
  metrics,
  onModifyData,
  onResetOrEdit,
}) => {
  const patientName =
    onboardingData?.preferredName ||
    onboardingData?.name?.split(' ')[0] ||
    'Hola';

  const handleEdit = onModifyData || onResetOrEdit || (() => window.location.reload());

  const blockReasonsList =
    reasons && reasons.length > 0
      ? reasons
      : metrics?.medicalBlockReasons && metrics.medicalBlockReasons.length > 0
      ? metrics.medicalBlockReasons
      : [
          'Condición clínica detectada que requiere supervisión y valoración médica o nutricional inicial personalizada.',
        ];

  const handleOpenWhatsApp = () => {
    openWhatsApp(
      '573011417555',
      `Hola equipo de Vela y Dra. Lorena Castro. Soy ${patientName}, necesito agendar mi valoración médica o nutricional inicial para continuar en Vela.`
    );
  };

  const clearanceStatus = onboardingData?.revision_medica;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2E3A36] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white border border-[#AEC9C0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Wordmark Logo & Shield */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#AEC9C0]/25 border border-[#6E9E93]/40 flex items-center justify-center text-[#6E9E93] shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#6E9E93]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#AEC9C0]/30 text-[#2E3A36] text-xs font-bold font-mono tracking-wide">
            <HeartHandshake className="w-3.5 h-3.5 text-[#6E9E93]" />
            <span>PROTOCOLO DE SEGURIDAD CLÍNICA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#2E3A36]">
            {patientName}, tu salud es nuestra prioridad
          </h2>
        </div>

        {/* Estado de Revisión si está pendiente */}
        {clearanceStatus === 'pendiente' && (
          <div className="p-3 bg-[#8FAFD1]/20 border border-[#8FAFD1] rounded-2xl flex items-center gap-2.5 text-xs text-[#2E3A36]">
            <Clock className="w-4 h-4 text-[#8FAFD1] flex-shrink-0" />
            <span>Tu expediente está en <strong>revisión médica o nutricional por la Dra. Lorena Castro</strong>. En cuanto sea autorizada, podrás continuar inmediatamente.</span>
          </div>
        )}

        {/* Mensaje Exacto Requerido */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] border-l-4 border-[#6E9E93] border-t border-r border-b border-[#AEC9C0]/50 space-y-3">
          <p className="text-sm sm:text-base font-semibold text-[#2E3A36] leading-relaxed">
            No podemos calcular tu plan automáticamente todavía. Tu caso requiere una valoración médica o nutricional especializada antes de continuar. Agenda tu cita con el botón de WhatsApp de abajo.
          </p>

          {/* Botón CTA Principal de WhatsApp con handler onClick */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-4 px-5 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-[0.99] text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ring-2 ring-[#6E9E93]/30"
          >
            <MessageSquare className="w-5 h-5 text-white" />
            <span>Agendar mi valoración médica o nutricional por WhatsApp</span>
          </button>
        </div>

        {/* Motivos Clínicos Detectados */}
        <div className="space-y-2.5 bg-white border border-[#AEC9C0]/60 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3A36]/70 font-mono">
              Motivo(s) registrado(s) en tu expediente médico:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F2A488]/20 text-[#2E3A36] text-[10px] font-bold">
              Atención Prioritaria
            </span>
          </div>
          
          <ul className="space-y-2">
            {blockReasonsList.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2E3A36] font-medium leading-normal">
                <span className="w-2 h-2 rounded-full bg-[#6E9E93] mt-1.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nota Cálida de la Dra. Lorena Castro */}
        <div className="bg-[#FAF6F0] border border-[#AEC9C0] rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#6E9E93] font-bold text-sm font-serif">
            <Stethoscope className="w-4 h-4 text-[#6E9E93]" />
            <span>Mensaje de la Dra. Lorena Castro</span>
          </div>
          <p className="text-xs text-[#2E3A36]/80 leading-relaxed italic">
            &quot;En Vela cuidamos tu organismo de manera responsable. Cuando existen condiciones metabólicas, hormonales o digestivas especiales, un algoritmo automático no reemplaza la mirada clínica médica y nutricional. Queremos escucharte, revisar tu historial y diseñar un abordaje seguro que proteja tus órganos y potencie tu bienestar.&quot;
          </p>
          <div className="pt-1 text-[11px] font-mono text-[#2E3A36]/60">
            Dra. Lorena Castro • Médica Especialista en Nutrición Clínica
          </div>
        </div>

        {/* Acción secundaria para corregir o revisar */}
        <div className="pt-1">
          <button
            onClick={handleEdit}
            className="w-full py-3 px-4 bg-[#FAF6F0] hover:bg-[#AEC9C0]/20 text-[#2E3A36] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#AEC9C0]/70 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6E9E93]" />
            <span>Revisar o corregir mis respuestas en el cuestionario</span>
          </button>
        </div>

      </div>
    </div>
  );
};

