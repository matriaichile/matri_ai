import styles from './HowItWorksSteps.module.css';

export default function HowItWorksSteps() {
  const steps = [
    {
      number: "01",
      title: "Cuéntanos tu Sueño",
      description: "Regístrate y completa nuestro wizard inteligente. Dinos qué buscas, tu presupuesto y estilo.",
    },
    {
      number: "02",
      title: "La Magia de la IA",
      description: "Nuestro algoritmo analiza miles de combinaciones para encontrar los proveedores perfectos para ti.",
    },
    {
      number: "03",
      title: "Conecta y Elige",
      description: "Recibe 3 recomendaciones de alta compatibilidad. Revisa sus perfiles, chatea y contrata.",
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cómo funciona MatriMatch</h1>
          <p className={styles.subtitle}>Tu camino hacia el altar, simplificado en tres pasos.</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.number}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

