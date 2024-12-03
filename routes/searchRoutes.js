import express from 'express';
const router = express.Router();
import * as searchController from '../controllers/searchController.js';

router.get('/search', searchController.fnSearchNaverShopping);

router.get('/postAutoReco', searchController.postAutoReco);

export default router;
