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
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import api from '../api';
import { showToast, showConfirmDialog } from '../utils/sweetalert';

const Products = () => {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  // States Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Ambil URL Base dari env atau fallback ke localhost Laravel
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const getImageUrl = (product) => {
    if (!product) return null;

    // Jika backend sudah mengirim 'image_url' (lengkap dengan http/https)
    if (product.image_url) {
        return product.image_url;
    }

    // Jika backend hanya mengirim path kolom 'image' (contoh: "products/abc.jpg")
    if (product.image && typeof product.image === 'string' && !product.image.startsWith('/tmp')) {
        return `${API_BASE_URL}/storage/${product.image}`;
    }

    return null;
    };
  
  // States Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });

  // States Form Modal & Image
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    name: '',
    category_id: '',
    purchase_price: '',
    selling_price: '',
    stock: '',
    unit: 'pcs',
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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(page, search);
  }, [page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchProducts(1, val);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data || []);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const fetchProducts = async (pageNum = 1, searchQuery = search) => {
    setLoading(true);
    try {
      let url = `/products?page=${pageNum}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      const resData = res.data;

      setProducts(resData.data || []);
      const meta = resData.meta || resData;

      setPagination({
        currentPage: meta.current_page || pageNum,
        lastPage: meta.last_page || 1,
        total: meta.total || 0,
      });
    } catch (err) {
      console.error('Gagal mengambil data produk:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

const openCreateModal = () => {
    setIsEdit(false);
    setSelectedId(null);
    setImageFile(null);
    setImagePreview(null); // Reset preview gambar
    setFormData({
        code: '',
        barcode: '',
        name: '',
        category_id: categories[0]?.id || '',
        purchase_price: '',
        selling_price: '',
        stock: '',
        unit: 'pcs',
        description: ''
    });
    setShowModal(true);
    };

    const openEditModal = (product) => {
    setIsEdit(true);
    setSelectedId(product.id);
    setImageFile(null);
    
    // Set preview dari URL gambar lama di backend
    setImagePreview(getImageUrl(product));

    setFormData({
        code: product.code || '',
        barcode: product.barcode || '',
        name: product.name || '',
        category_id: product.category_id || product.category?.id || '',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        stock: product.stock || '',
        unit: product.unit || 'pcs',
        description: product.description || ''
    });
    setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach((key) => {
            submitData.append(key, formData[key]);
        });

        if (imageFile) {
            submitData.append('image', imageFile);
        }

        try {
            if (isEdit) {
            submitData.append('_method', 'PUT');
            await api.post(`/products/${selectedId}`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // GANTI ALERT BIASA DENGAN TOAST SWEETALERT2
            showToast('success', 'Produk berhasil diperbarui!');
            } else {
            await api.post('/products', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // GANTI ALERT BIASA DENGAN TOAST SWEETALERT2
            showToast('success', 'Produk berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchProducts(page, search);
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Gagal menyimpan produk!');
        } finally {
            setFormLoading(false);
        }
    };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      alert('Produk berhasil dihapus!');
      fetchProducts(page, search);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus produk!');
    }
  };

  return (
    <div style={{ padding: '15px', color: theme.textPrimary, backgroundColor: theme.bg, minHeight: 'calc(100vh - 85px)' }}>
      {/* HEADER PAGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Manajemen Produk</h2>
          <span style={{ fontSize: '12px', color: theme.textSecondary }}>Kelola daftar barang, harga, gambar, dan stok toko</span>
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
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border, marginBottom: '15px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
          <Search size={14} color={theme.textSecondary} />
          <input
            type="text"
            placeholder="Cari nama, kode, atau barcode..."
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
                <th style={styles.th}>Gambar</th>
                <th style={styles.th}>Kode / Barcode</th>
                <th style={styles.th}>Nama Produk</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Harga Beli</th>
                <th style={styles.th}>Harga Jual</th>
                <th style={styles.th}>Stok</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>Memuat data produk...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>
                    Data produk tidak ditemukan.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={styles.td}>
                        {getImageUrl(item) ? (
                            <img 
                            src={getImageUrl(item)} 
                            alt={item.name} 
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'cover', 
                                borderRadius: '6px', 
                                border: `1px solid ${theme.border}` 
                            }} 
                            onError={(e) => {
                                // Jika file tidak ditemukan di server / error, fallback ke tampilan icon
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                            />
                        ) : null}

                        {/* Fallback Icon jika gambar null atau fail saat dipanggil */}
                        <div 
                            style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '6px', 
                            backgroundColor: theme.inputBg, 
                            border: `1px solid ${theme.border}`, 
                            display: getImageUrl(item) ? 'none' : 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                            }}
                        >
                            <ImageIcon size={18} color={theme.textSecondary} />
                        </div>
                        </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 'bold' }}>{item.code || '-'}</div>
                      <div style={{ fontSize: '10px', color: theme.textSecondary }}>{item.barcode || '-'}</div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{item.name}</td>
                    <td style={styles.td}>{item.category?.name || item.category_name || '-'}</td>
                    <td style={styles.td}>Rp {parseFloat(item.purchase_price || 0).toLocaleString('id-ID')}</td>
                    <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>
                      Rp {parseFloat(item.selling_price || 0).toLocaleString('id-ID')}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        backgroundColor: item.stock <= 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: item.stock <= 5 ? '#ef4444' : '#10b981',
                        fontWeight: 'bold'
                      }}>
                        {item.stock} {item.unit || 'pcs'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          style={{ ...styles.actionBtn, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}
                          title="Edit Produk"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          style={{ ...styles.actionBtn, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                          title="Hapus Produk"
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
              Halaman <b style={{ color: theme.textPrimary }}>{pagination.currentPage}</b> dari <b style={{ color: theme.textPrimary }}>{pagination.lastPage}</b> (Total {pagination.total} Produk)
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
                {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    border: `1px dashed ${theme.border}`,
                    backgroundColor: theme.inputBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    {imagePreview ? (
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                        // Jika gambar lama rusak/tidak ditemukan
                        setImagePreview(null);
                        }}
                    />
                    ) : (
                    <ImageIcon size={22} color={theme.textSecondary} />
                    )}
                </div>

                <div>
                    <label style={{ ...styles.label, color: theme.textSecondary }}>Gambar Produk</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '5px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textPrimary,
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        <Upload size={13} />
                        <span>{imageFile ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                        <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }} 
                        />
                    </label>

                    {/* Tombol Hapus Pilihan Gambar jika user memilih file baru */}
                    {imageFile && (
                        <button
                        type="button"
                        onClick={() => {
                            setImageFile(null);
                            setImagePreview(isEdit ? getImageUrl(selectedProduct) : null);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                        >
                        Batal Pilih
                        </button>
                    )}
                    </div>
                    <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
                    Format: JPG, JPEG, PNG, WEBP (Max 2MB)
                    </div>
                </div>
                </div>

              <div style={styles.formGrid}>
                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Kode Produk</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Contoh: PRD-001"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  />
                </div>

                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Scan / masukan barcode"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Nama Produk</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nama produk"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  />
                </div>

                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Kategori</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Satuan (Unit)</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="pcs / kg / botol"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  />
                </div>

                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Harga Beli (Rp)</label>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    placeholder="0"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  />
                </div>

                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Harga Jual (Rp)</label>
                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    placeholder="0"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  />
                </div>

                <div>
                  <label style={{ ...styles.label, color: theme.textSecondary }}>Jumlah Stok</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Keterangan / Deskripsi</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Keterangan tambahan..."
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
    width: '450px',
    maxWidth: '90%',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
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

export default Products;