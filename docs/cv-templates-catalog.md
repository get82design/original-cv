# Catalogue templates (inventaire seed)

Doc **vivante** : à mettre à jour à chaque nouveau template seedé.  
Sources code :

- structure / layout : `prisma/seedDatas/cv-template/` → `seedTemplates` (`index.ts`)
- typo : `prisma/seedDatas/themeTokens.ts` + presets `headerTokenDefaults.ts`  
Config layout / headers UI : `[cv-layout-config.md](./cv-layout-config.md)`.

**Workflow actuel (pré-prod)** : on crée / itère les templates via **seeds** (`defineTemplate` + re-seed), pas via un builder admin.  
**Admin** `/admin/templates` : flags catalogue seulement (`isActive`, `isPremium`, prix, featured, sort, unlock gifts) — **pas** de création de structure / layout / modules.

### `variant` (sections)

`defineTemplate({ variant })` → `buildComponents` : `1` = `Section*One`, `2` = `Section*Two`.

- `variant: 2` : réservé aux CV `OneColumnModel`
- **2 colonnes** (`TwoColumnSideBar` / `TwoColumnCenter`) : toujours `variant: 1`

Rule agent : `.cursor/rules/11-cv-templates-seed.mdc`.

---



## Typo seed (`themeTokens` + presets header)


| Fichier                                      | Rôle                                               |
| -------------------------------------------- | -------------------------------------------------- |
| `themeTokens.ts` → `defaultTokens`           | Base typo (ex-`classiqueTokens`)                   |
| `themeTokens.ts` → `defineTokens(overrides)` | Deep-merge partiel sur `defaultTokens`             |
| `headerTokenDefaults.ts`                     | Preset **header only** par `sectionHeader`         |
| `mergeTokenOverrides(...)`                   | Empile preset + deltas sans écraser un rôle entier |


**Convention** : le thème d’un template part du preset qui correspond à son `sectionHeader`, puis n’écrit que les deltas (sections, corps, variantes).

```ts
// Ex. Kyoto (HeaderOne)
export const kyotoTokens = defineTokens(
  mergeTokenOverrides(headerOneTokenDefaults, {
    sectionTitle: { colorSelect: "black" },
  }),
);
```


| Preset                          | `sectionHeader`  | Templates (seed)                                                                        |
| ------------------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| `headerOneTokenDefaults`        | HeaderOne        | Florence, Geneva, Helsinki, Kyoto, Stockholm, Vienna                                    |
| `headerTwoTokenDefaults`        | HeaderTwo        | Krakow, Nara, Oslo*, Prague, Reykjavik                                                  |
| `headerThreeTokenDefaults`      | HeaderThree      | Budapest, Denver, Lisbon, Seoul, Shenzhen                                               |
| `headerFourTokenDefaults`       | HeaderFour       | Austin, Barcelona, Chicago, Eindhoven, Madrid, Oxford, Portland, Tallinn, Tokyo, Zurich |
| `headerSidebarOneTokenDefaults` | HeaderSidebarOne | Frankfurt, Genoa, Milan, Naples, Singapore, Toronto                                     |
| `headerSidebarTwoTokenDefaults` | HeaderSidebarTwo | Bilbao, Bruges, Brussels, Copenhagen, Glasgow, Porto                                    |
| `headerSplitOneTokenDefaults`   | HeaderSplitOne   | Berlin, Bordeaux, Hamburg, Lyon, Munich, Seattle                                        |
| `headerSplitTwoTokenDefaults`   | HeaderSplitTwo   | Amsterdam, Antwerp, Cologne, Dublin, Ghent, Rotterdam                                   |


 Oslo : preset HeaderTwo + overrides historiques (`weightSelect: "md"` titre, sous-titre plus gros).  
⚠️ Ne pas faire `{ ...preset, headerTitle: { textAlign: "center" } }` — ça **remplace** tout le bloc ; utiliser `mergeTokenOverrides`.

Anciens thèmes de test **retirés** : `classique` / `moderne` / `minimal` (fichiers seed + tokens).

---



## Synthèse


| Indicateur                                | Valeur                                                      |
| ----------------------------------------- | ----------------------------------------------------------- |
| Templates **actifs** dans `seedTemplates` | **50**                                                      |
| Premium (`isPremium`) au seed             | **0** (défaut Prisma `false` ; seed ne pose jamais le flag) |
| Hors seed                                 | —                                                           |


Dernière revue : **2026-10-07** (+ **HeaderSidebarTwo** : Brussels / Copenhagen / Glasgow en SideBar claire, blanche, sombre ; Bruges / Porto / Bilbao les trois mêmes en Center).

---



## Par `pageLayout`


