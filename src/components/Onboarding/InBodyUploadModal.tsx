import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, Sparkles } from 'lucide-react';

export interface InBodyExtractedData {
  weightKg: number;
  bodyFatPercent: number;
  muscleMassKg: number;
  visceralFatLevel: number;
}

interface InBodyUploadModalProps {
  isOpen?: boolean;
  gender?: 'femenino' | 'masculino';
  onClose: () => void;
  onConfirmData?: (data: InBodyExtractedData) => void;
  onSuccess?: (data: InBodyExtractedData) => void;
}

export const InBodyUploadModal: React.FC<InBodyUploadModalProps> = ({
  isOpen = true,
  gender = 'femenino',
  onClose,
  onConfirmData,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<boolean>(false);

  const defaultFat = gender === 'masculino' ? 18 : 28;
  const defaultMuscle = gender === 'masculino' ? 52 : 42;
  const [weightKg, setWeightKg] = useState<number>(68);
  const [bodyFatPercent, setBodyFatPercent] = useState<number>(defaultFat);
  const [muscleMassKg, setMuscleMassKg] = useState<number>(defaultMuscle);
  const [visceralFatLevel, setVisceralFatLevel] = useState<number>(6);

  if (isOpen === false) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Content = result.split(',')[1];
        const mimeType = file.type || 'image/jpeg';

        try {
          const res = await fetch('/api/inbody-ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Content, mimeType }),
          });

          const data = await res.json();
          if (data.success && data.data) {
            if (data.data.weightKg) setWeightKg(Number(data.data.weightKg));
            if (data.data.bodyFatPercent) setBodyFatPercent(Number(data.data.bodyFatPercent));
            if (data.data.muscleMassKg) setMuscleMassKg(Number(data.data.muscleMassKg));
            if (data.data.visceralFatLevel) setVisceralFatLevel(Number(data.data.visceralFatLevel));
            setExtracted(true);
          } else {
            setErrorMsg('No pudimos extraer todos los campos automáticamente. Ajusta los valores manualmente.');
            setExtracted(true);
          }
        } catch (err) {
          setErrorMsg('No se pudo conectar con el servicio OCR. Puedes ingresar los datos manualmente abajo.');
          setExtracted(true);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setLoading(false);
      setErrorMsg('No se pudo procesar el archivo seleccionado.');
    }
  };

  const handleConfirm = () => {
    const data: InBodyExtractedData = {
      weightKg: Number(weightKg),
      bodyFatPercent: Number(bodyFatPercent),
      muscleMassKg: Number(muscleMassKg),
      visceralFatLevel: Number(visceralFatLevel),
    };
    if (onSuccess) onSuccess(data);
    if (onConfirmData) onConfirmData(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#AEC9C0] relative overflow-hidden text-[#2E3A36]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white border border-[#AEC9C0]/60 text-[#2E3A36]/70 hover:text-[#2E3A36] hover:bg-[#AEC9C0]/20 transition-colors shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-[#6E9E93] mb-1">
          <Sparkles className="w-5 h-5 text-[#F2A488]" />
          <h3 className="font-bold text-lg font-serif text-[#2E3A36]">Extracción Inteligente InBody</h3>
        </div>

        <p className="text-xs text-[#2E3A36]/80 mb-4 leading-relaxed">
          Sube una foto o PDF de tu examen InBody o báscula de bioimpedancia. La Dra. IA extraerá tus métricas en segundos.
        </p>

        {/* Upload Drop Zone */}
        {!extracted && (
          <div className="border-2 border-dashed border-[#6E9E93]/60 hover:border-[#6E9E93] bg-white rounded-2xl p-6 text-center transition-all shadow-2xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <Loader2 className="w-8 h-8 text-[#6E9E93] animate-spin" />
                <p className="text-xs font-bold text-[#2E3A36]">
                  Analizando tu reporte InBody con IA...
                </p>
                <p className="text-[10px] text-[#2E3A36]/60 font-mono">
                  Extrayendo grasa corporal, masa muscular y nivel visceral
                </p>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-[#AEC9C0]/30 rounded-2xl text-[#6E9E93]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#6E9E93] block">
                    Toca aquí para seleccionar tu foto o PDF
                  </span>
                  <span className="text-[10px] text-[#2E3A36]/60 block mt-0.5">
                    Formatos JPG, PNG o PDF (Máx. 10MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Extracted or Manual Edit Fields */}
        {(extracted || errorMsg) && (
          <div className="space-y-3 mt-3 bg-white p-4 rounded-2xl border border-[#AEC9C0]/60 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#6E9E93]">
              <CheckCircle2 className="w-4 h-4 text-[#6E9E93]" />
              <span>Verifica y confirma tus datos:</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-[#2E3A36]/80 block mb-1">
                  Peso Total (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0] text-sm font-bold text-[#2E3A36] focus:outline-none focus:border-[#6E9E93]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2E3A36]/80 block mb-1">
                  % Grasa Corporal
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPercent}
                  onChange={(e) => setBodyFatPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0] text-sm font-bold text-[#2E3A36] focus:outline-none focus:border-[#6E9E93]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2E3A36]/80 block mb-1">
                  Masa Muscular Magra (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={muscleMassKg}
                  onChange={(e) => setMuscleMassKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0] text-sm font-bold text-[#2E3A36] focus:outline-none focus:border-[#6E9E93]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#2E3A36]/80 block mb-1">
                  Grasa Visceral (1-20)
                </label>
                <input
                  type="number"
                  step="1"
                  value={visceralFatLevel}
                  onChange={(e) => setVisceralFatLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0] text-sm font-bold text-[#2E3A36] focus:outline-none focus:border-[#6E9E93]"
                />
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full mt-3 py-3 bg-[#6E9E93] hover:bg-[#5C897F] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e incluir en mi diagnóstico</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-2 border-t border-[#AEC9C0]/30 text-center">
          <button
            onClick={() => setExtracted(true)}
            className="text-xs text-[#6E9E93] font-semibold hover:underline"
          >
            {extracted ? 'Subir otro archivo' : 'Ingresar datos manualmente'}
          </button>
        </div>
      </div>
    </div>
  );
};
