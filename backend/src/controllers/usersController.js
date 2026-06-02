const db = require('../config/db');

// 1. Ambil Semua User
exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// 2. Ambil User Berdasarkan ID
exports.getUserById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id_user=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// 3. Pencarian User
exports.searchUsers = (req, res) => {
    const { name, email, role } = req.query;
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (name) {
        sql += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }
    if (email) {
        sql += ' AND email LIKE ?';
        params.push(`%${email}%`);
    }
    if (role) {
        sql += ' AND role = ?';
        params.push(role);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// 4. Create User Baru
// 4. Create User Baru (Otomatis Buat Pelanggan saat DAFTAR BARU)
exports.createUser = (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const sql = 'INSERT INTO users(name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, password, role], (err, result) => {
        if (err) return res.status(500).json(err);
        
        const newUserId = result.insertId;

        // Toleransi pengecekan: Jika role berisi 'customer' atau 'pelanggan'
        const userRole = role.toLowerCase();
        if (userRole === 'customer' || userRole === 'pelanggan') {
            const insertPelangganSql = `
                INSERT INTO pelanggan (nama_perusahaan, limit_kredit, sisa_hutang, id_user) 
                VALUES (?, 500000000, 0, ?)
            `;
            db.query(insertPelangganSql, [name, newUserId], (insErr) => {
                if (insErr) {
                    console.error("[REGISTER] Gagal auto-insert pelanggan:", insErr);
                } else {
                    console.log(`[SYSTEM] ${name} otomatis didaftarkan ke tabel pelanggan lewat register.`);
                }
            });
        }

        res.json({
            message: 'User berhasil ditambahkan',
            userId: newUserId
        });
    });
};

// 7. Login User (DIRESTRUKTUR: Tunggu database menulis data, baru kirim res.json)
exports.loginUser = (req, res) => {
    const loginInput = req.body.identifier || req.body.email;
    const password = req.body.password;

    if (!loginInput || !password) {
        return res.status(400).json({ message: 'Nama/Email dan password wajib diisi' });
    }

    const searchParam = loginInput.trim();
    const sql = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)';

    db.query(sql, [searchParam, searchParam], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.status(401).json({ message: 'Nama atau Email tidak terdaftar' });
        }

        const user = result[0];

        if (user.password !== password) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // Pungut role untuk divalidasi
        const userRole = user.role ? user.role.toLowerCase() : '';

        if (userRole === 'customer' || userRole === 'pelanggan') {
            // 1. Cek dulu apakah sudah terdaftar di tabel pelanggan
            const checkPelangganSql = 'SELECT * FROM pelanggan WHERE id_user = ?';
            
            db.query(checkPelangganSql, [user.id_user], (pErr, pResult) => {
                if (pErr) console.error("Gagal cek tabel pelanggan:", pErr);

                // 2. Jika belum ada di tabel pelanggan, masukkan dulu!
                if (!pResult || pResult.length === 0) {
                    const insertPelangganSql = `
                        INSERT INTO pelanggan (nama_perusahaan, limit_kredit, sisa_hutang, id_user) 
                        VALUES (?, 500000000, 0, ?)
                    `;
                    db.query(insertPelangganSql, [user.name, user.id_user], (insErr) => {
                        if (insErr) {
                            console.error("[LOGIN] Gagal membuat data pelanggan otomatis:", insErr);
                        } else {
                            console.log(`[SYSTEM] Berhasil memasukkan ${user.name} ke tabel pelanggan.`);
                        }
                        
                        // KIRIM RESPON SETELAH INSERT SELESAI
                        return res.json({
                            message: 'Login berhasil (Profil pelanggan sinkron)',
                            user: { id: user.id_user, name: user.name, email: user.email, role: user.role }
                        });
                    });
                } else {
                    // Jika data sudah ada, langsung kirim respon tanpa insert ulang
                    return res.json({
                        message: 'Login berhasil',
                        user: { id: user.id_user, name: user.name, email: user.email, role: user.role }
                    });
                }
            });
        } else {
            // Jika role-nya bukan customer (misal: admin)
            return res.json({
                message: 'Login berhasil',
                user: { id: user.id_user, name: user.name, email: user.email, role: user.role }
            });
        }
    });
};

// 8. Ambil Ringkasan Dashboard Kustomer (Summary - Bebas Error & Akurat)
exports.getCustomerSummary = (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Parameter email kustomer tidak ditemukan' });
    }

    // Menggunakan LEFT JOIN antara users dan pelanggan berdasarkan id_user yang sudah Anda set sebagai FK
    const sql = `
        SELECT 
            u.id_user, u.name, u.email, p.id_pelanggan, p.limit_kredit, p.sisa_hutang
        FROM users u
        LEFT JOIN pelanggan p ON u.id_user = p.id_user
        WHERE u.email = ?
    `;

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("SQL Error pada Dashboard Summary:", err);
            return res.status(500).json(err);
        }

        if (result.length > 0) {
            const row = result[0];
            
            // Mengambil nilai limit_kredit, jika null di database karena belum sinkron, beri default 500jt
            const limitKredit = row.limit_kredit !== null ? Number(row.limit_kredit) : 500000000;
            const sisaHutang = row.sisa_hutang !== null ? Number(row.sisa_hutang) : 0;

            res.json({
                total_orders: 0, // Dibuat 0 dulu karena sistem Anda menggunakan nama tabel 'sales_order'
                total_spending: sisaHutang, 
                limit_kredit: limitKredit,
                cart_items: 0
            });
        } else {
            res.json({
                total_orders: 0,
                total_spending: 0,
                limit_kredit: 500000000,
                cart_items: 0
            });
        }
    });
};