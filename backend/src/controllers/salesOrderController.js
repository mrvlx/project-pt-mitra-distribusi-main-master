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
    const {
        tanggal_so,
        id_pelanggan,
        id_gudang,
        total_bayar,
        status_so,
        status_bayar,
        jatuh_tempo
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
            res.json({ message: 'Sales order berhasil ditambahkan' });
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