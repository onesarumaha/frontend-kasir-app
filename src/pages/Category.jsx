import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Folder 
} from 'lucide-react';
import api from '../api';
import { showToast, showConfirmDialog } from '../utils/sweetalert';

const Category = () => {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  // States Data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });

  // States Form Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: ''
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
    fetchCategories(page, search);
  }, [page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchCategories(1, val);
  };

  const fetchCategories = async (pageNum = 1, searchQuery = search) => {
    setLoading(true);
    try {
      let url = `/categories?page=${pageNum}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      const resData = res.data;

      // Mendukung response pagination Laravel atau array biasa
      const dataArray = resData.data || resData || [];
      setCategories(Array.isArray(dataArray) ? dataArray : []);

      const meta = resData.meta || resData;
      setPagination({
        currentPage: meta.current_page || pageNum,
        lastPage: meta.last_page || 1,
        total: meta.total || (Array.isArray(dataArray) ? dataArray.length : 0),
      });
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedId(null);
    setFormData({
      name: '',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setIsEdit(true);
    setSelectedId(category.id);
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEdit) {
        await api.put(`/categories/${selectedId}`, formData);
        showToast('success', 'Kategori berhasil diperbarui!');
      } else {
        await api.post('/categories', formData);
        showToast('success', 'Kategori berhasil ditambahkan!');
      }
      setShowModal(false);
      fetchCategories(page, search);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan kategori!');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirmDialog(
      'Hapus Kategori?',
      `Apakah Anda yakin ingin menghapus kategori "${name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}`);
      showToast('success', 'Kategori berhasil dihapus!');
      fetchCategories(page, search);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus kategori!');
    }
  };

  return (
    <div style={{ padding: '15px', color: theme.textPrimary, backgroundColor: theme.bg, minHeight: 'calc(100vh - 85px)' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2 
            style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#1e293b'
            }}
          >
            Manajemen Kategori
          </h2>
          <span style={{ fontSize: '12px', color: theme.textSecondary }}>Kelola kelompok dan kategori produk toko Anda</span>
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
            cursor: 'pointer'
          }}
        >
          <Plus size={14} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border, marginBottom: '15px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
          <Search size={14} color={theme.textSecondary} />
          <input
            type="text"
            placeholder="Cari nama kategori..."
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
                <th style={{ ...styles.th, width: '60px', textAlign: 'center' }}>#</th>
                <th style={styles.th}>Nama Kategori</th>
                <th style={styles.th}>Deskripsi</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>Memuat data kategori...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>
                    Data kategori tidak ditemukan.
                  </td>
                </tr>
              ) : (
                categories.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ ...styles.td, textAlign: 'center', color: theme.textSecondary }}>
                      {(page - 1) * 10 + (idx + 1)}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Folder size={16} color="#2563eb" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: theme.textSecondary }}>
                      {item.description || '-'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          style={{ ...styles.actionBtn, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}
                          title="Edit Kategori"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          style={{ ...styles.actionBtn, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                          title="Hapus Kategori"
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
              Halaman <b style={{ color: theme.textPrimary }}>{pagination.currentPage}</b> dari <b style={{ color: theme.textPrimary }}>{pagination.lastPage}</b> (Total {pagination.total} Kategori)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ ...styles.pageBtn, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.lastPage, p + 1))}
                disabled={page === pagination.lastPage}
                style={{ ...styles.pageBtn, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM CREATE / EDIT */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: `1px solid ${theme.border}`, marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                {isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Nama Kategori *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Makanan, Minuman, Elektronik"
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  required
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Keterangan / Deskripsi</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Keterangan singkat kategori..."
                  style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary, width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textPrimary, cursor: 'pointer', fontSize: '12px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
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
  card: {
    borderRadius: '8px',
    border: '1px solid',
  },
  th: {
    padding: '10px 12px',
    fontWeight: '600',
  },
  td: {
    padding: '10px 12px',
  },
  actionBtn: {
    border: 'none',
    width: '26px',
    height: '26px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '11px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalContent: {
    width: '400px',
    maxWidth: '90%',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    marginBottom: '4px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '11px',
    outline: 'none',
    boxSizing: 'border-box',
  },
};

export default Category;