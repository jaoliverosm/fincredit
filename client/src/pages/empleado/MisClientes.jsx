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
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { formatEstado } from '../../utils/format';

export default function MisClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', email: '', password: '', cedula: '', telefono: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.clientes);
    } catch (err) { toast.error('Error al cargar clientes'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/clientes', form);
      toast.success('Cliente creado');
      setModalOpen(false);
      setForm({ nombre: '', email: '', password: '', cedula: '', telefono: '' });
      loadData();
    } catch (err) { setError(err.response?.data?.error || 'Error al crear cliente'); toast.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Mis Clientes'),
      React.createElement(Button, { onClick: () => setModalOpen(true) }, '+ Nuevo Cliente')
    ),
    error && React.createElement('div', { role: 'alert', className: 'bg-red-50 text-red-600 p-3 rounded-lg' }, error),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'nombre', label: 'Nombre', render: r => r.usuario.nombre },
          { key: 'cedula', label: 'Cédula' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'estado', label: 'Estado', render: r => React.createElement(Badge, { variant: r.estado === 'activo' ? 'success' : r.estado === 'mora' ? 'danger' : 'info' }, r.estado) }
        ],
        data: clientes,
        onRowClick: (r) => navigate('/empleado/prestamos?clienteId=' + r.id)
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: 'Nuevo Cliente' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Input, { label: 'Nombre', value: form.nombre, onChange: e => setForm({ ...form, nombre: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Email', type: 'email', value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Contraseña', type: 'password', value: form.password, onChange: e => setForm({ ...form, password: e.target.value }) }),
        React.createElement(Input, { label: 'Cédula', value: form.cedula, onChange: e => setForm({ ...form, cedula: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Teléfono', value: form.telefono, onChange: e => setForm({ ...form, telefono: e.target.value }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary' }, 'Crear Cliente')
        )
      )
    )
  );
}
