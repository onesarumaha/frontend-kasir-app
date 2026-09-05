import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, ChevronLeft, ChevronRight, X, Store, CheckCircle, XCircle, Upload } from 'lucide-react';
import api from '../api';
import { showToast, showConfirmDialog } from '../utils/sweetalert';

const Tenants = () => {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  // States
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
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
    bg: isDarkMode ? '#0d0d11' : '#f4f5f7',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#1e293b',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? '#1c1c28' : '#f8fafc',
    tableHeaderBg: isDarkMode ? '#1a1a26' : '#f1f5f9',
  };

  useEffect(() => {
    fetchTenants(page, search);
  }, [page]);

  const fetchTenants = async (pageNum = 1, searchQuery = search) => {
    setLoading(true);
    try {
      let url = `/tenants?page=${pageNum}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      const resData = res.data;

      setTenants(resData.data || []);
      setPagination({
        currentPage: resData.meta?.current_page || pageNum,
        lastPage: resData.meta?.last_page || 1,
        total: resData.meta?.total || 0,
      });
    } catch (err) {
      showToast('error', 'Gagal mengambil data master tenant!');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchTenants(1, val);
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

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedId(null);
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      footer_receipt_text: 'Terima kasih telah berbelanja!',
    });
    setShowModal(true);
  };

  const openEditModal = (tenant) => {
    setIsEdit(true);
    setSelectedId(tenant.id);
    setLogoFile(null);
    setLogoPreview(tenant.logo || null);
    setFormData({
      name: tenant.name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      footer_receipt_text: tenant.footer_receipt_text || 'Terima kasih telah berbelanja!',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

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
      if (isEdit) {
        await api.post(`/tenants/${selectedId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('success', 'Data tenant berhasil diperbarui!');
      } else {
        await api.post('/tenants', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('success', 'Tenant baru berhasil ditambahkan!');
      }
      setShowModal(false);
      fetchTenants(page, search);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan data tenant!');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/tenants/${id}/toggle-status`);
      showToast('success', `Status tenant berhasil ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}!`);
      fetchTenants(page, search);
    } catch (err) {
      showToast('error', 'Gagal mengubah status tenant!');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirmDialog(
      'Hapus Tenant?',
      `Apakah Anda yakin ingin menghapus tenant "${name}"?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/tenants/${id}`);
      showToast('success', 'Tenant berhasil dihapus!');
      fetchTenants(page, search);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus tenant!');
    }
  };

  return (
    <div style={{ padding: '15px', color: theme.textPrimary, backgroundColor: theme.bg, minHeight: 'calc(100vh - 85px)' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#1e293b' }}>
            Master Tenant (Kelola Seluruh Toko)
          </h2>
          <span style={{ fontSize: '12px', color: theme.textSecondary }}>Modul khusus Superadmin untuk manajemen tenant</span>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          <span>Tambah Tenant</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border, marginBottom: '15px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
          <Search size={14} color={theme.textSecondary} />
          <input
            type="text"
            placeholder="Cari nama tenant atau email..."
            value={search}
            onChange={handleSearchChange}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', color: theme.textPrimary, fontSize: '12px', width: '100%' }}
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
                <th style={{ ...styles.th, width: '50px', textAlign: 'center' }}>#</th>
                <th style={{ ...styles.th, width: '60px' }}>Logo</th>
                <th style={styles.th}>Nama Tenant</th>
                <th style={styles.th}>Kontak</th>
                <th style={styles.th}>Alamat</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>Memuat data tenant...</td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>Tenant tidak ditemukan.</td>
                </tr>
              ) : (
                tenants.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ ...styles.td, textAlign: 'center', color: theme.textSecondary }}>
                      {(page - 1) * 10 + (idx + 1)}
                    </td>
                    <td style={styles.td}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', border: `1px solid ${theme.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.inputBg }}>
                        {item.logo ? (
                          <img src={item.logo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Store size={18} color={theme.textSecondary} />
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                      {item.name}
                      <div style={{ fontSize: '10px', color: theme.textSecondary, fontWeight: 'normal' }}>{item.slug}</div>
                    </td>
                    <td style={{ ...styles.td, color: theme.textSecondary }}>
                      <div>{item.email || '-'}</div>
                      <div style={{ fontSize: '10px' }}>{item.phone || '-'}</div>
                    </td>
                    <td style={{ ...styles.td, color: theme.textSecondary, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.address || '-'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(item.id, item.is_active)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          backgroundColor: item.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.is_active ? '#10b981' : '#ef4444',
                        }}
                      >
                        {item.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          style={{ ...styles.actionBtn, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}
                          title="Edit Tenant"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          style={{ ...styles.actionBtn, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                          title="Hapus Tenant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {pagination.lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '11px', color: theme.textSecondary }}>
              Halaman <b style={{ color: theme.textPrimary }}>{pagination.currentPage}</b> dari <b style={{ color: theme.textPrimary }}>{pagination.lastPage}</b> (Total {pagination.total} Tenant)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}>
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <button onClick={() => setPage((p) => Math.min(pagination.lastPage, p + 1))} disabled={page === pagination.lastPage} style={{ ...styles.pageBtn, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}>
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREATE / EDIT */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: `1px solid ${theme.border}`, marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                {isEdit ? 'Edit Tenant' : 'Tambah Tenant Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* UPLOAD LOGO */}
              <div style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '6px',
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
                    <img src={logoPreview} alt="Preview Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Store size={24} color={theme.textSecondary} />
                  )}
                </div>
                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Logo Tenant</label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    <Upload size={12} />
                    <span>{logoFile ? 'Ganti Logo' : 'Upload Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Nama Tenant / Toko *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Alamat Lengkap</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Teks Footer Struk Nota</label>
                <input
                  type="text"
                  name="footer_receipt_text"
                  value={formData.footer_receipt_text}
                  onChange={handleInputChange}
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textPrimary, cursor: 'pointer', fontSize: '11px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { borderRadius: '8px', border: '1px solid' },
  th: { padding: '10px 12px', fontWeight: '600' },
  td: { padding: '10px 12px' },
  actionBtn: { border: 'none', width: '26px', height: '26px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  pageBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', border: '1px solid', fontSize: '11px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modalContent: { width: '450px', maxWidth: '90%', padding: '16px', borderRadius: '8px', border: '1px solid' },
  label: { display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: '500' },
  input: { width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid', fontSize: '11px', outline: 'none', boxSizing: 'border-box' },
};

export default Tenants;