/* ============ v243 : Chronologie d'un golfeur (le « film » de sa carrière) ============
   Tout est reconstitué à partir de l'historique permanent (tournois et bilans de fin de saison) :
   victoires, exploits, montées/descentes en cours de saison et à l'intersaison, classement final, paliers,
   talents, tempérament, cotes, recrue de l'année, nouvelles des dépisteurs, famille, Temple, retraite. */
function tlEvents(id) {
  const ev = [], add = (s, o, when, cat, ico, html, cls) => ev.push({ s, o, when, cat, ico, html, cls: cls || '' });
  const nm = esc(nameOf(id) || ''), L = l => 'L' + (l + 1), lgOf = (T, idd) => { if (!T || !T.lg) return -1; for (let l = 0; l < 4; l++) if (T.lg[l] && T.lg[l].rows && T.lg[l].rows.some(r => r[0] === idd)) return l; return -1; };
  const KIND = { ace: 'Trou d’un coup', alb: 'Albatros', e4: 'Aigle sur un par 4' };
  let wins = 0;
  S.hist.forEach((H, si) => {
    const s = si + 1; let lastL = -1, firstL = -1;
    { const q = S.pl && S.pl[s], k = q ? q.findIndex(r => r[0] === id) : -1; if (k >= 0) add(s, -0.5, '<span>Avant-saison</span>', 'mv', '⭐', '<b>Classé n° ' + (k + 1) + ' dans le Top 30 des espoirs</b>'); }   // v454
    (H.t || []).forEach((T, ti) => {
      if (!T) return; const l = lgOf(T, id);
      (T.mvs || []).forEach(m => { if (m[0] !== id) return; const up = m[2] < m[1];
        add(s, ti + 0.5, '<span>Tournoi</span> ' + (ti + 1), 'mv', up ? '▲' : '▼', '<b><span>' + (up ? 'Promu en Ligue' : 'Relégué en Ligue') + '</span> ' + (m[2] + 1) + '</b> <span>en cours de saison</span>' + (m[4] ? ' · <span>' + esc(m[4]) + '</span>' : ''), up ? 'tup' : 'tdn'); });
      if (l < 0) return; if (firstL < 0) firstL = l; lastL = l;
      const R = T.lg[l], row = R.rows.find(r => r[0] === id), tot = row[3] !== null ? row[2] + row[3] : row[2];
      if (row[1] === 1) { wins++;
        add(s, ti, '<span>Tournoi</span> ' + (ti + 1), 'res', '🏆', '<b>' + (wins === 1 ? '<span>Première victoire en carrière</span>' : '<span>Victoire</span>') + '</b> · <a href="#" data-a="tourn" data-s="' + s + '" data-t="' + ti + '" data-l="' + l + '" data-m="res">' + esc(T.name) + '</a> · ' + L(l) + ' · ' + fmt(tot) + (T.maj && l === 0 ? ' · <span>Majeur</span> ★' : '') + (R.playoff ? ' · <span>en prolongation</span>' : ''), 'win'); }
      (T.evs || []).forEach(e => { if (e.id === id && KIND[e.kind]) add(s, ti + 0.2, '<span>Tournoi</span> ' + (ti + 1), 'res', '✨', '<b><span>' + KIND[e.kind] + '</span></b> · <span>trou</span> ' + e.hole + ', <span>ronde</span> ' + e.round + ' · ' + esc(T.name)); });
    });
    if (H.fin && H.fin.lg && H.fin.lg[0] && H.fin.lg[0].rows) { const row = H.fin.lg[0].rows.find(r => r[0] === id);
      if (row) add(s, 10, '<span>Finale</span>', 'res', row[1] === 1 ? '🏆' : '⚑', row[1] === 1 ? '<b><span>Remporte la Finale</span></b> · ' + esc(H.fin.name || '') : '<span>Finale</span> · ' + (row[1] ? ord(row[1]) : '–') + ' · ' + esc(H.fin.name || ''), row[1] === 1 ? 'win' : ''); }
    const E = H.end; if (!E) return;
    const ft = (E.tables || []).map(tb => (tb || []).findIndex(r => r[0] === id && r[5] !== 1));
    const fl = ft.findIndex(i => i >= 0);
    if (fl >= 0) { const r = E.tables[fl][ft[fl]], rk = ft[fl] + 1;
      add(s, 11, '<span>Fin de saison</span>', 'res', rk === 1 ? '🥇' : '📊', rk === 1 ? '<b><span>Champion de la Ligue ' + (fl + 1) + '</span></b> · ' + r[1] + ' pts' : '<span>Saison terminée</span> <b>' + ord(rk) + '</b> <span>en Ligue</span> ' + (fl + 1) + ' · ' + r[1] + ' pts' + (r[2] ? ' · ' + r[2] + ' <span>' + (r[2] > 1 ? 'victoires' : 'victoire') + '</span>' : ''), rk === 1 ? 'win' : ''); }
    if (E.roy && E.roy.id === id) add(s, 11.1, '<span>Fin de saison</span>', 'res', '🌟', '<b><span>Recrue de l’année</span></b>', 'win');
    const N = S.hist[s], nextL = N ? (N.t || []).reduce((a, T) => a >= 0 ? a : lgOf(T, id), -1) : (s === S.season - 1 || s === S.season ? -1 : -1);
    const nl = nextL >= 0 ? nextL : (s === S.season - 1 && S.G[id] ? leagueOf(id) : -1);
    if (lastL >= 0 && nl >= 0 && nl !== lastL) add(s, 12, '<span>Intersaison</span>', 'mv', nl < lastL ? '▲' : '▼', '<b><span>' + (nl < lastL ? 'Monte en Ligue' : 'Descend en Ligue') + '</span> ' + (nl + 1) + '</b> <span>pour la saison</span> ' + yr(s + 1), nl < lastL ? 'tup' : 'tdn');
    const x = E.x || {};
    (x.tc || []).forEach(c => { if (c[0] === id) add(s, 13, '<span>Intersaison</span>', 'dev', c[2] > c[1] ? '⬆' : '⬇', '<span>Palier</span> : ' + tierName(c[1]) + ' → <b>' + tierName(c[2]) + '</b>', c[2] > c[1] ? 'tup' : 'tdn'); });
    const seen = new Set();
    (E.tal || []).forEach(t => { if (t[0] !== id) return; try { const tx = talNews({ id, w: t[1], k: t[2], lv: t[3], neg: t[4] }); seen.add(tx); add(s, 14, '<span>Intersaison</span>', 'dev', '🔍', newsHTML(tx, [id])); } catch (e) { } });
    (E.cl || []).forEach(c => { if (c[0] !== id) return; const tx = clNews(id, c[1], c[2]); seen.add(tx); add(s, 14.5, '<span>Intersaison</span>', 'dev', '🧠', newsHTML(tx, [id])); });
    (E.sk || []).forEach(k => { if (k[0] === id) add(s, 15, '<span>Intersaison</span>', 'dev', k[3] > k[2] ? '↗' : '↘', '<span>Cote</span> ' + SK_NM[k[1]] + ' : ' + k[2] + ' → <b>' + k[3] + '</b>', k[3] > k[2] ? 'tup' : 'tdn'); });
    let famNews = false, retNews = false;
    (E.news || []).forEach((tx, i) => { const ids = (E.nids || [])[i] || []; if (!ids.includes(id) || seen.has(tx)) return; seen.add(tx); if ((E.rc || []).some(q => q[0] === id) && /classe de recrues|commence sa carri\u00e8re|fait le saut/.test(tx)) return;
      if (/fait son entrée/.test(tx)) famNews = true; if (/retraite|perd sa place/.test(tx)) retNews = true;
      add(s, 16, '<span>Intersaison</span>', /Temple/.test(tx) ? 'res' : /retraite|perd sa place|fait son entrée/.test(tx) ? 'mv' : 'dev', '📰', newsHTML(tx, ids)); });
    (E.rc || []).forEach(r => { if (r[0] !== id) return; let w = 0, best = null; (H.t || []).forEach(T => { const q = T && T.rc && T.rc.rows.find(z => z[0] === id); if (q) { if (q[1] === 1) w++; if (best == null || q[1] < best) best = q[1]; } });
      add(s, 16.5, '<span>Classe de recrues</span>', 'mv', r[2] === 0 ? '\ud83d\udca5' : r[2] < 0 ? '\u274c' : '\ud83c\udf93', '<b><span>Classe de recrues</span> : ' + ord(r[3]) + '</b> \u00b7 index ' + (r[1] >= 90 ? '\u2013' : fmtHI(r[1])) + (w ? ' \u00b7 ' + w + ' <span>' + (w > 1 ? 'meilleurs scores' : 'meilleur score') + '</span>' : '') + ' \u2192 ' + (r[2] < 0 ? '<b><span>n\u2019obtient pas sa carte</span></b>' : '<b><span>commence en Ligue</span> ' + (r[2] + 1) + '</b>' + (r[2] === 0 ? ' \u00b7 <span>directement chez l\u2019\u00e9lite !</span>' : '')), r[2] === 0 ? 'win' : r[2] < 0 ? 'tdn' : r[2] <= 1 ? 'tup' : ''); });
    (x.rk || []).forEach(r => { if (r[0] === id && !famNews && !(E.rc || []).some(q => q[0] === id)) add(s, 17, '<span>Intersaison</span>', 'mv', '🆕', '<b><span>Arrivée sur le circuit</span></b> · ' + L(r[1]) + ' · ' + r[2] + ' <span>ans</span>'); });
    (x.rt || []).forEach(r => { if (r[0] === id && !retNews) add(s, 17, '<span>Intersaison</span>', 'mv', '👋', '<b>' + (r[7] ? '<span>Perd sa place sur le circuit</span>' : '<span>Prend sa retraite</span>') + '</b> · ' + r[1] + ' <span>ans</span> · ' + r[2] + ' <span>saisons</span>' + (r[3] ? ' · ' + r[3] + ' <span>' + (r[3] > 1 ? 'victoires' : 'victoire') + '</span>' : '')); });
  });
  return ev;
}
function tlHTML(id) {
  const ev = tlEvents(id); if (!ev.length) return '<p class="mute">Aucun événement pour l’instant.</p>';
  const f = VIEW.tlf || 'all', cnt = k => ev.filter(e => k === 'all' || e.cat === k).length;
  let h = chipRow([['all', 'Tout'], ['res', 'Résultats'], ['mv', 'Ligues et carrière'], ['dev', 'Développement']].filter(c => c[0] === 'all' || cnt(c[0])), f, 'tlf');
  const list = ev.filter(e => f === 'all' || e.cat === f).sort((a, b) => b.s - a.s || b.o - a.o);
  let cs = null; h += '<div class="tl">';
  list.forEach(e => {
    if (e.s !== cs) { cs = e.s; h += '<div class="tlyr">' + yr(cs) + '</div>'; }
    h += '<div class="tli c-' + e.cat + (e.cls ? ' ' + e.cls : '') + '"><span class="tld">' + e.ico + '</span><div class="tlb"><div class="tlw">' + e.when + '</div><div class="tlx">' + e.html + '</div></div></div>';
  });
  return h + '</div>';
}

