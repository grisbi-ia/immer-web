# Documentación del Sistema de Filtros - IMMER E-commerce

## Descripción General

El sistema de filtros de la tienda IMMER permite a los usuarios filtrar productos por múltiples criterios de manera combinada y eficiente. El sistema está completamente refactorizado y centralizado en componentes modulares para facilitar el mantenimiento y la escalabilidad.

## Arquitectura del Sistema

### Componentes Principales

1. **CatalogFilters.svelte** - Componente contenedor principal
2. **NameFilter.svelte** - Filtro de búsqueda por texto
3. **BrandFilter.svelte** - Filtro por marca
4. **GroupFilter.svelte** - Filtro por grupo
5. **SubgroupFilter.svelte** - Filtro por subgrupo

### Stores (Estado Global)

```typescript
// Filtros seleccionados
selectedBrand: Writable<Brand | null>
selectedGroup: Writable<Group | null>
selectedSubgroup: Writable<Subgroup | null>
textToSearch: Writable<string | null>

// Opciones disponibles
availableBrands: Writable<Brand[]>
availableGroups: Writable<Group[]>
availableSubgroups: Writable<Subgroup[]>
```

## Lógica de Filtros

### 1. Filtro de Texto (NameFilter)

**Funcionalidad:**
- Búsqueda en tiempo real por nombre de producto
- Campo de entrada libre que permite cualquier texto
- Se aplica independientemente de otros filtros

**Comportamiento:**
- Al escribir, actualiza `textToSearch` automáticamente
- Funciona en combinación con todos los demás filtros
- Limpia automáticamente al hacer clic en el botón "X"

### 2. Filtro por Marca (BrandFilter)

**Funcionalidad:**
- Selección de marca específica
- Al seleccionar una marca, filtra las opciones disponibles de grupos y subgrupos

**Comportamiento:**
```
Seleccionar Marca → Filtra Grupos Disponibles → Filtra Subgrupos Disponibles
```

**Reglas:**
- Al seleccionar una marca: mantiene grupo y subgrupo si son compatibles
- Al limpiar marca: resetea grupo y subgrupo, muestra todas las opciones
- No afecta el filtro de texto

### 3. Filtro por Grupo (GroupFilter)

**Funcionalidad:**
- Selección de grupo de productos
- Depende de la marca seleccionada (si hay una)

**Comportamiento:**
```
Seleccionar Grupo → Filtra Subgrupos Disponibles
```

**Reglas:**
- Al seleccionar un grupo: mantiene la marca actual, filtra subgrupos
- Si el subgrupo actual no es compatible con el nuevo grupo, se resetea
- Al limpiar grupo: resetea subgrupo, mantiene marca
- NO auto-selecciona marca (un grupo puede pertenecer a múltiples marcas)

### 4. Filtro por Subgrupo (SubgroupFilter)

**Funcionalidad:**
- Selección de subgrupo específico
- Es el filtro más específico de la jerarquía

**Comportamiento:**
```
Seleccionar Subgrupo → Mantiene Marca y Grupo
```

**Reglas:**
- Al seleccionar subgrupo: mantiene marca y grupo actuales
- Al limpiar subgrupo: solo afecta el subgrupo, mantiene marca y grupo
- Depende de las selecciones de marca y grupo

## Jerarquía y Dependencias

```
Marca (independiente)
  ↓ filtra
Grupo (depende de marca, opcional)
  ↓ filtra  
Subgrupo (depende de marca y grupo)

Texto (independiente de todos)
```

### Flujo de Dependencias

1. **Marca → Grupo → Subgrupo**: Jerarquía descendente
2. **Texto**: Independiente, se combina con cualquier selección
3. **Limpiar hacia arriba**: Limpiar marca resetea grupo y subgrupo
4. **Limpiar horizontal**: Limpiar grupo resetea solo subgrupo

## Lógica de Limpieza (Clear)

### Comportamiento al Limpiar Filtros

| Filtro Limpiado | Efecto en Otros Filtros |
|----------------|------------------------|
| Texto | Ninguno |
| Marca | Resetea Grupo y Subgrupo |
| Grupo | Resetea solo Subgrupo |
| Subgrupo | Ninguno |

### Implementación

