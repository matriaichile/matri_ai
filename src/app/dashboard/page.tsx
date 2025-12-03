'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LogOut, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Heart, 
  Star, 
  Phone, 
  Mail, 
  ExternalLink,
  Check,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuthStore, UserProfile } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { BUDGET_RANGES, GUEST_COUNTS, REGIONS, PRIORITY_CATEGORIES } from '@/store/wizardStore';
import styles from './page.module.css';

// Datos mock de proveedores para simular matches
const MOCK_PROVIDERS = [
  {
    id: 'provider-1',
    providerName: 'Fotografía Elegante',
    categories: ['photography'],
    serviceStyle: 'artistic',
    priceRange: 'premium',
    workRegion: 'rm',
    description: 'Capturamos momentos únicos con un estilo artístico y emocional. Más de 10 años de experiencia en bodas.',
    instagram: '@fotografiaelegante',
    matchScore: 95,
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400',
  },
  {
    id: 'provider-2',
    providerName: 'DJ Master Events',
    categories: ['dj'],
    serviceStyle: 'modern',
    priceRange: 'mid',
    workRegion: 'rm',
    description: 'Música para todos los gustos. Equipos de última generación y animación profesional.',
    instagram: '@djmasterevents',
    matchScore: 88,
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
  },
  {
    id: 'provider-3',
    providerName: 'Banquetería Gourmet',
    categories: ['catering'],
    serviceStyle: 'traditional',
    priceRange: 'premium',
    workRegion: 'rm',
    description: 'Experiencias gastronómicas inolvidables. Menús personalizados para cada ocasión.',
    instagram: '@banqueteriagourmet',
    matchScore: 92,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
  },
];

/**
 * Dashboard principal del usuario (novios).
 * Muestra resumen del perfil y matches recomendados.
 */
export default function UserDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, userType, isLoading, firebaseUser } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [matches, setMatches] = useState(MOCK_PROVIDERS);

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (userType === 'provider') {
        router.push('/dashboard/provider');
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleApproveMatch = (providerId: string) => {
    console.log('Match aprobado:', providerId);
    // Aquí iría la lógica para crear el lead en Firestore
  };

  const handleRejectMatch = (providerId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== providerId));
  };

  // Obtener labels de las opciones
  const getBudgetLabel = (id: string) => BUDGET_RANGES.find((b) => b.id === id)?.label || id;
  const getGuestLabel = (id: string) => GUEST_COUNTS.find((g) => g.id === id)?.label || id;
  const getRegionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label || id;
  const getCategoryLabel = (id: string) => PRIORITY_CATEGORIES.find((c) => c.id === id)?.label || id;

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      </main>
    );
  }

  const profile = userProfile as UserProfile | null;

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoLink}>
            <Image 
              src="/logo.png" 
              alt="MatriMatch Logo" 
              width={160} 
              height={58}
              className={styles.logo}
            />
          </Link>
          
          <nav className={styles.nav}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <User size={20} />
              </div>
              <span className={styles.userName}>
                {profile?.coupleNames || firebaseUser?.email}
              </span>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        {/* Sidebar con resumen del perfil */}
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                <Heart size={28} />
              </div>
              <h2 className={styles.profileName}>{profile?.coupleNames}</h2>
              <p className={styles.profileEmail}>{profile?.email}</p>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <span>{profile?.eventDate || 'Fecha no definida'}</span>
              </div>
              <div className={styles.detailItem}>
                <MapPin size={16} />
                <span>{profile?.region ? getRegionLabel(profile.region) : 'Región no definida'}</span>
              </div>
              <div className={styles.detailItem}>
                <DollarSign size={16} />
                <span>{profile?.budget ? getBudgetLabel(profile.budget) : 'Presupuesto no definido'}</span>
              </div>
              <div className={styles.detailItem}>
                <Users size={16} />
                <span>{profile?.guestCount ? getGuestLabel(profile.guestCount) : 'Invitados no definidos'}</span>
              </div>
            </div>

            <div className={styles.categoriesSection}>
              <h3 className={styles.sectionTitle}>Buscando proveedores de:</h3>
              <div className={styles.categoryTags}>
                {profile?.priorityCategories?.map((cat) => (
                  <span 
                    key={cat} 
                    className={`${styles.categoryTag} ${selectedCategory === cat ? styles.categoryTagActive : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  >
                    {getCategoryLabel(cat)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal - Matches */}
        <section className={styles.content}>
          <div className={styles.contentHeader}>
            <div>
              <h1 className={styles.contentTitle}>
                Tus <span className={styles.highlight}>Matches</span>
              </h1>
              <p className={styles.contentSubtitle}>
                Proveedores recomendados basados en tus preferencias
              </p>
            </div>
            <div className={styles.matchCount}>
              <Sparkles size={20} />
              <span>{matches.length} recomendaciones</span>
            </div>
          </div>

          {/* Lista de matches */}
          <div className={styles.matchesGrid}>
            {matches.map((provider) => (
              <div key={provider.id} className={styles.matchCard}>
                {/* Imagen del proveedor */}
                <div className={styles.matchImage}>
                  <img 
                    src={provider.image} 
                    alt={provider.providerName}
                    className={styles.matchImg}
                  />
                  <div className={styles.matchScore}>
                    <Star size={14} />
                    <span>{provider.matchScore}%</span>
                  </div>
                </div>

                {/* Info del proveedor */}
                <div className={styles.matchInfo}>
                  <div className={styles.matchHeader}>
                    <h3 className={styles.matchName}>{provider.providerName}</h3>
                    <span className={styles.matchCategory}>
                      {getCategoryLabel(provider.categories[0])}
                    </span>
                  </div>

                  <p className={styles.matchDescription}>{provider.description}</p>

                  <div className={styles.matchMeta}>
                    <span className={styles.matchMetaItem}>
                      <MapPin size={14} />
                      {getRegionLabel(provider.workRegion)}
                    </span>
                    <span className={styles.matchMetaItem}>
                      {provider.instagram}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className={styles.matchActions}>
                    <button 
                      className={styles.rejectButton}
                      onClick={() => handleRejectMatch(provider.id)}
                    >
                      <X size={18} />
                      <span>Rechazar</span>
                    </button>
                    <button 
                      className={styles.approveButton}
                      onClick={() => handleApproveMatch(provider.id)}
                    >
                      <Check size={18} />
                      <span>Aprobar</span>
                    </button>
                    <button className={styles.detailsButton}>
                      <span>Ver más</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje si no hay matches */}
          {matches.length === 0 && (
            <div className={styles.emptyState}>
              <Heart size={48} />
              <h3>No hay más matches por ahora</h3>
              <p>Estamos buscando más proveedores que coincidan con tus preferencias.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

