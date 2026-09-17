import Link from "next/link"
import { Button } from "primereact/button"
import { useRef, useState } from "react";
import { MdAccountCircle, MdDashboard, MdOutlineBadge } from "react-icons/md"
import { useMediaQuery } from "../../../utils/useWindowWidth";
import { SideBarMenu } from "./SideBarMenu";

export const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const refPanelDashboard = useRef<HTMLDivElement>(null)
    const breakpoint = useMediaQuery('(min-width: 1024px)');
    return (
        <div className={'navbar h-screen lg:w-16 xl:w-20 py-4 fixed bg-white dark:bg-black z-30'}>
            <div
                className='flex flex-col items-center justify-between h-full'
                onMouseEnter={() => setVisible(true)}
            >
                <div className='flex flex-col items-center gap-8'>
                    <Link href='#'>
                        <svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'>
                            <g fill='none' fillRule='evenodd'>
                                <path
                                    d='M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z'
                                    fill='#FFF'
                                />
                                <path
                                    d='M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z'
                                    fill='#555AB9'
                                />
                                <path
                                    d='M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z'
                                    fill='#91BAF8'
                                />
                            </g>
                        </svg>
                    </Link>
                    <div className='flex flex-col items-center gap-2'>
                        <Link href={`/profile`} onClick={() => setVisible(false)} style={{ minHeight: '44px'}}>
                            <Button
                                text
                                icon={<MdDashboard style={{ width: '26px', height: '26px' }} />}
                                className='text-primary dark:text-primary-dark'
                            />
                        </Link>
                        <div className='w-1'
                        ></div>
                        {breakpoint &&
                            <Link href={`/cv/0`} onClick={() => setVisible(false)} style={{ minHeight: '44px'}}>
                                <Button
                                    text
                                    icon={
                                        <MdOutlineBadge style={{ width: '26px', height: '26px' }} />
                                    }
                                    className='text-primary dark:text-primary-dark'
                                />
                            </Link>
                        }
                    </div>
                </div>
                <Button
                    text
                    icon={<MdAccountCircle style={{ width: '40px', height: '40px' }} />}
                />
            </div>
            <SideBarMenu
                ref={refPanelDashboard}
                visible={visible}
                setVisible={setVisible}
            />
        </div>
    )
}