```typescript
// Limpiar marca
function clearBrandFilter() {
    selectedBrand.set(null);
    selectedGroup.set(null);      // ← Resetea grupo
    selectedSubgroup.set(null);   // ← Resetea subgrupo
    // Actualiza opciones disponibles
}

// Limpiar grupo  
function clearGroupFilter() {
    selectedGroup.set(null);
    selectedSubgroup.set(null);   // ← Resetea solo subgrupo
    // Mantiene marca, actualiza subgrupos disponibles
}

// Limpiar subgrupo
function clearSubgroupFilter() {
    selectedSubgroup.set(null);   // ← Solo afecta subgrupo
    // Mantiene marca y grupo
}
```

## Combinación de Filtros

### Todos los Filtros Son Combinables

Los usuarios pueden aplicar cualquier combinación de filtros:

```typescript
// Ejemplo de filtros combinados
{
    textToSearch: "aceite",
    selectedBrand: { id: 1, name: "NGK" },
    selectedGroup: { id: 5, name: "Lubricantes" },
    selectedSubgroup: { id: 12, name: "Aceites Motor" }
}
```

### Envío a la API

Todos los filtros se envían simultáneamente:

```typescript
const params = {
    name: $textToSearch,
    brandId: $selectedBrand?.id,
    groupId: $selectedGroup?.id, 
    subgroupId: $selectedSubgroup?.id,
    page: currentPage,
    limit: pageSize
};
```

## Interfaz de Usuario

### Iconos y Placeholders

- 🔍 **Texto**: "Buscar productos..." 
- 🏷️ **Marca**: "Seleccionar marca..."
- 📁 **Grupo**: "Seleccionar grupo..." / "Seleccione marca primero"
- 🔧 **Subgrupo**: "Seleccionar subgrupo..." / "Seleccione grupo primero"

### Estados de Componentes

1. **Normal**: Completamente funcional
2. **Deshabilitado**: Cuando faltan dependencias
3. **Cargando**: Durante peticiones a la API
4. **Con Valor**: Cuando tiene una selección activa

### Botones de Limpieza

- **Cursor pointer**: Al hacer hover sobre la "X"
- **Efecto visual**: Hover destacado
- **Funcionalidad**: Limpia el filtro y actualiza dependencias

## Flujo de Búsqueda

### Proceso Completo

1. **Usuario interactúa** con cualquier filtro
2. **Se actualiza** el store correspondiente
3. **Se recalculan** las opciones disponibles para filtros dependientes
4. **Se ejecuta** `searchProducts(false)` automáticamente
5. **Se hace scroll** al inicio de la página
6. **Se obtienen** nuevos resultados de la API

### Optimizaciones

- **Debounce** en búsqueda por texto (300ms)
- **Scroll automático** al aplicar filtros
- **Loading states** durante peticiones
- **Reset inteligente** de dependencias

## Casos de Uso Comunes

### Caso 1: Búsqueda Simple por Texto
```
Usuario escribe "bujía" → Se filtran todos los productos que contengan "bujía"
```

### Caso 2: Filtro por Marca
```
Usuario selecciona "NGK" → Se muestran solo productos NGK
→ Se filtran grupos disponibles solo para NGK
→ Se filtran subgrupos disponibles solo para NGK
```

### Caso 3: Filtro Específico Completo
```
1. Usuario selecciona Marca: "NGK"
2. Usuario selecciona Grupo: "Bujías"  
3. Usuario selecciona Subgrupo: "Bujías Convencionales"
4. Usuario escribe: "iridium"
→ Resultado: Solo bujías NGK convencionales que contengan "iridium"
```

### Caso 4: Cambio de Marca con Filtros Aplicados
```
Estado inicial: Marca=NGK, Grupo=Bujías, Subgrupo=Convencionales
Usuario cambia a Marca=BOSCH
→ Se mantiene si BOSCH tiene grupo "Bujías"
→ Se resetea subgrupo si BOSCH no tiene subgrupo "Convencionales" en "Bujías"
```

## Mantenimiento y Extensión

### Agregar Nuevos Filtros

1. Crear nuevo componente siguiendo el patrón existente
2. Agregar stores necesarios en `store.ts`
3. Integrar en `CatalogFilters.svelte`
4. Actualizar lógica de `searchProducts()` en `util.ts`
5. Documentar nuevas dependencias

### Mejores Prácticas

- **Mantener coherencia** en iconos y placeholders
- **Documentar dependencias** entre filtros
- **Testear combinaciones** complejas de filtros
- **Validar estados** de carga y error
- **Considerar performance** en datasets grandes

## Debugging y Troubleshooting

### Logs de Consola

Los componentes incluyen logs útiles para debugging:

