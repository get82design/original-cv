import { FieldNameSkill } from "@/features/cv-editor/utils/fields/fieldNameSkill";
import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	BaseTextSettings,
	SkillContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { createInitSkill } from "./initSkill";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { TitleSection } from "../input-cv/section/TitleSection";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { MdTag } from "react-icons/md";
import { SkillGroupDnd } from "./compo/SkillGroupDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { GroupSkillCardRegister } from "../../register/skill/GroupSkillCardRegister";
import { CardGroupSkillOne } from "./compo/CardGroupSkillOne";

export const SectionSkillTwo = () => {
	const { watch } = useFormContext();
	const watchModelSkillTitle: BaseTextSettings = watch(
		FieldNameSkill.settingsSectionTitle,
	);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

	const {
		items: watchSkills,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<SkillGroupItemContentInput, SkillContentSettings>({
		contentField: FieldNameSkill.content,
		moduleType: "skill",
		createInit: createInitSkill,
	});

	const groupKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionSkill?.group ??
		"CardGroupSkillOne";
	const GroupCard = GroupSkillCardRegister[groupKey] ?? CardGroupSkillOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameSkill.settingsSectionTitle}
					name={FieldNameSkill.titleSection}
					placeholder={"Skill"}
					watchInput={watchModelSkillTitle}
					icon={<MdTag style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<SkillGroupDnd
						watchSkills={watchSkills}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						// colOfSkill={3}
						GroupCardComponent={GroupCard}
					/>
				</div>
			}
			// nbCols={watchSkills?.length >= 2
			//     ? 2
			//     : 1}
			nbCols={1}
		/>
	);
};
