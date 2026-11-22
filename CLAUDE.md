# Indoor Golf Career : consignes pour Claude

Jeu de carrière de golf (HTML, une seule page) que Max joue sur un simulateur GSPro. Ce fichier est lu au début de chaque session : il remplace les instructions d'un « Projet » claude.ai.

## Comment Max fonctionne

- **Tout en français**, en langage simple. Max n'est pas programmeur : expliquer en termes de jeu (coupures, ligues, recrues), pas en termes de code.
- **Mesurer avant de changer.** Pour tout réglage d'équilibre : faire tourner le banc d'essai (`tools/mesure/`), montrer les chiffres dans un tableau, recommander une option, puis **attendre l'accord de Max** avant de l'intégrer au jeu.
- Être honnête sur les effets secondaires et les erreurs. Exemple : la v417 faisait grossir la L4, et ça a été corrigé en v418.
- Max aime un **monde varié et vivant** : des carrières toutes différentes, des recrues brutes ou prêtes à jouer, des éclosions tardives, des golfeurs qui plafonnent. Comme dans le vrai golf.

## Décisions d'équilibre à respecter (novembre 2026)

Les détails et les chiffres sont dans `docs/parametres.md`. **Le lire avant toute discussion d'équilibre**, et le tenir à jour après chaque changement.

- **Écarts de coupure entre ligues** : les écarts du milieu (L1 → L2 et L2 → L3, environ +2,5) sont parfaits ; **ne pas resserrer le milieu**. On cherche seulement à réduire L3 → L4 (≈ +3,8 en v420).
- **Environ 4 golfeurs Generational** en même temps sur le circuit.
- **Recrues** : profils brut / standard / prêt à jouer (25 / 50 / 25). Le vrai plafond ne change pas, seul le point de départ change.
- Ce qui n'a pas marché, et pourquoi, est noté dans `docs/parametres.md` : ne pas le retester sans raison nouvelle.

## Le code

- `src/` contient le jeu découpé en modules (`src/js/NN-*.js`, `src/styles/`). `public/` contient les données : noms et terrains.
- `npm run build` produit `dist/index.html` (la page de l'artifact) et `dist/IndoorGolfCareer.html` (le fichier autonome pour le PC du simulateur).
- `npm test` vérifie l'aller-retour et le démarrage dans Chromium.
- `tools/importer.mjs` réimporte une version produite ailleurs (voir le README).
- `tools/mesure/` est le banc d'essai : `mesurer.cjs`, `analyser.cjs`, `comparer.cjs`, `carrieres.cjs`, `elite.cjs`. Le mode d'emploi est en tête de `mesurer.cjs`. La mesure standard est de 3 mondes × 30 saisons, en lançant plusieurs essais en parallèle.
- Les réglages du jeu sont dans `DEFAULT_CFG` (`src/js/02-*.js`) et `ADV_DEF` (`src/js/41-reglages-avances.js`). Un nouveau réglage avancé demande sa traduction anglaise dans `src/js/01-langue-francais-ou-anglais.js`.
- **Sauvegardes existantes** : un changement d'équilibre ne doit pas casser une partie en cours. Utiliser un drapeau de migration dans `loadState` (exemples : `lkv`, `rpv`), et indiquer à Max ce qui s'applique tout de suite et ce qui ne vaut que pour les prochaines recrues.

## À chaque nouvelle version

1. Numéro de version suivant (dernière : **v420**), noté dans les commentaires du code modifié.
2. `npm run build`, puis `npm test`. Pour un changement d'équilibre, vérifier aussi dans le vrai jeu avec le banc d'essai.
3. Mettre à jour `docs/parametres.md` (et le README si besoin).
4. **Commit et push sur GitHub, toujours, à la fin de chaque changement.** Ne jamais laisser une version seulement dans l'artifact ou dans un fichier envoyé.
5. Envoyer à Max le fichier autonome `IndoorGolfCareer-vNNN.html`.
6. Republier l'artifact « Indoor Golf Career » (https://claude.ai/artifact/NijQgQmv7xLd7eQfKQ73vB) si Max le demande : publier `dist/index.html`. Republier aussi un fichier de données (`ootp-names.js`, `ootp-names-extra.js`, `terrains-data.js`) seulement s'il a changé.

## Terrains

Mise à jour depuis Simulator Golf Tour : suivre `docs/terrains.md`. L'environnement cloud « Gsprogolfcareersim » autorise `simulatorgolftour.com`.

## Si Max a modifié le jeu ailleurs

Si Max a modifié le jeu dans une conversation claude.ai ou dans l'artifact, lui demander le fichier, puis le réimporter avec `node tools/importer.mjs fichier.html --remplacer`. Regarder le `git diff`, puis faire un commit avant de continuer.
