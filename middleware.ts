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
				const { pathname } = req.nextUrl;
				const isPublic =
					pathname === "/" ||
					pathname.startsWith("/login") ||
					pathname.startsWith("/register") ||
					pathname.startsWith("/cv/0") ||
					pathname.startsWith("/modeles");
				if (isPublic) return true;
				return !!token; // le reste exige un JWT
			},
		},
	},
);
export const config = {
	matcher: ["/", "/login", "/register", "/cv/:path*", "/modeles"],
};
