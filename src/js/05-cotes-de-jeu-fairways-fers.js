/* ============ COTES DE JEU (v220) : Fairways, Fers (GIR), Putting ============
   Chaque golfeur a trois cotes de 1 à 5 (3 = neutre), jugées PAR RAPPORT À SON NIVEAU : 50 % de 3, 20 % de 2 et de 4, 5 % de 1 et de 5.
   Effet sur la ronde, d'un 5 par rapport à un 3 : Fairways −0,7, Fers −1,0, Putting −0,8 coup (un 4 : la moitié ; 2 et 1 : l'inverse).
   Les cotes bougent un peu chaque saison (les jeunes progressent, les vétérans reculent). g.sk = [fw, gir, putt] ; g.skh = [[saison, k, de, à]]
   Statistiques : le score de chaque trou (tiré par le moteur) est découpé en fairway touché, coups jusqu'au vert et putts,
   selon le niveau du golfeur et ses cotes ; le total donne toujours exactement le score. Calibré par prototype (v220). */
const SK_K = ['fw', 'gir', 'putt'], SK_W = [0.7, 1.0, 0.8], SK_DIST = [5, 20, 50, 20, 5];
/* v223 : niveau du circuit choisi par le joueur (coups ajoutés à chaque ronde de tous les golfeurs IA ; 0 = circuit de référence) */
/* Calibration (v423, 23 novembre 2026 : 2 mondes de 12 saisons par valeur, outil tools/mesure/calibrer-defis.cjs ; avant : v223) : selon les
   coups ajoutés D, index du golfeur repère de chaque défi (aspirant = 4e centile de sa ligue, établi = 55e centile)
   et estimations par ligue (gagnant, coupure, ronde moyenne). Format 2 rondes ; ON = format d'une ronde (gagnant, ligne de paye). */
