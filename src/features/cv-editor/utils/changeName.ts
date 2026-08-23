// const fieldMatch: Record<string, string> = {
// 	nom: "Nom",
// 	prenom: "Prénom",
// 	"header.settings.subTitle": "Poste recherché",
// 	"header.settings.title": "Nom et prénom",
// 	"header.settings.content": "Coordonnées",
// 	header: "En-tête",
// 	"description.content": "Description",
// 	"section-description": "Présentation",
// 	"description.settings.title": "Titre section",
// 	"section-experience": "Expérience",
// 	"experience.settings.title": "Titre section",

// 	experience: "Expérience",
// 	diplome: "Diplôme",
// 	projet: "Projet",
// 	benevolat: "Bénévolât",
// 	realisation: "Réalisation",
// 	atout: "Atout",
// 	publication: "Publication",
// 	langue: "Langue",
// 	passion: "Passion",
// 	social: "Réseaux sociaux",
// 	skill: "Skill",
// 	competence: "Compétences",
// 	philosophie: "Philosophie",
// 	// title: "Titre",
// 	description: "Description",
// 	missions: "Liste de missions",
// 	location: "Lieu",
// 	company: "Entreprise",
// 	periode: "Période",
// 	"experience.content.title": "Intitulé du poste",
// 	"benevolat.content.title": "Intitulé du poste",
// 	"atout.content.title": "Votre atout",
// 	"realisation.content.realisation": "Votre réalisation",
// 	"passion.content.passion": "Passion / intérêt",
// 	"certification.content.organismeCertification": "Organisme de certification",
// 	"certification.content.name": "Nom de la certification",
// 	groupCompetence: "Nom du groupe",
// 	competences: "Vos compétences",
// 	icon: "Icone",
// 	organisation: "Organisme",
// 	year: "Année",
// 	ville: "Ville",
// 	etablissement: "Etablissement",
// 	projetName: "Nom du projet",
// 	journalName: "Nom du journal",
// 	auteur: "Auteur / co-auteur",
// 	url: "lien vers publication",
// 	socialNetwork: "Réseau social",
// 	username: "Nom d'utilisateur",
// 	groupTitle: "Nom du groupe",
// 	skills: "Outil / technologie",
// 	citation: "Citation",
// 	//   'content.description': 'Description',
// 	//   'content.missions': 'Liste de missions',
// };

const FIELD_OVERRIDES: Record<string, string> = {
	"experience.content.title": "Intitulé du poste",
	"header.content": "Coordonnées",
	"description.content": "Description",
	"expertise.content.title": "Nom",
	"formation.content.title": "Nom de la formation",
	"certification.content.title": "Nom de la certification",
	"prize.content.title": "Nom du prix",
	"publication.content.title": "Nom de la publication",
	"achievement.content.title": "Nom de la réalisation",
	"volunteering.content.title": "Nom du bénévolat",
};

const FIELD_LABELS: Record<string, string> = {
	title: "Titre",
	subTitle: "Poste recherché",
	email: "Email",
	company: "Entreprise",
	periode: "Période",
	groupTitle: "Nom du groupe",
	location: "Lieu",
	organization: "Organisme",
	year: "Année",
	city: "Ville",
	institution: "Etablissement",
	projectName: "Nom du projet",
	journalName: "Nom du journal",
	author: "Auteur / co-auteur",
	url: "Lien vers publication",
	socialNetwork: "Réseau social",
	username: "Nom d'utilisateur",
	skills: "Outil / technologie",
	citation: "Citation",
	description: "Description",
	missions: "Liste de missions",
	icon: "Icone",
	organismeCertification: "Organisme de certification",
	organismeFormation: "Organisme de formation",
	language: "Langue",
	technology: "Technologie",
	ville: "Ville",
	etablissement: "Etablissement",
	diplome: "Diplôme",
	passion: "Passion",
	publication: "Publication",
	achievement: "Réalisation",
	strength: "Atout",
	domaine: "Domaine",
	organisation: "Organisation",
	// … les settings.* une seule fois
};

const SECTION_LABELS: Record<string, string> = {
	header: "En-tête",
	description: "Présentation",
	experience: "Expérience",
	education: "Diplôme",
	skill: "Skills",
	language: "Langues",
	project: "Projets",
	socialMedia: "Réseaux sociaux",
	strength: "Atouts",
	philosophy: "Philosophie",
	formation: "Formations",
	certification: "Certifications",
	prize: "Prix",
	passion: "Passions",
	expertise: "Expertise",
	volunteering: "Bénévolat",
	publication: "Publications",
	achievement: "Réalisations",
	competence: "Compétences",
	tag: "Tags",
};

function tokens(path: string) {
	return path
		.replace(/^datas\./, "")
		.split(".")
		.filter((p) => p !== "settings" && !/^\d+$/.test(p))
		.filter((p, i, arr) => p !== arr[i - 1]);
	// .replace(/^datas\./, "")
	// .split(".")
	// .filter((p) => /*p !== "content" &&*/ p !== "settings" && !/^\d+$/.test(p));
}
function changeNameSelectInput(path: string) {
	const t = tokens(path); // ["experience", "company"]
	const field = t.at(-1);
	// const section = t[0];
	return (
		// FIELD_OVERRIDES[`${section}.${field}`] ??
		FIELD_OVERRIDES[t.join(".")] ?? FIELD_LABELS[field ?? ""] ?? field ?? path
	);
}
function changeNameSection(sectionSelected: string) {
	const type = sectionSelected.replace(/^section-/, "");
	return SECTION_LABELS[type] ?? type;
}

export { changeNameSection, changeNameSelectInput };
