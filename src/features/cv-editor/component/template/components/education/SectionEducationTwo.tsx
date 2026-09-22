import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation";
import type {
	BaseTextSettings,
	EducationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { createInitEducation } from "./initEducation";
import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { TitleSection } from "../input-cv/section/TitleSection";
import { MdSchool } from "react-icons/md";
import { EducationDnd } from "./compo/EducationDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { EducationCardRegister } from "../../register/education/EducationCardRegister";
import { CardEducationOne } from "./compo/CardEducationOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionEducationTwo = () => {
	const { watch } = useFormContext();
	const watchModelEducationTitle: BaseTextSettings = watch(FieldNameEducation.settingsSectionTitle);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const modules = watch("modules");
	const path = moduleField(modules, "education", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 2;

	const {
		items: watchEducations,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<EducationItemContentInput, EducationContentSettings>({
		contentField: FieldNameEducation.content,
		moduleType: "education",
		createInit: createInitEducation,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionEducation?.item ?? "CardEducationOne";
	const Card = EducationCardRegister[itemKey] ?? CardEducationOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameEducation.settingsSectionTitle}
					name={FieldNameEducation.titleSection}
					placeholder={"Diplome"}
					watchInput={watchModelEducationTitle}
					icon={<MdSchool style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<EducationDnd
						watchEducations={watchEducations}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
						colOfEducation={cols}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
