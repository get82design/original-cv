// import { useRef } from "react"
import { useFormContext } from "react-hook-form";
import { useModelAndColorContext } from "../context/ModelAndColorContext";
import { switchTemplate } from "../../utils/applyTemplateToForm";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";

export const SelectTemplate = () => {
	const { watch, reset, getValues } = useFormContext();
	const watchTemplateId = watch("templateId");
	const { modeles } = useModelAndColorContext();
	// const [modelDatas, setModelDatas] = useState([...dataModels])
	// const firstLoad = useRef(true)

	// const init = useCallback(() => {
	//   const temp = [...modelDatas]
	//   const idx = temp.findIndex((data) => data.id === watchCvModel.id)
	//   temp[idx] = watchCvModel
	//   setModelDatas(temp)
	// }, [modelDatas, watchCvModel])

	// useEffect(() => {
	//   if (firstLoad.current === true && watchCvModel) {
	//     firstLoad.current = false
	//     init()
	//   }
	// }, [init, watchCvModel])

	return (
		<div className="w-full grid grid-cols-2 gap-4 px-2 py-2">
			{modeles.map((model, idx) => {
				return (
					<div
						className="w-full h-56 rounded-lg shadow-md relative"
						style={{
							border:
								watchTemplateId === model.id
									? "solid 2px var(--primary-color)"
									: "",
							backgroundImage: `url(/assets/img/${model.name}.png)`,
							backgroundSize: "cover",
							backgroundPosition: "top center",
							backgroundRepeat: "no-repeat",
						}}
						key={idx}
						onClick={() => {
							const next = switchTemplate(getValues() as CvFormValues, model, {
							  updateModules: true,
							});
							reset(next);
						}}
					>
						<div className="absolute bottom-0 left-0 w-full flex flex-col gap-1 items-center p-2 text-center text-sm font-semibold">
							{model.name}
						</div>
					</div>
				);
			})}
		</div>
	);
};
