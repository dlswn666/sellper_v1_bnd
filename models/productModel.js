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
            `SELECT wp.wholesale_site_id AS siteId,
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
                    p.product_name AS productName,
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
             LEFT OUTER JOIN wholesale_site_info wsi ON wp.wholesale_site_id = wsi.wholesale_site_id`,
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
    console.log('productId : ', productId);
    console.log('productName : ', productName);

    try {
        let query = `
            UPDATE selper.products 
            SET product_name = :productName
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
