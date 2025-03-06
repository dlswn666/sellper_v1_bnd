import db from '../config/db.js';
import { Sequelize } from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export const getSearchWord = async () => {
    try {
        const [searchWord] = await db.query(
            `
            select p.product_id as id 
                , p.search_word as searchWord
                from products p
            left join (
	            select product_id from auto_recommend
                ) ar on ar.product_id = p.product_id
            where ar.product_id is null and p.search_word is not null
            `
        );
        return searchWord;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

export const putAutoReco = async (data) => {
    const { id, productName, productTags, cateId, cateNam, platform_name } = data;
    console.log('putAutoReco data', data);
    try {
        const query = `

            REPLACE INTO auto_recommend
            (   product_id, 
                reco_cate, 
                reco_productNm, 
                reco_keyword, 
                create_dt, 
                reco_cate_id, 
                reco_tag,
                platform_name
            )
            VALUES(:id, :cateNam, :productName, '', CURRENT_TIMESTAMP, :cateId, :productTags, :platformName);
        `;

        const replacements = {
            id,
            productName,
            productTags,
            cateId: JSON.stringify(cateId),
            cateNam: JSON.stringify(cateNam),
            platformName: platform_name,
        };
        await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.INSERT,
        });
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

export const getSearchKeywords = async (keyword, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // 데이터 조회 쿼리
        const [rows] = await db.query(
            `SELECT * FROM search_keywords 
       WHERE keyword LIKE ? 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
            [`%${keyword}%`, limit, offset]
        );

        // 전체 개수 조회 쿼리 추가
        const [totalRows] = await db.query(
            `SELECT COUNT(*) as total FROM search_keywords 
       WHERE keyword LIKE ?`,
            [`%${keyword}%`]
        );

        return {
            data: rows,
            total: totalRows[0].total,
        };
    } catch (error) {
        console.error('Error in getSearchKeywords:', error);
        throw error;
    }
};

export const getSearchKeywordsByDate = async (startDate, endDate, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // 데이터 조회 쿼리
        const [rows] = await db.query(
            `SELECT * FROM search_keywords 
       WHERE created_at BETWEEN ? AND ? 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
            [startDate, endDate, limit, offset]
        );

        // 전체 개수 조회 쿼리 추가
        const [totalRows] = await db.query(
            `SELECT COUNT(*) as total FROM search_keywords 
       WHERE created_at BETWEEN ? AND ?`,
            [startDate, endDate]
        );

        return {
            data: rows,
            total: totalRows[0].total,
        };
    } catch (error) {
        console.error('Error in getSearchKeywordsByDate:', error);
        throw error;
    }
};
