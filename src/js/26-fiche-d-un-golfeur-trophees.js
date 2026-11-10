/* ======== Fiche d'un golfeur : trophées (bannières de saison + vitrine de tournois), meilleurs scores, rivaux ========
   Tout est calculé à partir de l'historique (S.hist) ; rien n'est ajouté à la sauvegarde. */
const TZ_GOLD = '#E3B12C', TZ_SILV = '#C9CED6', TZ_BRON = '#C47A3A', TZ_LGC = ['#E3B12C', '#D8C48A', '#BFC6CD', '#B8875A'];
let TZ_UID = 0;
function tzCup(c, w) {
  const g = 'tzg' + (TZ_UID++);
  return '<svg width="' + w + '" height="' + Math.round(w * 1.15) + '" viewBox="0 0 40 46" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" x2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".8"/><stop offset=".42" stop-color="#fff" stop-opacity=".6"/><stop offset=".58" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '" stop-opacity=".85"/></linearGradient></defs>' +
    '<path d="M9 4h22v8c0 7-5 12-11 12S9 19 9 12z" fill="url(#' + g + ')" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><path d="M9 7H3c0 6 3 9 7 9M31 7h6c0 6-3 9-7 9" fill="none" stroke="' + c + '" stroke-width="2.4"/><rect x="18" y="24" width="4" height="8" fill="' + c + '"/><path d="M12 32h16l2 6H10z" fill="' + c + '" stroke="rgba(0,0,0,.3)" stroke-width=".8"/><rect x="8" y="38" width="24" height="6" rx="1" fill="#3a2a1a"/></svg>';
}
/* Victoires de tournoi (de la plus forte ligue à la plus faible, les plus récentes d'abord) et podiums de saison (titres, puis 2es, puis 3es) */
function golferTrophies(id) {
  const c0 = careerStart(id), wins = [], seas = [];
  S.hist.forEach(H => {
    if (H.s <= c0) return;
    H.t.forEach(t => { if (!t) return; for (let l = 0; l < 4; l++) { const r = t.lg[l] && t.lg[l].rows[0]; if (r && r[0] === id && r[1] === 1) wins.push({ s: H.s, l, n: t.name }); } });
    { const F = H.fin, r = F && F.lg && F.lg[0] && F.lg[0].rows && F.lg[0].rows[0]; if (r && r[0] === id && r[1] === 1) wins.push({ s: H.s, l: 0, n: F.name, fin: 1 }); }   // v325 : la Finale compte
    if (H.end) for (let l = 0; l < 4; l++) { const i = H.end.tables[l].findIndex(r => r[0] === id && !r[5]); if (i >= 0 && i < 10) seas.push({ s: H.s, l, p: i + 1 }); }
  });
  S.hist.forEach(H => { if (H.end && H.end.roy && H.end.roy.id === id) seas.push({ s: H.s, l: H.end.roy.l, p: 0, roy: 1 }); });
  try { const hm = S.hof && S.hof.m.find(m => m.k === hofCurKey(id)); if (hm) seas.push({ s: hm.s, l: 0, p: -1, hof: 1, y: hm.y }); } catch (e) { }
  wins.sort((a, b) => a.l - b.l || b.s - a.s);
  seas.sort((a, b) => (a.roy ? 99 : a.p) - (b.roy ? 99 : b.p) || a.l - b.l || b.s - a.s);
  return { wins, seas };
}
const tzMoney = n => n >= 1e6 ? (LANG === 'en' ? '$' + (Math.round(n / 1e5) / 10) + 'M' : (Math.round(n / 1e5) / 10).toString().replace('.', ',') + ' M$') : fmtMoney(n);
function tzBanner(x, cls) {
  if (x.hof) return '<div class="tzbn phof' + (cls ? ' ' + cls : '') + '" title="Temple de la renommée, intronisé en ' + yr(x.s) + '" data-a="hof" style="cursor:pointer"><div class="tzbt">\u2605</div><div class="tzbs">' + yr(x.s) + '</div><div class="tzbl">Temple de la<br>renommée</div></div>';
  if (x.roy) return '<div class="tzbn proy' + (cls ? ' ' + cls : '') + '" title="Recrue de l’année ' + yr(x.s) + '"><div class="tzbt">\u2726</div><div class="tzbs">' + yr(x.s) + '</div><div class="tzbl">Recrue<br>de l’année</div></div>';
  return '<div class="tzbn ' + (x.p <= 3 ? 'p' + x.p : 'pt') + (cls ? ' ' + cls : '') + '" title="' + (x.p === 1 ? 'Champion' : ord(x.p) + ' place') + ' de la ' + LEAGUE_NAMES[x.l] + ', saison ' + yr(x.s) + '"><div class="tzbt">' + (x.p === 1 ? '★' : ord(x.p)) + '</div><div class="tzbs">' + yr(x.s) + '</div><div class="tzbl">' + (x.p === 1 ? 'Champion' : ord(x.p) + ' place') + '<br>Ligue ' + (x.l + 1) + '</div></div>';
}
function tzShelves(T, big) {
  const W = big ? [42, 35, 30, 26] : [36, 30, 26, 22];
  return [0, 1, 2, 3].filter(l => T.wins.some(w => w.l === l)).map(l => {
    const ws = T.wins.filter(w => w.l === l);
    return '<div class="tzshelf"><span class="tzslbl">Ligue ' + (l + 1) + '<b>' + ws.length + '</b></span>' + ws.map(w => '<div class="tztro" title="' + esc(w.n) + ' · ' + yr(w.s) + '"><div class="tzcupw">' + tzCup(TZ_LGC[l], W[l]) + '</div><div class="tzplq l' + l + '">' + yr(w.s) + (big ? '<small>' + esc(w.n) + '</small>' : '') + '</div></div>').join('') + '</div>';
  }).join('');
}
/* Panneau complet : rail de bannières, vitrine par ligue, gains et chiffres (retraités, actifs sur PC, et vue dépliée sur téléphone) */
function tzPanel(T, earn, opts) {
  opts = opts || {};
  let h = '<div class="tzpanel' + (opts.cls ? ' ' + opts.cls : '') + '">';
  if (T.seas.length) h += '<div class="tzrail">' + T.seas.map(x => tzBanner(x)).join('') + '</div>';
  else h += '<div class="tzrail empty"></div>';
  if (opts.head) h += opts.head;
  h += T.wins.length ? '<div class="tzcase">' + tzShelves(T, opts.big) + '</div>' : '<p class="tzempty">Aucune victoire de tournoi' + (opts.active ? ' pour l’instant' : '') + '.</p>';
  h += '<div class="tzstat"><div class="tzmon"><small>Gains en carrière' + (opts.active ? ', jusqu’à maintenant' : '') + '</small><b>' + tzMoney(earn) + '</b></div>' +
    (opts.stats ? '<div><b>' + T.wins.length + '</b><small>victoire' + (T.wins.length > 1 ? 's' : '') + '</small></div><div><b>' + T.seas.filter(x => x.p === 1).length + '</b><small>titre' + (T.seas.filter(x => x.p === 1).length > 1 ? 's' : '') + ' de saison</small></div><div><b>' + T.seas.filter(x => x.p > 1 && x.p <= 3).length + '</b><small>autres podiums</small></div><div><b>' + T.seas.filter(x => x.p > 3).length + '</b><small>autres top 10</small></div>' + (opts.cs ? '<div><b>' + opts.cs + '</b><small>saisons</small></div>' : '') : '') + '</div>';
  if (opts.pid != null) h += '<a href="#" class="tzlink" data-a="palm" data-id="' + opts.pid + '">Voir le palmarès ›</a>';   // v377
  return h + '</div>';
}
/* v320 : panneau « Saison » du profil : rang et points dans la ligue, écarts, zone (Finale, promotion, relégation),
   chiffres de la saison ; trophées et gains en carrière réduits à une ligne (la vitrine complète s'ouvre au besoin). */
