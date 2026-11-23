# Analyse d'un monde de 100 saisons (v420, 22 novembre 2026)

Sauvegarde « Test 100 saisons » de Max : saisons 2026 à 2125, mode spectateur (sans golfeur du joueur), réglages v420. Le défi est « L2 · Aspirant », handicap 4 : +3 coups par ronde pour tous les golfeurs simulés. La sauvegarde n'est pas versée dans le dépôt.

Point de vue adopté : un joueur sur simulateur GSPro qui veut une carrière solo, hors ligne et immersive.

## Ce qui fonctionne

- **Stabilité sur 100 ans** : pas de dérive. Les coupures par décennie restent entre +6,2 et +6,5 en L1, +8,8 et +9,2 en L2, +10,9 et +11,5 en L3, +15,0 et +16,1 en L4 (avec les +3 du défi). L'index moyen par ligue est stable (2,4 / 5,1 / 7,5 / 10,7).
- **Generational** : entre 2 et 6 en moyenne par décennie, comme voulu. Hall Of Famer : entre 10 et 16.
- **Temple de la renommée** : 35 intronisés en 100 ans, un rythme crédible.
- **Une vraie dynastie** : Shaun Symes, 6 titres de L1 de suite (2069 à 2075), 21 victoires, 124 M$. Sa fiche avec les bannières et la vitrine de trophées est très réussie.
- **Écrans** : la fiche de golfeur (parcours par ligue, carte de handicap, progression), les records, l'almanach et la boîte de réception donnent de la matière à lire.
- **Pas de noms en double** sur plus de 6 600 golfeurs.

## Ce qui casse l'immersion

### 1. Les grands golfeurs ne gagnent presque pas (le plus important)

Saisons complètes en L1, selon le niveau du golfeur au départ de la saison :

| Niveau | Saisons | Victoires par saison | Tournois gagnés | Top 10 |
|---|---|---|---|---|
| Generational (950+) | 64 | 0,30 | 3,0 % | 26 % |
| Hall Of Famer (900-949) | 141 | 0,19 | 1,9 % | 19 % |
| Elite (850-899) | 264 | 0,16 | 1,6 % | 14 % |
| Elite (800-849) | 281 | 0,08 | 0,8 % | 9 % |
| Established Pro (700-799) | 366 | 0,01 | 0,1 % | 5 % |

Dans la réalité, un joueur dominant gagne 20 à 35 % de ses départs à son sommet et finit dans le top 10 plus d'une fois sur deux. Ici, un Generational ne gagne qu'un tournoi aux 3 saisons.

Conséquences :
- 8,4 gagnants différents par saison en L1, sur 10 tournois ;
- le meilleur de la saison gagne 2,2 tournois en moyenne, au plus 4 ;
- en 100 ans, seulement 9 golfeurs ont 10 victoires ou plus, et un seul en a 20 ;
- 70 champions différents en 100 saisons ;
- exemple : Bapit Boonyaras, coté Generational (994), n'a que 5 victoires à 29 ans.

**Cause** : en haut de l'échelle, la courbe talent → coups est très plate. Un golfeur à 950 n'a que 1,5 coup par ronde d'avance sur un golfeur à 850, et la L1 compte environ 70 golfeurs Elite ou mieux. Sur seulement 2 rondes, le hasard (environ 1,4 coup d'écart-type par ronde, plus les rondes de feu et les rondes catastrophes) écrase le talent.

**Piste** : donner plus d'avance aux meilleurs seulement au-dessus d'environ 850. La coupure de la L1 se fait vers 836, donc ni les coupures ni les écarts du milieu ne bougent. À mesurer avec le banc d'essai, en visant par exemple 15 à 20 % de victoires pour un Generational. Option à discuter : des Majeurs sur 4 rondes.

### 2. Des rondes absurdes en L1

La pire ronde de la L1 dépasse chaque saison +25, et va jusqu'à +30, soit un 98 sur le Tour (almanach). Ça vient du cumul d'une ronde catastrophe, d'un creux de forme, des yips et du vent. **Piste** : plafonner ou adoucir la pire ronde selon le niveau.

### 3. Peu d'histoires suivies

Avec autant de parité, il y a peu de rivalités, de règnes ou de courses au record. Les nouvelles sont variées (350 modèles, environ 27 par saison), mais ce sont surtout des événements isolés : retraites, percées, déclins. Elles parlent rarement d'une histoire qui dure d'une saison à l'autre. Si les grands golfeurs gagnent plus (point 1), une bonne partie de ces histoires viendra d'elle-même.

