/* ============ NOMS ET RÉGULARITÉ ============ */
/* ---- Liste de terrains : recherche par nom (insensible \u00e0 la casse et aux accents) ---- */
const NN_CACHE = new Map();   // la liste peut compter des milliers de terrains : on garde les noms d\u00e9j\u00e0 normalis\u00e9s
const normName = s => { s = s || ''; let v = NN_CACHE.get(s); if (v === undefined) { v = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(); if (NN_CACHE.size > 60000) NN_CACHE.clear(); NN_CACHE.set(s, v); } return v; };
function findBankCourse(name, tee) {
  const n = normName(name); if (!n) return -1;
  const all = BANK.map((b, i) => normName(b.name) === n ? i : -1).filter(i => i >= 0);
  if (!all.length) return -1;
  const t = normName(tee), same = all.find(i => normName(BANK[i].tee) === t);
  return same != null ? same : all[0];
}
function bankTeesOf(name) { const n = normName(name); return BANK.filter(b => normName(b.name) === n).map(b => b.tee); }
/* Recherche dans la liste : un r\u00e9sultat par nom de terrain ; les noms qui commencent par la recherche d'abord, puis ceux qui la contiennent.
   Tous les mots tap\u00e9s doivent se retrouver dans le nom (casse, accents et tirets ignor\u00e9s). */
const AC_CACHE = new Map();
const acNorm = s => { s = s || ''; let v = AC_CACHE.get(s); if (v === undefined) { v = normName(s).replace(/[^a-z0-9]+/g, ' ').trim(); if (AC_CACHE.size > 60000) AC_CACHE.clear(); AC_CACHE.set(s, v); } return v; };
function bankSearch(q, max) {
  const n = acNorm(q); if (!n) return [];
  const words = n.split(' '), seen = new Set(), A = [], B = [];
  for (let i = 0; i < BANK.length; i++) {
    const b = BANK[i], k = acNorm(b.name); if (seen.has(k)) continue;
    if (!words.every(w => k.includes(w))) continue;
    seen.add(k); (k.startsWith(n) ? A : B).push(i);
  }
  const co = new Intl.Collator('fr'), by = (x, y) => co.compare(BANK[x].name, BANK[y].name);
  const r = A.sort(by).concat(B.sort(by)); return max ? r.slice(0, max) : r;
}
function acRender(i, q) {
  const box = document.getElementById('ac' + i); if (!box) return;
  const r = q && acNorm(q).length >= 2 ? bankSearch(q, 8) : [];
  box.innerHTML = r.map((bi, k) => { const nm = S.courseBank[bi].name, tz = bankTeesOf(nm); return '<button type="button" class="acit' + (k ? '' : ' on') + '" data-acpick="' + bi + '" data-i="' + i + '"><span>' + esc(nm) + '</span><small>' + tz.length + ' tee' + (tz.length > 1 ? 's' : '') + '</small></button>'; }).join('');
  box.classList.toggle('open', r.length > 0);
}
let AC_QUIET = false;
function acPick(i, bi) {
  const c = S.courses[i], name = S.courseBank[bi].name, tz = bankTeesOf(name);
  const inp = document.getElementById('cn' + i); if (inp) { inp.value = name; const box = document.getElementById('ac' + i); if (box) { box.classList.remove('open'); box.innerHTML = ''; } AC_QUIET = true; inp.blur(); AC_QUIET = false; }   // le \u00ab change \u00bb du champ part avec le nom complet
  const tee = tz.includes(c.tee) ? c.tee : tz.includes('White') ? 'White' : tz.sort((a, b) => teeRank(a) - teeRank(b))[0];
  applyBankToCourse(c, S.courseBank[findBankCourse(name, tee)]); c.name = name;
  persist(); VIEW.open = i; renderKeep(i);
  toast(name + ' charg\u00e9 \u00b7 tees ' + c.tee);
  const t = document.getElementById('ctee' + i); if (t && tz.length > 1) t.focus({ preventScroll: true });
}
function applyBankToCourse(course, bank) {
  course.tee = bank.tee; course.pars = bank.pars.slice(); course.index = bank.index.slice();
  course.dist = bank.dist; course.cr = bank.cr; course.slope = bank.slope;
}
/* ---- G\u00e9n\u00e9rer des statistiques (et, pour les terrains sans nom personnalis\u00e9, un nom fictif) al\u00e9atoires
   pour les terrains de la saison. Les tournois d\u00e9j\u00e0 en cours (verrouill\u00e9s) ne sont pas touch\u00e9s. */