const LVL = {
  D: [-6, 0, 6, 12, 20, 30],
  ref: { l1c: [-8.3, -2.2, 3, 8, 14.7, 22.9], l1e: [-4.9, 0.8, 5.9, 11, 18.2, 26.9], l2c: [-4.6, 1.3, 6.4, 11.3, 18.2, 27], l2e: [-2.4, 3.2, 8.5, 13.9, 21.2, 30.1], l3e: [0.5, 5.9, 11, 16.2, 23.6, 33], l4e: [4.1, 9.1, 14.6, 19.5, 27.2, 36.6] },
  win: [[-21.71, -8.95, 2.92, 13.93, 28.78, 48.89], [-14.76, -2.08, 8.25, 19.95, 34.42, 55.24], [-9.69, 2.77, 13.11, 24.1, 39.51, 60.3], [-3.9, 8.1, 18.68, 29.89, 45.75, 67.11]],
  cut: [[-3.19, 3.53, 9.68, 16.46, 24.5, 35.13], [-0.61, 6.12, 12.3, 19.04, 26.79, 37.7], [1.98, 8.8, 14.64, 21.17, 29.2, 39.99], [5.31, 12.18, 18.67, 25.35, 33.82, 44.5]],
  rnd: [[-3.29, 3.51, 9.61, 16.18, 24.23, 34.75], [-0.06, 6.78, 12.86, 19.5, 27.34, 38.06], [2.97, 9.96, 15.78, 22.28, 30.41, 41.03], [6.48, 13.18, 19.18, 25.49, 33.67, 44.34]],
  one: { D: [-6, 0, 12, 30], win: [[-12.74, -5.94, 4.6, 20.83], [-9.41, -3.38, 6.74, 23.7], [-6.92, -1.46, 8.92, 25.37], [-4.07, 1.21, 11.68, 28.9]], cut: [[-2.98, 3.4, 16.44, 35.18], [-0.39, 5.87, 18.81, 37.38], [2, 8.33, 21.27, 39.33], [5.45, 12.07, 25.2, 43.6]] }
};
const LVL_K = [['l1c', 'L1 · Aspirant chaque année'], ['l1e', 'L1 · Joueur établi'], ['l2c', 'L2 · Aspirant'], ['l2e', 'L2 · Joueur établi'], ['l3e', 'L3 · Joueur établi'], ['l4e', 'L4 · Joueur établi']];
function lvlInterp(xs, ys, x) { let i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; const t = (x - xs[i]) / (xs[i + 1] - xs[i]); return ys[i] + t * (ys[i + 1] - ys[i]); }
/* coups à ajouter pour que le repère choisi ait l'index h (bornés de −8 à +40) */
function lvlDelta(h, k) { if (h == null || isNaN(h) || !LVL.ref[k]) return 0; return clamp(Math.round(lvlInterp(LVL.ref[k], LVL.D, h) * 10) / 10, -8, 40); }
function lvlEst(d, one) { const f = a => lvlInterp(LVL.D, a, d); const O = one ? LVL.one : null; return [0, 1, 2, 3].map(l => ({ win: O ? lvlInterp(O.D, O.win[l], d) : f(LVL.win[l]), cut: O ? lvlInterp(O.D, O.cut[l], d) : f(LVL.cut[l]), rnd: f(LVL.rnd[l]) })); }
function lvlBoxHTML() {
  const nf = VIEW.nf || {}, k = VIEW.lvlk || 'l2c', hraw = nf.hc != null ? nf.hc : '', h = hraw === '' ? null : parseFloat(String(hraw).replace(',', '.')), d = h == null || isNaN(h) ? 0 : lvlDelta(h, k), one = VIEW.fmt === 1 || VIEW.mode === 'duo';
  const est = lvlEst(d, one), f1 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (LANG === 'en' ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(1).replace('.', ',')), fmtR = v => fmt(Math.round(v));
  let x = '<label style="margin-top:14px">Ton défi</label><div class="row lvlrow"><div style="flex:0 0 130px"><label for="nhc" style="margin-top:0;font-size:15px">Ton handicap</label><input type="number" id="nhc" data-c="nhc" step="0.1" min="-10" max="54" inputmode="decimal" placeholder="ex. 8,5" value="' + esc(hraw) + '"></div><div class="small mute" style="align-self:flex-end;padding-bottom:6px">Un handicap « plus » s’écrit en négatif (ex. −1,5).</div></div>';
  x += chipRow(LVL_K, k, 'lvlk');
  if (VIEW.mode === 'sim') x += '<p class="small mute" style="margin:4px 0 0">En mode simul\u00e9, le handicap et le d\u00e9fi servent seulement \u00e0 r\u00e9gler le niveau du circuit (les adversaires). Ton golfeur garde le talent et le potentiel que tu choisis ensuite.</p>';
  return x + '<div id="lvlest">' + lvlEstHTML() + '</div>';
}
function lvlEstHTML() {
  const nf = VIEW.nf || {}, k = VIEW.lvlk || 'l2c', hraw = nf.hc != null ? nf.hc : '', h = hraw === '' ? null : parseFloat(String(hraw).replace(',', '.')), d = h == null || isNaN(h) ? 0 : lvlDelta(h, k), one = VIEW.fmt === 1 || VIEW.mode === 'duo';
  const est = lvlEst(d, one), f1 = v => (v > 0 ? '+' : v < 0 ? '\u2212' : '') + (LANG === 'en' ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(1).replace('.', ',')), fmtR = v => fmt(Math.round(v));
  let x = '<div class="lvlbox"><p class="small" style="margin:0 0 6px">' + (h == null || isNaN(h) ? 'Entre ton handicap pour ajuster le circuit à ton jeu. Sans handicap : circuit de référence.' : '<b>' + (d === 0 ? 'Circuit de référence' : f1(d) + ' coup' + (Math.abs(d) >= 2 ? 's' : '') + ' par ronde') + '</b> pour les golfeurs IA : avec ton index de ' + fmtHI(h) + ', tu seras au niveau « ' + LVL_K.find(z => z[0] === k)[1] + ' ».') + '</p>' +
    '<table class="plain lvlt"><tr><th></th><th class="r">' + (one ? 'Gagnant (1 ronde)' : 'Gagnant (2 rondes)') + '</th><th class="r">' + (one ? 'Ligne de paye' : 'Coupure') + '</th><th class="r">Ronde moyenne</th></tr>' +
    est.map((e, l) => '<tr><td>L' + (l + 1) + ' \u00b7 ' + LEAGUE_SHORT[l] + '</td><td class="r"><b>' + fmtR(e.win) + '</b></td><td class="r">' + fmtR(e.cut) + '</td><td class="r">' + fmtR(e.rnd) + '</td></tr>').join('') + '</table><p class="small mute" style="margin:6px 0 0">Estimations moyennes, selon le par : chaque tournoi varie. Ce réglage se choisit à la création seulement.</p></div>';
  return x;
}
/* v296 : niveau du circuit ajustable en cours de carrière (réglages déverrouillés ou mode commissaire).
   S.cfg.lvl = coups ajoutés à chaque ronde des adversaires (plus haut = adversaires moins forts). S.cfg.lvl0 garde la valeur de départ. */
