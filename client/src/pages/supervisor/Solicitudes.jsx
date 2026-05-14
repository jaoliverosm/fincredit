import React, { useState, useEffect } from 'react';
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

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  const [form, setForm] = useState({ clienteId: '', empleadoId: '', tipo: 'nuevo_prestamo', monto: '', cuotas: '', articuloId: '', mensaje: '', estado: 'aprobado' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resS, resC, resE] = await Promise.all([
        api.get('/solicitudes').catch(() => ({ data: { solicitudes: [] } })),
        api.get('/clientes').catch(() => ({ data: { clientes: [] } })),
        api.get('/empleados').catch(() => ({ data: { empleados: [] } }))
      ]);
      setSolicitudes(resS.data.solicitudes);
      setClientes(resC.data.clientes);
      setEmpleados(resE.data.empleados);
    } catch (err) { /* console.error(err) */ }
    finally { setLoading(false); }
  };

  const handleResponder = async (e) => {
    e.preventDefault();
    try {
      await api.put('/solicitudes/' + selectedSolicitud + '/responder', form);
      setModalOpen(false);
      setSelectedSolicitud(null);
      setForm({ clienteId: '', empleadoId: '', tipo: 'nuevo_prestamo', monto: '', cuotas: '', articuloId: '', mensaje: '', estado: 'aprobado' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Solicitudes'),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'cliente', label: 'Cliente', render: r => r.cliente?.usuario?.nombre },
          { key: 'tipo', label: 'Tipo', render: r => r.tipo?.replace('_', ' ') },
          { key: 'monto', label: 'Monto', render: r => r.monto ? formatCurrency(r.monto) : '-' },
          { key: 'empleado', label: 'Asignado', render: r => r.empleado?.usuario?.nombre || '-' },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'aprobado' ? 'success' : r.estado === 'rechazado' ? 'danger' : 'warning' }, formatEstado(r.estado)) }
        ],
        data: solicitudes,
        actions: (r) => !r.respuesta && React.createElement(Button, { size: 'sm', variant: 'primary', onClick: () => {
          setSelectedSolicitud(r.id);
          setForm({ ...form, clienteId: r.clienteId, empleadoId: r.empleadoId || '', mensaje: '', estado: 'aprobado' });
          setModalOpen(true);
        } }, 'Responder')
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: 'Responder Solicitud' },
      React.createElement('form', { onSubmit: handleResponder, className: 'space-y-4' },
        React.createElement(Select, { label: 'Asignar a Empleado', options: empleados.map(e => ({ value: e.usuarioId, label: e.usuario.nombre })), value: form.empleadoId, onChange: e => setForm({ ...form, empleadoId: e.target.value }) }),
        React.createElement(Input, { label: 'Respuesta', value: form.mensaje, onChange: e => setForm({ ...form, mensaje: e.target.value }), required: true }),
        React.createElement(Select, { label: 'Decisión', options: [{ value: 'aprobado', label: 'Aprobar' }, { value: 'rechazado', label: 'Rechazar' }], value: form.estado || 'aprobado', onChange: e => setForm({ ...form, estado: e.target.value }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary' }, 'Enviar Respuesta')
        )
      )
    )
  );
}
