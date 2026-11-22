/* ============ PRESSION EN DIRECT, ÉLAN ET TEMPÉRAMENT (v216) ============
   Chaque trou se joue dans l'ordre, pour tout le champ en même temps :
   - élan : après un birdie (et plus encore deux de suite), un léger avantage au trou suivant ; après un double bogey
     ou deux bogeys de suite, un petit risque de déraper. Recentré : la moyenne des rondes ne bouge pas ;
   - pression en direct : en ronde finale, le tempérament (Chancelle … Clutch) agit surtout sur les trous 13 à 18,
     selon l'écart avec la tête À CE MOMENT-LÀ (même force totale qu'avant, mais au bon moment) ;
   - tempérament évolutif : chaque passage « en lutte » à 5 trous de la fin laisse des traces (victoires, effondrements),
     et le tempérament peut changer d'un cran à la fin de la saison, surtout chez les jeunes. */
const LIVE = { M1: 0.05, M2: 0.10, D: 0.12, B2: 0.05, C: -0.0095, W: 3, RAMP: Array.from({ length: 18 }, (_, k) => k < 12 ? 0.15 : k < 15 ? 0.8 : 1.6) };
LIVE.P = 0.6 / LIVE.RAMP.reduce((a, b) => a + b, 0);
const CLEVO = { T: 2, k: 0.15, keep: 0.6, drift: 0.003, up: [1.2, 1.15, 1, 0.6, 0.3], down: [0.3, 0.6, 1, 1.15, 1.2] };
function liveOn() { return !(CFG.liveSim === 0 || CFG.liveSim === false); }
function clEvoOn() { return !(CFG.clEvo === 0 || CFG.clEvo === false); }
function holeSlope(model, p, d) { const m = model[p], i = clamp(Math.round((d - m.G0) / m.ST), 0, m.N - 2); return (m.E[i + 1] - m.E[i]) / m.ST || 1; }
/* v340 : deux traits de caractère, de 1 à 5 (7 % · 18 % · 50 % · 18 % · 7 %), cachés au départ et découverts avec le temps.
   tp = tempérament : 1 Imperturbable … 5 Colérique (réaction aux birdies et surtout aux gros trous).
   mc = en tête ou en chasse : 1 Chasseur-né … 5 Meneur-né (ronde finale, près de la tête). */
const TRT = { on: 1, W: [0.07, 0.18, 0.5, 0.18, 0.07], bad: [0, 0.5, 1, 1.6, 2.3], good: [0.75, 0.88, 1, 1.25, 1.5], tail: [0.12, 0.05, 0.03], Q: 0.8, WC: 5 };   // tail : coups perdus sur les 3 trous après un gros trou (neutre ≈ 0,2)
const TP_LBL = ['Imperturbable', 'Calme', 'Neutre', 'Bouillant', 'Colérique'], MC_LBL = ['Chasseur-né', 'Bon chasseur', 'Neutre', 'Bon meneur', 'Meneur-né'];
const TP_ICO = ['😌', '🙂', '😐', '😤', '😡'], MC_ICO = ['🏹', '🏹', '😐', '🔒', '🔒'];
const TP_DESC = ['Un gros trou ne l’ébranle jamais.', 'Encaisse bien les mauvais coups.', '', 'Un mauvais trou le suit parfois au suivant.', 'Capable de séries brillantes, mais un double bogey peut le faire dérailler.'];
const MC_DESC = ['Redoutable quand il doit remonter en ronde finale.', 'Se transcende quand il chasse la tête.', '', 'Sait protéger une avance.', 'Quand il mène en ronde finale, il ferme la porte.'];
const tpKnown = g => !!(g && g.tp && (g.tpo || 0) >= [8, 18, 30, 18, 8][g.tp - 1]);   // les extrêmes se voient plus vite
const mcKnown = g => !!(g && g.mc && (g.mco || 0) >= [3, 5, 8, 5, 3][g.mc - 1]);
/* v341 : les traits sont visibles et évoluent rarement (un cran à la fois), poussés par le vécu de la saison */
function trStep(v, dir, af) {   // un cran au plus ; taux choisis pour garder 7 / 18 / 50 / 18 / 7 % à long terme (équilibre détaillé) ; dir = poussée du vécu (+1 / -1)
  const out = v === 3 ? [0.02, 0.02] : v === 2 ? [0.02, 0.056] : v === 4 ? [0.056, 0.02] : v === 1 ? [0, 0.051] : [0.051, 0];   // [vers le bas, vers le haut]
  let dn = out[0] * af * 0.75, up = out[1] * af * 0.75; if (dir > 0) up *= 3; if (dir < 0) dn *= 3;
  const u = Math.random(); return u < dn ? v - 1 : u < dn + up ? v + 1 : v;
}
function trSeason(g) {
  if (!g || g.id === 0 || !trOn()) return null; trOf(g);
  const a = g.a || 25, af = a < 25 ? 1.6 : a < 32 ? 1 : 0.6, x = g.trx || {}, out = [];
  const t2 = trStep(g.tp, 0, af); if (t2 !== g.tp) { out.push({ k: 'tp', from: g.tp, to: t2 }); g.tp = t2; }   // tempérament : change rarement, plus souvent chez les jeunes
  const lw = x.lw || 0, cw = x.cw || 0, lb = x.lb || 0, dir = lw - lb >= 2 && lw > cw ? 1 : cw >= 2 && cw > lw ? -1 : lb >= 2 ? -1 : 0;   // fin de tournoi : le vécu pousse (avances protégées, remontées, avances perdues)
  const m2 = trStep(g.mc, dir, af); if (m2 !== g.mc) { out.push({ k: 'mc', from: g.mc, to: m2 }); g.mc = m2; }
  g.trx = {};
  return out.length ? out : null;
}
function trNews(id, k, from, to) {
  const nm = nameOf(id), L = (k === 'tp' ? TP_LBL : MC_LBL)[to - 1];
  if (k === 'tp') return to < from ? (from > 3 ? '😌 ' + nm + ' se calme : son tempérament devient ' : '😌 ' + nm + ' a appris à garder son calme : son tempérament devient ') + L + '.'
    : (from < 3 ? '😤 ' + nm + ' perd un peu de son sang-froid : son tempérament devient ' : '😤 ' + nm + ' a la mèche plus courte : son tempérament devient ') + L + '.';
  return to > from ? (from < 3 ? '🔒 ' + nm + ' chasse moins bien qu’avant : il devient ' : '🔒 ' + nm + ' sait maintenant fermer la porte : il devient ') + L + ' en fin de tournoi.'
    : (from > 3 ? '🏹 ' + nm + ' protège moins bien ses avances : il devient ' : '🏹 ' + nm + ' a pris goût aux remontées : il devient ') + L + ' en fin de tournoi.';
}
function trRoll() { const u = Math.random(); let c = 0; for (let i = 0; i < 5; i++) { c += TRT.W[i]; if (u < c) return i + 1; } return 3; }
function trOf(g) { if (!g) return null; if (g.id === 0) return g; if (g.tp == null) g.tp = trRoll(); if (g.mc == null) g.mc = trRoll(); return g; }
const trOn = () => TRT.on && !(CFG.traits2 === 0 || CFG.traits2 === false);
function momShift(h, pars, g) {   // en coups, d'après les trous déjà joués de la ronde ; v340 : selon le tempérament
  const t = trOn() && g && g.id !== 0 && trOf(g).tp ? g.tp - 1 : 2, kb = TRT.bad[t], kg = TRT.good[t];
  const n = h.length; let b = 0, bg = 0;
  for (let i = n - 1; i >= 0 && h[i] - pars[i] <= -1; i--) b++;
  for (let i = n - 1; i >= 0 && h[i] - pars[i] >= 1; i--) bg++;
  let tl = 0; for (let d = 1; d <= 3 && d <= n && !tl; d++) if (h[n - d] - pars[n - d] >= 2) tl = TRT.tail[d - 1];   // le plus récent seulement (pas d'effet boule de neige)   // v341 : la suite d'un gros trou, selon le tempérament
  return (b >= 2 ? -LIVE.M2 : b === 1 ? -LIVE.M1 : 0) * kg + (tl + (bg >= 2 ? LIVE.B2 : 0)) * kb + LIVE.C;
}
/* un trou : m = coups de retard sur la tête avant ce trou (ronde finale seulement), null sinon */
function liveHole(model, pars, idx, hv, k, g, d, h, m) {
  const p = pars[k], tm = talHoleMods(model, pars, d, g), on = liveOn();
  const base = d + (idx ? indexShift(idx[k]) : 0) + (hv ? hv[k] || 0 : 0) + (tm && tm.sh ? tm.sh[p] : 0);
  let s = on ? momShift(h, pars, g) : 0;
  if (on && m != null && g && g.cl) s += -g.cl * LIVE.P * Math.exp(-Math.max(0, m) / LIVE.W) * LIVE.RAMP[k];
  if (on && m != null && g && g.id !== 0 && trOn() && trOf(g).mc !== 3) {   // v340 : meneur (protège une avance) ou chasseur (remonte)
    const v = g.mc - 3; s += (m <= 0 ? -v * Math.exp(-Math.max(0, -m - 2) / 3) : v * Math.exp(-m / TRT.WC)) * TRT.Q * LIVE.P * LIVE.RAMP[k];
  }
  let x = simHole(model, p, s ? base + s / holeSlope(model, p, base) : base, extRates(g, model));
  if (tm && tm.scr && x >= p + 2 && Math.random() < tm.scr) x = p + 1;
  return x;
}
/* Fait avancer un groupe jusqu'à k trous joués, trou par trou. H[id] = trous déjà joués de la ronde ; D[id] = cible de la ronde ;
   base[id] = score avant la ronde ; last = ronde finale (la pression compte) ; extTot(j) = autres scores au classement (le joueur). */
function liveFill(model, pars, idx, hv, ids, G, D, base, last, H, k, extTot) {
  if (!ids.length) return H;
  ids.forEach(id => { if (!H[id]) H[id] = []; });
  let j0 = 18; ids.forEach(id => { if (H[id].length < j0) j0 = H[id].length; });
  const press = last && liveOn();
  for (let j = j0; j < k; j++) {
    let ld = Infinity; const tot = {};
    let l2 = Infinity;   // v340 : deuxième meilleur total, pour mesurer l'avance du meneur (m négatif)
    if (press) { const all = []; ids.forEach(id => { tot[id] = (base ? base[id] || 0 : 0) + relTo(H[id], pars, Math.min(j, H[id].length)); all.push(tot[id]); }); if (extTot) extTot(j).forEach(t => all.push(t)); all.sort((a, b) => a - b); ld = all[0]; l2 = all.length > 1 ? all[1] : ld; }
    ids.forEach(id => { const h = H[id]; if (h.length > j) return; const mm = press ? (tot[id] === ld && l2 > ld ? ld - l2 : tot[id] - ld) : null; h.push(liveHole(model, pars, idx, hv, j, G[id], D[id], h, mm)); });
  }
  return H;
}
/* v217 — départs décalés : groupes de 4, toutes les 10 minutes, environ 14 minutes par trou (0,714 trou entre deux groupes).
   Ronde 1 : ordre tiré au hasard ; ronde finale : les meneurs en dernier. La pression se mesure contre le tableau affiché AU MOMENT où le golfeur joue. */
const TEE = { SZ: 4, MIN: 10, HOLE: 14, START: 7 * 60 };
TEE.INT = TEE.MIN / TEE.HOLE; TEE.MIN2 = 8;   /* v383 : lm 3 = 2 groupes par heure de départ, aux 8 minutes (ronde unique, ronde 1) */
const teeGS = (g, lm) => lm === 3 ? Math.floor(g / 2) * TEE.MIN2 / TEE.HOLE : g * TEE.INT;
function teeOn() { return !(CFG.teeTimes === 0 || CFG.teeTimes === false); }
/* ordre de départ : base = scores avant la ronde (meneurs en dernier) ; key = clé de tri facultative (plus petit = part en dernier) */
function teeOrder(ids, base, key) {
  const a = shuffled(ids);
  if (base) a.sort((x, y) => (base[y] || 0) - (base[x] || 0));
  else if (key) a.sort((x, y) => key(y) - key(x));
  return a;
}
/* groupe de la i-e place sur n : les groupes sont complets à partir de la fin (le premier groupe prend le reste) */
function teeGi(n, i, sz) { sz = sz || TEE.SZ; const nG = Math.ceil(n / sz); return nG - 1 - Math.floor((n - 1 - i) / sz); }
/* v319 : groupes de 3 ou 4 (jamais un golfeur seul). lm = 1 : les groupes de 3 sont placés au hasard (ronde 1, tirée
   d'après l'ordre lui-même, donc toujours le même) ; lm = 2 : les groupes de 3 partent en dernier (ronde 2, ronde unique, Finale).
   lm absent : anciennes parties (le premier groupe prend le reste). */
const TEE_LAY = new WeakMap();
function teeLay(order, lm) {
  let C = TEE_LAY.get(order); if (!C) TEE_LAY.set(order, C = {});
  const key = order.length + ':' + lm; if (C[key]) return C[key];
  const n = order.length, nG = Math.max(1, Math.ceil(n / TEE.SZ)), base = Math.floor(n / nG), ex = n % nG;
  const big = Array.from({ length: nG }, (_, g) => g < ex);   // lm 2 : les gros groupes d'abord, les groupes de 3 à la fin
  if (lm !== 2 && ex && ex < nG) {
    let h = 2166136261; order.forEach(id => { h = Math.imul(h ^ (id + 1), 16777619) >>> 0; });
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; return ((h ^= h >>> 16) >>> 0) / 4294967296; };
    for (let g = nG - 1; g > 0; g--) { const j = Math.floor(rnd() * (g + 1)); [big[g], big[j]] = [big[j], big[g]]; }
  }
  const gi = []; big.forEach((b, g) => { for (let k = 0; k < base + (b ? 1 : 0); k++) gi.push(g); });
  return (C[key] = gi);
}
const teeGix = (order, i, lm) => lm ? teeLay(order, lm)[i] : teeGi(order.length, i);
function teeStarts(order, sz, lm) { const st = {}, n = order.length; order.forEach((id, i) => { st[id] = lm && !sz ? teeGS(teeLay(order, lm)[i], lm) : teeGi(n, i, sz) * TEE.INT; }); return st; }
function teeGroups(order, lm) { const G = []; order.forEach((id, i) => { const g = teeGix(order, i, lm); (G[g] = G[g] || []).push(id); }); return G; }
function teeFill(model, pars, idx, hv, ids, G, D, base, last, H, T, extTot, st) {
  const press = last && liveOn(), lim = T + 1e-6;
  const ev = [];
  ids.forEach(id => { const s0 = st[id] || 0; for (let j = H[id].length; j < 18; j++) { if (s0 + j + 1 > lim) break; ev.push([s0 + j, id, j]); } });
  if (!press) { ev.forEach(e => { const h = H[e[1]]; if (h.length === e[2]) h.push(liveHole(model, pars, idx, hv, e[2], G[e[1]], D[e[1]], h, null)); }); return H; }
  ev.sort((a, b) => a[0] - b[0] || a[2] - b[2]);
  for (let i = 0; i < ev.length;) {
    const t = ev[i][0]; let e2 = i; while (e2 < ev.length && ev[e2][0] - t < 1e-6) e2++;
    let ld = Infinity; const tot = {};
    ids.forEach(id => { const n = clamp(Math.floor(t - (st[id] || 0) + 1e-6), 0, Math.min(18, H[id].length)); tot[id] = (base ? base[id] || 0 : 0) + relTo(H[id], pars, n); if (tot[id] < ld) ld = tot[id]; });
    if (extTot) extTot(t).forEach(v => { if (v < ld) ld = v; });
    for (; i < e2; i++) { const id = ev[i][1], j = ev[i][2], h = H[id]; if (h.length !== j) continue; h.push(liveHole(model, pars, idx, hv, j, G[id], D[id], h, tot[id] - ld)); }
  }
  return H;
}
/* Ta ligue : départs de la ronde en cours. c.teeR[r] = { o: ordre des départs, anc: départ de référence (toi, sinon le dernier groupe) } */
function teeCur(c, r) {
  c = c || S.cur; if (!c || !teeOn() || !c.teeR) return null;
  const tr = c.teeR[r == null ? c.r : r]; if (!tr) return null;
  if (!tr._st) Object.defineProperty(tr, '_st', { value: teeStarts(tr.o, null, tr.lm), enumerable: false, writable: true });
  return tr;
}
const teeSim = c => /^sim/.test(c.phase || '');
/* l'horloge : k = trous joués par la référence (toi, ou le dernier groupe si tu regardes) ; c.tx = trous ajoutés après ta ronde */
function teeT(c, k) { const tr = teeCur(c); if (!tr) return null; if (c.tx >= 999) return Infinity; if (k <= 0 && c.pw != null && c.pw < tr.anc) return c.pw + Math.min(0, k); return tr.anc + k + (k >= 18 ? c.tx || 0 : 0); }   // v266 : c.pw = l'horloge avant ton départ (la ronde commence avec le 1er groupe)
function teeHoles(st, T, id) { return T === Infinity ? 18 : clamp(Math.floor(T - (st[id] || 0) + 1e-6), 0, 18); }
function teeClock(t) { return teeTimeM(TEE.START + Math.round(t * TEE.HOLE)); }
function teeTime(g, lm) { if (lm === undefined) { try { const tr = !inPN() && S && S.cur && teeCur(S.cur); lm = tr ? tr.lm : null; } catch (e) { lm = null; } } return teeTimeM(TEE.START + (lm === 3 ? Math.floor(g / 2) * TEE.MIN2 : g * TEE.MIN)); }
function teeTimeM(m) { const hh = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return LANG === 'en' ? ((hh - 1) % 12 + 1) + ':' + mm + (hh < 12 ? '\u00a0AM' : '\u00a0PM') : hh + '\u00a0h\u00a0' + mm; }
const teeGrp = (tr, id) => { const i = tr.o.indexOf(id); return i < 0 ? -1 : teeGix(tr.o, i, tr.lm); };
const teeNG = tr => Math.ceil(tr.o.length / TEE.SZ);
/* encore du monde sur le terrain une fois ta ronde (ou celle de la référence) terminée ? */
function teeWaiting(c) { c = c || S.cur; const tr = teeCur(c); if (!tr) return false; const T = teeT(c, 18); return tr.o.some(id => teeHoles(tr._st, T, id) < 18); }
/* Ordre des départs d'une ronde de ta ligue (ronde 1 et ronde unique : au hasard ; Finale : selon les points de la saison ; ronde 2 : meneurs en dernier) */
function makeTee(r) {
  const c = S.cur; if (!c || !teeOn()) return;
  c.teeR = c.teeR || []; c.teeSeen = c.teeSeen || [];
  const ids = (r === 0 ? fld(c) : c.alive || []).slice();
  const o = r === 1 ? teeOrder(ids, c.r1) : c.fin ? teeOrder(ids, null, id => -(S.st[id] ? lgSt(id).pts || 0 : 0)) : teeOrder(ids, null);
  const lm = r === 1 || c.fin ? 2 : 3;   // v319 : groupes de 3 en dernier quand l'ordre suit le classement (v367 : plus en ronde unique, tirée au hasard)
  const st = teeStarts(o, null, lm), anc = st[0] != null ? st[0] : teeGS(Math.ceil(o.length / TEE.SZ) - 1, lm);
  const tr = { o, anc, lm }, feat = teeFeature(c, r, o, lm);
  if (feat) tr.f = feat;
  c.teeR[r] = tr; c.teeSeen[r] = 0; c.tx = 0; c.pw = null;   // v272 : chaque ronde recommence avec le premier groupe
}
/* v316 : groupes vedettes (4 au plus), chacun avec ses raisons. En début de saison, on mise sur ce qui ne dépend pas de la saison
   (World Ranking, handicap, watchlist, champion en titre, nouveau promu) ; plus la saison avance, plus le classement compte
   (meneur, top 10, points cumulés, surprise de la saison). Les points comptés sont ceux gagnés dans la ligue (lgSt) : un promu
   n'arrive pas avec ses points de la ligue d'en dessous. Ton rival est signalé à part s'il joue. */
