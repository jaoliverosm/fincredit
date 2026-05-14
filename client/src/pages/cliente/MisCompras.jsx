import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatEstado } from '../../utils/format';

export default function MisComprasPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/ventas?clienteId=me');
        setVentas(res.data.ventas);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar compras');
        toast.error('Error al cargar compras');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return React.createElement(LoadingSpinner);
  if (error) return React.createElement('div', { role: 'alert', className: 'bg-red-50 text-red-600 p-4 rounded-lg' }, error);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Mis Compras a Crédito'),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'articulo', label: 'Artículo', render: r => r.articulo?.nombre },
          { key: 'cantidad', label: 'Cantidad' },
          { key: 'precioUnitario', label: 'Precio Unit.', render: r => formatCurrency(r.precioUnitario) },
          { key: 'precioTotal', label: 'Total', render: r => formatCurrency(r.precioTotal) },
          { key: 'cuotas', label: 'Cuotas' },
          { key: 'pagado', label: 'Pagado', render: r => formatCurrency(r.pagado) },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: ventas
      })
    )
  );
}
