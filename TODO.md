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
5. **Fin de chaque version** : passer la checklist légal (section dédiée).

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

- [x] Header split 2-col (`headerPlacement: "split"`) — **1 composition** partagée
	- sidebar : photo + coordonnées · colonne principale : nom / prénom + intitulé
	- `headers/HeaderSplit` + `utils/cvHeaderPlacement` (ids de mesure + hauteurs réservées)
	- placement **figé par le template** : pas d’UI utilisateur (cf. décisions)
	- template vitrine seedé : **Berlin** (`two-columns/berlin.ts`)
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

- [ ] Suppression de compte exposée en UI + cascade réelle (Profile, CV, unlocks, grants…)
- [ ] CGU + politique de confidentialité accessibles (même v1 basique)
- [ ] Audit rapide : CV public privé par défaut + `noindex` si page publique existe
- [ ] Stats admin : pas de PII inutile dans les agrégats (revue ; durcissement anonymisation si besoin)

### SEO catalogue (V1 light)

- [ ] Pages templates **indexables** / SEO-friendly — **sans** migration complète App Router
- [ ] `(?)` Migration App Router complète → plutôt V2 si trop gros pour V1

### Admin (freeze V1)

- [ ] Doc / accord : **in** = dashboard, users, DL, templates, AI events, errors, credit logs, prix
- [ ] Doc / accord : **out** = Stripe, GA, funnel visits, IA « query mes data »
- [ ] Smoke admin sans ouvrir de nouveau chantier

### Clôture V1

- [ ] Smoke parcours complet (voir critère done)
- [ ] Checklist légal fin de version
- [x] Sync canvas + ce fichier
	- carte `avancement-v1.canvas.tsx` recalée sur ce TODO (2026-09-28)

---

## V2 — Enrichissement produit

### Éditeur CV

- [ ] DnD 3 zones (left / **center** / right)
- [ ] Volume templates (cible ~25 classiques + premium catalogue)
- [ ] Premiers templates **premium** basés sur header split / layouts riches
- [ ] Logos / variantes couleurs manquantes (polish brand)
- [ ] `(?)` Onboarding guidé « première utilisation » (stepper) — distinct du modal Tips (`DialogCvTips`)
- [ ] Tips illustrés : captures dans `public/tips/` (+ `srcDark` si besoin) — `media` déjà prévu dans `cvTips.ts`, contenu à écrire ensemble
- [ ] `(?)` App Router SEO catalogue si non fait en V1 light

### Profil

- [ ] Polish recover CV → profil (all CV / header si encore manquant) `(?)`

### IA / emploi

- [ ] Comparer à une annonce (`match-job`) — sortir du `comingSoon`
- [ ] Fiche métier France Travail (vraie intégration)

### Admin / ops

- [ ] CRUD couleurs / catalogue admin
- [ ] Funnel produit sans GA complet `(?)`

### Clôture V2

- [ ] Checklist légal fin de version

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

### Différenciation templates premium (avant fin V3)

Les templates payants pourront exposer des **options** que les gratuits n’ont pas.  
V1 = split partagé ; **gating options avant fin V3**.

- [ ] Modèle produit : options `free` vs `premium` (liste figée)
- [ ] Données catalogue : flags / capabilities par template
- [ ] UI éditeur : masquer ou teaser options premium
- [ ] Serveur : assert capabilities au save / download
- [ ] 1–2 templates premium seedés avec options exclusives
- [ ] Tests gating

### Acquisition (optionnel V3)

- [ ] GA4 / Search Console `(?)`
- [ ] Croisement trafic ↔ signups / downloads `(?)`

### Clôture V3

- [ ] Checklist légal fin de version (URSSAF, CGU à jour, compte Stripe pro, etc.)

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

- [ ] Statut / URSSAF (si monétisation active sur cette version)
- [ ] CGU à jour
- [ ] Politique de confidentialité à jour
- [ ] Mentions cookies / traceurs si analytics branchés
- [ ] Compte Stripe pro + CB dédiée (à partir de V3)
- [ ] Parcours suppression compte toujours OK

---

## Parking (après que l’app vive)

- [ ] **Tracker de candidatures** / entretiens (`jobTracker`) — objectif app long terme, **pas** V1–V3
- [ ] …

---

## Décisions validées

| Sujet | Décision |
|-------|----------|
| Header split V1 | **1 composition** partagée |
| Placement header | **figé par le template** (seed) — pas de sélecteur utilisateur |
| Options exclusives premium | **Avant fin V3** |
| Cover letter | **API V1** |
| Historique IA en BDD | **V3 (?)** ou **V4** (abo) — session only en V1 |
| DnD center | **V2** |
| Guest / localStorage | **V3** (avec Stripe) |
| Modale re-DL &lt; 10 min | **Live** |
| Limite ~3 DL / jour / CV | **Live** (3 / 24 h) |
| Micro-achat slot CV | **V3** (avec Stripe) |
| Browserless / PDF ATS | **V3** |
| Abo + QR + page web CV | **V4** |
| CRON / plafond IA abo | **V5+** (min V4) |
| Tracker candidatures | **Parking** (après V3) |
| RGPD min (delete + CGU) | **V1** |
| SEO templates | **V1 light** ; App Router complet si besoin en V2 |
| Légal | Checklist **fin de chaque version** |