const FEAT_MAX = 4;
function featNew(id, l) {   // premier tournoi dans cette ligue après une promotion (en cours de saison ou à l'intersaison)
  const g = S.G[id]; if (!g) return false;
  const m = g.mv, ms = m && m.moves && m.moves.length ? m.moves : null, mv = ms ? ms[ms.length - 1] : null;
  if (mv) return mv.toL === l && mv.type === 'up' && !!(m.snap && m.snap.n != null) && getSt(id).n === m.snap.n;
  return !!(g.lt && g.lt.s === S.season - 1 && g.lt.t === 'promo' && getSt(id).n === 0);
}
function featSeasonInfo(l) {
  const H = S.hist[S.season - 1], T = H && H.t ? H.t : [];
  let played = 0, lastW = null;
  T.forEach(t => { if (!t || !t.lg || !t.lg[l] || !t.lg[l].rows || !t.lg[l].rows.length) return; played++; lastW = t.lg[l].rows[0][0]; });
  return { played, lastW, p: Math.min(1, played / N_TOURN) };
}
function teeFeature(c, r, o, lm) {
  const inF = new Set(o), l = c.pl, G = teeGroups(o, lm), nG = G.length, f = {};
  const R = G.map(() => []), add = (gi, x) => { if (gi >= 0) R[gi].push(x); }, gOf = id => teeGrp({ o, lm }, id);
  try {
    const si = featSeasonInfo(l), p = si.p, wA = 1 - 0.55 * p;   // wA : poids de ce qui ne dépend pas de la saison
    const real = id => id === 0 || !!S.G[id];
    if (r === 1) add(nG - 1, { k: 'last', s: 1000 });
    // champion en titre (même tournoi, saison dernière, dans cette ligue)
    // v379 : le vainqueur de la dernière édition sur CE terrain (même nom) dans cette ligue — les terrains changent de case d'une saison à l'autre
    let ch = null, chS = null; { const nm = normName(c.name || ''); for (let si = S.season - 2; si >= 0 && ch == null; si--) { const H = S.hist[si]; if (!H || !H.t) continue;
      const hit = H.t.map((t, ti) => [t, ti]).filter(([t]) => t && normName(t.name || '') === nm && t.lg && t.lg[l] && t.lg[l].rows && t.lg[l].rows.length).pop(); if (hit) { ch = hit[0].lg[l].rows[0][0]; chS = H.s; } } }
    if (ch != null && inF.has(ch) && real(ch)) add(gOf(ch), { k: 'champ', id: ch, ys: chS, s: chS === S.season - 1 ? 70 : 50 });
    // nouveau promu qui fait ses débuts dans la ligue
    let nN = 0; G.forEach((g, gi) => { const ids = g.filter(id => featNew(id, l)); if (ids.length) add(gi, { k: 'new', ids, s: (nN++ ? 26 : 62) + 4 * (ids.length - 1) }); });   // plusieurs promus : un seul passe en priorité
    // World Ranking combiné (top 100 publié)
    const WRk = worldRanks(), wrOf = id => { const x = WRk[id]; return x && x <= WR_TOP ? x : null; };
    const wrS = G.map(g => g.reduce((a, id) => a + (wrOf(id) ? (WR_TOP + 1 - wrOf(id)) / WR_TOP : 0), 0));
    const wb = wrS.indexOf(Math.max(...wrS));
    if (wb >= 0 && wrS[wb] >= 0.9) add(wb, { k: 'wr', ids: G[wb].filter(wrOf).sort((a, b) => wrOf(a) - wrOf(b)), s: 58 * wA + 6 * Math.min(1, wrS[wb] - 0.9) });
    // handicap combiné le plus bas (moyenne du groupe, au moins 3 golfeurs)
    const hx = id => { const h = hcHolder(id); return h && h.hc && h.hc.x != null ? h.hc.x : null; };
    const hA = G.map(g => { const v = g.map(hx).filter(x => x != null); return v.length >= 3 && v.length >= g.length - 1 ? v.reduce((a, b) => a + b, 0) / v.length : null; });
    let hb = -1; hA.forEach((v, i) => { if (v != null && (hb < 0 || v < hA[hb])) hb = i; });
    if (hb >= 0 && hb !== wb) add(hb, { k: 'hcp', v: hA[hb], s: 52 * wA });
    else if (hb >= 0) add(hb, { k: 'hcp', v: hA[hb], s: 30 * wA });
    // watchlist : au moins 2 golfeurs de tes listes dans le même groupe
    const WL = new Set(S.wl && S.wl.lists ? wlIds('all') : []);
    G.forEach((g, gi) => { const ids = g.filter(id => id !== 0 && WL.has(id)); if (ids.length >= 2) add(gi, { k: 'wl', ids, s: 48 + 6 * (ids.length - 2) }); });
    // la saison (pèse de plus en plus lourd)
    if (si.played) {
      const rk = rankAll(l), pos = {}; rk.forEach((x, i) => { pos[x.id] = { r: i + 1, pts: x.pts }; });   // v384 : les promus en cours de saison gardent leur rang (un meneur parti en L1 reste devant)
      const ld = rk[0];
      if (ld && ld.pts > 0 && inF.has(ld.id)) add(gOf(ld.id), { k: 'lead', id: ld.id, s: 25 + 55 * p });
      if (si.lastW != null && inF.has(si.lastW) && real(si.lastW)) add(gOf(si.lastW), { k: 'win', id: si.lastW, s: 42 + 16 * p });
      if (si.played >= 2) {
        G.forEach((g, gi) => { const ids = g.filter(id => pos[id] && pos[id].r <= 10 && pos[id].pts > 0).sort((a, b) => pos[a].r - pos[b].r); if (ids.length >= 2) add(gi, { k: 'top10', ids, rs: ids.map(id => pos[id].r), s: 20 + 50 * p + 5 * (ids.length - 2) }); });
        const pS = G.map(g => g.reduce((a, id) => a + (pos[id] ? Math.max(0, pos[id].pts) : 0), 0)), pb = pS.indexOf(Math.max(...pS));
        if (pb >= 0 && pS[pb] > 0) add(pb, { k: 'pts', v: Math.round(pS[pb]), s: 15 + 45 * p });
      }
      if (si.played >= 4) {   // surprise : un golfeur dont le niveau de début de saison le plaçait loin, mais dans le top 10 du classement
        const lv = id => S.G[id] ? shownO(S.G[id]) : null, ex = {};
        S.L[l].filter(id => lv(id) != null).sort((a, b) => lv(b) - lv(a) || a - b).forEach((id, i) => { ex[id] = i + 1; });
        const lim = Math.max(15, Math.round(S.L[l].length * 0.4));
        const sp = o.filter(id => pos[id] && pos[id].r <= 10 && pos[id].pts > 0 && ex[id] >= lim).sort((a, b) => (ex[b] - pos[b].r) - (ex[a] - pos[a].r))[0];
        if (sp != null) add(gOf(sp), { k: 'surp', id: sp, v: pos[sp].r, e: ex[sp], s: 40 + 40 * p + Math.min(10, (ex[sp] - pos[sp].r) / 5) });
      }
    }
  } catch (e) { }
  // v380 : nouvelles raisons — revanche, à domicile, séries, dernière chance, course au titre, phénomène
  try {
    const si = featSeasonInfo(l), p = si.p, real = id => id === 0 || !!S.G[id], grpOf = new Map(); G.forEach((g, gi) => g.forEach(id => grpOf.set(id, gi)));
    // 1 · Revanche : 1er et 2e (ou prolongation) d'un tournoi récent de cette ligue, de nouveau ensemble
    { const recent = []; for (let si2 = S.season - 1; si2 >= Math.max(0, S.season - 2) && recent.length < 5; si2--) { const H = S.hist[si2]; if (!H || !H.t) continue; for (let ti = H.t.length - 1; ti >= 0 && recent.length < 5; ti--) { const t = H.t[ti]; if (t && t.lg && t.lg[l] && t.lg[l].rows && t.lg[l].rows.length) recent.push([t, t.lg[l], H.s]); } }
      const seen = new Set();
      recent.forEach(([t, L, ys], age) => { const w = L.rows[0][0], tot = r => r[2] + (r[3] || 0), wt = tot(L.rows[0]);
        L.rows.filter(r => r[1] === 2 || (L.playoff && r[0] !== w && tot(r) === wt)).forEach(r => { const o = r[0], gi = grpOf.get(w);
          if (gi == null || grpOf.get(o) !== gi || !real(w) || !real(o) || seen.has(gi)) return; seen.add(gi);
          add(gi, { k: 'rev', ids: [w, o], c: t.name, ys, po: !!(L.playoff && tot(r) === wt), s: 56 - 6 * age }); }); }); }
    // 6 · À domicile : golfeurs du pays du terrain (le mieux classé)
    { const g0 = geoOf(c.name), cc = g0 && g0.cc;
      if (cc) { let en = ''; try { en = new Intl.DisplayNames(['en'], { type: 'region' }).of(cc); } catch (e) { }
        const home = n => n && (n === en || (cc === 'GB' && /^(England|Scotland|Wales|Northern Ireland)$/.test(n)) || (cc === 'US' && /^(United States|USA)$/.test(n)));
        const loc = o.filter(id => id !== 0 && S.G[id] && home(S.G[id].nat)).sort((a, b) => S.G[b].o - S.G[a].o);
        if (loc.length && loc.length <= o.length * 0.5) { const top = loc[0], gi = gOf(top), ids = G[gi].filter(id => loc.includes(id)); add(gi, { k: 'home', ids, cn: geoCountry(cc), nat: S.G[top].nat, s: 46 + 4 * (ids.length - 1) }); } } }
    // 7 · Séries en jeu (coupures, top 10) ou disette (coupures ratées de suite)
    { try { recEnsure(); } catch (e) { }
      const c0 = (S.playerCareers || []).length, kOf = id => id === 0 ? '0:' + c0 : String(id), best = new Map();
      o.forEach(id => { if (!real(id)) return; const cu = REC.cur && REC.cur[kOf(id)], st = getSt(id), gi = grpOf.get(id); let x = null;
        if (cu && cu.l === l && cu.t >= 3) x = { k: 'stk', id, t: 't10', n: cu.t, s: 36 + 5 * Math.min(6, cu.t - 3) };
        else if (cu && cu.l === l && cu.c >= 7) x = { k: 'stk', id, t: 'cut', n: cu.c, s: 32 + 2 * Math.min(10, cu.c - 7) };
        else if (st && (st.mcs || 0) >= 4) x = { k: 'dry', id, n: st.mcs, s: 30 + 3 * Math.min(6, st.mcs - 4) };
        if (x && (!best.has(gi) || best.get(gi).s < x.s)) best.set(gi, x); });
      [...best.entries()].sort((a, b) => b[1].s - a[1].s).slice(0, 2).forEach(([gi, x]) => add(gi, x)); }
    // 8 · Dernière chance : 3 derniers tournois, zone de relégation (L1 à L3) ou retraite forcée qui guette (L4)
    if (si.played >= N_TOURN - 3) {
      const rk = rankAll(l).filter(x => !x.gh), n = rk.length, zone = new Set(rk.slice(Math.max(0, n - relBot())).map(x => x.id)), risk = [];
      o.forEach(id => { if (id === 0 || !S.G[id]) return; if (l < 3 && zone.has(id)) risk.push(id); else if (l === 3 && forcedRisk(S.G[id], l)) risk.push(id); });
      const byG = new Map(); risk.forEach(id => { const gi = grpOf.get(id); byG.set(gi, (byG.get(gi) || []).concat(id)); });
      [...byG.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 1).forEach(([gi, ids]) => add(gi, { k: 'last3', ids, rel: l < 3, left: N_TOURN - si.played, s: 40 + 6 * (ids.length - 1) + 10 * p }));
    }
    // 9 · Course au titre : le meneur du classement avec un golfeur du top 5
    if (si.played >= 2) {
      const rk = rankAll(l), ld = rk[0];   // v384 : promus compris
      if (ld && ld.pts > 0 && inF.has(ld.id)) { const gi = grpOf.get(ld.id), mates = rk.slice(1, 5).filter(x => grpOf.get(x.id) === gi);
        if (mates.length) add(gi, { k: 'race', ids: [ld.id].concat(mates.map(x => x.id)), rs: [1].concat(mates.map(x => rk.indexOf(x) + 1)), gap: ld.pts - mates[0].pts, s: 34 + 50 * p }); }
    }
    // 12 · Le phénomène : potentiel exceptionnel, 1re ou 2e saison chez les pros
    { const ph = o.filter(id => id !== 0 && S.G[id] && (S.G[id].cs || 0) <= 1 && potOf(S.G[id]) >= POTS.length - 2).sort((a, b) => S.G[b].p - S.G[a].p);
      if (ph.length) { const gi = grpOf.get(ph[0]); add(gi, { k: 'phen', id: ph[0], gen: potOf(S.G[ph[0]]) >= POTS.length - 1, s: 44 }); } }
  } catch (e) { }
  const sc = R.map(rs => { if (!rs.length) return 0; const v = rs.map(x => x.s).sort((a, b) => b - a); return v[0] + 0.35 * v.slice(1).reduce((a, b) => a + b, 0); });
  const pick = sc.map((s, gi) => [gi, s]).filter(x => x[1] >= 25).sort((a, b) => b[1] - a[1]).slice(0, FEAT_MAX).map(x => x[0]).sort((a, b) => a - b);
  if (pick.length) f.fs = pick.map(gi => ({ g: gi, rs: R[gi].sort((a, b) => b.s - a.s).map(x => { const y = Object.assign({}, x); delete y.s; return y; }) }));
  try { const A = golferH2H(0).filter(x => inF.has(x.id) && S.G[x.id] && (x.t10 >= 3 || x.ow + x.ol > 0)).sort((a, b) => (b.t10 + (b.ow + b.ol) * 3) - (a.t10 + (a.ow + a.ol) * 3)); if (A.length) f.rv = A[0].id; } catch (e) { }
  return f.fs || f.rv != null ? f : null;
}
/* anciennes sauvegardes : { t, id } → liste de groupes vedettes */
function teeFeats(tr) {
  const f = tr.f || {}; if (f.fs) return f.fs;
  if (f.id == null) return [];
  const gi = teeGrp(tr, f.id); if (gi < 0) return [];
  return [{ g: gi, rs: [f.t === 'last' ? { k: 'last' } : { k: f.t === 'champ' ? 'champ' : 'lead', id: f.id }] }];
}
const liveRound = (model, pars, idx, hv, ids, G, D, base, last, st) => {
  if (teeOn()) { const H = {}; ids.forEach(id => { H[id] = []; }); return teeFill(model, pars, idx, hv, ids, G, D, base, last, H, Infinity, null, st || teeStarts(teeOrder(ids, last ? base : null), null, last && base ? 2 : 3)); }
  return liveFill(model, pars, idx, hv, ids, G, D, base, last, {}, 18, null);
};
/* Ta ligue pendant un tournoi : les trous des adversaires se jouent au moment où ils sont dévoilés (tes vrais scores comptent au classement) */
function aiFill(k, full) {
  const c = S.cur; if (!c || !c.ai || !c.aiD) return;   // anciennes parties : rondes déjà complètes
  const ids = (c.r === 0 ? fld(c) : c.alive || []).filter(id => c.aiD[id] != null && c.ai[id]);
  if (!ids.length || ids.every(id => c.ai[id].length >= 18)) return;
  const last = c.r === 1 || !!S.one, base = c.r === 1 ? c.r1 : null;
  const meIn = S.mode !== 'sim' && (c.r === 0 ? fld(c) : c.alive || []).includes(0);
  const tr = teeCur(c);
  if (tr) {   // v217 : chaque groupe avance selon son heure de départ ; la pression se mesure contre le tableau du moment
    const st = tr._st, T = full ? Infinity : teeT(c, k);
    const ext = meIn ? t => { const h = myHoles(c) || []; return [(base ? base[0] || 0 : 0) + relTo(h, c.pars, Math.min(h.length, teeHoles(st, t, 0)))]; } : null;
    teeFill(MODEL, c.pars, c.index, c.ctx.hv && c.ctx.hv[c.r], ids, S.G, c.aiD, base, last, c.ai, T, ext, st);
    return;
  }
  if (!full && ids.every(id => c.ai[id].length >= k)) return;
  if (full) k = 18;
  const ext = meIn ? j => { const h = myHoles(c) || []; return [(base ? base[0] || 0 : 0) + relTo(h, c.pars, Math.min(j, h.length))]; } : null;
  liveFill(MODEL, c.pars, c.index, c.ctx.hv && c.ctx.hv[c.r], ids, S.G, c.aiD, base, last, c.ai, Math.min(18, k), ext);
}
/* Expérience sous pression : en lutte (à 2 coups ou moins de la tête) à 5 trous de la fin de la ronde finale */
function clExpTourn(lg, pars) {
  if (!clEvoOn() || !lg) return;
  lg.forEach(L => {
    if (!L || !L.rows || !L.rows.length || !L.h) return;
    const one = !!L.one, snap = {}, pos = {};
    L.rows.forEach(r => { pos[r[0]] = r[1]; 
      if (!one && r[3] === null) return; const s = L.h[r[0]]; if (!s) return; const h = decHoles(s, one ? 0 : 18); if (!h) return; snap[r[0]] = (one ? 0 : r[2]) + relTo(h, pars, 13); });
    const v = Object.entries(snap).sort((a, b) => a[1] - b[1]); if (v.length < 2) return;
    const ld = v[0][1], solo = v[1][1] > ld, gap = v[1][1] - ld;
    v.forEach(([k, t]) => {
      const id = +k, m = t - ld; if (m > 2 || id === 0) return; const g = S.G[id]; if (!g) return;
      const p = pos[id]; let pt = 0;
      if (p === 1) pt = m >= 2 ? 3 : 2; else if (m === 0 && solo) pt = gap >= 2 ? -4 : -3; else if (m === 0) pt = -1; else if (p > 3 || p === 0) pt = -1;
      g.cx = (g.cx || 0) + pt; g.cxn = (g.cxn || 0) + 1; if (p === 1) g.cxw = (g.cxw || 0) + 1; g.mco = (g.mco || 0) + 1;   // v340 : observations meneur/chasseur
      { const X = g.trx = g.trx || {}; if (m === 0 && solo) { if (p === 1) X.lw = (X.lw || 0) + 1; else X.lb = (X.lb || 0) + 1; } else if (m >= 1 && p === 1) X.cw = (X.cw || 0) + 1; }   // v341
    });
  });
}
/* fin de saison : le tempérament peut changer d'un cran (jeunes plus malléables, vétérans presque figés) */
function clSeason(g) {
  if (!g || g.id === 0 || !clEvoOn()) return null;
  const cx = g.cx || 0, a = g.a || 25, af = a <= 26 ? 1.3 : a <= 31 ? 1 : a <= 35 ? 0.6 : 0.35, cl = g.cl || 0, li = cl + 2;
  let dir = 0, pr = 0;
  if (cx >= CLEVO.T) { dir = 1; pr = Math.min(0.75, CLEVO.k * (cx - CLEVO.T + 1)) * af * CLEVO.up[li]; }
  else if (cx <= -CLEVO.T) { dir = -1; pr = Math.min(0.75, CLEVO.k * (-cx - CLEVO.T + 1)) * af * CLEVO.down[li]; }
  if (!dir && Math.random() < CLEVO.drift) { dir = Math.random() < 0.5 ? 1 : -1; pr = 1; }   // déclic (ou doute) sans raison visible
  let out = null;
  if (dir && Math.random() < pr) { const nc = clamp(cl + dir, -2, 2); if (nc !== cl) { g.clh = g.clh || []; if (!g.clh.length) g.clh.push([null, cl]); g.clh.push([S.season, nc]); g.cl = nc; g.cx = 0; out = { from: cl, to: nc }; } }
  g.cx = Math.trunc((g.cx || 0) * CLEVO.keep);
  return out;
}
const CL_ICO = { '-2': '😰', '-1': '😬', '0': '😐', '1': '💪', '2': '🧊' };
const CL_DESC = { '-2': 'Il craque souvent dans les derniers trous quand la victoire est en jeu.', '-1': 'Il a tendance à perdre des coups en fin de ronde quand il est en lutte.', '0': 'Ni meilleur ni moins bon quand ça compte.', '1': 'Il garde ses moyens en fin de ronde quand ça compte.', '2': 'Il élève son jeu dans les derniers trous quand il est en lutte pour la victoire.' };
const clKnown = g => !!(g && (g.cm || (g.cxn || 0) >= 3 || (g.clh && g.clh.length)));
function clBlock(id) {
  const g = S.G[id]; if (!g || id === 0) return '';
  const n = g.cxn || 0, w = g.cxw || 0, cl = g.cl || 0, stat = n ? '<p class="small mute talnote">En lutte à 5 trous de la fin : ' + n + ' fois' + (w ? ' · ' + plural(w, 'victoire') : '') + '</p>' : '';
  if (!clKnown(g)) return '<div class="block talblk"><h3>Sous pression</h3><div class="talrow"><span class="tal unk"><span class="ti">?</span><span>Tempérament inconnu<small>Les dépisteurs doivent le voir en lutte</small></span></span></div>' + stat + '</div>';
  const hist = g.clh && g.clh.length > 1 ? clutchLabel(g.clh[0][1]) + g.clh.slice(1).map(x => ' → ' + clutchLabel(x[1]) + ' (' + yr(x[0]) + ')').join('') : '';
  const cls = cl >= 2 ? 'au' : cl === 1 ? 'ag' : cl <= -1 ? 'neg' : '';
  return '<div class="block talblk"><h3>Sous pression</h3><div class="talrow"><span class="tal ' + cls + '"><span class="ti">' + CL_ICO[cl] + '</span><span>' + clutchLabel(cl) + '<small>' + CL_DESC[cl] + '</small></span></span></div>' + stat + (hist ? '<p class="small mute talnote">Historique : ' + hist + '</p>' : '') + '</div>';
}
function clNews(id, a, b) {
  const nm = nameOf(id), L = clutchLabel(b);
  if (b > a) return (b === 2 ? '🧊 ' + nm + ' devient Clutch : il sait maintenant finir le travail.' : b === 1 ? '💪 ' + nm + ' a appris à gagner : il devient Solide sous pression.' : b === 0 ? '😐 ' + nm + ' a trouvé son calme : il devient Stable sous pression.' : '😬 ' + nm + ' reprend un peu confiance : il devient Nerveux sous pression.');
  return (b === -2 ? '😰 ' + nm + ' chancelle désormais quand la victoire est en jeu.' : b === -1 ? '😬 ' + nm + ' a perdu ses moyens sous pression : il devient Nerveux.' : b === 0 ? '😐 ' + nm + ' a perdu un peu d’assurance : il redevient Stable sous pression.' : '💪 ' + nm + ' n’est plus aussi glacial : il passe de Clutch à Solide.');
}

function phenActive() { return Object.values(S.G).some(g => g.ph && g.a < 42); }
function eliteHandicap(o, g) {   // g (optionnel) : un phénomène échappe au nivellement
  const t = scale(TIERS, o), v = (t >= 8 ? 2 : t >= 7 ? 1 : t >= 6 ? 0.5 : 0) * (CFG.eliteHc == null ? 0 : CFG.eliteHc);   // v190 : nivellement retiré par défaut (simulation : le top 5 gagne 20 % des tournois au lieu de 9 %) ; CFG.eliteHc = 1 le remet
  return g && g.ph ? v * PHEN.hcMul : v;
}
function eliteHandicapOld(o) {   // p\u00e9nalit\u00e9 volontaire pour niveler les tr\u00e8s hauts paliers (comme un handicap de comp\u00e9tition) : Elite +0,5, Hall Of Famer +1, Generational +2
  const t = scale(TIERS, o);
  return t >= 8 ? 2 : t >= 7 ? 1 : t >= 6 ? 0.5 : 0;
}
function clutchAdj(margin, cl) {   // margin = coups de retard sur le meneur apr\u00e8s la ronde 1 (0 = co-meneur) ; effet maximal pr\u00e8s de la t\u00eate, s'estompe avec l'\u00e9cart
  if (!cl) return 0;
  const w = Math.exp(-Math.max(0, margin) / 4);
  return -cl * 0.6 * w;
}
/* Vent et distance selon le niveau : 0,85 de l'effet pour l'élite, 1 pour un golfeur moyen (niveau 500), jusqu'à environ 1,2 pour les plus faibles.
   v417 : suit la même courbe que mu (adoucie sous 450 par CFG.lowK) ; identique à l'ancienne formule avec lowK = 1. */
function condFactor(g) { const o = clamp(effOverall(g), -50, 1000); return 0.85 + 0.15 * ((mu(o) - MU.A) / MU.B) / Math.pow(0.5, MU.GAM); }
function roundTarget(g, ctx, r, margin) { const f = condFactor(g); return courseAdjust(mu(effOverall(g)) + eliteHandicap(g.o, g) + (margin != null ? clutchAdj(margin, g.cl) : 0), ctx) + (ctx.distDelta || 0) * f + ctx.course + ctx.weather[r] + dayFactor(g) + (ctx.windBump ? ctx.windBump[r] * f : 0) + talRT(g, ctx, r) + skRT(g) + lvlFor(g); }

/* ---- Évolution en cours de saison (après chaque tournoi) ----
   forme (f) : oscille autour de 0 et revient vers 0 ; séquence : passe chaude (sm > 0)
   ou creux (sm < 0) qui dure sl tournois. Retourne 'hot' / 'cold' quand une séquence débute. */
function afterTournament(g) {
  g.tpo = (g.tpo || 0) + 1;   // v340 : observations du tempérament
  g.f = g.f * 0.6 + gauss() * 20 * CFG.form;
  let ev = null;
  if (g.sl > 0) { g.sl--; g.se = (g.se || 0) + 1; if (g.sl === 0) { g.se = 0; g.dom = 0; } }
  else if (g.ph && phenOn() && g.a >= PHEN.ageMin && g.a <= PHEN.ageMax && Math.random() < PHEN.spellP / 100) {   // phénomène : période de domination (ou, plus rarement, un vrai creux)
    const cold = Math.random() < PHEN.cold / 100, len = PHEN.spellMin + Math.floor(Math.random() * (PHEN.spellMax - PHEN.spellMin + 1));
    g.sl = len; g.se = 0; g.dom = cold ? 0 : 1;
    g.sm = cold ? -(45 + Math.random() * 45) * CFG.form : (PHEN.ampMin + Math.random() * (PHEN.ampMax - PHEN.ampMin)) * CFG.form;
    ev = cold ? 'cold' : 'dom';
  }
  else if (Math.random() < CFG.streakP / 100) {
    const len = Math.min(Math.max(2, CFG.streakMax || 8), 2 + Math.floor(-Math.log(1 - Math.random()) * 2.2));   // v244 : 2 à streakMax, les longues plus rares (≈ 35 % de 2, 15 % de 6 et +)
    const cold = Math.random() < CFG.coldShare / 100;
    g.sl = len; g.se = 0; g.sm = (cold ? -1 : 1) * (45 + Math.random() * 45) * CFG.form * (CFG.streakAmp == null ? 1 : CFG.streakAmp);
    ev = cold ? 'cold' : 'hot';
    if (!cold && g.sm >= 72 * CFG.form && Math.random() < 0.10) ev = 'irr';   // une forte passe chaude ordinaire peut aussi faire parler d'une « forme irréelle » : l'article seul ne trahit pas un phénomène
  }
  return ev;
}
/* ---- Progression cachée en cours de saison (v157) ----
   Après chaque tournoi, le vrai niveau peut bouger : la plupart du temps rien ou presque, parfois une marche,
   rarement une percée ou un effondrement soudain (sans nouvelle). Les jeunes sont plus volatils (dans les deux sens),
   les vétérans plus stables. La direction dépend de l'âge, de l'écart avec le plafond réel et des résultats récents
   (de bons résultats augmentent seulement les CHANCES de progresser). Rien n'est visible : palier, étoiles et tendance
   restent ceux du début de saison (g.s0) jusqu'au bilan de l'intersaison, qui combine les deux. */
