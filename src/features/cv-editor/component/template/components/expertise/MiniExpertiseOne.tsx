import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { MiniTitle } from "../common-compo/mini/mini";
import { MdStar } from "react-icons/md";

export const MiniExpertiseOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Expertises</MiniTitle>
			<div className="w-full grid grid-cols-3 gap-1">
				{[0, 1, 2].map((i) => (
					<div key={i} className="w-full flex gap-1">
						<Skeleton
							className="dark:bg-gray-700"
							width="50%"
							height="8px"
						></Skeleton>
						{[0, 1, 2].map((j) => (
							<MdStar
								key={j}
								style={{
									width: "10px",
									height: "10px",
									color: `var(--${ColorForMiniCard()})`,
								}}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
};
