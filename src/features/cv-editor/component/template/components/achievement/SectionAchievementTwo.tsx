import { FieldNameAchievement } from "@/features/cv-editor/utils/fields/fieldNameAchievement";
import type { AchievementItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	AchievementContentSettings,
	BaseTextSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { createInitAchievement } from "./initAchievement";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { GiAchievement } from "react-icons/gi";
import { AchievementDnd } from "./compo/AchievementDnd";
import { AchievementCardRegister } from "../../register/achievement/AchievementCardRegister";
import { CardAchievementOne } from "./compo/CardAchievementOne";

export const SectionAchievementTwo = () => {
	const { watch } = useFormContext();
	const watchModelAchievementTitle: BaseTextSettings = watch(
		FieldNameAchievement.settingsSectionTitle,
	);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

	const {
		items: watchAchievements,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<AchievementItemContentInput, AchievementContentSettings>({
		contentField: FieldNameAchievement.content,
		moduleType: "realisation",
		createInit: createInitAchievement,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionAchievement
			?.item ?? "CardAchievementOne";
	const Card = AchievementCardRegister[itemKey] ?? CardAchievementOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameAchievement.settingsSectionTitle}
					name={FieldNameAchievement.titleSection}
					placeholder={"Réalisations"}
					watchInput={watchModelAchievementTitle}
					icon={<GiAchievement style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<AchievementDnd
						watchAchievements={watchAchievements}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
};
