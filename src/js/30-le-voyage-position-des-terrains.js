/* ============ v352 : Le voyage — position des terrains, globe 3D, kilomètres, trajet le plus court ============
   Les positions viennent d'OpenStreetMap (Nominatim), demandées par le navigateur, une seule fois par terrain ;
   elles sont gardées dans le navigateur (igc-geo) et dans la partie (S.geo, pour les terrains joués). */
const GEO_KEY = 'igc-geo', GEOQ = { q: [], busy: false, err: null, done: 0 };
let GEO = null;
function geoAll() { if (GEO) return GEO; GEO = {}; try { GEO = JSON.parse(localStorage.getItem(GEO_KEY) || '{}') || {}; } catch (e) { GEO = {}; } if (S && S.geo) Object.keys(S.geo).forEach(k => { if (!GEO[k] || (GEO[k].la == null && S.geo[k] && S.geo[k].la != null)) GEO[k] = S.geo[k]; }); try { const T = window.CG_TERRAINS; (T && T.courses || []).forEach(c => { if (c && c.geo && c.name) { const k = normName(c.name); if (!GEO[k] || GEO[k].la == null || GEO[k].src === 'liste' || GEO[k].src === 'max') GEO[k] = Object.assign({ src: 'liste' }, c.geo); } }); } catch (e) { } /* v357 : positions incluses dans terrains-data.js ; v456 : une position venue de la liste suit toujours la liste (corrections), une position choisie par le joueur est gardée */ return GEO; }
function geoExportJSON() { const G = geoAll(), out = {}; Object.keys(G).forEach(k => { const g = G[k]; if (g && g.la != null) out[k] = { la: +(+g.la).toFixed(5), lo: +(+g.lo).toFixed(5), cc: g.cc || '', pl: g.pl || '', src: g.src || '' }; }); return { type: 'igc-lieux', v: 1, exported: new Date().toISOString().slice(0, 10), n: Object.keys(out).length, geo: out }; }
function geoImportJSON(txt) { let d; try { d = JSON.parse(txt); } catch (e) { return -1; } if (!d || d.type !== 'igc-lieux' || !d.geo) return -1; const G = geoAll(); let n = 0; Object.keys(d.geo).forEach(k => { const g = d.geo[k], cur = G[k]; if (g && g.la != null && !(cur && cur.la != null)) { G[k] = g; if (S) { S.geo = S.geo || {}; S.geo[k] = g; } n++; } }); try { localStorage.setItem(GEO_KEY, JSON.stringify(G)); } catch (e) { } if (S) persist(); return n; }
let GEOL = null;   // v373 : positions de la liste incluse, toujours disponibles en secours (une recherche ratée ne les cache plus)
function geoList(k) { if (!GEOL) { GEOL = {}; try { (window.CG_TERRAINS && window.CG_TERRAINS.courses || []).forEach(c => { if (c && c.geo && c.name && c.geo.la != null) GEOL[normName(c.name)] = Object.assign({ src: 'liste' }, c.geo); }); } catch (e) { } } return GEOL[k] || null; }
function geoOf(name) { if (!name) return null; const k = normName(name), g = geoAll()[k]; return g && g.la != null ? g : geoList(k); }
function geoTried(name) { return !!(name && geoAll()[normName(name)]); }
function geoSet(name, v) { const k = normName(name); geoAll()[k] = v; try { localStorage.setItem(GEO_KEY, JSON.stringify(GEO)); } catch (e) { } if (S) { S.geo = S.geo || {}; S.geo[k] = v; persist(); } }
const geoKm = (a, b) => { const R = 6371, r = Math.PI / 180, dLa = (b.la - a.la) * r, dLo = (b.lo - a.lo) * r, x = Math.sin(dLa / 2) ** 2 + Math.cos(a.la * r) * Math.cos(b.la * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.min(1, Math.sqrt(x))); };
const geoCountry = cc => { try { return cc ? new Intl.DisplayNames([LANG === 'en' ? 'en' : 'fr'], { type: 'region' }).of(cc) : ''; } catch (e) { return cc || ''; } };
async function geoFetch(q) {
  const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=' + (LANG === 'en' ? 'en' : 'fr') + '&q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); if (!j || !j.length) return null;
  return j.find(x => x.type === 'golf_course' || /golf/i.test(x.name || '')) || j[0];   // v444 : un terrain de golf d'abord
}
const geoClean = n => n.replace(/\b(golf\s*(and|&)\s*country\s*club|golf\s*club|golf\s*course|golf\s*links|golf\s*resort|country\s*club|g\.?c\.?|c\.?c\.?|resort)\b/gi, ' ').replace(/\s+/g, ' ').trim();
const geoPause = ms => new Promise(r => setTimeout(r, ms));
function geoVal(res, src) { const a = res.address || {}; return { la: +(+res.lat).toFixed(4), lo: +(+res.lon).toFixed(4), cc: (a.country_code || '').toUpperCase(), pl: a.city || a.town || a.village || a.municipality || a.county || a.state || '', src }; }
/* v444 : plus d'essais, comme quand on cherche soi-même (demande de Max) : le nom tel quel, avec « golf course »,
   le nom sans « Golf Club » ni « CC », puis la première partie d'un nom composé (« Pinehurst - No. 2 » → « Pinehurst »).
   On garde d'abord un résultat qui est un terrain de golf. */
