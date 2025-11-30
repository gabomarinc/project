// Servicio para programar emails de recordatorio del plan de acción
// Envía emails 1 día antes del vencimiento de cada paso

import { EMAIL_CONFIG } from '../config/email';
import { getDeadlineInfo } from '../utils/deadlineUtils';

export interface ActionPlanStepEmailData {
  userEmail: string;
  userName: string;
  idea: string;
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  dueDate: string; // YYYY-MM-DD format
  dashboardUrl?: string;
}

export interface ScheduledEmail {
  stepNumber: number;
  scheduledTime: number; // timestamp
  emailData: ActionPlanStepEmailData;
  timeoutId?: NodeJS.Timeout;
}

class ActionPlanEmailScheduler {
  private scheduledEmails: Map<number, ScheduledEmail> = new Map();
  private templateId: string = '';

  /**
   * Configura el template ID de EmailJS para los emails del plan de acción
   */
  setTemplateId(templateId: string): void {
    // IMPORTANT: In Vite, only variables with VITE_ prefix are exposed to the frontend
    // The variable must be named VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID in Vercel
    const envTemplateId = import.meta.env.VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID || 
                         EMAIL_CONFIG.EMAILJS.ACTION_PLAN_TEMPLATE_ID;
    
    this.templateId = templateId || envTemplateId;
    
    if (this.templateId) {
      console.log('📧 Action Plan Email Template ID configured:', this.templateId);
      console.log('🔑 Template ID source:', 
        templateId ? 'Parameter' :
        import.meta.env.VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID ? 'VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID (Environment Variable) ✅' :
        'EMAIL_CONFIG (from config/email.ts)'
      );
    } else {
      console.warn('⚠️ Action Plan Email Template ID not configured');
      console.warn('💡 IMPORTANT: In Vercel, the variable MUST be named: VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID');
      console.warn('💡 Variables without VITE_ prefix are NOT available in the frontend');
      console.warn('💡 Go to Vercel → Settings → Environment Variables');
      console.warn('💡 Add/Update: VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID = template_m8c3dj8');
    }
  }

  /**
   * Calcula la fecha de envío (1 día antes del vencimiento)
   */
  private calculateSendDate(dueDate: string): Date {
    const due = new Date(dueDate);
    const sendDate = new Date(due);
    sendDate.setDate(due.getDate() - 1); // 1 día antes
    return sendDate;
  }

  /**
   * Programa un email para un paso específico
   */
  scheduleStepEmail(emailData: ActionPlanStepEmailData): void {
    if (!this.templateId) {
      console.warn('⚠️ Action Plan Email Template ID not configured. Email will not be sent.');
      return;
    }

    const sendDate = this.calculateSendDate(emailData.dueDate);
    const now = new Date();
    const timeUntilSend = sendDate.getTime() - now.getTime();

    // Si la fecha de envío ya pasó, no programar
    if (timeUntilSend <= 0) {
      console.log(`⏰ Step ${emailData.stepNumber} email send date has passed. Skipping.`);
      return;
    }

    // Si ya hay un email programado para este paso, cancelarlo primero
    this.cancelStepEmail(emailData.stepNumber);

    const scheduledEmail: ScheduledEmail = {
      stepNumber: emailData.stepNumber,
      scheduledTime: sendDate.getTime(),
      emailData
    };

    // Programar el envío
    const timeoutId = setTimeout(() => {
      this.sendStepEmail(emailData);
      this.scheduledEmails.delete(emailData.stepNumber);
    }, timeUntilSend);

    scheduledEmail.timeoutId = timeoutId;
    this.scheduledEmails.set(emailData.stepNumber, scheduledEmail);

    console.log(`📅 Email scheduled for step ${emailData.stepNumber} on ${sendDate.toLocaleString()}`);
  }

