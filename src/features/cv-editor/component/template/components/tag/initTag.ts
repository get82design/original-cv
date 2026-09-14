import type { TagGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type { TagContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: TagContentSettings = {
	groupTitle: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	tags: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "white",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withGroupTitle: false,
	design: "tag",
};

export function createInitTag(opts?: {
	order?: number;
	settings?: TagContentSettings;
}): ListItem<TagGroupItemContentInput> {
	return {
		clientKey: "tagGroup-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "tag group " + uuid(),
			tags: [
				{
					clientKey: "tag-" + uuid(),
					order: 1,
					content: {
						name: "",
						tagId: undefined,
					},
				},
			],
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
