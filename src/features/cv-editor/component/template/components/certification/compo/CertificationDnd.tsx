import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameCertification } from "@/features/cv-editor/utils/fields/fieldNameCertification";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { CertificationItemContentInput } from "@/services/schemas/cvSave.schema";
import {
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import type { CertificationCardProps } from "../../../register/certification/CertificationCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface CertificationDndProps {
	watchCertifications: ListItem<CertificationItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<CertificationItemContentInput>;
	CardComponent: React.ComponentType<CertificationCardProps>;
	colOfCertification: number;
}

export const CertificationDnd = ({
	watchCertifications,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
	colOfCertification,
}: CertificationDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { setValue } = useFormContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.certification.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Title</p>
								<ToggleAfficherCacher name={`${pathContent}.withTitle`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Organisme Certification</p>
								<ToggleAfficherCacher name={`${pathContent}.withOrganismeCertification`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddCertification = sectionSelected === "section-certification";

	return (
		<SortableContext
			items={watchCertifications.map((s) => s.clientKey)}
			strategy={
				colOfCertification === 1 ? verticalListSortingStrategy : horizontalListSortingStrategy
			}
		>
			<div
				className={`certifications-grid grid ${COL_CLASS[colOfCertification as keyof typeof COL_CLASS] ?? "grid-cols-2"} ${colOfCertification === 1 ? "gap-1" : "gap-x-4 gap-y-1"}`}
			>
				{watchCertifications.map((certification, index) => (
					// biome-ignore lint/a11y/noStaticElementInteractions: carte : enfants déjà interactifs
					// biome-ignore lint/a11y/useKeyWithClickEvents: sélection d'item
					<div
						className="certification-card"
						key={certification.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(certification.clientKey);
							setSectionSelected("section-certification"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={certification}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</div>
				))}
				{showAddCertification && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							commitCvFormHistory();
							setValue(
								FieldNameCertification.content,
								[...watchCertifications, { ...fresh, order: watchCertifications.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter une certification</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
