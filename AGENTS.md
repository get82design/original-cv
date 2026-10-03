# Original CV — Guide Agent Cursor

SaaS d’aide à la recherche d’emploi : éditeur CV A4, profil, templates, PDF, IA (Gemini), admin.

**Stack** : Next.js 16 (Pages Router), React 19, tRPC, Prisma, PrimeReact — détail [`docs/stack.md`](./docs/stack.md).

**Principes** : pay-per-use + abos optionnels ; friction bienveillante ; RGPD strict ; quotas / ownership **côté serveur**.

## Règles actives

Les garde-fous actionnables sont dans [`.cursor/rules/`](./.cursor/rules/).  
Détails : [`docs/`](./docs/README.md) · pricing / roadmap : [`readme.md`](./readme.md).

| Besoin | Doc |
|--------|-----|
| Stack / libs | [docs/stack.md](./docs/stack.md) |
| Dossiers / scripts | [docs/architecture.md](./docs/architecture.md) |
| Plans, DL, IA, RGPD | [docs/business-rules.md](./docs/business-rules.md) |
| Profile / CV / Prisma | [docs/data-model.md](./docs/data-model.md) |
| tRPC / services | [docs/api-patterns.md](./docs/api-patterns.md) |
| Éditeur A4 / DnD | [docs/cv-editor.md](./docs/cv-editor.md) |
| Layout / headers (config) | [docs/cv-layout-config.md](./docs/cv-layout-config.md) |
| Catalogue templates (inventaire + typo seed) | [docs/cv-templates-catalog.md](./docs/cv-templates-catalog.md) · rule `11-cv-templates-seed` |
| UI / forms | [docs/frontend.md](./docs/frontend.md) |
| Vitest | [docs/testing.md](./docs/testing.md) |
| Style de code | [docs/coding-style.md](./docs/coding-style.md) |
| Efficacité avec l’agent | [docs/working-with-agent.md](./docs/working-with-agent.md) |
| Rôle / clarté / données | [docs/agent-behavior.md](./docs/agent-behavior.md) |
| Finition V1 (périmètre) | [docs/v1-roadmap.md](./docs/v1-roadmap.md) · rule `10-v1-roadmap` · [`TODO.md`](./TODO.md) |

## Do / Don’t

**Do** : service + schema + router + **test obligatoire** ; UI propre ; commentaires / erreurs services en français ; diffs focalisés ; réponses claires ; séparer données et instructions.  
**Don’t** : contourner auth/ownership ; débiter crédits côté client seul ; réécrire l’éditeur from scratch ; toucher `generated/prisma` ; committer sans demande ; ajouter deps lourdes sans besoin ; livrer de la logique sans test ; inventer l’état du code sans le lire.
