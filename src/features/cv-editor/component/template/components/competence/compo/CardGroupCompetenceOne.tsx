import type { CompetenceGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import type { JSX } from "react";
import { CompetenceCardRegister } from "../../../register/competence/CompetenceCardRegister";
import { CardCompetenceOne } from "./CardCompetenceOne";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import { useRef } from "react";
import { Menu } from "primereact/menu";
import { useFormContext } from "react-hook-form";
import { FieldNameCompetence } from "@/features/cv-editor/utils/fields/fieldNameCompetence";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { CompetenceDnd } from "./CompetenceDnd";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export type CardGroupCompetenceOneProps = {
	index: number;
	item: ListItem<CompetenceGroupItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
};

export const CardGroupCompetenceOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardGroupCompetenceOneProps) => {
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const { watch, getValues, setValue } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent(
		"datas.competenceGroup.content",
		index,
		"content",
	);
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfGroup = watch(`${pathContent}.settings.groupTitle`);

	const deleteGroup = (
		itemToDelete: ListItem<CompetenceGroupItemContentInput>,
	) => {
		const list = (getValues(FieldNameCompetence.content) ??
			[]) as ListItem<CompetenceGroupItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameCompetence.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		// sélection : groupe lui-même OU un Competence de ce groupe
		const deletedCompetenceKeys = new Set(
			(itemToDelete.content?.competences ?? []).map((s) => s.clientKey),
		);
		const selectionWasInGroup =
			itemSelected === itemToDelete.clientKey ||
			deletedCompetenceKeys.has(itemSelected);

		if (selectionWasInGroup) {
			setItemSelected(newList[0]?.clientKey ?? "");
		}
	};

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionCompetence?.item ??
		"CardCompetenceOne";
	const Card = CompetenceCardRegister[itemKey] ?? CardCompetenceOne;

	return (
		<SectionItemShell
			clientKey={item.clientKey}
			sectionId="competence" // → section-competence (comme aujourd'hui)
			containerId="competenceGroup" // important pour OneColumnModel
			path={FieldNameCompetence.content}
			sortableType="card"
			sortableData={{
				competencesPath: `datas.competenceGroup.content.${index}.content.competences`,
			}}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			modifMatch="competence" // paths contiennent competenceGroup → ok
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
						<Menu
							model={itemsMenu(index)}
							popup
							ref={menuLeft}
							style={{ width: 300 }}
						/>
					</>
				) : null
			}
		>
			<ContentCompetenceGroupContainer
				general={watchGeneral}
				item={item}
				titleGroupCompo={
					<InputTextCv
						placeholder="Nom du groupe de compétence"
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
				competencesCompo={
					<CompetenceDnd
						competences={item?.content?.competences as ListItem<unknown>[]}
						groupIndex={index}
						setItemSelected={setItemSelected}
						itemSelected={itemSelected}
						clientKeyGroup={item.clientKey}
						CardComponent={Card}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentCompetenceGroupContainerProps {
	general: TemplateLayout;
	item: ListItem<CompetenceGroupItemContentInput>;
	titleGroupCompo: JSX.Element;
	competencesCompo: JSX.Element;
}

export const ContentCompetenceGroupContainer = ({
	general,
	item,
	titleGroupCompo,
	competencesCompo,
}: ContentCompetenceGroupContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-1 pb-1 mt-1">
			<div className="w-full flex justify-between items-center relative -mb-2">
				<CommonPointList general={general} />
				<div className="w-4/5">
					{item?.content?.settings?.withGroupTitle && titleGroupCompo}
				</div>
			</div>
			<div className="w-full flex flex-col gap-0">{competencesCompo}</div>
		</div>
	);
};
