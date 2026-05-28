import React, { useContext } from 'react'
import { Shield, User, Lock, Loader2, LogIn } from 'lucide-react'
import { AppContext } from '../context/AppContext'

function AuthModal() {
  const {
    setShowLoginModal,
    setAuthError,
    authMode,
    setAuthMode,
    authError,
    handleAuthSubmit,
    fullnameInput, setFullnameInput,
    roleInput, setRoleInput,
    usernameInput, setUsernameInput,
    passwordInput, setPasswordInput,
    isSubmittingAuth,
    loginWithPreset
  } = useContext(AppContext);

  return (
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
  )
}

export default AuthModal
