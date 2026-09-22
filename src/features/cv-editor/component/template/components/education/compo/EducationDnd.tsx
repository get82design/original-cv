import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation";
import { verticalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { Button } from "primereact/button";
import { MdAdd } from "react-icons/md";
import { useFormContext } from "react-hook-form";
import type { ListItem } from "@utils/type";
import type { EducationCardProps } from "../../../register/education/EducationCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";

interface EducationDndProps {
	watchEducations: ListItem<EducationItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<EducationItemContentInput>;
	CardComponent: React.ComponentType<EducationCardProps>;
	colOfEducation: number;
}

export const EducationDnd = ({
	watchEducations,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
	colOfEducation,
}: EducationDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { setValue } = useFormContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent("datas.education.content", idx, "content.settings");
		return [
			{
				label: "Options",
				items: [
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
								<p>Etablissement</p>
								<ToggleAfficherCacher name={`${pathContent}.withEtablissement`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Ville</p>
								<ToggleAfficherCacher name={`${pathContent}.withVille`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddEducation = sectionSelected === "section-education";

	return (
		<SortableContext
			items={watchEducations.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div
				className={`educations-grid grid items-start ${COL_CLASS[colOfEducation as keyof typeof COL_CLASS] ?? "grid-cols-1"} gap-x-6 gap-y-2`}
			>
				{watchEducations.map((education, index) => (
					<button
						type="button"
						className="education-card w-full"
						key={education.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(education.clientKey);
							setSectionSelected("section-education"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={education}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</button>
				))}
				{showAddEducation && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								FieldNameEducation.content,
								[...watchEducations, { ...fresh, order: watchEducations.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un diplôme</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
