// images.js

/**
 * @function createImages
 * @description: 상품 이미지 정보를 담고 있는 객체를 생성하는 함수
 * @param {Object} data.representativeImage - 상품 대표 이미지 정보(필수)
 * @param {string} data.representativeImage.url - 상품 대표 이미지 URL(필수)
 *
 * @param {Array} data.optionalImages - 상품 추가 이미지 정보(필수)
 * @param {string} data.optionalImages[].url - 상품 추가 이미지 URL(필수)
 *
 */

export const createImages = (data) => {
    const { representativeImage, optionalImages } = data;

    const images = {
        representativeImage: {
            url: representativeImage.url,
        },
        optionalImages: optionalImages.map((image) => ({ url: image.url })),
    };

    return images;
};
