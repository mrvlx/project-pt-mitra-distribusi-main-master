const db = require('../config/db');

exports.getAllDetailPO = (req, res) => {
    db.query('SELECT * FROM detail_item_po', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getByIdDetailPO = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM detail_item_po WHERE id_detail=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// Fungsi pencarian/dropdown item detail PO
exports.searchDetailPO = (req, res) => {
    const { id_po, id_produk } = req.query;
    let sql = `
        SELECT
            d.*,
            p.nama_produk
        FROM detail_item_po d
        LEFT JOIN produk p ON d.id_produk = p.id_produk
    `;
    const params = [];
    const conditions = [];

    if (id_po) {
        conditions.push('d.id_po = ?');
        params.push(id_po);
    }
    if (id_produk) {
        conditions.push('d.id_produk = ?');
        params.push(id_produk);
    }

    if (conditions.length) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createDetailPO = (req, res) => {
    const { id_po, id_produk, qty, harga_beli, subtotal } = req.body;
    const sql = `INSERT INTO detail_item_po (id_po, id_produk, qty, harga_beli, subtotal) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [id_po, id_produk, qty, harga_beli, subtotal], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Detail PO berhasil ditambahkan' });
    });
};

exports.updateDetailPO = (req, res) => {
    const { id } = req.params;
    const { id_po, id_produk, qty, harga_beli, subtotal } = req.body;
    const sql = `UPDATE detail_item_po SET id_po=?, id_produk=?, qty=?, harga_beli=?, subtotal=? WHERE id_detail=?`;

    db.query(sql, [id_po, id_produk, qty, harga_beli, subtotal, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Detail PO berhasil diupdate' });
    });
};

exports.deleteDetailPO = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM detail_item_po WHERE id_detail=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Detail PO berhasil dihapus' });
    });
};