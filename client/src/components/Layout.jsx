import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Compass, Map, Store, ShieldCheck, Sliders, LogIn, LogOut, Settings, CheckCircle, XCircle, AlertTriangle, Info, Sparkles, ArrowRight, MapPin, Menu, X } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import AuthModal from './AuthModal'
import SettingsModal from './SettingsModal'

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const renderSidebarContent = (isDrawer = false) => {
    return (
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#e0f2f1] w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-[#006666]" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="font-display font-extrabold text-xl text-[#006666]">Grestrip</h1>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Secure Navigator</span>
            </div>
          </div>
          {isDrawer && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg border transition-all md:hidden ${
                activePortal === 'itsec' 
                  ? 'bg-[#1e293b] border-[#2d3d50] text-[#e2e8f0] hover:bg-[#2d3d50]' 
                  : 'bg-gray-50 border-gray-200 text-gray-550 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Session Profile Header */}
        {user ? (
          <div className={`flex items-center gap-3 p-3 rounded-xl border border-dashed mb-5 transition-all ${
            activePortal === 'itsec' 
              ? 'bg-[#0a0d11] border-[#223141] text-[#e2e8f0]' 
              : 'bg-gray-50 border-gray-250 text-[#1b262c]'
          }`}>
            <div className="w-8 h-8 rounded-full bg-[#006666] text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
              {user.fullname.substring(0,2).toUpperCase()}
            </div>
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-semibold text-xs truncate max-w-[130px]">{user.fullname}</span>
              <span className="text-[10px] text-[#006666] font-bold uppercase tracking-wider mt-1">{user.role}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-amber-800">
            <span className="text-base shrink-0">👋</span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-xs">Halo, Penjelajah!</span>
              <span className="text-[10px] text-amber-700 font-medium">Login untuk akses penuh</span>
            </div>
          </div>
        )}

        {/* Navigation Menu Links */}
        <nav className="flex flex-col gap-2 flex-grow">
          {showWisatawanBtn && (
            <button 
              onClick={() => {
                navigate('/wisatawan');
                if (isDrawer) setMobileMenuOpen(false);
              }}
              title="Portal Wisatawan (Alt+1)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all duration-300 transform active:scale-95 hover:scale-[1.02] hover:shadow-sm ${
                activePortal === 'wisatawan'
                  ? 'bg-[#006666] text-white shadow-md shadow-[#006666]/15'
                  : activePortal === 'itsec'
                    ? 'hover:bg-[#1f2a36] hover:text-[#38bdf8] text-gray-300'
                    : 'hover:bg-[#f8f9fa] hover:text-[#006666] text-[#1b262c]'
              }`}
            >
              <Map className={`w-5 h-5 transition-transform group-hover:scale-110 ${activePortal === 'wisatawan' ? 'text-teal-200' : 'text-[#006666]'}`} />
              <span>Wisatawan</span>
            </button>
          )}

          {showUmkmBtn && (
            <button 
              onClick={() => {
                navigate('/umkm');
                if (isDrawer) setMobileMenuOpen(false);
              }}
              title="Pemilik UMKM (Alt+2)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all duration-300 transform active:scale-95 hover:scale-[1.02] hover:shadow-sm ${
                activePortal === 'umkm'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold shadow-md shadow-orange-500/10'
                  : activePortal === 'itsec'
                    ? 'hover:bg-[#1f2a36] hover:text-[#38bdf8] text-gray-300'
                    : 'hover:bg-[#f8f9fa] hover:text-[#e05624] text-[#1b262c]'
              }`}
            >
              <Store className={`w-5 h-5 transition-transform ${activePortal === 'umkm' ? 'text-amber-100 animate-pulse' : 'text-[#e05624]'}`} />
              <span>Pemilik UMKM</span>
            </button>
          )}

          {showItSecBtn && (
            <button 
              onClick={() => {
                navigate('/itsec');
                if (isDrawer) setMobileMenuOpen(false);
              }}
              title="IT Security (Alt+3)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all duration-300 transform active:scale-95 hover:scale-[1.02] hover:shadow-sm ${
                activePortal === 'itsec'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-slate-900 font-extrabold shadow-md shadow-sky-500/15'
                  : 'hover:bg-[#1e293b] hover:text-[#38bdf8] text-[#1b262c]'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 transition-transform ${activePortal === 'itsec' ? 'text-slate-900 animate-bounce-slow' : 'text-[#38bdf8]'}`} />
              <span>IT Security</span>
            </button>
          )}

          {showAdminBtn && (
            <button 
              onClick={() => {
                navigate('/admin');
                if (isDrawer) setMobileMenuOpen(false);
              }}
              title="Super Admin (Alt+4)"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all duration-300 transform active:scale-95 hover:scale-[1.02] hover:shadow-sm ${
                activePortal === 'superadmin'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-650 text-white font-semibold shadow-md shadow-purple-600/15'
                  : activePortal === 'itsec'
                    ? 'hover:bg-[#1f2a36] hover:text-[#38bdf8] text-gray-300'
                    : 'hover:bg-[#f8f9fa] hover:text-purple-650 text-[#1b262c]'
              }`}
            >
              <Sliders className={`w-5 h-5 transition-transform ${activePortal === 'superadmin' ? 'text-purple-200' : 'text-purple-600'}`} />
              <span>Super Admin</span>
            </button>
          )}
        </nav>

        {/* Login / Logout Button */}
        {user ? (
          <button 
            onClick={() => {
              handleLogout();
              if (isDrawer) setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 transition-colors duration-300 mb-4 mt-auto active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              setAuthMode('login');
              setShowLoginModal(true);
              if (isDrawer) setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white font-semibold text-xs transition-colors duration-300 mb-4 mt-auto shadow-md shadow-[#006666]/10 active:scale-95"
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
            onClick={() => {
              setShowSettingsModal(true);
              if (isDrawer) setMobileMenuOpen(false);
            }}
            className={`p-2 rounded-lg border transition-all duration-300 shrink-0 hover:scale-105 active:scale-95 hover:rotate-45 ${
              activePortal === 'itsec' 
                ? 'bg-[#12181f] border-[#1f2a36] text-sky-400 hover:bg-[#1a232d] hover:border-sky-400' 
                : 'bg-gray-50 border-gray-200 text-primary hover:bg-gray-100 hover:border-primary'
            }`}
            title="Pengaturan API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex min-h-screen w-screen transition-colors duration-300 overflow-x-hidden ${activePortal === 'itsec' ? 'bg-[#090d10]' : 'bg-[#f3f6f6]'}`}>
      
      {/* 1. Mobile Header (Glassmorphic Top Bar) */}
      <header className={`md:hidden fixed top-0 left-0 right-0 h-16 z-40 border-b flex items-center justify-between px-5 backdrop-blur-md transition-colors duration-300 ${
        activePortal === 'itsec' 
          ? 'bg-[#12181f]/85 border-[#1f2a36] text-[#e2e8f0]' 
          : 'bg-white/85 border-[#e9ecef] text-[#1b262c]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="bg-[#e0f2f1] w-[34px] h-[34px] rounded-lg flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#006666]" />
          </div>
          <span className="font-display font-extrabold text-base text-[#006666]">Grestrip</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="w-7 h-7 rounded-full bg-[#006666] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              {user.fullname.substring(0,2).toUpperCase()}
            </div>
          )}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className={`p-2 rounded-lg transition-all ${
              activePortal === 'itsec' ? 'bg-[#1e293b] text-[#e2e8f0]' : 'bg-gray-150 text-gray-700'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Desktop Sidebar (Hidden on Mobile) */}
      <aside className={`hidden md:flex w-[260px] border-r flex-col p-6 fixed h-screen z-50 transition-colors duration-300 ${
        activePortal === 'itsec' 
          ? 'bg-[#12181f] border-[#1f2a36] text-[#e2e8f0]' 
          : 'bg-white border-[#e9ecef] text-[#1b262c]'
      }`}>
        {renderSidebarContent(false)}
      </aside>

      {/* 3. Mobile Navigation Drawer Slider & Backdrop Overlay */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-350 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        ></div>
        
        {/* Sliding Menu Container */}
        <aside className={`absolute top-0 left-0 bottom-0 w-[280px] p-6 flex flex-col shadow-2xl transition-transform duration-350 ease-out transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          activePortal === 'itsec' 
            ? 'bg-[#12181f] text-[#e2e8f0]' 
            : 'bg-white text-[#1b262c]'
        }`}>
          {renderSidebarContent(true)}
        </aside>
      </div>

      {/* 4. Main Content Area (Responsive margins and padding) */}
      <main className={`flex-grow p-4 md:p-8 min-h-screen transition-colors duration-300 ml-0 md:ml-[260px] pt-20 md:pt-8 pb-24 md:pb-8`}>
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
            <span className={`flex items-center gap-1.5 ${activePortal === 'itsec' ? 'text-sky-400' : 'text-primary'}`}>
              {activePortal === 'wisatawan' && <Map className="w-3.5 h-3.5 text-[#006666] inline" />}
              {activePortal === 'umkm' && <Store className="w-3.5 h-3.5 text-[#e05624] inline" />}
              {activePortal === 'itsec' && <ShieldCheck className="w-3.5 h-3.5 text-sky-400 inline" />}
              {activePortal === 'superadmin' && <Sliders className="w-3.5 h-3.5 text-purple-600 inline" />}
              <span className="ml-0.5">{portalLabels[activePortal]?.label}</span>
            </span>
          </div>

          {/* Dynamic Route Content */}
          <Outlet />
        </div>
      </main>

      {/* 5. Mobile Bottom Quick Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t flex items-center justify-around px-2 backdrop-blur-md transition-colors duration-300 ${
        activePortal === 'itsec' 
          ? 'bg-[#12181f]/90 border-[#1f2a36] text-[#e2e8f0]' 
          : 'bg-white/90 border-[#e9ecef] text-[#1b262c]'
      }`}>
        {showWisatawanBtn && (
          <button 
            onClick={() => navigate('/wisatawan')}
            className={`flex flex-col items-center justify-center flex-grow py-1 transition-all ${
              activePortal === 'wisatawan' ? 'text-[#006666] font-bold scale-110' : 'text-gray-400 hover:text-gray-650'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Wisatawan</span>
          </button>
        )}
        {showUmkmBtn && (
          <button 
            onClick={() => navigate('/umkm')}
            className={`flex flex-col items-center justify-center flex-grow py-1 transition-all ${
              activePortal === 'umkm' ? 'text-[#e05624] font-bold scale-110' : 'text-gray-450 hover:text-gray-650'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">UMKM</span>
          </button>
        )}
        {showItSecBtn && (
          <button 
            onClick={() => navigate('/itsec')}
            className={`flex flex-col items-center justify-center flex-grow py-1 transition-all ${
              activePortal === 'itsec' ? 'text-sky-400 font-bold scale-110' : 'text-gray-450 hover:text-gray-650'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">IT Sec</span>
          </button>
        )}
        {showAdminBtn && (
          <button 
            onClick={() => navigate('/admin')}
            className={`flex flex-col items-center justify-center flex-grow py-1 transition-all ${
              activePortal === 'superadmin' ? 'text-purple-650 font-bold scale-110' : 'text-gray-450 hover:text-gray-650'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Admin</span>
          </button>
        )}
      </nav>

      {/* Auth Overlay Modal */}
      {showLoginModal && <AuthModal />}

      {/* Settings Modal */}
      {showSettingsModal && <SettingsModal />}

      {/* Toast Notification Container */}
      <div className="fixed bottom-20 md:bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
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
