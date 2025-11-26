# 📧 Referencia de Variables para Plantillas de EmailJS

Este documento lista todas las variables disponibles para cada tipo de email en las plantillas de EmailJS.

---

## 📋 1. Email de Plan de Acción (Recordatorios de Pasos)

**Template ID:** `template_m8c3dj8` (configurable con `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID`)

### Variables Disponibles:

| Variable en Plantilla | Nombre en Código | Tipo | Descripción | Ejemplo |
|----------------------|------------------|------|-------------|---------|
| `{{to_email}}` | `to_email` | string | **Email del destinatario (OBLIGATORIO en "To Email")** | `valverde@cranealo.com` |
| `{{subject}}` | `subject` | string | Asunto del email (generado automáticamente) | `📋 Recordatorio: Paso 1 - Validar tu idea...` |
| `{{user_name}}` | `user_name` | string | Nombre del usuario | `Juan Pérez` |
| `{{user_email}}` | `user_email` | string | Email del usuario (igual que to_email) | `valverde@cranealo.com` |
| `{{idea}}` | `idea` | string | Idea de negocio del usuario | `Plataforma de visualizar arte` |
| `{{step_number}}` | `step_number` | string | Número del paso (1-7) | `1` |
| `{{step_title}}` | `step_title` | string | Título del paso | `Validar tu idea con usuarios reales` |
| `{{step_description}}` | `step_description` | string | Descripción del paso (máx 300 caracteres) | `Realiza entrevistas con usuarios...` |
| `{{due_date}}` | `due_date` | string | Fecha de vencimiento formateada | `20 de noviembre de 2024` |
| `{{dashboard_url}}` | `dashboard_url` | string | URL del dashboard | `https://tu-dominio.com` |
| `{{name}}` | `name` | string | Nombre del remitente | `Konsul Plan` |
| `{{email}}` | `email` | string | Email del remitente | `plan@konsul.digital` |

### Ejemplo de Uso en Plantilla:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Hola {{user_name}},</h1>
  
  <p>Este es un recordatorio de que tu <strong>Paso {{step_number}}</strong> vence pronto:</p>
  
  <h2>{{step_title}}</h2>
  <p>{{step_description}}</p>
  
  <p><strong>Fecha de vencimiento:</strong> {{due_date}}</p>
  
  <p>Tu idea: <strong>{{idea}}</strong></p>
  
  <a href="{{dashboard_url}}">Ver mi Dashboard</a>
  
  <p>Saludos,<br>{{name}}<br>{{email}}</p>
</body>
</html>
```

### Configuración en EmailJS:

- **To Email:** `{{to_email}}` ⚠️ **OBLIGATORIO**
- **From Email:** `plan@konsul.digital` o `{{email}}`
- **Subject:** `{{subject}}`

---

## 💳 2. Email de Pago Exitoso

**Template ID:** `template_hyeermb` (configurable con `VITE_EMAILJS_TEMPLATE_ID`)

### Variables Disponibles:

| Variable en Plantilla | Nombre en Código | Tipo | Descripción | Ejemplo |
|----------------------|------------------|------|-------------|---------|
| `{{to_email}}` | `to_email` | string | **Email del destinatario (OBLIGATORIO en "To Email")** | `valverde@cranealo.com` |
| `{{subject}}` | `subject` | string | Asunto del email | `🎉 ¡Pago Exitoso! Tu Dashboard de Negocio está Listo` |
| `{{userName}}` | `userName` | string | Nombre del usuario | `Juan Pérez` |
| `{{userEmail}}` | `userEmail` | string | Email del usuario | `valverde@cranealo.com` |
| `{{dashboardId}}` | `dashboardId` | string | ID del dashboard | `recABC123XYZ` |
| `{{password}}` | `password` | string | Contraseña generada para el dashboard | `P@ssw0rd123` |
| `{{idea}}` | `idea` | string | Idea de negocio | `Plataforma de visualizar arte` |
| `{{creationDate}}` | `creationDate` | string | Fecha de creación del dashboard | `15 de noviembre de 2024` |
| `{{expirationDate}}` | `expirationDate` | string | Fecha de expiración del dashboard | `15 de diciembre de 2024` |
| `{{dashboardUrl}}` | `dashboardUrl` | string | URL del dashboard | `https://tu-dominio.com?preview=recABC123XYZ` |
| `{{name}}` | `name` | string | Nombre del remitente | `Konsul Plan` |
| `{{email}}` | `email` | string | Email del remitente | `plan@konsul.digital` |

### Ejemplo de Uso en Plantilla:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>🎉 ¡Pago Exitoso!</h1>
  
  <p>Hola {{userName}},</p>
  
  <p>Tu pago ha sido procesado exitosamente. Tu dashboard de negocio está listo:</p>
  
  <h2>Credenciales de Acceso:</h2>
  <p><strong>Email:</strong> {{userEmail}}</p>
  <p><strong>Contraseña:</strong> {{password}}</p>
  
  <h2>Información del Dashboard:</h2>
  <p><strong>Idea:</strong> {{idea}}</p>
  <p><strong>ID del Dashboard:</strong> {{dashboardId}}</p>
  <p><strong>Fecha de Creación:</strong> {{creationDate}}</p>
  <p><strong>Válido hasta:</strong> {{expirationDate}}</p>
  
  <a href="{{dashboardUrl}}">Acceder a mi Dashboard</a>
  
  <p>Saludos,<br>{{name}}<br>{{email}}</p>
