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

const SIDEBAR_ALLOWED = new Set([
	"language",
	"tag",
	"socialMedia",
	"passion",
	"prize",
	"expertise",
]);

function forceSidebarInnerColumns(modules: CvModulesInput[], movedType: string): CvModulesInput[] {
	return modules.map((mod) => {
		if (mod.type !== movedType) return mod;
		if (mod.type === "skill") {
			const settings = (mod.settings ?? {}) as Record<string, unknown>;
			const content = (settings.content ?? {}) as Record<string, unknown>;
			return {
				...mod,
				settings: {
					...settings,
					content: { ...content, groupColumns: 1 },
				},
			};
		}
		if (!SIDEBAR_ALLOWED.has(mod.type)) return mod;
		const settings = (mod.settings ?? {}) as Record<string, unknown>;
		const content = (settings.content ?? {}) as Record<string, unknown>;
		return {
			...mod,
			settings: {
				...settings,
				content: { ...content, columns: 1 },
			},
		};
	});
}

/** "section-education" → "education" */
function sectionIdToType(id: string | number) {
	return String(id).replace(/^section-/, "");
}

/**
 * DnD page CV.
 * - `columns[0]` = sidebar / unique, `columns[1]` = main, etc.
 * - OneColumn : `useCvPageDnd([itemUse])`
 * - TwoColumn : `useCvPageDnd([left, right])`
 */
