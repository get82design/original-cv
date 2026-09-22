//! Pour l'utilisation changer le type pour faire apparaitre la liste de chaque compo withList
//! une liste doit contenir ses éléments du même nom ex: missions => mission

import type { JSX } from "react";

interface ListItem<T> {
	clientKey: string;
	order: number;
	content: T;
}

interface CommonListContainerProps {
	content: ListItem<any>;
	elmList: (content: ListItem<any>, idx: number) => JSX.Element;
	className: string;
}

export const CommonListContainer = ({ content, elmList, className }: CommonListContainerProps) => {
	return (
		<ul className={`pl-4 -mt-0.5 ${className}`}>
			{content.content?.missions?.length > 0 &&
				content.content?.missions.map((item: ListItem<any>, idx: number) => {
					const key = idx;
					return elmList(item.content.content, key);
				})}
		</ul>
	);
};
