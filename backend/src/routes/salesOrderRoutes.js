const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');

router.get('/', salesOrderController.getAllSalesOrder);
router.get('/search', salesOrderController.searchSalesOrder);
router.get('/monthly-summary', salesOrderController.getMonthlySummary);
router.get('/:id', salesOrderController.getSalesOrderById);
router.post('/', salesOrderController.createSalesOrder);
router.put('/:id', salesOrderController.updateSalesOrder);
router.delete('/:id', salesOrderController.deleteSalesOrder);

module.exports = router;
