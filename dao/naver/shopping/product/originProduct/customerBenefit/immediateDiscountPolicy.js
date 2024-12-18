// immediateDiscountPolicy.js

/**
 * @function createImmediateDiscountPolicy
 * @description 판매자 기본 할인 정책 mobileDiscountMethod로 설정한 값은 무시됩니다. 추후 오류 응답이 반환될 수 있으므로 discountMethod를 사용하세요.
 *
 * @param {Object} data - 할인 혜택 정보를 담은 객체
 *
 * @param {Object} data.discountMethod - 할인 혜택 정보를 담은 객체
 * @param {number} data.discountMethod.value - 할인 값 (필수)
 *   - 할인 단위에 따라 입력되는 값입니다.
 *     - 정율 할인: 예를 들어, 10% 할인은 `10`
 *     - 정액 할인: 예를 들어, 100원 할인은 `100`
 *   - 허용 범위: [1 .. 10,000,000]
 *
 * @param {string} data.discountMethod.unitType - 할인 단위 타입 (필수)
 *   - Enum: 'PERCENT', 'WON'
 *     - `PERCENT`: 정율 할인 (예: 10%)
 *     - `WON`: 정액 할인 (예: 100원)
 *   - 입력 값은 'PERCENT' 또는 'WON' 중 하나만 가능합니다.
 *
 * @param {string} data.discountMethod.startDate - 할인 시작일 (선택)
 *   - 시작 시간은 매 시각 00, 10, 20, 30, 40, 50분으로만 설정 가능합니다.
 *   - 형식: 'yyyy-MM-dd\'T\'HH:mm[:ss][.SSS]XXX'
 *     - 예: '2024-12-08T10:00:00+09:00'
 *
 * @param {string} data.discountMethod.endDate - 할인 종료일 (선택)
 *   - 종료 시간은 매 시각 09, 19, 29, 39, 49, 59분으로만 설정 가능합니다.
 *   - 형식: 'yyyy-MM-dd\'T\'HH:mm[:ss][.SSS]XXX'
 *     - 예: '2024-12-08T10:09:00+09:00'
 *
 *
 */

export function createImmediateDiscountPolicy(data) {
    const { immediateDiscountPolicy } = data;

    return {
        discountMethod: {
            value: immediateDiscountPolicy.discountValue,
            unitType: immediateDiscountPolicy.discountUnitType,
            startDate: immediateDiscountPolicy.discountStartDate,
            endDate: immediateDiscountPolicy.discountEndDate,
        },
    };
}
