import { EMAIL_CONFIG, getActiveEmailProvider, EmailProvider } from '../config/email';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface FollowUpEmailData {
  userEmail: string;
  userName: string;
  idea: string;
  projectType: string;
  completedSteps: number;
  totalSteps: number;
  nextStep?: string;
  projectDetails: {
    problem: string;
    idealUser: string;
    region: string;
    alternatives: string;
    businessModel: string;
  };
}

export interface CredentialsEmailData {
  userEmail: string;
  password: string;
}

export interface PaymentSuccessEmailData {
  userEmail: string;
  userName: string;
  dashboardId: string;
  password: string;
  idea: string;
  creationDate: string;
  expirationDate: string;
}

export class EmailService {
  // Send credentials email
  static async sendCredentialsEmail(userEmail: string, password: string): Promise<boolean> {
    try {
      console.log('📧 Sending credentials email to:', userEmail);
      
      // Create email content
      const emailContent = this.createCredentialsEmailContent({ userEmail, password });
      
      // Send email using the active provider
      const success = await this.sendEmailViaService({
        to: userEmail,
        subject: '🔐 Tus Credenciales de Acceso - Dashboard de Negocio',
        html: emailContent.html,
        text: emailContent.text
      });
      
      if (success) {
        console.log('✅ Credentials email sent successfully to:', userEmail);
        return true;
      } else {
        console.error('❌ Failed to send credentials email to:', userEmail);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending credentials email:', error);
      return false;
    }
  }

  // Send payment success confirmation email
  static async sendPaymentSuccessEmail(emailData: PaymentSuccessEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending payment success email to:', emailData.userEmail);
      
      // Create email content
      const emailContent = this.createPaymentSuccessEmailContent(emailData);
      
      // Send email using the active provider
      const success = await this.sendEmailViaService({
        to: emailData.userEmail,
        subject: '🎉 ¡Pago Exitoso! Tu Dashboard de Negocio está Listo',
        html: emailContent.html,
        text: emailContent.text
      });
      
      if (success) {
        console.log('✅ Payment success email sent successfully to:', emailData.userEmail);
        return true;
      } else {
        console.error('❌ Failed to send payment success email to:', emailData.userEmail);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending payment success email:', error);
      return false;
    }
  }

  // Send follow-up email for action plan
  static async sendFollowUpEmail(emailData: FollowUpEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending follow-up email to:', emailData.userEmail);
      
      // Create email content
      const emailContent = this.createFollowUpEmailContent(emailData);
      
      // Send email using the active provider
      const success = await this.sendEmailViaService({
        to: emailData.userEmail,
        subject: `🚀 Seguimiento de tu Plan de Acción: ${emailData.idea}`,
        html: emailContent.html,
        text: emailContent.text
      });
      
      if (success) {
        console.log('✅ Follow-up email sent successfully to:', emailData.userEmail);
        return true;
      } else {
        console.error('❌ Failed to send follow-up email to:', emailData.userEmail);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending follow-up email:', error);
      return false;
    }
  }
  
  // Create HTML content for follow-up email
  private static createFollowUpEmailContent(data: FollowUpEmailData): { html: string; text: string } {
    const progressPercentage = Math.round((data.completedSteps / data.totalSteps) * 100);
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seguimiento de tu Plan de Acción</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: linear-gradient(90deg, #10b981, #f59e0b); height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
          .next-step { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Tu Plan de Acción</h1>
            <p>Progreso y próximos pasos para: ${data.idea}</p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${data.userName}!</h2>
            <p>Esperamos que tu plan de acción esté progresando bien. Aquí tienes un resumen de tu progreso:</p>
            
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #10b981;">
              ${data.completedSteps} de ${data.totalSteps} pasos completados (${progressPercentage}%)
            </p>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${data.completedSteps}</div>
                <div>Pasos Completados</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.totalSteps - data.completedSteps}</div>
                <div>Pasos Restantes</div>
              </div>
            </div>
            
            ${data.nextStep ? `
              <div class="next-step">
                <h3>🎯 Próximo Paso Recomendado:</h3>
                <p><strong>${data.nextStep}</strong></p>
                <p>Este es el siguiente paso lógico en tu plan de acción. Enfócate en completarlo antes de pasar al siguiente.</p>
              </div>
            ` : ''}
            
            <h3>📋 Detalles de tu Proyecto:</h3>
            <ul>
              <li><strong>Idea:</strong> ${data.idea}</li>
              <li><strong>Tipo:</strong> ${data.projectType}</li>
              <li><strong>Problema:</strong> ${data.projectDetails.problem}</li>
              <li><strong>Usuario Ideal:</strong> ${data.projectDetails.idealUser}</li>
              <li><strong>Región:</strong> ${data.projectDetails.region}</li>
              <li><strong>Alternativas:</strong> ${data.projectDetails.alternatives}</li>
              <li><strong>Modelo de Negocio:</strong> ${data.projectDetails.businessModel}</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${window.location.origin}/dashboard" class="cta-button">
                📊 Ver Dashboard Completo
              </a>
            </div>
            
            <div class="footer">
              <p>Este email fue generado automáticamente por Konsul Plan</p>
              <p>Si tienes preguntas, responde a este email</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      SEGUIMIENTO DE TU PLAN DE ACCIÓN - ${data.idea}
      
      ¡Hola ${data.userName}!
      
      Tu progreso actual: ${data.completedSteps} de ${data.totalSteps} pasos completados (${progressPercentage}%)
      
      ${data.nextStep ? `Próximo paso recomendado: ${data.nextStep}` : ''}
      
      Detalles del proyecto:
      - Idea: ${data.idea}
      - Tipo: ${data.projectType}
      - Problema: ${data.projectDetails.problem}
      - Usuario Ideal: ${data.projectDetails.idealUser}
      - Región: ${data.projectDetails.region}
      - Alternativas: ${data.projectDetails.alternatives}
      - Modelo de Negocio: ${data.projectDetails.businessModel}
      
      Para ver tu dashboard completo, visita: ${window.location.origin}/dashboard
      
      Saludos,
      El equipo de Konsul Plan
    `;
    
    return { html, text };
  }

  // Create HTML content for credentials email
  private static createCredentialsEmailContent(data: CredentialsEmailData): { html: string; text: string } {
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
                <div class="value">${data.userEmail}</div>
              </div>
              <div class="credential-item">
                <div class="label">🔑 Contraseña:</div>
                <div class="value">${data.password}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Esta contraseña no se puede recuperar. Guárdala en un lugar seguro para futuros accesos.
            </div>
            
            <div style="text-align: center;">
              <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}" class="button">
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
    
    const text = `
      ¡Sesión Creada Exitosamente!
      
      Tu dashboard de negocio está listo para usar.
      
      Credenciales de acceso:
      Email: ${data.userEmail}
      Contraseña: ${data.password}
      
      IMPORTANTE: Esta contraseña no se puede recuperar. Guárdala en un lugar seguro.
      
      Para acceder a tu dashboard, visita: ${typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}
      
      ¿Qué puedes hacer ahora?
      - Ver tu análisis completo de negocio
      - Acceder a herramientas recomendadas
      - Descargar tu plan de negocio en PDF
      - Compartir tu idea en redes sociales
      - Actualizar tu información cuando quieras
      
      ¡Que tengas mucho éxito con tu proyecto! 🚀
      
      Saludos,
      El equipo de Konsul Plan
    `;
    
    return { html, text };
  }

  // Create HTML content for payment success email
  private static createPaymentSuccessEmailContent(data: PaymentSuccessEmailData): { html: string; text: string } {
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
            <h2>¡Hola {{userName}}!</h2>
            <p>¡Excelente noticia! Tu pago ha sido procesado correctamente y tu dashboard de negocio está completamente listo para usar.</p>
            
            <div class="idea-highlight">
              <h3>💡 Tu Idea de Negocio:</h3>
              <p style="font-size: 18px; margin: 10px 0;"><strong>{{idea}}</strong></p>
            </div>
            
            <div class="info-card">
              <h3>🔐 Información de Acceso</h3>
              <div class="info-item">
                <span class="label">📧 Email:</span>
                <span class="value">{{userEmail}}</span>
              </div>
              <div class="info-item">
                <span class="label">🔑 Contraseña:</span>
                <span class="value">{{password}}</span>
              </div>
              <div class="info-item">
                <span class="label">🆔 ID del Dashboard:</span>
                <span class="dashboard-id">{{dashboardId}}</span>
              </div>
            </div>
            
            <div class="info-card">
              <h3>📅 Información del Proyecto</h3>
              <div class="info-item">
                <span class="label">📅 Fecha de Creación:</span>
                <span class="value">{{creationDate}}</span>
              </div>
              <div class="info-item">
                <span class="label">⏰ Fecha de Caducidad:</span>
                <span class="value">{{expirationDate}}</span>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Tu contraseña no se puede recuperar. Guárdala en un lugar seguro para futuros accesos.
            </div>
            
            <div class="expiration">
              <strong>⏰ Recordatorio:</strong> Tu dashboard estará disponible hasta el {{expirationDate}}. Asegúrate de descargar tu plan de negocio en PDF antes de esa fecha.
            </div>
            
            <div style="text-align: center;">
              <a href="{{dashboardUrl}}" class="button">
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
    
    const text = `
      ¡PAGO EXITOSO! TU DASHBOARD ESTÁ LISTO
      
      ¡Hola {{userName}}!
      
      ¡Excelente noticia! Tu pago ha sido procesado correctamente y tu dashboard de negocio está completamente listo para usar.
      
      TU IDEA DE NEGOCIO: {{idea}}
      
      INFORMACIÓN DE ACCESO:
      Email: {{userEmail}}
      Contraseña: {{password}}
      ID del Dashboard: {{dashboardId}}
      
      INFORMACIÓN DEL PROYECTO:
      Fecha de Creación: {{creationDate}}
      Fecha de Caducidad: {{expirationDate}}
      
      IMPORTANTE: Tu contraseña no se puede recuperar. Guárdala en un lugar seguro.
      
      RECORDATORIO: Tu dashboard estará disponible hasta el {{expirationDate}}. Asegúrate de descargar tu plan de negocio en PDF antes de esa fecha.
      
      Para acceder a tu dashboard, visita: {{dashboardUrl}}
      
      ¿QUÉ PUEDES HACER AHORA?
      - Ver tu análisis completo de negocio generado por IA
      - Acceder a herramientas recomendadas personalizadas
      - Descargar tu plan de negocio en PDF
      - Seguir tu plan de acción paso a paso
      - Actualizar tu información cuando quieras
      - Compartir tu idea en redes sociales
      
      ¿NECESITAS AYUDA?
      Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
      
      ¡Gracias por confiar en Konsul Plan para tu proyecto de negocio!
      ¡Que tengas mucho éxito con tu emprendimiento! 🚀
      
      Saludos,
      El equipo de Konsul Plan
    `;
    
    return { html, text };
  }
  
  // Send email via external service (EmailJS, SendGrid, etc.)
  private static async sendEmailViaService(emailData: EmailData): Promise<boolean> {
    try {
      const activeProvider = getActiveEmailProvider();
      console.log(`📧 Using email provider: ${activeProvider}`);
      
      switch (activeProvider) {
        case EmailProvider.EMAILJS:
          return await this.sendViaEmailJS(emailData);
        case EmailProvider.SENDGRID:
          return await this.sendViaSendGrid(emailData);
        case EmailProvider.AWS_SES:
          return await this.sendViaAWSSES(emailData);
        case EmailProvider.MOCK:
        default:
          return await this.sendViaMock(emailData);
      }
      
    } catch (error) {
      console.error('❌ Error in email service:', error);
      return false;
    }
  }
  
  // Send via EmailJS
  private static async sendViaEmailJS(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Sending via EmailJS to:', emailData.to);
      
      // Extract template parameters from HTML content
      const templateParams = this.extractTemplateParams(emailData.html);
      
      const response = await fetch(EMAIL_CONFIG.EMAILJS.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAIL_CONFIG.EMAILJS.SERVICE_ID,
          template_id: EMAIL_CONFIG.EMAILJS.TEMPLATE_ID,
          user_id: EMAIL_CONFIG.EMAILJS.USER_ID,
          template_params: {
            to_email: emailData.to,
            subject: emailData.subject,
            ...templateParams
          }
        })
      });
      
      if (response.ok) {
        console.log('✅ EmailJS email sent successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ EmailJS failed:', response.status, response.statusText, errorText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ EmailJS error:', error);
      return false;
    }
  }

  // Extract template parameters from HTML content
  private static extractTemplateParams(html: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    // For now, return empty params - EmailJS will use the template
    return params;
  }
  
  // Send via SendGrid
  private static async sendViaSendGrid(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Sending via SendGrid to:', emailData.to);
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EMAIL_CONFIG.SENDGRID.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: emailData.to }]
            }
          ],
          from: {
            email: EMAIL_CONFIG.SENDGRID.FROM_EMAIL,
            name: EMAIL_CONFIG.SENDGRID.FROM_NAME
          },
          subject: emailData.subject,
          content: [
            {
              type: 'text/html',
              value: emailData.html
            },
            {
              type: 'text/plain',
              value: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
            }
          ]
        })
      });
      
      if (response.ok) {
        console.log('✅ SendGrid email sent successfully');
        return true;
      } else {
        console.error('❌ SendGrid failed:', response.status, response.statusText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      return false;
    }
  }
  
  // Send via AWS SES
  private static async sendViaAWSSES(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Sending via AWS SES to:', emailData.to);
      
      // This would require AWS SDK integration
      // For now, we'll simulate it
      console.log('⚠️ AWS SES integration not yet implemented');
      return false;
      
    } catch (error) {
      console.error('❌ AWS SES error:', error);
      return false;
    }
  }
  
  // Send via Mock (for development/testing)
  private static async sendViaMock(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Simulating email send to:', emailData.to);
      console.log('📧 Subject:', emailData.subject);
      console.log('📧 Content length:', emailData.html.length);
      console.log('📧 Provider: Mock (development mode)');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log email content for debugging
      console.log('📧 Email content preview:', emailData.html.substring(0, 200) + '...');
      
      // For development, return true to simulate success
      return true;
      
    } catch (error) {
      console.error('❌ Mock email error:', error);
      return false;
    }
  }
  
  // Send feedback request emails
  static async sendFeedbackEmails(emails: string[], projectData: {
    idea: string;
    projectType: string;
    region: string;
  }): Promise<boolean> {
    try {
      console.log('📧 Sending feedback request emails to:', emails);
      
      const results = await Promise.all(
        emails.map(email => 
          this.sendFeedbackEmail(email, projectData)
        )
      );
      
      const successCount = results.filter(Boolean).length;
      console.log(`✅ Sent ${successCount} feedback emails successfully`);
      
      return successCount > 0;
      
    } catch (error) {
      console.error('❌ Error sending feedback emails:', error);
      return false;
    }
  }
  
  // Send individual feedback request email
  private static async sendFeedbackEmail(email: string, projectData: {
    idea: string;
    projectType: string;
    region: string;
  }): Promise<boolean> {
    try {
      const emailContent = this.createFeedbackEmailContent(email, projectData);
      
      return await this.sendEmailViaService({
        to: email,
        subject: `🤔 ¿Podrías darme feedback sobre mi idea de negocio?`,
        html: emailContent.html,
        text: emailContent.text
      });
      
    } catch (error) {
      console.error('❌ Error sending feedback email to:', email, error);
      return false;
    }
  }
  
  // Create feedback email content
  private static createFeedbackEmailContent(email: string, projectData: {
    idea: string;
    projectType: string;
    region: string;
  }): { html: string; text: string } {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud de Feedback</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .idea-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤔 Solicitud de Feedback</h1>
            <p>Tu opinión es valiosa para mí</p>
          </div>
          
          <div class="content">
            <h2>¡Hola!</h2>
            <p>Espero que estés bien. Estoy trabajando en una nueva idea de negocio y me encantaría conocer tu perspectiva.</p>
            
            <div class="idea-card">
              <h3>💡 Mi Idea:</h3>
              <p><strong>${projectData.idea}</strong></p>
              <p><strong>Tipo de Proyecto:</strong> ${projectData.projectType}</p>
              <p><strong>Región de Enfoque:</strong> ${projectData.region}</p>
            </div>
            
            <p>¿Podrías dedicarme unos minutos para darme tu feedback honesto?</p>
            
            <p>Me interesa saber:</p>
            <ul>
              <li>¿Qué opinas de la idea?</li>
              <li>¿Ves algún problema o área de mejora?</li>
              <li>¿Conoces a alguien que podría estar interesado?</li>
              <li>¿Tienes alguna sugerencia o consejo?</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="mailto:${email}?subject=Feedback sobre: ${projectData.idea}" class="cta-button">
                📧 Responder con Feedback
              </a>
            </div>
            
            <p>Gracias por tu tiempo y consideración. Tu feedback puede hacer una gran diferencia en el desarrollo de esta idea.</p>
            
            <p>Saludos cordiales,<br>Un emprendedor en busca de feedback</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      SOLICITUD DE FEEDBACK
      
      ¡Hola!
      
      Estoy trabajando en una nueva idea de negocio y me encantaría conocer tu perspectiva.
      
      MI IDEA: ${projectData.idea}
      Tipo de Proyecto: ${projectData.projectType}
      Región de Enfoque: ${projectData.region}
      
      ¿Podrías dedicarme unos minutos para darme tu feedback honesto?
      
      Me interesa saber:
      - ¿Qué opinas de la idea?
      - ¿Ves algún problema o área de mejora?
      - ¿Conoces a alguien que podría estar interesado?
      - ¿Tienes alguna sugerencia o consejo?
      
      Para responder, simplemente responde a este email.
      
      Gracias por tu tiempo y consideración.
      
      Saludos cordiales,
      Un emprendedor en busca de feedback
    `;
    
    return { html, text };
  }
}