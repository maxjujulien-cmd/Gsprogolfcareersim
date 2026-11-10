/* ============ MOTEUR DE SIMULATION (sans DOM) ============ */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
let _sp = null;
function gauss() {
  if (_sp !== null) { const s = _sp; _sp = null; return s; }
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  const m = Math.sqrt(-2 * Math.log(u));
  _sp = m * Math.sin(2 * Math.PI * v);
  return m * Math.cos(2 * Math.PI * v);
}
function Phi(x) { // CDF normale (Abramowitz-Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
function PhiInv(p) { // Acklam
  p = clamp(p, 1e-9, 1 - 1e-9);
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  q = p - 0.5; r = q * q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5]) * q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

/* ---- Tables de résultats par trou (probabilités en %, le par = le reste) ----
   ordre : aigle(-2), birdie(-1), bogey(+1), double(+2), triple(+3), quadruple+(+4) */
const DEFAULT_TABLES = {
  3: [0.036, 6, 22, 5, 0.8, 0.1],          // trou d'un coup (rare), birdie, bogey, double, triple, quadruple+
  4: [0.1, 5, 20, 5, 1, 0.1],              // aigle (rare), birdie, bogey, double, triple, quadruple+
  5: [1, 18, 15, 4, 0.8, 0.1, 0.006]       // aigle, birdie, bogey, double, triple, quadruple+, albatros (rare)
};
const RELS = [-2, -1, 0, 1, 2, 3, 4];
function buildPar(tabPct, par) {
  const p = tabPct.map(x => (x || 0) / 100);
  /* Colonne 0 : trou d'un coup (par 3) / aigle (par 4) = événements rares, à part ; aigle ordinaire sur par 5 ;
     colonne 6 (par 5) : albatros = événement rare. Les autres résultats suivent un modèle ordinal
     (birdie ... quadruple+) décalé par le niveau du golfeur. Le par est le reste de la table. */
  let rels, probs, pi, xr;
  if (par === 5) { rels = [-2, -1, 0, 1, 2, 3, 4]; probs = [p[0], p[1], 0, p[2], p[3], p[4], p[5]]; pi = 2; xr = p[6] || 0; }
  else { rels = [-1, 0, 1, 2, 3, 4]; probs = [p[1], 0, p[2], p[3], p[4], p[5]]; pi = 1; xr = p[0]; }
  probs[pi] = Math.max(0.0001, 1 - probs.reduce((a, b) => a + b, 0));   // (les événements rares sont tirés avant, à part)
  let c = 0; const tau = [];
  for (let k = 0; k < probs.length - 1; k++) { c += probs[k]; tau.push(PhiInv(c)); }
  const G0 = -5, G1 = 6, ST = 0.02, N = Math.round((G1 - G0) / ST) + 1;
  const E = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const d = G0 + i * ST; let prev = 0, e = 0;
    for (let k = 0; k < tau.length; k++) { const cum = Phi(tau[k] - d); e += rels[k] * (cum - prev); prev = cum; }
    e += rels[rels.length - 1] * (1 - prev);
    E[i] = e;
  }
  return { tau, E, G0, ST, N, rels, xr };
}
function buildModel(tables) {
  return { 3: buildPar(tables[3], 3), 4: buildPar(tables[4], 4), 5: buildPar(tables[5], 5) };
}
/* Grille F(delta) pour un terrain donné (18 pars) */
function courseGrid(model, pars) {
  const n = { 3: 0, 4: 0, 5: 0 };
  pars.forEach(p => { n[p] = (n[p] || 0) + 1; });
  const m = model[4]; const F = new Float64Array(m.N);
  for (let i = 0; i < m.N; i++) F[i] = n[3] * model[3].E[i] + n[4] * model[4].E[i] + n[5] * model[5].E[i];
  return { F, G0: m.G0, ST: m.ST, N: m.N };
}
function solveDelta(grid, T) {
  const F = grid.F; if (T <= F[0]) return grid.G0; if (T >= F[grid.N - 1]) return grid.G0 + (grid.N - 1) * grid.ST;
  let lo = 0, hi = grid.N - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (F[mid] < T) lo = mid; else hi = mid; }
  const f = (T - F[lo]) / (F[hi] - F[lo] || 1);
  return grid.G0 + (lo + f) * grid.ST;
}
/* Événements rares, plus fréquents chez les meilleurs : proportionnels au niveau (Ligue 1 = 100 %). */
function extRates(g, model) {
  const lam = clamp((760 - g.o) / 170, -0.4, 3.4);   // 0 = niveau moyen de la Ligue 1, ~1 = Ligue 2, ~2 = L3, ~3 = L4
  const good = Math.max(0.05, 1 - CFG.goodStep / 100 * lam);
  return { ace: good * model[3].xr, e4: good * model[4].xr, alb: good * model[5].xr };
}
function simHole(model, par, delta, ext) {
  if (ext) {
    const pe = par === 3 ? ext.ace : par === 4 ? ext.e4 : ext.alb;
    if (Math.random() < pe) return par === 3 ? 1 : 2;   // trou d'un coup / aigle sur par 4 / albatros
  }
  const m = model[par], z = gauss() + delta;
  let k = 0; while (k < m.tau.length && z > m.tau[k]) k++;
  return par + m.rels[k];
}
function simRoundHoles(model, pars, delta, ext, idx, hv, g) {
  const tm = g ? talHoleMods(model, pars, delta, g) : null;
  if (!tm) return pars.map((p, i) => simHole(model, p, delta + (idx ? indexShift(idx[i]) : 0) + (hv ? hv[i] || 0 : 0), ext));
  return pars.map((p, i) => { let x = simHole(model, p, delta + (idx ? indexShift(idx[i]) : 0) + (hv ? hv[i] || 0 : 0) + (tm.sh ? tm.sh[p] : 0), ext); if (tm.scr && x >= p + 2 && Math.random() < tm.scr) x = p + 1; return x; });
}
/* Aléa de difficulté des trous pour un tournoi, partagé par tout le champ : une part fixe pour le tournoi (conditions du parcours)
   et une part par ronde (position des drapeaux). Centré sur zéro : le score moyen de la ronde ne bouge pas, seul l'ordre des trous varie.
   Avec 1 (défaut), le trou d'index 1 reste le plus difficile environ 1 fois sur 4 (au lieu de près de la moitié) et l'index 18 le plus facile 1 fois sur 5. */
