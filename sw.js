const cacheVer = 'app-shell-1';


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheVer).then(cache => {
            return cache.addAll([
                'app.js',
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

self.addEventListener('fetch', function(event){
    
    event.respondWith( 
        caches.match(event.request)
         .then(response => {
           return response || fetch(event.request);
        })
        .then(response => {
            return Promise.all([caches.open(cacheVer), Promise.resolve(response)])
        })
        .then(([cache, response]) => {
                if(!event.request.url.includes('chrome-extension')){
                    cache.put(event.request,response.clone());
                }
                return response;
        })
        .catch(() => Promise.resolve(new Response))    
    );
})