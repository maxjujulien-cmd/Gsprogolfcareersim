/* ============ v241 : Carnet de tournois (profil) ============
   Tous les tournois du golfeur, du plus récent au plus ancien ; un toucher déplie les cartes des deux rondes. */
function tlogCard(T, l, id) {
  const res = T && (l === 4 ? T.rc : T.lg && T.lg[l]), hs = res && res.h && res.h[id];
  if (!hs || !T.pars) return '<p class="small mute tlnone">Carte de scores non conservée pour ce tournoi (plus ancien que trois saisons).</p>';
  const P = T.pars, rds = [decHoles(hs, 0), decHoles(hs, 18)].filter(Boolean);
  const tot = a => a.reduce((x, y) => x + (y || 0), 0), rel = a => fmt(tot(a) - tot(P.slice(0, a.length)));
  const rowSc = (h, lab, a, b, sub) => '<tr><td class="lab">' + lab + '</td>' + P.slice(a, b).map((p, i) => holeCell(h[a + i], p)).join('') + sub + '</tr>';
  let x = '';
  if (isPC()) {
    x = '<table class="tlt"><tr><th class="lab">Trou</th>' + P.slice(0, 9).map((p, i) => '<th>' + (i + 1) + '</th>').join('') + '<th class="sub">All</th>' + P.slice(9).map((p, i) => '<th>' + (i + 10) + '</th>').join('') + '<th class="sub">Ret</th><th class="sub">Tot</th><th class="sub"></th></tr>' +
      '<tr><td class="lab">Par</td>' + P.slice(0, 9).map(p => '<td class="cxp">' + p + '</td>').join('') + '<td class="sub cxp">' + tot(P.slice(0, 9)) + '</td>' + P.slice(9).map(p => '<td class="cxp">' + p + '</td>').join('') + '<td class="sub cxp">' + tot(P.slice(9)) + '</td><td class="sub cxp">' + tot(P) + '</td><td class="sub"></td></tr>' +
      rds.map((h, r) => '<tr><td class="lab">R' + (r + 1) + '</td>' + P.slice(0, 9).map((p, i) => holeCell(h[i], p)).join('') + '<td class="sub">' + tot(h.slice(0, 9)) + '</td>' + P.slice(9).map((p, i) => holeCell(h[9 + i], p)).join('') + '<td class="sub">' + tot(h.slice(9)) + '</td><td class="sub">' + tot(h) + '</td><td class="sub ' + cls(tot(h) - tot(P)) + '">' + rel(h) + '</td></tr>').join('') + '</table>';
  } else {
    const half = (a, b, lab, tl) => '<table class="tlt"><tr><th class="lab">' + lab + '</th>' + P.slice(a, b).map((p, i) => '<th>' + (a + i + 1) + '</th>').join('') + '<th class="sub">' + tl + '</th></tr>' +
      '<tr><td class="lab">Par</td>' + P.slice(a, b).map(p => '<td class="cxp">' + p + '</td>').join('') + '<td class="sub cxp">' + tot(P.slice(a, b)) + '</td></tr>' +
      rds.map((h, r) => rowSc(h, 'R' + (r + 1), a, b, '<td class="sub">' + tot(h.slice(a, b)) + '</td>')).join('') + '</table>';
    x = half(0, 9, 'Aller', 'All') + half(9, 18, 'Retour', 'Ret');
  }
  return x;
}
function tlogHTML(id) {
  const hist = golferHistory(id, true, true).slice().reverse(); if (!hist.length) return '';
  const open = new Set(VIEW.tlo || []); let h = '', cs = null;
  h += '<p class="small mute" style="margin:0 0 8px"><span>' + hist.length + '</span> <span>' + (hist.length > 1 ? 'tournois' : 'tournoi') + '</span> · <span>Touche un tournoi pour voir ses cartes de scores.</span></p>';
  hist.forEach(x => {
    if (x.s !== cs) { cs = x.s; const n = hist.filter(y => y.s === cs).length; h += '<div class="tlsea"><span>Saison</span> ' + yr(cs) + ' <small><span>' + n + '</span> <span>' + (n > 1 ? 'tournois' : 'tournoi') + '</span></small></div>'; }
    const k = x.s + '-' + x.t, on = open.has(k), T = tGet(S.hist[x.s - 1], x.t);
    const tot = x.r2 !== null ? x.r1 + x.r2 : x.pos > 0 ? x.r1 : null;
    const pos = x.pos === 0 ? 'CUT' : ((T && (x.l === 4 ? T.rc : T.lg[x.l]).rows.filter(r => r[1] === x.pos).length > 1) ? 'T' : '') + x.pos;
    h += '<div class="tlrow' + (on ? ' on' : '') + (x.pos === 1 ? ' win' : x.pos === 0 ? ' mc' : '') + '" data-a="tlog" data-k="' + k + '" role="button" tabindex="0" aria-expanded="' + on + '">' +
      '<span class="tlpos">' + pos + '</span>' +
      '<span class="tlnm"><b>' + esc(x.name) + (T && T.maj && x.l === 0 ? ' <span class="tlmj">★</span>' : x.fin ? ' <span class="tlmj">🏆</span>' : '') + '</b><small>' + (x.fin ? '<span>Finale</span> · <span>top ' + FIN.n + ' de la L1</span>' : '<span>Tournoi</span> ' + (x.t + 1) + ' · ' + (x.l === 4 ? '<span>Recrues</span>' : 'L' + (x.l + 1))) + ' · <span>' + (x.r2 !== null ? 'R1' : x.pos === 0 ? 'R1' : 'R1') + '</span> <i class="' + cls(x.r1) + '">' + fmt(x.r1) + '</i>' + (x.r2 !== null ? ' · R2 <i class="' + cls(x.r2) + '">' + fmt(x.r2) + '</i>' : '') + '</small></span>' +
      '<span class="tltot ' + (tot !== null ? cls(tot) : '') + '">' + (tot === null ? '–' : fmt(tot)) + '</span>' +
      '<span class="tlpts">' + x.pts + ' <small>pts</small>' + (x.pay ? '<small class="tlpay">' + fmtMoney(x.pay) + '</small>' : '') + '</span>' +
      '<span class="tlcar"></span></div>';
    if (on) h += '<div class="tlcard"><div class="cards"><div class="tlin">' + tlogCard(T, x.l, id) + '</div></div><div class="tlf"><a href="#" data-a="tourn" data-s="' + x.s + '" data-t="' + x.t + '" data-l="' + x.l + '" data-m="res" data-fid="' + id + '">Voir le tournoi ›</a></div></div>';
  });
  return '<div class="tlog">' + h + '</div>';
}

