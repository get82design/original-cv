import { Inter, Lora, Playfair_Display, Source_Sans_3 } from "next/font/google";

export const fontInter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const fontPlayfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-playfair",
	display: "swap",
});

export const fontLora = Lora({
	subsets: ["latin"],
	variable: "--font-lora",
	display: "swap",
});

export const fontSourceSans = Source_Sans_3({
	subsets: ["latin"],
	variable: "--font-sourceSans",
	display: "swap",
});
