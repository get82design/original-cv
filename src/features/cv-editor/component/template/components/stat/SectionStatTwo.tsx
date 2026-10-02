import { FaChartBar } from "react-icons/fa";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { FieldNameStat } from "@/features/cv-editor/utils/fields/fieldNameStat";
import type {
	BaseTextSettings,
	StatContentSettings,
	TemplateLayout,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useSectionList } from "../../../hooks/useSectionList";
import type { StatItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitStat } from "./initStat";
import { TitleSection } from "../input-cv/section/TitleSection";
import { StatDnd } from "./compo/StatDnd";
import { StatCardRegister } from "../../register/stat/StatCardRegister";
import { CardStatOne } from "./compo/CardStatOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionStatTwo = () => {
	const { watch } = useFormContext();
	const watchModelStatTitle: BaseTextSettings = watch(FieldNameStat.settingsSectionTitle);
	const watchGeneral: TemplateLayout = watch(FieldNameLayoutGeneral.layout);
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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
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
				<div className="-mt-5">
					<StatDnd
						watchStats={watchStats}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
						colOfStat={cols}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