const INS = { pNone: 0.5, pSmall: 0.33, pBig: 0.006, calmP: 0.2, off: 0.85, resW: 0.35 };
function insVol(a) { return a < 23 ? 1.5 : a < 27 ? 1.25 : a < 32 ? 1.0 : 0.8; }
function insBias(g) { const a = g.a, pk = g.pk || 29; if (a < pk) return clamp(((g.pt != null ? g.pt : g.p) - g.o) / 400, -0.1, 0.16); return -Math.min(0.14, 0.03 + 0.012 * (a - pk)); }
let RCDEV = true;   // v372 : la classe de recrues progresse aussi en saison (interrupteur gardé pour les simulations)
function inSeasonDev(lg) {
  const simP = S.mode === 'sim', groups = [];
  for (let l = 0; l < 4; l++) groups.push({ ids: lg[l].rows.map(r => r[0]).filter(id => S.G[id]), res: true });
  if (RCDEV && S.rcl && S.rcl.s === S.season) {   // v372 : la classe de recrues (avec ses résultats si elle a joué ce tournoi)
    const rr = lg[4] && lg[4].rows, inL = new Set(groups.flatMap(x => x.ids));
    const ids = (rr ? rr.map(r => r[0]) : S.rcl.ids).filter(id => S.G[id] && !inL.has(id));
    if (ids.length) groups.push({ ids, res: !!rr });
  }
  for (const grp of groups) {
    const ids = grp.ids;
    const er = {}; ids.slice().sort((a, b) => S.G[b].o - S.G[a].o).forEach((id, i) => { er[id] = i; });
    ids.forEach((id, fi) => {
      if (id === 0 && !simP) return;
      const g = S.G[id]; if (g.s0 == null) g.s0 = g.o;
      g.rf = (g.rf || 0) * 0.6 + (grp.res ? (er[id] - fi) / ids.length : 0);            // + = mieux que son niveau ne le laissait prévoir
      const vol = insVol(g.a), v = vol * (g.calm ? 0.35 : 1), u = Math.random(); let m = 0, big = false;
      if (u < INS.pBig * vol * vol) { m = 25 + Math.random() * 50; big = true; }
      else if (u < INS.pNone + INS.pBig) m = 0;
      else if (u < INS.pNone + INS.pBig + INS.pSmall) m = (1 + Math.random() * 2.5) * v;
      else m = (4 + Math.random() * 10) * v;
      if (!m) return;
      const pUp = clamp(0.5 + insBias(g) + INS.resW * Math.tanh(g.rf * 1.5), 0.15, 0.85);
      const d = (Math.random() < pUp ? 1 : -1) * Math.round(m);
      g.o = clamp(g.o + d, 5, 995);
      if (big) g.ib = d > 0 ? 1 : -1;
    });
  }
}
function shownO(g) { return g.s0 != null ? g.s0 : g.o; }
/* ---- Développement des jeunes : chaque golfeur a son propre rythme et son propre plafond réel ----
   Le potentiel affiché (g.p) est l'estimation des dépisteurs ; le plafond réel (g.pt) est caché et peut différer :
   certains espoirs ne percent jamais, d'autres dépassent les attentes. L'estimation se rapproche peu à peu du plafond réel.
   Traits cachés : dv = rythme de développement, lb = années de retard d'un éclosion tardive, pw/pm = phase en cours (poussée ou plateau). */
const DEV = { rateSd: 0.75, lateP: 0.10, phaseP: 0.17, surge: 1.8, plateau: 0.2, baseR: 0.95,
  bustP: 0.40, boomP: 0.07, surpriseP: 0.16, clickP: 1 / 175, clickSee: 0.2, revise: 0.2, youthUp: 0.4, underdogThresh: 450, underdogBoost: 0.045, yipsP: 0.02 };
function initDev(g) {
  g.dv = clamp(Math.exp(gauss() * DEV.rateSd), 0.3, 2.8);
  g.lb = (g.a < 23 && Math.random() < DEV.lateP) ? 2 + Math.floor(Math.random() * 3) : 0;
  g.pw = 0; g.pm = 1;
  const gap = Math.max(0, g.p - g.o), young = g.a < 27, r = Math.random();
  let R = DEV.baseR + gauss() * 0.1;
  if (young) {
    if (r < DEV.bustP) R = 0.08 + Math.random() * 0.32;                       // espoir qui ne perce pas
    else if (r < DEV.bustP + DEV.boomP) R = 1.12 + Math.random() * 0.4;       // dépasse les attentes
  }
  let pt = g.o + gap * R;
  if (g.lb) pt += gap * 0.2;                                                  // les éclosions tardives ont souvent du talent en réserve
  if (young && Math.random() < DEV.surpriseP) pt += 150 + Math.random() * 450; // le golfeur qu'on n'attendait pas
  g.pt = clamp(pt, 50, 1000);
}
/* ---- Évolution de fin de saison ----
   Les jeunes montent vers leur potentiel plus vite et ont plus de chances de percée ;
   après ~31 ans le niveau décline et les creux deviennent plus probables. */
function ageSeason(g) {
  const a = g.a, pk = g.pk || 29, dr = g.dr || 1, o0 = g.s0 != null ? g.s0 : g.o; let d, event = null;
  if (g.pt == null) initDev(g);       // ancienne sauvegarde ou golfeur sans traits de développement
  const p0 = g.p;
  // v337 : le déclic — rarement, un jeune sans grand avenir trouve quelque chose ; son vrai plafond grimpe au niveau de la L1, en secret
  if (!g.ph && !g.mir && g.id !== 0 && a <= 24 && g.pt < 700 && Math.random() < DEV.clickP) { g.pt = Math.max(g.pt, 830 + Math.random() * 150); g.mir = 1; }
  if (a < pk) {                       // avant le sommet : chacun rattrape son plafond réel à son propre rythme
    let rate = a < 23 ? 0.33 : a < 27 ? 0.24 : 0.115, pm = 1;
    if (g.pw > 0) { pm = g.pm; g.pw--; }                                       // phase en cours : poussée ou plateau
    else if (a < 27 && Math.random() < DEV.phaseP) {
      g.pm = Math.random() < 0.5 ? DEV.surge : DEV.plateau; g.pw = Math.floor(Math.random() * 3); pm = g.pm;
    }
    if (g.lb) rate *= a < 22 + g.lb ? 0.3 : 1.25;                              // éclosion tardive : départ lent, puis rattrapage
    rate = Math.min(0.92, rate * (g.dv || 1) * pm * (a < 26 ? CFG.youth : 1));
    const gap = g.pt - g.o;
    d = gap >= 0 ? rate * gap : 0.15 * gap;
  } else {                            // après le sommet : déclin graduel, propre à chaque golfeur (dr)
    const yrs = a - pk;
    d = -Math.min(38, 2 + 1.7 * yrs) * dr * CFG.decline + (yrs < 3 ? 0.05 * Math.max(0, g.pt - g.o) : 0);
  }
  d += gauss() * (a < 26 ? 24 : 18);
  const late = a >= 27;   // \u00e0 partir de 27 ans, une perc\u00e9e rare devient une v\u00e9ritable \u00e9closion tardive (tir\u00e9e \u00e0 part, ci-dessous)
  let pUp = (a < 23 ? 0.14 : a < 26 ? 0.09 : a < 30 ? 0.045 : a < 40 ? 0.03 : 0.012) * (a < 26 ? CFG.youth * DEV.youthUp : 1);
  if (a < 27 && g.pt < DEV.underdogThresh) pUp += DEV.underdogBoost;   // personne ne l'attendait \u2014 petite chance suppl\u00e9mentaire de percer
  const pDown = a < 26 ? 0.025 : a < 30 ? 0.035 : a < 34 ? 0.055 : 0.085;
  const r = Math.random();
  if (r < pUp) {                      // perc\u00e9e normale (les jeunes rattrapent leur plafond r\u00e9el plus vite)
    const m = 45 + Math.random() * 70;
    d += m; event = 'up';
    g.p = Math.min(1000, Math.max(g.p, g.o + d)); g.pt = Math.min(1000, Math.max(g.pt, g.o + d));
  } else if (r < pUp + pDown) { const m = 45 + Math.random() * 70; d -= m; event = 'down'; }
  if (!event && late) {               // \u00e9closion tardive : cas d'exception ind\u00e9pendant, un v\u00e9t\u00e9ran qui se r\u00e9invente \u2014 de plus en plus rare avec l'\u00e2ge
    const lateP = a < 35 ? 0.02 : a < 45 ? 0.012 : 0.006;
    if (Math.random() < lateP) {
      const m = 70 + Math.random() * 90;
      d += m; event = 'late';
      g.p = Math.min(1000, Math.max(g.p, g.o + d)); g.pt = Math.min(1000, Math.max(g.pt, g.o + d));
      g.pk = Math.min(40, (g.pk || 29) + 3);
    }
  }
  if (!event && !g.ph && a >= 25 && a <= 30 && Math.random() < DEV.yipsP) {   // l'inverse : un golfeur \u00e9tabli perd soudainement la touche, bien avant l'\u00e2ge du d\u00e9clin
    const m = 70 + Math.random() * 90;
    d -= m; event = 'yips';
    g.p = Math.max(50, g.p - m); g.pt = Math.max(50, g.pt - m);
  }
  g.o = clamp(g.o + d * INS.off, 5, 995);   // l'intersaison garde 85 % de son effet ; le reste s'est joué, en secret, pendant la saison
  if (!event && g.ib && Math.abs(g.o - o0) >= 45 && Math.sign(g.o - o0) === g.ib) event = g.ib > 0 ? 'up' : 'down';   // une percée ou une chute secrète en saison se révèle maintenant
  if (a < (g.pk || 29) + 2) g.p = clamp(g.p + DEV.revise * (g.pt - g.p) + gauss() * 8, 50, 1000);   // l'estimation se rapproche du plafond réel ; les vétérans gardent en mémoire leur sommet
  if (g.mir === 1) {   // v337 : les dépisteurs remarquent parfois le déclic (20 % par intersaison, 3 chances) ; sinon l'estimation monte lentement, sans bruit
    if (Math.random() < DEV.clickSee) { g.scf = p0; g.p = clamp(g.pt - 20 - Math.random() * 60, g.p, 1000); g.mir = 2; if (!event || event === 'up') event = 'scout'; }
    else if ((g.mirn = (g.mirn || 0) + 1) >= 3) g.mir = 3;
  }
  if (!event && a < 27 && p0 >= 560 && scale(POTS, g.p) < scale(POTS, p0)) event = 'bust';   // un espoir dont on attendait beaucoup déçoit
  g.op = Math.max(g.op || o0, g.o);
  g.dl = g.o - o0;
  g.a += 1; g.cs = (g.cs || 0) + 1; g.f = 0; g.sl = 0; g.se = 0;
  g.s0 = g.o; g.ib = 0; g.rf = 0; g.calm = Math.random() < INS.calmP;
  if (!g.v0) g.v0 = g.v || 1;   // anciennes parties : la régularité actuelle devient sa nature
  g.v = clamp(Math.exp(Math.log(g.v0) + REG.rho * Math.log((g.v || 1) / g.v0) + gauss() * REG.sd), 0.35, 2.6);   // d\u00e9rive d'une saison \u00e0 l'autre (creux de putting, ajustements de swing), avec rappel vers sa nature
  return event;
}
/* ---- Étiquettes lisibles (sans montrer l'overall) ---- */
function formLevel(g) { // niveau de forme affiché ; une séquence en cours prime toujours
  const e = g.f + (g.sl > 0 ? g.sm : 0);
  return g.sl > 0 ? (g.sm > 0 ? Math.max(e, 46) : Math.min(e, -46)) : e;
}
function formLabel(g) {
  const e = formLevel(g);
  if (e > 70) return 'En feu'; if (e > 28) return 'En forme'; if (e > -28) return 'Normale'; if (e > -70) return 'En m\u00e9forme'; return 'En chute libre';
}
/* Régularité : catégorie tirée à la création (15 % très régulier, 20 % régulier, 30 % moyen, 20 % irrégulier,
   15 % montagnes russes), puis une valeur au hasard dans cette catégorie. g.v0 = sa nature ; chaque intersaison,
   g.v dérive un peu mais revient vers g.v0 (un golfeur peut changer d'un cran pour une saison ou deux). */
const REG = { p: [15, 20, 30, 20, 15], band: [[0.62, 0.8], [0.8, 0.93], [0.93, 1.07], [1.07, 1.25], [1.25, 1.6]], rho: 0.5, sd: 0.045 };
function drawReg() {
  let r = Math.random() * 100, k = 0; while (k < 4 && r >= REG.p[k]) { r -= REG.p[k]; k++; }
  const [a, b] = REG.band[k]; return Math.exp(Math.log(a) + Math.random() * (Math.log(b) - Math.log(a)));
}
function newReg(g) { g.v = g.v0 = drawReg(); return g; }
function regLevel(g) { const v = g.v || 1; return v < 0.8 ? 5 : v < 0.93 ? 4 : v < 1.07 ? 3 : v < 1.25 ? 2 : 1; }
const REG_LABELS = ['', 'Montagnes russes', 'Irr\u00e9gulier', 'Moyen', 'R\u00e9gulier', 'Tr\u00e8s r\u00e9gulier'];
function ageLabel(a) { return a <= 22 ? 'Jeune espoir' : a <= 26 ? 'En progression' : a <= 31 ? 'Dans la force de l\u2019\u00e2ge' : a <= 36 ? 'Exp\u00e9riment\u00e9' : 'V\u00e9t\u00e9ran'; }
/* ---- Retraite : aucun âge plancher ni plafond strict. Ce qui pèse, c'est la qualité actuelle du golfeur
   (niveau absolu, rang dans sa ligue, écart depuis son sommet, stagnation) ; l'âge amplifie cette pression
   année après année, de plus en plus fort. Un jeune faible peut raccrocher ; un vétéran encore bon peut
   étirer sa carrière, même passé 60 ans, dans de rares cas. ---- */
function retireHazard(g, l, pct, sg, wr) {
  const a = g.a;
  const lvl = clamp(1 - g.o / 500, 0, 1);                                    // sous ~500 (Pro), la faiblesse absolue pèse
  const rankBad = clamp((pct - 0.35) / 0.65, 0, 1);                          // la moitié inférieure de sa ligue pèse
  const peakDrop = clamp(((g.op || g.o) - g.o) / 350, 0, 1);                 // a perdu du terrain depuis son sommet
  const stagn = clamp((sg || 0) / 10, 0, 1);                                 // stagne depuis longtemps sans progresser
  const room = Math.max(0, (g.pt || g.o) - g.o);                            // marge de progression restante vers son vrai plafond
  const promise = a < 27 ? clamp(room / 300, 0, 0.7) : 0;                    // un jeune encore loin d'avoir r\u00e9alis\u00e9 son potentiel est prot\u00e9g\u00e9, jusqu'\u00e0 70 %
  const weak = clamp((0.35 * lvl + 0.30 * rankBad + 0.20 * peakDrop + 0.15 * stagn) * (1 - promise), 0, 1);
  const ageBase = a < 25 ? 0 : Math.pow(clamp((a - 25) / 36, 0, 1), 1.6);    // grimpe en s'accélérant jusqu'à ~60, puis plafonne
  const base = 0.003 + 0.05 * ageBase;                                       // petite pression même pour les très bons, qui grandit un peu avec l'âge
  const weakPressure = weak * (0.06 + 2.2 * ageBase);                         // la faiblesse pèse de plus en plus lourd avec l'âge
  let h = (base + weakPressure) * (g.ri || 1);
  /* Un golfeur de moins de 34 ans qui tient sa place en Ligue 1 à 3 ne pense presque pas à la retraite :
     il reste surtout la blessure qui met fin à une carrière (rare). */
  if (l <= 2 && a < 34) {
    const comp = pct < 0.8;                                                   // pas dans le bas de sa ligue
    h *= a < 30 ? (comp ? 0.1 : 0.35) : (comp ? 0.55 : 0.85);
    h = Math.max(h, 0.002);                                                   // blessure grave : rare, mais possible
  }
  /* Un jeune coincé en Ligue 4 depuis plusieurs saisons, sans vraie marge de progression, finit par se recycler. */
  if (l === 3 && a < 30 && (g.cs || 0) >= 3) h += (0.05 + 0.16 * stagn) * (1 - promise);
  /* v264 : au golf, on dure. Un golfeur encore compétitif en L1 (ou dans la bonne moitié de la L2) pense beaucoup
     moins à la retraite. Mais s'il est clairement en déclin (talent en baisse sur ses 3 dernières saisons),
     cette protection disparaît ; et un vétéran en déclin qui glisse vers la relégation y pense sérieusement. */
  const rec = (g.oh || []).slice(-3).map(x => x[1]), dd = rec.length ? Math.max(g.o, ...rec) - g.o : 0, dec = clamp((dd - 35) / 70, 0, 1);
  let prot = 1;
  if (l === 0 && pct < 0.75) prot = a < 40 ? 0.2 : a < 45 ? 0.35 : 0.55;
  else if (l === 0) prot = a < 42 ? 0.5 : 0.8;
  else if (l === 1 && pct < 0.5) prot = a < 40 ? 0.6 : 0.8;
  h *= prot + (1 - prot) * dec;
  if (l <= 1 && pct >= 0.8 && a >= 35 && (g.cs || 0) >= 6) h += dec * (0.08 + 0.22 * clamp((a - 35) / 10, 0, 1));
  else if (a >= 33) h *= 1 + 0.5 * dec;
  /* plus il est haut dans le top 100 du World Ranking, moins il pense à la retraite (n°1 : ×0,3 ; 100e : ×1) */
  if (wr && wr <= WR_TOP) h *= 0.3 + 0.7 * (wr - 1) / (WR_TOP - 1);
  return clamp(h, 0, 0.97);
}

/* ---- Niveau (overall) et potentiel en mots ---- */
const TIERS = [[0, 'Weak'], [150, 'Amateur'], [300, 'Average'], [450, 'Semi-Pro'], [600, 'Pro'], [700, 'Established Pro'], [800, 'Elite'], [900, 'Hall Of Famer'], [950, 'Generational']];
const POTS = [[0, 'L4 - Bottom'], [100, 'L4 - Everyday Player'], [200, 'L4 - Leader'], [300, 'L3 - Everyday Player'], [400, 'L3 - Established'], [500, 'L2 - Everyday Player'], [600, 'L2 - Leader'], [700, 'L1 - Everyday Player'], [800, 'L1 - Established'], [900, 'L1 - Leader'], [950, 'Generational']];
/* ---- Sous pression (dernière ronde, en lutte pour la victoire) : 5 paliers, le milieu (0) est le standard,
   sans effet. Distribution en cloche : la plupart des golfeurs sont \u00ab Stable \u00bb, les cas tranch\u00e9s sont rares. ---- */
const CLUTCH = [[-2, 'Chancelle'], [-1, 'Nerveux'], [0, 'Stable'], [1, 'Solide'], [2, 'Clutch']];
const CLUTCH_W = [0.08, 0.22, 0.40, 0.22, 0.08];
function drawClutch() {
  const u = Math.random(); let c = 0, i = 0;
  for (; i < CLUTCH_W.length; i++) { c += CLUTCH_W[i]; if (u < c) break; }
  return CLUTCH[Math.min(i, CLUTCH.length - 1)][0];
}
function clutchLabel(cl) { const e = CLUTCH.find(x => x[0] === (cl || 0)); return e ? e[1] : 'Stable'; }
/* ---- Golfeur créé par le joueur (mode simulé) ----
   Le niveau et le potentiel se choisissent par titre (même échelle TIERS/POTS que partout ailleurs) ;
   la cote exacte est tirée au hasard dans la bande du titre choisi, comme n'importe quel golfeur. */
function tierRange(list, idx) {
  const lo = list[idx][0], hi = idx + 1 < list.length ? list[idx + 1][0] - 1 : 1000;
  return [lo, hi];
}
function rollInTier(list, idx) { const [lo, hi] = tierRange(list, idx); return lo + Math.random() * (hi - lo); }
function newPlayerGolfer(opts) {
  const o = rollInTier(TIERS, opts.tierIdx);
  const p = Math.max(o, rollInTier(POTS, opts.potIdx));
  const pk = clamp(Math.round(29 + gauss() * 2.4), 25, 35);
  const g = newReg({ id: 0, n: opts.n, nat: opts.nat || '', a: opts.a, o, p, f: 0, sl: 0, sm: 0, se: 0,
    v: 1, pk, dr: Math.exp(gauss() * 0.32), ri: Math.exp(gauss() * 0.3),
    sg: 0, cs: 1, op: o, cw: 0, sk: [0, 0, 0], cl: drawClutch() });
  initDev(g);
  bioRoll(g);
  return g;
}
function scale(T, v) { let i = 0; T.forEach((t, k) => { if (v >= t[0]) i = k; }); return i; }
function tierClass(i, n) { return Math.round(i * 8 / Math.max(1, n - 1)); }   // ramène un index (sur une liste de longueur n) à la palette de couleurs t0-t8
function tierOf(g) { return scale(TIERS, shownO(g)); }
function potOf(g) { return scale(POTS, g.p); }
function peakTierOf(g) { const o = shownO(g); return scale(TIERS, Math.max(g.op || o, o)); }
function trendLabel(g) {
  if (g.dl == null) return null; const d = g.dl;
  return d >= 40 ? 'En forte progression' : d >= 12 ? 'En progression' : d > -12 ? 'Stable' : d > -40 ? 'En l\u00e9ger d\u00e9clin' : 'En d\u00e9clin marqu\u00e9';
}

/* ---- Noms et nationalités ----
   244 nations (poids en %, normalisé automatiquement par NATIONS_W).
   region sert de repli pour les nations sans pool dédié (phase 1 : les 12 plus grosses nations + Canada/Québec).
   Ces pools de démarrage sont volontairement plus légers que la cible finale (25 prénoms/0,1%) ; à enrichir
   nation par nation, surtout US et Angleterre. */
