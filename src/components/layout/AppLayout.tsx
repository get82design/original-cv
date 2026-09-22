import { useSession } from "next-auth/react";
import { AppBar } from "../appBar/AppBar";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { NavBar } from "../navBar/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const session = useSession();
	const isXl = useMediaQuery("(min-width: 1440px)");
	const isSm = useMediaQuery("(min-width: 640px)");

	return (
		<div>
			<div className="w-full flex ">
				{session.status === "authenticated" && isSm && <NavBar />}
				<div
					className="w-full"
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
					{children}
				</div>
			</div>
		</div>
	);
}
