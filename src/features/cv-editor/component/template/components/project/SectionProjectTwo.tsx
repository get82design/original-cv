import { GoProject } from "react-icons/go";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FieldNameProject } from "@/features/cv-editor/utils/fields/fieldNameProject";
import { createInitProject } from "./initProject";
import { useFormContext } from "react-hook-form";
import type {
	BaseTextSettings,
	ProjectContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import type { ProjectItemContentInput } from "@/services/schemas/cvSave.schema";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { ProjectDnd } from "./compo/ProjectDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { CardProjectOne } from "./compo/CardProjectOne";
import { ProjectCardRegister } from "../../register/project/ProjectCardRegister";

export const SectionProjectTwo = () => {
	const { watch } = useFormContext();
	const watchModelProjectTitle: BaseTextSettings = watch(
		FieldNameProject.settingsSectionTitle,
	);

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

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
		watch("layoutGeneral.defaultStyles")?.components?.sectionProject?.item ??
		"CardProjectOne";
	const Card = ProjectCardRegister[itemKey] ?? CardProjectOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameProject.settingsSectionTitle}
					name={FieldNameProject.titleSection}
					placeholder={"Projet"}
					watchInput={watchModelProjectTitle}
					icon={<GoProject style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<ProjectDnd
						watchProjects={watchProjects}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
