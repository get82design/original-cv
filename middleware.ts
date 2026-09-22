import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl;
		const token = req.nextauth.token;
		const isAuth = !!token;
		const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

		if (isAuthPage && isAuth) {
			return NextResponse.redirect(new URL("/", req.url));
		}

		if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
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
				return !!token;
			},
		},
	},
);

export const config = {
	matcher: ["/", "/login", "/register", "/cv/:path*", "/modeles", "/admin/:path*"],
};
