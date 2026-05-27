import React, { useState, useEffect, useRef } from 'react'
import { FileCheck, CheckCircle2, MapPin, Map, Pencil, Eye, X, Power, TrendingUp, Star, MessageSquare, ShieldAlert } from 'lucide-react'
import EmptyState from './EmptyState'

function SuperAdminPortal({ merchants, onRefresh, showToast }) {
  // New merchant form states
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [type, setType] = useState('kuliner')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [desc, setDesc] = useState('')

  // Live stats state
  const [stats, setStats] = useState({
    totalMerchants: merchants.length,
    totalReviews: 0,
    avgRating: '0.0',
    totalThreatsBlocked: 0
  })

  // Modal open states
  const [mapOpen, setMapOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Edit merchant states
  const [editingMerchant, setEditingMerchant] = useState(null)
  const [editName, setEditName] = useState('')
  const [editOwner, setEditOwner] = useState('')
  const [editType, setEditType] = useState('kuliner')
  const [editLat, setEditLat] = useState('')
  const [editLng, setEditLng] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editStatus, setEditStatus] = useState('aktif')
  const [editMapOpen, setEditMapOpen] = useState(false)

  // Leaflet map references
  const pickerMapRef = useRef(null)
  const editPickerMapRef = useRef(null)

  // Load live statistics
  useEffect(() => {
    fetchStats()
  }, [merchants])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error("Gagal memuat statistik")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error("Gagal mengambil statistik dinas:", err)
    }
  }

  // Setup Leaflet Map Picker for Registration Form
  useEffect(() => {
    if (mapOpen) {
      const timer = setTimeout(() => {
        const L = window.L
        if (!L) return

        if (pickerMapRef.current) {
          pickerMapRef.current.remove()
        }

        const centerLat = lat ? parseFloat(lat) : -7.1610
        const centerLng = lng ? parseFloat(lng) : 112.6565

        const map = L.map('picker-map').setView([centerLat, centerLng], 13)
        pickerMapRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        let marker = L.marker([centerLat, centerLng]).addTo(map)

        map.on('click', (e) => {
          const { lat: clickLat, lng: clickLng } = e.latlng
          setLat(clickLat.toFixed(6))
          setLng(clickLng.toFixed(6))
          marker.setLatLng([clickLat, clickLng])
        })
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [mapOpen])

  // Setup Leaflet Map Picker for Edit Form
  useEffect(() => {
    if (editMapOpen) {
      const timer = setTimeout(() => {
        const L = window.L
        if (!L) return

        if (editPickerMapRef.current) {
          editPickerMapRef.current.remove()
        }

        const centerLat = editLat ? parseFloat(editLat) : -7.1610
        const centerLng = editLng ? parseFloat(editLng) : 112.6565

        const map = L.map('edit-picker-map').setView([centerLat, centerLng], 13)
        editPickerMapRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        let marker = L.marker([centerLat, centerLng]).addTo(map)

        map.on('click', (e) => {
          const { lat: clickLat, lng: clickLng } = e.latlng
          setEditLat(clickLat.toFixed(6))
          setEditLng(clickLng.toFixed(6))
          marker.setLatLng([clickLat, clickLng])
        })
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [editMapOpen])

  // Handle preview click
  const handleOpenPreviewModal = (e) => {
    e.preventDefault()
    if (!name.trim() || !owner.trim() || !type || !lat || !lng || !desc.trim()) {
      showToast("Seluruh kolom pendaftaran wajib diisi!", 'warning')
      return
    }
    setPreviewOpen(true)
  }

  // Execute Registration
  const executeRegisterSubmit = async () => {
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

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gagal mendaftarkan UMKM pariwisata")
      }

      showToast(`UMKM "${name}" berhasil divalidasi dan terdaftar secara legal!`, 'success')
      
      // Clean form states
      setName('')
      setOwner('')
      setType('kuliner')
      setLat('')
      setLng('')
      setDesc('')
      setPreviewOpen(false)
      onRefresh()

    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Set up editing states
  const handleEditMerchantClick = (merchant) => {
    setEditingMerchant(merchant)
    setEditName(merchant.name)
    setEditOwner(merchant.owner)
    setEditType(merchant.type)
    setEditLat(merchant.coords[0].toString())
    setEditLng(merchant.coords[1].toString())
    setEditDesc(merchant.description)
    setEditStatus(merchant.status || 'aktif')
  }

  // Submit merchant edit
  const handleEditMerchantSubmit = async (e) => {
    e.preventDefault()
    if (!editName.trim() || !editOwner.trim() || !editType || !editLat || !editLng || !editDesc.trim()) {
      showToast("Kolom perubahan data tidak boleh kosong!", 'warning')
      return
    }

    try {
      const res = await fetch(`/api/admin/merchants/${editingMerchant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          owner: editOwner.trim(),
          type: editType,
          description: editDesc.trim(),
          coords: [parseFloat(editLat), parseFloat(editLng)],
          status: editStatus
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gagal memperbarui detail mitra")
      }

      showToast("Profil mitra pariwisata berhasil diperbarui!", 'success')
      setEditingMerchant(null)
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Toggle active/inactive status immediately
  const handleToggleActiveStatus = async (merchant) => {
    const nextStatus = (merchant.status === 'nonaktif' || !merchant.status) ? 'aktif' : 'nonaktif'
    const statusText = nextStatus === 'aktif' ? 'diaktifkan kembali' : 'dinonaktifkan sementara'

    try {
      const res = await fetch(`/api/admin/merchants/${merchant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: merchant.name,
          owner: merchant.owner,
          type: merchant.type,
          description: merchant.description,
          coords: merchant.coords,
          status: nextStatus
        })
      })

      if (!res.ok) throw new Error("Gagal merubah status kemitraan")
      showToast(`Mitra "${merchant.name}" berhasil ${statusText}!`, 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Portal Header */}
      <header className="border-b border-gray-200 pb-5">
        <h2 className="font-display font-bold text-2xl text-primary">Portal Pengawasan Dinas Pariwisata</h2>
        <p className="text-sm text-gray-500">Validasi legalitas pendaftaran UMKM baru, moderasi konten publik, serta tinjau performa statistik wilayah.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        
        {/* Form Registration */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-150 pb-3 mb-5">
            <FileCheck className="w-5 h-5 text-gray-700" />
            <h3 className="font-display font-bold text-sm text-gray-700">Validasi Pendaftaran UMKM Baru</h3>
          </div>

          <form onSubmit={handleOpenPreviewModal} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Nama UMKM / Objek Wisata</label>
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
                <label className="text-xs font-semibold">Nama Pemilik Legal</label>
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
                <label className="text-xs font-semibold">Kategori Layanan</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="kuliner">Kuliner Lokal</option>
                  <option value="wisata">Objek Wisata / Sejarah</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Latitude</label>
                <input 
                  type="number" 
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  step="0.000001" 
                  placeholder="Contoh: -7.1610" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Longitude</label>
                <input 
                  type="number" 
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  step="0.000001" 
                  placeholder="Contoh: 112.6565" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="bg-primary-light text-primary hover:bg-primary border border-primary hover:text-white rounded-xl px-4.5 py-2.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 h-10 shadow-soft"
                title="Pilih koordinat lokasi langsung dari peta interaktif"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Peta</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Deskripsi Layanan & Keunikan Wisata</label>
              <textarea 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Tuliskan deskripsi lengkap beserta kuliner unggulan khas daerah..." 
                required
                rows="3"
                className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary resize-y"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-display font-semibold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-soft w-full mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Daftarkan & Sahkan UMKM</span>
            </button>
          </form>
        </div>

        {/* Right Side: Live Stats and Listings */}
        <div className="space-y-6">
          
          {/* Real stats integration cards */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
            <h3 className="font-display font-semibold text-sm text-gray-700 mb-4 border-b border-gray-150 pb-3">Statistik Pariwisata Gresik</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mitra Terbina</span>
                <h4 className="font-display font-extrabold text-xl text-gray-800 mt-1">{stats.totalMerchants} UMKM</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Ulasan</span>
                <h4 className="font-display font-extrabold text-xl text-primary mt-1">{stats.totalReviews} Ulasan</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rating Rata-rata</span>
                <h4 className="font-display font-extrabold text-xl text-amber-500 mt-1">★ {stats.avgRating}</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ancaman Diblokir</span>
                <h4 className="font-display font-extrabold text-xl text-red-500 mt-1">{stats.totalThreatsBlocked} Threat</h4>
              </div>
            </div>
          </div>

          {/* List registries with edit actions */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex flex-col">
            <h3 className="font-display font-semibold text-sm text-gray-700 mb-4 border-b border-gray-150 pb-3">Daftar UMKM Kreatif Terbina</h3>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {merchants.length > 0 ? (
                merchants.map(m => {
                  const isFood = m.type === "kuliner"
                  const isInactive = m.status === 'nonaktif'
                  return (
                    <div 
                      key={m.id} 
                      className={`border rounded-xl p-3.5 flex justify-between items-center hover:shadow-soft transition-all ${
                        isInactive ? 'bg-red-50/40 border-red-150 opacity-70' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-gray-800 font-bold">{m.name}</strong>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isInactive ? 'bg-red-200 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isInactive ? 'Nonaktif' : 'Aktif'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 leading-snug">Pemilik: {m.owner}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Loc: {m.coords[0].toFixed(4)}, {m.coords[1].toFixed(4)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isFood ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {isFood ? 'Kuliner' : 'Wisata'}
                        </span>
                        
                        <button
                          onClick={() => handleEditMerchantClick(m)}
                          className="text-blue-500 hover:text-blue-750 transition-colors p-1 hover:bg-blue-50 rounded active:scale-90"
                          title="Edit detail mitra pariwisata"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleActiveStatus(m)}
                          className={`p-1 rounded transition-all active:scale-90 ${
                            isInactive 
                              ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50' 
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title={isInactive ? "Aktifkan kembali mitra" : "Nonaktifkan sementara mitra"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <EmptyState 
                  icon={Map}
                  title="Belum ada mitra terdaftar"
                  subtitle="Daftarkan UMKM pariwisata Gresik legal baru melalui formulir validasi dinas di sebelah kiri."
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Coordinate Picker Modal (Leaflet.js Map Picker) */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[500px] w-full p-6 shadow-2xl relative text-gray-800">
            <button 
              onClick={() => setMapOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-gray-800">Pilih Titik Lokasi Peta</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Klik di area mana saja untuk memindahkan pin lokasi dan menangkap koordinat presisi.</p>
            </div>

            <div id="picker-map" style={{ height: '320px' }} className="rounded-xl border border-gray-300 w-full mb-4 z-10"></div>

            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-[10px] bg-gray-50 border border-gray-150 rounded-xl p-3">
              <div>
                <span className="text-gray-400 block font-sans">LATITUDE CAPTURED:</span>
                <strong className="text-primary text-xs">{lat || '-'}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-sans">LONGITUDE CAPTURED:</span>
                <strong className="text-primary text-xs">{lng || '-'}</strong>
              </div>
            </div>

            <button 
              onClick={() => setMapOpen(false)}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-display font-semibold text-xs active:scale-95 transition-transform"
            >
              Simpan & Gunakan Koordinat
            </button>
          </div>
        </div>
      )}

      {/* Submission Confirmation Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[440px] w-full p-6 shadow-2xl relative text-gray-800">
            <button 
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-gray-800">Konfirmasi Legalitas Data</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Harap periksa ulang keselarasan data sebelum Dinas mendaftarkannya secara legal.</p>
            </div>

            <div className="space-y-3.5 my-4 bg-gray-50 border border-gray-150 rounded-xl p-4 text-xs leading-normal">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block">NAMA MITRA:</span>
                <strong className="text-gray-800 text-xs">{name}</strong>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block">PEMILIK LEGAL:</span>
                  <strong className="text-gray-800 text-xs">{owner}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block">KATEGORI:</span>
                  <strong className="text-gray-800 text-xs uppercase">{type}</strong>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block">KOORDINAT PETA:</span>
                <strong className="text-gray-800 font-mono text-xs">{lat}, {lng}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block">DESKRIPSI KULINER & WISATA:</span>
                <p className="text-gray-650 italic mt-0.5 text-xs leading-relaxed">"{desc}"</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setPreviewOpen(false)}
                className="flex-grow border border-gray-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Kembali Edit
              </button>
              <button 
                onClick={executeRegisterSubmit}
                className="flex-grow bg-primary hover:bg-primary-dark text-white rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95 shadow-soft"
              >
                Ya, Daftarkan!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Merchant Form Dialog Modal */}
      {editingMerchant && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[460px] w-full p-6 shadow-2xl relative text-gray-800">
            <button 
              onClick={() => setEditingMerchant(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-gray-800">Ubah Detail Profil Mitra</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Sesuaikan parameter legalitas dinas mitra pariwisata Gresik.</p>
            </div>

            <form onSubmit={handleEditMerchantSubmit} className="space-y-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Nama UMKM / Objek Wisata</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Nama Pemilik Legal</label>
                  <input 
                    type="text" 
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                    required
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Kategori</label>
                  <select 
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="kuliner">Kuliner Lokal</option>
                    <option value="wisata">Objek Wisata / Sejarah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Latitude</label>
                  <input 
                    type="number" 
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    step="0.000001"
                    required
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Longitude</label>
                  <input 
                    type="number" 
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    step="0.000001"
                    required
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditMapOpen(true)}
                  className="bg-primary-light text-primary hover:bg-primary border border-primary hover:text-white rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95 flex items-center justify-center h-9 shadow-soft"
                  title="Pilih koordinat dari peta"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Status Keanggotaan</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="aktif">Aktif (Tampil di Peta)</option>
                    <option value="nonaktif">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Deskripsi Layanan & Keunikan Wisata</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                  rows="3"
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-y"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingMerchant(null)}
                  className="flex-grow border border-gray-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batalkan
                </button>
                <button 
                  type="submit"
                  className="flex-grow bg-primary hover:bg-primary-dark text-white rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95 shadow-soft"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coordinate Picker Modal for Editing Merchant Details */}
      {editMapOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[500px] w-full p-6 shadow-2xl relative text-gray-800">
            <button 
              onClick={() => setEditMapOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-gray-800">Pilih Titik Lokasi Peta (Edit)</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Klik di area mana saja untuk memindahkan pin lokasi dan menyesuaikan koordinat.</p>
            </div>

            <div id="edit-picker-map" style={{ height: '320px' }} className="rounded-xl border border-gray-300 w-full mb-4 z-10"></div>

            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-[10px] bg-gray-50 border border-gray-150 rounded-xl p-3">
              <div>
                <span className="text-gray-400 block font-sans">LATITUDE CAPTURED:</span>
                <strong className="text-primary text-xs">{editLat || '-'}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-sans">LONGITUDE CAPTURED:</span>
                <strong className="text-primary text-xs">{editLng || '-'}</strong>
              </div>
            </div>

            <button 
              onClick={() => setEditMapOpen(false)}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-display font-semibold text-xs active:scale-95 transition-transform"
            >
              Gunakan Koordinat
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperAdminPortal
