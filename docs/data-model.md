# Modèle de données

Schéma source : `prisma/schema.prisma`.  
Après changement de schéma : `npm run db:generate` (+ `db:migrate` si besoin).  
Client app : `lib/prisma.ts` → `generated/prisma` (**ne pas éditer à la main**).

## Vue d’ensemble

```
User (1)
 ├─ Profile (0..1)          ← vivier de données réutilisable
 └─ CV[] (0..N)             ← instances affichables (template + layout + modules)
      ├─ CVTemplate (N:1)
      ├─ CVModule[] → CVModuleItem[]
      └─ entités Cv* (contenu du CV)
```

- **Profile** : données personnelles et parcours, **indépendantes** d’un CV précis.
- **CV** : une mise en page + un template + une sélection de contenu `Cv*` + composition `CVModule`.
- Un user a **au plus un** Profile (`userId` unique) et **plusieurs** CV (quota `user.maxCvs`).

## Dualité Profile ↔ CV

Principe : le Profile est le **vivier** ; le CV est une **copie / sélection affichée**.  
Modifier un `Cv*` ne doit pas écraser silencieusement le Profile (et inversement), sauf flux métier explicite (import, sync, « ajouter depuis le profil »).

### Paires complètes

| Domaine | Profile (vivier) | CV (instance) | Notes |
|---------|------------------|---------------|--------|
| Identité / header | champs sur `Profile` (`firstName`, `lastName`…) | `CvHeader` | Header **uniquement** côté CV ; pas de `ProfileHeader` |
| Description | `Description` (1:1 Profile) | `CvDescription` (1:1 CV) | |
| Expérience | `Experience` + `MissionExperience` | `CvExperience` + `CvMissionExperience` | |
| Formation (diplômes) | `Education` | `CvEducation` | `obtained` : `CvTimelineStatus` |
| Formation (autre) | `Formation` | `CvFormation` | Domaine distinct de `Education` |
| Projet | `Project` + `MissionProject` | `CvProject` + `CvMissionProject` | |
| Bénévolat | `Volunteering` + `MissionVolunteering` | `CvVolunteering` + `CvMissionVolunteering` | |
| Publication | `Publication` | `CvPublication` | |
| Réalisation | `Achievement` | `CvAchievement` | |
| Force / atout | `Strength` | `CvStrength` | |
| Stats / En nombres | `Stat` | `CvStat` | `label` + `value` (string) |
| Expertise | `Expertise` | `CvExpertise` | |
| Prix | `Prize` | `CvPrize` | |
| Certification | `Certification` | `CvCertification` | |
| Langue | `Language` | `CvLanguage` | |
| Passion | `Passion` | `CvPassion` | |
| Réseaux | `SocialMedia` | `CvSocialMedia` | |
| Philosophie | `Philosophy` (1:1) | `CvPhilosophy` (1:1) | |
| Skills (groupés) | `ProfileSkillGroup` → `ProfileSkill` | `CvSkillGroup` → `CvSkill` | Libellés via catalogue `Skill` |
| Compétences (groupées) | `ProfileCompetenceGroup` → `ProfileCompetence` | `CvCompetenceGroup` → `CvCompetence` | Catalogue `Competence` |
| Tags (groupés) | `ProfileTagGroup` → `ProfileTag` | `CvTagGroup` → `CvTag` | Catalogue `Tag` |

### Cas particuliers

- **Catalogues partagés** : `Skill`, `Competence`, `Tag` — noms uniques globaux, liés aux deux côtés (Profile et CV).
- **Groupes** : skills / compétences / tags passent par un niveau Groupe (`*Group`) + items ordonnés.
- **Missions** : expériences, projets et bénévolats ont des sous-items `Mission*` / `CvMission*`.
- **`settings Json?`** : présent sur beaucoup d’entités `Cv*` (et modules) pour styles / affichage éditeur — ne pas confondre avec le contenu métier.
- **Enums utiles** : `Level` (niveaux), `CvTimelineStatus` (`COMPLETED` | `ABANDONED` | `INTERRUPTED`).

## Composition d’un CV

### `CVModule`

- Une section du CV : `type` (`CVModuleType`), `column`, `order`, `isActive`, `settings`.
- Contraintes : un type de module **unique par CV** ; ordre unique par `(cvId, column, order)`.

### `CVModuleItem`

- Pointe vers une entité `Cv*` via `itemType` (`CVModuleItemType`) + `itemId`.
- Ordonne les items **dans** le module (`order`).
- C’est la source de vérité pour **ce qui est affiché / ordonné** sur le CV ; les tables `Cv*` portent le **contenu**.

### Layout & style

- `CV.layoutGeneral` (JSON) : mise en page globale (marges, styles par défaut, etc.).
- `CV.primaryColorName` : dénormalisé depuis le layout — stats admin / downloads.
- Template : `CVTemplate.structure` + `defaultStyles` (JSON).

## Champs CV notables

| Champ | Rôle |
|-------|------|
| `status` | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` |
| `isPublic` / `publicSlug` | Partage public (défaut privé) |
| `isDefault` | CV par défaut du user |
| `previewUrl` / `previewUrlClean` | Aperçus fichier/S3 (avec / sans logo) — pas de data URL persistée |
| `pdfUrl` / `pdfVersion` / `pdfGeneratedAt` | Export PDF |
| `photo` | Photo spécifique au CV (distincte de `Profile.photo`) |

## Templates & unlock

- `CVTemplate` : catalogue (`isPremium`, `priceCents`, `priceCredits`, `unlockGifts`, `isActive`, `sortOrder`…).
- `UnlockedTemplate` : accès user ↔ template (`UnlockMethod` : `GIFT` \| `CREDITS` \| `STRIPE`), unique `(userId, templateId)`.
- Règles d’accès produit : voir `docs/business-rules.md`.

## Hors dualité (User, billing, events)

Résumé — détail quotas / monétisation : [`business-rules.md`](./business-rules.md).

| Zone | Modèles |
|------|---------|
| Auth | `Account`, `Session`, `PasswordResetToken` |
| User / plan | `User` (`PlanRole`, `UserRole`, `maxCvs`, crédits DL, quotas IA) |
| Downloads | `DownloadGrant`, `DownloadEvent`, `DownloadVariant` |
| IA | `AiEvent`, `AiFeature`, `AiFeaturePrice`, `AiPaymentMethod` |
| Crédits admin | `CreditPack`, `AdminCreditLog`, `AdminCreditKind` / `Reason` |
| Observabilité | `ApiErrorEvent` |
| UI couleurs | `Color` |

## Prisma client — pièges

- Noms générés : `prisma.cV`, `prisma.cVTemplate`, `prisma.cVModule`… — **ne pas inventer** `prisma.cv`.
- Ownership toujours via `userId` (CV) ou `profile.userId` — helpers `assertCvOwnership` / `assertProfileOwnership`.
- Suppression compte : cascades Prisma sur Profile / CV / grants / unlocks ; events en `SetNull` où prévu.
