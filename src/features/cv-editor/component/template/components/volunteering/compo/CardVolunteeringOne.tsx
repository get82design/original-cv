import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameVolunteering } from "@/features/cv-editor/utils/fields/fieldNameVolunteering";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { VolunteeringItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, useCallback, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { ElementList } from "../../input-cv/section/ElementList";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { PeriodeCv } from "@/components/input-writer/calendar/periode-cv";
import { ListInSection } from "../../input-cv/section/ListInSection";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardVolunteeringOneProps {
	index: number;
	item: ListItem<VolunteeringItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
	addElmList: (
		e: ListItem<VolunteeringItemContentInput>,
		elm: string,
		index: number,
	) => void;
	deleteMission: (index: number, idx: number) => void;
}

export const CardVolunteeringOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
	addElmList,
	deleteMission,
}: CardVolunteeringOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent(
		"datas.volunteering.content",
		index,
		"content",
	);
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfVolunteering = watch(`${pathContent}.settings.title`);
	const watchModelOrganisationOfVolunteering = watch(
		`${pathContent}.settings.organisation`,
	);
	const watchModelPeriodeOfVolunteering = watch(
		`${pathContent}.settings.periode`,
	);
	const watchModelLocationOfVolunteering = watch(
		`${pathContent}.settings.location`,
	);
	const watchModelDescriptionOfVolunteering = watch(
		`${pathContent}.settings.description`,
	);
	const watchModelMissionOfVolunteering = watch(
		`${pathContent}.settings.missions`,
	);

	const deleteVolunteering = (
		itemToDelete: ListItem<VolunteeringItemContentInput>,
	) => {
		const list = (getValues(FieldNameVolunteering.content) ??
			[]) as ListItem<VolunteeringItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameVolunteering.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		// sélection : Volunteering lui-même OU une mission de ce Volunteering
		const deleteMissionKeys = new Set(
			(itemToDelete.content?.missions ?? []).map((s) => s.clientKey),
		);
		const selectionWasInGroup =
			itemSelected === itemToDelete.clientKey ||
			deleteMissionKeys.has(itemSelected);

		if (selectionWasInGroup) {
			setItemSelected(newList[0]?.clientKey ?? "");
		}
	};

	const elmList = useCallback(
		(_content: ListItem<any>, idx: number) => (
			<ElementList
				key={idx}
				index={index}
				idx={idx}
				itemSelected={itemSelected}
				itemClientKey={item.clientKey}
				deleteMission={deleteMission}
				watchModel={watchModelMissionOfVolunteering}
				placeholder="quelle est votre réussite qui correspond à l'emploi auquel vous postulez ?"
				pathContent={pathContent}
			/>
		),
		[
			deleteMission,
			index,
			item.clientKey,
			itemSelected,
			watchModelMissionOfVolunteering,
			pathContent,
		],
	);
	return (
		<SectionItemShell
			sectionId="volunteering"
			clientKey={item.clientKey}
			containerId="volunteering"
			path={FieldNameVolunteering.content}
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
			onDelete={() => deleteVolunteering(item)}
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
			<ContentVolunteeringContainer
				general={watchGeneral}
				item={item}
				titleCompo={
					<TextareaCv
						placeholder="Intitulé"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm(`${pathContent}.settings.withTitle`);
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfVolunteering?.colorSelect}
						textAlign="left"
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfVolunteering,
						}}
					/>
				}
				organisationCompo={
					<InputTextCv
						placeholder="Organisation"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.organisation`);
							setSelectInputForm(`${pathContent}.settings.withOrganisation`);
						}}
						textColor={watchModelOrganisationOfVolunteering?.colorSelect}
						name={`${pathContent}.organisation`}
						dataInput={{
							changeSize: "2px",
							model: watchModelOrganisationOfVolunteering,
						}}
						className="-mt-1.5"
					/>
				}
				periodeCompo={
					<PeriodeCv
						fieldName={`${pathContent}.settings.periode`}
						afficherCacher={`${pathContent}.settings.withPeriode`}
						placeholder="Période"
						textAlign="right"
						textColor={watchModelPeriodeOfVolunteering?.colorSelect}
						name={`${pathContent}.periode`}
						dataInput={{
							changeSize: "1px",
							model: watchModelPeriodeOfVolunteering,
						}}
					/>
				}
				locationCompo={
					<InputTextCv
						placeholder="Lieu"
						textAlign="right"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.location`);
							setSelectInputForm(`${pathContent}.settings.withLocation`);
						}}
						name={`${pathContent}.location`}
						textColor={watchModelLocationOfVolunteering?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelLocationOfVolunteering,
						}}
						className="-mt-1"
					/>
				}
				descriptionCompo={
					<TextareaCv
						name={`${pathContent}.description`}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.description`);
							setSelectInputForm(`${pathContent}.settings.withDescription`);
						}}
						placeholder="Petite description de votre expérience"
						textColor={watchModelDescriptionOfVolunteering?.colorSelect}
						textAlign={watchModelDescriptionOfVolunteering?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelDescriptionOfVolunteering,
						}}
					/>
				}
				listCompo={
					<ListInSection
						pathContent={pathContent}
						watchIfListAffiche={watch(`${pathContent}.settings.withMissions`)}
						item={item}
						index={index}
						itemSelected={itemSelected}
						elmList={elmList}
						addElmList={addElmList}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentVolunteeringContainerProps {
	general: TemplateLayout;
	item: ListItem<VolunteeringItemContentInput>;
	titleCompo: JSX.Element;
	organisationCompo: JSX.Element;
	periodeCompo: JSX.Element;
	locationCompo: JSX.Element;
	descriptionCompo: JSX.Element;
	listCompo: JSX.Element;
}

export const ContentVolunteeringContainer = ({
	general,
	item,
	titleCompo,
	organisationCompo,
	periodeCompo,
	locationCompo,
	descriptionCompo,
	listCompo,
}: ContentVolunteeringContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-0 pb-1 mt-1">
			<div className="w-full flex justify-between">
				<div className="flex flex-col gap-0 w-4/5 relative">
					<CommonPointList general={general} />
					{item.content?.settings?.withTitle && titleCompo}
					{item.content?.settings?.withOrganisation && organisationCompo}
				</div>
				<div className="flex flex-col gap-0 w-1/5 items-end">
					{item.content?.settings?.withPeriode && periodeCompo}
					{item.content?.settings?.withLocation && locationCompo}
				</div>
			</div>
			{item.content?.settings?.withDescription && descriptionCompo}
			{item.content?.settings?.withMissions && listCompo}
		</div>
	);
};
