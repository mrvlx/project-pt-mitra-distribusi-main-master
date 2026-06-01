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

    const { nama_pemasok, kontak } = req.body;

    db.query(
        'INSERT INTO pemasok(nama_pemasok, kontak) VALUES (?, ?)',
        [nama_pemasok, kontak],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Pemasok berhasil ditambahkan' });
        }
    );
};

exports.updatePemasok = (req, res) => {

    const { nama_pemasok, kontak } = req.body;

    db.query(
        'UPDATE pemasok SET nama_pemasok=?, kontak=? WHERE id_pemasok=?',
        [nama_pemasok, kontak, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
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