# TODO — Original CV

Liste vivante à **alimenter et valider ensemble**.  
Convention : `[ ]` à faire · `[x]` validé (code + accord produit) · `(?)` à trancher.

**Liens** : [roadmap V1](./docs/v1-roadmap.md) · [business rules](./docs/business-rules.md) · canvas avancement (workspace Cursor)

---

## Comment on l’utilise

1. On ajoute / coche ici **avant** de coder un gros morceau.
2. Une ligne = un résultat user-visible (ou une décision doc).
3. Si une ligne bouge de version → on la déplace, on ne la laisse pas en double.
4. L’agent **ne code pas** une section tant qu’on n’a pas dit d’implémenter.
5. **Fin de chaque version** : passer la checklist légal (section dédiée) — light en preprod ; **complète à l’ouverture prod (fin V3)**.

---

## V1 — Finition parcours

Critère done : créer/sauver CV → DL gratuit/payant → IA review/rewrite/lettre — **sans** entrée menu morte (sauf « bientôt ») + **RGPD min**.

### Socle déjà livré (ne pas rouvrir sans bug)

- [x] Back / BDD / services / API / schemas CV & profil
- [x] Login / register (+ providers, mdp oublié)
- [x] Home + catalogue modèles
- [x] Éditeur : créer / save / validation / aperçu / 2 pages
- [x] Layout 1 col + 2 col sidebar (+ reverse)
- [x] Undo / redo (`CvFormHistory`)
- [x] Profil ↔ CV (sync explicite) + aperçu CV profil
- [x] IA : import / relecture / reformulation
- [x] Admin vie produit (dashboard, users, DL, templates, errors, AI logs, prix)

### Éditeur CV — mise en page

- [x] Header split 2-col (`headerPlacement: "split"`) — variantes via `sectionHeader`
	- `HeaderSplitOne` (registre `{ kind: "split", Sidebar, Main }`) ; Berlin seed corrigé
	- `headers/HeaderSplitOne` + `utils/cvHeaderPlacement` (ids de mesure + hauteurs réservées)
	- `headerPlacement` figé par le template : pas d’UI utilisateur (cf. décisions)
	- doc : [`docs/cv-layout-config.md`](./docs/cv-layout-config.md)
- [x] Tests pagination impactés (`cvPage` / packing 2-col) — `cvHeaderPlacement.test.ts`

### Éditeur CV — dock / UX

- [x] Modal « Tips » — `DialogCvTips` + contenu extrait dans `cvTips.ts` (`media` prêt pour les captures)
	- SpeedDial sorti du garde `profile` : seule l’entrée « Données du profil » reste conditionnelle
- [x] QR code → label « (bientôt) » + toast d’info (pas d’action vide) — vraie feature en **V4**
- [x] Fiche métier → label « (bientôt) » + toast d’info (pas d’action vide)

### Téléchargement

- [x] 3 variantes footer / fond logo au DL **gratuit**
	- `minimal` / `band` / `corners` — mention « Édité sur originalcv.fr » (texte noir) + logo teinté
	- décor sous la signature, dans `[data-cv-signature]` (export payant retire tout)
	- logique pure `cvSignatureVariants.ts` + tests ; contexte session (pas de save)
	- `(?)` polish UI des variantes (hauteurs / triangles) — on y revient si besoin
- [x] Choix de la variante dans le dialog DL avant capture preview
	- vignettes CSS ; recapture aperçu avec logo après 2 rAF (`waitForNextPaint`)
- [x] Modale bienveillante si re-DL &lt; 10 min (avertir avant débit)
	- `DialogRecentDownloadWarn` ; flag `recentDownloadWarn` via `getDownloadStatus({ cvId })`
- [x] Limite **~3 téléchargements / jour / CV** (anti-spam / anti-scraping) — assert serveur + message FR
	- fenêtre glissante 24 h ; `assertCvDailyDownloadLimit` + UI `dailyLimitReached`

### IA

