import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

export async function assertCvOwnership(cvId: string, userId: string) {
	const cv = await prisma.cV.findUnique({
		where: { id: cvId },
		select: { id: true, userId: true },
	});

	if (!cv) {
		throw new NotFoundError("CV", cvId);
	}

	if (cv.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this CV");
	}

	return cv;
}
