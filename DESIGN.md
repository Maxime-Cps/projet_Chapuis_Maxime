# DESIGN.md

Règles visuelles et éditoriales du front (`Front/`). Toute modification de style s'y conforme. Un choix absent d'ici y est ajouté avant d'être appliqué.

## Direction

Une carte de ville la nuit, éclairée par une lampe ambrée : chaleureuse, lisible, centrée sur le lieu.

Références : OpenStreetMap, Citymapper, Strava (la carte au centre, un panneau posé dessus, l'information de lieu d'abord).

## Couleurs

Jetons dans `Front/src/styles.scss` (`:root`). Aucune couleur écrite en dur ailleurs. Aucun dégradé, sauf la carte de chaleur (rampe des couleurs de niveau).

| Rôle | Jeton | Valeur |
|---|---|---|
| Principale (fond, brun nuit) | `--bg` | `#14110e` |
| Accent (ambre) | `--accent` | `#ffb547` |
| Texte sur accent | `--on-accent` | `#1a1206` |
| Neutre : panneau | `--panel` | `#1c1814` |
| Neutre : bordure | `--border` | `#382f27` |
| Neutre : champ | `--field` | `#14110e` |
| Neutre : texte | `--text` | `#f3ede5` |
| Neutre : texte doux | `--text-soft` | `#d9d0c4` |
| Neutre : texte discret | `--muted` | `#b6aa99` |
| Erreur | `--error` | `#ff8a7a` |
| Niveau : faible (vert clair) | `--level-low` | `#a8dc90` |
| Niveau : modérée (jaune) | `--level-moderate` | `#f2d84b` |
| Niveau : élevée (orange) | `--level-high` | `#ff9440` |
| Niveau : dangereuse (rouge) | `--level-dangerous` | `#ff6b5b` |

Carte (illustration et carte interactive) : `--land`, `--park`, `--water`, `--road`, `--street`, `--building`. Libellés de la carte : `--muted`, liseré `--bg`.

Seule exception : `<meta name="theme-color">` dans `index.html`, qui ne lit pas le CSS. Sa valeur doit rester égale à `--bg`.

## Typographie

- **Space Grotesk** (texte, titres), graisses 400, 600, 700.
- **JetBrains Mono** (coordonnées, dates, compteurs), graisse 400.

| Usage | Jeton | Taille |
|---|---|---|
| Titre de page (h1) | `--text-title` | 1.875rem |
| Sous-titre (h2) | `--text-subtitle` | 1.375rem |
| Texte, champs | `--text-body` | 1rem |
| Texte secondaire, libellés, aides | `--text-small` | 0.875rem |
| Légendes, badges, données mono | `--text-caption` | 0.75rem |

Pas de petit sur-titre en majuscules au-dessus des titres.

Exception : les noms de rues et de lieux de la carte interactive sont en **Noto Sans**, seule police servie par l'hébergeur des tuiles.

## Formes et espacements

- **Un seul rayon** : `--radius: 8px` (panneaux, boutons, champs, puces, badges, images, bulle du repère). Les éléments réellement circulaires (pastille du repère, indicateur de chargement) restent des cercles. Les bâtiments de la carte ont des angles droits.
- **Aucune pilule.**
- **Grille de 4 px** : marges, retraits et écarts sont des multiples de `0.25rem`.
- **Résultats** : deux affichages, liste (lignes séparées par un filet) et cartes (grille, image 16/9 en haut, bordure, `--radius`). Sans image, la carte affiche « Aucune image ». La bascule est une paire de boutons-icônes (`list`, `layout-grid`), le bouton actif est teinté d'ambre.
- **Boutons** : un style principal (`.btn-primary`, fond ambre) et un secondaire (`.btn-secondary`, bordure). `.btn-danger` est la variante rouge du secondaire. Un seul bouton principal par écran.

## Carte