export function useCvPageDnd(
	columns: Array<SectionItem[]>,
	{ sidebarColumn }: { sidebarColumn?: 0 | 1 } = {},
) {
	const { watch, setValue, getValues } = useFormContext();
	const watchModules = watch("modules") as CvModulesInput[];

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

	const findColumnOf = (sectionId: string | number) => {
		for (let col = 0; col < columns.length; col++) {
			if (columns[col]?.some((item) => item.id === sectionId)) return col;
		}
		return -1;
	};

	/** Réécrit order (+ column optionnelle) pour une liste de types dans une colonne. */
	const applyOrdersForColumn = (
		modules: CvModulesInput[],
		column: number,
		orderedTypes: string[],
	) => {
		const orderByType = Object.fromEntries(orderedTypes.map((type, index) => [type, index + 1]));
		return modules.map((mod) => {
			const nextOrder = orderByType[mod.type];
			if (nextOrder == null) return mod;
			return { ...mod, column, order: nextOrder };
		});
	};

	const reorderByClientKey = (path: string, activeId: string | number, overId: string | number) => {
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

	const handleSectionDragEnd = (
		activeId: string | number,
		overId: string | number,
		activeData: Record<string, unknown>,
		overData: Record<string, unknown> | undefined,
	) => {
		const activeCol = findColumnOf(activeId);
		if (activeCol < 0) return;

		const movedType = sectionIdToType(activeId);
		const sourceList = columns[activeCol] ?? [];

		// ——— Drop sur une zone colonne (souvent vide) ———
		if (overData?.type === "column") {
			const overCol = overData.column as number;
			if (typeof overCol !== "number") return;

			// Même colonne + drop sur le conteneur → rien à faire
			if (activeCol === overCol) return;
			if (sidebarColumn != null && overCol === sidebarColumn && !SIDEBAR_ALLOWED.has(movedType))
				return;

			const sourceTypes = sourceList
				.filter((item) => item.id !== activeId)
				.map((item) => sectionIdToType(item.id));
			const targetTypes = [
				...(columns[overCol] ?? []).map((item) => sectionIdToType(item.id)),
				movedType, // en fin de colonne cible
			];

			let next = applyOrdersForColumn(watchModules, activeCol, sourceTypes);
			next = applyOrdersForColumn(next, overCol, targetTypes);

			if (overCol === 0) {
				next = forceSidebarInnerColumns(next, movedType);
			}

			setValue("modules", next, { shouldDirty: true });
			return;
		}

		// ——— Drop sur une autre section ———
		if (overData?.type !== "section") return;

		const overCol = typeof overData.column === "number" ? overData.column : findColumnOf(overId);
		if (overCol < 0) return;

		// —— Même colonne : reorder classique ——
		if (activeCol === overCol) {
			const list = [...sourceList];
			const oldIndex = list.findIndex((i) => i.id === activeId);
			const newIndex = list.findIndex((i) => i.id === overId);
			if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

			const reorderedTypes = arrayMove(list, oldIndex, newIndex).map((item) =>
				sectionIdToType(item.id),
			);
			setValue("modules", applyOrdersForColumn(watchModules, activeCol, reorderedTypes), {
				shouldDirty: true,
			});
			return;
		}
		if (sidebarColumn != null && overCol === sidebarColumn && !SIDEBAR_ALLOWED.has(movedType))
			return;
		// —— Autre colonne : change column + recalcule les 2 orders ——
		const sourceTypes = sourceList
			.filter((item) => item.id !== activeId)
			.map((item) => sectionIdToType(item.id));

		const targetList = (columns[overCol] ?? []).filter((item) => item.id !== activeId);
		const insertAt = targetList.findIndex((i) => i.id === overId);
		const safeInsert = insertAt === -1 ? targetList.length : insertAt;
		const targetTypes = [
			...targetList.slice(0, safeInsert).map((i) => sectionIdToType(i.id)),
			movedType,
			...targetList.slice(safeInsert).map((i) => sectionIdToType(i.id)),
		];

		let next = applyOrdersForColumn(watchModules, activeCol, sourceTypes);
		next = applyOrdersForColumn(next, overCol, targetTypes);

		if (overCol === 0) {
			next = forceSidebarInnerColumns(next, movedType);
		}

		setValue("modules", next, { shouldDirty: true });
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeData = active.data.current;
		const overData = over.data.current;
		if (!activeData) return;

		// ——— Niveau 1 : sections (multi-colonnes) ———
		if (activeData.type === "section") {
			handleSectionDragEnd(
				active.id,
				over.id,
				activeData as Record<string, unknown>,
				overData as Record<string, unknown> | undefined,
			);
			return;
		}

		// ——— Niveau 2 : cards (même conteneur) ———
		if (activeData.type === "card") {
			if (overData?.type !== "card" || overData.containerId !== activeData.containerId) {
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

		// ——— Niveau 3 : subcards (même groupe) ———
		if (activeData.type === "subcard") {
			if (overData?.type !== "subcard") return;
			if (activeData.containerId !== overData.containerId) return;
			reorderByClientKey(activeData.path as string, active.id, over.id);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const activeData = active.data.current;
		const overData = over.data.current;
		if (!activeData || !overData) return;
		// ——— Sections : cross-colonne live ———
		if (activeData.type === "section") {
			const activeCol = findColumnOf(active.id);
			if (activeCol < 0) return;
			let overCol: number;
			let insertAt: number;
			if (overData.type === "column") {
				overCol = overData.column as number;
				if (typeof overCol !== "number") return;
				insertAt = (columns[overCol] ?? []).length;
			} else if (overData.type === "section") {
				overCol =
					typeof overData.column === "number" ? (overData.column as number) : findColumnOf(over.id);
				if (overCol < 0) return;
				const targetList = (columns[overCol] ?? []).filter((i) => i.id !== active.id);
				const idx = targetList.findIndex((i) => i.id === over.id);
				insertAt = idx === -1 ? targetList.length : idx;
			} else {
				return;
			}
			// déjà dans la colonne cible → laisse le sortable / dragEnd gérer
			if (activeCol === overCol) return;
			const movedType = sectionIdToType(active.id);
			if (sidebarColumn != null && overCol === sidebarColumn && !SIDEBAR_ALLOWED.has(movedType))
				return;
			const sourceTypes = (columns[activeCol] ?? [])
				.filter((i) => i.id !== active.id)
				.map((i) => sectionIdToType(i.id));
			const targetList = (columns[overCol] ?? []).filter((i) => i.id !== active.id);
			const targetTypes = [
				...targetList.slice(0, insertAt).map((i) => sectionIdToType(i.id)),
				movedType,
				...targetList.slice(insertAt).map((i) => sectionIdToType(i.id)),
			];
			const modules = getValues("modules") as CvModulesInput[];
			let next = applyOrdersForColumn(modules, activeCol, sourceTypes);
			next = applyOrdersForColumn(next, overCol, targetTypes);
			if (overCol === 0) {
				next = forceSidebarInnerColumns(next, movedType);
			}
			setValue("modules", next, { shouldDirty: true });
			return;
		}
		// Cross-groupe skills uniquement (inchangé)
		if (activeData.type !== "subcard") return;

		const activeContainer = activeData.containerId as string;
		const activePath = activeData.path as string;

		let overPath: string;
		let insertIndex: number;

		if (overData.type === "subcard") {
			const overContainer = overData.containerId as string;
			overPath = overData.path as string;
			if (activeContainer === overContainer) return;

			const overList = [...(getValues(overPath) ?? [])];
			const overIndex = overList.findIndex((i) => i.clientKey === String(over.id));
			insertIndex = overIndex === -1 ? overList.length : overIndex;
		} else if (overData.type === "card" && overData.containerId === "skillGroup") {
			const overContainer = String(over.id);
			if (activeContainer === overContainer) return;

			overPath =
				(overData.skillsPath as string) ??
				(() => {
					const groups = getValues("datas.skillGroup.content") ?? [];
					const gi = groups.findIndex(
						(g: { clientKey: string }) => g.clientKey === String(over.id),
					);
					return gi === -1 ? null : `datas.skillGroup.content.${gi}.content.skills`;
				})();
			if (!overPath) return;
			insertIndex = (getValues(overPath) ?? []).length;
		} else {
			return;
		}

		const activeList = [...(getValues(activePath) ?? [])];
		const overList = [...(getValues(overPath) ?? [])];

		const activeIndex = activeList.findIndex((i) => i.clientKey === String(active.id));
		if (activeIndex === -1) return;
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
				const container = args.droppableContainers.find((c) => c.id === collision.id);
				return container?.data.current?.type === type;
			});

		if (activeType === "section") {
			const section = findByType("section");
			if (section) return [section];
			// Colonne vide (ou zone libre entre sections)
			const column = findByType("column");
			return column ? [column] : list;
		}

		if (activeType === "card") {
			const card = findByType("card");
			return card ? [card] : list;
		}

		if (activeType === "subcard") {
			const subcard = findByType("subcard");
			if (subcard) return [subcard];

			const groupCard = list.find((collision) => {
				const container = args.droppableContainers.find((c) => c.id === collision.id);
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
