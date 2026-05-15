import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { ArrowLeft, Camera, Upload, Key, Trash2, Plus } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

export default function DetalleEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [empleado, setEmpleado] = useState(null);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recModal, setRecModal] = useState(false);
  const [recForm, setRecForm] = useState({ tipo: 'celular', nombre: '', descripcion: '' });
  const [newPassword, setNewPassword] = useState('');

  const form = empleado ? {
    nombre: empleado.usuario?.nombre || '',
    email: empleado.usuario?.email || '',
    telefono: empleado.telefono || '',
    meta: empleado.meta || '',
    direccion: empleado.direccion || '',
    fechaNacimiento: empleado.fechaNacimiento ? empleado.fechaNacimiento.split('T')[0] : ''
  } : {};
  const [fields, setFields] = useState({});

  useEffect(() => { if (empleado) setFields(form); }, [empleado?.id]);

  useEffect(() => { loadData(); loadRecursos(); }, [id]);

  const loadData = async () => {
    try {
      const res = await api.get('/empleados/' + id);
      setEmpleado(res.data.empleado);
    } catch (err) { toast.error('Error al cargar empleado'); }
    finally { setLoading(false); }
  };

  const loadRecursos = async () => {
    try {
      const res = await api.get('/empleados/' + id + '/recursos');
      setRecursos(res.data.recursos);
    } catch (err) { /* silent */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/empleados/' + id, fields);
      setEmpleado(res.data.empleado);
      toast.success('Empleado actualizado');
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const res = await api.post('/empleados/' + id + '/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEmpleado(prev => ({ ...prev, fotoUrl: res.data.fotoUrl }));
      toast.success('Foto actualizada');
    } catch (err) { toast.error('Error al subir foto'); }
  };

  const handleCV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('hojaDeVida', file);
    try {
      const res = await api.post('/empleados/' + id + '/hoja-de-vida', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEmpleado(prev => ({ ...prev, hojaDeVidaUrl: res.data.hojaDeVidaUrl }));
      toast.success('Hoja de vida actualizada');
    } catch (err) { toast.error('Error al subir hoja de vida'); }
  };

  const handleGenPassword = async () => {
    try {
      const res = await api.post('/empleados/' + id + '/generar-password');
      setNewPassword(res.data.password);
      toast.success('Nueva contraseña generada');
    } catch (err) { toast.error('Error al generar contraseña'); }
  };

  const handleAddRecurso = async () => {
    try {
      await api.post('/empleados/' + id + '/recursos', recForm);
      toast.success('Recurso asignado');
      setRecModal(false);
      setRecForm({ tipo: 'celular', nombre: '', descripcion: '' });
      loadRecursos();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelRecurso = async (rid) => {
    try { await api.delete('/empleados/' + id + '/recursos/' + rid); toast.success('Recurso desasignado'); loadRecursos(); }
    catch (err) { toast.error('Error'); }
  };

  const edad = empleado?.fechaNacimiento ? Math.floor((Date.now() - new Date(empleado.fechaNacimiento).getTime()) / 31557600000) : null;

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center gap-4' },
      React.createElement('button', { onClick: () => navigate('/supervisor/empleados'), className: 'p-2 hover:bg-gray-100 rounded-lg transition' },
        React.createElement(ArrowLeft, { size: 20 })
      ),
      React.createElement('h1', { className: 'text-2xl font-bold' }, empleado?.usuario?.nombre || 'Empleado')
    ),

    // Tabs
    React.createElement('div', { className: 'flex gap-2 border-b border-gray-200' },
      ['info', 'docs', 'recursos'].map(t =>
        React.createElement('button', {
          key: t, onClick: () => setTab(t),
          className: 'px-4 py-2 text-sm font-medium border-b-2 transition ' + (tab === t ? 'border-[#00236f] text-[#00236f]' : 'border-transparent text-gray-500 hover:text-gray-700')
        }, t === 'info' ? 'Información' : t === 'docs' ? 'Foto y CV' : 'Recursos')
      )
    ),

    tab === 'info' && React.createElement(Card, null,
      React.createElement('form', { onSubmit: e => { e.preventDefault(); handleSave(); }, className: 'space-y-4' },
        React.createElement('div', { className: 'flex items-center gap-6 mb-4' },
          React.createElement('div', { className: 'w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200' },
            empleado?.fotoUrl
              ? React.createElement('img', { src: API_URL + empleado.fotoUrl, alt: 'Foto', className: 'w-full h-full object-cover' })
              : React.createElement('span', { className: 'text-2xl text-gray-400 font-bold' }, empleado?.usuario?.nombre?.charAt(0) || '?')
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium text-lg' }, empleado?.usuario?.nombre),
            React.createElement('p', { className: 'text-sm text-gray-500' }, empleado?.usuario?.email),
            edad !== null && React.createElement('p', { className: 'text-sm text-gray-500' }, edad + ' años'),
            React.createElement('p', { className: 'text-xs text-gray-400' }, 'Meta: ' + formatCurrency(empleado?.meta || 0))
          )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(Input, { label: 'Nombre', value: fields.nombre || '', onChange: e => setFields({ ...fields, nombre: e.target.value }) }),
          React.createElement(Input, { label: 'Email', type: 'email', value: fields.email || '', onChange: e => setFields({ ...fields, email: e.target.value }) }),
          React.createElement(Input, { label: 'Teléfono', value: fields.telefono || '', onChange: e => setFields({ ...fields, telefono: e.target.value }) }),
          React.createElement(Input, { label: 'Fecha de Nacimiento', type: 'date', value: fields.fechaNacimiento || '', onChange: e => setFields({ ...fields, fechaNacimiento: e.target.value }) }),
          React.createElement('div', { className: 'md:col-span-2' },
            React.createElement(Input, { label: 'Dirección', value: fields.direccion || '', onChange: e => setFields({ ...fields, direccion: e.target.value }), placeholder: 'Manzana, Carrera, Calle...' })
          ),
          React.createElement(Input, { label: 'Meta mensual (COP)', type: 'number', value: fields.meta || '', onChange: e => setFields({ ...fields, meta: e.target.value }) })
        ),
        React.createElement('div', { className: 'flex justify-end gap-3 pt-4 border-t border-gray-200' },
          React.createElement(Button, { type: 'button', variant: 'secondary', onClick: handleGenPassword },
            React.createElement(Key, { size: 16 }), ' Generar contraseña'
          ),
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: saving }, saving ? 'Guardando...' : 'Guardar cambios')
        ),
        newPassword && React.createElement('div', { className: 'bg-green-50 border border-green-200 rounded-lg p-4 text-sm' },
          React.createElement('p', { className: 'font-semibold text-green-800 mb-1' }, 'Nueva contraseña generada:'),
          React.createElement('p', { className: 'text-green-700 font-mono text-lg' }, newPassword),
          React.createElement('button', { onClick: () => setNewPassword(''), className: 'text-xs text-green-600 hover:underline mt-1' }, 'Ocultar')
        )
      )
    ),

    tab === 'docs' && React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      React.createElement(Card, null,
        React.createElement('h3', { className: 'font-semibold mb-4' }, 'Foto del Empleado'),
        React.createElement('div', { className: 'flex flex-col items-center gap-4' },
          React.createElement('div', { className: 'w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200' },
            empleado?.fotoUrl
              ? React.createElement('img', { src: API_URL + empleado.fotoUrl, alt: 'Foto', className: 'w-full h-full object-cover' })
              : React.createElement(Camera, { className: 'text-gray-400', size: 48 })
          ),
          React.createElement('label', { className: 'cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition inline-flex items-center gap-2' },
            React.createElement(Upload, { size: 16 }), ' Subir foto',
            React.createElement('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', onChange: handleFoto, className: 'hidden' })
          )
        )
      ),
      React.createElement(Card, null,
        React.createElement('h3', { className: 'font-semibold mb-4' }, 'Hoja de Vida'),
        React.createElement('div', { className: 'flex flex-col items-center gap-4' },
          React.createElement('div', { className: 'w-full h-40 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center' },
            empleado?.hojaDeVidaUrl
              ? React.createElement('div', { className: 'text-center' },
                  React.createElement('p', { className: 'text-sm text-gray-600 mb-2' }, 'PDF cargado'),
                  React.createElement('a', { href: API_URL + empleado.hojaDeVidaUrl, target: '_blank', className: 'text-[#00236f] text-sm font-medium hover:underline' }, 'Ver hoja de vida')
                )
              : React.createElement('p', { className: 'text-sm text-gray-400' }, 'Sin hoja de vida')
          ),
          React.createElement('label', { className: 'cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition inline-flex items-center gap-2' },
            React.createElement(Upload, { size: 16 }), empleado?.hojaDeVidaUrl ? ' Reemplazar' : ' Subir PDF',
            React.createElement('input', { type: 'file', accept: '.pdf,.doc,.docx', onChange: handleCV, className: 'hidden' })
          )
        )
      )
    ),

    tab === 'recursos' && React.createElement(Card, null,
      React.createElement('div', { className: 'flex justify-between items-center mb-4' },
        React.createElement('h3', { className: 'font-semibold' }, 'Recursos Asignados'),
        React.createElement(Button, { variant: 'outline', size: 'sm', onClick: () => setRecModal(true) },
          React.createElement(Plus, { size: 16 }), ' Asignar recurso'
        )
      ),
      recursos.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-500 text-center py-8' }, 'No hay recursos asignados')
        : React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'w-full text-sm' },
              React.createElement('thead', null,
                React.createElement('tr', { className: 'border-b' },
                  React.createElement('th', { className: 'text-left py-2 px-3 font-medium text-gray-500' }, 'Tipo'),
                  React.createElement('th', { className: 'text-left py-2 px-3 font-medium text-gray-500' }, 'Nombre'),
                  React.createElement('th', { className: 'text-left py-2 px-3 font-medium text-gray-500' }, 'Descripción'),
                  React.createElement('th', { className: 'text-left py-2 px-3 font-medium text-gray-500' }, 'Fecha Asignación'),
                  React.createElement('th', { className: 'text-right py-2 px-3 font-medium text-gray-500' }, 'Acción')
                )
              ),
              React.createElement('tbody', null,
                recursos.map(r =>
                  React.createElement('tr', { key: r.id, className: 'border-b hover:bg-gray-50' },
                    React.createElement('td', { className: 'py-2 px-3 capitalize' }, r.tipo),
                    React.createElement('td', { className: 'py-2 px-3' }, r.nombre),
                    React.createElement('td', { className: 'py-2 px-3 text-gray-500' }, r.descripcion || '-'),
                    React.createElement('td', { className: 'py-2 px-3 text-gray-500' }, new Date(r.fechaAsignacion).toLocaleDateString('es-CO')),
                    React.createElement('td', { className: 'py-2 px-3 text-right' },
                      React.createElement('button', { onClick: () => handleDelRecurso(r.id), className: 'text-red-500 hover:text-red-700' },
                        React.createElement(Trash2, { size: 16 })
                      )
                    )
                  )
                )
              )
            )
          )
    ),

    // Modal asignar recurso
    recModal && React.createElement('div', { className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4', onClick: () => setRecModal(false) },
      React.createElement('div', { className: 'bg-white rounded-xl max-w-md w-full p-6', onClick: e => e.stopPropagation() },
        React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 'Asignar Recurso'),
        React.createElement(Select, {
          label: 'Tipo', value: recForm.tipo,
          onChange: e => setRecForm({ ...recForm, tipo: e.target.value }),
          options: [
            { value: 'celular', label: 'Celular corporativo' },
            { value: 'tablet', label: 'Tablet corporativa' },
            { value: 'sim', label: 'SIM Card' },
            { value: 'equipo', label: 'Equipo de cómputo' },
            { value: 'otro', label: 'Otro' }
          ]
        }),
        React.createElement(Input, { label: 'Nombre del equipo', value: recForm.nombre, onChange: e => setRecForm({ ...recForm, nombre: e.target.value }), required: true, placeholder: 'Ej: iPhone 14, iPad Pro' }),
        React.createElement(Input, { label: 'Descripción (opcional)', value: recForm.descripcion, onChange: e => setRecForm({ ...recForm, descripcion: e.target.value }), placeholder: 'IMEI, serie, etc.' }),
        React.createElement('div', { className: 'flex justify-end gap-3 mt-6' },
          React.createElement(Button, { variant: 'secondary', onClick: () => setRecModal(false) }, 'Cancelar'),
          React.createElement(Button, { variant: 'primary', onClick: handleAddRecurso, disabled: !recForm.nombre }, 'Asignar')
        )
      )
    )
  );
}
