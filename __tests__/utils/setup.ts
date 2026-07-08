import { beforeEach, afterAll } from "vitest";
import { resetTestDB, disconnectTestDB } from "./database";

beforeEach(async () => {
	await resetTestDB();
});

afterAll(async () => {
	await disconnectTestDB();
});
