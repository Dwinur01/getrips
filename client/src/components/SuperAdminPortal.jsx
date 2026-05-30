import React, { useState, useEffect, useRef } from 'react'
import { FileCheck, CheckCircle2, MapPin, Map, Pencil, Eye, X, Power, TrendingUp, Star, MessageSquare, ShieldAlert, UserPlus, KeyRound, Trash2, RefreshCw, Search, LayoutDashboard, Plus, Users } from 'lucide-react'
import EmptyState from './EmptyState'

const getCategoryDetails = (type) => {
  switch (type) {
    case 'kuliner':
      return { label: 'Kuliner Lokal', emoji: '🍽️', colorClass: 'bg-orange-100 text-orange-700 border-orange-200', bgLight: 'bg-orange-50', gradient: 'from-orange-500 to-amber-500', markerColor: '#e05624' };
    case 'alam':
      return { label: 'Wisata Alam', emoji: '🌲', colorClass: 'bg-green-100 text-green-700 border-green-200', bgLight: 'bg-green-50', gradient: 'from-emerald-500 to-teal-500', markerColor: '#10b981' };
    case 'religi':
      return { label: 'Wisata Religi', emoji: '🕌', colorClass: 'bg-purple-100 text-purple-700 border-purple-200', bgLight: 'bg-purple-50', gradient: 'from-purple-500 to-indigo-500', markerColor: '#8b5cf6' };
    case 'sejarah':
      return { label: 'Wisata Sejarah', emoji: '🏛️', colorClass: 'bg-teal-100 text-teal-700 border-teal-200', bgLight: 'bg-teal-50', gradient: 'from-[#006666] to-[#008080]', markerColor: '#006666' };
    case 'belanja':
      return { label: 'Belanja & Oleh-oleh', emoji: '🛍️', colorClass: 'bg-blue-100 text-blue-700 border-blue-200', bgLight: 'bg-blue-50', gradient: 'from-blue-500 to-cyan-500', markerColor: '#3b82f6' };
    case 'rekreasi':
      return { label: 'Rekreasi & Hiburan', emoji: '🎡', colorClass: 'bg-rose-100 text-rose-700 border-rose-200', bgLight: 'bg-rose-50', gradient: 'from-rose-500 to-pink-500', markerColor: '#f43f5e' };
    default:
      return { label: 'Wisata Umum', emoji: '📍', colorClass: 'bg-gray-100 text-gray-700 border-gray-200', bgLight: 'bg-gray-50', gradient: 'from-gray-500 to-slate-500', markerColor: '#6b7280' };
  }
}

