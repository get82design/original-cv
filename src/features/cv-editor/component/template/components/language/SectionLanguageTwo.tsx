import { FieldNameLanguage } from "@/features/cv-editor/utils/fields/fieldNameLanguage";
import type {
	BaseTextSettings,
	TemplateLayout,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import type { LanguageItemContentInput } from "@/services/schemas/cvSave.schema";
import type { LanguageContentSettings } from "@/services/schemas/cvTemplate.schema";
import { createInitLanguage } from "./initLanguage";
import { LanguageDnd } from "./compo/LanguageDnd";
import { MdLanguage } from "react-icons/md";
import { TitleSection } from "../input-cv/section/TitleSection";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { CommonPointList } from "../common-compo/list/CommonPointList";
import { CommonListLigne } from "../common-compo/list/CommonListLigne";
import { useSectionList } from "../../../hooks/useSectionList";
import { LanguageCardRegister } from "../../register/language/LanguageCardRegister";
import { CardLanguageOne } from "./compo/CardLanguageOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const SectionLanguageTwo = () => {
	const { watch } = useFormContext();
	const watchModelLanguageTitle: BaseTextSettings = watch(
		FieldNameLanguage.settingsSectionTitle,
	);
	const watchGeneral: TemplateLayout = watch(FieldNameLayoutGeneral.layout);
	const modules = watch("modules");
	const path = moduleField(modules, "language", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 3;

	const {
		items: watchLanguages,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<LanguageItemContentInput, LanguageContentSettings>({
		contentField: FieldNameLanguage.content,
		moduleType: "language",
		createInit: createInitLanguage,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionLanguage?.item ??
		"CardLanguageOne";
	const Card = LanguageCardRegister[itemKey] ?? CardLanguageOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameLanguage.settingsSectionTitle}
					name={FieldNameLanguage.titleSection}
					placeholder={"Langues"}
					watchInput={watchModelLanguageTitle}
					icon={<MdLanguage style={{ width: "16px", height: "16px" }} />}
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
							<LanguageDnd
								watchLanguages={watchLanguages}
								itemSelected={itemSelected}
								setItemSelected={setItemSelected}
								createNewItem={createNewItem}
								colOfLanguage={cols}
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
