# 🧪 Código para Probar en la Consola del Navegador (Producción)

## 📋 Instrucciones Rápidas

1. Abre tu aplicación en producción
2. Presiona `F12` (o `Cmd+Option+I` en Mac) para abrir la consola
3. Copia y pega el código completo de abajo
4. **Modifica los valores** marcados con ⚠️
5. Presiona Enter

---

## 🚀 Código Completo (Copia Todo)

```javascript
(async function() {
  // ⚠️ MODIFICA ESTOS VALORES CON TUS DATOS REALES
  const tuEmail = 'tu-email@ejemplo.com'; // ⚠️ CAMBIA ESTO
  const tuNombre = 'Tu Nombre'; // ⚠️ CAMBIA ESTO
  const tuIdea = 'Mi Idea de Negocio'; // ⚠️ CAMBIA ESTO
  
  console.log('🧪 Enviando email de prueba...\n');
  
  // Configuración de EmailJS (debe estar en tus variables de entorno)
  const EMAILJS_CONFIG = {
    serviceId: 'service_bkwuq8a',
    templateId: 'template_m8c3dj8', // Template ID del plan de acción
    userId: 'f1tQ_gHsbkod_to3J',
    apiUrl: 'https://api.emailjs.com/api/v1.0/email/send'
  };
  
  // Datos del email de prueba
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
  
  console.log('📧 Enviando a:', tuEmail);
  console.log('📋 Asunto:', emailData.subject);
  console.log('\n');
  
  try {
    const response = await fetch(EMAILJS_CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.userId,
        template_params: emailData
      })
    });
    
    if (response.ok) {
      console.log('✅ ¡Email enviado exitosamente!');
      console.log('📧 Revisa tu bandeja de entrada:', tuEmail);
    } else {
      const error = await response.text();
      console.error('❌ Error:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

---

## 🎯 Versión Simplificada (Solo Cambia 3 Valores)

```javascript
// ⚠️ SOLO MODIFICA ESTAS 3 LÍNEAS:
const tuEmail = 'tu-email@ejemplo.com';
const tuNombre = 'Tu Nombre';
const tuIdea = 'Mi Idea de Negocio';

// El resto del código (no modificar)
(async function() {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: 'service_bkwuq8a',
      template_id: 'template_m8c3dj8',
      user_id: 'f1tQ_gHsbkod_to3J',
      template_params: {
        to_email: tuEmail,
        subject: `📋 Recordatorio: Paso 1 - Validar tu idea | ${tuIdea}`,
        user_name: tuNombre,
        user_email: tuEmail,
        idea: tuIdea,
        step_number: '1',
        step_title: 'Validar tu idea con usuarios reales',
        step_description: 'Realiza entrevistas con usuarios potenciales',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        dashboard_url: window.location.origin,
        name: 'Konsul Plan',
        email: 'plan@konsul.digital'
      }
    })
  });
  
  console.log(response.ok ? '✅ Email enviado!' : '❌ Error:', await response.text());
})();
```

---

## 📝 Qué Esperar

### ✅ Si funciona correctamente:
```
🧪 Enviando email de prueba...
📧 Enviando a: tu-email@ejemplo.com
📋 Asunto: 📋 Recordatorio: Paso 1 - Validar tu idea con usuarios reales | Mi Idea de Negocio
✅ ¡Email enviado exitosamente!
📧 Revisa tu bandeja de entrada: tu-email@ejemplo.com
```

### ❌ Si hay error:
- Verifica que el template ID sea correcto: `template_m8c3dj8`
- Verifica que el Service ID y User ID sean correctos
- Revisa la consola para ver el mensaje de error específico

---

## 🔍 Verificar en EmailJS

1. Ve a: https://dashboard.emailjs.com/
2. Revisa la sección "Email Logs" o "Activity"
3. Deberías ver el email enviado con todos los parámetros

---

## 💡 Tips

- **Reemplaza `tu-email@ejemplo.com`** con tu email real para recibir el email
- **Reemplaza `Tu Nombre`** con tu nombre real
- **Reemplaza `Mi Idea de Negocio`** con tu idea real
- El email se enviará **inmediatamente** cuando ejecutes el código
- Revisa tu bandeja de entrada (y spam) después de ejecutar


