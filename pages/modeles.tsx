import { CreateCvProvider } from "@/features/cv-editor/component/context/CreateCvContext";
import { ModelAndColorProvider } from "@/features/cv-editor/component/context/ModelAndColorContext";
import ModelList from "@/features/models-list/ModelList";

export default function Modeles() {
	return (
		<ModelAndColorProvider>
			<CreateCvProvider>
				<ModelList />
			</CreateCvProvider>
		</ModelAndColorProvider>
	);
}
