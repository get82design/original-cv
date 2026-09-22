import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation";
import type {
	BaseTextSettings,
	EducationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { MdSchool } from "react-icons/md";
import { createInitEducation } from "./initEducation";
import { EducationDnd } from "./compo/EducationDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { EducationCardRegister } from "../../register/education/EducationCardRegister";
import { CardEducationOne } from "./compo/CardEducationOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionEducationOne = () => {
	const { watch } = useFormContext();
	const watchModelEducationTitle: BaseTextSettings = watch(FieldNameEducation.settingsSectionTitle);
	const modules = watch("modules");
	const path = moduleField(modules, "education", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 1;

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
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameEducation.settingsSectionTitle}
					name={FieldNameEducation.titleSection}
					placeholder={"Education"}
					watchInput={watchModelEducationTitle}
					icon={<MdSchool style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<EducationDnd
					watchEducations={watchEducations}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
					colOfEducation={cols}
				/>
			}
			nbCols={1}
		/>
	);
};
