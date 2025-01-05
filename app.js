import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import searchController from './routes/searchRoutes.js';
import naverCommerceRoutes from './routes/naverCommerceRoutes.js';
import path from 'path';

dotenv.config();
const app = express();

// 미들웨어 설정
app.use(morgan('dev')); // 로그 기록
app.use(cors()); // CORS 설정
app.use(express.json()); // JSON 데이터 파싱

// 정적 파일 제공을 위한 미들웨어 설정
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// 라우트 설정
app.use('/api', productRoutes);
app.use('/naverSearch', searchController);
app.use('/naverCommerce', naverCommerceRoutes);

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Welcome to the SELPER backend!');
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
