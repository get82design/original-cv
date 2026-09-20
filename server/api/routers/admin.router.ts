import { z } from "zod";
import {
	adminDashboardPeriodSchema,
	adminDashboardService,
} from "../../../src/services/admin/adminDashboardService";
import { adminUserService } from "../../../src/services/admin/adminUserService";
import { PlanRole } from "../../../generated/prisma/enums";
import { adminProcedure, router } from "../trpc";

export type { AdminDashboardPeriod } from "../../../src/services/admin/adminDashboardService";
export { adminDashboardPeriodSchema };

/**
 * Dashboard admin — users + CV + downloads ; ventes / funnel en placeholder.
 * Liste users admin.
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
});
