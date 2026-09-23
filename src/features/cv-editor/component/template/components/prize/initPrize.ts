import type { PrizeItemContentInput } from "@/services/schemas/cvSave.schema";
import type { PrizeContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: PrizeContentSettings = {
	title: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	domaine: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withTitle: true,
	withDomain: true,
	withIcon: true,
	iconColor: "primaryColor",
	columns: 1,
};

export function createInitPrize(opts?: {
	order?: number;
	settings?: PrizeContentSettings;
}): ListItem<PrizeItemContentInput> {
	return {
		clientKey: `prize-${uuid()}`,
		order: opts?.order ?? 0,
		content: {
			title: "",
			domaine: "",
			icon: "PiMedal",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