</body>
</html>
```

### Configuración en EmailJS:

- **To Email:** `{{to_email}}` ⚠️ **OBLIGATORIO**
- **From Email:** `plan@konsul.digital` o `{{email}}`
- **Subject:** `{{subject}}`

---

## 📧 3. Email de Seguimiento (Follow-up)

**Template ID:** `template_hyeermb` (mismo que pago exitoso, pero con diferentes variables)

### Variables Disponibles:

| Variable en Plantilla | Nombre en Código | Tipo | Descripción | Ejemplo |
|----------------------|------------------|------|-------------|---------|
| `{{to_email}}` | `to_email` | string | **Email del destinatario (OBLIGATORIO en "To Email")** | `valverde@cranealo.com` |
| `{{subject}}` | `subject` | string | Asunto del email | `🚀 Seguimiento de tu Plan de Acción: Mi Idea` |
| `{{userName}}` | `userName` | string | Nombre del usuario (extraído del HTML o email) | `Juan Pérez` |
| `{{name}}` | `name` | string | Nombre del remitente | `Konsul Plan` |
| `{{email}}` | `email` | string | Email del remitente | `valverde@cranealo.com` |

**Nota:** El email de seguimiento usa HTML pre-generado, por lo que las variables son limitadas. El contenido principal está en el HTML que se envía.

### Configuración en EmailJS:

- **To Email:** `{{to_email}}` ⚠️ **OBLIGATORIO**
- **From Email:** `plan@konsul.digital` o `{{email}}`
- **Subject:** `{{subject}}`

---

## ⚠️ IMPORTANTE: Diferencias en Nombres de Variables

### Plan de Acción vs Pago Exitoso:

| Plan de Acción | Pago Exitoso | Nota |
|----------------|--------------|------|
| `{{user_name}}` | `{{userName}}` | ⚠️ Diferente formato (snake_case vs camelCase) |
| `{{user_email}}` | `{{userEmail}}` | ⚠️ Diferente formato |
| `{{step_number}}` | N/A | Solo en plan de acción |
| `{{step_title}}` | N/A | Solo en plan de acción |
| `{{password}}` | `{{password}}` | Solo en pago exitoso |
| `{{dashboardId}}` | `{{dashboardId}}` | Solo en pago exitoso |

### Variables Comunes a Todos:

- `{{to_email}}` - **SIEMPRE usar en "To Email"**
- `{{subject}}` - Asunto del email
- `{{name}}` - Nombre del remitente
- `{{email}}` - Email del remitente

---

## ✅ Checklist de Configuración

### Para Email de Plan de Acción:
- [ ] Campo "To Email" = `{{to_email}}`
- [ ] Campo "Subject" = `{{subject}}`
- [ ] Variables en contenido: `{{user_name}}`, `{{idea}}`, `{{step_number}}`, `{{step_title}}`, etc.

### Para Email de Pago Exitoso:
- [ ] Campo "To Email" = `{{to_email}}`
- [ ] Campo "Subject" = `{{subject}}`
- [ ] Variables en contenido: `{{userName}}`, `{{password}}`, `{{dashboardId}}`, `{{idea}}`, etc.

### Para Email de Seguimiento:
- [ ] Campo "To Email" = `{{to_email}}`
- [ ] Campo "Subject" = `{{subject}}`
- [ ] Variables en contenido: `{{userName}}`, `{{name}}`, `{{email}}`

---

## 🧪 Probar Variables

Para probar que las variables funcionan correctamente, usa este código en la consola:

```javascript
// Ver variables del Plan de Acción
console.log('Variables Plan de Acción:', {
  to_email: 'valverde@cranealo.com',
  subject: '📋 Recordatorio: Paso 1 - Validar tu idea',
  user_name: 'Juan Pérez',
  user_email: 'valverde@cranealo.com',
  idea: 'Plataforma de visualizar arte',
  step_number: '1',
  step_title: 'Validar tu idea con usuarios reales',
  step_description: 'Realiza entrevistas con usuarios potenciales',
  due_date: '20 de noviembre de 2024',
  dashboard_url: window.location.origin,
  name: 'Konsul Plan',
  email: 'plan@konsul.digital'
});

// Ver variables de Pago Exitoso
console.log('Variables Pago Exitoso:', {
  to_email: 'valverde@cranealo.com',
  subject: '🎉 ¡Pago Exitoso! Tu Dashboard de Negocio está Listo',
  userName: 'Juan Pérez',
  userEmail: 'valverde@cranealo.com',
  dashboardId: 'recABC123XYZ',
  password: 'P@ssw0rd123',
  idea: 'Plataforma de visualizar arte',
  creationDate: '15 de noviembre de 2024',
  expirationDate: '15 de diciembre de 2024',
  dashboardUrl: window.location.origin,
  name: 'Konsul Plan',
  email: 'plan@konsul.digital'
});
```

---

## 📚 Referencias

- **Plan de Acción:** `src/services/actionPlanEmailScheduler.ts` línea 239
- **Pago Exitoso:** `src/services/emailService.ts` línea 389
- **Seguimiento:** `src/services/emailService.ts` línea 520


