const express = require('express');
const router = express.Router();
const detailItemSOController = require('../controllers/detailItemSOController');

router.get('/', detailItemSOController.getAllDetailItemSO);
router.get('/search', detailItemSOController.searchDetailItemSO);
router.get('/:id', detailItemSOController.getDetailItemSOById);
router.post('/', detailItemSOController.createDetailItemSO);
router.put('/:id', detailItemSOController.updateDetailItemSO);
router.delete('/:id', detailItemSOController.deleteDetailItemSO);

module.exports = router;
