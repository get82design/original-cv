export class AppError extends Error {
	constructor(
		public readonly code: string,
		message?: string,
		public readonly details?: unknown,
	) {
		super(message ?? code);

		this.name = this.constructor.name;

		Error.captureStackTrace?.(this, this.constructor);
	}
}
