import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { User, Lock, Mail, X, CheckCircle2, ShieldCheck, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentProfile,
}) => {
  const [mode, setMode] = useState<AuthMode>(!currentProfile?.email ? 'register' : 'login');
  const [name, setName] = useState<string>(currentProfile?.name || '');
  const [email, setEmail] = useState<string>(currentProfile?.email || '');
  const [password, setPassword] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEmailConflict, setIsEmailConflict] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEmailConflict(false);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email: email.trim().toLowerCase(),
            password,
            profileData: currentProfile || undefined,
          }),
        });

        const data = await res.json();
        if (res.status === 409 || data.code === 'EMAIL_EXISTS') {
          setIsEmailConflict(true);
          throw new Error('Este correo ya está registrado en Vela.');
        }

        if (!res.ok) {
          throw new Error(data.error || 'Error al registrar la cuenta.');
        }

        if (data.profile) {
          onSuccess(data.profile);
        }
        onClose();
      } else if (mode === 'login') {
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
          throw new Error(data.error || 'Correo o contraseña incorrectos.');
        }

        if (data.profile) {
          onSuccess(data.profile);
        }
        onClose();
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo generar la recuperación.');
        }

        if (data.resetToken) {
          setResetToken(data.resetToken);
          setMode('reset');
          setSuccessMsg(data.message || 'Código de restablecimiento generado. Ingresa tu nueva contraseña.');
        } else {
          setSuccessMsg(data.message || 'Instrucciones enviadas a tu correo.');
        }
      } else if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            resetToken,
            newPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al restablecer contraseña.');
        }

        setSuccessMsg('¡Contraseña actualizada exitosamente! Ahora puedes iniciar sesión.');
        setMode('login');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2E3A36]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-[#AEC9C0]/60 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-xl text-[#2E3A36] relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF6F0] text-[#2E3A36]/70 hover:text-[#2E3A36] border border-[#AEC9C0]/40 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#6E9E93]/15 text-[#6E9E93] border border-[#6E9E93]/30 flex items-center justify-center mx-auto">
            {mode === 'forgot' || mode === 'reset' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-xl font-bold text-[#2E3A36] font-serif">
            {mode === 'register' && 'Guarda tu Diagnóstico Clínico'}
            {mode === 'login' && 'Ingresa a tu Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
            {mode === 'reset' && 'Nueva Contraseña'}
          </h3>
          <p className="text-xs text-[#2E3A36]/70">
            {mode === 'register' && 'Crea tu cuenta segura para sincronizar tus avances y plan personalizado.'}
            {mode === 'login' && 'Accede a tus evaluaciones metabólicas y seguimiento de la Dra. Lorena.'}
            {mode === 'forgot' && 'Ingresa el correo con el que te registraste para restablecer tu acceso.'}
            {mode === 'reset' && 'Define tu nueva clave de acceso seguro.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-[#F2A488]/15 border border-[#F2A488]/50 rounded-2xl text-xs text-[#2E3A36] space-y-2">
            <p className="font-semibold">{errorMsg}</p>
            {isEmailConflict && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="px-3 py-1 bg-[#6E9E93] text-white rounded-lg font-bold text-[11px] hover:bg-[#5C897F] cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                  }}
                  className="px-3 py-1 bg-white border border-[#AEC9C0] text-[#2E3A36] rounded-lg text-[11px] hover:bg-[#FAF6F0] cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#6E9E93]/15 border border-[#6E9E93]/50 rounded-2xl text-xs text-[#2E3A36] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#6E9E93] flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2E3A36]">Nombre completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6E9E93] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#AEC9C0]/70 rounded-xl text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
                />
              </div>
            </div>
          )}

          {mode !== 'reset' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2E3A36]">Correo electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6E9E93] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#AEC9C0]/70 rounded-xl text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
                />
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'login') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2E3A36]">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-[#6E9E93] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6E9E93] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#AEC9C0]/70 rounded-xl text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2E3A36]">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6E9E93] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#AEC9C0]/70 rounded-xl text-xs text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden focus:border-[#6E9E93]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6E9E93] hover:bg-[#5C897F] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>
                  {mode === 'register' && 'Registrar y Guardar'}
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'forgot' && 'Enviar Instrucciones'}
                  {mode === 'reset' && 'Guardar Nueva Contraseña'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-[#AEC9C0]/40 flex flex-col items-center gap-1.5">
          {mode === 'forgot' || mode === 'reset' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className="text-xs text-[#6E9E93] hover:text-[#5C897F] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMsg(null);
              }}
              className="text-xs text-[#6E9E93] hover:text-[#5C897F] font-semibold cursor-pointer"
            >
              {mode === 'register'
                ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                : '¿Primera vez? Crea tu cuenta aquí'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
