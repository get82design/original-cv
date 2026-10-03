import {
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";
import { FieldNameExpertise } from "@/features/cv-editor/utils/fields/fieldNameExpertise";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import type { ExpertiseItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ExpertiseCardProps } from "../../../register/expertise/ExpertiseCardRegister";

interface ExpertiseDndProps {
	watchExpertises: ListItem<ExpertiseItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<ExpertiseItemContentInput>;
	colOfExpertise: number;
	CardComponent: React.ComponentType<ExpertiseCardProps>;
}

export const ExpertiseDnd = ({
	watchExpertises,
	itemSelected,
	setItemSelected,
	createNewItem,
	colOfExpertise = 4,
	CardComponent,
}: ExpertiseDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const showAddExpertise = sectionSelected === "section-expertise";
	return (
		<SortableContext
			items={watchExpertises.map((s) => s.clientKey)}
			strategy={colOfExpertise === 1 ? verticalListSortingStrategy : horizontalListSortingStrategy}
		>
			<div
				className={`expertise-grid grid ${COL_CLASS[colOfExpertise as keyof typeof COL_CLASS] ?? "grid-cols-4"} ${colOfExpertise === 1 ? "gap-1" : "gap-x-4 gap-y-1"} min-h-[30px]`}
			>
				<CompoExpertiseDnd
					expertises={watchExpertises}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					setSectionSelected={setSectionSelected}
					showAddExpertise={showAddExpertise}
					createNewItem={createNewItem}
					CardComponent={CardComponent}
				/>
			</div>
		</SortableContext>
	);
};

interface CompoExpertiseDndProps {
	expertises: ListItem<ExpertiseItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	setSectionSelected: (e: string) => void;
	showAddExpertise: boolean;
	createNewItem: () => ListItem<ExpertiseItemContentInput>;
	CardComponent: React.ComponentType<ExpertiseCardProps>;
}

export const CompoExpertiseDnd = ({
	expertises,
	itemSelected,
	setItemSelected,
	setSectionSelected,
	showAddExpertise,
	createNewItem,
	CardComponent,
}: CompoExpertiseDndProps) => {
	const { setValue } = useFormContext();
	return (
		<>
			{expertises.map((expertise, index) => (
				// biome-ignore lint/a11y/noStaticElementInteractions: carte : RatingCvInput déjà interactif
				// biome-ignore lint/a11y/useKeyWithClickEvents: sélection d'item expertise
				<div
					className="expertise-card"
					key={expertise.clientKey}
					onClick={(e) => {
						e.stopPropagation();
						setItemSelected(expertise.clientKey);
						setSectionSelected("section-expertise"); // global : sa section
					}}
				>
					<CardComponent
						index={index}
						item={expertise}
						itemSelected={itemSelected} // local
						setItemSelected={setItemSelected} // local
					/>
				</div>
			))}
			{showAddExpertise && (
				<Button
					type="button"
					outlined
					icon="pi pi-plus"
					size="small"
					onClick={(e) => {
						e.stopPropagation();
						const fresh = createNewItem();
						commitCvFormHistory();
						setValue(
							FieldNameExpertise.content,
							[...expertises, { ...fresh, order: expertises.length + 1 }],
							{ shouldDirty: true },
						);
					}}
				/>
			)}
		</>
	);
};
