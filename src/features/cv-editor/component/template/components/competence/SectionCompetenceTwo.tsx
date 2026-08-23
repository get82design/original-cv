import { FieldNameCompetence } from "@/features/cv-editor/utils/fields/fieldNameCompetence";
import type {
	BaseTextSettings,
	CompetenceContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { CompetenceGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { MdBookmarkAdd } from "react-icons/md";
import { createInitCompetence } from "./initCompetence";
import { CompetenceGroupDnd } from "./compo/CompetenceGroupDnd";
import { CardGroupCompetenceOne } from "./compo/CardGroupCompetenceOne";
import { GroupCompetenceCardRegister } from "../../register/competence/GroupCompetenceCardRegister";

export const SectionCompetenceTwo = () => {
	const { watch } = useFormContext();
	const watchModelCompetenceTitle: BaseTextSettings = watch(
		FieldNameCompetence.settingsSectionTitle,
	);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

	const {
		items: watchCompetences,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<
		CompetenceGroupItemContentInput,
		CompetenceContentSettings
	>({
		contentField: FieldNameCompetence.content,
		moduleType: "competence",
		createInit: createInitCompetence,
	});

	const groupKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionCompetence
			?.group ?? "CardGroupCompetenceOne";
	const GroupCard =
		GroupCompetenceCardRegister[groupKey] ?? CardGroupCompetenceOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameCompetence.settingsSectionTitle}
					name={FieldNameCompetence.titleSection}
					placeholder={"Compétence"}
					watchInput={watchModelCompetenceTitle}
					icon={<MdBookmarkAdd style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<CompetenceGroupDnd
						watchCompetences={watchCompetences}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						GroupCardComponent={GroupCard}
					/>
				</div>
			}
			// nbCols={watchCompetences?.length >= 2
			//     ? 2
			//     : 1}
			nbCols={1}
		/>
	);
};
