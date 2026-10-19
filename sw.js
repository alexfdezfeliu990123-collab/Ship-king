// NaviMar - service worker: la app y la carta funcionan sin conexión
const V="navimar-v3",SHELL=["./","index.html","manifest.json","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  // Clima y AIS: siempre por red; la app guarda su propia copia local
  if(/open-meteo|aisstream|marinetraffic/.test(u.host))return;
  if(r.headers.get("x-token")!==null)return; // llamadas a tu servidor NaviMar: siempre por red
  // Resto (app y teselas de cartas): caché primero y actualiza en segundo plano
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque")caches.open(V).then(c=>c.put(r,res.clone()));return res}).catch(()=>hit);
    return hit||net}));
});

// Notificaciones push (requieren servidor push; ver CFG.PUSH_URL / CFG.PUSH_KEY en index.html)
self.addEventListener("push",e=>{let d={};try{d=e.data.json()}catch(x){d={body:e.data?e.data.text():"Alerta"}}
  e.waitUntil(self.registration.showNotification(d.title||"⚠ NaviMar · PELIGRO",{body:d.body||d.msg||"",tag:"navimar-alert",renotify:true,requireInteraction:true,vibrate:[500,150,500,150,800],icon:"icon.svg"}))});
self.addEventListener("notificationclick",e=>{e.notification.close();
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow("./")))});
