// sellerCodeInfo.js
// @description: detailAttribute 내 sellerCodeInfo 객체를 생성하는 함수

/**
 * @function createSellerCodeInfo
 * @description detailAttribute 내 sellerCodeInfo 객체 생성
 *
 * @param {Object} data
 * @param {string} data.sellperManagementCode - 판매자 관리 코드
 * @param {string} data.sellerBarcode - 판매자 바코드
 * @param {string} data.sellerCustomCode1 - 판매자 커스텀 코드1
 * @param {string} data.sellerCustomCode2 - 판매자 커스텀 코드2
 *
 * @returns {Object} sellerCodeInfo
 */
export function createSellerCodeInfo(data) {
    return {
        sellperManagementCode: data.sellperManagementCode,
        sellerBarcode: data.sellerBarcode,
        sellerCustomCode1: data.sellerCustomCode1,
        sellerCustomCode2: data.sellerCustomCode2,
    };
}
