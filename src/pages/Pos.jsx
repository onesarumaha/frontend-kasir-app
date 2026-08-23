import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle,
  Printer
} from 'lucide-react';
import api from '../api';

const Pos = ({ isDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [successData, setSuccessData] = useState(null);

  // Styling Tema
  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f4f5f7',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#1e293b',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? '#1c1c28' : '#f8fafc',
    activeTab: '#2563eb',
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Initial Fetch Kategori
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Produk saat Kategori yang dipilih berubah
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', {
        headers: getAuthHeader(),
      });
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
    }
  };

  // Mengambil Produk dari Backend sesuai query category_id
  const fetchProducts = async (categoryName) => {
    setFetchingProducts(true);
    try {
      let url = '/products';
      if (categoryName && categoryName !== 'ALL') {
        url += `?category_id=${encodeURIComponent(categoryName)}`;
      }

      const res = await api.get(url, {
        headers: getAuthHeader(),
      });
      if (res.data && res.data.data) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data produk:', err);
      setProducts([]);
    } finally {
      setFetchingProducts(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stok produk habis!');
    const price = parseFloat(product.selling_price) || 0;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert('Mencapai batas stok tersedia!');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * price }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
          price: price,
          qty: 1,
          subtotal: price,
        },
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            const product = products.find((p) => p.id === productId);
            if (product && newQty > product.stock) {
              alert('Mencapai batas stok!');
              return item;
            }
            return { ...item, qty: newQty, subtotal: newQty * item.price };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalItem = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = (subtotal - discount) * 0.1;
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const paymentAmount = parseFloat(payment) || 0;
  const change = paymentAmount - grandTotal;

  // Filter Client-side untuk fitur Pencarian nama/barcode
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

const handleCheckout = async () => {
  if (cart.length === 0) return alert('Keranjang masih kosong!');
  if (paymentAmount < grandTotal) return alert('Uang pembayaran kurang!');

  setLoading(true);

  const payload = {
    total_item: totalItem,
    subtotal: subtotal,
    discount: parseFloat(discount) || 0,
    tax: tax,
    grand_total: grandTotal,
    payment: paymentAmount,
    change: change,
    payment_method: paymentMethod,
    note: note,
    items: cart.map((item) => ({
      product_id: item.product_id,
      price: item.price,
      qty: item.qty,
      subtotal: item.subtotal,
    })),
  };

  try {
    // 1. Simpan Transaksi
    const res = await api.post('/sales', payload, {
      headers: getAuthHeader(),
    });

    // 2. Ambil Sale ID dari Respon Transaksi
    const saleId = res.data?.data?.id || res.data?.id;

    if (saleId) {
      // 3. Request Data Struk dari Endpoint Backend
      const receiptRes = await api.get(`/sales/${saleId}/receipt`, {
        headers: getAuthHeader(),
      });

      if (receiptRes.data && receiptRes.data.data) {
        setSuccessData(receiptRes.data.data);
      }
    } else {
      // Fallback jika backend transaksi tidak mengembalikan ID
      setSuccessData(res.data?.data || payload);
    }

    // Reset Form & Refresh Stok
    setCart([]);
    setPayment('');
    setNote('');
    setDiscount(0);
    fetchProducts(selectedCategory);
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal memproses transaksi!');
  } finally {
    setLoading(false);
  }
};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pos-container" style={{ backgroundColor: theme.bg }}>
      <style>{`
        .pos-container {
          display: flex;
          gap: 15px;
          min-height: calc(100vh - 85px);
          width: 100%;
          box-sizing: border-box;
        }
        .catalog-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }
        .cart-section {
          width: 340px;
          border-radius: 8px;
          border: 1px solid ${theme.border};
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .category-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .category-tab {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          border: 1px solid ${theme.border};
          cursor: pointer;
          background-color: ${theme.cardBg};
          color: ${theme.textSecondary};
          transition: all 0.2s ease;
        }
        .category-tab.active {
          background-color: ${theme.activeTab};
          color: #ffffff;
          border-color: ${theme.activeTab};
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          overflow-y: auto;
          max-height: calc(100vh - 180px);
        }
        .input-row {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        @media (max-width: 900px) {
          .pos-container {
            flex-direction: column;
          }
          .cart-section {
            width: 100%;
          }
          .product-grid {
            max-height: 350px;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* KOLOM KIRI: KATALOG PRODUK */}
      <div className="catalog-section">
        {/* Tab Kategori */}
        <div className="category-tabs">
          <button
            className={`category-tab ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            Semua
          </button>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat.id || cat.name}
                className={`category-tab ${selectedCategory === (cat.name || cat.id) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.name || cat.id)}
              >
                {cat.name}
              </button>
            ))
          ) : (
            <>
              <button
                className={`category-tab ${selectedCategory === 'Minuman' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Minuman')}
              >
                Minuman
              </button>
              <button
                className={`category-tab ${selectedCategory === 'Makanan' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Makanan')}
              >
                Makanan
              </button>
            </>
          )}
        </div>

        {/* Input Searching */}
        <div style={{ ...styles.searchBar, backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <Search size={16} color={theme.textSecondary} />
          <input
            type="text"
            placeholder="Cari nama produk atau scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...styles.searchInput, color: theme.textPrimary }}
          />
        </div>

        {/* Grid Card Produk */}
        {fetchingProducts ? (
          <div style={{ padding: '20px', color: theme.textSecondary, fontSize: '13px' }}>Memuat produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '20px', color: theme.textSecondary, fontSize: '13px' }}>Produk tidak ditemukan.</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const price = parseFloat(product.selling_price) || 0;
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  style={{
                    ...styles.productCard,
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  }}
                >
                  <div style={{ ...styles.productCode, color: theme.textSecondary }}>{product.code || 'PRD'}</div>
                  <div style={{ ...styles.productName, color: theme.textPrimary }} title={product.name}>
                    {product.name}
                  </div>
                  <div style={styles.productFooter}>
                    <span style={styles.productPrice}>Rp {price.toLocaleString('id-ID')}</span>
                    <span style={{ ...styles.productStock, color: theme.textSecondary }}>Stok: {product.stock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KOLOM KANAN: PESANAN */}
      <div className="cart-section" style={{ backgroundColor: theme.cardBg }}>
        <div style={{ ...styles.cartHeader, borderColor: theme.border, color: theme.textPrimary }}>
          <ShoppingCart size={18} />
          <span>Pesanan</span>
        </div>

        <div style={styles.cartItemsList}>
          {cart.length === 0 ? (
            <div style={{ ...styles.emptyCart, color: theme.textSecondary }}>Keranjang kosong</div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} style={{ ...styles.cartItem, borderColor: theme.border }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...styles.cartItemTitle, color: theme.textPrimary }}>{item.name}</div>
                  <div style={{ ...styles.cartItemSub, color: theme.textSecondary }}>
                    Rp {item.price.toLocaleString('id-ID')} x {item.qty}
                  </div>
                </div>

                <div style={styles.qtyControls}>
                  <button onClick={() => updateQty(item.product_id, -1)} style={{ ...styles.qtyBtn, backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                    {item.qty === 1 ? <Trash2 size={11} color="#ef4444" /> : <Minus size={11} />}
                  </button>
                  <span style={{ color: theme.textPrimary, fontSize: '12px', fontWeight: 'bold' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, 1)} style={{ ...styles.qtyBtn, backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                    <Plus size={11} />
                  </button>
                </div>

                <div style={{ ...styles.cartItemTotal, color: theme.textPrimary }}>
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ ...styles.checkoutSection, borderColor: theme.border }}>
          <div style={styles.summaryRow}>
            <span style={{ color: theme.textSecondary }}>Subtotal ({totalItem} item)</span>
            <span style={{ color: theme.textPrimary }}>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={{ color: theme.textSecondary }}>Diskon (Rp)</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              style={{ ...styles.smallInput, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
            />
          </div>

          <div style={styles.summaryRow}>
            <span style={{ color: theme.textSecondary }}>Pajak (10%)</span>
            <span style={{ color: theme.textPrimary }}>Rp {tax.toLocaleString('id-ID')}</span>
          </div>

          <div style={{ ...styles.summaryRow, fontSize: '15px', fontWeight: 'bold', marginTop: '6px' }}>
            <span style={{ color: theme.textPrimary }}>Grand Total</span>
            <span style={{ color: '#10b981' }}>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <div style={styles.paymentMethodGrid}>
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'qris', label: 'QRIS', icon: QrCode },
              { id: 'debit', label: 'Debit', icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    ...styles.payMethodBtn,
                    backgroundColor: paymentMethod === m.id ? '#2563eb' : theme.inputBg,
                    color: paymentMethod === m.id ? '#ffffff' : theme.textSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <Icon size={12} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="input-row">
            <input
              type="number"
              placeholder="Jumlah Uang"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              style={{ ...styles.payInput, flex: 3, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
            />
            <input
              type="text"
              placeholder="Catatan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ ...styles.payInput, flex: 2, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}
            />
          </div>

          {paymentAmount > 0 && (
            <div style={{ ...styles.changeText, color: change < 0 ? '#ef4444' : '#10b981' }}>
              {change < 0 ? `Kurang: Rp ${Math.abs(change).toLocaleString('id-ID')}` : `Kembali: Rp ${change.toLocaleString('id-ID')}`}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            style={{
              ...styles.checkoutBtn,
              backgroundColor: cart.length === 0 || loading ? '#64748b' : '#10b981',
            }}
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

        {successData && (
        <div style={styles.modalOverlay}>
            <div style={{ ...styles.receiptModal, backgroundColor: theme.cardBg, color: theme.textPrimary }}>
            <div id="printable-receipt" style={{ padding: '10px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 6px' }} className="no-print" />
                <h3 style={{ margin: 0, fontSize: '16px' }}>KASIR SYSTEM</h3>
                <span style={{ fontSize: '11px', color: theme.textSecondary }}>Struk Pembayaran Official</span>
                </div>

                <div style={{ fontSize: '11px', borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
                <div>No. Invoice: <b>{successData.invoice_number || successData.invoice_no || successData.id}</b></div>
                <div>Kasir: {successData.user?.name || successData.cashier_name || 'Admin'}</div>
                <div>Tanggal: {successData.created_at || new Date().toLocaleString('id-ID')}</div>
                <div>Metode: {String(successData.payment_method || successData.payment_type).toUpperCase()}</div>
                </div>

                <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
                {(successData.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span>{item.product?.name || item.product_name || item.name} x{item.qty || item.quantity}</span>
                    <span>Rp {parseFloat(item.subtotal || item.total_price || 0).toLocaleString('id-ID')}</span>
                    </div>
                ))}
                </div>

                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={styles.summaryRow}><span>Subtotal</span><span>Rp {parseFloat(successData.subtotal || 0).toLocaleString('id-ID')}</span></div>
                <div style={styles.summaryRow}><span>Diskon</span><span>Rp {parseFloat(successData.discount || 0).toLocaleString('id-ID')}</span></div>
                <div style={styles.summaryRow}><span>Pajak</span><span>Rp {parseFloat(successData.tax || 0).toLocaleString('id-ID')}</span></div>
                <div style={{ ...styles.summaryRow, fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
                    <span>Grand Total</span>
                    <span>Rp {parseFloat(successData.grand_total || successData.total || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style={styles.summaryRow}><span>Bayar</span><span>Rp {parseFloat(successData.payment || successData.pay_amount || 0).toLocaleString('id-ID')}</span></div>
                <div style={styles.summaryRow}><span>Kembali</span><span>Rp {parseFloat(successData.change || successData.change_amount || 0).toLocaleString('id-ID')}</span></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }} className="no-print">
                <button
                onClick={handlePrint}
                style={{ ...styles.checkoutBtn, backgroundColor: '#2563eb', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                <Printer size={14} />
                <span>Cetak Struk</span>
                </button>
                <button
                onClick={() => setSuccessData(null)}
                style={{ ...styles.checkoutBtn, backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, flex: 1 }}
                >
                Tutup
                </button>
            </div>
            </div>
        </div>
        )}
            
    </div>
  );
};

const styles = {
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    fontSize: '12px',
  },
  productCard: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '110px', // Ditambah agar teks nama produk tidak terpotong
    boxSizing: 'border-box',
  },
  productCode: { fontSize: '10px', textTransform: 'uppercase' },
  productName: { 
    fontSize: '13px', 
    fontWeight: 'bold', 
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  productPrice: { fontSize: '12px', color: '#10b981', fontWeight: 'bold' },
  productStock: { fontSize: '11px' },

  cartHeader: {
    padding: '10px 12px',
    borderBottom: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  cartItemsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    maxHeight: '220px',
  },
  emptyCart: { textAlign: 'center', marginTop: '30px', fontSize: '12px' },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 0',
    borderBottom: '1px solid',
  },
  cartItemTitle: { fontSize: '11px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cartItemSub: { fontSize: '10px' },
  cartItemTotal: { fontSize: '11px', fontWeight: 'bold' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '4px' },
  qtyBtn: {
    border: 'none',
    borderRadius: '4px',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  checkoutSection: { padding: '10px', borderTop: '1px solid' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' },
  smallInput: { width: '60px', padding: '3px', borderRadius: '4px', border: '1px solid', textAlign: 'right', fontSize: '11px' },
  paymentMethodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', margin: '8px 0' },
  payMethodBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '10px',
    cursor: 'pointer',
  },
  payInput: { padding: '6px 8px', borderRadius: '4px', border: '1px solid', fontSize: '11px', outline: 'none' },
  changeText: { fontSize: '11px', fontWeight: 'bold', textAlign: 'right', marginTop: '4px' },
  checkoutBtn: {
    width: '100%',
    padding: '8px',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '8px',
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
  receiptModal: {
    width: '320px',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
  },
};

export default Pos;