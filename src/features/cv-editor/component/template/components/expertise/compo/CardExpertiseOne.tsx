import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameExpertise } from "@/features/cv-editor/utils/fields/fieldNameExpertise";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import type { ExpertiseItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { RatingCvInput } from "../../input-cv/rating-cv/RatingCvInput";
import type { JSX } from "react";

export interface CardExpertiseOneProps {
	index: number;
	item: ListItem<ExpertiseItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
}

export const CardExpertiseOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
}: CardExpertiseOneProps) => {
	const { watch, getValues, setValue } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const pathContentSettings = moduleField(watch("modules"), "expertise", "settings", "content");
	const watchDesignExpertise = watch(`${pathContentSettings}.design`);
	const pathContent = `datas.expertise.content.${index}.content`;
	const watchModelTitle = watch(`${pathContent}.settings.title`);

	const deleteExpertise = (itemToDelete: ListItem<ExpertiseItemContentInput>) => {
		const list = (getValues(FieldNameExpertise.content) ??
			[]) as ListItem<ExpertiseItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameExpertise.content, newList, {
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
			clientKey={item.clientKey}
			sectionId="expertise"
			containerId="expertise"
			path={FieldNameExpertise.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			sortableType="card"
			onDelete={() => deleteExpertise(item)}
		>
			<ContentExpertiseContainer
				expertiseCompo={
					<InputTextCv
						placeholder="Expertise"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm("");
						}}
						forceWidthFull
						name={`${pathContent}.title`}
						textColor={watchModelTitle?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitle,
						}}
					/>
				}
				levelCompo={<RatingCvInput name={`${pathContent}.level`} design={watchDesignExpertise} />}
			/>
		</SectionItemShell>
	);
};

interface ContentExpertiseContainerProps {
	expertiseCompo: JSX.Element;
	levelCompo: JSX.Element;
}

export const ContentExpertiseContainer = ({
	expertiseCompo,
	levelCompo,
}: ContentExpertiseContainerProps) => {
	return (
		<div className="w-full flex gap-2 px-2 relative pb-1 mt-1">
			{expertiseCompo}
			{levelCompo}
		</div>
	);
};
