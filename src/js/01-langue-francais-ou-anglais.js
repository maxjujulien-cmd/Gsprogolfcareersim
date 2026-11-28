/* ============ LANGUE (v210 · talents v214) : français (source) ou anglais ============
   Le jeu s'écrit en français ; en anglais, une couche de traduction à l'affichage remplace les textes :
   dictionnaire exact (I18N_EN), puis motifs pour les phrases avec des valeurs (I18N_RX, le premier qui correspond),
   puis motifs généraux (I18N_GEN : ordinaux, pourcentages, unités). Un observateur traduit tout ce qui apparaît
   dans la page (écrans, notifications, cartes dépliées…). Les sauvegardes ne changent pas d'une langue à l'autre.
   Un élément marqué class="notr" n'est jamais traduit (noms tapés par le joueur, sélecteur de langue). */
let LANG = 'en';   // v431 : le jeu est toujours en anglais (choix de Max) ; le français reste la langue du code source, traduite à l'affichage
const I18N_EN = {};
const I18N_RX = [];
I18N_RX.push([/^(.+) · trou (\d+) du dernier groupe$/, '$1 · final group on hole $2']);
Object.assign(I18N_EN, { 'Tu fermes la marche : aucun groupe ne part apr\u00e8s toi.': 'You close it out: no group tees off after you.' });
I18N_RX.push([/^2 groupes aux (\d+) minutes, du trou 1$/, '2 groups every $1 minutes, off hole 1']);
Object.assign(I18N_EN, { 'Revanche :': 'Rematch:', 'Revanche de la prolongation :': 'Playoff rematch:', 'a battu': 'beat', 'Course au titre :': 'Title race:', 'Le phénomène :': 'The phenom:', 'Le phénomène (talent générationnel) :': 'The phenom (generational talent):', 'Dernière chance avant la retraite forcée :': 'Last chance before forced retirement:' });
I18N_RX.push([/^À domicile \((.+)\) :$/, 'At home ($1):'], [/^Série en jeu : (\d+) top 10 de suite :$/, 'Streak on the line: $1 straight top 10s:'], [/^Série en jeu : (\d+) coupures de suite :$/, 'Streak on the line: $1 straight cuts made:'], [/^Disette : (\d+) coupures ratées de suite :$/, 'Drought: $1 straight missed cuts:'],
  [/^Dernière chance, en zone de relégation à (\d+) tournois? de la fin :$/, (m, n) => 'Last chance, in the relegation zone with ' + n + ' event' + (n === '1' ? '' : 's') + ' left:'], [/^(\d+) pts d’écart$/, '$1 pts apart']);
I18N_RX.push([/^Dernier vainqueur ici \((\d+)\) :$/, 'Last winner here ($1):']);
I18N_RX.push([/^(.+), meneur du classement en (.+), termine hors de la ligne de paye\.$/, '$1, the $2 standings leader, finishes outside the pay line.']);
I18N_RX.push([/^ligne top (\d+)$/, 'top-$1 pay line']);
Object.assign(I18N_EN, { 'Palmarès': 'Career record', 'La vitrine': 'Trophy case', 'Records personnels': 'Personal records', 'Voir le palmarès ›': 'See career record ›', 'Voir le palmarès': 'See career record', 'Retour à la fiche': 'Back to profile',
  'coupures réussies': 'cuts made', 'Meilleure ronde': 'Best round', 'Meilleur total (36 trous)': 'Best total (36 holes)', 'Plus grande marge de victoire': 'Biggest winning margin', 'Plus belle remontée gagnante': 'Best winning comeback',
  'Plus longue série de coupures': 'Longest cut streak', 'tournois de suite': 'tournaments in a row', 'après la ronde 1': 'after round 1', 'Prolongations': 'Playoffs', 'Deuxième place': 'Runner-up', 'fois': 'times', 'Aucune victoire de tournoi pour l’instant.': 'No tournament wins yet.', 'Pas encore de tournoi joué.': 'No tournaments played yet.', 'record du circuit': 'tour record', '🏆 Finale': '🏆 Final' });
I18N_RX.push([/^(\d+) coups? de retard$/, (m, n) => n + (n === '1' ? ' shot' : ' shots') + ' behind'], [/^(\d+) coups?$/, (m, n) => n + (n === '1' ? ' shot' : ' shots')], [/^gagnées? sur$/, 'won of'], [/^record L(\d)$/, 'L$1 record'], [/^(\d+) tournois?$/, (m, n) => n + (n === '1' ? ' tournament' : ' tournaments')]);
I18N_RX.push([/^(\d+) non localisés?, laissés? en place$/, (m, n) => n + ' not located, left in place'], [/^Tournois (\d+) et (\d+) échangés$/, 'Tournaments $1 and $2 swapped'], [/^Tournoi (\d+) et Finale échangés$/, 'Tournament $1 and Final swapped']);
Object.assign(I18N_EN, { 'Position de la Finale': 'Position of the Final' });
Object.assign(I18N_EN, { 'La route': 'The route', 'parcourus': 'traveled', 'sur': 'of', 'Voir le voyage': 'See the journey', 'reste au même endroit': 'stays in the same place' });
I18N_RX.push([/^environ (\d+) h(?: (\d+))? de (vol|route)$/, (m, h, mm, k) => 'about ' + h + ' h' + (mm ? ' ' + mm : '') + (k === 'vol' ? ' flight' : ' drive')], [/^environ (\d+) min de route$/, '$1 min drive'], [/^décalage ([+−]\d+ h(?: \d+)?)$/, 'time difference $1'], [/^nouveau pays : (\S+) de la saison$/, 'new country: $1 of the season'], [/^(\d+) terrains? à localiser$/, (m, n) => n + (n === '1' ? ' course' : ' courses') + ' to locate']);
Object.assign(I18N_EN, { 'Watchlist du tournoi': 'Tournament Watchlist', '★ Watchlist du tournoi': '★ Tournament Watchlist', '3 derniers': 'Last 3', 'Retirer de la watchlist du tournoi': 'Remove from tournament watchlist', 'Ajouter à la watchlist du tournoi': 'Add to tournament watchlist', 'Dans ta watchlist du tournoi': 'In your tournament watchlist',
  'Touche ☆ à côté d’un nom (départs, classement, groupes) pour suivre un golfeur pendant ce tournoi.': 'Tap ☆ next to a name (tee times, leaderboard, groups) to follow a golfer during this tournament.',
  'Touche ☆ à côté d’un nom pour l’ajouter à ta watchlist du tournoi.': 'Tap ☆ next to a name to add them to your tournament watchlist.' });
I18N_RX.push([/^(\d+) golfeurs?$/, (m, n) => n + (n === '1' ? ' golfer' : ' golfers')]);
const I18N_GEN = [];
let I18N_UPX = null;   // v431 : index des traductions en majuscules (« CLASSE DE RECRUES » → « ROOKIE CLASS »)
function I18N_UP(core) {
  if (!I18N_UPX) { I18N_UPX = new Map(); Object.keys(I18N_EN).forEach(k => { const u = k.toUpperCase(); if (!I18N_UPX.has(u)) I18N_UPX.set(u, String(I18N_EN[k]).toUpperCase()); }); }
  const d = I18N_UPX.get(core); if (d) return d;
  if (core.indexOf(' · ') > 0) { const ps = core.split(' · '), t = ps.map(x => I18N_UPX.get(x.trim()) || x); if (t.some((x, i) => x !== ps[i])) return t.join(' · '); }
  const m = core.match(/^(.*?)\s*·$/); if (m) { const t = I18N_UP(m[1]); if (t) return t + ' ·'; }
  return null;
}
const I18N_MEMO = new Map();
const I18N_SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);
function trText(s) {
  if (LANG !== 'en' || !s || (!/[A-Za-zÀ-ÿ%]/.test(s) && !/\d,\d\d?(?!\d)/.test(s))) return s;
  const m = I18N_MEMO.get(s); if (m !== undefined) return m;
  if (s.indexOf('\n') >= 0 && s.trim().indexOf('\n') >= 0) { const r = s.split('\n').map(trText).join('\n'); I18N_MEMO.set(s, r); return r; }   // infobulles sur plusieurs lignes
  const lead = s.match(/^\s*/)[0], rest = s.slice(lead.length), trail = rest.match(/\s*$/)[0], core = rest.slice(0, rest.length - trail.length).replace(/\u00a0/g, ' ');
  let out = I18N_EN[core]; if (out === undefined && core.indexOf(' %') >= 0) out = I18N_EN[core.replace(/ %/g, '%')];
  if (out === undefined) { let hit = false; out = core; for (const [rx, to] of I18N_RX) { rx.lastIndex = 0; if (rx.test(out)) { rx.lastIndex = 0; const r = out.replace(rx, to); if (r !== out) { out = r; hit = true; break; } } }
    if (!hit && core.indexOf(' · ') > 0) out = core.split(' · ').map(x => trText(x)).join(' · ');   // phrase composée : chaque morceau à part
    else if (!hit && /^· |\s·$/.test(core)) { const m2 = core.match(/^(·\s*)?(.*?)(\s*·)?$/), t2 = trText(m2[2]); if (t2 !== m2[2]) out = (m2[1] || '') + t2 + (m2[3] || ''); }   // v347 : morceau collé à un séparateur « · »
    else if (!hit && /^« .+ »$/.test(core)) { const q = core.slice(2, -2); const t2 = q.split(/(?<=[.!?]) +/).map(x => trText(x)).join(' '); if (t2 !== q) out = '“' + t2 + '”'; }   // v431 : citation (rapport des dépisteurs)
    else if (!hit && /[.!?:] +[A-ZÀ-ÝÉ«]/.test(core)) { const ps = core.split(/(?<=[.!?:]) +(?=[A-ZÀ-ÝÉ«])/); if (ps.length > 1) { const t2 = ps.map(x => trText(x)).join(' '); if (t2 !== core) out = t2; } }   // v431 : plusieurs phrases (nom du talent + description…) : chaque phrase à part
    if (out === core && /[A-ZÀ-Ý]{3}/.test(core) && core === core.toUpperCase()) { const u = I18N_UP(core); if (u) out = u; }   // v431 : titres écrits en majuscules
    else if (/[A-ZÀ-Ý]{3}/.test(out) && out.indexOf(' · ') > 0) { const ps = out.split(' · '), t = ps.map(x => (x === x.toUpperCase() && /[A-ZÀ-Ý]{3}/.test(x) && I18N_UP(x)) || x); if (t.some((x, i) => x !== ps[i])) out = t.join(' · '); }
  }
  for (const [rx, to] of I18N_GEN) out = out.replace(rx, to);
  out = (/^[:;!?]/.test(out) && / $/.test(lead) ? lead.slice(0, -1) : lead) + out + trail;   // pas d'espace avant « : » en anglais
  if (I18N_MEMO.size > 20000) I18N_MEMO.clear();
  I18N_MEMO.set(s, out); return out;
}
const I18N_ATTR = ['title', 'aria-label', 'placeholder', 'data-mw', 'label'];
const i18nSkipEl = n => I18N_SKIP.has(n.nodeName) || !!(n.classList && n.classList.contains('notr'));
const I18N_DONE = new WeakMap();   // valeur déjà traduite par nous : on ne la retraduit pas (évite « Tous » → « All » → « Out »)
function trAttrs(n) { I18N_ATTR.forEach(a => { if (n.hasAttribute(a)) { const v = n.getAttribute(a), d = I18N_DONE.get(n); if (d && d[a] === v) return; const t = trText(v); if (t !== v) { n.setAttribute(a, t); const o = I18N_DONE.get(n) || {}; o[a] = t; I18N_DONE.set(n, o); } } }); }
function trTextNode(n) { const v = n.nodeValue; if (I18N_DONE.get(n) === v) return; const t = trText(v); if (t !== v) { I18N_DONE.set(n, t); n.nodeValue = t; } }
function trNode(root) {
  if (LANG !== 'en' || !root) return;
  if (root.nodeType === 3) { const p = root.parentNode; if (p && p.nodeType === 1 && !i18nSkipEl(p) && !(p.closest && p.closest('.notr'))) trTextNode(root); return; }
  if (root.nodeType !== 1 || (root.closest && root.closest('.notr'))) return;
  if (i18nSkipEl(root)) { if (root.nodeName === 'INPUT' || root.nodeName === 'TEXTAREA') trAttrs(root); return; }
  trAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: n => { if (n.nodeType === 1 && i18nSkipEl(n)) { if ((n.nodeName === 'INPUT' || n.nodeName === 'TEXTAREA') && !n.classList.contains('notr')) trAttrs(n); return NodeFilter.FILTER_REJECT; } return NodeFilter.FILTER_ACCEPT; } });
  let n; while ((n = w.nextNode())) {
    if (n.nodeType === 3) trTextNode(n);
    else trAttrs(n);
  }
}
let I18N_OBS = null;
function i18nWatch() {
  if (I18N_OBS) { I18N_OBS.disconnect(); I18N_OBS = null; }
  try { document.documentElement.lang = LANG; } catch (e) { }
  if (LANG !== 'en' || typeof MutationObserver === 'undefined' || !document.body) return;
  trNode(document.body);
  I18N_OBS = new MutationObserver(list => { for (const m of list) { if (m.type === 'characterData') trNode(m.target); else if (m.type === 'attributes') { if (m.target.nodeType === 1 && !(m.target.closest && m.target.closest('.notr'))) trAttrs(m.target); } else m.addedNodes.forEach(trNode); } });
  I18N_OBS.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTR });
}
function setLang(v) { LANG = 'en'; try { localStorage.setItem('golf-lang', LANG); } catch (e) { } I18N_MEMO.clear(); i18nWatch(); }
const langPickHTML = () => '';   // v431 : plus de choix de langue
(document.body ? Promise.resolve() : new Promise(r => addEventListener('DOMContentLoaded', r))).then(() => i18nWatch());
/*I18N-DICT-START*/
/* ---- Dictionnaire anglais (étape 1 : accueil, menus, création de partie, tableau de bord) ---- */
Object.assign(I18N_EN, {
  // onglets, menus, barre du haut
  'Saison': 'Season', 'Ligues': 'Leagues', 'Historique': 'History', 'Almanac': 'Almanac', 'Golfeurs': 'Golfers', 'Terrains': 'Courses', 'Watchlist': 'Watchlist', 'Plus': 'More',
  'Temple': 'Hall of Fame', 'Dernière cuvée': 'Latest class', 'Partie Duo →': 'Duo game →', '← Retour à ma carrière': '← Back to my career',
  'Cérémonie du Temple': 'Hall of Fame ceremony', 'Golfeur': 'Golfer', 'Tournoi': 'Tournament', 'Journal': 'Journal', 'Résumé de terrain': 'Course summary',
  'Ronde en cours': 'Round in progress', 'Simulation': 'Simulation', 'Fin de ronde': 'End of round', 'Fin de tournoi': 'End of tournament', 'Nouveau golfeur': 'New golfer',
  'Temple de la renommée': 'Hall of Fame', 'Retour': 'Back', '‹ Retour': '‹ Back', 'Retour à la page précédente': 'Back to previous page',
  '🔍 Rechercher un golfeur…': '🔍 Search golfers…', 'Continuer ▶': 'Continue ▶', 'Chargement…': 'Loading…',
  // ligues
  'Ligue 1 · Tour': 'League 1 · Tour', 'Ligue 2 · Pro': 'League 2 · Pro', 'Ligue 3 · Semi-Pro': 'League 3 · Semi-Pro', 'Ligue 4 · Amateur': 'League 4 · Amateur',
  'Ligue 1': 'League 1', 'Ligue 2': 'League 2', 'Ligue 3': 'League 3', 'Ligue 4': 'League 4',
  'Ligue 4 · Amateur (gagnant vers +12 à +15)': 'League 4 · Amateur (winning score around +12 to +15)', 'Ligue 1 · Tour (gagnant vers −7 à −4)': 'League 1 · Tour (winning score around −7 to −4)',
  // création de partie
  'Quatre ligues · dix tournois par saison': 'Four leagues · ten tournaments per season', 'Une saison de dix tournois contre des adversaires simulés.': 'A season of ten tournaments against simulated opponents.',
  'Mode': 'Mode', 'Joueur manuel': 'Manual Player', 'Joueur simulé': 'Simulated Player', 'Partie Duo activée': 'Duo game enabled', 'Partie Duo cachée': 'Duo game hidden',
  'Ton nom': 'Your name', 'Nom de l’équipe': 'Team name', 'Ligue de départ': 'Starting league', 'Comment tu joues': 'How you play', 'Mode de jeu': 'Game mode',
  'Je joue moi-même': 'I play my own rounds', 'Je simule ma carrière': 'I simulate my career', 'En duo · tirelire': 'Duo · piggy bank',
  'Tu joues sur ton simulateur et tu entres tes scores trou par trou.': 'You play on your simulator and enter your scores hole by hole.',
  'Tu crées un golfeur et tu suis sa carrière : les trous et les rondes se simulent au lieu d’entrer tes propres scores.': 'You create a golfer and follow his career: holes and rounds are simulated instead of entering your own scores.',
  'Vous jouez un seul golfeur à deux (meilleure balle). Tournois d’une ronde : les 65 premiers sont payés en vrais dollars dans la tirelire. Cette partie est gardée à part de ta carrière.': 'You play one golfer as a pair (best ball). One-round tournaments: the top 65 are paid in real dollars into the piggy bank. This game is kept separate from your career.',
  'Réglages de la carrière': 'Career settings', 'Format des tournois': 'Tournament format', '2 rondes · coupure': '2 rounds · cut', '1 ronde · plus rapide': '1 round · faster',
  'Ronde 1, coupure aux 65 premiers (et les égalités), puis ronde 2.': 'Round 1, cut to the top 65 (and ties), then round 2.',
  'Une seule ronde par tournoi : tout le monde est classé, les 65 premiers (et les égalités) reçoivent points et bourse. Deux fois plus rapide.': 'A single round per tournament: everyone is ranked, the top 65 (and ties) earn points and prize money. Twice as fast.',
  'Année d’arrivée': 'Arrival year', 'Saisons d’histoire': 'Seasons of history', 'Commencer la carrière': 'Start my career', 'Commencer la partie Duo': 'Start the Duo game',
  '— ou —': '— or —', 'Importer une sauvegarde': 'Import a save', 'Le sélecteur ne s’ouvre pas ?': 'The file picker won’t open?',
  'Ouvre le fichier .json dans une appli de texte, copie tout son contenu, puis colle-le ici.': 'Open the .json file in a text app, copy all of it, then paste it here.',
  'Colle ici le contenu du fichier .json': 'Paste the contents of the .json file here', 'Importer le texte collé': 'Import the pasted text',
  'Sans année, les saisons sont numérotées (saison 1, 2, 3…).': 'Without a year, seasons are numbered (season 1, 2, 3…).',
  'Play Now · tournoi rapide': 'Play Now · quick tournament',
  // préréglages
  '🎯 Réaliste': '🎯 Realistic', '👑 Dynastie': '👑 Dynasty', '🎲 Arcade': '🎲 Arcade', '🛠️ Personnalisé': '🛠️ Custom',
  'Les valeurs calibrées. Le n°1 finit souvent top 10, mais gagne rarement.': 'The calibrated values. The No. 1 often finishes top 10 but rarely wins.',
  'Les meilleurs dominent : plus d’écart, moins de hasard. La L1 devient plus dure à atteindre.': 'The best dominate: bigger gaps, less luck. L1 becomes harder to reach.',
  'Plus de talent, plus de hasard, bourses plus grosses.': 'More talent, more luck, bigger purses.',
  'Tes propres réglages (s’active dès que tu touches un curseur).': 'Your own settings (kicks in as soon as you touch a slider).',
  // accueil
  'Saison terminée': 'Season over', 'Clôturer la saison': 'Close the season', 'Les dix tournois sont joués.': 'All ten tournaments are played.',
  'Les dix tournois sont joués. Place aux promotions et aux relégations.': 'All ten tournaments are played. Time for promotions and relegations.',
  '. Place aux promotions et aux relégations.': '. Time for promotions and relegations.', 'La Finale est jouée :': 'The Finale has been played:',
  'Jouer la ronde 1': 'Play round 1', 'Jouer la ronde 2': 'Play round 2', 'Jouer la ronde': 'Play the round', 'Jouer la ronde 1 de la Finale': 'Play round 1 of the Finale',
  'Simuler la ronde 1': 'Simulate round 1', 'Simuler la ronde': 'Simulate the round', 'Simuler la ronde 2': 'Simulate round 2', 'Simuler le tournoi': 'Simulate the tournament', 'Simuler toute la saison': 'Simulate the whole season',
  'Simuler la ronde 2 d’un coup': 'Simulate round 2 at once', 'Simuler la ronde 2 trou par trou': 'Simulate round 2 hole by hole', 'Simuler le reste de la ronde': 'Simulate the rest of the round',
  'Simuler le reste du tournoi': 'Simulate the rest of the tournament', 'Simuler la Finale': 'Simulate the Finale', 'Voir la Finale': 'Watch the Finale',
  'Les meilleurs de la Ligue 1 se disputent le titre.': 'The best of League 1 battle for the title.',
  'bourse de ce tournoi': 'this tournament’s purse', 'au gagnant, pour vrai': 'to the winner, for real', 'Majeur': 'Major', 'Majeurs': 'Majors', 'Finale': 'Finale',
  'Championnat International': 'International Championship', 'Open du Circuit': 'Tour Open', 'Championnat des Joueurs': 'Players Championship', 'Classique des Champions': 'Champions Classic',
  'Classement de saison': 'Season standings', 'Voir tout le classement': 'See full standings', 'Dans le monde du golf': 'Around the golf world', 'Dernier tournoi': 'Last tournament',
  'Résumé et résultats complets': 'Full summary and results',
  // tableau de bord (PC)
  'Boîte de réception': 'Inbox', 'Tout voir': 'See all', 'Ta forme': 'Your form', 'Ton profil': 'Your profile', 'Classement complet': 'Full standings', 'World Ranking': 'World Ranking',
  'Derniers résultats': 'Recent results', 'Aucun tournoi joué': 'No tournaments played', 'Aucun tournoi joué pour l’instant.': 'No tournaments played yet.', 'Aucune nouvelle pour l’instant.': 'No news yet.',
  'Points': 'Points', 'V · T10': 'W · T10', 'Coupures': 'Cuts made', 'Niveau': 'Level', 'Handicap': 'Handicap', 'Rang': 'Rank', 'Joueur': 'Player', 'V': 'W', 'Pts': 'Pts',
  'Famille': 'Family', 'Retraite': 'Retirement', 'Dépisteurs': 'Scouts', 'Circuit': 'Tour',
  // classements
  'arrivés en cours de saison : protégés': 'arrived mid-season: protected', '▲ en forme · ▼ en méforme': '▲ in form · ▼ cold', 'Pastille : handicap': 'Badge: handicap',
  '🛡 exempté : jamais relégué': '🛡 exempt: never relegated', 'En forme': 'In form', 'En méforme': 'Cold', 'Compté depuis le début de la saison.': 'Counted since the start of the season.', 'Compté depuis l’arrivée dans la ligue.': 'Counted since joining the league.', 'et': 'and',
  'promus en cours de saison : gardent leur rang, sans prendre de place': 'promoted mid-season: keep their rank without taking a spot',
  'La montée reste possible.': 'Promotion is still possible.',
  // nouvelles fréquentes
  ', fait son entrée sur le circuit.': ', joins the tour.', 'La Finale renverse le classement :': 'The Finale flips the standings:', 'Le meneur du classement,': 'The standings leader,',
  'remporte le tournoi': 'wins the tournament', 'remporte le tournoi en prolongation': 'wins the tournament in a playoff', 'l’emporte sur': 'beats',
  // jours (drapeau)
  'Jeudi': 'Thursday', 'Vendredi': 'Friday', 'Samedi': 'Saturday', 'Dimanche': 'Sunday'
});
/* critères des pastilles de montée et de descente */
const I18N_CRIT = s => s.replace('1 victoire + 1 autre top-3', '1 win + 1 other top-3').replace(/^(\d+) victoires? et (\d+) autres? top-3$/, (m, a, b) => I18N_PL(a, 'win') + ' and ' + b + ' other top-3').replace(/(\d+) fois dans les (\d+) derniers/, '$1 finishes in the bottom $2')
  .replace(/^1 victoire, il manque 1 autre top-3$/, '1 win, needs 1 more top-3').replace(/^(\d+) top-3, il manque 1 victoire$/, '$1 top-3, needs 1 win').replace(/^(\d+) sur (\d+)$/, '$1 of $2').replace(/^(\d+) victoires?$/, (m, n) => I18N_PL(n, 'win'));
const I18N_EXTIP = s => s.replace(/^victoire en Finale à (.+) en (\d+), Ligue (\d)$/, 'Finale win at $1 in $2, League $3').replace(/^victoire à (.+) en (\d+), Ligue (\d)$/, 'win at $1 in $2, League $3')
  .replace(/^victoire au tournoi (\d+) en (\d+), Ligue (\d)$/, 'win at tournament $1 in $2, League $3').replace(/^champion de la Ligue (\d) en (\d+)$/, 'League $1 champion in $2').replace(/^exemption unique de carrière, utilisée en (\d+)$/, 'one-time career exemption, used in $1');
const I18N_PL = (n, w, ws) => n + ' ' + (+n === 1 ? w : (ws || w + 's'));
I18N_RX.push(
  [/^Saison (\d+)$/, 'Season $1'], [/^Saison (\d+) · Tournoi (\d+)\/(\d+)( ★)?$/, 'Season $1 · Tournament $2/$3$4'], [/^Saison (\d+) · Finale$/, 'Season $1 · Finale'], [/^Saison (\d+) · saison terminée$/, 'Season $1 · season over'],
  [/^Calendrier de la saison (\d+)$/, '$1 season calendar'], [/^Classement de saison · (.+)$/, 'Season standings · $1'], [/^Bilan de la saison (\d+)$/, '$1 season review'], [/^Classe de (\d+)$/, 'Class of $1'],
  [/^Bienvenue en (\d+) : (\d+) saisons? d’histoire$/, (m, y, n) => 'Welcome to ' + y + ': ' + I18N_PL(n, 'season') + ' of history'],
  [/^Joueur · (\S+) en L(\d)$/, 'Player · $1 in L$2'], [/^(\d+) ans · (\S+) en L(\d)$/, 'Age $1 · $2 in L$3'], [/^(\d+) ans$/, 'Age $1'], [/^Joueur$/, 'Player'],
  [/^Rang en L(\d)$/, 'Rank in L$1'], [/^T(\d+) · prochain$/, 'T$1 · next'],
  [/^Tu es (\S+) avec (\d+) points?(?:, (\d+) victoires?)?\.$/, (m, o, p, w) => 'You’re ' + o + ' with ' + p + ' points' + (w ? ', ' + I18N_PL(w, 'win') : '') + '.'],
  [/^Tournoi (\d+) sur (\d+) · cette semaine en L1 : (.+) \(Majeur\)$/, (m, a, b, n) => 'Tournament ' + a + ' of ' + b + ' · this week in L1: ' + trText(n) + ' (Major)'], [/^Tournoi (\d+) sur (\d+)$/, 'Tournament $1 of $2'],
  [/^Par (\d+) · (\d+) golfeurs · aucune coupure · points doublés · la plus grosse bourse de l’année$/, 'Par $1 · $2 golfers · no cut · double points · the biggest purse of the year'],
  [/^Par (\d+) · aucune coupure · points doublés/, 'Par $1 · no cut · double points'], [/^Par (\d+) · coupure après la ronde 1/, 'Par $1 · cut after round 1'], [/^Par (\d+) · une ronde · les (\d+) premiers sont payés/, 'Par $1 · one round · top $2 paid'],
  [/^Tee (\S+) · ([\d,]+) v · CR ([\d.,]+) \/ Slope (\d+)(?: · distance : ([+−][\d.,]+) coups? par ronde)?$/, (m, t, d, cr, sl, dd) => 'Tee ' + t + ' · ' + d + ' yds · CR ' + cr + ' / Slope ' + sl + (dd ? ' · distance: ' + dd + ' stroke' + (Math.abs(parseFloat(dd.replace('−', '-').replace(',', '.'))) >= 2 ? 's' : '') + ' per round' : '')],
  [/^(R\d — )?(Drapeau : (\S+))?( · )?(Vent : (.+))?$/, (m, r, dp, day, sep, vp, wind) => (r || '') + (dp ? 'Pin: ' + trText(day) : '') + (sep || '') + (vp ? 'Wind: ' + wind : '')],
  [/^🏆 Finale · top (\d+) de la Ligue 1$/, '🏆 Finale · top $1 of League 1'], [/^🏆 Finale · top (\d+) de la L1$/, '🏆 Finale · top $1 of L1'],
  [/^Tu n’es pas dans le top (\d+) : les meilleurs se disputent le titre sans toi\.$/, 'You’re not in the top $1: the best battle for the title without you.'],
  [/^Reprendre la simulation · trou (\d+)$/, 'Resume the simulation · hole $1'], [/^Reprendre la ronde (?:(\d) )?· trou (\d+)$/, (m, r, h) => 'Resume ' + (r ? 'round ' + r : 'the round') + ' · hole ' + h],
  [/^Promotion \((\d+) premiers, puis jusqu’au (\d+)e avec un index ≤ (.+)\)$/, 'Promotion (top $1, then up to $2th with an index ≤ $3)'], [/^Relégation \(après le (\d+)e rang, index au-dessus de (.+)\)$/, 'Relegation (below rank $1 with an index above $2)'],
  [/^Promotion \((\d+) premiers\)$/, 'Promotion (top $1)'], [/^Relégation \((\d+) derniers\)$/, 'Relegation (bottom $1)'],
  [/^(Il est|Tu es) à un résultat d’une (promotion|relégation) en Ligue (\d)\.$/, (m, w, k, l) => (w === 'Tu es' ? 'You are' : 'He is') + ' one result away from ' + (k === 'promotion' ? 'promotion' : 'relegation') + ' to League ' + l + '.'],
  [/^([○●]) (.+) : (.+)$/, (m, b, a, c) => b + ' ' + I18N_CRIT(a) + ': ' + I18N_CRIT(c)],
  [/^arrivé en cours de saison \((.+)\) · protégé$/, (m, c) => 'arrived mid-season (' + I18N_CRIT(c) + ') · protected'], [/^promu en cours de saison : (.+)$/, (m, c) => 'promoted mid-season: ' + I18N_CRIT(c)],
  [/^(Tu es exempté|Exempté) de relégation jusqu’à la fin de (\d+) : (.+?)\.( La montée reste possible\.)?$/, (m, w, y, tip, up) => (w === 'Tu es exempté' ? 'You’re exempt' : 'Exempt') + ' from relegation through the end of ' + y + ': ' + I18N_EXTIP(tip) + '.' + (up ? ' Promotion is still possible.' : '')],
  [/^(.+) Ajustables dans (?:Réglages|Options) › Avancé jusqu’à ton premier tournoi, puis verrouillés\.$/, (m, d) => trText(d) + ' Adjustable in Options › Advanced until your first tournament, then locked.'],
  [/^Le circuit naît en (\d+), en même temps que ta carrière\.$/, 'The tour is born in $1, along with your career.'],
  [/^Le circuit a déjà (\d+) saisons? d’histoire \((\d+) à (\d+)\) : tu arrives en (\d+), avec des records, des champions et des vétérans déjà en place\.$/, (m, n, a, b, y) => 'The tour already has ' + I18N_PL(n, 'season') + ' of history (' + a + ' to ' + b + '): you arrive in ' + y + ', with records, champions and veterans already in place.'],
  [/^Quatre ligues de (\d+) golfeurs\. À la fin de chaque saison, les (\d+) premiers de chaque ligue montent et les (\d+) derniers descendent ; en cours de saison, les golfeurs en feu montent et ceux en difficulté descendent\.( Une victoire protège de la relégation pour 3 saisons 🛡\.)?$/,
    (m, n, a, b, x) => 'Four leagues of ' + n + ' golfers. At the end of each season, the top ' + a + ' in each league move up and the bottom ' + b + ' move down; during the season, hot golfers move up and struggling ones move down.' + (x ? ' A win protects from relegation for 3 seasons 🛡.' : '')],
  [/^Quatre ligues : de (\d+) à (\d+) golfeurs en Ligues 1 à 3 selon le niveau du circuit, la Ligue 4 accueille les autres\. À la fin de chaque saison, (?:le top (\d+) garde sa place ; plus bas, il faut l’index de la ligue\. Les (\d+) premiers du dessous montent toujours|le top (\d+(?: à \d+)?) de chaque ligue monte et les (\d+) derniers descendent) ; en cours de saison, les golfeurs en feu montent et ceux en difficulté descendent\.( Une victoire protège de la relégation pour 3 saisons 🛡\.)?$/,
    (m, a, b, sf, au, tc, rb, x) => 'Four leagues: ' + a + ' to ' + b + ' golfers in Leagues 1 to 3 depending on the tour’s strength, and League 4 takes the rest. At the end of each season, ' + (tc ? 'the top ' + tc.replace(' à ', ' to ') + ' of each league move up and the bottom ' + rb + ' move down;' : 'the top ' + sf + ' keep their spot; lower down, you need the league’s index. The top ' + au + ' from below always move up;') + ' during the season, hot golfers move up and struggling ones move down.' + (x ? ' A win protects from relegation for 3 seasons 🛡.' : '')],
  // nouvelles et résumés (en partie, étape 3 pour le reste)
  [/^\((\d+) ans\), (fils|frère cadet|frère jumeau|frère aîné|frère|cousin|père|neveu) de( l’ancien golfeur)?$/, (m, a, r, x) => '(' + a + '), ' + ({ 'fils': 'son', 'frère cadet': 'younger brother', 'frère jumeau': 'twin brother', 'frère aîné': 'older brother', 'frère': 'brother', 'cousin': 'cousin', 'père': 'father', 'neveu': 'nephew' }[r] || r) + ' of' + (x ? ' former golfer' : '')],
  [/^, (\S+) du classement avant le tournoi, termine (\S+)\.$/, ', ranked $1 before the tournament, finishes $2.'], [/^Prolongation à (\d+) :$/, '$1-man playoff:'],
  [/^\((\d+) ans\) déçoit : on attendait mieux, les dépisteurs revoient son potentiel à la baisse\.$/, '($1) disappoints: more was expected, and the scouts lower their view of his potential.'],
  [/^\((\d+) ans\) perd soudainement la touche : personne ne s’explique la chute\.$/, '($1) suddenly loses his touch: nobody can explain the slump.'],
  [/^\((\d+) ans\) semble avoir franchi un cap au cours de la dernière année\.$/, '($1) seems to have taken a step forward over the past year.'],
  [/^\((\d+) ans\) connaît une éclosion tardive : personne ne l’attendait là\.$/, '($1) is a late bloomer: nobody saw it coming.'],
  [/^sort d’une année difficile : son niveau a reculé\.$/, 'comes off a tough year: his game has slipped.'],
  [/^dégringole en Ligue (\d) après (.+)\.$/, (m, l, c) => 'drops to League ' + l + ' after ' + I18N_CRIT(c) + '.'], [/^monte en Ligue (\d) en pleine saison \((.+)\) !$/, (m, l, c) => 'moves up to League ' + l + ' mid-season (' + I18N_CRIT(c) + ')!'],
  [/^(Tu remportes|remporte) la Finale à (.+)\.$/, (m, w, c) => (w === 'Tu remportes' ? 'You win' : 'wins') + ' the Finale at ' + c + '.'], [/^termine 1er de la Ligue 1, devant$/, 'finishes 1st in League 1, ahead of'],
  [/^(.+) l’emporte$/, '$1 wins'], [/^, (\S+) du classement avant le tournoi, l’emporte\.$/, ', ranked $1 before the tournament, wins.'],
  [/^accusait (\d+) coups? de retard sur le meneur après la ronde 1 et a tout rattrapé\.$/, (m, n) => 'trailed the leader by ' + I18N_PL(n, 'shot') + ' after round 1 and came all the way back.'],
  [/^menait après la ronde 1 \((.+)\) mais termine (\S+)\.$/, 'led after round 1 ($1) but finished $2.'], [/^menait après la ronde 1 \((.+)\) mais rate finalement la coupure\.$/, 'led after round 1 ($1) but missed the cut in the end.'],
  [/^Total (\S+) · (\S+) · un coup d’avance$/, 'Total $1 · $2 · one-shot lead'], [/^Total (\S+) · (\S+) · (\d+) coups d’avance$/, 'Total $1 · $2 · $3-shot lead'],
  [/^évite la relégation en Ligue (\d) grâce à son exemption \((.+)\)\.$/, (m, l, t) => 'avoids relegation to League ' + l + ' thanks to his exemption (' + I18N_EXTIP(t) + ').']
);
I18N_GEN.push(
  [/(\d+),(\d+)\s?%/g, '$1.$2%'], [/(\d+)\s%/g, '$1%'], [/(\d),(\d)(?!\d)/g, '$1.$2'], [/(\d[\d,]*) v\b/g, '$1 yds'], [/ · handicap d’équipe \+(\d+)/g, ' · team handicap +$1']
);

/* ---- Dictionnaire anglais (étape 2 : toute l'interface) ---- */
Object.assign(I18N_EN, {
  // golfeurs (liste)
  'Tu remportes le tournoi': 'You win the tournament', 'Meilleure ronde :': 'Best round:', 'Rechercher par nom': 'Search by name', 'Nom ou prénom': 'First or last name',
  'Classement des golfeurs': 'Golfer rankings', 'Ligue': 'League', 'Toutes les ligues': 'All leagues', 'Trier par': 'Sort by', 'Progression (dernière intersaison)': 'Progress (last offseason)',
  'Âge · les plus jeunes': 'Age · youngest', 'Âge · les plus vieux': 'Age · oldest', 'Points de la saison': 'Season points', 'Gains en carrière': 'Career earnings', 'Victoires en carrière': 'Career wins',
  'Tous les âges': 'All ages', 'tous les âges': 'all ages', '… ans et moins': '… and under', '… ans et plus': '… and over', 'Entre … et … ans': 'Between … and …',
  'En plein creux': 'In a slump', 'En passe chaude': 'On a hot streak', 'Jeunes à surveiller': 'Young players to watch', 'Meneurs de saison': 'Season leaders',
  // ligues
  'Classement de saison et résultat de chaque tournoi': 'Season standings and every tournament result', 'Coupure': 'Cut', 'Coupure ratée': 'Missed cut', 'Victoire': 'Win',
  'Top 10': 'Top 10', 'Top 20': 'Top 20', 'En bref': 'At a glance', 'EN TÊTE': 'LEADER', 'CHAMPION': 'CHAMPION', 'Tournois joués': 'Tournaments played', 'Ton rang': 'Your rank',
  'Pas de promotion': 'No promotion', 'Pas de relégation': 'No relegation', 'Tes points': 'Your points', 'Tournois de la saison': 'Season tournaments', 'Journal des résumés': 'Summary journal',
  'Archives des entre-saisons': 'Offseason archives', 'Carrière': 'Career', 'Réduire': 'Show less', 'Positions': 'Positions', 'Score': 'Score', 'Gains': 'Earnings', 'Bourse totale': 'Total purse',
  // records et almanac
  'Argent et exploits rares, toutes ligues confondues. Retraités et anciennes carrières inclus.': 'Money and rare feats, all leagues combined. Retired golfers and past careers included.',
  'Gains en une saison': 'Earnings in a season', 'Plus gros chèque': 'Biggest check', 'Trous d’un coup en carrière': 'Career holes-in-one', 'Albatros en carrière': 'Career albatrosses',
  'Parité': 'Parity', 'Score moyen par ronde': 'Scoring average per round', 'Par rapport au par, toutes les rondes de la saison.': 'Relative to par, all rounds of the season.',
  'Score moyen par ronde, par ligue et par année': 'Scoring average per round, by league and year', 'Année': 'Year', 'Moyenne': 'Average', 'Sous le par': 'Under par',
  'Meilleure ronde': 'Best round', 'Pire ronde': 'Worst round', 'Comparés seulement aux scores de la même ligue.': 'Compared only with scores from the same league.',
  'Meilleur score gagnant': 'Best winning score', 'Plus grande avance à l’arrivée': 'Largest winning margin', 'Plus grosse remontée': 'Biggest comeback', 'Coupure la plus basse': 'Lowest cut',
  'Coupure la plus haute': 'Highest cut', 'Meilleure saison': 'Best season', 'Trous d’un coup': 'Holes-in-one', 'Coupures réussies d’affilée': 'Consecutive cuts made', 'Records détenus': 'Records held',
  'Aucun record de ligue ou de carrière pour l’instant.': 'No league or career records yet.', 'Victoires en une saison': 'Wins in a season', 'Points en une saison': 'Points in a season',
  'Victoires d’affilée': 'Consecutive wins', 'Plus jeune vainqueur': 'Youngest winner', 'Plus vieux vainqueur': 'Oldest winner', 'Talent du circuit': 'Tour talent', 'Elite et plus': 'Elite and above',
  'Pro et Established Pro': 'Pro and Established Pro', 'Average et Semi-Pro': 'Average and Semi-Pro', 'Amateur et moins': 'Amateur and below',
  'Nombre de golfeurs par groupe de paliers sur tout le circuit': 'Number of golfers by tier group across the tour', 'Âge médian': 'Median age', 'Âge des vainqueurs': 'Winners’ age',
  'Elite+ : Elite, Hall Of Famer et Generational. Le handicap moyen est noté à chaque fin de saison à partir de cette version.': 'Elite+: Elite, Hall Of Famer and Generational. The average handicap is recorded at the end of each season from this version on.',
  'Les meilleures cohortes': 'Best cohorts', 'Toutes les cohortes': 'All cohorts', 'Meilleure carrière': 'Best career', 'Vainqueurs différents par saison': 'Different winners per season',
  'Nombre de vainqueurs différents par saison': 'Number of different winners per season', 'Champions du classement final de la ligue.': 'Champions of the league’s final standings.',
  'Titres consécutifs': 'Consecutive titles', 'Le plus de titres': 'Most titles', 'Plus de victoires': 'Most wins', 'Arrivées, départs et déplacements': 'Arrivals, departures and moves',
  'Déplacés en cours de saison': 'Moved mid-season', 'Retraites, retraites forcées et déplacements en cours de saison par année': 'Retirements, forced retirements and mid-season moves by year',
  'Déplacés': 'Moved', 'Forcées': 'Forced', 'Retraites': 'Retirements', 'Les ascenseurs': 'The elevators', 'Golfeurs qui ont changé de ligue le plus souvent (intersaisons et en cours de saison).': 'Golfers who changed leagues most often (offseason and mid-season).',
  'Relégués': 'Relegated', 'Promus': 'Promoted', 'En saison': 'Mid-season', 'Toute l’histoire du circuit.': 'The tour’s entire history.', 'La meilleure nation de chaque année': 'Best nation each year',
  'Effet du vent': 'Wind effect', 'Score moyen par ronde selon le vent du jour, toutes ligues.': 'Scoring average per round by the day’s wind, all leagues.', 'Les trous les plus difficiles': 'Hardest holes',
  'Terrain': 'Course', 'Trou': 'Hole', 'Les plus faciles': 'Easiest', 'Terrains, du plus dur au plus facile': 'Courses, hardest to easiest', 'Dernière année': 'Last year',
  'Bourses totales par ligue': 'Total purses by league', 'Total des gains versés dans la saison.': 'Total prize money paid in the season.', 'Bourses totales par ligue et par année': 'Total purses by league and year',
  'Plus gros gains': 'Biggest earnings', 'Aucun champion n’a encore gagné deux années de suite.': 'No champion has won two years in a row yet.', 'Pays': 'Country', 'Golfeurs ': 'Golfers ',
  // terrains
  'Terrains de la saison': 'Season courses', 'Cette saison': 'This season', 'Choisis à l’avance les terrains de la saison': 'Pick ahead of time the courses for the', '. Une case « à tirer » sera tirée au début de la saison avec les filtres (si le tirage automatique est activé) ; sinon, elle garde le terrain de la saison d’avant. Les terrains choisis ici ne sont pas touchés par le tirage automatique.': ' season. A “to be drawn” slot is drawn at the start of the season using the filters (if the automatic draw is on); otherwise it keeps the previous season’s course. Courses picked here are left alone by the automatic draw.', 'Effacer le plan de cette saison': 'Clear this season’s plan', 'À tirer au début de la saison': 'Drawn at the start of the season', 'Garde le terrain de la saison d’avant': 'Keeps the previous season’s course', 'Choisis un terrain dans les détails, ou tire-les tous': 'Pick a course in the details, or draw them all', 'Remettre au tirage': 'Back to the draw', 'Remis au tirage': 'Back to the draw', 'Plan effacé': 'Plan cleared', 'Liste de terrains': 'Course list', 'Tirage au hasard': 'Random draw', 'Par': 'Par', 'Tous les tees': 'All tees', 'Tirer les terrains non barrés': 'Draw unlocked courses',
  'Tirer automatiquement à chaque nouvelle saison': 'Draw automatically each new season', 'Éviter les terrains de la saison passée': 'Avoid last season’s courses', 'Pige de terrains': 'Course draft',
  'Sors quelques terrains au hasard, puis choisis ceux que tu veux et le tournoi où les mettre.': 'Pull a few random courses, then pick the ones you want and the tournament to put them in.',
  'Utiliser les filtres du tirage': 'Use the draw filters', 'Copier les noms des terrains': 'Copy the course names', 'Noms copiés': 'Names copied', 'Sélectionne le texte ci-dessous pour le copier': 'Select the text below to copy it', 'Voir l’aperçu sur YouTube': 'Watch the preview on YouTube', 'Détails du terrain': 'Course details', 'Nom du terrain': 'Course name',
  'Tape pour chercher dans ta liste': 'Type to search your list', 'Identité': 'Identity', 'Tee de départ': 'Tee', 'Difficulté': 'Difficulty', 'Drapeau et vent au hasard': 'Random pin and wind',
  'Parcours · par trou': 'Layout · by hole', 'Distance (verges)': 'Distance (yards)', 'Vent': 'Wind', 'Drapeau': 'Pin', 'Terrain barré : débarre-le avec le cadenas pour le modifier.': 'Locked course: unlock it with the padlock to edit it.',
  'Ce tournoi est en cours : le terrain est verrouillé.': 'This tournament is in progress: the course is locked.', '+ Ajouter un terrain à la liste': '+ Add a course to the list', 'Importer une liste': 'Import a list',
  'Exporter ma liste': 'Export my list', 'Fichier pour un ami (terrains-data.js)': 'File for a friend (terrains-data.js)',
  'Mets ce fichier dans le même dossier que le jeu : au premier lancement, sa liste de terrains sera déjà importée.': 'Put this file in the same folder as the game: on first launch, its course list will already be imported.',
  'Ouvre le fichier de terrains (.json) dans une appli de texte, copie tout son contenu, puis colle-le ici.': 'Open the course file (.json) in a text app, copy all of it, then paste it here.',
  'Rechercher un terrain dans ta liste': 'Search your course list', 'Générer des statistiques aléatoires': 'Generate random stats',
  // watchlist
  'Les golfeurs que tu suis': 'Golfers you follow', 'Aucun golfeur dans cette liste. Ouvre un profil et touche « Suivre ».': 'No golfers in this list. Open a profile and tap “Follow”.',
  'Chercher un golfeur': 'Find a golfer', 'Renommer la liste': 'Rename list', 'Supprimer la liste': 'Delete list', 'Nom de la nouvelle liste': 'New list name', 'Créer': 'Create', 'Nom de la liste': 'List name',
  'Suivre': 'Follow', 'Suivi': 'Following', 'Enregistrer': 'Save', 'Annuler': 'Cancel', 'Supprimer': 'Delete',
  // réglages
  'Réglages': 'Settings', 'Général': 'General', 'Affichage': 'Display', 'Barèmes': 'Tables', 'Avancé': 'Advanced', 'EXPERT': 'EXPERT', 'Format et coupure': 'Format and cut', 'Partie ouverte :': 'Open game:',
  'Ma carrière': 'My career', 'Ta carrière et la partie Duo sont gardées séparément ; passer de l’une à l’autre ne change rien à l’autre.': 'Your career and the Duo game are kept separately; switching between them doesn’t affect the other.',
  'Ouvrir la partie Duo': 'Open the Duo game', 'Sauvegarde': 'Save', 'Parties': 'Games', 'Nom du fichier (optionnel)': 'File name (optional)', 'Sauvegarder la partie': 'Save the game',
  'Télécharger un fichier de sauvegarde': 'Download a save file', 'Copies automatiques': 'Automatic copies', 'Restaurer': 'Restore',
  'La première fois, choisis le dossier « Saved Games » dans le dossier du jeu : les sauvegardes suivantes iront directement là.': 'The first time, choose the “Saved Games” folder in the game folder: later saves will go straight there.',
  'La partie est enregistrée automatiquement dans ce navigateur, sur cet appareil. Exporte un fichier de temps en temps pour la conserver ou la déplacer.': 'The game is saved automatically in this browser, on this device. Export a file now and then to keep it or move it.',
  'Recommencer une nouvelle carrière': 'Start a new career', 'Zone sensible': 'Danger zone', 'Effacer toute la partie ?': 'Erase the whole game?', 'Cette action est définitive.': 'This can’t be undone.', 'Tout effacer': 'Erase everything',
  '« Automatique » choisit la mise en page selon la largeur de l’écran : colonnes pleine largeur sur ordinateur, une colonne sur téléphone.': '“Automatic” picks the layout based on screen width: full-width columns on computer, one column on phone.',
  'Téléphone': 'Phone', 'Ordinateur': 'Computer', 'Automatique': 'Automatic', 'Mise en page': 'Layout', 'Style sur ordinateur :': 'Computer style:', 'Noms des Majeurs': 'Major names', 'Langue · Language': 'Langue · Language',
  'Probabilités de base par trou (en %)': 'Base probabilities per hole (in %)', 'Trou d’un coup': 'Hole-in-one', 'Quadruple ou pire': 'Quadruple or worse', 'Baisse de ces trois événements par ligue (%)': 'Reduction of these three events by league (%)',
  'Rétablir les valeurs par défaut': 'Restore defaults', 'Barème de points': 'Points table', 'Noms des golfeurs': 'Golfer names', 'Liste de noms': 'Name list', 'Appliquer les noms': 'Apply names',
  'Ces réglages changent l’équilibre du jeu.': 'These settings change the game’s balance.', 'Rétablir': 'Reset', 'Valeur par défaut': 'Default value', '⭐ Talent et recrues': '⭐ Talent and rookies',
  '💰 Bourses': '💰 Purses', 'Les gains, records de carrière et bourses des autres ligues suivent. Prochains tournois.': 'Earnings, career records and other leagues’ purses follow. Next tournaments.',
  'Talent des recrues': 'Rookie talent', 'Prudence des dépisteurs': 'Scout caution', 'Optimistes': 'Optimistic', 'Prudents': 'Cautious', 'Très prudents': 'Very cautious', 'Familles de golfeurs': 'Golf families',
  'Fréquentes': 'Frequent', 'Jamais': 'Never', 'Rare': 'Rare', 'Abondant': 'Abundant', 'Phénomène (« un Tiger »)': 'Phenom (“a Tiger”)', 'Époques de talent': 'Talent eras', '🏌️ Moteur des rondes': '🏌️ Round engine',
  'Écart entre les meilleurs et les plus faibles': 'Gap between the best and the weakest', 'Écart en bas de l’échelle': 'Gap at the bottom of the scale', 'Resserré': 'Tighter', 'Comme avant la v417': 'As before v417', 'Sous le niveau Semi-Pro, chaque point de talent vaut moins de coups. Avec 70 %, la coupure de la L4 se rapproche de celle de la L3 (environ 3,5 coups d’écart au lieu de 5,5) ; les autres ligues ne bougent pas. 100 % = comme avant la v417.': 'Below Semi-Pro level, each talent point is worth fewer strokes. At 70%, the L4 cut gets closer to the L3 cut (about 3.5 strokes apart instead of 5.5); the other leagues don’t change. 100% = as before v417.', 'Immédiat': 'Immediate', 'Prochaines recrues': 'Next rookies', 'Champ serré': 'Tight field', 'Gros écarts': 'Big gaps',
  'Hasard d’une ronde à l’autre': 'Round-to-round randomness', 'Prévisible': 'Predictable', 'Chaotique': 'Chaotic', 'Nivellement de l’élite': 'Elite leveling', 'Aucun': 'None', 'Léger': 'Light', 'Fort': 'Strong',
  'Rondes de feu': 'Hot rounds', 'Rondes catastrophes': 'Disaster rounds', '⛳ Terrains et conditions': '⛳ Courses and conditions', 'Effet du course rating': 'Course rating effect', 'Aucun effet': 'No effect',
  'Effet de la distance': 'Distance effect', 'Faible': 'Weak', 'Force du vent': 'Wind strength', 'Sans effet': 'No effect', '🏆 Calendrier': '🏆 Calendar', 'Majeurs en Ligue 1': 'Majors in League 1',
  '📈 Carrières': '📈 Careers', 'Progression des jeunes': 'Youth development', 'Déclin des vétérans': 'Veteran decline', 'Taille des ligues selon le niveau': 'League size based on strength',
  'Promus et relégués par ligue': 'Promoted and relegated per league', 'Ligues de taille fixe seulement. S’applique à la prochaine fin de saison.': 'Fixed-size leagues only. Applies at the next season end.',
  '🛡 Exemption après une victoire': '🛡 Exemption after a win', '🛡 Champion protégé': '🛡 Protected champion', 'Le champion d’une ligue ne peut pas être relégué la saison suivante, même dans la ligue du dessus.': 'A league champion can’t be relegated the following season, even in the league above.',
  '🛡 Exemption unique de carrière': '🛡 One-time career exemption', '🏛️ Temple de la renommée': '🏛️ Hall of Fame', 'Sévérité du vote': 'Voting strictness', 'Indulgente': 'Lenient', 'Normale': 'Normal', 'Sévère': 'Strict',
  'Délai après la retraite': 'Wait after retirement', 'Tout rétablir': 'Reset all', 'Generational en même temps': 'Generational at once', 'Autres réglages du moteur': 'Other engine settings',
  'Les changements sont enregistrés tout de suite. Le test se fait sur un monde à part : ta partie n’est pas touchée.': 'Changes are saved right away. The test runs in a separate world: your game isn’t touched.',
  'Forme, séquences, terrain neutre, fréquence du vent…': 'Form, streaks, neutral course, wind frequency…', 'Intensité de la forme': 'Form intensity', 'Chances de séquence par tournoi': 'Streak chance per tournament',
  'Part de creux dans les séquences': 'Share of slumps among streaks', 'Durée maximale d’une séquence': 'Maximum streak length', 'Effet de l’index du trou': 'Hole index effect',
  'Variabilité des trous d’un tournoi à l’autre': 'Hole variability between tournaments', 'Variabilité des terrains': 'Course variability', 'Terrain neutre': 'Neutral course',
  'Un terrain avec ces valeurs n’a aucun effet sur les scores. Au-dessus, il joue plus difficile ; en dessous, plus facile.': 'A course with these values has no effect on scores. Above, it plays harder; below, easier.',
  'Au-dessus, l’écart entre les bons et les moins bons golfeurs s’agrandit ; en dessous, il se rétrécit.': 'Above, the gap between better and weaker golfers widens; below, it narrows.',
  'Distance neutre d’un terrain (verges)': 'Neutral course distance (yards)', 'Verges pour un coup de plus (ou de moins) par ronde': 'Yards per extra (or fewer) stroke per round', 'Vent tiré au hasard': 'Random wind',
  'Afficher la forme et la régularité des golfeurs': 'Show golfers’ form and consistency', 'Afficher le handicap dans les classements': 'Show handicap in standings',
  'Tirer de nouveaux coefficients de régularité': 'Draw new consistency ratings', 'Rétablir les réglages par défaut': 'Restore default settings', 'Réglages du monde': 'World settings',
  'L1 à L3 entre 130 et 170 golfeurs : le top 120 garde sa place, plus bas il faut l’index de la ligue (L1 ≤ 4,3 · L2 ≤ 7,5 · L3 ≤ 12,0). Une époque faible = une L1 plus petite. Fermé : 150 golfeurs par ligue.': 'L1 to L3 between 130 and 170 golfers: the top 120 keep their spot, lower down you need the league’s index (L1 ≤ 4.3 · L2 ≤ 7.5 · L3 ≤ 12.0). A weak era = a smaller L1. Off: 150 golfers per league.',
  'Le top 30 de la L1 (et égalités) après 10 tournois. Aucune coupure, points ×2, bourse ×2 : elle peut décider du champion.': 'The L1 top 30 (and ties) after 10 tournaments. No cut, points ×2, purse ×2: it can decide the champion.',
  'Le champion d’une ligue ne peut pas être relégué la saison suivante, même dans la ligue du dessus': 'A league champion can’t be relegated the following season, even in the league above',
  // verrouillage
  'Réglages verrouillés pour ta carrière.': 'Settings locked for your career.', 'Choisis à la création de la partie, ils restent visibles. L’affichage reste libre.': 'Chosen when the game was created, they stay visible. Display settings remain free.',
  'Déverrouiller…': 'Unlock…', 'Déverrouiller': 'Unlock', 'Déverrouiller les réglages de ta carrière ?': 'Unlock your career settings?',
  'Tes records et ton Temple pourraient ne plus se comparer d’une époque à l’autre. Le déverrouillage sera noté dans les nouvelles.': 'Your records and Hall of Fame might no longer compare across eras. The unlock will be noted in the news.',
  '🔓 Tu peux encore ajuster ces réglages : ils se verrouilleront à ton premier tournoi.': '🔓 You can still adjust these settings: they’ll lock at your first tournament.', 'Réglages verrouillés': 'Settings locked',
  // spectateur, nouveau golfeur, Play Now
  'Nouvelle carrière': 'New career', 'Tu joues toi-même sur ton simulateur': 'You play on your own simulator', 'Possible au début d’une saison.': 'Possible at the start of a season.',
  'Suivre le circuit sans jouer': 'Follow the tour without playing', 'Retour au circuit': 'Back to the tour', 'Commencer': 'Start',
  'Tu pourras simuler les saisons suivantes et recommencer une carrière au début de n’importe quelle saison.': 'You can simulate the following seasons and start a new career at the beginning of any season.',
  'Tournoi rapide, hors carrière': 'Quick tournament, outside your career', '+ Ajouter un joueur': '+ Add a player', 'Terrain aléatoire': 'Random course', '· terrain aléatoire': '· random course',
  'Commencer le tournoi': 'Start the tournament', 'Âge': 'Age', 'Nationalité': 'Nationality', 'Non précisée': 'Not specified', 'Potentiel': 'Potential', 'Nom': 'Name', 'Créer le golfeur': 'Create the golfer',
  // ronde en direct
  'Moins un coup': 'One stroke less', 'Plus un coup': 'One stroke more', 'Choisir ton score': 'Choose your score', 'Valider le trou': 'Confirm hole', 'Corriger le trou précédent': 'Fix the previous hole',
  'Corriger le dernier trou': 'Fix the last hole', 'Ta ronde': 'Your round', 'Révélation des scores adverses': 'Opponents’ score reveal', 'Tous les scores d’un coup': 'All scores at once', 'Par séquence': 'In sequence',
  'Cartes de scores': 'Scorecards', 'Classement': 'Standings', 'Épinglé': 'Pinned', 'Tous': 'All', 'Ta ligne, épinglée en haut': 'Your row, pinned at the top',
  'Compté avant ce tournoi, depuis le début de la saison.': 'Counted before this tournament, since the start of the season.', 'Ton score': 'Your score', 'Tu passes': 'You make', 'la coupure': 'the cut', 'Tu rates': 'You miss',
  'Aucune coupure': 'No cut', 'Journal': 'Log', 'Aigle ou mieux': 'Eagle or better', 'Triple ou pire': 'Triple or worse', 'Birdie': 'Birdie', 'Bogey': 'Bogey', 'Double': 'Double', 'Coups': 'Strokes', 'Golfeur ': 'Golfer ',
  'Fiche ›': 'Profile ›', 'Index': 'Index', 'Tot': 'Tot', 'Aller': 'Out', 'Retour ': 'In ', 'Ret': 'In', 'All': 'Out', 'Gain': 'Earnings',
  // page de tournoi
  'Bourse': 'Purse', 'Résultats': 'Results', 'Fiche du tournoi': 'Tournament facts', 'Qualifiés': 'Made cut', 'Payés': 'Paid', 'Ligne de paye': 'Pay line', 'Écart': 'Margin', 'Prol.': 'Playoff',
  'Meilleures rondes': 'Best rounds', 'En feu': 'On fire', 'Le récit du tournoi': 'The tournament story', 'Premier titre en carrière pour': 'First career title for', 'Le moment clé': 'The key moment',
  'Ce qui s’est passé': 'What happened', 'Les fils de l’histoire': 'Storylines', 'Le tournoi en chiffres': 'The tournament in numbers', 'Répartition des scores': 'Score distribution',
  'Ta carte contre le champ': 'Your card vs the field', 'Coups gagnés (+) ou perdus (−) par rapport à la moyenne du champ sur chaque trou.': 'Strokes gained (+) or lost (−) versus the field average on each hole.',
  'Au total :': 'Total:', 'Les nations': 'Nations', 'Remontée spectaculaire de': 'Spectacular comeback by', 'Cartes de scores trou par trou': 'Hole-by-hole scorecards', 'Course au classement': 'Standings race',
  'Promotions et relégations': 'Promotions and relegations', 'Le vainqueur de la semaine dernière,': 'Last week’s winner,', 'Mouvements au classement': 'Standings movers', 'Glissent en zone de relégation :': 'Slide into the relegation zone:',
  'Entrent dans la zone de promotion :': 'Enter the promotion zone:', 'Aucune': 'None', 'Lutte pour le maintien :': 'Fighting to stay up:', 'Cartes de scores de tous les golfeurs': 'All golfers’ scorecards',
  'Tous les résultats': 'All results', 'Retour aux ligues': 'Back to leagues', 'Voir les bannières et la vitrine': 'See the banners and trophy case', 'VAINQUEUR': 'WINNER', 'Prolongation': 'Playoff',
  'Récit': 'Story', 'Résultats finaux': 'Final results', 'Tu menais après la ronde 1 et tu finis le travail.': 'You led after round 1 and finished the job.',
  // fiche du golfeur
  'NIVEAU ACTUEL': 'CURRENT LEVEL', 'SOMMET EN CARRIÈRE': 'CAREER PEAK', 'Gains en carrière, jusqu’à maintenant': 'Career earnings so far', 'Aperçu': 'Overview', 'Régularité': 'Consistency',
  'Régulier': 'Consistent', 'Très régulier': 'Very consistent', 'Irrégulier': 'Streaky', 'Très irrégulier': 'Very streaky', 'Moyen': 'Average', 'Expérimenté': 'Experienced', '▲ En progression': '▲ Improving', 'En progression': 'Improving',
  'Points par tournoi': 'Points per tournament', 'Tous les résultats →': 'All results →', 'Points gagnés lors des derniers tournois': 'Points earned in recent tournaments', 'Les barres rouges sont des coupures ratées.': 'Red bars are missed cuts.',
  'Victoires': 'Wins', 'Niveau · Potentiel': 'Level · Potential', 'En route vers le Temple': 'On the road to the Hall of Fame', 'Ta route vers le Temple': 'Your road to the Hall of Fame', 'Voir le Temple': 'See the Hall of Fame',
  'À son arrivée': 'On arrival', 'Potentiel perçu :': 'Perceived potential:', 'Les dépisteurs le comparaient à': 'Scouts compared him to', 'A dépassé les attentes': 'Exceeded expectations', 'En deçà des attentes': 'Below expectations', 'Conforme aux attentes': 'As expected',
  'Saisons passées': 'Past seasons', 'Tournois joués dans cette ligue': 'Tournaments played in this league', 'Moyenne de points par tournoi': 'Average points per tournament', 'Coupures ratées': 'Missed cuts',
  'Meilleur résultat': 'Best finish', 'Meilleur rang de saison': 'Best season rank', 'Gains en carrière (toutes ligues)': 'Career earnings (all leagues)', 'Handicap plus': 'Plus handicap',
  'Plus l’handicap est bas, meilleur est le golfeur : la courbe monte quand il s’améliore.': 'The lower the handicap, the better the golfer: the curve rises as he improves.', 'Moyenne par type de trou': 'Average by hole type',
  'Meilleurs scores': 'Best scores', 'Ronde': 'Round', 'Face-à-face : chaque tournoi joué dans la même ligue est un duel, gagné par celui qui finit devant l’autre.': 'Head-to-head: every tournament played in the same league is a duel, won by whoever finishes ahead.',
  'Adversaires les plus fréquents': 'Most frequent opponents', 'Gagnés': 'Won', 'Perdus': 'Lost', 'Pas encore de courbe.': 'No curve yet.', 'Bêtes noires': 'Nemeses', 'Victimes favorites': 'Favorite victims', 'Retraité': 'Retired', 'Relégué': 'Relegated', 'Promu': 'Promoted',
  'Retraité · ▼ en recul': 'Retired · ▼ declining', 'Temple de la': 'Hall of', 'renommée': 'Fame', 'Dans la force de l’âge': 'In his prime', '▼ En léger déclin': '▼ Slight decline', '▼ En déclin': '▼ Declining', 'Stable': 'Stable', 'Jeune': 'Young', 'Vétéran': 'Veteran',
  'Tous les résultats et la carrière →': 'All results and career →', 'TEMPLE DE LA RENOMMÉE': 'HALL OF FAME', '⚡ Phénomène': '⚡ Phenom', 'Phénomène': 'Phenom', 'Résultats ': 'Results ',
  'Ta carrière': 'Your career', 'Prendre ma retraite': 'Retire', 'Profil': 'Profile', 'Progression': 'Progress', 'Famille': 'Family',
  // Temple
  'Les golfeurs qui ont marqué l’histoire du circuit · intronisations à chaque intersaison': 'The golfers who shaped the tour’s history · inductions every offseason', 'Les membres': 'The members',
  'Résultats du vote': 'Voting results', 'En voie vers le Temple': 'On the road to the Hall', 'Titre de saison': 'Season title', 'Victoire en Ligue 1': 'Win in League 1', 'Accomplissement (Ligue 1)': 'Achievement (League 1)',
  'N°1 mondial à la fin d’une saison': 'World No. 1 at a season’s end', 'Bonus : victoire dans un Majeur': 'Bonus: Major win', 'Bonus : victoire en Finale': 'Bonus: Finale win', 'Comment on y entre': 'How to get in',
  ': élu presque sûrement.': ': almost certainly elected.', ': cas limite, le vote décide (l’appui grandit d’année en année).': ': borderline, the vote decides (support grows year by year).', ': élu au premier scrutin.': ': elected on the first ballot.',
  'Les exploits d’avant le début de l’histoire de ta partie ne sont pas comptés.': 'Feats from before your game’s history began are not counted.', 'Admissible': 'Eligible', 'membre': 'member', 'membres': 'members',
  'au premier scrutin': 'on the first ballot', 'première intronisation': 'first induction', 'intronisé': 'inducted', 'rayé du scrutin': 'dropped from the ballot', '1er SCRUTIN': '1st BALLOT', 'toi': 'you',
  'Personne n’y est encore entré. Les retraités deviennent admissibles 3 saisons après leur retraite.': 'No one has been inducted yet. Retired golfers become eligible 3 seasons after retiring.',
  // cuvée
  'Dans la moyenne': 'Average', 'LE JOYAU DE LA CLASSE': 'THE GEM OF THE CLASS', 'Pari risqué': 'Risky bet', 'Fils de': 'Son of', 'Valeur sûre': 'Safe bet', 'Les autres recrues': 'The other rookies',
  'Les dépisteurs se trompent parfois : certaines recrues très cotées déçoivent, d’autres surprennent tout le monde.': 'Scouts are sometimes wrong: some highly rated rookies disappoint, others surprise everyone.',
  'Exceptionnelle': 'Exceptional', 'Excellente': 'Excellent', 'Faible': 'Weak', 'Très faible': 'Very weak', 'Bonne': 'Good',
  // journal, bilan
  'Résumés des tournois et des intersaisons': 'Tournament and offseason summaries', 'Tournois': 'Tournaments', 'Résumés de la ligue :': 'League summaries:', 'Afficher les saisons plus anciennes': 'Show older seasons',
  'La saison en chiffres': 'The season in numbers', 'Plus fortes montées': 'Biggest risers', 'Plus fortes chutes': 'Biggest fallers', 'Personne n’est élu cette année.': 'No one is elected this year.',
  'Le joyau de la classe :': 'Gem of the class:', '🏆 Recrue de l’année :': '🏆 Rookie of the year:', 'Retour à la saison': 'Back to the season', 'Continuer vers le bilan de la saison': 'Continue to the season review',
  'Retraites': 'Retirements', 'Retraites forcées': 'Forced retirements', 'Recrues': 'Rookies', 'Champions': 'Champions', 'Montées': 'Promotions', 'Descentes': 'Relegations', 'World Ranking ': 'World Ranking ',
  'enfin !': 'at last!', 'des votes': 'of the vote', 'Le reste du scrutin': 'The rest of the ballot', 'Tu entres au Temple !': 'You’re in the Hall of Fame!', 'TA PLAQUE · ': 'YOUR PLAQUE · ',
  'victoires L1': 'L1 wins', 'Finale ': 'Finale ', 'points Temple': 'Hall points', 'saisons top 10': 'top-10 seasons', 'titre de L1': 'L1 title', 'titres de L1': 'L1 titles', 'aucun titre de L1': 'no L1 titles', 'Finales': 'Finales'
});
const I18N_PARTS = [
  [/^(\d+) victoires? en L(\d)$/, (m, n, l) => I18N_PL(n, 'win') + ' in L' + l], [/^(\d+) victoires? L(\d)$/, (m, n, l) => I18N_PL(n, 'L' + l + ' win')], [/^(\d+) titres? de saison$/, (m, n) => I18N_PL(n, 'season title')],
  [/^(\d+) saisons? n°1 mondial$/, (m, n) => I18N_PL(n, 'season') + ' as world No. 1'], [/^(\d+) saisons? au top (\d+) mondial$/, (m, n, k) => I18N_PL(n, 'season') + ' in the world top ' + k], [/^(\d+) tops? (\d+) de saison$/, (m, n, k) => I18N_PL(n, 'season top-' + k + ' finish', 'season top-' + k + ' finishes')],
  [/^(\d+) tops? (\d+) mondial$/, (m, n, k) => I18N_PL(n, 'world top-' + k + ' season')], [/^(\d+) titres?$/, (m, n) => I18N_PL(n, 'title')], [/^(\d+) tops? (\d+)$/, (m, n, k) => n + ' top ' + k],
  [/^(\d+) Majeurs?$/, (m, n) => I18N_PL(n, 'Major')], [/^(\d+) Finales?$/, (m, n) => I18N_PL(n, 'Finale')], [/^(\d+) victoires?$/, (m, n) => I18N_PL(n, 'win')], [/^(\d+) coupures? ratées?$/, (m, n) => I18N_PL(n, 'missed cut')],
  [/^(\d+) golfeurs$/, '$1 golfers'], [/^(\d+) tournois$/, '$1 tournaments'], [/^(\d+) tournoi$/, '$1 tournament'], [/^(\d+) saisons?$/, (m, n) => I18N_PL(n, 'season')], [/^(\d+) rondes?$/, (m, n) => I18N_PL(n, 'round')],
  [/^depuis (\d+) tournois?$/, (m, n) => 'for ' + I18N_PL(n, 'tournament')], [/^(\d+) points?$/, (m, n) => I18N_PL(n, 'point')], [/^(\d+) pts$/, '$1 pts'], [/^(\d+) recrues?$/, (m, n) => I18N_PL(n, 'rookie')],
  [/^commence en Ligue (\d)$/, 'starts in League $1'], [/^Ligue (\d)$/, 'League $1'], [/^(\d+) retraites?$/, (m, n) => I18N_PL(n, 'retirement')], [/^(\d+) changements? de palier$/, (m, n) => I18N_PL(n, 'tier change')],
  [/^(\d+) saisons? de carrière$/, (m, n) => I18N_PL(n, 'career season')], [/^(.+) en carrière$/, '$1 career earnings'], [/^dernière ligue : (.+)\.$/, 'last league: $1.'], [/^à la fin de la saison (\d+)$/, 'at the end of the $1 season'],
  [/^(\d+) tournois? au total\. Le rang de saison compte les saisons terminées\.$/, (m, n) => I18N_PL(n, 'tournament') + ' in total. Season rank counts completed seasons.'], [/^(\d+) duels$/, '$1 duels'],
  [/^(\d+) fois tous deux dans le top (\d+)$/, '$1 times both in the top $2'], [/^(\d+) fois (\S+) et (\S+)$/, '$1 times $2 and $3'], [/^(\d+) candidats? sur le scrutin\.$/, (m, n) => I18N_PL(n, 'candidate') + ' on the ballot.'],
  [/^(.+) (\d{3,4})$/, (m, a, y) => { const t = trText(a); return t === a && !I18N_EN[a] ? m : t + ' ' + y; }]
];
I18N_RX.push(...I18N_PARTS);
I18N_RX.push(
  [/^(\d+) golfeurs · (.+)$/, (m, n, r) => n + ' golfers · ' + r.split(' · ').map(trText).join(' · ')],
  [/^▼ : le handicap a baissé sur (\d+) tournois \(le golfeur s’améliore\)\. À handicap égal, le calcul exact \((\d+) meilleures rondes sur (\d+)\) départage\.$/, '▼: the handicap dropped over $1 tournaments (the golfer is improving). At equal handicap, the exact calculation (best $2 of $3 rounds) breaks the tie.'],
  [/^Voir les (\d+) golfeurs$/, 'See all $1 golfers'], [/^Voir le top (\d+)$/, 'See the top $1'], [/^Voir les (\d+) années$/, 'See all $1 years'], [/^Voir les (\d+) dernières années$/, 'See the last $1 years'],
  [/^Voir les (\d+) autres retraites$/, 'See the $1 other retirements'], [/^Voir les (\d+) autres$/, 'See the $1 others'], [/^Voir les (\d+) relégués$/, 'See the $1 relegated'], [/^Voir la classe de (\d+)$/, 'See the class of $1'],
  [/^Afficher plus \((\d+) de plus\)$/, 'Show more ($1 more)'], [/^(\d+) terrains dans ta liste$/, '$1 courses in your list'],
  [/^Saison (\d+) \(en cours\)$/, 'Season $1 (in progress)'], [/^(\d{4}) \(en cours\)$/, '$1 (current)'], [/^Saison (\d+) · en cours$/, 'Season $1 · in progress'], [/^Classement · Ligue (\d) · (.+) · (\d+)$/, 'Standings · League $1 · $2 · $3'],
  [/^(Tu es monté|Monté|Tu es descendu|Descendu) de la Ligue (\d) après le tournoi (\d+)(?: :|,) (.+)\. Protégé contre la relégation de fin de saison\.$/, (m, w, l, t, c) => ({ 'Tu es monté': 'You moved up', 'Monté': 'Moved up', 'Tu es descendu': 'You dropped', 'Descendu': 'Dropped' }[w]) + ' from League ' + l + ' after tournament ' + t + ': ' + I18N_CRIT(c) + '. Protected from end-of-season relegation.'],
  [/^(Tu es monté|Monté|Tu es descendu|Descendu) en Ligue (\d) après le tournoi (\d+)(?: :|,) (.+)\. (Tu restes|Reste) au classement de cette ligue, sans y prendre de place\.$/, (m, w, l, t, c, r) => ({ 'Tu es monté': 'You moved up', 'Monté': 'Moved up', 'Tu es descendu': 'You dropped', 'Descendu': 'Dropped' }[w]) + ' to League ' + l + ' after tournament ' + t + ': ' + I18N_CRIT(c) + '. ' + (r === 'Tu restes' ? 'You stay' : 'Stays') + ' in this league’s standings without taking a spot.'],
  [/^Jouait en Ligue (\d) à ce tournoi$/, 'Played in League $1 at this tournament'], [/^Jouait dans une autre ligue \(L1 à L4\)$/, 'Played in another league (L1 to L4)'],
  [/^Top (\d+) et Top (\d+) comptent aussi les victoires\. Coupure = coupures réussies sur tournois joués\.$/, 'Top $1 and Top $2 also count wins. Cut = cuts made over tournaments played.'],
  [/^Index requis après le (\d+)e$/, 'Index required below rank $1'], [/^Dernier promu \((\d+) en ce moment\)$/, 'Last promoted ($1 right now)'], [/^Ligne de promotion \((\d+)e\)$/, 'Promotion line ($1th)'], [/^Ligne de relégation \((\d+)e\)$/, 'Relegation line ($1th)'],
  [/^Les rondes · Ligue (\d)$/, 'Rounds · League $1'], [/^Ronde (\d)$/, 'Round $1'], [/^Trou par trou · Ligue (\d)$/, 'Hole by hole · League $1'], [/^Trou (\d+)$/, 'Hole $1'], [/^Tournoi (\d+)$/, 'Tournament $1'],
  [/^(\d+) tees de ta liste correspondent \((\d+) terrains\) · un terrain différent par tournoi · vent, drapeau et bourse tirés aussi$/, '$1 tees from your list match ($2 courses) · a different course for each tournament · wind and pin drawn too'],
  [/^Drapeau ronde (\d)$/, 'Pin round $1'], [/^Vent ronde (\d)$/, 'Wind round $1'], [/^Drapeau et vent de la ronde (\d) au hasard$/, 'Random pin and wind for round $1'], [/^Par du trou (\d+)$/, 'Par for hole $1'], [/^Index du trou (\d+)$/, 'Index for hole $1'],
  [/^Coller les (\d+) par$/, 'Paste the $1 pars'], [/^Coller les (\d+) index$/, 'Paste the $1 indexes'], [/^Position du tournoi (\d+)$/, 'Tournament $1 position'], [/^(Barrer|Débarrer) le tournoi (\d+)$/, (m, a, t) => (a === 'Barrer' ? 'Lock' : 'Unlock') + ' tournament ' + t],
  [/^★ Majeur en L1 · (.+)$/, (m, n) => '★ Major in L1 · ' + trText(n)], [/^Finale : top (\d+) de la Ligue 1$/, 'Finale: top $1 of League 1'],
  [/^(\d) rondes?$/, (m, n) => I18N_PL(n, 'round')], [/^Changeable seulement entre deux saisons \(avant le 1er tournoi\)\.$/, 'Can only be changed between seasons (before the 1st tournament).'], [/^S’applique dès le prochain tournoi\.$/, 'Applies from the next tournament.'],
  [/^Joueurs qualifiés après la ronde 1 \(plus les égalités\)$/, 'Players making the cut after round 1 (plus ties)'], [/^Partie Duo : tournois d’une ronde\.$/, 'Duo game: one-round tournaments.'],
  [/^(\d+) · après le tournoi (\d+)$/, '$1 · after tournament $2'], [/^(\d+) · fin de saison$/, '$1 · end of season'], [/^(\d+) · après la Finale$/, '$1 · after the Finale'],
  [/^Après chaque tournoi, le jeu garde une copie de ta partie dans ce navigateur \(les (\d+) dernières\)(.*)\.$/, (m, n, x) => 'After each tournament, the game keeps a copy of your game in this browser (the last ' + n + ')' + (x ? ' and, if you chose the Saved Games folder, an auto-1 to auto-' + n + ' file that rotates' : '') + '.'],
  [/^Aucune copie pour l’instant : la première arrive après ton prochain tournoi\.$/, 'No copies yet: the first one comes after your next tournament.'],
  [/^Les sauvegardes vont directement dans le dossier$/, 'Saves go straight into the folder'], [/^Changer de dossier$/, 'Change folder'],
  [/^INTRONISÉ EN (\d+)$/, 'INDUCTED IN $1'], [/^INTRONISÉ EN (\d+) · (\S+) TENTATIVE$/, 'INDUCTED IN $1 · $2 ATTEMPT'], [/^Scrutin de (\d+)$/, '$1 ballot'],
  [/^Il faut ([\d.,]+) ?% des votes\. Sous ([\d.,]+) ?%, ou après (\d+) ans sur le scrutin, le golfeur est rayé\.$/, 'It takes $1% of the vote. Below $2%, or after $3 years on the ballot, the golfer is dropped.'],
  [/^(\S+) année · (\d+) points( ·)?$/, (m, o, p, x) => o + ' year · ' + p + ' points' + (x || '')], [/^1er scrutin · (\d+) points( ·)?$/, (m, p, x) => '1st ballot · ' + p + ' points' + (x || '')],
  [/^(\d+)(?:er|e|st|nd|rd|th) (?:scrutin|année) · (\d+) points · (rayé du scrutin|intronisé)$/, (m, y, p, k) => y + ' · ' + p + ' points · ' + (k === 'intronisé' ? 'inducted' : 'dropped from the ballot')],
  [/^Golfeurs actifs avec au moins (\d+) points \(et toi\)\.$/, 'Active golfers with at least $1 points (and you).'], [/^Carrière en L(\d)$/, 'L$1 career'], [/^Top (\d+) de saison$/, 'Season top $1'],
  [/^Top (\d+) mondial à la fin d’une saison$/, 'World top $1 at a season’s end'], [/^(\d+) saisons après la retraite$/, '$1 seasons after retirement'], [/^, avec au moins (\d+) points\. Environ$/, ', with at least $1 points. About'],
  [/^(\d+) à (\d+)$/, '$1 to $2'], [/^([\d.,]+) ?% des votes · (\d+) points ·$/, '$1% of the vote · $2 points ·'], [/^Intronisé en (\d+)( · au premier scrutin| · à sa (\S+) année sur le scrutin)?$/, (m, y, x, o) => 'Inducted in ' + y + (x ? (o ? ' · in his ' + o + ' year on the ballot' : ' · on the first ballot') : '')],
  [/^Temple de la renommée, intronisé en (\d+)$/, 'Hall of Fame, inducted in $1'],
  [/^Les recrues arrivées sur le circuit à l’intersaison (\d+) · classées par les dépisteurs$/, 'Rookies who joined the tour in the $1 offseason · ranked by the scouts'], [/^RECRUE DE L’ANNÉE (\d+)$/, 'ROOKIE OF THE YEAR $1'],
  [/^Classe de (\d+) · (\d+) points en Ligue (\d)(?: · (\d+) victoires?)?$/, (m, y, p, l, w) => 'Class of ' + y + ' · ' + p + ' points in League ' + l + (w ? ' · ' + I18N_PL(w, 'win') : '')], [/^(\d+) à (\d+) ans$/, 'ages $1 to $2'],
  [/^Le top (\d+) des dépisteurs$/, 'The scouts’ top $1'], [/^(\d+) étoiles? sur (\d+)$/, '$1 of $2 stars'], [/^(\S+) choix des dépisteurs$/, 'Scouts’ $1 pick'],
  [/^Ton départ : (.+) \(groupe (\d+)\)$/, 'Your tee time: $1 (group $2)'], [/^dans (\d+) min$/, 'in $1 min'], [/^dans (\d+) h (\d+)$/, 'in $1 h $2'], [/^(\d+) golfeurs? sur le terrain(?: · (\d+) terminés?)?$/, (m, a, b) => a + ' on the course' + (b ? ' · ' + b + ' finished' : '')], [/^En tête : (.+) \((.+), (\d+) trous?\)\.$/, (m, n, s, k) => 'Leader: ' + n + ' (' + s + ', ' + k + ' hole' + (k > 1 ? 's' : '') + ').'], [/^En tête : (.+) \((.+), terminé\)\.$/, 'Leader: $1 ($2, finished).'], [/^En tête : (.+) \((.+), pas encore parti\)\.$/, 'Leader: $1 ($2, not yet teed off).'], [/^(\d+) tees? correspondent \((\d+) terrains?\)$/, (m, a, b) => a + ' tee' + (a > 1 ? 's' : '') + ' match (' + b + ' course' + (b > 1 ? 's' : '') + ')'], [/^sur (\d+)$/, 'of $1'], [/^· (\S+) sur (\d+)$/, '· $1 of $2'], [/^Niveau (.+)$/, 'Level $1'], [/^en (\d{4})$/, 'in $1'], [/^Finale \(top (\d+)\)$/, 'Finale (top $1)'], [/^tournoi (\d+) · (\d+) terrains?$/, (m, a, b) => 'tournament ' + a + ' · ' + b + ' course' + (b > 1 ? 's' : '')], [/^tournoi (\d+) · filtres$/, 'tournament $1 · filters'], [/^après le tournoi (\d+) · (\d+) terrains?$/, (m, a, b) => 'after tournament ' + a + ' · ' + b + ' course' + (b > 1 ? 's' : '')], [/^après le tournoi (\d+) · filtres$/, 'after tournament $1 · filters'], [/^Coupure estimée : (.+)$/, 'Projected cut: $1'], [/^Coupure actuelle : (.+)$/, 'Current cut: $1'], [/^Estimation dès que le tiers des trous de la ronde sera joué \((\d+) %\)$/, 'Estimate once a third of the round’s holes are played ($1%)'], [/^(\d+) % des trous de la ronde joués$/, '$1% of the round’s holes played'], [/^(\d+) moments?$/, (m, n) => n + ' moment' + (n > 1 ? 's' : '')], [/^à (\d+) coups?$/, (m, n) => 'by ' + n + ' stroke' + (n > 1 ? 's' : '')], [/^🔥 Une rivalité est née entre toi et (.+)\.$/, '🔥 A rivalry is born between you and $1.'], [/^(\d+) titres? de L1$/, (m, n) => n + ' L1 title' + (n > 1 ? 's' : '')], [/^(\d+) ans · (.+)$/, (m, a, r) => 'Age ' + a + ' · ' + r.split(' · ').map(trText).join(' · ')], [/^Retraité en (\d+) à (\d+) ans · (.+)$/, (m, y, a, c) => 'Retired in ' + y + ' at age ' + a + ' · ' + c],
  [/^Champion (Tour|Pro|Semi-Pro|Amateur) : (.+?) · (\d+) retraites? · (\d+) changements? de palier$/, (m, l, n, r, c) => l + ' champion: ' + n + ' · ' + I18N_PL(r, 'retirement') + ' · ' + I18N_PL(c, 'tier change')],
  [/^Tournoi (\d+) · (.+)$/, (m, t, n) => 'Tournament ' + t + ' · ' + n.split(' · ').map(x => trText(x).replace(/^bourse totale /, 'total purse ')).join(' · ')],
  [/^(\d+) tournois joués(?: en (.+))?$/, (m, n, l) => n + ' tournaments played' + (l ? ' in ' + l : '')], [/^Série en cours : (\d+)$/, 'Current streak: $1'], [/^Top (\d+) d’affilée$/, 'Consecutive top $1'], [/^Mes places dans les top (\d+)$/, 'My spots in the top $1'],
  [/^(Tour|Pro|Semi-Pro|Amateur) · (.+) :$/, (m, l, x) => l + ' · ' + trText(x) + ':'], [/^Comptés seulement en Ligue (\d) · (.+)\. Une série repart à zéro quand on change de ligue\.$/, 'Counted only in League $1 · $2. A streak resets when changing leagues.'],
  [/^Top (\d+) en carrière$/, 'Career top $1'], [/^Meilleur total \((\d+) rondes\)$/, 'Best total ($1 rounds)'],
  [/^Nombre de golfeurs par groupe de paliers, les (\d+) ligues ensemble, à la fin de chaque saison\.$/, 'Number of golfers by tier group, all $1 leagues together, at the end of each season.'],
  [/^Paliers de la Ligue (\d)$/, 'League $1 tiers'], [/^La Ligue (\d) année par année$/, 'League $1 year by year'], [/^Ligue (\d) année par année$/, 'League $1 year by year'], [/^Part de chaque cohorte qui atteint la Ligue (\d)$/, 'Share of each cohort reaching League $1'],
  [/^Recrues arrivées en Ligue (\d) cette année-là\. Les cohortes récentes ont encore le temps de monter\.$/, 'Rookies who arrived in League $1 that year. Recent cohorts still have time to move up.'],
  [/^Part de chaque cohorte de recrues qui atteint la Ligue (\d)$/, 'Share of each rookie cohort reaching League $1'], [/^Au moins (\d+) saisons d’ancienneté, classées selon la part qui a atteint la Ligue (\d)\.$/, 'At least $1 seasons of seniority, ranked by the share that reached League $2.'],
  [/^([\d.,]+) ?% en L(\d)$/, '$1% in L$2'], [/^(\d+) vainqueurs? en L(\d)$/, '$1 winners in L$2'], [/^En L(\d)$/, 'In L$1'],
  [/^« Vainqueurs » : recrues qui ont gagné au moins un tournoi, toutes ligues\. La meilleure carrière se mesure aux victoires en Ligue (\d)\.$/, '“Winners”: rookies who won at least one tournament, any league. The best career is measured by League $1 wins.'],
  [/^Sur (\d+) tournois\. Plus le nombre est haut, plus la ligue est ouverte\.$/, 'Out of $1 tournaments. The higher the number, the more open the league.'], [/^Dynasties · Ligue (\d)$/, 'Dynasties · League $1'], [/^(\d+) victoires \+$/, '$1+ wins'],
  [/^Victoires en Ligue (\d) par pays$/, 'League $1 wins by country'], [/^(.+) : (\d+) victoires? en L(\d)$/, (m, c, n, l) => c + ': ' + I18N_PL(n, 'win') + ' in L' + l], [/^Le plus de victoires en Ligue (\d)\.$/, 'Most wins in League $1.'],
  [/^Golfeurs par pays · Ligue (\d)$/, 'Golfers by country · League $1'], [/^Victoires L(\d)$/, 'L$1 wins'], [/^Titres L(\d)$/, 'L$1 titles'],
  [/^Golfeurs actuellement sur le circuit ; victoires et titres de champion de la Ligue (\d) dans toute l’histoire\.$/, 'Golfers currently on the tour; League $1 wins and championship titles in all of history.'],
  [/^Coups au-dessus du par en moyenne, toutes ligues, sur les cartes encore gardées \((\d+) dernières saisons\)\.$/, 'Strokes over par on average, all leagues, from the scorecards still kept (last $1 seasons).'],
  [/^Part du top (\d+)$/, 'Top-$1 share'], [/^Part du top (\d+) : ce que les (\d+) golfeurs les mieux payés de la ligue ont touché sur l’ensemble des gains de la saison\.$/, 'Top-$1 share: what the league’s $2 best-paid golfers earned out of the season’s total prize money.'],
  [/^(\d+) · Retraites : (\d+) · Forcées : (\d+) · Déplacés : (\d+)$/, '$1 · Retirements: $2 · Forced: $3 · Moved: $4'],
  [/^Fin de la saison (\d+)$/, 'End of the $1 season'], [/^Saison (\d+) : tu n’étais pas en activité\.$/, 'Season $1: you weren’t active.'], [/^Course finale en Ligue (\d)$/, 'Final race in League $1'],
  [/^Descendus en cours de saison en Ligue (\d) :$/, 'Dropped mid-season to League $1:'], [/^Changements de palier · (\d+)$/, 'Tier changes · $1'], [/^Montent d’un palier ou plus · (\d+)$/, 'Up one tier or more · $1'],
  [/^La classe de (\d+) · (\d+) recrues$/, 'The class of $1 · $2 rookies'], [/^Classement final · (.+)$/, 'Final standings · $1'], [/^(\S+) titre de champion de ligue$/, '$1 league title'],
  [/^Seuls les (\d+) meilleurs au monde sont classés\. Mouvement depuis la dernière intersaison\.$/, 'Only the world’s top $1 are ranked. Movement since the last offseason.'], [/^Font leur entrée dans le top (\d+)$/, 'Enter the top $1'],
  [/^Relégués en Ligue (\d) \(les (\d+) derniers\) : dont$/, 'Relegated to League $1 (bottom $2): including'],
  [/^CÉRÉMONIE D’INTRONISATION · (\d+)$/, 'INDUCTION CEREMONY · $1'], [/^(Une légende rejoint|Ta carrière rejoint|(\d+) légendes rejoignent) (?:les (\d+) membres? du Temple|le Temple, qui accueille ses premiers membres)$/, (m, w, n, k) => (n ? n + ' legends join' : w === 'Ta carrière rejoint' ? 'Your career joins' : 'A legend joins') + (k ? ' the ' + k + ' members of the Hall of Fame' : ' the Hall of Fame, which welcomes its first members')],
  [/^(\d+) – (\d+)(?: · (\d+) saisons?(?:, dont (\d+) en Ligue (\d))?)?(?: · retraité à (\d+) ans)?$/, (m, a, b, n, k, l, ag) => a + ' – ' + b + (n ? ' · ' + I18N_PL(n, 'season') + (k ? ', ' + k + ' in League ' + l : '') : '') + (ag ? ' · retired at ' + ag : '')],
  [/^Sa saison (\d+) : (\d+) victoires?( dont (\d+) Majeurs?)?((?:, la Finale)?)(, et le titre de la (?:L1|Ligue 1))?\.$/, (m, y, w, x, mj, f, t) => 'His ' + y + ' season: ' + I18N_PL(w, 'win') + (mj ? ' including ' + I18N_PL(mj, 'Major') : '') + (f ? ', the Finale' : '') + (t ? ', and the League 1 title' : '') + '.'],
  [/^([\d.,]+) ?% l’an passé : (il entre|tu entres) à sa (\S+) tentative\.$/, (m, p, w, o) => p + '% last year: ' + (w === 'tu entres' ? 'you get in' : 'he gets in') + ' on attempt number ' + o.replace(/\D/g, '') + '.'],
  [/^Il faut ([\d.,]+) ?% des votes \(le trait\)\.(?: L’an prochain, (\d+) nouvel(?:s)? admissibles?, dont)?$/, (m, p, n) => 'It takes ' + p + '% of the vote (the line).' + (n ? ' Next year, ' + n + ' newly eligible, including' : '')],
  [/^(\S+) année · reviendra l’an prochain$/, '$1 year · back next year'], [/^1er scrutin · reviendra l’an prochain$/, '1st ballot · back next year'], [/^(\S+) (?:année|scrutin) · (?:sous (\d+) ?% : )?rayé du scrutin$/, (m, o, p) => o + ' ' + 'year · ' + (p ? 'below ' + p + '%: ' : '') + 'dropped from the ballot'],
  [/^… et (\d+) autres?\.$/, (m, n) => '… and ' + n + ' more.'],
  [/^([\d.,]+) ?% de la bourse L(\d)$/, '$1% of the L$2 purse'], [/^≈ (\d+) golfeurs Generational en même temps \(de (\d+) à (\d+) selon les époques\)\.$/, '≈ $1 Generational golfers at once ($2 to $3 depending on the era).'],
  [/^≈ (\d+) golfeurs? Generational en même temps\.$/, '≈ $1 Generational golfers at once.'], [/^≈ (.+) par saison$/, '≈ $1 per season'], [/^Environ une fois aux (\d+) saisons, jamais deux à la fois\.$/, 'About once every $1 seasons, never two at a time.'],
  [/^Accentue les décennies fortes et faibles \(jusqu’à (\d+) Generational en même temps\)\.$/, 'Accentuates strong and weak decades (up to $1 Generational at once).'], [/^Plus haut = les favoris gagnent plus souvent\. Touche aussi l’accès à la L1 pour toi\.$/, 'Higher = favorites win more often. Also affects your access to L1.'],
  [/^Un handicap pour les paliers Elite, Hall Of Famer et Generational\. Fort = comme avant la v(\d+)\.$/, 'A handicap for the Elite, Hall Of Famer and Generational tiers. Strong = as before v$1.'], [/^([\d.,]+) ?% des rondes$/, '$1% of rounds'],
  [/^Tournois (\d+), (\d+), (\d+) et (\d+) : points ×(\d+) et bourse ×([\d.,]+)\. Les noms se changent dans (?:Réglages|Options) › Affichage\.$/, 'Tournaments $1, $2, $3 and $4: points ×$5 and purse ×$6. Names can be changed in Options › Display.'],
  [/^Tournois (\d+), (\d+), (\d+) et (\d+) de la Ligue 1\. Le nom s’applique aux prochains Majeurs\.$/, 'Tournaments $1, $2, $3 and $4 of League 1. The name applies to upcoming Majors.'],
  [/^Finale \((\d+)e tournoi\)$/, 'Finale ($1th tournament)'], [/^Jamais relégué pendant la saison de la victoire et les (\d+) suivantes, dans la ligue de la victoire \(ou plus bas\)\. La montée reste possible\.$/, 'Never relegated during the season of the win and the next $1, in the league of the win (or lower). Promotion is still possible.'],
  [/^Une seule fois par carrière, un golfeur avec (\d+) victoires en L1 évite la relégation de la L1 et reste jusqu’à la fin de la saison suivante\.$/, 'Once per career, a golfer with $1 L1 wins avoids relegation from L1 and stays through the end of the following season.'],
  [/^Retraite forcée après X saisons en L(\d)$/, 'Forced retirement after X seasons in L$1'], [/^≈ (\d+) intronisés? aux (\d+) à (\d+) saisons\.$/, '≈ $1 inductee every $2 to $3 seasons.'], [/^≈ (\d+) intronisés? par saison ou presque\.$/, '≈ $1 inductee per season or so.'], [/^≈ (\d+) intronisés? aux (\d+) saisons\.$/, '≈ $1 inductee every $2 seasons.'],
  [/^Effet estimé \(simulation de (\d+) saisons\)$/, 'Estimated effect ($1-season simulation)'], [/^Le n°1 finit top (\d+) : (.+)$/, 'No. 1 finishes top $1: $2'], [/^([\d,.]+\s?%) des tournois$/, (m, p) => p.replace(/\s/, '').replace(',', '.') + ' of tournaments'],
  [/^Top 5 gagnent$/, 'Top 5 win'], [/^Tester \(simuler (\d+) saisons\)$/, 'Test (simulate $1 seasons)'], [/^Course rating neutre \(pour un par (\d+)\)$/, 'Neutral course rating (for a par $1)'],
  [/^Suit le par : avec (.+), un par (\d+) est neutre à (.+) et un par (\d+) à (.+)\. Chaque point de plus ajoute un coup par ronde\.$/, 'Follows par: with $1, a par $2 is neutral at $3 and a par $4 at $5. Each extra point adds a stroke per round.'],
  [/^Phénomènes rares \(un golfeur dominant, environ une fois aux (\d+) saisons\)$/, 'Rare phenoms (a dominant golfer, about once every $1 seasons)'], [/^Bourse d’un tournoi de L(\d)$/, 'L$1 tournament purse'], [/^Part de la Ligue (\d)$/, 'League $1 share'],
  [/^Points pour une coupure ratée \((\d+) par défaut\)$/, 'Points for a missed cut ($1 by default)'], [/^· de (\d+) à (\d+) coups$/, '· from $1 to $2 strokes'],
  [/^Une seule ronde de (\d+) trous, sans coupure\.$/, 'A single $1-hole round, no cut.'], [/^· (\d+) sur (\d+)$/, '· $1 of $2'], [/^Nom du joueur (\d+)$/, 'Player $1 name'], [/^(\d+) golfeurs de ta Ligue (\d), tirés au hasard\.$/, '$1 golfers from your League $2, drawn at random.'],
  [/^(.+) · ronde (\d)( simulée)? · (.+)$/, (m, c, r, s2, w) => c + ' · round ' + r + (s2 ? ' simulated' : '') + ' · ' + w], [/^Trou (\d+) sur (\d+)$/, 'Hole $1 of $2'], [/^· coupure actuelle : (.+)$/, '· current cut: $1'],
  [/^L(\d) · toi$/, 'L$1 · you'], [/^Coupure : (.+)$/, 'Cut: $1'], [/^Payés jusqu’à : (.+)$/, 'Paid through: $1'],
  [/^Trou (\d+) \(par (\d)\) : (\d+), (.+?)\. (.+)$/, (m, h, p, s2, w, rest) => 'Hole ' + h + ' (par ' + p + '): ' + s2 + ', ' + trText(w) + '. ' + rest.split(/(?<=\.) /).map(x => trText(x)).join(' ')],
  [/^Tu glisses du (\S+) au (\S+) rang\.$/, 'You slip from $1 to $2.'], [/^Tu montes du (\S+) au (\S+) rang\.$/, 'You climb from $1 to $2.'], [/^Tu restes au (\S+) rang\.$/, 'You stay $1.'], [/^En tête : (.+)\.$/, 'Leader: $1.'],
  [/^(.+) \((\S+)\) : (trou d’un coup|albatros|aigle sur un par 4) au (\d+)\.$/, (m, n, p, k, h) => n + ' (' + p + '): ' + ({ 'trou d’un coup': 'hole-in-one', 'albatros': 'albatross', 'aigle sur un par 4': 'eagle on a par 4' }[k]) + ' on ' + h + '.'],
  [/^Ligue (\d) · (.+) · (?:après (\d+) trous?|ronde terminée|avant le départ) · ronde (\d)$/, (m, l, n, h, r) => 'League ' + l + ' · ' + n + ' · ' + (h ? 'after ' + I18N_PL(h, 'hole') : /terminée/.test(m) ? 'round complete' : 'before the start') + ' · round ' + r],
  [/^Ronde (\d) terminée$/, 'Round $1 complete'], [/^T?(\d+) sur (\d+) · (\d+) coups$/, (m, p, n, s2) => (m[0] === 'T' ? 'T' : '') + p + ' of ' + n + ' · ' + s2 + ' strokes'], [/^Avec (\d+) coups? de marge\.$/, (m, n) => 'With ' + I18N_PL(n, 'stroke') + ' to spare.'],
  [/^Tu es (\S+) à (.+)$/, 'You’re $1 at $2'], [/^Simuler le trou (\d+)$/, 'Simulate hole $1'],
  [/^Tournoi (\d+) · Ligue (\d) · (.+) · bourse totale (.+)$/, 'Tournament $1 · League $2 · $3 · total purse $4'], [/^(\d+) points · (\S+) · classement de saison : (\S+) → (\S+)$/, '$1 points · $2 · season standing: $3 → $4'],
  [/^Tu conserves la tête du classement \((\d+) points\), avec (\d+) points d’avance\.$/, 'You keep the standings lead ($1 points), $2 points ahead.'], [/^Tu prends la tête du classement \((\d+) points\), à la place de$/, 'You take the standings lead ($1 points), replacing'],
  [/^Saison (\d+) · tournoi (\d+) · (?:(.+) · )?par (\d+)(?: · bourse totale (.+))?$/, (m, y, t, mj, p, b) => 'Season ' + y + ' · tournament ' + t + ' · ' + (mj ? trText(mj) + ' · ' : '') + 'par ' + p + (b ? ' · total purse ' + b : '')],
  [/^Saison (\d+) · Finale, top (\d+) de la L1 · par (\d+)(?: · bourse totale (.+))?$/, (m, y, n, p, b) => 'Season ' + y + ' · Finale, top ' + n + ' of L1 · par ' + p + (b ? ' · total purse ' + b : '')],
  [/^Coupure à (\S+)(?: · Majeur : points (?:doublés|×[\d,]+))?(?: · prolongation pour la victoire)?$/, m => m.replace(/^Coupure à (\S+)/, 'Cut at $1').replace(' · Majeur : points doublés', ' · Major: double points').replace(/ · Majeur : points ×([\d,]+)/, (x, v) => ' · Major: points ×' + v.replace(',', '.')).replace(' · prolongation pour la victoire', ' · playoff for the win')],
  [/^Une ronde · payés jusqu’à (\S+)(?: · prolongation pour la victoire)?$/, m => m.replace(/^Une ronde · payés jusqu’à (\S+)/, 'One round · paid through $1').replace(' · prolongation pour la victoire', ' · playoff for the win')],
  [/^Aucune coupure · points doublés(?: · prolongation pour la victoire)?$/, m => m.replace('Aucune coupure · points doublés', 'No cut · double points').replace(' · prolongation pour la victoire', ' · playoff for the win')],
  [/^Résultats finaux · Ligue (\d) · (.+)$/, 'Final results · League $1 · $2'], [/^Ligue (\d) · (.+) · Résultats finaux$/, 'League $1 · $2 · Final results'], [/^Cartes ronde (\d)$/, 'Round $1 cards'], [/^Cartes de scores · (?:ronde (\d)|ronde unique)$/, (m, r) => 'Scorecards · ' + (r ? 'round ' + r : 'single round')],
  [/^LIGUE (\d) · (TOUR|PRO|SEMI-PRO|AMATEUR) ·(?: MAJEUR · (.+) ·)?$/, (m, l, n, mj) => 'LEAGUE ' + l + ' · ' + n + ' ·' + (mj ? ' MAJOR · ' + trText(mj.replace(/\S+/g, w => w[0] + w.slice(1).toLowerCase())).toUpperCase() + ' ·' : '')],
  [/^FINALE · TOP (\d+) DE LA LIGUE 1 ·$/, 'FINALE · TOP $1 OF LEAGUE 1 ·'], [/^LA UNE · LIGUE (\d) · (.+)$/, 'HEADLINE · LEAGUE $1 · $2'], [/^Bourse L(\d)$/, 'L$1 purse'], [/^(\S+) après R(\d) → (\S+)$/, '$1 after R$2 → $3'],
  [/^Au trou (\d+) \(par (\d)\) de la ronde (\d),$/, 'On hole $1 (par $2) in round $3,'], [/^La coupure tombe à (\S+) : (\d+) golfeurs? la manquent d’un seul coup\.$/, (m, c, n) => 'The cut falls at ' + c + ': ' + I18N_PL(n, 'golfer') + ' miss it by a single shot.'],
  [/^La coupure tombe à (\S+) : (\d+) joueurs poursuivent\.$/, 'The cut falls at $1: $2 players continue.'], [/^Tu empoches (\d+) points\.$/, 'You pocket $1 points.'], [/^À (\d+) ans,$/, 'At $1,'],
  [/^(Aigles ou mieux|Doubles ou pire)(?: :)? (\d+)$/, (m, k, n) => (k === 'Aigles ou mieux' ? 'Eagles or better' : 'Doubles or worse') + (m.includes(':') ? ': ' : ' ') + n],
  [/^Personne ne quitte la Ligue (\d) après ce tournoi\.$/, 'No one leaves League $1 after this tournament.'], [/^Points gagnés en Ligue (\d) depuis le début de la saison\.$/, 'Points earned in League $1 since the start of the season.'],
  [/^… et (\d+) autres? aigles? sur un par (\d)\.$/, (m, n, p) => '… and ' + n + ' more ' + (n > 1 ? 'eagles' : 'eagle') + ' on a par ' + p + '.'], [/^(\d+) des (\d+) premiers du classement ratent la coupure\.$/, '$1 of the top $2 in the standings miss the cut.'],
  [/^Surprise : le (\S+) du classement s’impose à (.+)$/, 'Surprise: the No. $1 in the standings wins at $2'.replace('No. $1', '$1-ranked')], [/^Premier titre en carrière, et tu réussis le coup en Ligue (\d) · (.+)$/, 'First career title, and you pull it off in League $1 · $2'],
  [/^Résultats · (.+)$/, 'Results · $1'], [/^: (\S+) avec (\d+) points · (.+)$/, (m, o, p, r) => ': ' + o + ' with ' + p + ' points · ' + r.split(' · ').map(trText).join(' · ')],
  [/^Exemption unique de carrière \((\d+) victoires en L1\) : (disponible|utilisée en (\d+))\.$/, (m, n, s2, y) => 'One-time career exemption (' + n + ' L1 wins): ' + (y ? 'used in ' + y : 'available') + '.'],
  [/^🛡 Exempté de relégation jusqu’à la fin de (\d+) : (.+?)\.$/, (m, y, t) => '🛡 Exempt from relegation through the end of ' + y + ': ' + I18N_EXTIP(t) + '.'],
  [/^(\d+) sur (\d+)$/, '$1 of $2'], [/^Palier (\d+) sur (\d+)$/, 'Tier $1 of $2'], [/^Champion de la Ligue (\d) · (.+), saison (\d+)$/, 'League $1 · $2 champion, season $3'], [/^(\S+) place de la Ligue (\d) · (.+), saison (\d+)$/, (m, o, l, n, y) => I18N_ORDX(o) + ' place in League ' + l + ' · ' + n + ', season ' + y],
  [/^Ligue (\d) · (.+) · (stable|▲.*|▼.*)$/, (m, l, n, s2) => 'League ' + l + ' · ' + n + ' · ' + (s2 === 'stable' ? 'stable' : trText(s2))], [/^(\d+) derniers tournois$/, 'Last $1 tournaments'],
  [/^Évolution de l’handicap sur (\d+) tournois(, comparée à la médiane et au meilleur de la ligue)?$/, (m, n, x) => 'Handicap trend over ' + n + ' tournaments' + (x ? ', compared with the league median and best' : '')], [/^Plus bas (.+)$/, 'Low $1'],
  [/^PAR (\d)$/, 'PAR $1'], [/^Carrière · ([\d,  ]+) trous joués\. Sous la moyenne : l’écart avec le par, puis la moyenne de tout le circuit\.$/, 'Career · $1 holes played. Under the average: the gap to par, then the whole tour’s average.'],
  [/^(\d+) meilleures rondes$/, '$1 best rounds'], [/^(\d+) meilleurs totaux de tournoi$/, '$1 best tournament totals'], [/^(\d+) gagnés, (\d+) perdus$/, '$1 won, $2 lost'], [/^Ton profil · Ligue (\d) · (.+)$/, 'Your profile · League $1 · $2'], [/^Ton profil · (\d+) ans · Ligue (\d) · (.+)$/, 'Your profile · Age $1 · League $2 · $3'], [/^Ton profil · (\d+) ans$/, 'Your profile · Age $1'],
  [/^Progression du niveau par palier, de (.+) \((\d+)\) à (.+) \((\d+)\)$/, 'Level progress by tier, from $1 ($2) to $3 ($4)'], [/^Relégué : (\S+) sur (\d+), fin de saison$/, 'Relegated: $1 of $2, end of season'], [/^Promu : (.+), en cours de saison$/, (m, c) => 'Promoted: ' + I18N_CRIT(c) + ', mid-season'],
  [/^Promu : (\S+) sur (\d+), fin de saison$/, 'Promoted: $1 of $2, end of season'], [/^(.+), à la fin de la saison (\d+) · (.+)$/, (m, a, y, r) => a + ', at the end of the ' + y + ' season · ' + r.split(' · ').map(trText).join(' · ')],
  [/^(\d+) victoires? L1 · (\d+)$/, (m, n, p) => I18N_PL(n, 'L1 win') + ' · ' + p], [/^(\d+) (titres?|tops? 3|tops? 10|saisons? n°1 mondial|tops? 10 mondial|Majeurs?|Finales?) · (\d+)$/, (m, n, k, p) => trText(n + ' ' + k) + ' · ' + p]
);

/* ---- Étape 2, deuxième passe ---- */
const I18N_ORDX = x => { const m = String(x).match(/^(\d+)(?:e|er|re|st|nd|rd|th)$/); return m ? ord(+m[1]) : x; };
Object.assign(I18N_EN, {
  'retraité': 'retired', 'retraitée': 'retired', '(en cours)': '(ongoing)', 'en cours': 'ongoing', 'joué': 'played', 'relégué ▼': 'relegated ▼', 'promu ▲': 'promoted ▲',
  'Tape pour chercher dans ta liste': 'Type to search your list', 'Rechercher un terrain dans ta liste': 'Search your course list',
  'à leur arrivée': 'on arrival', 'valeurs sûres': 'sure bets', 'nations les plus représentées': 'most represented nations', 'nation la plus représentée': 'most represented nation',
  'Au-dessus de la moyenne': 'Above average', 'Sous la moyenne': 'Below average', 'recrues': 'rookies',
  'meilleur score de la ronde': 'best score of the round', 'places gagnées ou perdues depuis la ronde 1': 'places gained or lost since round 1', 'sous R1 : rang après la ronde 1': 'under R1: rank after round 1',
  'moyenne du champ, ronde 1': 'field average, round 1', 'moyenne, ronde 2 (qualifiés)': 'average, round 2 (made the cut)', 'moyenne du champ': 'field average',
  'A dépassé les attentes': 'Exceeded expectations', 'N’a pas atteint ce qu’on attendait': 'Fell short of expectations', 'Encore en développement': 'Still developing', 'Fidèle aux attentes': 'Lived up to expectations',
  'médiane de la ligue': 'league median', 'meilleur de la ligue': 'league best', '▲ en amélioration': '▲ improving', '▼ en recul': '▼ declining',
  'victoire': 'win', 'victoires': 'wins', 'titre de saison': 'season title', 'titres de saison': 'season titles', 'saison': 'season', 'saisons': 'seasons',
  'Bête noire': 'Nemesis', 'Bêtes noires': 'Nemeses', 'Souffre-douleur': 'Punching bag', 'Souffre-douleurs': 'Punching bags',
  'de suite': 'in a row', 'dont forcées': 'of which forced', 'Retraites (= recrues)': 'Retirements (= rookies)',
  'La saison en chiffres': 'The season in numbers', 'vainqueurs différents': 'different winners', 'vainqueur': 'winner', 'de bourses distribuées': 'in purses paid out',
  'record de ligue battu': 'league record broken', 'records de ligue battus': 'league records broken', 'Font leur entrée dans le top 100': 'Entering the top 100', 'Fait son entrée dans le top 100': 'Entering the top 100',
  'sort du classement': 'drops out of the rankings', 'Plus fortes chutes': 'Biggest drops', 'Plus fortes montées': 'Biggest climbs', 'saisons n°1': 'seasons at No. 1', 'saison n°1': 'season at No. 1',
  'Tu as raté la coupure': 'You missed the cut', 'Tu ne joues pas la ronde 2, mais tu peux la regarder se dérouler.': 'You don’t play round 2, but you can watch it unfold.',
  'Simuler la ronde 2 trou par trou': 'Simulate round 2 hole by hole', 'Simuler la ronde 2 d’un coup': 'Simulate round 2 all at once', 'au classement,': 'in the standings,',
  'Résultats du vote': 'Voting results', 'assez pour être élu, une fois admissible': 'enough to be elected, once eligible',
  'Coups moyens par type de trou, puis birdies ou mieux, bogeys et doubles bogeys ou pire par ronde ; aigles, albatros et trous d’un coup : total de la saison.': 'Average strokes by hole type, then birdies or better, bogeys and double bogeys or worse per round; eagles, albatrosses and holes-in-one: season total.',
  'Les dix terrains de la saison, dans l’ordre où ils se jouent. Le cadenas barre un terrain : ni son contenu, ni sa place, ni le tirage ne peuvent le changer pendant la saison en cours (tout se débarre à la nouvelle saison). Le menu à gauche change l’ordre (les deux tournois échangent leur place). Le course rating et le slope influencent la difficulté pour tout le monde ; le vent l’augmente aussi.': 'The season’s ten courses, in the order they’re played. The padlock locks a course: neither its content, its slot nor the draw can change it during the current season (everything unlocks at the new season). The menu on the left changes the order (the two tournaments swap places). Course rating and slope affect difficulty for everyone; wind adds to it too.',
  'En cours de saison, on monte d’une ligue avec 1 victoire + 1 autre top-3, 3 top-5, 4 top-10 ou 5 top-20, et on descend avec 5 tournois dans les 30 derniers ou 3 dans les 10 derniers, comptés depuis le début de la saison ou depuis l’arrivée dans la ligue. En fin de saison, les 10 premiers montent et les 10 derniers descendent.': 'During the season, you move up a league with 1 win + 1 other top-3, 3 top-5s, 4 top-10s or 5 top-20s, and you move down with 5 finishes in the bottom 30 or 3 in the bottom 10, counted from the start of the season or from your arrival in the league. At the end of the season, the top 10 move up and the bottom 10 move down.',
  'Ta banque de terrains, commune à toutes tes parties : entre un terrain une fois avec tous ses tees, puis charge-le dans n’importe quel tournoi de la saison (nom, puis couleur des tees). Le vent et la position du drapeau se choisissent par tournoi.': 'Your course bank, shared by all your games: enter a course once with all its tees, then load it into any tournament of the season (name, then tee color). Wind and pin position are chosen per tournament.',
  'Par année. Les recrues comblent les places des retraités, leurs nombres sont donc presque identiques. Les déplacés sont les golfeurs promus ou relégués avant la fin de la saison.': 'By year. Rookies fill the spots of retired golfers, so their numbers are almost identical. Moved golfers are those promoted or relegated before the end of the season.',
  'En saison : promus ou relégués avant la fin de la saison. Carrière (durée moyenne en saisons), âge à la retraite et âge au sommet : golfeurs qui ont pris leur retraite cette année-là. Le sommet est la saison où leur niveau était le plus haut.': 'Mid-season: promoted or relegated before the end of the season. Career (average length in seasons), retirement age and peak age: golfers who retired that year. The peak is the season when their level was highest.',
  'Moyenne : score par ronde par rapport au par de toutes les rondes jouées sur ce terrain, les 4 ligues ensemble (le même champ chaque fois, donc comparable d’un terrain à l’autre).': 'Average: score per round relative to par for every round played on this course, all 4 leagues together (the same field each time, so comparable from one course to another).',
  'Toutes les possibilités pour chaque type de trou, réglables jusqu’à 3 décimales. Le par est le reste et se recalcule tout seul. Ces valeurs décrivent un joueur moyen ; le niveau de chaque golfeur décale ensuite les résultats ordinaires.': 'Every outcome for each hole type, adjustable to 3 decimals. Par is the remainder and recalculates itself. These values describe an average player; each golfer’s level then shifts the ordinary results.',
  'Le trou d’un coup, l’aigle sur un par 4 et l’albatros sont des événements rares : ce sont les taux de la Ligue 1 (repères du PGA Tour). Ils diminuent ensuite de ligue en ligue.': 'The hole-in-one, the eagle on a par 4 and the albatross are rare events: these are League 1 rates (PGA Tour benchmarks). They then decrease from league to league.',
  'Points par position (1er, 2e, 3e…), séparés par des virgules. La dernière valeur s’applique aux positions suivantes. Les égalités se partagent la moyenne.': 'Points by position (1st, 2nd, 3rd…), separated by commas. The last value applies to all following positions. Ties share the average.',
  'Colle une liste, un nom par ligne. Les noms sont attribués, du meilleur au moins bon, aux golfeurs de la ligue choisie (ton nom n’est pas touché).': 'Paste a list, one name per line. Names are assigned, from best to worst, to the golfers of the chosen league (your name isn’t touched).',
  'Les valeurs par défaut ont été calibrées par simulation (40 saisons). Le trait blanc sur chaque curseur montre la valeur par défaut. Les réglages sont propres à cette partie.': 'Default values were calibrated by simulation (40 seasons). The white mark on each slider shows the default value. Settings are specific to this game.',
  'Coups ajoutés par ronde aux golfeurs simulés. Toi, tu subis le vrai vent de GSPro. La fréquence du vent se règle plus bas, dans « Autres réglages du moteur ».': 'Strokes added per round to simulated golfers. You face the real GSPro wind. Wind frequency is set further down, in “Other engine settings”.',
  'Les changements s’appliquent aux prochains tournois. La régularité est tirée à la création de chaque golfeur (environ 15% très réguliers, 20% réguliers, 30% moyens, 20% irréguliers, 15% montagnes russes) ; « Tirer de nouveaux coefficients » redistribue tout le circuit selon ces proportions. « Variabilité des terrains » agit sur le générateur de terrains aléatoires (bouton « Générer des statistiques aléatoires »), l’aléa propre au terrain et la météo : 1× est le réglage recommandé. Les terrains que tu as réglés à la main gardent leur course rating et leur slope.': 'Changes apply to upcoming tournaments. Consistency is drawn when each golfer is created (about 15% very consistent, 20% consistent, 30% average, 20% inconsistent, 15% roller coasters); “Draw new coefficients” redistributes the whole tour by these proportions. “Course variability” affects the random course generator (“Generate random stats” button), each course’s own randomness and the weather: 1× is the recommended setting. Courses you set by hand keep their course rating and slope.',
  'S’ajoute au course rating pour tous les golfeurs simulés. Exemple : 600 verges au-dessus de la distance neutre = environ +1 coup par ronde (un peu moins pour l’élite, un peu plus pour les plus faibles, comme pour le vent).': 'Added to the course rating for all simulated golfers. Example: 600 yards above the neutral distance = about +1 stroke per round (a bit less for the elite, a bit more for the weakest, as with wind).',
  'Chances de chaque vent quand il est tiré au hasard (bouton 🎲, tirage des terrains, nouvelle saison). Le total est ramené à 100%. Le drapeau, lui, a 25% de chances pour chaque jour.': 'Odds of each wind when it’s drawn at random (🎲 button, course draw, new season). The total is scaled to 100%. The pin has a 25% chance for each day.'
});
I18N_RX.push(
  [/^Index du trou (\d+)$/, 'Hole $1 handicap index'], [/^Nom du joueur (\d+)$/, 'Player $1 name'], [/^dernier : (.+)$/, (m, x) => 'last: ' + x.split(' · ').map(trText).join(' · ')],
  [/^(\d{4}) · Retraites : (\d+) · Forcées : (\d+) · Déplacés : (\d+)$/, '$1 · Retirements: $2 · Forced: $3 · Moved: $4'], [/^([\d,  ]+) rondes$/, '$1 rounds'],
  [/^\((\d+) victoires? en L(\d)\)$/, (m, n, l) => '(' + I18N_PL(n, 'win') + ' in L' + l + ')'],
  [/^(t’a battu|l’a battu|battu) ([\d,.]+)\s?% du temps en (\d+) duels$/, (m, w, p, n) => ({ 't’a battu': 'beat you', 'l’a battu': 'beat him', 'battu': 'beaten' }[w]) + ' ' + p + '% of the time in ' + n + ' head-to-heads'],
  [/^le plus (difficile|facile) \((\S+), par (\d)\)$/, (m, k, v, p) => 'the ' + (k === 'facile' ? 'easiest' : 'hardest') + ' (' + v + ', par ' + p + ')'], [/^sur les par (\d)$/, 'on par $1s'],
  [/^(\d+) points · ([\d,.]+)\s?% des votes$/, (m, p, v) => p + ' points · ' + v.replace(',', '.') + '% of the vote'], [/^([\d,.]+)\s?% des votes$/, (m, v) => v.replace(',', '.') + '% of the vote'],
  [/^INTRONISÉ EN (\d+)$/, 'INDUCTED IN $1'], [/^Temple de la renommée, intronisé en (\d+)$/, 'Hall of Fame, inducted in $1'], [/^RECRUE DE L’ANNÉE (\d+)$/, 'ROOKIE OF THE YEAR $1'],
  [/^CÉRÉMONIE D’INTRONISATION · (\d+)$/, 'INDUCTION CEREMONY · $1'], [/^(\S+) ANNÉE SUR LE SCRUTIN$/, (m, o) => I18N_ORDX(o.toLowerCase()).toUpperCase() + ' YEAR ON THE BALLOT'], [/^Scrutin de (\d+)$/, '$1 ballot'],
  [/^(\d+) à (\d+)$/, '$1 to $2'], [/^(\d+) à (\d+) ans$/, '$1 to $2'], [/^sur (\d+)$/, 'of $1'], [/^sur (\d+) en Ligue (\d)$/, 'of $1 in League $2'], [/^à (\d+) ans \($/, 'at $1 ('], [/^\(retraite forcée après (\d+) saisons en Ligue 4\)$/, '(forced retirement after $1 seasons in League 4)'],
  [/^(· )?(\d+) trous · (\d+) coups$/, (m, d, h, c) => (d || '') + h + ' holes · ' + c + ' strokes'],
  [/^Relégué : (.+), en cours de saison$/, (m, c) => 'Relegated: ' + I18N_CRIT(c) + ', mid-season'],
  [/^(\S+) place de la Ligue (\d) · (.+), saison (\d+)$/, (m, o, l, n, y) => I18N_ORDX(o) + ' place in League ' + l + ' · ' + n + ', season ' + y],
  [/^il manque environ (\d+) victoires? en L1, ou (\d+) titres? de saison$/, (m, a, b) => 'about ' + I18N_PL(a, 'L1 win') + ' short, or ' + I18N_PL(b, 'season title')],
  [/^Admissible (\d+) saisons après la retraite\.$/, 'Eligible $1 seasons after retirement.'], [/^(\d+) saisons après la retraite$/, '$1 seasons after retirement'],
  [/^\(([+−]?\S+), coupure à (\S+)\)\. (?:En tête : (.+) \((\S+)\)\. )?$/, (m, a, c, n, t) => '(' + a + ', cut at ' + c + '). ' + (n ? 'Leading: ' + n + ' (' + t + '). ' : '')],
  [/^\(([+−]?\S+), coupure à (\S+)\)\. (\d+) joueurs poursuivent\.$/, '($1, cut at $2). $3 players continue.'], [/^: (\d+) joueurs poursuivent\.$/, ': $1 players continue.'],
  [/^aucun point · classement de saison : (\S+) → (\S+)$/, 'no points · season standing: $1 → $2'],
  [/^Ta nouvelle carrière débute en (\d+) : nouveau carnet de handicap, nouvelles statistiques\. L’historique de la carrière précédente reste dans les records\.$/, 'Your new career starts in $1: new handicap record, new stats. Your previous career’s history stays in the records.'],
  [/^(.+) remporte le tournoi( en prolongation)? · Total (\S+)$/, (m, n, p, t) => n + ' wins the tournament' + (p ? ' in a playoff' : '') + ' · Total ' + t],
  [/^cuvée selon les dépisteurs · (\S+) de tes (\d+) cuvées$/, 'class according to the scouts · $1 of your $2 classes'],
  [/^Fin de la saison (\d+)$/, 'End of the $1 season'], [/^Voir la classe de (\d+)$/, 'See the class of $1'], [/^La classe de (\d+) · (\d+) recrues$/, 'The class of $1 · $2 rookies'],
  [/^(.+) couronné en Ligue (\d)$/, '$1 crowned in League $2'], [/^Tu es couronné champion de la Ligue (\d)$/, 'You’re crowned League $1 champion'],
  [/^(\S+) titre de champion de ligue$/, (m, o) => I18N_ORDX(o) + ' league title'], [/^ronde (\d)$/, 'round $1']
);
Object.assign(I18N_EN, { 'Juste sur la ligne.': 'Right on the number.', 'Tu passes': 'You’re through', 'couronné en Ligue 1': 'crowned in League 1', 'Prudence des dépisteurs': 'Scout caution', 'Optimistes': 'Optimistic', 'Prudents': 'Cautious', 'Très prudents': 'Very cautious' });
I18N_RX.push(
  [/^Il te manquait (\d+) coups?\.$/, (m, n) => 'You were ' + I18N_PL(n, 'shot') + ' short.'],
  [/^≈ (\d+) à (\d+)$/, '≈ $1 to $2'],
  [/^≈ (\d+) recrues? cotées? Generational (par cuvée|aux (\d+) cuvées)\. Le vrai talent ne change pas\.$/, (m, n, k, c) => '≈ ' + n + ' rookie' + (n > 1 ? 's' : '') + ' rated Generational ' + (c ? 'every ' + c + ' classes' : 'per class') + '. True talent doesn’t change.'],
  [/^en carrière\. (.*)$/, (m, st) => 'career. ' + st
    .replace(/^Rayé du scrutin(?: en (\d+) \(([\d,.]+)\s?%\))?\.$/, (x, y, p) => 'Dropped from the ballot' + (y ? ' in ' + y + ' (' + p.replace(',', '.') + '%)' : '') + '.')
    .replace(/^Sur le scrutin : ([\d,.]+)\s?% des votes en (\d+) \((1er scrutin|(\S+) année)\)\. Il faut (\d+)\s?%\.$/, (x, p, y, k, o, need) => 'On the ballot: ' + p.replace(',', '.') + '% of the vote in ' + y + ' (' + (o ? I18N_ORDX(o) + ' year' : '1st ballot') + '). ' + need + '% needed.')
    .replace(/^Admissible au scrutin de (\d+)\.$/, 'Eligible for the $1 ballot.')],
  [/^couronné en Ligue (\d)$/, 'crowned in League $1'],
  [/^([+−]?\d+ points?) · (.+) · classement de saison : (\S+) → (\S+)$/, (m, p, g, a, b) => p + ' · ' + g + ' · season standing: ' + a + ' → ' + b]
);
Object.assign(I18N_EN, { 'Recrue': 'Rookie', 'de l’année': 'of the Year', 'le joyau de la classe': 'the jewel of the class', 'à': 'to' });
I18N_RX.push(
  [/^Recrue de l’année (\d+)$/, 'Rookie of the Year $1'],
  [/^Tu accusais (\d+) coups de retard sur le meneur après la ronde 1 et tu as tout rattrapé\.$/, 'You trailed the leader by $1 shots after round 1 and came all the way back.'],
  [/^Tu conserves la tête du classement \((\d+) points?\), à égalité de points avec$/, 'You keep the standings lead ($1 points), tied on points with'],
  [/^(\S+) choix des dépisteurs$/, (m, o) => 'scouts’ ' + I18N_ORDX(o) + ' pick']
);
const I18N_RULES = s => I18N_CRIT(s).replace(/(\d+) tournois dans les (\d+) derniers/g, '$1 finishes in the bottom $2').replace(/(\d+) dans les (\d+) derniers/g, '$1 in the bottom $2').replace(/ ou /g, ' or ').replace(/(\d+) victoires?/g, (m, n) => I18N_PL(n, 'win'));
const I18N_RECNM = s => { const t = trText(s.charAt(0).toUpperCase() + s.slice(1)); return t.charAt(0).toLowerCase() + t.slice(1); };
Object.assign(I18N_EN, {
  'Aucun tournoi joué cette saison.': 'No tournaments played this season.', 'Course à la promotion :': 'Promotion race:', 'coupures ratées': 'missed cuts', 'coupure ratée': 'missed cut', 'gains de la saison': 'season earnings',
  'promu en cours de saison': 'promoted mid-season', 'arrivé en cours de saison · protégé': 'arrived mid-season · protected', 'Maintien': 'Stays', 'Voir l’autre retraite': 'See the other retirement',
  'Compté avant ce tournoi, depuis l’arrivée dans la ligue.': 'Counted before this tournament, since arriving in the league.', 'Compté avant ce tournoi, depuis le début de la saison.': 'Counted before this tournament, since the start of the season.',
  'Compté depuis l’arrivée dans la ligue.': 'Counted since arriving in the league.', 'Compté depuis le début de la saison.': 'Counted since the start of the season.'
});
I18N_RX.push(
  [/^En cours de saison, on monte d’une ligue avec (.+), et on descend avec (.+), comptés depuis le début de la saison ou depuis l’arrivée dans la ligue\. En fin de saison, les (\d+) premiers montent et les (\d+) derniers descendent\.$/, (m, a, b, u, d) => 'During the season, you move up a league with ' + I18N_RULES(a) + ', and you move down with ' + I18N_RULES(b) + ', counted from the start of the season or from your arrival in the league. At the end of the season, the top ' + u + ' move up and the bottom ' + d + ' move down.'],
  [/^([+−]?\d+ points?) · (.+) · classement de saison : (\S+)$/, (m, p, g, a) => p + ' · ' + g + ' · season standing: ' + a],
  [/^(Tu bondis|bondit) du (\S+) au (\S+) rang du classement\.$/, (m, w, a, b) => (w === 'Tu bondis' ? 'You jump' : 'jumps') + ' from ' + a + ' to ' + b + ' in the standings.'],
  [/^Record \((.+)\) : (Tu bats|(.+) bat) « (.+) » avec (\S+(?: coups?)?) \(ancien : (\S+(?: coups?)?),$/, (m, sc, w, nb, r, v, o) => 'Record (' + trText(sc) + '): ' + (w === 'Tu bats' ? 'You break' : nb + ' breaks') + ' “' + I18N_RECNM(r) + '” with ' + v.replace(/ coups?$/, x => /s$/.test(x) ? ' shots' : ' shot') + ' (previous: ' + o.replace(/ coups?$/, x => /s$/.test(x) ? ' shots' : ' shot') + ','],
  [/^(bat) « (.+) » avec (\S+(?: coups?)?) \(ancien : (\S+(?: coups?)?),$/, (m, w, r, v, o) => 'breaks “' + I18N_RECNM(r) + '” with ' + v.replace(/ coups?$/, x => /s$/.test(x) ? ' shots' : ' shot') + ' (previous: ' + o.replace(/ coups?$/, x => /s$/.test(x) ? ' shots' : ' shot') + ','],
  [/^(Tu as commencé|Tu commences) la saison (\d+) en$/, (m, w, y) => (w === 'Tu commences' ? 'You start' : 'You started') + ' the ' + y + ' season in'],
  [/^victoires? pour (\d+) golfeurs?$/, (m, n) => 'wins for ' + I18N_PL(n, 'golfer')], [/^victoires? pour$/, 'wins for'],
  [/^(Montés|Descendus) en cours de saison en Ligue (\d) :$/, (m, k, l) => (k === 'Montés' ? 'Moved up' : 'Moved down') + ' mid-season to League ' + l + ':'],
  [/^Promus en Ligue (\d) \(les (\d+) premiers(?:, dont (\d+) pour combler les départs à la retraite)?\) :$/, (m, l, n, x) => 'Promoted to League ' + l + ' (the top ' + n + (x ? ', including ' + x + ' to fill retirement spots' : '') + '):'],
  [/^Relégués en Ligue (\d) \(les (\d+) derniers\) :$/, 'Relegated to League $1 (the bottom $2):'],
  [/^Voir les (\d+) (promus|relégués|autres retraites|autres|années|golfeurs)$/, (m, n, k) => 'See the ' + n + ' ' + ({ 'promus': 'promoted golfers', 'relégués': 'relegated golfers', 'autres retraites': 'other retirements', 'autres': 'others', 'années': 'years', 'golfeurs': 'golfers' }[k])],
  [/^Voir les (\d+) dernières années$/, 'See the last $1 years'], [/^Voir le top (\d+)$/, 'See the top $1'],
  [/^Retraites · (\d+)(?: \(dont (\d+) forcées?\))?$/, (m, n, f) => 'Retirements · ' + n + (f ? ' (' + f + ' forced)' : '')],
  [/^Retirements · (\d+) \(dont (\d+) forcées?\)$/, 'Retirements · $1 ($2 forced)'],
  [/^: (.+) → (.+) · (promu|relégué) en Ligue (\d)$/, (m, a, b, k, l) => ': ' + a + ' → ' + b + ' · ' + (k === 'promu' ? 'promoted' : 'relegated') + ' to League ' + l],
  [/^Commencer la saison (\d+)$/, 'Start the $1 season']
);
const I18N_DAYS = { 'lundi': 'Monday', 'mardi': 'Tuesday', 'mercredi': 'Wednesday', 'jeudi': 'Thursday', 'vendredi': 'Friday', 'samedi': 'Saturday', 'dimanche': 'Sunday' };
Object.assign(I18N_EN, {
  'Vainqueurs': 'Winners', 'Vainqueur': 'Winner', 'Gagnant': 'Winner', 'Actifs': 'Active', 'actif': 'active', 'titres': 'titles', 'titre': 'title', 'Avance': 'Lead', 'changements': 'changes', 'Âge retraite': 'Retirement age', 'Âge sommet': 'Peak age', 'Bourses': 'Purses',
  'Retirer': 'Remove', 'coups': 'strokes', 'coup': 'stroke', 'POTENTIEL': 'POTENTIAL', 'Potentiel': 'Potential', 'autres podiums': 'other podiums', 'autres top 10': 'other top 10s',
  'Rivaux': 'Rivals', 'Terrains des Majeurs et de la Finale': 'Major and Finale courses', 'Pour chacun, une liste de terrains où piger. Vide : on pige parmi les terrains qui passent les filtres. Le tee le plus proche du terrain moyen est choisi (selon tes tees, s’il y en a).': 'For each one, a list of courses to draw from. Empty: draw among the courses that pass the filters. The tee closest to the average course is chosen (from your tees, if any).', 'Ajouter un terrain…': 'Add a course…', 'Terrain introuvable dans ta liste': 'Course not found in your list', 'après le tournoi 10': 'after tournament 10', 'filtres': 'filters', 'Classe de recrues': 'Rookie Class', 'Cuvée': 'Class', 'Choix des dépisteurs': 'Scouts’ pick', 'Le joyau de la classe': 'The jewel of the class', 'À la création': 'At creation', 'Potentiel perçu': 'Perceived potential', 'Handicap en classe de recrues': 'Rookie Class handicap', 'Ligue de départ': 'Starting league', 'Sans carte': 'No card', 'Terrains de la carrière': 'Career courses', 'Les filtres du tirage des terrains (un terrain différent par tournoi), aussi modifiables plus tard dans Terrains.': 'Course draw filters (a different course for each tournament), also editable later under Courses.', 'Terrain moyen': 'Average course', 'Un terrain avec ces valeurs n’a aucun effet sur les scores ; les autres jouent plus difficile ou plus facile. Les simulations (et l’histoire du circuit) se basent dessus.': 'A course with these values has no effect on scores; others play harder or easier. Simulations (and the tour’s history) are based on it.', 'D’après les filtres': 'From the filters', 'Personnalisé': 'Custom', 'Course rating (par 72)': 'Course rating (par 72)', 'Distance (verges)': 'Distance (yards)', 'Moyenne des tees qui seront tirés avec ces filtres. Modifie une valeur pour la personnaliser.': 'Average of the tees that will be drawn with these filters. Change a value to customize it.', 'Valeurs personnalisées.': 'Custom values.', 'Aucun terrain ne correspond à ces filtres': 'No course matches these filters', 'Avant ton départ': 'Before your tee time', 'Avant le départ de ton golfeur': 'Before your golfer’s tee time', 'Simuler jusqu’à mon départ': 'Simulate until my tee time', 'Personne n’est encore parti': 'Nobody has teed off yet', 'Saison en direct': 'Live season', 'Mouv.': 'Move', 'Tournoi': 'Tournament', 'sous la coupure': 'below the cut', 'Zone de relégation': 'Relegation zone', '▲ Zone de promotion': '▲ Promotion zone', 'Le classement de la saison si le tournoi finissait maintenant. Mouv. : par rapport au classement d’avant le tournoi.': 'The season standings if the tournament ended now. Move: compared with the standings before the tournament.', 'Projection indisponible.': 'Projection unavailable.', 'Tes chances de passer': 'Your chances of making it', 'Coupure actuelle': 'Current cut', 'Rivalités': 'Rivalries', 'éteinte': 'faded', 'tiède': 'lukewarm', 'chaude': 'hot', 'brûlante': 'red-hot', 'Née': 'Born', 'Moment': 'Moment', 'égalité': 'tied', 'Voir le profil de': 'See the profile of', 'Face-à-face : tous les adversaires': 'Head-to-head: all opponents', 'Aucune rivalité pour l’instant : il faut quelques moments importants contre le même golfeur.': 'No rivalries yet: it takes a few big moments against the same golfer.', 'Une rivalité naît des moments importants contre le même golfeur : finir 1er et 2e, être tous deux dans le top 5 d’un Majeur ou de la Finale, ou dans le top 3 d’un tournoi. Son intensité baisse avec le temps. Touche un rival pour voir vos moments.': 'A rivalry is born from big moments against the same golfer: finishing 1st and 2nd, both in the top 5 of a Major or the Finale, or both in the top 3 of a tournament. Its intensity fades over time. Tap a rival to see your moments.', 'Grands rivaux': 'Big rivals', 'Bilan': 'Record', 'Marge restante': 'Room to grow', 'Niveau': 'Level', 'Rappelle': 'Reminds of', '☆ Suivre': '☆ Follow', '★ Suivi': '★ Following',
  'Valeur sûre': 'Sure bet', 'Bon pari': 'Good bet', 'Pari risqué': 'Risky bet', 'Mon profil': 'My profile', 'Voir ton profil': 'See your profile', 'Mouvements': 'Moves', 'Distance totale (verges)': 'Total distance (yards)',
  '· sans effet': '· no effect', 'sans effet': 'no effect', 'Hasard': 'Random', 'Choisir maintenant': 'Choose now', 'Gestionnaire (sombre)': 'Manager (dark)', 'Classique': 'Classic', 'Aigle': 'Eagle',
  'Top 5 gagne': 'Top 5 wins', 'Slope neutre': 'Neutral slope', 'Joueurs': 'Players', 'Adversaires': 'Opponents', 'Pire score gagnant': 'Worst winning score', 'Faits marquants': 'Highlights',
  'Statistiques': 'Statistics', 'Continuer': 'Continue', 'Quitter': 'Quit', 'Mouv.': 'Move', 'Verges': 'Yards', 'verges': 'yards'
});
I18N_RX.push(
  [/^(R\d · )?Drapeau (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)( · .+)?$/, (m, r, d, w) => (r || '') + 'Pin ' + I18N_DAYS[d] + (w ? ' · ' + w.slice(3).split(' · ').map(trText).join(' · ') : '')],
  [/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)$/, (m, d) => I18N_DAYS[d]],
  [/^(, )?termine (\S+)\.$/, (m, c, p) => (c || '') + 'finishes ' + p + '.'], [/^([+−]?[\d.,]+) coups?$/, (m, n) => n + (/^[+−]?1$/.test(n) ? ' stroke' : ' strokes')], [/^\(([\d.,]+) coups?\)$/, (m, n) => '(' + n + (n === '1' ? ' stroke)' : ' strokes)')],
  [/^Potentiel : (.+)$/, 'Potential: $1'], [/^devant ([\d.,]+)\s?%$/, 'ahead of $1%'],
  [/^(🏆 )?(\d+) Majeurs?( · (\d+) Finales?)?$/, (m, c, n, f, k) => (c || '') + n + ' Major' + (n > 1 ? 's' : '') + (f ? ' · ' + k + ' Finale' + (k > 1 ? 's' : '') : '')], [/^(🏆 )?(\d+) Finales?$/, (m, c, k) => (c || '') + k + ' Finale' + (k > 1 ? 's' : '')],
  [/^aujourd’hui : (.+?)(?: · sommet (.+))?$/, (m, a, b) => 'today: ' + a + (b ? ' · peak ' + b : '')],
  [/^Ma liste · (\d+)$/, 'My list · $1'], [/^: (.+) → (.+) \(([+−]\d+) paliers?\)$/, (m, a, b, n) => ': ' + a + ' → ' + b + ' (' + n + (/^[+−]1$/.test(n) ? ' tier)' : ' tiers)')],
  [/^1 coup \/ (.+)$/, '1 stroke / $1'],
  [/^Tu termines (\S+) à (\S+) et rapportes (\d+) points\.$/, 'You finish $1 at $2 and earn $3 points.'], [/^Tu empoches (\d+) points?\.$/, (m, n) => 'You pocket ' + I18N_PL(n, 'point') + '.'],
  [/^Tu rates la coupure \((\S+) contre une coupure à (\S+)\)\.$/, 'You miss the cut ($1 against a cut at $2).'],
  [/^Tu termines (\S+) à (\S+), hors de la ligne de paye \((?:top (\d+) à )?(\S+)\)\.$/, (m, p, s, t, c) => 'You finish ' + p + ' at ' + s + ', outside the pay line (' + (t ? 'top ' + t + ' at ' : '') + c + ').'],
  [/^Meneur du classement, tu termines (\S+)\.$/, 'Standings leader, you finish $1.'], [/^Classé (\S+) avant le tournoi, tu termines (\S+)\.$/, 'Ranked $1 before the tournament, you finish $2.'],
  [/^\((\S+)\) devance$/, '($1) is ahead of'], [/^\((\S+)\) et$/, '($1) and']
);
Object.assign(I18N_EN, {
  'Tout': 'All', 'Moi': 'Me', 'Argent': 'Money', 'Aigles': 'Eagles', 'Albatros': 'Albatrosses', 'Nombre': 'Number', 'Piger': 'Draw', '+ Liste': '+ List', 'Cote': 'Rating', 'Forme': 'Form',
  'Modifier': 'Edit', 'Avant': 'Before', 'Âge moy.': 'Avg. age', 'Cohorte': 'Cohort', 'Cohortes': 'Cohorts', 'Position finale': 'Final position', 'Reculent': 'Moving down', 'Prolongation :': 'Playoff:',
  'Fils de': 'Son of', 'Père de': 'Father of', 'Frère de': 'Brother of', 'Cousin de': 'Cousin of'
});
I18N_RX.push(
  [/^(Pars|Birdies|Bogeys)(?: :)? ([\d,  ]+)$/, (m, k, n) => k + (m.includes(':') ? ': ' : ' ') + n],
  [/^Intersaison (\d+) → (\d+)$/, '$1 → $2 offseason'], [/^Reculent · (\d+)$/, 'Moving down · $1'], [/^\. (\d+) joueurs en lice\.$/, '. $1 players in contention.'],
  [/^, (\d+) ans,$/, ', $1,']
);
/* ---- Étape 2, troisième passe : messages, boutons et états vides repérés dans le code ---- */
Object.assign(I18N_EN, {
  'Ajouter': 'Add', 'Annulé': 'Canceled', 'Aperçu YouTube ↗': 'YouTube preview ↗', 'Aucun changement de palier dans cette ligue.': 'No tier changes in this league.', 'Aucun classement.': 'No standings.',
  'Aucun golfeur en activité': 'No active golfers', 'Aucun golfeur trouvé.': 'No golfers found.', 'Aucun résultat enregistré.': 'No results recorded.', 'Aucun terrain enregistré pour l’instant.': 'No courses saved yet.',
  'Aucun terrain ne correspond.': 'No matching courses.', 'Aucun tournoi joué.': 'No tournaments played.', 'Aucun trophée pour l’instant': 'No trophies yet', 'Aucune donnée pour cette saison.': 'No data for this season.',
  'Aucune intersaison terminée pour l’instant.': 'No offseason completed yet.', 'Aucune recrue enregistrée pour cette intersaison.': 'No rookies recorded for this offseason.', 'Aucune retraite dans cette ligue.': 'No retirements in this league.',
  'Aucune sauvegarde trouvée.': 'No save found.', 'Aucune victoire de tournoi': 'No tournament wins', 'Aucune victoire pour l’instant.': 'No wins yet.', 'Aujourd’hui': 'Today',
  'Barème enregistré': 'Points table saved', 'Barème invalide': 'Invalid points table', 'Beauté et paysage': 'Beauty and scenery', 'Bilan de la saison': 'Season review', 'Calendrier de la saison': 'Season schedule',
  'Ce fichier ne ressemble pas à une sauvegarde valide.': 'This file doesn’t look like a valid save.', 'Ce fichier n’est pas une liste de terrains': 'This file isn’t a course list', 'Ce qui le distingue': 'What sets it apart',
  'Ce qu’en dit Claude': 'What Claude says', 'Ce terrain a été retiré de ta liste.': 'This course was removed from your list.', 'Ce terrain n’est plus dans la pige.': 'This course is no longer in the draw.',
  'Ce tournoi est barré ou déjà joué': 'This tournament is locked or already played', 'Choisis d’abord le tournoi': 'Choose the tournament first', 'Classement après la ronde 1': 'Standings after round 1', 'Classement final': 'Final standings',
  'Claude n’a pas pu répondre': 'Claude couldn’t answer', 'Claude n’est pas disponible ici': 'Claude isn’t available here', 'Claude n’est pas disponible ici pour l’instant.': 'Claude isn’t available here right now.',
  'Cohortes de recrues': 'Rookie cohorts', 'Copie introuvable': 'Copy not found', 'Crée ton golfeur': 'Create your golfer', 'Créer un nouveau golfeur': 'Create a new golfer', 'C’est définitif': 'This is final',
  'Dans ta partie': 'In your game', 'Demander à Claude': 'Ask Claude', 'Dernière chance de monter': 'Last chance to move up', 'Descendu': 'Moved down', 'Monté': 'Moved up', 'Donne un nom à la liste': 'Name the list',
  'Dossier de sauvegarde :': 'Save folder:', 'Drapeau :': 'Pin:', 'Déjà joué': 'Already played', 'Effet estimé': 'Estimated effect', 'En chute libre': 'In free fall', 'En déclin marqué': 'In sharp decline',
  'En forte progression': 'Improving fast', 'En léger déclin': 'Slightly declining', 'En tête :': 'Leading:', 'Entre le nom du terrain.': 'Enter the course name.', 'Erreur :': 'Error:', 'Exempté': 'Exempt',
  'Face aux autres terrains de la pige': 'Against the other courses in the draw', 'Faits divers': 'Odds and ends', 'Fichier invalide': 'Invalid file', 'Format et ligne de paye': 'Format and pay line',
  'Histoire': 'History', 'Hors de la ligne de paye : rien pour la tirelire cette fois': 'Outside the pay line: nothing for the piggy bank this time', 'Il faut exactement 18 chiffres de 1 à 18': 'You need exactly 18 numbers from 1 to 18',
  'Index enregistrés': 'Indexes saved', 'Index manquant': 'Index missing', 'Intersaison': 'Offseason', 'Jamais joué dans cette partie : ce serait une première.': 'Never played in this game: it would be a first.',
  'Jamais joué dans ta partie.': 'Never played in your game.', 'Jeune espoir': 'Young prospect', 'Joue ton premier tournoi pour commencer ta liste de records.': 'Play your first tournament to start your records list.',
  'Jouer': 'Play', 'Jouer la ronde finale': 'Play the final round', 'Joueur 1': 'Player 1', 'Joué': 'Played', 'La carrière continue': 'The career goes on', 'La fiche': 'The card', 'La plus prometteuse :': 'Most promising:',
  'La première cohorte arrive à la fin de la première saison.': 'The first cohort arrives at the end of the first season.', 'Lance un test pour voir l’effet de tes réglages': 'Run a test to see the effect of your settings',
  'Le chargement prend anormalement de temps.': 'Loading is taking unusually long.', 'Le format se change entre deux saisons': 'The format can be changed between seasons', 'Le graphique apparaît après deux saisons.': 'The chart appears after two seasons.',
  'Le graphique apparaît après deux tournois avec un handicap.': 'The chart appears after two tournaments with a handicap.', 'Le graphique apparaît après deux tournois avec un index.': 'The chart appears after two tournaments with an index.',
  'Le jeu n’arrive pas à démarrer.': 'The game can’t start.', 'Le parcours': 'The course', 'Les gains s’ajoutent ici après chaque tournoi.': 'Earnings are added here after each tournament.',
  'Les golfeurs restent dans le jeu, seule la liste disparaît.': 'The golfers stay in the game, only the list disappears.', 'Les handicaps apparaissent après trois rondes.': 'Handicaps appear after three rounds.',
  'Les paliers apparaissent après la première saison.': 'Tiers appear after the first season.', 'Les tournois qui l’ont déjà chargé ne changent pas.': 'Tournaments that already loaded it don’t change.',
  'Liste créée': 'List created', 'Liste de terrains à jour :': 'Course list up to date:', 'Liste supprimée': 'List deleted', 'L’Almanac se remplit dès le premier tournoi joué.': 'The Almanac fills up from the first tournament played.',
  'L’histoire du circuit s’écrit…': 'The tour’s history is being written…', 'Ma liste': 'My list', 'Meilleure ronde du tournoi :': 'Best round of the tournament:', 'Mode simulé': 'Simulated mode', 'Modifier le terrain': 'Edit course',
  'Montent d’un palier ou plus': 'Moving up one tier or more', 'Nerveux': 'Nervous', 'Nouveau terrain': 'New course', 'Nouveau tournoi': 'New tournament', 'Nouveaux coefficients tirés': 'New coefficients drawn',
  'Oui, prendre ma retraite': 'Yes, retire', 'Par enregistrés': 'Pars saved', 'Par manquant': 'Par missing', 'Partie Duo': 'Duo game', 'Pas de coupure': 'No cut', 'Pas encore assez de cartes.': 'Not enough scorecards yet.',
  'Pas encore de cartes trou par trou.': 'No hole-by-hole scorecards yet.', 'Pas encore de changement de ligue.': 'No league change yet.', 'Pas encore établi': 'Not yet established', '(prévue)': '(planned)', ' (prévue)': ' (planned)', 'Étape': 'Step', 'Comment tu joues': 'How you play', 'Le circuit': 'The tour', 'Ton golfeur': 'Your golfer', 'Votre équipe': 'Your team', 'Ton défi': 'Your challenge', 'La carrière': 'The career', 'Les terrains': 'The courses', 'L’histoire du circuit': 'Tour history', '‹ Retour': '‹ Back', 'Suivant ›': 'Next ›', 'Suivant : crée ton golfeur ›': 'Next: create your golfer ›', 'Suivant : votre équipe ›': 'Next: your team ›', 'Scores adverses': 'Opponents’ scores', 'Vue': 'View', 'Classement de la saison': 'Season standings', 'Après': 'After', 'Touche ☆ pour suivre un golfeur pendant ce tournoi.': 'Tap ☆ to follow a golfer during this tournament.', 'Tournois joués dans cette ligue cette saison': 'Events played in this league this season', 'Aller à la prolongation': 'Go to the playoff', 'Prolongation :': 'Playoff:', 'Au trou de prolongation': 'On playoff hole', 'Égalité en tête : regarde le classement, puis passe à la prolongation.': 'Tie for the lead: check the standings, then move on to the playoff.', 'Retour au classement': 'Back to the standings', 'Revoir la prolongation': 'Review the playoff', 'tournoi dans cette ligue': 'event in this league', 'tournois dans cette ligue': 'events in this league', 'l’emporte': 'wins', 'Biographie': 'Biography', 'Parcours · ligue par saison': 'Path · league by season', 'Carte handicap': 'Handicap card', 'Progression · niveau et potentiel': 'Progress · level and potential', 'Tout le monde a terminé': 'Everyone has finished', 'La ronde 1 est complète : regarde le classement, puis passe à la coupure.': 'Round 1 is complete: check the standings, then move on to the cut.', 'Le tournoi est terminé : regarde le classement final, puis passe à la clôture.': 'The tournament is over: check the final standings, then move on to the wrap-up.', 'Voir la coupure': 'See the cut', 'Voir la clôture du tournoi': 'See the tournament wrap-up', 'L’Almanac est encore vierge': 'The Almanac is still blank', 'Il raconte l’histoire du circuit : records, champions, nations, cohortes. Joue ton premier tournoi pour écrire la première page.': 'It tells the story of the tour: records, champions, nations, cohorts. Play your first tournament to write the first page.', 'Jouer mon premier tournoi': 'Play my first tournament', 'Libre : à toi de l’établir !': 'Open: yours to set!', 'Aucune nouvelle pour l’instant': 'No news yet', 'Les nouvelles du circuit arrivent dès ta première ronde.': 'Tour news arrives after your first round.', 'Ton premier résultat t’attend': 'Your first result awaits', 'Pas à l’ordre du jour': 'Not on the agenda',
  'Passe': 'Through', 'Plus bas': 'Lowest', 'Plusieurs saisons d’un coup': 'Several seasons at once', 'Prendre ta retraite ?': 'Retire?', 'Préparation du monde…': 'Building the world…', 'Préréglage :': 'Preset:',
  'Quadruple bogey ou pire': 'Quadruple bogey or worse', 'Rayé du scrutin': 'Dropped from the ballot', 'Recommencer une carrière': 'Start a new career', 'Redemander': 'Ask again', 'Rejouer avec les mêmes réglages': 'Replay with the same settings',
  'Relégation': 'Relegation', 'Remplacer la partie actuelle ?': 'Replace the current game?', 'Reprendre la ronde': 'Resume the round', 'Reste': 'Left', 'Retiré de ta Watchlist': 'Removed from your Watchlist',
  'Retour au journal': 'Back to the journal', 'Retour à la pige': 'Back to the draw', 'Retraite imminente': 'Retirement imminent', 'Rien d’extrême : un terrain équilibré.': 'Nothing extreme: a balanced course.',
  'Réessayer': 'Try again', 'Réglages avancés rétablis': 'Advanced settings restored', 'Réglages déverrouillés': 'Settings unlocked', 'Réglages rétablis': 'Settings restored', 'Régler la bourse': 'Set the purse',
  'Réponse illisible, réessaie': 'Unreadable answer, try again', 'Réputation de difficulté': 'Difficulty reputation', 'Résumé': 'Summary', 'Résumé · terrain pigé': 'Summary · drawn course', 'Résumé ›': 'Summary ›',
  'Sauvegarde de carrière': 'Career save', 'Sauvegarde enregistrée': 'Save stored', 'Sauvegarde importée': 'Save imported', 'Section rétablie': 'Section restored', 'Simuler': 'Simulate', 'Simuler la ronde finale': 'Simulate the final round',
  'Solide': 'Solid', 'Sommet': 'Peak', 'Suivre le circuit sans golfeur': 'Follow the tour without a golfer', 'Série en cours :': 'Current streak:', 'Ta carrière existe déjà : la voici': 'Your career already exists: here it is',
  'Ta carrière prend fin': 'Your career ends', 'Ta partie Duo existe déjà : la voici': 'Your Duo game already exists: here it is', 'Tees offerts': 'Tees available', 'Terrain ajouté': 'Course added', 'Terrain chargé': 'Course loaded',
  'Terrain mis à jour': 'Course updated', 'Terrain peu connu.': 'Little-known course.', 'Terrain retiré de la liste': 'Course removed from the list', 'Terrain à résumer :': 'Course to summarize:', 'Test en cours': 'Test running', 'Test terminé': 'Test complete',
  'Tournoi terminé': 'Tournament complete', 'Tournois de deux rondes avec coupure': 'Two-round tournaments with a cut', 'Tournois d’une ronde': 'One-round tournaments', 'Tournoi…': 'Tournament…', 'Toutes ligues confondues.': 'All leagues combined.',
  'Trop de demandes pour l’instant, réessaie plus tard': 'Too many requests right now, try again later', 'Trous': 'Holes', 'Un des plus courts de ta liste.': 'One of the shortest in your list.',
  'Un monde à part est simulé : ta partie n’est pas touchée.': 'A separate world is simulated: your game isn’t touched.', 'Un tournoi est en cours : touche encore pour le remplacer': 'A tournament is in progress: tap again to replace it',
  'Valeurs rétablies': 'Values restored', 'Vent :': 'Wind:', 'Vider la liste de terrains puis redémarrer': 'Empty the course list and restart', 'Voir les ligues': 'See the leagues', 'Vos résultats': 'Your results', 'Y pense sérieusement': 'Thinking about it seriously',
  '▲ Promu': '▲ Promoted', '▼ Relégué': '▼ Relegated', '🐷 Tirelire': '🐷 Piggy bank', '▼ : le handicap a baissé, le golfeur s’est amélioré.': '▼: the handicap dropped, the golfer improved.',
  'À palier égal, ordre alphabétique.': 'Same tier: alphabetical order.', 'ronde 1 simulée': 'round 1 simulated', 'ronde 2 simulée': 'round 2 simulated', 'ronde simulée': 'round simulated', 'ronde terminée': 'round complete',
  'ronde unique': 'single round', 'ronde finale': 'final round', 'saison terminée': 'season over', 'tournois joués': 'tournaments played', 'tu n’étais pas en activité.': 'you weren’t active.', 'barré': 'locked', 'débarré': 'unlocked',
  'en amélioration': 'improving', 'en progrès': 'progressing', 'en recul': 'declining', 'déclin': 'decline', 'déçoit': 'disappoints', 'jouée': 'played', 'simulé': 'simulated', 'candidat': 'candidate', 'annulé': 'canceled',
  'aucun titre': 'no titles', 'top 10 de saison': 'season top 10', 'victoire en Finale': 'Finale win', 'marge restante': 'room to grow', 'ancienne carrière': 'former career', 'France': 'France'
});
I18N_RX.push(
  [/^Ajouté au T(\d+)$/, 'Added to T$1'], [/^Ajouté à « (.+) »$/, 'Added to “$1”'], [/^Supprimer « (.+) » \?$/, 'Delete “$1”?'], [/^Paiement de (.+) annulé$/, 'Payment of $1 canceled'],
  [/^Nouvelles recrues · (\d+)$/, 'New rookies · $1'], [/^La plus prometteuse : (.+)$/, 'Most promising: $1'], [/^Paliers de la Ligue (\d)$/, 'League $1 tiers'], [/^Classement · (.+) · (\d+)$/, (m, l, y) => 'Standings · ' + trText(l) + ' · ' + y],
  [/^Reprendre Play Now · (.+)$/, 'Resume Play Now · $1'], [/^Course finale en Ligue (\d)$/, 'Final race in League $1'],
  [/^Rempli avec les tees (\S+) \(aussi : (.+)\)$/, 'Filled with the $1 tees (also: $2)'], [/^Le n°1 finit top 10 : (.+)$/, 'No. 1 finishes top 10: $1'], [/^([\d,.]+\s?%) des tournois$/, (m, p) => p.replace(/\s/, '').replace(',', '.') + ' of tournaments'],
  [/^Mes places dans les top (\d+)$/, 'My spots in the top $1'], [/^(.+) : (1er|\d+(?:e|st|nd|rd|th))$/, (m, a, o) => trText(a) + ': ' + I18N_ORDX(o)],
  [/^(Une légende rejoint|Ta carrière rejoint|(\d+) légendes rejoignent) (?:les (\d+) membres? du Temple|le Temple, qui accueille ses premiers membres)$/, (m, w, n, k) => (n ? n + ' legends join' : w === 'Ta carrière rejoint' ? 'Your career joins' : 'A legend joins') + ' ' + (k ? 'the Hall’s ' + I18N_PL(k, 'member') : 'the Hall, which welcomes its first members')],
  [/^(Tu es monté|Monté|Tu es descendu|Descendu) de la Ligue (\d) après le tournoi (\d+)[ :,]+(.+?)(\. Protégé contre la relégation de fin de saison\.)?$/, (m, w, l, t, r, p) => ({ 'Tu es monté': 'You moved up', 'Monté': 'Moved up', 'Tu es descendu': 'You moved down', 'Descendu': 'Moved down' }[w]) + ' from League ' + l + ' after tournament ' + t + ': ' + I18N_CRIT(r) + (p ? '. Protected from end-of-season relegation.' : '')],
  [/^Classement de saison · (.+)$/, (m, l) => 'Season standings · ' + trText(l)], [/^Changements de palier · (\d+)$/, 'Tier changes · $1'],
  [/^(Tu utilises|(.+) utilise) l’exemption unique de carrière \((\d+) victoires en L1\) : (tu restes|il reste) en Ligue 1 jusqu’à la fin de (\d+)\.$/, (m, w, n, k, x, y) => (n ? n + ' uses' : 'You use') + ' the one-time career exemption (' + k + ' L1 wins): ' + (n ? 'he stays' : 'you stay') + ' in League 1 through the end of ' + y + '.'],
  [/^Résultats finaux · (.+)$/, (m, l) => 'Final results · ' + trText(l)], [/^(.+) · Résultats finaux$/, (m, l) => trText(l) + ' · Final results'],
  [/^(Pas de coupure|Coupure à (\S+))$/, (m, a, c) => c ? 'Cut at ' + c : 'No cut'], [/^: (\d+) joueurs? en ronde finale\.$/, (m, n) => ': ' + I18N_PL(n, 'player') + ' in the final round.'],
  [/^Ensuite, tu pourras (créer un nouveau golfeur|recommencer une carrière) ou simuler les saisons suivantes\.$/, (m, a) => 'Then you can ' + (a === 'créer un nouveau golfeur' ? 'create a new golfer' : 'start a new career') + ' or simulate the following seasons.'],
  [/^Il faut (\d+)\s?% des votes \(le trait\)\.(?: L’an prochain, (\d+) nouvel?s? admissibles?, dont$)?/, (m, p, n) => p + '% of the vote needed (the line).' + (n ? ' Next year, ' + n + ' newly eligible, including' : '')],
  [/^Depuis (\d+) · (.+)$/, (m, y, r) => 'Since ' + y + ' · ' + trText('Carrière · ' + r).replace(/^Career · /, '')],
  [/^Égalité en tête à (\S+) : (.+)$/, 'Tied for the lead at $1: $2'], [/^(.+) remporte le tournoi à (\S+)$/, '$1 wins the tournament at $2'],
  [/^Tu glisses du (\S+) au (\S+) rang\.$/, 'You slip from $1 to $2.'], [/^Tu restes au (\S+) rang\.$/, 'You stay $1.'], [/^En tête : (.+) \((\S+)\)\.$/, 'Leading: $1 ($2).'],
  [/^Rayé du scrutin en (\d+) \(([\d,.]+)\s?%\)\.$/, (m, y, p) => 'Dropped from the ballot in ' + y + ' (' + p.replace(',', '.') + '%).']
);
Object.assign(I18N_EN, { 'aigle': 'eagle', 'albatros': 'albatross', 'trou d’un coup': 'hole-in-one', 'quadruple bogey ou pire': 'quadruple bogey or worse', 'Montagnes russes': 'Roller coaster', 'Stable': 'Stable',
  '▲ En forte progression': '▲ Improving fast', '▼ En léger déclin': '▼ Slightly declining', '▼ En déclin marqué': '▼ In sharp decline', '▼ En chute libre': '▼ In free fall' });
I18N_RX.push(
  [/^(.+) \((\S+)\) : (.+) au (\d+)\.$/, (m, n, p, w, h) => n + ' (' + p + '): ' + trText(w) + ' on ' + h + '.'],
  [/^(\d+) saisons? au top 10 mondial$/, (m, n) => I18N_PL(n, 'season') + ' in the world top 10'], [/^(\d+) saisons? n°1 mondial$/, (m, n) => I18N_PL(n, 'season') + ' at world No. 1'],
  [/^(\d+) victoires? en L(\d)$/, (m, n, l) => I18N_PL(n, 'win') + ' in L' + l], [/^(\d+) titres? de saison$/, (m, n) => I18N_PL(n, 'season title')], [/^(\d+) top 10 de saison$/, '$1 season top 10s'],
  [/^\((.+ · .+)\)([.,]?)$/, (m, a, p) => '(' + a.split(' · ').map(trText).join(' · ') + ')' + p], [/^\((\d+) victoires?\),$/, (m, n) => '(' + I18N_PL(n, 'win') + '),'],
  [/^([▲▼] )(.+)$/, (m, a, b) => { const t = trText(b); return t === b ? m : a + t; }]
);
I18N_RX.push([/^Trou (\d+) \(par (\d)\) : (.+) mène à (\S+?)(, à égalité)?\.(?: (.*))?$/, (m, h, p, n, s, t, r) => 'Hole ' + h + ' (par ' + p + '): ' + n + ' leads at ' + s + (t ? ', tied' : '') + '.' + (r ? ' ' + r.split(/(?<=\.) /).map(trText).join(' ') : '')]);
I18N_RX.push([/^Ton niveau : (.+?) →$/, (m, a) => 'Your level: ' + a + ' →']);
Object.assign(I18N_EN, { 'Temple de la': 'Hall of', 'renommée': 'Fame', 'Champion': 'Champion' });
I18N_RX.push([/^(\d+(?:st|nd|rd|th)) place$/, '$1 place']);

/* ---- Dictionnaire anglais (étape 3 : récits de tournoi, nouvelles, bilans) ---- */
const I18N_HW = { 'aigle': 'eagle', 'albatros': 'albatross', 'birdie': 'birdie', 'bogey': 'bogey', 'double bogey': 'double bogey', 'triple bogey': 'triple bogey', 'quadruple bogey ou pire': 'quadruple bogey or worse', 'trou d’un coup': 'hole-in-one', 'par': 'par' };
const I18N_ART = w => { if (w === 'le par') return 'par'; const m = w.match(/^une? (.+)$/); const e = m ? (I18N_HW[m[1]] || m[1]) : (I18N_HW[w] || w); return m ? (/^[aeiou]/.test(e) ? 'an ' : 'a ') + e : e; };
const I18N_STK = s => s.replace(/^un coup$/, 'one stroke').replace(/^(\d+) coups?$/, (m, n) => I18N_PL(n, 'stroke'));
const I18N_GAP = v => v === 'égalité' || v === 'une égalité' || v === 'd’une égalité' ? 'a tie' : v.replace(/^(?:de )?(\d+) coups? d’avance$/, (m, n) => 'a ' + n + '-stroke lead').replace(/^(?:de )?(\d+) coups? de retard$/, (m, n) => 'a ' + n + '-stroke deficit');
const I18N_WINLIST = s => s.split(/, | et /).map(x => x
  .replace(/^(première|\d+e|\d+(?:st|nd|rd|th)) victoire en L(\d)$/, (m, o, l) => (o === 'première' ? '1st' : I18N_ORDX(o)) + ' win in L' + l)
  .replace(/^(une|\d+) victoires? en L(\d)$/, (m, n, l) => (n === 'une' ? '1 win' : I18N_PL(n, 'win')) + ' in L' + l)).reduce((a, x, i, A) => a + (i === 0 ? '' : i === A.length - 1 ? ' and ' : ', ') + x, '');
const I18N_EV = { 'un trou d’un coup': 'a hole-in-one', 'un albatros': 'an albatross', 'un aigle sur un par 4': 'an eagle on a par 4' };
Object.assign(I18N_EN, {
  'Premier titre en carrière pour': 'First career title for', 'Remontée spectaculaire de': 'Spectacular comeback by', 'Le vainqueur de la semaine dernière,': 'Last week’s winner,',
  'l’emporte sur': 'beats', 'tu l’emportes sur': 'you beat', 'et': 'and', 'Lutte pour le maintien :': 'Relegation battle:', 'Course à la promotion :': 'Promotion race:', 'Le meneur du classement,': 'The standings leader,',
  'Meilleure ronde :': 'Best round:', 'Meilleure ronde du tournoi :': 'Best round of the tournament:', 'Les fils de l’histoire': 'Storylines', 'Le tournoi en chiffres': 'The tournament in numbers',
  'un coup d’avance': 'one-stroke margin', 'pendant que': 'while', 'se contente du par': 'settles for par'
});
I18N_RX.push(
  // manchettes
  [/^l’emporte en prolongation à (.+)$/, 'wins in a playoff at $1'], [/^écrase le champ à (.+)$/, 'routs the field at $1'], [/^mène de bout en bout à (.+)$/, 'leads wire to wire at $1'],
  [/^l’emporte par un coup à (.+)$/, 'wins by one stroke at $1'], [/^triomphe à (.+)$/, 'triumphs at $1'],
  // chapeau
  [/^boucle le tournoi à (\S+?)(?:, (un coup|\d+ coups) devant( ses poursuivants)?| et gagne en prolongation)?(\.(?: .*)?)?$/, (m, t, g, sp, rest) => 'finishes at ' + t + (g ? ', ' + I18N_STK(g) + ' ahead of' + (sp ? ' the chasers' : '') : m.includes('prolongation') ? ' and wins in a playoff' : '') + (rest ? '.' + (rest.length > 1 ? ' ' + trText(rest.slice(2)) : '') : '')],
  [/^Il accusait (\d+) coups de retard après la ronde 1\.$/, 'He trailed by $1 strokes after round 1.'], [/^Sa ronde finale de (\S+) est la meilleure du dimanche\.$/, 'His final round of $1 was the best on Sunday.'],
  [/^La coupure tombe à (\S+)\.$/, 'The cut fell at $1.'], [/^Les (\d+) premiers, jusqu’à (\S+), sont payés\.$/, 'The top $1, through $2, get paid.'],
  [/^Les (\d+) premiers \(jusqu’à (\S+)\) touchent une part de la bourse\.$/, 'The top $1 (through $2) get a share of the purse.'],
  // coin du vainqueur
  [/^(\d+) ans$/, 'Age $1'],
  [/^Premier titre en carrière, et (il réussit|tu réussis) le coup en Ligue (\d)$/, (m, w, l) => 'First career title, and ' + (w === 'il réussit' ? 'he does it' : 'you do it') + ' in League ' + l],
  [/^(\d+)e victoire cette saison$/, (m, n) => ord(+n) + ' win this season'], [/^premier golfeur de son pays à gagner en Ligue (\d)$/, 'first golfer from his country to win in League $1'],
  [/^première victoire de son pays en Ligue (\d) depuis (\d+)$/, 'his country’s first win in League $1 since $2'],
  // moment clé
  [/^signe (le par|une? .+) pendant que$/, (m, w) => 'makes ' + I18N_ART(w) + ' while'],
  [/^(se contente du par|fait (une? .+?)) : l’écart passe (d’une égalité|de .+?) à (une égalité|.+)\.$/, (m, a, f, x, y) => (f ? 'makes ' + I18N_ART(f) : 'settles for par') + ': the margin goes from ' + I18N_GAP(x) + ' to ' + I18N_GAP(y) + '.'],
  // fils de l’histoire
  [/^réussit une (\d+)e coupure de suite\.$/, (m, n) => 'makes his ' + ord(+n) + ' straight cut.'], [/^Rivalité : (\d+)e fois que$/, (m, n) => 'Rivalry: ' + ord(+n) + ' time that'],
  [/^finissent aux deux premières places\.$/, 'finish first and second.'],
  // résumé (ce qui s’est passé)
  [/^remporte le tournoi( en prolongation)?$/, (m, p) => 'wins the tournament' + (p ? ' in a playoff' : '')], [/^(\d+) coups d’avance$/, '$1-stroke margin'],
  [/^(Tu menais|menait) après la ronde 1 et (tu finis|finit) le travail\.$/, (m, w) => (w === 'Tu menais' ? 'You led after round 1 and finished the job.' : 'led after round 1 and finished the job.')],
  [/^(Tu menais|menait) après la ronde 1 \((\S+)\) mais (rates?|termines?) ?(finalement la coupure|\S+)\.$/, (m, w, s, v, x) => (w === 'Tu menais' ? 'You led' : 'led') + ' after round 1 (' + s + ') but ' + (/^rate/.test(v) ? 'missed the cut in the end' : 'finished ' + x) + '.'],
  [/^Prolongation(?: à (\d+))? :$/, (m, n) => n ? n + '-way playoff:' : 'Playoff:'], [/^Prolongation(?: à (\d+))? : tu l’emportes sur$/, (m, n) => (n ? n + '-way playoff' : 'Playoff') + ': you beat'],
  [/^et (\d+) autres?\.$/, (m, n) => 'and ' + I18N_PL(n, 'other') + '.'],
  [/^, (rate|termine) (la coupure \((\S+) contre une coupure à (\S+)\)|\S+)\.$/, (m, v, x, a, c) => ', ' + (v === 'rate' ? 'misses the cut (' + a + ' against a cut at ' + c + ')' : 'finishes ' + x) + '.'],
  [/^Meneur du classement, tu rates la coupure \((\S+) contre une coupure à (\S+)\)\.$/, 'Standings leader, you miss the cut ($1 against a cut at $2).'],
  [/^, (\S+) du classement avant le tournoi, (l’emporte|termine (\S+))\.$/, (m, k, v, p) => ', ranked ' + k + ' before the tournament, ' + (p ? 'finishes ' + p : 'wins') + '.'],
  [/^Classé (\S+) avant le tournoi, tu l’emportes\.$/, 'Ranked $1 before the tournament, you win.'],
  [/^, (\d+) \(([^)]+)\), ronde (\d)(?: \(égalée par (\d+) autres?\))?\.$/, (m, s, r, n, k) => ', ' + s + ' (' + r + '), round ' + n + (k ? ' (matched by ' + I18N_PL(k, 'other') + ')' : '') + '.'],
  [/^, (\S+) \(ronde (\d)\)\.$/, ', $1 (round $2).'],
  [/^(Tu grimpes|grimpe) de (\d+) places entre les deux rondes pour finir (\S+)\.$/, (m, w, n, p) => (w === 'Tu grimpes' ? 'You climb' : 'climbs') + ' ' + n + ' spots between rounds to finish ' + p + '.'],
  // course au classement
  [/^(Tu es couronné champion|est couronné champion) de la ligue avec (\d+) points?\.$/, (m, w, p) => (w === 'Tu es couronné champion' ? 'You’re crowned' : 'is crowned') + ' league champion with ' + I18N_PL(p, 'point') + '.'],
  [/^(Tu prends|prend) la tête du classement \((\d+) points?\), à la place de$/, (m, w, p) => (w === 'Tu prends' ? 'You take' : 'takes') + ' the standings lead (' + I18N_PL(p, 'point') + '), replacing'],
  [/^(Tu conserves|conserve) la tête du classement \((\d+) points?\)(?:, avec (\d+) points? d’avance\.|, à égalité de points avec)$/, (m, w, p, d) => (w === 'Tu conserves' ? 'You keep' : 'keeps') + ' the standings lead (' + I18N_PL(p, 'point') + ')' + (d ? ', ' + I18N_PL(d, 'point') + ' ahead.' : ', tied on points with')],
  [/^\((\S+)\) devance$/, '($1) leads'], [/^\((\S+)\)(, premier relégable,)? (de (\d+) points?|sont à égalité de points)\.$/, (m, o, z, x, d) => '(' + o + ')' + (z ? ', first in the relegation zone,' : '') + (d ? ' by ' + I18N_PL(d, 'point') : ' are tied on points') + '.'],
  [/^\((\S+)\) et$/, '($1) and'],
  // faits marquants
  [/^(Tu réussis|réussit) (un trou d’un coup|un albatros|un aigle sur un par 4) au trou (\d+) \((?:(.+), )?ronde (\d)\)\.$/, (m, w, e, h, lg, r) => (w === 'Tu réussis' ? 'You make ' : 'makes ') + I18N_EV[e] + ' on hole ' + h + ' (' + (lg ? lg + ', ' : '') + 'round ' + r + ').'],
  // récap texte (fin de ronde)
  [/^(Tu remportes|(.+) remporte) le tournoi à (\S+?)(, après une prolongation\.|, à un coup du deuxième\.|, avec (\d+) coups d’avance\.|\.)$/, (m, w, n, t, tail, g) => (n ? n + ' wins' : 'You win') + ' the tournament at ' + t + (tail === '.' ? '.' : g ? ', ' + g + ' strokes ahead.' : /prolongation/.test(tail) ? ', after a playoff.' : ', one stroke ahead of second.')],
  [/^(Tu menais|(.+) menait) après la première ronde \((\S+)\) mais (rates? finalement la coupure|termines? au (\S+) rang)\.$/, (m, w, n, s, x, p) => (n ? n + ' led' : 'You led') + ' after the first round (' + s + ') but ' + (p ? 'finished ' + p : 'missed the cut in the end') + '.'],
  [/^(Tu étais|(.+) était) en tête dès la première ronde\.$/, (m, w, n) => (n ? n + ' was' : 'You were') + ' in the lead from the first round.'],
  [/^(Tu grimpes|(.+) grimpe) de (\d+) places entre les deux rondes pour finir (\S+)\.$/, (m, w, n, k, p) => (n ? n + ' climbs' : 'You climb') + ' ' + k + ' spots between rounds to finish ' + p + '.'],
  [/^Meilleure ronde du tournoi : (.+), (\S+) \(ronde (\d)\)\.$/, 'Best round of the tournament: $1, $2 (round $3).']
);
const I18N_CR2 = s => s.replace(/(\d+) victoires? et (\d+) autres? top-(\d+)/, (m, a, b, k) => I18N_PL(a, 'win') + ' and ' + b + ' other top-' + k + (b > 1 ? 's' : ''))
  .replace(/(\d+) victoires?/, (m, n) => I18N_PL(n, 'win')).replace(/(\d+) top-(\d+)(?!\d|s)/, (m, n, k) => n + ' top-' + k + (n > 1 ? 's' : '')).replace(/(\d+) fois dans les (\d+) derniers/, (m, n, k) => I18N_PL(n, 'finish', 'finishes') + ' in the bottom ' + k);
const I18N_WHERE = w => w === 'cette saison' ? 'this season' : w.replace(/^depuis (?:son|ton) arrivée en Ligue (\d)$/, 'since arriving in League $1');
Object.assign(I18N_EN, {"Commissaire": "Commissioner", "Mode commissaire": "Commissioner mode", "Activer le mode commissaire": "Turn on commissioner mode", "Débloque tous les réglages (même après ton premier tournoi), le niveau du circuit, et te permet de créer des golfeurs. L’activation est notée dans les nouvelles.": "Unlocks every setting (even after your first tournament) and the tour level, and lets you create golfers. Turning it on is noted in the news.", "Niveau du circuit (coups ajoutés à chaque ronde des adversaires)": "Tour level (strokes added to every opponent round)", "Créer un golfeur": "Create a golfer", "Aucun tournoi joué cette saison : il entrera tout de suite dans sa ligue.": "No tournament played this season: he joins his league right away.", "La saison est commencée : il fera son entrée à l’intersaison, dans la ligue choisie.": "The season has started: he will join the chosen league in the offseason.", "Nom": "Name", "Talent (0 à 1000)": "Talent (0 to 1000)", "Potentiel (0 à 1000)": "Potential (0 to 1000)", "potentiel": "potential", "Talents spéciaux": "Special talents", "Aucun": "None", "Bronze, Argent, Or : une force. Défaut léger ou marqué : une faiblesse. Le « Sauveur » n’a pas de défaut.": "Bronze, Silver, Gold: a strength. Minor or major weakness: a flaw. “Scrambler” has no flaw.", "Créer le golfeur": "Create the golfer", "En attente de l’intersaison": "Waiting for the offseason", "Mode commissaire : tous les réglages sont débloqués.": "Commissioner mode: every setting is unlocked.", "Mode commissaire activé": "Commissioner mode on", "Mode commissaire désactivé": "Commissioner mode off", "Niveau du circuit enregistré": "Tour level saved", "Entre un nom": "Enter a name", "Ce nom est déjà pris": "This name is already taken", "Prénom Nom": "First Last"});
I18N_RX.push(
  [/^🛠️ Mode commissaire activé en (.+)\.$/, '🛠️ Commissioner mode turned on in $1.'], [/^🛠️ Mode commissaire désactivé en (.+)\.$/, '🛠️ Commissioner mode turned off in $1.'],
  [/^🛠️ Commissaire : (.+) \((.+), (\d+) ans\) fait son entrée en Ligue (\d)\.$/, '🛠️ Commissioner: $1 ($2, age $3) joins League $4.'],
  [/^🛠️ Commissaire : (.+) \((.+), (\d+) ans\) fera son entrée à l’intersaison en Ligue (\d)\.$/, '🛠️ Commissioner: $1 ($2, age $3) will join League $4 in the offseason.'],
  [/^(.+) ajouté en Ligue (\d)$/, '$1 added to League $2'], [/^(.+) entrera à l’intersaison$/, '$1 will join in the offseason']);
Object.assign(I18N_EN, {"🛠️ Modifier ce golfeur": "🛠️ Edit this golfer", "Les changements s’appliquent tout de suite.": "Changes apply right away.", "La saison est commencée : un changement de ligue se fera à l’intersaison.": "The season has started: a league change will happen in the offseason.", "Golfeur modifié": "Golfer updated"});
I18N_RX.push([/^🛠️ Commissaire : (.+) devient (.+)\.$/, '🛠️ Commissioner: $1 becomes $2.'], [/^🛠️ Commissaire : (.+) a été modifié\.$/, '🛠️ Commissioner: $1 was edited.']);
Object.assign(I18N_EN, {"Tee auto": "Auto tee", "Pour chacun, une liste de terrains où piger. Vide : on pige parmi les terrains qui passent les filtres. Choisis le tee de chaque terrain, ou « Tee auto » : le tee le plus proche du terrain moyen (selon tes tees, s’il y en a).": "For each, a list of courses to draw from. Empty: we draw from the courses that pass the filters. Pick each course’s tee, or “Auto tee”: the tee closest to the average course (within your tees, if any)."});
I18N_RX.push([/^(.+) · tee auto$/, '$1 · auto tee']);
Object.assign(I18N_EN, {"classées par les dépisteurs": "ranked by the scouts", "Cuvées": "Classes", "Cuvée précédente": "Previous class", "Cuvée suivante": "Next class", "Choisir une cuvée": "Choose a class", "Aucune cuvée pour l’instant : la première arrive à la fin de ta première saison.": "No class yet: the first one arrives at the end of your first season.", "Chaque cuvée de recrues, de la plus récente à la plus ancienne. Touche une année pour voir la classe au complet.": "Every rookie class, newest first. Tap a year to see the full class.", "Joyau :": "Gem:", "Recrue de l’année :": "Rookie of the Year:"});
I18N_RX.push([/^(\d+) recrues?$/, (m, n) => n + (n === '1' ? ' rookie' : ' rookies')]);
Object.assign(I18N_EN, {"Saison par saison": "Season by season", "Touche l’année pour voir la ligue de cette saison, ou la flèche pour voir tous les tournois et les rondes.": "Tap the year to see that season’s league, or the arrow to see every tournament and round.", "Voir la ligue cette saison-là": "See the league that season", "En cours": "In progress", "Avant son déplacement": "Before his move", "tourn.": "events", "vict.": "wins", "top 10": "top 10", "coupures ratées": "missed cuts", "meilleur": "best", "moy. ronde": "avg round", "gains": "earnings", "fairways": "fairways", "putts": "putts", "sauv.": "scr.", "Pén.": "Pen.", "Aucun tournoi.": "No tournaments.", "Ronde 1": "Round 1", "Ronde 2": "Round 2"});
Object.assign(I18N_EN, {"Ville natale": "Hometown", "Taille": "Height", "Poids": "Weight", "Côté": "Handedness", "Gaucher": "Left-handed", "Droitier": "Right-handed", "Personnalité médiatique": "Media personality", "Au hasard": "Random"});
I18N_RX.push([/^🎤 (.+) \((.+)\) : « (.+) »$/, (m, n, k, q) => '🎤 ' + n + ' (' + trText(k) + '): “' + trText(q) + '”'], [/^On oublie parfois que j’ai seulement (\d+) ans\.$/, 'People sometimes forget I’m only $1.']);
Object.assign(I18N_EN, {"VILLE NATALE": "HOMETOWN", "TAILLE": "HEIGHT", "POIDS": "WEIGHT", "CÔTÉ": "HANDEDNESS", "Taille (pi\u2032po)": "Height (ft\u2032in)", "Poids (lb)": "Weight (lb)"});
Object.assign(I18N_EN, {"Photos des golfeurs": "Golfer photos", "Afficher les photos": "Show photos", "Choisir le dossier Graphics": "Choose the Graphics folder", "Changer de dossier": "Change folder", "Choisis le dossier Graphics une seule fois : le jeu lit les nouvelles planches et les nouveaux décors chaque fois que tu le synchronises.": "Choose the Graphics folder once: the game reads new sheets and backgrounds every time you sync it.", "Importer des planches": "Import sheets", "Importer des décors": "Import backgrounds", "Détail de la bibliothèque": "Library details", "Vider la bibliothèque": "Empty the library", "Tout effacer": "Erase everything", "Autre visage": "Other face", "Autre décor": "Other background", "Sans photo": "No photo", "Bibliothèque vidée": "Library emptied", "Aucune nouvelle image": "No new images", "Aucune autre photo dans sa catégorie": "No other photo in his category", "Accès au dossier refusé": "Folder access denied", "Traitement déjà en cours": "Already processing", "Le navigateur refuse le stockage des photos ici": "This browser refuses to store photos here", "Britanniques et Irlandais": "British and Irish", "Nord-Américains (origine européenne)": "North Americans (European descent)", "Europe du Nord": "Northern Europe", "Europe de l’Ouest et du Sud": "Western and Southern Europe", "Asie de l’Est": "East Asia", "Afrique et Caraïbes": "Africa and Caribbean", "Amérique latine": "Latin America", "Asie du Sud": "South Asia", "Asie du Sud-Est": "Southeast Asia", "Moyen-Orient, Afrique du Nord, Asie centrale": "Middle East, North Africa, Central Asia", "Pacifique et Maoris": "Pacific and Maori"});
I18N_RX.push([/^Synchroniser le dossier (.+)$/, 'Sync the $1 folder'], [/^Traitement (\d+) sur (\d+) · (.+)$/, 'Processing $1 of $2 · $3']);
const I18N_RECV = v => v.replace(/^(\d+) ans$/, '$1').replace(/ coups?$/, x => /s$/.test(x) ? ' strokes' : ' stroke');
I18N_RX.push(
  [/^(Tu montes|monte) en Ligue (\d) grâce à (.+?) (cette saison|depuis (?:son|ton) arrivée en Ligue \d)\.$/, (m, w, l, c, wh) => (w === 'Tu montes' ? 'You move up' : 'moves up') + ' to League ' + l + ' thanks to ' + I18N_CR2(c) + ' ' + I18N_WHERE(wh) + '.'],
  [/^(Tu descends|descend) en Ligue (\d) après (.+?) (cette saison|depuis (?:son|ton) arrivée en Ligue \d)\.$/, (m, w, l, c, wh) => (w === 'Tu descends' ? 'You drop' : 'drops') + ' to League ' + l + ' after ' + I18N_CR2(c) + ' ' + I18N_WHERE(wh) + '.'],
  [/^(Tu bats|bat) « (.+) » avec (.+?) \(ancien : (.+?),$/, (m, w, r, v, o) => (w === 'Tu bats' ? 'You break' : 'breaks') + ' “' + I18N_RECNM(r) + '” with ' + I18N_RECV(v) + ' (previous: ' + I18N_RECV(o) + ','],
  [/^Record \((.+)\) : (Tu bats|(.+) bat) « (.+) » avec (.+?) \(ancien : (.+?),$/, (m, sc, w, nb, r, v, o) => 'Record (' + trText(sc) + '): ' + (nb ? nb + ' breaks' : 'You break') + ' “' + I18N_RECNM(r) + '” with ' + I18N_RECV(v) + ' (previous: ' + I18N_RECV(o) + ','],
  [/^Au total : (\S+) coups?$/, 'Total: $1 strokes'], [/^\. Meilleur trou : le (\d+) en ronde (\d) \((\S+)\)\. Plus coûteux : le (\d+) en ronde (\d) \((\S+)\)\.$/, '. Best hole: No. $1 in round $2 ($3). Most costly: No. $4 in round $5 ($6).'],
  [/^Meilleur Canadien :$/, 'Best Canadian:'], [/^Meilleur Canadien : aucun qualifié \((\d+) au départ\)\.$/, 'Best Canadian: none made the cut ($1 started).'],
  [/^, rate la coupure\.$/, ', misses the cut.']
);
/* ---- nouvelles, bilans de saison, dépisteurs ---- */
const I18N_SCOUT = {
  'Un talent qui saute aux yeux.': 'A talent that jumps off the page.', 'Le genre de recrue qu’on voit rarement passer.': 'The kind of rookie you rarely see come through.', 'Tous les dépisteurs ont noté son nom.': 'Every scout has his name written down.',
  'Très régulier, rarement spectaculaire.': 'Very steady, rarely spectacular.', 'Une machine à faire des pars : il fait toutes ses coupures.': 'A par machine: he makes every cut.',
  'Imprévisible : capable d’un 64 comme d’un 80 la même semaine.': 'Unpredictable: capable of a 64 and an 80 in the same week.', 'Des montagnes russes : brillant un jour, perdu le lendemain.': 'A roller coaster: brilliant one day, lost the next.',
  'Un sang-froid de vétéran quand ça compte.': 'A veteran’s composure when it counts.', 'Il aime les fins de tournoi serrées.': 'He loves a tight finish.',
  'Encore fragile sous la pression.': 'Still fragile under pressure.', 'Il lui reste à apprendre à finir le travail.': 'He still has to learn how to close.',
  'Développement lent, mais les dépisteurs croient à une éclosion tardive.': 'Slow developer, but the scouts believe in a late bloom.',
  'Très jeune et encore brut : il peut devenir n’importe quoi.': 'Very young and still raw: he could become anything.', 'Le plus brut des diamants : tout reste à faire.': 'The roughest of diamonds: everything is still ahead.',
  'Déjà mature : ce que vous voyez est presque ce que vous aurez.': 'Already mature: what you see is almost what you’ll get.', 'Il arrive tard, mais prêt à jouer tout de suite.': 'A late arrival, but ready to play right away.',
  'Un profil complet, sans grande faiblesse.': 'A complete profile, no major weakness.', 'Solide partout, excellent nulle part.': 'Solid everywhere, excellent nowhere.', 'Un travailleur : il progresse chaque saison.': 'A grinder: he improves every season.'
};
const I18N_SCQ = q => { const parts = q.match(/[^.]+\.(?:\s|$)/g); if (!parts) return null; const t = parts.map(x => I18N_SCOUT[x.trim()]); return t.every(Boolean) ? t.join(' ') : null; };
const I18N_FORM = { 'traverse une mauvaise séquence': 'is in a slump', 'est dans une passe chaude': 'is on a hot streak', 'joue dans une forme irréelle en ce moment': 'is playing out of his mind right now', 'entre dans une période de domination : le phénomène est intouchable en ce moment': 'enters a period of dominance: the phenom is untouchable right now' };
Object.assign(I18N_SCOUT, {});
Object.assign(I18N_EN, { 'Record (carrière) :': 'Record (career):', 'dont': 'including', 'Exceptionnelle': 'Exceptional', 'Dans la moyenne': 'Average', 'Faible': 'Weak', 'Aucune': 'None' });
I18N_RX.push(
  [/^« (.+) »$/, (m, q) => { const t = I18N_SCQ(q); return t ? '“' + t + '”' : m; }],
  [/^(.+)$/, (m, q) => { const t = /^[A-ZÉ]/.test(q) && /\.$/.test(q) ? I18N_SCQ(q) : null; return t || m; }],
  [/^remporte son premier titre en (.+)\.$/, 'wins his first title in $1.'],
  [/^\((\S+) en (.+?)\) (traverse une mauvaise séquence|est dans une passe chaude|joue dans une forme irréelle en ce moment|entre dans une période de domination : le phénomène est intouchable en ce moment)\.$/, (m, r, l, f) => '(' + r + ' in ' + l + ') ' + I18N_FORM[f] + '.'],
  [/^(.+) \((\S+) en (.+?)\) (traverse une mauvaise séquence|est dans une passe chaude|joue dans une forme irréelle en ce moment|entre dans une période de domination : le phénomène est intouchable en ce moment)\.$/, (m, n, r, l, f) => n + ' (' + r + ' in ' + l + ') ' + I18N_FORM[f] + '.'],
  [/^(⚡ )?(?:(.+) )?confirme ce que tout le monde soupçonnait : un phénomène est né \((\d+) victoires en Ligue 1 (cette saison|en carrière)\)\.$/, (m, z, n, k, w) => (z || '') + (n ? n + ' ' : '') + 'confirms what everyone suspected: a phenom is born (' + k + ' League 1 wins ' + (w === 'cette saison' ? 'this season' : 'in his career') + ').'],
  [/^(.+), meneur du classement en (.+), rate la coupure\.$/, '$1, the $2 standings leader, misses the cut.'], [/^, meneur du classement en (.+), rate la coupure\.$/, ', the $1 standings leader, misses the cut.'],
  [/^(.+) remporte son premier titre en (.+)\.$/, '$1 wins his first title in $2.'],
  [/^(.+) monte en Ligue (\d) en pleine saison \((.+)\) !$/, (m, n, l, c) => n + ' moves up to League ' + l + ' mid-season (' + I18N_CR2(c) + ')!'],
  [/^(.+) dégringole en Ligue (\d) après (.+)\.$/, (m, n, l, c) => n + ' drops to League ' + l + ' after ' + I18N_CR2(c) + '.'],
  [/^(?:(.+) )?\((\d+) ans\) (prend sa retraite|perd sa place sur le circuit \((\d+) saisons en Ligue 4\)) après (\d+) saisons?(?: et (\d+) titres?)?\.$/, (m, n, a, k, f, cs, cw) => (n ? n + ' ' : '') + '(' + a + ') ' + (f ? 'loses his place on the tour (' + f + ' seasons in League 4)' : 'retires') + ' after ' + I18N_PL(cs, 'season') + (cw ? ' and ' + I18N_PL(cw, 'title') : '') + '.'],
  [/^(?:(.+) )?\((\d+) ans\) (connaît une éclosion tardive : personne ne l’attendait là|semble avoir franchi un cap au cours de la dernière année|déçoit : on attendait mieux, les dépisteurs revoient son potentiel à la baisse|perd soudainement la touche : personne ne s’explique la chute)\.$/, (m, n, a, k) => (n ? n + ' ' : '') + '(' + a + ') ' + ({ 'connaît une éclosion tardive : personne ne l’attendait là': 'is a late bloomer: nobody saw it coming', 'semble avoir franchi un cap au cours de la dernière année': 'seems to have taken a step forward over the past year', 'déçoit : on attendait mieux, les dépisteurs revoient son potentiel à la baisse': 'disappoints: more was expected, and the scouts lower his potential', 'perd soudainement la touche : personne ne s’explique la chute': 'suddenly loses his touch: nobody can explain the fall' }[k]) + '.'],
  [/^(?:(.+) )?sort d’une année difficile : son niveau a reculé\.$/, (m, n) => (n ? n + ' ' : '') + 'comes off a tough year: his level has dropped.'],
  [/^, fait son entrée sur le circuit\.$/, ', joins the tour.'],
  [/^(.+) \((\d+) ans\), (fils de l’ancien golfeur|fils de|frère jumeau de|frère cadet de|cousin de l’ancien golfeur|cousin de) (.+), fait son entrée sur le circuit\.$/, (m, n, a, r, p) => n + ' (' + a + '), ' + ({ 'fils de l’ancien golfeur': 'son of former golfer', 'fils de': 'son of', 'frère jumeau de': 'twin brother of', 'frère cadet de': 'younger brother of', 'cousin de l’ancien golfeur': 'cousin of former golfer', 'cousin de': 'cousin of' }[r]) + ' ' + p + ', joins the tour.'],
  [/^(?:(.+) )?entre au Temple de la renommée (dès son premier scrutin|à sa (\S+) année sur le scrutin) \(([\d,.]+)\s?% des votes\)\.$/, (m, n, w, o, p) => (n ? n + ' ' : '') + 'is inducted into the Hall of Fame ' + (o ? 'in his ' + I18N_ORDX(o) + ' year on the ballot' : 'on his first ballot') + ' (' + p.replace(',', '.') + '% of the vote).'],
  [/^(?:(.+) )?est intronisé (au premier scrutin|à sa (\S+) tentative) \(([\d,.]+)\s?%\)\.$/, (m, n, w, o, p) => (n ? n + ' ' : '') + 'is inducted ' + (o ? 'on his ' + I18N_ORDX(o) + ' try' : 'on the first ballot') + ' (' + p.replace(',', '.') + '%).'],
  // bilan de saison
  [/^(Tu remportes|remporte) le classement final de la Ligue (\d)( \((?:tu as|il a) été promu en cours de saison\))? avec (\d+) points?(?: et (\d+) victoires?)?(, (\d+) points? d’avance sur|, à égalité de points avec)?(\.)?(?: C’est (son|ton) (\S+) titre de champion de ligue\.)?$/, (m, w, l, pr, p, v, tail, d, dot, who, o) => (w === 'Tu remportes' ? 'You win' : 'wins') + ' the League ' + l + ' final standings' + (pr ? (w === 'Tu remportes' ? ' (you were promoted mid-season)' : ' (he was promoted mid-season)') : '') + ' with ' + I18N_PL(p, 'point') + (v ? ' and ' + I18N_PL(v, 'win') : '') + (tail ? (d ? ', ' + I18N_PL(d, 'point') + ' ahead of' : ', tied on points with') : '') + (dot ? '.' : '') + (who ? ' It’s ' + (who === 'son' ? 'his' : 'your') + ' ' + I18N_ORDX(o) + ' league title.' : '')],
  [/^\. C’est (son|ton) (\S+) titre de champion de ligue\.$/, (m, w, o) => '. It’s ' + (w === 'son' ? 'his' : 'your') + ' ' + I18N_ORDX(o) + ' league title.'],
  [/^\(([^()]+)\)(,|\.)?(?: et (\d+) autres?\.)?$/, (m, c, p, n) => { const t = I18N_CR2(c); return t === c && !n ? m : '(' + t + ')' + (p || '') + (n ? ' and ' + I18N_PL(n, 'other') + '.' : ''); }],
  [/^\(([^()]+)\) et (\d+) autres?\.$/, (m, c, n) => '(' + I18N_CR2(c) + ') and ' + I18N_PL(n, 'other') + '.'],
  [/^(Ta carrière prend fin|range ses clubs|perd sa place \((\d+) saisons en Ligue 4 sans monter\)) à (\d+) ans : (\d+) saisons?, (aucun titre|(\d+) titres?)(?:, (.+?) de gains)?(?:, dernier niveau « (.+) »)?\.$/, (m, w, f, a, cs, t, tn, g, lv) => ({ 'Ta carrière prend fin': 'Your career ends', 'range ses clubs': 'hangs up his clubs' }[w] || 'loses his tour card (' + f + ' seasons in League 4 without moving up)') + ' at ' + a + ': ' + I18N_PL(cs, 'season') + ', ' + (tn ? I18N_PL(tn, 'title') : 'no titles') + (g ? ', ' + g + ' in earnings' : '') + (lv ? ', last level “' + lv + '”' : '') + '.'],
  [/^meilleure ronde : (.+)$/, 'best round: $1'], [/^et (\d+) autres?$/, (m, n) => 'and ' + I18N_PL(n, 'other')],
  [/^(\d+) golfeurs? classés? (?:ont|a) pris leur retraite\.$/, (m, n) => I18N_PL(n, 'ranked golfer') + ' retired.'],
  [/^Ton classement final en (.+)$/, 'Your final standing in $1'],
  [/^Relégués en Ligue (\d) \(les (\d+) derniers\) : dont$/, 'Relegated to League $1 (the bottom $2): including'],
  [/^Record \((.+)\) :$/, (m, sc) => 'Record (' + (sc === 'carrière' ? 'career' : trText(sc)) + '):']
);
/* derniers recours : morceau qui commence par une ponctuation, ou plusieurs phrases à la suite */
const I18N_LAST = [
  [/^à ([A-Z].+)$/, 'at $1'],
  [/^([.,:]) (.+)$/, (m, p, x) => { const t = trText(x); return t === x ? m : p + ' ' + t; }],
  [/^(.+?[.!?]) ([A-ZÀ-ÝÉ«].+)$/, (m, a, b) => { const ta = trText(a), tb = trText(b); return ta === a && tb === b ? m : ta + ' ' + tb; }]
];

I18N_RX.unshift(
  [/^(\S+) victoire en carrière, toutes en L(\d)(?:, la première depuis (\d+))?$/, (m, o, l, y) => I18N_ORDX(o.replace('1re', '1er')) + ' career win, all in L' + l + (y ? ', the first since ' + y : '')],
  [/^(\S+) victoire en carrière(?: \(la première depuis (\d+)\))?, ([^·]+)$/, (m, o, y, li) => I18N_ORDX(o.replace('1re', '1er')) + ' career win' + (y ? ' (the first since ' + y + ')' : '') + ': ' + I18N_WINLIST(li)]
);
I18N_RX.unshift([/^: (.+) → (.+) \(([+−]\d+) paliers?\)( · (?:promu|relégué) en Ligue \d)?$/, (m, a, b, n, t) => ': ' + a + ' → ' + b + ' (' + n + (/^[+−]1$/.test(n) ? ' tier)' : ' tiers)') + (t ? ' · ' + (/promu/.test(t) ? 'promoted' : 'relegated') + ' to League ' + t.slice(-1) : '')]);
I18N_RX.push([/^est intronisé \(([\d,.]+)\s?%\)\.$/, (m, p) => 'is inducted (' + p.replace(',', '.') + '%).']);

/* ---- Partie Duo et Play Now ---- */
Object.assign(I18N_EN, { 'gagné au total': 'won in total', 'déjà remis': 'already paid out', 'à remettre': 'to pay out', 'Gagnant L1, petit tournoi ($)': 'L1 winner, small tournament ($)', 'Gagnant L1, gros tournoi ($)': 'L1 winner, big tournament ($)',
  'Handicap d’équipe (coups ajoutés à votre score)': 'Team handicap (strokes added to your score)', 'Hors des places payées : aucun point': 'Outside the paid places: no points', 'Joueurs payés (plus les égalités)': 'Players paid (plus ties)',
  'Gain estimé selon ta position actuelle': 'Estimated winnings at your current position', 'Un coup par trou, en commençant par les trous les plus difficiles (index 1, 2, 3…). Votre score affiché l’inclut. Avec +4 et vos scores habituels : environ 1 victoire sur 10.': 'One stroke per hole, starting with the hardest holes (index 1, 2, 3…). Your displayed score includes it. With +4 and your usual scores: about 1 win in 10.',
  'Les valeurs par défaut ont été calibrées par simulation (40 saisons). Le trait blanc sur chaque curseur montre la valeur par défaut. Les réglages sont propres à cette partie (la Partie Duo a ses propres réglages).': 'Default values were calibrated by simulation (40 seasons). The white mark on each slider shows the default value. Settings are specific to this game (the Duo game has its own settings).' });
I18N_RX.push(
  [/^C’est payé \((.+)\)$/, 'Paid ($1)'], [/^Montant minimum dans le top (\d+) \(\$\)$/, 'Minimum amount in the top $1 ($)'], [/^🐷 (.+) pour la tirelire$/, '🐷 $1 for the piggy bank'],
  [/^Le gagnant touchait (.+) · à remettre en tout : (.+)$/, 'The winner got $1 · total to pay out: $2'], [/^(\$[\d.,]+|[\d.,]+\s?\$) à (\$[\d.,]+|[\d.,]+\s?\$)$/, '$1 to $2'],
  [/^Pas de coup de handicap sur ce trou(?: · (.+))?$/, (m, x) => 'No handicap stroke on this hole' + (x ? ' · ' + x : '')], [/^(Un|(\d+)) coups? de handicap sur ce trou(?: · (.+))?$/, (m, a, n, x) => (n ? n + ' handicap strokes' : '1 handicap stroke') + ' on this hole' + (x ? ' · ' + x : '')],
  [/^· ligne de paye \(top (\d+)\) : (\S+)$/, '· pay line (top $1): $2'], [/^· (\d+) payés$/, '· $1 paid'], [/^(Moins|Plus) un coup pour (.+)$/, (m, k, n) => (k === 'Moins' ? 'One stroke less for ' : 'One stroke more for ') + n],
  [/^Valider le trou (\d+)$/, 'Confirm hole $1'],
  [/^Les (\d+) premiers \(et les égalités\) sont payés, selon leur position, en proportion du gagnant\. Exemple avec (.+?) : (.+)\. Les égalités se partagent les places\. Montants arrondis au 5 cents\.$/, (m, n, x, l) => 'The top ' + n + ' (and ties) get paid by position, in proportion to the winner. Example with ' + x.replace(/(\d+) \$/, '$$$1') + ': ' + l.replace(/(\d+)e/g, (q, k) => ord(+k)).replace(/ à /g, ' to ').replace(/ \(et égalités\)/, ' (and ties)').replace(/(\d+),(\d+) \$/g, '$$$1.$2').replace(/(\d+) \$/g, '$$$1') + '. Ties share the places. Amounts rounded to 5 cents.']
);
Object.assign(I18N_EN, { 'carrière': 'career', 'NC': 'NR', 'Tu remportes le tournoi en prolongation': 'You win the tournament in a playoff' });
I18N_RX.push(
  [/^([▲▼]) Tu (montes|descends) en (Ligue \d · .+)$/, (m, a, k, l) => a + ' You ' + (k === 'montes' ? 'move up' : 'drop') + ' to ' + trText(l)],
  [/^en pleine saison, (?:grâce à|après) (.+?)\. Ton prochain tournoi se joue dans cette ligue\.$/, (m, c) => (/(victoire|top)/.test(c) && !/derniers/.test(c) ? 'mid-season, thanks to ' : 'mid-season, after ') + I18N_CR2(c) + '. Your next tournament is played in this league.'],
  [/^(.+) (a (\d+) ans|compte (\d+) saisons? sur le circuit)\. La retraite ne te sera jamais imposée : c’est toi qui décides, entre deux saisons\.$/, (m, n, x, a, c) => n + (a ? ' is ' + a : ' has ' + I18N_PL(c, 'season') + ' on the tour') + '. Retirement will never be forced on you: you decide, between seasons.'],
  [/^Record \((.+)\) : tu améliores ton propre « (.+) » : (.+) \(avant : (.+)\)\.$/, (m, sc, r, v, o) => 'Record (' + (sc === 'carrière' ? 'career' : trText(sc)) + '): you improve your own “' + I18N_RECNM(r) + '”: ' + I18N_RECV(v) + ' (before: ' + I18N_RECV(o) + ').'],
  [/^cuvée selon les dépisteurs · (la meilleure|la plus faible|\S+) de tes (\d+) cuvées$/, (m, r, n) => 'class according to the scouts · ' + (r === 'la meilleure' ? 'the best' : r === 'la plus faible' ? 'the weakest' : r) + ' of your ' + n + ' classes']
);
/* ---- étape 4 : restes repérés à la vérification ---- */
Object.assign(I18N_EN, { 'en carrière': 'career', 'Intersaisons': 'Offseasons', 'Tournois': 'Tournaments' });
I18N_RX.push([/^(\d+)–(\d+) M\$$/, '$$$1–$2M'], [/^(\d+)-(\d+) M\$$/, '$$$1–$2M']);
Object.assign(I18N_EN, { 'Pts Temple': 'HOF pts', 'Prénom Nom': 'First Last' });
I18N_GEN.push([/(^|[^\d,])(\d),(\d\d)(?!\d)/g, '$1$2.$3']);
I18N_RX.push([/^Tous \((\d+)\)$/, 'All ($1)'], [/^Tout \((\d+)\)$/, 'All ($1)']);

I18N_RX.push([/^⛳ Coup de handicap sur ce trou :$/, '⛳ Handicap stroke on this hole:'], [/^à votre score \(index (\d*)\)(.*)$/, 'to your score (index $1)$2']);
/* ---- Talents cachés (v214) ---- */
const I18N_TALLBL = { 'spécialiste des par 3': 'Par 3 specialist', 'faible sur les par 3': 'Struggles on par 3s', 'machine à par 4': 'Par 4 machine', 'faible sur les par 4': 'Struggles on par 4s',
  'spécialiste des par 5': 'Par 5 specialist', 'faible sur les par 5': 'Struggles on par 5s', 'joueur de vent': 'Wind player', 'déteste le vent': 'Hates the wind', 'cogneur': 'Big hitter',
  'mal à l’aise sur les longs terrains': 'Uneasy on long courses', 'joueur de précision': 'Precision player', 'mal à l’aise sur les terrains courts': 'Uneasy on short courses', 'sauveur': 'Scrambler',
  'partant rapide': 'Fast starter', 'démarre lentement': 'Slow starter', 'finisseur': 'Closer', 'faiblit en ronde finale': 'Fades in the final round' };
const I18N_TALLV = { 'bronze': 'bronze', 'argent': 'silver', 'or': 'gold', 'défaut léger': 'minor weakness', 'défaut marqué': 'major weakness' };
const talEnLbl = x => I18N_TALLBL[x.toLowerCase()] || x;
Object.keys(I18N_TALLBL).forEach(k => { I18N_EN[k.charAt(0).toUpperCase() + k.slice(1)] = I18N_TALLBL[k]; });
Object.assign(I18N_EN, { 'Bronze': 'Bronze', 'Argent': 'Silver', 'Or': 'Gold', 'Défaut léger': 'Minor weakness', 'Défaut marqué': 'Major weakness', 'Trait caché': 'Hidden trait', 'Pas encore révélé': 'Not revealed yet',
  'Trait caché : les dépisteurs soupçonnent quelque chose, mais rien n’est encore confirmé. Un talent fort se révèle plus vite.': 'Hidden trait: the scouts suspect something, but nothing is confirmed yet. A strong talent shows up sooner.',
  'Les traits cachés se révèlent avec les saisons : un talent fort se voit plus vite.': 'Hidden traits reveal themselves over the seasons: a strong talent shows up sooner.',
  'Joue encore quelques rondes : tes talents se dessinent à partir de tes vraies cartes (au moins 10 rondes).': 'Play a few more rounds: your talents take shape from your real scorecards (at least 10 rounds).',
  'Aucune force ni faiblesse marquée selon tes cartes : un jeu bien équilibré.': 'No clear strength or weakness on your scorecards: a well-balanced game.',
  'Selon tes vraies cartes, par type de trou. Aucun effet sur tes scores.': 'Based on your real scorecards, by hole type. No effect on your scores.',
  'Talents cachés': 'Hidden talents', 'Environ un golfeur sur trois a une force (par 3, vent, longs terrains…) et un sur dix un défaut : un petit avantage dans les bonnes conditions. Ils se révèlent et évoluent avec les saisons.': 'About one golfer in three has a strength (par 3s, wind, long courses…) and one in ten a weakness: a small edge in the right conditions. They reveal themselves and evolve over the seasons.',
  'Ses fers sont redoutables sur les par 3.': 'His irons are deadly on par 3s.', 'Une constance rare sur les par 4.': 'Rare consistency on par 4s.', 'Il attaque les par 5 en deux coups : plus d’aigles et de birdies.': 'He goes for par 5s in two: more eagles and birdies.',
  'Le vent le dérange moins que les autres : plus ça souffle, plus il gagne du terrain.': 'Wind bothers him less than others: the harder it blows, the more ground he gains.',
  'Sa longueur l’avantage sur les longs terrains ; sur les courts, il perd un peu de cet avantage.': 'His length pays off on long courses; on short ones he loses a bit of that edge.',
  'Sa précision paie sur les terrains courts ; sur les longs, il souffre un peu.': 'His accuracy pays off on short courses; on long ones he suffers a little.', 'Il sauve des pars impossibles : moins de doubles bogeys.': 'He saves impossible pars: fewer double bogeys.',
  'Il part toujours fort en ronde 1.': 'He always starts fast in round 1.', 'Il se transcende en ronde finale.': 'He raises his game in the final round.', 'Les par 3 lui coûtent des coups.': 'Par 3s cost him strokes.',
  'Les par 4 lui coûtent des coups.': 'Par 4s cost him strokes.', 'Il gaspille ses occasions sur les par 5.': 'He wastes his chances on par 5s.', 'Le vent le dérange plus que les autres.': 'Wind bothers him more than others.',
  'Il manque de longueur : les longs terrains le pénalisent.': 'He lacks length: long courses hurt him.', 'Il manque de précision : les terrains courts ne l’avantagent pas.': 'He lacks accuracy: short courses don’t favor him.',
  'Il démarre lentement en ronde 1.': 'He starts slowly in round 1.', 'Il faiblit souvent en ronde finale.': 'He often fades in the final round.',
  'perd des coups quand le terrain est long': 'loses strokes on long courses', 'gagne des coups quand le terrain est long': 'gains strokes on long courses',
  'perd des coups quand le terrain est court': 'loses strokes on short courses', 'gagne des coups quand le terrain est court': 'gains strokes on short courses' });
const I18N_TALSH = x => x.replace(/^([−+])([\d,.]+) coup par ronde sur les par (\d)$/, (m, sg, v, p) => sg + v.replace(',', '.') + ' stroke per round on par ' + p + 's')
  .replace(/^le vent lui coûte (\d+) % de (plus|moins)$/, (m, v, k) => 'wind costs him ' + v + '% ' + (k === 'plus' ? 'more' : 'less'))
  .replace(/^évite les gros scores : −([\d,.]+) coup par ronde$/, (m, v) => 'avoids big numbers: −' + v.replace(',', '.') + ' stroke per round')
  .replace(/^([−+])([\d,.]+) coup en (ronde 1|ronde finale)$/, (m, sg, v, r) => sg + v.replace(',', '.') + ' stroke in ' + (r === 'ronde 1' ? 'round 1' : 'the final round'))
  .replace(/^([−+])([\d,.]+) coup par trou$/, (m, sg, v) => sg + v.replace(',', '.') + ' stroke per hole');
const I18N_TALHIST = x => x.split(' · ').map(p => p.replace(/^connu avant ton arrivée$/, 'known before you arrived').replace(/^découvert en (\d+)$/, 'discovered in $1')
  .replace(/^(bronze|argent|or) en (\d+)$/, (m, l, y) => I18N_TALLV[l] + ' in ' + y).replace(/^atténué en (\d+)$/, 'eased in $1').replace(/^corrigé en (\d+)$/, 'fixed in $1').replace(/^disparu en (\d+)$/, 'faded in $1')).join(' · ');
I18N_RX.push(
  [/^(Bronze|Argent|Or|Défaut léger|Défaut marqué) · (.+)$/, (m, l, x) => trText(l) + ' · ' + (I18N_TALSH(x) !== x ? I18N_TALSH(x) : trText(x))],
  [/^(Bronze|Argent|Or|Défaut léger|Défaut marqué) : ([^.]+)\.$/, (m, l, x) => trText(l) + ': ' + (I18N_TALSH(x) !== x ? I18N_TALSH(x) : trText(x)) + '.'],
  [/^Historique : (.+)\.$/, (m, x) => 'History: ' + I18N_TALHIST(x) + '.'],
  [/^Sur les par (\d), tu joues ([\d,.]+) coup par trou (mieux|moins bien) que d’habitude, en comparant tes cartes à la moyenne du circuit\.$/, (m, p, v, k) => 'On par ' + p + 's, you play ' + v.replace(',', '.') + ' stroke per hole ' + (k === 'mieux' ? 'better' : 'worse') + ' than usual, comparing your scorecards with the tour average.'],
  [/^(.*?) ?: les dépisteurs lui découvrent un talent, (.+) \((bronze|argent|or)\)\.$/, (m, pre, l, v) => (pre ? pre + ': ' : ': ') + 'the scouts uncover a talent, ' + talEnLbl(l).toLowerCase() + ' (' + I18N_TALLV[v] + ').'],
  [/^(.*?) ?: les dépisteurs relèvent un point faible, (.+)\.$/, (m, pre, l) => (pre ? pre + ': ' : ': ') + 'the scouts spot a weakness, ' + talEnLbl(l).toLowerCase() + '.'],
  [/^(.*?) ?progresse : (.+) passe au niveau (bronze|argent|or)\.$/, (m, pre, l, v) => (pre ? pre + ' ' : '') + 'improves: ' + talEnLbl(l) + ' moves up to ' + I18N_TALLV[v] + '.']
);
/* ---- Intersaison en chapitres (v215) ---- */
/* v428 : chapitre « Progression » en page télé */
Object.assign(I18N_EN, { 'La progression': 'Progression', 'Fais défiler le tableau pour les voir tous': 'Scroll the table to see them all', 'Les mouvements': 'The moves', 'Avant': 'Before', 'Après': 'After',
  'Écart': 'Change', 'Ils montent': 'Moving up', 'Ils reculent': 'Slipping', 'montent de palier': 'move up a tier', 'reculent': 'slip back', 'recule': 'slips back', 'nouveaux Generational': 'new Generationals',
  'nouveau Generational': 'new Generational', 'nouveaux Hall Of Famer': 'new Hall Of Famers', 'nouveau Hall Of Famer': 'new Hall Of Famer', 'Nouveau Generational': 'New Generational', 'Nouveau Hall Of Famer': 'New Hall Of Famer', 'Recrues': 'Rookies' });
I18N_RX.push([/^(\d+) golfeurs? changent? de palier$/, (m, n) => n + (n === '1' ? ' golfer changes tier' : ' golfers change tier')]);
/* v427 : chapitre « Retraites » en page télé */
Object.assign(I18N_EN, { 'Ils raccrochent': 'Hanging it up', 'Classés par gains en carrière': 'Ranked by career earnings', 'Les départs': 'Departures', 'Titres L1': 'L1 titles',
  'Mondial': 'World', 'Toi': 'You', 'Ex-n° 1': 'Ex-No. 1', 'Forcée': 'Forced', 'départs': 'departures', 'départ': 'departure', 'perdent leur place (forcés)': 'lose their spot (forced)',
  'perd sa place (forcé)': 'loses their spot (forced)', 'titres de L1 qui s’en vont': 'L1 titles leaving', 'titre de L1 qui s’en va': 'L1 title leaving', 'de gains en carrière, au total': 'in career earnings, combined', 'Aussi': 'Also' });
I18N_RX.push([/^(\d+) départs?$/, (m, n) => n + (n === '1' ? ' departure' : ' departures')], [/^(\d+) ans · forcée$/, 'age $1 · forced'], [/^n° (\d+)$/, 'No. $1']);
/* v426 : chapitre « Ta saison » en page télé */
Object.assign(I18N_EN, { 'Ta carrière s’est terminée cette saison': 'Your career ended this season', 'Ta carte de la saison': 'Your season scorecard', 'Ta remontée': 'Your climb',
  'Ta saison au classement': 'Your season in the standings', 'après le premier tournoi, puis à la fin': 'after the first event, then at the end', 'aucune coupure ratée': 'no missed cuts',
  'inchangé': 'unchanged', 'Ton point faible': 'Your weak spot', 'Ta force': 'Your strength', 'Ta ligue': 'Your league', 'Objectif': 'Goal', 'Fin de carrière': 'Career over',
  'jouer le titre et la Finale': 'play for the title and the Finale', 'garder ta place en Ligue 1': 'keep your spot in League 1', 'garder ta place': 'keep your spot', 'Classement final': 'Final standings' });
I18N_RX.push([/^Tu montes en Ligue (\d)$/, 'Moving up to League $1'], [/^Tu descends en Ligue (\d)$/, 'Dropping to League $1'], [/^Tu restes en Ligue (\d)$/, 'Staying in League $1'],
  [/^sur (\d+) golfeurs$/, 'of $1 golfers'], [/^Les (\d+) premiers montent$/, 'Top $1 move up'], [/^Victoire au tournoi (\d+)$/, 'Win at event $1'], [/^(\S+) au tournoi (\d+)$/, '$1 at event $2'],
  [/^avant : (.+)$/, 'before: $1'], [/^finir dans les (\d+) premiers pour monter$/, 'finish in the top $1 to move up']);
/* v425 : chapitre « Les champions » en page télé */
Object.assign(I18N_EN, { 'majeurs': 'majors', 'majeur': 'major', 'd’avance sur le 2e': 'ahead of 2nd', 'Son parcours · place à chaque tournoi': 'Season path · finish at each event',
  'Tu es champion de la Ligue 1': 'You are the League 1 champion', 'Tu es champion': 'You are champion' });
I18N_RX.push([/^(\d+)e titre$/, (m, n) => n + (n.slice(-1) === '1' && n !== '11' ? 'st' : n.slice(-1) === '2' && n !== '12' ? 'nd' : n.slice(-1) === '3' && n !== '13' ? 'rd' : 'th') + ' title']);
Object.assign(I18N_EN, { 'Passer à la fin ›': 'Skip to the end ›', 'Le classement final des quatre ligues': 'The final standings of all four leagues', 'Les autres titres': 'Other titles', 'dernière ligue': 'last league',
  'Les autres départs': 'Other departures', 'Les départs': 'Departures', 'Dans les coulisses': 'Behind the scenes', 'Ce que les dépisteurs ont remarqué cette année': 'What the scouts noticed this year',
  'Les suivants': 'Next in line', 'Voir toute la classe ›': 'See the whole class ›', 'Les familles': 'Families', 'Aussi dans la classe': 'Also in the class', 'Premier tournoi': 'First tournament', 'À surveiller': 'Worth watching',
  'Tout reste consultable dans le Journal › Intersaisons.': 'Everything stays available in the Log › Offseasons.', 'Les champions': 'The champions', 'Progression': 'Progress', 'Promotions et relégations': 'Promotions and relegations',
  'Tes moments': 'Your moments', 'Tu es champion de la Ligue 1': 'You’re the League 1 champion', 'Champion de la Ligue 1': 'League 1 champion', 'Une carrière qui s’achève': 'A career comes to an end', 'Le grand bond': 'The big leap',
  'Découverte': 'Discovery', '▲ Toi': '▲ You', '▼ Toi': '▼ You', '= Toi': '= You', 'Le joyau de la classe': 'Gem of the class', 'Fils d’un champion': 'Son of a champion', 'Fils d’un ancien golfeur': 'Son of a former golfer',
  'Frères réunis': 'Brothers reunited', 'Cousins': 'Cousins', 'La recrue': 'The rookie', 'Son père': 'His father', 'Son frère': 'His brother', 'Son cousin': 'His cousin', 'Son fils': 'His son',
  'Nouveau n°1 mondial': 'New world No. 1', 'N°1 mondial': 'World No. 1', 'Au sommet du classement mondial': 'At the top of the world ranking', 'Pas de changement de fin de saison.': 'No end-of-season changes.',
  'Entrer dans l’intersaison ›': 'Enter the offseason ›', 'Retraites, progression, recrues, World Ranking… chapitre par chapitre.': 'Retirements, progress, rookies, World Ranking… chapter by chapter.',
  'Reprendre l’intersaison': 'Resume the offseason', 'Passer': 'Skip', 'Fin de l’intersaison': 'End of the offseason', 'gains': 'earnings', 'talent découvert': 'talent discovered', 'point faible découvert': 'weakness discovered',
  'talent disparu': 'talent faded', 'défaut atténué': 'weakness eased', 'défaut corrigé': 'weakness fixed', 'Cérémonie d’intronisation': 'Induction ceremony', '🏆 Majeurs aux tournois 3, 5, 7 et 9 de la Ligue 1': '🏆 Majors at tournaments 3, 5, 7 and 9 of League 1' });
I18N_RX.push(
  [/^Intersaison (\d+) → (\d+) · (\d+) \/ (\d+)$/, '$1 → $2 offseason · $3 / $4'], [/^Chapitre (\d+)$/, 'Chapter $1'], [/^Chapitre (\d+) sur (\d+) : (.+)$/, (m, a, b, t) => 'Chapter ' + a + ' of ' + b + ': ' + trText(t)],
  [/^Ta saison (\d+)$/, 'Your $1 season'], [/^(\d+) golfeurs? quittent le circuit(?:, dont (\d+) forcés?)?$/, (m, n, f) => I18N_PL(n, 'golfer') + ' leave the tour' + (f ? ', ' + f + ' forced' : '')],
  [/^dernier niveau (.+)$/, 'last level $1'], [/^(\d+) golfeurs? changent de palier$/, (m, n) => I18N_PL(n, 'golfer') + ' change tier'], [/^\+(\d+) paliers$/, '+$1 tiers'],
  [/^(Nouveaux Generational|Nouveaux Hall Of Famer|Ils montent|Ils reculent) · (\d+)$/, (m, k, n) => ({ 'Nouveaux Generational': 'New Generational', 'Nouveaux Hall Of Famer': 'New Hall Of Famers', 'Ils montent': 'Moving up', 'Ils reculent': 'Moving down' }[k]) + ' · ' + n],
  [/^(Monte|monte|Recule|recule) au niveau (bronze|argent|or)$/, (m, k, l) => (/onte/.test(k) ? (k[0] === 'M' ? 'Moves' : 'moves') + ' up to ' : (k[0] === 'R' ? 'Drops' : 'drops') + ' to ') + I18N_TALLV[l]],
  [/^Tu (restes|montes|descends) en (Ligue \d · .+)$/, (m, k, l) => ({ restes: 'You stay in ', montes: 'You move up to ', descends: 'You drop to ' }[k]) + trText(l)],
  [/^(\S+) en (Tour|Pro|Semi-Pro|Amateur)$/, (m, o, l) => I18N_ORDX(o) + ' in ' + l],
  [/^([▲▼]) (\d+) (montent|descendent) en Ligue (\d) :$/, (m, a, n, k, l) => a + ' ' + n + (k === 'montent' ? ' move up to League ' : ' drop to League ') + l + ':'],
  [/^(\d+) déplacés? en cours de saison$/, '$1 moved mid-season'], [/^Les ligues de (\d+)$/, 'The $1 leagues'], [/^Le classement mondial à la fin de (\d+)$/, 'The world ranking at the end of $1'],
  [/^Succède à (.+)$/, 'Succeeds $1'], [/^(\S+) saison de suite au sommet$/, (m, o) => I18N_ORDX(o) + ' straight season at the top'],
  [/^(\d+) recrues?, classées par les dépisteurs$/, (m, n) => I18N_PL(n, 'rookie') + ', ranked by the scouts'], [/^(\d+) ans ·$/, 'Age $1 ·'],
  [/^(\d+) recrues? avec un nom déjà connu sur le circuit$/, (m, n) => I18N_PL(n, 'rookie') + ' with a name already known on the tour'],
  [/^(fils|frère|cousin|père) de (.+)$/, (m, k, n) => ({ fils: 'son of ', frère: 'brother of ', cousin: 'cousin of ', père: 'father of ' }[k]) + n],
  [/^(.+) de gains$/, '$1 in earnings'], [/^(?:💎 )?(.+) fait ses débuts en Ligue (\d)$/, (m, n) => (m.startsWith('💎') ? '💎 ' : '') + n + ' makes his debut in League ' + m.slice(-1)],
  [/^(⭐ )?(\d+) golfeurs? de ta Watchlist dans ta ligue$/, (m, z, n) => (z || '') + I18N_PL(n, 'golfer') + ' from your Watchlist in your league'],
  [/^(🏆 )?Meilleur résultat : (victoire|\S+) au tournoi (\d+)(?: en Ligue (\d))?(?: · (.+))?$/, (m, z, p, t, l, c) => (z || '') + 'Best finish: ' + (p === 'victoire' ? 'win' : I18N_ORDX(p)) + ' in tournament ' + t + (l ? ' in League ' + l : '') + (c ? ' · ' + c : '')],
  [/^(🎯 )?Meilleure ronde : (\d+) \((\S+)\) au tournoi (\d+)$/, (m, z, a, b, t) => (z || '') + 'Best round: ' + a + ' (' + b + ') in tournament ' + t],
  [/^(⛳ |⚠️ )?(Ta force|Ton point faible) selon tes cartes : (.+) \((bronze|argent|or|défaut léger|défaut marqué)\)$/, (m, z, k, l, v) => (z || '') + (k === 'Ta force' ? 'Your strength' : 'Your weak spot') + ' from your scorecards: ' + talEnLbl(l).toLowerCase() + ' (' + I18N_TALLV[v] + ')'],
  [/^(📈 )?Ton niveau : (.+) → (.+)$/, (m, z, a, b) => (z || '') + 'Your level: ' + a + ' → ' + b],
  [/^· (\d+) points en Ligue (\d)$/, '· $1 points in League $2'], [/^🏆 Recrue de l’année (\d+)$/, '🏆 Rookie of the Year $1'], [/^Saison (\d+) · Pro$/, 'Season $1 · Pro']
);
I18N_EN['Aussi'] = 'Also'; I18N_EN['forcée'] = 'forced'; I18N_EN['‹ Précédent'] = '‹ Previous'; I18N_EN['Retour au journal'] = 'Back to the Log';
I18N_RX.push([/^La classe (\d+)$/, 'The $1 class'],
  [/^((?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️)+ )(.+)$/u, (m, e, r) => { const t = trText(r); return t === r ? m : e + t; }]);
/* ---- Pression en direct, élan et tempéraments (v216) ---- */
Object.assign(I18N_EN, { 'Chancelle': 'Shaky', 'Clutch': 'Clutch', 'Sous pression': 'Under pressure', 'sous pression': 'under pressure', 'Tempérament inconnu': 'Temperament unknown',
  'Les dépisteurs doivent le voir en lutte': 'The scouts need to see him in contention', 'Talents et tempéraments': 'Talents and temperaments', 'Tempéraments': 'Temperaments',
  'Ce que les dépisteurs ont remarqué cette année, et qui a changé sous pression': 'What the scouts noticed this year, and who changed under pressure',
  'Devient Clutch': 'Becomes Clutch', 'A appris à gagner': 'Learned how to win', 'Perd ses moyens': 'Losing his nerve',
  'Il craque souvent dans les derniers trous quand la victoire est en jeu.': 'He often cracks over the closing holes when a win is on the line.',
  'Il a tendance à perdre des coups en fin de ronde quand il est en lutte.': 'He tends to drop shots late in the round when he’s in contention.',
  'Ni meilleur ni moins bon quand ça compte.': 'No better, no worse when it counts.',
  'Il garde ses moyens en fin de ronde quand ça compte.': 'He keeps his composure late in the round when it counts.',
  'Il élève son jeu dans les derniers trous quand il est en lutte pour la victoire.': 'He raises his game over the closing holes when he’s in contention for the win.',
  'Pression en direct et élan': 'Live pressure and momentum', 'Tempéraments évolutifs': 'Evolving temperaments',
  'Les trous se jouent dans l’ordre : séries de birdies, dérapes, et le tempérament de chacun agit dans les derniers trous selon sa position. Les moyennes ne changent pas.': 'Holes are played in order: birdie runs, slip-ups, and each golfer’s temperament kicks in over the closing holes depending on where he stands. Averages don’t change.',
  'Gagner sous pression donne de l’assurance, s’effondrer en fait perdre : le tempérament peut changer d’un cran à la fin de la saison, surtout chez les jeunes.': 'Winning under pressure builds confidence, collapsing costs some: a temperament can move one notch at the end of the season, especially for young players.' });
const I18N_CLN = { Chancelle: 'Shaky', Nerveux: 'Nervous', Stable: 'Stable', Solide: 'Solid', Clutch: 'Clutch' };
I18N_RX.unshift(
  [/^(?:(.+) )?devient Clutch : il sait maintenant finir le travail\.$/, (m, n) => (n ? n + ' ' : '') + 'becomes Clutch: he now knows how to close it out.'],
  [/^(?:(.+) )?a appris à gagner : il devient Solide sous pression\.$/, (m, n) => (n ? n + ' ' : '') + 'has learned how to win: he becomes Solid under pressure.'],
  [/^(?:(.+) )?a trouvé son calme : il devient Stable sous pression\.$/, (m, n) => (n ? n + ' ' : '') + 'has found his calm: he becomes Stable under pressure.'],
  [/^(?:(.+) )?reprend un peu confiance : il devient Nerveux sous pression\.$/, (m, n) => (n ? n + ' ' : '') + 'regains a bit of confidence: he becomes Nervous under pressure.'],
  [/^(?:(.+) )?chancelle désormais quand la victoire est en jeu\.$/, (m, n) => (n ? n + ' ' : '') + 'now wobbles when a win is on the line.'],
  [/^(?:(.+) )?a perdu ses moyens sous pression : il devient Nerveux\.$/, (m, n) => (n ? n + ' ' : '') + 'has lost his nerve under pressure: he becomes Nervous.'],
  [/^(?:(.+) )?a perdu un peu d’assurance : il redevient Stable sous pression\.$/, (m, n) => (n ? n + ' ' : '') + 'has lost some of his swagger: he’s back to Stable under pressure.'],
  [/^(?:(.+) )?n’est plus aussi glacial : il passe de Clutch à Solide\.$/, (m, n) => (n ? n + ' ' : '') + 'isn’t quite as ice-cold anymore: he goes from Clutch to Solid.']);
I18N_RX.push(
  [/^En lutte à 5 trous de la fin : (\d+) fois(?: · (\d+) victoires?)?$/, (m, n, w) => 'In contention with 5 holes left: ' + n + (n === '1' ? ' time' : ' times') + (w ? ' · ' + I18N_PL(w, 'win') : '')],
  [/^Historique : ((?:Chancelle|Nerveux|Stable|Solide|Clutch)(?: → .+)?)$/, (m, x) => 'History: ' + x.split(' → ').map(p => p.replace(/^(\S+)/, l => I18N_CLN[l] || l)).join(' → ')],
  [/^(Chancelle|Nerveux|Stable|Solide|Clutch) →$/, (m, a) => I18N_CLN[a] + ' →'],
  [/^([▲▼] )?(Chancelle|Nerveux|Stable|Solide|Clutch) → (Chancelle|Nerveux|Stable|Solide|Clutch)$/, (m, z, a, b) => (z || '') + I18N_CLN[a] + ' → ' + I18N_CLN[b]],
  [/^Sous pression · (\d+)$/, 'Under pressure · $1']);
/* v217 : départs décalés */
Object.assign(I18N_EN, { 'Ordre des départs': 'Tee times', 'Départs': 'Tee times', 'Ton départ': 'Your tee time', 'Départ de ton golfeur': 'Your golfer’s tee time',
  'Ton groupe': 'Your group', 'Le groupe de ton golfeur': 'Your golfer’s group', 'Auj.': 'Today', 'Pos.': 'Pos.', 'Commencer la ronde': 'Start the round', 'Retour à la ronde': 'Back to the round',
  'Avancer d’un trou': 'Advance one hole', 'Tout terminer d’un coup': 'Finish everything at once', 'Corriger le trou 18': 'Fix hole 18',
  'Ta ronde est terminée': 'Your round is over', 'Ronde de ton golfeur terminée': 'Your golfer’s round is over', 'Tu ne joues pas cette ronde.': 'You’re not playing this round.',
  'Tu ouvres le bal : personne n’est encore sur le terrain.': 'You’re first off: nobody is on the course yet.', 'Quand tu partiras, le groupe 1 aura terminé.': 'By the time you tee off, group 1 will be done.',
  'Tu fermes la marche : le dernier groupe, c’est le tien.': 'You’re last off: the final group is yours.', '⭐ Dernier groupe': '⭐ Final group', '⭐ Groupe vedette': '⭐ Featured group', 'Dernier groupe': 'Final group',
  'C’est le tien :': 'It’s yours:', 'Les meneurs :': 'The leaders:', 'Le champion en titre,': 'The defending champion,', 'Le meneur de la saison,': 'The season leader,',
  ', part avec': ', tees off with', ', part avec toi.': ', tees off with you.', 'et toi': 'and you', '⚔️ Ton rival,': '⚔️ Your rival,', ', joue dans ton groupe.': ', is in your group.',
  'Meilleur du groupe aujourd’hui :': 'Best in the group today:', '🏠 Au chalet :': '🏠 In the clubhouse:', 'afficher': 'show', 'masquer': 'hide', 'Avec': 'With',
  'Départs décalés': 'Staggered tee times',
  'Groupes de 3 ou 4 aux 10 minutes : chacun en est à son propre trou, les meneurs partent en dernier en ronde 2 et en Finale (ronde unique : au hasard) et la pression se mesure contre le tableau du moment. Les moyennes ne changent pas.': 'Groups of 3 or 4 every 10 minutes: everyone is on their own hole, the leaders go off last in round 2 and the Finale (single round: random order) and pressure is measured against the board at that moment. Averages don’t change.' });
/* v331 : top 20 avec les promus, relégation en saison réglable */
I18N_RX.push([/^promus en cours de saison : gardent leur rang et comptent dans le top (\d+)$/, 'promoted mid-season: keep their rank and count in the top $1']);
Object.assign(I18N_EN, { 'Le top 20 compte les promus en cours de saison': 'The top 20 includes golfers promoted mid-season',
  'En fin de saison, les places de promotion sont les 20 premiers du classement final. Un golfeur déjà promu en cours de saison occupe sa place : s’il y en a 11 dans le top 20, il n’en reste que 9 à monter.': 'At season’s end, the promotion spots are the top 20 of the final standings. A golfer already promoted mid-season keeps his spot: if 11 of them are in the top 20, only 9 more move up.',
  'Relégation en cours de saison': 'Mid-season relegation', 'Avec 6, les relégations et les promotions en cours de saison s’équilibrent ; avec 5, on descend plus vite qu’on ne monte.': 'At 6, mid-season relegations and promotions balance out; at 5, golfers drop faster than they rise.' });
I18N_RX.push([/^(\d+) fois dans les 30 derniers \(ou 3 dans les 10 derniers\)$/, '$1 times in the bottom 30 (or 3 in the bottom 10)'], [/^(\d+) tournois dans les 30 derniers ou 3 dans les 10 derniers$/, '$1 finishes in the bottom 30 or 3 in the bottom 10'],
  [/^En fin de saison, les (\d+) premiers montent, puis jusqu’au (\d+)e avec un index assez bas(?: \(les promus en cours de saison comptent dans ce top (\d+)\))? ; hors du top (\d+), on descend si l’index dépasse la cible de la ligue\.$/, (m, a, c, t, sf) => 'At season’s end, the top ' + a + ' move up, then down to ' + c + 'th with a low enough index' + (t ? ' (golfers promoted mid-season count in this top ' + t + ')' : '') + '; outside the top ' + sf + ', you drop if your index is above the league’s target.']);
I18N_RX.unshift([/^Promotion \((\d+) premiers, puis jusqu’au (\d+)e avec un index ≤ (.+?), promus en cours de saison compris\)$/, 'Promotion (top $1, then down to $2th with an index ≤ $3, mid-season promotions included)']);
/* v330 : gagnants de la semaine, semaine prochaine */
Object.assign(I18N_EN, { 'La semaine prochaine': 'Next week', 'Recrues': 'Rookies', '(prol.)': '(playoff)', 'Champion en titre :': 'Defending champion:', '(pas dans le champ)': '(not in the field)', 'Première édition': 'First edition', 'Favoris': 'Favorites' });
I18N_RX.push([/^Tournoi (\d+) sur (\d+)$/, 'Tournament $1 of $2']);
/* v328 : coupure ratée, noms connus */
Object.assign(I18N_EN, { 'Coupure ratée : des noms connus': 'Missed cut: notable names', 'Champion en titre': 'Defending champion', 'Gagnant du tournoi précédent': 'Won the previous event', 'Un des favoris': 'One of the favorites', 'Sur ta watchlist': 'On your watchlist', 'à 1 coup': 'by 1 shot', 'coupure à': 'cut at', 'ratée par 1 coup': 'missed by 1 shot' });
I18N_RX.push([/^N° (\d+) mondial$/, 'World No. $1'], [/^(\S+) coupure ratée de suite$/, '$1 straight missed cut'], [/^ratée par (\d+) coups$/, 'missed by $1 shots']);
/* v327 : Majeurs ×1,25 par défaut */
Object.assign(I18N_EN, { 'Les 4 Majeurs valent environ 40 % des points de la saison (bourse ×1,5) : de gros rendez-vous, sans décider seuls du champion.': 'The 4 Majors are worth about 40% of the season’s points (purse ×1.5): big events that don’t decide the champion on their own.',
  'Avec ×2, les 4 Majeurs valent 57 % des points de la saison en L1 ; avec ×1,5, environ 45 % ; avec ×1,25 (par défaut), environ 40 % ; avec ×1, ce sont des tournois comme les autres. La bourse des Majeurs reste ×1,5 dans tous les cas.': 'At ×2, the 4 Majors are worth 57% of the L1 season’s points; at ×1.5, about 45%; at ×1.25 (default), about 40%; at ×1, they’re like any other tournament. The Majors’ purse stays ×1.5 in every case.' });
/* v352 : le voyage */
Object.assign(I18N_EN, { 'Le voyage': 'The journey', 'Le voyage de la saison': 'The season’s journey', 'terrain à localiser': 'course to locate', 'terrains à localiser': 'courses to locate', 'Trier pour le moins de kilomètres': 'Sort for the fewest kilometres', 'Voir le voyage': 'See the journey',
  'Trier automatiquement à chaque nouvelle saison': 'Sort automatically every new season', 'Exporter les lieux': 'Export places', 'Importer des lieux': 'Import places', 'Aucun lieu trouvé pour l’instant': 'No places found yet', 'Ce fichier n’est pas un fichier de lieux': 'This file is not a places file', 'Garder les Majeurs sur leur terrain': 'Keep Majors on their course', 'Les Majeurs gardent leur date, mais leur terrain peut changer. Tous les terrains (barrés compris) sont triés ; seuls la Finale et les tournois déjà joués ne bougent pas.': 'Majors keep their date, but their course can change. All courses (locked ones included) are sorted; only the Finale and tournaments already played stay put.', 'Les Majeurs et la Finale gardent leur place ; les autres tournois (barrés compris) s’organisent autour.': 'Majors and the Finale keep their spot; the other tournaments (locked ones included) are arranged around them.',
  'Localiser toute ma liste': 'Locate my whole list', 'Recherche en cours sur OpenStreetMap…': 'Searching OpenStreetMap…', 'restants': 'left', 'Recherche impossible ici (hors ligne ou version claude.ai) : ouvre le jeu téléchargé sur ton ordinateur, connecté à Internet.': 'Search unavailable here (offline or the claude.ai version): open the downloaded game on your computer, connected to the Internet.',
  'terrain(s) introuvable(s) automatiquement : entre une ville ou des coordonnées dans la liste plus bas.': 'course(s) not found automatically: enter a city or coordinates in the list below.', 'Glisse pour tourner': 'Drag to rotate', 'molette ou pincement pour zoomer': 'scroll or pinch to zoom', 'Les étapes': 'The stops', 'Lieu': 'Place', 'introuvable': 'not found', 'à localiser': 'to locate',
  'Ta carrière sur la route': 'Your career on the road', 'depuis': 'since', 'saison la plus longue :': 'longest season:', 'tours de la Terre': 'trips around the Earth', 'Passeport': 'Passport', 'Tous les terrains de ta liste ont déjà été cherchés': 'Every course on your list has already been searched', 'Recherche impossible ici (hors ligne ou version claude.ai)': 'Search unavailable here (offline or the claude.ai version)' });
I18N_RX.unshift([/^Localiser (\d+) terrains?$/, (m, n) => 'Locate ' + n + (n === '1' ? ' course' : ' courses')], [/^Lieu de « (.+) » : ville, pays ou coordonnées \(lat, lon\)$/, 'Place of “$1”: city, country or coordinates (lat, lon)'],
  [/^L’ordre actuel est déjà le plus court \((.+)\)$/, 'The current order is already the shortest ($1)'], [/^(\d+) lieux exportés$/, '$1 places exported'], [/^(\d+) lieux ajoutés \(ceux que tu avais déjà sont gardés\)$/, '$1 places added (the ones you already had are kept)'], [/^(\d+) terrains? pas encore localisés? : ouvre « Le voyage » pour les localiser$/, '$1 course(s) not located yet: open “The journey” to locate them'], [/^(\d+) terrains à chercher : environ (\d+) min$/, '$1 courses to search: about $2 min'], [/^Lieu introuvable : (.+)$/, 'Place not found: $1']);
/* v351 : Almanac › Histoire et Carrières */
Object.assign(I18N_EN, { 'Carrières': 'Careers', 'Les règnes du n° 1 mondial': 'World No. 1 reigns', 'Chaque tournoi compte : qui était n° 1 au classement mondial publié après le tournoi. La bande montre les derniers règnes, du plus ancien au plus récent.': 'Every tournament counts: who was No. 1 in the world ranking published after it. The strip shows the latest reigns, oldest to newest.',
  'N° 1 actuel :': 'Current No. 1:', 'tournois de suite': 'tournaments in a row', 'Les plus longs règnes': 'Longest reigns', 'Le plus de tournois au n° 1 (au total)': 'Most tournaments at No. 1 (total)', 'Les dynasties': 'Dynasties',
  'Séries et longévité en Ligue 1, et les plus longues séries de tournois (toutes ligues).': 'Streaks and longevity in League 1, and the longest tournament streaks (all leagues).', 'Titres de saison consécutifs en L1': 'Consecutive L1 season titles', 'Le plus de saisons en L1': 'Most seasons in L1',
  'Plus longues séries de top 10': 'Longest top-10 streaks', 'Plus longues séries de coupures réussies': 'Longest made-cut streaks', 'Le GOAT': 'The GOAT',
  'Classement de tous les temps : points du Temple (victoires en L1, titres, Majeurs, Finales, saisons au n° 1), plus le sommet de carrière et les tournois au n° 1 mondial. Retraités compris.': 'All-time ranking: Hall of Fame points (L1 wins, titles, Majors, Finales, seasons at No. 1), plus career peak and tournaments at world No. 1. Retired golfers included.',
  'V L1': 'L1 W', 'Titres': 'Titles', 'N° 1': 'No. 1', 'Tournois au n° 1 mondial': 'Tournaments at world No. 1', 'Remontées et effondrements': 'Comebacks and collapses',
  'Mesurés à 5 trous de la fin de la ronde finale, d’après les cartes trou par trou (conservées pour les saisons récentes).': 'Measured with 5 holes left in the final round, from hole-by-hole cards (kept for recent seasons).', 'Les plus grandes remontées': 'Biggest comebacks', 'Les pires effondrements': 'Worst collapses',
  'Coups de retard sur la tête à 5 trous de la fin… et la victoire.': 'Shots behind the lead with 5 holes left… and the win.', 'Seul en tête à 5 trous de la fin (avance en coups) → position finale.': 'Sole leader with 5 holes left (lead in shots) → final position.', 'Pas encore de remontée de 2 coups ou plus.': 'No comeback of 2 shots or more yet.', 'Aucun encore.': 'None yet.',
  'Les courses au titre (Ligue 1)': 'Title races (League 1)', 'Le plus petit écart entre le champion et le 2e, et les champions en tête du début à la fin.': 'The smallest gap between the champion and 2nd, and champions who led from start to finish.', 'devant': 'ahead of', 'De bout en bout': 'Wire to wire', 'Aucun champion n’a encore mené après chaque tournoi.': 'No champion has led after every tournament yet.',
  'Les ères': 'Eras', 'Par tranches de 10 saisons : le golfeur dominant (victoires et titres en L1), le n° 1 mondial le plus souvent, la nation la plus victorieuse en L1, la meilleure cuvée et la moyenne de score en L1 (par rapport à la normale).': 'In 10-season spans: the dominant golfer (L1 wins and titles), the most frequent world No. 1, the nation with most L1 wins, the best class and the L1 scoring average (relative to par).',
  'Ère': 'Era', 'Dominant': 'Dominant', 'Toutes les cuvées': 'All classes', 'Classées par rendement réel jusqu’à maintenant (les jeunes cuvées ont encore du temps devant elles).': 'Ranked by actual output so far (young classes still have time ahead).', 'Meilleur choix tardif de l’histoire': 'Best late pick in history', 'cuvée': 'class',
  'Records d’âge': 'Age records', 'Le plus jeune et le plus vieux vainqueur de chaque ligue, et ceux qui ont atteint la L1 le plus tard.': 'The youngest and oldest winner in each league, and those who reached L1 the latest.', 'Arrivés en L1 le plus tard': 'Latest arrivals in L1',
  'La courbe de carrière type': 'The typical career curve', 'Niveau moyen des golfeurs selon l’âge (tous les golfeurs suivis), puis les victoires en L1 selon l’âge du vainqueur.': 'Average golfer level by age (all tracked golfers), then L1 wins by the winner’s age.', 'Sommet moyen vers': 'Average peak around', 'âge le plus victorieux en L1 :': 'most winning age in L1:',
  'La survie des promus en L1': 'Survival of golfers promoted to L1', 'Pourcentage des golfeurs montés en L1 qui y sont encore à la fin de leur 1re, 3e et 5e saison (entre parenthèses : le nombre de cas).': 'Share of golfers promoted to L1 still there at the end of their 1st, 3rd and 5th season (number of cases in brackets).',
  'Montés': 'Moved up', 'En fin de saison': 'At season’s end', 'En cours de saison': 'During the season', '« 1 saison » : encore en L1 à la fin de la saison qui suit leur montée.': '“1 season”: still in L1 at the end of the season after their promotion.' });
/* v350 : taille des ligues en saison */
Object.assign(I18N_EN, { 'Carte du monde indisponible (monde.js chargé, d3 absent).': 'World map unavailable (monde.js loaded, d3 missing).', 'Carte du monde indisponible (monde.js non chargé).': 'World map unavailable (monde.js not loaded).', 'Taille des ligues en saison': 'League sizes during the season', '(en cours)': '(in progress)', 'Golfeurs au premier tournoi → après le dernier tournoi, avant les promotions et relégations de fin de saison. La différence vient des montées et descentes en cours de saison.': 'Golfers at the first tournament → after the last tournament, before end-of-season promotions and relegations. The difference comes from mid-season moves.' });
/* v349 : rendement d'une cuvée */
Object.assign(I18N_EN, { 'La cuvée aujourd’hui': 'The class today', 'golfeurs actifs': 'active golfers', 'passés par la L1': 'reached L1', 'établis': 'established', 'victoire en L1': 'L1 win', 'victoires en L1': 'L1 wins', 'titre de saison en L1': 'L1 season title', 'titres de saison en L1': 'L1 season titles',
  'gains combinés': 'combined earnings', 'hors circuit': 'off the tour', 'retraité': 'retired', 'retraités': 'retired', 'sans carte': 'no card', 'Personne de la cuvée dans le top 100 mondial.': 'No one from this class in the world top 100.', 'Le meilleur de la cuvée': 'The best of the class',
  'La plus belle surprise': 'The biggest surprise', 'La plus grosse déception': 'The biggest disappointment', 'Flair des dépisteurs :': 'Scouts’ eye:', 'Temple :': 'Hall of Fame:', 'Rendement réel :': 'Actual output:', 'de leurs 10 premiers choix sont parmi les 10 meilleures carrières de la cuvée': 'of their top 10 picks are among the class’s 10 best careers',
  'Temple': 'Hall of Fame', 'intronisé': 'inducted', 'intronisés': 'inducted', 'en bonne voie': 'on track', 'Rendement réel': 'Actual output', 'de tes': 'of your', 'cuvées d’au moins 5 saisons': 'classes at least 5 seasons old', 'Rendement réel : trop tôt pour comparer avec les autres cuvées (moins de 5 saisons).': 'Actual output: too early to compare with other classes (under 5 seasons).',
  'titre de saison': 'season title', 'titres de saison': 'season titles' });
I18N_RX.unshift([/^(\S+) choix des dépisteurs$/, '$1 scouts’ pick'], [/^meilleure ligue : L(\d)$/, 'best league: L$1'], [/^n’a jamais dépassé la L(\d)$/, 'never got past L$1']);
/* v347 : tournée de bogues — textes restés en français */
I18N_RX.unshift([/^Chapitre (\d+) sur (\d+) : (.+)$/, (m, a, b, t) => 'Chapter ' + a + ' of ' + b + ': ' + trText(t)]);   // avant la règle « … 2026 » qui coupait le titre
Object.assign(I18N_EN, { 'Rien à afficher pour l’instant : les résumés apparaissent après chaque tournoi.': 'Nothing to show yet: summaries appear after each tournament.',
  'Encore trop peu de saisons suivies pour un graphique — reviens dans quelques saisons.': 'Too few seasons tracked for a chart yet — come back in a few seasons.', 'Bibliothèque :': 'Library:', 'cuvée selon les dépisteurs': 'class according to the scouts', 'Ce tournoi n’a pas encore été joué.': 'This tournament hasn’t been played yet.', 'aucun point': 'no points',
  ': ce golfeur ne pourra plus jouer.': ': this golfer will never play again.', ': cette carrière est terminée.': ': this career is over.' });
I18N_RX.unshift(
  [/^En cours de saison, on monte d’une ligue avec (.+), et on descend avec (.+), comptés depuis le début de la saison ou depuis l’arrivée dans la ligue\.$/, (m, a, b) => 'During the season, you move up a league with ' + I18N_RULES(a) + ', and you move down with ' + I18N_RULES(b) + ', counted from the start of the season or from your arrival in the league.'],
  [/^sur (\d+)$/, 'out of $1'], [/^Les recrues arrivées sur le circuit à l’intersaison (\d+)$/, 'Rookies who joined the tour in the $1 offseason'], [/^classement de saison : (\S+)$/, 'season standing: $1'], [/^aucun point · classement de saison : (\S+)$/, 'no points · season standing: $1'],
  [/^décors\. (\d+) golfeurs sur (\d+) ont une photo dans cette partie\.$/, 'backgrounds. $1 of $2 golfers have a photo in this game.'],
  [/^(.+) quitte le circuit(?: à (\d+) ans,)? après (\d+) saisons?(?: et (\d+) titres?)?\.$/, (m, n, a, c, w) => n + ' leaves the tour' + (a ? ' at ' + a + ',' : '') + ' after ' + I18N_PL(c, 'season') + (w ? ' and ' + I18N_PL(w, 'title') : '') + '.'],
  [/^\((.+?)\) : « (.+) »$/, (m, l, q) => '(' + (I18N_EN[l] || l) + '): “' + (I18N_EN[q] || q) + '”'],   // citation médiatique, après le nom en lien
  [/^🎤 (.+?) \((.+?)\) : « (.+) »$/, (m, n, l, q) => '🎤 ' + n + ' (' + (I18N_EN[l] || l) + '): “' + (I18N_EN[q] || q) + '”'],
  [/^(se calme|a appris à garder son calme|perd un peu de son sang-froid|a la mèche plus courte) : son tempérament devient (.+)\.$/, (m, k, l) => ({ 'se calme': 'is calming down', 'a appris à garder son calme': 'has learned to keep his cool', 'perd un peu de son sang-froid': 'is losing some of his composure', 'a la mèche plus courte': 'has a shorter fuse' }[k]) + ': his temperament becomes ' + (I18N_EN[l] || l) + '.'],
  [/^(chasse moins bien qu’avant|sait maintenant fermer la porte|protège moins bien ses avances|a pris goût aux remontées) : il devient (.+) en fin de tournoi\.$/, (m, k, l) => ({ 'chasse moins bien qu’avant': 'no longer chases as well', 'sait maintenant fermer la porte': 'now knows how to close it out', 'protège moins bien ses avances': 'no longer protects leads as well', 'a pris goût aux remontées': 'has developed a taste for comebacks' }[k]) + ': he becomes ' + (I18N_EN[l] || l) + ' when closing.'],
  [/^🔎 Les dépisteurs revoient$/, '🔎 Scouts revise'], [/^\((\d+) ans\) à la hausse : potentiel (.+) → (.+)\.$/, '($1) upward: potential $2 → $3.']);
/* v343 : plafond de retranchés */
Object.assign(I18N_EN, { 'de justesse': 'just made it', 'Maximum sans carte': 'Maximum without a card', 'Si plus de recrues dépassent le seuil, les meilleures d’entre elles obtiennent une carte « de justesse » en Ligue 4.': 'If more rookies are over the threshold, the best of them get a card in League 4 anyway (“just made it”).' });
I18N_RX.unshift([/^(\d+) % de la classe$/, '$1% of the class']);
/* v341 : traits visibles et évolutifs */
I18N_RX.unshift([/^😌 (.+) se calme : son tempérament devient (.+)\.$/, (m, n, l) => '😌 ' + n + ' is calming down: his temperament becomes ' + (I18N_EN[l] || l) + '.'],
  [/^😤 (.+) perd un peu de son sang-froid : son tempérament devient (.+)\.$/, (m, n, l) => '😤 ' + n + ' is losing some of his composure: his temperament becomes ' + (I18N_EN[l] || l) + '.'],
  [/^🔒 (.+) chasse moins bien qu’avant : il devient (.+) en fin de tournoi\.$/, (m, n, l) => '🔒 ' + n + ' no longer chases as well: he becomes ' + (I18N_EN[l] || l) + ' when closing.'],
  [/^🏹 (.+) protège moins bien ses avances : il devient (.+) en fin de tournoi\.$/, (m, n, l) => '🏹 ' + n + ' no longer protects leads as well: he becomes ' + (I18N_EN[l] || l) + ' when closing.']);
I18N_RX.unshift([/^😌 (.+) a appris à garder son calme : son tempérament devient (.+)\.$/, (m, n, l) => '😌 ' + n + ' has learned to keep his cool: his temperament becomes ' + (I18N_EN[l] || l) + '.'],
  [/^😤 (.+) a la mèche plus courte : son tempérament devient (.+)\.$/, (m, n, l) => '😤 ' + n + ' has a shorter fuse: his temperament becomes ' + (I18N_EN[l] || l) + '.'],
  [/^🔒 (.+) sait maintenant fermer la porte : il devient (.+) en fin de tournoi\.$/, (m, n, l) => '🔒 ' + n + ' now knows how to close it out: he becomes a ' + (I18N_EN[l] || l) + '.'],
  [/^🏹 (.+) a pris goût aux remontées : il devient (.+) en fin de tournoi\.$/, (m, n, l) => '🏹 ' + n + ' has developed a taste for comebacks: he becomes a ' + (I18N_EN[l] || l) + '.']);
/* v340 : tempérament et fin de tournoi */
Object.assign(I18N_EN, { 'Personnalité': 'Personality', 'Tempérament': 'Temperament', 'Fin de tournoi': 'Closing', 'Imperturbable': 'Unflappable', 'Calme': 'Calm', 'Neutre': 'Neutral', 'Bouillant': 'Hot-headed', 'Colérique': 'Volatile', 'Chasseur-né': 'Born chaser', 'Bon chasseur': 'Good chaser', 'Bon meneur': 'Good closer', 'Meneur-né': 'Born closer', 'Inconnu': 'Unknown',
  'Un gros trou ne l’ébranle jamais.': 'A big number never rattles him.', 'Encaisse bien les mauvais coups.': 'Takes bad breaks well.', 'Un mauvais trou le suit parfois au suivant.': 'A bad hole sometimes follows him to the next.', 'Capable de séries brillantes, mais un double bogey peut le faire dérailler.': 'Capable of brilliant runs, but a double bogey can send him off the rails.',
  'Redoutable quand il doit remonter en ronde finale.': 'Dangerous when chasing in the final round.', 'Se transcende quand il chasse la tête.': 'Raises his game when chasing the lead.', 'Sait protéger une avance.': 'Knows how to protect a lead.', 'Quand il mène en ronde finale, il ferme la porte.': 'When he leads the final round, he shuts the door.',
  'Tempérament et fin de tournoi': 'Temperament and closing', 'Deux traits de personnalité : Imperturbable → Colérique (réaction aux gros trous et aux séries) et Chasseur-né → Meneur-né (ronde finale, près de la tête). La moitié des golfeurs sont neutres ; ils changent rarement, poussés par ce qu’ils vivent.': 'Two personality traits: Unflappable → Volatile (reaction to big numbers and hot runs) and Born chaser → Born closer (final round, near the lead). Half the golfers are neutral; they rarely change, pushed by what they go through.' });
I18N_RX.unshift([/^Encore à découvrir : (.+)$/, (m, a) => 'Still to discover: ' + a.replace('tempérament', 'temperament').replace('en tête ou en chasse', 'closing or chasing')]);
/* v339 : niveau à l'arrivée sur la carte de recrue */
I18N_RX.unshift([/^Niveau : (.+)$/, 'Level: $1']);
/* v338 : déplacements en cours de saison dans la progression */
I18N_RX.unshift([/^(Monté|Descendu) en L(\d) après le tournoi (\d+) \((\d+)\)$/, (m, w, l, t, y) => (w === 'Monté' ? 'Moved up' : 'Moved down') + ' to L' + l + ' after tournament ' + t + ' (' + y + ')'], [/^○ T4 = parti après le tournoi 4$/, '○ T4 = left after tournament 4']);
/* v337 : le déclic */
Object.assign(I18N_EN, { 'potentiel revu': 'potential revised' });
I18N_RX.unshift([/^🔎 Les dépisteurs revoient (.+) \((\d+) ans\) à la hausse : potentiel (.+) → (.+)\.$/, '🔎 Scouts revise $1 ($2) upward: potential $3 → $4.']);
/* v335 : cotes des dépisteurs */
Object.assign(I18N_EN, { 'Solide pari': 'Solid bet', 'Billet de loterie': 'Lottery ticket', 'Les dépisteurs classent selon ce qu’ils voient : potentiel, niveau actuel et âge. La cote (de Valeur sûre à Billet de loterie) dit leurs chances de s’établir un jour en Ligue 1. Ils se trompent parfois : certaines recrues très cotées déçoivent, d’autres surprennent tout le monde.': 'Scouts rank on what they can see: potential, current level and age. The rating (from Sure bet to Lottery ticket) reflects their odds of one day becoming a League 1 regular. Scouts are sometimes wrong: some highly rated rookies disappoint, others surprise everyone.' });
/* v334 : forme d'après les résultats */
Object.assign(I18N_EN, { 'coups par ronde': 'strokes per round', 'coup par ronde': 'stroke per round', 'En feu': 'On fire', 'En forme': 'In form', 'En méforme': 'Out of form', 'En chute libre': 'In free fall' });
I18N_RX.unshift([/^(.+) à ses (\d+) derniers tournois$/, (m, a, n) => a.replace(/(\d+) victoires?/, (x, k) => k + (k === '1' ? ' win' : ' wins')).replace(/(\d+) coupures? réussies/, '$1 cuts made').replace(/(\d+) coupures? ratées?/, (x, k) => k + (k === '1' ? ' missed cut' : ' missed cuts')) + ' in his last ' + n + ' events'],
  [/^([+−][\d.,]+) coups? par ronde sur sa moyenne$/, (m, v) => v.replace(',', '.') + ' strokes per round vs his average']);
/* v333 : page Résultats */
Object.assign(I18N_EN, { 'coupures réussies': 'cuts made', 'meilleur résultat': 'best finish', 'gains en carrière': 'career earnings', 'Par ligue': 'By league', 'Tourn.': 'Events', 'Meilleur': 'Best', 'Rang': 'Rank', 'Meilleur rang de saison': 'Best season rank',
  'Meilleure ronde': 'Best round', 'Plus longue série de coupures': 'Longest made-cut streak', 'Meilleur Majeur': 'Best Major', 'Meilleure Finale': 'Best Finale', 'Meilleure saison': 'Best season', 'fin de saison': 'end of season', 'en cours de saison': 'mid-season',
  'Rang de fin de saison, ligue par ligue (plus haut = meilleur)': 'End-of-season rank, league by league (higher = better)', 'Rang de fin de saison, ligue par ligue': 'End-of-season rank, league by league', 'pointillé = saison en cours': 'dashed = current season',
  '▲ Zone de promotion pour l’instant': '▲ In the promotion zone for now', 'Coupures ratées': 'Missed cuts', 'Meilleur résultat': 'Best finish',
  'Stats techniques : vert = mieux que la moyenne de la ligue, rouge = moins bien. Pastilles : or = victoire, vert = top 10, rouge = coupure ratée.': 'Technical stats: green = better than the league average, red = worse. Pills: gold = win, green = top 10, red = missed cut.' });
I18N_RX.unshift([/^Dans le top (\d+) de la Finale pour l’instant$/, 'Inside the Finale top $1 for now']);
/* v332 : relégation des N derniers */
Object.assign(I18N_EN, { 'Relégués en fin de saison': 'Relegated at season’s end', 'Les arrivés en cours de saison et les exemptés 🛡 sont protégés : c’est le suivant au-dessus qui descend. Les ligues restent d’au moins 130 golfeurs.': 'Mid-season arrivals and 🛡 exempt golfers are protected: the next one up drops instead. Leagues keep at least 130 golfers.',
  'L1 à L3 entre 130 et 170 golfeurs : le top 20 de la ligue du dessous monte, les derniers descendent, et on complète avec les suivants s’il manque du monde. Fermé : 150 golfeurs par ligue.': 'L1 to L3 between 130 and 170 golfers: the top 20 of the league below move up, the bottom ones move down, and the next ones fill in if spots are missing. Off: 150 golfers per league.' });
I18N_RX.unshift([/^(\d+) derniers par ligue$/, 'bottom $1 per league'], [/^Zone de relégation \((\d+) derniers\)$/, 'Relegation zone (bottom $1)'], [/^Ligne de maintien \((\d+) derniers relégués\)$/, 'Safety line (bottom $1 relegated)'], [/^Relégation \((\d+) derniers\)$/, 'Relegation (bottom $1)'], [/^Promotion \(top (\d+)(, promus en cours de saison compris)?\)$/, (m, a, b) => 'Promotion (top ' + a + (b ? ', mid-season promotions included' : '') + ')'],
  [/^En fin de saison, le top (\d+) monte(?: \(les promus en cours de saison comptent dans ce top \d+\))? et les (\d+) derniers descendent\.$/, (m, a, b) => 'At season’s end, the top ' + a + ' move up' + (m.includes('(') ? ' (mid-season promotions count in that top ' + a + ')' : '') + ' and the bottom ' + b + ' move down.']);
/* v326 : index cible pour rester */
Object.assign(I18N_EN, { 'index cible pour rester': 'target index to stay up', 'Index cible pour rester': 'Target index to stay up', 'ton index': 'your index', 'son index': 'his index' });
I18N_RX.push([/^Ligne de sécurité \((\d+)e\)$/, 'Safety line ($1th)'], [/^Index cible pour rester \(hors top (\d+)\)$/, 'Target index to stay up (outside top $1)']);
/* v321 : monde de départ (saisons cachées) */
Object.assign(I18N_EN, { 'Le monde du golf prend forme…': 'The golf world is taking shape…',
  'Les golfeurs vieillissent, progressent, prennent leur retraite et de nouvelles recrues arrivent, pour que le circuit soit vivant dès le départ. Cette période reste invisible : l’histoire commence à zéro.': 'Golfers age, improve and retire, and new rookies arrive, so the tour feels alive from day one. This period stays hidden: history starts from zero.' });
I18N_RX.push([/^Les golfeurs vieillissent, progressent, prennent leur retraite et de nouvelles recrues arrivent, pour que le circuit soit vivant dès le départ\. Cette période reste invisible : l’histoire commence à zéro, puis (\d+) saisons? d’histoire se joue(?:nt)?\.$/, (m, n) => 'Golfers age, improve and retire, and new rookies arrive, so the tour feels alive from day one. This period stays hidden: history starts from zero, then ' + n + (n === '1' ? ' season' : ' seasons') + ' of history are played.'], [/^Bienvenue en (\d+)$/, 'Welcome to $1']);
/* v320 : panneau Saison du profil */
Object.assign(I18N_EN, { 'au classement': 'in the standings', 'points': 'points', 'coupures': 'cuts made', 'cette saison': 'this season', 'top 10': 'top 10', 'victoire': 'win', 'victoires': 'wins',
  'La saison n’est pas encore commencée.': 'The season hasn’t started yet.', 'Barre : points par rapport au meneur': 'Bar: points compared with the leader', 'trait jaune : dernière place de promotion': 'yellow line: last promotion spot',
  'Arrivé en cours de saison : points gagnés dans cette ligue': 'Arrived mid-season: points earned in this league', 'Aucune victoire en carrière': 'No career wins', 'Voir la vitrine': 'See the trophy case', 'Masquer la vitrine': 'Hide the trophy case',
  'gains en carrière': 'career earnings', 'la saison passée': 'last season', 'avant sa promotion': 'before his promotion', 'avant sa relégation': 'before his relegation', 'Résultats': 'Results', 'victoire en carrière': 'career win', 'victoires en carrière': 'career wins', 'titre de saison': 'season title', 'titres de saison': 'season titles' });
I18N_RX.push([/^(\S+) pts du (\S+)$/, '$1 pts from $2'], [/^(\S+) pts sur le (\S+)$/, '$1 pts over $2'], [/^(\S+) pts du (\S+) \((Finale|promotion)\)$/, '$1 pts from $2 ($3)'], [/^(\S+) pts sur le (\S+) \((Finale|promotion)\)$/, '$1 pts over $2 ($3)'],
  [/^Zone de relégation · (\S+) pts du maintien$/, 'Relegation zone · $1 pts from safety'], [/^en Ligue (\d)$/, 'in League $1'], [/^Ligue (\d)$/, 'League $1'], [/^tournois (\d+) à (\d+)$/, 'tournaments $1 to $2'], [/^tournoi (\d+)$/, 'tournament $1'], [/^(\S+) au classement de la L(\d) avec (\d+) pts$/, '$1 in the L$2 standings with $3 pts'], [/^après (\d+) tournois?$/, (m, n) => 'after ' + n + (n === '1' ? ' tournament' : ' tournaments')], [/^trait jaune : place en Finale \(top (\d+)\)$/, 'yellow line: Finale spot (top $1)']);
/* v317 : bourse par terrain */
Object.assign(I18N_EN, { 'Bourse': 'Purse', 'Bourse au hasard': 'Random purse', 'Bourse du tournoi (Ligue 1)': 'Tournament purse (League 1)',
  'Pour les terrains non barrés : distance, course rating, slope, par et index, vent, drapeau et bourse ; les terrains encore nommés « Terrain N » reçoivent un nom fictif. Ajoute des terrains dans ta liste pour pouvoir les tirer au hasard avec des filtres.': 'For unlocked courses: distance, course rating, slope, par and index, wind, pin and purse; courses still named “Course N” get a made-up name. Add courses to your list to draw them at random with filters.' });
I18N_RX.push([/^(Majeur|Finale) : ×([\d,]+) → (.+)$/, (m, k, x, v) => (k === 'Majeur' ? 'Major' : 'Finale') + ': ×' + x.replace(',', '.') + ' → ' + v], [/^Bourse : (.+)$/, 'Purse: $1']);
/* v316 : groupes vedettes multiples et groupes suivis */
Object.assign(I18N_EN, { 'Groupes vedettes': 'Featured groups', '⭐ Groupes vedettes': '⭐ Featured groups', 'Champion en titre :': 'Defending champion:',
  'Nouveau promu, premier tournoi dans la ligue :': 'Newly promoted, first event in the league:', 'Nouveaux promus, premier tournoi dans la ligue :': 'Newly promoted, first event in the league:',
  'World Ranking :': 'World Ranking:', 'Handicap combiné le plus bas :': 'Lowest combined handicap:', 'Sur ta watchlist :': 'On your watchlist:', 'Meneur de la saison :': 'Season leader:',
  'Gagnant du dernier tournoi :': 'Winner of the last event:', 'Top 10 de la saison :': 'Season top 10:', 'Plus de points cumulés cette saison :': 'Most combined points this season:',
  'Surprise de la saison :': 'Surprise of the season:', 'Le groupe :': 'The group:', 'Suivi': 'Following', 'Suivre': 'Follow', 'Groupe suivi': 'Followed group', '★ Groupe suivi': '★ Followed group', '⭐ Groupe suivi': '⭐ Followed group',
  'Ne plus suivre': 'Unfollow', 'Pas encore parti.': 'Not out yet.', '🏠 Groupe au chalet.': '🏠 Group in the clubhouse.', 'toi': 'you',
  'Tu peux suivre jusqu’à 2 groupes : ils s’affichent pendant la ronde, comme ton groupe.': 'You can follow up to 2 groups: they show up during the round, like your group.' });
I18N_RX.push([/^moyenne (.+)$/, 'average $1'], [/^(\S+) au classement$/, '$1 in the standings'], [/^\(attendu vers le (\S+)\)$/, '(expected around $1)'], [/^Gr\. (\d+)$/, 'Gr. $1']);
I18N_RX.unshift([/^\(([^,]+), coupure à ([^)]+)\)\. En tête : (.+)$/, '($1, cut at $2). Leader: $3'], [/^\(([^,]+), coupure à ([^)]+)\)\. (\d+) joueurs poursuivent\.$/, '($1, cut at $2). $3 players carry on.']);
I18N_RX.push(
  [/^Groupe (\d+) sur (\d+)$/, 'Group $1 of $2'], [/^(\d+) groupes$/, '$1 groups'], [/^Les (\d+) groupes$/, 'All $1 groups'],
  [/^départs du trou 1 aux (\d+) minutes$/, 'off hole 1 every $1 minutes'],
  [/^Quand tu partiras, le groupe 1 sera rendu au trou (\d+)\.$/, 'By the time you tee off, group 1 will be on hole $1.'],
  [/^(\d+) groupes? (?:seront|sera) déjà au chalet\.$/, (m, n) => n + (n === '1' ? ' group' : ' groups') + ' will already be in the clubhouse.'],
  [/^(\d+) groupes? partir(?:ont|a) après toi\.$/, (m, n) => n + (n === '1' ? ' group tees' : ' groups tee') + ' off after you.'],
  [/^Tu suis le dernier groupe, qui part à (.+)\. Les groupes plus tôt seront déjà sur le terrain\.$/, 'You follow the final group, off at $1. Earlier groups will already be on the course.'],
  [/^, part à (.+) \(groupe (\d+)\)\.$/, ', tees off at $1 (group $2).'],
  [/^⛳ (\d+) terminés?$/, '⛳ $1 finished'], [/^(\d+) sur le terrain$/, '$1 on the course'], [/^([▸▾] )?(\d+) pas encore partis?$/, (m, a, n) => (a || '') + n + ' yet to tee off'],
  [/^départs de (.+) à (.+)$/, 'tee times $1 to $2'], [/^départ à (.+)$/, 'tee time $1'], [/^départ (.+)$/, 'tee time $1'], [/^groupe (\d+)$/, 'group $1'], [/^trou (\d+)$/, 'hole $1'],
  [/^a terminé à (.+)\.$/, 'finished at $1.'],
  [/^(\d+) golfeurs? encore sur le terrain$/, (m, n) => n + (n === '1' ? ' golfer' : ' golfers') + ' still on the course'],
  [/^Le dernier groupe \((.+)\) n’est pas encore parti\.$/, 'The final group ($1) hasn’t teed off yet.'],
  [/^Le dernier groupe \((.+)\) en est au trou (\d+)\.$/, 'The final group ($1) is on hole $2.'],
  [/^(\d+) golfeurs? encore sur le terrain\. En tête : (.+)$/, (m, n, x) => n + (n === '1' ? ' golfer' : ' golfers') + ' still on the course. Leading: ' + x],
  [/^Tout le monde a terminé\. En tête : (.+)$/, 'Everyone is done. Leading: $1'],
  [/^total (.+)$/, 'total $1'], [/^(T?\d+) au classement$/, '$1 on the leaderboard']);
Object.assign(I18N_EN, { 'Nombre fixe': 'Fixed number', 'Au hasard': 'Random', 'Entre': 'Between' });
I18N_RX.push([/^(\d+) terrains? pigés? \(entre (\d+) et (\d+)\)$/, (m, n, a, b) => n + (n === '1' ? ' course' : ' courses') + ' drawn (between ' + a + ' and ' + b + ')']);
/* v220 : cotes de jeu et statistiques */
Object.assign(I18N_EN, { 'Cotes de jeu': 'Game ratings', 'Fairways': 'Fairways', 'Fers (GIR)': 'Irons (GIR)', 'Putting': 'Putting', 'Statistiques de jeu': 'Game stats',
  'Par rapport aux golfeurs de son niveau. Les cotes neutres (3/5) ne sont pas affichées.': 'Compared with golfers of his level. Neutral ratings (3/5) aren’t shown.',
  'Fairways touchés': 'Fairways hit', 'Verts en régulation': 'Greens in regulation', 'Putts par ronde': 'Putts per round', 'Sauvetages (scrambling)': 'Scrambling', 'Trois-putts par ronde': 'Three-putts per round',
  'Rondes': 'Rounds', 'GIR': 'GIR', 'Putts': 'Putts', 'Sauv.': 'Scr.', 'Sauvetages': 'Scrambling', 'Position': 'Position', 'Stats': 'Stats',
  'Les statistiques de jeu n’existent que pour les tournois joués depuis la v220.': 'Game stats only exist for tournaments played since v220.',
  'Noter mes stats (fairway, putts, pénalités)': 'Track my stats (fairway, putts, penalties)', 'Fairway': 'Fairway', '✓ Touché': '✓ Hit', '✗ Manqué': '✗ Missed',
  'Vert en régulation : déduit du score et des putts.': 'Green in regulation: worked out from the score and putts.', '✓ Vert en régulation': '✓ Green in regulation', 'Vert manqué': 'Green missed', 'sauvetage': 'scramble',
  'Fairways touchés (saison)': 'Fairways hit (season)', 'Verts en régulation (saison)': 'Greens in regulation (season)', 'Putts par ronde (saison)': 'Putts per round (season)', 'Sauvetages (saison)': 'Scrambling (season)',
  'Cotes de jeu (Fairways, Fers, Putting)': 'Game ratings (Fairways, Irons, Putting)',
  'Chaque golfeur a trois cotes de 1 à 5 jugées selon son niveau : un 5 vaut environ 0,7 à 1 coup par ronde de mieux qu’un 3. Les statistiques de jeu (fairways, verts, putts) sont notées pour tous les golfeurs.': 'Each golfer has three ratings from 1 to 5, judged against his level: a 5 is worth about 0.7 to 1 shot per round better than a 3. Game stats (fairways, greens, putts) are recorded for every golfer.',
  'Aucune victoire de tournoi pour l’instant.': 'No tournament wins yet.', 'Aucun golfeur ne correspond à ce filtre.': 'No golfer matches this filter.' });
I18N_RX.push([/^Il faut au moins 3 rondes pour établir un handicap \((\d+) au carnet\)\.$/, 'At least 3 rounds are needed to establish a handicap ($1 on record).']);
const I18N_SKLV = { 'Très faible': 'Very weak', 'Faible': 'Weak', 'Neutre': 'Neutral', 'Fort': 'Strong', 'Très fort': 'Very strong' };
const I18N_SKNM = { 'Fairways': 'Fairways', 'Fers (GIR)': 'Irons (GIR)', 'Putting': 'Putting' };
I18N_RX.push(
  [/^(Très faible|Faible|Neutre|Fort|Très fort) \((\d)\/5\)$/, (m, a, b) => I18N_SKLV[a] + ' (' + b + '/5)'],
  [/^Selon tes stats notées \((\d+) rondes\), comparées aux golfeurs de ton handicap\. Aucun effet sur tes scores\.$/, 'From your tracked stats ($1 rounds), compared with golfers of your handicap. No effect on your scores.'],
  [/^(\d+)(?:er|e) en L(\d)$/, (m, n, l) => n + (/1[123]$/.test(n) ? 'th' : n.slice(-1) === '1' ? 'st' : n.slice(-1) === '2' ? 'nd' : n.slice(-1) === '3' ? 'rd' : 'th') + ' in L' + l],
  [/^Cotes : (.+)$/, (m, x) => 'Ratings: ' + x.split(' · ').map(p => p.replace(/^(\d+) (Fairways|Fers \(GIR\)|Putting) /, (z, y, k) => y + ' ' + I18N_SKNM[k] + ' ')).join(' · ')],
  [/^Statistiques de jeu · (.+)$/, (m, x) => 'Game stats · ' + trText(x)], [/^([▲▼] )(Fairways|Fers \(GIR\)|Putting) (\d) → (\d)$/, (m, z, k, a, b) => z + I18N_SKNM[k] + ' ' + a + ' → ' + b]);
/* v221 : pénalités et radar */
Object.assign(I18N_EN, { 'Pénalités': 'Penalties', 'Pén.': 'Pen.', '0 par défaut': '0 by default', 'Pénalités par ronde': 'Penalties per round', 'Pénalités par ronde (saison)': 'Penalties per round (season)',
  'Profil statistique': 'Stat profile', 'Valeur': 'Value', 'Circuit': 'Tour', 'Centiles en détail': 'Percentiles in detail', 'Tous les golfeurs actifs': 'All active golfers', 'Toutes les stats ›': 'All stats ›', 'Toutes les stats': 'All stats',
  'Centile : 100 = le meilleur, 50 = la médiane (anneau pointillé).': 'Percentile: 100 = the best, 50 = the median (dotted ring).',
  'Coche « Noter mes stats » pendant tes rondes : après 4 rondes notées, ton profil se compare à ta ligue et à tout le circuit.': 'Tick “Track my stats” during your rounds: after 4 tracked rounds, your profile is compared with your league and the whole tour.' });
I18N_RX.push([/^\((passe chaude|creux) depuis (\d+) tournois?\)$/, (m, k, n) => '(' + (k === 'creux' ? 'slump' : 'hot streak') + ' for ' + n + (n === '1' ? ' tournament)' : ' tournaments)')]);
I18N_RX.push([/^(.+) : (\d+)e centile en Ligue (\d)$/, (m, a, p, l) => trText(a) + ': ' + p + ' percentile in League ' + l], [/^(.+) : (\d+)e centile chez tous les golfeurs actifs$/, (m, a, p) => trText(a) + ': ' + p + ' percentile among all active golfers']);
Object.assign(I18N_EN, { 'Options': 'Options', '⌂ Menu principal': '⌂ Main menu', 'Partie en cours': 'Current game', 'Continuer ma partie': 'Continue my game', 'Carrière simulée': 'Simulated career', 'Je joue moi-même': 'I play my own rounds', 'Duo': 'Duo',
  'Remplacer ta partie en cours ?': 'Replace your current game?', 'Elle sera effacée. Exporte-la d’abord dans Options › Sauvegarde si tu veux la garder.': 'It will be erased. Export it first in Options › Save if you want to keep it.', 'Remplacer': 'Replace' });
I18N_RX.push([/^Tournoi (\d+)\/(\d+)$/, 'Tournament $1/$2']);
I18N_RX.push([/^Liste de terrains à jour : (\d+) terrains dans ta liste$/, 'Course list up to date: $1 courses in your list']);
Object.assign(I18N_EN, { 'Ton défi': 'Your challenge', 'Ton handicap': 'Your handicap', 'Un handicap « plus » s’écrit en négatif (ex. −1,5).': 'A “plus” handicap is entered as a negative number (e.g. −1.5).',
  'L1 · Aspirant chaque année': 'L1 · Contender every year', 'L1 · Joueur établi': 'L1 · Established player', 'L2 · Aspirant': 'L2 · Contender', 'L2 · Joueur établi': 'L2 · Established player', 'L3 · Joueur établi': 'L3 · Established player', 'L4 · Joueur établi': 'L4 · Established player',
  'Entre ton handicap pour ajuster le circuit à ton jeu. Sans handicap : circuit de référence.': 'Enter your handicap to fit the tour to your game. Without a handicap: reference tour.', 'Circuit de référence': 'Reference tour',
  'Gagnant (2 rondes)': 'Winner (2 rounds)', 'Gagnant (1 ronde)': 'Winner (1 round)', 'Ligne de paye': 'Pay line', 'Ronde moyenne': 'Average round',
  'Niveau du circuit': 'Tour level', 'Choisi à la création de la partie.': 'Chosen when the game was created.', 'handicap': 'handicap',
  'Estimations moyennes, selon le par : chaque tournoi varie. Ce réglage se choisit à la création seulement.': 'Average estimates, relative to par: every tournament varies. This setting is chosen at creation only.' });
I18N_RX.push([/^handicap (.+)$/, 'handicap $1'], [/^([+−]?[\d.,]+) coups? par ronde$/, (m, a) => a.replace(',', '.') + ' shot' + (Math.abs(parseFloat(a.replace('−', '-').replace(',', '.'))) >= 2 ? 's' : '') + ' per round'],
  [/^pour les golfeurs IA : avec ton index de (.+), tu seras au niveau « (.+) »\.$/, (m, h, k) => 'for the AI golfers: with your index of ' + h + ', you’ll be at the “' + trText(k) + '” level.']);
Object.assign(I18N_EN, { 'Ton champ': 'Your field', 'Nombre d’adversaires': 'Number of opponents', 'Un handicap « plus » s’écrit en négatif.': 'A “plus” handicap is entered as a negative number.', 'Ton objectif': 'Your goal', 'Aspirant': 'Contender', 'Top 20': 'Top 20',
  'Entre ton handicap : le champ s’ajuste pour que tu sois à ta place selon ton objectif.': 'Enter your handicap: the field adjusts so you fit your goal.', 'par ronde.': 'per round.', 'Coupure (ronde 1)': 'Cut (round 1)', 'Ronde moyenne du champ': 'Field average round',
  'Estimation sur ce terrain : chaque tournoi varie.': 'Estimate on this course: every tournament varies.', 'Nouveau champ': 'New field', 'Tirer un terrain': 'Draw a course', 'Sors quelques terrains au hasard selon les filtres, puis choisis celui que tu veux jouer.': 'Draw a few random courses using the filters, then pick the one you want to play.',
  'Choisir': 'Pick', 'Choisi': 'Picked', 'Terrain fictif (statistiques aléatoires)': 'Fictional course (random stats)' });
I18N_RX.push([/^Avec ton index de (.+), tu serais environ$/, 'With your index of $1, you’d be about'], [/^sur (\d+) · niveau du champ$/, 'of $1 · field level'], [/^([+−][\d,.]+) coups?$/, (m, a) => a.replace(',', '.') + (/^[+−]1([.,]0)?$/.test(a) ? ' shot' : ' shots')], [/^(\d+)e place$/, (m, n) => n + (/1[123]$/.test(n) ? 'th' : n.slice(-1) === '1' ? 'st' : n.slice(-1) === '2' ? 'nd' : n.slice(-1) === '3' ? 'rd' : 'th') + ' place']);
I18N_RX.push([/^(\d+) tees? de ta liste correspond(?:ent)? \((\d+) terrains?\)$/, (m, a, b) => a + (a === '1' ? ' tee' : ' tees') + ' from your list match (' + b + (b === '1' ? ' course)' : ' courses)')], [/^Ronde 1, coupure \(environ 45 ?% du champ et les égalités\), puis ronde finale\.$/, 'Round 1, cut (about 45% of the field plus ties), then the final round.']);
Object.assign(I18N_EN, { 'Le plus difficile de la pige.': 'The hardest in the draw.', 'Le plus facile de la pige.': 'The easiest in the draw.', 'Le plus long.': 'The longest.', 'Le plus court.': 'The shortest.', 'difficulté': 'difficulty',
  'Trou le plus difficile (index 1) : le': 'Hardest hole (index 1): no.', 'Disponible dans la version en ligne du jeu (sur claude.ai) : Claude y raconte l’histoire du terrain, son paysage et ses faits divers.': 'Available in the online version of the game (on claude.ai): Claude tells the course’s history, its scenery and its trivia.',
  'Retour au tournoi': 'Back to the tournament', 'Tous au même trou': 'Everyone on the same hole', 'Tout le champ joue le même trou que vous.': 'The whole field plays the same hole as you.', '(0 à 1000)': '(0 to 1,000)', 'Aléatoire': 'Random',
  'Coupure : les': 'Cut: top', 'premiers et les égalités': 'plus ties', 'Golfeurs par groupe': 'Golfers per group', 'Simulation': 'Simulation', 'Ronde 1, coupure, puis ronde finale.': 'Round 1, cut, then the final round.', 'Le dernier groupe n’est pas encore parti.': 'The final group hasn’t teed off yet.' });
I18N_RX.push([/^(\d+(?:e|er|st|nd|rd|th)) plus difficile sur (\d+)\.$/, (m, a, n) => trText(a) + ' hardest of ' + n + '.'], [/^(\d+(?:e|er|st|nd|rd|th)) plus long\.$/, (m, a) => trText(a) + ' longest.'],
  [/^Plus difficile que (\d+) ?% des tees de ta liste\. Pour le circuit, environ ([+−]?[\d.,]+) coup par ronde par rapport à un terrain neutre\.$/, (m, p, c) => 'Harder than ' + p + '% of the tees in your list. For the tour, about ' + c.replace(',', '.') + ' shot per round compared with a neutral course.'],
  [/^terrain pigé (\d+) sur (\d+)$/, 'drawn course $1 of $2'],   [/^· aller (\d+), retour (\d+)$/, '· front $1, back $2'], [/^, un par (\d)\.$/, ', a par $1.'], [/^· un groupe aux (\d+) minutes$/, '· one group every $1 minutes'], [/^Le dernier groupe en est au trou (\d+)\.$/, 'The final group is on hole $1.']);
Object.assign(I18N_EN, { 'Parmi les 5 % de tees les plus difficiles de toute ta liste.': 'Among the hardest 5% of tees in your whole list.', 'Parmi les 5 % de tees les plus faciles de toute ta liste.': 'Among the easiest 5% of tees in your whole list.', 'Un des plus courts de ta liste.': 'One of the shortest in your list.',
  'Il finit sur un par 5 : une fin de ronde qui peut tout changer.': 'It finishes on a par 5: a closing hole that can change everything.', 'Il finit sur un par 3, une finale rare.': 'It finishes on a par 3, a rare finale.' });
I18N_RX.push([/^Un des plus longs de ta liste \(([\d  ,]+) verges\)\.$/, 'One of the longest in your list ($1 yards).'], [/^Slope de (\d+) : il punit sévèrement les erreurs\.$/, 'Slope of $1: it punishes mistakes severely.'], [/^Slope de (\d+) : un terrain clément pour les erreurs\.$/, 'Slope of $1: a forgiving course.'],
  [/^Un par (\d+), plus rare qu’un par 72\.$/, 'A par $1, rarer than a par 72.'], [/^Un par (\d+), rare\.$/, 'A par $1, a rare one.'], [/^(\d+) par 5 : des occasions d’aigle et de birdie\.$/, '$1 par 5s: eagle and birdie chances.'], [/^(\d+) par 3 : la précision des fers sera testée\.$/, '$1 par 3s: iron accuracy will be tested.'], [/^Déjà joué (\d+) fois : un habitué du circuit\.$/, 'Already played $1 times: a tour regular.']);
I18N_RX.push([/^(T?)(\d+)(?:er|e) sur (\d+)$/, (m, t, n, N) => t + n + (/1[123]$/.test(n) ? 'th' : n.slice(-1) === '1' ? 'st' : n.slice(-1) === '2' ? 'nd' : n.slice(-1) === '3' ? 'rd' : 'th') + ' of ' + N], [/^coupure ratée$/, 'missed cut']);
I18N_RX.push([/^Ronde (\d) : (\S+) · (.+)$/, (m, r, a, b) => 'Round ' + r + ': ' + trText(a) + ' · ' + trText(b)]);
I18N_RX.push([/^Les (\d+) saisons avant ton arrivée se jouent entre les golfeurs du circuit \((\d+) à (\d+)\)\. Tu fais tes débuts en (\d+)\.$/, 'The $1 seasons before your arrival are played among the tour’s golfers ($2 to $3). You make your debut in $4.'],
  [/^La saison avant ton arrivée \((\d+)\) se joue entre les golfeurs du circuit\. Tu fais tes débuts en (\d+)\.$/, 'The season before your arrival ($1) is played among the tour’s golfers. You make your debut in $2.']);
Object.assign(I18N_EN, { 'Non lus': 'Unread', 'Moi': 'Me', 'Watchlist': 'Watchlist', 'messages': 'messages', 'message': 'message', 'non lus': 'unread', 'non lu': 'unread',
  'sélectionnés': 'selected', 'sélectionné': 'selected', 'Marquer comme lu': 'Mark as read', 'Marquer comme non lu': 'Mark as unread', 'Tout marquer lu': 'Mark all as read',
  'Supprimer les messages lus': 'Delete read messages', 'messages supprimés': 'messages deleted', 'message supprimé': 'message deleted', 'Aucun message ici.': 'No messages here.',
  'Choisis un message pour le lire.': 'Pick a message to read it.', 'Golfeurs mentionnés': 'Golfers mentioned', 'Retraité': 'Retired', 'ans': 'years old', 'Finale': 'Final',
  'Messages reçus': 'Messages received', 'Décoche une catégorie pour ne plus voir ses messages. Ils ne sont pas effacés : recoche-la pour les revoir.': 'Untick a category to stop seeing its messages. They aren’t deleted: tick it again to see them.',
  'Voir la carte de la ronde': 'Show the round card', 'Voir le tournoi': 'See the tournament', 'Voir la carte de scores': 'See the scorecard', 'Recrue': 'Rookie', 'Récupérer': 'Undo', 'Tout sélectionner': 'Select all', 'Sélectionner': 'Select', 'Précédent': 'Previous', 'Suivant': 'Next' });
I18N_RX.push([/^🏆 Tu remportes la Finale(?: à (.+))?\.$/, (m, c) => '🏆 You win the Final' + (c ? ' at ' + c : '') + '.'], [/^remporte la Finale(?: à (.+))?\.$/, (m, c) => 'wins the Final' + (c ? ' at ' + c : '') + '.']);
Object.assign(I18N_EN, { 'Terrains extrêmes : adoucir au-delà de': 'Extreme courses: soften beyond', 'Effet gardé au-delà du seuil': 'Effect kept beyond the threshold', 'Tôt': 'Early', 'Tard': 'Late', 'Plafond': 'Hard cap', 'Aucun adoucissement': 'No softening',
  'Un terrain dont le course rating (ou le slope) s’éloigne beaucoup du neutre donnait des scores irréalistes. Jusqu’à ce seuil, l’effet est entier ; le slope suit (5 points de slope par coup).': 'A course whose rating (or slope) is far from neutral used to give unrealistic scores. Up to this threshold the effect is full; slope follows (5 slope points per stroke).',
  '40 % : un terrain très facile reste plus facile, mais sans exagérer. 0 % = plafond strict, 100 % = comme avant.': '40%: a very easy course stays easier, without overdoing it. 0% = hard cap, 100% = as before.' });
I18N_RX.push([/^±([\d,]+) coups? par ronde$/, (m, v) => '±' + v.replace(',', '.') + ' stroke' + (parseFloat(v.replace(',', '.')) >= 2 ? 's' : '') + ' per round']);
Object.assign(I18N_EN, { 'En mode simulé, le handicap et le défi servent seulement à régler le niveau du circuit (les adversaires). Ton golfeur garde le talent et le potentiel que tu choisis ensuite.': 'In simulated mode, the handicap and challenge only set the tour’s level (your opponents). Your golfer keeps the talent and potential you pick next.' });
Object.assign(I18N_EN, { 'Carnet de tournois': 'Tournament log', 'Carnet': 'Log', 'Touche un tournoi pour voir ses cartes de scores.': 'Tap a tournament to see its scorecards.', 'tournois': 'tournaments', 'tournoi': 'tournament',
  'Carte de scores non conservée pour ce tournoi (plus ancien que trois saisons).': 'Scorecard not kept for this tournament (older than three seasons).', 'Trou': 'Hole' });
I18N_RX.push([/^Champion de la Ligue (\d)$/, 'League $1 champion']);
I18N_RX.push([/^(\d+) fois dans les (\d+) derniers$/, '$1 times in the bottom $2'], [/^1 victoire et (\d+) autres? top-3$/, (m, n) => '1 win and ' + n + ' more top-3' + (n > 1 ? 's' : '')], [/^(\d+) top-(\d+)$/, '$1 top-$2s'],
  [/^ses résultats en bas de classement$/, 'results at the bottom of the standings'], [/^ses résultats$/, 'results']);
Object.assign(I18N_EN, { 'Chronologie': 'Timeline', 'Tout': 'All', 'Ligues et carrière': 'Leagues & career', 'Développement': 'Development', 'Aucun événement pour l’instant.': 'No events yet.',
  'Promu en Ligue': 'Promoted to League', 'Relégué en Ligue': 'Relegated to League', 'en cours de saison': 'mid-season', 'Première victoire en carrière': 'First career win', 'Victoire': 'Win', 'Majeur': 'Major', 'en prolongation': 'in a playoff',
  'Trou d’un coup': 'Hole-in-one', 'Albatros': 'Albatross', 'Aigle sur un par 4': 'Eagle on a par 4', 'trou': 'hole', 'ronde': 'round', 'Finale': 'Final', 'Remporte la Finale': 'Wins the Final', 'Fin de saison': 'Season end',
  'Saison terminée': 'Season finished', 'en Ligue': 'in League', 'victoires': 'wins', 'victoire': 'win', 'Recrue de l’année': 'Rookie of the Year', 'Intersaison': 'Offseason',
  'Monte en Ligue': 'Moves up to League', 'Descend en Ligue': 'Drops to League', 'pour la saison': 'for the season', 'Palier': 'Tier', 'Cote': 'Rating', 'Arrivée sur le circuit': 'Joins the tour', 'Perd sa place sur le circuit': 'Loses tour card', 'Prend sa retraite': 'Retires', 'saisons': 'seasons' });
Object.assign(I18N_EN, { 'Durée maximale des séquences': 'Maximum streak length', 'Force des séquences': 'Streak strength', 'Courtes': 'Short', 'Longues': 'Long', 'Discrètes': 'Subtle', 'Marquées': 'Strong',
  'Passes chaudes et creux : de 2 tournois jusqu’à ce maximum, les longues étant plus rares.': 'Hot and cold streaks: from 2 tournaments up to this maximum, long ones being rarer.',
  '×1,5 : un golfeur en feu fait environ 20 % de top 10 (7 % en temps normal) ; en creux, il rate environ 69 % des coupures.': '×1.5: a golfer on fire makes the top 10 about 20% of the time (7% normally); in a slump, he misses about 69% of cuts.' });
I18N_RX.push([/^(\d+) tournois$/, '$1 tournaments']);
Object.assign(I18N_EN, { 'Début de carrière': 'Career Beginning' });
Object.assign(I18N_EN, { 'Écart sous la moyenne pour rester': 'Margin below the average to stay', 'Indulgent': 'Lenient', 'Sévère': 'Strict',
  'Exemple : moyenne de la L1 sur 5 saisons = 4,0 et écart 0,4 → hors du top 120, il faut un index de 3,6 ou mieux pour rester. Les montées gardent leurs règles.': 'Example: L1 5-season average = 4.0 and margin 0.4 → outside the top 120, you need an index of 3.6 or better to stay. Promotions keep their rules.' });
Object.assign(I18N_EN, { 'L1 à L3 entre 130 et 170 golfeurs : le top 120 garde sa place ; plus bas, il faut un index meilleur que la moyenne de la ligue sur 5 saisons (moins l’écart ci-dessous) pour éviter la relégation. Une époque faible = une L1 plus petite. Fermé : 150 golfeurs par ligue.': 'L1 to L3 between 130 and 170 golfers: the top 120 keep their spot; lower down, you need an index better than the league’s 5-season average (minus the margin below) to avoid relegation. A weak era = a smaller L1. Off: 150 golfers per league.' });
Object.assign(I18N_EN, { 'Classe de recrues': 'Rookie Class', 'Recrues': 'Rookies', 'Sans carte': 'No card', 'placement final': 'final placement', 'ligue projetée selon l’index actuel': 'projected league from current index', 'recrues': 'rookies',
  'Moyenne des index': 'League index averages', 'sans carte au-delà de': 'no card above', 'Chaque recrue commence dans la meilleure ligue dont la moyenne est moins bonne que son index.': 'Each rookie starts in the best league whose average is worse than their index.',
  'Projetée': 'Projected', 'Ligue': 'League', 'Moy.': 'Avg', 'Tourn.': 'Events', 'Meilleur score': 'Best score', 'Aucun tournoi joué par la classe pour l’instant.': 'The class hasn’t played a tournament yet.', 'Classement de la classe': 'Class standings', 'Tournois de la classe': 'Class tournaments',
  'Arrivé déjà prêt': 'Arrived tour-ready', 'N’a pas obtenu sa carte': 'Did not earn a tour card', 'meilleurs scores': 'best scores', 'meilleur score': 'best score', 'n’obtient pas sa carte': 'does not earn a card', 'commence en Ligue': 'starts in League', 'directement chez l’élite !': 'straight into the elite!',
  'Pas de carte au-delà de la moyenne L4 +': 'No card above the L4 average +', 'Indulgent': 'Lenient', 'Recrues déjà prêtes': 'Tour-ready rookies', 'Jamais': 'Never', 'Fréquentes': 'Frequent',
  'Les recrues jouent une saison entre elles (10 tournois, sans coupure, points ni bourse). Leur index décide ensuite de leur ligue de départ : la meilleure ligue dont la moyenne est moins bonne que leur index. Fermé : toutes les recrues commencent en Ligue 4.': 'Rookies play a season among themselves (10 tournaments, no cut, points or purse). Their index then decides their starting league: the best league whose average is worse than their index. Off: every rookie starts in League 4.',
  'Avec +5, environ 13 % des recrues n’obtiennent pas leur carte.': 'With +5, about 13% of rookies don’t earn a card.',
  'Avec +3,5, environ 13 % des recrues n’obtiennent pas leur carte (avec l’écart en bas de l’échelle à 70 %).': 'With +3.5, about 13% of rookies don’t earn a card (with the gap at the bottom of the scale at 70%).',
  'Recrues prêtes à jouer': 'Game-ready rookies', 'Souvent': 'Often',
  'Plafonds des recrues faibles': 'Ceilings of weak rookies',
  'Se ressaisir après une mauvaise série': 'Regroup after a bad run', 'Très vite': 'Very quickly',
  'Un golfeur qui a perdu plus de 3 coups sur ce qu’on attendait de lui limite les dégâts sur les trous suivants, surtout s’il est Imperturbable, peu s’il est Colérique, et pas du tout lors d’une journée noire (1 ronde sur 5). Les grosses explosions restent possibles, mais plus rares.': 'A golfer who has lost more than 3 strokes against expectation limits the damage on the next holes, especially if Unflappable, little if Hot-headed, and not at all on a black day (1 round in 5). Big blow-ups remain possible, but rarer.',
  'Avance des meilleurs': 'Edge of the best', 'Grande': 'Large', 'Aucune': 'None',
  'Au-dessus du niveau 850, les meilleurs jouent un peu mieux (en coups par ronde : la valeur à 950, une fois et demie à 1000). Avec 0,8, un Generational gagne environ 6 % de ses tournois, fait un top 10 environ 4 fois sur 10 et finit souvent dans le top 10 de la saison, sans tout gagner. Les coupures ne changent pas.': 'Above level 850, the best golfers play a little better (strokes per round: the value at 950, one and a half times at 1000). At 0.8, a Generational wins about 6% of his events, finishes top 10 about 4 times in 10 and often ends the season in the top 10, without winning everything. Cut lines don’t change.',
  'Plafonds des recrues d’élite': 'Ceilings of elite rookies', 'Rares': 'Rare', 'Comme avant la v420': 'As before v420', 'Progression freinée près du sommet': 'Slower progress near the top',
  'Un très haut plafond est rapproché du niveau Elite. Avec 60 % et la progression freinée près du sommet, environ 4 golfeurs Generational en même temps (de 1 à 10 selon les époques). 100 % = comme avant la v420.': 'A very high ceiling is pulled toward Elite level. At 60% with slower progress near the top, about 4 Generational golfers at once (1 to 10 depending on the era). 100% = as before v420.',
  'Une percée rapporte de moins en moins au-dessus du niveau Elite : moitié moins vers 900, le quart vers 950. Plus on est bon, plus il est dur de progresser.': 'A breakthrough is worth less and less above Elite level: half as much around 900, a quarter around 950. The better you are, the harder it is to improve.', 'Resserrés': 'Tightened', 'Comme avant la v419': 'As before v419',
  'Un vrai plafond sous 450 (Semi-Pro) est rapproché de 450. Avec 35 %, le plus petit plafond devient environ 290 (Average) : moins de golfeurs très faibles, et la coupure de la L4 se rapproche de celle de la L3 (environ 3,6 coups au lieu de 4,7) sans toucher aux autres ligues. 100 % = comme avant la v419.': 'A true ceiling below 450 (Semi-Pro) is pulled toward 450. At 35%, the lowest ceiling becomes about 290 (Average): fewer very weak golfers, and the L4 cut gets closer to the L3 cut (about 3.6 strokes instead of 4.7) without touching the other leagues. 100% = as before v419.',
  'Une recrue prête à jouer arrive presque à son vrai plafond : elle peut commencer en L3, en L2, parfois en L1, mais a peu de marge. Un quart des recrues sont des talents bruts, loin de leur plafond. Le vrai talent ne change pas.': 'A game-ready rookie arrives close to their true ceiling: they can start in L3, L2, sometimes L1, but have little room to grow. A quarter of rookies are raw talents, far from their ceiling. True talent doesn’t change.',
  'Prêt à jouer : son jeu est déjà rodé.': 'Game-ready: his game is already polished.', 'Prêt à jouer tout de suite : peu de choses à corriger.': 'Ready to play right away: little left to fix.',
  'Talent brut : son jeu est encore loin d’être rodé.': 'Raw talent: his game is still far from polished.', 'Un diamant brut : beaucoup de travail avant de voir ce qu’il vaut.': 'A diamond in the rough: lots of work before we see what he’s worth.',
  'Chance qu’une recrue arrive avec un niveau Pro à Elite. Son potentiel n’est pas garanti : souvent bon, parfois juste au-dessus de son niveau.': 'Chance a rookie arrives at Pro to Elite level. Their potential isn’t guaranteed: often good, sometimes just above their level.',
  'Classe de recrues · aucune coupure, ni points, ni bourse : les rondes comptent pour l’index': 'Rookie Class · no cut, points or purse: rounds count toward the index' });
I18N_RX.push([/^💥 (.+) fait le saut directement en Ligue 1 après sa saison dans la classe de recrues \(index (.+)\) !$/, '💥 $1 jumps straight to League 1 after the Rookie Class season (index $2)!'],
  [/^🎓 (.+) commence sa carrière en Ligue 2 \(index (.+)\)\.$/, '🎓 $1 starts his career in League 2 (index $2).'],
  [/^🎓 (.+) termine 1er de la classe de recrues (\d+) \(index (.+)\) et commence en Ligue (\d)\.$/, '🎓 $1 tops the $2 Rookie Class (index $3) and starts in League $4.'],
  [/^❌ (\d+) recrues? de la classe (\d+) n’obtienn?e?n?t pas sa carte pour le circuit\.$/, (m, n, y) => '❌ ' + n + ' rookie' + (n > 1 ? 's' : '') + ' from the ' + y + ' class ' + (n > 1 ? 'don’t' : 'doesn’t') + ' earn a tour card.'],
  [/^🌟 (.+) \((\d+) ans\) entre dans la classe de recrues (\d+) avec un jeu déjà digne du circuit\.$/, '🌟 $1 ($2) joins the $3 Rookie Class with a game already worthy of the tour.'],
  [/^Classe de recrues (\d+)$/, '$1 Rookie Class'],
  [/^fait le saut directement en Ligue 1 après sa saison dans la classe de recrues \(index (.+)\) !$/, 'jumps straight to League 1 after the Rookie Class season (index $1)!'],
  [/^commence sa carrière en Ligue 2 \(index (.+)\)\.$/, 'starts his career in League 2 (index $1).'],
  [/^termine 1er de la classe de recrues (\d+) \(index (.+)\) et commence en Ligue (\d)\.$/, 'tops the $1 Rookie Class (index $2) and starts in League $3.'],
  [/^\((\d+) ans\) entre dans la classe de recrues (\d+) avec un jeu déjà digne du circuit\.$/, '($1) joins the $2 Rookie Class with a game already worthy of the tour.']);
Object.assign(I18N_EN, { 'Meilleur rang': 'Best rank', 'Actuel': 'Current', 'Dernier': 'Last', 'tournois au 1er rang': 'tournaments at No. 1', 'tournoi au 1er rang': 'tournament at No. 1', 'tournois dans le top 10': 'tournaments in the top 10', 'tournoi dans le top 10': 'tournament in the top 10' });
I18N_RX.push([/^Échelle logarithmique : le haut du graphique est le 1er rang\. NC = hors du top (\d+)\.$/, 'Log scale: the top of the chart is No. 1. NC = outside the top $1.']);
Object.assign(I18N_EN, { 'Voir le tournoi ›': 'See the tournament ›', 'sur': 'of', 'Classe de recrues \u00b7 ton index d\u00e9cide de ta ligue': 'Rookie Class \u00b7 your index sets your league', 'Recrues \u00b7 toi': 'Rookies \u00b7 you', 'Rang de la classe': 'Class rank', 'rang de la classe': 'class rank', 'Toute la classe': 'Whole class', 'Voir toute la classe': 'See the whole class',
  'classe de recrues': 'Rookie Class', 'aucune coupure, ni points ni bourse': 'no cut, no points, no purse', 'Tu es': 'You are', 'de la classe avec un index de': 'in the class with an index of', 'ligue projetée': 'projected league', 'Ton index apparaîtra après trois rondes.': 'Your index will appear after three rounds.',
  'Pas de coupure, de points ni de bourse : à la fin de la saison, ton index décide de ta ligue de départ.': 'No cut, points or purse: at season’s end, your index decides your starting league.', 'Tu termines': 'You finish', 'Meilleur score de la classe': 'Best score in the class', 'Résultats complets': 'Full results',
  'Ton rang final dans la classe de recrues': 'Your final rank in the Rookie Class', 'Index final': 'Final index', 'tu commences ta carrière en': 'you start your career in', 'tu as commencé ta carrière en': 'you started your career in', 'moyenne par ronde': 'average per round', 'meilleur résultat': 'best result',
  'Classe de recrues : aucune coupure, toute la classe joue la ronde 2. Chaque ronde compte pour ton index, qui décidera de ta ligue à la fin de la saison.': 'Rookie Class: no cut, the whole class plays round 2. Every round counts toward your index, which decides your league at season’s end.',
  'Ce golfeur aura un niveau et un potentiel cachés comme n’importe quel adversaire — le reste (régularité, âge de pointe…) est tiré au hasard.': 'This golfer gets a hidden level and potential like any opponent — the rest (consistency, peak age…) is rolled at random.' });
I18N_RX.push([/^Classe de recrues \u00b7 (\d+)$/, 'Rookie Class \u00b7 $1']);
I18N_RX.push([/^top (\d+) de la L1$/, 'top $1 of L1']);
Object.assign(I18N_EN, { 'La nouvelle classe de recrues': 'The new Rookie Class', 'aucune ligue': 'no league', 'Retranchés': 'Cut', 'Index trop élevé pour obtenir une carte : leur carrière s’arrête ici.': 'Index too high to earn a card: their career ends here.',
  'Voir le classement complet de la classe ›': 'See the full class standings ›', 'Bilan de la classe de recrues': 'Rookie Class report', 'Voir le placement final ›': 'See the final placement ›', 'Voir la classe en saison (index et ligue projetée) ›': 'See the class this season (index and projected league) ›',
  'Retranché (sans carte)': 'Cut (no card)', 'sans carte': 'no card', 'placé : sans carte': 'placed: no card' });
I18N_RX.push([/^(\d+) recrues? entrent dans la classe de recrues (\d+)$/, (m, n, y) => n + ' rookie' + (n > 1 ? 's' : '') + ' enter the ' + y + ' Rookie Class'],
  [/^Ils joueront la saison (\d+) dans la classe de recrues : dix tournois, sans coupure ni points\. Leur index à la fin de la saison décidera de leur ligue de départ… ou de leur retranchement\.$/, 'They will play the $1 season in the Rookie Class: ten tournaments, no cut and no points. Their index at season’s end will decide their starting league… or whether they are cut.'],
  [/^🎓 Premier de la classe de recrues (\d+)$/, '🎓 Top of the $1 Rookie Class'], [/^Index (.+) · commence en$/, 'Index $1 · starts in'],
  [/^(\d+) recrues? obtiennent? leur carte(?:, (\d+) retranchés?)?$/, (m, n, c) => n + ' rookie' + (n > 1 ? 's' : '') + ' earn their card' + (c ? ', ' + c + ' cut' : '')],
  [/^Les recrues entrées dans la classe de recrues à l’intersaison (\d+)$/, 'Rookies who entered the Rookie Class in the $1 offseason'],
  [/^Leur saison dans la classe est terminée : (\d+) ont obtenu leur carte, (\d+) ont été retranchés\.$/, 'Their class season is over: $1 earned their card, $2 were cut.'],
  [/^Ils jouent la saison (\d+) dans la classe de recrues ; leur index décidera de leur ligue de départ\.$/, 'They play the $1 season in the Rookie Class; their index will decide their starting league.'],
  [/^placé : Ligue (\d)$/, 'placed: League $1']);
Object.assign(I18N_EN, { 'Type de joueur': 'Player type', 'Manuel : tu joues sur ton simulateur et tu entres tes scores. Simulé : le jeu joue pour ton golfeur et tu suis sa carrière.': 'Manual: you play on your simulator and enter your scores. Simulated: the game plays for your golfer and you follow their career.',
  'le circuit continue': 'the tour goes on', 'les quatre ligues jouent sans toi': 'all four leagues play without you', 'Simuler la saison': 'Simulate the season', 'Simuler la fin de la saison': 'Simulate the rest of the season', 'Aucun golfeur en activité': 'No active golfer',
  'Ton arrivée sur le circuit': 'Your arrival on tour', 'Dès maintenant': 'Right away', 'Plus tard': 'Later', 'Ton joueur fait ses débuts dès la première saison.': 'Your player debuts in the very first season.',
  'Tu commences sans joueur : simule tranquillement les saisons, tournoi par tournoi ou plusieurs d’un coup, et crée ton joueur au début de n’importe quelle saison (à la fin d’une intersaison, par exemple). Tu choisiras alors un joueur manuel ou simulé, et sa ligue de départ.': 'You start without a player: simulate seasons at your own pace, one tournament at a time or several seasons at once, and create your player at the start of any season (at the end of an offseason, for example). You’ll then pick a manual or simulated player, and their starting league.',
  'Tu n’es pas encore sur le circuit': 'You’re not on tour yet', 'Créer mon joueur': 'Create my player', 'Créer mon golfeur': 'Create my golfer', 'Un nouveau golfeur ?': 'A new golfer?' });
I18N_RX.push([/^Tu peux créer ton joueur maintenant : il débutera en (\d+)\. Sinon, le circuit continue sans toi et tu pourras le créer à la prochaine intersaison\.$/, 'You can create your player now: they will debut in $1. Otherwise the tour goes on without you and you can create them at the next offseason.'],
  [/^Ta carrière débute en (\d+), dans un circuit qui a déjà son histoire\.$/, 'Your career begins in $1, on a tour that already has its own history.'],
  [/^Possible au début d’une saison : termine celle-ci pour créer ton joueur, qui débutera en (\d+)\.$/, 'Possible at the start of a season: finish this one to create your player, who will debut in $1.'],
  [/^(.+) entre dans la classe de recrues$/, '$1 enters the Rookie Class'], [/^Il fera ses débuts en (\d+)\.$/, 'They will debut in $1.'], [/^Elle débutera en (\d+)\.$/, 'It will begin in $1.'], [/^Ton joueur fera ses débuts en (\d+)\.$/, 'Your player will debut in $1.']);
Object.assign(I18N_EN, { 'Chutes': 'Drops', 'Nouveaux': 'New', 'Nouveau': 'New', '11 à 50': '11 to 50', '51 à 100': '51 to 100' });
I18N_RX.push([/^Classement mondial à la fin de la saison (\d+)\.(?: Mouvement et rang par rapport à la fin de la saison (\d+)\.)?$/, (m, a, b) => 'World ranking at the end of the ' + a + ' season.' + (b ? ' Movement and rank compared with the end of the ' + b + ' season.' : '')],
  [/^Sortis du top (\d+)$/, 'Out of the top $1'], [/^Montées · (\d+)$/, 'Risers · $1']);
Object.assign(I18N_EN, { 'Meilleur': 'Best', 'Pire': 'Worst' });
I18N_RX.push([/^(Touche|Survole) une saison pour voir son meilleur et son pire rang\. Le chiffre dans la colonne est le rang à la fin de la saison\.$/, (m, v) => (v === 'Touche' ? 'Tap' : 'Hover over') + ' a season to see its best and worst rank. The number in the column is the end-of-season rank.']);
Object.assign(I18N_EN, { 'Points des Majeurs (Ligue 1)': 'Major points (League 1)', 'Points des Majeurs': 'Major points',
  'Les 4 Majeurs rapportent autant de points que les autres tournois (la bourse reste ×1,5).': 'The 4 Majors award as many points as other tournaments (the purse stays ×1.5).',
  'Les 4 Majeurs valent environ la moitié des points de la saison : gros rendez-vous, mais une saison régulière peut gagner le titre.': 'The 4 Majors are worth about half the season’s points: big events, but a consistent season can still win the title.',
  'Les 4 Majeurs valent près de 60 % des points de la saison : ils décident souvent du champion.': 'The 4 Majors are worth nearly 60% of the season’s points: they often decide the champion.',
  'Tournois 3, 5, 7 et 9 : points multipliés (réglage ci-dessous) et bourse ×1,5. Les noms se changent dans Options › Affichage.': 'Tournaments 3, 5, 7 and 9: multiplied points (setting below) and purse ×1.5. Names can be changed in Options › Display.',
  'Avec ×2, les 4 Majeurs valent 57 % des points de la saison en L1 ; avec ×1,5, la moitié ; avec ×1, ce sont des tournois comme les autres (avec une plus grosse bourse).': 'At ×2, the 4 Majors are worth 57% of the L1 season’s points; at ×1.5, half; at ×1, they’re like any other tournament (with a bigger purse).' });
I18N_RX.push([/^×([\d,]+) les points$/, (m, v) => '×' + v.replace(',', '.') + ' points']);
/* toujours en dernier : les derniers recours */
Object.assign(I18N_EN, { 'Ligue \u00e0 suivre en direct': 'League to follow live', 'Simuler la ronde 1 trou par trou': 'Simulate round 1 hole by hole', 'Terminer la saison \u203a': 'Finish the season \u203a', 'en direct': 'live', 'Ligue suivie :': 'League followed:', 'En t\u00eate :': 'Leading:', 'En t\u00eate': 'Leading', '\u00e0 \u00e9galit\u00e9': 'tied' });
I18N_RX.push([/^(\d+) joueurs en lice$/, '$1 players in contention'], [/^(.+) gagne (\d+) places \((T?\d+)\)\.$/, '$1 gains $2 places ($3).'], [/^(\d+) joueurs poursuivent$/, '$1 players continue'], [/^Coupure \u00e0 (\S+)$/, 'Cut at $1'], [/^Par (\d+)$/, 'Par $1']);
Object.assign(I18N_EN, { 'Prolongation': 'Playoff', 'Victoire en prolongation !': 'Playoff win!', 'Vainqueur en prolongation': 'Playoff winner', 'Voir les r\u00e9sultats \u203a': 'See the results \u203a', 'Ton score au trou 18': 'Your score on hole 18', 'Simuler le trou de prolongation': 'Simulate the playoff hole', 'Simuler toute la prolongation': 'Simulate the whole playoff', 'Reprendre la prolongation': 'Resume the playoff', 'trou 18': 'hole 18' });
I18N_RX.push([/^Trou de prolongation (\d+)$/, 'Playoff hole $1'], [/^(\d+) golfeurs encore en lice$/, '$1 golfers still alive'], [/^total (\S+)$/, 'total $1'], [/^au trou de prolongation (\d+)$/, 'on playoff hole $1']);
Object.assign(I18N_EN, { 'Simuler la ronde 1 d\u2019un coup': 'Simulate round 1 at once', 'Simuler la ronde d\u2019un coup': 'Simulate the round at once' });
Object.assign(I18N_EN, { 'Tournoi ou liste…': 'Tournament or list…', 'Tournoi de la saison': 'Season tournament', 'Liste des Majeurs et de la Finale': 'Major and Finale lists', 'Dans la liste :': 'In the list:' });
I18N_RX.push([/^(.+) ajouté au tournoi (\d+)$/, '$1 added to tournament $2']);
I18N_RX.push([/^(.+) ajouté à la liste : (.+)$/, (m, a, b) => a + ' added to the list: ' + trText(b)]);
Object.assign(I18N_EN, { 'Par défaut :': 'Default:', 'écris un autre nom pour le changer.': 'type another name to change it.' });
I18N_RX.push([/^Le nom que tu écris devient le nom par défaut : le jeu y ajoutera l’année et le tournoi \(ex\. « (.+) »\)\.$/, 'The name you type becomes the default: the game will add the year and tournament (e.g. “$1”).']);
I18N_RX.push([/^Sauvegard\u00e9 dans (.+) : (.+)$/, 'Saved in $1: $2']);
Object.assign(I18N_EN, { 'Une sauvegarde porte déjà ce nom :': 'A save already has this name:', 'Remplacer cette sauvegarde': 'Replace this save', 'Nouvelle sauvegarde :': 'New save:' });
Object.assign(I18N_EN, { 'Couleurs des noms': 'Name colors', 'Les golfeurs suivis s’affichent dans la couleur de leur liste partout dans le jeu. Un golfeur dans plusieurs listes prend la couleur de la première.': 'Followed golfers appear in their list’s color everywhere in the game. A golfer in several lists takes the color of the first one.', 'Couleur par défaut': 'Default color', 'Défaut': 'Default', 'Or': 'Gold', 'Mauve': 'Purple', 'Rouge': 'Red', 'Bleu': 'Blue', 'Cyan': 'Cyan', 'Vert': 'Green', 'Orange': 'Orange', 'Rose': 'Pink' });
Object.assign(I18N_EN, { 'Avant le départ du dernier groupe': 'Before the final group tees off', 'Simuler jusqu’au dernier départ': 'Simulate until the last tee time', 'Aller directement à…': 'Jump straight to…', 'Choisir une heure de départ…': 'Choose a tee time…', 'Choisir un moment…': 'Choose a moment…', 'fin de la ronde': 'end of the round' });
I18N_RX.push([/^Dernier départ : (.+) \(groupe (\d+)\)$/, 'Last tee time: $1 (group $2)'], [/^groupe (\d+)$/, 'group $1'], [/^trou (\d+) du dernier groupe$/, 'hole $1 of the final group']);
Object.assign(I18N_EN, { 'Carte de la prolongation': 'Playoff scorecard', 'La prolongation repart du trou 1 et suit la carte jusqu’au bris d’égalité.': 'The playoff restarts on hole 1 and follows the card until the tie is broken.', 'En lice :': 'Still in:', 'Repart du trou 1 et suit la carte jusqu’au bris d’égalité.': 'Restarts on hole 1 and follows the card until the tie is broken.' });
I18N_RX.push([/^Ton score au trou (\d+)$/, 'Your score on hole $1'], [/^index (\d+)$/, 'index $1']);
I18N_RX.push(...I18N_LAST);
/*I18N-DICT-END*/

/* v431 : ménage des textes restés en français (visite automatique du jeu en anglais) */
Object.assign(I18N_EN, { 'Ton niveau': 'Your level', 'Père': 'Father', 'Fils': 'Son', 'Frère': 'Brother', 'Cousin': 'Cousin',
  'Plafond souple appliqué : la hausse au-delà de 3,0 est réduite de moitié.': 'Soft cap applied: any rise beyond 3.0 is cut in half.',
  'Plafond dur appliqué : l’handicap ne peut pas dépasser le plus bas des 10 derniers tournois de plus de 5,0.': 'Hard cap applied: the handicap can’t go more than 5.0 above the lowest of the last 10 tournaments.',
  'Voir le profil': 'View profile', 'toutes les ligues': 'all leagues', 'Victoires en carrière (Ligue 1)': 'Career wins (League 1)', 'Aucune victoire de tournoi.': 'No tournament wins.',
  'Aucune victoire de tournoi pour l’instant.': 'No tournament wins yet.', 'Classe de recrues': 'Rookie Class', 'golfeurs': 'golfers', 'golfeur': 'golfer', 'relégué': 'relegated', 'promu': 'promoted',
  'choix des dépisteurs': 'scouts’ pick', 'Colle ici le contenu du fichier de terrains': 'Paste the contents of the course file here', 'World Ranking non classé': 'World Ranking unranked',
  'Prêt à jouer : son jeu est déjà rodé.': 'Ready to play: his game is already polished.', 'Prêt à jouer tout de suite : peu de choses à corriger.': 'Ready to play right away: little to fix.',
  'Talent brut : son jeu est encore loin d’être rodé.': 'Raw talent: his game is still far from polished.', 'Un diamant brut : beaucoup de travail avant de voir ce qu’il vaut.': 'A diamond in the rough: a lot of work before we see what he’s worth.' });
I18N_RX.push([/^Ligne de paye \(top (\d+)\) à (.+)$/, 'Pay line (top $1) at $2'], [/^Ligne de paye \(top (\d+)\)$/, 'Pay line (top $1)'],
  [/^Retraité(?: en (\d+))?(?: à (\d+) ans)?$/, (m, y, a) => 'Retired' + (y ? ' in ' + y : '') + (a ? ' at ' + a : '')],
  [/^Saison (\d+) : avant ton arrivée dans le circuit\.$/, 'Season $1: before you joined the tour.'], [/^Saison (\d+) : tu n’étais pas en activité\.$/, 'Season $1: you weren’t active.'],
  [/^(\S+) choix des dépisteurs$/, '$1 scouts’ pick'], [/^Tournoi pour (.+)$/, 'Tournament for $1'],
  [/^Saison (\d+) : fin (#\d+|NC)$/, (m, y, r) => 'Season ' + y + ': end ' + (r === 'NC' ? 'unranked' : r)], [/^World Ranking saison par saison : meilleur rang (\d+)$/, 'World Ranking by season: best rank $1'],
  [/^Profil statistique en radar : (.+)$/, (m, x) => 'Stat profile radar: ' + x.replace(/(\d+)e centile/g, (q, n) => n + I18N_ORDSFX(n) + ' percentile').replace('Pénalités', 'Penalties')],
  [/^Les recrues arrivées sur le circuit à l’intersaison (\d+)$/, 'Rookies who joined the tour in the $1 offseason'], [/^Les recrues entrées dans la classe de recrues à l’intersaison (\d+)$/, 'Rookies who entered the Rookie Class in the $1 offseason']);
const I18N_ORDSFX = n => { n = +n; return n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'; };
I18N_RX.unshift([/^([^.]+)\. (.+)$/, (m, l, x) => I18N_TALLBL[l.toLowerCase()] ? I18N_TALLBL[l.toLowerCase()] + '. ' + trText(x) : m]);   // v431 : bulle d'aide d'un talent : nom + description
I18N_RX.push([/^Toi : (.+) → (.+) · (promu|relégué) en Ligue (\d)$/, (m, a, b, k, l) => 'You: ' + trText(a) + ' → ' + trText(b) + ' · ' + (k === 'promu' ? 'promoted' : 'relegated') + ' to League ' + l]);   // v431
/* v434 : identité choisie à la création du golfeur */
Object.assign(I18N_EN, { '(facultatif)': '(optional)', 'Ex. Québec': 'e.g. Quebec City', 'Poids (lb)': 'Weight (lb)' });
Object.assign(I18N_EN, { '🔍 Rechercher un golfeur…': '🔍 Search golfers…', 'Rechercher un golfeur': 'Search golfers' });
I18N_RX.push([/^retraité(?: à (\d+) ans)?$/, (m, a) => 'retired' + (a ? ' at ' + a : '')]);   // v434 : recherche
Object.assign(I18N_EN, { 'Cartes combinées': 'Combined cards', 'cartes combinées': 'combined cards' });   // v435

/* v436 : fiche rapide au survol */
Object.assign(I18N_EN, { 'Sommet en carrière': 'Career peak' });
I18N_RX.push([/^(\d+)(er|e)$/, (m, n) => { n = +n; const t = n % 100; return n + (t >= 11 && t <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'); }]);
Object.assign(I18N_EN, { 'Prochain arrêt': 'Next stop' });   // v440
/* v441 : nom de sauvegarde unique et copies automatiques au choix */
Object.assign(I18N_EN, { 'Fréquence': 'Frequency', 'Après chaque ronde': 'After each round', 'Après chaque tournoi': 'After each tournament', 'Après chaque saison': 'After each season', 'Jamais': 'Never',
  'Aucune copie automatique.': 'No automatic copies.', 'Ta partie :': 'Your game:', 'ce fichier est remplacé à chaque sauvegarde. Écris un autre nom pour garder une copie à part.': 'this file is replaced each time you save. Type another name to keep a separate copy.',
  '(fichiers « auto - … - 1 » à « - ': '(files “auto - … - 1” to “- ',
  'Choisis le dossier « Saved Games » (lien « Choisir maintenant », près du bouton de sauvegarde) pour que les copies aillent dans un fichier sur ton ordinateur. Pour l’instant, elles restent dans ce navigateur.': 'Choose the “Saved Games” folder (“Choose now” link, next to the save button) so the copies go to a file on your computer. For now, they stay in this browser.',
  'Ici, les copies restent dans ce navigateur : pour les avoir dans un dossier, joue avec le fichier téléchargé, dans Chrome ou Edge.': 'Here, the copies stay in this browser: to get them in a folder, play with the downloaded file, in Chrome or Edge.' });
I18N_RX.push([/^Les (\d+) dernières copies vont dans le dossier$/, 'The last $1 copies go to the folder'],
  [/^\(fichiers « auto - … - 1 » à « - (\d+) », qui tournent\), et une copie reste aussi dans ce navigateur\.$/, '(files “auto - … - 1” to “- $1”, in rotation), and a copy also stays in this browser.']);
/* v442 : tournoi rapide (prolongation, cartes de fin, reprise) */
Object.assign(I18N_EN, { 'Résultats': 'Results', 'Cartes ronde 1': 'Round 1 cards', 'Cartes ronde 2': 'Round 2 cards', 'Cartes de scores': 'Scorecards', 'Vainqueur en prolongation': 'Playoff winner', 'Prolongation': 'Playoff', 'Carte de la prolongation': 'Playoff card',
  'Valider le trou de prolongation': 'Confirm the playoff hole', 'Simuler le trou de prolongation': 'Simulate the playoff hole', 'Simuler toute la prolongation': 'Simulate the whole playoff', 'Voir les résultats': 'See the results',
  'La prolongation repart du trou 1 et suit la carte jusqu’au bris d’égalité.': 'The playoff restarts at hole 1 and follows the card until the tie is broken.',
  'Ton tournoi rapide est gardé : reprends-le quand tu veux avec « Reprendre Play Now »': 'Your quick tournament is kept: resume it any time with “Resume Play Now”' });
I18N_RX.push([/^(.+) remporte le tournoi en prolongation à (\S+)$/, '$1 wins the tournament in a playoff at $2'], [/^Trou de prolongation (\d+)$/, 'Playoff hole $1'], [/^au trou de prolongation (\d+)$/, 'on playoff hole $1'], [/^trou (\d+)$/, 'hole $1'], [/^index (\d+)$/, 'index $1'], [/^Trou (\d+)$/, 'Hole $1']);
/* v443 : tournoi rapide (préparation en colonnes, cartes des joueurs) */
Object.assign(I18N_EN, { 'Ton tournoi': 'Your tournament', '1 ronde': '1 round', 'Aucun adversaire': 'No opponents', 'Vos cartes': 'Your cards', 'Retour (9)': 'In' });
I18N_RX.push([/^(\d+) adversaires$/, '$1 opponents'], [/^après (\d+) trous?$/, (m, n) => 'thru ' + n]);
/* v443 : tournoi rapide, bande « Moments clés » */
Object.assign(I18N_EN, { 'Moments clés': 'Key moments' });
const PN_HW = { 'trou d’un coup': 'hole-in-one', 'albatros': 'albatross', 'aigle': 'eagle', 'birdie': 'birdie', 'par': 'par', 'bogey': 'bogey', 'double bogey': 'double bogey', 'triple bogey': 'triple bogey', 'quadruple bogey ou pire': 'quadruple bogey or worse' };
I18N_RX.push([/^(.+) : (trou d’un coup|albatros|aigle|birdie|par|bogey|double bogey|triple bogey|quadruple bogey ou pire)( \(.+\))?$/, (m, n, w, x) => n + ': ' + (PN_HW[w] || w) + (x || '')],
  [/^(.+) prend la tête à (\S+)$/, '$1 takes the lead at $2'], [/^En tête : (.+)$/, 'Leader: $1'], [/^(\d+) golfeurs à égalité en tête à (\S+)$/, '$1 golfers tied for the lead at $2']);
/* v448 : la Finale en spectateur, tri du tableau Progression */
Object.assign(I18N_EN, { 'Suivre la ronde 1 trou par trou': 'Follow round 1 hole by hole', 'Simuler la Finale au complet': 'Simulate the whole Finale' });
Object.assign(I18N_EN, { 'Clique sur une colonne pour trier': 'Click a column to sort', 'Ordre d’origine': 'Original order' });
/* v449 : World Ranking en ligne, Promotions et relégations en page télé */
Object.assign(I18N_EN, { 'saisons finies dans le top 10': 'seasons finished in the top 10', 'saison finie dans le top 10': 'season finished in the top 10', 'Survole une saison pour le détail.': 'Hover over a season for details.', 'Touche une saison pour le détail.': 'Tap a season for details.',
  'La pastille donne le rang à la fin de la saison ; le trait gris va du meilleur au pire rang de l’année.': 'The dot shows the end-of-season rank; the grey bar runs from the year’s best to worst rank.' });
Object.assign(I18N_EN, { 'Montent en': 'Move up to', 'Descendent en': 'Drop to', 'Personne': 'Nobody', 'Les ligues de': 'The leagues of', 'Le chiffre de gauche est le rang de fin de saison dans l’ancienne ligue ; à droite, les points.': 'Left: end-of-season rank in the old league; right: points.' });
I18N_RX.push([/^(\d+) golfeurs? montent$/, (m, n) => n + (n === '1' ? ' golfer moves up' : ' golfers move up')], [/^(\d+) descendent$/, '$1 drop down'], [/^(\d+) déplacés en cours de saison$/, '$1 moved mid-season']);
