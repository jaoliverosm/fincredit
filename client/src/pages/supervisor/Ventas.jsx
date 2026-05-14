import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatEstado } from '../../utils/format';
import { calcularCuota } from '../../utils/calculos';

export default function VentasPage() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({ clienteId: '', articuloId: '', cantidad: 1, interes: '0', cuotas: '1', observacion: '' });

  const articuloSeleccionado = articulos.find(a => a.id === parseInt(form.articuloId));
  const precioTotal = articuloSeleccionado ? articuloSeleccionado.precio * parseInt(form.cantidad || 0) : 0;
  const cuotaCalc = form.interes && form.cuotas ? calcularCuota(precioTotal, parseFloat(form.interes), parseInt(form.cuotas)) : 0;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resV, resC, resA] = await Promise.all([
        api.get('/ventas').catch(() => ({ data: { ventas: [] } })),
        api.get('/clientes').catch(() => ({ data: { clientes: [] } })),
        api.get('/articulos?activo=true').catch(() => ({ data: { articulos: [] } }))
      ]);
      setVentas(resV.data.ventas);
      setClientes(resC.data.clientes);
      setArticulos(resA.data.articulos);
    } catch (err) { toast.error('Error al cargar datos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ventas', { ...form, cuotas: form.cuotas, interes: form.interes || '0' });
      toast.success('Venta registrada');
      setModalOpen(false);
      setForm({ clienteId: '', articuloId: '', cantidad: 1, interes: '0', cuotas: '1', observacion: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Ventas a Crédito'),
      React.createElement(Button, { onClick: () => { setForm({ clienteId: '', articuloId: '', cantidad: 1, interes: '0', cuotas: '1', observacion: '' }); setModalOpen(true); } },
        '+ Nueva Venta'
      )
    ),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
          { key: 'articulo', label: 'Artículo', render: r => r.articulo?.nombre },
          { key: 'cantidad', label: 'Cant.' },
          { key: 'precioTotal', label: 'Total', render: r => formatCurrency(r.precioTotal) },
          { key: 'cuotas', label: 'Cuotas' },
          { key: 'pagado', label: 'Pagado', render: r => formatCurrency(r.pagado) },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: ventas,
        onRowClick: (r) => { navigate('/supervisor/ventas/' + r.id); }
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: 'Nueva Venta a Crédito', size: 'lg' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Select, { label: 'Cliente', options: clientes.map(c => ({ value: c.id, label: c.usuario.nombre + ' (' + c.cedula + ')' })), value: form.clienteId, onChange: e => setForm({ ...form, clienteId: e.target.value }), required: true }),
        React.createElement(Select, { label: 'Artículo', options: articulos.map(a => ({ value: a.id, label: a.nombre + ' - ' + formatCurrency(a.precio) + ' (Stock: ' + a.stock + ')' })), value: form.articuloId, onChange: e => setForm({ ...form, articuloId: e.target.value }), required: true }),
        form.articuloId && React.createElement('p', { className: 'text-sm text-gray-600' }, 'Precio unitario: ' + formatCurrency(articuloSeleccionado?.precio || 0)),
        form.articuloId && React.createElement(Input, { label: 'Cantidad', type: 'number', min: '1', max: articuloSeleccionado?.stock ?? 1, value: form.cantidad, onChange: e => setForm({ ...form, cantidad: e.target.value }) }),
        React.createElement(Input, { label: 'Interés Anual (%)', type: 'number', step: '0.1', value: form.interes, onChange: e => setForm({ ...form, interes: e.target.value }) }),
        React.createElement(Input, { label: 'Cuotas', type: 'number', min: '1', value: form.cuotas, onChange: e => setForm({ ...form, cuotas: e.target.value }) }),
        cuotaCalc > 0 && React.createElement('p', { className: 'text-sm text-blue-600 font-medium' }, 'Cuota mensual estimada: ' + formatCurrency(cuotaCalc)),
        cuotaCalc > 0 && React.createElement('p', { className: 'text-sm text-gray-500' }, 'Total a pagar: ' + formatCurrency(cuotaCalc * parseInt(form.cuotas || 1))),
        React.createElement(Input, { label: 'Observación', value: form.observacion, onChange: e => setForm({ ...form, observacion: e.target.value }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: !form.clienteId || !form.articuloId }, 'Registrar Venta')
        )
      )
    )
  );
}
