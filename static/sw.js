// Service Worker para Immer Web
// Versión: 1.0.0

const CACHE_NAME = 'immer-cache-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

// Recursos a pre-cachear en la instalación
const PRECACHE_URLS = [
  '/',
  '/image/product.png',
  '/image/no-brand.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  // Pre-cachear recursos esenciales
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Pre-cacheando recursos...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  
  // Limpiar caches antiguas
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Eliminando cache antigua:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar solicitudes fetch
self.addEventListener('fetch', event => {
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
    const isExternalImage = url.origin !== self.location.origin && url.hostname === 'immer.ec';
    
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
        
        if (cachedTime && (Date.now() - Number(cachedTime)) < CACHE_DURATION) {
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
          : '/image/product.png');
      }
    } else {
      // Manejar las imágenes locales normalmente
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse) {
        // Comprobar si la respuesta caché está "fresca"
        const headers = cachedResponse.headers;
        const cachedTime = headers.get('x-cached-time');
        
        if (cachedTime && (Date.now() - Number(cachedTime)) < CACHE_DURATION) {
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
          : '/image/product.png');
      }
    }
  } catch (error) {
    console.error('Error en handleImageRequest:', error);
    // En caso de error devolver una imagen predeterminada
    return caches.match('/image/product.png');
  }
}