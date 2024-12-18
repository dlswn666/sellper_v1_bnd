// reviewPointPolicy.js

/**
 * 판매자 상품 리뷰 포인트 정책
 *
 *
 * @param {Object} data - 리뷰 포인트 적립 정보를 담은 객체
 *
 * @param {number} data.textReviewPoint - 텍스트 리뷰 포인트
 *   - 텍스트 리뷰 작성 시 적립되는 네이버페이 포인트
 *   - 정수 값 입력 (예: 500)
 *
 * @param {number} data.photoVideoReviewPoint - 포토/동영상 리뷰 포인트
 *   - 포토 또는 동영상 리뷰 작성 시 적립되는 네이버페이 포인트
 *   - 정수 값 입력 (예: 1000)
 *
 * @param {number} data.afterUseTextReviewPoint - 한 달 사용 텍스트 리뷰 포인트
 *   - 한 달 사용 후 텍스트 리뷰 작성 시 적립되는 네이버페이 포인트
 *   - 정수 값 입력 (예: 1500)
 *
 * @param {number} data.afterUsePhotoVideoReviewPoint - 한 달 사용 포토/동영상 리뷰 포인트
 *   - 한 달 사용 후 포토 또는 동영상 리뷰 작성 시 적립되는 네이버페이 포인트
 *   - 정수 값 입력 (예: 2000)
 *
 * @param {number} data.storeMemberReviewPoint - 알림받기 동의/톡톡친구 회원 리뷰 작성 포인트
 *   - 알림받기 동의 또는 톡톡친구 회원이 상품 리뷰 또는 한 달 사용 리뷰 작성 시 추가로 적립되는 네이버페이 포인트
 *   - 리뷰 유형에 관계없이 1회만 지급
 *   - 정수 값 입력 (예: 300)
 *
 * @param {string} data.startDate - 포인트 적립 시작일
 *   - 네이버페이 포인트 유효기간 시작일
 *   - 형식: 'yyyy-MM-dd'
 *     - 예: '2024-12-01'
 *
 * @param {string} data.endDate - 포인트 적립 종료일 (시작일 입력 시 필수)
 *   - 네이버페이 포인트 유효기간 종료일
 *   - 형식: 'yyyy-MM-dd'
 *     - 예: '2025-01-01'
 */

export function createReviewPointPolicy(data) {
    const {
        textReviewPoint,
        photoVideoReviewPoint,
        afterUseTextReviewPoint,
        afterUsePhotoVideoReviewPoint,
        storeMemberReviewPoint,
        startDate,
        endDate,
    } = data;

    return {
        textReviewPoint,
        photoVideoReviewPoint,
        afterUseTextReviewPoint,
        afterUsePhotoVideoReviewPoint,
        storeMemberReviewPoint,
        startDate,
        endDate,
    };
}
