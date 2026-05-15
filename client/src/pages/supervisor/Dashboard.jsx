import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../store/authStore';
import { formatCurrency } from '../../utils/format';
import { Users, CreditCard, AlertTriangle, DollarSign, UserPlus, Plus, FileText, Calendar } from 'lucide-react';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clientes: 0, prestamos: 0, ventas: 0, montoTotal: 0, mora: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resClientes, resPrestamos, resVentas] = await Promise.all([
        api.get('/clientes').catch(() => ({ data: { clientes: [] } })),
        api.get('/prestamos').catch(() => ({ data: { prestamos: [] } })),
        api.get('/ventas').catch(() => ({ data: { ventas: [] } }))
      ]);
      const clientes = resClientes.data.clientes;
      const prestamos = resPrestamos.data.prestamos;
      const ventas = resVentas.data.ventas;
      const totalPrestamos = prestamos.reduce((s, p) => s + p.monto, 0);
      const totalVentas = ventas.reduce((s, v) => s + v.precioTotal, 0);
      setStats({
        clientes: clientes.length,
        prestamos: prestamos.length,
        ventas: ventas.length,
        montoTotal: totalPrestamos + totalVentas,
        mora: prestamos.filter(p => p.estado === 'mora').length + ventas.filter(v => v.estado === 'mora').length
      });
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00236f]" />
    </div>
  );

  const moraRate = stats.prestamos + stats.ventas > 0 ? ((stats.mora / (stats.prestamos + stats.ventas)) * 100).toFixed(2) : '0';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Global Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] uppercase">Cartera Total</p>
              <h2 className="text-[32px] font-bold mt-1 text-[#00236f]">{formatCurrency(stats.montoTotal)}</h2>
            </div>
            <DollarSign className="text-[#006c49] bg-[#6cf8bb] p-1.5 rounded-lg" size={36} />
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-[12px] font-semibold text-[#006c49">+{stats.clientes} clientes activos</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] uppercase">Préstamos Activos</p>
              <h2 className="text-[32px] font-bold mt-1 text-[#00236f]">{stats.prestamos + stats.ventas}</h2>
            </div>
            <CreditCard className="text-[#00236f] bg-[#dce1ff] p-1.5 rounded-lg" size={36} />
          </div>
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-[14px] text-[#444651]">Capacidad de Atención</span>
              <span className="text-[14px] font-medium">{stats.prestamos > 0 ? '82%' : '0%'}</span>
            </div>
            <div className="w-full bg-[#e9e7ef] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00236f] h-full rounded-full" style={{ width: stats.prestamos > 0 ? '82%' : '0%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.05em] text-[#444651] uppercase">Tasa de Mora</p>
              <h2 className="text-[32px] font-bold mt-1 text-[#ba1a1a]">{moraRate}%</h2>
            </div>
            <AlertTriangle className="text-[#ba1a1a] bg-[#ffdad6] p-1.5 rounded-lg" size={36} />
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-[12px] font-semibold text-[#93000a]">{stats.mora} casos en mora</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#c5c5d3] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#c5c5d3] flex justify-between items-center">
            <h3 className="text-[24px] font-semibold text-[#00236f]">Resumen General</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f4f3fa] border-b border-[#c5c5d3]">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">MÉTRICA</th>
                  <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651]">VALOR</th>
                  <th className="px-6 py-4 text-[12px] font-semibold tracking-[0.05em] text-[#444651] text-right">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c5d3]">
                <tr className="hover:bg-[#f4f3fa] transition-colors cursor-pointer" onClick={() => navigate('/supervisor/clientes')}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Users className="text-[#00236f]" size={20} />
                      <div>
                        <p className="text-[18px] font-semibold">Total Clientes</p>
                        <p className="text-[14px] text-[#444651]">Registrados en el sistema</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium">{stats.clientes}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-[#6cf8bb] text-[#005236] rounded-full text-xs font-semibold">ACTIVO</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#f4f3fa] transition-colors cursor-pointer" onClick={() => navigate('/supervisor/prestamos')}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <DollarSign className="text-[#00236f]" size={20} />
                      <div>
                        <p className="text-[18px] font-semibold">Préstamos + Ventas</p>
                        <p className="text-[14px] text-[#444651]">Operaciones activas</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium">{stats.prestamos + stats.ventas}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-[#6cf8bb] text-[#005236] rounded-full text-xs font-semibold">ACTIVO</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#f4f3fa] transition-colors cursor-pointer" onClick={() => navigate('/supervisor/pagos')}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="text-[#ba1a1a]" size={20} />
                      <div>
                        <p className="text-[18px] font-semibold">Alertas de Mora</p>
                        <p className="text-[14px] text-[#444651]">Casos con retraso en pagos</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium">{stats.mora}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-[#ffdad6] text-[#93000a] rounded-full text-xs font-semibold">MORA</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions + System Health */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#c5c5d3] shadow-sm">
            <h3 className="text-[24px] font-semibold text-[#00236f] mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/supervisor/empleados')} className="flex flex-col items-center justify-center p-4 bg-[#f4f3fa] hover:bg-[#1e3a8a] hover:text-white transition-all rounded-xl border border-[#c5c5d3] group">
                <UserPlus className="text-[#00236f] group-hover:text-white mb-1" size={24} />
                <span className="text-[12px] font-semibold text-center">Nuevo Asesor</span>
              </button>
              <button onClick={() => navigate('/supervisor/prestamos')} className="flex flex-col items-center justify-center p-4 bg-[#f4f3fa] hover:bg-[#1e3a8a] hover:text-white transition-all rounded-xl border border-[#c5c5d3] group">
                <Plus className="text-[#00236f] group-hover:text-white mb-1" size={24} />
                <span className="text-[12px] font-semibold text-center">Nuevo Crédito</span>
              </button>
              <button onClick={() => navigate('/supervisor/solicitudes')} className="flex flex-col items-center justify-center p-4 bg-[#f4f3fa] hover:bg-[#1e3a8a] hover:text-white transition-all rounded-xl border border-[#c5c5d3] group">
                <FileText className="text-[#00236f] group-hover:text-white mb-1" size={24} />
                <span className="text-[12px] font-semibold text-center">Reporte Mora</span>
              </button>
              <button onClick={() => navigate('/supervisor/configuracion')} className="flex flex-col items-center justify-center p-4 bg-[#f4f3fa] hover:bg-[#1e3a8a] hover:text-white transition-all rounded-xl border border-[#c5c5d3] group">
                <Calendar className="text-[#00236f] group-hover:text-white mb-1" size={24} />
                <span className="text-[12px] font-semibold text-center">Configuración</span>
              </button>
            </div>
          </div>

          <div className="bg-[#2f3036] text-[#f1f0f7] p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[12px] font-semibold tracking-[0.05em] text-[#e3e1e9] uppercase mb-1">Estado del Sistema</p>
              <div className="flex items-center gap-1 mb-4">
                <div className="w-3 h-3 bg-[#6ffbbe] rounded-full shadow-[0_0_8px_#6ffbbe]"></div>
                <h4 className="text-[18px] font-semibold">Operativo</h4>
              </div>
              <p className="text-[14px] text-[#e3e1e9] opacity-80">Todos los servicios de API financieros activos.</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b6c4ff] opacity-10 rounded-full -mr-16 -mt-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
