import { LevelSchema, type Level } from "@/services/schemas/enums";
import { Rating } from "primereact/rating";
import { Controller, useFormContext } from "react-hook-form";
import { MdStar, MdStarOutline } from "react-icons/md";

const LEVELS = LevelSchema.options; // Débutant … Expert

const toLevel = (n: number | undefined): Level =>
	n && n >= 1 && n <= 5 ? (LEVELS[n - 1] as Level) : "Débutant";

const toStars = (level: string | undefined) => {
	const i = LEVELS.indexOf(level as Level);
	return i >= 0 ? i + 1 : 1;
};

export const RatingProfile = ({ name }: { name: string }) => {
	const { control } = useFormContext();
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<Rating
					className="gap-0"
					cancel={false}
					value={toStars(field.value)}
					onChange={(e) => {
						field.onChange(toLevel(e.value ?? 1));
					}}
					onIcon={<MdStar style={{ width: 18, height: 18 }} className="text-primary" />}
					offIcon={<MdStarOutline style={{ width: 18, height: 18 }} />}
				/>
			)}
		/>
	);
};