### 4. Nationalités

En L1 aujourd'hui : États-Unis 17 golfeurs sur 130 (13 %), pour 42 pays. Sur tout le monde : 216 pays (Laos, Maurice, Kazakhstan…). C'est très international, alors que le vrai Tour est majoritairement américain. C'est une question de goût, à discuter.

### 5. Taille de la sauvegarde

37 Mo après 100 saisons : 25 Mo d'historique des tournois (surtout les cartes trou par trou) et 8 Mo de fiches de retraités. Ça fait environ 0,35 Mo de plus par saison. Chaque copie automatique réécrit le tout. **Piste** : alléger les vieilles saisons (garder les résultats, retirer les cartes trou par trou au-delà d'un certain nombre de saisons), sans toucher aux records ni à l'almanach.

## Non évalué

La sauvegarde est en mode spectateur, sans golfeur du joueur. Pour juger l'expérience du joueur (est-ce qu'on parle de lui, de ses rivaux, de ses moments forts), il faut une sauvegarde d'une vraie carrière.

## Essais pour le point 1 (22 novembre 2026)

**Cible de Max** : un dominant ne gagne pas forcément très souvent, mais il fait beaucoup de points et finit souvent en haut. Visé pour un Generational : environ 8 à 12 % de victoires, plus de la moitié de top 10, souvent dans le top 5 de la saison.

Banc d'essai (3 mondes × 30 saisons, v420, outil `tools/mesure/vedettes.cjs`). « Avance E » : les golfeurs au-dessus de 850 gagnent E coups par ronde par tranche de 100 points au-dessus de 850 (950 : −E ; 1000 : −1,5 × E). « Régularité » : le réglage existant `eliteSd`, moins de hasard d'une ronde à l'autre pour l'élite.

| Essai | Generational : victoires / top 10 / coupure ratée | Rang final médian (Gen) | Gen dans le top 5 / top 10 de la saison | HoF : victoires / top 10 | Écarts de coupure |
|---|---|---|---|---|---|
| v420 | 3,8 % / 28 % / 22 % | 16 | 24 % / 40 % | 2,4 % / 20 % | +2,3 / +2,5 / +3,8 |
| Régularité 0,35 | 3,7 % / 28 % / 20 % | 16 | 23 % / 38 % | 2,0 % / 19 % | +2,4 / +2,4 / +3,7 |
| Avance 0,6 | 4,7 % / 36 % / 17 % | 10 | 34 % / 53 % | 2,3 % / 22 % | +2,5 / +2,4 / +3,8 |
| Avance 1,0 | 6,3 % / 38 % / 16 % | 8 | 37 % / 57 % | 2,2 % / 22 % | +2,5 / +2,3 / +3,7 |
| **Avance 1,5** | **8,1 % / 46 % / 12 %** | **6** | **47 % / 68 %** | 2,4 % / 26 % | +2,7 / +2,5 / +3,8 |
| Avance 2,0 | 8,5 % / 51 % / 9,5 % | 6 | 46 % / 70 % | 2,5 % / 27 % | +2,7 / +2,5 / +3,6 |

