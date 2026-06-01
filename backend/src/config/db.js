const mysql = require('mysql2');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log('Database gagal terkoneksi');
        console.log(err);
    } else {
        console.log('Database berhasil terkoneksi');
    }
});

module.exports = connection;