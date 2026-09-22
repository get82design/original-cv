import type { RefObject, SyntheticEvent } from "react";
import { MdSettings } from "react-icons/md";

type MenuLike = { toggle: (event: SyntheticEvent) => void };

export const CV_TOOLBAR_ICON_SIZE = 16;

export const cvToolbarIconBtnClass =
	"p-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center justify-center rounded-sm text-gray-700 dark:text-gray-200";

/** Bouton Options (icône) pour les toolbars section / item. */
export function ToolbarOptionsButton({ menuRef }: { menuRef: RefObject<MenuLike | null> }) {
	return (
		<button
			type="button"
			className={cvToolbarIconBtnClass}
			title="Options"
			aria-label="Options"
			onClick={(e) => {
				e.stopPropagation();
				menuRef.current?.toggle(e);
			}}
		>
			<MdSettings size={CV_TOOLBAR_ICON_SIZE} />
		</button>
	);
}
