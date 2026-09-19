import type { CvFormValues } from "../../../services/schemas/cvSave.schema";
import type { CvRewriteSectionType } from "../../../services/schemas/cvRewriteSection.schema";

export type CvRewriteSectionOption = {
	sectionType: CvRewriteSectionType;
	label: string;
	/** true si la section a du contenu reformulable */
	hasContent: boolean;
};

const DEFAULT_LABELS: Record<CvRewriteSectionType, string> = {
	description: "Description / profil",
	experience: "Expériences",
	project: "Projets",
	volunteering: "Bénévolat",
	achievement: "Réalisations",
};

function line(...parts: Array<string | null | undefined>): string | null {
	const text = parts
		.map((p) => (typeof p === "string" ? p.trim() : ""))
		.filter(Boolean)
		.join(" · ");
	return text || null;
}

/**
 * Sections reformulables présentes (avec contenu) sur le CV courant.
 */
export function listRewriteableSections(
	cv: CvFormValues,
): CvRewriteSectionOption[] {
	const d = cv.datas ?? {};
	const options: CvRewriteSectionOption[] = [
		{
			sectionType: "description",
			label: d.description?.title?.trim() || DEFAULT_LABELS.description,
			hasContent: !!d.description?.content?.description?.trim(),
		},
		{
			sectionType: "experience",
			label: d.experience?.title?.trim() || DEFAULT_LABELS.experience,
			hasContent: (d.experience?.content?.length ?? 0) > 0,
		},
		{
			sectionType: "project",
			label: d.project?.title?.trim() || DEFAULT_LABELS.project,
			hasContent: (d.project?.content?.length ?? 0) > 0,
		},
		{
			sectionType: "volunteering",
			label: d.volunteering?.title?.trim() || DEFAULT_LABELS.volunteering,
			hasContent: (d.volunteering?.content?.length ?? 0) > 0,
		},
		{
			sectionType: "achievement",
			label: d.achievement?.title?.trim() || DEFAULT_LABELS.achievement,
			hasContent: (d.achievement?.content?.length ?? 0) > 0,
		},
	];
	return options.filter((o) => o.hasContent);
}

/**
 * Extrait le texte source d’une section pour Gemini (avec id = clientKey).
 */
export function extractCvSectionSourceText(
	cv: CvFormValues,
	sectionType: CvRewriteSectionType,
): { sectionLabel: string; sourceText: string } | null {
	const d = cv.datas ?? {};

	switch (sectionType) {
		case "description": {
			const text = d.description?.content?.description?.trim();
			if (!text) return null;
			return {
				sectionLabel:
					d.description?.title?.trim() || DEFAULT_LABELS.description,
				sourceText: text,
			};
		}
		case "experience": {
			const items = d.experience?.content ?? [];
			if (!items.length) return null;
			const blocks = items.map((item, i) => {
				const c = item.content;
				const missions = (c.missions ?? [])
					.map((m) => `  - ${m.content?.content?.trim() || ""}`)
					.filter((m) => m.trim() !== "-");
				return [
					`[id=${item.clientKey}]`,
					`${i + 1}. ${line(c.title, c.company) ?? "Expérience"}`,
					c.description?.trim() || null,
					missions.length ? missions.join("\n") : null,
				]
					.filter(Boolean)
					.join("\n");
			});
			return {
				sectionLabel:
					d.experience?.title?.trim() || DEFAULT_LABELS.experience,
				sourceText: blocks.join("\n\n"),
			};
		}
		case "project": {
			const items = d.project?.content ?? [];
			if (!items.length) return null;
			const blocks = items.map((item, i) => {
				const c = item.content;
				const missions = (c.missions ?? [])
					.map((m) => `  - ${m.content?.content?.trim() || ""}`)
					.filter((m) => m.trim() !== "-");
				return [
					`[id=${item.clientKey}]`,
					`${i + 1}. ${line(c.title, c.technology) ?? "Projet"}`,
					c.description?.trim() || null,
					missions.length ? missions.join("\n") : null,
				]
					.filter(Boolean)
					.join("\n");
			});
			return {
				sectionLabel: d.project?.title?.trim() || DEFAULT_LABELS.project,
				sourceText: blocks.join("\n\n"),
			};
		}
		case "volunteering": {
			const items = d.volunteering?.content ?? [];
			if (!items.length) return null;
			const blocks = items.map((item, i) => {
				const c = item.content;
				const missions = (c.missions ?? [])
					.map((m) => `  - ${m.content?.content?.trim() || ""}`)
					.filter((m) => m.trim() !== "-");
				return [
					`[id=${item.clientKey}]`,
					`${i + 1}. ${line(c.title, c.organisation) ?? "Bénévolat"}`,
					c.description?.trim() || null,
					missions.length ? missions.join("\n") : null,
				]
					.filter(Boolean)
					.join("\n");
			});
			return {
				sectionLabel:
					d.volunteering?.title?.trim() || DEFAULT_LABELS.volunteering,
				sourceText: blocks.join("\n\n"),
			};
		}
		case "achievement": {
			const items = d.achievement?.content ?? [];
			if (!items.length) return null;
			const blocks = items.map((item, i) => {
				const c = item.content;
				return [
					`[id=${item.clientKey}]`,
					`${i + 1}. ${c.title?.trim() || "Réalisation"}`,
					c.description?.trim() || null,
					c.technology?.trim()
						? `Techno : ${c.technology.trim()}`
						: null,
				]
					.filter(Boolean)
					.join("\n");
			});
			return {
				sectionLabel:
					d.achievement?.title?.trim() || DEFAULT_LABELS.achievement,
				sourceText: blocks.join("\n\n"),
			};
		}
		default:
			return null;
	}
}
