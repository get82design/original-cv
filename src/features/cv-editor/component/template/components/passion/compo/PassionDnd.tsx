import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import type { JSX } from "react";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";
import { FieldNamePassion } from "@/features/cv-editor/utils/fields/fieldNamePassion";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import type { PassionItemContentInput } from "@/services/schemas/cvSave.schema";
import type { PassionCardProps } from "../../../register/passion/PassionCardRegister";

interface PassionDndProps {
	watchPassions: ListItem<PassionItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<PassionItemContentInput>;
	colOfPassion: number;
	CardComponent: React.ComponentType<PassionCardProps>;
}

export const PassionDnd = ({
	watchPassions,
	itemSelected,
	setItemSelected,
	createNewItem,
	colOfPassion,
	CardComponent,
}: PassionDndProps) => {
	const { sectionSelected } = useCreateCvContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.passion.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
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

	const showAddPassion = sectionSelected === "section-passion";

	return (
		<SortableContext
			items={watchPassions.map((s) => s.clientKey)}
			strategy={horizontalListSortingStrategy}
		>
			<div
				className={`passion-grid grid ${COL_CLASS[colOfPassion as keyof typeof COL_CLASS] ?? "grid-cols-4"} gap-x-2 gap-y-0 min-h-[30px]`}
			>
				<CompoPassionDnd
					passions={watchPassions}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					showAddPassion={showAddPassion}
					createNewItem={createNewItem}
					itemsMenu={itemsMenu}
					CardComponent={CardComponent}
				/>
			</div>
		</SortableContext>
	);
};

interface CompoPassionDndProps {
	passions: ListItem<PassionItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	showAddPassion: boolean;
	createNewItem: () => ListItem<PassionItemContentInput>;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
	CardComponent: React.ComponentType<PassionCardProps>;
}

export const CompoPassionDnd = ({
	passions,
	itemSelected,
	setItemSelected,
	showAddPassion,
	createNewItem,
	itemsMenu,
	CardComponent,
}: CompoPassionDndProps) => {
	const { setValue } = useFormContext();
	return (
		<>
			{passions.map((passion, index) => (
				<div
					// type="button"
					className="passion-card"
					key={passion.clientKey}
					// onClick={(e) => {
					// 	e.stopPropagation();
					// 	setItemSelected(passion.clientKey);
					// 	setSectionSelected("section-passion"); // global : sa section
					// }}
				>
					<CardComponent
						index={index}
						item={passion}
						itemSelected={itemSelected} // local
						setItemSelected={setItemSelected} // local
						itemsMenu={itemsMenu}
					/>
				</div>
			))}
			{showAddPassion && (
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
							FieldNamePassion.content,
							[...passions, { ...fresh, order: passions.length + 1 }],
							{ shouldDirty: true },
						);
					}}
				>
					<MdAdd /> <span>Ajouter une passion</span>
				</Button>
			)}
		</>
	);
};
