import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { Menu } from "primereact/menu";
import { useRef } from "react";

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
			<button
				type="button"
				className="p-2 cursor-pointer"
				onClick={(e) => {
					e.stopPropagation();
					menuRef.current?.toggle(e);
				}}
			>
				options
			</button>
			<Menu model={items} popup ref={menuRef} style={{ width: 300 }} />
		</>
	);
}