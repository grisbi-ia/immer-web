# 🔧 Sistema de Caché Configurable - Immer Web

## 📋 Resumen

Hemos implementado un sistema de caché completamente configurable que permite habilitar/deshabilitar y personalizar las duraciones del caché a través de variables de entorno.

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Configuración de la API
VITE_URL_API=https://api.immer.ec
VITE_API_KEY=tu_api_key_aqui

# Configuración del Cache
# Habilitar/deshabilitar el sistema de cache completamente
VITE_CACHE_ENABLED=true

# Duración del cache general en milisegundos (por defecto: 1 hora = 3600000)
VITE_CACHE_DURATION=3600000

# Duración del cache de imágenes en milisegundos (por defecto: 30 minutos = 1800000)
VITE_IMAGE_CACHE_DURATION=1800000
```

## 🚀 Configuraciones Rápidas

### Cache Deshabilitado (Ideal para desarrollo)
```bash
VITE_CACHE_ENABLED=false
```

### Cache Corto (5 minutos)
```bash
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=300000
VITE_IMAGE_CACHE_DURATION=300000
```

### Cache Medio (30 minutos / 15 minutos imágenes)
```bash
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=1800000
VITE_IMAGE_CACHE_DURATION=900000
```

### Cache Largo (1 día)
```bash
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=86400000
VITE_IMAGE_CACHE_DURATION=86400000
```

## 🛠️ Uso

### Desarrollo
```bash
# Con cache habilitado
VITE_CACHE_ENABLED=true npm run dev

# Con cache deshabilitado
VITE_CACHE_ENABLED=false npm run dev
```

### Producción
```bash
# Construir con cache habilitado (configuración recomendada)
VITE_CACHE_ENABLED=true VITE_CACHE_DURATION=3600000 VITE_IMAGE_CACHE_DURATION=1800000 npm run build

# Construir con cache deshabilitado (solo para pruebas)
VITE_CACHE_ENABLED=false npm run build
```

## 🧪 Funciones de Debug

En la consola del navegador están disponibles las siguientes funciones:

```javascript
// Información del cache del Service Worker
window.debugImmerCatalog.getServiceWorkerCacheInfo()

// Limpiar cache del Service Worker
await window.debugImmerCatalog.clearServiceWorkerCache()

// Limpiar cache del catálogo
window.debugImmerCatalog.clearCatalogCache()

// Información completa de cache
window.debugImmerCatalog.getCacheInfo()
```

## 📊 Cómo Funciona

1. **Generación Automática**: El Service Worker se genera automáticamente antes de cada build/dev con la configuración actual
2. **Cache Condicional**: Si `VITE_CACHE_ENABLED=false`, el Service Worker no almacena ningún contenido
3. **Duraciones Personalizables**: Puedes ajustar independientemente la duración del cache general y de imágenes
4. **Limpieza Automática**: Los caches antiguos se eliminan automáticamente

## 🔄 Comportamiento por Tipo de Contenido

### Cache Habilitado (`VITE_CACHE_ENABLED=true`)
- **Imágenes de productos**: Cache con duración `VITE_IMAGE_CACHE_DURATION`
- **Contenido general**: Cache con duración `VITE_CACHE_DURATION`
- **Estrategia**: Network-first con fallback a cache

### Cache Deshabilitado (`VITE_CACHE_ENABLED=false`)
- **Todos los recursos**: Sin cache, directamente desde la red
- **Limpieza**: Se eliminan todos los caches existentes

## 📋 Scripts Disponibles

```bash
# Generar Service Worker manualmente
npm run generate-sw

# Desarrollo con generación automática de SW
npm run dev

# Construcción con generación automática de SW  
npm run build
```

## ⚡ Casos de Uso Recomendados

### Desarrollo Local
```bash
VITE_CACHE_ENABLED=false  # Sin cache para ver cambios inmediatos
```

### Testing/Staging
```bash
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=300000      # 5 minutos
VITE_IMAGE_CACHE_DURATION=300000 # 5 minutos
```

### Producción
```bash
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=3600000      # 1 hora
VITE_IMAGE_CACHE_DURATION=1800000 # 30 minutos
```

## 🎯 Solución al Problema Original

Con este sistema, ya no necesitas **reiniciar el servidor** cuando actualices imágenes de productos:

1. **Durante desarrollo**: Usa `VITE_CACHE_ENABLED=false` para ver cambios inmediatos
2. **En producción**: Usa duraciones cortas (30 min) para que las imágenes se actualicen automáticamente

## 💡 Consejos

- Las duraciones están en **milisegundos**
- 1 minuto = 60000 ms
- 1 hora = 3600000 ms  
- 1 día = 86400000 ms
- El cache se limpia automáticamente cuando cambias `VITE_CACHE_ENABLED`
- Usa las funciones de debug para verificar el estado del cache
