/* ============ v265 : enjeux en direct ============
   1) « Saison en direct » : le classement de la saison si le tournoi finissait maintenant (positions du moment ;
      en ronde 1, ceux sous la coupure actuelle n'ont pas de points ; Majeur et Finale multiplient les points).
   2) Coupure estimée (ronde 1, ta ligue) : les trous restants sont joués plusieurs centaines de fois par le moteur
      du jeu, sur une copie. La forme du jour de chacun est retirée au hasard (on ne la connaît pas) ; seuls les
      scores déjà dévoilés comptent. On en tire le % de chance de chaque score de coupure, et tes chances de la passer. */
const CMC = { n: 160, min: 1 / 3 };
function projPtsMap(rows, l) {
  const c = S.cur, cutOn = c.r === 0 && !c.fin && !c.rc,   /* v382 : en 1 ronde, la ligne de paye sert de coupure */ cut = cutOn ? cutScoreOf(rows.map(r => r.tot), S.settings.cut) : null;
  const cnt = {}; rows.forEach(r => { cnt[r.tot] = (cnt[r.tot] || 0) + 1; });
  const mult = c.fin ? FIN.pts : (l === 0 && isMajorT(S.t)) ? (CFG.majPts || MAJ.pts) : 1, m = {};
  rows.forEach(r => { if (cut != null && r.tot > cut) { m[r.id] = { p: MC_POINTS, out: 1, pos: r }; return; }
    const n = cnt[r.tot] || 1, base = Math.round(avg(range(r.pos, r.pos + n - 1).map(pointsAt)));
    m[r.id] = { p: Math.round(base * mult), w: r.pos === 1 && n === 1 ? 1 : 0, pos: r }; });
  return m;
}
function projSeason(l, rows) {
  const before = displayRank(l), b4 = {}; before.forEach(r => { b4[r.id] = r.idx; });
  const P = projPtsMap(rows, l);
  const list = rankAll(l).map(r => { const x = P[r.id]; return { id: r.id, gh: r.gh, mv: !r.gh && !!(gmv(r.id) && gmv(r.id).mv), pts0: r.pts, add: x ? x.p : 0, pts: r.pts + (x ? x.p : 0), w: r.w + (x ? x.w || 0 : 0), live: x ? x.pos : null, out: x && x.out, b: b4[r.id] || 999 }; });
  list.sort((a, b) => b.pts - a.pts || b.w - a.w || a.b - b.b);
  list.forEach((r, i) => { r.idx = i + 1; r.d = r.b === 999 ? 0 : r.b - r.idx; });
  return list;
}
function projBoard(l, rows) {
  const list = projSeason(l, rows), pc = isPC(); markZones(list, l, 'up', 'dn', null);
  const mvH = d => d > 0 ? '<span class="up">▲' + d + '</span>' : d < 0 ? '<span class="dn">▼' + (-d) + '</span>' : '<span class="eq">=</span>';
  let h = '<p class="small mute" style="margin:2px 0 6px">Le classement de la saison si le tournoi finissait maintenant. Mouv. : par rapport au classement d’avant le tournoi.</p>';
  h += '<div class="boardwrap scroll pjwrap"><table class="board pjb"><tr><th>Rang</th><th>Mouv.</th>' + (pc ? '<th class="fl"></th>' : '') + '<th>Joueur</th><th class="r">Pts</th><th class="r">Tournoi</th></tr>';
  let upDone = false, dnDone = false; const lastUp = list.reduce((m, r) => r.zone === 'up' ? r.idx : m, 0);
  list.forEach(r => {
    if (!dnDone && r.zone === 'dn') { dnDone = true; h += '<tr class="pjz dn"><td colspan="' + (pc ? 6 : 5) + '">Zone de relégation</td></tr>'; }
    const nm = nameOf(r.id) || '', sp = nm.split(' '), sh = pc || sp.length < 2 ? nm : sp[0].charAt(0) + '. ' + sp.slice(1).join(' ');
    h += '<tr class="' + [r.id === 0 ? 'me' : '', r.zone || '', r.gh ? 'pjgh' : ''].filter(Boolean).join(' ') + '"><td class="pos">' + r.idx + '</td><td class="pjm">' + mvH(r.d) + '</td>' + (pc ? flagCell(r.id) : '') + '<td class="nm pjn"><a class="nmt" data-a="golfer" data-id="' + r.id + '">' + esc(sh) + '</a>' + (pc ? hxTag(r.id) : '') + '</td>' +
      '<td class="r pjp"><b>' + r.pts + '</b>' + (r.add ? ' <small class="up">+' + r.add + '</small>' : '') + '</td><td class="r pjt">' + (r.live ? (r.out ? '<span class="mute">' + (pc ? 'sous la coupure' : 'CUT') + '</span>' : posLbl(r.live)) : '<span class="mute">–</span>') + '</td></tr>';
    if (!upDone && r.idx === lastUp) { upDone = true; h += '<tr class="pjz up"><td colspan="' + (pc ? 6 : 5) + '">▲ Zone de promotion</td></tr>'; }
  });
  return h + '</table></div>';
}
function cutMC(k, rows) {
  const c = S.cur; if (!c || c.r !== 0 || c.fin || c.rc || S.one) return null;
  const tot = rows.length * 18; let done = 0; const info = rows.map(r => { const n = r.n != null ? r.n : r.pending ? k - 1 : k; done += Math.min(18, Math.max(0, n)); return { id: r.id, n: Math.min(18, Math.max(0, n)) }; });
  const prog = done / tot, key = k + ':' + done;
  if (c._cmc && c._cmc.key === key) return c._cmc;
  const out = { key, prog, dist: null, me: null };
  if (prog < CMC.min) { Object.defineProperty(c, '_cmc', { value: out, writable: true, configurable: true, enumerable: false }); return out; }
  const grid = gridFor(c.pars), hv = c.ctx.hv && c.ctx.hv[0], meSim = S.mode === 'sim';
  const par = c.pars, cutSz = S.settings.cut, hc = (hcHolder(0) && hcHolder(0).hc) || null;
  const pIdx = hc && hc.x != null ? hc.x : 10, pMu = (pIdx * (c.slope || 128) / 113 + ((c.cr != null ? c.cr : parTotal(par) - 1) - parTotal(par)) + 1.5) / 18;
  /* v271 : sans handicap fiable pour toi (moins de 5 rondes), on te simule comme le golfeur médian de ton champ */
  const hcOk = hc && hc.x != null && (hc.hi || []).filter(v => v != null).length >= 5;
  const prox = hcOk ? null : (() => { const gs = info.map(o => S.G[o.id]).filter(g => g && g.id !== 0 && c.aiD && c.aiD[g.id] != null); if (!gs.length) return null; gs.sort((a, b) => (a.o || 0) - (b.o || 0)); return gs[Math.floor(gs.length / 2)]; })();
  const G = info.map(o => { const id = o.id, ai = id !== 0 || meSim, hol = (id === 0 && !meSim ? myHoles(c) : c.ai[id] || []).slice(0, o.n); return { id, ai, hol, base: relTo(hol, par, hol.length), g: S.G[id] }; });
  const dist = {}; let me = 0, meIn = G.some(x => x.id === 0);
  for (let it = 0; it < CMC.n; it++) {
    const tots = new Array(G.length); let myT = null;
    for (let i = 0; i < G.length; i++) {
      const x = G[i]; let t = x.base;
      if (x.hol.length < 18) {
        if (x.ai && x.g) { const D = solveDelta(grid, roundTarget(x.g, c.ctx, 0, null)), hh = x.hol.slice(); for (let j = hh.length; j < 18; j++) { const s = liveHole(MODEL, par, c.index, hv, j, x.g, D, hh, null); hh.push(s); t += s - par[j]; } }
        else if (prox) { const D = solveDelta(grid, roundTarget(prox, c.ctx, 0, null)), hh = x.hol.slice(); for (let j = hh.length; j < 18; j++) { const s = liveHole(MODEL, par, c.index, hv, j, prox, D, hh, null); hh.push(s); t += s - par[j]; } }
        else for (let j = x.hol.length; j < 18; j++) t += Math.round(pMu + gauss() * 0.85);
      }
      tots[i] = t; if (x.id === 0) myT = t;
    }
    const cv = cutScoreOf(tots, cutSz); dist[cv] = (dist[cv] || 0) + 1; if (myT != null && myT <= cv) me++;
  }
  Object.keys(dist).forEach(v => { dist[v] /= CMC.n; });
  out.dist = dist; out.me = meIn ? me / CMC.n : null;
  Object.defineProperty(c, '_cmc', { value: out, writable: true, configurable: true, enumerable: false });
  return out;
}
function cutStripHTML(k, rows) {
  const M = cutMC(k, rows); if (!M) return '';
  const cur = cutScoreOf(rows.map(r => r.tot), S.settings.cut);
  if (!M.dist) return '<div class="cutst"><div class="cuth"><b>Coupure actuelle : ' + fmt(cur) + '</b><span class="mute">Estimation dès que le tiers des trous de la ronde sera joué (' + Math.round(M.prog * 100) + ' %)</span></div></div>';
  const vals = Object.keys(M.dist).map(Number).sort((a, b) => a - b), best = vals.reduce((a, v) => M.dist[v] > M.dist[a] ? v : a, vals[0]);
  const shown = vals.filter(v => M.dist[v] >= 0.02), mx = Math.max.apply(null, shown.map(v => M.dist[v]));
  const pc = v => { const x = Math.round(M.dist[v] * 100); return (x < 1 ? '<1' : x) + ' %'; };
  return '<div class="cutst"><div class="cuth"><b>Coupure estimée : ' + fmt(best) + ' <span class="mute">(' + pc(best) + ')</span></b>' + (M.me != null ? '<span class="cutme ' + (M.me >= 0.7 ? 'ok' : M.me >= 0.35 ? 'mid' : 'bad') + '"><span>Tes chances de passer</span> : ' + Math.round(M.me * 100) + ' %</span>' : '') + '</div>' +
    '<div class="cutbars" role="img" aria-label="Chances de chaque score de coupure">' + shown.map(v => '<div class="cb' + (v === best ? ' on' : '') + '"><small>' + pc(v) + '</small><i style="height:' + Math.max(4, Math.round(M.dist[v] / mx * 46)) + 'px"></i><span>' + fmt(v) + '</span></div>').join('') + '</div>' +
    '<div class="small mute" style="margin-top:2px"><span>Coupure actuelle : ' + fmt(cur) + '</span> · <span>' + Math.round(M.prog * 100) + ' % des trous de la ronde joués</span></div></div>';
}
/* Bloc « ronde en cours » partagé par l'écran de jeu et la fin de ronde 1 */
function roundBlock(k) {
  const c = S.cur, pjOk = !c.rc,   /* v382 : « Saison en direct » aussi en mode 1 ronde */ pv = S.ui.pv === 'proj' && !pjOk ? 'board' : S.ui.pv, lbmode = S.ui.lbmode === 'all' ? 'all' : S.ui.lbmode === 'left' ? 'left' : 'pin';   // « Top 25 » et « Autour de moi » retirés
  const lv = S.ui.lgv != null && S.ui.lgv !== c.pl ? S.ui.lgv : c.pl, other = lv !== c.pl;
  let top = c.fin ? '<p class="small mute" style="margin:0 0 6px">\ud83c\udfc6 Finale \u00b7 top ' + FIN.n + ' de la Ligue 1 (' + fld(c).length + ' golfeurs) \u00b7 points doubl\u00e9s</p>' : chipRow((c.rc ? [[4, 'Recrues \u00b7 toi']] : []).concat(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1) + (i === c.pl && !c.sw ? ' \u00b7 toi' : '')])), lv, 'lgv');
  const rows = other ? othRows(lv, k) : liveRows(k);
  DUO_LIVE = S.duo && rows && !other ? duoLiveTag(duoLiveEst(rows)) : '';
  const dmap = S.duo && rows && !other ? duoLiveMap(rows) : null;
  if (!rows) return top + '<p class="mute">Les autres ligues seront visibles en direct d\u00e8s le prochain tournoi.</p>';
  const teeRows = rows.some(r => r.n != null);
  if (other) top += '<p class="small mute" style="margin:0 0 6px">' + esc(LEAGUE_NAMES[lv]) + ' \u00b7 ' + (teeRows ? 'ronde ' + (c.r + 1) : (k === 0 ? 'avant le d\u00e9part' : k === 18 ? 'ronde termin\u00e9e' : 'apr\u00e8s ' + k + ' trou' + (k > 1 ? 's' : '')) + ' \u00b7 ronde ' + (c.r + 1)) + '</p>';
  let h = top + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' + chipRow([['cards', 'Cartes de scores'], ['board', 'Classement']].concat(pjOk ? [['proj', 'Saison en direct']] : []), pv, 'pv') +
    (!other && c.r === 0 && !c.fin && !c.rc && !S.one ? '' : c.fin || c.rc ? '<span class="tag" style="font-size:15px;padding:3px 12px;white-space:nowrap">Aucune coupure</span>' : c.r === 0 ? '<span class="tag" style="font-size:15px;padding:3px 12px;white-space:nowrap">' + (S.one ? 'Pay\u00e9s jusqu\u2019\u00e0' : 'Coupure') + ' : ' + fmt(cutScoreOf(rows.map(r => r.tot), S.settings.cut)) + '</span>' : '') + '</div>';
  if (!other && c.r === 0 && !c.fin && !c.rc && !S.one) { try { h += cutStripHTML(k, rows); } catch (e) { } }
  if (pv === 'proj') { try { return h + projBoard(lv, rows); } catch (e) { return h + '<p class="mute">Projection indisponible.</p>'; } }
  const nLeft = teeRows ? rows.filter(r => r.n < 18).length : 0;   // v312 : « À jouer » épingle en haut tous ceux qui n'ont pas terminé
  const lbm = lbmode === 'left' && !nLeft ? 'pin' : lbmode;
  h += chipRow([['pin', '\u00c9pingl\u00e9'], ['all', 'Tous']].concat(nLeft ? [['left', '\u00c0 jouer (' + nLeft + ')']] : []), lbm, 'lbmode');
  let nsBar = '';
  const vis = teeRows ? (() => {   // v217 : où en est le champ ; ceux qui ne sont pas encore partis sont regroupés sur une ligne repliable
    const fin = rows.filter(r => r.n >= 18).length, ns = rows.filter(r => r.ns && r.id !== 0), on = rows.length - fin - ns.length;
    h += '<p class="small mute tstat"><span>\u26f3 ' + fin + ' termin\u00e9' + (fin > 1 ? 's' : '') + '</span> \u00b7 <span>' + on + ' sur le terrain</span> \u00b7 <span>' + ns.length + ' pas encore parti' + (ns.length > 1 ? 's' : '') + '</span></p>';
    if (!ns.length || c.r === 1) return rows;   // v274 : en ronde 2, ceux qui ne sont pas encore partis restent dans le classement (les meneurs partent en dernier)
    const gs = ns.map(r => r.g), t0 = teeTime(Math.min.apply(null, gs)), t1 = teeTime(Math.max.apply(null, gs));
    nsBar = '<button class="nsbar" data-a="teens" aria-expanded="' + !!S.ui.nsOpen + '">' + '<span>' + (S.ui.nsOpen ? '\u25be ' : '\u25b8 ') + ns.length + ' pas encore parti' + (ns.length > 1 ? 's' : '') + '</span> \u00b7 <span>' + (t0 === t1 ? 'd\u00e9part \u00e0 ' + t0 : 'd\u00e9parts de ' + t0 + ' \u00e0 ' + t1) + '</span> \u00b7 <span>' + (S.ui.nsOpen ? 'masquer' : 'afficher') + '</span></button>';
    return S.ui.nsOpen ? rows : rows.filter(r => !r.ns || r.id === 0);
  })() : rows;
  const list = lbm === 'left' ? rows.filter(r => r.n < 18).map((r, i, A) => Object.assign({}, r, { pinned: i === A.length - 1 ? 'LE' : 'L' })).concat([{ gap: true }], pickRows(vis, 25, 3)) : lbm === 'all' ? vis : lbmode === 'me' ? pickAround(vis, 20) : lbmode === 'pin' ? pinMe(vis, vis) : pickRows(vis, 25, 3);
  if (pv === 'cards') {
    const cr = list.map(r => r.gap ? r : { id: r.id, pos: posLbl(r), tot: r.tot, me: r.id === 0, pinned: r.pinned, pending: r.pending, holes: (other ? othHoles(lv, r.id) : r.id === 0 ? myHoles(c) : c.ai[r.id]).slice(0, r.n != null ? r.n : r.pending ? k - 1 : k), r1: c.r === 1 ? (other ? c.oth[lv].r1[r.id] : c.r1[r.id]) : null });
    if (dmap) h += duoPurseStrip();
    const gain = dmap ? (() => { const g = {}; rows.forEach(r => { g[r.id] = dmap.amt(r); }); return g; })() : null;
    h += cardsHTML(cr, c.pars, { gain, showR1: c.r === 1, next: k < 18 ? k : -1, index: c.index, mwl: lv, tw: !other });
  } else {
    const r1of = c.r === 1 ? (id => { const v = other ? (c.oth[lv] && c.oth[lv].r1 ? c.oth[lv].r1[id] : null) : c.r1 ? c.r1[id] : null; return v == null ? null : v; }) : null;
    h += (dmap ? duoPurseStrip() : '') + liveBoard(list, k, lv, dmap, r1of);
  }
  return h + nsBar;
}


