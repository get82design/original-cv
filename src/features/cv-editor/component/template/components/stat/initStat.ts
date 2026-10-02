import type { StatItemContentInput } from "@/services/schemas/cvSave.schema";
import type { StatContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: StatContentSettings = {
	value: {
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
		sizeSelect: "lg",
		weightSelect: "lg",
		withPrimaryColor: true,
		textAlign: "center",
	},
	label: {
		sizeModel: "14px",
		weightModel: 400,
		colorSelect: "primaryColor",
		sizeSelect: "sm",
		weightSelect: "sm",
		withPrimaryColor: false,
		textAlign: "center",
	},
	withValue: true,
	withLabel: true,
	columns: 3,
	displayMode: "grid",
};

export function createInitStat(opts?: {
	order?: number;
	settings?: StatContentSettings;
}): ListItem<StatItemContentInput> {
	return {
		clientKey: `stat-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			label: "",
			value: "",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
