const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/search', searchController.searchNaverShopping);

router.get('/postAutoReco', searchController.postAutoReco);

module.exports = router;
