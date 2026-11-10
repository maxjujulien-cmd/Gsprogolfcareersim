/* ============ RECORDS ============ */
/* ============ RECORDS ============
   Tout est calculé à partir de l'historique complet des tournois (retraités et anciennes carrières inclus).
   L'état est tenu à jour tournoi après tournoi ; il est reconstruit à l'ouverture d'une partie.
   Un golfeur est identifié par une clé : son numéro, ou « 0:k » pour le joueur (k = numéro de sa carrière). */
const RECN = 25, REC_QUIET = 10;
const REC_LT = [   // par ligue : tournois et rondes
  { k: 'round', t: 'Meilleure ronde', hi: -1, f: fmt, ann: 1 },
  { k: 'worst', t: 'Pire ronde', hi: 1, f: fmt, ann: 1 },
  { k: 'total', t: 'Meilleur score gagnant', hi: -1, f: fmt, ann: 1 },
  { k: 'worstWin', t: 'Pire score gagnant', hi: 1, f: fmt },
  { k: 'margin', t: 'Plus grande avance \u00e0 l\u2019arriv\u00e9e', hi: 1, f: v => v + ' coups', ann: 1 },
  { k: 'comeback', t: 'Plus grosse remont\u00e9e', hi: 1, f: v => '+' + v + ' places', ann: 1 },
  { k: 'lowCut', t: 'Coupure la plus basse', hi: -1, f: fmt },
  { k: 'highCut', t: 'Coupure la plus haute', hi: 1, f: fmt }
];
const REC_LC = [   // par ligue : carri\u00e8re
  { k: 'wins', t: 'Victoires en carri\u00e8re', hi: 1, f: v => v, ann: 1 },
  { k: 't10', t: 'Top 10 en carri\u00e8re', hi: 1, f: v => v },
  { k: 't20', t: 'Top 20 en carri\u00e8re', hi: 1, f: v => v },
  { k: 'seasonWins', t: 'Victoires en une saison', hi: 1, f: v => v, ann: 1 },
  { k: 'seasonPts', t: 'Points en une saison', hi: 1, f: v => v + ' pts', ann: 1, min: 100 },
  { k: 'streakWin', t: 'Victoires d\u2019affil\u00e9e', hi: 1, f: v => v, ann: 1, min: 2 },
  { k: 'streakT10', t: 'Top 10 d\u2019affil\u00e9e', hi: 1, f: v => v, ann: 1, min: 2 },
  { k: 'streakCut', t: 'Coupures r\u00e9ussies d\u2019affil\u00e9e', hi: 1, f: v => v, ann: 1, min: 4 },
  { k: 'ageY', t: 'Plus jeune vainqueur', hi: -1, f: v => v + ' ans', ann: 1 },
  { k: 'ageO', t: 'Plus vieux vainqueur', hi: 1, f: v => v + ' ans', ann: 1 }
];
const REC_G = [    // global : argent et exploits rares
  { k: 'earn', t: 'Gains en carri\u00e8re', hi: 1, f: v => fmtMoney(v), ann: 1 },
  { k: 'seasonEarn', t: 'Gains en une saison', hi: 1, f: v => fmtMoney(v), ann: 1 },
  { k: 'bigCheck', t: 'Plus gros ch\u00e8que', hi: 1, f: v => fmtMoney(v), ann: 1 },
  { k: 'aces', t: 'Trous d\u2019un coup en carri\u00e8re', hi: 1, f: v => v, ann: 1 },
  { k: 'albs', t: 'Albatros en carri\u00e8re', hi: 1, f: v => v, ann: 1 }
];
function playedTournaments() { let n = 0; S.hist.forEach(h => h.t.forEach(t => { if (t) n++; })); return n; }