const NATIONS = [
  { code: "US", name: "United States", weight: 16, region: "dedie" },
  { code: "ENG", name: "England", weight: 7, region: "dedie" },
  { code: "SCO", name: "Scotland", weight: 5, region: "dedie" },
  { code: "AUS", name: "Australia", weight: 4.8, region: "dedie" },
  { code: "KOR", name: "South Korea", weight: 4.5, region: "dedie" },
  { code: "JPN", name: "Japan", weight: 4.5, region: "dedie" },
  { code: "SWE", name: "Sweden", weight: 4.2, region: "dedie" },
  { code: "CAN", name: "Canada", weight: 4.2, region: "dedie" },
  { code: "RSA", name: "South Africa", weight: 3.0, region: "dedie" },
  { code: "IRL", name: "Ireland", weight: 3.0, region: "dedie" },
  { code: "ESP", name: "Spain", weight: 3.16, region: "dedie" },
  { code: "NIR", name: "Northern Ireland", weight: 2.93, region: "dedie" },
  { code: "FRA", name: "France", weight: 2.93, region: "eu_ouest" },
  { code: "GER", name: "Germany", weight: 2.71, region: "eu_ouest" },
  { code: "DEN", name: "Denmark", weight: 2.48, region: "eu_nord" },
  { code: "NZL", name: "New Zealand", weight: 2.14, region: "oceanie" },
  { code: "ARG", name: "Argentina", weight: 2.03, region: "amerique_latine" },
  { code: "THA", name: "Thailand", weight: 1.92, region: "asie" },
  { code: "ITA", name: "Italy", weight: 1.8, region: "eu_ouest" },
  { code: "WAL", name: "Wales", weight: 1.58, region: "eu_ouest" },
  { code: "MEX", name: "Mexico", weight: 1.47, region: "amerique_latine" },
  { code: "TPE", name: "Chinese Taipei", weight: 1.35, region: "asie" },
  { code: "BEL", name: "Belgium", weight: 1.24, region: "eu_ouest" },
  { code: "NED", name: "Netherlands", weight: 1.13, region: "eu_ouest" },
  { code: "AUT", name: "Austria", weight: 0.9, region: "eu_ouest" },
  { code: "SUI", name: "Switzerland", weight: 0.79, region: "eu_ouest" },
  { code: "FIN", name: "Finland", weight: 0.68, region: "eu_nord" },
  { code: "NOR", name: "Norway", weight: 0.56, region: "eu_nord" },
  { code: "COL", name: "Colombia", weight: 0.45, region: "amerique_latine" },
  { code: "CHI", name: "Chile", grp: "amerique_latine", x: 3, region: "amerique_latine" },
  { code: "VEN", name: "Venezuela", grp: "amerique_latine", x: 3, region: "amerique_latine" },
  { code: "PHI", name: "Philippines", grp: "asie", x: 3, region: "asie" },
  { code: "IND", name: "India", grp: "asie", x: 3, region: "asie" },
  { code: "CHN", name: "China", grp: "asie", x: 3, region: "asie" },
  { code: "SIN", name: "Singapore", grp: "asie", x: 2, region: "asie" },
  { code: "CZE", name: "Czech Republic", grp: "eu_est", x: 3, region: "eu_est" },
  { code: "POR", name: "Portugal", grp: "eu_petits", x: 3, region: "eu_ouest" },
  { code: "MAS", name: "Malaysia", grp: "asie", x: 3, region: "asie" },
  { code: "INA", name: "Indonesia", grp: "asie", x: 2, region: "asie" },
  { code: "BRA", name: "Brazil", grp: "amerique_latine", x: 3, region: "amerique_latine" },
  { code: "UAE", name: "United Arab Emirates", grp: "moyen_orient", x: 3, region: "moyen_orient" },
  { code: "HKG", name: "Hong Kong", grp: "asie", x: 2, region: "asie" },
  { code: "POL", name: "Poland", grp: "eu_est", x: 3, region: "eu_est" },
  { code: "HUN", name: "Hungary", grp: "eu_est", x: 2, region: "eu_est" },
  { code: "SVK", name: "Slovakia", grp: "eu_est", x: 2, region: "eu_est" },
  { code: "SLO", name: "Slovenia", grp: "eu_est", x: 3, region: "eu_est" },
  { code: "GRE", name: "Greece", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "TUR", name: "Turkey", grp: "moyen_orient", x: 2, region: "moyen_orient" },
  { code: "ISL", name: "Iceland", grp: "eu_petits", x: 2, region: "eu_nord" },
  { code: "LUX", name: "Luxembourg", grp: "eu_petits", x: 2, region: "eu_ouest" },
  { code: "CYP", name: "Cyprus", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "MLT", name: "Malta", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "MON", name: "Monaco", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "LIE", name: "Liechtenstein", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "AND", name: "Andorra", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "SMR", name: "San Marino", grp: "eu_petits", x: 1, region: "eu_ouest" },
  { code: "URU", name: "Uruguay", grp: "amerique_latine", x: 2, region: "amerique_latine" },
  { code: "CRC", name: "Costa Rica", grp: "amerique_latine", x: 2, region: "amerique_latine" },
  { code: "PAN", name: "Panama", grp: "amerique_latine", x: 2, region: "amerique_latine" },
  { code: "DOM", name: "Dominican Republic", grp: "caraibes", x: 3, region: "caraibes" },
  { code: "BAH", name: "Bahamas", grp: "caraibes", x: 2, region: "caraibes" },
  { code: "BAR", name: "Barbados", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "JAM", name: "Jamaica", grp: "caraibes", x: 2, region: "caraibes" },
  { code: "TRI", name: "Trinidad and Tobago", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "PUR", name: "Puerto Rico", grp: "caraibes", x: 3, region: "caraibes" },
  { code: "MRI", name: "Mauritius", grp: "afrique", x: 2, region: "afrique" },
  { code: "KEN", name: "Kenya", grp: "afrique", x: 3, region: "afrique" },
  { code: "ZIM", name: "Zimbabwe", grp: "afrique", x: 3, region: "afrique" },
  { code: "MAR", name: "Morocco", grp: "afrique", x: 3, region: "afrique" },
  { code: "EGY", name: "Egypt", grp: "afrique", x: 2, region: "afrique" },
  { code: "TUN", name: "Tunisia", grp: "afrique", x: 1, region: "afrique" },
  { code: "SEN", name: "Senegal", grp: "afrique", x: 1, region: "afrique" },
  { code: "GHA", name: "Ghana", grp: "afrique", x: 1, region: "afrique" },
  { code: "NGR", name: "Nigeria", grp: "afrique", x: 2, region: "afrique" },
  { code: "UGA", name: "Uganda", grp: "afrique", x: 1, region: "afrique" },
  { code: "TAN", name: "Tanzania", grp: "afrique", x: 1, region: "afrique" },
  { code: "NAM", name: "Namibia", grp: "afrique", x: 3, region: "afrique" },
  { code: "ZAM", name: "Zambia", grp: "afrique", x: 2, region: "afrique" },
  { code: "BOT", name: "Botswana", grp: "afrique", x: 1, region: "afrique" },
  { code: "ISR", name: "Israel", grp: "moyen_orient", x: 2, region: "moyen_orient" },
  { code: "JOR", name: "Jordan", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "LIB", name: "Lebanon", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "KSA", name: "Saudi Arabia", grp: "moyen_orient", x: 2, region: "moyen_orient" },
  { code: "QAT", name: "Qatar", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "OMA", name: "Oman", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "KUW", name: "Kuwait", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "BRN", name: "Bahrain", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "KAZ", name: "Kazakhstan", grp: "asie", x: 1, region: "asie" },
  { code: "UZB", name: "Uzbekistan", grp: "asie", x: 1, region: "asie" },
  { code: "PAK", name: "Pakistan", grp: "asie", x: 1, region: "asie" },
  { code: "BAN", name: "Bangladesh", grp: "asie", x: 1, region: "asie" },
  { code: "SRI", name: "Sri Lanka", grp: "asie", x: 1, region: "asie" },
  { code: "NEP", name: "Nepal", grp: "asie", x: 1, region: "asie" },
  { code: "CAM", name: "Cambodia", grp: "asie", x: 1, region: "asie" },
  { code: "LAO", name: "Laos", grp: "asie", x: 1, region: "asie" },
  { code: "MGL", name: "Mongolia", grp: "asie", x: 1, region: "asie" },
  { code: "FIJ", name: "Fiji", grp: "oceanie", x: 3, region: "oceanie" },
  { code: "PNG", name: "Papua New Guinea", grp: "oceanie", x: 2, region: "oceanie" },
  { code: "GUM", name: "Guam", grp: "oceanie", x: 1, region: "oceanie" },
  { code: "NCA", name: "New Caledonia", grp: "oceanie", x: 1, region: "oceanie" },
  { code: "PYF", name: "French Polynesia", grp: "oceanie", x: 1, region: "oceanie" },
  { code: "BER", name: "Bermuda", grp: "caraibes", x: 2, region: "caraibes" },
  { code: "CAY", name: "Cayman Islands", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "IVB", name: "British Virgin Islands", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "ANT", name: "Antigua and Barbuda", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "LCA", name: "Saint Lucia", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "GRN", name: "Grenada", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "SKN", name: "Saint Kitts and Nevis", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "BIZ", name: "Belize", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "ECU", name: "Ecuador", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "PER", name: "Peru", grp: "amerique_latine", x: 2, region: "amerique_latine" },
  { code: "BOL", name: "Bolivia", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "PAR", name: "Paraguay", grp: "amerique_latine", x: 3, region: "amerique_latine" },
  { code: "CUB", name: "Cuba", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "HON", name: "Honduras", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "GUA", name: "Guatemala", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "ESA", name: "El Salvador", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "NIC", name: "Nicaragua", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "HAI", name: "Haiti", grp: "caraibes", x: 1, region: "caraibes" },
  { code: "GUY", name: "Guyana", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "SUR", name: "Suriname", grp: "amerique_latine", x: 1, region: "amerique_latine" },
  { code: "RUS", name: "Russia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "UKR", name: "Ukraine", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "ROU", name: "Romania", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "VIE", name: "Vietnam", grp: "asie", x: 1, region: "asie" },
  { code: "ETH", name: "Ethiopia", grp: "afrique", x: 1, region: "afrique" },
  { code: "IRI", name: "Iran", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "IRQ", name: "Iraq", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "ALG", name: "Algeria", grp: "afrique", x: 1, region: "afrique" },
  { code: "ANG", name: "Angola", grp: "afrique", x: 1, region: "afrique" },
  { code: "MOZ", name: "Mozambique", grp: "afrique", x: 1, region: "afrique" },
  { code: "MAD", name: "Madagascar", grp: "afrique", x: 1, region: "afrique" },
  { code: "CIV", name: "Ivory Coast", grp: "afrique", x: 1, region: "afrique" },
  { code: "CMR", name: "Cameroon", grp: "afrique", x: 1, region: "afrique" },
  { code: "NIG", name: "Niger", grp: "afrique", x: 1, region: "afrique" },
  { code: "BUR", name: "Burkina Faso", grp: "afrique", x: 1, region: "afrique" },
  { code: "MLI", name: "Mali", grp: "afrique", x: 1, region: "afrique" },
  { code: "MAW", name: "Malawi", grp: "afrique", x: 1, region: "afrique" },
  { code: "CHA", name: "Chad", grp: "afrique", x: 1, region: "afrique" },
  { code: "SOM", name: "Somalia", grp: "afrique", x: 1, region: "afrique" },
  { code: "RWA", name: "Rwanda", grp: "afrique", x: 1, region: "afrique" },
  { code: "AFG", name: "Afghanistan", grp: "asie", x: 1, region: "asie" },
  { code: "ALB", name: "Albania", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "ARM", name: "Armenia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "AZE", name: "Azerbaijan", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "BLR", name: "Belarus", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "BIH", name: "Bosnia and Herzegovina", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "BRU", name: "Brunei", grp: "asie", x: 1, region: "asie" },
  { code: "BUL", name: "Bulgaria", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "CRO", name: "Croatia", grp: "eu_est", x: 2, region: "eu_est" },
  { code: "EST", name: "Estonia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "GEO", name: "Georgia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "KGZ", name: "Kyrgyzstan", grp: "asie", x: 1, region: "asie" },
  { code: "LAT", name: "Latvia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "LBA", name: "Libya", grp: "afrique", x: 1, region: "afrique" },
  { code: "LTU", name: "Lithuania", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "MDA", name: "Moldova", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "MNE", name: "Montenegro", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "MYA", name: "Myanmar", grp: "asie", x: 1, region: "asie" },
  { code: "PRK", name: "North Korea", grp: "asie", x: 1, region: "asie" },
  { code: "MKD", name: "North Macedonia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "SRB", name: "Serbia", grp: "eu_est", x: 1, region: "eu_est" },
  { code: "SUD", name: "Sudan", grp: "afrique", x: 1, region: "afrique" },
  { code: "SYR", name: "Syria", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "TOG", name: "Togo", grp: "afrique", x: 1, region: "afrique" },
  { code: "TKM", name: "Turkmenistan", grp: "asie", x: 1, region: "asie" },
  { code: "YEM", name: "Yemen", grp: "moyen_orient", x: 1, region: "moyen_orient" },
  { code: "BEN", name: "Benin", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "BDI", name: "Burundi", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "CPV", name: "Cape Verde", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "CAF", name: "Central African Republic", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "COM", name: "Comoros", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "CGO", name: "Congo", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "COD", name: "DR Congo", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "DJI", name: "Djibouti", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "GEQ", name: "Equatorial Guinea", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "ERI", name: "Eritrea", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "SWZ", name: "Eswatini", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "GAB", name: "Gabon", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "GAM", name: "Gambia", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "GUI", name: "Guinea", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "GBS", name: "Guinea-Bissau", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "LES", name: "Lesotho", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "LBR", name: "Liberia", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "MTN", name: "Mauritania", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "MYT", name: "Mayotte", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "REU", name: "Reunion", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "SHN", name: "Saint Helena", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "STP", name: "Sao Tome and Principe", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "SEY", name: "Seychelles", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "SLE", name: "Sierra Leone", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "SSD", name: "South Sudan", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "ESH", name: "Western Sahara", grp: "afrique", x: 0.5, region: "afrique" },
  { code: "FLK", name: "Falkland Islands", grp: "amerique_latine", x: 0.5, region: "amerique_latine" },
  { code: "GUF", name: "French Guiana", grp: "amerique_latine", x: 0.5, region: "amerique_latine" },
  { code: "BHU", name: "Bhutan", grp: "asie", x: 0.5, region: "asie" },
  { code: "TLS", name: "East Timor", grp: "asie", x: 0.5, region: "asie" },
  { code: "MAC", name: "Macau", grp: "asie", x: 0.5, region: "asie" },
  { code: "MDV", name: "Maldives", grp: "asie", x: 0.5, region: "asie" },
  { code: "TJK", name: "Tajikistan", grp: "asie", x: 0.5, region: "asie" },
  { code: "AIA", name: "Anguilla", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "ARU", name: "Aruba", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "BOE", name: "Bonaire", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "CUW", name: "Curacao", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "DMA", name: "Dominica", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "GLP", name: "Guadeloupe", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "MTQ", name: "Martinique", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "MSR", name: "Montserrat", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "BLM", name: "Saint Barthelemy", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "MAF", name: "Saint Martin", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "VIN", name: "Saint Vincent and the Grenadines", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "SXM", name: "Sint Maarten", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "TCA", name: "Turks and Caicos Islands", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "ISV", name: "US Virgin Islands", grp: "caraibes", x: 0.5, region: "caraibes" },
  { code: "KOS", name: "Kosovo", grp: "eu_est", x: 0.5, region: "eu_est" },
  { code: "ALA", name: "Aland Islands", grp: "eu_petits", x: 0.5, region: "eu_nord" },
  { code: "AZO", name: "Azores", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "FRO", name: "Faroe Islands", grp: "eu_petits", x: 0.5, region: "eu_nord" },
  { code: "GIB", name: "Gibraltar", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "GRL", name: "Greenland", grp: "eu_petits", x: 0.5, region: "eu_nord" },
  { code: "GGY", name: "Guernsey", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "IMN", name: "Isle of Man", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "JEY", name: "Jersey", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "MDR", name: "Madeira", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "SPM", name: "Saint Pierre and Miquelon", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "VAT", name: "Vatican City", grp: "eu_petits", x: 0.5, region: "eu_ouest" },
  { code: "PLE", name: "Palestine", grp: "moyen_orient", x: 0.5, region: "moyen_orient" },
  { code: "ASA", name: "American Samoa", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "COK", name: "Cook Islands", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "KIR", name: "Kiribati", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "MHL", name: "Marshall Islands", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "FSM", name: "Micronesia", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "NRU", name: "Nauru", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "NIU", name: "Niue", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "NMI", name: "Northern Mariana Islands", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "PLW", name: "Palau", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "RPN", name: "Rapa Nui", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "SAM", name: "Samoa", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "SOL", name: "Solomon Islands", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "TKL", name: "Tokelau", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "TGA", name: "Tonga", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "TUV", name: "Tuvalu", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "VAN", name: "Vanuatu", grp: "oceanie", x: 0.5, region: "oceanie" },
  { code: "WLF", name: "Wallis and Futuna", grp: "oceanie", x: 0.5, region: "oceanie" }
];
/* Tirage en deux temps : les pays de golf connus ont leur propre poids (en %) ; les autres sont regroupés par
   région. Quand une région sort, un pays y est tiré selon x (×3 forte présence au golf, ×2 moyenne, ×1 rare,
   ×0,5 pays ajoutés depuis world_default.xml d'OOTP). Ici, ça revient à donner à chaque pays le poids
   REGION_PCT × x / somme des x de sa région — le résultat est identique et pickNation reste inchangé. */
const REGION_PCT = { asie: 2.9, amerique_latine: 2.18, afrique: 2.18, eu_est: 1.45, eu_petits: 1.16, moyen_orient: 0.73, caraibes: 0.73, oceanie: 0.44 };
(function () {
  const sx = {};
  NATIONS.forEach(function (n) { if (n.grp) sx[n.grp] = (sx[n.grp] || 0) + n.x; });
  NATIONS.forEach(function (n) { if (n.grp) n.weight = REGION_PCT[n.grp] * n.x / sx[n.grp]; });
})();
const NATIONS_W = NATIONS.reduce(function (s, n) { return s + n.weight; }, 0);

/* ---- Drapeaux (emoji Unicode, aucune image externe requise) ----
   Angleterre/Écosse/Pays de Galles : séquences de drapeaux régionaux officielles (pas de code ISO pays).
   Irlande du Nord : aucun drapeau Unicode neutre n'existe pour elle ; le Royaume-Uni (\ud83c\uddec\ud83c\udde7) sert de repli. */
const FLAG_SPECIAL = {
  'England': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',
  'Scotland': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f',
  'Wales': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f'
};
const NATION_ISO = { 'United States':'US','Australia':'AU','South Korea':'KR','Japan':'JP','Sweden':'SE','Canada':'CA','South Africa':'ZA','Ireland':'IE','Spain':'ES','Northern Ireland':'GB','France':'FR','Germany':'DE','Denmark':'DK','New Zealand':'NZ','Argentina':'AR','Thailand':'TH','Italy':'IT','Mexico':'MX','Chinese Taipei':'TW','Belgium':'BE','Netherlands':'NL','Austria':'AT','Switzerland':'CH','Finland':'FI','Norway':'NO','Colombia':'CO','Chile':'CL','Venezuela':'VE','Philippines':'PH','India':'IN','China':'CN','Singapore':'SG','Czech Republic':'CZ','Portugal':'PT','Malaysia':'MY','Indonesia':'ID','Brazil':'BR','United Arab Emirates':'AE','Hong Kong':'HK','Poland':'PL','Hungary':'HU','Slovakia':'SK','Slovenia':'SI','Greece':'GR','Turkey':'TR','Iceland':'IS','Luxembourg':'LU','Cyprus':'CY','Malta':'MT','Monaco':'MC','Liechtenstein':'LI','Andorra':'AD','San Marino':'SM','Uruguay':'UY','Costa Rica':'CR','Panama':'PA','Dominican Republic':'DO','Bahamas':'BS','Barbados':'BB','Jamaica':'JM','Trinidad and Tobago':'TT','Puerto Rico':'PR','Mauritius':'MU','Kenya':'KE','Zimbabwe':'ZW','Morocco':'MA','Egypt':'EG','Tunisia':'TN','Senegal':'SN','Ghana':'GH','Nigeria':'NG','Uganda':'UG','Tanzania':'TZ','Namibia':'NA','Zambia':'ZM','Botswana':'BW','Israel':'IL','Jordan':'JO','Lebanon':'LB','Saudi Arabia':'SA','Qatar':'QA','Oman':'OM','Kuwait':'KW','Bahrain':'BH','Kazakhstan':'KZ','Uzbekistan':'UZ','Pakistan':'PK','Bangladesh':'BD','Sri Lanka':'LK','Nepal':'NP','Cambodia':'KH','Laos':'LA','Mongolia':'MN','Fiji':'FJ','Papua New Guinea':'PG','Guam':'GU','New Caledonia':'NC','French Polynesia':'PF','Bermuda':'BM','Cayman Islands':'KY','British Virgin Islands':'VG','Antigua and Barbuda':'AG','Saint Lucia':'LC','Grenada':'GD','Saint Kitts and Nevis':'KN','Belize':'BZ','Ecuador':'EC','Peru':'PE','Bolivia':'BO','Paraguay':'PY','Cuba':'CU','Honduras':'HN','Guatemala':'GT','El Salvador':'SV','Nicaragua':'NI','Haiti':'HT','Guyana':'GY','Suriname':'SR','Russia':'RU','Ukraine':'UA','Romania':'RO','Vietnam':'VN','Ethiopia':'ET','Iran':'IR','Iraq':'IQ','Algeria':'DZ','Angola':'AO','Mozambique':'MZ','Madagascar':'MG','Ivory Coast':'CI','Cameroon':'CM','Niger':'NE','Burkina Faso':'BF','Mali':'ML','Malawi':'MW','Chad':'TD','Somalia':'SO','Rwanda':'RW','Afghanistan':'AF','Albania':'AL','Armenia':'AM','Azerbaijan':'AZ','Belarus':'BY','Bosnia and Herzegovina':'BA','Brunei':'BN','Bulgaria':'BG','Croatia':'HR','Estonia':'EE','Georgia':'GE','Kyrgyzstan':'KG','Latvia':'LV','Libya':'LY','Lithuania':'LT','Moldova':'MD','Montenegro':'ME','Myanmar':'MM','North Korea':'KP','North Macedonia':'MK','Serbia':'RS','Sudan':'SD','Syria':'SY','Togo':'TG','Turkmenistan':'TM','Yemen':'YE','Burundi':'BI','Benin':'BJ','Cape Verde':'CV','Central African Republic':'CF','Comoros':'KM','Congo':'CG','DR Congo':'CD','Djibouti':'DJ','Equatorial Guinea':'GQ','Eritrea':'ER','Eswatini':'SZ','Gabon':'GA','Gambia':'GM','Guinea':'GN','Guinea-Bissau':'GW','Lesotho':'LS','Liberia':'LR','Mauritania':'MR','Mayotte':'YT','Reunion':'RE','Seychelles':'SC','Sierra Leone':'SL','South Sudan':'SS','Saint Helena':'SH','Sao Tome and Principe':'ST','Western Sahara':'EH','Bhutan':'BT','East Timor':'TL','Macau':'MO','Maldives':'MV','Palestine':'PS','Tajikistan':'TJ','Azores':'PT','Faroe Islands':'FO','Gibraltar':'GI','Guernsey':'GG','Isle of Man':'IM','Jersey':'JE','Kosovo':'XK','Madeira':'PT','Vatican City':'VA','Aland Islands':'AX','Anguilla':'AI','Aruba':'AW','Curacao':'CW','Dominica':'DM','French Guiana':'GF','Greenland':'GL','Guadeloupe':'GP','Martinique':'MQ','Montserrat':'MS','Bonaire':'BQ','Saint Barthelemy':'BL','Saint Martin':'MF','Saint Pierre and Miquelon':'PM','Sint Maarten':'SX','Saint Vincent and the Grenadines':'VC','Turks and Caicos Islands':'TC','US Virgin Islands':'VI','American Samoa':'AS','Cook Islands':'CK','Kiribati':'KI','Marshall Islands':'MH','Micronesia':'FM','Nauru':'NR','Niue':'NU','Northern Mariana Islands':'MP','Palau':'PW','Rapa Nui':'CL','Samoa':'WS','Solomon Islands':'SB','Tokelau':'TK','Tonga':'TO','Tuvalu':'TV','Vanuatu':'VU','Wallis and Futuna':'WF','Falkland Islands':'FK' };
function flagEmoji(natName) {
  if (!natName) return '';
  if (FLAG_SPECIAL[natName]) return FLAG_SPECIAL[natName];
  const iso = NATION_ISO[natName]; if (!iso) return '';
  return String.fromCodePoint.apply(null, iso.toUpperCase().split('').map(function (c) { return 127397 + c.charCodeAt(0); }));
}

/* ---- Drapeaux en SVG (repli fiable : les emojis de drapeaux ne s'affichent pas sur Windows, qui montre
   le code à deux lettres à la place — un choix délibéré de Microsoft, pas un bug). Un bon nombre de
   nations ont un vrai dessin ci-dessous (simplifié : sans écusson/blason quand il y en a un dans la
   vraie version) ; les autres tombent sur un petit badge avec leur code, plutôt qu'un texte flottant. */
function stripesV(c) { const w = 60 / c.length; return c.map(function (x, i) { return '<rect x="' + (i * w) + '" width="' + w + '" height="40" fill="' + x + '"/>'; }).join(''); }
function stripesH(c) { const h = 40 / c.length; return c.map(function (x, i) { return '<rect y="' + (i * h) + '" width="60" height="' + h + '" fill="' + x + '"/>'; }).join(''); }
function nordicCross(bg, fg) { return '<rect width="60" height="40" fill="' + bg + '"/><rect x="18" width="9" height="40" fill="' + fg + '"/><rect y="15" width="60" height="9" fill="' + fg + '"/>'; }
function unionJack(w, h) {
  return '<rect width="' + w + '" height="' + h + '" fill="#00247D"/>' +
    '<line x1="0" y1="0" x2="' + w + '" y2="' + h + '" stroke="#FFFFFF" stroke-width="' + (h * 0.22) + '"/>' +
    '<line x1="' + w + '" y1="0" x2="0" y2="' + h + '" stroke="#FFFFFF" stroke-width="' + (h * 0.22) + '"/>' +
    '<line x1="0" y1="0" x2="' + w + '" y2="' + h + '" stroke="#CF142B" stroke-width="' + (h * 0.09) + '"/>' +
    '<line x1="' + w + '" y1="0" x2="0" y2="' + h + '" stroke="#CF142B" stroke-width="' + (h * 0.09) + '"/>' +
    '<rect x="' + (w * 0.42) + '" width="' + (w * 0.16) + '" height="' + h + '" fill="#FFFFFF"/>' +
    '<rect y="' + (h * 0.375) + '" width="' + w + '" height="' + (h * 0.25) + '" fill="#FFFFFF"/>' +
    '<rect x="' + (w * 0.45) + '" width="' + (w * 0.1) + '" height="' + h + '" fill="#CF142B"/>' +
    '<rect y="' + (h * 0.425) + '" width="' + w + '" height="' + (h * 0.15) + '" fill="#CF142B"/>';
}
const NATION_FLAG_SVG = {
  'France': stripesV(['#0055A4', '#FFFFFF', '#EF4135']),
  'Germany': stripesH(['#000000', '#DD0000', '#FFCE00']),
  'Italy': stripesV(['#009246', '#FFFFFF', '#CE2B37']),
  'Ireland': stripesV(['#169B62', '#FFFFFF', '#FF883E']),
  'Belgium': stripesV(['#000000', '#FDDA24', '#EF3340']),
  'Netherlands': stripesH(['#AE1C28', '#FFFFFF', '#21468B']),
  'Austria': stripesH(['#ED2939', '#FFFFFF', '#ED2939']),
  'Poland': stripesH(['#FFFFFF', '#DC143C']),
  'Hungary': stripesH(['#CE2939', '#FFFFFF', '#477050']),
  'Mexico': stripesV(['#006847', '#FFFFFF', '#CE1126']),
  'Romania': stripesV(['#002B7F', '#FCD116', '#CE1126']),
  'Bulgaria': stripesH(['#FFFFFF', '#00966E', '#D62612']),
  'Ukraine': stripesH(['#005BBB', '#FFD500']),
  'Russia': stripesH(['#FFFFFF', '#0039A6', '#D52B1E']),
  'Armenia': stripesH(['#D90012', '#0033A0', '#F2A800']),
  'Estonia': stripesH(['#0072CE', '#000000', '#FFFFFF']),
  'Latvia': stripesH(['#9E1B32', '#FFFFFF', '#9E1B32']),
  'Lithuania': stripesH(['#FDB913', '#006A44', '#C1272D']),
  'Indonesia': stripesH(['#FF0000', '#FFFFFF']),
  'Monaco': stripesH(['#CE1126', '#FFFFFF']),
  'Luxembourg': stripesH(['#EF3340', '#FFFFFF', '#00A1DE']),
  'Ivory Coast': stripesV(['#F77F00', '#FFFFFF', '#009E60']),
  'Cameroon': stripesV(['#007A5E', '#CE1126', '#FCD116']),
  'Chad': stripesV(['#002664', '#FECB00', '#C60C30']),
  'Senegal': stripesV(['#00853F', '#FDEF42', '#E31B1E']),
  'Mali': stripesV(['#14B53A', '#FCD116', '#CE1126']),
  'Nigeria': stripesV(['#008751', '#FFFFFF', '#008751']),
  'Colombia': '<rect width="60" height="20" fill="#FCD116"/><rect y="20" width="60" height="10" fill="#003893"/><rect y="30" width="60" height="10" fill="#CE1126"/>',
  'Venezuela': '<rect width="60" height="13.33" fill="#FCD116"/><rect y="13.33" width="60" height="13.33" fill="#00247D"/><rect y="26.66" width="60" height="13.34" fill="#CF142B"/>',
  'Thailand': '<rect width="60" height="6.67" fill="#A51931"/><rect y="6.67" width="60" height="6.67" fill="#FFFFFF"/><rect y="13.33" width="60" height="13.33" fill="#2D2A4A"/><rect y="26.67" width="60" height="6.67" fill="#FFFFFF"/><rect y="33.33" width="60" height="6.67" fill="#A51931"/>',
  'Portugal': '<rect width="24" height="40" fill="#046A38"/><rect x="24" width="36" height="40" fill="#DA020E"/>',
  'Spain': '<rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/>',
  'Sweden': nordicCross('#006AA7', '#FECC00'),
  'Finland': nordicCross('#FFFFFF', '#003580'),
  'Norway': nordicCross('#EF2B2D', '#FFFFFF') + '<rect x="20" width="5" height="40" fill="#002868"/><rect y="17" width="60" height="5" fill="#002868"/>',
  'Denmark': nordicCross('#C60C30', '#FFFFFF'),
  'Iceland': nordicCross('#02529C', '#FFFFFF') + '<rect x="20" width="5" height="40" fill="#DC1E35"/><rect y="17" width="60" height="5" fill="#DC1E35"/>',
  'England': '<rect width="60" height="40" fill="#FFFFFF"/><rect x="25" width="10" height="40" fill="#CE1124"/><rect y="15" width="60" height="10" fill="#CE1124"/>',
  'Scotland': '<rect width="60" height="40" fill="#0065BD"/><line x1="0" y1="0" x2="60" y2="40" stroke="#FFFFFF" stroke-width="9"/><line x1="60" y1="0" x2="0" y2="40" stroke="#FFFFFF" stroke-width="9"/>',
  'Switzerland': '<rect width="60" height="40" fill="#FFFFFF"/><rect x="10" width="40" height="40" fill="#FF0000"/><rect x="25" y="10" width="10" height="20" fill="#FFFFFF"/><rect x="19" y="16" width="22" height="8" fill="#FFFFFF"/>',
  'Japan': '<rect width="60" height="40" fill="#FFFFFF"/><circle cx="30" cy="20" r="12" fill="#BC002D"/>',
  'Vietnam': '<rect width="60" height="40" fill="#DA251D"/><polygon points="30,8 33.5,17 43,17 35.5,23 38,33 30,27 22,33 24.5,23 17,17 26.5,17" fill="#FFFF00"/>',
  'China': '<rect width="60" height="40" fill="#DE2910"/><polygon points="14,6 16.5,12.5 23,12.5 17.8,16.5 19.8,23 14,19 8.2,23 10.2,16.5 5,12.5 11.5,12.5" fill="#FFDE00"/>',
  'Turkey': '<rect width="60" height="40" fill="#E30A17"/><circle cx="24" cy="20" r="8" fill="#FFFFFF"/><circle cx="26.5" cy="20" r="6.4" fill="#E30A17"/><polygon points="34,20 37,17.8 36,21.2 38.5,23.4 35,23.2 34,26.5 33,23.2 29.5,23.4 32,21.2 31,17.8" fill="#FFFFFF"/>',
  'Israel': '<rect width="60" height="40" fill="#FFFFFF"/><rect y="4" width="60" height="4" fill="#0038B8"/><rect y="32" width="60" height="4" fill="#0038B8"/><polygon points="30,13 36,23 24,23" fill="none" stroke="#0038B8" stroke-width="1.6"/><polygon points="30,27 24,17 36,17" fill="none" stroke="#0038B8" stroke-width="1.6"/>',
  'Bangladesh': '<rect width="60" height="40" fill="#006A4E"/><circle cx="27" cy="20" r="9" fill="#F42A41"/>',
  'Greece': '<rect y="0" width="60" height="4.44" fill="#0D5EAF"/><rect y="4.44" width="60" height="4.44" fill="#FFFFFF"/><rect y="8.88" width="60" height="4.44" fill="#0D5EAF"/><rect y="13.33" width="60" height="4.44" fill="#FFFFFF"/><rect y="17.77" width="60" height="4.44" fill="#0D5EAF"/><rect y="22.21" width="60" height="4.44" fill="#FFFFFF"/><rect y="26.65" width="60" height="4.44" fill="#0D5EAF"/><rect y="31.09" width="60" height="4.44" fill="#FFFFFF"/><rect y="35.53" width="60" height="4.47" fill="#0D5EAF"/><rect width="22" height="22" fill="#0D5EAF"/><rect x="8" width="6" height="22" fill="#FFFFFF"/><rect y="8" width="22" height="6" fill="#FFFFFF"/>',
  'Canada': '<rect width="15" height="40" fill="#FF0000"/><rect x="15" width="30" height="40" fill="#FFFFFF"/><rect x="45" width="15" height="40" fill="#FF0000"/><path d="M30 9 L32 14 L37.5 12 L35.5 17 L40 19.5 L35 21 L36.5 26.5 L31.5 24 L30 29 L28.5 24 L23.5 26.5 L25 21 L20 19.5 L24.5 17 L22.5 12 L28 14 Z" fill="#FF0000"/>',
  'United States': stripesH(Array.from({ length: 13 }, function (_, i) { return i % 2 === 0 ? '#B22234' : '#FFFFFF'; })) + '<rect width="26" height="21.5" fill="#3C3B6E"/>'
};
/* Drapeaux ajoutés (simplifiés, format 60 × 40) */
Object.assign(NATION_FLAG_SVG, {
  'South Africa': '<rect width="60" height="20" fill="#E03C31"/><rect y="20" width="60" height="20" fill="#001489"/><path d="M-2 -2 L25 20 L-2 42 M25 20 L62 20" stroke="#fff" stroke-width="14" fill="none"/><path d="M-2 -2 L25 20 L-2 42 M25 20 L62 20" stroke="#007A4D" stroke-width="8" fill="none"/><path d="M0 6 L17 20 L0 34 Z" fill="#FFB612"/><path d="M0 10 L12.5 20 L0 30 Z" fill="#000"/>',
  'Wales': '<rect width="60" height="20" fill="#fff"/><rect y="20" width="60" height="20" fill="#00AB39"/><path d="M13 27 C15 18 24 14 30 17 L35 9 L38 15 L44 11 L42 18 L48 17 L43 22 C47 24 48 28 45 31 L40 29 L37 33 L33 29 L25 31 L20 35 L18 31 Z" fill="#D30731"/>',
  'Brazil': '<rect width="60" height="40" fill="#009C3B"/><path d="M6 20 L30 4.5 L54 20 L30 35.5 Z" fill="#FFDF00"/><circle cx="30" cy="20" r="8.5" fill="#002776"/><path d="M21.8 18 Q30 15.5 38.3 21" stroke="#fff" stroke-width="1.6" fill="none"/>',
  'Saudi Arabia': '<rect width="60" height="40" fill="#006C35"/><path d="M15 15 q2.5 -4 5 0 t5 0 t5 0 t5 0 t5 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M16 27 H43" stroke="#fff" stroke-width="1.8"/><path d="M40 24.5 V29.5 M16 27 l-2 -1.5" stroke="#fff" stroke-width="1.4"/>',
  'Sri Lanka': '<rect width="60" height="40" fill="#FFBE29"/><rect x="3" y="3" width="7" height="34" fill="#00534E"/><rect x="10.5" y="3" width="7" height="34" fill="#EB7400"/><rect x="20" y="3" width="37" height="34" fill="#8D153A"/><path d="M29 29 V20 C29 15 33 12 37 13 L40 11 L41 14 C45 15 47 19 46 23 L48 29 H44 L43 25 L38 25 L36 29 Z" fill="#FFBE29"/><path d="M40 30 H47" stroke="#FFBE29" stroke-width="1.6"/>',
  'Nepal': '<rect width="60" height="40" fill="none"/><path d="M19 1 L43 17.5 H27 L43 39 H19 Z" fill="#003893"/><path d="M21 4.5 L37 15.8 H22.5 L38 37 H21 Z" fill="#DC143C"/><circle cx="26.5" cy="12.5" r="2.4" fill="#fff"/><circle cx="26.5" cy="28.5" r="3.2" fill="#fff"/>',
  'Guam': '<rect width="60" height="40" fill="#C62139"/><rect x="2" y="2" width="56" height="36" fill="#00297B"/><path d="M30 8 C37 13 37 27 30 32 C23 27 23 13 30 8 Z" fill="#8FC8E8" stroke="#C62139" stroke-width="1.2"/><path d="M24.6 24 H35.4 C34.5 28 32.5 30 30 32 C27.5 30 25.5 28 24.6 24 Z" fill="#D9C28B"/><path d="M30 14 V22 M27.5 16 L30 14 L32.5 16" stroke="#1B5E20" stroke-width="1.3" fill="none"/>',
  'New Caledonia': '<rect width="60" height="13.4" fill="#0035AD"/><rect y="13.3" width="60" height="13.4" fill="#ED4135"/><rect y="26.6" width="60" height="13.4" fill="#009543"/><circle cx="22" cy="20" r="11" fill="#FAE600" stroke="#000" stroke-width="1.3"/><path d="M22 10 V30 M19 14 H25 M18 19 H26 M19 24 H25" stroke="#000" stroke-width="1.6"/>',
  'Afghanistan': '<rect width="20" height="40" fill="#000"/><rect x="20" width="20" height="40" fill="#D32011"/><rect x="40" width="20" height="40" fill="#007A36"/><circle cx="30" cy="20" r="7.5" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M27 23 H33 V18 L30 15.5 L27 18 Z" fill="#fff"/>'
});

/* Phase 2 (lot 2) : basé sur les descriptions officielles du CIA World Factbook, vérifié visuellement avant intégration. */
Object.assign(NATION_FLAG_SVG, {
  'Australia': '<rect width="60" height="40" fill="#00247D"/>' + unionJack(30, 20) + '<circle cx="15" cy="31" r="2.2" fill="#FFFFFF"/><circle cx="45" cy="8" r="1.6" fill="#FFFFFF"/><circle cx="50" cy="17" r="1.6" fill="#FFFFFF"/><circle cx="47" cy="27" r="1.6" fill="#FFFFFF"/><circle cx="39" cy="30" r="1.3" fill="#FFFFFF"/><circle cx="44" cy="20" r="1" fill="#FFFFFF"/>',
  'New Zealand': '<rect width="60" height="40" fill="#00247D"/>' + unionJack(30, 20) + '<circle cx="46" cy="9" r="2" fill="#CC142B" stroke="#FFFFFF" stroke-width="0.6"/><circle cx="52" cy="19" r="2.3" fill="#CC142B" stroke="#FFFFFF" stroke-width="0.6"/><circle cx="47" cy="29" r="2" fill="#CC142B" stroke="#FFFFFF" stroke-width="0.6"/><circle cx="40" cy="24" r="1.7" fill="#CC142B" stroke="#FFFFFF" stroke-width="0.6"/>',
  'Northern Ireland': unionJack(60, 40),
  'South Korea': '<rect width="60" height="40" fill="#FFFFFF"/><path d="M30,10 A10,10 0 0,1 30,30 A5,5 0 0,0 30,20 A5,5 0 0,1 30,10 Z" fill="#CD2E3A"/><path d="M30,30 A10,10 0 0,1 30,10 A5,5 0 0,0 30,20 A5,5 0 0,1 30,30 Z" fill="#0047A0"/>',
  'Argentina': stripesH(['#75AADB', '#FFFFFF', '#75AADB']),
  'Chinese Taipei': '<rect width="60" height="40" fill="#FE0000"/><rect width="30" height="22" fill="#000095"/><circle cx="15" cy="11" r="5" fill="#FFFFFF"/>',
  'Czech Republic': '<rect width="60" height="20" fill="#FFFFFF"/><rect y="20" width="60" height="20" fill="#D7141A"/><polygon points="0,0 30,20 0,40" fill="#11457E"/>',
  'Malaysia': stripesH(Array.from({ length: 14 }, function (_, i) { return i % 2 === 0 ? '#CC0001' : '#FFFFFF'; })) + '<rect width="28" height="21.5" fill="#010066"/>',
  'United Arab Emirates': stripesH(['#00732F', '#FFFFFF', '#000000']) + '<rect width="15" height="40" fill="#FF0000"/>',
  'Hong Kong': '<rect width="60" height="40" fill="#DE2910"/><circle cx="30" cy="12" r="4" fill="#FFFFFF"/><circle cx="38" cy="17" r="4" fill="#FFFFFF"/><circle cx="35" cy="26" r="4" fill="#FFFFFF"/><circle cx="25" cy="26" r="4" fill="#FFFFFF"/><circle cx="22" cy="17" r="4" fill="#FFFFFF"/>',
  'Slovakia': stripesH(['#FFFFFF', '#0B4EA2', '#EE1C25']),
  'Slovenia': stripesH(['#FFFFFF', '#005DA4', '#ED1C24']),
  'Cyprus': '<rect width="60" height="40" fill="#FFFFFF"/><path d="M20,16 Q26,12 34,15 Q40,17 42,22 Q36,20 30,21 Q24,22 20,16 Z" fill="#D57800"/><path d="M22,26 q4,3 8,1 M32,27 q4,2 8,-1" stroke="#4E7A34" stroke-width="1.4" fill="none"/>',
  'Malta': stripesV(['#FFFFFF', '#CF142B']),
  'Liechtenstein': stripesH(['#002B7F', '#CE1126']),
  'Andorra': stripesV(['#0018A8', '#FEDD00', '#D50032']),
  'San Marino': stripesH(['#FFFFFF', '#5EB6E4']),
  'Uruguay': stripesH(['#FFFFFF', '#0038A8', '#FFFFFF', '#0038A8', '#FFFFFF']) + '<rect width="18" height="8" fill="#FFFFFF"/><circle cx="9" cy="4" r="3" fill="#FCD116"/>',
  'Costa Rica': '<rect width="60" height="8" fill="#002B7F"/><rect y="8" width="60" height="8" fill="#FFFFFF"/><rect y="16" width="60" height="8" fill="#CE1126"/><rect y="24" width="60" height="8" fill="#FFFFFF"/><rect y="32" width="60" height="8" fill="#002B7F"/>',
  'Panama': '<rect width="30" height="20" fill="#FFFFFF"/><rect x="30" width="30" height="20" fill="#DA121A"/><rect y="20" width="30" height="20" fill="#0033A0"/><rect x="30" y="20" width="30" height="20" fill="#FFFFFF"/><polygon points="15,7 16.8,12 22,12 17.8,15.2 19.4,20.2 15,17 10.6,20.2 12.2,15.2 8,12 13.2,12" fill="#0033A0"/><polygon points="45,27 46.8,32 52,32 47.8,35.2 49.4,40.2 45,37 40.6,40.2 42.2,35.2 38,32 43.2,32" fill="#DA121A"/>',
  'Dominican Republic': '<rect width="60" height="40" fill="#FFFFFF"/><rect width="27" height="17" fill="#002D62"/><rect x="33" width="27" height="17" fill="#CE1126"/><rect y="23" width="27" height="17" fill="#CE1126"/><rect x="33" y="23" width="27" height="17" fill="#002D62"/>',
  'Bahamas': '<rect width="60" height="13.3" fill="#00778B"/><rect y="13.3" width="60" height="13.3" fill="#FFC72C"/><rect y="26.6" width="60" height="13.4" fill="#00778B"/><polygon points="0,0 0,40 20,20" fill="#000000"/>',
  'Barbados': stripesV(['#00267F', '#FFC726', '#00267F']),
  'Jamaica': '<polygon points="0,0 60,0 30,20" fill="#009B3A"/><polygon points="0,40 60,40 30,20" fill="#009B3A"/><polygon points="0,0 0,40 30,20" fill="#000000"/><polygon points="60,0 60,40 30,20" fill="#000000"/><line x1="0" y1="0" x2="60" y2="40" stroke="#FED100" stroke-width="7"/><line x1="60" y1="0" x2="0" y2="40" stroke="#FED100" stroke-width="7"/>',
  'Trinidad and Tobago': '<rect width="60" height="40" fill="#CE1126"/><polygon points="0,0 12,0 60,32 60,40 48,40 0,8" fill="#000000" stroke="#FFFFFF" stroke-width="2.2"/>',
  'Puerto Rico': stripesH(['#ED2939', '#FFFFFF', '#ED2939', '#FFFFFF', '#ED2939']) + '<polygon points="0,0 26,20 0,40" fill="#0050F0"/><polygon points="10,14 11.8,19 17,19 12.8,22.2 14.4,27.2 10,24 5.6,27.2 7.2,22.2 3,19 8.2,19" fill="#FFFFFF"/>',
  'Mauritius': stripesH(['#EA2839', '#1A206D', '#FFD500', '#00A551']),
  'Kenya': '<rect width="60" height="7" fill="#000000"/><rect y="7" width="60" height="2" fill="#FFFFFF"/><rect y="9" width="60" height="22" fill="#BB0000"/><rect y="31" width="60" height="2" fill="#FFFFFF"/><rect y="33" width="60" height="7" fill="#006600"/>',
  'Zimbabwe': stripesH(['#006400', '#FFD200', '#D40000', '#000000', '#D40000', '#FFD200', '#006400']) + '<polygon points="0,0 22,20 0,40" fill="#FFFFFF"/><polygon points="0,4 18,20 0,36" fill="#000000"/>',
  'Morocco': '<rect width="60" height="40" fill="#C1272D"/><polygon points="30,13 32,19 38,19 33,22.5 35,28.5 30,25 25,28.5 27,22.5 22,19 28,19" fill="none" stroke="#006233" stroke-width="1.4"/>',
  'Egypt': stripesH(['#CE1126', '#FFFFFF', '#000000']),
  'Tunisia': '<rect width="60" height="40" fill="#E70013"/><circle cx="30" cy="20" r="9" fill="#FFFFFF"/><circle cx="32" cy="20" r="7.2" fill="#E70013"/><polygon points="35,20 39,17.4 37.5,21.8 41,24.6 36.5,24.4 35,29 33.5,24.4 29,24.6 32.5,21.8 31,17.4" fill="#E70013"/>',
  'Ghana': stripesH(['#CE1126', '#FCD116', '#006B3F']) + '<polygon points="30,11 32,17 38,17 33,20.5 35,26.5 30,23 25,26.5 27,20.5 22,17 28,17" fill="#000000"/>',
  'Uganda': stripesH(['#000000', '#FCDC04', '#D90000', '#000000', '#FCDC04', '#D90000']),
  'Tanzania': '<polygon points="0,0 60,0 0,40" fill="#1EB53A"/><polygon points="60,0 60,40 0,40" fill="#00A3DD"/><polygon points="0,10 50,0 60,0 60,7 10,17" fill="#FCD116"/><polygon points="0,10 0,17 10,17" fill="#FCD116"/><polygon points="0,33 50,40 60,40 60,33 10,23" fill="#FCD116"/><polygon points="0,23 0,33 10,23" fill="#FCD116"/><polygon points="0,13 53,0 60,0 60,4 8,16" fill="#000000"/><polygon points="0,13 0,16 8,16" fill="#000000"/><polygon points="0,30 53,40 60,40 60,36 8,24" fill="#000000"/><polygon points="0,24 0,30 8,24" fill="#000000"/>',
  'Namibia': '<polygon points="0,0 60,40 0,40" fill="#003580"/><polygon points="0,0 60,0 60,40" fill="#009543"/><polygon points="0,8 52,40 60,40 60,32 8,0" fill="#D21034"/><polygon points="0,0 0,8 8,0" fill="#FFFFFF"/><polygon points="60,32 60,40 52,40" fill="#FFFFFF"/><circle cx="14" cy="12" r="5.5" fill="#FFCC00"/>',
  'Zambia': '<rect width="60" height="40" fill="#198A00"/><rect x="38" y="24" width="6" height="16" fill="#DE2010"/><rect x="44" y="24" width="6" height="16" fill="#000000"/><rect x="50" y="24" width="6" height="16" fill="#EF7D00"/><polygon points="47,4 51,14 43,14" fill="#EF7D00"/>',
  'Botswana': '<rect width="60" height="40" fill="#75AADB"/><rect y="15.5" width="60" height="9" fill="#FFFFFF"/><rect y="17.5" width="60" height="5" fill="#000000"/>',
  'Jordan': stripesH(['#000000', '#FFFFFF', '#007A3D']) + '<polygon points="0,0 26,20 0,40" fill="#CE1126"/><polygon points="9,15 10.3,19 14.5,19 11.1,21.4 12.4,25.4 9,23 5.6,25.4 6.9,21.4 3.5,19 7.7,19" fill="#FFFFFF"/>',
  'Lebanon': '<rect width="60" height="10" fill="#EE161F"/><rect y="10" width="60" height="20" fill="#FFFFFF"/><rect y="30" width="60" height="10" fill="#EE161F"/><path d="M30,15 L26,24 L34,24 Z" fill="#00A651"/><rect x="29" y="22" width="2" height="6" fill="#6B4226"/>',
  'Qatar': '<rect width="60" height="40" fill="#8D1B3D"/><polygon points="0,0 16,0 22,4 16,8 22,12 16,16 22,20 16,24 22,28 16,32 22,36 16,40 0,40" fill="#FFFFFF"/>',
  'Kuwait': stripesH(['#007A3D', '#FFFFFF', '#CE1126']) + '<polygon points="0,0 15,0 0,13.3" fill="#000000"/><polygon points="0,13.3 15,0 15,40 0,40" fill="#000000"/>',
  'Bahrain': '<rect width="60" height="40" fill="#CE1126"/><polygon points="0,0 22,0 27,4 22,8 27,12 22,16 27,20 22,24 27,28 22,32 27,36 22,40 0,40" fill="#FFFFFF"/>',
  'Kazakhstan': '<rect width="60" height="40" fill="#00AFCA"/><circle cx="24" cy="18" r="7" fill="#FEC50C"/>',
  'Uzbekistan': '<rect width="60" height="12" fill="#1EB53A"/><rect y="12" width="60" height="1.5" fill="#CE1126"/><rect y="13.5" width="60" height="13" fill="#FFFFFF"/><rect y="26.5" width="60" height="1.5" fill="#CE1126"/><rect y="28" width="60" height="12" fill="#1EB53A"/><circle cx="14" cy="6.5" r="4.5" fill="#FFFFFF"/><circle cx="15.5" cy="6.5" r="3.8" fill="#0099B5"/>',
  'Pakistan': '<rect width="60" height="40" fill="#01411C"/><rect width="15" height="40" fill="#FFFFFF"/><circle cx="42" cy="18" r="8" fill="#FFFFFF"/><circle cx="44.5" cy="18" r="6.4" fill="#01411C"/><polygon points="52,10 54.5,17 62,17 56,21.5 58.2,29 52,24.8 45.8,29 48,21.5 42,17 49.5,17" fill="#FFFFFF"/>',
  'India': stripesH(['#FF9933', '#FFFFFF', '#138808']) + '<circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" stroke-width="0.8"/>',
  'Singapore': stripesH(['#EE2536', '#FFFFFF']) + '<circle cx="13" cy="10" r="6.5" fill="#FFFFFF"/><circle cx="15.5" cy="10" r="5.4" fill="#EE2536"/>',
  'Cambodia': '<rect width="60" height="10" fill="#032EA1"/><rect y="10" width="60" height="20" fill="#E00025"/><rect y="30" width="60" height="10" fill="#032EA1"/><rect x="24" y="14" width="12" height="12" fill="#FFFFFF"/><polygon points="24,14 30,8 36,14" fill="#FFFFFF"/>',
  'Laos': '<rect width="60" height="10" fill="#CE1126"/><rect y="10" width="60" height="20" fill="#002868"/><rect y="30" width="60" height="10" fill="#CE1126"/><circle cx="30" cy="20" r="6.5" fill="#FFFFFF"/>',
  'Mongolia': stripesV(['#DA2032', '#015197', '#DA2032']),
  'Fiji': '<rect width="60" height="40" fill="#68BFE5"/>' + '<g transform="translate(0,0) scale(0.5)">' + unionJack(30, 20) + '</g>',
  'Papua New Guinea': '<polygon points="0,0 60,0 0,40" fill="#CE1126"/><polygon points="60,0 60,40 0,40" fill="#000000"/><polygon points="14,8 16,13 21,13 17,16.2 18.6,21 14,18 9.4,21 11,16.2 7,13 12,13" fill="#FCD116"/><circle cx="44" cy="24" r="1.6" fill="#FFFFFF"/><circle cx="50" cy="28" r="1.8" fill="#FFFFFF"/><circle cx="46" cy="33" r="1.6" fill="#FFFFFF"/><circle cx="40" cy="31" r="1.3" fill="#FFFFFF"/><circle cx="43" cy="27" r="1" fill="#FFFFFF"/>',
  'Bermuda': '<rect width="60" height="40" fill="#CE1126"/>' + unionJack(30, 20),
  'Cayman Islands': '<rect width="60" height="40" fill="#00247D"/>' + unionJack(30, 20),
  'British Virgin Islands': '<rect width="60" height="40" fill="#00247D"/>' + unionJack(30, 20),
  'Antigua and Barbuda': '<rect width="60" height="40" fill="#CE1126"/><polygon points="0,0 60,0 30,26" fill="#FFFFFF"/><polygon points="6,2 54,2 30,22" fill="#000000"/><polygon points="6,2 54,2 30,14" fill="#0072C6"/><polygon points="20,7 40,7 30,14" fill="#FCD116"/>',
  'Saint Lucia': '<rect width="60" height="40" fill="#66CCFF"/><polygon points="30,6 46,34 14,34" fill="#FFFFFF"/><polygon points="30,12 40,34 20,34" fill="#000000"/><polygon points="30,12 24,34 20,34" fill="#FFD100"/>',
  'Grenada': '<rect width="60" height="40" fill="#CE1126"/><polygon points="4,4 30,20 4,36" fill="#FCD116"/><polygon points="56,4 30,20 56,36" fill="#FCD116"/><polygon points="4,4 30,4 30,20" fill="#007A5E"/><polygon points="4,36 30,36 30,20" fill="#007A5E"/><polygon points="30,4 56,4 30,20" fill="#007A5E"/><polygon points="30,36 56,36 30,20" fill="#007A5E"/>',
  'Saint Kitts and Nevis': '<polygon points="0,0 60,0 0,40" fill="#009739"/><polygon points="60,0 60,40 0,40" fill="#C8102E"/><polygon points="0,8 52,40 60,40 60,32 8,0" fill="#FCD116" stroke="#000000" stroke-width="1.6"/><circle cx="12" cy="10" r="1.6" fill="#FFFFFF"/><circle cx="18" cy="16" r="1.6" fill="#FFFFFF"/>',
  'Belize': '<rect width="60" height="40" fill="#003F87"/><rect y="3" width="60" height="2" fill="#CE1126"/><rect y="35" width="60" height="2" fill="#CE1126"/><circle cx="30" cy="20" r="10" fill="#FFFFFF"/>',
  'Ecuador': '<rect width="60" height="20" fill="#FFDD00"/><rect y="20" width="60" height="10" fill="#034EA2"/><rect y="30" width="60" height="10" fill="#ED1C24"/>',
  'Peru': stripesV(['#D91023', '#FFFFFF', '#D91023']),
  'Bolivia': stripesH(['#D52B1E', '#F9E300', '#007934']),
  'Paraguay': stripesH(['#D52B1E', '#FFFFFF', '#0038A8']),
  'Cuba': stripesH(['#002A8F', '#FFFFFF', '#002A8F', '#FFFFFF', '#002A8F']) + '<polygon points="0,0 26,20 0,40" fill="#CE1126"/><polygon points="10,14 11.8,19 17,19 12.8,22.2 14.4,27.2 10,24 5.6,27.2 7.2,22.2 3,19 8.2,19" fill="#FFFFFF"/>',
  'Honduras': stripesH(['#0073CF', '#FFFFFF', '#0073CF']),
  'Guatemala': stripesV(['#4997D0', '#FFFFFF', '#4997D0']),
  'El Salvador': stripesH(['#0047AB', '#FFFFFF', '#0047AB']),
  'Nicaragua': stripesH(['#0067C6', '#FFFFFF', '#0067C6']),
  'Haiti': stripesH(['#00209F', '#D21034']),
  'Guyana': '<rect width="60" height="40" fill="#009E49"/><polygon points="0,0 40,20 0,40" fill="#FCD116"/><polygon points="0,0 26,20 0,40" fill="#CE1126"/><polygon points="0,0 26,20 0,40" fill="none" stroke="#000000" stroke-width="1"/><polygon points="0,0 40,20 0,40" fill="none" stroke="#FFFFFF" stroke-width="1"/>',
  'Suriname': '<rect width="60" height="40" fill="#377E3F"/><rect y="7" width="60" height="4" fill="#FFFFFF"/><rect y="11" width="60" height="18" fill="#B40A2D"/><rect y="29" width="60" height="4" fill="#FFFFFF"/><polygon points="30,15 31.5,19.5 36.2,19.5 32.4,22.2 33.8,26.7 30,24 26.2,26.7 27.6,22.2 23.8,19.5 28.5,19.5" fill="#ECC81D"/>',
  'Philippines': '<rect width="60" height="20" fill="#0038A8"/><rect y="20" width="60" height="20" fill="#CE1126"/><polygon points="0,0 26,20 0,40" fill="#FFFFFF"/><circle cx="9" cy="20" r="4.5" fill="#FCD116"/>',
  'Ethiopia': stripesH(['#078930', '#FCDD09', '#DA121A']) + '<circle cx="30" cy="20" r="6.5" fill="#0F47AF"/>',
  'Iran': stripesH(['#239F40', '#FFFFFF', '#DA0000']),
  'Iraq': stripesH(['#CE1126', '#FFFFFF', '#000000']) + '<circle cx="20" cy="20" r="1.2" fill="#007A3D"/><circle cx="30" cy="20" r="1.2" fill="#007A3D"/><circle cx="40" cy="20" r="1.2" fill="#007A3D"/>',
  'Algeria': '<rect width="30" height="40" fill="#006233"/><rect x="30" width="30" height="40" fill="#FFFFFF"/><circle cx="30" cy="20" r="7" fill="none" stroke="#D21034" stroke-width="1.6"/><circle cx="32.5" cy="20" r="5.8" fill="#FFFFFF"/><polygon points="34,20 37.5,18 36,21.6 39,23.8 35.2,23.6 34,27.2 32.8,23.6 29,23.8 32,21.6 30.5,18" fill="#D21034"/>',
  'Angola': stripesH(['#CE1126', '#000000']) + '<polygon points="30,12 32,17 37,17 33,20 34.5,25 30,22 25.5,25 27,20 23,17 28,17" fill="#FCD116"/>',
  'Mozambique': stripesH(['#009739', '#000000', '#FCD116']) + '<polygon points="0,0 26,20 0,40" fill="#CE1126"/>',
  'Madagascar': '<rect width="18" height="40" fill="#FFFFFF"/><rect x="18" width="42" height="20" fill="#FC3D32"/><rect x="18" y="20" width="42" height="20" fill="#007E3A"/>',
  'Niger': stripesH(['#E05206', '#FFFFFF', '#0DB02B']) + '<circle cx="30" cy="20" r="4" fill="#E05206"/>',
  'Burkina Faso': stripesH(['#EF2B2D', '#009E49']) + '<polygon points="30,12 32,18 38,18 33,21.6 35,27.6 30,24 25,27.6 27,21.6 22,18 28,18" fill="#FCD116"/>',
  'Malawi': stripesH(['#000000', '#CE1126', '#33B349']) + '<circle cx="30" cy="7" r="6" fill="#CE1126"/>',
  'Somalia': '<rect width="60" height="40" fill="#4189DD"/><polygon points="30,11 32,17 38,17 33,20.5 35,26.5 30,23 25,26.5 27,20.5 22,17 28,17" fill="#FFFFFF"/>',
  'Rwanda': '<rect width="60" height="24" fill="#00A1DE"/><rect y="24" width="60" height="8" fill="#FAD201"/><rect y="32" width="60" height="8" fill="#20603D"/><circle cx="44" cy="10" r="5" fill="#E5BE01"/>',
  'Albania': '<rect width="60" height="40" fill="#E41E20"/>',
  'Azerbaijan': stripesH(['#00B9E4', '#EF3340', '#509E2F']) + '<circle cx="30" cy="20" r="7" fill="none" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="32" cy="20" r="5.6" fill="#EF3340"/><polygon points="38,20 42,17.8 40.8,21.4 44,23.6 40.2,23.4 38.8,27 37.6,23.4 33.8,23.6 37,21.4 35.8,17.8" fill="#FFFFFF"/>',
  'Belarus': '<rect width="60" height="26.7" fill="#D22730"/><rect y="26.7" width="60" height="13.3" fill="#007A3D"/><rect width="8" height="40" fill="#FFFFFF"/>',
  'Bosnia and Herzegovina': '<rect width="60" height="40" fill="#002395"/><polygon points="0,0 22,0 60,40 38,40" fill="#FECB00"/><circle cx="12" cy="6" r="1.4" fill="#FFFFFF"/><circle cx="19" cy="13" r="1.4" fill="#FFFFFF"/><circle cx="26" cy="20" r="1.4" fill="#FFFFFF"/><circle cx="33" cy="27" r="1.4" fill="#FFFFFF"/><circle cx="40" cy="34" r="1.4" fill="#FFFFFF"/>',
  'Brunei': '<rect width="60" height="40" fill="#FEC10E"/><polygon points="0,0 60,26.7 60,33.3 0,6.7" fill="#FFFFFF"/><polygon points="0,6.7 60,33.3 60,40 0,13.3" fill="#000000"/>',
  'Croatia': stripesH(['#FF0000', '#FFFFFF', '#171796']),
  'Georgia': '<rect width="60" height="40" fill="#FFFFFF"/><rect y="17" width="60" height="6" fill="#FF0000"/><rect x="27" width="6" height="40" fill="#FF0000"/><rect x="6" y="5" width="5" height="5" fill="#FF0000"/><rect x="49" y="5" width="5" height="5" fill="#FF0000"/><rect x="6" y="30" width="5" height="5" fill="#FF0000"/><rect x="49" y="30" width="5" height="5" fill="#FF0000"/>',
  'Kyrgyzstan': '<rect width="60" height="40" fill="#E8112D"/><circle cx="30" cy="20" r="9" fill="#FCE300"/><circle cx="30" cy="20" r="3.5" fill="#E8112D"/>',
  'Moldova': stripesV(['#0018A8', '#FFD200', '#D00C27']),
  'Montenegro': '<rect width="60" height="40" fill="#D40000"/><rect x="2.5" y="2.5" width="55" height="35" fill="none" stroke="#D4AF37" stroke-width="2.5"/><circle cx="30" cy="20" r="7" fill="#D4AF37"/>',
  'Myanmar': stripesH(['#FECB00', '#34B233', '#EA2839']) + '<polygon points="30,12 32.5,18.5 39.5,18.5 33.8,22.5 36,29 30,25 24,29 26.2,22.5 20.5,18.5 27.5,18.5" fill="#FFFFFF"/>',
  'North Korea': '<rect width="60" height="7" fill="#024FA2"/><rect y="7" width="60" height="2" fill="#FFFFFF"/><rect y="9" width="60" height="22" fill="#ED1C27"/><rect y="31" width="60" height="2" fill="#FFFFFF"/><rect y="33" width="60" height="7" fill="#024FA2"/><circle cx="16" cy="20" r="7" fill="#FFFFFF"/><polygon points="16,15 17.5,19 22,19 18.5,21.5 19.8,26 16,23.3 12.2,26 13.5,21.5 10,19 14.5,19" fill="#ED1C27"/>',
  'North Macedonia': '<rect width="60" height="40" fill="#D20000"/><circle cx="30" cy="20" r="6" fill="#FFE600"/>' + Array.from({ length: 8 }).map(function (_, i) { const a = i * 45 * Math.PI / 180, x2 = 30 + 40 * Math.cos(a), y2 = 20 + 40 * Math.sin(a), x1 = 30 + 5 * Math.cos(a), y1 = 20 + 5 * Math.sin(a); return '<polygon points="' + x1 + ',' + y1 + ' ' + x2 + ',' + (y2 - 3) + ' ' + x2 + ',' + (y2 + 3) + '" fill="#FFE600"/>'; }).join(''),
  'Serbia': stripesH(['#C6363C', '#0C4076', '#FFFFFF']),
  'Sudan': stripesH(['#D21034', '#FFFFFF', '#000000']) + '<polygon points="0,0 20,20 0,40" fill="#007229"/>',
  'Syria': stripesH(['#CE1126', '#FFFFFF', '#000000']) + '<polygon points="24,17 25.2,20.6 29,20.6 25.9,22.8 27.1,26.4 24,24.2 20.9,26.4 22.1,22.8 19,20.6 22.8,20.6" fill="#007A3D"/><polygon points="36,17 37.2,20.6 41,20.6 37.9,22.8 39.1,26.4 36,24.2 32.9,26.4 34.1,22.8 31,20.6 34.8,20.6" fill="#007A3D"/>',
  'Togo': stripesH(['#006A4E', '#FCD116', '#006A4E', '#FCD116', '#006A4E']) + '<rect width="16" height="21.5" fill="#D21034"/><polygon points="8,7 9.5,11 13.5,11 10.2,13.4 11.5,17.4 8,15 4.5,17.4 5.8,13.4 2.5,11 6.5,11" fill="#FFFFFF"/>',
  'Turkmenistan': '<rect width="60" height="40" fill="#2A8B3D"/><rect x="8" width="10" height="40" fill="#CE1126"/>',
  'Yemen': stripesH(['#CE1126', '#FFFFFF', '#000000']),
  'Chile': '<rect width="60" height="20" fill="#FFFFFF"/><rect y="20" width="60" height="20" fill="#D52B1E"/><rect width="20" height="20" fill="#0039A6"/><polygon points="10,7 11.8,12.2 17,12.2 12.8,15.4 14.4,20.4 10,17 5.6,20.4 7.2,15.4 3,12.2 8.2,12.2" fill="#FFFFFF"/>',
  'Oman': '<rect width="60" height="13.3" fill="#FFFFFF"/><rect y="13.3" width="60" height="13.3" fill="#DB161B"/><rect y="26.6" width="60" height="13.4" fill="#008000"/><rect width="15" height="40" fill="#DB161B"/>',
  'Libya': '<rect width="60" height="8" fill="#E70013"/><rect y="8" width="60" height="24" fill="#000000"/><rect y="32" width="60" height="8" fill="#239E46"/><circle cx="30" cy="20" r="6" fill="#FFFFFF"/><circle cx="32" cy="20" r="4.8" fill="#000000"/><polygon points="38,20 42,17.8 40.8,21.4 44,23.6 40.2,23.4 38.8,27 37.6,23.4 33.8,23.6 37,21.4 35.8,17.8" fill="#FFFFFF"/>',
  'French Polynesia': '<rect width="60" height="40" fill="#FFFFFF"/><rect width="60" height="6" fill="#CE1126"/><rect y="34" width="60" height="6" fill="#CE1126"/><circle cx="30" cy="20" r="7" fill="#002169"/><circle cx="30" cy="20" r="5" fill="#FCD116"/>'
});
/* Phase 3 : drapeaux des 77 nations ajoutées depuis world_default.xml (simplifiés, format 60 × 40).
   Les territoires qui utilisent officiellement le drapeau français l'affichent ; les territoires britanniques
   reprennent l'Union Jack en canton avec un écusson simplifié. */
function star5(cx, cy, R, fill) { let p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? R * 0.4 : R, a = -Math.PI / 2 + i * Math.PI / 5; p.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2)); } return '<polygon points="' + p.join(' ') + '" fill="' + fill + '"/>'; }
function blueEnsign(bg, shield) { return '<rect width="60" height="40" fill="' + (bg || '#012169') + '"/>' + unionJack(30, 20) + (shield || ''); }
function shieldAt(cx, cy, fill, inner) { return '<path d="M' + (cx - 7) + ' ' + (cy - 8) + ' H' + (cx + 7) + ' V' + (cy + 1) + ' C' + (cx + 7) + ' ' + (cy + 6) + ' ' + (cx + 3) + ' ' + (cy + 8) + ' ' + cx + ' ' + (cy + 10) + ' C' + (cx - 3) + ' ' + (cy + 8) + ' ' + (cx - 7) + ' ' + (cy + 6) + ' ' + (cx - 7) + ' ' + (cy + 1) + ' Z" fill="' + fill + '" stroke="#FFFFFF" stroke-width="1"/>' + (inner || ''); }
const FR_FLAG = stripesV(['#0055A4', '#FFFFFF', '#EF4135']);
Object.assign(NATION_FLAG_SVG, {
  /* ---- Afrique ---- */
  'Benin': '<rect width="24" height="40" fill="#008751"/><rect x="24" width="36" height="20" fill="#FCD116"/><rect x="24" y="20" width="36" height="20" fill="#E8112D"/>',
  'Burundi': '<rect width="60" height="40" fill="#CE1126"/><polygon points="0,0 30,20 0,40" fill="#1EB53A"/><polygon points="60,0 30,20 60,40" fill="#1EB53A"/><line x1="0" y1="0" x2="60" y2="40" stroke="#FFFFFF" stroke-width="6"/><line x1="60" y1="0" x2="0" y2="40" stroke="#FFFFFF" stroke-width="6"/><circle cx="30" cy="20" r="9" fill="#FFFFFF"/>' + star5(30, 16, 2.6, '#CE1126') + star5(26.5, 22.5, 2.6, '#CE1126') + star5(33.5, 22.5, 2.6, '#CE1126'),
  'Cape Verde': '<rect width="60" height="40" fill="#003893"/><rect y="20" width="60" height="8" fill="#FFFFFF"/><rect y="22.7" width="60" height="2.6" fill="#CF2027"/>' + Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return star5(22 + 9 * Math.cos(a), 24 + 9 * Math.sin(a), 1.6, '#F7D116'); }).join(''),
  'Central African Republic': stripesH(['#003082', '#FFFFFF', '#289728', '#FFCE00']) + '<rect x="26" width="8" height="40" fill="#D21034"/>' + star5(9, 5, 3.4, '#FFCE00'),
  'Comoros': stripesH(['#FFC61E', '#FFFFFF', '#CE1126', '#3A75C4']) + '<polygon points="0,0 22,20 0,40" fill="#3D8E33"/><circle cx="8" cy="20" r="6" fill="#FFFFFF"/><circle cx="10.4" cy="20" r="5.2" fill="#3D8E33"/>' + [14, 18, 22, 26].map(y => star5(12.5, y, 1, '#FFFFFF')).join(''),
  'Congo': '<polygon points="0,0 40,0 0,40" fill="#009543"/><polygon points="60,0 60,40 20,40" fill="#DC241F"/><polygon points="40,0 60,0 20,40 0,40" fill="#FBDE4A"/>',
  'DR Congo': '<rect width="60" height="40" fill="#007FFF"/><polygon points="0,32 52,0 60,0 60,8 8,40 0,40" fill="#F7D618"/><polygon points="0,35 56,0 60,0 60,5 4,40 0,40" fill="#CE1021"/>' + star5(11, 10, 6, '#F7D618'),
  'Djibouti': '<rect width="60" height="20" fill="#6AB2E7"/><rect y="20" width="60" height="20" fill="#12AD2B"/><polygon points="0,0 34,20 0,40" fill="#FFFFFF"/>' + star5(11, 20, 4.5, '#D7141A'),
  'Equatorial Guinea': stripesH(['#3E9A00', '#FFFFFF', '#E32118']) + '<polygon points="0,0 15,20 0,40" fill="#0073CE"/><rect x="27" y="15" width="6" height="10" rx="1" fill="#C9C9C9"/>',
  'Eritrea': '<polygon points="0,0 60,0 60,20" fill="#12AD2B"/><polygon points="0,40 60,40 60,20" fill="#4189DD"/><polygon points="0,0 60,20 0,40" fill="#EA0437"/><circle cx="14" cy="20" r="7" fill="none" stroke="#FFC726" stroke-width="2"/><line x1="14" y1="14" x2="14" y2="26" stroke="#FFC726" stroke-width="1.6"/>',
  'Eswatini': '<rect width="60" height="40" fill="#3E5EB9"/><rect y="8" width="60" height="24" fill="#FFD900"/><rect y="10.5" width="60" height="19" fill="#B10C0C"/><ellipse cx="30" cy="20" rx="13" ry="6.5" fill="#FFFFFF"/><path d="M30 13.5 A13 6.5 0 0 1 30 26.5 A13 6.5 0 0 1 17 20 A13 6.5 0 0 1 30 13.5 Z" fill="none"/><path d="M30 13.5 A13 6.5 0 0 0 30 26.5 L30 13.5" fill="#000000"/><path d="M17 20 A13 6.5 0 0 0 30 26.5 V13.5 A13 6.5 0 0 0 17 20 Z" fill="#000000"/>',
  'Gabon': stripesH(['#009E60', '#FCD116', '#3A75C4']),
  'Gambia': '<rect width="60" height="13" fill="#CE1126"/><rect y="13" width="60" height="1.5" fill="#FFFFFF"/><rect y="14.5" width="60" height="11" fill="#0C1C8C"/><rect y="25.5" width="60" height="1.5" fill="#FFFFFF"/><rect y="27" width="60" height="13" fill="#3A7728"/>',
  'Guinea': stripesV(['#CE1126', '#FCD116', '#009460']),
  'Guinea-Bissau': '<rect width="60" height="20" fill="#FCD116"/><rect y="20" width="60" height="20" fill="#009E49"/><rect width="20" height="40" fill="#CE1126"/>' + star5(10, 20, 6, '#000000'),
  'Lesotho': '<rect width="60" height="12" fill="#00209F"/><rect y="12" width="60" height="16" fill="#FFFFFF"/><rect y="28" width="60" height="12" fill="#009543"/><path d="M24 25 L36 25 L33 22 L31 16 L30 13 L29 16 L27 22 Z" fill="#000000"/><path d="M23 25.5 H37" stroke="#000000" stroke-width="1.4"/>',
  'Liberia': stripesH(Array.from({ length: 11 }, (_, i) => i % 2 === 0 ? '#BF0A30' : '#FFFFFF')) + '<rect width="18.2" height="18.2" fill="#002868"/>' + star5(9.1, 9.4, 6, '#FFFFFF'),
  'Mauritania': '<rect width="60" height="40" fill="#00A95C"/><rect width="60" height="6" fill="#D01C1F"/><rect y="34" width="60" height="6" fill="#D01C1F"/><path d="M21 18 A9 9 0 0 0 39 18 A9 7 0 0 1 21 18 Z" fill="#FFD700"/>' + star5(30, 15, 3.4, '#FFD700'),
  'Mayotte': FR_FLAG,
  'Reunion': FR_FLAG,
  'Saint Helena': blueEnsign('#012169', shieldAt(45, 20, '#5AA3D8', '<rect x="38.5" y="22" width="13" height="6" fill="#1E6B33"/><path d="M41 21 L49 21 L47 17 L43 17 Z" fill="#FFFFFF"/>')),
  'Sao Tome and Principe': '<rect width="60" height="12" fill="#12AD2B"/><rect y="12" width="60" height="16" fill="#FFCE00"/><rect y="28" width="60" height="12" fill="#12AD2B"/><polygon points="0,0 18,20 0,40" fill="#D21034"/>' + star5(29, 20, 4.2, '#000000') + star5(43, 20, 4.2, '#000000'),
  'Seychelles': '<rect width="60" height="40" fill="#007A3D"/><polygon points="0,40 0,0 20,0" fill="#003F87"/><polygon points="0,40 20,0 40,0" fill="#FCD856"/><polygon points="0,40 40,0 60,0 60,13.3" fill="#D62828"/><polygon points="0,40 60,13.3 60,26.6" fill="#FFFFFF"/>',
  'Sierra Leone': stripesH(['#1EB53A', '#FFFFFF', '#0072C6']),
  'South Sudan': '<rect width="60" height="12" fill="#000000"/><rect y="12" width="60" height="2" fill="#FFFFFF"/><rect y="14" width="60" height="12" fill="#DA121A"/><rect y="26" width="60" height="2" fill="#FFFFFF"/><rect y="28" width="60" height="12" fill="#078930"/><polygon points="0,0 26,20 0,40" fill="#0F47AF"/>' + star5(8.5, 20, 5, '#FCDD09'),
  'Western Sahara': stripesH(['#000000', '#FFFFFF', '#007A3D']) + '<polygon points="0,0 20,20 0,40" fill="#C4111B"/><circle cx="31" cy="20" r="5.5" fill="#C4111B"/><circle cx="32.8" cy="20" r="4.6" fill="#FFFFFF"/>' + star5(34, 20, 3, '#C4111B'),
  /* ---- Asie ---- */
  'Bhutan': '<polygon points="0,0 60,0 0,40" fill="#FFD520"/><polygon points="60,0 60,40 0,40" fill="#FF4E12"/><path d="M14 27 C20 30 24 22 30 24 C36 26 38 16 46 15 C42 20 40 24 34 27 C28 31 22 33 14 27 Z" fill="#FFFFFF" stroke="#C9C9C9" stroke-width=".5"/>',
  'East Timor': '<rect width="60" height="40" fill="#DC241F"/><polygon points="0,0 30,20 0,40" fill="#FFC726"/><polygon points="0,0 20,20 0,40" fill="#000000"/>' + star5(7.5, 20, 4.5, '#FFFFFF'),
  'Macau': '<rect width="60" height="40" fill="#00785E"/><path d="M22 25 C24 18 28 16 30 14 C32 16 36 18 38 25 C34 23 32 23 30 25 C28 23 26 23 22 25 Z" fill="#FFFFFF"/><path d="M21 27 H39 M23 29.5 H37" stroke="#FFFFFF" stroke-width="1.2"/>' + star5(30, 7, 2.6, '#FBD116') + star5(23, 9, 1.6, '#FBD116') + star5(37, 9, 1.6, '#FBD116') + star5(18.5, 13, 1.6, '#FBD116') + star5(41.5, 13, 1.6, '#FBD116'),
  'Maldives': '<rect width="60" height="40" fill="#D21034"/><rect x="10" y="7" width="40" height="26" fill="#007E3A"/><circle cx="31" cy="20" r="7.5" fill="#FFFFFF"/><circle cx="34" cy="20" r="6.5" fill="#007E3A"/>',
  'Palestine': stripesH(['#000000', '#FFFFFF', '#149954']) + '<polygon points="0,0 22,20 0,40" fill="#E4312B"/>',
  'Tajikistan': '<rect width="60" height="11.4" fill="#CC0000"/><rect y="11.4" width="60" height="17.2" fill="#FFFFFF"/><rect y="28.6" width="60" height="11.4" fill="#006600"/><path d="M26.5 22 L27 18.5 L28.7 20 L30 17.5 L31.3 20 L33 18.5 L33.5 22 Z" fill="#F8C300"/>' + [[22, 19], [24, 15.5], [27.5, 13.5], [32.5, 13.5], [36, 15.5], [38, 19], [30, 12.7]].slice(0, 7).map(([x, y]) => star5(x, y, 1.2, '#F8C300')).join(''),
  /* ---- Europe ---- */
  'Azores': '<rect width="60" height="40" fill="#FFFFFF"/><rect width="24" height="40" fill="#0B4EA2"/><path d="M27 21 C29 16 34 15 38 17 L43 15 L41 19 C42 23 38 26 33 25 L29 27 Z" fill="#D4A017"/>' + [[52, 8], [54, 13], [52, 18], [54, 23], [52, 28], [54, 33], [56, 18], [56, 28], [50, 13]].map(([x, y]) => star5(x, y, 1.3, '#D4A017')).join(''),
  'Faroe Islands': nordicCross('#FFFFFF', '#0065BD') + '<rect x="20" width="5" height="40" fill="#EF303E"/><rect y="17.5" width="60" height="5" fill="#EF303E"/>',
  'Gibraltar': '<rect width="60" height="27" fill="#FFFFFF"/><rect y="27" width="60" height="13" fill="#DA000C"/><rect x="21" y="12" width="18" height="15" fill="#DA000C"/><rect x="25" y="6" width="10" height="7" fill="#DA000C"/><path d="M21 12 v-3 h3 v3 M36 12 v-3 h3 v3 M25 6 v-3 h2.5 v3 M32.5 6 v-3 h2.5 v3" fill="#DA000C"/><rect x="28" y="19" width="4" height="8" fill="#000000"/><path d="M30 29 V37 M30 33 H33 M30 36 H32" stroke="#F8D80C" stroke-width="1.6"/>',
  'Guernsey': '<rect width="60" height="40" fill="#FFFFFF"/><rect x="25" width="10" height="40" fill="#E8112D"/><rect y="15" width="60" height="10" fill="#E8112D"/><rect x="28.5" y="16.5" width="3" height="7" fill="#F9DD16"/><rect x="25.5" y="18.5" width="9" height="3" fill="#F9DD16"/>',
  'Isle of Man': '<rect width="60" height="40" fill="#CF142B"/><g fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M30 20 L23 13 L18 15"/><path d="M30 20 L39 17 L41 22"/><path d="M30 20 L29 29 L24 31"/></g><circle cx="30" cy="20" r="2.2" fill="#FFFFFF"/>',
  'Jersey': '<rect width="60" height="40" fill="#FFFFFF"/><line x1="0" y1="0" x2="60" y2="40" stroke="#DF112D" stroke-width="5"/><line x1="60" y1="0" x2="0" y2="40" stroke="#DF112D" stroke-width="5"/><path d="M25.5 4 H34.5 V10 C34.5 13 32 14.5 30 15.5 C28 14.5 25.5 13 25.5 10 Z" fill="#DF112D" stroke="#F9DD16" stroke-width=".8"/><path d="M27 7 H33 M27 9.5 H33 M27.5 12 H32.5" stroke="#F9DD16" stroke-width=".9"/>',
  'Kosovo': '<rect width="60" height="40" fill="#244AA5"/><path d="M22 18 L28 14 L35 15 L39 19 L38 25 L33 30 L27 29 L24 25 Z" fill="#D0A650"/>' + [[17, 11], [21.5, 8], [26.5, 6.5], [33.5, 6.5], [38.5, 8], [43, 11]].map(([x, y]) => star5(x, y, 2, '#FFFFFF')).join(''),
  'Madeira': stripesV(['#0E3D8C', '#FFD700', '#0E3D8C']) + '<rect x="27" y="11" width="6" height="18" fill="#FFFFFF"/><rect x="21" y="17" width="18" height="6" fill="#FFFFFF"/><rect x="28.2" y="12.2" width="3.6" height="15.6" fill="#E21C21"/><rect x="22.2" y="18.2" width="15.6" height="3.6" fill="#E21C21"/>',
  'Vatican City': '<rect width="30" height="40" fill="#FFE000"/><rect x="30" width="30" height="40" fill="#FFFFFF"/><line x1="38" y1="30" x2="52" y2="14" stroke="#D4AF37" stroke-width="2.2"/><line x1="52" y1="30" x2="38" y2="14" stroke="#B0B0B0" stroke-width="2.2"/><path d="M41 12 L45 6 L49 12 Z" fill="#D4AF37"/><circle cx="45" cy="5" r="1.4" fill="#D4AF37"/>',
  'Aland Islands': nordicCross('#0064AD', '#FFD300') + '<rect x="20" width="5" height="40" fill="#DA0E15"/><rect y="17.5" width="60" height="5" fill="#DA0E15"/>',
  'Greenland': '<rect width="60" height="20" fill="#FFFFFF"/><rect y="20" width="60" height="20" fill="#D00C33"/><path d="M12 20 A10 10 0 0 1 32 20 Z" fill="#D00C33"/><path d="M12 20 A10 10 0 0 0 32 20 Z" fill="#FFFFFF"/>',
  'Saint Pierre and Miquelon': FR_FLAG,
  /* ---- Caraïbes ---- */
  'Anguilla': blueEnsign('#012169', shieldAt(45, 20, '#FFFFFF', '<rect x="38.5" y="25" width="13" height="4" fill="#7BC8F6"/><circle cx="42" cy="18" r="2" fill="#F18A00"/><circle cx="48" cy="18" r="2" fill="#F18A00"/><circle cx="45" cy="22.5" r="2" fill="#F18A00"/>')),
  'Aruba': '<rect width="60" height="40" fill="#418FDE"/><rect y="26" width="60" height="2" fill="#FFD100"/><rect y="30" width="60" height="2" fill="#FFD100"/><polygon points="10,4 11.6,10.4 18,12 11.6,13.6 10,20 8.4,13.6 2,12 8.4,10.4" fill="#C8102E" stroke="#FFFFFF" stroke-width=".9"/>',
  'Bonaire': '<rect width="60" height="40" fill="#FFFFFF"/><polygon points="0,0 22,0 0,16" fill="#FFD100"/><polygon points="60,10 60,40 18,40" fill="#012A87"/><circle cx="22" cy="17" r="6" fill="none" stroke="#000000" stroke-width="1"/>' + star5(22, 17, 4, '#DC171D'),
  'Curacao': '<rect width="60" height="40" fill="#002B7F"/><rect y="25" width="60" height="5" fill="#F9E814"/>' + star5(7, 7, 3, '#FFFFFF') + star5(14, 13, 4, '#FFFFFF'),
  'Dominica': '<rect width="60" height="40" fill="#006B3F"/><rect x="25" width="10" height="40" fill="#FCD116"/><rect x="28.3" width="3.4" height="40" fill="#000000"/><rect x="31.7" width="3.3" height="40" fill="#FFFFFF"/><rect y="15" width="60" height="10" fill="#FCD116"/><rect y="18.3" width="60" height="3.4" fill="#000000"/><rect y="21.7" width="60" height="3.3" fill="#FFFFFF"/><circle cx="30" cy="20" r="9" fill="#D41C30"/><ellipse cx="30" cy="20" rx="2.6" ry="4.5" fill="#6A2F8C"/>' + Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return star5(30 + 7 * Math.cos(a), 20 + 7 * Math.sin(a), 1.1, '#006B3F'); }).join(''),
  'Guadeloupe': FR_FLAG,
  'Martinique': '<rect width="60" height="20" fill="#00A65D"/><rect y="20" width="60" height="20" fill="#000000"/><polygon points="0,0 30,20 0,40" fill="#E1001A"/>',
  'Montserrat': blueEnsign('#012169', shieldAt(45, 20, '#00A2E8', '<rect x="38.5" y="23" width="13" height="5" fill="#6E4B2E"/><path d="M44 15 V26 M41 18 H47" stroke="#FFD700" stroke-width="1.4"/><circle cx="42" cy="22" r="1.4" fill="#2E7D32"/>')),
  'Saint Barthelemy': FR_FLAG,
  'Saint Martin': FR_FLAG,
  'Saint Vincent and the Grenadines': '<rect width="15" height="40" fill="#002674"/><rect x="15" width="30" height="40" fill="#FCD022"/><rect x="45" width="15" height="40" fill="#009E60"/><polygon points="24,14 27,19 24,24 21,19" fill="#009E60"/><polygon points="36,14 39,19 36,24 33,19" fill="#009E60"/><polygon points="30,21 33,26 30,31 27,26" fill="#009E60"/>',
  'Sint Maarten': '<rect width="60" height="20" fill="#DC171D"/><rect y="20" width="60" height="20" fill="#012A87"/><polygon points="0,0 28,20 0,40" fill="#FFFFFF"/><circle cx="9" cy="20" r="4.5" fill="#FFD100" stroke="#DC171D" stroke-width=".8"/>',
  'Turks and Caicos Islands': blueEnsign('#012169', shieldAt(45, 20, '#FFD100', '<path d="M42 21 H48 L47 15 H43 Z" fill="#E8742E"/><path d="M45 21 V26" stroke="#2E7D32" stroke-width="1.6"/><circle cx="41.5" cy="25" r="1.3" fill="#C2185B"/>')),
  'US Virgin Islands': '<rect width="60" height="40" fill="#FFFFFF"/><path d="M22 16 C25 12 28 12 30 9 C32 12 35 12 38 16 C35 17 33 17 30 15 C27 17 25 17 22 16 Z" fill="#F7C600"/><path d="M26 17 H34 V24 C34 27 32 28 30 29 C28 28 26 27 26 24 Z" fill="#002868"/><rect x="26" y="20" width="8" height="1.6" fill="#FFFFFF"/><path d="M10 14 L13 26 L16 14" fill="none" stroke="#002868" stroke-width="2.4"/><path d="M47 14 V26" stroke="#002868" stroke-width="2.4"/>',
  /* ---- Amérique latine ---- */
  'French Guiana': FR_FLAG,
  'Falkland Islands': blueEnsign('#012169', shieldAt(45, 20, '#00A2E8', '<path d="M39 22 C42 21 48 21 51 22 C49 26 41 26 39 22 Z" fill="#FFFFFF"/><path d="M45 13 V21" stroke="#FFFFFF" stroke-width="1"/><path d="M45 13 L48 18 H45 Z" fill="#FFFFFF"/>')),
  /* ---- Océanie ---- */
  'American Samoa': '<rect width="60" height="40" fill="#002B7F"/><polygon points="60,0 60,40 4,20" fill="#FFFFFF"/><polygon points="60,4 60,36 12,20" fill="#BF2033"/><path d="M38 17 C42 15 48 16 52 19 C48 20 44 22 40 22 Z" fill="#8B5A2B" stroke="#FFFFFF" stroke-width=".6"/><path d="M41 24 L50 15" stroke="#F4C300" stroke-width="1.4"/>',
  'Cook Islands': blueEnsign('#012169', Array.from({ length: 15 }, (_, i) => { const a = i * 2 * Math.PI / 15; return star5(45 + 8.5 * Math.cos(a), 20 + 8.5 * Math.sin(a), 1.3, '#FFFFFF'); }).join('')),
  'Kiribati': '<rect width="60" height="24" fill="#CE1126"/><path d="M20 22 A10 10 0 0 1 40 22 Z" fill="#FCD116"/>' + Array.from({ length: 9 }, (_, i) => { const a = Math.PI + i * Math.PI / 8; return '<line x1="' + (30 + 11 * Math.cos(a)).toFixed(1) + '" y1="' + (22 + 11 * Math.sin(a)).toFixed(1) + '" x2="' + (30 + 15 * Math.cos(a)).toFixed(1) + '" y2="' + (22 + 15 * Math.sin(a)).toFixed(1) + '" stroke="#FCD116" stroke-width="1.6"/>'; }).join('') + '<path d="M22 8 C26 5 30 9 30 9 C30 9 34 5 38 8 C34 8 32 10 30 11 C28 10 26 8 22 8 Z" fill="#FCD116"/><rect y="24" width="60" height="16" fill="#003F87"/><path d="M0 27 Q7.5 24.5 15 27 T30 27 T45 27 T60 27 M0 32 Q7.5 29.5 15 32 T30 32 T45 32 T60 32 M0 37 Q7.5 34.5 15 37 T30 37 T45 37 T60 37" fill="none" stroke="#FFFFFF" stroke-width="2"/>',
  'Marshall Islands': '<rect width="60" height="40" fill="#003893"/><polygon points="0,40 60,2 60,10" fill="#DD7500"/><polygon points="0,40 60,10 60,17" fill="#FFFFFF"/>' + star5(10, 10, 6.5, '#FFFFFF'),
  'Micronesia': '<rect width="60" height="40" fill="#75B2DD"/>' + star5(30, 10, 3.6, '#FFFFFF') + star5(20, 20, 3.6, '#FFFFFF') + star5(40, 20, 3.6, '#FFFFFF') + star5(30, 30, 3.6, '#FFFFFF'),
  'Nauru': '<rect width="60" height="40" fill="#002B7F"/><rect y="18.5" width="60" height="3" fill="#FFC61E"/><polygon points="15,25 16.2,28.6 19.7,27 18.1,30.5 21.7,31.7 18.1,32.9 19.7,36.4 16.2,34.8 15,38.4 13.8,34.8 10.3,36.4 11.9,32.9 8.3,31.7 11.9,30.5 10.3,27 13.8,28.6" fill="#FFFFFF"/>',
  'Niue': '<rect width="60" height="40" fill="#FEDD00"/>' + unionJack(30, 20) + '<circle cx="15" cy="10" r="3.6" fill="#012169"/>' + star5(15, 10, 2.4, '#FEDD00') + star5(15, 3.5, 1.3, '#FEDD00') + star5(7, 10, 1.3, '#FEDD00') + star5(23, 10, 1.3, '#FEDD00') + star5(15, 16.5, 1.3, '#FEDD00'),
  'Northern Mariana Islands': '<rect width="60" height="40" fill="#0071BC"/><circle cx="30" cy="20" r="12" fill="none" stroke="#C8A85B" stroke-width="2.2"/><path d="M27 31 L28 20 H32 L33 31 Z M25 20 C25 16 35 16 35 20 Z" fill="#A7A9AC"/>' + star5(30, 15, 4, '#FFFFFF'),
  'Palau': '<rect width="60" height="40" fill="#4AADD6"/><circle cx="26" cy="20" r="10" fill="#FFDE00"/>',
  'Rapa Nui': '<rect width="60" height="40" fill="#FFFFFF"/><path d="M14 18 C18 25 24 26 30 22 C36 26 42 25 46 18 C42 21 37 21 34 19 L30 22 L26 19 C23 21 18 21 14 18 Z" fill="#D52B1E"/><circle cx="14" cy="17" r="2" fill="#D52B1E"/><circle cx="46" cy="17" r="2" fill="#D52B1E"/>',
  'Samoa': '<rect width="60" height="40" fill="#CE1126"/><rect width="30" height="20" fill="#002B7F"/>' + star5(15, 4.5, 2.2, '#FFFFFF') + star5(9.5, 10, 2.2, '#FFFFFF') + star5(20.5, 9, 2.2, '#FFFFFF') + star5(15, 16, 2.4, '#FFFFFF') + star5(18, 12, 1.2, '#FFFFFF'),
  'Solomon Islands': '<polygon points="0,0 58,0 0,38" fill="#0051BA"/><polygon points="60,2 60,40 2,40" fill="#215B33"/><polygon points="0,38 58,0 60,0 60,2 2,40 0,40" fill="#FCD116"/>' + [[6, 5], [16, 5], [11, 10], [6, 15], [16, 15]].map(([x, y]) => star5(x, y, 2.4, '#FFFFFF')).join(''),
  'Tokelau': '<rect width="60" height="40" fill="#00247D"/><path d="M14 32 C26 35 40 33 50 28 C40 29 26 30 14 32 Z" fill="#FED100"/><path d="M14 31 L50 27" stroke="#FFFFFF" stroke-width="1"/>' + [[12, 9], [20, 6], [18, 14], [26, 11]].map(([x, y]) => star5(x, y, 2.3, '#FFFFFF')).join(''),
  'Tonga': '<rect width="60" height="40" fill="#C10000"/><rect width="24" height="20" fill="#FFFFFF"/><rect x="9.5" y="3" width="5" height="14" fill="#C10000"/><rect x="5" y="7.5" width="14" height="5" fill="#C10000"/>',
  'Tuvalu': '<rect width="60" height="40" fill="#5B97B1"/>' + unionJack(30, 20) + [[36, 8], [42, 14], [48, 8], [52, 18], [40, 24], [46, 28], [54, 30], [36, 32], [50, 36]].map(([x, y]) => star5(x, y, 2, '#FFCE00')).join(''),
  'Vanuatu': '<rect width="60" height="20" fill="#D21034"/><rect y="20" width="60" height="20" fill="#009543"/><polygon points="0,0 27,20 0,40" fill="#FDCE12"/><path d="M0 2 L24 18 H60 V22 H24 L0 38 Z" fill="#000000"/><polygon points="0,4 23,20 0,36" fill="#000000"/><path d="M0 1.2 L25 18.6 H60 M0 38.8 L25 21.4 H60" fill="none" stroke="#FDCE12" stroke-width="1.6"/><circle cx="8" cy="20" r="4" fill="none" stroke="#FDCE12" stroke-width="1.4"/>',
  'Wallis and Futuna': FR_FLAG
});
/* code à deux lettres pour les nations sans dessin dédié ci-dessus (repli propre plutôt qu'un texte flottant) */
const FLAG_CHIP_CODE = { 'England': 'ENG', 'Scotland': 'SCO', 'Wales': 'WAL' };
function flagChip(natName, w) {
  w = w || 28; const h = Math.round(w * 2 / 3), code = FLAG_CHIP_CODE[natName] || NATION_ISO[natName] || '';
  if (!code) return '';
  return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + w + 'px;height:' + h + 'px;border-radius:3px;background:rgba(0,0,0,.14);color:inherit;font-size:' + Math.round(w * 0.32) + 'px;font-weight:700;letter-spacing:-.02em;vertical-align:middle">' + code + '</span>';
}
function svgFlag(inner, w) {
  w = w || 28; const h = Math.round(w * 2 / 3);
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 60 40" style="display:inline-block;vertical-align:middle;border-radius:3px;box-shadow:0 0 0 1px rgba(0,0,0,.18)" aria-hidden="true">' + inner + '</svg>';
}
function flagVisual(natName, w) {
  if (!natName) return '';
  if (NATION_FLAG_SVG[natName]) return svgFlag(NATION_FLAG_SVG[natName], w);
  return flagChip(natName, w);
}