```typescript
console.log("Brand selected:", {
    brand: brand.name,
    availableGroups: newGroups.length,
    groupsKept: keptGroups.length
});
```

### Problemas Comunes

1. **Filtros no se actualizan**: Verificar que los stores se actualicen correctamente
2. **Opciones incorrectas**: Revisar `catalogRelations.getAvailable*()` 
3. **Búsqueda no funciona**: Verificar parámetros en `searchProducts()`
4. **UI inconsistente**: Verificar estilos en componentes individuales
5. **No se muestran resultados**: Verificar que la combinación de filtros tenga productos disponibles

## Implementación Técnica Detallada

### Estructura de Datos

#### Tipo Brand
```typescript
interface Brand {
    id: number;
    name: string;
    image?: string;
    active: boolean;
}
```

#### Tipo Group
```typescript
interface Group {
    id: number;
    name: string;
    brandIds: number[];  // Marcas que contienen este grupo
    active: boolean;
}
```

#### Tipo Subgroup
```typescript
interface Subgroup {
    id: number;
    name: string;
    groupId: number;
    brandIds: number[];  // Marcas que contienen este subgrupo
    active: boolean;
}
```

### Funciones Clave

#### searchProducts() en util.ts
```typescript
export async function searchProducts(loadMore = false) {
    catalogLoading.set(true);
    
    try {
        const params = {
            name: $textToSearch?.trim() || null,
            brandId: $selectedBrand?.id || null,
            groupId: $selectedGroup?.id || null,
            subgroupId: $selectedSubgroup?.id || null,
            page: loadMore ? $currentPage + 1 : 1,
            limit: 20
        };

        const response = await fetch('/api/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        
        if (loadMore) {
            products.update(current => [...current, ...data.products]);
            currentPage.update(p => p + 1);
        } else {
            products.set(data.products);
            currentPage.set(1);
            // Scroll al inicio solo cuando no es "load more"
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        hasMoreProducts.set(data.hasMore);
        
    } catch (error) {
        console.error('Error searching products:', error);
        // TODO: Mostrar mensaje de error al usuario
    } finally {
        catalogLoading.set(false);
    }
}
```

#### updateAvailableGroups() en BrandFilter
```typescript
function updateAvailableGroups(brandId) {
    if (!brandId) {
        availableGroups.set($allGroups);
        return;
    }
    
    const compatibleGroups = $allGroups.filter(group => 
        group.brandIds.includes(brandId)
    );
    
    availableGroups.set(compatibleGroups);
    
    // Verificar si el grupo actual sigue siendo válido
    const currentGroup = $selectedGroup;
    if (currentGroup && !compatibleGroups.find(g => g.id === currentGroup.id)) {
        selectedGroup.set(null);
        selectedSubgroup.set(null);
    }
}
```

#### updateAvailableSubgroups() en GroupFilter
```typescript
function updateAvailableSubgroups(groupId, brandId = null) {
    let compatibleSubgroups = $allSubgroups;
    
    // Filtrar por grupo si está seleccionado
    if (groupId) {
        compatibleSubgroups = compatibleSubgroups.filter(sub => 
            sub.groupId === groupId
        );
    }
    
    // Filtrar por marca si está seleccionada
    if (brandId) {
        compatibleSubgroups = compatibleSubgroups.filter(sub =>
            sub.brandIds.includes(brandId)
        );
    }
    
    availableSubgroups.set(compatibleSubgroups);
    
    // Verificar si el subgrupo actual sigue siendo válido
    const currentSubgroup = $selectedSubgroup;
    if (currentSubgroup && !compatibleSubgroups.find(s => s.id === currentSubgroup.id)) {
        selectedSubgroup.set(null);
    }
}
```

### Estados Reactivos en Stores

```typescript
// store.ts - Ejemplos de reactividad

// Cuando cambia la marca, actualizar opciones disponibles
selectedBrand.subscribe(brand => {
    if (brand) {
        updateAvailableGroups(brand.id);
        updateAvailableSubgroups($selectedGroup?.id, brand.id);
    } else {
        // Sin marca seleccionada, mostrar todas las opciones
        availableGroups.set(allGroups);
        availableSubgroups.set(allSubgroups);
    }
});

// Cuando cambia el grupo, actualizar subgrupos
selectedGroup.subscribe(group => {
    if (group) {
        updateAvailableSubgroups(group.id, $selectedBrand?.id);
    } else {
        // Sin grupo, mostrar subgrupos basados solo en marca
        updateAvailableSubgroups(null, $selectedBrand?.id);
    }
});
```

