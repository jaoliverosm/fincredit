import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../store/authStore';
import { formatCurrency, formatEstado } from '../../utils/format';
import { Users, CreditCard, AlertTriangle, DollarSign, ShoppingCart, TrendingUp, ArrowRight, Wallet, Timer } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

export default function EmpleadoDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState({ clientes: 0, prestamos: 0, ventas: 0, comisiones: 0 });
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const empParam = user?.id ? '?empleadoId=' + user.id : '';
      const [resClientes, resPrestamos, resVentas] = await Promise.all([
        api.get('/clientes' + empParam).catch(() => ({ data: { clientes: [] } })),
        api.get('/prestamos' + empParam).catch(() => ({ data: { prestamos: [] } })),
        api.get('/ventas' + empParam).catch(() => ({ data: { ventas: [] } }))
      ]);
      const prestamos = resPrestamos.data.prestamos;
      const ventas = resVentas.data.ventas;
      const totalPagos = prestamos.reduce((s, p) => s + (p.pagado || 0), 0) + ventas.reduce((s, v) => s + (v.pagado || 0), 0);
      setStats({
        clientes: resClientes.data.clientes.length,
        prestamos: prestamos.length,
        ventas: ventas.length,
        comisiones: Math.round(totalPagos * 0.01)
      });
      setPrestamos(prestamos.slice(0, 5));
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00236f]" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome + Meta */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 flex-shrink-0">
              {user?.empleado?.fotoUrl
                ? React.createElement('img', { src: API_URL + user.empleado.fotoUrl, alt: 'Foto', className: 'w-full h-full object-cover' })
                : React.createElement('div', { className: 'w-full h-full bg-[#dce1ff] flex items-center justify-center text-[#00164e] font-bold text-xl' }, (user?.nombre || '?').charAt(0).toUpperCase())
              }
            </div>
            <div>
              <h2 className="text-[24px] font-semibold text-[#00236f] mb-1">Bienvenido de nuevo, {user?.nombre || 'Empleado'}</h2>
              <p className="text-[16px] text-[#444651]">Aquí tienes el resumen de tu desempeño.</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[12px] font-semibold tracking-[0.05em] text-[#00236f] uppercase">META MENSUAL</span>
              <span className="text-[14px] font-medium text-[#00236f]">{formatCurrency(stats.comisiones)} / {formatCurrency(5000000)}</span>
            </div>
            <div className="w-full bg-[#eeedf4] h-4 rounded-full overflow-hidden">
              <div className="bg-[#006c49] h-full rounded-full" style={{ width: Math.min((stats.comisiones / 5000000) * 100, 100) + '%' }}></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/empleado/nueva-venta')} className="flex flex-col items-center justify-center bg-[#1e3a8a] text-white rounded-xl p-4 shadow-sm hover:opacity-90 active:scale-95 transition-all">
            <ShoppingCart size={28} className="mb-2" />
            <span className="text-[12px] font-semibold">Nueva Venta</span>
          </button>
          <button onClick={() => navigate('/empleado/prestamos')} className="flex flex-col items-center justify-center bg-[#006c49] text-white rounded-xl p-4 shadow-sm hover:opacity-90 active:scale-95 transition-all">
            <Wallet size={28} className="mb-2" />
            <span className="text-[12px] font-semibold">Cobro</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#1e3a8a] p-2 rounded-lg text-white">
              <Users size={20} />
            </div>
            <span className="text-[18px] font-semibold">Mis Clientes</span>
          </div>
          <div className="text-[32px] font-bold text-[#00236f]">{stats.clientes}</div>
          <div className="flex items-center gap-1 text-[#006c49] mt-1">
            <TrendingUp size={14} />
            <span className="text-[12px] font-semibold">+{stats.prestamos > 0 ? Math.floor(stats.prestamos / 2) : 0} este mes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#6cf8bb] p-2 rounded-lg text-[#00714d]">
              <CreditCard size={20} />
            </div>
            <span className="text-[18px] font-semibold">Préstamos Activos</span>
          </div>
          <div className="text-[32px] font-bold text-[#00236f]">{stats.prestamos}</div>
          <div className="flex items-center gap-1 text-[#444651] mt-1">
            <Timer size={14} />
            <span className="text-[12px] font-semibold">{stats.ventas} ventas activas</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#ffdbcb] p-2 rounded-lg text-[#4b1c00]">
              <AlertTriangle size={20} />
            </div>
            <span className="text-[18px] font-semibold">Comisiones Est.</span>
          </div>
          <div className="text-[32px] font-bold text-[#ba1a1a]">{formatCurrency(stats.comisiones)}</div>
          <div className="flex items-center gap-1 text-[#006c49] mt-1">
            <TrendingUp size={14} />
            <span className="text-[12px] font-semibold">Progreso de meta</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[#c5c5d3] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#c5c5d3] flex justify-between items-center">
          <h3 className="text-[18px] font-semibold">Préstamos Recientes</h3>
          <button onClick={() => navigate('/empleado/prestamos')} className="text-[12px] font-semibold tracking-[0.05em] text-[#00236f] hover:underline">Ver todo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f4f3fa]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Cliente</th>
                <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Monto</th>
                <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Cuotas</th>
                <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Pagado</th>
                <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c5d3]">
              {prestamos.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#444651]">No hay préstamos recientes</td>
                </tr>
              )}
              {prestamos.map((r) => (
                <tr key={r.id} className="hover:bg-[#f4f3fa] transition-colors cursor-pointer" onClick={() => navigate('/empleado/prestamos/' + r.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#dce1ff] text-[#00164e] flex items-center justify-center font-bold text-sm">
                        {(r.cliente?.usuario?.nombre || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[16px]">{r.cliente?.usuario?.nombre || 'Sin nombre'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium">{formatCurrency(r.monto)}</td>
                  <td className="px-6 py-4 text-[14px]">{r.cuotas}</td>
                  <td className="px-6 py-4 text-[14px] font-medium">{formatCurrency(r.pagado)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.estado === 'activo' ? 'bg-[#6cf8bb] text-[#005236]' :
                      r.estado === 'mora' ? 'bg-[#ffdad6] text-[#93000a]' :
                      'bg-[#dce1ff] text-[#264191]'
                    }`}>
                      {formatEstado(r.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
