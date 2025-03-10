import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import searchController from './routes/searchRoutes.js';
import naverCommerceRoutes from './routes/naverCommerceRoutes.js';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app = express();

// NAS 설정 확인
const useNasStorage = process.env.NAS_STORAGE_ENABLED === 'true';
console.log(`NAS 스토리지 사용 여부: ${useNasStorage ? '활성화' : '비활성화'}`);

// 미들웨어 설정
app.use(morgan('dev')); // 로그 기록

// CORS 설정 최대 전송 크기 설정
app.use(
    cors({
        maxBodySize: '50mb',
    })
);

// body-parser 제한 크기 증가
app.use(express.json({ limit: '50mb' })); // JSON 데이터 파싱
app.use(express.urlencoded({ limit: '50mb', extended: true })); // URL 인코딩된 데이터 파싱

// 이미지 디렉토리 생성 (없는 경우)
const imagesDir = path.join(process.cwd(), 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('이미지 디렉토리 생성됨:', imagesDir);
}

// 정적 파일 제공을 위한 미들웨어 설정 (로컬 저장소 사용 시에만 필요)
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
