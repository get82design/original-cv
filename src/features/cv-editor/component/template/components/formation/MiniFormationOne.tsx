import { Skeleton } from "primereact/skeleton";
import { MiniBar, MiniTitle } from "../common-compo/mini/mini";

export const MiniFormationOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Formation</MiniTitle>
			<div className="w-full grid grid-cols-2 gap-1">
				{[0, 1].map((i) => (
					<div key={i} className="w-full flex flex-col gap-1">
						<MiniBar widthClass="w-3/4" />
						<Skeleton
							className="dark:bg-gray-700"
							width="100%"
							height="1rem"
						></Skeleton>
					</div>
				))}
			</div>
		</div>
	);
};
