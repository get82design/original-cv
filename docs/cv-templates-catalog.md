# Catalogue templates (inventaire seed)

Doc **vivante** : à mettre à jour à chaque nouveau template seedé.  
Sources code :
- structure / layout : `prisma/seedDatas/cv-template/` → `seedTemplates` (`index.ts`)
- typo : `prisma/seedDatas/themeTokens.ts` + presets `headerTokenDefaults.ts`  
Config layout / headers UI : [`cv-layout-config.md`](./cv-layout-config.md).

**Workflow actuel (pré-prod)** : on crée / itère les templates via **seeds** (`defineTemplate` + re-seed), pas via un builder admin.  
**Admin `/admin/templates`** : flags catalogue seulement (`isActive`, `isPremium`, prix, featured, sort, unlock gifts) — **pas** de création de structure / layout / modules.

---

## Typo seed (`themeTokens` + presets header)

| Fichier | Rôle |
|---------|------|
| `themeTokens.ts` → `defaultTokens` | Base typo (ex-`classiqueTokens`) |
| `themeTokens.ts` → `defineTokens(overrides)` | Deep-merge partiel sur `defaultTokens` |
| `headerTokenDefaults.ts` | Preset **header only** par `sectionHeader` |
| `mergeTokenOverrides(...)` | Empile preset + deltas sans écraser un rôle entier |

**Convention** : le thème d’un template part du preset qui correspond à son `sectionHeader`, puis n’écrit que les deltas (sections, corps, variantes).

```ts
// Ex. Kyoto (HeaderOne)
export const kyotoTokens = defineTokens(
  mergeTokenOverrides(headerOneTokenDefaults, {
    sectionTitle: { colorSelect: "black" },
  }),
);
```

| Preset | `sectionHeader` | Templates (seed) |
|--------|-----------------|------------------|
| `headerOneTokenDefaults` | HeaderOne | Florence, Geneva, Helsinki, Kyoto, Stockholm, Vienna |
| `headerTwoTokenDefaults` | HeaderTwo | Krakow, Nara, Oslo*, Reykjavik |
| `headerThreeTokenDefaults` | HeaderThree | Denver, Lisbon, Seoul, Shenzhen |
| `headerFourTokenDefaults` | HeaderFour | Austin, Chicago, Eindhoven, Oxford, Portland, Tallinn, Tokyo, Zurich |
| `headerFiveTokenDefaults` | HeaderFive | Frankfurt, Singapore, Toronto |
| `headerSplitOneTokenDefaults` | HeaderSplitOne | Berlin, Hamburg, Seattle |

\* Oslo : preset HeaderTwo + overrides historiques (`weightSelect: "md"` titre, sous-titre plus gros).  
⚠️ Ne pas faire `{ ...preset, headerTitle: { textAlign: "center" } }` — ça **remplace** tout le bloc ; utiliser `mergeTokenOverrides`.

Anciens thèmes de test **retirés** : `classique` / `moderne` / `minimal` (fichiers seed + tokens).

---

## Synthèse

| Indicateur | Valeur |
|------------|--------|
| Templates **actifs** dans `seedTemplates` | **28** |
| Premium (`isPremium`) au seed | **0** (défaut Prisma `false` ; seed ne pose jamais le flag) |
| Hors seed | — |

Dernière revue : **2026-09-30** (+ **Hamburg** : HeaderSplitOne + split + sidebar gray-700 / fg white ; rose-600).

---

## Par `pageLayout`

| pageLayout | Nb | Templates |
|------------|---:|-----------|
| `OneColumnModel` | 16 | Austin, Denver, Eindhoven, Geneva, Helsinki, Kyoto, Nara, Oslo, Oxford, Portland, Reykjavik, Seoul, Shenzhen, Stockholm, Tallinn, Zurich |
| `TwoColumnSideBar` | 11 | Berlin, Chicago, Florence, Frankfurt, Hamburg, Krakow, Lisbon, Seattle, Singapore, Tokyo, Toronto |
| `TwoColumnCenter` | 1 | Vienna |
| `OneColumnWithLeftBar` | 0 | — |

---

## Par `sectionHeader`

| sectionHeader | Nb | Templates |
|---------------|---:|-----------|
| `HeaderOne` | 6 | Florence, Geneva, Helsinki, Kyoto, Stockholm, Vienna |
| `HeaderTwo` | 4 | Krakow, Nara, Oslo, Reykjavik |
| `HeaderThree` | 4 | Denver, Lisbon, Seoul, Shenzhen |
| `HeaderFour` | 8 | Austin, Chicago, Eindhoven, Oxford, Portland, Tallinn, Tokyo, Zurich |
| `HeaderFive` | 3 | Frankfurt, Singapore, Toronto |
| `HeaderSplitOne` | 3 | Berlin, Hamburg, Seattle |

---