/* ---- Niveau et potentiel en mots ---- */
function ladderHTML(n, on) { return '<span class="ladder t' + on + '" role="img" aria-label="Palier ' + (on + 1) + ' sur ' + n + '">' + range(0, n - 1).map(i => '<i class="' + (i <= on ? 'on' : '') + '"></i>').join('') + '</span>'; }
function retireWord(h) { return h >= 0.30 ? 'Retraite imminente' : h >= 0.15 ? 'Y pense s\u00e9rieusement' : h >= 0.06 ? 'Possible' : 'Pas \u00e0 l\u2019ordre du jour'; }
/* ---- Graphique de progression (niveau et potentiel, saison par saison) ----
   L'\u00e9chelle reste cach\u00e9e comme partout ailleurs : les rep\u00e8res horizontaux utilisent les paliers
   (mots), jamais le chiffre brut sur 1000. */
function progressChart(g) {
  if (g.oh && g.oh.some(x => x[0] < 0)) g = Object.assign({}, g, { oh: g.oh.filter(x => x[0] >= 0) });   // v321 : rien d'avant le début de l'histoire
  if (!g.oh || g.oh.length < 2) return g.oh && g.oh.length ? '<h3>Progression</h3><p class="small mute">Encore trop peu de saisons suivies pour un graphique — reviens dans quelques saisons.</p>' : '';
  /* Bandes de paliers : le fond est teint de la couleur de chaque palier, la courbe du niveau passe par-dessus
     (points colorés selon le palier atteint) et la zone verte jusqu'au potentiel montre la marge qui reste.
     Seuls les noms de paliers sont affichés, jamais le chiffre sur 1000. */
  const TCOL = ['#7D8A80', '#6FA05B', '#4E9A3A', '#2F8F7A', '#2E78B7', '#6B5BD1', '#C1852B', '#DDA914', '#B23A78'];
  const pts = g.oh, n = pts.length, W = 600, H = 300, X0 = 96, X1 = W - 14, Y0 = 10, Y1 = H - 34;
  const bnd = TIERS.map(t => t[0]).concat([1000]);
  const vals = pts.map(p => p[1]).concat(pts.map(p => Math.max(p[1], p[2])));
  const tMin = 0, tMax = TIERS.length - 1;   // toujours l'échelle complète, de Weak à Generational, pour comparer les golfeurs d'un coup d'œil
  const nb = tMax - tMin + 1;   // chaque palier a la même hauteur à l'écran, peu importe sa largeur réelle (les paliers du haut sont plus étroits)
  const tpos = v => { const k = clamp(scale(TIERS, v), tMin, tMax); return k - tMin + clamp((v - bnd[k]) / (bnd[k + 1] - bnd[k]), 0, 1); };
  const x = i => X0 + (X1 - X0) * i / (n - 1), y = v => Y1 - tpos(v) / nb * (Y1 - Y0);
  let s = '';
  for (let k = tMin; k <= tMax; k++) {
    const a = y(bnd[k]), b = y(bnd[k + 1]), c = TCOL[tierClass(k, TIERS.length)];
    s += '<rect x="' + X0 + '" y="' + b.toFixed(1) + '" width="' + (X1 - X0) + '" height="' + (a - b).toFixed(1) + '" fill="' + c + '" opacity=".14"/>';
    if (a - b >= 15) s += '<text x="' + (X0 - 8) + '" y="' + ((a + b) / 2 + 5).toFixed(1) + '" font-size="' + (a - b >= 24 ? 16 : 13) + '" font-weight="700" fill="' + c + '" text-anchor="end">' + esc(TIERS[k][1].replace('Established', 'Est.').replace('Hall Of Famer', 'HoF').replace('Generational', 'Gen.')) + '</text>';
    if (k > tMin) s += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + a.toFixed(1) + '" y2="' + a.toFixed(1) + '" stroke="' + c + '" stroke-opacity=".35" stroke-width="1"/>';
  }
  const P = pts.map(p => Math.max(p[1], p[2]));
  const line = a => a.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const area = line(P) + ' ' + pts.slice().reverse().map((p, j) => 'L' + x(n - 1 - j).toFixed(1) + ' ' + y(p[1]).toFixed(1)).join(' ') + ' Z';
  s += '<path d="' + area + '" fill="var(--acc)" opacity=".13"/>';
  s += '<path d="' + line(P) + '" fill="none" stroke="var(--acc)" stroke-width="2" stroke-dasharray="6 4"/>';
  s += '<path d="' + line(pts.map(p => p[1])) + '" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
  const r = n > 30 ? 4.5 : 7;
  s += pts.map((p, i) => '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p[1]).toFixed(1) + '" r="' + r + '" fill="' + TCOL[tierClass(scale(TIERS, p[1]), TIERS.length)] + '" stroke="var(--paper)" stroke-width="2"><title>' + yr(p[0]) + ' · ' + TIERS[scale(TIERS, p[1])][1] + '</title></circle>').join('');
  const gap = P[n - 1] - pts[n - 1][1];
  if (y(pts[n - 1][1]) - y(P[n - 1]) > 16) s += '<text x="' + (X1 - 2) + '" y="' + (y(P[n - 1]) - 6 < Y0 + 14 ? y(P[n - 1]) + 18 : y(P[n - 1]) - 6).toFixed(1) + '" font-size="15" fill="var(--acc)" text-anchor="end">Potentiel</text>';
  let bi = 0; pts.forEach((p, i) => { if (y(P[i]) - y(p[1]) > y(P[bi]) - y(pts[bi][1])) bi = i; });
  if (y(pts[bi][1]) - y(P[bi]) > 40) s += '<text x="' + clamp(x(bi), X0 + 50, X1 - 50).toFixed(1) + '" y="' + ((y(pts[bi][1]) + y(P[bi])) / 2 + 4).toFixed(1) + '" font-size="15" fill="var(--acc)" text-anchor="middle">marge restante</text>';
  const step = Math.max(1, Math.ceil(n / 7));
  s += pts.map((p, i) => (i % step === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < step) ? '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" font-size="15" fill="var(--mute)" text-anchor="' + (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '">' + yr(p[0]) + '</text>' : '').join('');
  return '<h3>Progression</h3><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block" role="img" aria-label="Progression du niveau par palier, de ' + TIERS[scale(TIERS, pts[0][1])][1] + ' (' + yr(pts[0][0]) + ') à ' + TIERS[scale(TIERS, pts[n - 1][1])][1] + ' (' + yr(pts[n - 1][0]) + ')">' + s + '</svg>' +
    '<div class="small mute" style="margin-top:2px"><span style="color:var(--ink)">●—</span> Niveau &nbsp; <span style="color:var(--acc)">- -</span> Potentiel &nbsp; <span style="color:var(--acc);opacity:.5">\u25a0</span> Marge restante</div>';
}
/* ---- World Ranking : moyenne pondérée des rondes des 30 derniers tournois (3 saisons). Poids plein sur les 10
   derniers, puis baisse linéaire jusqu'à zéro. Chaque ronde est comparée à la moyenne de tout le circuit à la ronde 1 du
   même tournoi (les 4 ligues jouent le même terrain, dans les mêmes conditions), corrigée de l'écart de météo entre
   les rondes. Un bonus de résultat (victoire, top 5, top 10…), plus fort en Ligue 1, compte pour environ 20 %.
   Au moins 8 tournois dans la fenêtre pour être classé, sinon NA. Seul le rang est affiché. ---- */
const WR = { win: 30, full: 10, minT: 8, bonus: 2, lm: [1, 0.75, 0.5, 0.3] };
const wrBonus = p => !p ? 0 : p === 1 ? 2 : p === 2 ? 1.2 : p === 3 ? 1 : p <= 5 ? 0.7 : p <= 10 ? 0.4 : p <= 20 ? 0.15 : 0;
let WR_CACHE = null;
function worldRanks() {
  const key = (S.last ? S.last.s + '.' + S.last.t : '-') + '/' + S.hist.length + '/' + Object.keys(S.G).length;
  if (WR_CACHE && WR_CACHE.key === key && WR_CACHE.S === S) return WR_CACHE.rk;
  const ts = []; S.hist.forEach(H => H.t.forEach(t => { if (t && t.lg) ts.push(t); }));
  const acc = {};
  ts.reverse().slice(0, WR.win).forEach((t, k) => {
    const w = k < WR.full ? 1 : (WR.win - k) / (WR.win - WR.full);
    let m = 0, n = 0; t.lg.forEach(lg => lg && lg.rows.forEach(r => { if (r[2] != null) { m += r[2]; n++; } })); if (!n) return; m /= n;
    const cx = t.ctx || {}, cond = r => ((cx.weather || [])[r] || 0) + ((cx.windBump || [])[r] || 0);
    t.lg.forEach((lg, l) => lg && lg.rows.forEach(r => {
      const id = r[0]; if (!S.G[id] && !(id === 0 && leagueOf(0) >= 0)) return;
      const a = acc[id] || (acc[id] = { s: 0, w: 0, n: 0 }), b = WR.bonus * wrBonus(r[1]) * (WR.lm[l] || 0);
      a.n++;
      [r[2], r[3]].forEach((rel, ri) => { if (rel == null) return; a.s += w * (rel - m - (cond(ri) - cond(0)) - b); a.w += w; });
    }));
  });
  const rk = {};
  Object.keys(acc).map(Number).filter(id => acc[id].n >= WR.minT && acc[id].w > 0).sort((x, y) => acc[x].s / acc[x].w - acc[y].s / acc[y].w || x - y).forEach((id, i) => { rk[id] = i + 1; });
  WR_CACHE = { key, S, rk };
  return rk;
}
/* Seuls les 100 premiers sont classés (un privilège) ; au-delà : « NC » (non classé). Le rang interne sert aux comparaisons. */
const WR_TOP = 100;
function wrPub(id) { const r = worldRanks()[id]; return r && r <= WR_TOP ? r : null; }
function wrSnapshot() { const rk = worldRanks(); return Object.keys(rk).map(Number).filter(id => rk[id] <= 300).sort((a, b) => rk[a] - rk[b]); }

