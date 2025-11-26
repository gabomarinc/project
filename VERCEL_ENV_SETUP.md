# 🔐 Configuración de Variables de Entorno en Vercel

Este documento explica cómo configurar las variables de entorno en Vercel para mantener seguras tus API keys.

## 🚨 Importante: Seguridad de API Keys

**NUNCA** expongas tus API keys en el código fuente. Google puede bloquear el acceso si detecta que las keys están expuestas públicamente en GitHub.

## 📋 Variables de Entorno Requeridas

### 1. Gemini API Key (OBLIGATORIA)

Esta es la variable más importante para que la aplicación funcione:

```
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

**Cómo obtener tu API key:**
1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

## 🔧 Configurar en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a tu proyecto en Vercel**
   - Abre [vercel.com](https://vercel.com)
   - Selecciona tu proyecto

2. **Accede a Settings**
   - Haz clic en "Settings" en el menú superior
   - Selecciona "Environment Variables" en el menú lateral

3. **Agrega la variable**
   - Haz clic en "Add New"
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: Pega tu API key de Gemini
   - **Environment**: Selecciona "Production", "Preview", y "Development" (o solo Production si prefieres)
   - Haz clic en "Save"

4. **Redeploy**
   - Después de agregar la variable, ve a "Deployments"
   - Haz clic en los tres puntos (⋯) del deployment más reciente
   - Selecciona "Redeploy"
   - Esto es necesario para que las nuevas variables de entorno se apliquen

### Opción 2: Desde la CLI de Vercel

```bash
# Instala Vercel CLI si no lo tienes
npm i -g vercel

# Inicia sesión
vercel login

# Agrega la variable de entorno
vercel env add VITE_GEMINI_API_KEY production

# Cuando te pida el valor, pega tu API key
# Repite para preview y development si es necesario
vercel env add VITE_GEMINI_API_KEY preview
vercel env add VITE_GEMINI_API_KEY development
```

## ✅ Verificar Configuración

Después de configurar y hacer redeploy:

1. **Revisa los logs de build**
   - En Vercel, ve a "Deployments"
   - Haz clic en el deployment más reciente
   - Revisa los logs para ver si hay errores

2. **Prueba la aplicación**
   - Abre tu aplicación en producción
   - Intenta generar un preview
   - Si funciona, verás en la consola: `✅ Using Gemini API key from environment variable`

## 🔒 Variables de Entorno Adicionales (Opcionales)

Si también quieres mover otras API keys a variables de entorno:

```bash
# SimilarWeb (opcional)
VITE_SIMILARWEB_API_KEY=tu_similarweb_key

# Airtable (si no está ya configurada)
VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN=tu_airtable_token
VITE_AIRTABLE_BASE_ID=tu_base_id
VITE_AIRTABLE_TABLE_NAME=tu_table_name

# EmailJS (si usas EmailJS)
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_USER_ID=tu_user_id
VITE_EMAILJS_ACTION_PLAN_TEMPLATE_ID=tu_action_plan_template_id
```

## 🛠️ Configuración Local (Desarrollo)

Para desarrollo local, crea un archivo `.env` en la raíz del proyecto:

```bash
# .env (NO subir a GitHub)
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

**Importante:**
- El archivo `.env` debe estar en `.gitignore`
- Nunca subas tu `.env` a GitHub
- Usa `config.env.example` como plantilla

## 🚨 Troubleshooting

### Error: "VITE_GEMINI_API_KEY environment variable is required"

**Solución:**
1. Verifica que agregaste la variable en Vercel
2. Asegúrate de hacer redeploy después de agregar la variable
3. Verifica que el nombre de la variable sea exactamente `VITE_GEMINI_API_KEY` (case-sensitive)

### Error: "403 Forbidden" en todos los modelos

**Posibles causas:**
1. La API key está expuesta en el código (Google la bloquea)
2. La API key es inválida o fue revocada
3. La API key no tiene permisos para los modelos

**Solución:**
1. Verifica que la API key esté solo en variables de entorno (no en código)
2. Genera una nueva API key en [Google AI Studio](https://aistudio.google.com/apikey)
3. Actualiza la variable en Vercel y haz redeploy

### La aplicación funciona localmente pero no en Vercel

**Solución:**
1. Verifica que agregaste la variable en Vercel (no solo en `.env` local)
2. Asegúrate de hacer redeploy después de agregar variables
3. Verifica que seleccionaste el ambiente correcto (Production/Preview/Development)

## 📚 Recursos Adicionales

- [Documentación de Vercel sobre Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google AI Studio - API Keys](https://aistudio.google.com/apikey)
- [Vite - Variables de Entorno](https://vitejs.dev/guide/env-and-mode.html)

## ✅ Checklist

Antes de hacer deploy a producción, verifica:

- [ ] La API key está configurada en Vercel (no en código)
- [ ] El archivo `src/config/apiKeys.ts` NO contiene la API key real
- [ ] Hiciste redeploy después de agregar la variable
- [ ] La aplicación funciona correctamente en producción
- [ ] Los logs muestran "✅ Using Gemini API key from environment variable"


