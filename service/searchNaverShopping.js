import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// 많이 사용되는 모니터 해상도 배열
export const monitorSizes = ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720'];

// 랜덤으로 선택된 모니터 해상도
export const randomSize = monitorSizes[Math.floor(Math.random() * monitorSizes.length)];
export const [width, height] = randomSize.split('x').map(Number);

// 사람처럼 랜덤 대기 시간을 설정하는 함수
export const randomWait = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const waitForTimeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// 함수 형태로 변경
export const searchNaverShopping = async (data) => {
    if (!data) {
        throw new Error('Query parameter is required');
    }
    const url = `https://search.shopping.naver.com/search/all?query=${data}`;

    try {
        const browser = await puppeteer.launch({
            headless: false, // headless 모드 비활성화
            args: [
                `--window-size=${randomSize}`, // 브라우저 창 크기 설정
                '--disable-infobars',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // 메모리 사용량 최적화
                '--disable-blink-features=AutomationControlled', // 자동화 탐지 비활성화
                '--start-maximized', // 브라우저를 최대화하여 시작
            ],
        });

        const page = await browser.newPage();

        // 브라우저 크기 설정 및 사용자 에이전트 변경 (사람처럼 보이게 하기 위해)
        await page.setViewport({ width, height });
        // await page.setUserAgent(
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        // );

        // 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 랜덤한 대기 시간을 추가하여 더 사람처럼 보이게 만들기
        // await waitForTimeout(randomWait(500, 1500));

        // 검색 결과 페이지에서 랜덤으로 마우스 이동
        await moveMouseRandomly(page);

        const relatedTagsTexts = await page.evaluate(() => {
            const anchors = document.querySelectorAll('.relatedTags_relation_srh__YG9s7 a');
            return Array.from(anchors).map((anchor) => anchor.textContent.trim());
        });

        console.log(relatedTagsTexts);

        // 페이지 스크롤
        await autoScroll(page);

        // 전체 데이터를 저장할 배열
        const allData = [];

        // 페이지네이션 버튼 클릭 및 데이터 수집
        const paginationButtons = [
            '#content > div.style_content__xWg5l > div.pagination_pagination__fsf34 > div > a:nth-child(1)',
            '#content > div.style_content__xWg5l > div.pagination_pagination__fsf34 > div > a:nth-child(2)',
            '#content > div.style_content__xWg5l > div.pagination_pagination__fsf34 > div > a:nth-child(3)',
        ];

        await page.click(
            '#content > div.style_content__xWg5l > div.pagination_pagination__fsf34 > div > a:nth-child(3)'
        );

        // 랜덤한 대기 시간 추가 (더 자연스럽게 보이기 위해)
        // await waitForTimeout(randomWait(500, 1500));

        // 페이지 이동
        for (let button of paginationButtons) {
            await autoScroll(page);
            await page.click(button);
            // await waitForTimeout(randomWait(500, 1500)); // 클릭 후 대기
            const pageData = await getPageData(page);
            allData.push(pageData);
        }

        // 브라우저 닫기
        await browser.close();

        // 객체 변환
        const expandedData = expandObject(allData);

        // JSON 파일로 저장
        await saveToFile(allData, 'naver_shopping_data.json');

        return expandedData;
    } catch (error) {
        console.error(error);
        throw new Error(`Error during shopping search: ${error.message}`);
    }
};

// 페이지 데이터 수집 함수
async function getPageData(page) {
    const responsePromise = new Promise((resolve, reject) => {
        page.on('response', async (response) => {
            const request = response.request();
            if (request.url().includes('api/search/all') && request.method() === 'GET') {
                try {
                    const text = await response.text();
                    const jsonData = JSON.parse(text);
                    console.log(jsonData);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            }
        });
        setTimeout(() => {
            reject(new Error('Timeout waiting for network response'));
        }, 10000); // 10초 타임아웃 설정
    });

    const data = await responsePromise;
    return data;
}

// 자동 스크롤 함수
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 900;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });
}
// 페이지 내에서 마우스를 랜덤하게 움직이는 함수
async function moveMouseRandomly(page) {
    const randomX = Math.floor(Math.random() * width);
    const randomY = Math.floor(Math.random() * height);
    await page.mouse.move(randomX, randomY, { steps: 10 });
}

// JSON 파일로 저장 함수
async function saveToFile(data, fileName) {
    const desktopPath = path.join(require('os').homedir(), 'Desktop', fileName);
    const jsonData = JSON.stringify(data, null, 2);
    return fs.promises.writeFile(desktopPath, jsonData, 'utf8');
}

function expandObject(data) {
    // 상품 수
    const productNum = data[0].productSetFilter.filterValues[0].productCount.toString(); // 숫자를 문자열로 변환
    // 상품 이름 추천
    let words = {};
    // 사용 태그
    let tags = {};
    // 카테고리 번호
    let cateId = [];
    // 카테고리 이름
    let cateNam = [];

    data.forEach((item) => {
        if (item.shoppingResult && item.shoppingResult.products) {
            item.shoppingResult.products.forEach((product) => {
                const titles = [product.productTitle, product.productName];
                const manuTag = product.manuTag;
                // 카테고리 객체 생성
                const categoryIdObj = {
                    categoryId1: product.category1Id,
                    categoryId2: product.category2Id,
                    categoryId3: product.category3Id,
                    categoryId4: product.category4Id,
                };

                const categoryNameObj = {
                    categoryNm1: product.category1Name,
                    categoryNm2: product.category2Name,
                    categoryNm3: product.category3Name,
                    categoryNm4: product.category4Name,
                };

                // 중복된 카테고리 ID가 없을 경우에만 추가
                if (!cateId.some((id) => JSON.stringify(id) === JSON.stringify(categoryIdObj))) {
                    cateId.push(categoryIdObj);
                }

                // 중복된 카테고리 이름이 없을 경우에만 추가
                if (!cateNam.some((name) => JSON.stringify(name) === JSON.stringify(categoryNameObj))) {
                    cateNam.push(categoryNameObj);
                }

                if (manuTag) {
                    manuTag.split(',').forEach((tag) => {
                        const cleanedWord = tag.replace(/[^\w가-힣]/g, '').toLowerCase(); // 특수문자를 제거하고 소문자로 변환
                        if (cleanedWord) {
                            tags[cleanedWord] = (tags[cleanedWord] || 0) + 1;
                        }
                    });
                }
                titles.forEach((title) => {
                    if (title) {
                        title.split(/\s+/).forEach((word) => {
                            const cleanedWord = word.replace(/[^\w가-힣]/g, '').toLowerCase(); // 특수문자를 제거하고 소문자로 변환
                            if (cleanedWord) {
                                words[cleanedWord] = (words[cleanedWord] || 0) + 1;
                            }
                        });
                    }
                });
            });
        }
    });

    // productName 배열을 문자열로 변환 (콤마로 구분)
    const productName = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .join(', '); // 배열을 문자열로 변환

    // productTags 배열을 문자열로 변환 (콤마로 구분)
    const productTags = Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .join(', '); // 배열을 문자열로 변환

    console.log('productNum', productNum);
    console.log('productName', productName);
    console.log('productTags', productTags);
    console.log('cateId', cateId);
    console.log('cateNam', cateNam);

    return {
        productNum, // 총 상품 수 (문자열)
        productName, // 추천 이름 (문자열)
        productTags, // 추천 태그 (문자열)
        cateId, // 카테고리 ID (배열)
        cateNam, // 카테고리 (배열)
    };
}

export default searchNaverShopping;
