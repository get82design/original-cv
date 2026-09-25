# Tests

**Obligation** : tout changement de logique métier, service, schema Zod non trivial, ou util critique → **ajouter ou mettre à jour** un test dans le même passage. Ne pas livrer « sans test » par défaut.

## Stack & scripts

| Commande | Rôle |
|----------|------|
| `npm run test` | Vitest watch |
| `npm run test:run` | Suite une fois |
| `npm run test:db` | `db:test:push` puis `vitest run` |
| `npm run test:coverage` | Coverage v8 |
| `npm run db:test:push` | Sync schema test → Postgres test |
| `npm run db:test:reset` | Reset migrations test |

Config : [`vitest.config.ts`](../vitest.config.ts)

- Environment : `node` ; `globals: true`
- Include : `**/__tests__/**/*.test.ts` (pas de `.tsx` dans le glob actuel)
- `setupFiles` : `__tests__/utils/setup.ts`
- `maxWorkers: 1`, `isolate: false` — suite sérialisée (DB partagée)

## Base de test

- Schema : `prisma/schema.test.prisma` → `DATABASE_TEST_URL`
- Client : `lib/prismaTest.ts` (`prismaTest` = alias du client app en env test)
- Avant **chaque** test : `resetTestDB()` (TRUNCATE cascade) via `setup.ts`
- Après la suite : `disconnectTestDB()`

Prérequis local : Postgres de test joignable + `db:test:push` au moins une fois (ou `test:db`).

## Organisation (miroir)

```
__tests__/
  services/       ↔ src/services/     (priorité haute)
  api/            ↔ server/api/       (routers / context)
  features/       ↔ src/features/     (utils critiques, ex. cvPage)
  components/     ↔ src/components/   (utils purs)
  schemas/        ↔ souvent sous services/schemas/
  integration/    # flows plus larges
  test-prisma/    # contraintes / modèles Prisma
  test-utils/     # helpers métier testés (reorder, timeline…)
  utils/          # factories + setup (create-test-*, database.ts)
```

Nommage : `FooService.test.ts`, `cvPage.test.ts`, etc.

## Helpers à réutiliser

Sous `__tests__/utils/` — **ne pas** recréer un user/CV à la main si un helper existe :

| Helper | Usage |
|--------|--------|
| `create-test-user.ts` | User minimal |
| `create-test-user-with-profile.ts` | User + Profile rempli |
| `create-test-template.ts` | `CVTemplate` |
| `create-test-cv-full-flow.ts` | CV + contenu (`createCV`, `buildCvComplete`…) |
| `create-test-cv.ts` / `create-test-module*.ts` | Pièces plus petites |
| `database.ts` | reset / disconnect |

## Que tester en priorité

1. **Services** — quotas, ownership, save, billing, accès templates  
2. **Schemas Zod** — drafts IA, save, inputs non triviaux  
3. **Utils purs** — `cvPage`, `moduleOrder`, `clientError`, mappers form/save  
4. **Routers** — auth/procédures quand le comportement API compte  
5. **Éviter** : tests E2E UI fragiles (PrimeReact / DnD) sauf besoin explicite

## Conventions d’écriture

- Importer depuis les mêmes aliases que l’app (`@/`, `@utils/`, `@server/`, `@generated/`)
- Asserts sur messages d’erreur **en français** (alignés services) quand le message est contractuel
- Pour la logique pure : pas besoin d’écrire dans Prisma — le setup reset quand même la DB
- Pour services : factories `__tests__/utils/*` + vérifs `prismaTest` si besoin
- Un `describe` par unité / scénario ; titres d’`it` clairs (comportement attendu)

## Anti-patterns

- Livrer une règle métier / mapping sans test voisin
- Dupliquer un gros seed alors qu’un `create-test-*` existe
- Tester l’UI pixel / DnD sans demande
- Pointer la DB de **prod** / dev principale : toujours `DATABASE_TEST_URL` + schema test
- Paralleliser agressivement la suite (workers) tant que le reset global est partagé
