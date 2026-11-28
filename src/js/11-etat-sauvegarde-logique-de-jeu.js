/* ============ ÉTAT, SAUVEGARDE, LOGIQUE DE JEU ============ */
let S = null;                 // état de la partie
let VIEW = { name: 'home' };
let MODEL = null;
let REVEAL = null;            // dévoilement séquentiel des scores IA après un trou : { k, order, shown, timer }
const $app = document.getElementById('app');
const $tabs = document.getElementById('tabs');

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = v => v === 0 ? 'E' : (v > 0 ? '+' + v : '\u2212' + Math.abs(v));
const cls = v => v < 0 ? 'u' : '';
const ord = n => LANG === 'en' ? n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th') : n === 1 ? '1er' : n + 'e';
const sum = a => a.reduce((x, y) => x + y, 0);
const clone = o => JSON.parse(JSON.stringify(o));

function addEarnings(id, amt) {
  if (!amt) return;
  if (id === 0) S.pk.earn = (S.pk.earn || 0) + amt;
  const g = S.G[id]; if (g) g.ce = (g.ce || 0) + amt;
}
function nameOf(id) {
  if (id === 0) return S.name;
  const g = S.G[id]; if (g) return g.n;
  const o = S.old[id]; return o ? o.n : '?';
}
function leagueOf(id) { for (let l = 0; l < 4; l++) if (S.L[l].includes(id)) return l; return -1; }
/* v249 : le joueur peut commencer dans la classe de recrues (ligue virtuelle 4 : sans coupure, points ni bourse) */
const plRc = () => !!(S && S.rcl && S.rcl.s === S.season && S.rcl.ids.includes(0));
function plLeague() { const l = leagueOf(0); return l < 0 && plRc() ? 4 : l; }
const lgSh = l => l === 4 ? 'Recrues' : LEAGUE_SHORT[l];
function plJoinRc() {
  if (!S.rcl || S.rcl.s !== S.season) {   // aucune classe cette saison (nouveau circuit) : on en forme une
    const used = new Set(S.used), ids = [];
    for (let k = 0; k < 50; k++) { const g = newRookie(S.nextId++, used); g.rcl = S.season; S.G[g.id] = g; ids.push(g.id); }
    S.used = Array.from(used); S.rcl = { s: S.season, ids };
  }
  if (!S.rcl.ids.includes(0)) S.rcl.ids.push(0);
  if (S.G[0]) S.G[0].rcl = S.season;
  S.st[0] = S.st[0] || newStanding();
}
const rcX = id => { const g = hcHolder(id); return g && g.hc && g.hc.x != null ? g.hc.x : 99; };
const vLg = () => { const p = plLeague(); return p === 4 ? 3 : Math.max(0, p); };   // ligue à afficher par défaut (Ligue 1 si le joueur est à la retraite)
function getSt(id) { return S.st[id] || (S.st[id] = newStanding()); }
function rankedIds(l) { return rankIds(S.L[l], S.st); }
/* Un golfeur promu en cours de saison reste au classement de la ligue qu'il a quittée (« promu »), avec les points
   gagnés dans cette ligue : il peut donc y être sacré champion. Il ne prend pas de place de promotion de fin de saison. */
function ghostIds(l) {
  const out = [], inL = new Set(S.L[l]);
  const keys = Object.keys(S.G); if (!S.G[0] && S.pk && S.pk.mv) keys.push('0');
  keys.forEach(k => { const id = +k, g = gmv(id); if (!g || !g.mv || inL.has(id)) return; if ((g.mv.moves || [{ fromL: g.mv.fromL, type: g.mv.type }]).some(m => m.fromL === l && m.type === 'up')) out.push(id); });
  return out;
}
function ghostSt(id, l) {
  const mv = gmv(id).mv, ms = mv.moves || [];
  let i = -1; ms.forEach((m, k) => { if (m.fromL === l && m.type === 'up') i = k; });
  const m = ms[i], pv = i > 0 ? ms[i - 1] : null;
  if (m && m.w != null) return { pts: m.pts - (pv ? pv.pts : 0), w: m.w - (pv ? pv.w || 0 : 0), t10: m.t10 - (pv ? pv.t10 || 0 : 0) };
  const o = { pts: 0, w: 0, t10: 0 }, H = S.hist[S.season - 1];   // anciennes sauvegardes : on relit les tournois de la saison
  if (H) H.t.forEach(t => { if (!t) return; const x = tRowMap(t).get(id); if (x && x[0] === l) { const r = x[1]; o.pts += r[4]; if (r[1] === 1) o.w++; if (r[1] > 0 && r[1] <= 10) o.t10++; } });
  return o;
}
function rankAll(l) {
  if (l === 4) return (S.rcl && S.rcl.s === S.season ? S.rcl.ids : []).filter(id => id === 0 || S.G[id]).map(id => ({ id, pts: 0, w: 0, t10: 0, gh: 0 })).sort((a, b) => rcX(a.id) - rcX(b.id) || tieHash(a.id) - tieHash(b.id));   // v249 : la classe se classe à l'index
  const st = S.st, avgOf = id => st[id] && st[id].rds ? st[id].sum / st[id].rds : 99;
  const list = S.L[l].map(id => { const t = lgSt(id); return { id, pts: t.pts, w: t.w, t10: t.t10, gh: 0 }; })
    .concat(ghostIds(l).map(id => Object.assign({ id, gh: 1 }, ghostSt(id, l))));
  return list.sort((a, b) => (b.pts - a.pts) || (b.w - a.w) || (avgOf(a.id) - avgOf(b.id)) || (tieHash(a.id) - tieHash(b.id)));
}
function seasonRank(l, id) { return rankAll(l).findIndex(r => r.id === id) + 1; }
function displayRank(l) {   // pour l'affichage seulement : tout le monde est visible, tri\u00e9 par points, mais un golfeur d\u00e9plac\u00e9 en cours de saison ne consomme pas de rang
  let L = rankAll(l);
  // v262 : saison pas encore commencée (aucun tournoi joué) : classement par handicap, du meilleur au moins bon
  const H = S.hist[S.season - 1];
  if (l !== 4 && H && !(H.t || []).some(t => t)) { const hx = id => { const g = hcHolder(id), x = g && g.hc && g.hc.hi && g.hc.hi.length ? g.hc.x : null; return x == null ? 99 : x; }; L = L.slice().sort((a, b) => hx(a.id) - hx(b.id) || a.id - b.id); }
  return L.map((r, i) => Object.assign(r, { idx: i + 1, mv: !r.gh && !!(gmv(r.id) && gmv(r.id).mv) }));
}

/* ---- Sauvegarde : IndexedDB, avec repli localStorage ---- */
const DB = { db: null, mode: 'mem', ready: null };
DB.ready = new Promise(res => {
  try {
    const rq = indexedDB.open('golf-carriere', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
    rq.onsuccess = () => { DB.db = rq.result; DB.mode = 'idb'; res(); };
    rq.onerror = () => { DB.mode = 'ls'; res(); };
  } catch (e) { DB.mode = 'ls'; res(); }
});
/* Fichier ouvert hors d'un site (ex. depuis Google Drive dans Chrome) : le navigateur peut refuser tout stockage.
   On le dit clairement au lieu de perdre la partie en silence. */
let NOAUTO = false;
function noAutoSave() {
  if (NOAUTO) return; NOAUTO = true;
  const d = document.createElement('div'); d.id = 'noauto';
  d.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:9999;background:#7A2A1E;color:#fff;font:600 14px/1.35 system-ui,sans-serif;padding:10px 38px 10px 12px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.35)';
  d.innerHTML = 'Ce navigateur ne garde pas ta partie automatiquement ici. Utilise \u00ab Sauvegarder la partie \u00bb (onglet Plus) avant de fermer, ou ouvre plut\u00f4t le lien du jeu.<button type="button" aria-label="Fermer" style="position:absolute;right:6px;top:6px;background:none;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer">\u00d7</button>';
  d.querySelector('button').onclick = () => d.remove();
  (document.body ? Promise.resolve() : new Promise(r => addEventListener('DOMContentLoaded', r))).then(() => document.body.appendChild(d));
}
DB.ready.then(() => { if (DB.mode === 'idb') return; try { localStorage.setItem('golf-test', '1'); localStorage.removeItem('golf-test'); } catch (e) { noAutoSave(); } });
/* Deux parties gard\u00e9es c\u00f4te \u00e0 c\u00f4te : ta carri\u00e8re ('save') et la partie Duo ('save-duo'). */
let SLOT = (() => { try { return localStorage.getItem('golf-slot') === 'save-duo' ? 'save-duo' : 'save'; } catch (e) { return 'save'; } })();
const lsKey = k => 'golf-carriere' + (k === 'save-duo' ? '-duo' : '');
function setSlot(k) { SLOT = k === 'save-duo' ? 'save-duo' : 'save'; try { localStorage.setItem('golf-slot', SLOT); } catch (e) { } }
function dbGet(key) {
  key = key || SLOT;
  return DB.ready.then(() => new Promise(res => {
    if (DB.mode === 'idb') {
      try { const r = DB.db.transaction('kv').objectStore('kv').get(key); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); } catch (e) { res(null); }
    } else { try { const t = localStorage.getItem(lsKey(key)); res(t ? JSON.parse(t) : null); } catch (e) { res(null); } }
  }));
}
/* Changer de partie : la partie en cours est enregistr\u00e9e, puis l'autre est charg\u00e9e (ou cr\u00e9\u00e9e). */
async function switchSlot(k) {
  persistNow(); setSlot(k); S = null; NAV = [];
  const saved = await dbGet();
  if (saved && saved.G && saved.L) { loadState(saved); VIEW = { name: 'home' }; }
  else VIEW = { name: 'new', mode: SLOT === 'save-duo' ? 'duo' : 'manual' };
  render(); window.scrollTo(0, 0);
}
/* Partie Duo cach\u00e9e : 5 touches rapides sur \u00ab Mode \u00bb (cr\u00e9ation de partie) l'activent ou la cachent sur cet appareil. */
function duoOn() { if (SLOT === 'save-duo') return true; try { return localStorage.getItem('golf-duo') === '1'; } catch (e) { return false; } }
let DUO_TAPS = [];
function duoKey() {
  const n = Date.now(); DUO_TAPS = DUO_TAPS.filter(t => n - t < 2500); DUO_TAPS.push(n);
  if (DUO_TAPS.length < 5) return; DUO_TAPS = [];
  const on = !duoOn(); try { localStorage.setItem('golf-duo', on ? '1' : '0'); } catch (e) { }
  if (!on && VIEW.mode === 'duo') VIEW.mode = 'manual';
  toast(on ? 'Partie Duo activ\u00e9e' : 'Partie Duo cach\u00e9e'); render();
}
function slotSwitchHTML() {
  if (!duoOn()) return '';
  return SLOT === 'save-duo' ? '<a href="#" data-a="slot" data-v="save">\u2190 Retour \u00e0 ma carri\u00e8re</a>' : '<a href="#" data-a="slot" data-v="save-duo">Partie Duo \u2192</a>';
}
let saveTimer = null;
/* La liste de terrains est enregistr\u00e9e \u00e0 part ('bank') : on ne la recopie pas dans chaque sauvegarde de la partie. */
const saveObj = () => Object.assign({}, S, { courseBank: [] });
function persistNow() {
  clearTimeout(saveTimer); if (!S) return;
  if (DB.mode === 'idb') { try { DB.db.transaction('kv', 'readwrite').objectStore('kv').put(saveObj(), SLOT); } catch (e) { } }
  else { try { localStorage.setItem(lsKey(SLOT), JSON.stringify(saveObj())); } catch (e) { } }
  bankSave();
}
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!S || NOSAVE) return;
    const k = SLOT, o = saveObj();
    if (DB.mode === 'idb') { try { DB.db.transaction('kv', 'readwrite').objectStore('kv').put(o, k); } catch (e) { } }
    else { try { localStorage.setItem(lsKey(k), JSON.stringify(o)); } catch (e) { noAutoSave(); } }
    bankSave();
  }, 250);
}
/* ---- Liste de terrains commune \u00e0 toutes les parties : enregistr\u00e9e \u00e0 part de la sauvegarde ('bank'),
   pour qu'une nouvelle partie la retrouve. S.courseBank pointe vers ce m\u00eame tableau (copie gard\u00e9e dans la sauvegarde). */
let BANK = [];
const bankKey = c => normName(c.name) + '|' + normName(c.tee);
function bankClean(c) {
  const n = newBankCourse(String(c.name || '').trim().slice(0, 40) || 'Nouveau terrain');
  if (c.tee) n.tee = canonTee(c.tee) || String(c.tee).trim().slice(0, 20);
  if (Array.isArray(c.pars) && c.pars.length === 18 && c.pars.every(x => x >= 3 && x <= 5)) n.pars = c.pars.map(Number);
  if (Array.isArray(c.index) && c.index.length === 18) n.index = c.index.map(x => Math.max(1, Math.min(18, +x || 1)));
  if (c.dist != null) n.dist = Math.max(1000, Math.min(9000, +c.dist || n.dist));
  if (c.cr != null) n.cr = Math.max(40, Math.min(90, +c.cr || n.cr));
  if (c.slope != null) n.slope = Math.max(55, Math.min(155, +c.slope || n.slope));
  return n;
}
function bankMerge(list) {
  if (!Array.isArray(list) || list === BANK) return;
  const have = new Set(BANK.map(bankKey));
  list.forEach(c => { if (!c || !c.name) return; const k = bankKey(c); if (have.has(k)) return; have.add(k); BANK.push(bankClean(c)); });
}
function bankSort() { const co = new Intl.Collator('fr'); BANK.sort((a, b) => co.compare(a.name, b.name) || teeRank(a.tee) - teeRank(b.tee) || co.compare(a.tee, b.tee)); }
function bankLoad() {
  return DB.ready.then(() => new Promise(res => {
    if (DB.mode === 'idb') { try { const r = DB.db.transaction('kv').objectStore('kv').get('bank'); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); } catch (e) { res([]); } }
    else { try { const t = localStorage.getItem('golf-bank'); res(t ? JSON.parse(t) : []); } catch (e) { res([]); } }
  }));
}
function bankSave() {
  if (DB.mode === 'idb') { try { DB.db.transaction('kv', 'readwrite').objectStore('kv').put(BANK, 'bank'); } catch (e) { } }
  else { try { localStorage.setItem('golf-bank', JSON.stringify(BANK)); } catch (e) { } }
}

