const fieldMatch: Record<string, string> = {
    nom: 'Nom',
    prenom: 'Prénom',
    'header.settings.subTitle': 'Poste recherché',
    'header.settings.title': 'Nom et prénom',
    'header.settings.content': 'Coordonnées',


    header: 'En-tête',
    summary: 'Présentation',
    experience: 'Expérience',
    diplome: 'Diplôme',
    projet: 'Projet',
    benevolat: 'Bénévolât',
    realisation: 'Réalisation',
    atout: 'Atout',
    publication: 'Publication',
    langue: 'Langue',
    passion: 'Passion',
    social: 'Réseaux sociaux',
    skill: 'Skill',
    competence: 'Compétences',
    philosophie: 'Philosophie',
    title: 'Titre',
    description: 'Description',
    missions: 'Liste de missions',
        'summary.content': 'Description',
    location: 'Lieu',
    company: 'Entreprise',
    periode: 'Période',
    'experience.content.title': 'Intitulé du poste',
    'benevolat.content.title': 'Intitulé du poste',
    'atout.content.title': 'Votre atout',
    'realisation.content.realisation': 'Votre réalisation',
    'passion.content.passion': 'Passion / intérêt',
    'certification.content.organismeCertification': 'Organisme de certification',
    'certification.content.name': 'Nom de la certification',
    groupCompetence: 'Nom du groupe',
    competences: 'Vos compétences',
    icon: 'Icone',
    organisation: 'Organisme',
    year: 'Année',
    ville: 'Ville',
    etablissement: 'Etablissement',
    projetName: 'Nom du projet',
    journalName: 'Nom du journal',
    auteur: 'Auteur / co-auteur',
    url: 'lien vers publication',
    socialNetwork: 'Réseau social',
    username: 'Nom d\'utilisateur',
    groupTitle: 'Nom du groupe',
    skills: 'Outil / technologie',
    citation: 'Citation',
    //   'content.description': 'Description',
    //   'content.missions': 'Liste de missions',
}
  
const changeNameSection = (field: string): string => {
    return fieldMatch[field]
  ? fieldMatch[field]
  : field
}
  
const changeNameSelectInput = (field: string): string => {
    let test: string | undefined = field.replace('datas.', '')
    if (fieldMatch[test]) {
      return fieldMatch[test] ?? ''
    } else {
      test = test.split('.').pop()
      if (test && fieldMatch[test]) {
        return fieldMatch[test] ?? ''
      }
      return field
    }
    //   test = test.split('.').pop();
    //   console.log('test', test, field);
    //   return fieldMatch[test] ? fieldMatch[test] : field;
}
  
export {
   changeNameSection, changeNameSelectInput 
}
  