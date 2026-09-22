import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type {
	BaseTextSettings,
	ExpertiseContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { FieldNameExpertise } from "@/features/cv-editor/utils/fields/fieldNameExpertise";
import type { ExpertiseItemContentInput } from "@/services/schemas/cvSave.schema";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { createInitExpertise } from "./initExpertise";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { CommonListLigne } from "../common-compo/list/CommonListLigne";
import { CommonPointList } from "../common-compo/list/CommonPointList";
import { RxMixerVertical } from "react-icons/rx";
import { TitleSection } from "../input-cv/section/TitleSection";
import { ExpertiseDnd } from "./compo/ExpertiseDnd";
import { ExpertiseCardRegister } from "../../register/expertise/ExpertiseCardRegister";
import { CardExpertiseOne } from "./compo/CardExpertiseOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionExpertiseTwo = () => {
	const { watch } = useFormContext();
	const watchModelExpertiseTitle: BaseTextSettings = watch(FieldNameExpertise.settingsSectionTitle);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const modules = watch("modules");
	const path = moduleField(modules, "expertise", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 3;

	const {
		items: watchExpertises,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<ExpertiseItemContentInput, ExpertiseContentSettings>({
		contentField: FieldNameExpertise.content,
		moduleType: "expertise",
		createInit: createInitExpertise,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionExpertise?.item ?? "CardExpertiseOne";
	const Card = ExpertiseCardRegister[itemKey] ?? CardExpertiseOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameExpertise.settingsSectionTitle}
					name={FieldNameExpertise.titleSection}
					placeholder={"Expertise"}
					watchInput={watchModelExpertiseTitle}
					icon={<RxMixerVertical style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="relative flex gap-2">
					<CommonListLigne
						watchWithIcon={watchGeneral?.titleSection.withIcon}
						watchListStyle={watchGeneral?.listStyle}
						color="gray-500"
						className="mt-2 -mb-1"
					/>
					<div className="w-full flex-1 relative -mt-3">
						<CommonPointList general={watchGeneral} />
						<div className="-mt-3">
							<ExpertiseDnd
								watchExpertises={watchExpertises}
								itemSelected={itemSelected}
								setItemSelected={setItemSelected}
								createNewItem={createNewItem}
								colOfExpertise={cols}
								CardComponent={Card}
							/>
						</div>
					</div>
				</div>
			}
			nbCols={1}
		/>
	);
};
