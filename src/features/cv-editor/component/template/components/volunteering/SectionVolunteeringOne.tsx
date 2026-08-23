import { FieldNameVolunteering } from "@/features/cv-editor/utils/fields/fieldNameVolunteering";
import type {
	BaseTextSettings,
	VolunteeringContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { VolunteeringItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitVolunteering } from "./initVolunteering";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { MdOutlineVolunteerActivism } from "react-icons/md";
import { VolunteeringsDnd } from "./compo/VolunteeringDnd";
import { VolunteeringCardRegister } from "../../register/volunteering/VolunteeringCardOne";
import { CardVolunteeringOne } from "./compo/CardVolunteeringOne";

export const SectionVolunteeringOne = () => {
	const { watch } = useFormContext();
	const watchModelVolunteeringTitle: BaseTextSettings = watch(
		FieldNameVolunteering.settingsSectionTitle,
	);

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
		<SectionOneContainer
			titleOfSectionCompo={
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
				<VolunteeringsDnd
					watchVolunteerings={watchVolunteerings}
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
