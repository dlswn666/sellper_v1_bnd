// productSize.js

/**
 * 상품 사이즈 정보 생성
 * @param {Object} data - 상품 사이즈 정보를 담은 객체
 * /**
 * @param {Object} data - 상품 사이즈와 패션모델 정보를 담은 객체
 *
 * @param {number} data.sizeTypeNo - 사이즈 타입 번호 (필수, 정수형 <int64>)
 *   - 상품의 사이즈 유형을 식별하는 고유 번호입니다.
 *
 * @param {Object} data.sizeAttributes - 상품 상세 사이즈 속성 목록 (필수)
 *   - 상품의 세부 사이즈 정보를 나타내는 객체 배열입니다.
 * @param {string} data.sizeAttributes.name - 상품 상세 사이즈 항목 이름 (필수)
 *   - 예: "가슴둘레", "소매길이" 등
 *
 * @param {Object} data.sizeAttributes.sizeValues - 상품 사이즈 값 목록 (필수)
 * @param {number} data.sizeAttributes.sizeValues.sizeValueTypeNo - 사이즈 값 타입 번호 (필수, 정수형 <int64>)
 * @param {number} data.sizeAttributes.sizeValues.value - 사이즈 값 (필수, 실수형 <double>)
 *
 * @param {Object} data.models - 패션모델 정보 목록 (선택)
 *   - 상품과 관련된 패션모델 정보를 담은 객체 배열입니다.
 * @param {number} data.models.modelId - 패션모델 번호 (필수, 정수형 <int64>)
 *       - 모델을 식별하는 고유 번호입니다.
 */

export function createProductSize(data) {
    const { sizeTypeNo, sizeAttributes, models } = data;

    return {
        sizeTypeNo,
        sizeAttributes: sizeAttributes?.map((sizeAttribute) => ({
            name: sizeAttribute.name,
            sizeValues: sizeAttribute.sizeValues?.map((sizeValue) => ({
                sizeValueTypeNo: sizeValue.sizeValueTypeNo,
                value: sizeValue.value,
            })),
        })),
        models: models?.map((model) => ({
            modelId: model.modelId,
        })),
    };
}
