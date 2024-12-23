import express from 'express';
import * as productController from '../controllers/productController.js';

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
router.put('/putPlatformPrice', productController.putPlatformPrice);
router.get('/getProductAttributeData', productController.getProductAttributeData);
router.get('/getProductDetailImage', productController.getProductDetailImage);
router.get('/getProductOption', productController.getProductOption);
router.get('/getOptionSettings', productController.getOptionSettings);
router.post('/postOptionSettings', productController.postOptionSettings);
router.get('/getDeliveryCompanies', productController.getDeliveryCompanies);
export default router;
