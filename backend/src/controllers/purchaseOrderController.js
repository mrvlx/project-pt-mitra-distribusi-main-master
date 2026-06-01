const db = require('../config/db');

exports.getAllPurchaseOrder = (req, res) => {
    db.query('SELECT * FROM purchase_order', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getPurchaseOrderById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM purchase_order WHERE id_po=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchPurchaseOrder = (req, res) => {
    const { status_po, id_pemasok, id_gudang } = req.query;
    let sql = 'SELECT * FROM purchase_order';
    const params = [];

    if (status_po) {
        sql += ' WHERE status_po = ?';
        params.push(status_po);
    } else if (id_pemasok) {
        sql += ' WHERE id_pemasok = ?';
        params.push(id_pemasok);
    } else if (id_gudang) {
        sql += ' WHERE id_gudang = ?';
        params.push(id_gudang);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createPurchaseOrder = (req, res) => {
    const { id_pemasok, id_gudang, tanggal_po, status_po, total_bayar } = req.body;

    const sql = `
        INSERT INTO purchase_order
        (
            id_pemasok,
            id_gudang,
            tanggal_po,
            status_po,
            total_bayar
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            id_pemasok,
            id_gudang,
            tanggal_po,
            status_po,
            total_bayar
        ],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Purchase order berhasil ditambahkan' });
        }
    );
};

exports.updatePurchaseOrder = (req, res) => {
    const { id } = req.params;
    const { id_pemasok, id_gudang, tanggal_po, status_po, total_bayar } = req.body;

    if (!id) return res.status(400).json({ message: 'id parameter required' });

    const fields = [];
    const params = [];

    if (id_pemasok !== undefined) {
        fields.push('id_pemasok = ?');
        params.push(id_pemasok);
    }
    if (id_gudang !== undefined) {
        fields.push('id_gudang = ?');
        params.push(id_gudang);
    }
    if (tanggal_po !== undefined) {
        fields.push('tanggal_po = ?');
        params.push(tanggal_po);
    }
    if (status_po !== undefined) {
        fields.push('status_po = ?');
        params.push(status_po);
    }
    if (total_bayar !== undefined) {
        fields.push('total_bayar = ?');
        params.push(total_bayar);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    const sql = `UPDATE purchase_order SET ${fields.join(', ')} WHERE id_po = ?`;
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Purchase order berhasil diupdate', affectedRows: result.affectedRows });
    });
};

exports.deletePurchaseOrder = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM purchase_order WHERE id_po=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Purchase order berhasil dihapus' });
    });
};
