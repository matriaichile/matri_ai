"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Sparkles, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Zap
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './landing.module.css';

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'novios' | 'proveedores'>('novios');

  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Scroll effect for Navbar state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. Navbar Entrance (Staggered from top)
      const navItems = navRef.current?.querySelectorAll('.nav-item');
      const logo = navRef.current?.querySelector('.logo-container');
      const cta = navRef.current?.querySelector('.nav-cta');
      
      const tlNav = gsap.timeline();
      if (logo) {
        tlNav.fromTo(logo, 
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      }
      if (navItems && navItems.length > 0) {
        tlNav.fromTo(navItems, 
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" },
          "-=0.6"
        );
      }
      if (cta) {
        tlNav.fromTo(cta,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
          "-=0.4"
        );
      }

      // 2. Hero Animations
      const tlHero = gsap.timeline({ delay: 0.2 });
      
      // Blobs floating
      gsap.to(".hero-blob", {
        y: "40px",
        x: "20px",
        rotation: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random"
        }
      });

      // Text Reveal (Mask effect simulation with opacity/y)
      tlHero.fromTo(".hero-badge",
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
      )
      .fromTo(".hero-title-line",
        { y: 100, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.15, ease: "power4.out" },
        "-=0.3"
      )
      .fromTo(".hero-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(".hero-btn",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "elastic.out(1, 0.75)" },
        "-=0.6"
      );

      // 3. Scroll Animations for Steps
      const stepCards = stepsRef.current?.querySelectorAll('.step-card');
      if (stepCards) {
        gsap.fromTo(stepCards,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 75%",
              end: "bottom center",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // 4. Benefits Section (Side slide in)
      const benefitsContent = benefitsRef.current?.querySelector('.benefits-content');
      const benefitsVisual = benefitsRef.current?.querySelector('.mockup-container');
      
      if (benefitsContent && benefitsVisual) {
        gsap.fromTo(benefitsContent,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: benefitsRef.current,
              start: "top 70%",
            }
          }
        );
        gsap.fromTo(benefitsVisual,
          { x: 50, opacity: 0, scale: 0.9 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.2,
            scrollTrigger: {
              trigger: benefitsRef.current,
              start: "top 70%",
            }
          }
        );
      }

      // 5. CTA Pulse
      if (ctaRef.current) {
         gsap.fromTo(ctaRef.current.children,
            { y: 50, opacity: 0 },
            { 
               y: 0, 
               opacity: 1, 
               stagger: 0.2, 
               duration: 0.8, 
               ease: "power2.out",
               scrollTrigger: {
                  trigger: ctaRef.current,
                  start: "top 80%"
               }
            }
         );
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hover animations for buttons
  const onEnterBtn = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: "power1.out" });
  };
  const onLeaveBtn = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power1.out" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden font-sans" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* --- NAVBAR --- */}
      <nav ref={navRef} className={`${styles.nav} ${isScrolled ? styles.navScrolled : ''}`}>
        <div className={`${styles.container} ${styles.flex} ${styles.justifyBetween} ${styles.itemsCenter}`}>
          
          {/* Logo */}
          <div className={`${styles.logo} logo-container`} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{ cursor: 'pointer' }}>
            <div className={styles.logoIcon}>
              <Sparkles size={20} fill="white" />
            </div>
            <span>
              Matri<span style={{ color: 'var(--color-champagne)' }}>.AI</span>
            </span>
          </div>

          {/* Center Links (Desktop only) */}
          <div className={`${styles.navLinks} flex items-center gap-8`}>
            <button onClick={() => scrollToSection('como-funciona')} className={`${styles.navLink} nav-item`}>¿Cómo funciona?</button>
            <button onClick={() => scrollToSection('beneficios')} className={`${styles.navLink} nav-item`}>Beneficios</button>
            <Link href="/login" className={`${styles.navLink} nav-item`}>Iniciar Sesión</Link>
          </div>

          {/* CTA (Visible on Mobile & Desktop) */}
          <div className={`${styles.navCta} nav-cta`}>
             <Link href="/register/user" className={styles.navBtn} onMouseEnter={onEnterBtn} onMouseLeave={onLeaveBtn}>
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header ref={heroRef} className={styles.hero}>
        {/* Decorative Blobs - Enhanced */}
        <div className={`${styles.heroBlob} ${styles.blob1} hero-blob`} style={{ top: '-10%', right: '-10%', filter: 'blur(90px)' }}></div>
        <div className={`${styles.heroBlob} ${styles.blob2} hero-blob`} style={{ top: '10%', left: '-10%', filter: 'blur(90px)' }}></div>
        <div className={`${styles.heroBlob} ${styles.blob3} hero-blob`} style={{ bottom: '-10%', left: '40%', filter: 'blur(100px)' }}></div>

        <div className={styles.container} style={{ position: 'relative', zIndex: 10 }}>
          <div className={`${styles.heroBadge} hero-badge`}>
            <span className={styles.heroBadgeDot}></span>
            <span className={styles.heroBadgeText}>Inteligencia Artificial para tu Boda</span>
          </div>
          
          <h1 className={`${styles.heroTitle}`}>
            <div className="hero-title-line inline-block">El <span className={styles.gradientText}>Match Perfecto</span></div>
            
            <div className="hero-title-line inline-block">para tu Matrimonio.</div>
          </h1>
          
          <p className={`${styles.heroText} hero-text`}>
            Olvídate de buscar entre miles de opciones. Nuestro algoritmo inteligente conecta novios con los proveedores ideales basándose en estilo, presupuesto y fecha.
          </p>

          <div className={styles.heroButtons}>
            {/* CTA NOVIOS */}
            <Link href="/register/user" className={`${styles.heroBtnPrimary} hero-btn`} onMouseEnter={onEnterBtn} onMouseLeave={onLeaveBtn}>
              <div className={styles.heroBtnPrimaryContent}>
                <Heart size={20} className="animate-pulse" />
                <span>Soy Usuario</span>
              </div>
              <span className={styles.heroBtnSub}>Encuentra proveedores gratis</span>
            </Link>

            {/* CTA PROVEEDORES */}
            <Link href="/register/provider" className={`${styles.heroBtnSecondary} hero-btn`} onMouseEnter={onEnterBtn} onMouseLeave={onLeaveBtn}>
              <div className={styles.heroBtnPrimaryContent}>
                <Users size={20} />
                <span>Soy Proveedor</span>
              </div>
              <span className={styles.heroBtnSub} style={{ color: 'var(--text-secondary)' }}>Consigue leads calificados</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- MOCKUP / HOW IT WORKS --- */}
      <section id="como-funciona" ref={stepsRef} className={styles.stepsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Matchmaking Inteligente</h2>
            <p className={styles.sectionSubtitle}>Nuestro sistema reemplaza los formularios aburridos con un asistente interactivo que entiende exactamente lo que necesitas.</p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={`${styles.stepCard} step-card`}>
              <div className={`${styles.stepIcon} ${styles.iconRose}`}>
                <Sparkles size={28} />
              </div>
              <h3 className={styles.stepTitle}>1. Cuéntanos tu sueño</h3>
              <p className={styles.stepDesc}>
                Responde nuestro Wizard interactivo sobre estilo, fecha y presupuesto. Es rápido, visual y sencillo.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`${styles.stepCard} step-card`}>
              <div className={`${styles.stepIcon} ${styles.iconPurple}`}>
                <Zap size={28} />
              </div>
              <h3 className={styles.stepTitle}>2. La IA hace el trabajo</h3>
              <p className={styles.stepDesc}>
                Analizamos compatibilidad de fechas, precios y estilos para recomendarte solo los 3 mejores proveedores.
              </p>
            </div>

            {/* Step 3 */}
            <div className={`${styles.stepCard} step-card`}>
              <div className={`${styles.stepIcon} ${styles.iconIndigo}`}>
                <CheckCircle2 size={28} />
              </div>
              <h3 className={styles.stepTitle}>3. Conecta y Celebra</h3>
              <p className={styles.stepDesc}>
                Revisa los perfiles, aprueba tus favoritos y chatea directamente. Sin intermediarios molestos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- DUAL BENEFITS SECTION --- */}
      <section id="beneficios" ref={benefitsRef} className={styles.benefitsSection}>
        <div className={styles.container}>
          
          {/* Toggle for content */}
          <div className={styles.tabs}>
            <div className={styles.tabContainer}>
              <button 
                onClick={() => setActiveTab('novios')}
                className={`${styles.tabBtn} ${activeTab === 'novios' ? styles.tabBtnActive : ''}`}
              >
                Para Novios
              </button>
              <button 
                onClick={() => setActiveTab('proveedores')}
                className={`${styles.tabBtn} ${activeTab === 'proveedores' ? styles.tabBtnActiveProvider : ''}`}
              >
                Para Proveedores
              </button>
            </div>
          </div>

          <div className={styles.benefitsGrid}>
            
            {/* Left Content (Dynamic) */}
            <div className="benefits-content">
              {activeTab === 'novios' ? (
                <div className={styles.benefitsContent}>
                  <h2 className="animate-fade-in-up">Planifica sin estrés, <br/> <span className={styles.accentText}>disfruta el proceso.</span></h2>
                  <p className={styles.benefitsDesc}>
                    Matri.AI elimina las interminables cadenas de correos y las planillas de excel complicadas. Te damos control total en un solo Dashboard.
                  </p>
                  
                  <div className={styles.benefitsList}>
                    {[
                      "Recomendaciones 100% personalizadas por IA.",
                      "Gestión de presupuesto automatizada.",
                      "Proveedores verificados y calificados.",
                      "Dashboard visual para seguir tu avance."
                    ].map((item, i) => (
                      <div key={i} className={styles.benefitItem}>
                        <div className={styles.checkIcon}>
                          <CheckCircle2 size={16} />
                        </div>
                        <span className={styles.benefitText}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/register/user" className={styles.ctaBtn} onMouseEnter={onEnterBtn} onMouseLeave={onLeaveBtn}>
                    Crear mi perfil de Novios <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className={styles.benefitsContent}>
                  <h2 className="animate-fade-in-up">Leads de calidad, <br/> <span className={styles.accentTextProvider}>cierre de ventas efectivo.</span></h2>
                  <p className={styles.benefitsDesc}>
                    Deja de perder tiempo cotizando para clientes que no tienen tu presupuesto o fecha disponible. Matri.AI filtra por ti.
                  </p>
                  
                  <div className={styles.benefitsList}>
                    {[
                      "Leads pre-calificados (Fecha y Presupuesto OK).",
                      "Calendario de disponibilidad inteligente.",
                      "Showcase digital moderno de tus servicios.",
                      "Estadísticas de visualización y conversión."
                    ].map((item, i) => (
                      <div key={i} className={styles.benefitItem}>
                        <div className={`${styles.checkIcon} ${styles.checkIconProvider}`}>
                          <CheckCircle2 size={16} />
                        </div>
                        <span className={styles.benefitText}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/register/provider" className={`${styles.ctaBtn} ${styles.ctaBtnProvider}`} onMouseEnter={onEnterBtn} onMouseLeave={onLeaveBtn}>
                    Registrar mi Empresa <ArrowRight size={18} />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Visual (Abstract Dashboard Representation) */}
            <div className={`${styles.mockupContainer} mockup-container`}>
               {/* Background Glow */}
               <div className={styles.mockupGlow} style={{
                 background: activeTab === 'novios' 
                   ? 'radial-gradient(circle, var(--color-champagne-light), transparent 70%)' 
                   : 'radial-gradient(circle, var(--color-sage-light), transparent 70%)'
               }}></div>
               
               {/* Glass Card */}
               <div className={styles.glassCard}>
                 {/* Mock UI Header */}
                 <div className={styles.mockupHeader}>
                    <div className={styles.windowDots}>
                      <div className={`${styles.dot} ${styles.red}`}></div>
                      <div className={`${styles.dot} ${styles.yellow}`}></div>
                      <div className={`${styles.dot} ${styles.green}`}></div>
                    </div>
                    <div className={styles.mockupUrl}>dashboard.matri.ai</div>
                 </div>

                 {/* Mock UI Content - Changes based on tab */}
                 {activeTab === 'novios' ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                       <span>Progreso del evento</span>
                       <span>65%</span>
                     </div>
                     <div style={{ width: '100%', height: '0.5rem', background: 'var(--bg-accent)', borderRadius: '9999px', overflow: 'hidden' }}>
                       <div style={{ background: 'var(--color-champagne)', height: '100%', width: '65%' }}></div>
                     </div>
                     
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                       <div style={{ background: 'var(--bg-accent)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Fotografía</div>
                         <div style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <CheckCircle2 size={14} className="text-green-400" style={{ color: '#4ade80' }}/> Contratado
                         </div>
                       </div>
                       <div style={{ background: 'var(--bg-accent)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                         <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.25rem 0.5rem', background: 'var(--color-champagne)', fontSize: '0.625rem', color: 'white', borderBottomLeftRadius: '0.5rem' }}>3 Matches</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Banquetería</div>
                         <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Pendiente</div>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, background: 'var(--color-sage-light)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--color-sage-light)', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>12</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nuevos Leads</div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-accent)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4.8</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calificación</div>
                        </div>
                     </div>
                     <div style={{ marginTop: '1rem' }}>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solicitudes Recientes</div>
                       <div style={{ background: 'var(--bg-accent)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--color-champagne)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>MJ</div>
                           <div>
                             <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>María & Juan</div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>15 Nov 2024</div>
                           </div>
                         </div>
                       </div>
                       <div style={{ background: 'var(--bg-accent)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--color-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>CP</div>
                           <div>
                             <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Cata & Pedro</div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>02 Ene 2025</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ... (Footer remains same) ... */}
    </div>
  );
}
