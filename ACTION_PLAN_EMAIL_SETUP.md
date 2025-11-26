# 📧 Configuración de Emails Automáticos del Plan de Acción

Este documento explica cómo configurar el sistema de emails automáticos que envía recordatorios 1 día antes del vencimiento de cada paso del plan de acción.

## 🎯 Funcionalidad

El sistema automáticamente:
- ✅ Calcula las fechas de vencimiento de cada uno de los 7 pasos del plan de acción
- ✅ Programa emails de recordatorio para enviarse **1 día antes** del vencimiento de cada paso
- ✅ Usa plantillas de EmailJS con variables personalizables
- ✅ Incluye información específica del paso en el asunto del email

## 📋 Requisitos Previos

1. **Cuenta de EmailJS** configurada con:
   - Service ID
   - User ID
   - Template ID para los emails del plan de acción

2. **Plantilla de EmailJS** creada con las siguientes variables disponibles:
   - `to_email`: **Email del destinatario (OBLIGATORIO usar en campo "To Email")**
   - `subject`: Asunto del email (se genera automáticamente)
   - `user_name`: Nombre del usuario
   - `user_email`: Email del usuario
   - `idea`: Idea de negocio
   - `step_number`: Número del paso (1-7)
   - `step_title`: Título del paso
   - `step_description`: Descripción del paso
   - `due_date`: Fecha de vencimiento formateada
   - `dashboard_url`: URL del dashboard
   - `name`: Nombre del remitente (Konsul Plan)
   - `email`: Email del remitente (plan@konsul.digital)

   **⚠️ IMPORTANTE:** En la plantilla de EmailJS, el campo **"To Email"** DEBE usar `{{to_email}}`, NO un email fijo como `plan@konsul.digital`. Ver `EMAILJS_TEMPLATE_SETUP.md` para más detalles.

## ⚙️ Configuración

### Paso 1: Crear la Plantilla en EmailJS

1. Ve a tu cuenta de EmailJS: https://dashboard.emailjs.com/
2. Crea una nueva plantilla de email
3. Configura las variables en la plantilla usando la sintaxis `{{variable_name}}`
4. Guarda el **Template ID** de la plantilla

### Paso 2: Configurar la Variable de Entorno

Agrega la siguiente variable a tu archivo `.env.local` o `config.env`:

```env
VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID=tu_template_id_aqui
```

**Ejemplo:**
```env
VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID=template_abc123xyz
```

### Paso 3: Reiniciar la Aplicación

Después de agregar la variable de entorno, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## 📝 Formato del Asunto

El asunto del email se genera automáticamente con el siguiente formato:

```
📋 Recordatorio: Paso {stepNumber} - {stepTitle} | {idea}
```

**Ejemplo:**
```
📋 Recordatorio: Paso 3 - Validar tu idea con usuarios reales | Mi Startup App
```

## 🔄 Cómo Funciona

1. **Cuando se genera el plan de acción:**
   - El sistema calcula las fechas de vencimiento para cada paso
   - Programa automáticamente los emails para enviarse 1 día antes de cada vencimiento

2. **Programación de emails:**
   - Cada email se programa usando `setTimeout` en el navegador
   - Los emails se envían automáticamente cuando llega el momento
   - Si el usuario cierra el navegador, los emails programados se cancelan

3. **Variables disponibles en la plantilla:**
   - Todas las variables mencionadas arriba están disponibles
   - El asunto se genera automáticamente pero puedes personalizarlo en la plantilla

## 🎨 Ejemplo de Plantilla EmailJS

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
  
  <p>Saludos,<br>El equipo de Konsul Plan</p>
</body>
</html>
```

## 🔧 Personalización del Asunto

Si quieres personalizar el formato del asunto, puedes modificar el método `generateSubject` en:

```typescript
src/services/actionPlanEmailScheduler.ts
```

Línea ~180:
```typescript
private generateSubject(emailData: ActionPlanStepEmailData): string {
  // Personaliza el formato del asunto aquí
  return `📋 Recordatorio: Paso ${emailData.stepNumber} - ${emailData.stepTitle} | ${emailData.idea}`;
}
```

## 🐛 Solución de Problemas

### Los emails no se están programando

1. **Verifica la variable de entorno:**
   ```bash
   echo $VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID
   ```

2. **Revisa la consola del navegador:**
   - Busca mensajes que digan "Action Plan Email Scheduler configured"
   - Si ves "⚠️ VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID not configured", la variable no está configurada

3. **Verifica que el template ID sea correcto:**
   - Debe coincidir exactamente con el ID de tu plantilla en EmailJS

### Los emails no se están enviando

1. **Verifica la configuración de EmailJS:**
   - Service ID, Template ID y User ID deben estar correctos
   - La plantilla debe tener todas las variables necesarias

2. **Revisa los logs en la consola:**
   - Busca mensajes de error relacionados con EmailJS
   - Verifica que la respuesta de EmailJS sea exitosa (status 200)

### Los emails se envían en el momento incorrecto

- Los emails se programan para enviarse **1 día antes** del vencimiento
- Si necesitas cambiar este comportamiento, modifica el método `calculateSendDate` en `actionPlanEmailScheduler.ts`

## 📚 Archivos Relacionados

- `src/services/actionPlanEmailScheduler.ts` - Servicio principal de programación
- `src/config/email.ts` - Configuración de EmailJS
- `src/components/Dashboard.tsx` - Integración del scheduler
- `src/utils/deadlineUtils.ts` - Cálculo de fechas de vencimiento

## ✅ Checklist de Configuración

- [ ] Cuenta de EmailJS creada y configurada
- [ ] Plantilla de email creada en EmailJS con todas las variables
- [ ] Template ID copiado de EmailJS
- [ ] Variable `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID` agregada al `.env.local`
- [ ] Aplicación reiniciada después de agregar la variable
- [ ] Verificado en consola que el scheduler se configuró correctamente
- [ ] Probado que los emails se programan correctamente

---

**Nota:** Los emails programados se cancelan si el usuario cierra el navegador. Para una solución más robusta en producción, considera implementar un backend que maneje la programación de emails usando un servicio de cola de trabajos (como Bull, Agenda, o similar).

