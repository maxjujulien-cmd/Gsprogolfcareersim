# Mettre à jour la liste des terrains

La liste incluse dans le jeu est `public/terrains-data.js` (`window.CG_TERRAINS`). La source est le site Simulator Golf Tour : https://simulatorgolftour.com/courses/

## Où sont les données

- **La liste des terrains** est dans la page `https://simulatorgolftour.com/courses/`, dans la balise `<script id='courses-data' type='application/json'>`, sous la clé `courses` (depuis novembre 2026). Chaque terrain est un tableau : `[id, nom, lieu, par, difficulté, …, date d'ajout (AAAA-MM-JJ), concepteur, …, latitude, longitude]`. La date d'ajout change aussi quand un terrain reçoit une nouvelle version.
- **La carte de pointage** est une image : `https://simulatorgolftour.com/public/assets/courseImages/scorecards/scorecard_{ID}.jpg?v=1.1`. Elle donne le par et l'index de chaque trou, puis, pour chaque tee, la distance de chaque trou, le total et « rating / slope ». Certaines cartes sont en mètres (« METRIC »).
- La fiche détaillée (`/sgt-api/courses/courseDetails/{ID}`) ne donne que le par total et les records. Elle n'est pas utile ici.
- Le réseau de l'environnement doit autoriser `simulatorgolftour.com`. C'est le cas de l'environnement cloud « Gsprogolfcareersim ».

## Méthode

1. Lire la liste SGT et garder les terrains ajoutés depuis la date `exported` de `public/terrains-data.js`.
2. Écarter ceux qui sont déjà dans notre liste. Comparer les noms sans accents, sans ponctuation et sans casse, et vérifier à l'œil les noms proches.
3. Télécharger la carte de chaque terrain restant et la transcrire. Vérifier automatiquement que la somme des pars donne le total de la carte, que l'index contient 1 à 18 une seule fois, et que la somme des distances de chaque tee donne son total.
4. Règles de la liste :
   - **Pas de parcours par 3** (par 54) : le plus petit par de la liste est 60.
   - **Pas de parcours de 9 trous** : la liste n'a que des parcours de 18 trous (un 9 trous joué deux fois sur SGT, avec 18 trous sur la carte, est accepté).
   - **Pas de parcours incomplets** (« Featured Holes » ou trous sans par).
   - **Tee « PAR3 » écarté.** Un tee auquel il manque des trous (« --- ») est aussi écarté.
   - **Tee écarté si son rating est invalide** (0,0/0) ou incohérent (par exemple 80/120 pour moins de 1 000 verges).
   - **Tee Junior gardé** s'il est complet, avec son rating tel qu'imprimé (souvent 72/120).
   - **Distances en verges** : convertir les cartes en mètres (× 1,0936).
   - **Nom coupé à 40 caractères**, comme le fait le jeu.
   - **Sans index sur la carte** : estimer l'index (trous classés par longueur selon leur par, impairs à l'aller, pairs au retour) et le signaler.
5. Format d'une entrée, une par ligne, triée par nom :
   `{"name","pars","index","tees":[{"tee","yardage","cr","slope"}],"geo":{"la","lo","cc","pl","tz"},"since":"AAAA-MM-JJ"}`
   `geo` vient des coordonnées et du lieu de SGT, avec le code de pays et le fuseau horaire. `since` est la date de la mise à jour.
6. Changer `exported` et le nombre de terrains dans l'en-tête. Le jeu ajoute alors, sur les appareils qui ont déjà la liste, seulement les terrains dont `since` est plus récent que la dernière liste vue (`preloadCourses()`, `src/js/30-le-voyage-position-des-terrains.js`).
7. **Vérifier les positions de toute la liste** (méthode de la v457, demande de Max : à faire à chaque mise à jour) : `node tools/verifier-positions.cjs page-sgt.html ecarts.json`, puis corriger chaque écart d'après SGT (pays et fuseau horaire compris), en regardant à la main les terrains qui tombent au centre d'une grande ville et ceux qui partagent un nom (voir « Vérifier les positions » plus bas). Les corrections à la main déjà faites sont dans `EXCEPTIONS`, en tête de l'outil.
8. Lancer `npm run build`, puis `npm test`.

