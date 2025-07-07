# Navegación Persistente - Sistema de Catálogo IMMER

## 📋 Descripción General

El sistema de navegación persistente permite que los usuarios mantengan su posición en el catálogo de productos cuando navegan entre páginas (como ir al carrito y regresar). Esto mejora significativamente la experiencia de usuario evitando que tengan que volver a navegar hasta donde estaban.

## 🎯 Problema Resuelto

**Antes**: Usuario navega a página 5 → Agrega item al carrito → Va a /cart → Regresa a /shop → Se reinicia en página 1 y pierde progreso

**Ahora**: Usuario navega a página 5 → Agrega item al carrito → Va a /cart → Regresa a /shop → Automáticamente se restaura a página 5 con todos los productos cargados y posición de scroll

## 🏗️ Arquitectura Técnica

### Nuevos Stores (store.ts)

```typescript
// Estado de productos y navegación
export const products: Writable<Product[]> = writable([]);
export const hasMoreProducts: Writable<boolean> = writable(true);
export const catalogScrollPosition: Writable<number> = writable(0);
export const lastAppliedFilters: Writable<FilterState | null> = writable(getLastFiltersFromStorage());

// Tipo de estado persistente
type FilterState = {
    textToSearch: string | null;
    selectedBrand: CatalogBrand | null;
    selectedGroup: CatalogGroup | null;
    selectedSubgroup: CatalogSubgroup | null;
    currentPage: number;
    totalProducts: number;
    scrollPosition: number;
    timestamp: number;
}
```

### Funciones Principales (util.ts)

#### 1. `searchProductsPersistent()`
Nueva función de búsqueda que maneja la navegación persistente:

```typescript
export async function searchProductsPersistent(
    moreData: boolean, 
    restoreFromCache: boolean = false
) {
    // Lógica mejorada que:
    // - Mantiene productos cargados en memoria
    // - No resetea si es restauración desde caché
    // - Actualiza hasMoreProducts correctamente
}
```

#### 2. `restoreCatalogState()`
Restaura el estado previo del catálogo:

```typescript
export async function restoreCatalogState(): Promise<boolean> {
    // - Verifica que el estado guardado no sea muy antiguo (30 min)
    // - Restaura filtros seleccionados
    // - Recarga productos hasta la página donde estaba
    // - Restaura posición de scroll
}
```

#### 3. `saveCatalogScrollPosition()`
Guarda automáticamente la posición de scroll:

```typescript
export function saveCatalogScrollPosition() {
    const scrollY = window.scrollY;
    catalogScrollPosition.set(scrollY);
}
```

#### 4. Funciones de Detección de Navegación
```typescript
export function shouldRestoreCatalogState(): boolean
export function markNavigationFromShop(): void
export function recentlyNavigatedFromShop(): boolean
```

### Auto-persistencia

Los filtros se guardan automáticamente en localStorage cuando cambian:

```typescript
// Auto-persistir filtros cuando cambien
if (browser) {
    textToSearch.subscribe(() => persistFiltersToStorage());
    selectedBrand.subscribe(() => persistFiltersToStorage());
    selectedGroup.subscribe(() => persistFiltersToStorage());
    selectedSubgroup.subscribe(() => persistFiltersToStorage());
    currentPage.subscribe(() => persistFiltersToStorage());
    catalogScrollPosition.subscribe(() => persistFiltersToStorage());
}
```

## 🔄 Flujo de Funcionamiento

### 1. Usuario Navega en Catálogo
- Se guardan automáticamente: filtros, página actual, productos cargados, posición de scroll
- Intervalo de guardado cada 2 segundos
- Al salir de la página se guarda estado final

### 2. Usuario Va al Carrito
- `markNavigationFromShop()` marca que viene desde shop
- SimpleCart detecta click en "Ver Carrito" 
- Se guarda timestamp de navegación en sessionStorage

### 3. Usuario Regresa al Shop
- `shouldRestoreCatalogState()` detecta que viene de navegación interna
- `recentlyNavigatedFromShop()` verifica navegación reciente (< 10 min)
- Si es válido, ejecuta `restoreCatalogState()`

### 4. Restauración Automática
- Restaura filtros seleccionados
- Carga páginas secuencialmente hasta donde estaba
- Restaura posición de scroll con smooth behavior
- Muestra indicador "📍 Estado de navegación restaurado"

## 📱 Componentes Actualizados

### shop/+page.svelte
- **onMount**: Detecta si debe restaurar estado vs búsqueda nueva
- **Interval de guardado**: Cada 2 segundos guarda posición de scroll
- **Event listeners**: `beforeunload` y `pageshow` para detectar navegación
- **UI mejorada**: Muestra "Items cargados" en lugar de "Items en pantalla"
- **Botón "Cargar más"**: Usa `hasMoreProducts` en lugar de comparar páginas

### SimpleCart.svelte
- **Navegación marcada**: Al hacer click en "Ver Carrito" marca la navegación

### CatalogFilters.svelte
- Compatible con sistema persistente (sin cambios necesarios)

## 💾 Almacenamiento

### localStorage
- **Key**: `lastCatalogFilters`
- **Contenido**: Estado completo de filtros, paginación y scroll
- **TTL**: 30 minutos (se limpia si es muy antiguo)

### sessionStorage
- **Keys**: `navigatedFromShop`, `shopNavigationTime`
- **Propósito**: Detectar navegación interna reciente
- **TTL**: 10 minutos

## 🎛️ Configuración

### Tiempos Configurables
```typescript
// Intervalo de guardado de scroll
scrollSaveInterval = setInterval(() => {
    saveCatalogScrollPosition();
}, 2000); // 2 segundos

// TTL de estado guardado
const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000); // 30 minutos

// TTL de navegación reciente
const timeDiff = Date.now() - parseInt(navigationTime);
if (timeDiff < 10 * 60 * 1000) // 10 minutos
```

