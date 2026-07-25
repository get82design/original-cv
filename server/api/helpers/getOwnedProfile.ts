// server/api/helpers/getOwnedProfile.ts
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

export async function getOwnedProfile(userId: string) {
	const profile = await prisma.profile.findUnique({
		where: { userId },
		select: { id: true, userId: true },
	});

	if (!profile) {
		throw new NotFoundError("Profile", userId);
	}

	return profile;
}
