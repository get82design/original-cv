interface TitleAppTwoProps {
	firstPart: string;
	secondPart: string;
	withSpace?: boolean;
	size: string;
	color?: string;
	/** Balise titre — h3 par défaut pour ne pas casser les usages existants. */
	as?: "h2" | "h3";
}

export const TitleAppTwo = ({
	firstPart,
	secondPart,
	withSpace = false,
	size = "text-3xl",
	color = "text-primary dark:text-primary-dark",
	as: Tag = "h3",
}: TitleAppTwoProps) => {
	return (
		<div className="cursor-default">
			<Tag className={`font-light ${size}`}>
				{firstPart}
				{withSpace && " "}
				<span className={`font-bold uppercase ${color}`}>{secondPart}</span>
			</Tag>
		</div>
	);
};
