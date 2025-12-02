"use client";

import styles from './FinalCallToAction.module.css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinalCallToAction() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.phrase}>
            "El amor no se mira, se siente, y aún más cuando <br/>
            <span className={styles.highlight}>cada detalle habla de ustedes.</span>"
          </p>

          <div className={styles.actionWrapper}>
            <Link href="/register/user" className={styles.button}>
              Crea tu usuario <ArrowRight size={20} />
            </Link>
            <p className={styles.subtext}>o Empieza esta aventura</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

