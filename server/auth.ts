import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { userService } from "../src/services/user/userService";
import type { PlanRole } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

export const authOptions: NextAuthOptions = {
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
	],

	session: {
		strategy: "jwt",
	},

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.plan = user.plan;
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