// claimDeliveryInfo.js
// @description: deliveryInfo 내에 포함되는 claimDeliveryInfo 객체를 생성하는 함수
// 실제 필드명, 필수/선택, ENUM 값은 DOC를 참조해 정확히 반영해야 함.

/**
 * @function createClaimDeliveryInfo
 * @description return/exchange 관련 배송정보를 담고 있는 claimDeliveryInfo 객체를 구성한다.
 *
 * @param {Object} data - claimDeliveryInfo 관련 데이터
 * @param {('PRIMARY'|'SECONDARY_1'|'SECONDARY_2'|'SECONDARY_3'|'SECONDARY_4'|'SECONDARY_5'|'SECONDARY_6'|'SECONDARY_7'|'SECONDARY_8'|'SECONDARY_9')} data.returnDeliveryCompanyPriorityType - 반품배송사 우선순위 타입
 *   - PRIMARY
 *   - SECONDARY_1
 *   - SECONDARY_2
 *   - SECONDARY_3
 *   - SECONDARY_4
 *   - SECONDARY_5
 *   - SECONDARY_6
 *   - SECONDARY_7
 *   - SECONDARY_8
 *   - SECONDARY_9
 *   - 미입력 시 '기본 반품 택배사(PRIMARY)'로 설정됩니다.
 * @param {number} data.returnDeliveryFee - 반품 배송비(필수) integer(int 32)
 * @param {number} data.exchangeDeliveryFee - 교환 배송비(필수) integer(int 32)
 * @param {number} data.shippingAddressId
 *  - 출고지 주소록 번호(배송 속성이 ARRIVAL_GUARANTEE(네이버 도착보장)인 경우 null로 입력합니다.)
 *  - integer(int 64)
 * @param {number} data.returnAddressId - 반품/교환지 주소록 번호 integer
 * @param {boolean} data.freeReturnInsuranceYn - 반품안심케어 설정 boolean
 *
 * @returns {Object} claimDeliveryInfo
 */
export function createClaimDeliveryInfo(data) {
    return {
        returnDeliveryCompanyPriorityType: data.returnDeliveryCompanyPriorityType,
        returnDeliveryFee: data.returnDeliveryFee,
        exchangeDeliveryFee: data.exchangeDeliveryFee,
        shippingAddressId: data.shippingAddressId,
        returnAddressId: data.returnAddressId,
        freeReturnInsuranceYn: data.freeReturnInsuranceYn,
    };
}
