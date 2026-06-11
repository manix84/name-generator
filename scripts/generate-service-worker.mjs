import { createHash } from "node:crypto";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const staticExtensions = new Set([
  ".css",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".png",
  ".txt",
  ".webmanifest",
]);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listFiles(fullPath);
      }

      if (!staticExtensions.has(path.extname(entry.name))) {
        return [];
      }

      return [fullPath];
    })
  );

  return files.flat();
}

const files = await listFiles(distDir);
const urls = files
  .map((file) => path.relative(distDir, file).replaceAll(path.sep, "/"))
  .filter((url) => url !== "sw.js")
  .sort();

const appShell = Array.from(new Set(["./", ...urls]));
const versionHash = createHash("sha256")
  .update(appShell.join("\n"))
  .digest("hex")
  .slice(0, 12);

const serviceWorker = `const CACHE_VERSION = "name-generator-${versionHash}";
const APP_SHELL = ${JSON.stringify(appShell, null, 2)};
const APP_ROOT = new URL("./", self.location.href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(APP_ROOT, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(APP_ROOT)
            .then((response) => response || caches.match(new URL("index.html", APP_ROOT)))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }

        return response;
      });
    })
  );
});
`;

await writeFile(path.join(distDir, "sw.js"), serviceWorker);
console.log(
  `Generated dist/sw.js with ${appShell.length} precached URLs (${CACHE_LABEL(versionHash)}).`
);

function CACHE_LABEL(hash) {
  return `name-generator-${hash}`;
}
