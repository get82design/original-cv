import { FieldNameProject } from "@/features/cv-editor/utils/fields/fieldNameProject";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { GoProject } from "react-icons/go";
import type {
	BaseTextSettings,
	ProjectContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import type { ProjectItemContentInput } from "@/services/schemas/cvSave.schema";
import { TitleSection } from "../input-cv/section/TitleSection";
import { createInitProject } from "./initProject";
import { ProjectDnd } from "./compo/ProjectDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { ProjectCardRegister } from "../../register/project/ProjectCardRegister";
import { CardProjectOne } from "./compo/CardProjectOne";

export const SectionProjectOne = () => {
	const { watch } = useFormContext();
	const watchModelProjectTitle: BaseTextSettings = watch(FieldNameProject.settingsSectionTitle);

	const {
		items: watchProjects,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<ProjectItemContentInput, ProjectContentSettings>({
		contentField: FieldNameProject.content,
		moduleType: "project",
		createInit: createInitProject,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionProject?.item ?? "CardProjectOne";
	const Card = ProjectCardRegister[itemKey] ?? CardProjectOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameProject.settingsSectionTitle}
					name={FieldNameProject.titleSection}
					placeholder={"Project"}
					watchInput={watchModelProjectTitle}
					icon={<GoProject style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<ProjectDnd
					watchProjects={watchProjects}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
				/>
			}
			nbCols={1}
		/>
	);
};
