import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatEstado } from '../../utils/format';

export default function MisPrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/prestamos?clienteId=me');
        setPrestamos(res.data.prestamos);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar préstamos');
        toast.error('Error al cargar préstamos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return React.createElement(LoadingSpinner);
  if (error) return React.createElement('div', { role: 'alert', className: 'bg-red-50 text-red-600 p-4 rounded-lg' }, error);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Mis Préstamos'),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
          { key: 'cuotas', label: 'Cuotas' },
          { key: 'cuotaMensual', label: 'Cuota Mensual', render: r => formatCurrency(r.cuotaMensual) },
          { key: 'interes', label: 'Interés (%)' },
          { key: 'pagado', label: 'Total Pagado', render: r => formatCurrency(r.pagado) },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: prestamos
      })
    )
  );
}
