import { Button } from "primereact/button";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { DarkModeButton } from "./DarkModeButton";
import { MdAccountCircle, MdDehaze } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Sidebar } from "primereact/sidebar";
import { SiteBrandLogo } from "@/components/brand/SiteBrandLogo";

const navLinkClass =
	"text-black dark:text-white hover:text-primary dark:hover:text-primary-dark font-medium";

export const AppBar = () => {
	const menu = useRef<Menu>(null);
	const isSm = useMediaQuery("(min-width: 640px)");
	const [visibleTop, setVisibleTop] = useState(false);
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const items: MenuItem[] = [
		...(isAdmin
			? [
					{
						label: "Admin",
						icon: "pi pi-chart-bar",
						url: "/admin",
					} satisfies MenuItem,
				]
			: []),
		{
			label: "Se déconnecter",
			icon: "pi pi-sign-out",
			command: () => {
				void signOut({ callbackUrl: "/" });
			},
		},
	];

	const closeMobileNav = () => setVisibleTop(false);

	return (
		<>
			<div className="sticky top-0 w-full z-40 bg-white dark:bg-black px-2 sm:px-4 py-2 flex justify-between items-center shadow-md">
				<div className="flex gap-4 items-center">
					{!isSm && (
						<Button
							text
							onClick={() => setVisibleTop(!visibleTop)}
							className="text-black dark:text-white"
							aria-label="Ouvrir le menu"
						>
							<MdDehaze style={{ width: "24px", height: "24px" }} />
						</Button>
					)}
					<Link
						href="/"
						className="inline-flex items-center"
						aria-label="OriginalCV"
					>
						<SiteBrandLogo className="h-11 w-auto" />
					</Link>
					{isSm && (
						<nav className="flex gap-4 items-center ml-8">
                            {isAdmin ? (
                                <Link href="/admin" className={navLinkClass}>
                                    Admin
                                </Link>
                            ) : null}
							<Link href="/modeles" className={navLinkClass}>
								Modèles
							</Link>
							<Link href="/cv/0" className={navLinkClass}>
								Créer un CV
							</Link>
						</nav>
					)}
				</div>
				<div className="flex gap-1 items-center">
					{status === "authenticated" ? (
						<>
							<Menu
								id="profile-menu_logout"
								model={items}
								popup
								ref={menu}
							/>
							<Button
								text
								id="profile-menu"
								onClick={(event) => menu.current?.toggle(event)}
								className="px-1 py-1"
							>
								<MdAccountCircle
									style={{ width: "28px", height: "28px" }}
									className="cursor-pointer text-black dark:text-white"
								/>
							</Button>
						</>
					) : (
						<Link href="/login">Se connecter</Link>
					)}
					<DarkModeButton />
				</div>
			</div>
			<Sidebar
				visible={visibleTop}
				position="top"
				onHide={closeMobileNav}
				style={{ height: "auto" }}
				className="bg-white dark:bg-black"
				header={
					<Link
						href="/"
						className="inline-flex items-center"
						aria-label="OriginalCV"
						onClick={closeMobileNav}
					>
						<SiteBrandLogo className="h-11 w-auto" />
					</Link>
				}
			>
				<nav className="flex flex-col gap-1 pt-2 pb-4">
					<Link href="/" onClick={closeMobileNav}>
						<Button
							text
							className="w-full justify-start text-black dark:text-white"
							style={{ minHeight: "44px" }}
						>
							Accueil
						</Button>
					</Link>
					<Link href="/modeles" onClick={closeMobileNav}>
						<Button
							text
							className="w-full justify-start text-black dark:text-white"
							style={{ minHeight: "44px" }}
						>
							Modèles
						</Button>
					</Link>
					<Link href="/cv/0" onClick={closeMobileNav}>
						<Button
							text
							className="w-full justify-start text-black dark:text-white"
							style={{ minHeight: "44px" }}
						>
							Créer un CV
						</Button>
					</Link>
					{isAdmin ? (
						<Link href="/admin" onClick={closeMobileNav}>
							<Button
								text
								className="w-full justify-start text-black dark:text-white"
								style={{ minHeight: "44px" }}
							>
								Admin
							</Button>
						</Link>
					) : null}
				</nav>
			</Sidebar>
		</>
	);
};
