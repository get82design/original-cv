import { Button } from "primereact/button";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppCard } from "../../components/card/AppCard";
import { TitleAppTwo } from "../../components/title/TitleAppTwo";

export const HomeComponent = () => {
    const breakpoint = useMediaQuery('(min-width: 1024px)');
    const isSm = useMediaQuery('(min-width: 640px)');
    const { data: session, status } = useSession();
    return (
        <div className={'w-full p-4 md:p-8 relative'}>
            <div
                className='w-full'
                style={{ height: 'calc(100vh - 134px)' }}
            >
                <AppCard className='min-h-full flex gap-2'>
                    <div className='w-full xl:w-1/2 lg:pl-8 xl:pl-40 min-h-full flex flex-col justify-center gap-3 sm:gap-6'>
                        <div className='flex flex-col-reverse gap-3 sm:gap-6'>
                            <h1
                                className='font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-6 sm:leading-9 lg:leading-12'
                            >
                                Créer votre CV gratuitement en quelques minutes sur{' '} 
                                <span className='font-light'>Original</span>
                                <span className='text-primary dark:text-primary-dark'>CV</span>
                            </h1>
                            <TitleAppTwo
                                firstPart='Original'
                                secondPart='CV'
                                size='text-4xl' />
                        </div>

                        {breakpoint && 
                            <Link
                                href='/cv/0'
                                className='mt-2'
                            >
                                <Button
                                    label='Créer votre CV gratuitement'
                                    className='bg-primary hover:bg-primary-dark dark:bg-primary-dark hover:dark:bg-primary text-white dark:text-black font-bold'
                                    size={!isSm ? "small" : "large"} />
                            </Link>
                        }
                        {status !== 'authenticated' && 
                            <Link
                                className='text-primary hover:text-primary-dark dark:text-primary-dark hover:dark:text-primary hover:underline'
                                href="/register"
                            >
                                Créer un compte gratuitement
                            </Link>}
                    </div>
                </AppCard>
            </div>
        </div>
    )
}