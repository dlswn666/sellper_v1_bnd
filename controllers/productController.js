const productModel = require('../models/productModel');

exports.getProductData = async (req, res) => {
    try {
        const data = await productModel.getAllProducts();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { url } = req.query;
        const decodedUrl = decodeURIComponent(url);

        console.log('Requested URL:', url);
        console.log('Decoded URL:', decodedUrl);

        if (!decodedUrl) {
            return res.status(400).json({ message: 'URL is required' });
        }

        const result = await productModel.deleteProducts(decodedUrl);

        res.status(200).json({ message: 'Product deleted successfully', result });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
