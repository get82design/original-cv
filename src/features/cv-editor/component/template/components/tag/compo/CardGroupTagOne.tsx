import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameTag } from "@/features/cv-editor/utils/fields/fieldNameTag";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { TagGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { TagCardRegister } from "../../../register/tag/TagCardRegister";
import { CardTagOne } from "./CardTagOne";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { TagDnd } from "./TagDnd";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

export type CardGroupTagOneProps = {
	index: number;
	item: ListItem<TagGroupItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
	// colOfTag: number;
};

export const CardGroupTagOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
	// colOfTag,
}: CardGroupTagOneProps) => {
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const { watch, getValues, setValue } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.tagGroup.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfGroup = watch(`${pathContent}.settings.groupTitle`);

	const deleteGroup = (itemToDelete: ListItem<TagGroupItemContentInput>) => {
		const list = (getValues(FieldNameTag.content) ?? []) as ListItem<TagGroupItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		commitCvFormHistory();
		setValue(FieldNameTag.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		// sélection : groupe lui-même OU un Competence de ce groupe
		const deletedTagKeys = new Set((itemToDelete.content?.tags ?? []).map((s) => s.clientKey));
		const selectionWasInGroup =
			itemSelected === itemToDelete.clientKey || deletedTagKeys.has(itemSelected);

		if (selectionWasInGroup) {
			setItemSelected(newList[0]?.clientKey ?? "");
		}
	};

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionTag?.item ?? "CardTagOne";
	const Card = TagCardRegister[itemKey] ?? CardTagOne;

	return (
		<SectionItemShell
			clientKey={item.clientKey}
			sectionId="tag" // → section-tag (comme aujourd'hui)
			containerId="tagGroup" // important pour OneColumnModel
			path={FieldNameTag.content}
			sortableType="card"
			sortableData={{
				tagsPath: `datas.tagGroup.content.${index}.content.tags`,
			}}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			modifMatch="tag" // paths contiennent tagGroup → ok
			className="flex gap-2"
			leading={
				<CommonListLigne
					watchWithIcon={watchWithIcon}
					watchListStyle={watchListStyle}
					color="gray-500"
				/>
			}
			onDelete={() => deleteGroup(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentTagGroupContainer
				general={watchGeneral}
				item={item}
				titleGroupCompo={
					<InputTextCv
						placeholder="Nom du groupe de tags"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.groupTitle`);
							setSelectInputForm(`${pathContent}.settings.withGroupTitle`);
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfGroup?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfGroup,
						}}
						textAlign={"left"}
					/>
				}
				tagsCompo={
					<TagDnd
						tags={item?.content?.tags as ListItem<unknown>[]}
						groupIndex={index}
						setItemSelected={setItemSelected}
						itemSelected={itemSelected}
						clientKeyGroup={item.clientKey}
						// colOfTag={colOfTag}
						CardComponent={Card}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentTagGroupContainerProps {
	general: TemplateLayout;
	item: ListItem<TagGroupItemContentInput>;
	titleGroupCompo: JSX.Element;
	tagsCompo: JSX.Element;
}

export const ContentTagGroupContainer = ({
	general,
	item,
	titleGroupCompo,
	tagsCompo,
}: ContentTagGroupContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-3 pb-1 mt-1">
			<div className="w-full flex justify-between items-center relative -mb-2">
				<CommonPointList general={general} />
				<div className="w-4/5">{item?.content?.settings?.withGroupTitle && titleGroupCompo}</div>
			</div>
			<div className="w-full flex flex-col gap-0">{tagsCompo}</div>
		</div>
	);
};
