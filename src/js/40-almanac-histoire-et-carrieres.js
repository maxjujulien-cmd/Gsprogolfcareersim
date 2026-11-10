/* ============ v351 : Almanac › Histoire et Carrières (pour les mordus de statistiques) ============ */
let ALMH_MEMO = null;
function almH() {   // un passage dans l'historique : n° 1 mondial par tournoi, séries, remontées, courses au titre, âges
  const key = (S.last ? S.last.s + '.' + S.last.t : '-') + '/' + S.hist.length + '/' + S.season;
  if (ALMH_MEMO && ALMH_MEMO.key === key && ALMH_MEMO.S === S) return ALMH_MEMO;
  const X = { key, S, no1: [], seq: {}, comeback: [], collapse: [], races: [], wins: [], firstL1: {} };
  const cut = {}, t10 = {}, best = (o, k, v, s) => { if (v > (o[k] || [0])[0]) o[k] = [v, s]; };
  const curC = {}, curT = {};
  S.hist.forEach(H => {
    const lead = {}; let leaders = [];
    (H.t || []).forEach((t, ti) => {
      if (!t || !t.lg) return;
      if (t.wr && t.wr[0] != null) X.no1.push({ s: H.s, t: ti, id: t.wr[0] });
      t.lg.forEach((L, l) => { if (!L || !L.rows) return;
        L.rows.forEach(r => { const id = r[0]; if (id === 0 && !S.G[0]) return;
          if (r[1] > 0) { curC[id] = (curC[id] || 0) + 1; best(cut, id, curC[id], H.s); } else curC[id] = 0;
          if (r[1] > 0 && r[1] <= 10) { curT[id] = (curT[id] || 0) + 1; best(t10, id, curT[id], H.s); } else curT[id] = 0;
          if (l === 0) { lead[id] = (lead[id] || 0) + (r[4] || 0); if (X.firstL1[id] == null) X.firstL1[id] = H.s; } });
        if (L.rows[0] && L.rows[0][1] === 1) X.wins.push({ s: H.s, t: ti, l, id: L.rows[0][0] });
        // remontées / effondrements : position à 5 trous de la fin de la ronde finale (cartes trou par trou)
        if (L.h && t.pars) { const one = !!L.one, tot = []; L.rows.forEach(r => { if (!one && r[3] == null) return; const s0 = L.h[r[0]]; if (!s0) return; const h = decHoles(s0, one ? 0 : 18); if (!h) return; tot.push([r[0], (one ? 0 : r[2]) + relTo(h, t.pars, 13), r[1]]); });
          if (tot.length > 2) { tot.sort((a, b) => a[1] - b[1]); const ld = tot[0][1], solo = tot[1][1] > ld, w = tot.find(x => x[2] === 1);
            if (w && w[1] - ld >= 2) X.comeback.push({ s: H.s, t: ti, l, id: w[0], d: w[1] - ld, name: t.name });
            if (solo && tot[0][2] !== 1) X.collapse.push({ s: H.s, t: ti, l, id: tot[0][0], d: tot[1][1] - ld, pos: tot[0][2], name: t.name }); } }
      });
      if (t.lg[0] && t.lg[0].rows.length) { let m = -1, who = null; Object.keys(lead).forEach(k => { if (lead[k] > m) { m = lead[k]; who = +k; } }); leaders.push(who); }
    });
    const E = H.end, T = E && E.tables && E.tables[0];
    if (T && T.length > 1) { const nt = T.filter(r => !r[5]); if (nt.length > 1) X.races.push({ s: H.s, id: nt[0][0], id2: nt[1][0], m: nt[0][1] - nt[1][1], wire: leaders.length >= 5 && leaders.every(x => x === nt[0][0]) }); }
  });
  X.cut = cut; X.t10 = t10;
  ALMH_MEMO = X; return X;
}
const almYrT = (s, t) => yr(s) + ' · <span>T</span>' + (t + 1);
const almTLink = (s, t, l, txt) => '<a href="#" data-a="tourn" data-s="' + s + '" data-t="' + t + '" data-l="' + l + '">' + txt + '</a>';
function almHistHTML() {
  const X = almH(), A = [], B = [];
  // 1. règnes du n° 1 mondial (en tournois)
  const reigns = []; X.no1.forEach(e => { const r = reigns[reigns.length - 1]; if (r && r.id === e.id) { r.n++; r.end = e; } else reigns.push({ id: e.id, n: 1, start: e, end: e }); });
  const tot1 = {}; X.no1.forEach(e => { tot1[e.id] = (tot1[e.id] || 0) + 1; });
  if (reigns.length) {
    const cur = reigns[reigns.length - 1], longest = reigns.slice().sort((a, b) => b.n - a.n).slice(0, 8);
    const strip = '<div class="almreign">' + reigns.slice(-30).map(r => '<span title="' + esc(nameOf(r.id)) + ' · ' + r.n + ' tournoi' + (r.n > 1 ? 's' : '') + '" style="flex:' + r.n + ';background:hsl(' + (r.id * 47 % 360) + ' 45% 45%)"></span>').join('') + '</div>';
    A.push(almBlock('Les règnes du n° 1 mondial', 'Chaque tournoi compte : qui était n° 1 au classement mondial publié après le tournoi. La bande montre les derniers règnes, du plus ancien au plus récent.',
      '<p style="margin:0 0 6px"><span>N° 1 actuel :</span> ' + almName(cur.id) + ' · <b>' + cur.n + '</b> <span>' + (cur.n > 1 ? 'tournois de suite' : 'tournoi') + '</span></p>' + strip +
      '<h4 class="almh4">Les plus longs règnes</h4><table class="plain almt">' + longest.map((r, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(r.id) + '</td><td class="r"><b>' + r.n + '</b> <span class="mute">' + (r.n > 1 ? 'tournois' : 'tournoi') + '</span></td><td class="r mute small">' + almYrT(r.start.s, r.start.t) + ' → ' + almYrT(r.end.s, r.end.t) + '</td></tr>').join('') + '</table>' +
      '<h4 class="almh4">Le plus de tournois au n° 1 (au total)</h4><table class="plain almt">' + Object.keys(tot1).sort((a, b) => tot1[b] - tot1[a]).slice(0, 8).map((id, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(+id) + '</td><td class="r"><b>' + tot1[id] + '</b></td></tr>').join('') + '</table>'));
  }
  // 2. dynasties
  { const tit = []; let run = null; X.races.forEach(r => { if (run && run.id === r.id && run.e === r.s - 1) { run.n++; run.e = r.s; } else { run = { id: r.id, n: 1, b: r.s, e: r.s }; tit.push(run); } });
    const l1s = {}, l1c = {}, l1r = {}; S.hist.forEach(H => { const T = H.end && H.end.tables && H.end.tables[0]; const ins = new Set(T ? T.filter(r => !r[5]).map(r => r[0]) : []); ins.forEach(id => { l1s[id] = (l1s[id] || 0) + 1; l1r[id] = (l1r[id] || 0) + 1; if (l1r[id] > (l1c[id] || 0)) l1c[id] = l1r[id]; }); Object.keys(l1r).forEach(id => { if (!ins.has(+id)) l1r[id] = 0; }); });
    const tbl = (rows) => '<table class="plain almt">' + rows.join('') + '</table>';
    const top = (o, n) => Object.keys(o).sort((a, b) => (o[b][0] || o[b]) - (o[a][0] || o[a])).slice(0, n || 5);
    A.push(almBlock('Les dynasties', 'Séries et longévité en Ligue 1, et les plus longues séries de tournois (toutes ligues).',
      '<h4 class="almh4">Titres de saison consécutifs en L1</h4>' + tbl(tit.filter(r => r.n >= 1).sort((a, b) => b.n - a.n || a.b - b.b).slice(0, 5).map((r, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(r.id) + '</td><td class="r"><b>' + r.n + '</b></td><td class="r mute small">' + yr(r.b) + (r.e > r.b ? '–' + yr(r.e) : '') + '</td></tr>')) +
      '<h4 class="almh4">Le plus de saisons en L1</h4>' + tbl(top(l1s).map((id, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(+id) + '</td><td class="r"><b>' + l1s[id] + '</b> <span class="mute small">· <span>de suite</span> ' + (l1c[id] || 0) + '</span></td></tr>')) +
      '<h4 class="almh4">Plus longues séries de top 10</h4>' + tbl(top(X.t10).map((id, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(+id) + '</td><td class="r"><b>' + X.t10[id][0] + '</b> <span class="mute small">' + yr(X.t10[id][1]) + '</span></td></tr>')) +
      '<h4 class="almh4">Plus longues séries de coupures réussies</h4>' + tbl(top(X.cut).map((id, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(+id) + '</td><td class="r"><b>' + X.cut[id][0] + '</b> <span class="mute small">' + yr(X.cut[id][1]) + '</span></td></tr>'))));
  }
  // 3. GOAT
  { const P = hofLedger(), peak = id => { const g = S.G[id] || (S.old && S.old[id]); return g ? Math.max(g.op || 0, g.o || 0, ...(g.oh || []).map(x => x[1])) : 0; };
    const keys = Object.keys(P).filter(k => !/^P/.test(k) && P[k].pts > 0).map(k => ({ id: +k, p: P[k], sc: P[k].pts + peak(+k) / 40 + (tot1[k] || 0) * 0.5 })).sort((a, b) => b.sc - a.sc).slice(0, 15);
    B.push(almBlock('Le GOAT', 'Classement de tous les temps : points du Temple (victoires en L1, titres, Majeurs, Finales, saisons au n° 1), plus le sommet de carrière et les tournois au n° 1 mondial. Retraités compris.',
      '<div class="scroll"><table class="plain almt"><tr><th>#</th><th>Golfeur</th><th class="r">V L1</th><th class="r">Titres</th><th class="r">Majeurs</th><th class="r" title="Tournois au n° 1 mondial">N° 1</th><th class="r">Sommet</th></tr>' +
      keys.map((x, i) => '<tr><td class="mute">' + (i + 1) + '</td><td>' + almName(x.id) + (S.hof && S.hof.m.some(m => m.k === String(x.id)) ? ' <span title="Temple">🏛</span>' : '') + (!S.G[x.id] ? ' <span class="mute small">retraité</span>' : '') + '</td><td class="r"><b>' + x.p.w + '</b></td><td class="r">' + x.p.t1 + '</td><td class="r">' + (x.p.mj || 0) + '</td><td class="r">' + (tot1[x.id] || 0) + '</td><td class="r small">' + TIERS[scale(TIERS, peak(x.id))][1] + '</td></tr>').join('') + '</table></div>'));
  }
  // 4. remontées et effondrements
  { const cb = X.comeback.slice().sort((a, b) => b.d - a.d || b.s - a.s).slice(0, 8), cl = X.collapse.slice().sort((a, b) => b.d - a.d || b.pos - a.pos).slice(0, 8);
    const row = (x, txt) => '<tr><td>' + almName(x.id) + '</td><td class="r"><b>' + txt + '</b></td><td class="small">' + almTLink(x.s, x.t, x.l, esc(x.name)) + ' <span class="mute">· L' + (x.l + 1) + ' · ' + yr(x.s) + '</span></td></tr>';
    B.push(almBlock('Remontées et effondrements', 'Mesurés à 5 trous de la fin de la ronde finale, d’après les cartes trou par trou (conservées pour les saisons récentes).',
      '<h4 class="almh4">Les plus grandes remontées</h4>' + (cb.length ? '<table class="plain almt">' + cb.map(x => row(x, '−' + x.d)).join('') + '</table><p class="small mute" style="margin:2px 0 8px">Coups de retard sur la tête à 5 trous de la fin… et la victoire.</p>' : '<p class="small mute">Pas encore de remontée de 2 coups ou plus.</p>') +
      '<h4 class="almh4">Les pires effondrements</h4>' + (cl.length ? '<table class="plain almt">' + cl.map(x => row(x, '+' + x.d + ' → ' + (x.pos ? ord(x.pos) : 'CUT'))).join('') + '</table><p class="small mute" style="margin:2px 0 0">Seul en tête à 5 trous de la fin (avance en coups) → position finale.</p>' : '<p class="small mute">Aucun encore.</p>')));
  }
  // 5. courses au titre en L1
  { const rc = X.races.slice().sort((a, b) => a.m - b.m).slice(0, 8), ww = X.races.filter(r => r.wire);
    B.push(almBlock('Les courses au titre (Ligue 1)', 'Le plus petit écart entre le champion et le 2e, et les champions en tête du début à la fin.',
      '<table class="plain almt">' + rc.map(r => '<tr><td>' + yr(r.s) + '</td><td>' + almName(r.id) + '</td><td class="r"><b>' + r.m + '</b> <span class="mute small">pts</span></td><td class="small mute"><span>devant</span> ' + almName(r.id2) + '</td></tr>').join('') + '</table>' +
      '<h4 class="almh4">De bout en bout</h4>' + (ww.length ? '<p style="margin:0">' + ww.map(r => almName(r.id) + ' <span class="mute small">' + yr(r.s) + '</span>').join(' · ') + '</p>' : '<p class="small mute" style="margin:0">Aucun champion n’a encore mené après chaque tournoi.</p>')));
  }
  // 10. les ères
  { const ss = S.hist.filter(H => H.end).map(H => H.s); if (ss.length) { const eras = []; for (let a = ss[0]; a <= ss[ss.length - 1]; a += 10) eras.push([a, Math.min(a + 9, ss[ss.length - 1])]);
    const rows = eras.reverse().map(([a, b]) => {
      const pts = {}, nat = {}; X.wins.filter(w => w.l === 0 && w.s >= a && w.s <= b).forEach(w => { pts[w.id] = (pts[w.id] || 0) + 8; const n = almNat(w.id); if (n) nat[n] = (nat[n] || 0) + 1; });
      X.races.filter(r => r.s >= a && r.s <= b).forEach(r => { pts[r.id] = (pts[r.id] || 0) + 25; });
      const dom = Object.keys(pts).sort((x, y) => pts[y] - pts[x])[0], dn = Object.keys(nat).sort((x, y) => nat[y] - nat[x])[0];
      const n1 = {}; X.no1.filter(e => e.s >= a && e.s <= b).forEach(e => { n1[e.id] = (n1[e.id] || 0) + 1; }); const top1 = Object.keys(n1).sort((x, y) => n1[y] - n1[x])[0];
      let rs = 0, rn = 0; S.hist.forEach(H => { if (H.s < a || H.s > b) return; (H.t || []).forEach(t => { const R = t && t.lg && t.lg[0] && t.lg[0].rows; if (R) R.forEach(r => { if (r[2] != null) { rs += r[2]; rn++; } if (r[3] != null) { rs += r[3]; rn++; } }); }); });
      const cls = S.hist.map(H => H.s).filter(x => x >= a && x <= b && rcHas(x)); let bc = null; try { bc = cls.map(x => [x, rcClassScore2(x)]).sort((p, q) => q[1] - p[1])[0]; } catch (e) { }
      return '<tr><td><b>' + yr(a) + '–' + yr(b) + '</b></td><td>' + (dom ? almName(+dom) : '–') + '</td><td>' + (top1 ? almName(+top1) + ' <span class="mute small">' + n1[top1] + '</span>' : '–') + '</td><td>' + (dn ? flagVisual(dn, 16) + ' ' + esc(dn) : '–') + '</td><td>' + (bc ? '<a href="#" data-a="rclass" data-s="' + bc[0] + '">' + yr(bc[0] + 1) + '</a>' : '–') + '</td><td class="r">' + (rn ? af1(rs / rn) : '–') + '</td></tr>';
    });
    A.push(almBlock('Les ères', 'Par tranches de 10 saisons : le golfeur dominant (victoires et titres en L1), le n° 1 mondial le plus souvent, la nation la plus victorieuse en L1, la meilleure cuvée et la moyenne de score en L1 (par rapport à la normale).',
      '<div class="scroll"><table class="plain almt"><tr><th>Ère</th><th>Dominant</th><th>N° 1 mondial</th><th>Nation</th><th>Cuvée</th><th class="r">Moy. L1</th></tr>' + rows.join('') + '</table></div>')); } }
  // 11. toutes les cuvées
  { const cls = S.hist.map(H => H.s).filter(x => rcHas(x) && S.season - 1 - x >= 1); if (cls.length) {
    const v = cls.map(x => ({ s: x, sc: rcClassScore2(x), age: S.season - 1 - x })).sort((a, b) => b.sc - a.sc);
    let late = null; cls.forEach(x => { const L = rcPres(x).map(id => S.G[id] || (S.old && S.old[id] ? Object.assign({ id }, S.old[id]) : null)).filter(g => g && g.rc && g.rc.s === x && g.rc.r > 10); L.forEach(g => { const sc = rcScoreOf(g.id); if (!late || sc > late.sc) late = { id: g.id, r: g.rc.r, s: x, sc }; }); });
    B.push(almBlock('Toutes les cuvées', 'Classées par rendement réel jusqu’à maintenant (les jeunes cuvées ont encore du temps devant elles).',
      '<table class="plain almt">' + v.slice(0, 12).map((c, i) => '<tr><td class="mute">' + (i + 1) + '</td><td><a href="#" data-a="rclass" data-s="' + c.s + '">' + yr(c.s + 1) + '</a></td><td class="r"><b>' + Math.round(c.sc) + '</b> <span class="mute small">pts</span></td><td class="r mute small">' + c.age + ' <span>' + (c.age > 1 ? 'saisons' : 'saison') + '</span></td></tr>').join('') + '</table>' +
      (late ? '<p style="margin:8px 0 0">🚀 <span>Meilleur choix tardif de l’histoire</span> : ' + almName(late.id) + ' <span class="mute small">· ' + ord(late.r) + ' <span>choix des dépisteurs</span> · <span>cuvée</span> ' + yr(late.s + 1) + '</span></p>' : '')));
  } }
  return [A.join(''), B.join('')];
}
function almCareerHTML() {
  const X = almH(), A = [], B = [];
  // 7. records d'âge
  { const rows = [0, 1, 2, 3].map(l => { const ws = X.wins.filter(w => w.l === l).map(w => ({ ...w, a: almAgeAt(w.id, w.s) })).filter(w => w.a != null); if (!ws.length) return ''; const y = ws.reduce((m, w) => w.a < m.a ? w : m), o = ws.reduce((m, w) => w.a > m.a ? w : m);
      return '<tr><td><b>L' + (l + 1) + '</b></td><td>' + almName(y.id) + ' <span class="mute small">' + y.a + ' <span>ans</span> · ' + yr(y.s) + '</span></td><td>' + almName(o.id) + ' <span class="mute small">' + o.a + ' <span>ans</span> · ' + yr(o.s) + '</span></td></tr>'; }).join('');
    const fl = Object.keys(X.firstL1).map(id => ({ id: +id, s: X.firstL1[id], a: almAgeAt(+id, X.firstL1[id]) })).filter(x => x.a != null && X.firstL1[x.id] > (S.hist[0] ? S.hist[0].s : 0)).sort((a, b) => b.a - a.a).slice(0, 5);
    A.push(almBlock('Records d’âge', 'Le plus jeune et le plus vieux vainqueur de chaque ligue, et ceux qui ont atteint la L1 le plus tard.',
      '<div class="scroll"><table class="plain almt"><tr><th>Ligue</th><th>Plus jeune vainqueur</th><th>Plus vieux vainqueur</th></tr>' + rows + '</table></div>' +
      (fl.length ? '<h4 class="almh4">Arrivés en L1 le plus tard</h4><table class="plain almt">' + fl.map(x => '<tr><td>' + almName(x.id) + '</td><td class="r"><b>' + x.a + '</b> <span class="mute small">ans · ' + yr(x.s) + '</span></td></tr>').join('') + '</table>' : '')));
  }
  // 8. courbe de carrière type
  { const lv = {}, wn = {}; const add = (g, cur) => { (g.oh || []).forEach(h => { const a = g.a - (cur - h[0]); if (a < 17 || a > 50) return; const o = lv[a] || (lv[a] = [0, 0]); o[0] += h[1]; o[1]++; }); };
    Object.values(S.G).forEach(g => { if (g.id !== 0) add(g, S.season); }); Object.values(S.old || {}).forEach(o => { if (o.oh && o.a && o.s) add(o, o.s); });
    X.wins.filter(w => w.l === 0).forEach(w => { const a = almAgeAt(w.id, w.s); if (a != null) wn[a] = (wn[a] || 0) + 1; });
    const ages = Object.keys(lv).map(Number).filter(a => lv[a][1] >= 8).sort((a, b) => a - b);
    const pts = ages.map(a => [a, lv[a][0] / lv[a][1]]), pk = pts.length ? pts.reduce((m, p) => p[1] > m[1] ? p : m) : null;
    const wa = Object.keys(wn).map(Number).sort((a, b) => a - b), wmax = Math.max(1, ...wa.map(a => wn[a])), wpk = wa.reduce((m, a) => wn[a] > (wn[m] || 0) ? a : m, wa[0]);
    const bars = wa.length ? '<div class="almages">' + wa.map(a => '<div title="' + a + ' ans · ' + wn[a] + ' victoire' + (wn[a] > 1 ? 's' : '') + '"><i style="height:' + Math.round(wn[a] / wmax * 100) + '%"></i><span>' + (a % 5 === 0 ? a : '') + '</span></div>').join('') + '</div>' : '';
    const lvChart = pts.length >= 3 ? (() => { const W = isPC() ? 640 : 360, Hh = 170, x0 = 34, x1 = W - 10, lo = Math.min(...pts.map(p => p[1])), hi = Math.max(...pts.map(p => p[1])), x = a => x0 + (a - ages[0]) / Math.max(1, ages[ages.length - 1] - ages[0]) * (x1 - x0), y = v => 150 - (v - lo) / Math.max(1, hi - lo) * 135;
      return '<svg class="almsvg" viewBox="0 0 ' + W + ' ' + Hh + '"><polyline points="' + pts.map(p => x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join(' ') + '" fill="none" stroke="var(--lg1)" stroke-width="2.5"/>' + (pk ? '<circle cx="' + x(pk[0]).toFixed(1) + '" cy="' + y(pk[1]).toFixed(1) + '" r="5" fill="var(--lg1)"/><text x="' + x(pk[0]).toFixed(1) + '" y="' + (y(pk[1]) - 9).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">' + pk[0] + ' ans</text>' : '') +
        ages.filter(a => a % 5 === 0).map(a => '<text x="' + x(a).toFixed(1) + '" y="166" text-anchor="middle" font-size="11" fill="var(--mute)">' + a + '</text>').join('') + '</svg>'; })() : '<p class="small mute">Pas encore assez de données.</p>';
    A.push(almBlock('La courbe de carrière type', 'Niveau moyen des golfeurs selon l’âge (tous les golfeurs suivis), puis les victoires en L1 selon l’âge du vainqueur.',
      lvChart + (pk ? '<p class="small" style="margin:2px 0 10px"><span>Sommet moyen vers</span> <b>' + pk[0] + ' <span>ans</span></b> (' + TIERS[scale(TIERS, pk[1])][1] + ')' + (wpk != null ? ' · <span>âge le plus victorieux en L1 :</span> <b>' + wpk + ' <span>ans</span></b>' : '') + '</p>' : '') + bars));
  }
  // 9. survie des promus en L1
  { const inL1 = s => { const H = S.hist[s - 1], T = H && H.end && H.end.tables && H.end.tables[0]; return T ? new Set(T.filter(r => !r[5]).map(r => r[0])) : null; };
    const grp = { end: [], mid: [] };
    S.hist.forEach(H => { const E = H.end; if (!E) return; ((E.up && E.up[1]) || []).forEach(id => grp.end.push([id, H.s + 1])); (E.midMoves || []).filter(m => m.toL === 0 && m.type === 'up').forEach(m => grp.mid.push([m.id, H.s + 1]));   /* comme les montées de fin de saison : on regarde la saison suivante */ });
    const surv = (L, k) => { let n = 0, ok = 0; L.forEach(([id, s0]) => { const S1 = inL1(s0 + k - 1); if (!S1) return; n++; if (S1.has(id)) ok++; }); return n ? [Math.round(ok / n * 100), n] : null; };
    const cell = v => '<td class="r">' + (v ? '<b>' + v[0] + ' %</b> <span class="mute small">(' + v[1] + ')</span>' : '–') + '</td>';
    B.push(almBlock('La survie des promus en L1', 'Pourcentage des golfeurs montés en L1 qui y sont encore à la fin de leur 1re, 3e et 5e saison (entre parenthèses : le nombre de cas).',
      '<div class="scroll"><table class="plain almt"><tr><th>Montés</th><th class="r">1 saison</th><th class="r">3 saisons</th><th class="r">5 saisons</th></tr>' +
      '<tr><td>En fin de saison</td>' + cell(surv(grp.end, 1)) + cell(surv(grp.end, 3)) + cell(surv(grp.end, 5)) + '</tr><tr><td>En cours de saison</td>' + cell(surv(grp.mid, 1)) + cell(surv(grp.mid, 3)) + cell(surv(grp.mid, 5)) + '</tr></table></div>' +
      '<p class="small mute" style="margin:4px 0 0">« 1 saison » : encore en L1 à la fin de la saison qui suit leur montée.</p>'));
  }
  return [A.join(''), B.join('')];
}
const ALM_SECS = [['hist', 'Histoire'], ['car', 'Carrières'], ['score', 'Scoring'], ['tal', 'Talent'], ['coh', 'Cohortes'], ['par', 'Parité'], ['mov', 'Mouvements'], ['nat', 'Nations'], ['crs', 'Terrains'], ['arg', 'Argent']];
function vAlmanac() {
  if (S.almv !== 1) almBackfill();
  const sub = ALM_SECS.some(x => x[0] === VIEW.av) ? VIEW.av : 'score', l = VIEW.al != null ? VIEW.al : vLg();
  const h = (isPC() ? '<div class="top"><h1>Almanac</h1></div>' : '<div class="top"><h1>Historique</h1></div>' + chipRow([['records', 'Records'], ['rc', 'Cuvées'], ['arch', 'Archives des entre-saisons'], ['alm', 'Almanac']], 'alm', 'rv')) + chipRow(ALM_SECS, sub, 'almV');
  if (!almX().ss.length) return h + '<p class="mute">L’Almanac se remplit dès le premier tournoi joué.</p>';
  const P = { hist: almHistHTML, car: almCareerHTML, score: almScoringHTML, tal: almTalentHTML, coh: almCohortsHTML, par: almParityHTML, mov: almMovesHTML, nat: almNationsHTML, crs: almCoursesHTML, arg: almMoneyHTML }[sub](l);
  return h + cols(P[0], P[1]);
}

/* ---- Rendu ---- */
let LAYOUT = 'auto';
try { LAYOUT = localStorage.getItem('golf-layout') || 'auto'; } catch (e) { }
function isPC() { return LAYOUT === 'pc' || (LAYOUT === 'auto' && window.innerWidth >= 900); }
function applyLayout() { const de = document.documentElement; de.classList.toggle('pc', isPC()); de.classList.toggle('menud', typeof isMgr === 'function' && isMgr() && (!S || (VIEW && (VIEW.name === 'new' || /^pn[A-Z]/.test(VIEW.name || ''))))); de.classList.toggle('mgr', typeof isMgr === 'function' && isMgr() && !!S && !S.presim && !(VIEW && (/^pn[A-Z]/.test(VIEW.name || '') || VIEW.name === 'new'))); if (!de.classList.contains('mgr')) { const t = document.getElementById('mtop'); if (t) t.hidden = true; } }
const TABS = [['home', 'Saison'], ['leagues', 'Ligues'], ['records', 'Historique'], ['almanac', 'Almanac'], ['golfers', 'Golfeurs'], ['courses', 'Terrains'], ['watch', 'Watchlist'], ['more', 'Options']];
const TAB_OF = { voyage: 'courses', off: 'home', hofCer: 'home', cres: 'courses', rclass: 'home', home: 'home', spec: 'home', roundEnd: 'home', tournEnd: 'home', seasonEnd: 'home', journal: 'home', playerCreate: 'home', leagues: 'leagues', tourn: 'leagues', golfers: 'golfers', golfer: 'golfers', records: 'records', almanac: 'almanac', courses: 'courses', watch: 'watch', more: 'more', inbox: 'home' };
