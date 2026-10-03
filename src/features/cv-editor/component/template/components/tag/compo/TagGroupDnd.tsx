import type { ListItem } from "@utils/type";
import type { TagGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type { TagContentSettings } from "@/services/schemas/cvTemplate.schema";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { useFormContext } from "react-hook-form";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "primereact/button";
import { FieldNameTag } from "@/features/cv-editor/utils/fields/fieldNameTag";
import { MdAdd } from "react-icons/md";
import type { GroupTagCardProps } from "../../../register/tag/GroupTagCardRegister";
import { RadioRhf } from "@/components/input/radio/RadioRhf";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface TagGroupDndProps {
	watchTags: ListItem<TagGroupItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<TagGroupItemContentInput>;
	colOfTag: number;
	GroupCardComponent: React.ComponentType<GroupTagCardProps>;
}

type TagDesign = NonNullable<TagContentSettings["design"]>;

/** Couleur texte adaptée au fond / style du design */
function colorForTagDesign(design: TagDesign) {
	if (design === "tag") return "white" as const;
	if (design === "hashtag") return "primaryColor" as const;
	return "black" as const; // border | none
}

export const TagGroupDnd = ({
	watchTags,
	itemSelected,
	setItemSelected,
	createNewItem,
	colOfTag,
	GroupCardComponent,
}: TagGroupDndProps) => {
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const { setValue, watch } = useFormContext();

	const applyDesign = (idx: number, design: TagDesign) => {
		const settingsBase = `datas.tagGroup.content.${idx}.content.settings`;
		commitCvFormHistory();
		setValue(`${settingsBase}.design`, design, { shouldDirty: true });
		setValue(`${settingsBase}.tags.colorSelect`, colorForTagDesign(design), { shouldDirty: true });
	};

	const itemsMenu = (idx: number) => {
		const designPath = `datas.tagGroup.content.${idx}.content.settings.design`;
		const watchDesign = watch(designPath) as TagDesign | undefined;

		const designRadio = (label: string, value: TagDesign) => (
			<RadioRhf
				name={designPath}
				label={label}
				value={value}
				checked={watchDesign === value}
				onChange={() => applyDesign(idx, value)}
			/>
		);

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
									{designRadio("Tag", "tag")}
									{designRadio("Border", "border")}
									{designRadio("Hashtag", "hashtag")}
									{designRadio("None", "none")}
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
					// biome-ignore lint/a11y/noStaticElementInteractions: carte : enfants déjà interactifs
					// biome-ignore lint/a11y/useKeyWithClickEvents: sélection d'item
					<div
						className="tag-group-card w-full"
						key={tag.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(tag.clientKey);
							setSectionSelected("section-tag");
						}}
					>
						<GroupCardComponent
							index={index}
							item={tag}
							itemSelected={itemSelected}
							setItemSelected={setItemSelected}
							itemsMenu={itemsMenu}
							colOfTag={colOfTag}
						/>
					</div>
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
							commitCvFormHistory();
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
