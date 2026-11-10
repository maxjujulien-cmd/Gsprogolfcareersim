/* ============ RÉSUMÉ D'UN TERRAIN PIGÉ ============
   Partie chiffrée (toujours là) : fiche, difficulté comparée à toute ta liste, parcours, historique dans ta partie,
   comparaison avec les autres terrains de la pige, ce qui le distingue. Partie « Claude » (version en ligne seulement,
   sur demande, car elle utilise ton forfait Claude) : histoire, paysage, réputation, faits divers. Gardée dans la sauvegarde (S.cres). */
let DIFF_CACHE = null;
function teeDiff(b) { return crDeltaOf(b) + distDelta(b.dist) + (slopeEffFactor(b.slope) - 1) * 3; }
function diffPct(b) {
  if (!DIFF_CACHE || DIFF_CACHE.n !== BANK.length) DIFF_CACHE = { n: BANK.length, a: BANK.map(teeDiff).sort((x, y) => x - y), d: BANK.map(x => +x.dist || 0).sort((x, y) => x - y) };
  const v = teeDiff(b), A = DIFF_CACHE.a; let lo = 0, hi = A.length; while (lo < hi) { const m = (lo + hi) >> 1; if (A[m] < v) lo = m + 1; else hi = m; }
  return A.length ? lo / A.length : 0.5;
}
function distPct(d) { const A = (DIFF_CACHE || { d: [] }).d; if (!A.length) return 0.5; let lo = 0, hi = A.length; while (lo < hi) { const m = (lo + hi) >> 1; if (A[m] < d) lo = m + 1; else hi = m; } return lo / A.length; }
function diffNote(p) { return Math.max(1, Math.min(10, Math.round(1 + p * 9))); }
function courseHist(name) {
  const n = normName(name), out = []; if (!S) return out;
  S.hist.forEach(H => H.t.forEach((t, i) => {
    if (!t || normName(t.name) !== n) return;
    const lg = t.lg[t.pl], w = lg && lg.rows[0]; let me = null;
    for (let l = 0; l < 4; l++) { const r = t.lg[l] && t.lg[l].rows.find(x => x[0] === 0); if (r) me = { l, pos: r[1], tot: r[2] + (r[3] || 0) }; }
    out.push({ s: H.s, t: i, tee: t.tee, pl: t.pl, w: w ? w[0] : null, wt: w ? w[2] + (w[3] || 0) : null, me });
  }));
  return out;
}
/* v226 : la liste du résumé ; en Play Now, le terrain choisi (s'il n'est pas dans la pige) passe en premier */
function cresList() { if (!inPN()) return pigeState().list; const C = pnCfg(), L = (C.pige && C.pige.list) || [], co = C.course; if (co && !co.rand && !L.some(y => normName(y.name) === normName(co.name) && y.tee === co.tee)) return [{ name: co.name, tee: co.tee }].concat(L); return L; }
function cresStore() { if (S) return S.cres || (S.cres = {}); return PNX.cres || (PNX.cres = {}); }
function cresKey(x) { return normName(x.name) + '|' + normName(x.tee || ''); }
function vCourseResume() {
  const P = { list: cresList() }, k = VIEW.k, x = P.list[k], cA = inPN() ? 'pncres' : 'cres', bA = inPN() ? 'pnsetupv' : 'backview';
  if (!x) return '<div class="top"><div><h1>Résumé</h1></div></div><p class="mute">Ce terrain n’est plus dans la pige.</p><button class="btn sec" data-a="' + bA + '">Retour</button>';
  const bi = findBankCourse(x.name, x.tee), b = bi >= 0 ? BANK[bi] : null;
  let h = '<div class="top"><div><h1>' + esc(x.name) + '</h1><div class="ctx"><span>Résumé</span> · <span>' + (inPN() ? 'Play Now' : 'terrain pigé ' + (k + 1) + ' sur ' + P.list.length) + '</span> · <a style="color:inherit" href="https://www.youtube.com/results?search_query=' + encodeURIComponent('GSPro ' + x.name) + '" target="_blank" rel="noopener noreferrer">Aperçu YouTube \u2197</a></div></div></div>';
  if (!b) return h + '<p class="mute">Ce terrain a été retiré de ta liste.</p>';
  const par = parTotal(b.pars), p = diffPct(b), note = diffNote(p), eff = teeDiff(b);
  const n3 = b.pars.filter(v => v === 3).length, n5 = b.pars.filter(v => v === 5).length, n4 = 18 - n3 - n5;
  const hard = (b.index || defaultIndex()).indexOf(1), fr = b.pars.slice(0, 9).reduce((a, v) => a + v, 0);
  const tees = BANK.filter(t => normName(t.name) === normName(b.name)).sort((a, c) => (+c.dist || 0) - (+a.dist || 0));
  const hist = courseHist(b.name), dp = distPct(+b.dist || 0);
  // 1. fiche
  let L = '<div class="block"><h3 style="margin-top:0">La fiche</h3><div class="mgrid">' + tile(par, 'par') + tile(fmtDist(b.dist) + ' v', 'tee ' + esc(b.tee)) + tile(fmtCR(b.cr) + ' / ' + b.slope, 'CR / slope') + tile(note + '/10', 'difficulté') + '</div>' +
    '<div class="cresbar" title="Difficulté comparée à toute ta liste"><i style="left:' + Math.round(p * 100) + '%"></i></div>' +
    '<p class="small mute" style="margin:6px 0 0">Plus difficile que ' + Math.round(p * 100) + ' % des tees de ta liste. Pour le circuit, environ ' + (eff >= 0 ? '+' : '\u2212') + fmt1(Math.abs(eff)).replace('\u2212', '') + ' coup par ronde par rapport à un terrain neutre.</p></div>';
  // 2. parcours
  L += '<div class="block"><h3 style="margin-top:0">Le parcours</h3><p style="margin:0 0 6px">' + n3 + ' par 3 · ' + n4 + ' par 4 · ' + n5 + ' par 5 <span class="mute">· aller ' + fr + ', retour ' + (par - fr) + '</span></p>' +
    '<p class="small" style="margin:0 0 8px">Trou le plus difficile (index 1) : le <b>' + (hard + 1) + '</b>, un par ' + b.pars[hard] + '.</p>' +
    (tees.length > 1 ? '<table class="plain"><tr><th>Tees offerts</th><th class="r">Verges</th><th class="r">CR / slope</th></tr>' + tees.map(t => '<tr' + (t.tee === b.tee ? ' style="font-weight:700"' : '') + '><td>' + teeBadge(t.tee) + '</td><td class="r">' + fmtDist(t.dist) + '</td><td class="r">' + fmtCR(t.cr) + ' / ' + t.slope + '</td></tr>').join('') + '</table>' : '') + '</div>';
  // 3. historique dans la partie
  if (S) L += '<div class="block"><h3 style="margin-top:0">Dans ta partie</h3>' + (hist.length ? '<table class="plain"><tr><th>Saison</th><th>Gagnant</th><th class="r">Score</th><th class="r">Toi</th></tr>' + hist.slice(-8).reverse().map(e => '<tr><td>' + yr(e.s) + ' · T' + (e.t + 1) + '</td><td>' + (e.w != null ? '<a href="#" data-a="golfer" data-id="' + e.w + '">' + esc(nameOf(e.w)) + '</a>' : '\u2013') + '</td><td class="r">' + (e.wt != null ? fmt(e.wt) : '') + '</td><td class="r">' + (e.me ? (e.me.pos ? ord(e.me.pos) : 'Coupure') + ' <span class="mute small">L' + (e.me.l + 1) + '</span>' : '<span class="mute">\u2013</span>') + '</td></tr>').join('') + '</table><p class="small mute" style="margin:6px 0 0">Joué ' + hist.length + ' fois dans cette partie.</p>' : '<p class="small mute" style="margin:0">Jamais joué dans cette partie : ce serait une première.</p>') + '</div>';
  // 4. comparaison avec la pige
  const rows = P.list.map((y, j) => { const yi = findBankCourse(y.name, y.tee), yb = yi >= 0 ? BANK[yi] : null; return yb ? { j, y, b: yb, d: teeDiff(yb), n: diffNote(diffPct(yb)), played: courseHist(yb.name).length } : null; }).filter(Boolean);
  const rk = (arr, f, desc) => arr.slice().sort((a, c) => desc ? f(c) - f(a) : f(a) - f(c)).findIndex(r => r.j === k) + 1;
  let R = '<div class="block"><h3 style="margin-top:0">Face aux autres terrains de la pige</h3><div class="scroll"><table class="plain"><tr><th>Terrain</th><th class="r">Par</th><th class="r">Verges</th><th class="r">CR / slope</th><th class="r">Diff.</th><th class="r">Joué</th></tr>' +
    rows.map(r => '<tr' + (r.j === k ? ' class="cresme"' : '') + '><td>' + (r.j === k ? '<b>' + esc(r.y.name) + '</b>' : '<a href="#" data-a="' + cA + '" data-k="' + r.j + '">' + esc(r.y.name) + '</a>') + '</td><td class="r">' + parTotal(r.b.pars) + '</td><td class="r">' + fmtDist(r.b.dist) + '</td><td class="r">' + fmtCR(r.b.cr) + ' / ' + r.b.slope + '</td><td class="r">' + r.n + '/10</td><td class="r">' + (r.played ? r.played + '\u00d7' : '\u2013') + '</td></tr>').join('') + '</table></div>';
  if (rows.length > 1) { const N = rows.length, rd = rk(rows, r => r.d, true), rl = rk(rows, r => +r.b.dist || 0, true);
    R += '<p class="small" style="margin:8px 0 0"><span>' + (rd === 1 ? '<b>Le plus difficile de la pige.</b>' : rd === N ? '<b>Le plus facile de la pige.</b>' : ord(rd) + ' plus difficile sur ' + N + '.') + '</span> <span>' + (rl === 1 ? '<b>Le plus long.</b>' : rl === N ? '<b>Le plus court.</b>' : ord(rl) + ' plus long.') + '</span></p>'; }
  R += '</div>';
  // 5. ce qui le distingue
  const tr = [];
  if (p >= 0.95) tr.push('Parmi les 5 % de tees les plus difficiles de toute ta liste.'); else if (p <= 0.05) tr.push('Parmi les 5 % de tees les plus faciles de toute ta liste.');
  if (dp >= 0.95) tr.push('Un des plus longs de ta liste (' + fmtDist(b.dist) + ' verges).'); else if (dp <= 0.05) tr.push('Un des plus courts de ta liste.');
  if ((b.slope || 0) >= 145) tr.push('Slope de ' + b.slope + ' : il punit sévèrement les erreurs.'); else if ((b.slope || 200) <= 112) tr.push('Slope de ' + b.slope + ' : un terrain clément pour les erreurs.');
  if (par <= 70) tr.push('Un par ' + par + ', plus rare qu’un par 72.'); else if (par >= 73) tr.push('Un par ' + par + ', rare.');
  if (n5 >= 5) tr.push(n5 + ' par 5 : des occasions d’aigle et de birdie.'); if (n3 >= 5) tr.push(n3 + ' par 3 : la précision des fers sera testée.');
  if (b.pars[17] === 5) tr.push('Il finit sur un par 5 : une fin de ronde qui peut tout changer.'); else if (b.pars[17] === 3) tr.push('Il finit sur un par 3, une finale rare.');
  if (!S) { } else if (!hist.length) tr.push('Jamais joué dans ta partie.'); else if (hist.length >= 3) tr.push('Déjà joué ' + hist.length + ' fois : un habitué du circuit.');
  R += '<div class="block"><h3 style="margin-top:0">Ce qui le distingue</h3>' + (tr.length ? '<ul class="cresul">' + tr.map(t => '<li>' + t + '</li>').join('') + '</ul>' : '<p class="small mute" style="margin:0">Rien d’extrême : un terrain équilibré.</p>') + '</div>';
  // 6. Claude
  R += cresClaudeHTML(x, b, rows);
  return h + cols(L, R) + '<button class="btn sec" data-a="' + bA + '" style="margin-top:14px">' + (inPN() ? 'Retour au tournoi' : 'Retour à la pige') + '</button>';
}
let CRES_BUSY = null, CRES_OK = null;
function cresClaudeHTML(x, b, rows) {
  const key = cresKey(x), c = cresStore()[key];
  let h = '<div class="block cresai"><h3 style="margin-top:0">Ce qu’en dit Claude</h3>';
  if (c) {
    const d = c.d || {}, sec = (t, v) => v ? '<h4>' + t + '</h4><p>' + esc(v) + '</p>' : '';
    if (d.connu === false) h += '<p class="small" style="margin:0 0 6px"><b>Terrain peu connu.</b> Claude n’a pas d’information fiable sur ce terrain (peut-être un terrain fictif ou très local).</p>';
    const id = [d.lieu, d.architecte, d.ouverture, d.style].filter(Boolean);
    if (id.length) h += '<p class="small" style="margin:0 0 6px"><b>' + id.map(esc).join(' · ') + '</b></p>';
    h += sec('Histoire', d.histoire) + sec('Beauté et paysage', d.beaute) + sec('Réputation de difficulté', d.difficulte) + (Array.isArray(d.faits) && d.faits.length ? '<h4>Faits divers</h4><ul class="cresul">' + d.faits.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>' : '') + sec('Ce qui le rend unique', d.unique) + sec('Pour t’aider à choisir', d.conseil);
    h += '<p class="small mute" style="margin:8px 0 0">Écrit par Claude le ' + esc(c.at || '') + ' à partir de ses connaissances (sans recherche web) : peut contenir des erreurs pour les terrains moins connus.' + (window.claude ? ' <a href="#" data-a="cresask" data-k="' + VIEW.k + '" data-r="1">Redemander</a>' : '') + '</p>';
  } else if (CRES_BUSY === key) h += '<p class="small" style="margin:0">Claude réfléchit… (entre 10 et 60 secondes)</p>';
  else if (window.claude && CRES_OK !== false) h += '<p class="small mute" style="margin:0 0 8px">Histoire du terrain, beauté du paysage, réputation, faits divers et un conseil par rapport aux autres terrains de la pige. Utilise un peu de ton forfait Claude.</p><button class="btn sm" data-a="cresask" data-k="' + VIEW.k + '">Demander à Claude</button>';
  else h += '<p class="small mute" style="margin:0">' + (CRES_OK === false ? 'Claude n’est pas disponible ici pour l’instant.' : 'Disponible dans la version en ligne du jeu (sur claude.ai) : Claude y raconte l’histoire du terrain, son paysage et ses faits divers.') + '</p>';
  return h + '</div>';
}
async function cresAsk(k, refresh) {
  const P = { list: cresList() }, x = P.list[k]; if (!x || CRES_BUSY) return;
  const bi = findBankCourse(x.name, x.tee), b = bi >= 0 ? BANK[bi] : null; if (!b) return;
  let sample = null; try { sample = window.claude ? await window.claude.use('sample') : null; } catch (e) { sample = null; }
  if (!sample) { CRES_OK = false; render(); toast('Claude n’est pas disponible ici'); return; }
  const key = cresKey(x); CRES_BUSY = key; render();
  const others = P.list.filter((y, j) => j !== k).map(y => { const yi = findBankCourse(y.name, y.tee), yb = yi >= 0 ? BANK[yi] : null; return yb ? '- ' + y.name + ' (par ' + parTotal(yb.pars) + ', ' + yb.dist + ' verges, CR ' + yb.cr + ', slope ' + yb.slope + ')' : null; }).filter(Boolean).join('\n');
  const prompt = 'Tu aides un joueur de golf sur simulateur (GSPro) à choisir un terrain parmi une pige. Les terrains de GSPro sont surtout des recréations de vrais terrains, parfois des terrains fictifs ou de petits terrains locaux.\n\n' +
    'Terrain à résumer : ' + b.name + '\nTee : ' + b.tee + ' · par ' + parTotal(b.pars) + ' · ' + b.dist + ' verges · course rating ' + b.cr + ' · slope ' + b.slope + ' · ' + b.pars.filter(v => v === 3).length + ' par 3, ' + b.pars.filter(v => v === 5).length + ' par 5\n\n' +
    'Autres terrains de la même pige :\n' + (others || '(aucun)') + '\n\n' +
    'Règles : écris en français québécois neutre, phrases courtes. N’invente RIEN. Si tu ne reconnais pas ce terrain avec certitude comme un vrai terrain que tu connais, mets "connu": false et laisse vides ("") les champs factuels que tu ne connais pas ; tu peux quand même remplir "conseil" à partir des chiffres. Les noms de terrains peuvent être tronqués à 40 caractères.\n\n' +
    'Réponds seulement avec ce JSON : {"connu": true|false, "lieu": "ville, région, pays", "architecte": "", "ouverture": "année", "style": "links, parkland, désert, montagne…", "histoire": "2-3 phrases", "beaute": "1-2 phrases sur le paysage", "difficulte": "1-2 phrases sur sa réputation", "faits": ["2 à 4 faits divers courts"], "unique": "ce qui le rend unique, 1 phrase, ou vide", "conseil": "2 phrases : comment il se compare aux autres terrains de la pige et pour quel genre de tournoi le choisir"}';
  try {
    const d = await sample.json(prompt, { cache: refresh ? { gcTime: 86400000, refresh: true } : { gcTime: 86400000 } });
    cresStore()[key] = { at: new Date().toLocaleDateString('fr-CA'), d: d && typeof d === 'object' ? d : {} };
    persist(); if (!S) pnSave();
  } catch (e) {
    const c = e && e.code;
    if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled' || c === 'capability_removed') CRES_OK = false;
    toast(c === 'rate_limited' ? 'Trop de demandes pour l’instant, réessaie plus tard' : c === 'invalid_json' ? 'Réponse illisible, réessaie' : c === 'cancelled' ? 'Annulé' : 'Claude n’a pas pu répondre');
  }
  CRES_BUSY = null; if (VIEW.name === 'cres') render();
}

function autoDrawCourses() { if (S && S.courses) S.courses.forEach(c => { if (c) { delete c.lk; delete c.fpl; } }); /* v359 : le cadenas ne vaut que pour une saison */ futApply(); if (S && !S.presim && BANK.length && crf().auto) drawSeasonCourses(); try { if (S && !S.presim && crf().autoKm) voySortApply(true); } catch (e) { } if (S && S.courses) S.courses.forEach(c => { if (c) delete c.fpl; }); }
/* ---- v295 : terrains des saisons futures ----
   S.fut[saison] = plan de 11 cases (10 tournois + Finale). Case sans nom = « à tirer » : le tirage habituel (ou le terrain
   de la saison d'avant si le tirage automatique est coupé). Au début de la saison, les cases choisies remplacent les terrains
   et le tirage automatique ne les touche pas (c.fpl, le temps du tirage).
   Affichage et modifications : on « prête » le plan à S.courses (futOn), et on le rend à la fin de l'événement ou au render (futOff). */
let FUT = null;
const FUT_N = 3;   // nombre de saisons futures qu'on peut planifier
function futCopy(c) { const n = JSON.parse(JSON.stringify(c)); delete n.fpl; return n; }
function futPlan(k) {
  if (!S.fut) S.fut = {};
  if (!S.fut[k]) { ensureFinSlot(); const base = k - 1 > S.season && S.fut[k - 1] ? S.fut[k - 1] : S.courses;
    S.fut[k] = base.map(c => { const n = futCopy(c); n.name = ''; delete n.lk; return n; }); }   // v359 : les cadenas ne passent pas d'une saison à l'autre
  return S.fut[k];
}
function futCount(k) { const P = S.fut && S.fut[k]; return P ? P.filter((c, i) => c && c.name && (i < N_TOURN || finOn())).length : 0; }
function futOn() {
  if (FUT || !S || !VIEW || VIEW.name !== 'courses' || (VIEW.csub || 'season') !== 'season' || !(VIEW.cyr > 0)) return false;
  const k = S.season + VIEW.cyr; FUT = { real: S.courses, k }; S.courses = futPlan(k); queueMicrotask(futOff); return true;
}
function futOff() { if (!FUT) return; S.fut[FUT.k] = S.courses; S.courses = FUT.real; FUT = null; }
function futApply() {
  if (!S || S.presim || !S.fut) return;
  const P = S.fut[S.season]; Object.keys(S.fut).forEach(k => { if (+k <= S.season) delete S.fut[k]; });
  if (!P) return; ensureFinSlot();
  P.forEach((c, i) => { if (!c || !c.name || !S.courses[i]) return; const n = futCopy(c); n.fpl = 1; S.courses[i] = n; });
}
function futChips() {
  const it = [[0, 'Cette saison']]; for (let k = 1; k <= FUT_N; k++) { const n = futCount(S.season + k); it.push([k, yr(S.season + k) + (n ? ' · ' + n : '')]); }
  return chipRow(it, VIEW.cyr || 0, 'cyr');
}
function swapCourses(i, j) {
  if (i === j || courseFrozen(i) || courseFrozen(j)) return false;
  const t = S.courses[i]; S.courses[i] = S.courses[j]; S.courses[j] = t;
  persist(); return true;
}
function importNames(text, league) {
  const seen = new Set(), names = [];
  text.split(/\r?\n/).map(x => x.trim()).filter(Boolean).forEach(n => { let m = n, k = 2; while (seen.has(m.toLowerCase())) m = n + ' ' + (k++); seen.add(m.toLowerCase()); names.push(m); });
  const ids = S.L[league].filter(i => i !== 0).sort((a, b) => S.G[b].o - S.G[a].o);
  const n = Math.min(names.length, ids.length);
  const used = new Set(S.used);
  for (let i = 0; i < n; i++) { S.G[ids[i]].n = names[i]; used.add(names[i]); }
  S.used = Array.from(used); persist();
  return { n, extra: names.length - n };
}
function regenRegularity() { Object.values(S.G).forEach(g => { newReg(g); }); persist(); }

/* Scène inspirée de la photo de référence : montagnes brumeuses, rayons de lumière, palmiers, lac, green éclairé. */
function sceneSVG() {
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let trees = '';
  for (let i = 0; i < 64; i++) {
    const x = -20 + i * 16.5 + rnd() * 9;
    const left = x < 200 ? (200 - x) / 200 * 26 : 0;
    const cy = 172 - left + Math.sin(i * 0.9) * 4 + rnd() * 5;
    const rx = 17 + rnd() * 12, ry = 10 + rnd() * 9 + left * 0.25;
    trees += '<ellipse cx="' + x.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" style="fill:var(--s-tree' + (i % 3 === 0 ? '2' : '') + ')"/>';
  }
  let flutes = '';
  const fl = (x, y, dx, len) => { flutes += '<path d="M' + x.toFixed(1) + ',' + y.toFixed(1) + ' l' + dx.toFixed(1) + ',' + len.toFixed(1) + '"/>'; };
  for (let i = 0; i < 28; i++) fl(290 + i * 17 + rnd() * 8, 106 + rnd() * 6, rnd() * 5 - 2.5, 26 + rnd() * 30);
  for (let i = 0; i < 9; i++) fl(72 + i * 11 + rnd() * 5, 84 + rnd() * 8, rnd() * 8 - 2, 30 + rnd() * 26);
  for (let i = 0; i < 9; i++) fl(826 + i * 18 + rnd() * 6, 76 + rnd() * 8, rnd() * 8 - 4, 30 + rnd() * 26);
  let flowers = '<g>';
  for (let i = 0; i < 16; i++) { const x = 800 + rnd() * 190, y = 152 + rnd() * 30; flowers += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (1.6 + rnd() * 1.8).toFixed(1) + '" style="fill:var(--s-flower)" opacity=".85"/>'; }
  flowers += '</g>';
  let stripes = '';
  for (let y = 206; y < 262; y += 9) stripes += '<path d="M0,' + y + ' C250,' + (y - 10) + ' 640,' + (y - 6) + ' 1000,' + (y - 3) + '"/>';
  return '<svg viewBox="0 0 1000 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    '<linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s-sky1)"/><stop offset=".75" style="stop-color:var(--s-sky2)"/></linearGradient>' +
    '<linearGradient id="sc-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s-ray)" stop-opacity=".9"/><stop offset="1" style="stop-color:var(--s-ray)" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="sc-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s-mist)" stop-opacity="0"/><stop offset=".55" style="stop-color:var(--s-mist)" stop-opacity=".6"/><stop offset="1" style="stop-color:var(--s-mist)" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="sc-fw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s-fw1)"/><stop offset=".4" style="stop-color:var(--s-fw2)"/><stop offset="1" style="stop-color:var(--s-fw3)"/></linearGradient>' +
    '<radialGradient id="sc-lit" cx=".68" cy=".05" r=".5"><stop offset="0" style="stop-color:var(--s-fw1)" stop-opacity=".95"/><stop offset="1" style="stop-color:var(--s-fw1)" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="sc-scrim" x1="0" y1="0" x2="0" y2="1"><stop offset=".38" stop-color="#081808" stop-opacity="0"/><stop offset=".72" stop-color="#081808" stop-opacity=".34"/><stop offset="1" stop-color="#081808" stop-opacity=".64"/></linearGradient>' +
    '<filter id="sc-blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="13"/></filter>' +
    '<g id="sc-palm" fill="none" stroke-linecap="round" style="stroke:var(--s-tree)"><path d="M0,0 C3,-16 7,-32 4,-50" stroke-width="3.6"/>' +
    '<path d="M4,-50 C-12,-58 -28,-52 -38,-37" stroke-width="3.8"/><path d="M4,-50 C20,-59 34,-52 43,-37" stroke-width="3.8"/><path d="M4,-50 C-6,-70 -20,-74 -31,-68" stroke-width="3.6"/><path d="M4,-50 C13,-71 29,-73 38,-66" stroke-width="3.6"/><path d="M4,-50 C4,-68 1,-78 -1,-84" stroke-width="3.2"/></g>' +
    '</defs>' +
    '<rect width="1000" height="260" fill="url(#sc-sky)"/>' +
    '<g filter="url(#sc-blur)"><ellipse cx="330" cy="26" rx="120" ry="18" style="fill:var(--s-blue)" opacity=".7"/></g>' +
    '<g filter="url(#sc-blur)" style="fill:var(--s-cloud)"><ellipse cx="790" cy="20" rx="310" ry="40" opacity=".85"/><ellipse cx="200" cy="10" rx="220" ry="32" opacity=".75"/><ellipse cx="520" cy="58" rx="150" ry="15" opacity=".5"/><ellipse cx="940" cy="80" rx="110" ry="12" opacity=".4"/></g>' +
    '<g fill="url(#sc-ray)" style="opacity:var(--s-rayo)"><polygon points="640,-30 380,150 456,150"/><polygon points="640,-30 486,150 548,150"/><polygon points="640,-30 574,150 620,150"/><polygon points="640,-30 640,150 706,150"/><polygon points="640,-30 730,150 816,150"/><polygon points="640,-30 850,150 930,150"/></g>' +
    '<path style="fill:var(--s-m1)" d="M0,110 C30,70 60,50 100,36 C120,30 140,46 160,70 C185,100 230,96 270,108 C330,98 380,84 450,90 C540,82 620,86 700,94 C760,88 800,70 850,56 C880,40 905,44 930,52 C955,40 980,40 1000,46 L1000,170 L0,170 Z"/>' +
    '<g stroke-width="2.2" stroke-linecap="round" style="stroke:var(--s-m2)" opacity=".4">' + flutes + '</g>' +
    '<rect x="0" y="96" width="1000" height="64" fill="url(#sc-mist)"/>' +
    '<path style="fill:var(--s-m2)" d="M0,128 C60,108 100,112 150,100 C210,116 260,124 320,112 C390,124 450,116 520,126 C600,112 660,118 720,112 C790,122 850,108 920,100 C955,108 980,104 1000,108 L1000,176 L0,176 Z"/>' +
    '<rect x="0" y="118" width="1000" height="50" fill="url(#sc-mist)" opacity=".85"/>' +
    '<path style="fill:var(--s-m3)" d="M0,150 C80,134 160,148 250,138 C340,148 430,140 520,148 C620,138 720,148 820,136 C900,144 950,138 1000,140 L1000,192 L0,192 Z"/>' +
    '<rect x="0" y="176" width="1000" height="90" style="fill:var(--s-tree)"/>' +
    trees +
    '<path style="fill:var(--s-hill)" d="M690,196 C740,168 820,156 900,150 C950,146 980,148 1000,144 L1000,200 L690,200 Z"/><path fill="none" stroke-width="3" style="stroke:var(--s-fw2)" opacity=".7" d="M700,192 C750,166 830,154 900,150 C950,147 980,149 1000,145"/>' +
    flowers +
    '<path style="fill:var(--s-fw1)" opacity=".95" d="M330,183 C400,177 520,177 606,182 L620,189 L322,192 Z"/><ellipse cx="450" cy="181" rx="30" ry="3.2" style="fill:var(--s-sand)"/>' +
    '<path style="fill:var(--s-lake)" d="M228,190 C300,184 380,186 460,186 L560,190 L520,197 L262,198 Z"/><path d="M290,192 L500,192" stroke-width="1.6" style="stroke:var(--s-cloud)" opacity=".5"/>' +
    '<use href="#sc-palm" transform="translate(52,168) scale(1.25)"/><use href="#sc-palm" transform="translate(150,174) scale(.88)"/><use href="#sc-palm" transform="translate(300,172) scale(.5)"/><use href="#sc-palm" transform="translate(760,164) scale(.85)"/><use href="#sc-palm" transform="translate(918,152) scale(1.05)"/>' +
    '<path fill="url(#sc-fw)" d="M0,214 C170,202 360,196 560,198 C760,200 900,208 1000,200 L1000,260 L0,260 Z"/>' +
    '<path fill="url(#sc-lit)" d="M0,214 C170,202 360,196 560,198 C760,200 900,208 1000,200 L1000,260 L0,260 Z"/>' +
    '<g fill="none" stroke-width="7" style="stroke:var(--s-stripe)" opacity=".13">' + stripes + '</g>' +
    '<ellipse cx="700" cy="226" rx="6.5" ry="2" fill="#0d1a08" opacity=".55"/><path d="M700,226 L660,235" stroke="#0d1a08" stroke-width="2.6" opacity=".28" stroke-linecap="round"/>' +
    '<path d="M700,226 L700,170" stroke="#EEF1E8" stroke-width="2.2" stroke-linecap="round"/><polygon points="700,170 726,176 700,183" fill="#FBFCF8"/><circle cx="708" cy="176" r="2.2" fill="#26394c"/>' +
    '<rect width="1000" height="260" fill="url(#sc-scrim)"/>' +
    '<path style="fill:var(--bg)" d="M0,260 L0,250 C160,242 340,258 520,249 S860,240 1000,251 L1000,260 Z"/>' +
    '</svg>';
}

let _SCENE = null;
const HERO_IMG = '{{asset:hero-img.webp}}';
function scene() { return _SCENE || (_SCENE = '<div class="scene ph"><img alt="" src="' + HERO_IMG + '" decoding="async"></div>'); }

