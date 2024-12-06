// productBaseInfo.js
// createProduct.product API 호출 시 필요한 originProduct 내 기본 상품 정보 영역을 만드는 함수 예제
// 실제 필수 항목, ENUM 값, 필드명, 구조는 DOC에서 확인 후 수정 필요
// DOC: https://apicenter.commerce.naver.com/ko/basic/commerce-api#tag/%EC%83%81%ED%92%88/operation/createProduct.product

/**
 * @typedef {Object} RepresentativeImage
 * @property {string} url - 대표 이미지 URL (필수)
 */

/**
 * @typedef {Object} Images
 * @property {RepresentativeImage} representativeImage - 대표 이미지 객체 (필수)
 * @property {Array<{url:string}>} [optionalImages] - 추가 이미지 배열 (선택)
 */

/**
 * @function createBaseInfo
 * @description createProduct.product API 요청 시 사용될 originProduct 객체의 기본 상품 정보를 생성한다.
 *
 * @param {Object} data - 기본 상품 정보 데이터
 * @param {('WAIT'|'SALE'|'SUSPENSION'|'CLOSE'|'PROHIBITION'|'OUTOFSTOCK'|'UNADMISSION'|'REJECTION')} data.statusType - 상품 노출 상태(필수)
 *   - 'WAIT': 대기
 *   - 'SALE': 판매중
 *   - 'SUSPENSION': 판매중지
 *   - 'CLOSE': 판매종료
 *   - 'PROHIBITION': 판매금지
 *   - 'OUTOFSTOCK': 품절
 *   - 'UNADMISSION': 승인대기
 *   - 'REJECTION': 승인거부
 * @param {('NEW'|'OLD')} data.saleType - 상품 판매유형(필수)
 *   - 'NEW': 새상품
 *   - 'OLD': 중고상품
 * @param {string} data.leafCategoryId - 최종 카테고리 ID(필수)
 * @param {string} data.name - 상품명(필수)
 * @param {string} data.detailContent - 상품 상세 정보 (HTML 또는 텍스트)(필수)
 * @param {Images} data.images - 상품 이미지 정보(필수)
 * @param {string} data.saleStartDate - 판매 시작일 (ISO 8601 포맷, 예: '2024-12-06T03:10:26Z')(필수)
 * @param {string} data.saleEndDate - 판매 종료일 (ISO 8601 포맷)(필수)
 * @param {number} data.salePrice - 판매 가격(필수)
 * @param {number} data.stockQuantity - 재고 수량(필수)
 *
 * @returns {Object} productBaseInfo - 생성된 기본 상품 정보 객체
 * @returns {string} productBaseInfo.statusType - 상품 노출 상태
 * @returns {string} productBaseInfo.saleType - 상품 판매 유형
 * @returns {string} productBaseInfo.leafCategoryId - 최종 카테고리 ID
 * @returns {string} productBaseInfo.name - 상품명
 * @returns {string} productBaseInfo.detailContent - 상품 상세 정보
 * @returns {Images} productBaseInfo.images - 이미지 정보
 * @returns {string} productBaseInfo.saleStartDate - 판매 시작일
 * @returns {string} productBaseInfo.saleEndDate - 판매 종료일
 * @returns {number} productBaseInfo.salePrice - 판매 가격
 * @returns {number} productBaseInfo.stockQuantity - 재고 수량
 */
export function createBaseInfo(data) {
    return {
        statusType: data.statusType, // 상품 노출 상태(필수, ENUM: WAIT/FOR_SALE/STOP_SALE)
        saleType: data.saleType, // 상품 판매유형(필수, ENUM: NEW/USED)
        leafCategoryId: data.leafCategoryId, // 최종 카테고리 ID(필수)
        name: data.name, // 상품명(필수)
        detailContent: data.detailContent, // 상품 상세 정보(필수)
        images: data.images, // 이미지 정보(필수), {representativeImage: {url:...}, optionalImages: [...]}
        saleStartDate: data.saleStartDate, // 판매 시작일(필수)
        saleEndDate: data.saleEndDate, // 판매 종료일(필수)
        salePrice: data.salePrice, // 판매 가격(필수)
        stockQuantity: data.stockQuantity, // 재고 수량(필수)
    };
}