- **La régularité par ronde ne change presque rien.** La coupure se fait après une seule ronde de 18 trous, et le hasard trou par trou (environ 3 coups d'écart-type sur une ronde, même chez les meilleurs) domine.
- **L'avance au-dessus de 850 fonctionne.** Avec 1,5, un Generational gagne 8 % de ses tournois, fait un top 10 une fois sur deux, finit en médiane 6e de la saison et dans le top 5 près d'une saison sur deux. C'est exactement la cible.
- Au-delà de 1,5, le gain ralentit.
- Les coupures de la L2 à la L4 ne bougent pas. Celle de la L1 baisse d'environ 0,2, donc l'écart L1 → L2 passe d'environ +2,4 à +2,7.
- Le nombre de Generational reste autour de 4 à 5.

**Réaction de Max** : l'avance 1,5 rend les vedettes trop dominantes. Sa proposition : des golfeurs plus constants au quotidien, avec plus de rondes de feu et de rondes catastrophes pour garder les surprises.

| Essai | Generational : victoires / top 10 / coupure ratée | Rang final médian | Top 5 / top 10 de la saison | HoF : victoires / top 10 | Écarts de coupure |
|---|---|---|---|---|---|
| Constance 70 % (`rand` 0,7), feu 5 %, catastrophes 6 % | 4,2 % / 29 % / 22 % | 14 | 27 % / 41 % | 2,2 % / 20 % | +2,3 / +2,5 / +3,8 |
| Constance 50 %, feu 6 %, catastrophes 7 % | 4,2 % / 29 % / 21 % | 14 | 25 % / 41 % | 2,0 % / 20 % | +2,5 / +2,6 / +3,9 |
| Constance 30 %, feu 7 %, catastrophes 8 % | 4,8 % / 30 % / 20 % | 12 | 32 % / 47 % | 2,4 % / 21 % | +2,4 / +2,4 / +3,9 |
| Constance 50 %, 6 % / 7 % + avance 0,6 | 5,1 % / 35 % / 17 % | 10 | 34 % / 51 % | 2,4 % / 22 % | +2,4 / +2,5 / +3,9 |
| **Constance 70 %, 5 % / 6 % + avance 0,8** | **6,0 % / 38 % / 16 %** | **9** | **39 % / 56 %** | 2,4 % / 23 % | +2,5 / +2,4 / +4,0 |
| Constance 70 %, 5 % / 6 % + avance 1,0 | 6,8 % / 42 % / 14 % | 8 | 40 % / 58 % | 2,8 % / 25 % | +2,5 / +2,4 / +3,8 |

- La constance seule change peu : le hasard trou par trou domine sur une ronde de 18 trous.
- Un mélange avec une avance modérée (0,8 à 1,0) donne des vedettes nettement plus présentes sans écraser le circuit.

## Point 2 : les rondes absurdes (23 novembre 2026, essais)

**Diagnostic** (v421, défi +3, 15 à 30 saisons). La pire ronde de L1 combine deux choses :
- une cible du jour déjà haute : ronde catastrophe (+3 à +6,5), vent fort (+3,5), creux de forme ;
- un écart trou par trou qui s'ajoute par-dessus : jusqu'à +13 à +19 au-dessus de la cible. Sur 39 000 rondes, il devrait rarement dépasser +9 ou +10. L'élan explique une partie (sans élan, le maximum passe de +17,9 à +15,6). Le reste vient des gros trous enchaînés.

**Mesure** : écart avec le score médian du champ dans le même tournoi (ronde 1, L1, 15 saisons). C'est ce qui choque un joueur : une ronde loin derrière les autres, pas un jour de grand vent où tout le monde souffre.

| Solution | Pire vs champ | 99,9e centile | Rondes ≥ +12 vs champ | Rondes ≥ +15 vs champ | Meilleure vs champ |
|---|---|---|---|---|---|
| v421 | +22 | +17 | 266 | 69 | −16 |
| 1. Se ressaisir (au-delà de 4 coups perdus sur l'attendu, 0,06 coup de mieux par trou et par coup perdu de plus, au plus 1) | +19 | +14 | 129 | 17 | −17 |
| 2. Triple bogey au maximum sur un trou | +20 | +15 | 191 | 42 | −15 |
| 3. Catastrophes adoucies (+2,5 + 0,9 × \|N\|) | +20 | +16 | 187 | 46 | −16 |
| 4. Solutions 1 et 3 | +17 | +14 | 98 | 10 | −15 |
| **5. Se ressaisir fort (au-delà de 3 coups, 0,12 par coup de plus, au plus 1,5)** | **+17** | **+13** | **59** | **7** | −14 |
| 6. Solution 1 + mauvais jour plafonné à +4,5 | +19 | +14 | 118 | 15 | −15 |

Sur le circuit complet (3 mondes × 30 saisons), les solutions 1 et 5 ne changent ni les coupures, ni les écarts entre ligues, ni les vedettes (dans la marge de hasard) :

| Essai | Écarts de coupure | Generational : victoires / top 10 / coupure ratée | Rang final médian (Gen) |
|---|---|---|---|
| v421 (2 tirages) | +2,5 / +2,5-2,6 / +3,9-4,1 | 6,0-7,1 % / 39-40 % / 13-15 % | 8-9 |
| Se ressaisir | +2,4 / +2,4 / +3,8 | 6,7 % / 38,5 % / 14,5 % | 9 |
| Se ressaisir fort | +2,6 / +2,4 / +3,8 | 6,8 % / 40,4 % / 13,0 % | 7 |

**Décision (23 novembre 2026)** : version 7 (tempérament + journée noire 1 ronde sur 5), intégrée en v422. Voir `docs/parametres.md`.
