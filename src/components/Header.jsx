import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Sun, Moon, Bell, Menu, X } from 'lucide-react';

const Header = ({ isDarkMode, setIsDarkMode, sidebarOpen, setSidebarOpen, isMobile }) => {
  const { user } = useAuthStore();
  const userRole = user?.role?.name?.toLowerCase() || user?.role || 'kasir';
  const isKasir = userRole === 'kasir' || userRole === 'cashier';

  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f4f5f7',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#1e293b',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
  };

  return (
    <header style={{ ...styles.header, backgroundColor: theme.bg, borderColor: theme.border }}>
      <div style={styles.headerLeft}>
        {isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.iconBtn}>
            {sidebarOpen ? <X size={22} color={theme.textPrimary} /> : <Menu size={22} color={theme.textPrimary} />}
          </button>
        )}
        <span style={{ ...styles.brandTitle, color: theme.textPrimary }}>
          Cashier System {isKasir && <span style={styles.roleBadge}>Kasir</span>}
        </span>
      </div>

      <div style={styles.headerRight}>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          style={{ ...styles.iconBtn, backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          {isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        <div style={styles.notificationBox}>
          <Bell size={18} color={theme.textSecondary} />
          <span style={styles.notifBadge}>0</span>
        </div>

        <div style={styles.userAvatar}>
          <img 
            src={`https://ui-avatars.com/api/?name=${user?.name || (isKasir ? 'Kasir' : 'Admin')}&background=2563eb&color=fff`} 
            alt="Profile" 
            style={styles.avatarImg} 
          />
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: { height: '56px', borderBottom: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandTitle: { fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' },
  roleBadge: { fontSize: '11px', backgroundColor: '#2563eb', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBtn: { border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notificationBox: { position: 'relative', cursor: 'pointer' },
  notifBadge: { position: 'absolute', top: '-4px', right: '-6px', backgroundColor: '#2563eb', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
};

export default Header;