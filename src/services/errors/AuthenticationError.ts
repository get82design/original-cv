import { AppError } from "./AppError";

export class AuthenticationError extends AppError {
	constructor(message = "Authentication required") {
		super("UNAUTHORIZED", message);
	}
}
