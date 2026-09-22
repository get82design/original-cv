import { InputTextarea, type InputTextareaProps } from "primereact/inputtextarea";
import { Controller, useFormContext } from "react-hook-form";

interface TextareaProfileProps extends InputTextareaProps {
	name: string;
	label?: string;
	className?: string;
	fontSize: string;
	weight: number;
	textAlign: "left" | "justify" | "center" | "right";
	pressEnter?: boolean;
	leading?: number;
}

export const TextareaProfile = ({
	name,
	label,
	className,
	fontSize,
	weight,
	textAlign,
	pressEnter = false,
	leading = 1.2,
	...props
}: TextareaProfileProps) => {
	const { control } = useFormContext();
	return (
		<span className={`w-full ${className} flex flex-col gap-0`}>
			<Controller
				name={name}
				control={control}
				render={({ field, fieldState }) => (
					<>
						<InputTextarea
							id={name}
							rows={1}
							className={"w-full text-black dark:text-white"}
							{...field}
							{...props}
							style={{
								resize: "none",
								padding: "0px",
								fontSize: fontSize,
								fontWeight: weight,
								lineHeight: leading,
								textAlign: textAlign,
								backgroundColor: "transparent",
								border: "none",
								boxShadow: "none",
								// color: darkMode
								//     ? 'white'
								//     : 'black',
								height: "auto",
							}}
							// onBlur={
							//     //! forcer la mise a jour
							// }
							onKeyDown={(e) => {
								if (!pressEnter && e.key === "Enter" && !e.shiftKey) {
									// console.log('test', e);
									if (e.preventDefault) e.preventDefault();
									return false;
								}
							}}
							autoResize
						/>
						{fieldState.error && (
							<span className="text-red-500 text-xs -mt-1 mb-1">{fieldState.error.message}</span>
						)}
					</>
				)}
			/>
		</span>
	);
};
