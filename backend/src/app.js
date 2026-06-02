require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const path = require('path');

require('./config/db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/Dashboard')));

const usersRoutes = require('./routes/usersRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const pemasokRoutes = require('./routes/pemasokRoutes');
const gudangRoutes = require('./routes/gudangRoutes');
const pelangganRoutes = require('./routes/pelangganRoutes');
const produkRoutes = require('./routes/produkRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const detailItemPoRoutes = require('./routes/detailItemPoRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const detailItemSoRoutes = require('./routes/detailItemSoRoutes');
const pergerakanStokRoutes = require('./routes/pergerakanStokRoutes');
const searchRoutes = require('./routes/searchRoutes'); // ← tambah ini

app.use('/users', usersRoutes);
app.use('/kategori', kategoriRoutes);
app.use('/pemasok', pemasokRoutes);
app.use('/gudang', gudangRoutes);
app.use('/pelanggan', pelangganRoutes);
app.use('/produk', produkRoutes);
app.use('/purchase-order', purchaseOrderRoutes);
app.use('/detail-item-po', detailItemPoRoutes);
app.use('/sales-order', salesOrderRoutes);
app.use('/detail-item-so', detailItemSoRoutes);
app.use('/pergerakan-stok', pergerakanStokRoutes);
app.use('/search', searchRoutes); // ← tambah ini

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../frontend/Dashboard/auth.html')
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});