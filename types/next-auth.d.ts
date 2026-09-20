import { DefaultSession } from "next-auth";
import { PlanRole, UserRole } from "../generated/prisma/enums";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			plan: PlanRole;
			role: UserRole;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		plan: PlanRole;
		role: UserRole;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		plan: PlanRole;
		role: UserRole;
	}
}
