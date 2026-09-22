import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameProject } from "@/features/cv-editor/utils/fields/fieldNameProject";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { ProjectItemContentInput } from "@/services/schemas/cvSave.schema";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import type { ProjectCardProps } from "../../../register/project/ProjectCardRegister";

interface ProjectDndProps {
	watchProjects: ListItem<ProjectItemContentInput>[];
	itemSelected: string;
	setItemSelected: (itemSelected: string) => void;
	createNewItem: () => ListItem<ProjectItemContentInput>;
	CardComponent: React.ComponentType<ProjectCardProps>;
}
export const ProjectDnd = ({
	watchProjects,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
}: ProjectDndProps) => {
	const { setValue } = useFormContext();
	const { setSectionSelected, sectionSelected } = useCreateCvContext();

	const addElmList = (item: ListItem<ProjectItemContentInput>, elm: string, index: number) => {
		const pathContent = dataFieldContent("datas.project.content", index, "content.missions");

		const newMission = {
			clientKey: "mission-" + uuid(),
			content: { content: elm },
			order: (item.content.missions?.length ?? 0) + 1,
		};

		setValue(pathContent, [...(item.content.missions ?? []), newMission], {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const deleteMission = (index: number, idx: number) => {
		const pathContent = dataFieldContent("datas.project.content", index, "content.missions");
		const currentMissions = watchProjects[index]?.content?.missions ?? [];
		const nextMissions = currentMissions
			.filter((_, i) => i !== idx)
			.map((mission, i) => ({ ...mission, order: i + 1 }));
		setValue(pathContent, nextMissions, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.project.content", idx, "content.settings");
		return [
			{
				label: "Intitulé",
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
								<p>Période</p>
								<ToggleAfficherCacher name={`${pathContent}.withPeriode`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Technologies</p>
								<ToggleAfficherCacher name={`${pathContent}.withTechnology`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Missions</p>
								<ToggleAfficherCacher name={`${pathContent}.withMissions`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddProject = sectionSelected === "section-project";

	return (
		<SortableContext
			items={watchProjects.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className="projects-grid">
				{watchProjects.map((project, index) => (
					<button
						type="button"
						className="project-card w-full"
						key={project.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(project.clientKey);
							setSectionSelected("section-project"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={project}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
							addElmList={addElmList}
							deleteMission={deleteMission}
						/>
					</button>
				))}
				{showAddProject && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								FieldNameProject.content,
								[...watchProjects, { ...fresh, order: watchProjects.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un projet</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
