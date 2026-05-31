// public/sw.js
// Service Worker për Web Push Notifications — Vaqo

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim())
})

// Push event — triggered nga server
self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/favicon.svg',
      badge:   '/favicon.svg',
      tag:     data.tag || 'vaqo',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/' },
      requireInteraction: data.requireInteraction || false,
    })
  )
})

// Notification click — hap faqen
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      const url = e.notification.data?.url || '/'
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
