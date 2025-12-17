import { Users, BarChart, Calendar } from 'lucide-react';
import styles from './Features.module.css';

export default function ProveedoresFeatures() {
  const features = [
    {
      icon: <Users size={32} />,
      title: "Clientes Ideales",
      description: "Recibe solicitudes de parejas que buscan específicamente tu estilo y presupuesto."
    },
    {
      icon: <BarChart size={32} />,
      title: "Dashboard de Gestión",
      description: "Administra tus leads, propuestas y estadísticas desde un panel intuitivo."
    },
    {
      icon: <Calendar size={32} />,
      title: "Calendario Inteligente",
      description: "Sincroniza tu disponibilidad y evita conflictos de agenda automáticamente."
    }
  ];

  return (
    <section className={styles.section} id="benefits">
      <div className={styles.container}>
        <div className={styles.header}>
            <h2 className={styles.title}>Herramientas para el éxito</h2>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrapper}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}










