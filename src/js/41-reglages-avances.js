/* ============ RÉGLAGES AVANCÉS (v200) ============
   Des constantes du moteur deviennent des réglages de la partie (S.cfg). applyAdv() les pousse dans le moteur à chaque setCfg.
   Bornes raisonnables pour qu'on ne puisse pas casser le jeu ; les valeurs par défaut sont celles calibrées par simulation. */
const ADV_DEF = { rcNcMax: 15, traits2: 1, gpCount: 1, relB30: 6, relBot: 10, majPts: 1.25, talents: 1, skills: 1, liveSim: 1, teeTimes: 1, clEvo: 1, majors: 1, finale: 1, varLg: 1, exWin: 1, exChamp: 1, exCar: 1, purseR: '10-15', pL2: 10, pL3: 2.5, pL4: 0.8, ptS: 1.15, scout: 1, famP: 2.5, eras: 0, gap: 1, rand: 1, eliteHc: 0, rcOn: 1, rcProd: 0.5, rcNoCard: 3.5, vlAvgD: 0.4, vlAvgUp: 0, streakMax: 8, streakAmp: 1.5, crMul: 1, crSoftT: 2, crSoftK: 40, windMul: 1, move: 10, forcedL4: 4, hofSev: 1, hofWait: 3, lowK: 0.7, rcReady: 25, rcLowCeil: 0.35, preset: 'real' };
Object.assign(DEFAULT_CFG, ADV_DEF);
const MU_B0 = 21;
let NOSAVE = false;
function applyAdv() {
  try {
    const c = CFG, pr = String(c.purseR || '10-15').split('-').map(Number);
    LEAGUE_PURSE_PCT[1] = c.pL2 / 100; LEAGUE_PURSE_PCT[2] = c.pL3 / 100; LEAGUE_PURSE_PCT[3] = c.pL4 / 100;
    ROOK.ptS = c.ptS; ROOK.scS = [1, 0.75, 0.6][c.scout] || 0.75; ROOK.eraAmp = c.eras ? 0.08 : 0;
    FAM.p = c.famP / 100; MU.B = MU_B0 * c.gap; MOVE = Math.round(c.move);
    FORCED_L4.n = c.forcedL4 >= 9 ? 99 : Math.round(c.forcedL4);
    HOF.wait = Math.round(c.hofWait); HOF.ctr = [120, 135, 150][c.hofSev] || 135;   // v207 : +10 avec les bonus Majeur et Finale (simulation 3 × 60 saisons : même rythme d'intronisation)
    PURSE_RANGE[0] = (pr[0] || 10) * 1e6; PURSE_RANGE[1] = (pr[1] || 15) * 1e6;
  } catch (e) { }
}
const PURSE_RANGE = [10e6, 15e6];
const ADV = [
  { id: 'purse', t: '💰 Bourses', items: [
    { k: 'purseR', type: 'seg', l: 'Bourse d’un tournoi de L1', opts: [['5-8', '5–8 M$'], ['10-15', '10–15 M$'], ['15-20', '15–20 M$'], ['20-30', '20–30 M$']], note: 'Les gains, records de carrière et bourses des autres ligues suivent. Prochains tournois.' },
    { k: 'pL2', type: 'range', l: 'Part de la Ligue 2', min: 2, max: 30, step: 0.5, f: v => afmtP(v) + ' de la bourse L1' },
    { k: 'pL3', type: 'range', l: 'Part de la Ligue 3', min: 0.5, max: 10, step: 0.5, f: v => afmtP(v) },
    { k: 'pL4', type: 'range', l: 'Part de la Ligue 4', min: 0.1, max: 5, step: 0.1, f: v => afmtP(v) }] },
  { id: 'tal', t: '⭐ Talent et recrues', items: [
    { k: 'ptS', type: 'range', l: 'Talent des recrues', tag: 'fut', min: 0.9, max: 1.4, step: 0.05, ends: ['Rare', 'Abondant'], f: v => '×' + afmt2(v), note: v => v <= 1.0 ? '≈ 2 golfeurs Generational en même temps sur le circuit.' : v < 1.2 ? '≈ 7 golfeurs Generational en même temps (de 1 à 11 selon les époques).' : '≈ 11 golfeurs Generational ou plus en même temps.' },
    { k: 'scout', type: 'seg', l: 'Prudence des dépisteurs', tag: 'fut', opts: [[0, 'Optimistes'], [1, 'Prudents'], [2, 'Très prudents']], note: v => ['≈ 2 recrues cotées Generational par cuvée.', '≈ 1 recrue cotée Generational aux 2 cuvées.', '≈ 1 recrue cotée Generational aux 4 cuvées.'][v] + ' Le vrai talent ne change pas.' },
    { k: 'famP', type: 'range', l: 'Familles de golfeurs', tag: 'fut', min: 0, max: 6, step: 0.5, ends: ['Jamais', 'Fréquentes'], f: v => +v === 0 ? 'Jamais' : '≈ ' + afmt1(v * 0.44) + ' par saison' },
    { k: 'phenom', type: 'tog', l: 'Phénomène (« un Tiger »)', note: 'Environ une fois aux 25 saisons, jamais deux à la fois.' },
    { k: 'eras', type: 'tog', l: 'Époques de talent', note: 'Accentue les décennies fortes et faibles (jusqu’à 18 Generational en même temps).' },
    { k: 'talents', type: 'tog', l: 'Talents cachés', note: 'Environ un golfeur sur trois a une force (par 3, vent, longs terrains…) et un sur dix un défaut : un petit avantage dans les bonnes conditions. Ils se révèlent et évoluent avec les saisons.' }] },
  { id: 'eng', t: '🏌️ Moteur des rondes', items: [
    { k: 'liveSim', type: 'tog', l: 'Pression en direct et élan', note: 'Les trous se jouent dans l’ordre : séries de birdies, dérapes, et le tempérament de chacun agit dans les derniers trous selon sa position. Les moyennes ne changent pas.' },
    { k: 'skills', type: 'tog', l: 'Cotes de jeu (Fairways, Fers, Putting)', note: 'Chaque golfeur a trois cotes de 1 à 5 jugées selon son niveau : un 5 vaut environ 0,7 à 1 coup par ronde de mieux qu’un 3. Les statistiques de jeu (fairways, verts, putts) sont notées pour tous les golfeurs.' },
    { k: 'teeTimes', type: 'tog', l: 'Départs décalés', note: 'Groupes de 3 ou 4 aux 10 minutes : chacun en est à son propre trou, les meneurs partent en dernier en ronde 2 et en Finale (ronde unique : au hasard) et la pression se mesure contre le tableau du moment. Les moyennes ne changent pas.' },
    { k: 'traits2', type: 'tog', l: 'Tempérament et fin de tournoi', note: 'Deux traits de personnalité : Imperturbable → Colérique (réaction aux gros trous et aux séries) et Chasseur-né → Meneur-né (ronde finale, près de la tête). La moitié des golfeurs sont neutres ; ils changent rarement, poussés par ce qu’ils vivent.' },
    { k: 'clEvo', type: 'tog', l: 'Tempéraments évolutifs', note: 'Gagner sous pression donne de l’assurance, s’effondrer en fait perdre : le tempérament peut changer d’un cran à la fin de la saison, surtout chez les jeunes.' },
    { k: 'gap', type: 'range', l: 'Écart entre les meilleurs et les plus faibles', tag: 'now', min: 0.7, max: 1.3, step: 0.05, ends: ['Champ serré', 'Gros écarts'], f: v => Math.round(v * 100) + ' %', note: 'Plus haut = les favoris gagnent plus souvent. Touche aussi l’accès à la L1 pour toi.' },
    { k: 'lowK', type: 'range', l: 'Écart en bas de l’échelle', tag: 'now', min: 0.5, max: 1, step: 0.05, ends: ['Resserré', 'Comme avant la v417'], f: v => Math.round(v * 100) + ' %', note: 'Sous le niveau Semi-Pro, chaque point de talent vaut moins de coups. Avec 70 %, la coupure de la L4 se rapproche de celle de la L3 (environ 3,5 coups d’écart au lieu de 5,5) ; les autres ligues ne bougent pas. 100 % = comme avant la v417.' },
    { k: 'rand', type: 'range', l: 'Hasard d’une ronde à l’autre', tag: 'now', min: 0.6, max: 1.4, step: 0.05, ends: ['Prévisible', 'Chaotique'], f: v => Math.round(v * 100) + ' %' },
    { k: 'eliteHc', type: 'seg', l: 'Nivellement de l’élite', opts: [[0, 'Aucun'], [0.5, 'Léger'], [1, 'Fort']], note: 'Un handicap pour les paliers Elite, Hall Of Famer et Generational. Fort = comme avant la v190.' },
    { k: 'hotP', type: 'range', l: 'Rondes de feu', min: 0, max: 12, step: 0.5, f: v => afmtP(v) + ' des rondes' },
    { k: 'coldP', type: 'range', l: 'Rondes catastrophes', min: 0, max: 12, step: 0.5, f: v => afmtP(v) + ' des rondes' },
    { k: 'streakMax', type: 'range', l: 'Durée maximale des séquences', tag: 'now', min: 2, max: 10, step: 1, ends: ['Courtes', 'Longues'], f: v => Math.round(v) + ' tournois', note: 'Passes chaudes et creux : de 2 tournois jusqu\u2019\u00e0 ce maximum, les longues \u00e9tant plus rares.' },
    { k: 'streakAmp', type: 'range', l: 'Force des séquences', tag: 'now', min: 0.5, max: 2.5, step: 0.1, ends: ['Discrètes', 'Marquées'], f: v => '\u00d7' + afmt1(v), note: '\u00d71,5 : un golfeur en feu fait environ 20 % de top 10 (7 % en temps normal) ; en creux, il rate environ 69 % des coupures.' }] },
  { id: 'crs', t: '⛳ Terrains et conditions', items: [
    { k: 'crMul', type: 'range', l: 'Effet du course rating', tag: 'now', min: 0, max: 1.5, step: 0.1, ends: ['Aucun effet', '×1,5'], f: v => afmt1(v) + ' coup / point' },
    { k: 'crSoftT', type: 'range', l: 'Terrains extr\u00eames : adoucir au-del\u00e0 de', tag: 'now', min: 0.5, max: 5, step: 0.5, ends: ['T\u00f4t', 'Tard'], f: v => '\u00b1' + afmt1(v) + ' coup' + (v >= 2 ? 's' : '') + ' par ronde', note: 'Un terrain dont le course rating (ou le slope) s\u2019\u00e9loigne beaucoup du neutre donnait des scores irr\u00e9alistes. Jusqu\u2019\u00e0 ce seuil, l\u2019effet est entier ; le slope suit (5 points de slope par coup).' },
    { k: 'crSoftK', type: 'range', l: 'Effet gard\u00e9 au-del\u00e0 du seuil', tag: 'now', min: 0, max: 100, step: 5, ends: ['Plafond', 'Aucun adoucissement'], f: v => Math.round(v) + ' %', note: '40 % : un terrain tr\u00e8s facile reste plus facile, mais sans exag\u00e9rer. 0 % = plafond strict, 100 % = comme avant.' },
    { k: 'distStep', type: 'range', l: 'Effet de la distance', min: 300, max: 1200, step: 50, ends: ['Fort', 'Faible'], f: v => '1 coup / ' + v + ' v' },
    { k: 'windMul', type: 'range', l: 'Force du vent', min: 0, max: 2, step: 0.1, ends: ['Sans effet', '×2'], f: v => 'Breezy +' + afmt1(1.5 * v) + ' · Gusty +' + afmt1(3.5 * v), note: 'Coups ajoutés par ronde aux golfeurs simulés. Toi, tu subis le vrai vent de GSPro. La fréquence du vent se règle plus bas, dans « Autres réglages du moteur ».' }] },
  { id: 'cal', t: '🏆 Calendrier', items: [
    { k: 'majors', type: 'tog', l: 'Majeurs en Ligue 1', note: 'Tournois 3, 5, 7 et 9 : points multipliés (réglage ci-dessous) et bourse ×1,5. Les noms se changent dans Options › Affichage.' },
    { k: 'majPts', type: 'range', l: 'Points des Majeurs', min: 1, max: 2, step: 0.25, ends: ['×1', '×2'], f: v => '×' + String(Math.round(v * 100) / 100).replace('.', ',') + ' les points', note: 'Avec ×2, les 4 Majeurs valent 57 % des points de la saison en L1 ; avec ×1,5, environ 45 % ; avec ×1,25 (par défaut), environ 40 % ; avec ×1, ce sont des tournois comme les autres. La bourse des Majeurs reste ×1,5 dans tous les cas.' },
    { k: 'finale', type: 'tog', l: 'Finale (11e tournoi)', note: 'Le top 30 de la L1 (et égalités) après 10 tournois. Aucune coupure, points ×2, bourse ×2 : elle peut décider du champion.' }] },
  { id: 'car', t: '📈 Carrières', items: [
    { k: 'youth', type: 'range', l: 'Progression des jeunes', min: 0, max: 2, step: 0.1, f: v => '×' + afmt1(v) },
    { k: 'decline', type: 'range', l: 'Déclin des vétérans', min: 0, max: 2, step: 0.1, f: v => '×' + afmt1(v) },
    { k: 'gpCount', type: 'tog', l: 'Le top 20 compte les promus en cours de saison', note: 'En fin de saison, les places de promotion sont les 20 premiers du classement final. Un golfeur déjà promu en cours de saison occupe sa place : s’il y en a 11 dans le top 20, il n’en reste que 9 à monter.' },
    { k: 'relB30', type: 'range', l: 'Relégation en cours de saison', min: 4, max: 8, step: 1, ends: ['4', '8'], f: v => v + ' fois dans les 30 derniers (ou 3 dans les 10 derniers)', note: 'Avec 6, les relégations et les promotions en cours de saison s’équilibrent ; avec 5, on descend plus vite qu’on ne monte.' },
    { k: 'varLg', type: 'tog', l: 'Taille des ligues selon le niveau', note: 'L1 à L3 entre 130 et 170 golfeurs : le top 20 de la ligue du dessous monte, les derniers descendent, et on complète avec les suivants s’il manque du monde. Fermé : 150 golfeurs par ligue.' },
    { k: 'rcOn', type: 'tog', l: 'Classe de recrues', note: 'Les recrues jouent une saison entre elles (10 tournois, sans coupure, points ni bourse). Leur index d\u00e9cide ensuite de leur ligue de d\u00e9part : la meilleure ligue dont la moyenne est moins bonne que leur index. Ferm\u00e9 : toutes les recrues commencent en Ligue 4.' },
    { k: 'rcNcMax', type: 'range', l: 'Maximum sans carte', min: 0, max: 30, step: 1, ends: ['0 %', '30 %'], f: v => v + ' % de la classe', note: 'Si plus de recrues dépassent le seuil, les meilleures d’entre elles obtiennent une carte « de justesse » en Ligue 4.' },
    { k: 'rcNoCard', type: 'range', l: 'Pas de carte au-del\u00e0 de la moyenne L4 +', min: 2, max: 10, step: 0.5, ends: ['S\u00e9v\u00e8re', 'Indulgent'], f: v => '+' + afmt1(v), note: 'Avec +3,5, environ 13 % des recrues n\u2019obtiennent pas leur carte (avec l\u2019\u00e9cart en bas de l\u2019\u00e9chelle \u00e0 70 %).' },
    { k: 'rcProd', type: 'range', l: 'Recrues d\u00e9j\u00e0 pr\u00eates', min: 0, max: 3, step: 0.1, ends: ['Jamais', 'Fr\u00e9quentes'], f: v => afmt1(v) + ' %', note: 'Chance qu\u2019une recrue arrive avec un niveau Pro \u00e0 Elite. Son potentiel n\u2019est pas garanti : souvent bon, parfois juste au-dessus de son niveau.' },
    { k: 'rcReady', type: 'range', l: 'Recrues prêtes à jouer', tag: 'fut', min: 0, max: 50, step: 5, ends: ['Jamais', 'Souvent'], f: v => Math.round(v) + ' % de la classe', note: 'Une recrue prête à jouer arrive presque à son vrai plafond : elle peut commencer en L3, en L2, parfois en L1, mais a peu de marge. Un quart des recrues sont des talents bruts, loin de leur plafond. Le vrai talent ne change pas.' },
    { k: 'rcLowCeil', type: 'range', l: 'Plafonds des recrues faibles', tag: 'fut', min: 0.2, max: 1, step: 0.05, ends: ['Resserrés', 'Comme avant la v419'], f: v => Math.round(v * 100) + ' %', note: 'Un vrai plafond sous 450 (Semi-Pro) est rapproché de 450. Avec 35 %, le plus petit plafond devient environ 290 (Average) : moins de golfeurs très faibles, et la coupure de la L4 se rapproche de celle de la L3 (environ 3,6 coups au lieu de 4,7) sans toucher aux autres ligues. 100 % = comme avant la v419.' },
    { k: 'relBot', type: 'range', l: 'Relégués en fin de saison', tag: 'now', min: 5, max: 20, step: 1, ends: ['5', '20'], f: v => v + ' derniers par ligue', note: 'Les arrivés en cours de saison et les exemptés 🛡 sont protégés : c’est le suivant au-dessus qui descend. Les ligues restent d’au moins 130 golfeurs.' },
    { k: 'move', type: 'range', l: 'Promus et relégués par ligue', tag: 'fut', min: 5, max: 20, step: 1, f: v => v + ' golfeurs', note: 'Ligues de taille fixe seulement. S’applique à la prochaine fin de saison.' },
    { k: 'exWin', type: 'tog', l: '🛡 Exemption après une victoire', note: 'Jamais relégué pendant la saison de la victoire et les 2 suivantes, dans la ligue de la victoire (ou plus bas). La montée reste possible.' },
    { k: 'exChamp', type: 'tog', l: '🛡 Champion protégé', note: 'Le champion d’une ligue ne peut pas être relégué la saison suivante, même dans la ligue du dessus.' },
    { k: 'exCar', type: 'tog', l: '🛡 Exemption unique de carrière', note: 'Une seule fois par carrière, un golfeur avec 10 victoires en L1 évite la relégation de la L1 et reste jusqu’à la fin de la saison suivante.' },
    { k: 'forcedL4', type: 'range', l: 'Retraite forcée après X saisons en L4', min: 2, max: 9, step: 1, ends: ['2', 'Jamais'], f: v => +v >= 9 ? 'Jamais' : v + ' saisons' }] },
  { id: 'hof', t: '🏛️ Temple de la renommée', items: [
    { k: 'hofSev', type: 'seg', l: 'Sévérité du vote', opts: [[0, 'Indulgente'], [1, 'Normale'], [2, 'Sévère']], note: v => ['≈ 1 intronisé par saison ou presque.', '≈ 1 intronisé aux 2 à 3 saisons.', '≈ 1 intronisé aux 5 saisons.'][v] },
    { k: 'hofWait', type: 'range', l: 'Délai après la retraite', min: 0, max: 5, step: 1, ends: ['Immédiat', '5 saisons'], f: v => +v === 0 ? 'Immédiat' : v + ' saison' + (v > 1 ? 's' : '') }] }
];
const afmt1 = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
const afmt2 = v => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
const afmtP = v => afmt1(v) + ' %';
const ADV_PRESETS = {
  real: { t: '🎯 Réaliste', d: 'Les valeurs calibrées. Le n°1 finit souvent top 10, mais gagne rarement.', v: {} },
  dyn: { t: '👑 Dynastie', d: 'Les meilleurs dominent : plus d’écart, moins de hasard. La L1 devient plus dure à atteindre.', v: { gap: 1.3, rand: 0.7, hotP: 2, coldP: 3 } },
  arc: { t: '🎲 Arcade', d: 'Plus de talent, plus de hasard, bourses plus grosses.', v: { ptS: 1.3, rand: 1.25, hotP: 7, coldP: 7, purseR: '15-20', windMul: 1.2, famP: 4 } },
  cus: { t: '🛠️ Personnalisé', d: 'Tes propres réglages (s’active dès que tu touches un curseur).', v: null }
};
const ADV_KEYS = ADV.reduce((a, s) => a.concat(s.items.map(i => i.k)), []);
const ADV_BASE = k => k in ADV_DEF ? ADV_DEF[k] : DEFAULT_CFG[k];
const ADV_FX = { real: ['85 %', '24 %', '≈ 4 à 7'], dyn: ['85 %', '33 %', '≈ 5'], arc: ['53 %', '15 %', '≈ 10'] };   // v200 : 2 parties de 40 saisons par préréglage (saisons 15 à 40)
let ADVT = null;   // test en cours / résultat du dernier test
function advItemHTML(it) {
  const v = S.cfg[it.k] != null ? S.cfg[it.k] : ADV_BASE(it.k), d = ADV_BASE(it.k), chg = String(v) !== String(d);
  const tag = it.tag ? '<span class="atag ' + it.tag + '">' + (it.tag === 'fut' ? 'Prochaines recrues' : 'Immédiat') + '</span>' : '';
  const note = typeof it.note === 'function' ? it.note(v) : it.note;
  if (it.type === 'tog') { const on = !(v === 0 || v === false); return '<div class="aset atog"><div><b>' + it.l + '</b>' + (note ? '<div class="anote">' + note + '</div>' : '') + '</div><button class="asw' + (on ? ' on' : '') + '" data-a="advtog" data-k="' + it.k + '" aria-pressed="' + on + '" aria-label="' + esc(it.l) + '"><i></i></button></div>'; }
  if (it.type === 'seg') { const lbl = (it.opts.find(o => String(o[0]) === String(v)) || it.opts[0])[1];
    return '<div class="aset"><div class="asl"><label>' + it.l + tag + '</label><output' + (chg ? ' class="chg"' : '') + '>' + lbl + '</output></div><div class="aseg">' + it.opts.map(o => '<button data-a="advseg" data-k="' + it.k + '" data-v="' + o[0] + '"' + (String(o[0]) === String(v) ? ' class="on"' : '') + '>' + o[1] + '</button>').join('') + '</div>' + (note ? '<div class="anote">' + note + '</div>' : '') + '</div>'; }
  const pos = (d - it.min) / (it.max - it.min);
  return '<div class="aset"><div class="asl"><label for="adv-' + it.k + '">' + it.l + tag + '</label><output id="ao-' + it.k + '"' + (chg ? ' class="chg"' : '') + '>' + it.f(v) + '</output></div>' +
    '<div class="arng"><input type="range" id="adv-' + it.k + '" data-c="adv" data-k="' + it.k + '" min="' + it.min + '" max="' + it.max + '" step="' + it.step + '" value="' + v + '"><i class="adef" style="left:calc(' + (pos * 100) + '% + ' + (8 - pos * 16) + 'px)" title="Valeur par défaut"></i></div>' +
    (it.ends ? '<div class="aends"><span>' + it.ends[0] + '</span><span>' + it.ends[1] + '</span></div>' : '') + (note ? '<div class="anote" id="an-' + it.k + '">' + note + '</div>' : '') + '</div>';
}
function advHTML(world) {
  const pr = S.cfg.preset || 'real';
  let h = '<div class="awarn"><span>⚠️</span><div><b>Ces réglages changent l’équilibre du jeu.</b> Les valeurs par défaut ont été calibrées par simulation (40 saisons). Le trait blanc sur chaque curseur montre la valeur par défaut. Les réglages sont propres à cette partie' + (S.duo ? ' (la Partie Duo a ses propres réglages)' : '') + '.</div></div>';
  h += '<div class="apre">' + Object.keys(ADV_PRESETS).map(k => '<button class="apr' + (k === pr ? ' on' : '') + '" data-a="advpre" data-v="' + k + '"><b>' + ADV_PRESETS[k].t + '</b><span>' + ADV_PRESETS[k].d + '</span></button>').join('') + '</div>';
  h += '<div class="agrid">' + ADV.map(s => dPanel(s.t, s.items.map(advItemHTML).join(''), '<a href="#" data-a="advrst" data-v="' + s.id + '">Rétablir</a>', 'apn')).join('') + '</div>';
  // bas de page : effet estimé et test
  let fx;
  if (ADVT && ADVT.busy) fx = '<div><span>Test en cours</span><b>Saison ' + ADVT.p + ' sur ' + ADVT.n + '…</b></div>';
  else if (ADVT && ADVT.res && ADVT.key === advKey()) fx = '<div><span>Ton test (' + ADVT.n + ' saisons simulées)</span><b>Le n°1 finit top 10 : ' + ADVT.res[0] + '</b></div><div><span>Top 5 gagne</span><b>' + ADVT.res[1] + ' des tournois</b></div><div><span>Generational en même temps</span><b>' + ADVT.res[2] + '</b></div>';
  else if (ADV_FX[pr] && ADV_FX[pr][0]) fx = '<div><span>Effet estimé (simulation de 40 saisons)</span><b>Le n°1 finit top 10 : ' + ADV_FX[pr][0] + '</b></div><div><span>Top 5 gagne</span><b>' + ADV_FX[pr][1] + ' des tournois</b></div><div><span>Generational en même temps</span><b>' + ADV_FX[pr][2] + '</b></div>';
  else fx = '<div><span>Effet estimé</span><b>Lance un test pour voir l’effet de tes réglages</b></div>';
  h += '<div class="afx">' + fx + '<div class="abtns"><button class="btn sec sm" data-a="advtest"' + (ADVT && ADVT.busy ? ' disabled' : '') + '>Tester (simuler 10 saisons)</button><button class="btn sec sm" data-a="advrst" data-v="all">Tout rétablir</button></div></div>';
  h += '<p class="small mute" style="margin:8px 2px 0">Les changements sont enregistrés tout de suite. Le test se fait sur un monde à part : ta partie n’est pas touchée.</p>';
  h += '<h2>Autres réglages du moteur</h2>' + world;
  return h;
}
const advKey = () => JSON.stringify(ADV_KEYS.map(k => S.cfg[k]));
function advSet(k, v, keepPreset) { if (settingsLocked()) { toast('R\u00e9glages verrouill\u00e9s'); return; } S.cfg[k] = v; if (!keepPreset) S.cfg.preset = 'cus'; setCfg(S.cfg); persist(); }
function advPreset(p, quiet) {
  if (!quiet && settingsLocked()) { toast('R\u00e9glages verrouill\u00e9s'); return; }
  ADV_KEYS.forEach(k => { S.cfg[k] = ADV_BASE(k); });
  const v = ADV_PRESETS[p] && ADV_PRESETS[p].v; if (v) Object.assign(S.cfg, v);
  S.cfg.preset = p; setCfg(S.cfg); if (quiet) return; persist(); render();
}
function advReset(id) {
  const sec = ADV.find(s => s.id === id);
  (sec ? sec.items.map(i => i.k) : ADV_KEYS).forEach(k => { S.cfg[k] = ADV_BASE(k); });
  S.cfg.preset = id === 'all' ? 'real' : (ADV_KEYS.every(k => String(S.cfg[k]) === String(ADV_BASE(k))) ? 'real' : 'cus');
  setCfg(S.cfg); persist(); render(); toast(id === 'all' ? 'Réglages avancés rétablis' : 'Section rétablie');
}
/* Test : un monde à part, simulé saison par saison (sans toucher à la partie ni à la sauvegarde). */
async function advTest() {
  if (ADVT && ADVT.busy) return;
  const N = 10, keep = S, keepView = VIEW, cfg = clone(S.cfg), key = advKey();
  persist(); await new Promise(r => setTimeout(r, 400));
  ADVT = { busy: 1, p: 0, n: N }; render();
  const ov = document.createElement('div'); ov.className = 'atest'; ov.innerHTML = '<div><b>Test en cours</b><span id="advprog">Préparation du monde…</span><p class="small mute" style="margin:8px 0 0">Un monde à part est simulé : ta partie n’est pas touchée.</p></div>'; document.body.appendChild(ov);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const R = { top10: 0, n: 0, t5: 0, nt: 0, gen: [] };
  NOSAVE = true;
  try {
    newGame('Test', 0, 'manual', 2026, N);
    S.cfg = clone(cfg); setCfg(S.cfg); MODEL = buildModel(S.settings.tables);
    for (let s = 1; s <= N && S.presim; s++) {
      if (S.t === 0) randomizeSeasonCourses();
      while (S.t < N_TOURN) presimTournament();
      if (s >= 3) {
        const ra = rankAll(0), rk = {}; ra.forEach((r, i) => { rk[r.id] = i + 1; });
        const byo = ra.map(r => r.id).filter(id => S.G[id]).sort((a, b) => S.G[b].o - S.G[a].o);
        if (byo[0] && rk[byo[0]] <= 10) R.top10++; R.n++;
        const H = S.hist[S.season - 1], top5 = byo.slice(0, 5); H.t.forEach(t => { if (t && t.lg[0]) { R.nt++; if (top5.includes(t.lg[0].rows[0][0])) R.t5++; } });
        R.gen.push(Object.values(S.G).filter(g => g.o >= 950).length);
      }
      doSeasonEnd();
      ADVT.p = s; const el = document.getElementById('advprog'); if (el) el.textContent = 'Saison ' + s + ' sur ' + N + '…';
      await sleep(30);
    }
  } catch (e) { console.error(e); }
  S = keep; VIEW = keepView; NOSAVE = false; setCfg(S.cfg); MODEL = buildModel(S.settings.tables); WR_CACHE = null; ALM_X = null; HOF_MEMO = null;
  const pct = (a, b) => b ? Math.round(100 * a / b) + ' %' : '–';
  ADVT = { busy: 0, n: N, key, res: [pct(R.top10, R.n), pct(R.t5, R.nt), R.gen.length ? '≈ ' + Math.round(R.gen.reduce((a, b) => a + b, 0) / R.gen.length) : '–'] };
  ov.remove(); render(); toast('Test terminé');
}