function randomizeSeasonCourses() {
  ensureFinSlot();
  const used = new Set(S.courses.map(c => c.name));
  const pool = COURSE_NAMES.slice().sort(() => Math.random() - 0.5).filter(n => !used.has(n));
  let ni = 0, changed = 0;
  S.courses.forEach((c, i) => {
    if (courseFrozen(i)) return;   // tournoi joué, en cours ou barré
    const dref = CFG.distRef || 6070; c.dist = Math.round(gaussRange(dref, dref - 400, dref + 400));   // centré sur la distance neutre : l'effet de la distance s'annule en moyenne
    c.pars = randomPars();
    // le course rating suit le par (repère : par \u2212 1 = terrain neutre) ; \u00b11,2 coup au plus quand la variabilit\u00e9 vaut 1
    const V = CFG.terrainVar == null ? 1 : CFG.terrainVar;
    c.cr = Math.round((crNeutral(parTotal(c.pars)) + gaussRange(0, -1.2 * V, 1.2 * V)) * 10) / 10;
    c.slope = Math.round(gaussRange(slopeNeutral(), slopeNeutral() - 10, slopeNeutral() + 13));
    c.index = shuffleIndex();
    c.pin = randomPin();
    c.pin2 = randomPin();
    c.wind = randomWind();
    c.wind2 = randomWind();
    c.purse = randomPurse();
    if ((c.name === 'Terrain ' + (i + 1) || !c.name) && ni < pool.length) { c.name = pool[ni++]; used.add(c.name); }
    changed++;
  });
  persist();
  return changed;
}
/* ---- Terrains de la saison : cadenas, ordre et tirage au hasard dans la liste de terrains ----
   c.lk = terrain barré : ni le terrain, ni sa place, ni le tirage ne le touchent (il reste barré d'une saison à l'autre).
   S.crf = filtres du tirage ; auto = nouveau tirage des terrains non barrés à chaque nouvelle saison. */
const CRF_DEF = { dmin: 5800, dmax: 6400, crmin: 66, crmax: 74, smin: 110, smax: 140, pmin: 70, pmax: 72, auto: true, noRep: true, tees: null, spl: null, autoKm: true };   // v375 : trajet trié automatiquement à chaque nouvelle saison (par défaut)   // v276 : spl = listes de terrains imposées { m0..m3 : Majeurs, fin : Finale }   // tees : null ou [] = tous les tees
function crfSaved() { try { return JSON.parse(localStorage.getItem('golf-crf') || 'null'); } catch (e) { return null; } }   // derniers filtres utilisés : repris par une nouvelle carrière
function crfRemember() { try { localStorage.setItem('golf-crf', JSON.stringify(crf())); } catch (e) { } if (inPN()) pnSave(); }
const inPN = () => !!(VIEW && /^pn[A-Z]/.test(VIEW.name || ''));
function crf() { if (inPN() && PNX.cfg) { const C = PNX.cfg; if (!C.crf) C.crf = Object.assign({}, crfSaved() || {}); Object.keys(CRF_DEF).forEach(k => { if (C.crf[k] == null) C.crf[k] = CRF_DEF[k]; }); return C.crf; }
  if (!S.crf) S.crf = Object.assign({}, crfSaved() || {}); Object.keys(CRF_DEF).forEach(k => { if (S.crf[k] == null) S.crf[k] = CRF_DEF[k]; }); return S.crf; }
