const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth');

const adminController = require('../app/controllers/AdminController');

router.delete('/:id', adminController.deleteProduct);
router.get('/', adminController.showAdmin)

module.exports = router;