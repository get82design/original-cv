# Stack & librairies

Versions indicatives d’après `package.json` — en cas de doute, lire le fichier.

| Domaine | Techno | Notes |
|--------|--------|--------|
| App | Next.js 16 (**Pages Router**), React 19 | Port `3001` (`pages/`, pas App Router) |
| API | tRPC 11 + SuperJSON | Routers `server/api/` |
| Validation | Zod 4 | Schemas `src/services/schemas/` |
| ORM / DB | Prisma 6 + PostgreSQL (`pg`) | Client : `generated/prisma` |
| Auth | NextAuth 4 + Prisma adapter | `UserRole` ≠ `PlanRole` |
| UI | PrimeReact 10, PrimeIcons, Tailwind 4 | Pas de design system parallèle |
| Forms | react-hook-form + `@hookform/resolvers` | |
| Data client | TanStack Query (via tRPC) | `trpc.*.useQuery` / `useMutation` |
| DnD | `@dnd-kit/core`, `sortable`, `@dnd-kit/react` | Éditeur CV / modules |
| IA | `@google/generative-ai` (Gemini) | Quotas / crédits **serveur** |
| PDF / preview | `html-to-image`, `pdfjs-dist`, `unpdf`, `@napi-rs/canvas` | Capture / import |
| Storage | `@aws-sdk/client-s3` | Previews / assets (R2/S3) |
| Email | Resend | |
| Lint / format | Biome 2 | Tabs, double quotes, CRLF, lineWidth 100 |
| Tests | Vitest 4 | `__tests__/` — voir [`testing.md`](./testing.md) |
| Langage | TypeScript 5.9 | `strict` + options strictes du tsconfig |

## Ne pas introduire sans demande explicite

- Autre UI kit (MUI, shadcn, etc.)
- State global type Redux / Zustand
- ORM alternatif
- ESLint à la place de Biome
- Migration Pages Router → App Router (chantier large, hors scope opportuniste)
