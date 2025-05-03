import React from "react";
import { motion } from "framer-motion";
import styles from "./Message.module.css";

interface MessageProps {
	type: "success" | "error";
	message: string;
}

const Message: React.FC<MessageProps> = ({ type, message }) => {
	return (
		<motion.div
			className={`${styles.message} ${
				type === "success" ? styles.success : styles.error
			}`}
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3 }}
		>
			{message}
		</motion.div>
	);
};

export default Message;
