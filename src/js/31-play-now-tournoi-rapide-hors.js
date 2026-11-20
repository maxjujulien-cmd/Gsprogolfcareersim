/* ======== Play Now : tournoi rapide hors carrière (1 à 8 joueurs, 1 ronde ou 2 rondes avec coupure) ========
   Rien n'est écrit dans la carrière : l'état vit dans PNX, enregistré à part (clé 'pn'), comme la liste de terrains.
   PNX.cfg = derniers réglages ; PNX.cur = tournoi en cours ou terminé. Les adversaires sont des copies de golfeurs
   de la ligue choisie (ou créés au niveau de cette ligue s'il n'y a pas de carrière) et jouent avec le moteur de la carrière. */
const PN_COLORS = ['#F0C419', '#3D7BE0', '#2FA84F', '#E0533D', '#9B59D0', '#F08A24', '#1FA7A0', '#E05A9C'];
const PN_FIELDS = [0, 10, 30, 60, 150];
let PNX = { cfg: null, cur: null };
function pnLoad() {
  return DB.ready.then(() => new Promise(res => {
    if (DB.mode === 'idb') { try { const r = DB.db.transaction('kv').objectStore('kv').get('pn'); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); } catch (e) { res(null); } }
    else { try { const t = localStorage.getItem('golf-pn'); res(t ? JSON.parse(t) : null); } catch (e) { res(null); } }
  }));
}
function pnSave() {
  const v = JSON.parse(JSON.stringify(PNX));
  if (DB.mode === 'idb') { try { DB.db.transaction('kv', 'readwrite').objectStore('kv').put(v, 'pn'); } catch (e) { } }
  else { try { localStorage.setItem('golf-pn', JSON.stringify(v)); } catch (e) { } }
}
function pnCfg() {
  if (!PNX.cfg) PNX.cfg = { fmt: 1, players: [(S && S.name) || 'Joueur 1'], lvl: S ? vLg() : 2, n: 30, course: null };
  const C = PNX.cfg; if (!C.course) { if (BANK.length && !pnDrawBank()) pnRandomCourse(); else if (!BANK.length) pnRandomCourse(); }
  if (!C.tgt) C.tgt = 't20'; if (C.n == null) C.n = 30; if (!C.sim) C.sim = 'live'; if (!C.gsz) C.gsz = 4; if (!C.cutN) C.cutN = 65;   // v227 : coupure par défaut au top 65 + égalités
  ['wind', 'wind2'].forEach(k => { if (!C[k] || C[k] === 'rnd') C[k] = randomWind(); }); ['pin', 'pin2'].forEach(k => { if (!C[k] || C[k] === 'rnd') C[k] = randomPin(); });   // v227 : tirés au 🎲, comme en carrière
  if (!C.pre || C.pre.length !== C.n) C.pre = pnField(C.n);
  return C;
}
/* v225 : niveau du champ selon ton handicap et ton objectif (aspirant = environ 3e, top 20 = environ 20e, coupure = environ au rang de la coupure) */
const PN_TGT = [['con', 'Aspirant'], ['t20', 'Top 20'], ['cut', 'Coupure']];
const pnExpIdx = f => 0.83 * (mu(effOverall(f.g)) + eliteHandicap(f.g.o, f.g) + skRT(f.g)) - 0.6;   // index attendu d'un adversaire sur le circuit de référence
function pnCutN(C) { const n = C.pre.length + C.players.length; return C.cutN > 0 ? Math.min(n, C.cutN) : Math.max(2, Math.round(n * 0.45)); }
function pnRank(C) { const n = C.pre.length + 1; return C.tgt === 'con' ? Math.min(3, n) : C.tgt === 't20' ? Math.min(20, Math.max(2, Math.round(n * 0.67))) : Math.min(n, pnCutN(C)); }
function pnDelta(C) {
  const h = C.hc == null || C.hc === '' ? null : parseFloat(String(C.hc).replace(',', '.')); if (h == null || isNaN(h) || !C.pre.length) return 0;
  const e = C.pre.map(pnExpIdx).sort((a, b) => a - b), R = pnRank(C), i = R - 2;
  const m = i < 0 ? e[0] - 0.5 : i >= e.length - 1 ? e[e.length - 1] + 0.5 : (e[i] + e[i + 1]) / 2;
  return clamp(Math.round((h - m) / 0.83 * 10) / 10, -10, 45);
}
/* estimation rapide : quelques tournois simulés avec ce champ, sur ce terrain */
function pnEstimate(C) {
  if (!MODEL) MODEL = buildModel(S ? S.settings.tables : DEFAULT_TABLES);
  const co = C.course, pars = co.pars, grid = gridFor(pars), d = pnDelta(C), ctx = { course: 0, weather: [0, 0], crDelta: crDeltaOf(co, pars), distDelta: distDelta(co.dist), slopeFactor: slopeEffFactor(co.slope), windBump: [pnWB(C.wind), pnWB(C.fmt === 2 ? C.wind2 : 'none')] };
  const D = C.pre.map(f => [solveDelta(grid, roundTarget(f.g, ctx, 0) - lvlFor(f.g) + d), solveDelta(grid, roundTarget(f.g, ctx, 1) - lvlFor(f.g) + d)]);
  const K = Math.max(3, Math.min(14, Math.round(2400 / Math.max(1, C.pre.length)))), win = [], t20 = [], cut = [], rnd = [], R = pnRank(C);
  for (let k = 0; k < K; k++) {
    const sc = D.map(dd => { let a = 0, b = 0; pars.forEach(p => { a += simHole(MODEL, p, dd[0] + gauss() * 0.15, null) - p; b += simHole(MODEL, p, dd[1] + gauss() * 0.15, null) - p; }); return [a, b]; });
    sc.forEach(x => rnd.push(x[0]));
    const r1 = sc.map(x => x[0]).sort((a, b) => a - b), cutN = pnCutN(C), cl = r1[Math.min(r1.length - 1, cutN - 1)];
    const tot = C.fmt === 2 ? sc.filter(x => x[0] <= cl).map(x => x[0] + x[1]).sort((a, b) => a - b) : r1;
    win.push(tot[0]); if (tot.length >= 20) t20.push(tot[19]); cut.push(cl);
  }
  return { d, R, win: avg(win), t20: t20.length ? avg(t20) : null, cut: avg(cut), rnd: avg(rnd) };
}
/* un terrain de ta liste au hasard, selon les filtres (le tee le plus près du neutre) ; false si aucun ne correspond */
function pnDrawBank() { const by = new Map(); crfPool().forEach(b => { const k = normName(b.name); if (!by.has(k)) by.set(k, []); by.get(k).push(b); }); const ks = [...by.keys()]; if (!ks.length) return false; const b = neutralTee(by.get(ks[Math.floor(Math.random() * ks.length)])); return pnSetBankCourse(b.name, b.tee) ? b : false; }
/* vent attendu (tirage au hasard) : moyenne pondérée des chances de chaque niveau */
function windExp() { const w = CFG.windW || [10, 39, 32, 19], t = w.reduce((a, b) => a + b, 0) || 1; return WIND_LEVELS.reduce((a, l, i) => a + (w[i] || 0) * windBump(l), 0) / t; }
const pnWB = v => v === 'rnd' ? windExp() : windBump(v || 'none');
function pnRandomCourse() {
  const C = PNX.cfg, pars = randomPars(), V = CFG.terrainVar == null ? 1 : CFG.terrainVar;
  C.course = { name: COURSE_NAMES[Math.floor(Math.random() * COURSE_NAMES.length)], tee: 'White', pars, index: shuffleIndex(), dist: Math.round(gaussRange(CFG.distRef || 6070, (CFG.distRef || 6070) - 400, (CFG.distRef || 6070) + 400)),
    cr: Math.round((crNeutral(parTotal(pars)) + gaussRange(0, -1.2 * V, 1.2 * V)) * 10) / 10, slope: Math.round(gaussRange(slopeNeutral(), slopeNeutral() - 10, slopeNeutral() + 13)), rand: true };
}
function pnSetBankCourse(name, tee) {
  const bi = findBankCourse(name, tee); if (bi < 0) return false;
  const b = BANK[bi]; PNX.cfg.course = { name: b.name, tee: b.tee, pars: b.pars.slice(), index: b.index.slice(), dist: b.dist, cr: b.cr, slope: b.slope };
  return true;
}
/* Adversaires : copie des paramètres de jeu seulement (le golfeur de la carrière n'est jamais modifié) */
function pnField(n) {
  if (!n) return [];
  const pick = g => ({ n: g.n, nat: g.nat, g: { o: g.o, f: g.f || 0, sl: g.sl || 0, sm: g.sm || 0, v: g.v || 1, cl: g.cl || 0, sk: g.sk ? g.sk.slice() : [3, 3, 3] } });
  if (S && S.L && S.L[1]) {   // le champ part des golfeurs de la Ligue 2 de ta carrière (ou d'un champ créé à ce niveau) ; ton handicap règle ensuite le niveau
    const ids = shuffled(S.L[1].filter(id => id !== 0 && S.G[id]));
    if (ids.length >= n) return ids.slice(0, n).map(id => pick(S.G[id]));
  }
  const B = Math.max(FIELD, n) * 4, all = []; for (let i = 0; i < B; i++) all.push(drawOverall());
  all.sort((a, b) => b - a);
  const used = new Set(), os = shuffled(all.slice(B / 4, B / 2)).slice(0, n);
  return os.map(o => { const g = pick(newGolfer(0, used, o)); return g; });
}
function pnStart() {
  const C = pnCfg();
  document.querySelectorAll('[data-pnc="name"]').forEach(x => { C.players[+x.dataset.i] = x.value; });
  if (!MODEL) MODEL = buildModel(S ? S.settings.tables : DEFAULT_TABLES);
  if (!S) setCfg(DEFAULT_CFG);
  const co = C.course, names = C.players.map((n, i) => (n || '').trim() || 'Joueur ' + (i + 1));
  const rw = v => v === 'rnd' ? randomWind() : v || 'none', rp = v => v === 'rnd' ? randomPin() : v;
  const cur = {
    fmt: C.fmt, name: co.name, tee: co.tee, pars: co.pars.slice(), index: (co.index || defaultIndex()).slice(), dist: co.dist, cr: co.cr, slope: co.slope, wind: [rw(C.wind), C.fmt === 2 ? rw(C.wind2) : 'none'], pin: [rp(C.pin), C.fmt === 2 ? rp(C.pin2) : null],
    sim: C.sim === 'tee' ? 'tee' : 'live', gsz: clamp(Math.round(+C.gsz || 4), 1, 200), cutN: pnCutN(C), tx: 0, ord: [null, null],
    lvl: C.lvl, n: C.n, d: pnDelta(C), humans: names.map((n, i) => ({ n, c: PN_COLORS[i % PN_COLORS.length], h: [[], []] })), field: C.pre.map(f => JSON.parse(JSON.stringify(f))),
    r: 0, k: 0, ai: [{}, {}], r1: null, cut: null, alive: null, phase: 'play', vals: null
  };
  cur.ctx = Object.assign(newCtx(), { windBump: [windBump(cur.wind[0]), windBump(cur.wind[1])], crDelta: crDeltaOf(co, co.pars), distDelta: distDelta(co.dist), slopeFactor: slopeEffFactor(co.slope) });
  pnSimAI(cur, 0);
  cur.vals = cur.humans.map(() => cur.pars[0]);
  PNX.cur = cur; pnSave(); VIEW = { name: 'pnPlay' }; render(); window.scrollTo(0, 0);
}
function pnSimAI(cur, r) {
  const grid = gridFor(cur.pars), on = liveOn(), keys = [], G = {}, D = {};
  cur.field.forEach((f, i) => {
    const key = 'a' + i; if (r === 1 && !cur.alive.includes(key)) return;
    const margin = r === 1 ? cur.r1[key] - cur.lead : null;
    keys.push(key); G[key] = f.g; D[key] = solveDelta(grid, roundTarget(f.g, cur.ctx, r, on ? null : margin) - lvlFor(f.g) + (cur.d || 0));   // v225 : niveau propre au Play Now
  });
  let st = null;
  if (cur.sim === 'tee') {   // v226 : départs décalés en Play Now (vos joueurs partent ensemble ; ronde finale : meneurs en dernier)
    const hs = cur.humans.map((h, i) => 'h' + i).filter(k => r === 0 || cur.alive.includes(k));
    let o;
    if (r === 1) o = teeOrder(keys.concat(hs), cur.r1);
    else { o = shuffled(keys); const nG = Math.ceil((o.length + hs.length) / cur.gsz), g = Math.floor(Math.random() * nG); o.splice(Math.min(o.length, g * cur.gsz), 0, ...hs); }
    cur.ord[r] = o; st = teeStarts(o, cur.gsz); cur.tx = 0;
  }
  cur.ai[r] = liveRound(MODEL, cur.pars, cur.index, cur.ctx.hv && cur.ctx.hv[r], keys, G, D, r === 1 ? cur.r1 : null, r === 1 || cur.fmt !== 2, st);   // v216 : trou par trou (pression sur la ronde finale)
}
const pnActive = cur => cur.humans.map((h, i) => i).filter(i => cur.r === 0 || cur.alive.includes('h' + i));
function pnNameOf(cur, key) { return key[0] === 'h' ? cur.humans[+key.slice(1)].n : cur.field[+key.slice(1)].n; }
function pnHoles(cur, key, r) { return key[0] === 'h' ? cur.humans[+key.slice(1)].h[r] : cur.ai[r][key] || []; }
/* Classement : ronde r après k trous (ronde finale : score de la ronde 1 + ronde 2 ; les coupures ratées suivent, « CUT ») */
/* v226 : départs décalés — où en est chacun (vos joueurs donnent l'heure) */
function pnTee(cur, r) { const o = cur.sim === 'tee' && cur.ord && cur.ord[r]; if (!o) return null; const st = teeStarts(o, cur.gsz), hs = o.filter(k => k[0] === 'h'), anc = hs.length ? Math.min.apply(null, hs.map(k => st[k])) : st[o[o.length - 1]]; return { o, st, anc }; }
function pnT(cur, tr, k) { if (cur.tx >= 999) return Infinity; return tr.anc + k + (k >= 18 ? cur.tx || 0 : 0); }
function pnWaiting(cur) { const tr = pnTee(cur, cur.r); if (!tr) return false; const T = pnT(cur, tr, 18); return tr.o.some(k => k[0] !== 'h' && teeHoles(tr.st, T, k) < 18); }
function pnRows(cur, r, k) {
  const keys = cur.humans.map((h, i) => 'h' + i).concat(cur.field.map((f, i) => 'a' + i));
  const co = new Intl.Collator('fr'), rows = [], out = [], tr = pnTee(cur, r), T = tr ? pnT(cur, tr, k) : null;
  keys.forEach(key => {
    if (r === 1 && !cur.alive.includes(key)) { out.push({ key, tot: cur.r1[key], cut: true }); return; }
    const n = tr && key[0] !== 'h' ? teeHoles(tr.st, T, key) : k, today = relTo(pnHoles(cur, key, r), cur.pars, n);
    const row = { key, today, tot: today + (r === 1 ? cur.r1[key] : 0) }; if (tr) { row.n = n; row.g = teeGi(tr.o.length, tr.o.indexOf(key), cur.gsz); }
    rows.push(row);
  });
  rows.sort((a, b) => a.tot - b.tot || (b.n || 0) - (a.n || 0) || (a.key[0] === 'h' ? -1 : 0) - (b.key[0] === 'h' ? -1 : 0) || co.compare(pnNameOf(cur, a.key), pnNameOf(cur, b.key)));
  let i = 0;
  while (i < rows.length) { let j = i; while (j + 1 < rows.length && rows[j + 1].tot === rows[i].tot) j++; for (let x = i; x <= j; x++) { rows[x].pos = i + 1; rows[x].tie = j > i; } i = j + 1; }
  out.sort((a, b) => a.tot - b.tot || co.compare(pnNameOf(cur, a.key), pnNameOf(cur, b.key)));
  return rows.concat(out);
}
function pnDot(cur, key) { return key[0] === 'h' ? '<span class="pndot" style="background:' + cur.humans[+key.slice(1)].c + '"></span>' : ''; }
function pnBoard(cur, r, k, opts) {
  opts = opts || {};
  if (!opts.fin) return pnLive(cur, r, k);
  const rows = pnRows(cur, r, k), big = rows.length > 20, all = !big || VIEW.pnall;
  let list = rows;
  if (!all) { const top = rows.slice(0, 10), rest = rows.slice(10).filter(x => x.key[0] === 'h'); list = top.concat(rest.length ? [{ gap: true }] : [], rest); }
  let h = big ? chipRow([['pin', 'Épinglé'], ['all', 'Tous (' + rows.length + ')']], all ? 'all' : 'pin', 'pnall') : '';
  h += '<table class="plain pnb"><tr><th>Pos</th><th>Golfeur</th><th class="r">Tot</th>' + (r === 1 ? '<th class="r">' + (opts.fin ? 'R2' : 'Auj.') + '</th>' : '') + '<th class="r">' + (opts.fin ? 'Coups' : 'Thru') + '</th></tr>' +
    list.map(x => {
      if (x.gap) return '<tr class="pngap"><td colspan="' + (r === 1 ? 5 : 4) + '">⋮</td></tr>';
      const hu = x.key[0] === 'h', col = hu ? cur.humans[+x.key.slice(1)].c : null;
      const strokes = sum(pnHoles(cur, x.key, 0)) + (r === 1 && !x.cut ? sum(pnHoles(cur, x.key, 1)) : 0);
      return '<tr' + (hu ? ' class="pnme" style="--pc:' + col + '"' : '') + '><td>' + (x.cut ? 'CUT' : (x.tie ? 'T' : '') + x.pos) + '</td><td>' + pnDot(cur, x.key) + (hu ? '<b>' + esc(pnNameOf(cur, x.key)) + '</b>' : esc(pnNameOf(cur, x.key))) + '</td>' +
        '<td class="r ' + cls(x.tot) + '">' + fmt(x.tot) + '</td>' + (r === 1 ? '<td class="r">' + (x.cut ? '–' : fmt(x.today)) + '</td>' : '') + '<td class="r">' + (opts.fin ? strokes : x.cut ? '–' : x.n != null ? thruCell(x, k) : (k === 18 ? 'F' : k)) + '</td></tr>';
    }).join('') + '</table>';
  return h;
}
/* Pendant la ronde : m\u00eames cartes de scores trou par trou qu'en carri\u00e8re (ou le classement simple), joueurs manuels en couleur */
function pnLive(cur, r, k) {
  const rows = pnRows(cur, r, k).filter(x => !x.cut), pv = (S && S.ui && S.ui.pnpv) || VIEW.pnpv || 'cards', all = !!VIEW.pnall;
  // \u00c9pingl\u00e9 : tous les joueurs manuels en haut (dans l'ordre du classement), puis les 20 premiers (o\u00f9 ils figurent aussi \u00e0 leur rang)
  const list = all ? rows : rows.filter(x => x.key[0] === 'h').map(x => Object.assign({}, x, { pinned: true })).concat(rows);   /* v368 : Épinglé montre tout le champ */
  let h = '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' + chipRow([['cards', 'Cartes de scores'], ['board', 'Classement']], pv, 'pnpv') +
    (cur.fmt === 2 && r === 0 && rows.length >= 4 ? '<span class="tag" style="font-size:15px;padding:3px 12px;white-space:nowrap">Coupure : ' + fmt(cutScoreOf(rows.map(x => x.tot), cur.cutN || Math.max(2, Math.round(rows.length * 0.45)))) + '</span>' : '') + '</div>';
  h += chipRow([['pin', '\u00c9pingl\u00e9'], ['all', 'Tous (' + rows.length + ')']], all ? 'all' : 'pin', 'pnall');
  const item = x => { const hu = x.key[0] === 'h', f = hu ? null : cur.field[+x.key.slice(1)]; return { pn: true, pinned: !!x.pinned, name: pnNameOf(cur, x.key), nat: f ? f.nat : '', color: hu ? cur.humans[+x.key.slice(1)].c : null, me: hu, pos: (x.tie ? 'T' : '') + x.pos, tot: x.tot, holes: pnHoles(cur, x.key, r).slice(0, x.n != null ? x.n : k), r1: r === 1 ? cur.r1[x.key] : null, n: x.n, g: x.g }; };
  if (pv === 'cards') return h + cardsHTML(list.map(x => x.gap ? x : item(x)), cur.pars, { showR1: r === 1, next: k < 18 ? k : -1, index: cur.index });
  return h + '<div class="boardwrap scroll"><table class="board"><tr><th>Pos</th><th class="fl"></th><th>Joueur</th><th class="r">Total</th><th class="r">Trou</th></tr>' +
    list.map(x => { if (x.gap) return '<tr class="gap"><td colspan="5">\u00b7\u00b7\u00b7</td></tr>'; const it = item(x); return '<tr' + (it.me ? ' class="me pnme' + (it.pinned ? ' pnpin' : '') + '" style="--pc:' + it.color + '"' : '') + '><td class="pos">' + it.pos + '</td><td class="fl">' + (it.nat ? flagVisual(it.nat, 20) : '<span class="pndot" style="background:' + it.color + '"></span>') + '</td><td>' + (it.me ? '<b>' + esc(it.name) + '</b>' : esc(it.name)) + '</td><td class="r ' + cls(it.tot) + '">' + fmt(it.tot) + '</td><td class="r th">' + (it.n != null ? thruCell(it, k) : (k === 18 ? 'F' : k)) + '</td></tr>'; }).join('') + '</table></div>';
}
function pnCourseLine(c) { return 'Par ' + parTotal(c.pars) + ' · ' + (c.dist || 0).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' v · CR ' + fmtCR(c.cr) + ' · Slope ' + c.slope; }

