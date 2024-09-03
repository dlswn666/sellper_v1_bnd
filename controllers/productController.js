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
    const { search = '', limit = 50, page = 1 } = req.query;

    const data = {
        search,
        offset: (page - 1) * limit,
        limit: parseInt(limit, 10),
        page: parseInt(page, 10),
    };

    try {
        // 제품 데이터를 가져옴
        const products = await productModel.getSearchWordData(data);
        let { searchResult, total } = products;
        console.log(products);

        // 제품 데이터에 썸네일 데이터를 병합
        let productsData = await Promise.all(
            searchResult.map(async (product) => {
                let thumbnail = await productModel.getThumbNailData(product.productId);
                return {
                    ...product,
                    thumbnail,
                };
            })
        );
        productsData.total = total;
        // 병합된 데이터를 응답으로 보냄
        console.log(productsData);
        res.status(200).json({ result: productsData, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSearchWord = async (req, res) => {
    try {
        const searchWord = await productModel.getSearchWord(req.params.productId);

        res.status(200).json(searchWord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.postSearchWord = async (req, res) => {
    const data = req.body;
    try {
        if (data) {
            data.map(async (item) => {
                await productModel.postSearchWord(item);
            });
        }
        res.status(200).json({ message: '저장이 완료 되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
