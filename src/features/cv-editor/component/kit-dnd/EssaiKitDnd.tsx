import { useState } from "react";
import {
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { pointerWithin } from "@dnd-kit/core";

export const EssaiKitDnd = () => {
	const sensors = useSensors(useSensor(PointerSensor));
	function handleDragEnd(event) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id.toString();
		const overId = over.id.toString();

		// Cas 1 : Déplacement d'un GROUPE entier
		if (activeId.startsWith("group-")) {
			if (activeId !== overId) {
				setCvSections((prevSections) => {
					const oldIndex = prevSections.findIndex((g) => g.id === activeId);
					const newIndex = prevSections.findIndex((g) => g.id === overId);

					// Utilise la fonction arrayMove fournie par @dnd-kit/sortable
					return arrayMove(prevSections, oldIndex, newIndex);
				});
			}
			return;
		}

		// Cas 2 : Déplacement d'une COMPÉTENCE (Tri final au sein du même groupe)
		if (activeId.startsWith("skill-")) {
			setCvSections((prevSections) => {
				const activeGroup = findGroupOfSkill(prevSections, activeId);
				if (!activeGroup) return prevSections;

				const groupIndex = prevSections.findIndex((g) => g.id === activeGroup.id);
				const oldIndex = activeGroup.skills.findIndex((s) => s.id === activeId);
				const newIndex = activeGroup.skills.findIndex((s) => s.id === overId);

				// Si l'index est valide (la compétence est relâchée sur une autre compétence du même groupe)
				if (oldIndex !== -1 && newIndex !== -1 && groupIndex !== -1) {
					const newSections = [...prevSections];
					const group = newSections[groupIndex];
					if (!group) return prevSections;
					group.skills = arrayMove(activeGroup.skills, oldIndex, newIndex);
					return newSections;
				}

				return prevSections;
			});
		}
	}

	function handleDragOver(event) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id.toString();
		const overId = over.id.toString();

		if (activeId === overId) return;

		// On vérifie si l'élément déplacé est une compétence
		const isActiveASkill = activeId.startsWith("skill-");
		if (!isActiveASkill) return; // Si c'est un groupe, on gère uniquement dans handleDragEnd

		setCvSections((prevSections) => {
			// 1. Trouver le groupe d'origine de la compétence
			const activeGroup = findGroupOfSkill(prevSections, activeId);

			// 2. Trouver le groupe de destination
			// Le survol (overId) peut être une autre compétence OU directement la zone vide d'un groupe
			let overGroup = findGroupOfSkill(prevSections, overId);
			if (!overGroup) {
				overGroup = findGroupById(prevSections, overId);
			}

			// Si on ne trouve pas les groupes ou qu'on reste dans le même groupe, on attend le handleDragEnd
			if (!activeGroup || !overGroup || activeGroup.id === overGroup.id) {
				return prevSections;
			}

			// 3. Calculer les positions
			const activeGroupIndex = prevSections.findIndex((g) => g.id === activeGroup.id);
			const overGroupIndex = prevSections.findIndex((g) => g.id === overGroup.id);

			const activeSkillIndex = activeGroup.skills.findIndex((s) => s.id === activeId);

			// Déterminer le nouvel index de la compétence dans le groupe de destination
			let newSkillIndex;
			if (overId.startsWith("skill-")) {
				newSkillIndex = overGroup.skills.findIndex((s) => s.id === overId);
			} else {
				// Si on survole le conteneur du groupe vide, on place la compétence à la fin
				newSkillIndex = overGroup.skills.length;
			}

			// 4. Recréer proprement le nouveau tableau d'état (Immuabilité)
			const newSections = [...prevSections];
			const sourceGroup = newSections[activeGroupIndex];
			const targetGroup = newSections[overGroupIndex];
			if (!sourceGroup || !targetGroup) return prevSections;

			// Retirer la compétence du groupe d'origine
			const [movedSkill] = sourceGroup.skills.splice(activeSkillIndex, 1);
			if (!movedSkill) return prevSections;

			// Insérer la compétence dans le groupe cible
			targetGroup.skills.splice(newSkillIndex, 0, movedSkill);

			return newSections;
		});
	}

	const [cvSections, setCvSections] = useState([
		{
			id: "group-langages",
			title: "Langages",
			skills: [
				{ id: "skill-js", name: "JavaScript" },
				{ id: "skill-ts", name: "TypeScript" },
			],
		},
		{
			id: "group-frameworks",
			title: "Frameworks",
			skills: [
				{ id: "skill-react", name: "React" },
				{ id: "skill-next", name: "Next.js" },
			],
		},
	]);

	// Trouve le groupe qui contient une compétence spécifique (via l'ID de la compétence)
	const findGroupOfSkill = (sections, skillId) => {
		return sections.find((group) => group.skills.some((skill) => skill.id === skillId));
	};

	// Trouve un groupe directement par son propre ID
	const findGroupById = (sections, groupId) => {
		return sections.find((group) => group.id === groupId);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={pointerWithin} // Crucial pour l'imbrication
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
		>
			{/* Premier contexte pour trier les groupes entre eux */}
			<SortableContext items={cvSections.map((g) => g.id)} strategy={verticalListSortingStrategy}>
				<div className="groups-container">
					{cvSections.map((group) => (
						<SkillGroup key={group.id} group={group} />
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
};

function SkillGroup({ group }: { group: any }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: group.id,
	});

	const style = {
		// transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} className="group-card">
			{/* Poignée de déplacement du groupe */}
			<div {...attributes} {...listeners} className="group-handle">
				⣿ {group.title}
			</div>

			{/* Contexte interne pour trier les compétences à l'intérieur de ce groupe */}
			<SortableContext items={group.skills.map((s) => s.id)} strategy={rectSortingStrategy}>
				<div className="skills-grid">
					{group.skills.map((skill) => (
						<SkillItem key={skill.id} skill={skill} />
					))}
				</div>
			</SortableContext>
		</div>
	);
}

function SkillItem({ skill }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: skill.id,
	});

	const style = {
		//   transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="skill-badge">
			{skill.name}
		</div>
	);
}
