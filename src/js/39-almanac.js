/* ================= ALMANAC =================
   Statistiques du circuit année par année. Tout ce qui se lit dans l'historique (rondes, résultats, intersaisons)
   couvre toute l'histoire. Ce qui ne s'y trouve pas est photographié à chaque fin de saison dans S.alm[s] :
   paliers par ligue (t), index moyen (ix) et statistiques trou par trou (hs, car les cartes sont effacées après 3 saisons).
   Une ancienne partie reconstruit t (historique de progression de chaque golfeur) et hs (cartes encore gardées). */
const ALM_C = ['var(--lg1)', 'var(--lg2)', 'var(--lg3)', 'var(--lg4)'];
const almZ = () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];   // s3,n3,s4,n4,s5,n5,rondes,birdies+,bogeys,doubles+,aigles,albatros,trous d'un coup
function almHoleAdd(o, pars, str) {
  for (let r = 0; r * 18 < str.length; r++) {
    let ok = false;
    for (let i = 0; i < 18; i++) {
      const v = parseInt(str.charAt(r * 18 + i), 36), par = pars[i]; if (!(v > 0) || !(par >= 3 && par <= 5)) continue; ok = true;
      const k = (par - 3) * 2; o[k] += v; o[k + 1]++;
      const d = v - par;
      if (d <= -1) o[7]++; if (d === 1) o[8]++; if (d >= 2) o[9]++;
      if (v === 1) o[12]++; else if (d === -3) o[11]++; else if (d === -2) o[10]++;
    }
    if (ok) o[6]++;
  }
}
function almHoleSeason(H) {   // null si une carte manque (saison effacée)
  const out = [almZ(), almZ(), almZ(), almZ()]; let any = false;
  for (const t of H.t) { if (!t) continue; for (let l = 0; l < 4; l++) { const x = t.lg[l]; if (!x) continue; if (!x.h) return null; Object.keys(x.h).forEach(k => { if (x.h[k]) { any = true; almHoleAdd(out[l], t.pars, x.h[k]); } }); } }
  return any ? out : null;
}
function almTierCounts() { return S.L.map(a => { const c = [0, 0, 0, 0, 0, 0, 0, 0, 0]; a.forEach(id => { if (S.G[id]) c[tierOf(S.G[id])]++; }); return c; }); }
function almIdxMeans() { return S.L.map(a => { let s = 0, n = 0; a.forEach(id => { const h = hcHolder(id); if (h && h.hc && h.hc.x != null) { s += h.hc.x; n++; } }); return n ? Math.round(s / n * 10) / 10 : null; }); }
function almSnap(H) {   // appelée en début d'intersaison, avant les retraites et le vieillissement
  S.alm = S.alm || {};
  S.alm[H.s] = { t: almTierCounts(), ix: almIdxMeans(), hs: almHoleSeason(H) };
}
function almBackfill() {
  S.alm = S.alm || {};
  const pool = Object.values(S.G).concat(Object.values(S.old || {}).filter(o => !o.pre)), byId = {};
  Object.keys(S.G).forEach(k => { byId[k] = S.G[k]; }); Object.keys(S.old || {}).forEach(k => { if (!byId[k]) byId[k] = S.old[k]; });
  S.hist.forEach(H => {
    if (!H.end || S.alm[H.s]) return;
    const last = H.t.filter(Boolean).pop(); if (!last) return;
    const t = [0, 1, 2, 3].map(l => { const c = [0, 0, 0, 0, 0, 0, 0, 0, 0]; let n = 0; (last.lg[l] ? last.lg[l].rows : []).forEach(r => { const g = byId[r[0]]; const e = g && g.oh && g.oh.find(x => x[0] === H.s); if (e) { c[scale(TIERS, e[1])]++; n++; } }); return c; });
    S.alm[H.s] = { t, ix: null, hs: almHoleSeason(H), bf: 1 };
  });
  S.almv = 1;
}
/* ---- Index de l'historique (reconstruit seulement quand l'historique change) ---- */
let ALM_X = null;
function almX() {
  const key = (S.last ? S.last.s + '.' + S.last.t : '-') + '/' + S.hist.length + '/' + S.season;
  if (ALM_X && ALM_X.key === key && ALM_X.S === S) return ALM_X;
  const X = { key, S, ss: [], mem: {}, wins: {}, l1: {}, first: {}, played: {}, seq: {} };
  S.hist.forEach(H => {
    const ts = H.t.filter(Boolean); if (!ts.length) return;
    X.ss.push(H.s); const m = X.mem[H.s] = {};
    ts.forEach(t => t.lg.forEach((x, l) => { if (!x) return; x.rows.forEach((r, i) => {
      const id = r[0]; m[id] = l; if (X.first[id] == null) X.first[id] = H.s;
      (X.played[id] || (X.played[id] = [0, 0, 0, 0]))[l]++;
      if (i === 0) { const w = X.wins[id] || (X.wins[id] = [0, 0, 0, 0]); w[l]++; }
    }); }));
    Object.keys(m).forEach(id => { (X.seq[id] || (X.seq[id] = [])).push(m[id]); });
  });
  ALM_X = X; return X;
}
function almAgeAt(id, s) {
  const g = S.G[id]; if (g && g.a) return g.a - (S.season - s);
  const o = S.old && S.old[id]; if (o && o.a && o.s) return o.a - (o.s - s);
  return null;
}
const almNat = id => { const g = S.G[id] || (S.old && S.old[id]); return g && g.nat ? g.nat : id === 0 && S.G[0] ? S.G[0].nat || '' : ''; };
const af1 = v => v == null ? '–' : (v < -0.04 ? '−' : v > 0.04 ? '+' : '') + Math.abs(v).toFixed(1).replace('.', ',');
const af2 = v => v == null ? '–' : v.toFixed(2).replace('.', ',');
const as2 = v => v == null ? '–' : (v < 0 ? '−' : '+') + Math.abs(v).toFixed(2).replace('.', ',');
const apc = v => v == null ? '–' : Math.round(v) + ' %';
const amean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const amed = a => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), k = b.length >> 1; return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2; };
const almName = id => '<a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>';

