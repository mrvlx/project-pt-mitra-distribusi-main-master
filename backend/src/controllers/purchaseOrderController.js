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
    const {
        id_pemasok,
        id_gudang,
        tanggal_po,
        status_po,
        total_bayar,
        items // Array produk dari frontend
    } = req.body;

    const sqlMaster = `
        INSERT INTO purchase_order (id_pemasok, id_gudang, tanggal_po, status_po, total_bayar)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sqlMaster, [id_pemasok, id_gudang, tanggal_po, status_po, total_bayar], (err, result) => {
        if (err) return res.status(500).json(err);

        const id_po_terbaru = result.insertId;
        const listBarang = items || req.body.details || req.body.products || [];

        // Jika ada barang, masukkan ke detail_item_po
        if (listBarang && listBarang.length > 0) {
            const sqlDetail = `
                INSERT INTO detail_item_po (id_po, id_produk, qty, harga_beli, subtotal)
                VALUES ?
            `;

            const values = listBarang.map(item => [
                id_po_terbaru,
                item.id_produk || item.id_product,
                item.qty || item.quantity,
                item.harga_beli || item.harga,
                item.subtotal || ((item.qty || 1) * (item.harga_beli || 0))
            ]);

            db.query(sqlDetail, [values], (errDetail) => {
                if (errDetail) return res.status(500).json({ message: "Gagal simpan detail", error: errDetail });
                
                res.json({ message: 'Purchase Order dan detail item berhasil ditambahkan', id_po: id_po_terbaru });
            });
        } else {
            // Jika ITEMS tetap 0, berarti listBarang kosong/tidak terbaca dari frontend
            res.json({ message: 'Purchase Order berhasil ditambahkan (Tanpa Item Detail karena data items kosong)', id_po: id_po_terbaru });
        }
    });
};

// 🔥 TAMBAHKAN INI: Untuk handle route '/:id/items' (Mengisi panel detail sebelah kanan)
exports.getPurchaseOrderItems = (req, res) => {
    const { id } = req.params; // ini menerima id_po

    const sql = `
        SELECT 
            d.*, 
            p.nama_produk 
        FROM detail_item_po d
        LEFT JOIN produk p ON d.id_produk = p.id_produk
        WHERE d.id_po = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result); // Mengembalikan array item untuk PO tersebut
    });
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

exports.getPurchaseOrderItems = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            d.id_po,
            p.nama_produk,
            d.qty AS jumlah,
            d.harga_beli AS harga_satuan,
            d.subtotal
        FROM detail_item_po d
        JOIN produk p ON d.id_produk = p.id_produk
        WHERE d.id_po = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error Detail PO:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result); 
    });
};