import { LegalPageShell } from "@/components/legal/LegalPageShell";

export default function MentionsLegalesPage() {
	return (
		<LegalPageShell
			title="Mentions légales"
			description="Informations légales sur l’éditeur et l’hébergement d’OriginalCV."
		>
			<p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
				Preprod — champs éditeur / hébergeur à compléter avant mise en production commerciale
				(SIRET, adresse, contact, hébergeur).
			</p>
			<section className="flex flex-col gap-2">
				<h2>1. Éditeur du site</h2>
				<ul>
					<li>Nom / raison sociale : [À compléter]</li>
					<li>Forme juridique : [À compléter]</li>
					<li>Siège social : [À compléter]</li>
					<li>SIRET / RCS : [À compléter]</li>
					<li>Directeur de la publication : [À compléter]</li>
					<li>Contact : [À compléter — email]</li>
				</ul>
			</section>
			<section className="flex flex-col gap-2">
				<h2>2. Hébergement</h2>
				<ul>
					<li>Hébergeur : [À compléter]</li>
					<li>Adresse : [À compléter]</li>
					<li>Site / contact hébergeur : [À compléter]</li>
				</ul>
			</section>
			<section className="flex flex-col gap-2">
				<h2>3. Propriété intellectuelle</h2>
				<p>
					Les éléments du site OriginalCV (marque, interfaces, templates fournis par le service)
					sont protégés. Le contenu que vous créez (textes de CV) vous appartient ; vous accordez au
					service une licence limitée pour le stocker et l’afficher dans le cadre du service.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>4. Crédits</h2>
				<p>
					Application OriginalCV — aide à la création de CV en ligne. Les modèles et contenus IA
					peuvent s’appuyer sur des prestataires techniques tiers.
				</p>
			</section>
		</LegalPageShell>
	);
}
