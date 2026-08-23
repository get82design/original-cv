import { FieldNameAchievement } from "@/features/cv-editor/utils/fields/fieldNameAchievement";
import type { AchievementItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	AchievementContentSettings,
	BaseTextSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { GiAchievement } from "react-icons/gi";
import { createInitAchievement } from "./initAchievement";
import { AchievementDnd } from "./compo/AchievementDnd";
import { CardAchievementOne } from "./compo/CardAchievementOne";
import { AchievementCardRegister } from "../../register/achievement/AchievementCardRegister";

export const SectionAchievementOne = () => {
	const { watch } = useFormContext();
	const watchModelAchievementTitle: BaseTextSettings = watch(
		FieldNameAchievement.settingsSectionTitle,
	);

	const {
		items: watchAchievements,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<AchievementItemContentInput, AchievementContentSettings>({
		contentField: FieldNameAchievement.content,
		moduleType: "achievement",
		createInit: createInitAchievement,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionAchievement
			?.item ?? "CardAchievementOne";
	const Card = AchievementCardRegister[itemKey] ?? CardAchievementOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
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
				<AchievementDnd
					watchAchievements={watchAchievements}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
				/>
			}
			nbCols={1}
		/>
	);
};
