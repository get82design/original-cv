import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcrypt";
import { userService } from "../src/services/user/userService";
import type { PlanRole } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},

			async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
            
                const user = await userService.findByEmail(credentials.email);
            
                if (!user) {
                    return null;
                }
            
                if (!user.password) {
                    return null;
                }

                if(!user.isActive) {
                    return null;
                }
            
                const isValidPassword = await compare(
                    credentials.password,
                    user.password,
                );
            
                if (!isValidPassword) {
                    return null;
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                });
            
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    plan: user.plan,
                };
            }
		}),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: { params: { scope: "read:user user:email" } },
          }),
	],

	session: {
		strategy: "jwt",
	},

    callbacks: {
        async jwt({ token, user }) {
            if (user?.id) {
                token.id = user.id;
                const dbUser = await prisma.user.findUnique({
                  where: { id: user.id },
                  select: { plan: true },
                });
                token.plan = dbUser?.plan ?? "FREE";
            }
            return token;
        },
    
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.plan = token.plan as PlanRole;
            }
    
            return session;
        },
    },

	pages: {
		signIn: "/login",
	},
};

export function getServerAuthSession(
	...args:
		| [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
		| [NextApiRequest, NextApiResponse]
) {
	return getServerSession(...args, authOptions);
}