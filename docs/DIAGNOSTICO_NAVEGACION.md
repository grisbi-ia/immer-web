# Diagnóstico y Correcciones - Navegación Persistente

## 🔍 Problemas Identificados

### 1. **Error de Importación en CatalogFilters**
**Problema**: Faltaba la importación de `get` de svelte/store en CatalogFilters.svelte
**Síntoma**: Error de compilación al intentar usar `get(products)`
**Corrección**: Agregada importación: `import { get } from "svelte/store";`

### 2. **Función de Búsqueda Incorrecta**
**Problema**: shop/+page.svelte seguía llamando `searchProducts` en lugar de `searchProductsPersistent`
**Síntoma**: La paginación no funcionaba con el sistema persistente
**Corrección**: Actualizado para usar `searchProductsPersistent(true)` en `loadMoreProducts()`

### 3. **Tipo FilterState No Definido**
**Problema**: El tipo `FilterState` no estaba definido en store.ts
**Síntoma**: Errores de TypeScript
**Corrección**: Agregado tipo `FilterState` con todas las propiedades necesarias

### 4. **Loop Infinito en Persistencia**
**Problema**: Al restaurar filtros, se disparaban las suscripciones que volvían a guardar
**Síntoma**: Comportamiento errático en la restauración
**Corrección**: Agregado flag `isRestoring` y función `setRestoringMode()` para prevenir auto-persistencia durante restauración

### 5. **Coordinación Incorrecta entre Componentes**
**Problema**: La lógica de restauración estaba dividida entre shop/+page.svelte y CatalogFilters
**Síntoma**: Conflictos en el orden de inicialización
**Corrección**: Centralizada la lógica de restauración en shop/+page.svelte con timeout para esperar carga del catálogo

### 6. **Error de Null Reference en Products**
**Problema**: `responseProduct.objectList` puede ser `null`, causando error al acceder a `.length`
**Síntoma**: `TypeError: Cannot read properties of null (reading 'length')`
**Corrección**: Agregada validación `const newProducts = responseProduct.objectList || [];`

### 7. **Validación Insuficiente de API Response**
**Problema**: No se validaba que la respuesta del API tuviera la estructura esperada
**Síntoma**: Errores inesperados cuando el API retorna formato incorrecto
**Corrección**: Agregadas validaciones de HTTP status y estructura de respuesta

### 8. **Manejo de Errores Durante Restauración Secuencial**
**Problema**: Si una página falla durante la carga secuencial, toda la restauración falla
**Síntoma**: Restauración incompleta cuando hay problemas de red
**Corrección**: Try-catch individual para cada página, continúa con las siguientes si una falla

## 🛠️ Correcciones Aplicadas

### En `store.ts`
```typescript
// ✅ Protección en persistencia
function persistFiltersToStorage() {
    if (browser && !isRestoring) {
        try {
            const currentProducts = get(products) || [];
            const currentFilters: FilterState = {
                // ...
                totalProducts: currentProducts.length,
                // ...
            };
            localStorage.setItem('lastCatalogFilters', JSON.stringify(currentFilters));
        } catch (error) {
            console.error("Error persisting filters to storage:", error);
        }
    }
}
```

### En `util.ts`
```typescript
// ✅ Validación de respuesta del API
const responseFetch = await fetch("/api/shop/products", { /* ... */ });

// Verificar que la respuesta sea exitosa
if (!responseFetch.ok) {
    throw new Error(`HTTP error! status: ${responseFetch.status}`);
}

const responseProduct = await responseFetch.json();

// Verificar estructura de respuesta
if (!responseProduct || typeof responseProduct !== 'object') {
    throw new Error("Invalid API response format");
}

// ✅ Protección contra null
const newProducts = responseProduct.objectList || [];

// Validar que sea array
if (!Array.isArray(newProducts)) {
    console.warn("API returned invalid products array:", newProducts);
    message.set("Error: formato de respuesta inválido");
    hasMoreProducts.set(false);
    return;
}

// ✅ Manejo de errores durante carga secuencial
for (let page = 2; page <= targetPage; page++) {
    try {
        currentPage.set(page);
        await searchProductsPersistent(true, true);
        // ...
    } catch (pageError) {
        console.error(`Error loading page ${page}:`, pageError);
        continue; // Continuar con siguiente página
    }
}

// ✅ Función de debugging
export function debugAppState(context: string = "") {
    const state = {
        context,
        products: {
            length: get(products)?.length || 0,
            isArray: Array.isArray(get(products)),
        },
        // ... más información de estado
    };
    console.log(`🐛 Debug App State [${context}]:`, state);
}
```

### En `shop/+page.svelte`
```typescript
// ✅ Lógica centralizada de inicialización
onMount(async () => {
    // Configurar guardado de scroll
    scrollSaveInterval = setInterval(() => {
        saveCatalogScrollPosition();
    }, 2000);

    // Determinar si restaurar
    const shouldRestore = shouldRestoreCatalogState() || recentlyNavigatedFromShop();
    
    // Esperar carga del catálogo y luego inicializar
    setTimeout(async () => {
        if (shouldRestore) {
            const restored = await restoreCatalogState();
            if (!restored) {
                await searchProductsPersistent(false);
            }
        } else {
            await searchProductsPersistent(false);
        }
        catalogInitialized = true;
        restoringState = false;
    }, 500);
});

// ✅ Función correcta para cargar más
function loadMoreProducts() {
    if (!$loading && $hasMoreProducts) {
        $currentPage++;
        searchProductsPersistent(true); // ✅ Función correcta
    }
}
```

### En `CatalogFilters.svelte`
```typescript
// ✅ Importación corregida
import { get } from "svelte/store";

// ✅ Simplificado - solo carga catálogo
onMount(async () => {
    await loadCatalogData();
});
```

## 🧪 Pasos de Prueba

### 1. **Prueba Básica de Navegación**
1. Ir a `/shop`
2. Aplicar filtros (ej: marca "NGK")
3. Navegar a página 3
4. Hacer scroll hacia abajo
5. Ir a `/cart`
6. Regresar a `/shop`
7. **Resultado esperado**: Página 3 con filtro NGK y scroll restaurado

### 2. **Prueba de Múltiples Filtros**
1. Ir a `/shop`
2. Aplicar: texto "bujia" + marca "NGK" + grupo específico
3. Cargar más páginas
4. Ir a `/profile`
5. Regresar a `/shop`
6. **Resultado esperado**: Todos los filtros y páginas restaurados

### 3. **Prueba de Expiración**
1. Navegar en `/shop`
2. Esperar 31 minutos (o modificar TTL a 1 min para prueba)
3. Ir a otra página y regresar
4. **Resultado esperado**: Nueva búsqueda, no restauración

### 4. **Prueba de Navegación Externa**
1. Navegar en `/shop` 
2. Ir a Google (externa)
3. Regresar via URL `/shop`
4. **Resultado esperado**: Nueva búsqueda, no restauración

## 📊 Monitoreo y Debug

### Console Logs Clave
```javascript
// Al montar shop page
"Shop page mounted: { shouldRestore: true, recentNavigation: true }"

// Al restaurar estado
"Restoring catalog state: { textSearch: 'bujia', brand: 'NGK', targetPage: 3 }"

// Durante carga secuencial
"Loading additional pages from 2 to 3..."
"Loaded page 2, total products: 40"
"Loaded page 3, total products: 60"

// Al completar
"✅ State restored successfully: page 3, 60 products loaded"
```

### Local Storage
```javascript
// Verificar estado guardado
localStorage.getItem('lastCatalogFilters')

// Verificar navegación reciente
sessionStorage.getItem('navigatedFromShop')
sessionStorage.getItem('shopNavigationTime')
```

## ⚠️ Problemas Conocidos Pendientes

### 1. **Filtros Dependientes**
- Al restaurar marca, los grupos/subgrupos disponibles no se actualizan automáticamente
- Requiere llamar a `updateAvailableOptionsAfterRestore()` manualmente

### 2. **Performance con Muchas Páginas**
- Cargar 10+ páginas secuencialmente puede ser lento
- Considerar estrategia de "lazy loading" o "chunked loading"

### 3. **Race Conditions**
- En conexiones lentas, la carga del catálogo puede no terminar antes del timeout de 500ms
- Considerar usar Promise en lugar de timeout fijo

### 4. **Mobile Experience**
- El scroll restoration puede ser menos preciso en móviles
- Considerar diferentes estrategias de scroll para dispositivos móviles

## 🔄 Próximos Pasos

1. **Probar exhaustivamente** con diferentes combinaciones de filtros
2. **Optimizar performance** para carga de muchas páginas
3. **Mejorar filtros dependientes** para actualizar opciones automáticamente
4. **Agregar tests automatizados** para prevenir regresiones
5. **Monitorear métricas** de uso real en producción

## 🐛 Herramientas de Debugging

### Función debugAppState()
Nueva función agregada para diagnosticar problemas:

```javascript
// En consola del navegador o en código
debugAppState("mi contexto de prueba");
```

**Output esperado:**
```javascript
🐛 Debug App State [mi contexto de prueba]: {
  context: "mi contexto de prueba",
  timestamp: "2025-07-06T...",
  products: {
    length: 60,
    isArray: true,
    value: [...] // Array de productos
  },
  stores: {
    currentPage: 3,
    textToSearch: "bujia",
    selectedBrand: "NGK",
    // ... más stores
  },
  localStorage: {
    hasFilters: true,
    filtersSize: 245
  },
  sessionStorage: {
    navigatedFromShop: "true",
    shopNavigationTime: "1720271234567"
  }
}
```

### Debugging de Errores Comunes

#### Error: "Cannot read properties of null (reading 'length')"
1. Ejecutar `debugAppState("before error")` antes del error
2. Verificar si `products.value` es `null` o `undefined`
3. Revisar si `products.isArray` es `false`
4. Buscar en logs del API si la respuesta es válida

#### Error: Filtros no se restauran
1. Verificar `localStorage.hasFilters` en debugAppState
2. Comprobar timestamp del estado guardado
3. Revisar logs de "Restoring catalog state"
4. Verificar que `isRestoring` no esté bloqueando la persistencia

#### Error: Páginas no se cargan secuencialmente
1. Buscar logs "Loading additional pages from X to Y"
2. Verificar si hay errores en páginas individuales
3. Comprobar si `hasMoreProducts` es correcto
4. Revisar la respuesta del API para cada página

---

*Última actualización: Julio 6, 2025*  
*Estado: Correcciones aplicadas + herramientas de debugging agregadas*
