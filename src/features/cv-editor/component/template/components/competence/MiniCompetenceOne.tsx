import { Skeleton } from "primereact/skeleton";
import { MiniTitle } from "../common-compo/mini/mini";

export const MiniCompetenceOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Compétences</MiniTitle>
			<div className="w-full grid grid-cols-2 gap-2">
				{[0, 1].map((i) => (
					<div key={i} className="w-full flex flex-col gap-1">
						<Skeleton
							className="dark:bg-gray-700"
							width="60%"
							height="8px"
						></Skeleton>
						<div className="pl-4 flex flex-col gap-1">
							<Skeleton
								className="dark:bg-gray-700"
								width="100%"
								height="8px"
							></Skeleton>
							<Skeleton
								className="dark:bg-gray-700"
								width="100%"
								height="8px"
							></Skeleton>
							<Skeleton
								className="dark:bg-gray-700"
								width="100%"
								height="8px"
							></Skeleton>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