function newHoleVar() {
  const V = CFG.holeVar == null ? 1 : CFG.holeVar, base = Array.from({ length: 18 }, () => gauss() * 0.18 * V);
  return [0, 1].map(() => { const a = base.map(x => x + gauss() * 0.1 * V), m = a.reduce((x, y) => x + y, 0) / 18; return a.map(x => Math.round((x - m) * 1000) / 1000); });
}

/* ---- Niveau (overall caché 0-1000) -> coups attendus vs par sur 18 trous ---- */
const MU = { A: 0.2, B: 21.0, GAM: 1.25 };   // B : écart entre le meilleur et le pire (23 jusqu'à la v153 ; resserré de 10 % en v154)
function mu(o) { const x = Math.max(-0.05, o / 1000); if (x > 1) return MU.A - (x - 1) * 20; return MU.A + MU.B * Math.pow(1 - x, MU.GAM); }
function dayFactor(g) {
  const x = clamp(g.o / 1000, 0, 1), dom = g.dom && g.sl > 0, v = (g.v || 1) * (dom ? 0.75 : 1);   // en pleine domination : plus régulier
  const sd = (1.3 + 1.15 * (1 - x)) * v * (1 - (CFG.eliteSd || 0) * clamp((x - 0.8) / 0.2, 0, 1)) * (CFG.rand == null ? 1 : CFG.rand);   // CFG.eliteSd (v190) : élite un peu plus régulière   // bruit normal par ronde, rehauss\u00e9 \u2014 m\u00eame un golfeur pr\u00e8s du sommet garde une vraie variance
  const r = Math.random(), hot = CFG.hotP / 100 * v, cold = CFG.coldP / 100 * v * (dom ? 0.4 : 1);
  if (r < hot) return -(2.4 + Math.abs(gauss()) * 1.3);            // ronde de feu
  if (r < hot + cold) return 2.9 + Math.abs(gauss()) * 1.6;        // ronde catastrophe \u2014 plus s\u00e9v\u00e8re, personne n'est \u00e0 l'abri
  return gauss() * sd;
}
function effOverall(g) { return g.o + g.f + (g.sl > 0 ? g.sm : 0); }
/* Course Rating et Slope Rating, comme au golf r\u00e9el (\u00e9chelle USGA / World Handicap System) :
   - Course Rating = score attendu d'un golfeur scratch (0 de handicap) sur ce terrain. Un \u00e9cart avec la
     r\u00e9f\u00e9rence (par - 1, un CR typique) d\u00e9cale la difficult\u00e9 de TOUT le champ, uniform\u00e9ment.
   - Slope Rating (55 \u00e0 155, 128 = neutre ici) mesure \u00e0 quel point le terrain punit un golfeur moyen
     ou faible PAR RAPPORT \u00e0 un golfeur scratch. Au-dessus de 128, l'\u00e9cart entre les golfeurs
     s'agrandit (terrain p\u00e9nalisant) ; en dessous, il se r\u00e9tr\u00e9cit (terrain plus cl\u00e9ment).
   128 est choisi comme neutre (plut\u00f4t que la moyenne nationale de 113) car c'est la moyenne observ\u00e9e
   sur un terrain de golf virtuel typique ; un CR de (par - 1) suit la m\u00eame logique. Les deux se r\u00e8glent
   par terrain, alors ce point neutre ne sert qu'\u00e0 fixer un terrain par d\u00e9faut sans effet suppl\u00e9mentaire.
   Un golfeur scratch (mu proche de MU.A) n'est presque pas affect\u00e9 par le slope, exactement comme au vrai golf. */
