import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.outerContainer}>
      <style>{responsiveCSS}</style>

      <div style={styles.card} className="responsive-card">
        {/* Sisi Kiri / Atas: Form Register */}
        <div style={styles.formSection}>
          <h2 style={styles.title}>Register</h2>
          <p style={styles.subtitle}>Buat Akun Kasir Baru</p>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <div style={styles.iconBox}><User color="#666" size={16} /></div>
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.iconBox}><Mail color="#666" size={16} /></div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.iconBox}><Lock color="#666" size={16} /></div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.iconBox}><Lock color="#666" size={16} /></div>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi Password"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'DAFTAR'}
            </button>
          </form>

          <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            Sudah punya akun? <Link to="/login" style={{ color: '#29a3dd', fontWeight: 'bold' }}>Login</Link>
          </p>
        </div>

        {/* Sisi Kanan / Bawah: Banner Biru */}
        <div style={styles.bannerSection} className="banner-hide-mobile">
          <h3 style={styles.bannerTitle}>APLIKASI KASIR</h3>
          
          <div style={{ margin: '15px 0' }}>
            <svg width="150" height="120" viewBox="0 0 200 180" fill="none">
              <rect x="25" y="85" width="150" height="85" rx="4" fill="#E53935" />
              <rect x="80" y="110" width="40" height="20" rx="10" fill="#FFFFFF" />
              <rect x="70" y="55" width="60" height="35" rx="3" fill="#212121" />
              <rect x="75" y="60" width="50" height="25" fill="#42A5F5" />
              <circle cx="100" cy="28" r="16" fill="#F06292" />
              <path d="M84 44 C84 40, 116 40, 116 44 L120 70 L80 70 Z" fill="#2E7D32" />
            </svg>
          </div>

          <p style={styles.bannerText}>Daftarkan akun kasir anda di sini!</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    fontFamily: 'Arial, sans-serif',
    padding: '15px',
    boxSizing: 'border-box',
  },
  card: {
    display: 'flex',
    width: '720px',
    maxWidth: '100%',
    minHeight: '380px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  formSection: {
    flex: 1,
    padding: '30px 25px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    color: '#333',
    fontWeight: 'normal',
  },
  subtitle: {
    margin: '5px 0 20px 0',
    fontSize: '12px',
    color: '#888',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '8px',
    fontSize: '12px',
    borderRadius: '3px',
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e0e0e0',
    borderRadius: '2px',
  },
  iconBox: {
    padding: '8px 10px',
    backgroundColor: '#f5f5f5',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '8px 10px',
    fontSize: '13px',
    width: '100%',
  },
  button: {
    marginTop: '10px',
    alignSelf: 'flex-start',
    backgroundColor: '#29a3dd',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '2px',
    width: '100%',
  },
  bannerSection: {
    flex: 1,
    backgroundColor: '#29a3dd',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '25px',
    textAlign: 'center',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '18px',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  bannerText: {
    margin: 0,
    fontSize: '12px',
    opacity: 0.9,
  },
};

const responsiveCSS = `
  @media (max-width: 640px) {
    .responsive-card {
      flex-direction: column-reverse !important;
      min-height: auto !important;
    }
    .banner-hide-mobile {
      padding: 20px !important;
    }
  }
`;

export default Register;