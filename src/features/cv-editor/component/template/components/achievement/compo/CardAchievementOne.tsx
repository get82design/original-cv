import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameAchievement } from "@/features/cv-editor/utils/fields/fieldNameAchievement";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { AchievementItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

export interface CardAchievementOneProps {
	index: number;
	item: ListItem<AchievementItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardAchievementOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardAchievementOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent(
		"datas.achievement.content",
		index,
		"content",
	);
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfAchievement = watch(`${pathContent}.settings.title`);
	const watchModelDescriptionOfAchievement = watch(
		`${pathContent}.settings.description`,
	);
	const watchModelYearOfAchievement = watch(`${pathContent}.settings.year`);
	const watchModelTechnologyOfAchievement = watch(
		`${pathContent}.settings.technology`,
	);

	const deleteAchievement = (
		itemToDelete: ListItem<AchievementItemContentInput>,
	) => {
		const list = (getValues(FieldNameAchievement.content) ??
			[]) as ListItem<AchievementItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameAchievement.content, newList, {
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
			sectionId="achievement"
			clientKey={item.clientKey}
			containerId="achievement"
			path={FieldNameAchievement.content}
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
			onDelete={() => deleteAchievement(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<button
							type="button"
							className="p-2 cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								menuLeft.current?.toggle(e);
							}}
						>
							options
						</button>
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
			<ContentAchievementContainer
				general={watchGeneral}
				realisationCompo={
					<TextareaCv
						placeholder="Titre de la réalisation"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfAchievement?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfAchievement,
						}}
						textAlign={"left"}
					/>
				}
				descriptionCompo={
					<TextareaCv
						placeholder="Description de la réalisation"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.description`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.description`}
						textColor={watchModelDescriptionOfAchievement?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelDescriptionOfAchievement,
						}}
						textAlign={"left"}
					/>
				}
				yearCompo={
					<InputTextCv
						placeholder="Année"
						keyfilter={"int"}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.year`);
							setSelectInputForm(`${pathContent}.settings.withYear`);
						}}
						name={`${pathContent}.year`}
						textAlign="right"
						textColor={watchModelYearOfAchievement?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelYearOfAchievement,
						}}
					/>
				}
				technologyCompo={
					<InputTextCv
						placeholder="Technologie"
						keyfilter={"int"}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.technology`);
							setSelectInputForm(`${pathContent}.settings.withTechnology`);
						}}
						name={`${pathContent}.technology`}
						className="-mt-1"
						textAlign="left"
						textColor={watchModelTechnologyOfAchievement?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTechnologyOfAchievement,
						}}
					/>
				}
				item={item}
			/>
		</SectionItemShell>
	);
};

interface ContentAchievementContainerProps {
	general: TemplateLayout;
	realisationCompo: JSX.Element;
	descriptionCompo: JSX.Element;
	yearCompo: JSX.Element;
	technologyCompo: JSX.Element;
	item: ListItem<AchievementItemContentInput>;
}

export const ContentAchievementContainer = ({
	general,
	realisationCompo,
	descriptionCompo,
	yearCompo,
	technologyCompo,
	item,
}: ContentAchievementContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-0 relative mt-1">
			<CommonPointList general={general} />
			<div className="w-full flex justify-between gap-2">
				<div className="w-4/5">
					{item?.content?.settings?.withTitle && realisationCompo}
				</div>
				<div className="w=1/5">
					{item?.content?.settings?.withYear && yearCompo}
				</div>
			</div>
			{item?.content?.settings?.withTechnology && technologyCompo}
			{item?.content?.settings?.withDescription && descriptionCompo}
		</div>
	);
};
