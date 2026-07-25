import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl;
		const isAuth = !!req.nextauth.token;
		const isAuthPage =
			pathname.startsWith("/login") || pathname.startsWith("/register");
		if (isAuthPage && isAuth) {
			return NextResponse.redirect(new URL("/", req.url));
		}
		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const isAuthPage =
					req.nextUrl.pathname.startsWith("/login") ||
					req.nextUrl.pathname.startsWith("/register");
				if (isAuthPage) return true; // pages publiques
				return !!token; // le reste exige un JWT
			},
		},
	},
);
export const config = {
	matcher: ["/", "/login", "/register", "/cv/:path*"],
};