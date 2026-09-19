import "dotenv/config";
import { geminiService } from "../src/services/ai/geminiService";

async function main() {
	console.log("Pinging Gemini…");
	const result = await geminiService.ping();
	console.log("model:", result.model);
	console.log("text:", result.text);
	console.log("ok:", result.ok);
	if (!result.ok) {
		process.exitCode = 1;
	}
}

main().catch((err) => {
	console.error("Ping failed:", err instanceof Error ? err.message : err);
	process.exitCode = 1;
});
