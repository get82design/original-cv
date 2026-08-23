import { useFormContext } from "react-hook-form";
import { useCreateCvContext } from "../../../context/CreateCvContext";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { FieldNameDescription } from "@/features/cv-editor/utils/fields/fieldNameDescription";
import { MdPerson } from "react-icons/md";
import { CommonListLigne } from "../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";

export const SectionDescriptionOne = () => {
	const { watch } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchWithIcon = watchGeneral?.titleSection?.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const watchModelDescriptionTitle: BaseTextSettings = watch(
		FieldNameDescription.settingsSectionTitle,
	);
	const watchSettingsContent: BaseTextSettings = watch(
		FieldNameDescription.settingsContent,
	);

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameDescription.settingsSectionTitle}
					name={FieldNameDescription.titleSection}
					placeholder={"Présentation"}
					watchInput={watchModelDescriptionTitle}
					icon={<MdPerson style={{ width: "16px", height: "16px" }} />}
				/>
			}
			sectionCompo={
				<div className="w-full flex gap-2 mt-1 -mb-1">
					<CommonListLigne
						watchWithIcon={watchWithIcon}
						watchListStyle={watchListStyle}
						color={"gray-500"}
					/>
					<TextareaCv
						name={FieldNameDescription.description}
						onClick={() => {
							setSelectModifInput(FieldNameDescription.settingsContent);
							setSelectInputForm("");
						}}
						placeholder="Laissez une petite description de vous ici"
						textColor={watchSettingsContent?.colorSelect}
						textAlign={watchSettingsContent?.textAlign}
						dataInput={{
							changeSize: "1px",
							model: watchSettingsContent,
						}}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
