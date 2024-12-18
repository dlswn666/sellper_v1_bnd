// purchaseReviewInfo.js
// @description: detailAttribute 내 purchaseReviewInfo 객체를 생성하는 함수

/**
 * @function createPurchaseReviewInfo
 *
 * @param {Object} data - 리뷰 노출 설정 정보
 * @param {boolean} data.purchaseReviewExposure - 리뷰 노출 설정
 * @param {string} data.reviewUnExposeReason - 리뷰 노출 제외 사유, 리뷰 노출 설정 false 경우 필수값
 *
 * @returns {Object} purchaseReviewInfo
 */
export function createPurchaseReviewInfo(data = {}) {
    const { purchaseReviewExposure, reviewUnExposeReason } = data;

    return {
        purchaseReviewExposure,
        reviewUnExposeReason,
    };
}
