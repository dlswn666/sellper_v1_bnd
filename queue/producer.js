import Queue from 'bull';

// Redis 서버에 연결된 Bull Queue 생성
const naverSearch = new Queue('naverSearch', 'redis://127.0.0.1:6379');

// Producer: 작업을 큐에 추가하는 함수
export const addSearchJob = async (data) => {
    try {
        // 작업을 큐에 추가
        await naverSearch.add(
            {
                data,
            },
            {
                attempts: 3, // 실패 시 재시도 횟수
                backoff: 5000, // 실패 시 5초 후 재시도
            }
        );
    } catch (error) {
        console.error('Error adding job to the queue:', error);
    }
};

// 작업을 큐에 추가하는 예시 호출
addSearchJob('laptop');
