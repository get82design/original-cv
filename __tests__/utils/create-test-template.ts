import { prismaTest } from "../../lib/prismaTest";

export async function createTestTemplate() {
	return prismaTest.cVTemplate.create({
		data: {
			name: `Template_${Date.now()}`,
			structure: { sections: ["header", "skills"] },
			defaultStyles: { fontSize: 12, color: "black" },
		},
	});
}
