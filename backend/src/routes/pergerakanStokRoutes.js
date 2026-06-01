const express = require('express');
const router = express.Router();
const pergerakanStokController = require('../controllers/pergerakanStokController');

router.get('/', pergerakanStokController.getAllPergerakanStok);
router.get('/search', pergerakanStokController.searchPergerakanStok);
router.get('/:id', pergerakanStokController.getPergerakanStokById);
router.post('/', pergerakanStokController.createPergerakanStok);
router.put('/:id', pergerakanStokController.updatePergerakanStok);
router.delete('/:id', pergerakanStokController.deletePergerakanStok);

module.exports = router;
