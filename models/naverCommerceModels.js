import db from '../config/db.js';
import { Sequelize } from 'sequelize';

// 한달에 한번 확인
export const postNaverCategory = async (data) => {
    const { wholeCategoryName, id, name } = data;

    // 카테고리 데이터 분리 및 초기화
    const parts = wholeCategoryName.split('>').map((part) => part.trim());
    const categoryId = `naver_${id}`;
    const categoryNum = id;
    const replacements = {
        categoryId,
        categoryNum,
    };

    // category_no1 ~ category_no6를 초기화
    for (let i = 1; i <= 6; i++) {
        replacements[`categoryNo${i}`] = parts[i - 1] || null; // 없으면 NULL 처리
    }

    // SQL 쿼리
    const query = `
        INSERT INTO selper.platform_category
        (category_id, platform_id, category_num, category_no1, category_no2, category_no3, category_no4, category_no5, category_no6)
        VALUES(:categoryId, 'naver', :categoryNum, :categoryNo1, :categoryNo2, :categoryNo3, :categoryNo4, :categoryNo5, :categoryNo6)
    `;

    try {
        // 데이터베이스에 삽입
        const result = await db.query(query, {
            replacements,
            type: Sequelize.QueryTypes.INSERT,
        });
        return result; // 삽입 결과 반환
    } catch (error) {
        console.error('Naver category error', error);
        throw error;
    }
};

export const getNaverCategoryModel = async (categoryNum) => {
    const query = `
        SELECT 
            category_num as categoryNum
        FROM selper.platform_category
        WHERE category_no1 like (
            SELECT category_no1 
                FROM selper.platform_category 
                WHERE category_num = :categoryNum
        )
                AND category_no2 IS NULL
    `;
    const result = await db.query(query, {
        replacements: { categoryNum },
        type: Sequelize.QueryTypes.SELECT,
    });

    return result;
};

export const getNaverCommerceData = async (query, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // 데이터 조회 쿼리
        const [rows] = await db.query(
            `SELECT * FROM naver_commerce_data 
       WHERE query = ? 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
            [query, limit, offset]
        );

        // 전체 개수 조회 쿼리 추가
        const [totalRows] = await db.query(
            `SELECT COUNT(*) as total FROM naver_commerce_data 
       WHERE query = ?`,
            [query]
        );

        return {
            data: rows,
            total: totalRows[0].total,
        };
    } catch (error) {
        console.error('Error in getNaverCommerceData:', error);
        throw error;
    }
};

export const getNaverCommerceDataByDate = async (startDate, endDate, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // 데이터 조회 쿼리
        const [rows] = await db.query(
            `SELECT * FROM naver_commerce_data 
       WHERE created_at BETWEEN ? AND ? 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
            [startDate, endDate, limit, offset]
        );

        // 전체 개수 조회 쿼리 추가
        const [totalRows] = await db.query(
            `SELECT COUNT(*) as total FROM naver_commerce_data 
       WHERE created_at BETWEEN ? AND ?`,
            [startDate, endDate]
        );

        return {
            data: rows,
            total: totalRows[0].total,
        };
    } catch (error) {
        console.error('Error in getNaverCommerceDataByDate:', error);
        throw error;
    }
};
