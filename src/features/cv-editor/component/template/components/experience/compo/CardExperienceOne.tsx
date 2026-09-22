import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameExperience } from "@/features/cv-editor/utils/fields/fieldNameExperience";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useCallback, useRef, type JSX } from "react";
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

export interface CardExperienceOneProps {
	index: number;
	item: ListItem<ExperienceItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
	addElmList: (e: ListItem<ExperienceItemContentInput>, elm: string, index: number) => void;
	deleteMission: (index: number, idx: number) => void;
}

export const CardExperienceOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
	addElmList,
	deleteMission,
}: CardExperienceOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.experience.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfExperience = watch(`${pathContent}.settings.title`);
	const watchModelCompanyOfExperience = watch(`${pathContent}.settings.company`);
	const watchModelPeriodeOfExperience = watch(`${pathContent}.settings.periode`);
	const watchModelLocationOfExperience = watch(`${pathContent}.settings.location`);
	const watchModelDescriptionOfExperience = watch(`${pathContent}.settings.description`);
	const watchModelMissionOfExperience = watch(`${pathContent}.settings.missions`);

	const deleteExperience = (itemToDelete: ListItem<ExperienceItemContentInput>) => {
		const list = (getValues(FieldNameExperience.content) ??
			[]) as ListItem<ExperienceItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameExperience.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		// sélection : experience lui-même OU une mission de ce experience
		const deleteMissionKeys = new Set(
			(itemToDelete.content?.missions ?? []).map((s) => s.clientKey),
		);
		const selectionWasInGroup =
			itemSelected === itemToDelete.clientKey || deleteMissionKeys.has(itemSelected);

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
				watchModel={watchModelMissionOfExperience}
				placeholder="quelle est votre réussite qui correspond à l'emploi auquel vous postulez ?"
				pathContent={pathContent}
			/>
		),
		[
			deleteMission,
			index,
			item.clientKey,
			itemSelected,
			watchModelMissionOfExperience,
			pathContent,
		],
	);

	return (
		<SectionItemShell
			sectionId="experience"
			clientKey={item.clientKey}
			containerId="experience"
			path={FieldNameExperience.content}
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
			onDelete={() => deleteExperience(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentExperienceContainer
				item={item}
				titleCompo={
					<TextareaCv
						placeholder="Intitulé"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm(`${pathContent}.settings.withTitle`);
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfExperience?.colorSelect}
						textAlign="left"
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfExperience,
						}}
					/>
				}
				companyCompo={
					<InputTextCv
						placeholder="Entreprise"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.company`);
							setSelectInputForm(`${pathContent}.settings.withCompany`);
						}}
						textColor={watchModelCompanyOfExperience?.colorSelect}
						name={`${pathContent}.company`}
						dataInput={{
							changeSize: "2px",
							model: watchModelCompanyOfExperience,
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
						textColor={watchModelPeriodeOfExperience?.colorSelect}
						name={`${pathContent}.periode`}
						dataInput={{
							changeSize: "1px",
							model: watchModelPeriodeOfExperience,
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
						textColor={watchModelLocationOfExperience?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelLocationOfExperience,
						}}
						className="-mt-1"
						forceWidthFull
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
						textColor={watchModelDescriptionOfExperience?.colorSelect}
						textAlign={watchModelDescriptionOfExperience?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelDescriptionOfExperience,
						}}
					/>
				}
				//   {/*
				//   //? Composant pour liste à reporter sur les autres compo
				//   //! Faire attention aux règles withList et missions => mission
				//   */}
				listCompo={
					<ListInSection
						pathContent={pathContent}
						watchIfListAffiche={watch(`${pathContent}.settings.withListMissions`)}
						item={item}
						index={index}
						itemSelected={itemSelected}
						elmList={elmList}
						addElmList={addElmList}
					/>
				}
				general={watchGeneral}
			/>
		</SectionItemShell>
	);
};

interface ContentExperienceContainerProps {
	item: ListItem<ExperienceItemContentInput>;
	general: TemplateLayout;
	titleCompo: JSX.Element;
	companyCompo: JSX.Element;
	periodeCompo: JSX.Element;
	locationCompo: JSX.Element;
	descriptionCompo: JSX.Element;
	listCompo: JSX.Element;
}

export const ContentExperienceContainer = ({
	item,
	titleCompo,
	companyCompo,
	periodeCompo,
	locationCompo,
	descriptionCompo,
	listCompo,
	general,
}: ContentExperienceContainerProps) => {
	// console.log('item => ', item)
	return (
		<div className="w-full flex flex-col gap-1 mt-1">
			<div className="w-full flex justify-between">
				<div className="flex flex-col gap-0 w-2/3 relative">
					<CommonPointList general={general} />
					{item?.content?.settings?.withTitle && titleCompo}
					<div className="w-full -mt-0.5">
						{item?.content?.settings?.withCompany && companyCompo}
					</div>
				</div>
				<div className="flex flex-col items-end gap-0 w-1/3">
					{item?.content?.settings?.withPeriode && periodeCompo}
					<div className="w-full flex flex-col items-end -mt-0.5">
						{item?.content?.settings?.withLocation && locationCompo}
					</div>
				</div>
			</div>
			<div className="w-full -mt-1">
				{item?.content?.settings?.withDescription && descriptionCompo}
			</div>
			<div className="w-full -mt-1">{item?.content?.settings?.withListMissions && listCompo}</div>
		</div>
	);
};
