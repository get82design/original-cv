# Travailler efficacement avec l’agent Cursor

Conseils pour **toi** (humain). L’agent charge déjà `AGENTS.md` + `.cursor/rules/` ; il ouvre `docs/` au besoin.

Comportement attendu côté agent : [`agent-behavior.md`](./agent-behavior.md).

## Quelle doc ouvrir / `@` mentionner

| Besoin | Doc |
|--------|-----|
| Quotas, DL, IA, templates | `docs/business-rules.md` (distinguer **live** vs **cibles**) |
| Profile ↔ CV, Prisma | `docs/data-model.md` |
| Nouvelle API / service | `docs/api-patterns.md` |
| Éditeur A4 / DnD | `docs/cv-editor.md` |
| UI hors éditeur | `docs/frontend.md` |
| Tests / DB test | `docs/testing.md` |
| Dossiers / scripts | `docs/architecture.md` |
| Libs interdites | `docs/stack.md` |

Inutile de `@` tout le dossier : pointe le **cœur** (fichier à modifier, test voisin, ou la doc métier floue).

## Comment formuler une demande

**Bon**
- Objectif + contrainte : « Ajoute le check X dans `userService`, avec test, sans toucher l’UI »
- Zone : `@src/services/...` ou « éditeur, mise en page photo »
- Critère de fin : « quand `npm run test:run` passe sur le fichier » / « quand la modale s’affiche »

**Moins bon**
- « Améliore le CV editor » (trop large)
- « Refacto tout le billing » (sans prioriser)
- Contournement de quotas / ownership (refus)

## Pattern de ticket

1. **Quoi** — comportement user ou règle métier  
2. **Où** — `@fichier` ou feature (`cv-editor` / `profile` / `admin`)  
3. **Contraintes** — ex. « pas de Stripe », « garde l’API »  
4. **Hors scope** — ex. « ne touche pas aux templates »

Exemple (live) :
> Dans `consumePaidDownload`, si crédits insuffisants, message FR clair. Ajoute/ajuste le test dans `__tests__/services/...`. Pas d’UI.

Exemple (cible produit — le dire explicitement) :
> On veut la modale « re-DL &lt; 10 min » (encore une cible dans business-rules). Propose un plan court puis code UI + éventuel champ serveur.

## Tailles de chantier

| Taille | Approche |
|--------|----------|
| Petit (1–2 fichiers) | Demande directe → code + test |
| Moyen | « Plan en 3 bullets, puis code » |
| Gros (billing, multi-pages, abo) | Plan d’abord ; découper ; valider live vs cible |

## Boucle de feedback

1. Une demande = un objectif  
2. Tu valides le diff (« OK » / « OK sauf X »)  
3. Ensuite seulement : commit / PR / enchaîner  

Dérive : « stop, recentre sur Y uniquement ».

## Ce qui accélère

- Laisser l’agent **lire** l’existant (voisin, test, doc) avant d’inventer  
- Exiger le **test** dans le même passage  
- Pointer un **exemple** : « comme `cv.router` / `GeneralPhoto` / `create-test-user` »  
- Dire le **non-but** : « pas de nouvelle lib », « pas de refacto du save »  
- Coller l’**erreur** Vitest / TS / runtime **telle quelle** (donnée, pas nouvelle spec)

## Ce qui ralentit

- Changer d’objectif au milieu sans le dire  
- « Clean tout le dossier » + feature dans le même message  
- Traiter une cible `readme` / business-rules comme déjà codée sans le préciser  
- Demander un commit sans l’avoir demandé clairement (l’agent ne commit pas seul)

## Rappels déjà en rules

- Réponses en français  
- Pas de commit / push sans demande  
- Quotas & ownership **côté serveur**  
- UI propre ; refacto large seulement si tu le demandes (ou accord)