/* ---- Nouvelle partie ---- */
function initExtras() {
  S.cfg = Object.assign({}, DEFAULT_CFG, S.cfg || {});
  ensureWL();
  { // tables de probabilités : les événements rares y figurent maintenant (colonnes 0 et 6)
    const T = S.settings.tables, r3 = x => Math.round(x * 1000) / 1000, c = S.cfg;
    if (S.settings.tv !== 2) {
      T[3][0] = r3(100 / (c.aceN || 2800)); T[4][0] = r3(100 / (c.e4N || 1000)); T[5][6] = r3(100 / (c.albN || 18000));
      delete c.aceN; delete c.e4N; delete c.albN; S.settings.tv = 2;
    }
    if (T[5].length < 7) T[5][6] = 0.006;
  }
  Object.values(S.G || {}).forEach(g => {   // traits de carrière (anciennes sauvegardes)
    if (g.pk != null) return;
    g.pk = clamp(Math.round(29 + gauss() * 2.4), 25, 35); g.dr = Math.exp(gauss() * 0.32); g.ri = Math.exp(gauss() * 0.3);
    g.sg = 0; g.cs = Math.max(1, g.a - 17); g.op = g.o + (g.a > 31 ? (g.a - 31) * (4 + Math.random() * 8) : 0);
  });
  Object.values(S.G || {}).forEach(g => { if (g.pt == null) { if (g.a >= (g.pk || 29)) { g.pt = g.p; g.dv = 1; g.lb = 0; g.pw = 0; g.pm = 1; } else initDev(g); } });   // développement individuel (anciennes sauvegardes)
  if (S.settings.cv !== 3) { if (S.settings.cut === 69) S.settings.cut = DEFAULT_CUT; S.settings.cv = 3; }   // ancien défaut 69 -> 65
  S.settings.pts = S.settings.pts || defaultPts();
  if (S.settings.mc == null) S.settings.mc = 0;
  if (S.settings.mcv !== 1) {   // ancien d\u00e9faut : 2 points pour une coupure rat\u00e9e -> aucun point (saison en cours corrig\u00e9e aussi)
    if (S.settings.mc === 2) {
      S.settings.mc = 0;
      const H = S.hist && S.hist[S.hist.length - 1];
      if (H) H.t.forEach(t => { if (t) t.lg.forEach(x => x.rows.forEach(r => { if (r[1] === 0 && r[4] === 2) { r[4] = 0; const st = S.st[r[0]]; if (st) st.pts = Math.max(0, st.pts - 2); } })); });
    }
    S.settings.mcv = 1;
  }
  S.rec = S.rec || { L: [{}, {}, {}, {}], C: {} };
  S.pk = S.pk || { cur: [0, 0, 0], best: [0, 0, 0], cw: 0 };
  S.ui = S.ui || { pv: 'cards' };
  S.courseBank = S.courseBank || [];
  S.mode = S.mode || 'manual';   // parties d'avant ce mode : comportement manuel inchangé
  S.playerCareers = S.playerCareers || [];
  (S.courses || []).forEach(c => { const m = newCourseMeta(); Object.keys(m).forEach(k => { if (c[k] == null) c[k] = m[k]; }); });
  if (S.settings.cgv !== 2) {   // CR/Slope/distance : les anciens réglages jamais personnalisés (71,5/128 cosmétique, ou 72/113/6800 neutre) reviennent au défaut d'alors 71/130/6200
    [S.courses, S.courseBank].forEach(list => (list || []).forEach(c => {
      const par = c.pars ? parTotal(c.pars) : 72;
      if (c.cr === 71.5 || c.cr === par) c.cr = 71;
      if (c.slope === 128 || c.slope === 113) c.slope = 130;
      if (c.dist === 6800) c.dist = 6200;
    }));
    S.settings.cgv = 2;
  }
  if (S.settings.cgv < 3) {   // Recalibrage : la moyenne réelle observée sur un terrain virtuel typique est plutôt 70/128 que 71/130 ; seuls les terrains encore au défaut (jamais personnalisés) sont ajustés
    [S.courses, S.courseBank].forEach(list => (list || []).forEach(c => {
      if (c.cr === 71) c.cr = 70;
      if (c.slope === 130) c.slope = 128;
    }));
    S.settings.cgv = 3;
  }
  // apr\u00e8s les migrations ci-dessus (qui ne doivent toucher que la liste propre \u00e0 cette sauvegarde, jamais la liste commune)
  bankMerge(S.courseBank); S.courseBank = BANK;   // la liste de la partie rejoint la liste commune
  BANK.concat(S.courses || []).forEach(c => { const t = canonTee(c.tee); if (t) c.tee = t; });   // anciens noms (Bleu, Blanc\u2026) \u2192 Blue, White\u2026
  setCfg(S.cfg); setPoints(S.settings.pts, S.settings.mc);
}
function newGame(name, startLeague, mode, startYear, presimN, one, later) {
  WRM.clear();
  const duo = mode === 'duo';
  setCfg(DEFAULT_CFG);
  presimN = Math.max(0, Math.min(PRESIM_MAX, Math.round(presimN || 0)));
  const U = newUniverse(name, startLeague, true);   // v321 : le monde se bâtit toujours sur des saisons cachées ; le joueur entre à la fin   // v253 : « plus tard » = circuit complet, sans place pour le joueur
  S = {
    v: 2, cfgv: 4, stkv: 1, lkv: 1, rpv: 1, tev: 1, rgv: 1, name: name || 'Toi', season: 1, t: 0, mode: mode === 'sim' ? 'sim' : 'manual', startYear: startYear || null,
    courses: Array.from({ length: N_TOURN }, (_, i) => Object.assign({ name: 'Terrain ' + (i + 1), pars: DEFAULT_PARS.slice() }, newCourseMeta())),
    courseBank: [],
    settings: { tables: clone(DEFAULT_TABLES), cut: DEFAULT_CUT, tv: 2, cv: 3, mc: 0, mcv: 1 },
    G: U.G, L: U.L, nextId: U.nextId, used: U.used, old: {}, playerCareers: [],
    st: {}, hist: [{ s: 1, t: Array(N_TOURN).fill(null), end: null }], cur: null, news: [], last: null, hcv: 1
  };
  if (duo) { S.duo = newDuo(); S.one = true; } else if (one) S.one = true;
  if (S.mode === 'sim') { delete S.G[0]; if (startLeague < 4) S.L[startLeague] = S.L[startLeague].filter(id => id !== 0); S.needsPlayerCreate = true; }
  initExtras(); S.skv = 1; skMean();
  S.L.forEach(l => l.forEach(id => { S.st[id] = newStanding(); }));
  if (later) { S.spect = true; S.needsPlayerCreate = false; delete S.G[0]; }   // v253 : on suit le circuit avant de créer son joueur
  MODEL = buildModel(S.settings.tables);
  presimSetup(presimN, startLeague, WARM_N);   // v321 : WARM_N saisons cachées, puis les presimN saisons d'histoire
  persist();
}
/* Cr\u00e9ation (ou re-cr\u00e9ation apr\u00e8s une retraite) du golfeur simul\u00e9 du joueur : m\u00eame structure qu'un golfeur IA,
   niveau et potentiel roul\u00e9s dans la bande du titre choisi. */
function createPlayerGolfer(opts) {
  const g = newPlayerGolfer(opts);
  skRoll(g); S.G[0] = g;
  if (opts.league === 4) { g.rcl = S.season; plJoinRc(); } else { makeRoom(opts.league); S.L[opts.league].push(0); }
  S.st[0] = newStanding();
  S.needsPlayerCreate = false; S.spect = false;
  persist();
}
/* Ligues à 150 : si une partie plus ancienne a des ligues plus petites, on les complète avec des recrues
   dès qu'aucun tournoi n'est en cours ni joué cette saison ; sinon la fin de saison s'en charge. */
function topUpLeagues() {
  if (S.cur || S.t !== 0) return;
  const used = new Set(S.used), add = (l, g) => { S.G[g.id] = g; S.L[l].push(g.id); S.st[g.id] = newStanding(); };
  for (let l = 0; l < 3; l++) while (S.L[l].length < (CFG.varLg ? vlMin(l) : FIELD)) {          // un poste vacant en haut : le meilleur de la ligue du dessous monte
    const c = S.L[l + 1].filter(id => id !== 0 && S.G[id]).sort((a, b) => S.G[b].o - S.G[a].o)[0];
    if (c === undefined) break;
    S.L[l + 1] = S.L[l + 1].filter(id => id !== c); S.L[l].push(c); S.G[c].sg = 0;
  }
  // v342 : avec la classe de recrues, c'est elle qui ramène le circuit vers 600 golfeurs (sa taille s'ajuste) ; on ne crée plus de recrues « hors classe » en L4, sauf filet de sécurité
  const rcLive = CFG.rcOn && (S.rcl || S.hist.some(h => h && h.end && h.end.rc)), goal = rcLive ? Math.round(VL.total * 0.8) : VL.total;
  if (CFG.varLg) { while (S.L.reduce((a, x) => a + x.length, 0) < goal) add(3, newRookie(S.nextId++, used)); }
  else for (let l = 3; l >= 0; l--) while (S.L[l].length < FIELD) add(l, newRookie(S.nextId++, used));   // les recrues arrivent en Ligue 4 (ailleurs seulement s'il ne reste personne à promouvoir)
  S.used = Array.from(used);
}
function loadState(obj) {
  WRM.clear();
  if (obj && obj.pnx) { try { if (obj.pnx.cur) { PNX = obj.pnx; pnSave(); } } catch (e) { } delete obj.pnx; }   // v442 : tournoi rapide gardé dans le fichier
  S = obj;
  if (!S.lkv) { S.cfg = S.cfg || {}; if (S.cfg.lowK == null) S.cfg.lowK = 1; S.lkv = 1; }
  if (!S.tev) { S.cfg = S.cfg || {}; if (S.cfg.topEdge == null) S.cfg.topEdge = 0; S.tev = 1; }
  if (!S.rgv) { S.cfg = S.cfg || {}; if (S.cfg.regroup == null) S.cfg.regroup = 0; S.rgv = 1; }   // v422 : idem pour « Se ressaisir »   // v421 : les parties commencées avant gardent l'équilibre d'avant (réglable dans Réglages avancés)   // v417 : les parties commencées avant gardent la courbe d'avant (réglable dans Réglages avancés)
  initExtras(); topUpLeagues();
  if (!S.rpv) { if (+S.cfg.lowK < 1 && +S.cfg.rcNoCard === 5) S.cfg.rcNoCard = 3.5; S.rpv = 1; setCfg(S.cfg); }   // v418 : parties créées en v417 (courbe adoucie) : seuil de carte recalibré, sinon la L4 grossit
  try { ensureFinSlot(); } catch (e) { } duoMigrate(); MODEL = buildModel(S.settings.tables);   // v430 : ces trois lignes s'étaient retrouvées par erreur dans le commentaire ci-dessus (v418 à v429)
  if (S.hcv !== 1) { hcRebuild(); persist(); }   // anciennes parties : index recalculés depuis l'historique
  if (S.pav !== 1) { paBackfill(); persist(); }
  if (S.almv !== 1) { almBackfill(); persist(); }
  if (S.talv !== 1) { talMigrate(); persist(); }
  if (S.biov !== 1) { bioMigrate(); persist(); }   // v286 : fiche d'identité et personnalité médiatique
  if (S.skv !== 1) { skMigrate(); persist(); }   // v220 : cotes de jeu   // v214 : talents cachés pour les golfeurs des anciennes parties
  try { wrBackfill(); } catch (e) { }
  if (S.cfg && !S.stkv) { if (S.cfg.streakMax == null || S.cfg.streakMax === 4) S.cfg.streakMax = 8; if (S.cfg.streakAmp == null || S.cfg.streakAmp === 1) S.cfg.streakAmp = 1.5; S.stkv = 1; setCfg(S.cfg); persist(); }   // v244 : séquences plus longues et plus fortes
  if (S.cfg && S.cfgv === 2) { if (S.cfg.distStep === 200) S.cfg.distStep = 600; S.cfgv = 3; setCfg(S.cfg); persist(); }   // v154 : la distance compte pour le tiers
  if (S.cfg && S.cfgv !== 2 && S.cfgv !== 3 && S.cfgv !== 4) { if (S.cfg.crRef === 71 && S.cfg.slopeRef === 128) { S.cfg.crRef = 69.5; S.cfg.slopeRef = 126; } if (S.cfg.distRef === 6100) S.cfg.distRef = 6070; if (S.cfg.distStep === 200) S.cfg.distStep = 600; S.cfgv = 3; setCfg(S.cfg); persist(); }
  if (S.cfg && S.cfgv === 3) { if (S.cfg.crRef === 69.5) S.cfg.crRef = 70.3; S.cfgv = 4; setCfg(S.cfg); persist(); }   // v219 : course rating neutre 70,3 (moyenne des terrains jou\u00e9s)   // nouveaux neutres par d\u00e9faut (tees d'environ 6 000-6 100 v)   // Almanac : paliers reconstruits et cartes encore gardées   // moyennes par type de trou : reconstruites depuis les cartes encore gardées
}

