// ecoupon.js
// @description: detailAttribute 내 ecoupon 객체를 생성하는 함수

/**
 * @function createEcoupon
 * @description 이쿠폰 정보
 *
 * @param {Object} data - 이쿠폰 정보
 * @param {'FIXED' | 'FLEXIBLE'} data.periodType - 이쿠폰 기간 유형
 *      - FIXED(특정 기간)
 *      - FLEXIBLE(자동 기간)
 * @param {string} data.validStartDate - 이쿠폰 유효 시작일(yyyy-MM-dd)
 * @param {string} data.validEndDate - 이쿠폰 유효 종료일(yyyy-MM-dd)
 * @param {number} data.periodDays - 이쿠폰 기간(periodType이 FIXED인 경우 필수)
 * @param {string} data.publicInformationContents - E쿠폰 발행처 내용
 * @param {string} data.contactInformationContents - E쿠폰 연락처 내용
 * @param {'PLACE' | 'ADDRESS' | 'URL'} data.usePlaceType - E쿠폰 사용 장소 구분 코드
 *      - PLACE(장소)
 *      - ADDRESS(주소)
 *      - URL(URL)
 * @param {string} data.usePlaceContents - 사용 장소 내용 ( ECouponUsePlaceType.ADDRESS인 경우 주소록 일련번호를 입력 )
 * @param {boolean} data.restrictCart - 장바구니 구매 불가 여부 (true: 즉시 구매만 가능, false: 즉시 구매, 장바구니 구매 가능)
 * @param {string} data.siteName - 사이트명
 *
 * @returns {Object} ecoupon
 */
export function createEcoupon(data = {}) {
    return {};
}