| pageLayout             | Nb  | Templates                                                                                                                                                         |
| ---------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneColumnModel`       | 16  | Austin, Denver, Eindhoven, Geneva, Helsinki, Kyoto, Nara, Oslo, Oxford, Portland, Reykjavik, Seoul, Shenzhen, Stockholm, Tallinn, Zurich                          |
| `TwoColumnSideBar`     | 17  | 1. Amsterdam, Berlin, Brussels, Chicago, Copenhagen, Dublin, Florence, Frankfurt, Glasgow, Hamburg, Krakow, Lisbon, Rotterdam, Seattle, Singapore, Tokyo, Toronto |
| `TwoColumnCenter`      | 17  | Antwerp, Barcelona, Bilbao, Bordeaux, Bruges, Budapest, Cologne, Genoa, Ghent, Lyon, Madrid, Milan, Munich, Naples, Porto, Prague, Vienna                         |
| `OneColumnWithLeftBar` | 0   | —                                                                                                                                                                 |


---



## Par `sectionHeader`


| sectionHeader      | Nb  | Templates                                                                               |
| ------------------ | --- | --------------------------------------------------------------------------------------- |
| `HeaderOne`        | 6   | Florence, Geneva, Helsinki, Kyoto, Stockholm, Vienna                                    |
| `HeaderTwo`        | 5   | Krakow, Nara, Oslo, Prague, Reykjavik                                                   |
| `HeaderThree`      | 5   | Budapest, Denver, Lisbon, Seoul, Shenzhen                                               |
| `HeaderFour`       | 10  | Austin, Barcelona, Chicago, Eindhoven, Madrid, Oxford, Portland, Tallinn, Tokyo, Zurich |
| `HeaderSidebarOne` | 6   | Frankfurt, Genoa, Milan, Naples, Singapore, Toronto                                     |
| `HeaderSidebarTwo` | 6   | Bilbao, Bruges, Brussels, Copenhagen, Glasgow, Porto                                    |
| `HeaderSplitOne`   | 6   | Berlin, Bordeaux, Hamburg, Lyon, Munich, Seattle                                        |
| `HeaderSplitTwo`   | 6   | Amsterdam, Antwerp, Cologne, Dublin, Ghent, Rotterdam                                   |


---



## Par `headerPlacement`

Défaut seed (`sharedLayout`) : `top`. Effet réel surtout en layouts 2 colonnes (voir `[cv-layout-config.md](./cv-layout-config.md)`).


| headerPlacement | Nb  | Templates                                                                                                                                                                                                                            |
| --------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `top`           | 26  | Austin, Barcelona, Budapest, Chicago*, Denver, Eindhoven, Florence*, Geneva, Helsinki, Krakow*, Kyoto, Lisbon*, Madrid, Nara, Oslo, Oxford, Portland, Prague, Reykjavik, Seoul, Shenzhen, Stockholm, Tallinn, Tokyo*, Vienna, Zurich |
| `sidebar`       | 12  | Bilbao, Bruges, Brussels, Copenhagen, Frankfurt, Genoa, Glasgow, Milan, Naples, Porto, Singapore, Toronto                                                                                                                            |
| `split`         | 12  | Amsterdam, Antwerp, Berlin, Bordeaux, Cologne, Dublin, Ghent, Hamburg, Lyon, Munich, Rotterdam, Seattle                                                                                                                              |


 Chicago, Florence, Krakow, Lisbon, Tokyo : `TwoColumnSideBar` + `headerPlacement: "top"` hérité (pas de `sidebar` / `split` explicite).

---



## Tableau détaillé (ordre `seedTemplates`)


| #   | Nom        | pageLayout       | sectionHeader    | headerPlacement | Couleur     | Premium                      |
| --- | ---------- | ---------------- | ---------------- | --------------- | ----------- | ---------------------------- |
| 1   | Stockholm  | OneColumnModel   | HeaderOne        | top             | yellow-600  | non                          |
| 2   | Kyoto      | OneColumnModel   | HeaderOne        | top             | red-600     | non                          |
| 3   | Oslo       | OneColumnModel   | HeaderTwo        | top             | teal-600    | non                          |
| 4   | Denver     | OneColumnModel   | HeaderThree      | top             | violet-400  | non                          |
| 5   | Seattle    | TwoColumnSideBar | HeaderSplitOne   | split           | slate-600   | non                          |
| 6   | Seoul      | OneColumnModel   | HeaderThree      | top             | sky-500     | non                          |
| 7   | Geneva     | OneColumnModel   | HeaderOne        | top             | gray-500    | non                          |
| 8   | Austin     | OneColumnModel   | HeaderFour       | top             | lime-500    | non                          |
| 9   | Portland   | OneColumnModel   | HeaderFour       | top             | sky-500     | non                          |
| 10  | Tallinn    | OneColumnModel   | HeaderFour       | top             | violet-500  | non                          |
| 11  | Zurich     | OneColumnModel   | HeaderFour       | top             | red-600     | non                          |
| 12  | Chicago    | TwoColumnSideBar | HeaderFour       | top*            | orange-400  | non                          |
| 13  | Tokyo      | TwoColumnSideBar | HeaderFour       | top*            | yellow-600  | non                          |
| 14  | Lisbon     | TwoColumnSideBar | HeaderThree      | top*            | violet-400  | non                          |
| 15  | Florence   | TwoColumnSideBar | HeaderOne        | top*            | sky-500     | non                          |
| 16  | Helsinki   | OneColumnModel   | HeaderOne        | top             | emerald-600 | non                          |
| 17  | Nara       | OneColumnModel   | HeaderTwo        | top             | mauve-600   | non                          |
| 18  | Reykjavik  | OneColumnModel   | HeaderTwo        | top             | cyan-500    | non                          |
| 19  | Krakow     | TwoColumnSideBar | HeaderTwo        | top*            | amber-600   | non                          |
| 20  | Shenzhen   | OneColumnModel   | HeaderThree      | top             | indigo-500  | non                          |
| 21  | Eindhoven  | OneColumnModel   | HeaderFour       | top             | gray-500    | non                          |
| 22  | Oxford     | OneColumnModel   | HeaderFour       | top             | mauve-600   | non                          |
| 23  | Singapore  | TwoColumnSideBar | HeaderSidebarOne | sidebar         | lime-500    | non                          |
| 24  | Toronto    | TwoColumnSideBar | HeaderSidebarOne | sidebar         | blue-600    | non                          |
| 25  | Frankfurt  | TwoColumnSideBar | HeaderSidebarOne | sidebar         | olive-700   | non                          |
| 26  | Berlin     | TwoColumnSideBar | HeaderSplitOne   | split           | teal-600    | non                          |
| 27  | Hamburg    | TwoColumnSideBar | HeaderSplitOne   | split           | rose-600    | non                          |
| 28  | Vienna     | TwoColumnCenter  | HeaderOne        | top             | indigo-700  | non                          |
| 29  | Prague     | TwoColumnCenter  | HeaderTwo        | top             | blue-600    | non                          |
| 30  | Budapest   | TwoColumnCenter  | HeaderThree      | top             | fuchsia-500 | non                          |
| 31  | Madrid     | TwoColumnCenter  | HeaderFour       | top             | green-600   | non (bandeau gris)           |
| 32  | Barcelona  | TwoColumnCenter  | HeaderFour       | top             | purple-500  | non (bandeau primary)        |
| 33  | Munich     | TwoColumnCenter  | HeaderSplitOne   | split           | pink-400    | non (sidebar light)          |
| 34  | Milan      | TwoColumnCenter  | HeaderSidebarOne | sidebar         | stone-600   | non (sidebar light)          |
| 35  | Genoa      | TwoColumnCenter  | HeaderSidebarOne | sidebar         | zinc-600    | non (sans bg)                |
| 36  | Naples     | TwoColumnCenter  | HeaderSidebarOne | sidebar         | mist-600    | non (sidebar sombre Hamburg) |
| 37  | Lyon       | TwoColumnCenter  | HeaderSplitOne   | split           | neutral-600 | non (sans bg)                |
| 38  | Bordeaux   | TwoColumnCenter  | HeaderSplitOne   | split           | red-700     | non (sidebar sombre Hamburg) |
| 39  | Amsterdam  | TwoColumnSideBar | HeaderSplitTwo   | split           | cyan-700    | non (sidebar light)          |
| 40  | Rotterdam  | TwoColumnSideBar | HeaderSplitTwo   | split           | emerald-700 | non (sidebar sombre Hamburg) |
| 41  | Dublin     | TwoColumnSideBar | HeaderSplitTwo   | split           | violet-600  | non (sidebar blanche)        |
| 42  | Antwerp    | TwoColumnCenter  | HeaderSplitTwo   | split           | amber-700   | non (sidebar light)          |
| 43  | Cologne    | TwoColumnCenter  | HeaderSplitTwo   | split           | slate-700   | non (sidebar sombre Hamburg) |
| 44  | Ghent      | TwoColumnCenter  | HeaderSplitTwo   | split           | lime-600    | non (sidebar blanche)        |
| 45  | Brussels   | TwoColumnSideBar | HeaderSidebarTwo | sidebar         | taupe-600   | non (sidebar light)          |
| 46  | Copenhagen | TwoColumnSideBar | HeaderSidebarTwo | sidebar         | sky-700     | non (sidebar blanche)        |
| 47  | Glasgow    | TwoColumnSideBar | HeaderSidebarTwo | sidebar         | teal-700    | non (sidebar sombre Hamburg) |
| 48  | Bruges     | TwoColumnCenter  | HeaderSidebarTwo | sidebar         | orange-600  | non (sidebar light)          |
| 49  | Porto      | TwoColumnCenter  | HeaderSidebarTwo | sidebar         | purple-700  | non (sidebar blanche)        |
| 50  | Bilbao     | TwoColumnCenter  | HeaderSidebarTwo | sidebar         | green-700   | non (sidebar sombre Hamburg) |


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