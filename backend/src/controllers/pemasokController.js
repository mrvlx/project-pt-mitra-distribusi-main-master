const db = require('../config/db');

exports.getAllPemasok = (req, res) => {
    db.query('SELECT * FROM pemasok', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getPemasokById = (req, res) => {
    db.query(
        'SELECT * FROM pemasok WHERE id_pemasok=?',
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.searchPemasok = (req, res) => {
    const { nama_pemasok, kontak } = req.query;
    let sql = 'SELECT * FROM pemasok';
    const params = [];

    if (nama_pemasok) {
        sql += ' WHERE nama_pemasok LIKE ?';
        params.push(`%${nama_pemasok}%`);
    } else if (kontak) {
        sql += ' WHERE kontak LIKE ?';
        params.push(`%${kontak}%`);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchPemasok = (req, res) => {
    const nama_pemasok = req.query.nama_pemasok;
    const kontak = req.query.kontak;
    let sql = 'SELECT * FROM pemasok';
    const params = [];

    if (nama_pemasok) {
        sql += ' WHERE nama_pemasok LIKE ?';
        params.push(`%${nama_pemasok}%`);
    } else if (kontak) {
        sql += ' WHERE kontak LIKE ?';
        params.push(`%${kontak}%`);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createPemasok = (req, res) => {
    // 1. Tambahkan kategori dan produk_disuplai ke sini
    const { nama_pemasok, kontak, email, kategori, produk_disuplai } = req.body;

    // 2. Tambahkan kolom dan tanda tanya (?) di query SQL
    db.query(
        'INSERT INTO pemasok(nama_pemasok, kontak, email, kategori, produk_disuplai) VALUES (?, ?, ?, ?, ?)',
        [nama_pemasok, kontak, email, kategori, produk_disuplai],
        (err, result) => {
            if (err) {
                console.error(err); // Penting untuk melihat error di terminal
                return res.status(500).json(err);
            }
            res.json({ message: 'Pemasok berhasil ditambahkan' });
        }
    );
};

exports.updatePemasok = (req, res) => {
    // Pastikan semua kolom yang ada di tabel disertakan
    const { nama_pemasok, kontak, email, kategori, produk_disuplai } = req.body;

    db.query(
        `UPDATE pemasok SET 
            nama_pemasok = ?, 
            kontak = ?, 
            email = ?, 
            kategori = ?, 
            produk_disuplai = ? 
         WHERE id_pemasok = ?`,
        [nama_pemasok, kontak, email, kategori, produk_disuplai, req.params.id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }
            res.json({ message: 'Pemasok berhasil diupdate' });
        }
    );
};

exports.deletePemasok = (req, res) => {

    db.query(
        'DELETE FROM pemasok WHERE id_pemasok=?',
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Pemasok berhasil dihapus' });
        }
    );
};