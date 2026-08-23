import type { CompetenceGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type { CompetenceContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: CompetenceContentSettings = {
	groupTitle: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	competences: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withGroupTitle: false,
};

export function createInitCompetence(opts?: {
	order?: number;
	settings?: CompetenceContentSettings;
}): ListItem<CompetenceGroupItemContentInput> {
	return {
		clientKey: "competenceGroup-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "competence group " + uuid(),
			competences: [
				{
					clientKey: "competence-" + uuid(),
					order: 1,
					content: {
						competenceId: "",
					},
				},
			],
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
