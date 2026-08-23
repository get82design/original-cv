import { SelectRhf } from "@/components/input/select/SelectRhf";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import {
	FONT_CATALOG,
	type FontSlug,
} from "@/features/cv-editor/utils/utilsCv/font";

type FontOption = { name: string; value: FontSlug };

const options: FontOption[] = (Object.keys(FONT_CATALOG) as FontSlug[]).map(
	(value) => ({
		name: FONT_CATALOG[value].label,
		value,
	}),
);

const fontOptionTemplate = (option: FontOption) =>
	option ? (
		<span style={{ fontFamily: `var(${FONT_CATALOG[option.value].cssVar})` }}>
			{option.name}
		</span>
	) : (
		<span>Police</span>
	);

export const GeneralFont = () => {
	return (
		<div className="flex gap-4 items-center">
			<p className="my-0 font-semibold text-xs">Police</p>
			<SelectRhf
				name={FieldNameLayoutGeneral.fontFamily}
				options={options}
				optionLabel="name"
				optionValue="value"
				className="w-full"
				appendTo="self"
				itemTemplate={fontOptionTemplate}
				valueTemplate={fontOptionTemplate}
			/>
		</div>
	);
};
