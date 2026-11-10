'use strict';
const BUILD = '0.15.0-9cd564b7b066';
const PREFIX='starlight-house-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-',SHELL=PREFIX+'shell-'+BUILD,MEDIA=PREFIX+'media-'+BUILD;
const FILES=["./assets/scenes/activities/reading.webp","./assets/scenes/activities/painting.webp","./assets/scenes/activities/sword.webp","./assets/scenes/activities/etiquette.webp","./assets/scenes/activities/athletics.webp","./assets/scenes/activities/nature.webp","./assets/scenes/activities/chores.webp","./assets/scenes/activities/farm.webp","./assets/scenes/activities/library.webp","./assets/scenes/activities/workshop.webp","./assets/scenes/activities/salon.webp","./assets/scenes/activities/rest.webp","./assets/scenes/activities/stroll.webp","./assets/scenes/activities/trip.webp","./assets/scenes/activities/magic.webp","./assets/scenes/activities/cooking.webp","./assets/scenes/activities/church.webp","./assets/scenes/activities/music.webp","./assets/scenes/activities/dance.webp","./assets/scenes/activities/medicine.webp","./assets/scenes/activities/strategy.webp","./assets/scenes/activities/market.webp","./assets/scenes/activities/inn.webp","./assets/scenes/activities/guard.webp","./assets/scenes/activities/courier.webp","./assets/scenes/activities/reading-thumb.webp","./assets/scenes/activities/painting-thumb.webp","./assets/scenes/activities/sword-thumb.webp","./assets/scenes/activities/etiquette-thumb.webp","./assets/scenes/activities/athletics-thumb.webp","./assets/scenes/activities/nature-thumb.webp","./assets/scenes/activities/chores-thumb.webp","./assets/scenes/activities/farm-thumb.webp","./assets/scenes/activities/library-thumb.webp","./assets/scenes/activities/workshop-thumb.webp","./assets/scenes/activities/salon-thumb.webp","./assets/scenes/activities/rest-thumb.webp","./assets/scenes/activities/stroll-thumb.webp","./assets/scenes/activities/trip-thumb.webp","./assets/scenes/activities/magic-thumb.webp","./assets/scenes/activities/cooking-thumb.webp","./assets/scenes/activities/church-thumb.webp","./assets/scenes/activities/music-thumb.webp","./assets/scenes/activities/dance-thumb.webp","./assets/scenes/activities/medicine-thumb.webp","./assets/scenes/activities/strategy-thumb.webp","./assets/scenes/activities/market-thumb.webp","./assets/scenes/activities/inn-thumb.webp","./assets/scenes/activities/guard-thumb.webp","./assets/scenes/activities/courier-thumb.webp",
  './index.html','./manifest.webmanifest',
  './src/styles.css','./src/pwa.css','./src/pwa.js','./src/content.js','./src/stories.js','./src/festival.js','./src/shop.js','./src/items.js','./src/market.js','./src/market-ui.js','./src/market.css','./src/engine.js','./src/rules.js','./src/adventure.js','./src/legacy-engine.js','./src/engine-v2.js','./src/gameplay-ui.js','./src/gameplay.css','./src/schedule.css','./src/stat-ui.css','./src/stat-ui.js','./src/appearance.js','./src/app.js','./src/feedback.js','./src/classic-ui.js','./src/classic.css','./assets/scenes.js',
  './assets/manifest.js','./assets/media-files.json','./assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/icon-maskable-512.png','./assets/icons/apple-touch-icon.png'
];
const absolute=path=>new URL(path,self.registration.scope).href;
const core=new Set(FILES.map(absolute));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL);
    try{
      const catalogResponse=await fetch(absolute('./assets/media-files.json'),{cache:'reload',credentials:'same-origin'});
      if(!catalogResponse.ok||catalogResponse.redirected)throw new Error('Missing game artwork catalog');
      const catalog=await catalogResponse.json();if(!Array.isArray(catalog.files)||catalog.files.some(file=>!/^assets\/(?:characters\/(?:ciel|valeria)\/1[0-7]-(?:base|summer|winter|adventurer|church|dress|gown)|rooms\/(?:artist|knight|merchant|monk|noble|wanderer))\.webp$/.test(file)))throw new Error('Invalid artwork catalog');
      const downloads=[...FILES,...catalog.files.map(file=>'./'+file)];let cursor=0;
      await Promise.all(Array.from({length:4},async()=>{while(cursor<downloads.length){const file=downloads[cursor++];
        const request=new Request(absolute(file),{cache:'reload',credentials:'same-origin'}),response=await fetch(request);
        if(!response.ok||response.redirected)throw new Error('Incomplete app download');
        const type=response.headers.get('content-type')||'';
        if((file.endsWith('.js')&&!/(?:java|ecma)script/i.test(type))||(file.endsWith('.css')&&!/text\/css/i.test(type))||(file.endsWith('.png')&&!/image\/png/i.test(type))||(file.endsWith('.webp')&&!/image\/webp/i.test(type)))throw new Error('Unexpected app response');
        await cache.put(request,response);
      }}));
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
      const shell=await caches.open(SHELL),cache=await caches.open(MEDIA),saved=await shell.match(request,{ignoreSearch:true})||await cache.match(request);if(saved)return saved;
      const response=await fetch(request);if(response.ok&&!response.redirected&&response.type!=='opaque'){
        await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>120)await cache.delete(keys[0]);
      }return response;
    })());
  }
});