/* ---- Graphique en lignes : un seul axe, étiquettes directes, bulle au toucher (data-mw) ---- */
function almLine(series, o) {
  const pc = isPC(), W = pc ? (o.wide ? 1430 : 640) : 360,   /* v413 : wide = graphique pleine largeur, même hauteur */ H = pc ? 230 : 210, fs = pc ? 12 : 11, X0 = 40, X1 = W - (o.endW || 30), Y0 = 10, Y1 = H - 24;
  const xs = [...new Set(series.flatMap(s => s.pts.map(p => p[0])))].sort((a, b) => a - b);
  const ys = series.flatMap(s => s.pts.map(p => p[1]));
  if (xs.length < 2 || !ys.length) return '<p class="small mute">Le graphique apparaît après deux saisons.</p>';
  let lo = Math.min(...ys), hi = Math.max(...ys); if (o.zero) lo = Math.min(0, lo);
  const raw = Math.max(o.int ? 1 : 0, (hi - lo) / 4) || 1, mag = Math.pow(10, Math.floor(Math.log10(raw))), st = (o.int ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10]).map(k => k * mag).find(k => k >= raw) || raw;
  lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st; if (hi === lo) hi = lo + st;
  const x = v => X0 + (X1 - X0) * (xs.indexOf(v) / (xs.length - 1)), y = v => Y1 - (v - lo) / (hi - lo) * (Y1 - Y0);
  let g = '';
  for (let v = lo; v <= hi + st / 2; v += st) g += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '" stroke="var(--line)" stroke-width="1"/><text x="' + (X0 - 5) + '" y="' + (y(v) + 4).toFixed(1) + '" font-size="' + fs + '" text-anchor="end" fill="var(--mute)">' + o.fmt(v) + '</text>';
  const step = Math.max(1, Math.ceil(xs.length / (pc ? 8 : 5)));
  xs.forEach((v, i) => { if ((xs.length - 1 - i) % step === 0) g += '<text x="' + x(v).toFixed(1) + '" y="' + (H - 6) + '" font-size="' + fs + '" text-anchor="middle" fill="var(--mute)">' + yr(v) + '</text>'; });
  const ends = [], hit = [];
  series.forEach(s => {
    if (!s.pts.length) return;
    g += '<polyline points="' + s.pts.map(p => x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join(' ') + '" fill="none" stroke="' + s.c + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    const last = s.pts[s.pts.length - 1];
    g += '<circle cx="' + x(last[0]).toFixed(1) + '" cy="' + y(last[1]).toFixed(1) + '" r="4" fill="' + s.c + '" stroke="var(--paper)" stroke-width="2"/>';
    if (s.name) ends.push({ y: y(last[1]), t: s.name });
    s.pts.forEach(p => hit.push([p[0], s.name, p[1]]));
  });
  ends.sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < fs + 2) ends[i].y = ends[i - 1].y + fs + 2;
  ends.forEach(e => { g += '<text x="' + (X1 + 7) + '" y="' + (e.y + 4).toFixed(1) + '" font-size="' + fs + '" font-weight="600" fill="var(--ink)">' + esc(e.t) + '</text>'; });
  // zones de toucher : une bande verticale par année, la bulle donne toutes les séries de cette année
  const bw = (X1 - X0) / Math.max(1, xs.length - 1);
  xs.forEach(v => {
    const tip = yr(v) + ' · ' + hit.filter(h => h[0] === v).map(h => (h[1] ? h[1] + ' : ' : '') + o.fmt(h[2], 1)).join(' · ');
    g += '<rect class="almhit" x="' + (x(v) - bw / 2).toFixed(1) + '" y="' + Y0 + '" width="' + bw.toFixed(1) + '" height="' + (Y1 - Y0) + '" fill="transparent" data-mw="' + esc(tip) + '" tabindex="0"/>';
  });
  return '<svg class="almsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label) + '">' + g + '</svg>';
}
function almLegend(names, cs) { return names.length < 2 ? '' : '<div class="almlg">' + names.map((n, i) => '<span><i style="background:' + (cs || ALM_C)[i] + '"></i>' + esc(n) + '</span>').join('') + '</div>'; }
function almBlock(title, sub, inner) { return '<div class="block"><h3 style="margin-top:0">' + title + '</h3>' + (sub ? '<p class="small mute" style="margin:0 0 6px">' + sub + '</p>' : '') + inner + '</div>'; }
function almTable(head, rows, cap) {
  const all = !!VIEW.aall, list = all || rows.length <= (cap || 15) ? rows : rows.slice(0, cap || 15);
  return '<div class="scroll"><table class="plain almt"><tr>' + head.map(h => '<th' + (h[1] ? ' class="r"' : '') + '>' + h[0] + '</th>').join('') + '</tr>' + list.join('') + '</table></div>' +
    (rows.length > (cap || 15) ? '<button class="btn sec sm" data-a="almAll" style="width:100%;margin-top:8px">' + (all ? 'Voir les ' + (cap || 15) + ' dernières années' : 'Voir les ' + rows.length + ' années') + '</button>' : '');
}
const almLgChips = l => chipRow([0, 1, 2, 3].map(L => [L, 'Ligue ' + (L + 1)]), l, 'almL');
const almYr = (s, part) => '<td>' + yr(s) + (part ? ' <span class="mute small">(en cours)</span>' : '') + '</td>';
const almPart = s => s === S.season && S.t < N_TOURN;
function almHs(s) {   // statistiques trou par trou d'une saison : photo de fin de saison, sinon les cartes encore gardées
  const a = S.alm && S.alm[s]; if (a && a.hs) return a.hs;
  const H = S.hist.find(h => h.s === s); return H ? almHoleSeason(H) : null;
}

