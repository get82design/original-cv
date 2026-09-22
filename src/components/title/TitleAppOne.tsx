interface TitleAppOneProps {
	firstPart: string;
	secondPart: string;
	withSpace?: boolean;
	classNameSize?: string;
}

export const TitleAppOne = ({
	firstPart,
	secondPart,
	withSpace = false,
	classNameSize = "text-5xl",
}: TitleAppOneProps) => {
	return (
		<div className="cursor-default">
			<h2
				className={`${classNameSize} font-extrabold uppercase text-primary dark:text-primary-dark`}
			>
				{firstPart}
				{withSpace && " "}
				<span className="font-extralight text-zinc-900 dark:text-white">{secondPart}</span>
			</h2>
			<div className="h-1 w-100 bg-primary dark:bg-primary-dark" />
		</div>
	);
};
