import { Dialog, type DialogProps } from "primereact/dialog";
import type { ProfileComplete } from "../../form/FormCv";
import { useState } from "react";
import { SelectButton } from "primereact/selectbutton";
import { Message } from "primereact/message";
import { MdInfo } from "react-icons/md";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { useModelAndColorContext } from "../../context/ModelAndColorContext";
import { mapProfileToCvDatas } from "../../form/mapProfileToCvDatas";

interface DialogDataFromProfileProps extends DialogProps {
    profile: ProfileComplete;
}

export const DialogDataFromProfile = ({visible, onHide, profile}: DialogDataFromProfileProps) => {
    const { reset, getValues } = useFormContext();
    const { modeles } = useModelAndColorContext();

    const [selectedOption, setSelectedOption] = useState<string>("no");
    const options = [
        { label: "Oui", value: "yes" },
        { label: "Non", value: "no" },
    ];

    const onValide = () => {
        if (selectedOption === "yes") {
            const current = getValues();
            const model = modeles.find((m) => m.id === current.templateId);
            if (!model) {
              onHide();
              return;
            }
            const fromProfile = mapProfileToCvDatas(profile, model);
            reset({
              ...current, // garde layoutGeneral, modules, templateId
              photo: profile.photo ?? current.photo,
              // title: optionnel — garder le titre CV actuel ou le recalculer
              datas: {
                ...current.datas,
                ...fromProfile, // chaque section profil écrase celle du CV
              },
            });
        }
        onHide();
    }

    const footer = () => {
        return (
            <div className="flex justify-end gap-2">
                <Button label="Annuler" outlined onClick={onHide} className="text-gray-600 hover:bg-gray-200" />
                <Button label="Valider" onClick={onValide} />
            </div>
        );
    };
    return (
        <Dialog 
            visible={visible} 
            onHide={onHide} 
            header="Données du profil"
            style={{ width: "900px", maxWidth: "85vw" }}
			className="bg-white dark:bg-gray-900"
			footer={footer}
        >
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-center items-center gap-4">
                    <p>Souhaitez vous remplacer le contenu de votre CV par les infos stockées sur votre tableau de bord ?</p>
                    <SelectButton value={selectedOption} onChange={(e) => setSelectedOption(e.value)} options={options} allowEmpty={false} />
                </div>
                <Message 
                    severity="info" 
                    text="Info Message" 
                    content={
                        <div className="w-full flex gap-2">
                            <MdInfo className="text-sky-600 size-8" /> 
                            {selectedOption === "yes" 
                                ? <div className="flex flex-col gap-2">
                                    <p>Les informations de votre tableau de bord seront utilisées pour remplir votre CV. Elles viendront écraser les données actuelles de votre CV.</p> 
                                    <p>Si une section n'est pas présente sur le modèle par défaut, vous la retrouverez dans l'onglet "Sections" avec les données que vous avez enregistré dans votre tableau de bord.</p>
                                </div>
                                : <div className="flex flex-col gap-2"> 
                                    <p>Les informations de votre tableau de bord ne seront pas utilisées pour remplir votre CV.</p>
                                    <p>Vous pouvez toujours, si vous le souhaitez, récupérer les données d'une section depuis votre tableau de bord en cliquant sur le bouton "Récupérer les données" présent dans chaque section.</p>
                                </div>
                            }
                        </div>
                    }
                    className="w-full border-b-0 border-t-0 border-r-0 border-l-8 border-sky-600 bg-sky-100 p-2 rounded-md text-sky-600" 
                />
            </div>
        </Dialog>
    );
};