async function geoLookup(name) {
  const c = geoClean(name), first = name.split(/\s+[-–:|]\s+|\s*\(/)[0].trim(), fc = geoClean(first);
  const tries = [name, /golf/i.test(name) ? null : name + ' golf course', c && c !== name ? c + ' golf' : null, first && first !== name ? first + ' golf' : null, fc && fc !== first ? fc + ' golf course' : null].filter((q, i, A) => q && A.indexOf(q) === i);
  let res = null;
  for (let i = 0; i < tries.length && !res; i++) { if (i) await geoPause(1100); res = await geoFetch(tries[i]); if (res && i && !(res.type === 'golf_course' || /golf/i.test(res.name || ''))) res = null; }
  geoSet(name, res ? geoVal(res, 'osm') : { la: null, src: 'none' });
}
async function geoManual(name, txt) {   // « ville, pays » ou « 45.5, -73.6 »
  const m = String(txt || '').trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[;,\s]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (m) { geoSet(name, { la: +m[1].replace(',', '.'), lo: +m[2].replace(',', '.'), cc: '', pl: '', src: 'manual' }); render(); return true; }
  try { const res = await geoFetch(txt); if (!res) { toast('Lieu introuvable : ' + txt); return false; } const v = geoVal(res, 'manual'); if (res.name && /^(place|boundary)$/.test(res.category || '')) v.pl = res.name; /* v358 : garder le lieu tapé (ex. Ash) plutôt que la municipalité (Dover) */ geoSet(name, v); render(); return true; } catch (e) { toast('Recherche impossible ici (hors ligne ou version claude.ai)'); return false; }
}
function geoEnqueue(names) { names.filter(n => n && !geoList(normName(n))).forEach(n => { if (!GEOQ.q.includes(n)) GEOQ.q.push(n); }); geoRun(); }
async function geoRun() {
  if (GEOQ.busy) return; GEOQ.busy = true; GEOQ.err = null;
  while (GEOQ.q.length) {
    const n = GEOQ.q.shift();
    try { await geoLookup(n); GEOQ.done++; } catch (e) { GEOQ.err = String(e && e.message || e); GEOQ.q = []; break; }
    if (VIEW.name === 'voyage') render();
    await geoPause(1100);   // OpenStreetMap : une recherche par seconde au plus
  }
  GEOQ.busy = false; if (VIEW.name === 'voyage' || VIEW.name === 'courses') render();
}
/* les arrêts d'une saison : 10 tournois + la Finale */
function voyStops(s) {
  if (s > S.season) {   // v405 : saison future planifiée (Terrains › Saison › 2001…) ; une case « à tirer » n'a pas de lieu
    const P = S.fut && S.fut[s]; if (!P) return [];
    const L = P.slice(0, N_TOURN).map((c, i) => ({ i, name: (c && c.name) || null, maj: isMajorT(i), done: 0 }));
    if (finOn() && P[N_TOURN]) L.push({ i: N_TOURN, name: P[N_TOURN].name || null, fin: 1, done: 0 });
    return L;
  }
  if (s === S.season) { const L = S.courses.slice(0, N_TOURN).map((c, i) => ({ i, name: c && c.name, maj: isMajorT(i), done: i < S.t })); if (finOn()) { const f = finCourse(); L.push({ i: N_TOURN, name: f && f.name, fin: 1, done: !!(seasonHist() && seasonHist().fin) }); } return L; }
  const H = S.hist[s - 1]; if (!H) return [];
  const L = (H.t || []).map((t, i) => ({ i, name: t && t.name, maj: !!(t && t.maj), done: 1 })); if (H.fin) L.push({ i: N_TOURN, name: H.fin.name, fin: 1, done: 1 }); return L;
}
function voyKm(stops) { let km = 0, legs = [], prev = null; stops.forEach(st => { const g = geoOf(st.name); if (g && prev) { const d = geoKm(prev, g); km += d; legs.push(d); } else legs.push(null); if (g) prev = g; }); return { km, legs }; }
const fmtKm = v => Math.round(v).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' km';
/* tri : l'ordre qui parcourt le moins de kilomètres. Les Majeurs, les tournois joués (ou en cours) et la Finale restent à leur place ;
   les terrains barrés bougent aussi (le cadenas protège le terrain, pas sa place dans le calendrier). */
function voySortPlan(budget) {   // v403 : budget = nombre maximal d'étapes de recherche (histoire présimulée)
  const n = N_TOURN, free = [], miss = [];
  for (let i = 0; i < n; i++) { const c = S.courses[i]; if (!c || !c.name) continue; if (!geoOf(c.name)) { miss.push(c.name); continue; } if (!(courseFixed(i) || (isMajorT(i) && crf().lockMaj))) free.push(i); }   // v375 : un terrain non localisé garde sa place ; les autres sont triés autour
  const fin = finOn() ? finCourse() : null; if (fin && fin.name && !geoOf(fin.name)) miss.push(fin.name);
  const P = S.hist[S.season - 2];
  let last = P ? (P.fin && P.fin.name) || ((P.t || []).filter(Boolean).slice(-1)[0] || {}).name : null;
  if (FUT) {   // v405 : plan d'une saison future : on part du dernier arrêt de la saison d'avant (en cours ou planifiée)
    const prev = FUT.k - 1 === S.season ? FUT.real : (S.fut && S.fut[FUT.k - 1]) || [];
    const f = finOn() && prev[N_TOURN] && prev[N_TOURN].name; last = f || ((prev.slice(0, n).filter(c => c && c.name).slice(-1)[0]) || {}).name || null;
  }
  const start = geoOf(last);
  const G = S.courses.slice(0, n).map(c => c && c.name ? geoOf(c.name) : null), gF = fin && fin.name ? geoOf(fin.name) : null;
  const leg = (a, b) => a && b ? geoKm(a, b) : 0;
  let cur = 0, pv = start; G.forEach(g => { cur += leg(pv, g); if (g) pv = g; }); cur += leg(pv, gF);
  const isFree = new Set(free), used = new Set(), asg = {}; let best = cur + 0.001, bestA = null;
  let steps = 0;
  const dfs = (k, prev, acc) => {
    if (acc >= best || (budget && ++steps > budget)) return;
    if (k === n) { const tot = acc + leg(prev, gF); if (tot < best) { best = tot; bestA = Object.assign({}, asg); } return; }
    if (!isFree.has(k)) { const g = G[k]; dfs(k + 1, g || prev, acc + leg(prev, g)); return; }
    free.forEach(ci => { if (used.has(ci)) return; used.add(ci); asg[k] = ci; const g = G[ci]; dfs(k + 1, g, acc + leg(prev, g)); used.delete(ci); });
  };
  dfs(0, start, 0);
  return { cur, best: bestA ? best : cur, asg: bestA, free, miss };
}
function voySortApply(quiet, budget) {
  const p = voySortPlan(budget), mt = p.miss.length ? ' · ' + p.miss.length + ' non localisé' + (p.miss.length > 1 ? 's' : '') + ', laissé' + (p.miss.length > 1 ? 's' : '') + ' en place' : '';
  if (!p.asg || !(p.best < p.cur - 0.5)) { if (!quiet) toast('L’ordre actuel est déjà le plus court (' + fmtKm(p.cur) + ')' + mt); return false; }
  const k0 = voyKm(voyStops(S.season)).km, old = S.courses.slice(); p.free.forEach(slot => { S.courses[slot] = old[p.asg[slot]]; });
  const k1 = voyKm(voyStops(S.season)).km;   // affiché comme partout : la saison seule (le départ depuis la saison passée compte dans le calcul)
  persist(); if (!quiet) toast(fmtKm(k0) + ' → ' + fmtKm(k1) + (k0 > 0 ? ' (−' + Math.max(0, Math.round((1 - k1 / k0) * 100)) + ' %)' : '') + mt); return true;
}
function voyCourseBox() {   // dans Terrains › Saison : distance et tri
  const st = voyStops(S.season), k = voyKm(st), miss = st.filter(x => x.name && !geoOf(x.name)).length, f = crf();
  return '<div class="block voybox"><div class="voyh"><b>🌍 <span>Le voyage de la saison</span></b> <span class="mute">' + (miss ? miss + ' <span>terrain' + (miss > 1 ? 's' : '') + ' à localiser</span>' : fmtKm(k.km)) + '</span></div>' +
    '<div class="voyb"><button class="btn sec sm" data-a="voysort">Trier pour le moins de kilomètres</button><button class="btn sec sm" data-a="voyage">Voir le voyage</button></div>' +
    '<label class="crftog"><input type="checkbox" data-c="crfkm"' + (f.autoKm ? ' checked' : '') + '>Trier automatiquement à chaque nouvelle saison</label>' +
    '<label class="crftog"><input type="checkbox" data-c="crfkmmaj"' + (f.lockMaj ? ' checked' : '') + '>Garder les Majeurs sur leur terrain</label>' +
    '<p class="small mute" style="margin:4px 0 0">' + (f.lockMaj ? 'Les Majeurs et la Finale gardent leur place ; les autres tournois (barrés compris) s’organisent autour.' : 'Les Majeurs gardent leur date, mais leur terrain peut changer. Tous les terrains (barrés compris) sont triés ; seuls la Finale et les tournois déjà joués ne bougent pas.') + '</p></div>';
}
let VOY_ROT = null, VOY_K = 1;
const ccFlag = cc => cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map(ch => 127397 + ch.charCodeAt(0))) : '';
const tzOff = tz => { try { const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(x => x.type === 'timeZoneName'); const m = p && p.value.match(/GMT([+-]\d+)?(?::(\d+))?/); return m ? (+(m[1] || 0)) + (m[2] ? Math.sign(+(m[1] || 0) || 1) * m[2] / 60 : 0) : null; } catch (e) { return null; } };
const voyPlace = g => { const ct = geoCountry(g.cc); return esc([g.pl, ct].filter(Boolean).join(', ')); };
/* d'où l'on part pour l'arrêt i de la saison en cours : l'arrêt précédent, ou le dernier de la saison passée */
function voyFrom(i) {
  const st = voyStops(S.season);
  for (let j = i - 1; j >= 0; j--) if (st[j] && st[j].name) return st[j].name;
  const P = S.hist[S.season - 2]; if (!P) return null;
  return (P.fin && P.fin.name) || ((P.t || []).filter(Boolean).slice(-1)[0] || {}).name || null;
}
function voyTripHTML(i) {   // bande « trajet » dans la carte du prochain tournoi
  const st = voyStops(S.season), to = st[i]; if (!to || !to.name) return '';
  const g = geoOf(to.name); if (!g) return '';
  const fn = voyFrom(i), f = fn ? geoOf(fn) : null, km = f ? geoKm(f, g) : null;
  const flag = ccFlag(g.cc), M = [];
  if (km != null && km < 1) return '<div class="vtrip">📍 <b>' + esc(to.name) + '</b> <span>reste au même endroit</span><span class="m">' + voyPlace(g) + '</span></div>';
  if (km != null) {
    M.push(fmtKm(km));
    if (km < 600) { const h = km * 1.25 / 85; M.push('<span>environ ' + (h < 1 ? Math.max(10, Math.round(h * 60 / 5) * 5) + ' min' : Math.floor(h) + ' h ' + String(Math.round((h % 1) * 60 / 5) * 5 % 60).padStart(2, '0')) + ' de route</span>'); }
    else { const h = km / 820 + 0.6, hh = Math.floor(h), mm = Math.round((h - hh) * 60 / 10) * 10; M.push('<span>environ ' + (mm === 60 ? (hh + 1) + ' h' : hh + ' h' + (mm ? ' ' + String(mm).padStart(2, '0') : '')) + ' de vol</span>'); }
    const o1 = f.tz ? tzOff(f.tz) : null, o2 = g.tz ? tzOff(g.tz) : null, dz = o1 != null && o2 != null ? o2 - o1 : Math.round((g.lo - f.lo) / 15); if (dz) M.push('<span>décalage ' + (dz > 0 ? '+' : '−') + (() => { const v = Math.abs(dz), h = Math.floor(v), m = Math.round((v - h) * 60); return h + ' h' + (m ? ' ' + m : ''); })() + '</span>');
  }
  const prevCC = new Set(st.slice(0, i).map(x => x.name && geoOf(x.name)).filter(Boolean).map(x => x.cc)), nCC = new Set([...prevCC, g.cc]).size;
  if (g.cc && !prevCC.has(g.cc) && i > 0) M.push('<span>nouveau pays : ' + ord(nCC) + ' de la saison</span>');
  const ic = km == null ? '📍' : km < 600 ? '🚗' : '✈️';
  return '<div class="vtrip">' + ic + ' ' + (fn && f ? '<b>' + esc(fn) + '</b> → ' : '') + '<b>' + esc(to.name) + '</b>' + (flag ? ' ' + flag : '') +
    '<span class="m">' + voyPlace(g) + (M.length ? ' · ' + M.join(' · ') : '') + '</span></div>';
}
/* v440 : carte du monde à plat dans la carte du prochain tournoi (option B, choix de Max) : le trajet du vol depuis le
   tournoi précédent, la carte cadrée sur le trajet, l'avion toujours tourné vers sa destination, et un bandeau télé.
   Renvoie '' (bandeau vert d'origine) s'il manque une position ou si l'on reste au même endroit. */
