import { Button } from "primereact/button";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { DarkModeButton } from "./DarkModeButton"
import { MdAccountCircle, MdDashboard, MdDehaze } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { Sidebar } from "primereact/sidebar";
import { SiteBrandLogo } from "@/components/brand/SiteBrandLogo";

export const AppBar = () => {
    const menu = useRef<Menu>(null)
    const isSm = useMediaQuery('(min-width: 640px)');
    const [visibleTop, setVisibleTop] = useState(false);
    const { data: session, status } = useSession();

    const items: MenuItem[] = [
        {
          label: 'Se déconnecter',
          icon: 'pi pi-sign-out',
          command: () => {
            void signOut({ callbackUrl: "/" })
          }
        },
      ]
    return (
        <>
        <div
            className={'sticky top-0 w-full z-20 bg-white dark:bg-black px-2 sm:px-4 py-2 flex justify-between items-center shadow-md'}
        >
            <div className="flex gap-4 items-center">
                {!isSm && 
                    <Button 
                        text
                        onClick={() => setVisibleTop(!visibleTop)}
                        className='text-black dark:text-white'
                    >
                        <MdDehaze style={{ width: '24px', height: '24px' }} />
                    </Button>
                }
                <Link href="/" className="inline-flex items-center" aria-label="OriginalCV">
                    <SiteBrandLogo className="h-11 w-auto" />
                </Link>
            </div>
            <div className='flex gap-1 items-center'>
                {status === 'authenticated'
                    ? <>
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
                            className='px-1 py-1'
                        >
                            <MdAccountCircle 
                                style={{ width: '28px', height: '28px' }}
                                className='cursor-pointer text-black dark:text-white' 
                            />
                        </Button>
                    </>
                    : <Link href="/login" >Se connecter</Link>
                }
                <DarkModeButton />
            </div>
        </div>
        <Sidebar 
            visible={visibleTop} 
            position="top" 
            onHide={() => setVisibleTop(false)} 
            style={{ height: '50%' }}
            className='bg-white dark:bg-black'
            header={
                <Link href="/" className="inline-flex items-center" aria-label="OriginalCV">
                    <SiteBrandLogo className="h-11 w-auto" />
                </Link>
            }
        >
            <div className='flex flex-col justify-between h-5/6'>
                <div className='flex flex-col gap-2 pt-4'>
                    <Link /*href={`${appUrl}/dashboard`}*/ href='#'>
                        <div className='flex gap-3'>
                            <Button
                                text
                                icon={<MdDashboard style={{ width: '32px', height: '32px' }} />}
                            />
                            <Button text color='light' className='w-full'>
                                Dashboard
                            </Button>
                        </div>
                    </Link>
                    <div className='w-1'></div>
                </div>
            </div>
            <div className='flex gap-3'>
                <Button
                    text
                    icon={<MdAccountCircle style={{ width: '40px', height: '40px' }} />}
                />
                <div>
                    <p className='my-0 text-lg font-semibold'>{session?.user?.name}</p>
                    <p className='my-0'>{session?.user?.email}</p>
                </div>
            </div>
        </Sidebar>
    </>
    )
}
