import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

export default function EmpleadosPage() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [generatedInfo, setGeneratedInfo] = useState(null);

  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', meta: '' });

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
        const creds = { email: info.generatedEmail || info.usuario?.email, password: info.generatedPassword };
        setGeneratedInfo(creds);
        navigator.clipboard?.writeText('Email: ' + creds.email + '\nPass: ' + creds.password).catch(() => {});
        toast.success('Empleado creado. Credenciales copiadas al portapapeles.');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ nombre: '', cedula: '', telefono: '', meta: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete('/empleados/' + id); toast.success('Empleado eliminado'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error); }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({ nombre: emp.usuario.nombre, cedula: emp.cedula || '', telefono: emp.telefono || '', meta: emp.meta || '' });
    setModalOpen(true);
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-foreground' }, 'Empleados'),
      React.createElement(Button, { onClick: () => { setEditing(null); setForm({ nombre: '', cedula: '', telefono: '', meta: '' }); setModalOpen(true); } },
        '+ Nuevo Empleado'
      )
    ),

    generatedInfo && React.createElement('div', { className: 'bg-accent/10 border border-accent rounded-lg p-4 text-sm' },
      React.createElement('div', { className: 'flex justify-between items-start' },
        React.createElement('div', null,
          React.createElement('p', { className: 'font-semibold text-accent-foreground mb-1' }, 'Últimas credenciales generadas:'),
          React.createElement('p', { className: 'text-foreground' }, 'Email: ', React.createElement('strong', null, generatedInfo.email)),
          React.createElement('p', { className: 'text-foreground' }, 'Contraseña: ', React.createElement('strong', null, generatedInfo.password))
        ),
        React.createElement('button', { onClick: () => setGeneratedInfo(null), className: 'text-muted-foreground hover:text-foreground text-lg' }, '\u00D7')
      )
    ),

    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'foto', label: '', render: r =>
            React.createElement('div', { className: 'w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden' },
              r.fotoUrl
                ? React.createElement('img', { src: API_URL + r.fotoUrl, alt: '', className: 'w-full h-full object-cover' })
                : React.createElement('span', { className: 'text-xs font-bold text-muted-foreground' }, (r.usuario?.nombre || '?').charAt(0).toUpperCase())
            )
          },
          { key: 'nombre', label: 'Nombre', render: r => r.usuario?.nombre },
          { key: 'cedula', label: 'Cédula', render: r => r.cedula || '-' },
          { key: 'email', label: 'Email', render: r => r.usuario?.email },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'direccion', label: 'Dirección', render: r => r.direccion || '-' },
          { key: 'meta', label: 'Meta', render: r => r.meta ? formatCurrency(r.meta) : '-' },
          { key: 'estado', label: 'Estado', render: r => r.usuario?.activo ? React.createElement(Badge, { variant: 'success' }, 'Activo') : React.createElement(Badge, { variant: 'danger' }, 'Inactivo') }
        ],
        data: empleados,
        onRowClick: (r) => navigate('/supervisor/empleados/' + r.id),
        actions: (r) => React.createElement('div', { className: 'flex gap-2' },
          React.createElement(Button, { size: 'sm', variant: 'outline', onClick: (e) => { e.stopPropagation(); openEdit(r); } }, 'Editar'),
          React.createElement(Button, { size: 'sm', variant: 'danger', onClick: (e) => { e.stopPropagation(); setConfirmDelete(r.id); } }, 'Eliminar')
        )
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setGeneratedInfo(null); }, title: editing ? 'Editar Empleado' : 'Nuevo Empleado' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Input, { label: 'Nombre Completo', value: form.nombre, onChange: e => setForm({ ...form, nombre: e.target.value }), required: true, placeholder: 'Ej: Jefersson Aldair Oliveros Monroy' }),
        React.createElement(Input, { label: 'Cédula', value: form.cedula, onChange: e => setForm({ ...form, cedula: e.target.value }), placeholder: '1234567890' }),
        React.createElement(Input, { label: 'Teléfono', value: form.telefono, onChange: e => setForm({ ...form, telefono: e.target.value }) }),
        React.createElement(Input, { label: 'Meta mensual (COP)', type: 'number', value: form.meta, onChange: e => setForm({ ...form, meta: e.target.value }) }),
        !editing && React.createElement('div', { className: 'bg-muted rounded-lg p-3 text-xs text-muted-foreground' },
          'El email y contraseña se generarán automáticamente. ',
          'La contraseña será tu número de cédula + la primera letra de tu primer apellido.'
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
