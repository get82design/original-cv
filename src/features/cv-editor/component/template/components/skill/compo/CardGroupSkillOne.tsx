import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameSkill } from "@/features/cv-editor/utils/fields/fieldNameSkill";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SkillCardRegister } from "../../../register/skill/SkillCardRegister";
import { CardSkillOne } from "./CardSkillOne";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { SkillDnd } from "./SkillDnd";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

export type CardGroupSkillOneProps = {
	index: number;
	item: ListItem<SkillGroupItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
	// colOfSkill: number;
};

export const CardGroupSkillOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
	// colOfSkill,
}: CardGroupSkillOneProps) => {
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const { watch, getValues, setValue } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.skillGroup.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfGroup = watch(`${pathContent}.settings.groupTitle`);

	const deleteGroup = (itemToDelete: ListItem<SkillGroupItemContentInput>) => {
		const list = (getValues(FieldNameSkill.content) ??
			[]) as ListItem<SkillGroupItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		commitCvFormHistory();
		setValue(FieldNameSkill.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		// sélection : groupe lui-même OU un skill de ce groupe
		const deletedSkillKeys = new Set((itemToDelete.content?.skills ?? []).map((s) => s.clientKey));
		const selectionWasInGroup =
			itemSelected === itemToDelete.clientKey || deletedSkillKeys.has(itemSelected);

		if (selectionWasInGroup) {
			setItemSelected(newList[0]?.clientKey ?? "");
		}
	};

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionSkill?.item ?? "CardSkillOne";
	const Card = SkillCardRegister[itemKey] ?? CardSkillOne;

	return (
		<SectionItemShell
			clientKey={item.clientKey}
			sectionId="skill" // → section-skill (comme aujourd'hui)
			containerId="skillGroup" // important pour OneColumnModel
			path={FieldNameSkill.content}
			sortableType="card"
			sortableData={{
				skillsPath: `datas.skillGroup.content.${index}.content.skills`,
			}}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			modifMatch="skill" // paths contiennent skillGroup → ok
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
			<ContentSkillGroupContainer
				general={watchGeneral}
				item={item}
				titleGroupCompo={
					<InputTextCv
						placeholder="Nom du group de skill"
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
						forceWidthFull={true}
					/>
				}
				skillsCompo={
					<SkillDnd
						skills={item?.content?.skills as ListItem<unknown>[]}
						groupIndex={index}
						setItemSelected={setItemSelected}
						itemSelected={itemSelected}
						clientKeyGroup={item.clientKey}
						// colOfSkill={colOfSkill}
						CardComponent={Card}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentSkillGroupContainerProps {
	general: TemplateLayout;
	item: ListItem<SkillGroupItemContentInput>;
	titleGroupCompo: JSX.Element;
	skillsCompo: JSX.Element;
}

export const ContentSkillGroupContainer = ({
	general,
	item,
	titleGroupCompo,
	skillsCompo,
}: ContentSkillGroupContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-1 pb-1 mt-1">
			<div className="w-full flex justify-between items-center relative -mb-2">
				<CommonPointList general={general} />
				<div className="w-full">{item?.content?.settings?.withGroupTitle && titleGroupCompo}</div>
			</div>
			<div className="w-full flex flex-col gap-0">{skillsCompo}</div>
		</div>
	);
};
