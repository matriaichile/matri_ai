import { Star, Clock, ShieldCheck } from 'lucide-react';
import styles from './Features.module.css'; // Reusing or creating new? I'll create NoviosFeatures.module.css

export default function NoviosFeatures() {
  const features = [
    {
      icon: <Star size={32} />,
      title: "Recomendaciones Inteligentes",
      description: "Nuestra IA analiza tus preferencias para sugerirte proveedores que realmente encajan contigo."
    },
    {
      icon: <Clock size={32} />,
      title: "Ahorro de Tiempo",
      description: "Olvídate de buscar en cientos de sitios. Te presentamos las mejores opciones en minutos."
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Proveedores Verificados",
      description: "Trabajamos solo con profesionales validados para asegurar la calidad de tu evento."
    }
  ];

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Por qué elegir Matri.AI</h2>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

