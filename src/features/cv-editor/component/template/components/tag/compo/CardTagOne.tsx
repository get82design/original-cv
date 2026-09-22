import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { useColumnFg } from "@/features/cv-editor/component/kit-dnd/shared/ColumnFgContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import type { ListItem } from "@utils/type";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { TagCv } from "../../input-cv/tag-cv/TagCv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import type { JSX } from "react";

export type CardTagOneProps = {
	index: number;
	item: ListItem<unknown>;
	groupIndex: number;
	setItemSelected: (e: string) => void;
	itemSelected: string;
	itemName: string;
	clientKeyGroup: string;
};

export const CardTagOne = ({
	index,
	item,
	groupIndex,
	setItemSelected,
	itemSelected,
	itemName,
	clientKeyGroup,
}: CardTagOneProps) => {
	const { watch, getValues, setValue } = useFormContext();
	const { setSelectModifInput, setSelectInputForm, sectionSelected } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = `datas.tagGroup.content.${groupIndex}.content.tags.${index}.content`;
	const watchDesign = watch(`datas.tagGroup.content.${groupIndex}.content.settings.design`);
	const watchModelTag = watch(`datas.tagGroup.content.${groupIndex}.content.settings.tags`);
	const columnFg = useColumnFg();
	const design = watchDesign ?? "tag";
	// Pastille : blanc sur primary. Border/none : noir, ou fg sidebar (blanc).
	const tagTextColor =
		design === "tag"
			? "white"
			: design === "border" || design === "none"
				? (columnFg ?? "black")
				: (columnFg ?? watchModelTag?.colorSelect ?? "black");
	const tagCssColor = useInputCvColor(tagTextColor, {
		ignoreColumnFg: design === "tag",
	});

	// const deleteItem = (itemToDelete: ListItem<unknown>) => {
	// 	const list = (getValues(itemName) ?? []) as ListItem<unknown>[];

	// 	const newList = list
	// 		.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
	// 		.map((entry, i) => ({ ...entry, order: i + 1 }));

	// 	setValue(itemName, newList, { shouldDirty: true, shouldTouch: true });

	// 	// si on supprime l'élément sélectionné → basculer sur un autre / le groupe
	// 	if (itemSelected === itemToDelete.clientKey) {
	// 		setItemSelected(newList[0]?.clientKey ?? clientKeyGroup);
	// 	}
	// };

	const handleDelete = (gIdx: number, idx: number) => {
		const path = `datas.tagGroup.content.${gIdx}.content.tags`;
		const list = (getValues(path) ?? []) as ListItem<unknown>[];
		const removed = list[idx];
		const newList = list
			.filter((_, i) => i !== idx)
			.map((entry, i) => ({ ...entry, order: i + 1 }));
		setValue(path, newList, { shouldDirty: true, shouldTouch: true });
		if (removed && itemSelected === (removed as { clientKey: string }).clientKey) {
			setItemSelected(newList[0]?.clientKey ?? clientKeyGroup);
		}
	};

	const isSelected = itemSelected === item.clientKey;
	const label =
		watch(`${pathContent}.name`) ?? (item as { content?: { name?: string } })?.content?.name ?? "";

	return (
		<SectionItemShell
			clientKey={item.clientKey}
			sectionId="tag"
			containerId={clientKeyGroup} // id du groupe parent, pas "tagGroup"
			path={itemName} // path de la liste tags
			sortableType="subcard"
			sortableData={{
				type: "subcard", // override le "card" du shell
				groupIndex,
			}}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			modifMatch="tag"
			// onDelete={() => deleteItem(item)}
			// pas de leading / toolbarExtra
		>
			<ContentTagContainer
				tagCompo={
					<TagCv
						style={design}
						groupIndex={groupIndex}
						index={index}
						onDelete={handleDelete}
						dataInput={{ changeSize: "2px", model: watchModelTag }}
						showDelete={sectionSelected.includes("tag")}
					>
						{isSelected ? (
							<InputTextCv
								placeholder="Tag"
								autoFocus
								onClick={() => {
									setSelectModifInput(`datas.tagGroup.content.${groupIndex}.content.settings.tags`);
									setSelectInputForm("");
								}}
								forceWidthFull
								name={`${pathContent}.name`}
								textColor={tagTextColor}
								ignoreColumnFg={design === "tag"}
								dataInput={{ changeSize: "2px", model: watchModelTag }}
							/>
						) : (
							<span
								className="my-0"
								style={{ color: tagCssColor ? `var(--${tagCssColor})` : undefined }}
								onClick={() => {
									setSelectModifInput(`datas.tagGroup.content.${groupIndex}.content.settings.tags`);
									setSelectInputForm("");
								}}
							>
								{label || "Tag"}
							</span>
						)}
					</TagCv>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentTagContainerProps {
	tagCompo: JSX.Element;
}

export const ContentTagContainer = ({ tagCompo }: ContentTagContainerProps) => {
	return <div>{tagCompo}</div>;
};
