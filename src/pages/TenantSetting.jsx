import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Store, Upload, Save, Building2, Mail, Phone, MapPin, FileText, Receipt } from 'lucide-react';
import api from '../api';
import { showToast } from '../utils/sweetalert';

const TenantSetting = () => {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    footer_receipt_text: 'Terima kasih telah berbelanja!',
  });

  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f8fafc',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#0f172a',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? '#1c1c28' : '#f1f5f9',
    previewBg: isDarkMode ? '#1a1a26' : '#fafafa',
  };

  useEffect(() => {
    fetchTenantProfile();
  }, []);

  const fetchTenantProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/profile');
      const data = res.data.data;

      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          footer_receipt_text: data.footer_receipt_text || 'Terima kasih telah berbelanja!',
        });
        setLogoPreview(data.logo || null);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal memuat profil toko!');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email || '');
    submitData.append('phone', formData.phone || '');
    submitData.append('address', formData.address || '');
    submitData.append('footer_receipt_text', formData.footer_receipt_text || '');

    if (logoFile) {
      submitData.append('logo', logoFile);
    }

    try {
      await api.post('/tenant/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('success', 'Profil toko berhasil diperbarui!');
      fetchTenantProfile();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal memperbarui profil toko!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px', color: theme.textSecondary, textAlign: 'center', fontSize: '13px' }}>
        Memuat profil toko...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: theme.textPrimary, backgroundColor: theme.bg, minHeight: 'calc(100vh - 80px)' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: theme.textPrimary }}>Profil Toko</h2>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: theme.textSecondary }}>
          Pengaturan identitas toko dan tampilan nota fisik
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        
        {/* FORM SETTING (KIRI) */}
        <form onSubmit={handleSubmit}>
          <div style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border, padding: '20px' }}>
            
            {/* UPLOAD LOGO */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...styles.label, color: theme.textSecondary }}>
                <Store size={14} />
                <span>Logo Toko</span>
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '8px',
                    border: `1px dashed ${theme.border}`,
                    backgroundColor: theme.inputBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Store size={28} color={theme.textSecondary} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      width: 'fit-content',
                    }}
                  >
                    <Upload size={14} />
                    <span>{logoFile ? 'Ganti File' : 'Upload Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                  </label>
                  <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                    Format: JPG, PNG, WEBP (Maksimal 2MB)
                  </span>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${theme.border}`, margin: '18px 0' }} />

            {/* INPUT FIELD DATA TOKO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ ...styles.label, color: theme.textSecondary }}>
                  <Building2 size={13} />
                  <span>Nama Toko *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>
                    <Mail size={13} />
                    <span>Email Toko</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>
                    <Phone size={13} />
                    <span>No. Telepon / WA</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  />
                </div>
              </div>

              <div>
                <label style={{ ...styles.label, color: theme.textSecondary }}>
                  <MapPin size={13} />
                  <span>Alamat Toko</span>
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ ...styles.label, color: theme.textSecondary }}>
                  <FileText size={13} />
                  <span>Teks Footer Struk (Nota)</span>
                </label>
                <input
                  type="text"
                  name="footer_receipt_text"
                  value={formData.footer_receipt_text}
                  onChange={handleInputChange}
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <Save size={14} />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Profil'}</span>
              </button>
            </div>

          </div>
        </form>

        <div style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', color: theme.textSecondary, fontSize: '12px', fontWeight: 'bold' }}>
            <Receipt size={15} />
            <span>Simulasi Struk Nota</span>
          </div>

          <div
            style={{
              backgroundColor: theme.previewBg,
              border: `1px dashed ${theme.border}`,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: theme.textPrimary,
            }}
          >
            {/* Logo Struk */}
            {logoPreview ? (
              <img src={logoPreview} alt="Preview Logo" style={{ height: '40px', objectFit: 'contain', marginBottom: '8px' }} />
            ) : (
              <Store size={30} style={{ margin: '0 auto 8px', color: theme.textSecondary }} />
            )}

            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
              {formData.name || 'Nama Toko Anda'}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '10px', marginBottom: '2px' }}>
              {formData.address || 'Alamat Toko'}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '10px', marginBottom: '10px' }}>
              {formData.phone ? `Telp: ${formData.phone}` : ''}
            </div>

            <div style={{ borderBottom: `1px dashed ${theme.border}`, margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', textAlign: 'left' }}>
              <span>Item A x1</span>
              <span>15.000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', textAlign: 'left' }}>
              <span>Item B x2</span>
              <span>20.000</span>
            </div>

            <div style={{ borderBottom: `1px dashed ${theme.border}`, margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px' }}>
              <span>TOTAL</span>
              <span>35.000</span>
            </div>

            <div style={{ borderBottom: `1px dashed ${theme.border}`, margin: '8px 0' }} />

            <div style={{ fontSize: '10px', marginTop: '10px', color: theme.textSecondary, fontStyle: 'italic' }}>
              {formData.footer_receipt_text || 'Terima kasih telah berbelanja!'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  card: { borderRadius: '8px', border: '1px solid' },
  label: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginBottom: '6px', fontWeight: '600' },
  input: { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
};

export default TenantSetting;