/* ---- Estimation du champ (Play Now) ---- */
function pnEstHTML(C) {
  const h = C.hc == null || C.hc === '' ? null : parseFloat(String(C.hc).replace(',', '.'));
  const E = pnEstimate(C), one = C.fmt !== 2, f1 = v => (v > 0 ? '+' : v < 0 ? '\u2212' : '') + (LANG === 'en' ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(1).replace('.', ',')), fR = v => v == null ? '\u2013' : fmt(Math.round(v));
  let x = '<div class="lvlbox"><p class="small" style="margin:0 0 6px">' + (h == null || isNaN(h) ? 'Entre ton handicap : le champ s\u2019ajuste pour que tu sois \u00e0 ta place selon ton objectif.' : 'Avec ton index de ' + fmtHI(h) + ', tu serais environ <b>' + ord(E.R) + '</b> sur ' + (C.pre.length + C.players.length) + ' \u00b7 niveau du champ <b>' + f1(E.d) + ' coup' + (Math.abs(E.d) >= 2 ? 's' : '') + '</b> par ronde.') + '</p>' +
    '<table class="plain lvlt"><tr><td>' + (one ? 'Gagnant (1 ronde)' : 'Gagnant (2 rondes)') + '</td><td class="r"><b>' + fR(E.win) + '</b></td></tr>' + (E.t20 != null ? '<tr><td>20e place</td><td class="r">' + fR(E.t20) + '</td></tr>' : '') +
    (one ? '' : '<tr><td>Coupure (ronde 1)</td><td class="r">' + fR(E.cut) + '</td></tr>') + '<tr><td>Ronde moyenne du champ</td><td class="r">' + fR(E.rnd) + '</td></tr></table>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px"><span class="small mute">Estimation sur ce terrain : chaque tournoi varie.</span><button class="btn sec sm" data-a="pnnewf">Nouveau champ</button></div></div>';
  return x;
}
/* ---- Terrain : tirage avec filtres et pige, comme en carrière ---- */
function pnCourseToolsHTML() {
  const f = crf(), P = pigeState(), num = (k, step) => '<input type="number" data-c="crf" data-k="' + k + '" step="' + step + '" value="' + f[k] + '" aria-label="' + k + '">';
  let h = '<div class="block crfb"><h3>Tirage au hasard</h3><div class="crfg">' +
    '<span>Verges</span>' + num('dmin', 10) + '<span class="d">à</span>' + num('dmax', 10) + '<span>CR</span>' + num('crmin', 0.1) + '<span class="d">à</span>' + num('crmax', 0.1) +
    '<span>Slope</span>' + num('smin', 1) + '<span class="d">à</span>' + num('smax', 1) + '<span>Par</span>' + num('pmin', 1) + '<span class="d">à</span>' + num('pmax', 1) + '</div>' + crfTeesHTML(f) +
    '<button class="btn" data-a="pndraw">Tirer un terrain</button><p class="small mute" id="crfn" style="margin:0">' + crfCountText() + '</p></div>';
  h += '<div class="block crfb pige"><h3>Pige de terrains</h3><p class="small mute" style="margin:0 0 8px">Sors quelques terrains au hasard selon les filtres, puis choisis celui que tu veux jouer.</p>' +
    chipRow([['fix', 'Nombre fixe'], ['rnd', 'Au hasard']], P.rnd ? 'rnd' : 'fix', 'pgmode') +
    (P.rnd ? '<div class="pgbar"><label for="pglo">Entre</label><input type="number" id="pglo" data-c="pglo" min="1" max="30" value="' + P.lo + '"><label for="pghi">et</label><input type="number" id="pghi" data-c="pghi" min="1" max="30" value="' + P.hi + '"><button class="btn sm" data-a="pigedraw">Piger</button></div>'
      : '<div class="pgbar"><label for="pgn">Nombre</label><input type="number" id="pgn" data-c="pgn" min="1" max="30" value="' + P.n + '"><button class="btn sm" data-a="pigedraw">Piger</button></div>');
  if (P.list.length) h += '<ol class="pglist">' + P.list.map((x, k) => { const bi = findBankCourse(x.name, x.tee), b = bi >= 0 ? BANK[bi] : null; if (!b) return ''; const on = PNX.cfg.course && PNX.cfg.course.name === x.name;
    const ci = cresList().findIndex(y => normName(y.name) === normName(x.name) && y.tee === x.tee);
    return '<li><div class="pgnm">' + ytLink(x.name) + '</div><div class="pgsub">par ' + parTotal(b.pars) + ' \u00b7 ' + esc(b.tee) + ' \u00b7 ' + (+b.dist).toLocaleString(LANG === 'en' ? 'en-US' : 'fr-CA') + ' v \u00b7 ' + fmtCR(b.cr) + ' / ' + b.slope + (ci >= 0 ? ' \u00b7 <a href="#" class="cresl" data-a="pncres" data-k="' + ci + '">R\u00e9sum\u00e9 \u203a</a>' : '') + '</div>' + (on ? '<span class="pgdone">Choisi</span>' : '<div class="pgadd"><button class="btn sm sec" data-a="pnpgpick" data-k="' + k + '">Choisir</button></div>') + '</li>'; }).join('') + '</ol>' + pigeCopyHTML();
  h += '<button class="btn sec sm" data-a="pnrand" style="width:100%;margin-top:8px">Terrain fictif (statistiques al\u00e9atoires)</button></div>';
  return h;
}
/* ---- Écran de préparation ---- */
const pnSel = (id, k, r, cur, opts) => '<select id="' + id + '" data-pnc="' + k + '" data-r="' + r + '">' + opts.map(([v, t]) => '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>';
function vPnSetup() {
  const C = pnCfg(), co = C.course, tz = co.rand ? [] : bankTeesOf(co.name).sort((a, b) => teeRank(a) - teeRank(b));
  let h = '<div class="top"><div><h1>Play Now</h1><div class="ctx">Tournoi rapide, hors carrière</div></div></div><div class="narrow">';
  h += '<div class="block"><h3 style="margin-top:0">Format</h3>' + chipRow([[1, '1 ronde'], [2, '2 rondes · coupure']], C.fmt, 'pnfmt') +
    '<p class="small mute" style="margin:0">' + (C.fmt === 1 ? 'Une seule ronde de 18 trous, sans coupure.' : 'Ronde 1, coupure, puis ronde finale.') + '</p>' +
    (C.fmt === 2 ? '<div class="pnline"><label for="pncut">Coupure : les</label><input type="number" id="pncut" data-pnc="cutn" min="1" max="1000" inputmode="numeric" value="' + pnCutN(C) + '"><span>premiers et les \u00e9galit\u00e9s</span></div>' : '') +
    '<label style="margin-top:12px">Simulation</label>' + chipRow([['live', 'Tous au m\u00eame trou'], ['tee', 'D\u00e9parts d\u00e9cal\u00e9s']], C.sim, 'pnsim') +
    (C.sim === 'tee' ? '<div class="pnline"><label for="pngsz">Golfeurs par groupe</label><input type="number" id="pngsz" data-pnc="gsz" min="1" max="200" inputmode="numeric" value="' + C.gsz + '"><span>\u00b7 un groupe aux ' + TEE.MIN + ' minutes</span></div>' : '<p class="small mute" style="margin:2px 0 0">Tout le champ joue le m\u00eame trou que vous.</p>') + '</div>';
  h += '<div class="block"><h3 style="margin-top:0">Joueurs <span class="mute small">· ' + C.players.length + ' sur 8</span></h3>' +
    C.players.map((n, i) => '<div class="pnp"><span class="pnn" style="background:' + PN_COLORS[i] + '">' + (i + 1) + '</span><input type="text" data-pnc="name" data-i="' + i + '" value="' + esc(n) + '" maxlength="24" autocomplete="off" aria-label="Nom du joueur ' + (i + 1) + '">' +
      (C.players.length > 1 ? '<button type="button" class="pnx" data-a="pndel" data-i="' + i + '" aria-label="Retirer ce joueur">×</button>' : '') + '</div>').join('') +
    (C.players.length < 8 ? '<button class="btn sec sm" data-a="pnadd" style="width:100%;margin-top:6px">+ Ajouter un joueur</button>' : '') + '</div>';
  h += '<div class="block"><h3 style="margin-top:0">Ton champ</h3><div class="pnline"><label for="pnnum">Nombre d\u2019adversaires</label><input type="number" id="pnnum" data-pnc="n" min="0" max="1000" inputmode="numeric" value="' + C.n + '"><span>(0 \u00e0 1000)</span></div>';
  if (C.n) h += '<div class="row lvlrow" style="margin-top:8px"><div style="flex:0 0 130px"><label for="pnhc" style="margin-top:0;font-size:15px">Ton handicap</label><input type="number" id="pnhc" data-pnc="hc" step="0.1" min="-10" max="54" inputmode="decimal" placeholder="ex. 8,5" value="' + esc(C.hc == null ? '' : C.hc) + '"></div><div class="small mute" style="align-self:flex-end;padding-bottom:6px">Un handicap \u00ab plus \u00bb s\u2019\u00e9crit en n\u00e9gatif.</div></div>' +
    '<label>Ton objectif</label>' + chipRow(PN_TGT, C.tgt, 'pntgt') + '<div id="pnest">' + pnEstHTML(C) + '</div>';
  else h += '<p class="small mute" style="margin:0">Aucun adversaire : seulement entre vous.</p>';
  h += '</div>';
  h += '<div class="block"><h3 style="margin-top:0">Terrain</h3><label for="pncn">Nom du terrain</label><div class="acwrap"><input type="text" id="pncn" data-pnac="1" value="' + esc(co.rand ? '' : co.name) + '" placeholder="' + (BANK.length ? 'Tape pour chercher dans ta liste' : 'Ta liste de terrains est vide') + '" autocomplete="off" spellcheck="false"><div class="acbox" id="pnac" role="listbox"></div></div>';
  if (co.rand) h += '<p style="margin:10px 0 0"><b>' + esc(co.name) + '</b> <span class="mute small">· terrain aléatoire</span></p>';
  else h += '<p class="pncname" style="margin:10px 0 0">' + ytLink(co.name) + ' <a href="#" class="cresl" data-a="pncres" data-k="' + Math.max(0, cresList().findIndex(y => normName(y.name) === normName(co.name) && y.tee === co.tee)) + '">R\u00e9sum\u00e9 \u203a</a></p>';
  h += '<div class="tgrid" style="margin-top:10px">' + (tz.length ? '<div class="ti"><label for="pntee">Tee de départ</label><select id="pntee" data-pnc="tee">' + tz.map(t => '<option' + (t === co.tee ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></div>' : '') +
    '</div>' + '<div class="sectlab">Conditions</div><div class="condgrid">' +
    '<div></div><div class="condhead">Drapeau</div><div class="condhead">Vent</div><div class="condhead">Hasard</div>' +
    '<div class="condrl">' + (C.fmt === 2 ? 'Ronde 1' : 'Ronde') + '</div>' + pnSel('pnp1', 'pin', 1, C.pin, PIN_DAYS.map(d => [d, PIN_LABELS[d]])) + pnSel('pnw1', 'wind', 1, C.wind, WIND_LEVELS.map(w => [w, WIND_LABELS[w]])) +
    '<button type="button" class="rdice" data-a="pnrrand" data-r="1" title="Drapeau et vent au hasard" aria-label="Drapeau et vent de la ronde 1 au hasard">🎲</button>' +
    (C.fmt === 2 ? '<div class="condrl">Ronde 2</div>' + pnSel('pnp2', 'pin', 2, C.pin2, PIN_DAYS.map(d => [d, PIN_LABELS[d]])) + pnSel('pnw2', 'wind', 2, C.wind2, WIND_LEVELS.map(w => [w, WIND_LABELS[w]])) +
    '<button type="button" class="rdice" data-a="pnrrand" data-r="2" title="Drapeau et vent au hasard" aria-label="Drapeau et vent de la ronde 2 au hasard">🎲</button>' : '') + '</div>';
  h += '<p class="small mute" style="margin:8px 0 0">' + pnCourseLine(co) + '</p>' + (BANK.length ? '' : '<button class="btn sec sm" data-a="pnrand" style="width:100%;margin-top:10px">Terrain aléatoire</button>') + '</div>';
  if (BANK.length) h += pnCourseToolsHTML();
  h += '<button class="btn" data-a="pnstart">Commencer le tournoi</button><button class="btn sec" data-a="pnexit">Retour</button></div>';
  return h;
}
function pnAcRender(q) {
  const box = document.getElementById('pnac'); if (!box) return;
  const r = q && acNorm(q).length >= 2 ? bankSearch(q, 8) : [];
  box.innerHTML = r.map((bi, k) => { const nm = BANK[bi].name, tz = bankTeesOf(nm); return '<button type="button" class="acit' + (k ? '' : ' on') + '" data-pnpick="' + bi + '"><span>' + esc(nm) + '</span><small>' + tz.length + ' tee' + (tz.length > 1 ? 's' : '') + '</small></button>'; }).join('');
  box.classList.toggle('open', r.length > 0);
}
function pnPick(bi) {
  const name = BANK[bi].name, tz = bankTeesOf(name), cur = PNX.cfg.course;
  const tee = tz.includes(cur.tee) ? cur.tee : tz.includes('White') ? 'White' : tz.sort((a, b) => teeRank(a) - teeRank(b))[0];
  pnSetBankCourse(name, tee); pnSave(); render();
  toast(name + ' · tees ' + tee);
}

/* ---- Saisie des scores : tous les joueurs sur le même écran ---- */
function vPnPlay() {
  const cur = PNX.cur, k = cur.k, par = cur.pars[k], act = pnActive(cur), w = cur.wind[cur.r];
  if (k >= 18) return vPnWait();
  let A = '<div class="top"><div><div class="ctx">' + esc(cur.name) + ' · ' + (cur.fmt === 2 ? (cur.r === 0 ? 'ronde 1' : 'ronde finale') : 'Play Now') + (w && w !== 'none' ? ' · ' + WIND_LABELS[w] : '') + (cur.pin && cur.pin[cur.r] ? ' · <span>Drapeau ' + PIN_LABELS[cur.pin[cur.r]].toLowerCase() + '</span>' : '') + '</div></div><a href="#" data-a="pnexit" class="sans" style="font-size:18px">Quitter</a></div>';
  A += '<div class="hole pnhole"><div class="lbl">Trou ' + (k + 1) + ' sur 18</div><div class="par">Par ' + par + ' · index ' + cur.index[k] + '</div>' +
    act.map(i => { const v = cur.vals[i]; return '<div class="pnrow"><span class="pnname"><span class="pndot" style="background:' + cur.humans[i].c + '"></span>' + esc(cur.humans[i].n) + '</span><button class="pm" data-a="pndec" data-i="' + i + '" aria-label="Moins un coup pour ' + esc(cur.humans[i].n) + '">−</button><span class="pnval" id="pnv' + i + '">' + v + '</span><button class="pm" data-a="pninc" data-i="' + i + '" aria-label="Plus un coup pour ' + esc(cur.humans[i].n) + '">+</button><span class="pnw" id="pnw' + i + '">' + verdictFor(v - par, v) + '</span></div>'; }).join('') + '</div>';
  A += '<button class="btn" data-a="pnok">Valider le trou ' + (k + 1) + '</button>';
  if (k > 0) A += '<button class="btn sec sm" data-a="pnundo" style="width:100%;margin-top:4px">Corriger le trou précédent</button>';
  const B = '<h2 id="boardTop">Classement</h2>' + pnBoard(cur, cur.r, k);
  return cols(A, B, '', 'play');
}
/* vos rondes sont finies, mais des groupes sont encore sur le terrain */
function vPnWait() {
  const cur = PNX.cur, rows = pnRows(cur, cur.r, 18), left = rows.filter(x => !x.cut && x.n != null && x.n < 18), low = left.length ? Math.min.apply(null, left.map(x => x.n)) : 18;
  let A = '<div class="top"><div><div class="ctx">' + esc(cur.name) + ' \u00b7 ' + (cur.fmt === 2 ? (cur.r === 0 ? 'ronde 1' : 'ronde finale') : 'Play Now') + '</div></div><a href="#" data-a="pnexit" class="sans" style="font-size:18px">Quitter</a></div>';
  A += '<div class="block"><b>' + left.length + ' golfeur' + (left.length > 1 ? 's' : '') + ' encore sur le terrain</b><p class="small mute" style="margin:2px 0 0">' + (low === 0 ? 'Le dernier groupe n\u2019est pas encore parti.' : 'Le dernier groupe en est au trou ' + (low + 1) + '.') + '</p></div>';
  A += '<button class="btn" data-a="pnstep">Avancer d\u2019un trou</button><button class="btn sec" data-a="pnfinr">Tout terminer d\u2019un coup</button><button class="btn sec sm" data-a="pnundo" style="width:100%;margin-top:4px">Corriger le trou 18</button>';
  return cols(A, '<h2 id="boardTop">Classement</h2>' + pnBoard(cur, cur.r, 18), '', 'play');
}
function pnStep(i, d) {
  const cur = PNX.cur, par = cur.pars[cur.k], hr = holeRange(par);
  cur.vals[i] = Math.max(hr[0], Math.min(hr[1], cur.vals[i] + d));
  const v = document.getElementById('pnv' + i), w = document.getElementById('pnw' + i);
  if (v) v.textContent = cur.vals[i]; if (w) w.textContent = verdictFor(cur.vals[i] - par, cur.vals[i]);
}
function pnOk() {
  const cur = PNX.cur, act = pnActive(cur);
  act.forEach(i => { cur.humans[i].h[cur.r][cur.k] = cur.vals[i]; });
  cur.k++;
  if (cur.k === 18 && pnWaiting(cur)) { pnSave(); render(); window.scrollTo(0, 0); return; }
  if (cur.k === 18) return pnEndRound();
  cur.vals = cur.humans.map(() => cur.pars[cur.k]);
  pnSave(); render();
  if (!isPC()) { const t = document.getElementById('boardTop'); if (t && act.length <= 2) { /* l'écran de saisie reste visible */ } }
}
function pnUndo() {
  const cur = PNX.cur; if (!cur.k) return; cur.tx = 0;
  cur.k--; cur.vals = cur.humans.map((h, i) => h.h[cur.r][cur.k] || cur.pars[cur.k]);
  pnActive(cur).forEach(i => { cur.humans[i].h[cur.r].length = cur.k; });
  pnSave(); render();
}
function pnEndRound() {
  const cur = PNX.cur; if (cur.sim === 'tee') cur.tx = 999;
  if (cur.r === 0) {
    const rows = pnRows(cur, 0, 18); cur.r1 = {}; rows.forEach(x => { cur.r1[x.key] = x.tot; });
    if (cur.fmt === 1) return pnFinish();
    const N = rows.length;
    if (N < 4) { cur.cut = null; cur.alive = rows.map(x => x.key); }
    else { cur.cut = cutScoreOf(rows.map(x => x.tot), cur.cutN || Math.max(2, Math.round(N * 0.45))); cur.alive = rows.filter(x => x.tot <= cur.cut).map(x => x.key); }
    cur.lead = rows[0].tot; cur.phase = 'cut'; pnSave(); VIEW = { name: 'pnCut' }; render(); window.scrollTo(0, 0);
  } else pnFinish();
}
function vPnCut() {
  const cur = PNX.cur, anyIn = cur.humans.some((h, i) => cur.alive.includes('h' + i));
  let h = '<div class="top"><div><h1>Ronde 1 terminée</h1><div class="ctx">' + esc(cur.name) + '</div></div></div>';
  let L = '<div class="block"><p style="margin:0 0 8px"><b>' + (cur.cut == null ? 'Pas de coupure' : 'Coupure à ' + fmt(cur.cut)) + '</b> : ' + cur.alive.length + ' joueur' + (cur.alive.length > 1 ? 's' : '') + ' en ronde finale.</p>' +
    cur.humans.map((hu, i) => { const key = 'h' + i, inn = cur.alive.includes(key), d = cur.r1[key] - (cur.cut == null ? 0 : cur.cut); return '<p class="pnres" style="--pc:' + hu.c + '"><span class="pndot" style="background:' + hu.c + '"></span><b>' + esc(hu.n) + '</b> ' + fmt(cur.r1[key]) + ' <span class="mute small">(' + sum(hu.h[0]) + ')</span> ' + (inn ? '<span class="tag good">Passe</span>' : '<span class="tag bad">Coupure ratée</span> <span class="mute small">de ' + d + ' coup' + (d > 1 ? 's' : '') + '</span>') + '</p>'; }).join('') + '</div>';
  L += anyIn ? '<button class="btn" data-a="pnr2">Jouer la ronde finale</button>' : '<button class="btn" data-a="pnsim2">Simuler la ronde finale</button>';
  L += '<button class="btn sec" data-a="pnback1">Corriger le dernier trou</button>';
  return h + cols(L, '<h2>Classement après la ronde 1</h2>' + pnBoard(cur, 0, 18));
}
function pnRound2(simOnly) {
  const cur = PNX.cur; cur.r = 1; cur.k = 0; cur.phase = 'play';
  pnSimAI(cur, 1);
  cur.vals = cur.humans.map(() => cur.pars[0]);
  if (simOnly) { cur.k = 18; return pnFinish(); }
  pnSave(); VIEW = { name: 'pnPlay' }; render(); window.scrollTo(0, 0);
}
function pnFinish() {
  const cur = PNX.cur; cur.phase = 'end'; cur.k = 18;
  pnSave(); VIEW = { name: 'pnEnd' }; render(); window.scrollTo(0, 0);
}
function pnCard(cur, i) {
  const hu = cur.humans[i], rounds = [0, 1].filter(r => hu.h[r].length === 18);
  const scc = (v, k) => { const d = v - cur.pars[k]; return '<td><span class="sc ' + (d <= -2 ? 'e2' : d === -1 ? 'e1' : d === 1 ? 'b1' : d === 2 ? 'b2' : d >= 3 ? 'b3' : '') + '">' + v + '</span></td>'; };
  return [0, 9].map(o => {
    const sl = a => a.slice(o, o + 9), lbl = o ? 'Retour' : 'Aller';
    return '<div class="pncard"><table><tr class="pnhd"><th>Trou</th>' + sl(cur.pars).map((p, k) => '<td>' + (o + k + 1) + '</td>').join('') + '<td>' + lbl + '</td></tr>' +
      '<tr class="pnpar"><th>Par</th>' + sl(cur.pars).map(p => '<td>' + p + '</td>').join('') + '<td>' + sum(sl(cur.pars)) + '</td></tr>' +
      rounds.map(r => '<tr><th>' + (cur.fmt === 2 ? 'R' + (r + 1) : 'Score') + '</th>' + sl(hu.h[r]).map((v, k) => scc(v, o + k)).join('') + '<td><b>' + sum(sl(hu.h[r])) + '</b></td></tr>').join('') + '</table></div>';
  }).join('');
}
function vPnEnd() {
  const cur = PNX.cur, r = cur.fmt === 2 ? 1 : 0, rows = pnRows(cur, r, 18), lead = rows.filter(x => !x.cut && x.pos === 1);
  const nm = x => esc(pnNameOf(cur, x.key));
  let head = lead.length > 1 ? 'Égalité en tête à ' + fmt(lead[0].tot) + ' : ' + lead.map(nm).join(', ') : nm(lead[0]) + ' remporte le tournoi à ' + fmt(lead[0].tot);
  let h = '<div class="top"><div><h1>Tournoi terminé</h1><div class="ctx">' + esc(cur.name) + ' · tees ' + esc(cur.tee) + '</div></div></div>';
  let L = '<div class="block hero"><div class="big" style="font-size:30px;line-height:1.15">' + head + '</div></div>';
  L += '<div class="block"><h3 style="margin-top:0">Vos résultats</h3>' + cur.humans.map((hu, i) => { const x = rows.find(y => y.key === 'h' + i); return '<p class="pnres"><span class="pndot" style="background:' + hu.c + '"></span><b>' + esc(hu.n) + '</b> · <span>' + (x.cut ? 'coupure ratée' : (x.tie ? 'T' : '') + x.pos + (x.pos === 1 ? 'er' : 'e') + ' sur ' + rows.length) + '</span> · <span class="' + cls(x.tot) + '">' + fmt(x.tot) + '</span> <span class="mute small">(' + (sum(hu.h[0]) + sum(hu.h[1])) + ' coups)</span></p>' + pnCard(cur, i); }).join('') + '</div>';
  L += '<button class="btn" data-a="pnagain">Rejouer avec les mêmes réglages</button><button class="btn sec" data-a="pnsetup">Nouveau tournoi</button><button class="btn sec" data-a="pnexit">Retour</button>';
  return h + cols(L, '<h2>Classement final</h2>' + pnBoard(cur, r, 18, { fin: true }));
}
function pnRender() {
  const V = { pnSetup: vPnSetup, pnPlay: vPnPlay, pnCut: vPnCut, pnEnd: vPnEnd, pnCres: vCourseResume }[VIEW.name];
  if (!V || (VIEW.name !== 'pnSetup' && VIEW.name !== 'pnCres' && !PNX.cur)) { VIEW = { name: 'pnSetup' }; return pnRender(); }
  const scenic = VIEW.name !== 'pnPlay';
  $tabs.hidden = true;
  $app.innerHTML = (scenic ? scene() : '') + '<div class="wrap' + (scenic ? ' sc' : '') + '">' + V() + '</div>';
}
function pnOpen() {
  const c = PNX.cur;
  VIEW = { name: c && c.phase === 'play' ? 'pnPlay' : c && c.phase === 'cut' ? 'pnCut' : 'pnSetup' };
  render(); window.scrollTo(0, 0);
}
function pnHomeBtn() {
  const c = PNX.cur, live = c && (c.phase === 'play' || c.phase === 'cut');
  return '<button class="btn sec pnhome" data-a="pnopen">' + (live ? 'Reprendre Play Now · ' + esc(c.name) : 'Play Now · tournoi rapide') + '</button>';
}
function pnAct(a, el) {
  const d = el.dataset, C = PNX.cfg;
  switch (a) {
    case 'pnopen': pnOpen(); return;
    case 'pnrrand': { const r2 = d.r === '2'; C[r2 ? 'pin2' : 'pin'] = randomPin(); C[r2 ? 'wind2' : 'wind'] = randomWind(); pnSave(); render(); toast('Ronde ' + (r2 ? 2 : 1) + ' : ' + PIN_LABELS[C[r2 ? 'pin2' : 'pin']] + ' \u00b7 ' + WIND_LABELS[C[r2 ? 'wind2' : 'wind']]); return; }
    case 'pnexit': VIEW = S ? { name: 'home' } : { name: 'new' }; render(); window.scrollTo(0, 0); return;
    case 'pnsetup': PNX.cur = null; pnSave(); VIEW = { name: 'pnSetup' }; render(); window.scrollTo(0, 0); return;
    case 'pnagain': pnStart(); return;
    case 'pnstart': {
      if (PNX.cur && (PNX.cur.phase === 'play' || PNX.cur.phase === 'cut') && !VIEW.pnConfirm) { VIEW.pnConfirm = true; toast('Un tournoi est en cours : touche encore pour le remplacer'); return; }
      pnStart(); return;
    }
    case 'pnadd': if (C.players.length < 8) { pnSyncNames(); C.players.push('Joueur ' + (C.players.length + 1)); pnSave(); render(); } return;
    case 'pndel': pnSyncNames(); C.players.splice(+d.i, 1); pnSave(); render(); return;
    case 'pnrand': pnSyncNames(); pnRandomCourse(); pnSave(); render(); return;
    case 'pntgt': pnSyncNames(); C.tgt = d.v; pnSave(); render(); return;
    case 'pnsim': pnSyncNames(); C.sim = d.v; pnSave(); render(); return;
    case 'pncres': pnSyncNames(); VIEW = { name: 'pnCres', k: +d.k }; render(); window.scrollTo(0, 0); return;
    case 'pnsetupv': VIEW = { name: 'pnSetup' }; render(); window.scrollTo(0, 0); return;
    case 'pnnewf': pnSyncNames(); C.pre = pnField(C.n); pnSave(); render(); return;
    case 'pndraw': { pnSyncNames(); const b = pnDrawBank(); if (!b) { toast('Aucun terrain ne correspond'); return; } pnSave(); render(); toast(b.name + ' \u00b7 tees ' + b.tee); return; }
    case 'pnpgpick': { pnSyncNames(); const x = pigeState().list[+d.k]; if (x && pnSetBankCourse(x.name, x.tee)) { pnSave(); render(); toast(x.name + ' \u00b7 tees ' + x.tee); } return; }
    case 'pninc': pnStep(+d.i, 1); return;
    case 'pndec': pnStep(+d.i, -1); return;
    case 'pnok': pnOk(); return;
    case 'pnstep': { const cur = PNX.cur; cur.tx = (cur.tx || 0) + 1; if (!pnWaiting(cur)) return pnEndRound(); pnSave(); render(); return; }
    case 'pnfinr': pnEndRound(); return;
    case 'pnundo': pnUndo(); return;
    case 'pnr2': pnRound2(false); return;
    case 'pnsim2': pnRound2(true); return;
    case 'pnfmt': case 'pnlvl': case 'pnn': case 'pnall': pnChip(a, d.v); return;
    case 'pnpv': VIEW.pnpv = d.v; if (S && S.ui) { S.ui.pnpv = d.v; persist(); } render(); return;
    case 'pnback1': { const cur = PNX.cur; cur.phase = 'play'; cur.r = 0; cur.k = 18; cur.r1 = null; cur.alive = null; cur.cut = null; pnUndo(); VIEW = { name: 'pnPlay' }; render(); return; }
  }
}
function pnSyncNames() { document.querySelectorAll('[data-pnc="name"]').forEach(x => { PNX.cfg.players[+x.dataset.i] = x.value; }); }
function pnChip(k, v) {   // chipRow de la page de préparation (data-a = clé)
  const C = pnCfg(); pnSyncNames();
  if (k === 'pnfmt') C.fmt = +v; else if (k === 'pnlvl') C.lvl = +v; else if (k === 'pnn') { C.n = +v; C.pre = pnField(C.n); } else if (k === 'pnall') { VIEW.pnall = v === 'all'; render(); return; }
  pnSave(); render();
}
function pnChange(el) {
  const C = pnCfg(), k = el.dataset.pnc;
  if (k === 'name') C.players[+el.dataset.i] = el.value;
  else if (k === 'tee') { pnSetBankCourse(C.course.name, el.value); render(); }
  else if (k === 'wind') { if (el.dataset.r === '1') C.wind = el.value; else C.wind2 = el.value; const e = document.getElementById('pnest'); if (e) e.innerHTML = pnEstHTML(C); }
  else if (k === 'hc') C.hc = el.value;
  else if (k === 'pin') { if (el.dataset.r === '1') C.pin = el.value; else C.pin2 = el.value; }
  else if (k === 'n') { C.n = clamp(Math.round(+el.value || 0), 0, 1000); C.pre = pnField(C.n); pnSave(); render(); return; }
  else if (k === 'cutn') { C.cutN = Math.max(1, Math.round(+el.value || 0)); pnSave(); render(); return; }
  else if (k === 'gsz') { C.gsz = clamp(Math.round(+el.value || 4), 1, 200); pnSave(); render(); return; }
  pnSave();
}

/* ---- Plus ---- */
function tableSum(p) { return S.settings.tables[p].reduce((a, b) => a + (b || 0), 0); }
function restText(p) { return (Math.round((100 - tableSum(p)) * 1000) / 1000) + ' %'; }
function vMore() {
  const T = S.settings.tables;
  let h = '';
  const TOP = '<div class="top"><h1>Options</h1><button class="btn sec sm" data-a="mainmenu" style="flex:none">\u2302 Menu principal</button></div>';
  h += '<div class="block"><h3 style="margin-top:0">Affichage</h3><p class="small mute" style="margin-bottom:4px">\u00ab Automatique \u00bb choisit la mise en page selon la largeur de l\u2019\u00e9cran : colonnes pleine largeur sur ordinateur, une colonne sur t\u00e9l\u00e9phone.</p>' + chipRow([["auto", "Automatique"], ["mobile", "T\u00e9l\u00e9phone"], ["pc", "Ordinateur"]], LAYOUT, "layout") + '<p class="small mute" style="margin:10px 0 4px">Style sur ordinateur :</p>' + chipRow([["mgr", "Gestionnaire (sombre)"], ["classic", "Classique"]], SKIN, "skin") +
    (isPC() ? '<p class="small mute" style="margin:10px 0 4px">Zoom sur ordinateur :</p>' + chipRow(ZOOMS.map(z => [String(z), Math.round(z * 100) + ' %']), String(ZOOM), 'zoom') +   // v416
      '<button class="btn sec" data-a="fullscr" style="margin-top:12px">' + (fsOn() ? 'Quitter le plein écran' : '⛶ Plein écran') + '</button><p class="small mute" style="margin:6px 0 0">Le zoom est retenu sur cet ordinateur. Échap quitte le plein écran ; le navigateur demande un clic pour y revenir à chaque ouverture du jeu.</p>' : '') + '</div>';
  const _m = [h + '<div class="block"><b>Langue · Language</b>' + langPickHTML() + '</div><details><summary>Noms des Majeurs</summary><p class="small mute">Tournois 3, 5, 7 et 9 de la Ligue 1. Le nom s\u2019applique aux prochains Majeurs.</p>' + MAJ_T.map((t, i) => '<label for="mjn' + i + '">Tournoi ' + (t + 1) + '</label><input type="text" id="mjn' + i + '" data-c="majn" data-i="' + i + '" maxlength="40" value="' + esc(LANG === 'en' && majorName(t) === MAJ_DEF[i] ? trText(MAJ_DEF[i]) : majorName(t)) + '">').join('') + '</details>']; h = '';
  h += '<div class="block"><h3 style="margin-top:0">' + (S.one ? 'Format et ligne de paye' : 'Format et coupure') + '</h3>' +
    (S.duo ? '<p class="small mute" style="margin:0 0 6px">Partie Duo : tournois d\u2019une ronde.</p>' : chipRow([[2, '2 rondes \u00b7 coupure'], [1, '1 ronde']], S.one ? 1 : 2, 'setone') + '<p class="small mute" style="margin:0 0 6px">' + (S.t === 0 && !S.cur ? 'S\u2019applique d\u00e8s le prochain tournoi.' : 'Changeable seulement entre deux saisons (avant le 1er tournoi).') + '</p>') +
    '<label for="cut">' + (S.one ? 'Joueurs pay\u00e9s (plus les \u00e9galit\u00e9s)' : 'Joueurs qualifi\u00e9s apr\u00e8s la ronde 1 (plus les \u00e9galit\u00e9s)') + '</label><input type="number" id="cut" data-c="cut" min="20" max="140" value="' + S.settings.cut + '"></div>';
  _m.push(h); h = '';
  const TBL = {
    3: [['Trou d\u2019un coup', 0, -2], ['Birdie', 1, -1], ['Par', null, 0], ['Bogey', 2, 1], ['Double bogey', 3, 2], ['Triple bogey', 4, 3], ['Quadruple ou pire', 5, 4]],
    4: [['Aigle', 0, -2], ['Birdie', 1, -1], ['Par', null, 0], ['Bogey', 2, 1], ['Double bogey', 3, 2], ['Triple bogey', 4, 3], ['Quadruple ou pire', 5, 4]],
    5: [['Albatros', 6, -3], ['Aigle', 0, -2], ['Birdie', 1, -1], ['Par', null, 0], ['Bogey', 2, 1], ['Double bogey', 3, 2], ['Triple bogey', 4, 3], ['Quadruple ou pire', 5, 4]]
  };
  h += '<details><summary>Probabilit\u00e9s de base par trou (en %)</summary><p class="small mute">Toutes les possibilit\u00e9s pour chaque type de trou, r\u00e9glables jusqu\u2019\u00e0 3 d\u00e9cimales. Le par est le reste et se recalcule tout seul. Ces valeurs d\u00e9crivent un joueur moyen ; le niveau de chaque golfeur d\u00e9cale ensuite les r\u00e9sultats ordinaires.</p>' +
    [3, 4, 5].map(p => '<h3>Par ' + p + ' <span class="mute small">\u00b7 de ' + (p === 3 ? 1 : 2) + ' \u00e0 ' + (p + 4) + ' coups</span></h3><div class="tgrid">' + TBL[p].map(([name, k, rel]) => {
      const strokes = p + rel, lbl = name + ' <span class="mute">\u00b7 ' + strokes + '</span>';
      if (k === null) return '<div class="ti"><label>' + lbl + '</label><div class="rest" id="rest' + p + '">' + restText(p) + '</div></div>';
      return '<div class="ti' + ((k === 0 && p !== 5) || k === 6 ? ' rare' : '') + '"><label for="t' + p + k + '">' + lbl + '</label><input type="number" inputmode="decimal" step="0.001" min="0" max="60" id="t' + p + k + '" data-c="tbl" data-p="' + p + '" data-k="' + k + '" value="' + (Math.round((T[p][k] || 0) * 1000) / 1000) + '"></div>';
    }).join('') + '</div>').join('') +
    '<p class="small mute">Le trou d\u2019un coup, l\u2019aigle sur un par 4 et l\u2019albatros sont des \u00e9v\u00e9nements rares : ce sont les taux de la Ligue 1 (rep\u00e8res du PGA Tour). Ils diminuent ensuite de ligue en ligue.</p>' +
    '<label for="cfg-goodStep">Baisse de ces trois \u00e9v\u00e9nements par ligue (%)</label><input type="number" id="cfg-goodStep" data-c="cfgnum" data-k="goodStep" data-min="0" min="0" max="30" step="1" value="' + S.cfg.goodStep + '">' +
    '<button class="btn sec sm" data-a="tblreset" style="margin-top:12px;width:100%">R\u00e9tablir les valeurs par d\u00e9faut</button></details>';
  _m.push(h); h = '';
  const CR = [['form', 'Intensit\u00e9 de la forme', 0, 2, 0.1, '\u00d7'], ['streakP', 'Chances de s\u00e9quence par tournoi', 0, 15, 0.5, ' %'], ['coldShare', 'Part de creux dans les s\u00e9quences', 0, 100, 5, ' %'], ['streakMax', 'Dur\u00e9e maximale d\u2019une s\u00e9quence', 2, 8, 1, ' tournois'],
['hotP', 'Rondes de feu', 0, 12, 0.5, ' %'], ['coldP', 'Rondes catastrophes', 0, 12, 0.5, ' %'], ['youth', 'Progression des jeunes', 0, 2, 0.1, '\u00d7'], ['decline', 'D\u00e9clin des v\u00e9t\u00e9rans', 0, 2, 0.1, '\u00d7'], ['idxK', 'Effet de l\u2019index du trou', 0, 0.1, 0.005, ''], ['holeVar', 'Variabilit\u00e9 des trous d\u2019un tournoi \u00e0 l\u2019autre', 0, 2, 0.1, '\u00d7'], ['terrainVar', 'Variabilit\u00e9 des terrains', 0, 2, 0.1, '\u00d7']];
  h += '<details><summary>R\u00e9glages du monde</summary><p class="small mute">Les changements s\u2019appliquent aux prochains tournois. La r\u00e9gularit\u00e9 est tir\u00e9e \u00e0 la cr\u00e9ation de chaque golfeur (environ 15 % tr\u00e8s r\u00e9guliers, 20 % r\u00e9guliers, 30 % moyens, 20 % irr\u00e9guliers, 15 % montagnes russes) ; \u00ab Tirer de nouveaux coefficients \u00bb redistribue tout le circuit selon ces proportions. \u00ab Variabilit\u00e9 des terrains \u00bb agit sur le g\u00e9n\u00e9rateur de terrains al\u00e9atoires (bouton \u00ab G\u00e9n\u00e9rer des statistiques al\u00e9atoires \u00bb), l\u2019al\u00e9a propre au terrain et la m\u00e9t\u00e9o : 1\u00d7 est le r\u00e9glage recommand\u00e9. Les terrains que tu as r\u00e9gl\u00e9s \u00e0 la main gardent leur course rating et leur slope.</p>' +
    CR.map(r => '<label for="cfg-' + r[0] + '" style="display:flex;justify-content:space-between;gap:8px">' + r[1] + '<b id="cv-' + r[0] + '">' + S.cfg[r[0]] + r[5] + '</b></label><input type="range" id="cfg-' + r[0] + '" data-c="cfg" data-k="' + r[0] + '" data-u="' + r[5] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + S.cfg[r[0]] + '">').join('') +
    '<h3 style="margin:16px 0 4px">Terrain neutre</h3><p class="small mute" style="margin:0 0 4px">Un terrain avec ces valeurs n\u2019a aucun effet sur les scores. Au-dessus, il joue plus difficile ; en dessous, plus facile.</p>' +
    '<label for="cfg-crRef">Course rating neutre (pour un par 72)</label><input type="number" id="cfg-crRef" data-c="cfgnum" data-k="crRef" data-min="55" min="55" max="80" step="0.1" inputmode="decimal" value="' + (S.cfg.crRef != null ? S.cfg.crRef : 69.5) + '">' +
    '<p class="small mute" style="margin:2px 0 0">Suit le par : avec 70,3, un par 71 est neutre \u00e0 69,3 et un par 73 \u00e0 71,3. Chaque point de plus ajoute un coup par ronde.</p>' +
    '<label for="cfg-slopeRef">Slope neutre</label><input type="number" id="cfg-slopeRef" data-c="cfgnum" data-k="slopeRef" data-min="55" min="55" max="155" step="1" value="' + (S.cfg.slopeRef || 126) + '">' +
    '<p class="small mute" style="margin:2px 0 0">Au-dessus, l\u2019\u00e9cart entre les bons et les moins bons golfeurs s\u2019agrandit ; en dessous, il se r\u00e9tr\u00e9cit.</p>' +
    '<label for="cfg-distRef">Distance neutre d\u2019un terrain (verges)</label><input type="number" id="cfg-distRef" data-c="cfgnum" data-k="distRef" data-min="3000" min="3000" max="8000" step="50" value="' + (S.cfg.distRef || 6070) + '">' +
    '<label for="cfg-distStep">Verges pour un coup de plus (ou de moins) par ronde</label><input type="number" id="cfg-distStep" data-c="cfgnum" data-k="distStep" data-min="25" min="25" max="2000" step="25" value="' + (S.cfg.distStep || 600) + '">' +
    '<p class="small mute" style="margin:4px 0 0">S\u2019ajoute au course rating pour tous les golfeurs simul\u00e9s. Exemple : 600 verges au-dessus de la distance neutre = environ +1 coup par ronde (un peu moins pour l\u2019\u00e9lite, un peu plus pour les plus faibles, comme pour le vent).</p>' +
    '<h3 style="margin:16px 0 4px">Vent tiré au hasard</h3><p class="small mute" style="margin:0 0 6px">Chances de chaque vent quand il est tiré au hasard (bouton 🎲, tirage des terrains, nouvelle saison). Le total est ramené à 100 %. Le drapeau, lui, a 25 % de chances pour chaque jour.</p><div class="wwg">' +
    WIND_LEVELS.map((w, k) => '<div><label for="ww' + k + '">' + WIND_LABELS[w] + ' (%)</label><input type="number" id="ww' + k + '" data-c="cfgwind" data-i="' + k + '" min="0" max="100" step="1" value="' + ((Array.isArray(S.cfg.windW) ? S.cfg.windW : WIND_WEIGHTS)[k] || 0) + '"></div>').join('') + '</div>' +
    '<label style="display:flex;gap:10px;align-items:center;margin-top:16px"><input type="checkbox" data-c="cfgcheck" style="width:22px;height:22px"' + (S.cfg.showForm ? ' checked' : '') + '> Afficher la forme et la r\u00e9gularit\u00e9 des golfeurs</label>' +
    '<label style="display:flex;gap:10px;align-items:center;margin-top:12px"><input type="checkbox" data-c="cfgcheck" data-k="phenom" style="width:22px;height:22px"' + (S.cfg.phenom !== 0 && S.cfg.phenom !== false ? ' checked' : '') + '> Ph\u00e9nom\u00e8nes rares (un golfeur dominant, environ une fois aux 25 saisons)</label>' +
    '<label style="display:flex;gap:10px;align-items:center;margin-top:12px"><input type="checkbox" data-c="cfgcheck" data-k="showIdx" style="width:22px;height:22px"' + (S.cfg.showIdx ? ' checked' : '') + '> Afficher le handicap dans les classements</label>' +
    '<button class="btn sec sm" data-a="regen" style="width:100%;margin-top:12px">Tirer de nouveaux coefficients de r\u00e9gularit\u00e9</button><button class="btn sec sm" data-a="cfgreset" style="width:100%;margin-top:8px">R\u00e9tablir les r\u00e9glages par d\u00e9faut</button></details>';
  _m.push(h); h = '';
  h += ptsEditorHTML();
  _m.push(h); h = '';
  if (duoOn()) h += '<div class="block"><h3 style="margin-top:0">Parties</h3><p style="margin:0">Partie ouverte : <b>' + (SLOT === 'save-duo' ? 'Duo' : 'Ma carri\u00e8re') + '</b></p><p class="small mute" style="margin:4px 0 8px">Ta carri\u00e8re et la partie Duo sont gard\u00e9es s\u00e9par\u00e9ment ; passer de l\u2019une \u00e0 l\u2019autre ne change rien \u00e0 l\u2019autre.</p><button class="btn sec" data-a="slot" data-v="' + (SLOT === 'save-duo' ? 'save' : 'save-duo') + '">' + (SLOT === 'save-duo' ? 'Ouvrir ma carri\u00e8re' : 'Ouvrir la partie Duo') + '</button></div>';
  h += '<h2>Sauvegarde</h2><p class="small mute">La partie est enregistr\u00e9e automatiquement dans ce navigateur, sur cet appareil. Exporte un fichier de temps en temps pour la conserver ou la d\u00e9placer.</p>' +
    '<div class="block" id="bklist"><b>Copies automatiques</b><p class="small mute" style="margin:2px 0 6px">Apr\u00e8s chaque tournoi, le jeu garde une copie de ta partie dans ce navigateur (les ' + BK_N + ' derni\u00e8res)' + (canPickDir() ? ' et, si tu as choisi le dossier Saved Games, un fichier auto-1 \u00e0 auto-' + BK_N + ' qui tourne' : '') + '.</p><div id="bkrows" class="small mute">\u2026</div></div>' +
    '<label for="expn">Nom du fichier (optionnel)</label><input type="text" id="expn" placeholder="' + esc(defaultSaveName()) + '" value="' + esc(VIEW.exportName || '') + '" autocomplete="off">' +
    (S.saveBase ? '<p class="small mute" style="margin:4px 0 0"><span>Par défaut :</span> <b class="notr">' + esc(defaultSaveName()) + '</b> · <span>écris un autre nom pour le changer.</span></p>' : '<p class="small mute" style="margin:4px 0 0">Le nom que tu écris devient le nom par défaut : le jeu y ajoutera l’année et le tournoi (ex. « max vrai - ' + saveTag() + ' »).</p>') +
    '<button class="btn" data-a="export" style="margin-top:6px">' + (canPickDir() ? 'Sauvegarder la partie' : 'T\u00e9l\u00e9charger un fichier de sauvegarde') + '</button>' +
    (canPickDir() ? '<p class="small mute" style="margin:4px 0 10px">' + (SAVEDIR ? 'Les sauvegardes vont directement dans le dossier <b>' + esc(SAVEDIR.name) + '</b>. <a href="#" data-a="savedir">Changer de dossier</a>' : 'La premi\u00e8re fois, choisis le dossier \u00ab Saved Games \u00bb dans le dossier du jeu : les sauvegardes suivantes iront directement l\u00e0. <a href="#" data-a="savedir">Choisir maintenant</a>') + '</p>' : '') +
    (!canPickDir() && typeof window !== 'undefined' && window.showSaveFilePicker ? '<p class="small mute" style="margin:4px 0 10px">Une bo\u00eete \u00ab Enregistrer sous \u00bb s\u2019ouvre : tu y choisis aussi le dossier.</p>' : '') +
    '<label class="btn sec filebtn" style="margin:8px 0">Importer une sauvegarde<input type="file" id="imp" class="fileinp" data-c="import"></label>' +
    '<details style="border-top:none;padding-top:2px"><summary style="font-size:16px;color:var(--acc)">Le s\u00e9lecteur ne s\u2019ouvre pas ?</summary><p class="small mute">Ouvre le fichier .json dans une appli de texte, copie tout son contenu, puis colle-le ici.</p><textarea id="impText" rows="5" placeholder="Colle ici le contenu du fichier .json"></textarea><button type="button" class="btn sec sm" style="width:100%;margin-top:8px" data-a="importtext" data-v="impText">Importer le texte coll\u00e9</button></details>';
  if (VIEW.saveConflict) h += '<div class="block" id="svconf" style="border:1.5px solid var(--me)"><p style="margin:0 0 8px"><b><span>Une sauvegarde porte déjà ce nom :</span> <span class="notr">' + esc(VIEW.saveConflict.full) + '</span></b></p><div style="display:flex;flex-direction:column;gap:8px"><button class="btn sm" style="width:100%" data-a="svover">Remplacer cette sauvegarde</button><button class="btn sec sm" style="width:100%" data-a="svnew"><span>Nouvelle sauvegarde :</span> <span class="notr">' + esc(VIEW.saveConflict.alt) + '</span></button><button class="btn sec sm" style="width:100%" data-a="svcancel">Annuler</button></div></div>';
  if (VIEW.exportText) h += '<p class="small mute">Le t\u00e9l\u00e9chargement direct n\u2019a pas fonctionn\u00e9 ici. Copie ce texte \u00e0 la place :</p><label for="xt">Sauvegarde (texte)</label><textarea id="xt" readonly>' + esc(VIEW.exportText) + '</textarea>';
  if (VIEW.pending) h += '<div class="block"><p><b>Remplacer la partie actuelle ?</b> La sauvegarde import\u00e9e est \u00e0 la saison ' + VIEW.pending.season + ', tournoi ' + Math.min(VIEW.pending.t + 1, N_TOURN) + '.</p><div class="row"><button class="btn sm" data-a="import2">Importer</button><button class="btn sec sm" data-a="cancel">Annuler</button></div></div>';
  h += '<h2>Zone sensible</h2>';
  if (VIEW.confirmReset) h += '<div class="block"><p><b>Effacer toute la partie ?</b> Cette action est d\u00e9finitive.</p><div class="row"><button class="btn danger sm" data-a="reset2">Tout effacer</button><button class="btn sec sm" data-a="cancel">Annuler</button></div></div>';
  else h += '<button class="btn danger" data-a="reset">Recommencer une nouvelle carri\u00e8re</button>';
  _m.push(h);   // _m : [affichage, format, probabilités par trou, réglages du monde, barème + noms, parties + sauvegarde]
  const mt = VIEW.mt || 'gen', tabs = '<div class="ptabs mtabs" role="tablist">' + [['gen', 'Général'], ['aff', 'Affichage'], ['bar', 'Barèmes'], ['adv', 'Avancé<span class="aexp">EXPERT</span>'], ['com', 'Commissaire']].map(t => '<button class="ptab" role="tab" data-a="mt" data-v="' + t[0] + '" aria-selected="' + (t[0] === mt) + '">' + t[1] + '</button>').join('') + '</div>';
  if (mt === 'com') return TOP + tabs + '<div class="narrow">' + commHTML() + '</div>';
  if (mt === 'adv') return TOP + tabs + lockBanner() + lockWrap(advHTML(_m[3].replace('<details><summary>R\u00e9glages du monde</summary>', '<details open><summary>Forme, séquences, terrain neutre, fréquence du vent…</summary>')));
  const nmI = _m[4].indexOf('<details><summary>Noms des golfeurs');
  const body = mt === 'aff' ? gfxOptHTML() + sndOptHTML() + _m[0] : mt === 'bar' ? lockBanner() + lockWrap(_m[2] + (nmI >= 0 ? _m[4].slice(0, nmI) : _m[4])) + (nmI >= 0 ? _m[4].slice(nmI) : '') : lvlCareerHTML() + _m[1] + _m[5];
  return TOP + tabs + '<div class="pcols">' + body + '</div>';
}

/* ---- Fin de saison ---- */
/* ---- Fin de saison : résumé complet (ta saison + une lecture par ligue) ---- */
const fmtM = n => n >= 1e6 ? (LANG === 'en' ? '$' + (Math.round(n / 1e5) / 10) + 'M' : (Math.round(n / 1e5) / 10).toString().replace('.', ',') + '\u00a0M$') : fmtMoney(n);
const tierName = i => TIERS[i] ? TIERS[i][1] : '?';
const idList = ids => sumTxt(ids.map(tk).join(', '));
const detailsBox = (label, inner) => '<details class="dl"><summary>' + label + '</summary>' + inner + '</details>';
function crownsOf(id) { let n = 0; S.hist.forEach(H => { if (H.end) H.end.tables.forEach(tb => { if (tb[0] && tb[0][0] === id) n++; }); }); return n; }
function careerWins(id) { const g = S.G[id] || (S.old && S.old[id]); return g && g.cw || 0; }
function seasonStats(H, l) {
  const played = H.t.filter(Boolean); if (!played.length) return null;
  const winners = new Set(); let purse = 0, best = null, recs = 0;
  played.forEach(t => {
    const lg = t.lg[l]; winners.add(lg.rows[0][0]);
    Object.keys(lg.pay || {}).forEach(k => { purse += lg.pay[k]; });
    lg.rows.forEach(r => [r[2], r[3]].forEach(v => { if (v !== null && (!best || v < best.v)) best = { id: r[0], v, par: t.par || 0 }; }));
    (t.recs || []).forEach(r => { if (r.l === l) recs++; });
  });
  return { n: played.length, winners: winners.size, purse, best, recs };
}
function mySeason(H, E) {
  const row = E.tables[E.from] ? E.tables[E.from].find(r => r[0] === 0) : null;
  let cuts = 0, played = 0, earn = 0;
  H.t.forEach(t => { if (!t) return; const lg = t.pl === 4 ? t.rc : t.lg[t.pl], r = lg && lg.rows.find(x => x[0] === 0); if (!r) return; played++; if (r[1] === 0) cuts++; earn += (lg.pay && lg.pay[0]) || 0; });
  return { row, cuts, played, earn };
}
const tile = (v, k) => '<div class="mtile"><b>' + v + '</b><span>' + k + '</span></div>';
/* v249 : bilan de ta saison dans la classe de recrues */
function rcEndHTML(H, E, s, arch, off) {
  const p = E.prc, rs = H.t.filter(t => t && t.rc).map(t => [t, t.rc.rows.find(r => r[0] === 0)]).filter(x => x[1]);
  const best = rs.reduce((b, x) => x[1][1] > 0 && (!b || x[1][1] < b[1][1]) ? x : b, null), w = rs.filter(x => x[1][1] === 1).length;
  let rd = 0, sm = 0; rs.forEach(([t, r]) => { sm += r[2] + (r[3] || 0); rd += r[3] == null ? 1 : 2; });
  return '<div class="' + (off ? 'tg' : 'ctx') + '">Ton rang final dans la classe de recrues</div><div class="' + (off ? 'ofbig' : 'big') + '">' + ord(p[3]) + '</div><p style="margin:8px 0 0"><span>Index final</span> ' + (p[1] >= 90 ? '–' : fmtHI(p[1])) + ' \u00b7 <span>' + (arch ? 'tu as commencé ta carrière en' : 'tu commences ta carrière en') + '</span> <b>' + LEAGUE_NAMES[p[2]] + '</b> (' + yr(s + 1) + ')</p>' +
    '<div class="mgrid">' + tile(rs.length, 'tournois') + tile(w, w > 1 ? 'victoires' : 'victoire') + tile(best ? ord(best[1][1]) : '–', 'meilleur résultat') + tile(rd ? (v => v === 0 ? 'E' : (v > 0 ? '+' : '') + fmt1(v))(Math.round(sm / rd * 10) / 10) : '–', 'moyenne par ronde') + '</div>';
}

function endLeagueHTML(H, E, l) {
  const tb = E.tables[l], x = E.x; let h = '';
  const nlist = (ids, n) => ids.length <= n ? listT(ids) : ids.slice(0, n).map(tk).join(', ') + ' et ' + (ids.length - n) + ' autres';
  /* course finale, promotions, relégations */
  const items = [], boxes = [];
  const ch = tb[0], sec = tb[1];
  if (ch) {
    const cr = crownsOf(ch[0]), gap = sec ? ch[1] - sec[1] : 0;
    items.push({ i: 'trophy', t: (ch[0] === 0 ? 'Tu remportes' : tk(ch[0]) + ' remporte') + ' le classement final de la Ligue ' + (l + 1) + (ch[5] ? ' (' + (ch[0] === 0 ? 'tu as' : 'il a') + ' été promu en cours de saison)' : '') + ' avec ' + ptsWord(ch[1]) + (ch[2] ? ' et ' + plural(ch[2], 'victoire') : '') + (sec ? ', ' + (gap ? ptsWord(gap) + ' d’avance sur ' : 'à égalité de points avec ') + tk(sec[0]) : '') + '.' + (cr >= 2 ? (ch[0] === 0 ? ' C’est ton ' : ' C’est son ') + ord(cr) + ' titre de champion de ligue.' : '') });
  }
  const midUp = (E.midMoves || []).filter(m => m.fromL === l && m.type === 'up');
  const midDown = (E.midMoves || []).filter(m => m.fromL === l && m.type === 'down');
  const midList = arr => arr.slice(0, 5).map(m => tk(m.id) + ' (' + m.reason + ')').join(', ') + (arr.length > 5 ? ' et ' + (arr.length - 5) + ' autre' + (arr.length - 5 > 1 ? 's' : '') : '');
  if (midUp.length) items.push({ i: 'arrowup', t: 'Mont\u00e9s en cours de saison en Ligue ' + (midUp[0].toL + 1) + ' : ' + midList(midUp) + '.' });
  if (midDown.length) items.push({ i: 'arrowdown', t: 'Descendus en cours de saison en Ligue ' + (midDown[0].toL + 1) + ' : ' + midList(midDown) + '.' });
  if (l > 0 && E.up[l] && E.up[l].length) {
    const up = E.up[l];
    items.push({ i: 'arrowup', t: 'Promus en Ligue ' + l + ' (les ' + up.length + ' premiers' + (up.length > MOVE ? ', dont ' + (up.length - MOVE) + ' pour combler les départs à la retraite' : '') + ') : ' + nlist(up, 3) + '.' });
    if (up.length > 3) boxes.push(detailsBox('Voir les ' + up.length + ' promus', '<p>' + idList(up) + '.</p>'));
  }
  if (l < 3 && E.down[l] && E.down[l].length) {
    const dn = E.down[l], notable = dn.slice().sort((a, b) => careerWins(b) - careerWins(a)).slice(0, 3);
    items.push({ i: 'arrowdown', t: 'Relégués en Ligue ' + (l + 2) + ' (les ' + dn.length + ' derniers) : ' + (dn.length > 3 ? 'dont ' + notable.map(tk).join(', ') + ' et ' + (dn.length - 3) + ' autres' : listT(dn)) + '.' });
    if (dn.length > 3) boxes.push(detailsBox('Voir les ' + dn.length + ' relégués', '<p>' + idList(dn) + '.</p>'));
  }
  h += '<div class="block sumblk"><h3>Course finale en Ligue ' + (l + 1) + '</h3>' + sumList(items) + boxes.join('') + '</div>';
  if (!x) {
    h += '<p class="small mute">Résumé reconstitué : les retraités, les changements de palier et les recrues de cette intersaison n’étaient pas conservés.</p>';
  } else {
    /* retraites */
    const rt = x.rt.filter(r => r[5] === l).sort((a, b) => (b[3] - a[3]) || (b[2] - a[2]));
    const rtLine = r => (r[0] === 0 ? 'Ta carrière prend fin' : r[7] ? tk(r[0]) + ' perd sa place (' + fL4N(r[7]) + ' saisons en Ligue 4 sans monter)' : tk(r[0]) + ' range ses clubs') + ' à ' + r[1] + ' ans : ' + plural(r[2], 'saison') + ', ' + (r[3] ? plural(r[3], 'titre') : 'aucun titre') + (r[4] ? ', ' + fmtM(r[4]) + ' de gains' : '') + (r[6] >= 0 ? ', dernier niveau « ' + tierName(r[6]) + ' »' : '') + '.';
    const nf = rt.filter(r => r[7]).length;
    h += '<div class="block sumblk"><h3>Retraites · ' + rt.length + (nf ? ' (dont ' + nf + ' forcée' + (nf > 1 ? 's' : '') + ')' : '') + '</h3>' + (rt.length ? sumList(rt.slice(0, 2).map(r => ({ i: 'door', t: rtLine(r) }))) + (rt.length > 2 ? detailsBox(rt.length === 3 ? 'Voir l’autre retraite' : 'Voir les ' + (rt.length - 2) + ' autres retraites', sumList(rt.slice(2).map(r => ({ i: 'door', t: rtLine(r) })))) : '') : '<p class="small mute" style="margin:0">Aucune retraite dans cette ligue.</p>') + '</div>';
    /* changements de palier : tous les golfeurs concernés */
    const tcl = x.tc.filter(c => c[3] === l);
    const ups = tcl.filter(c => c[2] > c[1]).sort((a, b) => (b[2] - a[2]) || ((b[2] - b[1]) - (a[2] - a[1])) || a[0] - b[0]);
    const dns = tcl.filter(c => c[2] < c[1]).sort((a, b) => (a[2] - b[2]) || ((a[2] - a[1]) - (b[2] - b[1])) || a[0] - b[0]);
    const tcLine = (c, ic) => ({ i: ic, t: (c[0] === 0 ? 'Toi' : tk(c[0])) + ' : ' + tierName(c[1]) + ' → ' + tierName(c[2]) + (Math.abs(c[2] - c[1]) > 1 ? ' (' + (c[2] > c[1] ? '+' : '−') + Math.abs(c[2] - c[1]) + ' paliers)' : '') + (c[4] < c[3] ? ' · promu en Ligue ' + (c[4] + 1) : c[4] > c[3] ? ' · relégué en Ligue ' + (c[4] + 1) : '') });
    const grp = (list, ic, title) => list.length ? '<p class="small mute" style="margin:8px 0 0">' + title + ' · ' + list.length + '</p>' + sumList(list.slice(0, 5).map(c => tcLine(c, ic))) + (list.length > 5 ? detailsBox('Voir les ' + (list.length - 5) + ' autres', sumList(list.slice(5).map(c => tcLine(c, ic)))) : '') : '';
    h += '<div class="block sumblk"><h3>Changements de palier · ' + tcl.length + '</h3>' + (tcl.length ? grp(ups, 'up', 'Montent d’un palier ou plus') + grp(dns, 'down', 'Reculent') : '<p class="small mute" style="margin:0">Aucun changement de palier dans cette ligue.</p>') + '</div>';
    /* recrues */
    const rk = x.rk.filter(r => r[1] === l).sort((a, b) => (b[3] - a[3]) || (a[2] - b[2]));
    const rkLine = r => tk(r[0]) + ', ' + r[2] + ' ans, potentiel « ' + POTS[r[3]][1] + ' »';
    { const all = (x.rk || []).filter(r => r[0] !== 0), top = all.map(r => S.G[r[0]]).filter(g => g && g.p != null).sort((a, b) => b.p - a.p)[0];
      h += '<div class="block sumblk rcpromo"><h3>La classe de ' + yr(H.s + 1) + ' · ' + all.length + ' recrues</h3>' + (top ? '<p style="margin:0 0 8px">Le joyau de la classe : ' + flagVisual(top.nat, 18) + ' <b>' + esc(nameOf(top.id)) + '</b>, ' + top.a + ' ans, ' + rcStarsHTML(5) + ' · ' + POTS[scale(POTS, top.p)][1] + '</p>' : '') + (H.end && H.end.roy ? '<p class="small" style="margin:0 0 8px">\ud83c\udfc6 Recrue de l’année : <b>' + esc(nameOf(H.end.roy.id)) + '</b></p>' : '') + '<button class="btn sm" data-a="rclass" data-s="' + H.s + '">Voir la classe de ' + yr(H.s + 1) + '</button></div>'; }
    if (false) h += '<div class="block sumblk"><h3>Nouvelles recrues · ' + rk.length + '</h3>' + (rk.length ? sumList([{ i: 'star', t: 'La plus prometteuse : ' + rkLine(rk[0]) + '.' }]) + (rk.length > 1 ? detailsBox('Voir toutes les recrues de la Ligue ' + (l + 1), sumList(rk.map(r => ({ i: 'star', t: rkLine(r) + '.' })))) : '') : '<p class="small mute" style="margin:0">' + (l < 3 ? 'Les recrues arrivent toutes en Ligue 4.' : 'Aucune recrue cette saison.') + '</p>') + '</div>';
  }
  /* la saison en chiffres */
  const ss = seasonStats(H, l);
  if (ss) {
    const mw = tb.reduce((m, r) => Math.max(m, r[2]), 0), lead = tb.filter(r => r[2] === mw && mw > 0).map(r => r[0]);
    h += '<div class="block sumblk"><h3>La saison en chiffres</h3><div class="mgrid">' + tile(ss.winners, ss.winners > 1 ? 'vainqueurs différents' : 'vainqueur') + tile(fmtM(ss.purse), 'de bourses distribuées') +
      (ss.best ? tile(sumTxt(tk(ss.best.id)) , 'meilleure ronde : ' + (ss.best.par ? (ss.best.par + ss.best.v) + ' (' + fmt(ss.best.v) + ')' : fmt(ss.best.v))) : '') +
      (lead.length ? tile(mw, (mw > 1 ? 'victoires' : 'victoire') + ' pour ' + (lead.length > 2 ? lead.length + ' golfeurs' : sumTxt(listT(lead)))) : '') +
      tile(ss.recs, ss.recs > 1 ? 'records de ligue battus' : 'record de ligue battu') + '</div></div>';
  }
  return h;
}

function vSeasonEnd() {
  const H = S.hist[VIEW.s - 1], E = H.end, from = E.from, to = E.to, retired = to === -1 && from >= 0, noMe = from < 0;
  const verdict = retired ? '' : (to < from ? '<span class="tag good">Promotion</span>' : to > from ? '<span class="tag bad">Relégation</span>' : '<span class="tag">Maintien</span>');
  const arch = !!VIEW.arch, ns = VIEW.s + 1, l = VIEW.l != null ? VIEW.l : Math.max(0, from);
  let h = '', R = '', F = '';
  const T = '<div class="top"><div><h1>Fin de la saison ' + yr(VIEW.s) + '</h1></div></div>';
  const c1 = E.tables[0][0];
  if (c1) h += '<div class="block sumhead"><div class="sh1">' + sumTxt(c1[0] === 0 ? 'Tu es couronné champion de la Ligue 1' : tk(c1[0]) + ' couronné en Ligue 1') + '</div><div class="ctx">' + plural(c1[2], 'victoire') + ' · ' + ptsWord(c1[1]) + (crownsOf(c1[0]) >= 2 ? ' · ' + ord(crownsOf(c1[0])) + ' titre de champion de ligue' : '') + '</div></div>';
  const g0 = !noMe && !retired ? S.G[0] : null;
  if (g0) h += '<div class="secard">' + levelCard(g0, leagueOf(0), { name: nameOf(0), ctx: 'Toi \u00b7 ' + g0.a + ' ans' + (g0.nat ? ' \u00b7 ' + esc(g0.nat) : '') + (leagueOf(0) >= 0 ? ' \u00b7 ' + LEAGUE_NAMES[leagueOf(0)] : ''), id: 0, link: true }) + '</div>';
  if (noMe && E.prc) h += '<div class="block hero">' + rcEndHTML(H, E, VIEW.s, !!VIEW.arch);
  else if (noMe) h += '<div class="block"><p class="mute" style="margin:0">Saison ' + yr(VIEW.s) + ' : ' + (VIEW.s < (S.joinS || 0) ? 'avant ton arriv\u00e9e dans le circuit.' : 'tu n\u2019\u00e9tais pas en activit\u00e9.') + '</p>';
  else h += '<div class="block hero">' + (!g0 && !retired && leagueOf(0) >= 0 ? '<a href="#" class="sh1" data-a="golfer" data-id="0" style="display:block;color:inherit;text-decoration:none;margin:0 0 6px" title="Voir ton profil">' + esc(nameOf(0)) + ' <span style="color:var(--acc)">\u203a</span></a>' : '') + '<div class="ctx">Ton classement final en ' + LEAGUE_SHORT[from] + '</div><div class="big">' + ord(E.rank) + '</div><p style="margin:8px 0 0">' + (retired ? 'Ta carrière s’est terminée à la fin de cette saison.' : verdict + ' \u00a0' + (arch ? 'Tu as commencé la saison ' : 'Tu commences la saison ') + yr(ns) + ' en <b>' + LEAGUE_NAMES[to] + '</b>.') + '</p>';
  const me = mySeason(H, E);
  if (me.row) {
    const mc = E.x ? E.x.tc.find(c => c[0] === 0) : null;
    h += '<div class="mgrid">' + tile(me.row[2], me.row[2] > 1 ? 'victoires' : 'victoire') + tile(me.row[3], 'top 10') + tile(me.cuts, me.cuts > 1 ? 'coupures ratées' : 'coupure ratée') + tile(fmtM(me.earn), 'gains de la saison') + '</div>' +
      (mc ? '<p style="margin:10px 0 0">Ton niveau : ' + tierName(mc[1]) + ' → <b>' + tierName(mc[2]) + '</b></p>' : '');
  }
  h += '</div>';
  if (!arch && canRetire() && VIEW.s === S.season - 1) h += retireBlock();
  R += chipRow(LEAGUE_SHORT.map((n, i) => [i, 'L' + (i + 1)]), l, 'endleague') + endLeagueHTML(H, E, l);
  R += '<h2>Classement final · ' + LEAGUE_SHORT[l] + '</h2>' + standingsBoard(l, { tableRows: E.tables[l], top: 5, around: 2, at: [VIEW.s, N_TOURN - 1] });
  R += hofSeasonHTML(VIEW.s); R += wrSeasonHTML(VIEW.s);
  if (E.news.length) R += '<div class="block sumblk"><h3>Dans le monde du golf</h3><ul class="news">' + E.news.map((n, i) => '<li>' + newsHTML(n, (E.nids && E.nids[i]) || idsIn(n)) + '</li>').join('') + '</ul></div>';
  F += arch && NAV.length ? '<button class="btn" data-a="backview" style="margin-top:14px">Retour</button>' : arch ? '<button class="btn" data-a="' + (VIEW.from === 'arch' ? 'archback' : 'journal') + '" style="margin-top:14px">Retour ' + (VIEW.from === 'arch' ? '\u00e0 l\u2019historique' : 'au journal') + '</button>' : '<button class="btn" data-a="home" style="margin-top:14px">Commencer la saison ' + yr(S.season) + '</button>';
  return T + cols(h, R, F);
}

/* ---- World Ranking à l'intersaison : top 10 avec mouvement depuis la dernière intersaison, entrées dans le top 100,
   plus fortes montées et chutes ---- */

