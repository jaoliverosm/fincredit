import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, ShieldCheck, Landmark } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const usuario = await login(email, password);
      const routeMap = { supervisor: '/supervisor/dashboard', empleado: '/empleado/dashboard', cliente: '/cliente/inicio' };
      navigate(routeMap[usuario.rol] || '/supervisor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
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
              <h1 className="text-[32px] font-bold text-[#00236f] tracking-tight">FinCredit</h1>
              <p className="text-[16px] text-[#444651] mt-1">Gestión de crédito institucional</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {error && <div role="alert" className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="email">CORREO ELECTRÓNICO</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="ejemplo@fincredit.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651]" htmlFor="password">CONTRASEÑA</label>
                  <a className="text-[12px] font-semibold tracking-[0.05em] text-[#00236f] hover:text-[#1e3a8a] transition-colors" href="#">¿OLVIDASTE TU CONTRASEÑA?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00236f] text-white py-3 px-6 rounded-lg text-[18px] font-semibold shadow-sm hover:bg-[#1e3a8a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{loading ? 'Iniciando...' : 'Iniciar sesión'}</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#c5c5d3] flex flex-col items-center gap-4">
              <p className="text-[14px] text-[#444651] text-center px-6">
                Acceso restringido para personal autorizado de FinCredit. Su sesión está siendo monitoreada por seguridad.
              </p>
              <div className="flex items-center gap-4 opacity-40 grayscale">
                <div className="flex items-center gap-1 text-[#444651] text-sm">
                  <ShieldCheck size={16} /> Seguro
                </div>
                <div className="flex items-center gap-1 text-[#444651] text-sm">
                  <ShieldCheck size={16} /> Protegido
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1">
          <ShieldCheck className="text-[#757682]" size={16} />
          <span className="text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Sistema de Crédito Certificado</span>
        </div>
        <div className="flex gap-4">
          <a className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] hover:text-[#00236f] transition-colors" href="#">POLÍTICA DE PRIVACIDAD</a>
          <a className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] hover:text-[#00236f] transition-colors" href="#">SOPORTE TÉCNICO</a>
        </div>
      </footer>
    </div>
  );
}
