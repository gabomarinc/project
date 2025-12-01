# 📧 Sistema de Emails en Segundo Plano - Backend

Este documento explica el nuevo sistema de emails del plan de acción que funciona en segundo plano, incluso cuando el usuario no está usando la aplicación.

## 🎯 Funcionalidad

El sistema ahora:
- ✅ **Guarda los emails programados en Airtable** cuando se crea/actualiza un dashboard
- ✅ **Envía emails automáticamente desde el servidor** usando un job programado
- ✅ **Funciona sin que el usuario tenga la app abierta**
- ✅ **Verifica y envía emails cada hora** automáticamente mediante **GitHub Actions**

## 📁 Archivos Creados

### 1. `api/schedule-action-plan-emails.ts`
Endpoint API que guarda los emails programados en Airtable cuando el usuario crea/actualiza su dashboard.

**Uso:**
- Se llama automáticamente desde el frontend cuando se programa un plan de acción
- Guarda todos los emails programados en el campo `scheduled_action_plan_emails` del dashboard en Airtable

### 2. `api/send-scheduled-emails.ts`
 Job backend que verifica y envía emails que están listos.

**Funcionamiento:**
- Busca todos los dashboards activos con emails programados
- Verifica qué emails deben enviarse hoy (fecha de envío = hoy)
- Envía los emails usando EmailJS
- Marca los emails como enviados en Airtable

### 3. `.github/workflows/send-scheduled-emails.yml`
Workflow de **GitHub Actions** que se ejecuta cada hora y llama al endpoint `/api/send-scheduled-emails` desplegado en Vercel.

**Funcionamiento:**
- Se ejecuta automáticamente cada hora (trigger `schedule` de GitHub Actions)
- Hace una petición HTTP `GET` a tu endpoint de Vercel
- Envía un header `Authorization: Bearer CRON_SECRET` para proteger el job

## 🔧 Configuración Requerida

### 1. Variables de Entorno en Vercel

Asegúrate de tener estas variables configuradas en Vercel:

```bash
# Airtable
AIRTABLE_BASE_ID=appHgGF7B9ojxqRnA
AIRTABLE_TABLE_NAME=Dashboards
AIRTABLE_PERSONAL_ACCESS_TOKEN=tu_token_completo

# EmailJS
EMAILJS_SERVICE_ID=service_bkwuq8a
EMAILJS_ACTION_PLAN_TEMPLATE_ID=template_m8c3dj8
EMAILJS_USER_ID=f1tQ_gHsbkod_to3J

# Opcional: Secret para proteger el cron job
CRON_SECRET=tu_secret_aleatorio
```

**Nota:** Las variables pueden usar el prefijo `VITE_` o no, el código maneja ambos casos.

### 2. Secrets en GitHub Actions

En tu repositorio de GitHub, ve a:
- `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Configura al menos:

```bash
SEND_SCHEDULED_EMAILS_URL=https://TU_DOMINIO_VERSEL/api/send-scheduled-emails
CRON_SECRET=el_mismo_valor_que_USAS_en_Vercel
```

> `SEND_SCHEDULED_EMAILS_URL` debe apuntar al endpoint de producción en Vercel (`konsul-plan.vercel.app` o el dominio que estés usando).

### 3. Campos en Airtable

Asegúrate de que tu tabla `Dashboards` en Airtable tenga estos campos:

- `scheduled_action_plan_emails` (Long text) - Almacena JSON con los emails programados
- `action_plan_emails_last_updated` (Date) - Última vez que se actualizaron los emails
- `action_plan_emails_last_processed` (Date) - Última vez que se procesaron los emails

## 🚀 Cómo Funciona

### Flujo Completo:

1. **Usuario crea/actualiza dashboard:**
   - El frontend calcula las fechas de vencimiento
   - Llama a `actionPlanEmailScheduler.scheduleAllStepEmails()`
   - Esto programa los emails localmente (para feedback inmediato)
   - Y también guarda los emails en Airtable vía API

2. **Guardado en Airtable:**
   - El endpoint `/api/schedule-action-plan-emails` recibe los emails
   - Los guarda en el campo `scheduled_action_plan_emails` del dashboard
   - Formato: JSON con array de objetos con información de cada email

3. **Envío automático (Job programado):**
- Cada hora, **GitHub Actions** ejecuta el workflow `send-scheduled-emails.yml`
- El workflow llama al endpoint `/api/send-scheduled-emails` en Vercel
   - Busca dashboards con emails programados
   - Verifica qué emails deben enviarse hoy (sendDate = hoy)
   - Envía los emails usando EmailJS
   - Marca los emails como enviados en Airtable

## 📊 Estructura de Datos

### Emails Programados (JSON en Airtable):

```json
[
  {
    "stepNumber": 1,
    "stepTitle": "Validar tu idea con usuarios reales",
    "stepDescription": "Realiza entrevistas con al menos 10 usuarios potenciales...",
    "dueDate": "2024-11-16",
    "sendDate": "2024-11-15",
    "sent": false,
    "scheduledAt": "2024-11-10T10:00:00.000Z"
  },
  {
    "stepNumber": 2,
    "stepTitle": "Definir tu propuesta de valor",
    "stepDescription": "Crea una propuesta de valor clara y concisa...",
    "dueDate": "2024-11-23",
    "sendDate": "2024-11-22",
    "sent": false,
    "scheduledAt": "2024-11-10T10:00:00.000Z"
  }
  // ... más pasos
]
```

## 🧪 Testing

### Probar el Endpoint de Programación:

```bash
curl -X POST https://tu-dominio.com/api/schedule-action-plan-emails \
  -H "Content-Type: application/json" \
  -d '{
    "dashboardId": "tu_dashboard_id",
    "scheduledEmails": [
      {
        "dashboardId": "tu_dashboard_id",
        "userEmail": "test@example.com",
        "userName": "Test User",
        "idea": "Test Idea",
        "stepNumber": 1,
        "stepTitle": "Test Step",
        "stepDescription": "Test Description",
        "dueDate": "2024-11-16",
        "sendDate": "2024-11-15",
        "sent": false
      }
    ]
  }'
