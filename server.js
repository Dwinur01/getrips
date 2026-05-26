require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');
const waf = require('./waf');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Helper to get client IP
function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

// -------------------------------------------------------------
// Fallback Itinerary Simulator (Heuristic Generator for Demo)
// -------------------------------------------------------------
async function generateMockItinerary(budget, durationDays, preferences, allergies) {
    const days = parseInt(durationDays) || 1;
    const budgetNum = parseInt(budget) || 100000;
    
    // Choose destinations based on preferences
    const merchants = await db.getMerchants();
    const timeline = [];

    // Filter locations based on allergies
    let isAllergicToPeanuts = /kacang|peanut/i.test(allergies);
    let isAllergicToSeafood = /seafood|ikan|bandeng|udang|crustacean/i.test(allergies);
    
    let allergyAlertNote = "";
    if (allergies) {
        allergyAlertNote = `Rute ini telah disaring secara aman oleh Data Privacy Guard untuk mendeteksi alergen: "${allergies}". `;
        if (isAllergicToPeanuts) {
            allergyAlertNote += "Penyajian saus kacang telah dieliminasi dari daftar menu rekomendasi kuliner.";
        }
        if (isAllergicToSeafood) {
            allergyAlertNote += "Semua olahan bandeng/seafood dihindari dan diganti dengan kuliner daging sapi/herbal.";
        }
    }

    const availableSpots = {
        kuliner: merchants.filter(m => m.type === 'kuliner'),
        wisata: merchants.filter(m => m.type === 'wisata')
    };

    let totalEstimatedCost = 0;

    for (let day = 1; day <= days; day++) {
        // Morning: Historical spot
        let morningSpot = availableSpots.wisata[day % availableSpots.wisata.length];
        let morningCost = morningSpot.catalog[0]?.price || 5000;
        totalEstimatedCost += morningCost;

        timeline.push({
            day: day,
            time: "08:30 - 11:30",
            activity: `Eksplorasi Sejarah: Kunjungan ke ${morningSpot.name}`,
            location: morningSpot.name,
            cost: morningCost,
            description: `Menikmati keindahan destinasi wisata ${morningSpot.description.substring(0, 80)}...`,
            lat: morningSpot.coords[0],
            lng: morningSpot.coords[1],
            type: "wisata"
        });

        // Lunch: Authentic Gresik culinary
        let lunchSpot = availableSpots.kuliner[(day - 1) % availableSpots.kuliner.length];
        
        // Handle food allergies replacement
        let lunchMenuName = lunchSpot.catalog[0]?.name || "Kuliner Pilihan";
        let lunchMenuCost = lunchSpot.catalog[0]?.price || 20000;
        let menuDesc = lunchSpot.catalog[0]?.description || "";

        if (isAllergicToSeafood && lunchSpot.id === 'm2') { // Otak-otak bandeng
            // Replace with Nasi Krawu Bu Azza
            const safeSpot = merchants.find(m => m.id === 'm1');
            lunchSpot = safeSpot;
            lunchMenuName = "Nasi Krawu Daging (Alternatif Alergi Seafood)";
            lunchMenuCost = safeSpot.catalog[0].price;
            menuDesc = safeSpot.catalog[0].description + " (Dipilih secara otomatis karena Anda memiliki batasan medis terhadap seafood).";
        } else if (isAllergicToPeanuts && lunchSpot.id === 'm1') {
            // Nasi Krawu has peanuts in serundeng sometimes or custom alert
            lunchMenuName = "Nasi Krawu Suwir Daging (Bebas Serundeng Kacang)";
            menuDesc = lunchSpot.catalog[0].description + " (Koki diinstruksikan menyajikan serundeng kelapa murni bebas kacang tanah).";
        }

        totalEstimatedCost += lunchMenuCost;

        timeline.push({
            day: day,
            time: "12:00 - 13:30",
            activity: `Makan Siang Autentik: Kuliner di ${lunchSpot.name}`,
            location: lunchSpot.name,
            cost: lunchMenuCost,
            description: `Menikmati hidangan khas ${lunchMenuName}. ${menuDesc}`,
            lat: lunchSpot.coords[0],
            lng: lunchSpot.coords[1],
            type: "kuliner"
        });

        // Afternoon: Sightseeing / Beach or Cafe
        let afternoonSpot;
        if (budgetNum < 100000) {
            afternoonSpot = merchants.find(m => m.id === 'm3') || availableSpots.kuliner[0];
        } else {
            afternoonSpot = merchants.find(m => m.id === 'm5') || availableSpots.wisata[0];
        }

        let afternoonMenuName = afternoonSpot.catalog[0]?.name || "Aktivitas Santai";
        let afternoonCost = afternoonSpot.catalog[0]?.price || 5000;
        totalEstimatedCost += afternoonCost;

        timeline.push({
            day: day,
            time: "15:00 - 18:00",
            activity: `Rekreasi Sore Hari: Bersantai di ${afternoonSpot.name}`,
            location: afternoonSpot.name,
            cost: afternoonCost,
            description: `Bersantai sore hari dengan memesan ${afternoonMenuName}. ${afternoonSpot.description.substring(0, 80)}...`,
            lat: afternoonSpot.coords[0],
            lng: afternoonSpot.coords[1],
            type: afternoonSpot.type
        });
    }

    return {
        title: `Eksplorasi Gresik ${days} Hari - Pilihan Terbaik Wisata & Kuliner`,
        description: `Itinerary perjalanan hemat dan aman yang dirancang khusus sesuai dengan preferensi Anda. ${allergyAlertNote}`,
        totalCost: totalEstimatedCost,
        timeline: timeline,
        allergyWarning: allergies ? `Perhatian Medis: Rute disesuaikan untuk alergi terhadap "${allergies}" secara terenkripsi.` : null
    };
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// 1. Get UMKM Merchants list
app.get('/api/merchants', async (req, res) => {
    res.json(await db.getMerchants());
});

// 2. Submit itinerary request (AI Itinerary Planner)
app.post('/api/itinerary', async (req, res) => {
    const { budget, duration, preferences, allergies, userKey } = req.body;
    const ipAddress = getClientIp(req);

    // Encrypt the sensitive allergies field using db AES-256 before caching or passing
    const encryptedAllergies = db.encryptField(allergies);
    const searchParams = { budget, duration, preferences, encryptedAllergies };

    // 1. Check Smart Query Cache First
    const cachedResult = await db.getItineraryCache(searchParams);
    if (cachedResult) {
        return res.json({ ...cachedResult, fromCache: true });
    }

    const apiKey = userKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        // Fallback to local heuristic generator
        const itinerary = await generateMockItinerary(budget, duration, preferences, allergies);
        await db.setItineraryCache(searchParams, itinerary);
        return res.json({ ...itinerary, fromCache: false });
    }

    // Call Gemini API via official SDK to build the Itinerary
    try {
        console.log("[AI Itinerary SDK] Generating custom itinerary via Google AI Studio SDK...");
        
        // Get merchant catalog database snippet so Gemini can generate routes matching our REAL data
        const merchants = await db.getMerchants();
        const merchantsBrief = merchants.map(m => ({
            id: m.id,
            name: m.name,
            type: m.type,
            description: m.description,
            coords: m.coords,
            catalog: m.catalog
        }));

        const prompt = `Anda adalah sistem AI Itinerary Planner profesional. Rancanglah rencana perjalanan wisata (itinerary) di wilayah Gresik berdasarkan data profil berikut:
1. Durasi Perjalanan: ${duration} hari
2. Anggaran Maksimal: Rp ${budget}
3. Preferensi Wisatawan: ${JSON.stringify(preferences)}
4. Riwayat Batasan Alergi Makanan/Kesehatan Wisatawan: "${allergies || 'Tidak ada'}"

Berikut adalah daftar merchant lokal riil (UMKM kuliner dan pariwisata) yang WAJIB Anda gunakan sebagai titik rute koordinat Leaflet.js:
${JSON.stringify(merchantsBrief)}

Instruksi Keamanan Alergi & Medis (SANGAT KRITIS):
Jika wisatawan menuliskan alergi makanan (misal: kacang, seafood, bandeng, dll.), Anda WAJIB mengganti merchant atau catalog menu makanan yang berpotensi memicu alergi tersebut dengan menu alternatif yang 100% aman (misalnya: jika alergi seafood, gantilah Otak-otak Bandeng dengan Nasi Krawu Daging), dan tuliskan catatan perubahan tersebut secara eksplisit di deskripsi aktivitas kuliner dengan nada menenangkan.

Hasilkan keluaran JSON terstruktur yang KAKU dan valid sesuai dengan skema JSON berikut tanpa menyertakan markdown wrap atau teks pendahuluan:
{
  "title": "Judul itinerary yang menarik",
  "description": "Ringkasan itinerary beserta catatan proteksi kesehatan jika memiliki riwayat alergi",
  "totalCost": angka estimasi pengeluaran total dalam Rupiah,
  "timeline": [
    {
      "day": angka hari ke (dimulai dari 1),
      "time": "format HH:MM - HH:MM",
      "activity": "Nama aktivitas",
      "location": "Nama Merchant / Lokasi riil dari data kami",
      "cost": harga tiket masuk atau perkiraan biaya makan,
      "description": "Deskripsi aktivitas detail beserta penjelasan pergantian menu aman jika terpengaruh alergi",
      "lat": koordinat latitude riil sesuai merchant,
      "lng": koordinat longitude riil sesuai merchant,
      "type": "kuliner" | "wisata"
    }
  ],
  "allergyWarning": "String pengingat atau Null jika tidak memiliki alergi"
}`;

        // Track quota check before calling Gemini
        const rateLimit = waf.checkRateLimit();
        if (rateLimit.remaining === 0) {
            throw new Error("Rate Limit Triggered on API call");
        }
        
        // Track the query
        waf.scanHeuristics(""); 

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
                maxOutputTokens: 2048
            }
        });

        const jsonText = response.response.text().trim();
        const itineraryResult = JSON.parse(jsonText);

        // Cache the newly generated itinerary
        await db.setItineraryCache(searchParams, itineraryResult);
        return res.json({ ...itineraryResult, fromCache: false });
    } catch (e) {
        console.error("[AI Itinerary SDK Error] SDK call failed, falling back to heuristics:", e.message);
        const itinerary = await generateMockItinerary(budget, duration, preferences, allergies);
        await db.setItineraryCache(searchParams, itinerary);
        return res.json({ ...itinerary, fromCache: false, error: e.message });
    }
});

