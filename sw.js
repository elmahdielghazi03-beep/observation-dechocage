// Service worker : fonctionnement hors ligne et mises à jour.
//
// ► POUR PUBLIER UNE NOUVELLE VERSION : change le numéro ci-dessous, puis remets les fichiers sur GitHub.
//   Sans changement de ce numéro, les téléphones gardent l'ancienne version.
const VERSION = "1.0.1";

// Fonctionnement :
// 1. Le téléphone vérifie sw.js à chaque ouverture de l'app (et toutes les heures si elle reste ouverte).
// 2. Si VERSION a changé, la nouvelle version est téléchargée EN ENTIER en arrière-plan, dans un cache
//    séparé. L'ancienne continue de fonctionner. Si le téléchargement échoue, rien ne change.
// 3. Un bandeau « Nouvelle version disponible — Recharger » apparaît. Recharger active la nouvelle
//    version ; sinon elle s'active à la prochaine ouverture complète de l'app.
// 4. Les dossiers patients sont dans le stockage local du navigateur, PAS dans ce cache :
//    une mise à jour ne les touche jamais.

const PREFIXE = "obs-dechocage-";
const CACHE = PREFIXE + VERSION;
const BASE = [
  "./",
  "./index.html",
  "./css/app.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];
const ENTREE = "./js/app.js"; // les modules JavaScript (moteur, écrans, configs) sont trouvés à partir d'ici

const url = (chemin, base = self.registration.scope) => new URL(chemin, base).href;

// Repère les « import … from "./fichier.js" » pour télécharger tous les modules, configs comprises
function imports(source, depuis) {
  const sansCommentaires = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const trouves = [];
  const re = /\bimport\s+(?:[^'"`;]*?\sfrom\s*)?["']([^"']+)["']|\bexport\s+[^'"`;]*?\sfrom\s*["']([^"']+)["']/g;
  for (const m of sansCommentaires.matchAll(re)) {
    const spec = m[1] || m[2];
    if (spec.startsWith(".")) trouves.push(url(spec, depuis));
  }
  return trouves;
}

async function telechargerVersion() {
  const cache = await caches.open(CACHE);
  const recuperer = async (u) => {
    const r = await fetch(new Request(u, { cache: "no-cache" }));
    if (!r.ok) throw new Error(`Téléchargement impossible : ${u} (${r.status})`);
    return r;
  };
  for (const chemin of BASE) await cache.put(url(chemin), await recuperer(url(chemin)));
  const vus = new Set();
  const aFaire = [url(ENTREE)];
  while (aFaire.length) {
    const u = aFaire.pop();
    if (vus.has(u)) continue;
    vus.add(u);
    const r = await recuperer(u);
    const texte = await r.clone().text();
    await cache.put(u, r);
    aFaire.push(...imports(texte, u));
  }
}

self.addEventListener("install", (e) => {
  // Version complète ou rien : en cas d'échec, l'ancienne version reste en place
  e.waitUntil(
    telechargerVersion().catch(async (err) => {
      await caches.delete(CACHE);
      throw err;
    }),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith(PREFIXE) && k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "activer") self.skipWaiting();
  if (d.type === "version" && e.ports && e.ports[0]) e.ports[0].postMessage(VERSION);
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const enCache = await cache.match(req, { ignoreSearch: true });
      if (enCache) return enCache;
      if (req.mode === "navigate") {
        const index = (await cache.match(url("./index.html"))) || (await cache.match(url("./")));
        if (index) return index;
      }
      try {
        const r = await fetch(req);
        if (r.ok) cache.put(req, r.clone());
        return r;
      } catch {
        return Response.error();
      }
    })(),
  );
});
