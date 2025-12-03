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
} from 'lucide-react';
import { useAuthStore, UserProfile, ProviderProfile } from '@/store/authStore';
import { logout } from '@/lib/firebase/auth';
import { Lead, getUserLeads } from '@/lib/firebase/firestore';
import {
  getAllUsers,
  getAllProviders,
  getAdminStats,
  getProviderLeadsForAdmin,
  updateProviderLeadLimit,
} from '@/lib/firebase/admin-firestore';
import { AdminStats } from '@/store/adminStore';
import { PROVIDER_CATEGORIES, REGIONS } from '@/store/wizardStore';
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
  
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const getProgressClass = (used: number, limit: number) => {
    if (limit === 0) return styles.high;
    const pct = (used / limit) * 100;
    if (pct >= 80) return styles.high;
    if (pct >= 50) return styles.medium;
    return styles.low;
  };

  // Filtrar proveedores
  const filteredProviders = providers.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.providerName.toLowerCase().includes(term) || 
           p.email.toLowerCase().includes(term);
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return u.coupleNames.toLowerCase().includes(term) || 
           u.email.toLowerCase().includes(term);
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
                      <th>Leads (Usados / Límite)</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProviders.map(provider => {
                      const used = provider.leadsUsed ?? 0;
                      const limit = provider.leadLimit ?? 10;
                      const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

                      return (
                        <tr key={provider.id}>
                          <td>
                            <div className={styles.cellPrimary}>{provider.providerName}</div>
                            <div className={styles.cellSecondary}>{provider.email}</div>
                          </td>
                          <td>{provider.categories.map(getCategoryLabel).join(', ')}</td>
                          <td>{getRegionLabel(provider.workRegion)}</td>
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
                              <button
                                className={styles.actionBtn}
                                onClick={() => handleEditLeads(provider)}
                                title="Editar límite de leads"
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
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className={styles.cellPrimary}>{user.coupleNames}</div>
                        </td>
                        <td>
                          <div className={styles.cellSecondary}>{user.email}</div>
                          <div className={styles.cellSecondary}>{user.phone}</div>
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
                    ))}
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
              <h3 className={styles.modalTitle}>Editar Límite de Leads</h3>
              <button className={styles.modalClose} onClick={() => setIsEditModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <Info />
                <p>
                  <strong>{selectedProvider.providerName}</strong><br />
                  Leads usados: {selectedProvider.leadsUsed ?? 0} de {selectedProvider.leadLimit ?? 10}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nuevo límite de leads</label>
                <div className={styles.leadEditContainer}>
                  <input
                    type="number"
                    min="0"
                    className={styles.leadEditInput}
                    value={newLeadLimit}
                    onChange={(e) => setNewLeadLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className={styles.leadEditLabel}>leads máximos</span>
                </div>
              </div>

              {newLeadLimit < (selectedProvider.leadsUsed ?? 0) && (
                <div className={styles.infoBox} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <AlertTriangle style={{ color: '#ef4444' }} />
                  <p style={{ color: '#ef4444' }}>
                    El nuevo límite es menor que los leads ya usados. 
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
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
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
                <div className={styles.leadList}>
                  {providerLeads.map(lead => (
                    <div key={lead.id} className={styles.leadItem}>
                      <div className={styles.leadItemInfo}>
                        <div className={styles.leadItemName}>
                          {lead.userInfo?.coupleNames || 'Usuario'}
                        </div>
                        <div className={styles.leadItemMeta}>
                          {lead.userInfo?.eventDate || 'Sin fecha'} • {getRegionLabel(lead.userInfo?.region || '')}
                        </div>
                      </div>
                      <div className={styles.leadItemScore}>
                        {lead.matchScore}%
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Modal: Ver Matches del Usuario (3 proveedores asignados) */}
      {isViewUserMatchesModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setIsViewUserMatchesModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
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
                <div className={styles.leadList}>
                  {userMatches.map(match => (
                    <div key={match.id} className={styles.leadItem}>
                      <div className={styles.leadItemInfo}>
                        <div className={styles.leadItemName}>
                          {match.providerInfo?.providerName || 'Proveedor'}
                        </div>
                        <div className={styles.leadItemMeta}>
                          {getCategoryLabel(match.category)} • {match.providerInfo?.priceRange || ''}
                        </div>
                      </div>
                      <div className={styles.leadItemScore}>
                        {match.matchScore}%
                      </div>
                    </div>
                  ))}
                </div>
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
