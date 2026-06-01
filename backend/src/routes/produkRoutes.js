const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');

router.get('/summary', produkController.getInventorySummary);
router.get('/stok-gudang', produkController.getStokPerGudang);
router.get('/search', produkController.searchProduk);
router.get('/stats', produkController.getInventoryStats);
router.get('/', produkController.getAllProduk);
router.get('/:id', produkController.getProdukById);
router.post('/', produkController.createProduk);
router.put('/:id', produkController.updateProduk);
router.delete('/:id', produkController.deleteProduk);

module.exports = router;