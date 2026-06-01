const db = require('../config/db');

exports.getAllKategori = (req, res) => {
    db.query('SELECT * FROM kategori', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchKategori = (req, res) => {
    const nama_kategori = req.query.nama_kategori;
    db.query(
        'SELECT * FROM kategori WHERE nama_kategori LIKE ?',
        [`%${nama_kategori}%`],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.searchKategori = (req, res) => {
    const nama_kategori = req.query.nama_kategori;
    db.query(
        'SELECT * FROM kategori WHERE nama_kategori LIKE ?',
        [`%${nama_kategori}%`],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.createKategori = (req, res) => {
    const { nama_kategori } = req.body;

    db.query(
        'INSERT INTO kategori(nama_kategori) VALUES (?)',
        [nama_kategori],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Kategori berhasil ditambahkan' });
        }
    );
};

exports.updateKategori = (req, res) => {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    db.query(
        'UPDATE kategori SET nama_kategori=? WHERE id_kategori=?',
        [nama_kategori, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Kategori berhasil diupdate' });
        }
    );
};

exports.deleteKategori = (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM kategori WHERE id_kategori=?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Kategori berhasil dihapus' });
        }
    );
};