/* ============ v377 : PALMARÈS — vitrine des trophées et records personnels d'un golfeur ============ */
function palmData(id) {
  const all = golferHistory(id, false, true), TT = x => x.fin ? S.hist[x.s - 1].fin : S.hist[x.s - 1].t[x.t], LG = x => { const t = TT(x); return x.fin ? t.lg[0] : t.lg[x.l]; };
  const tot = r => r[2] + (r[3] || 0), D = { all, wins: [], second: 0, best: null, tot36: null, margin: null, streak: 0, comeback: null, po: [0, 0] };
  let run = 0;
  all.forEach(x => {
    const t = TT(x), L = LG(x); if (!t || !L) return;
    if (x.pos === 1) D.wins.push({ s: x.s, t: x.t, l: x.l, n: x.name, fin: !!x.fin, maj: !x.fin && x.l === 0 && t.maj ? t.maj : '', rel: x.r2 !== null ? x.r1 + x.r2 : x.r1 });
    if (x.pos === 2) D.second++;
    [[x.r1, 1], [x.r2, 2]].forEach(([v, k]) => { if (v != null && (!D.best || v < D.best.v)) D.best = { v, k, x, par: t.par }; });
    if (x.r2 !== null && (!D.tot36 || x.r1 + x.r2 < D.tot36.v)) D.tot36 = { v: x.r1 + x.r2, x };
    if (!x.fin) { run = x.mc ? 0 : run + 1; if (run > D.streak) D.streak = run; }
    const rows = L.rows, me = rows.find(r => r[0] === id); if (!me) return;
    const mine = tot(me), lead = Math.min.apply(null, rows.filter(r => r[1] > 0).map(tot));
    if (L.playoff && mine === lead) { if (x.pos === 1) D.po[0]++; else D.po[1]++; }
    if (x.pos === 1) {
      const sec = rows.filter(r => r[0] !== id && r[1] > 0).map(tot), m = sec.length ? Math.min.apply(null, sec) - mine : null;
      if (m != null && m > 0 && (!D.margin || m > D.margin.v)) D.margin = { v: m, x };
      if (x.r2 !== null) { const r1lead = Math.min.apply(null, rows.map(r => r[2])), back = x.r1 - r1lead; if (back > 0 && (!D.comeback || back > D.comeback.v)) D.comeback = { v: back, x }; }
    }
  });
  return D;
}
const palmLink = (x, txt, m) => '<a href="#" class="rlk" data-a="tourn" data-s="' + x.s + '" data-t="' + (x.fin ? N_TOURN : x.t) + '" data-l="' + (x.fin ? 0 : x.l) + '" data-m="' + (m || 'res') + '" data-fid="' + VIEW.id + '">' + txt + '</a>';
function palmRecBadge(id, D) {   // record de ronde de sa ligue ou du circuit
  try { if (!REC || REC.S !== S || !D.best) return ''; const b = D.best, own = (R, l) => R && R[0] && R[0].id === id && R[0].v === b.v && R[0].s === b.x.s && R[0].t === b.x.t;
    const top = [0, 1, 2, 3].map(l => REC.L[l].perf.round[0]).filter(Boolean), circ = top.length ? Math.min.apply(null, top.map(r => r.v)) : null;
    if (own(REC.L[b.x.fin ? 0 : b.x.l].perf.round)) return '<span class="pmchip">' + (b.v === circ ? 'record du circuit' : 'record L' + ((b.x.fin ? 0 : b.x.l) + 1)) + '</span>';
  } catch (e) { } return '';
}
function vPalm() {
  const id = VIEW.id, g = S.G[id] || (S.old && S.old[id]), D = palmData(id), TR = golferTrophies(id);
  const reg = D.all.filter(x => !x.fin), n = reg.length, mc = reg.filter(x => x.mc).length, t10 = D.all.filter(x => x.pos > 0 && x.pos <= 10).length, earn = D.all.reduce((a, x) => a + (x.pay || 0), 0);
  const seasons = new Set(D.all.map(x => x.s)).size;
  let h = '<div class="pmhead"><div class="pmk">Palmarès</div><h1>' + esc(nameOf(id)) + (g && g.nat ? ' <span class="pmflag">' + flagVisual(g.nat, 30) + '</span>' : '') + '</h1>' +
    '<div class="pmctx">' + (g && g.a ? '<span>' + g.a + ' ans</span> · ' : '') + '<span>' + seasons + ' saison' + (seasons > 1 ? 's' : '') + '</span> · <span>' + n + ' tournoi' + (n > 1 ? 's' : '') + '</span></div>' +
    '<div class="pmkpi"><div><b>' + D.wins.length + '</b><span>victoire' + (D.wins.length > 1 ? 's' : '') + '</span></div><div><b>' + t10 + '</b><span>top 10</span></div><div><b>' + (n ? Math.round((n - mc) / n * 100) : 0) + ' %</b><span>coupures réussies</span></div><div><b>' + (earn >= 1e6 || earn < 1e4 ? tzMoney(earn) : LANG === 'en' ? '$' + Math.round(earn / 1e3) + 'K' : Math.round(earn / 1e3) + ' k$') + '</b><span>gains</span></div></div></div>';
  // A · vitrine
  h += '<h2>La vitrine</h2>';
  if (TR.seas.length) h += '<div class="pmrail">' + TR.seas.map(x => tzBanner(x)).join('') + '</div>';
  if (D.wins.length) {
    const W = D.wins.slice().sort((a, b) => b.s - a.s || (b.fin ? 1 : 0) - (a.fin ? 1 : 0) || b.t - a.t);
    h += '<div class="pmcase">' + W.map(w => '<a href="#" class="pmtro' + (w.fin ? ' fin' : w.maj ? ' maj' : '') + '" data-a="tourn" data-s="' + w.s + '" data-t="' + (w.fin ? N_TOURN : w.t) + '" data-l="' + (w.fin ? 0 : w.l) + '" data-m="res" data-fid="' + id + '">' +
      '<span class="pmcup">' + tzCup(w.fin ? '#B28CFF' : w.maj ? '#F2C230' : TZ_LGC[w.l], 34) + '</span><b>' + esc(w.n) + '</b><small>' + (w.fin ? '🏆 Finale' : w.maj ? '★ ' + esc(w.maj) : 'Ligue ' + (w.l + 1)) + '</small><small>' + yr(w.s) + ' · ' + fmt(w.rel) + '</small></a>').join('') + '</div>';
  } else h += '<p class="mute">Aucune victoire de tournoi pour l’instant.</p>';
  if (D.second) h += '<p class="small mute" style="margin:6px 0 0"><span>Deuxième place</span> : <b>' + D.second + '</b> <span>fois</span></p>';
  // C · records personnels
  const rows = [];
  if (D.best) rows.push(['Meilleure ronde', palmLink(D.best.x, (D.best.par ? (D.best.par + D.best.v) + ' (' + fmt(D.best.v) + ')' : fmt(D.best.v)), D.best.x.r2 !== null || D.best.k === 2 ? 'c' + D.best.k : 'c1') + palmRecBadge(id, D), esc(D.best.x.name) + ' · ' + yr(D.best.x.s)]);
  if (D.tot36) rows.push(['Meilleur total (36 trous)', palmLink(D.tot36.x, fmt(D.tot36.v)), esc(D.tot36.x.name) + ' · ' + yr(D.tot36.x.s)]);
  if (D.margin) rows.push(['Plus grande marge de victoire', palmLink(D.margin.x, D.margin.v + ' coup' + (D.margin.v > 1 ? 's' : '')), esc(D.margin.x.name) + ' · ' + yr(D.margin.x.s)]);
  if (D.comeback) rows.push(['Plus belle remontée gagnante', palmLink(D.comeback.x, D.comeback.v + ' coup' + (D.comeback.v > 1 ? 's' : '') + ' de retard'), '<span>après la ronde 1</span> · ' + esc(D.comeback.x.name) + ' · ' + yr(D.comeback.x.s)]);
  if (n) rows.push(['Plus longue série de coupures', '<b>' + D.streak + '</b>', '<span>tournois de suite</span>']);
  if (D.po[0] + D.po[1]) rows.push(['Prolongations', '<b>' + D.po[0] + '</b> <span>gagnée' + (D.po[0] > 1 ? 's' : '') + ' sur</span> <b>' + (D.po[0] + D.po[1]) + '</b>', '']);
  h += '<h2>Records personnels</h2>' + (rows.length ? '<div class="block pmrec">' + rows.map(r => '<div class="pmr"><span>' + r[0] + (r[2] ? '<small>' + r[2] + '</small>' : '') + '</span><b>' + r[1] + '</b></div>').join('') + '</div>' : '<p class="mute">Pas encore de tournoi joué.</p>');
  h += '<p style="margin-top:14px"><a href="#" data-a="golfer" data-id="' + id + '">‹ <span>Retour à la fiche</span></a></p>';
  return '<div class="narrow" style="max-width:860px">' + h + '</div>';
}
/* v393 : en haut du profil, à la place de la fiche (talents, cotes de jeu, début de carrière, personnalité, partis dans
   Stats et Biographie) : le parcours ligue par saison sur toute la largeur, puis la carte handicap et la progression
   niveau · potentiel côte à côte, à la même hauteur. Les trois restent aussi dans leurs onglets. */
