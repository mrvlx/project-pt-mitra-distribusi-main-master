const express = require('express');
const router = express.Router();
const detailItemPOController = require('../controllers/detailItemPoController');

router.get('/', detailItemPOController.getAllDetailPO);
router.get('/search', detailItemPOController.searchDetailPO);
router.get('/:id', detailItemPOController.getByIdDetailPO);
router.post('/', detailItemPOController.createDetailPO);
router.put('/:id', detailItemPOController.updateDetailPO);
router.delete('/:id', detailItemPOController.deleteDetailPO);

module.exports = router;
