# Règles métiers

À faire respecter **côté serveur** (services / routers). L’UI affiche et appelle tRPC ; elle ne débite pas seule.

- Pricing / vision long format : [`readme.md`](../readme.md)
- Modèle (User, grants, events) : [`data-model.md`](./data-model.md)

**Convention de ce doc** : sections principales = **comportement live** (code). Une section finale liste les **cibles produit** pas encore (ou partiellement) codées — ne pas les traiter comme des invariants serveur.

## Plans & rôles

| Enum | Valeurs | Rôle |
|------|---------|------|
| `PlanRole` | `FREE` \| `STANDARD` \| `PREMIUM` \| `PREMIUM_PLUS_IA` | Offre / abonnement |
| `UserRole` | `USER` \| `ADMIN` | Accès applicatif — **indépendant** du plan |

- Admin : `adminProcedure` (`server/api/trpc.ts`) — pas de confusion avec un plan premium.
- Champs User liés : `plan`, `subscriptionEnd`, `customerId` (Stripe futur), `maxCvs`, crédits DL, `iaRequestsUsed` / `lastIaReset`.
- V1 : le **pay-per-use** (crédits DL + IA facturée) est le chemin principal. L’UI admin abo est encore partiellement gelée — ne pas inventer un débit « abo illimité » sans le lire dans le service.

## Stockage CV

- Quota : `user.maxCvs` (défaut schema : `1`)
- Avant création / save créateur : `userService.canCreateCv` → `cvCount < user.maxCvs`
- Services : `cvService` / `cvSaveService` s’appuient sur ce check

## Téléchargements PDF (live)

Deux stocks distincts sur `User` :

| Champ | Usage |
|-------|--------|
| `freeDownloadsRemaining` | Export **avec logo** (gratuit / cadeaux) |
| `downloadCredits` | Export **sans logo** (payant / packs) |

Flux serveur (`userService`) :

- Statut UI : `getDownloadStatus` (optionnel `cvId` → garde-fous)
- Débit free : `consumeFreeDownload` → `-1 freeDownloadsRemaining` + `DownloadEvent` (`WITH_LOGO`)
- Débit paid : `consumePaidDownload` → `-1 downloadCredits` + `DownloadEvent` (`WITHOUT_LOGO`)
- Avant débit : `templateAccessService.assertCanDownloadTemplate` si template premium
- Garde-fous (`downloadGuards.ts`, si `cvId`) :
  - Modale client si dernier DL du CV &lt; 10 min (`recentDownloadWarn`)
  - Plafond serveur **3 DL / 24 h / CV** (`assertCvDailyDownloadLimit`)

### Cadeaux (`DownloadGrant`)

- One-shot : `@@unique([userId, reason])` — pas de double cadeau
- Raisons code : `PROFILE_CREATED` \| `TEMPLATE_PURCHASED` \| `FIRST_CV_SAVED`
- API : `userService.grantFreeDownload(userId, reason, amount?)`

### Templates premium au téléchargement

- Création / édition d’un CV sur template premium **actif** : autorisée
- **Download** d’un premium sans `UnlockedTemplate` : refusé (`PREMIUM_LOCKED`)
- Détail règles catalogue : `src/services/commons/templateAccess.ts` + `templateAccessService`

## IA (live)

Features (`AiFeature`) : `IMPORT_CV` \| `REVIEW_CV` \| `REWRITE_SECTION` \| `COVER_LETTER`

### Import CV (`IMPORT_CV`)

- Pas de débit `AiFeaturePrice` — quotas fenêtres glissantes (`src/services/ai/cvImportQuota.ts`) :

| Fenêtre | Max |
|---------|-----|
| 24 h | 2 |
| 7 j | 5 |
| 30 j | 10 |

- Check **avant** Gemini : `assertCvImportQuota` ; succès → log `AiEvent` (`IMPORT_CV`)

### Features facturées (crédits)

