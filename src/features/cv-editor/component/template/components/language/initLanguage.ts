import type { LanguageContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import type { LanguageItemContentInput } from "@/services/schemas/cvSave.schema";
import { v4 as uuid } from "uuid";

const defaultSettings: LanguageContentSettings = {
	language: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	design: "stars",
};

export function createInitLanguage(opts?: {
	order?: number;
	settings?: LanguageContentSettings;
}): ListItem<LanguageItemContentInput> {
	return {
		clientKey: "language-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			name: "",
			level: "Débutant",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
