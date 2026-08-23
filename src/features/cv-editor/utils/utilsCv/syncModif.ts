import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import type { Path, UseFormGetValues, UseFormSetValue } from "react-hook-form";

const SECTION_TITLE_PATHS = [
    "datas.description.settings.title",
    "datas.experience.settings.title",
    "datas.education.settings.title",
    "datas.language.settings.title",
    "datas.skillGroup.settings.title",
    "datas.competenceGroup.settings.title",
    "datas.tagGroup.settings.title",
    "datas.socialMedia.settings.title",
    "datas.passion.settings.title",
    "datas.project.settings.title",
    "datas.expertise.settings.title",
    "datas.strength.settings.title",
    "datas.philosophy.settings.title",
    "datas.formation.settings.title",
    "datas.certification.settings.title",
    "datas.prize.settings.title",
    "datas.publication.settings.title",
    "datas.achievement.settings.title",
    "datas.volunteering.settings.title",
] as const;

type StyleProp = "colorSelect" | "sizeSelect" | "weightSelect" | "textAlign";

const ITEM_SETTINGS_RE =
  /^datas\.(\w+)\.content\.(\d+)\.content\.settings\.(\w+)$/;

export function isSectionTitlePath(path: string) {
    return SECTION_TITLE_PATHS.includes(path as typeof SECTION_TITLE_PATHS[number]);
}

export function syncSectionTitleProp(
    setValue: UseFormSetValue<CvFormValues>,
    prop: StyleProp,
    value: unknown,
) {
    for (const path of SECTION_TITLE_PATHS) {
        setValue(`${path}.${prop}`, value as any, { shouldDirty: true });
    }
}

export function parseItemSettingsPath(path: string) {
    const m = path.match(ITEM_SETTINGS_RE);
    if (!m) return null;
    return { section: m[1], index: Number(m[2]), leaf: m[3] }; // leaf = "title" | "company" | …
  }

export function syncItemSettingsProp(
    getValues: UseFormGetValues<CvFormValues>,
    setValue: UseFormSetValue<CvFormValues>,
    selectPath: string,
    prop: StyleProp,
    value: unknown,
) {
    const parsed = parseItemSettingsPath(selectPath);
    if (!parsed) return;
    const list = getValues(`datas.${parsed.section}.content` as Path<CvFormValues>) as
      | { content?: { settings?: Record<string, unknown> } }[]
      | undefined;
    if (!Array.isArray(list)) return;
    list.forEach((_, i) => {
      const path = `datas.${parsed.section}.content.${i}.content.settings.${parsed.leaf}`;
      setValue(`${path}.${prop}` as Path<CvFormValues>, value as never, {
        shouldDirty: true,
      });
    });
}