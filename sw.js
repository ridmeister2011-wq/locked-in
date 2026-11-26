// Offline: app files cached on install; fonts cached when first fetched. Bump V to ship updates.
const V='locked-in-v4',FILES=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='li-status').map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 // network first so updates show up, cache as fallback when offline
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});

// Evening push: the page saves {date,left,streak} in the li-status cache; decide the message here.
const today=()=>{const x=new Date();x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)};
function message(st){
 if(!st||st.date!==today())return['Your streak is on the line','You haven\'t opened Locked In today. Finish your quests before midnight.'];
 if(st.left===0)return['Locked in today',`Your ${st.streak}-day streak is safe. Nice work.`];
 return[st.streak?`Your ${st.streak}-day streak ends at midnight`:'Start your streak tonight',`${st.left} quest${st.left>1?'s':''} left. You've got this.`]}
self.addEventListener('push',e=>{e.waitUntil((async()=>{let st=null;
 try{const r=await (await caches.open('li-status')).match('status');if(r)st=await r.json()}catch(_){}
 const[title,body]=message(st);await self.registration.showNotification(title,{body,icon:'icon-192.png',badge:'icon-192.png',tag:'streak'})})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(w=>w[0]?w[0].focus():clients.openWindow('./')))});
