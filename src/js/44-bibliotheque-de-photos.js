/* ============ v289 : BIBLIOTHÈQUE DE PHOTOS (planches Gemini + décors) ============
   Planches : grilles de golfeurs sur fond magenta, nommées origine_âge_carrure_NN (ex. brit_20-27_mince_01.png).
   Le jeu les découpe, efface le magenta, rogne et garde chaque golfeur (WebP transparent) dans IndexedDB 'igc-gfx'.
   Décors : decor_<clé>_NN.jpg. Chaque golfeur reçoit un visage de sa catégorie (g.ph) et un décor de sa région (g.bg),
   gardés toute sa carrière. La bibliothèque est commune à toutes les parties ; l'attribution est propre à chaque partie. */
const GFX = { db: null, ready: null, faces: [], bgs: [], urls: new Map(), busy: null, dir: null, on: true };
const PH_ORIG = { brit: 'Britanniques et Irlandais', nam: 'Nord-Américains (origine européenne)', nord: 'Europe du Nord', euro: 'Europe de l’Ouest et du Sud', easia: 'Asie de l’Est', afr: 'Afrique et Caraïbes', latam: 'Amérique latine', sasia: 'Asie du Sud', seasia: 'Asie du Sud-Est', mena: 'Moyen-Orient, Afrique du Nord, Asie centrale', pac: 'Pacifique et Maoris' };
const PH_BG = { brit: ['links', 'sunset'], nam: ['parkland', 'augusta', 'coastal', 'sunset'], nord: ['nordic', 'links'], euro: ['med', 'alpine', 'parkland'], easia: ['asia', 'parkland'], afr: ['savanna', 'tropical', 'parkland'], latam: ['latam', 'tropical'], sasia: ['tropical', 'desert', 'sunset'], seasia: ['tropical', 'asia'], mena: ['desert', 'med'], pac: ['tropical', 'coastal'] };
const PH_NAT = {
  brit: 'ENG SCO WAL NIR IRL IMN JEY GGY', nord: 'SWE NOR DEN FIN ISL FRO ALA GRL EST LAT LTU',
  euro: 'GER ESP ITA POR NED BEL AUT SUI LUX MON AND SMR LIE VAT MLT CYP GRE CZE SVK POL HUN SLO CRO SRB BIH MNE MKD ALB KOS ROU BUL UKR RUS BLR MDA GIB AZO MDR',
  easia: 'JPN KOR CHN TPE HKG MAC MGL PRK', seasia: 'THA PHI MAS INA SIN VIE CAM LAO MYA BRU TLS', sasia: 'IND PAK BAN SRI NEP BHU MDV AFG',
  mena: 'UAE KSA QAT OMA KUW BRN ISR JOR LIB SYR IRQ IRI TUR MAR ALG TUN LBA EGY KAZ UZB TKM KGZ TJK AZE ARM GEO PLE YEM ESH MTN SUD',
  latam: 'MEX ARG COL CHI VEN URU PER ECU BOL PAR BRA CRC PAN GUA HON ESA NIC CUB DOM PUR', pac: 'FIJ PNG SAM TGA SOL VAN KIR TUV NRU PLW FSM MHL COK NIU TKL WLF PYF NCA GUM ASA NMI RPN'
};
const PH_MIX = { US: [['nam', 75], ['afr', 13], ['latam', 9], ['easia', 3]], CAN: [['nam', 82], ['easia', 6], ['sasia', 6], ['afr', 6]], AUS: [['nam', 85], ['easia', 8], ['pac', 4], ['sasia', 3]], NZL: [['nam', 75], ['pac', 25]],
  RSA: [['nam', 55], ['afr', 45]], ENG: [['brit', 86], ['afr', 7], ['sasia', 7]], FRA: [['euro', 84], ['afr', 10], ['mena', 6]], NED: [['euro', 90], ['afr', 10]], GBR: [['brit', 100]], BRA: [['latam', 85], ['afr', 15]] };
