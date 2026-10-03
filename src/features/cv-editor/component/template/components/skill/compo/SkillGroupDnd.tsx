import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema";
import { useFormContext } from "react-hook-form";
import { FieldNameSkill } from "@/features/cv-editor/utils/fields/fieldNameSkill";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { RadioRhf } from "@/components/input/radio/RadioRhf";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MdAdd } from "react-icons/md";
import { Button } from "primereact/button";
import type { ListItem } from "@utils/type";
import type { GroupSkillCardProps } from "../../../register/skill/GroupSkillCardRegister";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import { COL_CLASS, ITEM_OPTIONS } from "@/features/cv-editor/utils/utilsCv/cols";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

interface SkillGroupDndProps {
	watchSkills: ListItem<SkillGroupItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<SkillGroupItemContentInput>;
	// colOfSkill: number;
	GroupCardComponent: React.ComponentType<GroupSkillCardProps>;
}

//! Penser le composant qui possède plusieurs zones de plusieurs skills qui peuvent dnd entre eux dans la zone
//! Mais ce même composant doit pouvoir dnd les différents zones de skills

export const SkillGroupDnd = ({
	watchSkills,
	itemSelected,
	setItemSelected,
	createNewItem,
	// colOfSkill,
	GroupCardComponent,
}: SkillGroupDndProps) => {
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const { watch, setValue } = useFormContext();

	const modules = watch("modules");
	const path = moduleField(modules, "skill", "settings", "content");
	const groupCols = (Number(watch(`${path}.groupColumns`) ?? 1) || 1) as 1 | 2 | 3;
	const itemOptions = ITEM_OPTIONS[groupCols];

	const itemsMenu = (idx: number) => {
		const watchDesignTag = watch(`datas.skillGroup.content.${idx}.content.settings.design`);
		// dans itemsMenu(idx) :
		const itemColumnsPath = `datas.skillGroup.content.${idx}.content.settings.itemColumns`;
		const watchItemCols = watch(itemColumnsPath);
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Nom du groupe</p>
								<ToggleAfficherCacher
									name={`datas.skillGroup.content.${idx}.content.settings.withGroupTitle`}
								/>
							</div>
						),
					},
					{
						template: (
							<div className="flex flex-col py-1 px-4">
								<p>Style du tag</p>
								<div className="grid grid-cols-2 gap-2">
									<RadioRhf
										name={`datas.skillGroup.content.${idx}.content.settings.design`}
										label="Stars"
										value="stars"
										checked={watchDesignTag === "stars"}
									/>
									<RadioRhf
										name={`datas.skillGroup.content.${idx}.content.settings.design`}
										label="Dots"
										value="dots"
										checked={watchDesignTag === "dots"}
									/>
									<RadioRhf
										name={`datas.skillGroup.content.${idx}.content.settings.design`}
										label="Bars"
										value="bars"
										checked={watchDesignTag === "bars"}
									/>
								</div>
							</div>
						),
					},
					...(itemOptions.length > 1
						? [
								{
									template: (
										<div className="flex flex-col py-1 px-4 gap-2">
											<p>Colonnes dans le groupe</p>
											<div className="grid grid-cols-3 gap-2">
												{itemOptions.map((n) => (
													<RadioRhf
														key={n}
														name={itemColumnsPath}
														label={String(n)}
														value={n}
														checked={Number(watchItemCols) === n}
													/>
												))}
											</div>
										</div>
									),
								},
							]
						: []),
				],
			},
		];
	};

	const showAddGroup = sectionSelected === "section-skill";

	return (
		<SortableContext
			items={watchSkills.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div
				className={`skills-grid grid items-start grid ${COL_CLASS[groupCols as keyof typeof COL_CLASS] ?? "grid-cols-1"} ${groupCols === 1 ? "gap-1" : "gap-x-4 gap-y-1"}`}
			>
				{watchSkills.map((skill, index) => (
					// biome-ignore lint/a11y/noStaticElementInteractions: carte : enfants déjà interactifs
					// biome-ignore lint/a11y/useKeyWithClickEvents: sélection d'item
					<div
						className={`skill-group-card w-full`}
						key={skill.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(skill.clientKey);
							setSectionSelected("section-skill"); // global : sa section
						}}
					>
						<GroupCardComponent
							index={index}
							item={skill}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
							// colOfSkill={colOfSkill}
						/>
					</div>
				))}
				{showAddGroup && (
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
								FieldNameSkill.content,
								[...watchSkills, { ...fresh, order: watchSkills.length + 1 }],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter un groupe</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
