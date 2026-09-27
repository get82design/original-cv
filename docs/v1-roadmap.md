# Roadmap — finir la V1 efficacement

**Statut** : cible de finition (pas du comportement live).  
**Rule agent** : [`.cursor/rules/10-v1-roadmap.mdc`](../.cursor/rules/10-v1-roadmap.mdc).  
**Todo vivant** : [`TODO.md`](../TODO.md) (à cocher ensemble).  
**Ne pas coder** ce chantier sans demande explicite d’implémentation.

## Principe

Le cœur produit est déjà là (auth, éditeur 1/2 col, save, profil↔CV, modèles, IA import/review/rewrite, DL crédits, admin vie produit).

**V1** = sensation « fini » + pas de feature UI morte + RGPD min + garde-fous DL — **pas** Stripe / abo / PDF serveur.

## Hors V1 (décision explicite)

- DnD 3 zones L/C/R (center) → **V2**
- Fiche métier / match-job → **V2** ; QR réel + page web CV → **V4**
- Stripe, guest, Browserless, slots €, gating options premium → **V3**
- Abos + DL illimités → **V4**
- CRON / plafond IA abo → **V5+**
- Tracker candidatures → parking
- Funnel GA → optionnel V3+

## Header split V1

Une seule composition partagée (tous templates). La variété / options réservées au premium vient **plus tard** (V2 catalogue + V3 gating).

`headerPlacement` est une propriété **figée du template** (seed) : on change de placement en changeant de modèle, pas via un input de l’éditeur. Livré : `headers/HeaderSplit` (sidebar photo + coordonnées, colonne principale nom/prénom + intitulé), `utils/cvHeaderPlacement`, template **Berlin**.

## Ordre d’implémentation (quand demandé)

| Ordre | Item | Notes techniques |
|-------|------|------------------|
| 1 | ~~Header split 2-col~~ **livré** | `headerPlacement: "split"` dans `TwoColumnSideBar` ; slots sidebar + main ; placement figé par le seed (pas d’UI) ; schema `cvTemplate` ; tests `cvHeaderPlacement` |
| 2 | ~~Tips + stubs v2~~ **livré** | `DialogCvTips` (contenu dans `cvTips.ts`, `media` prêt) ouvert depuis le SpeedDial ; QR / fiche métier → label « (bientôt) » + toast |
| 3 | ~~3 footers logo~~ **livré** | `minimal` / `band` / `corners` via `cvSignatureVariants` + `CvSignatureVariantContext` ; choix dans `DialogDownloadCv` ; recapture avec `waitForNextPaint` ; polish UI éventuel plus tard |
| 4 | Garde-fous DL | Modale re-DL &lt; 10 min ; limite ~3 DL / jour / CV (serveur) |
| 5 | Cover letter E2E | `geminiService` + `ai.coverLetter` + billing existant + tests ; brancher le client |
| 6 | RGPD min + SEO light | Delete compte UI ; CGU/privacy ; templates indexables sans migration App Router complète |
| 7 | Freeze admin + smoke | Doc in/out admin ; smoke parcours ; sync canvas / backlog |

**Durée cible** : ~4–6 j de focus une fois le code lancé.

## Admin V1 — freeze

**In** : dashboard, users, downloads, templates, AI events, errors, credit logs, billing *prix*.  
**Out** : ventes Stripe, acquisition GA, funnel visits, IA « query mes data » (RGPD).

## Écarts backlog ↔ code (rappel)

| Story | Note |
|-------|------|
| Undo / historique | Livré (`CvFormHistory`) |
| TwoColumnSideBar + reverse | Livré, header split inclus (`top` / `sidebar` / `split`) |
| Aperçu CV profil | Livré (`PreviewImage`) |
| Lettre motivation | UI + billing ; **pas** d’API Gemini |
| Admin | Socle réel ; pas Stripe/GA |

## Critère de done

Parcours : register → CV 2-col (top / sidebar / **split**) → undo → tips → DL free (3 footers) → garde-fous (modale 10 min / plafond 3/j) → DL paid → review + lettre IA → profil recover CV → suppression compte possible. Aucune entrée menu morte (sauf « bientôt »). Pages légales accessibles.
