# 🧪 Código Mejorado para Probar en Consola (Con Diagnóstico)

## 📋 Código con Diagnóstico Completo

```javascript
(async function() {
  // ⚠️ MODIFICA ESTOS 3 VALORES:
  const tuEmail = 'valverde@cranealo.com';
  const tuNombre = 'Tu Nombre';
  const tuIdea = 'Plataforma de visualizar arte';
  
  console.log('🧪 Enviando email de prueba con diagnóstico completo...\n');
  
  // Configuración de EmailJS
  const config = {
    serviceId: 'service_bkwuq8a',
    templateId: 'template_m8c3dj8',
    userId: 'f1tQ_gHsbkod_to3J',
    apiUrl: 'https://api.emailjs.com/api/v1.0/email/send'
  };
  
  // Datos del email
  const emailData = {
    to_email: tuEmail,
    subject: `📋 Recordatorio: Paso 1 - Validar tu idea con usuarios reales | ${tuIdea}`,
    user_name: tuNombre,
    user_email: tuEmail,
    idea: tuIdea,
    step_number: '1',
    step_title: 'Validar tu idea con usuarios reales',
    step_description: 'Realiza entrevistas con al menos 10 usuarios potenciales para validar tu idea antes de desarrollar el MVP.',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    dashboard_url: window.location.origin,
    name: 'Konsul Plan',
    email: 'plan@konsul.digital'
  };
  
  console.log('📋 Configuración:');
  console.table(config);
  console.log('\n📧 Datos del email:');
  console.table(emailData);
  console.log('\n');
  
  try {
    const requestBody = {
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.userId,
      template_params: emailData
    };
    
    console.log('📤 Enviando petición a EmailJS...');
    console.log('📦 Body de la petición:', JSON.stringify(requestBody, null, 2));
    console.log('\n');
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Respuesta del servidor:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    console.log('\n');
    
    const responseText = await response.text();
    console.log('📄 Respuesta completa:', responseText);
    console.log('\n');
    
    if (response.ok) {
      console.log('✅ EmailJS respondió exitosamente (Status 200)');
      console.log('📧 Email debería llegar a:', tuEmail);
      console.log('\n');
      console.log('🔍 PASOS PARA VERIFICAR:');
      console.log('1. Revisa tu bandeja de entrada:', tuEmail);
      console.log('2. Revisa la carpeta de SPAM/CORREO NO DESEADO');
      console.log('3. Espera 1-2 minutos (puede haber delay)');
      console.log('4. Ve a EmailJS Dashboard: https://dashboard.emailjs.com/');
      console.log('5. Revisa la sección "Email Logs" o "Activity"');
      console.log('6. Verifica que el email aparezca en los logs');
      console.log('\n');
      console.log('💡 Si no aparece en EmailJS Dashboard, el problema puede ser:');
      console.log('   - Template ID incorrecto');
      console.log('   - Service ID incorrecto');
      console.log('   - Variables faltantes en la plantilla');
      console.log('   - Problema con la configuración del servicio de email');
    } else {
      console.error('❌ Error en la respuesta:', response.status);
      console.error('📄 Detalles:', responseText);
      
      // Intentar parsear como JSON si es posible
      try {
        const errorJson = JSON.parse(responseText);
        console.error('📋 Error detallado:', errorJson);
      } catch (e) {
        // No es JSON, mostrar como texto
      }
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    console.error('📚 Stack:', error.stack);
  }
})();
```

## 🔍 Verificación en EmailJS Dashboard

1. **Ve a:** https://dashboard.emailjs.com/
2. **Inicia sesión** con tu cuenta
3. **Ve a "Email Logs"** o **"Activity"**
4. **Busca el email más reciente** con:
   - To: `valverde@cranealo.com`
   - Subject: `📋 Recordatorio: Paso 1...`
5. **Verifica el estado:**
   - ✅ **Sent** = Email enviado correctamente
   - ⚠️ **Failed** = Hubo un error
   - 📧 **Delivered** = Email entregado al servidor

## 🐛 Posibles Problemas y Soluciones

### 1. Email en Spam
- Revisa la carpeta de **SPAM/CORREO NO DESEADO**
- Marca como "No es spam" si lo encuentras ahí

### 2. Delay en la Entrega
- EmailJS puede tardar 1-5 minutos en entregar
- Espera unos minutos y revisa de nuevo

### 3. Template ID Incorrecto
- Verifica en EmailJS Dashboard que `template_m8c3dj8` existe
- Verifica que el template tenga todas las variables necesarias

### 4. Variables Faltantes en la Plantilla
- Asegúrate de que la plantilla tenga todas estas variables:
  - `{{to_email}}`
  - `{{subject}}`
  - `{{user_name}}`
  - `{{idea}}`
  - `{{step_number}}`
  - `{{step_title}}`
  - etc.

### 5. Servicio de Email No Configurado
- Verifica en EmailJS que el servicio `service_bkwuq8a` esté activo
- Verifica que tenga un proveedor de email configurado (Gmail, SendGrid, etc.)

## 📊 Verificar Estado del Email

Ejecuta este código para ver el estado en EmailJS:

```javascript
console.log('🔍 Para verificar el estado del email:');
console.log('1. Ve a: https://dashboard.emailjs.com/');
console.log('2. Inicia sesión');
console.log('3. Ve a "Email Logs" o "Activity"');
console.log('4. Busca el email más reciente');
console.log('5. Verifica el estado y cualquier mensaje de error');
```


