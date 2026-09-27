import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema";
import { useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import { FieldNameExperience } from "@/features/cv-editor/utils/fields/fieldNameExperience";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { MdAdd } from "react-icons/md";
import { Button } from "primereact/button";
import type { ListItem } from "@utils/type";
import type { CardExperienceOneProps } from "./CardExperienceOne";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface ExperiencesDndProps {
	watchExperiences: ListItem<ExperienceItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<ExperienceItemContentInput>;
	CardComponent: React.ComponentType<CardExperienceOneProps>;
}

export const ExperiencesDnd = ({
	watchExperiences,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
}: ExperiencesDndProps) => {
	const { setValue } = useFormContext();
	const { setSectionSelected, sectionSelected } = useCreateCvContext();

	const addElmList = (item: ListItem<ExperienceItemContentInput>, elm: string, index: number) => {
		const pathContent = dataFieldContent("datas.experience.content", index, "content.missions");

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
		const pathContent = dataFieldContent("datas.experience.content", index, "content.missions");
		const currentMissions = watchExperiences[index]?.content?.missions ?? [];
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
		const pathContent = dataFieldContent("datas.experience.content", idx, "content.settings");
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
								<p>Entreprise</p>
								<ToggleAfficherCacher name={`${pathContent}.withCompany`} />
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

	const showAddExperience = sectionSelected === "section-experience";

	return (
		<SortableContext
			items={watchExperiences.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className="experiences-grid grid grid-cols-1 gap-2">
				{watchExperiences.map((experience, index) => (
					<button
						type="button"
						className="experience-card w-full"
						key={experience.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(experience.clientKey);
							setSectionSelected("section-experience"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={experience}
							itemSelected={itemSelected}
							setItemSelected={setItemSelected}
							itemsMenu={itemsMenu}
							addElmList={addElmList}
							deleteMission={deleteMission}
						/>
					</button>
				))}
				{showAddExperience && (
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
								FieldNameExperience.content,
								[...watchExperiences, { ...fresh, order: watchExperiences.length + 1 }],
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
