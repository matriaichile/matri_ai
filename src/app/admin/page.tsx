'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LogOut,
  Shield,
  Users,
  Store,
  LayoutDashboard,
  Search,
  Edit2,
  Eye,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Heart,
  XCircle,
  MessageSquare,
  Calendar,
  Settings,
  Sliders,
} from 'lucide-react';
import { useAuthStore, UserProfile, ProviderProfile, ProviderStatus, CategoryId } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { Lead, getUserLeads } from '@/lib/firebase/firestore';
import {
  getAllUsers,
  getAllProviders,
  getAdminStats,
  getProviderLeadsForAdmin,
  updateProviderLeadLimit,
  updateProviderStatus,
  updateProviderVerification,
} from '@/lib/firebase/admin-firestore';
import { AdminStats } from '@/store/adminStore';
import { PROVIDER_CATEGORIES, REGIONS } from '@/store/wizardStore';
import AdminMobileMenu from './AdminMobileMenu';
import styles from './page.module.css';

// Tipo para las secciones del sidebar
type SectionType = 'overview' | 'providers' | 'users';

/**
 * Panel de Administración - Diseño Minimalista Stripe-like
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { firebaseUser, isLoading: authLoading, isInitialized } = useAuthStore();
  
  // Estado de verificación admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Sección activa
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  
  // Datos
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros para proveedores
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');
  const [providerStatusFilter, setProviderStatusFilter] = useState<string>('all');
  const [providerSortBy, setProviderSortBy] = useState<string>('name'); // name, credits_asc, credits_desc
  
  // Filtros para usuarios
  const [userSortBy, setUserSortBy] = useState<string>('date_asc'); // date_asc (próximos primero), date_desc, name
  
  // Modal de edición de leads (Proveedores)
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewLeadsModalOpen, setIsViewLeadsModalOpen] = useState(false);
  const [newLeadLimit, setNewLeadLimit] = useState(10);
  const [providerLeads, setProviderLeads] = useState<Lead[]>([]);
  
  // Modal de ver matches (Usuarios)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isViewUserMatchesModalOpen, setIsViewUserMatchesModalOpen] = useState(false);
  const [userMatches, setUserMatches] = useState<Lead[]>([]);

  // Verificar acceso admin
  const verifyAdminAccess = useCallback(async () => {
    if (!firebaseUser) {
      setIsVerifying(false);
      return;
    }

    try {
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = tokenResult.claims;
      setIsAdmin(claims.admin === true);
      setIsSuperAdmin(claims.super_admin === true);
    } catch (error) {
      console.error('Error verificando acceso:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setIsVerifying(false);
    }
  }, [firebaseUser]);

  // Cargar datos
  const loadData = useCallback(async () => {
    if (!isAdmin && !isSuperAdmin) return;
    setIsLoading(true);

    try {
      const [statsData, usersData, providersData] = await Promise.all([
        getAdminStats(),
        getAllUsers(100),
        getAllProviders(100),
      ]);
      
      setStats(statsData);
      setUsers(usersData.users);
      setProviders(providersData.providers);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isSuperAdmin]);

  // Efectos
  useEffect(() => {
    if (isInitialized && !authLoading) {
      if (!firebaseUser) {
        router.push('/login');
      } else {
        verifyAdminAccess();
      }
    }
  }, [firebaseUser, authLoading, isInitialized, router, verifyAdminAccess]);

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      loadData();
    }
  }, [isAdmin, isSuperAdmin, loadData]);

  // Handlers
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Abrir modal de edición de leads
  const handleEditLeads = (provider: ProviderProfile) => {
    setSelectedProvider(provider);
    setNewLeadLimit(provider.leadLimit ?? 10);
    setIsEditModalOpen(true);
  };

  // Guardar nuevo límite de leads
  const handleSaveLeadLimit = async () => {
    if (!selectedProvider) return;
    try {
      await updateProviderLeadLimit(selectedProvider.id, newLeadLimit);
      setProviders(providers.map(p => 
        p.id === selectedProvider.id ? { ...p, leadLimit: newLeadLimit } : p
      ));
      setIsEditModalOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error actualizando límite:', error);
    }
  };

  // Ver leads del proveedor
  const handleViewLeads = async (provider: ProviderProfile) => {
    setSelectedProvider(provider);
    try {
      const leads = await getProviderLeadsForAdmin(provider.id);
      setProviderLeads(leads);
    } catch (error) {
      console.error('Error cargando leads:', error);
    }
    setIsViewLeadsModalOpen(true);
  };

  // Cambiar estado activo/inactivo del proveedor
  const handleToggleProviderStatus = async (provider: ProviderProfile) => {
    const newStatus: ProviderStatus = provider.status === 'active' ? 'closed' : 'active';
    try {
      await updateProviderStatus(provider.id, newStatus);
      setProviders(providers.map(p => 
        p.id === provider.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  // Cambiar estado de verificación del proveedor (solo super admin)
  const handleToggleVerification = async (provider: ProviderProfile) => {
    if (!isSuperAdmin) return;
    const newVerified = !provider.isVerified;
    try {
      await updateProviderVerification(provider.id, newVerified);
      setProviders(providers.map(p => 
        p.id === provider.id ? { ...p, isVerified: newVerified } : p
      ));
    } catch (error) {
      console.error('Error actualizando verificación:', error);
    }
  };

  // Ver matches de un usuario (los 3 proveedores asignados)
  const handleViewUserMatches = async (user: UserProfile) => {
    setSelectedUser(user);
    try {
      const matches = await getUserLeads(user.id);
      setUserMatches(matches);
    } catch (error) {
      console.error('Error cargando matches del usuario:', error);
    }
    setIsViewUserMatchesModalOpen(true);
  };

  // Helpers
  const getCategoryLabel = (id: string) =>
    PROVIDER_CATEGORIES.find(c => c.id === id)?.label || id;
  const getRegionLabel = (id: string) =>
    REGIONS.find(r => r.id === id)?.label || id;
  const getStatusLabel = (status: ProviderStatus) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'Pendiente';
      case 'closed': return 'Inactivo';
      default: return status;
    }
  };

  // Formatear fecha de registro
  const formatRegistrationDate = (date: Date | undefined) => {
    if (!date) return 'Sin fecha';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calcular días desde el registro
  const getDaysSinceRegistration = (date: Date | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressClass = (used: number, limit: number) => {
    if (limit === 0) return styles.high;
    const pct = (used / limit) * 100;
    if (pct >= 80) return styles.high;
    if (pct >= 50) return styles.medium;
    return styles.low;
  };

  // Filtrar y ordenar proveedores
  const filteredProviders = providers
    .filter(p => {
      // Filtro de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!p.providerName.toLowerCase().includes(term) && 
            !p.email.toLowerCase().includes(term)) {
          return false;
        }
      }
      // Filtro por categoría
      if (providerCategoryFilter !== 'all') {
        if (!p.categories.includes(providerCategoryFilter as CategoryId)) {
          return false;
        }
      }
      // Filtro por estado activo/inactivo
      if (providerStatusFilter !== 'all') {
        if (providerStatusFilter === 'active' && p.status !== 'active') return false;
        if (providerStatusFilter === 'inactive' && p.status === 'active') return false;
        if (providerStatusFilter === 'verified' && !p.isVerified) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Ordenamiento
      switch (providerSortBy) {
        case 'credits_asc':
          return ((a.leadLimit ?? 10) - (a.leadsUsed ?? 0)) - ((b.leadLimit ?? 10) - (b.leadsUsed ?? 0));
        case 'credits_desc':
          return ((b.leadLimit ?? 10) - (b.leadsUsed ?? 0)) - ((a.leadLimit ?? 10) - (a.leadsUsed ?? 0));
        case 'name':
        default:
          return a.providerName.localeCompare(b.providerName);
      }
    });

  // Filtrar y ordenar usuarios
  const filteredUsers = users
    .filter(u => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return u.coupleNames.toLowerCase().includes(term) || 
             u.email.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      // Ordenamiento por fecha de evento
      switch (userSortBy) {
        case 'date_asc': {
          // Eventos próximos primero, sin fecha al final
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : Infinity;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : Infinity;
          return dateA - dateB;
        }
        case 'date_desc': {
          // Eventos lejanos primero, sin fecha al final
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : -Infinity;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : -Infinity;
          return dateB - dateA;
        }
        case 'name':
        default:
          return a.coupleNames.localeCompare(b.coupleNames);
      }
    });

  // Loading
  if (authLoading || isVerifying) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // Acceso denegado
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className={styles.accessDenied}>
        <AlertTriangle />
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder al panel de administración.</p>
        <Link href="/" className={styles.btnSecondary}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      {/* Menú hamburguesa para móvil */}
      <AdminMobileMenu
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoContainer}>
            <Image src="/logo.png" alt="Logo" width={120} height={40} className={styles.logo} />
          </Link>
          <span className={styles.adminBadge}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>General</span>
            <button
              className={`${styles.navItem} ${activeSection === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <LayoutDashboard />
              <span>Resumen</span>
            </button>
          </div>

          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Gestión</span>
            <button
              className={`${styles.navItem} ${activeSection === 'providers' ? styles.active : ''}`}
              onClick={() => setActiveSection('providers')}
            >
              <Store />
              <span>Proveedores</span>
            </button>
            <button
              className={`${styles.navItem} ${activeSection === 'users' ? styles.active : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <Users />
              <span>Usuarios</span>
            </button>
          </div>

          {/* Sección de configuración solo para Super Admins */}
          {isSuperAdmin && (
            <div className={styles.navSection}>
              <span className={styles.navSectionTitle}>Configuración</span>
              <Link
                href="/admin/matchmaking"
                className={styles.navItem}
              >
                <Sliders />
                <span>Matchmaking</span>
              </Link>
            </div>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <Shield />
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userEmail}>{firebaseUser?.email}</div>
              <div className={styles.userRole}>{isSuperAdmin ? 'Super Admin' : 'Admin'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className={styles.mainContent}>
        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Resumen</h1>
              <p className={styles.pageSubtitle}>Vista general del sistema</p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Usuarios</div>
                <div className={styles.statValue}>{stats?.totalUsers || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Proveedores</div>
                <div className={styles.statValue}>{stats?.totalProviders || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Leads Generados</div>
                <div className={`${styles.statValue} ${styles.accent}`}>{stats?.totalLeads || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Leads Aprobados</div>
                <div className={`${styles.statValue} ${styles.success}`}>{stats?.leadsApproved || 0}</div>
              </div>
            </div>
          </>
        )}

        {/* PROVEEDORES */}
        {activeSection === 'providers' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Proveedores</h1>
              <p className={styles.pageSubtitle}>Gestiona los límites de leads de cada proveedor</p>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>{filteredProviders.length} proveedores</h3>
                <div className={styles.searchBox}>
                  <Search />
                  <input
                    type="text"
                    placeholder="Buscar proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filtros de proveedores */}
              <div className={styles.filtersRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Categoría:</label>
                  <select 
                    className={styles.filterSelect}
                    value={providerCategoryFilter}
                    onChange={(e) => setProviderCategoryFilter(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    {PROVIDER_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Estado:</label>
                  <select 
                    className={styles.filterSelect}
                    value={providerStatusFilter}
                    onChange={(e) => setProviderStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="verified">Verificados</option>
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Ordenar por:</label>
                  <select 
                    className={styles.filterSelect}
                    value={providerSortBy}
                    onChange={(e) => setProviderSortBy(e.target.value)}
                  >
                    <option value="name">Nombre</option>
                    <option value="credits_desc">Más créditos disponibles</option>
                    <option value="credits_asc">Menos créditos disponibles</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className={styles.emptyState}>
                  <div className={styles.loadingSpinner} />
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className={styles.emptyState}>
                  <Store />
                  <h3>Sin proveedores</h3>
                  <p>No se encontraron proveedores</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Categoría</th>
                      <th>Región</th>
                      <th>Estado</th>
                      <th>Métricas</th>
                      <th>Créditos (Usados / Límite)</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProviders.map(provider => {
                      const used = provider.leadsUsed ?? 0;
                      const limit = provider.leadLimit ?? 10;
                      const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;
                      
                      // Métricas del proveedor
                      const metrics = provider.metrics || { timesInterested: 0, timesNotInterested: 0 };
                      
                      // Días desde registro
                      const daysSinceProvider = getDaysSinceRegistration(provider.createdAt);

                      return (
                        <tr key={provider.id}>
                          <td>
                            <div className={styles.cellPrimaryWithBadge}>
                              <span className={styles.cellPrimary}>{provider.providerName}</span>
                              {provider.isVerified && (
                                <span className={styles.verifiedBadge} title="Proveedor verificado">
                                  <CheckCircle size={14} />
                                </span>
                              )}
                            </div>
                            <div className={styles.cellSecondary}>{provider.email}</div>
                            <div className={styles.cellDate}>
                              <Calendar size={12} />
                              <span>{formatRegistrationDate(provider.createdAt)}</span>
                              {daysSinceProvider !== null && <span className={styles.cellDateDays}>({daysSinceProvider}d)</span>}
                            </div>
                          </td>
                          <td>{provider.categories.map(getCategoryLabel).join(', ')}</td>
                          <td>{getRegionLabel(provider.workRegion)}</td>
                          <td>
                            <div className={styles.statusCell}>
                              <span className={`${styles.statusBadge} ${styles[provider.status]}`}>
                                <span className={styles.statusDot} />
                                {getStatusLabel(provider.status)}
                              </span>
                              <label className={styles.toggleSwitch}>
                                <input
                                  type="checkbox"
                                  checked={provider.status === 'active'}
                                  onChange={() => handleToggleProviderStatus(provider)}
                                />
                                <span className={styles.toggleSlider} />
                              </label>
                            </div>
                          </td>
                          <td>
                            <div className={styles.metricsCell}>
                              <div className={styles.metricItem} title="Me interesa">
                                <Heart size={12} className={styles.metricInterested} />
                                <span>{metrics.timesInterested}</span>
                              </div>
                              <div className={styles.metricItem} title="No me interesa">
                                <XCircle size={12} className={styles.metricNotInterested} />
                                <span>{metrics.timesNotInterested}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.leadCounter}>
                              <div className={styles.leadCounterValue}>
                                <span className={styles.leadUsed}>{used}</span>
                                <span className={styles.leadSeparator}>/</span>
                                <span className={styles.leadLimit}>{limit}</span>
                              </div>
                              <div className={styles.leadProgress}>
                                <div 
                                  className={`${styles.leadProgressBar} ${getProgressClass(used, limit)}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {isSuperAdmin && (
                                <button
                                  className={`${styles.actionBtn} ${provider.isVerified ? styles.actionBtnVerified : ''}`}
                                  onClick={() => handleToggleVerification(provider)}
                                  title={provider.isVerified ? 'Quitar verificación' : 'Verificar proveedor'}
                                >
                                  <CheckCircle />
                                </button>
                              )}
                              <button
                                className={styles.actionBtn}
                                onClick={() => handleEditLeads(provider)}
                                title="Editar límite de créditos"
                              >
                                <Edit2 />
                              </button>
                              <button
                                className={styles.actionBtn}
                                onClick={() => handleViewLeads(provider)}
                                title="Ver leads asignados"
                              >
                                <Eye />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* USUARIOS */}
        {activeSection === 'users' && (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Usuarios</h1>
              <p className={styles.pageSubtitle}>Parejas registradas y sus matches asignados</p>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>{filteredUsers.length} usuarios</h3>
                <div className={styles.searchBox}>
                  <Search />
                  <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filtros de usuarios */}
              <div className={styles.filtersRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Ordenar por fecha evento:</label>
                  <select 
                    className={styles.filterSelect}
                    value={userSortBy}
                    onChange={(e) => setUserSortBy(e.target.value)}
                  >
                    <option value="date_asc">Próximos eventos primero</option>
                    <option value="date_desc">Eventos lejanos primero</option>
                    <option value="name">Nombre</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className={styles.emptyState}>
                  <div className={styles.loadingSpinner} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users />
                  <h3>Sin usuarios</h3>
                  <p>No se encontraron usuarios</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Pareja</th>
                      <th>Contacto</th>
                      <th>Fecha Evento</th>
                      <th>Región</th>
                      <th>Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const daysSince = getDaysSinceRegistration(user.createdAt);
                      return (
                        <tr key={user.id}>
                          <td>
                            <div className={styles.cellPrimary}>{user.coupleNames}</div>
                          </td>
                          <td>
                            <div className={styles.cellSecondary}>{user.email}</div>
                            <div className={styles.cellSecondary}>{user.phone}</div>
                            <div className={styles.cellDate}>
                              <Calendar size={12} />
                              <span>{formatRegistrationDate(user.createdAt)}</span>
                              {daysSince !== null && <span className={styles.cellDateDays}>({daysSince}d)</span>}
                            </div>
                          </td>
                          <td>{user.eventDate || 'Sin definir'}</td>
                          <td>{getRegionLabel(user.region)}</td>
                          <td>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleViewUserMatches(user)}
                              title="Ver proveedores asignados"
                            >
                              <Eye />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal: Editar Límite de Leads */}
      {isEditModalOpen && selectedProvider && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Límite de Créditos</h3>
              <button className={styles.modalClose} onClick={() => setIsEditModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <Info />
                <p>
                  <strong>{selectedProvider.providerName}</strong><br />
                  Créditos usados: {selectedProvider.leadsUsed ?? 0} de {selectedProvider.leadLimit ?? 10}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nuevo límite de créditos</label>
                <div className={styles.leadEditContainer}>
                  <input
                    type="number"
                    min="0"
                    className={styles.leadEditInput}
                    value={newLeadLimit}
                    onChange={(e) => setNewLeadLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className={styles.leadEditLabel}>créditos máximos</span>
                </div>
              </div>

              {newLeadLimit < (selectedProvider.leadsUsed ?? 0) && (
                <div className={styles.infoBox} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <AlertTriangle style={{ color: '#ef4444' }} />
                  <p style={{ color: '#ef4444' }}>
                    El nuevo límite es menor que los créditos ya usados. 
                    El proveedor no podrá recibir nuevos leads.
                  </p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={handleSaveLeadLimit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver Leads del Proveedor */}
      {isViewLeadsModalOpen && selectedProvider && (
        <div className={styles.modalOverlay} onClick={() => setIsViewLeadsModalOpen(false)}>
          <div className={styles.modalLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Leads de {selectedProvider.providerName}</h3>
              <button className={styles.modalClose} onClick={() => setIsViewLeadsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <Info />
                <p>
                  <strong>{selectedProvider.leadsUsed ?? 0}</strong> de <strong>{selectedProvider.leadLimit ?? 10}</strong> leads usados
                </p>
              </div>

              {providerLeads.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users />
                  <h3>Sin leads asignados</h3>
                  <p>Este proveedor aún no tiene usuarios asignados como leads</p>
                </div>
              ) : (
                <>
                  {/* Leads activos (pendientes y aprobados) */}
                  {providerLeads.filter(l => l.status !== 'rejected').length > 0 && (
                    <div className={styles.leadSection}>
                      <h4 className={styles.leadSectionTitle}>
                        <Heart size={14} className={styles.leadSectionIconActive} />
                        Leads Activos ({providerLeads.filter(l => l.status !== 'rejected').length})
                      </h4>
                      <div className={styles.leadList}>
                        {providerLeads.filter(l => l.status !== 'rejected').map(lead => (
                          <div key={lead.id} className={styles.leadItem}>
                            <div className={styles.leadItemInfo}>
                              <div className={styles.leadItemName}>
                                {lead.userInfo?.coupleNames || 'Usuario'}
                              </div>
                              <div className={styles.leadItemMeta}>
                                {lead.userInfo?.eventDate || 'Sin fecha'} • {getRegionLabel(lead.userInfo?.region || '')}
                              </div>
                            </div>
                            <div className={styles.leadItemRight}>
                              <span className={`${styles.leadStatusBadge} ${styles[lead.status]}`}>
                                {lead.status === 'approved' ? 'Interesado' : lead.status === 'contacted' ? 'Contactado' : 'Pendiente'}
                              </span>
                              <div className={styles.leadItemScore}>
                                {lead.matchScore}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leads rechazados con motivo */}
                  {providerLeads.filter(l => l.status === 'rejected').length > 0 && (
                    <div className={styles.leadSection}>
                      <h4 className={styles.leadSectionTitle}>
                        <XCircle size={14} className={styles.leadSectionIconRejected} />
                        Descartados ({providerLeads.filter(l => l.status === 'rejected').length})
                      </h4>
                      <div className={styles.leadList}>
                        {providerLeads.filter(l => l.status === 'rejected').map(lead => (
                          <div key={lead.id} className={`${styles.leadItem} ${styles.leadItemRejected}`}>
                            <div className={styles.leadItemInfo}>
                              <div className={styles.leadItemName}>
                                {lead.userInfo?.coupleNames || 'Usuario'}
                              </div>
                              <div className={styles.leadItemMeta}>
                                {lead.userInfo?.eventDate || 'Sin fecha'} • {getRegionLabel(lead.userInfo?.region || '')}
                              </div>
                              {lead.rejectionReason && (
                                <div className={styles.rejectionReasonBox}>
                                  <MessageSquare size={12} />
                                  <span>{lead.rejectionReason}</span>
                                </div>
                              )}
                            </div>
                            <div className={styles.leadItemScore}>
                              {lead.matchScore}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setIsViewLeadsModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver Matches del Usuario (máximo 3 proveedores por categoría) */}
      {isViewUserMatchesModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setIsViewUserMatchesModalOpen(false)}>
          <div className={styles.modalLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Matches de {selectedUser.coupleNames}</h3>
              <button className={styles.modalClose} onClick={() => setIsViewUserMatchesModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <Info />
                <p>
                  Proveedores asignados a esta pareja (máximo 3 por categoría)
                </p>
              </div>

              {userMatches.length === 0 ? (
                <div className={styles.emptyState}>
                  <Store />
                  <h3>Sin matches asignados</h3>
                  <p>Esta pareja aún no tiene proveedores asignados</p>
                </div>
              ) : (
                <>
                  {/* Agrupar matches por categoría */}
                  {Object.entries(
                    userMatches.reduce((acc, match) => {
                      const cat = match.category;
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(match);
                      return acc;
                    }, {} as Record<string, typeof userMatches>)
                  ).map(([category, matches]) => (
                    <div key={category} className={styles.leadSection}>
                      <h4 className={styles.leadSectionTitle}>
                        <Store size={14} className={styles.leadSectionIconActive} />
                        {getCategoryLabel(category)} ({matches.length}/3 máx.)
                      </h4>
                      <div className={styles.leadList}>
                        {matches.map(match => (
                          <div key={match.id} className={styles.leadItem}>
                            <div className={styles.leadItemInfo}>
                              <div className={styles.leadItemName}>
                                {match.providerInfo?.providerName || 'Proveedor'}
                                {match.providerInfo?.isVerified && (
                                  <CheckCircle size={12} className={styles.verifiedInline} />
                                )}
                              </div>
                              <div className={styles.leadItemMeta}>
                                {match.providerInfo?.priceRange || ''} • 
                                <span className={`${styles.matchStatusInline} ${styles[match.status]}`}>
                                  {match.status === 'approved' ? ' Interesado' : 
                                   match.status === 'rejected' ? ' Rechazado' : ' Pendiente'}
                                </span>
                              </div>
                            </div>
                            <div className={styles.leadItemScore}>
                              {match.matchScore}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setIsViewUserMatchesModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
