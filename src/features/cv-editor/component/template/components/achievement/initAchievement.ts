import type { AchievementItemContentInput } from "@/services/schemas/cvSave.schema";
import type { AchievementContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: AchievementContentSettings = {
	title: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	description: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	year: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	technology: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withTitle: true,
	withDescription: true,
	withYear: true,
	withTechnology: true,
};

export function createInitAchievement(opts?: {
	order?: number;
	settings?: AchievementContentSettings;
}): ListItem<AchievementItemContentInput> {
	return {
		clientKey: `realisation-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			description: "",
			year: undefined,
			technology: "",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
