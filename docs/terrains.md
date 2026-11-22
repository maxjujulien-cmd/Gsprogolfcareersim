# Mettre à jour la liste des terrains

La liste incluse dans le jeu est `public/terrains-data.js` (`window.CG_TERRAINS`). La source est le site Simulator Golf Tour : https://simulatorgolftour.com/courses/

## Où sont les données

- **La liste des terrains** est dans la page `https://simulatorgolftour.com/courses/`, dans la balise `<script id='courses-data' type='application/json'>`. Chaque terrain est un tableau : `[id, nom, lieu, par, difficulté, …, date d'ajout (AAAA-MM-JJ), concepteur, …, latitude, longitude]`. La date d'ajout change aussi quand un terrain reçoit une nouvelle version.
- **La carte de pointage** est une image : `https://simulatorgolftour.com/public/assets/courseImages/scorecards/scorecard_{ID}.jpg?v=1.1`. Elle donne le par et l'index de chaque trou, puis, pour chaque tee, la distance de chaque trou, le total et « rating / slope ». Certaines cartes sont en mètres (« METRIC »).
- La fiche détaillée (`/sgt-api/courses/courseDetails/{ID}`) ne donne que le par total et les records. Elle n'est pas utile ici.
- Le réseau de l'environnement doit autoriser `simulatorgolftour.com`. C'est le cas de l'environnement cloud « Gsprogolfcareersim ».

## Méthode

1. Lire la liste SGT et garder les terrains ajoutés depuis la date `exported` de `public/terrains-data.js`.
2. Écarter ceux qui sont déjà dans notre liste. Comparer les noms sans accents, sans ponctuation et sans casse, et vérifier à l'œil les noms proches.
3. Télécharger la carte de chaque terrain restant et la transcrire. Vérifier automatiquement que la somme des pars donne le total de la carte, que l'index contient 1 à 18 une seule fois, et que la somme des distances de chaque tee donne son total.
4. Règles de la liste :
   - **Pas de parcours par 3** (par 54) : le plus petit par de la liste est 60.
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
7. Lancer `npm run build`, puis `npm test`.

## Historique

| Date | Terrains | Ajoutés | Notes |
|---|---|---|---|
| 2026-11-09 | 2 476 | | Liste reçue avec la v416 |
| 2026-11-22 | 2 494 | 18 | Terrains ajoutés sur SGT du 9 au 20 novembre. Écartés : Ballyowen (« Featured Holes », 4 trous), Madge Lake (pas encore de carte sur SGT), La Cala Par 3's et Eagle Dunes Par 3 (par 54). Index estimé : Metropolis Country Club. Tees écartés : Junior de Newport News (0,0/0), Junior de We Ko Pa Saguro (80/120, 954 verges), Yellow (0,0/0) et Junior (1 113 verges) de Baltus Roll North. Pléneuf-Val-André converti de mètres en verges. |
