import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Printer, Eye, X, Calendar, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../api';
import { showToast, showConfirmDialog } from '../utils/sweetalert';

const Orders = () => {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [canceling, setCanceling] = useState(false);

  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f8fafc',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#0f172a',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? '#1c1c28' : '#f1f5f9',
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate]);

  // FETCH DAFTAR ORDERS DARI API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/orders';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      setOrders(res.data.data || []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal memuat daftar pesanan');
    } finally {
      setLoading(false);
    }
  };

  // BATALKAN TRANSAKSI (CANCEL / VOID)
  const handleCancelOrder = async (orderId) => {
    const confirmed = await showConfirmDialog(
      'Batalkan Transaksi',
      'Apakah Anda yakin ingin membatalkan transaksi ini? Stok barang akan dikembalikan otomatis.',
      'Ya, Batalkan!'
    );

    if (confirmed) {
      setCanceling(true);
      try {
        const res = await api.post(`/orders/${orderId}/cancel`);
        showToast('success', 'Transaksi berhasil dibatalkan');
        setSelectedOrder(null);
        fetchOrders();
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Gagal membatalkan transaksi');
      } finally {
        setCanceling(false);
      }
    }
  };

  // HANDLE PRINT STRUK THERMAL
  const handlePrint = () => {
    window.print();
  };

  // FILTER SEARCH INVOICE
  const filteredOrders = orders.filter((order) =>
    (order.invoice_number || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', color: theme.textPrimary, backgroundColor: theme.bg, minHeight: 'calc(100vh - 80px)' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: theme.textPrimary }}>Daftar Transaksi (Orders)</h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: theme.textSecondary }}>
            Riwayat seluruh transaksi, detail pesanan, dan cetak ulang struk
          </p>
        </div>

        {/* FILTER & SEARCH */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* FILTER TANGGAL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, padding: '4px 8px', borderRadius: '6px' }}>
            <Calendar size={14} color={theme.textSecondary} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ background: 'none', border: 'none', color: theme.textPrimary, fontSize: '11px', outline: 'none' }}
            />
            <span style={{ color: theme.textSecondary, fontSize: '11px' }}>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ background: 'none', border: 'none', color: theme.textPrimary, fontSize: '11px', outline: 'none' }}
            />
          </div>

          {/* SEARCH BAR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '6px', width: '200px' }}>
            <Search size={14} color={theme.textSecondary} />
            <input
              type="text"
              placeholder="Cari Invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', color: theme.textPrimary, fontSize: '12px', width: '100%' }}
            />
          </div>

          <button
            onClick={fetchOrders}
            style={{ padding: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: '6px', cursor: 'pointer' }}
            title="Refresh Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* TABLE ORDERS */}
      <div style={{ backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.textSecondary }}>
              <th style={{ padding: '12px 16px' }}>No. Invoice</th>
              <th style={{ padding: '12px 16px' }}>Tanggal</th>
              <th style={{ padding: '12px 16px' }}>Kasir</th>
              <th style={{ padding: '12px 16px' }}>Metode</th>
              <th style={{ padding: '12px 16px' }}>Items</th>
              <th style={{ padding: '12px 16px' }}>Total</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>Memuat riwayat transaksi...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>Tidak ada riwayat transaksi ditemukan.</td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const isCanceled = ord.status === 'canceled';
                return (
                  <tr key={ord.id} style={{ borderBottom: `1px solid ${theme.border}`, opacity: isCanceled ? 0.6 : 1 }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{ord.invoice_number}</td>
                    <td style={{ padding: '12px 16px', color: theme.textSecondary, fontSize: '12px' }}>
                      {ord.transaction_date || ord.created_at}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{ord.user?.name || 'Admin'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, fontWeight: '600' }}>
                        {String(ord.payment_method || 'CASH').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{ord.total_item || ord.items?.length || 0} Item</td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                      Rp {parseFloat(ord.grand_total || 0).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        backgroundColor: isCanceled ? '#fee2e2' : '#dcfce7',
                        color: isCanceled ? '#991b1b' : '#166534',
                      }}>
                        {isCanceled ? 'DIBATALKAN' : 'SUKSES'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '4px' }}
                        title="Lihat Detail & Cetak Struk"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL & STRUK THERMAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', width: '100%', maxWidth: '400px', padding: '20px', color: theme.textPrimary }}>
            
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }} className="no-print">
              <h3 style={{ margin: 0, fontSize: '16px', color: theme.textPrimary }}>Detail Transaksi</h3>
              <X size={18} style={{ cursor: 'pointer', color: theme.textSecondary }} onClick={() => setSelectedOrder(null)} />
            </div>

            {/* AREA KHUSUS CETAK STRUK THERMAL (DIFORCE BEGPUTIH TEKS HITAM) */}
            <div id="printable-receipt" style={{ backgroundColor: '#ffffff', color: '#000000', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.4' }}>
              
              {/* STORE / TENANT LOGO & NAME */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                {selectedOrder.tenant?.logo_url ? (
                  <img src={selectedOrder.tenant.logo_url} alt="Logo" style={{ maxHeight: '45px', maxWidth: '120px', objectFit: 'contain', marginBottom: '6px' }} />
                ) : (
                  <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 6px' }} className="no-print" />
                )}
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {selectedOrder.tenant?.name || 'KASIR SYSTEM'}
                </h3>
                {selectedOrder.tenant?.address && (
                  <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#555' }}>{selectedOrder.tenant.address}</p>
                )}
                <span style={{ fontSize: '10px', color: '#666', display: 'block', marginTop: '2px' }}>Struk Pembayaran Official</span>
              </div>

              {/* TRANSACTION INFO */}
              <div style={{ borderBottom: '1px dashed #777', paddingBottom: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Invoice:</span><b>{selectedOrder.invoice_number}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kasir:</span><span>{selectedOrder.user?.name || 'Admin'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tanggal:</span><span>{selectedOrder.transaction_date || selectedOrder.created_at}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Metode:</span><span>{String(selectedOrder.payment_method || 'CASH').toUpperCase()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Status:</span><b>{selectedOrder.status === 'canceled' ? 'DIBATALKAN' : 'SUKSES'}</b></div>
              </div>

              {/* ITEMS LIST */}
              <div style={{ borderBottom: '1px dashed #777', paddingBottom: '6px', marginBottom: '6px' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    <div style={{ fontWeight: '600' }}>{item.product_name || item.product?.name || item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px', color: '#333' }}>
                      <span>{item.qty} x Rp {parseFloat(item.price || 0).toLocaleString('id-ID')}</span>
                      <span>Rp {parseFloat(item.subtotal || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>Rp {parseFloat(selectedOrder.subtotal || 0).toLocaleString('id-ID')}</span></div>
                {parseFloat(selectedOrder.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Diskon</span><span>-Rp {parseFloat(selectedOrder.discount || 0).toLocaleString('id-ID')}</span></div>
                )}
                {parseFloat(selectedOrder.tax || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pajak</span><span>Rp {parseFloat(selectedOrder.tax || 0).toLocaleString('id-ID')}</span></div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px dashed #777', paddingTop: '4px', marginTop: '2px' }}>
                  <span>TOTAL</span>
                  <span>Rp {parseFloat(selectedOrder.grand_total || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bayar</span><span>Rp {parseFloat(selectedOrder.payment || 0).toLocaleString('id-ID')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kembali</span><span>Rp {parseFloat(selectedOrder.change || 0).toLocaleString('id-ID')}</span></div>
              </div>

              {/* FOOTER */}
              <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '6px', borderTop: '1px dashed #777', fontSize: '10px', color: '#555' }}>
                <p style={{ margin: 0 }}>Terima kasih atas kunjungan Anda!</p>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }} className="no-print">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrint}
                  style={{ flex: 1, padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}
                >
                  <Printer size={14} />
                  <span>Cetak Struk</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ flex: 1, padding: '8px', backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Tutup
                </button>
              </div>

              {/* TOMBOL VOID / BATALKAN HANYA JIKA BELUM CANCELLED */}
              {selectedOrder.status !== 'canceled' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  disabled={canceling}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}
                >
                  <Ban size={14} />
                  <span>{canceling ? 'Membatalkan...' : 'Batalkan Transaksi (Void)'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;