/* ============ TALENTS CACHÉS (v214) ============
   Environ un golfeur sur trois a une force et un sur dix un défaut : par 3, par 4, par 5 (décalage par type de trou),
   vent, longs ou courts terrains, sauveur (limite les doubles bogeys), partant rapide ou finisseur. Niveau 1 à 3 (bronze,
   argent, or) : environ −0,15 / −0,30 / −0,45 coup par ronde dans les bonnes conditions. Un talent est caché au début
   et se révèle après 3, 2 ou 1 saison selon son niveau (ou dès qu'il progresse). Il progresse surtout avant 30 ans et
   s'estompe après 34 ; un défaut se corrige lentement. Calibré par simulation (40 saisons, ligues inchangées).
   g.tr = [{ k, lv, n (1 = défaut), sn (saisons écoulées), rv (saison de la découverte, −1 = connu d'avance, null = caché), h [[saison, niveau]] }] */
const TAL_K = ['p3', 'p4', 'p5', 'wind', 'long', 'prec', 'scr', 'fast', 'close'];
const TAL_W = [15, 15, 15, 15, 10, 10, 10, 5, 5];
const TAL_RND = [0, 0.15, 0.30, 0.45];   // coups par ronde (types de trou, sauveur)
const TAL_REV = [0, 3, 2, 1];             // saisons avant la révélation, selon le niveau
const TAL_ICO = { p3: '⛳', p4: '🎯', p5: '💥', wind: '🌬️', long: '🏌️', prec: '📐', scr: '🛟', fast: '🚀', close: '🏁' };
function talOn() { return !(CFG.talents === 0 || CFG.talents === false); }
function talPick(ex) { const ks = TAL_K.filter(k => !ex.includes(k)), ws = ks.map(k => TAL_W[TAL_K.indexOf(k)]); let r = Math.random() * ws.reduce((a, b) => a + b, 0); for (let i = 0; i < ks.length; i++) { r -= ws[i]; if (r < 0) return ks[i]; } return ks[ks.length - 1]; }
function talNew(k, lv, neg, seasons) { const sn = seasons > 0 ? Math.floor(Math.random() * (seasons + 1)) : 0; return { k, lv, n: neg ? 1 : 0, sn, rv: sn >= TAL_REV[lv] ? -1 : null, h: [] }; }
function talRoll(g, seasons) {   // seasons : saisons déjà jouées (les vétérans d'un nouveau monde ont souvent un talent déjà connu)
  g.tr = []; if (!g || g.id === 0) return;
  const r = Math.random(), lv = r < 0.65 ? 1 : r < 0.93 ? 2 : 3;
  if (Math.random() < 0.30) g.tr.push(talNew(talPick([]), lv, 0, seasons));
  if (Math.random() < 0.12) g.tr.push(talNew(talPick(g.tr.map(t => t.k).concat('scr')), Math.random() < 0.7 ? 1 : 2, 1, seasons));
}
function talMigrate() { if (!S || S.talv === 1) return; Object.values(S.G).forEach(g => { if (g && g.id !== 0 && !g.tr) talRoll(g, g.cs || 0); }); S.talv = 1; }
