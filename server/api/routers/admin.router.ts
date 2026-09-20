import { z } from "zod";
import {
	adminDashboardPeriodSchema,
	adminDashboardService,
} from "../../../src/services/admin/adminDashboardService";
import { adminProcedure, router } from "../trpc";

export type { AdminDashboardPeriod } from "../../../src/services/admin/adminDashboardService";
export { adminDashboardPeriodSchema };

/**
 * Dashboard admin — users + CV + downloads ; ventes / funnel en placeholder.
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
});