const gridCache = {};
function gridFor(pars) {
  const k = pars.join('');
  if (!gridCache[k] || gridCache.__m !== MODEL) { gridCache.__m = MODEL; Object.keys(gridCache).forEach(x => { if (x !== '__m') delete gridCache[x]; }); gridCache[k] = courseGrid(MODEL, pars); }
  return gridCache[k];
}
function parTotal(pars) { return sum(pars); }
function curCourse() { return S.t >= N_TOURN ? finCourse() : S.courses[S.t]; }
const seasonHist = () => S.hist[S.hist.length - 1];

/* ---- Tournoi : démarrage d'une ronde ---- */
function beginTournamentIfNeeded() {
  if (S.cur) return;
  if (S.off) S.off = null;
  const c = curCourse();
  const sw = spOn() && (S.t < N_TOURN || finalePending()) || (S.t >= N_TOURN && finalePending() && !(finField().includes(0) && leagueOf(0) === 0));   // v292 : mode spectateur, on suit une ligue en direct (v324 : la Finale aussi) ; v448 : la Finale se regarde aussi quand tu n'y es pas
  const pl = sw ? spwL() : plLeague();
  if (S.ui) S.ui.lgv = null;   // chaque tournoi commence sur ta ligue
  S.cur = {
    t: S.t, season: S.season, name: c.name, pars: c.pars.slice(), index: (c.index || defaultIndex()).slice(),
    tee: c.tee, dist: c.dist, cr: c.cr, slope: c.slope, pin: c.pin || 'thu', wind: c.wind || 'none', pin2: c.pin2 || 'fri', wind2: c.wind2 || 'none', purse: cPurse(c),
    ctx: Object.assign(newCtx(), { windBump: [windBump(c.wind || 'none'), windBump(c.wind2 || 'none')], crDelta: crDeltaOf(c, c.pars), distDelta: distDelta(c.dist), slopeFactor: slopeEffFactor(c.slope) }), pl,
    phase: 'r1', r: 0, ai: {}, ps: [], r1: {}, cut: null, alive: [], feed: [], lead1: null
  };
  if (sw) S.cur.sw = 1;
  if (pl === 4 && S.t < N_TOURN) { S.cur.rc = 1; S.cur.fld = S.rcl.ids.filter(id => id === 0 || S.G[id]); }   // v249 : tu joues avec ta classe de recrues
  if (S.t >= N_TOURN) { S.cur.fin = 1; S.cur.fld = finField(); S.cur.purse = cPurse(c) * FIN.purse; S.cur.pl = 0; }   // Finale : top 30 de la L1
  else if (isMajorT(S.t)) S.cur.maj = majorName(S.t);
}
const fld = c => c.fld || S.L[c.pl];
const spOn = () => !!(S.spect || (S.mode === 'sim' && !S.G[0]));
const spwL = () => { const l = S.ui && S.ui.spl; return l >= 0 && l < 4 ? l : 0; };
const cutN = c => c.fin || c.rc ? fld(c).length : S.settings.cut;
function simAIRound(r) {
  const c = S.cur, grid = gridFor(c.pars);
  const ids = (r === 0 ? fld(c) : c.alive).filter(i => i !== 0 || S.mode === 'sim');
  c.ai = {}; c.aiD = {}; const on = liveOn();
  ids.forEach(id => {
    const margin = r === 1 ? c.r1[id] - c.r1[c.lead1] : null;
    c.aiD[id] = solveDelta(grid, roundTarget(S.G[id], c.ctx, r, on ? null : margin));
    c.ai[id] = [];   // v216 : les trous se jouent au moment où ils sont dévoilés (aiFill)
  });
  makeTee(r);
  othRound(r);
}
/* ---- Les autres ligues jouent le même tournoi en même temps, trou par trou ----
   Leurs rondes sont tirées au début de chaque ronde (comme les IA de ta ligue) et dévoilées au même trou que toi ;
   le résultat final du tournoi utilise exactement ces cartes. c.oth[l] = { ids, h1, r1, cut, alive, lead1, h2 }. */
function othRound(r) {
  const c = S.cur, grid = gridFor(c.pars); c.oth = c.oth || {};
  if (c.fin) return;   // Finale : la L1 seulement
  for (let l = 0; l < 4; l++) {
    if (l === c.pl) continue;
    const o = c.oth[l] || (c.oth[l] = {});
    const on = liveOn(), D = {}, dOf = (id, margin) => solveDelta(grid, roundTarget(S.G[id], c.ctx, r, on ? null : margin));
    if (r === 0) { o.ids = S.L[l].filter(id => S.G[id]); o.ids.forEach(id => { D[id] = dOf(id, null); }); o.o1 = teeOrder(o.ids, null, null);   /* v367 : ronde unique = départs au hasard (la Finale garde le classement) */ o.h1 = liveRound(MODEL, c.pars, c.index, c.ctx.hv && c.ctx.hv[0], o.ids, S.G, D, null, !!S.one, teeStarts(o.o1, null, o.lm1 = 3)); delete o.r1; o.h2 = null; o.o2 = null; }
    else if (o.h1 && !o.h2) { othR1(l); o.alive.forEach(id => { D[id] = dOf(id, o.r1[id] - o.r1[o.lead1]); }); o.o2 = teeOrder(o.alive, o.r1); o.h2 = liveRound(MODEL, c.pars, c.index, c.ctx.hv && c.ctx.hv[1], o.alive, S.G, D, o.r1, true, teeStarts(o.o2, null, o.lm2 = 2)); }
  }
}
function othR1(l) {
  const c = S.cur, o = c.oth[l]; if (o.r1) return o;
  o.r1 = {}; o.ids.forEach(id => { o.r1[id] = relTo(o.h1[id], c.pars, 18); });
  o.cut = cutScoreOf(o.ids.map(id => o.r1[id]), S.settings.cut);
  o.alive = o.ids.filter(id => o.r1[id] <= o.cut);
  o.lead1 = o.ids.reduce((b, id) => b == null || o.r1[id] < o.r1[b] ? id : b, null);
  return o;
}
/* Classement en direct d'une autre ligue après k trous de la ronde en cours (null si indisponible) */
function othRows(l, k) {
  const c = S.cur, o = c.oth && c.oth[l]; if (!o || !o.h1) return null;
  const ord = c.r === 0 ? o.o1 : o.o2, olm = c.r === 0 ? o.lm1 : o.lm2, T = ord ? teeT(c, k) : null, st = T != null ? teeStarts(ord, null, olm) : null;
  const n = id => st ? teeHoles(st, T, id) : k, row = (id, tot, nn) => st ? { id, tot, n: nn, g: teeGix(ord, ord.indexOf(id), olm), ns: nn === 0 } : { id, tot };
  if (c.r === 0) return rankTies(o.ids.map(id => { const nn = n(id); return row(id, relTo(o.h1[id], c.pars, nn), nn); }), true);
  othR1(l); if (!o.h2) return null;
  return rankTies(o.alive.map(id => { const nn = n(id); return row(id, o.r1[id] + relTo(o.h2[id], c.pars, nn), nn); }));
}
function othHoles(l, id) { const c = S.cur, o = c.oth[l]; return (c.r === 0 ? o.h1[id] : o.h2[id]) || []; }
function startRound(r) {
  beginTournamentIfNeeded();
  const c = S.cur; c.r = r; c.ps = []; c.pst = []; c.phase = r === 0 ? 'r1' : 'r2'; c.feed = [];
  simAIRound(r);
  VIEW = { name: 'play', val: c.pars[0] };
  persist();
}
function relTo(holes, pars, n) { let s = 0; for (let i = 0; i < n; i++) s += holes[i] - pars[i]; return s; }

/* Classement en direct après k trous de la ronde en cours.
   Si un dévoilement séquentiel est en cours pour ce trou (REVEAL), les golfeurs pas encore
   « dévoilés » restent au score d'avant ce trou (pending: true) pour l'animation. */
function myHoles(c) { return S.mode === 'sim' ? c.ai[0] : S.duo && S.duo.hc ? c.ps.map((v, i) => v + duoStrokes(c.index && c.index[i])) : c.ps; }
function liveRows(k) {
  aiFill(k);
  const c = S.cur; const rows = [];
  const ids = c.r === 0 ? fld(c) : c.alive;
  const revealed = (REVEAL && REVEAL.k === k) ? new Set(REVEAL.order.slice(0, REVEAL.shown)) : null;
  const tr = teeCur(c), T = tr ? teeT(c, k) : null, T0 = tr ? (k >= 18 && c.tx > 0 ? T - 1 : teeT(c, k - 1)) : null;   // v285 : après ta ronde, le dévoilement part de l'heure précédente
  ids.forEach(id => {
    const holes = id === 0 ? myHoles(c) : c.ai[id];
    const pending = !!(revealed && id !== 0 && !revealed.has(id) && (!REVEAL.set || REVEAL.set.has(id)));
    if (tr) {   // v217 : chacun en est à son propre trou selon son heure de départ
      const n = Math.min(holes.length, id === 0 && !teeSim(c) ? k : teeHoles(tr._st, pending ? T0 : T, id));
      rows.push({ id, tot: relTo(holes, c.pars, n) + (c.r === 1 ? c.r1[id] : 0), pending, n, g: teeGrp(tr, id), ns: n === 0 });
      return;
    }
    const useK = pending ? k - 1 : k;
    const tot = relTo(holes, c.pars, useK) + (c.r === 1 ? c.r1[id] : 0);
    rows.push({ id, tot, pending });
  });
  return rankTies(rows, c.r === 0);
}
function rankTies(rows, noNs) {
  /* v437 : en ronde 1 (noNs), ceux qui ne sont pas encore partis n'ont pas de position (affichée « – ») : ils passent
     après les autres, et les positions ne comptent que ceux qui ont joué au moins un trou, comme au PGA Tour. */
  const ns = noNs ? rows.filter(r => r.ns) : [];
  if (ns.length) {
    const on = rankTies(rows.filter(r => !r.ns)), p = on.length + 1;
    ns.sort((a, b) => nameOf(a.id).localeCompare(nameOf(b.id))).forEach(r => { r.pos = p; r.tie = false; r.nop = true; });
    return on.concat(ns);
  }
  rows.sort((a, b) => a.tot - b.tot || (b.n || 0) - (a.n || 0) || nameOf(a.id).localeCompare(nameOf(b.id)));
  let i = 0;
  while (i < rows.length) {
    let j = i; while (j + 1 < rows.length && rows[j + 1].tot === rows[i].tot) j++;
    for (let k = i; k <= j; k++) { rows[k].pos = i + 1; rows[k].tie = j > i; }
    i = j + 1;
  }
  return rows;
}
/* v438 : couleur d'une position (option A2 de Max) : top 5 vert éclatant, top 10 vert franc, top 20 vert foncé.
   Renvoie le suffixe de classe (« t5 », « t », « t20 ») ; la victoire et la coupure ratée gardent leurs classes. */
function posTc(p) { return !p || p < 2 ? '' : p <= 5 ? 't t5' : p <= 10 ? 't' : p <= 20 ? 't20' : ''; }
const posLbl = r => r.nop ? '\u2013' : (r.tie ? 'T' : '') + r.pos;   // v437 : « – » pour qui n'est pas encore parti (ronde 1)

const HOLE_WORD = { '-2': 'aigle', '-1': 'birdie', '0': 'par', '1': 'bogey', '2': 'double bogey', '3': 'triple bogey' };
function holeWord(rel, strokes) {
  if (strokes === 1) return 'trou d\u2019un coup';
  if (rel <= -3) return 'albatros';
  if (rel >= 4) return 'quadruple bogey ou pire';
  return HOLE_WORD[rel];
}
function holeRange(par) { return par === 3 ? [1, 7] : par === 4 ? [2, 8] : [2, 9]; }
function submitHole(strokes) {
  const c = S.cur, k = c.ps.length, par = c.pars[k];
  { const r = holeRange(par); strokes = Math.max(r[0], Math.min(r[1], strokes)); }
  const before = liveRows(k), me0 = before.find(r => r.id === 0);
  c.ps.push(strokes);
  const after = liveRows(k + 1), me1 = after.find(r => r.id === 0);
  const rel = strokes - par;
  let line = 'Trou ' + (k + 1) + ' (par ' + par + ') : ' + strokes + ', ' + holeWord(rel, strokes) + '. ';
  if (me1.pos < me0.pos) line += 'Tu montes du ' + posLbl(me0) + ' au ' + posLbl(me1) + ' rang.';
  else if (me1.pos > me0.pos) line += 'Tu glisses du ' + posLbl(me0) + ' au ' + posLbl(me1) + ' rang.';
  else line += 'Tu restes au ' + posLbl(me1) + ' rang.';
  const lead = after[0];
  line += ' En t\u00eate : ' + nameOf(lead.id) + ' (' + fmt(lead.tot) + ').';
  // Faits marquants chez les adversaires bien classés
  const ev = [];
  holeEvents(before, after, k, ev, true);
  try { fanStep(before, after, k + 1); } catch (e) { }
  c.feed.unshift({ n: k + 1, t: line, ev: ev.slice(0, 2) });
  persist();
  return k + 1;
}
/* faits marquants d'un pas de jeu : aigles et mieux, triples bogeys ou pire chez les meneurs (v217 : le trou que chacun vient de jouer) */
function holeEvents(before, after, k, ev, skipMe) {
  const c = S.cur, bn = {}; before.forEach(r => { bn[r.id] = r.n; });
  after.slice(0, 25).forEach(r => {
    if (skipMe && r.id === 0) return;
    const hs = r.id === 0 ? myHoles(c) : c.ai[r.id]; if (!hs) return;
    const js = r.n == null ? [k] : range((bn[r.id] || 0), r.n - 1);
    js.forEach(j => {
      if (hs[j] == null) return;
      const h = hs[j] - c.pars[j];
      if (h <= -2) ev.push(nameOf(r.id) + ' (' + posLbl(r) + ') : ' + holeWord(h, hs[j]) + ' au ' + (j + 1) + '.');
      else if (h >= 3 && r.pos <= 12) ev.push(nameOf(r.id) + ' (' + posLbl(r) + ') : ' + holeWord(h, 9) + ' au ' + (j + 1) + '.');
    });
  });
}
function undoHole() {
  const c = S.cur; if (!c || !c.ps.length) return;
  c.feed = c.feed.filter(f => !f.w); c.ps.pop(); c.feed.shift(); c.tx = 0; if (c.pst) c.pst.length = Math.min(c.pst.length, c.ps.length);
  VIEW = { name: 'play', val: c.pars[c.ps.length] };
  persist();
}
/* v391 : termine la ronde pour tout le monde SANS passer à la page suivante : l'écran de la ronde (vWait) reste
   affiché avec le classement final et le bouton « Voir la coupure » / « Voir la clôture du tournoi » (action holdgo,
   qui appelle finishRound). */
