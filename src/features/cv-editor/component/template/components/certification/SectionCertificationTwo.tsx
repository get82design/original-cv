import type { CertificationItemContentInput } from "@/services/schemas/cvSave.schema";
import type {
	BaseTextSettings,
	CertificationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import { FieldNameCertification } from "@/features/cv-editor/utils/fields/fieldNameCertification";
import { createInitCertification } from "./initCertification";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { PiCertificate } from "react-icons/pi";
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { CertificationDnd } from "./compo/CertificationDnd";
import { CardCertificationOne } from "./compo/CardCertificationOne";
import { CertificationCardRegister } from "../../register/certification/CertificationCardRegister";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export function SectionCertificationTwo() {
	const { watch } = useFormContext();
	const watchModelCertificationTitle: BaseTextSettings = watch(
		FieldNameCertification.settingsSectionTitle,
	);
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const modules = watch("modules");
	const path = moduleField(modules, "certification", "settings", "content");
	const cols = watch(`${path}.columns`) ?? 2;

	const {
		items: watchCertifications,
		itemSelected,
		setItemSelected,
		createNewItem,
	} = useSectionList<
		CertificationItemContentInput,
		CertificationContentSettings
	>({
		contentField: FieldNameCertification.content,
		moduleType: "certification",
		createInit: createInitCertification,
	});

	const itemKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionCertification
			?.item ?? "CardCertificationOne";
	const Card = CertificationCardRegister[itemKey] ?? CardCertificationOne;

	return (
		<SectionTwoContainer
			general={watchGeneral}
			titleSectionCompo={
				<TitleSection
					fieldName={FieldNameCertification.settingsSectionTitle}
					name={FieldNameCertification.titleSection}
					placeholder={"Certification"}
					watchInput={watchModelCertificationTitle}
					icon={<PiCertificate style={{ width: "16px", height: "16px" }} />}
					setSectionSelected={setItemSelected}
				/>
			}
			sectionCompo={
				<div className="-mt-5">
					<CertificationDnd
						watchCertifications={watchCertifications}
						itemSelected={itemSelected}
						setItemSelected={setItemSelected}
						createNewItem={createNewItem}
						CardComponent={Card}
						colOfCertification={cols}
					/>
				</div>
			}
			nbCols={1}
		/>
	);
}