function SuperAdminPortal({ merchants, onRefresh, showToast }) {
  const [activePage, setActivePage] = useState('overview')
  const [userList, setUserList] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [newUmkmUsername, setNewUmkmUsername] = useState('')
  const [newUmkmPassword, setNewUmkmPassword] = useState('')
  const [newUmkmMerchantId, setNewUmkmMerchantId] = useState('')
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null)
  const [newResetPassword, setNewResetPassword] = useState('')
  const [merchantSearch, setMerchantSearch] = useState('')
  const [confirmDeleteMerchantId, setConfirmDeleteMerchantId] = useState(null)

  // New merchant form states
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [type, setType] = useState('kuliner')
  const [image, setImage] = useState('')
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
  const [editImage, setEditImage] = useState('')
  const [editLat, setEditLat] = useState('')
  const [editLng, setEditLng] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editStatus, setEditStatus] = useState('aktif')
  const [editMapOpen, setEditMapOpen] = useState(false)

  const [deactivateModal, setDeactivateModal] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [locationName, setLocationName] = useState('');
  const [editLocationName, setEditLocationName] = useState('');

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
          fetchLocationName(clickLat, clickLng);
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
          fetchLocationName(clickLat, clickLng, true);
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
          image: image.trim(),
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
      setImage('')
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
    setEditImage(merchant.image || '')
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
          image: editImage.trim(),
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

  const handleToggleRequest = (merchant) => {
    if (merchant.status !== 'nonaktif') {
      setDeactivateModal(merchant);
      setDeactivateReason('');
    } else {
      handleToggleActiveStatus(merchant);
    }
  };

  const fetchLocationName = async (latitude, longitude, isEdit = false) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`
      );
      const data = await res.json();
      const parts = [
        data.address?.village || data.address?.suburb,
        data.address?.city_district || data.address?.county,
        data.address?.city || data.address?.town
      ].filter(Boolean);
      const name = parts.join(', ') || 'Lokasi ditemukan';
      if (isEdit) {
        setEditLocationName(name);
      } else {
        setLocationName(name);
      }
    } catch {
      if (isEdit) setEditLocationName('');
      else setLocationName('');
    }
  };

  const DonutChart = ({ data }) => {
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    if (total === 0) return null;
    const colors = { 
      kuliner: '#e05624', 
      sejarah: '#006666', 
      alam: '#10b981', 
      religi: '#8b5cf6', 
      belanja: '#3b82f6', 
      rekreasi: '#f43f5e', 
      wisata: '#0ea5e9',
      lainnya: '#f59e0b' 
    };
    let offset = 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const segments = Object.entries(data).map(([key, value]) => {
      const pct = value / total;
      const dash = pct * circumference;
      const seg = { key, value, color: colors[key] || '#64748b', pct, dash, offset };
      offset += dash;
      return seg;
    });
    return (
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="w-[90px] h-[90px] -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2a36" strokeWidth="12" />
          {segments.map(s => (
            <circle
              key={s.key}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="space-y-2">
          {segments.map(s => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
              <span className="text-[11px] text-gray-600 capitalize font-semibold">{s.key}</span>
              <span className="text-[11px] text-gray-400 font-mono">{s.value} ({Math.round(s.pct * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const res = await fetch('/api/auth/users')
      const data = await res.json()
      setUserList(data)
    } catch (err) { showToast('Gagal memuat daftar user', 'error') }
    finally { setIsLoadingUsers(false) }
  }

  useEffect(() => {
    if (activePage === 'akun') loadUsers()
  }, [activePage])

  const merchantsByType = merchants.reduce((acc, m) => {
    const t = m.type || 'lainnya';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const superAdminTabs = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'kelola', label: 'Kelola UMKM', Icon: MapPin },
    { id: 'daftar', label: 'Daftarkan UMKM', Icon: Plus },
    { id: 'akun', label: 'Kelola Akun', Icon: Users }
  ]

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Portal Header */}
      <header className="border-b border-gray-200 pb-5">
        <h2 className="font-display font-bold text-2xl text-primary">Portal Pengawasan Dinas Pariwisata</h2>
        <p className="text-sm text-gray-500">Validasi legalitas pendaftaran UMKM baru, moderasi konten publik, serta tinjau performa statistik wilayah.</p>
      </header>

      {/* Horizontal sub-navigation */}
      <nav className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 overflow-x-auto scrollbar-none flex-nowrap w-full md:overflow-x-visible md:flex-wrap">
        {superAdminTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className={`flex-1 shrink-0 min-w-[120px] md:min-w-0 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activePage === tab.id
                ? 'bg-white text-[#006666] shadow-sm font-bold'
                : 'text-gray-500 hover:text-[#006666]'
            }`}
          >
            <tab.Icon className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* OVERVIEW TAB */}
      {activePage === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Real stats integration cards */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6">
            <h3 className="font-display font-semibold text-sm text-gray-700 mb-4 border-b border-gray-150 pb-3">Statistik Pariwisata Gresik</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mitra Terbina</span>
                <h4 className="font-display font-extrabold text-2xl text-gray-800 mt-1">{stats.totalMerchants} UMKM</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Ulasan</span>
                <h4 className="font-display font-extrabold text-2xl text-primary mt-1">{stats.totalReviews} Ulasan</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rating Rata-rata</span>
                <h4 className="font-display font-extrabold text-2xl text-amber-500 mt-1">★ {stats.avgRating}</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ancaman Diblokir</span>
                <h4 className="font-display font-extrabold text-2xl text-red-500 mt-1">{stats.totalThreatsBlocked} Threat</h4>
              </div>
            </div>
          </div>

          {Object.keys(merchantsByType).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Distribusi Tipe UMKM</h4>
              <DonutChart data={merchantsByType} />
            </div>
          )}
        </div>
      )}

      {/* KELOLA UMKM TAB */}
      {activePage === 'kelola' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 pb-3 mb-4">
              <h3 className="font-display font-semibold text-sm text-gray-700">Daftar UMKM Kreatif Terbina</h3>
              
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 animate-pulse" />
                <input 
                  type="text" 
                  value={merchantSearch} 
                  onChange={e => setMerchantSearch(e.target.value)}
                  placeholder="Cari nama atau pemilik..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:border-[#006666]"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {merchants.filter(m => 
                m.name.toLowerCase().includes(merchantSearch.toLowerCase()) || 
                m.owner.toLowerCase().includes(merchantSearch.toLowerCase())
              ).length > 0 ? (
                merchants
                  .filter(m => 
                    m.name.toLowerCase().includes(merchantSearch.toLowerCase()) || 
                    m.owner.toLowerCase().includes(merchantSearch.toLowerCase())
                  )
                  .map(m => {
                    const isFood = m.type === "kuliner"
                    const isInactive = m.status === 'nonaktif'
                    return (
                      <div 
                        key={m.id} 
                        className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isInactive
                            ? 'border-gray-200 bg-gray-50/70 opacity-70'
                            : 'border-gray-200 hover:shadow-soft hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Thumbnail preview */}
                          {m.image ? (
                            <img src={m.image} alt={m.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-150" />
                          ) : (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 ${getCategoryDetails(m.type).bgLight}`}>
                              {getCategoryDetails(m.type).emoji}
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isInactive ? 'bg-gray-400' : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                              }`}></div>
                              <strong className="text-xs text-gray-800 font-bold">{m.name}</strong>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isInactive ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isInactive ? 'Nonaktif' : 'Aktif'}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 leading-snug">Pemilik: {m.owner}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Loc: {m.coords[0].toFixed(4)}, {m.coords[1].toFixed(4)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 justify-start sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryDetails(m.type).colorClass}`}>
                            {getCategoryDetails(m.type).emoji} {getCategoryDetails(m.type).label}
                          </span>
                          
                          <button
                            onClick={() => handleEditMerchantClick(m)}
                            className="text-blue-500 hover:text-blue-750 transition-colors p-1 hover:bg-blue-50 rounded active:scale-90"
                            title="Edit detail mitra pariwisata"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleRequest(m)}
                            className={`p-1 rounded transition-all active:scale-90 ${
                              isInactive 
                                ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50' 
                                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title={isInactive ? "Aktifkan kembali mitra" : "Nonaktifkan sementara mitra"}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Hapus Permanen Button */}
                          <button
                            onClick={() => setConfirmDeleteMerchantId(m.id)}
                            className="text-red-500 hover:text-red-750 p-1 hover:bg-red-50 rounded active:scale-90"
                            title="Hapus Permanen Mitra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <EmptyState 
                  icon={Map}
                  title="Tidak ada mitra ditemukan"
                  subtitle="Coba kata kunci pencarian lain."
                />
              )}
            </div>
          </div>

          {/* Confirmation Modal for Permanent Delete */}
          {confirmDeleteMerchantId && (
            <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-[400px] w-full p-4 sm:p-6 shadow-xl text-gray-800">
                <h3 className="font-bold text-base text-gray-800 mb-2">Hapus Permanen Mitra</h3>
                <p className="text-xs text-gray-500 mb-4">Apakah Anda yakin ingin menghapus mitra ini secara permanen dari database? Tindakan ini tidak dapat dibatalkan!</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDeleteMerchantId(null)} className="flex-grow border border-gray-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50">
                    Batalkan
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/admin/merchants/${confirmDeleteMerchantId}`, { method: 'DELETE' })
                        if (!res.ok) throw new Error('Gagal menghapus mitra')
                        showToast('Mitra berhasil dihapus secara permanen!', 'success')
                        setConfirmDeleteMerchantId(null)
                        onRefresh()
                      } catch (err) { showToast(err.message, 'error') }
                    }}
                    className="flex-grow bg-red-650 hover:bg-red-700 text-white rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95"
                  >
                    Ya, Hapus Permanen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DAFTARKAN UMKM TAB */}
      {activePage === 'daftar' && (
        <div className="space-y-6 animate-fade-in max-w-xl">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6">
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
                    <option value="kuliner">🍽️ Kuliner Lokal / Café</option>
                    <option value="sejarah">🏛️ Wisata Sejarah & Cagar Budaya</option>
                    <option value="alam">🌲 Wisata Alam & Bahari</option>
                    <option value="religi">🕌 Wisata Religi & Ziarah</option>
                    <option value="belanja">🛍️ Belanja & Oleh-Oleh Khas</option>
                    <option value="rekreasi">🎡 Rekreasi & Hiburan Keluarga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
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
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto bg-[#006666]/10 text-[#006666] hover:bg-[#006666] border border-[#006666] hover:text-white rounded-xl px-4.5 py-2.5 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 h-10 shadow-soft"
                  title="Pilih koordinat lokasi langsung dari peta interaktif"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Peta</span>
                </button>
              </div>

              {locationName && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="font-semibold">{locationName}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">URL Gambar Cover (Unsplash/Lainnya)</label>
                <input 
                  type="text" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Contoh: https://images.unsplash.com/photo-..." 
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
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
        </div>
      )}

      {/* KELOLA AKUN TAB */}
      {activePage === 'akun' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display font-bold text-xl text-gray-800">👥 Manajemen Akun</h3>
            <p className="text-xs text-gray-500 mt-1">Kelola akun login semua pengguna platform</p>
          </div>

          {/* CREATE — Buat Akun UMKM */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-soft">
            <h4 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <UserPlus className="w-4 h-4 text-primary" /> Buat Akun Pemilik UMKM
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Pilih Merchant</label>
                <select value={newUmkmMerchantId} onChange={e => setNewUmkmMerchantId(e.target.value)}
                  className="border border-gray-250 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer bg-white">
                  <option value="">-- Pilih merchant --</option>
                  {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Username</label>
                <input type="text" value={newUmkmUsername} onChange={e => setNewUmkmUsername(e.target.value)}
                  placeholder="Contoh: warung_krawu"
                  className="border border-gray-250 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Password Awal</label>
                <input type="password" value={newUmkmPassword} onChange={e => setNewUmkmPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="border border-gray-250 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary bg-white" />
              </div>
            </div>
            <button
              onClick={async () => {
                if (!newUmkmUsername || !newUmkmPassword || !newUmkmMerchantId) {
                  showToast('Semua field wajib diisi', 'warning'); return
                }
                const merchant = merchants.find(m => m.id === newUmkmMerchantId)
                try {
                  const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: newUmkmUsername, password: newUmkmPassword, role: 'umkm', fullname: merchant?.owner || newUmkmUsername })
                  })
                  if (!res.ok) throw new Error((await res.json()).error)
                  showToast(`Akun @${newUmkmUsername} berhasil dibuat!`, 'success')
                  setNewUmkmUsername(''); setNewUmkmPassword(''); setNewUmkmMerchantId('')
                  loadUsers()
                } catch (err) { showToast(err.message, 'error') }
              }}
              className="mt-4 bg-[#006666] hover:bg-[#005555] text-white rounded-xl px-5 py-2.5 text-xs font-semibold active:scale-95 transition-all shadow-md">
              Buat Akun
            </button>
          </div>

          {/* READ — Daftar Semua User */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h4 className="font-bold text-sm text-gray-700">Semua Akun Terdaftar</h4>
              <button onClick={loadUsers}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {userList.map(u => (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {u.fullname?.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{u.fullname}</p>
                        <p className="text-[10px] text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        u.role === 'superadmin' ? 'bg-purple-100 text-purple-600' :
                        u.role === 'itsec' ? 'bg-sky-100 text-sky-600' :
                        u.role === 'umkm' ? 'bg-orange-100 text-orange-600' :
                        'bg-teal-100 text-teal-600'
                      }`}>
                        {u.role}
                      </span>
                      {/* UPDATE — Reset Password */}
                      <button
                        onClick={() => { setResetPasswordUserId(u.id); setNewResetPassword('') }}
                        className="text-blue-500 hover:text-blue-750 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                        title="Reset password">
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      {/* DELETE — Hapus Akun (kecuali superadmin) */}
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/auth/users/${u.id}`, { method: 'DELETE' })
                              if (!res.ok) throw new Error('Gagal menghapus akun')
                              showToast(`Akun @${u.username} dihapus`, 'info')
                              loadUsers()
                            } catch (err) { showToast(err.message, 'error') }
                          }}
                          className="text-red-500 hover:text-red-750 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                          title="Hapus akun">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal UPDATE — Reset Password */}
            {resetPasswordUserId && (
              <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 shadow-xl text-gray-800 animate-scale-in">
                  <h3 className="font-bold text-base text-gray-800 mb-4 border-b border-gray-100 pb-2">Reset Password</h3>
                  <input type="password" value={newResetPassword} onChange={e => setNewResetPassword(e.target.value)}
                    placeholder="Password baru (min. 6 karakter)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary mb-4 bg-white" />
                  <div className="flex gap-3">
                    <button onClick={() => setResetPasswordUserId(null)}
                      className="flex-grow border border-gray-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50">
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        if (newResetPassword.length < 6) { showToast('Password min. 6 karakter', 'warning'); return }
                        try {
                          const res = await fetch(`/api/auth/users/${resetPasswordUserId}/reset-password`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password: newResetPassword })
                          })
                          if (!res.ok) throw new Error('Gagal reset password')
                          showToast('Password berhasil direset!', 'success')
                          setResetPasswordUserId(null)
                        } catch (err) { showToast(err.message, 'error') }
                      }}
                      className="flex-grow bg-[#006666] hover:bg-[#005555] text-white rounded-xl py-2.5 text-xs font-semibold transition-all">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coordinate Picker Modal (Leaflet.js Map Picker) */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[500px] w-full p-4 sm:p-6 shadow-2xl relative text-gray-800">
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
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[440px] w-full p-4 sm:p-6 shadow-2xl relative text-gray-800">
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
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[460px] w-full p-4 sm:p-6 shadow-2xl relative text-gray-800">
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
                    <option value="kuliner">🍽️ Kuliner Lokal / Café</option>
                    <option value="sejarah">🏛️ Wisata Sejarah & Cagar Budaya</option>
                    <option value="alam">🌲 Wisata Alam & Bahari</option>
                    <option value="religi">🕌 Wisata Religi & Ziarah</option>
                    <option value="belanja">🛍️ Belanja & Oleh-Oleh Khas</option>
                    <option value="rekreasi">🎡 Rekreasi & Hiburan Keluarga</option>
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

                {editLocationName && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="font-semibold">{editLocationName}</span>
                  </div>
                )}

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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">URL Gambar Cover</label>
                  <input 
                    type="text" 
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..." 
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                  />
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
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[500px] w-full p-4 sm:p-6 shadow-2xl relative text-gray-800">
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

        {deactivateModal && (
          <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-[400px] w-full p-4 sm:p-6 shadow-xl">
              <h3 className="font-bold text-base text-gray-800 mb-1">Nonaktifkan UMKM</h3>
              <p className="text-xs text-gray-500 mb-4">Pilih alasan penonaktifan untuk keperluan audit trail.</p>
              <select
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary mb-4"
              >
                <option value="">-- Pilih alasan --</option>
                <option value="renovasi">Sedang renovasi / tutup sementara</option>
                <option value="pelanggaran">Pelanggaran SOP platform</option>
                <option value="permintaan">Permintaan pemilik sendiri</option>
                <option value="tidak_aktif">Tidak aktif lebih dari 30 hari</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setDeactivateModal(null)} className="flex-1 border border-gray-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50">
                  Batalkan
                </button>
                <button
                  disabled={!deactivateReason}
                  onClick={() => { handleToggleActiveStatus(deactivateModal); setDeactivateModal(null); }}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95"
                >
                  Ya, Nonaktifkan
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}

export default SuperAdminPortal
