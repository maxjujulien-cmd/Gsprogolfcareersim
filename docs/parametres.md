# Paramètres du simulateur : talent, potentiel, scores, vent

Ce document résume les paramètres qui décident du niveau des golfeurs et de leurs scores : ce qu'ils font, où ils se trouvent et pourquoi ils ont ces valeurs. Il sert de mémoire entre les sessions, parce que les conversations précédentes ne suivent pas d'une session à l'autre.

> **Source** : version **v418** du jeu (22 novembre 2026). La v417 et la v418 ont été faites dans le dépôt à partir de la v416 (fichier `IndoorGolfCareer-v416.html` fourni par Max le 20 novembre 2026). v417 : réglage « Écart en bas de l'échelle » (section 2). v418 : seuil de carte des recrues recalibré et profils de départ des recrues (section 6). L'artifact publié « Indoor Golf Career » (https://claude.ai/artifact/NijQgQmv7xLd7eQfKQ73vB) est encore en v385. À chaque nouvelle version produite ailleurs, il faut la réimporter (voir le README) et vérifier ce fichier. Quand on change un paramètre, il faut aussi mettre à jour ce fichier.

Échelle utilisée partout : **coups par rapport au par**, sur une ronde de 18 trous.

---

## 1. Le niveau caché (overall, de 0 à 1000)

Chaque golfeur a un niveau `g.o` de 0 à 1000. Le joueur ne le voit jamais directement : il voit des titres.

### Titres de niveau (`TIERS`)

`src/js/07-pression-en-direct-elan-et.js`, vers la ligne 587.

| Niveau | Titre |
|---|---|
| 0 | Weak |
| 150 | Amateur |
| 300 | Average |
| 450 | Semi-Pro |
| 600 | Pro |
| 700 | Established Pro |
| 800 | Elite |
| 900 | Hall Of Famer |
| 950 | Generational |

### Titres de potentiel (`POTS`)

Même fichier, ligne suivante. Le potentiel est exprimé par la ligue et le rôle visés.

| Potentiel | Titre |
|---|---|
| 0 | L4 - Bottom |
| 100 | L4 - Everyday Player |
| 200 | L4 - Leader |
| 300 | L3 - Everyday Player |
| 400 | L3 - Established |
| 500 | L2 - Everyday Player |
| 600 | L2 - Leader |
| 700 | L1 - Everyday Player |
| 800 | L1 - Established |
| 900 | L1 - Leader |
| 950 | Generational |

### Répartition cible des golfeurs (`OVERALL_DIST`)

`src/js/07-pression-en-direct-elan-et.js`, vers la ligne 1327. Ces pourcentages ont été fournis par Max. C'est un repère et non un quota : chaque golfeur est tiré sur une courbe lissée entre les milieux des tranches. **Les seuils de ligue découlent du talent réel du circuit**, ils ne sont pas fixés à l'avance.

| Tranche | % des golfeurs |
|---|---|
| 0-100 | 3 |
| 100-200 | 8 |
| 200-300 | 11 |
| 300-400 | 13 |
| 400-500 | 14 |
| 500-600 | 14 |
| 600-700 | 13 |
| 700-800 | 13 |
| 800-900 | 9 |
| 900-950 | 1,9 |
| 950-1000 | 0,1 |

### Structure des ligues

`src/js/07-pression-en-direct-elan-et.js`, vers la ligne 1321.

- 4 ligues : L1 Tour, L2 Pro, L3 Semi-Pro, L4 Amateur. Environ 600 golfeurs en tout.
- `FIELD = 150` golfeurs par tournoi, `N_TOURN = 10` tournois par saison.
- **Tournoi de 2 rondes. La coupure se fait après la ronde 1 (18 trous)** : on garde les `DEFAULT_CUT = 65` premiers, égalités comprises (`cutScoreOf`, `src/js/08-fiche-d-identite-et-personnalite.js`, ligne 263).
- Ligues variables (réglage `varLg`, activé par défaut) : la L1 à la L3 comptent entre 130 et 170 golfeurs selon le niveau du circuit. La L4 n'a pas de limite. Voir `src/js/09-familles.js`.

---

## 2. Du niveau au score : la formule centrale

`src/js/03-moteur-de-simulation.js`, lignes 108-114.

```js
const MU = { A: 0.2, B: 21.0, GAM: 1.25, K: 450 };
mu0(o) = A + B × (1 − o/1000)^GAM                 // coups au-dessus du par attendus sur 18 trous
mu(o)  = mu0(o)                                   // à partir de K (450, Semi-Pro)
mu(o)  = mu0(K) + (mu0(o) − mu0(K)) × lowK        // sous K (v417)
```

- **A = 0,2** : le score d'un golfeur parfait (1000).
- **B = 21** : l'écart entre le meilleur et le pire. Il valait 23 jusqu'à la v153 et a été resserré de 10 % en v154. Dans l'app, le réglage « Écart entre les meilleurs et les plus faibles » (`gap`, de 0,7 à 1,3) multiplie B (`MU.B = 21 × gap`, `src/js/41-reglages-avances.js`).
- **GAM = 1,25** : la courbure. Au-dessus de 1, chaque point de talent vaut **plus de coups en bas de l'échelle qu'en haut**.
- **lowK = 0,70** (v417) : sous 450, l'écart par rapport à un golfeur de niveau 450 est multiplié par 0,70. Dans l'app, c'est le réglage avancé « Écart en bas de l'échelle » (de 50 % à 100 %, section Moteur des rondes). Avec 100 %, la courbe est celle d'avant la v417. **Les parties commencées avant la v417 restent à 100 %** ; les nouvelles parties partent à 70 %. Choisi par simulation : voir la section 9.

### Valeurs calculées

Entre parenthèses : avec `lowK` = 100 %, comme avant la v417.

| Niveau | `mu` (coups/ronde) | Écart-type de la ronde | Effet du vent et de la distance |
|---|---|---|---|
| 0 | +17,9 (+21,2) | 2,45 | ×1,15 (×1,21) |
| 100 | +16,1 (+18,6) | 2,33 | ×1,12 (×1,16) |
| 200 | +14,3 (+16,1) | 2,22 | ×1,09 (×1,12) |
| 300 | +12,6 (+13,6) | 2,10 | ×1,06 (×1,08) |
| 400 | +10,9 (+11,3) | 1,99 | ×1,03 (×1,04) |
| 500 | +9,0 | 1,88 | ×1,00 |
| 600 | +6,9 | 1,76 | ×0,96 |
| 700 | +4,9 | 1,65 | ×0,93 |
| 800 | +3,0 | 1,53 | ×0,90 |
| 900 | +1,4 | 1,42 | ×0,87 |
| 1000 | +0,2 | 1,30 | ×0,85 |

L'écart-type est calculé pour une régularité moyenne (`v = 1`) avec le hasard réglé à 100 %.

Sur 100 points de talent, l'écart est d'environ **1,8 coup par ronde en bas** (100-300) avec `lowK` = 70 %, contre 2,5 avant la v417, et **1,7 à 1,9 en haut** (700-900).

L'écart-type de la ronde ne dépend pas de `lowK` : il reste plus grand chez les faibles.

### Tout ce qui s'ajoute au score d'une ronde (`roundTarget`)

`src/js/07-pression-en-direct-elan-et.js`, ligne 374. La cible d'une ronde est la somme de ces éléments :

1. `mu(niveau effectif)`, où le niveau effectif vaut `o` + forme `f` + séquence en cours `sm` (`effOverall`).
2. Le terrain (`courseAdjust`) : décalage dû au course rating, et slope qui **étire l'écart** entre les golfeurs (plus le slope est élevé, plus les faibles sont punis).
3. La distance du tee × l'effet des conditions (`condFactor`).
4. Le vent × l'effet des conditions (voir section 3).
5. L'aléa du terrain et la météo de la ronde (`newCtx`, `src/js/08-fiche-d-identite-et-personnalite.js`, ligne 368) : terrain ±0,32, météo ±0,56 par ronde, partagés par tout le champ.
6. Le jour du golfeur (`dayFactor`, `src/js/03-moteur-de-simulation.js`, ligne 111) :
   - bruit normal d'écart-type `(1,3 + 1,15 × (1 − x)) × régularité × hasard` : **les faibles sont plus irréguliers** ;
   - ronde de feu (`hotP = 4 %`) : −2,4 coups et plus ;
   - ronde catastrophe (`coldP = 5 %`) : +2,9 coups et plus.
7. Les talents cachés (`talRT`), les cotes de jeu (`skRT`) et le tempérament sous pression (`clutchAdj`).
8. Le niveau du circuit (`lvlFor`) : décalage réglable qui s'applique aux adversaires seulement, pas à ton golfeur.
9. Le nivellement de l'élite (`eliteHandicap`) : **désactivé par défaut** depuis la v190 (`eliteHc = 0`). Une simulation montrait que, sans lui, le top 5 gagne 20 % des tournois au lieu de 9 %.

Le score cible est ensuite converti trou par trou à l'aide des tables de probabilités (`DEFAULT_TABLES`, ligne 35), qui donnent la répartition birdie, bogey, double, etc. selon le par du trou.

---

## 3. Le vent

`src/js/08-fiche-d-identite-et-personnalite.js`, lignes 425-445.

| Vent | Probabilité (`windW`) | Coups ajoutés à un golfeur moyen |
|---|---|---|
| Aucun | 10 % | 0 |
| Calme | 39 % | 0 |
| Léger (`breezy`) | 32 % | 1,5 ± 0,45 (entre 0,4 et 3) |
| Fort (`gusty`) | 19 % | 3,5 ± 0,55 (entre 2 et 5,5) |

- Le vent est tiré séparément pour chaque ronde (`wind` et `wind2`).
- `CFG.windMul` multiplie tout l'effet du vent.
- **`condFactor`** (`src/js/07-pression-en-direct-elan-et.js`, ligne 373) adapte l'effet au niveau : ×0,85 pour l'élite, ×1 pour un golfeur de niveau 500, jusqu'à ×1,21 pour les plus faibles. Il réutilise `MU.GAM`.
- Le talent caché « Joueur de vent » réduit cet effet de 10 % par niveau (−10, −20 ou −30 %). Le défaut « Déteste le vent » l'augmente d'autant (`src/js/06-profil-statistique-en-radar.js`, ligne 55).

---

## 4. Potentiel affiché et plafond réel

`src/js/07-pression-en-direct-elan-et.js`, lignes 438-460 (`DEV`, `initDev`).

- **`g.p`** est le potentiel affiché, c'est-à-dire l'estimation des dépisteurs.
- **`g.pt`** est le vrai plafond. Il est caché et peut être différent de l'estimation.

À la création, pour un golfeur de moins de 27 ans, on part de l'écart `gap = p − o` et on tire un rendement R :

| Cas | Probabilité | Rendement R (part de l'écart atteinte) |
|---|---|---|
| Espoir qui ne perce pas | 40 % (`bustP`) | 0,08 à 0,40 |
| Dépasse les attentes | 7 % (`boomP`) | 1,12 à 1,52 |
| Normal | le reste | 0,95 ± 0,1 (`baseR`) |

Le vrai plafond vaut `pt = o + gap × R`, borné entre 50 et 1000. S'y ajoutent :

- **éclosion tardive** (10 %, `lateP`) : +20 % de l'écart, avec 2 à 4 ans de retard ;
- **surprise** (16 %, `surpriseP`) : de +150 à +600.

Autres traits :

- `dv` : rythme de développement personnel, de 0,3 à 2,8 (log-normal, écart-type 0,75).
- Phases de poussée (×1,8) ou de plateau (×0,2) : 17 % de chances par saison avant 27 ans.
- **Déclic** (v337, `clickP = 1/175`) : chez un jeune de 24 ans ou moins dont le plafond est sous 700, le vrai plafond monte en secret entre 830 et 980. Les dépisteurs le remarquent avec 20 % de chances par intersaison, en 3 essais au maximum.
- À chaque intersaison, l'estimation se rapproche du vrai plafond de 20 % (`revise`), plus un bruit de ±8.

---

## 5. Évolution de fin de saison (`ageSeason`)

`src/js/07-pression-en-direct-elan-et.js`, ligne 462.

**Avant le sommet** (`pk`, 29 ans par défaut), le golfeur rattrape son plafond réel à ce rythme :

| Âge | Part de l'écart rattrapée par saison |
|---|---|
| moins de 23 ans | 33 % |
| 23 à 26 ans | 24 % |
| 27 ans et plus | 11,5 % |

Ce rythme est multiplié par `dv`, la phase en cours et `CFG.youth`, avec un maximum de 92 %.

**Après le sommet**, le déclin vaut `−min(38, 2 + 1,7 × années depuis le sommet) × dr × CFG.decline` par saison.

**Bruit** : ±24 avant 26 ans, ±18 ensuite.

**Événements** :

| Événement | Probabilité | Effet |
|---|---|---|
| Percée (`up`) | 14 % avant 23 ans, puis 9 %, 4,5 %, 3 %, 1,2 % selon l'âge | +45 à +115 ; le plafond et le potentiel montent aussi |
| Bonus « personne ne l'attendait » | +4,5 % si moins de 27 ans et plafond sous 450 | percée plus probable |
| Chute (`down`) | 2,5 % à 8,5 % selon l'âge | −45 à −115 |
| Éclosion de vétéran | 27 ans et plus : 2 %, puis 1,2 %, puis 0,6 % | +70 à +160 ; le sommet est repoussé de 3 ans |
| Yips | 25 à 30 ans : 2 % | −70 à −160, sur le niveau et le plafond |

Seulement 85 % de la variation s'applique à l'intersaison (`INS.off`). Le reste s'est joué en secret pendant la saison.

La régularité `g.v` dérive d'une saison à l'autre et revient vers la nature du golfeur `g.v0` (`REG`) :

| Catégorie | Part des golfeurs |
|---|---|
| Très régulier | 15 % |
| Régulier | 20 % |
| Moyen | 30 % |
| Irrégulier | 20 % |
| Montagnes russes | 15 % |

---

## 6. Recrues

`src/js/08-fiche-d-identite-et-personnalite.js`, ligne 508 (`ROOK`), et `src/js/09-familles.js`, ligne 71 (`newRookie`).

- Toutes les recrues arrivent en **Ligue 4**, entre 17 et 25 ans.
- **Vrai plafond** : `pt = 450 + (tirage sur OVERALL_DIST − 450) × ptS × époque`, avec `ptS = 1,15` par défaut. Le réglage « Talent des recrues » va de 0,9 à 1,4.
- **Niveau de départ** : une fraction du plafond, selon le **profil de départ** (v418, `RPROF` et `rpDraw()` dans `src/js/09-familles.js`, profil gardé dans `g.rp`) :
  - **Brut** (25 %, `g.rp = 0`) : 30 à 50 % du plafond. Une fois sur deux, il reçoit aussi une éclosion tardive (2 à 4 ans de retard).
  - **Standard** (50 %, `g.rp = 1`) : `0,35 + (1 − t) × 0,35 ± 0,08`, où `t` vaut 1 à 17 ans et 0 à 25 ans. Plus la recrue est jeune, plus elle part loin de son plafond.
  - **Prêt à jouer** (25 %, `g.rp = 2`) : 75 à 92 % du plafond. Elle peut commencer en L3, en L2, parfois en L1, mais a peu de marge.
  - La part des recrues prêtes se règle dans les réglages avancés (« Recrues prêtes à jouer », `rcReady`, de 0 à 50 %). La part des brutes reste à 25 %. Le profil apparaît sur la fiche des dépisteurs (« Talent brut », « Prêt à jouer »). Le phénomène et les recrues déjà prêtes n'ont pas de profil.
- **Carte** : après la saison de la classe de recrues, une recrue dont l'index dépasse la moyenne de la L4 + `rcNoCard` n'obtient pas de carte (environ 13 % des recrues). `rcNoCard` vaut **3,5** depuis la v418, au lieu de 5, pour aller avec la courbe adoucie de la v417.
- **Estimation des dépisteurs** : `pt ± 80` (`scout`). Au-dessus de 700, l'estimation est compressée (×0,75 avec le réglage « Prudents ») pour éviter trop de recrues cotées Generational.
- **Familles** : un fils ou un frère hérite d'une part du sommet de son parent (`FAM.inh`).
- **Recrue déjà prête** (`rcProd = 0,5 %`) : elle arrive avec un niveau entre 640 et 840.
- **Phénomène** (« un Tiger », `PHEN`, `src/js/03-moteur-de-simulation.js`, ligne 148) : 0,13 % des recrues, environ une fois aux 25 saisons et jamais deux à la fois. Son plafond va de 935 à 990. Il reste caché jusqu'à 3 victoires en L1 dans la même saison, ou 5 en carrière.
- **Retraite forcée en L4** : à 24 ans ou plus, après 4 saisons complètes de suite en L4 sans monter (`FORCED_L4`).

---

## 7. Talents cachés et cotes de jeu

**Talents cachés** (`src/js/04-talents-caches.js`) :

- 30 % des golfeurs ont une force et 12 % un défaut.
- Types : par 3, par 4, par 5, vent, longs terrains, précision, sauveur, partant rapide, finisseur.
- Niveaux bronze, argent et or : −0,15, −0,30 et −0,45 coup par ronde dans les bonnes conditions. Répartition : 65 %, 28 % et 7 %.
- Un talent se révèle après 3, 2 ou 1 saison selon son niveau.

**Cotes de jeu** (`src/js/05-cotes-de-jeu-fairways-fers.js`) :

- Trois cotes de 1 à 5 : Fairways, Fers, Putting. Leurs poids (`SK_W`) sont 0,7, 1,0 et 0,8 coup.
- Répartition (`SK_DIST`) : 5 %, 20 %, 50 %, 20 % et 5 % pour les cotes 1 à 5.
- L'effet est recentré sur la moyenne du circuit, donc le niveau global ne bouge pas.

---

## 8. Où changer les choses

| Je veux… | Paramètre | Où |
|---|---|---|
| Resserrer ou élargir tout le champ | `gap` (multiplie `MU.B`) | App : Plus › Réglages avancés › Moteur des rondes. Code : `src/js/41-reglages-avances.js` |
| Resserrer seulement le bas de l'échelle (sous 450) | `lowK` | App : Plus › Réglages avancés › Moteur des rondes, « Écart en bas de l'échelle ». Code : `MU.K` et `mu()` dans `src/js/03-moteur-de-simulation.js` |
| Changer la forme de toute la courbe talent → coups | `MU.GAM` | `src/js/03-moteur-de-simulation.js`, ligne 109 (agit aussi sur `condFactor`) |
| Rendre les rondes plus ou moins prévisibles | `rand` | Réglages avancés |
| Changer la variance des faibles | `1,3 + 1,15 × (1 − x)` dans `dayFactor` | `src/js/03-moteur-de-simulation.js`, ligne 113 |
| Changer la force du vent | `windMul`, `windW`, `windBump0` | `src/js/08-fiche-d-identite-et-personnalite.js`, ligne 427 |
| Changer l'abondance de talent chez les recrues | `ptS` | Réglages avancés › Talent et recrues |
| Avoir plus ou moins de recrues prêtes à jouer | `rcReady` | Réglages avancés › Carrières, « Recrues prêtes à jouer » |
| Changer la part des recrues sans carte | `rcNoCard` | Réglages avancés › Carrières (à recalibrer si on change `lowK`) |
| Changer le nombre de golfeurs qui passent la coupure | `DEFAULT_CUT` / `S.settings.cut` | `src/js/07-pression-en-direct-elan-et.js`, ligne 1323 |

Les valeurs par défaut des réglages sont dans `DEFAULT_CFG` (`src/js/02-carriere-de-golf-moteur-de.js`, ligne 23) et `ADV_DEF` (`src/js/41-reglages-avances.js`, ligne 4).

---

## 9. Discussions en cours

### Écart des coupures entre les ligues (novembre 2026) — réglé en v417

**Décision (22 novembre 2026)** : courbe adoucie sous 450 avec `lowK` = 0,70, ajoutée au jeu comme réglage avancé. Vérification dans le jeu v417 (3 mondes de 30 saisons) :

| Version | Coupures L1 / L2 / L3 / L4 | Écart L3 → L4 (par monde) | Top 5 gagne (L1 / L4) | Promus en L3 : coupures / restés |
|---|---|---|---|---|
| v416 | +3,1 / +5,8 / +8,2 / +13,6 | +5,5 (5,5 / 5,5 / 5,4) | 17 % / 41 % | 40 % / 79 % |
| v417, réglage à 100 % | +3,2 / +5,6 / +7,9 / +13,2 | +5,3 (5,0 / 5,4 / 5,5) | 17 % / 39 % | 40 % / 78 % |
| **v417, 70 % (défaut)** | +3,2 / +5,8 / +8,0 / **+11,5** | **+3,5** (3,4 / 3,5 / 3,5) | 19 % / 37 % | 42 % / 81 % |

Le réglage à 100 % redonne la v416 (à la marge de hasard près), et 70 % donne le même résultat que le banc d'essai. Le reste de cette section garde l'historique de l'analyse.

**⚠️ Effet secondaire découvert après la v417 (22 novembre 2026)** : avec `lowK` = 0,70, **la L4 passe d'environ 150 à environ 193 golfeurs**, et le circuit de 590 à 630.

- **Cause** : les recrues faibles améliorent leur index plus que la moyenne de la L4. Avec le seuil « Pas de carte au-delà de la moyenne L4 + 5 » (`rcNoCard`), seulement environ 5 % des recrues restent sans carte, au lieu d'environ 13 %. Il y a 55 recrues placées par saison au lieu de 46.
- **Conséquence** : la coupure reste fixée à 65 golfeurs. Dans une L4 de 193 golfeurs, seulement 34 % passent, au lieu de 44 %. **Une bonne partie de la baisse de la coupure L4 venait de cette L4 plus grosse**, pas de la courbe.
- Le golfeur à la coupure de la L4 reste vers 360-370 de niveau dans tous les cas : c'est le 65e meilleur de la L4.

Recalibrage du seuil de carte, avec `lowK` = 0,70 (v417, 3 mondes × 30 saisons) :

| Essai | Taille de la L4 | Coupures L1 / L2 / L3 / L4 | Écart L3 → L4 | Recrues placées par saison |
|---|---|---|---|---|
| `lowK` 100 %, seuil +5 (comme la v416) | 146 | +3,4 / +5,9 / +8,4 / +13,9 | +5,4 | 46 |
| `lowK` 70 %, seuil +5 (v417 actuelle) | 191 | +3,3 / +5,6 / +7,8 / +11,5 | +3,7 | 55 |
| `lowK` 70 %, seuil +4 | 170 | +3,2 / +5,6 / +7,8 / +11,9 | +4,1 | 50 |
| **`lowK` 70 %, seuil +3,5** | **153** | +3,3 / +5,8 / +8,2 / +12,6 | **+4,4** | 47 |
| `lowK` 70 %, seuil +3 | 137 | +3,3 / +6,0 / +8,5 / +13,7 | +5,1 | 44 |

**À la même taille de L4, l'effet réel de `lowK` = 0,70 est d'environ 1 coup** (+5,4 → +4,4), pas 2. La taille de la L4 pèse aussi lourd que la courbe sur la coupure. **Fait en v418** : seuil à +3,5 par défaut. Les parties créées en v417 passent aussi à +3,5 au chargement ; les parties plus anciennes (courbe à 100 %) gardent +5. Mesuré dans le jeu v418 : L4 de 150 golfeurs, coupures +3,2 / +5,7 / +8,2 / +12,9, écart L3 → L4 **+4,7**. À revoir : `lowK` plus bas ou coude plus haut, si on veut se rapprocher des autres paliers (environ +2,5).

**Recrues plus prêtes** (`ROOK.f0` augmenté, v417 avec seuil +5, donc L4 ≈ 190) :

| Essai | Classe de recrues : score moyen R1 / niveau médian | Placées par saison L1 / L2 / L3 / L4 | Médiane L3 | Coupures L1 / L2 / L3 / L4 |
|---|---|---|---|---|
| Actuel | +16,0 / 234 | 0,1 / 0,5 / 1,4 / 53 | 570 | +3,3 / +5,6 / +7,8 / +11,5 |
| +0,05 | +15,5 / 257 | 0,0 / 0,6 / 2,5 / 52 | 574 | +3,1 / +5,5 / +7,6 / +11,3 |
| +0,10 | +15,0 / 285 | 0,1 / 0,9 / 3,3 / 52 | 583 | +3,0 / +5,2 / +7,4 / +11,2 |
| +0,15 | +14,4 / 315 | 0,3 / 1,3 / 4,2 / 50 | 587 | +3,0 / +5,1 / +7,2 / +11,2 |

Des recrues plus prêtes rapprochent la classe de recrues de la L4 et placent plus de recrues directement en L3 et en L2. Mais elles remontent tout le circuit, et l'écart L3 → L4 ne bouge pas (+3,7 à +4,0).

### Profils de départ des recrues (22 novembre 2026, essai)

**Souhait de Max** : des recrues un peu plus « game ready », sans rendre le monde plus fort, et surtout **un monde varié où les golfeurs n'ont pas tous le même chemin**. Par exemple : certains commencent en L2 et y restent toute leur carrière, d'autres traînent en L4 puis font un gros bond jusqu'en L1, comme dans le vrai golf.

**Idée** : le vrai plafond ne change pas. Seul le point de départ est tiré selon un profil :

| Profil | Part | Départ (part du plafond) |
|---|---|---|
| Brut | 25 % | 30-50 %, avec une chance d'éclosion tardive (2 à 4 ans de retard) |
| Standard | 50 % | comme avant |
| Prêt | 25 % | 75-92 % : prêt à jouer, mais avec peu de marge |

**Mesure** (3 mondes × 30 saisons, v417 avec seuil de carte +3,5). Outil : `tools/mesure/carrieres.cjs`.

| Mesure | v416 | v417 corrigée | Profils (standard +0,05) | **Profils, standard inchangé, bruts tardifs 50 %** | Profils, bruts tardifs 80 % |
|---|---|---|---|---|---|
| Recrues placées par saison L1 / L2 / L3 / L4 | 0,1 / 0,5 / 1,8 / 44 | 0,0 / 0,4 / 2,1 / 43 | 0,3 / 1,7 / 3,9 / 41 | **0,3 / 1,9 / 4,3 / 42** | 0,4 / 2,1 / 4,1 / 41 |
| Recrues (8 saisons et plus) qui atteignent la L2 / la L1 | 81 % / 49 % | 81 % / 49 % | 78 % / 46 % | 77 % / 48 % | 78 % / 48 % |
| Placées en L2 ou L3 qui ne montent jamais (nombre) | 157 | 164 | 368 | **411** | 420 |
| Éclosions tardives (L4 à 25 ans ou plus → L1) par saison | 0,38 | 0,39 | 0,21 | **0,38** | 0,45 |
| Bonds de plus de 150 points en 2 saisons, par saison | 17,7 | 16,7 | 13,1 | 14,3 | 14,4 |
| Âge au sommet 10e / 50e / 90e | 24 / 29 / 34 | 24 / 29 / 34 | 24 / 28 / 34 | 24 / 28 / 33 | 24 / 28 / 34 |
| Chemins de carrière différents | 209 | 209 | 217 | **237** | 227 |
| Classe de recrues : score moyen R1 | +17,6 | +16,0 | +15,0 | +15,1 | +15,3 |
| Coupures L1 / L2 / L3 / L4 | +3,1 / +5,8 / +8,2 / +13,5 | +3,3 / +5,9 / +8,3 / +13,0 | +3,0 / +5,3 / +7,8 / +12,8 | +3,1 / +5,6 / +8,2 / +12,8 | +3,3 / +5,9 / +8,4 / +13,1 |
| Médiane de niveau L1 / L2 / L3 | 836 / 676 / 544 | 828 / 676 / 535 | 845 / 704 / 559 | 839 / 687 / 540 | 832 / 680 / 538 |

Ce qu'on en retient :
- Avec standard +0,05, les éclosions tardives tombent de moitié et le circuit se renforce (médiane L2 +28). C'est à éviter.
- **Avec standard inchangé et 50 % des bruts en éclosion tardive** : 4 fois plus de recrues placées directement en L2, 2 fois plus en L3, 2,5 fois plus de plateaux, autant d'éclosions tardives qu'avant, le plus grand nombre de chemins différents (237), et un circuit à peu près aussi fort qu'avant (médianes à ±11 points). **C'est la version retenue pour la v418.**
- **Vérifié dans le jeu v418** (3 mondes × 30 saisons) : recrues placées par saison 0,5 / 1,9 / 3,7 / 42 (L1 / L2 / L3 / L4), 407 golfeurs qui plafonnent dans leur ligue de départ, 0,32 éclosion tardive par saison, 234 chemins de carrière différents, part du top 5 en L1 17 %, médianes 834 / 693 / 543 / 353.
- Les bonds de plus de 150 points sont un peu moins fréquents (14 contre 17 par saison) : les recrues prêtes ont peu de marge.
- Le profil ne décide pas du destin : brutes, standard et prêtes atteignent la L1 à peu près aussi souvent (44 %, 47 %, 51 %). C'est le vrai plafond qui décide.


**Constat de Max** : les coupures observées sont environ L1 +4, L2 +7, L3 +11 et L4 +18 **après la ronde 1** (18 trous). Les écarts entre ligues sont donc +3, +4, puis **+7**. Le dernier palier est presque deux fois plus grand que les autres.

**Mesure de référence** (20 novembre 2026, v416, réglages par défaut, terrains tirés de la liste intégrée : course rating moyen 69,6, slope 123). 3 mondes de 30 saisons, soit 900 tournois par ligue, après les 20 saisons cachées. Outil : `tools/mesure/` (voir l'en-tête de `mesurer.cjs`).

| Ligue | Golfeurs | Coupure moyenne (écart-type) | Niveau à la coupure | Niveaux 10e / 50e / 90e centile |
|---|---|---|---|---|
| L1 | 131 | +3,1 (2,0) | 839 | 727 / 837 / 946 |
| L2 | 146 | +5,8 (2,1) | 687 | 583 / 683 / 787 |
| L3 | 164 | +8,2 (2,2) | 558 | 447 / 549 / 653 |
| L4 | 146 | +13,6 (2,6) | 364 | 167 / 360 / 517 |

- **Écarts de coupure** : +2,7 / +2,3 / **+5,5**. Le palier L3 → L4 est bien environ deux fois plus grand que les autres.
- **Écarts de niveau à la coupure** : 152 / 129 / **195** points. Il y a plus de talent entre la L3 et la L4, et ces points coûtent plus cher en bas de la courbe : environ 2,8 coups par 100 points, contre 1,8 entre les autres ligues.
- **Le vent n'y est presque pour rien** : l'écart L3 → L4 vaut +5,4 sans vent et +5,7 par vent fort.
- **La L4 est très étalée** : son 10e centile est à 167, contre 447 en L3, et son golfeur le plus faible à 24 en moyenne.
- **Part des victoires gagnée par le top 5 du champ** : L1 17 %, L2 24 %, L3 30 %, L4 41 %.
- **Montée L4 → L3** : les promus passent 40 % des coupures en L3 à leur première saison, contre 45 % pour les promus en L2 et en L1. 79 % restent en L3 ou montent la saison suivante. **La montée n'est donc pas brutale** : l'écart vient de la moitié faible de la L4, qui tire la coupure vers le bas, pas d'un mur pour les meilleurs de la L4.
- Les chiffres observés par Max dans sa partie (+4 / +7 / +11 / +18) sont environ 1,3 fois plus élevés partout. Ça laisse penser à des réglages différents dans sa sauvegarde : écart (`gap`) au-dessus de 1, ou des terrains plus durs ou au slope plus élevé. Les proportions entre les ligues restent les mêmes.

**Recrues à leur arrivée** (4 000 recrues tirées avec le moteur) : niveau médian 226 (10e centile 60, 90e 429), contre 356 pour les golfeurs déjà en L4. Environ 40 recrues par saison. Le nombre de recrues n'est pas un réglage : il remplace les retraités pour garder le circuit autour de 600 golfeurs. Ajouter des recrues ferait donc baisser le niveau de la L4 au lieu de l'augmenter.

**Essais** (22 novembre 2026, mêmes conditions que la référence, appliqués seulement dans le banc d'essai) :

| Essai | Coupures L1 / L2 / L3 / L4 | Écart L3 → L4 (par monde) | L4 10e / 50e centile | Médiane L3 | Top 5 gagne (L1 / L4) | Promus en L3 : coupures / restés |
|---|---|---|---|---|---|---|
| A. Référence | +3,1 / +5,8 / +8,2 / +13,6 | +5,5 (5,5 / 5,5 / 5,4) | 167 / 360 | 549 | 17 % / 41 % | 40 % / 79 % |
| B. Recrues plus prêtes (`ROOK.f0` +0,10) | +2,9 / +5,2 / +7,4 / +12,6 | +5,1 (5,1 / 5,0 / 5,4) | 191 / 388 | 576 | 15 % / 37 % | 40 % / 80 % |
| C. Courbe adoucie sous 450 (k = 0,75) | +3,2 / +5,6 / +7,9 / +11,6 | **+3,7** (3,7 / 3,8 / 3,7) | 148 / 357 | 560 | 20 % / 40 % | 42 % / 82 % |
| D. Recrues +0,05 et k = 0,85 | +3,2 / +5,6 / +7,7 / +11,9 | +4,2 (4,1 / 4,2 / 4,3) | 163 / 369 | 566 | 18 % / 38 % | 42 % / 81 % |
| E. Recrues +0,10 et k = 0,75 | +3,0 / +5,4 / +7,4 / +11,4 | +4,0 (4,0 / 4,0 / 4,2) | 162 / 378 | 585 | 16 % / 36 % | 41 % / 81 % |

Ce qu'on en retient :
- **Les recrues plus prêtes (B) remontent tout le circuit**, pas seulement la L4 : la médiane de la L3 gagne 27 points et toutes les coupures baissent. L'écart L3 → L4 ne recule que de 0,4 coup.
- **La courbe adoucie (C) vise juste** : l'écart L3 → L4 passe de +5,5 à +3,7, les coupures de la L1 et de la L2 bougent de 0,3 coup ou moins, et la montée vers la L3 devient un peu plus facile.
- Combiner les deux (D, E) fait moins bien que C seul, parce que les recrues remontent aussi la L3.
- D'un monde à l'autre, l'écart ne varie que de 0,1 à 0,4 coup : les différences entre les essais sont réelles.

**Essais de k plus bas** (22 novembre 2026, coude à 450). Un 2e tirage de la référence et de k = 0,75 mesure le hasard entre deux séries.

| Essai | Coupures L1 / L2 / L3 / L4 | Écart L3 → L4 (par monde) | L4 10e / 50e centile | Top 5 gagne (L1 / L4) | Promus en L3 : coupures / restés |
|---|---|---|---|---|---|
| Référence, 2e tirage | +3,5 / +6,0 / +8,5 / +13,9 | +5,5 (5,5 / 5,8 / 5,1) | 163 / 353 | 20 % / 36 % | 40 % / 79 % |
| k = 0,75, 2e tirage | +3,2 / +5,7 / +7,8 / +11,7 | +3,9 (4,0 / 4,0 / 3,7) | 137 / 343 | 15 % / 40 % | 41 % / 81 % |
| k = 0,70 | +3,3 / +5,6 / +7,9 / +11,5 | +3,6 (3,6 / 3,6 / 3,7) | 139 / 349 | 16 % / 38 % | 42 % / 81 % |
| k = 0,65 | +3,3 / +5,7 / +7,9 / +11,4 | +3,4 (3,5 / 3,5 / 3,3) | 131 / 344 | 17 % / 36 % | 42 % / 82 % |

- **Le gain ralentit** : passer de 0,75 à 0,65 ne fait gagner qu'environ 0,4 coup. Avec un coude à 450, l'écart descend difficilement sous +3,4. Le golfeur de L4 à la coupure (≈ 360) n'est qu'à 90 points sous le coude, donc l'adoucissement ne le touche qu'en partie.
- **La part du top 5 en L1 varie de 15 % à 20 % d'une série à l'autre**, même sans aucun changement. L'écart vu avec k = 0,75 au premier essai était du hasard.
- Les coupures de la L1 à la L3 restent stables, à 0,3 coup près.

**Causes probables, trouvées dans le code** :

1. `MU.GAM = 1,25` : 100 points de talent valent environ 2,5 coups en bas de l'échelle contre 1,8 en haut.
2. La variance d'une ronde augmente quand le niveau baisse : écart-type de 2,2 à 200 contre 1,5 à 800.
3. `condFactor` amplifie le vent et la distance chez les faibles (×1,12 à 200), alors que le vent ajoute déjà 1,5 à 3,5 coups dans 51 % des rondes.
4. 22 % des golfeurs sont sous 300, et ils sont presque tous en L4.

**Pistes à tester par simulation** :

- `MU.GAM` à 1,0 ou 1,1, en ajustant B pour garder le haut du classement à peu près pareil.
- Adoucir la pente de l'écart-type, par exemple `1,3 + 0,6 × (1 − x)`.
- Plafonner `condFactor` à environ ×1,05.
- Cible proposée : environ L1 +3 / L2 +6 / L3 +9 / L4 +12 à +13, soit un écart régulier de 3 à 4 coups par palier.

**Avant de toucher quoi que ce soit** (fait pour la v417) : vérifier les effets sur la répartition des victoires (le top 5 gagne environ 20 % des tournois), sur la montée L4 → L3 et sur les records déjà calibrés.
