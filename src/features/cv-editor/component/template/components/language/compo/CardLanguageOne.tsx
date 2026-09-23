import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLanguage } from "@/features/cv-editor/utils/fields/fieldNameLanguage";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import type { LanguageItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { RatingCvInput } from "../../input-cv/rating-cv/RatingCvInput";
import type { JSX } from "react";

export interface CardLanguageOneProps {
	index: number;
	item: ListItem<LanguageItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
}

export const CardLanguageOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
}: CardLanguageOneProps) => {
	const { watch, getValues, setValue } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const pathContentSettings = moduleField(watch("modules"), "language", "settings", "content");
	const watchDesignLanguage = watch(`${pathContentSettings}.design`);
	const pathContent = `datas.language.content.${index}.content`;
	const watchModelLanguage = watch(`${pathContent}.settings.language`);

	const deleteLanguage = (itemToDelete: ListItem<LanguageItemContentInput>) => {
		const list = (getValues(FieldNameLanguage.content) ??
			[]) as ListItem<LanguageItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameLanguage.content, newList, {
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
			sectionId="language"
			containerId="language"
			path={FieldNameLanguage.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			sortableType="card"
			onDelete={() => deleteLanguage(item)}
		>
			<ContentLanguageContainer
				nameCompo={
					<InputTextCv
						placeholder="Language"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.language`);
							setSelectInputForm("");
						}}
						forceWidthFull
						name={`${pathContent}.name`}
						textColor={watchModelLanguage?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelLanguage,
						}}
					/>
				}
				levelCompo={<RatingCvInput name={`${pathContent}.level`} design={watchDesignLanguage} />}
			/>
		</SectionItemShell>
	);
};

interface ContentLanguageContainerProps {
	nameCompo: JSX.Element;
	levelCompo: JSX.Element;
}

export const ContentLanguageContainer = ({
	nameCompo,
	levelCompo,
}: ContentLanguageContainerProps) => {
	return (
		<div className="w-1/4 flex justify-between items-center gap-2 px-2 relative mr-2 mt-2">
			<div className="min-w-[90px]">{nameCompo}</div>
			{levelCompo}
		</div>
	);
};
