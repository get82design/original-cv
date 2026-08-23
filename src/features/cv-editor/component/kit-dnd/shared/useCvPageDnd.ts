import { useFormContext } from "react-hook-form";
import type { SectionItem } from "./SectionCatalog";
import {
	closestCenter,
	PointerSensor,
	pointerWithin,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragEndEvent,
	type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { CvModulesInput } from "@/services/schemas/cvSave.schema";

export function useCvPageDnd(itemUse: SectionItem[]) {
	const { watch, setValue, getValues } = useFormContext();
	const watchModules = watch("modules");

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);

	const reorderByClientKey = (
		path: string,
		activeId: string | number,
		overId: string | number,
	) => {
		const list = (getValues(path) ?? []) as Array<{
			clientKey: string;
			order?: number;
		}>;
		const oldIndex = list.findIndex((i) => i.clientKey === String(activeId));
		const newIndex = list.findIndex((i) => i.clientKey === String(overId));
		if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
		setValue(
			path,
			arrayMove(list, oldIndex, newIndex).map((item, index) => ({
				...item,
				order: index + 1,
			})),
			{ shouldDirty: true },
		);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeData = active.data.current;
		const overData = over.data.current;

		if (!activeData) return;

		// ——— Niveau 1 : sections ———
		if (activeData.type === "section") {
			const sorted = [...itemUse];
			const oldIndex = sorted.findIndex((i) => i.id === active.id);
			const newIndex = sorted.findIndex((i) => i.id === over.id);

			if (oldIndex === -1 || newIndex === -1) return;

			const reordered = arrayMove(sorted, oldIndex, newIndex);
			const orderByType = Object.fromEntries(
				reordered.map((item, index) => [
					item.id.replace("section-", ""),
					index + 1,
				]),
			);

			setValue(
				"modules",
				watchModules.map((mod: CvModulesInput) =>
					orderByType[mod.type] != null
						? { ...mod, order: orderByType[mod.type] }
						: mod,
				),
				{ shouldDirty: true },
			);
			return;
		}
		// ——— Niveau 2 : cards (même conteneur) ———
		if (activeData.type === "card") {
			if (
				overData?.type !== "card" ||
				overData.containerId !== activeData.containerId
			) {
				console.warn("drop ignoré, over =", over.id, overData);
				return;
			}

			const path = activeData.path as string;
			const list = (getValues(path) ?? []) as Array<{
				clientKey: string;
				order?: number;
			}>;

			const oldIndex = list.findIndex((i) => i.clientKey === String(active.id));
			const newIndex = list.findIndex((i) => i.clientKey === String(over.id));
			if (oldIndex === -1 || newIndex === -1) return;

			setValue(
				path,
				arrayMove(list, oldIndex, newIndex).map((item, index) => ({
					...item,
					order: index + 1,
				})),
				{ shouldDirty: true },
			);
			return;
		}
		// // ——— Niveau 2 : cards education ———
		// if (activeData.type === 'card' && activeData.containerId === 'education') {
		//     // on ne reorder que si on drop sur une autre card du même conteneur
		//     if (overData?.type !== 'card' || overData.containerId !== 'education') {
		//         console.warn('drop ignoré, over =', over.id, overData)
		//         return
		//     }

		//     const path = activeData.path as string // FieldNameEducation.content
		//     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

		//     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
		//     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
		//     if (oldIndex === -1 || newIndex === -1) return

		//     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
		//         ...item,
		//         order: index + 1,
		//     }))
		//     setValue(path, reordered, { shouldDirty: true })
		// }
		// // ——— Niveau 2 : cards experience ———
		// if (activeData.type === 'card' && activeData.containerId === 'experience') {
		//     // on ne reorder que si on drop sur une autre card du même conteneur
		//     if (overData?.type !== 'card' || overData.containerId !== 'experience') {
		//         console.warn('drop ignoré, over =', over.id, overData)
		//         return
		//     }

		//     const path = activeData.path as string // FieldNameExperience.content
		//     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

		//     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
		//     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
		//     if (oldIndex === -1 || newIndex === -1) return

		//     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
		//         ...item,
		//         order: index + 1,
		//     }))
		//     setValue(path, reordered, { shouldDirty: true })
		// }
		// // ——— Niveau 2 : cards language ———
		// if (activeData.type === 'card' && activeData.containerId === 'language') {
		//     // on ne reorder que si on drop sur une autre card du même conteneur
		//     if (overData?.type !== 'card' || overData.containerId !== 'language') {
		//         console.warn('drop ignoré, over =', over.id, overData)
		//         return
		//     }

		//     const path = activeData.path as string // FieldNameLanguage.content
		//     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

		//     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
		//     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
		//     if (oldIndex === -1 || newIndex === -1) return

		//     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
		//         ...item,
		//         order: index + 1,
		//     }))
		//     setValue(path, reordered, { shouldDirty: true })
		// }
		// // ——— Niveau 2 : cards skillGroup ———
		// if (activeData.type === 'card' && activeData.containerId === 'skillGroup') {
		//     // on ne reorder que si on drop sur une autre card du même conteneur
		//     if (overData?.type !== 'card' || overData.containerId !== 'skillGroup') {
		//         console.warn('drop ignoré, over =', over.id, overData)
		//         return
		//     }

		//     const path = activeData.path as string // FieldNameSkill.content
		//     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

		//     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
		//     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
		//     if (oldIndex === -1 || newIndex === -1) return

		//     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
		//         ...item,
		//         order: index + 1,
		//     }))
		//     setValue(path, reordered, { shouldDirty: true })
		// }
		// ——— Niveau 3 : skills (subcard) ———
		if (activeData.type === "subcard") {
			if (overData?.type !== "subcard") return;
			if (activeData.containerId !== overData.containerId) return;
			reorderByClientKey(activeData.path as string, active.id, over.id);
			return;
		}
		// if (activeData.type === 'subcard') {
		//     // drop sur un autre skill
		//     if (overData?.type !== 'subcard') return

		//     // même groupe uniquement ici (le cross est dans dragOver)
		//     if (activeData.containerId !== overData.containerId) return

		//     const path = activeData.path as string
		//     const list = getValues(path) as Array<{ clientKey: string; order?: number }>
		//     if (!list) return

		//     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
		//     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
		//     if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

		//     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
		//         ...item,
		//         order: index + 1,
		//     }))
		//     setValue(path, reordered, { shouldDirty: true })
		//     return
		// }
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeData = active.data.current;
		const overData = over.data.current;
		if (!activeData || !overData) return;
		if (activeData.type !== "subcard") return;

		const activeContainer = activeData.containerId as string;
		const activePath = activeData.path as string;

		let overContainer: string;
		let overPath: string;
		let insertIndex: number;

		if (overData.type === "subcard") {
			// drop sur un skill d'un autre groupe
			overContainer = overData.containerId as string;
			overPath = overData.path as string;
			if (activeContainer === overContainer) return;

			const overList = [...(getValues(overPath) ?? [])];
			const overIndex = overList.findIndex(
				(i) => i.clientKey === String(over.id),
			);
			insertIndex = overIndex === -1 ? overList.length : overIndex;
		} else if (
			overData.type === "card" &&
			overData.containerId === "skillGroup"
		) {
			// drop sur le groupe lui-même (vide ou zone libre)
			overContainer = String(over.id); // clientKey du groupe
			if (activeContainer === overContainer) return;

			// préférer skillsPath si tu l'as mis dans data
			overPath =
				(overData.skillsPath as string) ??
				(() => {
					const groups = getValues("datas.skillGroup.content") ?? [];
					const gi = groups.findIndex(
						(g: any) => g.clientKey === String(over.id),
					);
					return gi === -1
						? null
						: `datas.skillGroup.content.${gi}.content.skills`;
				})();
			if (!overPath) return;
			insertIndex = (getValues(overPath) ?? []).length; // à la fin
		} else {
			return;
		}

		const activeList = [...(getValues(activePath) ?? [])];
		const overList = [...(getValues(overPath) ?? [])];

		const activeIndex = activeList.findIndex(
			(i) => i.clientKey === String(active.id),
		);
		if (activeIndex === -1) return;

		// déjà présent dans la cible (dragOver répété) → ne rien refaire
		if (overList.some((i) => i.clientKey === String(active.id))) return;

		const [moved] = activeList.splice(activeIndex, 1);
		if (!moved) return;
		overList.splice(insertIndex, 0, moved);

		setValue(
			activePath,
			activeList.map((item, i) => ({ ...item, order: i + 1 })),
			{ shouldDirty: true },
		);
		setValue(
			overPath,
			overList.map((item, i) => ({ ...item, order: i + 1 })),
			{ shouldDirty: true },
		);
	};

	const collisionDetection: CollisionDetection = (args) => {
		const activeType = args.active?.data.current?.type;
		const collisions = pointerWithin(args);
		const list = collisions.length ? collisions : closestCenter(args);

		const findByType = (type: string) =>
			list.find((collision) => {
				const container = args.droppableContainers.find(
					(c) => c.id === collision.id,
				);
				return container?.data.current?.type === type;
			});

		// On ne “voit” que les cibles du même niveau
		if (activeType === "section") {
			const section = findByType("section");
			return section ? [section] : list;
		}

		if (activeType === "card") {
			const card = findByType("card");
			return card ? [card] : list;
		}

		if (activeType === "subcard") {
			const subcard = findByType("subcard");
			if (subcard) return [subcard];

			// fallback : drop sur un groupe de skills (y compris vide)
			const groupCard = list.find((collision) => {
				const container = args.droppableContainers.find(
					(c) => c.id === collision.id,
				);
				const data = container?.data.current;
				return data?.type === "card" && data?.containerId === "skillGroup";
			});
			if (groupCard) return [groupCard];

			return list;
		}

		return list;
	};

	return { sensors, handleDragEnd, handleDragOver, collisionDetection };
}