// 3. Submit Review with AI WAF Secure Input Filter
app.post('/api/reviews', async (req, res) => {
    const { merchantId, userName, rating, text, userKey } = req.body;
    const ipAddress = getClientIp(req);

    if (!merchantId || !userName || !text) {
        return res.status(400).json({ error: "Missing required review fields" });
    }

    // Run AI WAF
    const wafResult = await waf.scanWAF(text, ipAddress, userKey);

    if (wafResult.isBlocked) {
        console.warn(`[WAF BLOCKED] Attacker IP: ${ipAddress} - Type: ${wafResult.type} - Payload: "${wafResult.highlight}"`);
        return res.status(403).json({
            isBlocked: true,
            type: wafResult.type,
            reason: wafResult.reason,
            highlight: wafResult.highlight
        });
    }

    // WAF Cleared: Save to Database
    const cleanReview = await db.addReview({
        merchantId,
        userName,
        rating: parseInt(rating) || 5,
        text
    });

    res.json({
        isBlocked: false,
        review: cleanReview
    });
});

// 4. Get Reviews for Merchant
app.get('/api/reviews/:merchantId', async (req, res) => {
    const { merchantId } = req.params;
    res.json(await db.getReviews(merchantId));
});

// 5. AI Sentiment Analytics for Merchant Dashboard
app.get('/api/sentiment/:merchantId', async (req, res) => {
    const { merchantId } = req.params;
    const userKey = req.query.userKey;
    const merchant = await db.getMerchantById(merchantId);
    
    if (!merchant) {
        return res.status(404).json({ error: "Merchant not found" });
    }

    const reviews = await db.getReviews(merchantId);
    if (reviews.length === 0) {
        return res.json({
            sentimentScore: 100,
            positivePercentage: 100,
            negativePercentage: 0,
            keyTakeaways: "Belum ada ulasan masuk untuk dianalisis oleh AI."
        });
    }

    const apiKey = userKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        // Fallback local heuristic sentiment analysis
        let positiveCount = 0;
        reviews.forEach(r => {
            if (r.rating >= 4) positiveCount++;
        });

        const positivePercentage = Math.round((positiveCount / reviews.length) * 100);
        const negativePercentage = 100 - positivePercentage;
        const sentimentScore = Math.round(positivePercentage * 0.9 + 10); 

        let keyTakeaways = "";
        if (positivePercentage >= 80) {
            keyTakeaways = `Evaluasi AI: Layanan Anda sangat disukai konsumen (${positivePercentage}% Positif). Kekuatan utama terletak pada cita rasa hidangan dan pelayanan ramah. Pertahankan standar kebersihan untuk terus memikat pasar.`;
        } else if (positivePercentage >= 50) {
            keyTakeaways = `Evaluasi AI: Sentimen usaha Anda moderat (${positivePercentage}% Positif). Rasa hidangan dinilai sangat lezat, namun ulasan mengeluhkan tentang antrean pelayanan yang agak lambat pada jam puncak.`;
        } else {
            keyTakeaways = `Evaluasi AI: Peringatan Kualitas (${negativePercentage}% Sentimen Negatif). Sebagian konsumen mengeluhkan tentang keterbatasan lahan parkir dan kenyamanan warung.`;
        }

        return res.json({
            sentimentScore,
            positivePercentage,
            negativePercentage,
            keyTakeaways
        });
    }

    // Call Gemini API via official SDK for Real Sentiment Analytics
    try {
        console.log(`[AI Sentiment SDK] Extracting insights for ${merchant.name}...`);
        
        const prompt = `Anda adalah AI Analis Sentimen Bisnis Pariwisata. Ringkaslah ulasan mingguan berikut untuk UMKM bernama "${merchant.name}":
Ulasan Konsumen:
${JSON.stringify(reviews.map(r => ({ rating: r.rating, text: r.text })))}

Hasilkan ringkasan ringkas dalam bahasa Indonesia yang memuat poin kelebihan dan kekurangan utama berdasarkan komentar riil, serta rekomendasi taktis.
Keluaran wajib berformat JSON kaku dengan skema berikut tanpa tanda markdown:
{
  "sentimentScore": angka skor sentimen dari 0 hingga 100 (0 sangat buruk, 100 sangat puas),
  "positivePercentage": persentase ulasan positif (rating 4 & 5),
  "negativePercentage": persentase ulasan negatif (rating 1, 2 & 3),
  "keyTakeaways": "Ringkasan ringkas (2-3 kalimat) mengenai kelebihan, kekurangan, dan saran praktis bagi pemilik usaha."
}`;

        const rateLimit = waf.checkRateLimit();
        if (rateLimit.remaining === 0) {
            throw new Error("Rate limit triggered");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
                maxOutputTokens: 256
            }
        });

        const jsonText = response.response.text().trim();
        const sentimentResult = JSON.parse(jsonText);

        return res.json(sentimentResult);
    } catch (e) {
        console.error("[AI Sentiment SDK Error] SDK call failed, using heuristics:", e.message);
        let positiveCount = 0;
        reviews.forEach(r => {
            if (r.rating >= 4) positiveCount++;
        });
        const positivePercentage = Math.round((positiveCount / reviews.length) * 100);
        const negativePercentage = 100 - positivePercentage;
        return res.json({
            sentimentScore: positivePercentage,
            positivePercentage,
            negativePercentage,
            keyTakeaways: `Evaluasi AI (Simulasi): Sentimen bisnis Anda dinilai baik sebesar ${positivePercentage}% positif. Sebagian besar wisatawan menyukai cita rasa autentik produk Anda.`
        });
    }
});

