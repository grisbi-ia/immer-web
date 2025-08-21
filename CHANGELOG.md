# Changelog

## Version [2.1.6] - 2025-08-21
### New features (Nuevo)
- 🔧 Sistema de caché configurable mediante variables de entorno
- 🎛️ Control total de habilitación/deshabilitación de caché con `VITE_CACHE_ENABLED`
- ⏱️ Duraciones personalizables de caché general e imágenes por separado
- 🔄 Generación automática de Service Worker con configuración dinámica
- 🧹 Funciones avanzadas de limpieza de caché (Service Worker, navegador, catálogo)
- 📊 Herramientas de debug completas para diagnóstico de caché
- 🗑️ Función `clearAllCache()` para limpieza total con recarga automática
- 🔄 Función `forceUpdateServiceWorker()` para actualización forzada de SW

### Improvements (Mejoras)
- ✨ Service Worker con versionado automático para prevenir cache obsoleto
- 🚀 Scripts de build y dev actualizados para generación automática de SW
- 📋 Archivo `.env.example` con todas las configuraciones de caché
- 📖 Documentación completa en `CACHE_CONFIG.md` y `TROUBLESHOOTING_CACHE.md`
- 🎯 Solución definitiva al problema de caché de imágenes de productos
- ⚡ Configuraciones rápidas para desarrollo, testing y producción

### Bug fixes (Corección de Errores)
- 🐛 Eliminación de código duplicado en ProductCard.svelte
- 🔧 Corrección de errores de compilación TypeScript
- 🗂️ Limpieza de funciones obsoletas de cache-busting
- 📦 Remoción completa del sistema de notificaciones de imágenes

### Tasks
- 🧪 Integración de funciones de debug en objeto global `window.debugImmerCatalog`
- 📝 Creación de documentación técnica para troubleshooting
- 🔄 Actualización de package.json con nuevos scripts
- 🏷️ Variables de entorno organizadas y documentadas
- 🎨 Simplificación de componentes UI (eliminación de botones de refresh)

## Version [2.1.5] - 2025-08-20
### New features (Nuevo)
### Improvements (Mejoras)
- Migración de dominio de `immer.ec` a `shop.immer.ec`
- Actualización de Service Worker para soportar ambos dominios
- Actualización de API Proxy para permitir tráfico desde ambos dominios
- Mejora en preconnect DNS para optimización de carga
### Bug fixes (Corección de Errores)
- Corrección de referencias hardcodeadas al dominio anterior
- Compatibilidad hacia atrás mantenida para `immer.ec`
### Tasks
- Revisión exhaustiva de código para detectar referencias de dominio
- Actualización de configuraciones de seguridad en proxy
- Optimización de DNS preconnect para mejor rendimiento

## Version [2.1.4] - 2025-08-20
### New features (Nuevo)
### Improvements (Mejoras)
- Actualización de datos del catálogo con timestamp actualizado
- Limpieza y optimización de scripts de mantenimiento
### Bug fixes (Corección de Errores)
### Tasks
- Eliminación de scripts de prueba redundantes (test-filtros-independientes.sh, test-navegacion.sh)
- Simplificación del script de limpieza de caché
- Actualización del catálogo de relaciones con datos frescos

## Version [2.1.3] - 2025-07-07

### 🎯 Resumen de Cambios Principales
Esta versión incluye una refactorización completa del sistema de filtros del catálogo, implementación de persistencia de navegación robusta, y optimización de tiempos de caché para desarrollo más ágil.

### New features (Nuevo)
- 🗂️ Sistema completo de filtros independientes (Marca, Grupo, Subgrupo, Nombre)
- 💾 Persistencia robusta de filtros, paginación y posición de scroll al navegar entre páginas
- 🧹 Herramientas automáticas de limpieza de caché del catálogo
- 📊 Funciones de debug y verificación de estado en consola del navegador
- 🔧 API endpoint `/api/debug/catalog` para diagnóstico del catálogo
- 🏷️ API endpoint `/api/shop/brands` para manejo de marcas
- 📝 Documentación técnica completa en carpeta `docs/`
- 🤖 Scripts automatizados de prueba y limpieza de caché

### Improvements (Mejoras)
- ⏰ Optimización del tiempo de caché del catálogo reducido de 30 minutos a 5 minutos para desarrollo más ágil
- 🔒 Filtro de Grupo configurado como solo lectura (disabled) por requerimiento de negocio
- 🔄 Mapeo del campo Subgrupo como parámetro "group" en el API remoto
- 🚀 Persistencia automática con debounce de 300ms para evitar sobrecarga
- 📱 Restauración inteligente de estado tras navegación (carrito, perfil, etc.)
- 🎨 Mejoras en la UI de filtros con iconos descriptivos y estados visuales
- 🔍 Búsqueda independiente que no resetea filtros aplicados
- 📄 Carga secuencial optimizada de páginas durante restauración

