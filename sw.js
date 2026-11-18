// Service worker do Meu Organizador: faz o app abrir sem internet.
// Ao mudar index.html, manifest.json ou os ícones, aumente o número da VERSAO.
const VERSAO = 'v1';
const CACHE = 'meu-organizador-' + VERSAO;
const FONTES = 'meu-organizador-fontes';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FONTES).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // envios para a planilha passam direto
  const url = new URL(req.url);

  // Fontes do Google: guarda a primeira cópia e reutiliza (sem internet, usa a guardada).
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTES).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      c.put(req, res.clone());
      return res;
    }).catch(() => new Response('', { status: 504 })))));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Arquivos do app: responde na hora com a cópia guardada e atualiza em segundo plano.
  const chave = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(c => c.match(chave, { ignoreSearch: req.mode === 'navigate' }).then(hit => {
    const rede = fetch(req).then(res => {
      if (res.ok) c.put(chave, res.clone());
      return res;
    }).catch(() => hit);
    if (hit) { e.waitUntil(rede); return hit; }
    return rede;
  })));
});
