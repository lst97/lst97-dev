import React from "react";
import styles from "./loading-spinner.module.css";

interface LoadingSpinnerProps {
	message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message = "Loading...",
}) => {
	return (
		<div className={styles.container}>
			<div className={styles.pokeball}>
				<div className={styles.pokeballTop} />
				<div className={styles.pokeballCenter}>
					<div className={styles.pokeballDot} />
				</div>
				<div className={styles.pokeballBottom} />
			</div>
			<p className={styles.message}>{message}</p>
		</div>
	);
};
