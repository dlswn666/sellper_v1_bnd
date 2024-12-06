// purchaseQuantityInfo.js
// @description: detailAttribute 내 구매수량 정보 객체
// DOC에서 필수 여부, 필드 확인

/**
 * @function createPurchaseQuantityInfo
 * @description 최소/최대 구매 수량 제한 정보
 *
 * @param {Object} data
 * @param {number} data.minPurchaseQuantity - 최소 구매 수량 ( 사용 안함 )
 * @param {number} data.maxPurchaseQuantityPerId - 아이디당 최대 구매 수량 ( 사용 안함 )
 * @param {number} data.maxPurchaseQuantityPerOrder - 주문당 최대 구매 수량 ( 사용 안함 )
 *
 * @returns {Object} purchaseQuantityInfo
 */
export function createPurchaseQuantityInfo(data) {
    return {
        minPurchaseQuantity: data.minPurchaseQuantity,
        maxPurchaseQuantityPerId: data.maxPurchaseQuantityPerId,
        maxPurchaseQuantityPerOrder: data.maxPurchaseQuantityPerOrder,
    };
}
