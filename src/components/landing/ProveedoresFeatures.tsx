import { Users, BarChart, Calendar } from 'lucide-react';
import styles from './Features.module.css'; // Reusing styling structure but can customize if needed

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
    <section className={styles.features} id="benefits">
      <div className={styles.container}>
        <h2 className={styles.heading}>Herramientas para el éxito</h2>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon} style={{ color: 'var(--color-secondary)' }}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

