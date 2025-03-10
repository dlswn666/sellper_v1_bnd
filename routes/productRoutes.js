import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.get('/selectProducts', productController.getSelectProductData);
router.put('/putWorkingData', productController.putWorkingData);
router.get('/getWorkingData', productController.getProductData);

router.post('/postSearchWord', productController.postSearchWord);
router.get('/getAutoReco', productController.searchAutoReco);
router.put('/putProductName', productController.putProductName);
router.post('/postProductTag', productController.postProductTag);
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
router.post('/postProductAttribute', productController.postProductAttribute);
router.post('/postProductThumbnail', productController.postProductThumbnailController);
router.get('/getProductThumbnail', productController.getProductThumbnail);
router.get('/getFinalProductData', productController.getFinalProductData);
router.post('/postNaverProductThumbnail', productController.postNaverProductThumbnail);
router.delete('/deleteProductThumbnail', productController.deleteProductThumbnail);
router.put('/putProductStage', productController.putProductStage);
router.put('/putProductTag', productController.putProductTag);
router.delete('/deleteProduct', productController.deleteProduct);

// 추가: 이미지 다운로드 라우트
router.get('/image/:filename', productController.getImageController);

export default router;
