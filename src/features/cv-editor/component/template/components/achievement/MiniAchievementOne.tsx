import { Skeleton } from "primereact/skeleton";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniAchievementOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Réalisation</MiniTitle>
			<Skeleton className="dark:bg-gray-700" width="60%" height="8px"></Skeleton>
			<Skeleton className="dark:bg-gray-700" width="100%" height="2rem"></Skeleton>
		</div>
	);
};
