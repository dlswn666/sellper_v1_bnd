import db from '../config/db.js';
import { Sequelize } from 'sequelize';
import { v4 as uuid4 } from 'uuid';
import { selectProductData } from '../../sellper_v1/src/apis/productsApi.js';

export const startTransaction = async () => {
    return await db.transaction();
};

export const getProducts = async (data) => {
    const { search, offset, limit } = data;
    try {
        let replacements = {};
        let condition = '';

        if (search) {
            condition += ` WHERE wp.product_name LIKE :productName`;
            replacements.productName = `%${search}%`;
        }

        replacements.offset = parseInt(offset, 10);
        replacements.limit = parseInt(limit, 10);

        let query = `
            SELECT 
            wp.wholesale_product_id AS productId,
            wp.wholesale_site_id AS siteId,
            wp.product_code AS productCode,
            wp.product_name AS productName,
            CONCAT(FORMAT(wp.product_price, 0), ' 원') AS productPrice,
            wp.detail_page_url AS detailPageUrl,
            wp.out_of_stock AS outOfStock,
            wp.last_updated AS lastUpdated,
            wsi.site_name AS siteName,
            IFNULL(p.workingCnt, 0) AS workingCnt
        FROM wholesale_product wp
        LEFT OUTER JOIN wholesale_site_info wsi 
            ON wp.wholesale_site_id = wsi.wholesale_site_id
        LEFT OUTER JOIN (
            SELECT 
                wholesale_product_id, 
                COUNT(*) AS workingCnt
            FROM products
            GROUP BY wholesale_product_id
        ) p
            ON wp.wholesale_product_id = p.wholesale_product_id
        ${condition}
        ORDER BY p.workingCnt ASC
        LIMIT :limit OFFSET :offset
        `;

        const dataQuery = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        const countQuery = `
            SELECT COUNT(*) as total
            FROM wholesale_product wp
             LEFT OUTER JOIN wholesale_site_info wsi 
            ON wp.wholesale_site_id = wsi.wholesale_site_id
        LEFT OUTER JOIN (
            SELECT 
                wholesale_product_id, 
                COUNT(*) AS workingCnt
            FROM products
            GROUP BY wholesale_product_id
        ) p
            ON wp.wholesale_product_id = p.wholesale_product_id
        ${condition}
        `;

        const totalCountResult = await db.query(countQuery, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        return {
            result: dataQuery,
            total: totalCountResult[0].total,
        };
    } catch (error) {
        console.error('Error executing getProducts query:', error);
        throw error;
    }
};

export const putWorkingProduct = async (data) => {
    const { productsUuid, productId, chargeParam } = data;

    // 트랜잭션 시작
    const t = await db.transaction();

    try {
        await db.query(
            `
            INSERT INTO selper.products
                (product_id, wholesale_product_id, create_user, create_dt, stage)
                VALUES(:productsUuid, :productId,'selper', CURRENT_TIMESTAMP, 'ST');
        `,
            {
                replacements: {
                    productsUuid,
                    productId,
                },
                type: Sequelize.QueryTypes.INSERT,
                transaction: t,
            }
        );

        t.commit();
    } catch (error) {
        t.rollback();
        console.error('Error executing putWorkingProduct query : ', error);
        throw error;
    }
};

export const postWorkingProductPrice = async (data) => {
    try {
    } catch (error) {
        console.error('Error executing putWorkingProductPrice query:', error);
    }
};

export const getSearchWordData = async (data) => {
    const { search, offset, limit } = data;

    try {
        let replacements = {};
        let condition = '';

        if (search) {
            condition += ` WHERE wp.product_name LIKE :productName`;
            replacements.productName = `%${search}%`;
        }
        replacements.offset = parseInt(offset, 10);
        replacements.limit = parseInt(limit, 10);

        let query = `
            SELECT 
                p.product_id AS workingProductId,
                p.wholesale_product_id AS productId,
                p.search_word AS searchWord,
                wp.wholesale_site_id AS siteId,
                wp.product_code AS productCode,
                wp.product_name AS productName,
                CONCAT(FORMAT(wp.product_price, 0), ' 원') AS productPrice,
                wp.detail_page_url AS detailPageUrl,
                wp.out_of_stock,
                wp.last_updated,
                wsi.site_name AS siteName
            FROM products p
            LEFT OUTER JOIN wholesale_product wp 
                ON wp.wholesale_product_id = p.wholesale_product_id
            left outer join wholesale_site_info wsi
                on wp.wholesale_site_id = wsi.wholesale_site_id  
            ${condition}
            ORDER BY 
                CASE 
                    WHEN p.search_word IS NOT NULL AND p.search_word != '' THEN 1
                    ELSE 0
                END ASC,
                wp.product_name asc
            LIMIT :limit OFFSET :offset
        `;

        const dataQuery = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        const countQuery = `
            SELECT COUNT(*) as total
            FROM products p
            LEFT OUTER JOIN wholesale_product wp 
                ON wp.wholesale_product_id = p.wholesale_product_id
            ${condition}
        `;

        const totalCountResult = await db.query(countQuery, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        return {
            searchResult: dataQuery,
            total: totalCountResult[0].total,
        };
    } catch (error) {
        console.error('Error occurred in getSearchWordData: ', error);
        throw error;
    }
};

export const getThumbNailData = async (productId) => {
    try {
        let query = `
            SELECT 
             thumbnail_id as thumbnailId, 
             wholesale_product_id as wholesaleProductId, 
             thumbnail_url as thumbNailUrl, 
             path as thumbnailPath
             FROM selper.wholesale_product_thumbnail
        `;

        let replacements = {};

        if (productId) {
            query += `where wholesale_product_id = :productId`;
            replacements.productId = `${productId}`;
        }
        const thumbNailData = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });
        return thumbNailData;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

export const postSearchWord = async (data) => {
    const t = await db.transaction();
    const { id, preValue, curValue } = data;

    try {
        const postQuery = `update products 
                    set search_word = :curValue,
                    stage = 'SW'
                    where product_id = :id`;
        let postReplacements = {};
        postReplacements.curValue = curValue;
        postReplacements.id = id;

        await db.query(postQuery, {
            replacements: postReplacements,
            type: Sequelize.QueryTypes.UPDATE,
            transaction: t,
        });

        const searchResult = await db.query(
            `
                select search_word from products where product_id = :id
            `,
            {
                replacements: {
                    id,
                },
                type: Sequelize.QueryTypes.SELECT,
                transaction: t,
            }
        );

        t.commit();

        return searchResult;
    } catch (error) {
        t.rollback();
        console.log('postSearchWord error executing query : ', error);
    }
};

export const getSearchWord = async (wholeSaleProductId) => {
    try {
        const searchWord = await db.query(
            `
                select search_word as searchWord 
                from products 
                where wholesale_product_id = :wholeSaleProductId
            `,
            {
                replacements: { wholeSaleProductId: `${wholeSaleProductId}` },
                type: Sequelize.QueryTypes.SELECT,
            }
        );
        return searchWord;
    } catch (error) {
        console.log('getSearchWord error executing query : ', error);
    }
};

export const getDetailImageData = async (productId) => {
    try {
        const dtlImgData = await db.query(
            `
            SELECT 
            dtl_img_id as dtlImgId, 
            wholesale_product_id as wholesaleProductId,
            dtl_img_url as dtlImgUrl,
            path as dtlImgPath
            FROM selper.wholesale_product_dtl_img
            where wholesale_product_id = :productId
            order by dtl_img_url asc
            `,
            {
                replacements: { productId: `${productId}` },
                type: Sequelize.QueryTypes.SELECT,
            }
        );
        return dtlImgData;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

export const getPlatformCharge = async () => {
    try {
        const platformChargeData = await db.query(
            `
                SELECT 
                platform_info_id as platformInfoId, 
	            platform_name as platformName, 
	            platform_url as platformUrl, 
	            platform_info as platformInfo,
	            charge_rate as chargeRate
                FROM selper.platform_info;
            `,
            {
                type: Sequelize.QueryTypes.SELECT,
            }
        );
        return platformChargeData;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const postPlatformPrice = async (data) => {
    const {
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
    } = data;
    const uuid = uuid4();
    /*INSERT INTO selper.platform_price
(platform_price_id, products_id, platform_id, price, margin_percent, margin_price, tax_percent, tax_price, create_dt, platform_percent, platform_price, discount_price, update_dt, update_user)
VALUES('', '', '', 0, 30, 0, 0, 0, CURRENT_TIMESTAMP, 0, 0, 0, CURRENT_TIMESTAMP, '');
    */

    try {
        let query = `
           INSERT INTO selper.platform_price
            (platform_price_id, 
            products_id, 
            platform_id, 
            price, 
            margin_percent, 
            margin_price, 
            tax_percent, 
            tax_price, 
            create_dt, 
            platform_percent, 
            platform_price,
            discount_price)
            VALUES(:uuid, :productsUuid, :platformId, :price, :targetProfitRatio, 
                    :margin_price, :taxRatio, :tax_price, CURRENT_TIMESTAMP, :feeRatio, :platForm_price, :discount_price)
        `;
        const replacements = {
            uuid,
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
        await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.INSERT,
        });
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const putAutoReco = async (data) => {
    const { id, productName, productTags, cateId, cateNam } = data;
    try {
        let query = `
           REPLACE INTO selper.auto_recommend
            (product_id, 
            reco_cate, 
            reco_productNm, 
            reco_keyword, 
            create_dt, 
            reco_cate_id, 
            reco_tag)
            VALUES(:id, :cateNam, :productName, '', CURRENT_TIMESTAMP, :cateId, :productTags);
        `;
        const replacements = {
            id,
            productName,
            productTags,
            cateId,
            cateNam,
        };
        await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.INSERT,
        });
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const getAutoReco = async (data) => {
    const { search, limit, offset, flag } = data;
    try {
        // 기본 쿼리 조립
        let query = [
            `SELECT 
                wp.wholesale_site_id AS siteId,
                wp.product_code AS productCode,
                wp.wholesale_product_id AS wholeProductId,
                wp.product_name AS wholeProductName,
                CONCAT(FORMAT(wp.product_price, 0), ' 원') AS wholeProductPrice,
                CONCAT(FORMAT(p.product_price, 0), ' 원') AS productPrice,
                wp.detail_page_url AS detailpageUrl,
                p.search_word AS searchWord,
                p.product_id AS productId,
                ar.reco_productNm AS recoProductNm,
                ar.reco_keyword AS recoKeyword,
                ar.reco_tag AS recoTag,
                recoCate.naver_recoCate,
                recoCate.B_recoCate,
                recoCate.C_recoCate,
                p.product_name AS productName,
                p.platform_tag AS platformTag,
                wsi.site_name AS siteName,
                wsi.site_url AS siteUrl,
                (SELECT COUNT(*) 
                 FROM auto_recommend ar
                 LEFT OUTER JOIN products p ON p.product_id = ar.product_id
                 LEFT OUTER JOIN wholesale_product wp ON wp.wholesale_product_id = p.wholesale_product_id
                ) AS total_count
             FROM auto_recommend ar
             LEFT OUTER JOIN products p ON p.product_id = ar.product_id
             LEFT OUTER JOIN wholesale_product wp ON wp.wholesale_product_id = p.wholesale_product_id
             LEFT OUTER JOIN wholesale_site_info wsi ON wp.wholesale_site_id = wsi.wholesale_site_id
             LEFT JOIN (
                SELECT 
                    product_id,
                    MAX(CASE WHEN platform_name = 'naver' THEN reco_cate END) AS naver_recoCate,
                    MAX(CASE WHEN platform_name = 'B' THEN reco_cate END) AS B_recoCate,
                    MAX(CASE WHEN platform_name = 'C' THEN reco_cate END) AS C_recoCate
                FROM auto_recommend
                GROUP BY product_id
             ) AS recoCate ON ar.product_id = recoCate.product_id`,
        ];

        // 조건부 쿼리문 추가
        const queryCondition = (flag) => {
            switch (flag) {
                case 'proName':
                    return `
                        ORDER BY 
                            CASE 
                                WHEN p.product_name IS NOT NULL AND p.product_name != '' THEN 1
                                ELSE 0
                            END ASC
                        LIMIT :limit OFFSET :offset
                    `;
                case 'tag':
                    return `
                        WHERE p.product_name IS NOT NULL
                        ORDER BY 
                            CASE 
                                WHEN p.platform_tag IS NOT NULL AND p.platform_tag != '' THEN 1
                                ELSE 0
                            END ASC
                        LIMIT :limit OFFSET :offset
                    `;
                case 'cate':
                    return `
                        WHERE p.product_name IS NOT NULL
                        AND p.platform_tag IS NOT NULL
                        ORDER BY wp.product_name ASC
                        LIMIT :limit OFFSET :offset
                    `;
                default:
                    return '';
            }
        };

        // 조건에 따른 쿼리문 추가
        const addQueryCondition = queryCondition(flag);
        if (addQueryCondition) {
            query.push(addQueryCondition); // 조건부 쿼리 추가
        }

        // 최종 쿼리 조립
        const finalQuery = query.join(' ');

        // 쿼리 실행
        const replacements = {
            limit,
            offset,
        };
        const result = await db.query(finalQuery, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        return result;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const putProductName = async (data) => {
    const { productId, productName } = data;

    try {
        let query = `
            UPDATE selper.products 
            SET product_name = :productName,
                update_dt = now(),
                stage = 'PN',
                update_user = 'selper'
            WHERE product_id = :productId
        `;

        const replacements = {
            productName,
            productId,
        };

        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.UPDATE,
        });

        // 리턴값 추가
        if (result > 0) {
            return { success: true, message: 'Product name updated successfully.' };
        } else {
            return { success: false, message: 'No product found with the given ID.' };
        }
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const getCateProduct = async (data) => {
    const { search = '', limit, offset, platformId } = data;
    try {
        let query = `
            SELECT 
                p.product_id AS workingProductId,
                p.wholesale_product_id AS wholesaleProductId,
                p.search_word AS searchWord,
                p.product_name AS productName,
                p.platform_tag AS platformTag,
                wp.wholesale_site_id AS siteId,
                wp.product_code AS productCode,
                CONCAT(FORMAT(wp.product_price, 0), ' 원') AS wholeProductPrice,
                wp.product_name AS wholeProductName,
                wp.detail_page_url AS detailPageUrl,
                wp.out_of_stock,
                wp.last_updated,
                wsi.site_name AS siteName,
                recoCate.naver_recoCate,
                recoCate.B_recoCate,
                recoCate.C_recoCate,
                recoCate.product_id AS recoProductId,
                GROUP_CONCAT(
                    IF(naver_cate.category_no1 IS NOT NULL AND naver_cate.category_no1 != '', naver_cate.category_no1, ''),
                    IF(naver_cate.category_no2 IS NOT NULL AND naver_cate.category_no2 != '', CONCAT(' > ', naver_cate.category_no2), ''),
                    IF(naver_cate.category_no3 IS NOT NULL AND naver_cate.category_no3 != '', CONCAT(' > ', naver_cate.category_no3), ''),
                    IF(naver_cate.category_no4 IS NOT NULL AND naver_cate.category_no4 != '', CONCAT(' > ', naver_cate.category_no4), ''),
                    IF(naver_cate.category_no5 IS NOT NULL AND naver_cate.category_no5 != '', CONCAT(' > ', naver_cate.category_no5), ''),
                    IF(naver_cate.category_no6 IS NOT NULL AND naver_cate.category_no6 != '', CONCAT(' > ', naver_cate.category_no6), '')
                ) AS naverCategory,
                GROUP_CONCAT(
                    IF(coupang_cate.category_no1 IS NOT NULL AND coupang_cate.category_no1 != '', coupang_cate.category_no1, ''),
                    IF(coupang_cate.category_no2 IS NOT NULL AND coupang_cate.category_no2 != '', CONCAT(' > ', coupang_cate.category_no2), ''),
                    IF(coupang_cate.category_no3 IS NOT NULL AND coupang_cate.category_no3 != '', CONCAT(' > ', coupang_cate.category_no3), ''),
                    IF(coupang_cate.category_no4 IS NOT NULL AND coupang_cate.category_no4 != '', CONCAT(' > ', coupang_cate.category_no4), ''),
                    IF(coupang_cate.category_no5 IS NOT NULL AND coupang_cate.category_no5 != '', CONCAT(' > ', coupang_cate.category_no5), ''),
                    IF(coupang_cate.category_no6 IS NOT NULL AND coupang_cate.category_no6 != '', CONCAT(' > ', coupang_cate.category_no6), '')
                ) AS coupangCategory,
                GROUP_CONCAT(
                    IF(gmarket_cate.category_no1 IS NOT NULL AND gmarket_cate.category_no1 != '', gmarket_cate.category_no1, ''),
                    IF(gmarket_cate.category_no2 IS NOT NULL AND gmarket_cate.category_no2 != '', CONCAT(' > ', gmarket_cate.category_no2), ''),
                    IF(gmarket_cate.category_no3 IS NOT NULL AND gmarket_cate.category_no3 != '', CONCAT(' > ', gmarket_cate.category_no3), ''),
                    IF(gmarket_cate.category_no4 IS NOT NULL AND gmarket_cate.category_no4 != '', CONCAT(' > ', gmarket_cate.category_no4), ''),
                    IF(gmarket_cate.category_no5 IS NOT NULL AND gmarket_cate.category_no5 != '', CONCAT(' > ', gmarket_cate.category_no5), ''),
                    IF(gmarket_cate.category_no6 IS NOT NULL AND gmarket_cate.category_no6 != '', CONCAT(' > ', gmarket_cate.category_no6), '')
                ) AS gmarketCategory,
                GROUP_CONCAT(
                    IF(elevenst_cate.category_no1 IS NOT NULL AND elevenst_cate.category_no1 != '', elevenst_cate.category_no1, ''),
                    IF(elevenst_cate.category_no2 IS NOT NULL AND elevenst_cate.category_no2 != '', CONCAT(' > ', elevenst_cate.category_no2), ''),
                    IF(elevenst_cate.category_no3 IS NOT NULL AND elevenst_cate.category_no3 != '', CONCAT(' > ', elevenst_cate.category_no3), ''),
                    IF(elevenst_cate.category_no4 IS NOT NULL AND elevenst_cate.category_no4 != '', CONCAT(' > ', elevenst_cate.category_no4), ''),
                    IF(elevenst_cate.category_no5 IS NOT NULL AND elevenst_cate.category_no5 != '', CONCAT(' > ', elevenst_cate.category_no5), ''),
                    IF(elevenst_cate.category_no6 IS NOT NULL AND elevenst_cate.category_no6 != '', CONCAT(' > ', elevenst_cate.category_no6), '')
                ) AS elevenstCategory   
            FROM products p
            LEFT OUTER JOIN wholesale_product wp 
                ON wp.wholesale_product_id = p.wholesale_product_id
            LEFT OUTER JOIN wholesale_site_info wsi
                ON wp.wholesale_site_id = wsi.wholesale_site_id
            LEFT JOIN (
                SELECT 
                    product_id,
                    MAX(CASE WHEN platform_name = 'naver' THEN reco_cate END) AS naver_recoCate,
                    MAX(CASE WHEN platform_name = 'B' THEN reco_cate END) AS B_recoCate,
                    MAX(CASE WHEN platform_name = 'C' THEN reco_cate END) AS C_recoCate
                FROM auto_recommend
                GROUP BY product_id
            ) AS recoCate ON p.product_id = recoCate.product_id
            LEFT OUTER JOIN processed_product_category ppc 
                ON ppc.product_id = p.product_id
            LEFT OUTER JOIN platform_category naver_cate
                ON ppc.naver_category_id = naver_cate.category_id
            LEFT OUTER JOIN platform_category coupang_cate
                ON ppc.coupang_category_id = coupang_cate.category_id
            LEFT OUTER JOIN platform_category gmarket_cate
                ON ppc.gmarket_category_id = gmarket_cate.category_id
            LEFT OUTER JOIN platform_category elevenst_cate
                ON ppc.elevenst_category_id = elevenst_cate.category_id 
            WHERE p.product_name IS NOT NULL 
                AND p.platform_tag IS NOT NULL
        `;

        if (search !== '') {
            query += ` AND p.product_name LIKE CONCAT('%', :search, '%')`;
        }

        query += ` GROUP BY p.product_id, wp.wholesale_site_id, wp.product_code, wp.product_price, wp.product_name, wp.detail_page_url, wp.out_of_stock, wp.last_updated, wsi.site_name, recoCate.naver_recoCate, recoCate.B_recoCate, recoCate.C_recoCate`;
        query += ` ORDER BY CASE WHEN recoProductId IS NOT NULL THEN 1 ELSE 0 END ASC`;
        query += ` LIMIT :limit OFFSET :offset`;

        const replacements = {
            search,
            limit,
            offset,
            platformId,
        };

        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        return result;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const putProductTag = async (data) => {
    const { productId, productTag } = data;

    try {
        let query = `
            UPDATE selper.products 
            SET platform_tag = :productTag,
                update_dt = now(),
                update_user = 'selper'
            WHERE product_id = :productId
        `;

        const replacements = {
            productTag,
            productId,
        };

        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.UPDATE,
        });
        // 리턴값 추가
        if (result > 0) {
            return { success: true, message: 'Product tag updated successfully.' };
        } else {
            return { success: false, message: 'No product found with the given ID.' };
        }
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const getCategory = async (data) => {
    const { categoryNo1, categoryNo2, categoryNo3, categoryNo4, categoryNo5, categoryNo6, platformId } = data;
    try {
        // 동적으로 WHERE 절 조건을 생성하는 배열
        const conditions = [];
        const categoryNos = [categoryNo1, categoryNo2, categoryNo3, categoryNo4, categoryNo5, categoryNo6];

        let query = `
            SELECT category_id, 
                   platform_id, 
                   category_num, 
                   category_no1, 
                   category_no2, 
                   category_no3, 
                   category_no4, 
                   category_no5, 
                   category_no6
            FROM selper.platform_category
            WHERE 1=1
        `;

        // 동적으로 조건 추가
        categoryNos.forEach((value, index) => {
            if (value) {
                conditions.push(` AND category_no${index + 1} = :categoryNo${index + 1}`);
            }
        });

        if (platformId === 'naver') {
            query += `
                AND platform_id = :platformId
            `;
        } else if (platformId === 'coupang') {
            query += `
                AND platform_id = :platformId
            `;
        } else if (platformId === 'elevenst') {
            query += `
                AND platform_id = :platformId
            `;
        } else if (platformId === 'gmarket') {
            query += `
                AND platform_id = :platformId
            `;
        } else {
            throw new Error('유효하지 않은 마켓 이름입니다.');
        }

        query += conditions.join('');

        const replacements = {
            categoryNo1,
            categoryNo2,
            categoryNo3,
            categoryNo4,
            categoryNo5,
            categoryNo6,
            platformId,
        };

        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        return result;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const postProcessCategory = async (data) => {
    const { productId, categoryId, platformId } = data;
    console.log('data', data);
    // 필수 파라미터 검증
    if (!productId || !categoryId) {
        throw new Error('필수 파라미터가 누락되었습니다.');
    }
    const uuid = uuid4();
    try {
        // 먼저 product_id가 존재하는지 확인
        let checkQuery = `
            SELECT pp_category_id 
            FROM selper.processed_product_category 
            WHERE product_id = :productId
        `;

        const existingRecord = await db.query(checkQuery, {
            replacements: { productId },
            type: Sequelize.QueryTypes.SELECT,
        });

        let query;
        let replacements;

        if (existingRecord && existingRecord.length > 0) {
            // 레코드가 존재하면 UPDATE 쿼리 실행
            query = `
                UPDATE selper.processed_product_category
                SET update_dt = CURRENT_TIMESTAMP,
                    update_user = 'selper'
            `;

            // platformId에 따라 업데이트할 컬럼 설정
            switch (platformId) {
                case 'naver':
                    query += `, naver_category_id = :categoryId`;
                    break;
                case 'coupang':
                    query += `, coupang_category_id = :categoryId`;
                    break;
                case 'elevenst':
                    query += `, elevenst_category_id = :categoryId`;
                    break;
                case 'gmarket':
                    query += `, gmarket_category_id = :categoryId`;
                    break;
                default:
                    throw new Error('유효하지 않은 마켓 이름입니다.');
            }

            query += ` WHERE product_id = :productId`;

            replacements = {
                productId,
                categoryId,
            };

            const result = await db.query(query, {
                replacements,
                type: Sequelize.QueryTypes.UPDATE,
            });

            return result;
        } else {
            // 레코드가 없으면 INSERT 쿼리 실행
            query = `
                INSERT INTO selper.processed_product_category
                (pp_category_id, product_id, create_dt, update_dt, update_user`;

            let values = `
                VALUES(:uuid, :productId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'selper'`;

            // platformId에 따라 컬럼과 값 설정
            switch (platformId) {
                case 'naver':
                    query += `, naver_category_id)`;
                    values += `, :categoryId)`;
                    break;
                case 'coupang':
                    query += `, coupang_category_id)`;
                    values += `, :categoryId)`;
                    break;
                case 'elevenst':
                    query += `, elevenst_category_id)`;
                    values += `, :categoryId)`;
                    break;
                case 'gmarket':
                    query += `, gmarket_category_id)`;
                    values += `, :categoryId)`;
                    break;
                default:
                    throw new Error('유효하지 않은 마켓 이름입니다.');
            }

            query += values;

            replacements = {
                uuid,
                productId,
                categoryId,
            };

            const result = await db.query(query, {
                replacements,
                type: Sequelize.QueryTypes.INSERT,
            });

            return result;
        }
    } catch (error) {
        console.error('카테고리 처리 중 오류 발생:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    const checkQuery = `
        SELECT 
                p.product_id AS workingProductId,
                p.wholesale_product_id AS wholesaleProductId,
                p.search_word AS searchWord,
                p.product_name AS productName,
                p.platform_tag AS platformTag,
                wp.wholesale_site_id AS siteId,
                wp.product_code AS productCode,
                CONCAT(FORMAT(wp.product_price, 0), ' 원') AS wholeProductPrice,
                wp.product_name AS wholeProductName,
                wp.detail_page_url AS detailPageUrl,
                wp.out_of_stock,
                wp.last_updated,
                wsi.site_name AS siteName,
                recoCate.naver_recoCate,
                recoCate.B_recoCate,
                recoCate.C_recoCate,
                GROUP_CONCAT(
                    IF(naver_cate.category_no1 IS NOT NULL AND naver_cate.category_no1 != '', naver_cate.category_no1, ''),
                    IF(naver_cate.category_no2 IS NOT NULL AND naver_cate.category_no2 != '', CONCAT(' > ', naver_cate.category_no2), ''),
                    IF(naver_cate.category_no3 IS NOT NULL AND naver_cate.category_no3 != '', CONCAT(' > ', naver_cate.category_no3), ''),
                    IF(naver_cate.category_no4 IS NOT NULL AND naver_cate.category_no4 != '', CONCAT(' > ', naver_cate.category_no4), ''),
                    IF(naver_cate.category_no5 IS NOT NULL AND naver_cate.category_no5 != '', CONCAT(' > ', naver_cate.category_no5), ''),
                    IF(naver_cate.category_no6 IS NOT NULL AND naver_cate.category_no6 != '', CONCAT(' > ', naver_cate.category_no6), '')
                ) AS naverCategory,
                GROUP_CONCAT(
                    IF(coupang_cate.category_no1 IS NOT NULL AND coupang_cate.category_no1 != '', coupang_cate.category_no1, ''),
                    IF(coupang_cate.category_no2 IS NOT NULL AND coupang_cate.category_no2 != '', CONCAT(' > ', coupang_cate.category_no2), ''),
                    IF(coupang_cate.category_no3 IS NOT NULL AND coupang_cate.category_no3 != '', CONCAT(' > ', coupang_cate.category_no3), ''),
                    IF(coupang_cate.category_no4 IS NOT NULL AND coupang_cate.category_no4 != '', CONCAT(' > ', coupang_cate.category_no4), ''),
                    IF(coupang_cate.category_no5 IS NOT NULL AND coupang_cate.category_no5 != '', CONCAT(' > ', coupang_cate.category_no5), ''),
                    IF(coupang_cate.category_no6 IS NOT NULL AND coupang_cate.category_no6 != '', CONCAT(' > ', coupang_cate.category_no6), '')
                ) AS coupangCategory,
                GROUP_CONCAT(
                    IF(gmarket_cate.category_no1 IS NOT NULL AND gmarket_cate.category_no1 != '', gmarket_cate.category_no1, ''),
                    IF(gmarket_cate.category_no2 IS NOT NULL AND gmarket_cate.category_no2 != '', CONCAT(' > ', gmarket_cate.category_no2), ''),
                    IF(gmarket_cate.category_no3 IS NOT NULL AND gmarket_cate.category_no3 != '', CONCAT(' > ', gmarket_cate.category_no3), ''),
                    IF(gmarket_cate.category_no4 IS NOT NULL AND gmarket_cate.category_no4 != '', CONCAT(' > ', gmarket_cate.category_no4), ''),
                    IF(gmarket_cate.category_no5 IS NOT NULL AND gmarket_cate.category_no5 != '', CONCAT(' > ', gmarket_cate.category_no5), ''),
                    IF(gmarket_cate.category_no6 IS NOT NULL AND gmarket_cate.category_no6 != '', CONCAT(' > ', gmarket_cate.category_no6), '')
                ) AS gmarketCategory,
                GROUP_CONCAT(
                    IF(elevenst_cate.category_no1 IS NOT NULL AND elevenst_cate.category_no1 != '', elevenst_cate.category_no1, ''),
                    IF(elevenst_cate.category_no2 IS NOT NULL AND elevenst_cate.category_no2 != '', CONCAT(' > ', elevenst_cate.category_no2), ''),
                    IF(elevenst_cate.category_no3 IS NOT NULL AND elevenst_cate.category_no3 != '', CONCAT(' > ', elevenst_cate.category_no3), ''),
                    IF(elevenst_cate.category_no4 IS NOT NULL AND elevenst_cate.category_no4 != '', CONCAT(' > ', elevenst_cate.category_no4), ''),
                    IF(elevenst_cate.category_no5 IS NOT NULL AND elevenst_cate.category_no5 != '', CONCAT(' > ', elevenst_cate.category_no5), ''),
                    IF(elevenst_cate.category_no6 IS NOT NULL AND elevenst_cate.category_no6 != '', CONCAT(' > ', elevenst_cate.category_no6), '')
                ) AS elevenstCategory   
            FROM products p
            LEFT OUTER JOIN wholesale_product wp 
                ON wp.wholesale_product_id = p.wholesale_product_id
            LEFT OUTER JOIN wholesale_site_info wsi
                ON wp.wholesale_site_id = wsi.wholesale_site_id
            LEFT JOIN (
                SELECT 
                    product_id,
                    MAX(CASE WHEN platform_name = 'naver' THEN reco_cate END) AS naver_recoCate,
                    MAX(CASE WHEN platform_name = 'B' THEN reco_cate END) AS B_recoCate,
                    MAX(CASE WHEN platform_name = 'C' THEN reco_cate END) AS C_recoCate
                FROM auto_recommend
                GROUP BY product_id
            ) AS recoCate ON p.product_id = recoCate.product_id
            LEFT OUTER JOIN processed_product_category ppc 
                ON ppc.product_id = p.product_id
            LEFT OUTER JOIN platform_category naver_cate
                ON ppc.naver_category_id = naver_cate.category_id
            LEFT OUTER JOIN platform_category coupang_cate
                ON ppc.coupang_category_id = coupang_cate.category_id
            LEFT OUTER JOIN platform_category gmarket_cate
                ON ppc.gmarket_category_id = gmarket_cate.category_id
            LEFT OUTER JOIN platform_category elevenst_cate
                ON ppc.elevenst_category_id = elevenst_cate.category_id 
            WHERE p.product_name IS NOT NULL 
                AND p.platform_tag IS NOT NULL
                AND p.product_id = :productId
    `;
    try {
        const result = await db.query(checkQuery, {
            replacements: { productId: id },
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const getProductPriceData = async (whereCondition, limit, offset) => {
    let checkQuery = `
        SELECT 
            p.product_id AS workingProductId,
            p.wholesale_product_id AS wholesaleProductId,
            p.search_word AS searchWord,
            p.product_name AS productName,
            p.platform_tag AS platformTag,
            wp.wholesale_site_id AS siteId,
            wp.product_code AS productCode,
            CONCAT(FORMAT(wp.product_price, 0), ' 원') AS wholeProductPrice,
            wp.product_name AS wholeProductName,
            wp.detail_page_url AS detailPageUrl,
            wp.out_of_stock,
            wp.last_updated,
            wsi.site_name AS siteName,
            recoCate.naver_recoCate,
            recoCate.B_recoCate,
            recoCate.C_recoCate,
            (
                SELECT COUNT(*)
                FROM products p_inner
                LEFT OUTER JOIN processed_product_category ppc_inner ON p_inner.product_id = ppc_inner.product_id
                LEFT OUTER JOIN platform_category naver_cate_inner ON ppc_inner.naver_category_id = naver_cate_inner.category_id
                LEFT OUTER JOIN platform_category coupang_cate_inner ON ppc_inner.coupang_category_id = coupang_cate_inner.category_id
                LEFT OUTER JOIN platform_category gmarket_cate_inner ON ppc_inner.gmarket_category_id = gmarket_cate_inner.category_id
                LEFT OUTER JOIN platform_category elevenst_cate_inner ON ppc_inner.elevenst_category_id = elevenst_cate_inner.category_id
                WHERE p_inner.product_name IS NOT NULL 
                    AND p_inner.platform_tag IS NOT NULL
                    AND (
                        naver_cate_inner.category_no1 IS NOT NULL 
                        OR coupang_cate_inner.category_no1 IS NOT NULL 
                        OR gmarket_cate_inner.category_no1 IS NOT NULL 
                        OR elevenst_cate_inner.category_no1 IS NOT NULL
                    )
            ) AS total_count,
            GROUP_CONCAT(
                IF(naver_cate.category_no1 IS NOT NULL AND naver_cate.category_no1 != '', naver_cate.category_no1, ''),
                IF(naver_cate.category_no2 IS NOT NULL AND naver_cate.category_no2 != '', CONCAT(' > ', naver_cate.category_no2), ''),
                IF(naver_cate.category_no3 IS NOT NULL AND naver_cate.category_no3 != '', CONCAT(' > ', naver_cate.category_no3), ''),
                IF(naver_cate.category_no4 IS NOT NULL AND naver_cate.category_no4 != '', CONCAT(' > ', naver_cate.category_no4), ''),
                IF(naver_cate.category_no5 IS NOT NULL AND naver_cate.category_no5 != '', CONCAT(' > ', naver_cate.category_no5), ''),
                IF(naver_cate.category_no6 IS NOT NULL AND naver_cate.category_no6 != '', CONCAT(' > ', naver_cate.category_no6), '')
            ) AS naverCategory,
            GROUP_CONCAT(
                IF(coupang_cate.category_no1 IS NOT NULL AND coupang_cate.category_no1 != '', coupang_cate.category_no1, ''),
                IF(coupang_cate.category_no2 IS NOT NULL AND coupang_cate.category_no2 != '', CONCAT(' > ', coupang_cate.category_no2), ''),
                IF(coupang_cate.category_no3 IS NOT NULL AND coupang_cate.category_no3 != '', CONCAT(' > ', coupang_cate.category_no3), ''),
                IF(coupang_cate.category_no4 IS NOT NULL AND coupang_cate.category_no4 != '', CONCAT(' > ', coupang_cate.category_no4), ''),
                IF(coupang_cate.category_no5 IS NOT NULL AND coupang_cate.category_no5 != '', CONCAT(' > ', coupang_cate.category_no5), ''),
                IF(coupang_cate.category_no6 IS NOT NULL AND coupang_cate.category_no6 != '', CONCAT(' > ', coupang_cate.category_no6), '')
            ) AS coupangCategory,
            GROUP_CONCAT(
                IF(gmarket_cate.category_no1 IS NOT NULL AND gmarket_cate.category_no1 != '', gmarket_cate.category_no1, ''),
                IF(gmarket_cate.category_no2 IS NOT NULL AND gmarket_cate.category_no2 != '', CONCAT(' > ', gmarket_cate.category_no2), ''),
                IF(gmarket_cate.category_no3 IS NOT NULL AND gmarket_cate.category_no3 != '', CONCAT(' > ', gmarket_cate.category_no3), ''),
                IF(gmarket_cate.category_no4 IS NOT NULL AND gmarket_cate.category_no4 != '', CONCAT(' > ', gmarket_cate.category_no4), ''),
                IF(gmarket_cate.category_no5 IS NOT NULL AND gmarket_cate.category_no5 != '', CONCAT(' > ', gmarket_cate.category_no5), ''),
                IF(gmarket_cate.category_no6 IS NOT NULL AND gmarket_cate.category_no6 != '', CONCAT(' > ', gmarket_cate.category_no6), '')
            ) AS gmarketCategory,
            GROUP_CONCAT(
                IF(elevenst_cate.category_no1 IS NOT NULL AND elevenst_cate.category_no1 != '', elevenst_cate.category_no1, ''),
                IF(elevenst_cate.category_no2 IS NOT NULL AND elevenst_cate.category_no2 != '', CONCAT(' > ', elevenst_cate.category_no2), ''),
                IF(elevenst_cate.category_no3 IS NOT NULL AND elevenst_cate.category_no3 != '', CONCAT(' > ', elevenst_cate.category_no3), ''),
                IF(elevenst_cate.category_no4 IS NOT NULL AND elevenst_cate.category_no4 != '', CONCAT(' > ', elevenst_cate.category_no4), ''),
                IF(elevenst_cate.category_no5 IS NOT NULL AND elevenst_cate.category_no5 != '', CONCAT(' > ', elevenst_cate.category_no5), ''),
                IF(elevenst_cate.category_no6 IS NOT NULL AND elevenst_cate.category_no6 != '', CONCAT(' > ', elevenst_cate.category_no6), '')
            ) AS elevenstCategory
        FROM products p
        LEFT OUTER JOIN wholesale_product wp ON wp.wholesale_product_id = p.wholesale_product_id
        LEFT OUTER JOIN wholesale_site_info wsi ON wp.wholesale_site_id = wsi.wholesale_site_id
        LEFT JOIN (
            SELECT 
                product_id,
                MAX(CASE WHEN platform_name = 'naver' THEN reco_cate END) AS naver_recoCate,
                MAX(CASE WHEN platform_name = 'B' THEN reco_cate END) AS B_recoCate,
                MAX(CASE WHEN platform_name = 'C' THEN reco_cate END) AS C_recoCate
            FROM auto_recommend
            GROUP BY product_id
        ) AS recoCate ON p.product_id = recoCate.product_id
        LEFT OUTER JOIN processed_product_category ppc ON ppc.product_id = p.product_id
        LEFT OUTER JOIN platform_category naver_cate ON ppc.naver_category_id = naver_cate.category_id
        LEFT OUTER JOIN platform_category coupang_cate ON ppc.coupang_category_id = coupang_cate.category_id
        LEFT OUTER JOIN platform_category gmarket_cate ON ppc.gmarket_category_id = gmarket_cate.category_id
        LEFT OUTER JOIN platform_category elevenst_cate ON ppc.elevenst_category_id = elevenst_cate.category_id 
        WHERE p.product_name IS NOT NULL 
            AND p.platform_tag IS NOT NULL
        GROUP BY p.product_id
        HAVING 
            naverCategory IS NOT NULL OR 
            coupangCategory IS NOT NULL OR 
            gmarketCategory IS NOT NULL OR 
            elevenstCategory IS NOT NULL
    `;
    let replacements = {};

    if (whereCondition.productName) {
        checkQuery += ` AND p.product_name = :search`;
        replacements.search = whereCondition.productName;
    }
    if (whereCondition.productId) {
        checkQuery += ` AND p.product_id = :productId`;
        replacements.productId = whereCondition.productId;
    }
    checkQuery += ` LIMIT :limit OFFSET :offset`;
    replacements.limit = limit;
    replacements.offset = offset;

    try {
        const result = await db.query(checkQuery, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

export const getPlatformPriceById = async (productId) => {
    try {
        const query = `
            SELECT 
                pp.platform_price_id as platformPriceId, 
                pp.products_id as productsId, 
                pp.platform_id as platformId, 
                wp.product_price as wholesaleProductPrice,
                pp.price as salePrice, 
                pp.discount_price as discountPrice, 
                pp.margin_percent as marginPercent,
                pp.margin_price as marginPrice,
                pp.tax_percent as taxPercent,
                pp.tax_price as taxPrice,
                pp.platform_percent as platformPercent,
                pp.platform_price as platformPrice  
            FROM platform_price pp
            LEFT OUTER JOIN products p ON p.product_id = pp.products_id
            LEFT OUTER JOIN wholesale_product wp ON wp.wholesale_product_id = p.wholesale_product_id
            WHERE pp.products_id = :productId
        `;

        const result = await db.query(query, {
            replacements: { productId },
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getPlatformPriceById query:', error);
        throw error;
    }
};

export const putPlatformPrice = async (data) => {
    const {
        platformPriceId,
        platformId,
        salePrice,
        discountPrice,
        marginPercent,
        marginPrice,
        taxPercent,
        taxPrice,
        platformPercent,
        platformPrice,
    } = data[0];
    const replacements = {
        platformPriceId: platformPriceId,
        platformId: platformId,
        salePrice: salePrice,
        discountPrice: discountPrice,
        marginPercent: marginPercent / 100,
        marginPrice: marginPrice,
        taxPercent: taxPercent / 100,
        taxPrice: taxPrice,
        platformPercent: platformPercent / 100,
        platformPrice: platformPrice,
    };
    const query = `
        UPDATE platform_price
        SET price = :salePrice,
            discount_price = :discountPrice,
            margin_percent = :marginPercent,
            margin_price = :marginPrice,
            tax_percent = :taxPercent,
            tax_price = :taxPrice,
            platform_percent = :platformPercent,
            platform_price = :platformPrice,
            update_dt = CURRENT_TIMESTAMP
        WHERE platform_price_id = :platformPriceId
    `;
    try {
        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.UPDATE,
        });
        return result;
    } catch (error) {
        console.error('Error executing putPlatformPrice query:', error);
        throw error;
    }
};

export const putProductPrice = async (data) => {
    const { productsId, salePrice, discountPrice } = data[0];
    const replacements = {
        productId: productsId,
        price: salePrice,
        discountPrice: discountPrice,
    };
    const query = `
        UPDATE products
        SET product_price = :price,
            discount_charge = :discountPrice,
            update_dt = CURRENT_TIMESTAMP
        WHERE product_id = :productId
    `;
    try {
        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.UPDATE,
        });
        return result;
    } catch (error) {
        console.error('Error executing putProductPrice query:', error);
        throw error;
    }
};

export const getProductAttributeData = async (whereCondition, limit, offset) => {
    let replacements = {};
    let query = `
        SELECT 
            p.product_id AS workingProductId,
            p.wholesale_product_id AS wholesaleProductId,
            p.search_word AS searchWord,
            p.product_name AS productName,
            p.platform_tag AS platformTag,
            p.product_price as productPrice,
            wp.wholesale_site_id AS siteId,
            wp.product_code AS productCode,
            CONCAT(FORMAT(wp.product_price, 0), ' 원') AS wholeProductPrice,
            wp.product_name AS wholeProductName,
            wp.detail_page_url AS detailPageUrl,
            wp.out_of_stock,
            wp.last_updated,
            wsi.site_name AS siteName,
            recoCate.naver_recoCate,
            recoCate.naver_recoCate_id,
            recoCate.B_recoCate,
            recoCate.B_recoCate_id,
            recoCate.C_recoCate,
            recoCate.C_recoCate_id,
            (
                SELECT COUNT(*)
                FROM products p_inner
                LEFT OUTER JOIN processed_product_category ppc_inner ON p_inner.product_id = ppc_inner.product_id
                LEFT OUTER JOIN platform_category naver_cate_inner ON ppc_inner.naver_category_id = naver_cate_inner.category_id
                LEFT OUTER JOIN platform_category coupang_cate_inner ON ppc_inner.coupang_category_id = coupang_cate_inner.category_id
                LEFT OUTER JOIN platform_category gmarket_cate_inner ON ppc_inner.gmarket_category_id = gmarket_cate_inner.category_id
                LEFT OUTER JOIN platform_category elevenst_cate_inner ON ppc_inner.elevenst_category_id = elevenst_cate_inner.category_id
                WHERE p_inner.product_name IS NOT NULL 
                    AND p_inner.platform_tag IS NOT NULL
                    AND (
                        naver_cate_inner.category_no1 IS NOT NULL 
                        OR coupang_cate_inner.category_no1 IS NOT NULL 
                        OR gmarket_cate_inner.category_no1 IS NOT NULL 
                        OR elevenst_cate_inner.category_no1 IS NOT NULL
                    )
            ) AS total_count,
            GROUP_CONCAT(
                IF(naver_cate.category_no1 IS NOT NULL AND naver_cate.category_no1 != '', naver_cate.category_no1, ''),
                IF(naver_cate.category_no2 IS NOT NULL AND naver_cate.category_no2 != '', CONCAT(' > ', naver_cate.category_no2), ''),
                IF(naver_cate.category_no3 IS NOT NULL AND naver_cate.category_no3 != '', CONCAT(' > ', naver_cate.category_no3), ''),
                IF(naver_cate.category_no4 IS NOT NULL AND naver_cate.category_no4 != '', CONCAT(' > ', naver_cate.category_no4), ''),
                IF(naver_cate.category_no5 IS NOT NULL AND naver_cate.category_no5 != '', CONCAT(' > ', naver_cate.category_no5), ''),
                IF(naver_cate.category_no6 IS NOT NULL AND naver_cate.category_no6 != '', CONCAT(' > ', naver_cate.category_no6), '')
            ) AS naverCategory,
            GROUP_CONCAT(
                IF(coupang_cate.category_no1 IS NOT NULL AND coupang_cate.category_no1 != '', coupang_cate.category_no1, ''),
                IF(coupang_cate.category_no2 IS NOT NULL AND coupang_cate.category_no2 != '', CONCAT(' > ', coupang_cate.category_no2), ''),
                IF(coupang_cate.category_no3 IS NOT NULL AND coupang_cate.category_no3 != '', CONCAT(' > ', coupang_cate.category_no3), ''),
                IF(coupang_cate.category_no4 IS NOT NULL AND coupang_cate.category_no4 != '', CONCAT(' > ', coupang_cate.category_no4), ''),
                IF(coupang_cate.category_no5 IS NOT NULL AND coupang_cate.category_no5 != '', CONCAT(' > ', coupang_cate.category_no5), ''),
                IF(coupang_cate.category_no6 IS NOT NULL AND coupang_cate.category_no6 != '', CONCAT(' > ', coupang_cate.category_no6), '')
            ) AS coupangCategory,
            GROUP_CONCAT(
                IF(gmarket_cate.category_no1 IS NOT NULL AND gmarket_cate.category_no1 != '', gmarket_cate.category_no1, ''),
                IF(gmarket_cate.category_no2 IS NOT NULL AND gmarket_cate.category_no2 != '', CONCAT(' > ', gmarket_cate.category_no2), ''),
                IF(gmarket_cate.category_no3 IS NOT NULL AND gmarket_cate.category_no3 != '', CONCAT(' > ', gmarket_cate.category_no3), ''),
                IF(gmarket_cate.category_no4 IS NOT NULL AND gmarket_cate.category_no4 != '', CONCAT(' > ', gmarket_cate.category_no4), ''),
                IF(gmarket_cate.category_no5 IS NOT NULL AND gmarket_cate.category_no5 != '', CONCAT(' > ', gmarket_cate.category_no5), ''),
                IF(gmarket_cate.category_no6 IS NOT NULL AND gmarket_cate.category_no6 != '', CONCAT(' > ', gmarket_cate.category_no6), '')
            ) AS gmarketCategory,
            GROUP_CONCAT(
                IF(elevenst_cate.category_no1 IS NOT NULL AND elevenst_cate.category_no1 != '', elevenst_cate.category_no1, ''),
                IF(elevenst_cate.category_no2 IS NOT NULL AND elevenst_cate.category_no2 != '', CONCAT(' > ', elevenst_cate.category_no2), ''),
                IF(elevenst_cate.category_no3 IS NOT NULL AND elevenst_cate.category_no3 != '', CONCAT(' > ', elevenst_cate.category_no3), ''),
                IF(elevenst_cate.category_no4 IS NOT NULL AND elevenst_cate.category_no4 != '', CONCAT(' > ', elevenst_cate.category_no4), ''),
                IF(elevenst_cate.category_no5 IS NOT NULL AND elevenst_cate.category_no5 != '', CONCAT(' > ', elevenst_cate.category_no5), ''),
                IF(elevenst_cate.category_no6 IS NOT NULL AND elevenst_cate.category_no6 != '', CONCAT(' > ', elevenst_cate.category_no6), '')
            ) AS elevenstCategory
        FROM products p
        LEFT OUTER JOIN wholesale_product wp ON wp.wholesale_product_id = p.wholesale_product_id
        LEFT OUTER JOIN wholesale_site_info wsi ON wp.wholesale_site_id = wsi.wholesale_site_id
        LEFT JOIN (
            SELECT 
                product_id,
                MAX(CASE WHEN platform_name = 'naver' THEN reco_cate END) AS naver_recoCate,
                MAX(CASE WHEN platform_name = 'naver' THEN reco_cate_id END) AS naver_recoCate_id,
                MAX(CASE WHEN platform_name = 'B' THEN reco_cate END) AS B_recoCate,
                MAX(CASE WHEN platform_name = 'B' THEN reco_cate_id END) AS B_recoCate_id,
                MAX(CASE WHEN platform_name = 'C' THEN reco_cate END) AS C_recoCate,
                MAX(CASE WHEN platform_name = 'C' THEN reco_cate_id END) AS C_recoCate_id
            FROM auto_recommend
            GROUP BY product_id
        ) AS recoCate ON p.product_id = recoCate.product_id
        LEFT OUTER JOIN processed_product_category ppc ON ppc.product_id = p.product_id
        LEFT OUTER JOIN platform_category naver_cate ON ppc.naver_category_id = naver_cate.category_id
        LEFT OUTER JOIN platform_category coupang_cate ON ppc.coupang_category_id = coupang_cate.category_id
        LEFT OUTER JOIN platform_category gmarket_cate ON ppc.gmarket_category_id = gmarket_cate.category_id
        LEFT OUTER JOIN platform_category elevenst_cate ON ppc.elevenst_category_id = elevenst_cate.category_id 
        WHERE p.product_name IS NOT NULL 
            AND p.platform_tag IS NOT null
            AND p.product_price IS NOT NULL
        GROUP BY p.product_id
        HAVING 
            naverCategory IS NOT NULL OR 
            coupangCategory IS NOT NULL OR 
            gmarketCategory IS NOT NULL OR 
            elevenstCategory IS NOT NULL
    `;
    if (whereCondition.productId) {
        query += ` AND p.product_id = :productId`;
        replacements.productId = whereCondition.productId;
    }
    if (whereCondition.productName) {
        query += ` AND p.product_name = :search`;
        replacements.search = whereCondition.productName;
    }

    query += ` LIMIT :limit OFFSET :offset`;
    replacements.limit = limit;
    replacements.offset = offset;

    try {
        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getProductPrice query:', error);
        throw error;
    }
};

export const getProductDetailImage = async (wholesaleProductId) => {
    const query = `
        SELECT
            dtl_img_id as detailImageId,
            wholesale_product_id as wholesaleProductId,
            dtl_img_url as detailImageUrl,
            path as path
        FROM wholesale_product_dtl_img
        WHERE wholesale_product_id = :wholesaleProductId
    `;
    try {
        const result = await db.query(query, {
            replacements: { wholesaleProductId },
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getProductDetailImage query:', error);
        throw error;
    }
};

export const getProductOption = async (whereCondition, limit, offset) => {
    let replacements = {
        limit: limit,
        offset: offset,
    };
    let query = `
        select distinct  
            p.product_id as productId, 
            p.wholesale_product_id as wholesaleProductId,
            p.product_name as productName, 
            p.product_price as productPrice,
            p.discount_charge as discountCharge,
            wp.detail_page_url as detailPageUrl 
        from products p
        left outer join wholesale_product_options wpo 
        on p.wholesale_product_id = wpo.wholesale_product_id 
        left outer join wholesale_product wp 
        on p.wholesale_product_id = wp.wholesale_product_id 
        where 1 = 1 and 
        p.product_price is not null
        and p.product_name is not null
        and wpo.option_id is not null
    `;

    if (whereCondition.productId) {
        query += ` AND p.product_id = :productId`;
        replacements.productId = whereCondition.productId;
    }

    query += ` LIMIT :limit OFFSET :offset`;

    const optionProductQuery = `
        SELECT 
            wpo.option_id as optionId, 
            wpo.option_name as optionName,
            wpo.option_value as optionValue,
            wpo.option_price as optionPrice,
            wpo.option_stock as optionStock,
            wpo.wholesale_product_id as wholesaleProductId
        FROM wholesale_product_options wpo
        WHERE wpo.wholesale_product_id = :wholesaleProductId
    `;

    try {
        const getProductOptionResult = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });
        getProductOptionResult.forEach(async (product) => {
            const getOptionProductResult = await db.query(optionProductQuery, {
                replacements: { wholesaleProductId: product.wholesaleProductId },
                type: Sequelize.QueryTypes.SELECT,
            });
            product.optionProduct = getOptionProductResult;
        });
        return getProductOptionResult;
    } catch (error) {
        console.error('Error executing getProductOption query:', error);
        throw error;
    }
};

export const getOptionSettings = async (optionSettings) => {
    const { productsId, wholesaleProductId, platform, createUser } = optionSettings;
    const replacements = {
        productsId: productsId,
        wholesaleProductId: wholesaleProductId,
        platform: platform,
        createUser: createUser,
    };
    const query = `
        SELECT 
            products_id as productsId,
            option_type as optionType,
            platform as platform,
            option_name as optionName,
            option_value as optionValue,
            option_price as optionPrice,
            option_stock as optionStock,
            create_user as createUser,
            create_dt as createDt,
            wholesale_product_id as wholesaleProductId
        FROM selper.platform_product_options
        WHERE products_id = :productsId
        AND wholesale_product_id = :wholesaleProductId
        AND platform = :platform
        AND create_user = :createUser
    `;
    try {
        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getOptionSettings query:', error);
        throw error;
    }
};

export const postOptionSettings = async (optionSettingsArray) => {
    const t = await db.transaction();

    try {
        // 기존 데이터 삭제
        const deleteQuery = `
            DELETE FROM selper.platform_product_options
            WHERE products_id = :productsId
            AND wholesale_product_id = :wholesaleProductId
            AND platform = :platform
        `;

        await db.query(deleteQuery, {
            replacements: {
                productsId: optionSettingsArray[0].productsId,
                wholesaleProductId: optionSettingsArray[0].wholesaleProductId,
                platform: optionSettingsArray[0].platform,
            },
            type: Sequelize.QueryTypes.DELETE,
            transaction: t,
        });

        // 새로운 데이터 일괄 삽입
        const insertQuery = `
            INSERT INTO selper.platform_product_options
            (
                option_id,
                products_id,
                wholesale_product_id,
                option_type,
                platform,
                option_name,
                option_value,
                option_price,
                option_stock,
                create_user,
                create_dt
            )
            VALUES
            (
                :optionId,
                :productsId,
                :wholesaleProductId,
                :optionType,
                :platform,
                :optionName,
                :optionValue,
                :optionPrice,
                :optionStock,
                :createUser,
                CURRENT_TIMESTAMP
            )
        `;

        for (const optionSetting of optionSettingsArray) {
            await db.query(insertQuery, {
                replacements: optionSetting,
                type: Sequelize.QueryTypes.INSERT,
                transaction: t,
            });
        }

        await t.commit();
        return { success: true, message: '옵션 설정이 성공적으로 저장되었습니다.' };
    } catch (error) {
        await t.rollback();
        console.error('Error executing postOptionSettings query:', error);
        throw error;
    }
};

export const putProductStage = async (productStage) => {
    const { productId, stage } = productStage;
    const replacements = {
        productId: productId,
        stage: stage,
    };
    const query = `
        UPDATE products
        SET stage = :stage
        WHERE product_id = :productId
    `;
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.UPDATE });
        return result;
    } catch (error) {
        console.error('Error executing putProductStage query:', error);
        throw error;
    }
};

export const getDeliveryCompanies = async () => {
    const query = `
        SELECT 
            delivery_info_id as deliveryInfoId,
            delivery_company_name as deliveryCompanyName,
            delivery_company_code as deliveryCompanyCode
        FROM delivery_company_info
    `;
    try {
        const result = await db.query(query, { type: Sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error executing getDeliveryCompanies query:', error);
        throw error;
    }
};

export const getNaverProductPoint = async (productsId) => {
    const query = `
        select 
            point_id as pointId,
            product_id as productId,
            text_review_point as reviewPointText,
            video_review_point as reviewPointPhoto,
            month_text_review_point as reviewPointTextMonth,
            month_video_review_point as reviewPointPhotoMonth
        from naver_point_info
        where product_id = :productsId
    `;
    try {
        const result = await db.query(query, {
            replacements: { productsId },
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getNaverProductPoint query:', error);
        throw error;
    }
};

export const postNaverProductPoint = async (naverProductPoint) => {
    const { productsId, reviewPointText, reviewPointPhoto, reviewPointTextMonth, reviewPointPhotoMonth } =
        naverProductPoint;
    const replacements = {
        productsId: productsId,
        reviewPointText: reviewPointText,
        reviewPointPhoto: reviewPointPhoto,
        reviewPointTextMonth: reviewPointTextMonth,
        reviewPointPhotoMonth: reviewPointPhotoMonth,
    };
    const query = `
    INSERT INTO selper.naver_point_info
        (point_id, product_id, text_review_point, video_review_point, month_text_review_point, month_video_review_point)
        VALUES(uuid(), :productsId, :reviewPointText, :reviewPointPhoto, :reviewPointTextMonth, :reviewPointPhotoMonth)
    `;
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.INSERT });
        return result;
    } catch (error) {
        console.error('Error executing postNaverProductPoint query:', error);
        throw error;
    }
};

export const putNaverProductPoint = async (naverProductPoint) => {
    const { productsId, reviewPointText, reviewPointPhoto, reviewPointTextMonth, reviewPointPhotoMonth } =
        naverProductPoint;
    const replacements = {
        productsId: productsId,
        reviewPointText: reviewPointText,
        reviewPointPhoto: reviewPointPhoto,
        reviewPointTextMonth: reviewPointTextMonth,
        reviewPointPhotoMonth: reviewPointPhotoMonth,
    };
    const query = `
        UPDATE naver_point_info
        SET text_review_point = :reviewPointText, video_review_point = :reviewPointPhoto, month_text_review_point = :reviewPointTextMonth, month_video_review_point = :reviewPointPhotoMonth
        WHERE product_id = :productsId
    `;
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.UPDATE });
        return result;
    } catch (error) {
        console.error('Error executing putNaverProductPoint query:', error);
        throw error;
    }
};

export const postWholesaleProductAttribute = async (wholesaleProductAttribute) => {
    try {
        const {
            wholesaleProductId,
            certificationList = [],
            selectedAttributes = [],
            originArea = {},
        } = wholesaleProductAttribute || {};

        // wholesaleProductId 체크
        if (!wholesaleProductId) {
            throw new Error('wholesaleProductId는 필수 값입니다.');
        }

        const modifiedAttributes = [
            // 원산지 정보 - originArea가 존재하고 필수값이 있는 경우만 추가
            ...(originArea?.originNation && originArea?.originArea
                ? [
                      {
                          attributeId: uuid4(),
                          wholesaleProductId,
                          attributeType: '원산지',
                          attributeTypeCode: 'AREA',
                          attributeGroupCode: '04',
                          attributeGroupValue: '기타-직접 입력',
                          attributeCode: originArea.originNation,
                          attributeValue: originArea.originArea,
                          platformId: 'naver',
                      },
                  ]
                : []),

            // 인증 정보 - certificationList가 존재하고 배열인 경우만 매핑
            ...(Array.isArray(certificationList) && certificationList.length > 0
                ? certificationList
                      .filter((cert) => cert.certInfo && cert.certInfoName && cert.agency && cert.number)
                      .map((certification) => ({
                          attributeId: uuid4(),
                          wholesaleProductId,
                          attributeType: '인증',
                          attributeTypeCode: 'CERTI',
                          attributeGroupCode: certification.certInfo,
                          attributeGroupValue: certification.certInfoName,
                          attributeCode: certification.agency,
                          attributeValue: certification.number,
                          platformId: 'naver',
                      }))
                : []),

            // 상품 속성 - selectedAttributes가 존재하고 배열인 경우만 매핑
            ...(Array.isArray(selectedAttributes) && selectedAttributes.length > 0
                ? selectedAttributes
                      .filter(
                          (attr) =>
                              attr.attributeSeq &&
                              attr.attributeName &&
                              attr.attributeValueSeq &&
                              attr.minAttributeValue
                      )
                      .map((selectedAttribute) => ({
                          attributeId: uuid4(),
                          wholesaleProductId,
                          attributeType: '상품속성',
                          attributeTypeCode: 'PROATT',
                          attributeGroupCode: selectedAttribute.attributeSeq,
                          attributeGroupValue: selectedAttribute.attributeName,
                          attributeCode: selectedAttribute.attributeValueSeq,
                          attributeValue: selectedAttribute.minAttributeValue,
                          platformId: 'naver',
                      }))
                : []),
        ];

        const t = await db.transaction();

        try {
            const validAttributes = modifiedAttributes.filter(
                (attr) =>
                    attr.attributeId &&
                    attr.wholesaleProductId &&
                    attr.attributeType &&
                    attr.attributeTypeCode &&
                    attr.attributeGroupCode &&
                    attr.attributeGroupValue &&
                    attr.attributeCode &&
                    attr.attributeValue &&
                    attr.platformId
            );

            console.log('Valid attributes after filtering:', validAttributes);

            if (validAttributes.length > 0) {
                const insertQuery = `
                    INSERT INTO wholesesale_product_attribute (
                        attribute_id,
                        wholesale_product_id,
                        attribute_type,
                        attribute_type_code,
                        attribute_group_code,
                        attribute_group_value,
                        attribute_code,
                        attribute_value,
                        platform_id
                    ) VALUES (
                        :attributeId,
                        :wholesaleProductId,
                        :attributeType,
                        :attributeTypeCode,
                        :attributeGroupCode,
                        :attributeGroupValue,
                        :attributeCode,
                        :attributeValue,
                        :platformId
                    )
                `;

                for (const attribute of validAttributes) {
                    try {
                        await db.query(insertQuery, {
                            replacements: attribute,
                            type: Sequelize.QueryTypes.INSERT,
                            transaction: t,
                        });
                    } catch (insertError) {
                        console.error('Error during insert:', insertError);
                        throw insertError;
                    }
                }

                await t.commit();
                return {
                    success: true,
                    message: `상품 상세 정보가 성공적으로 저장되었습니다. (${validAttributes.length}건)`,
                    processedCount: validAttributes.length,
                };
            } else {
                await t.commit();
                return {
                    success: true,
                    message: '저장할 유효한 데이터가 없습니다.',
                    processedCount: 0,
                };
            }
        } catch (error) {
            console.error('Transaction error:', error);
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Overall function error:', error);
        throw error;
    }
};

export const getProductAttribute = async (wholesaleProductId, platformId) => {
    try {
        let query = `
            SELECT 
                attribute_id as attributeId,
                wholesale_product_id as wholesaleProductId,
                attribute_type as attributeType,
                attribute_type_code as attributeTypeCode,
                attribute_group_code as attributeGroupCode,
                attribute_group_value as attributeGroupValue,
                attribute_code as attributeCode,
                attribute_value as attributeValue,
                platform_id as platformId
            FROM wholesesale_product_attribute WHERE wholesale_product_id = :wholesaleProductId
        `;

        if (platformId) {
            query += ` AND platform_id = :platformId`;
        }

        const result = await db.query(query, {
            replacements: { wholesaleProductId, platformId },
            type: Sequelize.QueryTypes.SELECT,
        });
        const certificationList = [];
        const selectedAttributes = [];
        const originArea = [];

        result.forEach((item) => {
            if (item.attributeTypeCode === 'CERTI') {
                certificationList.push({
                    certInfo: item.attributeGroupCode,
                    certInfoName: item.attributeGroupValue,
                    agency: item.attributeCode,
                    number: item.attributeValue,
                });
            } else if (item.attributeTypeCode === 'AREA') {
                originArea.push({
                    originArea: item.attributeValue,
                    originNation: item.attributeCode,
                });
            } else if (item.attributeTypeCode === 'PROATT') {
                selectedAttributes.push({
                    attributeSeq: item.attributeGroupCode,
                    attributeName: item.attributeGroupValue,
                    attributeValueSeq: item.attributeCode,
                    minAttributeValue: item.attributeValue,
                });
            }
        });
        return { certificationList, selectedAttributes, originArea };
    } catch (error) {
        console.error('Error executing getProductAttribute query:', error);
        throw error;
    }
};

export const postProductThumbnail = async (productThumbnail) => {
    const { wholesaleProductId, thumbnail, imgUploadPlatform = 'naver' } = productThumbnail;
    const query = `
    INSERT INTO selper.platform_thumbnail
    (platform_thumbnail_id, wholesale_product_id, img_name, img_path, img_upload_platform)
    VALUES(:platformThumbnailId, :wholesaleProductId, :imgName, :imgPath, :imgUploadPlatform);`;

    try {
        const result = await Promise.all(
            thumbnail.map(async (item) => {
                const replacements = {
                    platformThumbnailId: uuid4(),
                    wholesaleProductId,
                    imgName: item.fileName,
                    imgPath: item.filePath,
                    imgUploadPlatform,
                };
                const insertResult = await db.query(query, { replacements, type: Sequelize.QueryTypes.INSERT });
                return insertResult;
            })
        );
        return result;
    } catch (error) {
        console.error('Error executing postProductThumbnail query:', error);
        throw error;
    }
};

export const getProductThumbnail = async (wholesaleProductId) => {
    const query = `
        SELECT wholesale_product_id as wholesaleProductId,
               img_name as imgName,
               img_path as imgPath,
               img_upload_platform as imgUploadPlatform
        FROM platform_thumbnail
        WHERE wholesale_product_id = :wholesaleProductId
    `;
    try {
        const result = await db.query(query, {
            replacements: { wholesaleProductId },
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getProductThumbnail query:', error);
        throw error;
    }
};

export const getFinalProductData = async (param) => {
    let { limit, page, productId, searchTerm } = param;
    const offset = (page - 1) * limit;
    let checkSearchTerm = '';
    if (searchTerm) {
        checkSearchTerm = `%${searchTerm}%`;
    }
    let replacements = {
        productId,
        searchTerm: checkSearchTerm,
        limit,
        offset,
    };
    console.log(replacements);
    let query = `
        SELECT 
            p.wholesale_product_id as wholesaleProductId,
            p.product_id as productId, 
            p.product_name as productName,  
            p.product_price as productPrice,
            p.is_discount as isDiscount,
            p.platform_keyword as platformKeyword,
            p.platform_tag as platformTag,
            p.discount_charge as discountCharge,
            wp.product_code as productCode,
            wp.wholesale_site_id as wholesaleSiteId,
            wp.product_price as wholesaleProductPrice,
            wp.detail_page_url as detailPageUrl,
            wsi.site_name as siteName
        FROM products p
        LEFT OUTER JOIN wholesale_product wp
            ON p.wholesale_product_id = wp.wholesale_product_id 
        LEFT OUTER JOIN wholesale_site_info wsi 
            ON wp.wholesale_site_id = wsi.wholesale_site_id 
        WHERE 1=1
        AND p.product_name IS NOT NULL
        AND p.product_price IS NOT NULL
    `;

    if (productId) {
        query += ` AND p.product_id = :productId`;
    }

    if (searchTerm) {
        query += ` AND p.product_name LIKE :searchTerm`;
    }

    query += ` LIMIT :limit OFFSET :offset`;

    try {
        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing getFinalProductData query:', error);
        throw error;
    }
};

export const getProductCategory = async (productId, platformId) => {
    const query = `
        SELECT 
            ppc.product_id, 
            pc.category_id, 
            pc.category_num, 
            pc.category_no1, 
            pc.category_no2, 
            pc.category_no3, 
            pc.category_no4, 
            pc.category_no5, 
            pc.category_no6  
        FROM processed_product_category ppc
        INNER JOIN platform_category pc 
        ON ppc.naver_category_id = pc.category_id
        WHERE ppc.product_id = :productId
        AND pc.platform_id = :platformId
    `;
    const replacements = {
        productId,
        platformId,
    };
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error executing getProductCategory query:', error);
        throw error;
    }
};

export const getProductPlatformPrice = async (productId, platformId) => {
    /**
     *         SELECT platform_price_id, products_id, platform_id, price, margin_percent, margin_price, tax_percent, tax_price, create_dt, platform_percent, platform_price, discount_price, update_dt, update_user
     *         FROM selper.platform_price;
     */
    const query = `
        SELECT 
            platform_price_id as platformPriceId,
            products_id as productsId,
            platform_id as platformId,
            price as price,
            margin_percent as marginPercent,
            margin_price as marginPrice,
            tax_percent as taxPercent,
            tax_price as taxPrice,
            platform_percent as platformPercent,
            platform_price as platformPrice,
            discount_price as discountPrice
        FROM platform_price 
        WHERE products_id = :productId
        AND platform_id = :platformId
    `;
    const replacements = { productId, platformId };
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error executing getProductPlatformPrice query:', error);
        throw error;
    }
};

export const getProductPlatformOption = async (productId, platformId) => {
    const query = `
        SELECT 
            products_id as productsId, 
            option_type as optionType, 
            platform as platform, 
            option_name as optionName, 
            option_value as optionValue, 
            option_price as optionPrice, 
            option_stock as optionStock 
        FROM platform_product_options ppo 
        WHERE products_id = :productId
        AND platform = :platformId
    `;
    const replacements = { productId, platformId };
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error executing getProductPlatformOption query:', error);
        throw error;
    }
};

export const getProductNaverPoint = async (productId) => {
    /**
     *         SELECT point_id, product_id, text_review_point, video_review_point, month_text_review_point, month_video_review_point
     *         FROM selper.naver_point_info;
     */
    const query = `
        SELECT 
            point_id as pointId,
            product_id as productId,
            text_review_point as textReviewPoint,
            video_review_point as videoReviewPoint,
            month_text_review_point as monthTextReviewPoint,
            month_video_review_point as monthVideoReviewPoint
        FROM naver_point_info
        WHERE product_id = :productId
    `;
    const replacements = { productId };
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error executing getProductNaverPoint query:', error);
        throw error;
    }
};

export const getDeliveryInfo = async (wholesaleSiteId) => {
    const query = `
        SELECT 
            wsdi.wholesesale_site_id as wholesesaleSiteId,
            wsi.site_name as siteName, 
            wsi.site_url as siteUrl,
            dci.delivery_company_name as deliveryCompanyName, 
            dci.delivery_company_code as deliveryCompanyCode,
            wsdi.delivery_type as deliveryType,
            c1.code_name AS deliveryTypeName,         
            wsdi.delivery_att_type as deliveryAttType,
            c2.code_name AS deliveryAttTypeName,     
            wsdi.delivery_fee_type as deliveryFeeType,
            c3.code_name AS deliveryFeeTypeName,     
            wsdi.delivery_pay_type as deliveryPayType,
            c4.code_name AS deliveryPayTypeName,     
            wsdi.return_delivery_company as returnDeliveryCompany,
            c5.code_name AS returnDeliveryCompanyName, 
            wsdi.delivery_base_fee as deliveryBaseFee,
            wsdi.free_condition_amount as freeConditionAmount,
            wsdi.extra_delivery_fee as extraDeliveryFee,
            wsdi.return_delivery_fee as returnDeliveryFee,
            wsdi.dispatch_location as dispatchLocation,
            wsdi.return_delivery_location as returnDeliveryLocation
        FROM wholesesale_site_delivery_info wsdi
        LEFT JOIN wholesale_site_info wsi 
            ON wsi.wholesale_site_id = wsdi.wholesesale_site_id
        LEFT JOIN delivery_company_info dci 
            ON dci.delivery_company_code = wsdi.delivery_info_id
        LEFT JOIN common_code c1
            ON c1.code = wsdi.delivery_type
        LEFT JOIN common_code c2
            ON c2.code = wsdi.delivery_att_type
        LEFT JOIN common_code c3
            ON c3.code = wsdi.delivery_fee_type
        LEFT JOIN common_code c4
            ON c4.code = wsdi.delivery_pay_type
        LEFT JOIN common_code c5
            ON c5.code = wsdi.return_delivery_company
        WHERE wsdi.wholesesale_site_id = :wholesaleSiteId
    `;
    const replacements = { wholesaleSiteId };
    try {
        const result = await db.query(query, { replacements, type: Sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error executing getDeliveryInfo query:', error);
        throw error;
    }
};
