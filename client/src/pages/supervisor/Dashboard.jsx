import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../store/authStore';
import { formatCurrency, formatEstado } from '../../utils/format';
import { Users, CreditCard, AlertTriangle, DollarSign, UserPlus, Plus, FileText, Calendar } from 'lucide-react';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clientes: 0, prestamos: 0, ventas: 0, montoTotal: 0, mora: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/clientes').catch(() => ({ data: { clientes: [] } })),
        api.get('/prestamos').catch(() => ({ data: { prestamos: [] } })),
        api.get('/ventas').catch(() => ({ data: { ventas: [] } }))
      ]);
      const clientes = r1.data.clientes;
      const prestamos = r2.data.prestamos;
      const ventas = r3.data.ventas;
      setStats({
        clientes: clientes.length,
        prestamos: prestamos.length,
        ventas: ventas.length,
        montoTotal: prestamos.reduce((s, p) => s + p.monto, 0) + ventas.reduce((s, v) => s + v.precioTotal, 0),
        mora: prestamos.filter(p => p.estado === 'mora').length + ventas.filter(v => v.estado === 'mora').length
      });
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  const totalOps = stats.prestamos + stats.ventas;
  const moraRate = totalOps > 0 ? ((stats.mora / totalOps) * 100).toFixed(2) : '0';

  const metrics = [
    { title: 'Cartera Total', value: formatCurrency(stats.montoTotal), icon: DollarSign, color: 'accent', sub: `${stats.clientes} clientes activos` },
    { title: 'Préstamos Activos', value: totalOps, icon: CreditCard, color: 'primary', sub: 'Total operaciones' },
    { title: 'Tasa de Mora', value: `${moraRate}%`, icon: AlertTriangle, color: 'destructive', sub: `${stats.mora} casos en mora` }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) =>
          React.createElement('div', { key: i, className: 'bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between' },
            React.createElement('div', { className: 'flex justify-between items-start' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-xs font-semibold tracking-wider text-muted-foreground uppercase' }, m.title),
                React.createElement('h2', { className: 'text-3xl font-bold mt-1 text-foreground' }, m.value)
              ),
              React.createElement('div', { className: `p-2 rounded-lg bg-${m.color}/10 text-${m.color}` },
                React.createElement(m.icon, { size: 24 })
              )
            ),
            React.createElement('p', { className: 'mt-4 text-sm text-muted-foreground' }, m.sub)
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-semibold text-foreground">Resumen General</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground">MÉTRICA</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground">VALOR</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground text-right">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { icon: Users, label: 'Total Clientes', desc: 'Registrados en el sistema', value: stats.clientes, status: 'ACTIVO', statusColor: 'bg-accent/20 text-accent-foreground', path: '/supervisor/clientes' },
                  { icon: DollarSign, label: 'Préstamos + Ventas', desc: 'Operaciones activas', value: totalOps, status: 'ACTIVO', statusColor: 'bg-accent/20 text-accent-foreground', path: '/supervisor/prestamos' },
                  { icon: AlertTriangle, label: 'Alertas de Mora', desc: 'Casos con retraso', value: stats.mora, status: 'MORA', statusColor: 'bg-destructive/20 text-destructive', path: '/supervisor/pagos' }
                ].map((r, i) =>
                  React.createElement('tr', { key: i, className: 'hover:bg-muted transition-colors cursor-pointer', onClick: () => navigate(r.path) },
                    React.createElement('td', { className: 'px-6 py-4' },
                      React.createElement('div', { className: 'flex items-center gap-4' },
                        React.createElement(r.icon, { className: 'text-primary', size: 20 }),
                        React.createElement('div', null,
                          React.createElement('p', { className: 'text-base font-semibold text-foreground' }, r.label),
                          React.createElement('p', { className: 'text-sm text-muted-foreground' }, r.desc)
                        )
                      )
                    ),
                    React.createElement('td', { className: 'px-6 py-4' },
                      React.createElement('p', { className: 'text-sm font-medium text-foreground' }, r.value)
                    ),
                    React.createElement('td', { className: 'px-6 py-4 text-right' },
                      React.createElement('span', { className: `px-3 py-1 rounded-full text-xs font-semibold ${r.statusColor}` }, r.status)
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: UserPlus, label: 'Nuevo Asesor', path: '/supervisor/empleados' },
                { icon: Plus, label: 'Nuevo Crédito', path: '/supervisor/prestamos' },
                { icon: FileText, label: 'Solicitudes', path: '/supervisor/solicitudes' },
                { icon: Calendar, label: 'Configuración', path: '/supervisor/configuracion' }
              ].map((a, i) =>
                React.createElement('button', {
                  key: i, onClick: () => navigate(a.path),
                  className: 'flex flex-col items-center justify-center p-4 bg-muted hover:bg-primary hover:text-primary-foreground transition-all rounded-xl border border-border group'
                },
                  React.createElement(a.icon, { className: 'text-primary group-hover:text-primary-foreground mb-1', size: 24 }),
                  React.createElement('span', { className: 'text-xs font-semibold text-center text-foreground group-hover:text-primary-foreground' }, a.label)
                )
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">Estado del Sistema</p>
            <div className="flex items-center gap-1 mb-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-base font-semibold text-foreground">Operativo</span>
            </div>
            <p className="text-sm text-muted-foreground">Todos los servicios activos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
