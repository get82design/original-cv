import type { BaseTextSettings, PrizeContentSettings } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import { FieldNamePrize } from "@/features/cv-editor/utils/fields/fieldNamePrize";
import type { PrizeItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitPrize } from "./initPrize";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { PiMedal } from "react-icons/pi";
import { PrizeDnd } from "./compo/PrizeDnd";
import { PrizeCardRegister } from "../../register/prize/PrizeCardRegister";
import { CardPrizeOne } from "./compo/CardPrizeOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionPrizeOne = () => {
	const { watch } = useFormContext();
	const watchModelPrizeTitle: BaseTextSettings = watch(FieldNamePrize.settingsSectionTitle);
	const modules = watch("modules");
	const path = moduleField(modules, "prize", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 3;

	const {
		items: watchPrizes,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<PrizeItemContentInput, PrizeContentSettings>({
		contentField: FieldNamePrize.content,
		moduleType: "prize",
		createInit: createInitPrize,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionPrize?.item ?? "CardPrizeOne";
	const Card = PrizeCardRegister[itemKey] ?? CardPrizeOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNamePrize.settingsSectionTitle}
					name={FieldNamePrize.titleSection}
					placeholder={"Prix"}
					watchInput={watchModelPrizeTitle}
					icon={<PiMedal style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<PrizeDnd
					watchPrizes={watchPrizes}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
					colOfPrize={cols}
				/>
			}
			nbCols={1}
		/>
	);
};