- `REVIEW_CV`, `REWRITE_SECTION`, `COVER_LETTER` via `aiBillingService`
- Tarifs DB : `AiFeaturePrice` (`costFree` / `costPaid`, null = option absente)
- Paiement : `AiPaymentMethod` `FREE` → consomme `freeDownloadsRemaining` ; `PAID` → `downloadCredits`
- Pattern : `assertCanPay` **avant** l’appel ; `consumeAndLog` **après** succès (re-check solde + `AiEvent` + incrément `iaRequestsUsed`)
- **Jamais** débiter uniquement côté client

### Compteur IA user

- `iaRequestsUsed` incrémenté sur usages logués / billables
- `resetIaRequests` / `lastIaReset` existent (admin / reset manuel) — le plafond mensuel produit n’est pas un garde-fou dur partout (voir cibles)

## Templates catalogue (live)

`CVTemplate` :

- `isActive` — catalogue / création vers ce modèle
- `isPremium` — unlock requis au **download**
- `priceCents` / `priceCredits` / `unlockGifts` (JSON cadeaux)
- `isFeatured` / `sortOrder`

Unlock : `UnlockedTemplate` + `UnlockMethod` (`GIFT` \| `CREDITS` \| `STRIPE`)  
Service : `unlockedTemplateService` (achat crédits, gifts, etc.)

Noms produit (Kyoto, Berlin…) : vision / catalogue — voir `readme.md`, pas de logique métier hardcodée sur les noms.

## CV public / QR / RGPD (live)

- Défaut : `isPublic: false` ; partage opt-in (`publicSlug`)
- Page publique : viser `noindex`
- QR : côté client (pas d’API payante dédiée)
- Suppression compte : cascades Prisma (Profile, CV, grants, unlocks…) ; events en `SetNull` où prévu
- Stats admin : agréger `DownloadEvent` / `AiEvent` (pas de PII fantôme)

## Services / fichiers clés

| Domaine | Où |
|---------|-----|
| Quotas CV / DL / grants | `src/services/user/userService.ts` |
| Accès template | `templateAccess.ts`, `templateAccessService.ts`, `unlockedTemplateService.ts` |
| Billing IA | `src/services/ai/aiBillingService.ts` |
| Quota import | `src/services/ai/cvImportQuota.ts` |
| Admin crédits / users | `src/services/admin/*` |

## Cibles produit (non garanties par le code)

Ne pas implémenter / affirmer comme déjà vrai sans re-vérifier :

| Cible | Statut typique |
|-------|----------------|
| Abo actif (`plan !== FREE` + `subscriptionEnd > now`) → DL **illimités** | Vision `readme` ; débit DL actuel = crédits |
| Modale si re-DL &lt; 10 min | **Live** — `DialogRecentDownloadWarn` + `recentDownloadWarn` |
| ~3 DL / jour / CV anti-abus | **Live** — 3 / 24 h glissantes (`downloadGuards`) |
| `PREMIUM_PLUS_IA` : plafond **30**/mois + CRON reset `iaRequestsUsed` | **V5+** (min V4) — compteur existe ; plafond/CRON à figer |
| Webhooks Stripe (packs, abo) | **V3** packs / unlock ; **V4** abos |
| Différenciation bandeau / URL publique par plan | **V4** (package abo + CV en ligne) |
| Finition V1 (header split, tips, footers logo, cover letter, freeze admin, RGPD min, 3 DL/j, modale 10 min) | Voir `docs/v1-roadmap.md` + `TODO.md` — hors scope tant que non demandé |
| Options / layouts **exclusifs** aux templates premium (vs gratuits) | Cible **avant fin V3** — voir `TODO.md` ; V1 = split partagé, pas de gating options |
| Guest / localStorage + paywall | **V3** avec Stripe |
| Tracker candidatures | Parking — après que l’app vive |

Quand une cible est codée : la monter dans les sections live et retirer / réduire ici.
