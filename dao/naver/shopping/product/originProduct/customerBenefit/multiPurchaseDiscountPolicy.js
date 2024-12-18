// multiPurchaseDiscountPolicy.js

/**
 * 판매자 복수 구매 할인 정책
 *
 * @param {Object} data - 다중 구매 할인 정책 정보를 담은 객체
 *
 * @param {Object} data.discountMethod - 복수 구매 할인 혜택
 * @param {number} data.discountMethod.value - 할인 값
 *   - 할인 단위에 따라 입력되는 값입니다.
 *   - 범위: 1 ~ 10,000,000
 *   - 예: 정율 10%이면 10, 정액 100원이면 100
 *
 * @param {string} data.discountMethod.unitType - 할인 단위
 *   - 할인 단위 타입을 입력합니다.
 *   - 허용 값: 'PERCENT' (정율), 'WON' (정액)
 *
 * @param {string} data.discountMethod.startDate - 할인 시작일
 *   - 복수 구매 할인의 경우 날짜로만 지정됩니다.
 *   - 형식: 'yyyy-MM-dd'
 *     - 예: '2024-12-01'
 *
 * @param {string} data.discountMethod.endDate - 할인 종료일 (시작일 입력 시 필수)
 *   - 복수 구매 할인의 경우 날짜로만 지정됩니다.
 *   - 형식: 'yyyy-MM-dd'
 *     - 예: '2024-12-31'
 *
 *
 * @param {string} data.orderValue - 주문 금액(수량) 값
 * @param {'COUNT' | 'WON'} data.orderValueUnitType - 주문 금액(수량) 단위 타입
 *   - Enum: 'PERCENT', 'WON', 'YEN', 'COUNT'
 *   - COUNT, WON만 입력 가능합니다.
 *   - COUNT(개수), WON(정액)
 */

export function createMultiPurchaseDiscountPolicy(data) {
    const { discountMethod, orderValue, orderValueUnitType } = data;

    return {
        discountMethod: {
            value: discountMethod.value,
            unitType: discountMethod.unitType,
            startDate: discountMethod.startDate,
            endDate: discountMethod.endDate,
        },
        orderValue,
        orderValueUnitType,
    };
}
