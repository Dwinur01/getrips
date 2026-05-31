import React, { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, Sparkles, MapPin, ListTodo, ShieldAlert, Lock, Send, ShieldX, Utensils, Compass, Loader2, TreePine, Church, Landmark, Star, Download, MessageSquare, RefreshCw, Home, UserCircle, ArrowRight, Edit2, Trash2, Search } from 'lucide-react'
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

function WisatawanPortal({ merchants, reviews, globalApiKey, onRefresh, user, showToast }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(tomorrowStr)
  
  const [budget, setBudget] = useState(200000)
  const [duration, setDuration] = useState('2')
  const [preferences, setPreferences] = useState(['kuliner', 'sejarah'])
  const [allergies, setAllergies] = useState('')

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end >= start) {
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        setDuration(Math.min(Math.max(diffDays, 1), 7).toString())
      } else {
        setDuration('1')
      }
    }
  }, [startDate, endDate])
  
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

  // Sub-page navigation states
  const [activePage, setActivePage] = useState('beranda')

  // Destinasi page states
  const [destFilter, setDestFilter] = useState('semua')
  const [destSearch, setDestSearch] = useState('')

  // Ulasan page — edit & delete states
  const [editingReview, setEditingReview] = useState(null)  // { id, text, rating }
  const [editRevText, setEditRevText] = useState('')
  const [editRevRating, setEditRevRating] = useState('5')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [reviewSort, setReviewSort] = useState('terbaru')

  // Profil page states
  const [profileEdit, setProfileEdit] = useState(false)
  const [newFullname, setNewFullname] = useState(user?.fullname || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const wisatawanTabs = [
    { id: 'beranda',    label: 'Beranda',    Icon: Home },
    { id: 'rencanakan', label: 'Rencanakan', Icon: Sparkles },
    { id: 'destinasi',  label: 'Destinasi',  Icon: MapPin },
    { id: 'ulasan',     label: 'Ulasan',     Icon: Star,
      badge: reviews.length > 0 ? reviews.length : null },
    { id: 'profil',     label: 'Profil',     Icon: UserCircle,
      badge: !user ? '!' : null },
  ]

  const [focusCoords, setFocusCoords] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Smooth scroll ref
  const timelineRef = useRef(null)

  // Leaflet refs
  const mapContainerRef = useRef(null)
  const mapInstance = useRef(null)
  const routeLayerGroup = useRef(null)

  const handleFocusOnMap = (lat, lng) => {
    setActiveTab('map-view');
    setFocusCoords({ lat, lng });
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.setView([lat, lng], 16, { animate: true });
      }
    }, 150);
  };

  const triggerConfetti = () => {
    const colors = ['#006666', '#e05624', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 0.8}s`,
      size: `${6 + Math.random() * 8}px`
    }));
    setConfettiPieces(pieces);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handleResetForm = () => {
    setBudget(200000);
    setStartDate(todayStr);
    setEndDate(tomorrowStr);
    setDuration('2');
    setPreferences(['kuliner', 'sejarah']);
    setAllergies('');
    setItinerary(null);
    setActiveTab('map-view');
    if (routeLayerGroup.current) {
      routeLayerGroup.current.clearLayers();
      plotMarkers();
    }
  };

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
    if (typeof L === 'undefined') return

    let isMounted = true

    if (activePage === 'rencanakan' && activeTab === 'map-view') {
      if (!mapInstance.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([-7.1610, 112.6565], 13)
        mapInstance.current = map
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map)

        routeLayerGroup.current = L.layerGroup().addTo(map)

        setTimeout(() => {
          if (isMounted && mapInstance.current) {
            mapInstance.current.invalidateSize()
            plotMarkers()
            if (itinerary && itinerary.timeline) {
              drawRoute(itinerary.timeline)
            }
          }
        }, 150)
      } else if (mapInstance.current) {
        setTimeout(() => {
          if (isMounted && mapInstance.current) {
            mapInstance.current.invalidateSize()
            plotMarkers()
            if (itinerary && itinerary.timeline) {
              drawRoute(itinerary.timeline)
            }
          }
        }, 100)
      }
    }

    return () => {
      isMounted = false
      if (activePage !== 'rencanakan' && mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        routeLayerGroup.current = null
      }
    }
  }, [activePage, activeTab, merchants, itinerary])

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
      const details = getCategoryDetails(m.type)
      const iconHtml = `<div class="bg-gradient-to-br ${details.gradient} w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 border-white text-xs shadow-lg transition-all duration-300 hover:scale-120 hover:rotate-12 cursor-pointer select-none">
        ${details.emoji}
      </div>`
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -12]
      })

      const popupContent = `
        <div style="font-family: sans-serif; padding: 2px;">
          <h4 style="margin:0 0 2px 0; color:#006666; font-size:13px; font-weight:700;">${m.name}</h4>
          <p style="margin:0 0 4px 0; font-size:10px; color:${details.markerColor}; font-weight:700;">${details.emoji} ${details.label}</p>
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
        html: `<div class="bg-slate-900 text-white font-mono text-[10px] font-extrabold w-[42px] h-[20px] rounded-lg border-2 border-white shadow-md flex items-center justify-center">Day ${item.day}</div>`,
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
        triggerConfetti();
      
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

  const selectedReviewMerchant = merchants.find(m => m.id === revMerchantId);

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Portal Header */}
      <header className="border-b border-gray-200 pb-5">
        <h2 className="font-display font-bold text-2xl text-primary">Eksplorasi Pariwisata Gresik</h2>
        <p className="text-sm text-gray-500">Rencanakan perjalanan impian Anda dengan AI Itinerary Planner pintar dan terlindung.</p>
      </header>

      {/* Horizontal Sub-Navigation (Responsive Scrollable on Mobile, Wrap on Desktop) */}
      <nav className="flex overflow-x-auto md:overflow-x-visible md:flex-wrap gap-1 bg-gray-100 p-1.5 rounded-2xl mb-6 scrollbar-none flex-nowrap md:flex-row">
        {wisatawanTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className={`flex-shrink-0 md:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 md:px-2 rounded-xl text-xs font-semibold transition-all duration-300 transform active:scale-95 ${
              activePage === tab.id
                ? 'bg-white text-primary shadow-sm scale-102 font-bold'
                : 'text-gray-550 hover:text-primary hover:bg-white/50'
            }`}
          >
            <tab.Icon className={`w-3.5 h-3.5 shrink-0 ${
              activePage === tab.id
                ? tab.id === 'beranda' ? 'text-[#006666]' :
                  tab.id === 'rencanakan' ? 'text-indigo-600 font-bold' :
                  tab.id === 'destinasi' ? 'text-[#e05624] font-bold' :
                  tab.id === 'ulasan' ? 'text-amber-500 font-bold' :
                  'text-blue-600 font-bold'
                : 'text-gray-400'
            }`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* 1.1 — Sub-Halaman Beranda */}
      {activePage === 'beranda' && (
        <div className="space-y-8 animate-fade-in">
          {/* Hero Banner */}
          <div className="relative bg-gradient-to-br from-[#006666] via-[#007777] to-[#005555] rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Didukung Google Gemini AI</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl leading-tight mb-3">
                Jelajahi Gresik<br />Bersama AI 🌿
              </h2>
              <p className="text-sm text-teal-100 leading-relaxed mb-6 max-w-md">
                Rencanakan wisata sejarah dan kuliner Gresik secara cerdas, aman,
                dan personal — dilindungi AI WAF canggih.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActivePage('rencanakan')}
                  className="bg-white text-primary font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Mulai Rencanakan
                </button>
                <button onClick={() => setActivePage('destinasi')}
                  className="bg-white/10 border border-white/20 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/20 active:scale-95 transition-all flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Lihat Destinasi
                </button>
              </div>
            </div>
          </div>

          {/* Stat Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Destinasi & Kuliner', value: merchants.length, icon: '🏛️', color: 'bg-teal-50 text-teal-700 border-teal-200' },
              { label: 'Total Ulasan', value: reviews.length, icon: '⭐', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'AI Itinerary', value: 'Gemini', icon: '🤖', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Proteksi WAF', value: 'Aktif', icon: '🛡️', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            ].map((stat, i) => (
              <div key={i} className={`border rounded-2xl p-5 flex items-center gap-4 ${stat.color}`}>
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <p className="font-display font-extrabold text-2xl leading-none">{stat.value}</p>
                  <p className="text-[10px] font-semibold mt-1 opacity-80">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Top 3 Destinasi Populer */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-gray-800">🔥 Destinasi Populer</h3>
              <button onClick={() => setActivePage('destinasi')}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...merchants].sort((a, b) => b.rating - a.rating).slice(0, 3).map(m => (
                <div key={m.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  onClick={() => setActivePage('destinasi')}>
                  <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br ${getCategoryDetails(m.type).gradient} text-white`}>
                        {getCategoryDetails(m.type).emoji}
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-white bg-gradient-to-r ${getCategoryDetails(m.type).gradient}`}>
                      {getCategoryDetails(m.type).emoji} {getCategoryDetails(m.type).label}
                    </span>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-1">{m.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{getCategoryDetails(m.type).label} Unggulan Gresik</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">★ {m.rating}</span>
                      <span className="text-[10px] text-gray-400">{m.reviewsCount} ulasan</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Ulasan Terbaru */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-gray-800">💬 Ulasan Terbaru</h3>
              <button onClick={() => setActivePage('ulasan')}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.slice(0, 3).map(r => {
                const mName = merchants.find(m => m.id === r.merchantId)?.name || 'UMKM'
                return (
                  <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center">
                        {r.userName.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs font-semibold">{r.userName}</p>
                        <p className="text-[10px] text-gray-400">{mName}</p>
                      </div>
                      <span className="text-xs text-amber-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2">"{r.text}"</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1.2 — Sub-Halaman Rencanakan */}
      {activePage === 'rencanakan' && (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 animate-fade-in">
          
          {/* Left Side: Setup parameters */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 h-fit">
            <div className="flex items-center justify-between border-b-2 border-primary-light pb-3 mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-primary">Rancang Perjalanan</h3>
              </div>
              {(itinerary || allergies || preferences.length !== 2) && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  title="Reset semua preferensi"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <form onSubmit={handleItinerarySubmit} className="space-y-5">
              {/* Budget */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold flex justify-between">
                  <span>Anggaran Perjalanan (IDR)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-gray-400">Rp</span>
                  <input 
                    type="number" 
                    min="100000" 
                    step="10000"
                    value={budget}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBudget(isNaN(val) ? 100000 : val);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Contoh: 150000"
                  />
                </div>
                {budget < 100000 && (
                  <span className="text-[10px] text-red-500 font-medium mt-0.5">Minimal anggaran adalah Rp 100.000</span>
                )}
                <span className="text-[9px] text-gray-400 font-semibold mt-0.5 block">Ditulis sendiri, minimal Rp 100rb & kelipatan Rp 10rb</span>
              </div>

              {/* Tenggang Waktu Berwisata (Kalender) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Tenggang Waktu Berwisata</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Mulai</span>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Selesai</span>
                    <input 
                      type="date" 
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-primary w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-2.5 mt-1">
                  <span className="text-[10px] text-gray-500 font-semibold">Total Durasi:</span>
                  <span className="bg-[#006666] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {duration} Hari
                  </span>
                </div>
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
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
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
              {itinerary && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>Anggaran Terpakai</span>
                    <span className={itinerary.totalCost > budget ? 'text-red-500 font-bold' : 'text-primary font-bold'}>
                      Rp {itinerary.totalCost?.toLocaleString('id-ID')} / Rp {budget.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        (itinerary.totalCost / budget) > 1
                          ? 'bg-red-500'
                          : (itinerary.totalCost / budget) > 0.8
                            ? 'bg-amber-500'
                            : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((itinerary.totalCost / budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>{Math.round((itinerary.totalCost / budget) * 100)}% terpakai</span>
                    <span className={itinerary.totalCost > budget ? 'text-red-500' : 'text-emerald-600'}>
                      {itinerary.totalCost > budget
                        ? `⚠️ Melebihi Rp ${(itinerary.totalCost - budget).toLocaleString('id-ID')}`
                        : `✅ Sisa Rp ${(budget - itinerary.totalCost).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Map & Timeline tabs */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-4 sm:p-6 flex flex-col min-h-[480px]">
            
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
              <div className="flex gap-x-4 gap-y-2 mt-3 text-xs font-semibold text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#e05624] inline-block"></span> 🍽️ Kuliner</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#006666] inline-block"></span> 🏛️ Sejarah</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10b981] inline-block"></span> 🌲 Alam</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#8b5cf6] inline-block"></span> 🕌 Religi</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3b82f6] inline-block"></span> 🛍️ Belanja</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f43f5e] inline-block"></span> 🎡 Rekreasi</span>
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
                          <span className={`absolute left-[-26px] top-[4px] w-3 h-3 rounded-full border-2 border-white shadow bg-gradient-to-br ${getCategoryDetails(item.type).gradient}`}></span>

                          <div className={`rounded-xl p-4 bg-gray-50 border-l-4 transition-all hover:bg-gray-100 ${
                            item.type === 'kuliner' ? 'border-secondary' : 'border-primary'
                          }`}>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{item.time} • Hari {item.day}</span>
                            <h5 className="font-display font-semibold text-sm text-gray-800 mt-0.5">{item.activity}</h5>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                            
                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-gray-200 text-[10px] font-semibold text-gray-500">
                              <span className="text-primary flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                              <span className="text-secondary">Estimasi: Rp {item.cost.toLocaleString('id-ID')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFocusOnMap(item.lat, item.lng)}
                              className="flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline mt-1 transition-all"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Lihat di Peta</span>
                            </button>
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
      )}

      {/* 1.3 — Sub-Halaman Destinasi (READ) */}
      {activePage === 'destinasi' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-gray-800">Semua Destinasi & Kuliner</h3>
              <p className="text-xs text-gray-500 mt-0.5">{merchants.length} tempat di Kabupaten Gresik</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Semua', 'Kuliner', 'Sejarah', 'Alam', 'Religi', 'Belanja', 'Rekreasi'].map(f => (
                <button key={f} onClick={() => setDestFilter(f.toLowerCase())}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    destFilter === f.toLowerCase()
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input type="text" value={destSearch} onChange={e => setDestSearch(e.target.value)}
              placeholder="Cari nama tempat atau deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {merchants
              .filter(m => {
                const matchFilter = destFilter === 'semua' || m.type === destFilter
                const matchSearch = m.name.toLowerCase().includes(destSearch.toLowerCase()) ||
                  m.description?.toLowerCase().includes(destSearch.toLowerCase())
                return matchFilter && matchSearch
              })
              .map(m => (
                <div key={m.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between">
                  <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br ${getCategoryDetails(m.type).gradient} text-white`}>
                        {getCategoryDetails(m.type).emoji}
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm text-white bg-gradient-to-r ${getCategoryDetails(m.type).gradient}`}>
                      {getCategoryDetails(m.type).emoji} {getCategoryDetails(m.type).label}
                    </span>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-1">{m.name}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{m.description}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(m.rating / 5) * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">★ {m.rating}</span>
                        <span className="text-[10px] text-gray-400">({m.reviewsCount})</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setActivePage('rencanakan'); setPreferences(p => p.includes(m.type) ? p : [...p, m.type]) }}
                          className="flex-1 bg-primary-light text-primary text-[10px] font-bold py-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                          + Tambah ke Rute
                        </button>
                        <button
                          onClick={() => { setActivePage('ulasan'); setRevMerchantId(m.id) }}
                          className="flex-grow flex-1 border border-gray-200 text-gray-600 text-[10px] font-bold py-2 rounded-xl hover:border-primary hover:text-primary transition-all">
                          ⭐ Tulis Ulasan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 1.4 — Sub-Halaman Ulasan (CREATE + READ + UPDATE + DELETE) */}
      {activePage === 'ulasan' && (
        <div className="space-y-6 animate-fade-in">
          {/* Form CREATE Review */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <h3 className="font-display font-bold text-xl text-primary mb-1">Berikan Ulasan</h3>
            <p className="text-xs text-gray-500 mb-4">Ulasan Anda disaring otomatis dan dicatat secara preventif di bawah perlindungan AI WAF.</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Pilih Tempat</label>
                  <select 
                    value={revMerchantId}
                    onChange={(e) => setRevMerchantId(e.target.value)}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  >
                    {merchants.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({getCategoryDetails(m.type).label})</option>
                    ))}
                  </select>
                  {selectedReviewMerchant && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-3 mt-1.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold bg-gradient-to-br ${getCategoryDetails(selectedReviewMerchant.type).gradient}`}>
                        {getCategoryDetails(selectedReviewMerchant.type).emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{selectedReviewMerchant.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          ⭐ {selectedReviewMerchant.rating} ({selectedReviewMerchant.reviewsCount} ulasan)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Nama Anda</label>
                  <input 
                    type="text" 
                    value={revUserName}
                    onChange={(e) => setRevUserName(e.target.value)}
                    placeholder="Nama Ulasan (cth: Budi_Wisatawan)" 
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
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold">Tulis Ulasan Anda</label>
                  <span className={`text-[10px] font-semibold ${revText.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                    {revText.length}/1000
                  </span>
                </div>
                <textarea 
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                  placeholder="Bagikan ulasan objektif mengenai rasa, kenyamanan, atau nilai sejarah objek wisata..." 
                  required
                  rows="4"
                  maxLength={1000}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-y"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white rounded-xl py-2.5 font-display font-semibold text-xs flex items-center justify-center gap-1.5 w-fit px-6 shadow-md shadow-primary/10 transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Ulasan</span>
              </button>
            </form>
          </div>

          {/* READ + Filter + Sort */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="font-display font-bold text-lg text-gray-800">
                Semua Ulasan ({reviews.length})
              </h4>
              <div className="flex gap-2 flex-wrap">
                {/* Filter by merchant */}
                <select value={reviewFilter} onChange={e => setReviewFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] bg-white outline-none focus:border-primary text-gray-600 font-semibold">
                  <option value="all">Semua Tempat</option>
                  {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {/* Sort */}
                {['terbaru', 'tertinggi', 'terendah'].map(s => (
                  <button key={s} onClick={() => setReviewSort(s)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      reviewSort === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary'
                    }`}>
                    {s === 'terbaru' ? '🕐 Terbaru' : s === 'tertinggi' ? '⭐ Tertinggi' : '▼ Terendah'}
                  </button>
                ))}
              </div>
            </div>

            {/* List Reviews dengan Edit + Delete */}
            <div className="space-y-3">
              {reviews
                .filter(r => reviewFilter === 'all' || r.merchantId === reviewFilter)
                .sort((a, b) => {
                  if (reviewSort === 'terbaru') return new Date(b.timestamp) - new Date(a.timestamp)
                  if (reviewSort === 'tertinggi') return b.rating - a.rating
                  return a.rating - b.rating
                })
                .slice(0, reviewPage)
                .map(r => {
                  const mName = merchants.find(m => m.id === r.merchantId)?.name || 'UMKM'
                  const isOwner = user && r.userName === user.fullname
                  const isEditing = editingReview?.id === r.id

                  return (
                    <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      {isEditing ? (
                        /* UPDATE Form inline */
                        <div className="space-y-3">
                          <div className="flex flex-row-reverse justify-end gap-1 text-xl text-gray-300">
                            {[5,4,3,2,1].map(num => (
                              <label key={num} className="cursor-pointer">
                                <input type="radio" name="editRating" value={num}
                                  checked={parseInt(editRevRating) === num}
                                  onChange={() => setEditRevRating(num.toString())}
                                  className="hidden" />
                                <span className={parseInt(editRevRating) >= num ? 'text-amber-400' : 'text-gray-300'}>★</span>
                              </label>
                            ))}
                          </div>
                          <textarea value={editRevText} onChange={e => setEditRevText(e.target.value)}
                            rows={3} maxLength={1000}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-none bg-white" />
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/reviews/${r.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ text: editRevText, rating: parseInt(editRevRating) })
                                  })
                                  if (!res.ok) throw new Error('Gagal update ulasan')
                                  showToast('Ulasan berhasil diperbarui ✅', 'success')
                                  setEditingReview(null)
                                  onRefresh()
                                } catch (err) { showToast(err.message, 'error') }
                              }}
                              className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-dark active:scale-95 transition-all">
                              Simpan
                            </button>
                            <button onClick={() => setEditingReview(null)}
                              className="border border-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all">
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* READ Card */
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center">
                                {r.userName.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-xs font-semibold block leading-tight">{r.userName}</span>
                                <span className="text-[10px] text-gray-400">di {mName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-450">{'★'.repeat(r.rating) + '☆'.repeat(5-r.rating)}</span>
                              {/* Edit + Delete hanya muncul untuk pemilik ulasan */}
                              {isOwner && (
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => { setEditingReview(r); setEditRevText(r.text); setEditRevRating(r.rating.toString()) }}
                                    className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Edit ulasan">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' })
                                        if (!res.ok) throw new Error('Gagal menghapus ulasan')
                                        showToast('Ulasan berhasil dihapus', 'info')
                                        onRefresh()
                                      } catch (err) { showToast(err.message, 'error') }
                                    }}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Hapus ulasan">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 italic">"{r.text}"</p>
                          <span className="text-[10px] text-gray-450 block text-right mt-1">
                            {new Date(r.timestamp).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

              {reviews.filter(r => reviewFilter === 'all' || r.merchantId === reviewFilter).length > reviewPage && (
                <button onClick={() => setReviewPage(p => p + 5)}
                  className="w-full text-center py-2.5 text-xs text-primary font-bold hover:underline">
                  Lihat lebih banyak →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1.5 — Sub-Halaman Profil Saya (READ + UPDATE) */}
      {activePage === 'profil' && (
        <div className="space-y-6 animate-fade-in max-w-lg">
          <div>
            <h3 className="font-display font-bold text-xl text-gray-800">👤 Profil Saya</h3>
            <p className="text-xs text-gray-500 mt-1">Kelola informasi akun wisatawan Anda</p>
          </div>

          {!user ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-sm font-semibold text-amber-700 mb-3">Anda belum login</p>
              <button onClick={() => { setShowLoginModal(true); setAuthMode('login'); }}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
                Login / Daftar Sekarang
              </button>
            </div>
          ) : (
            <>
              {/* READ — Info Akun */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-md shrink-0">
                    {user.fullname.substring(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-lg text-gray-800 truncate">{user.fullname}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                    <span className="text-[10px] font-bold px-2 py-1 bg-primary-light text-primary rounded-full mt-1.5 inline-block uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Ulasan Dikirim</p>
                    <p className="font-display font-bold text-xl text-primary mt-1">
                      {reviews.filter(r => r.userName === user.fullname).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Itinerary Dibuat</p>
                    <p className="font-display font-bold text-xl text-secondary mt-1">
                      {itinerary ? 1 : 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* UPDATE — Edit Profil */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-gray-700">Edit Informasi Akun</h4>
                  <button onClick={() => { setProfileEdit(!profileEdit); setNewFullname(user.fullname); setNewPassword(''); setConfirmPassword(''); }}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" />
                    {profileEdit ? 'Batal' : 'Edit'}
                  </button>
                </div>

                {profileEdit ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Nama Lengkap Baru</label>
                      <input type="text" value={newFullname} onChange={e => setNewFullname(e.target.value)}
                        placeholder={user.fullname}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Password Baru (kosongkan jika tidak ingin ubah)</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white" />
                    </div>
                    {newPassword && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold">Konfirmasi Password Baru</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru"
                          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white" />
                      </div>
                    )}
                    <button
                      disabled={isUpdatingProfile}
                      onClick={async () => {
                        if (newPassword && newPassword !== confirmPassword) {
                          showToast('Password baru tidak cocok!', 'error'); return
                        }
                        if (newPassword && newPassword.length < 6) {
                          showToast('Password minimal 6 karakter', 'warning'); return
                        }
                        setIsUpdatingProfile(true)
                        try {
                          const res = await fetch(`/api/auth/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              username: user.username,
                              fullname: newFullname || user.fullname,
                              ...(newPassword && { password: newPassword })
                            })
                          })
                          if (!res.ok) throw new Error('Gagal memperbarui profil')
                          const data = await res.json()
                          localStorage.setItem('grestrip_user', JSON.stringify(data.user))
                          setUser(data.user)
                          showToast('Profil berhasil diperbarui! ✅', 'success')
                          setProfileEdit(false)
                          setNewPassword('')
                          setConfirmPassword('')
                        } catch (err) { showToast(err.message, 'error') }
                        finally { setIsUpdatingProfile(false) }
                      }}
                      className="bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                      {isUpdatingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-gray-650">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400 text-xs font-semibold">Nama Lengkap</span>
                      <span className="font-semibold">{user.fullname}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400 text-xs font-semibold">Username</span>
                      <span className="font-semibold">@{user.username}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400 text-xs font-semibold">Password</span>
                      <span className="font-semibold text-gray-405">••••••••</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

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

      {showConfetti && confettiPieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: '-10px',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay
          }}
        />
      ))}
    </div>
  )
}

export default WisatawanPortal

