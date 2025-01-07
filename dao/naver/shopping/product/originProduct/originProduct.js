// productBaseInfo.js
// createProduct.product API 호출 시 필요한 originProduct 내 기본 상품 정보 영역을 만드는 함수 예제
// 실제 필수 항목, ENUM 값, 필드명, 구조는 DOC에서 확인 후 수정 필요
// DOC: https://apicenter.commerce.naver.com/ko/basic/commerce-api#tag/%EC%83%81%ED%92%88/operation/createProduct.product

import { createImages } from './images.js';
import { createDetailAttribute } from './detailAttribute/detailAttribute.js';
import { createCustomerBenefit } from './customerBenefit/customerBenefit.js';
import { createDeliveryInfo } from './deliveryInfo/deliveryInfo.js';

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
 * @param {('WAIT'|'SALE'|'SUSPENSION'|'CLOSE'|'PROHIBITION'|'OUTOFSTOCK'|'UNADMISSION'|'REJECTION'|'DELETE')} data.statusType - 상품 판매 상태 코드
 *   - 상품의 현재 상태를 나타냅니다.
 *   - 허용 값:
 *     - 'WAIT': 판매 대기
 *     - 'SALE': 판매 중 (상품 등록 시에는 필수)
 *     - 'OUTOFSTOCK': 품절 (StockQuantity가 0인 경우)
 *     - 'UNADMISSION': 승인 대기
 *     - 'REJECTION': 승인 거부
 *     - 'SUSPENSION': 판매 중지
 *     - 'CLOSE': 판매 종료
 *     - 'PROHIBITION': 판매 금지
 *     - 'DELETE': 삭제
 *   - **제약 조건**:
 *     - 상품 등록 시: `SALE`만 입력 가능.
 *     - 상품 수정 시: `SALE` 또는 `SUSPENSION`만 입력 가능.
 *     - 품절 상태의 상품을 판매 중으로 변경하려면, `statusType`을 `SALE`로 설정하고 `StockQuantity` 값을 함께 입력해야 함.
 * @param {('NEW'|'OLD')} data.saleType - 상품 판매유형(필수)
 *   - 'NEW': 새상품
 *   - 'OLD': 중고상품
 *   - 미입력 시 'NEW'로 설정됩니다.
 * @param {string} data.leafCategoryId - 리프 카테고리 ID(필수)
 *   - 상품 등록 시 필수입니다. 상품 수정 시 카탈로그 ID(modelId)를 입력한 경우 필수입니다. 표준형 옵션 카테고리 상품 수정 요청의 경우 CategoryId 변경 요청은 무시됩니다(렌탈 상품은 정상 처리됨).
 * @param {string} data.name - 상품명(필수)
 * @param {string} data.detailContent - 상품 상세 정보 (HTML 또는 텍스트)(필수)
 * @param {string} data.saleStartDate - 판매 시작일시 (매 시각 00분으로만 설정 가능합니다. 'yyyy-MM-dd'T'HH:mm[:ss][.SSS]XXX' 형식으로 입력합니다.)
 * @param {string} data.saleEndDate - 판매 종료일 (매 시각 59분으로만 설정 가능합니다. 'yyyy-MM-dd'T'HH:mm[:ss][.SSS]XXX' 형식으로 입력합니다.)
 * @param {number} data.salePrice - 판매 가격(필수)
 * @param {number} data.stockQuantity - 재고 수량(상품 등록 시 필수. 상품 수정 시 재고 수량을 입력하지 않으면 스마트스토어 데이터베이스에 저장된 현재 재고 값이 변하지 않습니다. 수정 시 재고 수량이 0으로 입력되면 StatusType으로 전달된 항목은 무시되며 상품 상태는 OUTOFSTOCK(품절)으로 저장됩니다.)
 *
 * @param {Array} data.productLogistics - 문류사 정보(풀필먼트 이용 상품은 입력 필수.)
 * @param {string} data.productLogistics[].logisticsCompanyId - 문류사 ID(네이버 풀필먼트 서비스를 이용 중인 경우 입력할 수 있으며, (판매자 풀필먼트)물류사 연동 정보 조회 API로 확인한 물류사 ID를 입력합니다.)
 *
 */
export function createBaseInfo(data) {
    const images = createImages(data.images);
    const detailAttributes = createDetailAttribute(data.detailAttributes);
    const customerBenefit = createCustomerBenefit(data.customerBenefit);
    const deliveryInfo = createDeliveryInfo(data.deliveryInfo);

    return {
        statusType: data.statusType, // 상품 노출 상태(필수, ENUM: WAIT/FOR_SALE/STOP_SALE)
        saleType: data.saleType, // 상품 판매유형(필수, ENUM: NEW/USED)
        leafCategoryId: data.leafCategoryId, // 최종 카테고리 ID(필수)
        name: data.name, // 상품명(필수)
        detailContent: data.detailContent, // 상품 상세 정보(필수)
        images, // 이미지 정보(필수), {representativeImage: {url:...}, optionalImages: [...]}
        saleStartDate: data.saleStartDate, // 판매 시작일
        saleEndDate: data.saleEndDate, // 판매 종료일
        salePrice: data.salePrice, // 판매 가격(필수)
        stockQuantity: data.stockQuantity, // 재고 수량(필수)
        deliveryInfo, // 배송 정보(필수)
        productLogistics: data.productLogistics?.map((logistics) => ({
            logisticsCompanyId: logistics.logisticsCompanyId,
        })), // 물류사 정보(필수)
        detailAttributes, // 상품 상세 속성 정보(필수)
        customerBenefit, // 고객 혜택 정보(필수)
    };
}
