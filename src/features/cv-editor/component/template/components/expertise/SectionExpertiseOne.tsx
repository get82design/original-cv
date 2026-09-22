import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type {
	BaseTextSettings,
	ExpertiseContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { FieldNameExpertise } from "@/features/cv-editor/utils/fields/fieldNameExpertise";
import type { ExpertiseItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitExpertise } from "./initExpertise";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { RxMixerVertical } from "react-icons/rx";
import { ExpertiseDnd } from "./compo/ExpertiseDnd";
import { ExpertiseCardRegister } from "../../register/expertise/ExpertiseCardRegister";
import { CardExpertiseOne } from "./compo/CardExpertiseOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionExpertiseOne = () => {
	const { watch } = useFormContext();
	const watchModelExpertiseTitle: BaseTextSettings = watch(FieldNameExpertise.settingsSectionTitle);
	const modules = watch("modules");
	const path = moduleField(modules, "expertise", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 3;

	const {
		items: watchExpertises,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<ExpertiseItemContentInput, ExpertiseContentSettings>({
		contentField: FieldNameExpertise.content,
		moduleType: "expertise",
		createInit: createInitExpertise,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionExpertise?.item ?? "CardExpertiseOne";
	const Card = ExpertiseCardRegister[itemKey] ?? CardExpertiseOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameExpertise.settingsSectionTitle}
					name={FieldNameExpertise.titleSection}
					placeholder={"Expertise"}
					watchInput={watchModelExpertiseTitle}
					icon={<RxMixerVertical style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<ExpertiseDnd
					watchExpertises={watchExpertises}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					colOfExpertise={cols}
					CardComponent={Card}
				/>
			}
			nbCols={1}
		/>
	);
};
