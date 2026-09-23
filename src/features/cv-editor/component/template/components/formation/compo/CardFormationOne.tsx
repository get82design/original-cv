import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameFormation } from "@/features/cv-editor/utils/fields/fieldNameFormation";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { FormationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { PeriodeCv } from "@/components/input-writer/calendar/periode-cv";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardFormationOneProps {
	index: number;
	item: ListItem<FormationItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardFormationOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardFormationOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.formation.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfFormation = watch(`${pathContent}.settings.title`);
	const watchModelOrganismeFormation = watch(`${pathContent}.settings.organismeFormation`);
	const watchModelYearOfFormation = watch(`${pathContent}.settings.periode`);
	// const watchModelStatusOfFormation = watch(`${pathContent}.settings.status`);

	const deleteFormation = (itemToDelete: ListItem<FormationItemContentInput>) => {
		const list = (getValues(FieldNameFormation.content) ??
			[]) as ListItem<FormationItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameFormation.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		const selectionWasInGroup = itemSelected === itemToDelete.clientKey;

		if (selectionWasInGroup) {
			setItemSelected(newList[0]?.clientKey ?? "");
		}
	};
	return (
		<SectionItemShell
			sectionId="formation"
			clientKey={item.clientKey}
			containerId="formation"
			path={FieldNameFormation.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			className="flex gap-2"
			sortableType="card"
			leading={
				<CommonListLigne
					watchWithIcon={watchWithIcon}
					watchListStyle={watchListStyle}
					color="gray-500"
				/>
			}
			onDelete={() => deleteFormation(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentFormationContainer
				general={watchGeneral}
				item={item}
				inputFormation={
					<TextareaCv
						placeholder="Intitulé de la formation"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfFormation?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfFormation,
						}}
						textAlign={"left"}
					/>
				}
				inputOrganisme={
					<InputTextCv
						placeholder="Organisme de la formation"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.organismeFormation`);
							setSelectInputForm(`${pathContent}.settings.withOrganismeFormation`);
						}}
						name={`${pathContent}.organismeFormation`}
						textColor={watchModelOrganismeFormation?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelOrganismeFormation,
						}}
					/>
				}
				inputPeriode={
					<PeriodeCv
						fieldName={`${pathContent}.settings.periode`}
						afficherCacher={`${pathContent}.settings.withPeriode`}
						placeholder="Période"
						textAlign="left"
						textColor={watchModelYearOfFormation?.colorSelect}
						name={`${pathContent}.periode`}
						dataInput={{
							changeSize: "1px",
							model: watchModelYearOfFormation,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentFormationContainerProps {
	general: TemplateLayout;
	inputFormation: JSX.Element;
	inputOrganisme: JSX.Element;
	inputPeriode: JSX.Element;
	item: ListItem<FormationItemContentInput>;
}

export const ContentFormationContainer = ({
	general,
	inputFormation,
	inputOrganisme,
	inputPeriode,
	item,
}: ContentFormationContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-0 px-2 relative mt-1">
			<CommonPointList general={general} />
			{item?.content?.settings?.withTitle && inputFormation}
			{item?.content?.settings?.withOrganismeFormation && inputOrganisme}
			{item?.content?.settings?.withPeriode && inputPeriode}
		</div>
	);
};
