import type { PassionItemContentInput } from "@/services/schemas/cvSave.schema";
import type { PassionContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: PassionContentSettings = {
	passion: {
		sizeModel: "13px",
		weightModel: 400,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withIcon: true,
	iconColor: "primaryColor",
	columns: 3,
};

export function createInitPassion(opts?: {
	order?: number;
	settings?: PassionContentSettings;
}): ListItem<PassionItemContentInput> {
	return {
		clientKey: "formation-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "",
			icon: "BsBalloonHeartFill",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
