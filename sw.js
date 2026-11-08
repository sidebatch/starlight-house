'use strict';
const BUILD = '0.5.1-2850393c4ff8';
const PREFIX='starlight-house-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-',SHELL=PREFIX+'shell-'+BUILD,MEDIA=PREFIX+'media-'+BUILD;
const FILES=[
  './index.html','./manifest.webmanifest',
  './src/styles.css','./src/pwa.css','./src/pwa.js','./src/content.js','./src/stories.js','./src/festival.js','./src/shop.js','./src/engine.js','./src/app.js',
  './assets/manifest.js','./assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/icon-maskable-512.png','./assets/icons/apple-touch-icon.png'
];
const absolute=path=>new URL(path,self.registration.scope).href;
const core=new Set(FILES.map(absolute));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL);
    try{
      await Promise.all(FILES.map(async file=>{
        const request=new Request(absolute(file),{cache:'reload',credentials:'same-origin'}),response=await fetch(request);
        if(!response.ok||response.redirected)throw new Error('Incomplete app download');
        const type=response.headers.get('content-type')||'';
        if((file.endsWith('.js')&&!/(?:java|ecma)script/i.test(type))||(file.endsWith('.css')&&!/text\/css/i.test(type))||(file.endsWith('.png')&&!/image\/png/i.test(type)))throw new Error('Unexpected app response');
        await cache.put(request,response);
      }));
    }catch(error){await caches.delete(SHELL);throw error}
    // A replacement waits until the player chooses to save and update.
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==SHELL&&key!==MEDIA).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
  if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  const isHome=url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html';
  if(request.mode==='navigate'&&isHome){
    event.respondWith((async()=>{const cache=await caches.open(SHELL);return await cache.match(absolute('./index.html'))||fetch(request)})());return;
  }
  const key=new URL(url);key.search='';key.hash='';
  if(core.has(key.href)){
    event.respondWith((async()=>{const cache=await caches.open(SHELL);return await cache.match(key.href)||fetch(request)})());return;
  }
  if(request.destination==='image'&&url.pathname.startsWith(scope.pathname+'assets/')){
    event.respondWith((async()=>{
      const cache=await caches.open(MEDIA),saved=await cache.match(request);if(saved)return saved;
      const response=await fetch(request);if(response.ok&&!response.redirected&&response.type!=='opaque'){
        await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>120)await cache.delete(keys[0]);
      }return response;
    })());
  }
});
