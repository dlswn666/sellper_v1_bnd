// deliveryFeeByArea.js
// @description: 지역별 추가 배송비 정보를 담는 deliveryFeeByArea 객체를 생성하는 함수
// 실제 필드명, 필수/선택, ENUM 값은 DOC를 참조해서 정확히 반영해야 함.
// 묶음배송 그룹 등록 시 지역별 추가 배송비 권역을 입력하기 위한 코드입니다.
// 묶음배송 가능 여부가 true인 경우 묶음배송 그룹에 설정된 값이 적용됩니다(배송 속성이 ARRIVAL_GUARANTEE인 경우 제외).

/**
 * @function createDeliveryFeeByArea
 * @description 지역별 차등 배송비 정보를 담은 deliveryFeeByArea 객체를 생성한다.
 *
 * @param {Object} data - deliveryFeeByArea 관련 데이터
 * @param {('AREA_2'|'AREA_3')} data.deliveryAreaType - 지역 타입(필수 여부 DOC 참고)
 *   - AREA_2(내륙/제주 및 도서산간 지역으로 구분(2권역))
 *   - AREA_3(내륙/제주/제주 외 도서산간 지역으로 구분(3권역))
 * @param {number} data.area2extraFee - 2지역 추가 배송비(필요 시 필수 여부 DOC 참고)
 * @param {number} data.area3extraFee - 3지역 추가 배송비(필요 시 필수 여부 DOC 참고)
 *
 * @returns {Object} deliveryFeeByArea
 * @returns {string} deliveryFeeByArea.deliveryAreaType - 지역 타입 enum
 * @returns {number} deliveryFeeByArea.area2extraFee - 2지역 추가 배송비 integer(int32)
 * @returns {number} deliveryFeeByArea.area3extraFee - 3지역 추가 배송비 integer(int32)
 */
export function createDeliveryFeeByArea(data) {
    return {
        deliveryAreaType: data.deliveryAreaType,
        area2extraFee: data.area2extraFee,
        area3extraFee: data.area3extraFee,
    };
}
