import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, Users, ShoppingBag, Hash, Package, 
  ChevronDown, ChevronUp, LogOut, ShoppingCart, Store, ShieldCheck 
} from 'lucide-react';

const Sidebar = ({ isDarkMode, sidebarOpen, setSidebarOpen, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Deteksi Role
  const userRole = user?.role?.name?.toLowerCase() || user?.role || 'kasir';
  const isKasir = userRole === 'kasir' || userRole === 'cashier';
  const isSuperAdmin = userRole === 'superadmin';

  const [openGroups, setOpenGroups] = useState({
    transactions: true,
    stock: true,
    management: true,
  });

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const navTo = (path) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f4f5f7',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    menuActiveBg: isDarkMode ? '#181824' : '#eff6ff',
    menuActiveText: '#2563eb',
    badgeBg: isDarkMode ? '#1e293b' : '#dbeafe',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={{
      ...styles.sidebar,
      backgroundColor: theme.bg,
      borderColor: theme.border,
      ...(isMobile ? {
        position: 'fixed',
        top: '56px',
        left: sidebarOpen ? 0 : '-260px',
        height: 'calc(100vh - 56px)',
        zIndex: 99,
        width: '240px',
        transition: 'left 0.3s ease',
        boxShadow: sidebarOpen ? '4px 0 15px rgba(0,0,0,0.3)' : 'none',
      } : {
        height: '100vh',
        position: 'sticky',
        top: 0,
      })
    }}>
      {/* Container utama menu scrollable */}
      <div style={styles.menuContainer}>
        <button
          onClick={() => navTo('/dashboard')}
          style={{
            ...styles.menuItem,
            backgroundColor: isActive('/dashboard') ? theme.menuActiveBg : 'transparent',
            color: isActive('/dashboard') ? theme.menuActiveText : theme.textSecondary,
          }}
        >
          <div style={styles.menuLabel}><LayoutDashboard size={18} /><span>Dashboard</span></div>
        </button>

        {isKasir ? (
          <div style={styles.groupContainer}>
            <div style={{ ...styles.groupHeader, color: theme.textSecondary }}><span>Menu Kasir</span></div>
            <button
              onClick={() => navTo('/pos')}
              style={{
                ...styles.menuItem,
                backgroundColor: isActive('/pos') ? theme.menuActiveBg : 'transparent',
                color: isActive('/pos') ? theme.menuActiveText : theme.textSecondary,
              }}
            >
              <div style={styles.menuLabel}><ShoppingCart size={16} /><span>Mesin Kasir (POS)</span></div>
            </button>
            <button
              onClick={() => navTo('/orders')}
              style={{
                ...styles.menuItem,
                backgroundColor: isActive('/orders') ? theme.menuActiveBg : 'transparent',
                color: isActive('/orders') ? theme.menuActiveText : theme.textSecondary,
              }}
            >
              <div style={styles.menuLabel}><ShoppingBag size={16} /><span>Orders</span></div>
            </button>
          </div>
        ) : (
          <>
            {/* GRUP TRANSAKSI */}
            <div style={styles.groupContainer}>
              <div style={{ ...styles.groupHeader, color: theme.textSecondary }} onClick={() => toggleGroup('transactions')}>
                <span>Transactions</span>
                {openGroups.transactions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {openGroups.transactions && (
                <div style={styles.groupItems}>
                  <button onClick={() => navTo('/customers')} style={{ ...styles.menuItem, backgroundColor: isActive('/customers') ? theme.menuActiveBg : 'transparent', color: isActive('/customers') ? theme.menuActiveText : theme.textSecondary }}>
                    <div style={styles.menuLabel}><Users size={16} /><span>Customers</span></div>
                  </button>
                  <button onClick={() => navTo('/orders')} style={{ ...styles.menuItem, backgroundColor: isActive('/orders') ? theme.menuActiveBg : 'transparent', color: isActive('/orders') ? theme.menuActiveText : theme.textSecondary }}>
                    <div style={styles.menuLabel}><ShoppingBag size={16} /><span>Orders</span></div>
                  </button>
                </div>
              )}
            </div>

            {/* GRUP STOK & PRODUK */}
            <div style={styles.groupContainer}>
              <div style={{ ...styles.groupHeader, color: theme.textSecondary }} onClick={() => toggleGroup('stock')}>
                <span>Stock</span>
                {openGroups.stock ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {openGroups.stock && (
                <div style={styles.groupItems}>
                  <button onClick={() => navTo('/category')} style={{ ...styles.menuItem, backgroundColor: isActive('/category') ? theme.menuActiveBg : 'transparent', color: isActive('/category') ? theme.menuActiveText : theme.textSecondary }}>
                    <div style={styles.menuLabel}><Hash size={16} /><span>Categories</span></div>
                  </button>
                  <button onClick={() => navTo('/products')} style={{ ...styles.menuItem, backgroundColor: isActive('/products') ? theme.menuActiveBg : 'transparent', color: isActive('/products') ? theme.menuActiveText : theme.textSecondary }}>
                    <div style={styles.menuLabel}><Package size={16} /><span>Products</span></div>
                  </button>
                </div>
              )}
            </div>

            {/* GRUP MANAJEMEN & TOKO */}
            <div style={styles.groupContainer}>
              <div style={{ ...styles.groupHeader, color: theme.textSecondary }} onClick={() => toggleGroup('management')}>
                <span>Management</span>
                {openGroups.management ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {openGroups.management && (
                <div style={styles.groupItems}>
                  <button onClick={() => navTo('/setting-toko')} style={{ ...styles.menuItem, backgroundColor: isActive('/setting-toko') ? theme.menuActiveBg : 'transparent', color: isActive('/setting-toko') ? theme.menuActiveText : theme.textSecondary }}>
                    <div style={styles.menuLabel}><Store size={16} /><span>Profil Toko</span></div>
                  </button>

                  {isSuperAdmin && (
                    <button onClick={() => navTo('/tenants')} style={{ ...styles.menuItem, backgroundColor: isActive('/tenants') ? theme.menuActiveBg : 'transparent', color: isActive('/tenants') ? theme.menuActiveText : theme.textSecondary }}>
                      <div style={styles.menuLabel}><ShieldCheck size={16} /><span>Master Tenants</span></div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tombol Logout */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} color="#ef4444" />
          <span style={{ color: '#ef4444', fontWeight: '500' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: { 
    width: '230px', 
    minWidth: '230px', 
    borderRight: '1px solid', 
    padding: '15px 10px', 
    display: 'flex', 
    flexDirection: 'column', 
    flexShrink: 0,
    boxSizing: 'border-box'
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%'
  },
  groupContainer: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' },
  groupHeader: { fontSize: '11px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', cursor: 'pointer' },
  groupItems: { display: 'flex', flexDirection: 'column', gap: '2px' },
  menuItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left' },
  menuLabel: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '15px' },
};

export default Sidebar;