import { AppError } from "./AppError";

// L'utilisateur n'a pas le droit d'effectuer l'action
export class ForbiddenError extends AppError {
	constructor(code: string, message = "Forbidden") {
		super(code, message);
	}
}