let REC = { S: null };
function recInit() {
  REC = { S, n: 0, last: null, cur: {},
    L: [0, 1, 2, 3].map(() => ({ w: {}, t10: {}, t20: {}, pl: {}, ss: {}, stk: { c: {}, t: {}, w: {} }, ageY: {}, ageO: {}, perf: { round: [], worst: [], total: [], worstWin: [], margin: [], comeback: [], lowCut: [], highCut: [] } })),
    G: { earn: {}, se: {}, big: [], ace: {}, alb: {} } };
}
function careerIdxAt(s) { let n = 0; (S.playerCareers || []).forEach(c => { if (c.s < s) n++; }); return n; }
function recAge(id, s, c0) {         // \u00e2ge d'un golfeur pendant la saison s
  if (id === 0) { const cs = S.playerCareers || []; if (c0 < cs.length) return cs[c0].a - (cs[c0].s - s); return S.G[0] ? S.G[0].a - (S.season - s) : null; }
  const g = S.G[id]; if (g) return g.a - (S.season - s);
  const o = S.old && S.old[id]; return o ? o.a - (o.s - s) : null;
}
const recQ = (arr, v, hi) => arr.length < RECN || (hi > 0 ? v > arr[arr.length - 1].v : v < arr[arr.length - 1].v);
function recPush(arr, e, hi) {       // \u00e0 \u00e9galit\u00e9, le plus ancien reste devant
  let i = arr.length; while (i > 0 && (hi > 0 ? e.v > arr[i - 1].v : e.v < arr[i - 1].v)) i--;
  arr.splice(i, 0, e); if (arr.length > RECN) arr.pop();
}
function recBump(map, k, s, t) { const e = map[k] || (map[k] = { key: k, v: 0, s, t }); e.v++; e.s = s; e.t = t; }
function recStk(map, k, v, from, s, t) { if (v >= 1 && (!map[k] || v > map[k].v)) map[k] = { key: k, v, from: from.slice(), s, t }; }