/* ---- Nouvelles : rend cliquables les noms de golfeurs mentionn\u00e9s ---- */
function newsHTML(text, ids) {
  const pairs = (ids || []).filter(id => id != null && id !== 0).map(id => ({ id, name: nameOf(id) })).filter(p => p.name);
  if (!pairs.length) return esc(text);
  pairs.sort((a, b) => b.name.length - a.name.length);
  const rxEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(' + pairs.map(p => rxEsc(p.name)).join('|') + ')');
  return text.split(re).map(part => {
    const p = pairs.find(x => x.name === part);
    return p ? '<a href="#" data-a="golfer" data-id="' + p.id + '" class="nlink">' + esc(part) + '</a>' : esc(part);
  }).join('');
}


function fmtDist(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, LANG === 'en' ? ',' : '\u202f'); }
function fmtMoney(n) { return LANG === 'en' ? '$' + fmtDist(n || 0) : fmtDist(n || 0) + ' $'; }
function yr(s) { return S.startYear ? (S.startYear + s - 1) : s; }   // ann\u00e9e affich\u00e9e pour une saison donn\u00e9e (ou le num\u00e9ro brut si aucune ann\u00e9e n'est configur\u00e9e)
function courseMeta(c) {
  if (!c || c.tee == null) return '';
  let h = '<div class="mute small" style="margin-top:2px">Tee ' + esc(c.tee) + ' \u00b7 ' + fmtDist(c.dist) + ' v \u00b7 CR ' + c.cr.toFixed(1).replace('.', ',') + ' / Slope ' + c.slope + (distDelta(c.dist) ? ' \u00b7 distance : ' + (distDelta(c.dist) > 0 ? '+' : '\u2212') + Math.abs(distDelta(c.dist)).toFixed(1).replace('.', ',') + ' coup' + (Math.abs(distDelta(c.dist)) >= 2 ? 's' : '') + ' par ronde' : '') + '</div>';
  const bits1 = [], bits2 = [], one = !!(S && S.one);
  if (c.pin) bits1.push('Drapeau : ' + PIN_LABELS[c.pin]);
  if (c.wind && c.wind !== 'none') bits1.push('Vent : ' + WIND_LABELS[c.wind]);
  if (c.pin2 && !one) bits2.push('Drapeau : ' + PIN_LABELS[c.pin2]);
  if (c.wind2 && c.wind2 !== 'none' && !one) bits2.push('Vent : ' + WIND_LABELS[c.wind2]);
  if (bits1.length && (one || bits1.join(' \u00b7 ') === bits2.join(' \u00b7 '))) h += '<div class="mute small">' + bits1.join(' \u00b7 ') + '</div>';
  else {
    if (bits1.length) h += '<div class="mute small">R1 \u2014 ' + bits1.join(' \u00b7 ') + '</div>';
    if (bits2.length) h += '<div class="mute small">R2 \u2014 ' + bits2.join(' \u00b7 ') + '</div>';
  }
  return h;
}

function cols(L, R, F, mod) { return '<div class="cols' + (mod ? ' ' + mod : '') + '"><div class="ca">' + L + '</div><div class="cb">' + (R || '') + '</div><div class="cf">' + (F || '') + '</div></div>'; }
const FLAGSVG = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M7 4l12 4.5L7 13z" fill="var(--acc)"/></svg>';

/* Liste des nationalit\u00e9s (noms de pays non traduits, comme pour les adversaires) */
function natSelectHTML(id, sel) { return '<select id="' + id + '"><option value="">Non pr\u00e9cis\u00e9e</option>' + NATIONS.slice().sort((a, b) => a.name.localeCompare(b.name)).map(n => '<option value="' + esc(n.name) + '"' + (n.name === sel ? ' selected' : '') + '>' + esc(n.name) + '</option>').join('') + '</select>'; }
/* ---- Nouvelle partie ---- */
