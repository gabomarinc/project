import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class NodemailerService {
  private static transporter: nodemailer.Transporter | null = null;

  // Initialize the transporter
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const gmailUser = import.meta.env.VITE_GMAIL_USER || 'plan@konsul.digital';
      const gmailPass = import.meta.env.VITE_GMAIL_PASS || 'O2wVvc&Rnv>4';
      
      console.log('📧 Gmail SMTP Config:', {
        user: gmailUser,
        pass: gmailPass ? '***' : 'NOT_SET'
      });
      
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      // Verify connection
      try {
        await this.transporter.verify();
        console.log('✅ SMTP connection verified successfully');
      } catch (error) {
        console.error('❌ SMTP connection failed:', error);
        throw error;
      }
    }

    return this.transporter;
  }

  // Send email
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Sending email via Nodemailer to:', emailData.to);
      
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: {
          name: 'Konsul Plan',
          address: 'plan@konsul.digital'
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  // Send credentials email
  static async sendCredentialsEmail(userEmail: string, password: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credenciales de Acceso</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #f59e0b); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .credentials-box { background: #f8f9fa; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .credential-item { margin: 15px 0; }
          .label { font-weight: 600; color: #374151; margin-bottom: 5px; }
          .value { font-family: 'Monaco', 'Menlo', monospace; background: #1f2937; color: #10b981; padding: 10px; border-radius: 4px; word-break: break-all; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981, #f59e0b); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 ¡Sesión Creada Exitosamente!</h1>
            <p>Tu dashboard de negocio está listo para usar</p>
          </div>
          
          <div class="content">
            <h2>¡Bienvenido a tu Dashboard de Negocio!</h2>
            <p>Tu sesión ha sido creada y activada automáticamente. Usa estas credenciales para acceder a tu dashboard completo:</p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <div class="label">📧 Email:</div>
                <div class="value">${userEmail}</div>
              </div>
              <div class="credential-item">
                <div class="label">🔑 Contraseña:</div>
                <div class="value">${password}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Esta contraseña no se puede recuperar. Guárdala en un lugar seguro para futuros accesos.
            </div>
            
            <div style="text-align: center;">
              <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://plan.konsul.digital'}" class="button">
                🚀 Acceder a mi Dashboard
              </a>
            </div>
            
            <h3>¿Qué puedes hacer ahora?</h3>
            <ul>
              <li>✅ Ver tu análisis completo de negocio</li>
              <li>✅ Acceder a herramientas recomendadas</li>
              <li>✅ Descargar tu plan de negocio en PDF</li>
              <li>✅ Compartir tu idea en redes sociales</li>
              <li>✅ Actualizar tu información cuando quieras</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Que tengas mucho éxito con tu proyecto! 🚀</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: '🔐 Tus Credenciales de Acceso - Dashboard de Negocio',
      html: html
    });
  }

  // Send payment success email
  static async sendPaymentSuccessEmail(userEmail: string, userName: string, password: string, dashboardId: string, idea: string): Promise<boolean> {
    const dashboardUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://plan.konsul.digital'}?preview=${dashboardId}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Pago Exitoso! Dashboard Listo</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #f59e0b); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
          .info-card { background: #f8f9fa; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-item { margin: 15px 0; display: flex; justify-content: space-between; align-items: center; }
          .label { font-weight: 600; color: #374151; }
          .value { font-family: 'Monaco', 'Menlo', monospace; background: #1f2937; color: #10b981; padding: 8px 12px; border-radius: 4px; word-break: break-all; }
          .dashboard-id { font-size: 18px; font-weight: bold; color: #1f2937; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .expiration { background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .idea-highlight { background: linear-gradient(135deg, #10b981, #f59e0b); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-badge">✅ PAGO EXITOSO</div>
            <h1>🎉 ¡Tu Dashboard está Listo!</h1>
            <p>Tu plan de negocio personalizado ha sido generado exitosamente</p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${userName}!</h2>
            <p>¡Excelente noticia! Tu pago ha sido procesado correctamente y tu dashboard de negocio está completamente listo para usar.</p>
            
            <div class="idea-highlight">
              <h3>💡 Tu Idea de Negocio:</h3>
              <p style="font-size: 18px; margin: 10px 0;"><strong>${idea}</strong></p>
            </div>
            
            <div class="info-card">
              <h3>🔐 Información de Acceso</h3>
              <div class="info-item">
                <span class="label">📧 Email:</span>
                <span class="value">${userEmail}</span>
              </div>
              <div class="info-item">
                <span class="label">🔑 Contraseña:</span>
                <span class="value">${password}</span>
              </div>
              <div class="info-item">
                <span class="label">🆔 ID del Dashboard:</span>
                <span class="dashboard-id">${dashboardId}</span>
              </div>
            </div>
            
            <div class="info-card">
              <h3>📅 Información del Proyecto</h3>
              <div class="info-item">
                <span class="label">📅 Fecha de Creación:</span>
                <span class="value">${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div class="info-item">
                <span class="label">⏰ Fecha de Caducidad:</span>
                <span class="value">${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Tu contraseña no se puede recuperar. Guárdala en un lugar seguro para futuros accesos.
            </div>
            
            <div class="expiration">
              <strong>⏰ Recordatorio:</strong> Tu dashboard estará disponible hasta el ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}. Asegúrate de descargar tu plan de negocio en PDF antes de esa fecha.
            </div>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">
                🚀 Acceder a mi Dashboard
              </a>
            </div>
            
            <h3>¿Qué puedes hacer ahora?</h3>
            <ul>
              <li>✅ Ver tu análisis completo de negocio generado por IA</li>
              <li>✅ Acceder a herramientas recomendadas personalizadas</li>
              <li>✅ Descargar tu plan de negocio en PDF</li>
              <li>✅ Seguir tu plan de acción paso a paso</li>
              <li>✅ Actualizar tu información cuando quieras</li>
              <li>✅ Compartir tu idea en redes sociales</li>
            </ul>
            
            <h3>📞 ¿Necesitas Ayuda?</h3>
            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos. Estamos aquí para ayudarte a hacer crecer tu negocio.</p>
          </div>
          
          <div class="footer">
            <p>¡Gracias por confiar en Konsul Plan para tu proyecto de negocio!</p>
            <p>¡Que tengas mucho éxito con tu emprendimiento! 🚀</p>
            <p><small>Este email fue enviado automáticamente. Por favor, no respondas a este correo.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: '🎉 ¡Pago Exitoso! Tu Dashboard de Negocio está Listo',
      html: html
    });
  }
}
