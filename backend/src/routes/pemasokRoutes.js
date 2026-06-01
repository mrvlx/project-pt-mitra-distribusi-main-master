const express = require('express');
const router = express.Router();
const pemasokController = require('../controllers/pemasokController');

router.get('/search', pemasokController.searchPemasok);
router.get('/', pemasokController.getAllPemasok);
router.get('/:id', pemasokController.getPemasokById);
router.post('/', pemasokController.createPemasok);
router.put('/:id', pemasokController.updatePemasok);
router.delete('/:id', pemasokController.deletePemasok);

module.exports = router;