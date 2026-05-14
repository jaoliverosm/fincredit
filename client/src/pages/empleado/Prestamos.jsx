import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatEstado } from '../../utils/format';

export default function PrestamosPage() {
  const navigate = useNavigate();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get('clienteId');

  useEffect(() => { loadData(); }, [clienteId]);

  const loadData = async () => {
    try {
      const url = clienteId ? '/prestamos?clienteId=' + clienteId : '/prestamos/empleado';
      const res = await api.get(url);
      setPrestamos(res.data.prestamos);
    } catch (err) { /* console.error(err) */ }
    finally { setLoading(false); }
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Préstamos'),
    clienteId && React.createElement('p', { className: 'text-sm text-gray-500' }, 'Filtrado por cliente'),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
          { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
          { key: 'cuotas', label: 'Cuotas' },
          { key: 'cuotaMensual', label: 'Cuota', render: r => formatCurrency(r.cuotaMensual) },
          { key: 'pagado', label: 'Pagado', render: r => formatCurrency(r.pagado) },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: prestamos,
        onRowClick: (r) => { navigate('/empleado/prestamos/' + r.id); }
      })
    )
  );
}