function phNatCode(nat) { const n = NATIONS.find(x => x.name === nat); return n ? n.code : ''; }
function phOrigin(g) {
  const c = phNatCode(g.nat), mix = PH_MIX[c];
  if (mix) { let r = ((g.id * 2654435761) >>> 0) % 100; for (const [k, w] of mix) { if ((r -= w) < 0) return k; } return mix[0][0]; }
  for (const k in PH_NAT) if ((' ' + PH_NAT[k] + ' ').includes(' ' + c + ' ')) return k;
  const N = NATIONS.find(x => x.name === g.nat), reg = N ? N.region : '';
  return reg === 'asie' ? 'easia' : reg === 'amerique_latine' ? 'latam' : reg === 'oceanie' ? 'pac' : reg === 'afrique' || reg === 'caraibes' ? 'afr' : reg === 'eu_nord' ? 'nord' : 'euro';
}
const phAgeBand = a => a <= 27 ? '20-27' : a <= 36 ? '28-36' : '37-50';
function phBuild(g) { const b = g.bio; if (!b || !b.h) return 'moyen'; const bmi = b.w / ((b.h / 100) * (b.h / 100)); return bmi < 23.5 ? 'mince' : bmi < 27 ? 'moyen' : 'costaud'; }

/* ---- stockage ---- */
GFX.ready = new Promise(res => {
  try {
    const rq = indexedDB.open('igc-gfx', 1);
    rq.onupgradeneeded = () => { const d = rq.result; d.createObjectStore('faces'); d.createObjectStore('bgs'); d.createObjectStore('kv'); };
    rq.onsuccess = () => { GFX.db = rq.result; res(); };
    rq.onerror = () => res();
  } catch (e) { res(); }
});
const gfxOp = (store, op, k, v) => GFX.ready.then(() => new Promise(res => {
  if (!GFX.db) { res(null); return; }
  try { const st = GFX.db.transaction(store, op === 'get' || op === 'all' || op === 'keys' ? 'readonly' : 'readwrite').objectStore(store);
    const r = op === 'get' ? st.get(k) : op === 'all' ? st.getAll() : op === 'keys' ? st.getAllKeys() : op === 'del' ? st.delete(k) : op === 'clear' ? st.clear() : st.put(v, k);
    r.onsuccess = () => res(op === 'put' || op === 'del' || op === 'clear' ? true : r.result); r.onerror = () => res(null);
  } catch (e) { res(null); }
}));
/* index en mémoire (sans les images) */
async function gfxLoadIndex() {
  const idx = await gfxOp('kv', 'get', 'index');
  GFX.faces = (idx && idx.faces) || []; GFX.bgs = (idx && idx.bgs) || []; GFX.seen = (idx && idx.seen) || {};
  try { GFX.dir = await gfxOp('kv', 'get', 'dir'); } catch (e) { }
  try { const on = localStorage.getItem('igc-photos'); GFX.on = on !== '0'; } catch (e) { }
}
const gfxSaveIndex = () => gfxOp('kv', 'put', 'index', { faces: GFX.faces, bgs: GFX.bgs, seen: GFX.seen });