/* ---- 1. Scoring ---- */
function almScoring(l) {
  const X = almX();
  return X.ss.map(s => {
    const H = S.hist.find(h => h.s === s);
    let sum = 0, n = 0, s1 = 0, n1 = 0, s2 = 0, n2 = 0, sub = 0, best = null, worst = null, win = 0, wn = 0, cut = 0, cn = 0;
    H.t.forEach(t => {
      if (!t || !t.lg[l]) return; const lg = t.lg[l];
      lg.rows.forEach(r => [r[2], r[3]].forEach((v, k) => { if (v == null || !isFinite(v)) return; sum += v; n++; if (k) { s2 += v; n2++; } else { s1 += v; n1++; } if (v < 0) sub++; if (!best || v < best.v) best = { v, id: r[0] }; if (!worst || v > worst.v) worst = { v, id: r[0] }; }));
      const w = lg.rows[0]; if (w && w[3] != null) { win += w[2] + w[3]; wn++; }
      if (lg.cut != null) { cut += lg.cut; cn++; }
    });
    return { s, avg: n ? sum / n : null, r1: n1 ? s1 / n1 : null, r2: n2 ? s2 / n2 : null, sub: n ? sub / n * 100 : null, best, worst, win: wn ? win / wn : null, cut: cn ? cut / cn : null };
  });
}
function almScoringHTML(l) {
  const all = [0, 1, 2, 3].map(L => almScoring(L));
  const A = almBlock('Score moyen par ronde', 'Par rapport au par, toutes les rondes de la saison.', almLegend(['L1', 'L2', 'L3', 'L4']) +
    almLine(all.map((a, L) => ({ name: 'L' + (L + 1), c: ALM_C[L], pts: a.filter(r => r.avg != null).map(r => [r.s, r.avg]) })), { fmt: af1, label: 'Score moyen par ronde, par ligue et par année', wide: 1 }));
  /* v413 : handicap moyen de la ligue : la photo de fin de saison (après le dernier tournoi, avant les montées et les
     descentes), ou la moyenne actuelle pour la saison en cours */
  const A0 = S.alm || {}, ixNow = (() => { try { return almIdxMeans(); } catch (e) { return null; } })();
  const ixOf = s => { const a = A0[s]; if (a && a.ix && a.ix[l] != null) return a.ix[l]; return s === S.season && ixNow ? ixNow[l] : null; };
  let B = almLgChips(l) + '<h3>Les rondes · Ligue ' + (l + 1) + '</h3>' + almTable([['Année'], ['Moyenne', 1], ['Handicap moy.', 1], ['Ronde 1', 1], ['Ronde 2', 1], ['Gagnant', 1], ['Coupure', 1], ['Sous le par', 1], ['Meilleure ronde'], ['Pire ronde']],
    all[l].slice().reverse().map(r => '<tr>' + almYr(r.s, almPart(r.s)) + '<td class="r"><b>' + af1(r.avg) + '</b></td><td class="r">' + (ixOf(r.s) == null ? '–' : fmtHI(ixOf(r.s))) + '</td><td class="r">' + af1(r.r1) + '</td><td class="r">' + af1(r.r2) + '</td><td class="r">' + af1(r.win) + '</td><td class="r">' + af1(r.cut) + '</td><td class="r">' + apc(r.sub) + '</td><td>' + (r.best ? '<span class="' + cls(r.best.v) + '">' + fmt(r.best.v) + '</span> ' + almName(r.best.id) : '') + '</td><td>' + (r.worst ? '<span class="' + cls(r.worst.v) + '">' + fmt(r.worst.v) + '</span> ' + almName(r.worst.id) : '') + '</td></tr>'));
  const X = almX(), hrows = X.ss.slice().reverse().map(s => { const hs = almHs(s); const o = hs && hs[l]; if (!o || !o[6]) return null; const per = k => (o[k] / o[6]).toFixed(2).replace('.', ',');
    return '<tr>' + almYr(s, almPart(s)) + '<td class="r">' + af2(o[0] / o[1]) + '</td><td class="r">' + af2(o[2] / o[3]) + '</td><td class="r">' + af2(o[4] / o[5]) + '</td><td class="r">' + per(7) + '</td><td class="r">' + per(8) + '</td><td class="r">' + per(9) + '</td><td class="r">' + o[10] + '</td><td class="r">' + o[11] + '</td><td class="r">' + o[12] + '</td></tr>'; }).filter(Boolean);
  B += '<h3>Trou par trou · Ligue ' + (l + 1) + '</h3>' + (hrows.length ? almTable([['Année'], ['Par 3', 1], ['Par 4', 1], ['Par 5', 1], ['Birdies+', 1], ['Bogeys', 1], ['Doubles+', 1], ['Aigles', 1], ['Albatros', 1], ['As', 1]], hrows) +
    '<p class="small mute" style="margin:4px 0 0">Coups moyens par type de trou, puis birdies ou mieux, bogeys et doubles bogeys ou pire par ronde ; aigles, albatros et trous d’un coup : total de la saison.' + (S.alm && Object.values(S.alm).some(a => a.bf) ? ' Les saisons dont les cartes trou par trou ont été effacées avant cette version n’y figurent pas.' : '') + '</p>' : '<p class="small mute">Pas encore de cartes trou par trou.</p>');
  return [A, B];
}

