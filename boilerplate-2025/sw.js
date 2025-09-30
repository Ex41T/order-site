/* ==========================================================================
   SERVICE WORKER - 2025/2026
   ========================================================================== */

const CACHE_NAME = 'portfolio-2025-v1.0.0';
const STATIC_CACHE_NAME = 'portfolio-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'portfolio-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'portfolio-images-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/reset.css',
  '/assets/css/base.css',
  '/assets/css/utilities.css',
  '/assets/js/main.js',
  '/assets/js/modules/performance.js',
  '/assets/js/modules/theme.js',
  '/assets/js/modules/portfolio.js',
  '/assets/js/modules/contact.js',
  '/assets/js/modules/navigation.js',
  '/assets/js/modules/animations.js',
  '/assets/js/modules/fps-debug.js',
  '/assets/manifest.json',
  '/assets/fonts/roboto-variable.woff2',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Assets to cache on demand
const DYNAMIC_ASSETS = [
  '/assets/images/',
  '/assets/videos/',
  'https://www.youtube.com/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.includes(url.pathname) || 
         url.pathname.startsWith('/assets/css/') ||
         url.pathname.startsWith('/assets/js/') ||
         url.pathname.startsWith('/assets/fonts/');
}

// Check if request is for images
function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/assets/images/') ||
         url.pathname.startsWith('/assets/icons/') ||
         request.destination === 'image';
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.hostname === 'api.example.com';
}

// Handle static assets - cache first
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to handle static asset:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle images - cache first with fallback
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to handle image request:', error);
    
    // Return placeholder image or fallback
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">Image not available offline</text></svg>',
      { 
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Handle API requests - network first
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to handle API request:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'API not available offline' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle page requests - network first with cache fallback
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to handle page request:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return new Response(
      `<!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Patryk Bobrowski</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            margin: 0;
            padding: 2rem;
            background: #040810;
            color: #e7f1ff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          .offline-container {
            max-width: 500px;
          }
          h1 {
            color: #00d5ff;
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 2rem;
            opacity: 0.8;
          }
          .retry-btn {
            background: #00d5ff;
            color: #040810;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .retry-btn:hover {
            background: #1ee3ff;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <h1>🔌 Brak połączenia</h1>
          <p>Wygląda na to, że jesteś offline. Sprawdź połączenie internetowe i spróbuj ponownie.</p>
          <button class="retry-btn" onclick="window.location.reload()">Spróbuj ponownie</button>
        </div>
      </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await removePendingSubmission(submission.id);
          console.log('✅ Form submission synced:', submission.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync form submission:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Zobacz więcej',
          icon: '/assets/icons/explore-icon.png'
        },
        {
          action: 'close',
          title: 'Zamknij',
          icon: '/assets/icons/close-icon.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Helper functions for IndexedDB
async function getPendingSubmissions() {
  // Implementation would use IndexedDB to retrieve pending form submissions
  return [];
}

async function removePendingSubmission(id) {
  // Implementation would use IndexedDB to remove a pending submission
  return true;
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  const startTime = performance.now();
  
  event.respondWith(
    handleRequest(event.request).then((response) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`⚠️ Slow request: ${event.request.url} took ${duration}ms`);
      }
      
      return response;
    })
  );
});

async function handleRequest(request) {
  // This would be the main request handling logic
  return fetch(request);
}

console.log('🔧 Service Worker loaded successfully');
