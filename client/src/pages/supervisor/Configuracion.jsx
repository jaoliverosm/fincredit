import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

export default function ConfiguracionPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/config');
      setConfig(res.data.config);
    } catch (err) { setError('Error cargando configuración'); toast.error('Error cargando configuración'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/config', config);
      setConfig(res.data.config);
      toast.success('Configuración guardada');
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await api.post('/config/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setConfig(prev => ({ ...prev, logoUrl: res.data.logoUrl }));
      toast.success('Logo actualizado');
    } catch (err) { toast.error('Error al subir logo'); }
    finally { setUploading(false); }
  };

  if (loading) return React.createElement(LoadingSpinner);
  if (error) return React.createElement('div', { role: 'alert', className: 'bg-red-50 text-red-600 p-4 rounded-lg' }, error);
  if (!config) return React.createElement('p', { className: 'text-gray-500 text-center py-8' }, 'No hay configuración disponible');

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-2xl font-bold' }, 'Configuración'),
    React.createElement(Card, null,
      React.createElement('form', { className: 'space-y-4', onSubmit: e => { e.preventDefault(); handleSave(); } },
        // Logo section
        React.createElement('div', { className: 'flex items-center gap-6 p-4 bg-gray-50 rounded-lg' },
          React.createElement('div', { className: 'w-20 h-20 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden' },
            config.logoUrl
              ? React.createElement('img', { src: API_URL + config.logoUrl, alt: 'Logo', className: 'w-full h-full object-contain' })
              : React.createElement('span', { className: 'text-2xl font-bold text-gray-400' }, '?')
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium text-sm text-gray-700' }, 'Logo de la empresa'),
            React.createElement('p', { className: 'text-xs text-gray-500 mb-2' }, 'PNG, JPG o SVG. Máx 2MB.'),
            React.createElement('label', { className: 'cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition inline-block' },
              uploading ? 'Subiendo...' : 'Seleccionar archivo',
              React.createElement('input', { type: 'file', accept: 'image/png,image/jpeg,image/svg+xml,image/webp', onChange: handleLogoUpload, className: 'hidden', disabled: uploading })
            )
          )
        ),
        React.createElement(Input, { label: 'Nombre de Empresa', value: config.nombreEmpresa, onChange: e => setConfig({ ...config, nombreEmpresa: e.target.value }) }),
        React.createElement(Input, { label: 'Moneda', value: config.moneda, onChange: e => setConfig({ ...config, moneda: e.target.value }), maxLength: 3 }),
        React.createElement(Input, { label: 'Tasa de Interés por Defecto (%)', type: 'number', step: '0.1', value: config.tasaDefault, onChange: e => setConfig({ ...config, tasaDefault: parseFloat(e.target.value) || 0 }) }),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(Input, { label: 'Cuotas Mínimas', type: 'number', value: config.cuotasMin, onChange: e => setConfig({ ...config, cuotasMin: parseInt(e.target.value) || 1 }) }),
          React.createElement(Input, { label: 'Cuotas Máximas', type: 'number', value: config.cuotasMax, onChange: e => setConfig({ ...config, cuotasMax: parseInt(e.target.value) || 36 }) })
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(Input, { label: 'Monto Mínimo Préstamo (COP)', type: 'number', value: config.montoMinPrestamo, onChange: e => setConfig({ ...config, montoMinPrestamo: parseFloat(e.target.value) || 0 }) }),
          React.createElement(Input, { label: 'Monto Máximo Préstamo (COP)', type: 'number', value: config.montoMaxPrestamo, onChange: e => setConfig({ ...config, montoMaxPrestamo: parseFloat(e.target.value) || 0 }) })
        ),
        React.createElement('div', { className: 'flex justify-end mt-6' },
          React.createElement(Button, { type: 'submit', variant: 'primary', disabled: saving }, saving ? 'Guardando...' : 'Guardar Configuración')
        )
      )
    )
  );
}
