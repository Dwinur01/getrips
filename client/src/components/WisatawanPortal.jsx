import React, { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, Sparkles, MapPin, ListTodo, ShieldAlert, Lock, Send, ShieldX, Utensils, Compass, Loader2, TreePine, Church, Landmark, Star, Download, MessageSquare } from 'lucide-react'

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3 border border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50">
    <Icon className="w-12 h-12 text-gray-300" />
    <div className="text-center">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <p className="text-[10px] text-gray-450 mt-1">{subtitle}</p>
    </div>
  </div>
);

function WisatawanPortal({ merchants, reviews, globalApiKey, onRefresh, user, showToast }) {
  const [budget, setBudget] = useState(200000)
  const [duration, setDuration] = useState('2')
  const [preferences, setPreferences] = useState(['kuliner', 'sejarah'])
  const [allergies, setAllergies] = useState('')
  
  const [activeTab, setActiveTab] = useState('map-view')
  const [itinerary, setItinerary] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  // UGC Review states
  const [revMerchantId, setRevMerchantId] = useState('')
  const [revUserName, setRevUserName] = useState(user?.fullname || '')
  const [revRating, setRevRating] = useState('5')
  const [revText, setRevText] = useState('')

  // WAF Threat block modal
  const [wafBlock, setWafBlock] = useState(null)

  // Filter for Timeline
  const [timelineFilter, setTimelineFilter] = useState('default')

  // Review pagination
  const [reviewPage, setReviewPage] = useState(5)

  // Smooth scroll ref
  const timelineRef = useRef(null)

  // Leaflet refs
  const mapContainerRef = useRef(null)
  const mapInstance = useRef(null)
  const routeLayerGroup = useRef(null)

  // Auto-fill from user session
  useEffect(() => {
    if (user?.fullname) {
      setRevUserName(user.fullname);
    } else {
      setRevUserName('');
    }
  }, [user]);

  // Set default merchant ID once merchants load
  useEffect(() => {
    if (merchants.length > 0 && !revMerchantId) {
      setRevMerchantId(merchants[0].id)
    }
  }, [merchants])

  // Initialize Map
  useEffect(() => {
    if (!mapInstance.current && mapContainerRef.current) {
      mapInstance.current = L.map(mapContainerRef.current).setView([-7.1610, 112.6565], 13)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current)

      routeLayerGroup.current = L.layerGroup().addTo(mapInstance.current)
    }
    plotMarkers()
  }, [merchants])

  // Refresh size on tab changes
  useEffect(() => {
    if (activeTab === 'map-view' && mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize()
      }, 100)
    }
  }, [activeTab])

  const plotMarkers = () => {
    if (!mapInstance.current || !routeLayerGroup.current) return
    routeLayerGroup.current.clearLayers()

    merchants.forEach(m => {
      const bgClass = m.type === "kuliner" ? "bg-[#e05624]" : "bg-[#006666]"
      
      // Simulating custom icons inside div element
      const iconHtml = `<div class="${bgClass} w-[28px] h-[28px] rounded-full flex items-center justify-center border-2 border-white text-white shadow-md transition-transform duration-200 hover:scale-115 hover:rotate-6">
        <span class="text-[9px] font-bold">${m.type === 'kuliner' ? 'K' : 'W'}</span>
      </div>`
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -10]
      })

      const popupContent = `
        <div style="font-family: sans-serif; padding: 2px;">
          <h4 style="margin:0 0 2px 0; color:#006666; font-size:13px; font-weight:700;">${m.name}</h4>
          <p style="margin:0 0 4px 0; font-size:10px; color:#6b7280; font-weight:600;">${m.type === 'kuliner' ? 'Kuliner UMKM' : 'Wisata Sejarah'}</p>
          <p style="margin:0 0 4px 0; font-size:11px; color:#374151; line-height:1.3;">${m.description.substring(0, 90)}...</p>
          <span style="font-size:11px; color:#f59e0b; font-weight:600;">⭐ ${m.rating} (${m.reviewsCount} Ulasan)</span>
        </div>
      `

      L.marker(m.coords, { icon: customIcon })
       .bindPopup(popupContent)
       .addTo(routeLayerGroup.current)
    })
  }

  const drawRoute = (timeline) => {
    if (!mapInstance.current || !routeLayerGroup.current || !timeline || timeline.length === 0) return
    routeLayerGroup.current.clearLayers()
    plotMarkers() // plot basic icons

    const points = []
    timeline.forEach(item => {
      points.push([item.lat, item.lng])

      const seqIcon = L.divIcon({
        html: `<div class="bg-slate-900 text-white font-mono text-[9px] font-extrabold w-[42px] h-[20px] rounded-lg border-2 border-white shadow-md flex items-center justify-center">Day ${item.day}</div>`,
        className: '',
        iconSize: [42, 20],
        iconAnchor: [21, 10]
      })

      L.marker([item.lat, item.lng], { icon: seqIcon })
       .bindPopup(`<strong>Day ${item.day} - Activity</strong><br>${item.activity}<br>${item.time}`)
       .addTo(routeLayerGroup.current)
    })

    const polyline = L.polyline(points, {
      color: '#e05624',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(routeLayerGroup.current)

    mapInstance.current.fitBounds(polyline.getBounds(), { padding: [40, 40] })
  }

  // Handle Itinerary generation
  const handleItinerarySubmit = async (e) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: budget.toString(),
          duration,
          preferences,
          allergies,
          userKey: globalApiKey
        })
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memuat rencana perjalanan.");
      }

      const data = await response.json()
      setItinerary(data)
      
      // Auto-switch to Timeline View Tab
      setActiveTab('timeline-view')

      // Draw map overlay
      setTimeout(() => {
        drawRoute(data.timeline)
      }, 50)

      // Smooth scroll to timeline
      setTimeout(() => {
        timelineRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 150)

      showToast(`Itinerary ${data.timeline?.length || 0} aktivitas berhasil dibuat oleh AI! 🗺️`, 'success')

    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveItinerary = () => {
    const blob = new Blob([JSON.stringify(itinerary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-gresik-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Itinerary berhasil disimpan!', 'success');
  };

  // Handle Checked Preference Tags
  const handlePrefChange = (prefVal) => {
    if (preferences.includes(prefVal)) {
      setPreferences(preferences.filter(p => p !== prefVal))
    } else {
      setPreferences([...preferences, prefVal])
    }
  }

  // Handle UGC Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    
    if (!revMerchantId || !revUserName.trim() || !revText.trim()) return

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: revMerchantId,
          userName: revUserName.trim(),
          rating: parseInt(revRating),
          text: revText.trim(),
          userKey: globalApiKey
        })
      })

      const data = await response.json()

      if ((response.status === 403 || response.status === 429) && data.isBlocked) {
        setWafBlock(data)
        return
      }

      if (!response.ok) throw new Error(data.error || "Gagal mengirim ulasan")

      // Clean
      setRevText('')
      showToast("Ulasan berhasil dikirim dan lolos AI WAF! ✅", "success")
      onRefresh()

    } catch (err) {
      showToast(err.message, "error")
    }
  }

  const getSortedTimeline = () => {
    if (!itinerary || !itinerary.timeline) return [];
    let items = [...itinerary.timeline];
    
    const refLat = -7.1610;
    const refLng = 112.6565;
    
    const getDistance = (lat, lng) => {
      return Math.sqrt(Math.pow(lat - refLat, 2) + Math.pow(lng - refLng, 2));
    };

    const getMerchantRating = (locationName) => {
      const merchant = merchants.find(m => m.name.toLowerCase() === locationName.toLowerCase());
      return merchant ? merchant.rating : 5.0;
    };

    if (timelineFilter === 'terdekat') {
      items.sort((a, b) => getDistance(a.lat, a.lng) - getDistance(b.lat, b.lng));
    } else if (timelineFilter === 'terjauh') {
      items.sort((a, b) => getDistance(b.lat, b.lng) - getDistance(a.lat, a.lng));
    } else if (timelineFilter === 'termurah') {
      items.sort((a, b) => a.cost - b.cost);
    } else if (timelineFilter === 'termahal') {
      items.sort((a, b) => b.cost - a.cost);
    } else if (timelineFilter === 'terbagus') {
      items.sort((a, b) => getMerchantRating(b.location) - getMerchantRating(a.location));
    } else if (timelineFilter === 'terjelek') {
      items.sort((a, b) => getMerchantRating(a.location) - getMerchantRating(b.location));
    }
    
    return items;
  };

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Portal Header */}
      <header className="border-b border-gray-200 pb-5">
        <h2 className="font-display font-bold text-2xl text-primary">Eksplorasi Pariwisata Gresik</h2>
        <p className="text-sm text-gray-500">Rencanakan perjalanan impian Anda dengan AI Itinerary Planner pintar dan terlindung.</p>
      </header>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        
        {/* Left Side: Setup parameters */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 h-fit">
          <div className="flex items-center gap-2 border-b-2 border-primary-light pb-3 mb-5">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-primary">Rancang Perjalanan Anda</h3>
          </div>

          <form onSubmit={handleItinerarySubmit} className="space-y-5">
            {/* Budget */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex justify-between">
                <span>Anggaran Perjalanan (IDR)</span>
                <span className="text-secondary font-bold">Rp {budget.toLocaleString('id-ID')}</span>
              </label>
              <input 
                type="range" 
                min="30000" 
                max="500000" 
                step="10000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-1.5 rounded bg-gray-200 accent-secondary outline-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>Rp 30rb</span>
                <span>Rp 250rb</span>
                <span>Rp 500rb</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Durasi Kunjungan</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="1">1 Hari Wisata Cepat</option>
                <option value="2">2 Hari Rekreasi</option>
                <option value="3">3 Hari Eksplorasi Penuh</option>
              </select>
            </div>

            {/* Travel Preferences */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Preferensi Liburan</label>
              <div className="grid grid-cols-2 gap-2">
                {['kuliner', 'sejarah', 'alam', 'religi'].map(pref => {
                  const isChecked = preferences.includes(pref)
                  return (
                    <label 
                      key={pref}
                      className={`flex items-center justify-center gap-1.5 border rounded-xl py-2.5 cursor-pointer select-none transition-colors ${
                        isChecked 
                          ? 'border-primary bg-primary-light text-primary font-semibold' 
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handlePrefChange(pref)}
                        className="hidden"
                      />
                      <span className="text-[11px] capitalize flex items-center gap-1">
                        {pref === 'kuliner' && <Utensils className="w-3.5 h-3.5" />}
                        {pref === 'sejarah' && <Landmark className="w-3.5 h-3.5" />}
                        {pref === 'alam' && <TreePine className="w-3.5 h-3.5" />}
                        {pref === 'religi' && <Church className="w-3.5 h-3.5" />}
                        {pref}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Medical Encryption Guard */}
            <div className="bg-secondary-light border border-orange-100 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                <ShieldAlert className="w-4 h-4 text-secondary" />
                <span>Riwayat Alergi / Kondisi Medis</span>
              </div>
              <input 
                type="text" 
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Contoh: Alergi seafood / kacang tanah..." 
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-secondary"
              />
              <span className="text-[9px] text-gray-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3 text-gray-400" />
                Data terenkripsi simetris AES-256 pada database.
              </span>
            </div>

            <button 
              type="submit" 
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-display font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Merangkai Rute...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Rangkai Rute dengan AI</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Map & Timeline tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex flex-col min-h-[480px]">
          
          {/* Tabs */}
          <div className="flex gap-3 border-b border-gray-200 pb-3 mb-5">
            <button 
              onClick={() => setActiveTab('map-view')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all ${
                activeTab === 'map-view' 
                  ? 'bg-primary-light text-primary' 
                  : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta Rute</span>
            </button>

            <button 
              onClick={() => setActiveTab('timeline-view')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all ${
                activeTab === 'timeline-view' 
                  ? 'bg-primary-light text-primary' 
                  : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Timeline Detail</span>
              {itinerary && (
                <span className="ml-1.5 bg-[#e05624] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {itinerary.timeline?.length} aktivitas
                </span>
              )}
            </button>
          </div>

          {/* Map View */}
          <div className={`flex-grow flex flex-col ${activeTab === 'map-view' ? 'flex' : 'hidden'}`}>
            <div ref={mapContainerRef} className="flex-grow min-h-[380px] rounded-xl border border-gray-200 z-10"></div>
            <div className="flex gap-4 mt-3 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#e05624] inline-block"></span> Kuliner UMKM</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#006666] inline-block"></span> Wisata & Sejarah</span>
            </div>
          </div>

          {/* Timeline View */}
          <div className={`flex-grow flex-col ${activeTab === 'timeline-view' ? 'flex' : 'hidden'}`}>
            {itinerary ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="font-display font-bold text-lg text-primary leading-tight">{itinerary.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{itinerary.description}</p>
                  
                  {itinerary.allergyWarning && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-700" />
                      <span>{itinerary.allergyWarning}</span>
                    </div>
                  )}
                </div>

                {/* Visual Chips Filter for Timeline */}
                <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-600">Urutkan / Filter Rute:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 'default', label: 'Default', icon: '🗓️' },
                      { value: 'terdekat', label: 'Terdekat', icon: '📍' },
                      { value: 'termurah', label: 'Termurah', icon: '💰' },
                      { value: 'terbagus', label: 'Terbagus', icon: '⭐' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTimelineFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                          timelineFilter === opt.value 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-white text-gray-650 border-gray-200 hover:border-primary hover:text-primary'
                        }`}
                      >
                        <span className="mr-1">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={timelineRef} className="relative pl-5 border-l-2 border-gray-200 ml-2 space-y-5 flex-grow max-h-[400px] overflow-y-auto pr-2">
                  {getSortedTimeline().map((item, idx) => {
                    const isFood = item.type === "kuliner"
                    return (
                      <div key={idx} className="relative group">
                        {/* Bullet circle indicator */}
                        <span className={`absolute left-[-26px] top-[4px] w-3 h-3 rounded-full border-2 border-white shadow ${
                          isFood ? 'bg-secondary' : 'bg-primary'
                        }`}></span>

                        <div className={`rounded-xl p-4 bg-gray-50 border-l-4 transition-all hover:bg-gray-100 ${
                          isFood ? 'border-secondary' : 'border-primary'
                        }`}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{item.time} • Hari {item.day}</span>
                          <h5 className="font-display font-semibold text-sm text-gray-800 mt-0.5">{item.activity}</h5>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                          
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-gray-200 text-[10px] font-semibold text-gray-500">
                            <span className="text-primary flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                            <span className="text-secondary">Estimasi: Rp {item.cost.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-200 pt-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button 
                    type="button"
                    onClick={handleSaveItinerary} 
                    className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-xl text-xs font-semibold hover:bg-primary-light transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Simpan Itinerary (JSON)</span>
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Estimasi Anggaran Terpakai:</span>
                    <strong className="font-display font-bold text-xl text-secondary">Rp {itinerary.totalCost.toLocaleString('id-ID')}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                <ListTodo className="w-12 h-12 text-gray-200 animate-bounce" />
                <p className="text-xs">Timeline kosong. Jalankan perencanaan AI terlebih dahulu di panel kiri.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* UGC Review board */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 space-y-5">
        <div>
          <h3 className="font-display font-bold text-xl text-primary">Berikan Ulasan Kuliner & Destinasi</h3>
          <p className="text-xs text-gray-500 mt-0.5">Ulasan Anda disaring otomatis dan dicatat secara preventif di bawah perlindungan AI WAF.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          {/* Form */}
          <form onSubmit={handleReviewSubmit} className="space-y-4 lg:border-r lg:border-gray-200 lg:pr-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Pilih Tempat</label>
                <select 
                  value={revMerchantId}
                  onChange={(e) => setRevMerchantId(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                >
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type === 'kuliner' ? 'Kuliner' : 'Wisata'})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Nama Anda</label>
                <input 
                  type="text" 
                  value={revUserName}
                  onChange={(e) => setRevUserName(e.target.value)}
                  placeholder="Nama Ulasan (cth: Roni_Gresik)" 
                  required
                  readOnly={!!user}
                  className={`border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary ${
                    user ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Skor Rating</label>
              <div className="flex flex-row-reverse justify-end gap-1 text-2xl text-gray-300">
                {[5, 4, 3, 2, 1].map(num => (
                  <label key={num} className="cursor-pointer rating-label transition-colors duration-200">
                    <input 
                      type="radio" 
                      name="rating" 
                      value={num}
                      checked={parseInt(revRating) === num}
                      onChange={() => setRevRating(num.toString())}
                      className="hidden"
                    />
                    <span className={parseInt(revRating) >= num ? 'text-[#f59e0b]' : 'text-gray-300'}>★</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Tulis Ulasan Anda</label>
              <textarea 
                value={revText}
                onChange={(e) => setRevText(e.target.value)}
                placeholder="Bagikan ulasan objektif mengenai rasa, kenyamanan, atau nilai sejarah objek wisata..." 
                required
                rows="4"
                className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-y"
              ></textarea>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Log siber WAF diaktifkan: Dilarang keras memuat muatan kode peretasan/perundungan.
              </span>
            </div>

            <button 
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white rounded-xl py-2.5 font-display font-semibold text-xs flex items-center justify-center gap-1.5 w-fit px-6 shadow-md shadow-primary/10 transition-transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Ulasan</span>
            </button>
          </form>

          {/* List Review Feed */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-gray-700">Ulasan Terbaru Masuk</h4>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {reviews.length > 0 ? (
                <>
                  {reviews.slice(0, reviewPage).map(r => {
                    const mName = merchants.find(m => m.id === r.merchantId)?.name || 'UMKM'
                    return (
                      <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 transition-all hover:bg-gray-100">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center">
                              {r.userName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-semibold block leading-tight">{r.userName}</span>
                              <span className="text-[9px] text-gray-400">di {mName}</span>
                            </div>
                          </div>
                          <span className="text-xs text-[#f59e0b]">{"★".repeat(r.rating) + "☆".repeat(5-r.rating)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 italic">"{r.text}"</p>
                        <span className="text-[9px] text-gray-400 block text-right mt-2">{new Date(r.timestamp).toLocaleDateString('id-ID')}</span>
                      </div>
                    )
                  })}

                  {reviews.length > reviewPage && (
                    <button 
                      type="button"
                      onClick={() => setReviewPage(p => p + 5)}
                      className="w-full text-center py-2.5 text-xs text-primary font-bold hover:underline transition-all"
                    >
                      Lihat {Math.min(5, reviews.length - reviewPage)} ulasan lagi →
                    </button>
                  )}
                </>
              ) : (
                <EmptyState 
                  icon={MessageSquare}
                  title="Belum ada ulasan"
                  subtitle="Jadilah yang pertama memberikan ulasan untuk tempat ini!"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI WAF Block Alert Modal */}
      {wafBlock && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center backdrop-blur-sm p-4 animate-scale-in">
          <div className="bg-[#0d0909] border-2 border-red-600 rounded-2xl max-w-[460px] w-full p-6 text-center text-red-400 shadow-2xl shadow-red-900/50">
            <div className="w-16 h-16 rounded-full bg-red-950/40 text-red-500 border border-red-700/60 flex items-center justify-center mx-auto mb-4 led-red-pulse">
              <ShieldX className="w-10 h-10" />
            </div>
            
            <h2 className="font-display font-extrabold text-white text-xl mb-2">Aktivitas Siber Diblokir!</h2>
            <p className="text-red-300 text-xs leading-relaxed mb-4">{wafBlock.reason}</p>
            
            <div className="bg-[#1c0d0d] border border-red-900 rounded-lg p-3 text-left font-mono text-[10px] text-red-300 mb-5 overflow-x-auto">
              <strong className="block text-red-500 font-bold mb-1">Payload Terdeteksi & Diisolasi:</strong>
              <span className="text-red-400 font-bold">{wafBlock.highlight}</span>
            </div>

            <button 
              onClick={() => setWafBlock(null)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 px-6 font-display font-semibold text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-transform w-full"
            >
              Keluar Konsol Keamanan
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default WisatawanPortal
