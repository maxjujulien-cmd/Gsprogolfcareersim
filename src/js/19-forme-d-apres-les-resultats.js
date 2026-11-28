/* ============ v334 : forme d'après les résultats ============
   Pour chaque ronde : coups joués de mieux que la moyenne du champ (sa ligue, ce jour-là). On compare ses 4 derniers
   tournois à sa moyenne sur les 20 d'avant. La forme cachée du moteur n'est jamais montrée : seulement ce que les résultats disent. */
const RF = { recent: 4, base: 20, minBase: 8, hot: 3.0, fire: 4.5, cold: 4.0, fall: 5.5 };
let RF_MEMO = null;
function rfAll() {
  const SH = seasonHist(), k = S.season + '|' + S.hist.length + '|' + (SH ? SH.t.filter(Boolean).length + '|' + (SH.fin ? 1 : 0) : '-');
  if (RF_MEMO && RF_MEMO.S === S && RF_MEMO.k === k) return RF_MEMO.m;
  const need = RF.recent + RF.base, list = [];   // les tournois les plus récents d'abord
  for (let hi = S.hist.length - 1; hi >= 0 && list.length < need + 2; hi--) {
    const H = S.hist[hi]; if (!H) continue;
    if (H.fin && H.fin.lg && H.fin.lg[0]) list.push({ lg: [H.fin.lg[0]] });
    for (let ti = H.t.length - 1; ti >= 0; ti--) { const t = H.t[ti]; if (t && t.lg) list.push({ lg: t.lg, s: H.s, t: ti }); }
  }
  const per = {};   // id -> [{sg, n, pos}] du plus récent au plus ancien
  list.forEach(T => T.lg.forEach(L => {
    const R = L && L.rows; if (!R || R.length < 10) return;
    let a1 = 0, n1 = 0, a2 = 0, n2 = 0; R.forEach(r => { if (r[2] != null) { a1 += r[2]; n1++; } if (r[3] != null) { a2 += r[3]; n2++; } });
    const m1 = n1 ? a1 / n1 : 0, m2 = n2 ? a2 / n2 : 0;
    R.forEach(r => { const a = per[r[0]] || (per[r[0]] = []); if (a.length >= need) return; let sg = 0, n = 0; if (r[2] != null) { sg += m1 - r[2]; n++; } if (r[3] != null) { sg += m2 - r[3]; n++; } if (n) a.push({ sg, n, pos: r[1] }); });
  }));
  const m = {};
  Object.keys(per).forEach(id => {
    const a = per[id]; if (a.length < RF.recent + RF.minBase) return;
    const rc = a.slice(0, RF.recent), bs = a.slice(RF.recent), av = x => x.reduce((s, y) => s + y.sg, 0) / Math.max(1, x.reduce((s, y) => s + y.n, 0));
    const d = av(rc) - av(bs), t10 = rc.filter(x => x.pos > 0 && x.pos <= 10).length, w = rc.filter(x => x.pos === 1).length, mc = rc.filter(x => x.pos === 0).length;
    let lv = d >= RF.fire ? 2 : d >= RF.hot ? 1 : d <= -RF.fall ? -2 : d <= -RF.cold ? -1 : 0;
    if (lv > 0 && !t10 && mc) lv = 0;   // en forme : il faut que ça paraisse (un top 10, ou aucune coupure ratée)
    if (lv < 0 && !mc) lv = 0;          // en méforme : au moins une coupure ratée
    m[id] = { d, lv, t10, w, mc };
  });
  RF_MEMO = { S, k, m }; return m;
}
const rForm = id => rfAll()[id] || null;
function rfNews(news) {   // après un tournoi : qui entre en forme (ou en méforme) d'après ses résultats ; S.rfl garde les niveaux affichés
  const m = rfAll(), old = S.rfl || {}, nw = {}, out = [];
  Object.keys(m).forEach(id => { const f = m[id]; if (f.lv) nw[id] = f.lv; });
  if (news) Object.keys(nw).forEach(k => {
    const id = +k, lv = nw[k], o = old[k] || 0, l = leagueOf(id); if (l < 0 || id === 0) return;
    if (!(lv > 0 ? lv > Math.max(0, o) : lv < Math.min(0, o))) return;   // seulement une entrée (ou un cran de plus)
    const rk = seasonRank(l, id), big = Math.abs(lv) === 2; if (rk > (big ? 40 : 25)) return;
    const who = nameOf(id) + ' (' + ord(rk) + ' en ' + LEAGUE_SHORT[l] + ')', g = S.G[id];
    out.push({ pri: Math.abs(lv) * 100 - rk, l, ids: [id], t: lv < 0 ? who + ' traverse une mauvaise s\u00e9quence.' : lv === 2 ? who + (g && g.phR ? ' entre dans une p\u00e9riode de domination : le ph\u00e9nom\u00e8ne est intouchable en ce moment.' : ' joue dans une forme irr\u00e9elle en ce moment.') : who + ' est dans une passe chaude.' });
  });
  S.rfl = nw;
  out.sort((a, b) => b.pri - a.pri).slice(0, 2).reverse().forEach(n => S.news.unshift({ s: S.season, t: S.t + 1, text: n.t, l: n.l, ids: n.ids }));
}
const RF_LBL = { 2: 'En feu', 1: 'En forme', '-1': 'En méforme', '-2': 'En chute libre' };
function rfWhy(f) {   // la raison, tirée des 4 derniers tournois
  const p = [];
  if (f.lv > 0) { if (f.w) p.push(f.w + ' victoire' + (f.w > 1 ? 's' : '')); if (f.t10 - f.w > 0) p.push(f.t10 + ' top 10'); if (!f.t10) p.push((RF.recent - f.mc) + ' coupures r\u00e9ussies'); }
  else p.push(f.mc + ' coupure' + (f.mc > 1 ? 's' : '') + ' ratée' + (f.mc > 1 ? 's' : ''));
  return '<span>' + p.join(' · ') + ' à ses ' + RF.recent + ' derniers tournois</span> · <span>' + (f.d > 0 ? '+' : '−') + (Math.round(Math.abs(f.d) * 10) / 10).toString().replace('.', LANG === 'en' ? '.' : ',') + (Math.abs(f.d) >= 2 ? ' coups' : ' coup') + ' par ronde sur sa moyenne</span>';
}
function fmark(id) {
  if (!CFG.showForm) return ''; const f = rForm(id); if (!f || !f.lv) return '';   // v334 : d'après les résultats seulement
  const t = RF_LBL[f.lv];
  return f.lv > 0 ? ' <span class="fm hot" role="img" aria-label="' + t + '" title="' + t + '">\u25B2</span>' : ' <span class="fm cold" role="img" aria-label="' + t + '" title="' + t + '">\u25BC</span>';
}
function nmCell(r, extra, at, tagCls) { return '<td class="nm"><span class="nmr">' + (r.pinned === true ? '<span class="pinbadge" title="Ta ligne, \u00e9pingl\u00e9e en haut">\ud83d\udccc</span>' : '') + '<a class="nmt" data-a="golfer" data-id="' + r.id + '" style="color:inherit;text-decoration:none">' + esc(nameOf(r.id)) + '</a>' + ageTag(r.id) + hxTag(r.id, at, tagCls) + fmark(r.id) + (r.mwb || '') + (r.tw ? twBtn(r.id) : '') + '</span>' + (extra || '') + '</td>'; }
/* v255 : rang mondial (top 100) en médaillon sur le coin du drapeau ; at = [saison, tournoi] → rang publié juste avant ce tournoi */
const WRM = new Map();
function wrMapAt(at) {
  const k = at[0] + '-' + at[1]; if (WRM.has(k)) return WRM.get(k);
  let m = null;
  outer: for (let s = at[0]; s >= 1; s--) { const H = S.hist[s - 1]; if (!H) continue; for (let t = s === at[0] ? at[1] - 1 : N_TOURN; t >= 0; t--) { const T = tGet(H, t); if (T && T.wr) { m = {}; T.wr.forEach((id, i) => { m[id] = i + 1; }); break outer; } } }
  WRM.set(k, m); return m;
}
function wrRankOf(id, at) { try { if (at) { const m = wrMapAt(at); return m ? m[id] || null : null; } return wrPub(id); } catch (e) { return null; } }
function wrMed(id, at) { const r = wrRankOf(id, at); if (!r) return ''; return '<i class="wrm ' + (r <= 10 ? 'g' : r <= 50 ? 's' : 'b') + '" title="World Ranking #' + r + '" aria-label="World Ranking ' + r + '">' + r + '</i>'; }
const flagOf = (id, w, at) => { const f = flagVisual(natOf(id), w || 22), m = f ? wrMed(id, at) : ''; return m ? '<span class="wrf">' + f + m + '</span>' : f; };
const flagCell = (id, at) => '<td class="fl" title="' + esc(natOf(id)) + '">' + flagOf(id, null, at) + '</td>';
function totCell(v) { return '<td class="tot ' + cls(v) + '">' + fmt(v) + '</td>'; }

