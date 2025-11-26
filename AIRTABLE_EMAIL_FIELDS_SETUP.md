# 📧 Configuración de Campos en Airtable para Emails Programados

Este documento explica cómo agregar los campos necesarios en Airtable para que el sistema de emails en segundo plano funcione correctamente.

## 🔧 Campos Requeridos

Necesitas agregar estos **3 campos nuevos** a tu tabla `Dashboards` en Airtable:

### 1. `scheduled_action_plan_emails` (Long text)
- **Tipo**: Long text
- **Descripción**: Almacena JSON con todos los emails programados
- **Formato**: JSON string con array de objetos

### 2. `action_plan_emails_last_updated` (Date)
- **Tipo**: Date
- **Descripción**: Última vez que se actualizaron los emails programados
- **Formato**: ISO 8601 date string

### 3. `action_plan_emails_last_processed` (Date)
- **Tipo**: Date
- **Descripción**: Última vez que el cron job procesó los emails
- **Formato**: ISO 8601 date string

## 📋 Pasos para Agregar los Campos

1. **Abre tu base de Airtable**
   - Ve a https://airtable.com
   - Abre la base `appHgGF7B9ojxqRnA`
   - Selecciona la tabla `Dashboards`

2. **Agregar Campo 1: `scheduled_action_plan_emails`**
   - Haz clic en el botón "+" al final de las columnas
   - Nombre: `scheduled_action_plan_emails`
   - Tipo: **Long text**
   - Haz clic en "Create field"

3. **Agregar Campo 2: `action_plan_emails_last_updated`**
   - Haz clic en el botón "+" al final de las columnas
   - Nombre: `action_plan_emails_last_updated`
   - Tipo: **Date**
   - Opciones: Marca "Include time" si está disponible
   - Haz clic en "Create field"

4. **Agregar Campo 3: `action_plan_emails_last_processed`**
   - Haz clic en el botón "+" al final de las columnas
   - Nombre: `action_plan_emails_last_processed`
   - Tipo: **Date**
   - Opciones: Marca "Include time" si está disponible
   - Haz clic en "Create field"

## ✅ Verificación

Después de agregar los campos:

1. **Recarga la aplicación**
2. **Crea o actualiza un dashboard**
3. **Revisa la consola del navegador** - deberías ver:
   ```
   💾 Guardando emails programados en Airtable...
   ✅ Scheduled emails saved to Airtable: {...}
   ```

4. **Verifica en Airtable**:
   - Abre el dashboard que acabas de crear/actualizar
   - El campo `scheduled_action_plan_emails` debería contener un JSON
   - El campo `action_plan_emails_last_updated` debería tener una fecha

## 🔍 Formato del JSON en `scheduled_action_plan_emails`

El campo contiene un JSON con este formato:

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

## 🐛 Troubleshooting

### El campo no se guarda:

1. **Verifica que el nombre del campo sea exacto** (case-sensitive):
   - `scheduled_action_plan_emails` (con guiones bajos)
   - No `scheduled-action-plan-emails` (con guiones)
   - No `Scheduled_Action_Plan_Emails` (con mayúsculas)

2. **Verifica que el tipo de campo sea correcto**:
   - `scheduled_action_plan_emails` debe ser **Long text**
   - Los otros dos deben ser **Date**

3. **Revisa la consola del navegador** para ver errores específicos

4. **Verifica que el dashboardId sea válido**:
   - Debe ser el ID del registro en Airtable (no el dashboard_id personalizado)
   - Se muestra en la consola cuando se carga el dashboard

### El JSON se guarda pero está vacío:

1. Verifica que el plan de acción tenga pasos
2. Verifica que las fechas de vencimiento se calculen correctamente
3. Revisa los logs en la consola para ver qué datos se están preparando

## 📝 Notas Importantes

- Los nombres de los campos **deben coincidir exactamente** con los definidos en `src/config/airtable.ts`
- Los campos son **case-sensitive** (mayúsculas/minúsculas importan)
- El campo `scheduled_action_plan_emails` debe ser **Long text** para almacenar JSON
- Los campos de fecha pueden ser **Date** o **Date with time**, ambos funcionan

