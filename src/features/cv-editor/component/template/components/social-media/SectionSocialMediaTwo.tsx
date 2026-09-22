import { createInitSocialMedia } from "./initSocialMedia";
import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia";
import type {
	BaseTextSettings,
	SocialMediaContentSettings,
	TemplateLayout,
} from "@/services/schemas/cvTemplate.schema";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema";
import { useFormContext } from "react-hook-form";
import { FaGlobe } from "react-icons/fa";
import { CommonListLigne } from "../common-compo/list/CommonListLigne";
import { CommonPointList } from "../common-compo/list/CommonPointList";
import { TitleSection } from "../input-cv/section/TitleSection";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { SocialMediaDnd } from "./compo/SocialMediaDnd";
import { useSectionList } from "../../../hooks/useSectionList";
import { SocialMediaCardRegister } from "../../register/social-media/SocialMediaCardRegister";
import { CardSocialMediaOne } from "./compo/CardSocialMediaOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionSocialMediaTwo = () => {
	const { watch } = useFormContext();
	const watchModelSocialMediaTitle: BaseTextSettings = watch(
		FieldNameSocialMedia.settingsSectionTitle,
	);
	const watchGeneral: TemplateLayout = watch(FieldNameLayoutGeneral.layout);

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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameSocialMedia.settingsSectionTitle}
					name={FieldNameSocialMedia.titleSection}
					placeholder={"Réseau social"}
					watchInput={watchModelSocialMediaTitle}
					icon={<FaGlobe style={{ width: "16px", height: "16px" }} />}
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
							<SocialMediaDnd
								watchSocialMedias={watchSocialMedias}
								itemSelected={itemSelected}
								setItemSelected={setItemSelected}
								createNewItem={createNewItem}
								colOfSocialMedia={watchColumns}
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
