import { FieldNameFormation } from "@/features/cv-editor/utils/fields/fieldNameFormation";
import type {
	BaseTextSettings,
	FormationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { FormationItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitFormation } from "./initFormation";
import { GiLevelTwo } from "react-icons/gi";
import { TitleSection } from "../input-cv/section/TitleSection";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { FormationDnd } from "./compo/FormationDnd";
import { CardFormationOne } from "./compo/CardFormationOne";
import { FormationCardRegister } from "../../register/formation/FormationCardRegister";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionFormationOne = () => {
	const { watch } = useFormContext();
	const watchModelFormationTitle: BaseTextSettings = watch(
		FieldNameFormation.settingsSectionTitle,
	);
	const modules = watch("modules");
	const path = moduleField(modules, "formation", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 2;

	const {
		items: watchFormations,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<FormationItemContentInput, FormationContentSettings>({
		contentField: FieldNameFormation.content,
		moduleType: "formation",
		createInit: createInitFormation,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionFormation?.item ??
		"CardFormationOne";
	const Card = FormationCardRegister[itemKey] ?? CardFormationOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameFormation.settingsSectionTitle}
					name={FieldNameFormation.titleSection}
					placeholder={"Formation"}
					watchInput={watchModelFormationTitle}
					icon={<GiLevelTwo style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<FormationDnd
					watchFormations={watchFormations}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
					colOfFormation={cols}
				/>
			}
			nbCols={1}
		/>
	);
};
