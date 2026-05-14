export function calcularCuota(monto, tasaAnual, cuotas) {
  if (!monto || !cuotas) return 0;
  if (!tasaAnual || tasaAnual === 0) return Math.round((monto / cuotas) * 100) / 100;
  const r = tasaAnual / 12 / 100;
  const cuota = monto * (r * Math.pow(1 + r, cuotas)) / (Math.pow(1 + r, cuotas) - 1);
  return Math.round(cuota * 100) / 100;
}

export function calcularInteresTotal(monto, tasaAnual, cuotas) {
  const cuotaMensual = calcularCuota(monto, tasaAnual, cuotas);
  return Math.round((cuotaMensual * cuotas - monto) * 100) / 100;
}

