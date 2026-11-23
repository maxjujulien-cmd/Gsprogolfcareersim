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
- Il veut que tout soit au même endroit : un seul dépôt GitHub, tout y est enregistré à chaque changement.

## Décisions d'équilibre à respecter (novembre 2026)

Les détails et les chiffres sont dans `docs/parametres.md`. **Le lire avant toute discussion d'équilibre**, et le tenir à jour après chaque changement.

- **Écarts de coupure entre ligues** : les écarts du milieu (L1 → L2 et L2 → L3, environ +2,5) sont parfaits ; **ne pas resserrer le milieu**. On cherche seulement à réduire L3 → L4 (≈ +3,8 en v420).
- **Environ 4 golfeurs Generational** en même temps sur le circuit.
- **Vedettes présentes mais pas écrasantes** (v421) : un Generational gagne environ 6 à 7 % de ses tournois, fait un top 10 environ 4 fois sur 10 et finit souvent dans le top 10 de la saison. Max a refusé une domination plus forte (avance 1,5). Il aime les rondes exceptionnelles de temps en temps (feu 5 %, catastrophes 6 %).
- **Recrues** : profils brut / standard / prêt à jouer (25 / 50 / 25). Le vrai plafond ne change pas, seul le point de départ change.
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
- **Sauvegardes existantes** : un changement d'équilibre ne doit pas casser une partie en cours. Utiliser un drapeau de migration dans `loadState` (exemples : `lkv`, `rpv`), et indiquer à Max ce qui s'applique tout de suite et ce qui ne vaut que pour les prochaines recrues.

## À chaque nouvelle version

1. Numéro de version suivant (dernière : **v421**), noté dans les commentaires du code modifié.
2. `npm run build`, puis `npm test`. Pour un changement d'équilibre, vérifier aussi dans le vrai jeu avec le banc d'essai.
3. Mettre à jour `docs/parametres.md` (et le README si besoin).
4. **Commit et push sur GitHub, toujours, à la fin de chaque changement.** Ne jamais laisser une version seulement dans l'artifact ou dans un fichier envoyé.
5. Envoyer à Max le fichier autonome `IndoorGolfCareer-vNNN.html`.
6. Republier l'artifact « Indoor Golf Career » (https://claude.ai/artifact/NijQgQmv7xLd7eQfKQ73vB) si Max le demande : publier `dist/index.html`. Republier aussi un fichier de données (`ootp-names.js`, `ootp-names-extra.js`, `terrains-data.js`) seulement s'il a changé.

## Terrains

Mise à jour depuis Simulator Golf Tour : suivre `docs/terrains.md`. L'environnement cloud « Gsprogolfcareersim » autorise `simulatorgolftour.com`.

## Dépôts GitHub

- **Le seul dépôt du jeu est `maxjujulien-cmd/Gsprogolfcareersim`.** L'ancien dépôt `claude-golf-career-simulator-improvements-ff32jf` (10-11 novembre 2026, jusqu'à environ la v399) est dépassé : tout son contenu est dans la v416, importée ici le 20 novembre. Ne plus y travailler.
- Fusionner le travail dans `main` par une pull request quand Max le demande.

## Si Max a modifié le jeu ailleurs

Si Max a modifié le jeu dans une conversation claude.ai ou dans l'artifact, lui demander le fichier, puis le réimporter avec `node tools/importer.mjs fichier.html --remplacer`. Regarder le `git diff`, puis faire un commit avant de continuer.
