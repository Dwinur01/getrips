// Toast notification system
import toast from 'react-hot-toast';

export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: '✓',
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: '✕',
  });
};

export const showWarningToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#f59e0b',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: '⚠',
  });
};

export const showLoadingToast = (message, toastId = 'loading') => {
  toast.loading(message, {
    id: toastId,
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
  });
  return toastId;
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
