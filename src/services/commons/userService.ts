import type { User } from "../../../generated/prisma/client";
import { PlanRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { NotFoundError, ValidationError } from "../errors";

export class UserService {
	async findById(id: string) {
		const user = await prisma.user.findUnique({
			where: {
				id,
			},
		});
		if (!user) {
			throw new NotFoundError("USER", id);
		}
		return user;
	}

	async findByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	async updateProfile(
		id: string,
		data: {
			name?: string;
			image?: string;
		},
	) {
		const user = await prisma.user.findUnique({
			where: {
				id,
			},
		});

		if (!user) {
			throw new NotFoundError("USER", id);
		}

		return prisma.user.update({
			where: { id },
			data: {
				name: data.name ?? user.name,
				image: data.image ?? user.image,
			},
		});
	}

	async consumeDownloadCredit(id: string) {
		const user = await prisma.user.findUnique({
			where: {
				id,
			},
		});
		if (!user) {
			throw new NotFoundError("USER", id);
		}
		if (user.downloadCredits <= 0) {
			throw new ValidationError("No download credits available");
		}
		return prisma.user.update({
			where: { id },
			data: { downloadCredits: user.downloadCredits - 1 },
		});
	}

	async incrementIaRequests(id: string) {
		await this.findById(id);
		return prisma.user.update({
			where: { id },
			data: {
				iaRequestsUsed: {
					increment: 1,
				},
			},
		});
	}

	async resetIaRequests(id: string) {
		await this.findById(id);
		return prisma.user.update({
			where: { id },
			data: { iaRequestsUsed: 0, lastIaReset: new Date() },
		});
	}

	async updateMaxCvs(id: string, maxCvs: number) {
		await this.findById(id);
		return prisma.user.update({
			where: { id },
			data: { maxCvs: maxCvs },
		});
	}

	async canCreateCv(id: string) {
		const user = await this.findById(id);

		const cvCount = await this.countUserCvs(id);

		return cvCount < user.maxCvs;
	}

	async countUserCvs(id: string) {
		await this.findById(id);

		return prisma.cV.count({
			where: {
				userId: id,
			},
		});
	}

	async updatePlan(id: string, plan: PlanRole, subscriptionEnd?: Date) {
		const premiumPlans: PlanRole[] = [
			PlanRole.PREMIUM,
			PlanRole.PREMIUM_PLUS_IA,
		];
		const user = await this.findById(id);
		if (premiumPlans.includes(plan) && !subscriptionEnd) {
			throw new ValidationError(
				"Subscription end date is required for premium plan",
			);
		}
		if (
			premiumPlans.includes(plan) &&
			subscriptionEnd &&
			subscriptionEnd < new Date()
		) {
			throw new ValidationError("Subscription end date must be in the future");
		}

		return prisma.user.update({
			where: {
				id,
			},
			data: {
				plan,
				subscriptionEnd: subscriptionEnd ?? user.subscriptionEnd,
			},
		});
	}
}

export const userService = new UserService();
