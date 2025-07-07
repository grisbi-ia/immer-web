# Guía Rápida: Limpiar Caché del Catálogo

## 🚀 **Métodos Rápidos (Recomendados)**

### 1. **Desde la Consola del Navegador** ⚡
```javascript
// Método más rápido - limpiar caché
window.debugImmerCatalog.clearCatalogCache()

// Método completo - forzar recarga
await window.debugImmerCatalog.forceReloadCatalog()

// Recargar página después
location.reload()
```

### 2. **Script Automático** 🤖
```bash
# Ejecutar script de limpieza
./clear-catalog-cache.sh
```

## 📋 **Cuándo Usar Cada Método**

| Situación | Método Recomendado | Comando | Tiempo |
|-----------|-------------------|---------|--------|
| Actualicé `catalog-relations.json` | Consola | `clearCatalogCache() + F5` | Inmediato |
| No veo los nuevos datos | Forzar recarga | `forceReloadCatalog()` | Inmediato |
| Cambié muchas cosas | Script automático | `./clear-catalog-cache.sh` | 30-60 seg |
| Problemas de caché persistente | Limpieza manual | DevTools → Storage | Inmediato |
| Esperar caché automático | Sin acción | Solo esperar | 5 minutos |

## 🔄 **Flujo Típico de Actualización**

1. **Editar** `static/catalog-relations.json`
2. **Validar JSON** (usar herramientas como JSONLint)
3. **Limpiar caché**: `window.debugImmerCatalog.clearCatalogCache()`
4. **Recargar página**: `F5` o `Ctrl+Shift+R`
5. **Verificar cambios** en filtros de marca/grupo/subgrupo

> ⏱️ **Nota**: El caché ahora expira automáticamente cada **5 minutos**, por lo que los cambios se reflejarán más rápido sin intervención manual.

## 🧪 **Verificación de Datos**

```javascript
// Verificar estado actual del catálogo
window.debugImmerCatalog.debugLocalStorage()

// Ver datos cargados en el navegador
console.log("Marcas:", localStorage.getItem('immer-catalog-relations'))
```

## ⚡ **Shortcuts de Teclado**

- `F12` → Abrir DevTools
- `Ctrl+Shift+I` → Abrir DevTools  
- `F5` → Recargar página
- `Ctrl+Shift+R` → Recarga forzada (bypass caché)

## 🐛 **Solución de Problemas**

### Los filtros no se actualizan:
```javascript
window.debugImmerCatalog.clearCatalogCache()
location.reload()
```

### Error de JSON inválido:
1. Verificar sintaxis en `static/catalog-relations.json`
2. Usar herramientas online como JSONLint
3. Verificar comas, llaves y comillas

### Caché muy persistente:
1. DevTools → Application → Storage
2. Clear Storage → Clear site data
3. Recargar página

---

*Actualizado: Julio 6, 2025*
