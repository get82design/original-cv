import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameVolunteering } from "@/features/cv-editor/utils/fields/fieldNameVolunteering";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { VolunteeringItemContentInput } from "@/services/schemas/cvSave.schema";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { v4 as uuid } from "uuid";
import type { VolunteeringCardProps } from "../../../register/volunteering/VolunteeringCardOne";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface VolunteeringsDndProps {
	watchVolunteerings: ListItem<VolunteeringItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<VolunteeringItemContentInput>;
	CardComponent: React.ComponentType<VolunteeringCardProps>;
}

export const VolunteeringsDnd = ({
	watchVolunteerings,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
}: VolunteeringsDndProps) => {
	const { setValue } = useFormContext();
	const { setSectionSelected, sectionSelected } = useCreateCvContext();

	const addElmList = (item: ListItem<VolunteeringItemContentInput>, elm: string, index: number) => {
		const pathContent = dataFieldContent("datas.volunteering.content", index, "content.missions");

		const newMission = {
			clientKey: `mission-${uuid()}`,
			content: { content: elm },
			order: (item.content.missions?.length ?? 0) + 1,
		};

		commitCvFormHistory();
		setValue(pathContent, [...(item.content.missions ?? []), newMission], {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const deleteMission = (index: number, idx: number) => {
		const pathContent = dataFieldContent("datas.volunteering.content", index, "content.missions");
		const currentMissions = watchVolunteerings[index]?.content?.missions ?? [];
		const nextMissions = currentMissions
			.filter((_, i) => i !== idx)
			.map((mission, i) => ({ ...mission, order: i + 1 }));
		commitCvFormHistory();
		setValue(pathContent, nextMissions, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.volunteering.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Intitulé</p>
								<ToggleAfficherCacher name={`${pathContent}.withTitle`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Organisme</p>
								<ToggleAfficherCacher name={`${pathContent}.withOrganisme`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Période</p>
								<ToggleAfficherCacher name={`${pathContent}.withPeriode`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Lieu</p>
								<ToggleAfficherCacher name={`${pathContent}.withLocation`} />
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
								<p>Liste</p>
								<ToggleAfficherCacher name={`${pathContent}.withListMissions`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddVolunteering = sectionSelected === "section-volunteering";

	return (
		<SortableContext
			items={watchVolunteerings.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className="volunteerings-grid">
				{watchVolunteerings.map((volunteering, index) => (
					<button
						type="button"
						className="volunteering-card w-full"
						key={volunteering.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(volunteering.clientKey);
							setSectionSelected("section-volunteering"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={volunteering}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
							addElmList={addElmList}
							deleteMission={deleteMission}
						/>
					</button>
				))}
				{showAddVolunteering && (
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
								FieldNameVolunteering.content,
								[...watchVolunteerings, { ...fresh, order: watchVolunteerings.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter une expérience</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
