import { z } from "zod";
import {
	adminDashboardPeriodSchema,
	adminDashboardService,
} from "../../../src/services/admin/adminDashboardService";
import { adminUserService } from "../../../src/services/admin/adminUserService";
import { PlanRole } from "../../../generated/prisma/enums";
import { ValidationError } from "../../../src/services/errors";
import { adminProcedure, router } from "../trpc";

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
 * Liste users admin + actions fiche.
 */
export const adminRouter = router({
	dashboardOverview: adminProcedure
		.input(
			z.object({
				period: adminDashboardPeriodSchema.default("7d"),
			}),
		)
		.query(async ({ input }) => {
			const [users, cvs, downloads] = await Promise.all([
				adminDashboardService.getUserStats(input.period),
				adminDashboardService.getCvStats(input.period),
				adminDashboardService.getDownloadStats(input.period),
			]);

			return {
				period: input.period,
				users,
				cvs,
				downloads,
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
				ctx.session.user.id === input.id
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
});
