# Style de code (préférences projet)

Objectif : coller au style existant du repo, pas à un style « générique IA ».  
Quand un fichier voisin a déjà une convention, **la suivre**.

## Préférences validées

| Sujet | Règle |
|-------|--------|
| Commentaires | Oui, en **français**, utiles (pas narratifs) |
| Tests | **Obligatoires** pour tout changement de logique / service / règle métier |
| Messages d’erreur services | **Français** (codes `AppError` peuvent rester EN) |
| Nommage | Garder le franglais existant (`formation`, `competence`, `mise-en-page`…) |
| Fichiers gros | Découper **seulement** si vraiment trop gros / illisible |
| UI | Version **propre** dès le premier jet ; refacto autour = au cas par cas (demander si doute) |

## Imports & aliases

- Préférer `@/` pour `src/`, `@utils/`, `@server/`, `@generated/`
- `import type { … }` pour les types (`verbatimModuleSyntax`)
- Biome `organizeImports` : **obligatoire** — après édition d’imports, passer `npx biome check --write <fichier>` (ou `npm run check:fix`) ; ne pas inventer un ordre manuel

## TypeScript

- `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` : gérer `undefined` explicitement
- Pas de `any` nouveau ; typage via schemas Zod / types Prisma / `@utils/trpc.types`
- Props : `interface XxxProps` colocalisée en haut du fichier (sauf type partagé réutilisé)
- Prefer `as const` / unions littérales plutôt que magic strings dispersées

## Exports & naming

- Composants : `export const Foo = (…) => { … }` (majoritaire) — `export function` OK si fichier voisin l’utilise
- Services : `export class FooService { … }` + `export const fooService = new FooService()`
- Factories / inits : `createInitFormation`, `createInit…`
- Noms de domaine FR existants à **conserver** : ne pas angliciser en masse
- Fichiers : PascalCase composants (`GeneralPhoto.tsx`), camelCase utils/services (`cvPage.ts`, `cvSaveService.ts`)

## React / UI

- Composants fonctionnels uniquement
- Forms CV / profile : **react-hook-form** (`useFormContext`, `Controller`) + inputs partagés (`InputTextCv`, `*Rhf`)
- UI : **PrimeReact** + Tailwind ; pas de nouveau kit
- Livrer une UI **propre** (structure claire, réutilisation des composants existants)
- Refacto élargi autour du change : **seulement** si pertinent au cas — sinon proposer / demander
- Props drilling / context local OK ; pas de store global ad hoc
- `useMemo` / `useCallback` : **seulement** si déjà présent dans la zone ou perf mesurée — pas par défaut

## Couches (rappel)

```
UI (features/components)
  → trpc.*.useQuery/useMutation
    → router mince (server/api/routers)
      → service (src/services) + schema Zod
```

- **Zéro Prisma** dans les composants React
- Erreurs métier via `src/services/errors` (pas de `TRPCError` dans les services)
- Messages : `"Ce CV ne vous appartient pas"`, `"Limite de CV atteinte"` — **pas** `"Not your CV"`

## Messages & commentaires

- Labels / UX UI : **français**
- Messages d’erreur services & user-facing : **français**
- Codes techniques OK en EN (`FORBIDDEN`, `CV_ALREADY_EXISTS`…)
- Commentaires : en **français**, quand ils apportent du contexte (pourquoi, contrainte métier)
- Pas de commentaires qui répètent le code ; pas de JSDoc longs sauf API non évidente

## Fichiers & découpage

- Préférer étendre le fichier / service existant
- Découper si le fichier devient vraiment trop gros (lisibilité, responsabilités mélangées)
- Ne pas créer 5 micro-fichiers pour une petite feature

## Diffs & scope

- Changer ce qui est demandé, proprement
- Nouvelle feature métier : schema Zod → service → router → UI → **test**
- Ne pas « améliorer » Biome/format hors fichiers touchés
- Ne pas renommer massivement pour « nettoyer »

## Anti-patterns à éviter

- Contourner ownership / quotas côté client
- Dupliquer une logique déjà dans un service / util (`cvPage`, `moduleOrder`, `fieldName*`)
- Introduire une abstraction prématurée (wrapper générique pour 1 usage)
- Réécrire un flow DnD / pagination A4 from scratch
- Persister des data URLs si le flux storage fichier/S3 existe
- Livrer du code sans test alors qu’il y a de la logique

## Checklist avant de proposer du code

1. Y a-t-il déjà un fichier / service / input qui fait la même chose ?
2. Le change respecte-t-il Profile ↔ Cv (dualité) ?
3. Auth / ownership / quotas côté serveur OK ?
4. Types stricts sans `!` abusifs ni `any` ?
5. Erreurs / commentaires en français ?
6. **Test ajouté ou mis à jour** ?
