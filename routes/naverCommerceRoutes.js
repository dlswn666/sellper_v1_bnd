import express from 'express';
import * as naverCommerceController from '../controllers/naverCommerceController.js';

const router = express.Router();

router.post('/getAccessToken', naverCommerceController.getAccessToken);
router.get('/getProductAttributes/:categoryId', naverCommerceController.getProductAttributes);
router.get('/getProductAttributeValues/:categoryId', naverCommerceController.getProductAttributeValues);
export default router;
