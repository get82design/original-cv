import { hash } from "bcrypt";
import type { User } from "../../../generated/prisma/client";
import { PlanRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type { UpdateUserInput } from "../schemas/user.schema";

export class UserService {
	async findAll() {
		return prisma.user.findMany();
	}

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

	async updateProfile(id: string, data: UpdateUserInput) {
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
				...(data.name !== undefined ? { name: data.name } : {}),
				...(data.image !== undefined ? { image: data.image } : {}),
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

	async register(input: { email: string; password: string; name?: string }) {
		const existing = await this.findByEmail(input.email);
		if (existing) {
			throw new ConflictError("USER_ALREADY_EXISTS", "Cet email est déjà utilisé");
		}
		const hashedPassword = await hash(input.password, 12);
		const user = await prisma.user.create({
			data: {
				email: input.email,
				password: hashedPassword,
				name: input.name ?? null,
			},
		});
		// Ne jamais renvoyer le password
		const { password: _, ...safeUser } = user;
		return safeUser;
	}
}

export const userService = new UserService();
