"use client";

import { useState } from 'react';
import styles from './FinalCallToAction.module.css';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import RegisterModal from './RegisterModal';

export default function FinalCallToAction() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
            <button 
              onClick={() => setIsRegisterModalOpen(true)} 
              className={styles.button}
            >
              Empieza esta aventura <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal de registro */}
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
      />
    </section>
  );
}


