import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f4f5f7',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#1e293b',
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: theme.bg,
        color: theme.textPrimary,
      }}
    >
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div style={styles.bodyWrapper}>
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={styles.mobileOverlay}
          />
        )}

        <Sidebar
          isDarkMode={isDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        <main
          style={{
            ...styles.mainContent,
            backgroundColor: theme.bg,
            padding: isMobile ? '15px' : '25px 30px',
          }}
        >
          <Outlet context={{ isDarkMode }} />
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh', // Kunci tinggi layar tepat seukuran viewport browser
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Matikan scrollbar seluruh halaman/window
  },

  bodyWrapper: {
    display: 'flex',
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden', // Mencegah pemicu scroll luar
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

  mainContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    boxSizing: 'border-box',
    overflowY: 'auto', 
  },
};

export default MainLayout;