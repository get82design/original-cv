import { hash } from "bcrypt";
import type { User } from "../../../generated/prisma/client";
import { PlanRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type { UpdateUserInput } from "../schemas/user.schema";
import { createHash, randomBytes } from "crypto";
import { sendPasswordResetEmail } from "../mail/mailService";

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

	async requestPasswordReset(email: string) {
		const normalized = email.trim().toLowerCase();
		const user = await this.findByEmail(normalized);
		// Toujours le même retour (pas d'énumération d'emails)
		if (!user) {
			return { ok: true as const };
		}
		const rawToken = randomBytes(32).toString("hex");
		const tokenHash = createHash("sha256").update(rawToken).digest("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
		await prisma.passwordResetToken.deleteMany({
			where: { email: user.email },
		});
		await prisma.passwordResetToken.create({
			data: {
				email: user.email,
				tokenHash,
				expiresAt,
			},
		});
		const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
		const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
		await sendPasswordResetEmail(user.email, resetUrl);
		return { ok: true as const };
	}
	async resetPassword(input: { token: string; password: string }) {
		const tokenHash = createHash("sha256").update(input.token).digest("hex");
		const reset = await prisma.passwordResetToken.findUnique({
			where: { tokenHash },
		});
		if (!reset || reset.expiresAt < new Date()) {
			if (reset) {
				await prisma.passwordResetToken.delete({ where: { id: reset.id } });
			}
			throw new ValidationError("Lien de réinitialisation invalide ou expiré");
		}
		const user = await this.findByEmail(reset.email);
		if (!user) {
			await prisma.passwordResetToken.delete({ where: { id: reset.id } });
			throw new ValidationError("Lien de réinitialisation invalide ou expiré");
		}
		const hashedPassword = await hash(input.password, 12);
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedPassword },
		});
		await prisma.passwordResetToken.deleteMany({
			where: { email: reset.email },
		});
		return { ok: true as const };
	}
}

export const userService = new UserService();
