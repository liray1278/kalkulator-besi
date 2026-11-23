// Service worker: simpan file aplikasi supaya bisa dibuka tanpa internet.
// Setiap kali index.html diubah, naikkan angka VERSI (v1 -> v2 -> v3 ...).
const PREFIX = "hitung-material-";
const VERSI = "v2";
const CACHE = PREFIX + VERSI;
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

// Hapus simpanan versi lama MILIK APLIKASI INI SAJA (aplikasi lain di alamat yang sama tidak diganggu)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Ambil dari internet dulu (selalu versi terbaru); kalau offline, pakai simpanan.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith("http")) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((r) => r || (e.request.mode === "navigate" ? caches.match("./index.html") : undefined))
      )
  );
});
