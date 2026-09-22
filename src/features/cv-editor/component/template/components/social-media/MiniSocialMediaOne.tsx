import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { FaGlobe } from "react-icons/fa";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniSocialMediaOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Réseaux sociaux</MiniTitle>
			<div className="w-full grid grid-cols-3 gap-1">
				{[0, 1, 2].map((i) => (
					<div key={i} className="w-full flex gap-1 items-center">
						<FaGlobe
							style={{
								width: "12px",
								height: "12px",
								color: `var(--${ColorForMiniCard()})`,
							}}
						/>
						<div className="w-full flex flex-col gap-0.5">
							<Skeleton className="dark:bg-gray-700" width="60%" height="8px"></Skeleton>
							<Skeleton className="dark:bg-gray-700" width="80%" height="8px"></Skeleton>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
