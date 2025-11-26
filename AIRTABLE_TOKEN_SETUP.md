# 🔐 Configuración de Token de Airtable

Este documento explica cómo configurar correctamente el token de Airtable para evitar errores 403 (Forbidden).

## 🚨 Error 403: Token sin Permisos

Si recibes un error **403 (Forbidden)**, significa que:
- ✅ El token es válido (no es un error 401)
- ❌ El token **NO tiene permisos** para acceder a la base de datos o tabla

## 📋 Pasos para Configurar el Token Correctamente

### 1. Crear o Verificar el Token en Airtable

1. **Ve a Airtable Tokens**
   - Abre: https://airtable.com/create/tokens
   - Inicia sesión con tu cuenta de Airtable

2. **Crear Nuevo Token**
   - Haz clic en "Create new token"
   - Dale un nombre descriptivo (ej: "Konsul Plan App")

3. **Configurar Permisos del Token**
   - **IMPORTANTE**: Selecciona la base de datos correcta
   - Base ID que estás usando: `appHgGF7B9ojxqRnA`
   - Tabla que estás usando: `Dashboards`
   
4. **Seleccionar Accesos**
   - Marca **"Read"** para leer datos
   - Marca **"Write"** para crear/actualizar datos
   - Marca **"Comment"** si necesitas comentarios (opcional)

5. **Copiar el Token Completo**
   - El token tiene dos partes separadas por un punto
   - Ejemplo: `patXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - **Copia TODO el token completo**

### 2. Configurar en Variables de Entorno

#### Para Desarrollo Local (.env)

Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```bash
VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN=patTU_TOKEN_COMPLETO_AQUI
VITE_AIRTABLE_BASE_ID=appHgGF7B9ojxqRnA
VITE_AIRTABLE_TABLE_NAME=Dashboards
```

**Importante:**
- El token debe estar completo (con ambas partes separadas por punto)
- No dejes espacios alrededor del `=`
- No uses comillas

#### Para Producción (Vercel)

1. **Ve a tu proyecto en Vercel**
   - Abre [vercel.com](https://vercel.com)
   - Selecciona tu proyecto

2. **Configurar Variables de Entorno**
   - Settings → Environment Variables
   - Agrega:
     - **Key**: `VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN`
     - **Value**: Tu token completo de Airtable
     - **Environment**: Production (y Preview si quieres)
   - Haz clic en "Save"

3. **Redeploy**
   - Ve a "Deployments"
   - Haz clic en los tres puntos (⋯) del último deployment
   - Selecciona "Redeploy"

### 3. Verificar que el Token Tenga Acceso a la Base Correcta

**CRÍTICO**: El token debe tener acceso específico a:
- **Base ID**: `appHgGF7B9ojxqRnA`
- **Tabla**: `Dashboards`

Si creaste el token pero no le diste acceso a esta base específica, obtendrás error 403.

**Cómo verificar:**
1. Ve a https://airtable.com/create/tokens
2. Encuentra tu token
3. Verifica que tenga acceso a la base `appHgGF7B9ojxqRnA`
4. Si no lo tiene, edita el token y agrega el acceso

## 🔍 Verificación

Después de configurar, en la consola del navegador deberías ver:

```
✅ [AIRTABLE] Using token from environment variable
🔑 [AIRTABLE] Token starts with: patXXXXXXXXX...
🔑 [AIRTABLE] Token length: [número mayor a 50]
🔑 [AIRTABLE] Base ID: appHgGF7B9ojxqRnA
🔑 [AIRTABLE] Table Name: Dashboards
```

## 🚨 Troubleshooting

### Error 403 Persiste

**Posibles causas:**

1. **Token sin acceso a la base**
   - Solución: Edita el token en Airtable y agrega acceso a la base `appHgGF7B9ojxqRnA`

2. **Base ID incorrecto**
   - Verifica que `VITE_AIRTABLE_BASE_ID` sea `appHgGF7B9ojxqRnA`
   - Verifica en Airtable que esta sea la base correcta

3. **Nombre de tabla incorrecto**
   - Verifica que `VITE_AIRTABLE_TABLE_NAME` sea `Dashboards` (exactamente, case-sensitive)
   - Verifica en Airtable que la tabla se llame exactamente así

4. **Token no cargado desde .env**
   - Reinicia el servidor de desarrollo después de actualizar `.env`
   - Verifica que el archivo `.env` esté en la raíz del proyecto
   - Verifica que no haya espacios o caracteres especiales en el token

### Cómo Obtener el Base ID Correcto

1. Abre tu base en Airtable
2. Ve a: https://airtable.com/api
3. Selecciona tu base
4. El Base ID aparece en la URL: `https://airtable.com/[BASE_ID]/api/docs`

### Cómo Verificar el Nombre de la Tabla

1. Abre tu base en Airtable
2. El nombre de la tabla aparece en la pestaña
3. Debe coincidir exactamente (case-sensitive) con `VITE_AIRTABLE_TABLE_NAME`

## ✅ Checklist

Antes de probar el login, verifica:

- [ ] Token creado en https://airtable.com/create/tokens
- [ ] Token tiene acceso a la base `appHgGF7B9ojxqRnA`
- [ ] Token tiene permisos de lectura y escritura
- [ ] Token completo (dos partes separadas por punto) en `.env`
- [ ] `VITE_AIRTABLE_BASE_ID` configurado correctamente
- [ ] `VITE_AIRTABLE_TABLE_NAME` configurado correctamente
- [ ] Servidor de desarrollo reiniciado después de cambios
- [ ] En producción, variables configuradas en Vercel y redeploy hecho

## 📚 Recursos

- [Airtable API Documentation](https://airtable.com/api)
- [Airtable Personal Access Tokens](https://airtable.com/create/tokens)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)


