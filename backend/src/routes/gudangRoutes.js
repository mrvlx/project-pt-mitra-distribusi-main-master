const express = require('express');
const router = express.Router();
const gudangController = require('../controllers/gudangController');

router.get('/search', gudangController.searchGudang);
router.get('/', gudangController.getAllGudang);
router.post('/', gudangController.createGudang);
router.put('/:id', gudangController.updateGudang);
router.delete('/:id', gudangController.deleteGudang);

module.exports = router;