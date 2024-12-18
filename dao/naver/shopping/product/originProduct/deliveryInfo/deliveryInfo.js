// deliveryInfo.js
// @description: originProduct 내 배송 관련 정보(deliveryInfo)를 구성하는 메인 함수
// @note: deliveryInfo는 여러 하위 객체(deliveryFee, claimDeliveryInfo)를 포함한다.
// 실제 필드명, 필수/선택, ENUM 값은 DOC를 참조해 정확히 반영해야 함.

import { createDeliveryFee } from './deliveryFee.js';
import { createClaimDeliveryInfo } from './claimDeliveryInfo.js';

/**
 * @function createDeliveryInfo
 * @description originProduct 내 deliveryInfo 객체를 구성한다.
 *
 * @param {Object} data - deliveryInfo 관련 데이터
 * @param {('DELIVERY'|'DIRECT')} data.deliveryType
 *      - 배송 유형(필수)
 *      - DELIVERY(택배, 소포, 등기)
 *      - DIRECT(직접배송(화물배달))
 *      - 네이버 풀필먼트 상품, 배송 속성 : SELLER_GUARANTEE(판매자 도착보장),
 *        배송 속성 HOPE_SELLER_GUARANTEE(판매자 희망일 도착보장)인 경우 배송 방법은
 *        DELIVERY(택배, 소포, 등기)만 허용됩니다.
 * @param {('NORMAL'|'TODAY'|'OPTION_TODAY'|'HOPE_TODAY'|'TODAY_ARRIVAL'|'DAWN_ARRIVAL'|'ARRIVAL_GUARANTEE'|'SELLER_GUARANTEE'|'HOPE_SELLER_GUARANTEE')} data.deliveryAttributeType
 *      - 배송 속성 타입(필수)
 *      - NORMAL : 일반 배송
 *      - TODAY : 오늘 출발
 *      - OPTION_TODAY : 옵션별 오늘출발
 *      - HOPE_TODAY  : 희방일배송
 *      - TODAY_ARRIVAL : 당일배송(장보기 관련 기능)
 *      - DAWN_ARRIVAL : 새벽배송(장보기 관련 기능)
 *      - ARRIVAL_GUARANTEE : 네이버 도착보장
 *      - SELLER_GUARANTEE : 판매자 도착보장
 *      - HOPE_SELLER_GUARANTEE : 판매자 희망일 도착보장
 * @param {string} data.deliveryCompany - 배송회사명(DELIVERY일 경우 필수, naver api 택배사 코드 참조)
 * @param {string} data.outboundLocationId - 판매자 창고 ID (SELLER_GUARANTEE, HOPE_SELLER_GUARANTEE일 경우 필수)
 * @param {boolean} data.deliveryBundleGroupUsable - 묶음배송가능여부 (기본 false)
 * @param {number} data.deliveryBundleGroupId - 묶음배송그룹ID(사용 안함)
 * @param {string[]} data.quickServiceAreas - 퀵서비스 가능지역 배열(사용 안함)
 * @param {number} data.visitAddressId - 방문수령 주소 ID(사용 안함)
 * @param {Object} data.deliveryFee - deliveryFee 관련 데이터(필수)
 * @param {Object} data.claimDeliveryInfo - claimDeliveryInfo 관련 데이터(필수)
 * @param {boolean} data.installation - 설치 여부(HOPE_SELLER_GUARANTEE일 경우 필수)
 * @param {boolean} data.installationFee - 설치비 여부(설치 여부 false이면 false로 설정됨)
 * @param {('ETC'|'...')} data.expectedDeliveryPeriodType - 주문 제작 상품 발송 예정일 타입 코드(사용 안함)
 * @param {string} data.expectedDeliveryPeriodDirectInput - 예상배송기간 직접입력값
 * @param {number} data.todayStockQuantity - 오늘 출발 상품 재고 수량()
 * @param {boolean} data.customProductAfterOrderYn - 주문 후 생산 여부()
 * @param {number} data.hopeDeliveryGroupId - 희망배송일 그룹 번호()
 * @param {boolean} data.businessCustomsClearanceSaleYn - 해외배송시 통관정보 등록 제품 여부(출고지 주소가 해외인 경우만 적용, 미입력시 false로 입력됨)
 *
 * @returns {Object} deliveryInfo
 */
export function createDeliveryInfo(data) {
    const deliveryFee = createDeliveryFee(data.deliveryFee);
    const claimDeliveryInfo = createClaimDeliveryInfo(data.claimDeliveryInfo);

    return {
        deliveryType: data.deliveryType,
        deliveryAttributeType: data.deliveryAttributeType,
        deliveryCompany: data.deliveryCompany,
        outboundLocationId: data.outboundLocationId,
        deliveryBundleGroupUsable: data.deliveryBundleGroupUsable,
        deliveryBundleGroupId: data.deliveryBundleGroupId,
        quickServiceAreas: data.quickServiceAreas,
        visitAddressId: data.visitAddressId,
        deliveryFee: deliveryFee,
        claimDeliveryInfo: claimDeliveryInfo,
        installation: data.installation,
        installationFee: data.installationFee,
        expectedDeliveryPeriodType: data.expectedDeliveryPeriodType,
        expectedDeliveryPeriodDirectInput: data.expectedDeliveryPeriodDirectInput,
        todayStockQuantity: data.todayStockQuantity,
        customProductAfterOrderYn: data.customProductAfterOrderYn,
        hopeDeliveryGroupId: data.hopeDeliveryGroupId,
        businessCustomsClearanceSaleYn: data.businessCustomsClearanceSaleYn,
    };
}
