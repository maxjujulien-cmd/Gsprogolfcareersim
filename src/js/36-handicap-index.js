/* ============ HANDICAP INDEX (méthode WHS de l'USGA) ============
   Chaque ronde jouée (R1, et R2 si la coupure est passée) est une ronde de 18 trous au carnet du golfeur.
   Différentiel = 113 / slope × (brut ajusté − course rating − PCC). Index = moyenne des meilleurs différentiels
   des 20 dernières rondes (barème WHS s'il y en a moins de 20), avec plafond souple (+3,0), plafond dur (+5,0)
   et réduction pour score exceptionnel. Adaptations : PCC tiré des conditions réellement simulées, « 365 jours »
   = 10 derniers tournois, plafond du double-bogey net seulement là où les cartes trou par trou existent. */
const HC_TAB = { 3: [1, -2], 4: [1, -1], 5: [1, 0], 6: [2, -1], 7: [2, 0], 8: [2, 0], 9: [3, 0], 10: [3, 0], 11: [3, 0], 12: [4, 0], 13: [4, 0], 14: [4, 0], 15: [5, 0], 16: [5, 0], 17: [6, 0], 18: [6, 0], 19: [7, 0], 20: [8, 0] };
const r10 = x => Math.round(x * 10) / 10;
function hcCalc(diffs) {            // index brut d'après le carnet (null tant qu'il y a moins de 3 rondes)
  const n = diffs.length; if (n < 3) return null;
  const [k, adj] = HC_TAB[Math.min(n, 20)];
  return Math.min(54, r10(avg(diffs.slice().sort((a, b) => a - b).slice(0, k)) + adj));
}
function hcCounted(diffs) {         // positions des différentiels retenus pour le calcul
  const n = diffs.length; if (n < 3) return [];
  return diffs.map((d, i) => [d, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, HC_TAB[Math.min(n, 20)][0]).map(x => x[1]);
}
function hcPcc(ctx, r) {
  if (!ctx) return 0;
  const v = (ctx.course || 0) + ((ctx.weather || [])[r] || 0) + ((ctx.windBump || [])[r] || 0);
  return Math.max(-1, Math.min(3, Math.round(v)));
}
function hcStrokes(ch, idx) {        // coups reçus (ou rendus, si handicap « plus ») sur un trou d'index idx
  if (ch >= 0) return Math.floor(ch / 18) + ((ch % 18) >= idx ? 1 : 0);
  const a = -ch; return -(Math.floor(a / 18) + ((a % 18) >= (19 - idx) ? 1 : 0));
}
function hcAgs(gross, holes, T, hx) {  // brut ajusté : plafond du double-bogey net (par + 5 sans index)
  if (!holes || !T.pars || holes.length !== 18 || sum(holes) !== gross) return gross;
  const ch = hx == null ? null : Math.round(hx * T.slope / 113 + (T.cr - T.par));
  let a = 0;
  for (let i = 0; i < 18; i++) a += Math.min(holes[i], ch === null ? T.pars[i] + 5 : T.pars[i] + 2 + hcStrokes(ch, (T.index && T.index[i]) || (i + 1)));
  return a;
}
function hcCap(calc, hi) {          // plafonds souple et dur par rapport au plus bas index des 10 derniers tournois
  if (calc === null) return [null, 0];
  const recent = hi.slice(-10).filter(v => v != null);
  if (!recent.length) return [calc, 0];
  const low = Math.min.apply(null, recent) / 10, d = calc - low;
  let idx = calc, cap = 0;
  if (d > 3) { idx = r10(low + 3 + 0.5 * (d - 3)); cap = 1; }
  if (idx > low + 5) { idx = r10(low + 5); cap = 2; }
  return [idx, cap];
}
/* Inscrit au carnet d'un golfeur les rondes d'un tournoi, puis met son index à jour.
   row = [id,pos,r1,r2,pts] ; hstr = cartes trou par trou (18 ou 36 caractères) si elles existent. */
function hcPost(g, row, hstr, T, pcc) {
  if (row[0] === 0 && S.mode === 'manual' && T.cr0 != null) T = Object.assign({}, T, { cr: T.cr0 });   // tes vraies rondes : la distance joue déjà dans ton score, seul le vrai course rating compte
  const hc = g.hc || (g.hc = { d: [], hi: [], x: null, cap: 0 });
  const hx = hc.x;
  [row[2], row[3]].forEach((rel, r) => {
    if (rel === null || rel === undefined) return;
    const gross = T.par + rel, holes = hstr ? decHoles(hstr, r * 18) : null;
    const ags = hcAgs(gross, holes, T, hx), p = (row[0] === 0 && S.mode === 'manual') ? 0 : pcc[r];
    const diff = r10(113 / T.slope * (ags - T.cr - p));
    hc.d.push([T.s, T.t, r, gross, ags, p, diff]);
    if (hc.d.length > 20) hc.d.shift();
    if (hx !== null && diff <= hx - 7) { const red = diff <= hx - 10 ? 2 : 1; hc.d.forEach(x => { x[6] = r10(x[6] - red); }); }   // score exceptionnel
  });
  const [idx, cap] = hcCap(hcCalc(hc.d.map(x => x[6])), hc.hi);
  hc.x = idx; hc.cap = cap; hc.hi.push(idx === null ? null : Math.round(idx * 10));   // historique complet, non plafonn\u00e9 : \u00ab Tout \u00bb doit remonter au premier tournoi de carri\u00e8re
}
/* En mode manuel, le joueur n'a pas de golfeur simulé : son carnet est rangé avec ses statistiques (S.pk). */
function hcHolder(id) { return id === 0 ? (S.G[0] || S.pk) : S.G[id]; }
function hcTournament(T, lg, skip0) {
  const dd = (T.ctx && T.ctx.distDelta) || 0; if (dd) T = Object.assign({}, T, { cr: T.cr + dd, cr0: T.cr });   // l'effet de la distance compte comme un course rating plus élevé : l'index reste juste
  const pcc = [hcPcc(T.ctx, 0), hcPcc(T.ctx, 1)];
  for (let l = 0; l < 4; l++) lg[l].rows.forEach(row => {
    if (row[0] === 0 && skip0) return;
    const g = hcHolder(row[0]); if (g) hcPost(g, row, (lg[l].h || {})[row[0]] || null, T, pcc);
  });
}
/* v247 : la classe de recrues joue chaque tournoi (deux rondes, sans coupure, sans points ni bourse) ; ses rondes comptent pour l'index */
function rcTournament(T, pars, index, ctx) {
  if (!CFG.rcOn || !S.rcl || S.rcl.s !== S.season || !T) return;
  const ids = S.rcl.ids.filter(id => S.G[id]); if (ids.length < 2) return;
  const r = simTournamentAI(MODEL, gridFor(pars), pars, ids, S.G, ctx, ids.length, index, false);
  const rows = r.rows.map(x => [x[0], x[1], x[2], x[3], 0]);
  T.rc = { rows, h: r.h, cut: null };
  let HT = { par: parTotal(pars), pars, index, cr: T.cr != null ? T.cr : parTotal(pars) - 1, slope: T.slope || 128, ctx, s: S.season, t: S.t };
  const dd = (ctx && ctx.distDelta) || 0; if (dd) HT = Object.assign({}, HT, { cr: HT.cr + dd, cr0: HT.cr });
  const pcc = [hcPcc(ctx, 0), hcPcc(ctx, 1)];
  rows.forEach(row => { const g = S.G[row[0]]; if (g) hcPost(g, row, r.h[row[0]] || null, HT, pcc); });
}
function hcRebuild() {               // recalcule tous les index à partir de l'historique conservé
  Object.values(S.G).forEach(g => { delete g.hc; }); if (S.pk) delete S.pk.hc;
  const lastRet = (S.playerCareers || []).reduce((m, c) => Math.max(m, c.s || 0), 0);   // les rondes d'une carrière terminée ne comptent pas pour le nouveau golfeur
  S.hist.forEach(H => H.t.forEach((t, i) => {
    if (!t) return;
    hcTournament({ par: t.par, pars: t.pars, index: t.index, cr: t.cr != null ? t.cr : t.par - 1, slope: t.slope || 128, ctx: t.ctx, s: H.s, t: i }, t.lg, H.s <= lastRet);
  }));
  S.hcv = 1;
}

const fmt1 = v => (v < 0 ? '\u2212' : '') + (LANG === 'en' ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(1).replace('.', ','));
const fmtHI = v => fmt1(v);   // signe tel quel : un index sous zéro s'affiche −1,4 (et non « +1,4 », notation officielle des handicaps plus)
/* Index à afficher à côté d'un nom : l'index actuel, ou celui d'après le tournoi at = [saison, tournoi] (60 derniers tournois). */
function hcAt(id, at) {
  if (!CFG.showIdx) return null;
  const g = hcHolder(id), hc = g && g.hc; if (!hc || !hc.hi.length) return null;
  if (!at) return hc.x;
  if (!S.last) return null;
  const off = (S.last.s - 1) * N_TOURN + S.last.t - ((at[0] - 1) * N_TOURN + at[1]);
  if (off < 0) return hc.x;
  const i = hc.hi.length - 1 - off; if (i < 0) return null;
  return hc.hi[i] == null ? null : hc.hi[i] / 10;
}
/* v451 : le « R » des recrues (première saison en ligue) est montré partout où le handicap l'est (demande de Max) */
const rk0 = () => S.mode !== 'sim' && S.season > 1 && leagueOf(0) >= 0 && !S.hist.some(H => H && H.s > careerStart(0) && H.s < S.season && H.end && H.end.tables && H.end.tables.some(tb => tb.some(r => r[0] === 0)));   // ton golfeur (mode manuel) : aucune saison complète en ligue
const rkTag = (id, at) => (!at || at[0] === S.season) && (id === 0 && !S.G[0] ? rk0() : typeof isRookie === 'function' && isRookie(S.G[id])) ? '<span class="rkb" title="Recrue" aria-label="Recrue">R</span>' : '';
function hxTag(id, at, cls) {
  const v = hcAt(id, at), rk = rkTag(id, at); if (v == null) return rk;
  return rk + '<span class="hx hcp' + (cls ? ' ' + cls : '') + (v < 0 ? ' pl' : '') + '" title="Handicap" aria-label="Handicap ' + fmtHI(v) + '">' + fmtHI(v) + '</span>';
}
/* Golfeurs : les meilleurs index d'une ligue, avec l'évolution sur 10 tournois */
function bestIdxHTML(l) {
  const list = S.L[l].map(id => { const g = hcHolder(id), hc = g && g.hc; if (!hc || hc.x == null) return null; const m = hc.hi.length; return { id, x: hc.x, d: m > 10 && hc.hi[m - 11] != null ? Math.round((hc.x - hc.hi[m - 11] / 10) * 10) / 10 : null }; }).filter(Boolean).sort((a, b) => a.x - b.x || a.id - b.id).slice(0, 10);
  if (!list.length) return '<p class="mute small">Les handicaps apparaissent après trois rondes.</p>';
  return '<table class="plain"><tr><th>#</th><th>Golfeur</th><th class="r">Handicap</th><th class="r">10 tournois</th></tr>' + list.map((r, i) => '<tr' + (r.id === 0 ? ' class="hin"' : '') + '><td>' + (i + 1) + '</td><td><a href="#" data-a="golfer" data-id="' + r.id + '">' + esc(nameOf(r.id)) + '</a></td><td class="r"><b>' + fmtHI(r.x) + '</b></td><td class="r small ' + (r.d === null || r.d === 0 ? 'mute' : r.d < 0 ? 'dnx' : 'upx') + '">' + (r.d === null ? '\u2014' : r.d === 0 ? '=' : (r.d < 0 ? '\u25BC \u2212' : '\u25B2 +') + Math.abs(r.d).toFixed(1).replace('.', ',')) + '</td></tr>').join('') + '</table><p class="small mute" style="margin:4px 0 0">\u25BC : le handicap a baissé, le golfeur s’est amélioré.</p>';
}
function hcChart(g, all) {
  const hc = g.hc, seq = hc.hi.map((v, i) => [i, v]).filter(x => x[1] != null);
  const pts = all ? seq : seq.filter(x => x[0] >= hc.hi.length - 20);
  if (pts.length < 2) return '<p class="small mute">Le graphique apparaît après deux tournois avec un index.</p>';
  const n = hc.hi.length, vals = pts.map(x => x[1] / 10);
  const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = Math.max(0.4, (hi - lo) * 0.15), mn = lo - pad, mx = hi + pad;
  const X0 = 38, X1 = 330, Y0 = 12, Y1 = 118, x = k => X0 + (X1 - X0) * (pts.length === 1 ? 0 : k / (pts.length - 1)), y = v => Y1 - (v - mn) / (mx - mn) * (Y1 - Y0);
  let s = '';
  [mn + (mx - mn) * 0.15, mn + (mx - mn) * 0.5, mn + (mx - mn) * 0.85].forEach(v => { s += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '" stroke="var(--line)" stroke-width="1"/><text x="' + (X0 - 6) + '" y="' + (y(v) + 4).toFixed(1) + '" font-size="12" text-anchor="end" fill="var(--mute)">' + fmtHI(Math.round(v * 10) / 10) + '</text>'; });
  const last10 = hc.hi.slice(-10).filter(v => v != null);
  if (last10.length > 1) { const lw = Math.min.apply(null, last10) / 10, k0 = Math.max(0, pts.findIndex(p => p[0] >= n - 10)); s += '<line x1="' + x(k0).toFixed(1) + '" x2="' + X1 + '" y1="' + y(lw).toFixed(1) + '" y2="' + y(lw).toFixed(1) + '" stroke="var(--mute)" stroke-width="1.5" stroke-dasharray="5 4"/>'; }
  s += '<polyline points="' + pts.map((p, k) => x(k).toFixed(1) + ',' + y(p[1] / 10).toFixed(1)).join(' ') + '" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  s += '<circle cx="' + x(pts.length - 1).toFixed(1) + '" cy="' + y(vals[vals.length - 1]).toFixed(1) + '" r="4.5" fill="var(--acc)"/>';
  const glob = S.last ? (S.last.s - 1) * N_TOURN + S.last.t : null, lab = i => { if (glob === null) return ''; const q = glob - (n - 1 - i); return q < 0 ? '' : 'S' + yr(Math.floor(q / N_TOURN) + 1) + ' T' + (q % N_TOURN + 1); };
  s += '<text x="' + X0 + '" y="142" font-size="12" fill="var(--mute)">' + lab(pts[0][0]) + '</text><text x="' + X1 + '" y="142" font-size="12" text-anchor="end" fill="var(--mute)">' + lab(pts[pts.length - 1][0]) + '</text>';
  return '<svg class="hcsvg" viewBox="0 0 340 150" role="img" aria-label="Courbe du handicap sur ' + pts.length + ' tournois, de ' + fmtHI(vals[0]) + ' à ' + fmtHI(vals[vals.length - 1]) + '">' + s + '</svg>';
}
/* ---- Carte de handicap : l'index du golfeur situé dans sa ligue (rang, percentile) et sa courbe comparée
   à la médiane et au meilleur de la ligue. La courbe monte quand le golfeur s'améliore (index plus bas en haut).
   Les séries de la ligue viennent de l'historique d'index des membres actuels, aligné tournoi par tournoi. ---- */
function hcLeague(l, id) {
  if (l < 0) return null;
  const mem = S.L[l].map(k => ({ k, hc: (hcHolder(k) || {}).hc })).filter(o => o.hc && o.hc.x != null);
  if (mem.length < 10) return null;
  const sorted = mem.slice().sort((a, b) => a.hc.x - b.hc.x || a.k - b.k);
  const rank = sorted.findIndex(o => o.k === id) + 1;
  return { mem, rank, N: sorted.length };
}
function hcCard(g, id, o) {
  const hc = g.hc, l = leagueOf(id), LG = hcLeague(l, id), all = VIEW.hg !== '20';
  const n = hc.hi.length, win = all ? n : Math.min(20, n), i0 = n - win;
  const me = [], med = [], best = [];
  for (let i = i0; i < n; i++) {
    const v = hc.hi[i]; me.push(v == null ? null : v / 10);
    if (LG) {
      const j = n - 1 - i, vs = [];
      LG.mem.forEach(m => { const h = m.hc.hi, q = h.length - 1 - j; if (q >= 0 && h[q] != null) vs.push(h[q] / 10); });
      if (vs.length >= 10) { vs.sort((a, b) => a - b); med.push(vs[Math.floor(vs.length / 2)]); best.push(vs[0]); } else { med.push(null); best.push(null); }
    }
  }
  const W = 340, H = 150, X0 = 34, X1 = W - 6, Y0 = 10, Y1 = H - 22;
  const allv = me.concat(med, best).filter(v => v != null);
  const lo = Math.min.apply(null, allv), hi = Math.max.apply(null, allv), pad = Math.max(0.3, (hi - lo) * 0.08), mn = lo - pad, mx = hi + pad;
  const x = k => X0 + (X1 - X0) * (win === 1 ? 0 : k / (win - 1)), y = v => Y0 + (v - mn) / (mx - mn) * (Y1 - Y0);
  const path = a => { let d = '', pen = false; a.forEach((v, k) => { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + x(k).toFixed(1) + ' ' + y(v).toFixed(1) + ' '; pen = true; }); return d; };
  let sv = '';
  [0.15, 0.5, 0.85].forEach(f => { const v = mn + (mx - mn) * f; sv += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '" stroke="rgba(255,255,255,.10)"/><text x="' + (X0 - 5) + '" y="' + (y(v) + 4).toFixed(1) + '" font-size="11" text-anchor="end" fill="rgba(241,245,236,.55)">' + fmtHI(Math.round(v * 10) / 10) + '</text>'; });
  if (mn < 0 && mx > 0) sv += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 4"/><text x="' + (X0 + 4) + '" y="' + (y(0) - 4).toFixed(1) + '" font-size="11" fill="rgba(241,245,236,.6)">scratch</text>';
  if (LG && best.some(v => v != null)) {
    const ks = best.map((v, k) => v != null && med[k] != null ? k : -1).filter(k => k >= 0);
    if (ks.length > 1) sv += '<path d="' + ks.map((k, i) => (i ? 'L' : 'M') + x(k).toFixed(1) + ' ' + y(best[k]).toFixed(1)).join(' ') + ' ' + ks.slice().reverse().map(k => 'L' + x(k).toFixed(1) + ' ' + y(med[k]).toFixed(1)).join(' ') + 'Z" fill="#8FB8E8" opacity=".10"/>';
    sv += '<path d="' + path(med) + '" fill="none" stroke="rgba(241,245,236,.55)" stroke-width="1.5" stroke-dasharray="5 4"/><path d="' + path(best) + '" fill="none" stroke="#8FB8E8" stroke-width="1.5" stroke-dasharray="2 3"/>';
  }
  sv += '<path d="' + path(me) + '" fill="none" stroke="#F0C419" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
  const lk = me.length - 1; if (me[lk] != null) sv += '<circle cx="' + x(lk).toFixed(1) + '" cy="' + y(me[lk]).toFixed(1) + '" r="4.5" fill="#F0C419" stroke="#1D3122" stroke-width="2"/>';
  const lw = Math.min.apply(null, hc.hi.slice(-10).filter(v => v != null)) / 10;
  const oldR = !S.G[id] && id !== 0 && S.old ? S.old[id] : null;   // retraité : la courbe s'arrête à sa dernière saison
  const glob = oldR ? (oldR.s - 1) * N_TOURN + N_TOURN - 1 : S.last ? (S.last.s - 1) * N_TOURN + S.last.t : null, lab = i => { if (glob === null) return ''; const q = glob - (n - 1 - i); return q < 0 ? '' : yr(Math.floor(q / N_TOURN) + 1) + ' · T' + (q % N_TOURN + 1); };
  sv += '<text x="' + X0 + '" y="' + (H - 4) + '" font-size="11" fill="rgba(241,245,236,.55)">' + lab(i0) + '</text><text x="' + X1 + '" y="' + (H - 4) + '" font-size="11" text-anchor="end" fill="rgba(241,245,236,.55)">' + lab(n - 1) + '</text>';
  const chart = win < 2 ? '<p class="small" style="opacity:.7;margin:8px 0">Le graphique apparaît après deux tournois avec un handicap.</p>' : '<svg class="hcsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Évolution de l’handicap sur ' + win + ' tournois' + (LG ? ', comparée à la médiane et au meilleur de la ligue' : '') + '">' + sv + '</svg>';
  const ahead = LG && LG.N > 1 ? Math.round((LG.N - LG.rank) / (LG.N - 1) * 100) : 100;   // part de la ligue qu'il devance
  const trend = o.back === null ? '' : o.back <= -0.3 ? '▲ en amélioration' : o.back >= 0.3 ? '▼ en recul' : 'stable';
  const plus = o.cur < 0;
  let h = '<div class="hcard"><div class="hct"><span>HANDICAP CARD · ' + yr(oldR ? oldR.s : S.season) + '</span>' + (plus ? '<span class="hcbadge">Handicap plus</span>' : '') + '</div>';
  h += '<div class="hcrow"><div style="min-width:0"><div class="hcname">' + esc(nameOf(id)) + '</div><div class="hcsub">' + (l >= 0 ? LEAGUE_NAMES[l] : 'Retraité') + (trend ? ' · ' + trend : '') + '</div></div><div class="hcbig">' + fmtHI(o.cur) + '</div></div>';
  if (LG && LG.rank) h += '<div class="hcrank"><b>' + ord(LG.rank) + '</b> sur ' + LG.N + ' en Ligue ' + (l + 1) + '<span>devant ' + ahead + ' %</span></div><div class="hcbar"><i style="width:' + Math.max(3, ahead) + '%"></i></div>';
  h += '<div class="hcchips">' + chipRow([['20', '20 derniers tournois'], ['all', 'Tout']], VIEW.hg || 'all', 'hg') + '</div>' + chart;
  if (LG && win >= 2) h += '<div class="hclg"><span><i style="background:#F0C419"></i>' + esc(nameOf(id)) + '</span><span><i class="dsh"></i>médiane de la ligue</span><span><i class="dot"></i>meilleur de la ligue</span></div>';
  h += '<div class="hcfoot"><span>Plus bas ' + fmtHI(lw) + '</span><span>' + o.n + ' rondes</span><span>' + (o.back === null ? '—' : (Math.abs(o.back) < 0.05 ? '0,0' : (o.back < 0 ? '−' : '+') + Math.abs(o.back).toFixed(1).replace('.', ',')) + ' (3 t.)') + '</span></div></div>';
  if (hc.cap) h += '<p class="small mute" style="margin:8px 0 0">' + (hc.cap === 2 ? 'Plafond dur appliqué : l’handicap ne peut pas dépasser le plus bas des 10 derniers tournois de plus de 5,0.' : 'Plafond souple appliqué : la hausse au-delà de 3,0 est réduite de moitié.') + '</p>';
  return h + '<p class="small mute" style="margin:6px 2px 14px">Plus l’handicap est bas, meilleur est le golfeur : la courbe monte quand il s’améliore.</p>';
}
function hcHTML(g, id) {
  const hc = g.hc, n = hc ? hc.d.length : 0;
  if (!hc || hc.x == null) return '<div class="block hcb"><div class="ctx">Handicap</div><div class="hix">\u2014</div><p class="small mute" style="margin:6px 0 0">Il faut au moins 3 rondes pour établir un handicap (' + n + ' au carnet).</p></div>';
  const cur = hc.x, hi = hc.hi, m = hi.length, back = m > 3 && hi[m - 4] != null ? cur - hi[m - 4] / 10 : null;
  const last10 = hi.slice(-10).filter(v => v != null), low = Math.min.apply(null, last10) / 10;
  const tr = back === null ? '' : back <= -0.3 ? '<span class="tag good">en amélioration</span>' : back >= 0.3 ? '<span class="tag bad">en recul</span>' : '<span class="tag">stable</span>';
  /* Carnet de scores retiré de la fiche (demande de Max) : le calcul de l'index (carnet hc.d, plafonds, réduction) est inchangé et la carte de handicap s'en sert toujours. */
  const h = hcCard(g, id, { cur, back, low, n });
  return h;
}

