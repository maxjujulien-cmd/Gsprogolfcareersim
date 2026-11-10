/* ============ INTERSAISON EN CHAPITRES (v215) ============
   Après « Entrer dans l'intersaison », la fin de saison se lit chapitre par chapitre (VIEW { name: 'off', s, i }).
   Les chapitres sans contenu sont sautés (Temple, Talents, Familles). La page complète (vSeasonEnd) sert aux archives. */
const offLnk = id => flagOf(id, 18) + ' <a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>';
const offRow = (a, b) => '<div class="ofrow"><span>' + a + '</span><span class="mute small">' + b + '</span></div>';
function offMyBest(H) {
  let best = null, br = null, w = 0, t10 = 0;
  H.t.concat(H.fin ? [H.fin] : []).forEach((t, ti) => { if (!t || !t.lg) return; const lg = t.lg[t.fin ? 0 : t.pl] || t.lg[0], r = lg && lg.rows.find(x => x[0] === 0); if (!r) return;
    if (r[1] > 0 && (!best || r[1] < best.p)) best = { p: r[1], t: t.fin ? N_TOURN : ti, n: t.name || '', l: t.fin ? 0 : t.pl }; if (r[1] === 1) w++; if (r[1] > 0 && r[1] <= 10) t10++;
    [r[2], r[3]].forEach(v => { if (v != null && (!br || v < br.v)) br = { v, t: t.fin ? N_TOURN : ti, par: t.par || 0 }; }); });
  return { best, br, w, t10 };
}
function offChapters(s) {
  const H = S.hist[s - 1], E = H && H.end; if (!E) return [];
  const C = [], from = E.from, to = E.to, x = E.x || null, P = s > 1 && S.hist[s - 2] && S.hist[s - 2].end;
  /* 1. ta saison */
  if (from >= 0) {
    const retired = to === -1, me = mySeason(H, E), mc = x ? x.tc.find(c => c[0] === 0) : null, mb = offMyBest(H);
    const verdict = retired ? '' : to < from ? '<span class="tag good">Promotion</span>' : to > from ? '<span class="tag bad">Relégation</span>' : '<span class="tag">Maintien</span>';
    let h = '<div class="ofs jmp"><div class="tg">Ton classement final en ' + LEAGUE_SHORT[from] + '</div><div class="ofbig">' + ord(E.rank) + '</div><p>' + (retired ? 'Ta carrière s’est terminée à la fin de cette saison.' : verdict + '  Tu commences la saison ' + yr(s + 1) + ' en <b>' + LEAGUE_NAMES[to] + '</b>.') + '</p></div>';
    if (me.row) h += '<div class="mgrid">' + tile(mb.w, mb.w > 1 ? 'victoires' : 'victoire') + tile(mb.t10, 'top 10') + tile(me.cuts, me.cuts > 1 ? 'coupures ratées' : 'coupure ratée') + tile(fmtM(me.earn), 'gains de la saison') + '</div>';
    const mom = [];
    if (mb.best) mom.push('🏆 Meilleur résultat : ' + (mb.best.p === 1 ? 'victoire' : ord(mb.best.p)) + ' au tournoi ' + (mb.best.t + 1) + (mb.best.l !== from ? ' en Ligue ' + (mb.best.l + 1) : '') + (mb.best.n ? ' · ' + esc(mb.best.n) : ''));
    if (mb.br) mom.push('🎯 Meilleure ronde : ' + (mb.br.par ? (mb.br.par + mb.br.v) + ' (' + fmt(mb.br.v) + ')' : fmt(mb.br.v)) + ' au tournoi ' + (mb.br.t + 1));
    if (mc) mom.push('📈 Ton niveau : ' + tierName(mc[1]) + ' → ' + tierName(mc[2]));
    if (talOn()) { const tm = talMine(); if (tm && tm.list && tm.list.length) { const t = tm.list[0]; mom.push((t.n ? '⚠️ Ton point faible selon tes cartes : ' : '⛳ Ta force selon tes cartes : ') + talLbl(t).toLowerCase() + ' (' + talLvName(t).toLowerCase() + ')'); } }
    if (mom.length) h += '<div class="block"><h3 style="margin-top:0">Tes moments</h3>' + mom.map(m => '<div class="ofrow"><span>' + m + '</span></div>').join('') + '</div>';
    if (s === S.season - 1 && canRetire()) h += retireBlock();
    C.push({ id: 'me', ico: '🏌️', t: 'Ta saison ' + yr(s), sub: LEAGUE_NAMES[from], h });
  }
  else if (E.prc) C.push({ id: 'me', ico: '\ud83c\udf93', t: 'Ta saison ' + yr(s), sub: 'Classe de recrues', h: '<div class="ofs jmp">' + rcEndHTML(H, E, s, false, true) + '</div>' });
  /* 2. les champions */
  { let h = '';
    const c1 = E.tables[0][0];
    if (c1) h += '<div class="ofs gold"><div class="tg">🏆 ' + (c1[0] === 0 ? 'Tu es champion de la Ligue 1' : 'Champion de la Ligue 1') + '</div><div class="nm big">' + offLnk(c1[0]) + '</div><p>' + ptsWord(c1[1]) + ' · ' + plural(c1[2], 'victoire') + (crownsOf(c1[0]) >= 2 ? ' · ' + ord(crownsOf(c1[0])) + ' titre de champion de ligue' : '') + '</p></div>';
    let R = '';
    for (let l = 1; l < 4; l++) { const c = E.tables[l] && E.tables[l][0]; if (c) R += offRow('<b>' + LEAGUE_SHORT[l] + '</b> · ' + offLnk(c[0]), ptsWord(c[1]) + ' · ' + plural(c[2], 'victoire')); }
    const fw = H.fin && H.fin.lg && H.fin.lg[0] && H.fin.lg[0].rows[0];
    if (fw) R += offRow('<b>Finale</b> · ' + offLnk(fw[0]), esc(H.fin.name || ''));
    if (CFG.majors !== 0) MAJ_T.forEach(t => { const T = H.t[t], w = T && T.lg[0].rows[0]; if (w) R += offRow('<b>' + esc(majorName(t)) + '</b> · ' + offLnk(w[0]), esc(T.name || '')); });
    h += '<div class="block"><h3 style="margin-top:0">Les autres titres</h3>' + R + '</div>';
    C.push({ id: 'ch', ico: '🏆', t: 'Les champions', sub: 'Le classement final des quatre ligues', h });
  }
  /* 3. le Temple : la cérémonie, seulement s'il y a un élu */
  if ((E.hof || []).some(r => r[5])) { const kv = VIEW; VIEW = { name: 'hofCer', s }; let h = ''; try { h = vHofCer(); } catch (e) { } VIEW = kv; C.push({ id: 'hof', ico: '🏛️', t: 'Temple de la renommée', sub: 'Cérémonie d’intronisation', h: '<div class="ofcer">' + h + '</div>' }); }
  /* 4. retraites */
  if (x && x.rt.length) {
    /* v261 : seuls les titres de Ligue 1 comptent (tournois + Finale), et on trie par gains de carrière */
    const W1 = l1WinsUpTo(s), w1 = r => W1[r[0]] || 0;
    const rt = x.rt.slice().sort((a, b) => (b[0] === 0) - (a[0] === 0) || b[4] - a[4] || w1(b) - w1(a) || b[2] - a[2]), nf = rt.filter(r => r[7]).length;
    const sp = rt.slice(0, 2), rest = rt.filter(r => !sp.includes(r));
    let h = sp.map(r => '<div class="ofs plq"><div class="tg">🚪 ' + (r[0] === 0 ? 'Ta carrière prend fin' : 'Une carrière qui s’achève') + '</div><div class="nm big">' + offLnk(r[0]) + '</div><p>' + r[1] + ' ans · ' + plural(r[2], 'saison') + (r[6] >= 0 ? ' · dernier niveau ' + tierName(r[6]) : '') + '</p><div class="oft"><div><b>' + w1(r) + '</b>' + (w1(r) === 1 ? 'titre de L1' : 'titres de L1') + '</div><div><b>' + fmtM(r[4]) + '</b>gains</div><div><b>L' + (r[5] + 1) + '</b>dernière ligue</div></div></div>').join('');
    const row = r => offRow(offLnk(r[0]), r[1] + ' ans · ' + (w1(r) ? plural(w1(r), 'titre') + ' de L1' : 'aucun titre de L1') + (r[4] > 0 ? ' · ' + fmtM(r[4]) + ' de gains' : '') + (r[7] ? ' · forcée' : ''));   // v260 : gains de carrière
    if (rest.length) h += '<div class="block"><h3 style="margin-top:0">' + (sp.length ? 'Les autres départs' : 'Les départs') + '</h3>' + rest.slice(0, 8).map(row).join('') + (rest.length > 8 ? detailsBox('Voir les ' + (rest.length - 8) + ' autres', rest.slice(8).map(row).join('')) : '') + '</div>';
    C.push({ id: 'rt', ico: '🚪', t: 'Retraites', sub: plural(rt.length, 'golfeur') + ' quittent le circuit' + (nf ? ', dont ' + nf + ' forcé' + (nf > 1 ? 's' : '') : ''), h });
  }
  /* 5. progression */
  if (x && x.tc.length) {
    const tc = x.tc, gens = tc.filter(c => c[2] === 8 && c[1] < 8), hofs = tc.filter(c => c[2] === 7 && c[1] < 7);
    const ups = tc.filter(c => c[2] > c[1]).sort((a, b) => (b[2] - b[1]) - (a[2] - a[1]) || b[2] - a[2]), dns = tc.filter(c => c[2] < c[1]).sort((a, b) => (a[2] - a[1]) - (b[2] - b[1]) || b[1] - a[1]);
    const age = id => { const g = S.G[id]; return g ? ' <small>' + g.a + ' ans</small>' : ''; };
    let h = '';
    if (gens.length) h += '<div class="ofs gen"><div class="tg">💎 <span>Nouveaux Generational · ' + gens.length + '</span></div><div class="ofpills">' + gens.slice(0, 10).map(c => '<span>' + offLnk(c[0]) + age(c[0]) + '</span>').join('') + '</div></div>';
    const jump = ups.find(c => c[2] - c[1] >= 2);
    if (jump) h += '<div class="ofs jmp"><div class="tg">🚀 Le grand bond</div><div class="nm">' + offLnk(jump[0]) + age(jump[0]) + '</div><p>' + tierName(jump[1]) + ' → <b>' + tierName(jump[2]) + '</b> · <span>+' + (jump[2] - jump[1]) + ' paliers</span></p></div>';
    if (hofs.length) h += '<div class="block"><h3 style="margin-top:0">⭐ <span>Nouveaux Hall Of Famer · ' + hofs.length + '</span></h3>' + hofs.slice(0, 6).map(c => offRow(offLnk(c[0]), tierName(c[1]) + ' → ' + tierName(c[2]))).join('') + '</div>';
    const ur = c => offRow(offLnk(c[0]), tierName(c[1]) + ' → <b>' + tierName(c[2]) + '</b>');
    const up2 = ups.filter(c => c !== jump && !gens.includes(c) && !hofs.includes(c));
    if (up2.length) h += '<div class="block"><h3 style="margin-top:0">📈 <span>Ils montent · ' + ups.length + '</span></h3>' + up2.slice(0, 6).map(ur).join('') + (up2.length > 6 ? detailsBox('Voir les ' + (up2.length - 6) + ' autres', up2.slice(6).map(ur).join('')) : '') + '</div>';
    if (dns.length) h += '<div class="block"><h3 style="margin-top:0">📉 <span>Ils reculent · ' + dns.length + '</span></h3>' + dns.slice(0, 4).map(ur).join('') + (dns.length > 4 ? detailsBox('Voir les ' + (dns.length - 4) + ' autres', dns.slice(4).map(ur).join('')) : '') + '</div>';
    const sc = E.news.map((n, i) => [n, i]).filter(([n]) => /éclosion tardive|franchi un cap|déçoit|perd soudainement|année difficile/.test(n));
    if (sc.length) h += '<div class="block"><h3 style="margin-top:0">Dans les coulisses</h3><ul class="news">' + sc.map(([n, i]) => '<li>' + newsHTML(n, (E.nids && E.nids[i]) || idsIn(n)) + '</li>').join('') + '</ul></div>';
    C.push({ id: 'tc', ico: '📈', t: 'Progression', sub: plural(tc.length, 'golfeur') + ' changent de palier', h });
  }
  /* 6. talents et tempéraments */
  let talH = '';
  if (talOn() && E.tal && E.tal.length) {
    const ev = E.tal.map(a => ({ id: a[0], w: a[1], k: a[2], lv: a[3], neg: a[4] })).filter(e => S.G[e.id] || (S.old && S.old[e.id]));
    const sc = e => (e.w === 'up' ? 3 : e.w === 'disc' ? 2 : 0) * 10 + e.lv * 4 + (3 - Math.max(0, leagueOf(e.id))) * 2 - (e.neg ? 15 : 0);
    const good = ev.filter(e => (e.w === 'disc' || e.w === 'up') && !e.neg).sort((a, b) => sc(b) - sc(a));
    let h = good.slice(0, 2).map(e => '<div class="ofs"><div class="tg">' + (e.w === 'up' ? '📈 Monte au niveau ' + talLvName({ lv: e.lv, n: 0 }).toLowerCase() : '🔍 Découverte') + '</div><div class="nm">' + offLnk(e.id) + '</div><div class="talrow" style="margin-top:8px">' + talPill({ k: e.k, lv: e.lv, n: 0, rv: s, h: [] }) + '</div></div>').join('');
    const rest = ev.filter(e => !good.slice(0, 2).includes(e));
    const lab = e => ({ disc: e.neg ? 'point faible découvert' : 'talent découvert', up: 'monte au niveau ' + talLvName({ lv: e.lv, n: 0 }).toLowerCase(), down: 'recule au niveau ' + talLvName({ lv: e.lv, n: 0 }).toLowerCase(), gone: 'talent disparu', better: 'défaut atténué', fixed: 'défaut corrigé' }[e.w] || '');
    if (rest.length) h += '<div class="block"><h3 style="margin-top:0">Aussi</h3>' + rest.slice(0, 10).map(e => offRow(offLnk(e.id), talLbl({ k: e.k, n: e.neg }) + ' · ' + lab(e))).join('') + (rest.length > 10 ? detailsBox('Voir les ' + (rest.length - 10) + ' autres', rest.slice(10).map(e => offRow(offLnk(e.id), talLbl({ k: e.k, n: e.neg }) + ' · ' + lab(e))).join('')) : '') + '</div>';
    talH = h;
  }
  const clE = (E.cl || []).filter(e => S.G[e[0]] || (S.old && S.old[e[0]]));
  let clH = '';
  if (clE.length) {
    const sc = e => (3 - Math.max(0, leagueOf(e[0]))) * 10 + Math.abs(e[2]) * 2, ups = clE.filter(e => e[2] > e[1]).sort((a, b) => sc(b) - sc(a)), dns = clE.filter(e => e[2] < e[1]).sort((a, b) => sc(b) - sc(a));
    const card = (e, up) => '<div class="ofs' + (up ? ' jmp' : ' dn') + '"><div class="tg">' + (up ? (e[2] === 2 ? '🧊 Devient Clutch' : '💪 A appris à gagner') : '😰 Perd ses moyens') + '</div><div class="nm">' + offLnk(e[0]) + '</div><p>' + clutchLabel(e[1]) + ' → <b>' + clutchLabel(e[2]) + '</b> sous pression</p></div>';
    const spot = [ups[0], dns[0]].filter(Boolean);
    clH += (spot.length > 1 ? '<div class="ofgrid two">' : '') + spot.map(e => card(e, e[2] > e[1])).join('') + (spot.length > 1 ? '</div>' : '');
    const rest = clE.filter(e => !spot.includes(e)).sort((a, b) => sc(b) - sc(a)), row = e => offRow(offLnk(e[0]), (e[2] > e[1] ? '▲ ' : '▼ ') + clutchLabel(e[1]) + ' → ' + clutchLabel(e[2]));
    if (rest.length) clH += '<div class="block"><h3 style="margin-top:0">Sous pression · ' + clE.length + '</h3>' + rest.slice(0, 8).map(row).join('') + (rest.length > 8 ? detailsBox('Voir les ' + (rest.length - 8) + ' autres', rest.slice(8).map(row).join('')) : '') + '</div>';
  }
  { const skE = (E.sk || []).filter(e => S.G[e[0]]);
    if (skOn() && skE.length) {
      const sc = e => (3 - Math.max(0, leagueOf(e[0]))) * 10 + (e[3] === 5 || e[3] === 1 ? 4 : 0) + (e[3] > e[2] ? 1 : 0), list = skE.slice().sort((a, b) => sc(b) - sc(a));
      const row = e => offRow(offLnk(e[0]), (e[3] > e[2] ? '\u25b2 ' : '\u25bc ') + SK_NM[e[1]] + ' ' + e[2] + ' \u2192 ' + e[3]);
      clH += '<div class="block"><h3 style="margin-top:0">Cotes de jeu \u00b7 ' + skE.length + '</h3>' + list.slice(0, 8).map(row).join('') + (list.length > 8 ? detailsBox('Voir les ' + (list.length - 8) + ' autres', list.slice(8).map(row).join('')) : '') + '</div>';
    } }
  if (talH || clH) C.push({ id: 'tal', ico: '🔍', t: talH && clH ? 'Talents et tempéraments' : talH ? 'Talents' : 'Tempéraments', sub: clH ? 'Ce que les dépisteurs ont remarqué cette année, et qui a changé sous pression' : 'Ce que les dépisteurs ont remarqué cette année', h: talH + clH });
  /* 7. promotions et relégations */
  { let h = '';
    if (from >= 0 && to >= 0) h += '<div class="ofs ' + (to < from ? 'jmp' : to > from ? 'dn' : '') + '"><div class="tg">' + (to < from ? '▲ Toi' : to > from ? '▼ Toi' : '= Toi') + '</div><div class="nm">' + (to < from ? 'Tu montes en ' : to > from ? 'Tu descends en ' : 'Tu restes en ') + LEAGUE_NAMES[to] + '</div><p>' + ord(E.rank) + ' en ' + LEAGUE_SHORT[from] + '</p></div>';
    const nm3 = ids => ids.slice(0, 3).map(offLnk).join(', ') + (ids.length > 3 ? ' et ' + (ids.length - 3) + ' autres' : '');
    let R = '';
    for (let l = 0; l < 4; l++) {
      const up = l > 0 && E.up[l] ? E.up[l] : [], dn = l < 3 && E.down[l] ? E.down[l].slice().sort((a, b) => careerWins(b) - careerWins(a)) : [];
      const mu = (E.midMoves || []).filter(m => m.fromL === l).length;
      R += '<div class="block"><h3 style="margin-top:0">' + LEAGUE_NAMES[l] + '</h3>' +
        (up.length ? '<p style="margin:0 0 4px">▲ ' + up.length + ' montent en Ligue ' + l + ' : ' + nm3(up) + '</p>' : '') +
        (dn.length ? '<p style="margin:0 0 4px">▼ ' + dn.length + ' descendent en Ligue ' + (l + 2) + ' : ' + nm3(dn) + '</p>' : '') +
        (!up.length && !dn.length ? '<p class="mute small" style="margin:0">Pas de changement de fin de saison.</p>' : '') +
        (mu ? '<p class="small mute" style="margin:4px 0 0">' + mu + ' déplacé' + (mu > 1 ? 's' : '') + ' en cours de saison</p>' : '') + '</div>';
    }
    C.push({ id: 'mv', ico: '↕️', t: 'Promotions et relégations', sub: 'Les ligues de ' + yr(s + 1), h, R });
  }
  /* 8. World Ranking */
  if (E.wr && E.wr.length) {
    const n1 = E.wr[0], p1 = P && P.wr ? P.wr[0] : null;
    let k = 1; for (let j = s - 1; j >= 1; j--) { const e = S.hist[j - 1] && S.hist[j - 1].end; if (e && e.wr && e.wr[0] === n1) k++; else break; }
    const h = '<div class="ofs gold"><div class="tg">🌍 ' + (p1 != null && p1 !== n1 ? 'Nouveau n°1 mondial' : 'N°1 mondial') + '</div><div class="nm big">' + offLnk(n1) + '</div><p>' + (k > 1 ? ord(k) + ' saison de suite au sommet' : p1 != null && p1 !== n1 ? 'Succède à ' + esc(nameOf(p1)) : 'Au sommet du classement mondial') + '</p></div>';
    C.push({ id: 'wr', ico: '🌍', t: 'World Ranking', sub: 'Le classement mondial à la fin de ' + yr(s), h, R: wrSeasonHTML(s) });
  }
  /* 8b. v252 : bilan de la classe de recrues de la saison */
  if (E.rc && E.rc.length) {
    const rc = E.rc, tag = r => rcLgTag(r[2]), nm = r => offLnk(r[0]), top = rc[0], nc = rc.filter(r => r[2] < 0);
    const gO = id => { const g = S.G[id] || (S.old && S.old[id]) || {}; const o = g.o != null ? g.o : g.oh && g.oh.length ? g.oh[g.oh.length - 1][1] : null; return o == null || id === 0 ? '' : gsTier(scale(TIERS, o), TIERS) + ' '; };
    const ix = r => r[1] >= 90 ? '–' : fmtHI(r[1]);
    let h = '<div class="ofs gold"><div class="tg">🎓 Premier de la classe de recrues ' + yr(s) + '</div><div class="nm big">' + nm(top) + '</div><p>Index ' + ix(top) + ' · commence en <b>' + (top[2] < 0 ? 'aucune ligue' : LEAGUE_NAMES[top[2]]) + '</b></p></div>';
    h += '<div class="rcsum">' + [0, 1, 2, 3, -1].map(l => [l, rc.filter(r => r[2] === l).length]).filter(x => x[1]).map(([l, n]) => '<span>' + rcLgTag(l) + ' <b>' + n + '</b></span>').join('') + '</div>';
    let R2 = '';
    [0, 1, 2, 3].forEach(l => { const L = rc.filter(r => r[2] === l); if (!L.length) return;
      const row = r => offRow(nm(r) + (r[0] === 0 ? ' <span class="tag">toi</span>' : ''), gO(r[0]) + '<span>index</span> ' + ix(r));
      R2 += '<div class="block"><h3 style="margin-top:0">' + tag([0, 0, l]) + ' ' + LEAGUE_NAMES[l] + ' · ' + L.length + '</h3>' + L.slice(0, 6).map(row).join('') + (L.length > 6 ? detailsBox('Voir les ' + (L.length - 6) + ' autres', L.slice(6).map(row).join('')) : '') + '</div>'; });
    if (nc.length) R2 += '<div class="block rcnc"><h3 style="margin-top:0">' + rcLgTag(-1) + ' Retranchés · ' + nc.length + '</h3><p class="small mute" style="margin:0 0 6px">Index trop élevé pour obtenir une carte : leur carrière s’arrête ici.</p>' + nc.map(r => offRow(nm(r), gO(r[0]) + '<span>index</span> ' + ix(r))).join('') + '</div>';
    h += R2 + '<p style="margin:8px 0 0"><a href="#" data-a="rcview" data-s="' + s + '">Voir le classement complet de la classe ›</a></p>';
    C.push({ id: 'rcb', ico: '🎓', t: 'Bilan de la classe de recrues', sub: plural(rc.length - nc.length, 'recrue') + ' obtiennent leur carte' + (nc.length ? ', ' + nc.length + ' retranché' + (nc.length > 1 ? 's' : '') : ''), h });
  }
  /* 9. la classe des recrues */
  const snp = g => g.rc && g.rc.s === s ? g.rc : null;   // v345 : même ordre que la page de la classe (le rang des dépisteurs), pas le potentiel seul
  const rc = rcPres(s).map(id => S.G[id]).filter(Boolean).sort((a, b) => (snp(a) ? snp(a).r : 999) - (snp(b) ? snp(b).r : 999) || b.p - a.p), rcIn = !!rcEntry(s);
  const pOf = g => snp(g) ? snp(g).p0 : g.p;
  if (rc.length) {
    const j = rc[0], st = i => rcStarsHTML(rcStars(i, rc.length));
    let h = '<div class="ofs jwl"><div class="tg">💎 Le joyau de la classe</div><div class="nm big">' + offLnk(j.id) + '</div><p>' + j.a + ' ans · ' + st(0) + ' · ' + POTS[scale(POTS, pOf(j))][1] + '</p><p class="q">« ' + esc(snp(j) ? snp(j).rp : rcReport(j)) + ' »</p></div>';
    h += '<div class="block"><h3 style="margin-top:0">Les suivants</h3>' + rc.slice(1, 5).map((g, i) => offRow(offLnk(g.id) + ' <small class="mute">' + g.a + ' ans</small>', POTS[scale(POTS, pOf(g))][1])).join('') + '<p style="margin:8px 0 0"><a href="#" data-a="rclass" data-s="' + s + '">Voir toute la classe ›</a></p></div>';
    if (rcIn) h = '<p style="margin:0 0 12px">Ils joueront la saison ' + yr(s + 1) + ' dans la classe de recrues : dix tournois, sans coupure ni points. Leur index à la fin de la saison décidera de leur ligue de départ… ou de leur retranchement.</p>' + h;
    if (E.roy) h += '<div class="block"><h3 style="margin-top:0">🏆 Recrue de l’année ' + yr(s) + '</h3><p style="margin:0">' + offLnk(E.roy.id) + ' · ' + E.roy.pts + ' points en Ligue ' + (E.roy.l + 1) + '</p></div>';
    C.push({ id: 'rk', ico: '⭐', t: rcIn ? 'La nouvelle classe de recrues' : 'La classe ' + yr(s + 1), sub: rcIn ? plural(rc.length, 'recrue') + ' entrent dans la classe de recrues ' + yr(s + 1) : plural(rc.length, 'recrue') + ', classées par les dépisteurs', h });
    /* 10. les familles */
    const fam = rc.map(g => ({ g, m: famMain(g.id) })).filter(f => f.m && famRec(f.m[0]));
    if (fam.length) {
      const relN = { pere: 'Son père', frere: 'Son frère', cousin: 'Son cousin', fils: 'Son fils' }, relL = { pere: 'fils de', frere: 'frère de', cousin: 'cousin de', fils: 'père de' };
      const card = f => { const r = famRec(f.m[0]), rid = f.m[0], act = !!S.G[rid], lg = act ? leagueOf(rid) : -1;
        const line = plural(r.cs || 0, 'saison') + ' · ' + plural(r.cw || 0, 'titre') + (r.ce ? ' · ' + fmtM(r.ce) + ' de gains' : '') + ' · ' + (act ? (lg >= 0 ? LEAGUE_SHORT[lg] : '') : 'retraité');
        return '<div class="ofs ' + (f.m[1] === 'pere' ? 'heir' : 'bros') + '"><div class="tg">' + (f.m[1] === 'pere' ? ((r.cw || 0) >= 3 ? '👨‍👦 Fils d’un champion' : '👨‍👦 Fils d’un ancien golfeur') : f.m[1] === 'frere' ? '🤝 Frères réunis' : '👪 Cousins') + '</div>' +
          '<div class="offam"><div><div class="r">La recrue</div><div class="n2">' + offLnk(f.g.id) + '</div><div class="small">' + f.g.a + ' ans · ' + POTS[scale(POTS, f.g.p)][1] + '</div></div><div class="lk">⟵</div><div><div class="r">' + relN[f.m[1]] + '</div><div class="n2">' + offLnk(rid) + '</div><div class="small">' + line + '</div></div></div></div>'; };
      const top = fam.slice().sort((a, b) => (famRec(b.m[0]).cw || 0) - (famRec(a.m[0]).cw || 0));
      let h = top.slice(0, 2).map(card).join('');
      if (top.length > 2) h += '<div class="block"><h3 style="margin-top:0">Aussi dans la classe</h3>' + top.slice(2).map(f => offRow(offLnk(f.g.id), relL[f.m[1]] + ' ' + esc(nameOf(f.m[0])))).join('') + '</div>';
      C.push({ id: 'fam', ico: '👪', t: 'Les familles', sub: plural(fam.length, 'recrue') + ' avec un nom déjà connu sur le circuit', h });
    }
  }
  /* 11. coup d'envoi */
  { const cur = s === S.season - 1, pl = leagueOf(0); let h = '';
    if (cur) {
      const c0 = S.courses && S.courses[0];
      if (c0 && c0.name) h += '<div class="block"><h3 style="margin-top:0">Premier tournoi</h3><p style="margin:0"><b>' + esc(c0.name) + '</b></p><p class="mute small" style="margin:4px 0 0">Par ' + parTotal(c0.pars) + (c0.tee ? ' · Tee ' + esc(c0.tee) : '') + (c0.dist ? ' · ' + fmtDist(c0.dist) + ' v' : '') + '</p></div>';
      const w = [];
      try { ensureWL(); const ids = new Set(); S.wl.lists.forEach(l => l.ids.forEach(id => ids.add(id))); const n = [...ids].filter(id => S.G[id] && pl >= 0 && leagueOf(id) === pl).length; if (n) w.push('⭐ ' + plural(n, 'golfeur') + ' de ta Watchlist dans ta ligue'); } catch (e) { }
      if (rc[0]) w.push('💎 ' + esc(nameOf(rc[0].id)) + (rcIn ? ' entre dans la classe de recrues' : ' fait ses débuts en Ligue 4'));
      if (CFG.majors !== 0) w.push('🏆 Majeurs aux tournois 3, 5, 7 et 9 de la Ligue 1');
      if (w.length) h += '<div class="block"><h3 style="margin-top:0">À surveiller</h3>' + w.map(x => '<div class="ofrow"><span>' + x + '</span></div>').join('') + '</div>';
    }
    if (cur && S.spect && !S.cur) h += '<div class="block"><h3 style="margin-top:0">' + ((S.playerCareers || []).length ? 'Un nouveau golfeur ?' : 'Ton arrivée sur le circuit') + '</h3><p style="margin:0 0 8px">Tu peux créer ton joueur maintenant : il débutera en ' + yr(s + 1) + '. Sinon, le circuit continue sans toi et tu pourras le créer à la prochaine intersaison.</p><button class="btn" data-a="newgolfer">' + (S.mode === 'sim' ? 'Créer mon golfeur' : 'Créer mon joueur') + '</button></div>';
    h += '<p class="small mute">Tout reste consultable dans le Journal › Intersaisons.</p>';
    C.push({ id: 'go', ico: '🚀', t: cur ? 'Saison ' + yr(s + 1) : 'Fin de l’intersaison', sub: cur && pl >= 0 ? LEAGUE_NAMES[pl] + ' · ' + N_TOURN + ' tournois' : '', h, last: 1 });
  }
  return C;
}
/* v261 : victoires en Ligue 1 (tournois et Finale) de chaque golfeur, jusqu'à la saison s incluse */
function l1WinsUpTo(s) {
  const m = {}, add = r => { if (r) m[r[0]] = (m[r[0]] || 0) + 1; };
  S.hist.forEach(H => { if (H.s > s) return; (H.t || []).forEach(t => add(t && t.lg && t.lg[0] && t.lg[0].rows[0])); add(H.fin && H.fin.lg && H.fin.lg[0] && H.fin.lg[0].rows[0]); });
  return m;
}
function vOff() {
  const s = VIEW.s, C = offChapters(s); if (!C.length) { VIEW = { name: 'seasonEnd', s }; return vSeasonEnd(); }
  const i = clamp(VIEW.i || 0, 0, C.length - 1), ch = C[i], cur = s === S.season - 1;
  if (cur && S.off && S.off.s === s) S.off.i = i;
  const dots = C.map((c, k) => '<a href="#" class="' + (k < i ? 'on' : k === i ? 'cur' : '') + '" data-a="offgo" data-i="' + k + '" title="' + esc(c.t) + '" aria-label="' + esc(c.t) + '"></a>').join('');
  let h = '<div class="ofw"><div class="ofprog"><div class="pl">Intersaison ' + yr(s) + ' → ' + yr(s + 1) + ' · ' + (i + 1) + ' / ' + C.length + '</div><div class="ofdots">' + dots + '</div></div>' +
    '<div class="ofhero"><div class="k">' + ch.ico + ' <span>Chapitre ' + (i + 1) + '</span></div><h1>' + ch.t + '</h1>' + (ch.sub ? '<p>' + ch.sub + '</p>' : '') + '</div>';
  h += ch.R ? '<div class="ofgrid two"><div>' + ch.h + '</div><div>' + ch.R + '</div></div>' : ch.h;
  const nx = C[i + 1];
  h += '<div class="offoot">' + (i > 0 ? '<button class="btn sec" data-a="offgo" data-i="' + (i - 1) + '">‹ Précédent</button>' : '') +
    (nx ? '<button class="btn next" data-a="offgo" data-i="' + (i + 1) + '"><span>' + esc(nx.t) + '</span> ›</button>' : cur ? '<button class="btn next" data-a="offdone">Commencer la saison ' + yr(s + 1) + '</button>' : '<button class="btn next" data-a="journal">Retour au journal</button>') + '</div>';
  if (nx) h += '<div class="ofskip"><a href="#" data-a="offgo" data-i="' + (C.length - 1) + '">Passer à la fin ›</a></div>';
  return h + '</div>';
}
function offResumeHTML() {
  if (!S.off || S.off.s !== S.season - 1 || S.t !== 0 || S.cur || S.presim) return '';
  const C = offChapters(S.off.s); if (!C.length) return '';
  const i = clamp(S.off.i || 0, 0, C.length - 1);
  return '<div class="block ofresume"><b>Intersaison ' + yr(S.off.s) + ' → ' + yr(S.off.s + 1) + '</b><p class="small mute" style="margin:4px 0 8px">Chapitre ' + (i + 1) + ' sur ' + C.length + ' : ' + esc(C[i].t) + '</p><button class="btn" data-a="offgo" data-s="' + S.off.s + '" data-i="' + i + '">Reprendre l’intersaison</button><button class="btn sec" data-a="offdone" style="margin-top:6px">Passer</button></div>';
}
function wrSeasonHTML(s) {
  const E = S.hist[s - 1] && S.hist[s - 1].end; if (!E || !E.wr || !E.wr.length) return '';
  const P = s > 1 && S.hist[s - 2] && S.hist[s - 2].end && S.hist[s - 2].end.wr ? S.hist[s - 2].end.wr : null;
  const cur = {}, prev = {}; E.wr.forEach((id, i) => cur[id] = i + 1); if (P) P.forEach((id, i) => prev[id] = i + 1);
  const lnk = id => flagVisual(natOf(id), 18) + ' <a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>';   // v256 : pas de médaillon ici, le rang est déjà affiché
  const pr = id => prev[id] && prev[id] <= WR_TOP ? prev[id] : null;
  const mv = id => { if (!P) return ''; const p = pr(id), c = cur[id]; if (!p) return '<span class="wrmv nw">Nouveau</span>'; const d = p - c; return d > 0 ? '<span class="wrmv up">▲ ' + d + '</span>' : d < 0 ? '<span class="wrmv dn">▼ ' + (-d) + '</span>' : '<span class="wrmv eq">=</span>'; };
  const top = E.wr.slice(0, WR_TOP), f = VIEW.wrf || 'all';
  const lgOf = id => { const l = leagueOf(id); return l >= 0 ? 'L' + (l + 1) : ''; };
  let h = '<div class="block sumblk wrblk"><h3>World Ranking · top ' + WR_TOP + '</h3><p class="small mute" style="margin:0 0 8px">Classement mondial à la fin de la saison ' + yr(s) + '.' + (P ? ' Mouvement et rang par rapport à la fin de la saison ' + yr(s - 1) + '.' : '') + '</p>';
  if (P) {
    const nUp = top.filter(id => pr(id) && pr(id) > cur[id]).length, nDn = top.filter(id => pr(id) && pr(id) < cur[id]).length, nNew = top.filter(id => !pr(id)).length;
    h += chipRow([['all', 'Tous'], ['up', 'Montées · ' + nUp], ['dn', 'Chutes · ' + nDn], ['nw', 'Nouveaux · ' + nNew]], f, 'wrf');
  }
  const keep = id => f === 'all' || !P || (f === 'up' ? pr(id) && pr(id) > cur[id] : f === 'dn' ? pr(id) && pr(id) < cur[id] : !pr(id));
  const band = i => i === 0 ? 'Top 10' : i === 10 ? '11 à 50' : i === 50 ? '51 à 100' : '';
  h += '<div class="scroll"><table class="plain wrtop wr100"><tr><th class="r">#</th><th>Golfeur</th><th class="wrlg">Ligue</th><th class="r">' + (P ? 'Mouv.' : '') + '</th><th class="r">' + (P ? yr(s - 1) : '') + '</th></tr>' +
    top.map((id, i) => { if (!keep(id)) return ''; const b = f === 'all' ? band(i) : ''; return (b ? '<tr class="wrband"><td colspan="5">' + b + '</td></tr>' : '') + '<tr' + (id === 0 ? ' class="cresme"' : '') + '><td class="r"><b class="wrn ' + (i < 10 ? 'g' : i < 50 ? 's' : 'b') + '">' + (i + 1) + '</b></td><td>' + lnk(id) + '</td><td class="wrlg mute small">' + lgOf(id) + '</td><td class="r">' + mv(id) + '</td><td class="r mute">' + (P ? (pr(id) ? ord(pr(id)) : 'NC') : '') + '</td></tr>'; }).join('') + '</table></div>';
  if (P) {
    const out = P.slice(0, WR_TOP).filter(id => !cur[id] || cur[id] > WR_TOP);
    if (out.length && (f === 'all' || f === 'dn')) h += '<h4>Sortis du top ' + WR_TOP + ' <span class="mute small">(' + out.length + ')</span></h4><p class="wrlist">' + out.map(id => lnk(id) + ' <span class="mute">' + ord(prev[id]) + (S.G[id] || id === 0 ? '' : ' · retraité') + '</span>').join(' · ') + '</p>';
  }
  return h + '</div>';
}
