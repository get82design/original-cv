import type { SkillContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { v4 as uuid } from "uuid";

const defaultSettings: SkillContentSettings = {
	groupTitle: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	skills: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	design: "stars",
	withGroupTitle: false,
	groupColumns: 1,
	itemColumns: 3,
};

/** Crée une expérience neuve à chaque appel (clientKey unique). */
export function createInitSkill(opts?: {
	order?: number;
	settings?: SkillContentSettings;
}): ListItem<SkillGroupItemContentInput> {
	return {
		clientKey: `skillGroup-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: `skill group ${uuid()}`,
			skills: [
				{
					clientKey: `skill-${uuid()}`,
					order: 1,
					content: {
						name: "",
						level: "Débutant",
					},
				},
			],
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
