/* ============ v248 : historique du World Ranking ============
   Après chaque tournoi, le top 100 publié est gardé dans le tournoi (t.wr = ids dans l'ordre).
   Les parties existantes sont reconstituées une fois (même formule, sur les 30 tournois d'alors). */
function wrStore() { try { const T = S.last && tGet(S.hist[S.last.s - 1], S.last.t); if (T && T.lg) T.wr = wrSnapshot().slice(0, WR_TOP); } catch (e) { } }
function wrCompute(ts) {   // ts : tournois du plus récent au plus ancien (fenêtre de WR.win)
  const acc = {};
  ts.slice(0, WR.win).forEach((t, k) => {
    const w = k < WR.full ? 1 : (WR.win - k) / (WR.win - WR.full);
    let m = 0, n = 0; t.lg.forEach(lg => lg && lg.rows.forEach(r => { if (r[2] != null) { m += r[2]; n++; } })); if (!n) return; m /= n;
    const cx = t.ctx || {}, cond = r => ((cx.weather || [])[r] || 0) + ((cx.windBump || [])[r] || 0);
    t.lg.forEach((lg, l) => lg && lg.rows.forEach(r => {
      const id = r[0], a = acc[id] || (acc[id] = { s: 0, w: 0, n: 0 }), b = WR.bonus * wrBonus(r[1]) * (WR.lm[l] || 0);
      a.n++; [r[2], r[3]].forEach((rel, ri) => { if (rel == null) return; a.s += w * (rel - m - (cond(ri) - cond(0)) - b); a.w += w; });
    }));
  });
  return Object.keys(acc).map(Number).filter(id => acc[id].n >= WR.minT && acc[id].w > 0).sort((x, y) => acc[x].s / acc[x].w - acc[y].s / acc[y].w || x - y).slice(0, WR_TOP);
}
function wrBackfill() {
  if (!S || S.wrv === 1) return;
  const all = []; S.hist.forEach(H => (H.t || []).forEach(t => { if (t && t.lg) all.push(t); }));
  all.forEach((t, i) => { if (!t.wr) t.wr = wrCompute(all.slice(Math.max(0, i - WR.win + 1), i + 1).reverse()); });
  S.wrv = 1;
}
function wrChartHTML(id) {   // v257 : saison par saison (plages sur zones), rang final dans la colonne, détails au toucher / survol
  const pts = []; let first = -1, last = -1;
  S.hist.forEach(H => (H.t || []).forEach((t, ti) => { if (!t || !t.lg) return; let l = -1; t.lg.forEach((lg, k) => { if (l < 0 && lg && lg.rows.some(r => r[0] === id)) l = k; });
    const r = t.wr ? t.wr.indexOf(id) + 1 : 0; pts.push({ s: H.s, t: ti, r: r || null, has: !!t.wr, l, nm: t.name || '' }); if (l >= 0) { if (first < 0) first = pts.length - 1; last = pts.length - 1; } }));
  if (first < 0) return '';
  const P = pts.slice(first, (S.G[id] || id === 0 ? pts.length : last + 1)).filter(p => p.has);
  const ranked = P.filter(p => p.r); if (!ranked.length) return '';
  const best = ranked.reduce((a, p) => p.r < a.r ? p : a, ranked[0]), cur = P[P.length - 1], n1 = ranked.filter(p => p.r === 1).length, t10 = ranked.filter(p => p.r <= 10).length;
  const SS = []; P.forEach(p => { let o = SS[SS.length - 1]; if (!o || o.s !== p.s) { o = { s: p.s, p: [] }; SS.push(o); } o.p.push(p); });
  SS.forEach(o => { const rk = o.p.filter(p => p.r); o.end = o.p[o.p.length - 1].r; o.nr = rk.length; o.n = o.p.length;
    o.lo = rk.length ? rk.reduce((a, p) => p.r < a.r ? p : a, rk[0]) : null; const nc = o.p.find(p => !p.r);
    o.hi = nc || (rk.length ? rk.reduce((a, p) => p.r > a.r ? p : a, rk[0]) : null);
    const ls = o.p.map(p => p.l).filter(l => l >= 0); o.l = ls.length ? ls[ls.length - 1] : -1; });
  const pc = isPC(), W = pc ? 640 : 360, Hh = pc ? 240 : 250, X0 = 30, X1 = W - 4, Y0 = 10, Y1 = Hh - 52, NC = Hh - 34, n = SS.length, bw = (X1 - X0) / n;
  const y = r => r ? Y0 + Math.log(r) / Math.log(WR_TOP) * (Y1 - Y0) : NC;
  const tcol = r => !r ? '#C9CEC4' : r <= 10 ? '#E8B931' : r <= 50 ? '#AEBBC7' : '#D19A6A';
  let g = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (y(10) - Y0).toFixed(1) + '" fill="#E8B931" opacity=".14"/><rect x="' + X0 + '" y="' + y(10).toFixed(1) + '" width="' + (X1 - X0) + '" height="' + (y(50) - y(10)).toFixed(1) + '" fill="#AEBBC7" opacity=".17"/><rect x="' + X0 + '" y="' + y(50).toFixed(1) + '" width="' + (X1 - X0) + '" height="' + (y(100) - y(50)).toFixed(1) + '" fill="#D19A6A" opacity=".15"/>';
  [1, 10, 50, 100].forEach(v => { g += '<text x="' + (X0 - 4) + '" y="' + (y(v) + (v === 1 ? 9 : 4)).toFixed(1) + '" font-size="10" text-anchor="end" fill="var(--mute)">' + v + '</text>'; });
  g += '<text x="' + (X0 - 4) + '" y="' + (NC + 4) + '" font-size="10" text-anchor="end" fill="var(--mute)">NC</text><line x1="' + X0 + '" x2="' + X1 + '" y1="' + NC + '" y2="' + NC + '" stroke="var(--line)" stroke-dasharray="3 4"/>';
  const step = bw >= 26 ? 1 : bw >= 13 ? 2 : bw >= 8 ? 3 : 5, fs = Math.max(8, Math.min(12, bw * 0.5));
  const lgN = l => l === 4 ? 'Classe de recrues' : l >= 0 ? LEAGUE_NAMES[l] : '';
  SS.forEach((o, k) => {
    const x = X0 + k * bw, cx = x + bw / 2, top = o.lo ? y(o.lo.r) : NC, bot = o.hi ? y(o.hi.r) : NC, ey = y(o.end), ph = Math.max(14, Math.min(20, bw * 0.8));
    const d = [yr(o.s), lgN(o.l), o.lo ? o.lo.r : '', o.lo ? o.lo.t + 1 : '', o.hi && o.hi.r ? o.hi.r : '', o.hi ? o.hi.t + 1 : '', o.end || '', o.nr, o.n].join('|');
    g += '<g class="wrcol" data-wr="' + esc(d) + '" tabindex="0" role="button" aria-label="Saison ' + yr(o.s) + ' : fin ' + (o.end ? '#' + o.end : 'NC') + '"><rect x="' + x.toFixed(1) + '" y="' + Y0 + '" width="' + bw.toFixed(1) + '" height="' + (NC - Y0 + 8) + '" fill="transparent"/>' +
      '<rect class="wrrg" x="' + (x + 1.5).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + Math.max(2, bw - 3).toFixed(1) + '" height="' + Math.max(5, bot - top).toFixed(1) + '" rx="' + Math.min(5, bw / 3).toFixed(1) + '" fill="var(--acc)" opacity=".3"/>' +
      '<rect x="' + (x + 0.5).toFixed(1) + '" y="' + (ey - ph / 2).toFixed(1) + '" width="' + Math.max(2, bw - 1).toFixed(1) + '" height="' + ph.toFixed(1) + '" rx="' + Math.min(5, bw / 3).toFixed(1) + '" fill="' + tcol(o.end) + '" stroke="var(--paper)" stroke-width="1.5"/>' +
      (bw >= 11 ? '<text x="' + cx.toFixed(1) + '" y="' + (ey + fs * 0.36).toFixed(1) + '" text-anchor="middle" font-size="' + fs.toFixed(1) + '" font-weight="800" fill="' + (o.end ? '#1a1a1a' : '#555') + '">' + (o.end || 'NC') + '</text>' : '') +
      ((n - 1 - k) % step === 0 ? '<text x="' + cx.toFixed(1) + '" y="' + (Hh - 16) + '" text-anchor="middle" font-size="10" fill="var(--mute)">' + (step === 1 && bw < 40 ? String(yr(o.s)).slice(-2) : yr(o.s)) + '</text>' : '') + '</g>';
  });
  const svg = '<div class="wrbox"><svg class="wrsvg" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="World Ranking saison par saison : meilleur rang ' + best.r + '">' + g + '</svg><div class="wrpop" hidden></div></div>';
  const tile = (v, l) => '<div class="mtile"><b>' + v + '</b><span>' + l + '</span></div>';
  return '<div class="mgrid mgrid3 wrtiles">' + tile('#' + best.r, '<span>Meilleur rang</span> · ' + yr(best.s)) + tile(cur.r ? '#' + cur.r : 'NC', S.G[id] || id === 0 ? 'Actuel' : 'Dernier') + tile(n1 ? n1 : t10, n1 ? '<span>' + (n1 > 1 ? 'tournois au 1er rang' : 'tournoi au 1er rang') + '</span>' : '<span>' + (t10 > 1 ? 'tournois dans le top 10' : 'tournoi dans le top 10') + '</span>') + '</div>' + svg +
    '<p class="small mute" style="margin:4px 0 0">' + (isPC() ? 'Survole une saison' : 'Touche une saison') + ' pour voir son meilleur et son pire rang. Le chiffre dans la colonne est le rang à la fin de la saison.</p>';
}
/* v257 : bulle d'une saison du World Ranking (toucher sur mobile, survol sur ordinateur) */
function wrPopShow(gEl) {
  const box = gEl.closest('.wrbox'), pop = box && box.querySelector('.wrpop'); if (!pop) return;
  const [season, lg, lo, loT, hi, hiT, end, nr, n] = (gEl.getAttribute('data-wr') || '').split('|');
  const T = s => typeof trText === 'function' ? trText(s) : s, rk = v => v ? '#' + v : 'NC', sp = LANG === 'en' ? ': ' : ' : ';
  pop.innerHTML = '<b>' + T('Saison') + ' ' + season + (lg ? ' · ' + T(lg) : '') + '</b>' +
    '<span class="up">▲ ' + T('Meilleur') + sp + rk(lo) + (lo ? ' <small>(T' + loT + ')</small>' : '') + '</span>' +
    '<span class="dn">▼ ' + T('Pire') + sp + rk(hi) + (hiT ? ' <small>(T' + hiT + ')</small>' : '') + '</span>' +
    '<span class="en">● ' + T('Fin de saison') + sp + rk(end) + '</span>' +
    '<small>' + (LANG === 'en' ? 'Ranked after ' + nr + ' of ' + n + ' tournaments' : 'Classé après ' + nr + ' tournoi' + (nr > 1 ? 's' : '') + ' sur ' + n) + '</small>';
  pop.hidden = false;
  box.querySelectorAll('.wrcol.on').forEach(e => e.classList.remove('on')); gEl.classList.add('on');
  const br = box.getBoundingClientRect(), gr = gEl.getBoundingClientRect(), pw = pop.offsetWidth, phh = pop.offsetHeight;
  const cl = gr.left - br.left, cr = cl + gr.width;   // la bulle se place à côté de la colonne, sans la cacher
  let left = cl + gr.width / 2 < br.width / 2 ? cr + 8 : cl - pw - 8; if (left < 0 || left + pw > br.width) left = Math.max(0, Math.min(br.width - pw, cl + gr.width / 2 - pw / 2));
  pop.style.left = left + 'px'; pop.style.top = Math.max(0, br.height * 0.06) + 'px';
}
function wrPopHide(box) { const pop = box && box.querySelector('.wrpop'); if (pop) pop.hidden = true; if (box) box.querySelectorAll('.wrcol.on').forEach(e => e.classList.remove('on')); }
document.addEventListener('click', e => {
  const gEl = e.target.closest && e.target.closest('.wrcol');
  if (gEl) { const pop = gEl.closest('.wrbox').querySelector('.wrpop'); if (gEl.classList.contains('on') && pop && !pop.hidden) wrPopHide(gEl.closest('.wrbox')); else wrPopShow(gEl); return; }
  document.querySelectorAll('.wrbox').forEach(wrPopHide);
});
document.addEventListener('mouseover', e => { if (!isPC()) return; const gEl = e.target.closest && e.target.closest('.wrcol'); if (gEl) wrPopShow(gEl); });
document.addEventListener('mouseout', e => { if (!isPC()) return; const b = e.target.closest && e.target.closest('.wrbox'); if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) wrPopHide(b); });
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('wrcol')) { e.preventDefault(); wrPopShow(e.target); } });

