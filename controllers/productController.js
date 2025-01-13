import * as productModel from '../models/productModel.js';
import { v4 as uuid4 } from 'uuid';
import Queue from 'bull';
import { addSearchJob } from '../queue/producer.js';
import { postProductThumbnail } from '../models/productModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createUploader, IMAGE_TYPES, handleFileUpload } from '../config/imageUpload.js';

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
        let result = product.result;
        console.log('result', result);
        let thumbnailData = await Promise.all(
            result.map(async (item) => {
                let thumbnail = await productModel.getThumbNailData(item.productId);
                return { ...item, thumbnail };
            })
        );
        product.result = thumbnailData;
        product.total = product.total;

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const putWorkingData = async (req, res) => {
    const data = req.body;
    const transaction = await productModel.startTransaction();
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
                const discountRatio = 0.3; // 할인 비율 (30%)

                // 플랫폼별 판매 가격 설정
                await Promise.all(
                    platformChargeData.map(async (data) => {
                        try {
                            // 가격 파싱

                            let feeRatioString = data.chargeRate; // '6%' 같은 형식의 문자열
                            let feeRatio = parseFloat(feeRatioString.replace('%', '')) / 100; // '%'를 제거하고 소수로 변환
                            const productPriceString = item.productPrice;
                            let productPrice = parseInt(productPriceString.replace('원', '').replace(',', ''), 10);

                            const margin_price = Math.floor(productPrice * targetProfitRatio);
                            const tax_price = Math.floor(productPrice * taxRatio);

                            // 플랫폼 수수료액 자동 계산 - (마진금액 + 세금액) * 플랫폼 수수료율
                            const platForm_price = parseInt((margin_price + tax_price) * feeRatio);
                            // 할인액 자동 계산 - ((판매가 + 마진금액 + 세금액 + 플랫폼 수수료액) * 할인 비율)
                            const discount_price =
                                Math.ceil(
                                    ((productPrice + margin_price + tax_price + platForm_price) * discountRatio) / 100
                                ) * 100;

                            const price = productPrice + margin_price + tax_price + platForm_price + discount_price;

                            const platformId = data.platformInfoId;
                            const platformName = data.platformName;

                            // 각 플랫폼에 맞는 가격 데이터 생성
                            const paramData = {
                                productsUuid,
                                platformId,
                                platformName,
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
                            await transaction.rollback();
                            console.error(`Platform ${data.platformInfoId} 가격 계산 실패: `, err);
                        }
                    })
                );
            }
        }

        // 모든 작업 성공시 트랜잭션 커밋
        await transaction.commit();

        // 저장 성공 시 응답
        return res.status(200).json({ success: true, message: '저장이 완료 되었습니다.' });
    } catch (error) {
        // 오류 처리
        console.error('Error occure putWorkingData: ', error);
        // 오류 발생시 트랜잭션 롤백
        await transaction.rollback();
        return res.status(500).json({ success: false, message: '저장에 실패하였습니다.' });
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
                let detailImage = await productModel.getDetailImageData(product.productId);
                return {
                    ...product,
                    thumbnail,
                    detailImage,
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

export const postSearchWord = async (req, res) => {
    const data = req.body;
    try {
        const result = await productModel.postSearchWord(data);
        // const job = addSearchJob(data);

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
    const { productId, search, limit = 100, offset = 0, flag = '' } = req.query;

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
        console.log('*******************************************', flag);
        if (flag === 'thumbnail') {
            let uploadThumbnailData = await Promise.all(
                productsData.map(async (product) => {
                    let uploadThumbnail = await productModel.getProductThumbnail(product.wholesaleProductId);
                    return {
                        ...product,
                        uploadThumbnail,
                    };
                })
            );
            res.status(200).json(uploadThumbnailData);
        } else {
            res.status(200).json(productsData);
        }
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

// 이미지 업로드

export const postProductThumbnailController = async (req, res) => {
    try {
        const uploader = createUploader({
            imageType: IMAGE_TYPES.THUMBNAIL,
            fileNamer: (file, req) => {
                let paramWholesaleProductId = req.body?.wholesaleProductId || req.query.wholesaleProductId;
                paramWholesaleProductId = 'thumbnail';
                return `product-${paramWholesaleProductId}-${Date.now()}${path.extname(file.originalname)}`;
            },
        });

        // 파일 업로드 처리
        const uploadedFiles = await handleFileUpload(uploader, IMAGE_TYPES.THUMBNAIL)(req, res);

        // DB에 저장
        await productModel.postProductThumbnail({
            wholesaleProductId: req.body.wholesaleProductId,
            thumbnail: uploadedFiles,
            imgUploadPlatform: 'naver',
        });

        res.status(200).json({
            success: true,
            message: '이미지가 성공적으로 업로드되었습니다.',
            data: uploadedFiles,
        });
    } catch (err) {
        console.error('Error in postProductThumbnailController:', err);
        res.status(500).json({
            success: false,
            message: err.message || '이미지 업로드 중 오류가 발생했습니다.',
        });
    }
};

// 네이버 이미지 업로드
export const postNaverProductThumbnail = async (req, res) => {
    const data = req.body;
    console.log('data - postNaverProductThumbnail', data);
    const wholesaleProductId = req.body.wholesaleProductId;

    try {
        const getProductThumbnailData = await productModel.getProductThumbnail(wholesaleProductId, 'upload');
        console.log('getProductThumbnailData', getProductThumbnailData);
        const getThumbnailData = await productModel.getThumbNailData(wholesaleProductId, 'upload');
        let thumbnailDataArray = [];
        if (getProductThumbnailData.length > 0 && getThumbnailData.length > 0) {
            console.log('확인');
            getProductThumbnailData.forEach((item) => {
                thumbnailDataArray.push(item.imgPath);
            });
            getThumbnailData.forEach((item) => {
                thumbnailDataArray.push(item.thumbnailPath);
            });
            console.log('thumbnailDataArray', thumbnailDataArray);
            const naverCommerceController = await import('./naverCommerceController.js');
            const uploadNaverProductImage = await naverCommerceController.uploadNaverProductImage(
                {
                    body: {
                        imageFiles: thumbnailDataArray,
                    },
                },
                {
                    status: () => {
                        json: (data) => data;
                    },
                }
            );

            const updateData = uploadNaverProductImage.data.images.map((item) => {
                return {
                    wholesaleProductId: wholesaleProductId,
                    imgUrl: item.url,
                    platformId: 'naver',
                };
            });
            await Promise.all(
                updateData.map(async (item) => {
                    await productModel.updateProductThumbnail(item);
                })
            );
            res.status(200).json({ success: true, message: '업로드가 완료 되었습니다.' });
        } else {
            res.status(200).json({ success: true, message: '업로드할 이미지가 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error('Error in postNaverProductThumbnail controller:', err);
    }
};

// 상품 이미지 조회
export const getProductThumbnail = async (req, res) => {
    const { wholesaleProductId } = req.query;
    try {
        const result = await productModel.getProductThumbnail(wholesaleProductId);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 상품 최종 정보 조회
export const getFinalProductData = async (req, res) => {
    try {
        const { limit, page, productId, searchTerm } = req.query;
        const platformIds = ['naver', 'coupang', 'elevenst', 'gmarket'];

        // 파라미터 유효성 검사 및 기본값 설정
        const params = {
            limit: parseInt(limit) || 100,
            page: parseInt(page) || 1,
            productId: productId || '',
            searchTerm: searchTerm || '',
        };

        let finalProductData = await productModel.getFinalProductData(params);
        const productData = await Promise.all(
            finalProductData.map(async (product) => {
                let productThumbnail = await productModel.getProductThumbnail(product.wholesaleProductId);

                // 카테고리 정보를 객체로 변환
                const productCategory = {};
                const platformProductPrice = {};
                const platformProductOption = {};
                const platformProductAttribute = {};
                await Promise.all(
                    platformIds.map(async (platformId) => {
                        const category = await productModel.getProductCategory(product.productId, platformId);
                        const price = await productModel.getProductPlatformPrice(product.productId, platformId);
                        const option = await productModel.getProductPlatformOption(product.productId, platformId);
                        const attribute = await productModel.getProductAttribute(
                            product.wholesaleProductId,
                            platformId
                        );
                        platformProductPrice[platformId] = price;
                        productCategory[platformId] = category;
                        platformProductOption[platformId] = option;
                        platformProductAttribute[platformId] = attribute;
                    })
                );

                // 옵션 가격 조회는 all 한번 더 조회
                const allOption = await productModel.getProductPlatformOption(product.productId, 'all');
                platformProductOption.all = allOption;

                const platformProductNaverPoint = await productModel.getProductNaverPoint(product.productId);
                const platformProductDeliveryInfo = await productModel.getDeliveryInfo(product.wholesaleSiteId);

                return {
                    ...product,
                    productThumbnail,
                    productCategory,
                    platformProductPrice,
                    platformProductOption,
                    platformProductNaverPoint,
                    platformProductDeliveryInfo,
                    platformProductAttribute,
                };
            })
        );
        res.status(200).json(productData);
    } catch (error) {
        console.error('Error in getFinalProductData controller:', error);
        res.status(500).json({ error: error.message });
    }
};
