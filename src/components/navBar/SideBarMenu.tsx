import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "primereact/button"
import { Sidebar } from "primereact/sidebar"
import { forwardRef } from "react"
import { useMediaQuery } from "../../../utils/useWindowWidth"

interface SidebarMenuProps {
    visible: boolean
    setVisible: (e: boolean) => void
}

export const SideBarMenu = forwardRef<HTMLDivElement | null, SidebarMenuProps>(
    ({ visible, setVisible }, ref) => {
        const {data: session} = useSession()
        const breakpoint = useMediaQuery('(min-width: 1024px)');
    return (
        <Sidebar
            visible={visible}
            onHide={() => setVisible(false)}
            className='pl-16 bg-white dark:bg-black'
            onMouseLeave={() => setVisible(false)}
            header={<p className='w-full text-2xl font-bold'>OriginalCV</p>}
            // style={HeaderAppColor()}
            showCloseIcon={false}
        >
            {/* <InputText
            name=''
            className='w-full p-inputtext-sm mt-4 rounded-full'
            placeholder='Rechercher'
            iconLeft={<MdSearch style={{ width: '24px', height: '24px', marginTop: '-2px' }} />}
            /> */}

            <div
                className='flex flex-col justify-between h-full'
                style={{ maxHeight: 'calc(100vh - 56px)', paddingTop: '1px' }}
            >
                <div className='flex flex-col gap-4 mt-4'>
                    <Link /*href={`${appUrl}/dashboard`}*/ href='#' onClick={() => setVisible(false)}>
                        <Button text color='light' className='w-full text-black dark:text-white' style={{ minHeight: '44px'}}>
                            Dashboard
                        </Button>
                    </Link>
                    {breakpoint &&
                        <Link /*href={{ pathname: `${appUrl}/cree-ton-cv`, query: { idCv: 0 } }}*/ href='#' onClick={() => setVisible(false)}>
                            <Button text color='light' className='w-full text-black dark:text-white' style={{ minHeight: '44px'}}>
                                Créer votre CV
                            </Button>
                        </Link>
                    }
                    {/* <Button variant='ghost' color='light'>
                    Notre magasin
                    </Button>
                    <Button variant='ghost' color='light'>
                    Nos outils
                    </Button>
                    <Button variant='ghost' color='light'>
                    Dashbord
                    </Button> */}
                </div>
                <div>
                    <p className='text-lg font-semibold'>
                        {session?.user?.name}
                    </p>
                    <p>{session?.user?.email}</p>
                </div>
            </div>
        </Sidebar>
    )
})