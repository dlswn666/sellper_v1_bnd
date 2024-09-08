const productModel = require('../models/productModel');
const { v4: uuid4 } = require('uuid');
exports.getSelectProductData = async (req, res) => {
    const { search = '', limit = 50, page = 1 } = req.query;

    const data = {
        search,
        offset: (page - 1) * limit,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
    };

    try {
        let product = await productModel.getProducts(data);

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.putWorkingData = async (req, res) => {
    const data = req.body;
    try {
        if (data) {
            // 데이터가 존재할 경우
            for (const item of data) {
                const productsUuid = uuid4();
                item.productsUuid = productsUuid;

                // 비동기 작업 - 상품 등록
                const result = await productModel.putWorkingProduct(item);

                // 플랫폼별 가격 계산
                const platformChargeData = await productModel.getPlatformCharge();
                const targetProfitRatio = 0.3; // 순이익 비율 (30%)
                const taxRatio = 0.16; // 세금 비율 (16%)

                // 플랫폼별 판매 가격 설정
                await Promise.all(
                    platformChargeData.map(async (data) => {
                        let feeRatioString = data.charge_rate; // '6%' 같은 형식의 문자열
                        let feeRatio = parseFloat(feeRatioString.replace('%', '')) / 100; // '%'를 제거하고 소수로 변환
                        const productPriceString = item.productPrice;
                        let productPrice = parseInt(productPriceString.replace('원', ''), 10);
                        let sellingPrice = productPrice / (1 - feeRatio - targetProfitRatio * (1 - taxRatio));
                        const platformId = data.id;
                        console.log(sellingPrice);
                        console.log(data);
                        let price = Math.ceil(sellingPrice / 100) * 100; // 100원 단위로 올림 처리
                        console.log(price);
                        price = price.toString();
                        // 각 플랫폼에 맞는 가격 데이터 생성
                        const paramData = {
                            productsUuid,
                            platformId,
                            price,
                        };

                        // 비동기 작업 - 플랫폼 가격 정보 저장
                        await productModel.putPlatformPrice(paramData);
                    })
                );

                // 결과 반환
                return result;
            }
        }
        // 저장 성공 시 응답
        res.status(200).json({ message: '저장이 완료 되었습니다.' });
    } catch (error) {
        // 오류 처리
        console.error('Error occure putWorkingData: ', error);
        res.status(500).json({ message: '저장에 실패하였습니다.' });
    }
};

exports.getProductData = async (req, res) => {
    const { search = '', limit = 50, page = 1 } = req.query;

    const data = {
        search,
        offset: (page - 1) * limit,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
    };

    try {
        // 제품 데이터를 가져옴
        const products = await productModel.getSearchWordData(data);
        let { searchResult, total } = products;

        // 제품 데이터에 썸네일 데이터를 병합
        let productsData = await Promise.all(
            searchResult.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.productId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );
        productsData.total = total;
        // 병합된 데이터를 응답으로 보냄
        console.log(productsData);
        res.status(200).json({ result: productsData, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSearchWord = async (req, res) => {
    try {
        const searchWord = await productModel.getSearchWord(req.params.productId);

        res.status(200).json(searchWord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.postSearchWord = async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const result = await productModel.postSearchWord(data);
        res.status(200).json({ result: result, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
