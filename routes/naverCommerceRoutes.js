import express from 'express';
import * as naverCommerceController from '../controllers/naverCommerceController.js';

const router = express.Router();

router.post('/getAccessToken', naverCommerceController.getAccessToken);
router.get('/getProductAttributes/:categoryId', naverCommerceController.getProductAttributes);
router.get('/getProductAttributeValues/:categoryId', naverCommerceController.getProductAttributeValues);
router.get('/getOriginAreaInfo', naverCommerceController.getOriginAreaInfo);
router.get('/getNaverCategory/:categoryId', naverCommerceController.getNaverCategory);
router.get('/getNaverProductForProvidedNotice/:categoryId', naverCommerceController.getNaverProductForProvidedNotice);
router.get('/getNaverCategoryList', naverCommerceController.getNaverCategoryList);
router.post('/registerNaverProduct', naverCommerceController.registerNaverProduct);
router.get('/getNaverSellerAddressBook', naverCommerceController.getNaverSellerAddressBook);
router.get('/getNaverTagInfo/:keyword', naverCommerceController.getNaverTagInfo);
export default router;
