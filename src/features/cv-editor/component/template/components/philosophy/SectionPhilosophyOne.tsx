import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { CommonListLigne } from "../common-compo/list/CommonListLigne";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FieldNamePhilosophy } from "@/features/cv-editor/utils/fields/fieldNamePhilosophy";
import { MdFormatQuote } from "react-icons/md";
import { useFormContext } from "react-hook-form";
import { useCreateCvContext } from "../../../context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";

export const SectionPhilosophyOne = () => {
	const { watch } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchWithIcon = watchGeneral?.titleSection?.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const watchModelPhilosophyTitle: BaseTextSettings = watch(
		FieldNamePhilosophy.settingsSectionTitle,
	);
	const watchCitation = watch(FieldNamePhilosophy.settingsContentCitation);
	const watchAuthor = watch(FieldNamePhilosophy.settingsContentAuthor);

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNamePhilosophy.settingsSectionTitle}
					name={FieldNamePhilosophy.titleSection}
					placeholder={"Philosophie"}
					watchInput={watchModelPhilosophyTitle}
					icon={<MdFormatQuote style={{ width: "16px", height: "16px" }} />}
				/>
			}
			sectionCompo={
				<div className="w-full flex gap-2 mt-1 -mb-1">
					<CommonListLigne
						watchWithIcon={watchWithIcon}
						watchListStyle={watchListStyle}
						color={"gray-500"}
					/>
					<div className="w-full flex flex-col gap-2">
					<TextareaCv
						name={FieldNamePhilosophy.citation}
						onClick={() => {
							setSelectModifInput(FieldNamePhilosophy.settingsContentCitation);
							setSelectInputForm("");
						}}
						placeholder="Laissez une petite description de vous ici"
						textColor={watchCitation?.colorSelect}
						textAlign={watchCitation?.textAlign}
						dataInput={{
							changeSize: "1px",
							model: watchCitation,
						}}
					/>
					{watch(FieldNamePhilosophy.withAuthor) && (
						<InputTextCv
							name={FieldNamePhilosophy.author}
							onClick={() => {
								setSelectModifInput(FieldNamePhilosophy.settingsContentAuthor);
								setSelectInputForm(FieldNamePhilosophy.withAuthor);
							} }
							placeholder="Auteur"
							textColor={watchAuthor?.colorSelect}
							textAlign={"right"} 
							dataInput={{
								changeSize: "1px",
								model: watchAuthor,
							}}
							forceWidthFull={true}
						/>
					)}
					</div>
				</div>
			}
			nbCols={1}
		/>
	);
};
