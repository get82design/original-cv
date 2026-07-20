import type { CvTimelineStatus } from "../../generated/prisma/enums";
import { ValidationError } from "../services/errors";

export function validateTimeline(
	start: Date,
	end?: Date | null,
	status?: CvTimelineStatus | null,
) {
	if (end && start > end) {
		throw new ValidationError(
			"INVALID_TIMELINE",
			"Start date cannot be after end date.",
		);
	}

	if (status && !end) {
		throw new ValidationError(
			"INVALID_TIMELINE",
			"Completed status requires an end date.",
		);
	}
}