function gTopBand(B, rsCh, cc) {
  const pan = (t, body, cls) => '<section class="dpn ' + cls + '"><header><span>' + t + '</span></header><div class="dpb">' + body + '</div></section>';
  const prog = B.prog ? B.prog.replace(/^<h3>[^<]*<\/h3>/, '') : '<p class="mute small" style="margin:0">Pas encore de courbe.</p>';
  let h = '<div class="gtop">';
  if (cc) return '<div class="gtop gccb">' + (rsCh ? pan('Parcours · ligue par saison', rsCh.replace(/<h3>Progression<\/h3>/, ''), 'gt-rs') : '') + pan('Progression · niveau et potentiel', prog, 'gt-pr') + '</div>';   // v429 : la carte handicap est montée à côté de la carte de collection
  if (rsCh) h += pan('Parcours · ligue par saison', rsCh.replace(/<h3>Progression<\/h3>/, ''), 'gt-rs');
  if (B.hc || B.prog) h += '<div class="gtop2">' + (B.hc ? pan('Carte handicap', B.hc, 'gt-hc') : '') + pan('Progression · niveau et potentiel', prog, 'gt-pr') + '</div>';
  return h + '</div>';
}
function vGolfer() {
  const id = VIEW.id, g = S.G[id], l = leagueOf(id), hist = golferHistory(id);
  if (g && !g.ph && GFX.faces.length && GFX.on) { try { if (phAssignAll()) persist(); } catch (e) { } }
  let h = '';
  const flagBadge = (g && g.nat) ? '<div style="position:absolute;top:14px;right:16px;filter:drop-shadow(0 2px 10px rgba(0,0,0,.5))" aria-hidden="true">' + flagVisual(g.nat, 62) + '</div>' : '';
  const hctx = (id === 0 ? 'Toi \u00b7 ' : '') + (g ? g.a + ' ans' + (g.nat ? ' \u00b7 ' + esc(g.nat) : '') : '') + (l >= 0 ? ' \u00b7 ' + LEAGUE_NAMES[l] : g && g.rcl ? ' \u00b7 <span>Classe de recrues</span> ' + yr(g.rcl) : '');
  const oldG0 = !g && id !== 0 && S.old ? S.old[id] : null, TR = golferTrophies(id);
  const earnAll = golferHistory(id, false, true).reduce((a, x) => a + (x.pay || 0), 0) || (g ? g.ce : oldG0 ? oldG0.ce : 0) || 0;   // v325 : gains de la Finale inclus
  const CC = g && isPC() && isMgr();   // v429 : sur ordinateur, carte de collection (photo + niveau) à gauche, saison et parcours à droite
  const T = g ? (CC ? '<div class="top gcc">' + levelCard(g, l, { name: nameOf(id), ctx: hctx, id, photo: 1, cc: 1 }) + '<div class="gccR">' + (seaPanel(id, l, TR, earnAll) || tzPanel(TR, earnAll, { active: true, cls: 'tzpc', pid: id })) + '%%GRS%%</div></div>' : '<div class="top lchead tzhead">' + levelCard(g, l, { name: nameOf(id), ctx: hctx, id, photo: 1 }) + (isPC() ? phFrameHTML(id, 'phpc') + (seaPanel(id, l, TR, earnAll) || tzPanel(TR, earnAll, { active: true, cls: 'tzpc', pid: id })) : tzSide(TR, earnAll)) + '</div>') + (!isPC() ? seaPanel(id, l, TR, earnAll, true) : '') + (VIEW.tzfull && (!isPC() || seaPanel(id, l, TR, earnAll)) ? tzPanel(TR, earnAll, { active: true, cls: 'tzmobfull', stats: true }) : '')
    : (oldG0 ? flagBadge + '<div class="top"><div><h1>' + esc(nameOf(id)) + '</h1><div class="ctx">Retrait\u00e9' + (oldG0.s ? ' en ' + yr(oldG0.s) : '') + (oldG0.a ? ' \u00e0 ' + oldG0.a + ' ans' : '') + (oldG0.nat ? ' \u00b7 ' + esc(oldG0.nat) : '') + '</div></div></div>' + tzPanel(TR, earnAll, { big: true, stats: true, cs: oldG0.cs, cls: 'tzret', pid: id }) : '') + (oldG0 ? '' : flagBadge + '<div class="top"><div><h1>' + esc(nameOf(id)) + '</h1><div class="ctx">' + (id === 0 ? 'Ton profil' + (!g && S.pk && S.pk.a ? ' \u00b7 ' + S.pk.a + ' ans' : '') + (g ? ' \u00b7 ' + g.a + ' ans' + (g.nat ? ' \u00b7 ' + flagVisual(g.nat, 20) + ' ' + esc(g.nat) : '') : '') : g ? g.a + ' ans' + (g.nat ? ' \u00b7 ' + flagVisual(g.nat, 20) + ' ' + esc(g.nat) : '') : 'Retrait\u00e9') + (l >= 0 ? ' \u00b7 ' + LEAGUE_NAMES[l] : '') + '</div>' + (id === 0 && !g && S.pk && S.pk.bio ? '<div class="ctx small">' + [S.pk.bio.ct ? '<span class="notr">' + esc(S.pk.bio.ct) + '</span>' : '', fmtHt(S.pk.bio.h), fmtWt(S.pk.bio.w), S.pk.bio.lf ? 'Gaucher' : 'Droitier'].filter(Boolean).join(' \u00b7 ') + '</div>' : '') + '</div></div>');   // v434 : identité du joueur manuel
  const oldG = !g && id !== 0 && S.old ? S.old[id] : null;
  const B = { seas: '', prog: g ? progressChart(g) : oldG && oldG.oh ? progressChart(oldG) : '', hc: '', traits: '', ret: '', season: '', pa: '', best: '', riv: '', car: '', bars: '', last: '', past: '', none: '' };
  const hcH = g || (id === 0 ? S.pk : oldG && oldG.hc ? oldG : null); if (hcH) B.hc = hcHTML(hcH, id);
  if (g) {   // v334 : régularité et carrière passent dans la fiche ; la forme n'apparaît que si ses résultats la montrent
    const f = CFG.showForm ? rForm(id) : null, rows = [];
    if (f && f.lv) rows.push('<div class="trow"><span>Forme</span><b class="' + (f.lv > 0 ? 'rsok' : 'rsko') + '">' + (f.lv > 0 ? '▲ ' : '▼ ') + RF_LBL[f.lv] + '</b></div><p class="small mute rfwhy">' + rfWhy(f) + '</p>');
    if (g.a >= 40 && l >= 0 && id !== 0) rows.push('<div class="trow"><span>Retraite</span><b>' + retireWord(retireHazard(g, l, (seasonRank(l, id) - 1) / Math.max(1, S.L[l].length - 1), g.sg || 0, worldRanks()[id])) + '</b></div>');
    if (l === 3 && id !== 0 && g.y4) rows.push('<div class="trow"><span>Ligue 4</span><span><b>' + g.y4 + ' saison' + (g.y4 > 1 ? 's' : '') + ' de suite</b>' + (forcedRisk(g, l) ? '<span class="small" style="display:block;color:var(--bad)">Dernière chance de monter</span>' : '') + '</span></div>');
    if (rows.length) B.traits = '<div class="block traits">' + rows.join('') + '</div>';
  }
  if (!g && id !== 0 && S.old[id] && S.old[id].nc) { const o = S.old[id]; B.ret = '<div class="block"><b>N\u2019a pas obtenu sa carte</b> \u00e0 la fin de la classe de recrues ' + yr(o.s) + (o.nat ? ' (' + flagVisual(o.nat, 18) + ' ' + esc(o.nat) + ')' : '') + '.</div>'; }
  else if (!g && id !== 0 && S.old[id]) { const o = S.old[id]; B.ret = '<div class="block"><b>Retrait\u00e9</b>' + (o.f ? ' <span>(retraite forc\u00e9e apr\u00e8s ' + fL4N(o.f) + ' saisons en Ligue 4)</span>' : '') + ' \u00e0 ' + o.a + ' ans' + (o.nat ? ' (' + flagVisual(o.nat, 18) + ' ' + esc(o.nat) + ')' : '') + ', \u00e0 la fin de la saison ' + yr(o.s) + (o.cs ? ' \u00b7 ' + o.cs + ' saison' + (o.cs > 1 ? 's' : '') + ' de carri\u00e8re' : '') + (o.cw ? ' \u00b7 ' + o.cw + ' titre' + (o.cw > 1 ? 's' : '') : '') + (o.ce ? ' \u00b7 ' + fmtMoney(o.ce) + ' en carri\u00e8re' : '') + (o.l != null ? ' \u00b7 derni\u00e8re ligue : ' + LEAGUE_SHORT[o.l] : '') + '.</div>'; }
  if (l >= 0) { const st = Object.assign({}, getSt(id), lgSt(id)); B.season = '<div class="block"><b>Saison ' + yr(S.season) + '</b> : ' + ord(seasonRank(l, id)) + ' avec ' + st.pts + ' points \u00b7 ' + st.w + ' victoire' + (st.w > 1 ? 's' : '') + ' \u00b7 ' + st.t10 + ' top 10 \u00b7 ' + st.mc + ' coupure' + (st.mc > 1 ? 's' : '') + ' rat\u00e9e' + (st.mc > 1 ? 's' : '') + exLineHTML(id, l) + '</div>'; }
  const past = [];
  S.hist.forEach(H => {
    if (!H.end || H.s <= careerStart(id)) return;
    if ((H.end.midMoves || []).some(m => m.id === id)) {   // déplacé en cours de saison : une ligne par ligue traversée, dans l'ordre, reconstituée tournoi par tournoi
      const segs = [];
      H.t.forEach(t => { if (!t) return; for (let L = 0; L < 4; L++) { const r = t.lg[L].rows.find(x => x[0] === id); if (r) { const sg = segs[segs.length - 1]; if (sg && sg.l === L) { sg.pts += r[4]; sg.n++; } else segs.push({ l: L, pts: r[4], n: 1 }); break; } } });
      const mm = (H.end.midMoves || []).filter(m => m.id === id);
      segs.forEach((sg, i) => {
        const nx = segs[i + 1], last = i === segs.length - 1;
        const fi = H.end.tables[sg.l].findIndex(r => r[0] === id && (last ? !r[5] : !!r[5]));
        past.push({ s: H.s, l: sg.l, rank: fi >= 0 ? fi + 1 : null, pts: sg.pts, n: sg.n, partial: !(fi >= 0), up: nx ? nx.l < sg.l : !!(H.end.up[sg.l] || []).includes(id), dn: nx ? nx.l > sg.l : !!(H.end.down[sg.l] || []).includes(id), mid: !last, why: nx ? [(mm[i] && mm[i].reason) || '', 'en cours de saison'] : (fi >= 0 ? [ord(fi + 1) + ' sur ' + H.end.tables[sg.l].length, 'fin de saison'] : null) });
      });
      return;
    }
    for (let L = 0; L < 4; L++) { const i = H.end.tables[L].findIndex(r => r[0] === id); if (i >= 0) { const r = H.end.tables[L][i]; past.push({ s: H.s, l: L, rank: i + 1, pts: r[1], partial: false, up: H.end.up[L].includes(id), dn: H.end.down[L].includes(id), why: [ord(i + 1) + ' sur ' + H.end.tables[L].length, 'fin de saison'] }); } }
  });
  const earnBySL = {}, nBySL = {}; hist.forEach(x => { const k = x.s + '-' + x.l; earnBySL[k] = (earnBySL[k] || 0) + (x.pay || 0); nBySL[k] = (nBySL[k] || 0) + 1; });
  let rsCh = '';   // v393 : graphique « parcours » (ligue par saison), aussi affiché en haut du profil
  if (hist.length) {
    const wins = hist.filter(x => x.pos === 1).length, t10 = hist.filter(x => x.pos > 0 && x.pos <= 10).length, mc = hist.filter(x => x.mc).length, made = hist.filter(x => x.pos > 0 && !x.mc);
    const earn = hist.reduce((a, x) => a + (x.pay || 0), 0);
    const by = [0, 1, 2, 3].map(() => ({ n: 0, w: 0, t10: 0, t20: 0, mc: 0, best: null, rank: null }));
    hist.forEach(x => { const b = by[x.l]; b.n++; if (x.pos === 1) b.w++; if (x.pos > 0 && x.pos <= 10) b.t10++; if (x.pos > 0 && x.pos <= 20) b.t20++; if (x.mc) b.mc++; if (x.pos > 0 && (b.best === null || x.pos < b.best)) b.best = x.pos; });
    past.forEach(p => { if (p.rank === null) return; const b = by[p.l]; if (b.rank === null || p.rank < b.rank) b.rank = p.rank; });
    const cols = [0, 1, 2, 3].filter(L => by[L].n > 0), dash = '\u2013';
    const brow = (label, f) => '<tr><td>' + label + '</td>' + cols.map(L => { const v = f(by[L]); return '<td class="r' + (v === 0 || v === dash ? ' mute' : '') + '">' + v + '</td>'; }).join('') + '</tr>';
    { const ph = hcHolder(id) || (S.old && S.old[id]); B.pa = paHTML(ph && ph.pa, hist.length ? hist[0].s : null); }
    B.best = bestScoresHTML(id); B.riv = rivalsHTML(id);
    { const RR = rsRows(id, past, l), bk = rsBestKey(RR), ch = rsChartHTML(RR, bk, id); rsCh = ch;   // v333
      B.carIn = rsCareerHTML(id, by, cols, RR, bk, earnAll) + bigWinsHTML(id);   // v452 : carrière dans l'aperçu (ordinateur)
      B.car = '<h2>Carri\u00e8re</h2><div class="carl">' + rsCareerHTML(id, by, cols, RR, bk, earnAll) + bigWinsHTML(id) + '</div>' + (ch ? '<div class="carr">' + ch + '</div>' : ''); }
    const last = hist.slice(-24), maxp = 100;
    B.bars = '<h3>Points par tournoi</h3><div class="bars" role="img" aria-label="Points gagn\u00e9s lors des derniers tournois">' + last.map(x => '<i class="' + (x.pos === 0 ? 'mc' : '') + '" style="height:' + Math.max(4, Math.round(x.pts / maxp * 100)) + '%" title="' + esc(x.name) + ' : ' + x.pts + ' pts"></i>').join('') + '</div><div class="small mute">Les barres rouges sont des coupures rat\u00e9es.</div>';
    // v238 : R1 / R2 m\u00e8nent \u00e0 la carte de cette ronde (golfeur \u00e9pingl\u00e9 en haut), le total au tournoi
    const rlnk = (x, m, txt) => '<a href="#" class="rlk" data-a="tourn" data-s="' + x.s + '" data-t="' + x.t + '" data-l="' + x.l + '" data-m="' + m + '" data-fid="' + id + '" title="' + (m === 'res' ? 'Voir le tournoi' : 'Voir la carte de scores') + '">' + txt + '</a>';
    B.last = '<h3>Derniers r\u00e9sultats</h3><div class="scroll"><table class="plain"><tr><th>Saison</th><th>Tournoi</th><th class="r">Pos</th><th class="r">R1</th><th class="r">R2</th><th class="r">Total</th><th class="r">Pts</th><th class="r">Gains</th></tr>' + hist.slice(-12).reverse().map(x => {
      const tot = x.r2 !== null ? x.r1 + x.r2 : x.pos > 0 ? x.r1 : null;   // tournoi d'une ronde : le total est la ronde
      return '<tr><td>S' + yr(x.s) + ' \u00b7 L' + (x.l + 1) + '</td><td>' + esc(x.name) + '</td><td class="r">' + (x.pos === 0 ? 'CUT' : x.pos) + '</td><td class="r ' + cls(x.r1) + '">' + rlnk(x, 'c1', fmt(x.r1)) + '</td><td class="r ' + (x.r2 !== null ? cls(x.r2) : '') + '">' + (x.r2 === null ? '\u2013' : rlnk(x, 'c2', fmt(x.r2))) + '</td><td class="r ' + (tot !== null ? cls(tot) : '') + '">' + rlnk(x, 'res', tot === null ? '\u2013' : fmt(tot)) + '</td><td class="r">' + x.pts + '</td><td class="r">' + (x.pay ? fmtMoney(x.pay) : '\u2013') + '</td></tr>';
    }).join('') + '</table></div>';
  }
  B.seas = seasonsHTML(id, past, l);
  if (past.length) B.past = '<h3>Saisons pass\u00e9es</h3><div class="scroll"><table class="plain pastt"><tr><th>Saison</th><th>Ligue</th><th class="r" title="Tournois jou\u00e9s dans cette ligue">Tourn.</th><th class="r">Rang</th><th class="r">Pts</th><th class="r" title="Moyenne de points par tournoi">Moy.</th><th class="r">Gains</th><th></th></tr>' + past.reverse().map(p => '<tr><td>' + yr(p.s) + '</td><td>L' + (p.l + 1) + '</td><td class="r">' + (nBySL[p.s + '-' + p.l] || p.n || '\u2013') + '</td><td class="r">' + (p.rank === null ? '\u2013' : p.rank) + '</td><td class="r">' + (p.partial ? '(' + p.pts + ')' : p.pts) + '</td><td class="r">' + pastAvg(p, nBySL) + '</td><td class="r">' + (earnBySL[p.s + '-' + p.l] ? fmtMoney(earnBySL[p.s + '-' + p.l]) : '\u2013') + '</td><td class="r">' + pastTag(p) + '</td></tr>' + pastWhyRow(p)).join('') + '</table></div>';
  if (!hist.length && l < 0) B.none = '<p class="mute">Aucun r\u00e9sultat enregistr\u00e9.</p>';
  /* Onglets du profil : la carte du golfeur reste en haut ; l'onglet choisi est gard\u00e9 d'un golfeur \u00e0 l'autre (PTAB). */
  const TABS = [
    ['ov', 'Aper\u00e7u', (isMgr() ? golferOvMgr(id, B, hist, l) : '<div class="pov"><div>' + hofProfileHTML(id, true) + bigWinsHTML(id) + B.season + (wrChartHTML(id) ? '<div class="block"><h3 style="margin-top:0">World Ranking</h3>' + wrChartHTML(id) + '</div>' : '') + radarHTML(id) + B.ret + famProfileHTML(id) + B.traits + B.bars + (B.last ? '<p style="margin:10px 0 0"><a href="#" data-a="ptab" data-v="res">Tous les r\u00e9sultats et la carri\u00e8re \u2192</a></p>' : '') + B.none + '</div><div>' + B.prog + '</div></div>')],
    ['res', 'R\u00e9sultats', hofProfileHTML(id) + (B.car ? '<div class="rscar">' + B.car + '</div>' : '') + B.seas],
    ['tl', 'Chronologie', tlHTML(id)],
    ['log', isPC() ? 'Carnet de tournois' : 'Carnet', tlogHTML(id)],
    ['stats', 'Stats', charBlock(id, 'jeu') + skStatsHTML(id) + B.hc + B.pa + B.best],
    ['riv', 'Rivaux', B.riv],
    ['bio', 'Biographie', charBlock(id, 'bio') + plBioHTML(id)]
  ].filter(t => t[2]);
  const cur = TABS.find(t => t[0] === PTAB) || TABS[0];
  const bar = TABS.length > 1 ? '<div class="ptabs" role="tablist">' + TABS.map(t => '<button class="ptab" role="tab" data-a="ptab" data-v="' + t[0] + '" aria-selected="' + (t === cur) + '">' + t[1] + '</button>').join('') + '</div>' : '';
  h = cur ? cur[2] : '';
  h += '<button class="btn sec" data-a="backview" style="margin-top:14px">Retour</button>';
  const MP = !g && id === 0 && S.mode !== 'sim' && S.pk && isPC() && isMgr(), gg = g || (MP ? { a: S.pk.a, nat: natOf(0) } : null);   // v452 : ton golfeur manuel a aussi la nouvelle fiche
  if (CC || MP) return gHeadPC(id, gg, l) + geBlock(id) + bar + '<div class="pcols one">' + (cur && cur[0] === 'ov' ? gDashPC(id, gg, l, B, hist, rsCh, TR, earnAll) : h) + '</div>';   // v452 : fiche refaite (bandeau + onglets + tableau de bord)
  const T2 = T.indexOf('%%GRS%%') >= 0 ? T.replace('%%GRS%%', B.hc ? '<section class="dpn gt-hc gcchc"><header><span>Carte handicap</span></header><div class="dpb">' + B.hc + '</div></section>' : '') : T;
  return T2 + wlBar(id) + geBlock(id) + gTopBand(B, rsCh, T2 !== T) + bar + '<div class="pcols' + (cur && (cur[0] === 'riv' || cur[0] === 'res' || cur[0] === 'ov' || cur[0] === 'log' || cur[0] === 'tl' || cur[0] === 'bio') ? ' one' : '') + '">' + h + '</div>';
}



