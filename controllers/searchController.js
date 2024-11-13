const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const searchModel = require('../models/searchModel');
const searchNaverShopping = require('../service/searchNaverShopping');

// 많이 사용되는 모니터 해상도 배열
const monitorSizes = ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720'];

// 랜덤으로 선택된 모니터 해상도
const randomSize = monitorSizes[Math.floor(Math.random() * monitorSizes.length)];
const [width, height] = randomSize.split('x').map(Number);

exports.searchNaverShopping = async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const url = `https://search.shopping.naver.com/search/all?query=${query}`;

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
        // 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle2' });

        const relatedTagsTexts = await page.evaluate(() => {
            const anchors = document.querySelectorAll('.relatedTags_relation_srh__YG9s7 a');
            return Array.from(anchors).map((anchor) => anchor.textContent.trim());
        });

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

        for (let button of paginationButtons) {
            await autoScroll(page);
            await page.click(button);
            const pageData = await getPageData(page);
            allData.push(pageData);
        }

        // 브라우저 닫기
        await browser.close();

        // 객체 변환
        const expandedData = expandObject(allData);

        // JSON 파일로 저장
        await saveToFile(allData, 'naver_shopping_data.json');

        return res.json(expandedData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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

// JSON 파일로 저장 함수
async function saveToFile(data, fileName) {
    const desktopPath = path.join(require('os').homedir(), 'Desktop', fileName);
    const jsonData = JSON.stringify(data, null, 2);
    return fs.promises.writeFile(desktopPath, jsonData, 'utf8');
}

function expandObject(data) {
    // 상품 수
    const productNum = data[0].productSetFilter.filterValues[0].productCount;
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
    const productName = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

    // 추천 category 매칭

    const productTags = Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

    return {
        productNum,
        productName,
        productTags,
        cateId,
        cateNam,
    };
}

exports.postAutoReco = async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // 우선 검색어 등록된 데이터 중 auto_recommend DB 와 mapping 안된 데이터 검색해서 검색어 return
    try {
        // searchWord 배열 가져오기
        const searchWords = await searchModel.getSearchWord();

        // 각 searchWord에 대해 순차적으로 searchNaverShopping 실행
        for (const { id, searchWord } of searchWords) {
            console.log(`Processing search word: ${searchWord}`);

            // Naver 쇼핑 검색 호출
            let resultData = await searchNaverShopping.searchNaverShopping(searchWord);
            resultData.id = id;

            await searchModel.putAutoReco(resultData);

            // 5초 딜레이 적용
            await delay(5000);
        }
    } catch (error) {
        console.error('Error during search processing:', error);
    }

    // 검색어 순회 하면서 searchNaverShopping 호출 ( 간격 5초 )
    // 결과 저장
};
