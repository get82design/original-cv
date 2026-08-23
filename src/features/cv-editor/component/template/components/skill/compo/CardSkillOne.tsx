import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { ListItem } from "@utils/type";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { RatingCvInput } from "../../input-cv/rating-cv/RatingCvInput";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";

export type CardSkillOneProps = {
	index: number;
	item: ListItem<unknown>;
	groupIndex: number;
	setItemSelected: (e: string) => void;
	itemSelected: string;
	itemName: string;
	clientKeyGroup: string;
};

export const CardSkillOne = ({
	index,
	item,
	groupIndex,
	setItemSelected,
	itemSelected,
	itemName,
	clientKeyGroup,
}: CardSkillOneProps) => {
	const { watch, getValues, setValue } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = `datas.skillGroup.content.${groupIndex}.content.skills.${index}.content`;
	const watchModelSkill = watch(
		`datas.skillGroup.content.${groupIndex}.content.settings.skills`,
	);
	const watchDesignSkill = watch(
		`datas.skillGroup.content.${groupIndex}.content.settings.design`,
	);

	const deleteItem = (itemToDelete: ListItem<unknown>) => {
		const list = (getValues(itemName) ?? []) as ListItem<unknown>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(itemName, newList, { shouldDirty: true, shouldTouch: true });

		// si on supprime l'élément sélectionné → basculer sur un autre / le groupe
		if (itemSelected === itemToDelete.clientKey) {
			setItemSelected(newList[0]?.clientKey ?? clientKeyGroup);
		}
	};

	return (
		<SectionItemShell
			clientKey={item.clientKey}
			sectionId="skill"
			containerId={clientKeyGroup} // id du groupe parent, pas "skillGroup"
			path={itemName} // path de la liste skills
			sortableType="subcard"
			sortableData={{
				type: "subcard", // override le "card" du shell
				groupIndex,
			}}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			modifMatch="skill"
			onDelete={() => deleteItem(item)}
			// pas de leading / toolbarExtra
		>
			<ContentSkillContainer
				general={watchGeneral}
				item={item}
				skillCompo={
					<InputTextCv
						placeholder="Skill"
						onClick={() => {
							setSelectModifInput(
								`datas.skillGroup.content.${groupIndex}.content.settings.skills`,
							);
							setSelectInputForm("");
						}}
						forceWidthFull
						name={`${pathContent}.name`}
						textColor={watchModelSkill?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelSkill,
						}}
					/>
				}
				levelCompo={
					<RatingCvInput
						name={`${pathContent}.level`}
						design={watchDesignSkill}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentSkillContainerProps {
	general: TemplateLayout;
	item: ListItem<unknown>;
	skillCompo: JSX.Element;
	levelCompo: JSX.Element;
}

export const ContentSkillContainer = ({
	general,
	item,
	skillCompo,
	levelCompo,
}: ContentSkillContainerProps) => {
	return (
		<div className="w-1/4 flex justify-between items-center gap-2 px-2 relative mr-2 mt-1">
			<div className="min-w-[90px]">{skillCompo}</div>
			{levelCompo}
		</div>
	);
};