function holdRound() {
  const c = S.cur; if (!c) return;
  aiFill(18, true); if (teeCur(c)) c.tx = 999;
  if (/^sim/.test(c.phase)) c.k2 = 18;
  persist();
}
function finishRound() {
  const c = S.cur; aiFill(18, true); if (teeCur(c)) c.tx = 999;
  if (c.r === 0 && c.sw) {   // v292 : ronde 1 suivie sans golfeur
    fld(c).forEach(id => { c.r1[id] = relTo(c.ai[id], c.pars, 18); });
    c.cut = cutScoreOf(fld(c).map(id => c.r1[id]), cutN(c));
    c.alive = fld(c).filter(id => c.r1[id] <= c.cut);
    c.made = false; c.phase = 'cut'; c.pr1 = []; c.h1 = c.ai;
    c.lead1 = liveRows18R1()[0].id;
    if (S.one) { if (poStart(c)) return; finishTournament(); return; }
    VIEW = { name: 'roundEnd' };
  } else if (c.r === 0) {
    c.r1[0] = relTo(myHoles(c), c.pars, 18);
    fld(c).forEach(id => { if (id !== 0) c.r1[id] = relTo(c.ai[id], c.pars, 18); });
    c.cut = cutScoreOf(fld(c).map(id => c.r1[id]), cutN(c));
    c.alive = fld(c).filter(id => c.r1[id] <= c.cut);
    c.made = c.r1[0] <= c.cut;
    c.phase = 'cut'; c.pr1 = myHoles(c).slice(); c.h1 = c.ai; if (c.pst) c.pst1 = c.pst.slice(0, 18);
    c.lead1 = liveRows18R1()[0].id;
    if (S.one) { if (poStart(c)) return; finishTournament(); return; }
    VIEW = { name: 'roundEnd' };
  } else {
    if (c.made && !c.sw) c.r2p = relTo(myHoles(c), c.pars, 18);
    if (poStart(c)) return;
    finishTournament();
  }
}
function liveRows18R1() {
  const c = S.cur; return rankTies(fld(c).map(id => ({ id, tot: c.r1[id] })));
}


/* ---- Coupure ratée : regarder la ronde 2 se jouer, trou par trou ---- */
function startSpectate() {
  const c = S.cur; c.r = 1; c.phase = 'sim2'; c.k2 = 0; c.feed = [];
  simAIRound(1);
  VIEW = { name: 'spec' };
  persist();
}
function simSpectHole() {
  const c = S.cur, k = c.k2, par = c.pars[k];
  const before = liveRows(k), bpos = {}; before.forEach(r => { bpos[r.id] = r.pos; });
  c.k2 = k + 1;
  const after = liveRows(c.k2), lead = after[0];
  let line = 'Trou ' + (k + 1) + ' (par ' + par + ') : ' + nameOf(lead.id) + ' m\u00e8ne \u00e0 ' + fmt(lead.tot) + (after[1] && after[1].tot === lead.tot ? ', \u00e0 \u00e9galit\u00e9.' : '.');
  const ev = [];
  let best = null;
  const bnop = new Set(before.filter(r => r.nop).map(r => r.id));
  after.slice(0, 30).forEach(r => { if (bnop.has(r.id) || r.nop) return; const d = bpos[r.id] - r.pos; if (d >= 8 && (!best || d > best.d)) best = { r, d }; });
  if (best) ev.push(nameOf(best.r.id) + ' gagne ' + best.d + ' places (' + posLbl(best.r) + ').');
  holeEvents(before, after, k, ev, false);
  try { fanStep(before, after, k + 1); } catch (e) { }
  c.feed.unshift({ n: k + 1, t: line, ev: ev.slice(0, 3) });
  persist();
  return c.k2;
}
/* Dévoilement séquentiel : révèle les scores des adversaires par groupes de 15, à 1 seconde d'intervalle,
   pour voir le classement bouger. Le golfeur du joueur (id 0) est toujours révélé tout de suite.
   onDone() est appelé une fois tout le monde dévoilé (ou immédiatement si le mode n'est pas activé). */
/* v411 : « Golfeur par golfeur » (S.ui.reveal = 'gbg') : au plus GBG_MAX mouvements qui comptent sont montrés un à
   un, du bas du classement vers la tête ; tous les autres golfeurs se placent ensemble à la fin.
   Qui passe, parmi ceux qui ont joué un trou au-dessus ou en dessous du par et changent de rang : le top 10 (ceux
   qui y sont, y entrent ou en sortent), puis, dans les 25 premiers rangs, ta watchlist et les groupes affichés, puis
   les plus gros sauts. Ton golfeur, lui, est toujours dévoilé en premier (son score est déjà connu). */
const GBG_MAX = 8, GBG_MS = 1300;
function gbgPick(k, ids) {
  const c = S.cur, snap = () => { const m = new Map(); try { liveRows(k).forEach(r => m.set(r.id, r)); } catch (e) { } return m; };
  REVEAL = { k, order: ids, shown: 0, timer: null, set: null }; const pre = snap();
  REVEAL = null; const post = snap();
  const star = new Set(c.twl || []), tr = teeCur(c);
  if (tr) { const G = teeGroups(tr.o, tr.lm); [teeGrp(tr, 0)].concat(tr.fol || []).forEach(gi => { if (gi >= 0 && G[gi]) G[gi].forEach(id => star.add(id)); }); }
  const mv = ids.map(id => { const a = pre.get(id), b = post.get(id); return a && b && a.pos !== b.pos && a.tot !== b.tot ? { id, a: a.pos, b: b.pos, d: Math.abs(a.pos - b.pos), top: Math.min(a.pos, b.pos) <= 10, st: star.has(id) } : null; }).filter(Boolean);
  const byD = (x, y) => x.b - y.b || y.d - x.d /* d'abord ceux qui finissent le plus haut (les chutes depuis une grosse égalité sont nombreuses et moins parlantes) */, top = mv.filter(x => x.top).sort(byD).slice(0, 5), ts = new Set(top.map(x => x.id));   // au plus 5 places pour le top 10
  /* le reste : seulement ceux qui partent du haut du classement ou y arrivent (25 premiers rangs), sinon le mouvement
     se passe hors de l'écran et on attendrait pour rien */
  const rest = mv.filter(x => !ts.has(x.id) && Math.min(x.a, x.b) <= 25).sort((x, y) => (y.st - x.st) || byD(x, y));
  let dn = 0;   // au plus 3 chutes par trou : en début de ronde, des dizaines de golfeurs à égalité en tête tombent en même temps
  return top.concat(rest).filter(x => x.b < x.a || ++dn <= 3).slice(0, GBG_MAX).sort((x, y) => y.b - x.b || y.a - x.a).map(x => x.id);   // du bas vers le haut : la tête en dernier
}
function startReveal(k, onDone, only) {
  ANIM.hk++;   // v453 : nouveau trou (efface les chiffres de mouvement du trou précédent)
  if (S.ui.reveal !== 'seq' && S.ui.reveal !== 'gbg') { onDone(); return; }
  const c = S.cur;
  const ids = (only || (c.r === 0 ? fld(c) : c.alive)).filter(id => id !== 0);
  /* v312 : on ne « dévoile » que ceux dont la ligne change (les golfeurs qui ont terminé ou pas encore partis sont sautés) */
  if (ids.length) {
    REVEAL = { k, order: ids, shown: 0, timer: null, set: null };
    const pre = new Map(); try { liveRows(k).forEach(r => pre.set(r.id, r.tot + '|' + r.n)); } catch (e) { }
    REVEAL = null;
    const post = new Map(); try { liveRows(k).forEach(r => post.set(r.id, r.tot + '|' + r.n)); } catch (e) { }
    if (pre.size && post.size) { const mv = ids.filter(id => pre.get(id) !== post.get(id)); ids.length = 0; mv.forEach(id => ids.push(id)); }
  }
  if (!ids.length) { onDone(); return; }
  if (S.ui.reveal === 'gbg') {
    const feat = gbgPick(k, ids), fs = new Set(feat), order = feat.concat(ids.filter(id => !fs.has(id)));
    REVEAL = { k, order, shown: 0, timer: null, set: only ? new Set(ids) : null, gbg: 1, nf: feat.length, cur: null };
    render(); scrollAfterHole();
    REVEAL.timer = setInterval(function () {
      if (!S.cur || (VIEW.name !== 'play' && VIEW.name !== 'spec')) { clearInterval(REVEAL.timer); REVEAL = null; return; }
      if (REVEAL.shown < REVEAL.nf) { REVEAL.cur = REVEAL.order[REVEAL.shown]; REVEAL.shown++; render(); return; }
      clearInterval(REVEAL.timer); REVEAL = null; onDone();
    }, GBG_MS);
    return;
  }
  /* v310 : peu de golfeurs (quelques groupes) → un groupe à la fois, dans l'ordre des départs ; beaucoup → par paquets de 15 */
  const tr = teeCur(c), few = ids.length <= 40, st = tr ? (tr._st || teeStarts(tr.o, null, tr.lm)) : null;
  const order = few && st ? ids.slice().sort((a, b) => (st[a] || 0) - (st[b] || 0) || a - b) : shuffled(ids);
  const step = few ? (tr ? TEE.SZ : 3) : 15;
  const bd = few && st ? order.map((id, i) => i + 1).filter(i => i === order.length || st[order[i]] !== st[order[i - 1]]) : null;   // v319 : un groupe (de 3 ou 4) à la fois
  REVEAL = { k, order, shown: 0, timer: null, set: only ? new Set(ids) : null, bd };
  render(); scrollAfterHole();
  REVEAL.timer = setInterval(function () {
    if (!S.cur || (VIEW.name !== 'play' && VIEW.name !== 'spec')) { clearInterval(REVEAL.timer); REVEAL = null; return; }
    if (REVEAL.bd) { const nx = REVEAL.bd.find(x => x > REVEAL.shown); REVEAL.shown = nx == null ? REVEAL.order.length : nx; } else REVEAL.shown += step;
    if (REVEAL.shown >= REVEAL.order.length) { clearInterval(REVEAL.timer); REVEAL = null; onDone(); }
    else render();
  }, few ? 1000 : 1200);   // v411 : un peu plus lent, pour laisser voir les mouvements
}

/* ---- v294 : prolongation en direct (trou 18 rejoué jusqu'à un seul golfeur) ---- */
let PO_FAST = false;
function poTiedLive(c) {
  const hol = id => id === 0 ? myHoles(c) : c.ai[id];
  let ids, tot;
  if (S.one) { ids = fld(c).filter(id => c.r1[id] != null); tot = id => c.r1[id]; }
  else { ids = (c.alive || []).filter(id => hol(id) && hol(id).length >= 18); tot = id => c.r1[id] + relTo(hol(id), c.pars, 18); }
  if (ids.length < 2) return null;
  const m = Math.min.apply(null, ids.map(tot)), t = ids.filter(id => tot(id) === m);
  return t.length > 1 ? t : null;
}
/* v394 : prolongation terminée → retour à l'écran de la ronde (vWait), qui montre le vainqueur et le bouton
   « Voir la clôture du tournoi » (holdgo → finishRound, qui ne relance pas la prolongation puisque c.po existe). */
