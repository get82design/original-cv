import { Button } from "primereact/button";

interface MiniFooterMultiFuncProps {
	lightLabel: string;
	actionLabel: string;
	actionAction: (e: MouseEvent) => void;
	lightAction: (e: MouseEvent) => void;
}

export const MiniFooterMultiFunc = ({
	lightAction,
	lightLabel,
	actionAction,
	actionLabel,
}: MiniFooterMultiFuncProps) => {
	return (
		<div className="w-full flex justify-end gap-2 mt-2">
			<Button
				label={lightLabel}
				size="small"
				outlined
				onClick={(e) => {
					lightAction(e as unknown as MouseEvent);
				}}
			/>
			<Button
				label={actionLabel}
				size="small"
				onClick={(e) => {
					actionAction(e as unknown as MouseEvent);
				}}
			/>
		</div>
	);
};
