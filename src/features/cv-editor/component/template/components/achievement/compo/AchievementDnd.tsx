import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameAchievement } from "@/features/cv-editor/utils/fields/fieldNameAchievement";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { AchievementItemContentInput } from "@/services/schemas/cvSave.schema";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import type { AchievementCardProps } from "../../../register/achievement/AchievementCardRegister";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface AchievementDndProps {
	watchAchievements: ListItem<AchievementItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<AchievementItemContentInput>;
	CardComponent: React.ComponentType<AchievementCardProps>;
}

export const AchievementDnd = ({
	watchAchievements,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
}: AchievementDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { setValue } = useFormContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.achievement.content", idx, "content.settings");
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
								<p>Année</p>
								<ToggleAfficherCacher name={`${pathContent}.withYear`} />
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
								<p>Technologie</p>
								<ToggleAfficherCacher name={`${pathContent}.withTechnology`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddAchievement = sectionSelected === "section-achievement";

	return (
		<SortableContext
			items={watchAchievements.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className="achievements-grid">
				{watchAchievements.map((achievement, index) => (
					<button
						type="button"
						className="achievement-card w-full"
						key={achievement.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(achievement.clientKey);
							setSectionSelected("section-achievement"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={achievement}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</button>
				))}
				{showAddAchievement && (
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
								FieldNameAchievement.content,
								[...watchAchievements, { ...fresh, order: watchAchievements.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter une réalisation</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
