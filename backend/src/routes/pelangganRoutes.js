const express = require('express');
const router = express.Router();

const pelangganController = require('../controllers/pelangganController');

router.get('/', pelangganController.getAllPelanggan);
router.get('/search', pelangganController.searchPelanggan);
router.get('/:id', pelangganController.getByIdPelanggan);

router.post('/', pelangganController.createPelanggan);

router.put('/:id', pelangganController.updatePelanggan);

router.delete('/:id', pelangganController.deletePelanggan);

module.exports = router;