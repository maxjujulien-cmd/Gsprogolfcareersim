---
name: choisir-terrain
description: Classer et présenter les terrains d'une liste que Max colle (souvent tirée de la « Pige de terrains » du jeu) pour choisir celui d'un tournoi de sa carrière, à jouer sur GSPro. À utiliser dès que Max envoie une liste de noms de terrains et demande lequel choisir, ou de les classer.
---

# Choisir un terrain pour un tournoi de la carrière

Max colle une liste de noms de terrains (texte). Il va jouer l'un d'eux sur son simulateur GSPro, pour un tournoi de sa carrière. Il veut **toute la liste classée**, avec de quoi décider, pour avoir de belles saisons plaisantes.

## Ce que Max veut (ses réponses du 28 novembre 2026)

- **Critère principal : la beauté et le plaisir de jeu sur écran**, pas le prestige ni la difficulté de la ligue.
- Sur écran, ce qui compte le plus pour lui : **ne pas être trop punitif.** Il veut éviter les terrains étroits où on perd des balles sans arrêt (hors-limites, forêt dense, eau partout).
- **Styles préférés : bord de mer / falaises, et désert / montagne** (grands paysages, contraste, dénivelés). Les autres styles ne sont pas exclus, mais ils partent derrière à qualité égale.
- **Ne pas tenir compte du tournoi** (majeur, ligue, Finale) ni de ce qui a été joué avant : seulement le plaisir.
- Pas de carnet d'avis : on classe à partir de ce qu'on sait des terrains, à chaque fois.
- Max joue avec un handicap de 4.
- **Le vrai terrain compte aussi** (ajout du 28 novembre 2026) : quand la version GSPro reproduit un vrai terrain, juger aussi le vrai (décor, réputation) et raconter son **histoire** : année d'ouverture, architecte, tournois accueillis (majeurs, PGA Tour, DP World Tour…), moments célèbres, classements des meilleurs terrains. Pour Max, ce passé rend le terrain plus intéressant à jouer, et un riche passé peut le faire monter dans le classement.

## Méthode

1. **Mettre la liste dans un fichier** du scratchpad, un nom par ligne (les puces et numéros sont acceptés), puis lancer :
   `node .claude/skills/choisir-terrain/chercher.cjs <fichier> --sgt`
   Pour chaque nom, l'outil donne le terrain trouvé dans la liste du jeu (`public/terrains-data.js`) : par, nombre de par 3, 4 et 5, lieu, et chaque tee (distance, rating / slope). Avec `--sgt`, il ajoute la difficulté Simulator Golf Tour (environ 2 à 7, plus haut = plus dur), le concepteur GSPro et la date de la dernière version. Sans réseau, il continue sans ces données.
   - « nom proche » ou « deviné, à vérifier » : vérifier que c'est bien le même terrain (DPC Pebble est la version GSPro de Pebble Beach, par exemple). Si ce n'est pas lui, le dire.
   - « PAS TROUVÉ » : le classer quand même d'après ce qu'on sait, et le signaler.
2. **Juger chaque terrain** sur trois points :
   - **Beauté sur écran** : décor (mer, falaises, désert, montagnes, dénivelés), réputation du vrai terrain, et réputation du concepteur GSPro (un concepteur connu pour un travail soigné, une version récente).
   - **Pas trop punitif** : slope et rating des tees de 6 300 à 6 900 verges, difficulté SGT, et ce qu'on sait du tracé (fairways larges ou étroits, hors-limites, eau, forêt). Un slope au-dessus de 140 ou une difficulté SGT au-dessus de 5,5 compte contre le terrain, sauf si le décor en vaut la peine : le dire franchement.
   - **Histoire du vrai terrain** (s'il existe) : voir « Ce que Max veut ». Un terrain fictif n'a pas d'histoire : le dire simplement, sans pénalité si le reste est beau.
   - **Plaisir et variété** : par 5 atteignables, par 3 spectaculaires, trous mémorables, mélange des longueurs (le nombre de par 3, 4 et 5 aide).
   **Être honnête sur ce qu'on sait.** Pour un petit terrain local ou un terrain fictif peu connu, dire « je le connais peu » et s'appuyer sur les chiffres. Ne jamais inventer de trous célèbres, de détails de paysage, de dates ni de tournois : en cas de doute sur un fait historique, le vérifier par une recherche web, ou dire « à vérifier ».
3. **Classer toute la liste**, du meilleur au moins bon. Les égalités sont permises (« 2. ex æquo »).

## Présentation à Max (en français simple)

- **Une phrase d'abord : mon choix et pourquoi.**
- Un **tableau de classement** : rang, terrain, lieu, style, beauté (★ sur 5), punitif (faible / moyen / élevé), tee conseillé (distance, rating / slope).
- Puis **une fiche courte par terrain**, dans l'ordre du classement :
  - le décor et l'ambiance ;
  - **l'histoire du vrai terrain** s'il existe (architecte, ouverture, grands tournois, moments célèbres), en 2 ou 3 phrases ; préciser si la version GSPro est fidèle ou inspirée (« DPC Pebble » = Pebble Beach) ;
  - comment il se joue (largeur, dangers, trous marquants) ;
  - le tee conseillé pour un handicap 4 (environ 6 300 à 6 800 verges ; plus court si le terrain est très punitif) ;
  - un point fort et un point faible.
- Les terrains du bas peuvent avoir une fiche plus courte, mais **aucun terrain ne doit être oublié**.
- Pas de termes de code. Distances en verges, comme dans le jeu.

## Garder le skill à jour

Si Max précise ses goûts (« je n'aime pas les links », « le slope ne me dérange pas »), mettre à jour la section « Ce que Max veut », puis faire un commit et un push.