/* ---- 2. Talent ---- */
function almTalentHTML(l) {
  const X = almX(), A0 = S.alm || {}, cur = !almPart(S.season) ? null : { t: almTierCounts(), ix: almIdxMeans() };
  const snap = s => s === S.season && cur ? cur : A0[s];
  const ss = X.ss.filter(s => snap(s) && snap(s).t);
  const G = [['Elite et plus', 6, 9], ['Pro et Established Pro', 4, 6], ['Average et Semi-Pro', 2, 4], ['Amateur et moins', 0, 2]];
  const grp = G.map((x, i) => ({ name: String(i + 1), c: ALM_C[i], pts: ss.map(s => [s, snap(s).t.reduce((t, c) => t + c.slice(x[1], x[2]).reduce((p, q) => p + q, 0), 0)]) }));
  let A = almBlock('Talent du circuit', 'Nombre de golfeurs par groupe de paliers, les 4 ligues ensemble, à la fin de chaque saison.', '<div class="almlg">' + G.map((x, i) => '<span><i style="background:' + ALM_C[i] + '"></i><b>' + (i + 1) + '</b> ' + x[0] + '</span>').join('') + '</div>' +
    almLine(grp, { fmt: v => String(Math.round(v)), zero: 1, int: 1, label: 'Nombre de golfeurs par groupe de paliers sur tout le circuit' }));
  A += almBlock('Paliers de la Ligue ' + (l + 1), '', '<div class="almtl">' + TIERS.map((t, i) => '<span><i style="background:' + TIER_HEX[i] + '"></i>' + t[1] + '</span>').join('') + '</div>' +
    (ss.length ? ss.slice().reverse().slice(0, VIEW.aall ? 999 : 15).map(s => { const c = snap(s).t[l], n = c.reduce((x, y) => x + y, 0) || 1;
      return '<div class="almbar"><span class="almy">' + yr(s) + '</span><div class="almst">' + c.map((v, i) => v ? '<i style="width:' + (v / n * 100).toFixed(2) + '%;background:' + TIER_HEX[i] + '" data-mw="' + yr(s) + ' · ' + TIERS[i][1] + ' : ' + v + '"></i>' : '').join('') + '</div></div>'; }).join('') : '<p class="small mute">Les paliers apparaissent après la première saison.</p>'));
  const rows = X.ss.slice().reverse().map(s => {
    const m = X.mem[s], ids = Object.keys(m).filter(id => m[id] === l), ages = ids.map(id => almAgeAt(+id, s)).filter(v => v != null);
    const H = S.hist.find(h => h.s === s), wa = H.t.filter(t => t && t.lg[l] && t.lg[l].rows[0]).map(t => almAgeAt(t.lg[l].rows[0][0], s)).filter(v => v != null);
    const sn = snap(s), el = sn && sn.t ? sn.t[l].slice(6).reduce((x, y) => x + y, 0) : null, ix = sn && sn.ix ? sn.ix[l] : null;
    return '<tr>' + almYr(s, almPart(s)) + '<td class="r"><b>' + (el == null ? '–' : el) + '</b></td><td class="r">' + (ix == null ? '–' : fmtHI(ix)) + '</td><td class="r">' + (ages.length ? amean(ages).toFixed(1).replace('.', ',') : '–') + '</td><td class="r">' + (ages.length ? String(amed(ages)).replace('.', ',') : '–') + '</td><td class="r">' + (wa.length ? amean(wa).toFixed(1).replace('.', ',') : '–') + '</td></tr>';
  });
  const B = almLgChips(l) + '<h3>La Ligue ' + (l + 1) + ' année par année</h3>' + almTable([['Année'], ['Elite+', 1], ['Handicap moy.', 1], ['Âge moy.', 1], ['Âge médian', 1], ['Âge des vainqueurs', 1]], rows) +
    '<p class="small mute" style="margin:4px 0 0">Elite+ : Elite, Hall Of Famer et Generational. Le handicap moyen est noté à chaque fin de saison à partir de cette version.' + (Object.values(A0).some(a => a.bf) ? ' Pour les saisons d’avant, les paliers sont reconstruits d’après la progression des golfeurs encore connus : c’est une approximation.' : '') + '</p>';
  return [A, B];
}