function courseFixed(i) { if (FUT) return false; return i < S.t || !!(S.cur && S.cur.t === i) || (i >= N_TOURN && !!(seasonHist() && seasonHist().fin)); }   // tournoi déjà joué ou en cours
function courseFrozen(i) { return courseFixed(i) || !!(S.courses[i] && (S.courses[i].lk || S.courses[i].fpl)); }
function crfPool() {
  const f = crf();
  const tees = Array.isArray(f.tees) && f.tees.length ? new Set(f.tees) : null;
  return BANK.filter(b => { const p = parTotal(b.pars); return (!tees || tees.has(b.tee)) && b.dist >= f.dmin && b.dist <= f.dmax && b.cr >= f.crmin && b.cr <= f.crmax && b.slope >= f.smin && b.slope <= f.smax && p >= f.pmin && p <= f.pmax; });
}
function crfTeesHTML(f) {   // filtre par tee : « Tous les tees » ou une sélection (plusieurs possibles)
  const cnt = {}; BANK.forEach(b => { cnt[b.tee] = (cnt[b.tee] || 0) + 1; });
  const list = Object.keys(cnt).sort((a, b) => teeRank(a) - teeRank(b) || a.localeCompare(b));
  const sel = Array.isArray(f.tees) && f.tees.length ? new Set(f.tees) : null;
  return '<div class="crftees"><span class="crftl">Tees</span><button class="crft all' + (!sel ? ' on' : '') + '" data-a="crftee" data-v="*" aria-pressed="' + !sel + '">Tous les tees</button>' +
    list.map(t => { const c = TEE_COLORS[t] || ['var(--bg)', 'var(--ink)'], on = !!(sel && sel.has(t)); return '<button class="crft' + (on ? ' on' : '') + '" data-a="crftee" data-v="' + esc(t) + '" aria-pressed="' + on + '"><i style="background:' + c[0] + '"></i>' + esc(t) + ' <small>' + cnt[t] + '</small></button>'; }).join('') + '</div>';
}
function crfCountText() {
  const pool = crfPool(), n = new Set(pool.map(b => normName(b.name))).size;
  return pool.length + ' tee' + (pool.length > 1 ? 's' : '') + ' de ta liste correspondent (' + n + ' terrain' + (n > 1 ? 's' : '') + ')';
}
/* v219 : parmi les tees d'un terrain qui passent les filtres, on prend celui qui se rapproche le plus du terrain neutre
   (écart estimé en coups pour un golfeur moyen : course rating ramené à un par 72, distance, slope). À égalité : au hasard. */
