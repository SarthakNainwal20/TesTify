const CACHE='testify-v9';           // bump this number on every deploy so installed copies refresh
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const CACHE_HOSTS=['cdn.jsdelivr.net','cdnjs.cloudflare.com','unpkg.com','esm.sh','fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Sign-in server, AI APIs and everything else cross-origin go straight to the network (never touched here)
  if(url.origin!==location.origin&&!CACHE_HOSTS.includes(url.hostname))return;
  if(req.mode==='navigate'){            // open the app even when offline
    e.respondWith(fetch(req).then(res=>{
      if(res&&res.ok)caches.open(CACHE).then(c=>c.put('./index.html',res.clone()));
      return res;
    }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque'))caches.open(CACHE).then(c=>c.put(req,res.clone()));
      return res;
    }).catch(()=>hit||Response.error());
    return hit||net;
  }));
});
