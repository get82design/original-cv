# Configuration layout / headers CV

Doc **vérifiée dans le code** (pas de cible produit inventée).  
Sources : `cvTemplate.schema.ts`, layouts 2 cols / 1 col, `HeaderRegister`, seeds `prisma/seedDatas/cv-template/`.

---

## 1. `pageLayout` (composant de page)

Chemin form : `layoutGeneral.defaultStyles.components.pageLayout`  
Enum schema : `OneColumnModel` | `OneColumnWithLeftBar` | `TwoColumnCenter` | `TwoColumnSideBar`

| Valeur | Register | Colonnes module | Largeurs grille | DnD col 0 |
|--------|----------|-----------------|-----------------|-----------|
| `OneColumnModel` | `OneColumnModel` | `column: 0` seulement | 1 flux | — |
| `TwoColumnSideBar` | `TwoColumnSideBar` | `0` / `1` | **3/8 + 5/8** | types `SIDEBAR_ALLOWED` seulement |
| `TwoColumnCenter` | `TwoColumnCenter` | `0` / `1` | **4/8 + 4/8** (50/50) | **libre** (toute section) |
| `OneColumnWithLeftBar` | **pas dans** `PageLayoutRegister` | — | — | clé schema orpheline |

`sidebarSide` (`left` | `right`) : inverse l’ordre CSS des 2 colonnes (UI dock visible pour `TwoColumnSideBar` **et** `TwoColumnCenter`).

---

## 2. `headerPlacement` (où le header est rendu)

Chemin : `layoutGeneral.layout.headerPlacement`  
Enum : `top` | `sidebar` | `split` — **figé par le template** (pas d’input dock dédié).

Effet **uniquement** dans les layouts 2 colonnes (`TwoColumnSideBar` / `TwoColumnCenter`).  
`OneColumnModel` ignore cette valeur : il rend toujours un header **mono** (`resolveMonoHeaderEntry`) en tête de page.

| Valeur | Rendu page 1 | Résolution |
|--------|--------------|------------|
| `top` | Bandeau **pleine largeur** au-dessus de la grille | `resolveMonoHeaderEntry(sectionHeader)` |
| `sidebar` | En tête de la **colonne 0** | idem mono |
| `split` | Slot sidebar + slot main | `resolveSplitHeaderEntry(sectionHeader)` → `.Sidebar` + `.Main` |

Mesures pagination : `utils/cvHeaderPlacement.ts` (`HEADER_TOP_ID`, `HEADER_SIDEBAR_ID`, `HEADER_*_SPLIT_*`).

---

## 3. `sectionHeader` + `HeaderRegister`

Chemin : `layoutGeneral.defaultStyles.components.sectionHeader`

Convention de nommage (cible) : **`Header[Placement]N`** — ex. `HeaderSplitOne`, futurs `HeaderSplitTwo`, `HeaderSidebarOne`, `HeaderTopOne`…

**Décision (2026-09-29)** : **pas de renommage massif** `HeaderOne`…`Five` → `HeaderTop*` / `HeaderSidebar*` pour l’instant.

- Nouveaux headers → convention `Header[Placement]N` uniquement.
- Legacy `HeaderOne`…`Five` **conservés** (seeds + BDD `sectionHeader`) ; `headerPlacement` + `kind` portent le sens.
- Pourquoi pas tout renommer maintenant : One…Four ≠ tous `top` de façon symétrique avec Five (`sidebar`) ; coût schema / seeds / CV déjà sauvés.
- Renommage legacy (+ alias éventuel, ex. `HeaderFive` → `HeaderSidebarOne`) = chantier migration dédié si besoin plus tard.

Registre unifié (`HeaderRegister`) : chaque clé = `{ kind: "mono", Component }` **ou** `{ kind: "split", Sidebar, Main }`.

| Clé | kind | Contenu vérifié | Placement attendu |
|-----|------|-----------------|-------------------|
| `HeaderOne` | mono | Photo + titre/sous-titre + contacts grille 3 cols | `top` (souvent) |
| `HeaderTwo` | mono | Titre cadré centré, contacts centrés | `top` |
| `HeaderThree` | mono | Photo + nom/prenom/sous-titre + contacts colonne | `top` |
| `HeaderFour` | mono | Bandeau couleur + nom/prenom + contacts | `top` |
| `HeaderFive` | mono | Colonne : nom → photo → intitulé → contacts | `sidebar` (seeds Frankfurt, Singapore, Toronto, minimal) |
| `HeaderSplitOne` | **split** | Sidebar : photo + contacts · Main : nom/prénom + intitulé + trait | **`split`** (Berlin) |

Helpers :

- `resolveMonoHeaderEntry` — fallback `HeaderOne` si clé absente ou entrée split
- `resolveSplitHeaderEntry` — fallback `HeaderSplitOne` si clé absente ou entrée mono

Ainsi un mismatch seed (ex. ancien Berlin `HeaderFive` + `split`) ne casse pas le rendu : le layout split retombe sur `HeaderSplitOne`. **Le seed doit quand même être cohérent** (Berlin corrigé → `HeaderSplitOne`).

---

## 4. Autres champs `layout` utiles

| Champ | Effet vérifié |
|-------|----------------|
| `columns` | Métadonnée layout ; le vrai découpage UI = `pageLayout` + `module.column` |
| `withPhoto` / `stylePhoto` / `photoSide` / `lockPhotoSide` | Photo header ; dock `GeneralPhoto` |
| `sidebarTheme` | Fond + fg de la **colonne 0** (2 cols) via CSS token — omis = pas de fond teinté |
| `marge` / `space` | Padding page / espacement sections |
| `pageAccent` | Ex. `leftBand` → dégradé fond page |
| `titleSection.*` | Style des titres de sections |
| `typography` | Familles de polices (rôles) |

Modules : `column: 0 | 1` = sidebar | main.

DnD vers colonne 0 — **uniquement** `TwoColumnSideBar` (`sidebarColumn: 0`) : types `SIDEBAR_ALLOWED` (`language`, `tag`, `socialMedia`, `passion`, `prize`, `expertise`).  
`TwoColumnCenter` : **pas** de restriction — toute section peut aller en col 0 ou 1.

---

## 5. Checklist seed 2 colonnes

1. `pageLayout` : `TwoColumnSideBar` (3/8+5/8) **ou** `TwoColumnCenter` (50/50).  
2. Coupler `headerPlacement` + `sectionHeader` :
   - mono (`HeaderOne`…`Five`) → `top` ou `sidebar`
   - split (`HeaderSplitOne`…) → **`split`**
3. `sidebarTheme` seulement si la colonne 0 doit être teintée.  
4. Modules : seed initial libre ; sur **SideBar**, préférer contenus longs en `column: 1` (DnD restreignera ensuite) ; sur **Center**, n’importe quelle colonne.
