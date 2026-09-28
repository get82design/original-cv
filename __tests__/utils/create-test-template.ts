import { prismaTest } from "../../lib/prismaTest";
import { slugifyTemplateName } from "../../src/services/cv/templateSlug";

export async function createTestTemplate(namePrefix = "Template") {
	const name = `${namePrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
	return prismaTest.cVTemplate.create({
		data: {
			name,
			slug: slugifyTemplateName(name),
			structure: { sections: ["header", "skills"] },
			defaultStyles: { fontSize: 12, color: "black" },
		},
	});
}
