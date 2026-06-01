const db = require('../config/db');

exports.getAllProduk = (req, res) => {
    db.query(
        'SELECT * FROM produk',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.getProdukById = (req, res) => {
    const { id } = req.params;
    db.query(
        'SELECT * FROM produk WHERE id_produk=?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.searchProduk = (req, res) => {
    const { nama_produk, id_kategori, id_pemasok } = req.query;
    let sql = 'SELECT * FROM produk';
    const params = [];

    if (nama_produk) {
        sql += ' WHERE nama_produk LIKE ?';
        params.push(`%${nama_produk}%`);
    } else if (id_kategori) {
        sql += ' WHERE id_kategori = ?';
        params.push(id_kategori);
    } else if (id_pemasok) {
        sql += ' WHERE id_pemasok = ?';
        params.push(id_pemasok);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchProduk = (req, res) => {
    const { nama_produk, id_kategori, id_pemasok } = req.query;
    let sql = 'SELECT * FROM produk';
    const params = [];

    if (nama_produk) {
        sql += ' WHERE nama_produk LIKE ?';
        params.push(`%${nama_produk}%`);
    } else if (id_kategori) {
        sql += ' WHERE id_kategori = ?';
        params.push(id_kategori);
    } else if (id_pemasok) {
        sql += ' WHERE id_pemasok = ?';
        params.push(id_pemasok);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createProduk = (req, res) => {

    const {
        nama_produk,
        id_kategori,
        id_pemasok,
        harga_beli,
        harga_jual,
        stok_total
    } = req.body;

    const sql = `
        INSERT INTO produk
        (
            nama_produk,
            id_kategori,
            id_pemasok,
            harga_beli,
            harga_jual,
            stok_total
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            nama_produk,
            id_kategori,
            id_pemasok,
            harga_beli,
            harga_jual,
            stok_total
        ],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: 'Produk berhasil ditambahkan'
            });
        }
    );
};

exports.updateProduk = (req, res) => {

    const { id } = req.params;

    const {
        nama_produk,
        id_kategori,
        id_pemasok,
        harga_beli,
        harga_jual,
        stok_total
    } = req.body;

    const sql = `
        UPDATE produk
        SET
            nama_produk = ?,
            id_kategori = ?,
            id_pemasok = ?,
            harga_beli = ?,
            harga_jual = ?,
            stok_total = ?
        WHERE id_produk = ?
    `;

    db.query(
        sql,
        [
            nama_produk,
            id_kategori,
            id_pemasok,
            harga_beli,
            harga_jual,
            stok_total,
            id
        ],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: 'Produk berhasil diupdate'
            });
        }
    );
};

exports.deleteProduk = (req, res) => {

    const { id } = req.params;

    db.query(
        'DELETE FROM produk WHERE id_produk=?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: 'Produk berhasil dihapus'
            });
        }
    );
};

exports.getInventorySummary = (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM kategori) AS total_kategori,
            (SELECT COUNT(*) FROM produk) AS total_produk,
            (SELECT COUNT(*) FROM produk WHERE stok_total < 10) AS low_stock,
            (SELECT COUNT(*) FROM produk WHERE stok_total = 0) AS out_of_stock
    `;
    
   db.query(query, (err, results) => {
        console.log('ERR:', err);
        console.log('RESULTS:', JSON.stringify(results));
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
};

exports.getInventoryStats = (req, res) => {
    const query = `
        SELECT
            (SELECT COALESCE(SUM(total_bayar), 0) 
             FROM sales_order 
             WHERE tanggal_so >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS revenue_7days,
            
            (SELECT COALESCE(SUM(d.qty * p.harga_beli), 0)
             FROM detail_item_po d
             JOIN produk p ON d.id_produk = p.id_produk
             JOIN purchase_order po ON d.id_po = po.id_po
             WHERE po.tanggal_po >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS cost_7days,
            
            (SELECT COUNT(*) FROM produk WHERE stok_total = 0) AS not_in_stock
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
};

exports.getStokPerGudang = (req, res) => {
    const query = `
        SELECT 
            p.id_produk,
            p.nama_produk,
            p.harga_beli,
            p.harga_jual,
            p.stok_total,
            SUM(CASE WHEN g.id_gudang = 1 THEN sg.stok ELSE 0 END) AS stok_jakarta,
            SUM(CASE WHEN g.id_gudang = 2 THEN sg.stok ELSE 0 END) AS stok_surabaya
        FROM produk p
        LEFT JOIN stok_gudang sg ON p.id_produk = sg.id_produk
        LEFT JOIN gudang g ON sg.id_gudang = g.id_gudang
        GROUP BY p.id_produk
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};