# Indoor Golf Career : consignes pour Claude

Jeu de carrière de golf (HTML, une seule page) que Max joue sur un simulateur GSPro. Ce fichier est lu au début de chaque session : il remplace les instructions d'un « Projet » claude.ai.

## Comment Max fonctionne

- **Tout en français**, en langage simple. Max n'est pas programmeur : expliquer en termes de jeu (coupures, ligues, recrues), pas en termes de code.
- **Mesurer avant de changer.** Pour tout réglage d'équilibre : faire tourner le banc d'essai (`tools/mesure/`), montrer les chiffres dans un tableau, recommander une option, puis **attendre l'accord de Max** avant de l'intégrer au jeu.
- Être honnête sur les effets secondaires et les erreurs. Exemple : la v417 faisait grossir la L4, et ça a été corrigé en v418.
- **Proposer des options, puis n'en livrer qu'une.** Quand une amélioration admet plusieurs approches (apparence, disposition, fonctionnement) :
  1. préparer les options (souvent 4) **en dehors du jeu**, avec des captures d'écran avant / après, une planche par option ;
  2. les envoyer à Max et le laisser choisir ;
  3. ne mettre dans le jeu **que l'option choisie**.

  Ne jamais ajouter au jeu un sélecteur ou un réglage pour choisir entre des options d'apparence ou de disposition : Max ne veut pas multiplier les options. Les réglages d'équilibre vont dans les réglages avancés existants, toujours avec la valeur choisie par défaut.
- Max joue sur un écran **1920 × 1080**. Pour un changement visible, vérifier par des captures (Playwright) à cette taille.
- Max aime un **monde varié et vivant** : des carrières toutes différentes, des recrues brutes ou prêtes à jouer, des éclosions tardives, des golfeurs qui plafonnent. Comme dans le vrai golf.

## Ce que Max aime (à enrichir à chaque session)

Ce fichier sert à mieux connaître Max d'une session à l'autre. **À la fin d'une session, ajouter ici ce qu'on a appris de nouveau sur ses goûts et sa façon de décider**, en quelques lignes, puis faire un commit. Ne pas répéter ce qui est déjà noté.

