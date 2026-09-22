import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { MdStar } from "react-icons/md";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniLanguageOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Langues</MiniTitle>
			<div className="w-full grid grid-cols-3 gap-1">
				{[0, 1, 2].map((i) => (
					<div key={i} className="w-full flex gap-1 items-center">
						<Skeleton className="dark:bg-gray-700" width="60%" height="8px"></Skeleton>
						<div className="w-full flex gap-0 items-center">
							<MdStar
								style={{
									width: "10px",
									height: "10px",
									color: `var(--${ColorForMiniCard()})`,
								}}
							/>
							<MdStar
								style={{
									width: "10px",
									height: "10px",
									color: `var(--${ColorForMiniCard()})`,
								}}
							/>
							<MdStar
								style={{
									width: "10px",
									height: "10px",
									color: `var(--${ColorForMiniCard()})`,
								}}
							/>
							<MdStar
								style={{
									width: "10px",
									height: "10px",
									color: `var(--${ColorForMiniCard()})`,
								}}
							/>
							<MdStar
								style={{
									width: "10px",
									height: "10px",
									color: `var(--${ColorForMiniCard()})`,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