function poBack() {
  const c = S.cur; if (!c || !c.po || c.po.w == null) return;
  VIEW = S.mode === 'sim' || c.sw || !c.made || c.phase === 'sim2' || (c.k2 || 0) >= 18 && c.ps.length < 18 ? { name: 'spec' } : { name: 'play' };
  persist();
}
function poStart(c) {
  if (PO_FAST || c.po) return false;
  let t = null; try { t = poTiedLive(c); } catch (e) { t = null; }
  if (!t) return false;
  c.po = { ids: t, live: t.slice(), h: [], w: null }; c.phase = 'po';
  VIEW = { name: 'po' }; persist(); return true;
}
const poMine = c => S.mode !== 'sim' && !c.sw && c.po.live.includes(0);
/* v314 : un trou de prolongation se prépare (P.pend), puis se dévoile golfeur par golfeur (ou d'un coup) */
function poPend(mine) {
  const c = S.cur, P = c.po; if (!P || P.w != null) return null;
  if (P.pend) return P.pend;
  const pm = poMine(c), ai = P.live.filter(id => id !== 0 || S.mode === 'sim');
  const j = P.h.length % 18, sc = ai.length ? poHole(ai, c.pars, c.index, c.ctx, S.one ? 0 : 1, j) : {};
  if (P.live.includes(0) && S.mode !== 'sim') sc[0] = mine != null ? mine : c.pars[j];
  const others = P.live.filter(id => id !== 0), o = P.live.includes(0) ? (pm ? [0].concat(others) : others.concat([0])) : others;
  P.pend = { sc, o, n: pm ? 1 : 0 };
  return P.pend;
}
function poOne() {   // dévoile le score du prochain golfeur ; le dernier ferme le trou
  const c = S.cur, P = c.po; if (!P || P.w != null) return;
  const d = poPend(); if (!d) return;
  d.n++;
  const id = d.o[d.n - 1], j = P.h.length % 18;
  if (id != null && id !== 0 && d.sc[id] - c.pars[j] <= -1) sndAsk('clap');
  if (d.n >= d.o.length) poStep(); else persist();
}
function poStep(mine) {   // un trou de prolongation ; mine = tes coups (mode manuel)
  const c = S.cur, P = c.po; if (!P || P.w != null) return;
  const sc = poPend(mine).sc; delete P.pend;
  const j = P.h.length % 18;
  P.h.push(sc);
  const m = Math.min.apply(null, P.live.map(id => sc[id]));
  if (P.live.includes(0) && sc[0] - c.pars[j] <= -1) sndAsk('clap');
  P.live = P.live.filter(id => sc[id] === m);
  if (P.live.length === 1) { P.w = P.live[0]; if (P.w !== 0) sndAsk('clap2'); }
  else if (P.h.length >= 20) { P.w = P.live[Math.floor(Math.random() * P.live.length)]; P.live = [P.w]; }
  persist();
}
function poRun(all) { const c = S.cur; let g = 0; while (c.po && c.po.w == null && g++ < 25) { if (poMine(c)) poStep(c.pars[c.po.h.length % 18]); else poStep(); if (!all) break; } }
/* v309 : carte de la prolongation — trou 1, 2, 3… avec par et index, jusqu'au bris d'égalité */
function poCardHTML(po, pars, index, w, live, pend) {
  const n = po.h.length + (pend ? 1 : 0); if (!n) return '';
  const shown = pend ? new Set(pend.o.slice(0, pend.n)) : null;
  const J = range(0, n - 1).map(k => k % 18), cls = d => d <= -2 ? 'e2' : d === -1 ? 'e1' : d === 1 ? 'b1' : d === 2 ? 'b2' : d >= 3 ? 'b3' : '';
  let x = '<div class="cardwrap pocard"><table class="cards"><thead><tr class="hn"><th class="s1">Golfeur</th>' + J.map((j, k) => '<th' + (pend && k === n - 1 ? ' class="nx"' : '') + '>' + (j + 1) + '</th>').join('') + '</tr>' +
    '<tr class="hp"><th class="s1">Par</th>' + J.map(j => '<th>' + pars[j] + '</th>').join('') + '</tr>' +
    (index ? '<tr class="hi"><th class="s1">Index</th>' + J.map(j => '<th>' + (index[j] != null ? index[j] : '') + '</th>').join('') + '</tr>' : '') + '</thead><tbody>';
  po.ids.forEach(id => {
    const out = live ? !live.includes(id) : (w != null && id !== w);
    x += '<tr class="' + (id === 0 ? 'me' : '') + (out ? ' poout' : '') + (id === w ? ' powin' : '') + '"><td class="s1"><span class="flg">' + flagOf(id, 16) + '</span> <a href="#" data-a="golfer" data-id="' + id + '" class="nmt">' + esc(nameOf(id)) + '</a>' + (id === w ? ' <span class="pow">🏆</span>' : '') + '</td>' +
      J.map((j, k) => { if (pend && k === n - 1) { if (!live.includes(id)) return '<td></td>'; if (!shown.has(id)) return '<td class="popd">?</td>'; const v = pend.sc[id]; return '<td class="h popn ' + cls(v - pars[j]) + '">' + v + '</td>'; } const v = po.h[k][id]; return v == null ? '<td></td>' : '<td class="h ' + cls(v - pars[j]) + '">' + v + '</td>'; }).join('') + '</tr>';
  });
  return x + '</tbody></table></div>';
}
function vPO() {
  const c = S.cur, P = c.po, n = P.h.length, jn = n % 18, par = c.pars[jn];
  const T = '<div class="top"><div><h1>Prolongation</h1><div class="ctx">' + esc(c.name) + ' · ' + (c.fin ? 'Finale' : esc(LEAGUE_NAMES[c.pl] || '')) + '</div></div></div>';
  let h = '<div class="block hero">';
  if (P.w == null) h += '<div class="ctx"><span>Trou de prolongation ' + (n + 1) + '</span> · <span>trou ' + (jn + 1) + '</span>' + (c.index ? ' · <span>index ' + c.index[jn] + '</span>' : '') + '</div><div class="big">Par ' + par + '</div><p class="mute" style="margin:6px 0 0"><span>' + P.live.length + ' golfeurs encore en lice</span> · <span>' + (S.one ? 'total ' : 'total ') + fmt(S.one ? c.r1[P.ids[0]] : c.r1[P.ids[0]] + relTo(P.ids[0] === 0 ? myHoles(c) : c.ai[P.ids[0]], c.pars, 18)) + '</span></p>';
  else h += '<div class="ctx">' + (P.w === 0 ? 'Victoire en prolongation !' : 'Vainqueur en prolongation') + '</div><div class="big">' + esc(nameOf(P.w)) + '</div><p class="mute" style="margin:6px 0 0"><span>au trou de prolongation ' + n + '</span></p>';
  h += '</div>';
  const pd = P.w == null ? P.pend : null;
  if (pd) {   // trou en cours de dévoilement
    const sh = pd.o.slice(0, pd.n), best = sh.length ? Math.min.apply(null, sh.map(id => pd.sc[id])) : null;
    h += '<div class="block popend"><div class="ctx"><span>Trou de prolongation ' + (n + 1) + '</span> · <span>' + pd.n + ' sur ' + pd.o.length + ' dévoilés</span></div>' +
      (sh.length ? '<p style="margin:6px 0 0">' + sh.map(id => '<span class="popc">' + flagOf(id, 16) + ' <b>' + esc(id === 0 ? nameOf(0) : shortNm(nameOf(id))) + '</b> <span class="' + cls(pd.sc[id] - par) + '">' + pd.sc[id] + '</span>' + (pd.sc[id] === best ? ' <span class="small mute">· meilleur score</span>' : '') + '</span>').join('') + '</p>' : '') + '</div>';
  }
  const tb = (n || pd) ? '<h2>Carte de la prolongation</h2>' + poCardHTML(P, c.pars, c.index, P.w, P.live, pd) : '<div class="block"><p class="mute" style="margin:0"><span>La prolongation repart du trou 1 et suit la carte jusqu’au bris d’égalité.</span> <span>En lice :</span> ' + P.ids.map(id => '<a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>').join(', ') + '</p></div>';
  let F = '';
  if (P.w != null) F = '<button class="btn" data-a="poback">Retour au classement</button>';   // v394 : on revient à la ronde, puis « Voir la clôture du tournoi »
  else if (pd) { const nx = pd.o[pd.n]; F = '<button class="btn" data-a="poone" style="margin-top:14px">' + (pd.n === pd.o.length - 1 ? '<span>Dernier golfeur :</span> ' : '<span>Golfeur suivant :</span> ') + esc(nameOf(nx)) + '</button><button class="btn sec" data-a="pos">Dévoiler le reste du trou</button><button class="btn sec" data-a="poall">Simuler toute la prolongation</button>'; }
  else if (poMine(c)) { const r = holeRange(par); F = '<p style="margin:14px 0 6px"><b>Ton score au trou ' + (jn + 1) + '</b></p><div class="row" style="gap:6px;flex-wrap:wrap">' + range(r[0], Math.min(r[1], par + 3)).map(v => '<button class="btn ' + (v === par ? '' : 'sec ') + 'sm" data-a="poh" data-v="' + v + '" style="flex:1 0 54px;margin:0">' + v + '</button>').join('') + '</div>'; }
  else F = '<button class="btn" data-a="poone" style="margin-top:14px">Golfeur par golfeur</button><button class="btn sec" data-a="pos">Simuler le trou de prolongation</button><button class="btn sec" data-a="poall">Simuler toute la prolongation</button>';
  return T + cols(h, tb, F, 'rend');
}
/* ---- Mode simul\u00e9 : jouer une ronde (1 ou 2) en la simulant plut\u00f4t qu'en l'entrant \u00e0 la main ---- */
function startRoundSim(r) {
  beginTournamentIfNeeded();
  const c = S.cur; c.r = r; c.ps = []; c.phase = r === 0 ? 'sim1' : 'sim2'; c.k2 = 0; c.feed = [];
  simAIRound(r);
  VIEW = { name: 'spec' };
  persist();
}
function finishSimRound() {
  const c = S.cur; c.k2 = 18;
  finishRound();
  persist();
}
/* ---- Mode simul\u00e9 : simuler d'un coup le tournoi en cours (ou le prochain), peu importe o\u00f9 il en est ---- */
function simulateTournament() { PO_FAST = true; try { simulateTournament0(); } finally { PO_FAST = false; } }
function simulateTournament0() {
  if (!S.cur) startRoundSim(0);
  const c = S.cur;
  if (c.phase === 'sim1' || c.phase === 'r1') finishSimRound();          // ronde 1 -> coupure
  if (S.cur && S.cur.phase === 'cut') {
    if (S.cur.made) { startRoundSim(1); finishSimRound(); }
    else finishTournament();
  } else if (S.cur && (S.cur.phase === 'sim2' || S.cur.phase === 'r2')) finishSimRound();
  else if (S.cur && S.cur.phase === 'po') { poRun(true); finishTournament(); }
  VIEW = c.fin ? { name: 'tourn', s: S.season, t: N_TOURN, l: 0, mode: 'res' } : c.sw ? { name: 'tourn', s: S.season, t: S.t - 1, l: c.pl, mode: 'res' } : { name: 'tournEnd' };
  persist();
}
/* ---- Mode simul\u00e9 : enchaîner instantan\u00e9ment tous les tournois restants de la saison ---- */
function simulateSeason() { PO_FAST = true; try { simulateSeason0(); } finally { PO_FAST = false; } }
function simulateSeason0() {
  let guard = 0;
  while (S.t < N_TOURN && guard++ < N_TOURN + 2) {
    startRoundSim(0);
    finishSimRound();
    if (!S.cur) continue;          // coupure rat\u00e9e : finishTournament() a d\u00e9j\u00e0 tout termin\u00e9
    if (S.cur.made) { startRoundSim(1); finishSimRound(); }
    else finishTournament();
  }
  VIEW = { name: 'home' };
  persist();
}

/* Mouvements en cours de saison (mêmes seuils dans les trois ligues), comptés depuis le début de la saison ou depuis
   l'arrivée dans la ligue actuelle (les compteurs repartent à zéro à chaque changement de ligue) :
   - monte : 1 victoire + 1 autre top-3, ou 3 top-5, ou 4 top-10, ou 5 top-20 ;
   - descend : 5 tournois dans les 30 derniers, ou 3 dans les 10 derniers — y compris une 2e fois dans la même saison,
     si le golfeur refait la même chose dans sa nouvelle ligue. Les « 30 derniers » sont les 30 dernières lignes du
     classement final du tournoi (coupures ratées classées selon la ronde 1). */
const PROMO_TXT = '1 victoire + 1 autre top-3, 3 top-5, 4 top-10 ou 5 top-20';
const relBot = () => Math.max(3, Math.round(CFG.relBot || 10));   // v332 : relégués de fin de saison par ligue
const relB30 = () => Math.max(4, Math.round(CFG.relB30 || 6));
const relegTxt = () => relB30() + ' tournois dans les 30 derniers ou 3 dans les 10 derniers';
function promoReason(c) { return c.w >= 1 && c.t3 >= 2 ? (c.w >= 2 ? c.w + ' victoires' : '1 victoire et ' + (c.t3 - 1) + ' autre' + (c.t3 > 2 ? 's' : '') + ' top-3') : c.t5 >= 3 ? c.t5 + ' top-5' : c.t10 >= 4 ? c.t10 + ' top-10' : c.t20 >= 5 ? c.t20 + ' top-20' : null; }
function relegReason(c) { return c.b10 >= 3 ? c.b10 + ' fois dans les 10 derniers' : c.b30 >= relB30() ? c.b30 + ' fois dans les 30 derniers' : null; }
let MV_LOG = [];   // changements de ligue du tournoi en cours, gardés dans le tournoi (t.mvs) pour les résumés
function moveGolferInSeason(id, fromL, toL, type, reason) {
  const g = gmv(id); if (!g) return;
  const s = getSt(id);
  if (!g.mv) g.mv = { fromL, fromPts: s.pts, type };   // ne garde que le tout premier départ de la saison, pour le résumé
  g.mv.snap = { w: s.w, t10: s.t10, t5: s.t5, t3: s.t3, t20: s.t20 || 0, b30: s.b30 || 0, b10: s.b10 || 0, pts: s.pts, n: s.n };   // sert de nouveau point de départ pour la prochaine promotion
  g.mv.type = type; g.mv.reason = reason;   // la raison la plus récente, montrée dans le résumé de fin de saison
  (g.mv.moves = g.mv.moves || []).push({ fromL, toL, type, reason, pts: s.pts, w: s.w, t10: s.t10 });   // chaque passage d'une ligue à l'autre (plusieurs possibles dans la même saison)
  MV_LOG.push([id, fromL, toL, type, reason]);
  S.L[fromL] = S.L[fromL].filter(x => x !== id);
  S.L[toL].push(id);
  const text = nameOf(id) + (type === 'up' ? ' monte en Ligue ' + (toL + 1) + ' en pleine saison (' + reason + ') !' : ' d\u00e9gringole en Ligue ' + (toL + 1) + ' apr\u00e8s ' + reason + '.');
  S.news.unshift({ s: S.season, t: S.t, text, l: -1, ids: [id] });
  if (S.news.length > IBX_MAX) S.news.length = IBX_MAX;
}
/* Raison d'un changement de ligue en cours de saison, lue dans l'historique des tournois de la saison s.
   kind 'gh' : promu depuis la ligue l (il reste \u00e0 son classement) ; 'mv' : arriv\u00e9 dans la ligue l. */