/* v452 : fiche du golfeur sur ordinateur, inspirée de Football Manager et d'OOTP (demande de Max) : un bandeau en haut
   (photo, identité, niveau, potentiel et 4 chiffres clés), les onglets juste dessous, puis l'aperçu en tableau de bord
   sur un écran : le golfeur à gauche, la saison et le jeu au centre, les graphiques (au choix) et la carrière à droite. */
function gHeadPC(id, g, l) {
  const man = id === 0 && S.mode !== 'sim', ti = man ? 0 : tierOf(g), c = man ? '#4E9A3A' : TIER_HEX[ti], vet = g.a >= 31, pot = man ? '' : vet ? TIERS[peakTierOf(g)][1] : POTS[potOf(g)][1], b = bioOf(id) || {}, hc = hcAt(id), wr = wrPub(id), st = getSt(id), rk = l >= 0 ? (displayRank(l).filter(r => !r.gh).findIndex(r => r.id === id) + 1) || null : null;   // même rang que la carte de saison
  const ini = nameOf(id).split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase(), tr = man ? null : trendLabel(g);
  const ctx = [g.nat ? flagVisual(g.nat, 18) + ' <span class="notr">' + esc(g.nat) + '</span>' : '', g.a + ' ans', l >= 0 ? LEAGUE_NAMES[l] : g.rcl ? '<span>Classe de recrues</span> ' + yr(g.rcl) : '', b.ct ? '<span class="notr">' + esc(b.ct) + '</span>' : '', b.lf != null ? (b.lf ? 'Gaucher' : 'Droitier') : '', b.h ? fmtHt(b.h) : '', b.w ? fmtWt(b.w) : ''].filter(Boolean).join(' · ');
  const num = (v, k) => '<div class="ghn"><b>' + v + '</b><span>' + k + '</span></div>';
  return '<div class="ghead" style="--gc:' + c + '"><div class="ghph">' + (phFrameHTML(id, 'phgh') || '<div class="ghini">' + esc(ini) + '</div>') + '</div><div class="ghid"><h1>' + (id === 0 ? '<span class="ofpill">Toi</span> ' : '') + esc(nameOf(id)) + '</h1><div class="ghctx">' + ctx + '</div>' +
    (man ? '' : '<div class="ghchips"><span class="ghtier">' + TIERS[ti][1] + '</span><span class="ghpot"><span>' + (vet ? 'Sommet' : 'Potentiel') + '</span> · <b>' + pot + '</b></span>' + (tr ? '<span class="ghtr">' + (tr.indexOf('progression') >= 0 ? '▲ ' : tr.indexOf('déclin') >= 0 ? '▼ ' : '') + tr + '</span>' : '') + (g.ph && g.phR ? '<span class="ghtr">⚡ Phénomène</span>' : '') + '</div>') + '</div>' +
    '<div class="ghnums">' + num(hc != null ? fmtHI(hc) : '–', 'Handicap') + num(wr ? '#' + wr : 'NC', 'World Ranking') + num(rk ? ord(rk) : '–', l >= 0 ? 'Rang en L' + (l + 1) : 'Rang') + num(st.pts || 0, 'Points ' + yr(S.season)) + '</div><div class="ghwl">' + wlBar(id) + '</div></div>';
}
function gDashPC(id, g, l, B, hist, rsCh, TR, earnAll) {
  const b = bioOf(id) || {}, tr = id !== 0 && trOn() ? trOf(g) : null, m = b && MEDIA_BY[b.pm], ti = id === 0 && S.mode !== 'sim' ? 0 : tierOf(g), vet = g.a >= 31;
  const row = (k, v) => v ? '<tr><td>' + k + '</td><td>' + v + '</td></tr>' : '';
  const stars = '<span class="lcst" aria-label="Palier ' + (ti + 1) + ' sur 9">' + '★'.repeat(ti + 1) + '<span>' + '★'.repeat(8 - ti) + '</span></span>';
  const man = id === 0 && S.mode !== 'sim';
  const LVL = (man ? '' : '<div class="gdlv"><div><span>Niveau actuel</span>' + stars + '<b>' + TIERS[ti][1] + '</b><small>' + ageLabel(g.a) + '</small></div><div><span>' + (vet ? 'Sommet en carrière' : 'Potentiel') + '</span><b class="pot">' + (vet ? TIERS[peakTierOf(g)][1] : POTS[potOf(g)][1]) + '</b></div></div>'), PERSO = '<table class="gdtb">' + row('Pays', g.nat ? flagVisual(g.nat, 16) + ' <span class="notr">' + esc(g.nat) + '</span>' : '') + row('Ville natale', b.ct ? '<span class="notr">' + esc(b.ct) + '</span>' : '') + row('Âge', String(g.a)) + row('Taille', b.h ? fmtHt(b.h) : '') + row('Poids', b.w ? fmtWt(b.w) : '') + row('Main', b.lf != null ? (b.lf ? 'Gaucher' : 'Droitier') : '') +
    row('Tempérament', tr ? TP_ICO[tr.tp - 1] + ' ' + TP_LBL[tr.tp - 1] : '') + row('Fin de tournoi', tr ? MC_ICO[tr.mc - 1] + ' ' + MC_LBL[tr.mc - 1] : '') + row('Personnalité', m ? '🎤 ' + m.fr : '') + '</table>';
  const fam = famProfileHTML(id).replace(/^<div class="block famblk"><h3 style="margin-top:0">Famille<\/h3>/, '<div class="gfam">');
  const wins = hist.filter(x => x.pos === 1).length, t10 = hist.filter(x => x.pos > 0 && x.pos <= 10).length, made = hist.filter(x => x.pos > 0).length;
  let hp = null; try { const P = hofLedger()[hofCurKey(id)]; hp = P ? P.pts : 0; } catch (e) { }
  const big = (v, k, c) => '<div><b' + (c ? ' style="color:' + c + '"' : '') + '>' + v + '</b><span>' + k + '</span></div>';
  const wr = wrPub(id), nS = new Set(hist.map(x => x.s)).size;
  // Colonne 1 : cette saison, puis les classements
  let c1 = (seaPanel(id, l, TR, earnAll) || tzPanel(TR, earnAll, { active: true, cls: 'tzpc', pid: id }));
  c1 += dPanel('Points par tournoi', (B.bars ? '<div class="gbars">' + B.bars.replace(/^<h3>[^<]*<\/h3>/, '') + '</div>' : '<p class="mute small" style="padding:12px 14px;margin:0">Aucun tournoi pour l’instant.</p>') + (hist.length ? '<div class="dst3 g4"><div><b>' + wins + '</b><span>Victoires</span></div><div><b>' + t10 + '</b><span>Top 10</span></div><div><b>' + made + '/' + hist.length + '</b><span>Coupures</span></div><div><b>' + (hp == null ? '–' : hp) + '</b><span>Points Temple</span></div></div>' : ''), '<a href="#" data-a="ptab" data-v="res">Tous les résultats →</a>', 'gd-bars');
  const wrc = wrChartHTML(id);
  c1 += dPanel('Classements', '<div class="gdbig">' + big(wr ? '#' + wr : 'NC', 'World Ranking') + big(l >= 0 ? LEAGUE_NAMES[l] : '–', 'Ligue actuelle') + big(nS, nS > 1 ? 'saisons' : 'saison') + '</div>' + (rsCh ? '<div class="gdch">' + rsCh.replace(/<h3>Progression<\/h3>/, '') + '</div>' : '') + (wrc ? '<div class="gdch">' + wrc + '</div>' : ''), '', 'gd-cls');
  // Colonne 2 : niveau et potentiel, puis handicap et statistiques
  let c2 = '';
  if (LVL || B.prog) c2 += dPanel('Niveau et potentiel', LVL + (B.prog ? '<div class="gdch">' + B.prog.replace(/^<h3>[^<]*<\/h3>/, '') + '</div>' : ''), '', 'gd-lv');
  const rad = (radarHTML(id) || '').replace(/^<div class="block radblk"><h3>Profil statistique<\/h3>/, '<div class="radblk gpr">');
  c2 += dPanel('Handicap et statistiques', (B.hc ? '<div class="gdch">' + B.hc + '</div>' : '') + (rad ? '<div class="gdch">' + rad + '</div>' : ''), '<a href="#" data-a="ptab" data-v="stats">Toutes les stats →</a>', 'gd-hc');
  // Colonne 3 : carrière, puis le golfeur
  let c3 = '';
  const plb = plBest(id), car = (B.carIn || '') + (plb ? '<div class="apvbest">⭐ <span>Meilleur rang d’espoir</span> <b>n° ' + plb[1] + '</b> · ' + yr(plb[0]) + '</div>' : ''), hof = hofProfileHTML(id, true);
  if (car || hof) c3 += dPanel('Carrière', '<div class="gdcar">' + hof + car + '</div>', '<a href="#" data-a="ptab" data-v="tl">Toute la chronologie →</a>', 'gd-car');
  const jeu = charBlock(id, 'jeu');
  c3 += dPanel('Le golfeur', PERSO + (jeu ? jeu.replace('<div class="block chblk', '<div class="chblk') : '') + (fam ? '<div class="gdsub"><h4>Famille</h4>' + fam + '</div>' : '') + (B.traits ? B.traits.replace('<div class="block traits">', '<div class="traits gtraits">') : ''), '', 'gd-me');
  if (B.ret) c3 += B.ret;
  return '<div class="gdash2"><div class="gdc">' + c1 + '</div><div class="gdc">' + c2 + '</div><div class="gdc">' + c3 + '</div></div>';
}
/* ---- Fiche golfeur, onglet Aperçu, style gestionnaire (v195) : mêmes infos, rangées en panneaux ---- */
function golferOvMgr(id, B, hist, l) {
  const noH3 = s => (s || '').replace(/^<h3>[^<]*<\/h3>/, '');
  let side = '';
  if (B.season) side += B.season.replace('<div class="block">', '<div class="gseason">');
  side += bigWinsHTML(id);
  if (B.ret) side += B.ret.replace('<div class="block">', '<div class="gseason">');
  if (B.traits) side += B.traits.replace('<div class="block traits">', '<div class="traits gtraits">');
  const fam = famProfileHTML(id).replace(/^<div class="block famblk"><h3 style="margin-top:0">Famille<\/h3>/, '<div class="gfam">');
  const wins = hist.filter(x => x.pos === 1).length, w1 = hist.filter(x => x.pos === 1 && x.l === 0).length, t10 = hist.filter(x => x.pos > 0 && x.pos <= 10).length, made = hist.filter(x => x.pos > 0).length;
  let hp = null; try { const P = hofLedger()[hofCurKey(id)]; hp = P ? P.pts : 0; } catch (e) { }
  const st3 = hist.length ? '<div class="dst3 g4"><div><b>' + wins + '</b><span>Victoires</span></div><div><b>' + t10 + '</b><span>Top 10</span></div><div><b>' + made + '/' + hist.length + '</b><span>Coupures</span></div><div><b>' + (hp == null ? '–' : hp) + '</b><span>Pts Temple</span></div></div>' : '';
  let x = '<div class="gdash">';
  const rcP = '';   // v334 : le début de carrière est dans la fiche du golfeur
  x += '<div class="gcol">' + dPanel(l >= 0 ? 'Saison ' + yr(S.season) : 'Carrière', side || '<p class="mute small" style="padding:12px 14px;margin:0">Aucune donnée pour cette saison.</p>', '', 'gp-s') + rcP + '</div>';
  x += dPanel('Points par tournoi', (B.bars ? '<div class="gbars">' + noH3(B.bars) + '</div>' : '<p class="mute small" style="padding:12px 14px;margin:0">' + (B.none ? 'Aucun résultat enregistré.' : 'Aucun tournoi joué.') + '</p>') + st3, B.last ? '<a href="#" data-a="ptab" data-v="res">Tous les résultats →</a>' : '', 'gp-b');
  { const rd = radarHTML(id); if (rd) x += dPanel('Profil statistique', rd.replace(/^<div class="block radblk"><h3>Profil statistique<\/h3>/, '<div class="radblk gpr">'), '<a href="#" data-a="ptab" data-v="stats">Toutes les stats</a>', 'gp-r'); }
  x += dPanel('Progression', B.prog ? '<div class="gprog">' + noH3(B.prog) + '</div>' : '<p class="mute small" style="padding:12px 14px;margin:0">Pas encore de courbe.</p>', '<span class="gsm">Niveau · Potentiel</span>', 'gp-p');
  { const wr = wrChartHTML(id); if (wr) x += dPanel('World Ranking', '<div style="padding:10px 14px">' + wr + '</div>', '', 'gp-w'); }
  if (fam) x += dPanel('Famille', fam, '', 'gp-f');
  return hofProfileHTML(id, true) + x + '</div>';
}

