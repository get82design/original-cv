import type { CvFormValues } from "../../../services/schemas/cvSave.schema";

function line(...parts: Array<string | null | undefined>): string | null {
	const text = parts
		.map((p) => (typeof p === "string" ? p.trim() : ""))
		.filter(Boolean)
		.join(" · ");
	return text || null;
}

function formatDate(value: unknown): string | null {
	if (value == null || value === "") return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === "string") return value.trim() || null;
	return null;
}

function dateRange(start: unknown, end: unknown): string | null {
	const s = formatDate(start);
	const e = formatDate(end);
	if (!s && !e) return null;
	return `${s ?? "?"} → ${e ?? "présent"}`;
}

/**
 * Aplatit le formulaire CV en texte pour la relecture Gemini.
 * Ignore layout / styles — uniquement le contenu éditorial.
 */
export function flattenCvFormToText(cv: CvFormValues): string {
	const blocks: string[] = [];
	const d = cv.datas ?? {};

	if (cv.title?.trim()) {
		blocks.push(`Titre du document : ${cv.title.trim()}`);
	}

	const h = d.header;
	if (h) {
		const identity = [
			line(h.prenom, h.nom),
			h.title?.trim() || null,
			h.subtitle?.trim() || null,
			line(h.email, h.phone, h.location),
			h.portfolio?.trim() || null,
		].filter(Boolean);
		if (identity.length) {
			blocks.push(["## Identité", ...identity].join("\n"));
		}
	}

	const desc = d.description?.content?.description?.trim();
	if (desc) {
		blocks.push(
			`## ${d.description?.title?.trim() || "Description"}\n${desc}`,
		);
	}

	const experiences = d.experience?.content ?? [];
	if (experiences.length) {
		const lines = experiences.map((item, i) => {
			const c = item.content;
			const head = line(c.title, c.company, dateRange(c.start, c.end));
			const missions = (c.missions ?? [])
				.map((m) => `  - ${m.content?.content?.trim() || ""}`)
				.filter((m) => m.trim() !== "-");
			return [
				`${i + 1}. ${head ?? "Expérience"}`,
				c.location?.trim() ? `   Lieu : ${c.location.trim()}` : null,
				c.description?.trim()
					? `   ${c.description.trim()}`
					: null,
				missions.length ? missions.join("\n") : null,
			]
				.filter(Boolean)
				.join("\n");
		});
		blocks.push(
			`## ${d.experience?.title?.trim() || "Expériences"}\n${lines.join("\n")}`,
		);
	}

	const educations = d.education?.content ?? [];
	if (educations.length) {
		const lines = educations.map((item, i) => {
			const c = item.content;
			return `${i + 1}. ${line(c.title, c.degree, c.school, c.city, dateRange(c.start, c.end)) ?? "Formation"}`;
		});
		blocks.push(
			`## ${d.education?.title?.trim() || "Études"}\n${lines.join("\n")}`,
		);
	}

	const formations = d.formation?.content ?? [];
	if (formations.length) {
		const lines = formations.map((item, i) => {
			const c = item.content;
			return `${i + 1}. ${line(c.title, c.organismeFormation, dateRange(c.start, c.end)) ?? "Formation"}`;
		});
		blocks.push(
			`## ${d.formation?.title?.trim() || "Formations"}\n${lines.join("\n")}`,
		);
	}

	const skillGroups = d.skillGroup?.content ?? [];
	if (skillGroups.length) {
		const lines = skillGroups.flatMap((group) => {
			const skills = (group.content.skills ?? [])
				.map((s) => s.content?.name?.trim())
				.filter(Boolean);
			const title = group.content.title?.trim();
			if (!skills.length) return [];
			return [title ? `${title} : ${skills.join(", ")}` : skills.join(", ")];
		});
		if (lines.length) {
			blocks.push(
				`## ${d.skillGroup?.title?.trim() || "Compétences"}\n${lines.join("\n")}`,
			);
		}
	}

	const languages = d.language?.content ?? [];
	if (languages.length) {
		const lines = languages.map((item) => {
			const c = item.content;
			return line(c.name, c.level) ?? c.name;
		});
		blocks.push(
			`## ${d.language?.title?.trim() || "Langues"}\n${lines.join("\n")}`,
		);
	}

	const certifications = d.certification?.content ?? [];
	if (certifications.length) {
		const lines = certifications.map((item, i) => {
			const c = item.content;
			return `${i + 1}. ${line(c.title, c.organismeCertification) ?? "Certification"}`;
		});
		blocks.push(
			`## ${d.certification?.title?.trim() || "Certifications"}\n${lines.join("\n")}`,
		);
	}

	const projects = d.project?.content ?? [];
	if (projects.length) {
		const lines = projects.map((item, i) => {
			const c = item.content;
			return `${i + 1}. ${line(c.title, c.technology, dateRange(c.start, c.end)) ?? "Projet"}${
				c.description?.trim() ? `\n   ${c.description.trim()}` : ""
			}`;
		});
		blocks.push(
			`## ${d.project?.title?.trim() || "Projets"}\n${lines.join("\n")}`,
		);
	}

	const socials = d.socialMedia?.content ?? [];
	if (socials.length) {
		const lines = socials.map((item) => {
			const c = item.content;
			return line(c.socialNetwork, c.username) ?? c.username;
		});
		blocks.push(
			`## ${d.socialMedia?.title?.trim() || "Réseaux"}\n${lines.join("\n")}`,
		);
	}

	return blocks.join("\n\n").trim();
}
