import { describe, expect, it } from "vitest";
import { mapCvToProfileFormValues } from "../../../src/features/profile/mapCvToProfileFormValues";
import type { CvFull } from "../../../utils/trpc.types";

function baseCv(overrides: Record<string, unknown> = {}): NonNullable<CvFull> {
	return {
		id: "cv-1",
		title: "Mon CV",
		photo: null,
		headerCv: {
			id: "h1",
			prenom: "Ada",
			nom: "Lovelace",
			email: "ada@example.com",
			phone: "0600000000",
			location: "Paris",
		},
		description: { id: "d1", description: "Bio CV" },
		philosophy: {
			id: "p1",
			citation: "Inventer le futur",
			author: "Ada",
		},
		experiences: [
			{
				id: "e1",
				order: 0,
				title: "Dev",
				company: "Acme",
				start: new Date("2020-01-01"),
				end: null,
				location: null,
				description: null,
				cvMissions: [{ id: "m1", order: 0, content: "Coder" }],
			},
		],
		strengths: [],
		stats: [],
		projects: [],
		publications: [],
		achievements: [],
		volunteerings: [],
		educations: [],
		skillGroups: [],
		languages: [],
		tagGroups: [],
		competences: [],
		socialMedias: [],
		expertises: [],
		certifications: [],
		formations: [],
		passions: [],
		prizes: [],
		...overrides,
	} as unknown as NonNullable<CvFull>;
}

describe("mapCvToProfileFormValues", () => {
	it("mappe identité, description, philosophie et expériences", () => {
		const mapped = mapCvToProfileFormValues(baseCv());
		expect(mapped.firstName).toBe("Ada");
		expect(mapped.lastName).toBe("Lovelace");
		expect(mapped.email).toBe("ada@example.com");
		expect(mapped.description?.description).toBe("Bio CV");
		expect(mapped.philosophy?.citation).toBe("Inventer le futur");
		expect(mapped.experiences).toHaveLength(1);
		expect(mapped.experiences?.[0]?.content.title).toBe("Dev");
		expect(mapped.experiences?.[0]?.content.missions).toHaveLength(1);
		expect(mapped.experiences?.[0]?.id).toBeUndefined();
	});

	it("laisse description/philosophie à null si vides", () => {
		const mapped = mapCvToProfileFormValues(
			baseCv({
				description: null,
				philosophy: { id: "p1", citation: "  ", author: null },
			}),
		);
		expect(mapped.description).toBeNull();
		expect(mapped.philosophy).toBeNull();
	});

	it("mappe le résultat des projets depuis le CV", () => {
		const mapped = mapCvToProfileFormValues(
			baseCv({
				projects: [
					{
						id: "proj-1",
						order: 1,
						title: "Projet A",
						start: new Date("2024-01-01"),
						end: null,
						location: "Paris",
						technology: "React",
						description: "Contexte",
						result: "Hausse de 15 %",
						cvMissions: [{ id: "pm1", order: 1, content: "Livrer" }],
					},
				],
			}),
		);
		expect(mapped.projects).toHaveLength(1);
		expect(mapped.projects?.[0]?.content.title).toBe("Projet A");
		expect(mapped.projects?.[0]?.content.result).toBe("Hausse de 15 %");
		expect(mapped.projects?.[0]?.content.description).toBe("Contexte");
		expect(mapped.projects?.[0]?.id).toBeUndefined();
	});
});
