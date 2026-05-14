import React, { useState, useEffect } from 'react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { api } from '../../store/authStore';
import { formatCurrency, formatEstado } from '../../utils/format';
import { CreditCard, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ClienteDashboard() {
  const user = useAuthStore(s => s.user);
  const userId = user?.id;
  const [stats, setStats] = useState({ prestamos: 0, compras: 0, pagos: 0, deuda: 0 });
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cliParam = userId ? '?clienteId=' + userId : '';
      const [resPrestamos, resVentas, resPagos] = await Promise.all([
        api.get('/prestamos' + cliParam).catch(() => ({ data: { prestamos: [] } })),
        api.get('/ventas' + cliParam).catch(() => ({ data: { ventas: [] } })),
        api.get('/pagos' + cliParam).catch(() => ({ data: { pagos: [] } }))
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
    } catch (err) {
      /* console.error(err) */
    } finally {
      setLoading(false);
    }
  };

  if (loading) return React.createElement('div', { className: 'flex justify-center items-center h-64' },
    React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' })
  );

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Mi Dashboard'),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' },
      StatCard({ title: 'Préstamos Activos', value: stats.prestamos, icon: CreditCard, color: 'primary' }),
      StatCard({ title: 'Compras a Crédito', value: stats.compras, icon: DollarSign, color: 'success' }),
      StatCard({ title: 'Pagos Realizados', value: stats.pagos, icon: TrendingUp, color: 'blue' }),
      StatCard({ title: 'Deuda Pendiente', value: formatCurrency(stats.deuda), icon: AlertTriangle, color: stats.deuda > 0 ? 'warning' : 'success' })
    ),
    React.createElement(Card, null,
      React.createElement('h3', { className: 'font-semibold mb-4' }, 'Últimos Registros'),
      Table({
        columns: [
          { key: 'tipo', label: 'Tipo', render: (r) => r.cuotaMensual ? 'Préstamo' : 'Venta' },
          { key: 'monto', label: 'Monto', render: (r) => formatCurrency(r.monto || r.precioTotal) },
          { key: 'cuotas', label: 'Cuotas', render: r => r.cuotas || '-' },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: prestamos
      })
    )
  );
}
