import { AppError } from "./AppError";

export class ConflictError extends AppError {
	constructor(code: string, message = "Conflict") {
		super(code, message);
	}
}
