export interface ItemGeneralProps {
	id: string;
	order: number;
	content: React.ComponentType;
	column: number; // 0 | 1
}

export interface ListItem<T> {
	clientKey: string;
	/** Zod / Prisma : optionnel + éventuellement `undefined` explicite */
	order?: number | undefined;
	id?: string | undefined;
	content: T;
}

export type WithMissions = {
	missions?: Array<ListItem<{ content: unknown }>> | undefined;
};
