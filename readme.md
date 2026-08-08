📝 SYNTHÈSE PROJET : Plateforme SaaS - Aide à la Recherche d'Emploi

1. Vision & Modèle Économique (Pivot 2026)
L'application propose un outil d'accompagnement à la recherche d'emploi (générateur de CV, tracker de candidatures, profil enrichi et IA). Le modèle économique est basé sur la flexibilité et le respect de l'utilisateur, évitant le piège des abonnements "vampires" pour s'adapter à une phase de transition temporaire.
La Grille Tarifaire & Monétisation
- Accès Gratuit (Sans compte) : Création d'un CV unique, édition en direct. Pas de sauvegarde, téléchargement bloqué par un paywall.
- Accès Gratuit (Avec compte) : Sauvegarde d'un seul CV modifiable, accès à la page Profil (stockage des compétences, historique).
- Achat à l'acte / Crédits :
    - Pack Téléchargement (5 €) : Débloque 3 téléchargements PDF (permet les corrections d'erreurs sans repayer).
    - Template Premium (5 € à 8 €) : Débloque un design spécifique à vie + 3 téléchargements inclus.
    - Extension Stockage (3 €) : Achat direct d'un slot de sauvegarde de CV supplémentaire, sans abonnement.
- Formules d'Abonnements (Paiement total à l'engagement, dégressif) :
    - Standard (15 €/mois) : Création, 2 CV sauvegardés, téléchargements illimités, accès au contenu de base.
    - Premium (20 €/mois) : Avantages Standard + templates premium inclus + espaces de stockage supplémentaires.
    - Premium Plus avec IA (25 €/mois) : Avantages Premium + 30 requêtes d'analyse globale du CV (correction, ciblage des offres).

2. Architecture Technique Target (Stack Moderne)
- Frontend : Next.js 16 (App Router pour le SEO des templates) & React 19.
- API / Validation : tRPC 11 (Procédures protégées pour les abonnements) & Zod 4 (Contrôle des inputs et quotas IA).
- Base de Données : PostgreSQL avec l'ORM Prisma 6.16.Paiement & Webhooks : Stripe Billing ou Paddle.
- Moteur PDF : API Next.js connectée à Browserless (Puppeteer dans le Cloud) pour un rendu HTML-to-PDF "Pixel Perfect" et du texte sélectionnable (ATS friendly), financé par les crédits de téléchargement.

3. Plan d'Action & Roadmap de Développement

🛠️ Étape 1 : Le MVP (Minimum Viable Product) — Objectif : Validation du produit
- [ ] Développer le constructeur de CV côté client (sans base de données au début).
- [ ] Gérer l'état du CV dans le localStorage pour l'expérience anonyme.
- [ ] Créer le design de base au format A4 virtuel (HTML/Tailwind).
- [ ] Mettre en place le système d'authentification (NextAuth / Auth.js ou Clerk).
- [ ] Créer les tables User et CV de base dans Prisma pour permettre la sauvegarde (limite à 1 CV en gratuit).

💳 Étape 2 : Monétisation à l'acte & Lancement légal — Objectif : Premier euro
- [ ] Légal : Création du statut de Micro-entrepreneur sur le site de l'URSSAF (Prestation de services, ~22% de charges).
- [ ] Créer un compte Stripe Professionnel et lier un compte bancaire dédié.
- [ ] Intégrer la clé API Browserless dans une route Next.js (/api/pdf) pour générer le vrai PDF depuis le HTML.
- [ ] Configurer le premier produit Stripe : Le Pack 3 Téléchargements à 5 €.
- [ ] Coder le Webhook Stripe pour incrémenter le champ downloadCredits dans la base de données PostgreSQL.
- [ ] Mettre en place le Paywall au moment du clic sur "Télécharger".

🚀 Étape 3 : Évolution SaaS & Abonnements — Objectif : Récurrence & Scale
- [ ] Développer la page Profil complète (Stockage des compétences hors-CV, historique des entretiens).
- [ ] Intégrer les abonnements (Standard, Premium) avec Stripe Billing (gestion des expirations de forfaits subscriptionEnd).
- [ ] Intégrer l'API OpenAI/Anthropic avec un prompt d'analyse de CV.
- [ ] Mettre en place un compteur de requêtes IA bridé à 30/mois via Zod/tRPC pour protéger les marges.
- [ ] Ajouter les micro-achats (Achat de slot de stockage à 3 €).