- [x] Lettre de motivation bout-en-bout (Gemini + `ai.router` + client + tests)
- [x] Smoke : review + rewrite + lettre avec débit crédits

### RGPD min (obligatoire V1)

- [x] Suppression de compte exposée en UI + cascade réelle (Profile, CV, unlocks, grants…)
- [x] CGU + politique de confidentialité accessibles (même v1 basique)
	- pages `/cgu`, `/politique-de-confidentialite`, `/mentions-legales` ; footer ; case à cocher register (email/password)
	- **À faire** quand OAuth Google/GitHub sera vraiment activé : faire accepter CGU/privacy **avant** `signIn` (aujourd’hui les boutons OAuth bypassent la case)
- [x] Audit rapide : CV public privé par défaut + `noindex` si page publique existe
	- **OK** `isPublic Boolean @default(false)` (Prisma) + tests `__tests__/test-prisma/cv.test.ts`
	- **OK** aucune page publique CV en V1 (`pages/cv/[id]` = éditeur auth) → `noindex` N/A pour l’instant
	- **V4** (page `/cv/[slug]` ou équiv.) : **obligatoire** `<meta name="robots" content="noindex, nofollow">` + partage opt-in seulement
- [x] Stats admin : pas de PII inutile dans les agrégats (revue ; durcissement anonymisation si besoin)
	- **Dashboard** (`adminDashboardService`) : compteurs / `groupBy` (users, DL, IA, templates, couleurs…) — **pas d’emails**
	- **Listes ops** (users, DL, AI events, errors, unlocks, credit logs) : email visible — **volontaire**, réservé `ADMIN` (`adminProcedure`)
	- **V1** : pas d’anonymisation des listes (sinon support inutilisable) ; pas d’IA « query mes data » (freeze admin **out**)
	- Post-delete : events déjà en `SetNull` sur `userId` (lignes « Anonyme » côté UI)

### SEO catalogue (V1 light)

- [x] SEO liste `/modeles` — title / description / OG / Twitter / JSON-LD `CollectionPage` (Pages Router)
- [x] Champ `slug` unique sur `CVTemplate` (+ seed + backfill migration)
- [x] Pages détail `/modeles/[slug]` marketing légère (texte + vignette + CTA) — SSR Pages Router
- [x] `robots.txt` + `sitemap.xml` dynamiques ; `noindex` pages privées + **gate** `SEARCH_INDEXING_ENABLED`
	- défaut = **fermé** (`Disallow: /` + meta `noindex`) jusqu’au feu vert prod
	- ouvrir : `SEARCH_INDEXING_ENABLED=true` (sitemap catalogue + `index,follow` pages marketing)
- [x] **Décision** : pas de migration App Router en V1 — SEO light suffisant en Pages Router
	- cible éventuelle : **V2 hybride** (marketing `app/` d’abord) si besoin DX/RSC — pas un prérequis SEO

### Admin (freeze V1)

- [x] Doc / accord : **in** = dashboard, users, DL, templates, AI events, errors, credit logs, prix
- [x] Doc / accord : **out** = Stripe, GA, funnel visits, IA « query mes data »
- [x] Smoke admin sans ouvrir de nouveau chantier

### Clôture V1

- [x] Smoke parcours complet (voir critère done)
- [x] Checklist légal fin de version — **light** (preprod, pas d’ouverture commerciale)
	- relire CGU / privacy vs produit live ; smoke suppression compte
	- mentions (SIRET / hébergeur), URSSAF, Stripe, cookies analytics → **reportés ouverture prod (fin V3)**
	- placeholders mentions + bandeau amber OK jusqu’à la prod
- [x] Sync canvas + ce fichier
	- carte `avancement-v1.canvas.tsx` recalée 2026-09-29 : V1 freeze (tag v1.0.0) · focus V2

---

## V2 — Enrichissement produit

**Ordre de travail** (validé 2026-09-29) :