/* colonne « Trou » : où en est chacun (v217 : son propre trou, F s'il a terminé, son heure s'il n'est pas parti) */
function thruCell(r, k) { if (r.n == null) return k === 18 ? 'F' : k; return r.n >= 18 ? 'F' : r.n === 0 ? '<span class="ttime">' + teeTime(r.g) + '</span>' : r.n; }
function liveBoard(list, k, mwl, dmap, r1of) {
  const gain = r => { const a = dmap.amt(r); return '<td class="dgain' + (!a ? ' z' : a < dmap.m[1] * 0.25 ? ' lo' : '') + '">' + (a ? fmtCash(a) : '0\u00a0$') + '</td>'; };
  /* v363 : colonnes R1 et R2 (ronde 2 = total − R1 ; « – » tant qu'elle n'est pas commencée) */
  const rds = !S.one && r1of !== undefined, rdc = v => v == null || !isFinite(v) ? '<td class="rdx mute">–</td>' : '<td class="rdx ' + cls(v) + '">' + fmt(v) + '</td>';
  const rdCells = r => { if (!rds) return ''; if (!r1of) return rdc(r.n === 0 ? null : r.tot) + rdc(null); const a = r1of(r.id); return rdc(a) + rdc(a == null || r.n === 0 ? null : r.tot - a); };
  return '<div class="boardwrap scroll"><table class="board"><tr><th>Pos</th><th class="fl"></th><th>Joueur</th>' + (dmap ? '<th class="r">Gain</th>' : '') + (rds ? '<th class="r">R1</th><th class="r">R2</th>' : '') + '<th class="r">Total</th><th class="r">Trou</th></tr>' +
    boardRows(list, { cols: (dmap ? 6 : 5) + (rds ? 2 : 0), cells: r => '<td class="pos">' + posLbl(r) + '</td>' + flagCell(r.id) + nmCell(Object.assign({ tw: !!S.cur && (mwl == null || mwl === S.cur.pl) }, mwl != null ? { mwb: exBadge(r.id, mwl) + mvBadge(r.id, mwl) + (r.id === 0 && DUO_LIVE && !dmap ? DUO_LIVE : '') } : {}, r)) + (dmap ? gain(r) : '') + rdCells(r) + totCell(r.tot) + '<td class="th">' + thruCell(r, k) + '</td>' }) + '</table></div>';
}
function resultsBoard(rows, opts) { // rows: [id,pos,r1,r2,pts] — tableau « télé »
  // v240 : chaque score de ronde mène à la carte de scores correspondante (golfeur épinglé en haut)
  const rdLnk = (id, m, txt) => opts && opts.at && opts.l != null && !(opts.one && m === 'c2') ? '<a href="#" class="rlk" data-a="tourn" data-s="' + opts.at[0] + '" data-t="' + opts.at[1] + '" data-l="' + opts.l + '" data-m="' + m + '" data-fid="' + id + '" title="Voir la carte de scores">' + txt + '</a>' : txt;
  opts = opts || {};
  const pay = opts.pay || {}, cnt = {};
  rows.forEach(r => { cnt[r[1]] = (cnt[r[1]] || 0) + 1; });
  const r1rk = {}; rankTies(rows.map(r => ({ id: r[0], tot: r[2] }))).forEach(x => { r1rk[x.id] = x; });
  const r2s = rows.filter(r => r[3] !== null).map(r => r[3]), best1 = Math.min.apply(null, rows.map(r => r[2]).filter(isFinite)), best2 = r2s.length ? Math.min.apply(null, r2s) : null;
  const list = rows.map(r => ({ id: r[0], pos: r[1], r1: r[2], r2: r[3], pts: r[4], pay: pay[r[0]] || 0, tie: r[1] > 0 && cnt[r[1]] > 1, r1r: r1rk[r[0]], mv: r[1] > 0 ? r1rk[r[0]].pos - r[1] : null }));
  const shown = opts.all ? list : pickRows(list, opts.top || 10, 2);
  const mvHTML = m => m === null ? '' : m > 0 ? '<span class="up">▲' + m + '</span>' : m < 0 ? '<span class="dn">▼' + (-m) + '</span>' : '<span class="eq">=</span>';
  let h = '<div class="tvb">' + (opts.title ? '<div class="tvh"><span>' + esc(opts.title) + '</span><b>' + esc(opts.course || '') + '</b></div>' : '') +
    '<div class="scroll"><table><thead><tr><th>Pos</th><th>Mouv.</th><th></th><th class="l">Joueur</th><th>R1</th><th>R2</th><th>Tot</th><th>Pts</th><th class="g">Gains</th></tr></thead><tbody>';
  let cutDone = false;
  shown.forEach(r => {
    if (r.gap) { h += '<tr class="gap"><td colspan="9">···</td></tr>'; return; }
    const np = !!(opts.one && opts.cut != null && r.r1 > opts.cut);   // tournoi d'une ronde : hors de la ligne de paye
    if ((r.pos === 0 || np) && !cutDone) { cutDone = true; h += '<tr class="cutl"><td colspan="9">' + (opts.one ? 'Ligne de paye (top ' + S.settings.cut + ')' : 'Coupure') + (opts.cut != null ? ' à ' + fmt(opts.cut) : '') + '</td></tr>'; }
    const mc = r.pos === 0 || np, cl = [r.id === 0 ? 'me' : '', mc ? 'mc' : '', r.pos >= 1 && r.pos <= 3 ? 'm' + r.pos : ''].filter(Boolean).join(' ');
    h += '<tr' + (cl ? ' class="' + cl + '"' : '') + '><td class="p">' + (r.pos === 0 ? 'CUT' : (r.tie ? 'T' : '') + r.pos) + '</td><td class="mv">' + mvHTML(r.mv) + '</td>' + flagCell(r.id, opts.at) +
      '<td class="n"><span class="nmr"><a class="nmt" data-a="golfer" data-id="' + r.id + '">' + esc(nameOf(r.id)) + '</a>' + ageTag(r.id) + hxTag(r.id, opts.at) + fmark(r.id) + '</span></td>' +
      '<td class="rd' + (r.r1 === best1 ? ' best' : '') + '">' + rdLnk(r.id, 'c1', fmt(r.r1)) + '<small>' + posLbl(r.r1r) + '</small></td>' +
      '<td class="rd' + (r.r2 !== null && r.r2 === best2 ? ' best' : '') + '">' + (r.r2 === null ? '—' : rdLnk(r.id, 'c2', fmt(r.r2))) + '</td>' +
      '<td class="t">' + fmt(r.r1 + (r.r2 || 0)) + (r.pay ? '<small class="gm">' + fmtMoney(r.pay) + '</small>' : '') + '</td><td class="pt">' + (r.pts || '—') + '</td><td class="g">' + (r.pay ? fmtMoney(r.pay) : '—') + '</td></tr>';
  });
  return h + '</tbody></table></div><div class="tvl"><span><b class="best">\u22123</b> meilleur score de la ronde</span><span><b class="up">▲</b><b class="dn">▼</b> places gagnées ou perdues depuis la ronde 1</span><span>sous R1 : rang après la ronde 1</span></div></div>';
}
/* Zones de promotion (MOVE premiers) et de relégation : les golfeurs arrivés en cours de saison sont classés mais
   exemptés de la relégation ; la zone rouge vise donc les derniers golfeurs non protégés. */
