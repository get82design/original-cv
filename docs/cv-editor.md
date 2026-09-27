# Éditeur CV

Éditeur A4 WYSIWYG sous `src/features/cv-editor/`.  
Dualité Profile ↔ CV : voir [`data-model.md`](./data-model.md). Quotas DL / IA : [`business-rules.md`](./business-rules.md).

## Carte des dossiers

```
src/features/cv-editor/
  CvEditor.tsx              # Shell UI : layouts, dock, dialogs DL/IA/profil
  mapCvToSaveInput.ts       # Form / CV API → payload trpc.cv.save
  component/
    form/                   # FormCv (RHF), save, import, mapProfile*
    kit-dnd/                # Layouts 1 col / 2 cols + shared pagination/DnD
    template/
      components/*          # Sections UI + init*.ts
      register/*            # Branchement template → composant
    custom-cv-input/        # Dock mise en page + panels
    context/                # CreateCv, ModelAndColor, AiAdvice
    dialog/                 # Dialogs éditeur (profil, limite CV…)
  utils/                    # cvPage, preview, fields/, template, IA helpers
```

Flux simplifié :

```
FormCv (RHF + CvFormValues)
  └─ CvEditor (rendu A4 + dock + dialogs)
       └─ save : mapFormToSaveInput → trpc.cv.save
            └─ captureCvPreview → trpc.cv.setPreview
```

## État formulaire & save

- Schema form : `CvFormValues` (`src/services/schemas/cvSave.schema`)
- Provider : `component/form/FormCv.tsx` (`FormProvider` + `zodResolver`)
- Chargement : `trpc.cv.byId` si `idCv !== "0"` ; sinon guest draft (`utils/guestCvDraft.ts`)
- Mapping DB → form : `mapCvToSaveInput` ; form → API : `mapFormToSaveInput`
- Déclenchement save depuis le dock : `CvFormSaveContext` (`requestSave`)
- Mutations : `trpc.cv.save`, puis `trpc.cv.setPreview` (aperçus logo / clean)
- Template : `applyTemplateToForm` / `switchTemplate` ; cache `utils/templateCache.ts`

## Page A4 & pagination

Fichier : `utils/cvPage.ts`

| Symbole | Rôle |
|---------|------|
| `CV_PAGE_WIDTH` / `CV_PAGE_HEIGHT` | 940×1300 px |
| `CV_PAGE_PAD_PX` | Padding sm/md/lg (lié aux marges UI) |
| `CV_SIGNATURE_RESERVE_PX` | Réserve bas de page (`CvSignature`) |
| `cvPageContentHeight(marge)` | Hauteur utile hors padding + signature |
| `packSectionsIntoPages` | Répartition sections → pages (header page 1) |
| `mergeTwoColumnPages` | Fusion flux sidebar / main → feuilles |

Mesure & shell :

- `kit-dnd/shared/useElementHeights` — hauteurs sections mesurées
- `kit-dnd/shared/useCvPageScrollLock` — lock scroll pendant DnD / pagination
- `kit-dnd/shared/CvPageShell` — cadre page A4

**Ne pas** changer les constantes / algos de page sans mettre à jour `__tests__/features/cv-editor/cvPage.test.ts`.

## Layouts DnD

- 1 colonne : `kit-dnd/one-column-model/OneColumnModel`
- 2 colonnes : `kit-dnd/two-columns-model/TwoColumnSideBar` (+ main)
- Placement header 2 cols (`layout.headerPlacement`) : `top` (pleine largeur, hors flux colonnes), `sidebar`, `split` (photo/identité en sidebar + intitulé/contacts en colonne principale, composition partagée `headers/HeaderSplit`) — ids de mesure et hauteurs réservées dans `utils/cvHeaderPlacement.ts`
- `headerPlacement` est **figé par le template** (seed `defineTemplate`) : pas d’input utilisateur, on change de placement en changeant de template
- Choix layout : `kit-dnd/register/PageLayoutRegister`
- Shared : `ColumnDropZone`, `SectionSortableContext`, `useCvPageDnd`, `useCvSectionItems`, `SectionCatalog`
- Ordre modules actifs : `@/utils/moduleOrder` (`compactActiveOrders`, `nextActiveOrderInColumn`…)

Règle : **préserver** dnd-kit et l’ordre `CVModule` / `CVModuleItem` — ne pas réécrire le flow from scratch.

## Sections template — pattern à imiter

Pour un domaine (ex. formation, experience) :

| Couche | Emplacement | Rôle |
|--------|-------------|------|
| Defaults | `template/components/<domaine>/init*.ts` | Valeurs initiales / factory |
| UI section | `template/components/<domaine>/Section*` + cards / `*Dnd` | Rendu + édition inline |
| Register | `template/register/<domaine>/*Register.tsx` | Branche le variant template |
| Field paths | `utils/fields/fieldName*.ts` | Chemins RHF stables |

Partagé :

- Inputs : `template/components/input-cv/*`
- Commons : `template/components/common-compo/*` (shells section, listes…)
- Header : `template/components/headers/*` + `register/header/`

Nouvelle section → **imiter** un domaine voisin (`init` + `register` + `Section` + `fieldName*`), ne pas inventer un autre pattern.

## Mise en page / dock

- Dock : `custom-cv-input/CvModifDock.tsx` (appelle `useCvFormSave`)
- Mise en page globale : `custom-cv-input/mise-en-page/` (`GeneralPhoto`, `GeneralFont`, `GeneralMarge`, `GeneralSpace`, `GeneralSidebar`, titres section…)
- Panels item : `custom-cv-input/panel-modif/` (align, size, color, show/hide…)
- Sections inactives : `SectionNoUse` ; template : `SelectTemplate`

Contexts :

- `CreateCvContext` — sélection éditeur / clear selection
- `ModelAndColorContext` — modèles & couleurs catalogue
- `AiAdviceContext` — conseils IA dans le dock

## Flux annexes (pointeurs)

| Flux | Entrées clés |
|------|----------------|
| Depuis profil | `DialogDataFromProfile` + `mapProfileToCvDatas` |
| Import PDF | `DialogImportReview` + `mapImportDraftToCvDatas` / `applyImportDraftToForm` |
| Review IA | `flattenCvFormToText` → dialogs review |
| Rewrite section | `extractCvSectionForRewrite` + `applyCvRewriteToForm` |
| Download | `DialogDownloadCv` + `captureDownloadPreviews` (`captureCvPreview`) |
| Template lock | `utils/isTemplateLocked` (accès premium — règles serveur ailleurs) |

## Règles

- Profile = vivier ; CV = sélection affichée — **ne pas fusionner** les modèles
- Sync Profile → CV seulement via flux explicite (dialogs / import), pas en silence
- Préserver dnd-kit + ordre modules/items
- Constantes / pagination A4 → tests `cvPage` obligatoires
- Quotas / ownership / débits : **côté serveur** ; l’UI ne fait qu’appeler tRPC + dialogs

## Tests

Dossier : `__tests__/features/cv-editor/`

| Fichier | Couvre |
|---------|--------|
| `cvPage.test.ts` | Dimensions, pack, merge 2 cols |
| `cvHeaderPlacement.test.ts` | Ids de mesure + hauteurs header top / sidebar / split |
| `mapToCvSaveInput.test.ts` | Mapping save |
| `mapImportDraftToCvDatas.test.ts` | Import → form |
| `applyCvRewriteToForm.test.ts` | Application rewrite |
| `extractCvSectionForRewrite.test.ts` | Extraction section |
| `flattenCvFormToText.test.ts` | Texte pour review IA |
| `fileToBase64.test.ts` | Upload / import PDF |