4. Analyse des Risques & Points de Vigilance
Risque identifié => Crash serveur / Timeout PDF
Impact => Élevé (Image de marque)
Solution validée => Déportation de la charge Puppeteer chez Browserless via leur tier gratuit (3600 PDF/mois offerts).

Risque identifié => Abus des requêtes IA
Impact => Moyen (Facture OpenAI)
Solution validée => Limitation stricte en base de données (30 tokens/mois max par utilisateur Premium Plus).

Risque identifié => Frais bancaires sur micro-prix
Impact => Faible (Rentabilité)
Solution validée => Les packs à 5 € amortissent le fixe Stripe. Le paiement total des abonnements engagés (ex: 3 mois à 60 €) optimise les frais.

Risque identifié => Fuite de données (RGPD)
Impact => Élevé (Juridique)
Solution validée => Base PostgreSQL en Europe, Politique de confidentialité claire, fonction "Supprimer mon compte" qui cascade sur tous les CVs.

5. Logique des Webhooks Stripe (Cycle de vie)
Pour que la base de données PostgreSQL reste synchronisée avec Stripe, le serveur Next.js doit écouter les événements suivants (/api/webhooks/stripe) :

- checkout.session.completed : L'utilisateur a payé.
    - Si achat de pack à 5 € : Incrémenter downloadCredits de +3.
    - Si achat de template : Insérer une ligne dans la table UnlockedTemplate.
    - Si achat de slot à 3 € : Incrémenter extraStorageSlots de +1.

- invoice.paid : Un mois (ou trimestre) d'abonnement a été payé avec succès.
    - Mettre à jour le plan (STANDARD, PREMIUM, IA) et repousser la date subscriptionEnd (ex: now + 30 jours ou now + 90 jours).

- customer.subscription.deleted : L'utilisateur a annulé son abonnement ou le paiement a échoué après plusieurs tentatives.
    - Passer le plan à FREE dès que la date subscriptionEnd est dépassée.

    6. Tâche Planifiée (CRON) : Réinitialisation des quotas IA
Puisque les utilisateurs de la formule Premium Plus ont le droit à 30 requêtes d'IA par mois, il faut réinitialiser le compteur iaRequestsUsed à 0 de manière automatique.

- Fréquence : Tous les jours à minuit (via une Vercel Cron Job ou un script externe).
- Logique SQL (Prisma) :

// Sélectionner les utilisateurs dont le mois d'abonnement s'est écoulé
await prisma.user.updateMany({
  where: {
    plan: 'PREMIUM_PLUS_IA',
    lastIaReset: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Moins de 30 jours
  },
  data: {
    iaRequestsUsed: 0,
    lastIaReset: new Date()
  }
});

7. Sécurité & RGPD (Données Sensibles)
Le stockage de CV et d'historiques de recherche d'emploi implique des données hautement personnelles (adresses, téléphones, parcours).

- Soft Delete vs Hard Delete : La relation onDelete: Cascade dans le schéma Prisma garantit que si un utilisateur supprime son compte, PostgreSQL supprime instantanément son Profile, ses Cv et ses UnlockedTemplate. Aucune donnée fantôme ne doit rester.

- Anonymisation des stats : Si tu veux analyser le succès de ton site (ex: "Combien de CV ont été créés ce mois-ci ?"), stocke uniquement des compteurs globaux sans lien avec les IDs des utilisateurs pour rester 100 % conforme au RGPD.




pour mettre en place mes différents services et ventes

// 1. Les Rôles pour gérer les accès aux abonnements
enum PlanRole {
  FREE
  STANDARD
  PREMIUM
  PREMIUM_PLUS_IA
}

