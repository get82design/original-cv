import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNamePublication } from "@/features/cv-editor/utils/fields/fieldNamePublication";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { PublicationItemContentInput } from "@/services/schemas/cvSave.schema";
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

export interface CardPublicationOneProps {
	index: number;
	item: ListItem<PublicationItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}
export const CardPublicationOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardPublicationOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent(
		"datas.publication.content",
		index,
		"content",
	);
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfPublication = watch(`${pathContent}.settings.title`);
	const watchModelDescriptionOfPublication = watch(
		`${pathContent}.settings.description`,
	);
	const watchModelJournalNameOfPublication = watch(
		`${pathContent}.settings.journalName`,
	);
	const watchModelPeriodeOfPublication = watch(
		`${pathContent}.settings.periode`,
	);
	const watchModelUrlOfPublication = watch(`${pathContent}.settings.url`);

	const deletePublication = (
		itemToDelete: ListItem<PublicationItemContentInput>,
	) => {
		const list = (getValues(FieldNamePublication.content) ??
			[]) as ListItem<PublicationItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNamePublication.content, newList, {
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
			sectionId="publication"
			clientKey={item.clientKey}
			containerId="publication"
			path={FieldNamePublication.content}
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
			onDelete={() => deletePublication(item)}
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
			<ContentPublicationContainer
				general={watchGeneral}
				item={item}
				titleCompo={
					<TextareaCv
						placeholder="Nom de l'article"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfPublication?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfPublication,
						}}
						textAlign={"left"}
					/>
				}
				journalNameCompo={
					<InputTextCv
						placeholder="Nom du journal"
						keyfilter={"int"}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.journalName`);
							setSelectInputForm(`${pathContent}.settings.withJournalName`);
						}}
						name={`${pathContent}.journalName`}
						textColor={watchModelJournalNameOfPublication?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelJournalNameOfPublication,
						}}
					/>
				}
				periodeCompo={
					<PeriodeCv
						fieldName={`${pathContent}.settings.periode`}
						afficherCacher={`${pathContent}.settings.withPeriode`}
						placeholder="Période"
						textAlign="right"
						textColor={watchModelPeriodeOfPublication?.colorSelect}
						name={`${pathContent}.periode`}
						dataInput={{
							changeSize: "1px",
							model: watchModelPeriodeOfPublication,
						}}
					/>
				}
				descriptionCompo={
					<TextareaCv
						name={`${pathContent}.description`}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.description`);
							setSelectInputForm(`${pathContent}.settings.withDescription`);
						}}
						placeholder="Petite description de votre publication"
						textColor={watchModelDescriptionOfPublication?.colorSelect}
						textAlign={watchModelDescriptionOfPublication?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelDescriptionOfPublication,
						}}
					/>
				}
				urlCompo={
					<InputTextCv
						placeholder="Lien vers l'article"
						keyfilter={"int"}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.url`);
							setSelectInputForm(`${pathContent}.settings.withUrl`);
						}}
						name={`${pathContent}.url`}
						textColor={watchModelUrlOfPublication?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelUrlOfPublication,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentPublicationContainerProps {
	general: TemplateLayout;
	item: ListItem<PublicationItemContentInput>;
	titleCompo: JSX.Element;
	journalNameCompo: JSX.Element;
	periodeCompo: JSX.Element;
	descriptionCompo: JSX.Element;
	urlCompo: JSX.Element;
}

export const ContentPublicationContainer = ({
	general,
	item,
	titleCompo,
	journalNameCompo,
	periodeCompo,
	descriptionCompo,
	urlCompo,
}: ContentPublicationContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-0 pb-1 mt-1">
			<div className="w-full flex justify-between">
				<div className="flex flex-col gap-0 w-3/4 relative">
					<CommonPointList general={general} />
					{item?.content?.settings?.withTitle && titleCompo}
					<div className="w-full -mt-1">
						{item?.content?.settings?.withJournalName && journalNameCompo}
					</div>
				</div>
				<div className="flex flex-col gap-0 w-1/4">
					{item?.content?.settings?.withPeriode && periodeCompo}
				</div>
			</div>
			{item?.content?.settings?.withDescription && descriptionCompo}
			{item?.content?.settings?.withUrl && urlCompo}
		</div>
	);
};