/* ---- traitement d'une planche ---- */
function gfxLoadImg(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => { res(i); setTimeout(() => URL.revokeObjectURL(u), 1000); }; i.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); }; i.src = u; }); }
const gfxBlob = (cv, type, q) => new Promise(res => cv.toBlob(b => res(b), type, q));
function gfxBands(prof, len) {   // bandes blanches internes (gouttières) : [début, fin]
  const out = []; let s = -1;
  for (let p = 0; p < len; p++) { const on = prof[p] > 0.6; if (on && s < 0) s = p; if (!on && s >= 0) { if (s > len * 0.06 && p < len * 0.94) out.push([s, p - 1]); s = -1; } }
  return out;
}
async function gfxCutSheet(file, meta) {
  const img = await gfxLoadImg(file), W = img.naturalWidth, H = img.naturalHeight;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  const D = cx.getImageData(0, 0, W, H).data, wh = (x, y) => { const i = (y * W + x) * 4; return D[i] > 222 && D[i + 1] > 222 && D[i + 2] > 222; };
  const colW = new Float32Array(W), rowW = new Float32Array(H);
  for (let x = 0; x < W; x++) { let n = 0, t = 0; for (let y = 0; y < H; y += 3) { t++; if (wh(x, y)) n++; } colW[x] = n / t; }
  for (let y = 0; y < H; y++) { let n = 0, t = 0; for (let x = 0; x < W; x += 3) { t++; if (wh(x, y)) n++; } rowW[y] = n / t; }
  const cb = gfxBands(colW, W), rb = gfxBands(rowW, H);
  const spans = (b, len) => { const s = []; let a = 0; b.forEach(([p, q]) => { s.push([a, p]); a = q + 1; }); s.push([a, len]); return s.filter(([p, q]) => q - p > len * 0.12); };
  const xs = spans(cb, W), ys = spans(rb, H), out = [];
  for (let ri = 0; ri < ys.length; ri++) for (let ci = 0; ci < xs.length; ci++) {
    let [x0, x1] = xs[ci], [y0, y1] = ys[ri]; x0 += 4; x1 -= 4; y0 += 4; y1 -= 4;
    const w = x1 - x0, h = y1 - y0; if (w < 40 || h < 60) continue;
    const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const g = c2.getContext('2d', { willReadFrequently: true }); g.drawImage(cv, x0, y0, w, h, 0, 0, w, h);
    const im = g.getImageData(0, 0, w, h), d = im.data; let opaque = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2], mag = Math.min(r, b) - gg;
      if (mag > 110) { d[i + 3] = 0; continue; }
      if (mag > 28) { d[i + 3] = Math.round(255 * (1 - (mag - 28) / 82)); }
      if (mag > 8) { const m = mag * 0.95; d[i] = Math.max(gg, r - m); d[i + 2] = Math.max(gg, b - m); }   // retrait du reflet rose
      opaque++;
    }
    // nettoyage des franges : un pixel semi-transparent entouré de transparence disparaît
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = (y * w + x) * 4; if (d[i + 3] > 0 && d[i + 3] < 200) { let z = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, bq]) => { if (d[((y + bq) * w + x + a) * 4 + 3] === 0) z++; }); if (z >= 2) d[i + 3] = Math.round(d[i + 3] * 0.4); } }
    g.putImageData(im, 0, 0);
    if (opaque < w * h * 0.06) continue;   // case vide
    let top = h, l = w, rr = 0, bot = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 60) { if (y < top) top = y; if (y > bot) bot = y; if (x < l) l = x; if (x > rr) rr = x; }
    const tw = rr - l + 1, th = bot - top + 1; if (tw < 20 || th < 40) continue;
    // tête : moyenne des colonnes opaques sur les 14 % du haut
    let sx = 0, sn = 0; const hh = Math.max(4, Math.round(th * 0.14)); for (let y = top; y < top + hh; y++) for (let x = l; x <= rr; x++) if (d[(y * w + x) * 4 + 3] > 120) { sx += x; sn++; }
    const hx = sn ? (sx / sn - l) / tw : 0.5;
    const sc = Math.min(1, 520 / th), c3 = document.createElement('canvas'); c3.width = Math.round(tw * sc); c3.height = Math.round(th * sc);
    const g3 = c3.getContext('2d'); g3.imageSmoothingQuality = 'high'; g3.drawImage(c2, l, top, tw, th, 0, 0, c3.width, c3.height);
    let blob = await gfxBlob(c3, 'image/webp', 0.86); if (!blob || blob.type !== 'image/webp') blob = await gfxBlob(c3, 'image/png');
    out.push({ blob, hx: Math.round(hx * 1000) / 1000, ar: Math.round(c3.width / c3.height * 1000) / 1000, cell: ri * xs.length + ci });
  }
  return out;
}
async function gfxBgFile(file) {
  const img = await gfxLoadImg(file), sc = Math.min(1, 1100 / img.naturalHeight), cv = document.createElement('canvas');
  cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc); const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, cv.width, cv.height);
  return await gfxBlob(cv, 'image/jpeg', 0.84);
}
const PH_RX = /^([a-z]+)_(?:(\d+-\d+)_)?(mince|moyen|costaud)_(\d+)/i, BG_RX = /^decor_([a-z]+)_(\d+)/i;
/* importe une liste de fichiers ; kind : 'faces', 'bgs' ou 'auto' (selon le nom) */
async function gfxImport(files, kind, onProg) {
  await GFX.ready; if (!GFX.db) { toast('Le navigateur refuse le stockage des photos ici'); return { f: 0, b: 0, skip: 0, bad: [] }; }
  let f = 0, b = 0, skip = 0; const bad = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i], nm = file.name.replace(/\.[a-z0-9]+$/i, ''), sig = file.name + '|' + file.size;
    if (onProg) onProg(i, files.length, file.name);
    if (GFX.seen[sig]) { skip++; continue; }
    try {
      const m = PH_RX.exec(nm), mb = BG_RX.exec(nm);
      if (m && kind !== 'bgs' && PH_ORIG[m[1].toLowerCase()]) {
        const cells = await gfxCutSheet(file);
        for (const c of cells) { const key = nm.toLowerCase() + '#' + c.cell; await gfxOp('faces', 'put', key, c.blob); GFX.faces = GFX.faces.filter(x => x.k !== key); GFX.faces.push({ k: key, o: m[1].toLowerCase(), a: m[2] || '26-35', b: m[3].toLowerCase(), hx: c.hx, ar: c.ar }); f++; }
        if (!cells.length) bad.push(file.name);
      } else if (mb && kind !== 'faces') {
        const key = nm.toLowerCase(); await gfxOp('bgs', 'put', key, await gfxBgFile(file)); GFX.bgs = GFX.bgs.filter(x => x.k !== key); GFX.bgs.push({ k: key, t: mb[1].toLowerCase() }); b++;
      } else { bad.push(file.name); continue; }
      GFX.seen[sig] = 1;
      if ((i % 5) === 4) await gfxSaveIndex();
    } catch (e) { bad.push(file.name); }
  }
  await gfxSaveIndex();
  return { f, b, skip, bad };
}
/* dossier Graphics (PC) : Faces/ et Backgrounds/ */
async function gfxPickDir() {
  try { const d = await window.showDirectoryPicker({ id: 'igc-graphics', mode: 'read' }); GFX.dir = d; await gfxOp('kv', 'put', 'dir', d); return d; } catch (e) { return null; }
}
async function gfxSyncDir(ask) {
  if (!GFX.dir || GFX.busy) return null;
  try {
    let p = await GFX.dir.queryPermission({ mode: 'read' });
    if (p !== 'granted' && ask) p = await GFX.dir.requestPermission({ mode: 'read' });
    if (p !== 'granted') return null;
    const files = [];
    const walk = async (dir, depth) => { for await (const [name, h] of dir.entries()) { if (h.kind === 'file' && /\.(png|jpe?g|webp)$/i.test(name)) { const f = await h.getFile(); if (!GFX.seen[f.name + '|' + f.size]) files.push(f); } else if (h.kind === 'directory' && depth < 2) await walk(h, depth + 1); } };
    await walk(GFX.dir, 0);
    if (!files.length) return { f: 0, b: 0, skip: 0, bad: [] };
    return await gfxRun(files, 'auto');
  } catch (e) { return null; }
}
async function gfxRun(files, kind) {
  GFX.busy = { i: 0, n: files.length, name: '' }; gfxProgUI();
  const r = await gfxImport(files, kind, (i, n, name) => { GFX.busy = { i, n, name }; gfxProgUI(); });
  GFX.busy = null; gfxProgUI();
  if (r.f || r.b) { phAssignAll(); persist(); }
  toast((r.f ? r.f + ' golfeur' + (r.f > 1 ? 's' : '') + ' ajouté' + (r.f > 1 ? 's' : '') : '') + (r.f && r.b ? ' · ' : '') + (r.b ? r.b + ' décor' + (r.b > 1 ? 's' : '') : '') + (!r.f && !r.b ? 'Aucune nouvelle image' : '') + (r.bad.length ? ' · ' + r.bad.length + ' fichier' + (r.bad.length > 1 ? 's' : '') + ' ignoré' + (r.bad.length > 1 ? 's' : '') : ''));
  if (VIEW && (VIEW.name === 'more' || VIEW.name === 'golfer')) render();
  return r;
}
function gfxProgUI() { const el = document.getElementById('gfxprog'); if (!el) return; const B = GFX.busy; el.hidden = !B; if (B) el.textContent = 'Traitement ' + (B.i + 1) + ' sur ' + B.n + ' · ' + B.name; }

