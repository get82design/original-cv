import { FaThumbsUp } from "react-icons/fa";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { FieldNameStrength } from "@/features/cv-editor/utils/fields/fieldNameStrength";
import type {
	BaseTextSettings,
	StrengthContentSettings,
	TemplateLayout,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useSectionList } from "../../../hooks/useSectionList";
import type { StrengthItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitStrength } from "./initStrength";
import { TitleSection } from "../input-cv/section/TitleSection";
import { StrengthDnd } from "./compo/StrengthDnd";
import { StrengthCardRegister } from "../../register/strength/StrengthCardRegister";
import { CardStrengthOne } from "./compo/CardStrengthOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionStrengthTwo = () => {
	const { watch } = useFormContext();
	const watchModelStrengthTitle: BaseTextSettings = watch(
		FieldNameStrength.settingsSectionTitle,
	);
	const watchGeneral: TemplateLayout = watch(FieldNameLayoutGeneral.layout);
	const modules = watch("modules");
	const path = moduleField(modules, "strength", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 2;
	
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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
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
				<div className="-mt-5">
					<StrengthDnd
						watchStrengths={watchStrengths}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
						colOfStrength={cols}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
