"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Heart, Sparkles } from "lucide-react";
import styles from "./Hero.module.css";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Asegurar que el video se reproduzca
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Silenciar error si autoplay está bloqueado
      });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section id="hero" className={styles.hero}>
      {/* Video Background */}
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay} />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className={styles.floatingElement1}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className={styles.sparkle} />
      </motion.div>

      <motion.div
        className={styles.floatingElement2}
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Heart className={styles.heart} />
      </motion.div>

      {/* Main Content */}
      <div className={styles.content}>
        <motion.div
          className={styles.contentInner}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top ornament */}
          <motion.div className={styles.ornamentTop} variants={itemVariants}>
            <span className={styles.ornamentSymbol}>✦</span>
            <motion.span
              className={styles.ornamentLine}
              variants={lineVariants}
            />
            <span className={styles.ornamentText}>El amor merece lo mejor</span>
            <motion.span
              className={styles.ornamentLine}
              variants={lineVariants}
            />
            <span className={styles.ornamentSymbol}>✦</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 className={styles.headline} variants={itemVariants}>
            <span className={styles.headlineSmall}>Descubre</span>
            <span className={styles.headlineMain}>
              Tu Boda
              <span className={styles.headlineAccent}> Perfecta</span>
            </span>
          </motion.h1>

          {/* Elegant divider */}
          <motion.div className={styles.divider} variants={itemVariants}>
            <motion.span
              className={styles.dividerLine}
              variants={lineVariants}
            />
            <span className={styles.dividerIcon}>
              <Heart size={16} />
            </span>
            <motion.span
              className={styles.dividerLine}
              variants={lineVariants}
            />
          </motion.div>

          {/* Subheadline */}
          <motion.p className={styles.subheadline} variants={itemVariants}>
            Conectamos parejas con los proveedores perfectos
            <br />
            <span className={styles.subheadlineAccent}>
              mediante matchmaking inteligente con IA
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className={styles.ctaContainer} variants={itemVariants}>
            <motion.a
              href="#register"
              className={styles.ctaPrimary}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.ctaText}>Soy Pareja</span>
              <span className={styles.ctaIcon}>
                <Heart size={14} />
              </span>
            </motion.a>

            <span className={styles.ctaDivider}>ó</span>

            <motion.a
              href="#register-provider"
              className={styles.ctaSecondary}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.ctaText}>Soy Proveedor</span>
              <span className={styles.ctaIcon}>
                <Sparkles size={14} />
              </span>
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div className={styles.stats} variants={itemVariants}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Bodas Realizadas</span>
            </div>
            <span className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>200+</span>
              <span className={styles.statLabel}>Proveedores Elite</span>
            </div>
            <span className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Parejas Felices</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className={styles.scrollText}>Descubre más</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom decorative wave */}
      <div className={styles.waveContainer}>
        <svg
          className={styles.wave}
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="var(--cream)"
          />
        </svg>
      </div>
    </section>
  );
}