- **Où** : carte interactive sur la liste, le formulaire et le détail. L'illustration SVG (`app-map-backdrop`) remplace la carte du détail sans WebGL ou sans coordonnées valides.
- **Moteur** : MapLibre GL, tuiles vectorielles OpenFreeMap (sans clé). Le style est construit à partir des jetons de carte, jamais d'un style tiers. Attribution OpenStreetMap toujours visible.
- **Bâtiments** : en relief (hauteur des tuiles), couleur `--building`, à partir du zoom 13.
- **Liste** : caméra inclinée de 40°. Un repère circulaire par signalement filtré, à la couleur de son niveau, liseré `--bg`. Les repères proches se regroupent en un cercle chiffré, à la couleur du plus dangereux ; un clic zoome jusqu'à les séparer. La carte se recadre sur les résultats quand les filtres changent. Survoler ou cibler une ligne met son repère en avant (plus grand, liseré `--text`, au-dessus des groupes), et inversement. Un clic sur un repère ouvre le détail. Une bascule (`map-pin`, `flame`) passe en carte de chaleur, pondérée par le niveau.
- **Repère 3D** (three.js, chargé avec le premier repère) : colonne à la couleur du niveau, haute de 30 m à 220 m selon l'ordre de grandeur de l'indice (25 m s'il est inconnu), losange tournant au sommet. Elle tombe, puis une onde part du sol. Particules selon le type : fragments (plastique, dépôt sauvage), fumée (chimique, air), gouttes (eau), aucune (autre).
- **Formulaire** : un clic sur la carte place le repère, qui se glisse ensuite. Latitude et longitude se remplissent avec 6 décimales. Les champs restent saisissables et déplacent le repère. À l'enregistrement, le repère 3D tombe sur la position et la caméra s'incline.
- **Détail** : vue 3D du lieu (zoom 16, inclinaison 55°), repère 3D au centre de la partie libre de la carte.
- **Sans WebGL 2** : la carte affiche « Carte indisponible sur ce navigateur. ». La liste et la saisie des coordonnées restent utilisables.
- La carte complète la liste, elle ne la remplace jamais : tout ce qui s'y fait se fait aussi au clavier hors de la carte.

## Icônes

- Jeu unique : **Lucide** (licence ISC), tracés copiés en SVG dans le composant `app-icon` (`Front/src/app/icon/icon.ts`).
- 18 px, trait 2, extrémités et jonctions arrondies, couleur `currentColor`.
- Aucun emoji, aucune flèche typographique (`←`) utilisée comme icône.

## Mouvement

Animations autorisées :

- changement de couleur de bordure ou de fond au survol : 120 ms, `ease` ;
- bouton enfoncé : `translateY(1px)` ;
- apparition d'un message d'aide ou d'une notification : 160 ms, fondu et glissement de 4 px (8 px pour la notification) ;
- indicateur de chargement : rotation 700 ms ;
- squelettes de chargement : blocs `--border` à l'emplacement du contenu, opacité pulsée 1200 ms ;
- déplacement de la carte (recadrage sur les résultats, recentrage sur le repère) : animation native de MapLibre ;
- repère 3D : chute 650 ms, onde 900 ms, rotation du sommet et particules pendant 15 s, puis immobile ;
- passage de la liste au détail : la ligne se déplie en panneau (View Transitions), 320 ms ;
- compteurs (nombre de résultats, indice du détail) : décompte 600 ms ;
- jauge de dangerosité : remplissage 900 ms à l'ouverture ;
- frise des dates : hauteur des barres, 240 ms ;
- suppression : barre de 5 s qui se vide sous la notification « Annuler ».

Toutes sont coupées sous `prefers-reduced-motion: reduce` (le repère 3D est alors immobile et sans particules). Pas de parallaxe, pas d'animation au défilement, pas de curseur personnalisé, pas de halo.

## Retours

- **Suppression** : sans confirmation. Le signalement disparaît, une notification propose « Annuler » pendant 5 s, puis la suppression part. Un échec le fait réapparaître avec un message.
- **Chargement** : squelette à la forme du contenu attendu, annoncé par un texte masqué.
- **Image** : zone de dépôt (glisser-déposer ou choix de fichier, bordure pointillée, ambre au survol) ou adresse collée. Le fichier est réduit à 960 px, en JPEG.
- **Dates de la liste** : histogramme des signalements sous les filtres, deux curseurs pour la période ; barres de la période en `--accent`, les autres en `--border`.
- **Dangerosité du détail** : jauge en demi-cercle, un quart par niveau, remplie à la couleur du niveau, indice au centre.

## Ton des textes

- **Vouvoiement.**
- Phrases courtes (15 mots au plus), une idée par phrase.
- Boutons : un verbe et son objet (« Envoyer le signalement », « Créer un compte »).
- Dire ce qui se passe réellement, rien de plus. Aucune promesse que le code ne tient pas.
- Interdits : tiret long (`—`), tiret de liaison comme ponctuation, point d'exclamation, listes de trois adjectifs, « transformez », « libérez », « boostez », « solution », « tout-en-un », « découvrez », « simple », « rapide », « facile », « révolutionnaire ».
