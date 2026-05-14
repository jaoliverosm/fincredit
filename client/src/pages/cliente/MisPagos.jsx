import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/format';

export default function MisPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pagos?clienteId=me');
        setPagos(res.data.pagos);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar pagos');
        toast.error('Error al cargar pagos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return React.createElement(LoadingSpinner);
  if (error) return React.createElement('div', { role: 'alert', className: 'bg-red-50 text-red-600 p-4 rounded-lg' }, error);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Historial de Pagos'),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'tipo', label: 'Tipo' },
          { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
          { key: 'fecha', label: 'Fecha', render: r => new Date(r.fecha).toLocaleDateString('es-CO') },
          { key: 'metodo', label: 'Método' },
          { key: 'observacion', label: 'Observación' }
        ],
        data: pagos
      })
    )
  );
}
