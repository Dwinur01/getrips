import React, { useState, useEffect } from 'react'
import { MessageSquare, Star, BrainCircuit, Smile, Frown, ShoppingBag, Plus, Trash2, X, RefreshCw, Pencil, TrendingUp, AlertTriangle, Search, LayoutDashboard, Store, Phone, Clock, BarChart2, Edit3 } from 'lucide-react'
import EmptyState from './EmptyState'

function UmkmPortal({ merchants, reviews, globalApiKey, onRefresh, user, showToast }) {
  const [selectedMerchantId, setSelectedMerchantId] = useState('')
  const [catalogModalOpen, setCatalogModalOpen] = useState(false)
  
  // Sub-page navigation state
  const [activePage, setActivePage] = useState('dashboard')

  // Profil Toko states
  const [jamBuka, setJamBuka] = useState('07:00')
  const [jamTutup, setJamTutup] = useState('17:00')
  const [noWa, setNoWa] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const [isEditingProfil, setIsEditingProfil] = useState(false)

  // Ulasan sort state
  const [reviewSort, setReviewSort] = useState('terbaru')

  // Sentiment analytics states
  const [sentiment, setSentiment] = useState({
    sentimentScore: 0,
    positivePercentage: 0,
    negativePercentage: 0,
    keyTakeaways: 'Sedang mensinkronkan data ulasan...'
  })
  const [isFetchingSentiment, setIsFetchingSentiment] = useState(false)

  // Add catalog form state
  const [catName, setCatName] = useState('')
  const [catPrice, setCatPrice] = useState('')
  const [catDesc, setCatDesc] = useState('')

  // Edit catalog states
  const [editingItem, setEditingItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDesc, setEditDesc] = useState('')

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [catalogSearch, setCatalogSearch] = useState('');
  const [lastSeenCount, setLastSeenCount] = useState(0);

  // Set default merchant
  useEffect(() => {
    if (merchants.length > 0 && !selectedMerchantId) {
      if (user && user.role === 'umkm') {
        const owned = merchants.find(m => 
          m.owner.toLowerCase().includes(user.fullname.toLowerCase()) || 
          user.fullname.toLowerCase().includes(m.owner.toLowerCase()) ||
          m.owner.toLowerCase().includes('azza')
        );
        if (owned) {
          setSelectedMerchantId(owned.id);
          return;
        }
      }
      setSelectedMerchantId(merchants[0].id)
    }
  }, [merchants, user])

  // Sync jamBuka, jamTutup, noWa when merchant changes
  useEffect(() => {
    const activeM = merchants.find(m => m.id === selectedMerchantId);
    if (activeM) {
      setJamBuka(activeM.jamBuka || '07:00');
      setJamTutup(activeM.jamTutup || '17:00');
      setNoWa(activeM.noWa || '08123456789');
      setImgUrl(activeM.image || '');
    }
  }, [selectedMerchantId, merchants]);

  // Sync UMKM dashboard data whenever merchant changes
  useEffect(() => {
    if (selectedMerchantId) {
      fetchSentiment()
    }
  }, [selectedMerchantId, reviews])

  const fetchSentiment = async () => {
    if (!selectedMerchantId) return;
    try {
      setIsFetchingSentiment(true)
      setSentiment(prev => ({ ...prev, keyTakeaways: 'AI sedang menganalisis sentimen konsumen...' }))
      const res = await fetch(`/api/sentiment/${selectedMerchantId}?userKey=${globalApiKey}`)
      if (!res.ok) throw new Error("Gagal mengambil data sentimen")
      const data = await res.json()
      setSentiment(data)
    } catch (err) {
      setSentiment(prev => ({ ...prev, keyTakeaways: "Analisis sentimen gagal dimuat: " + err.message }))
    } finally {
      setIsFetchingSentiment(false)
    }
  }

  const activeMerchant = merchants.find(m => m.id === selectedMerchantId)

  const merchantReviews = reviews.filter(r => r.merchantId === selectedMerchantId);
  const newReviewCount = Math.max(0, merchantReviews.length - lastSeenCount);
  const filteredCatalog = (activeMerchant?.catalog || []).filter(item =>
    item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.description?.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  // Speedometer stroke-dashoffset math
  const radius = 54
  const circumference = 2 * Math.PI * radius // ~339.29
  const sentimentOffset = circumference - (sentiment.sentimentScore / 100) * circumference

  // Handle new Catalog menu submit
  const handleAddCatalogSubmit = async (e) => {
    e.preventDefault()
    if (!activeMerchant || !catName.trim() || !catPrice || !catDesc.trim()) return

    if (parseInt(catPrice) <= 0) {
      showToast("Harga menu harus lebih besar dari Rp 0", "warning")
      return
    }

    const newCatalog = [...activeMerchant.catalog, {
      id: 'c_' + Date.now(),
      name: catName.trim(),
      price: parseInt(catPrice),
      description: catDesc.trim()
    }]

    try {
      const res = await fetch(`/api/merchants/${selectedMerchantId}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog: newCatalog })
      })

      if (!res.ok) throw new Error("Gagal mengupdate katalog.")

      showToast("Menu baru berhasil ditambahkan ke katalog!", 'success')
      setCatName('')
      setCatPrice('')
      setCatDesc('')
      setCatalogModalOpen(false)
      onRefresh()

    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Handle Catalog Delete
  const handleDeleteCatalog = async (itemId) => {
    setConfirmDeleteId(itemId);
  }

  const executeDeleteCatalog = async (itemId) => {
    if (!activeMerchant) return
    const filteredCatalog = activeMerchant.catalog.filter(item => item.id !== itemId)

    try {
      const res = await fetch(`/api/merchants/${selectedMerchantId}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog: filteredCatalog })
      })
      if (!res.ok) throw new Error("Gagal menghapus katalog menu")
      showToast("Katalog menu berhasil diperbarui!", 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Edit action
  const handleEditClick = (item) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditPrice(item.price.toString())
    setEditDesc(item.description)
  }

  const handleEditCatalogSubmit = async (e) => {
    e.preventDefault()
    if (!activeMerchant || !editingItem || !editName.trim() || !editPrice || !editDesc.trim()) return

    if (parseInt(editPrice) <= 0) {
      showToast("Harga menu harus lebih besar dari Rp 0", "warning")
      return
    }

    const updatedCatalog = activeMerchant.catalog.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editName.trim(),
          price: parseInt(editPrice),
          description: editDesc.trim()
        }
      }
      return item
    })

    try {
      const res = await fetch(`/api/merchants/${selectedMerchantId}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog: updatedCatalog })
      })

      if (!res.ok) throw new Error("Gagal memperbarui katalog.")

      showToast("Menu hidangan berhasil diperbarui!", 'success')
      setEditingItem(null)
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const umkmTabs = [
    { id: 'dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
    { id: 'katalog',   label: 'Katalog',     Icon: ShoppingBag },
    { id: 'ulasan',    label: 'Ulasan',      Icon: Star,
      badge: newReviewCount > 0 ? newReviewCount : null },
    { id: 'analitik',  label: 'Analitik',    Icon: TrendingUp },
    { id: 'profil',    label: 'Profil Toko', Icon: Store },
  ]

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Portal Header */}
      <header className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-primary">Dashboard Pengelola UMKM</h2>
          <p className="text-sm text-gray-500">Analisis grafis penjualan, sentimen AI konsumen, dan kelola katalog menu digital Anda.</p>
        </div>
        <div>
          <select 
            value={selectedMerchantId}
            onChange={(e) => setSelectedMerchantId(e.target.value)}
            className="bg-primary-light text-primary font-semibold border border-primary rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
          >
            {merchants.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Horizontal Sub-Navigation (Responsive Scrollable on Mobile, Wrap on Desktop) */}
      <nav className="flex overflow-x-auto md:overflow-x-visible md:flex-wrap gap-1 bg-gray-100 p-1.5 rounded-2xl mb-6 scrollbar-none flex-nowrap md:flex-row">
        {umkmTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActivePage(tab.id)
              if (tab.id === 'ulasan') setLastSeenCount(merchantReviews.length)
            }}
            className={`flex-shrink-0 md:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 md:px-2 rounded-xl text-xs font-semibold transition-all duration-300 transform active:scale-95 ${
              activePage === tab.id
                ? 'bg-white text-primary shadow-sm scale-102 font-bold'
                : 'text-gray-550 hover:text-primary'
            }`}
          >
            <tab.Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {activeMerchant ? (
        <>
          {/* 2.1 — Sub-Halaman Dashboard */}
          {activePage === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat Card 1: Review Count */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex items-center gap-5">
                  <div className="bg-[#e05624] text-white w-12 h-12 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Ulasan</span>
                    <h4 className="font-display font-bold text-2xl text-gray-800">{activeMerchant.reviewsCount}</h4>
                  </div>
                </div>

                {/* Stat Card 2: Rating Score */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex items-center gap-5">
                  <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rating</span>
                    <h4 className="font-display font-bold text-2xl text-gray-800">{activeMerchant.rating}</h4>
                  </div>
                </div>

                {/* Stat Card 3: Total Menu */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex items-center gap-5">
                  <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Menu</span>
                    <h4 className="font-display font-bold text-2xl text-gray-800">{activeMerchant.catalog?.length || 0}</h4>
                  </div>
                </div>

                {/* Stat Card 4: Avg Harga Menu */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex items-center gap-5">
                  <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Rata-rata Harga</span>
                    <h4 className="font-display font-bold text-base text-gray-800 mt-1">
                      {activeMerchant.catalog?.length > 0 
                        ? `Rp ${Math.round(activeMerchant.catalog.reduce((s,c)=>s+c.price,0)/activeMerchant.catalog.length).toLocaleString('id-ID')}`
                        : 'N/A'}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout containing sentiment gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-secondary" />
                      <h3 className="font-display font-bold text-sm text-gray-700">AI Sentiment Analytics</h3>
                    </div>
                    <button 
                      onClick={fetchSentiment} 
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-all active:scale-90 shrink-0"
                      title="Refresh analisis sentimen"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingSentiment ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 items-center flex-grow">
                    {/* Radial speedometer gauge */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-[120px] h-[120px]">
                        {isFetchingSentiment ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full z-10">
                            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : null}
                        <svg className="w-full h-full" viewBox="0 0 120 120">
                          <circle className="fill-none stroke-gray-100" strokeWidth="10" cx="60" cy="60" r="54"></circle>
                          <circle 
                            className="fill-none stroke-primary transition-all duration-700 ease-out" 
                            strokeWidth="10" 
                            strokeLinecap="round"
                            cx="60" 
                            cy="60" 
                            r="54"
                            transform="rotate(-90 60 60)"
                            style={{
                              strokeDasharray: circumference,
                              strokeDashoffset: sentimentOffset
                            }}
                          ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
                          <span className="font-display font-extrabold text-2xl text-primary">{sentiment.sentimentScore}%</span>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Sentiment</label>
                          <span className="text-[10px] text-gray-400 mt-1">dari {merchantReviews.length} ulasan</span>
                        </div>
                      </div>

                      {/* Progress bars ratio indicator */}
                      <div className="w-full space-y-1.5">
                        <div className="h-2 rounded-full bg-gray-100 flex overflow-hidden">
                          <div className="bg-primary" style={{ width: `${sentiment.positivePercentage}%` }}></div>
                          <div className="bg-secondary" style={{ width: `${sentiment.negativePercentage}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-primary flex items-center gap-0.5"><Smile className="w-3 h-3" /> Pos: {sentiment.positivePercentage}%</span>
                          <span className="text-secondary flex items-center gap-0.5"><Frown className="w-3 h-3" /> Neg: {sentiment.negativePercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Takeaways Bubble */}
                    <div className="space-y-2 self-start">
                      <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-display">Hasil Evaluasi AI:</h5>
                      <div className="bg-primary-light border-l-4 border-primary rounded-r-xl p-4 text-xs leading-relaxed text-[#004d4d]">
                        {sentiment.keyTakeaways}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-700 mb-2">Informasi Cepat Toko</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Toko Anda saat ini ditampilkan dengan status operasional aktif. Gunakan menu di bawah untuk jalan pintas cepat.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActivePage('katalog')}
                      className="flex flex-col items-center justify-center gap-2 bg-primary-light text-primary border border-primary/20 rounded-2xl p-4 hover:bg-primary hover:text-white transition-all font-semibold text-sm">
                      <ShoppingBag className="w-6 h-6" /> 
                      <span>Katalog Menu</span>
                    </button>
                    <button onClick={() => setActivePage('analitik')}
                      className="flex flex-col items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl p-4 hover:bg-amber-500 hover:text-white transition-all font-semibold text-sm">
                      <TrendingUp className="w-6 h-6" />
                      <span>Lihat Analitik</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2.2 — Sub-Halaman Katalog (CREATE + READ + UPDATE + DELETE) */}
          {activePage === 'katalog' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-gray-800">🍽️ Katalog — {activeMerchant?.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{activeMerchant?.catalog?.length || 0} item</p>
                </div>
                <button onClick={() => setCatalogModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark active:scale-95 transition-all shadow-md">
                  <Plus className="w-4 h-4" /> Tambah Menu
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input type="text" value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-primary" />
              </div>

              {filteredCatalog.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCatalog.map((item, idx) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-2xl flex items-center justify-center">🍴</div>
                          {idx === 0 && (
                            <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-1 rounded-full border border-secondary/20">
                              🔥 Terlaris
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2" title={item.description}>{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <span className="font-display font-bold text-primary text-base">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => handleEditClick(item)}
                            className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteCatalog(item.id)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShoppingBag} title="Katalog kosong" subtitle="Tambahkan menu pertama Anda melalui tombol di pojok kanan atas." />
              )}
            </div>
          )}

          {/* 2.3 — Sub-Halaman Ulasan (READ + SORT) */}
          {activePage === 'ulasan' && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                <h3 className="font-display font-semibold text-lg text-primary mb-4 pb-3 border-b border-gray-150">Ulasan Konsumen untuk {activeMerchant.name}</h3>
                {merchantReviews.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5">
                    <div className="flex items-center gap-6">
                      <div className="text-center shrink-0">
                        <span className="font-display font-extrabold text-4xl text-primary">{activeMerchant?.rating || 0}</span>
                        <div className="text-amber-400 text-base mt-0.5">{'★'.repeat(Math.round(activeMerchant?.rating || 0))}</div>
                        <span className="text-[10px] text-gray-400">{merchantReviews.length} ulasan</span>
                      </div>
                      <div className="flex-grow space-y-1.5">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = merchantReviews.filter(r => r.rating === star).length;
                          const pct = merchantReviews.length > 0 ? Math.round((count / merchantReviews.length) * 100) : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 w-3 shrink-0 font-semibold">{star}</span>
                              <span className="text-amber-400 text-[10px]">★</span>
                              <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-[10px] text-gray-400 w-6 text-right shrink-0">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sort chip */}
                <div className="flex gap-2 mb-4">
                  {[{ val: 'terbaru', label: '🕐 Terbaru' }, { val: 'tertinggi', label: '⭐ Tertinggi' }, { val: 'terendah', label: '▼ Terendah' }]
                    .map(opt => (
                      <button key={opt.val} onClick={() => setReviewSort(opt.val)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                          reviewSort === opt.val ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-primary'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {[...merchantReviews]
                    .sort((a, b) => {
                      if (reviewSort === 'tertinggi') return b.rating - a.rating
                      if (reviewSort === 'terendah') return a.rating - b.rating
                      return new Date(b.timestamp) - new Date(a.timestamp)
                    })
                    .map(r => (
                      <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 transition-all hover:bg-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                              {r.userName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-xs font-semibold text-gray-800 block leading-tight">{r.userName}</strong>
                              <span className="text-[10px] text-gray-400 mt-0.5">{new Date(r.timestamp).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                          <span className="text-xs text-[#f59e0b]">{"★".repeat(r.rating) + "☆".repeat(5-r.rating)}</span>
                        </div>
                        <p className="text-xs text-gray-650 italic leading-relaxed">"{r.text}"</p>
                      </div>
                    ))}
                  {merchantReviews.length === 0 && (
                    <EmptyState 
                      icon={MessageSquare}
                      title="Belum ada ulasan konsumen"
                      subtitle="Toko/wisata Anda belum menerima ulasan dari para wisatawan."
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2.4 — Sub-Halaman Analitik (READ) */}
          {activePage === 'analitik' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-xl text-gray-800">📈 Analitik Performa</h3>

              {/* KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Ulasan', value: merchantReviews.length, icon: '💬', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'Rating Rata-rata', value: activeMerchant?.rating || '—', icon: '⭐', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { label: 'Sentimen Positif', value: `${sentiment.sentimentScore}%`, icon: '😊', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Total Menu', value: activeMerchant?.catalog?.length || 0, icon: '🍽️', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                ].map((kpi, i) => (
                  <div key={i} className={`border rounded-2xl p-5 border-gray-200 ${kpi.color}`}>
                    <span className="text-2xl block mb-2">{kpi.icon}</span>
                    <p className="font-display font-extrabold text-2xl">{kpi.value}</p>
                    <p className="text-[10px] font-semibold mt-1 opacity-80">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Distribusi Bintang */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                <h4 className="font-bold text-sm text-gray-700 mb-4">Distribusi Rating Bintang</h4>
                {[5,4,3,2,1].map(star => {
                  const count = merchantReviews.filter(r => r.rating === star).length
                  const pct = merchantReviews.length > 0 ? Math.round((count / merchantReviews.length) * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2.5">
                      <span className="text-xs font-semibold text-gray-500 w-3 shrink-0">{star}</span>
                      <span className="text-amber-400 text-sm shrink-0">★</span>
                      <div className="flex-grow h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 w-8 text-right shrink-0">{count}x</span>
                    </div>
                  )
                })}
              </div>

              {/* Word Cloud dari ulasan */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                <h4 className="font-bold text-sm text-gray-700 mb-4">💬 Kata Populer dari Ulasan</h4>
                {(() => {
                  const stopwords = ['yang','dan','di','ke','dari','ini','itu','untuk','dengan','ada','saya','sangat','banget','tidak','sudah','bisa','juga','lebih','sekali','enak','tempat','rasa','porsi','gresik','adalah']
                  const allText = merchantReviews.map(r => r.text.toLowerCase()).join(' ')
                  const words = allText.replace(/[^a-z\s]/g,'').split(/\s+/).filter(w => w.length > 3 && !stopwords.includes(w))
                  const freq = {}
                  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
                  const topWords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,12)
                  return topWords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {topWords.map(([word, count]) => (
                        <span key={word}
                          className="bg-primary-light text-primary border border-primary/20 rounded-full px-3 py-1.5 text-xs font-semibold"
                          style={{ fontSize: `${Math.min(11 + count * 1.5, 18)}px` }}>
                          {word} <span className="opacity-50 text-[10px] font-mono font-bold">{count}x</span>
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-xs text-gray-400 text-center py-4">Belum cukup data ulasan untuk menghasilkan kata populer.</p>
                })()}
              </div>

              {/* Saran AI */}
              {sentiment?.keyTakeaways && (
                <div className="bg-primary-light border border-primary/25 rounded-2xl p-5">
                  <h4 className="font-bold text-sm text-primary mb-2 flex items-center gap-1.5">🤖 Insight AI</h4>
                  <p className="text-xs text-gray-705 leading-relaxed">{sentiment.keyTakeaways}</p>
                </div>
              )}
            </div>
          )}

          {/* 2.5 — Sub-Halaman Profil Toko (READ + UPDATE) */}
          {activePage === 'profil' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="font-display font-bold text-xl text-gray-800">🏪 Profil Toko</h3>
                <p className="text-xs text-gray-500 mt-1">Informasi ini ditampilkan kepada wisatawan di peta dan katalog digital platform.</p>
              </div>

              {/* READ — Avatar & Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex items-center gap-5">
                {activeMerchant?.image ? (
                  <img src={activeMerchant.image} alt={activeMerchant.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-200 shadow-sm" />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 ${activeMerchant?.type === 'kuliner' ? 'bg-orange-50' : 'bg-teal-50'}`}>
                    {activeMerchant?.type === 'kuliner' ? '🍽' : '🏛'}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-display font-extrabold text-xl text-gray-800 truncate">{activeMerchant?.name}</h4>
                  <p className="text-sm text-gray-500">Pemilik: {activeMerchant?.owner}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${activeMerchant?.type === 'kuliner' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                      {activeMerchant?.type === 'kuliner' ? '🍽️ Kuliner UMKM' : '🏛️ Wisata Sejarah'}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">⭐ {activeMerchant?.rating}</span>
                  </div>
                </div>
              </div>

              {/* UPDATE — Form Operasional */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-primary" /> Informasi Operasional
                  </h4>
                  <button onClick={() => setIsEditingProfil(!isEditingProfil)}
                    className="text-xs text-primary font-semibold hover:underline">
                    {isEditingProfil ? 'Batal' : 'Edit'}
                  </button>
                </div>

                {isEditingProfil ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> Jam Buka</label>
                        <input type="time" value={jamBuka} onChange={e => setJamBuka(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> Jam Tutup</label>
                        <input type="time" value={jamTutup} onChange={e => setJamTutup(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> Nomor WhatsApp</label>
                      <input type="tel" value={noWa} onChange={e => setNoWa(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold flex items-center gap-1.5">🖼️ URL Gambar Cover Merchant</label>
                      <input type="text" value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                        placeholder="Contoh: https://images.unsplash.com/..."
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white" />
                    </div>
                    <button
                      onClick={async () => {
                        // Persist to database
                        try {
                          const res = await fetch(`/api/admin/merchants/${selectedMerchantId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              ...activeMerchant,
                              coords: activeMerchant.coords,
                              image: imgUrl,
                              jamBuka,
                              jamTutup,
                              noWa
                            })
                          });
                          if (!res.ok) throw new Error("Gagal menyimpan perubahan operasional");
                          showToast('Informasi toko berhasil disimpan! ✅', 'success');
                          setIsEditingProfil(false);
                          onRefresh();
                        } catch (err) {
                          showToast(err.message, 'error');
                        }
                      }}
                      className="bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark active:scale-95 transition-all shadow-md">
                      Simpan Perubahan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Jam Operasional</span>
                      <span className="font-semibold">{jamBuka} — {jamTutup}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">WhatsApp</span>
                      <span className="font-semibold">{noWa || '—'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ringkasan */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                <h4 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Ringkasan Performa
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-display font-extrabold text-2xl text-primary">{merchantReviews.length}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Total Ulasan</p>
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-2xl text-amber-500">{activeMerchant?.rating}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Rating</p>
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-2xl text-secondary">{activeMerchant?.catalog?.length || 0}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Total Menu</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Catalog Form Dialog Modal */}
      {catalogModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[440px] w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setCatalogModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-5">
              <h3 className="font-display font-bold text-lg text-gray-800">Tambah Menu Digital Baru</h3>
            </div>

            <form onSubmit={handleAddCatalogSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Nama Hidangan / Jasa</label>
                <input 
                  type="text" 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Nasi Krawu Babat Paru" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Harga (Rupiah)</label>
                <input 
                  type="number" 
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value)}
                  placeholder="Contoh: 22000" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Deskripsi Bahan & Keterangan</label>
                <textarea 
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Tuliskan komposisi bahan dasar menu serta keunggulannya..." 
                  required
                  rows="3"
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary resize-y"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-display font-semibold text-xs active:scale-95 transition-transform mt-2"
              >
                Tambahkan ke Katalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Catalog Form Dialog Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-[440px] w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-5">
              <h3 className="font-display font-bold text-lg text-gray-800">Ubah Menu Digital</h3>
            </div>

            <form onSubmit={handleEditCatalogSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Nama Hidangan / Jasa</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Nasi Krawu Babat Paru" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Harga (Rupiah)</label>
                <input 
                  type="number" 
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Contoh: 22000" 
                  required
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Deskripsi Bahan & Keterangan</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Tuliskan komposisi bahan dasar menu serta keunggulannya..." 
                  required
                  rows="3"
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary resize-y"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-display font-semibold text-xs active:scale-95 transition-transform mt-2"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 z-[260] flex items-center justify-center backdrop-blur-xs p-4 animate-scale-in">
          <div className="bg-white border border-gray-205 rounded-2xl max-w-[400px] w-full p-6 shadow-2xl relative text-gray-800">
            <button 
              onClick={() => setConfirmDeleteId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-display font-bold text-base">Konfirmasi Hapus</h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus menu hidangan ini dari katalog digital pariwisata Anda? Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-grow border border-gray-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Batalkan
              </button>
              <button 
                type="button"
                onClick={() => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  executeDeleteCatalog(id);
                }}
                className="flex-grow bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default UmkmPortal
