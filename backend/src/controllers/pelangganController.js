const db = require('../config/db');

exports.getAllPelanggan = (req, res) => {
    const sql = `
        SELECT 
            p.*,
            COUNT(so.id_so) AS total_orders,
            COALESCE(SUM(so.total_bayar), 0) AS total_revenue,
            COALESCE(SUM(CASE WHEN so.status_bayar = 'Belum Lunas' THEN so.total_bayar ELSE 0 END), 0) AS credit_used,
            ROUND(
                COALESCE(SUM(CASE WHEN so.status_bayar = 'Belum Lunas' THEN so.total_bayar ELSE 0 END), 0)
                / NULLIF(p.limit_kredit, 0) * 100, 1
            ) AS credit_usage_pct
        FROM pelanggan p
        LEFT JOIN sales_order so ON p.id_pelanggan = so.id_pelanggan
        GROUP BY p.id_pelanggan
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getByIdPelanggan = (req, res) => {

    const id = req.params.id;

    db.query(
        'SELECT * FROM pelanggan WHERE id_pelanggan=?',
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );
};

exports.searchPelanggan = (req, res) => {

    const nama_perusahaan = req.query.nama_perusahaan;

    db.query(
        'SELECT * FROM pelanggan WHERE nama_perusahaan LIKE ?',
        [`%${nama_perusahaan}%`],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );
};

exports.createPelanggan = (req, res) => {

    const { nama_perusahaan, limit_kredit, sisa_hutang } = req.body;

    const sql = `
        INSERT INTO pelanggan
        (
            nama_perusahaan,
            limit_kredit,
            sisa_hutang
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            nama_perusahaan,
            limit_kredit,
            sisa_hutang
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Data berhasil ditambahkan'
            });

        }
    );
};

exports.updatePelanggan = (req, res) => {

    const id = req.params.id;

    const nama_perusahaan = req.body.nama_perusahaan;
    const limit_kredit = req.body.limit_kredit;
    const sisa_hutang = req.body.sisa_hutang;

    const sql = `
        UPDATE pelanggan
        SET
            nama_perusahaan=?,
            limit_kredit=?,
            sisa_hutang=?
        WHERE id_pelanggan=?
    `;

    db.query(
        sql,
        [
            nama_perusahaan,
            limit_kredit,
            sisa_hutang,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Data berhasil diupdate'
            });

        }
    );
};

exports.deletePelanggan = (req, res) => {

    const id = req.params.id;

    db.query(
        'DELETE FROM pelanggan WHERE id_pelanggan=?',
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Data berhasil dihapus'
            });

        }
    );
};