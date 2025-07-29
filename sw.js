const CACHE_NAME = 'weather-app-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/WeatherService.js',
  '/js/WeatherUI.js',
  '/js/WeatherUtils.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.ttf'
];

const WEATHER_API_CACHE = 'weather-api-v1.0.0';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== WEATHER_API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle weather API requests
  if (url.pathname.includes('/netlify/functions/weather') || url.href.includes('openweathermap.org')) {
    event.respondWith(handleWeatherAPI(request));
    return;
  }

  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response; // Return cached version
          }
          return fetch(request)
            .then(fetchResponse => {
              // Cache new responses for static assets
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              // Return offline page for HTML requests
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// Handle weather API requests with caching
async function handleWeatherAPI(request) {
  const cache = await caches.open(WEATHER_API_CACHE);
  const cachedResponse = await cache.match(request);

  try {
    // Try to fetch fresh data
    const fetchResponse = await fetch(request);
    
    if (fetchResponse.ok) {
      // Cache the fresh response
      const responseClone = fetchResponse.clone();
      cache.put(request, responseClone);
      return fetchResponse;
    } else {
      // If fetch fails, return cached version if available
      if (cachedResponse) {
        console.log('Returning cached weather data');
        return cachedResponse;
      }
      throw new Error('Network request failed');
    }
  } catch (error) {
    console.error('Weather API fetch failed:', error);
    
    // Return cached version if available
    if (cachedResponse) {
      console.log('Returning cached weather data due to network error');
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Hava durumu verisi şu anda kullanılamıyor. Lütfen internet bağlantınızı kontrol edin.'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending weather requests
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'background-sync',
        message: 'Veriler güncelleniyor...'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni hava durumu güncellemesi',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Modern Hava Durumu', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
}); 