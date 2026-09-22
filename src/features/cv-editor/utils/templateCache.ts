import type { CvFormValues } from "@/services/schemas/cvSave.schema";

const KEY = "original-cv:template-cache";

type CvDatas = NonNullable<CvFormValues["datas"]>;

/** Settings de section uniquement (sans le contenu) */
export type TemplateDatasSettingsSnapshot = Partial<Record<keyof CvDatas, { settings: unknown }>>;

/** Ce qu’on garde par template (pas le texte des expériences) */
export type TemplateSnapshot = {
	layoutGeneral: CvFormValues["layoutGeneral"];
	modules: CvFormValues["modules"];
	datasSettings: TemplateDatasSettingsSnapshot;
};

type CacheStore = Record<string, TemplateSnapshot>; // clé = templateId

export function saveTemplateSnapshot(templateId: string, cv: CvFormValues) {
	if (!templateId) return;
	const store = loadAll() ?? {};
	store[templateId] = extractSnapshot(cv);
	localStorage.setItem(KEY, JSON.stringify(store));
}

export function loadTemplateSnapshot(templateId: string): TemplateSnapshot | null {
	return loadAll()?.[templateId] ?? null;
}

export function clearTemplateCache() {
	localStorage.removeItem(KEY);
}

function loadAll(): CacheStore | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		return JSON.parse(raw) as CacheStore;
	} catch {
		return null;
	}
}

function extractSnapshot(cv: CvFormValues): TemplateSnapshot {
	return {
		layoutGeneral: cv.layoutGeneral,
		modules: cv.modules,
		datasSettings: extractDatasSettings(cv.datas),
	};
}

function extractDatasSettings(datas: CvFormValues["datas"]): TemplateDatasSettingsSnapshot {
	if (!datas) return {};

	const result: TemplateDatasSettingsSnapshot = {};
	const pickSectionSettings = (key: keyof CvDatas) => {
		const section = datas[key];
		if (section && "settings" in section && section.settings) {
			result[key] = { settings: section.settings };
		}
	};

	if (datas.header?.settings) {
		result.header = { settings: datas.header.settings };
	}

	(
		[
			"description",
			"experience",
			"project",
			"volunteering",
			"formation",
			"certification",
			"prize",
			"expertise",
			"philosophy",
			"socialMedia",
			"passion",
			"language",
			"publication",
			"strength",
			"achievement",
			"education",
			"skillGroup",
			"competenceGroup",
			"tagGroup",
		] as const
	).forEach(pickSectionSettings);

	return result;
}
