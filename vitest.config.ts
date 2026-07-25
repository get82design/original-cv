import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		maxWorkers: 1,
		isolate: false,
		include: ["**/__tests__/**/*.test.ts"],
		setupFiles: ["./__tests__/utils/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary"],
			include: ["src/**/*.ts", "server/api/**/*.ts"],
			exclude: [
				"src/**/*.d.ts",
				"src/**/dto/**", // optionnel : exclure les DTOs
			],
		},
	},
});