## Par `headerPlacement`

Défaut seed (`sharedLayout`) : `top`. Effet réel surtout en layouts 2 colonnes (voir [`cv-layout-config.md`](./cv-layout-config.md)).

| headerPlacement | Nb | Templates |
|-----------------|---:|-----------|
| `top` | 22 | Austin, Chicago*, Denver, Eindhoven, Florence*, Geneva, Helsinki, Krakow*, Kyoto, Lisbon*, Nara, Oslo, Oxford, Portland, Reykjavik, Seoul, Shenzhen, Stockholm, Tallinn, Tokyo*, Vienna, Zurich |
| `sidebar` | 3 | Frankfurt, Singapore, Toronto |
| `split` | 3 | Berlin, Hamburg, Seattle |

\* Chicago, Florence, Krakow, Lisbon, Tokyo : `TwoColumnSideBar` + `headerPlacement: "top"` hérité (pas de `sidebar` / `split` explicite).

---

## Tableau détaillé (ordre `seedTemplates`)

| # | Nom | pageLayout | sectionHeader | headerPlacement | Couleur | Premium |
|---|-----|------------|---------------|-----------------|---------|---------|
| 1 | Stockholm | OneColumnModel | HeaderOne | top | yellow-600 | non |
| 2 | Kyoto | OneColumnModel | HeaderOne | top | red-600 | non |
| 3 | Oslo | OneColumnModel | HeaderTwo | top | teal-600 | non |
| 4 | Denver | OneColumnModel | HeaderThree | top | violet-400 | non |
| 5 | Seattle | TwoColumnSideBar | HeaderSplitOne | split | slate-600 | non |
| 6 | Seoul | OneColumnModel | HeaderThree | top | sky-500 | non |
| 7 | Geneva | OneColumnModel | HeaderOne | top | gray-500 | non |
| 8 | Austin | OneColumnModel | HeaderFour | top | lime-500 | non |
| 9 | Portland | OneColumnModel | HeaderFour | top | sky-500 | non |
| 10 | Tallinn | OneColumnModel | HeaderFour | top | violet-500 | non |
| 11 | Zurich | OneColumnModel | HeaderFour | top | red-600 | non |
| 12 | Chicago | TwoColumnSideBar | HeaderFour | top* | orange-400 | non |
| 13 | Tokyo | TwoColumnSideBar | HeaderFour | top* | yellow-600 | non |
| 14 | Lisbon | TwoColumnSideBar | HeaderThree | top* | violet-400 | non |
| 15 | Florence | TwoColumnSideBar | HeaderOne | top* | sky-500 | non |
| 16 | Helsinki | OneColumnModel | HeaderOne | top | emerald-600 | non |
| 17 | Nara | OneColumnModel | HeaderTwo | top | mauve-600 | non |
| 18 | Reykjavik | OneColumnModel | HeaderTwo | top | cyan-500 | non |
| 19 | Krakow | TwoColumnSideBar | HeaderTwo | top* | amber-600 | non |
| 20 | Shenzhen | OneColumnModel | HeaderThree | top | indigo-500 | non |
| 21 | Eindhoven | OneColumnModel | HeaderFour | top | gray-500 | non |
| 22 | Oxford | OneColumnModel | HeaderFour | top | mauve-600 | non |
| 23 | Singapore | TwoColumnSideBar | HeaderFive | sidebar | lime-500 | non |
| 24 | Toronto | TwoColumnSideBar | HeaderFive | sidebar | blue-600 | non |
| 25 | Frankfurt | TwoColumnSideBar | HeaderFive | sidebar | olive-700 | non |
| 26 | Berlin | TwoColumnSideBar | HeaderSplitOne | split | teal-600 | non |
| 27 | Hamburg | TwoColumnSideBar | HeaderSplitOne | split | rose-600 | non |
| 28 | Vienna | TwoColumnCenter | HeaderOne | top | indigo-700 | non |

---

## Comment mettre à jour

1. Ajouter le fichier seed (`one-column/` ou `two-columns/`) via `defineTemplate` (poser `sectionHeader` + `pageLayout` / `headerPlacement`).
2. Ajouter `xxxTokens` dans `themeTokens.ts` :
   `defineTokens(mergeTokenOverrides(headerXTokenDefaults, { …deltas }))`  
   — le preset `headerX` = le même `sectionHeader` que le seed.
3. L’exporter dans `prisma/seedDatas/cv-template/index.ts` (`seedTemplates`).
4. Recalculer les tableaux **Par pageLayout / sectionHeader / headerPlacement** + ligne détaillée + ligne preset typo.
5. Mettre à jour la date « Dernière revue » et le compteur synthèse.
6. Re-seed : `npm run seed` (createMany + pool limité — OK avec `next dev` ouvert).

Pas besoin d’admin builder tant que le catalogue évolue surtout en seed pré-prod.