```

### Probar el Job de Envío Manualmente (endpoint):

```bash
curl -X GET https://tu-dominio.com/api/send-scheduled-emails \
  -H "Authorization: Bearer tu_cron_secret"
```

O desde Vercel Dashboard:
- Ve a tu proyecto
- Settings → Cron Jobs
- Haz clic en "Run Now" para probar manualmente

## 🔒 Seguridad

### Protección del Endpoint de Envío:

El endpoint `/api/send-scheduled-emails` puede protegerse con un secret:

1. Agrega `CRON_SECRET` en las variables de entorno de Vercel
2. El endpoint verificará el header `Authorization: Bearer {CRON_SECRET}`
3. En GitHub Actions, configura el mismo `CRON_SECRET` como secret y mándalo en el header

## 📝 Logs y Monitoreo

### Ver Logs del Cron Job:

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Ve a "Functions" → "Cron Jobs"
4. Haz clic en el cron job para ver logs

### Verificar Emails Enviados:

Los emails enviados se marcan con `sent: true` en Airtable. Puedes verificar:
- Campo `scheduled_action_plan_emails` en el dashboard
- Campo `action_plan_emails_last_processed` muestra la última vez que se procesaron

## 🐛 Troubleshooting

### Los emails no se envían:

1. **Verifica que el cron job esté configurado:**
   - Revisa `vercel.json` está en la raíz del proyecto
   - Verifica que Vercel haya detectado el cron job

2. **Verifica las variables de entorno:**
   - Todas las variables deben estar configuradas en Vercel
   - Reinicia el deployment después de agregar variables

3. **Verifica los logs:**
   - Revisa los logs del cron job en Vercel
   - Busca errores de autenticación o configuración

4. **Verifica que los emails estén guardados:**
   - Revisa el campo `scheduled_action_plan_emails` en Airtable
   - Verifica que `sendDate` sea la fecha correcta

### El endpoint de programación falla:

1. **Verifica que el dashboardId sea válido**
2. **Verifica que el token de Airtable tenga permisos de escritura**
3. **Revisa los logs del endpoint en Vercel**

## ✅ Ventajas del Nuevo Sistema

- ✅ **Funciona sin app abierta:** Los emails se envían desde el servidor
- ✅ **Confiabilidad:** No depende del navegador del usuario
- ✅ **Escalable:** Puede manejar miles de dashboards
- ✅ **Monitoreable:** Logs centralizados en Vercel
- ✅ **Resiliente:** Si un email falla, se puede reintentar

## 🔄 Migración

Si ya tienes dashboards con el sistema anterior:
- Los nuevos dashboards usarán automáticamente el nuevo sistema
- Los dashboards antiguos seguirán funcionando con el sistema local (si el usuario tiene la app abierta)
- Puedes migrar dashboards antiguos llamando al endpoint de programación manualmente

