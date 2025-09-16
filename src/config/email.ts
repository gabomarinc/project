// Email Service Configuration
export const EMAIL_CONFIG = {
  // EmailJS configuration (for development/testing)
  EMAILJS: {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service',
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'default_template',
    USER_ID: import.meta.env.VITE_EMAILJS_USER_ID || 'default_user',
    API_URL: 'https://api.emailjs.com/api/v1.0/email/send'
  },
  
  // SendGrid configuration (for production)
  SENDGRID: {
    API_KEY: import.meta.env.VITE_SENDGRID_API_KEY || '',
    FROM_EMAIL: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@konsulplan.com',
    FROM_NAME: import.meta.env.VITE_SENDGRID_FROM_NAME || 'Konsul Plan'
  },
  
  // AWS SES configuration (alternative for production)
  AWS_SES: {
    ACCESS_KEY_ID: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
    REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    FROM_EMAIL: import.meta.env.VITE_AWS_FROM_EMAIL || 'noreply@konsulplan.com'
  },
  
  // Default email settings
  DEFAULT: {
    FROM_EMAIL: 'noreply@konsulplan.com',
    FROM_NAME: 'Konsul Plan',
    REPLY_TO: 'support@konsulplan.com'
  }
};

// Email templates configuration
export const EMAIL_TEMPLATES = {
  FOLLOW_UP: {
    subject: '🚀 Seguimiento de tu Plan de Acción: {idea}',
    template: 'follow-up-action-plan'
  },
  FEEDBACK_REQUEST: {
    subject: '🤔 ¿Podrías darme feedback sobre mi idea de negocio?',
    template: 'feedback-request'
  },
  WELCOME: {
    subject: '🎉 ¡Bienvenido a Konsul Plan!',
    template: 'welcome'
  }
};

// Email service providers
export enum EmailProvider {
  NODEMAILER = 'nodemailer',
  EMAILJS = 'emailjs',
  SENDGRID = 'sendgrid',
  AWS_SES = 'aws_ses',
  MOCK = 'mock' // For development/testing
}

// Get the active email provider
export const getActiveEmailProvider = (): EmailProvider => {
  // Check if we have EmailJS configured
  if (EMAIL_CONFIG.EMAILJS.SERVICE_ID !== 'default_service' && 
      EMAIL_CONFIG.EMAILJS.TEMPLATE_ID !== 'default_template' && 
      EMAIL_CONFIG.EMAILJS.USER_ID !== 'default_user') {
    return EmailProvider.EMAILJS;
  }
  
  // Fallback to mock for development
  return EmailProvider.MOCK;
};
