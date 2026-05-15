import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../store/authStore';
import { formatCurrency, formatEstado } from '../../utils/format';
import { CreditCard, DollarSign, AlertTriangle, TrendingUp, Wallet, Calendar, ShoppingBag, ArrowRight, Home, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState({ prestamos: 0, compras: 0, pagos: 0, deuda: 0 });
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resPrestamos, resVentas, resPagos] = await Promise.all([
        api.get('/prestamos?clienteId=me').catch(() => ({ data: { prestamos: [] } })),
        api.get('/ventas?clienteId=me').catch(() => ({ data: { ventas: [] } })),
        api.get('/pagos?clienteId=me').catch(() => ({ data: { pagos: [] } }))
      ]);
      const prestamos = resPrestamos.data.prestamos;
      const ventas = resVentas.data.ventas;
      const totalPagos = resPagos.data.pagos.reduce((s, p) => s + p.monto, 0);
      setStats({
        prestamos: prestamos.length,
        compras: ventas.length,
        pagos: resPagos.data.pagos.length,
        deuda: Math.round((prestamos.reduce((s, p) => s + p.monto, 0) + ventas.reduce((s, v) => s + v.precioTotal, 0)) - totalPagos)
      });
      setPrestamos([...prestamos, ...ventas].slice(0, 5));
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00236f]" />
    </div>
  );

  const nextPayment = prestamos[0];
  const creditScore = Math.max(300, Math.min(850, 742 - (stats.deuda > 0 ? Math.floor(stats.deuda / 100000) : 0)));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 md:pb-8">
      {/* Welcome + CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#00236f]">Hola, {user?.nombre || 'Cliente'}</h1>
          <p className="text-[16px] text-[#444651]">Aquí tienes el resumen de tu crédito hoy.</p>
        </div>
        <button onClick={() => navigate('/cliente/solicitar')} className="bg-[#1e3a8a] text-white text-[18px] font-semibold px-8 py-4 rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 w-full md:w-auto">
          <span>Solicitar Préstamo</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Hero Debt Card + Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative overflow-hidden bg-[#00236f] text-white p-8 rounded-xl shadow-lg">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Wallet size={240} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-semibold tracking-[0.05em] text-[#90a8ff] uppercase">Deuda Total Acumulada</p>
                <h2 className="text-[32px] font-bold mt-2 tracking-tight">{formatCurrency(stats.deuda)}</h2>
              </div>
              <span className="bg-[#6cf8bb] text-[#00714d] px-4 py-1 rounded-full text-[12px] font-semibold">
                {stats.deuda > 0 ? 'AL DÍA' : 'SIN DEUDA'}
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.05em] opacity-70">Próximo Pago</p>
                  <p className="text-[18px] font-semibold">{nextPayment ? new Date(nextPayment.fechaVencimiento).toLocaleDateString('es-CO') : 'Sin pagos'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.05em] opacity-70">Total Pagado</p>
                  <p className="text-[18px] font-semibold text-[#6ffbbe]">{formatCurrency(stats.pagos > 0 ? stats.deuda / stats.pagos : 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#c5c5d3] p-8 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] uppercase">Puntaje Crediticio</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-[32px] font-bold text-[#00236f]">{creditScore}</span>
              <span className="text-[14px] text-[#006c49] font-bold">+{Math.max(0, creditScore - 700)} pts</span>
            </div>
            <p className="text-[14px] text-[#444651] mt-1">Excelente comportamiento este mes.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#c5c5d3]">
            <button onClick={() => navigate('/cliente/mis-pagos')} className="w-full text-[#00236f] text-[12px] font-semibold tracking-[0.05em] flex justify-between items-center hover:underline">
              VER HISTORIAL DE PAGOS
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loans & Purchases List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[24px] font-semibold text-[#00236f]">Préstamos y Compras Activas</h3>
          <button onClick={() => navigate('/cliente/mis-prestamos')} className="text-[#264191] text-[12px] font-semibold tracking-[0.05em] hover:underline">Ver Historial</button>
        </div>

        {prestamos.length === 0 && (
          <div className="bg-white border border-[#c5c5d3] p-12 rounded-xl text-center text-[#444651]">
            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tienes préstamos o compras activas</p>
            <button onClick={() => navigate('/cliente/solicitar')} className="mt-4 text-[#00236f] font-semibold hover:underline">Solicitar un préstamo</button>
          </div>
        )}

        {prestamos.map((r) => (
          <div key={r.id || Math.random()} className="bg-white border border-[#c5c5d3] p-4 md:p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-4">
            <div className="bg-[#eeedf4] p-4 rounded-xl flex items-center justify-center">
              {r.cuotaMensual ? <CreditCard className="text-[#00236f]" size={32} /> : <ShoppingBag className="text-[#00236f]" size={32} />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="text-[18px] font-semibold">{r.cuotaMensual ? 'Préstamo' : 'Compra a Crédito'} {r.articulo?.nombre ? '- ' + r.articulo.nombre : ''}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  r.estado === 'activo' ? 'bg-[#dcfce7] text-[#166534]' :
                  r.estado === 'mora' ? 'bg-[#fee2e2] text-[#991b1b]' :
                  'bg-[#065f46] text-white'
                }`}>
                  {formatEstado(r.estado)}
                </span>
              </div>
              <p className="text-[14px] text-[#444651]">#{r.id} • {formatCurrency(r.monto || r.precioTotal)} pendientes</p>
              <div className="w-full h-2 bg-[#eeedf4] rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${r.estado === 'mora' ? 'bg-[#ba1a1a]' : 'bg-[#006c49]'}`}
                  style={{ width: Math.min(((r.pagado || 0) / (r.monto || r.precioTotal || 1)) * 100, 100) + '%' }}></div>
              </div>
              <div className="flex justify-between text-[12px] font-semibold tracking-[0.05em] text-[#444651]">
                <span>Progreso: {Math.round(((r.pagado || 0) / (r.monto || r.precioTotal || 1)) * 100)}%</span>
                <span>{r.cuotas ? `${r.cuotas - Math.round((r.pagado || 0) / (r.cuotaMensual || 1))} / ${r.cuotas} cuotas` : ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-[#e9e7ef] rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 border border-[#c5c5d3]">
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-[24px] font-semibold text-[#00236f]">¿Buscas mejorar tu crédito?</h4>
          <p className="text-[16px] text-[#444651] mt-1">Aprende cómo optimizar tus finanzas con nuestras guías exclusivas.</p>
        </div>
        <button onClick={() => navigate('/cliente/mis-compras')} className="text-[#00236f] text-[18px] font-semibold flex items-center gap-2 hover:gap-3 transition-all whitespace-nowrap">
          Ver Compras <ArrowRight size={20} />
        </button>
      </div>

      {/* Mobile Bottom Nav Spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