const lgUpTxt = l => CFG.varLg ? 'Promotion (top ' + vlCand(l) + (CFG.gpCount ? ', promus en cours de saison compris' : '') + ')' : 'Promotion (' + MOVE + ' premiers)';
const lgDnTxt = l => CFG.varLg ? 'Rel\u00e9gation (' + relBot() + ' derniers)' : 'Rel\u00e9gation (' + MOVE + ' derniers)';
function markZones(list, l, up, dn, H) {
  if (H && H.end && H.end.up && H.end.down) { const U = new Set(H.end.up[l] || []), D = new Set(H.end.down[l] || []); list.forEach(r => { r.zone = U.has(r.id) ? up : D.has(r.id) ? dn : ''; }); return; }   // saison terminée : les vrais mouvements
  if (CFG.varLg && !H) { const P = planNow(), U = new Set(P.up[l] || []), D = new Set(P.down[l] || []); list.forEach(r => { r.zone = r.gh ? '' : U.has(r.id) ? up : D.has(r.id) ? dn : ''; }); return; }
  let k0 = 0; list.forEach(r => { r.zone = (l > 0 && !r.gh && ++k0 <= MOVE) ? up : ''; });
  if (l < 3) { let k = Math.max(0, list.filter(r => !r.gh).length - (FIELD - MOVE)); for (let i = list.length - 1; i >= 0 && k > 0; i--) { if (list[i].mv || list[i].gh || exInfo(list[i].id, l)) continue; if (!list[i].zone) list[i].zone = dn; k--; } }
}
function standingsBoard(l, opts) {
  opts = opts || {};
  let list;
  if (opts.tableRows) list = opts.tableRows.map((r, i) => ({ id: r[0], pts: r[1], w: r[2], idx: i + 1, mv: !!r[4], gh: !!r[5] }));
  else list = displayRank(l);
  markZones(list, l, 'up', 'dn', opts.tableRows && opts.at ? S.hist[opts.at[0] - 1] || null : null);
  const shown = opts.all ? list : pickRows(list, opts.top || 3, opts.around || 2);
  return '<div class="boardwrap scroll"><table class="board"><tr><th>Rang</th><th class="fl"></th><th>Joueur</th><th class="r">Pts</th><th class="r">V</th></tr>' +
    boardRows(shown, { cols: 5, cells: r => '<td class="pos">' + (r.idx === null ? '\u2013' : r.idx) + '</td>' + flagCell(r.id, opts.at) + nmCell(Object.assign({ mwb: opts.tableRows ? '' : exBadge(r.id, l) + mvBadge(r.id, l) }, r), r.gh ? '<span class="sub">promu en cours de saison' + (mvShort(r.id, S.season, l, 'gh') ? ' : ' + esc(mvShort(r.id, S.season, l, 'gh')) : '') + '</span>' : r.mv ? '<span class="sub">' + (mvShort(r.id, S.season, l, 'mv') ? 'arriv\u00e9 en cours de saison (' + esc(mvShort(r.id, S.season, l, 'mv')) + ') \u00b7 prot\u00e9g\u00e9' : 'arriv\u00e9 en cours de saison \u00b7 prot\u00e9g\u00e9') + '</span>' : '', opts.at) + '<td class="tot">' + r.pts + '</td><td class="th">' + (r.w || '') + '</td>' }) + '</table></div>' +
    (l > 0 || l < 3 ? '<div class="legend">' + (l > 0 ? '<span><i style="background:#5CC796"></i>' + lgUpTxt(l) + '</span>' : '') + (l < 3 ? '<span><i style="background:var(--underB)"></i>' + lgDnTxt(l) + '</span><span>arriv\u00e9s en cours de saison : prot\u00e9g\u00e9s</span>' + (CFG.exWin || CFG.exChamp || CFG.exCar ? '<span>\ud83d\udee1 exempt\u00e9 : jamais rel\u00e9gu\u00e9</span>' : '') : '') + (CFG.showForm ? '<span>\u25B2 en forme \u00b7 \u25BC en m\u00e9forme</span>' : '') + (CFG.showIdx ? '<span>Pastille : handicap</span>' : '') + '</div>' : '');
}
const chipRow = (items, cur, act) => '<div class="chips">' + items.map(([v, label]) => '<button class="chip" data-a="' + act + '" data-v="' + v + '" aria-pressed="' + (v == cur) + '">' + esc(label) + '</button>').join('') + '</div>';


