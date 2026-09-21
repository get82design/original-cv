import { DownloadVariant, PlanRole, AiFeature, UnlockMethod } from "../../../generated/prisma/enums";
import { ValidationError } from "../../../src/services/errors";
import { adminProcedure, router } from "../trpc";
import { adminAiService } from "../../../src/services/admin/adminAiService";
import { adminCvService } from "../../../src/services/admin/adminCvService";
import { adminDownloadService } from "../../../src/services/admin/adminDownloadService";
import { adminTemplateService } from "../../../src/services/admin/adminTemplateService";
import { adminUnlockService } from "../../../src/services/admin/adminUnlockService";
import { adminUserService } from "../../../src/services/admin/adminUserService";
import {
	adminDashboardPeriodSchema,
	adminDashboardService,
} from "../../../src/services/admin/adminDashboardService";
import { z } from "zod";

export type { AdminDashboardPeriod } from "../../../src/services/admin/adminDashboardService";
export { adminDashboardPeriodSchema };

const unlockGiftsSchema = z
	.object({
		downloadCredits: z.number().int().min(0).max(10_000).optional(),
		freeDownloads: z.number().int().min(0).max(10_000).optional(),
	})
	.strict();

const updateTemplateCatalogSchema = z
	.object({
		id: z.string().min(1),
		isActive: z.boolean().optional(),
		isPremium: z.boolean().optional(),
		priceCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
		priceCredits: z.number().int().min(0).max(10_000).nullable().optional(),
		isFeatured: z.boolean().optional(),
		sortOrder: z.number().int().min(0).max(10_000).optional(),
		unlockGifts: unlockGiftsSchema.nullable().optional(),
	})
	.refine(
		(v) =>
			typeof v.isActive === "boolean" ||
			typeof v.isPremium === "boolean" ||
			v.priceCents !== undefined ||
			v.priceCredits !== undefined ||
			typeof v.isFeatured === "boolean" ||
			typeof v.sortOrder === "number" ||
			v.unlockGifts !== undefined,
		{ message: "Au moins un champ catalogue à mettre à jour" },
	);

const updateUserInputSchema = z
	.object({
		id: z.string().min(1),
		isActive: z.boolean().optional(),
		downloadCredits: z.number().int().min(0).max(10_000).optional(),
		freeDownloadsRemaining: z.number().int().min(0).max(10_000).optional(),
		plan: z.nativeEnum(PlanRole).optional(),
		subscriptionEnd: z.date().nullable().optional(),
	})
	.refine(
		(v) =>
			typeof v.isActive === "boolean" ||
			typeof v.downloadCredits === "number" ||
			typeof v.freeDownloadsRemaining === "number" ||
			v.plan != null ||
			v.subscriptionEnd !== undefined,
		{ message: "Au moins un champ à mettre à jour" },
	);

/**
 * Dashboard admin — users + CV + downloads ; ventes / funnel en placeholder.
 * Liste users + fiche + feed downloads.
 */
export const adminRouter = router({
	dashboardOverview: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
			}),
		)
		.query(async ({ input }) => {
			const [users, cvs, downloads, ai] = await Promise.all([
				adminDashboardService.getUserStats(input.period),
				adminDashboardService.getCvStats(input.period),
				adminDashboardService.getDownloadStats(input.period),
				adminDashboardService.getAiStats(input.period),
			]);

			return {
				period: input.period,
				users,
				cvs,
				downloads,
				ai,
				// TODO(admin-sales): après intégration Stripe (Checkout + webhooks →
				// table locale Order/Payment). Brancher ici CA, commandes, panier moyen,
				// refunds, échecs paiement, liens Stripe (statut/montant/produit),
				// cohortes free → payant. Puis feed commandes + cards dashboard.
				sales: {
					ready: false as const,
					revenueCents: null as number | null,
					ordersCount: null as number | null,
				},
				funnel: {
					ready: false as const,
				},
			};
		}),

	listUsers: adminProcedure
		.input(
			z.object({
				search: z.string().trim().max(120).optional(),
				isActive: z.boolean().optional(),
				plan: z.nativeEnum(PlanRole).optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(({ input }) => adminUserService.listUsers(input)),

	getUser: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(({ input }) => adminUserService.getUserDetail(input.id)),

	updateUser: adminProcedure
		.input(updateUserInputSchema)
		.mutation(async ({ ctx, input }) => {
			if (
				input.isActive === false &&
				ctx.session?.user.id === input.id
			) {
				throw new ValidationError(
					"Impossible de désactiver votre propre compte",
				);
			}

			const { id, ...patch } = input;
			return adminUserService.updateUser(id, patch);
		}),

	softResetUser: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(({ input }) => adminUserService.softResetUser(input.id)),

	unlockTemplateForUser: adminProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				templateId: z.string().min(1),
			}),
		)
		.mutation(({ input }) =>
			adminUnlockService.unlockForUser(input.userId, input.templateId),
		),

	listDownloads: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
				variant: z.nativeEnum(DownloadVariant).optional(),
				search: z.string().trim().max(120).optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(({ input }) => adminDownloadService.listDownloads(input)),

	listCvs: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
				templateId: z.string().min(1).optional(),
				primaryColorName: z.string().min(1).max(64).optional(),
				search: z.string().trim().max(120).optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(({ input }) => adminCvService.listCvs(input)),

	listCvFilters: adminProcedure.query(() => adminCvService.listFilters()),

	listTopTemplates: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
				sortBy: z
					.enum([
						"popularityScore",
						"unlockCount",
						"cvCount",
						"downloadCount",
						"freeDownloadCount",
						"paidDownloadCount",
					])
					.default("popularityScore"),
			}),
		)
		.query(({ input }) => adminCvService.listTopTemplates(input)),

	listUnlocks: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
				method: z.nativeEnum(UnlockMethod).optional(),
				templateId: z.string().min(1).optional(),
				search: z.string().trim().max(120).optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(({ input }) => adminUnlockService.listUnlocks(input)),

	listTopColors: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
			}),
		)
		.query(({ input }) => adminCvService.listTopColors(input)),

	listTemplates: adminProcedure
		.input(
			z.object({
				search: z.string().trim().max(120).optional(),
				isActive: z.boolean().optional(),
				isPremium: z.boolean().optional(),
				isFeatured: z.boolean().optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(({ input }) => adminTemplateService.listTemplates(input)),

	getTemplate: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(({ input }) => adminTemplateService.getTemplate(input.id)),

	updateTemplateCatalog: adminProcedure
		.input(updateTemplateCatalogSchema)
		.mutation(({ input }) => {
			const { id, ...patch } = input;
			return adminTemplateService.updateCatalog(id, patch);
		}),

	listAiEvents: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
				feature: z.nativeEnum(AiFeature).optional(),
				search: z.string().trim().max(120).optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(20),
			}),
		)
		.query(({ input }) => adminAiService.listAiEvents(input)),
});
