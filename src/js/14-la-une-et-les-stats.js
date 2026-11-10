/* ============ LA UNE ET LES STATS D'UN TOURNOI ============
   Tout est reconstitué à partir de l'historique conservé (résultats de toutes les saisons, cartes trou par trou
   des 3 dernières saisons) : manchette, coin du vainqueur, moment clé, fils narratifs, tournoi en chiffres,
   ta carte contre le champ, mouvements au classement et nations. */
const TMAP = new WeakMap();
function tRowMap(t) {                 // id -> [ligue, rangée] pour un tournoi
  let m = TMAP.get(t); if (m) return m;
  m = new Map(); t.lg.forEach((x, l) => x.rows.forEach(r => m.set(r[0], [l, r])));
  TMAP.set(t, m); return m;
}
function eachTournBefore(s, ti, f) {  // du plus récent au plus ancien, strictement avant (s, ti) ; f renvoie true pour arrêter
  for (let hs = s; hs >= 1; hs--) {
    const H = S.hist[hs - 1]; if (!H) continue;
    for (let k = (hs === s ? ti - 1 : N_TOURN - 1); k >= 0; k--) { const t = H.t[k]; if (t && f(t, hs, k)) return; }
  }
}
function natOf(id) { if (id === 0) return S.G[0] ? S.G[0].nat : (S.nat || ''); const g = S.G[id] || (S.old && S.old[id]); return g ? g.nat || '' : ''; }
function ageAt(id, s) { const g = S.G[id]; if (g) return g.a - (S.season - s); if (id === 0 && S.pk && S.pk.a) return S.pk.a - (S.season - s); const o = S.old && S.old[id]; return o ? o.a - (o.s - s) : null; }
const posTxt = (r, rows) => r[1] === 0 ? 'rate la coupure' : 'termine ' + ((rows.filter(x => x[1] === r[1]).length > 1 ? 'T' + r[1] : ord(r[1])));
/* classement de la ligue l, en points gagnés dans cette ligue depuis le début de la saison, avant et après le tournoi */
function standMoves(s, ti, l) {
  const H = S.hist[s - 1], ids = H.t[ti].lg[l].rows.map(r => r[0]), before = {}, after = {};
  ids.forEach(id => { before[id] = 0; });
  for (let k = 0; k < ti; k++) { const t = H.t[k]; if (t) t.lg[l].rows.forEach(r => { if (r[0] in before) before[r[0]] += r[4]; }); }
  ids.forEach(id => { after[id] = before[id]; });
  H.t[ti].lg[l].rows.forEach(r => { after[r[0]] += r[4]; });
  const rk = pts => { const o = ids.slice().sort((a, b) => pts[b] - pts[a] || a - b), m = {}; o.forEach((id, i) => { m[id] = i + 1; }); return m; };
  return { ids, rb: rk(before), ra: rk(after), before, after };
}
function holeStats(T, l) {            // moyenne par trou, répartition des scores
  const lg = T.lg[l], pars = T.pars; if (!lg.h || !pars) return null;
  const sumH = Array(18).fill(0), nH = Array(18).fill(0), dist = { e: 0, b: 0, p: 0, bo: 0, d: 0 }, fieldR = [[], []];
  lg.rows.forEach(r => {
    const str = lg.h[r[0]]; if (!str) return;
    [0, 1].forEach(rd => {
      const hs = decHoles(str, rd * 18); if (!hs) return;
      hs.forEach((v, i) => { const d = v - pars[i]; sumH[i] += d; nH[i]++; if (d <= -2) dist.e++; else if (d === -1) dist.b++; else if (d === 0) dist.p++; else if (d === 1) dist.bo++; else dist.d++; fieldR[rd][i] = (fieldR[rd][i] || 0) + v; });
    });
  });
  if (!nH[0]) return null;
  return { avg: sumH.map((x, i) => x / nH[i]), dist, n: nH[0] };
}
const artHole = (rel, st) => rel === 0 ? 'le par' : 'un ' + holeWord(rel, st);
function tournStory(T, s, ti, l) {
  const lg = T.lg[l], rows = lg.rows, W = rows[0], wid = W[0], wt = W[2] + W[3], course = T.name;
  const r1min = Math.min.apply(null, rows.map(r => r[2]));
  const r2nd = rows.find(r => r[1] > 1 && r[3] !== null);
  const gap = r2nd && !lg.playoff ? (r2nd[2] + r2nd[3]) - wt : 0;
  const SM = ti >= 1 ? standMoves(s, ti, l) : null;
  const preRk = SM ? SM.rb[wid] : null;
  // carrière du vainqueur jusqu'à ce tournoi
  let prevWin = null, careerW = 1, seasonW = 1, lastNatWin = null, natWins = 0;
  const winsBy = [0, 0, 0, 0], c0 = careerStart(wid); winsBy[l] = 1;   // victoires du gagnant ligue par ligue, jusqu'à ce tournoi inclus
  const nat = natOf(wid);
  eachTournBefore(s, ti, (t, hs, k) => {
    const m = tRowMap(t);
    t.lg.forEach((x, L) => { const w = x.rows[0]; if (w[0] === wid && hs > c0) { careerW++; winsBy[L]++; if (hs === s) seasonW++; if (!prevWin) prevWin = [hs, k]; } if (L === l && nat && natOf(w[0]) === nat && w[0] !== wid) { natWins++; if (!lastNatWin) lastNatWin = [hs, k, w[0]]; } });
    return false;
  });
  const nm = id => tk(id);
  /* ---- 1. manchette ---- */
  let head;
  if (lg.playoff) head = nm(wid) + ' l’emporte en prolongation à ' + course;
  else if (preRk && preRk >= 60) head = 'Surprise : le ' + ord(preRk) + ' du classement s’impose à ' + course;
  else if (W[2] - r1min >= 4) head = 'Remontée spectaculaire de ' + nm(wid) + ' à ' + course;
  else if (careerW === 1 && s >= 4) head = 'Premier titre en carrière pour ' + nm(wid);
  else if (gap >= 5) head = nm(wid) + ' écrase le champ à ' + course;
  else if (rows.filter(r => r[2] === r1min).length === 1 && W[2] === r1min) head = nm(wid) + ' mène de bout en bout à ' + course;
  else if (gap === 1) head = nm(wid) + ' l’emporte par un coup à ' + course;
  else head = nm(wid) + ' triomphe à ' + course;
  const chap = [];
  chap.push(nm(wid) + ' boucle le tournoi à ' + fmt(wt) + (lg.playoff ? ' et gagne en prolongation' : gap ? ', ' + (gap === 1 ? 'un coup' : gap + ' coups') + ' devant ' + (r2nd ? nm(r2nd[0]) : 'ses poursuivants') : '') + '.');
  if (W[2] - r1min >= 3) chap.push('Il accusait ' + (W[2] - r1min) + ' coups de retard après la ronde 1.');
  else if (W[3] !== null && W[3] === Math.min.apply(null, rows.filter(r => r[3] !== null).map(r => r[3]))) chap.push('Sa ronde finale de ' + fmt(W[3]) + ' est la meilleure du dimanche.');
  chap.push(lg.one ? 'Les ' + paidRows(rows, lg.cut).length + ' premiers, jusqu’à ' + fmt(lg.cut) + ', sont payés.' : 'La coupure tombe à ' + fmt(lg.cut) + '.');
  /* ---- 2. coin du vainqueur ---- */
  const age = ageAt(wid, s), g = S.G[wid];
  const facts = [];
  if (careerW > 1 || s >= 4) {
    /* victoires séparées par ligue : gagner en L1 n'a pas le même poids qu'en L4 */
    const nth = n => n === 1 ? 'première' : n + 'e';
    const oth = [0, 1, 2, 3].filter(L => L !== l && winsBy[L] > 0).map(L => (winsBy[L] === 1 ? 'une victoire' : winsBy[L] + ' victoires') + ' en L' + (L + 1));
    const lst = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1];
    if (careerW === 1) facts.push('Premier titre en carrière, et ' + (wid === 0 ? 'tu réussis' : 'il réussit') + ' le coup en Ligue ' + (l + 1));
    else if (!oth.length) facts.push(ord(careerW).replace('1er', '1re') + ' victoire en carrière, toutes en L' + (l + 1) + (prevWin && prevWin[0] < s - 1 ? ', la première depuis ' + yr(prevWin[0]) : ''));
    else facts.push(ord(careerW).replace('1er', '1re') + ' victoire en carrière' + (prevWin && prevWin[0] < s - 1 ? ' (la première depuis ' + yr(prevWin[0]) + ')' : '') + ', ' + lst([nth(winsBy[l]) + ' victoire en L' + (l + 1)].concat(oth)));
  }
  if (seasonW >= 2) facts.push(seasonW + 'e victoire cette saison');
  if (nat && s >= 6) {
    if (!lastNatWin) facts.push('premier golfeur de son pays à gagner en Ligue ' + (l + 1));
    else if (s - lastNatWin[0] >= 3) facts.push('première victoire de son pays en Ligue ' + (l + 1) + ' depuis ' + yr(lastNatWin[0]));
  }
  const pay = (lg.pay && lg.pay[wid]) || 0;
  let corner = '<div class="wcorner"><div class="wcflag">' + (nat ? flagVisual(nat, 40) : '') + '</div><div style="min-width:0"><div class="wcname">' + sumTxt(nm(wid)) + '</div><div class="wcmeta">' + [age ? age + ' ans' : null, nat || null, g ? TIERS[tierOf(g)][1] : null].filter(Boolean).map(esc).join(' · ') + '</div><div class="wcfacts">' + facts.map(esc).join(' · ') + (pay ? ' · ' + fmtMoney(pay) : '') + '</div></div></div>';
  let une = '<div class="block une"><div class="unek">LA UNE · ' + esc(LEAGUE_NAMES[l].toUpperCase()) + '</div><div class="uneh">' + sumTxt(head) + '</div><p class="unec">' + sumTxt(chap.join(' ')) + '</p>' + corner + '</div>';
  /* ---- 4. moment clé ---- */
  let key = '';
  if (lg.h && T.pars && r2nd) {
    const a = decHoles(lg.h[wid] || '', 18), b = decHoles(lg.h[r2nd[0]] || '', 18);
    if (a && b) {
      let ga = W[2], gb = r2nd[2], best = null;
      for (let i = 0; i < 18; i++) {
        const d0 = gb - ga; ga += a[i] - T.pars[i]; gb += b[i] - T.pars[i]; const d1 = gb - ga;
        const sw = d1 - d0; if (sw > 0 && Math.abs(d0) <= 3 && (!best || sw > best.sw || (sw === best.sw && d1 > best.d1))) best = { i, sw, d0, d1 };
      }
      if (best) {
        const i = best.i, w = a[i] - T.pars[i], r = b[i] - T.pars[i], ecart = v => v === 0 ? 'égalité' : v > 0 ? (v === 1 ? '1 coup d’avance' : v + ' coups d’avance') : (v === -1 ? '1 coup de retard' : -v + ' coups de retard');
        key = '<div class="block sumblk"><h3>Le moment clé</h3><ul class="news sl"><li>' + ico('flag') + '<span>' + sumTxt('Au trou ' + (i + 1) + ' (par ' + T.pars[i] + ') de la ronde 2, ' + nm(wid) + ' signe ' + artHole(w, a[i]) + ' pendant que ' + nm(r2nd[0]) + (r === 0 ? ' se contente du par' : ' fait ' + artHole(r, b[i])) + ' : l’écart passe ' + (best.d0 === 0 ? 'd’une égalité' : 'de ' + ecart(best.d0)) + ' à ' + (best.d1 === 0 ? 'une égalité' : ecart(best.d1)) + '.') + '</span></li></ul></div>';
      }
    }
  }
  /* ---- 5. fils narratifs ---- */
  const threads = [];
  if (ti >= 1) { const pt = S.hist[s - 1].t[ti - 1]; if (pt) { const pw = pt.lg[l].rows[0][0], pr = rows.find(r => r[0] === pw); if (pr && pw !== wid) threads.push({ i: 'trophy', t: 'Le vainqueur de la semaine dernière, ' + nm(pw) + ', ' + posTxt(pr, rows) + '.' }); } }
  { let bestS = null; rows.filter(r => r[1] > 0).forEach(r => { let n = 1; eachTournBefore(s, ti, t => { const x = tRowMap(t).get(r[0]); if (!x) return true; if (x[1][1] === 0) return true; n++; return false; }); if (n >= 10 && (!bestS || n > bestS.n)) bestS = { id: r[0], n }; }); if (bestS) threads.push({ i: 'cut', t: nm(bestS.id) + ' réussit une ' + bestS.n + 'e coupure de suite.' }); }
  if (r2nd && r2nd[1] === 2) { let n = 0; eachTournBefore(s, ti, t => { const x = t.lg[l].rows; if (x[0][0] === wid && x[1] && x[1][0] === r2nd[0] || x[0][0] === r2nd[0] && x[1] && x[1][0] === wid) n++; return false; }); if (n >= 1) threads.push({ i: 'swap', t: 'Rivalité : ' + (n + 1) + 'e fois que ' + nm(wid) + ' et ' + nm(r2nd[0]) + ' finissent aux deux premières places.' }); }
  let nAge = 0; rows.filter(r => r[1] > 1 && r[1] <= 10).forEach(r => { const a = ageAt(r[0], s); if (a != null && (a >= 42 || a <= 18) && nAge < 2 && threads.length < 5 && ++nAge) threads.push({ i: 'star', t: 'À ' + a + ' ans, ' + nm(r[0]) + ' ' + posTxt(r, rows) + '.' }); });
  const thr = threads.length ? '<div class="block sumblk"><h3>Les fils de l’histoire</h3>' + sumList(threads.slice(0, 5)) + '</div>' : '';
  /* ---- 6. le tournoi en chiffres ---- */
  const HS = holeStats(T, l);
  const r1avg = avg(rows.map(r => r[2])), r2s = rows.filter(r => r[3] !== null).map(r => r[3]), r2avg = r2s.length ? avg(r2s) : null;
  let num = '<div class="block sumblk"><h3>Le tournoi en chiffres</h3><div class="mgrid">' + tile(fmt1(r1avg).replace(/^(?!−)/, '+'), 'moyenne du champ, ronde 1') + (r2avg !== null ? tile(fmt1(r2avg).replace(/^(?!−)/, '+'), 'moyenne, ronde 2 (qualifiés)') : '');
  if (HS) {
    const hard = HS.avg.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0])[0], easy = HS.avg.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])[0];
    num += tile('Trou ' + (hard[1] + 1), 'le plus difficile (' + fmt1(hard[0]).replace(/^(?!−)/, '+') + ', par ' + T.pars[hard[1]] + ')') + tile('Trou ' + (easy[1] + 1), 'le plus facile (' + fmt1(easy[0]).replace(/^(?!−)/, '+') + ', par ' + T.pars[easy[1]] + ')') + '</div>';
    const D = HS.dist, tot = D.e + D.b + D.p + D.bo + D.d, seg = [['e', D.e, 'var(--hE2)', 'Aigles ou mieux'], ['b', D.b, 'var(--hE1)', 'Birdies'], ['p', D.p, 'var(--line)', 'Pars'], ['bo', D.bo, 'var(--hB1)', 'Bogeys'], ['d', D.d, 'var(--hB3)', 'Doubles ou pire']];
    num += '<div class="distbar" role="img" aria-label="Répartition des scores">' + seg.map(x => x[1] ? '<i style="flex:' + x[1] + ';background:' + x[2] + '" title="' + x[3] + ' : ' + x[1] + '"></i>' : '').join('') + '</div><div class="legend cl" style="margin-top:6px">' + seg.map(x => '<span><i class="lg" style="background:' + x[2] + '"></i>' + x[3] + ' ' + x[1] + '</span>').join('') + '</div>';
  } else num += '</div>';
  num += '</div>';
  /* ---- 7. ta carte contre le champ ---- */
  let mine = '';
  const me = rows.find(r => r[0] === 0);
  if (me && HS && lg.h[0]) {
    const byPar = { 3: 0, 4: 0, 5: 0 }, holes = [];
    [0, 1].forEach(rd => { const hs = decHoles(lg.h[0], rd * 18); if (!hs) return; hs.forEach((v, i) => { const g = HS.avg[i] + T.pars[i] - v; byPar[T.pars[i]] += g; holes.push({ i, rd, g }); }); });
    const tg = byPar[3] + byPar[4] + byPar[5], sg = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1).replace('.', ',');
    const bestH = holes.slice().sort((a, b) => b.g - a.g)[0], worstH = holes.slice().sort((a, b) => a.g - b.g)[0];
    mine = '<div class="block sumblk"><h3>Ta carte contre le champ</h3><p class="small mute" style="margin:0 0 6px">Coups gagnés (+) ou perdus (−) par rapport à la moyenne du champ sur chaque trou.</p><div class="mgrid mgrid3">' + [3, 4, 5].map(p => tile('<span class="' + (byPar[p] >= 0 ? 'dnx' : 'upx') + '">' + sg(byPar[p]) + '</span>', 'sur les par ' + p)).join('') + '</div><p style="margin:8px 0 0">Au total : <b class="' + (tg >= 0 ? 'dnx' : 'upx') + '">' + sg(tg) + ' coups</b>. Meilleur trou : le ' + (bestH.i + 1) + ' en ronde ' + (bestH.rd + 1) + ' (' + sg(bestH.g) + '). Plus coûteux : le ' + (worstH.i + 1) + ' en ronde ' + (worstH.rd + 1) + ' (' + sg(worstH.g) + ').</p></div>';
  }
  /* ---- 8. mouvements au classement ---- */
  let mov = '';
  if (SM) {
    const d = SM.ids.map(id => ({ id, d: SM.rb[id] - SM.ra[id] })), N = SM.ids.length;
    const up = d.filter(x => x.d > 0).sort((a, b) => b.d - a.d).slice(0, 5), dn = d.filter(x => x.d < 0).sort((a, b) => a.d - b.d).slice(0, 5);
    const line = x => '<li>' + ico(x.d > 0 ? 'up' : 'down') + '<span>' + sumTxt(nm(x.id)) + ' : ' + ord(SM.rb[x.id]) + ' → <b>' + ord(SM.ra[x.id]) + '</b> <span class="' + (x.d > 0 ? 'dnx' : 'upx') + '">(' + (x.d > 0 ? '+' : '−') + Math.abs(x.d) + ')</span></span></li>';
    const inP = l > 0 ? SM.ids.filter(id => SM.ra[id] <= MOVE && SM.rb[id] > MOVE) : [], inR = l < 3 ? SM.ids.filter(id => SM.ra[id] > N - MOVE && SM.rb[id] <= N - MOVE) : [];
    mov = '<div class="block sumblk"><h3>Mouvements au classement</h3><p class="small mute" style="margin:0 0 4px">Points gagnés en Ligue ' + (l + 1) + ' depuis le début de la saison.</p><ul class="news sl">' + up.map(line).join('') + dn.map(line).join('') + '</ul>' +
      (inP.length ? '<p class="small" style="margin:8px 0 0"><b>Entrent dans la zone de promotion :</b> ' + sumTxt(inP.map(nm).join(', ')) + '.</p>' : '') + (inR.length ? '<p class="small" style="margin:6px 0 0"><b>Glissent en zone de relégation :</b> ' + sumTxt(inR.map(nm).join(', ')) + '.</p>' : '') + '</div>';
  }
  /* ---- 9. nations ---- */
  const byN = {};
  rows.forEach(r => { const n = natOf(r[0]); if (!n) return; const o = byN[n] || (byN[n] = { n, cnt: 0, made: 0, best: null, bid: null }); o.cnt++; if (r[1] > 0) { o.made++; if (o.best === null || r[1] < o.best) { o.best = r[1]; o.bid = r[0]; } } });
  const nl = Object.values(byN).filter(o => o.best !== null).sort((a, b) => a.best - b.best || b.made - a.made).slice(0, 5);
  const can = byN['Canada'];
  let nats = '';
  if (nl.length) nats = '<div class="block sumblk"><h3>Les nations</h3><table class="plain">' + nl.map(o => '<tr><td style="white-space:nowrap">' + flagVisual(o.n, 22) + ' ' + esc(o.n) + '</td><td class="r small mute" style="white-space:nowrap">' + o.made + '/' + o.cnt + ' qual.</td><td class="r">' + sumTxt(nm(o.bid)) + ' <b>' + ord(o.best) + '</b></td></tr>').join('') + '</table>' +
    (can && !nl.includes(can) ? '<p class="small" style="margin:8px 0 0">' + flagVisual('Canada', 18) + ' Meilleur Canadien : ' + (can.best !== null ? sumTxt(nm(can.bid)) + ', ' + ord(can.best) : 'aucun qualifié (' + can.cnt + ' au départ)') + '.</p>' : '') + '</div>';
  return { une, key, thr, num, mine, mov, nats };
}

