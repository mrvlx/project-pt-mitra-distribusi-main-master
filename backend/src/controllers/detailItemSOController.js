const db = require('../config/db');

exports.getAllDetailItemSO = (req, res) => {
    db.query('SELECT * FROM detail_item_so', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getDetailItemSOById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM detail_item_so WHERE id_detail=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchDetailItemSO = (req, res) => {
    const { id_so, id_produk, nama_produk } = req.query;
    let sql = `
        SELECT
            d.*,
            p.nama_produk
        FROM detail_item_so d
        LEFT JOIN produk p ON d.id_produk = p.id_produk
    `;
    const params = [];
    const conditions = [];

    if (id_so) {
        conditions.push('d.id_so = ?');
        params.push(id_so);
    }
    if (id_produk) {
        conditions.push('d.id_produk = ?');
        params.push(id_produk);
    }
    if (nama_produk) {
        conditions.push('p.nama_produk LIKE ?');
        params.push(`%${nama_produk}%`);
    }

    if (conditions.length) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createDetailItemSO = (req, res) => {
    const { id_so, id_produk, qty, harga_satuan, subtotal } = req.body;

    const sql = `
        INSERT INTO detail_item_so
        (
            id_so,
            id_produk,
            qty,
            harga_satuan,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [id_so, id_produk, qty, harga_satuan, subtotal],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Detail item SO berhasil ditambahkan' });
        }
    );
};

exports.updateDetailItemSO = (req, res) => {
    const { id } = req.params;
    const { id_so, id_produk, qty, harga_satuan, subtotal } = req.body;

    const sql = `
        UPDATE detail_item_so
        SET
            id_so = ?,
            id_produk = ?,
            qty = ?,
            harga_satuan = ?,
            subtotal = ?
        WHERE id_detail = ?
    `;

    db.query(
        sql,
        [id_so, id_produk, qty, harga_satuan, subtotal, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Detail item SO berhasil diupdate' });
        }
    );
};

exports.deleteDetailItemSO = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM detail_item_so WHERE id_detail=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Detail item SO berhasil dihapus' });
    });
};
