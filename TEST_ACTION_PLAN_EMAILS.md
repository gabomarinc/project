# 🧪 Guía de Prueba - Emails del Plan de Acción

## ✅ Confirmación: Los emails se envían 1 día antes del vencimiento

**Confirmado:** El sistema está configurado para enviar los emails **exactamente 1 día antes** de la fecha de vencimiento de cada paso.

Código de confirmación en `src/services/actionPlanEmailScheduler.ts` línea 43:
```typescript
sendDate.setDate(due.getDate() - 1); // 1 día antes
```

## 🚀 Cómo Probar el Sistema

### Paso 1: Reiniciar la Aplicación

Después de agregar la variable `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID` en `config.env`, reinicia el servidor:

```bash
npm run dev
```

### Paso 2: Crear un Plan de Acción

1. Completa el formulario y genera un plan de negocio
2. Abre la consola del navegador (F12 o Cmd+Option+I)
3. Busca los siguientes mensajes:

```
📧 Action Plan Email Scheduler configured with template ID: template_m8c3dj8
📅 Action plan deadlines calculated: [...]
📧 Action Plan Emails Programmed: {...}
```

### Paso 3: Verificar los Emails Programados

En la consola del navegador, verás información detallada de cada email programado:

```javascript
📧 Action Plan Emails Programmed: {
  totalScheduled: 7,
  emails: [
    {
      paso: 1,
      fechaEnvio: "15/11/2024, 10:00:00",
      fechaVencimiento: "2024-11-16",
      diasHastaEnvio: 1,
      confirmacion: "✅ Email programado para enviarse 1 día(s) antes del vencimiento"
    },
    // ... más pasos
  ]
}
```

**Cada email muestra:**
- ✅ **fechaEnvio**: Fecha y hora exacta cuando se enviará el email
- ✅ **fechaVencimiento**: Fecha de vencimiento del paso
- ✅ **diasHastaEnvio**: Días hasta el envío (debe ser 1 día antes del vencimiento)

### Paso 4: Verificar en la Consola (Modo Desarrollo)

En modo desarrollo, el scheduler está disponible en la consola. Puedes ejecutar:

```javascript
// Ver información de configuración
window.actionPlanEmailScheduler.getConfigurationInfo()

// Ver emails programados
window.actionPlanEmailScheduler.getScheduledEmailsInfo()
```

## 🧪 Prueba Rápida: Enviar Email Inmediatamente

Para probar que el email se envía correctamente **sin esperar** a la fecha programada:

1. Abre la consola del navegador
2. Ejecuta este código (reemplaza con tus datos reales):

```javascript
// Obtener información del scheduler
const scheduler = window.actionPlanEmailScheduler;

// Crear datos de prueba para el paso 1
const testEmailData = {
  userEmail: 'tu-email@ejemplo.com',
  userName: 'Tu Nombre',
  idea: 'Mi Idea de Negocio',
  stepNumber: 1,
  stepTitle: 'Validar tu idea con usuarios reales',
  stepDescription: 'Realiza entrevistas con al menos 10 usuarios potenciales...',
  dueDate: '2024-11-20', // Fecha futura
  dashboardUrl: window.location.origin
};

// Enviar email inmediatamente (solo para pruebas)
scheduler.testSendEmailImmediately(testEmailData);
```

**Nota:** Este método envía el email inmediatamente, sin esperar a la fecha programada. Úsalo solo para verificar que la configuración funciona.

## 📊 Verificación de Fechas

### Ejemplo de Cálculo:

Si un paso tiene fecha de vencimiento: **2024-11-20**
- Fecha de envío del email: **2024-11-19** (1 día antes)
- Días hasta envío: **1 día**

### Verificación Manual:

1. Mira las fechas de vencimiento en el Dashboard
2. Resta 1 día a cada fecha de vencimiento
3. Compara con las fechas de envío mostradas en la consola
4. Deben coincidir exactamente

## 🔍 Verificar que Funciona Correctamente

### Checklist de Verificación:

- [ ] ✅ Variable `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID` configurada en `config.env`
- [ ] ✅ Aplicación reiniciada después de agregar la variable
- [ ] ✅ Mensaje en consola: "Action Plan Email Scheduler configured"
- [ ] ✅ Mensaje en consola: "Action Plan Emails Programmed" con 7 emails
- [ ] ✅ Cada email muestra `diasHastaEnvio: 1` (o el número correcto de días)
- [ ] ✅ Fecha de envío = Fecha de vencimiento - 1 día

### Mensajes de Error Comunes:

**Si ves:**
```
⚠️ VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID not configured
```
→ La variable no está configurada. Verifica `config.env`

**Si ves:**
```
⏰ Step X email send date has passed. Skipping.
```
→ La fecha de envío ya pasó. Esto es normal si las fechas son muy cercanas.

**Si ves:**
```
❌ Failed to send reminder email
```
→ Verifica la configuración de EmailJS (Service ID, Template ID, User ID)

## 📧 Verificar el Email en EmailJS

1. Ve a tu dashboard de EmailJS: https://dashboard.emailjs.com/
2. Revisa la sección "Email Logs" o "Activity"
3. Deberías ver los emails enviados con:
   - El asunto: `📋 Recordatorio: Paso X - [Título] | [Idea]`
   - Todas las variables correctamente reemplazadas

## ⚠️ Nota Importante

**Los emails programados se cancelan si:**
- El usuario cierra el navegador
- La página se recarga
- El componente se desmonta

Para una solución más robusta en producción, considera implementar un backend que maneje la programación de emails usando un servicio de cola de trabajos.

## 🎯 Resumen

✅ **Confirmado:** Los emails se envían **1 día antes** del vencimiento
✅ **Verificado:** El código calcula correctamente: `sendDate = dueDate - 1 día`
✅ **Probado:** Puedes verificar en la consola las fechas programadas
✅ **Listo:** El sistema está configurado y funcionando