function seaPanel(id, l, T, earn, mob) {
  if (l < 0 || l > 3 || !S.L[l] || !S.L[l].includes(id)) return '';
  const H = S.hist[S.season - 1], played = H && H.t ? H.t.filter(t => t && t.lg && t.lg[l]).length : 0;
  const st = getSt(id), shF = golferHistory(id, false, true).filter(x => x.s === S.season), sh = shF.filter(x => !x.fin), sEarn = shF.reduce((a, x) => a + (x.pay || 0), 0);   // v325 : la Finale compte dans les gains et les résultats
  const nT = sh.length, mc = sh.filter(x => x.mc || !(x.pos > 0)).length;
  const head = '<div class="seak"><span>Saison ' + yr(S.season) + '</span> \u00b7 <span>' + LEAGUE_SHORT_L(l) + '</span>' + (played ? ' \u00b7 <span>apr\u00e8s ' + played + ' tournoi' + (played > 1 ? 's' : '') + '</span>' : '') + '</div>';
  let body = '';
  if (!played) {
    body = '<p class="seanone">La saison n\u2019est pas encore commenc\u00e9e.</p>';
    const P = S.hist[S.season - 2], E = P && P.end && P.end.tables;   // rappel de la saison passée
    if (E) for (let k = 0; k < 4; k++) { const i = (E[k] || []).findIndex(r => r[0] === id && !r[5]); if (i >= 0) { body += '<div class="sear" style="margin-top:14px"><div><b class="seabig">' + ord(i + 1).replace(/(\d+)(\D+)$/, '$1<sup>$2</sup>') + '</b><small><span>en Ligue ' + (k + 1) + '</span> <span>la saison pass\u00e9e</span></small></div><div><b class="seabig seapt">' + E[k][i][1] + '</b><small>points</small></div></div>'; break; } }
  }
  else {
    const list = displayRank(l).filter(r => !r.gh); markZones(list, l, 'up', 'dn', null);
    const me = list.find(r => r.id === id); if (!me) return '';
    const rk = list.indexOf(me) + 1, pts = me.pts, top = list[0].pts, ptsAt = n => list[n - 1] ? list[n - 1].pts : null, d = v => (v > 0 ? '+' : v < 0 ? '\u2212' : '') + Math.abs(v) + ' pts';
    const notes = [];
    notes.push(rk === 1 ? (list[1] ? '<span>' + d(pts - list[1].pts) + ' sur le ' + ord(2) + '</span>' : '') : '<span>' + d(pts - top) + ' du ' + ord(1) + '</span>');
    let cut = null, cutLbl = '';
    if (l === 0 && finOn()) { cut = FIN.n; cutLbl = 'Finale'; }
    else if (l > 0) { const lu = list.reduce((m, r, i) => r.zone === 'up' ? i + 1 : m, 0); if (lu) { cut = lu; cutLbl = 'promotion'; } }
    if (cut) notes.push(rk <= cut ? (ptsAt(cut + 1) != null ? '<span class="mute">' + d(pts - ptsAt(cut + 1)) + ' sur le ' + ord(cut + 1) + ' (' + cutLbl + ')</span>' : '') : '<span class="mute">' + d(pts - ptsAt(cut)) + ' du ' + ord(cut) + ' (' + cutLbl + ')</span>');
    if (me.zone === 'dn') { const fd = list.findIndex(r => r.zone === 'dn'); if (fd > 0) notes.push('<span class="seadn">Zone de rel\u00e9gation \u00b7 ' + d(pts - list[fd - 1].pts) + ' du maintien</span>'); }
    if (me.mv && new Set(sh.map(x => x.l)).size < 2) notes.push('<span class="mute">Arriv\u00e9 en cours de saison : points gagn\u00e9s dans cette ligue</span>');
    const w = top > 0 ? Math.max(0, Math.min(100, pts / top * 100)) : 0, cw = cut && top > 0 && ptsAt(cut) != null ? Math.max(0, Math.min(100, ptsAt(cut) / top * 100)) : null;
    body = '<div class="sear"><div><b class="seabig">' + ord(rk).replace(/(\d+)(\D+)$/, '$1<sup>$2</sup>') + '</b><small>au classement</small></div><div><b class="seabig seapt">' + pts + '</b><small>points</small></div>' +
      '<div class="sean">' + notes.filter(Boolean).map(x => '<div>' + x + '</div>').join('') + '</div></div>' +
      '<div class="seabar"><i style="width:' + w.toFixed(1) + '%"></i>' + (cw != null ? '<span style="left:' + cw.toFixed(1) + '%"></span>' : '') + '</div>' +
      (cw != null ? '<div class="seabl"><span>Barre : points par rapport au meneur</span> \u00b7 <span>trait jaune : ' + (cutLbl === 'Finale' ? 'place en Finale (top ' + cut + ')' : 'derni\u00e8re place de promotion') + '</span></div>' : '');
  }
  const ch = (v, t) => '<span class="seac"><b>' + v + '</b> <span>' + t + '</span></span>';
  const chips = played ? '<div class="seacs">' + ch(st.w || 0, 'victoire' + ((st.w || 0) > 1 || (LANG === 'en' && !st.w) ? 's' : '')) + ch(st.t10 || 0, 'top 10') + (nT ? ch((nT - mc) + '/' + nT, 'coupures') : '') + ch(tzMoney(sEarn), 'cette saison') + '</div>' : '';
  const rs = shF.slice().sort((a, b) => (a.fin ? 99 : a.t) - (b.fin ? 99 : b.t));   // résultats de la saison, tournoi par tournoi
  const pill = x => { const ps = x.pos > 0, c = !ps || (!x.pts && !x.fin && x.l !== 4 && x.pos > 1) ? 'mc' : x.pos === 1 ? 'w' : x.pos <= 10 ? 't' : '';   /* v344 : une ronde, sans points = rouge comme une coupure ratée */ return '<a href="#" class="sear1 ' + c + (x.fin ? ' fin' : '') + '" data-a="ptab" data-v="log" title="' + (x.fin ? 'Finale \u00b7 ' : '') + esc(x.name) + '">' + (x.fin ? '<small>F</small>' : '') + (ps ? (x.pos === 1 ? '\ud83c\udfc6' : x.pos) : 'CUT') + '</a>'; };
  let res = rs.length ? '<div class="sears"><span class="seark">R\u00e9sultats</span>' + rs.map(pill).join('') + '</div>' : '';
  /* v323 : saison partagée entre plusieurs ligues → un bloc par ligue (ligue actuelle d'abord) */
  const lgs = [...new Set(rs.map(x => x.l))];
  if (lgs.length > 1) {
    lgs.sort((a, b) => (a === l ? -1 : b === l ? 1 : 0) || Math.max(...rs.filter(x => x.l === b).map(x => x.t)) - Math.max(...rs.filter(x => x.l === a).map(x => x.t)));
    res = lgs.map(L => {
      const xs = rs.filter(x => x.l === L), xt = xs.filter(x => !x.fin), t0 = (xt[0] || xs[0]).t + 1, t1 = (xt[xt.length - 1] || xs[0]).t + 1, w = xs.filter(x => x.pos === 1).length, t10 = xs.filter(x => x.pos > 0 && x.pos <= 10).length, ok = xt.filter(x => x.pos > 0).length, pay = xs.reduce((a, x) => a + (x.pay || 0), 0);
      let note = '<span>' + (t0 === t1 ? 'tournoi ' + t0 : 'tournois ' + t0 + ' \u00e0 ' + t1) + '</span>' + (xs.some(x => x.fin) ? ' \u00b7 <span>Finale</span>' : '');
      if (L !== l) {
        note += ' \u00b7 <span>' + (L > l ? 'avant sa promotion' : 'avant sa rel\u00e9gation') + '</span>';
        if (L > l) { try { const ra = rankAll(L), i = ra.findIndex(r => r.id === id); if (i >= 0) note += ' \u00b7 <span>' + ord(i + 1) + ' au classement de la L' + (L + 1) + ' avec ' + ra[i].pts + ' pts</span>'; } catch (e) { } }
      }
      return '<div class="seal"><div class="sealh"><span class="sealt" style="background:var(--lg' + (L + 1) + ')">' + LEAGUE_SHORT_L(L) + '</span><span class="sealn">' + note + '</span></div><div class="sealr">' + xs.map(pill).join('') + '<span class="sealsep"></span>' +
        (w ? ch(w, 'victoire' + (w > 1 ? 's' : '')) : '') + ch(t10, 'top 10') + ch(ok + '/' + xt.length, 'coupures') + ch(tzMoney(pay), '') + '</div></div>';
    }).join('');
    res = '<div class="seals">' + res + '</div>';
  }
  const nW = T.wins.length, nS = T.seas.filter(x => x.p === 1).length, hasCase = nW || T.seas.length;
  const foot = mob ? '' : '<div class="seaf"><span>\ud83c\udfc6 ' + (nW ? '<b>' + nW + '</b> <span>victoire' + (nW > 1 ? 's' : '') + ' en carri\u00e8re</span>' + (nS ? ' \u00b7 <b>' + nS + '</b> <span>titre' + (nS > 1 ? 's' : '') + ' de saison</span>' : '') : '<span class="mute">Aucune victoire en carri\u00e8re</span>') +
    (hasCase ? ' \u00b7 <a href="#" data-a="tzfull">' + ('Voir le palmarès') + '</a>' : '') + '</span><span><b class="seamon">' + tzMoney(earn) + '</b> <span class="mute">gains en carri\u00e8re</span></span></div>';
  return '<div class="seap' + (mob ? ' seamob block' : ' tzpc') + '">' + head + body + (lgs.length > 1 ? '' : chips) + res + foot + '</div>';
}
const LEAGUE_SHORT_L = l => 'Ligue ' + (l + 1);
/* Colonne étroite à droite de la carte de niveau (téléphone) */
function tzSide(T, earn) {
  const cnt = [0, 1, 2, 3].map(l => T.wins.filter(w => w.l === l).length);
  let h = '<button type="button" class="tzside" data-a="tzfull" aria-label="Voir les bannières et la vitrine">';
  h += '<div class="tzsrail">' + T.seas.slice(0, 6).map(x => '<div class="tzsbn ' + (x.hof ? 'phof' : x.roy ? 'proy' : x.p <= 3 ? 'p' + x.p : 'pt') + '"><span>' + (x.hof ? '\u2605' : x.roy ? '\u2726' : x.p === 1 ? '★' : ord(x.p)) + '</span><b>' + String(yr(x.s)).slice(-2) + '</b></div>').join('') + (T.seas.length > 6 ? '<div class="tzsmore">+' + (T.seas.length - 6) + '</div>' : '') + '</div>';
  if (!T.wins.length && !T.seas.length) h += '<div class="tznone">' + tzCup('#6f7a70', 30) + '<span>Aucun troph\u00e9e pour l\u2019instant</span></div>';
  if (T.wins.length) h += '<div class="tzscup">' + tzCup(TZ_GOLD, 30) + '<b>' + T.wins.length + '</b></div><div class="tzslg">' + cnt.map((c, l) => c ? 'L' + (l + 1) + ' · ' + c : '').filter(Boolean).join(' ') + '</div>';
  const m = tzMoney(earn), mm = m.replace(/ M\$$/, '');
  h += '<div class="tzsmon"><b>' + (mm !== m ? mm : m) + '</b><small>' + (mm !== m ? 'M$ en carrière' : 'en carrière') + '</small></div></button>';
  return h;
}
/* 10 meilleures rondes et 10 meilleurs totaux */
function golferBestScores(id) {
  const c0 = careerStart(id), rounds = [], tots = [];
  S.hist.forEach(H => {
    if (H.s <= c0) return;
    H.t.forEach(t => {
      if (!t) return;
      for (let l = 0; l < 4; l++) {
        const r = t.lg[l] && t.lg[l].rows.find(x => x[0] === id); if (!r) continue;
        const par = t.par || 72, base = { s: H.s, l, n: t.name, pos: r[1] };
        rounds.push(Object.assign({ v: r[2], st: r[2] + par, rd: 1 }, base));
        if (r[3] != null) { rounds.push(Object.assign({ v: r[3], st: r[3] + par, rd: 2 }, base)); tots.push(Object.assign({ v: r[2] + r[3], st: r[2] + r[3] + 2 * par }, base)); }
        break;
      }
    });
  });
  const by = (a, b) => a.v - b.v || a.st - b.st || b.s - a.s;
  return { rounds: rounds.sort(by).slice(0, 10), tots: tots.sort(by).slice(0, 10) };
}
function bestScoresHTML(id) {
  const B = golferBestScores(id); if (!B.rounds.length) return '';
  const row = (x, i, isTot) => '<tr><td class="mute">' + (i + 1) + '</td><td class="r"><b class="' + cls(x.v) + '">' + fmt(x.v) + '</b> <span class="mute small">(' + x.st + ')</span></td><td>' + yr(x.s) + ' · L' + (x.l + 1) + '</td><td class="bsn">' + esc(x.n) + '</td><td class="r">' + (isTot ? (x.pos === 1 ? '<span class="tag good">1er</span>' : ord(x.pos)) : 'R' + x.rd) + '</td></tr>';
  const tb = (title, arr, isTot) => '<div class="bsb"><h3>' + title + '</h3><div class="scroll"><table class="plain bst"><tr><th>#</th><th class="r">Score</th><th>Saison</th><th>Tournoi</th><th class="r">' + (isTot ? 'Pos' : 'Ronde') + '</th></tr>' + arr.map((x, i) => row(x, i, isTot)).join('') + '</table></div></div>';
  return '<h2>Meilleurs scores</h2>' + tb('10 meilleures rondes', B.rounds, false) + (B.tots.length ? tb('10 meilleurs totaux de tournoi', B.tots, true) : '');
}
/* Face-à-face : chaque tournoi joué dans la même ligue est un duel ; celui qui finit devant gagne (deux coupures ratées : duel nul, non compté). */
function golferH2H(id) {
  const c0 = careerStart(id), M = {};
  S.hist.forEach(H => {
    if (H.s <= c0) return;
    H.t.forEach(t => {
      if (!t) return;
      for (let l = 0; l < 4; l++) {
        const rows = t.lg[l] && t.lg[l].rows; if (!rows) continue;
        const me = rows.find(r => r[0] === id); if (!me) continue;
        const mp = me[1] || 999;
        rows.forEach(r => {
          if (r[0] === id) return; const op = r[1] || 999; if (mp === 999 && op === 999) return;
          const o = M[r[0]] || (M[r[0]] = { id: r[0], m: 0, w: 0, l: 0, t10: 0, tw: 0, ow: 0, ol: 0 });
          o.m++; if (mp < op) o.w++; else if (op < mp) o.l++;
          if (mp <= 10 && op <= 10) { o.t10++; if (mp < op) o.tw++; }
          if (mp === 1 && op === 2) o.ow++; else if (op === 1 && mp === 2) o.ol++;
        });
        break;
      }
    });
  });
  return Object.values(M);
}
