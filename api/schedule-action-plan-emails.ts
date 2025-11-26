// API endpoint para guardar emails programados del plan de acción en Airtable
// Este endpoint se llama desde el frontend para programar emails en segundo plano

import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appHgGF7B9ojxqRnA';
const AIRTABLE_TABLE_NAME = process.env.VITE_AIRTABLE_TABLE_NAME || process.env.AIRTABLE_TABLE_NAME || 'Dashboards';
const AIRTABLE_TOKEN = process.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;

interface ScheduledEmailData {
  dashboardId: string;
  userEmail: string;
  userName: string;
  idea: string;
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  dueDate: string; // YYYY-MM-DD
  sendDate: string; // YYYY-MM-DD (1 día antes del dueDate)
  dashboardUrl?: string;
  sent?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scheduledEmails, dashboardId } = req.body;

    if (!scheduledEmails || !Array.isArray(scheduledEmails) || scheduledEmails.length === 0) {
      return res.status(400).json({ error: 'scheduledEmails array is required' });
    }

    if (!dashboardId) {
      return res.status(400).json({ error: 'dashboardId is required' });
    }

    if (!AIRTABLE_TOKEN) {
      return res.status(500).json({ error: 'Airtable token not configured' });
    }

    // Buscar el dashboard en Airtable
    const dashboardUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    // Obtener el dashboard actual para actualizar el campo de scheduled_emails
    const getResponse = await axios.get(`${dashboardUrl}/${dashboardId}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const dashboard = getResponse.data.fields;

    // Preparar los datos de emails programados
    const emailsData = scheduledEmails.map((email: ScheduledEmailData) => ({
      stepNumber: email.stepNumber,
      stepTitle: email.stepTitle,
      stepDescription: email.stepDescription,
      dueDate: email.dueDate,
      sendDate: email.sendDate,
      sent: email.sent || false,
      scheduledAt: new Date().toISOString()
    }));

    // Actualizar el dashboard con los emails programados
    const updateResponse = await axios.patch(
      `${dashboardUrl}/${dashboardId}`,
      {
        fields: {
          scheduled_action_plan_emails: JSON.stringify(emailsData),
          action_plan_emails_last_updated: new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: `Scheduled ${scheduledEmails.length} emails for dashboard ${dashboardId}`,
      dashboardId,
      emailsCount: scheduledEmails.length
    });

  } catch (error: any) {
    console.error('Error scheduling action plan emails:', error);
    return res.status(500).json({
      error: 'Failed to schedule emails',
      message: error?.response?.data?.error?.message || error?.message || 'Unknown error'
    });
  }
}