function recAdd(t, s, ti, evs) {
  const c0 = careerIdxAt(s), key = id => id === 0 ? '0:' + c0 : String(id), name = t.name, G = REC.G;
  REC.last = [s, ti];
  for (let l = 0; l < 4; l++) {
    const lg = t.lg[l], rows = lg.rows, R = REC.L[l], P = R.perf, pay = lg.pay || {};
    rows.forEach(r => [r[2], r[3]].forEach((v, k) => {
      if (v === null) return;
      if (recQ(P.round, v, -1)) recPush(P.round, { key: key(r[0]), id: r[0], v, s, t: ti, c: name, r: k + 1, l }, -1);
      if (recQ(P.worst, v, 1)) recPush(P.worst, { key: key(r[0]), id: r[0], v, s, t: ti, c: name, r: k + 1, l }, 1);
    }));
    const w = rows[0], tot = w[2] + w[3];
    if (recQ(P.total, tot, -1)) recPush(P.total, { key: key(w[0]), id: w[0], v: tot, s, t: ti, c: name, l }, -1);
    if (recQ(P.worstWin, tot, 1)) recPush(P.worstWin, { key: key(w[0]), id: w[0], v: tot, s, t: ti, c: name, l }, 1);
    const w2 = rows[1];
    if (w2 && (w2[3] !== null || (w[3] === null && lg.one))) { const m = (w2[2] + (w2[3] || 0)) - tot;   /* v378 : les victoires d'une ronde comptent aussi */ if (m > 0 && recQ(P.margin, m, 1)) recPush(P.margin, { key: key(w[0]), id: w[0], v: m, s, t: ti, c: name, l }, 1); }
    const r1pos = {}; rankTies(rows.map(r => ({ id: r[0], tot: r[2] }))).forEach(r => { r1pos[r.id] = r.pos; });
    rows.forEach(r => { if (r[1] > 0) { const d = r1pos[r[0]] - r[1]; if (d > 0 && recQ(P.comeback, d, 1)) recPush(P.comeback, { key: key(r[0]), id: r[0], v: d, s, t: ti, c: name, l }, 1); } });
    if (lg.cut !== undefined && lg.cut !== null) {
      if (recQ(P.lowCut, lg.cut, -1)) recPush(P.lowCut, { key: null, v: lg.cut, s, t: ti, c: name, l, top: lg.one ? paidRows(rows, lg.cut).length : 0 }, -1);
      if (recQ(P.highCut, lg.cut, 1)) recPush(P.highCut, { key: null, v: lg.cut, s, t: ti, c: name, l, top: lg.one ? paidRows(rows, lg.cut).length : 0 }, 1);
    }
    rows.forEach(r => {
      const id = r[0], k = key(id), pos = r[1];
      recBump(R.pl, k, s, ti);
      if (pos === 1) recBump(R.w, k, s, ti);
      if (pos > 0 && pos <= 10) recBump(R.t10, k, s, ti);
      if (pos > 0 && pos <= 20) recBump(R.t20, k, s, ti);
      const sk = k + '|' + s, ss = R.ss[sk] || (R.ss[sk] = { key: k, s, w: 0, pts: 0, tw: ti, tp: ti });
      ss.pts += r[4]; ss.tp = ti; if (pos === 1) { ss.w++; ss.tw = ti; }
      const cur = REC.cur[k] || (REC.cur[k] = { l: -1, c: 0, t: 0, w: 0, fc: null, ft: null, fw: null, last: null });
      if (cur.l !== l) { cur.l = l; cur.c = cur.t = cur.w = 0; cur.fc = cur.ft = cur.fw = null; }   // changer de ligue remet les s\u00e9ries \u00e0 z\u00e9ro
      cur.last = [s, ti];
      cur.c = !rowMC(r, lg) ? cur.c + 1 : 0; if (cur.c === 0) cur.fc = null; else if (cur.c === 1) cur.fc = [s, ti];
      cur.t = (pos > 0 && pos <= 10) ? cur.t + 1 : 0; if (cur.t === 0) cur.ft = null; else if (cur.t === 1) cur.ft = [s, ti];
      cur.w = pos === 1 ? cur.w + 1 : 0; if (cur.w === 0) cur.fw = null; else if (cur.w === 1) cur.fw = [s, ti];
      recStk(R.stk.c, k, cur.c, cur.fc, s, ti); recStk(R.stk.t, k, cur.t, cur.ft, s, ti); recStk(R.stk.w, k, cur.w, cur.fw, s, ti);
      const p = pay[id] || 0;
      if (p) {
        const e = G.earn[k] || (G.earn[k] = { key: k, v: 0, s, t: ti }); e.v += p; e.s = s; e.t = ti;
        const se = G.se[sk] || (G.se[sk] = { key: k, v: 0, s, t: ti }); se.v += p; se.t = ti;
        if (recQ(G.big, p, 1)) recPush(G.big, { key: k, id, v: p, s, t: ti, c: name, l }, 1);
      }
    });
    const a = recAge(w[0], s, c0);
    if (a !== null) {
      const kw = key(w[0]), y = R.ageY[kw], o = R.ageO[kw];
      if (!y || a < y.v) R.ageY[kw] = { key: kw, v: a, s, t: ti, c: name };
      if (!o || a > o.v) R.ageO[kw] = { key: kw, v: a, s, t: ti, c: name };
    }
  }
  (evs || []).forEach(e => {
    if (e.kind !== 'ace' && e.kind !== 'alb') return;
    const m = e.kind === 'ace' ? G.ace : G.alb, k = key(e.id), o = m[k] || (m[k] = { key: k, v: 0 });
    o.v++; o.s = s; o.t = ti; o.l = e.l;
  });
  REC.n++;
}
function recEnsure() {
  if (REC.S === S && REC.n === playedTournaments()) return;
  recInit();
  S.hist.forEach(H => H.t.forEach((t, i) => { if (t) recAdd(t, H.s, i, t.evs); }));
}
const recCmp = hi => (a, b) => ((b.v - a.v) * hi) || (a.s - b.s) || (a.t - b.t) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
function recTop(list, hi, n) {
  if (n === 1) { const c = recCmp(hi); let b = null; for (let i = 0; i < list.length; i++) if (!b || c(list[i], b) < 0) b = list[i]; return b ? [b] : []; }
  return list.sort(recCmp(hi)).slice(0, n);
}
function recBoards(n) { recEnsure(); return recBoardsRaw(n); }
function recBoardsRaw(n) {
  const out = { L: [], G: {} }, vals = o => Object.keys(o).map(k => o[k]);
  for (let l = 0; l < 4; l++) {
    const R = REC.L[l], B = {};
    B.wins = recTop(vals(R.w).map(e => ({ key: e.key, v: e.v, s: e.s, t: e.t, pl: R.pl[e.key].v })), 1, n);
    B.t10 = recTop(vals(R.t10).map(e => ({ key: e.key, v: e.v, s: e.s, t: e.t, pl: R.pl[e.key].v })), 1, n);
    B.t20 = recTop(vals(R.t20).map(e => ({ key: e.key, v: e.v, s: e.s, t: e.t, pl: R.pl[e.key].v })), 1, n);
    B.seasonWins = recTop(vals(R.ss).filter(x => x.w > 0).map(x => ({ key: x.key, v: x.w, s: x.s, t: x.tw })), 1, n);
    B.seasonPts = recTop(vals(R.ss).filter(x => x.pts > 0).map(x => ({ key: x.key, v: x.pts, s: x.s, t: x.tp })), 1, n);
    B.streakWin = recTop(vals(R.stk.w), 1, n); B.streakT10 = recTop(vals(R.stk.t), 1, n); B.streakCut = recTop(vals(R.stk.c), 1, n);
    B.ageY = recTop(vals(R.ageY), -1, n); B.ageO = recTop(vals(R.ageO), 1, n);
    REC_LT.forEach(d => { B[d.k] = R.perf[d.k].slice(0, n); });
    out.L.push(B);
  }
  const G = REC.G;
  out.G.earn = recTop(vals(G.earn), 1, n); out.G.seasonEarn = recTop(vals(G.se), 1, n); out.G.bigCheck = G.big.slice(0, n);
  out.G.aces = recTop(vals(G.ace), 1, n); out.G.albs = recTop(vals(G.alb), 1, n);
  return out;
}
function recKeyName(key) {
  if (key === null) return '';
  if (key.charAt(1) === ':') { const k = +key.slice(2), cs = S.playerCareers || []; return k < cs.length ? cs[k].n : nameOf(0); }
  return nameOf(+key);
}
const recMyKey = () => '0:' + (S.playerCareers || []).length;
function recAnnounce(before, after) {
  const ann = [], me = recMyKey();
  const chk = (a, b, d, scope, l) => {
    if (!a || !b || !d.ann) return;
    if (d.hi > 0 ? b.v <= a.v : b.v >= a.v) return;
    if (d.min && b.v < d.min) return;
    if (a.key === b.key && b.key !== me) return;
    const nb = recKeyName(b.key), na = recKeyName(a.key), same = a.key === b.key;
    const txt = same
      ? 'Record (' + scope + ') : tu am\u00e9liores ton propre \u00ab ' + d.t.toLowerCase() + ' \u00bb : ' + d.f(b.v) + ' (avant : ' + d.f(a.v) + ').'
      : 'Record (' + scope + ') : ' + (b.key === me ? 'Tu bats' : nb + ' bat') + ' \u00ab ' + d.t.toLowerCase() + ' \u00bb avec ' + d.f(b.v) + ' (ancien : ' + d.f(a.v) + ', ' + na + ').';
    const ids = [b.key, a.key].filter((k, i, arr) => /^\d+$/.test(k) && k !== '0' && arr.indexOf(k) === i).map(Number);
    ann.push({ me: b.key === me, l, text: txt, ids });
  };
  for (let l = 0; l < 4; l++) REC_LT.concat(REC_LC).forEach(d => chk(before.L[l][d.k][0], after.L[l][d.k][0], d, LEAGUE_SHORT[l], l));
  REC_G.forEach(d => chk(before.G[d.k][0], after.G[d.k][0], d, 'carri\u00e8re', -1));
  return ann;
}
function updatePlayerStreaks(lg) {   // s\u00e9ries du joueur (onglet \u00ab Moi \u00bb)
  for (let l = 0; l < 4; l++) lg[l].rows.forEach(r => {
    if (r[0] !== 0) return;
    const sk = S.pk.cur, pos = r[1];
    sk[0] = !rowMC(r, lg[l]) ? sk[0] + 1 : 0; sk[1] = (pos > 0 && pos <= 10) ? sk[1] + 1 : 0; sk[2] = pos === 1 ? sk[2] + 1 : 0;
    S.pk.best = S.pk.best.map((b, i) => Math.max(b, sk[i]));
  });
}
function updateRecords(lg, c, evs) {
  updatePlayerStreaks(lg);
  recEnsure();
  const quiet = REC.n < REC_QUIET;    // pas d'annonces pendant la toute première saison : tout est un record
  const before = quiet ? null : recBoards(1);
  recAdd({ name: c.name, lg }, S.season, S.t, evs);
  return quiet ? [] : recAnnounce(before, recBoardsRaw(1));   // sans recEnsure : le tournoi en cours n'est pas encore dans l'historique
}
function personalRecords() {
  const h = golferHistory(0), out = {};
  let best = null, tot = null, fin = null;
  h.forEach(x => {
    [x.r1, x.r2].forEach(v => { if (v !== null && (best === null || v < best)) best = v; });
    if (x.r2 !== null && (tot === null || x.r1 + x.r2 < tot)) tot = x.r1 + x.r2;
    if (x.pos > 0 && (fin === null || x.pos < fin.pos)) fin = x;
  });
  let sp = null;
  S.hist.forEach(H => { if (H.end && H.s > careerStart(0)) { for (let l = 0; l < 4; l++) { const r = H.end.tables[l].find(z => z[0] === 0); if (r && (!sp || r[1] > sp.v)) sp = { v: r[1], s: H.s }; } } });
  const cp = getSt(0).pts; if (cp > 0 && (!sp || cp > sp.v)) sp = { v: cp, s: S.season };
  return { n: h.length, best, tot, fin, sp, wins: h.filter(x => x.pos === 1).length, t10: h.filter(x => x.pos > 0 && x.pos <= 10).length, mc: h.filter(x => x.mc).length, streaks: S.pk.best, cur: S.pk.cur };
}