1. DnD / layouts 2 cols (`TwoColumnCenter` 50/50 + preuve Vienna) → smoke
2. CRUD couleurs / catalogue admin *(// possible avec 1)*
3. Templates premium puis volume ~25 + logos / couleurs brand
4. Onboarding stepper + opt-out compte · Tips (guide dans `DialogCvTips`) — **livré** ; illustrations → **V3**
5. `match-job` → fiche métier France Travail
6. Smoke + checklist légal light
7. **Fin V2** : App Router hybride + évolution `/modeles/[slug]` *(mini CV ? — à cadrer)*

### Éditeur CV

- [x] `TwoColumnCenter` — 2 colonnes **50 % / 50 %** (≠ SideBar 3/8+5/8)
	- même modèle de colonnes `0` / `1` que `TwoColumnSideBar`
	- template preuve **Vienna** (`HeaderOne` + `headerPlacement: "top"`, sans `sidebarTheme`)
	- doc config : [`docs/cv-layout-config.md`](./docs/cv-layout-config.md)
- [x] Headers split branchés sur `sectionHeader` (`HeaderSplitOne` + registre mono|split) — Berlin corrigé
- [ ] Volume templates (cible ~25 classiques + premium catalogue)
	- inventaire vivant : [`docs/cv-templates-catalog.md`](./docs/cv-templates-catalog.md) (à tenir à jour à chaque seed)
	- création structure = **seeds** pré-prod ; admin = flags catalogue seulement (pas de builder)
- [ ] Premiers templates **premium** basés sur header split / layouts riches
- [ ] Logos / variantes couleurs manquantes (polish brand)
- [x] Onboarding guidé « première utilisation » (stepper) — **≠** modal Tips
	- comptes connectés : checkbox « ne plus afficher » (préférence persistée)
	- `hideCvOnboarding` sur `User` ; auto-open `CvEditor` ; prefs profil pour réactiver
	- contenu : `cvOnboarding.ts` + `DialogCvOnboarding` (5 steps)
- [x] Tips : accès **persistant** au guide onboarding dans `DialogCvTips` (SpeedDial) — **validé**
	- section « Guide de l’éditeur » = même source `CV_ONBOARDING_STEPS` que le stepper
	- conseils rédaction (`cvTips.ts`) + Accordion (1 panneau ouvert)
	- illustrations / captures → **reporté V3** (`public/tips/`, `media` déjà prévu dans `cvTips.ts`)
- [ ] App Router **hybride** (surfaces marketing `app/` d’abord) — **fin V2**
	- lien probable avec `/modeles/[slug]` (ex. mini CV à la place de la vignette) — à trancher au moment du chantier

### Profil

- [x] Recover CV → profil — **socle déjà livré** (`mapCvToProfileFormValues` + action par CV dans `ProfileCvsCard`, header inclus)
- [x] Smoke recover en clôture V2 (régression uniquement si bug remonté) — **validé**

### IA / emploi

- [ ] Comparer à une annonce (`match-job`) — sortir du `comingSoon`
- [ ] Fiche métier France Travail (vraie intégration)

### Admin / ops

- [x] CRUD couleurs / catalogue admin
	- [x] Writes `color.create|update|delete` → `adminProcedure` ; `findAll` reste **public** (éditeur)
	- [x] Page admin UI `/admin/colors` + liens dashboard
	- [x] Reorder `order` (`color.move` up/down)

### Clôture V2

- [ ] Smoke parcours (3-col si livré, DL, IA dont match-job, recover profil)
- [ ] Checklist légal fin de version — **light** (même logique preprod que V1 ; ouverture prod = V3)

---

## V3 — Premier euro (Stripe + vrai PDF)

### Paiements

- [ ] Stripe (packs crédits, unlock €)
- [ ] Webhooks → créditer / débloquer
- [ ] Admin ventes / commandes / refunds (socle)
- [ ] Micro-achat **slot CV** (3 €) / `extraStorageSlots`
- [ ] Guest / sans compte (localStorage, pas de save, paywall DL) — **avec** Stripe

### Infra PDF

- [ ] Browserless (ou équivalent) : HTML → PDF pixel-perfect, **texte sélectionnable ATS**
- [ ] Jobs / timeouts / garde-fous charge

### IA (optionnel V3)

- [ ] `(?)` Persistance BDD des sorties IA (review / lettre / rewrite) pour comptes connectés — sinon reporter **V4** (abo)

### RGPD (V3)

- [ ] Export / portabilité : bouton « Télécharger mes données » (JSON/ZIP profil + CV)
- [ ] Soft-delete compte + délai de grâce **30 j** (réactivation / purge CRON)
- [ ] Admin : compteur **agrégé** de suppressions de compte dans le temps (dashboard)
	- volumes / séries (ex. 7 j, 30 j, total) — **pas** d’identité, email, ni liste nominative
	- peut s’appuyer sur `deletedAt` du soft-delete (ou event anonymisé si besoin)

### Catalogue / assets

- [ ] Regénérer **toutes** les vignettes templates en PNG propres (`public/assets/img/{Name}.png`)
	- aujourd’hui = screenshots à l’arrache (catalogue + fiches `/modeles/[slug]`)
	- cible : rendu A4 cohérent (même jeu de données démo, fond neutre, pas de chrome UI)
	- `(?)` script / export automatisé depuis l’éditeur (html-to-image / Browserless) vs batch manuel soigné
- [ ] Tips : illustrations / captures (`public/tips/`, + `srcDark` si besoin)
	- brancher `media` déjà prévu dans `cvTips.ts` (et éventuellement guide onboarding)
	- enrichissement copy / captures — reporté depuis V2 (socle Tips + accordion **livré**)

### Différenciation templates premium (V3)

Les templates payants pourront exposer des **options** que les gratuits n’ont pas.  
V1 = split partagé ; **gating options = chantier V3** (catalogue / layouts riches en V2 sans assert capabilities).

- [ ] Modèle produit : options `free` vs `premium` (liste figée)
- [ ] Données catalogue : flags / capabilities par template
- [ ] UI éditeur : masquer ou teaser options premium
- [ ] Serveur : assert capabilities au save / download
- [ ] 1–2 templates premium seedés avec options exclusives
- [ ] Tests gating

### Acquisition (optionnel V3)

- [ ] Funnel produit sans GA complet *(reporté depuis V2)*
- [ ] GA4 / Search Console `(?)`
- [ ] Croisement trafic ↔ signups / downloads `(?)`

### Clôture V3

- [ ] Checklist légal **ouverture prod** (mentions remplies, URSSAF, CGU / privacy à jour, Stripe pro, cookies si GA)

---

## V4 — Abonnements & CV en ligne

Package abo = vraie plus-value (récurrence + présence en ligne).

### Abonnements

- [ ] Stripe Billing (Standard / Premium / …) + `subscriptionEnd`
- [ ] Abo actif → **téléchargements illimités** (règle produit à figer dans les services)
- [ ] Portail client Stripe / gestion abo
- [ ] `(?)` Historique IA persisté (si non fait en V3) — réservé éventuellement aux abonnés

### CV en ligne & QR

- [ ] Page publique **mobile-first** (`/cv/[slug]`), pas un PDF A4 sur mobile
- [ ] **RGPD** : meta `noindex, nofollow` sur toute page CV publique (anti-scraping / index Google) — non négociable
- [ ] Packaging FREE vs abo (bandeau « Créé avec… », URL, actions)
- [ ] QR code (génération client) + intégration parcours
- [ ] Masquage optionnel contacts sur version en ligne (premium / abo) `(?)`

### Clôture V4

- [ ] Checklist légal fin de version

---

## V5+ — Quotas abo IA & suite

- [ ] Plafond **30 requêtes IA / mois** pour `PREMIUM_PLUS_IA` + **CRON** reset `iaRequestsUsed`
- [ ] Affinage packaging abo / IA
- [ ] IA admin « insights » — **seulement si OK RGPD** `(?)`

---

## Checklist légal (chaque fin de version)

Contexte : **pas de prod publique avant fin V3**. Preprod sert à figer / faire tester (bugs → v1.1 ou V2).  
**V1–V2 (preprod)** = revue light + smoke delete. **Ouverture prod = clôture V3** = checklist complète.

- [ ] Statut / URSSAF (si monétisation active — **N/A preprod** ; obligatoire à l’ouverture prod)
- [ ] CGU à jour (relire chaque fin de version ; durcir avant prod)
- [ ] Politique de confidentialité à jour (idem)
- [ ] Mentions légales remplies (SIRET, adresse, contact, hébergeur) — **avant ouverture prod**
- [ ] Mentions cookies / traceurs si analytics branchés
- [ ] Compte Stripe pro + CB dédiée (à partir de V3 / ouverture)
- [ ] Parcours suppression compte toujours OK

---

## Parking (après que l’app vive)

- [ ] **Tracker de candidatures** / entretiens (`jobTracker`) — objectif app long terme, **pas** V1–V3
- [ ] …

---

## Décisions validées

| Sujet | Décision |
|-------|----------|
| Header split | Variantes `HeaderSplitOne`… via `sectionHeader` + `headerPlacement: "split"` (plus 1 composition hardcodée) |
| Nommage headers | Cible `Header[Placement]N` ; **pas** de rename massif `HeaderOne`…`Five` ; nouveaux = convention ; migration legacy plus tard si besoin — [`cv-layout-config.md`](./docs/cv-layout-config.md) §3 |
| Placement header | **figé par le template** (seed) — pas de sélecteur utilisateur |
| Options exclusives premium / gating | **V3** (catalogue riche V2 sans gating serveur) |
| Onboarding stepper V2 | **In** + opt-out checkbox compte |
| Tips vs onboarding | **Complémentaires** — stepper 1ère fois ; même guide repris dans `DialogCvTips` (+ conseils) |
| Tips illustrations | **V3** — captures `public/tips/` ; structure `media` déjà en place |
| Recover CV → profil | **Socle livré V1** — smoke clôture V2 si besoin |
| Funnel sans GA | **Reporté V3** |
| App Router hybride + `/modeles/[slug]` | **Fin V2** — mini CV `(?)` à cadrer sur le chantier |
| Cover letter | **API V1** |
| Historique IA en BDD | **V3 (?)** ou **V4** (abo) — session only en V1 |
| Export données (portabilité) | **V3** |
| Soft-delete compte + grâce 30 j | **V3** |
| Stats suppressions compte | **V3** — compteurs agrégés dans le temps (dashboard) ; **pas** de qui / PII |
| DnD / `TwoColumnCenter` | **V2** — 2 cols 50/50 (pas 3 zones) ; doc [`cv-layout-config.md`](./docs/cv-layout-config.md) |
| Guest / localStorage | **V3** (avec Stripe) |
| Modale re-DL &lt; 10 min | **Live** |
| Limite ~3 DL / jour / CV | **Live** (3 / 24 h) |
| Micro-achat slot CV | **V3** (avec Stripe) |
| Browserless / PDF ATS | **V3** |
| Abo + QR + page web CV | **V4** |
| CRON / plafond IA abo | **V5+** (min V4) |
| Tracker candidatures | **Parking** (après V3) |
| RGPD min (delete + CGU) | **V1** |
| OAuth Google/GitHub + acceptation CGU | **Avant activation réelle des providers** (case actuelle = register email only) |
| SEO templates | **V1 light livré** (Pages) ; App Router **pas maintenant** — éventuel V2 hybride |
| Prod publique | **Pas avant fin V3** ; preprod pour tests / bugs (corrections en **v1.1** ou au passage **V2**) |
| Légal | Checklist **fin de chaque version** ; ouverture prod = checklist **complète** à la clôture **V3** |
