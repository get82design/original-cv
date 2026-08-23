import { FieldNameVolunteering } from "@/features/cv-editor/utils/fields/fieldNameVolunteering";
import type {
	BaseTextSettings,
	VolunteeringContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { VolunteeringItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitVolunteering } from "./initVolunteering";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { MdOutlineVolunteerActivism } from "react-icons/md";
import { VolunteeringsDnd } from "./compo/VolunteeringDnd";
import { VolunteeringCardRegister } from "../../register/volunteering/VolunteeringCardOne";
import { CardVolunteeringOne } from "./compo/CardVolunteeringOne";

export const SectionVolunteeringTwo = () => {
	const { watch } = useFormContext();
	const watchModelVolunteeringTitle: BaseTextSettings = watch(
		FieldNameVolunteering.settingsSectionTitle,
	);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

	const {
		items: watchVolunteerings,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<VolunteeringItemContentInput, VolunteeringContentSettings>(
		{
			contentField: FieldNameVolunteering.content,
			moduleType: "volunteering",
			createInit: createInitVolunteering,
		},
	);

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionVolunteering
			?.item ?? "CardVolunteeringOne";
	const Card = VolunteeringCardRegister[itemKey] ?? CardVolunteeringOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameVolunteering.settingsSectionTitle}
					name={FieldNameVolunteering.titleSection}
					placeholder={"Bénévolat"}
					watchInput={watchModelVolunteeringTitle}
					icon={
						<MdOutlineVolunteerActivism
							style={{ width: "16px", height: "16px" }}
						/>
					}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<VolunteeringsDnd
						watchVolunteerings={watchVolunteerings}
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
