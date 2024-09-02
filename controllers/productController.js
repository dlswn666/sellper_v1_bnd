const productModel = require('../models/productModel');

exports.getSelectProductData = async (req, res) => {
    try {
        let product = await productModel.getProducts(req.params.productName);

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.putWorkingData = async (req, res) => {
    const data = req.body;
    try {
        if (data) {
            data.map(async (item) => {
                const result = productModel.putWorkingProduct(item);
                return result;
            });
        }
        res.status(200).json({ message: '저장이 완료 되었습니다.' });
    } catch (error) {
        console.error('Error occure putWorkingData : ', error);
        res.status(500).json({ message: '저장에 실패하였습니다.' });
    }
};

exports.getProductData = async (req, res) => {
    const { productName = '', offset = 0, limit = 50 } = req.query; // POST 요청의 본문에서 데이터 추출

    const data = {
        productName,
        offset: parseInt(offset, 10), // offset을 정수로 변환
        limit: parseInt(limit, 10), // limit을 정수로 변환
    };
    console.log(data);
    try {
        // 제품 데이터를 가져옴
        let products = await productModel.getSearchWordData(data);

        // 제품 데이터에 썸네일 데이터를 병합
        const productsData = await Promise.all(
            products.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.productId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );

        // 병합된 데이터를 응답으로 보냄
        res.status(200).json(productsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSearchWord = async (req, res) => {
    try {
        const searchWord = await productModel.getSearchWord(req.params.productId);

        res.json(searchWord);
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
