# Comportamiento de Filtros Independientes - IMMER

## Resumen
Los filtros del catálogo de productos han sido configurados para mantener independencia lógica entre sí, evitando limpiezas automáticas no deseadas al modificar un filtro específico.

## Comportamiento Actual

### 🏷️ Filtro de MARCA
- **Limpiar marca**: NO limpia grupo ni subgrupo
- **Seleccionar marca**: Actualiza opciones disponibles pero respeta selecciones existentes
- **Independencia**: ✅ Completa respecto a grupo y subgrupo

### 📁 Filtro de GRUPO  
- **Limpiar grupo**: SÍ limpia subgrupo (dependencia jerárquica lógica)
- **Seleccionar grupo**: Actualiza opciones de subgrupos disponibles
- **Independencia**: ✅ Respecto a marca, ⚠️ Dependiente respecto a subgrupo

### 🔧 Filtro de SUBGRUPO
- **Limpiar subgrupo**: NO limpia grupo ni marca
- **Seleccionar subgrupo**: Puede auto-seleccionar grupo padre si es único
- **Independencia**: ✅ Completa respecto a marca y grupo

## Implementación Técnica

### BrandFilter.svelte
```javascript
function clearBrandFilter() {
    selectedBrand.set(null);
    
    // Reset to all options
    availableGroups.set(catalogRelations.getAllGroups());
    availableSubgroups.set(catalogRelations.getAllSubgroups());
    
    // 🔄 CORREGIDO: NO limpiar otros filtros automáticamente
    // selectedGroup.set(null);      // ❌ Removido
    // selectedSubgroup.set(null);   // ❌ Removido
    
    searchProducts(false);
}
```

### GroupFilter.svelte
```javascript
function clearGroupFilter() {
    selectedGroup.set(null);
    
    // Update available subgroups
    const currentBrand = $selectedBrand;
    const newSubgroups = catalogRelations.getAvailableSubgroups(currentBrand?.id);
    availableSubgroups.set(newSubgroups);
    
    // Clear subgroup if selected (dependencia jerárquica)
    selectedSubgroup.set(null);
    
    searchProducts(false);
}
```

### SubgroupFilter.svelte
```javascript
function clearSubgroupFilter() {
    selectedSubgroup.set(null);
    // NO limpia grupo ni marca
    searchProducts(false);
}
```

## Casos de Uso

### Escenario 1: Usuario busca por marca específica
1. Selecciona marca "BIKER"
2. Ve todos los productos de esa marca
3. Decide que quiere ver todos los productos de un grupo específico
4. ❌ **Antes**: Tenía que limpiar marca y empezar de nuevo
5. ✅ **Ahora**: Limpia marca y mantiene grupo, ve productos del grupo de todas las marcas

### Escenario 2: Usuario refina por jerarquía
1. Selecciona grupo "Motores" 
2. Selecciona subgrupo "Pistones"
3. Decide cambiar de grupo a "Transmisión"
4. ✅ **Comportamiento**: Al limpiar "Motores", "Pistones" se limpia automáticamente (lógico)
5. ✅ **Puede**: Seleccionar nuevo grupo "Transmisión" y después subgrupo correspondiente

### Escenario 3: Usuario explora marca + categoría
1. Selecciona marca "NGK"
2. Selecciona grupo "Sistema Eléctrico"  
3. Selecciona subgrupo "Bujías"
4. Ve productos específicos NGK de bujías
5. Decide ver todas las bujías (no solo NGK)
6. ✅ **Limpia marca**: Mantiene "Sistema Eléctrico" + "Bujías", ve bujías de todas las marcas

## Pruebas Manuales

### Test 1: Independencia de MARCA
```bash
# Ejecutar: ./test-filtros-independientes.sh
1. Seleccionar marca + grupo + subgrupo
2. Limpiar solo marca
3. Verificar: grupo y subgrupo se mantienen
```

### Test 2: Dependencia GRUPO → SUBGRUPO  
```bash
1. Seleccionar marca + grupo + subgrupo
2. Limpiar solo grupo
3. Verificar: subgrupo se limpia, marca se mantiene
```

### Test 3: Independencia de SUBGRUPO
```bash
1. Seleccionar marca + grupo + subgrupo  
2. Limpiar solo subgrupo
3. Verificar: marca y grupo se mantienen
```

## Beneficios UX

1. **Navegación más fluida**: No hay que reconstruir filtros desde cero
2. **Flexibilidad**: Usuarios pueden refinar búsquedas incrementalmente  
3. **Lógica intuitiva**: Las dependencias jerárquicas se respetan donde tiene sentido
4. **Eficiencia**: Menos clics para llegar al producto deseado

## Archivos Modificados

- `src/lib/components/BrandFilter.svelte`: Eliminada limpieza automática
- `src/lib/components/GroupFilter.svelte`: Mantiene dependencia grupo→subgrupo
- `src/lib/components/SubgroupFilter.svelte`: Independiente total
- `test-filtros-independientes.sh`: Script de pruebas

## Compatibilidad

✅ Compatible con sistema de navegación persistente  
✅ Compatible con restauración de estado de filtros  
✅ Compatible con búsqueda por texto simultánea  
✅ Mantiene lógica de relaciones de catálogo existente
