
export interface ItemGeneralProps {
    id: string
    order: number
    content: React.ComponentType
}

export interface ListItem<T> {
    clientKey: string;
    order: number;
    content: T;
}