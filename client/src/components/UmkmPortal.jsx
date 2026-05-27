import React, { useState, useEffect } from 'react'
import { MessageSquare, Star, BrainCircuit, Smile, Frown, ShoppingBag, Plus, Trash2, X, RefreshCw, Pencil, TrendingUp, AlertTriangle, Search } from 'lucide-react'
import EmptyState from './EmptyState'

function UmkmPortal({ merchants, reviews, globalApiKey, onRefresh, user, showToast }) {
  const [selectedMerchantId, setSelectedMerchantId] = useState('')
  const [catalogModalOpen, setCatalogModalOpen] = useState(false)
  const [activeUmkmTab, setActiveUmkmTab] = useState('dashboard')

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
      setSelectedMerchantId(merchants[0].id)
    }
  }, [merchants])

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

      {/* Tabs for UMKM Portal */}
      <div className="flex gap-3 border-b border-gray-200 pb-3">
        <button 
          onClick={() => setActiveUmkmTab('dashboard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all ${
            activeUmkmTab === 'dashboard' 
              ? 'bg-primary-light text-primary' 
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard & Katalog</span>
        </button>

        <button 
          onClick={() => { setActiveUmkmTab('reviews'); setLastSeenCount(merchantReviews.length); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all ${
            activeUmkmTab === 'reviews' 
              ? 'bg-primary-light text-primary' 
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ulasan Konsumen</span>
          {activeUmkmTab !== 'reviews' && newReviewCount > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {newReviewCount} baru
            </span>
          )}
        </button>
      </div>

      {activeMerchant ? (
        activeUmkmTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Card 1: Review Count */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex items-center gap-5">
                <div className="bg-secondary text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Ulasan</span>
                  <h4 className="font-display font-bold text-2xl text-gray-800">{activeMerchant.reviewsCount}</h4>
                </div>
              </div>

              {/* Stat Card 2: Rating Score */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex items-center gap-5">
                <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rating</span>
                  <h4 className="font-display font-bold text-2xl text-gray-800">{activeMerchant.rating}</h4>
                </div>
              </div>

              {/* Stat Card 3: Total Menu */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex items-center gap-5">
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Menu</span>
                  <h4 className="font-display font-bold text-2xl text-gray-800">{activeMerchant.catalog?.length || 0}</h4>
                </div>
              </div>

              {/* Stat Card 4: Avg Harga Menu */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex items-center gap-5">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Sentiment Analytics Bento Box */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex flex-col justify-between">
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

              {/* Catalog Manager Bento Box */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-150 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    <h3 className="font-display font-bold text-sm text-gray-700">Kelola Menu & Jasa Digital</h3>
                  </div>
                  <button 
                    onClick={() => setCatalogModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Menu</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 flex-grow">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Cari menu..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                    {catalogSearch && (
                      <span className="absolute right-3 top-2.5 text-[10px] text-gray-400">
                        {filteredCatalog.length} hasil
                      </span>
                    )}
                  </div>
                  {activeMerchant.catalog && activeMerchant.catalog.length > 0 ? (
                    filteredCatalog.map((item, idx) => (
                      <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center gap-4 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs text-gray-800 font-bold">{item.name}</strong>
                            {idx === 0 && (
                              <span className="shrink-0 bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                🔥 Terlaris
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 leading-snug mt-0.5">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <strong className="text-xs font-display font-bold text-secondary mr-1">Rp {item.price.toLocaleString('id-ID')}</strong>
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="text-blue-500 hover:text-blue-750 transition-colors active:scale-95 p-1 hover:bg-blue-50 rounded"
                            title="Edit menu digital"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCatalog(item.id)}
                            className="text-red-500 hover:text-red-755 transition-colors active:scale-95 p-1 hover:bg-red-50 rounded"
                            title="Hapus menu digital"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState 
                      icon={ShoppingBag}
                      title="Katalog menu digital Anda kosong"
                      subtitle="Klik tombol Tambah Menu untuk melengkapi menu makanan pariwisata Anda."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Consumers reviews tab */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
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
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {merchantReviews.length > 0 ? (
                merchantReviews.map(r => (
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
                ))
              ) : (
                <EmptyState 
                  icon={MessageSquare}
                  title="Belum ada ulasan konsumen"
                  subtitle="Toko/wisata Anda belum menerima ulasan dari para wisatawan."
                />
              )}
            </div>
          </div>
        )
      ) : (
        <p className="text-center text-gray-455">Loading UMKM data...</p>
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
