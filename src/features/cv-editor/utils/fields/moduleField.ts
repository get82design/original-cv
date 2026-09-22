export function moduleField(
	modules: { type: string }[],
	type: string,
	field?: string,
	fieldTwo?: string,
) {
	const index = modules?.findIndex((m) => m.type === type);
	if (index < 0) return undefined;
	return field
		? fieldTwo
			? `modules.${index}.${field}.${fieldTwo}`
			: `modules.${index}.${field}`
		: `modules.${index}`;
}

export function dataFieldContent(baseField: string, index: number, field?: string) {
	return field ? `${baseField}.${index}.${field}` : `${baseField}.${index}`;
}
