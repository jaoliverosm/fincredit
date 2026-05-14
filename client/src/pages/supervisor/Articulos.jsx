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
import ConfirmModal from '../../components/ConfirmModal';
import StockModal from '../../components/StockModal';
import { formatCurrency } from '../../utils/format';

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stockModal, setStockModal] = useState({ open: false, id: null, tipo: 'sumar' });

  const [form, setForm] = useState({ nombre: '', descripcion: '', categoria: '', precio: '', stock: '', imagen: '', activo: true });

  useEffect(() => { loadData(); }, [search]);

  const loadData = async () => {
    try {
      const params = search ? '?search=' + encodeURIComponent(search) : '';
      const res = await api.get('/articulos' + params);
      setArticulos(res.data.articulos);
    } catch (err) { toast.error('Error al cargar artículos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put('/articulos/' + editing.id, form);
        toast.success('Artículo actualizado');
      } else {
        await api.post('/articulos', form);
        toast.success('Artículo creado');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ nombre: '', descripcion: '', categoria: '', precio: '', stock: '', imagen: '', activo: true });
      loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete('/articulos/' + id); toast.success('Artículo eliminado'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleStock = async (id, tipo, cantidad) => {
    try { await api.patch('/articulos/' + id + '/stock', { cantidad, tipo }); toast.success('Stock actualizado'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ nombre: a.nombre, descripcion: a.descripcion || '', categoria: a.categoria || '', precio: a.precio, stock: a.stock, imagen: a.imagen || '', activo: a.activo });
    setModalOpen(true);
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Artículos'),
      React.createElement(Button, { onClick: () => { setEditing(null); setForm({ nombre: '', descripcion: '', categoria: '', precio: '', stock: '', imagen: '', activo: true }); setModalOpen(true); } },
        '+ Nuevo Artículo'
      )
    ),
    React.createElement(Input, { label: 'Buscar', placeholder: 'Nombre o descripción...', value: search, onChange: e => setSearch(e.target.value) }),
    React.createElement(Card, null,
      React.createElement(Table, {
        columns: [
          { key: 'nombre', label: 'Nombre' },
          { key: 'categoria', label: 'Categoría' },
          { key: 'precio', label: 'Precio', render: r => formatCurrency(r.precio) },
          { key: 'stock', label: 'Stock' },
          { key: 'activo', label: 'Estado', render: r => React.createElement(Badge, { variant: r.activo ? 'success' : 'danger' }, r.activo ? 'Activo' : 'Inactivo') }
        ],
        data: articulos,
        onRowClick: openEdit,
        actions: (r) => React.createElement('div', { className: 'flex gap-2' },
          React.createElement(Button, { size: 'sm', variant: 'outline', onClick: (e) => { e.stopPropagation(); setStockModal({ open: true, id: r.id, tipo: 'sumar' }); } }, '+ Stock'),
          React.createElement(Button, { size: 'sm', variant: 'outline', onClick: (e) => { e.stopPropagation(); setStockModal({ open: true, id: r.id, tipo: 'restar' }); } }, '- Stock'),
          React.createElement(Button, { size: 'sm', variant: 'danger', onClick: (e) => { e.stopPropagation(); setConfirmDelete(r.id); } }, 'Eliminar')
        )
      })
    ),

    React.createElement(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing ? 'Editar Artículo' : 'Nuevo Artículo' },
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Input, { label: 'Nombre', value: form.nombre, onChange: e => setForm({ ...form, nombre: e.target.value }), required: true }),
        React.createElement(Input, { label: 'Descripción', value: form.descripcion, onChange: e => setForm({ ...form, descripcion: e.target.value }) }),
        React.createElement(Input, { label: 'Categoría', value: form.categoria, onChange: e => setForm({ ...form, categoria: e.target.value }) }),
        React.createElement(Input, { label: 'Precio (COP)', type: 'number', value: form.precio, onChange: e => setForm({ ...form, precio: e.target.value }), required: true }),
        !editing && React.createElement(Input, { label: 'Stock Inicial', type: 'number', value: form.stock, onChange: e => setForm({ ...form, stock: parseInt(e.target.value) || 0 }) }),
        React.createElement(Input, { label: 'URL Imagen', value: form.imagen, onChange: e => setForm({ ...form, imagen: e.target.value }) }),
        React.createElement(Select, { label: 'Activo', options: [{ value: true, label: 'Sí' }, { value: false, label: 'No' }], value: form.activo, onChange: e => setForm({ ...form, activo: e.target.value === 'true' }) }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: () => setModalOpen(false) }, 'Cancelar'),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: !form.nombre || !form.precio }, editing ? 'Actualizar' : 'Crear')
        )
      )
    ),

    React.createElement(ConfirmModal, {
      open: !!confirmDelete,
      onClose: () => setConfirmDelete(null),
      onConfirm: () => handleDelete(confirmDelete),
      title: 'Eliminar Artículo',
      message: '¿Eliminar este artículo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar'
    }),

    React.createElement(StockModal, {
      open: stockModal.open,
      onClose: () => setStockModal({ open: false, id: null, tipo: 'sumar' }),
      onConfirm: (cantidad) => handleStock(stockModal.id, stockModal.tipo, cantidad),
      tipo: stockModal.tipo
    })
  );
}
