// NaviMar - service worker: la app y la carta funcionan sin conexión
const V="navimar-v1",SHELL=["./","index.html","manifest.json","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  // Clima y AIS: siempre por red; la app guarda su propia copia local
  if(/open-meteo|aisstream|marinetraffic/.test(u.host))return;
  // Resto (app y teselas de cartas): caché primero y actualiza en segundo plano
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque")caches.open(V).then(c=>c.put(r,res.clone()));return res}).catch(()=>hit);
    return hit||net}));
});
