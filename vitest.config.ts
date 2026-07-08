import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		maxWorkers: 1,
		isolate: false,
		include: ["**/__tests__/**/*.test.ts"],
		setupFiles: ["./__tests__/utils/setup.ts"],
	},
});
