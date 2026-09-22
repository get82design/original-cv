import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@utils": path.resolve(__dirname, "./utils"),
			"@server": path.resolve(__dirname, "./server"),
			"@generated": path.resolve(__dirname, "./generated"),
		},
	},
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
			exclude: ["src/**/*.d.ts", "src/**/dto/**"],
		},
	},
});
