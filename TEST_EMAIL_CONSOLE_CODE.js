// ============================================
// CÓDIGO PARA PROBAR EN LA CONSOLA DEL NAVEGADOR
// Copia y pega este código completo en la consola (F12)
// ============================================

(async function testActionPlanEmails() {
  console.log('🧪 Iniciando prueba de emails del plan de acción...\n');
  
  // ============================================
  // CONFIGURACIÓN - MODIFICA ESTOS VALORES
  // ============================================
  const TEST_CONFIG = {
    userEmail: 'tu-email@ejemplo.com', // ⚠️ CAMBIA ESTO por tu email real
    userName: 'Tu Nombre', // ⚠️ CAMBIA ESTO por tu nombre
    idea: 'Mi Idea de Negocio de Prueba', // ⚠️ CAMBIA ESTO por tu idea
    stepNumber: 1, // Paso a probar (1-7)
    stepTitle: 'Validar tu idea con usuarios reales',
    stepDescription: 'Realiza entrevistas con al menos 10 usuarios potenciales para validar tu idea antes de desarrollar el MVP.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 días en el futuro
    dashboardUrl: window.location.origin
  };
  
  // ============================================
  // VERIFICAR CONFIGURACIÓN
  // ============================================
  console.log('📋 Configuración de prueba:');
  console.table(TEST_CONFIG);
  console.log('\n');
  
  // Verificar que EmailJS esté configurado
  const emailjsConfig = {
    serviceId: import.meta?.env?.VITE_EMAILJS_SERVICE_ID || 'No configurado',
    templateId: import.meta?.env?.VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID || 'No configurado',
    userId: import.meta?.env?.VITE_EMAILJS_USER_ID || 'No configurado'
  };
  
  console.log('📧 Configuración de EmailJS:');
  console.table(emailjsConfig);
  
  if (emailjsConfig.templateId === 'No configurado') {
    console.error('❌ ERROR: VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID no está configurado');
    console.log('💡 Solución: Agrega la variable en tu archivo config.env');
    return;
  }
  
  console.log('\n');
  
  // ============================================
  // ENVIAR EMAIL DE PRUEBA
  // ============================================
  console.log('📤 Enviando email de prueba...\n');
  
  try {
    // Generar asunto
    const subject = `📋 Recordatorio: Paso ${TEST_CONFIG.stepNumber} - ${TEST_CONFIG.stepTitle} | ${TEST_CONFIG.idea}`;
    
    // Formatear fecha
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };
    
    // Preparar parámetros para EmailJS
    const templateParams = {
      to_email: TEST_CONFIG.userEmail,
      subject: subject,
      user_name: TEST_CONFIG.userName,
      user_email: TEST_CONFIG.userEmail,
      idea: TEST_CONFIG.idea,
      step_number: TEST_CONFIG.stepNumber.toString(),
      step_title: TEST_CONFIG.stepTitle,
      step_description: TEST_CONFIG.stepDescription,
      due_date: formatDate(TEST_CONFIG.dueDate),
      dashboard_url: TEST_CONFIG.dashboardUrl,
      name: 'Konsul Plan',
      email: 'plan@konsul.digital'
    };
    
    console.log('📝 Parámetros del email:');
    console.table(templateParams);
    console.log('\n');
    
    // Enviar email usando EmailJS API
    const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
    const SERVICE_ID = emailjsConfig.serviceId;
    const TEMPLATE_ID = emailjsConfig.templateId;
    const USER_ID = emailjsConfig.userId;
    
    const response = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: USER_ID,
        template_params: templateParams
      })
    });
    
    console.log('📡 Respuesta del servidor:', response.status, response.statusText);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ ¡Email enviado exitosamente!');
      console.log('📧 Revisa tu bandeja de entrada:', TEST_CONFIG.userEmail);
      console.log('📋 Asunto del email:', subject);
      console.log('\n');
      console.log('📊 Detalles de la respuesta:', responseText);
    } else {
      const errorText = await response.text();
      console.error('❌ Error al enviar email:', response.status, response.statusText);
      console.error('📄 Detalles del error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    console.error('📚 Stack trace:', error.stack);
  }
  
  console.log('\n');
  console.log('✅ Prueba completada');
  console.log('💡 Revisa tu email en:', TEST_CONFIG.userEmail);
})();

// ============================================
// CÓDIGO ALTERNATIVO: Si tienes acceso al scheduler
// ============================================
console.log('\n');
console.log('💡 Si el scheduler está disponible, también puedes usar:');
console.log(`
// Ver información de configuración
window.actionPlanEmailScheduler?.getConfigurationInfo()

// Ver emails programados
window.actionPlanEmailScheduler?.getScheduledEmailsInfo()

// Enviar email de prueba
window.actionPlanEmailScheduler?.testSendEmailImmediately({
  userEmail: 'tu-email@ejemplo.com',
  userName: 'Tu Nombre',
  idea: 'Mi Idea',
  stepNumber: 1,
  stepTitle: 'Paso de Prueba',
  stepDescription: 'Descripción del paso',
  dueDate: '2024-11-25',
  dashboardUrl: window.location.origin
})
`);


