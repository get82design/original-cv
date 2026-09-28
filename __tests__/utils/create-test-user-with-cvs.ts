import type { CV, CVTemplate, User } from "../../generated/prisma/client";
import { prismaTest } from "../../lib/prismaTest";

type TestCvInput = {
	title: string;
	templateId: string;
	photo?: string;
};

type TestUserWithCvsOptions = {
	cvs?: TestCvInput[];
};

export async function createTestUserWithCvs(options?: TestUserWithCvsOptions) {
	const user = await prismaTest.user.create({
		data: {
			name: "Test User",
			email: `user-${Date.now()}@test.com`,
			password: "hashed-password",
			...(options?.cvs && {
				cvs: {
					create: await Promise.all(
						options.cvs.map(async (cv, index) => {
							const template = await prismaTest.cVTemplate.create({
								data: {
									name: `${cv.templateId}-${index}-${Date.now()}`,
									slug: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
									structure: { sections: ["header", "skills"] },
									defaultStyles: { fontSize: 12, color: "black" },
									// structure: {
									// 	create: {
									// 		title: "Header",
									// 		order: 0,
									// 	},
									// },
									// defaultStyles: {
									// 	create: {
									// 		fontSize: 16,
									// 		color: "black",
									// 		align: "left",
									// 		show: true,
									// 	},
									// },
								},
							});

							return {
								title: cv.title,
								templateId: template.id,
								photo: cv.photo ?? null,
							};
						}),
					),
				},
			}),
		},
		include: {
			cvs: true,
		},
	});

	return user as User & {
		cvs: (CV & {
			template: CVTemplate;
		})[];
	};
}