function mvReason(id, s, l, kind) {
  const H = S.hist[s - 1]; if (!H) return null; let hit = null;
  H.t.forEach((t, i) => { (t && t.mvs || []).forEach(m => { if (m[0] === id && (kind === 'gh' ? m[1] === l : m[2] === l)) hit = { m, t: i + 1 }; }); });
  if (!hit) return null;
  const [, fromL, toL, type, reason] = hit.m, who = id === 0 ? 'Tu ' : '';
  if (kind === 'gh') return (id === 0 ? 'Tu es mont\u00e9' : 'Mont\u00e9') + ' en Ligue ' + (toL + 1) + ' apr\u00e8s le tournoi ' + hit.t + ' : ' + reason + '. ' + (id === 0 ? 'Tu restes' : 'Reste') + ' au classement de cette ligue, sans y prendre de place.';
  return (type === 'up' ? (id === 0 ? 'Tu es mont\u00e9' : 'Mont\u00e9') + ' de la Ligue ' + (fromL + 1) + ' apr\u00e8s le tournoi ' + hit.t + ' : ' + reason : (id === 0 ? 'Tu es descendu' : 'Descendu') + ' de la Ligue ' + (fromL + 1) + ' apr\u00e8s le tournoi ' + hit.t + ', ' + reason) + '. Prot\u00e9g\u00e9 contre la rel\u00e9gation de fin de saison.';
}
function mvShort(id, s, l, kind) {
  const H = S.hist[s - 1]; let hit = null; if (H) H.t.forEach(t => { (t && t.mvs || []).forEach(m => { if (m[0] === id && (kind === 'gh' ? m[1] === l : m[2] === l)) hit = m; }); });
  return hit ? hit[4] : null;
}
function mvPill(id, s, l, kind) {
  const tip = mvReason(id, s, l, kind) || (kind === 'gh' ? 'Promu en cours de saison : reste au classement de cette ligue' : 'Arriv\u00e9 en cours de saison : prot\u00e9g\u00e9 contre la rel\u00e9gation');
  const down = kind === 'mv' && /^(Tu es descendu|Descendu)/.test(tip);
  return '<span class="hx' + (kind === 'gh' ? ' hxp' : '') + '" tabindex="0" role="button" data-mw="' + esc(tip) + '" aria-label="' + esc(tip) + '">' + (kind === 'gh' ? 'promu \u25B2' : down ? 'relégué \u25BC' : 'promu \u25B2') + '</span>';
}
function mvSince(id) { const s = getSt(id), g = gmv(id), b = (g && g.mv && g.mv.snap) || {}, d = k => (s[k] || 0) - (b[k] || 0); return { w: d('w'), t3: d('t3'), t5: d('t5'), t10: d('t10'), t20: d('t20'), b30: d('b30'), b10: d('b10') }; }
/* Indicateur « à un résultat d'un changement de ligue » : ▲ promotion possible au prochain tournoi, ▼ relégation possible.
   Survol (ordinateur) ou toucher (téléphone) : les conditions et où en est le golfeur. */
function mvWatch(id, l) {
  if (!S || !S.st[id] || leagueOf(id) !== l || !gmv(id)) return null;
  const c = mvSince(id), up = [], dn = [];
  if (l > 0) {
    const r1 = c.t3 >= 1 && !(c.w >= 1 && c.t3 >= 2);
    up.push([r1, '1 victoire + 1 autre top-3', c.w >= 1 ? '1 victoire, il manque 1 autre top-3' : c.t3 + ' top-3, il manque 1 victoire']);
    up.push([c.t5 === 2, '3 top-5', c.t5 + ' sur 3']); up.push([c.t10 === 3, '4 top-10', c.t10 + ' sur 4']); up.push([c.t20 === 4, '5 top-20', c.t20 + ' sur 5']);
  }
  if (l < 3 && !exInfo(id, l)) { dn.push([c.b30 === relB30() - 1, relB30() + ' fois dans les 30 derniers', c.b30 + ' sur ' + relB30()]); dn.push([c.b10 === 2, '3 fois dans les 10 derniers', c.b10 + ' sur 3']); }
  const u = up.filter(x => x[0]), d = dn.filter(x => x[0]); if (!u.length && !d.length) return null;
  const who = id === 0 ? 'Tu es' : 'Il est', mk = (list, ok) => list.map(x => (x[0] ? '\u25CF ' : '\u25CB ') + x[1] + ' : ' + x[2]).join('\n');
  const tip = (u.length ? who + ' \u00e0 un r\u00e9sultat d\u2019une promotion en Ligue ' + l + '.\n' + mk(up) : '') + (u.length && d.length ? '\n\n' : '') + (d.length ? who + ' \u00e0 un r\u00e9sultat d\u2019une rel\u00e9gation en Ligue ' + (l + 2) + '.\n' + mk(dn) : '') + '\n\nCompt\u00e9 ' + (S.cur ? 'avant ce tournoi, ' : '') + 'depuis ' + (gmv(id).mv ? 'l\u2019arriv\u00e9e dans la ligue' : 'le d\u00e9but de la saison') + '.';
  const best = list => list.map(x => x[2].match(/^(\d+) sur (\d+)/)).filter(Boolean).map(m => m[1] + '/' + m[2])[0] || '1/2';
  return { up: !!u.length, dn: !!d.length, tip, lbl: u.length ? best(u) : best(d) };
}
function mvBadge(id, l) {
  const m = mvWatch(id, l); if (!m) return '';
  const both = m.up && m.dn, cls = m.up ? 'up' : 'dn', sym = both ? '\u25B2\u25BC' : m.up ? '\u25B2' : '\u25BC';
  return '<span class="mw ' + cls + '" tabindex="0" role="button" data-mw="' + esc(m.tip) + '" aria-label="' + esc(m.tip) + '">' + sym + ' ' + m.lbl + '</span>';
}
function checkInSeasonMoves() {
  const since = mvSince;
  for (let l = 3; l >= 1; l--) {                          // du bas vers le haut : un golfeur ne peut sauter qu'un palier par tournoi
    S.L[l].slice().forEach(id => {
      if (!gmv(id)) return;
      const why = promoReason(since(id)); if (why) moveGolferInSeason(id, l, l - 1, 'up', why);
    });
  }
  for (let l = 0; l < 3; l++) {                            // relégation : Ligue 1 à 3 (rien sous la Ligue 4)
    S.L[l].slice().forEach(id => {
      if (!gmv(id)) return;
      const why = relegReason(since(id)); if (!why || exInfo(id, l)) return;   // exempté : jamais relégué
      if (carEligible(id, l)) { carUse(id, S.season); return; }
      moveGolferInSeason(id, l, l + 1, 'down', why);
    });
  }
}
/* ---- Histoire présimulée : la ligue existe depuis N saisons quand le joueur arrive ----
   Les N saisons se jouent entièrement entre IA (mêmes règles que le jeu : tournois, mouvements en cours de saison,
   intersaisons, retraites, recrues, records, index). L'année affichée de la saison 1 est (année d'arrivée − N),
   donc le joueur arrive toujours pile à l'année choisie. Les terrains de l'histoire sont générés à part : ceux du
   joueur (onglet Terrains) sont remis tels quels à son arrivée. L'état S.presim permet de reprendre si l'app se ferme. */
const PRESIM_MAX = 100;
/* v321 : saisons cachées (monde de départ). Elles se jouent comme les autres, puis worldReset() efface toute leur
   histoire (tournois, records, palmarès, Temple, World Ranking, nouvelles, gains et victoires) et renumérote : la
   saison qui suit devient la saison 1. Restent : les golfeurs, leurs ligues, âges, niveaux, potentiels, talents,
   tempéraments, index, la classe de recrues et les familles. */
const WARM_N = 20;
function presimSetup(n, league, warm) {
  const fresh = Array.from({ length: N_TOURN }, (_, i) => Object.assign({ name: 'Terrain ' + (i + 1), pars: DEFAULT_PARS.slice() }, newCourseMeta()));
  warm = warm || 0;
  S.presim = { n: n + warm, left: n + warm, league, orig: S.courses, w: warm };
  S.courses = fresh;
  S.joinS = n + 1;
}
function worldReset(D) {
  const sh = v => v == null ? v : v - D;
  Object.values(S.G).forEach(g => {
    g.cw = 0; g.ce = 0; delete g.ace; delete g.alb; delete g.e4; delete g.w1; delete g.w1s; delete g.w1y; g.mv = null;
    if (g.lt) g.lt.s = sh(g.lt.s);
    if (g.rcl != null) g.rcl = sh(g.rcl); if (g.rcs != null) g.rcs = sh(g.rcs); if (g.rc && g.rc.s != null) g.rc.s = sh(g.rc.s);
    if (g.oh) g.oh = g.oh.slice(-3).map(x => [x[0] - D].concat(x.slice(1)));
    if (g.sx) { const o = {}; Object.keys(g.sx).map(Number).filter(k => k > D - 2).forEach(k => { o[k - D] = g.sx[k]; }); g.sx = o; }
    if (g.hc && g.hc.d) g.hc.d.forEach(x => { x[0] -= D; });
    (g.tr || []).forEach(t => { if (t.rv != null) t.rv -= D; if (t.h) t.h.forEach(x => { x[0] -= D; }); });
    if (clKnown(g)) g.cm = 1; g.clh = []; g.skh = []; g.cxn = 0; g.cxw = 0;   // le tempérament reste connu, le compteur repart à zéro
  });
  S.ixPre = {}; Object.keys(S.alm || {}).map(Number).filter(k => k > D - 5).forEach(k => { if (S.alm[k] && S.alm[k].ix) S.ixPre[k - D] = S.alm[k].ix; });   // v326 : moyennes d'index gardées pour la cible de relégation
  Object.values(S.old || {}).forEach(o => { o.pre = 1; o.cw = 0; o.ce = 0; if (o.s != null) o.s -= D; if (o.oh) o.oh = o.oh.slice(-1).map(x => [x[0] - D].concat(x.slice(1))); });
  if (S.rcl && S.rcl.s != null) S.rcl.s -= D;
  S.season -= D; S.hist = [{ s: S.season, t: Array(N_TOURN).fill(null), end: null }];
  S.news = []; S.last = null; S.rec = { L: [{}, {}, {}, {}], C: {} }; S.hof = { m: [], x: {}, upTo: S.season - 1 }; S.alm = {}; S.paFrom = null;
  delete S.off; delete S.fut;
  try { WRM.clear(); } catch (e) { } WR_CACHE = null; try { ALM_X = null; HOF_MEMO = null; } catch (e) { }
}
function presimTournament() {
  const course = S.courses[S.t], pars = course.pars.slice(), index = (course.index || defaultIndex()).slice();
  const ctx = Object.assign(newCtx(), { windBump: [windBump(course.wind || 'none'), windBump(course.wind2 || 'none')], crDelta: crDeltaOf(course, pars), distDelta: distDelta(course.dist), slopeFactor: slopeEffFactor(course.slope) });
  const grid = gridFor(pars), purse = cPurse(course), pl = S.presim ? Math.min(3, S.presim.league) : 0;
  const lg = [];
  for (let l = 0; l < 4; l++) {
    const r = simTournamentAI(MODEL, grid, pars, S.L[l], S.G, ctx, S.settings.cut, index, !!S.one);
    lg[l] = { rows: r.rows, cut: r.cut, playoff: r.playoff, h: r.h, pay: computePayouts(paidRows(r.rows, r.cut), purse * LEAGUE_PURSE_PCT[l]) }; if (r.po) lg[l].po = r.po;
    if (S.one) lg[l].one = 1;
  }
  const maj = isMajorT(S.t); if (maj) boostL1(lg);
  const rankSnap = () => [0, 1, 2, 3].map(l => { const ra = rankAll(l), ids = ra.map(r => r.id), rk = {}, pts = {}, gh = {}; ra.forEach((r, i) => { rk[r.id] = i + 1; pts[r.id] = r.pts; if (r.gh) gh[r.id] = 1; }); return { ids, rk, pts, gh }; });
  const pre = rankSnap();
  for (let l = 0; l < 4; l++) lg[l].rows.forEach(([id, pos, r1, r2, pts], ri, rws) => {
    const s = getSt(id); s.pts += pts; s.n++; if (pos === 1) s.w++; if (pos > 0 && pos <= 10) s.t10++; if (pos > 0 && pos <= 5) s.t5++; if (pos > 0 && pos <= 3) s.t3++;
    if (pos > 0 && pos <= 20) s.t20 = (s.t20 || 0) + 1; if (ri >= rws.length - 30) s.b30 = (s.b30 || 0) + 1; if (ri >= rws.length - 10) s.b10 = (s.b10 || 0) + 1;
    if (pos === 0 || rowOut([id, pos, r1, r2], lg[l])) { s.mc++; s.mcs++; } else { s.mcs = 0; }
    s.sum += r1 + (r2 || 0); s.rds += r2 === null ? 1 : 2;
    addEarnings(id, lg[l].pay[id] || 0);
  });
  try { clExpTourn(lg, pars); } catch (e) { }
  MV_LOG = []; checkInSeasonMoves(); const mvs = MV_LOG.slice();
  const post = rankSnap();
  for (let l = 0; l < 4; l++) { const g = S.G[lg[l].rows[0][0]]; if (g) { g.cw = (g.cw || 0) + 1; phenWin(g, l); } }
  const evs = scanExtremes(lg, pars);
  const c = { name: course.name };
  const quiet = playedTournaments() < 3;
  const recs = updateRecords(lg, c, evs);
  Object.values(S.G).forEach(g => { afterTournament(g); });
  inSeasonDev(lg);
  hcTournament({ par: parTotal(pars), pars, index, cr: course.cr != null ? course.cr : parTotal(pars) - 1, slope: course.slope || 128, ctx, s: S.season, t: S.t }, lg); paTournament(pars, lg); skTournament(pars, lg, S.season);
  const sums = [0, 1, 2, 3].map(l => buildSummary({ l, rows: lg[l].rows, cut: lg[l].cut, one: lg[l].one, playoff: lg[l].playoff, par: parTotal(pars), pay: lg[l].pay, evs, recs: quiet ? [] : recs, pre: pre[l], post: post[l], tIdx: S.t, pl, me: false }));
  seasonHist().t[S.t] = { name: course.name, par: parTotal(pars), pars, index, tee: course.tee, dist: course.dist, cr: course.cr, slope: course.slope, pin: course.pin, wind: course.wind, pin2: course.pin2, wind2: course.wind2, purse, pl, lg, recap: '', evs: evs.slice(0, 40), ctx, rb: 0, ra: 0, pb: 0, r1lead: null, recs: quiet ? [] : recs, sum: sums, pre: 1, mvs };
  if (maj) { const E = seasonHist().t[S.t]; E.maj = majorName(S.t); E.pm = MAJ.purse; }
  rcTournament(seasonHist().t[S.t], pars, index, ctx);
  try { rfNews(false); } catch (e) { }
  S.last = { s: S.season, t: S.t }; wrStore();
  S.t++;
}
function presimSeason() {
  if (S.t === 0) { if (BANK.length && crfPool().length) drawSeasonCourses(); else randomizeSeasonCourses(); }   // histoire : terrains tirés dans ta liste selon tes filtres (sinon terrains fictifs)
  /* v403 : les saisons d'histoire suivent aussi « Trier automatiquement à chaque nouvelle saison » (trajet le plus court),
     comme les saisons jouées ; pas pendant les saisons cachées, effacées ensuite. */
  if (S.t === 0 && !(S.presim && S.presim.w) && BANK.length) { try { if (crf().autoKm) voySortApply(true, 400000); } catch (e) { } }
  while (S.t < N_TOURN) presimTournament();
  doSeasonEnd();
}
/* Une place pour le joueur dans une ligue pleine : le golfeur le plus faible de chaque ligue descend d'un cran,
   jusqu'en Ligue 4, où la recrue la plus faible de l'intersaison n'est finalement pas retenue. */
