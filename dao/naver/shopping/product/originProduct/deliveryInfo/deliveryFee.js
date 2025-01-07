// deliveryFee.js
// @description: deliveryInfo 내에 포함되는 deliveryFee 객체를 생성하는 함수
// 실제 필드명, 필수/선택, ENUM 값은 DOC를 참조해 정확히 반영해야 함.

import { createDeliveryFeeByArea } from './deliveryFeeByArea.js';

/**
 * @typedef {Object} DeliveryFeeByArea
 * @property {('AREA_2'|'AREA_3')} deliveryAreaType - 지역 타입(예시), ENUM (필수 여부 DOC 참고)
 *   - 'AREA_2': 내륙/제주 및 도서산간 지역으로 구분(2권역)
 *   - 'AREA_3': 내륙/제주/제주 외 도서산간 지역으로 구분(3권역)
 * @property {number} area2extraFee - 지역2 추가 배송비(필수 여부 DOC 참고)
 * @property {number} area3extraFee - 지역3 추가 배송비(필수 여부 DOC 참고)
 */

/**
 * @function createDeliveryFee
 * @description deliveryInfo 내 deliveryFee 객체를 구성한다.
 *
 * @param {Object} data - deliveryFee 관련 데이터
 * @param {('FREE'|'CONDITIONAL_FREE'|'PAID'|'UNIT_QUANTITY_PAID'|'RANGE_QUANTITY_PAID')} data.deliveryFeeType - 배송비 타입(필수)
 *   - 'FREE': 무료배송
 *   - 'CONDITIONAL_FREE': 조건부무료배송
 *   - 'PAID': 유료배송
 *   - 'UNIT_QUANTITY_PAID': 수량별
 *   - 'RANGE_QUANTITY_PAID': 구간별
 *   - Enum
 * @param {number} data.baseFee - 기본 배송비(필수 여부 DOC 참고) integer(int32)
 * @param {number} data.freeConditionalAmount - 조건부 무료배송 금액(배송비 유형이 '조건부 무료'일 경우 입력합니다.) integer(int32)
 * @param {number} data.repeatQuantity - 반복 수량(반복 수량. 배송비 유형이 '수량별 부과 - 반복 구간'일 경우 입력합니다.) integer(int32)
 * @param {number} data.secondBaseQuantity - 2차 기준 수량(2구간 최소 수량. 배송비 유형이 '수량별 부과 - 구간 직접 설정'일 경우 입력합니다.) integer(int32)
 * @param {number} data.secondExtraFee - 2차 추가 배송비(2구간 추가 배송비. 배송비 유형이 '수량별 부과 - 구간 직접 설정'일 경우 입력합니다.) integer(int32)
 * @param {number} data.thirdBaseQuantity - 3차 기준 수량(3구간 최소 수량. 배송비 유형이 '수량별 부과 - 구간 직접 설정'일 경우 입력합니다.) integer(int32)
 * @param {number} data.thirdExtraFee - 3차 추가 배송비(3구간 추가 배송비. 배송비 유형이 '수량별 부과 - 구간 직접 설정'일 경우 입력합니다.) integer(int32)
 * @param {('COLLECT'|'PREPAID'|'COLLECT_OR_PREPAID')} data.deliveryFeePayType - 배송비 지불 방식(필수) Enum
 *   - 'COLLECT': 착불
 *   - 'PREPAID': 선불
 *   - 'COLLECT_OR_PREPAID': 착불 또는 선결제
 * @param {DeliveryFeeByArea} data.deliveryFeeByArea - 지역별 추가 배송비 정보(지역별 추가 배송비)
 * @param {string} data.differentialFeeByArea - 지역별 차등 배송비 정책(지역별 차등 배송비 정보 ) String
 *
 * @returns {Object} deliveryFee
 */
export function createDeliveryFee(data) {
    const deliveryFeeByArea = data.deliveryFeeByArea ? createDeliveryFeeByArea(data.deliveryFeeByArea) : undefined;

    return {
        deliveryFeeType: data.deliveryFeeType,
        baseFee: data.baseFee,
        freeConditionalAmount: data.freeConditionalAmount,
        repeatQuantity: data.repeatQuantity,
        secondBaseQuantity: data.secondBaseQuantity,
        secondExtraFee: data.secondExtraFee,
        thirdBaseQuantity: data.thirdBaseQuantity,
        thirdExtraFee: data.thirdExtraFee,
        deliveryFeePayType: data.deliveryFeePayType,
        deliveryFeeByArea: deliveryFeeByArea,
        differentialFeeByArea: data.differentialFeeByArea,
    };
}
