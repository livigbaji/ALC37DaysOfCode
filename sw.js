const cacheVer = 'app-shell-4';


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheVer).then(cache => {
            return cache.addAll([
                'app.js',
                'favicon.ico',
                'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.2/localforage.js',
                'index.html',
                'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-rc.2/js/materialize.min.js',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-rc.2/css/materialize.min.css'
            ]);
        }).then(() => {
          return self.skipWaiting();
        })
    );
})


self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
                keys.map(key =>  key !== cacheVer ? caches.delete(key): Promise.resolve(null) ) 
            )
        )      
    )
})

self.addEventListener('fetch', event=>{
    if(!event.request.url.includes('chrome-extension')){
        event.respondWith(async function(){
            try{
                let cacheResponse = await caches.match(event.request);
                if(cacheResponse) return cacheResponse;
                let response = await fetch(event.request);
                let cache = await caches.open(cacheVer)
                cache.put(event.request,response.clone());
                return response;
            }catch(e){
                console.log(e)
                return new Response
            }
        }())  
    }
})
