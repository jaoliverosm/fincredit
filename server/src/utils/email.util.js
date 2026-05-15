import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  if (!host) return null;

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });

  return transporter;
}

export async function sendPasswordResetEmail(to, token) {
  const transporter = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = frontendUrl + '/reset-password/' + token;

  if (!transporter) {
    console.log('=== PASSWORD RESET (SMTP not configured) ===');
    console.log('To:', to);
    console.log('Token:', token);
    console.log('Reset link:', resetLink);
    console.log('===========================================');
    return { sent: false, token, resetLink };
  }

  try {
    await transporter.sendMail({
      from: '"FinCredit" <' + (process.env.SMTP_USER || 'noreply@fincredit.com') + '>',
      to,
      subject: 'Recuperación de contraseña - FinCredit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #00236f; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">FinCredit</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <p style="color: #1a1b21; font-size: 16px;">Has solicitado restablecer tu contraseña.</p>
            <p style="color: #444651; font-size: 14px;">Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="background: #00236f; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #757682; font-size: 12px;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        </div>
      `
    });
    return { sent: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { sent: false, error: error.message, token, resetLink };
  }
}
