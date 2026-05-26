import React, { useState, useEffect } from 'react'
import { MessageSquare, Star, BrainCircuit, Smile, Frown, ShoppingBag, Plus, Trash2, X } from 'lucide-react'

function UmkmPortal({ merchants, reviews, globalApiKey, onRefresh }) {
  const [selectedMerchantId, setSelectedMerchantId] = useState('')
  const [catalogModalOpen, setCatalogModalOpen] = useState(false)

  // Sentiment analytics states
  const [sentiment, setSentiment] = useState({
    sentimentScore: 0,
    positivePercentage: 0,
    negativePercentage: 0,
    keyTakeaways: 'Sedang mensinkronkan data ulasan...'
  })

  // Add catalog form state
  const [catName, setCatName] = useState('')
  const [catPrice, setCatPrice] = useState('')
  const [catDesc, setCatDesc] = useState('')

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
    try {
      setSentiment(prev => ({ ...prev, keyTakeaways: 'AI sedang menganalisis sentimen konsumen...' }))
      const res = await fetch(`/api/sentiment/${selectedMerchantId}?userKey=${globalApiKey}`)
      if (!res.ok) throw new Error("Gagal mengambil data sentimen")
      const data = await res.json()
      setSentiment(data)
    } catch (err) {
      setSentiment(prev => ({ ...prev, keyTakeaways: "Analisis sentimen gagal dimuat: " + err.message }))
    }
  }

  const activeMerchant = merchants.find(m => m.id === selectedMerchantId)

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

      alert("Produk menu baru berhasil ditambahkan!");
      setCatName('')
      setCatPrice('')
      setCatDesc('')
      setCatalogModalOpen(false)
      onRefresh()

    } catch (err) {
      alert(err.message)
    }
  }

  // Handle Catalog Delete
  const handleDeleteCatalog = async (itemId) => {
    if (!activeMerchant) return
    if (!confirm("Apakah Anda yakin ingin menghapus menu hidangan ini dari katalog digital?")) return

    const filteredCatalog = activeMerchant.catalog.filter(item => item.id !== itemId)

    try {
      const res = await fetch(`/api/merchants/${selectedMerchantId}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog: filteredCatalog })
      })
      if (!res.ok) throw new Error("Gagal menghapus katalog menu")
      onRefresh()
    } catch (err) {
      alert(err.message)
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

      {activeMerchant ? (
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

          {/* Spacer cards for Bento Row */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* AI Sentiment Analytics Bento Box (Col Span 2) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center gap-2 border-b border-gray-150 pb-3 mb-5">
              <BrainCircuit className="w-5 h-5 text-secondary" />
              <h3 className="font-display font-bold text-sm text-gray-700">AI Sentiment Analytics</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 items-center flex-grow">
              
              {/* Radial speedometer gauge */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-[120px] h-[120px]">
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
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-1">Sentiment</label>
                  </div>
                </div>

                {/* Progress bars ratio indicator */}
                <div className="w-full space-y-1.5">
                  <div className="h-2 rounded-full bg-gray-100 flex overflow-hidden">
                    <div className="bg-primary" style={{ width: `${sentiment.positivePercentage}%` }}></div>
                    <div className="bg-secondary" style={{ width: `${sentiment.negativePercentage}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-semibold">
                    <span className="text-primary flex items-center gap-0.5"><Smile className="w-3 h-3" /> Pos: {sentiment.positivePercentage}%</span>
                    <span className="text-secondary flex items-center gap-0.5"><Frown className="w-3 h-3" /> Neg: {sentiment.negativePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Takeaways Bubble */}
              <div className="space-y-2 self-start">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hasil Evaluasi AI:</h5>
                <div className="bg-primary-light border-l-4 border-primary rounded-r-xl p-4 text-xs leading-relaxed text-[#004d4d]">
                  {sentiment.keyTakeaways}
                </div>
              </div>

            </div>
          </div>

          {/* Catalog Manager Bento Box (Col Span 2) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 col-span-1 md:col-span-2 flex flex-col">
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

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 flex-grow">
              {activeMerchant.catalog.length > 0 ? (
                activeMerchant.catalog.map(item => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center gap-4 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col">
                      <strong className="text-xs text-gray-800 font-bold">{item.name}</strong>
                      <span className="text-[10px] text-gray-500 leading-snug mt-0.5">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <strong className="text-xs font-display font-bold text-secondary">Rp {item.price.toLocaleString('id-ID')}</strong>
                      <button 
                        onClick={() => handleDeleteCatalog(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-400 py-10">Katalog menu Anda kosong.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        <p className="text-center text-gray-400">Loading UMKM data...</p>
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

    </div>
  )
}

export default UmkmPortal