/* ---- Records ---- */
/* ---- Page Records ---- */
const REC_SEC = { streakWin: 'w', streakT10: 't', streakCut: 'c' };
function recTagOf(key) {
  if (key.charAt(1) === ':') { const k = +key.slice(2); return k < (S.playerCareers || []).length ? { t: 'ancienne carri\u00e8re' } : { t: 'toi', on: 1 }; }
  return S.G[key] ? { t: 'actif', on: 1 } : { t: 'retrait\u00e9' };
}
function recLinkId(key) { if (key.charAt(1) === ':') return +key.slice(2) < (S.playerCareers || []).length ? null : 0; return +key; }
const recWhen = e => 'S' + yr(e.s) + ' T' + (e.t + 1);
function recSubLC(d, e, l) {
  if (d.k === 'wins' || d.k === 't10' || d.k === 't20') return e.pl + ' tournoi' + (e.pl > 1 ? 's' : '') + ' jou\u00e9' + (e.pl > 1 ? 's' : '') + ' en ' + LEAGUE_SHORT[l];
  if (d.k === 'seasonWins' || d.k === 'seasonPts') return 'Saison ' + yr(e.s);
  if (REC_SEC[d.k]) { const f = e.from; return 'S' + yr(f[0]) + ' T' + (f[1] + 1) + (f[0] === e.s && f[1] === e.t ? '' : ' \u2192 ' + recWhen(e)); }
  return recWhen(e) + ' \u00b7 ' + esc(e.c);
}
function recSeasonCounts() { const m = {}; Object.keys(REC.G.se).forEach(k => { const key = REC.G.se[k].key; m[key] = (m[key] || 0) + 1; }); return m; }
function recRow(i, e, d, sub, extraTag) {
  let nm;
  if (e.key === null) nm = esc(e.c);
  else { const lid = recLinkId(e.key), n = esc(recKeyName(e.key)); nm = lid === null ? n : '<a href="#" data-a="golfer" data-id="' + lid + '">' + n + '</a>'; }
  const tg = e.key === null ? null : recTagOf(e.key);
  return '<div class="rrow"><span class="rrk">' + (i + 1) + '</span><span class="rnm">' + nm + (tg ? ' <span class="rtg' + (tg.on ? ' on' : '') + '">' + tg.t + '</span>' : '') + (extraTag ? ' <span class="rtg on">' + extraTag + '</span>' : '') + '<span class="rsub">' + sub + '</span></span><span class="rvv">' + d.f(e.v) + '</span></div>';
}
function recCard(d, entries, subFn, tagFn) {
  let h = '<div class="block reccard"><h3>' + esc(d.t) + '</h3>';
  if (!entries.length) return h + '<p class="emrec"><span aria-hidden="true">🏆</span><span>Libre : à toi de l’établir !</span></p></div>';
  const rows = entries.map((e, i) => recRow(i, e, d, subFn(e), tagFn ? tagFn(e) : ''));
  h += rows.slice(0, 3).join('');
  if (rows.length > 3) h += detailsBox(rows.length >= RECN ? 'Voir le top ' + RECN : 'Voir les ' + (rows.length - 3) + ' autres', rows.slice(3).join(''));
  return h + '</div>';
}
function vRecords() {
  const sub = VIEW.rv || 'records';
  let h = '<div class="top"><h1>Historique</h1></div>' + chipRow([['records', 'Records'], ['hof', 'Temple'], ['rc', 'Cuvées'], ['arch', 'Archives des entre-saisons'], ['pl', '⭐ Top Prospects']].concat(isPC() ? [] : [['alm', 'Almanac']]), sub, 'rv');
  return h + (sub === 'pl' ? vPlHist() : sub === 'arch' ? vArchives() : sub === 'hof' ? vHof() : sub === 'rc' ? vRcIndex() : vRecordsBoard());
}
function vArchives() {
  const l = JV.l == null ? vLg() : JV.l;
  let h = '<div class="ctx" style="margin-top:6px">R\u00e9sum\u00e9s de la ligue :</div>' + chipRow(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1)]), l, 'jl');
  const hs = S.hist.slice().reverse().filter(H => H.end);
  if (!hs.length) return h + '<p class="mute">Aucune intersaison termin\u00e9e pour l\u2019instant.</p>';
  const shown = JV.all ? hs : hs.slice(0, 10);
  let rs = '';
  shown.forEach(H => {
    const champ = H.end.tables[l] && H.end.tables[l][0];
    rs += '<a href="#" class="jrow" data-a="seasonrecap" data-f="arch" data-s="' + H.s + '">' + ico('cal') + '<div><div class="jt">Intersaison ' + yr(H.s) + ' \u2192 ' + yr(H.s + 1) + '</div><div class="jd">' + (champ ? 'Champion ' + LEAGUE_SHORT[l] + ' : ' + esc(nameOf(champ[0])) + ' \u00b7 ' : '') + H.end.retired + ' retraite' + (H.end.retired > 1 ? 's' : '') + (H.end.x ? ' \u00b7 ' + H.end.x.tc.length + ' changements de palier' : '') + '</div></div><span class="jc" aria-hidden="true">\u203a</span></a>';
  });
  h += '<div class="block jbl">' + rs + '</div>';
  if (!JV.all && hs.length > 10) h += '<button class="btn sec" data-a="jmore" style="margin-top:10px">Afficher les saisons plus anciennes</button>';
  return h;
}
function vRecordsBoard() {
  const rc = VIEW.rc == null ? 'C' : VIEW.rc;
  let h = chipRow([['C', 'Carri\u00e8re'], [0, 'L1'], [1, 'L2'], [2, 'L3'], [3, 'L4'], ['M', 'Moi']], rc, 'rc');
  const B = recBoards(RECN);
  if (rc === 'M') {
    const P = personalRecords();
    if (!P.n) return h + '<p class="mute">Joue ton premier tournoi pour commencer ta liste de records.</p>';
    const it = (t, v, sub, c) => '<li><div><div class="rt">' + t + '</div>' + (sub ? '<div class="small mute">' + sub + '</div>' : '') + '</div><div class="rv ' + (c || '') + '">' + v + '</div></li>';
    h += '<ul class="recs">' +
      it('Meilleure ronde', P.best === null ? '\u2013' : fmt(P.best), '', P.best !== null ? cls(P.best) : '') +
      it('Meilleur total (2 rondes)', P.tot === null ? '\u2013' : fmt(P.tot), '', P.tot !== null ? cls(P.tot) : '') +
      it('Meilleur r\u00e9sultat', P.fin ? (P.fin.pos === 1 ? '1er' : ord(P.fin.pos)) : '\u2013', P.fin ? 'S' + yr(P.fin.s) + ' T' + (P.fin.t + 1) + ' \u00b7 ' + esc(P.fin.name) : '') +
      it('Meilleure saison', P.sp ? P.sp.v + ' pts' : '\u2013', P.sp ? 'Saison ' + yr(P.sp.s) : '') +
      it('Trous d\u2019un coup', S.pk.ace || 0) + it('Albatros', S.pk.alb || 0) + it('Victoires', P.wins) + it('Top 10', P.t10) + it('Coupures rat\u00e9es', P.mc, P.n + ' tournois jou\u00e9s') +
      it('Coupures r\u00e9ussies d\u2019affil\u00e9e', P.streaks[0], 'S\u00e9rie en cours : ' + P.cur[0]) + it('Top 10 d\u2019affil\u00e9e', P.streaks[1], 'S\u00e9rie en cours : ' + P.cur[1]) + '</ul>';
    const me = recMyKey(), held = [], places = [];
    for (let l = 0; l < 4; l++) REC_LT.concat(REC_LC).forEach(d => { const i = B.L[l][d.k].findIndex(e => e.key === me); if (i === 0) held.push(d.t + ' (' + LEAGUE_SHORT[l] + ')'); if (i >= 0) places.push({ t: LEAGUE_SHORT[l] + ' \u00b7 ' + d.t, i, v: d.f(B.L[l][d.k][i].v) }); });
    REC_G.forEach(d => { const i = B.G[d.k].findIndex(e => e.key === me); if (i === 0) held.push(d.t); if (i >= 0) places.push({ t: 'Global \u00b7 ' + d.t, i, v: d.f(B.G[d.k][i].v) }); });
    h += '<h2>Records d\u00e9tenus</h2>' + (held.length ? '<ul class="news">' + held.map(x => '<li>\u2605 ' + esc(x) + '</li>').join('') + '</ul>' : '<p class="mute">Aucun record de ligue ou de carri\u00e8re pour l\u2019instant.</p>');
    if (places.length) h += '<h2>Mes places dans les top ' + RECN + '</h2><ul class="news">' + places.map(x => '<li>' + esc(x.t) + ' : <b>' + (x.i === 0 ? '1er' : ord(x.i + 1)) + '</b> (' + x.v + ')</li>').join('') + '</ul>';
    return h;
  }
  if (rc === 'C') {
    const sub = VIEW.rcs == null ? 'G' : VIEW.rcs;
    h += chipRow([['G', 'Global']].concat(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1)])), sub, 'rcs');
    if (sub === 'G') {
      const sc = recSeasonCounts();
      h += '<p class="small mute">Argent et exploits rares, toutes ligues confondues. Retrait\u00e9s et anciennes carri\u00e8res inclus.</p>' + REC_G.map(d => recCard(d, B.G[d.k], e => {
        if (d.k === 'earn') return sc[e.key] + ' saison' + (sc[e.key] > 1 ? 's' : '');
        if (d.k === 'seasonEarn') return 'Saison ' + yr(e.s);
        if (d.k === 'bigCheck') return recWhen(e) + ' \u00b7 ' + esc(e.c) + ' \u00b7 ' + LEAGUE_SHORT[e.l];
        return 'dernier : ' + recWhen(e) + ' \u00b7 ' + LEAGUE_SHORT[e.l];
      })).join('');
    } else {
      h += '<p class="small mute">Compt\u00e9s seulement en ' + LEAGUE_NAMES[sub] + '. Une s\u00e9rie repart \u00e0 z\u00e9ro quand on change de ligue.</p>' + REC_LC.map(d => recCard(d, B.L[sub][d.k], e => recSubLC(d, e, sub),
        REC_SEC[d.k] ? e => { const c = REC.cur[e.key]; return c && c.l === sub && c[REC_SEC[d.k]] === e.v && c.last && REC.last && c.last[0] === REC.last[0] && c.last[1] === REC.last[1] ? 'en cours' : ''; } : null)).join('');
    }
    return h;
  }
  h += '<p class="small mute">Compar\u00e9s seulement aux scores de la m\u00eame ligue.</p><h2>' + LEAGUE_NAMES[rc] + '</h2>' + REC_LT.map(d => recCard(d, B.L[rc][d.k], e => {
    if (d.k === 'lowCut' || d.k === 'highCut') return recWhen(e) + (e.top ? ' \u00b7 <span>ligne top ' + e.top + '</span>' : '');   // v378 : tournoi d'une ronde = ligne de paye
    return recWhen(e) + ' \u00b7 ' + esc(e.c) + (e.r ? ' \u00b7 R' + e.r : '');
  })).join('');
  return h;
}

