import { DownloadVariant, PlanRole, AiFeature } from "../../../generated/prisma/enums";
import { ValidationError } from "../../../src/services/errors";
import { adminProcedure, router } from "../trpc";
import { adminAiService } from "../../../src/services/admin/adminAiService";
import { adminCvService } from "../../../src/services/admin/adminCvService";
import { adminDownloadService } from "../../../src/services/admin/adminDownloadService";
import { adminUserService } from "../../../src/services/admin/adminUserService";
import {
	adminDashboardPeriodSchema,
	adminDashboardService,
} from "../../../src/services/admin/adminDashboardService";
import { z } from "zod";

export type { AdminDashboardPeriod } from "../../../src/services/admin/adminDashboardService";
export { adminDashboardPeriodSchema };

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
						"cvCount",
						"downloadCount",
						"freeDownloadCount",
						"paidDownloadCount",
					])
					.default("cvCount"),
			}),
		)
		.query(({ input }) => adminCvService.listTopTemplates(input)),

	listTopColors: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
			}),
		)
		.query(({ input }) => adminCvService.listTopColors(input)),

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