## Vérifier les positions

`node tools/verifier-positions.cjs page-sgt.html ecarts.json` compare chaque position avec les coordonnées de SGT (page `courses` téléchargée) et liste les écarts de plus de 25 km. SGT a presque toujours raison : les anciennes positions avaient été devinées en cherchant le nom du terrain sur OpenStreetMap (Penrith GC, un terrain australien, placé à Penrith en Angleterre). Deux pièges : un même nom pour deux terrains (les départager par le par total), et SGT qui place parfois un terrain au centre d'une grande ville (vérifier à la main ces cas-là).

## Historique

| Date | Terrains | Ajoutés | Notes |
|---|---|---|---|
| 2026-11-09 | 2 476 | | Liste reçue avec la v416 |
| 2026-11-22 | 2 494 | 18 | Terrains ajoutés sur SGT du 9 au 20 novembre. Écartés : Ballyowen (« Featured Holes », 4 trous), Madge Lake (pas encore de carte sur SGT), La Cala Par 3's et Eagle Dunes Par 3 (par 54). Index estimé : Metropolis Country Club. Tees écartés : Junior de Newport News (0,0/0), Junior de We Ko Pa Saguro (80/120, 954 verges), Yellow (0,0/0) et Junior (1 113 verges) de Baltus Roll North. Pléneuf-Val-André converti de mètres en verges. |
| 2026-11-27 | 2 516 | 22 | Terrains ajoutés sur SGT du 22 au 25 novembre. Écartés : Sandy Lake (9 trous seulement) et RTJ Hampton Cove - Short Course (par 54) ; 9 autres étaient déjà dans la liste (mises à jour de version sur SGT). Carrollwood - Cypress - Meadows converti de mètres en verges. Kenai Fjords HD est fictif : pas de position. Le format de la page SGT a changé : la liste est maintenant dans `courses` d'un objet (`{v, updated, cardUrl, splashUrl, courses}`). |
| 2026-11-27 (v444) | 2 516 | 0 | Positions ajoutées à 179 terrains qui n'en avaient pas : 174 d'après les coordonnées que SGT donne maintenant (pays et fuseau repris du terrain localisé le plus proche, corrigés à la main pour 6 terrains), 5 placés d'après la ville indiquée par SGT. Restent 49 terrains sans position, presque tous fictifs. |
| 2026-11-27 (v445) | 2 516 | 0 | Les 49 derniers placés selon la liste remplie par Max (lieux réels choisis pour les terrains fictifs ; `src: "max"`). Tous les terrains ont maintenant une position. |
| 2026-11-28 | 2 516 | 0 | v456 : position de Quail Valley Golf Club corrigée (Vero Beach, Floride, et non Missouri City, Texas ; vérifiée sur SGT). Depuis la v456, une position venue de la liste suit toujours la liste, même sur un appareil qui l'avait déjà en mémoire ; une position placée à la main par le joueur est gardée. |
| 2026-11-28 | 2 516 | 0 | v457 : vérification complète des positions avec SGT. 894 terrains déplacés (dont 162 changent de pays), d'après les coordonnées SGT, avec pays et fuseau horaire refaits ; à la main : London GC (Ash, Kent, et non le centre de Londres), The National Old Course (Cape Schanck), Trump Charlotte (Mooresville), White Eagle (Hudson, Wisconsin), St Georges G&CC (Setauket, NY ; l'autre St Georges est bien à Toronto). 151 terrains n'ont pas pu être vérifiés (absents de SGT sous ce nom ou sans coordonnées sur SGT). Dans le jeu, une position trouvée automatiquement (OpenStreetMap) suit maintenant aussi la liste ; seule une position placée à la main est gardée. |
| 2026-11-28 (v458) | 2 518 | 2 | Terrains ajoutés sur SGT le 27 novembre : Farmlinks Golf Club HD (nouvelle version haute définition, l'ancienne reste) et Mountain Valley GC - Mountain HD. Écarté : Madge Lake (toujours pas de carte sur SGT). Positions de toute la liste revérifiées : aucun nouvel écart. |