/* ---- Promotions et relégations décidées juste après un tournoi, avec la raison ----
   Les tournois récents gardent la liste (t.mvs). Pour les plus anciens, on la reconstitue : un golfeur qui change
   de ligue entre ce tournoi et le suivant ; sans raison conservée, on affiche une raison générique. */
function tournMoves(T, s, ti) {
  const H = S.hist[s - 1]; let list = T.mvs;
  if (!list) {
    let nextL = null;
    const nt = H.t[ti + 1];
    if (nt) { const m = tRowMap(nt); nextL = id => { const x = m.get(id); return x ? x[0] : null; }; }
    else if (H.end && H.end.tables && ti === N_TOURN - 1) { const m = new Map(); H.end.tables.forEach((rows, l) => rows.forEach(r => { if (!r[5]) m.set(r[0], l); })); nextL = id => m.has(id) ? m.get(id) : null; }
    else if (s === S.season && !H.end && H.t.slice(ti + 1).every(x => !x)) nextL = id => { for (let l = 0; l < 4; l++) if (S.L[l].includes(id)) return l; return null; };
    if (!nextL) return [];
    list = [];
    T.lg.forEach((x, l) => x.rows.forEach(r => { const nl = nextL(r[0]); if (nl != null && nl !== l && Math.abs(nl - l) === 1) list.push([r[0], l, nl, nl < l ? 'up' : 'down', null]); }));
  }
  return list.map(([id, fromL, toL, type, reason]) => {
    // parcours de la saison dans la ligue quittée : depuis le début de la saison ou depuis son arrivée
    let w = 0, t3 = 0, t5 = 0, t10 = 0, miss = 0, start = 0, n = 0;
    for (let k = ti; k >= 0; k--) { const t = H.t[k]; if (!t) continue; const x = tRowMap(t).get(id); if (!x || x[0] !== fromL) { start = k + 1; break; } }
    let streak = true;
    for (let k = ti; k >= start; k--) { const t = H.t[k]; if (!t) continue; const r = tRowMap(t).get(id)[1], p = r[1]; n++; if (p === 1) w++; if (p > 0 && p <= 3) t3++; if (p > 0 && p <= 5) t5++; if (p > 0 && p <= 10) t10++; if (streak && p === 0) miss++; else streak = false; }
    if (!reason) {
      if (type === 'down') reason = 'ses r\u00e9sultats en bas de classement';
      else reason = promoReason({ w, t3, t5, t10, t20: 0 }) || 'ses r\u00e9sultats';
    }
    return { id, fromL, toL, type, reason, since: start > 0 ? start : 0 };
  });
}
function movesHTML(T, s, ti, l) {
  const mv = tournMoves(T, s, ti); if (!mv.length) return '';
  const where = x => x.since ? (x.id === 0 ? 'depuis ton arrivée' : 'depuis son arrivée') + ' en Ligue ' + (x.fromL + 1) : 'cette saison';
  const listFor = L => {
    const it = [], ups = mv.filter(x => x.fromL === L && x.type === 'up'), dns = mv.filter(x => x.fromL === L && x.type === 'down');
    ups.sort((a, b) => (b.id === 0) - (a.id === 0)).forEach(x => { it.push({ i: 'up', t: (x.id === 0 ? 'Tu montes' : tk(x.id) + ' monte') + ' en Ligue ' + (x.toL + 1) + ' gr\u00e2ce \u00e0 ' + x.reason + ' ' + where(x) + '.' }); });
    dns.sort((a, b) => (b.id === 0) - (a.id === 0)).forEach(x => { it.push({ i: 'down', t: (x.id === 0 ? 'Tu descends' : tk(x.id) + ' descend') + ' en Ligue ' + (x.toL + 1) + ' apr\u00e8s ' + x.reason + ' ' + where(x) + '.' }); });
    return it;
  };
  const mine = listFor(l), others = [0, 1, 2, 3].filter(L => L !== l).map(L => [L, listFor(L)]).filter(x => x[1].length);
  let h = '<div class="block sumblk"><h3>Promotions et relégations</h3>';
  h += mine.length ? sumList(mine) : '<p class="small mute" style="margin:0">Personne ne quitte la Ligue ' + (l + 1) + ' après ce tournoi.</p>';
  others.forEach(([L, it]) => { h += '<p class="small mute" style="margin:10px 0 2px">Ligue ' + (L + 1) + '</p>' + sumList(it); });
  return h + '<p class="small mute" style="margin:10px 0 0">En cours de saison, on monte d’une ligue avec ' + PROMO_TXT + ', et on descend avec ' + relegTxt() + ', comptés depuis le début de la saison ou depuis l’arrivée dans la ligue. ' + (CFG.varLg ? '<span>En fin de saison, le top ' + VL.cand + ' monte' + (CFG.gpCount ? ' (les promus en cours de saison comptent dans ce top ' + VL.cand + ')' : '') + ' et les ' + relBot() + ' derniers descendent.</span>' : 'En fin de saison, les ' + MOVE + ' premiers montent et les ' + MOVE + ' derniers descendent.') + '</p></div>';
}
/* v328 : « Coupure ratée : des noms connus » — top 20 mondial, top 5 du classement, champion en titre, gagnant du
   tournoi précédent, 3 favoris (meilleurs index du champ avant le tournoi), watchlist, série de coupures ratées ;
   « à 1 coup » quand c'est passé tout près. 5 golfeurs au plus. */
function mcStreak(id, s, ti) {
  let n = 0;
  for (let ss = s; ss >= 1 && n < 30; ss--) {
    const H = S.hist[ss - 1]; if (!H || !H.t) break;
    for (let k = ss === s ? ti : N_TOURN - 1; k >= 0; k--) {
      const t = H.t[k]; if (!t || !t.lg) continue;
      const x = tRowMap(t).get(id); if (!x) continue;   // tournoi non joué : on continue de remonter
      if (x[1][1] === 0) n++; else return n;
    }
  }
  return n;
}
function mcNotHTML(T, s, ti, l) {
  const lg = T && T.lg && T.lg[l]; if (!lg || lg.one || T.fin || lg.cut == null) return '';
  const miss = lg.rows.filter(r => r[1] === 0); if (!miss.length) return '';
  let SM = null; try { SM = ti >= 1 ? standMoves(s, ti, l) : null; } catch (e) { }
  const Hp = S.hist[s - 2], dc = Hp && Hp.t && Hp.t[ti] && Hp.t[ti].lg && Hp.t[ti].lg[l] && Hp.t[ti].lg[l].rows[0] ? Hp.t[ti].lg[l].rows[0][0] : null;
  let pw = null; { const H = S.hist[s - 1]; for (let k = ti - 1; k >= 0 && pw == null; k--) { const t = H && H.t[k]; if (t && t.lg && t.lg[l] && t.lg[l].rows[0]) pw = t.lg[l].rows[0][0]; } }
  const atB = ti > 0 ? [s, ti - 1] : [s - 1, N_TOURN - 1];
  const fav = lg.rows.map(r => [r[0], hcAt(r[0], atB)]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => x[0]);
  const WL = new Set(S.wl && S.wl.lists ? wlIds('all') : []);
  const out = [];
  miss.forEach(r => {
    const id = r[0], R = [], wr = wrRankOf(id, [s, ti]), rk = SM && SM.rb ? SM.rb[id] : null;
    if (wr && wr <= 20) R.push([100 - wr, 'N\u00b0 ' + wr + ' mondial']);
    if (rk && rk <= 5) R.push([90 - rk, ord(rk) + ' au classement']);
    if (dc === id) R.push([70, 'Champion en titre']);
    if (pw === id) R.push([65, 'Gagnant du tournoi pr\u00e9c\u00e9dent']);
    if (fav.includes(id)) R.push([60, 'Un des favoris']);
    if (WL.has(id)) R.push([30, 'Sur ta watchlist']);
    const n = (wr && wr <= 30) || (rk && rk <= 30) || R.length ? mcStreak(id, s, ti) : 0;
    if (n >= 2 && ((wr && wr <= 30) || (rk && rk <= 30))) R.push([50, ord(n) + ' coupure rat\u00e9e de suite']);
    if (!R.length) return;
    R.sort((a, b) => b[0] - a[0]);
    out.push({ id, r1: r[2], R, p: R[0][0] });
  });
  if (!out.length) return '';
  out.sort((a, b) => b.p - a.p);
  const li = out.slice(0, 5).map(x => { const by = x.r1 - lg.cut;
    return '<li class="mcn"><span class="mcnn">' + flagOf(x.id, 18) + ' ' + sumTxt(tk(x.id)) + '</span><span class="mcnt">' + x.R.slice(0, 3).map(y => '<span class="mcnr">' + y[1] + '</span>').join('') + '</span>' +
      '<span class="mcns"><b class="' + cls(x.r1) + '">' + fmt(x.r1) + '</b> <span class="mute"><span>coupure \u00e0</span> ' + fmt(lg.cut) + ' \u00b7 <span' + (by === 1 ? ' class="mcnhot"' : '') + '>' + (by === 1 ? 'rat\u00e9e par 1 coup' : 'rat\u00e9e par ' + by + ' coups') + '</span></span></span></li>'; }).join('');
  return '<div class="block sumblk"><h3>Coupure rat\u00e9e : des noms connus</h3><ul class="mcnl">' + li + '</ul></div>';
}
/* v330 : les gagnants de la semaine (toutes les ligues) et la semaine prochaine */
function weekWinnersHTML(T, s, ti, l) {
  if (!T || !T.lg || T.fin) return '';
  const it = [];
  for (let L = 0; L < 4; L++) { const g = T.lg[L], w = g && g.rows && g.rows[0]; if (!w) continue; it.push([L, w[0], w[2] + (w[3] || 0), g.playoff]); }
  if (T.rc && T.rc.rows && T.rc.rows[0]) { const w = T.rc.rows[0]; it.push([4, w[0], w[2] + (w[3] || 0), T.rc.playoff]); }
  if (it.length < 2) return '';
  return '<div class="wkw">' + it.map(([L, id, tot, po]) => '<a href="#" class="wkwi' + (L === l ? ' on' : '') + '" data-a="tourn" data-s="' + s + '" data-t="' + ti + '" data-l="' + L + '"><span class="wkwl" style="background:' + (L === 4 ? 'var(--me);color:#1a1a1a' : 'var(--lg' + (L + 1) + ')') + '">' + (L === 4 ? 'Recrues' : 'L' + (L + 1)) + '</span><span class="wkwn">' + flagOf(id, 16) + ' <b>' + esc(nameOf(id)) + '</b></span><span class="wkws ' + cls(tot) + '">' + fmt(tot) + (po ? ' <small>(prol.)</small>' : '') + '</span></a>').join('') + '</div>';
}
function nextWeekHTML(T, s, ti, l) {
  if (!T || T.fin || s !== S.season || l > 3) return '';
  const H = S.hist[s - 1], nx = ti + 1;
  if (nx < N_TOURN) { if (H.t[nx] || S.t !== nx || S.cur) return ''; }
  else if (!(nx === N_TOURN && l === 0 && finalePending() && !S.cur)) return '';
  const fin = nx >= N_TOURN, c = fin ? finCourse() : S.courses[nx]; if (!c || !c.name) return '';
  const ids = fin ? finField() : S.L[l].filter(id => id === 0 ? !!(S.G[0] || S.pk) : !!S.G[id]); if (ids.length < 2) return '';
  const key = [S.season, nx, l, ids.length, c.name, 'nw'].join('|');
  if (!PRV_CACHE || PRV_CACHE.key !== key) PRV_CACHE = { key, od: prvOdds(ids, S.one && !fin ? 1 : 2).sort((a, b) => b.p - a.p) };
  const od = PRV_CACHE.od.filter(o => o.id !== 0).slice(0, 3);
  const Hp = S.hist[s - 2], pt = !fin && Hp && Hp.t && Hp.t[nx], pr = pt && pt.lg && pt.lg[l] && pt.lg[l].rows && pt.lg[l].rows[0];
  const tag = fin ? '\ud83c\udfc6 Finale \u00b7 top ' + FIN.n + ' de la Ligue 1' : (l === 0 && isMajorT(nx) ? '\u2605 Majeur \u00b7 ' + esc(majorName(nx)) : 'Tournoi ' + (nx + 1) + ' sur ' + N_TOURN);
  return '<div class="block sumblk nxw"><h3>La semaine prochaine</h3><div class="nxwt">' + tag + '</div><div class="nxwc">' + esc(c.name) + '</div><div class="small mute">Par ' + parTotal(c.pars) + (c.dist ? ' \u00b7 ' + fmtDist(c.dist) + ' v' : '') + (c.cr != null ? ' \u00b7 CR ' + String(c.cr).replace('.', ',') + ' / Slope ' + c.slope : '') + '</div>' +
    (pr ? '<p class="small" style="margin:8px 0 0"><span class="mute">Champion en titre :</span> ' + prvNm(pr[0]) + (ids.includes(pr[0]) ? '' : ' <span class="mute">(pas dans le champ)</span>') + '</p>' : (fin ? '' : '<p class="small mute" style="margin:8px 0 0">Premi\u00e8re \u00e9dition</p>')) +
    (od.length ? '<div class="nxwf"><span class="mute small">Favoris</span>' + od.map(o => '<span class="nxwo">' + prvNm(o.id) + ' <b>' + prvOddsTxt(o.p) + '</b></span>').join('') + '</div>' : '') + '</div>';
}
function storyHTML(T, s, ti, l, opts) {
  let st = null;
  try { st = tournStory(T, s, ti, l); } catch (e) { console.error(e); }
  if (!st) return sumHTML(getSum(T, l), opts);
  return weekWinnersHTML(T, s, ti, l) + st.une + sumHTML(getSum(T, l), Object.assign({ noHead: 1 }, opts)) + mcNotHTML(T, s, ti, l) + movesHTML(T, s, ti, l) + st.thr +   // v329 : sans « Le moment clé » ni « Les nations »
    '<h2>Statistiques</h2>' + st.num + st.mine + st.mov + nextWeekHTML(T, s, ti, l);
}
/* ---- Journal : tous les résumés, du plus récent au plus ancien ---- */
const JV = { f: 'all', l: null, all: false };
function vJournal() {
  const pl = vLg(), l = JV.l == null ? pl : JV.l;
  let h = '<div class="top"><div><h1>Journal</h1><div class="ctx">Résumés des tournois et des intersaisons</div></div></div>';
  h += chipRow([['all', 'Tout'], ['t', 'Tournois'], ['e', 'Intersaisons']], JV.f, 'jf');
  h += '<div class="ctx" style="margin-top:6px">Résumés de la ligue :</div>' + chipRow(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1)]), l, 'jl');
  const hs = S.hist.slice().reverse().filter(H => H.end || H.t.some(Boolean));
  const shown = JV.all ? hs : hs.slice(0, 2);
  let n = 0;
  shown.forEach(H => {
    let rs = '';
    if (H.end && JV.f !== 't') {
      const champ = H.end.tables[l] && H.end.tables[l][0];
      rs += '<a href="#" class="jrow" data-a="seasonrecap" data-s="' + H.s + '">' + ico('cal') + '<div><div class="jt">Intersaison ' + yr(H.s) + ' → ' + yr(H.s + 1) + '</div><div class="jd">' + (champ ? 'Champion ' + LEAGUE_SHORT[l] + ' : ' + esc(nameOf(champ[0])) + ' · ' : '') + H.end.retired + ' retraite' + (H.end.retired > 1 ? 's' : '') + (H.end.x ? ' · ' + H.end.x.tc.length + ' changements de palier' : '') + '</div></div><span class="jc" aria-hidden="true">›</span></a>';
    }
    if (JV.f !== 'e') H.t.map((t, i) => [t, i]).filter(x => x[0]).reverse().forEach(([t, i]) => {
      const sm = getSum(t, l);
      rs += '<a href="#" class="jrow" data-a="tourn" data-f="journal" data-s="' + H.s + '" data-t="' + i + '" data-l="' + l + '">' + ico('trophy') + '<div><div class="jt">Tournoi ' + (i + 1) + ' · ' + esc(t.name) + '</div><div class="jd">' + esc(sumPlain(sm.head)) + (sm.sub ? ' · ' + esc(sm.sub.split(' · ')[0]) : '') + '</div></div><span class="jc" aria-hidden="true">›</span></a>';
    });
    if (rs) { n++; h += '<div class="block jbl"><div class="jsea">Saison ' + yr(H.s) + (H.s === S.season ? ' · en cours' : '') + '</div>' + rs + '</div>'; }
  });
  if (!n) h += '<p class="mute">Rien à afficher pour l’instant : les résumés apparaissent après chaque tournoi.</p>';
  if (!JV.all && hs.length > 2) h += '<button class="btn sec" data-a="jmore">Afficher les saisons plus anciennes</button>';
  h += NAV.length ? '<button class="btn sec" data-a="backview">Retour</button>' : '<button class="btn sec" data-a="home">Retour à la saison</button>';
  return h;
}

/* ---- Fin de saison ---- */
function doSeasonEnd() {
  if (finalePending()) simFinale();   // la Finale se joue avant la clôture (simulée si le joueur n'y est pas)
  const U = { G: S.G, L: S.L, used: S.used, nextId: S.nextId };
  const H = seasonHist();
  let wrS = null; try { wrS = wrSnapshot(); } catch (e) { }
  let roy = null; try { roy = rcRoyPick(S.season); } catch (e) { }   // Recrue de l'année (classe arrivée pour cette saison)   // World Ranking à la fin de la saison (rangs internes jusqu'à 300, pour les montées et les chutes)
  try { almSnap(H); } catch (e) { }   // Almanac : paliers, index et cartes trou par trou de la saison qui se termine
  const tables = [0, 1, 2, 3].map(l => rankAll(l).map(r => [r.id, r.pts, r.w, r.t10, !r.gh && gmv(r.id) && gmv(r.id).mv ? 1 : 0].concat(r.gh ? [1] : [])));   // 5e valeur : arrivé en cours de saison (protégé) ; 6e : promu en cours de saison (gardé au classement de la ligue quittée)
  const midMoves = [];   // golfeurs déplacés en pleine saison : ligue de départ/arrivée, points accumulés de chaque côté
  const mk = Object.keys(S.G); if (!S.G[0] && S.pk && S.pk.mv) mk.push('0');
  mk.forEach(k => {
    const g = gmv(+k); if (!g || !g.mv) return;
    const mvs = g.mv.moves || [{ fromL: g.mv.fromL, toL: leagueOf(+k), type: g.mv.type, reason: g.mv.reason, pts: g.mv.fromPts }];
    mvs.forEach((m, i) => { const nextPts = i + 1 < mvs.length ? mvs[i + 1].pts : getSt(+k).pts; midMoves.push({ id: +k, fromL: m.fromL, fromPts: m.pts - (i ? mvs[i - 1].pts : 0), toL: m.toL, toPts: nextPts - m.pts, type: m.type, reason: m.reason }); });
  });
  const oldL = S.L.map(a => a.slice());
  const tb = {}; Object.keys(S.G).forEach(k => { tb[k] = tierOf(S.G[k]); });   // paliers d'avant l'intersaison
  if (!S.G[0] && S.pk && S.pk.a && S.st[0] && S.mode !== 'sim') S.pk.a++;   // v268 : le joueur manuel vieillit d'un an
  const res = endSeason(U, S.st, S.mode === 'sim');
  Object.values(S.G).forEach(g => { g.mv = null; }); if (S.pk) S.pk.mv = null;   // la protection ne vaut que pour la saison qui vient de se terminer
  { const lt = (id, t) => { const g = S.G[id]; if (g) g.lt = { s: S.season, t }; };   // repères de l'intersaison, affichés dans la Watchlist
    res.up.forEach(a => a.forEach(id => lt(id, 'promo'))); res.down.forEach(a => a.forEach(id => lt(id, 'releg')));
    res.events.forEach(e => { if (e.ev === 'bust' || e.ev === 'late' || e.ev === 'up' || e.ev === 'down' || e.ev === 'yips' || e.ev === 'scout') lt(e.id, e.ev); }); }
  S.L = U.L; S.used = U.used; S.nextId = U.nextId;
  const lg0 = {}; oldL.forEach((a, l) => a.forEach(id => { lg0[id] = l; }));
  const tc = [];   // tous les golfeurs qui changent de palier : [id, avant, après, ligue de la saison, ligue suivante]
  Object.keys(S.G).forEach(k => { if (tb[k] === undefined) return; const to = tierOf(S.G[k]); if (to !== tb[k]) tc.push([+k, tb[k], to, lg0[k], leagueOf(+k)]); });
  const rt = res.retired.filter(r => !r.nc).map(r => [r.id, r.age, r.cs, r.cw, r.ce || 0, r.l, tb[r.id] === undefined ? -1 : tb[r.id], r.f || 0]);   // 8e valeur : retraite forcée (4 saisons en Ligue 4)
  const rk = res.rookies.map(r => { const g = S.G[r.id]; return [r.id, r.l, g ? g.a : 0, g ? potOf(g) : 0]; });
  res.retired.forEach(r => {
    if (r.id === 0) {
      S.playerCareers = S.playerCareers || [];
      S.playerCareers.push({ n: r.name, nat: r.nat || '', a: r.age, s: S.season, cs: r.cs, cw: r.cw, l: r.l, ce: r.ce || 0 });
      S.needsPlayerCreate = true; delete S.st[0];
    } else {
      S.old[r.id] = { n: r.name, nat: r.nat || '', a: r.age, s: S.season, cs: r.cs, cw: r.cw, l: r.l, ce: r.ce || 0 }; if (r.f) S.old[r.id].f = r.f; if (r.rc) S.old[r.id].rc = r.rc;   /* v362 : la page de la cuvée garde aussi les retranchés et retraités */ if (r.nc) S.old[r.id].nc = 1; if (r.bio) S.old[r.id].bio = r.bio; if (r.ph) { S.old[r.id].ph = r.ph; S.old[r.id].bg = r.bg; }
      // progression et carnet d'handicap conservés pour la fiche du retraité
      if (r.oh || r.o != null) S.old[r.id].oh = (r.oh || []).concat(r.o != null ? [[S.season, Math.round(r.o), Math.round(r.p)]] : []).slice(-60);
      if (r.hc && r.hc.x != null) S.old[r.id].hc = r.hc;
      if (r.pa) S.old[r.id].pa = r.pa;
      if (r.fam) S.old[r.id].fam = r.fam;
    }
  });
  const from = oldL.findIndex(a => a.includes(0)), to = plLeague();
  const rank = from >= 0 ? tables[from].findIndex(r => r[0] === 0) + 1 : 0;
  const prc = (res.rcg || []).find(r => r[0] === 0) || null;   // v249 : ta saison dans la classe de recrues   // from = -1 : saison jouée sans le joueur (histoire présimulée)
  const news = [], newsIds = [];
  if (res.rcg && res.rcg.length) {   // v247 : placement de la classe de recrues
    const rc = res.rcg, top = rc[0], nc = rc.filter(r => r[2] < 0).length, nm = id => nameOf(id) || ((S.old && S.old[id]) || {}).n || '';
    rc.filter(r => r[2] === 0).forEach(r => { news.push('\ud83d\udca5 ' + nm(r[0]) + ' fait le saut directement en Ligue 1 apr\u00e8s sa saison dans la classe de recrues (index ' + fmtHI(r[1]) + ') !'); newsIds.push([r[0]]); });
    rc.filter(r => r[2] === 1).slice(0, 3).forEach(r => { news.push('\ud83c\udf93 ' + nm(r[0]) + ' commence sa carri\u00e8re en Ligue 2 (index ' + fmtHI(r[1]) + ').'); newsIds.push([r[0]]); });
    if (top && top[2] > 1) { news.push('\ud83c\udf93 ' + nm(top[0]) + ' termine 1er de la classe de recrues ' + yr(S.season) + ' (index ' + fmtHI(top[1]) + ') et commence en Ligue ' + (top[2] + 1) + '.'); newsIds.push([top[0]]); }
    if (nc) { news.push('\u274c ' + nc + ' recrue' + (nc > 1 ? 's' : '') + ' de la classe ' + yr(S.season) + ' n\u2019obtien' + (nc > 1 ? 'nent' : 't') + ' pas sa carte pour le circuit.'); newsIds.push([]); }
  }
  if (S.rcl && S.rcl.s === S.season + 1) S.rcl.ids.forEach(id => { const g = S.G[id]; if (g && g.prd) { news.push('\ud83c\udf1f ' + g.n + ' (' + g.a + ' ans) entre dans la classe de recrues ' + yr(S.season + 1) + ' avec un jeu d\u00e9j\u00e0 digne du circuit.'); newsIds.push([id]); } });
  const notable = res.retired.filter(r => !r.nc).filter(r => { const t = tables[r.l].findIndex(x => x[0] === r.id); return (t >= 0 && t < 12) || r.cw > 0 || r.age >= 52 || r.cs >= 16; });
  notable.sort((a, b) => (b.cw - a.cw) || (b.cs - a.cs)).slice(0, 4).forEach(r =>
    { news.push(r.name + ' (' + r.age + ' ans) ' + (r.f ? 'perd sa place sur le circuit (' + fL4N(r.f) + ' saisons en Ligue 4) apr\u00e8s ' : 'prend sa retraite apr\u00e8s ') + r.cs + ' saison' + (r.cs > 1 ? 's' : '') + (r.cw ? ' et ' + r.cw + ' titre' + (r.cw > 1 ? 's' : '') : '') + '.'); newsIds.push([r.id]); });
  res.events.filter(e => e.ev === 'late').slice(0, 3).forEach(e => { if (S.G[e.id]) { news.push(nameOf(e.id) + ' (' + S.G[e.id].a + ' ans) conna\u00eet une \u00e9closion tardive : personne ne l\u2019attendait l\u00e0.'); newsIds.push([e.id]); } });
  res.events.filter(e => e.ev === 'scout').slice(0, 3).forEach(e => { const g = S.G[e.id]; if (g) { news.push('\ud83d\udd0e Les d\u00e9pisteurs revoient ' + nameOf(e.id) + ' (' + g.a + ' ans) \u00e0 la hausse : potentiel ' + POTS[scale(POTS, g.scf != null ? g.scf : g.p)][1] + ' \u2192 ' + POTS[scale(POTS, g.p)][1] + '.'); newsIds.push([e.id]); } delete (g || {}).scf; });
  res.events.filter(e => e.ev === 'up').slice(0, 3).forEach(e => { if (S.G[e.id]) { news.push(nameOf(e.id) + ' (' + S.G[e.id].a + ' ans) semble avoir franchi un cap au cours de la derni\u00e8re ann\u00e9e.'); newsIds.push([e.id]); } });
  res.events.filter(e => e.ev === 'bust').slice(0, 2).forEach(e => { if (S.G[e.id]) { news.push(nameOf(e.id) + ' (' + S.G[e.id].a + ' ans) d\u00e9\u00e7oit : on attendait mieux, les d\u00e9pisteurs revoient son potentiel \u00e0 la baisse.'); newsIds.push([e.id]); } });
  (res.saved || []).slice(0, 3).forEach(([id, l]) => { const e = exInfo(id, l); if (!e || (!S.G[id] && id !== 0)) return; news.push('\ud83d\udee1 ' + nameOf(id) + ' \u00e9vite la rel\u00e9gation en Ligue ' + (l + 2) + ' gr\u00e2ce \u00e0 son exemption (' + e.tip + ').'); newsIds.push([id]); });
  res.events.filter(e => e.ev === 'down').slice(0, 2).forEach(e => { if (S.G[e.id]) { news.push(nameOf(e.id) + ' sort d\u2019une ann\u00e9e difficile : son niveau a recul\u00e9.'); newsIds.push([e.id]); } });
  res.events.filter(e => e.ev === 'yips').slice(0, 2).forEach(e => { if (S.G[e.id]) { news.push(nameOf(e.id) + ' (' + S.G[e.id].a + ' ans) perd soudainement la touche : personne ne s\u2019explique la chute.'); newsIds.push([e.id]); } });
  res.rookies.map(r => S.G[r.id]).filter(g => g && g.fn).slice(0, 3).forEach(g => { const m = famMain(g.id); delete g.fn; if (!m) return; const rel = famRec(m[0]); const ret = !S.G[m[0]]; news.push(g.n + ' (' + g.a + ' ans), ' + ({ pere: 'fils ' + (ret ? 'de l\u2019ancien golfeur ' : 'de ') , frere: (famAgeNow(m[0]) === g.a ? 'frère jumeau de ' : 'frère cadet de '), cousin: 'cousin de ' + (ret ? 'l\u2019ancien golfeur ' : '') }[m[1]] || '') + nameOf(m[0]) + ', fait son entrée sur le circuit.'); newsIds.push([g.id, m[0]]); });
  Object.values(S.G).forEach(g => { if (g.fn) delete g.fn; });
  let hofRes = null;
  if (talOn()) { const te = res.events.filter(e => e.ev === 'tal' && S.G[e.id] && (e.w === 'disc' || e.w === 'up')), wl = id => { try { return wlIn(id).length ? 1 : 0; } catch (x) { return 0; } };
    const sc = e => wl(e.id) * 100 + (3 - Math.max(0, leagueOf(e.id))) * 10 + e.lv * 3 + (e.w === 'up' && e.lv === 3 ? 6 : 0) + (e.neg ? -4 : 0);
    te.sort((a, b) => sc(b) - sc(a)).slice(0, 3).forEach(e => { news.push(talNews(e)); newsIds.push([e.id]); }); }
  try { hofCatchUp(H.s - 1); hofRes = hofBallot(H.s); hofRes.inn.forEach(m => { news.push(m.n + ' entre au Temple de la renommée' + (m.y === 1 ? ' dès son premier scrutin' : ' à sa ' + ord(m.y) + ' année sur le scrutin') + ' (' + String(m.pct).replace('.', ',') + ' % des votes).'); newsIds.push(m.k[0] === 'P' ? [] : [+m.k]); }); } catch (e) { hofRes = null; }
  const clEv = res.events.filter(e => e.ev === 'cl' && S.G[e.id]).map(e => [e.id, e.from, e.to]);
  if (clEv.length) { const wl = id => { try { return wlIn(id).length ? 1 : 0; } catch (x) { return 0; } }, sc = e => wl(e[0]) * 100 + (3 - Math.max(0, leagueOf(e[0]))) * 10 + Math.abs(e[2]) * 2 + (e[2] > e[1] ? 1 : 0);
    clEv.slice().sort((a, b) => sc(b) - sc(a)).filter(e => leagueOf(e[0]) <= 1 || wl(e[0])).slice(0, 2).forEach(e => { news.push(clNews(e[0], e[1], e[2])); newsIds.push([e[0]]); }); }
  { const tv = res.events.filter(e => e.ev === 'trt' && S.G[e.id]), wl = id => { try { return wlIn(id).length ? 1 : 0; } catch (x) { return 0; } };   // v341
    tv.sort((a, b) => (wl(b.id) - wl(a.id)) * 100 + leagueOf(a.id) - leagueOf(b.id)).filter(e => leagueOf(e.id) <= 1 || wl(e.id)).slice(0, 2).forEach(e => { news.push(trNews(e.id, e.k, e.from, e.to)); newsIds.push([e.id]); }); }
  const talEv = res.events.filter(e => e.ev === 'tal').map(e => [e.id, e.w, e.k, e.lv, e.neg ? 1 : 0]);
  const skEv = res.events.filter(e => e.ev === 'sk' && S.G[e.id]).map(e => [e.id, e.k, e.from, e.to]);
  const rnIds = S.rcl && S.rcl.s === S.season + 1 ? S.rcl.ids.filter(id => id !== 0) : null;   // v252 : la classe qui entre dans la classe de recrues
  H.end = { tal: talEv, cl: clEv, sk: skEv, tables, from, to, rank, pre: from < 0 && !prc ? 1 : 0, prc: prc || undefined, up: res.up, down: res.down, retired: res.retired.filter(r => !r.nc).length, rookies: res.rookies.length, news, nids: newsIds, x: rnIds ? { tc, rt, rk, rn: rnIds } : { tc, rt, rk }, rc: res.rcg && res.rcg.length ? res.rcg : undefined, midMoves, wr: wrS, roy };
  try { rcSnap(H.s); } catch (e) { }
  if (hofRes) H.end.hof = hofRes.rows;
  news.forEach((t, i) => S.news.unshift({ s: S.season, t: 0, text: t, l: -1, ids: newsIds[i] || [] }));
  if (S.news.length > IBX_MAX) S.news.length = IBX_MAX;
  skMean(); S.season++; S.t = 0; S.st = {};
  Object.values(S.G).forEach(g => { g.oh = g.oh || []; g.oh.push([S.season - 1, Math.round(g.o), Math.round(g.p)]); if (g.oh.length > 60) g.oh.shift(); });
  S.hist.forEach(H => { if (H.s < S.season - 3) { H.t.forEach(t => { if (t) t.lg.forEach(x => { delete x.h; delete x.sx; delete x.sp; }); if (t.rc) delete t.rc.h; }); if (H.fin && H.fin.lg) H.fin.lg.forEach(x => { if (x) { delete x.h; delete x.sx; delete x.sp; } }); } });
  S.L.forEach(l => l.forEach(id => { S.st[id] = newStanding(); }));
  S.hist.push({ s: S.season, t: Array(N_TOURN).fill(null), end: null });
  autoDrawCourses();   // terrains non barrés tirés au hasard selon les filtres (rien pendant l'histoire présimulée)
  VIEW = { name: 'off', s: S.season - 1, i: 0 };   // v215 : l'intersaison se lit en chapitres (la cérémonie du Temple en fait partie)
  if (!S.presim) S.off = { s: S.season - 1, i: 0 };
  persist();
}

/* ---- Historique d'un golfeur ---- */
/* Dernière saison d'une carrière terminée du joueur : les résultats d'avant appartiennent à un autre golfeur (l'identifiant 0 est réutilisé). */
function careerStart(id) { return id === 0 ? (S.playerCareers || []).reduce((m, c) => Math.max(m, c.s || 0), 0) : 0; }
function golferHistory(id, wRc, wFin) {
  const out = [], c0 = careerStart(id);
  S.hist.forEach(h => { h.t.forEach((t, ti) => {
    if (!t || h.s <= c0) return;
    let f = 0;
    for (let l = 0; l < 4; l++) { const r = t.lg[l].rows.find(x => x[0] === id); if (r) { out.push({ s: h.s, t: ti, l, name: t.name, pos: r[1], r1: r[2], r2: r[3], pts: r[4], pay: (t.lg[l].pay && t.lg[l].pay[id]) || 0, field: t.lg[l].rows.length, mc: rowMC(r, t.lg[l]) }); f = 1; break; } }
    if (!f && wRc && t.rc) { const r = t.rc.rows.find(x => x[0] === id); if (r) out.push({ s: h.s, t: ti, l: 4, name: t.name, pos: r[1], r1: r[2], r2: r[3], pts: 0, pay: 0, field: t.rc.rows.length, mc: r[1] === 0 }); }
  });
    const F = wFin && h.s > c0 && h.fin && h.fin.lg && h.fin.lg[0], r = F && F.rows.find(x => x[0] === id);   // v250 : la Finale (11e tournoi)
    if (r) out.push({ s: h.s, t: N_TOURN, l: 0, fin: 1, name: h.fin.name, pos: r[1], r1: r[2], r2: r[3], pts: r[4], pay: (F.pay && F.pay[id]) || 0, field: F.rows.length, mc: rowMC(r, F) });
  });
  return out;
}


