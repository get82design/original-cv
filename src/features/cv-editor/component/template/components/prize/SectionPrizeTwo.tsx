import type { BaseTextSettings, TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { FieldNamePrize } from "@/features/cv-editor/utils/fields/fieldNamePrize";
import type { PrizeItemContentInput } from "@/services/schemas/cvSave.schema";
import { useSectionList } from "../../../hooks/useSectionList";
import { createInitPrize } from "./initPrize";
import type { PrizeContentSettings } from "@/services/schemas/cvTemplate.schema";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { PiMedal } from "react-icons/pi";
import { PrizeDnd } from "./compo/PrizeDnd";
import { PrizeCardRegister } from "../../register/prize/PrizeCardRegister";
import { CardPrizeOne } from "./compo/CardPrizeOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionPrizeTwo = () => {
	const { watch } = useFormContext();
	const watchModelPrizeTitle: BaseTextSettings = watch(FieldNamePrize.settingsSectionTitle);
	const watchGeneral: TemplateLayout = watch(FieldNameLayoutGeneral.layout);
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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
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
				<div className="-mt-5">
					<PrizeDnd
						watchPrizes={watchPrizes}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
						colOfPrize={cols}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
