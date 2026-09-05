import Swal from 'sweetalert2';

// Helper Toast Alert (Notifikasi Pojok Kanan Atas)
export const showToast = (icon, title) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: '#14141e',
    color: '#ffffff',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: icon, // 'success', 'error', 'warning', 'info'
    title: title
  });
};

export const showConfirmDialog = async (title, text) => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#374151',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    background: '#14141e',
    color: '#ffffff',
    customClass: {
      popup: 'swal2-dark-popup'
    }
  });
};

export const yaLogout = async (title, text) => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#374151',
    confirmButtonText: 'Logout',
    cancelButtonText: 'Batal',
    background: '#14141e',
    color: '#ffffff',
    customClass: {
      popup: 'swal2-dark-popup'
    }
  });
};

export const showAlert = (icon, title, text = '') => {
  return Swal.fire({
    icon: icon, // 'error', 'warning', 'success', 'info'
    title: title,
    text: text,
    background: '#14141e',
    color: '#ffffff',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'OK',
    customClass: {
      popup: 'swal2-dark-popup'
    }
  });
};