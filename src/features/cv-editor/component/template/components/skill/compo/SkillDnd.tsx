import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import { COL_CLASS, clampItemColumns } from "@/features/cv-editor/utils/utilsCv/cols";
import type { SkillCardProps } from "../../../register/skill/SkillCardRegister";

interface SkillDndProps {
	skills: ListItem<unknown>[];
	groupIndex: number;
	setItemSelected: (e: string) => void;
	itemSelected: string;
	clientKeyGroup: string;
	// colOfSkill: number;
	CardComponent: React.ComponentType<SkillCardProps>;
}

export const SkillDnd = ({
	skills,
	groupIndex,
	setItemSelected,
	itemSelected,
	clientKeyGroup,
	// colOfSkill,
	CardComponent,
}: SkillDndProps) => {
	const { sectionSelected, setSectionSelected } = useCreateCvContext();
	const createNewItem = () => {
		return {
			clientKey: `skill-${uuid()}`,
			order: skills.length + 1,
			content: { name: "", level: "Débutant" },
		};
	};

	const { watch } = useFormContext();
	const modules = watch("modules");
	const modulePath = moduleField(modules, "skill", "settings", "content");
	const groupCols = Number(watch(`${modulePath}.groupColumns`) ?? 1) as 1 | 2 | 3;
	const raw = Number(
		watch(`datas.skillGroup.content.${groupIndex}.content.settings.itemColumns`) ?? 2,
	);
	const itemCols = clampItemColumns(groupCols, raw);

	const isThisGroupActive =
		itemSelected === clientKeyGroup || skills.some((s) => s.clientKey === itemSelected);

	const showAddSkill = sectionSelected === "section-skill" && isThisGroupActive;

	return (
		<SortableContext
			items={skills.map((s) => s.clientKey)}
			strategy={horizontalListSortingStrategy}
		>
			<div
				className={`skill-dnd-grid grid ${COL_CLASS[itemCols] ?? COL_CLASS[2]} ${itemCols === 1 ? "gap-1" : "gap-x-4 gap-y-1"}  min-h-[30px]`}
			>
				<CompoSkillDnd
					CardComponent={CardComponent}
					skills={skills}
					groupIndex={groupIndex}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					setSectionSelected={setSectionSelected}
					clientKeyGroup={clientKeyGroup}
					showAddSkill={showAddSkill}
					createNewItem={createNewItem}
				/>
			</div>
		</SortableContext>
	);
};

interface CompoSkillDndProps {
	CardComponent: React.ComponentType<SkillCardProps>;
	skills: ListItem<unknown>[];
	groupIndex: number;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	setSectionSelected: (e: string) => void;
	clientKeyGroup: string;
	showAddSkill: boolean;
	createNewItem: () => ListItem<unknown>;
}

export const CompoSkillDnd = ({
	CardComponent,
	skills,
	groupIndex,
	itemSelected,
	setItemSelected,
	setSectionSelected,
	clientKeyGroup,
	showAddSkill,
	createNewItem,
}: CompoSkillDndProps) => {
	const { setValue } = useFormContext();
	return (
		<>
			{skills.map((skill, index) => (
				<button
					type="button"
					className="skill-card w-full"
					key={skill.clientKey}
					onClick={(e) => {
						e.stopPropagation();
						setItemSelected(skill.clientKey);
						setSectionSelected("section-skill"); // global : sa section
					}}
				>
					<CardComponent
						index={index}
						item={skill}
						groupIndex={groupIndex}
						itemSelected={itemSelected} // local
						setItemSelected={setItemSelected} // local
						itemName={`datas.skillGroup.content.${groupIndex}.content.skills`}
						clientKeyGroup={clientKeyGroup}
					/>
				</button>
			))}
			{showAddSkill && (
				<Button
					type="button"
					outlined
					icon="pi pi-plus"
					size="small"
					onClick={(e) => {
						e.stopPropagation();
						const fresh = createNewItem();
						commitCvFormHistory();
						setValue(
							`datas.skillGroup.content.${groupIndex}.content.skills`,
							[...skills, { ...fresh, order: skills.length + 1 }],
							{ shouldDirty: true },
						);
					}}
				/>
			)}
		</>
	);
};