/* Pools dédiés (phase 1, ~59% du poids). Répétitions volontaires pour les noms très communs
   (Kim/Lee/Park en Corée, Smith/Johnson aux US), pour simuler leur fréquence réelle au tirage. */
const NAME_POOLS = {
  US: { first: ["James","Michael","Robert","John","David","William","Ryan","Matthew","Brandon","Tyler","Justin","Andrew","Joshua","Kevin","Brian","Jason","Eric","Adam","Nathan","Cody","Dustin","Chase","Hunter","Blake","Cole","Trevor","Austin","Garrett","Logan","Connor","Sam","Wyatt","Colt","Bryce","Grant","Zach","Tanner","Jake","Dylan","Mason"],
    last: ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Clark","Lewis","Walker","Young","Allen","King","Wright","Scott","Green","Baker","Adams","Nelson","Carter","Mitchell","Roberts","Turner","Phillips","Campbell","Parker","Evans","Edwards","Collins"] },
  ENG: { first: ["Oliver","Harry","George","Jack","Charlie","Thomas","Freddie","Archie","Henry","William","Alfie","Joshua","Ethan","James","Daniel","Callum","Lewis","Jamie","Connor","Oscar","Ben","Sam","Toby","Rhys","Elliot","Finlay","Max","Luke","Adam","Nathan"],
    last: ["Smith","Jones","Taylor","Brown","Williams","Wilson","Johnson","Davies","Robinson","Wright","Thompson","Evans","Walker","White","Roberts","Green","Hall","Wood","Jackson","Clarke","Harris","Cooper","King","Turner","Hughes","Ward","Morris","Bennett","Murphy","Cox"] },
  SCO: { first: ["Callum","Euan","Fraser","Ross","Lewis","Cameron","Angus","Hamish","Rory","Murray","Connor","Kyle","Craig","Struan","Iain","Gordon","Ewan","Blair","Aidan","Duncan"],
    last: ["MacDonald","Robertson","Stewart","Campbell","Wilson","Anderson","Murray","Scott","Reid","Ross","Young","Watson","Paterson","Morrison","Fraser","Cameron","Duncan","Graham","Hunter","MacLeod"] },
  AUS: { first: ["Jack","Cooper","Oliver","Lachlan","Ethan","Riley","Noah","Mitchell","Harrison","Jayden","Kai","Tyler","Bailey","Hayden","Jaxon","Zac","Flynn","Cody","Dylan","Nate"],
    last: ["Smith","Jones","Williams","Brown","Taylor","Wilson","Anderson","Robinson","Clarke","Walker","Baker","White","King","Scott","Mitchell","Turner","Cook","Miller","Hunt","Reid"] },
  KOR: { first: ["Min-jun","Seo-jun","Do-yun","Ji-hoon","Joon-ho","Hyun-woo","Sung-min","Tae-yang","Woo-jin","Jun-seo","Ye-jun","Si-woo","Kang-min","Jin-woo","Han-sol","Dong-hyun","Yong-jun","Sung-ho","Kyung-min","Chul-soo"],
    last: ["Kim","Kim","Kim","Lee","Lee","Lee","Park","Park","Park","Choi","Choi","Jung","Jung","Kang","Cho","Yoon","Jang","Lim","Han","Oh","Seo","Shin","Kwon","Hwang","Ahn"] },
  JPN: { first: ["Haruto","Yuto","Sota","Ren","Sora","Riku","Yuki","Kaito","Hayato","Daiki","Sho","Taiga","Ryota","Kenta","Takumi","Yamato","Kazuki","Ryo","Shun","Naoki"],
    last: ["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato","Yoshida","Yamada","Sasaki","Yamaguchi","Matsumoto","Inoue","Kimura","Hayashi","Shimizu","Saito"] },
  SWE: { first: ["Oscar","William","Lucas","Liam","Elias","Hugo","Alexander","Oliver","Axel","Viktor","Erik","Gustav","Anton","Emil","Filip","Ludvig","Simon","Isak","Melvin","Leo"],
    last: ["Andersson","Johansson","Karlsson","Nilsson","Eriksson","Larsson","Olsson","Persson","Svensson","Gustafsson","Pettersson","Jonsson","Jansson","Hansson","Bengtsson","Lindberg","Berg","Lindqvist","Lindgren","Axelsson"] },
  CAN: {
    canadaGeneral: { first: ["Liam","Noah","Ethan","Logan","Owen","Jacob","Mason","Carter","Ryan","Nathan","Cole","Tyler","Brayden","Connor","Dylan","Hunter","Jack","Blake","Jordan","Riley"],
      last: ["Smith","Brown","Wilson","MacDonald","Campbell","Clark","Roberts","Stewart","Anderson","Taylor","Thompson","White","Martin","Wright","Robinson","Kelly","Murray","King","Scott","Reid"] },
    quebec: { first: ["Félix","Émile","Xavier","Antoine","Samuel","Olivier","Alexis","Gabriel","Thomas","Loïc","Mathis","Léo","Charles","Zachary","Nicolas","Simon","Étienne","Raphaël","Jérémy","Maxime"],
      last: ["Tremblay","Gagnon","Roy","Côté","Bouchard","Gauthier","Morin","Lavoie","Fortin","Gagné","Ouellet","Pelletier","Bélanger","Lévesque","Bergeron","Leblanc","Paquette","Girard","Simard","Boucher"] }
  },
  RSA: { first: ["Jaco","Pieter","Rian","Werner","Deon","Stefan","Cobus","Hennie","Andre","Christiaan","Louis","Marius","Divan","Wian","Ruan","Thabo","Sipho","Lwazi","Kagiso","Bongani"],
    last: ["van der Merwe","Botha","Pretorius","Nel","Fourie","Kruger","Venter","du Plessis","Coetzee","Erasmus","Steyn","Viljoen","Marais","Naidoo","Dlamini","Ndlovu","Mokoena","Khumalo","Mahlangu","Nkosi"] },
  IRL: { first: ["Sean","Conor","Cian","Darragh","Eoin","Cathal","Ruairi","Oisin","Fionn","Cormac","Aidan","Declan","Niall","Padraig","Rory","Liam","Ronan","Tadhg","Colm","Brendan"],
    last: ["Murphy","Kelly","Sullivan","Walsh","Smith","O'Brien","Byrne","Ryan","O'Connor","McCarthy","Gallagher","Doyle","Kennedy","Lynch","Murray","Quinn","Moore","Nolan","Fitzgerald","Brennan"] },
  ESP: { first: ["Alejandro","Pablo","Daniel","Adrian","David","Sergio","Javier","Carlos","Diego","Hugo","Mario","Alvaro","Jorge","Ivan","Ruben","Marcos","Manuel","Rafael","Angel","Victor"],
    last: ["Garcia","Rodriguez","Gonzalez","Fernandez","Lopez","Martinez","Sanchez","Perez","Gomez","Martin","Jimenez","Ruiz","Hernandez","Diaz","Moreno","Alvarez","Romero","Alonso","Gutierrez","Navarro"] },
  NIR: { first: ["Rory","Graeme","Darren","Michael","Gareth","Conor","Aaron","Ryan","Shane","Jonathan","Christopher","Scott","Mark","Gary","Paul","Neil","Alan","Craig","Stuart","Jordan"],
    last: ["McIlroy","McDowell","Clarke","Harrington","Watson","Wilson","Campbell","Hamilton","Bell","Boyd","Millar","Elliott","Patterson","Gibson","Mercer","Kirk","Doherty","Hughes","Kelly","Beattie"] }
};

/* Pools régionaux génériques (phase 2) : repli pour toute nation sans pool dédié ci-dessus. */
const REGIONAL_FALLBACK = {
  eu_ouest: { first: ["Thomas","Lucas","Nicolas","Julien","Maxime","Antoine","Paul","Louis","Mathieu","Vincent","Marco","Luca","Andrea","Giovanni","Matteo","Jan","Pieter","Willem","Sven","Bram"],
    last: ["Dubois","Lefevre","Rossi","Bianchi","Moreau","Leroy","Janssens","Peeters","Meyer","Wagner","Fischer","Weber","Schmidt","Hoffmann","Costa","Silva","Ferrari","Colombo","Vermeulen","Claes"] },
  eu_nord: { first: ["Anders","Magnus","Nils","Henrik","Mikael","Jesper","Rasmus","Soren","Mads","Frederik","Bjorn","Sigurd","Kasper","Emil","Aksel","Johan","Sander","Marius","Halvor","Vidar"],
    last: ["Hansen","Jensen","Nielsen","Andersen","Pedersen","Christensen","Larsen","Sorensen","Rasmussen","Petersen","Karlsson","Bergstrom","Holm","Dahl","Berg","Haugen","Solberg","Johansen","Kristiansen","Halvorsen"] },
  eu_est: { first: ["Andrei","Mihai","Ivan","Petr","Milan","Tomas","Pavel","Jakub","Marek","Krzysztof","Viktor","Dmitri","Oleg","Sergei","Nikolai","Bogdan","Tibor","Zoltan","Vuk","Stefan"],
    last: ["Novak","Nowak","Kovac","Horvat","Popescu","Ionescu","Kowalski","Wojcik","Dvorak","Svoboda","Petrov","Ivanov","Sokolov","Kuznetsov","Volkov","Nagy","Kovacs","Kaminski","Vasiliev","Kowalczyk"] },
  asie: { first: ["Wei","Ming","Jian","Feng","Li","Anong","Somchai","Niran","Kittipong","Arjun","Raj","Amit","Nguyen","Minh","Duc","Hai","Budi","Agus","Made","Wayan"],
    last: ["Wang","Li","Zhang","Chen","Liu","Yang","Huang","Wong","Tan","Lim","Singh","Sharma","Patel","Kumar","Tran","Pham","Le","Santos","Reyes","Cruz"] },
  moyen_orient: { first: ["Mohammed","Ahmed","Ali","Omar","Khalid","Yusuf","Hassan","Tariq","Karim","Rashid","Faisal","Nasser","Sami","Bilal","Imad","Ziad","Anas","Hamza","Adel","Fahad"],
    last: ["Al-Farsi","Al-Amin","Hassan","Khoury","Saad","Mansour","Haddad","Rahman","Sultan","Najjar","Aziz","Karam","Nassar","Fakhoury","Barakat","Saleh","Youssef","Chalhoub","Mikhail","Aoun"] },
  oceanie: { first: ["Jack","Ethan","Noah","Liam","Cooper","Tane","Manaia","Rewi","Kori","Anaru","Semisi","Josaia","Ratu","Timoci","Sione","Filipe","Viliame","Epeli","Tui","Mosese"],
    last: ["Williams","Taylor","Thompson","Nathan","Wikaira","Ngata","Waititi","Tamati","Rangi","Puna","Tuilagi","Naisau","Ravouvou","Waqa","Tamani","Fifita","Taufa","Vaka","Kolo","Havili"] },
  afrique: { first: ["Kwame","Kofi","Abena","Chidi","Emeka","Obinna","Tendai","Farai","Amara","Kwabena","Jabari","Sipho","Themba","Musa","Ibrahim","Idris","Yaw","Kojo","Zola","Lerato"],
    last: ["Mensah","Osei","Boateng","Okafor","Okonkwo","Adeyemi","Mutasa","Moyo","Kamau","Mwangi","Abara","Diallo","Toure","Diop","Cisse","Keita","Traore","Bello","Chukwu","Ade"] },
  amerique_latine: { first: ["Santiago","Mateo","Sebastian","Nicolas","Emiliano","Gabriel","Andres","Felipe","Rodrigo","Cristian","Fernando","Diego","Ricardo","Eduardo","Alejandro","Camilo","Julian","Esteban","Rafael","Ignacio"],
    last: ["Gonzalez","Rodriguez","Perez","Sanchez","Ramirez","Torres","Flores","Rivera","Vargas","Castro","Ortiz","Morales","Silva","Rojas","Mendoza","Gutierrez","Herrera","Medina","Aguilar","Cabrera"] },
  caraibes: { first: ["Marcus","Andre","Delroy","Kemar","Shane","Adrian","Kareem","Malik","Leon","Winston","Cedric","Errol","Garfield","Clive","Trevor","Wesley","Oswald","Vincent","Roderick","Lennox"],
    last: ["Campbell","Clarke","Brown","Grant","Foster","Henry","Edwards","Bailey","Francis","Joseph","Charles","James","Richards","Hall","Thomas","Roberts","Gordon","Powell","Lewis","Morgan"] }
};

/* ---- Banque de noms par nationalité (base de noms OOTP v1.2, fournie par Max) ----
   Chaque pays pointe vers un ou plusieurs ensembles culturels (ex. États-Unis : américain, afro-américain,
   hispano-américain…), pondérés. Le prénom et le nom viennent du même ensemble. Les listes sont triées du plus
   courant au plus rare ; le tirage favorise les noms courants sans exclure les rares. */
const NAT_SETS = {"US":[[0,62],[38,13],[54,15],[60,5],[47,3],[67,2]],"ENG":[[20,1]],"SCO":[[16,1]],"AUS":[[185,1]],"KOR":[[3,1]],"JPN":[[2,1]],"SWE":[[12,1]],"CAN":[[222,6],[72,1]],"RSA":[[166,45],[169,30],[167,20],[168,5]],"IRL":[[18,1]],"ESP":[[70,1]],"NIR":[[195,1]],"FRA":[[8,90],[53,7],[197,3]],"GER":[[7,1]],"DEN":[[25,1]],"NZL":[[191,80],[190,15],[105,5]],"ARG":[[70,65],[75,35]],"THA":[[32,1]],"ITA":[[9,1]],"WAL":[[85,1]],"MEX":[[186,1]],"TPE":[[77,1]],"BEL":[[117,60],[118,40]],"NED":[[6,1]],"AUT":[[182,1]],"SUI":[[97,1]],"FIN":[[11,1]],"NOR":[[10,1]],"COL":[[1,1]],"CHI":[[70,1]],"VEN":[[1,1]],"PHI":[[34,1]],"IND":[[27,1]],"CHN":[[4,1]],"SIN":[[62,1]],"CZE":[[14,1]],"POR":[[5,1]],"MAS":[[61,60],[96,30],[27,10]],"INA":[[36,50],[84,50]],"BRA":[[80,1]],"UAE":[[88,1]],"HKG":[[4,1]],"POL":[[15,1]],"HUN":[[28,1]],"SVK":[[184,1]],"SLO":[[43,1]],"GRE":[[23,1]],"TUR":[[24,1]],"ISL":[[33,1]],"LUX":[[223,1]],"CYP":[[23,80],[24,20]],"MLT":[[57,1]],"MON":[[8,60],[9,40]],"LIE":[[116,1]],"AND":[[70,1]],"SMR":[[9,1]],"URU":[[70,1]],"CRC":[[1,1]],"PAN":[[1,1]],"DOM":[[71,1]],"BAH":[[214,1]],"BAR":[[199,1]],"JAM":[[205,1]],"TRI":[[203,1]],"PUR":[[180,1]],"MRI":[[161,1]],"KEN":[[127,1]],"ZIM":[[164,1]],"MAR":[[53,1]],"EGY":[[115,1]],"TUN":[[53,1]],"SEN":[[132,1]],"GHA":[[141,1]],"NGR":[[140,70],[139,30]],"UGA":[[153,1]],"TAN":[[128,1]],"NAM":[[171,1]],"ZAM":[[163,1]],"BOT":[[170,1]],"ISR":[[40,1]],"JOR":[[174,1]],"LIB":[[177,1]],"KSA":[[83,1]],"QAT":[[88,1]],"OMA":[[83,1]],"KUW":[[88,1]],"BRN":[[88,1]],"KAZ":[[56,1]],"UZB":[[56,1]],"PAK":[[37,1]],"BAN":[[82,1]],"SRI":[[76,1]],"NEP":[[65,1]],"CAM":[[63,1]],"LAO":[[64,1]],"MGL":[[74,1]],"FIJ":[[103,60],[104,40]],"PNG":[[95,1]],"GUM":[[93,1]],"NCA":[[101,1]],"PYF":[[109,1]],"BER":[[217,1]],"CAY":[[215,1]],"IVB":[[198,1]],"ANT":[[210,1]],"LCA":[[208,1]],"GRN":[[206,1]],"SKN":[[213,1]],"BIZ":[[113,1]],"ECU":[[1,1]],"PER":[[188,1]],"BOL":[[193,1]],"PAR":[[1,1]],"CUB":[[187,1]],"HON":[[1,1]],"GUA":[[1,1]],"ESA":[[1,1]],"NIC":[[1,1]],"HAI":[[221,1]],"GUY":[[204,1]],"SUR":[[220,1]],"RUS":[[13,1]],"UKR":[[48,1]],"ROU":[[35,1]],"VIE":[[39,1]],"ETH":[[124,1]],"IRI":[[31,1]],"IRQ":[[176,1]],"ALG":[[53,1]],"ANG":[[156,1]],"MOZ":[[157,1]],"MAD":[[158,1]],"CIV":[[134,1]],"CMR":[[147,1]],"NIG":[[120,1]],"BUR":[[131,1]],"MLI":[[130,1]],"MAW":[[165,1]],"CHA":[[121,1]],"SOM":[[126,1]],"RWA":[[154,1]],"AFG":[[89,1]],"ALB":[[21,1]],"ARM":[[26,1]],"AZE":[[56,1]],"BLR":[[49,1]],"BIH":[[45,1]],"BRU":[[61,1]],"BUL":[[55,1]],"CRO":[[183,1]],"EST":[[50,1]],"GEO":[[29,1]],"KGZ":[[56,1]],"LAT":[[51,1]],"LBA":[[53,1]],"LTU":[[52,1]],"MDA":[[196,1]],"MNE":[[22,1]],"MYA":[[68,1]],"PRK":[[3,1]],"MKD":[[44,1]],"SRB":[[22,1]],"SUD":[[123,1]],"SYR":[[175,1]],"TOG":[[138,1]],"TKM":[[79,1]],"YEM":[[83,1]],"BEN":[[129,89],[136,11]],"BDI":[[155,91],[154,9]],"CPV":[[144,100]],"CAF":[[150,89],[146,11]],"COM":[[159,93],[86,7]],"DJI":[[122,100]],"GEQ":[[149,85],[71,10],[148,5]],"ERI":[[125,92],[124,8]],"GAB":[[148,100]],"GUI":[[133,85],[136,10],[137,5]],"GBS":[[145,100]],"LES":[[172,100]],"LBR":[[142,100]],"MTN":[[119,100]],"MYT":[[159,90],[53,10]],"REU":[[160,82],[42,11],[159,7]],"SEY":[[160,76],[42,11],[161,8],[27,6]],"SLE":[[143,95],[139,5]],"STP":[[144,100]],"SWZ":[[173,95],[167,5]],"CGO":[[151,95],[152,5]],"GAM":[[135,100]],"ESH":[[53,60],[87,35],[73,5]],"COD":[[152,100]],"SSD":[[153,56],[123,29],[152,9],[150,6]],"SHN":[[20,62],[46,23],[96,15]],"BHU":[[66,81],[65,19]],"TLS":[[114,95],[36,5]],"MDV":[[162,95],[83,5]],"PLE":[[174,100]],"TJK":[[56,95],[13,5]],"MAC":[[96,71],[62,24],[4,5]],"FRO":[[58,82],[25,18]],"VAT":[[9,80],[97,20]],"KOS":[[21,92],[22,8]],"GIB":[[20,59],[70,26],[57,10],[5,5]],"AZO":[[5,100]],"MDR":[[5,100]],"GGY":[[59,60],[20,35],[8,5]],"JEY":[[59,61],[20,39]],"IMN":[[20,81],[16,10],[195,9]],"ALA":[[12,95],[11,5]],"AIA":[[211,79],[46,21]],"ARU":[[219,59],[1,18],[41,17],[218,6]],"DMA":[[209,78],[46,22]],"GUF":[[42,100]],"GLP":[[42,100]],"MTQ":[[42,100]],"BOE":[[218,50],[41,28],[219,11],[46,11]],"SPM":[[8,90],[72,10]],"VIN":[[207,79],[46,21]],"ISV":[[46,93],[38,7]],"CUW":[[41,72],[46,13],[219,9],[71,6]],"SXM":[[41,91],[46,9]],"MSR":[[212,64],[46,36]],"TCA":[[216,81],[46,14],[20,5]],"BLM":[[42,90],[46,10]],"MAF":[[42,92],[46,8]],"GRL":[[69,74],[25,26]],"ASA":[[105,89],[91,11]],"COK":[[108,81],[91,14],[30,5]],"SAM":[[105,90],[91,10]],"SOL":[[95,100]],"TGA":[[106,100]],"VAN":[[102,100]],"WLF":[[112,72],[110,11],[109,11],[30,6]],"KIR":[[99,85],[91,10],[30,5]],"PLW":[[90,68],[91,14],[34,11],[2,7]],"MHL":[[94,71],[91,23],[30,6]],"TUV":[[100,86],[91,8],[30,5]],"FSM":[[92,65],[91,17],[60,11],[34,7]],"NRU":[[98,85],[91,9],[30,7]],"NMI":[[93,52],[34,33],[60,9],[91,6]],"RPN":[[111,79],[70,16],[1,5]],"NIU":[[107,45],[105,44],[30,5],[91,5]],"TKL":[[99,42],[105,32],[100,21],[30,5]],"FLK":[[20,71],[10,19],[25,5],[16,5]]};
const OOTP_SPLIT = {};
/* Ensemble décodé à la demande : noms + tirage selon la vraie fréquence de chaque nom. */
function ootpList(names, runs) {
  const arr = names.split('|'), cum = [], idx = []; let t = 0, i = 0;
  for (let k = 0; k < runs.length; k += 2) { t += runs[k] * runs[k + 1]; cum.push(t); idx.push(i); i += runs[k + 1]; }
  return { arr, runs, cum, idx, t };
}
function ootpSet(k) {
  if (OOTP_SPLIT[k] !== undefined) return OOTP_SPLIT[k];
  const d = window.OOTP_NAMES && window.OOTP_NAMES[k];
  return (OOTP_SPLIT[k] = d ? [ootpList(d[0], d[1]), ootpList(d[2], d[3])] : null);
}
function pickFreq(L) {
  const r = Math.random() * L.t; let lo = 0, hi = L.cum.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (L.cum[m] < r) lo = m + 1; else hi = m; }
  return L.arr[Math.min(L.arr.length - 1, L.idx[lo] + Math.floor(Math.random() * L.runs[lo * 2 + 1]))];
}
function pickOotpName(code) {
  const sets = NAT_SETS[code]; if (!sets) return null;
  let r = Math.random() * sets.reduce((a, x) => a + x[1], 0), k = sets[0][0];
  for (const x of sets) { r -= x[1]; if (r <= 0) { k = x[0]; break; } }
  const st = ootpSet(k); if (!st || !st[0].arr.length || !st[1].arr.length) return null;
  return pickFreq(st[0]) + ' ' + pickFreq(st[1]);
}
function pickNation() {
  let roll = Math.random() * NATIONS_W;
  for (let i = 0; i < NATIONS.length; i++) { roll -= NATIONS[i].weight; if (roll <= 0) return NATIONS[i]; }
  return NATIONS[NATIONS.length - 1];
}
function pickFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickNameFor(nation) {
  const nn = pickOotpName(nation.code); if (nn) return nn;
  if (nation.code === "CAN") {
    const pool = Math.random() < (0.5 / 3.5) ? NAME_POOLS.CAN.quebec : NAME_POOLS.CAN.canadaGeneral;
    return pickFrom(pool.first) + ' ' + pickFrom(pool.last);
  }
  const pool = NAME_POOLS[nation.code] || REGIONAL_FALLBACK[nation.region];
  return pickFrom(pool.first) + ' ' + pickFrom(pool.last);
}
/* ---- Identité (nom + nationalité) d'un golfeur : la nation est tirée indépendamment à chaque appel ---- */
function makeGolferIdentity(used) {
  for (let i = 0; i < 400; i++) {
    const nation = pickNation(), n = pickNameFor(nation);
    if (!used.has(n)) { used.add(n); return { n: n, nat: nation.name }; }
  }
  let nation, n, k = 2;
  do { nation = pickNation(); n = pickNameFor(nation) + ' ' + (k++); } while (used.has(n));
  used.add(n); return { n: n, nat: nation.name };
}

