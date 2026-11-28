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
  /* 1. ta saison — v426 : page « télé » plein écran (maquette B2 choisie par Max) : ton rang géant, bandeau de stats,
     ta carte de la saison (rondes, total, place, points et gains à chaque tournoi), tes moments et la saison qui vient. */
  if (from >= 0) C.push({ id: 'me', ico: '🏌️', t: 'Ta saison ' + yr(s), full: 1, img: HERO_IMG, h: offMeHTML(s, H, E, x) });
  else if (E.prc) C.push({ id: 'me', ico: '\ud83c\udf93', t: 'Ta saison ' + yr(s), sub: 'Classe de recrues', h: '<div class="ofs jmp">' + rcEndHTML(H, E, s, false, true) + '</div>' });
  /* 2. les champions — v425 : page « télé » plein écran (maquette A2 choisie par Max) : photo du trophée, nom géant du champion
     de la Ligue 1, bandeau de stats, son parcours tournoi par tournoi, les trois autres champions et la Finale, puis le bandeau des majeurs. */
  { const T0 = E.tables[0] || [], c1 = T0[0];
    if (c1) C.push({ id: 'ch', ico: '🏆', t: 'Les champions', full: 1, img: CHAMP_IMG, h: offChampHTML(s, H, E, c1, T0[1]) });
  }
  /* 3. le Temple : la cérémonie, seulement s'il y a un élu */
  if ((E.hof || []).some(r => r[5])) { const kv = VIEW; VIEW = { name: 'hofCer', s }; let h = ''; try { h = vHofCer(); } catch (e) { } VIEW = kv; C.push({ id: 'hof', ico: '🏛️', t: 'Temple de la renommée', sub: 'Cérémonie d’intronisation', h: '<div class="ofcer">' + h + '</div>' }); }
  /* 4. retraites — v427 : page « télé » plein écran (maquette C choisie par Max) : le tableau des départs classés par gains
     en carrière, les chiffres de la saison et un bandeau qui fait défiler les autres départs. */
  if (x && x.rt.length) C.push({ id: 'rt', ico: '🚪', t: 'Retraites', full: 1, img: HERO_IMG, dim: 1, h: offRtHTML(s, x) });
  /* 5. progression — v428 : page « télé » plein écran (maquette C choisie par Max) : le tableau de TOUS les golfeurs qui changent
     de palier (les grands mouvements d'abord, puis ceux qui montent, puis ceux qui reculent), à faire défiler, avec les chiffres
     de la saison et le bandeau « Dans les coulisses ». */
  if (x && x.tc.length) C.push({ id: 'tc', ico: '📈', t: 'Progression', full: 1, img: HERO_IMG, h: offTcHTML(s, E, x) });
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
/* v428 : le chapitre « Progression » en page télé. Une ligne de x.tc : [id, palier avant, palier après, ligue de la saison, ligue suivante]. */
const OFX_TCOL = ['#7d8a80', '#6fa05b', '#4e9a3a', '#2f8f7a', '#2e78b7', '#6b5bd1', '#c1852b', '#c9a227', '#b23a78'];
function offTcHTML(s, E, x) {
  const tc = x.tc, G8 = TIERS.length - 1, gens = tc.filter(c => c[2] === G8 && c[1] < G8), hofs = tc.filter(c => c[2] === G8 - 1 && c[1] < G8 - 1);
  const ups = tc.filter(c => c[2] > c[1]).sort((a, b) => (b[2] - b[1]) - (a[2] - a[1]) || b[2] - a[2]), dns = tc.filter(c => c[2] < c[1]).sort((a, b) => (a[2] - a[1]) - (b[2] - b[1]) || b[1] - a[1]);
  const jump = ups.find(c => c[2] - c[1] >= 2 && !gens.includes(c));
  const lead = gens.concat(jump ? [jump] : [], hofs.filter(c => c !== jump)), upr = lead.concat(ups.filter(c => !lead.includes(c)));
  const chip = t => '<span class="oftc" style="background:' + OFX_TCOL[t] + '">' + esc(tierName(t)) + '</span>';
  const lg = l => l == null || l < 0 ? '—' : l === 4 ? 'Recrues' : 'L' + (l + 1);
  const tag = c => c[0] === 0 ? '<span class="ofpill">Toi</span>' : gens.includes(c) ? '<span class="ofpill gn">Nouveau Generational</span>' : c === jump ? '<span class="ofpill jb">Le grand bond</span>' : hofs.includes(c) ? '<span class="ofpill">Nouveau Hall Of Famer</span>' : '';
  const row = (c, up) => { const a = ageAt(c[0], s); return '<tr class="' + (up ? '' : 'dn') + (c[0] === 0 ? ' me' : '') + '"><td class="l n">' + offLnk(c[0]) + ' ' + tag(c) + '</td><td>' + (a != null ? a : '—') + '</td><td>' + lg(c[4]) + '</td><td>' + chip(c[1]) + '</td><td>' + chip(c[2]) + '</td><td class="e ' + (up ? 'up' : 'dw') + '">' + (up ? '▲ ' + (c[2] - c[1]) : '▼ ' + (c[1] - c[2])) + '</td></tr>'; };
  /* v448 : tri en cliquant sur le titre d'une colonne (demande de Max) ; un 2e clic inverse l'ordre ; sans tri, l'ordre d'origine */
  const so = VIEW.tcs || null, keyF = { nm: c => nameOf(c[0]), age: c => ageAt(c[0], s) == null ? 99 : ageAt(c[0], s), lg: c => c[4] == null || c[4] < 0 ? 9 : c[4], av: c => c[1], ap: c => c[2], ec: c => c[2] - c[1] }[so && so.k];
  const th = (k, lab, cls) => '<th' + (cls ? ' class="' + cls + '"' : '') + ' aria-sort="' + (so && so.k === k ? (so.d > 0 ? 'ascending' : 'descending') : 'none') + '"><button type="button" class="ofsort' + (so && so.k === k ? ' on' : '') + '" data-a="tcsort" data-k="' + k + '"><span>' + lab + '</span>' + (so && so.k === k ? (so.d > 0 ? ' ▲' : ' ▼') : '') + '</button></th>';
  let body;
  if (keyF) { const L = tc.slice().sort((a, b) => { const x = keyF(a), y = keyF(b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * so.d || (b[2] - b[1]) - (a[2] - a[1]); }); body = L.map(c => row(c, c[2] > c[1])).join(''); }
  else body = (upr.length ? '<tr class="sep up"><td colspan="6">▲ <span>Ils montent</span> · ' + upr.length + '</td></tr>' + upr.map(c => row(c, true)).join('') : '') + (dns.length ? '<tr class="sep"><td colspan="6">▼ <span>Ils reculent</span> · ' + dns.length + '</td></tr>' + dns.map(c => row(c, false)).join('') : '');
  let h = '<div class="ofxnm ofrth" role="heading" aria-level="2">La progression</div><p class="ofrtl"><span>' + plural(tc.length, 'golfeur') + ' changent de palier</span> · <span>Fais défiler le tableau pour les voir tous</span></p>';
  h += '<div class="ofrtg"><div class="ofmsc ofrtt oftct"><div class="h"><div class="lab">Les mouvements</div>' + (so ? '<button type="button" class="ofsreset" data-a="tcsort" data-k="">Ordre d’origine</button>' : '<span class="ofshint">Clique sur une colonne pour trier</span>') + '</div><div class="scroll oftcs"><table>' +
    '<thead><tr>' + th('nm', 'Golfeur', 'l') + th('age', 'Âge') + th('lg', 'Ligue') + th('av', 'Avant') + th('ap', 'Après') + th('ec', 'Écart', 'e') + '</tr></thead><tbody>' + body + '</tbody></table></div></div>';
  const bx = (v, k, c) => '<div class="ofrtb" style="border-color:' + c + '"><b>' + v + '</b><span>' + k + '</span></div>';
  h += '<div class="ofrts">' + bx(ups.length, 'montent de palier', '#5CC796') + bx(dns.length, dns.length > 1 ? 'reculent' : 'recule', '#c8473a') + bx(gens.length, gens.length > 1 ? 'nouveaux Generational' : 'nouveau Generational', '#b06ad6') + bx(hofs.length, hofs.length > 1 ? 'nouveaux Hall Of Famer' : 'nouveau Hall Of Famer', '#c9a227') + '</div></div>';
  const sc = (E.news || []).map((n, i) => [n, i]).filter(([n]) => /éclosion tardive|franchi un cap|déçoit|perd soudainement|année difficile/.test(n));
  if (sc.length) { const it = sc.map(([n, i]) => '<span>' + newsHTML(n, (E.nids && E.nids[i]) || idsIn(n)) + '</span>').join('');
    h += '<div class="ofxtk ofrtk oftck"><div class="lab"><span>Dans les coulisses</span></div><div class="its"><div class="mq" style="animation-duration:' + Math.max(30, sc.length * 9) + 's"><div>' + it + '</div><div aria-hidden="true" class="dup">' + it.replace(/<a /g, '<a tabindex="-1" ') + '</div></div></div></div>'; }
  return h;
}
/* v427 : le chapitre « Retraites » en page télé (tableau des départs). Une ligne de x.rt : [id, âge, saisons, …, gains, dernière ligue, dernier niveau, forcée]. */
function offRtHTML(s, x) {
  const W1 = l1WinsUpTo(s), w1 = r => W1[r[0]] || 0, ids = new Set(x.rt.map(r => r[0])), maj = {}, wr = {};
  S.hist.forEach(H => { if (!H || H.s > s) return;
    if (CFG.majors !== 0) MAJ_T.forEach(t => { const T = H.t && H.t[t], w = T && T.lg && T.lg[0] && T.lg[0].rows[0]; if (w && ids.has(w[0])) maj[w[0]] = (maj[w[0]] || 0) + 1; });
    const e = H.end; if (e && e.wr) e.wr.forEach((id, i) => { if (ids.has(id) && !(wr[id] <= i + 1)) wr[id] = i + 1; }); });
  const rt = x.rt.slice().sort((a, b) => (b[0] === 0) - (a[0] === 0) || b[4] - a[4] || w1(b) - w1(a) || b[2] - a[2]), nf = rt.filter(r => r[7]).length, N = 12;
  const top = rt.slice(0, N), rest = rt.slice(N), totL1 = rt.reduce((a, r) => a + w1(r), 0), totE = rt.reduce((a, r) => a + (r[4] || 0), 0), dash = '—';
  let h = '<div class="ofxnm ofrth" role="heading" aria-level="2">Ils raccrochent</div><p class="ofrtl"><span>' + plural(rt.length, 'départ') + '</span> · <span>Classés par gains en carrière</span></p>';
  h += '<div class="ofrtg"><div class="ofmsc ofrtt"><div class="h"><div class="lab">' + (rest.length ? '<span>Les départs</span> · top ' + N : '<span>Les départs</span>') + '</div></div><div class="scroll"><table>' +
    '<tr><th></th><th class="l">Golfeur</th><th>Âge</th><th>Carrière</th><th>Titres L1</th>' + (CFG.majors !== 0 ? '<th>Majeurs</th>' : '') + '<th>Mondial</th><th>Gains</th></tr>' +
    top.map((r, i) => '<tr class="' + (r[0] === 0 ? 'me' : wr[r[0]] === 1 ? 'gold' : '') + '"><td class="r">' + (i + 1) + '</td><td class="l n">' + offLnk(r[0]) +
      (r[0] === 0 ? ' <span class="ofpill">Toi</span>' : wr[r[0]] === 1 ? ' <span class="ofpill">Ex-n° 1</span>' : '') + (r[7] ? ' <span class="ofpill gr">Forcée</span>' : '') + '</td><td>' + r[1] + '</td><td>' + (yr(s) - r[2] + 1) + '–' + yr(s) + '</td><td>' + (w1(r) || dash) + '</td>' +
      (CFG.majors !== 0 ? '<td>' + (maj[r[0]] || dash) + '</td>' : '') + '<td>' + (wr[r[0]] ? 'n° ' + wr[r[0]] : dash) + '</td><td><b>' + (r[4] > 0 ? fmtM(r[4]) : dash) + '</b></td></tr>').join('') + '</table></div></div>';
  const bx = (v, k) => '<div class="ofrtb"><b>' + v + '</b><span>' + k + '</span></div>';
  h += '<div class="ofrts">' + bx(rt.length, rt.length > 1 ? 'départs' : 'départ') + bx(nf, nf > 1 ? 'perdent leur place (forcés)' : 'perd sa place (forcé)') + bx(totL1, totL1 > 1 ? 'titres de L1 qui s’en vont' : 'titre de L1 qui s’en va') + bx(fmtM(totE), 'de gains en carrière, au total') + '</div></div>';
  if (rest.length) {
    const it = rest.map(r => '<span>' + offLnk(r[0]) + ' <i>' + r[1] + ' ans' + (r[7] ? ' · forcée' : '') + '</i></span>').join('');
    h += '<div class="ofxtk ofrtk"><div class="lab"><span>Aussi</span> · ' + rest.length + '</div><div class="its"><div class="mq" style="animation-duration:' + Math.max(30, rest.length * 4) + 's"><div>' + it + '</div><div aria-hidden="true" class="dup">' + it.replace(/<a /g, '<a tabindex="-1" ') + '</div></div></div></div>';
  }
  return h;
}
/* v426 : le chapitre « Ta saison » en page télé, avec la carte de pointage de la saison. */
function offMeHTML(s, H, E, x) {
  const from = E.from, to = E.to, retired = to === -1, me = mySeason(H, E), mb = offMyBest(H), T = E.tables[from] || [];
  const mc = x ? x.tc.find(c => c[0] === 0) : null, MJ = CFG.majors !== 0;
  const badge = retired ? '<div class="ofxlive gry">■ <span>Ta carrière s’est terminée cette saison</span></div>'
    : to < from ? '<div class="ofxlive up">▲ <span>Promotion</span> · <span>Tu montes en Ligue ' + (to + 1) + '</span></div>'
    : to > from ? '<div class="ofxlive">▼ <span>Relégation</span> · <span>Tu descends en Ligue ' + (to + 1) + '</span></div>'
    : '<div class="ofxlive gry">■ <span>Maintien</span> · <span>Tu restes en Ligue ' + (to + 1) + '</span></div>';
  let h = badge + '<div class="ofxnat"><span>' + esc(LEAGUE_NAMES[from]) + '</span> · <span>Classement final</span></div>';
  const rk = E.rank || 0, sup = LANG === 'en' ? ord(rk).replace(/^\d+/, '') : rk === 1 ? 'er' : 'e';
  const st = [[me.row ? me.row[1] : 0, 'points'], [mb.w, mb.w > 1 ? 'victoires' : 'victoire'], [mb.t10, 'top 10'], [fmtM(me.earn), 'gains']];
  h += '<div class="ofmtop"><div class="ofmrk"><b>' + rk + '<sup>' + sup + '</sup></b><div><strong class="notr">' + esc(nameOf(0)) + '</strong><span>sur ' + T.length + ' golfeurs</span>' + (from > 0 ? '<span>Les ' + MOVE + ' premiers montent</span>' : '') + '</div></div>' +
    '<div class="ofxlow"><div class="k"><span>Saison</span> ' + yr(s) + '</div><div class="v">' + st.map(v => '<div><b>' + v[0] + '</b><span>' + v[1] + '</span></div>').join('') + '</div></div></div>';
  /* la carte de la saison : une colonne par tournoi (et la Finale si tu y étais) */
  const cols = [];
  H.t.forEach((t, ti) => { if (!t) return; const lg = t.pl === 4 ? t.rc : t.lg && t.lg[t.pl], r = lg && lg.rows.find(z => z[0] === 0);
    cols.push({ k: String(ti + 1), n: t.name || '', mj: MJ && MAJ_T.includes(ti), l: t.pl, par: t.par || 0, r, earn: r && lg.pay ? lg.pay[0] || 0 : 0 }); });
  const fl = H.fin && H.fin.lg && H.fin.lg[0], fr = fl && fl.rows.find(z => z[0] === 0);
  if (fr) cols.push({ k: 'F', n: H.fin.name || '', fin: 1, l: 0, par: H.fin.par || 0, r: fr, earn: fl.pay ? fl.pay[0] || 0 : 0 });
  const rd = (c, k) => c.r && c.r[k] != null ? (c.par ? c.par + c.r[k] : fmt(c.r[k])) : '—';
  const chip = c => !c.r ? '—' : c.r[1] === 1 ? '<span class="cp w">1</span>' : c.r[1] === 0 ? '<span class="cp mc">MC</span>' : '<span class="cp ' + posTc(c.r[1]) + '">' + c.r[1] + '</span>';
  const sum = k => cols.reduce((a, c) => a + (c.r && c.r[k] != null ? c.r[k] : 0), 0), tot = c => c.r ? c.r[2] + (c.r[3] || 0) : null;
  const row = (lab, f, tt, cls) => '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td class="l">' + lab + '</td>' + cols.map(c => '<td' + (c.mj || c.fin ? ' class="mj"' : '') + '>' + f(c) + '</td>').join('') + '<td class="tot">' + tt + '</td></tr>';
  h += '<div class="ofmsc"><div class="h"><div class="lab">Ta carte de la saison</div><div class="leg"><span><i class="cp w">1</i><span>victoire</span></span><span><i class="cp t">5</i><span>top 10</span></span><span><i class="cp mc">MC</i><span>coupure ratée</span></span>' + (MJ ? '<span class="mjk">★ <span>majeur</span></span>' : '') + '</div></div><div class="scroll"><table>' +
    '<tr><th class="l">Tournoi</th>' + cols.map(c => '<th' + (c.mj || c.fin ? ' class="mj"' : '') + '>' + (c.fin ? 'Finale' : (c.mj ? '★ ' : '') + c.k) + '</th>').join('') + '<th class="tot">Saison</th></tr>' +
    '<tr class="crs"><td class="l">Terrain</td>' + cols.map(c => '<td' + (c.mj || c.fin ? ' class="mj"' : '') + ' title="' + esc(c.n) + '"><span class="notr">' + esc(c.n) + '</span>' + (c.l !== from && !c.fin ? '<em>' + (c.l === 4 ? 'Recrues' : 'L' + (c.l + 1)) + '</em>' : '') + '</td>').join('') + '<td class="tot"></td></tr>' +
    row('Ronde 1', c => rd(c, 2), fmt(sum(2))) + row('Ronde 2', c => rd(c, 3), fmt(sum(3))) +
    row('Total', c => tot(c) == null ? '—' : fmt(tot(c)), fmt(sum(2) + sum(3)), 'big') +
    row('Place', chip, ord(rk)) + row('Points', c => c.r ? c.r[4] || 0 : '—', me.row ? me.row[1] : 0) +
    row('Gains', c => c.earn ? fmtM(c.earn) : '—', fmtM(me.earn), 'sm') + '</table></div></div>';
  /* tes moments */
  const M = [];
  if (mb.best) M.push(['🏆', 'Meilleur résultat', (mb.best.p === 1 ? 'Victoire' : ord(mb.best.p)) + ' au tournoi ' + (mb.best.t + 1), mb.best.n]);
  if (mb.br) M.push(['🎯', 'Meilleure ronde', mb.br.par ? (mb.br.par + mb.br.v) + ' (' + fmt(mb.br.v) + ')' : fmt(mb.br.v), 'Tournoi ' + (mb.br.t + 1) + (H.t[mb.br.t] && H.t[mb.br.t].name ? ' · ' + H.t[mb.br.t].name : mb.br.t === N_TOURN && H.fin ? ' · Finale' : '')]);
  const pr = offMyProg(H, E); if (pr && pr[0] !== rk) M.push(['📈', pr[0] > rk ? 'Ta remontée' : 'Ta saison au classement', ord(pr[0]) + ' → ' + ord(rk), 'après le premier tournoi, puis à la fin']);
  if (me.played) M.push(['⛳', 'Coupures', (me.played - me.cuts) + ' sur ' + me.played, me.cuts ? me.cuts + (me.cuts > 1 ? ' coupures ratées' : ' coupure ratée') : 'aucune coupure ratée']);
  if (mc) M.push(['📊', 'Ton niveau', tierName(mc[2]), mc[1] !== mc[2] ? 'avant : ' + tierName(mc[1]) : 'inchangé']);
  if (talOn()) { const tm = talMine(); if (tm && tm.list && tm.list.length) { const t = tm.list[0]; M.push([t.n ? '⚠️' : '⛳', t.n ? 'Ton point faible' : 'Ta force', talLbl(t), talLvName(t)]); } }
  if (M.length) h += '<div class="ofxrow ofmrow">' + M.slice(0, 5).map(m => '<div class="ofxt" style="border-color:#5CC796"><div class="t">' + m[0] + ' <span>' + m[1] + '</span></div><div class="n">' + m[2] + '</div><div class="p">' + esc(m[3]) + '</div></div>').join('') + '</div>';
  /* la saison qui vient, et la retraite (toujours possible, jamais imposée) */
  const obj = retired ? '' : to === 0 ? (from === 0 ? 'jouer le titre et la Finale' : 'garder ta place en Ligue 1') : to < from ? 'garder ta place' : 'finir dans les ' + MOVE + ' premiers pour monter';
  h += '<div class="ofxtk ofmtk"><div class="lab">' + (retired ? '<span>Fin de carrière</span>' : '<span>Saison</span> ' + yr(s + 1)) + '</div><div class="its">' + (retired ? '' : '<span><em>Ta ligue</em>' + esc(LEAGUE_NAMES[to]) + '</span><span><em>Objectif</em>' + obj + '</span>') + '</div>' +
    (s === S.season - 1 && canRetire() ? '<button class="ofmret" data-a="retireask">Prendre ma retraite</button>' : '') + '</div>';
  return h;
}
/* ton rang au classement de ta ligue après le premier tournoi (null si tu as changé de ligue en cours de saison) */
function offMyProg(H, E) {
  const T = E.tables[E.from]; if (!T || !H.t[0] || H.t[0].pl !== E.from) return null;
  const lg = H.t[0].lg[E.from]; if (!lg) return null; const p = {}; lg.rows.forEach(r => p[r[0]] = r[4] || 0);
  if (p[0] == null) return null; const ids = T.map(r => r[0]);
  return [1 + ids.filter(i => (p[i] || 0) > p[0]).length];
}
/* v425 : le chapitre « Les champions » en page télé (photo du trophée, src/assets/champ-img.webp). */
const CHAMP_IMG = '{{asset:champ-img.webp}}', OFX_LC = ['#3987e5', '#e2672f', '#1fae7a', '#e0a21a'];
function offChampHTML(s, H, E, c1, c2) {
  const id = c1[0], me = id === 0, nat = natOf(id), age = ageAt(id, s), nm = nameOf(id), sp = nm.indexOf(' ');
  const win0 = T => T && T.lg && T.lg[0] && T.lg[0].rows[0];
  const majW = CFG.majors !== 0 ? MAJ_T.filter(t => { const w = win0(H.t[t]); return w && w[0] === id; }).length : -1;
  const crowns = crownsOf(id);
  let h = '<div class="ofxlive">● <span>' + (me ? 'Tu es champion de la Ligue 1' : 'Champion de la Ligue 1') + '</span> · ' + yr(s) + '</div>';
  h += '<div class="ofxnat">' + flagVisual(nat, 22) + (nat ? ' <span>' + esc(nat) + '</span>' : '') + (age != null ? ' · <span>' + age + ' ans</span>' : '') + (crowns >= 2 ? ' · <span>' + ord(crowns) + ' titre</span>' : '') + '</div>';
  h += '<div class="ofxnm notr" role="heading" aria-level="2"><a href="#" data-a="golfer" data-id="' + id + '">' + (sp > 0 ? esc(nm.slice(0, sp)) + '<br>' + esc(nm.slice(sp + 1)) : esc(nm)) + '</a></div>';
  const st = [[c1[1], 'points'], [c1[2], c1[2] > 1 ? 'victoires' : 'victoire']];
  if (majW >= 0) st.push([majW, majW > 1 ? 'majeurs' : 'majeur']);
  if (c2) st.push(['+' + (c1[1] - c2[1]), 'd’avance sur le 2e']);
  h += '<div class="ofxlow"><div class="k"><span>Saison</span> ' + yr(s) + '</div><div class="v">' + st.map(x => '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>').join('') + '</div></div>';
  /* son parcours : sa place à chaque tournoi de la saison (et à la Finale) */
  const bars = [];
  H.t.forEach((T, ti) => { const r = T && T.lg && T.lg[0] && T.lg[0].rows.find(x => x[0] === id); if (r) bars.push({ p: r[1], n: (ti + 1) + '. ' + (T.name || ''), mj: CFG.majors !== 0 && MAJ_T.includes(ti) }); });
  const fr = H.fin && H.fin.lg && H.fin.lg[0] && H.fin.lg[0].rows.find(x => x[0] === id);
  if (fr) bars.push({ p: fr[1], n: 'Finale · ' + (H.fin.name || ''), f: 1 });
  if (bars.length) h += '<div class="ofxch"><h4>Son parcours · place à chaque tournoi</h4><div class="ofxbars">' + bars.map(b => '<div class="' + (b.f ? 'f' : '') + '" title="' + esc(b.n) + '"><i style="height:' + (b.p ? Math.max(8, 100 - b.p * 2.4) : 0).toFixed(0) + '%;background:' + (b.p === 1 ? '#f0c419' : b.p && b.p <= 10 ? '#5aa9ff' : '#5d6b78') + '"></i><span>' + (b.p ? b.p : 'MC') + '</span><em>' + (b.f ? 'Finale' : b.mj ? 'Majeur' : '') + '</em></div>').join('') + '</div></div>';
  /* les trois autres ligues et la Finale */
  let R = '';
  for (let l = 1; l < 4; l++) { const c = E.tables[l] && E.tables[l][0]; if (c) R += '<div class="ofxt" style="border-color:' + OFX_LC[l] + '"><div class="t"><span>' + (c[0] === 0 ? 'Tu es champion' : 'Champion') + '</span> · <span>' + LEAGUE_SHORT[l] + '</span></div><div class="n">' + offLnk(c[0]) + '</div><div class="p">' + ptsWord(c[1]) + ' · ' + plural(c[2], 'victoire') + '</div></div>'; }
  const fw = win0(H.fin);
  if (fw) R += '<div class="ofxt" style="border-color:#f0c419"><div class="t">Finale</div><div class="n">' + offLnk(fw[0]) + '</div><div class="p">' + esc(H.fin.name || '') + '</div></div>';
  if (R) h += '<div class="ofxrow">' + R + '</div>';
  /* le bandeau des majeurs */
  if (CFG.majors !== 0) {
    const M = MAJ_T.map(t => { const T = H.t[t], w = win0(T); if (!w) return ''; const sc = w[2] != null ? w[2] + (w[3] || 0) : null;
      return '<span><em>' + esc(majorName(t)) + '</em><a href="#" data-a="golfer" data-id="' + w[0] + '" class="notr">' + esc(nameOf(w[0])) + '</a>' + (sc != null ? ' (' + fmt(sc) + ')' : '') + '</span>'; }).join('');
    if (M) h += '<div class="ofxtk"><div class="lab"><span>Majeurs</span> ' + yr(s) + '</div><div class="its">' + M + '</div></div>';
  }
  return h;
}
function offFoot(C, i, s, cur) {
  const nx = C[i + 1];
  let h = '<div class="offoot">' + (i > 0 ? '<button class="btn sec" data-a="offgo" data-i="' + (i - 1) + '">‹ Précédent</button>' : '') +
    (nx ? '<button class="btn next" data-a="offgo" data-i="' + (i + 1) + '"><span>' + esc(nx.t) + '</span> ›</button>' : cur ? '<button class="btn next" data-a="offdone">Commencer la saison ' + yr(s + 1) + '</button>' : '<button class="btn next" data-a="journal">Retour au journal</button>') + '</div>';
  if (nx) h += '<div class="ofskip"><a href="#" data-a="offgo" data-i="' + (C.length - 1) + '">Passer à la fin ›</a></div>';
  return h;
}
function vOff() {
  const s = VIEW.s, C = offChapters(s); if (!C.length) { VIEW = { name: 'seasonEnd', s }; return vSeasonEnd(); }
  const i = clamp(VIEW.i || 0, 0, C.length - 1), ch = C[i], cur = s === S.season - 1;
  if (cur && S.off && S.off.s === s) S.off.i = i;
  const dots = C.map((c, k) => '<a href="#" class="' + (k < i ? 'on' : k === i ? 'cur' : '') + '" data-a="offgo" data-i="' + k + '" title="' + esc(c.t) + '" aria-label="' + esc(c.t) + '"></a>').join('');
  if (ch.full) return '<div class="ofw ofwx"><div class="ofx"><div class="ofxbg' + (ch.dim ? ' dim' : '') + '" aria-hidden="true"' + (ch.img ? ' style="background-image:url(' + ch.img + ')"' : '') + '></div><div class="ofxin"><div class="ofxk"><span>Chapitre ' + (i + 1) + '</span> · <span>' + esc(ch.t) + '</span> <span class="ofxy">· ' + yr(s) + ' → ' + yr(s + 1) + '</span></div><div class="ofdots">' + dots + '</div>' + ch.h + '</div></div>' + offFoot(C, i, s, cur) + '</div>';
  let h = '<div class="ofw"><div class="ofprog"><div class="pl">Intersaison ' + yr(s) + ' → ' + yr(s + 1) + ' · ' + (i + 1) + ' / ' + C.length + '</div><div class="ofdots">' + dots + '</div></div>' +
    '<div class="ofhero"><div class="k">' + ch.ico + ' <span>Chapitre ' + (i + 1) + '</span></div><h1>' + ch.t + '</h1>' + (ch.sub ? '<p>' + ch.sub + '</p>' : '') + '</div>';
  h += ch.R ? '<div class="ofgrid two"><div>' + ch.h + '</div><div>' + ch.R + '</div></div>' : ch.h;
  h += offFoot(C, i, s, cur);
  return h + '</div>';
}
/* v424 : tant que l'intersaison n'est pas terminée (« Commencer la saison »), la page Saison et le bouton Continuer ramènent au chapitre
   où le joueur était rendu, même après être allé voir une autre page (golfeurs, ligues…). Avant, on tombait sur le premier tournoi. */
function offPending() { try { return !!(S && S.off && S.off.s === S.season - 1 && S.t === 0 && !S.cur && !S.presim && offChapters(S.off.s).length); } catch (e) { return false; } }
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
