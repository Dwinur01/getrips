import React, { useContext, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Compass, Map, Store, ShieldCheck, Sliders, LogIn, LogOut, Settings, CheckCircle, XCircle, AlertTriangle, Info, Sparkles, ArrowRight, MapPin } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import AuthModal from './AuthModal'
import SettingsModal from './SettingsModal'

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const {
    user,
    toasts,
    showLoginModal,
    setShowLoginModal,
    showSettingsModal,
    setShowSettingsModal,
    setAuthMode,
    activePortal: activePortalContext, // We determine this dynamically now based on route!
    handleLogout
  } = useContext(AppContext);

  // Determine activePortal styling from route path
  let activePortal = 'wisatawan';
  if (path.startsWith('/umkm')) activePortal = 'umkm';
  else if (path.startsWith('/itsec')) activePortal = 'itsec';
  else if (path.startsWith('/admin')) activePortal = 'superadmin';

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
      if (e.altKey && e.key === '1') navigate('/wisatawan');
      if (e.altKey && e.key === '2' && showUmkmBtn) navigate('/umkm');
      if (e.altKey && e.key === '3' && showItSecBtn) navigate('/itsec');
      if (e.altKey && e.key === '4' && showAdminBtn) navigate('/admin');
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [showUmkmBtn, showItSecBtn, showAdminBtn, navigate]);

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
              onClick={() => navigate('/wisatawan')}
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
              onClick={() => navigate('/umkm')}
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
              onClick={() => navigate('/itsec')}
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
              onClick={() => navigate('/admin')}
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
            <span className="mt-0.5 block">v2.0.0 • Google Cloud</span>
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
        <div className="flex flex-col gap-6">
          
          {/* Elegant Welcome Hero Banner Card for Guest */}
          {!user && path === '/wisatawan' && (
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

          {/* Dynamic Route Content */}
          <Outlet />
        </div>
      </main>

      {/* Auth Overlay Modal */}
      {showLoginModal && <AuthModal />}

      {/* Settings Modal */}
      {showSettingsModal && <SettingsModal />}

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

    </div>
  )
}

export default Layout
