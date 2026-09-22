export interface ItemGeneralProps {
	id: string;
	order: number;
	content: React.ComponentType;
	column: number; // 0 | 1
}

export interface ListItem<T> {
	clientKey: string;
	order: number;
	content: T;
}
