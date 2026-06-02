-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 02 Jun 2026 pada 10.00
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pt_mitra_distribusi`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `BuatSalesOrder` (IN `p_id_pelanggan` INT, IN `p_id_gudang` INT)   BEGIN
  INSERT INTO sales_order (tanggal_so, id_pelanggan, id_gudang, status_so, status_bayar)
  VALUES (NOW(), p_id_pelanggan, p_id_gudang, 'Draft', 'Belum Lunas');
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CekKredit` (IN `p_id_pelanggan` INT, IN `p_total` DECIMAL(15,2))   BEGIN
  SELECT
    nama_perusahaan,
    limit_kredit,
    sisa_hutang,
    (limit_kredit - sisa_hutang) AS sisa_kredit,
    CASE
      WHEN (sisa_hutang + p_total) <= limit_kredit THEN 'BOLEH ORDER'
      ELSE 'KREDIT PENUH'
    END AS status_kredit
  FROM pelanggan
  WHERE id_pelanggan = p_id_pelanggan;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `HistoriStok` (IN `p_id_produk` INT)   BEGIN
  SELECT
    p.nama_produk,
    pg.jenis_pergerakan,
    pg.jumlah,
    g.nama_gudang,
    pg.waktu_log
  FROM pergerakan_stok pg
  JOIN produk p ON pg.id_produk = p.id_produk
  JOIN gudang g ON pg.id_gudang = g.id_gudang
  WHERE pg.id_produk = p_id_produk
  ORDER BY pg.waktu_log DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `LaporanStok` ()   BEGIN
  SELECT
    p.nama_produk,
    p.stok_total,
    k.nama_kategori,
    ps.nama_pemasok
  FROM produk p
  JOIN kategori k  ON p.id_kategori = k.id_kategori
  JOIN pemasok  ps ON p.id_pemasok  = ps.id_pemasok
  ORDER BY p.stok_total ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `TerimaPO` (IN `p_id_po` INT)   BEGIN
  UPDATE purchase_order
  SET status_po = 'Diterima'
  WHERE id_po = p_id_po;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `detail_item_po`
--

