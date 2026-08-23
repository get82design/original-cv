import { FieldNamePublication } from "@/features/cv-editor/utils/fields/fieldNamePublication";
import type {
	BaseTextSettings,
	PublicationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type { PublicationItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitPublication } from "./initPublication";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { MdArticle } from "react-icons/md";
import { PublicationDnd } from "./compo/PublicationDnd";
import { CardPublicationOne } from "./compo/CardPublicationOne";
import { PublicationCardRegister } from "../../register/publication/PublicationCardRegister";

export const SectionPublicationOne = () => {
	const { watch } = useFormContext();
	const watchModelPublicationTitle: BaseTextSettings = watch(
		FieldNamePublication.settingsSectionTitle,
	);

	const {
		items: watchPublications,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<PublicationItemContentInput, PublicationContentSettings>({
		contentField: FieldNamePublication.content,
		moduleType: "publication",
		createInit: createInitPublication,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionPublication
			?.item ?? "CardPublicationOne";
	const Card = PublicationCardRegister[itemKey] ?? CardPublicationOne;

	return (
		<SectionOneContainer
			titleOfSectionCompo={
				<TitleSection
					fieldName={FieldNamePublication.settingsSectionTitle}
					name={FieldNamePublication.titleSection}
					placeholder={"Publication"}
					watchInput={watchModelPublicationTitle}
					icon={<MdArticle style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<PublicationDnd
					watchPublications={watchPublications}
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