/* ---- 3. Cohortes de recrues ---- */
function almCohorts() {
  const X = almX(), out = [];
  S.hist.forEach(H => {
    if (!H.end || !H.end.x || !H.end.x.rk || !H.end.x.rk.length) return;
    const ids = H.end.x.rk.map(r => r[0]).filter(id => id !== 0);
    const cw = id => { const g = S.G[id] || (S.old && S.old[id]); return g ? g.cw || 0 : 0; };
    const ce = id => { const g = S.G[id] || (S.old && S.old[id]); return g ? g.ce || 0 : 0; };
    const l1 = ids.filter(id => (X.played[id] && X.played[id][0]) || leagueOf(id) === 0), won = ids.filter(id => X.wins[id]);
    const best = ids.slice().sort((a, b) => cw(b) - cw(a) || ce(b) - ce(a))[0];
    out.push({ s: H.s + 1, n: ids.length, l1: l1.length, won: won.length, wL1: ids.filter(id => X.wins[id] && X.wins[id][0]).length, act: ids.filter(id => S.G[id]).length, best, bestW: best != null ? cw(best) : 0, age: S.season - (H.s + 1) });
  });
  return out;
}
function almCohortsHTML() {
  const C = almCohorts();
  if (!C.length) return [almBlock('Cohortes de recrues', '', '<p class="small mute">La première cohorte arrive à la fin de la première saison.</p>'), ''];
  const mature = C.filter(c => c.age >= 5 && c.n);
  const A = almBlock('Part de chaque cohorte qui atteint la Ligue 1', 'Recrues arrivées en Ligue 4 cette année-là. Les cohortes récentes ont encore le temps de monter.',
    almLine([{ name: '', c: ALM_C[0], pts: C.filter(c => c.n).map(c => [c.s, c.l1 / c.n * 100]) }], { fmt: v => Math.round(v) + ' %', zero: 1, endW: 12, label: 'Part de chaque cohorte de recrues qui atteint la Ligue 1' })) +
    (mature.length ? almBlock('Les meilleures cohortes', 'Au moins 5 saisons d’ancienneté, classées selon la part qui a atteint la Ligue 1.', '<table class="plain almt">' + mature.slice().sort((a, b) => b.l1 / b.n - a.l1 / a.n || b.wL1 - a.wL1).slice(0, 5).map((c, i) => '<tr><td class="mute">' + (i + 1) + '</td><td><b>' + yr(c.s) + '</b></td><td class="r">' + apc(c.l1 / c.n * 100) + ' en L1</td><td class="r">' + c.wL1 + ' vainqueur' + (c.wL1 > 1 ? 's' : '') + ' en L1</td></tr>').join('') + '</table>') : '');
  const B = '<h3>Toutes les cohortes</h3>' + almTable([['Cohorte'], ['Recrues', 1], ['En L1', 1], ['Vainqueurs', 1], ['Vainq. L1', 1], ['Actifs', 1], ['Meilleure carrière']],
    C.slice().reverse().map(c => '<tr><td>' + yr(c.s) + '</td><td class="r">' + c.n + '</td><td class="r"><b>' + c.l1 + '</b></td><td class="r">' + c.won + '</td><td class="r">' + c.wL1 + '</td><td class="r">' + c.act + '</td><td>' + (c.best != null && c.bestW ? almName(c.best) + ' <span class="mute">(' + c.bestW + ' victoire' + (c.bestW > 1 ? 's' : '') + ' en L1)</span>' : '<span class="mute">–</span>') + '</td></tr>')) +
    '<p class="small mute" style="margin:4px 0 0">« Vainqueurs » : recrues qui ont gagné au moins un tournoi, toutes ligues. La meilleure carrière se mesure aux victoires en Ligue 1.</p>';
  return [A, B];
}

/* ---- 4. Parité ---- */
function almParity(l) {
  const X = almX();
  return X.ss.map(s => {
    const H = S.hist.find(h => h.s === s), w = {};
    H.t.forEach(t => { if (t && t.lg[l] && t.lg[l].rows[0]) { const id = t.lg[l].rows[0][0]; w[id] = (w[id] || 0) + 1; } });
    const ids = Object.keys(w).sort((a, b) => w[b] - w[a]), tb = H.end && H.end.tables[l];
    return { s, n: H.t.filter(Boolean).length, diff: ids.length, multi: ids.filter(i => w[i] > 1).length, top: ids.length ? { id: +ids[0], w: w[ids[0]] } : null, champ: tb && tb[0] ? tb[0][0] : null, gap: tb && tb[1] ? tb[0][1] - tb[1][1] : null };
  });
}
function almParityHTML(l) {
  const all = [0, 1, 2, 3].map(L => almParity(L));
  let A = almBlock('Vainqueurs différents par saison', 'Sur ' + N_TOURN + ' tournois. Plus le nombre est haut, plus la ligue est ouverte.', almLegend(['L1', 'L2', 'L3', 'L4']) +
    almLine(all.map((a, L) => ({ name: 'L' + (L + 1), c: ALM_C[L], pts: a.filter(r => r.n === N_TOURN).map(r => [r.s, r.diff]) })), { fmt: v => String(Math.round(v)), zero: 1, int: 1, label: 'Nombre de vainqueurs différents par saison' }));
  // dynasties : titres de champion de ligue consécutifs, et le plus de titres
  const champs = S.hist.filter(H => H.end && H.end.tables[l] && H.end.tables[l][0]).map(H => [H.s, H.end.tables[l][0][0]]);
  const streaks = []; let i = 0;
  while (i < champs.length) { let j = i; while (j + 1 < champs.length && champs[j + 1][1] === champs[i][1]) j++; if (j > i) streaks.push({ id: champs[i][1], n: j - i + 1, a: champs[i][0], b: champs[j][0] }); i = j + 1; }
  const tot = {}; champs.forEach(c => { tot[c[1]] = (tot[c[1]] || 0) + 1; });
  const most = Object.keys(tot).filter(id => tot[id] > 1).sort((a, b) => tot[b] - tot[a]).slice(0, 8);
  A += almBlock('Dynasties · Ligue ' + (l + 1), 'Champions du classement final de la ligue.',
    (streaks.length ? '<h3 style="margin-top:4px">Titres consécutifs</h3><table class="plain almt">' + streaks.sort((a, b) => b.n - a.n || b.b - a.b).slice(0, 8).map(r => '<tr><td>' + almName(r.id) + '</td><td class="r"><b>' + r.n + '</b> de suite</td><td class="r mute">' + yr(r.a) + '–' + yr(r.b) + '</td></tr>').join('') + '</table>' : '<p class="small mute">Aucun champion n’a encore gagné deux années de suite.</p>') +
    (most.length ? '<h3>Le plus de titres</h3><table class="plain almt">' + most.map(id => '<tr><td>' + almName(+id) + '</td><td class="r"><b>' + tot[id] + '</b> titres</td></tr>').join('') + '</table>' : ''));
  const B = almLgChips(l) + '<h3>Ligue ' + (l + 1) + ' année par année</h3>' + almTable([['Année'], ['Vainqueurs', 1], ['2 victoires +', 1], ['Plus de victoires'], ['Champion'], ['Avance', 1]],
    all[l].slice().reverse().map(r => '<tr>' + almYr(r.s, almPart(r.s)) + '<td class="r"><b>' + r.diff + '</b></td><td class="r">' + r.multi + '</td><td>' + (r.top ? almName(r.top.id) + ' <span class="mute">(' + r.top.w + ')</span>' : '') + '</td><td>' + (r.champ != null ? almName(r.champ) : '<span class="mute">en cours</span>') + '</td><td class="r">' + (r.gap == null ? '–' : r.gap + ' pts') + '</td></tr>'));
  return [A, B];
}

