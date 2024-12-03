import Queue from 'bull';
const naverSearch = new Queue('naverSearch', 'redis://127.0.0.1:6379');
import { searchNaverShopping } from '../service/searchNaverShopping';
import productModel from '../models/productModel';

import db from '../config/db';

(async () => {
    try {
        const [rows] = await db.query('SELECT 1'); // 간단한 쿼리 실행
        console.log('DB 연결 성공:', rows);
    } catch (error) {
        console.error('DB 연결 실패:', error);
    }
})();

// 큐에서 작업을 처리
naverSearch.process(async (job) => {
    const { data } = job.data;
    console.log('Processing search word:', data);

    try {
        let searchResult = await searchNaverShopping(data.curValue);

        searchResult.id = data.id;

        const result = await productModel.putAutoReco(searchResult);

        console.log('Processing completed for:', result);
    } catch (error) {
        console.error('Error processing job:', error);
    }
});
// 작업 완료 이벤트 리스너
naverSearch.on('completed', (job) => {
    console.log(`Job with ID ${job.id} has been completed`);
});

// 작업 실패 이벤트 리스너 (optional)
naverSearch.on('failed', (job, err) => {
    console.log(`Job with ID ${job.id} has failed with error: ${err.message}`);
});

export default consumer;
