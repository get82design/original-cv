# Patterns API (tRPC) & services

Règles métier (quotas, DL, IA) : [`business-rules.md`](./business-rules.md).  
Modèle Profile/CV : [`data-model.md`](./data-model.md).  
Tests : [`testing.md`](./testing.md).

## Couches

```
UI (trpc.*.useQuery / useMutation)
  → Router  server/api/routers/*.router.ts   (mince)
    → Service  src/services/**              (logique + Prisma)
      → Schema  src/services/schemas/*.schema.ts  (Zod 4)
```

```ts
// ✅ Router mince — auth + input + délégation
export const cvRouter = router({
	create: protectedProcedure
		.input(createCvInputSchema)
		.mutation(({ input, ctx }) =>
			cvService.create({ ...input, userId: ctx.session.user.id }),
		),
});
```

**Ne pas** : Prisma dans les composants ; logique métier lourde dans le router ; `TRPCError` jeté depuis un service (sauf cas rare).

## Procédures (`server/api/trpc.ts`)

| Procédure | Condition |
|-----------|-----------|
| `publicProcedure` | Ouvert (+ middleware erreurs) |
| `protectedProcedure` | Session + `ctx.session.user.id` |
| `adminProcedure` | `UserRole.ADMIN` |

Transformer : SuperJSON.  
Erreurs `AppError` → mappées en `TRPCError` par le middleware (`toTrpcError` / `mapAppError`).

## Ownership & helpers

Sous `server/api/helpers/` :

| Helper | Rôle |
|--------|------|
| `assertCvOwnership` | CV existe + appartient à l’user |
| `assertProfileOwnership` | Idem Profile |
| `getOwnedProfile` | Charge le profile owned |
| `recordTrpcApiError` | Log erreurs API (observabilité) |

Toujours passer `ctx.session.user.id` au service ou vérifier l’ownership **avant** d’agir. Ne pas faire confiance à un `userId` venant du client.

## Carte des routers

Assemblage : `server/api/root.ts` → type `AppRouter`.

| Groupe | Exemples `trpc.*` | Notes |
|--------|-------------------|--------|
| Cœur | `user`, `cv`, `profile`, `color` | Compte, CV agrégé, vivier |
| Templates | `cvTemplate`, `unlockedTemplate` | Catalogue + unlock |
| Modules CV | `cvModule`, `cvModuleItem` | Composition / ordre |
| Entités `cv*` | `cvExperience`, `cvSkill`, … | Contenu instance CV |
| Entités `profile*` | `profileExperience`, … | Contenu vivier |
| Catalogues | `skillBase`, `competenceBase`, `tagBase` | Libellés partagés |
| IA | `ai` | Import, review, rewrite… — quotas serveur |
| Admin | `admin` | `adminProcedure` uniquement |

Nouvelle ressource → schema Zod + service + router mince + enregistrement dans `root.ts` + **test**.

## Services (`src/services/`)

| Dossier | Domaine |
|---------|---------|
| `cv/` | CV, save, template, modules, entités Cv* |
| `profile/` | Profile + entités Profile* |
| `user/` | Compte, crédits DL, grants, plans |
| `ai/` | Gemini, billing IA, quotas import |
| `commons/` | Accès templates, unlocks, couleurs… |
| `admin/` | Stats, crédits, users admin |
| `storage/` | Previews fichier/S3 (éviter data URL en DB) |
| `mail/` | Emails (reset password…) |
| `schemas/` | Zod 4 |
| `errors/` | `AppError` et sous-classes |

Convention : `export class FooService { … }` + `export const fooService = new FooService()`.

## Schemas Zod

- Fichiers : `src/services/schemas/*.schema.ts` (ex. `cvSave.schema`, `cv.schema`, `profileSave.schema`)
- Le router `.input(schema)` ; le service peut re-valider si besoin
- Types inférés pour le form / save côté features

## Erreurs (`src/services/errors`)

| Classe | Usage typique | Code tRPC (via map) |
|--------|---------------|---------------------|
| `NotFoundError` | Ressource absente | `NOT_FOUND` |
| `ForbiddenError` | Ownership / droit | `FORBIDDEN` |
| `ValidationError` | Input / règle métier | `BAD_REQUEST` |
| `ConflictError` | Doublon (grant, email…) | `CONFLICT` |
| `AuthenticationError` | Auth | `UNAUTHORIZED` |
| `TooManyRequestsError` | Rate limit / quotas | `TOO_MANY_REQUESTS` |

- Messages **user-facing en français** (cible projet) ; codes techniques OK en EN (`FORBIDDEN`, `VALIDATION_ERROR`…)
- Pas de catch-all silencieux ; pas d’exposition de stack / secrets au client
- Côté UI : `getClientErrorMessage` ([`frontend.md`](./frontend.md))

## Checklist nouvelle procédure

1. Schema Zod dans `schemas/`
2. Logique + ownership / quotas dans le **service**
3. Router mince avec la bonne procédure (`public` / `protected` / `admin`)
4. Brancher dans `root.ts` si nouveau router
5. Test sous `__tests__/services` ou `__tests__/api`
6. UI : `trpc.<router>.<proc>` + invalidate si besoin
