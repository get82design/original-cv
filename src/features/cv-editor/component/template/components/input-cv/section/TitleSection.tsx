import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";
import { useFormContext } from "react-hook-form";
import { TitleSectionContainer } from "./TitleSectionContainer";

interface TitleSectionProps {
	fieldName: string;
	name: string;
	placeholder: string;
	watchInput: BaseTextSettings;
	icon?: JSX.Element;
	setSectionSelected?: (e: string) => void;
}

export const TitleSection = ({
	fieldName,
	name,
	placeholder,
	watchInput,
	icon,
	setSectionSelected,
}: TitleSectionProps) => {
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchSlugTemplate = watch(FieldNameLayoutGeneral.slugTemplate);
	const watchTextTransform = watch(FieldNameLayoutGeneral.textTransform);
	return (
		<TitleSectionContainer
			icon={icon}
			inputOutput={
				<InputTextCv
					placeholder={placeholder}
					name={name}
					onClick={() => {
						setSelectModifInput(fieldName);
						setSelectInputForm("");
						setSectionSelected && setSectionSelected("");
					}}
					textColor={watchInput?.colorSelect}
					textAlign={watchInput?.textAlign || "left"}
					dataInput={{
						changeSize: "2px",
						model: watchInput,
					}}
					className={`w-full mt-1 ${watchTextTransform ? watchTextTransform : ""}`}
					forceWidthFull={true}
				/>
			}
			general={watchGeneral}
			modelName={watchSlugTemplate}
		/>
	);
};
