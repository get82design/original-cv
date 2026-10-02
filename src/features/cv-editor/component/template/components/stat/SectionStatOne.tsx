import { FieldNameStat } from "@/features/cv-editor/utils/fields/fieldNameStat";
import type { StatItemContentInput } from "@/services/schemas/cvSave.schema";
import type { BaseTextSettings, StatContentSettings } from "@/services/schemas/cvTemplate.schema";
import { useSectionList } from "../../../hooks/useSectionList";
import { useFormContext } from "react-hook-form";
import { createInitStat } from "./initStat";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FaChartBar } from "react-icons/fa";
import { StatDnd } from "./compo/StatDnd";
import { StatCardRegister } from "../../register/stat/StatCardRegister";
import { CardStatOne } from "./compo/CardStatOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionStatOne = () => {
	const { watch } = useFormContext();
	const watchModelStatTitle: BaseTextSettings = watch(FieldNameStat.settingsSectionTitle);
	const modules = watch("modules");
	const path = moduleField(modules, "stat", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 3;

	const {
		items: watchStats,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<StatItemContentInput, StatContentSettings>({
		contentField: FieldNameStat.content,
		moduleType: "stat",
		createInit: createInitStat,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionStat?.item ?? "CardStatOne";
	const Card = StatCardRegister[itemKey] ?? CardStatOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameStat.settingsSectionTitle}
					name={FieldNameStat.titleSection}
					placeholder={"En nombres"}
					watchInput={watchModelStatTitle}
					icon={<FaChartBar style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<StatDnd
					watchStats={watchStats}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
					colOfStat={cols}
				/>
			}
			nbCols={1}
		/>
	);
};
