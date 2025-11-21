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
    this.templateId = templateId || EMAIL_CONFIG.EMAILJS.ACTION_PLAN_TEMPLATE_ID;
    console.log('📧 Action Plan Email Template ID configured:', this.templateId);
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
   */
  scheduleAllStepEmails(
    userEmail: string,
    userName: string,
    idea: string,
    actionPlanSteps: string[],
    deadlines: string[],
    dashboardUrl?: string
  ): void {
    if (!this.templateId) {
      console.warn('⚠️ Action Plan Email Template ID not configured. Emails will not be scheduled.');
      return;
    }

    console.log(`📧 Scheduling emails for ${actionPlanSteps.length} action plan steps...`);

    // Cancelar emails previamente programados
    this.cancelAllScheduledEmails();

    // Programar email para cada paso
    actionPlanSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      const deadline = deadlines[index];

      if (!deadline) {
        console.warn(`⚠️ No deadline found for step ${stepNumber}. Skipping email.`);
        return;
      }

      // Extraer título del paso (primera línea o primeros 50 caracteres)
      const stepTitle = step.split('\n')[0].substring(0, 50).trim() || `Paso ${stepNumber}`;
      const stepDescription = step.substring(0, 200); // Primeros 200 caracteres

      const emailData: ActionPlanStepEmailData = {
        userEmail,
        userName,
        idea,
        stepNumber,
        stepTitle,
        stepDescription,
        dueDate: deadline,
        dashboardUrl
      };

      this.scheduleStepEmail(emailData);
    });

    console.log(`✅ Scheduled ${this.scheduledEmails.size} action plan reminder emails`);
  }

  /**
   * Envía un email de recordatorio para un paso específico
   */
  private async sendStepEmail(emailData: ActionPlanStepEmailData): Promise<void> {
    try {
      console.log(`📧 Sending reminder email for step ${emailData.stepNumber}...`);

      // Generar asunto con variables
      const subject = this.generateSubject(emailData);

      // Preparar parámetros para la plantilla de EmailJS
      const templateParams = {
        to_email: emailData.userEmail,
        subject: subject,
        user_name: emailData.userName,
        user_email: emailData.userEmail,
        idea: emailData.idea,
        step_number: emailData.stepNumber.toString(),
        step_title: emailData.stepTitle,
        step_description: emailData.stepDescription,
        due_date: this.formatDate(emailData.dueDate),
        dashboard_url: emailData.dashboardUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
        name: 'Konsul Plan',
        email: 'plan@konsul.digital'
      };

      // Enviar email usando EmailJS
      const response = await fetch(EMAIL_CONFIG.EMAILJS.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAIL_CONFIG.EMAILJS.SERVICE_ID,
          template_id: this.templateId,
          user_id: EMAIL_CONFIG.EMAILJS.USER_ID,
          template_params: templateParams
        })
      });

      if (response.ok) {
        console.log(`✅ Reminder email sent successfully for step ${emailData.stepNumber}`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to send reminder email for step ${emailData.stepNumber}:`, errorText);
      }
    } catch (error) {
      console.error(`❌ Error sending reminder email for step ${emailData.stepNumber}:`, error);
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