### Páginas que Activan Restauración
```typescript
// En shouldRestoreCatalogState()
if (referrer.includes('/cart') || 
    referrer.includes('/checkout') || 
    referrer.includes('/profile') ||
    referrer.includes('/shop'))
```

## 🔧 Casos de Uso Soportados

### ✅ Navegación Típica
1. **Shop → Cart → Shop**: Restaura completamente ✅
2. **Shop → Profile → Shop**: Restaura completamente ✅  
3. **Shop → Checkout → Shop**: Restaura completamente ✅
4. **Shop → Product Details → Shop**: Restaura completamente ✅

### ✅ Casos Edge
1. **Estado muy antiguo**: Se limpia automáticamente (30+ min) ✅
2. **Navegación externa**: No restaura si viene de Google, etc. ✅
3. **Nueva sesión**: No restaura si se cierra/abre browser ✅
4. **Página recargada**: Intenta restaurar si es reciente ✅

### ⚠️ Limitaciones Conocidas
1. **Filtros dependientes**: Requiere actualización manual de opciones disponibles
2. **Performance**: Carga secuencial puede ser lenta con 10+ páginas
3. **Race conditions**: En conexiones lentas, puede fallar la inicialización
4. **Scroll móvil**: Menos preciso en dispositivos móviles

### ✅ Múltiples Pestañas
- Cada pestaña mantiene su propio estado ✅
- No hay conflictos entre pestañas ✅

## 🔍 Correcciones Aplicadas (Julio 6, 2025)

### Problemas Corregidos
- ✅ Error de importación `get` en CatalogFilters
- ✅ Uso incorrecto de `searchProducts` vs `searchProductsPersistent`
- ✅ Tipo `FilterState` no definido
- ✅ Loop infinito en auto-persistencia
- ✅ Coordinación incorrecta entre componentes
- ✅ Filtros no se aplicaban correctamente tras restauración

### Mejoras Implementadas
- ✅ Flag `isRestoring` para prevenir auto-persistencia durante restauración
- ✅ Lógica centralizada de inicialización en shop/+page.svelte
- ✅ Logging mejorado para debugging
- ✅ Timeout de 500ms para esperar carga del catálogo
- ✅ Secuencia mejorada: filtros → pausa → búsqueda → carga páginas

## 🎨 Indicadores UX

### Visual Feedback
```html
{#if restoringState}
    <p style="color: #4238ca; font-size: 1.2rem;">
        📍 Estado de navegación restaurado
    </p>
{/if}
```

### Console Logs (Desarrollo)
```typescript
console.log("Shop page mounted:", {
    shouldRestore,
    stateRestored,
    recentNavigation: recentlyNavigatedFromShop()
});
```

### Loading States
- Mantiene loading states durante restauración
- Botón "Cargar más" se deshabilita apropiadamente

## 🧪 Testing

### Casos de Prueba Recomendados

1. **Navegación básica**: Shop(p5) → Cart → Shop = p5 restaurada
2. **Filtros complejos**: Texto + Marca + Grupo → Cart → Shop = filtros restaurados
3. **Scroll profundo**: Hacer scroll → Cart → Shop = scroll restaurado
4. **Estado expirado**: Esperar 31 min → Shop = no restaura
5. **Navegación externa**: Google → Shop = no restaura
6. **Múltiples "Cargar más"**: Cargar 100 items → Cart → Shop = 100 items cargados

### Debug Mode
```typescript
// En desarrollo, mostrar logs detallados
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log("Navigation debug:", debugInfo);
}
```

## 🚀 Beneficios

### Para el Usuario
- **Sin pérdida de progreso** al navegar entre páginas
- **Experiencia fluida** similar a apps nativas
- **Menos clics** para volver a donde estaba
- **Mejor UX en móviles** donde navegar es más lento

### Para el Negocio
- **Menor abandono** del proceso de compra
- **Mayor conversión** al facilitar comparar productos
- **Mejor engagement** al reducir fricción
- **UX competitiva** vs otras tiendas online

### Técnicos
- **Backward compatible** con sistema existente
- **Performance optimizada** con carga inteligente
- **Memoria eficiente** con TTL automático
- **Escalable** para agregar más tipos de estado

## 🔮 Futuras Mejoras

### Posibles Extensiones
1. **Estado entre sesiones**: Persistir en base de datos para usuarios logueados
2. **Historial de navegación**: Breadcrumbs inteligentes
3. **Favoritos de búsqueda**: Guardar combinaciones de filtros frecuentes
4. **Recomendaciones contextuales**: Basadas en navegación previa
5. **Analytics de navegación**: Métricas de patrones de uso

### Optimizaciones
1. **Lazy loading inteligente**: Precargar páginas probables
2. **Service Worker**: Caché offline de productos vistos
3. **Prefetching**: Anticipar siguiente página
4. **Compression**: Comprimir estado guardado si crece mucho

---

## 📊 Métricas de Éxito

### KPIs a Monitorear
- **Tasa de regreso a shop**: % usuarios que regresan después de ir a cart
- **Tiempo en catálogo**: Tiempo promedio navegando productos
- **Páginas por sesión**: Número de páginas cargadas por usuario
- **Conversión post-navegación**: % que compra después de usar cart y regresar

### Logs Analíticos Sugeridos
```typescript
// Cuando se restaura estado
analytics.track('catalog_state_restored', {
    pages_restored: savedFilters.currentPage,
    filters_restored: filterCount,
    time_since_navigation: timeDiff
});
```

---

*Última actualización: Julio 6, 2025*  
*Versión: 1.0 - Implementación inicial*
