import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;

// Types exposés au front (contrat API, pas Prisma)
export type Color = RouterOutputs["color"]["findAll"][number];
export type TemplateCv = RouterOutputs["cvTemplate"]["findAll"][number];
export type CvFull = RouterOutputs["cv"]["byId"];