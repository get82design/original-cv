# Architecture

## Règle d’or

```
pages/ (route mince)
  → features/ + components/     UI
    → trpc.*                    client
      → server/api/routers      API mince
        → src/services/*        métier + Prisma
```

Ownership / quotas / débits : **toujours dans les services** (voir [`business-rules.md`](./business-rules.md), [`api-patterns.md`](./api-patterns.md)).

## Dossiers

```
pages/                 # Pages Router — routes, _app, _document (peu de logique)
src/
  features/            # Domaines UI (cv-editor, profile, admin, auth, home, models-list)
  components/          # UI partagée (inputs, dialogs, layout, nav…)
  services/            # Métier + schemas Zod + errors
    cv/ profile/ user/ ai/ admin/ commons/ storage/ mail/ schemas/ errors/
  utils/               # Helpers purs app (moduleOrder, clientError, dates…)
server/
  api/
    routers/           # tRPC mince → services
    helpers/           # assertCvOwnership, assertProfileOwnership…
    trpc.ts            # public / protected / adminProcedure
    root.ts            # AppRouter
    context.ts         # Session / contexte
  auth.ts              # NextAuth
lib/
  prisma.ts            # Client Prisma app
  prismaTest.ts        # Alias client en tests
utils/                 # Alias @utils — trpc client, trpc.types, hooks légers
prisma/
  schema.prisma        # Prod / dev
  schema.test.prisma   # DB de test (DATABASE_TEST_URL)
__tests__/             # Miroir services / api / features… (voir testing.md)
generated/prisma/      # Client généré — ne pas éditer à la main
docs/                  # Documentation projet
scripts/               # Scripts one-shot (ping Gemini, pdf-to-images…)
public/                # Assets statiques
```

Aliases TS courants : `@/` → `src/`, `@utils/` → `utils/`, `@server/` → `server/`, `@generated/` → `generated/`.

## Scripts utiles

```bash
npm run dev              # Next :3001
npm run build / start    # Prod locale :3001
npm run check            # Biome lint+format check
npm run check:fix       # Biome --write
npm run test / test:run  # Vitest
npm run test:db          # push schema test + suite
npm run test:coverage
npm run db:generate      # Prisma client (schema.prisma)
npm run db:migrate       # Migrations dev
npm run db:push          # Push schema (dev)
npm run db:studio
npm run db:test:push     # Schema test → Postgres test
npm run seed             # prisma/seed.ts
```

Détail tests / DB test : [`testing.md`](./testing.md).

## Qualité (Biome)

Config : `biome.json`.

- Tabs, double quotes, semicolons, trailing commas
- `lineWidth: 100`, line endings CRLF
- CSS lint/format **désactivés** — ne pas reformater massivement le CSS
- Commandes : `npm run check` / `lint` / `format`

## Hygiène git

- Ne pas committer `.env`, secrets, `node_modules`, `generated/`, artefacts de build
- Pas de commit / push sans demande explicite
- Diffs focalisés — pas de refactor opportuniste hors scope
