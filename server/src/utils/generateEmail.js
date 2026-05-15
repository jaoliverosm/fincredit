/**
 * Genera un email automatico a partir del nombre completo
 * "Jefersson Aldair Oliveros Monroy" -> "jaoliverosm@fincredit.com"
 */
export function generateEmail(nombre) {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const firstName = parts[0];
  const firstSurname = parts[parts.length - 2];
  const secondSurname = parts[parts.length - 1];

  const prefix = firstName.slice(0, 2).toLowerCase() +
    firstSurname.toLowerCase() +
    secondSurname.charAt(0).toLowerCase();

  return prefix + '@fincredit.com';
}

export function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let pass = 'Empleado';
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
