// ============================================
// CÓDIGO PARA VALIDAR VARIABLES EN CONSOLA
// Este código muestra todas las variables que se envían a EmailJS
// ============================================

(async function() {
  console.log('🧪 Validando variables del email...\n');
  
  // ⚠️ MODIFICA ESTOS VALORES:
  const tuEmail = 'valverde@cranealo.com';
  const tuNombre = 'Tu Nombre';
  const tuIdea = 'Plataforma de visualizar arte';
  
  // Simular datos de un paso
  const stepData = {
    stepNumber: 1,
    stepTitle: 'Validar tu idea con usuarios reales',
    stepDescription: 'Realiza entrevistas con al menos 10 usuarios potenciales para validar tu idea antes de desarrollar el MVP.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  
  // Función para validar y formatear valores
  const safeValue = (value, defaultValue = '') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return defaultValue;
    }
    return typeof value === 'string' ? value.trim() : String(value);
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Generar asunto
  const subject = `📋 Recordatorio: Paso ${stepData.stepNumber} - ${stepData.stepTitle} | ${tuIdea}`;
  
  // Preparar todas las variables
  const templateParams = {
    to_email: safeValue(tuEmail),
    subject: safeValue(subject, 'Recordatorio de Plan de Acción'),
    user_name: safeValue(tuNombre, 'Usuario'),
    user_email: safeValue(tuEmail),
    idea: safeValue(tuIdea, 'Tu idea de negocio'),
    step_number: stepData.stepNumber.toString(),
    step_title: safeValue(stepData.stepTitle, `Paso ${stepData.stepNumber}`),
    step_description: safeValue(stepData.stepDescription, 'Completa este paso de tu plan de acción.'),
    due_date: formatDate(stepData.dueDate),
    dashboard_url: window.location.origin,
    name: 'Konsul Plan',
    email: 'plan@konsul.digital'
  };
  
  // Validar variables críticas
  console.log('📋 VALIDACIÓN DE VARIABLES:\n');
  
  const criticalVars = ['to_email', 'subject', 'user_name', 'idea', 'step_title'];
  const allVars = Object.keys(templateParams);
  
  let hasErrors = false;
  
  criticalVars.forEach(key => {
    const value = templateParams[key];
    const isEmpty = !value || value.toString().trim() === '';
    const status = isEmpty ? '❌ VACÍO' : '✅ OK';
    
    console.log(`${status} ${key}:`, isEmpty ? '(vacío)' : value);
    
    if (isEmpty) {
      hasErrors = true;
    }
  });
  
  console.log('\n📋 TODAS LAS VARIABLES:\n');
  console.table(templateParams);
  
  // Mostrar variables no críticas
  const nonCriticalVars = allVars.filter(key => !criticalVars.includes(key));
  if (nonCriticalVars.length > 0) {
    console.log('\n📋 Variables adicionales:');
    nonCriticalVars.forEach(key => {
      const value = templateParams[key];
      const isEmpty = !value || value.toString().trim() === '';
      console.log(`  ${isEmpty ? '⚠️' : '✅'} ${key}:`, isEmpty ? '(vacío)' : value);
    });
  }
  
  if (hasErrors) {
    console.error('\n❌ ERROR: Hay variables críticas vacías. Revisa los datos de entrada.');
    return;
  }
  
  console.log('\n✅ Todas las variables críticas tienen valores válidos.\n');
  console.log('📤 ¿Enviar email de prueba? (descomenta las líneas siguientes)\n');
  
  // Descomenta esto para enviar el email:
  /*
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_bkwuq8a',
        template_id: 'template_m8c3dj8',
        user_id: 'f1tQ_gHsbkod_to3J',
        template_params: templateParams
      })
    });
    
    const result = await response.text();
    console.log(response.ok ? '✅ Email enviado!' : '❌ Error: ' + result);
    console.log('📧 Revisa tu email:', tuEmail);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  */
})();


