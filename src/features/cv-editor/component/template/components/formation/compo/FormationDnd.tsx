import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameFormation } from "@/features/cv-editor/utils/fields/fieldNameFormation";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { FormationItemContentInput } from "@/services/schemas/cvSave.schema";
import {
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import type { FormationCardProps } from "../../../register/formation/FormationCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface FormationDndProps {
	watchFormations: ListItem<FormationItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<FormationItemContentInput>;
	CardComponent: React.ComponentType<FormationCardProps>;
	colOfFormation: number;
}

export const FormationDnd = ({
	watchFormations,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
	colOfFormation,
}: FormationDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { setValue } = useFormContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.formation.content", idx, "content.settings");
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
								<p>Organisme Formation</p>
								<ToggleAfficherCacher name={`${pathContent}.withOrganismeFormation`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Periode</p>
								<ToggleAfficherCacher name={`${pathContent}.withPeriode`} />
							</div>
						),
					},
					// {
					//   template: (
					//     <div className="flex justify-between py-1 px-4 items-center">
					//       <p>Status</p>
					//       <ToggleAfficherCacher
					//         name={`${pathContent}.withStatus`}
					//       />
					//     </div>
					//   ),
					// },
				],
			},
		];
	};

	const showAddFormation = sectionSelected === "section-formation";

	return (
		<SortableContext
			items={watchFormations.map((s) => s.clientKey)}
			strategy={colOfFormation === 1 ? verticalListSortingStrategy : horizontalListSortingStrategy}
		>
			<div
				className={`formations-grid grid ${COL_CLASS[colOfFormation as keyof typeof COL_CLASS] ?? "grid-cols-2"} ${colOfFormation === 1 ? "gap-1" : "gap-x-4 gap-y-1"}`}
			>
				{watchFormations.map((formation, index) => (
					// biome-ignore lint/a11y/noStaticElementInteractions: carte : enfants déjà interactifs
					// biome-ignore lint/a11y/useKeyWithClickEvents: sélection d'item
					<div
						className="formation-card"
						key={formation.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(formation.clientKey);
							setSectionSelected("section-formation"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={formation}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</div>
				))}
				{showAddFormation && (
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
								FieldNameFormation.content,
								[...watchFormations, { ...fresh, order: watchFormations.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter une formation</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
