/* ============ v349 : rendement d'une cuvée (page de la classe) ============ */
let RCP_MEMO = null;
function rcCareerStats() {   // un passage dans l'historique : tournois et saisons en L1, meilleure ligue atteinte
  const lastH = S.hist[S.hist.length - 1], k = S.season + '|' + S.hist.length + '|' + (lastH ? lastH.t.filter(Boolean).length : 0);
  if (RCP_MEMO && RCP_MEMO.S === S && RCP_MEMO.k === k) return RCP_MEMO.m;
  const m = {}, get = id => m[id] || (m[id] = { ev1: 0, s1: 0, best: 9 });
  S.hist.forEach(H => {
    (H.t || []).forEach(t => { const R = t && t.lg && t.lg[0] && t.lg[0].rows; if (R) R.forEach(r => { get(r[0]).ev1++; }); });
    const E = H.end; if (E && E.tables) E.tables.forEach((T, L) => T.forEach(r => { const o = get(r[0]); if (L < o.best) o.best = L; if (L === 0 && !r[5]) o.s1++; }));
  });
  [0, 1, 2, 3].forEach(L => (S.L[L] || []).forEach(id => { const o = get(id); if (L < o.best) o.best = L; }));
  RCP_MEMO = { S, k, m }; return m;
}
function rcScoreOf(id) {   // valeur d'une carrière, pour comparer (Temple, saisons en L1, meilleure ligue, gains)
  const P = hofLedger()[String(id)], c = rcCareerStats()[id] || { s1: 0, best: 9 }, g = S.G[id] || (S.old && S.old[id]) || {};
  return (P ? P.pts : 0) * 4 + c.s1 * 6 + (c.best <= 3 ? (4 - c.best) * 4 : 0) + (g.ce || 0) / 1e6;
}
function rcClassScore2(s) { const ids = rcPres(s).filter(id => id !== 0); return ids.reduce((a, id) => a + rcScoreOf(id), 0); }
function rcPerfHTML(s, list) {
  const ids = list.map(g => g.id), all = rcPres(s).filter(id => id !== 0), C = rcCareerStats(), P = hofLedger(), wr = worldRanks(), age = S.season - 1 - s;   // all : toute la cuvée (retraités et sans carte compris)
  if (age < 1) return '';
  const act = [0, 0, 0, 0]; let ret = 0, nc = 0, l1 = 0, est = 0, earn = 0, w = 0, t1 = 0, mj = 0, fw = 0;
  all.forEach(id => { const g = S.G[id], o = S.old && S.old[id], l = g ? leagueOf(id) : -1, c = C[id] || { ev1: 0, s1: 0 }, p = P[String(id)];
    if (l >= 0) act[l]++; else if (o && o.nc) nc++; else if (o || !g) ret++;
    if (c.ev1) l1++; if (c.s1 >= 3) est++; earn += (g ? g.ce : o ? o.ce : 0) || 0;
    if (p) { w += p.w; t1 += p.t1; mj += p.mj || 0; fw += p.fw || 0; } });
  const tile = (v, k) => '<div><b>' + v + '</b>' + k + '</div>';
  let h = '<h2>La cuvée aujourd’hui</h2><div class="rcsum rcperf">' +
    tile(act.reduce((a, b) => a + b, 0), '<span>golfeurs actifs</span> <span class="mute">· L1 ' + act[0] + ' · L2 ' + act[1] + ' · L3 ' + act[2] + ' · L4 ' + act[3] + '</span>') +
    tile(l1, '<span>passés par la L1</span>' + (est ? ' <span class="mute">· ' + est + ' <span>établis</span></span>' : '')) +
    tile(w, '<span>' + (w > 1 ? 'victoires en L1' : 'victoire en L1') + '</span>' + (mj || fw ? ' <span class="mute">· ' + (mj ? mj + ' <span>' + (mj > 1 ? 'Majeurs' : 'Majeur') + '</span>' : '') + (mj && fw ? ' · ' : '') + (fw ? fw + ' <span>' + (fw > 1 ? 'Finales' : 'Finale') + '</span>' : '') + '</span>' : '')) +
    tile(t1, '<span>' + (t1 > 1 ? 'titres de saison en L1' : 'titre de saison en L1') + '</span>') +
    tile(fmtMoney(earn), '<span>gains combinés</span>') +
    tile(ret + nc, '<span>hors circuit</span> <span class="mute">· ' + ret + ' <span>' + (ret > 1 ? 'retraités' : 'retraité') + '</span> · ' + nc + ' <span>sans carte</span></span>') + '</div>';
  // top 100 mondial
  const top = all.filter(id => S.G[id] && wr[id] && wr[id] <= 100).sort((a, b) => wr[a] - wr[b]);
  h += '<div class="rcwr"><b>World Ranking</b> ' + (top.length ? top.map(id => '<span class="rcwrp"><b>#' + wr[id] + '</b> <a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a></span>').join('') : '<span class="mute">Personne de la cuvée dans le top 100 mondial.</span>') + '</div>';
  // histoires
  const sc = {}; ids.forEach(id => { sc[id] = rcScoreOf(id); });
  const rk = id => ids.indexOf(id) + 1, desc = id => { const g = S.G[id], c = C[id] || {}, p = P[String(id)], l = g ? leagueOf(id) : -1, bits = [];
      bits.push(l >= 0 ? 'L' + (l + 1) : (S.old && S.old[id] && S.old[id].nc ? 'sans carte' : 'retraité'));
      if (p && p.w) bits.push(p.w + ' ' + (p.w > 1 ? 'victoires en L1' : 'victoire en L1')); if (p && p.t1) bits.push(p.t1 + ' ' + (p.t1 > 1 ? 'titres de saison' : 'titre de saison'));
      if (!(p && p.w) && c.best != null && c.best < 9 && c.best !== l) bits.push('meilleure ligue : L' + (c.best + 1));
      return bits.map(b => '<span>' + b + '</span>').join(' · '); };
  const lnk = id => '<a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>';
  const best = ids.slice().sort((a, b) => sc[b] - sc[a])[0];
  const sur = ids.filter(id => rk(id) > 10 && (C[id] || {}).best <= 1).sort((a, b) => sc[b] - sc[a])[0];
  const dis = age >= 4 ? ids.filter(id => rk(id) <= 3 && (C[id] || {}).best >= 2 && ((S.G[id] && S.G[id].a >= 26) || !S.G[id])).sort((a, b) => rk(a) - rk(b))[0] : null;
  const row = (ico, t, id, x) => '<div class="rcst"><span class="rcsti">' + ico + '</span><div><div class="small mute">' + t + '</div><div>' + lnk(id) + ' <span class="mute small">· ' + x + '</span></div></div></div>';
  h += '<div class="rcstories">' + (best ? row('🏆', 'Le meilleur de la cuvée', best, '<span>' + ord(rk(best)) + ' choix des dépisteurs</span> · ' + desc(best)) : '') +
    (sur ? row('🚀', 'La plus belle surprise', sur, '<span>' + ord(rk(sur)) + ' choix des dépisteurs</span> → ' + desc(sur)) : '') +
    (dis ? row('📉', 'La plus grosse déception', dis, '<span>' + ord(rk(dis)) + ' choix des dépisteurs</span> → <span>n’a jamais dépassé la L' + ((C[dis] || {}).best + 1) + '</span>') : '') + '</div>';
  // flair des dépisteurs, Temple, rang de la cuvée
  const notes = [];
  if (age >= 4 && ids.length >= 10) { const t10 = new Set(ids.slice().sort((a, b) => sc[b] - sc[a]).slice(0, 10)); notes.push('<span>Flair des dépisteurs :</span> ' + ids.slice(0, 10).filter(id => t10.has(id)).length + ' <span>de leurs 10 premiers choix sont parmi les 10 meilleures carrières de la cuvée</span>'); }
  const hm = all.filter(id => S.hof && S.hof.m.some(m => m.k === String(id))).length, hr = all.filter(id => P[String(id)] && P[String(id)].pts >= HOF.need / 2 && !(S.hof && S.hof.m.some(m => m.k === String(id)))).length;
  if (hm || hr) notes.push('<span>Temple :</span> ' + hm + ' <span>' + (hm > 1 ? 'intronisés' : 'intronisé') + '</span> · ' + hr + ' <span>en bonne voie</span>');
  if (age >= 5) { const cls = S.hist.map(H => H.s).filter(x => rcHas(x) && S.season - 1 - x >= 5); if (cls.length >= 2) { const v = cls.map(x => [x, rcClassScore2(x)]).sort((a, b) => b[1] - a[1]); notes.push('<span>Rendement réel :</span> ' + ord(v.findIndex(x => x[0] === s) + 1) + ' <span>de tes</span> ' + v.length + ' <span>cuvées d’au moins 5 saisons</span>'); } }
  else notes.push('<span class="mute">Rendement réel : trop tôt pour comparer avec les autres cuvées (moins de 5 saisons).</span>');
  return h + (notes.length ? '<p class="small rcnotes">' + notes.join('<br>') + '</p>' : '');
}
function vRookieClass() {
  const s = VIEW.s, rin = !!rcEntry(s), ids = rcPres(s), arch = s < S.season - 1, PL = S.hist[s] && S.hist[s].end && S.hist[s].end.rc;
  const known = ids.map(id => S.G[id] || (S.old && S.old[id] ? Object.assign({ id, gone: 1 }, S.old[id]) : null)).filter(Boolean);
  const P0 = g => g.rc && g.rc.s === s ? g.rc.p0 : g.p;
  const O0 = g => { if (g.rc && g.rc.s === s && g.rc.o0 != null) return g.rc.o0; const h = g.oh && (g.oh.find(x => x[0] === s) || g.oh.find(x => x[0] === s + 1)); return h ? h[1] : arch ? null : g.o; };   // v339 : niveau à l'arrivée
  const lvlTxt = g => { const o = O0(g); return o == null ? '–' : TIERS[scale(TIERS, o)][1]; };
  const ageOf = g => g.rc && g.rc.s === s && g.rc.a0 != null ? g.rc.a0 : g.gone ? null : g.a - (S.season - 1 - s);
  const extra = known.filter(g => P0(g) == null);   // v362 : anciens retranchés/retraités sans photo des dépisteurs
  const list = known.filter(g => P0(g) != null).sort((a, b) => (g => g.rc && g.rc.s === s ? g.rc.r : 999)(a) - (g => g.rc && g.rc.s === s ? g.rc.r : 999)(b) || P0(b) - P0(a) || a.id - b.id);
  let h = '<div class="top"><div><h1>' + (rin ? 'Classe de recrues ' + yr(s + 1) : 'Classe de ' + yr(s + 1)) + '</h1><div class="ctx">' + (rin ? 'Les recrues entrées dans la classe de recrues à l’intersaison ' + yr(s) : 'Les recrues arrivées sur le circuit à l’intersaison ' + yr(s)) + ' · <span>classées par les dépisteurs</span></div></div></div>' + rcNavHTML(s);
  if (rin) h += '<p style="margin:4px 0 12px">' + (PL ? 'Leur saison dans la classe est terminée : ' + PL.filter(r => r[2] >= 0 && r[0] !== 0).length + ' ont obtenu leur carte, ' + PL.filter(r => r[2] < 0).length + ' ont été retranchés. ' : 'Ils jouent la saison ' + yr(s + 1) + ' dans la classe de recrues ; leur index décidera de leur ligue de départ. ') + '<a href="#" data-a="rcview" data-s="' + (s + 1) + '">' + (PL ? 'Voir le placement final ›' : 'Voir la classe en saison (index et ligue projetée) ›') + '</a></p>';
  const rs = rin ? s + 2 : s, roy = S.hist[rs - 1] && S.hist[rs - 1].end && S.hist[rs - 1].end.roy;   // v252 : en classe de recrues, la recrue de l'année vient deux saisons plus tard
  if (roy) h += '<div class="rcroy"><div class="cup">🏆</div><div><div class="t">RECRUE DE L’ANNÉE ' + yr(rs) + '</div><div class="n">' + flagOf(roy.id, 20) + ' <a href="#" data-a="golfer" data-id="' + roy.id + '">' + esc(nameOf(roy.id)) + '</a></div><div class="s">' + (rin ? 'Classe de recrues ' + yr(s + 1) : 'Classe de ' + yr(s)) + ' · ' + roy.pts + ' points en Ligue ' + (roy.l + 1) + (roy.w ? ' · ' + roy.w + ' victoire' + (roy.w > 1 ? 's' : '') : '') + '</div></div></div>';
  if (!list.length) return h + '<p class="mute">Aucune recrue enregistrée pour cette intersaison.</p>';
  const nat = {}; list.forEach(g => { if (g.nat) nat[g.nat] = (nat[g.nat] || 0) + 1; });
  const tn = Object.keys(nat).sort((a, b) => nat[b] - nat[a]).slice(0, 3);
  const ages = list.map(ageOf).filter(a => a > 0);
  h += '<div class="rcsum"><div><b>' + (list.length + extra.length) + '</b>recrues</div><div><b>' + Math.min.apply(null, ages) + ' à ' + Math.max.apply(null, ages) + ' ans</b>à leur arrivée</div><div><b>' + list.filter(g => (g.rc && g.rc.s === s ? g.rc.ce : rcCert(g)[0]) === 'sure').length + '</b>valeurs sûres</div><div><b>' + tn.map(n => flagVisual(n, 18) + ' ' + nat[n]).join(' · ') + '</b>nations les plus représentées</div><div><b>' + rcVerdict(list, P0) + '</b>cuvée selon les dépisteurs' + (rcRankLine(s) ? ' · ' + rcRankLine(s) : '') + '</div></div>';
  const plc = id => { const r = PL && PL.find(x => x[0] === id); return r ? r[2] : null; };
  const used = new Set(), now = g => { const pl = rin ? plc(g.id) : null; if (pl === -1 || (g.gone && g.nc)) return '<span class="mute">Retranché (sans carte)</span>'; if (g.gone) return '<span class="mute">Retraité</span>'; const l = leagueOf(g.id); return (l >= 0 ? 'L' + (l + 1) + ' · ' : g.rcl ? 'Recrues · ' : '') + TIERS[tierOf(g)][1]; };
  const card = (g, i) => {
    const snap = g.rc && g.rc.s === s ? g.rc : null, c = snap ? [snap.ce, RC_CERT[snap.ce]] : rcCert(g), cmp = snap ? (snap.cmp != null ? { id: snap.cmp } : null) : rcCompare(g, used); if (cmp) used.add(cmp.id);
    const ageA = ageOf(g), fol = !g.gone && S.wl && wlIn(g.id).length;
    const fm = famMain(g.id), body = '<div class="rcnm">' + flagVisual(g.nat, 22) + '<a href="#" data-a="golfer" data-id="' + g.id + '">' + esc(nameOf(g.id)) + '</a></div>' + (fm ? '<div class="rcfam">' + famDe(fm[1], fm[0]) + '</div>' : '') +
      '<div class="rcmeta">' + (ageA != null ? ageA + ' ans' : '') + (g.nat ? ' · ' + esc(g.nat) : '') + (rin ? (plc(g.id) != null ? ' · placé : ' + (plc(g.id) < 0 ? 'sans carte' : 'Ligue ' + (plc(g.id) + 1)) : ' · classe de recrues') : ' · commence en Ligue 4') + (arch ? ' · aujourd’hui : ' + now(g) : '') + '</div>';
    const rep = '<div class="rcrep">« ' + esc(snap ? snap.rp : rcReport(g)) + ' »</div>' + (cmp ? '<div class="rccmp">Rappelle <a href="#" data-a="golfer" data-id="' + cmp.id + '">' + esc(nameOf(cmp.id)) + '</a></div>' : '');
    const side = rcStarsHTML(rcStars(i, list.length), i === 0) + '<div class="rctier">Niveau : ' + lvlTxt(g) + '</div><div class="rctier">Potentiel : ' + POTS[scale(POTS, P0(g))][1] + '</div>';
    const foot = '<span class="rccert ' + c[0] + '">' + c[1] + '</span>' + (g.gone ? '' : '<button class="rcfol" data-a="rcfol" data-id="' + g.id + '">' + (fol ? '★ Suivi' : '☆ Suivre') + '</button>');
    if (i === 0) return '<div class="rccard rcjewel"><div class="rcrk">1</div><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><div class="rclab">LE JOYAU DE LA CLASSE</div>' + body + rep + '</div><div class="rcside">' + side + foot + '</div></div>';
    return '<div class="rccard"><div class="rcrk">' + (i + 1) + '</div>' + body + side + rep + '<div class="rcrow">' + foot + '</div></div>';
  };
  try { h += rcPerfHTML(s, list); } catch (e) { }   // v349
  h += '<h2>Le top 10 des dépisteurs</h2><div class="rcgrid">' + list.slice(0, 10).map(card).join('') + '</div>';
  const showNow = arch || !!PL || known.some(g => g.gone);
  if (list.length > 10 || extra.length) h += '<h2>Les autres recrues</h2><div class="scroll"><table class="plain"><tr><th>#</th><th>Recrue</th><th class="r">Âge</th><th>Cote</th><th>Niveau</th><th>Potentiel</th><th>Dépisteurs</th>' + (showNow ? '<th>Aujourd’hui</th>' : '') + '</tr>' +
    list.slice(10).map((g, i) => '<tr><td>' + (i + 11) + '</td><td>' + flagVisual(g.nat, 16) + ' <a href="#" data-a="golfer" data-id="' + g.id + '">' + esc(nameOf(g.id)) + '</a></td><td class="r">' + (ageOf(g) != null ? ageOf(g) : '–') + '</td><td>' + rcStarsHTML(rcStars(i + 10, list.length)) + '</td><td class="small">' + lvlTxt(g) + '</td><td class="small">' + POTS[scale(POTS, P0(g))][1] + '</td><td class="mute">' + (g.rc && g.rc.s === s && RC_CERT[g.rc.ce] ? RC_CERT[g.rc.ce] : rcCert(g)[1]) + '</td>' + (showNow ? '<td class="small">' + now(g) + '</td>' : '') + '</tr>').join('') +
    extra.map((g, i) => '<tr><td>' + (list.length + i + 1) + '</td><td>' + flagVisual(g.nat, 16) + ' <a href="#" data-a="golfer" data-id="' + g.id + '">' + esc(nameOf(g.id)) + '</a></td><td class="r">–</td><td></td><td class="small">–</td><td class="small">–</td><td class="mute">–</td>' + (showNow ? '<td class="small">' + now(g) + '</td>' : '') + '</tr>').join('') + '</table></div>';
  h += '<p class="small mute" style="margin:12px 0 0">Les dépisteurs classent selon ce qu’ils voient : potentiel, niveau actuel et âge. La cote (de Valeur sûre à Billet de loterie) dit leurs chances de s’établir un jour en Ligue 1. Ils se trompent parfois : certaines recrues très cotées déçoivent, d’autres surprennent tout le monde.</p>';
  return h + '<button class="btn sec" data-a="backview" style="margin-top:14px">Retour</button>';
}