/* ---- Cartes de scores (trou par trou, comme la feuille de calcul) ---- */
function holeCell(v, par) {
  if (v == null) return '<td class="h"></td>';
  const r = v - par, c = r <= -2 ? 'e2' : r === -1 ? 'e1' : r === 0 ? '' : r === 1 ? 'b1' : r === 2 ? 'b2' : 'b3';
  return '<td class="h ' + c + '">' + v + '</td>';
}
/* rows : [{id, pos:'T12', tot:number|null, holes:[...revealed], me, r1?}] ; gap = {gap:true} */
/* v238 : golfeur arriv\u00e9 depuis sa fiche (VIEW.fid) : sa ligne est surlign\u00e9e et \u00e9pingl\u00e9e en haut des cartes */
function cardFocus(list) {
  const f = VIEW.fid; if (f == null || f === 0) return list;
  const i = list.findIndex(r => r.id === f); if (i < 0) return list;
  const out = list.slice(); out[i] = Object.assign({}, out[i], { me: true });
  return [Object.assign({}, out[i], { pinned: true })].concat(out);
}
function cardsHTML(rows, pars, opts) {
  opts = opts || {}; const nextHole = opts.next == null ? -1 : opts.next;
  const G = opts.gain || null, gTop = G ? Math.max.apply(null, Object.values(G).concat([0])) : 0, gh = G ? '<th class="sg"></th>' : '';
  const gCell = r => { const a = G[r.id] || 0; return '<td class="sg' + (!a ? ' z' : a < gTop * 0.25 ? ' lo' : '') + '">' + (a ? fmtCash(a) : '0\u00a0$') + '</td>'; };
  const mob = !isPC(), ck = mob ? CARDX.push({ pars, next: nextHole, r1: !!opts.showR1, mwl: opts.mwl, tw: !!opts.tw, rows: [], cols: 0 }) - 1 : -1, opened = new Set();   // téléphone : lignes compactes, carte complète au toucher
  let h = '<div class="cardwrap" role="region" aria-label="Cartes de scores trou par trou" tabindex="0"><table class="cards ' + (opts.showR1 ? 'rs3' : 'rs1') + (G ? ' dg' : '') + (mob ? ' mob' : '') + '"><thead><tr class="hn"><th class="s1">Golfeur</th>' + (G ? '<th class="sg">Gain</th>' : '') + '<th class="s2">Tot</th>' +
    pars.map((p, i) => '<th class="' + (i === nextHole ? 'nx' : '') + '">' + (i + 1) + '</th>').join('') + '<th class="cp">Coups</th>' + (opts.showR1 ? '<th class="cp">R1</th><th class="cp">R2</th>' : '') + '</tr>' +
    '<tr class="hp"><th class="s1">Par</th>' + gh + '<th class="s2"></th>' + pars.map(p => '<th>' + p + '</th>').join('') + '<th class="cp">' + sum(pars) + '</th>' + (opts.showR1 ? '<th class="cp"></th><th class="cp"></th>' : '') + '</tr>' +
    (opts.index ? '<tr class="hi"><th class="s1">Index</th>' + gh + '<th class="s2"></th>' + opts.index.map(v => '<th>' + v + '</th>').join('') + '<th class="cp"></th>' + (opts.showR1 ? '<th class="cp"></th><th class="cp"></th>' : '') + '</tr>' : '');
  /* v437 : sur ordinateur, les lignes épinglées (toi, tes joueurs) ont une place fixe sous l'en-tête, toujours visible quand on fait défiler */
  let nPin = 0; if (!mob) while (nPin < rows.length && rows[nPin].pinned === true) nPin++;
  const pTop = opts.index ? 88 : 59;
  if (!nPin) h += '</thead><tbody>';
  const cols = 2 + pars.length + 1 + (opts.showR1 ? 2 : 0) + (G ? 1 : 0);
  if (mob) CARDX[ck].cols = cols;
  rows.forEach((r, ri) => {
    if (ri && rows[ri - 1].cutAfter) h += cutRowHTML(rows[ri - 1].cutAfter, cols);   // v415 : ligne de coupure
    if (r.gap) { h += gapRowHTML(r, cols); return; }
    const hs = r.holes || [], played = hs.filter(x => x != null);
    const rowCls = [r.me && 'me', r.pending && 'pending', pinCls(r.pinned)].filter(Boolean).join(' ');
    const pcs = r.pn && r.color ? ' style="--me:' + r.color + ';--meSolid:color-mix(in srgb,' + r.color + ' 34%,var(--paper))"' : '';   // Play Now : chaque joueur manuel dans sa couleur
    const cxk = mob ? cxKey(r) : '', cxOpen = mob && !opened.has(cxk) && (CX_OPEN.has(cxk) || (r.me && !CX_SHUT.has(cxk)));
    if (mob) { CARDX[ck].rows[ri] = r; if (cxOpen) opened.add(cxk); }
    const pst = ri < nPin ? ' style="--pt:' + (pTop + ri * 50) + 'px' + (pcs ? ';' + pcs.slice(8, -1) : '') + '"' : pcs;
    h += '<tr' + (rowCls || mob ? ' class="' + rowCls + (ri < nPin ? ' pinfix' + (ri === nPin - 1 ? ' pinlast' : '') : '') + (mob ? ' cxr' + (cxOpen ? ' cxo' : '') : '') + '"' : '') + (mob ? ' data-cx="' + ck + ':' + ri + '"' : '') + pst + '><td class="s1"><span class="pp">' + esc(r.pos) + '</span><span class="flg">' + (r.pn ? (r.nat ? flagVisual(r.nat, 20) : '<span class="pndot" style="background:' + r.color + ';margin:0 4px"></span>') : flagOf(r.id, 20, opts.at)) + '</span>' + (r.pinned === true ? '<span class="pinbadge" title="Ta ligne, \u00e9pingl\u00e9e en haut">\ud83d\udccc</span>' : '') + '<span class="nmstk"><span class="nmln">' + (r.pn ? '<span class="nmt" data-pk="' + esc(r.pk || r.name) + '">' + esc(r.name) + '</span>' + (r.mvh || '') : (mob ? '<a class="nmt" data-a="golfer" data-id="' + r.id + '" title="' + esc(nameOf(r.id)) + '" style="color:inherit;text-decoration:none">' + esc(r.id === 0 ? nameOf(0) : shortNm(nameOf(r.id))) + '</a>' : '<a class="nmt" data-a="golfer" data-id="' + r.id + '" style="color:inherit;text-decoration:none">' + esc(nameOf(r.id)) + '</a>') + fmark(r.id) + (opts.tw && !r.pn ? (mob ? (twOn(r.id) ? '<span class="twm" aria-label="Dans ta watchlist du tournoi">\u2605</span>' : '') : twBtn(r.id)) : '') + (opts.mwl != null && !mob ? exBadge(r.id, opts.mwl) + mvBadge(r.id, opts.mwl) : '') + (r.me && DUO_LIVE && !G ? DUO_LIVE : '')) + '</span>' + (r.pn ? '' : mob || !ageTag(r.id) ? hxTag(r.id, opts.at, 'hsub') : '<span class="nmsub">' + hxTag(r.id, opts.at, 'hsub') + ageTag(r.id) + '</span>') + '</span>' + (mob ? '<button class="cxbtn" type="button" aria-label="Voir la carte de la ronde"></button>' : '') + '</td>' + (G ? gCell(r) : '') +
      '<td class="s2 ' + (r.tot === null || r.tot === undefined ? '' : cls(r.tot)) + '">' + (r.tot === null || r.tot === undefined ? '' : fmt(r.tot)) + '</td>' +
      pars.map((p, i) => holeCell(hs[i], p)).join('') + '<td class="cp">' + (played.length ? sum(played) : '') + '</td>' + (opts.showR1 ? '<td class="cp ' + (r.r1 == null ? '' : cls(r.r1)) + '">' + (r.r1 == null ? '' : fmt(r.r1)) + '</td>' + (() => { let r2 = null; hs.forEach((v, i) => { if (v != null) r2 = (r2 || 0) + v - pars[i]; }); return '<td class="cp ' + (r2 === null ? '' : cls(r2)) + '" style="font-weight:700">' + (r2 === null ? '' : fmt(r2)) + '</td>'; })() : '') + '</tr>' + (cxOpen ? cxRow(CARDX[ck], r) : '');
    if (nPin && ri === nPin - 1) h += '</thead><tbody>';
  });
  if (rows.length && rows[rows.length - 1].cutAfter) h += cutRowHTML(rows[rows.length - 1].cutAfter, cols);
  return h + '</tbody></table></div>' +
    '<div class="legend cl"><span><i class="lg e2"></i>Aigle ou mieux</span><span><i class="lg e1"></i>Birdie</span><span><i class="lg pr"></i>Par</span><span><i class="lg b1"></i>Bogey</span><span><i class="lg b2"></i>Double</span><span><i class="lg b3"></i>Triple ou pire</span></div>';
}
/* ---- Téléphone : carte complète d'un golfeur, dépliée sous sa ligne quand on la touche (aller et retour sur 2 rangées).
   Ta carte est ouverte d'office ; ce qu'on ouvre ou ferme est gardé d'un écran à l'autre. ---- */
let CARDX = [];
const shortNm = n => { const w = String(n || '').trim().split(/\s+/); return w.length > 1 && w[0].length > 2 ? w[0][0] + '. ' + w.slice(1).join(' ') : String(n || ''); };   // Vincent Prins -> V. Prins
const CX_OPEN = new Set(), CX_SHUT = new Set();
const cxKey = r => r.pn ? 'pn:' + (r.name || r.id) : String(r.id);
function cxRow(ctx, r) {
  const hs = r.holes || [], P = ctx.pars, played = hs.filter(x => x != null);
  const half = (a, b, lab, tl) => { const ps = P.slice(a, b), got = hs.slice(a, b).filter(x => x != null);
    return '<table><tr><th class="lab">' + lab + '</th>' + ps.map((p, i) => '<th' + (a + i === ctx.next ? ' class="nx"' : '') + '>' + (a + i + 1) + '</th>').join('') + '<th class="sub">' + tl + '</th></tr>' +
      '<tr><td class="lab">Par</td>' + ps.map(p => '<td class="cxp">' + p + '</td>').join('') + '<td class="sub cxp">' + sum(ps) + '</td></tr>' +
      '<tr><td class="lab">Score</td>' + ps.map((p, i) => holeCell(hs[a + i], p)).join('') + '<td class="sub">' + (got.length ? sum(got) : '') + '</td></tr></table>'; };
  let r2 = null; hs.forEach((v, i) => { if (v != null) r2 = (r2 || 0) + v - P[i]; });
  const info = [];
  if (ctx.r1 && r.r1 != null) info.push('R1 <b class="' + cls(r.r1) + '">' + fmt(r.r1) + '</b>', 'R2 <b class="' + (r2 === null ? '' : cls(r2)) + '">' + (r2 === null ? '\u2013' : fmt(r2)) + '</b>');
  if (played.length) info.push(played.length + (played.length > 1 ? ' trous · ' : ' trou · ') + sum(played) + ' coups');
  const mw = !r.pn && ctx.mwl != null ? exBadge(r.id, ctx.mwl) + mvBadge(r.id, ctx.mwl) : '';
  return '<tr class="cx"><td colspan="' + ctx.cols + '"><div class="cxin">' + half(0, 9, 'Aller', 'All') + half(9, 18, 'Retour', 'Ret') +
    '<div class="cxf"><span>' + info.join(' · ') + (mw ? ' ' + mw : '') + '</span>' + (ctx.tw && !r.pn && twCan(r.id) ? '<button class="twb' + (twOn(r.id) ? ' on' : '') + '" data-a="twl" data-id="' + r.id + '" aria-pressed="' + twOn(r.id) + '">' + (twOn(r.id) ? '\u2605' : '\u2606') + ' <span>Watchlist du tournoi</span></button>' : '') + (r.pn ? '' : '<a href="#" data-a="golfer" data-id="' + r.id + '">Fiche \u203a</a>') + '</div></div></td></tr>';
}
function cxToggle(tr) {
  const [ck, ri] = tr.dataset.cx.split(':').map(Number), ctx = CARDX[ck], r = ctx && ctx.rows[ri]; if (!r) return;
  const k = cxKey(r), nx = tr.nextElementSibling;
  if (nx && nx.classList.contains('cx')) { nx.remove(); tr.classList.remove('cxo'); CX_OPEN.delete(k); CX_SHUT.add(k); }
  else { tr.insertAdjacentHTML('afterend', cxRow(ctx, r)); tr.classList.add('cxo'); CX_OPEN.add(k); CX_SHUT.delete(k); syncCardWidth(); }
}
document.addEventListener('click', e => {
  const tr = e.target.closest && e.target.closest('table.cards.mob tr.cxr'); if (!tr) return;
  if (!e.target.closest('.cxbtn') && e.target.closest('[data-a],[data-mw],a,button,input,select')) return;   // v239 : le nom m\u00e8ne au profil, la fl\u00e8che (ou le reste de la ligne) d\u00e9plie la carte
  cxToggle(tr);
});

