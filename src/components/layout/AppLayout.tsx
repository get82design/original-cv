import { useSession } from "next-auth/react";
import { AppBar } from "../appBar/AppBar";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { NavBar } from "../navBar/NavBar";
import { SiteFooter } from "./SiteFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const session = useSession();
	const isXl = useMediaQuery("(min-width: 1440px)");
	const isSm = useMediaQuery("(min-width: 640px)");

	return (
		<div className="flex min-h-screen flex-col">
			<div className="flex w-full flex-1">
				{session.status === "authenticated" && isSm && <NavBar />}
				<div
					className="flex w-full min-w-0 flex-col"
					style={{
						marginLeft:
							session.status === "authenticated" && isXl
								? "80px"
								: session.status === "authenticated" && isSm && !isXl
									? "64px"
									: "0px",
					}}
				>
					<AppBar />
					<div className="flex-1">{children}</div>
					<SiteFooter />
				</div>
			</div>
		</div>
	);
}
