import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameStat } from "@/features/cv-editor/utils/fields/fieldNameStat";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { StatItemContentInput } from "@/services/schemas/cvSave.schema";
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
import type { StatCardProps } from "../../../register/stat/StatCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface StatDndProps {
	watchStats: ListItem<StatItemContentInput>[];
	itemSelected: string;
	setItemSelected: (item: string) => void;
	createNewItem: () => ListItem<StatItemContentInput>;
	CardComponent: React.ComponentType<StatCardProps>;
	colOfStat: number;
}

export const StatDnd = ({
	watchStats,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
	colOfStat,
}: StatDndProps) => {
	const { setValue } = useFormContext();
	const { sectionSelected } = useCreateCvContext();

	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.stat.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Valeur</p>
								<ToggleAfficherCacher name={`${pathContent}.withValue`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Libellé</p>
								<ToggleAfficherCacher name={`${pathContent}.withLabel`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddStat = sectionSelected === "section-stat";
	return (
		<SortableContext
			items={watchStats.map((s) => s.clientKey)}
			strategy={colOfStat === 1 ? verticalListSortingStrategy : horizontalListSortingStrategy}
		>
			<div
				className={`stats-grid grid ${COL_CLASS[colOfStat as keyof typeof COL_CLASS] ?? "grid-cols-1"} ${colOfStat === 1 ? "gap-1" : "gap-x-4 gap-y-0"}`}
			>
				{watchStats.map((stat, index) => (
					<div className="stat-card w-full" key={stat.clientKey}>
						<CardComponent
							index={index}
							item={stat}
							itemSelected={itemSelected}
							setItemSelected={setItemSelected}
							itemsMenu={itemsMenu}
						/>
					</div>
				))}
				{showAddStat && (
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
								FieldNameStat.content,
								[...watchStats, { ...fresh, order: watchStats.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un chiffre</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
