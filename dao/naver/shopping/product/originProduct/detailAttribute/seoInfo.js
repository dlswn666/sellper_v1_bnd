// seoInfo.js

/**
 * SEO(Search engine optimization) 정보
 * @param {Object} data - SEO 정보를 담은 객체
 *
 * @param {string} data.pageTitle - 페이지 타이틀 (선택, 문자열)
 *   - 페이지의 제목입니다.
 *   - 최대 100자까지 입력 가능합니다.
 *
 * @param {string} data.metaDescription - 메타 정보 (선택, 문자열)
 *   - 검색 엔진 최적화를 위한 메타 설명입니다.
 *   - 최대 160자까지 입력 가능합니다.
 *
 * @param {Object} data.sellerTags - 판매자 입력 태그 목록 (선택)
 *   - 판매자가 입력한 태그 정보를 담는 배열입니다.
 *   - 배열 전체는 최대 4000자, 각 항목은 최대 4000자까지 입력 가능합니다.
 *
 * @param {number} data.sellerTags.code - 태그 ID (선택, 정수형 <int64>)
 *   - 시스템에 정의된 태그의 고유 ID입니다.
 *   - 직접 입력한 태그의 경우 ID는 존재하지 않습니다.
 *
 * @param {string} data.sellerTags.text - 태그명 (필수, 문자열)
 *   - 태그의 이름 또는 설명입니다.
 */

/**
 * SEO 정보 생성
 * @param {Object} data - SEO 정보를 담은 객체
 * @returns {Object} seoInfo - 생성된 상품 SEO 정보
 */

export function createSeoInfo(data) {
    const { pageTitle, metaDescription, sellerTags } = data;

    return {
        pageTitle,
        metaDescription,
        sellerTags: sellerTags?.map((tag) => ({ text: tag.text, code: tag.code })),
    };
}
