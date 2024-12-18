// reservedDiscountPolicy.js

/**
 * 예약 할인 정책
 *
 * @param {Object} data - 예약 할인 정책 정보를 담은 객체
 * @param {Object} data.discountMethod - 할인 정보를 담은 객체
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
 *   - 매 시각 00, 10, 20, 30, 40, 50분으로만 설정 가능합니다.
 *   - 형식: 'yyyy-MM-dd\'T\'HH:mm[:ss][.SSS]XXX'
 *     - 예: '2024-12-01T10:10:00+09:00'
 *
 * @param {string} data.discountMethod.endDate - 할인 종료일 (시작일 입력 시 필수)
 *   - 매 시각 09, 19, 29, 39, 49, 59분으로만 설정 가능합니다.
 *   - 형식: 'yyyy-MM-dd\'T\'HH:mm[:ss][.SSS]XXX'
 *     - 예: '2024-12-31T19:19:00+09:00'
 */

export function createReservedDiscountPolicy(data) {
    const { discountMethod } = data;

    return {
        discountMethod: {
            value: discountMethod.value,
            unitType: discountMethod.unitType,
            startDate: discountMethod.startDate,
            endDate: discountMethod.endDate,
        },
    };
}
