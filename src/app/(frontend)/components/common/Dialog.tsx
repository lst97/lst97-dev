import React, { useEffect } from "react";
import styles from "./dialog.module.css";

interface DialogProps {
	children: React.ReactNode;
	onClose: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ children, onClose }) => {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [onClose]);

	return (
		<div className={styles.dialogOverlay} onClick={onClose}>
			<div
				className={styles.dialogContent}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					className={styles.closeButton}
					onClick={onClose}
					aria-label='Close dialog'
				>
					×
				</button>
				{children}
			</div>
		</div>
	);
};