CREATE TABLE `detail_item_po` (
  `id_detail` int(11) NOT NULL,
  `id_po` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `qty` int(11) DEFAULT NULL,
  `harga_beli` decimal(15,2) DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `detail_item_po`
--

INSERT INTO `detail_item_po` (`id_detail`, `id_po`, `id_produk`, `qty`, `harga_beli`, `subtotal`) VALUES
(1, 1, 1, 10, 50000.00, 500000.00),
(2, 2, 1, 5, 50000.00, 250000.00),
(3, 3, 2, 1, 750000.00, 750000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `detail_item_so`
--

CREATE TABLE `detail_item_so` (
  `id_detail` int(11) NOT NULL,
  `id_so` int(11) DEFAULT NULL,
  `id_produk` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `harga_satuan` decimal(15,2) DEFAULT NULL,
  `subtotal` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `detail_item_so`
--

INSERT INTO `detail_item_so` (`id_detail`, `id_so`, `id_produk`, `qty`, `harga_satuan`, `subtotal`) VALUES
(1, 1, 1, 50, 20000.00, 1000000.00),
(2, 2, 1, 3, 50000.00, 150000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `gudang`
--

CREATE TABLE `gudang` (
  `id_gudang` int(11) NOT NULL,
  `nama_gudang` varchar(50) NOT NULL,
  `lokasi` varchar(100) DEFAULT NULL,
  `manager` varchar(100) DEFAULT NULL,
  `kapasitas_total` int(11) DEFAULT 0,
  `kapasitas_terpakai` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `gudang`
--

INSERT INTO `gudang` (`id_gudang`, `nama_gudang`, `lokasi`, `manager`, `kapasitas_total`, `kapasitas_terpakai`) VALUES
(1, 'Gudang Jakarta', 'Cakung, Jakarta Timur', 'Budi Santoso', 10000, 7850),
(2, 'Gudang Surabaya', 'Rungkut, Surabaya', 'Siti Rahayu', 8000, 5200);

-- --------------------------------------------------------

--
-- Struktur dari tabel `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Elektronik'),
(2, 'Bahan Bangunan');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id_pelanggan` int(11) NOT NULL,
  `nama_perusahaan` varchar(100) NOT NULL,
  `limit_kredit` decimal(15,2) DEFAULT 0.00,
  `sisa_hutang` decimal(15,2) DEFAULT 0.00,
  `nama_kontak` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pelanggan`
--

INSERT INTO `pelanggan` (`id_pelanggan`, `nama_perusahaan`, `limit_kredit`, `sisa_hutang`, `nama_kontak`, `email`, `kategori`) VALUES
(1, 'PT Abadi Makmur', 50000000.00, 0.00, 'Budi Santoso', 'budi@abadimakmur.co.id', 'Manufacturing'),
(2, 'Jaya Group', 50000000.00, 0.00, 'Siti Nurhaliza', 'siti@jayagroup.com', 'Retail'),
(4, 'Arah Coffee', 50000000.00, 0.00, 'Ahmad Rizki', 'ahmad@arahcoffee.id', 'F&B'),
(6, 'Pakuwon Group', 50000000.00, 0.00, 'Dewi Lestari', 'dewi@pakuwon.com', 'Property'),
(7, 'Paragon Group', 50000000.00, 0.00, 'Eko Prasetyo', 'eko@paragon.co.id', 'Distribution');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pemasok`
--

CREATE TABLE `pemasok` (
  `id_pemasok` int(11) NOT NULL,
  `nama_pemasok` varchar(100) NOT NULL,
  `kontak` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `produk_disuplai` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pemasok`
--

INSERT INTO `pemasok` (`id_pemasok`, `nama_pemasok`, `kontak`, `email`, `kategori`, `produk_disuplai`) VALUES
(1, 'PT Sumber Elektronik', '021-55001234', 'smbrelekto@gmail.com', 'Elektronik', 'Kabel, RJ45, Jumper'),
(2, 'Aluminium Jaya', '021-77661223', 'almnjaya@gmail.com', 'Material', 'Aluminium Plat');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pergerakan_stok`
--

CREATE TABLE `pergerakan_stok` (
  `id_log` int(11) NOT NULL,
  `id_produk` int(11) DEFAULT NULL,
  `id_gudang` int(11) DEFAULT NULL,
  `id_so` int(11) DEFAULT NULL,
  `id_po` int(11) DEFAULT NULL,
  `jenis_pergerakan` enum('Masuk','Keluar') DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `waktu_log` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pergerakan_stok`
--

INSERT INTO `pergerakan_stok` (`id_log`, `id_produk`, `id_gudang`, `id_so`, `id_po`, `jenis_pergerakan`, `jumlah`, `waktu_log`) VALUES
(1, 1, 1, NULL, NULL, 'Masuk', 500, '2026-04-07 06:38:53'),
(2, 1, 1, NULL, NULL, 'Masuk', 5, '2026-04-27 07:13:37'),
(3, 1, 1, 2, NULL, 'Keluar', 3, '2026-04-27 07:15:41');

--
-- Trigger `pergerakan_stok`
--
DELIMITER $$
CREATE TRIGGER `after_insert_pergerakan` AFTER INSERT ON `pergerakan_stok` FOR EACH ROW BEGIN
  IF NEW.jenis_pergerakan = 'Masuk' THEN
    UPDATE produk
    SET stok_total = stok_total + NEW.jumlah
    WHERE id_produk = NEW.id_produk;
  ELSEIF NEW.jenis_pergerakan = 'Keluar' THEN
    UPDATE produk
    SET stok_total = stok_total - NEW.jumlah
    WHERE id_produk = NEW.id_produk;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(11) NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `id_kategori` int(11) DEFAULT NULL,
  `id_pemasok` int(11) DEFAULT NULL,
  `harga_beli` decimal(15,2) DEFAULT NULL,
  `harga_jual` decimal(15,2) DEFAULT NULL,
  `stok_total` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `produk`
--

INSERT INTO `produk` (`id_produk`, `nama_produk`, `id_kategori`, `id_pemasok`, `harga_beli`, `harga_jual`, `stok_total`) VALUES
(1, 'Kabel NYA 2.5mm', 1, 1, 15000.00, 20000.00, 8),
(2, 'Aluminium Plat 1m x 2m x 2mm', 2, 2, 720000.00, 750000.00, 5),
(3, 'RJ45', 1, 1, 20000.00, 25000.00, 15),
(4, 'Kabel Jumper Male to Male 20pcs', 1, 1, 10000.00, 12000.00, 25),
(10, 'Arduino Uno', 1, 1, 74999.00, 80000.00, 20);

-- --------------------------------------------------------

--
-- Struktur dari tabel `purchase_order`
--

CREATE TABLE `purchase_order` (
  `id_po` int(11) NOT NULL,
  `id_pemasok` int(11) NOT NULL,
  `id_gudang` int(11) NOT NULL,
  `tanggal_po` date DEFAULT NULL,
  `status_po` enum('Draft','Dikirim','Diterima','Dibatalkan') DEFAULT 'Draft',
  `total_bayar` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `purchase_order`
--

INSERT INTO `purchase_order` (`id_po`, `id_pemasok`, `id_gudang`, `tanggal_po`, `status_po`, `total_bayar`) VALUES
(1, 1, 1, '2026-04-26', 'Diterima', 500000.00),
(2, 1, 1, '2026-04-27', 'Diterima', 500000.00),
(3, 2, 1, '2026-05-17', 'Draft', 750000.00);

--
-- Trigger `purchase_order`
--
DELIMITER $$
CREATE TRIGGER `after_update_po` AFTER UPDATE ON `purchase_order` FOR EACH ROW BEGIN
  IF NEW.status_po = 'Diterima' AND OLD.status_po != 'Diterima' THEN
    INSERT INTO pergerakan_stok
      (id_produk, id_gudang, id_so, id_po, jenis_pergerakan, jumlah, waktu_log)
    SELECT
      d.id_produk,
      NEW.id_gudang,
      NULL,
      NEW.id_po,
      'Masuk',
      d.qty,
      NOW()
    FROM detail_item_po d
    WHERE d.id_po = NEW.id_po;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sales_order`
--

CREATE TABLE `sales_order` (
  `id_so` int(11) NOT NULL,
  `tanggal_so` date DEFAULT NULL,
  `id_pelanggan` int(11) DEFAULT NULL,
  `id_gudang` int(11) DEFAULT NULL,
  `total_bayar` decimal(15,2) DEFAULT 0.00,
  `status_so` enum('Draft','Processed','Delivered') DEFAULT 'Draft',
  `status_bayar` enum('Lunas','Belum Lunas') DEFAULT 'Belum Lunas',
  `jatuh_tempo` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sales_order`
--

INSERT INTO `sales_order` (`id_so`, `tanggal_so`, `id_pelanggan`, `id_gudang`, `total_bayar`, `status_so`, `status_bayar`, `jatuh_tempo`) VALUES
(1, '2025-01-05', 1, 1, 2500000.00, 'Delivered', 'Lunas', '2025-01-20'),
(2, '2026-04-27', 1, 1, 150000.00, 'Delivered', 'Belum Lunas', '2026-05-27');

--
-- Trigger `sales_order`
--
DELIMITER $$
CREATE TRIGGER `after_update_so` AFTER UPDATE ON `sales_order` FOR EACH ROW BEGIN
  IF NEW.status_so = 'Delivered' AND OLD.status_so != 'Delivered' THEN
    INSERT INTO pergerakan_stok
      (id_produk, id_gudang, id_so, id_po, jenis_pergerakan, jumlah, waktu_log)
    SELECT
      d.id_produk,
      NEW.id_gudang,
      NEW.id_so,
      NULL,
      'Keluar',
      d.qty,
      NOW()
    FROM detail_item_so d
    WHERE d.id_so = NEW.id_so;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `stok_gudang`
--

CREATE TABLE `stok_gudang` (
  `id_stok` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `id_gudang` int(11) NOT NULL,
  `stok` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stok_gudang`
--

INSERT INTO `stok_gudang` (`id_stok`, `id_produk`, `id_gudang`, `stok`) VALUES
(1, 1, 1, 5),
(2, 1, 2, 3),
(3, 2, 1, 3),
(4, 2, 2, 2),
(5, 3, 1, 10),
(6, 3, 2, 5),
(7, 4, 1, 15),
(8, 4, 2, 10);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@mitradistribusi.com', '$2b$10$hashedpasswordhere', 'admin', '2026-05-12 14:49:27', '2026-06-02 04:22:29'),
(2, 'Muhammad Ahmad', 'ahmadudin@gmail.com', 'opklm,.?', 'admin', '2026-05-27 00:44:44', '2026-05-27 00:44:44'),
(3, 'Budi ', 'staff@mitradistribusi.com', 'staffhahahihi77', 'staff', '2026-05-27 04:25:09', '2026-06-02 04:13:55');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `detail_item_po`
--
ALTER TABLE `detail_item_po`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `id_po` (`id_po`),
  ADD KEY `id_produk` (`id_produk`);

--
-- Indeks untuk tabel `detail_item_so`
--
ALTER TABLE `detail_item_so`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `id_so` (`id_so`),
  ADD KEY `id_produk` (`id_produk`);

--
-- Indeks untuk tabel `gudang`
--
ALTER TABLE `gudang`
  ADD PRIMARY KEY (`id_gudang`);

--
-- Indeks untuk tabel `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indeks untuk tabel `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id_pelanggan`);

--
-- Indeks untuk tabel `pemasok`
--
ALTER TABLE `pemasok`
  ADD PRIMARY KEY (`id_pemasok`);

--
-- Indeks untuk tabel `pergerakan_stok`
--
ALTER TABLE `pergerakan_stok`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_produk` (`id_produk`),
  ADD KEY `id_gudang` (`id_gudang`),
  ADD KEY `id_so` (`id_so`),
  ADD KEY `id_po` (`id_po`);

--
-- Indeks untuk tabel `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`),
  ADD KEY `id_kategori` (`id_kategori`),
  ADD KEY `id_pemasok` (`id_pemasok`);

--
-- Indeks untuk tabel `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD PRIMARY KEY (`id_po`),
  ADD KEY `id_pemasok` (`id_pemasok`),
  ADD KEY `id_gudang` (`id_gudang`);

--
-- Indeks untuk tabel `sales_order`
--
ALTER TABLE `sales_order`
  ADD PRIMARY KEY (`id_so`),
  ADD KEY `id_pelanggan` (`id_pelanggan`),
  ADD KEY `id_gudang` (`id_gudang`);

--
-- Indeks untuk tabel `stok_gudang`
--
ALTER TABLE `stok_gudang`
  ADD PRIMARY KEY (`id_stok`),
  ADD KEY `id_produk` (`id_produk`),
  ADD KEY `id_gudang` (`id_gudang`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `detail_item_po`
--
ALTER TABLE `detail_item_po`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `detail_item_so`
--
ALTER TABLE `detail_item_so`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `gudang`
--
ALTER TABLE `gudang`
  MODIFY `id_gudang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id_pelanggan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `pemasok`
--
ALTER TABLE `pemasok`
  MODIFY `id_pemasok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `pergerakan_stok`
--
ALTER TABLE `pergerakan_stok`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `purchase_order`
--
ALTER TABLE `purchase_order`
  MODIFY `id_po` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `sales_order`
--
ALTER TABLE `sales_order`
  MODIFY `id_so` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `stok_gudang`
--
ALTER TABLE `stok_gudang`
  MODIFY `id_stok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `detail_item_po`
--
ALTER TABLE `detail_item_po`
  ADD CONSTRAINT `detail_item_po_ibfk_1` FOREIGN KEY (`id_po`) REFERENCES `purchase_order` (`id_po`),
  ADD CONSTRAINT `detail_item_po_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`);

--
-- Ketidakleluasaan untuk tabel `detail_item_so`
--
ALTER TABLE `detail_item_so`
  ADD CONSTRAINT `detail_item_so_ibfk_1` FOREIGN KEY (`id_so`) REFERENCES `sales_order` (`id_so`),
  ADD CONSTRAINT `detail_item_so_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`);

--
-- Ketidakleluasaan untuk tabel `pergerakan_stok`
--
ALTER TABLE `pergerakan_stok`
  ADD CONSTRAINT `pergerakan_stok_ibfk_1` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`),
  ADD CONSTRAINT `pergerakan_stok_ibfk_2` FOREIGN KEY (`id_gudang`) REFERENCES `gudang` (`id_gudang`),
  ADD CONSTRAINT `pergerakan_stok_ibfk_3` FOREIGN KEY (`id_so`) REFERENCES `sales_order` (`id_so`),
  ADD CONSTRAINT `pergerakan_stok_ibfk_4` FOREIGN KEY (`id_po`) REFERENCES `purchase_order` (`id_po`);

--
-- Ketidakleluasaan untuk tabel `produk`
--
ALTER TABLE `produk`
  ADD CONSTRAINT `produk_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`),
  ADD CONSTRAINT `produk_ibfk_2` FOREIGN KEY (`id_pemasok`) REFERENCES `pemasok` (`id_pemasok`);

--
-- Ketidakleluasaan untuk tabel `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD CONSTRAINT `purchase_order_ibfk_1` FOREIGN KEY (`id_pemasok`) REFERENCES `pemasok` (`id_pemasok`),
  ADD CONSTRAINT `purchase_order_ibfk_2` FOREIGN KEY (`id_gudang`) REFERENCES `gudang` (`id_gudang`);

--
-- Ketidakleluasaan untuk tabel `sales_order`
--
ALTER TABLE `sales_order`
  ADD CONSTRAINT `sales_order_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`),
  ADD CONSTRAINT `sales_order_ibfk_2` FOREIGN KEY (`id_gudang`) REFERENCES `gudang` (`id_gudang`);

--
-- Ketidakleluasaan untuk tabel `stok_gudang`
--
ALTER TABLE `stok_gudang`
  ADD CONSTRAINT `stok_gudang_ibfk_1` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`),
  ADD CONSTRAINT `stok_gudang_ibfk_2` FOREIGN KEY (`id_gudang`) REFERENCES `gudang` (`id_gudang`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
