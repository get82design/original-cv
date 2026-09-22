import { FieldNamePassion } from "@/features/cv-editor/utils/fields/fieldNamePassion";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { PassionItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	BaseTextSettings,
	PassionContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { BsBalloonHeartFill } from "react-icons/bs";
import { createInitPassion } from "./initPassion";
import { PassionDnd } from "./compo/PassionDnd";
import { PassionCardRegister } from "../../register/passion/PassionCardRegister";
import { CardPassionOne } from "./compo/CardPassionOne";

export const SectionPassionTwo = () => {
	const { watch } = useFormContext();
	const watchModelPassionTitle: BaseTextSettings = watch(FieldNamePassion.settingsSectionTitle);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
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
				<div className="-mt-5">
					<PassionDnd
						watchPassions={watchPassions}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						colOfPassion={3}
						CardComponent={Card}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
