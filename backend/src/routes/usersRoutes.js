const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// 1. Ambil Semua User
router.get('/', usersController.getAllUsers);

// 2. Pencarian User
router.get('/search', usersController.searchUsers);

// 3. Ambil User Berdasarkan ID
router.get('/id/:id', usersController.getUserById);

// 4. Ambil Ringkasan Dashboard Kustomer (GET)
router.get('/dashboard/summary', usersController.getCustomerSummary);

// 5. Create User Baru (POST)
router.post('/', usersController.createUser);

// 6. Login User (POST)
router.post('/login', usersController.loginUser);

module.exports = router;