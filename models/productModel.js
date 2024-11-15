const db = require('../config/db');
const { Sequelize } = require('sequelize');
const { v4: uuid4 } = require('uuid');

exports.getProducts = async (data) => {
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

exports.putWorkingProduct = async (data) => {
    const { productsUuid, productId, chargeParam } = data;

    // 트랜잭션 시작
    const t = await db.transaction();

    try {
        await db.query(
            `
            INSERT INTO selper.products
                (product_id, wholesale_product_id, create_user, create_dt)
                VALUES(:productsUuid, :productId,'selper', CURRENT_TIMESTAMP);
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
        await db.query(
            `
                INSERT INTO selper.products_his
                (product_his_id, stage, update_dt, update_user)
                VALUES(:productsUuid, 'ST', CURRENT_TIMESTAMP, 'selper');
            `,
            {
                replacements: {
                    productsUuid,
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

exports.postWorkingProductPrice = async (data) => {
    try {
    } catch (error) {
        console.error('Error executing putWorkingProductPrice query:', error);
    }
};

exports.getSearchWordData = async (data) => {
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

exports.getThumbNailData = async (productId) => {
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

exports.postSearchWord = async (data) => {
    const t = await db.transaction();
    const { id, preValue, curValue } = data;

    try {
        const postQuery = `update products 
                    set search_word = :curValue
                    where product_id = :id`;
        let postReplacements = {};
        postReplacements.curValue = curValue;
        postReplacements.id = id;

        await db.query(postQuery, {
            replacements: postReplacements,
            type: Sequelize.QueryTypes.UPDATE,
            transaction: t,
        });

        await db.query(
            `
                INSERT INTO selper.products_his
                (product_his_id, stage, pre_value, cur_value, update_dt, update_user)
                VALUES(:id, 'SW', :preValue, :curValue, CURRENT_TIMESTAMP, 'selper');
            `,
            {
                replacements: {
                    id,
                    preValue,
                    curValue,
                },
                type: Sequelize.QueryTypes.INSERT,
                transaction: t,
            }
        );

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

exports.getSearchWord = async (wholeSaleProductId) => {
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
        console.log(searchWord);
        return searchWord;
    } catch (error) {
        console.log('getSearchWord error executing query : ', error);
    }
};

exports.getDetailImageData = async (productId) => {
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

exports.getPlatformCharge = async () => {
    try {
        const platformChargeData = await db.query(
            `
                SELECT id, 
	            platform_name, 
	            platform_url, 
	            platform_info,
	            charge_rate
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

exports.putPlatformPrice = async (data) => {
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
    try {
        let query = `
           INSERT INTO selper.platform_price
            (platform_pricd_id, 
            product_id, 
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

exports.putAutoReco = async (data) => {
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

exports.getAutoReco = async (data) => {
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
            console.log(flag);
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
                        ORDER BY wp.product_name ASC
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

exports.putProductName = async (data) => {
    const { productId, productName } = data;

    try {
        let query = `
            UPDATE selper.products 
            SET product_name = :productName,
                update_dt = now(),
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

exports.getCateProduct = async (data) => {
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

exports.putProductTag = async (data) => {
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

exports.getCategory = async (data) => {
    const { categoryNo1, categoryNo2, categoryNo3, categoryNo4, categoryNo5, categoryNo6, platformId } = data;
    console.log('getCategory###########################################', data);
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
        console.log(query);

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

exports.postProcessCategory = async (data) => {
    const { productId, categoryId, platformId } = data;

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

exports.getProductById = async (id) => {
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
            replacements: { id },
            type: Sequelize.QueryTypes.SELECT,
        });
        return result;
    } catch (error) {
        console.error('Error executing query : ', error);
        throw error;
    }
};

exports.getProductPriceDataById = async (id, search, limit, offset) => {
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
                (SELECT COUNT(*)
                FROM products p_inner
                LEFT OUTER JOIN processed_product_category ppc_inner
                    ON p_inner.product_id = ppc_inner.product_id
                LEFT OUTER JOIN platform_category naver_cate_inner
                    ON ppc_inner.naver_category_id = naver_cate_inner.category_id
                LEFT OUTER JOIN platform_category coupang_cate_inner
                    ON ppc_inner.coupang_category_id = coupang_cate_inner.category_id
                LEFT OUTER JOIN platform_category gmarket_cate_inner
                    ON ppc_inner.gmarket_category_id = gmarket_cate_inner.category_id
                LEFT OUTER JOIN platform_category elevenst_cate_inner
                    ON ppc_inner.elevenst_category_id = elevenst_cate_inner.category_id
                WHERE p_inner.product_name IS NOT NULL 
                    AND p_inner.platform_tag IS NOT NULL
                    AND (naver_cate_inner.category_no1 IS NOT NULL 
                        OR coupang_cate_inner.category_no1 IS NOT NULL 
                        OR gmarket_cate_inner.category_no1 IS NOT NULL 
                        OR elevenst_cate_inner.category_no1 IS NOT NULL)
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
                AND (naverCategory IS NOT NULL OR coupangCategory IS NOT NULL OR gmarketCategory IS NOT NULL OR elevenstCategory IS NOT NULL)
    `;
    const replacements = {};

    if (search) {
        checkQuery += ` AND p.product_name = :search`;
        replacements.search = search;
    }
    if (id) {
        checkQuery += ` AND p.product_id = :id`;
        replacements.id = id;
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
