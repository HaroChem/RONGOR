const C='rongorin-v2';
const SHELL=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Cache-first: the app always opens from the saved copy on the phone.
// A good (200) network answer refreshes the saved copy in the background;
// errors or 404s (site removed / repo private) never replace it.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isPage=e.request.mode==='navigate';
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(isPage?'./index.html':e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&r.ok){c.put(isPage?'./index.html':e.request,r.clone())}return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const r=await net;return r||new Response('Offline',{status:503});
  }));
});
