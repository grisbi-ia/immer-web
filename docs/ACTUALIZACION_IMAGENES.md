# 🔄 Sistema de Actualización de Imágenes

## Problema Identificado

Cuando se actualiza una imagen de producto (archivo WebP), las imágenes no se refrescan automáticamente debido a:

1. **Caché del navegador**: Las imágenes se cachean y el navegador no detecta cambios
2. **Service Worker**: El SW cachea imágenes por 7 días para optimizar rendimiento
3. **Falta de invalidación**: No hay mecanismo para notificar cambios de imagen

## Solución Implementada

### 1. Cache-Busting en `image-utils.ts`

```typescript
// Función mejorada con cache-busting
getBestImageSource(productId: string, fallback: string, bustCache: boolean = false)

// Nueva función para forzar refresh
refreshProductImage(productId: string): Promise<string>
```

### 2. Service Worker Inteligente

- Detecta parámetro `t=` en URLs (cache-busting)
- Salta el caché cuando hay cache-busting
- Hace solicitud directa al servidor

### 3. Componentes con Auto-Refresh

**ProductCard.svelte:**
- Botón de refresh (🔄) visible al hover
- Doble-click en imagen para refrescar
- Escucha notificaciones automáticas

**ProductModal.svelte:**
- Botón de refresh en esquina superior derecha
- Sistema de notificación integrado

### 4. Sistema de Notificaciones

```typescript
// En el store
export const imageUpdateNotifier: Writable<{productId: string; timestamp: number} | null>

// Función para notificar
export function notifyImageUpdate(productId: string)
```

## Cómo Usar

### Opción 1: Botón Manual de Refresh
- Hover sobre imagen de producto → botón 🔄 aparece
- Click en el botón para refrescar imagen

### Opción 2: Doble-Click
- Doble-click en cualquier imagen de producto para refrescarla

### Opción 3: Notificación Programática (Para desarrolladores)
```javascript
import { notifyImageUpdate } from '$lib/stores/store';

// Después de subir/actualizar imagen
notifyImageUpdate(productId);
```

## Funciones Disponibles

### `refreshProductImage(productId)`
```typescript
// Fuerza recarga de imagen específica
const newSrc = await refreshProductImage('123');
```

### `getBestImageSource(productId, fallback, bustCache)`
```typescript
// Con cache-busting
const src = await getBestImageSource('123', '/fallback.webp', true);
```

### `notifyImageUpdate(productId)`
```typescript
// Notifica a todos los componentes del cambio
notifyImageUpdate('123');
```

## Flujo de Actualización

1. **Usuario actualiza imagen WebP** → Archivo reemplazado en `/static/image/products/`
2. **Sistema detecta que necesita refresh** → Botón manual o notificación automática
3. **Cache-busting activado** → URL con timestamp `?t=1234567890`
4. **Service Worker omite caché** → Solicitud directa al servidor
5. **Nueva imagen cargada** → Componente actualizado

## Debugging

### Ver logs en consola:
```
🔄 Refrescando imagen para producto: 123
Cache-busting detectado para imagen local: /image/products/123.webp?t=1703123456
🖼️ Notificando actualización de imagen: {productId: "123", timestamp: 1703123456}
```

### Verificar en DevTools:
1. Network tab → ver solicitudes con `?t=` 
2. Application → Storage → Cache → verificar entradas
3. Console → logs del sistema de refresh

## Mejores Prácticas

### Para Desarrolladores:
```javascript
// Después de subir nueva imagen
await uploadImage(file, productId);
notifyImageUpdate(productId); // Notificar cambio
```

### Para Usuarios:
- Si imagen no se actualiza → doble-click o botón refresh
- Los cambios son inmediatos con cache-busting
- No necesita reiniciar servidor

## Archivos Modificados

- `src/lib/util/image-utils.ts` - Lógica de cache-busting
- `src/lib/components/ProductCard.svelte` - UI y auto-refresh
- `src/lib/components/ProductModal.svelte` - Modal con refresh
- `src/lib/stores/store.ts` - Sistema de notificaciones
- `static/sw.js` - Service Worker inteligente

## Configuración

### Duración de caché (Service Worker):
```javascript
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días
```

### Timeout de notificaciones:
```javascript
setTimeout(() => {
    imageUpdateNotifier.set(null);
}, 1000); // 1 segundo
```
