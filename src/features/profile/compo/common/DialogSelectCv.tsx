import { Dialog, type DialogProps } from "primereact/dialog";
import type { CV } from "../../CompoPage";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { PreviewImage } from "./PreviewImage";

interface DialogSelectCvProps extends DialogProps {
	cvs: CV[];
	setIdCv: (e: string) => void;
}

export const DialogSelectCv = ({ visible, onHide, cvs, setIdCv }: DialogSelectCvProps) => {
	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			className="dialog-profile-from-cv"
			style={{ minWidth: "800px" }}
			header={
				<TitleAppTwo firstPart={"Sélectionnez un"} secondPart={"CV"} size={"text-2xl"} withSpace />
			}
		>
			<div className="flex flex-col gap-4 mb-6">
				<p className="text-center">
					Sélectionnez le CV à partir duquel vous souhaitez récupérer les données pour cet espace.
				</p>
				<div className="w-full flex gap-4 justify-around">
					{cvs &&
						cvs.length > 0 &&
						cvs.map((cv) => {
							return (
								<PreviewImage
									key={cv.id}
									cv={cv}
									width={"w-1/4"}
									action={
										<button
											type="button"
											className="w-full h-64 cursor-pointer bg-transparent border-0"
											onClick={() => setIdCv(cv.id as string)}
											aria-label={`Sélectionner ${cv.title}`}
										></button>
									}
								/>
							);
						})}
				</div>
			</div>
		</Dialog>
	);
};
