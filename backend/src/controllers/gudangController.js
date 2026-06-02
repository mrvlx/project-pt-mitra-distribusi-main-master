const db = require('../config/db');

exports.getAllGudang = (req, res) => {
    db.query('SELECT * FROM gudang', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};


exports.searchGudang = (req, res) => {
    const nama_gudang = req.query.nama_gudang;
    const lokasi = req.query.lokasi;
    let sql = 'SELECT * FROM gudang';
    const params = [];

    if (nama_gudang) {
        sql += ' WHERE nama_gudang LIKE ?';
        params.push(`%${nama_gudang}%`);
    } else if (lokasi) {
        sql += ' WHERE lokasi LIKE ?';
        params.push(`%${lokasi}%`);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createGudang = (req, res) => {
    const { nama_gudang, lokasi, manager, kapasitas_total, kapasitas_terpakai } = req.body;

    db.query(
        'INSERT INTO gudang(nama_gudang, lokasi, manager, kapasitas_total, kapasitas_terpakai) VALUES (?, ?, ?, ?, ?)',
        [nama_gudang, lokasi, manager, kapasitas_total, kapasitas_terpakai || 0],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Gudang berhasil ditambahkan' });
        }
    );
};

exports.updateGudang = (req, res) => {
    const { id } = req.params;
    const { nama_gudang, lokasi, manager, kapasitas_total, kapasitas_terpakai } = req.body;

    db.query(
        'UPDATE gudang SET nama_gudang = ?, lokasi = ?, manager = ?, kapasitas_total = ?, kapasitas_terpakai = ? WHERE id_gudang = ?',
        [nama_gudang, lokasi, manager, kapasitas_total, kapasitas_terpakai, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Gudang berhasil diperbarui' });
        }
    );
};

exports.deleteGudang = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM gudang WHERE id_gudang = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Gudang berhasil dihapus' });
    });
};