function makeRoom(l) {
  if (S.cur || S.t !== 0 || S.L[l].length < (CFG.varLg && l < 3 ? vlMax(l) : FIELD)) return;
  const weakest = (ids, pool) => pool.filter(id => id !== 0 && S.G[id]).sort((a, b) => S.G[a].o - S.G[b].o)[0];
  for (let k = l; k < 3; k++) {
    const id = weakest(S.L[k], S.L[k]); if (id === undefined) return;
    S.L[k] = S.L[k].filter(x => x !== id); S.L[k + 1].push(id);
  }
  const L4 = S.L[3], fresh = L4.filter(id => id !== 0 && S.G[id] && !S.G[id].cs);
  const cut = weakest(L4, fresh.length ? fresh : L4); if (cut === undefined) return;
  S.L[3] = L4.filter(x => x !== cut); delete S.G[cut]; delete S.st[cut];
  const H = S.hist[S.hist.length - 2];
  if (H && H.end && H.end.x) { const n0 = H.end.x.rk.length; H.end.x.rk = H.end.x.rk.filter(r => r[0] !== cut); if (H.end.x.rk.length < n0) H.end.rookies = Math.max(0, (H.end.rookies || 1) - 1); }
}
function finishPresim() {
  const P = S.presim; if (!P) return;
  S.courses = P.orig; delete S.presim; S.debut = S.season;
  autoDrawCourses();
  if (S.mode !== 'sim' && !S.spect) { if (P.league === 4) plJoinRc(); else { makeRoom(P.league); S.L[P.league].push(0); } S.st[0] = newStanding(); }
  S.news = S.news.filter(n => n.s >= S.season - 1);
  persist();
  if (S.mode === 'sim' && !S.spect) go('playerCreate', { league: P.league }); else go('home');
  toast(P.n ? 'Bienvenue en ' + yr(S.season) + ' : ' + P.n + ' saison' + (P.n > 1 ? 's' : '') + ' d’histoire' : 'Bienvenue en ' + yr(S.season));
}
function presimProgressHTML() {
  const P = S.presim, done = P.n - P.left;
  if (P.w) { const tot = P.n, vis = P.n - P.w;   // v321 : saisons cachées
    return scene() + '<div class="wrap sc"><div class="top"><div><h1>Indoor Golf Career</h1><div class="ctx">Le monde du golf prend forme…</div></div></div><div class="narrow"><div class="block">' +
      '<div class="ctx">' + Math.round(done / tot * 100) + ' %</div>' +
      '<span class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="' + tot + '" aria-valuenow="' + done + '" style="height:12px;margin:10px 0"><i style="width:' + Math.round(done / tot * 100) + '%"></i></span>' +
      '<p class="small mute" style="margin:0">Les golfeurs vieillissent, progressent, prennent leur retraite et de nouvelles recrues arrivent, pour que le circuit soit vivant dès le départ. Cette période reste invisible : l’histoire commence à zéro' + (vis ? ', puis ' + vis + ' saison' + (vis > 1 ? 's' : '') + ' d’histoire se joue' + (vis > 1 ? 'nt' : '') : '') + '.</p></div></div></div>'; }
  return scene() + '<div class="wrap sc"><div class="top"><div><h1>Indoor Golf Career</h1><div class="ctx">L’histoire du circuit s’écrit…</div></div></div><div class="narrow"><div class="block">' +
    '<div class="ctx">Saison ' + yr(Math.min(S.season, P.n)) + ' · ' + done + ' sur ' + P.n + '</div>' +
    '<span class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="' + P.n + '" aria-valuenow="' + done + '" style="height:12px;margin:10px 0"><i style="width:' + Math.round(done / P.n * 100) + '%"></i></span>' +
    '<p class="small mute" style="margin:0">' + (P.n > 1 ? 'Les ' + P.n + ' saisons avant ton arrivée se jouent entre les golfeurs du circuit (' + yr(1) + ' à ' + yr(P.n) + ').' : 'La saison avant ton arrivée (' + yr(1) + ') se joue entre les golfeurs du circuit.') + ' Tu fais tes débuts en ' + yr(P.n + 1) + '.</p></div></div></div>';
}
let PRESIM_RUN = false;
function runPresim() {
  $tabs.hidden = true;
  if (PRESIM_RUN) { $app.innerHTML = presimProgressHTML(); return; }
  PRESIM_RUN = true;
  const step = () => {
    const P = S && S.presim; if (!P) { PRESIM_RUN = false; return; }
    if (P.left <= 0) { PRESIM_RUN = false; finishPresim(); return; }
    presimSeason(); P.left--;
    if (P.w && P.n - P.left >= P.w) { worldReset(P.w); P.n -= P.w; P.w = 0; }   // v321 : fin des saisons cachées
    persistNow();   // pas de d\u00e9lai : chaque saison termin\u00e9e est sauvegard\u00e9e (reprise possible si l'app se ferme)
    $app.innerHTML = presimProgressHTML();
    setTimeout(step, 0);
  };
  $app.innerHTML = presimProgressHTML();
  setTimeout(step, 30);
}

