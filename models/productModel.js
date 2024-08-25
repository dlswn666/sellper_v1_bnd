const db = require('../config/db');
const { Sequelize } = require('sequelize');

exports.getAllProducts = async () => {
    const [rows] = await db.query('SELECT * FROM products_data limit 100');
    return rows;
};

exports.deleteProducts = async (url) => {
    try {
        const result = await db.query('DELETE FROM products_data WHERE product_url = :url', {
            replacements: { url },
            type: Sequelize.QueryTypes.DELETE,
        });

        console.log('Query executed, affected rows:', result);
        return result;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};
