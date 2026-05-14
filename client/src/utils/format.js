export function formatCurrency(valor) {
  if (valor === null || valor === undefined) return '0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor);
}

export function formatEstado(estado) {
  const map = {
    activo: 'Activo', mora: 'En Mora', pagado: 'Pagado',
    inactivo: 'Inactivo', pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado'
  };
  return map[estado] || estado;
}

export function estadoColor(estado) {
  const map = {
    activo: 'bg-green-100 text-green-800',
    mora: 'bg-red-100 text-red-800',
    pagado: 'bg-blue-100 text-blue-800',
    inactivo: 'bg-gray-100 text-gray-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    aprobado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800'
  };
  return map[estado] || 'bg-gray-100 text-gray-800';
}