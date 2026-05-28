import React, { useContext } from 'react'
import { Settings } from 'lucide-react'
import { AppContext } from '../context/AppContext'

function SettingsModal() {
  const {
    setShowSettingsModal,
    globalApiKey,
    setGlobalApiKey,
    showToast
  } = useContext(AppContext);

  return (
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
  )
}

export default SettingsModal