function wrTag(id) {
  const r = wrPub(id);
  return '<div class="wrk' + (r === 1 ? ' n1' : '') + '" aria-label="World Ranking ' + (r ? r : 'non classé') + '"><span>WORLD RANKING</span><b>' + (r ? '#' + r : 'NC') + '</b></div>';
}
/* ---- Carte à collectionner : le palier actuel (couleur, étoiles sur 9), l'âge, le profil, la tendance, et le
   potentiel (ou le sommet pour un vétéran) en bas. Aucun chiffre sur 1000 n'est affiché. ---- */
const TIER_HEX = ['#7D8A80', '#6FA05B', '#4E9A3A', '#2F8F7A', '#2E78B7', '#6B5BD1', '#C1852B', '#DDA914', '#B23A78'];
function levelCard(g, l, hd) {
  const ti = tierOf(g), pi = potOf(g), tr = trendLabel(g), vet = g.a >= 31, pk = peakTierOf(g);
  const c = TIER_HEX[ti], c2 = vet ? TIER_HEX[pk] : TIER_HEX[tierClass(pi, POTS.length)];
  const bg = ti === 8 ? 'radial-gradient(120% 100% at 0 0,#8A4FD8,#5A1F4F 55%,#2A1030)' : 'radial-gradient(120% 100% at 0 0,color-mix(in srgb,' + c + ' 88%,#fff),color-mix(in srgb,' + c + ' 55%,#0B130C) 72%)';
  const stars = '<span class="lcst" aria-label="Palier ' + (ti + 1) + ' sur 9">' + '★'.repeat(ti + 1) + '<span>' + '★'.repeat(8 - ti) + '</span></span>';
  const sub = [g.ph && g.phR ? '\u26a1 Ph\u00e9nom\u00e8ne' : null, hd ? null : g.a + ' ans', ageLabel(g.a), tr ? (tr.indexOf('progression') >= 0 ? '▲ ' : tr.indexOf('déclin') >= 0 ? '▼ ' : '') + tr : null].filter(Boolean).join(' · ');
  return '<div class="lcard" style="background:linear-gradient(135deg,' + c + ',' + c2 + ')"><div class="lcin" style="background:' + bg + '">' + (hd && hd.photo && !isPC() ? phFrameHTML(hd.id, 'phmob') : '') +
    (hd ? '<div class="lcrow" style="align-items:flex-start"><div style="min-width:0"><h1 class="lcname">' + (hd.link ? '<a href="#" data-a="golfer" data-id="' + hd.id + '" style="color:inherit;text-decoration:none" title="Voir le profil">' + esc(hd.name) + ' <span style="opacity:.7">\u203a</span></a>' : esc(hd.name)) + '</h1><div class="lcctx">' + hd.ctx + '</div></div>' + '<div class="wrkcol">' + (g.nat ? '<div class="lcflag" aria-hidden="true">' + flagVisual(g.nat, 46) + '</div>' : '') + (hd.id != null ? wrTag(hd.id) : '') + '</div></div><div class="lcrow" style="margin-top:12px"><span class="lclab">NIVEAU ACTUEL</span>' + stars + '</div>' : '<div class="lcrow"><span class="lclab">NIVEAU ACTUEL</span>' + stars + '</div>') +
    '<div class="lctier">' + TIERS[ti][1] + '</div><div class="lcsub">' + sub + '</div>' +
    '<div class="lcbox"><div class="lclab">' + (vet ? 'SOMMET EN CARRIÈRE' : 'POTENTIEL') + '</div><div class="lcpot" style="color:color-mix(in srgb,' + c2 + ' 45%,#fff)">' + (vet ? TIERS[pk][1] : POTS[pi][1]) + '</div></div>' + (hd && hd.id != null ? lcBioHTML(hd.id) : '') +
    '</div></div>';
}
/* v288 : fiche d'identité et personnalité sur la carte du golfeur */
/* v318 : talents, cotes de jeu, sous pression et personnalité médiatique réunis dans un seul bloc « caractère » (colonnes sur PC, empilés sur mobile) */
function charBlock(id) {   // v334 : fiche du golfeur — talents · cotes de jeu (avec régularité et sous pression) · début de carrière · personnalité
  const col = h => { const m = /^<div class="block talblk"><h3>([^<]*)<\/h3>([\s\S]*)<\/div>$/.exec(h || ''); return m ? '<div class="chc"><div class="chh">' + m[1] + '</div>' + m[2] + '</div>' : ''; };
  const C = [col(talBlock(id)), ratingsCol(id), rcCol(id)];
  const b = bioOf(id), m = b && MEDIA_BY[b.pm], gg = S.G[id] && id !== 0 && trOn() ? trOf(S.G[id]) : null;   // v341 : la personnalité inclut tempérament et fin de tournoi
  const trRow = (k, v, t) => '<div class="trow"' + (t ? ' title="' + esc(t) + '"' : '') + '><span>' + k + '</span><b>' + v + '</b></div>';
  if (m || gg) C.push('<div class="chc chpmc"><div class="chh">Personnalité</div>' + (m ? '<div class="chpm">🎤 <b>' + m.fr + '</b></div><p class="small mute talnote">' + m.d + '</p>' : '') +
    (gg ? '<div class="rcrows chtr">' + trRow('Tempérament', TP_ICO[gg.tp - 1] + ' <span>' + TP_LBL[gg.tp - 1] + '</span>', TP_DESC[gg.tp - 1]) + trRow('Fin de tournoi', MC_ICO[gg.mc - 1] + ' <span>' + MC_LBL[gg.mc - 1] + '</span>', MC_DESC[gg.mc - 1]) + '</div>' : '') + '</div>');
  const L = C.filter(Boolean); if (!L.length) return '';
  return '<div class="block chblk n' + L.length + '">' + L.join('') + '</div>';
}
function ratingsCol(id) {
  const sk = skBlock(id), mr = /<div class="talrow">([\s\S]*?)<\/div>(<p[\s\S]*<\/p>)?<\/div>$/.exec(sk || '');
  let pills = mr ? mr[1] : '', notes = mr && mr[2] ? mr[2] : '';
  const g = S.G[id];
  if (g && id !== 0 && CFG.showForm) { const rl = regLevel(g); pills += '<span class="tal skp' + (rl >= 4 ? ' up' : rl <= 2 ? ' dn' : '') + '"><span class="ti">≈</span><span><b>Régularité</b><small>' + REG_LABELS[rl] + '</small></span><span class="lv">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= rl ? 'on' : '') + '"></i>').join('') + '</span></span>'; }
  if (g && id !== 0) {
    const n = g.cxn || 0, w = g.cxw || 0, cl = g.cl || 0;
    if (!clKnown(g)) pills += '<span class="tal unk"><span class="ti">?</span><span><b>Sous pression</b><small>Inconnu</small></span></span>';
    else pills += '<span class="tal ' + (cl >= 2 ? 'au' : cl === 1 ? 'ag' : cl <= -1 ? 'neg' : '') + '" title="' + esc(CL_DESC[cl]) + '"><span class="ti">' + CL_ICO[cl] + '</span><span><b>Sous pression</b><small>' + clutchLabel(cl) + '</small></span></span>';
    if (n) notes += '<p class="small mute talnote">En lutte à 5 trous de la fin : ' + n + ' fois' + (w ? ' · ' + plural(w, 'victoire') : '') + '</p>';
    if (g.clh && g.clh.length > 1) notes += '<p class="small mute talnote">Historique : ' + clutchLabel(g.clh[0][1]) + g.clh.slice(1).map(x => ' → ' + clutchLabel(x[1]) + ' (' + yr(x[0]) + ')').join('') + '</p>';
  }
  if (!pills) return '';
  return '<div class="chc"><div class="chh">Cotes de jeu</div><div class="talrow">' + pills + '</div>' + notes + '</div>';
}
function rcCol(id) {
  const h = rcProfileHTML(id); if (!h) return '';
  const g = S.G[id], cs = g ? g.cs || 0 : 0;
  let body = h.replace('<div class="block rcprof"><h3 style="margin-top:0">Début de carrière</h3>', '').replace(/<\/div>$/, '');
  if (cs) body = body.replace('<div class="rcrows">', '<div class="rcrows"><div class="trow"><span>Carrière</span><b>' + cs + ' saison' + (cs > 1 ? 's' : '') + '</b></div>');
  return '<div class="chc rcprof"><div class="chh">Début de carrière</div>' + body + '</div>';
}
function pmDescHTML(id) {   // v288 : la carte montre la fiche ; l'Aperçu garde seulement la description de la personnalité
  const b = bioOf(id), m = b && MEDIA_BY[b.pm]; if (!m) return '';
  return '<div class="block biob"><div class="biom" style="margin:0;padding:0;border:0"><span class="small mute">Personnalité médiatique</span><span class="biomt">🎤 <b>' + m.fr + '</b></span><span class="small mute">' + m.d + '</span></div></div>';
}
function lcBioHTML(id) {
  const b = bioOf(id); if (!b) return '';
  const m = MEDIA_BY[b.pm];
  return '<div class="lcbio"><div><span>VILLE NATALE</span><b>' + esc(b.ct || '–') + '</b></div><div><span>TAILLE</span><b>' + fmtHt(b.h) + '</b></div><div><span>POIDS</span><b>' + fmtWt(b.w) + '</b></div><div><span>CÔTÉ</span><b>' + (b.lf ? 'Gaucher' : 'Droitier') + '</b></div></div>' +
    (m ? '<div class="lcpm" title="' + esc(m.d) + '">🎤 ' + m.fr + '</div>' : '');
}

/* ---- Golfeurs ---- */
function vGolfers() {
  let h = '<div class="top"><h1>Golfeurs</h1></div><label for="q" style="margin-top:0">Rechercher par nom</label><input type="text" id="q" placeholder="Nom ou pr\u00e9nom" autocomplete="off" value="' + esc(VIEW.q || '') + '">' + (isMgr() ? '<div class="gsgrid">' : '') + '<div id="gsblk"' + ((VIEW.q || '').trim().length >= 2 ? ' hidden' : '') + '>' + (isMgr() ? mgrPanels(gsBlockHTML(), 'gsmain') : gsBlockHTML()) + '</div><div id="qres">' + qResults(VIEW.q || '') + '</div>' + (isMgr() ? '</div>' : '');
  h += '<button class="btn sec" data-a="golfer" data-id="0" style="margin-top:14px">Mon profil</button>';
  return h;
}
function qResults(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) {
    let h = '';
    const gs = Object.values(S.G), row = (g, extra) => '<tr><td><span class="flg-i">' + flagOf(g.id, 20) + '</span><a href="#" data-a="golfer" data-id="' + g.id + '">' + esc(g.n) + '</a></td><td class="r mute small">' + (leagueOf(g.id) >= 0 ? LEAGUE_SHORT[leagueOf(g.id)] : g.rcl ? 'Recrues' : '\u2013') + ' \u00b7 ' + extra + '</td></tr>';
    if (CFG.showForm) {
      const RFm = rfAll(), fx = gs.filter(g => RFm[g.id] && RFm[g.id].lv).map(g => ({ g, f: RFm[g.id] }));   // v334 : d'après les résultats
      const hot = fx.filter(x => x.f.lv > 0).sort((a, b) => b.f.d - a.f.d).slice(0, 5), cold = fx.filter(x => x.f.lv < 0).sort((a, b) => a.f.d - b.f.d).slice(0, 5);
      const fd = f => '<span>' + RF_LBL[f.lv] + '</span> · ' + (f.d > 0 ? '+' : '\u2212') + (Math.round(Math.abs(f.d) * 10) / 10).toString().replace('.', LANG === 'en' ? '.' : ',') + ' <span>' + (Math.abs(f.d) >= 2 ? 'coups' : 'coup') + ' par ronde</span>';
      if (hot.length) h += '<h2>En passe chaude</h2><table class="plain">' + hot.map(x => row(x.g, fd(x.f))).join('') + '</table>';
      if (cold.length) h += '<h2>En plein creux</h2><table class="plain">' + cold.map(x => row(x.g, fd(x.f))).join('') + '</table>';
    }
    const young = gs.filter(g => g.a <= 23 && g.id !== 0).map(g => ({ g, pts: getSt(g.id).pts })).sort((a, b) => b.pts - a.pts).slice(0, 5);
    if (young.length && young[0].pts > 0) h += '<h2>Jeunes \u00e0 surveiller</h2><table class="plain">' + young.map(y => row(y.g, y.g.a + ' ans \u00b7 ' + POTS[potOf(y.g)][1] + ' \u00b7 ' + y.pts + ' pts')).join('') + '</table>';
    h += '<h2>Meneurs de saison</h2>';
    for (let l = 0; l < 4; l++) { h += '<h3>' + LEAGUE_NAMES[l] + '</h3><table class="plain">' + rankAll(l).slice(0, 3).map(r => r.id).map((id, i) => '<tr><td>' + (i + 1) + '</td><td><a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a></td><td class="r">' + lgSt(id).pts + ' pts</td></tr>').join('') + '</table>'; }
    return isMgr() ? mgrPanels(h, 'gside') : h;
  }
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const nq = norm(q), res = [];
  Object.values(S.G).forEach(g => { if (norm(g.n).includes(nq)) res.push({ id: g.id, n: g.n, sub: TIERS[tierOf(g)][1] + ' \u00b7 ' + (leagueOf(g.id) >= 0 ? LEAGUE_SHORT[leagueOf(g.id)] : g.rcl ? 'Recrues' : '\u2013') + ' \u00b7 ' + g.a + ' ans' }); });
  Object.keys(S.old).forEach(id => { const o = S.old[id]; if (norm(o.n).includes(nq)) res.push({ id: +id, n: o.n, sub: 'retrait\u00e9' + (o.a ? ' \u00e0 ' + o.a + ' ans' : '') }); });
  if (norm(S.name).includes(nq)) res.unshift({ id: 0, n: S.name, sub: 'toi' });
  if (!res.length) return '<p class="mute">Aucun golfeur trouv\u00e9.</p>';
  return '<table class="plain" style="margin-top:8px">' + res.slice(0, 30).map(r => '<tr><td><a href="#" data-a="golfer" data-id="' + r.id + '">' + esc(r.n) + '</a></td><td class="r mute">' + r.sub + '</td></tr>').join('') + '</table>';
}
/* ---- Golfeurs : classement triable (ligue, critère de tri, filtre d'âge) ----
   Pour ajouter une catégorie : ajouter une entrée à GS_SORTS. key(r) renvoie la valeur de tri (null = golfeur exclu),
   desc = du plus grand au plus petit, cell(r) = contenu de la colonne. À valeur égale : ordre alphabétique
   (sauf l'index, départagé par le calcul exact). Les préférences sont gardées dans S.ui.gs. */
