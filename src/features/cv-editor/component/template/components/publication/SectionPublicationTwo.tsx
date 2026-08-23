import { FieldNamePublication } from "@/features/cv-editor/utils/fields/fieldNamePublication";
import type {
	BaseTextSettings,
	PublicationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { PublicationItemContentInput } from "@/services/schemas/cvSave.schema";
import { createInitPublication } from "./initPublication";
import { MdArticle } from "react-icons/md";
import { TitleSection } from "../input-cv/section/TitleSection";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { PublicationDnd } from "./compo/PublicationDnd";
import { CardPublicationOne } from "./compo/CardPublicationOne";
import { PublicationCardRegister } from "../../register/publication/PublicationCardRegister";

export const SectionPublicationTwo = () => {
	const { watch } = useFormContext();
	const watchModelPublicationTitle: BaseTextSettings = watch(
		FieldNamePublication.settingsSectionTitle,
	);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

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
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNamePublication.settingsSectionTitle}
					name={FieldNamePublication.titleSection}
					placeholder={"Diplome"}
					watchInput={watchModelPublicationTitle}
					icon={<MdArticle style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<PublicationDnd
						watchPublications={watchPublications}
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
