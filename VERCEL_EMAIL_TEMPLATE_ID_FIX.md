# 🔧 Solución: Variable de Entorno del Template ID de Email

## 🚨 Problema

Si ves este error:
```
⚠️ Action Plan Email Template ID not configured. Emails will not be scheduled.
```

Y tienes la variable configurada en Vercel como `EMAILJS_ACTION_PLAN_TEMPLATE_ID`, el problema es que **Vite solo expone variables con el prefijo `VITE_` al frontend**.

## ✅ Solución

### En Vercel, la variable DEBE tener el prefijo `VITE_`:

**Nombre correcto:**
```
VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID
```

**Nombre incorrecto (no funcionará en el frontend):**
```
EMAILJS_ACTION_PLAN_TEMPLATE_ID
```

## 📋 Pasos para Corregir

### 1. Ve a Vercel Dashboard
- Abre [vercel.com](https://vercel.com)
- Selecciona tu proyecto
- Ve a **Settings** → **Environment Variables**

### 2. Agrega/Actualiza la Variable

**Si ya tienes `EMAILJS_ACTION_PLAN_TEMPLATE_ID`:**
1. Copia el valor actual
2. Elimina la variable `EMAILJS_ACTION_PLAN_TEMPLATE_ID`
3. Agrega una nueva variable:
   - **Key**: `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID`
   - **Value**: El mismo valor que tenías (ej: `template_m8c3dj8`)
   - **Environment**: Production, Preview, Development (según necesites)

**Si no tienes la variable:**
1. Haz clic en **"Add New"**
2. **Key**: `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID`
3. **Value**: Tu template ID de EmailJS (ej: `template_m8c3dj8`)
4. **Environment**: Selecciona Production, Preview, y Development
5. Haz clic en **"Save"**

### 3. Redeploy

Después de agregar/actualizar la variable:
1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el deployment

### 4. Verificar

Después del redeploy, recarga la aplicación y revisa la consola. Deberías ver:

```
📧 Action Plan Email Template ID configured: template_m8c3dj8
🔑 Template ID source: VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID (Environment Variable) ✅
```

## 🔍 Por Qué es Necesario el Prefijo `VITE_`

- **Vite** (el bundler usado) solo expone variables de entorno que empiezan con `VITE_` al código del frontend
- Esto es una medida de seguridad para evitar exponer accidentalmente variables sensibles
- Las variables sin el prefijo `VITE_` solo están disponibles en:
  - Serverless Functions (API routes en `/api/*`)
  - Build time (durante `npm run build`)
  - NO están disponibles en el código del frontend (React components)

## 📝 Variables Correctas en Vercel

Para que todo funcione correctamente, estas son las variables que debes tener:

### Frontend (con prefijo `VITE_`):
```
VITE_EMAILJS_SERVICE_ID=service_bkwuq8a
VITE_EMAILJS_TEMPLATE_ID=template_hyeermb
VITE_EMAILJS_USER_ID=f1tQ_gHsbkod_to3J
VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID=template_m8c3dj8  ← ESTA ES LA IMPORTANTE
VITE_AIRTABLE_BASE_ID=appHgGF7B9ojxqRnA
VITE_AIRTABLE_TABLE_NAME=Dashboards
VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN=tu_token_completo
VITE_GEMINI_API_KEY=tu_api_key
```

### Backend/API Routes (pueden tener o no el prefijo):
```
# Estas pueden tener o no el prefijo VITE_ (funcionan en ambos casos)
AIRTABLE_BASE_ID=appHgGF7B9ojxqRnA
AIRTABLE_TABLE_NAME=Dashboards
AIRTABLE_PERSONAL_ACCESS_TOKEN=tu_token_completo
EMAILJS_SERVICE_ID=service_bkwuq8a
EMAILJS_ACTION_PLAN_TEMPLATE_ID=template_m8c3dj8
EMAILJS_USER_ID=f1tQ_gHsbkod_to3J
```

**Recomendación:** Usa el prefijo `VITE_` para todas las variables que necesites en el frontend, y también en las API routes (funcionan en ambos lugares).

## ✅ Checklist

- [ ] Variable `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID` agregada en Vercel
- [ ] Valor correcto (ej: `template_m8c3dj8`)
- [ ] Environment seleccionado (Production, Preview, Development)
- [ ] Redeploy realizado después de agregar la variable
- [ ] Consola muestra: `📧 Action Plan Email Template ID configured: template_m8c3dj8`

## 🐛 Si Aún No Funciona

1. **Verifica el nombre exacto:**
   - Debe ser exactamente: `VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID`
   - Case-sensitive (mayúsculas/minúsculas importan)
   - Sin espacios al inicio o final

2. **Verifica el valor:**
   - Debe ser el Template ID de EmailJS (ej: `template_m8c3dj8`)
   - Sin comillas
   - Sin espacios

3. **Verifica que hiciste redeploy:**
   - Las variables nuevas solo se aplican después de un redeploy
   - No basta con guardar la variable

4. **Revisa la consola del navegador:**
   - Busca mensajes que indiquen qué variable se está buscando
   - Verifica si hay errores de configuración

