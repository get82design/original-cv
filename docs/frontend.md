# Frontend

UI React du produit : pages mince → `src/features/*` + composants partagés `src/components/*`.  
Éditeur A4 : [`cv-editor.md`](./cv-editor.md). Libs : [`stack.md`](./stack.md). Style TS/React : [`coding-style.md`](./coding-style.md).

## Carte

```
pages/                    # Pages Router — route + Head, peu de logique
src/features/
  home/                   # Landing
  auth/                   # Login / register UI
  profile/                # Vivier Profile* (FormProfile)
  cv-editor/              # Éditeur A4 (voir cv-editor.md)
  models-list/            # Catalogue templates
  admin/                  # Back-office (ADMIN only)
src/components/           # UI partagée
  input/                  # *Rhf (forms « app »)
  input-writer/           # InputTextCv, InputTextareaCv, calendriers CV…
  dialog/                 # DL, IA, rewrite, review…
  layout/ appBar/ navBar/ brand/ photo/ feedback/ …
```

Bootstrap : `pages/_app.tsx` — `PrimeReactProvider` + `SessionProvider` + `trpc.Provider` + `AppLayout`.

## Data client (tRPC)

- Appels : `trpc.<router>.<proc>.useQuery` / `useMutation`
- Cache : `trpc.useUtils()` pour `invalidate` après mutation
- Types : `@utils/trpc.types` quand disponibles ; sinon `inferRouterOutputs` / schemas
- **Zéro Prisma** dans les composants — toute logique métier passe par l’API

## Forms (react-hook-form)

- Provider + `zodResolver` colocalisés (`FormCv`, `FormProfile`, auth…)
- Lecture / écriture : `useFormContext`, `Controller`, `watch` / `setValue`
- Schemas Zod côté `src/services/schemas/` (pas de validation métier inventée dans l’UI)

| Contexte | Inputs à préférer |
|----------|-------------------|
| Éditeur CV (inline A4) | `InputTextCv`, `InputTextareaCv`, `periode-cv`, inputs `template/.../input-cv` |
| Profile / admin / auth | `InputTextRhf`, `SelectRhf`, `RadioRhf`, etc. (`src/components/input/`) |

Réutiliser un input existant avant d’en créer un nouveau.

## UI kit & styles

- **PrimeReact** + **PrimeIcons** + **Tailwind 4** — pas de MUI / shadcn / autre kit
- Dark mode : classe `dark` sur `<html>` (script FOUC dans `_document.tsx`)
- SCSS ponctuel OK ; Biome **ne formate / ne lint pas** le CSS — pas de reformat massif
- Composants layout : `AppLayout`, `AppBar`, `NavBar`, `SideBarMenu`
- Toasts : PrimeReact `Toast` (souvent `position="top-center"`)

## Erreurs & textes UX

- Labels, toasts, messages user : **français**
- Extraire le message tRPC : `getClientErrorMessage` (`src/utils/clientError.ts`)
- Rate limit : `isTooManyRequestsError`
- Ne pas afficher stacks / codes bruts au user ; les codes techniques restent côté API

## Domaines UI (pointeurs)

| Domaine | Entrée | Notes |
|---------|--------|--------|
| Profile | `features/profile` (`FormProfile`, `compo/*`) | Données `Profile*` — **pas** le CV édité |
| CV editor | `features/cv-editor` | Voir `cv-editor.md` |
| Templates | `features/models-list` | Catalogue / preview ; unlock via tRPC |
| Auth | `features/auth` + pages `login` / `register` / reset | NextAuth session |
| Admin | `features/admin` + `pages/admin/*` | `trpc.admin.*` + `UserRole.ADMIN` uniquement |
| Dialogs partagés | `components/dialog/*` | DL, paiement IA, review, rewrite… |

## Règles

- Une page = composition de features/components ; logique métier dans les services
- Pas de store global ad hoc (Redux/Zustand) — RHF, tRPC, props, context **local** si besoin
- UI **propre** dès le premier jet ; refacto large autour = au cas par cas (demander si doute)
- `useMemo` / `useCallback` seulement si déjà dans la zone ou perf mesurée
- Respecter Profile ↔ CV : ne pas écrire le vivier depuis l’éditeur (sauf flux explicite documenté)
- Quotas / ownership : affichage + appels tRPC seulement — débit **serveur** ([`business-rules.md`](./business-rules.md))