/* ---- Terrains ---- */
function holeGrid(action, i, arr, opts) {
  opts = opts || {};
  const dis = opts.locked ? ' disabled' : '';
  let h = '';
  [0, 9].forEach(o => { h += '<div class="pars">' + arr.slice(o, o + 9).map((v, k) => opts.select
    ? '<select data-c="' + action + '" data-i="' + i + '" data-h="' + (o + k) + '" aria-label="' + opts.label + ' du trou ' + (o + k + 1) + '"' + dis + '>' + opts.select.map(x => '<option' + (x === v ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>'
    : '<input type="number" inputmode="numeric" min="' + (opts.min || 1) + '" max="' + (opts.max || 18) + '" data-c="' + action + '" data-i="' + i + '" data-h="' + (o + k) + '" aria-label="' + opts.label + ' du trou ' + (o + k + 1) + '" value="' + v + '"' + dis + '>'
  ).join('') + '</div>'; });
  return h;
}
function purseRowHTML(i, c, dis) {
  const v = cPurse(c), opts = []; for (let x = PURSE_RANGE[0]; x <= PURSE_RANGE[1] + 1; x += 100000) opts.push(x);
  if (!opts.includes(v)) opts.push(v), opts.sort((a, b) => a - b);
  const isF = i >= N_TOURN, mj = !isF && isMajorT(i), m = isF ? FIN.purse : mj ? MAJ.purse : 1;
  const note = (m !== 1 ? '<span>' + (isF ? 'Finale' : 'Majeur') + ' : \u00d7' + String(m).replace('.', ',') + ' \u2192 ' + fmtM(v * m) + '</span>' + (isF ? '' : ' \u00b7 ') : '') + (isF ? '' : '<span>L2 ' + fmtM(v * LEAGUE_PURSE_PCT[1]) + '</span> \u00b7 <span>L3 ' + fmtM(v * LEAGUE_PURSE_PCT[2]) + '</span> \u00b7 <span>L4 ' + fmtM(v * LEAGUE_PURSE_PCT[3]) + '</span>');
  return '<div class="condrl">Bourse</div><select class="cpursesel" aria-label="Bourse du tournoi (Ligue 1)" id="cpurse' + i + '" data-c="cpurse" data-i="' + i + '"' + dis + '>' + opts.map(x => '<option value="' + x + '"' + (x === v ? ' selected' : '') + '>' + fmtM(x) + '</option>').join('') + '</select>' +
    '<button type="button" class="rdice" data-a="rpurse" data-i="' + i + '" title="Bourse au hasard" aria-label="Bourse au hasard"' + dis + '>\ud83c\udfb2</button>' +
    '<div></div><div class="small mute cpursen">' + note + '</div>';
}
function courseFields(scope, i, c, locked, showPinWind) {
  const A = { name: scope + 'name', par: scope + 'par', parp: scope + 'parpaste', idx: scope + 'idx', idxp: scope + 'idxpaste', tee: scope + 'tee', dist: scope + 'dist', cr: scope + 'cr', slope: scope + 'slope', pin: scope + 'pin', wind: scope + 'wind', pin2: scope + 'pin2', wind2: scope + 'wind2' };
  const dis = locked ? ' disabled' : '';
  const own = scope === 'c' ? bankTeesOf(c.name).sort((a, b) => teeRank(a) - teeRank(b)) : [], teeList = own.length ? own : TEE_OPTIONS;
  let h = '<div class="sectlab">Identit\u00e9</div><div class="tgrid">' +
    '<div class="ti"><label for="' + A.tee + i + '">Tee de d\u00e9part</label><select id="' + A.tee + i + '" data-c="' + A.tee + '" data-i="' + i + '"' + dis + '>' + (teeList.includes(c.tee) ? [] : [c.tee]).concat(teeList).map(t => teeOptHTML(c.name, t, t === c.tee)).join('') + '</select></div>' +
    '<div class="ti"><label for="' + A.dist + i + '">Distance totale (verges)</label><input type="number" id="' + A.dist + i + '" data-c="' + A.dist + '" data-i="' + i + '" min="1000" max="9000" step="1" value="' + c.dist + '"' + dis + '></div></div>';
  h += '<div class="sectlab">Difficult\u00e9</div><div class="tgrid">' +
    '<div class="ti"><label for="' + A.cr + i + '">Course rating</label><input type="number" id="' + A.cr + i + '" data-c="' + A.cr + '" data-i="' + i + '" min="40" max="90" step="0.1" value="' + c.cr + '"' + dis + '></div>' +
    '<div class="ti"><label for="' + A.slope + i + '">Slope rating</label><input type="number" id="' + A.slope + i + '" data-c="' + A.slope + '" data-i="' + i + '" min="55" max="155" step="1" value="' + c.slope + '"' + dis + '></div></div>';
  if (showPinWind) h += '<div class="sectlab">Conditions</div><div class="condgrid">' +
    '<div></div><div class="condhead">Drapeau <span class="mute">\u00b7 sans effet</span></div><div class="condhead">Vent</div><div class="condhead">Hasard</div>' +
    '<div class="condrl">' + (S && S.one ? 'Ronde' : 'Ronde 1') + '</div>' +
    '<select aria-label="Drapeau ronde 1" id="' + A.pin + i + '" data-c="' + A.pin + '" data-i="' + i + '"' + dis + '>' + PIN_DAYS.map(d => '<option value="' + d + '"' + (d === c.pin ? ' selected' : '') + '>' + PIN_LABELS[d] + '</option>').join('') + '</select>' +
    '<select aria-label="Vent ronde 1" id="' + A.wind + i + '" data-c="' + A.wind + '" data-i="' + i + '"' + dis + '>' + WIND_LEVELS.map(w => '<option value="' + w + '"' + (w === c.wind ? ' selected' : '') + '>' + WIND_LABELS[w] + '</option>').join('') + '</select>' + '<button type="button" class="rdice" data-a="rrand" data-i="' + i + '" data-r="1" title="Drapeau et vent au hasard" aria-label="Drapeau et vent de la ronde 1 au hasard"' + dis + '>🎲</button>' +
    (S && S.one ? '' : '<div class="condrl">Ronde 2</div>' +
    '<select aria-label="Drapeau ronde 2" id="' + A.pin2 + i + '" data-c="' + A.pin2 + '" data-i="' + i + '"' + dis + '>' + PIN_DAYS.map(d => '<option value="' + d + '"' + (d === c.pin2 ? ' selected' : '') + '>' + PIN_LABELS[d] + '</option>').join('') + '</select>' +
    '<select aria-label="Vent ronde 2" id="' + A.wind2 + i + '" data-c="' + A.wind2 + '" data-i="' + i + '"' + dis + '>' + WIND_LEVELS.map(w => '<option value="' + w + '"' + (w === c.wind2 ? ' selected' : '') + '>' + WIND_LABELS[w] + '</option>').join('') + '</select>' + '<button type="button" class="rdice" data-a="rrand" data-i="' + i + '" data-r="2" title="Drapeau et vent au hasard" aria-label="Drapeau et vent de la ronde 2 au hasard"' + dis + '>🎲</button>') +
    (scope === 'c' ? purseRowHTML(i, c, dis) : '') +
    '</div>';
  h += '<div class="sectlab">Parcours \u00b7 par trou</div>' + parIndexTable(scope, i, c, locked);
  h += '<div class="pastewrap"><div><label for="' + A.parp + i + '">Coller les 18 par</label><input type="text" id="' + A.parp + i + '" data-c="' + A.parp + '" data-i="' + i + '" placeholder="4 4 3 5\u2026" autocomplete="off"' + dis + '></div>' +
    '<div><label for="' + A.idxp + i + '">Coller les 18 index</label><input type="text" id="' + A.idxp + i + '" data-c="' + A.idxp + '" data-i="' + i + '" placeholder="7 13 1 15\u2026" autocomplete="off"' + dis + '></div></div>';
  return h;
}
function parIndexTable(scope, i, c, locked) {
  const A = { par: scope + 'par', idx: scope + 'idx' };
  const dis = locked ? ' disabled' : '';
  let h = '';
  [0, 9].forEach(o => {
    h += '<div class="holetable"><div class="htrow htlabel"><span></span>' + Array.from({ length: 9 }, (_, k) => '<span>' + (o + k + 1) + '</span>').join('') + '</div>' +
      '<div class="htrow"><span>Par</span>' + c.pars.slice(o, o + 9).map((v, k) => '<select data-c="' + A.par + '" data-i="' + i + '" data-h="' + (o + k) + '" aria-label="Par du trou ' + (o + k + 1) + '"' + dis + '>' + [3, 4, 5].map(x => '<option' + (x === v ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>').join('') + '</div>' +
      '<div class="htrow htidx"><span>Index</span>' + c.index.slice(o, o + 9).map((v, k) => '<input type="number" min="1" max="18" data-c="' + A.idx + '" data-i="' + i + '" data-h="' + (o + k) + '" aria-label="Index du trou ' + (o + k + 1) + '" value="' + v + '"' + dis + '>').join('') + '</div></div>';
  });
  return h;
}
function vCourses() {
  const sub = VIEW.csub || 'season';
  const T = '<div class="top"><h1>Terrains de la saison</h1></div>' + chipRow([['season', 'Terrains de la saison'], ['bank', 'Liste de terrains']], sub, 'csub') +
    '';
  if (sub !== 'season') return T + vCourseBank();
  const on = futOn(); try { return T + futChips() + vCoursesSeason(); } finally { if (on) futOff(); }
}
const LOCK_SVG = on => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="' + (on ? 'M8 11V7a4 4 0 0 1 8 0v4' : 'M8 11V7a4 4 0 0 1 7.6-1.7') + '"/></svg>';
