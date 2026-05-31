import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, Map, Store, ShieldCheck, Sliders, LogIn, LogOut, Sparkles, ArrowRight, Terminal, Shield, Fingerprint, MapPin, Globe } from 'lucide-react'
import { AppContext } from '../context/AppContext'

function LandingPage() {
  const navigate = useNavigate();
  const {
    user,
    handleLogout,
    loginWithPreset,
    setShowLoginModal,
    setAuthMode,
    showToast
  } = useContext(AppContext);

  // Portal data for the cards
  const portals = [
    {
      id: 'wisatawan',
      title: 'Portal Wisatawan',
      subtitle: 'Eksplorasi & AI Itinerary',
      icon: Map,
      description: 'Temukan keindahan destinasi sejarah religi Bandar Grissee, kuliner khas Nasi Krawu & Pudak, serta buat rencana perjalanan otomatis berbasis AI secara instan.',
      badge: 'Terbuka Umum',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      themeColor: 'teal',
      accentColor: 'text-[#006666]',
      bgGradient: 'from-teal-50 to-emerald-50/50 hover:border-[#006666]/40',
      actionText: 'Jelajahi Wisata',
      path: '/wisatawan',
      isPublic: true,
    },
    {
      id: 'umkm',
      title: 'Dashboard UMKM',
      subtitle: 'Kemitraan Pedagang Lokal',
      icon: Store,
      description: 'Pusat integrasi pemilik usaha mikro di Kabupaten Gresik. Daftarkan warung kuliner Anda, kelola katalog produk, dan pantau ulasan dari para pengunjung.',
      badge: 'Khusus Mitra',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      themeColor: 'orange',
      accentColor: 'text-[#e05624]',
      bgGradient: 'from-orange-50/70 to-amber-50/30 hover:border-[#e05624]/40',
      actionText: 'Masuk Dashboard',
      path: '/umkm',
      isPublic: false,
      allowedRole: 'umkm'
    },
    {
      id: 'itsec',
      title: 'IT Security Center',
      subtitle: 'Cybersecurity Shield WAF',
      icon: ShieldCheck,
      description: 'Pusat pertahanan siber platform Grestrip. Pantau ancaman keamanan real-time, statistik blokir Web Application Firewall (WAF), dan deteksi upaya injeksi.',
      badge: 'Tim Keamanan',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      themeColor: 'sky',
      accentColor: 'text-sky-600',
      bgGradient: 'from-sky-50/70 to-cyan-50/30 hover:border-sky-500/40',
      actionText: 'Monitor Sistem',
      path: '/itsec',
      isPublic: false,
      allowedRole: 'itsec'
    },
    {
      id: 'superadmin',
      title: 'Super Admin Portal',
      subtitle: 'Pusat Kendali Pariwisata',
      icon: Sliders,
      description: 'Panel dinas pariwisata untuk pengelolaan data master. Kelola akun pengguna, verifikasi pendaftaran UMKM baru, dan tinjau performa sistem secara holistik.',
      badge: 'Dinas / Admin',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      themeColor: 'purple',
      accentColor: 'text-purple-650',
      bgGradient: 'from-purple-50/70 to-indigo-50/30 hover:border-purple-600/40',
      actionText: 'Kelola Platform',
      path: '/admin',
      isPublic: false,
      allowedRole: 'superadmin'
    }
  ];

  const handlePortalAccess = (portal) => {
    if (portal.isPublic) {
      navigate(portal.path);
    } else {
      if (!user) {
        showToast(`Silakan login sebagai ${portal.title} terlebih dahulu.`, 'warning');
        setAuthMode('login');
        setShowLoginModal(true);
      } else if (user.role === portal.allowedRole || user.role === 'itsec' || (portal.id === 'admin' && user.role === 'superadmin') || (portal.id === 'umkm' && user.role === 'superadmin')) {
        navigate(portal.path);
      } else {
        showToast(`Akses Ditolak! Akun Anda (${user.role.toUpperCase()}) tidak memiliki izin untuk portal ini.`, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#1b262c] relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-200/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-100/40 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-purple-100/30 blur-[90px] pointer-events-none"></div>

      {/* Floating Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#e0f2f1] w-[40px] h-[40px] rounded-xl flex items-center justify-center shadow-inner">
              <Compass className="w-6 h-6 text-[#006666]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-xl text-[#006666] tracking-tight">Grestrip</span>
              <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Secure Gateway</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-xs">
                <div className="w-7 h-7 rounded-full bg-[#006666] text-white flex items-center justify-center font-bold text-xs">
                  {user.fullname.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-bold text-xs text-gray-800">{user.fullname}</span>
                  <span className="text-[9px] text-[#006666] font-bold uppercase mt-0.5">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout dari Sesi"
                  className="ml-2 p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowLoginModal(true);
                }}
                className="bg-[#006666] hover:bg-[#004d4d] text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-md shadow-teal-700/10 active:scale-95 flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-6 text-center max-w-4xl mx-auto flex-grow flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-[#006666] mb-5 mx-auto animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Integrasi Web Pariwisata & Keamanan Siber Gresik</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-850 leading-tight mb-4 animate-fade-in">
          Selamat Datang di Portal Utama <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006666] to-teal-500">Grestrip</span>
        </h1>
        
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8 animate-fade-in">
          Satu platform terpadu untuk menjelajah keindahan sejarah Bandar Grissee, memajukan perekonomian lokal melalui digitalisasi UMKM, dan dilindungi oleh sistem pertahanan IT Security WAF real-time.
        </p>

        {user && (
          <div className="bg-[#006666]/5 border border-[#006666]/15 rounded-2xl p-4 max-w-lg mx-auto mb-10 text-xs text-[#006666] font-semibold flex items-center gap-3 shadow-xs animate-fade-in justify-center">
            <span className="text-lg">🔐</span>
            <span>Anda saat ini masuk sebagai <strong>{user.fullname} ({user.role.toUpperCase()})</strong>. Ketuk kartu portal di bawah untuk langsung menuju dashboard Anda!</span>
          </div>
        )}
      </section>

      {/* Portal Selection Grid */}
      <section className="px-6 pb-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal) => {
            const IconComponent = portal.icon;
            
            // Check if active user has permission to this portal
            const hasAccess = portal.isPublic || 
              (user && (
                user.role === portal.allowedRole || 
                user.role === 'itsec' || 
                (portal.id === 'superadmin' && user.role === 'superadmin') || 
                (portal.id === 'umkm' && user.role === 'superadmin')
              ));

            return (
              <div
                key={portal.id}
                onClick={() => handlePortalAccess(portal)}
                className={`bg-gradient-to-br ${portal.bgGradient} border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col h-full relative group`}
              >
                {/* Ribbon badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>

                {/* Circle Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-150 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 mb-6 mt-1">
                  <IconComponent className={`w-6 h-6 ${portal.accentColor}`} />
                </div>

                <div className="flex flex-col mb-4">
                  <h3 className="font-display font-extrabold text-base text-gray-850 group-hover:text-gray-900 leading-tight">
                    {portal.title}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${portal.accentColor} mt-1`}>
                    {portal.subtitle}
                  </span>
                </div>

                <p className="text-xs text-gray-400 group-hover:text-gray-500 leading-relaxed mb-6 flex-grow">
                  {portal.description}
                </p>

                <div className="pt-4 border-t border-gray-200/60 mt-auto flex items-center justify-between text-xs font-bold">
                  <span className={portal.accentColor}>{portal.actionText}</span>
                  <div className={`p-1.5 rounded-lg bg-white border border-gray-150 transition-colors duration-300 group-hover:bg-[#006666] group-hover:border-[#006666] group-hover:text-white ${portal.accentColor}`}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Locks overlay visual indicator */}
                {!hasAccess && (
                  <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[0.5px] rounded-2xl pointer-events-none border border-transparent transition-colors group-hover:bg-gray-900/[0.08]" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Access Center */}
      <section className="bg-white border-t border-gray-200/80 px-6 py-10 w-full mt-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                <Terminal className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex flex-col text-left">
                <h4 className="font-display font-extrabold text-sm text-gray-800">Pusat Login Demo Instan (Sekali Klik)</h4>
                <p className="text-[10px] text-gray-400 font-medium">Beralih peran secara cepat untuk menguji seluruh modul sistem Grestrip</p>
              </div>
            </div>
            
            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start md:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 led-green-pulse"></span>
              <span>Sistem Proteksi WAF Aktif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => loginWithPreset('wisatawan', 'password')}
              className="p-3 bg-[#f8fafc] hover:bg-teal-50 border border-gray-200 hover:border-[#006666]/30 rounded-xl text-left flex flex-col transition-all duration-200 group active:scale-98 shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#006666]">Wisatawan</span>
                <span className="text-[8px] bg-teal-100/50 text-[#006666] font-bold px-1.5 py-0.5 rounded uppercase">Budi</span>
              </div>
              <span className="text-[9px] text-gray-450 mt-1 leading-tight">Uji rencana itineraries berbasis Gemini AI</span>
            </button>

            <button
              onClick={() => loginWithPreset('umkm', 'password')}
              className="p-3 bg-[#f8fafc] hover:bg-orange-50 border border-gray-200 hover:border-[#e05624]/30 rounded-xl text-left flex flex-col transition-all duration-200 group active:scale-98 shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#e05624]">Pemilik UMKM</span>
                <span className="text-[8px] bg-orange-100/50 text-[#e05624] font-bold px-1.5 py-0.5 rounded uppercase">Haji Azza</span>
              </div>
              <span className="text-[9px] text-gray-450 mt-1 leading-tight">Kelola katalog warung, produk & menu lokal</span>
            </button>

            <button
              onClick={() => loginWithPreset('itsec', 'password')}
              className="p-3 bg-[#f8fafc] hover:bg-sky-50 border border-gray-200 hover:border-sky-500/30 rounded-xl text-left flex flex-col transition-all duration-200 group active:scale-98 shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-sky-600">IT Security</span>
                <span className="text-[8px] bg-sky-100/50 text-sky-600 font-bold px-1.5 py-0.5 rounded uppercase">Satria</span>
              </div>
              <span className="text-[9px] text-gray-450 mt-1 leading-tight">Pantau log injeksi WAF & pertahanan Siber</span>
            </button>

            <button
              onClick={() => loginWithPreset('admin', 'password')}
              className="p-3 bg-[#f8fafc] hover:bg-purple-50 border border-gray-200 hover:border-purple-500/30 rounded-xl text-left flex flex-col transition-all duration-200 group active:scale-98 shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-purple-650">Super Admin</span>
                <span className="text-[8px] bg-purple-100/50 text-purple-650 font-bold px-1.5 py-0.5 rounded uppercase">Dinas</span>
              </div>
              <span className="text-[9px] text-gray-450 mt-1 leading-tight">Kelola user, review, dan database inti</span>
            </button>
          </div>

          {/* Quick Statistics Banner */}
          <div className="mt-8 pt-6 border-t border-gray-150 flex flex-wrap justify-between items-center gap-4 text-gray-400 text-[10px]">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Sistem Pariwisata Cerdas Terintegrasi <strong>Kabupaten Gresik</strong></span>
            </div>
            
            <div className="flex gap-4">
              <span><strong>Destinasi:</strong> 25+ Lokasi Wisata</span>
              <span>•</span>
              <span><strong>WAF Status:</strong> Protecting Web Nodes</span>
              <span>•</span>
              <span><strong>Tahun:</strong> 2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
