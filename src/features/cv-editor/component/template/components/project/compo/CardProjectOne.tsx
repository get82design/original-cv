import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameProject } from "@/features/cv-editor/utils/fields/fieldNameProject";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { ProjectItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useCallback, useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { ElementList } from "../../input-cv/section/ElementList";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { PeriodeCv } from "@/components/input-writer/calendar/periode-cv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { ListInSection } from "../../input-cv/section/ListInSection";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardProjectOneProps {
	index: number;
	item: ListItem<ProjectItemContentInput>;
	itemSelected: string;
	setItemSelected: (itemSelected: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
	addElmList: (item: ListItem<ProjectItemContentInput>, elm: string, index: number) => void;
	deleteMission: (index: number, idx: number) => void;
}

export const CardProjectOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
	addElmList,
	deleteMission,
}: CardProjectOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.project.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfProject = watch(`${pathContent}.settings.title`);
	const watchModelTechnologyOfProject = watch(`${pathContent}.settings.technology`);
	const watchModelPeriodeOfProject = watch(`${pathContent}.settings.periode`);
	const watchModelLocationOfProject = watch(`${pathContent}.settings.location`);
	const watchModelDescriptionOfProject = watch(`${pathContent}.settings.description`);
	const watchModelMissionOfProject = watch(`${pathContent}.settings.missions`);

	const deleteProject = (itemToDelete: ListItem<ProjectItemContentInput>) => {
		const list = (getValues(FieldNameProject.content) ?? []) as ListItem<ProjectItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameProject.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		// sélection : project lui-même OU une mission de ce project
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
				watchModel={watchModelMissionOfProject}
				placeholder="décrivez brièvement la mission que vous avez accomplies dans ce projet"
				pathContent={pathContent}
			/>
		),
		[deleteMission, index, item.clientKey, itemSelected, watchModelMissionOfProject, pathContent],
	);

	return (
		<SectionItemShell
			sectionId="project"
			clientKey={item.clientKey}
			containerId="project"
			path={FieldNameProject.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			sortableType="card"
			className="flex gap-2"
			leading={
				<CommonListLigne
					watchWithIcon={watchWithIcon}
					watchListStyle={watchListStyle}
					color="gray-500"
				/>
			}
			onDelete={() => deleteProject(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentProjectContainer
				item={item}
				general={watchGeneral}
				projetNameCompo={
					<TextareaCv
						placeholder="Nom du projet"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm(`${pathContent}.settings.withTitle`);
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfProject?.colorSelect}
						textAlign="left"
						autoResize
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfProject,
						}}
					/>
				}
				periodeCompo={
					<PeriodeCv
						fieldName={`${pathContent}.settings.periode`}
						afficherCacher={`${pathContent}.settings.withPeriode`}
						placeholder="Période"
						textAlign="right"
						textColor={watchModelPeriodeOfProject?.colorSelect}
						name={`${pathContent}.periode`}
						dataInput={{
							changeSize: "1px",
							model: watchModelPeriodeOfProject,
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
						textColor={watchModelLocationOfProject?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelLocationOfProject,
						}}
						className="-mt-1"
					/>
				}
				technologyCompo={
					<InputTextCv
						placeholder="Technologie"
						textAlign="left"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.technology`);
							setSelectInputForm(`${pathContent}.settings.withtechnology`);
						}}
						name={`${pathContent}.technology`}
						textColor={watchModelTechnologyOfProject?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelTechnologyOfProject,
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
						placeholder="Petite description de votre projet"
						textColor={watchModelDescriptionOfProject?.colorSelect}
						textAlign={watchModelDescriptionOfProject?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelDescriptionOfProject,
						}}
					/>
				}
				missionsCompo={
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

interface ContentProjectContainerProps {
	item: ListItem<ProjectItemContentInput>;
	general: TemplateLayout;
	projetNameCompo: JSX.Element;
	periodeCompo: JSX.Element;
	locationCompo: JSX.Element;
	descriptionCompo: JSX.Element;
	technologyCompo: JSX.Element;
	missionsCompo: JSX.Element;
}

export const ContentProjectContainer = ({
	general,
	projetNameCompo,
	item,
	periodeCompo,
	locationCompo,
	descriptionCompo,
	technologyCompo,
	missionsCompo,
}: ContentProjectContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-1 mt-1">
			<div className="w-full flex justify-between">
				<div className="flex flex-col gap-0 w-2/3 relative">
					<CommonPointList general={general} />
					{item?.content?.settings?.withTitle && projetNameCompo}
					<div className="w-full -mt-0.5">
						{item?.content?.settings?.withTechnology && technologyCompo}
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
			<div className="w-full -mt-1">{item?.content?.settings?.withMissions && missionsCompo}</div>
		</div>
	);
};