/* ---- Univers ---- */
const LEAGUE_NAMES = ['Ligue 1 · Tour', 'Ligue 2 · Pro', 'Ligue 3 · Semi-Pro', 'Ligue 4 · Amateur'];
const LEAGUE_SHORT = ['Tour', 'Pro', 'Semi-Pro', 'Amateur'];
const FIELD = 150, N_TOURN = 10, DEFAULT_CUT = 65;
let MOVE = 10;   // réglable (Réglages › Avancé)   // 150 golfeurs par ligue ; coupure : top 65 + \u00e9galit\u00e9s

/* ---- Distribution du pool actif (repère, pas un quota) ----
   Tranches d'overall et % approximatif de golfeurs dans chacune (donné par Max). C'est le talent réel du
   pool qui détermine ensuite où tombent les seuils de ligue — les ligues ne dictent plus rien. Chaque
   golfeur (pool initial + recrues) est tiré individuellement sur une courbe de densité lissée entre les
   points milieu de ces tranches, donc une saison donnée peut très bien avoir zéro golfeur dans une tranche,
   ou au contraire plusieurs, par pur hasard — voir buildOverallCDF()/drawOverall(). */
const OVERALL_DIST = [
  { lo: 0, hi: 100, pct: 3.00 }, { lo: 100, hi: 200, pct: 8.00 }, { lo: 200, hi: 300, pct: 11.00 },
  { lo: 300, hi: 400, pct: 13.00 }, { lo: 400, hi: 500, pct: 14.00 }, { lo: 500, hi: 600, pct: 14.00 },
  { lo: 600, hi: 700, pct: 13.00 }, { lo: 700, hi: 800, pct: 13.00 }, { lo: 800, hi: 900, pct: 9.00 },
  { lo: 900, hi: 950, pct: 1.90 }, { lo: 950, hi: 1000, pct: 0.10 }
];
function buildOverallCDF(dist) {
  // courbe de densité lissée par interpolation linéaire entre les points milieu de chaque tranche
  const pts = dist.map(b => ({ x: (b.lo + b.hi) / 2, d: (b.pct / 100) / (b.hi - b.lo) }));
  pts.unshift({ x: 0, d: pts[0].d }); pts.push({ x: 1000, d: pts[pts.length - 1].d });
  function densityAt(x) {
    let i = 0; while (i < pts.length - 2 && pts[i + 1].x < x) i++;
    const a = pts[i], b = pts[i + 1], t = (x - a.x) / (b.x - a.x || 1);
    return a.d + (b.d - a.d) * t;
  }
  const N = 1000, cum = [0];
  for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + densityAt(i - 0.5));
  const total = cum[N];
  return cum.map(c => c / total);
}
const OVERALL_CDF = buildOverallCDF(OVERALL_DIST);
/* v419 : vrais plafonds faibles rapprochés de 450 (pour les recrues et le monde de départ ; Play Now garde la courbe telle quelle).
   450 − (450 − x) × CFG.rcLowCeil ; rien ne change au-dessus de 450. Avec 0,35 (défaut), le plus petit plafond devient ≈ 290.
   Simulation (3 mondes × 30 saisons) : écarts de coupure L1→L2 / L2→L3 / L3→L4 de +2,5 / +2,6 / +4,7 à +2,6 / +2,5 / +3,6, tailles de
   ligues, part du top 5, montées et variété des carrières inchangées. Voir docs/parametres.md. */
function ceilLow(x) { const F = CFG.rcLowCeil == null ? 1 : clamp(+CFG.rcLowCeil, 0, 1); return x < 450 ? 450 - (450 - x) * F : x; }
function drawOverall() {                 // tirage individuel d'un overall (0-1000) selon la courbe de référence
  const u = Math.random();
  let lo = 0, hi = OVERALL_CDF.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (OVERALL_CDF[m] < u) lo = m + 1; else hi = m; }
  return clamp(lo + (Math.random() - 0.5), 5, 995);
}

function randAge() {                  // 17 \u00e0 50 ans
  const r = Math.random();
  return r < 0.30 ? 17 + Math.floor(Math.random() * 8) : r < 0.72 ? 25 + Math.floor(Math.random() * 10) : r < 0.94 ? 35 + Math.floor(Math.random() * 10) : 45 + Math.floor(Math.random() * 6);
}
