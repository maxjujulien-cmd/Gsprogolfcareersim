/* ============ v279 : MODE COMMISSAIRE ============
   S.comm : débloque tous les réglages (comme le déverrouillage) et le niveau du circuit, et permet de créer des golfeurs.
   Golfeur créé avant le premier tournoi de la saison : il entre tout de suite dans sa ligue. En cours de saison : il attend
   dans S.cpend et entre à l'intersaison (à la place d'une recrue de cette ligue). */
const CG_TALV = [['1', 'Bronze'], ['2', 'Argent'], ['3', 'Or'], ['-1', 'Défaut léger'], ['-2', 'Défaut marqué']];
function cgState() {
  if (VIEW.name === 'golfer' && VIEW.ge) return VIEW.ge;
  if (!VIEW.cg) VIEW.cg = { n: '', nat: 'Canada', a: 22, l: 3, o: 450, p: 650, reg: 3, cl: 0, sk: [3, 3, 3], t1: '', v1: '1', t2: '', v2: '1' };
  return VIEW.cg;
}
const cgNow = () => S && S.t === 0 && !S.cur;
function cgSel(k, cur, opts, extra) { return '<select data-c="cg" data-k="' + k + '"' + (extra || '') + '>' + opts.map(([v, t]) => '<option value="' + v + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>'; }
function cgTierTxt(o, p) { return '<span>' + TIERS[scale(TIERS, o)][1] + '</span> · <span>potentiel</span> <span>' + POTS[scale(POTS, p)][1] + '</span>'; }
function commHTML() {
  let h = '<div class="block"><h3 style="margin-top:0">Mode commissaire</h3><label class="crftog"><input type="checkbox" data-c="comm"' + (commOn() ? ' checked' : '') + '>Activer le mode commissaire</label>' +
    '<p class="small mute" style="margin:4px 0 0">Débloque tous les réglages (même après ton premier tournoi), le niveau du circuit, et te permet de créer des golfeurs. L’activation est notée dans les nouvelles.</p>';
  if (commOn() && S.cfg) h += '<label for="cmlvl" style="margin-top:12px">Niveau du circuit (coups ajoutés à chaque ronde des adversaires)</label><input type="number" id="cmlvl" data-c="commlvl" step="0.1" min="-8" max="40" inputmode="decimal" value="' + (+S.cfg.lvl || 0) + '">';
  h += '</div>';
  if (!commOn()) return h;
  const G = cgState();
  h += '<div class="block cgform"><h3 style="margin-top:0">Créer un golfeur</h3><p class="small mute" style="margin:0 0 8px">' + (cgNow() ? 'Aucun tournoi joué cette saison : il entrera tout de suite dans sa ligue.' : 'La saison est commencée : il fera son entrée à l’intersaison, dans la ligue choisie.') + '</p>' +
    cgFields(G, false);
  h += '<button class="btn" data-a="cgmake" style="width:100%;margin-top:12px">Créer le golfeur</button></div>';
  const P = S.cpend || [];
  if (P.length) h += '<div class="block"><h3 style="margin-top:0">En attente de l’intersaison</h3>' + P.map((x, i) => '<div class="famrow" style="align-items:center"><div style="flex:1">' + flagVisual(x.g.nat, 16) + ' <b>' + esc(x.g.n) + '</b> <span class="small mute">· <span>Ligue ' + (x.l + 1) + '</span> · <span>' + x.g.a + ' ans</span> · ' + cgTierTxt(x.g.o, x.g.p) + '</span></div><button class="btn sec sm" data-a="cgdel" data-i="' + i + '">Retirer</button></div>').join('') + '</div>';
  return h;
}
function cgFields(G, ed) {
  const nats = NATIONS.map(n => n.name).sort((a, b) => a.localeCompare(b)), tal = talOn(), sk = skOn();
  const tOpts = [['', 'Aucun']].concat(TAL_K.map(k => [k, TAL_LBL[k][0]]));
  let h = '' +
    '<label for="cgn">Nom</label><input type="text" id="cgn" data-c="cg" data-k="n" maxlength="40" autocomplete="off" value="' + esc(G.n) + '" placeholder="Prénom Nom">' +
    '<div class="tgrid"><div class="ti"><label>Nationalité</label>' + cgSel('nat', G.nat, nats.map(n => [n, n])) + '</div>' +
    '<div class="ti"><label for="cga">Âge</label><input type="number" id="cga" data-c="cg" data-k="a" min="15" max="65" inputmode="numeric" value="' + G.a + '"></div></div>' +
    '<label>Ligue</label>' + cgSel('l', G.l, LEAGUE_NAMES.map((n, i) => [i, n])) + (ed && !cgNow() ? '<p class="small mute" style="margin:2px 0 0">La saison est commencée : un changement de ligue se fera à l’intersaison.</p>' : '') +
    '<div class="tgrid"><div class="ti"><label for="cgo">Talent (0 à 1000)</label><input type="number" id="cgo" data-c="cg" data-k="o" min="5" max="995" inputmode="numeric" value="' + G.o + '"></div>' +
    '<div class="ti"><label for="cgp">Potentiel (0 à 1000)</label><input type="number" id="cgp" data-c="cg" data-k="p" min="5" max="1000" inputmode="numeric" value="' + G.p + '"></div></div>' +
    '<p class="small" id="cgtier" style="margin:4px 0 0"><b>' + cgTierTxt(G.o, G.p) + '</b></p>' +
    '<div class="tgrid"><div class="ti"><label for="cgbct">Ville natale</label><input type="text" id="cgbct" data-c="cg" data-k="bct" maxlength="40" autocomplete="off" value="' + esc(G.bct || '') + '" placeholder="Au hasard"></div>' +
    '<div class="ti"><label>Personnalité médiatique</label>' + cgSel('bpm', G.bpm || '', [['', 'Au hasard']].concat(MEDIA.map(m => [m.k, m.fr]))) + '</div></div>' +
    '<div class="tgrid"><div class="ti"><label for="cgbh">Taille (pi\u2032po)</label><input type="text" id="cgbh" data-c="cg" data-k="bh" maxlength="6" autocomplete="off" value="' + esc(G.bh || '') + '" placeholder="ex. 6\u20321"></div>' +
    '<div class="ti"><label for="cgbw">Poids (lb)</label><input type="number" id="cgbw" data-c="cg" data-k="bw" min="100" max="350" inputmode="numeric" value="' + (G.bw || '') + '" placeholder="Au hasard"></div>' +
    '<div class="ti"><label>Côté</label>' + cgSel('blf', G.blf == null ? '' : G.blf, [['', 'Au hasard'], [0, 'Droitier'], [1, 'Gaucher']]) + '</div></div>' +
    '<div class="tgrid"><div class="ti"><label>Régularité</label>' + cgSel('reg', G.reg, [5, 4, 3, 2, 1].map(k => [k, REG_LABELS[k]])) + '</div>' +
    '<div class="ti"><label>Sous pression</label>' + cgSel('cl', G.cl, CLUTCH.slice().reverse().map(c => [c[0], c[1]])) + '</div></div>';
  if (sk) h += '<div class="tgrid">' + SK_NM.map((nm, i) => '<div class="ti"><label>' + SK_ICO[i] + ' ' + nm + '</label>' + cgSel('sk', G.sk[i], [5, 4, 3, 2, 1].map(v => [v, LANG === 'en' ? (I18N_SKLV[SK_LV[v]] || SK_LV[v]) : SK_LV[v]]), ' data-i="' + i + '"') + '</div>').join('') + '</div>';
  if (tal) h += '<label style="margin-top:10px">Talents spéciaux</label>' + [1, 2].map(i => '<div class="tgrid"><div class="ti">' + cgSel('t' + i, G['t' + i], tOpts) + '</div><div class="ti">' + cgSel('v' + i, G['v' + i], CG_TALV) + '</div></div>').join('') +
    '<p class="small mute" style="margin:2px 0 0">Bronze, Argent, Or : une force. Défaut léger ou marqué : une faiblesse. Le « Sauveur » n’a pas de défaut.</p>';
  return h;
}
/* v280 : modifier un golfeur existant (page du golfeur, mode commissaire). VIEW.ge = copie modifiable. */
function geFrom(g) {
  const tr = (g.tr || []).slice(0, 2), enc = t => String(t.n ? -Math.min(2, t.lv) : t.lv);
  const l0 = leagueOf(g.id), bb = g.bio || {}; return { id: g.id, bct: bb.ct || '', bh: bb.h ? ftStr(bb.h) : '', bw: bb.w ? Math.round(bb.w * 2.2046) : '', blf: bb.lf ? 1 : 0, bpm: bb.pm || '', l: g.cmL != null ? g.cmL : l0 < 0 ? 3 : l0, n: g.n, nat: g.nat || 'Canada', a: g.a, o: Math.round(g.o), p: Math.round(g.p), reg: regLevel(g), cl: g.cl || 0, sk: (g.sk || [3, 3, 3]).slice(),
    t1: tr[0] ? tr[0].k : '', v1: tr[0] ? enc(tr[0]) : '1', t2: tr[1] ? tr[1].k : '', v2: tr[1] ? enc(tr[1]) : '1' };
}
function geBlock(id) {
  const g = S.G[id]; if (!commOn() || !g || (id === 0 && S.mode !== 'sim')) return '';
  const E = VIEW.ge && VIEW.ge.id === id ? VIEW.ge : null;
  const phB = GFX.faces.length || GFX.bgs.length ? (GFX.faces.length ? '<button class="btn sec sm" data-a="phnext">Autre visage</button>' : '') + (GFX.bgs.length ? '<button class="btn sec sm" data-a="bgnext">Autre décor</button>' : '') + (g.ph ? '<button class="btn sec sm" data-a="phdel">Sans photo</button>' : '') : '';
  if (!E) return '<div class="row" style="margin:0 0 12px;gap:8px;flex-wrap:wrap"><button class="btn sec sm" data-a="geopen">🛠️ Modifier ce golfeur</button>' + phB + '</div>';
  return '<div class="block cgform"><h3 style="margin-top:0">🛠️ Modifier ce golfeur</h3><p class="small mute" style="margin:0 0 8px">Les changements s’appliquent tout de suite.</p>' + cgFields(E, true) +
    '<div class="row" style="margin-top:12px"><button class="btn" data-a="gesave">Enregistrer</button><button class="btn sec" data-a="gecancel">Annuler</button></div></div>';
}
function geSave() {
  const E = VIEW.ge, g = E && S.G[E.id]; if (!g) return;
  const nEl = document.getElementById('cgn'); if (nEl) E.n = nEl.value;
  const n = String(E.n || '').trim().replace(/\s+/g, ' ');
  if (n.length < 2) { toast('Entre un nom'); return; }
  if (n !== g.n) { const used = new Set(); Object.values(S.G).forEach(x => x && x !== g && used.add(x.n)); (S.cpend || []).forEach(x => used.add(x.g.n)); if (S.name && g.id !== 0) used.add(S.name); if (used.has(n)) { toast('Ce nom est déjà pris'); return; }
    S.used = (S.used || []).filter(x => x !== g.n).concat([n]); }
  const old = g.n, o = clamp(Math.round(+E.o || g.o), 5, 995), p = clamp(Math.round(+E.p || g.p), o, 1000);
  g.n = n; g.nat = E.nat || g.nat; g.a = clamp(Math.round(+E.a || g.a), 15, 70);
  g.o = o; g.op = Math.max(g.op || o, o); g.p = p; g.pt = p;
  if (+E.reg !== regLevel(g)) { const [lo, hi] = REG.band[5 - (+E.reg || 3)]; g.v = g.v0 = Math.sqrt(lo * hi); }
  g.cl = +E.cl || 0; g.sk = E.sk.map(v => clamp(+v || 3, 1, 5));
  { const B = g.bio || bioRoll(g).bio, ct = String(E.bct || '').trim(); if (ct) B.ct = ct.slice(0, 40);
    if (htIn(E.bh)) B.h = clamp(htIn(E.bh), 150, 215); if (+E.bw) B.w = clamp(Math.round(+E.bw / 2.2046), 45, 160);
    if (E.blf !== '' && E.blf != null) B.lf = +E.blf ? 1 : 0; if (E.bpm && MEDIA_BY[E.bpm] && E.bpm !== B.pm) { B.pm = E.bpm; B.pl = 1; } }
 g.cm = 1;
  const prev = g.tr || [], tr = [];
  [[E.t1, E.v1], [E.t2, E.v2]].forEach(([k, v]) => {
    if (!k || tr.some(t => t.k === k)) return; let lv = +v || 1; const neg = lv < 0 && k !== 'scr' ? 1 : 0; lv = Math.abs(lv); if (neg) lv = Math.min(2, lv);
    const same = prev.find(t => t.k === k && t.lv === lv && (t.n ? 1 : 0) === neg);
    tr.push(same ? Object.assign(same, { rv: same.rv == null ? -1 : same.rv }) : { k, lv, n: neg, sn: TAL_REV[lv] || 0, rv: -1, h: [] });
  });
  g.tr = tr;
  const nl = clamp(+E.l, 0, 3), cl0 = leagueOf(g.id);
  if (nl !== cl0 && cl0 >= 0) { if (cgNow()) { S.L[cl0] = S.L[cl0].filter(x => x !== g.id); S.L[nl].push(g.id); delete g.cmL; } else g.cmL = nl; }
  else if (nl === cl0) delete g.cmL;
  (S.news = S.news || []).unshift({ s: S.season, t: S.t, text: '🛠️ Commissaire : ' + (old !== n ? old + ' devient ' + n : n + ' a été modifié') + '.' });
  VIEW.ge = null; persist(); render(); toast('Golfeur modifié');
}
function cgBuild() {
  const G = cgState(), n = String(G.n || '').trim().replace(/\s+/g, ' ');
  if (n.length < 2) { toast('Entre un nom'); return null; }
  const used = new Set(S.used || []); Object.values(S.G).forEach(g => g && used.add(g.n)); (S.cpend || []).forEach(x => used.add(x.g.n)); if (S.name) used.add(S.name);
  if (used.has(n)) { toast('Ce nom est déjà pris'); return null; }
  const a = clamp(Math.round(+G.a || 22), 15, 65), o = clamp(Math.round(+G.o || 450), 5, 995), p = clamp(Math.round(+G.p || o), o, 1000);
  const id = S.nextId++, tmp = new Set(), g = newGolfer(id, tmp, o, a);
  g.n = n; g.nat = G.nat || 'Canada'; g.a = a; g.o = o; g.op = o; g.p = p; g.cs = 0; g.sg = 0; g.cm = 1;
  initDev(g); g.pt = p;
  const [lo, hi] = REG.band[5 - (+G.reg || 3)]; g.v = g.v0 = Math.sqrt(lo * hi);
  g.cl = +G.cl || 0; g.sk = G.sk.map(v => clamp(+v || 3, 1, 5));
  { const B = bioRoll(g).bio, ct = String(G.bct || '').trim(); if (ct) B.ct = ct.slice(0, 40);
    if (htIn(G.bh)) B.h = clamp(htIn(G.bh), 150, 215); if (+G.bw) B.w = clamp(Math.round(+G.bw / 2.2046), 45, 160);
    if (G.blf !== '' && G.blf != null) B.lf = +G.blf ? 1 : 0; B.pm = G.bpm && MEDIA_BY[G.bpm] ? G.bpm : mediaPick(g); if (G.bpm && MEDIA_BY[G.bpm]) B.pl = 1; }

  g.tr = [];
  [[G.t1, G.v1], [G.t2, G.v2]].forEach(([k, v]) => {
    if (!k || g.tr.some(t => t.k === k)) return; let lv = +v || 1; const neg = lv < 0 && k !== 'scr' ? 1 : 0; lv = Math.abs(lv); if (neg) lv = Math.min(2, lv);
    g.tr.push({ k, lv, n: neg, sn: TAL_REV[lv] || 0, rv: -1, h: [] });
  });
  S.used = Array.from(new Set((S.used || []).concat([n])));
  return { g, l: clamp(+G.l || 0, 0, 3) };
}
function cgMake() {
  const x = cgBuild(); if (!x) return;
  const { g, l } = x, now = cgNow();
  if (now) { S.G[g.id] = g; S.L[l].push(g.id); }
  else (S.cpend = S.cpend || []).push(x);
  (S.news = S.news || []).unshift({ s: S.season, t: S.t, text: '🛠️ Commissaire : ' + g.n + ' (' + g.nat + ', ' + g.a + ' ans) ' + (now ? 'fait son entrée' : 'fera son entrée à l’intersaison') + ' en Ligue ' + (l + 1) + '.' });
  const G = cgState(); G.n = ''; persist(); render();
  toast(now ? g.n + ' ajouté en Ligue ' + (l + 1) : g.n + ' entrera à l’intersaison');
}
const MAJ_T = [2, 4, 6, 8], MAJ_DEF = ['Championnat International', 'Open du Circuit', 'Championnat des Joueurs', 'Classique des Champions'];
const MAJ = { pts: 2, purse: 1.5 }, FIN = { n: 30, pts: 2, purse: 2 };
const isMajorT = t => !!(CFG.majors && S && !S.duo && MAJ_T.includes(t));
const majorName = t => { const n = (S.settings && S.settings.majN) || MAJ_DEF, i = MAJ_T.indexOf(t); return (n[i] && String(n[i]).trim()) || MAJ_DEF[i] || 'Majeur'; };
const finOn = () => !!(CFG.finale && S && !S.duo);
const tGet = (H, t) => !H ? null : t >= N_TOURN ? H.fin || null : H.t[t];
const tLabel = t => t >= N_TOURN ? 'Finale' : 'Tournoi ' + (t + 1);
function finalePending() { if (!finOn() || S.t < N_TOURN) return false; const H = seasonHist(); return !!H && !H.fin; }
function finField() {
  const ra = rankAll(0).filter(r => r.id === 0 ? leagueOf(0) === 0 : !!S.G[r.id]); if (!ra.length) return [];
  const lim = ra[Math.min(FIN.n, ra.length) - 1].pts;
  return ra.filter(r => r.pts >= lim).map(r => r.id);
}
const playerInFinale = () => finalePending() && !S.spect && S.mode !== 'sim' && leagueOf(0) === 0 && finField().includes(0);
function finCourse() { ensureFinSlot(); return S.courses[N_TOURN]; }
function ensureFinSlot() {   // la Finale a sa propre case (S.courses[10]) : on la choisit dans Terrains de la saison comme les 10 autres
  if (!S || !Array.isArray(S.courses) || S.courses.length > N_TOURN || !finOn()) return;
  const used = new Set(S.courses.map(c => normName(c.name)));
  const pool = (BANK.length ? crfPool() : []).filter(b => !used.has(normName(b.name)));
  const c = Object.assign({ name: 'Finale', pars: DEFAULT_PARS.slice() }, newCourseMeta());
  if (pool.length) { const by = new Map(); pool.forEach(x => { const k = normName(x.name); if (!by.has(k)) by.set(k, []); by.get(k).push(x); }); const ks = [...by.keys()], b = neutralTee(by.get(ks[Math.floor(Math.random() * ks.length)])); applyBankToCourse(c, b); c.name = b.name; }   // v365 : chaque terrain a la même chance, peu importe son nombre de tees
  else { const nm = COURSE_NAMES.filter(n => !used.has(normName(n))); c.name = nm.length ? nm[Math.floor(Math.random() * nm.length)] : 'Finale'; c.pars = randomPars(); }
  c.pin = randomPin(); c.pin2 = randomPin(); c.wind = randomWind(); c.wind2 = randomWind(); c.purse = randomPurse();
  S.courses[N_TOURN] = c;
}
function boostL1(lg) { const L = lg[0]; if (!L) return; L.rows.forEach(r => { r[4] = Math.round(r[4] * (CFG.majPts || MAJ.pts)); }); Object.keys(L.pay || {}).forEach(k => { L.pay[k] = Math.round(L.pay[k] * MAJ.purse); }); L.maj = 1; }
const emptyLg = () => ({ rows: [], cut: null, playoff: false, h: {}, pay: {} });
function lgSnap(l) { const ra = rankAll(l), ids = ra.map(r => r.id), rk = {}, pts = {}, gh = {}; ra.forEach((r, i) => { rk[r.id] = i + 1; pts[r.id] = r.pts; if (r.gh) gh[r.id] = 1; }); return { ids, rk, pts, gh }; }
function finNews(lg0, lead0) {
  const w = lg0.rows[0] && lg0.rows[0][0]; if (w == null) return;
  const lead1 = rankAll(0)[0], c = S.courses[N_TOURN] || {};
  S.news.unshift({ s: S.season, t: N_TOURN + 1, text: '🏆 ' + (w === 0 ? 'Tu remportes' : nameOf(w) + ' remporte') + ' la Finale' + (c.name ? ' à ' + c.name : '') + '.', l: 0, ids: [w] });
  if (lead1 && lead0 != null && lead1.id !== lead0) S.news.unshift({ s: S.season, t: N_TOURN + 1, text: 'La Finale renverse le classement : ' + nameOf(lead1.id) + ' termine 1er de la Ligue 1, devant ' + nameOf(lead0) + '.', l: 0, ids: [lead1.id, lead0] });
  if (S.news.length > IBX_MAX) S.news.length = IBX_MAX;
}
/* Finale simulée (histoire, spectateur, mode simulé, ou joueur absent du top 30) */
function simFinale() {
  const H = seasonHist(); if (!H || H.fin) return;
  const course = finCourse(), pars = course.pars.slice(), index = (course.index || defaultIndex()).slice();
  const ctx = Object.assign(newCtx(), { windBump: [windBump(course.wind || 'none'), windBump(course.wind2 || 'none')], crDelta: crDeltaOf(course, pars), distDelta: distDelta(course.dist), slopeFactor: slopeEffFactor(course.slope) });
  const ids = finField().filter(id => S.G[id]);
  if (ids.length < 2) { H.fin = { skip: 1, lg: [emptyLg(), null, null, null] }; return; }
  const grid = gridFor(pars), purse = cPurse(course) * FIN.purse, one = !!S.one;
  const r = simTournamentAI(MODEL, grid, pars, ids, S.G, ctx, ids.length, index, one);
  const lg0 = { rows: r.rows, cut: r.cut, playoff: r.playoff, h: r.h, pay: computePayouts(paidRows(r.rows, r.cut), purse), fin: 1 }; if (one) lg0.one = 1; if (r.po) lg0.po = r.po;
  lg0.rows.forEach(x => { x[4] = Math.round(x[4] * FIN.pts); });
  const pre = lgSnap(0), lead0 = pre.ids[0];
  lg0.rows.forEach(([id, pos, r1, r2, pts]) => {
    const st = getSt(id); st.pts += pts; st.n++; if (pos === 1) st.w++; if (pos > 0 && pos <= 10) st.t10++; if (pos > 0 && pos <= 5) st.t5++; if (pos > 0 && pos <= 3) st.t3++;
    if (pos > 0 && pos <= 20) st.t20 = (st.t20 || 0) + 1; st.sum += r1 + (r2 || 0); st.rds += r2 === null ? 1 : 2;
    addEarnings(id, lg0.pay[id] || 0);
  });
  { const w = lg0.rows[0][0], g = S.G[w]; if (g) g.cw = (g.cw || 0) + 1; }
  const lg = [lg0, emptyLg(), emptyLg(), emptyLg()], evs = scanExtremes(lg, pars), post = lgSnap(0);
  const sum0 = buildSummary({ l: 0, rows: lg0.rows, cut: lg0.cut, one: lg0.one, playoff: lg0.playoff, par: parTotal(pars), pay: lg0.pay, evs, recs: [], pre, post, tIdx: N_TOURN, pl: 0, me: false });
  H.fin = { name: course.name, par: parTotal(pars), pars, index, tee: course.tee, dist: course.dist, cr: course.cr, slope: course.slope, pin: course.pin, wind: course.wind, pin2: course.pin2, wind2: course.wind2, purse, pl: 0, lg, recap: '', evs: evs.slice(0, 40), ctx, rb: 0, ra: 0, pb: 0, r1lead: null, recs: [], sum: [sum0, null, null, null], pre: 1, mvs: [], fin: 1, field: ids.length };
  finNews(lg0, lead0);
}
function bigWinsHTML(id) {
  const b = bigWins(id); if (!b.maj.length && !b.fin.length) return '';
  return '<div class="block" style="border-left:5px solid #C9A227"><b>\ud83c\udfc6 ' + (b.maj.length ? b.maj.length + ' Majeur' + (b.maj.length > 1 ? 's' : '') : '') + (b.maj.length && b.fin.length ? ' \u00b7 ' : '') + (b.fin.length ? b.fin.length + ' Finale' + (b.fin.length > 1 ? 's' : '') : '') + '</b><div class="small mute" style="margin-top:2px">' +
    b.maj.map(x => esc(x.n) + ' ' + yr(x.s)).concat(b.fin.map(x => 'Finale ' + yr(x.s))).join(' \u00b7 ') + '</div></div>';
}
/* Majeurs et Finales gagnés (fiche, Temple) */
function bigWins(id) {
  const out = { maj: [], fin: [] }, key = hofKey(id, S.season);
  S.hist.forEach(H => {
    if (hofKey(id, H.s) !== key) return;
    (H.t || []).forEach(t => { if (t && t.maj && t.lg && t.lg[0] && t.lg[0].rows[0] && t.lg[0].rows[0][0] === id) out.maj.push({ s: H.s, n: t.maj }); });
    const F = H.fin; if (F && F.lg && F.lg[0] && F.lg[0].rows[0] && F.lg[0].rows[0][0] === id) out.fin.push({ s: H.s, n: F.name });
  });
  if (id !== 0 && S.old && !S.G[id]) { /* retraité : mêmes données */ }
  return out;
}
const VL = { safe: 120, auto: 5, cand: 20, min: 130, max: 170, total: 600, std: [4.3, 7.5, 12.0], minL: [130, 145, 160], maxL: [170, 180, 190], candL: [0, 20, 25, 30], lo: 575, hi: 625 };
/* v360 : taille visée par ligue (L1 la plus serrée), plus de promus depuis les ligues faibles, total libre entre 575 et 625 */
let VL2 = true;
const vlMin = l => VL2 ? VL.minL[l] : VL.min, vlMax = l => VL2 ? VL.maxL[l] : VL.max, vlCand = l => VL2 ? VL.candL[l] : VL.cand;
/* v246 : index requis pour rester (ou monter) dans une ligue = moyenne des index de cette ligue sur les 5 dernières saisons
   moins CFG.vlAvgD (ex. 0,4 : moyenne 4,0 → il faut 3,6 ou mieux). Sans historique : standard fixe (v223). */
const vlStdUp = l => { if (CFG.vlAvgUp === 2) { const a = vlAvg(l); if (a != null) return Math.round((a + (CFG.vlUpAdd || 0)) * 10) / 10; } return CFG.vlAvgUp === 0 || CFG.vlAvgUp === 2 ? VL.std[l] + 0.9 * lvlShift() : vlStd(l); };   // promotions : même seuil (ou standard fixe si vlAvgUp = 0)
/* v326 : moyenne des index de la ligue sur 5 saisons, dont la saison en cours mesurée en direct (la cible bouge après
   chaque tournoi) ; les saisons d'avant le début de l'histoire (S.ixPre, gardées par worldReset) comptent aussi. */
let VLA_MEMO = null;
function vlAvg(l) {
  if (!S) return null;
  const k = S.season + '|' + S.t + '|' + (S.last ? S.last.s + '.' + S.last.t : '-') + '|' + S.L.map(a => a.length).join(',');
  if (!VLA_MEMO || VLA_MEMO.S !== S || VLA_MEMO.k !== k) VLA_MEMO = { S, k, v: {}, cur: null };
  if (VLA_MEMO.v[l] !== undefined) return VLA_MEMO.v[l];
  let t = 0, n = 0;
  for (let y = S.season; y > S.season - 5; y--) {
    let v = null; const a = S.alm && S.alm[y];
    if (a && a.ix && a.ix[l] != null) v = a.ix[l];
    else if (y === S.season) { if (!VLA_MEMO.cur) VLA_MEMO.cur = almIdxMeans(); v = VLA_MEMO.cur[l]; }
    else if (S.ixPre && S.ixPre[y] && S.ixPre[y][l] != null) v = S.ixPre[y][l];
    if (v != null) { t += v; n++; }
  }
  return (VLA_MEMO.v[l] = n ? t / n : null);
}
const vlStd = l => { if (CFG.vlAvgD != null && CFG.vlAvgD >= 0) { const a = vlAvg(l); if (a != null) return Math.round((a - CFG.vlAvgD) * 10) / 10; } return VL.std[l] + 0.9 * lvlShift(); };   // v223 : les standards d'index suivent le niveau du circuit choisi
function planMoves(surv, G, s, commit) {
  // v331 : les promus en cours de saison occupent leur place dans le top 20 (positions du classement complet, promus compris)
  const GPOS = CFG.varLg && CFG.gpCount ? [0, 1, 2, 3].map(L => { const m = {}; try { rankAll(L).forEach((x, i) => { m[x.id] = i; }); } catch (e) { } return m; }) : null;
  const up = [[], [], [], []], down = [[], [], [], []], saved = [], car = [];
  const prot = id => !!(G[id] && G[id].mv) || (id === 0 && !G[0] && S.pk && S.pk.mv);
  const exP = (id, l) => !!exInfo(id, l, s);
  const useCar = (id, l) => { if (!carEligible(id, l)) return false; car.push(id); if (commit) carUse(id, s); return true; };
  if (!CFG.varLg) {
    const relegateN = [0, 1, 2].map(l => Math.max(0, surv[l].length - (FIELD - MOVE)));
    for (let l = 0; l < 3; l++) {
      const elig = surv[l].filter(id => !prot(id));
      for (let i = elig.length - 1; i >= 0 && down[l].length < relegateN[l]; i--) {
        const id = elig[i];
        if (exP(id, l)) { if (elig.length - i <= relegateN[l]) saved.push([id, l]); continue; }
        if (useCar(id, l)) continue;
        down[l].unshift(id);
      }
    }
    for (let l = 0; l < 3; l++) {
      const rest = surv[l].length - down[l].length - up[l].length + (l > 0 ? down[l - 1].length : 0);
      const room = surv[l + 1].length - (l + 1 < 3 ? relegateN[l + 1] : 0);
      up[l + 1] = surv[l + 1].slice(0, Math.max(0, Math.min(FIELD - rest, room)));
    }
    return { up, down, saved, car };
  }
  const hcx = id => { const g = id === 0 ? hcHolder(0) : G[id]; return g && g.hc && g.hc.x != null ? g.hc.x : 99; };
  for (let l = 0; l < 3; l++) {
    const fromAbove = l > 0 ? down[l - 1] : [], rk = surv[l], pos = new Map(rk.map((id, i) => [id, i]));
    const ranks = rk.filter(id => !up[l].includes(id)), keep = new Set(), relSet = new Set();
    // v332 : les N derniers descendent (arrivés en cours de saison et exemptés protégés : c'est le suivant au-dessus qui descend)
    for (let x = ranks.length - 1, n = relBot(); x >= 0 && n > 0; x--) { const id = ranks[x]; if (prot(id)) continue; if (exP(id, l)) { saved.push([id, l]); continue; } if (useCar(id, l)) continue; relSet.add(id); n--; }
    ranks.forEach(id => { if (!relSet.has(id)) keep.add(id); });
    const firm = id => !relSet.has(id);
    let stay = ranks.filter(id => keep.has(id)), size = fromAbove.length + stay.length;
    const cand = surv[l + 1], pick = [];
    cand.forEach((id, i0) => { const i = GPOS ? (GPOS[l + 1][id] != null ? GPOS[l + 1][id] : 999) : i0; if (i < VL.auto) pick.push(id); else if (i < vlCand(l + 1) && size + pick.length < vlMax(l)) pick.push(id); });
    size += pick.length;
    while (size > vlMax(l)) { let k = -1; for (let x = stay.length - 1; x >= 0; x--) if (!firm(stay[x])) { k = x; break; } if (k < 0) break; stay.splice(k, 1); size--; }
    for (let ci = 0; size < vlMin(l) && ci < cand.length; ci++) if (!pick.includes(cand[ci])) { pick.push(cand[ci]); size++; }
    up[l + 1] = pick; down[l] = ranks.filter(id => !stay.includes(id));
  }
  return { up, down, saved, car };
}
/* Projection pour l'affichage (zones de promotion et de relégation de la saison en cours) */
let PLAN_MEMO = null;
function planNow() {
  const k = S.season + '|' + S.t + '|' + (S.cur ? S.cur.r + '.' + (S.cur.ps || []).length : '-') + '|' + S.L.map(a => a.length).join(',') + '|' + (CFG.varLg ? 1 : 0);
  if (PLAN_MEMO && PLAN_MEMO.k === k && PLAN_MEMO.S === S) return PLAN_MEMO.p;
  const p = planMoves(S.L.map(ids => rankIds(ids, S.st)), S.G, S.season, false);
  PLAN_MEMO = { k, S, p }; return p;
}
/* Exemptions : victoire (saison en cours + 2 suivantes, dans la ligue de la victoire et plus bas),
   champion de la saison passée (ligue du dessus et plus bas), exemption unique de carrière (10 victoires en L1). */
const EXW = 3;
let EXW_MEMO = null;
function exWins(s) {
  const k = s + '|' + S.hist.length + '|' + (S.last ? S.last.s + '.' + S.last.t : '-');
  if (EXW_MEMO && EXW_MEMO.k === k && EXW_MEMO.S === S) return EXW_MEMO.m;
  const m = new Map();
  S.hist.forEach(H => { if (!H || H.s < s - EXW + 1 || H.s > s) return; (H.fin && H.fin.lg ? (H.t || []).concat([H.fin]) : (H.t || [])).forEach((t, ti) => { if (!t || !t.lg) return; t.lg.forEach((x, l) => { const r = x && x.rows && x.rows.find(y => y[1] === 1); if (r) { if (!m.has(r[0])) m.set(r[0], []); m.get(r[0]).push({ s: H.s, l, t: ti, n: t.name }); } }); }); });
  EXW_MEMO = { k, S, m }; return m;
}
function exInfo(id, l, s) {
  if (!S || l == null || l < 0 || l > 2) return null;
  s = s || S.season; let best = null;
  const take = (until, tip) => { if (!best || until > best.until) best = { until, tip }; };
  if (CFG.exWin) (exWins(s).get(id) || []).filter(w => w.l <= l).forEach(w => take(w.s + EXW - 1, (w.t >= N_TOURN ? 'victoire en Finale' : 'victoire') + (w.n ? ' \u00e0 ' + w.n : ' au tournoi ' + (w.t + 1)) + ' en ' + yr(w.s) + ', Ligue ' + (w.l + 1)));
  if (CFG.exChamp) { const H = S.hist[s - 2], T = H && H.end && H.end.tables; if (T) for (let lc = 0; lc < 4; lc++) { const r = T[lc] && T[lc][0]; if (r && r[0] === id && l >= lc - 1) take(s, 'champion de la Ligue ' + (lc + 1) + ' en ' + yr(s - 1)); } }
  const g = gmv(id); if (g && g.cxu != null && s <= g.cxu + 1 && l === 0) take(g.cxu + 1, 'exemption unique de carrière, utilisée en ' + yr(g.cxu));
  return best;
}
const carWinsL1 = id => { try { const p = hofLedger()[hofKey(id, S.season)]; return p ? p.w : 0; } catch (e) { return 0; } };
function carEligible(id, l) { const g = gmv(id); return !!(CFG.exCar && l === 0 && g && g.cxu == null && carWinsL1(id) >= 10); }
function carUse(id, s) {
  const g = gmv(id); if (!g) return; g.cxu = s;
  const t = (id === 0 ? 'Tu utilises' : nameOf(id) + ' utilise') + ' l’exemption unique de carrière (' + carWinsL1(id) + ' victoires en L1) : ' + (id === 0 ? 'tu restes' : 'il reste') + ' en Ligue 1 jusqu’à la fin de ' + yr(s + 1) + '.';
  S.news.unshift({ s: S.season, t: S.t, text: '🛡 ' + t, l: 0, ids: [id] }); if (S.news.length > IBX_MAX) S.news.length = IBX_MAX;
}
function exLineHTML(id, l) {   // fiche du golfeur : exemption en cours et exemption de carrière
  let h = ''; const e = exInfo(id, l);
  if (e) h += '<div class="small" style="margin-top:4px">\ud83d\udee1 Exempt\u00e9 de rel\u00e9gation jusqu\u2019\u00e0 la fin de ' + yr(e.until) + ' : ' + esc(e.tip) + '.</div>';
  const g = gmv(id), w = CFG.exCar ? carWinsL1(id) : 0;
  if (w >= 10) h += '<div class="small mute" style="margin-top:2px">Exemption unique de carri\u00e8re (' + w + ' victoires en L1) : ' + (g && g.cxu != null ? 'utilis\u00e9e en ' + yr(g.cxu) : 'disponible') + '.</div>';
  return h;
}
function exBadge(id, l) {
  const e = exInfo(id, l); if (!e) return '';
  const tip = (id === 0 ? 'Tu es exempté' : 'Exempté') + ' de relégation jusqu’à la fin de ' + yr(e.until) + ' : ' + e.tip + '.' + (l > 0 ? ' La montée reste possible.' : '');
  return '<span class="mw ex" tabindex="0" role="button" data-mw="' + esc(tip) + '" aria-label="' + esc(tip) + '">🛡</span>';
}
function endSeason(U, st, simPlayer) {
  eraStep();
  const { G, L } = U;
  const ranked = L.map(ids => rankIds(ids, st));
  // situation de chacun pendant la saison qui se termine
  const lg0 = {}, pct = {}, promoted = {};
  for (let l = 0; l < 4; l++) {
    ranked[l].forEach((id, i) => { lg0[id] = l; pct[id] = i / Math.max(1, ranked[l].length - 1); });
    if (l > 0) ranked[l].slice(0, MOVE).forEach(id => { promoted[id] = true; });
  }
  // 1. retraites : décidées d'abord, d'après la saison qui se termine
  const retired = [], gone = new Set();
  let WRK = {}; try { WRK = Object.assign({}, worldRanks()); } catch (e) { }   // v264 : rang mondial figé avant les départs
  for (let l = 0; l < 4; l++) ranked[l].forEach(id => {
    if (id === 0) return;   // le joueur décide lui-même de sa retraite (bouton à l'intersaison), jamais le hasard
    const g = G[id];
    g.sg = (promoted[id] || l === 0) ? 0 : (g.sg || 0) + 1;         // saisons sans promotion (hors Ligue 1)
    g.y4 = l === 3 && !promoted[id] && !g.mv ? (g.y4 || 0) + 1 : 0;   // saisons COMPLÈTES de suite en Ligue 4 (une montée, ou une arrivée en cours de saison, remet à zéro)
    const fVet = l === 3 && g.y4 >= FORCED_L4.vn && g.a >= FORCED_L4.vage && FORCED_L4.n < 99;   // v361 : 26 ans et plus, 2e saison de suite en L4 : la L4 est une ligue de développement
    const forced = (l === 3 && g.y4 >= FORCED_L4.n && g.a >= FORCED_L4.age) || fVet;   // retraite forcée : perd sa place sur le circuit
    if (forced || Math.random() < retireHazard(g, l, pct[id], g.sg, WRK[id])) {
      retired.push({ id, name: g.n, age: g.a, l, cs: (g.cs || 0) + 1, cw: g.cw || 0, nat: g.nat, ce: g.ce || 0, oh: g.oh, hc: g.hc, pa: g.pa, o: g.o, p: g.p, f: forced ? (fVet && !(g.y4 >= FORCED_L4.n && g.a >= FORCED_L4.age) ? 2 : 1) : 0, rc: g.rc, fam: g.fam, bio: g.bio, ph: g.ph, bg: g.bg }); gone.add(id); delete G[id];
    }
  });
  const surv = ranked.map(ids => ids.filter(id => !gone.has(id)));
  // 2. mouvements : au-delà des 140 premiers de chaque ligue (FIELD − MOVE), tout le monde descend (seuil fixe, pas 10 pile) —
  //    donc une ligue qui a fini la saison plus mince ou plus garnie que 150 (à cause des mouvements en cours de
  //    saison) relègue moins ou plus en conséquence ; en haut, les meilleurs de la ligue du dessous montent,
  //    assez nombreux pour aussi combler les départs
  const mvP = planMoves(surv, G, S.season, true), up = mvP.up, down = mvP.down;
  up.forEach(a => a.forEach(id => { if (G[id]) G[id].sg = 0; }));
  const newL = [[], [], [], []];
  for (let l = 0; l < 4; l++) {
    const stay = surv[l].filter(id => !up[l].includes(id) && !down[l].includes(id));
    newL[l] = stay.concat(l > 0 ? down[l - 1] : [], l < 3 ? up[l + 1] : []);
  }
  if (U.G === S.G) Object.values(G).forEach(g => { if (!g || g.cmL == null) return; const t = g.cmL; delete g.cmL; if (gone.has(g.id)) return; for (let l = 0; l < 4; l++) newL[l] = newL[l].filter(x => x !== g.id); newL[t].push(g.id); });   // v280 : changement de ligue du commissaire
  // 3. progression
  const events = [];
  for (let l = 0; l < 4; l++) newL[l].forEach(id => {
    if (id === 0 && !simPlayer) return;
    const ev = ageSeason(G[id]);
    if (ev) events.push({ id, ev, l });
    const te = talSeason(G[id]); if (te) te.forEach(x => events.push(Object.assign({ id, ev: 'tal', l }, x)));
    const ce = clSeason(G[id]); if (ce) events.push(Object.assign({ id, ev: 'cl', l }, ce));
    const tre = trSeason(G[id]); if (tre) tre.forEach(x => events.push(Object.assign({ id, ev: 'trt', l }, x)));
    try { bioSeason(G[id]); } catch (e) { }
    const se = skSeason(G[id]); if (se) se.forEach(x => events.push(Object.assign({ id, ev: 'sk', l }, x)));
  });
  // 4. recrues
  const rookies = [], used = new Set(U.used), rcg = [];
  if (S.cpend && S.cpend.length && U.G === S.G) { S.cpend.forEach(x => { if (!x || !x.g || G[x.g.id]) return; G[x.g.id] = x.g; used.add(x.g.n); newL[x.l].push(x.g.id); rookies.push({ id: x.g.id, l: x.l }); }); S.cpend = []; }
  const rcIds = S.rcl && S.rcl.s === S.season && (CFG.rcOn || S.rcl.ids.includes(0)) ? S.rcl.ids.filter(id => G[id] || id === 0) : null;
  if (rcIds) {   // v247 : la classe de recrues de la saison est placée selon son index : la meilleure ligue dont la moyenne est moins bonne que lui
    const avg = (S.alm && S.alm[S.season] && S.alm[S.season].ix) || almIdxMeans(), nc = CFG.rcNoCard == null ? 5 : CFG.rcNoCard;
    const hx = id => { const g = id === 0 ? hcHolder(0) : G[id]; return g && g.hc && g.hc.x != null ? g.hc.x : 99; };
    const thr = rcCutThr(rcIds.filter(id => id !== 0).map(hx), avg);   // v343 : plafond de retranchés
    rcIds.slice().sort((a, b) => hx(a) - hx(b)).forEach((id, i) => {
      const g = G[id], x = hx(id); let l = [0, 1, 2, 3].find(k => avg[k] != null && x < avg[k]), just = 0;
      if (l == null) { l = avg[3] == null || x <= thr || id === 0 ? 3 : -1; just = l === 3 && avg[3] != null && x > avg[3] + nc && id !== 0 ? 1 : 0; }   // le joueur a toujours sa carte
      if (id === 0 && !g) { rcg.push([0, Math.round(x * 10) / 10, l, i + 1]); newL[l].push(0); return; }
      const jt = just;
      const ev = ageSeason(g); if (ev) events.push({ id, ev, l }); g.cs = 0; delete g.rcl; g.rcs = S.season; if (id === 0) g.sg = 0;
      rcg.push(jt ? [id, Math.round(x * 10) / 10, l, i + 1, 1] : [id, Math.round(x * 10) / 10, l, i + 1]);
      if (l < 0) { gone.add(id); retired.push({ id, name: g.n, age: g.a, l: 3, cs: 0, cw: 0, nat: g.nat, ce: 0, oh: g.oh, hc: g.hc, pa: g.pa, o: g.o, p: g.p, f: 0, nc: 1, rc: g.rc, fam: g.fam, bio: g.bio }); delete G[id]; return; }
      newL[l].push(id); rookies.push({ id, l });
    });
  }
  if (!rcIds) for (let l = 3; l >= 0; l--) {
    const need = CFG.varLg ? (l === 3 ? Math.max(0, VL.total - newL.reduce((x, y) => x + y.length, 0)) : Math.max(0, vlMin(l) - newL[l].length)) : FIELD - newL[l].length;   // ligues variables : le total reste à 600, les recrues vont en L4
    for (let k = 0; k < need; k++) { const g = newRookie(U.nextId++, used); G[g.id] = g; newL[l].push(g.id); rookies.push({ id: g.id, l }); }
  }
  if (CFG.rcOn) {   // nouvelle classe pour la saison suivante : assez pour garder le circuit autour de 600 golfeurs (≈ 12 % sans carte)
    const tot = newL.reduce((x, y) => x + y.length, 0), nRet = retired.filter(r => !r.nc).length;
    S.rch = (S.rch || []).concat([nRet]).slice(-4); const mRet = S.rch.reduce((a, b) => a + b, 0) / S.rch.length;   // retraites moyennes (4 dernières saisons) : classes stables
    const gap = VL2 ? (tot < VL.lo ? VL.lo - tot : tot > VL.hi ? VL.hi - tot : 0) : VL.total - tot, n = clamp(Math.round(mRet * 1.12 + gap * (Math.abs(gap) > 50 ? 0.8 : 0.5)), 30, 90), ids = [];   // v343 : on vise 600 ; hors de 550-650, on corrige plus fort   // v342 : la classe comble mieux l'écart (plus de recrues hors classe)
    for (let k = 0; k < n; k++) { const g = newRookie(U.nextId++, used); g.rcl = S.season + 1; G[g.id] = g; ids.push(g.id); }
    S.rcl = { s: S.season + 1, ids };
  } else if (S.rcl) delete S.rcl;
  // aucun recentrage forcé : les ligues restent un pur classement, et le calibre du pool complet dérive
  // librement d'une saison à l'autre (retraites, recrues, progression/régression) — voir OVERALL_DIST plus haut.
  U.used = Array.from(used); U.L = newL;
  return { ranked, up, down, retired, rookies, events, saved: mvP.saved, car: mvP.car, rcg };
}

