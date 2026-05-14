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

export default function PrestamosPage() {
  const navigate = useNavigate();
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({ clienteId: '', monto: '', interes: '2.5', cuotas: '12', observacion: '' });
  const cuotaCalc = form.monto && form.cuotas ? calcularCuota(parseFloat(form.monto), parseFloat(form.interes), parseInt(form.cuotas)) : 0;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resP, resC] = await Promise.all([
        api.get('/prestamos').catch(() => ({ data: { prestamos: [] } })),
        api.get('/clientes').catch(() => ({ data: { clientes: [] } }))
      ]);
      setPrestamos(resP.data.prestamos);
      setClientes(resC.data.clientes);
    } catch (err) { toast.error('Error al cargar datos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prestamos', form);
      toast.success('Préstamo creado');
      setModalOpen(false);
      setForm({ clienteId: '', monto: '', interes: '2.5', cuotas: '12', observacion: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Préstamos'),
      React.createElement(Button, { onClick: () => setModalOpen(true) }, '+ Nuevo Préstamo')
    ),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
          { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
          { key: 'cuotas', label: 'Cuotas' },
          { key: 'cuotaMensual', label: 'Cuota Mensual', render: r => formatCurrency(r.cuotaMensual) },
          { key: 'interes', label: 'Interés' },
          { key: 'pagado', label: 'Pagado', render: r => formatCurrency(r.pagado) },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, formatEstado(r.estado)) }
        ],
        data: prestamos,
        onRowClick: (r) => { navigate('/supervisor/prestamos/' + r.id); }
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: 'Nuevo Préstamo' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Select, { label: 'Cliente', options: clientes.map(c => ({ value: c.id, label: c.usuario.nombre + ' (' + c.cedula + ')' })), value: form.clienteId, onChange: e => setForm({ ...form, clienteId: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Monto (COP)', type: 'number', value: form.monto, onChange: e => setForm({ ...form, monto: e.target.value }), required: true, placeholder: '1000000' }),
        React.createElement(Input, { label: 'Tasa de Interés Anual (%)', type: 'number', step: '0.1', value: form.interes, onChange: e => setForm({ ...form, interes: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Número de Cuotas', type: 'number', value: form.cuotas, onChange: e => setForm({ ...form, cuotas: e.target.value }), required: true }),
        cuotaCalc > 0 && React.createElement('p', { className: 'text-sm text-gray-600' }, 'Cuota mensual estimada: ' + formatCurrency(cuotaCalc)),
        React.createElement(Input, { label: 'Observación', value: form.observacion, onChange: e => setForm({ ...form, observacion: e.target.value }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: !form.clienteId || !form.monto }, 'Crear Préstamo')
        )
      )
    )
  );
}
