// productAttributes.js
/**
 * 상품 속성 목록
 *
 * /**
 * @param {Object} data - 속성 정보를 담은 객체
 *
 * @param {number} data.attributeSeq - 속성 ID (선택, 정수형 <int64>)
 *   - 속성 ID를 지정합니다.
 *
 * @param {number} data.attributeValueSeq - 속성값 ID (필수, 정수형 <int64>)
 *   - 속성의 특정 값을 지정합니다.
 *
 * @param {string} data.attributeRealValue - 속성 실제 값 (선택)
 *   - 범위형 속성인 경우 입력합니다.
 *   - 특정 값을 지정할 수 없는 속성의 경우 실제 값을 입력합니다.
 *
 * @param {string} data.attributeRealValueUnitCode - 속성 실제 값 단위 코드 (선택)
 *   - 범위형 속성인 경우 입력합니다.
 *   - 예: "cm", "kg" 등 단위 코드를 지정합니다.
 */

/**
 * 상품 속성 목록 생성
 * @param {Object} data - 속성 정보를 담은 객체
 * @returns {Object} productAttributes - 생성된 상품 속성 목록
 */

export function createProductAttributes(data) {
    const { attributeSeq, attributeValueSeq, attributeRealValue, attributeRealValueUnitCode } = data;

    return {
        attributeSeq,
        attributeValueSeq,
        attributeRealValue,
        attributeRealValueUnitCode,
    };
}
