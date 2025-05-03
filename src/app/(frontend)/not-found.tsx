'use client'

import { PkmLink } from './components/ui/Links'
import Image from 'next/image'
import styles from './not-found.module.css'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.cloudContainer}>
        <Image
          src="/cloud-1-pixel-art.png"
          alt="Cloud 1"
          width={200}
          height={100}
          className={`${styles.cloud} ${styles.cloud1}`}
        />
        <Image
          src="/cloud-2-pixel-art.png"
          alt="Cloud 2"
          width={180}
          height={90}
          className={`${styles.cloud} ${styles.cloud2}`}
        />
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Image
            src="/pig-pixel-art.png"
            alt="Lost Pig"
            width={200}
            height={200}
            className={styles.pigImage}
            priority
          />
        </motion.div>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          404 - Page Not Found
        </motion.h1>

        <motion.p
          className={styles.message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Oops! Looks like this page got lost in the digital playground.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <PkmLink href="/" className={styles.homeButton}>
            ← Return Home
          </PkmLink>
        </motion.div>
      </motion.div>

      <div className={styles.battleBackground}></div>
    </div>
  )
}
