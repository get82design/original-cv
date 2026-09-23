import type { ExpertiseContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ExpertiseItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: ExpertiseContentSettings = {
	title: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	design: "stars",
	columns: 1,
};

export function createInitExpertise(opts?: {
	order?: number;
	settings?: ExpertiseContentSettings;
}): ListItem<ExpertiseItemContentInput> {
	return {
		clientKey: `expertise-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			level: "Débutant",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
