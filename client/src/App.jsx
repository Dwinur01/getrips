import React, { useState, useEffect } from 'react'
import { Compass, Map, Store, ShieldCheck, Sliders, Key, LogIn, LogOut, User, Lock, Shield, ArrowRight, Loader2, Sparkles, CheckCircle, XCircle, AlertTriangle, Info, Settings } from 'lucide-react'
import WisatawanPortal from './components/WisatawanPortal'
import UmkmPortal from './components/UmkmPortal'
import ItSecPortal from './components/ItSecPortal'
import SuperAdminPortal from './components/SuperAdminPortal'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('grestrip_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activePortal, setActivePortal] = useState('wisatawan')
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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Strict Role-Based Navigation Guards
  useEffect(() => {
    if (!user) {
      if (activePortal !== 'wisatawan') {
        setActivePortal('wisatawan');
      }
    } else {
      if (user.role === 'wisatawan' && activePortal !== 'wisatawan') {
        setActivePortal('wisatawan');
      } else if (user.role === 'umkm' && activePortal !== 'umkm' && activePortal !== 'wisatawan') {
        setActivePortal('umkm');
      } else if (user.role === 'superadmin' && activePortal === 'itsec') {
        setActivePortal('superadmin');
      }
    }
  }, [user, activePortal]);

  const handleLogout = () => {
    localStorage.removeItem('grestrip_user');
    setUser(null);
    setActivePortal('wisatawan');
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
        
        // Redirect to specific portal
        if (data.user.role === 'wisatawan') setActivePortal('wisatawan');
        else if (data.user.role === 'umkm') setActivePortal('umkm');
        else if (data.user.role === 'itsec') setActivePortal('itsec');
        else if (data.user.role === 'superadmin') setActivePortal('superadmin');
      } else {
        showToast('Pendaftaran akun berhasil! Silakan masuk dengan menggunakan username baru Anda.', 'success');
        setAuthMode('login');
        setFullnameInput('');
        setPasswordInput('');
      }
    } catch (err) {
      setAuthError(err.message);
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

      if (data.user.role === 'wisatawan') setActivePortal('wisatawan');
      else if (data.user.role === 'umkm') setActivePortal('umkm');
      else if (data.user.role === 'itsec') setActivePortal('itsec');
      else if (data.user.role === 'superadmin') setActivePortal('superadmin');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Helper filters for sidebar permissions
  const showWisatawanBtn = true;
  const showUmkmBtn = user && (user.role === 'umkm' || user.role === 'itsec' || user.role === 'superadmin');
  const showItSecBtn = user && user.role === 'itsec';
  const showAdminBtn = user && (user.role === 'superadmin' || user.role === 'itsec');

  const portalLabels = {
    'wisatawan': { label: 'Portal Wisatawan', icon: '🗺️' },
    'umkm':      { label: 'Dashboard UMKM', icon: '🏪' },
    'itsec':     { label: 'IT Security Center', icon: '🛡️' },
    'superadmin':{ label: 'Super Admin', icon: '⚙️' }
  };

  useEffect(() => {
    const handleKeydown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.altKey && e.key === '1') setActivePortal('wisatawan');
      if (e.altKey && e.key === '2' && showUmkmBtn) setActivePortal('umkm');
      if (e.altKey && e.key === '3' && showItSecBtn) setActivePortal('itsec');
      if (e.altKey && e.key === '4' && showAdminBtn) setActivePortal('superadmin');
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [showUmkmBtn, showItSecBtn, showAdminBtn]);

  return (
    <div className={`flex min-h-screen w-screen transition-colors duration-300 ${activePortal === 'itsec' ? 'bg-[#090d10]' : 'bg-[#f3f6f6]'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-[260px] border-r flex flex-col p-6 fixed h-screen z-50 transition-colors duration-300 ${
        activePortal === 'itsec' 
          ? 'bg-[#12181f] border-[#1f2a36] text-[#e2e8f0]' 
          : 'bg-white border-[#e9ecef] text-[#1b262c]'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#e0f2f1] w-[42px] h-[42px] rounded-xl flex items-center justify-center">
            <Compass className="w-6 h-6 text-[#006666]" />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="font-display font-extrabold text-xl text-[#006666]">Grestrip</h1>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Secure Navigator</span>
          </div>
        </div>

        {/* User Session Profile Header */}
        {user ? (
          <div className={`flex items-center gap-3 p-3 rounded-xl border border-dashed mb-5 transition-all ${
            activePortal === 'itsec' 
              ? 'bg-[#0a0d11] border-[#223141] text-[#e2e8f0]' 
              : 'bg-gray-50 border-gray-250 text-[#1b262c]'
          }`}>
            <div className="w-8 h-8 rounded-full bg-[#006666] text-white flex items-center justify-center font-bold text-xs shadow-md">
              {user.fullname.substring(0,2).toUpperCase()}
            </div>
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-semibold text-xs truncate max-w-[130px]">{user.fullname}</span>
              <span className="text-[10px] text-[#006666] font-bold uppercase tracking-wider mt-1">{user.role}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-amber-800">
            <span className="text-base">👋</span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-xs">Halo, Penjelajah!</span>
              <span className="text-[10px] text-amber-700 font-medium">Login untuk akses penuh</span>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-2 flex-grow">
          {showWisatawanBtn && (
            <button 
              onClick={() => setActivePortal('wisatawan')}
              title="Portal Wisatawan (Alt+1)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all ${
                activePortal === 'wisatawan'
                  ? 'bg-[#006666] text-white'
                  : activePortal === 'itsec'
                    ? 'hover:bg-[#1f2a36] hover:text-[#38bdf8] text-gray-300'
                    : 'hover:bg-[#f8f9fa] hover:text-[#006666] text-[#1b262c]'
              }`}
            >
              <Map className="w-5 h-5" />
              <span>Wisatawan</span>
            </button>
          )}

          {showUmkmBtn && (
            <button 
              onClick={() => setActivePortal('umkm')}
              title="Pemilik UMKM (Alt+2)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all ${
                activePortal === 'umkm'
                  ? 'bg-[#006666] text-white'
                  : activePortal === 'itsec'
                    ? 'hover:bg-[#1f2a36] hover:text-[#38bdf8] text-gray-300'
                    : 'hover:bg-[#f8f9fa] hover:text-[#006666] text-[#1b262c]'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>Pemilik UMKM</span>
            </button>
          )}

          {showItSecBtn && (
            <button 
              onClick={() => setActivePortal('itsec')}
              title="IT Security (Alt+3)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all ${
                activePortal === 'itsec'
                  ? 'bg-[#38bdf8] text-black font-semibold shadow-lg shadow-sky-500/10'
                  : 'hover:bg-[#1e293b] hover:text-[#38bdf8] text-[#1b262c]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>IT Security</span>
            </button>
          )}

          {showAdminBtn && (
            <button 
              onClick={() => setActivePortal('superadmin')}
              title="Super Admin (Alt+4)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all ${
                activePortal === 'superadmin'
                  ? 'bg-[#006666] text-white'
                  : activePortal === 'itsec'
                    ? 'hover:bg-[#1f2a36] hover:text-[#38bdf8] text-gray-300'
                    : 'hover:bg-[#f8f9fa] hover:text-[#006666] text-[#1b262c]'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span>Super Admin</span>
            </button>
          )}
        </nav>

        {/* Login / Logout Button in Sidebar Footer */}
        {user ? (
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 transition-colors mb-4 mt-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              setAuthMode('login');
              setShowLoginModal(true);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white font-semibold text-xs transition-colors mb-4 mt-auto shadow-md shadow-[#006666]/10"
          >
            <LogIn className="w-4 h-4" />
            <span>Daftar / Masuk</span>
          </button>
        )}

        {/* Footer with settings gear */}
        <div className={`flex items-center justify-between border-t pt-3 text-[10px] ${
          activePortal === 'itsec' ? 'border-[#1f2a36] text-gray-400' : 'border-gray-200 text-gray-400'
        }`}>
          <div>
            <p className="font-semibold">#JuaraVibeCoding 2026</p>
            <span className="mt-0.5 block">v1.0.0 • Google Cloud</span>
          </div>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className={`p-2 rounded-lg border transition-all shrink-0 hover:scale-105 active:scale-95 ${
              activePortal === 'itsec' 
                ? 'bg-[#12181f] border-[#1f2a36] text-sky-400 hover:bg-[#1a232d] hover:border-sky-400' 
                : 'bg-gray-50 border-gray-200 text-primary hover:bg-gray-100 hover:border-primary'
            }`}
            title="Pengaturan API Key"
          >
            <Settings className="w-4 h-4 animate-spin-hover" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-grow p-8 min-h-screen transition-colors duration-300">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
            <div className="w-12 h-12 border-4 border-[#006666] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 font-semibold">Memuat data Grestrip...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Elegant Welcome Hero Banner Card for Guest */}
            {!user && activePortal === 'wisatawan' && (
              <div className="bg-gradient-to-r from-[#006666] to-[#008080] rounded-2xl p-6 text-white shadow-lg shadow-teal-900/10 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
                <div className="space-y-2 flex-grow max-w-[580px]">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mode Tamu Navigasi</span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl leading-tight">Selamat Datang di Grestrip Navigator!</h3>
                  <p className="text-xs text-teal-100 leading-relaxed">
                    Eksplorasi destinasi wisata sejarah dan kelezatan kuliner Gresik secara aman, didukung teknologi AI Itinerary Planner cerdas dan perlindungan pertahanan AI WAF.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setShowLoginModal(true);
                  }}
                  className="bg-white hover:bg-gray-100 text-[#006666] font-display font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Daftar Akun Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-[10px] font-semibold mb-2 ${
              activePortal === 'itsec' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <span>Grestrip</span>
              <span>/</span>
              <span className={activePortal === 'itsec' ? 'text-sky-400' : 'text-primary'}>
                {portalLabels[activePortal]?.icon} {portalLabels[activePortal]?.label}
              </span>
            </div>

            {/* Render Portal View */}
            {activePortal === 'wisatawan' && (
              <WisatawanPortal 
                merchants={merchants} 
                reviews={reviews} 
                globalApiKey={globalApiKey}
                onRefresh={fetchData} 
                user={user}
                showToast={showToast}
              />
            )}
            {activePortal === 'umkm' && (
              <UmkmPortal 
                merchants={merchants} 
                reviews={reviews} 
                globalApiKey={globalApiKey}
                onRefresh={fetchData} 
                user={user}
                showToast={showToast}
              />
            )}
            {activePortal === 'itsec' && (
              <ItSecPortal 
                threats={threats} 
                globalApiKey={globalApiKey}
                onRefresh={fetchData} 
                user={user}
                showToast={showToast}
              />
            )}
            {activePortal === 'superadmin' && (
              <SuperAdminPortal 
                merchants={merchants} 
                onRefresh={fetchData} 
                user={user}
                showToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* ==========================================================================
         AUTHENTICATION OVERLAY MODAL (LOGIN & REGISTER)
         ========================================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-[460px] p-6 shadow-2xl relative animate-scale-in text-gray-800">
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setAuthError('');
              }}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-sm outline-none transition-colors"
            >
              &times;
            </button>

            <div className="text-center mb-6">
              <h2 className="font-display font-extrabold text-2xl text-[#006666]">
                {authMode === 'login' ? 'Masuk ke Grestrip' : 'Daftar Akun Baru'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {authMode === 'login' ? 'Gunakan kredensial terdaftar untuk masuk portal' : 'Lengkapi formulir pendaftaran di bawah'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={fullnameInput}
                        onChange={(e) => setFullnameInput(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda..."
                        required
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#006666] focus:ring-1 focus:ring-[#006666] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Pilih Peran (Role)</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#006666] focus:ring-1 focus:ring-[#006666] transition-colors bg-white"
                    >
                      <option value="wisatawan">Wisatawan Biasa</option>
                      <option value="umkm">Pemilik Mitra UMKM</option>
                      <option value="itsec">IT Cyber Security Specialist</option>
                      <option value="superadmin">Super Admin / Dinas Pariwisata</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Contoh: budi_wisatawan"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#006666] focus:ring-1 focus:ring-[#006666] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan sandi rahasia..."
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#006666] focus:ring-1 focus:ring-[#006666] transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingAuth}
                className="w-full bg-[#006666] hover:bg-[#004d4d] text-white font-display font-semibold text-xs py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSubmittingAuth ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Masuk Sekarang' : 'Daftar & Buat Akun'}</span>
                )}
              </button>
            </form>

            {/* Quick Demo Preset Accounts */}
            {authMode === 'login' && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">Preset Akun Demo Instan (Sekali Klik)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => loginWithPreset('wisatawan', 'password')}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-semibold text-left flex flex-col transition-colors"
                  >
                    <span className="text-[#006666] font-bold">Budi (Wisatawan)</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">wisatawan / password</span>
                  </button>
                  <button 
                    onClick={() => loginWithPreset('umkm', 'password')}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-semibold text-left flex flex-col transition-colors"
                  >
                    <span className="text-[#006666] font-bold">Haji Azza (UMKM)</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">umkm / password</span>
                  </button>
                  <button 
                    onClick={() => loginWithPreset('itsec', 'password')}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-semibold text-left flex flex-col transition-colors"
                  >
                    <span className="text-sky-700 font-bold">Satria (IT Cybersec)</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">itsec / password</span>
                  </button>
                  <button 
                    onClick={() => loginWithPreset('admin', 'password')}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-semibold text-left flex flex-col transition-colors"
                  >
                    <span className="text-[#006666] font-bold">Dinas Pariwisata (Admin)</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">admin / password</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 text-center text-xs">
              <span className="text-gray-400">
                {authMode === 'login' ? 'Belum memiliki akun? ' : 'Sudah memiliki akun? '}
              </span>
              <button 
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-[#006666] font-bold hover:underline"
              >
                {authMode === 'login' ? 'Daftar Sekarang' : 'Masuk di sini'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          let bgClass = "bg-[#006666]"
          let Icon = CheckCircle
          if (t.type === 'error') {
            bgClass = "bg-red-600"
            Icon = XCircle
          } else if (t.type === 'warning') {
            bgClass = "bg-amber-500"
            Icon = AlertTriangle
          } else if (t.type === 'info') {
            bgClass = "bg-blue-650"
            Icon = Info
          }
          return (
            <div 
              key={t.id} 
              className={`${bgClass} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-slide-in pointer-events-auto min-w-[280px] max-w-[400px]`}
            >
              <Icon className="w-5 h-5 shrink-0 text-white" />
              <span className="text-xs font-semibold">{t.message}</span>
            </div>
          )
        })}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-[420px] p-6 shadow-2xl relative text-gray-800">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-sm outline-none transition-colors"
            >
              &times;
            </button>

            <div className="mb-5">
              <h2 className="font-display font-extrabold text-lg text-[#006666] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#006666]" />
                <span>Pengaturan Sistem</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">Konfigurasi parameter global platform</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Gemini API Key</label>
                <input 
                  type="password"
                  value={globalApiKey}
                  onChange={(e) => setGlobalApiKey(e.target.value)}
                  placeholder="Masukkan Kunci API Gemini..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#006666] focus:ring-1 focus:ring-[#006666]"
                />
                <span className="text-[10px] text-gray-400 leading-normal">
                  Kunci API disimpan secara lokal di dalam browser Anda. Jika kosong, sistem akan menggunakan <strong>Mode Simulasi</strong> lokal.
                </span>
              </div>

              <button 
                onClick={() => {
                  setShowSettingsModal(false);
                  showToast("Pengaturan disimpan!", "success");
                }}
                className="w-full bg-[#006666] hover:bg-[#004d4d] text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

        {showOnboarding && !user && activePortal === 'wisatawan' && (
          <div className="fixed bottom-20 left-[280px] z-[800] max-w-[260px] animate-fade-in">
            <div className="bg-[#006666] text-white rounded-2xl p-4 shadow-2xl shadow-primary/30 relative">
              <div className="absolute -left-2 top-5 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-[#006666]"></div>
              <p className="text-xs font-semibold leading-relaxed">
                💡 Mulai dengan mengisi preferensi perjalanan, lalu klik <strong>"Rangkai Rute dengan AI"</strong> untuk membuat itinerary otomatis!
              </p>
              <button
                onClick={dismissOnboarding}
                className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors"
              >
                Mengerti, Tutup →
              </button>
            </div>
          </div>
        )}
    </div>
  )
}

export default App