### Manejo de Eventos en Componentes

#### BrandFilter.svelte
```typescript
function handleBrandSelect(event) {
    const brand = event.detail;
    
    if (brand) {
        console.log("Brand selected:", brand.name);
        selectedBrand.set(brand);
        searchProducts(false);
    }
}

function clearBrand() {
    console.log("Clearing brand filter");
    selectedBrand.set(null);
    selectedGroup.set(null);
    selectedSubgroup.set(null);
    searchProducts(false);
}
```

#### GroupFilter.svelte
```typescript
function handleGroupSelect(event) {
    const group = event.detail;
    
    if (group) {
        console.log("Group selected:", group.name);
        selectedGroup.set(group);
        
        // IMPORTANTE: NO auto-seleccionar marca
        // Un grupo puede pertenecer a múltiples marcas
        
        searchProducts(false);
    }
}

function clearGroup() {
    console.log("Clearing group filter");
    selectedGroup.set(null);
    selectedSubgroup.set(null);  // Reset subgrupo
    // Mantener marca actual
    searchProducts(false);
}
```

### Optimizaciones de Performance

#### Debounce en NameFilter
```typescript
let debounceTimer;

function handleTextInput(event) {
    const text = event.target.value;
    
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        console.log("Text search:", text);
        textToSearch.set(text?.trim() || null);
        searchProducts(false);
    }, 300); // Esperar 300ms antes de buscar
}
```

#### Memoización de Filtros
```typescript
// Evitar recálculos innecesarios
$: filteredBrands = $allBrands.filter(brand => 
    brand.active && brand.name.toLowerCase().includes(brandSearchText.toLowerCase())
);

$: filteredGroups = $availableGroups.filter(group =>
    group.active && group.name.toLowerCase().includes(groupSearchText.toLowerCase())
);
```

#### Virtual Scrolling para Grandes Listas
```svelte
<!-- Para listas muy grandes de opciones -->
<script>
    import VirtualList from 'svelte-virtual-list';
</script>

<VirtualList items={$availableBrands} let:item>
    <option value={item.id}>{item.name}</option>
</VirtualList>
```

### Monitoreo y Analytics

#### Tracking de Uso de Filtros
```typescript
// Opcional: Rastrear qué filtros usan más los usuarios
function trackFilterUsage(filterType, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'filter_used', {
            filter_type: filterType,
            filter_value: value,
            page_location: '/shop'
        });
    }
}
```

#### Performance Monitoring
```typescript
// Medir tiempo de respuesta de filtros
function measureFilterPerformance(filterAction) {
    const start = performance.now();
    
    return async (...args) => {
        try {
            const result = await filterAction(...args);
            const duration = performance.now() - start;
            
            console.log(`Filter ${filterAction.name} took ${duration.toFixed(2)}ms`);
            return result;
        } catch (error) {
            console.error(`Filter ${filterAction.name} failed:`, error);
            throw error;
        }
    };
}
```

### Documentación de API

#### Endpoint de Búsqueda
```typescript
/**
 * POST /api/shop
 * Busca productos aplicando filtros combinados
 * 
 * @param {Object} body - Parámetros de búsqueda
 * @param {string} [body.name] - Texto a buscar en nombre/descripción
 * @param {number} [body.brandId] - ID de marca seleccionada
 * @param {number} [body.groupId] - ID de grupo seleccionado
 * @param {number} [body.subgroupId] - ID de subgrupo seleccionado
 * @param {number} [body.page=1] - Número de página
 * @param {number} [body.limit=20] - Productos por página
 * 
 * @returns {Object} response
 * @returns {Product[]} response.products - Lista de productos
 * @returns {boolean} response.hasMore - Si hay más páginas
 * @returns {number} response.total - Total de productos encontrados
 * @returns {Object} response.filters - Filtros disponibles actualizados
 */
```

#### Tipos TypeScript
```typescript
// types/filters.ts
export interface FilterParams {
    name?: string;
    brandId?: number;
    groupId?: number;
    subgroupId?: number;
    page?: number;
    limit?: number;
}

export interface FilterResponse {
    products: Product[];
    hasMore: boolean;
    total: number;
    filters: {
        brands: Brand[];
        groups: Group[];
        subgroups: Subgroup[];
    };
}
```

---

*Última actualización: Julio 2025*
*Versión del sistema: 2.0 (Post-refactoring)*
