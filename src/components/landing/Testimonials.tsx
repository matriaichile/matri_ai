"use client";

import styles from './Testimonials.module.css';
import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    names: "Camila & Roberto",
    date: "Nov 2024",
    text: "Matri.AI entendió exactamente lo que queríamos. Encontraron al fotógrafo perfecto en minutos. ¡Increíble!",
    image: "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    names: "Sofía & Andrés",
    date: "Oct 2024",
    text: "El organizador de presupuesto nos salvó la vida. Pudimos tener la boda que soñábamos sin pasarnos ni un peso.",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    names: "Valentina & Diego",
    date: "Dic 2024",
    text: "La mejor decisión fue contratar a través de la plataforma. Todo seguro, rápido y con proveedores de calidad.",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    names: "Isabella & Gabriel",
    date: "Ene 2025",
    text: "Nos encantó la simplicidad. En un solo lugar teníamos todo lo necesario para organizar nuestro gran día.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
  }
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.h2 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Historias de Amor Real
        </motion.h2>
        
        <div className={styles.carouselWrapper}>
          <div className={styles.carouselTrack}>
            {/* Triple duplication for smoother infinite loop */}
            {[...testimonials, ...testimonials, ...testimonials].map((item, index) => (
              <div key={`${item.id}-${index}`} className={styles.cardWrapper}>
                <div className={styles.card}>
                  <div className={styles.cardFront}>
                    <Image 
                      src={item.image} 
                      alt={item.names} 
                      fill 
                      style={{ objectFit: 'cover' }}
                    />
                    <div className={styles.cardOverlay}>
                      <h3>{item.names}</h3>
                      <span className={styles.date}>{item.date}</span>
                    </div>
                  </div>
                  <div className={styles.cardBack}>
                    <p>"{item.text}"</p>
                    <div className={styles.names}>{item.names}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
