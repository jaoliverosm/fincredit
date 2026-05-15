import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import { Lock, ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Contraseña actualizada exitosamente');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]" style={{ backgroundImage: 'radial-gradient(#e3e1e9 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-lg border border-[#c5c5d3] overflow-hidden">
          <div className="pt-8 pb-6 px-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#1e3a8a] rounded-xl flex items-center justify-center shadow-md">
              <Landmark className="text-white" size={32} />
            </div>
            <div className="text-center">
              <h1 className="text-[32px] font-bold text-[#00236f] tracking-tight">Nueva Contraseña</h1>
              <p className="text-[16px] text-[#444651] mt-1">Ingresa tu nueva contraseña</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {done ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#6cf8bb] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-[#005236]" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-[#00236f] mb-2">Contraseña actualizada</h2>
                <p className="text-[14px] text-[#444651] mb-6">Tu contraseña ha sido restablecida exitosamente.</p>
                <button onClick={() => navigate('/login')}
                  className="bg-[#00236f] text-white py-3 px-8 rounded-lg text-[18px] font-semibold hover:bg-[#1e3a8a] transition-all">
                  Iniciar sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="password">NUEVA CONTRASEÑA</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                    <input id="password" type="password" value={password}
                      onChange={e => setPassword(e.target.value)} required minLength={6}
                      autoComplete="new-password" placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="confirm">CONFIRMAR CONTRASEÑA</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                    <input id="confirm" type="password" value={confirm}
                      onChange={e => setConfirm(e.target.value)} required minLength={6}
                      autoComplete="new-password" placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#00236f] text-white py-3 px-6 rounded-lg text-[18px] font-semibold shadow-sm hover:bg-[#1e3a8a] active:scale-[0.98] transition-all">
                  {loading ? 'Actualizando...' : 'Restablecer contraseña'}
                </button>

                <Link to="/login" className="flex items-center justify-center gap-1 text-[14px] text-[#444651] hover:text-[#00236f] transition-colors">
                  <ArrowLeft size={16} /> Volver al inicio de sesión
                </Link>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 flex items-center justify-center gap-1">
        <ShieldCheck className="text-[#757682]" size={16} />
        <span className="text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Sistema de Crédito Certificado</span>
      </footer>
    </div>
  );
}
