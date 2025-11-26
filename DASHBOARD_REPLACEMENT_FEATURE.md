# 🔄 Sistema de Reemplazo de Dashboards - Múltiples Dashboards, Uno Activo

## ✅ Funcionalidad Implementada

El sistema ahora permite que los usuarios:
- ✅ **Generen dashboards ilimitados** (sin límite de cantidad)
- ✅ **Tengan solo uno activo a la vez** (el más reciente)
- ✅ **Reemplacen automáticamente** el dashboard anterior al crear uno nuevo

## 🔧 Cambios Implementados

### 1. Nuevo Método: `deactivateAllActiveDashboards()`

**Ubicación:** `src/services/airtableService.ts` línea 173

**Función:** Desactiva todos los dashboards activos de un usuario antes de crear uno nuevo.

```typescript
static async deactivateAllActiveDashboards(email: string): Promise<number>
```

**Comportamiento:**
- Busca todos los dashboards con `is_active = true` para el email dado
- Los desactiva poniendo `is_active = false`
- Retorna el número de dashboards desactivados

### 2. Modificación: `createDashboard()`

**Ubicación:** `src/services/airtableService.ts` línea 225

**Cambio:** Ahora desactiva automáticamente todos los dashboards activos antes de crear uno nuevo.

```typescript
// Antes de crear el nuevo dashboard:
const deactivatedCount = await this.deactivateAllActiveDashboards(email);
if (deactivatedCount > 0) {
  console.log(`🔄 ${deactivatedCount} dashboard(s) anterior(es) desactivado(s)`);
}
```

**Resultado:** El nuevo dashboard siempre se crea con `is_active = true`, y los anteriores quedan con `is_active = false`.

### 3. Modificación: `findDashboardByEmail()`

**Ubicación:** `src/services/airtableService.ts` línea 77

**Cambio:** Ahora acepta un parámetro `onlyActive` para buscar solo dashboards activos.

```typescript
static async findDashboardByEmail(email: string, onlyActive: boolean = true)
```

**Comportamiento:**
- Por defecto (`onlyActive = true`): Solo busca dashboards activos
- Si `onlyActive = false`: Busca todos los dashboards (el más reciente)
- Ordena por fecha de creación (más reciente primero)

### 4. Modificación: `createOrUpdateDashboard()`

**Ubicación:** `src/hooks/useAirtableDashboard.ts` línea 62

**Cambio:** Ahora acepta un parámetro `replaceExisting` para controlar el comportamiento.

```typescript
const createOrUpdateDashboard = async (
  email: string, 
  dashboardData: any, 
  projectInfo: any,
  replaceExisting: boolean = true // Por defecto: reemplazar
)
```

**Modos de Operación:**

#### Modo Reemplazo (`replaceExisting = true`) - **POR DEFECTO**
- Siempre crea un nuevo dashboard
- Desactiva automáticamente todos los dashboards anteriores
- El nuevo dashboard queda como el único activo

#### Modo Actualización (`replaceExisting = false`)
- Busca el dashboard activo existente
- Si existe, lo actualiza
- Si no existe, crea uno nuevo

## 📊 Flujo de Funcionamiento

### Escenario 1: Usuario crea su primer dashboard
1. Usuario completa el formulario
2. Sistema llama `createDashboard()`
3. No hay dashboards activos para desactivar
4. Se crea el nuevo dashboard con `is_active = true`
5. ✅ Dashboard creado y activo

### Escenario 2: Usuario crea un segundo dashboard
1. Usuario completa el formulario nuevamente
2. Sistema llama `createDashboard()`
3. `deactivateAllActiveDashboards()` encuentra el dashboard anterior
4. Desactiva el dashboard anterior (`is_active = false`)
5. Se crea el nuevo dashboard con `is_active = true`
6. ✅ Nuevo dashboard activo, anterior desactivado

### Escenario 3: Usuario crea múltiples dashboards
1. Cada vez que crea uno nuevo, todos los anteriores se desactivan
2. Solo el más reciente queda activo
3. Los anteriores se guardan en Airtable (historial)
4. ✅ Usuario puede tener historial ilimitado, pero solo uno activo

## 🔍 Verificación en Airtable

En Airtable, verás:
- **Múltiples registros** para el mismo email
- **Solo uno con `is_active = true`** (el más reciente)
- **Los demás con `is_active = false`** (historial)

### Ejemplo en Airtable:

| user_email | dashboard_id | is_active | created_at |
|------------|--------------|-----------|------------|
| user@example.com | dashboard_1 | ❌ false | 2024-11-15 |
| user@example.com | dashboard_2 | ❌ false | 2024-11-20 |
| user@example.com | dashboard_3 | ✅ **true** | 2024-11-25 |

## 🎯 Beneficios

1. **Sin límites:** Los usuarios pueden generar todos los dashboards que quieran
2. **Historial:** Todos los dashboards anteriores se guardan
3. **Un solo activo:** Solo el más reciente está activo, evitando confusión
4. **Automático:** No requiere intervención manual del usuario
5. **Eficiente:** Los dashboards antiguos no se eliminan, solo se desactivan

## 🔧 Uso en el Código

### Crear un nuevo dashboard (reemplazando el anterior):
```typescript
// Por defecto, replaceExisting = true
await createOrUpdateDashboard(email, dashboardData, projectInfo);
// o explícitamente:
await createOrUpdateDashboard(email, dashboardData, projectInfo, true);
```

### Actualizar el dashboard activo existente:
```typescript
await createOrUpdateDashboard(email, dashboardData, projectInfo, false);
```

### Buscar solo el dashboard activo:
```typescript
const result = await AirtableService.findDashboardByEmail(email, true);
```

### Buscar cualquier dashboard (el más reciente):
```typescript
const result = await AirtableService.findDashboardByEmail(email, false);
```

## 📝 Notas Importantes

1. **Los dashboards anteriores NO se eliminan**, solo se desactivan
2. **El historial se mantiene** en Airtable para referencia futura
3. **Solo el dashboard activo** se muestra cuando el usuario inicia sesión
4. **La desactivación es automática** al crear un nuevo dashboard
5. **No hay límite** en la cantidad de dashboards que un usuario puede crear

## 🧪 Pruebas

Para probar el sistema:

1. **Crear primer dashboard:**
   - Completa el formulario
   - Verifica en Airtable que se creó con `is_active = true`

2. **Crear segundo dashboard:**
   - Completa el formulario nuevamente
   - Verifica en Airtable:
     - El primer dashboard tiene `is_active = false`
     - El segundo dashboard tiene `is_active = true`

3. **Crear múltiples dashboards:**
   - Crea varios dashboards
   - Verifica que solo el más reciente tiene `is_active = true`
   - Todos los anteriores tienen `is_active = false`

## ✅ Estado de Implementación

- [x] Método `deactivateAllActiveDashboards()` implementado
- [x] `createDashboard()` desactiva dashboards anteriores
- [x] `findDashboardByEmail()` busca solo activos por defecto
- [x] `createOrUpdateDashboard()` tiene modo reemplazo
- [x] Interfaz del hook actualizada
- [x] Logging y mensajes informativos agregados

---

**El sistema está listo para usar. Los usuarios ahora pueden generar dashboards ilimitados, pero solo tendrán uno activo a la vez.**


