import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Hash, 
  Package, 
  Sliders, 
  ShieldCheck, 
  Bell, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ShoppingCart
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import Pos from './Pos';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, fetchUser, logout } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer toggle
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Deteksi Role User (default: 'kasir' jika tidak didefinisikan)
  const userRole = user?.role?.name?.toLowerCase() || user?.role || 'kasir';
  const isKasir = userRole === 'kasir' || userRole === 'cashier';

  // Responsive Window Resize Handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [openGroups, setOpenGroups] = useState({
    transactions: true,
    stock: true,
    userManagement: true,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      await logout();
      navigate('/login');
    }
  };

  // Theme Schema
  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f4f5f7',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    inputBg: isDarkMode ? '#1c1c28' : '#f8fafc',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#1e293b',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    menuActiveBg: isDarkMode ? '#181824' : '#eff6ff',
    menuActiveText: '#2563eb',
    badgeBg: isDarkMode ? '#1e293b' : '#dbeafe',
  };

  const chartData = [
    { date: '01 Feb', profit: 60000 },
    { date: '02 Feb', profit: 180000 },
    { date: '03 Feb', profit: 0 },
    { date: '04 Feb', profit: 270000 },
    { date: '05 Feb', profit: 220000 },
    { date: '06 Feb', profit: 70000 },
    { date: '07 Feb', profit: 40000 },
    { date: '08 Feb', profit: 130000 },
    { date: '09 Feb', profit: 0 },
    { date: '10 Feb', profit: 120000 },
    { date: '11 Feb', profit: 90000 },
    { date: '12 Feb', profit: 290000 },
    { date: '13 Feb', profit: 130000 },
    { date: '14 Feb', profit: 160000 },
    { date: '15 Feb', profit: 0 },
    { date: '16 Feb', profit: 0 },
    { date: '17 Feb', profit: 240000 },
    { date: '18 Feb', profit: 190000 },
    { date: '19 Feb', profit: 290000 },
    { date: '20 Feb', profit: 0 },
    { date: '21 Feb', profit: 70000 },
  ];

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bg, color: theme.textPrimary }}>
      {/* Top Navbar */}
      <header style={{ ...styles.header, backgroundColor: theme.bg, borderColor: theme.border }}>
        <div style={styles.headerLeft}>
          {/* Hamburger Menu Toggle (Terlihat saat Mobile) */}
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              style={{ ...styles.iconBtn, backgroundColor: 'transparent', border: 'none', color: theme.textPrimary }}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
          <span style={{ ...styles.brandTitle, color: theme.textPrimary }}>
            Cashier System {isKasir && <span style={styles.roleBadge}>Kasir</span>}
          </span>
        </div>

        <div style={styles.headerRight}>
          {/* Light/Dark Mode Switch */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            style={{ ...styles.iconBtn, backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textSecondary }}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Notifikasi */}
          <div style={styles.notificationBox}>
            <Bell size={18} color={theme.textSecondary} />
            <span style={styles.notifBadge}>0</span>
          </div>

          {/* User Avatar */}
          <div style={styles.userAvatar}>
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || (isKasir ? 'Kasir' : 'Admin')}&background=2563eb&color=fff`} 
              alt="Profile" 
              style={styles.avatarImg} 
            />
          </div>
        </div>
      </header>

      <div style={styles.bodyWrapper}>
        {/* Overlay Background Saat Sidebar Terbuka di Mobile */}
        {isMobile && sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            style={styles.mobileOverlay} 
          />
        )}

        {/* Sidebar Navigasi */}
        <aside style={{
          ...styles.sidebar,
          backgroundColor: theme.bg,
          borderColor: theme.border,
          ...(isMobile ? {
            position: 'fixed',
            top: '56px',
            left: sidebarOpen ? 0 : '-260px',
            bottom: 0,
            zIndex: 99,
            width: '240px',
            transition: 'left 0.3s ease',
            boxShadow: sidebarOpen ? '4px 0 15px rgba(0,0,0,0.3)' : 'none',
          } : {})
        }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Main Menu Item */}
            <button
              onClick={() => { setActiveMenu('dashboard'); if(isMobile) setSidebarOpen(false); }}
              style={{
                ...styles.menuItem,
                backgroundColor: activeMenu === 'dashboard' ? theme.menuActiveBg : 'transparent',
                color: activeMenu === 'dashboard' ? theme.menuActiveText : theme.textSecondary,
              }}
            >
              <div style={styles.menuLabel}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
            </button>

            {/* JIKA USER ADALAH KASIR: TAMPILKAN MENU KASIR SAJA */}
            {isKasir ? (
              <div style={styles.groupContainer}>
                <div style={{ ...styles.groupHeader, color: theme.textSecondary }}>
                  <span>Menu Kasir</span>
                </div>
                
                <button
                  onClick={() => { setActiveMenu('pos'); if(isMobile) setSidebarOpen(false); }}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: activeMenu === 'pos' ? theme.menuActiveBg : 'transparent',
                    color: activeMenu === 'pos' ? theme.menuActiveText : theme.textSecondary,
                  }}
                >
                  <div style={styles.menuLabel}><ShoppingCart size={16} /><span>Mesin Kasir (POS)</span></div>
                </button>

                <button
                  onClick={() => { setActiveMenu('orders'); if(isMobile) setSidebarOpen(false); }}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: activeMenu === 'orders' ? theme.menuActiveBg : 'transparent',
                    color: activeMenu === 'orders' ? theme.menuActiveText : theme.textSecondary,
                  }}
                >
                  <div style={styles.menuLabel}><ShoppingBag size={16} /><span>Orders</span></div>
                  <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>252</span>
                </button>

                <button
                  onClick={() => { setActiveMenu('customers'); if(isMobile) setSidebarOpen(false); }}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: activeMenu === 'customers' ? theme.menuActiveBg : 'transparent',
                    color: activeMenu === 'customers' ? theme.menuActiveText : theme.textSecondary,
                  }}
                >
                  <div style={styles.menuLabel}><Users size={16} /><span>Customers</span></div>
                  <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>50</span>
                </button>
              </div>
            ) : (
              /* JIKA USER BUKAN KASIR (ADMIN): TAMPILKAN SELURUH MENU */
              <>
                {/* Transactions */}
                <div style={styles.groupContainer}>
                  <div style={{ ...styles.groupHeader, color: theme.textSecondary }} onClick={() => toggleGroup('transactions')}>
                    <span>Transactions</span>
                    {openGroups.transactions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {openGroups.transactions && (
                    <div style={styles.groupItems}>
                      <button
                        onClick={() => { setActiveMenu('customers'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'customers' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'customers' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><Users size={16} /><span>Customers</span></div>
                        <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>50</span>
                      </button>

                      <button
                        onClick={() => { setActiveMenu('orders'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'orders' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'orders' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><ShoppingBag size={16} /><span>Orders</span></div>
                        <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>252</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div style={styles.groupContainer}>
                  <div style={{ ...styles.groupHeader, color: theme.textSecondary }} onClick={() => toggleGroup('stock')}>
                    <span>Stock</span>
                    {openGroups.stock ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {openGroups.stock && (
                    <div style={styles.groupItems}>
                      <button
                        onClick={() => { setActiveMenu('categories'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'categories' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'categories' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><Hash size={16} /><span>Categories</span></div>
                        <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>10</span>
                      </button>

                      <button
                        onClick={() => { setActiveMenu('products'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'products' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'products' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><Package size={16} /><span>Products</span></div>
                        <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>30</span>
                      </button>

                      <button
                        onClick={() => { setActiveMenu('stock-adjustments'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'stock-adjustments' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'stock-adjustments' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><Sliders size={16} /><span>Stock Adjustments</span></div>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Management */}
                <div style={styles.groupContainer}>
                  <div style={{ ...styles.groupHeader, color: theme.textSecondary }} onClick={() => toggleGroup('userManagement')}>
                    <span>User Management</span>
                    {openGroups.userManagement ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {openGroups.userManagement && (
                    <div style={styles.groupItems}>
                      <button
                        onClick={() => { setActiveMenu('users'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'users' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'users' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><Users size={16} /><span>Users</span></div>
                        <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>3</span>
                      </button>

                      <button
                        onClick={() => { setActiveMenu('roles'); if(isMobile) setSidebarOpen(false); }}
                        style={{
                          ...styles.menuItem,
                          backgroundColor: activeMenu === 'roles' ? theme.menuActiveBg : 'transparent',
                          color: activeMenu === 'roles' ? theme.menuActiveText : theme.textSecondary,
                        }}
                      >
                        <div style={styles.menuLabel}><ShieldCheck size={16} /><span>Roles</span></div>
                        <span style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>1</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Tombol Logout */}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: '500' }}>Logout</span>
          </button>
        </aside>

        {/* Workspace Main Content */}
        <main style={{ ...styles.mainContent, backgroundColor: theme.bg, padding: isMobile ? '15px' : '25px 30px' }}>
            {activeMenu === 'pos' ? (
                <Pos isDarkMode={isDarkMode} />
            ) : (
                <>
                <h1 style={{ ...styles.pageTitle, color: theme.textPrimary }}>
                    {isKasir ? 'Panel Kasir' : 'Dashboard'}
                </h1>
                {/* Isi Dashboard & Chart sebelumnya */}
                </>
            )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',            // Menggantikan 100vw untuk mencegah overflow scroll
    maxWidth: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  header: {
    height: '56px',
    borderBottom: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 15px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  roleBadge: {
    fontSize: '11px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '8px',
    fontWeight: 'normal',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBtn: {
    border: '1px solid',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBox: {
    position: 'relative',
    cursor: 'pointer',
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-6px',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '10px',
    borderRadius: '50%',
    width: '14px',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bodyWrapper: {
    display: 'flex',
    flex: 1,
    width: '100%',
    position: 'relative',
    overflowX: 'hidden',
  },
  sidebar: {
    width: '230px',
    minWidth: '230px',        // Kunci lebar sidebar agar tidak gepeng
    borderRight: '1px solid',
    padding: '15px 10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  mobileOverlay: {
    position: 'fixed',
    top: '56px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 90,
  },
  groupContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '10px',
  },
  groupHeader: {
    fontSize: '11px',
    fontWeight: '500',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  menuLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    color: '#2563eb',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '15px',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,              // Wajib ada agar Recharts / Flexbox tidak meluapkan layout ke samping
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    boxSizing: 'border-box',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    margin: 0,
  },
  filterCard: {
    borderRadius: '8px',
    padding: '16px 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    border: '1px solid',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
  },
  filterSelect: {
    border: '1px solid',
    padding: '8px 12px',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
  },
  filterInput: {
    border: '1px solid',
    padding: '8px 12px',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  metricCard: {
    borderRadius: '8px',
    padding: '18px 20px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metricTitle: {
    fontSize: '13px',
  },
  metricValue: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  metricSub: {
    fontSize: '11px',
  },
  chartCard: {
    borderRadius: '8px',
    padding: '15px 20px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    minWidth: 0,              // Cegah Recharts memaksa ukuran card melebar
    boxSizing: 'border-box',
  },
  chartTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: 0,
  },
  chartLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  legendBox: {
    width: '12px',
    height: '12px',
    backgroundColor: '#10b981',
    borderRadius: '2px',
  },
};

export default Dashboard;