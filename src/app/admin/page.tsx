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
  FileText,
  BarChart3,
  Search,
  Check,
  X,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
} from 'lucide-react';
import { useAuthStore, UserProfile, ProviderProfile } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import { logout } from '@/lib/firebase/auth';
import { Lead } from '@/lib/firebase/firestore';
import {
  getAllUsers,
  getAllProviders,
  getAllLeads,
  getAdminStats,
  approveProvider,
  closeProvider,
  adminUpdateProvider,
  assignLeadsToProvider,
  deleteLead,
  getProviderLeadsForAdmin,
} from '@/lib/firebase/admin-firestore';
import { PROVIDER_CATEGORIES, REGIONS } from '@/store/wizardStore';
import styles from './page.module.css';

// Tipos para las tabs
type TabType = 'overview' | 'users' | 'providers' | 'leads';

/**
 * Dashboard de Administración
 * Solo accesible por usuarios con claims de admin
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { firebaseUser, isLoading: authLoading, isInitialized } = useAuthStore();
  
  // Estado local para verificación de admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Estados del store de admin
  const {
    users,
    providers,
    leads,
    stats,
    isLoadingUsers,
    isLoadingProviders,
    isLoadingLeads,
    isLoadingStats,
    providerFilters,
    setUsers,
    setProviders,
    setLeads,
    setStats,
    setIsLoadingUsers,
    setIsLoadingProviders,
    setIsLoadingLeads,
    setIsLoadingStats,
    setProviderFilters,
    selectedProvider,
    setSelectedProvider,
    isEditModalOpen,
    setIsEditModalOpen,
    isLeadAssignModalOpen,
    setIsLeadAssignModalOpen,
  } = useAdminStore();
  
  // Estados para modales
  const [editFormData, setEditFormData] = useState<Partial<ProviderProfile>>({});
  const [selectedUsersForAssign, setSelectedUsersForAssign] = useState<string[]>([]);
  const [providerLeads, setProviderLeads] = useState<Lead[]>([]);

  // Verificar si el usuario es admin leyendo los claims del token
  const verifyAdminAccess = useCallback(async () => {
    if (!firebaseUser) {
      setIsVerifying(false);
      return;
    }

    try {
      // Forzar refresh del token para obtener claims actualizados
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = tokenResult.claims;
      
      setIsAdmin(claims.admin === true);
      setIsSuperAdmin(claims.super_admin === true);
    } catch (error) {
      console.error('Error al verificar acceso admin:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setIsVerifying(false);
    }
  }, [firebaseUser]);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    if (!isAdmin && !isSuperAdmin) return;

    // Cargar estadísticas
    setIsLoadingStats(true);
    try {
      const statsData = await getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }

    // Cargar usuarios
    setIsLoadingUsers(true);
    try {
      const { users: usersData } = await getAllUsers(50);
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setIsLoadingUsers(false);
    }

    // Cargar proveedores
    setIsLoadingProviders(true);
    try {
      const { providers: providersData } = await getAllProviders(50);
      setProviders(providersData);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setIsLoadingProviders(false);
    }

    // Cargar leads
    setIsLoadingLeads(true);
    try {
      const { leads: leadsData } = await getAllLeads(50);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error al cargar leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [isAdmin, isSuperAdmin, setStats, setUsers, setProviders, setLeads, setIsLoadingStats, setIsLoadingUsers, setIsLoadingProviders, setIsLoadingLeads]);

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

  const handleApproveProvider = async (providerId: string) => {
    try {
      await approveProvider(providerId);
      // Actualizar la lista local
      setProviders(
        providers.map((p) =>
          p.id === providerId ? { ...p, status: 'active' } : p
        )
      );
      // Actualizar estadísticas
      if (stats) {
        setStats({
          ...stats,
          pendingProviders: stats.pendingProviders - 1,
          activeProviders: stats.activeProviders + 1,
        });
      }
    } catch (error) {
      console.error('Error al aprobar proveedor:', error);
    }
  };

  const handleCloseProvider = async (providerId: string) => {
    try {
      await closeProvider(providerId);
      setProviders(
        providers.map((p) =>
          p.id === providerId ? { ...p, status: 'closed' } : p
        )
      );
      if (stats) {
        const provider = providers.find((p) => p.id === providerId);
        if (provider?.status === 'pending') {
          setStats({
            ...stats,
            pendingProviders: stats.pendingProviders - 1,
            closedProviders: stats.closedProviders + 1,
          });
        } else if (provider?.status === 'active') {
          setStats({
            ...stats,
            activeProviders: stats.activeProviders - 1,
            closedProviders: stats.closedProviders + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error al cerrar proveedor:', error);
    }
  };

  const handleEditProvider = (provider: ProviderProfile) => {
    setSelectedProvider(provider);
    setEditFormData({
      providerName: provider.providerName,
      description: provider.description,
      priceRange: provider.priceRange,
      workRegion: provider.workRegion,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProvider = async () => {
    if (!selectedProvider) return;

    try {
      await adminUpdateProvider(selectedProvider.id, editFormData);
      setProviders(
        providers.map((p) =>
          p.id === selectedProvider.id ? { ...p, ...editFormData } : p
        )
      );
      setIsEditModalOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const handleOpenAssignModal = async (provider: ProviderProfile) => {
    setSelectedProvider(provider);
    setSelectedUsersForAssign([]);
    
    // Cargar leads existentes del proveedor
    try {
      const existingLeads = await getProviderLeadsForAdmin(provider.id);
      setProviderLeads(existingLeads);
    } catch (error) {
      console.error('Error al cargar leads del proveedor:', error);
    }
    
    setIsLeadAssignModalOpen(true);
  };

  const handleAssignLeads = async () => {
    if (!selectedProvider || selectedUsersForAssign.length === 0) return;

    try {
      const category = selectedProvider.categories[0] || 'general';
      const newLeads = await assignLeadsToProvider(
        selectedProvider.id,
        selectedUsersForAssign,
        category
      );
      
      // Actualizar leads locales
      setLeads([...newLeads, ...leads]);
      
      // Actualizar estadísticas
      if (stats) {
        setStats({
          ...stats,
          totalLeads: stats.totalLeads + newLeads.length,
          leadsPending: stats.leadsPending + newLeads.length,
        });
      }
      
      setIsLeadAssignModalOpen(false);
      setSelectedProvider(null);
      setSelectedUsersForAssign([]);
    } catch (error) {
      console.error('Error al asignar leads:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;

    try {
      await deleteLead(leadId);
      setLeads(leads.filter((l) => l.id !== leadId));
      if (stats) {
        const lead = leads.find((l) => l.id === leadId);
        const newStats = { ...stats, totalLeads: stats.totalLeads - 1 };
        if (lead?.status === 'pending') newStats.leadsPending--;
        else if (lead?.status === 'approved') newStats.leadsApproved--;
        else if (lead?.status === 'rejected') newStats.leadsRejected--;
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error al eliminar lead:', error);
    }
  };

  // Helpers
  const getCategoryLabel = (id: string) =>
    PROVIDER_CATEGORIES.find((c) => c.id === id)?.label || id;
  const getRegionLabel = (id: string) =>
    REGIONS.find((r) => r.id === id)?.label || id;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'active':
        return styles.statusActive;
      case 'closed':
        return styles.statusClosed;
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'contacted':
        return styles.statusContacted;
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'active':
        return 'Activo';
      case 'closed':
        return 'Cerrado';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'contacted':
        return 'Contactado';
      default:
        return status;
    }
  };

  // Filtrar proveedores
  const filteredProviders = providers.filter((p) => {
    if (providerFilters.status && p.status !== providerFilters.status) return false;
    if (providerFilters.category && !p.categories.includes(providerFilters.category))
      return false;
    if (providerFilters.search) {
      const search = providerFilters.search.toLowerCase();
      if (
        !p.providerName.toLowerCase().includes(search) &&
        !p.email.toLowerCase().includes(search)
      )
        return false;
    }
    return true;
  });

  // Loading state
  if (authLoading || isVerifying) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Verificando acceso...</p>
        </div>
      </main>
    );
  }

  // Access denied
  if (!isAdmin && !isSuperAdmin) {
    return (
      <main className={styles.main}>
        <div className={styles.accessDenied}>
          <AlertTriangle size={64} />
          <h1>Acceso Denegado</h1>
          <p>
            No tienes permisos para acceder al panel de administración.
            Contacta al administrador si crees que esto es un error.
          </p>
          <Link href="/" className={styles.backButton}>
            <ChevronLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo.png"
                alt="MatriMatch Logo"
                width={140}
                height={50}
                className={styles.logo}
              />
            </Link>
            <span className={styles.adminBadge}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>

          <nav className={styles.nav}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <Shield size={18} />
              </div>
              <div>
                <span className={styles.userName}>
                  {firebaseUser?.email}
                </span>
                <span className={styles.userRole}>
                  {isSuperAdmin ? 'Super Administrador' : 'Administrador'}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        {/* Tabs Navigation */}
        <nav className={styles.tabsNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} />
            <span>Resumen</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Usuarios</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'providers' ? styles.active : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            <Store size={18} />
            <span>Proveedores</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'leads' ? styles.active : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <FileText size={18} />
            <span>Leads</span>
          </button>
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingStats ? '...' : stats?.totalUsers || 0}
                  </span>
                  <span className={styles.statLabel}>Usuarios</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Store size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingStats ? '...' : stats?.totalProviders || 0}
                  </span>
                  <span className={styles.statLabel}>Proveedores</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.warning}`}>
                  <Clock size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingStats ? '...' : stats?.pendingProviders || 0}
                  </span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.success}`}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingStats ? '...' : stats?.activeProviders || 0}
                  </span>
                  <span className={styles.statLabel}>Activos</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FileText size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingStats ? '...' : stats?.totalLeads || 0}
                  </span>
                  <span className={styles.statLabel}>Leads Totales</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.success}`}>
                  <Check size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingStats ? '...' : stats?.leadsApproved || 0}
                  </span>
                  <span className={styles.statLabel}>Leads Aprobados</span>
                </div>
              </div>
            </div>

            {/* Proveedores Pendientes */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Proveedores <span>Pendientes</span>
              </h2>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Categoría</th>
                    <th>Región</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {providers
                    .filter((p) => p.status === 'pending')
                    .slice(0, 5)
                    .map((provider) => (
                      <tr key={provider.id}>
                        <td>
                          <div className={styles.cellPrimary}>
                            {provider.providerName}
                          </div>
                          <div className={styles.cellMuted}>{provider.email}</div>
                        </td>
                        <td>
                          {provider.categories.map(getCategoryLabel).join(', ')}
                        </td>
                        <td>{getRegionLabel(provider.workRegion)}</td>
                        <td className={styles.cellMuted}>
                          {provider.createdAt.toLocaleDateString()}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={`${styles.actionButton} ${styles.approve}`}
                              onClick={() => handleApproveProvider(provider.id)}
                              title="Aprobar"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.reject}`}
                              onClick={() => handleCloseProvider(provider.id)}
                              title="Rechazar"
                            >
                              <X size={16} />
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.edit}`}
                              onClick={() => handleEditProvider(provider)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {providers.filter((p) => p.status === 'pending').length === 0 && (
                <div className={styles.emptyState}>
                  <CheckCircle size={48} />
                  <h3>No hay proveedores pendientes</h3>
                  <p>Todos los proveedores han sido revisados.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Gestión de <span>Usuarios</span>
              </h2>
              <div className={styles.filters}>
                <div className={styles.searchInput}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Pareja</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Fecha Evento</th>
                    <th>Región</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center' }}>
                        Cargando...
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className={styles.cellPrimary}>{user.coupleNames}</td>
                        <td className={styles.cellSecondary}>{user.email}</td>
                        <td className={styles.cellSecondary}>{user.phone}</td>
                        <td className={styles.cellSecondary}>{user.eventDate}</td>
                        <td>{getRegionLabel(user.region)}</td>
                        <td className={styles.cellMuted}>
                          {user.createdAt.toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!isLoadingUsers && users.length === 0 && (
                <div className={styles.emptyState}>
                  <Users size={48} />
                  <h3>No hay usuarios registrados</h3>
                  <p>Los usuarios aparecerán aquí cuando se registren.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Gestión de <span>Proveedores</span>
              </h2>
              <div className={styles.filters}>
                <div className={styles.searchInput}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={providerFilters.search}
                    onChange={(e) =>
                      setProviderFilters({ search: e.target.value })
                    }
                  />
                </div>
                <select
                  className={styles.filterSelect}
                  value={providerFilters.status}
                  onChange={(e) =>
                    setProviderFilters({ status: e.target.value })
                  }
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="active">Activos</option>
                  <option value="closed">Cerrados</option>
                </select>
                <select
                  className={styles.filterSelect}
                  value={providerFilters.category}
                  onChange={(e) =>
                    setProviderFilters({ category: e.target.value })
                  }
                >
                  <option value="">Todas las categorías</option>
                  {PROVIDER_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Categoría</th>
                    <th>Región</th>
                    <th>Estado</th>
                    <th>Leads</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingProviders ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center' }}>
                        Cargando...
                      </td>
                    </tr>
                  ) : (
                    filteredProviders.map((provider) => {
                      const providerLeadsCount = leads.filter(
                        (l) => l.providerId === provider.id
                      ).length;

                      return (
                        <tr key={provider.id}>
                          <td>
                            <div className={styles.cellPrimary}>
                              {provider.providerName}
                            </div>
                            <div className={styles.cellMuted}>
                              {provider.email}
                            </div>
                          </td>
                          <td>
                            {provider.categories.map(getCategoryLabel).join(', ')}
                          </td>
                          <td>{getRegionLabel(provider.workRegion)}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${getStatusBadgeClass(provider.status)}`}
                            >
                              {getStatusLabel(provider.status)}
                            </span>
                          </td>
                          <td>
                            <span className={styles.leadsCount}>
                              <FileText size={14} />
                              {providerLeadsCount}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {provider.status === 'pending' && (
                                <button
                                  className={`${styles.actionButton} ${styles.approve}`}
                                  onClick={() => handleApproveProvider(provider.id)}
                                  title="Aprobar"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              {provider.status !== 'closed' && (
                                <button
                                  className={`${styles.actionButton} ${styles.reject}`}
                                  onClick={() => handleCloseProvider(provider.id)}
                                  title="Cerrar"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                              <button
                                className={`${styles.actionButton} ${styles.edit}`}
                                onClick={() => handleEditProvider(provider)}
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className={`${styles.actionButton} ${styles.assign}`}
                                onClick={() => handleOpenAssignModal(provider)}
                                title="Asignar Leads"
                              >
                                <UserPlus size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {!isLoadingProviders && filteredProviders.length === 0 && (
                <div className={styles.emptyState}>
                  <Store size={48} />
                  <h3>No se encontraron proveedores</h3>
                  <p>Intenta ajustar los filtros de búsqueda.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Gestión de <span>Leads</span>
              </h2>
              <div className={styles.filters}>
                <div className={styles.searchInput}>
                  <Search size={18} />
                  <input type="text" placeholder="Buscar leads..." />
                </div>
                <select className={styles.filterSelect}>
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="approved">Aprobados</option>
                  <option value="rejected">Rechazados</option>
                  <option value="contacted">Contactados</option>
                </select>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Proveedor</th>
                    <th>Categoría</th>
                    <th>Match</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingLeads ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center' }}>
                        Cargando...
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className={styles.cellPrimary}>
                            {lead.userInfo.coupleNames}
                          </div>
                          <div className={styles.cellMuted}>
                            {lead.userInfo.email}
                          </div>
                        </td>
                        <td>
                          <div className={styles.cellPrimary}>
                            {lead.providerInfo.providerName}
                          </div>
                        </td>
                        <td>{getCategoryLabel(lead.category)}</td>
                        <td className={styles.cellPrimary}>{lead.matchScore}%</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${getStatusBadgeClass(lead.status)}`}
                          >
                            {getStatusLabel(lead.status)}
                          </span>
                        </td>
                        <td className={styles.cellMuted}>
                          {lead.createdAt.toLocaleDateString()}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={`${styles.actionButton} ${styles.reject}`}
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Eliminar"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!isLoadingLeads && leads.length === 0 && (
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <h3>No hay leads registrados</h3>
                  <p>Los leads aparecerán aquí cuando se generen matches.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de Edición de Proveedor */}
      {isEditModalOpen && selectedProvider && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Proveedor</h3>
              <button
                className={styles.modalClose}
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Proveedor</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editFormData.providerName || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, providerName: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea
                  className={styles.formTextarea}
                  value={editFormData.description || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rango de Precios</label>
                <select
                  className={styles.formSelect}
                  value={editFormData.priceRange || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, priceRange: e.target.value })
                  }
                >
                  <option value="budget">Económico</option>
                  <option value="mid">Intermedio</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Lujo</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Región de Trabajo</label>
                <select
                  className={styles.formSelect}
                  value={editFormData.workRegion || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, workRegion: e.target.value })
                  }
                >
                  {REGIONS.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button className={styles.buttonPrimary} onClick={handleSaveProvider}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación de Leads */}
      {isLeadAssignModalOpen && selectedProvider && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsLeadAssignModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Asignar Leads a {selectedProvider.providerName}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setIsLeadAssignModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Mostrar leads actuales */}
              <div className={styles.detailCard}>
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
                  Leads Actuales: {providerLeads.length}
                </h4>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Aprobados: {providerLeads.filter((l) => l.status === 'approved').length} |
                  Pendientes: {providerLeads.filter((l) => l.status === 'pending').length} |
                  Rechazados: {providerLeads.filter((l) => l.status === 'rejected').length}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Selecciona usuarios para asignar como leads
                </label>
                <div className={styles.userList}>
                  {users
                    .filter(
                      (user) =>
                        !providerLeads.some((lead) => lead.userId === user.id)
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className={`${styles.userListItem} ${
                          selectedUsersForAssign.includes(user.id)
                            ? styles.selected
                            : ''
                        }`}
                        onClick={() => {
                          if (selectedUsersForAssign.includes(user.id)) {
                            setSelectedUsersForAssign(
                              selectedUsersForAssign.filter((id) => id !== user.id)
                            );
                          } else {
                            setSelectedUsersForAssign([
                              ...selectedUsersForAssign,
                              user.id,
                            ]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          className={styles.userCheckbox}
                          checked={selectedUsersForAssign.includes(user.id)}
                          onChange={() => {}}
                        />
                        <div className={styles.userListInfo}>
                          <div className={styles.userListName}>
                            {user.coupleNames}
                          </div>
                          <div className={styles.userListEmail}>{user.email}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {selectedUsersForAssign.length > 0 && (
                <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                  {selectedUsersForAssign.length} usuario(s) seleccionado(s)
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setIsLeadAssignModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.buttonPrimary}
                onClick={handleAssignLeads}
                disabled={selectedUsersForAssign.length === 0}
              >
                <Plus size={18} />
                Asignar {selectedUsersForAssign.length} Lead(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

