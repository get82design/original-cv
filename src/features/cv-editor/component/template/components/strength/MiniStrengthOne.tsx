import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { FaThumbsUp } from "react-icons/fa";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniStrengthOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Atout</MiniTitle>
			<div className="flex gap-1">
				<FaThumbsUp
					style={{
						width: "12px",
						height: "12px",
						color: `var(--${ColorForMiniCard()})`,
					}}
				/>
				<div className="w-full flex flex-col gap-1">
					<Skeleton className="dark:bg-gray-700" width="60%" height="8px"></Skeleton>
					<Skeleton className="dark:bg-gray-700" width="100%" height="2rem"></Skeleton>
				</div>
			</div>
		</div>
	);
};
