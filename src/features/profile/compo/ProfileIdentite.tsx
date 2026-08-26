import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InputTextProfile } from "../input/InputTextProfile";
import { Tooltip } from "primereact/tooltip";
import { SpeedDial } from "primereact/speeddial";

export const ProfileIdentite = () => {
    const {watch} = useFormContext();
    const refProfil = useRef<SpeedDial>(null)
    const [edit, setEdit] = useState(false)
    const [hover, setHover] = useState(false)
    const watchPhoto = watch('photo');
    const watchNom = watch('firstName');
    const watchPrenom = watch('lastName');

    useEffect(() => {
        if (!hover) {
            refProfil.current?.hide()
        }
    }, [hover])

    const items = [
        {
            label: 'Edition rapide',
            icon: 'pi pi-pencil',
            command: () => {
                setEdit(!edit)
            }
        },
        {
            label: 'Mettre à jour',
            icon: 'pi pi-refresh',
            // disabled: nbCv === 0 && true,
            // command: () => {
            //     setVisibleMaj(true)
            // }
        },
        {
            label: 'Plus de données',
            icon: 'pi pi-plus',
            // command: () => {
            //     toast.current.show({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
            // }
        },
    ]
    
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {/* <DialogSelectCv visible={visibleMaj} onHide={() => setVisibleMaj(false)} setIdCv={setIdCv} cvs={cvs} /> */}
            <AppCard className='flex justify-between gap-4 relative group'>
                <div className='opacity-30 absolute top-2 left-3'>
                    <TitleAppTwo firstPart={'Votre'} secondPart={'Profil'} size={'text-2xl'} withSpace />
                </div>
                <div
                    className="w-2/5 px-8 pt-8 pb-4 flex justify-center rounded-md"
                >
                    <div
                        style={{
                            width: '130px',
                            height: '130px',
                            backgroundImage: `url(${watchPhoto && watchPhoto !== ''
                                ? watchPhoto
                                : '/assets/img/User-avatar.svg.png'})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            cursor: 'pointer'
                        }}
                        className={'rounded-full bg-white z-10 mt-2'}
                    />
                </div>
                <div
                    className="w-3/5 text-left flex flex-col gap-6"
                >
                    <div style={{
                        display: edit
                            ? 'none'
                            : 'flex'
                    }}>
                        <TitleAppTwo firstPart={watchPrenom
                            ? watchPrenom
                            : 'Prenom'} secondPart={watchNom
                                ? watchNom
                                : 'Nom'} size={'text-xl'} withSpace />
                    </div>
                    <div className="gap-2" style={{
                        display: edit
                            ? 'flex'
                            : 'none', marginBottom: '-4px', marginTop: '-2px'
                    }}>
                        <InputTextProfile className="w-1/2" placeholder="Prenom" name={'lastName'} fontSize={'24px'} weight={300} textColor={'text-black dark:text-white'} disabled={!edit} />
                        <InputTextProfile className="w-1/2" placeholder="Nom" name={'firstName'} fontSize={'24px'} weight={700} textColor={'text-black dark:text-white'} disabled={!edit} />
                    </div>
                    <div>
                        <InputTextProfile placeholder="Email" name={'email'} fontSize={'16px'} weight={500} textColor={'text-black dark:text-white'} disabled={!edit} />
                        <InputTextProfile placeholder="N° téléphone" name={'phone'} fontSize={'16px'} weight={500} textColor={'text-black dark:text-white'} disabled={!edit} />
                        <InputTextProfile placeholder="Adresse courte" name={'location'} fontSize={'16px'} weight={500} textColor={'text-black dark:text-white'} disabled={!edit} />
                    </div>
                    <Tooltip target=".speeddial-profil .p-speeddial-action" position="left" className='text-sm' />
                    <SpeedDial
                        ref={refProfil}
                        model={items}
                        direction="down"
                        className="speeddial-profil mini-speeddial"
                        style={{ top: 12, right: 8 }}
                        buttonClassName='opacity-0 transition duration-300 ease-in-out group-hover:opacity-100'
                    />
                </div>
            </AppCard>
        </div>
    );
};