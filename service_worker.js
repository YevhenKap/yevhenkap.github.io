"use strict";try{self["workbox:core:5.1.4"]&&_()}catch(e){}const e=(e,...t)=>{let s=e;return t.length>0&&(s+=" :: "+JSON.stringify(t)),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}function s(e){e.then(()=>{})}class n{constructor(e,t,{onupgradeneeded:s,onversionchange:n}={}){this._db=null,this._name=e,this._version=t,this._onupgradeneeded=s,this._onversionchange=n||(()=>this.close())}get db(){return this._db}async open(){if(!this._db)return this._db=await new Promise((e,t)=>{let s=!1;setTimeout(()=>{s=!0,t(new Error("The open request was blocked and timed out"))},this.OPEN_TIMEOUT);const n=indexedDB.open(this._name,this._version);n.onerror=()=>t(n.error),n.onupgradeneeded=e=>{s?(n.transaction.abort(),n.result.close()):"function"==typeof this._onupgradeneeded&&this._onupgradeneeded(e)},n.onsuccess=()=>{const t=n.result;s?t.close():(t.onversionchange=this._onversionchange.bind(this),e(t))}}),this}async getKey(e,t){return(await this.getAllKeys(e,t,1))[0]}async getAll(e,t,s){return await this.getAllMatching(e,{query:t,count:s})}async getAllKeys(e,t,s){return(await this.getAllMatching(e,{query:t,count:s,includeKeys:!0})).map(e=>e.key)}async getAllMatching(e,{index:t,query:s=null,direction:n="next",count:a,includeKeys:i=!1}={}){return await this.transaction([e],"readonly",(r,c)=>{const o=r.objectStore(e),h=t?o.index(t):o,u=[],l=h.openCursor(s,n);l.onsuccess=()=>{const e=l.result;e?(u.push(i?e:e.value),a&&u.length>=a?c(u):e.continue()):c(u)}})}async transaction(e,t,s){return await this.open(),await new Promise((n,a)=>{const i=this._db.transaction(e,t);i.onabort=()=>a(i.error),i.oncomplete=()=>n(),s(i,e=>n(e))})}async _call(e,t,s,...n){return await this.transaction([t],s,(s,a)=>{const i=s.objectStore(t),r=i[e].apply(i,n);r.onsuccess=()=>a(r.result)})}close(){this._db&&(this._db.close(),this._db=null)}}n.prototype.OPEN_TIMEOUT=2e3;const a={readonly:["get","count","getKey","getAll","getAllKeys"],readwrite:["add","put","clear","delete"]};for(const[e,t]of Object.entries(a))for(const s of t)s in IDBObjectStore.prototype&&(n.prototype[s]=async function(t,...n){return await this._call(s,t,e,...n)});try{self["workbox:expiration:5.1.4"]&&_()}catch(e){}const i=e=>{const t=new URL(e,location.href);return t.hash="",t.href};class r{constructor(e){this._cacheName=e,this._db=new n("workbox-expiration",1,{onupgradeneeded:e=>this._handleUpgrade(e)})}_handleUpgrade(e){const t=e.target.result.createObjectStore("cache-entries",{keyPath:"id"});t.createIndex("cacheName","cacheName",{unique:!1}),t.createIndex("timestamp","timestamp",{unique:!1}),(async e=>{await new Promise((t,s)=>{const n=indexedDB.deleteDatabase(e);n.onerror=()=>{s(n.error)},n.onblocked=()=>{s(new Error("Delete blocked"))},n.onsuccess=()=>{t()}})})(this._cacheName)}async setTimestamp(e,t){const s={url:e=i(e),timestamp:t,cacheName:this._cacheName,id:this._getId(e)};await this._db.put("cache-entries",s)}async getTimestamp(e){return(await this._db.get("cache-entries",this._getId(e))).timestamp}async expireEntries(e,t){const s=await this._db.transaction("cache-entries","readwrite",(s,n)=>{const a=s.objectStore("cache-entries").index("timestamp").openCursor(null,"prev"),i=[];let r=0;a.onsuccess=()=>{const s=a.result;if(s){const n=s.value;n.cacheName===this._cacheName&&(e&&n.timestamp<e||t&&r>=t?i.push(s.value):r++),s.continue()}else n(i)}}),n=[];for(const e of s)await this._db.delete("cache-entries",e.id),n.push(e.url);return n}_getId(e){return this._cacheName+"|"+i(e)}}class c{constructor(e,t={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=t.maxEntries,this._maxAgeSeconds=t.maxAgeSeconds,this._cacheName=e,this._timestampModel=new r(e)}async expireEntries(){if(this._isRunning)return void(this._rerunRequested=!0);this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-1e3*this._maxAgeSeconds:0,t=await this._timestampModel.expireEntries(e,this._maxEntries),n=await self.caches.open(this._cacheName);for(const e of t)await n.delete(e);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,s(this.expireEntries()))}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._maxAgeSeconds){return await this._timestampModel.getTimestamp(e)<Date.now()-1e3*this._maxAgeSeconds}return!1}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(1/0)}}const o={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},h=e=>[o.prefix,e,o.suffix].filter(e=>e&&e.length>0).join("-"),u=e=>{(e=>{for(const t of Object.keys(o))e(t)})(t=>{"string"==typeof e[t]&&(o[t]=e[t])})},l=e=>e||h(o.precache),d=e=>e||h(o.runtime),p=new Set;const f=(e,t)=>e.filter(e=>t in e),m=async({request:e,mode:t,plugins:s=[]})=>{const n=f(s,"cacheKeyWillBeUsed");let a=e;for(const e of n)a=await e.cacheKeyWillBeUsed.call(e,{mode:t,request:a}),"string"==typeof a&&(a=new Request(a));return a},g=async({cacheName:e,request:t,event:s,matchOptions:n,plugins:a=[]})=>{const i=await self.caches.open(e),r=await m({plugins:a,request:t,mode:"read"});let c=await i.match(r,n);for(const t of a)if("cachedResponseWillBeUsed"in t){const a=t.cachedResponseWillBeUsed;c=await a.call(t,{cacheName:e,event:s,matchOptions:n,cachedResponse:c,request:r})}return c},w=async({cacheName:e,request:s,response:n,event:a,plugins:i=[],matchOptions:r})=>{const c=await m({plugins:i,request:s,mode:"write"});if(!n)throw new t("cache-put-with-no-response",{url:(o=c.url,new URL(String(o),location.href).href.replace(new RegExp("^"+location.origin),""))});var o;const h=await(async({request:e,response:t,event:s,plugins:n=[]})=>{let a=t,i=!1;for(const t of n)if("cacheWillUpdate"in t){i=!0;const n=t.cacheWillUpdate;if(a=await n.call(t,{request:e,response:a,event:s}),!a)break}return i||(a=a&&200===a.status?a:void 0),a||null})({event:a,plugins:i,response:n,request:c});if(!h)return;const u=await self.caches.open(e),l=f(i,"cacheDidUpdate"),d=l.length>0?await g({cacheName:e,matchOptions:r,request:c}):null;try{await u.put(c,h)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of p)await e()}(),e}for(const t of l)await t.cacheDidUpdate.call(t,{cacheName:e,event:a,oldResponse:d,newResponse:h,request:c})},y=g;let q;const v=async({request:e,fetchOptions:s,event:n,plugins:a=[]})=>{if("string"==typeof e&&(e=new Request(e)),n instanceof FetchEvent&&n.preloadResponse){const e=await n.preloadResponse;if(e)return e}const i=f(a,"fetchDidFail"),r=i.length>0?e.clone():null;try{for(const t of a)if("requestWillFetch"in t){const s=t.requestWillFetch,a=e.clone();e=await s.call(t,{request:a,event:n})}}catch(e){throw new t("plugin-error-request-will-fetch",{thrownError:e})}const c=e.clone();try{let t;t="navigate"===e.mode?await fetch(e):await fetch(e,s);for(const e of a)"fetchDidSucceed"in e&&(t=await e.fetchDidSucceed.call(e,{event:n,request:c,response:t}));return t}catch(e){for(const t of i)await t.fetchDidFail.call(t,{error:e,event:n,originalRequest:r.clone(),request:c.clone()});throw e}};async function R(e,t){const s=e.clone(),n={headers:new Headers(s.headers),status:s.status,statusText:s.statusText},a=t?t(n):n,i=function(){if(void 0===q){const e=new Response("");if("body"in e)try{new Response(e.body),q=!0}catch(e){q=!1}q=!1}return q}()?s.body:await s.blob();return new Response(i,a)}try{self["workbox:precaching:5.1.4"]&&_()}catch(e){}const x=[],N={get:()=>x,add(e){x.push(...e)}};function U(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:n}=e;if(!n)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(n,location.href);return{cacheKey:e.href,url:e.href}}const a=new URL(n,location.href),i=new URL(n,location.href);return a.searchParams.set("__WB_REVISION__",s),{cacheKey:a.href,url:i.href}}class T{constructor(e){this._cacheName=l(e),this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map}addToCacheList(e){const s=[];for(const n of e){"string"==typeof n?s.push(n):n&&void 0===n.revision&&s.push(n.url);const{cacheKey:e,url:a}=U(n),i="string"!=typeof n&&n.revision?"reload":"default";if(this._urlsToCacheKeys.has(a)&&this._urlsToCacheKeys.get(a)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(a),secondEntry:e});if("string"!=typeof n&&n.integrity){if(this._cacheKeysToIntegrities.has(e)&&this._cacheKeysToIntegrities.get(e)!==n.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:a});this._cacheKeysToIntegrities.set(e,n.integrity)}if(this._urlsToCacheKeys.set(a,e),this._urlsToCacheModes.set(a,i),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}async install({event:e,plugins:t}={}){const s=[],n=[],a=await self.caches.open(this._cacheName),i=await a.keys(),r=new Set(i.map(e=>e.url));for(const[e,t]of this._urlsToCacheKeys)r.has(t)?n.push(e):s.push({cacheKey:t,url:e});const c=s.map(({cacheKey:s,url:n})=>{const a=this._cacheKeysToIntegrities.get(s),i=this._urlsToCacheModes.get(n);return this._addURLToCache({cacheKey:s,cacheMode:i,event:e,integrity:a,plugins:t,url:n})});await Promise.all(c);return{updatedURLs:s.map(e=>e.url),notUpdatedURLs:n}}async activate(){const e=await self.caches.open(this._cacheName),t=await e.keys(),s=new Set(this._urlsToCacheKeys.values()),n=[];for(const a of t)s.has(a.url)||(await e.delete(a),n.push(a.url));return{deletedURLs:n}}async _addURLToCache({cacheKey:e,url:s,cacheMode:n,event:a,plugins:i,integrity:r}){const c=new Request(s,{integrity:r,cache:n,credentials:"same-origin"});let o,h=await v({event:a,plugins:i,request:c});for(const e of i||[])"cacheWillUpdate"in e&&(o=e);if(!(o?await o.cacheWillUpdate({event:a,request:c,response:h}):h.status<400))throw new t("bad-precaching-response",{url:s,status:h.status});h.redirected&&(h=await R(h)),await w({event:a,plugins:i,response:h,request:e===s?c:new Request(e),cacheName:this._cacheName,matchOptions:{ignoreSearch:!0}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this._cacheName)).match(s)}}createHandler(e=!0){return async({request:s})=>{try{const e=await this.matchPrecache(s);if(e)return e;throw new t("missing-precache-entry",{cacheName:this._cacheName,url:s instanceof Request?s.url:s})}catch(t){if(e)return fetch(s);throw t}}}createHandlerBoundToURL(e,s=!0){if(!this.getCacheKeyForURL(e))throw new t("non-precached-url",{url:e});const n=this.createHandler(s),a=new Request(e);return()=>n({request:a})}}let b;const L=()=>(b||(b=new T),b);const E=(e,t)=>{const s=L().getURLsToCacheKeys();for(const n of function*(e,{ignoreURLParametersMatching:t,directoryIndex:s,cleanURLs:n,urlManipulation:a}={}){const i=new URL(e,location.href);i.hash="",yield i.href;const r=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some(e=>e.test(s))&&e.searchParams.delete(s);return e}(i,t);if(yield r.href,s&&r.pathname.endsWith("/")){const e=new URL(r.href);e.pathname+=s,yield e.href}if(n){const e=new URL(r.href);e.pathname+=".html",yield e.href}if(a){const e=a({url:i});for(const t of e)yield t.href}}(e,t)){const e=s.get(n);if(e)return e}};let O=!1;function C(e){O||((({ignoreURLParametersMatching:e=[/^utm_/],directoryIndex:t="index.html",cleanURLs:s=!0,urlManipulation:n}={})=>{const a=l();self.addEventListener("fetch",i=>{const r=E(i.request.url,{cleanURLs:s,directoryIndex:t,ignoreURLParametersMatching:e,urlManipulation:n});if(!r)return;let c=self.caches.open(a).then(e=>e.match(r)).then(e=>e||fetch(r));i.respondWith(c)})})(e),O=!0)}const K=e=>{const t=L(),s=N.get();e.waitUntil(t.install({event:e,plugins:s}).catch(e=>{throw e}))},M=e=>{const t=L();e.waitUntil(t.activate())};try{self["workbox:strategies:5.1.4"]&&_()}catch(e){}class k{constructor(e={}){this._cacheName=d(e.cacheName),this._plugins=e.plugins||[],this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:s}){"string"==typeof s&&(s=new Request(s));let n,a=await y({cacheName:this._cacheName,request:s,event:e,matchOptions:this._matchOptions,plugins:this._plugins});if(!a)try{a=await this._getFromNetwork(s,e)}catch(e){n=e}if(!a)throw new t("no-response",{url:s.url,error:n});return a}async _getFromNetwork(e,t){const s=await v({request:e,event:t,fetchOptions:this._fetchOptions,plugins:this._plugins}),n=s.clone(),a=w({cacheName:this._cacheName,request:e,response:n,event:t,plugins:this._plugins});if(t)try{t.waitUntil(a)}catch(e){}return s}}const S={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};class A{constructor(e={}){if(this._cacheName=d(e.cacheName),this._plugins=e.plugins||[],e.plugins){const t=e.plugins.some(e=>!!e.cacheWillUpdate);this._plugins=t?e.plugins:[S,...e.plugins]}else this._plugins=[S];this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:s}){"string"==typeof s&&(s=new Request(s));const n=this._getFromNetwork({request:s,event:e});let a,i=await y({cacheName:this._cacheName,request:s,event:e,matchOptions:this._matchOptions,plugins:this._plugins});if(i){if(e)try{e.waitUntil(n)}catch(a){}}else try{i=await n}catch(e){a=e}if(!i)throw new t("no-response",{url:s.url,error:a});return i}async _getFromNetwork({request:e,event:t}){const s=await v({request:e,event:t,fetchOptions:this._fetchOptions,plugins:this._plugins}),n=w({cacheName:this._cacheName,request:e,response:s.clone(),event:t,plugins:this._plugins});if(t)try{t.waitUntil(n)}catch(e){}return s}}try{self["workbox:routing:5.1.4"]&&_()}catch(e){}const P=e=>e&&"object"==typeof e?e:{handle:e};class D{constructor(e,t,s="GET"){this.handler=P(t),this.match=e,this.method=s}}class I extends D{constructor(e,t,s){super(({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)},t,s)}}class W{constructor(){this._routes=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map(e=>{"string"==typeof e&&(e=[e]);const t=new Request(...e);return this.handleRequest({request:t})}));e.waitUntil(s),e.ports&&e.ports[0]&&s.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const{params:n,route:a}=this.findMatchingRoute({url:s,request:e,event:t});let i,r=a&&a.handler;if(!r&&this._defaultHandler&&(r=this._defaultHandler),r){try{i=r.handle({url:s,request:e,event:t,params:n})}catch(e){i=Promise.reject(e)}return i instanceof Promise&&this._catchHandler&&(i=i.catch(n=>this._catchHandler.handle({url:s,request:e,event:t}))),i}}findMatchingRoute({url:e,request:t,event:s}){const n=this._routes.get(t.method)||[];for(const a of n){let n;const i=a.match({url:e,request:t,event:s});if(i)return n=i,(Array.isArray(i)&&0===i.length||i.constructor===Object&&0===Object.keys(i).length||"boolean"==typeof i)&&(n=void 0),{route:a,params:n}}return{}}setDefaultHandler(e){this._defaultHandler=P(e)}setCatchHandler(e){this._catchHandler=P(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this._routes.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this._routes.get(e.method).splice(s,1)}}let F;const H=()=>(F||(F=new W,F.addFetchListener(),F.addCacheListener()),F);function j(e,s,n){let a;if("string"==typeof e){const t=new URL(e,location.href);a=new D(({url:e})=>e.href===t.href,s,n)}else if(e instanceof RegExp)a=new I(e,s,n);else if("function"==typeof e)a=new D(e,s,n);else{if(!(e instanceof D))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});a=e}return H().registerRoute(a),a}var B,Q,G;u({prefix:"edelweiss-app",suffix:"v1",precache:"precache",runtime:"runtime"}),function(e){L().addToCacheList(e),e.length>0&&(self.addEventListener("install",K),self.addEventListener("activate",M))}([{"revision":"3a77ef764c49e254a692235445941671","url":"build/index.css"},{"revision":"38f1233f88f9b97fd6448dbebd6dca2c","url":"build/index.js"},{"revision":"1510279ca4b36bf8aab8fbd74955a832","url":"favicon.ico"},{"revision":"593ca238c8f6609ae2980b855ebeeb18","url":"icons/pwa-192x192.png"},{"revision":"8c1a59ec183c6c413313484cb2e05b72","url":"icons/pwa-512x512.png"},{"revision":"92facfa5d69f30a7e910301ab9d8d4d8","url":"index.html"},{"revision":"4ecfcdf0b63f915866f33036917c1536","url":"manifest.json"},{"revision":"ba9ff57f98bb924e968828bdc78bc7fe","url":"robots.txt"},{"revision":"15ecd3a4bd1c11961e412383d3777b32","url":"service_worker.js"},{"revision":"c8b458939d4106099ec316c661a7652c","url":"styles/atom-one-dark.css"},{"revision":"0d923c9a6a31a504ed241fa3e10653f7","url":"styles/atom-one-light.css"}]),C(B),j(({request:e})=>"style"===e.destination||"script"===e.destination,new A({cacheName:"css-cache"})),j(({request:e})=>"image"===e.destination||"font"===e.destination,new k({cacheName:"image-font-cache",plugins:[new class{constructor(e={}){var t;this.cachedResponseWillBeUsed=async({event:e,request:t,cacheName:n,cachedResponse:a})=>{if(!a)return null;const i=this._isResponseDateFresh(a),r=this._getCacheExpiration(n);s(r.expireEntries());const c=r.updateTimestamp(t.url);if(e)try{e.waitUntil(c)}catch(e){}return i?a:null},this.cacheDidUpdate=async({cacheName:e,request:t})=>{const s=this._getCacheExpiration(e);await s.updateTimestamp(t.url),await s.expireEntries()},this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&(t=()=>this.deleteCacheAndMetadata(),p.add(t))}_getCacheExpiration(e){if(e===d())throw new t("expire-custom-caches-only");let s=this._cacheExpirations.get(e);return s||(s=new c(e,this._config),this._cacheExpirations.set(e,s)),s}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const t=this._getDateHeaderTimestamp(e);if(null===t)return!0;return t>=Date.now()-1e3*this._maxAgeSeconds}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const t=e.headers.get("date"),s=new Date(t).getTime();return isNaN(s)?null:s}async deleteCacheAndMetadata(){for(const[e,t]of this._cacheExpirations)await self.caches.delete(e),await t.delete();this._cacheExpirations=new Map}}({maxEntries:30,maxAgeSeconds:604800})]})),j(({request:e})=>-1!==e.url.search("/api"),new class{constructor(e={}){if(this._cacheName=d(e.cacheName),e.plugins){const t=e.plugins.some(e=>!!e.cacheWillUpdate);this._plugins=t?e.plugins:[S,...e.plugins]}else this._plugins=[S];this._networkTimeoutSeconds=e.networkTimeoutSeconds||0,this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:s}){const n=[];"string"==typeof s&&(s=new Request(s));const a=[];let i;if(this._networkTimeoutSeconds){const{id:t,promise:r}=this._getTimeoutPromise({request:s,event:e,logs:n});i=t,a.push(r)}const r=this._getNetworkPromise({timeoutId:i,request:s,event:e,logs:n});a.push(r);let c=await Promise.race(a);if(c||(c=await r),!c)throw new t("no-response",{url:s.url});return c}_getTimeoutPromise({request:e,logs:t,event:s}){let n;return{promise:new Promise(t=>{n=setTimeout(async()=>{t(await this._respondFromCache({request:e,event:s}))},1e3*this._networkTimeoutSeconds)}),id:n}}async _getNetworkPromise({timeoutId:e,request:t,logs:s,event:n}){let a,i;try{i=await v({request:t,event:n,fetchOptions:this._fetchOptions,plugins:this._plugins})}catch(e){a=e}if(e&&clearTimeout(e),a||!i)i=await this._respondFromCache({request:t,event:n});else{const e=i.clone(),s=w({cacheName:this._cacheName,request:t,response:e,event:n,plugins:this._plugins});if(n)try{n.waitUntil(s)}catch(e){}}return i}_respondFromCache({event:e,request:t}){return y({cacheName:this._cacheName,request:t,event:e,matchOptions:this._matchOptions,plugins:this._plugins})}}({cacheName:"api-cache"})),j("/manifest.json",new k({cacheName:"manifest-cache"})),j(new class extends D{constructor(e,{allowlist:t=[/./],denylist:s=[]}={}){super(e=>this._match(e),e),this._allowlist=t,this._denylist=s}_match({url:e,request:t}){if(t&&"navigate"!==t.mode)return!1;const s=e.pathname+e.search;for(const e of this._denylist)if(e.test(s))return!1;return!!this._allowlist.some(e=>e.test(s))}}((Q="/index.html",L().createHandlerBoundToURL(Q)))),G=new A,H().setDefaultHandler(G);