/* ---- attribution ---- */
/* v298 : les retraités gardent leur photo pour toujours. On évite d'abord toutes les photos déjà prises (actifs et retraités) ;
   si la catégorie est épuisée, un nouveau golfeur peut reprendre la photo d'un retraité (jamais celle d'un golfeur actif). */
function phUsed() { const u = new Set(); Object.values(S.G).forEach(g => { if (g && g.ph) u.add(g.ph); }); return u; }
function phOldUsed() { const u = new Set(); if (S.old) Object.values(S.old).forEach(o => { if (o && o.ph) u.add(o.ph); }); return u; }
function phPick(g, used, avoid) {
  const o = g.pho || (g.pho = phOrigin(g)), b = phBuild(g);
  const tiers = [x => x.o === o && x.b === b, x => x.o === o];   // une seule tranche d'âge : le golfeur garde sa photo toute sa carrière
  const old = phOldUsed();
  for (const ok of [x => !old.has(x.k), () => true]) for (const t of tiers) { const L = GFX.faces.filter(x => t(x) && ok(x) && !used.has(x.k) && x.k !== avoid); if (L.length) return L[((g.id * 40503) >>> 0) % L.length].k; }
  return null;
}
function bgPick(g, avoid) {
  if (!GFX.bgs.length) return null; const o = g.pho || (g.pho = phOrigin(g)), pref = PH_BG[o] || [];
  for (const t of pref) { const L = GFX.bgs.filter(x => x.t === t && x.k !== avoid); if (L.length) return L[((g.id * 2246822519) >>> 0) % L.length].k; }
  const L = GFX.bgs.filter(x => x.t !== 'stadium' && x.k !== avoid); return L.length ? L[((g.id * 2246822519) >>> 0) % L.length].k : null;
}
function phAssignAll() {
  if (!S || !S.G || !GFX.faces.length && !GFX.bgs.length) return 0;
  const used = phUsed(), have = new Set(GFX.faces.map(x => x.k)), hb = new Set(GFX.bgs.map(x => x.k)); let n = 0;
  Object.values(S.G).sort((a, b) => a.id - b.id).forEach(g => {
    if (!g) return;
    if (g.ph && !have.has(g.ph)) delete g.ph;
    if (!g.ph && GFX.faces.length) { const k = phPick(g, used); if (k) { g.ph = k; used.add(k); n++; } }
    if (g.bg && !hb.has(g.bg)) delete g.bg;
    if (!g.bg && GFX.bgs.length) g.bg = bgPick(g) || undefined;
  });
  return n;
}
/* ---- affichage ---- */
async function gfxUrl(store, k) {
  const ck = store + ':' + k; if (GFX.urls.has(ck)) return GFX.urls.get(ck);
  const blob = await gfxOp(store, 'get', k); if (!blob) return null; const u = URL.createObjectURL(blob); GFX.urls.set(ck, u); return u;
}
function phRec(id) { return S.G[id] || (S.old && S.old[id]) || null; }
function phFrameHTML(id, cls) {
  const g = phRec(id); if (!GFX.on || !g || !g.ph) return '';
  const f = GFX.faces.find(x => x.k === g.ph); if (!f) return '';
  return '<div class="phf ' + (cls || '') + '" data-phf="' + id + '"><div class="phbg"' + (g.bg ? ' data-bg="' + esc(g.bg) + '"' : '') + '></div><img class="phg" alt="' + esc(nameOf(id)) + '" data-face="' + esc(g.ph) + '">' + (g.nat ? '<span class="phflag" title="' + esc(g.nat) + '">' + flagVisual(g.nat, 30) + '</span>' : '') + '</div>';
}
function phHydrate() {
  if (!GFX.on) return;
  document.querySelectorAll('[data-face]:not([src])').forEach(async im => { const u = await gfxUrl('faces', im.dataset.face); if (u) im.src = u; });
  document.querySelectorAll('.phbg[data-bg]').forEach(async el => { if (el.dataset.ok) return; el.dataset.ok = 1; const u = await gfxUrl('bgs', el.dataset.bg); if (u) el.style.backgroundImage = 'url(' + u + ')'; });
}
/* ---- Options ---- */
function gfxOptHTML() {
  const by = {}; GFX.faces.forEach(x => { by[x.o] = (by[x.o] || 0) + 1; });
  const bt = {}; GFX.bgs.forEach(x => { bt[x.t] = (bt[x.t] || 0) + 1; });
  const assigned = S && S.G ? Object.values(S.G).filter(g => g && g.ph).length : 0, tot = S && S.G ? Object.keys(S.G).length : 0;
  let h = '<div class="block"><h3 style="margin-top:0">Photos des golfeurs</h3>' +
    '<label class="crftog"><input type="checkbox" data-c="phon"' + (GFX.on ? ' checked' : '') + '>Afficher les photos</label>' +
    '<p class="small mute" style="margin:6px 0 10px">Bibliothèque : <b>' + GFX.faces.length.toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + '</b> golfeurs · <b>' + GFX.bgs.length + '</b> décors. ' + assigned + ' golfeurs sur ' + tot + ' ont une photo dans cette partie.</p>';
  if (canPickDir()) h += '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" data-a="gfxdir">' + (GFX.dir ? 'Synchroniser le dossier ' + esc(GFX.dir.name) : 'Choisir le dossier Graphics') + '</button>' + (GFX.dir ? '<button class="btn sec sm" data-a="gfxdir2">Changer de dossier</button>' : '') + '</div><p class="small mute" style="margin:4px 0 10px">Choisis le dossier Graphics une seule fois : le jeu lit les nouvelles planches et les nouveaux décors chaque fois que tu le synchronises.</p>';
  h += '<div class="row" style="gap:8px;flex-wrap:wrap"><label class="btn sec sm filebtn">Importer des planches<input type="file" class="fileinp" data-c="gfxfaces" accept="image/*" multiple></label><label class="btn sec sm filebtn">Importer des décors<input type="file" class="fileinp" data-c="gfxbgs" accept="image/*" multiple></label></div>' +
    '<p class="small mute" id="gfxprog" style="margin:6px 0 0"' + (GFX.busy ? '' : ' hidden') + '></p>';
  if (GFX.faces.length || GFX.bgs.length) h += '<details style="margin-top:10px"><summary>Détail de la bibliothèque</summary><table class="plain">' + Object.keys(PH_ORIG).map(k => '<tr><td>' + PH_ORIG[k] + '</td><td class="r">' + (by[k] || 0) + '</td></tr>').join('') + '</table><p class="small mute">Décors : ' + (Object.keys(bt).map(k => k + ' ' + bt[k]).join(' · ') || 'aucun') + '</p>' +
    (VIEW.gfxClear ? '<div class="row" style="gap:8px"><button class="btn danger sm" data-a="gfxclear2">Tout effacer</button><button class="btn sec sm" data-a="gfxclear0">Annuler</button></div>' : '<button class="btn sec sm" data-a="gfxclear">Vider la bibliothèque</button>') + '</details>';
  return h + '</div>';
}

