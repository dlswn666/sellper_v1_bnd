// purchasePointPolicy.js

/**
 * 판매자 상품 구매 포인트 정책
 * @param {Object} data - 구매 포인트 정책 데이터
 *
 * @param {number} data.value - 상품 구매 포인트 값 (필수)
 *   - 포인트 단위(unitType)에 따라 입력됩니다.
 *     - 정율 포인트(PERCENT): 예) 10% -> `10`
 *     - 정액 포인트(WON): 예) 100원 -> `100`
 *
 * @param {string} data.unitType - 상품 구매 포인트 단위 타입 (필수)
 *   - Enum: 'PERCENT', 'WON'
 *     - `PERCENT`: 정율 포인트 (퍼센트 단위)
 *     - `WON`: 정액 포인트 (금액 단위)
 *   - 허용 값: 'PERCENT' 또는 'WON'
 *
 * @param {string} data.startDate - 포인트 적립 시작일 (선택)
 *   - 형식: 'yyyy-MM-dd'
 *     - 예) '2024-12-08'
 *
 * @param {string} data.endDate - 포인트 적립 종료일 (필수, 시작일 입력 시)
 *   - 시작일(`startDate`)을 입력한 경우 필수입니다.
 *   - 형식: 'yyyy-MM-dd'
 *     - 예) '2024-12-31'
 */

export function createPurchasePointPolicy(data) {
    const { value, unitType, startDate, endDate } = data;

    return {
        value,
        unitType,
        startDate,
        endDate,
    };
}
