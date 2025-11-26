# 🔧 Configuración de la Plantilla de EmailJS - SOLUCIÓN AL PROBLEMA

## ❌ Problema Actual

Los emails están llegando a `plan@konsul.digital` en lugar del email del usuario.

**Causa:** La plantilla de EmailJS no está usando la variable `{{to_email}}` como destinatario.

## ✅ Solución: Configurar la Plantilla Correctamente

### Paso 1: Editar la Plantilla en EmailJS

1. Ve a: https://dashboard.emailjs.com/
2. Inicia sesión
3. Ve a **"Email Templates"**
4. Abre la plantilla `template_m8c3dj8`
5. **IMPORTANTE:** En la sección **"To Email"** o **"To"**, debes usar:

```
{{to_email}}
```

**NO uses:**
- ❌ `plan@konsul.digital` (email fijo)
- ❌ `{{email}}` (esta es otra variable)
- ❌ Cualquier email hardcodeado

**SÍ usa:**
- ✅ `{{to_email}}` (variable que contiene el email del usuario)

### Paso 2: Verificar el Campo "From Email"

En la sección **"From Email"** o **"From"**, puedes usar:

```
plan@konsul.digital
```

O si quieres usar una variable:

```
{{email}}
```

Pero el **"To Email"** DEBE ser `{{to_email}}`.

### Paso 3: Verificar Todas las Variables

Asegúrate de que la plantilla tenga estas variables configuradas:

| Campo en EmailJS | Variable a Usar | Ejemplo |
|-----------------|-----------------|---------|
| **To Email** | `{{to_email}}` | `{{to_email}}` |
| **From Email** | `plan@konsul.digital` o `{{email}}` | `plan@konsul.digital` |
| **Subject** | `{{subject}}` | `{{subject}}` |
| **Body/Content** | Todas las demás variables | `{{user_name}}`, `{{idea}}`, etc. |

### Paso 4: Guardar la Plantilla

1. Haz clic en **"Save"** o **"Guardar"**
2. Verifica que se guardó correctamente

## 📋 Variables Disponibles en la Plantilla

Puedes usar estas variables en el contenido del email:

- `{{to_email}}` - **Email del destinatario (OBLIGATORIO en "To Email")**
- `{{subject}}` - Asunto del email
- `{{user_name}}` - Nombre del usuario
- `{{user_email}}` - Email del usuario (igual que to_email)
- `{{idea}}` - Idea de negocio
- `{{step_number}}` - Número del paso (1-7)
- `{{step_title}}` - Título del paso
- `{{step_description}}` - Descripción del paso
- `{{due_date}}` - Fecha de vencimiento formateada
- `{{dashboard_url}}` - URL del dashboard
- `{{name}}` - Nombre del remitente (Konsul Plan)
- `{{email}}` - Email del remitente (plan@konsul.digital)

## 🧪 Probar Después de Configurar

Después de configurar la plantilla, ejecuta este código en la consola:

```javascript
(async function() {
  const tuEmail = 'valverde@cranealo.com'; // ⚠️ Cambia por tu email
  const tuNombre = 'Tu Nombre';
  const tuIdea = 'Plataforma de visualizar arte';
  
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: 'service_bkwuq8a',
      template_id: 'template_m8c3dj8',
      user_id: 'f1tQ_gHsbkod_to3J',
      template_params: {
        to_email: tuEmail, // ⚠️ Este debe llegar al usuario
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
  
  const result = await response.text();
  console.log(response.ok ? '✅ Email enviado a: ' + tuEmail : '❌ Error: ' + result);
})();
```

**Verifica que el email llegue a `valverde@cranealo.com` y NO a `plan@konsul.digital`.**

## 🔍 Verificar en EmailJS Dashboard

1. Ve a **"Email Logs"** o **"Activity"**
2. Busca el email más reciente
3. Verifica que el campo **"To"** muestre el email del usuario, no `plan@konsul.digital`

## ⚠️ Nota Importante

- **"To Email"** = `{{to_email}}` → Email del usuario (destinatario)
- **"From Email"** = `plan@konsul.digital` → Email del remitente
- **"Reply To"** (opcional) = `plan@konsul.digital` → Email para responder

## 📸 Ejemplo Visual de Configuración

```
┌─────────────────────────────────────┐
│ Email Template: template_m8c3dj8    │
├─────────────────────────────────────┤
│ To Email:     {{to_email}}          │ ← DEBE SER ESTO
│ From Email:   plan@konsul.digital   │
│ Subject:      {{subject}}           │
│                                     │
│ Content:                            │
│ Hola {{user_name}},                 │
│                                     │
│ Tu paso {{step_number}}:            │
│ {{step_title}}                      │
│ ...                                 │
└─────────────────────────────────────┘
```

## ✅ Checklist

- [ ] Plantilla abierta en EmailJS Dashboard
- [ ] Campo "To Email" configurado como `{{to_email}}`
- [ ] Campo "From Email" configurado como `plan@konsul.digital`
- [ ] Campo "Subject" configurado como `{{subject}}`
- [ ] Plantilla guardada
- [ ] Probado con el código de prueba
- [ ] Email llega al usuario correcto (no a plan@konsul.digital)


