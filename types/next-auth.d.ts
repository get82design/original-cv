import { DefaultSession } from "next-auth";
import { PlanRole } from "../generated/prisma/enums";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			plan: PlanRole;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		plan: PlanRole;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		plan: PlanRole;
	}
}