function teeGap(b) {
  const par = parTotal(b.pars), cr = b.cr != null ? b.cr - par + 72 : CFG.crRef, sl = b.slope || slopeNeutral(), d = +b.dist || CFG.distRef;
  return Math.abs(cr - (CFG.crRef != null ? CFG.crRef : 70.3)) + Math.abs(distDelta(d)) + Math.abs(sl - slopeNeutral()) / 15;
}
function neutralTee(tees) {
  if (tees.length < 2) return tees[0];
  const g = tees.map(teeGap), m = Math.min.apply(null, g), best = tees.filter((t, i) => g[i] - m < 0.05);
  return best[Math.floor(Math.random() * best.length)];
}
function splList(key) { const f = crf(); return (f.spl && Array.isArray(f.spl[key])) ? f.spl[key] : []; }
function splSlots() { const out = []; if (CFG.majors && !S.duo) MAJ_T.forEach((t, k) => out.push([t, 'm' + k])); if (finOn()) out.push([N_TOURN, 'fin']); return out; }
let BANK_BY = null;
function splItems(k) { if (!BANK_BY || BANK_BY.n !== BANK.length) { BANK_BY = { n: BANK.length, m: new Map() }; BANK.forEach(b => { const x = normName(b.name); if (!BANK_BY.m.has(x)) BANK_BY.m.set(x, []); BANK_BY.m.get(x).push(b); }); } return BANK_BY.m.get(k) || []; }
function splTees(k) { const all = splItems(k), f = crf(), tees = Array.isArray(f.tees) && f.tees.length ? new Set(f.tees) : null, t = tees ? all.filter(b => tees.has(b.tee)) : all; return t.length ? t : all; }
/* v281 : tee choisi pour un terrain d'une liste spéciale (f.splTee[key][normName] = tee ; absent = auto) */
function splTeeOf(key, n) { const f = crf(), m = f.splTee && f.splTee[key]; return m ? m[normName(n)] || '' : ''; }
function splTeeSel(key, n) {
  const its = splItems(normName(n)).slice().sort((a, b) => (+b.dist || 0) - (+a.dist || 0)), cur = splTeeOf(key, n);
  if (!its.length) return '';
  return '<select class="spltee" data-c="spltee" data-k="' + key + '" data-n="' + esc(n) + '" aria-label="Tee pour ' + esc(n) + '"><option value="">Tee auto</option>' +
    its.map(b => '<option value="' + esc(b.tee) + '"' + (b.tee === cur ? ' selected' : '') + '>' + esc(b.tee) + ' · ' + (+b.dist).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' v</option>').join('') + '</select>';
}
function splHTML() {
  const sl = splSlots(); if (!sl.length || !BANK.length) return '';
  let h = '<div class="block crfb splb"><h3>Terrains des Majeurs et de la Finale</h3><p class="small mute" style="margin:0 0 8px">Pour chacun, une liste de terrains où piger. Vide : on pige parmi les terrains qui passent les filtres. Choisis le tee de chaque terrain, ou « Tee auto » : le tee le plus proche du terrain moyen (selon tes tees, s’il y en a).</p>' +
    '';
  sl.forEach(([slot, key]) => { const L = splList(key);
    h += '<div class="splr"><div class="splh"><b>' + esc(slot >= N_TOURN ? 'Finale (top ' + FIN.n + ')' : majorName(slot)) + '</b><span class="small mute">' + (slot >= N_TOURN ? 'après le tournoi 10' : 'tournoi ' + (slot + 1)) + ' · ' + (L.length ? L.length + ' terrain' + (L.length > 1 ? 's' : '') : 'filtres') + '</span></div>' +
      (L.length ? '<div class="splc">' + L.map((n, i) => '<span class="splt"><span class="spln">' + esc(n) + '</span>' + splTeeSel(key, n) + '<button type="button" data-a="spldel" data-k="' + key + '" data-i="' + i + '" aria-label="Retirer ' + esc(n) + '">✕</button></span>').join('') + '</div>' : '') +
      '<div class="spla"><div class="acwrap"><input type="text" id="spl-' + key + '" data-splac="' + key + '" placeholder="Ajouter un terrain…" aria-label="Ajouter un terrain" autocomplete="off"><div class="acbox" id="splac-' + key + '" role="listbox"></div></div><button class="btn sec sm" data-a="spladd" data-k="' + key + '">Ajouter</button></div></div>'; });
  return h + '</div>';
}
function splAcRender(key, q) {
  const box = document.getElementById('splac-' + key); if (!box) return;
  const r = q && acNorm(q).length >= 2 ? bankSearch(q, 8) : [];
  box.innerHTML = r.map((bi, k) => { const nm = BANK[bi].name, tz = bankTeesOf(nm); return '<button type="button" class="acit' + (k ? '' : ' on') + '" data-splpick="' + bi + '" data-k="' + key + '"><span>' + esc(nm) + '</span><small>' + tz.length + ' tee' + (tz.length > 1 ? 's' : '') + '</small></button>'; }).join('');
  box.classList.toggle('open', r.length > 0);
}
function splAdd(key, name) {
  const hit = BANK.find(b => normName(b.name) === normName(name)); if (!hit) { toast('Terrain introuvable dans ta liste'); return false; }
  const f = crf(); f.spl = f.spl || {}; f.spl[key] = (f.spl[key] || []).filter(n => normName(n) !== normName(hit.name)).concat([hit.name]); persist(); crfRemember(); render();
  setTimeout(() => { const el = document.getElementById('spl-' + key); if (el) el.focus(); }, 0); return true;
}
function drawSeasonCourses() {
  ensureFinSlot();
  const free = S.courses.map((c, i) => i).filter(i => !courseFrozen(i));
  if (!free.length) return { n: 0, short: 0 };
  const f = crf(), byName = new Map();
  crfPool().forEach(b => { const k = normName(b.name); if (!byName.has(k)) byName.set(k, []); byName.get(k).push(b); });
  const keep = new Set(S.courses.filter((c, i) => courseFrozen(i)).map(c => normName(c.name)));   // un terrain différent par tournoi
  /* v276 : Majeurs et Finale piochent dans leur propre liste si elle n'est pas vide (sans les filtres) */
  let nSpl = 0;
  splSlots().forEach(([slot, key]) => {
    const i = free.indexOf(slot); if (i < 0) return;
    const L = splList(key).map(normName).filter(k => !keep.has(k) && splItems(k).length); if (!L.length) return;
    const k = L[Math.floor(Math.random() * L.length)], tw = splTeeOf(key, k), b = (tw && splItems(k).find(x => x.tee === tw)) || neutralTee(splTees(k)), c = S.courses[slot];
    applyBankToCourse(c, b); c.name = b.name; c.pin = randomPin(); c.pin2 = randomPin(); c.wind = randomWind(); c.wind2 = randomWind(); c.purse = randomPurse();
    keep.add(k); free.splice(i, 1); nSpl++;
  });
  if (!free.length) { persist(); return { n: nSpl, short: 0 }; }
  const recent = new Set(free.map(i => normName(S.courses[i].name)));                            // terrains qu'on remplace
  if (FUT) { const pv = FUT.k - 1 === S.season ? FUT.real : (S.fut && S.fut[FUT.k - 1]) || FUT.real; pv.forEach(c => { if (c && c.name) recent.add(normName(c.name)); }); }   // v295 : plan d'une saison future = la saison d'avant
  else { const H = S.hist[S.hist.length - 2]; if (H) H.t.forEach(t => { if (t) recent.add(normName(t.name)); }); }   // saison passée
  const mix = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const names = [...byName.keys()].filter(k => !keep.has(k));
  const fresh = mix(names.filter(k => !(f.noRep && recent.has(k)))), again = mix(names.filter(k => f.noRep && recent.has(k)));
  const pick = fresh.concat(again).slice(0, free.length);   // s'il manque de terrains neufs, on reprend ceux de l'an passé
  pick.forEach((k, j) => {
    const tees = byName.get(k), b = neutralTee(tees), c = S.courses[free[j]];
    applyBankToCourse(c, b); c.name = b.name;
    c.pin = randomPin(); c.pin2 = randomPin();
    c.wind = randomWind(); c.wind2 = randomWind(); c.purse = randomPurse();
  });
  persist();
  return { n: pick.length + nSpl, short: free.length - pick.length };
}
/* ---- Pige : sortir N terrains au hasard (filtres du tirage), puis en ajouter à la main dans les tournois ----
   S.pige = { n, flt, list: [{ name, tee, at }] } ; at = tournoi où il a été ajouté (null sinon). */