/* Effet de la distance du tee, en plus du course rating : 0 à CFG.distRef verges, ±1 coup par ronde par CFG.distStep verges (proportionnel). */
/* Terrain neutre (aucun effet) : r\u00e9glable dans Plus \u2192 R\u00e9glages du monde. */
const crNeutral = par => par - (72 - (CFG.crRef != null ? CFG.crRef : 70.3));
const slopeNeutral = () => CFG.slopeRef || 126;
function distDelta(d) { if (!(d > 0)) return 0; const ref = CFG.distRef || 6070, st = CFG.distStep || 600; return Math.round((d - ref) / st * 100) / 100; }
/* v236 : terrains aux ratings extrêmes adoucis. Jusqu'à ±crSoftT coups par ronde (et ±crSoftT×5 points de slope),
   l'effet est entier ; au-delà, seulement crSoftK % de l'excédent compte (aucun plafond : plus facile reste plus facile). */
const softKnee = (x, T, k) => Math.abs(x) <= T ? x : Math.sign(x) * (T + (Math.abs(x) - T) * k);
const crSoftT = () => CFG.crSoftT == null ? 2 : CFG.crSoftT, crSoftK = () => (CFG.crSoftK == null ? 40 : CFG.crSoftK) / 100;
function crEff(d) { return softKnee(d || 0, crSoftT(), crSoftK()); }
function crDeltaOf(c, pars) { return c && c.cr != null ? crEff(c.cr - crNeutral(parTotal(pars || c.pars))) : 0; }
function slopeEffFactor(sl) { const n = slopeNeutral(); return (n + softKnee((sl || n) - n, crSoftT() * 5, crSoftK())) / n; }
function courseAdjust(muVal, ctx) {
  return MU.A + (ctx.crDelta || 0) * (CFG.crMul == null ? 1 : CFG.crMul) + (muVal - MU.A) * (ctx.slopeFactor || 1);
}
/* Phénomène (« un Tiger ») : très rare (environ une fois aux 25 saisons, jamais deux en même temps). Talent réel au sommet,
   aucun nivellement des paliers d'élite et, dans la force de l'âge, des périodes de domination longues et fortes.
   Il garde la variance de tout le monde : mauvaises rondes, coupures ratées et creux restent possibles. */
const PHEN = { p: 0.0013, ptMin: 935, ptMax: 990, hcMul: 0, spellP: 12, spellMin: 3, spellMax: 8, ampMin: 150, ampMax: 210, cold: 15, ageMin: 23, ageMax: 35, reveal: 780 };
function phenMake(g) {   // traits d'un phénomène : sommet plus tard, déclin plus lent, régularité moyenne ou meilleure, pas d'éclosion tardive
  g.ph = 1; if (g.a > 20) g.a = 18 + Math.floor(Math.random() * 3);
  g.pk = 31 + Math.floor(Math.random() * 3); g.dr = 0.7; g.lb = 0; g.dv = Math.max(g.dv || 1, 1.15);
  g.v = g.v0 = clamp(g.v || 1, 0.8, 1.1);
  if (g.pt) g.p = clamp(g.pt - 40 - Math.random() * 260, (g.o || 0) + 50, 1000);   // les dépisteurs ne le voient pas forcément venir : de Est. Pro à Generational
}
/* Le phénomène reste caché (aucune étiquette, aucune mention) jusqu'à ce qu'il le mérite sur le terrain :
   3 victoires en Ligue 1 dans la même saison, ou 5 en carrière. Retourne true au moment où il est dévoilé. */
function phenWin(g, l) {
  if (!g || !g.ph || g.phR || l !== 0) return false;
  g.w1 = (g.w1 || 0) + 1;
  g.w1s = g.w1y === S.season ? (g.w1s || 0) + 1 : 1; g.w1y = S.season;
  if (g.w1s >= 3 || g.w1 >= 5) { g.phR = S.season; return true; }
  return false;
}
function phenOn() { return !(CFG.phenom === 0 || CFG.phenom === false); }
