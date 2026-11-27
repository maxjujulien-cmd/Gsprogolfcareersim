// v431 : le jeu est toujours en anglais, mais il est écrit en français et traduit à l'affichage.
// Ce test joue une partie (un tournoi trou par trou, une saison, l'intersaison) et visite les menus :
// il échoue si une phrase française s'affiche (les noms de golfeurs et de terrains sont ignorés).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build, STANDALONE_NAME } from '../tools/build.mjs';
import { ROOT } from '../tools/lib.mjs';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { }

/* mots qui n'existent qu'en français (pas « plus », « fin », « gains », « est » : ils existent aussi en anglais) */
const FR = /\b(le|la|les|des|du|une|avec|sans|pour|dans|aux|sont|ans|saisons?|tournois?|ligues?|coupures?|victoires?|golfeurs?|joueurs?|rondes?|trous?|meilleure?s?|aucune?|depuis|encore|leur|cette|ses|après|avant|jamais|toujours|début|classement|niveau|année|parcours|semaine|chapitre|retraite|recrues?|tu|ton|tes|vous|il|elle|qui|que|quand|où|pas)\b|[éèêàçùôîû]|\b[ldqsnjc]’\w/i;
/* exceptions acceptées (textes vérifiés à la main) */
const OK = [/^Est\. Pro$/];

test('aucun texte français ne s’affiche en anglais', { skip: !chromium && 'Playwright non installé', timeout: 600000 }, async () => {
  const dir = path.join(ROOT, 'dist');
  build(dir);
  const browser = await chromium.launch();
  const found = new Map(), errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.join(dir, STANDALONE_NAME), { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => typeof newGame === 'function' && document.querySelector('#app')?.children.length > 0, null, { timeout: 60000 });
    const grab = async where => {
      await page.waitForTimeout(150);
      const items = await page.evaluate(() => {
        const names = new Set(); try { Object.values(S.G || {}).forEach(g => { if (g && g.n) names.add(g.n); if (g && g.bio && g.bio.ct) names.add(g.bio.ct); }); Object.values(S.old || {}).forEach(g => g && g.n && names.add(g.n)); (S.courses || []).forEach(c => c && c.name && names.add(c.name)); (S.hist || []).forEach(H => { (H.t || []).forEach(t => t && t.name && names.add(t.name)); if (H.fin && H.fin.name) names.add(H.fin.name); }); try { const f = finCourse(); if (f && f.name) names.add(f.name); } catch (e) { } } catch (e) { }
        try { [...names].forEach(n => { const g = geoOf(n); if (g && g.pl) names.add(g.pl); }); } catch (e) { }
        const NM = [...names].filter(n => n.length > 2).sort((a, b) => b.length - a.length);
        const clean = t => { NM.forEach(n => { if (t.indexOf(n) >= 0) t = t.split(n).join(' '); }); return t; };
        const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); const el = n.parentElement; if (t.length < 3 || !el || el.closest('.notr,script,style,[data-a="golfer"]') || !el.getClientRects().length) continue; out.push([t, clean(t)]); }
        document.querySelectorAll('[title],[placeholder]').forEach(e => { if (e.closest('.notr')) return; ['title', 'placeholder'].forEach(a => { const v = e.getAttribute(a); if (v && v.length > 2) out.push(['@' + a + ': ' + v, clean(v)]); }); });
        return out; });
      for (const [t, c] of items) if (FR.test(c) && !OK.some(r => r.test(t))) { if (!found.has(t)) found.set(t, where); }
    };
    const visit = async (name, extra, where) => { await page.evaluate(([n, x]) => { VIEW = Object.assign({ name: n }, x || {}); render(); }, [name, extra || {}]); await grab(where || name); };
    await grab('nouvelle partie');
    /* une carrière en Ligue 2, puis un tournoi joué trou par trou */
    await page.evaluate(() => { NOSAVE = true; newGame('Test', 1, 'manual', 2000, 0, false, false); const P = S.presim; if (P) { while (P.left > 0) { presimSeason(); P.left--; if (P.w && P.n - P.left >= P.w) { worldReset(P.w); P.n -= P.w; P.w = 0; } } finishPresim(); } S.ui = S.ui || {}; S.ui.reveal = 'instant'; go('home'); });
    await grab('accueil');
    for (let k = 0; k < 12 && (await page.evaluate(() => VIEW.name)) !== 'play'; k++) { await page.evaluate(() => mgrGo()); await page.waitForTimeout(100); }
    for (let k = 0; k < 120; k++) {
      const st = await page.evaluate(() => { const ok = document.querySelector('#app [data-a="ok"]'); if (ok) { ok.click(); return 'ok'; } for (const a of ['teego', 'preall', 'teeall', 'holdgo', 'tocut', 'cutgo', 'r2go', 'next', 'cont', 'finish']) { const e = document.querySelector('#app [data-a="' + a + '"]'); if (e) { e.click(); return a; } } return 'stop'; });
      if (k % 6 === 0 || st !== 'ok') await grab('ronde (' + st + ')');
      if (st === 'stop') break;
    }
    /* la saison complète, le bilan, l'intersaison */
    /* deuxième monde : un joueur simulé (mode « simulation ») pour jouer toute la saison sans saisir de scores */
    await page.evaluate(() => { newGame('Test', 1, 'sim', 2000, 0, false, false); const P = S.presim; if (P) { while (P.left > 0) { presimSeason(); P.left--; if (P.w && P.n - P.left >= P.w) { worldReset(P.w); P.n -= P.w; P.w = 0; } } finishPresim(); }
      createPlayerGolfer({ league: 1, tierIdx: 5, potIdx: 6, n: 'Test Player', nat: 'Canada', a: 28 }); simulateSeason(); doSeasonEnd(); });
    const s = await page.evaluate(() => S.season - 1);
    const n = await page.evaluate(s => offChapters(s).length, s);
    for (let i = 0; i < n; i++) await visit('off', { s, i }, 'intersaison ' + (i + 1));
    await visit('seasonEnd', { s }); await visit('rclass', { s }); await visit('tourn', { s, t: 0, l: 1, mode: 'res' }, 'tournoi');
    for (const v of ['home', 'leagues', 'palm', 'almanac', 'golfers', 'records', 'inbox', 'courses', 'watch', 'more', 'journal']) await visit(v);
    const ids = await page.evaluate(() => { const ks = Object.keys(S.G).map(Number); return [0, ks.find(k => k && leagueOf(k) === 0), Object.keys(S.old || {}).map(Number).find(k => k)].filter(x => x != null); });
    for (const id of ids) for (const t of ['ov', 'res', 'tl', 'log', 'stats', 'riv', 'bio']) { await page.evaluate(([id, t]) => { PTAB = t; VIEW = { name: 'golfer', id }; render(); }, [id, t]); await grab('golfeur ' + id + ' / ' + t); }
  } finally { await browser.close(); }
  assert.deepEqual(errors, [], 'aucune erreur JavaScript');
  const list = [...found.entries()].map(([t, w]) => w + ' : « ' + t.slice(0, 140) + ' »');
  assert.deepEqual(list, [], 'textes en français affichés dans le jeu en anglais :\n' + list.join('\n'));
});
