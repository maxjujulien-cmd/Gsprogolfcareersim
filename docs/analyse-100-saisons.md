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
