import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { FaGlobe } from "react-icons/fa";
import { useFormContext } from "react-hook-form";
import type {
	BaseTextSettings,
	SocialMediaContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitSocialMedia } from "./initSocialMedia";
import { SocialMediaDnd } from "./compo/SocialMediaDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { CardSocialMediaOne } from "./compo/CardSocialMediaOne";
import { SocialMediaCardRegister } from "../../register/social-media/SocialMediaCardRegister";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionSocialMediaOne = () => {
	const { watch } = useFormContext();
	const watchModelSocialMediaTitle: BaseTextSettings = watch(
		FieldNameSocialMedia.settingsSectionTitle,
	);

	const modules = watch("modules");
	const pathDesign = moduleField(modules, "socialMedia", "settings", "content");
	const watchColumns = watch(`${pathDesign}.columns`);

	const {
		items: watchSocialMedias,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<SocialMediaItemContentInput, SocialMediaContentSettings>({
		contentField: FieldNameSocialMedia.content,
		moduleType: "socialMedia",
		createInit: createInitSocialMedia,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionSocialMedia?.item ??
		"CardSocialMediaOne";
	const Card = SocialMediaCardRegister[itemKey] ?? CardSocialMediaOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNameSocialMedia.settingsSectionTitle}
					name={FieldNameSocialMedia.titleSection}
					placeholder={"Réseaux sociaux"}
					watchInput={watchModelSocialMediaTitle}
					icon={<FaGlobe style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<SocialMediaDnd
					watchSocialMedias={watchSocialMedias}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					colOfSocialMedia={watchColumns}
					CardComponent={Card}
				/>
			}
			nbCols={1}
		/>
	);
};
