import bcrypt from 'bcrypt';
import axios from 'axios';
import tokenManager from '../utils/tokenManager.js';
import dotenv from 'dotenv';
import { postNaverCategory, getNaverCategoryModel } from '../models/naverCommerceModels.js';
import { createBaseInfo } from '../dao/naver/shopping/product/originProduct/originProduct.js';
import {
    getDetailImageData,
    getUploadThumbnail,
    getCommonCode,
    putProductTag,
    getProductTag,
} from '../models/productModel.js';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import { Blob } from 'buffer';
import { imageProcessing } from '../config/imageUpload.js';
import sharp from 'sharp';

dotenv.config();

// 토근 매니저 등록
tokenManager.registerProvider('naver', {
    expiresIn: 3 * 60 * 60 * 1000, // 3시간
    refreshThreshold: 30 * 60 * 1000, // 30분
    onTokenExpiring: async (provider, tokenInfo) => {
        try {
            const newToken = await getAccessToken();
            tokenManager.setToken(provider, newToken);
        } catch (error) {
            console.error('Failed to refresh Naver token', error);
        }
    },
});

// 토큰 발급
export const getAccessToken = async (req, res) => {
    try {
        const existingToken = tokenManager.getToken('naver');
        if (existingToken && tokenManager.isTokenValid('naver')) {
            return res.status(200).json({ token: existingToken });
        }

        const timestamp = Date.now();
        const clientId = process.env.NAVER_CLIENT_ID;
        const clientSecret = process.env.NAVER_CLIENT_SECRET;

        const password = `${clientId}_${timestamp}`;
        const hashedPassword = bcrypt.hashSync(password, clientSecret);
        const signature = Buffer.from(hashedPassword, 'utf-8').toString('base64');
        const data = new URLSearchParams();
        data.append('client_id', clientId);
        data.append('timestamp', timestamp);
        data.append('grant_type', 'client_credentials');
        data.append('client_secret_sign', signature);
        data.append('type', 'SELF');
        data.toString();
        const response = await axios.post(
            `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/oauth2/token`,
            data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        tokenManager.setToken('naver', response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('Naver token error', error);
        throw error;
    }
};

// API 요청을 처리하는 공통 함수 추가
const executeWithTokenRetry = async (apiCall) => {
    try {
        let token = tokenManager.getToken('naver');
        if (!token || !tokenManager.isTokenValid('naver')) {
            token = await getAccessToken();
        }

        try {
            return await apiCall(token);
        } catch (error) {
            // 토큰 관련 에러 발생 시 (401 Unauthorized)
            if (error.response && error.response.status === 401) {
                token = await getAccessToken();
                return await apiCall(token);
            }
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// 카테고리별 속성값 조회
export const getProductAttributeValues = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(
                `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/product-attributes/attribute-values?categoryId=${categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver product attributes error', error);
        res.status(500).json({ error: error.message });
    }
};

export const getProductAttributes = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(
                `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/product-attributes/attributes?categoryId=${categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver product attributes error', error);
        res.status(500).json({ error: error.message });
    }
};

// 원산지 조회
export const getOriginAreaInfo = async (req, res) => {
    try {
        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(
                `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/product-origin-areas`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver origin area info error', error);
        res.status(500).json({ error: error.message });
    }
};

// naver 카테고리 조회
//https://api.commerce.naver.com/external/v1/categories/{categoryId}
export const getNaverCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(
                `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/categories/${categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver category error', error);
        res.status(500).json({ error: error.message });
    }
};

export const getNaverTagInfo = async (req, res) => {
    try {
        const keyword = req.params.keyword;
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(
                `${process.env.NAVER_API_BASE_URL}/external/v2/tags/recommend-tags?keyword=${keyword}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver tag info error', error);
        res.status(500).json({ error: error.message });
    }
};

// 상품정보제공고시 상품군 목록 조회
//https://api.commerce.naver.com/external/v1/products-for-provided-notice
//"path": "/external/v1/products-for-provided-notice?categoryId=SOME_STRING_VALUE",
export const getNaverProductForProvidedNotice = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        let categoryNum = await getNaverCategoryModel(categoryId);
        if (categoryNum.length === 0) {
            return res.status(400).json({ error: 'Category ID is required' });
        } else {
            categoryNum = categoryNum[0].categoryNum;
        }

        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(
                `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/products-for-provided-notice?categoryId=${categoryNum}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver product for provided notice error', error);
        res.status(500).json({ error: error.message });
    }
};

// 한달에 한번 확인
//https://api.commerce.naver.com/external/v1/categories
export const getNaverCategoryList = async (req, res) => {
    try {
        const response = await executeWithTokenRetry(async (token) => {
            return await axios.get(`${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        });

        const naverCategoryList = response.data;
        await Promise.all(
            naverCategoryList.map((item) => {
                postNaverCategory(item);
            })
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Naver category list error', error);
        res.status(500).json({ error: error.message });
    }
};

const optimizeImageForNaver = async (buffer) => {
    try {
        const maxSize = 9900000; // 9.9MB
        const targetWidth = 1000;
        const targetHeight = 1000;
        let optimizedBuffer = buffer;

        // 먼저 1000x1000으로 리사이즈
        optimizedBuffer = await sharp(buffer)
            .resize(targetWidth, targetHeight, {
                fit: 'inside',
                withoutEnlargement: false,
            })
            .toBuffer();

        // 용량이 여전히 크다면 품질을 조절하며 압축 시도
        if (optimizedBuffer.length > maxSize) {
            let quality = 80; // 초기 품질

            while (optimizedBuffer.length > maxSize && quality >= 20) {
                console.log(`압축 시도: 품질 ${quality}%, 현재 크기: ${optimizedBuffer.length} bytes`);

                optimizedBuffer = await sharp(optimizedBuffer)
                    .jpeg({
                        quality,
                        progressive: true,
                        force: true,
                        chromaSubsampling: '4:2:0',
                    })
                    .toBuffer();

                // 품질을 점진적으로 낮춤
                quality -= 5;
            }
        }

        // 최종 이미지 메타데이터 확인 및 로깅
        const finalMetadata = await sharp(optimizedBuffer).metadata();
        console.log('최종 이미지 정보:', {
            width: finalMetadata.width,
            height: finalMetadata.height,
            size: optimizedBuffer.length,
            format: finalMetadata.format,
        });

        return optimizedBuffer;
    } catch (error) {
        console.error('이미지 최적화 중 오류 발생:', error);
        throw error;
    }
};

export const uploadNaverProductImage = async (req) => {
    try {
        const { imageFiles } = req.body;
        if (!imageFiles) {
            throw new Error('이미지 파일이 필요합니다.');
        }

        const maxBatchSize = 9900000; // 9.9MB (네이버 API 제한)
        const imageFileArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
        const results = [];
        let currentBatch = [];
        let currentBatchSize = 0;

        // 이미지 파일들을 순회하며 배치 구성
        for (let i = 0; i < imageFileArray.length; i++) {
            try {
                let fullPath;
                if (imageFileArray[i].startsWith('C:')) {
                    fullPath = imageFileArray[i];
                } else {
                    fullPath = path.join(process.cwd(), imageFileArray[i].replace(/^\//, ''));
                }

                if (!fs.existsSync(fullPath)) {
                    console.error(`파일이 존재하지 않습니다: ${fullPath}`);
                    continue;
                }

                const buffer = await fs.promises.readFile(fullPath);
                const fileSize = buffer.length;

                // 현재 배치에 추가했을 때 크기 초과하면 현재 배치 먼저 업로드
                if (currentBatchSize + fileSize > maxBatchSize) {
                    if (currentBatch.length > 0) {
                        const uploadResult = await uploadImageBatch(currentBatch);
                        results.push(...uploadResult);
                    }
                    currentBatch = [];
                    currentBatchSize = 0;
                }

                currentBatch.push({
                    buffer,
                    filename: path.basename(imageFileArray[i]),
                });
                currentBatchSize += fileSize;
            } catch (error) {
                console.error(`이미지 처리 중 오류 발생: ${imageFileArray[i]}`, error);
            }
        }

        // 마지막 배치 업로드
        if (currentBatch.length > 0) {
            const uploadResult = await uploadImageBatch(currentBatch);
            results.push(...uploadResult);
        }

        console.log(`총 처리된 이미지 수: ${results.length}`);

        return {
            success: true,
            message: '이미지가 성공적으로 업로드되었습니다.',
            data: results,
        };
    } catch (error) {
        console.error('네이버 상품 이미지 업로드 에러:', error);
        throw error;
    }
};

const uploadImageBatch = async (imageBatch) => {
    const formData = new FormData();
    imageBatch.forEach(({ buffer, filename }) => {
        formData.append('imageFiles', buffer, {
            filename,
            contentType: 'image/jpeg',
        });
    });

    const response = await executeWithTokenRetry(async (token) => {
        return await axios.post(
            `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/product-images/upload`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...formData.getHeaders(),
                },
            }
        );
    });

    return response.data.images || [];
};

// 판매자 주소록 조회

export const getNaverSellerAddressBook = async (req, res) => {
    const response = await executeWithTokenRetry(async (token) => {
        return await axios.get(
            `${process.env.NAVER_API_BASE_URL}${process.env.NAVER_API_VERSION}/seller/addressbooks-for-page?page=1`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    });
    res.status(200).json(response.data);
};
/**
 * const http = require("https");

const options = {
  "method": "POST",
  "hostname": "api.commerce.naver.com",
  "port": null,
  "path": "/external/v2/products",
  "headers": {
    "Authorization": "Bearer REPLACE_BEARER_TOKEN",
    "content-type": "application/json"
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

 */
export const registerNaverProduct = async (req, res) => {
    try {
        const productData = req.body;
        let paramData = await createNaverProduct(productData);
        console.log('paramData', paramData.platformTag);
        paramData = JSON.stringify(paramData);
        console.log('paramData', paramData);
        const response = await executeWithTokenRetry(async (token) => {
            return await axios.post(`https://api.commerce.naver.com/external/v2/products`, paramData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        });
        res.status(200).json({
            message: 'success',
            data: response.data,
        });
    } catch (error) {
        if (error.response) {
            // 서버가 400 등의 HTTP 응답 코드를 반환했을 때
            console.error('에러 상태 코드:', error.response.status);
            console.error('에러 메시지:', error.response.data.message);

            // invalidInputs 값 확인
            if (error.response.data.invalidInputs) {
                console.error('유효하지 않은 입력 데이터:', error.response.data.invalidInputs);
            }
        } else if (error.request) {
            // 요청이 전송되었지만 응답이 없을 때
            console.error('요청이 응답하지 않음:', error.request);
        } else {
            // 요청 설정 중 발생한 에러
            console.error('에러 발생:', error.message);
        }
        res.status(500).json({
            message: 'failed',
            error: error.message,
        });
    }
};

const createNaverProduct = async (productData) => {
    const detailImage = await getDetailImageData(productData.wholesaleProductId);
    const detailContent = createDetailContent(detailImage);
    const images = await createImages(productData.wholesaleProductId);
    const deliveryInfo = createDeliveryInfo(productData.platformProductDeliveryInfo);
    const detailAttributes = await createDetailAttributes(productData);
    const customerBenefit = createCustomerBenefit(productData);

    const naverProductData = {
        originProduct: {
            statusType: 'SALE',
            saleType: 'NEW',
            leafCategoryId: productData.productCategory.naver[0].category_num,
            name: productData.productName,
            detailContent: detailContent,
            images: images,
            saleStartDate: '',
            saleEndDate: '',
            salePrice: parseInt(productData.productPrice),
            stockQuantity: 100,
            deliveryInfo: deliveryInfo,
            productLogistics: null,
            detailAttribute: detailAttributes,
            customerBenefit: customerBenefit,
        },
        smartstoreChannelProduct: {
            channelProductName: productData.productName,
            bbsSeq: null,
            storeKeepExclusiveProduct: false,
            naverShoppingRegistration: false,
            channelProductDisplayStatusType: 'ON',
        },
    };

    console.log(JSON.stringify(naverProductData, null, 2));
    return naverProductData;
};

const createDetailContent = (detailImage) => {
    let detailContent = '<p align=center>';
    detailImage.map((item) => {
        detailContent += `<img src="${item.dtlImgUrl}">`;
    });
    detailContent += '</p>';
    return detailContent;
};

const createImages = async (wholesaleProductId) => {
    const getUploadThumbnailData = await getUploadThumbnail(wholesaleProductId, 'naver');
    let imgUrlArry = [];
    getUploadThumbnailData.map((item) => {
        imgUrlArry.push(item.imgUrl);
    });
    // 배열 순서 랜덤으로 섞어서 배치
    imgUrlArry = imgUrlArry.sort(() => Math.random() - 0.5);
    // 0-9 번째까지 남기고 나머지는 버림
    imgUrlArry = imgUrlArry.slice(0, 10);
    const representativeImage = { url: imgUrlArry[0] };
    // representativeImage 제외하고 나머지 배열
    const optionalImages = imgUrlArry.slice(1).map((item) => {
        return { url: item };
    });
    return { representativeImage, optionalImages };
};

const createDeliveryInfo = (deliveryData) => {
    let deliveryInfo = deliveryData[0];
    const deliveryFee = createDeliveryFee(deliveryInfo);
    const claimDeliveryInfo = createClaimDeliveryInfo(deliveryInfo);
    deliveryInfo = {
        deliveryType: deliveryInfo.deliveryType,
        deliveryAttributeType: deliveryInfo.deliveryAttType,
        deliveryCompany: deliveryInfo.deliveryCompanyCode,
        outboundLocationId: '',
        deliveryBundleGroupUsable: false,
        deliveryBundleGroupId: '',
        quickServiceAreas: [],
        visitAddressId: '',
        deliveryFee: deliveryFee,
        claimDeliveryInfo: claimDeliveryInfo,
        installation: null,
        installationFee: null,
        expectedDeliveryPeriodType: null,
        expectedDeliveryPeriodDirectInput: null,
        todayStockQuantity: null,
        customProductAfterOrderYn: null,
        hopeDeliveryGroupId: null,
        businessCustomsClearanceSaleYn: null,
    };
    return deliveryInfo;
};

const createDeliveryFee = (deliveryData) => {
    console.log('deliveryData****************************', deliveryData);
    const deliveryFee = {
        deliveryFeeType: deliveryData.deliveryFeeType,
        baseFee: parseInt(deliveryData.deliveryBaseFee),
        freeConditionalAmount: parseInt(deliveryData.freeConditionAmount),
        repeatQuantity: null,
        secondBaseQuantity: null,
        secondExtraFee: null,
        thirdBaseQuantity: null,
        thirdExtraFee: deliveryData.extraDeliveryFee,
        deliveryFeePayType: deliveryData.deliveryPayType,
        deliveryFeeByArea: null,
        differentialFeeByArea: null,
    };

    return deliveryFee;
};

const createClaimDeliveryInfo = (deliveryData) => {
    const claimDeliveryInfoData = deliveryData;
    const claimDeliveryInfo = {
        returnDeliveryCompanyPriorityType: claimDeliveryInfoData.returnDeliveryCompany,
        returnDeliveryFee: parseInt(claimDeliveryInfoData.returnDeliveryFee),
        exchangeDeliveryFee: parseInt(claimDeliveryInfoData.extraDeliveryFee),
        shippingAddressId: 106953199,
        returnAddressId: 106953199,
        freeReturnInsuranceYn: false,
    };

    return claimDeliveryInfo;
};

const createDetailAttributes = async (productData) => {
    const platformAttributes = productData.platformProductAttribute.naver;
    const certificateList = platformAttributes.certificationList;
    const originArea = platformAttributes.originArea;
    const productInfoProvidedNoticeContents = platformAttributes.productInfoProvidedNoticeContents;
    const selectedAttributes = platformAttributes.selectedAttributes;
    const purchaseQuantityInfo = createPurchaseQuantityInfo();

    const naverShoppingSearchInfo = createNaverShoppingSearchInfo();

    const afterServiceInfo = createAfterServiceInfo();
    const originAreaInfo = createOriginAreaInfo(originArea[0]);

    const sellerCodeInfo = createSellerCodeInfo(productData);

    const optionInfo = createOptionInfo(productData.platformProductOption);
    const supplementProductInfo = null;
    const isbnInfo = null;
    const bookInfo = null;
    const eventPhraseCont = '';
    // 현재 날짜 yyyy-MM-dd
    const manufactureDate = new Date().toISOString().split('T')[0];
    const releaseDate = new Date().toISOString().split('T')[0];
    const validDate = null;
    const taxType = 'TAX';
    const productCertificationInfos = createProductCertificationInfos(
        productData.platformProductAttribute.naver.certificationList
    );
    // KC 인증 대상 여부 확인 로직 필요... 아직 없음
    //const certificationTargetExcludeContent = createCertificationTargetExcludeContent();
    const certificationTargetExcludeContent = null;
    const sellerCommentContent = null;
    const sellerCommentUsable = false;
    const minorPurchasable = true;
    const ecoupon = null;

    const productInfoProvidedNotice = createProductInfoProvidedNotice(
        productData.platformProductAttribute.naver.productInfoProvidedNoticeContents
    );
    const productAttributes = createProductAttributes(productData.platformProductAttribute.naver.selectedAttributes);
    console.log('productAttributes****************************', productAttributes);
    const cultureCostIncomeDeductionYn = null;
    const customProductYn = null;
    const itselfProductionProductYn = null;
    const brandCertificationYn = null;
    const seoInfo = await createSeoInfo(productData.productId);
    const productSize = null;

    const detailAttributes = {
        naverShoppingSearchInfo: naverShoppingSearchInfo,
        manufactureDefineNo: '',
        afterServiceInfo: afterServiceInfo,
        purchaseQuantityInfo: null,
        originAreaInfo: originAreaInfo,
        sellerCodeInfo: sellerCodeInfo,
        optionInfo: optionInfo,
        supplementProductInfo: supplementProductInfo,
        isbnInfo: isbnInfo,
        bookInfo: bookInfo,
        eventPhraseCont: eventPhraseCont,
        manufactureDate: manufactureDate,
        releaseDate: releaseDate,
        validDate: validDate,
        taxType: taxType,
        productCertificationInfos: productCertificationInfos,
        certificationTargetExcludeContent: certificationTargetExcludeContent,
        sellerCommentContent: sellerCommentContent,
        sellerCommentUsable: sellerCommentUsable,
        minorPurchasable: minorPurchasable,
        ecoupon: ecoupon,
        productInfoProvidedNotice: productInfoProvidedNotice,
        // 속성 저장 DB 구조 변경 필요
        productAttributes: productAttributes,
        cultureCostIncomeDeductionYn: null,
        customProductYn: customProductYn,
        itselfProductionProductYn: itselfProductionProductYn,
        brandCertificationYn: brandCertificationYn,
        seoInfo: seoInfo,
        productSize: productSize,
    };

    return detailAttributes;
};

const createSeoInfo = async (productId) => {
    const result = await getProductTag(productId);
    const productTag = result.map((item) => {
        return {
            code: item.code,
            text: item.text,
        };
    });
    console.log('productTag****************************', productTag);

    const seoInfo = {
        pageTitle: '',
        metaDescription: '',
        sellerTags: productTag,
    };
    return seoInfo;
};

const createNaverShoppingSearchInfo = () => {
    const manufacturerName = '인영상회 협력사';
    const brandName = '인영상회 협력사';
    const naverShoppingSearchInfo = {
        modelId: null,
        modelName: '',
        manufacturerName: manufacturerName,
        brandId: null,
        brandName: brandName,
    };
    return naverShoppingSearchInfo;
};

const createAfterServiceInfo = () => {
    const afterServiceTelephoneNumber = '010-3504-8164';
    const afterServiceGuideContent = '전화상담 가능하나, 네이버톡톡으로 문의 주시면 더욱 빠르게 답변 가능합니다.';
    const afterServiceInfo = {
        afterServiceTelephoneNumber: afterServiceTelephoneNumber,
        afterServiceGuideContent: afterServiceGuideContent,
    };
    return afterServiceInfo;
};

const createOriginAreaInfo = (originArea) => {
    const originNation = '03';
    const importer = '인영상회';
    const originAreaInfo = {
        originAreaCode: originNation,
        importer: importer,
        content: '',
        plural: false,
    };
    return originAreaInfo;
};

const createSellerCodeInfo = (productData) => {
    const sellperManagementCode = productData.productId;
    const sellerCustomCode1 = `${productData.productCode}_${productData.siteName}`;
    const sellerCodeInfoData = {
        sellperManagementCode: sellperManagementCode,
        sellerBarcode: '',
        sellerCustomCode1: sellerCustomCode1,
        sellerCustomCode2: '',
    };
    return sellerCodeInfoData;
};

const createOptionInfo = (optionData) => {
    console.log(optionData);

    // 기본 옵션 정보만 포함
    let optionInfo = {
        useStockManagement: true,
        optionDeliveryAttributes: [],
    };

    // 네이버 옵션 데이터 처리
    const optionsToUse = optionData.naver && optionData.naver.length > 0 ? optionData.naver : optionData.all;
    if (optionsToUse && optionsToUse.length > 0) {
        const optionType = optionsToUse[0].optionType;
        console.log('optionType****************************', optionType);

        if (optionType === 'single') {
            const simpleOption = createSimpleOption(optionsToUse);
            optionInfo = {
                ...optionInfo,
                simpleOptionSortType: 'ABC',
                optionSimple: simpleOption,
            };
        } else if (optionType === 'combination') {
            const combinationOption = createCombinationOption(optionsToUse);
            console.log('combinationOption****************************', combinationOption);
            optionInfo = {
                ...optionInfo,
                optionCombinationSortType: 'ABC',
                optionCombinationGroupNames: combinationOption.optionCombinationGroupNames,
                optionCombinations: combinationOption.optionCombinations,
            };
        }
    }
    console.log('optionInfo****************************', optionInfo);
    return optionInfo;
};

// 단독형 옵션 생성
const createSimpleOption = (optionData) => {
    // 옵션 그룹명 추출 (중복 제거)
    const optionNameSet = new Set();
    optionData.forEach((item) => {
        optionNameSet.add(item.optionName);
    });
    const optionNameArray = Array.from(optionNameSet);

    // standardOptionGroups 생성
    const standardOptionGroups = optionNameArray.map((groupName, groupIndex) => {
        const standardOptionAttributes = [];
        const optionsInGroup = optionData.filter((item) => item.optionName === groupName);

        optionsInGroup.forEach((option, index) => {
            standardOptionAttributes.push({
                attributeId: groupIndex * 1000 + index,
                attributeValueId: groupIndex * 1000 + index,
                attributeValueName: option.optionValue,
                imageUrls: option.imageUrls || null,
            });
        });

        return {
            groupName: groupName,
            standardOptionAttributes: standardOptionAttributes,
        };
    });

    // optionStandards 생성
    const optionStandards = optionData.map((option, index) => {
        return {
            id: index + 1,
            optionName1: option.optionValue,
            optionName2: '',
            stockQuantity: option.stockQuantity || 0,
            sellerManagerCode: option.sellerManagerCode || `STD_${index + 1}`,
            usable: true,
        };
    });

    return {
        standardOptionGroups,
        optionStandards,
    };
};

// 조합형 옵션 생성
const createCombinationOption = (optionData) => {
    // 옵션 그룹명 추출 (/ 구분자로 분리)
    const combinationNames = optionData[0].optionName.split('/');

    // optionCombinationGroupNames 생성
    const optionCombinationGroupNames = {
        optionGroupName1: '',
        optionGroupName2: '',
        optionGroupName3: '',
        optionGroupName4: '',
    };

    // 그룹명 설정
    combinationNames.forEach((name, index) => {
        if (name && name.trim()) {
            optionCombinationGroupNames[`optionGroupName${index + 1}`] = name.trim();
        }
    });

    // optionCombinations 생성
    const optionCombinations = optionData.map((option, index) => {
        const optionValues = option.optionValue.split('/');
        console.log('option****************************', option);
        return {
            id: '',
            stockQuantity: option.optionStock || 0,
            price: option.optionPrice || 0,
            usable: true,
            optionName1: optionValues[0] || '',
            optionName2: optionValues[1] || '',
            optionName3: optionValues[2] || '',
            optionName4: optionValues[3] || '',
            sellerManagerCode: option.sellerManagerCode || `COMB_${index + 1}`,
        };
    });

    return {
        optionCombinationGroupNames,
        optionCombinations,
    };
};

const createProductCertificationInfos = (productCertificationInfosList) => {
    /**
     * certificationInfoId,
        certificationKindType,
        name,
        certificationNumber,
        certificationMark,
        companyName,
        certificationDate,
     */
    let productCertificationInfos = [];
    console.log('productCertificationInfosList****************************', productCertificationInfosList);
    productCertificationInfosList.map((item) => {
        const certificationInfoType = 'ETC';
        const companyName = '';
        console.log('item****************************', item);
        productCertificationInfos.push({
            certificationInfoId: item.certInfo,
            certificationKindType: 'KC_CERTIFICATION',
            name: item.agency,
            certificationNumber: item.number,
            certificationMark: false,
            companyName: companyName,
            certificationDate: '',
        });
    });
    console.log('productCertificationInfos****************************', productCertificationInfos);
    return productCertificationInfos;
};

// 추후 개발 필요
const createCertificationTargetExcludeContent = () => {
    const certificationTargetExcludeContent = {
        childCertifiedProductExclusionYn: false,
        kcExemptionType: null,
        kcCertifiedProductExclusionYn: null,
        greenCertifiedProductExclusionYn: false,
    };
    return certificationTargetExcludeContent;
};

const createProductInfoProvidedNotice = (productInfoProvidedNoticeList) => {
    const productInfoProvidedNoticeType = productInfoProvidedNoticeList[0].productInfoProvidedNoticeType;
    let productInfoProvidedNoticeData = {};
    productInfoProvidedNoticeData = createProductInfoProvidedNoticeData(productInfoProvidedNoticeList);
    let typeName = '';
    switch (productInfoProvidedNoticeType) {
        case 'WEAR':
            typeName = 'wear';
            break;
        case 'SHOES':
            typeName = 'shoes';
            break;
        case 'BAG':
            typeName = 'bag';
            break;
        case 'FASHION_ITEMS':
            typeName = 'fashionItems';
            break;
        case 'SLEEPING_GEAR':
            typeName = 'sleepingGear';
            break;
        case 'FURNITURE':
            typeName = 'furniture';
            break;
        case 'IMAGE_APPLIANCES':
            typeName = 'imageAppliances';
            break;
        case 'HOME_APPLIANCES':
            typeName = 'homeAppliances';
            break;
        case 'SEASON_APPLIANCES':
            typeName = 'seasonAppliances';
            break;
        case 'OFFICE_APPLIANCES':
            typeName = 'officeAppliances';
            break;
        case 'OPTICS_APPLIANCES':
            typeName = 'opticsAppliances';
            break;
        case 'MICROELECTRONICS':
            typeName = 'microElectronics';
            break;
        case 'CELLPHONE':
            typeName = 'cellPhone';
            break;
        case 'NAVIGATION':
            typeName = 'navigation';
            break;
        case 'CAR_ARTICLES':
            typeName = 'carArticles';
            break;
        case 'MEDICAL_APPLIANCES':
            typeName = 'medicalAppliances';
            break;
        case 'KITCHEN_UTENSILS':
            typeName = 'kitchenUtensils';
            break;
        case 'COSMETIC':
            typeName = 'cosmetic';
            break;
        case 'JEWELLERY':
            typeName = 'jewellery';
            break;
        case 'FOOD':
            typeName = 'food';
            break;
        case 'GENERAL_FOOD':
            typeName = 'generalFood';
            break;
        case 'DIET_FOOD':
            typeName = 'dietFood';
            break;
        case 'KIDS':
            typeName = 'kids';
            break;
        case 'MUSICAL_INSTRUMENT':
            typeName = 'musicalInstrument';
            break;
        case 'SPORTS_EQUIPMENT':
            typeName = 'sportsEquipment';
            break;
        case 'BOOKS':
            typeName = 'books';
            break;
        case 'LODGMENT_RESERVATION':
            typeName = 'lodgmentReservation';
            break;
        case 'TRAVEL_PACKAGE':
            typeName = 'travelPackage';
            break;
        case 'AIRLINE_TICKET':
            typeName = 'airlineTicket';
            break;
        case 'RENT_CAR':
            typeName = 'rentCar';
            break;
        case 'RENTAL_HA':
            typeName = 'rentalHa';
            break;
        case 'RENTAL_ETC':
            typeName = 'rentalEtc';
            break;
        case 'DIGITAL_CONTENTS':
            typeName = 'digitalContents';
            break;
        case 'GIFT_CARD':
            typeName = 'giftCard';
            break;
        case 'MOBILE_COUPON':
            typeName = 'mobileCoupon';
            break;
        case 'MOVIE_SHOW':
            typeName = 'movieShow';
            break;
        case 'ETC_SERVICE':
            typeName = 'etcService';
            break;
        case 'BIOCHEMISTRY':
            typeName = 'biochemistry';
            break;
        case 'BIOCIDAL':
            typeName = 'biocidal';
            break;
        case 'ETC':
            typeName = 'etc';
            break;
    }
    // typeName이 객체 이름으로 변경
    const productInfoProvidedNotice = {
        productInfoProvidedNoticeType: productInfoProvidedNoticeType,
        [typeName]: { ...productInfoProvidedNoticeData },
    };
    return productInfoProvidedNotice;
};

const createProductInfoProvidedNoticeData = (productInfoProvidedNoticeList) => {
    let productInfoProvidedNotice = {
        returnCostReason: 0,
        noRefundReason: 0,
        qualityAssuranceStandard: 0,
        compensationProcedure: 0,
        troubleShootingContents: 0,
    };

    productInfoProvidedNoticeList.map((item) => {
        switch (item.fieldName) {
            case 'material':
                productInfoProvidedNotice.material = item.fieldValue;
                break;
            case 'color':
                productInfoProvidedNotice.color = item.fieldValue;
                break;
            case 'size':
                productInfoProvidedNotice.size = item.fieldValue;
                break;
            case 'manufacturer':
                productInfoProvidedNotice.manufacturer = item.fieldValue;
                break;
            case 'caution':
                productInfoProvidedNotice.caution = item.fieldValue;
                break;
            case 'warrantyPolicy':
                productInfoProvidedNotice.warrantyPolicy = item.fieldValue;
                break;
            case 'afterServiceDirector':
                productInfoProvidedNotice.afterServiceDirector = null;
                break;
            case 'itemName':
                productInfoProvidedNotice.itemName = item.fieldValue;
                break;
            case 'modelName':
                productInfoProvidedNotice.modelName = item.fieldValue;
                break;
            case 'certificationType':
                productInfoProvidedNotice.certificationType = item.fieldValue;
                break;
            case 'components':
                productInfoProvidedNotice.components = item.fieldValue;
                break;
            case 'importer':
                productInfoProvidedNotice.importer = item.fieldValue;
                break;
            case 'producer':
                productInfoProvidedNotice.producer = item.fieldValue;
                break;
            case 'installedCharge':
                productInfoProvidedNotice.installedCharge = item.fieldValue;
                break;
            case 'ratedVoltage':
                productInfoProvidedNotice.ratedVoltage = item.fieldValue;
                break;
            case 'powerConsumption':
                productInfoProvidedNotice.powerConsumption = item.fieldValue;
                break;
            case 'energyEfficiencyRating':
                productInfoProvidedNotice.energyEfficiencyRating = item.fieldValue;
                break;
            case 'releaseDate':
                productInfoProvidedNotice.releaseDate = item.fieldValue;
                break;
            case 'releaseDateText':
                productInfoProvidedNotice.releaseDateText = item.fieldValue;
                break;
            case 'additionalCost':
                productInfoProvidedNotice.additionalCost = item.fieldValue;
                break;
            case 'displaySpecification':
                productInfoProvidedNotice.displaySpecification = item.fieldValue;
                break;
            case 'area':
                productInfoProvidedNotice.area = item.fieldValue;
                break;
            case 'weight':
                productInfoProvidedNotice.weight = item.fieldValue;
                break;
            case 'specification':
                productInfoProvidedNotice.specification = item.fieldValue;
                break;
            case 'purpose':
                productInfoProvidedNotice.purpose = item.fieldValue;
                break;
            case 'usage':
                productInfoProvidedNotice.usage = item.fieldValue;
                break;
            case 'component':
                productInfoProvidedNotice.component = item.fieldValue;
                break;
            case 'importDeclaration':
                productInfoProvidedNotice.importDeclaration = item.fieldValue;
                break;
            case 'mainIngredient':
                productInfoProvidedNotice.mainIngredient = item.fieldValue;
                break;
            case 'purity':
                productInfoProvidedNotice.purity = item.fieldValue;
                break;
            case 'bandMaterial':
                productInfoProvidedNotice.bandMaterial = item.fieldValue;
                break;
            case 'provideWarranty':
                productInfoProvidedNotice.provideWarranty = item.fieldValue;
                break;
            case 'packDate':
                productInfoProvidedNotice.packDate = item.fieldValue;
                break;
            case 'packDateText':
                productInfoProvidedNotice.packDateText = item.fieldValue;
                break;
            case 'consumptionDate':
                productInfoProvidedNotice.consumptionDate = item.fieldValue;
                break;
            case 'consumptionDateText':
                productInfoProvidedNotice.consumptionDateText = item.fieldValue;
                break;
            case 'productComposition':
                productInfoProvidedNotice.productComposition = item.fieldValue;
                break;
            case 'keep':
                productInfoProvidedNotice.keep = item.fieldValue;
                break;
            case 'ingredients':
                productInfoProvidedNotice.ingredients = item.fieldValue;
                break;
            case 'nutritionFacts':
                productInfoProvidedNotice.nutritionFacts = item.fieldValue;
                break;
            case 'geneticallyModified':
                productInfoProvidedNotice.geneticallyModified = item.fieldValue;
                break;
            case 'consumerSafetyCaution':
                productInfoProvidedNotice.consumerSafetyCaution = item.fieldValue;
                break;
            case 'importDeclarationCheck':
                productInfoProvidedNotice.importDeclarationCheck = item.fieldValue;
                break;
            case 'customerServicePhoneNumber':
                productInfoProvidedNotice.customerServicePhoneNumber = item.fieldValue;
                break;
            case 'recommendedAge':
                productInfoProvidedNotice.recommendedAge = item.fieldValue;
                break;
            case 'numberLimit':
                productInfoProvidedNotice.numberLimit = item.fieldValue;
                break;
            case 'detailContent':
                productInfoProvidedNotice.detailContent = item.fieldValue;
                break;
            case 'title':
                productInfoProvidedNotice.title = item.fieldValue;
                break;
            case 'author':
                productInfoProvidedNotice.author = item.fieldValue;
                break;
            case 'publisher':
                productInfoProvidedNotice.publisher = item.fieldValue;
                break;
            case 'pages':
                productInfoProvidedNotice.pages = item.fieldValue;
                break;
            case 'publishDate':
                productInfoProvidedNotice.publishDate = item.fieldValue;
                break;
            case 'publishDateText':
                productInfoProvidedNotice.publishDateText = item.fieldValue;
                break;
            case 'description':
                productInfoProvidedNotice.description = item.fieldValue;
                break;
            case 'ownershipTransferCondition':
                productInfoProvidedNotice.ownershipTransferCondition = item.fieldValue;
                break;
            case 'payingForLossOrDamage':
                productInfoProvidedNotice.payingForLossOrDamage = item.fieldValue;
                break;
            case 'refundPolicyForCancel':
                productInfoProvidedNotice.refundPolicyForCancel = item.fieldValue;
                break;
            case 'maintenance':
                productInfoProvidedNotice.maintenance = item.fieldValue;
                break;
            case 'termsOfUse':
                productInfoProvidedNotice.termsOfUse = item.fieldValue;
                break;
            case 'usePeriod':
                productInfoProvidedNotice.usePeriod = item.fieldValue;
                break;
            case 'medium':
                productInfoProvidedNotice.medium = item.fieldValue;
                break;
            case 'requirement':
                productInfoProvidedNotice.requirement = item.fieldValue;
                break;
            case 'cancelationPolicy':
                productInfoProvidedNotice.cancelationPolicy = item.fieldValue;
                break;
            case 'issuer':
                productInfoProvidedNotice.issuer = item.fieldValue;
                break;
            case 'periodStartDate':
                productInfoProvidedNotice.periodStartDate = item.fieldValue;
                break;
            case 'periodEndDate':
                productInfoProvidedNotice.periodEndDate = item.fieldValue;
                break;
            case 'periodDays':
                productInfoProvidedNotice.periodDays = item.fieldValue;
                break;
            case 'useStorePlace':
                productInfoProvidedNotice.useStorePlace = item.fieldValue;
                break;
            case 'useStoreAddressId':
                productInfoProvidedNotice.useStoreAddressId = item.fieldValue;
                break;
            case 'useStoreUrl':
                productInfoProvidedNotice.useStoreUrl = item.fieldValue;
                break;
            case 'refundPolicy':
                productInfoProvidedNotice.refundPolicy = item.fieldValue;
                break;
            case 'usableCondition':
                productInfoProvidedNotice.usableCondition = item.fieldValue;
                break;
            case 'usableStore':
                productInfoProvidedNotice.usableStore = item.fieldValue;
                break;
            case 'sponsor':
                productInfoProvidedNotice.sponsor = item.fieldValue;
                break;
            case 'actor':
                productInfoProvidedNotice.actor = item.fieldValue;
                break;
            case 'rating':
                productInfoProvidedNotice.rating = item.fieldValue;
                break;
            case 'showTime':
                productInfoProvidedNotice.showTime = item.fieldValue;
                break;
            case 'showPlace':
                productInfoProvidedNotice.showPlace = item.fieldValue;
                break;
            case 'cancelationCondition':
                productInfoProvidedNotice.cancelationCondition = item.fieldValue;
                break;
            case 'serviceProvider':
                productInfoProvidedNotice.serviceProvider = item.fieldValue;
                break;
            case 'certificateDetails':
                productInfoProvidedNotice.certificateDetails = item.fieldValue;
                break;
            case 'cancelationStandard':
                productInfoProvidedNotice.cancelationStandard = item.fieldValue;
                break;
            case 'effect':
                productInfoProvidedNotice.effect = item.fieldValue;
                break;
            case 'childProtection':
                productInfoProvidedNotice.childProtection = item.fieldValue;
                break;
            case 'chemicals':
                productInfoProvidedNotice.chemicals = item.fieldValue;
                break;
            case 'safeCriterionNo':
                productInfoProvidedNotice.safeCriterionNo = item.fieldValue;
                break;
            case 'rangeOfUse':
                productInfoProvidedNotice.rangeOfUse = item.fieldValue;
                break;
            case 'harmfulChemicalSubstance':
                productInfoProvidedNotice.harmfulChemicalSubstance = item.fieldValue;
                break;
            case 'maleficence':
                productInfoProvidedNotice.maleficence = item.fieldValue;
                break;
            case 'approvalNumber':
                productInfoProvidedNotice.approvalNumber = item.fieldValue;
                break;
            case 'telecomType':
                productInfoProvidedNotice.telecomType = item.fieldValue;
                break;
            case 'joinProcess':
                productInfoProvidedNotice.joinProcess = item.fieldValue;
                break;
            case 'extraBurden':
                productInfoProvidedNotice.extraBurden = item.fieldValue;
                break;
        }
    });

    return productInfoProvidedNotice;
};

const createPurchaseQuantityInfo = (productData) => {
    const purchaseQuantityInfo = {
        minPurchaseQuantity: 0,
        maxPurchaseQuantityPerId: 0,
        maxPurchaseQuantityPerOrder: 0,
    };
    return purchaseQuantityInfo;
};

const createProductAttributes = (productAttributesList) => {
    const productAttributes = [];
    productAttributesList.map((item) => {
        console.log('item****************************', item);
        productAttributes.push({
            attributeSeq: parseInt(item.attributeSeq),
            attributeValueSeq: parseInt(item.attributeValueSeq || '0'),
            attributeRealValue: item.unitcode ? item.minAttributeValue : '',
            attributeRealValueUnitCode: item.unitcode,
        });
    });
    console.log('productAttributes****************************', productAttributes);
    return productAttributes;
};

const createCustomerBenefit = (productData) => {
    const freeInterestPolicy = null;
    const giftPolicy = null;
    const immediateDiscountPolicy = createImmediateDiscountPolicy(productData);
    const multiPurchaseDiscountPolicy = null;
    const purchasePointPolicy = null;
    const reservedDiscountPolicy = null;
    const reviewPointPolicy = createReviewPointPolicy(productData);

    const customerBenefit = {
        freeInterestPolicy: freeInterestPolicy,
        giftPolicy: giftPolicy,
        immediateDiscountPolicy: immediateDiscountPolicy,
        multiPurchaseDiscountPolicy: multiPurchaseDiscountPolicy,
        purchasePointPolicy: purchasePointPolicy,
        reservedDiscountPolicy: reservedDiscountPolicy,
        reviewPointPolicy: reviewPointPolicy,
    };
    return customerBenefit;
};

const createImmediateDiscountPolicy = (productData) => {
    const immediateDiscountPolicy = {
        discountMethod: {
            value: productData.discountCharge,
            unitType: 'WON',
            startDate: null,
            endDate: null,
        },
    };
    return immediateDiscountPolicy;
};

const createReviewPointPolicy = (productData) => {
    console.log(productData);
    const productReviewPoint = productData.platformProductNaverPoint[0];
    const reviewPointPolicy = {
        textReviewPoint: productReviewPoint.textReviewPoint,
        photoVideoReviewPoint: productReviewPoint.videoReviewPoint,
        afterUseTextReviewPoint: productReviewPoint.monthTextReviewPoint,
        afterUsePhotoVideoReviewPoint: productReviewPoint.monthVideoReviewPoint,
        // 추후 추가
        storeMemberReviewPoint: null,
        startDate: null,
        endDate: null,
    };
    return reviewPointPolicy;
};
