import fs from 'fs';
import path from 'path';

// Leer las variables de entorno
const cacheEnabled = process.env.VITE_CACHE_ENABLED === 'true';
const cacheDuration = parseInt(process.env.VITE_CACHE_DURATION) || (1 * 60 * 60 * 1000); // 1 hora por defecto
const imageCacheDuration = parseInt(process.env.VITE_IMAGE_CACHE_DURATION) || (30 * 60 * 1000); // 30 minutos por defecto

// Generar nombre de cache único cuando esté deshabilitado para forzar limpieza
const cacheVersion = cacheEnabled ? 'v1' : `disabled-${Date.now()}`;

console.log('🔧 Generando Service Worker con configuración:', {
    cacheEnabled,
    cacheVersion,
    cacheDuration: `${cacheDuration / 1000 / 60} minutos`,
    imageCacheDuration: `${imageCacheDuration / 1000 / 60} minutos`
});

// Plantilla del Service Worker
const swTemplate = `// Service Worker para Immer Web - Generado automáticamente
// Cache habilitado: ${cacheEnabled}
// Cache version: ${cacheVersion}
// Duración cache: ${cacheDuration / 1000 / 60} minutos
// Duración cache imágenes: ${imageCacheDuration / 1000 / 60} minutos
// Generado: ${new Date().toISOString()}

const CACHE_NAME = 'immer-cache-${cacheVersion}';
const CACHE_ENABLED = ${cacheEnabled};
const CACHE_DURATION = ${cacheDuration}; // milisegundos
const IMAGE_CACHE_DURATION = ${imageCacheDuration}; // milisegundos

// Recursos a pre-cachear en la instalación
const PRECACHE_URLS = [
  '/',
  '/image/product.webp',
  '/image/product.png',
  '/image/no-brand.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando... Cache habilitado:', CACHE_ENABLED);

  if (CACHE_ENABLED) {
    // Pre-cachear recursos esenciales solo si el cache está habilitado
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Pre-cacheando recursos...');
          return cache.addAll(PRECACHE_URLS);
        })
        .then(() => self.skipWaiting())
    );
  } else {
    event.waitUntil(self.skipWaiting());
  }
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado. Cache habilitado:', CACHE_ENABLED);

  event.waitUntil(
    Promise.all([
      // Limpiar caches si está deshabilitado
      !CACHE_ENABLED ? caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
          console.log('Service Worker: Eliminando cache (deshabilitado):', cacheName);
          return caches.delete(cacheName);
        }));
      }) : Promise.resolve(),
      
      // Limpiar caches antiguas si está habilitado
      CACHE_ENABLED ? caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('Service Worker: Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }) : Promise.resolve(),
      
      self.clients.claim()
    ])
  );
});

// Interceptar solicitudes fetch
self.addEventListener('fetch', event => {
  // Si el cache está deshabilitado, pasar todo directamente a la red
  if (!CACHE_ENABLED) {
    return; // Deja que la solicitud pase normalmente sin caché
  }

  const url = new URL(event.request.url);

  // Estrategia específica para las imágenes de productos
  if (url.pathname.includes('/image/products/') || url.pathname.includes('/image/brand/')) {
    event.respondWith(handleImageRequest(event.request));
  } else if (event.request.method === 'GET') {
    // Para otras solicitudes GET, usamos una estrategia de network-first
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Solo cachear respuestas exitosas
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, intentar desde el cache
          return caches.match(event.request);
        })
    );
  }
});

// Función para manejar las solicitudes de imágenes
async function handleImageRequest(request) {
  try {
    const url = new URL(request.url);
    const isExternalImage = url.origin !== self.location.origin &&
      (url.hostname === 'immer.ec' || url.hostname === 'shop.immer.ec');

    // Si es una imagen externa, usar nuestro proxy
    if (isExternalImage) {
      // Crear una nueva URL para usar nuestro proxy
      const requestUrl = new URL('/api/proxy', self.location.origin);
      requestUrl.searchParams.set('url', request.url);

      // Creamos una nueva solicitud usando nuestro proxy
      const proxyRequest = new Request(requestUrl.toString(), {
        method: 'GET',
        headers: request.headers,
        mode: 'cors',
        credentials: 'same-origin',
        redirect: 'follow'
      });

      // Verificar caché para esta solicitud proxy
      const cachedResponse = await caches.match(proxyRequest);

      if (cachedResponse) {
        // Comprobar si la respuesta caché está "fresca"
        const headers = cachedResponse.headers;
        const cachedTime = headers.get('x-cached-time');

        if (cachedTime && (Date.now() - Number(cachedTime)) < IMAGE_CACHE_DURATION) {
          // Caché fresca, devolverla directamente
          return cachedResponse;
        }
      }

      // Si no hay caché o está obsoleta, usar el proxy
      try {
        const networkResponse = await fetch(proxyRequest);

        if (networkResponse && networkResponse.status === 200) {
          // Clonar la respuesta porque se consumirá
          const responseToCache = networkResponse.clone();

          // Abrir la caché y guardar la nueva respuesta con timestamp
          caches.open(CACHE_NAME).then(cache => {
            const headers = new Headers(responseToCache.headers);
            headers.append('x-cached-time', Date.now().toString());

            // Crear una nueva respuesta con los headers actualizados
            const newResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });

            cache.put(proxyRequest, newResponse);
          });
        }

        return networkResponse;
      } catch (err) {
        console.error('Error fetching through proxy:', err);
        // Si falla el proxy pero tenemos una caché (aunque sea vieja), la usamos
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no hay caché, devolver una imagen por defecto
        return caches.match(url.pathname.includes('/brand/')
          ? '/image/no-brand.png'
          : '/image/product.webp') || caches.match('/image/product.png');
      }
    } else {
      // Manejar las imágenes locales con caché configurable
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        // Comprobar si la respuesta caché está "fresca"
        const headers = cachedResponse.headers;
        const cachedTime = headers.get('x-cached-time');

        if (cachedTime && (Date.now() - Number(cachedTime)) < IMAGE_CACHE_DURATION) {
          // Caché fresca, devolverla directamente
          return cachedResponse;
        }
      }

      // Si no hay caché o está obsoleta, hacer solicitud a la red
      try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
          // Clonar la respuesta porque se consumirá
          const responseToCache = networkResponse.clone();

          // Abrir la caché y guardar la nueva respuesta con timestamp
          caches.open(CACHE_NAME).then(cache => {
            const headers = new Headers(responseToCache.headers);
            headers.append('x-cached-time', Date.now().toString());

            // Crear una nueva respuesta con los headers actualizados
            const newResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });

            cache.put(request, newResponse);
          });
        }

        return networkResponse;
      } catch (err) {
        // Si la red falla pero tenemos una caché (aunque sea vieja), la usamos
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no hay caché, devolver una imagen por defecto según el tipo
        return caches.match(url.pathname.includes('/brand/')
          ? '/image/no-brand.png'
          : '/image/product.webp') || caches.match('/image/product.png');
      }
    }
  } catch (error) {
    console.error('Error en handleImageRequest:', error);
    // En caso de error devolver una imagen predeterminada
    return caches.match('/image/product.webp') || caches.match('/image/product.png');
  }
}

// Limpiar cache cuando se reciben mensajes específicos
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Limpiando cache por solicitud...');
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cacheName => {
        return caches.delete(cacheName);
      }));
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
`;

// Escribir el archivo generado
const outputPath = path.resolve('static/sw.js');
fs.writeFileSync(outputPath, swTemplate, 'utf8');

console.log('✅ Service Worker generado correctamente en:', outputPath);
