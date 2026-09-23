import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import { Rating, type RatingProps } from "primereact/rating";
import { Controller, useFormContext } from "react-hook-form";
import { MdStar, MdStarOutline } from "react-icons/md";

interface RatingCvRhf extends RatingProps {
	name: string;
	design: "stars" | "dots" | "bars" | "progress";
}

const LEVELS = ["Débutant", "Junior", "Intermédiaire", "Senior", "Expert"] as const;

// number → Level
const toLevel = (n: number | undefined) => (n && n >= 1 && n <= 5 ? LEVELS[n - 1] : "Débutant");

// Level → number (pour les étoiles)
const toStars = (level: string | undefined) => {
	const i = LEVELS.indexOf(level as (typeof LEVELS)[number]);
	return i >= 0 ? i + 1 : 1;
};

export const RatingCvInput = ({ name, design, ...props }: RatingCvRhf) => {
	const { control } = useFormContext();
	const primaryColor = GetPrimaryColor();
	const { setSelectInputForm } = useCreateCvContext();
	return (
		<div className="card flex justify-content-center">
			{design === "stars" && (
				<Controller
					name={name}
					control={control}
					render={({ field }) => (
						<Rating
							className="gap-0"
							cancel={false}
							value={toStars(field.value)}
							onChange={(e) => field.onChange(toLevel(e.value ?? 1))}
							//   {...field}
							onIcon={
								<MdStar
									style={{
										width: "20px",
										height: "20px",
										color: `var(--${primaryColor})`,
									}}
								/>
							}
							onClick={() => setSelectInputForm("")}
							offIcon={<MdStarOutline />}
							{...props}
						/>
					)}
				/>
			)}
			{design === "bars" && (
				<Controller
					name={name}
					control={control}
					render={({ field }) => {
						const value = toStars(field.value);
						return (
							<div className="flex gap-1 items-center">
								{[1, 2, 3, 4, 5].map((n) => (
									<button
										key={n}
										type="button"
										className={`h-2 w-4 rounded-sm`}
										style={{ backgroundColor: n <= value ? `var(--${primaryColor})` : "#d1d5db" }}
										onClick={(e) => {
											e.stopPropagation(); // évite le parent (sélection skill, etc.)
											setSelectInputForm("")
											const next = n === value ? Math.max(1, n - 1) : n;
											field.onChange(toLevel(next));
										}}
									/>
								))}
							</div>
						);
					}}
				/>
			)}
			{design === "dots" && (
				<Controller
					name={name}
					control={control}
					render={({ field }) => {
						const value = toStars(field.value);
						return (
							<div className="flex gap-1 items-center">
								{[1, 2, 3, 4, 5].map((n) => (
									<button
										key={n}
										type="button"
										className={`h-3 w-3 rounded-full`}
										style={{ backgroundColor: n <= value ? `var(--${primaryColor})` : "#d1d5db" }}
										onClick={(e) => {
											e.stopPropagation(); // évite le parent (sélection skill, etc.)
											setSelectInputForm("")
											const next = n === value ? Math.max(1, n - 1) : n;
											field.onChange(toLevel(next));
										}}
									/>
								))}
							</div>
						);
					}}
				/>
			)}
		</div>
	);
};
