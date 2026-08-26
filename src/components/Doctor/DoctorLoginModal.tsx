import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../../types';

interface DoctorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (doctorProfile: UserProfile) => void;
}

export const DoctorLoginModal: React.FC<DoctorLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState<string>('dra.lorena@vela.com');
  const [password, setPassword] = useState<string>('doctora123');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales de acceso no autorizadas.');
      }

      if (data.profile?.role !== 'doctora') {
        throw new Error('Esta cuenta no posee rol de supervisión médica (doctora).');
      }

      onSuccess(data.profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar acceso médico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-[#AEC9C0]/60 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-xl text-[#2E3A36] relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF6F0] text-[#2E3A36]/70 hover:text-[#2E3A36] border border-[#AEC9C0]/40 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-[#6E9E93]/15 text-[#6E9E93] border border-[#6E9E93]/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#2E3A36] tracking-tight">
            Acceso Médico Exclusivo
          </h3>
          <p className="text-xs text-[#2E3A36]/70 max-w-xs mx-auto">
            Panel de supervisión clínica reservado para la Dra. Lorena Castro.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#F2A488]/15 border border-[#F2A488]/50 rounded-xl text-xs text-[#2E3A36] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#2E3A36] flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2E3A36]">Correo Electrónico Médico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6E9E93] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dra.lorena@vela.com"
                className="w-full bg-[#FAF6F0] border border-[#AEC9C0]/70 rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2E3A36]">Contraseña Clínica</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6E9E93] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF6F0] border border-[#AEC9C0]/70 rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#AEC9C0]/50 text-[11px] text-[#2E3A36]/75">
            <strong className="text-[#6E9E93]">Credenciales de acceso preconfiguradas:</strong>
            <br />
            Email: <span className="font-mono text-[#2E3A36] font-semibold">dra.lorena@vela.com</span> | Password: <span className="font-mono text-[#2E3A36] font-semibold">doctora123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verificando credenciales...' : 'Ingresar al Panel Médico'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
