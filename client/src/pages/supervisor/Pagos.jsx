import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/format';

export default function PagosPage() {
  const [pagos, setPagos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoDeuda, setTipoDeuda] = useState('prestamo');
  const [form, setForm] = useState({ clienteId: '', prestamoId: '', ventaId: '', monto: '', metodo: 'efectivo', fecha: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resP, resC, resPres, resV] = await Promise.all([
        api.get('/pagos').catch(() => ({ data: { pagos: [] } })),
        api.get('/clientes').catch(() => ({ data: { clientes: [] } })),
        api.get('/prestamos').catch(() => ({ data: { prestamos: [] } })),
        api.get('/ventas').catch(() => ({ data: { ventas: [] } }))
      ]);
      setPagos(resP.data.pagos);
      setClientes(resC.data.clientes);
      setPrestamos(resPres.data.prestamos);
      setVentas(resV.data.ventas);
    } catch (err) { /* console.error(err) */ }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tipo: tipoDeuda === 'prestamo' ? 'prestamo' : 'venta',
        prestamoId: tipoDeuda === 'prestamo' ? form.prestamoId : null,
        ventaId: tipoDeuda === 'venta' ? form.ventaId : null
      };
      await api.post('/pagos', payload);
      setModalOpen(false);
      setForm({ clienteId: '', prestamoId: '', ventaId: '', monto: '', metodo: 'efectivo', fecha: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const deudasFiltradas = tipoDeuda === 'prestamo'
    ? prestamos.filter(p => String(p.clienteId) === String(form.clienteId) && p.estado !== 'pagado')
    : ventas.filter(v => String(v.clienteId) === String(form.clienteId) && v.estado !== 'pagado');

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Pagos'),
      React.createElement(Button, { onClick: () => setModalOpen(true) }, '+ Registrar Pago')
    ),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
          { key: 'monto', label: 'Monto', render: r => formatCurrency(r.monto) },
          { key: 'fecha', label: 'Fecha', render: r => new Date(r.fecha).toLocaleString() },
          { key: 'metodo', label: 'Método' },
          { key: 'observacion', label: 'Observación' }
        ],
        data: pagos
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: 'Registrar Pago' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Select, { label: 'Cliente', options: clientes.map(c => ({ value: c.id, label: c.usuario.nombre + ' (' + c.cedula + ')' })), value: form.clienteId, onChange: e => setForm({ ...form, clienteId: e.target.value, prestamoId: '', ventaId: '' }), required: true }),
        React.createElement(Select, { label: 'Tipo de Deuda', options: [{ value: 'prestamo', label: 'Préstamo' }, { value: 'venta', label: 'Venta a Crédito' }], value: tipoDeuda, onChange: e => setTipoDeuda(e.target.value) }),
        form.clienteId && React.createElement(Select, {
          label: tipoDeuda === 'prestamo' ? 'Seleccionar Préstamo' : 'Seleccionar Venta',
          options: deudasFiltradas.map(d => ({
            value: d.id,
            label: tipoDeuda === 'prestamo'
              ? '#' + d.id + ' - ' + formatCurrency(d.monto) + ' (Saldo: ' + formatCurrency(d.monto - d.pagado) + ')'
              : '#' + d.id + ' - ' + (d.articulo?.nombre || '') + ' - ' + formatCurrency(d.precioTotal) + ' (Saldo: ' + formatCurrency(d.precioTotal - d.pagado) + ')'
          })),
          value: tipoDeuda === 'prestamo' ? form.prestamoId : form.ventaId,
          onChange: e => {
            if (tipoDeuda === 'prestamo') setForm({ ...form, prestamoId: e.target.value, ventaId: '' });
            else setForm({ ...form, ventaId: e.target.value, prestamoId: '' });
          },
          required: true
        }),
        React.createElement(Input, { label: 'Monto', type: 'number', value: form.monto, onChange: e => setForm({ ...form, monto: e.target.value }), required: true }),
        React.createElement(Select, { label: 'Método', options: [{ value: 'efectivo', label: 'Efectivo' }, { value: 'transferencia', label: 'Transferencia' }, { value: 'tarjeta', label: 'Tarjeta' }], value: form.metodo, onChange: e => setForm({ ...form, metodo: e.target.value }) }),
        React.createElement(Input, { label: 'Fecha', type: 'datetime-local', value: form.fecha, onChange: e => setForm({ ...form, fecha: e.target.value }) }),
        React.createElement(Input, { label: 'Observación', value: form.observacion, onChange: e => setForm({ ...form, observacion: e.target.value }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: !form.clienteId || !form.monto || (!form.prestamoId && !form.ventaId) }, 'Registrar')
        )
      )
    )
  );
}