/* ---- Fin de tournoi : ronde 2 des IA, autres ligues, classements, actualités ---- */
function finishTournament() {
  const c = S.cur, pl = c.pl, grid = gridFor(c.pars);
  const rankBefore = c.sw ? 0 : seasonRank(pl, 0), ptsBefore = c.sw ? 0 : getSt(0).pts;
  const one = !!S.one;
  if (!one && (!c.made || c.phase === 'cut')) { /* IA seulement pour la ronde 2 */
    if (c.r === 0) { c.r = 1; simAIRound(1); }
  }
  aiFill(18, true);
  const entries = one ? fld(c).map(id => ({ id, r1: c.r1[id], r2: null })) : fld(c).map(id => {
    if (id === 0) return { id: 0, r1: c.r1[0], r2: c.made ? c.r2p : null };
    if (c.r1[id] > c.cut) return { id, r1: c.r1[id], r2: null };
    return { id, r1: c.r1[id], r2: relTo(c.ai[id], c.pars, 18) };
  });
  const PO = c.po && c.po.w != null ? { w: c.po.w } : { pars: c.pars, index: c.index, ctx: c.ctx };
  const fin = one ? finalize1(entries, c.cut, PO) : finalize(entries, PO);
  const lg = [null, null, null, null];
  const hstr = {};
  if (c.h1 && c.pr1) fld(c).forEach(id => {
    const r1h = id === 0 ? c.pr1 : c.h1[id]; if (!r1h) return;
    let str = encHoles(r1h);
    const e = entries.find(x => x.id === id);
    if (e && e.r2 !== null) { const r2h = id === 0 ? myHoles(c) : c.ai[id]; if (r2h) str += encHoles(r2h); }
    hstr[id] = str;
  });
  lg[pl] = { rows: fin.rows, cut: c.rc ? null : c.cut, playoff: fin.playoff, h: hstr, pay: computePayouts(paidRows(fin.rows, c.cut), c.rc ? 0 : c.purse * LEAGUE_PURSE_PCT[pl]) };
  if (c.po && c.po.h && c.po.h.length) lg[pl].po = { ids: c.po.ids, h: c.po.h }; else if (fin.po) lg[pl].po = fin.po;
  if (c.rc) lg[pl].rows.forEach(r => { r[4] = 0; });
  if (one) lg[pl].one = 1;
  for (let l = 0; l < 4; l++) {
    if (l === pl) continue;
    if (c.fin) { lg[l] = emptyLg(); continue; }
    const o = c.oth && c.oth[l];
    if (o && o.h1) {   // les autres ligues ont joué en même temps : on garde exactement leurs cartes
      othR1(l);
      if (one) {
        const hs = {}; o.ids.forEach(id => { hs[id] = encHoles(o.h1[id]); });
        const f = finalize1(o.ids.map(id => ({ id, r1: o.r1[id], r2: null })), o.cut, { pars: c.pars, index: c.index, ctx: c.ctx });
        lg[l] = { rows: f.rows, cut: o.cut, playoff: f.playoff, h: hs, one: 1, pay: computePayouts(paidRows(f.rows, o.cut), c.purse * LEAGUE_PURSE_PCT[l]) }; if (f.po) lg[l].po = f.po;
        continue;
      }
      if (!o.h2) { c.r = 1; othRound(1); }
      const hs = {}, ent = o.ids.map(id => {
        hs[id] = encHoles(o.h1[id]);
        if (o.r1[id] > o.cut) return { id, r1: o.r1[id], r2: null };
        hs[id] += encHoles(o.h2[id]); return { id, r1: o.r1[id], r2: relTo(o.h2[id], c.pars, 18) };
      });
      const f = finalize(ent, { pars: c.pars, index: c.index, ctx: c.ctx });
      lg[l] = { rows: f.rows, cut: o.cut, playoff: f.playoff, h: hs, pay: computePayouts(f.rows, c.purse * LEAGUE_PURSE_PCT[l]) }; if (f.po) lg[l].po = f.po;
      continue;
    }
    const r = simTournamentAI(MODEL, grid, c.pars, S.L[l], S.G, c.ctx, S.settings.cut, c.index, one);
    lg[l] = { rows: r.rows, cut: r.cut, playoff: r.playoff, h: r.h, pay: computePayouts(paidRows(r.rows, r.cut), c.purse * LEAGUE_PURSE_PCT[l]) }; if (r.po) lg[l].po = r.po;
    if (one) lg[l].one = 1;
  }
  if (!c.sw && lg[pl] && lg[pl].rows && lg[pl].rows[0] && lg[pl].rows[0][0] === 0) sndAsk('win');
  const RC = c.rc ? lg[pl] : null; if (RC) lg.length = 4;   // v249 : la classe de recrues est rangée à part (T.rc)
  if (c.fin) { lg[0].rows.forEach(r => { r[4] = Math.round(r[4] * FIN.pts); }); lg[0].fin = 1; }   // Finale : points ×2 (la bourse ×2 est déjà dans c.purse)
  else if (isMajorT(S.t)) boostL1(lg);   // Majeur : points ×2, bourse ×1,5 en L1
  // avant d'appliquer les points : classements d'avant-tournoi (résumés) et meneurs
  const rankSnap = () => [0, 1, 2, 3].map(l => { const ra = rankAll(l), ids = ra.map(r => r.id), rk = {}, pts = {}, gh = {}; ra.forEach((r, i) => { rk[r.id] = i + 1; pts[r.id] = r.pts; if (r.gh) gh[r.id] = 1; }); return { ids, rk, pts, gh }; });
  const pre = rankSnap();
  const leaders = pre.map(x => x.ids[0]);
  // classements de saison
  for (let l = 0; l < 4; l++) lg[l].rows.forEach(([id, pos, r1, r2, pts], ri, rws) => {
    const s = getSt(id); s.pts += pts; s.n++; if (pos === 1) s.w++; if (pos > 0 && pos <= 10) s.t10++; if (pos > 0 && pos <= 5) s.t5++; if (pos > 0 && pos <= 3) s.t3++;
    if (pos > 0 && pos <= 20) s.t20 = (s.t20 || 0) + 1; if (ri >= rws.length - 30) s.b30 = (s.b30 || 0) + 1; if (ri >= rws.length - 10) s.b10 = (s.b10 || 0) + 1;
    if (pos === 0 || rowOut([id, pos, r1, r2], lg[l])) { s.mc++; s.mcs++; } else { s.mcs = 0; }
    s.sum += r1 + (r2 || 0); s.rds += r2 === null ? 1 : 2;
    addEarnings(id, lg[l].pay[id] || 0);
  });
  try { clExpTourn(lg, c.pars); } catch (e) { }
  MV_LOG = []; if (!c.fin) checkInSeasonMoves(); const mvs = MV_LOG.slice();
  const post = rankSnap();
  // titres en carrière + actualités
  const news = [];
  let BADQ = 0;   // v286 : citation du meneur de ta ligue qui rate la coupure
  const quiet = playedTournaments() < 3;
  for (let l = 0; l < 4; l++) {
    if (!lg[l].rows.length) continue;
    const w = lg[l].rows[0][0];
    if (w === 0) { S.pk.cw++; if (S.G[0]) S.G[0].cw = (S.G[0].cw || 0) + 1; continue; }
    const g = S.G[w]; g.cw = (g.cw || 0) + 1;
    if (phenWin(g, l)) news.push({ l, pri: 3, t: '\u26a1 ' + nameOf(w) + ' confirme ce que tout le monde soup\u00e7onnait : un ph\u00e9nom\u00e8ne est n\u00e9 (' + (g.w1s >= 3 ? g.w1s + ' victoires en Ligue 1 cette saison' : g.w1 + ' victoires en Ligue 1 en carri\u00e8re') + ').', ids: [w] });
    if (g.cw === 1) news.push({ l, t: nameOf(w) + ' remporte son premier titre en ' + LEAGUE_SHORT[l] + '.', ids: [w] });
  }
  for (let l = 0; l < 4; l++) {
    const ld = leaders[l]; if (S.t < 2 || ld === 0) continue;
    const row = lg[l].rows.find(r => r[0] === ld);
    if (row && rowMC(row, lg[l])) { news.push({ l, t: nameOf(ld) + ', meneur du classement en ' + LEAGUE_SHORT[l] + (row[1] === 0 ? ', rate la coupure.' : ', termine hors de la ligne de paye.'), ids: [ld] });   /* v378 : en 1 ronde, hors de la ligne de paye */ if (l === pl && !BADQ && S.G[ld]) BADQ = ld; }
  }
  // v263 : une rivalité naît (le tournoi en cours n'est pas encore dans l'historique)
  try { if (pl >= 0 && pl < 4 && lg[pl] && lg[pl].rows) { const rows = lg[pl].rows, me = rows.find(r => r[0] === 0);
    if (me && me[1] && me[1] <= 5) { const tot = r => r[2] + (r[3] || 0), maj = !!(c.fin || isMajorT(S.t)), R0 = {}; rivalryDataAll(0).forEach(o => { R0[o.id] = o; });
      rows.forEach(r => { if (!r[0]) return; const w = rivMomentW(me, r, tot, maj); const o = R0[r[0]], bc = o ? o.cum : 0, bn = o ? o.mo.length : 0, was = bc >= RIV.born && bn >= RIV.nmin; if (w && !was && bc + w >= RIV.born && bn + 1 >= RIV.nmin) news.push({ l: pl, pri: 3, me: true, t: '\ud83d\udd25 Une rivalit\u00e9 est n\u00e9e entre toi et ' + nameOf(r[0]) + '.', ids: [r[0]] }); }); } } } catch (e) { }
  // événements rares (trou d'un coup, albatros, aigle sur par 4)
  const evs = scanExtremes(lg, c.pars);
  evs.filter(e => e.kind !== 'e4').forEach(e => news.push({ l: e.l, pri: 1, me: e.id === 0, t: (e.id === 0 ? 'Tu r\u00e9ussis ' : nameOf(e.id) + ' r\u00e9ussit ') + EV_LABEL[e.kind] + ' au trou ' + e.hole + ' (' + LEAGUE_SHORT[e.l] + ', ronde ' + e.round + ').', ids: e.id === 0 ? [] : [e.id] }));
  // records
  const recs = c.fin ? [] : updateRecords(lg, c, evs);
  if (!quiet) recs.slice().sort((a, b) => (b.me - a.me) || ((b.l === pl) - (a.l === pl))).slice(0, 2).forEach(r => news.push({ l: r.l, t: r.text, ids: r.ids || [] }));
  // évolution des golfeurs + nouvelles séquences (creux / passes chaudes)
  const seqEv = [];
  if (!c.fin) { Object.values(S.G).forEach(g => { const ev = afterTournament(g); if (ev) seqEv.push({ id: g.id, ev }); }); inSeasonDev(lg); }
  // v334 : les nouvelles de forme viennent des résultats (rfNews, après l'enregistrement du tournoi)
  const seqNews = news.filter(n => n.seq).slice(0, 2), otherNews = news.filter(n => !n.seq).sort((a, b) => ((b.me ? 2 : 0) + (b.pri || 0)) - ((a.me ? 2 : 0) + (a.pri || 0)) || (a.l === pl ? -1 : 0) - (b.l === pl ? -1 : 0)).slice(0, 3);
  seqNews.concat(otherNews).forEach(n => S.news.unshift({ s: S.season, t: S.t + 1, text: n.t, l: n.l, ids: n.ids || [] }));
  /* v286 : la citation du gagnant (ta ligue, sinon la L1), dans le ton de sa personnalité médiatique */
  try {
    const mq = (id, kind, l) => { const g = S.G[id], q = g && mediaQuote(g, kind); if (q) S.news.unshift({ s: S.season, t: S.t + 1, text: '🎤 ' + nameOf(id) + ' (' + MEDIA_BY[g.bio.pm].fr + ') : « ' + q + ' »', l, ids: [id] }); };
    if (BADQ) mq(BADQ, 'b', pl);
    const ql = pl >= 0 && pl < 4 && lg[pl] && lg[pl].rows && lg[pl].rows.length && lg[pl].rows[0][0] !== 0 ? pl : 0, wq = lg[ql] && lg[ql].rows && lg[ql].rows.length ? lg[ql].rows[0][0] : 0;
    if (wq) mq(wq, 'q', ql);
  } catch (e) { }
  if (S.news.length > IBX_MAX) S.news.length = IBX_MAX;
  // historique
  if (!c.fin) { hcTournament({ par: parTotal(c.pars), pars: c.pars, index: c.index, cr: c.cr != null ? c.cr : parTotal(c.pars) - 1, slope: c.slope || 128, ctx: c.ctx, s: S.season, t: S.t }, lg); paTournament(c.pars, lg); }
  skMine(c, RC ? Object.assign(lg.slice(), { [pl]: RC }) : lg); skTournament(c.pars, lg.map(L => L || null), S.season);
  const PLG = RC || lg[pl];
  if (RC) hcTournament({ par: parTotal(c.pars), pars: c.pars, index: c.index, cr: c.cr != null ? c.cr : parTotal(c.pars) - 1, slope: c.slope || 128, ctx: c.ctx, s: S.season, t: S.t }, [RC, { rows: [] }, { rows: [] }, { rows: [] }]);
  const recap = one ? buildRecap1(PLG, c) : buildRecap(PLG, c);
  const duo = S.duo && !c.sw ? duoRecord(PLG, c, pl) : null;
  const sums = [0, 1, 2, 3].map(l => c.fin && l !== 0 ? null : buildSummary({ l, rows: lg[l].rows, cut: lg[l].cut, one: lg[l].one, playoff: lg[l].playoff, par: parTotal(c.pars), pay: lg[l].pay, evs, recs: quiet ? [] : recs, pre: pre[l], post: post[l], tIdx: c.fin ? N_TOURN : S.t, pl, me: l === pl }));
  const rankAfter = seasonRank(leagueOf(0) >= 0 ? leagueOf(0) : pl, 0);   // le joueur a pu changer de ligue après ce tournoi
  const H = seasonHist();
  H.t[S.t] = { name: c.name, par: parTotal(c.pars), pars: c.pars.slice(), index: c.index, tee: c.tee, dist: c.dist, cr: c.cr, slope: c.slope, pin: c.pin, wind: c.wind, pin2: c.pin2, wind2: c.wind2, purse: c.purse, pl, lg, recap, evs: evs.slice(0, 40), ctx: c.ctx, rb: rankBefore, ra: rankAfter, pb: ptsBefore, r1lead: c.lead1, recs: quiet ? [] : recs, sum: sums, mvs };
  if (duo) H.t[S.t].duo = duo;
  if (c.po && c.po.h && c.po.h.length) H.t[S.t].po = { ids: c.po.ids, h: c.po.h };
  if (c.fin) {   // Finale : rangée à part, la saison reste à 10 tournois
    H.fin = Object.assign(H.t[S.t], { fin: 1, field: fld(c).length }); H.t.length = N_TOURN;
    finNews(lg[0], pre[0].ids[0]);
    S.cur = null; VIEW = { name: 'tourn', s: S.season, t: N_TOURN, l: 0, mode: 'res' };
    persist(); autoBackup(); return;
  }
  if (c.maj) { H.t[S.t].maj = c.maj; H.t[S.t].pm = MAJ.purse; }
  if (RC) H.t[S.t].rc = { rows: RC.rows, h: RC.h, cut: null, playoff: RC.playoff, sx: RC.sx, sp: RC.sp };
  else try { rcTournament(H.t[S.t], c.pars, c.index || defaultIndex(), c.ctx); } catch (e) { }
  try { rfNews(!quiet); } catch (e) { }
  S.last = { s: S.season, t: S.t }; wrStore();
  S.cur = null; S.t++;
  VIEW = c.sw ? { name: 'tourn', s: S.season, t: S.t - 1, l: pl, mode: 'res' } : { name: 'tournEnd' };
  if (c.sw && S.ui) S.ui.spl = 0;   // v310 : sans golfeur, la L1 redevient la ligue suivie par défaut
  persist(); autoBackup();
}


/* Événements rares de la ronde : trou d'un coup (par 3), albatros (par 5), aigle sur un par 4.
   Lus dans les cartes trou par trou de toutes les ligues ; les compteurs de carrière sont mis à jour. */
function scanExtremes(lg, pars) {
  const evs = [];
  for (let l = 0; l < 4; l++) {
    const h = lg[l].h; if (!h) continue;
    Object.keys(h).forEach(k => {
      const id = +k, str = h[k];
      for (let i = 0; i < str.length; i++) {
        const hole = i % 18, par = pars[hole], sc = parseInt(str.charAt(i), 36);
        const kind = par === 3 && sc === 1 ? 'ace' : par === 5 && sc === 2 ? 'alb' : par === 4 && sc === 2 ? 'e4' : null;
        if (!kind) continue;
        evs.push({ id, l, round: i < 18 ? 1 : 2, hole: hole + 1, kind });
        const src = id === 0 ? S.pk : S.G[id]; if (src) src[kind] = (src[kind] || 0) + 1;
      }
    });
  }
  return evs;
}
const EV_LABEL = { ace: 'un trou d\u2019un coup', alb: 'un albatros', e4: 'un aigle sur un par 4' };

function buildRecap(res, c) {
  const rows = res.rows, w = rows[0], parts = [];
  const second = rows.find(r => r[1] > 1 && r[1] !== 0);
  const wt = w[2] + w[3];
  let s = (w[0] === 0 ? 'Tu remportes' : nameOf(w[0]) + ' remporte') + ' le tournoi \u00e0 ' + fmt(wt);
  if (res.playoff) s += ', apr\u00e8s une prolongation.';
  else if (second) { const gap = (second[2] + second[3]) - wt; s += gap === 1 ? ', \u00e0 un coup du deuxi\u00e8me.' : ', avec ' + gap + ' coups d\u2019avance.'; }
  else s += '.';
  parts.push(s);
  if (c.lead1 !== null && c.lead1 !== w[0]) {
    const lr = rows.find(r => r[0] === c.lead1);
    if (lr) {
      if (c.lead1 === 0) parts.push('Tu menais apr\u00e8s la premi\u00e8re ronde (' + fmt(lr[2]) + ') mais ' + (lr[1] === 0 ? 'rates finalement la coupure' : 'termines au ' + ord(lr[1]) + ' rang') + '.');
      else parts.push(nameOf(c.lead1) + ' menait apr\u00e8s la premi\u00e8re ronde (' + fmt(lr[2]) + ') mais ' + (lr[1] === 0 ? 'rate finalement la coupure' : 'termine au ' + ord(lr[1]) + ' rang') + '.');
    }
  } else if (c.lead1 === w[0]) parts.push((w[0] === 0 ? 'Tu \u00e9tais' : nameOf(w[0]) + ' \u00e9tait') + ' en t\u00eate d\u00e8s la premi\u00e8re ronde.');
  // remont\u00e9e
  const r1rank = rankTies(rows.map(r => ({ id: r[0], tot: r[2] })));
  const r1pos = {}; r1rank.forEach(r => { r1pos[r.id] = r.pos; });
  let best = null;
  rows.forEach(r => { if (r[1] > 0) { const d = r1pos[r[0]] - r[1]; if (!best || d > best.d) best = { id: r[0], d, pos: r[1] }; } });
  if (best && best.d >= 20 && best.id !== w[0]) parts.push((best.id === 0 ? 'Tu grimpes' : nameOf(best.id) + ' grimpe') + ' de ' + best.d + ' places entre les deux rondes pour finir ' + ord(best.pos) + '.');
  // meilleure ronde
  let br = null;
  rows.forEach(r => { [r[2], r[3]].forEach((v, i) => { if (v !== null && (!br || v < br.v)) br = { id: r[0], v, i }; }); });
  if (br) parts.push('Meilleure ronde du tournoi : ' + nameOf(br.id) + ', ' + fmt(br.v) + ' (ronde ' + (br.i + 1) + ').');
  const me = rows.find(r => r[0] === 0);
  if (me) parts.push(me[1] === 0 ? 'Tu rates la coupure (' + fmt(me[2]) + ' contre une coupure \u00e0 ' + fmt(c.cut) + ').' : me[1] === 1 ? 'Tu empoches ' + me[4] + ' points.' : 'Tu termines ' + (rows.filter(r => r[1] === me[1]).length > 1 ? 'T' : '') + me[1] + ' \u00e0 ' + fmt(me[2] + me[3]) + ' et rapportes ' + me[4] + ' points.');
  return parts.join(' ');
}



