self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('my-pwa-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/styles/global.css',
          '/pages/_app.js',
          '/pages/index.js',
          '/favicon.ico',
          '/public/images/icon192.jpg',
          '/public/images/icon512.jpg',
          // Добавьте другие важные ресурсы
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });