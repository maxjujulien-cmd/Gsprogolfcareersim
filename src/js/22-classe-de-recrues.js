/* ============ v247 : Classe de recrues ============
   Les recrues jouent une saison entre elles (10 tournois, deux rondes, sans coupure, points ni bourse).
   À la fin, leur index décide de leur ligue : la meilleure ligue dont la moyenne de la saison est moins bonne que leur index.
   Plus de CFG.rcNoCard au-dessus de la moyenne de la L4 : pas de carte. */
function rcHas(s) { const H = S.hist[s - 1]; return !!((S.rcl && S.rcl.s === s) || (H && ((H.end && H.end.rc) || (H.t || []).some(t => t && t.rc)))); }
function rcAvgFor(s) { const a = S.alm && (S.alm[s] || S.alm[s - 1]); return a && a.ix ? a.ix : almIdxMeans(); }
function rcDest(x, avg, thr) { if (x == null || x >= 90) return null; const l = [0, 1, 2, 3].find(k => avg[k] != null && x < avg[k]); if (l != null) return l; const nc = CFG.rcNoCard == null ? 5 : CFG.rcNoCard; return avg[3] == null || x <= (thr != null ? thr : avg[3] + nc) ? 3 : -1; }
/* v343 : au plus CFG.rcNcMax % de la classe sans carte ; au-delà, les meilleurs index sous le seuil obtiennent une carte « de justesse » */
const rcCap = () => (CFG.rcNcMax == null ? 15 : CFG.rcNcMax) / 100;
function rcCutThr(xs, avg) {
  const nc = CFG.rcNoCard == null ? 5 : CFG.rcNoCard, base = avg[3] == null ? Infinity : avg[3] + nc;
  const fails = xs.filter(x => x != null && x > base).sort((a, b) => b - a), K = Math.floor(xs.length * rcCap());
  return fails.length <= K ? base : fails[K];   // ceux au-dessus de fails[K] (les K pires) sont retranchés
}
function rcThrNow(s, avg) { const ids = S.rcl && S.rcl.s === s ? S.rcl.ids.filter(id => id !== 0 && S.G[id]) : []; return rcCutThr(ids.map(id => { const g = S.G[id]; return g.hc && g.hc.x != null ? g.hc.x : 99; }), avg); }
function rcLgTag(l, proj) { return l == null ? '<span class="mute">–</span>' : '<span class="rclg rl' + (l < 0 ? 'x' : l) + '">' + (l < 0 ? '<span>Sans carte</span>' : 'L' + (l + 1)) + '</span>' + (proj ? '' : ''); }
function vRcLeague(s) {
  const H = S.hist[s - 1], cur = S.rcl && S.rcl.s === s, done = H && H.end && H.end.rc;
  const ts = (H ? H.t : []).map((t, i) => [t, i]).filter(x => x[0] && x[0].rc);
  const avg = done ? (S.alm && S.alm[s] && S.alm[s].ix) || rcAvgFor(s) : rcAvgFor(s);
  const st = {}; ts.forEach(([t]) => t.rc.rows.forEach(r => { const o = st[r[0]] || (st[r[0]] = { n: 0, sum: 0, rd: 0, w: 0, best: null }); o.n++; o.sum += r[2] + (r[3] || 0); o.rd += r[3] == null ? 1 : 2; if (r[1] === 1) o.w++; if (o.best == null || r[1] < o.best) o.best = r[1]; }));
  let rows;
  const thrN = done ? null : rcThrNow(s, avg);
  if (done) rows = H.end.rc.map(r => ({ id: r[0], x: r[1] >= 90 ? null : r[1], l: r[2], rk: r[3], j: r[4] }));
  else rows = (cur ? S.rcl.ids : []).filter(id => S.G[id] || id === 0).map(id => { const g = hcHolder(id) || {}, x = g.hc && g.hc.x != null ? g.hc.x : null; return { id, x, l: rcDest(x, avg, thrN) }; }).sort((a, b) => (a.x == null ? 99 : a.x) - (b.x == null ? 99 : b.x) || ((st[a.id] && st[a.id].rd ? st[a.id].sum / st[a.id].rd : 99) - (st[b.id] && st[b.id].rd ? st[b.id].sum / st[b.id].rd : 99))).map((r, i) => Object.assign(r, { rk: i + 1 }));
  const seasons = S.hist.map(x => x.s).filter(rcHas);
  let top = '<div class="top"><div><h1>Classe de recrues</h1><div class="ctx"><span>Saison</span> ' + yr(s) + ' · ' + rows.length + ' <span>recrues</span> · <span>' + (done ? 'placement final' : 'ligue projetée selon l’index actuel') + '</span></div></div></div>';
  let bar = chipRow(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1) + ' ' + n]).concat([[4, 'Recrues']]), 4, 'league');
  if (seasons.length > 1) bar += '<select data-c="season" aria-label="Saison">' + seasons.slice().reverse().map(x => '<option value="' + x + '"' + (x === s ? ' selected' : '') + '>Saison ' + yr(x) + '</option>').join('') + '</select>';
  const thr = '<p class="small mute" style="margin:6px 0 10px"><span>Moyenne des index</span> : ' + [0, 1, 2, 3].map(l => 'L' + (l + 1) + ' ' + (avg[l] == null ? '–' : fmtHI(avg[l]))).join(' · ') + ' · <span>sans carte au-delà de</span> ' + (avg[3] == null ? '–' : fmtHI(avg[3] + (CFG.rcNoCard == null ? 5 : CFG.rcNoCard))) + '. <span>Chaque recrue commence dans la meilleure ligue dont la moyenne est moins bonne que son index.</span></p>';
  const cnt = [0, 1, 2, 3, -1].map(l => [l, rows.filter(r => r.l === l).length]).filter(x => x[1]);
  const sum = '<div class="rcsum">' + cnt.map(([l, n]) => '<span>' + rcLgTag(l) + ' <b>' + n + '</b></span>').join('') + '</div>';
  const so = VIEW.rcsort || 'x', gOf = id => S.G[id] || (S.old && S.old[id]) || {}, oOf = g => g.o != null ? g.o : g.oh && g.oh.length ? g.oh[g.oh.length - 1][1] : null, pOf = g => g.p != null ? g.p : g.oh && g.oh.length ? g.oh[g.oh.length - 1][2] : null;
  if (so !== 'x') rows = rows.slice().sort((a, b) => ((so === 'o' ? oOf : pOf)(gOf(b.id)) ?? -1) - ((so === 'o' ? oOf : pOf)(gOf(a.id)) ?? -1));
  const tierB = (v, L) => v == null ? '<span class="mute">–</span>' : gsTier(scale(L, v), L);
  const tbl = chipRow([['x', 'Index'], ['o', 'Niveau'], ['p', 'Potentiel']], so, 'rcsort') + '<div class="scroll"><table class="plain rct"><tr><th class="r">#</th><th>Golfeur</th><th class="r">Âge</th><th>Niveau</th><th>Potentiel</th><th class="r">Tourn.</th><th class="r">Moy.</th><th class="r">V</th><th class="r">Index</th><th class="r">' + (done ? 'Ligue' : 'Projetée') + '</th></tr>' +
    rows.map(r => { const g = S.G[r.id] || (S.old && S.old[r.id]) || {}, o = st[r.id]; return '<tr' + (r.id === 0 ? ' class="me"' : r.l === 0 ? ' class="rcl1"' : '') + '><td class="r">' + r.rk + '</td><td><span class="flg-i">' + flagOf(r.id, 18) + '</span><a href="#" data-a="golfer" data-id="' + r.id + '">' + esc(nameOf(r.id) || g.n || '') + '</a>' + (g.prd ? ' <span class="rcprd" title="Arrivé déjà prêt">★</span>' : '') + (r.id !== 0 ? '<div class="rctp">' + tierB(oOf(g), TIERS) + ' ' + tierB(pOf(g), POTS) + '</div>' : '') + '</td><td class="r">' + (g.a || '–') + '</td><td>' + (r.id === 0 ? '' : tierB(oOf(g), TIERS)) + '</td><td>' + (r.id === 0 ? '' : tierB(pOf(g), POTS)) + '</td><td class="r">' + (o ? o.n : 0) + '</td><td class="r">' + (o && o.rd ? fmt1(o.sum / o.rd) : '–') + '</td><td class="r">' + (o && o.w ? o.w : '') + '</td><td class="r"><b>' + (r.x == null ? '–' : fmtHI(r.x)) + '</b></td><td class="r">' + rcLgTag(r.l) + (r.j ? ' <span class="small mute">de justesse</span>' : '') + '</td></tr>'; }).join('') + '</table></div>';
  let R = '<h2>Tournois</h2>';
  if (!ts.length) R += '<p class="mute">Aucun tournoi joué par la classe pour l’instant.</p>';
  else R += '<div class="scroll"><table class="plain"><tr><th>#</th><th>Terrain</th><th>Meilleur score</th><th class="r">Score</th></tr>' + ts.slice().reverse().map(([t, i]) => { const w = t.rc.rows[0]; return '<tr><td>' + (i + 1) + '</td><td><a href="#" data-a="tourn" data-s="' + s + '" data-t="' + i + '" data-l="4">' + esc(t.name) + '</a></td><td>' + esc(nameOf(w[0]) || '') + '</td><td class="r ' + cls(w[2] + (w[3] || 0)) + '">' + fmt(w[2] + (w[3] || 0)) + '</td></tr>'; }).join('') + '</table></div>';
  const L = bar + thr + sum + tbl;
  if (isMgr()) return top + '<div class="gdash rcdash">' + dPanel('Classement de la classe', '<div style="padding:10px 14px">' + L + '</div>', '', 'rc-a') + dPanel('Tournois de la classe', '<div style="padding:4px 14px 12px">' + R.replace('<h2>Tournois</h2>', '') + '</div>', '', 'rc-b') + '</div>';
  return top + cols(L, R, '', 'lg');
}

/* ---- Ligues, style gestionnaire (v196) : mêmes tableaux, rangés en panneaux ---- */
function leaguesMgr(l, s, H, cur, seasons, R) {
  const bar = '<div class="lgbar"><div class="lgtabs">' + LEAGUE_SHORT.map((n, i) => '<button class="lgt' + (i === l ? ' on' : '') + '" data-a="league" data-v="' + i + '"><i style="background:var(--lg' + (i + 1) + ')"></i>L' + (i + 1) + ' · ' + n + '</button>').join('') + (rcHas(s) ? '<button class="lgt" data-a="league" data-v="4"><i style="background:var(--me)"></i>Recrues</button>' : '') + '</div>' +
    (seasons.length > 1 ? '<select data-c="season" aria-label="Saison" class="lgsel">' + seasons.slice().reverse().map(x => '<option value="' + x + '"' + (x === s ? ' selected' : '') + '>Saison ' + yr(x) + (x === S.season ? ' (en cours)' : '') + '</option>').join('') + '</select>' : '') + '</div>';
  const grid = (cur ? leagueGrid(l, s, { all: true, lgall: 1 }) : H.end ? leagueGrid(l, s, { all: true, lgall: 1, tableRows: H.end.tables[l] }) : '<p class="mute">Aucun classement.</p>');
  // en bref
  let list = [];
  if (cur) list = displayRank(l).map(r => ({ id: r.id, pts: r.pts })); else if (H.end) list = H.end.tables[l].map(r => ({ id: r[0], pts: r[1] }));
  const played = H.t.filter(Boolean).length, me = list.findIndex(r => r.id === 0);
  const tile = (v, k, cls) => '<div' + (cls ? ' class="' + cls + '"' : '') + '><b>' + v + '</b><span>' + k + '</span></div>';
  let brief = '<div class="lgbrief">';
  if (list[0]) brief += '<div class="lglead">' + flagOf(list[0].id, 22) + '<div><small>' + (cur && played < N_TOURN ? 'EN TÊTE' : 'CHAMPION') + '</small><a href="#" data-a="golfer" data-id="' + list[0].id + '">' + esc(nameOf(list[0].id)) + '</a></div><b>' + list[0].pts + ' pts</b></div>';
  brief += '<div class="dst3">' + tile(played + '/' + N_TOURN, 'Tournois joués') + tile(me >= 0 ? ord(me + 1) : '–', 'Ton rang') + tile(list.length, 'Golfeurs') + '</div>';
  const VP = CFG.varLg && cur ? planNow() : null, vu = VP && l > 0 ? VP.up[l] : null, vlast = vu && vu.length ? list.find(r => r.id === vu[vu.length - 1]) : null;
  if (VP) brief += '<div class="dst3">' + (l > 0 ? tile(vlast ? vlast.pts + ' pts' : '–', 'Dernier promu (' + vu.length + ' en ce moment)', 'up') : tile('–', 'Pas de promotion')) + (l < 3 ? (() => { const D = new Set(VP.down[l] || []), fd = list.findIndex(r => D.has(r.id)); return tile(fd > 0 ? list[fd - 1].pts + ' pts' : '–', 'Ligne de maintien (' + relBot() + ' derniers relégués)', 'dn'); })() : tile('–', 'Pas de relégation')) + tile(me >= 0 ? list[me].pts + ' pts' : '–', 'Tes points') + '</div>';
  const pro = !VP && l > 0 && list[MOVE - 1] ? list[MOVE - 1].pts : null, rel = !VP && l < 3 && list[FIELD - MOVE - 1] ? list[FIELD - MOVE - 1].pts : null;
  if (pro != null || rel != null) brief += '<div class="dst3">' + (pro != null ? tile(pro + ' pts', 'Ligne de promotion (' + MOVE + 'e)', 'up') : tile('–', 'Pas de promotion')) + (rel != null ? tile(rel + ' pts', 'Ligne de relégation (' + (FIELD - MOVE) + 'e)', 'dn') : tile('–', 'Pas de relégation')) + tile(me >= 0 ? list[me].pts + ' pts' : '–', 'Tes points') + '</div>';
  brief += '</div>';
  const pl = H.t.map((t, i) => [t, i]).filter(x => x[0]).reverse();
  const tourn = (pl.length ? '<div class="lgtl">' + pl.map(([t, i]) => { const w = t.lg[l].rows[0], sc = w[2] + (w[3] || 0); return '<a href="#" class="lgti" data-a="tourn" data-s="' + s + '" data-t="' + i + '" data-l="' + l + '"><span class="lgtn">T' + (i + 1) + '</span><span class="lgtc"><b>' + esc(t.name) + '</b><small>' + flagOf(w[0], 14) + ' ' + esc(nameOf(w[0])) + (t.purse ? ' · ' + fmtMoney(Math.round(t.purse * LEAGUE_PURSE_PCT[l])) : '') + '</small></span><span class="lgts ' + cls(sc) + '">' + fmt(sc) + '</span></a>'; }).join('') + '</div>' : '<p class="mute small" style="padding:12px 14px;margin:0">Aucun tournoi joué cette saison.</p>') +
    '<div style="padding:10px 14px"><button class="btn sec" data-a="journal" style="margin:0">Journal des résumés</button></div>';
  // v322 : « En bref » et « Tournois de la saison » au-dessus ; le classement prend toute la largeur
  return bar + '<div class="lgdash lgfull">' + dPanel('En bref', brief, '', 'lg-brief') + dPanel('Tournois de la saison', tourn, '', 'lg-t') +
    dPanel('Classement · ' + LEAGUE_NAMES[l] + ' · ' + yr(s), grid, '', 'lg-main') + '</div>';
}

/* ---- Fiche du tournoi (panneau télé, assorti au tableau) : vainqueur, chiffres clés, meilleures rondes, remontées ---- */
function ficheHTML(lg) {
  const rows = lg.rows, pay = lg.pay || {}, made = lg.one ? rows.filter(r => r[2] <= lg.cut) : rows.filter(r => r[3] !== null); if (!rows.length) return '';
  const r1p = {}; rankTies(rows.map(r => ({ id: r[0], tot: r[2] }))).forEach(x => { r1p[x.id] = x.pos; });
  const W = rows[0], wid = W[0], wt = W[2] + (W[3] || 0), sec = rows[1], gap = sec && !lg.playoff ? (sec[2] + (sec[3] || 0)) - wt : 0;
  const purse = Object.values(pay).reduce((a, b) => a + b, 0);
  const lnk = id => '<a data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>';
  const low = (key, list) => { const v = Math.min.apply(null, list.map(r => r[key])), who = list.filter(r => r[key] === v); return { v, who }; };
  const L1 = low(2, rows), L2 = made.length && !lg.one ? low(3, made) : null;
  const mv = made.map(r => ({ id: r[0], d: r1p[r[0]] - r[1], from: r1p[r[0]], to: r[1] })).filter(m => m.d > 0).sort((a, b) => b.d - a.d).slice(0, 3);
  const lowRow = (k, L) => '<div class="bl"><em>' + k + '</em>' + flagOf(L.who[0][0], 18) + '<span>' + lnk(L.who[0][0]) + (L.who.length > 1 ? ' <small>+' + (L.who.length - 1) + '</small>' : '') + '</span><b class="red">' + fmt(L.v) + '</b></div>';
  let h = '<aside class="tfiche"><div class="bh">Fiche du tournoi</div>' +
    '<div class="bw">' + flagOf(wid, 40) + '<div style="min-width:0"><div class="bn">' + lnk(wid) + '</div><div class="bs">' + fmt(wt) + (pay[wid] ? ' · ' + fmtMoney(pay[wid]) : '') + '</div></div><div class="cup">' + ico('trophy') + '</div></div>' +
    '<div class="bgrid"><div><span>' + (lg.fin ? 'Coupure' : lg.one ? 'Ligne de paye' : 'Coupure') + '</span><b>' + (lg.fin ? 'Aucune' : fmt(lg.cut)) + '</b></div><div><span>' + (lg.fin ? 'Golfeurs' : lg.one ? 'Payés' : 'Qualifiés') + '</span><b>' + made.length + '<small>/' + rows.length + '</small></b></div><div><span>Bourse</span><b>' + (purse ? fmtM(purse) : '—') + '</b></div><div><span>Écart</span><b>' + (lg.playoff ? 'Prol.' : gap > 0 ? gap + '<small> coup' + (gap > 1 ? 's' : '') + '</small>' : '—') + '</b></div></div>' +
    '<div class="bt">Meilleures rondes</div>' + lowRow('R1', L1) + (L2 ? lowRow('R2', L2) : '');
  if (mv.length) h += '<div class="bt">En feu</div>' + mv.map(m => '<div class="bl" title="' + ord(m.from) + ' après R1 → ' + ord(m.to) + '">' + flagOf(m.id, 18) + '<span>' + lnk(m.id) + ' <small>' + ord(m.from) + ' → ' + ord(m.to) + '</small></span><b class="grn">▲' + m.d + '</b></div>').join('');
  return h + '</aside>';
}
const lgNm = l => l === 4 ? 'Classe de recrues' : LEAGUE_NAMES[l];
/* v249 : ta classe de recrues sur l'accueil : rang à l'index et ligue projetée */
function rcStandHTML() {
  const avg = rcAvgFor(S.season), list = rankAll(4), me = list.findIndex(r => r.id === 0), x0 = rcX(0), thrN = rcThrNow(S.season, avg), d0 = rcDest(x0 < 90 ? x0 : null, avg, thrN);
  const pick = list.map((r, i) => [r, i]).filter(([r, i]) => i < 5 || Math.abs(i - me) <= 2);
  let h = '<p class="mute small" style="margin:-4px 0 10px">' + (x0 < 90 ? '<span>Tu es</span> ' + ord(me + 1) + ' <span>de la classe avec un index de</span> ' + fmtHI(x0) + (d0 != null ? ' \u00b7 <span>ligue projetée</span> <b>' + (d0 < 0 ? 'L4' : 'L' + (d0 + 1)) + '</b>.' : '') : '<span>Ton index apparaîtra après trois rondes.</span>') + ' <span>Pas de coupure, de points ni de bourse : à la fin de la saison, ton index décide de ta ligue de départ.</span></p>';
  let prev = -1;
  h += '<div class="boardwrap scroll"><table class="board"><tr><th>Rang</th><th class="fl"></th><th>Joueur</th><th class="r">Index</th><th class="r">Proj.</th></tr>' + pick.map(([r, i]) => { const x = rcX(r.id), d = rcDest(x < 90 ? x : null, avg, thrN), gap = prev >= 0 && i > prev + 1 ? '<tr><td colspan="5" class="mute small" style="text-align:center">…</td></tr>' : ''; prev = i;
    return gap + '<tr' + (r.id === 0 ? ' class="me"' : '') + '><td>' + (i + 1) + '</td><td class="fl">' + flagOf(r.id, 18) + '</td><td><a href="#" data-a="golfer" data-id="' + r.id + '">' + esc(nameOf(r.id)) + '</a></td><td class="r">' + (x < 90 ? fmtHI(x) : '–') + '</td><td class="r">' + (r.id === 0 && d === -1 ? rcLgTag(3) : rcLgTag(d)) + '</td></tr>'; }).join('') + '</table></div>';
  return h;
}
function rcLastHTML(t) {
  const rows = t.rc.rows, me = rows.find(r => r[0] === 0), w = rows[0], tie = me && rows.filter(r => r[1] === me[1]).length > 1;
  return '<div class="block"><h3 style="margin-top:0">' + esc(t.name) + '</h3><p style="margin:6px 0 4px"><b>' + (me ? '<span>Tu termines</span> ' + (tie ? 'T' : '') + ord(me[1]) + ' <span>sur</span> ' + rows.length + ' (' + fmt(me[2] + (me[3] || 0)) + ')' : '') + '</b></p>' +
    (w && w[0] !== 0 ? '<p class="small mute" style="margin:0"><span>Meilleur score de la classe</span> : ' + esc(nameOf(w[0])) + ' (' + fmt(w[2] + (w[3] || 0)) + ')</p>' : '') +
    '<p class="small" style="margin:8px 0 0"><a href="#" data-a="tourn" data-s="' + S.last.s + '" data-t="' + S.last.t + '" data-l="4">Résultats complets</a> \u00b7 <a href="#" data-a="journal">Journal</a></p></div>';
}
function vTourn() {
  if (!tGet(S.hist[VIEW.s - 1], VIEW.t)) return '<div class="top"><div><h1>Tournoi</h1></div></div><p class="mute">Ce tournoi n’a pas encore été joué.</p><button class="btn sec" data-a="backview">Retour</button>';   // v347 : lien vers un tournoi pas encore joué
  const { s, t } = VIEW, T = tGet(S.hist[s - 1], t), l = T && T.fin ? 0 : (VIEW.l === 4 && !T.rc ? 0 : VIEW.l); const res = l === 4 ? T.rc : T.lg[l], mode = VIEW.mode || 'res';
  if (isMgr()) return tournMgr(s, t, l, T, res, mode);
  let h = '<div class="top"><div><h1>' + esc(T.name) + (T.fin ? '<span class="mjb">Finale</span>' : T.maj && l === 0 ? '<span class="mjb">Majeur</span>' : '') + '</h1><div class="ctx"><a href="#" data-a="lgseason" data-s="' + s + '" data-l="' + (T.fin ? 0 : l) + '">Saison ' + yr(s) + '</a> \u00b7 ' + (T.fin ? 'Finale, top ' + FIN.n + ' de la L1' : 'tournoi ' + (t + 1)) + (T.maj && l === 0 ? ' \u00b7 ' + esc(T.maj) : '') + ' \u00b7 par ' + T.par + (T.purse ? ' \u00b7 bourse totale ' + fmtMoney(Math.round(T.purse * (l === 0 && T.pm ? T.pm : 1))) : '') + '</div></div></div>';
  if (!T.fin) h += chipRow(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1)]).concat(T.rc ? [[4, 'Recrues']] : []), l, 'tournleague');
  h += chipRow((res.one ? [['res', 'R\u00e9sultats'], ['c1', 'Cartes de scores']] : [['res', 'R\u00e9sultats'], ['c1', 'Cartes ronde 1'], ['c2', 'Cartes ronde 2']]).concat(res.po ? [['po', 'Prolongation']] : []).concat(res.sx ? [['st', 'Stats']] : []), mode, 'tmode');
  h += '<p class="small mute">' + (T.fin ? 'Aucune coupure \u00b7 points doubl\u00e9s' : (l === 4 ? 'Classe de recrues \u00b7 aucune coupure, ni points, ni bourse : les rondes comptent pour l\u2019index' : (res.one ? 'Une ronde \u00b7 pay\u00e9s jusqu\u2019\u00e0 ' : 'Coupure \u00e0 ') + fmt(res.cut)) + (T.maj && l === 0 && (CFG.majPts || 2) !== 1 ? ' \u00b7 Majeur : ' + ((CFG.majPts || 2) === 2 ? 'points doubl\u00e9s' : 'points \u00d7' + String(Math.round(CFG.majPts * 100) / 100).replace('.', ',')) : '')) + (res.playoff ? ' \u00b7 prolongation pour la victoire' : '') + '</p>';
  if (mode === 'po' && res.po) h += '<h2>Prolongation</h2><p class="small mute" style="margin:0 0 8px">Repart du trou 1 et suit la carte jusqu’au bris d’égalité.</p>' + poCardHTML(res.po, T.pars, T.index, res.rows[0] && res.rows[0][0]);
  else if (mode === 'st') h += tStatsHTML(res, T);
  else if (mode === 'res') {
    if (l < 4) h += storyHTML(T, s, t, l, {});
    h += '<h2>R\u00e9sultats</h2><div class="resrow"><div class="resmain">' + resultsBoard(res.rows, { all: true, l, pay: res.pay, at: [s, t], cut: res.cut, one: res.one, title: lgNm(l) + ' \u00b7 R\u00e9sultats finaux', course: T.name }) + '</div>' + (l === 4 ? '' : ficheHTML(res)) + '</div>';
  } else if (!res.h || !T.pars) {
    h += '<p class="mute">Les cartes de scores ne sont pas conserv\u00e9es pour ce tournoi (jou\u00e9 avant cette mise \u00e0 jour, ou plus ancien que trois saisons).</p>';
  } else {
    const rd = mode === 'c1' ? 0 : 1, cnt = {}; res.rows.forEach(r => { cnt[r[1]] = (cnt[r[1]] || 0) + 1; });
    let list = res.rows.filter(r => rd === 0 || r[3] !== null).map(r => ({ id: r[0], pos: r[1] === 0 ? 'CUT' : (cnt[r[1]] > 1 ? 'T' : '') + r[1], tot: rd === 0 ? r[2] : r[2] + r[3], me: r[0] === 0, holes: res.h[r[0]] ? (decHoles(res.h[r[0]], rd * 18) || []) : [], r1: rd === 1 ? r[2] : null }));
    h += cardsHTML(cardFocus(list), T.pars, { showR1: rd === 1, index: T.index, at: [s, t] });
  }
  h += NAV.length ? '<button class="btn sec" data-a="backview" style="margin-top:14px">Retour</button>' : VIEW.from === 'journal' ? '<button class="btn sec" data-a="journal" style="margin-top:14px">Retour au journal</button>' : '<button class="btn sec" data-a="leagues" style="margin-top:14px">Retour aux ligues</button>';
  return h;
}



