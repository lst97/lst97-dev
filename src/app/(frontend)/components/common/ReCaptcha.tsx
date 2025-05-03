import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./ReCaptcha.module.css";
import { motion, AnimatePresence } from "framer-motion";

declare global {
	interface Window {
		grecaptcha: {
			ready: (callback: () => void) => void;
			execute: (
				siteKey: string,
				options: { action: string }
			) => Promise<string>;
		};
	}
}

interface ReCaptchaProps {
	siteKey: string;
	onVerify: (token: string) => void;
	action?: string;
}

const ReCaptcha: React.FC<ReCaptchaProps> = React.memo(
	({ siteKey, onVerify, action = "submit" }) => {
		const [error, setError] = useState<string | null>(null);
		const [isLoading, setIsLoading] = useState(true);
		const lastTokenRef = useRef<string>("");
		const scriptRef = useRef<HTMLScriptElement | null>(null);

		const executeRecaptcha = useCallback(async () => {
			try {
				const token = await window.grecaptcha.execute(siteKey, {
					action: action,
				});

				// Only call onVerify if the token has changed
				if (token !== lastTokenRef.current) {
					lastTokenRef.current = token;
					onVerify(token);
				}

				return token;
			} catch (err) {
				console.error("Failed to execute reCAPTCHA:", err);
				setError("Failed to verify reCAPTCHA");
				return null;
			}
		}, [siteKey, action, onVerify]);

		useEffect(() => {
			if (!siteKey) {
				setError("reCAPTCHA site key is missing");
				setIsLoading(false);
				return;
			}

			let refreshInterval: NodeJS.Timeout;

			const initializeRecaptcha = () => {
				// Load the reCAPTCHA v3 script
				const script = document.createElement("script");
				script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
				script.async = true;
				script.defer = true;
				scriptRef.current = script;

				script.onerror = () => {
					setError("Failed to load reCAPTCHA");
					setIsLoading(false);
				};

				script.onload = () => {
					window.grecaptcha.ready(async () => {
						try {
							await executeRecaptcha();
							setError(null);
						} catch (err) {
							setError("Failed to initialize reCAPTCHA");
						} finally {
							setIsLoading(false);
						}

						// Set up token refresh interval
						refreshInterval = setInterval(executeRecaptcha, 110000); // Refresh slightly before 2 minutes
					});
				};

				document.body.appendChild(script);
			};

			initializeRecaptcha();

			return () => {
				if (refreshInterval) {
					clearInterval(refreshInterval);
				}
				if (scriptRef.current && document.body.contains(scriptRef.current)) {
					document.body.removeChild(scriptRef.current);
				}
			};
		}, [siteKey, executeRecaptcha]);

		if (error) {
			return <div className={styles.error}>{error}</div>;
		}

		return (
			<>
				<AnimatePresence>
					{isLoading && (
						<motion.div
							key='loading'
							className={styles.loading}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
						>
							<span className={styles.loadingIcon}>♻️</span>🤖 Verifying...
						</motion.div>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{!isLoading && (
						<motion.div
							key='verified'
							className={styles.loading}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
						>
							✅ You&apos;re not a robot (yet)!
						</motion.div>
					)}
				</AnimatePresence>
			</>
		);
	}
);

ReCaptcha.displayName = "ReCaptcha";

export default ReCaptcha;
