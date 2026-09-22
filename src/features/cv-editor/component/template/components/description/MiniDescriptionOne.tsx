import { Skeleton } from "primereact/skeleton";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniDescriptionOne = () => {
	return (
		<div className="flex flex-col gap-1">
			<MiniTitle>Présentation</MiniTitle>
			<Skeleton className="dark:bg-gray-700" width="100%" height="2rem"></Skeleton>
		</div>
	);
};
