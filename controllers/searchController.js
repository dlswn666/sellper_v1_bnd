const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
            ],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 }); // 페이지 뷰포트 설정
        // 페이지 로드
        await page.goto(url, { waitUntil: 'networkidle2' });
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
            }, 5);
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
    data.forEach((item) => {
        if (item.shoppingResult && item.shoppingResult.products) {
            item.shoppingResult.products.forEach((product) => {
                const titles = [product.productTitle, product.productName];
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

    // 사용 태그
    let tags = {};
    data.forEach((item) => {
        if (item.shoppingResult && item.shoppingResult.products) {
            item.shoppingResult.products.forEach((product) => {
                const manuTag = product.manuTag;
                if (manuTag) {
                    manuTag.split(',').forEach((tag) => {
                        const cleanedWord = tag.replace(/[^\w가-힣]/g, '').toLowerCase(); // 특수문자를 제거하고 소문자로 변환
                        if (cleanedWord) {
                            tags[cleanedWord] = (tags[cleanedWord] || 0) + 1;
                        }
                    });
                }
            });
        }
    });

    const productTags = Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

    console.log('productNum', productNum);
    console.log('productName', productName);
    console.log('productTags', productTags);

    return {
        productNum,
        productName,
        productTags,
    };
}
