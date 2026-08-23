import type { ListItem } from "@utils/type";
import type { TagGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { useFormContext } from "react-hook-form";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "primereact/button";
import { FieldNameTag } from "@/features/cv-editor/utils/fields/fieldNameTag";
import { MdAdd } from "react-icons/md";
import type { GroupTagCardProps } from "../../../register/tag/GroupTagCardRegister";
import { RadioRhf } from "@/components/input/radio/RadioRhf";

interface TagGroupDndProps {
	watchTags: ListItem<TagGroupItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<TagGroupItemContentInput>;
	colOfTag: number;
	GroupCardComponent: React.ComponentType<GroupTagCardProps>;
}

//! Penser le composant qui possède plusieurs zones de plusieurs Tags qui peuvent dnd entre eux dans la zone
//! Mais ce même composant doit pouvoir dnd les différents zones de Tags

export const TagGroupDnd = ({
	watchTags,
	itemSelected,
	setItemSelected,
	createNewItem,
	colOfTag,
	GroupCardComponent,
}: TagGroupDndProps) => {
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const { setValue, getValues } = useFormContext();


	const itemsMenu = (idx: number) => {
		const designPath = `datas.tagGroup.content.${idx}.content.settings.design`;
		const watchDesign = getValues(designPath);
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Nom du groupe</p>
								<ToggleAfficherCacher
									name={`datas.tagGroup.content.${idx}.content.settings.withGroupTitle`}
								/>
							</div>
						),
					},
					{
						template: (
							<div className="flex flex-col py-1 px-4 gap-2">
								<p>Design</p>
								<div className="grid grid-cols-2 gap-2">
									<RadioRhf
										name={designPath}
										label="Tag"
										value="tag"
										checked={watchDesign === "tag"}
									/>
									<RadioRhf
										name={designPath}
										label="Border"
										value="border"
										checked={watchDesign === "border"}
									/>
									<RadioRhf
										name={designPath}
										label="Hashtag"
										value="hashtag"
										checked={watchDesign === "hashtag"}
									/>
									<RadioRhf
										name={designPath}
										label="None"
										value="none"
										checked={watchDesign === "none"}
									/>
								</div>
							</div>
						),
					},
				],
			},
		];
	};

	const showAddGroup = sectionSelected === "section-tag";

	return (
		<SortableContext
			items={watchTags.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className="tags-grid">
				{watchTags.map((tag, index) => (
					<button
						type="button"
						className="tag-group-card w-full"
						key={tag.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(tag.clientKey);
							setSectionSelected("section-tag"); // global : sa section
						}}
					>
						<GroupCardComponent
							index={index}
							item={tag}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
							colOfTag={colOfTag}
						/>
					</button>
				))}
				{showAddGroup && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								FieldNameTag.content,
								[...watchTags, { ...fresh, order: watchTags.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un groupe</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
