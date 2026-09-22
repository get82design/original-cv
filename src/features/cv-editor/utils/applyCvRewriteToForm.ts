import { v4 as uuid } from "uuid";
import type { CvFormValues } from "../../../services/schemas/cvSave.schema";
import type {
	CvRewriteSection,
	CvRewriteSectionType,
} from "../../../services/schemas/cvRewriteSection.schema";

type ListItem = {
	clientKey: string;
	order: number;
	content: Record<string, unknown> & {
		title?: string;
		description?: string;
		missions?: Array<{
			clientKey: string;
			order: number;
			content: { content: string };
		}>;
	};
};

function applyItemsToSection(items: ListItem[] | undefined, rewrite: CvRewriteSection): ListItem[] {
	const current = items ?? [];
	const byId = new Map(current.map((i) => [i.clientKey, i]));

	return rewrite.items.map((ri, index) => {
		const id = ri.id?.trim();
		const existing = id ? byId.get(id) : current[index];
		const base = existing
			? structuredClone(existing)
			: {
					clientKey: id || `rewrite-${uuid()}`,
					order: index + 1,
					content: {},
				};

		base.order = index + 1;
		if (ri.title?.trim()) base.content.title = ri.title.trim();
		if (ri.body != null) base.content.description = ri.body;
		if (ri.bullets.length > 0) {
			const prevMissions = base.content.missions ?? [];
			base.content.missions = ri.bullets.map((text, mi) => ({
				clientKey: prevMissions[mi]?.clientKey ?? `mission-${uuid()}`,
				order: mi + 1,
				content: { content: text },
			}));
		}
		return base as ListItem;
	});
}

/**
 * Applique une reformulation IA sur le formulaire CV (immutable → nouveau objet).
 */
export function applyCvRewriteToForm(
	cv: CvFormValues,
	sectionType: CvRewriteSectionType,
	rewrite: CvRewriteSection,
): CvFormValues {
	const next = structuredClone(cv);
	const datas = next.datas ?? (next.datas = {});

	switch (sectionType) {
		case "description": {
			if (!rewrite.rewrittenText?.trim()) break;
			datas.description = {
				...datas.description,
				title: datas.description?.title ?? "Description",
				content: {
					...datas.description?.content,
					description: rewrite.rewrittenText.trim(),
				},
			};
			break;
		}
		case "experience": {
			if (!datas.experience) break;
			datas.experience = {
				...datas.experience,
				content: applyItemsToSection(
					datas.experience.content as ListItem[],
					rewrite,
				) as typeof datas.experience.content,
			};
			break;
		}
		case "project": {
			if (!datas.project) break;
			datas.project = {
				...datas.project,
				content: applyItemsToSection(
					datas.project.content as ListItem[],
					rewrite,
				) as typeof datas.project.content,
			};
			break;
		}
		case "volunteering": {
			if (!datas.volunteering) break;
			datas.volunteering = {
				...datas.volunteering,
				content: applyItemsToSection(
					datas.volunteering.content as ListItem[],
					rewrite,
				) as typeof datas.volunteering.content,
			};
			break;
		}
		case "achievement": {
			if (!datas.achievement) break;
			datas.achievement = {
				...datas.achievement,
				content: applyItemsToSection(
					datas.achievement.content as ListItem[],
					rewrite,
				) as typeof datas.achievement.content,
			};
			break;
		}
		default:
			break;
	}

	return next;
}