const gsColl = (typeof Intl !== 'undefined' && Intl.Collator) ? new Intl.Collator('fr', { sensitivity: 'base' }) : { compare: (a, b) => a.localeCompare(b) };
function gsRawIdx(hc) {   // index exact, avant l'arrondi au dixième : moyenne des meilleurs différentiels (8 sur 20) + ajustement
  const d = hc.d.map(x => x[6]).sort((a, b) => a - b), n = d.length; if (n < 3) return hc.x;
  const [k, adj] = HC_TAB[Math.min(n, 20)]; return avg(d.slice(0, k)) + adj;
}
function gsIdxTrend(hc) { const m = hc.hi.length; return m > 10 && hc.hi[m - 11] != null ? Math.round((hc.x - hc.hi[m - 11] / 10) * 10) / 10 : null; }
function gsProgMap() {    // paliers gagnés ou perdus pendant la dernière intersaison (null pour les recrues)
  const H = S.hist[S.season - 2]; if (!H || !H.end || !H.end.x) return null;
  const was = new Set(); H.end.tables.forEach(tb => tb.forEach(r => was.add(r[0])));
  const tc = {}; H.end.x.tc.forEach(c => { tc[c[0]] = c; });
  return { was, tc };
}
function skGs(r, f) { const h = r.id === 0 ? hcHolder(0) : r.g; const s = skSeasonOf(h); if (s == null) return null; const st = skStat(h.sx[s]); return st && st.n >= 4 ? st[f] : null; }
const gsTier = (k, list) => '<span class="tier sm t' + (list === POTS ? tierClass(k, POTS.length) : k) + '">' + list[k][1] + '</span>';
const GS_SORTS = [
  { k: 'idx', t: 'Handicap', h: 'Handicap', desc: false, key: r => r.hc && r.hc.x != null ? r.hc.x : null,
    cell: r => { const d = gsIdxTrend(r.hc); return '<b>' + fmtHI(r.hc.x) + '</b>' + (d ? ' <span class="small ' + (d < 0 ? 'dnx' : 'upx') + '">' + (d < 0 ? '▼ −' : '▲ +') + Math.abs(d).toFixed(1).replace('.', ',') + '</span>' : ''); } },
  { k: 'wr', t: 'World Ranking', h: 'World Ranking', desc: false, key: r => wrPub(r.id), cell: r => '<b>#' + r.k + '</b>' },
  { k: 'tal', t: 'Talent', h: 'Talent', desc: true, key: r => r.g ? tierOf(r.g) : null, cell: r => gsTier(r.k, TIERS) },
  { k: 'pot', t: 'Potentiel', h: 'Potentiel', desc: true, key: r => r.g ? potOf(r.g) : null, cell: r => gsTier(r.k, POTS) },
  { k: 'prog', t: 'Progression (dernière intersaison)', h: 'Progression', desc: true,
    key: (r, x) => { if (!x.prog || !r.g || !x.prog.was.has(r.id)) return null; const c = x.prog.tc[r.id]; r.pc = c; return c ? c[2] - c[1] : 0; },
    cell: r => r.k === 0 ? '<span class="mute">= ' + TIERS[tierOf(r.g)][1] + '</span>' : '<b class="' + (r.k > 0 ? 'dnx' : 'upx') + '">' + (r.k > 0 ? '▲ +' : '▼ −') + Math.abs(r.k) + '</b><span class="gssub">' + TIERS[r.pc[1]][1] + ' → ' + TIERS[r.pc[2]][1] + '</span>' },
  { k: 'young', t: 'Âge · les plus jeunes', h: 'Âge', desc: false, key: r => r.a, cell: r => '<b>' + r.a + ' ans</b>', age: 1 },
  { k: 'old', t: 'Âge · les plus vieux', h: 'Âge', desc: true, key: r => r.a, cell: r => '<b>' + r.a + ' ans</b>', age: 1 },
  { k: 'sfw', t: 'Fairways touchés (saison)', h: 'Fairways', desc: true, key: r => skGs(r, 'fw'), cell: r => '<b>' + fmtPct(r.k) + '</b>' },
  { k: 'sgir', t: 'Verts en régulation (saison)', h: 'GIR', desc: true, key: r => skGs(r, 'gir'), cell: r => '<b>' + fmtPct(r.k) + '</b>' },
  { k: 'spu', t: 'Putts par ronde (saison)', h: 'Putts', desc: false, key: r => skGs(r, 'pu'), cell: r => '<b>' + fmtPu(r.k) + '</b>' },
  { k: 'spe', t: 'Pénalités par ronde (saison)', h: 'Pénalités', desc: false, key: r => skGs(r, 'pe'), cell: r => '<b>' + fmtPu(r.k) + '</b>' },
  { k: 'sscr', t: 'Sauvetages (saison)', h: 'Sauvetages', desc: true, key: r => skGs(r, 'scr'), cell: r => '<b>' + fmtPct(r.k) + '</b>' },
  { k: 'pts', t: 'Points de la saison', h: 'Points', desc: true, key: r => lgSt(r.id).pts, cell: r => '<b>' + r.k + '</b> pts' },
  { k: 'gain', t: 'Gains en carrière', h: 'Gains', desc: true, key: r => (r.id === 0 ? (S.G[0] ? S.G[0].ce : S.pk.earn) : r.g.ce) || 0, cell: r => '<b>' + fmtMoney(r.k) + '</b>' },
  { k: 'win', t: 'Victoires en carrière', h: 'Victoires', desc: true,
    key: (r, x) => { const e = REC.L[x.l === 'all' ? 0 : x.l].w[r.id === 0 ? recMyKey() : String(r.id)]; return e ? e.v : 0; }, cell: r => '<b>' + r.k + '</b>' }
];
function gsPrefs() {
  const p = S.ui.gs || (S.ui.gs = {});
  if (p.l !== 'all' && !(p.l >= 0 && p.l <= 3)) p.l = vLg();
  if (!GS_SORTS.some(x => x.k === p.s)) p.s = 'idx';
  if (['all', 'le', 'ge', 'bt'].indexOf(p.am) < 0) p.am = 'all';
  p.a = clamp(Math.round(+p.a || 25), 15, 70); p.b = clamp(Math.round(+p.b || 30), 15, 70);
  return p;
}
function gsAgeTxt(p) { return p.am === 'le' ? p.a + ' ans et moins' : p.am === 'ge' ? p.a + ' ans et plus' : p.am === 'bt' ? 'de ' + Math.min(p.a, p.b) + ' à ' + Math.max(p.a, p.b) + ' ans' : 'tous les âges'; }
function gsRows(p) {
  const so = GS_SORTS.find(x => x.k === p.s), x = { l: p.l, prog: so.k === 'prog' ? gsProgMap() : null };
  if (so.k === 'win') recEnsure();
  const lo = Math.min(p.a, p.b), hi = Math.max(p.a, p.b);
  const ids = p.l === 'all' ? [0, 1, 2, 3].reduce((a, l) => a.concat(S.L[l]), []) : S.L[p.l];
  const rows = [];
  ids.forEach(id => {
    const g = S.G[id] || null, h = hcHolder(id), r = { id, g, hc: h && h.hc, a: g ? g.a : id === 0 && S.pk && S.pk.a ? S.pk.a : null, n: nameOf(id), l: leagueOf(id) };
    if (p.am !== 'all') { if (r.a == null) return; if (p.am === 'le' && r.a > p.a) return; if (p.am === 'ge' && r.a < p.a) return; if (p.am === 'bt' && (r.a < lo || r.a > hi)) return; }
    if (!g && id !== 0) return;
    if (!g && (so.k === 'tal' || so.k === 'pot' || so.k === 'prog' || (so.age && r.a == null))) return;   // joueur manuel : pas de talent ni de potentiel (v275 : l'âge et les stats individuelles, oui)
    r.k = so.key(r, x); if (r.k == null) return;
    if (so.k === 'idx') r.k2 = gsRawIdx(r.hc);
    rows.push(r);
  });
  rows.sort((a, b) => (so.k === 'pts' && p.l === 'all' ? a.l - b.l : 0) || (so.desc ? b.k - a.k : a.k - b.k) || (so.k === 'idx' ? a.k2 - b.k2 : 0) || gsColl.compare(a.n, b.n));
  return { rows, so };
}
function gsNote(p, so) {
  if (so.k === 'idx') return '▼ : le handicap a baissé sur 10 tournois (le golfeur s’améliore). À handicap égal, le calcul exact (8 meilleures rondes sur 20) départage.';
  if (so.k === 'wr') { const na = (p.l === 'all' ? [0, 1, 2, 3].reduce((t, l) => t.concat(S.L[l]), []) : S.L[p.l]).filter(id => (S.G[id] || id === 0) && !wrPub(id)).length; return 'Rang mondial, toutes ligues confondues : rondes des 3 dernières saisons (les plus récentes comptent davantage) et bonus pour les victoires et les tops. Seuls les ' + WR_TOP + ' premiers sont classés (au moins 8 tournois)' + (na ? ' : ' + na + ' golfeur' + (na > 1 ? 's' : '') + ' non classé' + (na > 1 ? 's' : '') + ' (NC) ne figure' + (na > 1 ? 'nt' : '') + ' pas ici.' : '.'); }
  if (so.k === 'tal' || so.k === 'pot') return 'À palier égal, ordre alphabétique.';
  if (so.k === 'prog') return 'Paliers gagnés ou perdus pendant la dernière intersaison. Les recrues n’y figurent pas.';
  if (so.k === 'win') return p.l === 'all' ? 'Toutes les ligues : seules les victoires en Ligue 1 comptent.' : 'Victoires en carrière en Ligue ' + (p.l + 1) + ' seulement.';
  if (so.k === 'pts' && p.l === 'all') return 'Toutes les ligues : classés par ligue, puis par points.';
  if (so.k === 'gain') return 'Toutes ligues confondues.';
  return '';
}
function gsBlockHTML() {
  const p = gsPrefs(), { rows, so } = gsRows(p), all = !!VIEW.gsAll, allL = p.l === 'all';
  const opt = (v, t, cur) => '<option value="' + v + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + t + '</option>';
  const num = (k, v) => '<input type="number" class="gsn" data-c="gsn" data-k="' + k + '" min="15" max="70" inputmode="numeric" value="' + v + '" aria-label="' + (k === 'a' ? 'Âge' : 'Âge maximal') + '">';
  let h = '<h2>Classement des golfeurs</h2><div class="gsbar">' +
    '<div class="gsf"><label for="gsL">Ligue</label><select id="gsL" data-c="gs" data-k="l">' + LEAGUE_NAMES.map((n, i) => opt(i, n, p.l)).join('') + opt('all', 'Toutes les ligues', p.l) + '</select></div>' +
    '<div class="gsf"><label for="gsS">Trier par</label><select id="gsS" data-c="gs" data-k="s">' + GS_SORTS.map(x => opt(x.k, x.k === 'win' && allL ? 'Victoires en carrière (Ligue 1)' : x.t, p.s)).join('') + '</select></div>' +
    '<div class="gsf gsf2"><label for="gsA">Âge</label><div class="gsagerow"><select id="gsA" data-c="gs" data-k="am">' + opt('all', 'Tous les âges', p.am) + opt('le', '… ans et moins', p.am) + opt('ge', '… ans et plus', p.am) + opt('bt', 'Entre … et … ans', p.am) + '</select>' +
    (p.am === 'bt' ? num('a', p.a) + '<span class="mute">et</span>' + num('b', p.b) : p.am !== 'all' ? num('a', p.a) : '') + '</div></div></div>';
  h += '<p class="small mute" style="margin:0 0 6px">' + rows.length + ' golfeur' + (rows.length > 1 ? 's' : '') + ' · ' + (allL ? 'toutes les ligues' : LEAGUE_NAMES[p.l]) + ' · ' + gsAgeTxt(p) + '</p>';
  if (!rows.length) return h + '<p class="mute">' + (so.k === 'wr' ? 'Aucun golfeur classé : il faut au moins 8 tournois, ou aucun golfeur ne correspond à ce filtre.' : so.k === 'idx' ? 'Aucun handicap à afficher : il faut au moins trois rondes, ou aucun golfeur ne correspond à ce filtre.' : so.k === 'prog' && !gsProgMap() ? 'La progression apparaît après la première intersaison.' : 'Aucun golfeur ne correspond à ce filtre.') + '</p>';
  const meI = rows.findIndex(r => r.id === 0);
  const list = all ? rows.map((r, i) => [r, i]) : rows.slice(0, 10).map((r, i) => [r, i]).concat(meI >= 10 ? [null, [rows[meI], meI]] : []);
  const showAge = !so.age, lgCol = allL;
  h += '<table class="plain gst"><tr><th>#</th><th>Golfeur</th>' + (lgCol ? '<th class="hid-m">Ligue</th>' : '') + (showAge ? '<th class="r hid-m">Âge</th>' : '') + '<th class="r">' + so.h + '</th></tr>' +
    list.map(e => {
      if (!e) return '<tr class="gsgap"><td colspan="' + (3 + (lgCol ? 1 : 0) + (showAge ? 1 : 0)) + '">···</td></tr>';
      const [r, i] = e, sub = [lgCol && r.l >= 0 ? 'L' + (r.l + 1) : null, showAge && r.a != null ? r.a + ' ans' : null].filter(Boolean).join(' · ');
      return '<tr' + (r.id === 0 ? ' class="hin"' : '') + '><td class="mute">' + (i + 1) + '</td><td><div class="nmr"><span class="flg-i">' + flagOf(r.id, 20) + '</span><a href="#" class="nmt" data-a="golfer" data-id="' + r.id + '">' + esc(r.n) + '</a></div>' + (sub ? '<div class="small mute sh-m">' + sub + '</div>' : '') + '</td>' +
        (lgCol ? '<td class="hid-m">' + (r.l >= 0 ? 'L' + (r.l + 1) : '') + '</td>' : '') + (showAge ? '<td class="r hid-m">' + (r.a == null ? '–' : r.a) + '</td>' : '') + '<td class="r gsv">' + so.cell(r) + '</td></tr>';
    }).join('') + '</table>';
  const note = gsNote(p, so); if (note) h += '<p class="small mute" style="margin:6px 0 0">' + note + '</p>';
  if (rows.length > 10) h += '<button class="btn sec" data-a="gsall" style="margin-top:10px">' + (all ? 'Voir le top 10' : 'Voir les ' + rows.length + ' golfeurs') + '</button>';
  return h;
}
function gsRefresh() { const b = document.getElementById('gsblk'); if (b) b.innerHTML = isMgr() ? mgrPanels(gsBlockHTML(), 'gsmain') : gsBlockHTML(); else render(); }
/* ---- Watchlist : listes de golfeurs suivis (S.wl = { lists: [{ id, n, ids }], nid, sel }) ---- */
function ensureWL() {
  if (!S.wl || !Array.isArray(S.wl.lists)) S.wl = { lists: [{ id: 1, n: 'Ma liste', ids: [] }], nid: 2, sel: 1 };
  S.wl.nid = S.wl.nid || (Math.max(0, ...S.wl.lists.map(l => l.id)) + 1);
}
const wlKnown = id => !!(S.G[id] || (S.old && S.old[id]));
const wlIn = id => S.wl.lists.filter(l => l.ids.includes(id));
function wlAdd(name) {
  const n = String(name || '').trim().slice(0, 24); if (!n) return null;
  const l = { id: S.wl.nid++, n, ids: [] }; S.wl.lists.push(l); return l;
}
function wlIds(sel) {       // golfeurs d'une liste (ou de toutes), sans doublon
  const src = sel === 'all' ? S.wl.lists : S.wl.lists.filter(l => l.id === sel), seen = new Set(), out = [];
  src.forEach(l => l.ids.forEach(id => { if (!seen.has(id) && wlKnown(id)) { seen.add(id); out.push(id); } }));
  return out;
}
const WL_TAGS = { scout: 'potentiel revu', bust: 'déçoit', late: 'éclosion', up: 'en progrès', down: 'en recul', yips: 'perd la touche', promo: 'promu', releg: 'relégué' };
function wlTag(g) {         // repère de la dernière intersaison
  if (!g || !g.lt || g.lt.s !== S.season - 1 || !WL_TAGS[g.lt.t]) return '';
  return '<span class="wtag' + (g.lt.t === 'bust' || g.lt.t === 'down' || g.lt.t === 'yips' || g.lt.t === 'releg' ? ' w' : '') + '">' + WL_TAGS[g.lt.t] + '</span>';
}
function wlRow(id, listId) {
  const g = S.G[id], o = S.old[id]; let sub = [], r1 = '\u2014', r2 = '';
  if (g) {
    const l = leagueOf(id);
    if (l >= 0) sub.push(LEAGUE_SHORT[l]);
    sub.push(g.a + ' ans');
    if (l >= 0 && getSt(id).n > 0) sub.push(ord(seasonRank(l, id)));
    r1 = TIERS[tierOf(g)][1]; r2 = g.a >= 31 ? 'Sommet ' + TIERS[peakTierOf(g)][1] : POTS[potOf(g)][1];
  } else sub.push('Retraité' + (o && o.a ? ' à ' + o.a + ' ans' : ''));
  const rm = listId !== 'all' ? ' \u00b7 <a href="#" data-a="wlrm" data-id="' + id + '" data-l="' + listId + '">Retirer</a>' : '';
  return '<tr><td><a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>' + wlTag(g) + '<div class="small mute">' + sub.join(' \u00b7 ') + rm + '</div></td>' +
    '<td class="r">' + r1 + '<div class="small mute">' + r2 + '</div></td></tr>';
}
function vWatch() {
  ensureWL();
  const W = S.wl, lists = W.lists, cnt = l => l.ids.filter(wlKnown).length;
  let sel = VIEW.wl != null ? VIEW.wl : W.sel;
  if (sel !== 'all' && !lists.some(l => l.id === sel)) sel = lists.length ? lists[0].id : 'all';
  W.sel = sel;
  let h = '<div class="top"><div><h1>Watchlist</h1><div class="ctx">Les golfeurs que tu suis</div></div></div>';
  const chips = lists.map(l => [l.id, l.n + ' \u00b7 ' + cnt(l)]);
  if (lists.length > 1) chips.push(['all', 'Tous \u00b7 ' + wlIds('all').length]);
  h += chipRow(chips, sel, 'wlsel').replace(/<\/div>$/, '<button class="chip" data-a="wlnewopen">+ Liste</button></div>');
  if (VIEW.wlnew) h += '<div class="block"><label for="wlNew" style="margin-top:0">Nom de la nouvelle liste</label><div class="wlnew"><input type="text" id="wlNew" maxlength="24" placeholder="Rivaux" autocomplete="off"><button class="btn sm" data-a="wlcreate">Créer</button></div></div>';
  const ids = wlIds(sel);
  if (ids.length) h += '<table class="plain">' + ids.map(id => wlRow(id, sel)).join('') + '</table>';
  else h += '<div class="block"><p class="mute" style="margin:0">' + (lists.length ? 'Aucun golfeur dans cette liste. Ouvre un profil et touche « Suivre ».' : 'Crée une liste, puis ouvre un profil et touche « Suivre ».') + '</p></div><button class="btn sec" data-a="tab" data-v="golfers">Chercher un golfeur</button>';
  const cur = lists.find(l => l.id === sel);
  h += wlColorsHTML();
  if (cur) {
    if (VIEW.wlren) h += '<div class="block"><label for="wlRen" style="margin-top:0">Nom de la liste</label><input type="text" id="wlRen" maxlength="24" value="' + esc(cur.n) + '" autocomplete="off"><div style="display:flex;gap:8px;margin-top:10px"><button class="btn sm" data-a="wlrensave">Enregistrer</button><button class="btn sm sec" data-a="wlrenno">Annuler</button></div></div>';
    else if (VIEW.wldel) h += '<div class="block"><b>Supprimer « ' + esc(cur.n) + ' » ?</b><div class="small mute" style="margin:4px 0 10px">Les golfeurs restent dans le jeu, seule la liste disparaît.</div><div style="display:flex;gap:8px"><button class="btn sm" data-a="wldelok">Supprimer</button><button class="btn sm sec" data-a="wldelno">Annuler</button></div></div>';
    else h += '<p class="small mute" style="margin-top:14px"><a href="#" data-a="wlrenopen">Renommer la liste</a> \u00b7 <a href="#" data-a="wldelask">Supprimer la liste</a></p>';
  }
  return h;
}
function wlBar(id) {        // bouton « Suivre » du profil et panneau de choix des listes
  if (id === 0) return '';
  ensureWL();
  const ins = wlIn(id), on = ins.length > 0;
  let h = '<div class="wlbar"><button class="btn sm' + (on ? '' : ' sec') + '" data-a="wltoggle" aria-expanded="' + !!VIEW.wlopen + '">' + (on ? '\u2605 Suivi' : '\u2606 Suivre') + '</button>' +
    (on ? '<span class="small mute">' + ins.map(l => esc(l.n)).join(', ') + '</span>' : '') + '</div>';
  if (VIEW.wlopen) h += '<div class="block">' + S.wl.lists.map(l => '<label class="wlopt"><input type="checkbox" data-c="wlcb" data-l="' + l.id + '" data-id="' + id + '"' + (l.ids.includes(id) ? ' checked' : '') + '><span>' + esc(l.n) + '</span><span class="small mute">' + l.ids.filter(wlKnown).length + '</span></label>').join('') +
    '<div class="wlnew"><input type="text" id="wlNewP" maxlength="24" placeholder="Nouvelle liste" autocomplete="off"><button class="btn sm sec" data-a="wlcreateP" data-id="' + id + '">Créer</button></div></div>';
  return h;
}
/* Saisons passées : moyenne de points par tournoi, et pastille Promu / Relégué avec sa raison */
function pastAvg(p, nBySL) { const n = nBySL[p.s + '-' + p.l] || p.n; return n ? (p.pts / n).toFixed(1).replace('.', ',') : '\u2013'; }
let PAST_TIP = 'tip';   // 'tip' = infobulle au survol ou au toucher ; 'txt' = raison écrite à côté
function pastTag(p) {
  if (!p.up && !p.dn) return '';
  const t = p.up ? 'Promu' : 'Rel\u00e9gu\u00e9', c = p.up ? 'good' : 'bad', wy = (p.why || []).filter(Boolean), w = esc(wy.length === 2 ? wy[0] + ', ' + wy[1] : wy.join(''));
  if (!w) return '<span class="tag ' + c + '">' + t + '</span>';
  if (PAST_TIP === 'txt') return '';   // la ligne sous la saison dit déjà Promu ou Relégué
  return '<span class="tag ' + c + ' tip" tabindex="0" data-tip="' + w + '" aria-label="' + t + ' : ' + w + '">' + t + '</span>';
}
function pastWhyRow(p) {   // option « texte » : la raison sur une petite ligne sous la saison
  if (PAST_TIP !== 'txt' || (!p.up && !p.dn) || !p.why) return '';
  const wy = p.why.filter(Boolean); if (!wy.length) return '';
  return '<tr class="pwrow"><td colspan="8"><span class="' + (p.up ? 'dnx' : 'upx') + '">' + (p.up ? '\u25B2 Promu' : '\u25BC Rel\u00e9gu\u00e9') + '</span> : ' + esc(wy.join(', ')) + '</td></tr>';
}
