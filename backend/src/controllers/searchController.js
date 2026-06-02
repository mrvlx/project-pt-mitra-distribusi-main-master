const db = require('../config/db');

exports.globalSearch = (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json({ produk: [], pemasok: [], orders: [] });

    const keyword = `%${q}%`;

    const sqlProduk  = `SELECT id_produk  AS id, nama_produk  AS nama, harga_jual AS sub, 'produk'  AS tipe FROM produk   WHERE nama_produk  LIKE ? LIMIT 5`;
    const sqlPemasok = `SELECT id_pemasok AS id, nama_pemasok AS nama, kontak     AS sub, 'pemasok' AS tipe FROM pemasok  WHERE nama_pemasok LIKE ? LIMIT 5`;
    const sqlOrder   = `SELECT id_so      AS id, CONCAT('SO-', LPAD(id_so,4,'0')) AS nama, status_so AS sub, 'order' AS tipe FROM sales_order WHERE CONCAT('SO-', LPAD(id_so,4,'0')) LIKE ? LIMIT 5`;

    Promise.all([
        new Promise((resolve, reject) => db.query(sqlProduk,  [keyword], (err, r) => err ? reject(err) : resolve(r))),
        new Promise((resolve, reject) => db.query(sqlPemasok, [keyword], (err, r) => err ? reject(err) : resolve(r))),
        new Promise((resolve, reject) => db.query(sqlOrder,   [keyword], (err, r) => err ? reject(err) : resolve(r))),
    ])
    .then(([produk, pemasok, orders]) => res.json({ produk, pemasok, orders }))
    .catch(err => res.status(500).json(err));
};