import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { api } from '../../store/authStore';
import { formatCurrency, formatEstado } from '../../utils/format';
import { Users, CreditCard, AlertTriangle, DollarSign } from 'lucide-react';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clientes: 0, prestamos: 0, ventas: 0, montoTotal: 0, mora: 0 });
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
      setPrestamos(prestamos.slice(0, 5));
    } catch (err) {
      /* dashboard error silently ignored */
    } finally {
      setLoading(false);
    }
  };

  if (loading) return React.createElement('div', { className: 'flex justify-center items-center h-64' },
    React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' })
  );

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Dashboard Supervisor'),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' },
      StatCard({ title: 'Total Clientes', value: stats.clientes, icon: Users, color: 'blue' }),
      StatCard({ title: 'Préstamos Activos', value: stats.prestamos, icon: CreditCard, color: 'primary' }),
      StatCard({ title: 'Ventas Activas', value: stats.ventas, icon: DollarSign, color: 'success' }),
      StatCard({ title: 'Alertas de Mora', value: stats.mora, icon: AlertTriangle, color: 'danger', trend: stats.mora > 0 ? -stats.mora : 0 })
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement(Card, null,
        React.createElement('h3', { className: 'font-semibold mb-4' }, 'Últimos Préstamos'),
        Table({
          columns: [
            { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
            { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
            { key: 'cuotas', label: 'Cuotas', render: r => r.cuotas },
            { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
          ],
          data: prestamos,
          onRowClick: (row) => { navigate('/supervisor/prestamos/' + row.id); }
        })
      )
    )
  );
}
