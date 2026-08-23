import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameCompetence } from "@/features/cv-editor/utils/fields/fieldNameCompetence";
import type { CompetenceGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import {
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import type { GroupCompetenceCardProps } from "../../../register/competence/GroupCompetenceCardRegister";

interface CompetenceGroupDndProps {
	watchCompetences: ListItem<CompetenceGroupItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<CompetenceGroupItemContentInput>;
	GroupCardComponent: React.ComponentType<GroupCompetenceCardProps>;
}

//! Penser le composant qui possède plusieurs zones de plusieurs Competences qui peuvent dnd entre eux dans la zone
//! Mais ce même composant doit pouvoir dnd les différents zones de Competences

export const CompetenceGroupDnd = ({
	watchCompetences,
	itemSelected,
	setItemSelected,
	createNewItem,
	GroupCardComponent,
}: CompetenceGroupDndProps) => {
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const { setValue } = useFormContext();

	const itemsMenu = (idx: number) => {
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Nom du groupe</p>
								<ToggleAfficherCacher
									name={`datas.competenceGroup.content.${idx}.content.settings.withGroupTitle`}
								/>
							</div>
						),
					},
				],
			},
		];
	};

	const showAddGroup = sectionSelected === "section-competence";

	return (
		<SortableContext
			items={watchCompetences.map((s) => s.clientKey)}
			strategy={horizontalListSortingStrategy}
		>
			<div className="competences-grid grid grid-cols-2 gap-2">
				{watchCompetences.map((competence, index) => (
					<button
						type="button"
						className="competence-group-card w-full"
						key={competence.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(competence.clientKey);
							setSectionSelected("section-competence"); // global : sa section
						}}
					>
						<GroupCardComponent
							index={index}
							item={competence}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</button>
				))}
				{showAddGroup && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								FieldNameCompetence.content,
								[
									...watchCompetences,
									{ ...fresh, order: watchCompetences.length + 1 },
								],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un groupe</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
