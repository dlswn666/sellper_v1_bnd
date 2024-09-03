const db = require('../config/db');
const { Sequelize } = require('sequelize');
const { v4: uuid4 } = require('uuid');
const sequelize = require('../config/db');

exports.getProducts = async (productName) => {
    try {
        let replacements = {};
        let condition = '';

        if (productName) {
            condition += ` WHERE wp.product_name LIKE :productName`;
            replacements.productName = `%${productName}%`;
        }

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
        `;

        const products = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.SELECT,
        });

        return products;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

exports.putWorkingProduct = async (data) => {
    const productsUuid = uuid4();
    const { productId } = data;

    // 트랜잭션 시작
    const t = await db.transaction();

    try {
        await db.query(
            `
            INSERT INTO selper.products
                (id, wholesale_product_id, create_user, create_dt)
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
                (id, stage, update_dt, update_user)
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
                p.id AS workingProductId,
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
                wp.product_name asc,
                CASE 
                    WHEN p.search_word IS NOT NULL AND p.search_word != '' THEN 1
                    ELSE 0
                END ASC
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
                    where id = :id`;
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
                (id, stage, pre_value, cur_value, update_dt, update_user)
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
                select search_word from products where id = :id
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
