const CACHE='testify-v5';
const SHELL=['./','./index.html','./manifest.json'];
const CDN=[
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const cacheable=url.origin===location.origin||CDN.some(c=>req.url.startsWith(c.split('/').slice(0,5).join('/')));
  e.respondWith(
    caches.match(req).then(hit=>{
      const net=fetch(req).then(res=>{
        if(cacheable&&res&&(res.ok||res.type==='opaque'))
          caches.open(CACHE).then(c=>c.put(req,res.clone()));
        return res;
      }).catch(()=>hit);
      return hit||net;
    })
  );
});