  /**
   * Programa emails para todos los pasos del plan de acción
   * Ahora guarda los emails en Airtable para que se envíen desde el servidor
   */
  async scheduleAllStepEmails(
    userEmail: string,
    userName: string,
    idea: string,
    actionPlanSteps: string[],
    deadlines: string[],
    dashboardUrl?: string,
    dashboardId?: string
  ): Promise<void> {
    if (!this.templateId) {
      console.warn('⚠️ Action Plan Email Template ID not configured. Emails will not be scheduled.');
      return;
    }

    console.log(`📧 Scheduling emails for ${actionPlanSteps.length} action plan steps...`);

    // Cancelar emails previamente programados
    this.cancelAllScheduledEmails();

    // Validar datos de entrada
    if (!userEmail || userEmail.trim() === '') {
      console.error('❌ userEmail está vacío. No se pueden programar emails.');
      return;
    }
    if (!userName || userName.trim() === '') {
      console.warn('⚠️ userName está vacío. Se usará un valor por defecto.');
    }
    if (!idea || idea.trim() === '') {
      console.warn('⚠️ idea está vacía. Se usará un valor por defecto.');
    }

    // Programar email para cada paso
    actionPlanSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      const deadline = deadlines[index];

      if (!deadline) {
        console.warn(`⚠️ No deadline found for step ${stepNumber}. Skipping email.`);
        return;
      }

      // Validar que el paso tenga contenido
      if (!step || step.trim() === '') {
        console.warn(`⚠️ Step ${stepNumber} está vacío. Skipping email.`);
        return;
      }

      // Extraer título del paso de manera más robusta
      let stepTitle = step.trim();
      // Si tiene múltiples líneas, tomar la primera
      if (stepTitle.includes('\n')) {
        stepTitle = stepTitle.split('\n')[0].trim();
      }
      // Limitar a 100 caracteres y asegurar que no esté vacío
      stepTitle = stepTitle.substring(0, 100).trim() || `Paso ${stepNumber} del plan de acción`;
      
      // Extraer descripción (primeros 300 caracteres, o todo si es más corto)
      let stepDescription = step.trim();
      // Si tiene múltiples líneas, tomar las primeras 2-3 líneas
      if (stepDescription.includes('\n')) {
        const lines = stepDescription.split('\n').filter(line => line.trim() !== '');
        stepDescription = lines.slice(0, 3).join(' ').trim();
      }
      // Limitar a 300 caracteres
      stepDescription = stepDescription.substring(0, 300).trim() || `Completa el paso ${stepNumber} de tu plan de acción.`;

      // Asegurar valores por defecto si están vacíos
      const emailData: ActionPlanStepEmailData = {
        userEmail: userEmail.trim(),
        userName: (userName && userName.trim() !== '') ? userName.trim() : 'Usuario',
        idea: (idea && idea.trim() !== '') ? idea.trim() : 'Tu idea de negocio',
        stepNumber,
        stepTitle,
        stepDescription,
        dueDate: deadline,
        dashboardUrl: dashboardUrl || (typeof window !== 'undefined' ? window.location.origin : '')
      };

      // Log de los datos extraídos para debugging
      console.log(`📋 Datos extraídos para step ${stepNumber}:`, {
        stepTitle,
        stepDescriptionLength: stepDescription.length,
        hasDeadline: !!deadline
      });

      this.scheduleStepEmail(emailData);
    });

    console.log(`✅ Scheduled ${this.scheduledEmails.size} action plan reminder emails locally`);

    // Guardar emails en Airtable para envío en segundo plano desde el servidor
    if (dashboardId) {
      console.log('💾 Intentando guardar emails programados en Airtable...', {
        dashboardId,
        hasSteps: actionPlanSteps.length > 0,
        hasDeadlines: deadlines.length > 0
      });
      try {
        await this.saveScheduledEmailsToServer(dashboardId, userEmail, userName, idea, actionPlanSteps, deadlines, dashboardUrl);
      } catch (error) {
        console.error('❌ Error saving scheduled emails to server:', error);
        // No fallar si no se puede guardar en servidor, los emails locales seguirán funcionando
      }
    } else {
      console.warn('⚠️ No dashboardId provided, emails will only be scheduled locally (not saved to Airtable)');
    }
  }

  /**
   * Guarda los emails programados en el servidor (Airtable) para envío en segundo plano
   */
  private async saveScheduledEmailsToServer(
    dashboardId: string,
    userEmail: string,
    userName: string,
    idea: string,
    actionPlanSteps: string[],
    deadlines: string[],
    dashboardUrl?: string
  ): Promise<void> {
    const scheduledEmails: Array<{
      dashboardId: string;
      userEmail: string;
      userName: string;
      idea: string;
      stepNumber: number;
      stepTitle: string;
      stepDescription: string;
      dueDate: string;
      sendDate: string;
      dashboardUrl?: string;
      sent: boolean;
    }> = [];

    actionPlanSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      const deadline = deadlines[index];
      
      if (!deadline) return;

      // Calcular fecha de envío (1 día antes)
      const dueDate = new Date(deadline);
      const sendDate = new Date(dueDate);
      sendDate.setDate(dueDate.getDate() - 1);

      // Extraer título y descripción
      let stepTitle = step.trim();
      if (stepTitle.includes('\n')) {
        stepTitle = stepTitle.split('\n')[0].trim();
      }
      stepTitle = stepTitle.substring(0, 100).trim() || `Paso ${stepNumber} del plan de acción`;
      
      let stepDescription = step.trim();
      if (stepDescription.includes('\n')) {
        const lines = stepDescription.split('\n').filter(line => line.trim() !== '');
        stepDescription = lines.slice(0, 3).join(' ').trim();
      }
      stepDescription = stepDescription.substring(0, 300).trim() || `Completa el paso ${stepNumber} de tu plan de acción.`;

      scheduledEmails.push({
        dashboardId,
        userEmail,
        userName,
        idea,
        stepNumber,
        stepTitle,
        stepDescription,
        dueDate: deadline,
        sendDate: sendDate.toISOString().split('T')[0], // YYYY-MM-DD
        dashboardUrl,
        sent: false
      });
    });

    // Guardar directamente en Airtable usando axios (funciona en desarrollo y producción)
    try {
      // Importar configuraciones dinámicamente
      const { AIRTABLE_CONFIG, AIRTABLE_TABLE_URL, DASHBOARD_FIELDS } = await import('../config/airtable');
      const axios = (await import('axios')).default;

      // Preparar los datos de emails programados (solo los campos necesarios)
      const emailsData = scheduledEmails.map((email) => ({
        stepNumber: email.stepNumber,
        stepTitle: email.stepTitle,
        stepDescription: email.stepDescription,
        dueDate: email.dueDate,
        sendDate: email.sendDate,
        sent: email.sent || false,
        scheduledAt: new Date().toISOString()
      }));

      console.log('💾 Guardando emails programados en Airtable...', {
        dashboardId,
        emailsCount: scheduledEmails.length,
        scheduledEmails: scheduledEmails.map(e => ({
          step: e.stepNumber,
          sendDate: e.sendDate,
          dueDate: e.dueDate
        }))
      });

      // Verificar que los campos existen en la configuración
      const scheduledEmailsField = DASHBOARD_FIELDS.SCHEDULED_ACTION_PLAN_EMAILS;
      const lastUpdatedField = DASHBOARD_FIELDS.ACTION_PLAN_EMAILS_LAST_UPDATED;
      
      console.log('🔑 Campos a actualizar:', {
        scheduledEmailsField,
        lastUpdatedField,
        emailsDataLength: emailsData.length,
        emailsDataSample: emailsData[0]
      });

      // Actualizar el dashboard directamente con los campos de emails programados
      const updateFields: any = {
        [scheduledEmailsField]: JSON.stringify(emailsData),
        [lastUpdatedField]: new Date().toISOString()
      };

      console.log('📤 Enviando actualización a Airtable:', {
        url: AIRTABLE_TABLE_URL,
        dashboardId,
        fields: Object.keys(updateFields),
        scheduledEmailsLength: emailsData.length
      });

      // Obtener el record ID real de Airtable usando el dashboard_id
      const { AirtableService } = await import('../services/airtableService');
      const dashboardResult = await AirtableService.getDashboardById(dashboardId);
      
      if (!dashboardResult.success || !dashboardResult.dashboard || !dashboardResult.dashboard.id) {
        console.error('❌ No se pudo obtener el record ID de Airtable para dashboard:', dashboardId);
        throw new Error('Dashboard not found in Airtable');
      }
      
      const recordId = dashboardResult.dashboard.id;
      console.log('🔑 Record ID obtenido:', recordId, 'para dashboard ID:', dashboardId);

      // Usar el endpoint correcto con el record ID
      const response = await axios.patch(
        `${AIRTABLE_TABLE_URL}/${recordId}`,
        {
          fields: updateFields
        },
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // La respuesta de PATCH con record ID es diferente
      if (response.data && response.data.fields) {
        const updatedRecord = response.data;
        const savedEmailsField = updatedRecord.fields[scheduledEmailsField];
        
        console.log('✅ Scheduled emails saved to Airtable:', {
          dashboardId,
          emailsCount: scheduledEmails.length,
          emails: emailsData.map(e => ({
            step: e.stepNumber,
            sendDate: e.sendDate,
            dueDate: e.dueDate
          })),
          savedFieldExists: !!savedEmailsField,
          savedFieldLength: savedEmailsField ? savedEmailsField.length : 0
        });
        console.log(`📧 ${scheduledEmails.length} emails will be sent automatically from the server`);
        console.log('📋 Email data saved (first email):', emailsData[0]);
        
        // Verificar que se guardó correctamente
        if (savedEmailsField) {
          try {
            const parsed = JSON.parse(savedEmailsField);
            console.log('✅ Verificación: Emails guardados correctamente, total:', parsed.length);
          } catch (parseError) {
            console.warn('⚠️ No se pudo parsear el campo guardado:', parseError);
          }
        } else {
          console.warn('⚠️ El campo scheduled_action_plan_emails no aparece en la respuesta');
        }
      } else {
        console.error('❌ Invalid response from Airtable:', response.data);
        throw new Error('Invalid response from Airtable');
      }

    } catch (error: any) {
      console.error('❌ Error saving scheduled emails to Airtable:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        dashboardId
      });
      
      // No lanzar el error para que no bloquee el render del Dashboard
      // Solo loguear el error y continuar
      if (error?.response?.status === 422) {
        console.error('🔍 Error 422 - Detalles específicos:');
        console.error('📋 Error message:', error?.response?.data?.error?.message || error?.response?.data?.message);
        console.error('💡 Verifica que los campos existan en Airtable:', {
          scheduledEmailsField: DASHBOARD_FIELDS.SCHEDULED_ACTION_PLAN_EMAILS,
          lastUpdatedField: DASHBOARD_FIELDS.ACTION_PLAN_EMAILS_LAST_UPDATED
        });
      }
      
      // Intentar usar el endpoint de API como fallback (solo en producción)
      if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
        try {
          console.log('🔄 Trying API endpoint as fallback...');
          const apiUrl = `${window.location.origin}/api/schedule-action-plan-emails`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              scheduledEmails,
              dashboardId
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Scheduled emails saved via API fallback:', result);
          } else {
            const errorData = await response.json();
            console.error('❌ API fallback failed:', errorData);
          }
        } catch (apiError) {
          console.error('❌ API fallback also failed:', apiError);
        }
      }
      // No lanzar error para no interrumpir el flujo del usuario
    }
  }

  /**
   * Valida que todas las variables requeridas tengan valores
   */
  private validateEmailData(emailData: ActionPlanStepEmailData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!emailData.userEmail || emailData.userEmail.trim() === '') {
      errors.push('userEmail está vacío o no definido');
    }

    if (!emailData.userName || emailData.userName.trim() === '') {
      errors.push('userName está vacío o no definido');
    }

    if (!emailData.idea || emailData.idea.trim() === '') {
      errors.push('idea está vacía o no definida');
    }

    if (!emailData.stepTitle || emailData.stepTitle.trim() === '') {
      errors.push('stepTitle está vacío o no definido');
    }

    if (!emailData.stepDescription || emailData.stepDescription.trim() === '') {
      errors.push('stepDescription está vacía o no definida');
    }

    if (!emailData.dueDate || emailData.dueDate.trim() === '') {
      errors.push('dueDate está vacía o no definida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Envía un email de recordatorio para un paso específico
   */
  private async sendStepEmail(emailData: ActionPlanStepEmailData): Promise<void> {
    try {
      console.log(`📧 Sending reminder email for step ${emailData.stepNumber}...`);

      // Validar datos antes de enviar
      const validation = this.validateEmailData(emailData);
      if (!validation.isValid) {
        console.error(`❌ Datos inválidos para step ${emailData.stepNumber}:`, validation.errors);
        return;
      }

      // Generar asunto con variables
      const subject = this.generateSubject(emailData);

      // Asegurar que todos los valores estén definidos y no vacíos
      const safeValue = (value: string | undefined | null, defaultValue: string = ''): string => {
        return (value && value.trim() !== '') ? value.trim() : defaultValue;
      };

      // Preparar parámetros para la plantilla de EmailJS con validación
      const templateParams = {
        to_email: safeValue(emailData.userEmail),
        subject: safeValue(subject, 'Recordatorio de Plan de Acción'),
        user_name: safeValue(emailData.userName, 'Usuario'),
        user_email: safeValue(emailData.userEmail),
        idea: safeValue(emailData.idea, 'Tu idea de negocio'),
        step_number: emailData.stepNumber.toString(),
        step_title: safeValue(emailData.stepTitle, `Paso ${emailData.stepNumber}`),
        step_description: safeValue(emailData.stepDescription, 'Completa este paso de tu plan de acción.'),
        due_date: this.formatDate(emailData.dueDate),
        dashboard_url: safeValue(
          emailData.dashboardUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
          typeof window !== 'undefined' ? window.location.origin : ''
        ),
        name: 'Konsul Plan',
        email: 'plan@konsul.digital'
      };

      // Log detallado de las variables que se están enviando
      console.log(`📋 Variables para step ${emailData.stepNumber}:`);
      console.table(templateParams);
      
      // Verificar que ninguna variable crítica esté vacía
      const criticalVars = ['to_email', 'subject', 'user_name', 'idea', 'step_title'];
      const emptyVars = criticalVars.filter(key => {
        const value = templateParams[key as keyof typeof templateParams];
        return !value || value.toString().trim() === '';
      });
      
      if (emptyVars.length > 0) {
        console.error(`❌ Variables críticas vacías para step ${emailData.stepNumber}:`, emptyVars);
        console.error('📋 Datos recibidos:', emailData);
        console.error('📋 Template params:', templateParams);
        return;
      }

      // Log del request que se enviará
      const requestBody = {
        service_id: EMAIL_CONFIG.EMAILJS.SERVICE_ID,
        template_id: this.templateId,
        user_id: EMAIL_CONFIG.EMAILJS.USER_ID,
        template_params: templateParams
      };

      console.log(`📤 Enviando request a EmailJS para step ${emailData.stepNumber}:`);
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

      // Enviar email usando EmailJS
      const response = await fetch(EMAIL_CONFIG.EMAILJS.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log(`✅ Reminder email sent successfully for step ${emailData.stepNumber}`);
        console.log(`📧 Email enviado a: ${templateParams.to_email}`);
        console.log(`📋 Asunto: ${templateParams.subject}`);
      } else {
        console.error(`❌ Failed to send reminder email for step ${emailData.stepNumber}:`, response.status, responseText);
        console.error('📋 Template params enviados:', templateParams);
      }
    } catch (error) {
      console.error(`❌ Error sending reminder email for step ${emailData.stepNumber}:`, error);
      console.error('📋 Email data:', emailData);
    }
  }

  /**
   * Genera el asunto del email con variables según el paso
   */
  private generateSubject(emailData: ActionPlanStepEmailData): string {
    // El asunto puede incluir variables como {stepNumber}, {stepTitle}, {idea}
    // Por defecto, usamos un formato estándar
    return `📋 Recordatorio: Paso ${emailData.stepNumber} - ${emailData.stepTitle} | ${emailData.idea}`;
  }

  /**
   * Formatea la fecha para mostrar
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Cancela un email programado para un paso específico
   */
  cancelStepEmail(stepNumber: number): void {
    const scheduled = this.scheduledEmails.get(stepNumber);
    if (scheduled && scheduled.timeoutId) {
      clearTimeout(scheduled.timeoutId);
      this.scheduledEmails.delete(stepNumber);
      console.log(`❌ Cancelled scheduled email for step ${stepNumber}`);
    }
  }

  /**
   * Cancela todos los emails programados
   */
  cancelAllScheduledEmails(): void {
    this.scheduledEmails.forEach((scheduled, stepNumber) => {
      if (scheduled.timeoutId) {
        clearTimeout(scheduled.timeoutId);
      }
    });
    this.scheduledEmails.clear();
    console.log('❌ All scheduled emails cancelled');
  }

  /**
   * Obtiene información sobre los emails programados
   */
  getScheduledEmailsInfo(): Array<{ stepNumber: number; sendDate: string; dueDate: string; daysUntilSend: number }> {
    return Array.from(this.scheduledEmails.values()).map(scheduled => {
      const now = new Date();
      const sendDate = new Date(scheduled.scheduledTime);
      const daysUntilSend = Math.ceil((sendDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        stepNumber: scheduled.stepNumber,
        sendDate: sendDate.toLocaleString('es-ES'),
        dueDate: scheduled.emailData.dueDate,
        daysUntilSend: daysUntilSend
      };
    });
  }

  /**
   * MÉTODO DE PRUEBA: Envía un email inmediatamente para verificar la configuración
   * Úsalo solo para testing, no en producción
   */
  async testSendEmailImmediately(emailData: ActionPlanStepEmailData): Promise<boolean> {
    if (!this.templateId) {
      console.error('❌ Template ID not configured. Cannot send test email.');
      return false;
    }

    console.log('🧪 TEST MODE: Sending email immediately (bypassing schedule)...');
    await this.sendStepEmail(emailData);
    return true;
  }

  /**
   * Verifica la configuración y muestra información de los emails programados
   */
  getConfigurationInfo(): {
    templateId: string;
    isConfigured: boolean;
    scheduledCount: number;
    scheduledEmails: Array<{ stepNumber: number; sendDate: string; dueDate: string; daysUntilSend: number }>;
  } {
    return {
      templateId: this.templateId,
      isConfigured: !!this.templateId,
      scheduledCount: this.scheduledEmails.size,
      scheduledEmails: this.getScheduledEmailsInfo()
    };
  }
}

// Exportar instancia singleton
export const actionPlanEmailScheduler = new ActionPlanEmailScheduler();

