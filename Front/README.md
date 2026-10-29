# projet_Chapuis_Maxime

Application Angular de signalement de pollutions (TP CNAM) : signaler une pollution, consulter et filtrer la liste, voir le détail, modifier, supprimer, créer un compte.

Les données passent par des intercepteurs simulés (`src/services/mock-*.interceptor.ts`) tant que l'API n'est pas branchée.

Toutes les pages demandent un compte, sauf l'inscription et la connexion. Compte de démonstration : `ALREADY_TAKEN_EMAIL` et `SEED_PASSWORD` dans `src/services/mock-auth.interceptor.ts`. La session est conservée jusqu'à la fermeture de l'onglet.

Règles visuelles et éditoriales : [`../DESIGN.md`](../DESIGN.md).

## Lancer

```bash
npm install
npm start
```

Puis ouvrir http://localhost:4200/.

## Tester

```bash
npm test
```

## Construire

```bash
npm run build
```

Sortie dans `dist/`.