### Bug fixes (Corección de Errores)
- ✅ Corrección del flujo de filtros: ahora el subgrupo seleccionado se envía correctamente al API como parámetro "group"
- 🔧 Fix en condiciones de carrera durante restauración de estado
- 🎯 Corrección de limpiar marca no limpiaba grupo/subgrupo automáticamente
- 📊 Validación mejorada de datos del catálogo y manejo de errores
- 🔄 Prevención de restauraciones duplicadas con flag de control
- 💾 Corrección de persistencia de página actual tras navegación

### Tasks
- 📚 Creación de documentación técnica completa:
  - `NAVEGACION_PERSISTENTE.md`: Guía técnica de persistencia
  - `DIAGNOSTICO_NAVEGACION.md`: Análisis del problema original
  - `FILTROS_INDEPENDIENTES.md`: Documentación de filtros
  - `CORRECCION_PERSISTENCIA.md`: Correcciones implementadas
  - `LIMPIAR_CACHE_CATALOGO.md`: Guía de limpieza de caché
- 🧪 Scripts de prueba automatizados:
  - `test-navegacion.sh`: Pruebas de navegación
  - `test-filtros-independientes.sh`: Pruebas de filtros
  - `test-persistencia-filtros.sh`: Pruebas de persistencia
- 🤖 Script de limpieza automática: `clear-catalog-cache.sh`
- ⚙️ Configuración de persistencia de filtros con TTL de 5 minutos
- 🔍 Exposición de funciones de debug en `window.debugImmerCatalog`

### 📁 Archivos Nuevos Importantes
- **Componentes**: `BrandFilter.svelte`, `GroupFilter.svelte`, `SubgroupFilter.svelte`, `CatalogFilters.svelte`, `NameFilter.svelte`
- **Utilidades**: `catalog-relations.ts` con manejo de caché y relaciones bidireccionales
- **Configuración**: `catalog-relations.json` con estructura de catálogo
- **APIs**: Nuevos endpoints para debug y manejo de marcas
- **Scripts**: Herramientas automatizadas de prueba y limpieza

### 🔧 Archivos Modificados Principales
- `src/lib/util/util.ts`: Funciones de persistencia y restauración mejoradas
- `src/lib/stores/store.ts`: Nuevos stores para filtros y persistencia
- `src/routes/shop/+page.svelte`: Integración del nuevo sistema de filtros
- `src/routes/cart/+page.svelte`: Persistencia de navegación mejorada

### ⚡ Mejoras de Performance
- Cache TTL reducido para reflejar cambios más rápido en desarrollo
- Debounce en persistencia automática para reducir escrituras
- Carga lazy de páginas durante restauración
- Validación temprana de datos obsoletos en caché

## Version [2.1.2] - 2025-04-20
### New features (Nuevo)
### Improvements (Mejoras)
- Caché para imágenes con Service Worker y Proxy
- Imágen de marca en las tarjetas de items
- Optimización de carga de imágenes, lazy
- Mejora visual en la tarjeta del producto de la grilla, elevación de la misma con ratón y bordes
- Eliminación de Zoom en las imágenes
- Proxy 
### Bug fixes (Corección de Errores)
- Arreglo de recuperación de lista de precios de la sesión, valida si es nulo o no
### Tasks

## Version [2.1.1] - 2024-08-30
### New features (Nuevo)
### Improvements (Mejoras)
### Bug fixes (Corección de Errores)
- Arreglo de recuperación de lista de precios de la sesión, valida si es nulo o no
### Tasks

## Version [2.1] - 2024-08-29
### New features (Nuevo)
### Improvements (Mejoras)
- Búsqueda de items con Go Api
- Eliminación de descuentos por persona
- Uso de Listas de precios por persona
- Botón de cargar más en el listado de items
- Se muestra en el listado la cantidad de items por pantalla y las páginas recorrer
- Mejora visual en la barra lateral izquierda, sección categorías
### Bug fixes (Corección de Errores)
### Tasks

## Version [2.0] - 2022-09-20
### New features (Nuevo)
- Migración a nuevo SvelteKit
### Improvements (Mejoras)
### Bug fixes (Corección de Errores)
### Tasks

## Version [1.2] - 2022-09-18
### New features (Nuevo)
### Improvements (Mejoras)
- Se visualiza y se trabaja con los precios ya aplicado el descuento de la persona y el precio inicial.
- Se visualiza el porcentaje de descuento.
- La sección de búsqueda, se cambia al Sidebar izquierdo
### Bug fixes (Corección de Errores)
### Tasks

## Version [1.1] - 2022-07-29
### New features (Nuevo)
### Improvements (Mejoras)
- Se elimina la ruta "index" y se agrega "home", esto para que al cargar la página en el servidor, se realice un redireccionamiento a "home" y el script se cargue y muestre la página
### Bug fixes (Corección de Errores)
### Tasks

## Version [1.0] - 2022-07-29
### New features (Nuevo)
- Inicio, Tienda, Nosotros, Contacto
- Carrito de Compras
- Administración de Cuenta y Perfil de Usuario
### Improvements (Mejoras)
### Bug fixes (Corección de Errores)
### Tasks