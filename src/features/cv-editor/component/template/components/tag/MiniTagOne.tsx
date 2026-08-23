import { MiniBar, MiniTitle } from "../common-compo/mini/mini";

export const MiniTagOne = () => {
	return (
		<div className="w-full flex flex-col gap-1">
			<MiniTitle>Tags</MiniTitle>
			<div className="w-full grid grid-cols-2 gap-1">
				{[0, 1].map((i) => (
					<div key={i} className="w-full flex flex-col gap-1">
						<p className="text-xs text-gray-500 text-left">Groupe tag 1</p>
						<div className="w-full flex gap-1">
							<MiniBar widthClass="w-1/4" />
							<MiniBar widthClass="w-1/6" />
							<MiniBar widthClass="w-1/5" />
							<MiniBar widthClass="w-1/4" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