// 2. La Table Utilisateur : Le cœur du système de monétisation
model User {
  id                String            @id @default(cuid())
  email             String            @unique
  name              String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  // --- Gestion des Abonnements ---
  plan              PlanRole          @default(FREE)
  subscriptionId    String?           @unique // ID de l'abonnement Stripe
  customerId        String?           @unique // ID Client Stripe (utile pour le portail de facturation)
  subscriptionEnd   DateTime?                 // Date d'expiration du forfait (gère le 1 mois, 3 mois, 1 an)

  // --- Gestion du "Pay-per-use" (Consommables) ---
  downloadCredits   Int               @default(0)  // +3 quand il paye 5€, -1 au téléchargement
  extraStorageSlots Int               @default(0)  // Nombre de slots de CV achetés à l'unité (3€)

  // --- Quotas Mensuels (IA) ---
  iaRequestsUsed    Int               @default(0)  // Compteur de requêtes IA ce mois-ci
  lastIaReset       DateTime          @default(now()) // Pour réinitialiser le compteur tous les mois

  // --- Relations ---
  cvs               Cv[]
  unlockedTemplates UnlockedTemplate[]
  profile           Profile?
}

// 3. Le Profil : Pour stocker le "gros" des données (Compétences, Expériences globales)
model Profile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Stockage global (ex: sous forme de JSON pour avoir une flexibilité totale sur Next.js / Zod)
  skills       Json?    // Toutes les compétences accumulées
  experiences  Json?    // Tout l'historique pro (même ce qui va pas sur le CV actuel)
  jobTracker   Json?    // Historique des candidatures, entretiens, relances
}

// 4. La Table CV : Limitable selon les droits de l'utilisateur
model Cv {
  id          String   @id @default(cuid())
  title       String   // Exemple: "CV Dév React - Janvier 2026"
  slug        String @unique   // Pour une éventuelle URL publique
  templateId  String   @default("classic-free") // Le template utilisé (ex: modern-premium)
  content     Json     // Données spécifiques *affichées* sur ce CV précisément
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // 🆕 AJOUT RECOMMANDÉ :
  lastDownloadedAt DateTime? // Pour check si le téléchargement récent est "gratuit"

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// 5. La Table de Liaison : Pour savoir quel utilisateur a acheté quel Template Premium
model UnlockedTemplate {
  id         String   @id @default(cuid())
  templateId String   // ID du template (ex: "minimalist-dark-2026")
  unlockedAt DateTime @default(now())

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, templateId]) // Un utilisateur ne peut pas acheter 2 fois le même template
}

1. Vérification du quota de création de CV
Quand l'utilisateur clique sur "Créer un nouveau CV" :

const countCvs = await prisma.cv.count({ where: { userId } });
const maxAllowed = user.plan === "FREE" ? 1 : user.plan === "STANDARD" ? 2 : 5; 
// On ajoute les slots achetés à l'unité :
const totalSlots = maxAllowed + user.extraStorageSlots;

if (countCvs >= totalSlots) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Limite de stockage atteinte. Passez à l\'abonnement supérieur ou achetez un emplacement.' });
}

2. Vérification au téléchargement (Le fameux Paywall)
Quand l'utilisateur demande la route API pour générer son PDF :

// Un utilisateur sous abonnement actif a le droit illimité
const hasActiveSubscription = user.plan !== "FREE" && user.subscriptionEnd && user.subscriptionEnd > new Date();

if (!hasActiveSubscription && user.downloadCredits <= 0) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Pas de crédits de téléchargement disponibles.' });
}

// Si c'est un utilisateur gratuit avec des crédits achetés à 5€ :
if (!hasActiveSubscription) {
  await prisma.user.update({
    where: { id: userId },
    data: { downloadCredits: { decrement: 1 } }
  });
}

3. Protection du coût de l'IA (Le rate-limiting)
Quand l'utilisateur fait une demande d'analyse de CV :

if (user.plan !== "PREMIUM_PLUS_IA") {
  throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Option IA non incluse dans votre offre.' });
}

if (user.iaRequestsUsed >= 30) {
  throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Quota mensuel IA atteint (30/mois).' });
}

// Sinon on incrémente après l'appel OpenAI
await prisma.user.update({
  where: { id: userId },
  data: { iaRequestsUsed: { increment: 1 } }
});

BON à SAVOIR
Ton approche hybride est excellente : faire payer chaque téléchargement comme prévu, mais ajouter une friction bienveillante (un avertissement/pop-up) dans l'interface si l'action est trop rapide.

