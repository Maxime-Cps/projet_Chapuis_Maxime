# DESIGN.md

Règles visuelles et éditoriales du front (`Front/`). Toute modification de style s'y conforme. Un choix absent d'ici y est ajouté avant d'être appliqué.

## Direction

Une carte de ville la nuit, éclairée par une lampe ambrée : chaleureuse, lisible, centrée sur le lieu.

Références : OpenStreetMap, Citymapper, Strava (la carte au centre, un panneau posé dessus, l'information de lieu d'abord).

## Couleurs

Jetons dans `Front/src/styles.scss` (`:root`). Aucune couleur écrite en dur ailleurs. Aucun dégradé.

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

Carte (illustration uniquement) : `--land`, `--park`, `--water`, `--road`, `--street`, `--building`.

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

## Formes et espacements

- **Un seul rayon** : `--radius: 8px` (panneaux, boutons, champs, puces, badges, images, bulle du repère). Les éléments réellement circulaires (pastille du repère, indicateur de chargement) restent des cercles. Les bâtiments de la carte ont des angles droits.
- **Aucune pilule.**
- **Grille de 4 px** : marges, retraits et écarts sont des multiples de `0.25rem`.
- **Résultats** : deux affichages, liste (lignes séparées par un filet) et cartes (grille, image 16/9 en haut, bordure, `--radius`). Sans image, la carte affiche « Aucune image ». La bascule est une paire de boutons-icônes (`list`, `layout-grid`), le bouton actif est teinté d'ambre.
- **Boutons** : un style principal (`.btn-primary`, fond ambre) et un secondaire (`.btn-secondary`, bordure). `.btn-danger` est la variante rouge du secondaire. Un seul bouton principal par écran.

## Icônes

- Jeu unique : **Lucide** (licence ISC), tracés copiés en SVG dans le composant `app-icon` (`Front/src/app/icon/icon.ts`).
- 18 px, trait 2, extrémités et jonctions arrondies, couleur `currentColor`.
- Aucun emoji, aucune flèche typographique (`←`) utilisée comme icône.

## Mouvement

Seules animations autorisées :

- changement de couleur de bordure ou de fond au survol : 120 ms, `ease` ;
- bouton enfoncé : `translateY(1px)` ;
- apparition d'un message d'aide : 160 ms, fondu et glissement de 4 px ;
- indicateur de chargement : rotation 700 ms.

Toutes sont coupées sous `prefers-reduced-motion: reduce`. Pas de parallaxe, pas d'animation au défilement, pas de curseur personnalisé, pas de halo.

## Ton des textes

- **Vouvoiement.**
- Phrases courtes (15 mots au plus), une idée par phrase.
- Boutons : un verbe et son objet (« Envoyer le signalement », « Créer un compte »).
- Dire ce qui se passe réellement, rien de plus. Aucune promesse que le code ne tient pas.
- Interdits : tiret long (`—`), tiret de liaison comme ponctuation, point d'exclamation, listes de trois adjectifs, « transformez », « libérez », « boostez », « solution », « tout-en-un », « découvrez », « simple », « rapide », « facile », « révolutionnaire ».
