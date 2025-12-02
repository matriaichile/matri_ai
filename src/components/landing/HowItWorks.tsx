import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Cuéntanos tu Sueño',
      desc: 'Responde nuestro wizard inteligente sobre tus preferencias, estilo y presupuesto.'
    },
    {
      number: '02',
      title: 'Recibe Matches',
      desc: 'Nuestra IA selecciona los 3 mejores proveedores disponibles para tu fecha.'
    },
    {
      number: '03',
      title: 'Conecta y Celebra',
      desc: 'Revisa perfiles, agenda citas y cierra contratos en una plataforma segura.'
    }
  ];

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>¿Cómo Funciona?</h2>
          <p className={styles.subtitle}>Tres simples pasos para la boda perfecta.</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.number}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {index !== steps.length - 1 && <div className={styles.connector} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

