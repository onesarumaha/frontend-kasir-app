import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus, Edit2, Trash2, Key, Mail, User as UserIcon, Shield, X } from 'lucide-react';
import api from '../api';
import { showToast, showConfirmDialog } from '../utils/sweetalert';

const Users = () => {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kasir', // Default role
  });

  const theme = {
    bg: isDarkMode ? '#0d0d11' : '#f8fafc',
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#0f172a',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
    inputBg: isDarkMode ? '#1c1c28' : '#f1f5f9',
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal mengambil data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role?.name?.toLowerCase() || user.role || 'kasir',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selectedUser) {
        await api.post(`/users/${selectedUser.id}`, formData);
        showToast('success', 'Data akun berhasil diperbarui');
      } else {
        await api.post('/users', formData);
        showToast('success', 'Akun baru berhasil dibuat');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmDialog(
      'Hapus Akun',
      'Apakah Anda yakin ingin menghapus akun ini?',
      'Ya, Hapus!'
    );

    if (confirmed) {
      try {
        await api.delete(`/users/${id}`);
        showToast('success', 'Akun berhasil dihapus');
        fetchUsers();
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Gagal menghapus akun');
      }
    }
  };

  return (
    <div style={{ padding: '20px', color: theme.textPrimary, backgroundColor: theme.bg, minHeight: 'calc(100vh - 80px)' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: theme.textPrimary }}>
            Manajemen User
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: theme.textSecondary }}>
            Kelola akun pengguna dan hak akses (Role)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          <UserPlus size={15} />
          <span>Tambah User</span>
        </button>
      </div>

      {/* TABLE DATA */}
      <div style={{ backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.textSecondary }}>
              <th style={{ padding: '12px 16px' }}>Nama</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>Memuat data user...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>Belum ada data user.</td>
              </tr>
            ) : (
              users.map((u) => {
                const roleName = (u.role?.name || u.role || '').toLowerCase();
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: theme.textSecondary }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: roleName === 'admin' ? '#fef3c7' : '#dbeafe',
                        color: roleName === 'admin' ? '#92400e' : '#1e40af',
                      }}>
                        {roleName}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenModal(u)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '10px' }}
                        title="Edit User"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Hapus User"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', width: '100%', maxWidth: '420px', padding: '20px', color: theme.textPrimary }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedUser ? 'Edit User' : 'Tambah User Baru'}</h3>
              <X size={18} style={{ cursor: 'pointer', color: theme.textSecondary }} onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>Nama Lengkap</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, padding: '8px 10px', borderRadius: '6px' }}>
                  <UserIcon size={14} color={theme.textSecondary} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ background: 'none', border: 'none', color: theme.textPrimary, outline: 'none', width: '100%', fontSize: '12px' }}
                    placeholder="Nama Pengguna"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>Email Akses</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, padding: '8px 10px', borderRadius: '6px' }}>
                  <Mail size={14} color={theme.textSecondary} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ background: 'none', border: 'none', color: theme.textPrimary, outline: 'none', width: '100%', fontSize: '12px' }}
                    placeholder="user@toko.com"
                  />
                </div>
              </div>

              {/* INPUT SELECT ROLE */}
              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>Role / Hak Akses</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, padding: '8px 10px', borderRadius: '6px' }}>
                  <Shield size={14} color={theme.textSecondary} />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.textPrimary,
                      outline: 'none',
                      width: '100%',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="kasir" style={{ backgroundColor: theme.cardBg, color: theme.textPrimary }}>Kasir</option>
                    <option value="admin" style={{ backgroundColor: theme.cardBg, color: theme.textPrimary }}>Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
                  {selectedUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, padding: '8px 10px', borderRadius: '6px' }}>
                  <Key size={14} color={theme.textSecondary} />
                  <input
                    type="password"
                    required={!selectedUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ background: 'none', border: 'none', color: theme.textPrimary, outline: 'none', width: '100%', fontSize: '12px' }}
                    placeholder="******"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textPrimary, cursor: 'pointer', fontSize: '12px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;