// Cron job para verificar y enviar emails programados del plan de acción
// Este endpoint se ejecuta periódicamente (cada hora) para enviar emails que están listos

import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appHgGF7B9ojxqRnA';
const AIRTABLE_TABLE_NAME = process.env.VITE_AIRTABLE_TABLE_NAME || process.env.AIRTABLE_TABLE_NAME || 'Dashboards';
const AIRTABLE_TOKEN = process.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;

const EMAILJS_SERVICE_ID = process.env.VITE_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID || process.env.EMAILJS_ACTION_PLAN_TEMPLATE_ID;
const EMAILJS_USER_ID = process.env.VITE_EMAILJS_USER_ID || process.env.EMAILJS_USER_ID;
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

interface ScheduledEmail {
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  dueDate: string;
  sendDate: string;
  sent: boolean;
  scheduledAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificar que es una llamada autorizada (desde Vercel Cron o con secret)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (!AIRTABLE_TOKEN) {
      return res.status(500).json({ error: 'Airtable token not configured' });
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
      return res.status(500).json({ error: 'EmailJS configuration missing' });
    }

    const dashboardUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Obtener todos los dashboards con emails programados
    const response = await axios.get(dashboardUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        filterByFormula: `AND({scheduled_action_plan_emails} != '', {is_active} = TRUE())`,
        maxRecords: 100
      }
    });

    const dashboards = response.data.records;
    let emailsSent = 0;
    let emailsSkipped = 0;
    const errors: string[] = [];

    for (const record of dashboards) {
      const dashboard = record.fields;
      const scheduledEmailsJson = dashboard.scheduled_action_plan_emails;

      if (!scheduledEmailsJson) continue;

      try {
        const scheduledEmails: ScheduledEmail[] = JSON.parse(scheduledEmailsJson);
        
        // Filtrar emails que deben enviarse hoy y no han sido enviados
        const emailsToSend = scheduledEmails.filter(email => {
          return email.sendDate === today && !email.sent;
        });

        for (const email of emailsToSend) {
          try {
            // Preparar datos del email
            const templateParams = {
              to_email: dashboard.user_email || '',
              subject: `📋 Recordatorio: Paso ${email.stepNumber} - ${email.stepTitle} | ${dashboard.business_idea || 'Tu idea de negocio'}`,
              user_name: dashboard.user_name || 'Usuario',
              user_email: dashboard.user_email || '',
              idea: dashboard.business_idea || 'Tu idea de negocio',
              step_number: email.stepNumber.toString(),
              step_title: email.stepTitle || `Paso ${email.stepNumber}`,
              step_description: email.stepDescription || 'Completa este paso de tu plan de acción.',
              due_date: new Date(email.dueDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
              dashboard_url: process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}?dashboard=${record.id}` 
                : `https://konsul.digital?dashboard=${record.id}`,
              name: 'Konsul Plan',
              email: 'plan@konsul.digital'
            };

            // Enviar email usando EmailJS
            const emailResponse = await axios.post(EMAILJS_API_URL, {
              service_id: EMAILJS_SERVICE_ID,
              template_id: EMAILJS_TEMPLATE_ID,
              user_id: EMAILJS_USER_ID,
              template_params: templateParams
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (emailResponse.status === 200) {
              // Marcar email como enviado
              email.sent = true;
              emailsSent++;
              
              console.log(`✅ Email sent for step ${email.stepNumber} to ${templateParams.to_email}`);
            } else {
              errors.push(`Failed to send email for step ${email.stepNumber} in dashboard ${record.id}`);
            }

          } catch (emailError: any) {
            errors.push(`Error sending email for step ${email.stepNumber}: ${emailError.message}`);
            console.error(`❌ Error sending email:`, emailError);
          }
        }

        // Actualizar el dashboard con los emails actualizados
        if (emailsToSend.length > 0) {
          await axios.patch(
            `${dashboardUrl}/${record.id}`,
            {
              fields: {
                scheduled_action_plan_emails: JSON.stringify(scheduledEmails),
                action_plan_emails_last_processed: new Date().toISOString()
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }

      } catch (parseError) {
        errors.push(`Error parsing scheduled emails for dashboard ${record.id}`);
        console.error('Parse error:', parseError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Cron job completed',
      emailsSent,
      emailsSkipped,
      dashboardsProcessed: dashboards.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error in send-scheduled-emails cron job:', error);
    return res.status(500).json({
      error: 'Cron job failed',
      message: error?.message || 'Unknown error'
    });
  }
}

