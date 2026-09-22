import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";
import { Skeleton } from "primereact/skeleton";
import { MdStar } from "react-icons/md";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniSkillOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Skills</MiniTitle>
			{[0, 1].map((i) => (
				<div key={i} className="w-full flex flex-col gap-1">
					<p className="text-xs text-gray-500 text-left">Groupe skill {i + 1}</p>
					<div className="w-full grid grid-cols-3 gap-1">
						{[0, 1, 2].map((j) => (
							<div key={j} className="w-full flex gap-1 items-center">
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
											color: `var(--gray-400)`,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
};
