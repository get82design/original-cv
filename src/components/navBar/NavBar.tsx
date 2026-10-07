import Link from "next/link";
import { Button } from "primereact/button";
import { useRef, useState } from "react";
import { MdAccountCircle, MdDashboard, MdOutlineBadge } from "react-icons/md";
import { SiteBrandMark } from "@/components/brand/SiteBrandMark";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { SideBarMenu } from "./SideBarMenu";

export const NavBar = () => {
	const [visible, setVisible] = useState(false);
	const refPanelDashboard = useRef<HTMLDivElement>(null);
	const breakpoint = useMediaQuery("(min-width: 1024px)");
	return (
		<div className={"navbar h-screen lg:w-16 xl:w-20 py-4 fixed bg-white dark:bg-black z-30"}>
			<nav
				className="flex flex-col items-center justify-between h-full"
				onMouseEnter={() => setVisible(true)}
			>
				<div className="flex flex-col items-center gap-8">
					<Link href="#" aria-label="Accueil originalCV">
						<SiteBrandMark className="h-8 w-auto" aria-hidden />
					</Link>
					<div className="flex flex-col items-center gap-2">
						<Link href={`/profile`} onClick={() => setVisible(false)} style={{ minHeight: "44px" }}>
							<Button
								text
								icon={<MdDashboard style={{ width: "26px", height: "26px" }} />}
								className="text-primary dark:text-primary-dark"
							/>
						</Link>
						<div className="w-1"></div>
						{breakpoint && (
							<Link href={`/cv/0`} onClick={() => setVisible(false)} style={{ minHeight: "44px" }}>
								<Button
									text
									icon={<MdOutlineBadge style={{ width: "26px", height: "26px" }} />}
									className="text-primary dark:text-primary-dark"
								/>
							</Link>
						)}
					</div>
				</div>
				<Button text icon={<MdAccountCircle style={{ width: "40px", height: "40px" }} />} />
			</nav>
			<SideBarMenu ref={refPanelDashboard} visible={visible} setVisible={setVisible} />
		</div>
	);
};
