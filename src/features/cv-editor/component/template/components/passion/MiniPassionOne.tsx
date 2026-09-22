import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { BsBalloonHeartFill } from "react-icons/bs";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniPassionOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Passions</MiniTitle>
			<div className="w-full grid grid-cols-3 gap-1">
				{[0, 1, 2].map((i) => (
					<div key={i} className="w-full flex gap-1 items-center">
						<BsBalloonHeartFill
							style={{
								width: "12px",
								height: "12px",
								color: `var(--${ColorForMiniCard()})`,
							}}
						/>
						<Skeleton className="dark:bg-gray-700" width="80%" height="8px"></Skeleton>
					</div>
				))}
			</div>
		</div>
	);
};
