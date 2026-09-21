import { AppError } from "./AppError";

/**
 * Gemini / IA saturée (429, overload…) après retries.
 * Côté client : message actionnable « réessaie plus tard ».
 */
export class TooManyRequestsError extends AppError {
	constructor(
		message = "L’assistant est temporairement saturé. Réessaie dans quelques secondes.",
		details?: unknown,
	) {
		super("TOO_MANY_REQUESTS", message, details);
	}
}
