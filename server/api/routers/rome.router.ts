import { z } from "zod";
import { franceTravailRomeService } from "../../../src/services/france-travail/franceTravailRomeService";
import { romeCodeSchema } from "../../../src/services/schemas/romeFiche.schema";
import { protectedProcedure, router } from "../trpc";

/**
 * Référentiel ROME France Travail — lecture seule, pas de billing.
 */
export const romeRouter = router({
	searchAppellations: protectedProcedure
		.input(
			z.object({
				q: z.string().trim().min(2).max(120),
				limit: z.number().int().min(1).max(50).optional(),
			}),
		)
		.query(({ input }) =>
			franceTravailRomeService.searchAppellations({
				q: input.q,
				...(input.limit !== undefined ? { limit: input.limit } : {}),
			}),
		),

	getFiche: protectedProcedure
		.input(z.object({ codeRome: romeCodeSchema }))
		.query(({ input }) => franceTravailRomeService.getFicheByCodeRome(input.codeRome)),
});
