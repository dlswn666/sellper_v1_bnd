// productCertificationInfos.js
// @description: detailAttribute 내 productCertificationInfos 객체를 생성하는 함수

/**
 * @function createProductCertificationInfos
 *
 * @param {Object} data - 인증정보
 *
 * @param {number} data.certificationInfoId - 인증 유형 ID
 * @param {'KC_CERTIFICATION' | 'CHILD_CERTIFICATION' | 'GREEN_PRODUCTS' | 'OVERSEAS' | 'PARALLEL_IMPORT' | 'ETC'} data.certificationKindType - 인증 정보 종류 코드
 *      - KC_CERTIFICATION(KC 인증)
 *      - CHILD_CERTIFICATION(어린이제품 인증)
 *      - GREEN_PRODUCTS(친환경 인증)
 *      - OVERSEAS(구매대행(구매대행 선택 시 인증 정보 필수 등록))
 *      - PARALLEL_IMPORT(병행수입(병행수입 선택 시 인증 정보 필수 등록))
 *      - ETC(기타 인증)
 * @param {string} data.name - 인증 기관명 (어린이제품/생활용품/전기용품 공급자적합성 유형인 경우 비필수)
 * @param {string} data.certificationNumber - 인증 번호 (어린이제품/생활용품/전기용품 공급자적합성 유형인 경우 비필수)
 * @param {string} data.certificationMark - 인증 마크 여부 (미입력 시 false로 저장됩니다.)
 * @param {string} data.companyName - 인증 상호명 (인증 유형이 방송통신기자재 적합인증/적합등록/잠정인증, 어린이제품 안전인증/안전확인인 경우 필수)
 * @param {string} data.certificationDate - 인증 일자 (yyyy-MM-dd 형식)
 *
 * @returns {Object} productCertificationInfos
 */
export function createProductCertificationInfos(data = {}) {
    const {
        certificationInfoId,
        certificationKindType,
        name,
        certificationNumber,
        certificationMark,
        companyName,
        certificationDate,
    } = data;

    return {
        certificationInfoId,
        certificationKindType,
        name,
        certificationNumber,
        certificationMark,
        companyName,
        certificationDate,
    };
}
