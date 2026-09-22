import type { BaseTextSettings, TagContentSettings } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { TagGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { FieldNameTag } from "@/features/cv-editor/utils/fields/fieldNameTag";
import { createInitTag } from "./initTag";
import { MdTag } from "react-icons/md";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { TagGroupDnd } from "./compo/TagGroupDnd";
import { CardGroupTagOne } from "./compo/CardGroupTagOne";
import { GroupTagCardRegister } from "../../register/tag/GroupTagCardRegister";

export function SectionTagOne() {
	const { watch } = useFormContext();
	const watchModelTagTitle: BaseTextSettings = watch(FieldNameTag.settingsSectionTitle);

	const {
		items: watchTags,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<TagGroupItemContentInput, TagContentSettings>({
		contentField: FieldNameTag.content,
		moduleType: "tag",
		createInit: createInitTag,
	});

	const groupKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionTag?.group ?? "CardGroupTagOne";
	const GroupCard = GroupTagCardRegister[groupKey] ?? CardGroupTagOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameTag.settingsSectionTitle}
					name={FieldNameTag.titleSection}
					placeholder={"Tag"}
					watchInput={watchModelTagTitle}
					icon={<MdTag style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<TagGroupDnd
					watchTags={watchTags}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					colOfTag={4}
					GroupCardComponent={GroupCard}
				/>
			}
			// nbCols={watchSkills?.length >= 2
			//   ? 2
			//   : 1}
			nbCols={1}
		/>
	);
}
