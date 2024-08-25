const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/products', productController.getProductData);
router.delete('/products_delete', productController.deleteProduct);

module.exports = router;