function voyMapHTML(i) {
  try {
    if (!window.d3 || !d3.geoNaturalEarth1 || !window.CG_WORLD || !isPC()) return '';
    const st = voyStops(S.season), to = st[i]; if (!to || !to.name) return '';
    const g = geoOf(to.name), fn = voyFrom(i), f = fn ? geoOf(fn) : null; if (!g || !f) return '';
    const km = geoKm(f, g); if (km < 1) return '';
    const W = 624, H = 230, A = [f.lo, f.la], B = [g.lo, g.la], ip = d3.geoInterpolate(A, B), mid = ip(0.5);
    const arc = { type: 'LineString', coordinates: d3.range(0, 1.0001, 0.02).map(ip) };
    const pad = Math.min(150, 60 + 3000 / Math.max(km, 50));
    const proj = d3.geoNaturalEarth1().rotate([-mid[0], 0]).fitExtent([[pad, 40], [W - pad, H - 46]], arc), pth = d3.geoPath(proj);
    if (proj.scale() > 2600) proj.scale(2600).translate([W / 2, H / 2 - 6]).center([0, 0]).rotate([-mid[0], -mid[1]]);   // très petit trajet : on ne zoome pas à l'infini
    const P = d3.geoPath(proj), pa = proj(A), pb = proj(B);
    /* v442 : plus de détails selon le zoom (demande de Max) : contours fins des pays, frontières des États et provinces,
       noms des pays puis des États et provinces quand le trajet est court (sans chevauchement). */
    const sc = proj.scale(), ctrV = proj.invert([W / 2, H / 2]) || mid, radV = d3.geoDistance(ctrV, proj.invert([0, 0]) || A) + 0.05;
    try { voyPrepAll(); } catch (e) { }
    const visF = F => F && F.features ? F.features.filter(ft => !ft._c || d3.geoDistance(ft._c, ctrV) - ft._r < radV) : [];
    const W50 = sc > 330 && window.CG_WORLD50, A1 = sc > 650 && window.CG_ADM1;
    const land = (W50 ? visF(W50._lite || W50) : window.CG_WORLD.features).map(ft => P(ft) || '').join('');
    const adm = A1 ? visF(A1._lite || A1).map(ft => P(ft) || '').join('') : '';
    const boxes = [[pa[0] - 70, pa[1] - 40, pa[0] + 70, pa[1] + 40], [pb[0] - 70, pb[1] - 40, pb[0] + 70, pb[1] + 40], [0, H - 34, W, H]], en = LANG === 'en';
    let names = '';
    const lab0 = (F, thr, cls, up) => visF(F).filter(ft => ft.properties && ft.properties.r <= thr).sort((x, y) => x.properties.r - y.properties.r).forEach(ft => {
      const Pp = ft.properties; if (d3.geoDistance([Pp.x, Pp.y], ctrV) > radV) return; const q = proj([Pp.x, Pp.y]); if (!q) return;
      const t = up ? (en ? Pp.e : Pp.f).toUpperCase() : (en ? Pp.e : Pp.f), w = t.length * (up ? 7 : 6), bx = [q[0] - w / 2, q[1] - 8, q[0] + w / 2, q[1] + 8];
      if (bx[0] < 4 || bx[2] > W - 4 || bx[1] < 4 || bx[3] > H - 4 || boxes.some(o => bx[0] < o[2] && bx[2] > o[0] && bx[1] < o[3] && bx[3] > o[1])) return;
      boxes.push(bx); names += '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 4).toFixed(1) + '" text-anchor="middle" class="' + cls + '">' + esc(t) + '</text>'; });
    if (W50) lab0(W50, 1.2 + sc / 260, 'vmc', true);
    if (A1) lab0(A1, 1.5 + sc / 400, 'vms', false);
    const q1 = proj(ip(0.6)), q2 = proj(ip(0.62)), ang = Math.atan2(q2[1] - q1[1], q2[0] - q1[0]) * 180 / Math.PI;
    const lab = (q, t1, t2, right, col) => { const x = q[0] + (right ? 14 : -14), an = right ? 'start' : 'end', y = q[1] < 60 ? q[1] + 26 : q[1] - 22;
      return '<text x="' + x + '" y="' + y + '" text-anchor="' + an + '" class="vml1" fill="' + col + '">' + esc(t1) + '</text><text x="' + x + '" y="' + (y + 15) + '" text-anchor="' + an + '" class="vml2">' + esc(t2) + '</text>'; };
    const right = pb[0] >= pa[0];
    let svg = '<svg class="vmap" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="' + W + '" height="' + H + '" fill="#0b1a2a"/><path d="' + (P(d3.geoGraticule10()) || '') + '" fill="none" stroke="rgba(255,255,255,.05)"/>' +
      '<path d="' + land + '" fill="#1f3b2c" stroke="#3d6e52" stroke-width="' + (W50 ? .9 : .5) + '"/>' + (adm ? '<path d="' + adm + '" fill="none" stroke="rgba(201,214,222,.28)" stroke-width=".7" stroke-dasharray="3 2"/>' : '') + names +
      '<path d="' + (P(arc) || '') + '" fill="none" stroke="#F0C419" stroke-width="2.4" stroke-dasharray="7 5"/>' +
      '<circle cx="' + pa[0] + '" cy="' + pa[1] + '" r="5" fill="#9fb0bd" stroke="#fff"/>' +
      '<circle class="vmpulse" cx="' + pb[0] + '" cy="' + pb[1] + '" r="16" fill="rgba(240,196,25,.25)"/><circle cx="' + pb[0] + '" cy="' + pb[1] + '" r="7" fill="#F0C419" stroke="#fff" stroke-width="2"/>' +
      '<g transform="translate(' + q1[0].toFixed(1) + ' ' + q1[1].toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"><path d="M11 0 L3 -2.2 L-2 -10 L-5 -10 L-1.5 -2.2 L-7 -2 L-9.5 -5.5 L-11.5 -5.5 L-10 0 L-11.5 5.5 L-9.5 5.5 L-7 2 L-1.5 2.2 L-5 10 L-2 10 L3 2.2 Z" fill="#fff" stroke="#0b1a2a" stroke-width="1"/></g>' +
      lab(pa, (f.pl || fn).toUpperCase(), geoCountry(f.cc), !right, '#9fb0bd') + lab(pb, (g.pl || to.name).toUpperCase(), geoCountry(g.cc), right, '#F0C419') + '</svg>';
    const M = [fmtKm(km)];
    if (km < 600) { const h = km * 1.25 / 85; M.push('<span>environ ' + (h < 1 ? Math.max(10, Math.round(h * 60 / 5) * 5) + ' min' : Math.floor(h) + ' h ' + String(Math.round((h % 1) * 60 / 5) * 5 % 60).padStart(2, '0')) + ' de route</span>'); }
    else { const h = km / 820 + 0.6, hh = Math.floor(h), mm = Math.round((h - hh) * 60 / 10) * 10; M.push('<span>environ ' + (mm === 60 ? (hh + 1) + ' h' : hh + ' h' + (mm ? ' ' + String(mm).padStart(2, '0') : '')) + ' de vol</span>'); }
    return svg + '<div class="vmbar"><b>Prochain arrêt</b>' + M.map(x => '<span>' + x + '</span>').join('') + '</div>';
  } catch (e) { return ''; }
}
function voyRouteHTML() {   // la route de la saison : arrêts, avion, km parcourus
  const st = voyStops(S.season).filter(x => x.name); if (st.length < 2) return '';
  const G = st.map(x => geoOf(x.name)); if (G.filter(Boolean).length < 2) return '';
  const cur = Math.min(S.t, st.length - 1), live = !!S.cur, allDone = st.every(x => x.done);
  let tot = 0, done = 0, prev = null;
  G.forEach((g, i) => { if (!g) return; if (prev) { const d = geoKm(prev, g); tot += d; if (i < cur || (i === cur && (live || allDone)) || allDone) done += d; } prev = g; });
  const n = st.length, pos = allDone ? n - 1 : live ? cur : Math.max(0, cur - 0.5), pct = (4.5 + (pos / (n - 1)) * 91).toFixed(1) + '%';
  const miss = G.filter(g => !g).length;
  return '<button class="block vroute" data-a="voyage" aria-label="Voir le voyage"><div class="vrh"><b>🌍 <span>La route</span> ' + yr(S.season) + '</b><span class="mute">' + (miss ? miss + ' <span>terrain' + (miss > 1 ? 's' : '') + ' à localiser</span>' : '<span>Voir le voyage</span> ›') + '</span></div>' +
    '<div class="vrl" style="--vp:' + pct + '">' + (allDone ? '' : '<span class="vpl" style="left:' + pct + '">✈️</span>') +
    st.map((x, i) => '<div class="vst' + (x.done ? ' d' : '') + (x.maj ? ' mj' : '') + (i === cur && !allDone ? ' cu' : '') + '" title="' + esc(x.name) + '"><i></i><span>' + (x.fin ? '🏆' : G[i] && ccFlag(G[i].cc) || '·') + '</span></div>').join('') + '</div>' +
    '<div class="vrf"><span><b>' + fmtKm(done) + '</b> <span>parcourus</span></span><span class="mute"><span>sur</span> ' + fmtKm(tot) + '</span></div></button>';
}
function vVoyage() {
  const s = VIEW.s || S.season, st = voyStops(s), k = voyKm(st), seasons = S.hist.map(H => H.s).filter(x => voyStops(x).some(y => y.name));
  const futS = Object.keys(S.fut || {}).map(Number).filter(x => x > S.season && voyStops(x).some(y => y.name)).sort((a, b) => a - b);   // v405 : saisons futures planifiées
  const miss = st.filter(x => x.name && !geoTried(x.name)).map(x => x.name), notFound = st.filter(x => x.name && geoTried(x.name) && !geoOf(x.name)).length;
  let h = '<div class="top"><div><h1>Le voyage</h1><div class="ctx"><span>Saison</span> ' + yr(s) + (s > S.season ? ' <span>(prévue)</span>' : '') + ' · <b>' + fmtKm(k.km) + '</b></div></div></div>';
  h += '<div class="row voyctl" style="gap:8px;flex-wrap:wrap;margin:0 0 10px"><select data-c="voys" aria-label="Saison">' + futS.concat(seasons).sort((a, b) => b - a).map(x => '<option value="' + x + '"' + (x === s ? ' selected' : '') + '>' + yr(x) + (x === S.season ? ' (en cours)' : x > S.season ? ' (prévue)' : '') + '</option>').join('') + '</select>' +
    (miss.length ? '<button class="btn sm" data-a="voyfind">Localiser ' + miss.length + ' terrain' + (miss.length > 1 ? 's' : '') + '</button>' : '') + '<button class="btn sec sm" data-a="voyall">Localiser toute ma liste</button><button class="btn sec sm" data-a="voyexp">Exporter les lieux</button><label class="btn sec sm filebtn">Importer des lieux<input type="file" class="fileinp" data-c="voyimp" accept=".json,application/json"></label></div>';
  if (GEOQ.busy) h += '<p class="small">🔎 <span>Recherche en cours sur OpenStreetMap…</span> ' + GEOQ.q.length + ' <span>restants</span></p>';
  if (GEOQ.err) h += '<p class="small" style="color:var(--under)">Recherche impossible ici (hors ligne ou version claude.ai) : ouvre le jeu téléchargé sur ton ordinateur, connecté à Internet.</p>';
  if (notFound) h += '<p class="small mute">' + notFound + ' <span>terrain(s) introuvable(s) automatiquement : entre une ville ou des coordonnées dans la liste plus bas.</span></p>';
  h += '<div class="voyglobe"><canvas id="voycv"></canvas><div class="voyhint small mute">Glisse pour tourner · molette ou pincement pour zoomer</div></div>';
  // étapes
  const rows = st.map((x, j) => { const g = geoOf(x.name), d = k.legs[j];
    return '<tr><td class="mute">' + (x.fin ? 'F' : 'T' + (x.i + 1)) + '</td><td>' + (x.maj ? '★ ' : x.fin ? '🏆 ' : '') + esc(x.name || '–') + '</td><td class="small">' + (g ? esc([g.pl, geoCountry(g.cc)].filter(Boolean).join(', ')) || (g.la.toFixed(2) + ', ' + g.lo.toFixed(2)) : geoTried(x.name) ? '<span style="color:var(--under)">introuvable</span>' : '<span class="mute">à localiser</span>') +
      (x.name ? ' <button class="linkbtn small" data-a="voyedit" data-n="' + esc(x.name) + '">✎</button>' : '') + '</td><td class="r">' + (d != null ? fmtKm(d) : '–') + '</td></tr>'; }).join('');
  h += '<div class="block"><h3 style="margin-top:0">Les étapes</h3><div class="scroll"><table class="plain"><tr><th>#</th><th>Terrain</th><th>Lieu</th><th class="r">Distance</th></tr>' + rows + '</table></div>' +
    (VIEW.ved ? '<div class="voyedit"><label>Lieu de « ' + esc(VIEW.ved) + ' » : ville, pays ou coordonnées (lat, lon)</label><div class="row" style="gap:6px"><input type="text" id="voyin" placeholder="ex. : Augusta, Georgia · 33.50, -82.02"><button class="btn sm" data-a="voyset">OK</button><button class="btn sec sm" data-a="voycancel">Annuler</button></div></div>' : '') + '</div>';
  // carrière et passeport
  const from = S.debut || 1; let car = 0, longest = null; const cc = {};
  seasons.filter(x => x >= from).forEach(x => { const st2 = voyStops(x), kk = voyKm(st2).km; car += kk; if (!longest || kk > longest[1]) longest = [x, kk]; st2.forEach(y => { const g = geoOf(y.name); if (g && g.cc) cc[g.cc] = (cc[g.cc] || 0) + 1; }); });
  h += '<div class="block"><h3 style="margin-top:0">Ta carrière sur la route</h3><p style="margin:0 0 6px"><b>' + fmtKm(car) + '</b> <span class="mute">depuis</span> ' + yr(from) + (longest ? ' · <span class="mute">saison la plus longue :</span> ' + yr(longest[0]) + ' (' + fmtKm(longest[1]) + ')' : '') + ' · <span class="mute">≈</span> ' + (car / 40075).toFixed(1).replace('.', LANG === 'en' ? '.' : ',') + ' <span class="mute">tours de la Terre</span></p>' +
    (Object.keys(cc).length ? '<div class="voypass"><span class="small mute">Passeport</span> ' + Object.keys(cc).sort((a, b) => cc[b] - cc[a]).map(c => '<span class="voypc">' + esc(geoCountry(c)) + ' <b>' + cc[c] + '</b></span>').join('') + '</div>' : '') + '</div>';
  h += '<button class="btn sec" data-a="backview" style="margin-top:6px">Retour</button>';
  setTimeout(() => voyMount(st), 0);
  return h;
}
function voyMount(st, tries) {
  const cv = document.getElementById('voycv'); if (!cv) return;
  if (!window.d3 || !d3.geoOrthographic || !window.CG_WORLD) { /* v353 : carte pas encore chargée, on réessaie */
    tries = (tries || 0) + 1; if (tries < 40) { setTimeout(() => voyMount(st, tries), 250); return; }
    voyMsg(cv, 'Carte du monde indisponible (monde.js ' + (window.CG_WORLD ? 'chargé, d3 absent' : 'non chargé') + ').'); return; }
  try { voyMount2(cv, st); } catch (e) { voyMsg(cv, 'Erreur du globe : ' + (e && e.message || e)); }
}
function voyMsg(cv, m) { const h = cv.parentElement && cv.parentElement.querySelector('.voyhint'); if (h) { h.textContent = m; h.style.color = 'var(--under)'; } }
/* v396 : globe plus fluide. voyPrep() calcule une seule fois, pour chaque pays et province, un cercle qui l'englobe
   (centre et rayon en radians) ; voyVis() ne garde que ce qui touche la partie visible du globe (face avant ET cadre
   de l'image, plus petit quand on zoome). Le dessin se fait au plus une fois par image (requestAnimationFrame). */
function voyPrep(F, tol) {
  if (!F || F._prep) return F;
  F.features.forEach(f => {
    let c; try { c = d3.geoCentroid(f); } catch (e) { c = null; }
    if (!c || !isFinite(c[0])) { const P = f.properties || {}; c = [P.x || 0, P.y || 0]; }
    let r = 0; const g = f.geometry, polys = !g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    polys.forEach(poly => poly.forEach(ring => { const st = Math.max(1, Math.floor(ring.length / 60)); for (let i = 0; i < ring.length; i += st) { const d = d3.geoDistance(c, ring[i]); if (d > r) r = d; } }));
    f._c = c; f._r = r + 0.02;   // marge pour les sommets non échantillonnés
  });
  F._prep = 1;
  /* version allégée pour les zooms moyens : un sommet n'est gardé que s'il s'éloigne d'au moins tol degrés du précédent */
  tol = tol || 0.15;
  const thin = ring => { const out = [ring[0]]; let last = ring[0]; for (let i = 1; i < ring.length - 1; i++) { const q = ring[i]; if (Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) >= tol) { out.push(q); last = q; } } out.push(ring[ring.length - 1]); return out.length >= 4 ? out : ring; };
  F._lite = { type: 'FeatureCollection', features: F.features.map(f => { const g = f.geometry; if (!g) return f;
    const geometry = g.type === 'Polygon' ? { type: 'Polygon', coordinates: g.coordinates.map(thin) } : g.type === 'MultiPolygon' ? { type: 'MultiPolygon', coordinates: g.coordinates.map(p => p.map(thin)) } : g;
    const nf = { type: 'Feature', properties: f.properties, geometry, _c: f._c, _r: f._r };
    try { const a0 = d3.geoArea(f), a1 = d3.geoArea(nf); if (!(Math.abs(a1 - a0) <= 0.25 * a0 + 1e-5)) return f; } catch (e) { return f; }   // contour retourné ou trop déformé : on garde l'original
    return nf; }) };
  return F;
}
function voyPrepAll() { if (!window.d3 || !d3.geoCentroid || !window.CG_WORLD) return; voyPrep(window.CG_WORLD); voyPrep(window.CG_WORLD50, 0.15); voyPrep(window.CG_ADM1, 0.3); }
/* pré-chargement : la préparation se fait en arrière-plan quelques secondes après le démarrage, quand le navigateur est libre */
setTimeout(() => { const go = () => { try { voyPrepAll(); } catch (e) { } }; if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 }); else go(); }, 4000);
function voyVis(F, ctr, alpha) { return F.features.filter(f => f._c ? d3.geoDistance(f._c, ctr) - f._r < alpha : true); }
function voyMount2(cv, st) {
  const box = cv.parentElement, W = Math.max(280, box.clientWidth), H = Math.min(560, Math.round(W * (isPC() ? 0.62 : 1))), dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const pts = st.map(x => ({ x, g: geoOf(x.name) })).filter(p => p.g);
  const nx = (VIEW.s || S.season) === S.season ? pts.find(p => !p.x.done) : null;   // v440 : le prochain tournoi, en vedette
  if (!VOY_ROT && nx) VOY_ROT = [-nx.g.lo, -nx.g.la * 0.8];
  if (!VOY_ROT) { if (pts.length) { const c = d3.geoCentroid({ type: 'MultiPoint', coordinates: pts.map(p => [p.g.lo, p.g.la]) }); VOY_ROT = [-c[0], -c[1]]; } else VOY_ROT = [73, -40]; }
  const css = getComputedStyle(document.documentElement), col = n => (css.getPropertyValue(n) || '').trim() || '#888', dark = /^#?(0|1|2)/.test(col('--bg').replace('#', '')), SEA = dark ? '#132b3d' : '#cfe2ef', LAND = dark ? '#2b4632' : '#eae5cf';
  const proj = d3.geoOrthographic().translate([W / 2, H / 2]).clipAngle(90), path = d3.geoPath(proj, ctx), grat = d3.geoGraticule10();
  voyPrepAll();   // déjà fait en arrière-plan d'habitude (provinces : simple pointillé, allégées davantage)
  let moving = false;
  const draw = () => {
    proj.scale(Math.min(W, H) / 2.15 * VOY_K).rotate(VOY_ROT);
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = SEA; ctx.fill(); ctx.strokeStyle = col('--line'); ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); path(grat); ctx.strokeStyle = col('--line'); ctx.globalAlpha = .5; ctx.stroke(); ctx.globalAlpha = 1;
    const W50 = VOY_K >= 1.8 && window.CG_WORLD50, A1 = VOY_K >= 2.2 && window.CG_ADM1 && !moving, ctr0 = [-VOY_ROT[0], -VOY_ROT[1]], vis = (lo, la, m) => d3.geoDistance([lo, la], ctr0) < Math.PI / 2 - (m || 0);
    const sc = proj.scale(), alpha = Math.min(Math.PI / 2, Math.asin(Math.min(1, Math.hypot(W, H) / 2 / sc)));   // v396 : rayon visible (face avant et cadre)
    const fine = VOY_K >= 3.2, src = F => fine || !F._lite ? F : F._lite;   // v396 : contours allégés jusqu'au zoom 3,2
    proj.precision(fine ? 0.7 : 1.5);
    const land = voyVis(W50 ? src(CG_WORLD50) : CG_WORLD, ctr0, alpha), landP = new Path2D(d3.geoPath(proj)({ type: 'FeatureCollection', features: land }) || '');
    ctx.fillStyle = LAND; ctx.fill(landP);
    if (A1) { const a1 = voyVis(src(CG_ADM1), ctr0, alpha); ctx.beginPath(); a1.forEach(f => path(f)); ctx.strokeStyle = col('--mute'); ctx.globalAlpha = .28; ctx.lineWidth = .5; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }   // v376 : provinces et États au zoom
    ctx.strokeStyle = col('--mute'); ctx.globalAlpha = W50 ? .55 : .35; ctx.lineWidth = W50 ? .8 : .6; ctx.stroke(landP); ctx.globalAlpha = 1;
    if (VOY_K >= 1.4 && window.CG_WORLD50) {   // v376 : noms des pays, puis des provinces, selon le zoom (sans chevauchement)
      const R0 = isPC() ? 12 : 15, boxes = pts.filter(p => vis(p.g.lo, p.g.la)).map(p => { const q = proj([p.g.lo, p.g.la]); return [q[0] - R0, q[1] - R0, q[0] + R0, q[1] + R0]; }).concat([[0, H - (isPC() ? 40 : 66), W, H]]), en = LANG === 'en', lab = (F, thr, font, color, up) => {
        F.features.filter(f => f.properties.r <= thr && vis(f.properties.x, f.properties.y, .08)).sort((a, b) => a.properties.r - b.properties.r).forEach(f => {
          const P = f.properties, xy = proj([P.x, P.y]); if (!xy) return; const t = up ? (en ? P.e : P.f).toUpperCase() : (en ? P.e : P.f);
          ctx.font = font; const w = ctx.measureText(t).width, hh = parseInt(font.match(/(\d+)px/)[1], 10), b = [xy[0] - w / 2 - 2, xy[1] - hh / 2 - 1, xy[0] + w / 2 + 2, xy[1] + hh / 2 + 1];
          if (b[0] < 2 || b[2] > W - 2 || b[1] < 2 || b[3] > H - 2 || boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) return;
          boxes.push(b); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = LAND; ctx.strokeText(t, xy[0], xy[1]); ctx.fillStyle = color; ctx.fillText(t, xy[0], xy[1]); });
      };
      lab(CG_WORLD50, 1.2 + 1.9 * VOY_K, '600 ' + (isPC() ? 11 : 12) + 'px Arimo, Arial', col('--mute'), true);
      if (A1) lab(CG_ADM1, 0.8 + 1.15 * VOY_K, 'italic 400 ' + (isPC() ? 10.5 : 11.5) + 'px Arimo, Arial', col('--mute'));
    }
    for (let j = 1; j < pts.length; j++) { ctx.beginPath(); path({ type: 'LineString', coordinates: [[pts[j - 1].g.lo, pts[j - 1].g.la], [pts[j].g.lo, pts[j].g.la]] }); const nL = pts[j] === nx; ctx.strokeStyle = nL ? '#F0C419' : pts[j].x.done ? col('--acc') : col('--mute'); ctx.lineWidth = (isPC() ? 2.4 : 2.8) * (nL ? 1.3 : 1); ctx.setLineDash(pts[j].x.done || nL ? [] : [6, 5]); ctx.stroke(); ctx.setLineDash([]); }
    const ctr = [-VOY_ROT[0], -VOY_ROT[1]];
    pts.forEach((p, j) => { if (d3.geoDistance([p.g.lo, p.g.la], ctr) > Math.PI / 2) return; const [x, y] = proj([p.g.lo, p.g.la]);
      const isN = p === nx, R = (isPC() ? 10 : 13) * (isN ? 1.35 : 1);
      if (isN) { ctx.beginPath(); ctx.arc(x, y, R * 2.1, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(240,196,25,.25)'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, R, 0, 2 * Math.PI); ctx.fillStyle = isN ? '#F0C419' : p.x.fin ? '#8E6FD8' : p.x.maj ? '#E3B12C' : col('--acc'); ctx.fill(); ctx.strokeStyle = col('--paper'); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '700 ' + (isPC() ? 12 : 15) + 'px Arimo, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.x.fin ? 'F' : String(p.x.i + 1), x, y + .5);
      if (isN) { const pl = p.g ? [p.g.pl, geoCountry(p.g.cc)].filter(Boolean).join(', ') : ''; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.font = '800 ' + (isPC() ? 14 : 15) + 'px Arimo, Arial'; const t1 = (LANG === 'en' ? 'NEXT · ' : 'PROCHAIN · ') + p.x.name.toUpperCase(); ctx.lineWidth = 5; ctx.strokeStyle = '#0b1622'; ctx.strokeText(t1, x + R * 2.3, y - 6); ctx.fillStyle = '#F0C419'; ctx.fillText(t1, x + R * 2.3, y - 6);
        if (pl) { ctx.font = '600 ' + (isPC() ? 12.5 : 13) + 'px Arimo, Arial'; ctx.strokeText(pl, x + R * 2.3, y + 12); ctx.fillStyle = '#e9eef2'; ctx.fillText(pl, x + R * 2.3, y + 12); } } });
  };
  draw();
  let raf = 0; const ask = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (cv.isConnected) draw(); }); };   // v396 : au plus un dessin par image
  /* v396 : pendant qu'on tourne ou zoome, les lignes de provinces (le tracé le plus coûteux) sont mises de côté ;
     elles reviennent 150 ms après le dernier mouvement. Pays, frontières et noms restent affichés. */
  let still = 0; const moved = () => { moving = true; clearTimeout(still); still = setTimeout(() => { moving = false; ask(); }, 150); ask(); };
  let drag = null; const pinch = new Map();
  cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); pinch.set(e.pointerId, [e.clientX, e.clientY]); drag = [e.clientX, e.clientY, VOY_ROT.slice()]; };
  cv.onpointermove = e => { if (!pinch.has(e.pointerId)) return; const prevP = pinch.get(e.pointerId); pinch.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch.size === 2) { const [a, b] = [...pinch.values()], [pa] = [prevP], d1 = Math.hypot(a[0] - b[0], a[1] - b[1]); const other = [...pinch.entries()].find(([k]) => k !== e.pointerId)[1], d0 = Math.hypot(pa[0] - other[0], pa[1] - other[1]); if (d0 > 0) { VOY_K = Math.max(.8, Math.min(14, VOY_K * d1 / d0)); moved(); } return; }
    if (!drag) return; const s = 0.25 / VOY_K; VOY_ROT = [drag[2][0] + (e.clientX - drag[0]) * s, Math.max(-85, Math.min(85, drag[2][1] - (e.clientY - drag[1]) * s))]; moved(); };
  cv.onpointerup = cv.onpointercancel = e => { pinch.delete(e.pointerId); if (!pinch.size) drag = null; };
  cv.onwheel = e => { e.preventDefault(); VOY_K = Math.max(.8, Math.min(14, VOY_K * (e.deltaY < 0 ? 1.12 : 1 / 1.12))); moved(); };
}
function vCoursesSeason() {
  const f = crf(), hasBank = S.courseBank.length > 0;
  let h = FUT ? '<p class="mute small"><span>Choisis à l’avance les terrains de la saison </span>' + yr(FUT.k) + '<span>. Une case « à tirer » sera tirée au début de la saison avec les filtres (si le tirage automatique est activé) ; sinon, elle garde le terrain de la saison d’avant. Les terrains choisis ici ne sont pas touchés par le tirage automatique.</span></p>' + (futCount(FUT.k) ? '<button class="btn sec sm" data-a="futwipe" style="margin:0 0 10px">Effacer le plan de cette saison</button>' : '') : '<p class="mute small">Les dix terrains de la saison, dans l’ordre où ils se jouent. Le cadenas barre un terrain : ni son contenu, ni sa place, ni le tirage ne peuvent le changer pendant la saison en cours (tout se débarre à la nouvelle saison). Le menu à gauche change l’ordre (les deux tournois échangent leur place). Le course rating et le slope influencent la difficulté pour tout le monde ; le vent l’augmente aussi.</p>';
  if (hasBank) {
    const num = (k, step) => '<input type="number" data-c="crf" data-k="' + k + '" step="' + step + '" value="' + f[k] + '" aria-label="' + k + '">';
    h += '<div class="crfrow"><div class="block crfb"><h3>Tirage au hasard</h3><div class="crfg">' +
      '<span>Verges</span>' + num('dmin', 10) + '<span class="d">à</span>' + num('dmax', 10) +
      '<span>CR</span>' + num('crmin', 0.1) + '<span class="d">à</span>' + num('crmax', 0.1) +
      '<span>Slope</span>' + num('smin', 1) + '<span class="d">à</span>' + num('smax', 1) +
      '<span>Par</span>' + num('pmin', 1) + '<span class="d">à</span>' + num('pmax', 1) + '</div>' + crfTeesHTML(f) +
      '<button class="btn" data-a="drawcourses">Tirer les terrains non barrés</button>' +
      '<p class="small mute" id="crfn" style="margin:0">' + crfCountText() + ' · un terrain différent par tournoi · vent, drapeau et bourse tirés aussi</p>' +
      '<label class="crftog"><input type="checkbox" data-c="crfauto"' + (f.auto ? ' checked' : '') + '>Tirer automatiquement à chaque nouvelle saison</label>' +
      '<label class="crftog"><input type="checkbox" data-c="crfnorep"' + (f.noRep ? ' checked' : '') + '>Éviter les terrains de la saison passée</label></div>' + pigeHTML() + splHTML() + '</div>';
  } else {
    h += '<button class="btn sec" data-a="randomcourses" style="margin-bottom:4px">Générer des statistiques aléatoires</button><p class="small mute">Pour les terrains non barrés : distance, course rating, slope, par et index, vent, drapeau et bourse ; les terrains encore nommés « Terrain N » reçoivent un nom fictif. Ajoute des terrains dans ta liste pour pouvoir les tirer au hasard avec des filtres.</p>';
  }
  ensureFinSlot();
  try { h += voyCourseBox(); } catch (e) { }   // v352
  h += '<div class="dgrid">';
  S.courses.forEach((c, i) => {
    if (i >= N_TOURN && !finOn()) return;
    const fx = courseFixed(i), lk = !!c.lk, frozen = fx || lk, inprog = !FUT && S.cur && S.cur.t === i, isF = i >= N_TOURN, tbd = !!FUT && !c.name;
    let ord;
    const slotOpts = () => S.courses.map((x, j) => (j === i || (!courseFrozen(j) && (j < N_TOURN || finOn()))) ? '<option value="' + j + '"' + (j === i ? ' selected' : '') + '>' + (j >= N_TOURN ? 'F' : 'T' + (j + 1)) + '</option>' : '').join('');   // v374 : la Finale s'échange aussi avec les 10 tournois
    if (isF && !frozen) ord = '<select class="cord" data-c="cord" data-i="' + i + '" aria-label="Position de la Finale">' + slotOpts() + '</select>';
    else if (isF) ord = '<span class="cordx" title="Finale : top ' + FIN.n + ' de la Ligue 1">F' + (fx ? '<br><small>' + (inprog ? 'en cours' : 'jouée') + '</small>' : '') + '</span>';
    else if (frozen) ord = '<span class="cordx">T' + (i + 1) + (fx ? '<br><small>' + (inprog ? 'en cours' : 'joué') + '</small>' : '') + '</span>';
    else ord = '<select class="cord" data-c="cord" data-i="' + i + '" aria-label="Position du tournoi ' + (i + 1) + '">' + slotOpts() + '</select>';
    const lock = fx || tbd ? '' : '<button type="button" class="clock' + (lk ? ' on' : '') + '" data-a="clock" data-i="' + i + '" aria-pressed="' + lk + '" aria-label="' + (lk ? 'Débarrer' : 'Barrer') + ' le tournoi ' + (i + 1) + '">' + LOCK_SVG(lk) + '</button>';
    h += '<div class="ccard' + (lk ? ' lk' : '') + (fx ? ' done' : '') + '"><div class="cbar">' + ord +
      '<div class="cmid">' + (isF ? '<div class="small" style="color:#C9A227;font-weight:700">\ud83c\udfc6 Finale \u00b7 top ' + FIN.n + ' de la L1</div>' : isMajorT(i) ? '<div class="small" style="color:#C9A227;font-weight:700">\u2605 Majeur en L1 \u00b7 ' + esc(majorName(i)) + '</div>' : '') + (tbd ? '<div class="cnm futtbd">' + (crf().auto && S.courseBank.length ? 'À tirer au début de la saison' : 'Garde le terrain de la saison d’avant') + '</div><div class="csb">Choisis un terrain dans les détails, ou tire-les tous</div></div>' : '<div class="cnm">' + ytLink(c.name) + '</div><div class="csb">par ' + parTotal(c.pars) + ' · ' + esc(c.tee) + ' · ' + (+c.dist).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' v · ' + fmtCR(c.cr) + ' / ' + c.slope + '</div></div>') + lock + '</div>';
    h += '<details' + ((VIEW.open === i || isPC()) ? ' open' : '') + ' data-i="' + i + '"><summary>Détails du terrain</summary>';
    if (inprog) h += '<p class="small mute">Ce tournoi est en cours : le terrain est verrouillé.</p>';
    else if (lk) h += '<p class="small mute">Terrain barré : débarre-le avec le cadenas pour le modifier.</p>';
    h += '<label for="cn' + i + '">Nom du terrain</label><div class="acwrap"><input type="text" id="cn' + i + '" data-c="cname" data-i="' + i + '" data-ac="' + i + '" value="' + esc(c.name) + '" maxlength="40" autocomplete="off" spellcheck="false"' + (hasBank ? ' placeholder="Tape pour chercher dans ta liste"' : '') + ((inprog || lk) ? ' disabled' : '') + '><div class="acbox" id="ac' + i + '" role="listbox"></div></div>';
    if (!tbd) h += courseFields('c', i, c, inprog || lk, true);
    if (FUT && !tbd && !lk) h += '<button class="btn sec sm" data-a="futclr" data-i="' + i + '" style="margin-top:10px">Remettre au tirage</button>';
    h += '</details></div>';
  });
  return h + '</div>';
}
/* ---- Liste de terrains : fiches regroupées par nom (une entrée de BANK par tee) et formulaire de fiche ---- */
function bankGroups() {
  const co = new Intl.Collator('fr'), m = new Map();
  S.courseBank.forEach((c, i) => { const k = normName(c.name); if (!m.has(k)) m.set(k, { name: c.name, items: [] }); m.get(k).items.push({ c, i }); });
  const g = [...m.values()]; g.forEach(x => x.items.sort((a, b) => teeRank(a.c.tee) - teeRank(b.c.tee)));
  return g.sort((a, b) => co.compare(a.name, b.name));
}
function cfNew(name) {
  const f = { orig: null, name: '', pars: Array(18).fill(null), index: Array(18).fill(null), tees: {}, errs: [] };
  const its = name ? S.courseBank.filter(b => normName(b.name) === normName(name)) : [];
  if (its.length) {
    f.orig = its[0].name; f.name = its[0].name; f.pars = its[0].pars.slice(); f.index = its[0].index.slice();
    its.forEach(b => { f.tees[b.tee] = { y: b.dist, cr: b.cr, sl: b.slope }; });
  }
  return f;
}
const fmtCR = v => v == null ? '' : LANG === 'en' ? String(v) : String(v).replace('.', ',');
function cfTeeList(f) { return TEE_OPTIONS.concat(Object.keys(f.tees).filter(t => !TEE_OPTIONS.includes(t))); }
function cfDupIdx(f) { const c = {}; f.index.forEach(v => { if (v) c[v] = (c[v] || 0) + 1; }); return c; }
function cfParTot(f) { return f.pars.every(v => v) ? 'Par ' + f.pars.reduce((a, b) => a + b, 0) : 'Par –'; }
function vCourseForm(f) {
  const dup = cfDupIdx(f);
  let h = '<div class="block cform"><h3 style="margin-top:0">' + (f.orig ? 'Modifier le terrain' : 'Nouveau terrain') + '</h3>';
  h += '<label for="cfname">Nom du terrain</label><input type="text" id="cfname" data-cf="name" value="' + esc(f.name) + '" maxlength="40" autocomplete="off" placeholder="Ex. Le Versant – Griffon">';
  h += '<div class="sectlab cfsl">Trous <span id="cftot">' + cfParTot(f) + '</span></div>';
  [0, 9].forEach(o => {
    h += '<div class="holetable"><div class="htrow htlabel"><span>Trou</span>' + Array.from({ length: 9 }, (_, k) => '<span>' + (o + k + 1) + '</span>').join('') + '</div>' +
      '<div class="htrow"><span>Par</span>' + f.pars.slice(o, o + 9).map((v, k) => '<select data-cf="par" data-h="' + (o + k) + '" aria-label="Par du trou ' + (o + k + 1) + '"><option value=""' + (v ? '' : ' selected') + '>–</option>' + [3, 4, 5].map(x => '<option' + (x === v ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>').join('') + '</div>' +
      '<div class="htrow htidx"><span>Index</span>' + f.index.slice(o, o + 9).map((v, k) => '<input type="number" inputmode="numeric" min="1" max="18" data-cf="idx" data-h="' + (o + k) + '" aria-label="Index du trou ' + (o + k + 1) + '" value="' + (v || '') + '"' + (v && dup[v] > 1 ? ' class="dup"' : '') + '>').join('') + '</div></div>';
  });
  h += '<div class="pastewrap"><div><label for="cfparp">Coller les 18 par</label><input type="text" id="cfparp" data-cf="parp" placeholder="4 4 3 5…" autocomplete="off"></div><div><label for="cfidxp">Coller les 18 index</label><input type="text" id="cfidxp" data-cf="idxp" placeholder="7 13 1 15…" autocomplete="off"></div></div>';
  h += '<div class="sectlab">Tees</div><p class="small mute" style="margin:0 0 6px">Remplis seulement les tees qui existent sur ce terrain ; une ligne vide n’est pas ajoutée.</p>';
  h += '<table class="teetab"><thead><tr><th>Tee</th><th>Yardage</th><th>Course Rating</th><th>Slope Rating</th></tr></thead><tbody>' + cfTeeList(f).map(t => {
    const v = f.tees[t] || {};
    return '<tr><td>' + teeBadge(t) + '</td><td><input type="number" inputmode="numeric" min="1000" max="9000" data-cf="y" data-t="' + esc(t) + '" aria-label="Yardage ' + esc(t) + '" value="' + (v.y != null ? v.y : '') + '"></td>' +
      '<td><input type="text" inputmode="decimal" data-cf="cr" data-t="' + esc(t) + '" aria-label="Course Rating ' + esc(t) + '" value="' + fmtCR(v.cr) + '"></td>' +
      '<td><input type="number" inputmode="numeric" min="55" max="155" data-cf="sl" data-t="' + esc(t) + '" aria-label="Slope Rating ' + esc(t) + '" value="' + (v.sl != null ? v.sl : '') + '"></td></tr>';
  }).join('') + '</tbody></table>';
  h += '<div id="cferr">' + (f.errs.length ? '<ul class="cferr">' + f.errs.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul>' : '') + '</div>';
  h += '<div class="row cfbtns"><button type="button" class="btn" data-a="cfsave">' + (f.orig ? 'Enregistrer' : 'Ajouter à la liste') + '</button><button type="button" class="btn sec" data-a="cfcancel">Annuler</button></div></div>';
  return h;
}
function cfInput(el) {
  const f = VIEW.cf; if (!f) return;
  const k = el.dataset.cf, hIdx = +el.dataset.h, t = el.dataset.t;
  const num = v => { v = String(v).replace(/\s| /g, '').replace(',', '.'); return v === '' || isNaN(+v) ? null : +v; };
  if (k === 'name') f.name = el.value.trim();
  else if (k === 'par') { f.pars[hIdx] = el.value ? +el.value : null; const x = document.getElementById('cftot'); if (x) x.textContent = cfParTot(f); }
  else if (k === 'idx') {
    const v = Math.round(num(el.value)); f.index[hIdx] = v >= 1 && v <= 18 ? v : null; if (!f.index[hIdx]) el.value = '';
    const dup = cfDupIdx(f); document.querySelectorAll('[data-cf="idx"]').forEach(x => x.classList.toggle('dup', !!(f.index[+x.dataset.h] && dup[f.index[+x.dataset.h]] > 1)));
  }
  else if (k === 'parp' || k === 'idxp') {
    const nums = k === 'parp' ? (el.value.match(/[345]/g) || []).map(Number) : (el.value.match(/1[0-8]|[1-9]/g) || []).map(Number);
    if (nums.length === 18) { if (k === 'parp') f.pars = nums; else f.index = nums; render(); toast(k === 'parp' ? 'Par enregistrés' : 'Index enregistrés'); }
    else toast(k === 'parp' ? 'Il faut exactement 18 chiffres (3, 4 ou 5)' : 'Il faut exactement 18 chiffres de 1 à 18');
  }
  else if (t) { const o = f.tees[t] = f.tees[t] || {}; o[k] = num(el.value); if (k === 'cr' && o.cr != null) el.value = fmtCR(o.cr); }
}
function cfSave() {
  const f = VIEW.cf, errs = [];
  const name = (f.name || '').slice(0, 40);
  if (!name) errs.push('Entre le nom du terrain.');
  const clash = name && S.courseBank.some(b => normName(b.name) === normName(name)) && normName(name) !== normName(f.orig || '');
  if (clash) errs.push('« ' + name + ' » est déjà dans ta liste : utilise « Modifier » sur ce terrain.');
  const miss = f.pars.map((v, k) => v ? 0 : k + 1).filter(Boolean);
  if (miss.length) errs.push('Par manquant ' + (miss.length > 1 ? 'aux trous ' : 'au trou ') + miss.join(', ') + '.');
  let index = f.index;
  if (index.every(v => !v)) index = defaultIndex();
  else {
    const im = index.map((v, k) => v ? 0 : k + 1).filter(Boolean), dup = cfDupIdx(f), dv = Object.keys(dup).filter(v => dup[v] > 1);
    if (im.length) errs.push('Index manquant ' + (im.length > 1 ? 'aux trous ' : 'au trou ') + im.join(', ') + '.');
    if (dv.length) errs.push('Index en double : ' + dv.join(', ') + ' (chaque index de 1 à 18 une seule fois).');
  }
  const rows = [];
  cfTeeList(f).forEach(t => {
    const v = f.tees[t]; if (!v || (v.y == null && v.cr == null && v.sl == null)) return;
    const bad = [];
    if (!(v.y >= 1000 && v.y <= 9000)) bad.push('yardage (1000 à 9000)');
    if (!(v.cr >= 40 && v.cr <= 90)) bad.push('course rating (40 à 90)');
    if (!(v.sl >= 55 && v.sl <= 155)) bad.push('slope rating (55 à 155)');
    if (bad.length) errs.push('Tee ' + t + ' : ' + bad.join(', ') + '.'); else rows.push([t, v]);
  });
  if (!rows.length && !errs.some(e => e.startsWith('Tee '))) errs.push('Remplis au moins un tee (yardage, course rating et slope rating).');
  f.errs = errs;
  if (errs.length) { render(); const e = document.getElementById('cferr'); if (e) e.scrollIntoView({ block: 'center' }); return; }
  const old = normName(f.orig || name);
  for (let k = BANK.length - 1; k >= 0; k--) if (normName(BANK[k].name) === old) BANK.splice(k, 1);
  rows.forEach(([t, v]) => BANK.push({ name, tee: t, pars: f.pars.slice(), index: index.slice(), dist: Math.round(v.y), cr: Math.round(v.cr * 10) / 10, slope: Math.round(v.sl) }));
  bankSort(); const wasEdit = !!f.orig; VIEW.cf = null; persist(); render(); window.scrollTo(0, 0);
  toast((wasEdit ? 'Terrain mis à jour' : 'Terrain ajouté') + ' (' + rows.length + ' tee' + (rows.length > 1 ? 's' : '') + ')');
}
function vCourseBank() {
  if (VIEW.cf) return vCourseForm(VIEW.cf);
  let h = '<p class="mute small">Ta banque de terrains, commune à toutes tes parties : entre un terrain une fois avec tous ses tees, puis charge-le dans n’importe quel tournoi de la saison (nom, puis couleur des tees). Le vent et la position du drapeau se choisissent par tournoi.</p>';
  h += '<button class="btn sec" data-a="bankadd" style="margin-bottom:4px">+ Ajouter un terrain \u00e0 la liste</button>';
  h += '<div class="row bkio"><button type="button" class="btn sec sm" data-a="bankexp"' + (S.courseBank.length ? '' : ' disabled') + '>Exporter ma liste</button><label class="btn sec sm filebtn">Importer une liste<input type="file" id="bankimp" class="fileinp" data-c="bankimp"></label></div>' +
    (S.courseBank.length ? '<button type="button" class="btn sec sm" data-a="bankexpjs" style="width:100%;margin:4px 0 2px">Fichier pour un ami (terrains-data.js)</button><p class="small mute" style="margin:0 0 6px">Mets ce fichier dans le même dossier que le jeu : au premier lancement, sa liste de terrains sera déjà importée.</p>' : '') +
    '<details style="border-top:none;padding-top:0"><summary style="font-size:16px;color:var(--acc)">Le s\u00e9lecteur ne s\u2019ouvre pas ?</summary><p class="small mute">Ouvre le fichier de terrains (.json) dans une appli de texte, copie tout son contenu, puis colle-le ici.</p><textarea id="bankText" rows="4" placeholder="Colle ici le contenu du fichier de terrains"></textarea><button type="button" class="btn sec sm" style="width:100%;margin-top:8px" data-a="bankimptext">Importer le texte coll\u00e9</button></details>';
  if (!S.courseBank.length) return h + '<p class="mute">Aucun terrain enregistr\u00e9 pour l\u2019instant.</p>';
  h += '<input type="text" enterkeyhint="search" id="bq" class="bq" placeholder="Rechercher un terrain dans ta liste" value="' + esc(VIEW.bq || '') + '" autocomplete="off" spellcheck="false">';
  return h + '<div id="bklist">' + bankListHTML() + '</div>';
}
/* ---- Fichier de terrains (.json) : un terrain = nom, 18 par, 18 index et ses tees. Servira aussi de fichier commun dans la future version web. ---- */
function bankFileJSON() {
  const courses = bankGroups().map(g => { const c0 = g.items[0].c; return { name: g.name, pars: c0.pars, index: c0.index, tees: g.items.map(({ c }) => ({ tee: c.tee, yardage: c.dist, cr: c.cr, slope: c.slope })) }; });
  return '{"type":"carriere-golf-terrains","v":1,"exported":"' + new Date().toISOString().slice(0, 10) + '","courses":[\n' + courses.map(c => JSON.stringify(c)).join(',\n') + '\n]}\n';   // un terrain par ligne
}
function bankFileImport(text) {
  let o; try { o = JSON.parse(text); } catch (e) {
    // fichier terrains-data.js du jeu (window.CG_TERRAINS = {...};) : on lit l'objet qu'il contient
    const t = String(text || ''), k = t.indexOf('CG_TERRAINS'), i = t.indexOf('{', k < 0 ? 0 : k), j = t.lastIndexOf('}');
    try { o = i >= 0 && j > i ? JSON.parse(t.slice(i, j + 1)) : null; } catch (e2) { return null; }
  }
  const list = o && o.type === 'carriere-golf-terrains' && Array.isArray(o.courses) ? o.courses : (o && Array.isArray(o.courseBank) ? o.courseBank.map(c => ({ name: c.name, pars: c.pars, index: c.index, tees: [{ tee: c.tee, yardage: c.dist, cr: c.cr, slope: c.slope }] })) : null);
  if (!list) return null;
  let add = 0, upd = 0;
  const pos = new Map(); BANK.forEach((b, i) => pos.set(bankKey(b), i));   // index des cl\u00e9s : l'import reste rapide m\u00eame avec des milliers de terrains
  list.forEach(c => (c.tees || []).forEach(t => {
    if (!c.name || !Array.isArray(c.pars) || c.pars.length !== 18) return;
    const n = bankClean({ name: c.name, tee: t.tee, pars: c.pars, index: c.index, dist: t.yardage, cr: t.cr, slope: t.slope });
    const k = bankKey(n), at = pos.get(k);
    if (at != null) { BANK[at] = n; upd++; } else { pos.set(k, BANK.length); BANK.push(n); add++; }
  }));
  bankSort(); return { add, upd };
}
/* Liste incluse avec le jeu : ajoute seulement les terrains (tees) qui manquent sur cet appareil, une fois par version
   de la liste (date d'export + nombre de terrains) ; ne remplace jamais un terrain déjà là ni une modification. */
function preloadCourses() {
  const C = window.CG_TERRAINS; if (!C || !Array.isArray(C.courses)) return 0;
  const ver = (C.exported || '') + '/' + C.courses.length;
  let seen = null; try { seen = localStorage.getItem('golf-preload'); } catch (e) { }
  if (seen === ver && BANK.length) return 0;
  const have = new Set(BANK.map(bankKey)); let add = 0;
  // Liste d\u00e9j\u00e0 fusionn\u00e9e une fois : on n\u2019ajoute que les terrains plus r\u00e9cents (les suppressions restent)
  const seenExp = seen && BANK.length ? seen.split('/')[0] : null;
  C.courses.forEach(c => (seenExp !== null && !(c.since && c.since > seenExp) ? [] : (c.tees || [])).forEach(t => {
    if (!c.name || !Array.isArray(c.pars) || c.pars.length !== 18) return;
    const n = bankClean({ name: c.name, tee: t.tee, pars: c.pars, index: c.index, dist: t.yardage, cr: t.cr, slope: t.slope }), k = bankKey(n);
    if (have.has(k)) return; have.add(k); BANK.push(n); add++;
  }));
  if (add) { bankSort(); bankSave(); }
  try { localStorage.setItem('golf-preload', ver); } catch (e) { }
  return add;
}
function bankImportDone(r) {
  if (!r) { toast('Ce fichier n\u2019est pas une liste de terrains'); return; }
  persist(); render();
  toast((r.add ? r.add + ' tee' + (r.add > 1 ? 's' : '') + ' ajout\u00e9' + (r.add > 1 ? 's' : '') : '') + (r.add && r.upd ? ', ' : '') + (r.upd ? r.upd + ' mis \u00e0 jour' : '') || 'Aucun terrain import\u00e9');
}
function bankListHTML() {
  const all = bankGroups(), q = acNorm(VIEW.bq || '');
  const G = q ? (() => { const keep = new Set(bankSearch(VIEW.bq).map(i => normName(S.courseBank[i].name))); return all.filter(g => keep.has(normName(g.name))); })() : all;
  const N = VIEW.bn || 30, shown = G.slice(0, N);
  let h = '<p class="small mute bqn">' + (q ? G.length + ' terrain' + (G.length > 1 ? 's' : '') + ' trouv\u00e9' + (G.length > 1 ? 's' : '') + ' sur ' + all.length : all.length + ' terrain' + (all.length > 1 ? 's' : '') + ' dans ta liste') + '</p>';
  if (!G.length) return h;
  h += '<div class="dgrid">';
  shown.forEach(g => {
    const i = g.items[0].i, c0 = g.items[0].c;
    h += '<div class="block bcard"><div class="bchead"><b>' + esc(g.name) + '</b><span class="mute small">par ' + parTotal(c0.pars) + '</span></div>' +
      '<table class="bctees">' + g.items.map(({ c }) => '<tr><td>' + teeBadge(c.tee) + '</td><td class="r">' + c.dist.toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' v</td><td class="r">CR ' + fmtCR(c.cr) + '</td><td class="r">Slope ' + c.slope + '</td></tr>').join('') + '</table>';
    if (VIEW.bankDel === i) h += '<div class="bcdel"><p class="small"><b>Retirer ce terrain et ses ' + g.items.length + ' tee' + (g.items.length > 1 ? 's' : '') + ' ?</b> Les tournois qui l’ont déjà chargé ne changent pas.</p><div class="row"><button class="btn danger sm" data-a="bankdel2" data-i="' + i + '">Retirer</button><button class="btn sec sm" data-a="bankcancel">Annuler</button></div></div>';
    else h += '<div class="row bcbtns"><button class="btn sec sm" data-a="bankedit" data-i="' + i + '">Modifier</button><button class="btn sec sm" data-a="bankdel" data-i="' + i + '">Retirer</button></div>';
    h += '</div>';
  });
  h += '</div>';
  if (G.length > N) h += '<button class="btn sec" data-a="bankmore">Afficher plus (' + (G.length - N) + ' de plus)</button>';
  return h;
}

