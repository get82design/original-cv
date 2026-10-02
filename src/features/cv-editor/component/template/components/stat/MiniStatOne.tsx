import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { FaChartBar } from "react-icons/fa";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniStatOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>En nombres</MiniTitle>
			<div className="flex gap-2">
				<div className="w-1/3 flex flex-col gap-1 items-center">
					<Skeleton className="dark:bg-gray-700" width="70%" height="14px" />
					<Skeleton className="dark:bg-gray-700" width="90%" height="6px" />
				</div>
				<div className="w-1/3 flex flex-col gap-1 items-center">
					<FaChartBar
						style={{
							width: "12px",
							height: "12px",
							color: `var(--${ColorForMiniCard()})`,
						}}
					/>
					<Skeleton className="dark:bg-gray-700" width="90%" height="6px" />
				</div>
				<div className="w-1/3 flex flex-col gap-1 items-center">
					<Skeleton className="dark:bg-gray-700" width="70%" height="14px" />
					<Skeleton className="dark:bg-gray-700" width="90%" height="6px" />
				</div>
			</div>
		</div>
	);
};
