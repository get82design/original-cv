import { AppError } from "./AppError";

// Une ressource n'existe pas (CV, Profile, Skill...)
export class NotFoundError extends AppError {
	constructor(entity: string, id?: string) {
		super(
			`${entity.toUpperCase()}_NOT_FOUND`,
			id ? `${entity} '${id}' not found` : `${entity} not found`,
		);
	}
}