/* ---- 5. Mouvements et carrières ---- */
function almMovesHTML() {
  const X = almX();
  const rows = S.hist.filter(H => H.end).map(H => {
    const E = H.end, rt = (E.x && E.x.rt) || [], mid = (E.midMoves || []).length;
    const up = (E.up || []).reduce((t, a) => t + (a ? a.length : 0), 0), dn = (E.down || []).reduce((t, a) => t + (a ? a.length : 0), 0);
    const pk = rt.map(r => { const o = S.old && S.old[r[0]]; if (!o || !o.oh || !o.oh.length) return null; const e = o.oh.reduce((m, x) => x[1] > m[1] ? x : m); return o.a - (o.s - e[0]); }).filter(v => v != null);
    return { s: H.s, up, dn, mid, ret: E.retired || 0, f: rt.filter(r => r[7]).length, rk: E.rookies || 0, cs: rt.length ? amean(rt.map(r => r[2])) : null, age: rt.length ? amean(rt.map(r => r[1])) : null, pk: pk.length ? amean(pk) : null };
  });
  const A = almBlock('Arrivées, départs et déplacements', 'Par année. Les recrues comblent les places des retraités, leurs nombres sont donc presque identiques. Les déplacés sont les golfeurs promus ou relégués avant la fin de la saison.', almLegend(['Retraites (= recrues)', 'dont forcées', 'Déplacés en cours de saison']) +
    almLine([{ name: 'Retraites', c: ALM_C[0], pts: rows.map(r => [r.s, r.ret]) }, { name: 'Forcées', c: ALM_C[1], pts: rows.map(r => [r.s, r.f]) }, { name: 'Déplacés', c: ALM_C[2], pts: rows.map(r => [r.s, r.mid]) }], { fmt: v => String(Math.round(v)), zero: 1, int: 1, endW: 60, label: 'Retraites, retraites forcées et déplacements en cours de saison par année' }));
  // ascenseurs : changements de ligue d'une saison à l'autre + déplacements en cours de saison
  const mv = {}; Object.keys(X.seq).forEach(id => { const q = X.seq[id]; let n = 0; for (let i = 1; i < q.length; i++) if (q[i] !== q[i - 1]) n++; if (n) mv[id] = n; });
  S.hist.forEach(H => { if (H.end) (H.end.midMoves || []).forEach(m => { mv[m.id] = (mv[m.id] || 0) + 1; }); });
  const top = Object.keys(mv).sort((a, b) => mv[b] - mv[a]).slice(0, 10);
  const A2 = almBlock('Les ascenseurs', 'Golfeurs qui ont changé de ligue le plus souvent (intersaisons et en cours de saison).', top.length ? '<table class="plain almt">' + top.map((id, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(+id) + (S.G[id] ? '' : ' <span class="mute small">retraité</span>') + '</td><td class="r"><b>' + mv[id] + '</b> changements</td><td class="r mute hid-m">' + X.seq[id].map(l => 'L' + (l + 1)).filter((v, k, a) => k === 0 || v !== a[k - 1]).slice(-6).join('→') + '</td></tr>').join('') + '</table>' : '<p class="small mute">Pas encore de changement de ligue.</p>');
  const B = '<h3>Intersaisons</h3>' + almTable([['Année'], ['Promus', 1], ['Relégués', 1], ['En saison', 1], ['Retraites', 1], ['Forcées', 1], ['Recrues', 1], ['Carrière', 1], ['Âge retraite', 1], ['Âge sommet', 1]],
    rows.slice().reverse().map(r => '<tr><td>' + yr(r.s) + '</td><td class="r">' + r.up + '</td><td class="r">' + r.dn + '</td><td class="r">' + r.mid + '</td><td class="r"><b>' + r.ret + '</b></td><td class="r">' + r.f + '</td><td class="r">' + r.rk + '</td><td class="r">' + (r.cs == null ? '–' : r.cs.toFixed(1).replace('.', ',') + ' s.') + '</td><td class="r">' + (r.age == null ? '–' : r.age.toFixed(1).replace('.', ',')) + '</td><td class="r">' + (r.pk == null ? '–' : r.pk.toFixed(1).replace('.', ',')) + '</td></tr>')) +
    '<p class="small mute" style="margin:4px 0 0">En saison : promus ou relégués avant la fin de la saison. Carrière (durée moyenne en saisons), âge à la retraite et âge au sommet : golfeurs qui ont pris leur retraite cette année-là. Le sommet est la saison où leur niveau était le plus haut.</p>';
  // v350 : taille des ligues pendant la saison (1er tournoi → fin du dernier, avant les montées et descentes de fin de saison)
  const sz = S.hist.map(H => { const t0 = H.t && H.t.find(Boolean); if (!t0 || !t0.lg) return null; const cur = !H.end;
    return { s: H.s, cur, v: [0, 1, 2, 3].map(L => { const a = t0.lg[L] && t0.lg[L].rows ? t0.lg[L].rows.length : null, b = cur ? (S.L[L] || []).length : H.end.tables && H.end.tables[L] ? H.end.tables[L].filter(r => !r[5]).length : null; return [a, b]; }) }; }).filter(Boolean).reverse();
  const szc = ([a, b]) => { if (a == null || b == null) return '<td class="r mute">–</td>'; const d = b - a; return '<td class="r"><span class="lgsza">' + a + ' → </span><b>' + b + '</b> ' + (d < 0 ? '<span class="lgszd dn">▼' + (-d) + '</span>' : d > 0 ? '<span class="lgszd up">▲' + d + '</span>' : '<span class="lgszd">=</span>') + '</td>'; };
  const SZ = sz.length ? '<h3>Taille des ligues en saison</h3><div class="scroll"><table class="plain almt lgszt"><tr><th>Année</th><th class="r">L1</th><th class="r">L2</th><th class="r">L3</th><th class="r">L4</th></tr>' +
    sz.map(r => '<tr><td>' + yr(r.s) + (r.cur ? ' <span class="mute small">(en cours)</span>' : '') + '</td>' + r.v.map(szc).join('') + '</tr>').join('') + '</table></div><p class="small mute" style="margin:4px 0 12px">Golfeurs au premier tournoi → après le dernier tournoi, avant les promotions et relégations de fin de saison. La différence vient des montées et descentes en cours de saison.</p>' : '';
  return [A + A2, SZ + B];
}

/* ---- 6. Nations ---- */
function almNationsHTML(l) {
  const X = almX(), nat = {}, add = (n, k, v) => { if (!n) return; const o = nat[n] || (nat[n] = { w: [0, 0, 0, 0], ti: 0, g: [0, 0, 0, 0] }); if (k === 'w') o.w[v]++; else if (k === 'ti') o.ti++; else o.g[v]++; };
  Object.keys(X.wins).forEach(id => { const n = almNat(+id); X.wins[id].forEach((c, L) => { for (let i = 0; i < c; i++) add(n, 'w', L); }); });
  S.hist.forEach(H => { if (H.end && H.end.tables[0] && H.end.tables[0][0]) add(almNat(H.end.tables[0][0][0]), 'ti'); });
  S.L.forEach((a, L) => a.forEach(id => add(almNat(id), 'g', L)));
  const ks = Object.keys(nat), byW = ks.filter(n => nat[n].w[0]).sort((a, b) => nat[b].w[0] - nat[a].w[0] || nat[b].ti - nat[a].ti).slice(0, 10);
  const mx = byW.length ? nat[byW[0]].w[0] : 1;
  const A = almBlock('Victoires en Ligue 1 par pays', 'Toute l’histoire du circuit.', byW.length ? byW.map(n => '<div class="almh"><span class="almhn">' + flagVisual(n, 18) + ' ' + esc(n) + '</span><span class="almhb"><i style="width:' + (nat[n].w[0] / mx * 100).toFixed(1) + '%" data-mw="' + esc(n) + ' : ' + nat[n].w[0] + ' victoires en L1"></i></span><b>' + nat[n].w[0] + '</b></div>').join('') : '<p class="small mute">Aucune victoire pour l’instant.</p>');
  const best = S.hist.filter(H => H.t.some(Boolean)).map(H => { const c = {}; H.t.forEach(t => { if (t && t.lg[0] && t.lg[0].rows[0]) { const n = almNat(t.lg[0].rows[0][0]); if (n) c[n] = (c[n] || 0) + 1; } }); const m = Math.max(0, ...Object.values(c)); return { s: H.s, ns: Object.keys(c).filter(n => c[n] === m && m > 0), m }; });
  const A2 = almBlock('La meilleure nation de chaque année', 'Le plus de victoires en Ligue 1.', almTable([['Année'], ['Pays'], ['Victoires', 1]], best.slice().reverse().map(r => '<tr>' + almYr(r.s, almPart(r.s)) + '<td>' + r.ns.map(n => flagVisual(n, 16) + ' ' + esc(n)).join(', ') + '</td><td class="r">' + r.m + '</td></tr>'), 10));
  const top = ks.slice().sort((a, b) => nat[b].g[l] - nat[a].g[l] || nat[b].g.reduce((x, y) => x + y) - nat[a].g.reduce((x, y) => x + y)).filter(n => nat[n].g[l]).slice(0, 15);
  const B = almLgChips(l) + '<h3>Golfeurs par pays · Ligue ' + (l + 1) + '</h3><div class="scroll"><table class="plain almt"><tr><th>Pays</th><th class="r">L' + (l + 1) + '</th><th class="r">Circuit</th><th class="r">Victoires L1</th><th class="r">Titres L1</th></tr>' +
    top.map(n => '<tr><td>' + flagVisual(n, 16) + ' ' + esc(n) + '</td><td class="r"><b>' + nat[n].g[l] + '</b></td><td class="r">' + nat[n].g.reduce((x, y) => x + y) + '</td><td class="r">' + nat[n].w[0] + '</td><td class="r">' + nat[n].ti + '</td></tr>').join('') + '</table></div><p class="small mute" style="margin:4px 0 0">Golfeurs actuellement sur le circuit ; victoires et titres de champion de la Ligue 1 dans toute l’histoire.</p>';
  return [A + A2, B];
}

/* ---- 7. Terrains ---- */
function almCoursesHTML() {
  const C = {}, wind = {}, holes = {};
  S.hist.forEach(H => H.t.forEach(t => {
    if (!t) return; const c = C[t.name] || (C[t.name] = { n: 0, s: 0, k: 0, best: null, last: null, ls: 0, lk: 0 });
    c.n++; if (c.last !== H.s) { c.last = H.s; c.ls = 0; c.lk = 0; }
    t.lg.forEach(x => { if (!x) return; x.rows.forEach(r => [r[2], r[3]].forEach((v, k) => {
      if (v == null || !isFinite(v)) return; c.s += v; c.k++; c.ls += v; c.lk++;
      if (!c.best || v < c.best.v) c.best = { v, id: r[0], s: H.s };
      const wl = k ? t.wind2 : t.wind, w = wind[wl || 'none'] || (wind[wl || 'none'] = [0, 0]); w[0] += v; w[1]++;
    })); if (x.h) Object.keys(x.h).forEach(id => { const str = x.h[id]; for (let i = 0; i < str.length; i++) { const hk = t.name + '|' + (i % 18), v = parseInt(str.charAt(i), 36); if (!(v > 0)) continue; const o = holes[hk] || (holes[hk] = { name: t.name, h: i % 18 + 1, par: t.pars[i % 18], s: 0, n: 0 }); o.s += v - t.pars[i % 18]; o.n++; } }); });
  }));
  const ks = Object.keys(C).filter(k => C[k].k).sort((a, b) => C[b].s / C[b].k - C[a].s / C[a].k);
  const A = almBlock('Effet du vent', 'Score moyen par ronde selon le vent du jour, toutes ligues.', '<table class="plain almt">' + WIND_LEVELS.filter(w => wind[w] && wind[w][1]).map(w => '<tr><td>' + WIND_LABELS[w] + '</td><td class="r"><b>' + as2(wind[w][0] / wind[w][1]) + '</b></td><td class="r mute">' + wind[w][1].toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' rondes</td></tr>').join('') + '</table>');
  const hs = Object.values(holes).filter(o => o.n >= 200).map(o => Object.assign(o, { a: o.s / o.n })).sort((a, b) => b.a - a.a);
  const hrow = o => '<tr><td>' + esc(o.name) + '</td><td class="r">' + o.h + '</td><td class="r">' + o.par + '</td><td class="r"><b>' + (o.a >= 0 ? '+' : '−') + Math.abs(o.a).toFixed(2).replace('.', ',') + '</b></td></tr>';
  const A2 = almBlock('Les trous les plus difficiles', 'Coups au-dessus du par en moyenne, toutes ligues, sur les cartes encore gardées (3 dernières saisons).', hs.length ? '<table class="plain almt"><tr><th>Terrain</th><th class="r">Trou</th><th class="r">Par</th><th class="r">Moy.</th></tr>' + hs.slice(0, 10).map(hrow).join('') + '</table><h3>Les plus faciles</h3><table class="plain almt">' + hs.slice(-5).reverse().map(hrow).join('') + '</table>' : '<p class="small mute">Pas encore assez de cartes.</p>');
  const B = '<h3>Terrains, du plus dur au plus facile</h3>' + almTable([['Terrain'], ['Tournois', 1], ['Moyenne', 1], ['Dernière année', 1], ['Meilleure ronde']],
    ks.map(k => { const c = C[k]; return '<tr><td>' + esc(k) + '</td><td class="r">' + c.n + '</td><td class="r"><b>' + as2(c.s / c.k) + '</b></td><td class="r">' + as2(c.lk ? c.ls / c.lk : null) + ' <span class="mute small">' + yr(c.last) + '</span></td><td>' + (c.best ? '<span class="' + cls(c.best.v) + '">' + fmt(c.best.v) + '</span> ' + almName(c.best.id) + ' <span class="mute small">' + yr(c.best.s) + '</span>' : '') + '</td></tr>'; }), 30) +
    '<p class="small mute" style="margin:4px 0 0">Moyenne : score par ronde par rapport au par de toutes les rondes jouées sur ce terrain, les 4 ligues ensemble (le même champ chaque fois, donc comparable d’un terrain à l’autre).</p>';
  return [A + A2, B];
}

/* ---- 8. Argent ---- */
function almMoney(l) {
  return almX().ss.map(s => {
    const H = S.hist.find(h => h.s === s), e = {}; let tot = 0;
    H.t.forEach(t => { if (!t || !t.lg[l] || !t.lg[l].pay) return; Object.keys(t.lg[l].pay).forEach(id => { const v = t.lg[l].pay[id] || 0; e[id] = (e[id] || 0) + v; tot += v; }); });
    const ids = Object.keys(e).sort((a, b) => e[b] - e[a]), t10 = ids.slice(0, 10).reduce((x, id) => x + e[id], 0);
    return { s, tot, share: tot ? t10 / tot * 100 : null, top: ids.length ? { id: +ids[0], v: e[ids[0]] } : null };
  });
}
function almMoneyHTML(l) {
  const all = [0, 1, 2, 3].map(L => almMoney(L));
  const A = almBlock('Bourses totales par ligue', 'Total des gains versés dans la saison.', almLegend(['L1', 'L2', 'L3', 'L4']) +
    almLine(all.map((a, L) => ({ name: 'L' + (L + 1), c: ALM_C[L], pts: a.filter(r => !almPart(r.s)).map(r => [r.s, r.tot]) })), { fmt: v => fmtM(Math.round(v)), zero: 1, endW: 30, label: 'Bourses totales par ligue et par année' }));
  const B = almLgChips(l) + '<h3>Ligue ' + (l + 1) + ' année par année</h3>' + almTable([['Année'], ['Bourses', 1], ['Part du top 10', 1], ['Plus gros gains']],
    all[l].slice().reverse().map(r => '<tr>' + almYr(r.s, almPart(r.s)) + '<td class="r"><b>' + fmtM(r.tot) + '</b></td><td class="r">' + apc(r.share) + '</td><td>' + (r.top ? almName(r.top.id) + ' <span class="mute">' + fmtM(r.top.v) + '</span>' : '') + '</td></tr>')) +
    '<p class="small mute" style="margin:4px 0 0">Part du top 10 : ce que les 10 golfeurs les mieux payés de la ligue ont touché sur l’ensemble des gains de la saison.</p>';
  return [A, B];
}

