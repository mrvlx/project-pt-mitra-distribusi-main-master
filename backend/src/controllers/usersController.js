const db = require('../config/db');

exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id_user=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchUsers = (req, res) => {
    const { name, email, role } = req.query;
    let sql = 'SELECT * FROM users';
    const params = [];

    if (name) {
        sql += ' WHERE name LIKE ?';
        params.push(`%${name}%`);
    } else if (email) {
        sql += ' WHERE email LIKE ?';
        params.push(`%${email}%`);
    } else if (role) {
        sql += ' WHERE role = ?';
        params.push(role);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.searchUsers = (req, res) => {
    const { name, email, role } = req.query;
    let sql = 'SELECT * FROM users';
    const params = [];

    if (name) {
        sql += ' WHERE name LIKE ?';
        params.push(`%${name}%`);
    } else if (email) {
        sql += ' WHERE email LIKE ?';
        params.push(`%${email}%`);
    } else if (role) {
        sql += ' WHERE role = ?';
        params.push(role);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.createUser = (req, res) => {
    console.log(req.body);
    const {name, email, password, role} = req.body;

    // Validasi sederhana
    if (!name || !email || !password || !role) {
        return res.status(400).json({
            message: 'Semua field wajib diisi'
        });
    }

    const sql = `
        INSERT INTO users(name, email, password, role)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, password, role], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: 'User berhasil ditambahkan',
            userId: result.insertId
        });
    });
};

exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const fields = [];
    const params = [];

    if (name)     { fields.push('name = ?');     params.push(name); }
    if (email)    { fields.push('email = ?');    params.push(email); }
    if (password) { fields.push('password = ?'); params.push(password); }
    if (role)     { fields.push('role = ?');     params.push(role); }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
    }

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id_user = ?`;
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'User berhasil diupdate' });
    });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id_user=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'User berhasil dihapus' });
    });
};

exports.loginUser = (req, res) => {
    // Menangkap inputan secara fleksibel (baik berupa 'email' atau 'identifier')
    const loginInput = req.body.identifier || req.body.email;
    const password = req.body.password;

    if (!loginInput || !password) {
        return res.status(400).json({
            message: 'Nama/Email dan password wajib diisi'
        });
    }

    // Menghapus spasi di ujung teks inputan
    const searchParam = loginInput.trim();

    // Query SQL mencari ke kolom email ATAU kolom name (mengabaikan huruf besar/kecil dengan LOWER)
    const sql = `
        SELECT * FROM users
        WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)
    `;

    db.query(sql, [searchParam, searchParam], (err, result) => {
        if (err) {
            console.error("Database Login Error:", err);
            return res.status(500).json(err);
        }

        // Jika tidak ada nama atau email yang cocok di database
        if (result.length === 0) {
            return res.status(401).json({
                message: 'Nama atau Email tidak terdaftar'
            });
        }

        const user = result[0];

        // Cek kecocokan password plaintext
        if (user.password !== password) {
            return res.status(401).json({
                message: 'Password salah'
            });
        }

        // Login sukses, kirim objek data user lengkap ke frontend
        res.json({
            message: 'Login berhasil',
            user: {
                id: user.id_user,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
};