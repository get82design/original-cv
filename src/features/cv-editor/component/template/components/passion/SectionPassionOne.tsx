import { FieldNamePassion } from "@/features/cv-editor/utils/fields/fieldNamePassion";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { PassionItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	BaseTextSettings,
	PassionContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { BsBalloonHeartFill } from "react-icons/bs";
import { createInitPassion } from "./initPassion";
import { PassionDnd } from "./compo/PassionDnd";
import { CardPassionOne } from "./compo/CardPassionOne";
import { PassionCardRegister } from "../../register/passion/PassionCardRegister";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionPassionOne = () => {
	const { watch } = useFormContext();
	const watchModelPassionTitle: BaseTextSettings = watch(FieldNamePassion.settingsSectionTitle);
	const modules = watch("modules");
	const path = moduleField(modules, "passion", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 3;

	const {
		items: watchPassions,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<PassionItemContentInput, PassionContentSettings>({
		contentField: FieldNamePassion.content,
		moduleType: "passion",
		createInit: createInitPassion,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionPassion?.item ?? "CardPassionOne";
	const Card = PassionCardRegister[itemKey] ?? CardPassionOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNamePassion.settingsSectionTitle}
					name={FieldNamePassion.titleSection}
					placeholder={"Passion"}
					watchInput={watchModelPassionTitle}
					icon={<BsBalloonHeartFill style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<PassionDnd
					watchPassions={watchPassions}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					colOfPassion={cols}
					CardComponent={Card}
				/>
			}
			nbCols={1}
		/>
	);
};
