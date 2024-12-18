// naverShoppingSearchInfo.js
// @description: detailAttribute 내 naverShoppingSearchInfo 객체를 생성하는 함수

/**
 * @function createNaverShoppingSearchInfo
 * @description detailAttribute 내 naverShoppingSearchInfo 객체 생성
 * @description
 *
 * @param {Object} data
 * @param {number} data.modelId - 카탈로그 ID ( 사용 안함 )
 * @param {string} data.modelName - 카탈로그명 ( 사용 안함 )
 * @param {string} data.manufacturerName - 제조사명 ( 기본값 - 인영상회 협력사)
 * @param {number} data.brandId - 브랜드 ID (기본적으로 사용 안함, 브랜드 제품 등록시 사용)
 * @param {string} data.brandName - 브랜드명 (기본적으로 사용 안함, 브랜드 제품 등록시 사용)
 *
 * @returns {Object} naverShoppingSearchInfo
 */
export function createNaverShoppingSearchInfo(data) {
    return {
        modelId: data.modelId,
        modelName: data.modelName,
        manufacturerName: data.manufacturerName,
        brandId: data.brandId,
        brandName: data.brandName,
    };
}
