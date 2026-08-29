import type { JSX } from "react";
import type { CV } from "../../CompoPage";

interface PreviewImageProps {
	cv: CV;
	action?: JSX.Element;
	width: string;
}

export const PreviewImage = ({ cv, action, width }: PreviewImageProps) => {
	const name = cv.template?.name ?? "";
	const src = `/assets/img/${name}.png`;

	return (
		<div
			className={`${width} relative shadow-md group overflow-hidden rounded`}
		>
			<img
				src={src}
				alt={cv.title}
				className="w-full aspect-[1/1.414] object-cover object-top bg-gray-100"
				onError={(e) => {
					e.currentTarget.style.visibility = "hidden";
				}}
			/>
			<p className="absolute bottom-0 left-0 right-0 text-center text-sm font-medium truncate px-2 py-1">
				{cv.title}
			</p>
			{action && (
				<div className="absolute inset-0 flex flex-col justify-center items-center gap-2 opacity-0 group-hover:opacity-100 bg-black/30 transition">
					{action}
				</div>
			)}
		</div>
	);
};
