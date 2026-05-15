import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import { Mail, Lock, User, FileText, Phone, ArrowRight, Landmark, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', cedula: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
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
              <h1 className="text-[32px] font-bold text-[#00236f] tracking-tight">Crear Cuenta</h1>
              <p className="text-[16px] text-[#444651] mt-1">Regístrate como cliente de FinCredit</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {error && <div role="alert" className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="nombre">NOMBRE COMPLETO</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input id="nombre" type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Juan Pérez" className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="email">CORREO ELECTRÓNICO</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required autoComplete="email" placeholder="ejemplo@correo.com" className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="cedula">CÉDULA</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input id="cedula" type="text" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} required placeholder="1234567890" className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="password">CONTRASEÑA</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input id="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required autoComplete="new-password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="telefono">TELÉFONO (opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                  <input id="telefono" type="tel" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="3001234567" className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]" />
                </div>
              </div>

              <div className="pt-3">
                <button type="submit" disabled={loading} className="w-full bg-[#00236f] text-white py-3 px-6 rounded-lg text-[18px] font-semibold shadow-sm hover:bg-[#1e3a8a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                  <span>{loading ? 'Registrando...' : 'Crear Cuenta'}</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </div>
            </form>

            <p className="text-center mt-6 text-[14px] text-[#444651]">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#00236f] font-semibold hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1">
          <ShieldCheck className="text-[#757682]" size={16} />
          <span className="text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Sistema de Crédito Certificado</span>
        </div>
      </footer>
    </div>
  );
}
