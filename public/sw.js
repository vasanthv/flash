/**
 * Flash Service worker
 */

const currentCacheName = "flash-v-~1.0.7";

self.addEventListener("install", function(e) {
	console.log("Install event triggered. New updates available.");
	const filesToCache = [
		"/",
		"/manifest.json",
		"/style.css",
		"/vue.global.prod.js",
		"/axios.min.js",
		"/script.js",
		"loader.svg",
	];

	// Deleting the previous version of cache
	e.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter((cacheName) => cacheName != currentCacheName).map((cacheName) => caches.delete(cacheName))
			);
		})
	);

	// add the files to cache
	e.waitUntil(
		caches.open(currentCacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.match(event.request).then(function(cache) {
			return cache || fetch(event.request);
		})
	);
});
