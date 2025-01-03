import * as productModel from '../models/productModel.js';
import { v4 as uuid4 } from 'uuid';
import Queue from 'bull';
import { addSearchJob } from '../queue/producer.js';

export const getSelectProductData = async (req, res) => {
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

export const putWorkingData = async (req, res) => {
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
                const discountRatio = 0.3;

                // 플랫폼별 판매 가격 설정
                await Promise.all(
                    platformChargeData.map(async (data) => {
                        try {
                            let feeRatioString = data.charge_rate; // '6%' 같은 형식의 문자열
                            let feeRatio = parseFloat(feeRatioString.replace('%', '')) / 100; // '%'를 제거하고 소수로 변환
                            const productPriceString = item.productPrice;
                            let productPrice = parseInt(productPriceString.replace('원', '').replace(',', ''), 10);

                            // 플랫폼 수수료액 자동 계산 - (마진금액 + 세금액) * 플랫폼 수수료율
                            const platForm_price = parseInt((margin_price + tax_price) * feeRatio);
                            // 할인액 자동 계산 - ((판매가 + 마진금액 + 세금액 + 플랫폼 수수료액) * 할인 비율)
                            const discount_price =
                                Math.ceil(
                                    ((productPrice + margin_price + tax_price + platForm_price) * discountRatio) / 100
                                ) * 100;

                            const price = productPrice + margin_price + tax_price + platForm_price + discount_price;

                            // 마진금액 자동 계산 - 판매가 * 순이익 비율
                            const margin_price = (price * targetProfitRatio) / 100;
                            // 세금액 자동 계산 - 판매가 * 세금 비율
                            const tax_price = parseInt(price * taxRatio);

                            const platformId = data.id;

                            // 각 플랫폼에 맞는 가격 데이터 생성
                            const paramData = {
                                productsUuid,
                                platformId,
                                price,
                                targetProfitRatio,
                                margin_price,
                                taxRatio,
                                tax_price,
                                feeRatio,
                                platForm_price,
                                discount_price,
                            };

                            // 비동기 작업 - 플랫폼 가격 정보 저장
                            await productModel.postPlatformPrice(paramData);
                        } catch (err) {
                            console.error(`Platform ${platformData.id} 가격 계산 실패: `, err);
                        }
                    })
                );
            }
        }
        // 저장 성공 시 응답
        return res.status(200).json({ message: '저장이 완료 되었습니다.' });
    } catch (error) {
        // 오류 처리
        console.error('Error occure putWorkingData: ', error);
        return res.status(500).json({ message: '저장에 실패하였습니다.' });
    }
};

