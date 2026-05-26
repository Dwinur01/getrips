import React, { useState, useEffect } from 'react'
import { Compass, Map, Store, ShieldCheck, Sliders, Key } from 'lucide-react'
import WisatawanPortal from './components/WisatawanPortal'
import UmkmPortal from './components/UmkmPortal'
import ItSecPortal from './components/ItSecPortal'
import SuperAdminPortal from './components/SuperAdminPortal'

function App() {
  const [activePortal, setActivePortal] = useState('wisatawan')
  const [globalApiKey, setGlobalApiKey] = useState('')
  const [merchants, setMerchants] = useState([])
  const [reviews, setReviews] = useState([])
  const [threats, setThreats] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className={`flex min-h-screen w-screen ${activePortal === 'itsec' ? 'bg-[#090d10]' : 'bg-[#f3f6f6]'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-[260px] border-r flex flex-col p-6 fixed h-screen z-50 transition-colors duration-300 ${
        activePortal === 'itsec' 
          ? 'bg-[#12181f] border-[#1f2a36] text-[#e2e8f0]' 
          : 'bg-white border-[#e9ecef] text-[#1b262c]'
      }`}>
        <div className="flex items-center gap-3 mb-9">
          <div className="bg-[#e0f2f1] w-[42px] h-[42px] rounded-xl flex items-center justify-center">
            <Compass className="w-6 h-6 text-[#006666]" />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="font-display font-extrabold text-xl text-[#006666]">Grestrip</h1>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Secure Navigator</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <button 
            onClick={() => setActivePortal('wisatawan')}
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

          <button 
            onClick={() => setActivePortal('umkm')}
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

          <button 
            onClick={() => setActivePortal('itsec')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-sans text-sm font-medium text-left transition-all ${
              activePortal === 'itsec'
                ? 'bg-[#38bdf8] text-black font-semibold shadow-lg shadow-sky-500/10'
                : 'hover:bg-[#1e293b] hover:text-[#38bdf8] text-[#1b262c]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>IT Security</span>
          </button>

          <button 
            onClick={() => setActivePortal('superadmin')}
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
        </nav>

        {/* Global API Key management */}
        <div className={`rounded-xl p-3.5 mb-6 border border-dashed transition-colors ${
          activePortal === 'itsec' 
            ? 'bg-[#0c1015] border-[#1f2a36]' 
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold mb-2">
            <Key className="w-3.5 h-3.5 text-[#006666]" />
            <span>Gemini API Key</span>
          </div>
          <input 
            type="password" 
            value={globalApiKey}
            onChange={(e) => setGlobalApiKey(e.target.value)}
            placeholder="Masukkan Key untuk AI Asli..." 
            className={`w-full border rounded-lg px-2.5 py-1.5 text-[11px] outline-none transition-colors ${
              activePortal === 'itsec'
                ? 'bg-[#12181f] border-[#1f2a36] text-[#e2e8f0] focus:border-[#38bdf8]'
                : 'bg-white border-gray-300 text-[#1b262c] focus:border-[#006666]'
            }`}
          />
          {globalApiKey.trim() ? (
            <span className="inline-block text-[9px] px-2 py-0.5 rounded font-bold mt-2 bg-emerald-100 text-emerald-800">
              Real API Mode
            </span>
          ) : (
            <span className="inline-block text-[9px] px-2 py-0.5 rounded font-bold mt-2 bg-amber-100 text-amber-800">
              Simulation Mode
            </span>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-400">
          <p className="font-semibold">#JuaraVibeCoding 2026</p>
          <span className="mt-0.5 block">v1.0.0 • Google Cloud</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-grow p-8 min-h-screen transition-colors duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <span className="text-gray-400">Menyinkronkan data...</span>
          </div>
        ) : (
          <>
            {activePortal === 'wisatawan' && (
              <WisatawanPortal 
                merchants={merchants} 
                reviews={reviews} 
                globalApiKey={globalApiKey}
                onRefresh={fetchData} 
              />
            )}
            {activePortal === 'umkm' && (
              <UmkmPortal 
                merchants={merchants} 
                reviews={reviews} 
                globalApiKey={globalApiKey}
                onRefresh={fetchData} 
              />
            )}
            {activePortal === 'itsec' && (
              <ItSecPortal 
                threats={threats} 
                globalApiKey={globalApiKey}
                onRefresh={fetchData} 
              />
            )}
            {activePortal === 'superadmin' && (
              <SuperAdminPortal 
                merchants={merchants} 
                onRefresh={fetchData} 
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
