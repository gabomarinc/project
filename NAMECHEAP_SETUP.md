# Configuración de Namecheap para Verificación de Dominios

Este documento explica cómo configurar la integración con Namecheap para verificar la disponibilidad de dominios y generar enlaces de afiliado.

## 🔑 Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Namecheap API Credentials
VITE_NAMECHEAP_API_USER=tu_api_user
VITE_NAMECHEAP_API_KEY=tu_api_key
VITE_NAMECHEAP_USERNAME=tu_username
VITE_NAMECHEAP_CLIENT_IP=tu_ip_publica

# Environment (true para sandbox, false para producción)
VITE_NAMECHEAP_SANDBOX=true

# Affiliate ID para ganar comisiones
VITE_NAMECHEAP_AFFILIATE_ID=tu_affiliate_id
```

## 📋 Pasos para Configurar Namecheap

### 1. Crear Cuenta en Namecheap
- Ve a [namecheap.com](https://www.namecheap.com)
- Crea una cuenta o inicia sesión
- Verifica tu cuenta

### 2. Obtener Credenciales de API
- Ve a [Namecheap API Management](https://ap.www.namecheap.com/settings/tools/apiaccess/)
- Habilita el acceso a la API
- Copia tu `API User`, `API Key`, y `Username`
- Tu `Client IP` es tu dirección IP pública

### 3. Configurar Programa de Afiliados
- Ve a [Namecheap Affiliate Program](https://www.namecheap.com/affiliates/)
- Regístrate en el programa de afiliados
- Obtén tu `Affiliate ID`
- Configura tu método de pago

### 4. Configurar Variables de Entorno
```bash
# Ejemplo de configuración
VITE_NAMECHEAP_API_USER=myapiuser
VITE_NAMECHEAP_API_KEY=abc123def456ghi789
VITE_NAMECHEAP_USERNAME=myusername
VITE_NAMECHEAP_CLIENT_IP=192.168.1.100
VITE_NAMECHEAP_SANDBOX=true
VITE_NAMECHEAP_AFFILIATE_ID=12345
```

## 🧪 Modo Sandbox vs Producción

### Sandbox (Desarrollo)
- Usa `VITE_NAMECHEAP_SANDBOX=true`
- Perfecto para pruebas y desarrollo
- No afecta dominios reales
- Respuestas simuladas

### Producción
- Usa `VITE_NAMECHEAP_SANDBOX=false`
- Verificaciones reales de dominios
- Genera enlaces de afiliado reales
- Requiere configuración completa

## 🔧 Funcionalidades Implementadas

### Verificación de Dominios
- ✅ Verificar disponibilidad de un dominio
- ✅ Verificar múltiples dominios en paralelo
- ✅ Generar variaciones de nombres de marca
- ✅ Validar formato de dominios

### Enlaces de Afiliado
- ✅ Generar enlaces con tu ID de afiliado
- ✅ Redirigir a página de compra de Namecheap
- ✅ Tracking automático de comisiones

### Extensiones Soportadas
- `.com`, `.net`, `.org`
- `.io`, `.co`, `.app`
- `.ai`, `.tech`
- `.co.uk`, `.es`

## 📊 Comisiones de Afiliado

Namecheap ofrece comisiones por:
- Registro de dominios nuevos
- Renovaciones de dominios
- Servicios adicionales (hosting, SSL, etc.)

**Comisión típica**: $5-15 USD por dominio registrado

## 🚨 Consideraciones Importantes

### Límites de API
- Namecheap tiene límites de rate limiting
- Máximo 3000 requests por hora
- Implementa caching para optimizar

### Privacidad
- Nunca expongas tus API keys en el frontend
- Usa variables de entorno
- Considera usar un proxy backend

### Monitoreo
- Monitorea el uso de la API
- Implementa logging de errores
- Configura alertas de límites

## 🔍 Testing

Para probar la integración:

1. Configura las variables de entorno
2. Usa el modo sandbox inicialmente
3. Verifica que los dominios se validen correctamente
4. Prueba los enlaces de afiliado
5. Cambia a producción cuando esté listo

## 📞 Soporte

- [Namecheap API Documentation](https://www.namecheap.com/support/api/)
- [Namecheap Affiliate Support](https://www.namecheap.com/support/knowledgebase/article.aspx/1019/29/affiliate-program-faq)
- [API Status Page](https://status.namecheap.com/)

