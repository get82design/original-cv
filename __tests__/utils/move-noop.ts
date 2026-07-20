import { expect } from "vitest";

type Entity = { id: string; order: number };
export async function expectMoveNoOp(args: {
	createEntity: () => Promise<Entity>;
	moveEntity: (id: string, newOrder: number) => Promise<Entity | null>;
}) {
	const created = await args.createEntity();
	const moved = await args.moveEntity(created.id, created.order);
	expect(moved).not.toBeNull();
	expect(moved).toMatchObject({
		id: created.id,
		order: created.order,
	});
}