export const getProductData = async (req, res) => {
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
        res.status(200).json({ result: productsData, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSearchWord = async (req, res) => {
    try {
        const searchWord = await productModel.getSearchWord(req.params.productId);

        res.status(200).json(searchWord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const postSearchWord = async (req, res) => {
    const data = req.body;
    try {
        const result = await productModel.postSearchWord(data);

        // addSearchJob(data);
        res.status(200).json({ result: result, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const searchAutoReco = async (req, res) => {
    const { search = '', limit = 50, page = 1, flag = '' } = req.query;

    const data = {
        search,
        offset: (page - 1) * limit,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        flag,
    };

    try {
        let searchResult = await productModel.getAutoReco(data);

        let productsData = await Promise.all(
            searchResult.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.wholeProductId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );
        res.status(200).json(productsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCateProduct = async (req, res) => {
    const { search = '', limit = 50, page = 1 } = req.query;
    const data = {
        search,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
        offset: (page - 1) * limit,
    };

    try {
        const result = await productModel.getCateProduct(data);

        let productsData = await Promise.all(
            result.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.wholesaleProductId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );
        res.status(200).json(productsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const putProductName = async (req, res) => {
    const data = req.body;
    try {
        const result = await productModel.putProductName(data);

        res.status(200).json({ result: result, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const putProductTag = async (req, res) => {
    const data = req.body;
    try {
        const result = await productModel.putProductTag(data);

        res.status(200).json({ result: result, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const postProcessCategory = async (req, res) => {
    try {
        const result = await productModel.postProcessCategory(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in postProcessCategory controller:', error);
        res.status(500).json({ success: false, message: '카테고리 처리 중 오류가 발생했습니다.' });
    }
};

export const getCategory = async (req, res) => {
    try {
        const result = await productModel.getCategory(req.query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getCategory controller:', error);
        res.status(500).json({ success: false, message: '카테고리 조회 중 오류가 발생했습니다.' });
    }
};

export const putProductCategory = async (req, res) => {
    const data = req.body;
    try {
        // 카테고리 id 조회
        const categoryResult = await productModel.getCategory(data);
        const categoryId = categoryResult[0].category_id;

        // 카테고리 저장
        data.categoryId = categoryId;
        const result = await productModel.postProcessCategory(data);
        res.status(200).json({ result: result, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.query;
    try {
        const result = await productModel.getProductById(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductPriceData = async (req, res) => {
    try {
        const { productId, search, limit = 100, offset = 0 } = req.query;

        // productId나 search 둘 다 없어도 전체 데이터를 반환하도록 수정
        let whereCondition = {};

        if (productId) {
            whereCondition.productId = productId;
        }

        if (search) {
            whereCondition.productName = {
                [Sequelize.Op.like]: `%${search}%`,
            };
        }

        const result = await productModel.getProductPriceData(whereCondition, parseInt(limit), parseInt(offset));

        let productsData = await Promise.all(
            result.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.wholesaleProductId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );

        res.status(200).json(productsData);
    } catch (error) {
        console.error('Error fetching product price data:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
};

export const getPlatformPriceById = async (req, res) => {
    const { productId } = req.query;

    try {
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        const result = await productModel.getPlatformPriceById(productId);
        const naverProductPoint = await productModel.getNaverProductPoint(productId);
        if (naverProductPoint) {
            for (const item of result) {
                item.naverProductPoint = naverProductPoint;
            }
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Error in getPlatformPriceById controller:', err);
        res.status(500).json({ error: err.message });
    }
};
// 플랫폼 가격 정보 수정
export const putPlatformPrice = async (req, res) => {
    const data = req.body;
    try {
        const result = await productModel.putPlatformPrice(data);
        if (result) {
            await productModel.putProductPrice(data);
        }
        if (data[0].platformId.trim() === 'naver') {
            const naverProductPoint = await productModel.getNaverProductPoint(data[0].productsId);
            if (naverProductPoint.length > 0) {
                await productModel.putNaverProductPoint(data[0]);
            } else {
                await productModel.postNaverProductPoint(data[0]);
            }
        }
        res.status(200).json({ result: result, message: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductAttributeData = async (req, res) => {
    const { productId, search, limit = 100, offset = 0 } = req.query;

    let whereCondition = {};

    if (productId) {
        whereCondition.productId = productId;
    }

    if (search) {
        whereCondition.productName = {
            [Sequelize.Op.like]: `%${search}%`,
        };
    }

    try {
        const result = await productModel.getProductAttributeData(whereCondition, parseInt(limit), parseInt(offset));
        let productsData = await Promise.all(
            result.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.wholesaleProductId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );

        res.status(200).json(productsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductDetailImage = async (req, res) => {
    const { wholesaleProductId } = req.query;
    try {
        const result = await productModel.getProductDetailImage(wholesaleProductId);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductOption = async (req, res) => {
    const { productId, limit = 100, offset = 0 } = req.query;

    let whereCondition = {};

    if (productId) {
        whereCondition.productId = productId;
    }

    try {
        const result = await productModel.getProductOption(whereCondition, parseInt(limit), parseInt(offset));
        let productsData = await Promise.all(
            result.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.wholesaleProductId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );
        res.status(200).json(productsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getOptionSettings = async (req, res) => {
    const data = req.query;
    try {
        const result = await productModel.getOptionSettings(data);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const postOptionSettings = async (req, res) => {
    const data = req.body;
    try {
        const result = await productModel.postOptionSettings(data);
        res.status(200).json({ success: true, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 택배사 조회
export const getDeliveryCompanies = async (req, res) => {
    try {
        const result = await productModel.getDeliveryCompanies();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 상품 상세 정보 저장
export const postProductAttribute = async (req, res) => {
    const data = req.body;
    try {
        console.log('data', data);
        const result = await productModel.postWholesaleProductAttribute(data);
        res.status(200).json({ success: true, message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
