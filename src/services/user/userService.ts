import { hash } from "bcrypt";
import type { User } from "../../../generated/prisma/client";
import { PlanRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type { UpdateUserInput } from "../schemas/user.schema";
import { createHash, randomBytes } from "crypto";
import { sendPasswordResetEmail } from "../mail/mailService";

/** Raisons de cadeau free download — one-shot par user */
export const FREE_DOWNLOAD_GRANT_REASONS = [
	"PROFILE_CREATED",
	"TEMPLATE_PURCHASED",
	"FIRST_CV_SAVED",
] as const;

export type FreeDownloadGrantReason =
	(typeof FREE_DOWNLOAD_GRANT_REASONS)[number];

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
		return this.consumePaidDownload(id);
	}

	/** Export gratuit (avec logo) possible ? */
	async canDownloadFree(id: string) {
		const user = await this.findById(id);
		return user.freeDownloadsRemaining > 0;
	}

	/** Export payant (sans logo) possible ? */
	async canDownloadPaid(id: string) {
		const user = await this.findById(id);
		return user.downloadCredits > 0;
	}

	/** Statut pour la modal de téléchargement */
	async getDownloadStatus(id: string) {
		const user = await this.findById(id);
		return {
			freeDownloadsRemaining: user.freeDownloadsRemaining,
			downloadCredits: user.downloadCredits,
			canDownloadFree: user.freeDownloadsRemaining > 0,
			canDownloadPaid: user.downloadCredits > 0,
		};
	}

	/** Consomme 1 téléchargement gratuit (avec logo) + log stats */
	async consumeFreeDownload(
		id: string,
		meta?: { cvId?: string; templateId?: string },
	) {
		const user = await this.findById(id);
		if (user.freeDownloadsRemaining <= 0) {
			throw new ValidationError("No free downloads available");
		}

		const [updated] = await prisma.$transaction([
			prisma.user.update({
				where: { id },
				data: { freeDownloadsRemaining: { decrement: 1 } },
			}),
			prisma.downloadEvent.create({
				data: {
					variant: "WITH_LOGO",
					hadAccount: true,
					userId: id,
					...(meta?.cvId ? { cvId: meta.cvId } : {}),
					...(meta?.templateId ? { templateId: meta.templateId } : {}),
				},
			}),
		]);
		return updated;
	}

	/** Consomme 1 crédit payant (sans logo) + log stats */
	async consumePaidDownload(
		id: string,
		meta?: { cvId?: string; templateId?: string },
	) {
		const user = await this.findById(id);
		if (user.downloadCredits <= 0) {
			throw new ValidationError("No download credits available");
		}

		const [updated] = await prisma.$transaction([
			prisma.user.update({
				where: { id },
				data: { downloadCredits: { decrement: 1 } },
			}),
			prisma.downloadEvent.create({
				data: {
					variant: "WITHOUT_LOGO",
					hadAccount: true,
					userId: id,
					...(meta?.cvId ? { cvId: meta.cvId } : {}),
					...(meta?.templateId ? { templateId: meta.templateId } : {}),
				},
			}),
		]);
		return updated;
	}

	/**
	 * Accorde des téléchargements gratuits (one-shot par reason).
	 * Si la raison a déjà été accordée → ConflictError, pas de double cadeau.
	 */
	async grantFreeDownload(
		id: string,
		reason: FreeDownloadGrantReason,
		amount = 1,
	) {
		if (amount < 1) {
			throw new ValidationError("Grant amount must be at least 1");
		}
		await this.findById(id);

		try {
			const [, user] = await prisma.$transaction([
				prisma.downloadGrant.create({
					data: { userId: id, reason, amount },
				}),
				prisma.user.update({
					where: { id },
					data: { freeDownloadsRemaining: { increment: amount } },
				}),
			]);
			return user;
		} catch (err) {
			// unique (userId, reason) → déjà accordé
			if (
				err &&
				typeof err === "object" &&
				"code" in err &&
				(err as { code: string }).code === "P2002"
			) {
				throw new ConflictError(
					"DOWNLOAD_GRANT_ALREADY_USED",
					`Free download already granted for reason: ${reason}`,
				);
			}
			throw err;
		}
	}

	/** Ajoute des crédits payants (achat pack, etc.) */
	async grantPaidDownloadCredits(id: string, amount: number) {
		if (amount < 1) {
			throw new ValidationError("Credit amount must be at least 1");
		}
		await this.findById(id);
		return prisma.user.update({
			where: { id },
			data: { downloadCredits: { increment: amount } },
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
