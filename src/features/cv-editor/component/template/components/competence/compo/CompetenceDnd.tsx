import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import {
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { CompetenceCardProps } from "../../../register/competence/CompetenceCardRegister";

interface CompetenceDndProps {
	competences: ListItem<unknown>[];
	groupIndex: number;
	setItemSelected: (e: string) => void;
	itemSelected: string;
	clientKeyGroup: string;
	CardComponent: React.ComponentType<CompetenceCardProps>;
}

export const CompetenceDnd = ({
	competences,
	groupIndex,
	setItemSelected,
	itemSelected,
	clientKeyGroup,
	CardComponent,
}: CompetenceDndProps) => {
	const { setValue } = useFormContext();
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const createNewItem = () => {
		return {
			clientKey: "competence-" + uuid(),
			order: competences.length + 1,
			content: { competenceId: "" },
		};
	};

	const isThisGroupActive =
		itemSelected === clientKeyGroup ||
		competences.some((c) => c.clientKey === itemSelected);

	const showAddCompetence =
		sectionSelected === "section-competence" && isThisGroupActive;

	return (
		<SortableContext
			items={competences.map((c) => c.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className={`competence-dnd-grid min-h-[30px]`}>
				{competences.map((competence, index) => (
					<button
						type="button"
						className="competence-card w-full"
						key={competence.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(competence.clientKey);
							setSectionSelected("section-competence"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={competence}
							groupIndex={groupIndex}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemName={`datas.competenceGroup.content.${groupIndex}.content.competences`}
							clientKeyGroup={clientKeyGroup}
						/>
					</button>
				))}
				{showAddCompetence && (
					<Button
						type="button"
						outlined
						icon="pi pi-plus"
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								`datas.competenceGroup.content.${groupIndex}.content.competences`,
								[...competences, { ...fresh, order: competences.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					/>
				)}
			</div>
		</SortableContext>
	);
};
