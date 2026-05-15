import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import { Mail, ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Revisa tu correo para las instrucciones');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al enviar solicitud');
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
              <h1 className="text-[32px] font-bold text-[#00236f] tracking-tight">Recuperar Contraseña</h1>
              <p className="text-[16px] text-[#444651] mt-1">Ingresa tu correo y te enviaremos instrucciones</p>
            </div>
          </div>

          <div className="px-8 pb-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#6cf8bb] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-[#005236]" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-[#00236f] mb-2">Correo enviado</h2>
                <p className="text-[14px] text-[#444651] mb-6">
                  Si existe una cuenta con <strong>{email}</strong>, recibirás instrucciones para restablecer tu contraseña.
                </p>
                <Link to="/login" className="text-[#00236f] font-semibold hover:underline">
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] ml-1" htmlFor="email">CORREO ELECTRÓNICO</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757682]" size={20} />
                    <input
                      id="email" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      required autoComplete="email"
                      placeholder="ejemplo@fincredit.com"
                      className="w-full pl-12 pr-4 py-3 bg-[#f4f3fa] border border-[#c5c5d3] rounded-lg text-[16px] text-[#1a1b21] focus:ring-2 focus:ring-[#00236f] focus:border-[#00236f] outline-none transition-all placeholder:text-[#757682]"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#00236f] text-white py-3 px-6 rounded-lg text-[18px] font-semibold shadow-sm hover:bg-[#1e3a8a] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
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