- Il aime comprendre le pourquoi : un constat chiffré, la cause trouvée dans le code, puis des options comparées dans un tableau.
- Il tranche vite une fois les chiffres en main (« Option A », « environ 4, c'est bon »), et il refuse ce qui touche à ce qu'il trouve déjà réussi (par exemple les écarts du milieu).
- Le réalisme compte, mais d'abord le plaisir de jeu : un monde imprévisible, des histoires de carrière (le golfeur qui plafonne en L2, l'éclosion tardive qui finit en L1, le phénomène rare).
- Il joue lui-même dans sa carrière (handicap 4, défi « L2 · Aspirant », partie commencée en v417), sur GSPro.
- Il pense en joueur : un dominant n'a pas besoin de gagner souvent, mais il doit faire beaucoup de points et finir souvent en haut. Il propose lui-même des pistes (constance, rondes exceptionnelles) : les tester honnêtement, même quand elles ne suffisent pas seules.
- Il préfère l'imprévu cohérent à la perfection : des explosions et des surprises, mais qui ont un sens (le tempérament, une journée noire).
- D'autres joueront aussi à son jeu : penser aux autres niveaux de handicap et aux autres défis, pas seulement aux siens.
- En apparence, il aime le style « télé » (bandeaux, chiffres géants, photo) et mélange volontiers les options (« les infos de B avec le look de A »).
- Il est prêt à commencer sa « vraie » carrière (fin novembre 2026, v430). Il préfère garder le jeu stable plutôt qu'ajouter des systèmes : il trouve le jeu déjà assez complet.
- Pour les petites aides d'interface, il pense ordinateur d'abord : il refuse ce qui encombrerait le téléphone (fiche au survol : ordinateur seulement).
- La lisibilité passe avant tout quand il joue : une belle photo, oui, mais le texte doit rester net (« mieux voir la calligraphie »).
- Il remarque les petits détails qui clochent (l'avion qui semblait partir de la destination) : soigner le sens et la cohérence des visuels.
- Il retouche volontiers une option choisie (« A, mais avec plus de contraste ») : lui montrer 2 ou 3 variantes de l'option côte à côte, avec une recommandation.
- Il commence sa vraie carrière (27 novembre 2026, v440) et fait confiance aux sauvegardes : il a refusé un test automatique avec sa propre sauvegarde. D'autant plus important : ne jamais casser une partie en cours (migrations dans `loadState`).
- Il repère les biais du monde généré (trop de Québécois parmi les Canadiens) et préfère le réalisme des proportions à un clin d'œil local.
- Il veut que tout soit au même endroit : un seul dépôt GitHub, tout y est enregistré à chaque changement.

## Décisions d'équilibre à respecter (novembre 2026)

Les détails et les chiffres sont dans `docs/parametres.md`. **Le lire avant toute discussion d'équilibre**, et le tenir à jour après chaque changement.

- **Écarts de coupure entre ligues** : les écarts du milieu (L1 → L2 et L2 → L3, environ +2,5) sont parfaits ; **ne pas resserrer le milieu**. On cherche seulement à réduire L3 → L4 (≈ +3,8 en v420).
- **Environ 4 golfeurs Generational** en même temps sur le circuit.
- **Vedettes présentes mais pas écrasantes** (v421) : un Generational gagne environ 6 à 7 % de ses tournois, fait un top 10 environ 4 fois sur 10 et finit souvent dans le top 10 de la saison. Max a refusé une domination plus forte (avance 1,5). Il aime les rondes exceptionnelles de temps en temps (feu 5 %, catastrophes 6 %).
- **Le pire résultat sur un trou est +4** (choix de Max, à ne pas changer). Une ronde absurde vient d'une accumulation de mauvais trous.
- **Explosions de temps en temps** (v422) : les golfeurs se ressaisissent après une mauvaise série selon leur tempérament, mais pas lors d'une journée noire (1 ronde sur 5). Max a refusé une version plus forte : il ne veut surtout pas un monde prévisible ou « robotisé ».
- **Recrues** : profils brut / standard / prêt à jouer (25 / 50 / 25). Le vrai plafond ne change pas, seul le point de départ change.
- **Défis (handicap → niveau du circuit)** : table recalibrée en v423 (Aspirant = top 5 de la ligue, Joueur établi = milieu de la ligue). **À refaire avec `tools/mesure/calibrer-defis.cjs` après chaque changement d'équilibre important.**
- Ce qui n'a pas marché, et pourquoi, est noté dans `docs/parametres.md` : ne pas le retester sans raison nouvelle.

## Le code

- `src/` contient le jeu découpé en modules (`src/js/NN-*.js`, `src/styles/`). `public/` contient les données : noms et terrains.
- `npm run build` produit `dist/index.html` (la page de l'artifact) et `dist/IndoorGolfCareer.html` (le fichier autonome pour le PC du simulateur).
- `npm test` vérifie l'aller-retour et le démarrage dans Chromium.
- `tools/importer.mjs` réimporte une version produite ailleurs (voir le README).
- `tools/mesure/` est le banc d'essai : `mesurer.cjs`, `analyser.cjs`, `comparer.cjs`, `carrieres.cjs`, `elite.cjs`. Le mode d'emploi est en tête de `mesurer.cjs`. La mesure standard est de 3 mondes × 30 saisons, en lançant plusieurs essais en parallèle.
- Les réglages du jeu sont dans `DEFAULT_CFG` (`src/js/02-*.js`) et `ADV_DEF` (`src/js/41-reglages-avances.js`). Un nouveau réglage avancé demande sa traduction anglaise dans `src/js/01-langue-francais-ou-anglais.js`.
- Les fichiers `src/js/NN-*.js` sont concaténés dans **un seul** `<script>` : l'ordre compte et tout est global. Un nouveau module commence par un en-tête `/* ============ TITRE ============` et son nom de fichier doit correspondre à ce titre, sinon le test d'aller-retour échoue (il indique le nom attendu).
- Pour tester avec une carrière remplie : démarrer une partie en mode manuel et jouer quelques tournois automatiquement (« Simuler jusqu'à mon départ », puis saisir des scores et « Valider le trou »).
- Chaque push sur GitHub construit et teste le jeu (onglet Actions). Le fichier prêt à jouer, `IndoorGolfCareer`, se télécharge depuis la page de l'exécution.
- **Attention aux commentaires en fin de ligne** : en v418, une modification a fait glisser du code dans un commentaire (`// …`) dans `loadState`. Le modèle de trous n'était plus construit au chargement d'une partie, et « Valider le trou » ne faisait plus rien (corrigé en v430). Après une modification, vérifier qu'aucun appel n'a disparu (comparer les appels de fonctions avant/après), et tester une vraie ronde jouée à partir d'une sauvegarde chargée.
- **Langue : le jeu est toujours en anglais** (v431, choix de Max ; plus de sélecteur). Le code reste écrit en français et `src/js/01-langue-francais-ou-anglais.js` traduit à l'affichage (dictionnaire `I18N_EN`, motifs `I18N_RX`). **Toute nouvelle phrase affichée demande sa traduction anglaise.** Le test `tests/anglais.test.mjs` joue une partie (un tournoi trou par trou, une saison, l'intersaison, les menus et des fiches) et échoue s'il voit du français ; les noms de golfeurs, de terrains et de villes sont ignorés. Le monde change à chaque passage : le lancer plusieurs fois après un gros ajout de textes.
- Nos réponses à Max restent en français.
- **Sauvegardes existantes** : un changement d'équilibre ne doit pas casser une partie en cours. Utiliser un drapeau de migration dans `loadState` (exemples : `lkv`, `rpv`), et indiquer à Max ce qui s'applique tout de suite et ce qui ne vaut que pour les prochaines recrues.

## À chaque nouvelle version

1. Numéro de version suivant (dernière : **v449**), noté dans les commentaires du code modifié, **et dans `GAME_V` (`src/js/02-carriere-de-golf-moteur-de.js`)** : c'est le numéro affiché en bas à gauche du jeu (v432, choix de Max).
2. **Vérifications en trois niveaux** (décision de Max, 27 novembre 2026 : les vérifications répétées coûtaient trop de temps et de données) :
   - **Toujours** (moins d'une minute) : `npm run build`, puis `npm test` **une seule fois** (aller-retour, démarrage, et un seul passage du test anglais).
   - **Seulement quand c'est pertinent** : **une seule** capture 1920 × 1080 pour un changement visible ; le test anglais relancé plusieurs fois seulement après un gros ajout de textes (nouvelle page) ; une ronde jouée depuis une sauvegarde chargée seulement si le changement touche au chargement des parties ou au déroulement d'une ronde ; le banc d'essai seulement pour un changement d'équilibre.
   - **Grand ménage, de temps en temps** (avant de publier le jeu, ou toutes les 5 à 10 versions) : visite complète du jeu en anglais sur de grosses parties, une ronde jouée de bout en bout, captures de toutes les pages refaites, et vérification qu'aucun appel de fonction n'a disparu du code. Dernier grand ménage : v431.
3. Mettre à jour `docs/parametres.md` (et le README si besoin).
4. **Commit et push sur GitHub, toujours, à la fin de chaque changement.** Ne jamais laisser une version seulement dans l'artifact ou dans un fichier envoyé.
5. Envoyer à Max le fichier autonome `IndoorGolfCareer-vNNN.html`.
6. **Republier l'artifact « Indoor Golf Career »** (https://claude.ai/artifact/NijQgQmv7xLd7eQfKQ73vB) **à chaque nouvelle version** (décision de Max, 27 novembre 2026) : publier `dist/index.html` avec `url`, et un fichier de données (`ootp-names.js`, `ootp-names-extra.js`, `terrains-data.js`) seulement s'il a changé (le relire d'abord avec `action: read` et `path`). L'artifact est partagé « toute personne ayant le lien » : attention à la photo du trophée (voir plus bas). Dernière publication : v449.

## Intersaison en pages « télé » (v425-v428, en cours)

- Max refait les chapitres de l'intersaison un par un : 4 maquettes par chapitre, il en choisit une. « Les champions » = maquette A2 (v425) : page plein écran avec sa photo du trophée (`src/assets/champ-img.webp`), nom géant, bandeau de stats, parcours en barres, bandeau des majeurs.
- « Ta saison » = maquette B2 (v426) : Max aimait les infos de la carte de pointage (option B) mais voulait le look télé de la A2. Ton rang géant, bandeau de stats, carte de la saison (rondes, total, place, points, gains par tournoi), moments, saison suivante et bouton de retraite discret.
- « Retraites » = maquette C (v427) : tableau télé des départs classés par gains (âge, années de carrière, titres de L1, majeurs, meilleur rang mondial), 4 chiffres de la saison à droite, bandeau défilant des autres départs. Max a préféré le tableau clair à l'hommage plus émotif que je recommandais.
- « Promotions et relégations » = maquette D (v449) : les trois frontières, toutes les listes complètes.
- « Progression » = maquette C (v428), avec une demande de Max : pouvoir faire défiler pour voir TOUS les golfeurs qui changent de palier. Tableau défilant (grands mouvements d'abord, puis montées, puis reculs), 4 chiffres à droite, bandeau « Dans les coulisses ».
- Max veut toujours pouvoir accéder à la liste complète : une page résumée ne doit pas cacher des golfeurs.
- Chapitres suivants : on garde la liste actuelle des chapitres (Max a refusé d'en ajouter pour l'instant).
- Un chapitre plein écran se déclare avec `full: 1` (et `img`) dans `offChapters` ; `vOff` garde les points de progression et les boutons.
- La photo du trophée (Wanamaker) vient de Max et est probablement protégée : bien pour son usage personnel, à remplacer avant de partager le jeu publiquement.

## Fiche du golfeur (v429)

- Max a choisi le style « carte de collection » (option B), mais en gardant **toutes** les infos déjà visibles : une refonte pour embellir, pas pour retirer. Sur ordinateur : carte (photo ou initiales + niveau) à gauche, saison et carte handicap à droite, parcours et niveau/potentiel côte à côte dessous. Téléphone inchangé.
- Fiche rapide au survol (v436, maquette A « mini carte de collection ») : sur ordinateur seulement (Max n'en veut pas sur téléphone), elle s'ouvre après 0,5 s sur tout nom cliquable (`data-a="golfer"`) ; code à la fin de `46-mise-en-page-sur-ordinateur.js`.
- Tableau en direct (v437) : en ronde 1, ceux qui ne sont pas partis n'ont pas de position (« – », `nop` dans `rankTies`) ; l'option « Épinglé » est retirée : sur ordinateur, ta ligne a une place fixe sous l'en-tête des cartes (`pinfix`) ; la case « Golfeurs » des ligues compte les golfeurs présents dans la ligue.
- Couleurs des positions (v438, option A2 « dégradé de verts contrasté ») : or = victoire, vert éclatant = top 5, vert franc = top 10, vert foncé = top 20, brun = coupure ratée ; `posTc()` et les règles CSS à la fin de `src/styles/10-*.css`, partout où une position est colorée.
- Carte du trou (v439, option A2) : photo de Max (`src/assets/hole-img.webp`, recadrée pour enlever un texte en bas à droite) en fond, haut et bas assombris, texte blanc ombré ; variable `--holeimg` posée dans `46-*.js`, règles à la fin de `src/styles/10-*.css`. Photo d'origine probablement générée ou tirée d'un site : à vérifier avant un partage public.
- Prochain tournoi sur la carte (v440, options B + C) : carte du monde à plat avec le trajet du vol dans la carte du prochain tournoi (`voyMapHTML`, ordinateur seulement, bandeau vert d'origine s'il manque une position) ; l'avion est toujours tourné vers sa destination (demande de Max). La page « Le voyage » s'ouvre tournée vers le prochain tournoi, en pastille dorée avec son nom.
- Sauvegardes (v441, demande de Max) : un seul nom par partie (`S.saveBase`, ou le nom du fichier chargé, ou « Nom - career ») ; « Save the game » remplace ce fichier sans question ; un nom écrit à la main crée une copie à part sans changer le nom par défaut. Copies automatiques au choix (`S.bkm` : après chaque ronde / tournoi (défaut) / saison / jamais), écrites dans le dossier « Saved Games » quand il est choisi (fichiers « auto - nom - 1 à 5 »), et aussi dans le navigateur.
- Carte du trajet détaillée selon le zoom (v442) : contours fins des pays, frontières des États et provinces, noms des pays puis des provinces. Tournoi rapide (v442) : prolongation en mort subite si égalité (`cur.po`, `vPnPo`), cartes de tout le champ à la fin (onglets Résultats / cartes de chaque ronde / combinées), tournoi en cours gardé dans le fichier de sauvegarde (`pnx`, rendu par `loadState`).
- Tournoi rapide (v443) : préparation en colonnes sur ordinateur avec un bandeau « Ton tournoi » et le bouton Commencer toujours visible (option D) ; cartes des joueurs manuels à gauche sous la saisie (option X, `pnMiniCards`), plus de lignes épinglées ; dévoilement « Par séquence » (`PNREV`), flèches de montée et de descente (`cur.mvb`) et bande « Moments clés » (`pnKmRender`), comme en carrière.
- Positions des terrains (v444) : 179 terrains localisés de plus (coordonnées SGT) ; la recherche du jeu (OpenStreetMap) fait plusieurs essais et préfère un résultat « terrain de golf » (`geoLookup`). Les 49 restants (surtout fictifs) ont été placés en v445 selon une liste remplie par Max : tous les terrains de la liste ont une position.
- Villes natales des Canadiens (v446, option A) : tirées selon le poids réel des provinces (`BIO_CAN`, `bioCityCan` : Québec 22 %, Ontario 39 %, C.-B. 14 %, Alberta 12 %…) ; seulement pour les nouveaux golfeurs.
- Choix du tee (v447) : la distance totale s'affiche à côté de chaque couleur (« Black · 6,446 yds », `teeOptHTML`), dans la page des terrains et dans le tournoi rapide.
- La Finale se regarde en spectateur quand le joueur n'y est pas (v448) : `S.cur.sw` aussi dans ce cas (`beginTournamentIfNeeded`), boutons « Suivre la ronde 1 trou par trou » / « Simuler la ronde 1 » / « Simuler la Finale au complet ». Tableau Progression de l'intersaison triable par colonne (`VIEW.tcs`, action `tcsort`).
- World Ranking de la fiche (v449, option A « ligne télé ») : pastilles de rang de fin de saison reliées, trait gris meilleur → pire rang, bulle au survol gardée, 4 chiffres en haut (`wrChartHTML`). Chapitre « Promotions et relégations » en page télé (v449, option D « les trois frontières ») : une carte par frontière avec tous ceux qui montent et descendent, rang et points (`offMvHTML`).
- Les photos des golfeurs viennent de la bibliothèque de Max (dossier Graphics, `44-bibliotheque-de-photos.js`).

## Banc d'essai de Max avant publication

- Page interactive : https://claude.ai/artifact/9V96eckwJCPZyHqUcvGEeB (copie : `docs/plan-essai.html`). 78 points en 11 étapes ; pour chacun, Max choisit J'aime / Bof / À changer et écrit une note.
- Ses réponses sont dans la base de la page (titre : « Liste des tests Indoor Golf Career ») :
  - collection `avis` : un document par point (`v` = aime | bof | chg, `n` = commentaire libre) ;
  - collection `mods` : **la liste des modifications**, un document par modification (`p` = point, `t` = texte, `o` = ordre, `af` = à faire, `fait` = fait, `ver` = vérifié, `img` = captures jointes). Le point `divers` = bloc « À faire ailleurs » (choses sans endroit précis).
  - En haut de la page (28 nov. 2026) : panneau « À faire » (af sans fait) et « Faites, à vérifier » (fait sans ver), avec un lien vers le point ; chaque élément porte un statut coloré et un menu « Déplacer… » qui change son `p`.
  - Les captures sont des fichiers de la page : les lire avec `Artifact` (`action: read`, `path` = l'identifiant dans `img`).
- **Fonctionnement** : Max coche **À faire** (`af`) puis me dit « règle ce qui est à faire ». Je lis `mods` (et `avis`) avec `ArtifactData`, je prends les éléments `af: true` et `fait: false`, je reviens vers Max point par point pour confirmer ce que je vais faire, je les règle, puis **je coche `fait: true`** (update avec `if_version`). **Je ne touche jamais à `af` ni à `ver`** : c'est Max qui coche Vérifié quand l'élément est réglé à son goût.

## Idées en attente (Max a dit « plus tard »)

- **Tournois à 4 rondes, coupure après 36 trous (comme le PGA Tour)** : gros chantier (environ 200 endroits dans 28 modules supposent au plus 2 rondes ; format des résultats sauvegardés à agrandir sans casser les parties ; équilibre et défis à remesurer). Deux options présentées le 26 novembre 2026 : A. choix 1, 2 ou 4 rondes à la création d'une carrière ; B. 4 rondes seulement pour les majeurs et la Finale (recommandée). Rappel : Max joue ses rondes sur GSPro, donc 4 rondes = deux fois plus de temps de jeu.
- **Réalisme** (aucune n'a inspiré Max pour l'instant) : tirage matin / après-midi, terrains fétiches, blessures passagères, chantier de swing, invitations, météo suivie entre les rondes, décalage horaire, préparation du parcours (greens et fermeté GSPro), dépenses et commanditaires, calendrier géographique, Tournoi des champions, Coupe des Nations.
- **Solidité** : test automatique d'une ronde jouée à partir d'une sauvegarde ; alléger les sauvegardes de très longues parties (plus de 30 Mo à 100 saisons) ; suite de l'intersaison en style télé (« Talents et tempéraments » et les suivants).
- Constat du 24 novembre 2026 (rondes 1 et 2 très différentes) : surtout le vent tiré indépendamment à chaque ronde et la chance de la ronde 1 qui ne se répète pas ; pas d'excès d'extrêmes. Max a jugé que « ça fait du sens » : rien changé.

## Terrains

Mise à jour depuis Simulator Golf Tour : suivre `docs/terrains.md`. L'environnement cloud « Gsprogolfcareersim » autorise `simulatorgolftour.com`.

## Dépôts GitHub

- **Le seul dépôt du jeu est `maxjujulien-cmd/Gsprogolfcareersim`.** L'ancien dépôt `claude-golf-career-simulator-improvements-ff32jf` (10-11 novembre 2026, jusqu'à environ la v399) est dépassé : tout son contenu est dans la v416, importée ici le 20 novembre. Ne plus y travailler.
- Fusionner le travail dans `main` par une pull request quand Max le demande.

## Si Max a modifié le jeu ailleurs

Si Max a modifié le jeu dans une conversation claude.ai ou dans l'artifact, lui demander le fichier, puis le réimporter avec `node tools/importer.mjs fichier.html --remplacer`. Regarder le `git diff`, puis faire un commit avant de continuer.
