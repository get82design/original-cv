import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { createInitFormation } from "./initFormation";
import { useFormContext } from "react-hook-form";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { FieldNameFormation } from "@/features/cv-editor/utils/fields/fieldNameFormation";
import { useSectionList } from "../../../hooks/useSectionList";
import type { FormationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { FormationContentSettings } from "@/services/schemas/cvTemplate.schema";
import { TitleSection } from "../input-cv/section/TitleSection";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { GiLevelTwo } from "react-icons/gi";
import { FormationDnd } from "./compo/FormationDnd";
import { FormationCardRegister } from "../../register/formation/FormationCardRegister";
import { CardFormationOne } from "./compo/CardFormationOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionFormationTwo = () => {
	const { watch } = useFormContext();
	const watchModelFormationTitle: BaseTextSettings = watch(FieldNameFormation.settingsSectionTitle);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
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
		watch("layoutGeneral.defaultStyles")?.components?.sectionFormation?.item ?? "CardFormationOne";
	const Card = FormationCardRegister[itemKey] ?? CardFormationOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
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
				<div className="-mt-5">
					<FormationDnd
						watchFormations={watchFormations}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
						colOfFormation={cols}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
