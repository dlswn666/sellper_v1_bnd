const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/selectProducts', productController.getSelectProductData);
router.put('/putWorkingData', productController.putWorkingData);
router.get('/getWorkingData', productController.getProductData);
router.get('/searchWord/:productId', productController.getSearchWord);
router.post('/postSearchWord', productController.postSearchWord);
router.get('/getAutoReco', productController.searchAutoReco);

module.exports = router;
