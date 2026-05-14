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
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ConfirmModal';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmInact, setConfirmInact] = useState(null);

  const [form, setForm] = useState({ nombre: '', email: '', password: '', cedula: '', telefono: '', empleadoId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resC, resE] = await Promise.all([api.get('/clientes'), api.get('/empleados')]);
      setClientes(resC.data.clientes);
      setEmpleados(resE.data.empleados);
    } catch (err) { toast.error('Error al cargar datos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put('/clientes/' + editing.id, { cedula: form.cedula, telefono: form.telefono, estado: form.estado });
        toast.success('Cliente actualizado');
      } else {
        await api.post('/clientes', form);
        toast.success('Cliente creado');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ nombre: '', email: '', password: '', cedula: '', telefono: '', empleadoId: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleInactivar = async (id) => {
    try { await api.put('/clientes/' + id, { estado: 'inactivo' }); toast.success('Cliente inactivado'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error); }
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ nombre: c.usuario.nombre, email: c.usuario.email, password: '', cedula: c.cedula, telefono: c.telefono || '', empleadoId: c.empleadoId || '', estado: c.estado });
    setModalOpen(true);
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Clientes'),
      React.createElement(Button, { onClick: () => { setEditing(null); setForm({ nombre: '', email: '', password: '', cedula: '', telefono: '', empleadoId: '' }); setModalOpen(true); } },
        '+ Nuevo Cliente'
      )
    ),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'nombre', label: 'Nombre', render: r => r.usuario.nombre },
          { key: 'cedula', label: 'Cédula' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'empleado', label: 'Empleado', render: r => r.empleado?.usuario?.nombre || '-' },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : r.estado === 'pagado' ? 'info' : 'warning' }, r.estado) }
        ],
        data: clientes,
        onRowClick: openEdit,
        actions: (r) => React.createElement(Button, { size: 'sm', variant: 'danger', onClick: (e) => { e.stopPropagation(); setConfirmInact(r.id); } }, 'Inactivar')
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing ? 'Editar Cliente' : 'Nuevo Cliente' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Input, { label: 'Nombre', value: form.nombre, onChange: e => setForm({ ...form, nombre: e.target.value }), required: !editing }),
        React.createElement(Input, { label: 'Email', type: 'email', value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: !editing }),
        !editing && React.createElement(Input, { label: 'Contraseña', type: 'password', value: form.password, onChange: e => setForm({ ...form, password: e.target.value }) }),
        React.createElement(Input, { label: 'Cédula', value: form.cedula, onChange: e => setForm({ ...form, cedula: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Teléfono', value: form.telefono, onChange: e => setForm({ ...form, telefono: e.target.value }) }),
        React.createElement(Select, { label: 'Empleado Asignado', options: [{ value: '', label: 'Sin asignar' }, ...empleados.map(e => ({ value: e.usuarioId, label: e.usuario.nombre }))], value: form.empleadoId, onChange: e => setForm({ ...form, empleadoId: e.target.value }) }),
        editing && React.createElement(Select, { label: 'Estado', options: [{ value: 'activo', label: 'Activo' }, { value: 'mora', label: 'En Mora' }, { value: 'pagado', label: 'Pagado' }, { value: 'inactivo', label: 'Inactivo' }], value: form.estado, onChange: e => setForm({ ...form, estado: e.target.value }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: !form.nombre || !form.email || !form.cedula }, editing ? 'Actualizar' : 'Crear')
        )
      )
    ),

    React.createElement(ConfirmModal, {
      open: !!confirmInact,
      onClose: () => setConfirmInact(null),
      onConfirm: () => handleInactivar(confirmInact),
      title: 'Inactivar Cliente',
      message: '¿Inactivar este cliente? Podrás reactivarlo después.',
      confirmText: 'Inactivar'
    })
  );
}
