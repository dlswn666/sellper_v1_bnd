// certificationTargetExcludeContent.js
// @description: detailAttribute 내 certificationTargetExcludeContent 객체를 생성하는 함수

/**
 * @function createCertificationTargetExcludeContent
 * @description 인증 대상 제외 여부 정보
 *
 * @param {Object} data - 인증 대상 제외 여부 정보
 * @param {boolean} data.childCertifiedProductExclusionYn - 어린이 인증 제품 제외 여부(어린이제품 인증 대상 카테고리 상품인 경우 필수. 미입력 시 false로 저장됩니다)
 * @param {'SAFE_CRITERION' | 'OVERSEAS' | 'PARALLEL_IMPORT'} data.kcExemptionType -
 *      - SAFE_CRITERION(안전기준준수대상(안전기준준수대상 예외 카테고리가 아닌 경우에도 설정 가능, 식품 카테고리 외)),
 *      - OVERSEAS(구매대행),
 *      - PARALLEL_IMPORT(병행수입)
 * @param {'TRUE' | 'FALSE' | 'KC_EXEMPTION_OBJECT'} data.kcCertifiedProductExclusionYn - 구매대행 제품 제외 여부
 *      - TRUE(KC 인증 대상 아님)
 *      - FALSE(KC 인증 대상)
 *      - KC_EXEMPTION_OBJECT(안전기준준수, 구매대행, 병행수입인 경우 필수 입력)
 * @param {boolean} data.greenCertifiedProductExclusionYn - 친환경 인증 대상 제외 여부('친환경 인증 대상' 카테고리 상품인 경우 필수, 미입력 시 false로 저장됩니다.)
 *
 * @returns {Object} certificationTargetExcludeContent
 */
export function createCertificationTargetExcludeContent(data = {}) {
    const {
        childCertifiedProductExclusionYn,
        kcExemptionType,
        kcCertifiedProductExclusionYn,
        greenCertifiedProductExclusionYn,
    } = data;
    return {
        childCertifiedProductExclusionYn,
        kcExemptionType,
        kcCertifiedProductExclusionYn,
        greenCertifiedProductExclusionYn,
    };
}
