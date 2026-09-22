import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { forwardRef } from "react";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { SiteBrandLogo } from "@/components/brand/SiteBrandLogo";

interface SidebarMenuProps {
	visible: boolean;
	setVisible: (e: boolean) => void;
}

export const SideBarMenu = forwardRef<HTMLDivElement | null, SidebarMenuProps>(
	({ visible, setVisible }, _ref) => {
		const { data: session } = useSession();
		const breakpoint = useMediaQuery("(min-width: 1024px)");
		return (
			<Sidebar
				visible={visible}
				onHide={() => setVisible(false)}
				className="pl-16 bg-white dark:bg-black"
				onMouseLeave={() => setVisible(false)}
				header={
					<Link href="/" className="inline-flex items-center ml-2 -mt-1" aria-label="OriginalCV">
						<SiteBrandLogo className="h-11 w-auto" />
					</Link>
				}
				showCloseIcon={false}
				pt={{
					header: {
						className: "items-center py-3",
					},
				}}
			>
				<div
					className="flex flex-col justify-between h-full"
					style={{ maxHeight: "calc(100vh - 56px)", paddingTop: "1px" }}
				>
					<div className="flex flex-col gap-4 mt-4">
						<Link href={`/profile`} onClick={() => setVisible(false)}>
							<Button
								text
								color="light"
								className="w-full text-black dark:text-white"
								style={{ minHeight: "44px" }}
							>
								Dashboard
							</Button>
						</Link>
						{/* {session?.user?.role === "ADMIN" && (
                        <Link href={`/admin`} onClick={() => setVisible(false)}>
                            <Button text color='light' className='w-full text-black dark:text-white' style={{ minHeight: '44px'}}>
                                Admin
                            </Button>
                        </Link>
                    )} */}
						{breakpoint && (
							<Link href={`/cv/0`} onClick={() => setVisible(false)}>
								<Button
									text
									color="light"
									className="w-full text-black dark:text-white"
									style={{ minHeight: "44px" }}
								>
									Créer votre CV
								</Button>
							</Link>
						)}
					</div>
					<div>
						<p className="text-lg font-semibold">{session?.user?.name}</p>
						<p>{session?.user?.email}</p>
					</div>
				</div>
			</Sidebar>
		);
	},
);

SideBarMenu.displayName = "SideBarMenu";
