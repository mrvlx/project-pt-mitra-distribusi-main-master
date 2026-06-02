const db = require('../config/db');

exports.getAllSalesOrder = (req, res) => {
    db.query('SELECT * FROM sales_order', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getSalesOrderById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM sales_order WHERE id_so=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchSalesOrder = (req, res) => {
    const { status_so, status_bayar, id_pelanggan } = req.query;
    let sql = 'SELECT * FROM sales_order';
    const params = [];

    if (status_so) {
        sql += ' WHERE status_so = ?';
        params.push(status_so);
    } else if (status_bayar) {
        sql += ' WHERE status_bayar = ?';
        params.push(status_bayar);
    } else if (id_pelanggan) {
        sql += ' WHERE id_pelanggan = ?';
        params.push(id_pelanggan);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createSalesOrder = (req, res) => {
    // 1. Tangkap semua data dari frontend, termasuk array 'items'
    const {
        tanggal_so,
        id_pelanggan,
        id_gudang,
        total_bayar,
        status_so,
        status_bayar,
        jatuh_tempo,
        items // <-- WAJIB ditangkap di sini
    } = req.body;

    const sql = `
        INSERT INTO sales_order
        (
            tanggal_so,
            id_pelanggan,
            id_gudang,
            total_bayar,
            status_so,
            status_bayar,
            jatuh_tempo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // 2. Insert data ke tabel utama (sales_order) terlebih dahulu
    db.query(
        sql,
        [
            tanggal_so,
            id_pelanggan,
            id_gudang,
            total_bayar,
            status_so,
            status_bayar,
            jatuh_tempo
        ],
        (err, result) => {
            if (err) return res.status(500).json(err);
            
            // 3. Ambil ID SO yang baru saja dibuat oleh database
            const id_so_terbaru = result.insertId;

            // Antisipasi jika frontend mengirimkan nama key berbeda (items / details / products)
            const listBarang = items || req.body.details || req.body.products || [];

            // 4. Jika ada list produk yang dikirim, lakukan Bulk Insert ke detail_item_so
            if (listBarang && listBarang.length > 0) {
                const sqlDetail = `
                    INSERT INTO detail_item_so
                    (id_so, id_produk, qty, harga_satuan, subtotal)
                    VALUES ?
                `;

                // Transformasikan array objek menjadi array di dalam array [[id_so, id_prod, qty, hrg, sub], [...]]
                const values = listBarang.map(item => [
                    id_so_terbaru,                        // Hubungkan dengan ID SO utama
                    item.id_produk || item.id_product,    // Antisipasi nama properti id_produk
                    item.qty || item.quantity,            // Antisipasi nama properti quantity
                    item.harga_satuan || item.harga,      // Antisipasi nama properti harga
                    item.subtotal || ( (item.qty || 1) * (item.harga_satuan || 0) )
                ]);

                // Eksekusi query detail menggunakan format array [values] khas driver MySQL Node.js
                db.query(sqlDetail, [values], (errDetail, resultDetail) => {
                    if (errDetail) {
                        console.error("Gagal menyimpan detail SO:", errDetail);
                        return res.status(500).json({ message: "Gagal menyimpan detail item", error: errDetail });
                    }
                    
                    // Respon jika sukses menyimpan master dan detail
                    res.json({ 
                        message: 'Sales order dan detail item berhasil ditambahkan', 
                        id_so: id_so_terbaru 
                    });
                });

            } else {
                // Jika ternyata tidak ada barang (fallback safety)
                res.json({ message: 'Sales order berhasil ditambahkan (tanpa item detail)' });
            }
        }
    );
};

exports.updateSalesOrder = (req, res) => {
    const { id } = req.params;
    const {
        tanggal_so,
        id_pelanggan,
        id_gudang,
        total_bayar,
        status_so,
        status_bayar,
        jatuh_tempo
    } = req.body;

    if (!id) return res.status(400).json({ message: 'id parameter required' });

    const fields = [];
    const params = [];

    if (tanggal_so !== undefined) {
        fields.push('tanggal_so = ?');
        params.push(tanggal_so);
    }
    if (id_pelanggan !== undefined) {
        fields.push('id_pelanggan = ?');
        params.push(id_pelanggan);
    }
    if (id_gudang !== undefined) {
        fields.push('id_gudang = ?');
        params.push(id_gudang);
    }
    if (total_bayar !== undefined) {
        fields.push('total_bayar = ?');
        params.push(total_bayar);
    }
    if (status_so !== undefined) {
        fields.push('status_so = ?');
        params.push(status_so);
    }
    if (status_bayar !== undefined) {
        fields.push('status_bayar = ?');
        params.push(status_bayar);
    }
    if (jatuh_tempo !== undefined) {
        fields.push('jatuh_tempo = ?');
        params.push(jatuh_tempo);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    const sql = `UPDATE sales_order SET ${fields.join(', ')} WHERE id_so = ?`;
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Sales order berhasil diupdate', affectedRows: result.affectedRows });
    });
};

exports.deleteSalesOrder = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM sales_order WHERE id_so=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Sales order berhasil dihapus' });
    });
};

exports.getMonthlySummary = (req, res) => {
    const query = `
        SELECT 
            DATE_FORMAT(tanggal_so, '%b') AS month,
            MONTH(tanggal_so) AS month_num,
            YEAR(tanggal_so) AS year,
            SUM(total_bayar) AS revenue,
            SUM(total_bayar) * 0.7 AS profit
        FROM sales_order
        GROUP BY YEAR(tanggal_so), MONTH(tanggal_so)
        ORDER BY YEAR(tanggal_so), MONTH(tanggal_so)
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};