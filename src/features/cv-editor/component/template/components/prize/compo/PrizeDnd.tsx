import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNamePrize } from "@/features/cv-editor/utils/fields/fieldNamePrize";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { PrizeItemContentInput } from "@/services/schemas/cvSave.schema";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import type { PrizeCardProps } from "../../../register/prize/PrizeCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";

interface PrizeDndProps {
	watchPrizes: ListItem<PrizeItemContentInput>[];
	itemSelected: string;
	setItemSelected: (item: string) => void;
	createNewItem: () => ListItem<PrizeItemContentInput>;
	CardComponent: React.ComponentType<PrizeCardProps>;
	colOfPrize: number;
}

export const PrizeDnd = ({
	watchPrizes,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
	colOfPrize,
}: PrizeDndProps) => {
	const { setValue } = useFormContext();
	const { sectionSelected } = useCreateCvContext();

	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.prize.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Titre</p>
								<ToggleAfficherCacher name={`${pathContent}.withTitle`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Domaine</p>
								<ToggleAfficherCacher name={`${pathContent}.withDomain`} />
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

	const showAddPrize = sectionSelected === "section-prize";

	return (
		<SortableContext
			items={watchPrizes.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div
				className={`prizes-grid grid ${COL_CLASS[colOfPrize as keyof typeof COL_CLASS] ?? "grid-cols-3"} ${colOfPrize === 1 ? "gap-1" : "gap-x-4 gap-y-1"}`}
			>
				{watchPrizes.map((prize, index) => (
					<div
						// type="button"
						className="prize-card w-full"
						key={prize.clientKey}
						// onClick={(e) => {
						// 	e.stopPropagation();
						// 	setItemSelected(prize.clientKey);
						// 	setSectionSelected("section-prize"); // global : sa section
						// }}
					>
						<CardComponent
							index={index}
							item={prize}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</div>
				))}
				{showAddPrize && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								FieldNamePrize.content,
								[...watchPrizes, { ...fresh, order: watchPrizes.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un prix</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
