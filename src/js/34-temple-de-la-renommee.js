/* ============ TEMPLE DE LA RENOMMÉE (v192) ============
   Pointage de carrière (Ligue 1 seulement) : victoire 8, titre de saison 25, top 3 de saison 8, top 10 de saison 3,
   n°1 mondial en fin de saison 10, top 10 mondial 2. Admissible 3 saisons après la retraite (au moins 60 points pour
   figurer sur le scrutin). Il faut 75 % des votes ; sous 5 %, ou après 10 ans sur le scrutin, le golfeur est rayé.
   Le vote suit le pointage (150 points ≈ 85 % au 1er scrutin, 120 points ≈ 40 % puis +5 par année), avec un peu de hasard et un appui qui grandit d'année en année.
   Simulation (3 × 60 saisons) : 36 carrières sur 1 661 dépassent 120 points, environ un intronisé aux 3 ou 4 saisons.
   Le joueur est admissible aussi : chacune de ses carrières a sa clé ('P0', 'P1'…, la carrière en cours = 'P' + nombre de carrières terminées). */
const HOF = { W: { w: 8, t1: 25, t3: 8, t10: 3, wr1: 10, wr10: 2, mj: 4, fw: 3 }, need: 130, first: 160, lo: 100, min: 60, wait: 3, max: 10, drop: 5, pass: 75 };
let HOF_MEMO = null;
function hofPts(p) { const W = HOF.W; return p.w * W.w + p.t1 * W.t1 + p.t3 * W.t3 + p.t10 * W.t10 + p.wr1 * W.wr1 + p.wr10 * W.wr10 + (p.mj || 0) * W.mj + (p.fw || 0) * W.fw; }
function hofKey(id, s) { return id === 0 ? 'P' + (S.playerCareers || []).filter(c => c.s < s).length : String(id); }
function hofCurKey(id) { return id === 0 ? 'P' + (S.playerCareers || []).length : String(id); }
function hofLedger() {
  const lastH = S.hist[S.hist.length - 1], mk = S.season + '|' + S.hist.length + '|' + S.hist.filter(x => x.end).length + '|' + (lastH ? lastH.t.filter(Boolean).length : 0) + '|' + (S.playerCareers || []).length;
  if (HOF_MEMO && HOF_MEMO.k === mk && HOF_MEMO.S === S) return HOF_MEMO.P;
  const P = {}, get = k => P[k] || (P[k] = { w: 0, t1: 0, t3: 0, t10: 0, wr1: 0, wr10: 0, mj: 0, fw: 0, pts: 0 });
  S.hist.forEach(H => {
    (H.t || []).forEach(t => { const L = t && t.lg && t.lg[0]; if (L && L.rows && L.rows.length && L.rows[0][1] === 1) { const p = get(hofKey(L.rows[0][0], H.s)); p.w++; if (t.maj) p.mj++; } });
    { const L = H.fin && H.fin.lg && H.fin.lg[0]; if (L && L.rows && L.rows.length) { const p = get(hofKey(L.rows[0][0], H.s)); p.w++; p.fw++; } }   // la Finale compte comme une victoire en L1
    const E = H.end; if (!E) return;
    const T = E.tables && E.tables[0]; if (T) T.slice(0, 10).forEach((r, i) => { const p = get(hofKey(r[0], H.s)); if (!i) p.t1++; if (i < 3) p.t3++; p.t10++; });
    if (E.wr) E.wr.slice(0, 10).forEach((id, i) => { const p = get(hofKey(id, H.s)); if (!i) p.wr1++; p.wr10++; });
  });
  Object.values(P).forEach(p => { p.pts = hofPts(p); });
  HOF_MEMO = { k: mk, S, P };
  return P;
}
function hofState() { if (!S.hof) S.hof = { m: [], x: {}, upTo: 0 }; return S.hof; }
function hofPeople(s) {   // retraités admissibles au scrutin de la fin de la saison s
  const out = [];
  Object.keys(S.old || {}).forEach(k => { const o = S.old[k]; if (o && !o.pre && o.s != null && o.s + HOF.wait <= s) out.push({ k: String(k), id: +k, n: o.n, nat: o.nat || '', r: o.s }); });
  (S.playerCareers || []).forEach((c, i) => { if (c.s != null && c.s + HOF.wait <= s) out.push({ k: 'P' + i, id: null, n: c.n, nat: c.nat || '', r: c.s, me: 1 }); });
  return out;
}
function hofVote(pts, y) { return Math.round(clamp(100 / (1 + Math.exp(-(pts - (HOF.ctr || 125)) / 14)) + (y - 1) * 5 + gauss() * 5, 0, 100) * 10) / 10; }
function hofBallot(s) {   // scrutin de la fin de la saison s : retourne les lignes [clé, nom, nation, %, année sur le scrutin, élu, rayé, points]
  const st = hofState(), P = hofLedger(), mem = new Set(st.m.map(m => m.k)), rows = [], inn = [];
  hofPeople(s).forEach(c => {
    if (mem.has(c.k) || st.x[c.k]) return;
    const p = P[c.k]; if (!p || p.pts < HOF.min) return;
    const y = s - (c.r + HOF.wait) + 1; if (y < 1 || y > HOF.max) return;
    const pct = hofVote(p.pts, y), ok = pct >= HOF.pass, drop = !ok && (pct < HOF.drop || y >= HOF.max);
    rows.push([c.k, c.n, c.nat, pct, y, ok ? 1 : 0, drop ? 1 : 0, p.pts]);
    if (ok) { const m = { k: c.k, n: c.n, nat: c.nat, s, y, pct, pts: p.pts, p: { w: p.w, t1: p.t1, t3: p.t3, t10: p.t10, wr1: p.wr1, wr10: p.wr10 } }; if (c.me) m.me = 1; st.m.push(m); inn.push(m); }
    if (drop) st.x[c.k] = 1;
  });
  rows.sort((a, b) => b[3] - a[3]);
  st.upTo = Math.max(st.upTo || 0, s);
  return { rows, inn };
}
function hofCatchUp(upTo) {   // scrutins manqués (anciennes sauvegardes) : rejoués d'un coup, sans nouvelles
  const st = hofState(); let did = false;
  for (let s = (st.upTo || 0) + 1; s <= upTo; s++) { const H = S.hist[s - 1]; if (!H || !H.end) continue; const r = hofBallot(s); H.end.hof = r.rows; did = true; }
  st.upTo = Math.max(st.upTo || 0, upTo);
  return did;
}
function hofEnsure() { if (!S || S.presim) return; const need = !S.hof || (S.hof.upTo || 0) < S.season - 1; if (need && hofCatchUp(S.season - 1)) persist(); else if (need) hofState().upTo = S.season - 1; }
function hofLine(p) {
  const a = [];
  if (p.w) a.push(p.w + ' victoire' + (p.w > 1 ? 's' : '') + ' en L1');
  if (p.t1) a.push(p.t1 + ' titre' + (p.t1 > 1 ? 's' : '') + ' de saison');
  if (p.wr1) a.push(p.wr1 + ' saison' + (p.wr1 > 1 ? 's' : '') + ' n°1 mondial');
  else if (p.wr10) a.push(p.wr10 + ' saison' + (p.wr10 > 1 ? 's' : '') + ' au top 10 mondial');
  if (a.length < 3 && p.t10) a.push(p.t10 + ' top 10 de saison');
  return a.slice(0, 3).join(' · ');
}
function hofName(k, n, nat, sz) {
  const id = k[0] === 'P' ? (k === hofCurKey(0) ? 0 : null) : +k, f = flagVisual(nat, sz || 18) + ' ';
  return f + (id != null && (id === 0 || S.G[id] || (S.old && S.old[id])) ? '<a href="#" data-a="golfer" data-id="' + id + '">' + esc(n) + '</a>' : esc(n)) + (k[0] === 'P' ? ' <span class="hofme">toi</span>' : '');
}
function hofBar(pct, mark) { return '<div class="hofbar"><i style="width:' + clamp(pct, 0, 100) + '%"></i>' + (mark != null ? '<b style="left:' + mark + '%"></b>' : '') + '</div>'; }
function hofLastBallot() { for (let i = S.hist.length - 1; i >= 0; i--) { const E = S.hist[i].end; if (E && E.hof && E.hof.length) return { s: S.hist[i].s, rows: E.hof }; } return null; }
function hofBallotHTML(B, title) {
  return '<div class="block"><h3 style="margin-top:0">' + title + '</h3><p class="small mute" style="margin:0 0 8px">Il faut ' + HOF.pass + ' % des votes. Sous ' + HOF.drop + ' %, ou après ' + HOF.max + ' ans sur le scrutin, le golfeur est rayé.</p>' +
    B.rows.map(r => '<div class="hofv"><div class="hofvn">' + hofName(r[0], r[1], r[2], 16) + '</div>' + hofBar(r[3], HOF.pass) + '<b class="' + (r[5] ? 'in' : r[6] ? 'drop' : '') + '">' + String(r[3]).replace('.', ',') + ' %' + (r[5] ? ' ✓' : '') + '</b></div>' +
      '<p class="small mute hofvs">' + (r[4] === 1 ? '1er scrutin' : ord(r[4]) + ' année') + ' · ' + r[7] + ' points' + (r[5] ? ' · <b class="in">intronisé</b>' : r[6] ? ' · rayé du scrutin' : '') + '</p>').join('') + '</div>';
}
function hofCriteriaHTML() {
  const W = HOF.W;
  return '<div class="block"><h3 style="margin-top:0">Comment on y entre</h3><table class="plain"><tr><th>Accomplissement (Ligue 1)</th><th class="r">Points</th></tr>' +
    [['Victoire en Ligue 1', W.w], ['Titre de saison', W.t1], ['Top 3 de saison', W.t3], ['Top 10 de saison', W.t10], ['N°1 mondial à la fin d’une saison', W.wr1], ['Top 10 mondial à la fin d’une saison', W.wr10], ['Bonus : victoire dans un Majeur', W.mj], ['Bonus : victoire en Finale', W.fw]].map(r => '<tr><td>' + r[0] + '</td><td class="r">' + r[1] + '</td></tr>').join('') + '</table>' +
    '<p class="small" style="margin:8px 0 0">Admissible <b>' + HOF.wait + ' saisons après la retraite</b>, avec au moins ' + HOF.min + ' points. Environ <b>' + HOF.need + ' points</b> : élu presque sûrement. <b>' + HOF.lo + ' à ' + (HOF.need - 1) + '</b> : cas limite, le vote décide (l’appui grandit d’année en année). <b>' + HOF.first + '+</b> : élu au premier scrutin.</p>' +
    '<p class="small mute" style="margin:6px 0 0">Les exploits d’avant le début de l’histoire de ta partie ne sont pas comptés.</p></div>';
}
function vHof() {
  hofEnsure();
  const st = hofState(), P = hofLedger(), M = st.m.slice().sort((a, b) => b.s - a.s || b.pts - a.pts), f1 = M.filter(m => m.y === 1).length;
  let h = '<div class="hofhero"><div class="hoft">Temple de la renommée</div><div class="hofs">Les golfeurs qui ont marqué l’histoire du circuit · intronisations à chaque intersaison</div>' +
    '<div class="hofst"><div><b>' + M.length + '</b>membre' + (M.length > 1 ? 's' : '') + '</div><div><b>' + f1 + '</b>au premier scrutin</div><div><b>' + (st.m.length ? yr(Math.min.apply(null, st.m.map(m => m.s))) : '–') + '</b>première intronisation</div></div></div>';
  h += '<h2>Les membres</h2>' + (M.length ? '<div class="hofgrid">' + M.map(m => '<div class="hofpl">' + (m.y === 1 ? '<span class="hoffb">1er SCRUTIN</span>' : '') + '<div class="hofy">INTRONISÉ EN ' + yr(m.s) + (m.y > 1 ? ' · ' + ord(m.y).toUpperCase() + ' TENTATIVE' : '') + '</div><div class="hofn">' + hofName(m.k, m.n, m.nat, 20) + '</div><div class="hofl">' + hofLine(m.p) + '</div><div class="hofl2">' + m.pts + ' points · ' + String(m.pct).replace('.', ',') + ' % des votes</div></div>').join('') + '</div>' :
    '<p class="mute">Personne n’y est encore entré. Les retraités deviennent admissibles ' + HOF.wait + ' saisons après leur retraite.</p>');
  const B = hofLastBallot(); if (B) h += '<h2>Scrutin de ' + yr(B.s) + '</h2>' + hofBallotHTML(B, 'Résultats du vote');
  const act = Object.keys(S.G).map(k => ({ id: +k, p: P[hofCurKey(+k)] })).filter(x => x.p && (x.p.pts >= HOF.lo || (x.id === 0 && x.p.pts > 0))).sort((a, b) => b.p.pts - a.p.pts).slice(0, 12);
  if (act.length) h += '<h2>En voie vers le Temple</h2><div class="block"><p class="small mute" style="margin:0 0 6px">Golfeurs actifs avec au moins ' + HOF.lo + ' points (et toi).</p><table class="plain"><tr><th>Golfeur</th><th class="r">Âge</th><th class="r">Points</th><th>Carrière en L1</th></tr>' +
    act.map(x => '<tr' + (x.id === 0 ? ' class="cresme"' : '') + '><td>' + flagOf(x.id, 16) + ' <a href="#" data-a="golfer" data-id="' + x.id + '">' + esc(nameOf(x.id)) + '</a></td><td class="r">' + (S.G[x.id] ? S.G[x.id].a : '') + '</td><td class="r"><b>' + x.p.pts + '</b></td><td class="small">' + (hofLine(x.p) || '–') + '</td></tr>').join('') + '</table></div>';
  return h + hofCriteriaHTML();
}
function hofProfileHTML(id, compact) {
  if (!S || S.presim) return '';
  hofEnsure();
  const k = hofCurKey(id), st = hofState(), m = st.m.find(x => x.k === k); let p = hofLedger()[k];
  if (!p && id === 0 && S.G[0]) p = { w: 0, t1: 0, t3: 0, t10: 0, wr1: 0, wr10: 0, pts: 0 };
  if (m) return '<div class="hofban"><div class="hofbt">★</div><div><div class="hofbk">TEMPLE DE LA RENOMMÉE</div><div class="hofbn">Intronisé en ' + yr(m.s) + (m.y === 1 ? ' · au premier scrutin' : ' · à sa ' + ord(m.y) + ' année sur le scrutin') + '</div><div class="hofbs">' + String(m.pct).replace('.', ',') + ' % des votes · ' + m.pts + ' points · <a href="#" data-a="hof">Voir le Temple</a></div></div></div>';
  if (compact) return '';
  if (!p || (!(id === 0 && S.G[0]) && p.pts < HOF.min)) return '';
  const head = '<div class="block hofprof"><h3 style="margin-top:0">' + (S.G[id] ? (id === 0 ? 'Ta route vers le Temple' : 'En route vers le Temple') : 'Temple de la renommée') + '</h3>';
  const chips = [['w', 'victoire', 'victoires', 'L1'], ['t1', 'titre', 'titres', ''], ['t3', 'top 3', 'tops 3', ''], ['t10', 'top 10', 'tops 10', ''], ['wr1', 'saison n°1 mondial', 'saisons n°1 mondial', ''], ['wr10', 'top 10 mondial', 'tops 10 mondial', ''], ['mj', 'Majeur', 'Majeurs', ''], ['fw', 'Finale', 'Finales', '']]
    .filter(c => p[c[0]]).map(c => '<span class="hofchip">' + p[c[0]] + ' ' + (p[c[0]] > 1 ? c[2] : c[1]) + (c[3] ? ' ' + c[3] : '') + ' · ' + p[c[0]] * HOF.W[c[0]] + '</span>').join('');
  if (S.G[id]) {
    const need = HOF.need - p.pts;
    return head + hofBar(p.pts / HOF.need * 100) + '<p class="small" style="margin:4px 0 6px"><b>' + p.pts + ' points</b> sur ' + HOF.need + (need > 0 ? ' · <span class="mute">il manque environ ' + Math.ceil(need / HOF.W.w) + ' victoire' + (Math.ceil(need / HOF.W.w) > 1 ? 's' : '') + ' en L1, ou ' + Math.ceil(need / HOF.W.t1) + ' titre' + (Math.ceil(need / HOF.W.t1) > 1 ? 's' : '') + ' de saison</span>' : ' · <b class="in">assez pour être élu, une fois admissible</b>') + '</p>' + chips +
      '<p class="small mute" style="margin:8px 0 0">Admissible ' + HOF.wait + ' saisons après la retraite. <a href="#" data-a="hof">Voir le Temple</a></p></div>';
  }
  const o = S.old && S.old[id], el = o && o.s != null ? o.s + HOF.wait : null;
  let last = null; for (let i = S.hist.length - 1; i >= 0 && !last; i--) { const E = S.hist[i].end; const r = E && E.hof && E.hof.find(x => x[0] === k); if (r) last = { s: S.hist[i].s, r }; }
  const status = st.x[k] ? 'Rayé du scrutin' + (last ? ' en ' + yr(last.s) + ' (' + String(last.r[3]).replace('.', ',') + ' %)' : '') + '.' : last ? 'Sur le scrutin : ' + String(last.r[3]).replace('.', ',') + ' % des votes en ' + yr(last.s) + ' (' + (last.r[4] === 1 ? '1er scrutin' : ord(last.r[4]) + ' année') + '). Il faut ' + HOF.pass + ' %.' : el != null && el > S.season - 1 ? 'Admissible au scrutin de ' + yr(el) + '.' : '';
  return head + '<p class="small" style="margin:0 0 6px"><b>' + p.pts + ' points</b> en carrière. ' + status + '</p>' + chips + '</div>';
}
/* ---- Cérémonie d'intronisation (v209) : après « Clôturer la saison », avant le bilan, s'il y a au moins un élu ---- */
function hofCareerOf(k) {   // carrière d'un membre : début, fin, saisons, saisons en L1, âge, meilleure saison
  const isP = k[0] === 'P', id = isP ? 0 : +k, o = isP ? (S.playerCareers || [])[+k.slice(1)] : S.old && S.old[id];
  const c = { start: null, end: o ? o.s : null, cs: o ? o.cs : null, age: o ? o.a : null, l1: 0, best: null };
  if (o && o.s != null && o.cs) c.start = o.s - o.cs + 1;
  const by = {};
  S.hist.forEach(H => {
    if (hofKey(id, H.s) !== k) return;
    const T = H.end && H.end.tables && H.end.tables[0]; if (T && T.some(r => r[0] === id)) c.l1++;
    const b = by[H.s] = by[H.s] || { s: H.s, w: 0, mj: 0, fin: 0, t1: !!(T && T[0] && T[0][0] === id) };
    (H.t || []).forEach(t => { const r = t && t.lg && t.lg[0] && t.lg[0].rows[0]; if (r && r[0] === id) { b.w++; if (t.maj) b.mj++; } });
    const F = H.fin && H.fin.lg && H.fin.lg[0] && H.fin.lg[0].rows[0]; if (F && F[0] === id) { b.w++; b.fin = 1; }
  });
  const best = Object.values(by).filter(b => b.w > 0).sort((a, b) => (b.w + b.mj + (b.t1 ? 2 : 0)) - (a.w + a.mj + (a.t1 ? 2 : 0)))[0];
  if (best) { const parts = [best.w + ' victoire' + (best.w > 1 ? 's' : '') + (best.mj ? ' dont ' + best.mj + ' Majeur' + (best.mj > 1 ? 's' : '') : '')]; if (best.fin) parts.push('la Finale'); c.best = 'Sa saison ' + yr(best.s) + ' : ' + parts.join(', ') + (best.t1 ? (best.fin ? ', et le titre de la L1.' : ', et le titre de la Ligue 1.') : '.'); }
  return c;
}
function vHofCer() {
  const s = VIEW.s, E = S.hist[s - 1] && S.hist[s - 1].end, rows = (E && E.hof) || [], st = hofState(), P = hofLedger();
  const inn = rows.filter(r => r[5]), rest = rows.filter(r => !r[5]), prevE = S.hist[s - 2] && S.hist[s - 2].end;
  if (!inn.length) { VIEW = { name: 'seasonEnd', s }; return vSeasonEnd(); }
  const me = inn.some(r => r[0][0] === 'P'), total = st.m.length;
  let h = '<div class="cerhero"><div class="certp">🏛️</div><div class="cercap">CÉRÉMONIE D’INTRONISATION · ' + yr(s) + '</div><h1>' + (me ? 'Tu entres au Temple !' : 'Temple de la renommée') + '</h1><p>' +
    (inn.length > 1 ? inn.length + ' légendes rejoignent' : (me ? 'Ta carrière rejoint' : 'Une légende rejoint')) + ' ' + (total - inn.length ? 'les ' + (total - inn.length) + ' membre' + (total - inn.length > 1 ? 's' : '') + ' du Temple' : 'le Temple, qui accueille ses premiers membres') + '</p></div>';
  h += '<div class="cerg">' + inn.map(r => {
    const k = r[0], p = P[k] || {}, c = hofCareerOf(k), mine = k[0] === 'P';
    const prev = prevE && prevE.hof && prevE.hof.find(x => x[0] === k);
    const span = (c.start ? yr(c.start) + ' – ' : '') + (c.end ? yr(c.end) : '') + (c.cs ? ' · ' + c.cs + ' saison' + (c.cs > 1 ? 's' : '') + (c.l1 ? ', dont ' + c.l1 + ' en Ligue 1' : '') : '') + (c.age ? ' · retraité à ' + c.age + ' ans' : '');
    const tile = (v, l) => '<div><b>' + v + '</b>' + l + '</div>';
    const t6 = p.wr1 ? tile(p.wr1, 'saison' + (p.wr1 > 1 ? 's' : '') + ' n°1') : tile(p.t10 || 0, 'saisons top 10');
    return '<div class="cerpl' + (mine ? ' me' : '') + '"><span class="certag">' + (mine ? 'TA PLAQUE · ' : '') + (r[4] === 1 ? '1er SCRUTIN' : ord(r[4]).toUpperCase() + ' ANNÉE SUR LE SCRUTIN') + '</span>' +
      '<div class="cernm">' + hofName(k, r[1], r[2], 22) + '</div><div class="cersub">' + span + '</div>' +
      '<div class="cervote"><span>' + String(r[3]).replace('.', ',') + ' %</span>' + hofBar(r[3], HOF.pass) + '<span>' + (r[4] > 1 ? 'enfin !' : 'des votes') + '</span></div>' +
      '<div class="cerst">' + tile(p.w || 0, 'victoires L1') + tile(p.mj || 0, 'Majeur' + ((p.mj || 0) > 1 ? 's' : '')) + tile(p.fw || 0, 'Finale' + ((p.fw || 0) > 1 ? 's' : '')) + tile(p.t1 || 0, 'titre' + ((p.t1 || 0) > 1 ? 's' : '') + ' de L1') + t6 + tile(r[7], 'points Temple') + '</div>' +
      (prev && r[4] > 1 ? '<p class="cerhl">' + String(prev[3]).replace('.', ',') + ' % l’an passé : ' + (mine ? 'tu entres' : 'il entre') + ' à sa ' + ord(r[4]) + ' tentative.</p>' : c.best ? '<p class="cerhl">' + c.best + '</p>' : '') + '</div>';
  }).join('') + '</div>';
  if (rest.length) h += '<h2>Le reste du scrutin</h2><div class="block">' + rest.slice(0, 8).map(r => '<div class="hofv"><div class="hofvn">' + hofName(r[0], r[1], r[2], 16) + '</div>' + hofBar(r[3], HOF.pass) + '<b class="' + (r[6] ? 'drop' : '') + '">' + String(r[3]).replace('.', ',') + ' %</b></div>' +
    '<p class="small mute hofvs">' + (r[4] === 1 ? '1er scrutin' : ord(r[4]) + ' année') + (r[6] ? ' · ' + (r[3] < HOF.drop ? 'sous ' + HOF.drop + ' % : ' : '') + 'rayé du scrutin' : ' · reviendra l’an prochain') + '</p>').join('') +
    (rest.length > 8 ? '<p class="small mute">… et ' + (rest.length - 8) + ' autre' + (rest.length - 8 > 1 ? 's' : '') + '.</p>' : '');
  else h += '<div class="block">';
  const mem = new Set(st.m.map(m => m.k)), nxt = hofPeople(s + 1).filter(c => c.r + HOF.wait === s + 1 && !mem.has(c.k) && !st.x[c.k] && P[c.k] && P[c.k].pts >= HOF.min).sort((a, b) => P[b.k].pts - P[a.k].pts);
  h += '<p class="small" style="margin:10px 0 0">Il faut ' + HOF.pass + ' % des votes (le trait).' + (nxt.length ? ' L’an prochain, ' + nxt.length + ' nouvel' + (nxt.length > 1 ? 's' : '') + ' admissible' + (nxt.length > 1 ? 's' : '') + ', dont <b>' + esc(nxt[0].n) + '</b> (' + hofLine(P[nxt[0].k]) + ').' : '') + '</p></div>';
  h += '<div class="cerbtn"><button class="btn cergo" data-a="cergo" data-s="' + s + '">Continuer vers le bilan de la saison</button><button class="btn sec" data-a="hof">Voir le Temple</button></div>';
  return h;
}
function hofSeasonHTML(s) {
  const E = S.hist[s - 1] && S.hist[s - 1].end; if (!E || !E.hof || !E.hof.length) return '';
  const inn = E.hof.filter(r => r[5]);
  return '<div class="block sumblk"><h3>Temple de la renommée</h3>' + (inn.length ? inn.map(r => '<p style="margin:0 0 4px">★ <b>' + hofName(r[0], r[1], r[2], 16) + '</b> est intronisé' + (r[4] === 1 ? ' au premier scrutin' : '') + ' (' + String(r[3]).replace('.', ',') + ' %).</p>').join('') : '<p class="small" style="margin:0 0 4px">Personne n’est élu cette année.</p>') +
    '<p class="small mute" style="margin:4px 0 0">' + E.hof.length + ' candidat' + (E.hof.length > 1 ? 's' : '') + ' sur le scrutin. <a href="#" data-a="hof">Voir le Temple</a></p></div>';
}

