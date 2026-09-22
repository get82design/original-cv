import { FieldNameCompetence } from "@/features/cv-editor/utils/fields/fieldNameCompetence";
import type {
	BaseTextSettings,
	CompetenceContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { CompetenceGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { MdBookmarkAdd } from "react-icons/md";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { createInitCompetence } from "./initCompetence";
import { CompetenceGroupDnd } from "./compo/CompetenceGroupDnd";
import { GroupCompetenceCardRegister } from "../../register/competence/GroupCompetenceCardRegister";
import { CardGroupCompetenceOne } from "./compo/CardGroupCompetenceOne";

export const SectionCompetenceOne = () => {
	const { watch } = useFormContext();
	const watchModelCompetenceTitle: BaseTextSettings = watch(
		FieldNameCompetence.settingsSectionTitle,
	);

	const {
		items: watchCompetences,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<CompetenceGroupItemContentInput, CompetenceContentSettings>({
		contentField: FieldNameCompetence.content,
		moduleType: "competence",
		createInit: createInitCompetence,
	});

	const groupKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionCompetence?.group ??
		"CardGroupCompetenceOne";
	const GroupCard = GroupCompetenceCardRegister[groupKey] ?? CardGroupCompetenceOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
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
				<CompetenceGroupDnd
					watchCompetences={watchCompetences}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					GroupCardComponent={GroupCard}
				/>
			}
			// nbCols={watchSkills?.length >= 2
			//   ? 2
			//   : 1}
			nbCols={1}
		/>
	);
};