/* Aperçu du terrain : recherche YouTube « GSPro + nom du terrain » dans un nouvel onglet */
function ytLink(name, cls) { return '<a class="ytl' + (cls ? ' ' + cls : '') + '" href="https://www.youtube.com/results?search_query=' + encodeURIComponent('GSPro ' + name) + '" target="_blank" rel="noopener noreferrer" title="Voir l\u2019aperçu sur YouTube">' + esc(name) + ' <span class="yti" aria-hidden="true">\u25B6</span></a>'; }
function pigeState() { const O = inPN() && PNX.cfg ? PNX.cfg : S; if (!O.pige) O.pige = { n: 6, flt: true, list: [] }; const P = O.pige; if (P.lo == null) { P.lo = 4; P.hi = 8; } return P; }
/* v217 : nombre fixe, ou au hasard entre lo et hi */
function pigeCount(P) { if (P.rnd) { const a = Math.min(P.lo, P.hi), b = Math.max(P.lo, P.hi); return a + Math.floor(Math.random() * (b - a + 1)); } return P.n; }
const pgClamp = v => Math.max(1, Math.min(30, Math.round(+v || 1)));
function pigeDraw() {
  const P = pigeState(), inSeason = new Set(inPN() ? [] : S.courses.map(c => normName(c.name))), by = new Map();
  (P.flt ? crfPool() : BANK).forEach(b => { const k = normName(b.name); if (inSeason.has(k)) return; if (!by.has(k)) by.set(k, []); by.get(k).push(b); });
  const ks = [...by.keys()];
  for (let i = ks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ks[i], ks[j]] = [ks[j], ks[i]]; }
  P.last = pigeCount(P);
  P.list = ks.slice(0, P.last).map(k => { const t = by.get(k), b = neutralTee(t); return { name: b.name, tee: b.tee, at: null }; });
  persist(); if (inPN()) pnSave(); return P.list.length;
}
/* v278 : copier les noms des terrains pigés (une ligne par terrain) */
function pigeNames() { return pigeState().list.map(x => x.name).join('\n'); }
function pigeCopyHTML() { return '<button class="btn sec sm" data-a="pigecopy" style="width:100%;margin-top:8px">Copier les noms des terrains</button><textarea class="pgcpy" readonly rows="4" style="display:none;width:100%;margin-top:6px;font-size:15px"></textarea>'; }
function pigeHTML() {
  const P = pigeState(), free = S.courses.map((c, i) => i).filter(i => !courseFrozen(i));
  let h = '<div class="block crfb pige"><h3>Pige de terrains</h3><p class="small mute" style="margin:0 0 8px">Sors quelques terrains au hasard, puis choisis ceux que tu veux et le tournoi où les mettre.</p>' +
    chipRow([['fix', 'Nombre fixe'], ['rnd', 'Au hasard']], P.rnd ? 'rnd' : 'fix', 'pgmode') +
    (P.rnd ? '<div class="pgbar"><label for="pglo">Entre</label><input type="number" id="pglo" data-c="pglo" min="1" max="30" value="' + P.lo + '"><label for="pghi">et</label><input type="number" id="pghi" data-c="pghi" min="1" max="30" value="' + P.hi + '"><button class="btn sm" data-a="pigedraw">Piger</button></div>'
      : '<div class="pgbar"><label for="pgn">Nombre</label><input type="number" id="pgn" data-c="pgn" min="1" max="30" value="' + P.n + '"><button class="btn sm" data-a="pigedraw">Piger</button></div>') +
    '<label class="crftog"><input type="checkbox" data-c="pgflt"' + (P.flt ? ' checked' : '') + '>Utiliser les filtres du tirage</label>';
  if (P.list.length) h += '<ol class="pglist">' + P.list.map((x, k) => {
    const bi = findBankCourse(x.name, x.tee), b = bi >= 0 ? BANK[bi] : null;
    const sub = b ? 'par ' + parTotal(b.pars) + ' · ' + esc(b.tee) + ' · ' + (+b.dist).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' v · ' + fmtCR(b.cr) + ' / ' + b.slope : 'retiré de la liste';
    /* v302 : on peut aussi ajouter le terrain à la liste d'un Majeur ou de la Finale (avec le tee pigé) */
    const sl = splSlots(), slName = (slot) => trText(slot >= N_TOURN ? 'Finale (top ' + FIN.n + ')' : majorName(slot));
    const inL = sl.filter(([slot, key]) => splList(key).some(n => normName(n) === normName(x.name)));
    const done = (x.at != null ? '<span class="pgdone">Ajouté au T' + (x.at + 1) + '</span>' : '') + inL.map(([slot]) => '<span class="pgdone">' + '<span>Dans la liste :</span> ' + esc(slName(slot)) + '</span>').join(' ');
    const opts = (x.at == null && free.length ? '<optgroup label="Tournoi de la saison">' + free.map(i => '<option value="' + i + '">T' + (i + 1) + ' · ' + esc(S.courses[i].name) + '</option>').join('') + '</optgroup>' : '') +
      (sl.length ? '<optgroup label="Liste des Majeurs et de la Finale">' + sl.filter(z => !inL.includes(z)).map(([slot, key]) => '<option value="spl:' + key + '">' + esc(slName(slot)) + (slot >= N_TOURN ? '' : ' (T' + (slot + 1) + ')') + '</option>').join('') + '</optgroup>' : '');
    const act = (done ? '<div>' + done + '</div>' : '') + (!b || !/<option/.test(opts) ? '' :
      '<div class="pgadd"><select data-c="pgto" data-k="' + k + '" aria-label="Tournoi pour ' + esc(x.name) + '"><option value="">Tournoi ou liste…</option>' + opts + '</select><button class="btn sm sec" data-a="pigeadd" data-k="' + k + '">Ajouter</button></div>');
    return '<li><div class="pgnm">' + ytLink(x.name) + '</div><div class="pgsub">' + sub + (b ? ' · <a href="#" class="cresl" data-a="cres" data-k="' + k + '">Résumé \u203a</a>' : '') + '</div>' + act + '</li>';
  }).join('') + '</ol>' + pigeCopyHTML();
  else if (P.drawn) h += '<p class="small mute" style="margin:8px 0 0">Aucun terrain ne correspond.</p>';
  return h + '</div>';
}
