import { useFormContext } from "react-hook-form";
import { useSectionList } from "../../../hooks/useSectionList";
import type {
	BaseTextSettings,
	CertificationContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import type { CertificationItemContentInput } from "@/services/schemas/cvSave.schema";
import { FieldNameCertification } from "@/features/cv-editor/utils/fields/fieldNameCertification";
import { createInitCertification } from "./initCertification";
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer";
import { TitleSection } from "../input-cv/section/TitleSection";
import { PiCertificate } from "react-icons/pi";
import { CertificationDnd } from "./compo/CertificationDnd";
import { CertificationCardRegister } from "../../register/certification/CertificationCardRegister";
import { CardCertificationOne } from "./compo/CardCertificationOne";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export function SectionCertificationOne() {
	const { watch } = useFormContext();
	const watchModelCertificationTitle: BaseTextSettings = watch(
		FieldNameCertification.settingsSectionTitle,
	);
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
		<SectionOneContainer
			titleOfSectionCompo={
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
				<CertificationDnd
					watchCertifications={watchCertifications}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					createNewItem={createNewItem}
					CardComponent={Card}
					colOfCertification={cols}
				/>
			}
			nbCols={1}
		/>
	);
}
