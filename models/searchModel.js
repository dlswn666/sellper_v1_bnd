import db from '../config/db.js';
import { Sequelize } from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export const getSearchWord = async () => {
    try {
        const [searchWord] = await db.query(
            `
            select p.id as id 
                , p.search_word as searchWord
                from products p
            left join (
	            select product_id from auto_recommend
                ) ar on ar.product_id = p.id
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
    const { id, productName, productTags, cateId, cateNam } = data;
    try {
        const query = `
            REPLACE INTO auto_recommend
            (   product_id, 
                reco_cate, 
                reco_productNm, 
                reco_keyword, 
                create_dt, 
                reco_cate_id, 
                reco_tag
            )
            VALUES(:id, :cateNam, :productName, '', CURRENT_TIMESTAMP, :cateId, :productTags);
        `;
        const replacements = {
            id,
            productName,
            productTags,
            cateId: JSON.stringify(cateId),
            cateNam: JSON.stringify(cateNam),
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
