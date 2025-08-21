# Deployment del Catálogo - VPS Linux + Node.js

## 🎯 **Objetivo**
Documentar cómo actualizar el catálogo de productos sin recompilar la aplicación tras migrar de cPanel (immer.ec) a VPS Linux (shop.immer.ec).

## 🏗️ **Arquitectura Actual**

### 📁 **Ubicación de Archivos**
```
Desarrollo:    static/catalog-relations.json
Producción:    build/client/catalog-relations.json
URL Acceso:    https://shop.immer.ec/catalog-relations.json
```

### ⚙️ **Carga de Datos**
- **Método**: Fetch dinámico desde `/catalog-relations.json`
- **Cache**: 5 minutos TTL con fallback a cache expirado
- **Recompilación**: ❌ **NO REQUERIDA** para actualizar datos

## 📋 **Métodos de Actualización**

### **Método 1: Actualización Directa en Servidor** ⭐ **Recomendado**

```bash
# 1. Subir archivo actualizado al servidor
scp catalog-relations.json user@shop.immer.ec:/path/to/app/build/client/

# 2. Verificar que se subió correctamente
curl https://shop.immer.ec/catalog-relations.json | jq '.lastUpdated'

# 3. Limpiar cache del navegador (opcional)
# El sistema automáticamente detecta cambios en 5 minutos
```

### **Método 2: Via Variable de Entorno** 🔧 **Avanzado**

Para cargar desde una fuente externa:

```bash
# En el servidor, configurar:
export VITE_CATALOG_URL="https://external-api.com/catalog.json"

# O en .env:
echo "VITE_CATALOG_URL=https://external-api.com/catalog.json" >> .env
```

### **Método 3: Endpoint API** 🚀 **Para Futuro**

```javascript
// Endpoint para actualizar dinámicamente (a implementar)
POST /api/catalog/update
{
  "catalog": { /* nuevo catalogo */ }
}
```

## 🔄 **Proceso de Migración CPANEL → VPS**

### ✅ **Cambios ya Realizados**
1. **Service Worker**: Actualizado para soportar ambos dominios (`immer.ec` + `shop.immer.ec`)
2. **API Proxy**: Configurado para permitir tráfico de ambos dominios
3. **DNS Preconnect**: Optimizado para `shop.immer.ec`
4. **URLs Corregidas**: Eliminadas referencias a `/static/` incorrectas

### 📁 **Estructura en VPS**
```
/path/to/app/
├── build/
│   ├── client/
│   │   ├── catalog-relations.json  ← ACTUALIZAR AQUÍ
│   │   ├── _app/
│   │   └── favicon.ico
│   ├── server/
│   └── index.js
├── package.json
└── .env
```

## 🧪 **Verificación Post-Deployment**

### **1. Verificar Carga del Archivo**
```bash
curl -I https://shop.immer.ec/catalog-relations.json
# Debe retornar: 200 OK
```

### **2. Verificar Contenido**
```bash
curl https://shop.immer.ec/catalog-relations.json | jq '{version, lastUpdated, brands: .catalog.brands | length}'
```

### **3. Verificar Cache**
```javascript
// En consola del navegador:
window.debugImmerCatalog.getCacheInfo()
```

### **4. Forzar Recarga** (Si necesario)
```javascript
// En consola del navegador:
window.debugImmerCatalog.clearCatalogCache()
window.debugImmerCatalog.forceReloadCatalog()
```

## 🚨 **Troubleshooting**

### **Problema: 404 Not Found**
```bash
# Verificar que el archivo existe
ls -la /path/to/app/build/client/catalog-relations.json

# Verificar permisos
chmod 644 /path/to/app/build/client/catalog-relations.json
```

### **Problema: JSON Inválido**
```bash
# Validar JSON
jq . /path/to/app/build/client/catalog-relations.json

# Si hay error, revisar sintaxis
```

### **Problema: Cache Persistente**
```javascript
// Limpiar todo el cache
localStorage.removeItem('immer-catalog-relations')
sessionStorage.clear()
location.reload()
```

## 📊 **Monitoreo**

### **Logs de Aplicación**
```javascript
// El sistema registra automáticamente:
console.log('Loading catalog from JSON file...')
console.log('Catalog loaded:', { brands: X, groups: Y, subgroups: Z })
```

### **Métricas a Monitorear**
- **Tiempo de carga** del archivo JSON
- **Errores 404** en `/catalog-relations.json`
- **Validez del JSON** tras actualizaciones
- **Tiempo de cache** y refrescos automáticos

## 🔮 **Roadmap Futuro**

### **Corto Plazo**
- [ ] Script automatizado de deployment
- [ ] Validación automática de JSON pre-deployment
- [ ] Endpoint de health check para el catálogo

### **Mediano Plazo**
- [ ] API endpoint para actualización dinámica
- [ ] Versionado automático del catálogo
- [ ] Rollback automático en caso de JSON inválido

### **Largo Plazo**
- [ ] CDN para distribución global
- [ ] Caché distribuido Redis/Memcached
- [ ] API GraphQL para consultas optimizadas

---

**📝 Última Actualización:** Agosto 2025  
**🔗 Ver también:** `LIMPIAR_CACHE_CATALOGO.md`, `NAVEGACION_PERSISTENTE.md`
