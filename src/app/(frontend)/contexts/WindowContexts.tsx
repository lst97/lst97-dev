"use client";

import React, {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

interface WindowSizeContextType {
	windowWidth: number;
}

const WindowSizeContext = createContext<WindowSizeContextType>({
	windowWidth: 0,
});

export const WindowSizeProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [windowWidth, setWindowWidth] = useState(0);

	useEffect(() => {
		// Check if running in the browser (not during SSR)
		if (typeof window !== "undefined") {
			const handleResize = () => setWindowWidth(window.innerWidth);
			handleResize();
			window.addEventListener("resize", handleResize);

			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	return useMemo(
		() => (
			<WindowSizeContext.Provider value={{ windowWidth }}>
				{children}
			</WindowSizeContext.Provider>
		),
		[windowWidth, children]
	);
};

export const useWindowSize = () => useContext(WindowSizeContext);
