import { useSession } from "next-auth/react";
import { useMediaQuery } from "@utils/useWindowWidth";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { GeneralColor } from "@/features/cv-editor/component/custom-cv-input/GeneralColor";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { Button } from "primereact/button";
import { ModifSelectInput } from "@/features/cv-editor/component/custom-cv-input/ModifSelectInput";
import { TabPanel, TabView } from "primereact/tabview";
import { ModifMiseEnPage } from "./component/custom-cv-input/ModifMiseEnPAge";
import { SelectTemplate } from "./component/custom-cv-input/SelectTemplate";
import { useFormContext } from "react-hook-form";
import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import { useEffect, useState } from "react";
import { SectionNoUse } from "./component/custom-cv-input/SectionNoUse";
import { OneColumnModel } from "./component/kit-dnd/one-column-model/OneColumnModel";
import { useCreateCvContext } from "./component/context/CreateCvContext";
import type { ItemGeneralProps } from "@utils/type";

export const CvEditor = () => {
    const {data: session, status} = useSession();
    const [itemNoUse, setItemNoUse] = useState<TemplateModule[]>([]);
    const {getValues, setValue} = useFormContext();
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isXl = useMediaQuery('(min-width: 1440px)');
    const modules = getValues('modules') as TemplateModule[];
    const {setSectionSelected, setSelectModifInput} = useCreateCvContext();

    useEffect(() => {
        if (!modules) return
        setItemNoUse(modules?.filter((module) => module.isActive === false));
    }, [modules])

    const addItem = (item: TemplateModule) => {
        const newWatchModules = modules?.map((mod: any) => {
            if (mod.type === item.type) {
                return { ...mod, isActive: true }
            }
            return mod
        })
        setValue('modules', newWatchModules);
    }

    const deleteSection = (item: ItemGeneralProps) => {
        const itemDelete = modules?.find((i) => i.type === item.id.split('-')[1])
        const newWatchModules = modules?.map((mod: any) => {
            if (mod.type === itemDelete?.type) {
                return { ...mod, isActive: false }
            }
            return mod
        })
        setValue('modules', newWatchModules)
        setSectionSelected('')
        setSelectModifInput('')
      }
    return (
        <>
            <div className='my-8 px-8 lg:hidden'>Pour l'instant vous ne pouvez pas créer de CV en mode mobile.</div>
            <div className="hidden w-full lg:flex flex-row-reverse justify-end gap-8 relative">
                {/* <DialogApercu
                    visible={visible}
                    onHide={() => setVisible(false)}
                    cvForViewer={cvForViewer}
                /> */}
                {/* <RefreshCvProvider> */}
                    <div className="w-full">
                        <div className='lg:hidden'></div>
                        <div className={'w-full flex gap-8 my-4'}>
                            <div
                                className="flex flex-col items-center gap-12 relative"
                                style={{ width: isXl ? 'calc(100vw - 580px)' : !isXl && isLg && status === 'authenticated' ? 'calc(100vw - 110px)' : "100vw" }}
                            >

                                <div className="w-full px-4 xl:px-0 flex justify-between items-center">
                                    <TitleAppOne firstPart="Créer" secondPart="votre CV" withSpace />
                                    <div style={{ maxWidth: '300px' }} className='flex flex-col gap-2'>
                                        <GeneralColor />
                                        {/* {!isXl && <PanelModificationMobile noUse={noUse} addSection={addSection} />} */}
                                    </div>
                                </div>
                                {/* //! Modeles bon du coup je pense qu'il y aura des modèles différents en fonction du nombre de colonne  */}
                                <div id="modele-cv-page" className="ml-0 lg:ml-4 xl:ml-0 flex flex-col gap-4">
                                    <OneColumnModel deleteSection={deleteSection} />
                                </div>
                            </div>
                            {isXl 
                                ? <div
                                    id="modele-cv-modif"
                                    style={{
                                        height: 'calc(100vh - 160px)',
                                        maxHeight: 'calc(100vh - 160px)',
                                        width: '420px'
                                    }}
                                    className="fixed right-8 custom-bar flex flex-col gap-4"
                                >
                                    <div
                                        className={`shadow-md rounded-lg bg-white dark:bg-black relative p-0`}
                                    >
                                        <div style={{ height: '245px' }}>
                                            <div className='p-4'>
                                                <TitleAppTwo
                                                    firstPart="Modifier la"
                                                    secondPart="sélection"
                                                    withSpace
                                                    size="text-md"
                                                />
                                                <ModifSelectInput />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ height: 'calc(100vh - 210px - 245px - 58px)', maxHeight: 'calc(100vh - 210px - 245px - 58px)' }} className='overflow-auto rounded-lg shadow-md'>
                                        <div
                                            className={`min-h-full bg-white dark:bg-black p-0 fix-p-tabview-nav-containere`}
                                        >
                                            <TabView className={`rounded-lg`} id="panel-modif-cv">
                                                <TabPanel header="Page" headerClassName='text-sm flex justify-center text-center' contentClassName='py-2'>
                                                    <ModifMiseEnPage />
                                                </TabPanel>
                                                <TabPanel header="Sections" headerClassName='text-sm flex justify-center text-center' contentClassName='py-2'>
                                                    <SectionNoUse itemNoUse={itemNoUse} addItem={addItem} />
                                                </TabPanel>
                                                <TabPanel header="Modèles" headerClassName='text-sm flex justify-center text-center' contentClassName='py-2'>
                                                    <SelectTemplate />
                                                </TabPanel>
                                            </TabView>
                                        </div>
                                    </div>
                                    <Button /*onClick={() => createApercu()}*/ className='flex justify-center bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold'>Télécharger votre CV</Button>
                                </div>
                                : null
                            }
                        </div>
                    </div>
                {/* </RefreshCvProvider> */}
            </div>
        </>
    );
};