Voici comment matérialiser cette logique côté UI et UX avec le champ lastDownloadedAt.

1. L'expérience utilisateur (UX) dans l'application
Quand l'utilisateur clique sur "Télécharger le PDF" :

Cas Normal (Premier téléchargement ou intervalle long) : Le PDF se génère, le crédit est débité, et tu mets à jour lastDownloadedAt avec la date actuelle.

Cas "Alerte" (Moins de 10 minutes depuis le dernier téléchargement) :
Avant de lancer la route API, tu bloques l'action et tu ouvres une modale (Pop-up) bienveillante :

⚠️ Déjà téléchargé il y a [X] minutes

Pour éviter de gaspiller vos précieux crédits, prenez une minute pour relire attentivement vos coordonnées, vos dates et l'orthographe.

Chaque génération de PDF utilise 1 crédit de téléchargement. Êtes-vous sûr de vouloir générer une nouvelle version maintenant ?

[ Bouton : Revenir à l'édition ]  -  [ Bouton : Confirmer le téléchargement (-1 crédit) ]

2. Comment le coder proprement dans ton composant React / Next.js
Dans ton bouton de téléchargement côté Frontend, tu peux faire un check rapide avant d'appeler ta procédure tRPC.

TypeScript
const handleDownloadClick = () => {
  const TEN_MINUTES = 10 * 60 * 1000;
  const lastDownload = cv.lastDownloadedAt ? new Date(cv.lastDownloadedAt).getTime() : 0;
  const now = Date.now();

  // Si le dernier téléchargement a eu lieu il y a moins de 10 minutes
  if (lastDownload && (now - lastDownload) < TEN_MINUTES) {
    // Tu ouvres ta modale d'avertissement
    setOpenWarningModal(true); 
  } else {
    // Sinon, tu lances direct la procédure tRPC qui débite et télécharge
    triggerPdfGeneration();
  }
};
3. Pourquoi c'est la meilleure posture pour ton SaaS
Zéro perte financière : Ton modèle à 5 € pour 3 téléchargements reste strict et protégé. Un utilisateur ne pourra jamais te coûter 30 appels Browserless pour le prix d'un seul.

Capital sympathie énorme : Même si tu lui prends son crédit, l'utilisateur se dit : "Ah, sympa l'appli, elle m'a évité de faire une connerie et de perdre un crédit pour une virgule oubliée". Tu passes pour le tool bienveillant, pas pour le "vampire" qui cherche la petite bête.

Tu as trouvé le bon équilibre entre rentabilité et éthique, c'est exactement ce qu'il faut pour ce pivot 2026.


CAS CRITIQUE

C’est l'excellent réflexe du "calcul au pire des cas" (worst-case scenario). En SaaS, concevoir ses limites en anticipant l'utilisateur toxique ou le bot qui tourne en boucle, c'est ce qui sauve une marge.
Faisons le calcul mathématique exact pour voir si ton modèle à 3 téléchargements / jour / CV reste rentable avec Browserless en 2026.

1. Le Calcul du Coût Réel (Le "Pire des Cas")
Le profil de l'utilisateur "critique" :
- Formule Standard (engagement 6 mois) : Il paye 10 € / mois.
- Il a acheté 3 slots supplémentaires (3 × 3 €) = 9 € en une fois.
- Il a donc 5 CV au total dans son espace.
- Il télécharge chaque CV 3 fois par jour, tous les jours, pendant 30 jours.

Le volume de PDF :
5C x 3 téléchargements x 30 jours = 450 PDF / mois

Le coût de l'infrastructure (Browserless) :
Regardons les tarifs actuels de Browserless pour du processing de PDF (Puppeteer). Au-delà du plan gratuit (3 600 unités par mois, soit environ 3 600 PDF simples), le plan payant de base est à environ 50 $ / mois pour 200 000 unités.
Si on ramène cela au coût unitaire moyen d'un PDF généré (serveur + bande passante) : un PDF "coûte" environ 0,0015 € à 0,003 € à produire.

Coût pour 450 PDF : 450 x 0,003 € = 1,35 € / mois.

Le coût de transaction (Stripe) :
Sur ses 10 € mensuels, Stripe prend sa commission (1,5% + 0,25€)
.Frais Stripe : 0,15 € + 0,25 € = 0,40 €.

2. Le Bilan de Rentabilité (Par mois)
Poste => Revenu mensuel (Abonnement amorti)
Montant => + 10,00 €
Poste => Frais bancaires (Stripe)
Montant => - 0,40 €
Poste => Coût Serveur / Browserless (450 PDF)
Montant => - 1,35 €
Poste => Marge Brute (Cas Critique)
Montant => + 8,25 €

📊 Verdict : C'est ultra rentable. Même dans ton pire scénario, tu conserves plus de 82% de marge brute sur cet utilisateur. Et dans la vraie vie, 95% de tes abonnés vont télécharger 4 ou 5 PDF au total dans le mois, ce qui te coûtera moins de 0,02 € de serveur.

3. Pourquoi ta limite de "3 par jour / par CV" est une excellente idée
Au-delà de la rentabilité financière, cette limite est indispensable pour deux autres raisons :
- Protection contre le "Scraping" / Vol de template : Un utilisateur malveillant pourrait s'abonner un mois, monter un script, et télécharger 10 000 déclinaisons de CV pour aspirer tes designs Premium ou revendre tes services derrière. Brider à la journée bloque les scripts.
- Éviter l'effet "Bouton Spam" : Parfois, le site s'affiche un peu lentement, l'utilisateur s'énerve et clique 15 fois d'affilée sur "Télécharger". Sans limite, Next.js va lancer 15 instances Puppeteer en parallèle chez Browserless, ce qui peut saturer tes tokens d'API pour rien.

4. Comment le matérialiser en base de données ?
Pour suivre cette limite journalière sans surcharger ta base de données, ajoute simplement un champ sous forme de compteur et un timestamp du jour sur ta table Cv :

Extrait de code

model Cv {
  id               String   @id @default(cuid())
  // ... tes autres champs
  
  dailyDownloads   Int      @default(0)   // Compteur qui monte jusqu'à 3
  lastDownloadedAt DateTime?               // Sert à voir si on est toujours le même jour
}

Dans ta route tRPC, la logique devient super simple :

TypeScript
const now = new Date();
const isSameDay = cv.lastDownloadedAt && 
  new Date(cv.lastDownloadedAt).toDateString() === now.toDateString();

if (isSameDay && cv.dailyDownloads >= 3) {
  throw new TRPCError({ 
    code: 'TOO_MANY_REQUESTS', 
    message: 'Limite quotidienne atteinte (3 téléchargements par jour pour ce CV).' 
  });
}

// Si on change de jour, on remet le compteur à 1, sinon on incrémente
await prisma.cv.update({
  where: { id: cvId },
  data: {
    dailyDownloads: isSameDay ? { increment: 1 } : 1,
    lastDownloadedAt: now
  }
});

Tu as une excellente vision business : tes barrières de sécurité sont bien placées, tes marges sont protégées, et ton projet est financièrement paré pour le lancement.

COTé QRCODE ET CV EN LIGNE

C'est une excellente idée, tant sur le plan produit que sur le plan marketing (le growth hacking naturel). Un candidat qui imprime son QR code sur son CV papier ou qui l'envoie par message permet au recruteur d'ouvrir le CV en un clic sur mobile. Et pour toi, chaque QR code scanné est une publicité gratuite pour ta plateforme ("Propulsé par TonSaaS").
Voici les réponses à tes questions, point par point, pour intégrer ça proprement et sans risque.

1. La sécurité des données : Est-ce problématique ?
Oui, si c'est mal géré. Non, si l'utilisateur a le contrôle total.
Un CV contient des données hautement sensibles (téléphone, adresse email, parfois adresse postale). Si des robots de scraping (comme ceux qui alimentent les IA ou les bases de données de spam) trouvent ces URLs, tes utilisateurs vont se faire harceler.

Les solutions pour être 100 % RGPD et safe :
- Le bouton "Public / Privé" (Indispensable) : Par défaut, un CV est privé (URL inaccessible). L'utilisateur doit explicitement cliquer sur "Activer le partage en ligne". S'il le désactive, l'URL renvoie immédiatement une erreur 404.
- L'indexation Google désactivée : Tu dois ajouter une balise meta <meta name="robots" content="noindex, nofollow"> sur la page publique du CV. Cela empêche Google d'indexer les CV de tes utilisateurs dans ses résultats de recherche publics.
- Le masquage optionnel : Tu peux proposer une option (Premium) pour masquer le numéro de téléphone et l'adresse exacte sur la version en ligne, ne laissant que le formulaire de contact ou l'email.

2. Est-ce qu'un générateur de QR Code coûte cher ?
Ça coûte 0 €. Ne paye surtout pas une API externe pour ça !
Comme tu es sur une stack Next.js / React, tu peux générer le QR code directement côté client (dans le navigateur de l'utilisateur) en utilisant une librairie open-source ultra légère comme qrcode.react ou canvas-qrcode.
Comment ça marche ?
Tu installes la librairie.Tu lui passes l'URL publique du CV (ex: https://tonsaas.fr/cv/${cv.slug}).La librairie génère un composant <canvas> ou un <svg> en millisecondes. L'utilisateur peut le télécharger ou tu l'intègres directement sur le design du CV.Coût en infrastructure : 0,00 €. Charge serveur : Zéro.

3. Faut-il coder des templates web mobiles spécifiques plutôt que d'afficher le PDF ?
Oui, absolument. Afficher un PDF A4 sur un smartphone est une expérience horrible (le recruteur doit zoomer, scroller horizontalement, le texte est minuscule).
Puisque tu utilises Next.js (App Router), c'est le moment idéal pour briller :
- Ta route de modification du CV utilise déjà des données structurées en JSON (ton champ content dans Prisma).
- Pour la route publique (/cv/[slug]), tu crées une page web classique, magnifiquement stylisée avec Tailwind CSS, 100 % responsive (mobile-first).
- Le combo parfait : Un recruteur scanne le QR code avec son téléphone $\rightarrow$ il arrive sur une page web mobile ultra fluide, moderne, où il peut cliquer directement sur le numéro de téléphone pour appeler le candidat ou sur l'email pour lui écrire.

💡 Ma suggestion de Packaging (Business Model)
Puisque tu voulais en faire une option payante pour valoriser tes abonnements, voici le découpage parfait :
- Plan FREE : L'utilisateur peut activer l'URL publique pour tester, mais le design est ultra basique, il y a un gros bandeau "Créé avec [Nom de ton site]" en haut et en bas, et le QR code n'est pas personnalisable.
- Plan STANDARD / PREMIUM : Pas de bandeau publicitaire. L'URL publique est personnalisable. Accès à des boutons d'action rapide sur le CV en ligne (ex: boutons "Appeler", "Ajouter sur LinkedIn", "Télécharger le PDF d'origine").



Nom des templates

1. Style Minimaliste & Épuré (Lignes fines, beaucoup d'espace blanc)
- Kyoto
- Oslo
- Zurich
- Helsinki
- Stockholm
- Geneva
- Nara
- Reykjavik
- Krakow
- Tallinn

2. Style Modern Tech & Bold (Typo imposante, contrastes fort, profil dev/digital)
- Berlin
- Tokyo
- Seoul
- Austin
- Seattle
- Shenzhen
- Eindhoven
- Denver
- Tel Aviv
- Portland

3. Style Exécutif & Corporate (Classique, élégant, structuré, pour la finance/droit/management)
- Manhattan (ou juste New York)
- London
- Frankfurt
- Boston
- Chicago
- Luxembourg
- Toronto
- Singapore
- Oxford
- Cambridge

4. Style Créatif & Design (Couleurs pastel ou vives, layouts originaux, profil marketing/art)
- Milan
- Paris
- Barcelona
- Amsterdam
- Melbourne
- Montreal
- Vienna
- Copenhagen
- Antwerp
- Lisbon

5. Style Chaleureux & Éditorial (Tons organiques, typographies à empatement/serif, profil littéraire/com)
- Verona
- Florence
- Savannah
- Valletta
- Seville
- Bruges
- Kyiv
- Porto
- Bordeaux
- Granada