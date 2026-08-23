import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { ListItem } from "@utils/type";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";

export type CardCompetenceOneProps = {
	index: number;
	item: ListItem<unknown>;
	groupIndex: number;
	setItemSelected: (e: string) => void;
	itemSelected: string;
	itemName: string;
	clientKeyGroup: string;
};

export const CardCompetenceOne = ({
	index,
	item,
	groupIndex,
	setItemSelected,
	itemSelected,
	itemName,
	clientKeyGroup,
}: CardCompetenceOneProps) => {
	const { watch, getValues, setValue } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = `datas.competenceGroup.content.${groupIndex}.content.competences.${index}.content`;
	const watchModelCompetence = watch(
		`datas.competenceGroup.content.${groupIndex}.content.settings.competences`,
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
			sectionId="competence"
			containerId={clientKeyGroup} // id du groupe parent, pas "competenceGroup"
			path={itemName} // path de la liste competences
			sortableType="subcard"
			sortableData={{
				type: "subcard", // override le "card" du shell
				groupIndex,
			}}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			modifMatch="competence"
			onDelete={() => deleteItem(item)}
			// pas de leading / toolbarExtra
		>
			<ContentCompetenceContainer
				general={watchGeneral}
				item={item}
				competenceCompo={
					<InputTextCv
						placeholder="Compétence"
						onClick={() => {
							setSelectModifInput(
								`datas.competenceGroup.content.${groupIndex}.content.settings.competences`,
							);
							setSelectInputForm("");
						}}
						forceWidthFull={true}
						className="w-full"
						name={`${pathContent}.name`}
						textColor={watchModelCompetence?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelCompetence,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentCompetenceContainerProps {
	general: TemplateLayout;
	item: ListItem<unknown>;
	competenceCompo: JSX.Element;
}

export const ContentCompetenceContainer = ({
	general,
	item,
	competenceCompo,
}: ContentCompetenceContainerProps) => {
	return (
		<div className="w-full flex justify-between items-center gap-2 px-2 relative ml-4">
			{competenceCompo}
		</div>
	);
};
