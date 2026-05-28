import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('grestrip_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [globalApiKey, setGlobalApiKey] = useState(() => {
    return localStorage.getItem('grestrip_gemini_key') || '';
  })
  const [merchants, setMerchants] = useState([])
  const [reviews, setReviews] = useState([])
  const [threats, setThreats] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Toast Notification System State & Helper
  const [toasts, setToasts] = useState([])
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    localStorage.setItem('grestrip_gemini_key', globalApiKey);
  }, [globalApiKey]);

  // Auth Overlay States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('wisatawan');
  const [fullnameInput, setFullnameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('grestrip_onboarded');
  });

  const dismissOnboarding = () => {
    localStorage.setItem('grestrip_onboarded', '1');
    setShowOnboarding(false);
  };

  // Fetch Startup Data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const merchantsRes = await fetch('/api/merchants')
      const merchantsData = await merchantsRes.json()
      setMerchants(merchantsData)

      const reviewsRes = await fetch('/api/reviews')
      const reviewsData = await reviewsRes.json()
      setReviews(reviewsData)
      
      const threatsRes = await fetch('/api/threats')
      const threatsData = await threatsRes.json()
      setThreats(threatsData)
    } catch (err) {
      console.error("Gagal menyinkronkan data startup:", err)
      showToast("Gagal memuat data dari server. Pastikan server aktif.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('grestrip_user');
    setUser(null);
    showToast("Anda telah keluar dari akun.", "info");
    navigate('/wisatawan');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login'
      ? { username: usernameInput, password: passwordInput }
      : { username: usernameInput, password: passwordInput, role: roleInput, fullname: fullnameInput };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Autentikasi gagal');
      }

      if (authMode === 'login') {
        localStorage.setItem('grestrip_user', JSON.stringify(data.user));
        setUser(data.user);
        setShowLoginModal(false);
        setUsernameInput('');
        setPasswordInput('');
        showToast(`Selamat datang kembali, ${data.user.fullname}! 👋`, 'success');
        
        // Redirect to specific portal page
        if (data.user.role === 'wisatawan') navigate('/wisatawan');
        else if (data.user.role === 'umkm') navigate('/umkm');
        else if (data.user.role === 'itsec') navigate('/itsec');
        else if (data.user.role === 'superadmin') navigate('/admin');
      } else {
        showToast('Pendaftaran akun berhasil! Silakan masuk dengan menggunakan username baru Anda.', 'success');
        setAuthMode('login');
        setFullnameInput('');
        setPasswordInput('');
      }
    } catch (err) {
      setAuthError(err.message);
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const loginWithPreset = async (username, password) => {
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('grestrip_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowLoginModal(false);
      showToast(`Login demo berhasil sebagai ${data.user.fullname}! 👋`, 'success');

      if (data.user.role === 'wisatawan') navigate('/wisatawan');
      else if (data.user.role === 'umkm') navigate('/umkm');
      else if (data.user.role === 'itsec') navigate('/itsec');
      else if (data.user.role === 'superadmin') navigate('/admin');
    } catch (err) {
      setAuthError(err.message);
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      globalApiKey, setGlobalApiKey,
      merchants, setMerchants,
      reviews, setReviews,
      threats, setThreats,
      isLoading, setIsLoading,
      toasts, setToasts,
      showToast,
      showLoginModal, setShowLoginModal,
      showSettingsModal, setShowSettingsModal,
      authMode, setAuthMode,
      usernameInput, setUsernameInput,
      passwordInput, setPasswordInput,
      roleInput, setRoleInput,
      fullnameInput, setFullnameInput,
      authError, setAuthError,
      isSubmittingAuth, setIsSubmittingAuth,
      showOnboarding, setShowOnboarding,
      dismissOnboarding,
      fetchData,
      handleLogout,
      handleAuthSubmit,
      loginWithPreset
    }}>
      {children}
    </AppContext.Provider>
  )
}
