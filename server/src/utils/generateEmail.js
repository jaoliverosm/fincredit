/**
 * Genera un email automatico a partir del nombre completo
 * "Jefersson Aldair Oliveros Monroy" -> "jaoliverosm@fincredit.com"
 */
export function generateEmail(nombre) {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const firstName = parts[0];
  const secondName = parts.length > 2 ? parts[1] : '';
  const firstSurname = parts[parts.length - 2];
  const secondSurname = parts[parts.length - 1];

  const prefix = firstName.slice(0, 2).toLowerCase() +
    (secondName ? secondName.slice(0, 2).toLowerCase() : '') +
    firstSurname.toLowerCase() +
    secondSurname.charAt(0).toLowerCase();

  return prefix + '@fincredit.com';
}

/**
 * Genera contraseña basada en cédula + primera letra del primer apellido
 * "1234567890" + "Oliveros" -> "1234567890o"
 */
export function generatePassword(cedula, nombre) {
  if (!cedula) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let pass = 'FinCredit';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }
  const parts = nombre.trim().split(/\s+/);
  const firstSurname = parts.length >= 2 ? parts[parts.length - 2] : '';
  return cedula + firstSurname.charAt(0).toLowerCase();
}
