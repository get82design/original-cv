//! Pour l'utilisation changer le type pour faire apparaitre la liste de chaque compo withList
//! une liste doit contenir ses éléments du même nom ex: missions => mission

import type { ListItem, WithMissions } from "@utils/type";
import type { JSX } from "react";

interface CommonListContainerProps<T extends WithMissions> {
	content: ListItem<T>;
	elmList: (content: ListItem<{ content: unknown }>, idx: number) => JSX.Element;
	className: string;
}

export const CommonListContainer = <T extends WithMissions>({ content, elmList, className }: CommonListContainerProps<T>) => {
	const missions = content.content?.missions ?? [];
	return (
		<ul className={`pl-4 -mt-0.5 ${className}`}>
			{missions.length > 0 &&
                missions.map((item, idx) => elmList(item, idx))}
		</ul>
	);
};
