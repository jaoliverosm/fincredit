import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { api } from '../../store/authStore';
import { formatCurrency, formatEstado } from '../../utils/format';
import { Users, CreditCard, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function EmpleadoDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const userId = user?.id;
  const [stats, setStats] = useState({ clientes: 0, prestamos: 0, ventas: 0, comisiones: 0 });
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const empParam = userId ? '?empleadoId=' + userId : '';
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
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Dashboard Empleado'),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' },
      StatCard({ title: 'Clientes Asignados', value: stats.clientes, icon: Users, color: 'blue' }),
      StatCard({ title: 'Préstamos', value: stats.prestamos, icon: CreditCard, color: 'primary' }),
      StatCard({ title: 'Ventas', value: stats.ventas, icon: DollarSign, color: 'success' }),
      StatCard({ title: 'Comisiones Est.', value: formatCurrency(stats.comisiones), icon: TrendingUp, color: 'warning' })
    ),
    React.createElement(Card, null,
      React.createElement('h3', { className: 'font-semibold mb-4' }, 'Préstamos Recientes'),
      Table({
        columns: [
          { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
          { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
          { key: 'cuotas', label: 'Cuotas' },
          { key: 'pagado', label: 'Pagado', render: r => formatCurrency(r.pagado) },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: prestamos,
        onRowClick: (row) => { navigate('/empleado/prestamos/' + row.id); }
      })
    )
  );
}