/* ---- Page de tournoi, style gestionnaire (v197) : mêmes contenus (récit, résultats, fiche, cartes) ---- */
function tournMgr(s, t, l, T, res, mode) {
  const W = res.rows[0], wt = W ? W[2] + (W[3] || 0) : null;
  const meta = [['Saison', yr(s)], T.fin ? ['Finale', 'Top ' + FIN.n + ' L1'] : ['Tournoi', (t + 1) + '/' + N_TOURN], ['Par', T.par]];
  if (T.dist) meta.push(['Verges', fmtDist(T.dist)]);
  if (T.cr != null) meta.push(['CR / slope', fmtCR(T.cr) + ' / ' + (T.slope || '–')]);
  if (T.purse && l < 4) meta.push(['Bourse ' + 'L' + (l + 1), fmtMoney(Math.round(T.purse * (T.fin ? 1 : LEAGUE_PURSE_PCT[l]) * (l === 0 && T.pm ? T.pm : 1)))]);
  meta.push(T.fin || l === 4 ? ['Coupure', 'Aucune'] : [res.one ? 'Ligne de paye' : 'Coupure', fmt(res.cut)]);
  const cond = [];
  if (T.pin || T.wind) cond.push('R1 · ' + (T.pin ? 'Drapeau ' + PIN_LABELS[T.pin].toLowerCase() : '') + (T.wind ? ' · ' + WIND_LABELS[T.wind] : ''));
  if (!res.one && (T.pin2 || T.wind2)) cond.push('R2 · ' + (T.pin2 ? 'Drapeau ' + PIN_LABELS[T.pin2].toLowerCase() : '') + (T.wind2 ? ' · ' + WIND_LABELS[T.wind2] : ''));
  let x = '<div class="thero"><div class="dart">' + DART + '</div><div class="thin"><div class="thtop"><div style="min-width:0"><small>' + (T.fin ? 'FINALE · TOP ' + FIN.n + ' DE LA LIGUE 1' : lgNm(l).toUpperCase() + (T.maj && l === 0 ? ' · MAJEUR · ' + esc(T.maj).toUpperCase() : '')) + (T.tee ? ' · ' + teeBadge(T.tee) : '') + '</small><h1>' + esc(T.name) + '</h1>' +
    (cond.length ? '<div class="thcond">' + cond.map(c => '<span>' + c + '</span>').join('') + (res.playoff ? '<span class="po">Prolongation</span>' : '') + '</div>' : (res.playoff ? '<div class="thcond"><span class="po">Prolongation</span></div>' : '')) + '</div>' +
    (W ? '<div class="thwin">' + flagOf(W[0], 34) + '<div><small>VAINQUEUR</small><a href="#" data-a="golfer" data-id="' + W[0] + '">' + esc(nameOf(W[0])) + '</a><span>' + fmt(wt) + (res.pay && res.pay[W[0]] ? ' · ' + fmtMoney(res.pay[W[0]]) : '') + '</span></div><div class="cup">' + ico('trophy') + '</div></div>' : '') + '</div>' +
    '<div class="thmeta">' + meta.map(m => '<div><span>' + m[0] + '</span><b>' + m[1] + '</b></div>').join('') + '</div></div></div>';
  x += '<div class="lgbar"><div class="lgtabs">' + LEAGUE_SHORT.map((n, i) => T.fin && i ? '' : '<button class="lgt' + (i === l ? ' on' : '') + '" data-a="tournleague" data-v="' + i + '"><i style="background:var(--lg' + (i + 1) + ')"></i>L' + (i + 1) + ' · ' + n + '</button>').join('') + (T.rc && !T.fin ? '<button class="lgt' + (l === 4 ? ' on' : '') + '" data-a="tournleague" data-v="4"><i style="background:var(--me)"></i>Recrues</button>' : '') + '</div>' +
    '<div class="lgtabs">' + (res.one ? [['res', 'Résultats'], ['c1', 'Cartes de scores']] : [['res', 'Résultats'], ['c1', 'Cartes ronde 1'], ['c2', 'Cartes ronde 2']]).concat(res.po ? [['po', 'Prolongation']] : []).concat(res.sx ? [['st', 'Stats']] : []).map(m => '<button class="lgt' + (m[0] === mode ? ' on' : '') + '" data-a="tmode" data-v="' + m[0] + '">' + m[1] + '</button>').join('') + '</div></div>';
  if (mode === 'po' && res.po) x += dPanel('Prolongation \u00b7 ' + lgNm(l), '<div style="padding:10px 14px"><p class="small mute" style="margin:0 0 8px">Repart du trou 1 et suit la carte jusqu’au bris d’égalité.</p>' + poCardHTML(res.po, T.pars, T.index, res.rows[0] && res.rows[0][0]) + '</div>', '', 'tg-po');
  else if (mode === 'st') x += dPanel('Statistiques de jeu \u00b7 ' + lgNm(l), '<div style="padding:10px 14px">' + tStatsHTML(res, T) + '</div>', '', 'tg-st');
  else if (mode === 'res') {
    x += '<div class="tgrid">' + dPanel('Résultats finaux · ' + lgNm(l), resultsBoard(res.rows, { all: true, l, pay: res.pay, at: [s, t], cut: res.cut, one: res.one, title: lgNm(l) + ' · Résultats finaux', course: T.name }), '', 'tg-res') + '<div class="tg-side">' + (l === 4 ? '' : ficheHTML(res)) + '</div></div>';
    if (l < 4) x += dPanel('Le récit du tournoi', '<div class="tstory">' + storyHTML(T, s, t, l, {}) + '</div>', '<a href="#" data-a="journal">Journal des résumés</a>', 'tg-story');
  } else if (!res.h || !T.pars) {
    x += dPanel('Cartes de scores', '<p class="mute" style="padding:12px 14px;margin:0">Les cartes de scores ne sont pas conservées pour ce tournoi (joué avant cette mise à jour, ou plus ancien que trois saisons).</p>');
  } else {
    const rd = mode === 'c1' ? 0 : 1, cnt = {}; res.rows.forEach(r => { cnt[r[1]] = (cnt[r[1]] || 0) + 1; });
    const list = res.rows.filter(r => rd === 0 || r[3] !== null).map(r => ({ id: r[0], pos: r[1] === 0 ? 'CUT' : (cnt[r[1]] > 1 ? 'T' : '') + r[1], tot: rd === 0 ? r[2] : r[2] + r[3], me: r[0] === 0, holes: res.h[r[0]] ? (decHoles(res.h[r[0]], rd * 18) || []) : [], r1: rd === 1 ? r[2] : null }));
    x += dPanel('Cartes de scores · ' + (res.one ? 'ronde unique' : 'ronde ' + (rd + 1)), cardsHTML(cardFocus(list), T.pars, { showR1: rd === 1, index: T.index, at: [s, t] }), '', 'tg-cards');
  }
  return x;
}



