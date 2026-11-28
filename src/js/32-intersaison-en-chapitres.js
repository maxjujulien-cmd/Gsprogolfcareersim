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
    C.push({ id: 'mv', ico: '↕️', t: 'Promotions et relégations', full: 1, img: HERO_IMG, dim: 1, h: offMvHTML(s, E, from, to) });   // v449 : page télé (option D)
  }
  /* 8. World Ranking */
  if (E.wr && E.wr.length) {
    const n1 = E.wr[0], p1 = P && P.wr ? P.wr[0] : null;
    let k = 1; for (let j = s - 1; j >= 1; j--) { const e = S.hist[j - 1] && S.hist[j - 1].end; if (e && e.wr && e.wr[0] === n1) k++; else break; }
    const h = '<div class="ofs gold"><div class="tg">🌍 ' + (p1 != null && p1 !== n1 ? 'Nouveau n°1 mondial' : 'N°1 mondial') + '</div><div class="nm big">' + offLnk(n1) + '</div><p>' + (k > 1 ? ord(k) + ' saison de suite au sommet' : p1 != null && p1 !== n1 ? 'Succède à ' + esc(nameOf(p1)) : 'Au sommet du classement mondial') + '</p></div>';
    C.push({ id: 'wr', ico: '🌍', t: 'World Ranking', full: 1, img: HERO_IMG, dim: 1, h: offWrHTML(s, E, P) });   // v450 : page télé (option A)
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
    if (rc.length) C.push({ id: 'rk', ico: '⭐', t: rcIn ? 'La nouvelle classe de recrues' : 'La classe ' + yr(s + 1), full: 1, img: HERO_IMG, dim: 1, h: offRkHTML(s, rc, snp, rcIn, E) });   // v450 : page télé (option C)
    else C.push({ id: 'rk', ico: '⭐', t: rcIn ? 'La nouvelle classe de recrues' : 'La classe ' + yr(s + 1), sub: rcIn ? plural(rc.length, 'recrue') + ' entrent dans la classe de recrues ' + yr(s + 1) : plural(rc.length, 'recrue') + ', classées par les dépisteurs', h });
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
      C.push({ id: 'fam', ico: '👪', t: 'Les familles', full: 1, img: HERO_IMG, dim: 1, h: offFamHTML(s, fam) });   // v450 : page télé (option A)
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
    if (s === S.season - 1) C.push({ id: 'ap', ico: '🔭', t: 'Aperçu de la saison', full: 1, img: HERO_IMG, dim: 1, h: apPreviewHTML() });   // v454 : avant-saison (favoris, montée, Top 30 Prospects)
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
/* v450 : trois chapitres de plus en page télé (choix de Max) : World Ranking (A), la nouvelle classe (C), les familles (A) */
const offAv = (id, sz, c) => '<div class="ofav" style="width:' + sz + 'px;height:' + sz + 'px;font-size:' + Math.round(sz * .36) + 'px;--c:' + (c || '#2f8f7a') + '">' + (phFrameHTML(id, 'phhv') || esc(nameOf(id).split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase())) + '</div>';
const offBox = (v, k, c) => '<div class="ofrtb" style="border-color:' + c + '"><b>' + v + '</b><span>' + k + '</span></div>';
function offWrHTML(s, E, P) {
  const cur = {}, prev = {}; E.wr.forEach((id, i) => cur[id] = i + 1); if (P && P.wr) P.wr.forEach((id, i) => prev[id] = i + 1);
  const top = E.wr.slice(0, WR_TOP), pr = id => prev[id] && prev[id] <= WR_TOP ? prev[id] : null, dl = id => pr(id) ? pr(id) - cur[id] : null, hasP = !!(P && P.wr);
  const mv = id => { if (!hasP) return '—'; const d = dl(id); return d == null ? '<span class="ofmvn">Nouveau</span>' : d > 0 ? '<span class="ofmvu">▲ ' + d + '</span>' : d < 0 ? '<span class="ofmvd">▼ ' + (-d) + '</span>' : '<span class="mute">=</span>'; };
  const lgc = OFX_LC, lch = id => { const l = leagueOf(id); return l >= 0 ? '<span class="oftc" style="background:' + lgc[l] + '">L' + (l + 1) + '</span>' : '—'; };
  const n1 = top[0], p1 = hasP ? P.wr[0] : null; let k = 1; for (let j = s - 1; j >= 1; j--) { const e = S.hist[j - 1] && S.hist[j - 1].end; if (e && e.wr && e.wr[0] === n1) k++; else break; }
  const ups = top.filter(id => dl(id) > 0).length, dns = top.filter(id => dl(id) < 0).length, nws = hasP ? top.filter(id => dl(id) == null).length : 0;
  let h = '<div class="ofxnm ofrth" role="heading" aria-level="2">World Ranking</div><p class="ofrtl"><span>Le classement mondial à la fin de</span> ' + yr(s) + ' · <span>Fais défiler pour voir le top 100</span></p>';
  h += '<div class="ofwr1"><span class="ofwr1a">' + offAv(n1, 76, '#c9a227') + '</span><div><div class="ofwr1k">' + (p1 != null && p1 !== n1 ? 'Nouveau n° 1 mondial' : 'N° 1 mondial') + '</div><div class="ofwr1n">' + offLnk(n1) + '</div><div class="ofwr1s">' + (k > 1 ? ord(k) + ' saison de suite au sommet' : p1 != null && p1 !== n1 ? 'Succède à ' + esc(nameOf(p1)) : 'Au sommet du classement mondial') + '</div></div><div class="ofwr23">' + top.slice(1, 3).map(id => '<div><b>#' + cur[id] + '</b>' + offLnk(id) + '</div>').join('') + '</div></div>';
  h += '<div class="ofrtg"><div class="ofmsc ofrtt oftct"><div class="h"><div class="lab">Top ' + WR_TOP + '</div></div><div class="scroll oftcs" style="max-height:520px"><table><thead><tr><th class="r">#</th><th class="l">Golfeur</th><th>Ligue</th><th>Mouv.</th><th>' + yr(s - 1) + '</th></tr></thead><tbody>' +
    top.map(id => '<tr' + (id === 0 ? ' class="me"' : '') + '><td class="r"><b>' + cur[id] + '</b></td><td class="l n">' + offLnk(id) + '</td><td>' + lch(id) + '</td><td>' + mv(id) + '</td><td class="mute">' + (pr(id) ? ord(pr(id)) : '—') + '</td></tr>').join('') + '</tbody></table></div></div>';
  h += '<div class="ofrts">' + offBox(ups, ups > 1 ? 'montent' : 'monte', '#5CC796') + offBox(dns, dns > 1 ? 'reculent' : 'recule', '#c8473a') + offBox(nws, nws > 1 ? 'nouveaux dans le top 100' : 'nouveau dans le top 100', '#F0C419') + offBox(k, k > 1 ? 'saisons de suite au n° 1' : 'saison au n° 1', '#3987e5') + '</div></div>';
  return h;
}
function offRkHTML(s, rc, snp, rcIn, E) {
  const pot = g => POTS[scale(POTS, snp(g) ? snp(g).p0 : g.p)][1], st = i => rcStarsHTML(rcStars(i, rc.length)), rp = g => esc(snp(g) ? snp(g).rp : rcReport(g));
  let h = '<div class="ofxnm ofrth" role="heading" aria-level="2">' + (rcIn ? 'La nouvelle classe' : 'La classe ' + yr(s + 1)) + '</div><p class="ofrtl"><span>' + plural(rc.length, 'recrue') + '</span> · <span>Le top 5 des dépisteurs, et tous les autres</span></p>';
  h += '<div class="ofrk5">' + rc.slice(0, 5).map((g, i) => '<div class="' + (i ? '' : 'j') + '"><div class="t">' + offAv(g.id, 50, i ? '#2f8f7a' : '#6b5bd1') + '<b>#' + (i + 1) + '</b></div><div class="n">' + offLnk(g.id) + '</div><div class="mute">' + g.a + ' <span>ans</span> · ' + st(i) + '</div><div class="p">' + pot(g) + '</div><div class="q">« ' + rp(g) + ' »</div></div>').join('') + '</div>';
  h += '<div class="ofmsc ofrtt oftct" style="margin-top:14px"><div class="h"><div class="lab">Toutes les recrues</div>' + (E.roy ? '<span class="ofshint">🏆 <span>Recrue de l’année</span> ' + yr(s) + ' : ' + esc(nameOf(E.roy.id)) + '</span>' : '') + '</div><div class="scroll oftcs" style="max-height:330px"><table><thead><tr><th class="r">#</th><th class="l">Recrue</th><th>Âge</th><th>Dépisteurs</th><th class="l">Potentiel</th></tr></thead><tbody>' +
    rc.map((g, i) => '<tr' + (g.id === 0 ? ' class="me"' : '') + '><td class="r">' + (i + 1) + '</td><td class="l n">' + offLnk(g.id) + (g.prd ? ' <span class="ofpill">Prêt à jouer</span>' : '') + '</td><td>' + g.a + '</td><td>' + st(i) + '</td><td class="l">' + pot(g) + '</td></tr>').join('') + '</tbody></table></div></div>';
  h += '<p class="ofmvf">' + (rcIn ? '<span>Ils joueront la saison ' + yr(s + 1) + ' dans la classe de recrues : leur index à la fin de la saison décidera de leur ligue de départ.</span> ' : '') + '<a href="#" data-a="rclass" data-s="' + s + '">Voir toute la classe ›</a></p>';
  return h;
}
function offFamHTML(s, fam) {
  const relN = { pere: 'Son père', frere: 'Son frère', cousin: 'Son cousin', fils: 'Son fils' }, relT = { pere: 'Fils d’un ancien golfeur', frere: 'Frères réunis', cousin: 'Cousins', fils: 'Père et fils' };
  const L = fam.slice().sort((a, b) => (famRec(b.m[0]).cw || 0) - (famRec(a.m[0]).cw || 0));
  let h = '<div class="ofxnm ofrth" role="heading" aria-level="2">Les familles</div><p class="ofrtl"><span>' + plural(fam.length, 'recrue') + ' avec un nom déjà connu sur le circuit</span></p><div class="offm">';
  L.forEach(f => { const rid = f.m[0], r = famRec(rid), rel = f.m[1], act = !!S.G[rid], lg = act ? leagueOf(rid) : -1, now = act ? (lg >= 0 ? LEAGUE_SHORT[lg] : '—') : 'Retraité';
    h += '<div class="offmc"><div class="offmt">' + (rel === 'pere' && (r.cw || 0) >= 3 ? 'Fils d’un champion' : relT[rel]) + '</div><div class="offmr"><div class="s">' + offAv(f.g.id, 70) + '<div><div class="k">La recrue</div><div class="n">' + offLnk(f.g.id) + '</div><div class="mute">' + f.g.a + ' <span>ans</span> · ' + POTS[scale(POTS, f.g.p)][1] + '</div></div></div><div class="ar">⟷</div><div class="s">' + offAv(rid, 70, '#6b5bd1') + '<div><div class="k">' + relN[rel] + '</div><div class="n">' + offLnk(rid) + '</div><div class="mute">' + now + '</div></div></div></div>' +
      '<div class="offms">' + [[r.cs || 0, 'saisons'], [r.cw || 0, 'titres'], [r.ce ? fmtM(r.ce) : '—', 'gains en carrière'], [now, 'aujourd’hui']].map(([v, k]) => '<div><b>' + v + '</b><span>' + k + '</span></div>').join('') + '</div></div>'; });
  return h + '</div><p class="ofmvf"><span>Les chiffres du bas sont ceux du parent sur le circuit.</span></p>';
}
/* v449 : « Promotions et relégations » en page télé (option D, choix de Max) : une carte par frontière (L1 ⇅ L2, L2 ⇅ L3,
   L3 ⇅ L4), avec TOUS ceux qui montent et qui descendent, leur rang de fin de saison et leurs points. */
function offMvHTML(s, E, from, to) {
  const LC = OFX_LC, rk = (id, l) => { const i = (E.tables[l] || []).findIndex(r => r[0] === id); return i >= 0 ? i + 1 : null; }, pt = (id, l) => { const r = (E.tables[l] || []).find(r => r[0] === id); return r ? r[1] : 0; };
  let nu = 0, nd = 0; const nm = (E.midMoves || []).length;
  for (let l = 0; l < 4; l++) { nu += (l > 0 && E.up[l] || []).length; nd += (l < 3 && E.down[l] || []).length; }
  let h = '<div class="ofxnm ofrth" role="heading" aria-level="2">Promotions et relégations</div><p class="ofrtl"><span>' + plural(nu, 'golfeur') + ' montent</span> · <span>' + nd + ' descendent</span>' + (nm ? ' · <span>' + nm + ' déplacés en cours de saison</span>' : '') + ' · <span>Les ligues de</span> ' + yr(s + 1) + '</p>';
  if (from >= 0 && to >= 0) h += '<div class="ofmvme ' + (to < from ? 'up' : to > from ? 'dn' : '') + '"><b>' + (to < from ? '▲' : to > from ? '▼' : '=') + ' Toi</b><span>' + (to < from ? 'Tu montes en ' : to > from ? 'Tu descends en ' : 'Tu restes en ') + LEAGUE_NAMES[to] + '</span><span class="mute">' + ord(E.rank) + ' en ' + LEAGUE_SHORT[from] + '</span></div>';
  h += '<div class="ofmvg">' + [0, 1, 2].map(l => {
    const U = (E.up[l + 1] || []).slice().sort((a, b) => rk(a, l + 1) - rk(b, l + 1)), D = (E.down[l] || []).slice().sort((a, b) => rk(a, l) - rk(b, l));
    const li = (id, lf, up) => '<tr' + (id === 0 ? ' class="me"' : '') + '><td class="r">' + (rk(id, lf) || '—') + '</td><td class="l n">' + offLnk(id) + '</td><td class="p ' + (up ? 'up' : 'dn') + '">' + pt(id, lf) + '</td></tr>';
    return '<div class="ofmvc"><div class="ofmvh" style="background:linear-gradient(90deg,' + LC[l] + ',' + LC[l + 1] + ')">L' + (l + 1) + ' ⇅ L' + (l + 2) + '</div><div class="ofmvb">' +
      '<div class="ofmvk up">▲ <span>Montent en</span> L' + (l + 1) + ' · ' + U.length + '</div>' + (U.length ? '<table>' + U.map(id => li(id, l + 1, 1)).join('') + '</table>' : '<p class="ofmv0">Personne</p>') +
      '<div class="ofmvk dn">▼ <span>Descendent en</span> L' + (l + 2) + ' · ' + D.length + '</div>' + (D.length ? '<table>' + D.map(id => li(id, l, 0)).join('') + '</table>' : '<p class="ofmv0">Personne</p>') + '</div></div>';
  }).join('') + '</div><p class="ofmvf"><span>Le chiffre de gauche est le rang de fin de saison dans l’ancienne ligue ; à droite, les points.</span></p>';
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
/* v454 (demande de Max) : Top 30 Prospects et Aperçu de la saison.
   - Liste des espoirs : 27 ans et moins, jamais commencé une saison en L1 avant celle-ci (l'année de sa première saison
     en L1, il est encore classé ; ensuite il « gradue »). Note des dépisteurs : 70 % potentiel, 30 % niveau, petit bonus
     de jeunesse, et une erreur moyenne des dépisteurs (fixe pour une saison et un golfeur).
   - Chaque liste est gardée dans S.pl[saison] = [[id, niveau, potentiel, âge], …] (30 lignes) ; les saisons passées
     sont refaites au chargement à partir des niveaux de fin de saison (g.oh), retraités compris.
   - Aperçu de la saison : dernier chapitre de l'intersaison. Onglets Ligue 1 (10 favoris au titre), Ligues 2 à 4
     (qui va monter, selon trois analystes), Top 30 Prospects. Calculs à graine fixe : la page ne change pas d'une visite à l'autre. */
const PL_N = 30, PL_AGE = 27, AP_AN = ['Marc Delorme', 'Sandra Kim', 'Tom Whitaker'];
function plHash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function plGauss(a, b) { const u = plHash(a, b) || 1e-9, v = plHash(b + 7, a + 13); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function plRng(seed) { let x = seed >>> 0; return () => { x = (x + 0x6D2B79F5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const PLC = { st: {} };
function plL1Start(u) {   // golfeurs qui ont commencé la saison u en L1
  if (PLC.st[u]) return PLC.st[u];
  const H = S.hist[u - 1], set = new Set(), T = H && (H.t || []).find(x => x && x.lg && x.lg[0] && x.lg[0].rows);
  if (T) T.lg[0].rows.forEach(r => set.add(r[0])); else if (H && H.end && H.end.tables[0]) H.end.tables[0].forEach(r => set.add(r[0]));
  if (u < S.season) PLC.st[u] = set; return set;
}
function plBuild(t) {
  if (t < 2) return; S.pl = S.pl || {};
  const out = [], before = new Set(); for (let u = 1; u < t; u++) plL1Start(u).forEach(id => before.add(id));
  const look = (id, g, act) => {
    if (!g || before.has(id) || id === 0 && (S.mode !== 'sim' || t <= careerStart(0))) return;   // v455 : ton golfeur simulé est classé comme les autres
    const e = (g.oh || []).find(x => x[0] === t - 1); let o, p;
    if (e) { o = e[1]; p = e[2]; } else if (act && t === S.season && g.o != null) { o = g.o; p = g.p; } else return;
    const age = act ? g.a - (S.season - t) : g.a != null && g.s != null ? g.a - (g.s - t) : null;
    if (age == null || age > PL_AGE || age < 14) return;
    out.push([id, Math.round(o), Math.round(p), age, 0.7 * p + 0.3 * o + (PL_AGE - age) * 4 + plGauss(t, id) * 22]);
  };
  Object.keys(S.G).forEach(k => look(+k, S.G[k], true));
  if (t < S.season) Object.keys(S.old || {}).forEach(k => look(+k, S.old[k], false));
  S.pl[t] = out.sort((a, b) => b[4] - a[4]).slice(0, PL_N).map(r => r.slice(0, 4));
}
function plBackfill() { S.pl = S.pl || {}; for (let t = 2; t <= S.season; t++) if (!S.pl[t]) plBuild(t); }
function plRanks(id) { const out = []; Object.keys(S.pl || {}).map(Number).sort((a, b) => a - b).forEach(t => { const i = S.pl[t].findIndex(r => r[0] === id); if (i >= 0) out.push([t, i + 1]); }); return out; }
function plBest(id) { const R = plRanks(id); return R.length ? R.reduce((m, r) => r[1] < m[1] ? r : m) : null; }
const plLv = r => r[1] >= r[2] ? TIERS[scale(TIERS, r[1])][1] + ' · <span class="apvx">au-delà des attentes</span>' : TIERS[scale(TIERS, r[1])][0] >= POTS[scale(POTS, r[2])][0] ? TIERS[scale(TIERS, r[1])][1] + ' · <span class="apvx">potentiel atteint</span>' : TIERS[scale(TIERS, r[1])][1] + ' → <span class="apvpot">' + POTS[scale(POTS, r[2])][1] + '</span>';
const AP_Q = {   // phrases des dépisteurs (espoirs) et des analystes (montée)
  ph: ['Un talent comme on en voit une fois par génération.', 'Les dépisteurs n’ont jamais rien vu de pareil.'],
  kid: ['Si jeune, et déjà ce coup de fer : patience, il arrive.', 'Encore un adolescent, mais quel swing.', 'Le plus précoce de sa génération.'],
  raw: ['Encore brut, mais le plafond est immense.', 'Un diamant à polir.', 'Tout reste à faire, mais quel potentiel.'],
  ready: ['Prêt pour la L1 dès maintenant.', 'Il frappe déjà à la porte de la L1.', 'Son jeu est déjà mûr.'],
  late: ['Éclosion tardive : il a enfin trouvé son swing.', 'Il a pris son temps, mais il est là.'],
  over: ['Il a déjà dépassé toutes les attentes.', 'Personne ne l’avait vu venir à ce point.'],
  base: ['Régulier, solide, il monte une marche par saison.', 'Un travailleur : les dépisteurs aiment ce profil.', 'Pas spectaculaire, mais tout est en place.'],
  aYoung: ['Si jeune, et déjà prêt pour l’étage supérieur.', 'Le talent est là, il ne manque que l’expérience.', 'On parlera de lui longtemps.'],
  aVet: ['Vétéran solide, mais le temps presse.', 'Sa dernière vraie chance de monter ?', 'L’expérience peut faire la différence.'],
  aDown: ['Il vient de descendre : il veut remonter tout de suite.', 'Une saison pour se racheter.'],
  aRk: ['Une recrue qui n’a peur de rien.', 'Première saison, grandes ambitions.'],
  aHi: ['Il a tout pour franchir le pas cette année.', 'Ce serait une surprise s’il ne montait pas.', 'Le grand favori de la ligue.'],
  aMid: ['Ça se jouera sur les majeurs.', 'Il lui faudra un début de saison solide.', 'Une place est à prendre : à lui de la saisir.'],
  aLo: ['Personne n’en parle… c’est souvent comme ça que ça commence.', 'Un outsider à ne pas oublier.', 'S’il trouve la constance, attention.']
};
const apQ = (k, id, s) => { const L = AP_Q[k]; return '« ' + L[Math.floor(plHash(id, s + k.length) * L.length)] + ' »'; };
function plQuote(r, t) { const g = S.G[r[0]] || {}, ti = scale(TIERS, r[1]), gap = scale(POTS, r[2]) - ti;
  return apQ(g.ph && g.phR ? 'ph' : r[1] >= r[2] ? 'over' : r[3] <= 19 ? 'kid' : gap >= 4 ? 'raw' : ti >= 5 ? 'ready' : r[3] >= 25 ? 'late' : 'base', r[0], t); }
/* ---- Aperçu : force estimée et chances ---- */
function apStr(id, l) {
  const g = S.G[id], h = hcAt(id), P = S.hist[S.season - 2], E = P && P.end;
  let b = 0; if (E) { const i = (E.tables[l] || []).findIndex(r => r[0] === id); if (i >= 0) b = Math.max(0, 30 - i) * 3; else if (l < 3 && (E.tables[l + 1] || []).some(r => r[0] === id)) b = 25; else if (l > 0 && (E.tables[l - 1] || []).some(r => r[0] === id)) b = 45; }
  return shownO(g) - (h != null ? h : 10) * 6 + b;
}
function apUpN(l) { const P = S.hist[S.season - 2], E = P && P.end; const n = E && E.up && E.up[l] ? E.up[l].length : 0; return n || MOVE; }
const APC = {};
function apOdds(l) {   // l = 0 : chance du titre ; sinon chance de monter
  const key = S.season + ':' + l; if (APC[key]) return APC[key];
  const ids = S.L[l].filter(id => S.G[id] && (id !== 0 || S.mode === 'sim')).map(id => [id, apStr(id, l)]).sort((a, b) => b[1] - a[1]).slice(0, 40);
  if (!ids.length) return (APC[key] = []);
  const n = ids.length, sp = Math.max(1, (ids[0][1] - ids[Math.min(14, n - 1)][1]) / 1.6), N = l === 0 ? 1 : Math.min(apUpN(l), n), cnt = ids.map(() => 0), R = plRng(S.season * 977 + l * 131 + 7);
  const gs = () => Math.sqrt(-2 * Math.log(R() || 1e-9)) * Math.cos(2 * Math.PI * R());
  for (let k = 0; k < 2500; k++) ids.map((x, i) => [i, x[1] + gs() * sp]).sort((a, b) => b[1] - a[1]).slice(0, N).forEach(x => cnt[x[0]]++);
  return (APC[key] = ids.map((x, i) => ({ id: x[0], p: cnt[i] / 2500 })).sort((a, b) => b.p - a.p));
}
const apOdd = p => p <= 0.004 ? '200 contre 1' : Math.max(1, Math.round(1 / p - 1)) + ' contre 1';
const apPct = p => p >= 0.995 ? '99 %' : p < 0.01 ? '< 1 %' : Math.round(p * 100) + ' %';
function apLastRk(id) { const P = S.hist[S.season - 2], E = P && P.end; if (!E) return '—'; for (let k = 0; k < 4; k++) { const i = (E.tables[k] || []).findIndex(r => r[0] === id); if (i >= 0) return ord(i + 1) + ' en L' + (k + 1); } return 'nouveau'; }
const apLg = l => '<span class="apvlg" style="background:' + (l >= 0 ? OFX_LC[l] : '#6b7480') + '">' + (l >= 0 ? 'L' + (l + 1) : 'R') + '</span>';
const apPn = (t, b, c) => '<div class="apvpn' + (c ? ' ' + c : '') + '"><div class="apvph">' + t + '</div><div class="apvpb">' + b + '</div></div>';
function apSide(l) {
  const P = S.hist[S.season - 2], E = P && P.end, ch = E && E.tables[l] && E.tables[l][0], ids = S.L[l].filter(id => S.G[id]);
  const yo = ids.slice().sort((a, b) => S.G[a].a - S.G[b].a), O = apOdds(l), all = [].concat(...S.L).filter(id => S.G[id]);
  let h = '';
  if (ch) { const nl = leagueOf(ch[0]); h += apPn('Champion en titre', '<div class="apvch">' + offLnk(ch[0]) + '<span>' + ch[1] + ' pts en ' + yr(S.season - 1) + '</span><span>' + (nl === l ? 'Il défend son titre' : nl >= 0 && nl < l ? 'Monté en L' + (nl + 1) : nl > l ? 'Descendu en L' + (nl + 1) : 'Retraité') + '</span></div>'); }
  if (yo.length) h += apPn('Le plus jeune · le plus vieux', '<div class="apvrow"><span>Le plus jeune</span><span class="apvr">' + offLnk(yo[0]) + ' · ' + S.G[yo[0]].a + ' ans</span></div><div class="apvrow"><span>Le plus vieux</span><span class="apvr">' + offLnk(yo[yo.length - 1]) + ' · ' + S.G[yo[yo.length - 1]].a + ' ans</span></div>');
  const dn = l < 3 ? ids.map(id => [id, apStr(id, l)]).sort((a, b) => a[1] - b[1]).slice(0, 2).map(x => offLnk(x[0])).join(', ') : '';
  h += apPn('Nos pronostics', (l === 0 ? (O[0] ? '<div class="apvrow"><b>🏆 Champion</b><span class="apvr">' + offLnk(O[0].id) + '</span></div>' : '') : '<div class="apvrow"><b>▲ Montent</b><span class="apvr">' + O.slice(0, 3).map(x => offLnk(x.id)).join(', ') + '…</span></div>' + (O.length ? '<div class="apvrow"><span>🏆 Titre de la L' + (l + 1) + '</span><span class="apvr">' + offLnk(O[0].id) + '</span></div>' : '')) + (dn ? '<div class="apvrow"><span>▼ Descendent</span><span class="apvr">' + dn + '</span></div>' : ''));
  const nRk = all.filter(id => isRookie(S.G[id])).length, x = E && E.x, nRt = x && x.rt ? x.rt.length : 0, avg = ids.length ? (ids.reduce((a, id) => a + S.G[id].a, 0) / ids.length).toFixed(1) : '–';
  h += apPn('La saison en chiffres', '<div class="apvnum"><div><b>' + all.length + '</b><span>golfeurs sur le circuit</span></div><div><b>' + nRk + '</b><span>recrues</span></div><div><b>' + nRt + '</b><span>retraités cet hiver</span></div><div><b>' + avg + '</b><span>âge moyen en L' + (l + 1) + '</span></div></div>');
  return h;
}
function apL1HTML() {
  const O = apOdds(0).slice(0, 10);
  return apPn('Les 10 favoris pour le titre de la Ligue 1', '<table class="apvt"><tr><th></th><th class="l">Golfeur</th><th>Âge</th><th>Saison passée</th><th>Cote au titre</th></tr>' + O.map((x, i) => '<tr><td class="apvn">' + (i + 1) + '</td><td class="l">' + offLnk(x.id) + ' <span class="apvtag">' + TIERS[tierOf(S.G[x.id])][1] + '</span></td><td>' + S.G[x.id].a + '</td><td>' + apLastRk(x.id) + '</td><td class="apvodd">' + apOdd(x.p) + '</td></tr>').join('') + '</table>');
}
function apUpHTML(l) {
  const O = apOdds(l), N = apUpN(l), s = S.season;
  const picks = AP_AN.map((n, a) => O.slice(0, 18).map(x => [x.id, x.p + (plHash(x.id, s * 3 + a) - 0.5) * 0.36]).sort((p, q) => q[1] - p[1]).slice(0, N).map(x => x[0]));
  const votes = id => picks.filter(L => L.includes(id)).length;
  const P = S.hist[S.season - 2], E = P && P.end, wasUp = id => E && E.tables[l - 1] && E.tables[l - 1].some(r => r[0] === id);
  const qk = x => { const g = S.G[x.id]; return wasUp(x.id) ? 'aDown' : isRookie(g) ? 'aRk' : g.a <= 22 ? 'aYoung' : g.a >= 35 ? 'aVet' : x.p >= 0.7 ? 'aHi' : x.p >= 0.3 ? 'aMid' : 'aLo'; };
  const row = (x, c) => '<div class="apvan"><div><div>' + offLnk(x.id) + ' <span class="apvsub">' + S.G[x.id].a + ' ans · ' + TIERS[tierOf(S.G[x.id])][1] + (isRookie(S.G[x.id]) ? ' · R' : '') + '</span></div><div class="apvq">' + apQ(qk(x), x.id, s) + '</div></div><div class="apvvt" title="' + votes(x.id) + ' / 3">' + '●'.repeat(votes(x.id)) + '<i>' + '●'.repeat(3 - votes(x.id)) + '</i></div><b style="color:' + c + '">' + apPct(x.p) + '</b></div>';
  const grp = (t, sub, A, c, k) => A.length ? '<div class="apvgrp"><div class="apvgh"><b style="color:' + c + '">' + t + '</b><span>' + sub + '</span></div>' + A.slice(0, k).map(x => row(x, c)).join('') + (A.length > k ? '<p class="apvsub" style="margin:6px 0 0">… et ' + (A.length - k) + ' autres</p>' : '') + '</div>' : '';
  return apPn('Selon nos analystes · <span class="notr">' + AP_AN.join(', ') + '</span>', '<p class="apvlead">' + N + ' places pour la Ligue ' + l + '. ●●● = choisi par les trois analystes.</p>' +
    grp('Quasi assurés', 'plus de 70 %', O.filter(x => x.p >= 0.7), '#3DDC84', 12) + grp('Dans la course', 'de 30 à 70 %', O.filter(x => x.p >= 0.3 && x.p < 0.7), '#F0C419', 12) + grp('Les négligés', 'moins de 30 %, mais à ne pas oublier', O.filter(x => x.p < 0.3 && x.p >= 0.05), '#8fb8ff', 5));
}
function apProspectsHTML() {
  const t = S.season; if (!S.pl || !S.pl[t]) plBuild(t);
  const L = S.pl[t] || [], prev = S.pl[t - 1] || [], pr = new Map(prev.map((r, i) => [r[0], i + 1]));
  if (!L.length) return '<p class="apvlead">Aucun espoir classé cette saison.</p>';
  const mv = (r, i) => { const p = pr.get(r[0]); return p == null ? '<span class="apvnew">NOUVEAU</span>' : p > i + 1 ? '<span class="apvup">▲' + (p - i - 1) + '</span>' : p < i + 1 ? '<span class="apvdn">▼' + (i + 1 - p) + '</span>' : '<span class="apvsub">=</span>'; };
  const grads = prev.filter(r => !L.some(q => q[0] === r[0]) && S.G[r[0]] && leagueOf(r[0]) === 0);
  const eta = r => { const l = leagueOf(r[0]); if (l <= 0) return l === 0 ? 'Déjà en L1' : ''; const n = Math.max(l, Math.ceil((5 - scale(TIERS, r[1])) / 1.5)); return 'La L1 dans ' + n + ' saison' + (n > 1 ? 's' : '') + ' ?'; };
  const n1 = L[0];
  let h = '<div class="apvstar"><div class="apvbig">#1</div><div><div class="apvstn">' + offLnk(n1[0]) + '</div><div class="apvsub">' + n1[3] + ' ans · ' + (leagueOf(n1[0]) >= 0 ? 'Ligue ' + (leagueOf(n1[0]) + 1) : 'Classe de recrues') + ' · ' + plLv(n1) + (eta(n1) ? ' · ' + eta(n1) : '') + '</div><div class="apvq big">' + plQuote(n1, t) + '</div></div></div>';
  h += apPn('Le classement', '<div class="scroll"><table class="apvt"><tr><th>#</th><th>Mvt</th><th class="l">Golfeur</th><th>Âge</th><th>Ligue</th><th class="l">Niveau → potentiel</th><th class="l">Les dépisteurs</th></tr>' + L.slice(1).map((r, i) => '<tr><td class="apvn">' + (i + 2) + '</td><td>' + mv(r, i + 1) + '</td><td class="l">' + offLnk(r[0]) + (S.G[r[0]] && isRookie(S.G[r[0]]) ? ' <span class="apvsub">R</span>' : '') + '</td><td>' + r[3] + '</td><td>' + apLg(leagueOf(r[0])) + '</td><td class="l">' + plLv(r) + '</td><td class="l apvq">' + plQuote(r, t) + '</td></tr>').join('') + '</table></div>');
  const side = apPn('La liste en chiffres', '<div class="apvnum"><div><b>' + L.filter(r => !pr.has(r[0])).length + '</b><span>nouveaux</span></div><div><b>' + L.filter(r => r[3] <= 21).length + '</b><span>21 ans et moins</span></div><div><b>' + L.filter(r => leagueOf(r[0]) === 3 || leagueOf(r[0]) < 0).length + '</b><span>encore en L4</span></div><div><b>' + grads.length + '</b><span>diplômés en L1</span></div></div>') +
    apPn('Les diplômés · arrivés en L1', grads.length ? grads.map(r => '<div class="apvrow">' + offLnk(r[0]) + '<span class="apvr">n° ' + pr.get(r[0]) + ' l’an passé</span></div>').join('') : '<span class="apvsub">Aucun cette année.</span>') +
    apPn('Qui est éligible ?', '<p class="apvsub" style="margin:0">27 ans et moins, sans avoir commencé une saison en L1 avant celle-ci. Classés par nos dépisteurs : surtout le potentiel, puis le niveau actuel. Les dépisteurs peuvent se tromper.</p>');
  return '<div class="apvg2"><div class="apvc">' + h + '</div><div class="apvc">' + side + '</div></div>';
}
function apPreviewHTML() {
  const tab = VIEW.apt != null ? VIEW.apt : 0, ns = S.season;
  const tabs = '<div class="apvtabs" role="tablist">' + ['Ligue 1', 'Ligue 2', 'Ligue 3', 'Ligue 4', '⭐ Top 30 Prospects'].map((t, i) => '<button type="button" role="tab" aria-selected="' + (i === tab) + '" class="' + (i === tab ? 'on' : '') + '" data-a="apt" data-v="' + i + '" style="--c:' + (i < 4 ? OFX_LC[i] : '#F0C419') + '">' + t + '</button>').join('') + '</div>';
  const sub = tab === 4 ? 'Les meilleurs espoirs du monde, selon nos dépisteurs.' : tab === 0 ? 'La course au titre de la Ligue 1.' : 'Qui va monter en Ligue ' + tab + ' ?';
  let h = '<div class="ofxnm" role="heading" aria-level="2">Saison ' + yr(ns) + '</div><p class="ofrtl"><span>' + sub + '</span></p>' + tabs;
  if (tab === 4) return h + apProspectsHTML();
  return h + '<div class="apvg2"><div class="apvc">' + (tab === 0 ? apL1HTML() : apUpHTML(tab)) + '</div><div class="apvc">' + apSide(tab) + '</div></div>';
}
/* ---- Historique › Top Prospects ---- */
function vPlHist() {
  if (!S.pl) plBackfill();
  const ys = Object.keys(S.pl || {}).map(Number).filter(t => S.pl[t] && S.pl[t].length).sort((a, b) => b - a);
  if (!ys.length) return '<p class="mute">Aucune liste pour l’instant : la première sera publiée à l’avant-saison.</p>';
  const t = ys.includes(VIEW.ply) ? VIEW.ply : ys[0], L = S.pl[t];
  const k = ys.indexOf(t), older = ys[k + 1], newer = ys[k - 1];   // v455 : menu déroulant + flèches (demande de Max)
  let h = '<div class="rcnav apvnav"><button class="btn sec sm" data-a="ply" data-v="' + (older || '') + '"' + (older ? '' : ' disabled') + ' aria-label="Année précédente">‹</button><select data-c="plyr" aria-label="Choisir une année">' + ys.map(y => '<option value="' + y + '"' + (y === t ? ' selected' : '') + '>' + yr(y) + '</option>').join('') + '</select><button class="btn sec sm" data-a="ply" data-v="' + (newer || '') + '"' + (newer ? '' : ' disabled') + ' aria-label="Année suivante">›</button></div>';
  const now = id => { const g = S.G[id]; if (!g) return '<span class="mute">Retraité</span>'; const l = leagueOf(id); return apLg(l) + ' ' + TIERS[tierOf(g)][1]; };
  const earn = id => { const g = S.G[id] || (S.old && S.old[id]); return g && g.ce > 0 ? fmtM(g.ce) : '—'; };
  const tbl = '<div class="scroll"><table class="apvt light"><tr><th>#</th><th class="l">Golfeur</th><th>Âge alors</th><th class="l">Alors</th><th class="l">Aujourd’hui</th><th>Gains en carrière</th></tr>' + L.map((r, i) => '<tr><td class="apvn">' + (i + 1) + '</td><td class="l">' + flagVisual(natOf(r[0]), 18) + ' <a href="#" data-a="golfer" data-id="' + r[0] + '">' + esc(nameOf(r[0])) + '</a></td><td>' + r[3] + '</td><td class="l">' + plLv(r) + '</td><td class="l">' + now(r[0]) + '</td><td><b>' + earn(r[0]) + '</b></td></tr>').join('') + '</table></div>';
  // records des listes
  const n1 = {}, app = {}; ys.forEach(y => { const q = S.pl[y]; if (q[0]) n1[q[0][0]] = (n1[q[0][0]] || 0) + 1; q.forEach(r => app[r[0]] = (app[r[0]] || 0) + 1); });
  const top = o => { const k = Object.keys(o).sort((a, b) => o[b] - o[a])[0]; return k != null ? [+k, o[k]] : null; };
  const yng = ys.map(y => [S.pl[y][0], y]).filter(x => x[0]).sort((a, b) => a[0][3] - b[0][3])[0];
  const listed = new Set(Object.keys(app).map(Number)), cand = [];
  Object.keys(S.G).concat(Object.keys(S.old || {})).forEach(k => { const id = +k, g = S.G[id] || S.old[id]; if (!id || listed.has(id) || !g || !(g.ce > 0)) return; cand.push([id, g.ce]); });
  const forgot = cand.sort((a, b) => b[1] - a[1]).find(([id]) => { const g = S.G[id] || S.old[id], a0 = S.G[id] ? g.a - (S.season - ys[ys.length - 1]) : g.a - (g.s - ys[ys.length - 1]); return a0 <= PL_AGE; });
  const rec = (k, v) => '<div class="apvrow"><span>' + k + '</span><span class="apvr">' + v + '</span></div>', a1 = top(n1), aa = top(app);
  const side = '<div class="block"><h3>Records des listes</h3>' + (a1 ? rec('Le plus de saisons au n° 1', offLnk(a1[0]) + ' · ' + a1[1]) : '') + (aa ? rec('Le plus d’apparitions', offLnk(aa[0]) + ' · ' + aa[1]) : '') + (yng ? rec('Le plus jeune n° 1', offLnk(yng[0][0]) + ' · ' + yng[0][3] + ' ans (' + yr(yng[1]) + ')') : '') + (forgot ? rec('Le plus grand oublié', offLnk(forgot[0]) + ' · ' + fmtM(forgot[1])) : '') + '<p class="small mute" style="margin:8px 0 0">Le plus grand oublié : jamais classé, et les plus gros gains en carrière.</p></div>' +
    '<div class="block"><h3>Qui est éligible ?</h3><p class="small mute" style="margin:0">27 ans et moins, sans avoir commencé une saison en L1 avant celle-ci. Les listes des saisons jouées avant la v454 ont été refaites à partir des niveaux de fin de saison.</p></div>';
  return h + (isPC() ? '<div class="apvg2"><div class="block"><h3>Top 30 Prospects ' + yr(t) + ' · et ce qu’ils sont devenus</h3>' + tbl + '</div><div>' + side + '</div></div>' : '<div class="block"><h3>Top 30 Prospects ' + yr(t) + '</h3>' + tbl + '</div>' + side);
}
function plBioHTML(id) {
  const R = plRanks(id); if (!R.length) return '';
  return '<div class="block"><h3>⭐ Top 30 Prospects</h3>' + R.map(([t, k]) => '<div class="apvrow"><span>' + yr(t) + '</span><span class="apvr">Classé n° ' + k + ' dans le Top 30 des espoirs</span></div>').join('') + '</div>';
}
