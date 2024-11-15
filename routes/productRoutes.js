const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/selectProducts', productController.getSelectProductData);
router.put('/putWorkingData', productController.putWorkingData);
router.get('/getWorkingData', productController.getProductData);
router.get('/searchWord/:productId', productController.getSearchWord);
router.post('/postSearchWord', productController.postSearchWord);
router.get('/getAutoReco', productController.searchAutoReco);
router.put('/putProductName', productController.putProductName);
router.put('/putProductTag', productController.putProductTag);
router.post('/postProcessCategory', productController.postProcessCategory);
router.get('/getCategory', productController.getCategory);
router.get('/getCateProduct', productController.getCateProduct);
router.put('/putProductCategory', productController.putProductCategory);
router.get('/getProductById', productController.getProductById);
router.get('/getProductPriceData', productController.getProductPriceData);
router.get('/getPlatformPriceById', productController.getPlatformPriceById);
module.exports = router;
