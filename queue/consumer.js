const Queue = require('bull');
const naverSearch = new Queue('naverSearch', 'redis://127.0.0.1:6379');
const { searchNaverShopping } = require('../service/searchNaverShopping');
const productModel = require('../models/productModel');

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
