import type { ComponentType } from "react";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { HeaderFive } from "../../components/headers/HeaderFive";
import { HeaderFour } from "../../components/headers/HeaderFour";
import { HeaderOne } from "../../components/headers/HeaderOne";
import {
	HeaderSplitOneMain,
	HeaderSplitOneSidebar,
} from "../../components/headers/HeaderSplitOne";
import { HeaderThree } from "../../components/headers/HeaderThree";
import { HeaderTwo } from "../../components/headers/HeaderTwo";

/** Header monobloc (`top` / `sidebar`) — HeaderOne…Five (et futurs HeaderTop* / HeaderSidebar*). */
export type HeaderMonoEntry = {
	kind: "mono";
	Component: ComponentType;
};

/** Header réparti sur 2 colonnes (`split`) — HeaderSplitOne, HeaderSplitTwo… */
export type HeaderSplitEntry = {
	kind: "split";
	Sidebar: ComponentType;
	Main: ComponentType;
};

export type HeaderEntry = HeaderMonoEntry | HeaderSplitEntry;

const DefaultMono: HeaderMonoEntry = { kind: "mono", Component: HeaderOne };

const DefaultSplit: HeaderSplitEntry = {
	kind: "split",
	Sidebar: HeaderSplitOneSidebar,
	Main: HeaderSplitOneMain,
};

export const HeaderRegister: Record<string, HeaderEntry> = {
	HeaderOne: { kind: "mono", Component: HeaderOne },
	HeaderTwo: { kind: "mono", Component: HeaderTwo },
	HeaderThree: { kind: "mono", Component: HeaderThree },
	HeaderFour: { kind: "mono", Component: HeaderFour },
	HeaderFive: { kind: "mono", Component: HeaderFive },
	HeaderSplitOne: DefaultSplit,
};

/** Résout une entrée registre (fallback mono = HeaderOne). */
export function resolveHeaderEntry(sectionHeader: string | undefined | null): HeaderEntry {
	if (!sectionHeader) return DefaultMono;
	return HeaderRegister[sectionHeader] ?? DefaultMono;
}

/** Entrée split pour `headerPlacement: "split"` (fallback HeaderSplitOne). */
export function resolveSplitHeaderEntry(sectionHeader: string | undefined | null): HeaderSplitEntry {
	const entry = resolveHeaderEntry(sectionHeader);
	if (entry.kind === "split") return entry;
	return DefaultSplit;
}

/** Entrée mono pour `top` / `sidebar` / 1 col (fallback HeaderOne). */
export function resolveMonoHeaderEntry(sectionHeader: string | undefined | null): HeaderMonoEntry {
	const entry = resolveHeaderEntry(sectionHeader);
	if (entry.kind === "mono") return entry;
	return DefaultMono;
}

export function HeaderRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const headerKey = templateConfig?.components?.sectionHeader ?? "HeaderOne";
	const { Component } = resolveMonoHeaderEntry(headerKey);
	return <Component />;
}
