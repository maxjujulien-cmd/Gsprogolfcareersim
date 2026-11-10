// Ouvre la page construite dans Chromium et vérifie que l'application démarre sans erreur JavaScript.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build, STANDALONE_NAME } from '../tools/build.mjs';
import { ROOT } from '../tools/lib.mjs';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { }

test('l’application démarre sans erreur (artifact et fichier autonome, téléphone et ordinateur)', { skip: !chromium && 'Playwright non installé' }, async () => {
  const dir = path.join(ROOT, 'dist');
  build(dir);
  const server = http.createServer((req, res) => {
    const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/\/$/, '/index.html')));
    if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
    fs.createReadStream(f).pipe(res);
  }).listen(0);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    const cases = [
      { url, viewport: { width: 390, height: 844 } },
      { url, viewport: { width: 1440, height: 900 } },
      { url: 'file://' + path.join(dir, STANDALONE_NAME), viewport: { width: 1440, height: 900 } },
    ];
    for (const { url, viewport } of cases) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('#app')?.children.length > 0, null, { timeout: 30000 });
      const text = await page.locator('#app').innerText();
      assert.ok(text.trim().length > 20, 'l’écran d’accueil affiche du contenu');
      assert.deepEqual(errors, [], 'aucune erreur JavaScript : ' + url);
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
});
