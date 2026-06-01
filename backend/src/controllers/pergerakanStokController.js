const db = require('../config/db');

exports.getAllPergerakanStok = (req, res) => {

    const sql = `
        SELECT
            ps.id_log,
            ps.jenis_pergerakan,
            ps.jumlah,
            ps.waktu_log,
            ps.id_po,
            ps.id_so,

            p.nama_produk,
            g.nama_gudang

        FROM pergerakan_stok ps

        LEFT JOIN produk p
        ON ps.id_produk = p.id_produk

        LEFT JOIN gudang g
        ON ps.id_gudang = g.id_gudang

        ORDER BY ps.waktu_log DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

};

exports.getPergerakanStokById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM pergerakan_stok WHERE id_log=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchPergerakanStok = (req, res) => {
    const { id_produk, id_gudang, id_po, id_so, jenis_pergerakan, nama_produk } = req.query;
    let sql = `
        SELECT
            pg.*,
            p.nama_produk
        FROM pergerakan_stok pg
        LEFT JOIN produk p ON pg.id_produk = p.id_produk
    `;
    const params = [];

    const conditions = [];

    if (id_produk) {
        conditions.push('pg.id_produk = ?');
        params.push(id_produk);
    }
    if (id_gudang) {
        conditions.push('pg.id_gudang = ?');
        params.push(id_gudang);
    }
    if (id_po) {
        conditions.push('pg.id_po = ?');
        params.push(id_po);
    }
    if (id_so) {
        conditions.push('pg.id_so = ?');
        params.push(id_so);
    }
    if (jenis_pergerakan) {
        conditions.push('pg.jenis_pergerakan = ?');
        params.push(jenis_pergerakan);
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

exports.createPergerakanStok = (req, res) => {
    const { id_produk, id_gudang, id_so, id_po, jenis_pergerakan, jumlah, waktu_log } = req.body;

    const sql = `
        INSERT INTO pergerakan_stok
        (
            id_produk,
            id_gudang,
            id_so,
            id_po,
            jenis_pergerakan,
            jumlah,
            waktu_log
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [id_produk, id_gudang, id_so, id_po, jenis_pergerakan, jumlah, waktu_log],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Pergerakan stok berhasil ditambahkan' });
        }
    );
};

exports.updatePergerakanStok = (req, res) => {
    const { id } = req.params;
    const { id_produk, id_gudang, id_so, id_po, jenis_pergerakan, jumlah, waktu_log } = req.body;

    const sql = `
        UPDATE pergerakan_stok
        SET
            id_produk = ?,
            id_gudang = ?,
            id_so = ?,
            id_po = ?,
            jenis_pergerakan = ?,
            jumlah = ?,
            waktu_log = ?
        WHERE id_log = ?
    `;

    db.query(
        sql,
        [id_produk, id_gudang, id_so, id_po, jenis_pergerakan, jumlah, waktu_log, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Pergerakan stok berhasil diupdate' });
        }
    );
};

exports.deletePergerakanStok = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM pergerakan_stok WHERE id_log=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Pergerakan stok berhasil dihapus' });
    });
};
