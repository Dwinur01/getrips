import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-fade-in">
      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 max-w-md w-full shadow-xl shadow-red-950/5 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-100 rounded-full blur-xl opacity-70"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-100 rounded-full blur-xl opacity-70"></div>
        
        <div className="w-20 h-20 rounded-full bg-red-100 text-red-650 flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>
        
        <h2 className="font-display font-extrabold text-gray-800 text-2xl mb-3">
          Akses Ditolak! (403)
        </h2>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
          Maaf, Anda tidak memiliki izin otorisasi yang sah untuk mengakses portal keamanan atau administrasi ini. Silakan kembali ke beranda pariwisata.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 hover:border-gray-400 text-gray-600 rounded-xl text-xs font-semibold bg-white active:scale-95 transition-all shadow-soft"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          
          <button 
            onClick={() => navigate('/wisatawan')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#006666] hover:bg-[#004d4d] text-white rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-md shadow-[#006666]/10"
          >
            <Home className="w-4 h-4" />
            <span>Portal Wisatawan</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedPage
