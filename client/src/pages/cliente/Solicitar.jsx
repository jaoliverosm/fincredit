import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/format';

export default function SolicitarPage() {
  const [form, setForm] = useState({ tipo: 'nuevo_prestamo', monto: '', cuotas: '', articuloId: '', mensaje: '' });
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/articulos?activo=true').then(res => { setArticulos(res.data.articulos); setLoading(false); }).catch(() => { toast.error('Error al cargar artículos'); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/solicitudes', form);
      toast.success('Solicitud enviada correctamente');
      setForm({ tipo: 'nuevo_prestamo', monto: '', cuotas: '', articuloId: '', mensaje: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Error al enviar solicitud'); }
    finally { setSending(false); }
  };

  if (loading) return React.createElement(LoadingSpinner);

  return React.createElement('div', { className: 'space-y-6 max-w-2xl' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Enviar Solicitud'),
    React.createElement(Card, null,
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement(Select, { label: 'Tipo de Solicitud',
          options: [
            { value: 'nuevo_prestamo', label: 'Nuevo Préstamo' },
            { value: 'ampliacion', label: 'Ampliación de Préstamo' },
            { value: 'nueva_compra', label: 'Nueva Compra' },
            { value: 'mensaje', label: 'Mensaje' }
          ],
          value: form.tipo, onChange: e => setForm({ ...form, tipo: e.target.value })
        }),
        (form.tipo === 'nuevo_prestamo' || form.tipo === 'ampliacion') && React.createElement(Input, { label: 'Monto Solicitado (COP)', type: 'number', value: form.monto, onChange: e => setForm({ ...form, monto: e.target.value }), placeholder: '1000000' }),
        (form.tipo === 'nuevo_prestamo' || form.tipo === 'ampliacion') && React.createElement(Input, { label: 'Número de Cuotas', type: 'number', value: form.cuotas, onChange: e => setForm({ ...form, cuotas: e.target.value }), min: 1, placeholder: '12' }),
        form.tipo === 'nueva_compra' && React.createElement(Select, { label: 'Artículo',
          options: articulos.map(a => ({ value: a.id, label: a.nombre + ' - ' + formatCurrency(a.precio) })),
          value: form.articuloId, onChange: e => setForm({ ...form, articuloId: e.target.value })
        }),
        React.createElement(Input, { label: 'Mensaje', value: form.mensaje, onChange: e => setForm({ ...form, mensaje: e.target.value }), placeholder: 'Escriba su solicitud aquí...' }),
        React.createElement('div', { className: 'flex justify-end mt-6' },
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: sending }, sending ? 'Enviando...' : 'Enviar Solicitud')
        )
      )
    )
  );
}
