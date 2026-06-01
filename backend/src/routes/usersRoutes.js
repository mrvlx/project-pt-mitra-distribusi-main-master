const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Login route harus di atas POST / agar tidak tertangkap oleh createUser
router.post('/login', usersController.loginUser);

router.get('/search', usersController.searchUsers);
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;