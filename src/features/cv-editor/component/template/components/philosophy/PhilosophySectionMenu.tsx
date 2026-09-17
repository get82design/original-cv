import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export const PhilosophySectionMenu = () => {
	const menuRef = useRef<Menu>(null);
	const pathContent = 'datas.philosophy.settings'
	const items = [
		{
			label: "Options",
			items: [
				{
					template: (
						<div className="flex justify-between py-1 px-4 items-center">
                            <p>Auteur</p>
                            <ToggleAfficherCacher name={`${pathContent}.withAuthor`} />
                        </div>
                    ),
                },
            ]
        }
    ]
    return (
		<>
			<ToolbarOptionsButton menuRef={menuRef} />
			<Menu model={items} popup ref={menuRef} style={{ width: 300 }} />
		</>
	);
}