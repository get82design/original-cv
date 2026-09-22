import { Skeleton } from "primereact/skeleton";
import { MiniBar, MiniTitle } from "../common-compo/mini/mini";

export const MiniPhilosophyOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Ma philosophie</MiniTitle>
			<Skeleton className="dark:bg-gray-700" width="100%" height="16px"></Skeleton>
			<div className="w-full flex justify-end">
				<MiniBar widthClass="w-1/4" />
			</div>
		</div>
	);
};
