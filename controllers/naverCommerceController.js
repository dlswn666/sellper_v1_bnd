import bcrypt from 'bcrypt';
import axios from 'axios';
import tokenManager from '../utils/tokenManager.js';
import dotenv from 'dotenv';
import { postNaverCategory, getNaverCategoryModel } from '../models/naverCommerceModels.js';

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
