import { Skeleton } from "primereact/skeleton";
import { MiniBar, MiniTitle } from "../common-compo/mini/mini";

export const MiniExperienceOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Experience</MiniTitle>
			<div className="w-full flex justify-between">
				<div className="w-2/3 flex flex-col gap-1">
					<Skeleton
						className="dark:bg-gray-700"
						width="60%"
						height="8px"
					></Skeleton>
					<Skeleton
						className="dark:bg-gray-700"
						width="60%"
						height="8px"
					></Skeleton>
				</div>
				<div className="w-1/4 flex flex-col gap-1">
					<MiniBar widthClass="w-full" />
					<Skeleton
						className="dark:bg-gray-700"
						width="100%"
						height="8px"
					></Skeleton>
				</div>
			</div>
			<Skeleton
				className="dark:bg-gray-700"
				width="100%"
				height="2rem"
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
	);
};
