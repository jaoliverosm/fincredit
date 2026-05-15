import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ConfirmModal';
import { formatCurrency } from '../../utils/format';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [generatedInfo, setGeneratedInfo] = useState(null);

  const [form, setForm] = useState({ nombre: '', telefono: '', meta: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/empleados');
      setEmpleados(res.data.empleados);
    } catch (err) { toast.error('Error al cargar empleados'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put('/empleados/' + editing.id, form);
        toast.success('Empleado actualizado');
      } else {
        const res = await api.post('/empleados', form);
        const info = res.data;
        if (info.generatedPassword || info.generatedEmail) {
          setGeneratedInfo({ email: info.generatedEmail || info.usuario.email, password: info.generatedPassword });
        }
        toast.success('Empleado creado');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ nombre: '', telefono: '', meta: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete('/empleados/' + id); toast.success('Empleado eliminado'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error); }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({ nombre: emp.usuario.nombre, telefono: emp.telefono || '', meta: emp.meta || '' });
    setModalOpen(true);
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Empleados'),
      React.createElement(Button, { onClick: () => { setEditing(null); setForm({ nombre: '', telefono: '', meta: '' }); setModalOpen(true); } },
        '+ Nuevo Empleado'
      )
    ),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'nombre', label: 'Nombre', render: r => r.usuario.nombre },
          { key: 'email', label: 'Email', render: r => r.usuario.email },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'meta', label: 'Meta', render: r => r.meta ? formatCurrency(r.meta) : '-' },
          { key: 'estado', label: 'Estado', render: r => r.usuario?.activo ? React.createElement(Badge, { variant: 'success' }, 'Activo') : React.createElement(Badge, { variant: 'danger' }, 'Inactivo') }
        ],
        data: empleados,
        onRowClick: openEdit,
        actions: (r) => React.createElement('div', { className: 'flex gap-2' },
          React.createElement(Button, { size: 'sm', variant: 'outline', onClick: (e) => { e.stopPropagation(); openEdit(r); } }, 'Editar'),
          React.createElement(Button, { size: 'sm', variant: 'danger', onClick: (e) => { e.stopPropagation(); setConfirmDelete(r.id); } }, 'Eliminar')
        )
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setGeneratedInfo(null); }, title: editing ? 'Editar Empleado' : 'Nuevo Empleado' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Input, { label: 'Nombre Completo', value: form.nombre, onChange: e => setForm({ ...form, nombre: e.target.value }), required: true, placeholder: 'Ej: Jefersson Aldair Oliveros Monroy' }),
        !editing && React.createElement('p', { className: 'text-xs text-gray-500' }, 'El email y contraseña se generarán automáticamente.'),
        React.createElement(Input, { label: 'Teléfono', value: form.telefono, onChange: e => setForm({ ...form, telefono: e.target.value }) }),
        React.createElement(Input, { label: 'Meta mensual (COP)', type: 'number', value: form.meta, onChange: e => setForm({ ...form, meta: e.target.value }) }),
        generatedInfo && React.createElement('div', { className: 'bg-green-50 border border-green-200 rounded-lg p-3 text-sm' },
          React.createElement('p', { className: 'font-semibold text-green-800 mb-1' }, 'Credenciales generadas:'),
          React.createElement('p', { className: 'text-green-700' }, 'Email: ', React.createElement('strong', null, generatedInfo.email)),
          React.createElement('p', { className: 'text-green-700' }, 'Contraseña: ', React.createElement('strong', null, generatedInfo.password))
        ),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => { setModalOpen(false); setGeneratedInfo(null); } }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: !form.nombre }, editing ? 'Guardar' : 'Crear')
        )
      )
    ),

    React.createElement(ConfirmModal, {
      open: !!confirmDelete,
      onClose: () => setConfirmDelete(null),
      onConfirm: () => handleDelete(confirmDelete),
      title: 'Eliminar Empleado',
      message: '¿Eliminar este empleado? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar'
    })
  );
}
