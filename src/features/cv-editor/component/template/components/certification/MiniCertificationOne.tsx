import { Skeleton } from "primereact/skeleton";
import { MiniBar, MiniTitle } from "../common-compo/mini/mini";

export const MiniCertificationOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Certification</MiniTitle>
			<div className="w-full grid grid-cols-2 gap-1">
				{[0, 1].map((i) => (
					<div key={i} className="w-full flex flex-col gap-1">
						<MiniBar />
						<Skeleton className="dark:bg-gray-700" width="100%" height="1rem" />
					</div>
				))}
			</div>
		</div>
	);
};
