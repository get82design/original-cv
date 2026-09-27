import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

export interface CardEducationOneProps {
	index: number;
	item: ListItem<EducationItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardEducationOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardEducationOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.education.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfEducation = watch(`${pathContent}.settings.diplome`);
	const watchModelSchoolOfEducation = watch(`${pathContent}.settings.etablissement`);
	const watchModelYearOfEducation = watch(`${pathContent}.settings.year`);
	const watchModelCityOfEducation = watch(`${pathContent}.settings.ville`);

	const deleteEducation = (itemToDelete: ListItem<EducationItemContentInput>) => {
		const list = (getValues(FieldNameEducation.content) ??
			[]) as ListItem<EducationItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		commitCvFormHistory();
		setValue(FieldNameEducation.content, newList, {
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
			sectionId="education"
			clientKey={item.clientKey}
			containerId="education"
			path={FieldNameEducation.content}
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
			onDelete={() => deleteEducation(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentEducationContainer
				general={watchGeneral}
				item={item}
				educationNameCompo={
					<TextareaCv
						placeholder="Nom et niveau du diplôme"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.diplome`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfEducation?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfEducation,
						}}
						textAlign={"left"}
					/>
				}
				educationYearCompo={
					<InputTextCv
						placeholder="Année"
						keyfilter={"int"}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.year`);
							setSelectInputForm(`${pathContent}.settings.withYear`);
						}}
						name={`${pathContent}.year`}
						textAlign="right"
						textColor={watchModelYearOfEducation?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelYearOfEducation,
						}}
						forceWidthFull={true}
					/>
				}
				educationEtablissementCompo={
					<InputTextCv
						placeholder="Etablissement"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.etablissement`);
							setSelectInputForm(`${pathContent}.settings.withEtablissement`);
						}}
						name={`${pathContent}.school`}
						textColor={watchModelSchoolOfEducation?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelSchoolOfEducation,
						}}
					/>
				}
				educationVilleCompo={
					<InputTextCv
						placeholder="Ville"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.ville`);
							setSelectInputForm(`${pathContent}.settings.withVille`);
						}}
						name={`${pathContent}.city`}
						textColor={watchModelCityOfEducation?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelCityOfEducation,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentEducationContainerProps {
	general: TemplateLayout;
	item: ListItem<EducationItemContentInput>;
	educationNameCompo: JSX.Element;
	educationYearCompo: JSX.Element;
	educationEtablissementCompo: JSX.Element;
	educationVilleCompo: JSX.Element;
}

export const ContentEducationContainer = ({
	general,
	item,
	educationNameCompo,
	educationYearCompo,
	educationEtablissementCompo,
	educationVilleCompo,
}: ContentEducationContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-0 pb-1 mt-1">
			<div className="w-full flex justify-between items-start relative -mb-2">
				<CommonPointList general={general} />
				<div className="w-4/5">{educationNameCompo}</div>
				<div className="w-1/5">{item?.content?.settings?.withYear && educationYearCompo}</div>
			</div>
			<div className="flex gap-1 items-end">
				{item?.content?.settings?.withEtablissement && educationEtablissementCompo}
				{item?.content?.settings?.withVille && item?.content?.settings?.withEtablissement && (
					<p>/</p>
				)}
				{item?.content?.settings?.withVille && educationVilleCompo}
			</div>
		</div>
	);
};
