import React, { useState } from 'react'
import { FileCheck, CheckCircle2 } from 'lucide-react'

function SuperAdminPortal({ merchants, onRefresh }) {
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [type, setType] = useState('kuliner')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [desc, setDesc] = useState('')

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim() || !owner.trim() || !type || !lat || !lng || !desc.trim()) {
      alert("Seluruh kolom pendaftaran harus diisi!")
      return
    }

    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          owner: owner.trim(),
          type,
          description: desc.trim(),
          coords: [parseFloat(lat), parseFloat(lng)]
        })
      })

      if (!res.ok) throw new Error("Gagal mendaftarkan UMKM pariwisata")

      alert(`UMKM "${name}" berhasil divalidasi dan terdaftar di pariwisata Gresik secara legal!`)
      
      // Clean form
      setName('')
      setOwner('')
      setType('kuliner')
      setLat('')
      setLng('')
      setDesc('')
      
      onRefresh()

    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Portal Header */}
      <header className="border-b border-gray-200 pb-5">
        <h2 className="font-display font-bold text-2xl text-primary">Portal Pengawasan Dinas Pariwisata</h2>
        <p className="text-sm text-gray-500">Validasi legalitas pendaftaran UMKM baru, moderasi konten publik ekstrem, serta statistik pariwisata wilayah.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        
        {/* Form Registration */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-250 pb-3 mb-5">
            <FileCheck className="w-5 h-5 text-gray-700" />
            <h3 className="font-display font-bold text-sm text-gray-700">Validasi Pendaftaran UMKM Baru</h3>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Nama UMKM</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama warung / objek wisata baru" 
                required
                className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Nama Pemilik</label>
                <input 
                  type="text" 
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Nama pemilik asli" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Kategori</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="kuliner">Kuliner Lokal</option>
                  <option value="wisata">Objek Wisata / Sejarah</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Latitude Koordinat</label>
                <input 
                  type="number" 
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  step="0.0001" 
                  placeholder="Contoh: -7.1610" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Longitude Koordinat</label>
                <input 
                  type="number" 
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  step="0.0001" 
                  placeholder="Contoh: 112.6565" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Deskripsi Layanan & Keunikan Wisata</label>
              <textarea 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Tuliskan deskripsi lengkap beserta kuliner unggulan khas daerah..." 
                required
                rows="4"
                className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary resize-y"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-display font-semibold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow shadow-slate-900/10 w-full"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sah & Daftarkan UMKM Baru</span>
            </button>
          </form>
        </div>

        {/* Right Side: Listings and Macro parameters */}
        <div className="space-y-6">
          
          {/* Macro KPI statistics box */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
            <h3 className="font-display font-semibold text-sm text-gray-700 mb-4 border-b border-gray-150 pb-3">Statistik Pariwisata Gresik</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">UMKM Terdaftar</span>
                <h4 className="font-display font-bold text-lg text-gray-800 mt-1">{merchants.length}</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Wisatawan Terlayani</span>
                <h4 className="font-display font-bold text-lg text-gray-800 mt-1">3,842</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sentimen Wilayah</span>
                <h4 className="font-display font-bold text-lg text-emerald-600 mt-1">94%</h4>
              </div>
            </div>
          </div>

          {/* List registries */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex flex-col">
            <h3 className="font-display font-semibold text-sm text-gray-700 mb-4 border-b border-gray-150 pb-3">Daftar UMKM Kreatif Terbina</h3>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {merchants.map(m => {
                const isFood = m.type === "kuliner"
                return (
                  <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col">
                      <strong className="text-xs text-gray-800 font-bold">{m.name}</strong>
                      <span className="text-[9px] text-gray-400 mt-0.5">Pemilik: {m.owner} • Loc: {m.coords[0].toFixed(4)}, {m.coords[1].toFixed(4)}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      isFood ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {isFood ? 'Kuliner' : 'Wisata'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default SuperAdminPortal
