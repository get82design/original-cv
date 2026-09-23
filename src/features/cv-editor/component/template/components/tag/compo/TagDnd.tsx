import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import type { TagCardProps } from "../../../register/tag/TagCardRegister";

interface TagDndProps {
	tags: ListItem<unknown>[];
	groupIndex: number;
	setItemSelected: (e: string) => void;
	itemSelected: string;
	clientKeyGroup: string;
	// colOfTag: number;
	CardComponent: React.ComponentType<TagCardProps>;
}

export const TagDnd = ({
	tags,
	groupIndex,
	setItemSelected,
	itemSelected,
	clientKeyGroup,
	// colOfTag,
	CardComponent,
}: TagDndProps) => {
	const { setValue } = useFormContext();
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const createNewItem = () => {
		return {
			clientKey: `tag-${uuid()}`,
			order: tags.length + 1,
			content: { tagId: "", name: "" },
		};
	};

	const isThisGroupActive =
		itemSelected === clientKeyGroup || tags.some((t) => t.clientKey === itemSelected);

	const showAddTag = sectionSelected === "section-tag" && isThisGroupActive;

	return (
		<SortableContext items={tags.map((t) => t.clientKey)} strategy={horizontalListSortingStrategy}>
			<div className={`tag-dnd-grid flex gap-2 flex-wrap min-h-[30px]`}>
				{tags.map((tag, index) => (
					<button
						type="button"
						className="tag-card w-auto"
						key={tag.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(tag.clientKey);
							setSectionSelected("section-tag"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={tag}
							groupIndex={groupIndex}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemName={`datas.tagGroup.content.${groupIndex}.content.tags`}
							clientKeyGroup={clientKeyGroup}
						/>
					</button>
				))}
				{showAddTag && (
					<Button
						type="button"
						outlined
						icon="pi pi-plus"
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								`datas.tagGroup.content.${groupIndex}.content.tags`,
								[...tags, { ...fresh, order: tags.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					/>
				)}
			</div>
		</SortableContext>
	);
};
