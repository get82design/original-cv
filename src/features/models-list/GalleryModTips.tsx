import { useEffect, useState } from "react";

const TIPS = [
	{
		title: "Aperçu à la demande",
		text: "La galerie reste en image pour filtrer vite. L’aperçu interactif se charge à l’ouverture de ce panneau, puis reste affiché jusqu’au prochain filtre.",
	},
	{
		title: "Modifications verrouillées",
		text: "Au-delà de 10 modèles affichés, le panneau se verrouille. Passez par une sélection (max 10) pour modifier confortablement.",
	},
	{
		title: "Boutons reset",
		text: "Chaque ↺ remet l’option au rendu d’origine du modèle, sans toucher aux autres réglages.",
	},
	{
		title: "Comparer mieux",
		text: "Cochez quelques modèles proches, puis « Utiliser la sélection » pour les voir côte à côte avant de choisir.",
	},
] as const;

export const GalleryModTips = () => {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const id = window.setInterval(() => {
			setIndex((i) => (i + 1) % TIPS.length);
		}, 6000);
		return () => window.clearInterval(id);
	}, []);

	const tip = TIPS[index]!;

	return (
		<div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
			<p className="my-0 mb-1 text-[10px] uppercase tracking-wide text-muted-color">Astuce</p>
			<p className="my-0 font-semibold text-sm">{tip.title}</p>
			<p className="my-0 mt-1 text-sm text-muted-color leading-snug">{tip.text}</p>
			<div className="flex items-center gap-3 mt-3">
				<button
					type="button"
					className="text-muted-color hover:text-color text-xs"
					aria-label="Astuce précédente"
					onClick={() => setIndex((i) => (i - 1 + TIPS.length) % TIPS.length)}
				>
					‹
				</button>
				<div className="flex gap-1.5">
					{TIPS.map((t, i) => (
						<button
							key={t.title}
							type="button"
							aria-label={`Astuce ${i + 1}`}
							aria-current={i === index}
							className={`h-1.5 w-1.5 rounded-full transition ${
								i === index ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
							}`}
							onClick={() => setIndex(i)}
						/>
					))}
				</div>
				<button
					type="button"
					className="text-muted-color hover:text-color text-xs"
					aria-label="Astuce suivante"
					onClick={() => setIndex((i) => (i + 1) % TIPS.length)}
				>
					›
				</button>
			</div>
		</div>
	);
};
