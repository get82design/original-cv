import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameStrength } from "@/features/cv-editor/utils/fields/fieldNameStrength";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { StrengthItemContentInput } from "@/services/schemas/cvSave.schema";
import {
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import type { StrengthCardProps } from "../../../register/strength/StrengthCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface StrengthDndProps {
	watchStrengths: ListItem<StrengthItemContentInput>[];
	itemSelected: string;
	setItemSelected: (item: string) => void;
	createNewItem: () => ListItem<StrengthItemContentInput>;
	CardComponent: React.ComponentType<StrengthCardProps>;
	colOfStrength: number;
}

export const StrengthDnd = ({
	watchStrengths,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
	colOfStrength,
}: StrengthDndProps) => {
	const { setValue } = useFormContext();
	const { sectionSelected } = useCreateCvContext();

	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.strength.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Titre</p>
								<ToggleAfficherCacher name={`${pathContent}.withStrength`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Description</p>
								<ToggleAfficherCacher name={`${pathContent}.withDescription`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Icon</p>
								<ToggleAfficherCacher name={`${pathContent}.withIcon`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddStrength = sectionSelected === "section-strength";
	return (
		<SortableContext
			items={watchStrengths.map((s) => s.clientKey)}
			strategy={colOfStrength === 1 ? verticalListSortingStrategy : horizontalListSortingStrategy}
		>
			<div
				className={`strengths-grid grid ${COL_CLASS[colOfStrength as keyof typeof COL_CLASS] ?? "grid-cols-1"} ${colOfStrength === 1 ? "gap-1" : "gap-x-4 gap-y-0"}`}
			>
				{watchStrengths.map((strength, index) => (
					<div className="strength-card w-full" key={strength.clientKey}>
						<CardComponent
							index={index}
							item={strength}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</div>
				))}
				{showAddStrength && (
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
								FieldNameStrength.content,
								[...watchStrengths, { ...fresh, order: watchStrengths.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un atout</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
