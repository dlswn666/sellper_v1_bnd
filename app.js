const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const searchController = require('./routes/searchRoutes');

const app = express();

// 미들웨어 설정
app.use(morgan('dev')); // 로그 기록
app.use(cors()); // CORS 설정
app.use(express.json()); // JSON 데이터 파싱

// 라우트 설정
app.use('/api', productRoutes);
app.use('/naverSearch', searchController);

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Welcome to the SELPER backend!');
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
