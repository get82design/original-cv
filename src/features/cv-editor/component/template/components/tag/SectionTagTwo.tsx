import type { BaseTextSettings, TagContentSettings } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { TagGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { FieldNameTag } from "@/features/cv-editor/utils/fields/fieldNameTag";
import { createInitTag } from "./initTag";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { TitleSection } from "../input-cv/section/TitleSection";
import { MdTag } from "react-icons/md";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TagGroupDnd } from "./compo/TagGroupDnd";
import { CardGroupTagOne } from "./compo/CardGroupTagOne";
import { GroupTagCardRegister } from "../../register/tag/GroupTagCardRegister";

export function SectionTagTwo() {
	const { watch } = useFormContext();
	const watchModelTagTitle: BaseTextSettings = watch(FieldNameTag.settingsSectionTitle);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
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
				<div className="-mt-5">
					<TagGroupDnd
						watchTags={watchTags}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						colOfTag={3}
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
}
