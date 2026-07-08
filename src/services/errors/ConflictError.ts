import { AppError } from "./AppError";

export class ConflictError extends AppError {
	constructor(message: string, details?: string) {
		super("CONFLICT", message, details);
	}
}
