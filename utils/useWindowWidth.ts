import { useSyncExternalStore } from "react";

/**
 * Get the window width
 */
// export const useGetWindowWidth = (): number => {
//     const [dimensions, setDimensions] = useState(window.innerWidth);

//     const handleResize = () => {
//         setDimensions(window.innerWidth);
//     };

//     useEffect(() => {
//         if (window) {
//             window.addEventListener('resize', handleResize);
//         }
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     return dimensions;
// };

//! a se servir par la suite mais penser aussi au class tailwind pour les breakpoints
export function useMediaQuery(query: string) {
	return useSyncExternalStore(
		(onStoreChange) => {
			const mql = window.matchMedia(query);
			mql.addEventListener("change", onStoreChange);
			return () => mql.removeEventListener("change", onStoreChange);
		},
		() => window.matchMedia(query).matches, // client
		() => false, // serveur : valeur stable
	);
}

// usage
//   const isXl = useMediaQuery('(min-width: 1440px)');
//   const isSm = useMediaQuery('(min-width: 640px)');
