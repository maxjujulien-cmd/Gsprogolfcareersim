# Indoor Golf Career

Simulateur de carrière de golf à jouer sur un simulateur intérieur (GSPro) : saisie des scores trou par trou,
ligues, classements mondiaux, rivalités, recrues, Temple de la renommée, Almanac, etc.

L'application existe sous deux formes, produites à partir du même code :

- **la page de l'artifact claude.ai** (`index.html`, 3,8 Mo) accompagnée de trois gros fichiers de données ;
- **le fichier autonome** (`IndoorGolfCareer.html`, 14 Mo), avec les données incluses : il s'ouvre d'un double-clic.

Dans ce dépôt, le code est découpé en modules lisibles ; un petit outil réassemble les deux versions.

## Organisation

```
src/
  index.html        gabarit de la page : en-tête, balises, et la liste ordonnée des modules à inclure
  styles/           feuilles de style (base, mise en page téléphone/ordinateur, style « Gestionnaire »)
  js/               le script principal, une section par fichier, dans l'ordre d'exécution (01 → 46)
  vendor/d3-geo.js  bibliothèques d3-array et d3-geo (globe du voyage)
  data/             contours géographiques Natural Earth (pays, provinces/États)
  assets/           images intégrées : icône, écran de démarrage, logo, photo d'en-tête
public/             données publiées à côté de la page, copiées telles quelles
  ootp-names.js         base de noms (prénoms et noms par culture)
  ootp-names-extra.js   ensembles culturels supplémentaires
  terrains-data.js      liste des 2 476 terrains incluse
tools/
  build.mjs         assemble src/ → dist/index.html (+ public/) et dist/IndoorGolfCareer.html
  importer.mjs      l'inverse : découpe une page complète (artifact ou autonome) en modules dans src/
tests/              aller-retour sans perte + démarrage réel dans Chromium
```

Les fichiers de `src/js/` sont **concaténés dans un seul `<script>`**, comme avant : l'ordre des numéros compte,
et toutes les fonctions et variables restent globales et partagées entre fichiers. Rien n'a été réécrit.
Les principaux repères :

| Fichiers | Contenu |
|---|---|
| `01` | traduction français → anglais |
| `02`–`07` | moteur de simulation : réglages `DEFAULT_CFG`, talents, cotes de jeu, radar, pression et élan |
| `08`–`10` | fiche d'identité, familles, mode commissaire |
| `11`–`17` | état, sauvegarde et logique de jeu ; partie duo ; résumés ; records ; noms |
| `18`–`45` | vues (écrans) : une fonction `vXxx()` par écran |
| `46` | événements et démarrage |

Dans les modules, une image intégrée s'écrit `{{asset:nom.webp}}` ; la construction la remplace par l'image
de `src/assets/` encodée en base64. Dans `src/index.html`, une ligne `<!-- @inclure chemin -->` est remplacée
par le contenu du fichier.

## Commandes

Il faut [Node.js](https://nodejs.org) 20 ou plus récent ; aucune dépendance à installer.

```sh
npm run build     # produit dist/index.html (+ ses données) et dist/IndoorGolfCareer.html (autonome)
npm test          # vérifie l'aller-retour, puis (si Playwright est installé) le démarrage dans Chromium
```

Pour jouer sur le PC du simulateur : ouvrir `dist/IndoorGolfCareer.html`.

## Publier sur l'artifact

Publier `dist/index.html` comme page, avec `ootp-names.js`, `ootp-names-extra.js` et `terrains-data.js`
comme fichiers à côté.

Point de départ vérifié : au moment de son import, le code redonnait `IndoorGolfCareer.html` est identique, octet pour octet, au fichier
`IndoorGolfCareer-v416.html` (20 novembre 2026) octet pour octet. La v417 (22 novembre 2026) a été faite ensuite dans le dépôt : voir `docs/parametres.md`.

L'artifact publié correspond encore à la v385 (10 novembre 2026). Pour la v385, `index.html` était identique à la page
de l'artifact, à une balise `</body></html>` en double près, retirée en fin de fichier.

## Réimporter une version modifiée ailleurs

Si une nouvelle version est produite en dehors du dépôt (par exemple dans le chat claude.ai) :

```sh
node tools/importer.mjs IndoorGolfCareer-v386.html --remplacer
git diff          # montre exactement ce qui a changé, module par module
```

L'outil accepte le fichier autonome (les données sont ressorties dans `public/`) comme la page de l'artifact,
même téléchargée depuis claude.ai avec son enveloppe de publication.
