import { useRef, useState, useEffect, type JSX } from "react";
import type { CV } from "../../CompoPage";

interface PreviewImageProps {
	cv: CV;
	action?: JSX.Element;
	width: string;
}

export const PreviewImage = ({ cv, action, width }: PreviewImageProps) => {
	const refImage = useRef<HTMLDivElement>(null);
	const [previewHeight, setPreviewHeight] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const width = refImage.current?.offsetWidth as number;
		const height = width * 1.414;
		setPreviewHeight(height);
	}, [refImage.current?.offsetWidth]);

	return (
		<div
			ref={refImage}
			className={`${width} shadow-md group`}
			style={{
				// backgroundImage: `url(${cv?.preview})` as string,
				height: `${previewHeight}px`,
				backgroundSize: "cover",
			}}
		>
			<div
				className="w-full flex flex-col justify-center items-center gap-2 opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				style={{
					height: `${previewHeight}px`,
					backgroundColor: "rgb(0,0,0, 0.3)",
				}}
			>
				{action}
			</div>
		</div>
	);
};
