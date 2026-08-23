import { FieldNameStrength } from "@/features/cv-editor/utils/fields/fieldNameStrength";
import type { StrengthItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	BaseTextSettings,
	StrengthContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useSectionList } from "../../../hooks/useSectionList";
import { useFormContext } from "react-hook-form";
import { createInitStrength } from "./initStrength";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FaThumbsUp } from "react-icons/fa";
import { StrengthDnd } from "./compo/StrengthDnd";
import { StrengthCardRegister } from "../../register/strength/StrengthCardRegister";
import { CardStrengthOne } from "./compo/CardStrengthOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionStrengthOne = () => {
	const { watch } = useFormContext();
	const watchModelStrengthTitle: BaseTextSettings = watch(
		FieldNameStrength.settingsSectionTitle,
	);
	const modules = watch("modules");
	const path = moduleField(modules, "strength", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 1;

	const {
		items: watchStrengths,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<StrengthItemContentInput, StrengthContentSettings>({
		contentField: FieldNameStrength.content,
		moduleType: "strength",
		createInit: createInitStrength,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionStrength?.item ??
		"CardStrengthOne";
	const Card = StrengthCardRegister[itemKey] ?? CardStrengthOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameStrength.settingsSectionTitle}
					name={FieldNameStrength.titleSection}
					placeholder={"Atouts"}
					watchInput={watchModelStrengthTitle}
					icon={<FaThumbsUp style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<StrengthDnd
					watchStrengths={watchStrengths}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
					colOfStrength={cols}
				/>
			}
			nbCols={1}
		/>
	);
};
