/* =====================================================================
   STRUCTURE DU FICHIER (tout est dans ce seul fichier)
   1. Moteur de simulation : réglages DEFAULT_CFG en tête, tables de probabilités,
      niveau -> score attendu (mu), forme, progression par âge, points, coupure.
   2. État, sauvegarde et logique de jeu : tournois, records, fin de saison.
   3. Vues (écrans) : une fonction vXxx() par écran.
   4. Événements et démarrage.
   Les réglages courants se changent aussi dans l'app : onglet Plus.
   ===================================================================== */
/* =====================================================================
   CARRIÈRE DE GOLF — MOTEUR DE SIMULATION (sans DOM)
   Tout ce qui se règle est dans DEFAULT_CFG (et modifiable dans l'app :
   onglet Plus > Réglages du monde). Échelle des scores : coups vs par.
   ===================================================================== */
const GAME_V = 'v448';   // v432 : numéro de version affiché en bas à gauche (à changer à chaque nouvelle version)
const LOGO_BIG = document.querySelector('#splash img').src, LOGO_SM = '{{asset:logo-sm.webp}}';
/* Écran d'accueil : le logo pendant 2 secondes à l'ouverture (un toucher le passe) */
(function () {
  const sp = document.getElementById('splash'); if (!sp) return;
  const done = () => { sp.classList.add('out'); setTimeout(() => sp.remove(), 500); };
  requestAnimationFrame(() => requestAnimationFrame(() => sp.classList.add('in')));
  const t = setTimeout(done, 2000); sp.addEventListener('click', () => { clearTimeout(t); done(); });
})();
const DEFAULT_CFG = {
  majPts: 2,     // v258 : multiplicateur de points des Majeurs (L1) ; les nouvelles parties partent à ×1,5
  form: 1,        // intensité de la forme (0 = aucune, 1 = normal, 2 = très marquée)
  streakP: 4,     // % de chances par tournoi qu'un golfeur entre dans une séquence (passe chaude ou creux)
  coldShare: 55,  // % de ces séquences qui sont des creux (mauvaises séquences)
  streakMax: 8,   // durée maximale d'une séquence, en tournois (minimum 2) ; v244 : 8 (les longues sont plus rares)
  streakAmp: 1.5, // v244 : force des séquences (×1,5 : un golfeur en feu fait environ 20 % de top 10 au lieu de 7 %)
  spread: 0.22,   // écart de régularité entre golfeurs (0 = tous pareils, 0.5 = très différents)
  hotP: 5,        // v421 : 5 (avant 4) ; % de rondes de feu (par ronde, ajusté par la régularité du golfeur)
  coldP: 6,       // v421 : 6 (avant 5) ; % de rondes catastrophes
  youth: 1,       // progression des jeunes (chances de percée et rythme, 1 = normal)
  decline: 1,     // déclin des vétérans (1 = normal)
  showForm: 1,    // afficher les indicateurs de forme et de régularité
  // Événements rares (trou d'un coup, aigle sur un par 4, albatros) : leurs taux de la Ligue 1 se règlent
  // dans les probabilités par trou ; ils diminuent ensuite de ligue en ligue.
  goodStep: 25,   // baisse en % par ligue de ces événements (100 %, 75 %, 50 %, 25 %)
  idxK: 0.035,    // effet de l'index de handicap sur la difficulté d'un trou (0 = aucun effet)
  holeVar: 1,     // aléa de difficulté par trou à chaque tournoi (position du drapeau, conditions) : l'index reste un repère, pas un ordre fixe (0 = aucun)
  showIdx: 1,     // afficher le Handicap Index à côté du nom dans les classements
  terrainVar: 1,  // variabilité des terrains aléatoires : rating du générateur, aléa du terrain et météo (1 = recommandé, 0 = aucune)
  crRef: 70.3,    // course rating neutre pour un par 72 (suit le par : un par 71 est neutre \u00e0 69,3) ; v219 : moyenne des terrains r\u00e9ellement jou\u00e9s (30 saisons simul\u00e9es avec la pige par d\u00e9faut, ramen\u00e9e \u00e0 un par 72)
  slopeRef: 126,  // slope neutre
  distRef: 6070,  // distance neutre du terrain (verges) : aucun effet
  windW: [10, 39, 32, 19],   // chances (en %) du vent tiré au hasard : aucun, calme, léger, fort
  distStep: 600   // chaque tranche de distStep verges au-dessus (ou au-dessous) ajoute (ou enlève) un coup par ronde à un golfeur moyen (le tiers de l'effet de la v151)
};
let CFG = Object.assign({}, DEFAULT_CFG);
function setCfg(c) { CFG = Object.assign({}, DEFAULT_CFG, c || {}); if (typeof applyAdv === 'function') applyAdv(); }
