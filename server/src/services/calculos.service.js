/**
 * Servicio de Cálculos Financieros
 * Contiene las fórmulas y lógica para cálculos de préstamos, intereses y mora
 */

/**
 * Calcula la cuota mensual usando la fórmula de amortización francesa
 * @param {number} monto - Monto total del préstamo
 * @param {number} tasaAnual - Tasa de interés anual (en porcentaje, ej: 15 para 15%)
 * @param {number} cuotas - Número de cuotas
 * @returns {number} Cuota mensual calculada
 */
const calcularCuotaMensual = (monto, tasaAnual, cuotas) => {
  if (cuotas <= 0) return 0;
  if (tasaAnual <= 0) return monto / cuotas;
  
  // Convertir tasa anual a tasa mensual
  const tasaMensual = tasaAnual / 12 / 100;
  
  // Fórmula de amortización francesa
  // cuota = monto × [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + tasaMensual, cuotas);
  const cuota = monto * (tasaMensual * factor) / (factor - 1);
  
  // Redondear a 2 decimales
  return Math.round(cuota * 100) / 100;
};

/**
 * Calcula el total a pagar de un préstamo
 * @param {number} cuotaMensual - Cuota mensual
 * @param {number} cuotas - Número de cuotas
 * @returns {number} Total a pagar
 */
const calcularTotalPagar = (cuotaMensual, cuotas) => {
  return Math.round(cuotaMensual * cuotas * 100) / 100;
};

/**
 * Calcula el total de intereses de un préstamo
 * @param {number} totalPagar - Total a pagar
 * @param {number} monto - Monto original del préstamo
 * @returns {number} Total de intereses
 */
const calcularTotalIntereses = (totalPagar, monto) => {
  return Math.round((totalPagar - monto) * 100) / 100;
};

/**
 * Calcula la fecha de vencimiento de un préstamo
 * @param {Date} fechaInicio - Fecha de inicio del préstamo
 * @param {number} cuotas - Número de cuotas
 * @returns {Date} Fecha de vencimiento
 */
const calcularFechaVencimiento = (fechaInicio, cuotas) => {
  const fecha = new Date(fechaInicio);
  fecha.setMonth(fecha.getMonth() + cuotas);
  return fecha;
};

/**
 * Calcula el monto de mora por día de retraso
 * @param {number} cuotaMensual - Cuota mensual
 * @param {number} tasaMora - Tasa de mora anual (en porcentaje)
 * @param {number} diasRetraso - Días de retraso
 * @returns {number} Monto de mora
 */
const calcularMoraDiaria = (cuotaMensual, tasaMora, diasRetraso) => {
  if (diasRetraso <= 0) return 0;
  
  // Tasa de mora diaria = tasaMora / 365 / 100
  const tasaMoraDiaria = tasaMora / 365 / 100;
  const mora = cuotaMensual * tasaMoraDiaria * diasRetraso;
  
  return Math.round(mora * 100) / 100;
};

/**
 * Genera tabla de amortización de un préstamo
 * @param {number} monto - Monto del préstamo
 * @param {number} tasaAnual - Tasa de interés anual
 * @param {number} cuotas - Número de cuotas
 * @param {Date} fechaInicio - Fecha de inicio
 * @returns {Array} Tabla de amortización
 */
const generarTablaAmortizacion = (monto, tasaAnual, cuotas, fechaInicio) => {
  const tabla = [];
  const cuotaMensual = calcularCuotaMensual(monto, tasaAnual, cuotas);
  const tasaMensual = tasaAnual / 12 / 100;
  
  let saldo = monto;
  let fechaActual = new Date(fechaInicio);
  
  for (let i = 1; i <= cuotas; i++) {
    const interes = Math.round(saldo * tasaMensual * 100) / 100;
    const capital = Math.round((cuotaMensual - interes) * 100) / 100;
    saldo = Math.round((saldo - capital) * 100) / 100;
    
    // Calcular fecha de vencimiento de esta cuota
    const fechaCuota = new Date(fechaActual);
    fechaCuota.setMonth(fechaCuota.getMonth() + i);
    
    tabla.push({
      numeroCuota: i,
      fechaVencimiento: fechaCuota,
      cuota: cuotaMensual,
      capital: capital,
      interes: interes,
      saldo: saldo <= 0 ? 0 : saldo,
      pagado: false,
      fechaPago: null
    });
  }
  
  return tabla;
};

/**
 * Verifica si un préstamo o venta está en mora
 * @param {Date} fechaVencimiento - Fecha de vencimiento
 * @param {number} pagado - Monto pagado
 * @param {number} total - Total a pagar
 * @returns {boolean} True si está en mora
 */
const estaEnMora = (fechaVencimiento, pagado, total) => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  
  return hoy > vencimiento && pagado < total;
};

/**
 * Calcula los días de retraso
 * @param {Date} fechaVencimiento - Fecha de vencimiento
 * @returns {number} Días de retraso
 */
const calcularDiasRetraso = (fechaVencimiento) => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  
  if (hoy <= vencimiento) return 0;
  
  const diffTime = Math.abs(hoy - vencimiento);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calcula el precio total de una venta a crédito
 * @param {number} precioUnitario - Precio unitario del artículo
 * @param {number} cantidad - Cantidad de artículos
 * @param {number} interes - Interés aplicado (en porcentaje)
 * @returns {Object} Objeto con precio total y detalles
 */
const calcularPrecioVentaCredito = (precioUnitario, cantidad, interes) => {
  const subtotal = precioUnitario * cantidad;
  const valorInteres = Math.round(subtotal * (interes / 100) * 100) / 100;
  const total = Math.round((subtotal + valorInteres) * 100) / 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    valorInteres,
    total,
    precioUnitarioConInteres: Math.round((precioUnitario * (1 + interes / 100)) * 100) / 100
  };
};

/**
 * Valida si un préstamo cumple con las políticas de la empresa
 * @param {number} monto - Monto solicitado
 * @param {number} cuotas - Cuotas solicitadas
 * @param {Object} configuracion - Configuración de la empresa
 * @returns {Object} Resultado de la validación
 */
const validarPoliticasPrestamo = (monto, cuotas, configuracion) => {
  const errores = [];
  
  if (monto < configuracion.montoMinPrestamo) {
    errores.push(`El monto mínimo es de $${configuracion.montoMinPrestamo.toLocaleString()}`);
  }
  
  if (monto > configuracion.montoMaxPrestamo) {
    errores.push(`El monto máximo es de $${configuracion.montoMaxPrestamo.toLocaleString()}`);
  }
  
  if (cuotas < configuracion.cuotasMin) {
    errores.push(`El mínimo de cuotas es ${configuracion.cuotasMin}`);
  }
  
  if (cuotas > configuracion.cuotasMax) {
    errores.push(`El máximo de cuotas es ${configuracion.cuotasMax}`);
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

export {
  calcularCuotaMensual,
  calcularTotalPagar,
  calcularTotalIntereses,
  calcularFechaVencimiento,
  calcularMoraDiaria,
  generarTablaAmortizacion,
  estaEnMora,
  calcularDiasRetraso,
  calcularPrecioVentaCredito,
  validarPoliticasPrestamo
};