const LVL_STEP = 0.5;
function lvlCareerHTML() {
  if (!S || !S.cfg || S.duo) return '';
  const d = +S.cfg.lvl || 0, lk = settingsLocked(), d0 = S.cfg.lvl0 != null ? +S.cfg.lvl0 : d;
  const f1 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (LANG === 'en' ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(1).replace('.', ','));
  const est = lvlEst(d, !!S.one), fmtR = v => fmt(Math.round(v)), me = leagueOf(0);
  let x = '<div class="block lvlcar"><b>Niveau du circuit</b><p class="small" style="margin:4px 0 0">' +
    (S.cfg.lvlK ? '<span>' + (LVL_K.find(z => z[0] === S.cfg.lvlK) || ['', ''])[1] + '</span> · <span>handicap ' + fmtHI(S.cfg.lvlH) + '</span> · ' : '') +
    '<b>' + (d === 0 ? '<span>Circuit de référence</span>' : '<span>' + f1(d) + ' coups par ronde</span>') + '</b>' +
    (Math.abs(d - d0) > 0.05 ? ' <span class="mute">(<span>au départ :</span> <span>' + f1(d0) + '</span>)</span>' : '') + '</p>';
  if (lk) x += VIEW.confirmUnlock ? '<div style="margin-top:10px">' + lockBanner() + '</div>' : '<p class="small mute" style="margin:6px 0 0"><span>Choisi à la création de la partie.</span> <a href="#" data-a="lvlunl">Déverrouiller pour l’ajuster…</a></p>';
  else {
    x += '<p class="small mute" style="margin:6px 0 8px">Tu domines trop ? Rends les adversaires plus forts. Tu n’arrives pas à suivre ? Rends-les moins forts. Chaque clic : ' + (LANG === 'en' ? '0.5' : '0,5') + ' coup par ronde, pour tous les golfeurs IA.</p>' +
      '<div class="small" style="font-weight:700;margin:0 0 4px">Adversaires</div><div class="row lvlbtns"><button class="btn sm" data-a="lvladj" data-v="-1">▲ <span>Plus forts</span></button><button class="btn sec sm" data-a="lvladj" data-v="1">▼ <span>Moins forts</span></button></div>' +
      (Math.abs(d - d0) > 0.05 ? '<button class="btn sec sm" data-a="lvladj" data-v="0" style="margin-top:8px;width:100%">Revenir au niveau de départ</button>' : '') +
      '<table class="plain lvlt" style="margin-top:10px"><tr><th></th><th class="r">' + (S.one ? 'Gagnant (1 ronde)' : 'Gagnant (2 rondes)') + '</th><th class="r">' + (S.one ? 'Ligne de paye' : 'Coupure') + '</th><th class="r">Ronde moyenne</th></tr>' +
      est.map((e, l) => '<tr' + (l === me ? ' style="font-weight:700;background:var(--meBg)"' : '') + '><td>L' + (l + 1) + ' · ' + LEAGUE_SHORT[l] + '</td><td class="r"><b>' + fmtR(e.win) + '</b></td><td class="r">' + fmtR(e.cut) + '</td><td class="r">' + fmtR(e.rnd) + '</td></tr>').join('') +
      '</table><p class="small mute" style="margin:6px 0 0">Estimations moyennes, selon le par. Le changement s’applique dès la prochaine ronde simulée.</p>' + (canRelock() ? '<p class="small" style="margin:8px 0 0"><span class="mute">Satisfait du niveau ?</span>' + relockLink() + '</p>' : '');
  }
  return x + '</div>';
}
function lvlAdj(v) {
  if (!S || !S.cfg || settingsLocked()) return;
  const before = +S.cfg.lvl || 0; if (S.cfg.lvl0 == null) S.cfg.lvl0 = before;
  const nv = v === 0 ? +S.cfg.lvl0 : clamp(Math.round((before + v * LVL_STEP) * 10) / 10, -8, 40);
  if (Math.abs(nv - before) < 0.05) return;
  S.cfg.lvl = nv; setCfg(S.cfg);
  const f1 = z => (z > 0 ? '+' : z < 0 ? '−' : '') + Math.abs(z).toFixed(1).replace('.', ',');
  const n0 = S.news[0];
  if (n0 && n0.lvlAdj && n0.s === S.season && n0.t === S.t) n0.text = '🎚️ Niveau du circuit ajusté : ' + f1(n0.from) + ' → ' + f1(nv) + ' coups par ronde pour les adversaires.';
  else S.news.unshift({ s: S.season, t: S.t, lvlAdj: 1, from: before, text: '🎚️ Niveau du circuit ajusté : ' + f1(before) + ' → ' + f1(nv) + ' coups par ronde pour les adversaires.', l: -1, ids: [] });
  persist(); render(); toast(nv < before ? 'Adversaires plus forts' : 'Adversaires moins forts');
}
function lvlShift() { return S && S.cfg && +S.cfg.lvl ? +S.cfg.lvl : 0; }
/* v237 : le niveau du circuit s'applique aux adversaires ; ton golfeur simulé (id 0) garde son talent tel quel */
function lvlFor(g) { return g && g.id === 0 ? 0 : lvlShift(); }
function skOn() { return !(CFG.skills === 0 || CFG.skills === false); }
function skDraw() { let r = Math.random() * 100; for (let i = 0; i < 5; i++) { r -= SK_DIST[i]; if (r < 0) return i + 1; } return 3; }
function skRoll(g) { if (g) g.sk = [skDraw(), skDraw(), skDraw()]; return g; }
const skL = v => ((v || 3) - 3) / 2;
/* effet recentré sur la moyenne du circuit (S.skm) : les golfeurs qui durent ont souvent de meilleures cotes, mais le niveau global ne bouge pas */
function skMean() { if (!S || !S.G) return; const m = [0, 0, 0]; let n = 0; Object.values(S.G).forEach(g => { if (g && g.sk) { n++; g.sk.forEach((v, k) => m[k] += skL(v)); } }); S.skm = n ? m.map(v => Math.round(v / n * 1000) / 1000) : [0, 0, 0]; }
function skRT(g) { if (!g || !g.sk || !skOn()) return 0; const m = (S && S.skm) || [0, 0, 0]; return -(SK_W[0] * (skL(g.sk[0]) - m[0]) + SK_W[1] * (skL(g.sk[1]) - m[1]) + SK_W[2] * (skL(g.sk[2]) - m[2])); }
function skMigrate() { if (!S || S.skv === 1) return; Object.values(S.G).forEach(g => { if (g && !g.sk && (g.id !== 0 || S.mode === 'sim')) skRoll(g); }); S.skv = 1; skMean(); }
/* fin de saison : au plus un cran par cote ; les jeunes progressent, les vétérans reculent, rappel vers le centre */
const SKE = { u: [0.06, 0.04, 0.025, 0.015], d: [0.02, 0.03, 0.05, 0.08, 0.12], mu: [2, 2, 1, 0.8, 0], md: [0, 0.6, 1, 2, 3] };   // évolution (calibrée : la répartition reste stable)
function skSeason(g) {
  if (!g || !g.sk || (g.id === 0 && S.mode !== 'sim')) return null;
  const a = g.a || 25, up0 = a <= 25 ? SKE.u[0] : a <= 29 ? SKE.u[1] : a <= 33 ? SKE.u[2] : SKE.u[3], dn0 = a <= 25 ? SKE.d[0] : a <= 29 ? SKE.d[1] : a <= 33 ? SKE.d[2] : a <= 37 ? SKE.d[3] : SKE.d[4], out = [];
  g.sk.forEach((v, k) => {
    const up = up0 * SKE.mu[v - 1], dn = dn0 * SKE.md[v - 1], r = Math.random();
    const nv = r < up ? v + 1 : r < up + dn ? v - 1 : v;
    if (nv !== v) { g.sk[k] = nv; g.skh = g.skh || []; g.skh.push([S.season, k, v, nv]); if (g.skh.length > 30) g.skh.shift(); out.push({ k, from: v, to: nv }); }
  });
  return out.length ? out : null;
}
/* découpe d'un trou : [fairway (1/0, null sur un par 3), vert en régulation (bool), putts] ; x = score attendu du golfeur (coups au-dessus du par) */
const SKC = (x, a, b) => Math.max(a, Math.min(b, x));
function skHole(s, par, x, sk) {
  const F = skL(sk ? sk[0] : 3), Gl = skL(sk ? sk[1] : 3), P = skL(sk ? sk[2] : 3), opts = [];
  const pF = SKC(0.60 - 0.010 * x + 0.12 * F, 0.15, 0.85);
  (par === 3 ? [null] : [1, 0]).forEach(f => {
    const pf = f === null ? 1 : (f ? pF : 1 - pF);
    const pG = SKC(0.62 - 0.024 * x + 0.055 * Gl + (f === null ? -0.02 : (f ? 0.09 : -0.16)), 0.03, 0.92);
    const pE = par === 5 ? SKC(0.10 - 0.004 * x + 0.04 * Gl, 0.005, 0.25) * (f === 0 ? 0.4 : 1) : par === 4 ? 0.004 : 0;
    const q = SKC(0.80 - 0.012 * x + 0.05 * Gl, 0.45, 0.92);
    for (let u = 0; u <= 4; u++) {
      const t = s - u; if (t < 1) continue; const k = t - (par - 2); if (k < -1) continue;
      const pt = k === -1 ? pE : k === 0 ? pG * (1 - pE) : (1 - pG) * (1 - pE) * q * Math.pow(1 - q, k - 1), gir = k <= 0;
      let pu;
      if (gir) { const p1 = SKC(0.25 - 0.007 * x + 0.035 * P, 0.04, 0.5), p3 = SKC(0.035 + 0.008 * x - 0.012 * P, 0.005, 0.3); pu = [0.005, p1, Math.max(0.02, 1 - p1 - p3 - 0.005), p3, 0.01][u]; }
      else { const p0 = SKC(0.035 - 0.001 * x + 0.01 * P, 0.005, 0.08), p1 = SKC(0.45 - 0.016 * x + 0.05 * P, 0.1, 0.7), p3 = SKC(0.025 + 0.007 * x - 0.01 * P, 0.005, 0.25); pu = [p0, p1, Math.max(0.02, 1 - p0 - p1 - p3 - 0.01), p3, 0.01][u]; }
      const w = pf * pt * pu; if (w > 0) opts.push([w, f, gir, u, k]);
    }
  });
  if (!opts.length) return [par === 3 ? null : 0, false, Math.max(0, Math.min(3, s - par + 2)), 0];
  let r = Math.random() * opts.reduce((a, o) => a + o[0], 0), o = opts[opts.length - 1];
  for (const z of opts) { r -= z[0]; if (r <= 0) { o = z; break; } }
  return [o[1], o[2], o[3], skPen(o[4], o[1], x, F)];
}
/* v221 : pénalités (hors limites, eau) — seulement sur un vert manqué ; plus fréquentes hors du fairway, pour les golfeurs faibles et quand le trou dérape */
function skPen(k, f, x, F) {
  if (!(k >= 1)) return 0;
  const p = SKC((0.035 + 0.004 * x) * (f === 0 ? 1.8 : 1) * (k >= 2 ? 1.6 : 1) * (1 - 0.15 * F), 0.005, 0.6);
  if (Math.random() >= p) return 0;
  return k >= 3 && Math.random() < 0.2 ? 2 : 1;
}
/* stats d'une ronde : [fairways, verts, putts, sauvetages (vert manqué mais par ou mieux), trois-putts] */
function skRound(holes, pars, x, sk) {
  let fw = 0, gr = 0, pu = 0, sv = 0, tp = 0, pe = 0;
  for (let i = 0; i < 18; i++) { const d = skHole(holes[i], pars[i], x, sk); if (d[0]) fw++; if (d[1]) gr++; else if (holes[i] <= pars[i]) sv++; pu += d[2]; if (d[2] >= 3) tp++; pe += d[3]; }
  return [fw, gr, pu, sv, tp, pe];
}
const skEnc = r => [r[0], r[1], SKC(r[2] - 18, 0, 35), r[3], r[4]].map(v => v.toString(36)).join('');
function skDec(str, off) { const a = []; for (let i = 0; i < 5; i++) { const v = parseInt(str.charAt(off + i), 36); if (isNaN(v)) return null; a.push(v); } a[2] += 18; return a; }
/* saison d'un golfeur : g.sx[saison] = [rondes, fairways, occasions, verts, putts, sauvetages, verts manqués, trois-putts] */
function skAdd(g, s, r, fo) { if (!g) return; g.sx = g.sx || {}; const a = g.sx[s] || (g.sx[s] = [0, 0, 0, 0, 0, 0, 0, 0, 0]); a[0]++; a[1] += r[0]; a[2] += fo; a[3] += r[1]; a[4] += r[2]; a[5] += r[3]; a[6] += 18 - r[1]; a[7] += r[4]; a[8] = (a[8] || 0) + (r[5] || 0); a[9] = (a[9] || 0) + (r[5] != null ? 1 : 0); }
/* fin de tournoi : stats de chaque ronde jouée, pour chaque ligue (lg[l].sx[id] = 5 ou 10 caractères) */
/* tes rondes (mode « je joue ») : les stats que tu as notées trou par trou (v220, étape 3) */
function skMine(c, lg) { }
/* v220 : saisie facultative de tes stats (fairway sur les par 4 et 5, nombre de putts) ; le vert en régulation se déduit */
const skInOn = () => !!(S.ui && S.ui.skIn) && skOn() && S.mode !== 'sim' && !S.duo;
function skInputHTML(c, k) {
  if (S.mode === 'sim' || S.duo || !skOn()) return '';
  const par = c.pars[k];
  let h = '<label class="skin"><input type="checkbox" data-c="skin"' + (S.ui.skIn ? ' checked' : '') + '>Noter mes stats (fairway, putts, p\u00e9nalit\u00e9s)</label>';
  if (!S.ui.skIn) return h;
  h += '<div class="skbox">';
  if (par > 3) h += '<div class="skr"><span>Fairway</span>' + [[1, '\u2713 Touch\u00e9'], [0, '\u2717 Manqu\u00e9']].map(([v, t]) => '<button class="chip" data-a="skfw" data-v="' + v + '" aria-pressed="' + (VIEW.fw === v) + '">' + t + '</button>').join('') + '</div>';
  h += '<div class="skr"><span>Putts</span>' + [0, 1, 2, 3, 4].map(v => '<button class="chip" data-a="skpu" data-v="' + v + '" aria-pressed="' + (VIEW.pu === v) + '">' + v + '</button>').join('') + '</div>';
  const pe = VIEW.pe || 0;
  h += '<div class="skr skpe"><span>P\u00e9nalit\u00e9s</span>' + [0, 1, 2].map(v => '<button class="chip" data-a="skpe" data-v="' + v + '" aria-pressed="' + (pe === v) + '">' + v + '</button>').join('') + '<small class="mute">0 par d\u00e9faut</small></div>';
  const gir = VIEW.pu != null ? VIEW.val - VIEW.pu - pe <= par - 2 : null;
  h += '<p class="small mute skgir">' + (gir == null ? 'Vert en r\u00e9gulation : d\u00e9duit du score et des putts.' : gir ? '\u2713 Vert en r\u00e9gulation' : 'Vert manqu\u00e9' + (VIEW.val <= par ? ' \u00b7 sauvetage' : '')) + '</p></div>';
  return h;
}
/* tes stats d'une ronde, si tout est noté : [fairways, verts, putts, sauvetages, trois-putts] ; fo = fairways notés */
function skMyRound(holes, pst, pars) {
  if (!holes || !pst || holes.length < 18) return null;
  let fw = 0, gr = 0, pu = 0, sv = 0, tp = 0, pe = 0;
  for (let i = 0; i < 18; i++) { const e = pst[i]; if (!e || e[1] == null || (pars[i] > 3 && e[0] == null)) return null;
    if (e[0]) fw++; const g = holes[i] - e[1] - (e[2] || 0) <= pars[i] - 2; if (g) gr++; else if (holes[i] <= pars[i]) sv++; pu += e[1]; if (e[1] >= 3) tp++; pe += e[2] || 0; }
  return [fw, gr, pu, sv, tp, pe];
}
function skMine(c, lg) {
  if (S.mode === 'sim' || S.duo || c.sw) return;
  const L = lg[c.pl]; if (!L) return;
  const fo = c.pars.filter(p => p > 3).length, h0 = hcHolder(0), rs = [];
  if (c.pr1 && c.pst1) rs.push(skMyRound(c.pr1, c.pst1, c.pars));
  if (c.r === 1 && c.made && c.pst) rs.push(skMyRound(myHoles(c), c.pst, c.pars));
  else if (S.one && c.pst && !c.pst1) rs.push(skMyRound(myHoles(c), c.pst, c.pars));
  const ok = rs.filter(Boolean); if (!ok.length || !h0) return;
  L.sx = L.sx || {}; L.sx[0] = ok.map(skEnc).join(''); L.sp = L.sp || {}; L.sp[0] = ok.map(r => Math.min(35, r[5]).toString(36)).join('');
  ok.forEach(r => skAdd(h0, S.season, r, fo));
}
/* tes cotes : tes stats notées (saison en cours et précédente) comparées aux golfeurs IA de ton handicap */
function skMineRatings() {
  const h0 = hcHolder(0); if (!h0 || !h0.sx) return null;
  const a = [0, 0, 0, 0, 0, 0, 0, 0]; [S.season, S.season - 1].forEach(y => { const x = h0.sx[y]; if (x) x.forEach((v, i) => a[i] += v); });
  const me = skStat(a); if (!me || me.n < 5) return null;
  const hx = h0.hc && h0.hc.x; if (hx == null) return null;
  let peers = [];
  for (let w = 1.5; w <= 6 && peers.length < 15; w += 1.5) peers = Object.values(S.G).filter(g => g.id !== 0 && g.hc && g.hc.x != null && Math.abs(g.hc.x - hx) <= w).map(g => { const y = skSeasonOf(g); return y != null ? skStat(g.sx[y]) : null; }).filter(z => z && z.n >= 4);
  if (peers.length < 8) return null;
  const m = f => avg(peers.map(f)), cut = (d, a1, a2) => d >= a2 ? 5 : d >= a1 ? 4 : d <= -a2 ? 1 : d <= -a1 ? 2 : 3;
  return { n: me.n, r: [cut(me.fw - m(z => z.fw), 3, 9), cut(me.gir - m(z => z.gir), 2.5, 6), cut(m(z => z.pu) - me.pu, 0.4, 1.2)] };
}
function skTournament(pars, lg, s) {
  const fo = pars.filter(p => p > 3).length;
  lg.forEach(L => {
    if (!L || !L.rows || !L.h) return; L.sx = L.sx || {};
    L.rows.forEach(row => {
      const id = row[0]; if (L.sx[id] != null) return;
      const g = id === 0 ? hcHolder(0) : S.G[id], hs = L.h[id]; if (!g || !hs) return;
      if (id === 0 && S.mode !== 'sim') return;   // tes vraies rondes : seulement ce que tu as noté (voir skMine)
      const x = mu(effOverall(g)) + lvlFor(g); let str = '', sp = '';
      for (let r = 0; r * 18 + 18 <= hs.length; r++) { const h = decHoles(hs, r * 18); if (!h) break; const st = skRound(h, pars, x, g.sk); str += skEnc(st); sp += Math.min(35, st[5]).toString(36); skAdd(g, s, st, fo); }
      if (str) { L.sx[id] = str; L.sp = L.sp || {}; L.sp[id] = sp; }
    });
  });
}
const SK_NM = ['Fairways', 'Fers (GIR)', 'Putting'], SK_ICO = ['🎯', '⛳', '🕳️'], SK_LV = ['', 'Très faible', 'Faible', 'Neutre', 'Fort', 'Très fort'];
/* stats d'une saison : { n, fw %, gir %, putts/ronde, sauvetages %, trois-putts/ronde } (null sans ronde) */
function skStat(a) { if (!a || !a[0]) return null; return { n: a[0], fw: a[2] ? a[1] / a[2] * 100 : null, gir: a[3] / a[0] / 18 * 100, pu: a[4] / a[0], scr: a[6] ? a[5] / a[6] * 100 : null, tp: a[7] / a[0], pe: a[9] ? a[8] / a[9] : null }; }
/* la saison à afficher : la saison en cours dès 4 rondes, sinon la précédente */
function skSeasonOf(g) { if (!g || !g.sx) return null; const a = g.sx[S.season]; if (a && a[0] >= 4) return S.season; const b = g.sx[S.season - 1]; return b && b[0] ? S.season - 1 : a && a[0] ? S.season : null; }
const fmtPct = v => v == null ? '–' : (LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',')) + ' %';
const fmtPu = v => v == null ? '–' : (LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ','));
function skPill(k, v) { return '<span class="tal skp' + (v > 3 ? ' up' : ' dn') + '"><span class="ti">' + SK_ICO[k] + '</span><span><b>' + SK_NM[k] + '</b><small>' + SK_LV[v] + ' (' + v + '/5)</small></span><span class="lv">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= v ? 'on' : '') + '"></i>').join('') + '</span></span>'; }
/* cotes affichées seulement quand elles ne sont pas neutres */
function skBlock(id) {
  if (!skOn()) return '';
  if (id === 0 && S.mode !== 'sim') { const m = skMineRatings(); if (!m) return ''; const nz = m.r.map((v, k) => [k, v]).filter(x => x[1] !== 3); if (!nz.length) return ''; return '<div class="block talblk"><h3>Cotes de jeu</h3><div class="talrow">' + nz.map(x => skPill(x[0], x[1])).join('') + '</div><p class="small mute talnote">Selon tes stats notées (' + m.n + ' rondes), comparées aux golfeurs de ton handicap. Aucun effet sur tes scores.</p></div>'; }
  const g = S.G[id]; if (!g || !g.sk) return '';
  const nz = g.sk.map((v, k) => [k, v]).filter(x => x[1] !== 3); if (!nz.length) return '';
  return '<div class="block talblk"><h3>Cotes de jeu</h3><div class="talrow">' + nz.map(x => skPill(x[0], x[1])).join('') + '</div><p class="small mute talnote">Par rapport aux golfeurs de son niveau. Les cotes neutres (3/5) ne sont pas affichées.</p></div>';
}
/* rang d'une stat dans la ligue (saison s) */
function skRank(id, s, l, f, asc) {
  if (l < 0 || !S.L[l]) return null;
  const vals = S.L[l].map(i => { const h = i === 0 ? hcHolder(0) : S.G[i], st = h && h.sx ? skStat(h.sx[s]) : null; return st && st.n >= 4 && f(st) != null ? [i, f(st)] : null; }).filter(Boolean);
  const me = vals.find(v => v[0] === id); if (!me) return null;
  return [1 + vals.filter(v => asc ? v[1] < me[1] : v[1] > me[1]).length, vals.length];
}
function skStatsHTML(id) {
  const h = id === 0 ? hcHolder(0) : S.G[id] || (S.old && S.old[id]); if (!h || !h.sx) return '';
  const ss = Object.keys(h.sx).map(Number).filter(x => h.sx[x] && h.sx[x][0]).sort((a, b) => b - a); if (!ss.length) return '';
  const sNow = skSeasonOf(h) || ss[0], st = skStat(h.sx[sNow]), l = sNow === S.season ? leagueOf(id) : -1;
  const tile = (lab, v, f, asc) => { const rk = l >= 0 ? skRank(id, sNow, l, f, asc) : null; return '<div class="mtile"><b>' + v + '</b><span>' + lab + (rk ? ' · ' + ord(rk[0]) + ' en L' + (l + 1) : '') + '</span></div>'; };
  let x = '<h2>Statistiques de jeu</h2><p class="small mute" style="margin:-4px 0 6px">Saison ' + yr(sNow) + ' · ' + st.n + ' ronde' + (st.n > 1 ? 's' : '') + '</p><div class="mgrid mgrid3">' +
    tile('Fairways touchés', fmtPct(st.fw), z => z.fw) + tile('Verts en régulation', fmtPct(st.gir), z => z.gir) + tile('Putts par ronde', fmtPu(st.pu), z => z.pu, true) +
    tile('Sauvetages (scrambling)', fmtPct(st.scr), z => z.scr) + tile('Trois-putts par ronde', fmtPu(st.tp), z => z.tp, true) + tile('Pénalités par ronde', fmtPu(st.pe), z => z.pe, true) + '</div>';
  x += '<div class="scroll" style="margin-top:10px"><table class="plain"><tr><th>Saison</th><th class="r">Rondes</th><th class="r">Fairways</th><th class="r">GIR</th><th class="r">Putts</th><th class="r">Sauv.</th><th class="r">Pén.</th></tr>' +
    ss.map(y => { const z = skStat(h.sx[y]); return '<tr><td>' + yr(y) + '</td><td class="r">' + z.n + '</td><td class="r">' + fmtPct(z.fw) + '</td><td class="r">' + fmtPct(z.gir) + '</td><td class="r">' + fmtPu(z.pu) + '</td><td class="r">' + fmtPct(z.scr) + '</td><td class="r">' + fmtPu(z.pe) + '</td></tr>'; }).join('') + '</table></div>';
  if (h.skh && h.skh.length) x += '<p class="small mute" style="margin:6px 0 0">Cotes : ' + h.skh.slice(-6).map(e => yr(e[0]) + ' ' + SK_NM[e[1]] + ' ' + e[2] + '→' + e[3]).join(' · ') + '</p>';
  return x;
}