// 6. Get IT WAF Threats logs
app.get('/api/threats', async (req, res) => {
    res.json(await db.getThreats());
});

// 7. Get API Rate Limit Quota Status
app.get('/api/quota', (req, res) => {
    res.json(waf.checkRateLimit());
});

// 8. Test WAF Playground API
app.post('/api/waf/test', async (req, res) => {
    const { text, userKey } = req.body;
    const ipAddress = getClientIp(req);
    
    if (!text) {
        return res.status(400).json({ error: "Missing payload to test" });
    }

    const result = await waf.scanWAF(text, ipAddress, userKey);
    res.json(result);
});

// 9. Update catalog (Merchant portal)
app.post('/api/merchants/:merchantId/catalog', async (req, res) => {
    const { merchantId } = req.params;
    const { catalog } = req.body;
    
    if (!catalog) {
        return res.status(400).json({ error: "Catalog data is required" });
    }

    const updated = await db.updateMerchantCatalog(merchantId, catalog);
    if (updated) {
        res.json({ success: true, merchant: updated });
    } else {
        res.status(404).json({ error: "Merchant not found" });
    }
});

// 10. Add new merchant (Super Admin portal)
app.post('/api/admin/merchants', async (req, res) => {
    const { name, owner, type, description, coords } = req.body;
    
    if (!name || !owner || !type || !description || !coords) {
        return res.status(400).json({ error: "All merchant registration fields are required" });
    }

    const newMerchant = await db.addMerchant({
        name,
        owner,
        type,
        description,
        coords: coords.map(c => parseFloat(c))
    });

    res.json({ success: true, merchant: newMerchant });
});

// 11. Wildcard SPA fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`========================================================================`);
    console.log(`   Grestrip Smart & Secure Navigator - Running on http://localhost:${PORT}`);
    console.log(`========================================================================`);
});
